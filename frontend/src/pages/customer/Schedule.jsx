import ScheduleCard from '../../components/customer/ScheduleCard';
import LoadState from '../../components/common/LoadState';
import useApi from '../../hooks/useApi';
import { getEvents } from '../../api/catalog';

export default function Schedule() {
  const { data: events, loading, error, reload } = useApi(() => getEvents(), []);

  return (
    <div className="py-8">
      <h1 className="text-3xl font-extrabold text-teal-950">Bazaar schedule</h1>
      <p className="mt-1 text-stone-600">Upcoming bazaars and the vendors who will be there.</p>
      {loading || error ? (
        <LoadState loading={loading} error={error} onRetry={reload} />
      ) : events.length === 0 ? (
        <p className="mt-6 text-stone-600">No upcoming bazaars yet. Check back soon.</p>
      ) : (
        <div className="mt-6 grid gap-5 md:grid-cols-2">
          {events.map((e) => <ScheduleCard key={e.id} event={e} />)}
        </div>
      )}
    </div>
  );
}
