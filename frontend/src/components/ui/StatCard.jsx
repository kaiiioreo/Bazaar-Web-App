import useCountUp from '../../hooks/useCountUp'

const TONES = { default: 'text-ink', warning: 'text-warning', danger: 'text-danger', success: 'text-success' }

// A number with a label. Pass onClick to make it a filter button (active = selected).
export default function StatCard({ label, value, hint, tone = 'default', onClick, active = false }) {
  const shown = useCountUp(value) // numbers count up from 0 when the dashboard opens
  const body = (
    <>
      <p className="text-sm text-muted">{label}</p>
      <p className={`mt-1 text-3xl font-bold ${TONES[tone]}`}>{shown}</p>
      {hint && <p className="mt-1 truncate text-xs text-muted">{hint}</p>}
    </>
  )
  const base = 'rounded-xl border bg-white p-5 text-left'
  if (!onClick) return <div className={`${base} border-line`}>{body}</div>
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`${base} transition ${active ? 'border-brand ring-1 ring-brand' : 'border-line hover:border-muted'}`}
    >
      {body}
    </button>
  )
}
