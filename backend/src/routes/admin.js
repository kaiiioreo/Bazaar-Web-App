// Admin Dashboard (SRS 3.1.2): applications, vendors, users, events, slots, reviews, reports.
import { Router } from 'express'
import { prisma } from '../lib/prisma.js'
import { HttpError, toId, todayUTC, parseDate, requireFields } from '../lib/http.js'
import { CATEGORIES } from '../lib/constants.js'
import * as out from '../lib/serialize.js'
import { requireAuth, requireRole } from '../middleware/auth.js'
import { emailEnabled } from '../services/email.js'
import { summarizeReviews } from '../services/ai.js'
import { notify, notifyMany, customersFavoritingVendor } from '../services/notify.js'
import { refreshVendorSummaryLater } from '../services/reviews.js'
import { issueResetLink } from './auth.js'

const router = Router()
router.use(requireAuth, requireRole('admin'))

/* ---------- Reports & analytics (ViewReportsAndAnalytics) ---------- */

let sentimentCache = { at: 0, text: '' }

router.get('/stats', async (_req, res) => {
  const [activeVendors, pendingApplications, totalCustomers, upcomingEvents, flaggedReviews, avg] = await Promise.all([
    prisma.vendorProfile.count({ where: { user: { status: 'active' } } }),
    prisma.vendorApplication.count({ where: { status: 'pending' } }),
    prisma.user.count({ where: { role: 'customer' } }),
    prisma.bazaarEvent.count({ where: { status: 'upcoming', date: { gte: todayUTC() } } }),
    prisma.review.count({ where: { status: 'visible', ai_flag: true } }),
    prisma.review.aggregate({ where: { status: 'visible' }, _avg: { rating: true }, _count: true }),
  ])

  // Overall review sentiment, refreshed at most every 10 minutes.
  if (Date.now() - sentimentCache.at > 10 * 60 * 1000) {
    const recent = await prisma.review.findMany({
      where: { status: 'visible' },
      orderBy: { created_at: 'desc' },
      take: 40,
    })
    sentimentCache = { at: Date.now(), text: await summarizeReviews(recent, 'the bazaar vendors overall') }
  }

  res.json({
    activeVendors,
    pendingApplications,
    totalCustomers,
    upcomingEvents,
    flaggedReviews,
    averageRating: avg._avg.rating ? Math.round(avg._avg.rating * 10) / 10 : 0,
    totalReviews: avg._count,
    sentimentSummary: sentimentCache.text || 'No reviews yet.',
  })
})

/* ---------- Vendor applications ---------- */

router.get('/applications', async (req, res) => {
  const where = ['pending', 'approved', 'rejected'].includes(req.query.status) ? { status: req.query.status } : {}
  const apps = await prisma.vendorApplication.findMany({
    where,
    include: { user: true },
    orderBy: { submitted_at: 'desc' },
  })
  res.json(apps.map(out.application))
})

async function pendingApplication(id) {
  const app = await prisma.vendorApplication.findUnique({ where: { application_id: toId(id) } })
  if (!app) throw new HttpError(404, 'Application not found')
  if (app.status !== 'pending') throw new HttpError(409, `This application was already ${app.status}.`)
  return app
}

// ApproveVendorApplication(): approves and creates the VendorProfile.
router.post('/applications/:id/approve', async (req, res) => {
  const app = await pendingApplication(req.params.id)
  const [updated] = await prisma.$transaction([
    prisma.vendorApplication.update({
      where: { application_id: app.application_id },
      data: { status: 'approved', reviewed_at: new Date(), rejection_reason: null },
      include: { user: true },
    }),
    prisma.vendorProfile.upsert({
      where: { vendor_id: app.user_id },
      create: {
        vendor_id: app.user_id,
        business_name: app.business_name,
        category: app.product_category,
        description: app.business_details,
      },
      update: { business_name: app.business_name, category: app.product_category },
    }),
  ])
  await notify(
    app.user_id,
    'application_status',
    `Your application for ${app.business_name} was approved. Welcome to Bazaar!`,
    '/vendor',
  )
  res.json(out.application(updated))
})

// RejectVendorApplication()
router.post('/applications/:id/reject', async (req, res) => {
  const app = await pendingApplication(req.params.id)
  const reason = String(req.body?.reason ?? '').trim()
  const updated = await prisma.vendorApplication.update({
    where: { application_id: app.application_id },
    data: { status: 'rejected', reviewed_at: new Date(), rejection_reason: reason || null },
    include: { user: true },
  })
  await notify(
    app.user_id,
    'application_status',
    `Your application for ${app.business_name} was not approved.${reason ? ` Reason: ${reason}` : ''} You can update it and apply again.`,
    '/vendor',
  )
  res.json(out.application(updated))
})

