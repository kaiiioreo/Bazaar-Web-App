import { NavLink, Outlet } from 'react-router-dom'

const links = [
  { to: '/admin', label: 'Dashboard', end: true },
  { to: '/admin/applications', label: 'Vendor Applications' },
  { to: '/admin/vendors', label: 'Vendor Management' },
  { to: '/admin/users', label: 'User Management' },
  { to: '/admin/events', label: 'Bazaar Events' },
  { to: '/admin/slots', label: 'Slot Management' },
  { to: '/admin/reviews', label: 'Review Moderation' },
]

export default function AdminLayout() {
  return (
    <div className="flex min-h-screen bg-slate-50">
      <aside className="w-64 bg-slate-900 p-4 text-white">
        <h1 className="mb-6 text-xl font-bold">Bazaar Admin</h1>
        <nav className="flex flex-col gap-1">
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.end}
              className={({ isActive }) =>
                `rounded px-3 py-2 text-sm ${isActive ? 'bg-blue-600' : 'hover:bg-slate-800'}`
              }
            >
              {l.label}
            </NavLink>
          ))}
        </nav>
      </aside>
      <main className="flex-1 p-8">
        <Outlet />
      </main>
    </div>
  )
}