import { STOCK } from '../../utils/constants'

const TONES = {
  neutral: 'bg-cream text-muted',
  brand: 'bg-brand-soft text-brand',
  success: 'bg-success-soft text-success',
  warning: 'bg-warning-soft text-warning',
  danger: 'bg-danger-soft text-danger',
}

// Which colour each status word gets, everywhere in the app.
const STATUS_TONE = {
  pending: 'warning',
  approved: 'success',
  rejected: 'danger',
  active: 'success',
  suspended: 'warning',
  deactivated: 'danger',
  upcoming: 'brand',
  ongoing: 'success',
  completed: 'neutral',
  cancelled: 'danger',
  visible: 'success',
  removed: 'danger',
  pre_registered: 'warning',
  assigned: 'success',
}

export default function Badge({ tone = 'neutral', children, className = '' }) {
  return (
    <span
      className={`inline-flex shrink-0 items-center whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-semibold ${TONES[tone]} ${className}`}
    >
      {children}
    </span>
  )
}

// <StatusBadge status="pending" /> -> a yellow "Pending" pill
export function StatusBadge({ status }) {
  const label = String(status).replace(/_/g, ' ')
  return (
    <Badge tone={STATUS_TONE[status] ?? 'neutral'} className="capitalize">
      {label}
    </Badge>
  )
}

// <StockBadge stock="low_stock" /> -> an amber "Low stock" pill
export function StockBadge({ stock }) {
  const s = STOCK[stock] ?? STOCK.in_stock
  return <Badge tone={s.tone}>{s.label}</Badge>
}
