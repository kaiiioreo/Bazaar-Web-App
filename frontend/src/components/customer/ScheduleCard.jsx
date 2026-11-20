import { Link } from 'react-router-dom'
import Awning from './Awning'
import { formatLongDate } from '../../utils/format'

// One upcoming bazaar with its stall count and the vendors attending.
export default function ScheduleCard({ event }) {
  const filled = event.vendors.length
  return (
    <article className="overflow-hidden rounded-xl border border-line bg-white">
      <Awning color="#293f32" />
      <div className="p-5">
        <p className="text-sm font-semibold text-accent">{formatLongDate(event.date)}</p>
        <h3 className="mt-1 font-serif text-2xl text-brand">{event.name}</h3>
        <p className="text-sm text-muted">{event.location}</p>
        <p className="mt-4 text-sm text-ink">
          {filled} of {event.totalStalls} stalls filled
        </p>
        <div
          className="mt-1 h-2 overflow-hidden rounded-full bg-cream"
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={event.totalStalls}
          aria-valuenow={filled}
          aria-label="Stalls filled"
        >
          <div
            className="h-full bg-accent"
            style={{ width: `${Math.min(100, (filled / event.totalStalls) * 100)}%` }}
          />
        </div>
        <p className="mt-4 text-sm font-semibold text-ink">Vendors attending</p>
        {filled === 0 ? (
          <p className="mt-2 text-sm text-muted">Stalls have not been assigned yet.</p>
        ) : (
          <ul className="mt-2 flex flex-wrap gap-2">
            {event.vendors.map((v) => (
              <li key={v.id}>
                <Link
                  to={`/customer/vendors/${v.id}`}
                  className="inline-block rounded-full border border-line px-3 py-1 text-sm text-ink hover:border-brand hover:text-brand"
                >
                  {v.name}
                  {v.slot && <span className="ml-1 text-muted">· {v.slot}</span>}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </article>
  )
}
