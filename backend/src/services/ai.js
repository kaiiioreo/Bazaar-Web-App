// AI Integration Module (SDD 3.2.6 / 5.6).
// This is the ONLY file that talks to the third-party LLM API.
// Every function has a non-AI fallback, so the app still works without an API key.

const PROVIDER = (process.env.AI_PROVIDER || 'gemini').toLowerCase() // gemini | anthropic | openai
const API_KEY = process.env.AI_API_KEY || ''
const DEFAULT_MODELS = { gemini: 'gemini-flash-latest', openai: 'gpt-4o-mini', anthropic: 'claude-haiku-5-5' }
const MODEL = process.env.AI_MODEL || DEFAULT_MODELS[PROVIDER] || DEFAULT_MODELS.gemini
const GEMINI_URL = process.env.GEMINI_BASE_URL || 'https://generativelanguage.googleapis.com/v1beta'

export const aiEnabled = () => Boolean(API_KEY)
export const aiInfo = () => ({ provider: PROVIDER, model: MODEL, enabled: aiEnabled() })

let lastError = ''
export const getLastAIError = () => lastError

async function readJSON(res) {
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(`${res.status} ${data.error?.message || res.statusText}`)
  return data
}

// Google Gemini (free tier available). Docs: ai.google.dev/api/generate-content
async function callGemini({ system, messages, maxTokens }) {
  const res = await fetch(`${GEMINI_URL}/models/${encodeURIComponent(MODEL)}:generateContent`, {
    method: 'POST',
    headers: { 'content-type': 'application/json', 'x-goog-api-key': API_KEY },
    body: JSON.stringify({
      systemInstruction: { parts: [{ text: system }] },
      contents: messages.map((m) => ({
        role: m.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: m.content }],
      })),
      // Newer Flash models "think" before answering and that uses output tokens,
      // so leave extra room above the answer length we actually want.
      generationConfig: { maxOutputTokens: maxTokens + 2048, temperature: 0.4 },
    }),
    signal: AbortSignal.timeout(30000),
  })
  const data = await readJSON(res)
  const parts = data.candidates?.[0]?.content?.parts ?? []
  return parts.filter((p) => !p.thought).map((p) => p.text || '').join('').trim() || null
}

async function callOpenAI({ system, messages, maxTokens }) {
  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: { 'content-type': 'application/json', authorization: `Bearer ${API_KEY}` },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: maxTokens,
      messages: [{ role: 'system', content: system }, ...messages],
    }),
    signal: AbortSignal.timeout(20000),
  })
  const data = await readJSON(res)
  return data.choices?.[0]?.message?.content?.trim() || null
}

async function callAnthropic({ system, messages, maxTokens }) {
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: { 'content-type': 'application/json', 'x-api-key': API_KEY, 'anthropic-version': '2023-06-01' },
    body: JSON.stringify({ model: MODEL, max_tokens: maxTokens, system, messages }),
    signal: AbortSignal.timeout(20000),
  })
  const data = await readJSON(res)
  return data.content?.map((c) => c.text || '').join('').trim() || null
}

// messages: [{ role: 'user' | 'assistant', content: string }]
// Returns the reply text, or null so the caller uses its non-AI fallback.
async function callLLM({ system, messages, maxTokens = 500 }) {
  if (!API_KEY) return null
  try {
    const call = PROVIDER === 'openai' ? callOpenAI : PROVIDER === 'anthropic' ? callAnthropic : callGemini
    const text = await call({ system, messages, maxTokens })
    if (!text) throw new Error('The AI returned an empty answer.')
    lastError = ''
    return text
  } catch (err) {
    lastError = err.message
    // 429 = free-tier limit reached; the fallback keeps the app working.
    console.error('[ai] request failed, using fallback:', err.message)
    return null
  }
}

// Used by `npm run ai:check` to confirm the key and model work.
export async function testAI() {
  const text = await callLLM({
    system: 'Reply with exactly: Bazaar AI is working.',
    messages: [{ role: 'user', content: 'Test' }],
    maxTokens: 50,
  })
  return { ok: Boolean(text), text, error: lastError }
}

function parseJSON(text) {
  if (!text) return null
  const match = text.match(/\{[\s\S]*\}/)
  if (!match) return null
  try {
    return JSON.parse(match[0])
  } catch {
    return null
  }
}

// Keep only the last few turns and cap their length.
function cleanHistory(messages = []) {
  return messages
    .filter((m) => m && typeof m.content === 'string' && m.content.trim())
    .slice(-10)
    .map((m) => ({ role: m.role === 'assistant' ? 'assistant' : 'user', content: m.content.slice(0, 1500) }))
}

/* ---------- Natural-language search (SearchProductsNaturalLanguage) ---------- */

const STOP = new Set(('a an the for of to and or with under below over above less than something some any me i ' +
  'want looking find sell selling sells that is are in on at my show best good who where can buy get need ' +
  'please php pesos peso p gift present cheap affordable stuff thing things item items').split(' '))