/* ---------- Vendor management (ViewVendor / EditVendor / SuspendVendor) ---------- */

const vendorDetailInclude = {
  user: true,
  products: { orderBy: { name: 'asc' } },
  reviews: { where: { status: 'visible' }, select: { rating: true, status: true } },
  schedules: { include: { event: true, slot: true }, orderBy: { event: { date: 'asc' } } },
}

function adminVendor(v) {
  return {
    ...out.vendor(v),
    owner_name: v.user.name,
    email: v.user.email,
    status: v.user.status,
    products: v.products.map(out.product),
    schedule: v.schedules.map((s) => ({
      event_id: s.event_id,
      event: s.event.name,
      date: out.dateOnly(s.event.date),
      slot: s.slot?.label ?? null,
      status: s.status,
    })),
  }
}

router.get('/vendors', async (_req, res) => {
  const vendors = await prisma.vendorProfile.findMany({
    include: vendorDetailInclude,
    orderBy: { business_name: 'asc' },
  })
  res.json(vendors.map(adminVendor))
})

router.patch('/vendors/:id', async (req, res) => {
  const vendor_id = toId(req.params.id)
  const b = req.body || {}
  const data = {}
  if (b.business_name !== undefined) data.business_name = String(b.business_name).trim()
  if (b.description !== undefined) data.description = String(b.description).trim()
  if (b.category !== undefined) data.category = CATEGORIES.includes(b.category) ? b.category : 'Other'
  const v = await prisma.vendorProfile.update({ where: { vendor_id }, data, include: vendorDetailInclude })
  res.json(adminVendor(v))
})

/* ---------- User management (ManageUserAccount) ---------- */

router.get('/users', async (req, res) => {
  const where = ['admin', 'vendor', 'customer'].includes(req.query.role) ? { role: req.query.role } : {}
  const users = await prisma.user.findMany({ where, orderBy: { created_at: 'asc' } })
  res.json(users.map(out.user))
})

// PATCH /api/admin/users/:id/status { status: 'active' | 'suspended' | 'deactivated' }
router.patch('/users/:id/status', async (req, res) => {
  const user_id = toId(req.params.id)
  const { status } = req.body || {}
  if (!['active', 'suspended', 'deactivated'].includes(status)) throw new HttpError(400, 'Invalid status')
  if (user_id === req.user.user_id) throw new HttpError(400, 'You cannot change your own account status.')
  const target = await prisma.user.findUnique({ where: { user_id } })
  if (!target) throw new HttpError(404, 'User not found')
  if (target.role === 'admin') throw new HttpError(400, 'Admin accounts cannot be suspended here.')
  const user = await prisma.user.update({ where: { user_id }, data: { status } })
  res.json(out.user(user))
})

// Admin-triggered password reset: emails the user a reset link.
router.post('/users/:id/reset-password', async (req, res) => {
  const user = await prisma.user.findUnique({ where: { user_id: toId(req.params.id) } })
  if (!user) throw new HttpError(404, 'User not found')
  const link = await issueResetLink(user)
  const body = { message: `A password reset link was sent to ${user.email}.` }
  if (!emailEnabled() && process.env.NODE_ENV !== 'production') body.dev_reset_link = link
  res.json(body)
})

/* ---------- Bazaar events (CreateBazaarEvent / EditBazaarEvent / CancelBazaarEvent) ---------- */

// A-01 ... A-05, B-01 ... (five stalls per row), same as the Slots page.
export function slotLabel(i) {
  return `${String.fromCharCode(65 + Math.floor(i / 5))}-${String((i % 5) + 1).padStart(2, '0')}`
}

const eventInclude = {
  schedules: {
    include: { vendor: { select: { business_name: true } }, slot: true },
    orderBy: { registered_at: 'asc' },
  },
}

function adminEvent(ev) {
  return {
    ...out.event(ev),
    preregistered: ev.schedules.map((s) => ({
      vendor_id: s.vendor_id,
      business_name: s.vendor.business_name,
      registered_at: out.dateOnly(s.registered_at),
      status: s.status,
      slot_label: s.slot?.label ?? null,
    })),
  }
}

router.get('/events', async (_req, res) => {
  const events = await prisma.bazaarEvent.findMany({ include: eventInclude, orderBy: { date: 'asc' } })
  res.json(events.map(adminEvent))
})

