import { Outlet } from 'react-router-dom'
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
  return (
    <DashboardShell title="Admin" links={ADMIN_LINKS}>
      <Outlet />
    </DashboardShell>
  )
}