function fallbackSearchFilters(query, categories) {
  const lower = query.toLowerCase()
  const priceMatch = lower.match(/(?:under|below|less than|max|<)\s*(?:php|₱|p)?\s*(\d+)/)
  const category = categories.find((c) => lower.includes(c.toLowerCase())) || null
  const keywords = lower
    .split(/[^a-z0-9ñ]+/)
    .filter((t) => t.length > 1 && !STOP.has(t) && !/^\d+$/.test(t))
  const sweet = /sweet|dessert|pasalubong|snack/.test(lower)
  return {
    keywords: sweet && !keywords.length ? ['sweet'] : keywords,
    category,
    max_price: priceMatch ? Number(priceMatch[1]) : null,
    in_stock_only: /in stock|available/.test(lower),
  }
}

export async function parseSearchQuery(query, categories) {
  const text = await callLLM({
    system:
      'You turn shopping searches for a Filipino local bazaar into JSON filters. ' +
      'Reply with JSON only: {"keywords": string[], "category": string|null, "max_price": number|null, "in_stock_only": boolean}. ' +
      'keywords are short lowercase words likely to appear in product or vendor names or descriptions, ' +
      'including English and Filipino/Cebuano synonyms (e.g. "dried mango" -> ["mango","dried"], "kape" -> ["coffee","kape","barako"]). ' +
      `category must be one of: ${categories.join(', ')} or null.`,
    messages: [{ role: 'user', content: query }],
    maxTokens: 200,
  })
  const parsed = parseJSON(text)
  if (parsed && Array.isArray(parsed.keywords)) {
    return {
      keywords: parsed.keywords.map((k) => String(k).toLowerCase()).filter(Boolean).slice(0, 10),
      category: categories.includes(parsed.category) ? parsed.category : null,
      max_price: Number(parsed.max_price) > 0 ? Number(parsed.max_price) : null,
      in_stock_only: Boolean(parsed.in_stock_only),
      used_ai: true,
    }
  }
  return { ...fallbackSearchFilters(query, categories), used_ai: false }
}

/* ---------- Chatbot for guests and customers (ChatbotRespond) ---------- */

function fallbackChat(message, context) {
  const text = message.toLowerCase()
  const next = context.events[0]
  if (/event|bazaar|schedule|when|where|date|market|weekend/.test(text)) {
    return next
      ? `The next bazaar is ${next.name} on ${next.date} at ${next.location}. Open the Schedule page to see every vendor attending.`
      : 'There are no upcoming bazaars yet. Check the Schedule page again soon.'
  }
  if (/favorite|save|review|account|sign up|register/.test(text)) {
    return 'Saving favorites and writing reviews need a free customer account. Tap "Create account" to sign up.'
  }
  if (/vendor|stall|seller|sell/.test(text)) {
    return `We have ${context.vendors.length} vendors, including ${context.vendors.slice(0, 3).map((v) => v.business_name).join(', ')}. Use the search bar to find products in your own words.`
  }
  return 'I can help you find products and vendors or check the bazaar schedule. Try asking "what is sold at the next bazaar?"'
}

export async function chatReply({ messages, user, context }) {
  const history = cleanHistory(messages)
  const last = history[history.length - 1]?.content || ''
  const facts = [
    `Upcoming bazaars: ${context.events.map((e) => `${e.name} on ${e.date} at ${e.location} (vendors: ${e.vendors.join(', ') || 'not assigned yet'})`).join('; ') || 'none'}.`,
    `Vendors: ${context.vendors.map((v) => `${v.business_name} (${v.category})`).join(', ')}.`,
    user ? `The user is a logged-in customer named ${user.name}.` : 'The user is a guest without an account.',
    context.favorites?.length ? `Their favorite vendors: ${context.favorites.join(', ')}.` : '',
  ].join('\n')
  const reply = await callLLM({
    system:
      'You are "Ask Bazaar", a friendly assistant for a local bazaar web app in Cebu, Philippines. ' +
      'Answer in 1 to 3 short sentences, in the same language the user writes in (English or Filipino). ' +
      'Only use the facts below; if you do not know, say so and point to the Browse or Schedule page. ' +
      'Guests need a customer account to save favorites or write reviews. Payment happens on-site at the bazaar.\n\n' +
      facts,
    messages: history.length ? history : [{ role: 'user', content: 'Hello' }],
    maxTokens: 300,
  })
  return reply || fallbackChat(last, context)
}

/* ---------- Vendor AI assistant (VendorAIApplicationAssistant) ---------- */

export async function vendorAssistReply({ messages, vendorName, application }) {
  const history = cleanHistory(messages)
  const reply = await callLLM({
    system:
      'You help small vendors in Cebu use the Bazaar web app. You help them write a clear vendor application ' +
      '(business name, product category, and business details: what they sell, price range, how products are made) ' +
      'and write short, appealing product listings. Keep answers under 120 words and practical. ' +
      (vendorName ? `The vendor's business is "${vendorName}". ` : '') +
      (application ? `Their application status is ${application.status}.` : ''),
    messages: history.length ? history : [{ role: 'user', content: 'Hello' }],
    maxTokens: 400,
  })
  if (reply) return reply
  return (
    'Tips for a strong application: give your business name, pick the closest category, and in the details say what you sell, ' +
    'your usual price range, and what makes it special (for example "handmade", "family recipe", or "locally sourced"). ' +
    'To write a product listing, use the Generate with AI button in the product form.'
  )
}

