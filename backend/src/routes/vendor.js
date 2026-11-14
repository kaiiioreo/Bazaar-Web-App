// Vendor Dashboard (SRS 3.1.5): application, profile, products, stock, schedule.
import { Router } from 'express'
import { prisma } from '../lib/prisma.js'
import { HttpError, toId, todayUTC, requireFields, STOCK_VALUES } from '../lib/http.js'
import { CATEGORIES } from '../lib/constants.js'
import * as out from '../lib/serialize.js'
import { requireAuth, requireRole, requireApprovedVendor } from '../middleware/auth.js'
import { checkApplication } from '../services/ai.js'
import { notifyAdmins, notifyMany, customersFavoritingProduct } from '../services/notify.js'

const router = Router()
router.use(requireAuth, requireRole('vendor'))

const MAX_IMAGE = 1_500_000 // ~1.5 MB data URL

/* ---------- Application (SubmitVendorApplication) ---------- */

router.get('/application', async (req, res) => {
  const app = await prisma.vendorApplication.findFirst({
    where: { user_id: req.user.user_id },
    orderBy: { submitted_at: 'desc' },
    include: { user: true },
  })
  res.json(app ? out.application(app) : null)
})

router.post('/application', async (req, res) => {
  requireFields(req.body, ['business_name', 'product_category', 'business_details'])
  const latest = await prisma.vendorApplication.findFirst({
    where: { user_id: req.user.user_id },
    orderBy: { submitted_at: 'desc' },
  })
  if (latest?.status === 'pending') throw new HttpError(409, 'Your application is already waiting for review.')
  if (latest?.status === 'approved') throw new HttpError(409, 'You are already an approved vendor.')

  const details = String(req.body.business_details).trim()
  const check = checkApplication(details)
  const app = await prisma.vendorApplication.create({
    data: {
      user_id: req.user.user_id,
      business_name: String(req.body.business_name).trim(),
      product_category: CATEGORIES.includes(req.body.product_category) ? req.body.product_category : 'Other',
      business_details: details,
      ai_flag: check.flag,
      ai_flag_reason: check.reason,
    },
    include: { user: true },
  })
  await notifyAdmins('new_application', `New vendor application from ${app.business_name}.`, '/admin/applications')
  res.status(201).json(out.application(app))
})

/* ---------- Everything below needs an approved vendor ---------- */
router.use(requireApprovedVendor)

// ViewVendorProfile() / UpdateVendorProfile()
router.get('/profile', async (req, res) => {
  res.json(out.vendor(req.vendor))
})

router.put('/profile', async (req, res) => {
  const b = req.body || {}
  const data = {}
  if (b.business_name !== undefined) {
    if (!String(b.business_name).trim()) throw new HttpError(400, 'Business name is required.')
    data.business_name = String(b.business_name).trim()
  }
  if (b.category !== undefined) data.category = CATEGORIES.includes(b.category) ? b.category : 'Other'
  for (const f of ['description', 'contact_info', 'contact_phone']) {
    if (b[f] !== undefined) data[f] = String(b[f] ?? '').trim()
  }
  if (b.profile_image !== undefined) {
    if (String(b.profile_image).length > MAX_IMAGE) throw new HttpError(413, 'Image is too large.')
    data.profile_image = b.profile_image || null
  }
  const v = await prisma.vendorProfile.update({ where: { vendor_id: req.vendor.vendor_id }, data })
  res.json(out.vendor(v))
})

// DeleteVendorProfile(): deactivates the account and hides the vendor from customers.
router.delete('/profile', async (req, res) => {
  await prisma.user.update({ where: { user_id: req.user.user_id }, data: { status: 'deactivated' } })
  res.status(204).end()
})

/* ---------- Products (AddProduct / UpdateProduct / DeleteProduct) ---------- */

function readProduct(b, partial = false) {
  const data = {}
  if (!partial || b.name !== undefined) {
    if (!String(b.name ?? '').trim()) throw new HttpError(400, 'Product name is required.')
    data.name = String(b.name).trim().slice(0, 100)
  }
  if (!partial || b.price !== undefined) {
    const price = Number(b.price)
    if (!Number.isFinite(price) || price < 0) throw new HttpError(400, 'Price must be 0 or more.')
    data.price = price
  }
  if (!partial || b.category !== undefined) data.category = CATEGORIES.includes(b.category) ? b.category : 'Other'
  if (b.description !== undefined) data.description = String(b.description ?? '').trim().slice(0, 1000)
  if (b.stock_status !== undefined) {
    if (!STOCK_VALUES.includes(b.stock_status)) throw new HttpError(400, 'Invalid stock status.')
    data.stock_status = b.stock_status
  }
  if (b.image !== undefined) {
    if (String(b.image).length > MAX_IMAGE) throw new HttpError(413, 'Image is too large.')
    data.image = b.image || null
  }
  return data
}

