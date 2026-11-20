// Public browsing for Guests and Customers (SRS 3.1.3.1, 3.1.3.5, 3.1.4, 3.1.6.1).
import { Router } from 'express'
import { prisma } from '../lib/prisma.js'
import { HttpError, toId, todayUTC, STOCK_VALUES } from '../lib/http.js'
import { CATEGORIES } from '../lib/constants.js'
import * as out from '../lib/serialize.js'
import { optionalAuth } from '../middleware/auth.js'
import { parseSearchQuery } from '../services/ai.js'

const router = Router()

// Only vendors whose account is active are shown to the public.
const activeVendor = { user: { status: 'active' } }
const visibleReviews = { where: { status: 'visible' }, select: { rating: true, status: true } }

router.get('/categories', (_req, res) => res.json(CATEGORIES))

// BrowseProducts() for vendors: GET /api/vendors?category=Snacks&q=mango
router.get('/vendors', async (req, res) => {
  const { category, q } = req.query
  const where = { ...activeVendor }
  if (category && category !== 'All') where.category = category
  if (q) {
    where.OR = [
      { business_name: { contains: q, mode: 'insensitive' } },
      { description: { contains: q, mode: 'insensitive' } },
    ]
  }
  const vendors = await prisma.vendorProfile.findMany({
    where,
    include: { reviews: visibleReviews, user: { select: { status: true } } },
    orderBy: { business_name: 'asc' },
  })
  res.json(vendors.map((v) => out.vendor(v)))
})

// ViewVendorProfile(): vendor + products + upcoming bazaars + reviews
router.get('/vendors/:id', async (req, res) => {
  const vendor_id = toId(req.params.id, 'vendor id')
  const v = await prisma.vendorProfile.findFirst({
    where: { vendor_id, ...activeVendor },
    include: {
      user: { select: { status: true } },
      products: { orderBy: { name: 'asc' } },
      reviews: {
        where: { status: 'visible' },
        include: { customer: { select: { name: true } } },
        orderBy: { created_at: 'desc' },
      },
      schedules: {
        where: { event: { status: { not: 'cancelled' }, date: { gte: todayUTC() } } },
        include: { event: true, slot: true },
      },
    },
  })
  if (!v) throw new HttpError(404, 'Vendor not found')
  res.json({
    ...out.vendor(v),
    products: v.products.map(out.product),
    reviews: v.reviews.map(out.review),
    events: v.schedules
      .sort((a, b) => a.event.date - b.event.date)
      .map((s) => ({ ...out.event(s.event), schedule_status: s.status, slot_label: s.slot?.label ?? null })),
  })
})

// GET /api/products?q=&category=&stock=in_stock&vendor_id=&limit=
router.get('/products', async (req, res) => {
  const { q, category, stock, vendor_id, limit } = req.query
  const where = { vendor: activeVendor }
  if (q) {
    where.OR = [{ name: { contains: q, mode: 'insensitive' } }, { description: { contains: q, mode: 'insensitive' } }]
  }
  if (category && category !== 'All') where.category = category
  if (stock === 'available') where.stock_status = { not: 'out_of_stock' }
  else if (STOCK_VALUES.includes(stock)) where.stock_status = stock
  if (vendor_id) where.vendor_id = toId(vendor_id, 'vendor id')
  const products = await prisma.product.findMany({
    where,
    include: { vendor: { select: { business_name: true } } },
    orderBy: { updated_at: 'desc' },
    take: limit ? Math.min(Number(limit) || 50, 100) : undefined,
  })
  res.json(products.map(out.product))
})

// ViewBazaarSchedule(): upcoming events and the vendors attending each one.
// "Attending" means the Admin has assigned them a stall.
router.get('/events', async (req, res) => {
  const where = { status: { not: 'cancelled' }, date: { gte: todayUTC() } }
  if (req.query.date) where.date = new Date(`${req.query.date}T00:00:00Z`)
  if (req.query.location) where.location = { contains: req.query.location, mode: 'insensitive' }
  const events = await prisma.bazaarEvent.findMany({
    where,
    orderBy: { date: 'asc' },
    include: {
      schedules: {
        where: { vendor: activeVendor },
        include: { vendor: { select: { vendor_id: true, business_name: true, category: true } }, slot: true },
      },
    },
  })
  res.json(
    events.map((ev) => {
      const assigned = ev.schedules.filter((s) => s.status === 'assigned')
      return {
        ...out.event(ev),
        vendors: assigned
          .map((s) => ({ ...s.vendor, slot_label: s.slot?.label ?? null }))
          .sort((a, b) => (a.slot_label || '').localeCompare(b.slot_label || '')),
        preregistered_count: ev.schedules.length - assigned.length,
      }
    }),
  )
})

// SearchProductsNaturalLanguage(): POST /api/search { query }
router.post('/search', optionalAuth, async (req, res) => {
  const query = String(req.body?.query || '')
    .trim()
    .slice(0, 200)
  if (!query) throw new HttpError(400, 'Type something to search for.')
  const filters = await parseSearchQuery(query, CATEGORIES)

  const textMatch = (fields) =>
    filters.keywords.flatMap((k) => fields.map((f) => ({ [f]: { contains: k, mode: 'insensitive' } })))

  const productWhere = { vendor: activeVendor, AND: [] }
  if (filters.keywords.length || filters.category) {
    productWhere.AND.push({
      OR: [
        ...textMatch(['name', 'description', 'category']),
        ...(filters.category ? [{ category: filters.category }] : []),
        ...(filters.keywords.length ? [{ vendor: { OR: textMatch(['business_name', 'category']) } }] : []),
      ],
    })
  }
  if (filters.max_price) productWhere.AND.push({ price: { lte: filters.max_price } })
  if (filters.in_stock_only) productWhere.AND.push({ stock_status: { not: 'out_of_stock' } })

  const products = productWhere.AND.length
    ? await prisma.product.findMany({
        where: productWhere,
        include: { vendor: { select: { business_name: true } } },
        take: 40,
      })
    : []

  const vendorIds = [...new Set(products.map((p) => p.vendor_id))]
  const vendors = await prisma.vendorProfile.findMany({
    where: {
      ...activeVendor,
      OR: [
        { vendor_id: { in: vendorIds } },
        ...textMatch(['business_name', 'description', 'category']),
        ...(filters.category ? [{ category: filters.category }] : []),
      ],
    },
    include: { reviews: visibleReviews, user: { select: { status: true } } },
  })

  // Rank: more keyword hits first.
  const score = (text) => filters.keywords.reduce((n, k) => n + (text.toLowerCase().includes(k) ? 1 : 0), 0)
  products.sort((a, b) => score(`${b.name} ${b.description}`) - score(`${a.name} ${a.description}`))
  vendors.sort((a, b) => score(`${b.business_name} ${b.description}`) - score(`${a.business_name} ${a.description}`))

  res.json({
    query,
    filters,
    vendors: vendors.map((v) => out.vendor(v)),
    products: products.map(out.product),
  })
})

export default router
