// AI endpoints: chatbot, vendor assistant, listing generator (SRS 3.1.6).
// Natural-language search lives in catalog.js (POST /api/search).
import { Router } from 'express'
import { prisma } from '../lib/prisma.js'
import { HttpError, todayUTC } from '../lib/http.js'
import { CATEGORIES } from '../lib/constants.js'
import { dateOnly } from '../lib/serialize.js'
import { optionalAuth, requireAuth, requireRole } from '../middleware/auth.js'
import { aiEnabled, aiInfo, getLastAIError, chatReply, vendorAssistReply, generateListing } from '../services/ai.js'

const router = Router()

router.get('/status', (_req, res) => res.json({ ...aiInfo(), last_error: getLastAIError() || null }))

function readMessages(body) {
  const messages = Array.isArray(body?.messages) ? body.messages : []
  if (!messages.length) throw new HttpError(400, 'messages is required')
  return messages
}

// ChatbotRespond(): guests and customers. POST /api/ai/chat { messages: [{role, content}] }
router.post('/chat', optionalAuth, async (req, res) => {
  const messages = readMessages(req.body)
  const [events, vendors] = await Promise.all([
    prisma.bazaarEvent.findMany({
      where: { status: 'upcoming', date: { gte: todayUTC() } },
      orderBy: { date: 'asc' },
      take: 5,
      include: {
        schedules: { where: { status: 'assigned' }, include: { vendor: { select: { business_name: true } } } },
      },
    }),
    prisma.vendorProfile.findMany({
      where: { user: { status: 'active' } },
      select: { business_name: true, category: true },
      take: 40,
    }),
  ])
  // Personalized extra for registered customers (SRS 3.1.6.2).
  let favorites = []
  const customer = req.user?.role === 'customer' ? req.user : null
  if (customer) {
    const favs = await prisma.favorite.findMany({
      where: { customer_id: customer.user_id, vendor_id: { not: null } },
      include: { vendor: { select: { business_name: true } } },
    })
    favorites = favs.map((f) => f.vendor.business_name)
  }
  const reply = await chatReply({
    messages,
    user: customer,
    context: {
      events: events.map((e) => ({
        name: e.name,
        date: dateOnly(e.date),
        location: e.location,
        vendors: e.schedules.map((s) => s.vendor.business_name),
      })),
      vendors,
      favorites,
    },
  })
  res.json({ reply, ai_enabled: aiEnabled() })
})

// VendorAIApplicationAssistant(): POST /api/ai/vendor-assist { messages }
router.post('/vendor-assist', requireAuth, requireRole('vendor'), async (req, res) => {
  const messages = readMessages(req.body)
  const [profile, application] = await Promise.all([
    prisma.vendorProfile.findUnique({ where: { vendor_id: req.user.user_id } }),
    prisma.vendorApplication.findFirst({ where: { user_id: req.user.user_id }, orderBy: { submitted_at: 'desc' } }),
  ])
  const reply = await vendorAssistReply({
    messages,
    vendorName: profile?.business_name || application?.business_name,
    application,
  })
  res.json({ reply, ai_enabled: aiEnabled() })
})

// GenerateVendorListing(): POST /api/ai/generate-listing { notes }
// Returns a draft only; the vendor edits it in the product form before saving.
router.post('/generate-listing', requireAuth, requireRole('vendor'), async (req, res) => {
  const notes = String(req.body?.notes || '').trim()
  if (notes.length < 3) throw new HttpError(400, 'Describe your product in a few words first.')
  const profile = await prisma.vendorProfile.findUnique({ where: { vendor_id: req.user.user_id } })
  const draft = await generateListing({
    notes: notes.slice(0, 1000),
    categories: CATEGORIES,
    vendorName: profile?.business_name,
  })
  res.json(draft)
})

export default router