function readEvent(b) {
  requireFields(b, ['name', 'date', 'location', 'total_slots'])
  const total_slots = Number(b.total_slots)
  if (!Number.isInteger(total_slots) || total_slots < 1 || total_slots > 200) {
    throw new HttpError(400, 'Number of stalls must be a whole number from 1 to 200.')
  }
  return { name: String(b.name).trim(), date: parseDate(b.date), location: String(b.location).trim(), total_slots }
}

router.post('/events', async (req, res) => {
  const data = readEvent(req.body || {})
  if (data.date < todayUTC()) throw new HttpError(400, 'The event date must be today or later.')
  const ev = await prisma.bazaarEvent.create({
    data: {
      ...data,
      created_by: req.user.user_id,
      slots: { create: Array.from({ length: data.total_slots }, (_, i) => ({ label: slotLabel(i) })) },
    },
    include: eventInclude,
  })
  res.status(201).json(adminEvent(ev))
})

// Editing total_slots adds stalls at the end, or removes empty stalls from the end.
router.put('/events/:id', async (req, res) => {
  const event_id = toId(req.params.id)
  const data = readEvent(req.body || {})
  const current = await prisma.bazaarEvent.findUnique({
    where: { event_id },
    include: { slots: true },
  })
  if (!current) throw new HttpError(404, 'Event not found')

  const ops = []
  const labels = new Set(current.slots.map((s) => s.label))
  const wanted = new Set(Array.from({ length: data.total_slots }, (_, i) => slotLabel(i)))
  const toAdd = [...wanted].filter((l) => !labels.has(l))
  const toRemove = current.slots.filter((s) => !wanted.has(s.label))
  if (toRemove.some((s) => s.vendor_id)) {
    throw new HttpError(409, 'Some of the stalls you are removing have vendors assigned. Unassign them first.')
  }
  if (toAdd.length) ops.push(prisma.bazaarSlot.createMany({ data: toAdd.map((label) => ({ event_id, label })) }))
  if (toRemove.length)
    ops.push(prisma.bazaarSlot.deleteMany({ where: { slot_id: { in: toRemove.map((s) => s.slot_id) } } }))
  ops.push(prisma.bazaarEvent.update({ where: { event_id }, data }))
  await prisma.$transaction(ops)

  const ev = await prisma.bazaarEvent.findUnique({ where: { event_id }, include: eventInclude })
  res.json(adminEvent(ev))
})

// PATCH /api/admin/events/:id/registration { open: true|false }
router.patch('/events/:id/registration', async (req, res) => {
  const ev = await prisma.bazaarEvent.update({
    where: { event_id: toId(req.params.id) },
    data: { registration_open: Boolean(req.body?.open) },
    include: eventInclude,
  })
  res.json(adminEvent(ev))
})

router.post('/events/:id/cancel', async (req, res) => {
  const event_id = toId(req.params.id)
  const ev = await prisma.bazaarEvent.update({
    where: { event_id },
    data: { status: 'cancelled', registration_open: false },
    include: eventInclude,
  })
  const vendorIds = ev.schedules.map((s) => s.vendor_id)
  await notifyMany(
    vendorIds,
    'event_cancelled',
    `${ev.name} on ${out.dateOnly(ev.date)} has been cancelled.`,
    '/vendor',
  )
  const customers = (await Promise.all(vendorIds.map(customersFavoritingVendor))).flat()
  await notifyMany(
    customers,
    'event_cancelled',
    `${ev.name} on ${out.dateOnly(ev.date)} has been cancelled.`,
    '/customer/schedule',
  )
  res.json(adminEvent(ev))
})

/* ---------- Stall / slot assignment (AssignStallToVendor) ---------- */

// GET /api/admin/events/:id/slots -> stalls with their vendor + vendors waiting for a stall
router.get('/events/:id/slots', async (req, res) => {
  const event_id = toId(req.params.id)
  const ev = await prisma.bazaarEvent.findUnique({
    where: { event_id },
    include: {
      slots: { include: { vendor: { select: { vendor_id: true, business_name: true } } } },
      schedules: { include: { vendor: { select: { business_name: true } } }, orderBy: { registered_at: 'asc' } },
    },
  })
  if (!ev) throw new HttpError(404, 'Event not found')
  const labelIndex = (l) => (l.charCodeAt(0) - 65) * 5 + Number(l.slice(2)) - 1
  res.json({
    event: out.event(ev),
    slots: ev.slots
      .sort((a, b) => labelIndex(a.label) - labelIndex(b.label))
      .map((s) => ({
        slot_id: s.slot_id,
        label: s.label,
        status: s.status,
        vendor_id: s.vendor_id,
        business_name: s.vendor?.business_name ?? null,
      })),
    waiting: ev.schedules
      .filter((s) => s.status === 'pre_registered')
      .map((s) => ({
        vendor_id: s.vendor_id,
        business_name: s.vendor.business_name,
        registered_at: out.dateOnly(s.registered_at),
      })),
  })
})

