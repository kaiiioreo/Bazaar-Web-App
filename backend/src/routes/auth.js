import { Router } from 'express'
import bcrypt from 'bcryptjs'
import crypto from 'node:crypto'
import { prisma } from '../lib/prisma.js'
import { HttpError, requireFields } from '../lib/http.js'
import * as out from '../lib/serialize.js'
import { requireAuth, signToken } from '../middleware/auth.js'
import { emailEnabled, sendPasswordResetEmail } from '../services/email.js'

const router = Router()

// SRS 3.5.3: minimum password strength.
export function checkPassword(password) {
  if (typeof password !== 'string' || password.length < 8 || !/[A-Za-z]/.test(password) || !/\d/.test(password)) {
    throw new HttpError(400, 'Password must be at least 8 characters and include a letter and a number.')
  }
}

const normalizeEmail = (email) => String(email).trim().toLowerCase()
const hashToken = (token) => crypto.createHash('sha256').update(token).digest('hex')

// Extra info the frontend needs after login (vendor approval state).
async function session(user) {
  const data = { user: out.user(user) }
  if (user.role === 'vendor') {
    const [profile, application] = await Promise.all([
      prisma.vendorProfile.findUnique({ where: { vendor_id: user.user_id } }),
      prisma.vendorApplication.findFirst({ where: { user_id: user.user_id }, orderBy: { submitted_at: 'desc' } }),
    ])
    data.user.vendor_approved = Boolean(profile)
    data.user.application_status = application?.status ?? null
    data.user.business_name = profile?.business_name ?? application?.business_name ?? null
  }
  return data
}

// Creates a reset token and sends the link. Returns the link so it can be shown in dev.
export async function issueResetLink(user) {
  const token = crypto.randomBytes(32).toString('hex')
  await prisma.user.update({
    where: { user_id: user.user_id },
    data: { reset_token_hash: hashToken(token), reset_expires: new Date(Date.now() + 60 * 60 * 1000) },
  })
  const link = `${process.env.CLIENT_URL || 'http://localhost:5173'}/reset-password?token=${token}`
  await sendPasswordResetEmail(user, link)
  return link
}

// RegisterUser()
router.post('/register', async (req, res) => {
  requireFields(req.body, ['name', 'email', 'password', 'role'])
  const { name, password, role } = req.body
  const email = normalizeEmail(req.body.email)
  if (!['customer', 'vendor'].includes(role)) throw new HttpError(400, 'Role must be customer or vendor.')
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new HttpError(400, 'Enter a valid email address.')
  checkPassword(password)

  const exists = await prisma.user.findUnique({ where: { email } })
  if (exists) throw new HttpError(409, 'This email is already registered.')

  const user = await prisma.user.create({
    data: { name: String(name).trim(), email, role, password_hash: await bcrypt.hash(password, 10) },
  })
  res.status(201).json({ token: signToken(user), ...(await session(user)) })
})

// LoginUser()
router.post('/login', async (req, res) => {
  requireFields(req.body, ['email', 'password'])
  const user = await prisma.user.findUnique({ where: { email: normalizeEmail(req.body.email) } })
  if (!user || !(await bcrypt.compare(req.body.password, user.password_hash))) {
    throw new HttpError(401, 'Incorrect email or password.')
  }
  if (user.status !== 'active')
    throw new HttpError(403, `This account is ${user.status}. Please contact the Bazaar team.`)
  res.json({ token: signToken(user), ...(await session(user)) })
})

router.get('/me', requireAuth, async (req, res) => {
  res.json(await session(req.user))
})

// Customer/vendor account settings (SRS 3.1.3.3): name, email, password.
router.patch('/me', requireAuth, async (req, res) => {
  const data = {}
  if (req.body.name !== undefined) {
    if (!String(req.body.name).trim()) throw new HttpError(400, 'Name cannot be empty.')
    data.name = String(req.body.name).trim()
  }
  if (req.body.email !== undefined) {
    const email = normalizeEmail(req.body.email)
    const taken = await prisma.user.findFirst({ where: { email, NOT: { user_id: req.user.user_id } } })
    if (taken) throw new HttpError(409, 'This email is already registered.')
    data.email = email
  }
  if (req.body.new_password) {
    if (!(await bcrypt.compare(req.body.current_password || '', req.user.password_hash))) {
      throw new HttpError(400, 'Current password is incorrect.')
    }
    checkPassword(req.body.new_password)
    data.password_hash = await bcrypt.hash(req.body.new_password, 10)
  }
  const user = await prisma.user.update({ where: { user_id: req.user.user_id }, data })
  res.json(await session(user))
})

// RecoverPassword(): always answers the same way so emails can't be guessed.
router.post('/forgot-password', async (req, res) => {
  requireFields(req.body, ['email'])
  const user = await prisma.user.findUnique({ where: { email: normalizeEmail(req.body.email) } })
  let link = null
  if (user && user.status === 'active') link = await issueResetLink(user)
  const body = { message: 'If that email is registered, a reset link has been sent.' }
  // Without email configured, return the link in development so the flow can be demoed.
  if (link && !emailEnabled() && process.env.NODE_ENV !== 'production') body.dev_reset_link = link
  res.json(body)
})

// ResetPassword()
router.post('/reset-password', async (req, res) => {
  requireFields(req.body, ['token', 'password'])
  checkPassword(req.body.password)
  const user = await prisma.user.findFirst({ where: { reset_token_hash: hashToken(String(req.body.token)) } })
  if (!user || !user.reset_expires || user.reset_expires < new Date()) {
    throw new HttpError(400, 'This reset link is invalid or has expired.')
  }
  await prisma.user.update({
    where: { user_id: user.user_id },
    data: { password_hash: await bcrypt.hash(req.body.password, 10), reset_token_hash: null, reset_expires: null },
  })
  res.json({ message: 'Password updated. You can now log in.' })
})

export default router
