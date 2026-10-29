import { formatDate } from './vendorHelpers'

// PreRegisterForBazaar() / UpdateVendorSchedule()
export default function SchedulePanel({ events, registeredIds, onPreRegister }) {
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
          {registeredIds.includes(ev.event_id) ? (
            <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-800">Pre-registered</span>
          ) : (
            <button onClick={() => onPreRegister(ev.event_id)} className="rounded-md bg-stone-900 px-4 py-2 text-sm text-white hover:bg-stone-700">
              Pre-register
            </button>
          )}
        </li>
      ))}
    </ul>
  )
}
