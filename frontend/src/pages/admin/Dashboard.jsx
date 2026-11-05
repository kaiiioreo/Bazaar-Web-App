import StatCard from '../../components/admin/StatCard'
import { adminStats, sentimentSummary } from '../../mock/adminStats'

export default function Dashboard() {
  return (
    <div>
      <h2 className="mb-6 text-2xl font-bold">Dashboard</h2>
      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Active Vendors" value={adminStats.activeVendors} />
        <StatCard label="Pending Applications" value={adminStats.pendingApplications} />
        <StatCard label="Registered Customers" value={adminStats.totalCustomers} />
        <StatCard label="Upcoming Events" value={adminStats.upcomingEvents} />
      </div>
      <div className="rounded-lg bg-white p-6 shadow">
        <h3 className="mb-2 font-semibold">Review Sentiment Summary</h3>
        <p className="text-slate-600">{sentimentSummary}</p>
      </div>
    </div>
  )
}