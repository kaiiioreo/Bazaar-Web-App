import { useState } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import Brand from '../ui/Brand'
import NotificationBell from './NotificationBell'
import { useAuth } from '../../context/AuthContext'

// The one navigation for the Admin and Vendor dashboards (they have no top navbar).
// Each role passes its own links, so the same sidebar adapts to whoever is logged in:
//   <DashboardShell title="Admin" links={[{ to: '/admin', label: 'Dashboard', end: true }, ...]}>…</DashboardShell>
// On phones it becomes a top bar with a ☰ button that slides the menu out.
export default function DashboardShell({ title, links, footer, children }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)
  const close = () => setMenuOpen(false)

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  return (
    <div className="min-h-screen bg-paper text-ink md:flex">
      {/* Phone top bar */}
      <header className="sticky top-0 z-30 flex items-center gap-2 border-b border-line bg-paper px-4 py-3 md:hidden">
        <button
          type="button"
          onClick={() => setMenuOpen((o) => !o)}
          aria-label={menuOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={menuOpen}
          className="rounded-lg border border-line px-2.5 py-1 text-lg leading-none text-brand"
        >
          {menuOpen ? '✕' : '☰'}
        </button>
        <Brand suffix={title} />
        <NotificationBell className="ml-auto" />
      </header>

      {menuOpen && (
        <div className="fixed inset-0 z-30 animate-fade-in bg-black/30 md:hidden" onClick={close} aria-hidden="true" />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r border-line bg-paper p-4 transition-transform md:sticky md:top-0 md:h-screen md:translate-x-0 ${
          menuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="mb-6 flex items-center justify-between gap-2">
          <Brand suffix={title} onClick={close} />
          <NotificationBell className="hidden md:block" align="left" />
        </div>

        <p className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-muted">Menu</p>
        <nav aria-label={`${title} navigation`} className="flex flex-col gap-1">
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.end}
              onClick={close}
              className={({ isActive }) =>
                `flex items-center rounded-lg border-l-4 px-3 py-2.5 text-base transition ${
                  isActive
                    ? 'border-brand bg-brand-soft font-bold text-brand'
                    : 'border-transparent font-medium text-ink hover:bg-cream hover:text-brand'
                }`
              }
            >
              {l.label}
            </NavLink>
          ))}
        </nav>

        <div className="mt-auto space-y-1 border-t border-line pt-4 text-base">
          {footer}
          <Link to="/" className="block rounded-lg px-3 py-2 font-medium text-ink hover:bg-cream hover:text-brand">
            View public site ↗
          </Link>
          <p className="truncate px-3 pt-1 text-sm text-muted">Signed in as {user?.name}</p>
          <button
            type="button"
            onClick={handleLogout}
            className="w-full rounded-lg px-3 py-2 text-left font-medium text-ink hover:bg-cream hover:text-brand"
          >
            Log out
          </button>
        </div>
      </aside>

      <main className="min-w-0 flex-1 p-4 md:p-8">{children}</main>
    </div>
  )
}
