import { Link } from 'react-router-dom';
import Awning from './Awning';
import formatDate from './formatDate';
import { getVendor } from '../../mock/customerMock';

export default function ScheduleCard({ event }) {
  const filled = event.vendorIds.length;
  return (
    <article className="overflow-hidden rounded-xl border border-stone-200 bg-white">
      <Awning color="#0f766e" />
      <div className="p-5">
        <p className="text-sm font-medium text-teal-800">{formatDate(event.date)}</p>
        <h3 className="mt-1 text-xl font-bold text-teal-950">{event.name}</h3>
        <p className="text-sm text-stone-600">{event.location}</p>
        <p className="mt-4 text-sm text-stone-700">{filled} of {event.totalStalls} stalls filled</p>
        <div className="mt-1 h-2 overflow-hidden rounded-full bg-stone-200">
          <div className="h-full bg-amber-400" style={{ width: `${(filled / event.totalStalls) * 100}%` }} />
        </div>
        <p className="mt-4 text-sm font-medium text-stone-800">Vendors attending</p>
        <ul className="mt-2 flex flex-wrap gap-2">
          {event.vendorIds.map((id) => {
            const v = getVendor(id);
            return v && (
              <li key={id}>
                <Link to={`/customer/vendors/${id}`} className="rounded-full border border-stone-300 px-3 py-1 text-sm text-stone-700 hover:border-teal-800 hover:text-teal-900">
                  {v.name}
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </article>
  );
}
