import ScheduleCard from '../../components/customer/ScheduleCard'
import LoadState from '../../components/common/LoadState'
import PageHeader from '../../components/ui/PageHeader'
import EmptyState from '../../components/ui/EmptyState'
import useApi from '../../hooks/useApi'
import { getEvents } from '../../api/catalog'

// Bazaar schedule: which vendors attend which date and location (SRS 3.1.3.5, 3.1.4.2).
export default function Schedule() {
  const { data: events, loading, error, reload } = useApi(() => getEvents(), [])

  return (
    <div className="py-8">
      <PageHeader title="Bazaar schedule" description="Upcoming bazaars and the vendors who will be there." />
      {loading || error ? (
        <LoadState loading={loading} error={error} onRetry={reload} />
      ) : events.length === 0 ? (
        <EmptyState>No upcoming bazaars yet. Check back soon.</EmptyState>
      ) : (
        <div className="grid gap-5 md:grid-cols-2 stagger">
          {events.map((e) => (
            <ScheduleCard key={e.id} event={e} />
          ))}
        </div>
      )}
    </div>
  )
}
