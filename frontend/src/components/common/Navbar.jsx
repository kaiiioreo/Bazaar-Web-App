import { useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import Icon from './Icon.jsx'

const navItems = [
  { label: 'Browse', href: '/#discover' },
  { label: 'Vendors', href: '/#stalls' },
  { label: 'Bazaar schedule', href: '/#events' },
]

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false)

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
            <a key={item.label} href={item.href} onClick={() => setMenuOpen(false)}>
              {item.label}
            </a>
          ))}
          <a className="mobile-nav-link" href="/#for-makers" onClick={() => setMenuOpen(false)}>
            For makers
          </a>
          <div className="mobile-nav-actions">
            <NavLink to="/login" onClick={() => setMenuOpen(false)}>Log in</NavLink>
            <Link className="button button-dark" to="/register" onClick={() => setMenuOpen(false)}>
              Create account <Icon name="arrow-up-right" size={16} />
            </Link>
          </div>
        </nav>

        <div className="nav-actions">
          <a className="maker-link" href="/#for-makers">For makers</a>
          <NavLink className="login-link" to="/login">Log in</NavLink>
          <Link className="button button-dark nav-join" to="/register">
            Create account <Icon name="arrow-up-right" size={16} />
          </Link>
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