// PUT /api/admin/slots/:id/assign { vendor_id }
router.put('/slots/:id/assign', async (req, res) => {
  const slot_id = toId(req.params.id)
  const vendor_id = toId(req.body?.vendor_id, 'vendor_id')
  const slot = await prisma.bazaarSlot.findUnique({ where: { slot_id }, include: { event: true } })
  if (!slot) throw new HttpError(404, 'Stall not found')
  if (slot.vendor_id) throw new HttpError(409, 'This stall already has a vendor.')
  const schedule = await prisma.vendorSchedule.findUnique({
    where: { vendor_id_event_id: { vendor_id, event_id: slot.event_id } },
    include: { vendor: true },
  })
  if (!schedule) throw new HttpError(400, 'This vendor has not pre-registered for this bazaar.')
  if (schedule.slot_id) throw new HttpError(409, 'This vendor already has a stall for this bazaar.')

  await prisma.$transaction([
    prisma.bazaarSlot.update({ where: { slot_id }, data: { vendor_id, status: 'assigned' } }),
    prisma.vendorSchedule.update({
      where: { schedule_id: schedule.schedule_id },
      data: { slot_id, status: 'assigned' },
    }),
  ])

  const when = `${slot.event.name} on ${out.dateOnly(slot.event.date)} at ${slot.event.location}`
  await notify(vendor_id, 'stall_assigned', `You were assigned Stall ${slot.label} for ${when}.`, '/vendor')
  // SendScheduleNotification(): tell customers who favorited this vendor.
  const customers = await customersFavoritingVendor(vendor_id)
  await notifyMany(
    customers,
    'schedule_update',
    `${schedule.vendor.business_name} will be at ${when} (Stall ${slot.label}).`,
    `/customer/vendors/${vendor_id}`,
  )

  res.json({ message: `${schedule.vendor.business_name} was assigned to Stall ${slot.label}.` })
})

router.delete('/slots/:id/assign', async (req, res) => {
  const slot_id = toId(req.params.id)
  const slot = await prisma.bazaarSlot.findUnique({ where: { slot_id }, include: { schedule: true, event: true } })
  if (!slot) throw new HttpError(404, 'Stall not found')
  if (!slot.vendor_id) throw new HttpError(400, 'This stall is already empty.')
  await prisma.$transaction([
    prisma.bazaarSlot.update({ where: { slot_id }, data: { vendor_id: null, status: 'available' } }),
    ...(slot.schedule
      ? [
          prisma.vendorSchedule.update({
            where: { schedule_id: slot.schedule.schedule_id },
            data: { slot_id: null, status: 'pre_registered' },
          }),
        ]
      : []),
  ])
  await notify(
    slot.vendor_id,
    'stall_removed',
    `Your stall ${slot.label} for ${slot.event.name} was removed. You are back on the waiting list.`,
    '/vendor',
  )
  res.status(204).end()
})

/* ---------- Review moderation (RemoveReview / FlagSuspiciousReview) ---------- */

router.get('/reviews', async (_req, res) => {
  const reviews = await prisma.review.findMany({
    include: { customer: { select: { name: true } }, vendor: { select: { business_name: true } } },
    orderBy: { created_at: 'desc' },
  })
  res.json(reviews.map(out.review))
})

// PATCH /api/admin/reviews/:id { status?: 'visible'|'removed', ai_flag?: boolean, ai_flag_reason?: string }
router.patch('/reviews/:id', async (req, res) => {
  const review_id = toId(req.params.id)
  const b = req.body || {}
  const data = {}
  if (b.status !== undefined) {
    if (!['visible', 'removed'].includes(b.status)) throw new HttpError(400, 'Invalid status')
    data.status = b.status
  }
  if (b.ai_flag !== undefined) {
    data.ai_flag = Boolean(b.ai_flag)
    data.ai_flag_reason = data.ai_flag ? String(b.ai_flag_reason || 'Flagged by an admin.') : null
  }
  const review = await prisma.review.update({
    where: { review_id },
    data,
    include: { customer: { select: { name: true } }, vendor: { select: { business_name: true } } },
  })
  if (data.status) refreshVendorSummaryLater(review.vendor_id)
  res.json(out.review(review))
})

export default router
