import { Link } from 'react-router-dom'
import Icon from '../common/Icon.jsx'

// The "bazaar." logo, used in every navbar and sidebar.
export default function Brand({ to = '/', suffix, onClick, className = '' }) {
  return (
    <Link className={`brand ${className}`} to={to} aria-label="Bazaar home" onClick={onClick}>
      <span className="brand-mark">
        <Icon name="leaf" size={21} />
      </span>
      <span>
        bazaar<span className="brand-period">.</span>
        {suffix && (
          <span className="ml-1.5 align-middle font-sans text-xs font-semibold uppercase tracking-wider text-muted">
            {suffix}
          </span>
        )}
      </span>
    </Link>
  )
}
