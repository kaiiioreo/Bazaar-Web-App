import { Outlet, useLocation } from 'react-router-dom'
import DashboardShell from '../components/common/DashboardShell'

const ADMIN_LINKS = [
  { to: '/admin', label: 'Dashboard', end: true },
  { to: '/admin/applications', label: 'Vendor Applications' },
  { to: '/admin/vendors', label: 'Vendor Management' },
  { to: '/admin/users', label: 'User Management' },
  { to: '/admin/events', label: 'Bazaar Events' },
  { to: '/admin/slots', label: 'Slot Management' },
  { to: '/admin/reviews', label: 'Review Moderation' },
]

// Page shell for every /admin page.
export default function AdminLayout() {
  const { pathname } = useLocation()
  return (
    <DashboardShell title="Admin" links={ADMIN_LINKS}>
      {/* key restarts the gentle fade on each page change (opacity only, see index.css) */}
      <div key={pathname} className="animate-page-in">
        <Outlet />
      </div>
    </DashboardShell>
  )
}
