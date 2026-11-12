import ScheduleCard from '../../components/customer/ScheduleCard';
import { events } from '../../mock/customerMock';

export default function Schedule() {
  return (
    <div className="py-8">
      <h1 className="text-3xl font-extrabold text-teal-950">Bazaar schedule</h1>
      <p className="mt-1 text-stone-600">Upcoming bazaars and the vendors who will be there.</p>
      <div className="mt-6 grid gap-5 md:grid-cols-2">
        {events.map((e) => <ScheduleCard key={e.id} event={e} />)}
      </div>
    </div>
  );
}
