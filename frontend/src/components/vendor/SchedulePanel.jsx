import Card from '../ui/Card'
import Button from '../ui/Button'
import Badge from '../ui/Badge'
import EmptyState from '../ui/EmptyState'
import { formatDate } from '../../utils/format'

// PreRegisterForBazaar() / UpdateVendorSchedule()
// events come from GET /api/vendor/events (each with my_status and slot_label).
export default function SchedulePanel({ events, onPreRegister, onWithdraw }) {
  if (events.length === 0)
    return <EmptyState>No upcoming bazaars yet. The Admin will announce new ones here.</EmptyState>

  return (
    <ul className="max-w-3xl space-y-3">
      {events.map((ev) => (
        <Card as="li" key={ev.event_id} className="flex flex-wrap items-center gap-4 p-4">
          <div className="w-14 rounded-lg bg-brand-soft py-1.5 text-center text-brand">
            <p className="text-xs uppercase">{formatDate(ev.date, { month: 'short' })}</p>
            <p className="text-xl font-bold leading-tight">{formatDate(ev.date, { day: 'numeric' })}</p>
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-semibold text-ink">{ev.name}</p>
            <p className="text-sm text-muted">
              {formatDate(ev.date)} at {ev.location}
            </p>
          </div>
          {ev.my_status === 'assigned' && <Badge tone="success">Stall {ev.slot_label}</Badge>}
          {ev.my_status === 'pre_registered' && <Badge tone="warning">Pre-registered · waiting for stall</Badge>}
          {ev.my_status ? (
            <Button size="sm" variant="secondary" onClick={() => onWithdraw(ev)}>
              Withdraw
            </Button>
          ) : ev.registration_open ? (
            <Button size="sm" onClick={() => onPreRegister(ev.event_id)}>
              Pre-register
            </Button>
          ) : (
            <span className="text-xs text-muted">Registration closed</span>
          )}
        </Card>
      ))}
    </ul>
  )
}
