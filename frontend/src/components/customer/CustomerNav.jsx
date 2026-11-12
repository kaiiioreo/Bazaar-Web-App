import { Link, NavLink } from 'react-router-dom';

const links = [
  { to: '/customer', label: 'Browse', end: true },
  { to: '/customer/schedule', label: 'Schedule' },
  { to: '/customer/favorites', label: 'Favorites' },
];

export default function CustomerNav({ favoriteCount = 0 }) {
  return (
    <header className="sticky top-0 z-20 border-b border-stone-200 bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-6 gap-y-2 px-4 py-3">
        <Link to="/customer" className="text-xl font-extrabold tracking-tight text-teal-900">Bazaar</Link>
        <nav aria-label="Main" className="flex gap-1 text-sm">
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.end}
              className={({ isActive }) =>
                `rounded-full px-3 py-1.5 font-medium ${isActive ? 'bg-amber-300 text-teal-950' : 'text-stone-600 hover:bg-stone-100'}`
              }
            >
              {l.label}
              {l.label === 'Favorites' && favoriteCount > 0 && <span className="ml-1.5 text-rose-600">{favoriteCount}</span>}
            </NavLink>
          ))}
        </nav>
        <div className="ml-auto flex items-center gap-2">
          <button type="button" className="rounded-full px-4 py-2 text-sm font-medium text-teal-900 hover:bg-stone-100">Log in</button>
          <button type="button" className="rounded-full bg-teal-900 px-4 py-2 text-sm font-medium text-white hover:bg-teal-800">Sign up</button>
        </div>
      </div>
    </header>
  );
}