async function ownProduct(req) {
  const product = await prisma.product.findUnique({ where: { product_id: toId(req.params.id, 'product id') } })
  if (!product || product.vendor_id !== req.vendor.vendor_id) throw new HttpError(404, 'Product not found')
  return product
}

// SendRestockNotification() when a product comes back in stock.
async function maybeNotifyRestock(before, after) {
  if (before.stock_status === 'out_of_stock' && after.stock_status !== 'out_of_stock') {
    const customers = await customersFavoritingProduct(after)
    await notifyMany(
      customers,
      'restock',
      `${after.name} from ${after.vendor?.business_name ?? 'a vendor you follow'} is back in stock.`,
      `/customer/vendors/${after.vendor_id}`,
    )
  }
}

const withVendor = { vendor: { select: { business_name: true } } }

router.get('/products', async (req, res) => {
  const products = await prisma.product.findMany({
    where: { vendor_id: req.vendor.vendor_id },
    orderBy: { created_at: 'asc' },
  })
  res.json(products.map(out.product))
})

router.post('/products', async (req, res) => {
  const product = await prisma.product.create({
    data: { ...readProduct(req.body || {}), vendor_id: req.vendor.vendor_id },
  })
  res.status(201).json(out.product(product))
})

router.put('/products/:id', async (req, res) => {
  const before = await ownProduct(req)
  const after = await prisma.product.update({
    where: { product_id: before.product_id },
    data: readProduct(req.body || {}, true),
    include: withVendor,
  })
  await maybeNotifyRestock(before, after)
  res.json(out.product(after))
})

// UpdateStockStatus()
router.patch('/products/:id/stock', async (req, res) => {
  const before = await ownProduct(req)
  if (!STOCK_VALUES.includes(req.body?.stock_status)) throw new HttpError(400, 'Invalid stock status.')
  const after = await prisma.product.update({
    where: { product_id: before.product_id },
    data: { stock_status: req.body.stock_status },
    include: withVendor,
  })
  await maybeNotifyRestock(before, after)
  res.json(out.product(after))
})

router.delete('/products/:id', async (req, res) => {
  const product = await ownProduct(req)
  await prisma.product.delete({ where: { product_id: product.product_id } })
  res.status(204).end()
})

/* ---------- Bazaar schedule (PreRegisterForBazaar / UpdateVendorSchedule) ---------- */

// Upcoming events with this vendor's registration status.
router.get('/events', async (req, res) => {
  const events = await prisma.bazaarEvent.findMany({
    where: { status: 'upcoming', date: { gte: todayUTC() } },
    orderBy: { date: 'asc' },
    include: { schedules: { where: { vendor_id: req.vendor.vendor_id }, include: { slot: true } } },
  })
  res.json(
    events.map((ev) => {
      const mine = ev.schedules[0]
      return {
        ...out.event(ev),
        my_status: mine ? mine.status : null, // null | pre_registered | assigned
        slot_label: mine?.slot?.label ?? null,
        registered_at: mine ? out.dateOnly(mine.registered_at) : null,
      }
    }),
  )
})

router.post('/events/:id/preregister', async (req, res) => {
  const event_id = toId(req.params.id, 'event id')
  const ev = await prisma.bazaarEvent.findUnique({ where: { event_id } })
  if (!ev || out.event(ev).status !== 'upcoming') throw new HttpError(404, 'This bazaar is not open.')
  if (!ev.registration_open) throw new HttpError(400, 'Pre-registration for this bazaar is closed.')
  const exists = await prisma.vendorSchedule.findUnique({
    where: { vendor_id_event_id: { vendor_id: req.vendor.vendor_id, event_id } },
  })
  if (exists) throw new HttpError(409, 'You are already pre-registered for this bazaar.')
  await prisma.vendorSchedule.create({ data: { vendor_id: req.vendor.vendor_id, event_id } })
  await notifyAdmins('preregistration', `${req.vendor.business_name} pre-registered for ${ev.name}.`, '/admin/slots')
  res.status(201).json({ message: 'Pre-registered. The Admin will assign your stall.' })
})

// Withdraw from a bazaar (frees the stall if one was assigned).
router.delete('/events/:id/preregister', async (req, res) => {
  const event_id = toId(req.params.id, 'event id')
  const schedule = await prisma.vendorSchedule.findUnique({
    where: { vendor_id_event_id: { vendor_id: req.vendor.vendor_id, event_id } },
  })
  if (!schedule) throw new HttpError(404, 'You are not registered for this bazaar.')
  await prisma.$transaction([
    ...(schedule.slot_id
      ? [prisma.bazaarSlot.update({ where: { slot_id: schedule.slot_id }, data: { vendor_id: null, status: 'available' } })]
      : []),
    prisma.vendorSchedule.delete({ where: { schedule_id: schedule.schedule_id } }),
  ])
  res.status(204).end()
})

export default router
