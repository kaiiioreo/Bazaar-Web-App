// Shared formatting helpers. Dates from the API are 'YYYY-MM-DD' strings.

const toDate = (iso) => new Date(`${String(iso).slice(0, 10)}T00:00:00`)

// formatDate('2026-11-21') -> 'Sat, Nov 21'
export function formatDate(iso, options = { weekday: 'short', month: 'short', day: 'numeric' }) {
  if (!iso) return ''
  return toDate(iso).toLocaleDateString('en-PH', options)
}

// formatLongDate('2026-11-21') -> 'Saturday, November 21, 2026'
export const formatLongDate = (iso) =>
  formatDate(iso, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })

// formatShortDate('2026-11-21') -> 'Nov 21'
export const formatShortDate = (iso) => formatDate(iso, { month: 'short', day: 'numeric' })

// peso(1250) -> '₱1,250'
export const peso = (amount) => `₱${Number(amount).toLocaleString('en-PH', { maximumFractionDigits: 2 })}`

// plural(1, 'review') -> '1 review', plural(3, 'review') -> '3 reviews'
export const plural = (n, word) => `${n} ${word}${n === 1 ? '' : 's'}`

// timeAgo('2026-11-21T00:10:00Z') -> 'just now', '5 minutes ago', '2 hours ago'
export function timeAgo(iso) {
  if (!iso) return ''
  const minutes = Math.round((Date.now() - new Date(iso).getTime()) / 60000)
  if (minutes < 1) return 'just now'
  if (minutes < 60) return `${plural(minutes, 'minute')} ago`
  return `${plural(Math.round(minutes / 60), 'hour')} ago`
}
