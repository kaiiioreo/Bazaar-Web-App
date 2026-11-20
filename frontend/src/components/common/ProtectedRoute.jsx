import { Navigate, useLocation } from 'react-router-dom'
import { homeFor, useAuth } from '../../context/AuthContext'

// <ProtectedRoute roles={['admin']}><AdminLayout /></ProtectedRoute>
export default function ProtectedRoute({ roles, children }) {
  const { user, loading, loggedOut } = useAuth()
  const location = useLocation()

  if (loading) return <p className="p-8 text-center text-muted">Loading…</p>
  // After clicking Log out, go home instead of the login page.
  if (!user && loggedOut) return <Navigate to="/" replace />
  if (!user) return <Navigate to={`/login?next=${encodeURIComponent(location.pathname)}`} replace />
  if (roles && !roles.includes(user.role)) return <Navigate to={homeFor(user)} replace />
  return children
}
