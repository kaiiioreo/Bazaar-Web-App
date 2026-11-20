import { Link, NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const links = [
  { to: '/customer', label: 'Browse', end: true },
  { to: '/customer/schedule', label: 'Schedule' },
  { to: '/customer/favorites', label: 'Favorites', customerOnly: true },
  { to: '/customer/account', label: 'My account', customerOnly: true },
];

export default function CustomerNav({ favoriteCount = 0 }) {
  const { user } = useAuth();
  const isCustomer = user?.role === 'customer';

  return (
    <header className="sticky top-0 z-20 border-b border-stone-200 bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-6 gap-y-2 px-4 py-3">
        <Link to="/customer" className="text-xl font-extrabold tracking-tight text-teal-900">Bazaar</Link>
        <nav aria-label="Main" className="flex gap-1 text-sm">
          {links.filter((l) => !l.customerOnly || isCustomer).map((l) => (
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
          {user ? (
            <span className="text-sm text-stone-600">Hi, {user.name.split(' ')[0]}</span>
          ) : (
            <>
              <Link to="/login" className="rounded-full px-4 py-2 text-sm font-medium text-teal-900 hover:bg-stone-100">Log in</Link>
              <Link to="/register" className="rounded-full bg-teal-900 px-4 py-2 text-sm font-medium text-white hover:bg-teal-800">Sign up</Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
