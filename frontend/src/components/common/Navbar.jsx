import { useState } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import Icon from './Icon.jsx'
import NotificationBell from './NotificationBell.jsx'
import Brand from '../ui/Brand'
import { homeFor, useAuth } from '../../context/AuthContext'
import { useFavorites } from '../../context/FavoritesContext'

// The one navbar for the public site and the Guest/Customer pages.
// Admin and Vendor pages have their own sidebars instead (see App.jsx).
export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false)
  const { user, logout } = useAuth()
  const { favorites } = useFavorites()
  const navigate = useNavigate()
  const isCustomer = user?.role === 'customer'
  const close = () => setMenuOpen(false)

  const links = [
    { label: 'Browse', to: '/customer', end: true },
    { label: 'Bazaar schedule', to: '/customer/schedule' },
    ...(isCustomer
      ? [
          { label: 'Favorites', to: '/customer/favorites', count: favorites.length },
          { label: 'My account', to: '/customer/account' },
        ]
      : []),
  ]

  const handleLogout = () => {
    logout()
    close()
    navigate('/')
  }

  return (
    <header className="site-header">
      <div className="announcement">
        <Icon name="sparkles" size={14} />
        <span>Discover local products, vendors, and bazaar dates.</span>
        <Link to="/customer">
          Explore Bazaar <span aria-hidden="true">→</span>
        </Link>
      </div>
      <div className="nav-wrap">
        <Brand onClick={close} />

        <nav className={`main-nav${menuOpen ? ' is-open' : ''}`} aria-label="Main navigation">
          {links.map((item) => (
            <NavLink key={item.to} to={item.to} end={item.end} onClick={close}>
              {item.label}
              {item.count > 0 && <span className="nav-count">{item.count}</span>}
            </NavLink>
          ))}
          {!user && (
            <a className="mobile-nav-link" href="/#for-makers" onClick={close}>
              For makers
            </a>
          )}
          <div className="mobile-nav-actions">
            {user ? (
              <>
                {user.role !== 'customer' && (
                  <NavLink to={homeFor(user)} onClick={close}>
                    {user.role === 'admin' ? 'Admin dashboard' : 'Vendor dashboard'}
                  </NavLink>
                )}
                {isCustomer && <span className="nav-greeting">Hi, {user.name.split(' ')[0]}</span>}
                <button className="button button-dark" type="button" onClick={handleLogout}>
                  Log out
                </button>
              </>
            ) : (
              <>
                <NavLink to="/login" onClick={close}>
                  Log in
                </NavLink>
                <Link className="button button-dark" to="/register" onClick={close}>
                  Create account <Icon name="arrow-up-right" size={16} />
                </Link>
              </>
            )}
          </div>
        </nav>

        <div className="nav-actions">
          {user ? (
            <>
              <NotificationBell />
              {isCustomer ? (
                <span className="nav-greeting">Hi, {user.name.split(' ')[0]}</span>
              ) : (
                // Admins and vendors browsing the public site get a way back to their dashboard.
                <NavLink className="login-link" to={homeFor(user)}>
                  {user.role === 'admin' ? 'Admin dashboard' : 'Vendor dashboard'}
                </NavLink>
              )}
              <button className="button button-dark nav-join" type="button" onClick={handleLogout}>
                Log out
              </button>
            </>
          ) : (
            <>
              <a className="maker-link" href="/#for-makers">
                For makers
              </a>
              <NavLink className="login-link" to="/login">
                Log in
              </NavLink>
              <Link className="button button-dark nav-join" to="/register">
                Create account <Icon name="arrow-up-right" size={16} />
              </Link>
            </>
          )}
        </div>

        {/* On phones the bell stays visible next to the menu button. */}
        {user && <NotificationBell className="mobile-bell" />}

        <button
          aria-label={menuOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={menuOpen}
          className="menu-toggle"
          onClick={() => setMenuOpen((open) => !open)}
          type="button"
        >
          <Icon name={menuOpen ? 'close' : 'menu'} size={22} />
        </button>
      </div>
    </header>
  )
}