/* ---------- AI-generated vendor listing (GenerateVendorListing) ---------- */

export async function generateListing({ notes, categories, vendorName }) {
  const text = await callLLM({
    system:
      'You write product listings for a local bazaar app in the Philippines. ' +
      'Reply with JSON only: {"name": string, "description": string, "category": string, "price": number|null}. ' +
      'name: under 40 characters. description: 1 to 2 friendly sentences, under 200 characters, no hashtags or emojis. ' +
      `category must be one of: ${categories.join(', ')}. price in pesos if the notes mention one, else null.`,
    messages: [{ role: 'user', content: `Vendor: ${vendorName || 'a local vendor'}\nNotes: ${notes}` }],
    maxTokens: 300,
  })
  const parsed = parseJSON(text)
  if (parsed?.name && parsed?.description) {
    return {
      name: String(parsed.name).slice(0, 60),
      description: String(parsed.description).slice(0, 300),
      category: categories.includes(parsed.category) ? parsed.category : categories[0],
      price: Number(parsed.price) > 0 ? Number(parsed.price) : null,
      used_ai: true,
    }
  }
  // Fallback: tidy up the vendor's own notes.
  const clean = notes.trim().replace(/\s+/g, ' ')
  const price = clean.match(/(?:₱|php|p)\s*(\d+)/i) || clean.match(/(\d+)\s*(?:pesos|php)/i)
  const first = clean.split(/[,.;\n]/)[0].replace(/(?:₱|php)\s*\d+/i, '').trim()
  const name = first.charAt(0).toUpperCase() + first.slice(1, 40)
  return {
    name: name || 'New product',
    description: `${clean.charAt(0).toUpperCase()}${clean.slice(1)}${/[.!?]$/.test(clean) ? '' : '.'} Available at our stall this bazaar.`.slice(0, 300),
    category: categories.find((c) => clean.toLowerCase().includes(c.toLowerCase())) || categories[0],
    price: price ? Number(price[1]) : null,
    used_ai: false,
  }
}

/* ---------- Review sentiment summary (SummarizeReviewSentiment) ---------- */

export async function summarizeReviews(reviews, subject = 'this vendor') {
  if (!reviews.length) return ''
  const sample = reviews.slice(0, 40).map((r) => `${r.rating}/5: ${r.comment}`).join('\n')
  const text = await callLLM({
    system:
      `Summarize customer sentiment about ${subject} in 2 short sentences: what customers praise, then any common complaint. ` +
      'Plain text, no bullet points, no star counts, under 45 words.',
    messages: [{ role: 'user', content: sample }],
    maxTokens: 150,
  })
  if (text) return text
  const avg = reviews.reduce((s, r) => s + r.rating, 0) / reviews.length
  const tone = avg >= 4.2 ? 'very positive' : avg >= 3.5 ? 'mostly positive' : avg >= 2.5 ? 'mixed' : 'mostly negative'
  const low = reviews.find((r) => r.rating <= 3)
  return `Feedback from ${reviews.length} review${reviews.length === 1 ? '' : 's'} is ${tone} (average ${avg.toFixed(1)} of 5).` +
    (low ? ` One concern raised: "${low.comment.slice(0, 80)}${low.comment.length > 80 ? '…' : ''}"` : '')
}

/* ---------- Review fraud / abuse check (used by FlagSuspiciousReview) ---------- */

const ABUSIVE = /\b(stupid|idiot|garbage|useless|trash|scam(?:mer)?|bobo|gago|tanga|putang?ina|walang kwenta)\b/i

export async function checkReview(comment) {
  const reasons = []
  if (/https?:\/\/|www\.|\.com\b/i.test(comment)) reasons.push('contains a link (possible spam)')
  if (ABUSIVE.test(comment)) reasons.push('possible abusive language or a personal attack')
  if ((comment.match(/!/g) || []).length >= 5 || /(\b\w+\b)(?:[\s,!]+\1\b){2,}/i.test(comment)) {
    reasons.push('repeated words or excessive punctuation (possible fake review)')
  }
  if (reasons.length) return { flag: true, reason: `Possible issue: ${reasons.join('; ')}.` }

  const text = await callLLM({
    system:
      'You moderate reviews on a local bazaar app. Decide if a review is spam, fake, or abusive. ' +
      'Reply with JSON only: {"flag": boolean, "reason": string}. Honest negative reviews are NOT flagged.',
    messages: [{ role: 'user', content: comment }],
    maxTokens: 120,
  })
  const parsed = parseJSON(text)
  if (parsed?.flag) return { flag: true, reason: String(parsed.reason || 'Flagged by AI review check.').slice(0, 200) }
  return { flag: false, reason: null }
}

/* ---------- Vendor application check ---------- */

export function checkApplication(details) {
  const words = details.trim().split(/\s+/).filter(Boolean).length
  if (words < 6) return { flag: true, reason: 'Business details are very short or incomplete.' }
  return { flag: false, reason: null }
}
