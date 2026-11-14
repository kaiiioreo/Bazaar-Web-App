import { formatDate } from './vendorHelpers'

// PreRegisterForBazaar() / UpdateVendorSchedule()
// events come from GET /api/vendor/events (with my_status and slot_label).
export default function SchedulePanel({ events, onPreRegister, onWithdraw }) {
  if (events.length === 0) {
    return <p className="text-stone-600">No upcoming bazaars yet. The Admin will announce new ones here.</p>
  }
  return (
    <ul className="max-w-2xl space-y-3">
      {events.map((ev) => (
        <li key={ev.event_id} className="flex flex-wrap items-center gap-4 rounded-lg border border-stone-200 bg-white p-4">
          <div className="w-14 rounded-md bg-teal-50 py-1.5 text-center text-teal-800">
            <p className="text-xs">{formatDate(ev.date, { month: 'short' })}</p>
            <p className="text-xl font-semibold leading-tight">{formatDate(ev.date, { day: 'numeric' })}</p>
          </div>
          <div className="flex-1">
            <p className="font-medium">{ev.name}</p>
            <p className="text-sm text-stone-500">
              {formatDate(ev.date, { weekday: 'short', month: 'short', day: 'numeric' })} at {ev.location}
            </p>
          </div>
          {ev.my_status === 'assigned' && (
            <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-800">Stall {ev.slot_label}</span>
          )}
          {ev.my_status === 'pre_registered' && (
            <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-medium text-amber-800">Pre-registered · waiting for stall</span>
          )}
          {ev.my_status ? (
            <button onClick={() => onWithdraw(ev)} className="rounded-md border border-stone-300 px-3 py-2 text-xs hover:bg-stone-100">
              Withdraw
            </button>
          ) : ev.registration_open ? (
            <button onClick={() => onPreRegister(ev.event_id)} className="rounded-md bg-stone-900 px-4 py-2 text-sm text-white hover:bg-stone-700">
              Pre-register
            </button>
          ) : (
            <span className="text-xs text-stone-500">Registration closed</span>
          )}
        </li>
      ))}
    </ul>
  )
}
