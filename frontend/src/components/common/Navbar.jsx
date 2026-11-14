import { useState } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import Icon from './Icon.jsx'
import NotificationBell from './NotificationBell.jsx'
import { homeFor, useAuth } from '../../context/AuthContext'

const navItems = [
  { label: 'Browse', href: '/customer' },
  { label: 'Vendors', href: '/customer#vendors-heading' },
  { label: 'Bazaar schedule', href: '/customer/schedule' },
]

const dashboardLabel = { admin: 'Admin dashboard', vendor: 'Vendor dashboard', customer: 'My account' }

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false)
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const dashboardPath = user?.role === 'customer' ? '/customer/account' : homeFor(user)

  const handleLogout = () => {
    logout()
    setMenuOpen(false)
    navigate('/')
  }

  return (
    <header className="site-header">
      <div className="announcement">
        <Icon name="sparkles" size={14} />
        <span>Discover local products, vendors, and bazaar dates.</span>
        <a href="/#discover">Explore Bazaar <span aria-hidden="true">→</span></a>
      </div>
      <div className="nav-wrap">
        <Link className="brand" to="/" aria-label="Bazaar home" onClick={() => setMenuOpen(false)}>
          <span className="brand-mark"><Icon name="leaf" size={21} /></span>
          <span>bazaar<span className="brand-period">.</span></span>
        </Link>

        <nav className={`main-nav${menuOpen ? ' is-open' : ''}`} aria-label="Main navigation">
          {navItems.map((item) => (
            <Link key={item.label} to={item.href} onClick={() => setMenuOpen(false)}>
              {item.label}
            </Link>
          ))}
          <a className="mobile-nav-link" href="/#for-makers" onClick={() => setMenuOpen(false)}>
            For makers
          </a>
          <div className="mobile-nav-actions">
            {user ? (
              <>
                <NavLink to={dashboardPath} onClick={() => setMenuOpen(false)}>{dashboardLabel[user.role]}</NavLink>
                <button className="button button-dark" type="button" onClick={handleLogout}>Log out</button>
              </>
            ) : (
              <>
                <NavLink to="/login" onClick={() => setMenuOpen(false)}>Log in</NavLink>
                <Link className="button button-dark" to="/register" onClick={() => setMenuOpen(false)}>
                  Create account <Icon name="arrow-up-right" size={16} />
                </Link>
              </>
            )}
          </div>
        </nav>

        <div className="nav-actions">
          <a className="maker-link" href="/#for-makers">For makers</a>
          {user ? (
            <>
              <NotificationBell />
              <NavLink className="login-link" to={dashboardPath}>{dashboardLabel[user.role]}</NavLink>
              <button className="button button-dark nav-join" type="button" onClick={handleLogout}>
                Log out
              </button>
            </>
          ) : (
            <>
              <NavLink className="login-link" to="/login">Log in</NavLink>
              <Link className="button button-dark nav-join" to="/register">
                Create account <Icon name="arrow-up-right" size={16} />
              </Link>
            </>
          )}
        </div>

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
