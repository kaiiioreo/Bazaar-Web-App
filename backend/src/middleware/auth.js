import jwt from 'jsonwebtoken'
import { prisma } from '../lib/prisma.js'
import { HttpError } from '../lib/http.js'

// Short-lived tokens double as the SRS 3.5.1 "log out after inactivity" rule.
const TOKEN_TTL = '2h'

export function signToken(user) {
  return jwt.sign({ sub: user.user_id, role: user.role }, process.env.JWT_SECRET, { expiresIn: TOKEN_TTL })
}

async function loadUser(req) {
  const header = req.headers.authorization || ''
  const token = header.startsWith('Bearer ') ? header.slice(7) : null
  if (!token) return null
  let payload
  try {
    payload = jwt.verify(token, process.env.JWT_SECRET)
  } catch {
    throw new HttpError(401, 'Your session has expired. Please log in again.')
  }
  const user = await prisma.user.findUnique({ where: { user_id: Number(payload.sub) } })
  if (!user) throw new HttpError(401, 'Account not found')
  if (user.status !== 'active') throw new HttpError(403, `This account is ${user.status}.`)
  return user
}

// Sets req.user if a valid token is sent, but lets guests through.
export async function optionalAuth(req, _res, next) {
  req.user = await loadUser(req)
  next()
}

export async function requireAuth(req, _res, next) {
  req.user = await loadUser(req)
  if (!req.user) throw new HttpError(401, 'Please log in first.')
  next()
}

// Usage: router.get('/x', requireAuth, requireRole('admin'), handler)
export function requireRole(...roles) {
  return (req, _res, next) => {
    if (!roles.includes(req.user?.role)) throw new HttpError(403, 'You do not have access to this.')
    next()
  }
}

// Vendor routes that need an approved vendor profile.
export async function requireApprovedVendor(req, _res, next) {
  const profile = await prisma.vendorProfile.findUnique({ where: { vendor_id: req.user.user_id } })
  if (!profile) throw new HttpError(403, 'Your vendor application has not been approved yet.')
  req.vendor = profile
  next()
}
