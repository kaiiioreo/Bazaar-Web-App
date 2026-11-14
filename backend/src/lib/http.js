// Throw `new HttpError(404, 'Vendor not found')` anywhere in a route.
// Express 5 passes it to the error handler in app.js automatically.
export class HttpError extends Error {
  constructor(status, message) {
    super(message)
    this.status = status
  }
}

export function toId(value, label = 'id') {
  const id = Number(value)
  if (!Number.isInteger(id) || id < 1) throw new HttpError(400, `Invalid ${label}`)
  return id
}

export function requireFields(body, fields) {
  const missing = fields.filter((f) => body?.[f] === undefined || body[f] === null || String(body[f]).trim() === '')
  if (missing.length) throw new HttpError(400, `Missing required field(s): ${missing.join(', ')}`)
}

// Accepts 'YYYY-MM-DD' and returns a Date at UTC midnight (matches Postgres DATE).
export function parseDate(value, label = 'date') {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(String(value))) throw new HttpError(400, `${label} must be YYYY-MM-DD`)
  const d = new Date(`${value}T00:00:00Z`)
  if (Number.isNaN(d.getTime())) throw new HttpError(400, `Invalid ${label}`)
  return d
}

export function todayUTC() {
  const now = new Date()
  return new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()))
}

export function pick(obj, keys) {
  const out = {}
  for (const k of keys) if (obj?.[k] !== undefined) out[k] = obj[k]
  return out
}

export const STOCK_VALUES = ['in_stock', 'low_stock', 'out_of_stock']
