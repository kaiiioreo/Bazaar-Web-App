// Customer-only features: favorites and reviews (SRS 3.1.3.2, 3.1.3.4).
import { Router } from 'express'
import { prisma } from '../lib/prisma.js'
import { HttpError, toId } from '../lib/http.js'
import * as out from '../lib/serialize.js'
import { requireAuth, requireRole } from '../middleware/auth.js'
import { checkReview } from '../services/ai.js'
import { refreshVendorSummaryLater } from '../services/reviews.js'

const router = Router()
router.use(requireAuth, requireRole('customer'))

/* ---------- Favorites ---------- */

// GET /api/customer/favorites -> { vendor_ids, product_ids, vendors, products }
router.get('/favorites', async (req, res) => {
  const favs = await prisma.favorite.findMany({
    where: { customer_id: req.user.user_id },
    include: {
      vendor: { include: { reviews: { where: { status: 'visible' } }, user: { select: { status: true } } } },
      product: { include: { vendor: { select: { business_name: true } } } },
    },
    orderBy: { created_at: 'desc' },
  })
  const vendors = favs.filter((f) => f.vendor && f.vendor.user.status === 'active').map((f) => out.vendor(f.vendor))
  const products = favs.filter((f) => f.product).map((f) => out.product(f.product))
  res.json({
    vendor_ids: vendors.map((v) => v.vendor_id),
    product_ids: products.map((p) => p.product_id),
    vendors,
    products,
  })
})

// ToggleFavorite(): POST /api/customer/favorites/toggle { target_type: 'vendor'|'product', target_id }
router.post('/favorites/toggle', async (req, res) => {
  const type = req.body?.target_type
  if (!['vendor', 'product'].includes(type)) throw new HttpError(400, 'target_type must be vendor or product')
  const target_id = toId(req.body.target_id, 'target_id')
  const field = type === 'vendor' ? 'vendor_id' : 'product_id'

  const exists =
    type === 'vendor'
      ? await prisma.vendorProfile.findUnique({ where: { vendor_id: target_id } })
      : await prisma.product.findUnique({ where: { product_id: target_id } })
  if (!exists) throw new HttpError(404, `${type} not found`)

  const current = await prisma.favorite.findFirst({ where: { customer_id: req.user.user_id, [field]: target_id } })
  if (current) {
    await prisma.favorite.delete({ where: { favorite_id: current.favorite_id } })
    return res.json({ favorited: false })
  }
  await prisma.favorite.create({ data: { customer_id: req.user.user_id, target_type: type, [field]: target_id } })
  res.json({ favorited: true })
})

/* ---------- Reviews ---------- */

router.get('/reviews', async (req, res) => {
  const reviews = await prisma.review.findMany({
    where: { customer_id: req.user.user_id },
    include: { vendor: { select: { business_name: true } }, customer: { select: { name: true } } },
    orderBy: { created_at: 'desc' },
  })
  res.json(reviews.map(out.review))
})

function readReview(body) {
  const rating = Number(body?.rating)
  const comment = String(body?.comment ?? '').trim()
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) throw new HttpError(400, 'Rating must be 1 to 5 stars.')
  if (comment.length < 3) throw new HttpError(400, 'Please write a short comment.')
  if (comment.length > 1000) throw new HttpError(400, 'Comment is too long (max 1000 characters).')
  return { rating, comment }
}

// SubmitReview(): POST /api/customer/reviews { vendor_id, rating, comment }
router.post('/reviews', async (req, res) => {
  const vendor_id = toId(req.body?.vendor_id, 'vendor_id')
  const data = readReview(req.body)
  const vendor = await prisma.vendorProfile.findUnique({ where: { vendor_id } })
  if (!vendor) throw new HttpError(404, 'Vendor not found')
  const existing = await prisma.review.findUnique({
    where: { customer_id_vendor_id: { customer_id: req.user.user_id, vendor_id } },
  })
  if (existing) throw new HttpError(409, 'You already reviewed this vendor. Edit your review instead.')

  const check = await checkReview(data.comment)
  const review = await prisma.review.create({
    data: { ...data, vendor_id, customer_id: req.user.user_id, ai_flag: check.flag, ai_flag_reason: check.reason },
    include: { vendor: { select: { business_name: true } }, customer: { select: { name: true } } },
  })
  refreshVendorSummaryLater(vendor_id)
  res.status(201).json(out.review(review))
})

// EditReview()
router.put('/reviews/:id', async (req, res) => {
  const review_id = toId(req.params.id)
  const review = await prisma.review.findUnique({ where: { review_id } })
  if (!review || review.customer_id !== req.user.user_id) throw new HttpError(404, 'Review not found')
  const data = readReview(req.body)
  const check = await checkReview(data.comment)
  const updated = await prisma.review.update({
    where: { review_id },
    data: { ...data, ai_flag: check.flag, ai_flag_reason: check.reason },
    include: { vendor: { select: { business_name: true } }, customer: { select: { name: true } } },
  })
  refreshVendorSummaryLater(review.vendor_id)
  res.json(out.review(updated))
})

// DeleteReview()
router.delete('/reviews/:id', async (req, res) => {
  const review_id = toId(req.params.id)
  const review = await prisma.review.findUnique({ where: { review_id } })
  if (!review || review.customer_id !== req.user.user_id) throw new HttpError(404, 'Review not found')
  await prisma.review.delete({ where: { review_id } })
  refreshVendorSummaryLater(review.vendor_id)
  res.status(204).end()
})

export default router
