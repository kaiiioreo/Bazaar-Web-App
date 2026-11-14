import { Navigate, useLocation } from 'react-router-dom'
import { homeFor, useAuth } from '../../context/AuthContext'

// <ProtectedRoute roles={['admin']}><AdminLayout /></ProtectedRoute>
export default function ProtectedRoute({ roles, children }) {
  const { user, loading } = useAuth()
  const location = useLocation()

  if (loading) return <p className="p-8 text-center text-stone-500">Loading…</p>
  if (!user) return <Navigate to={`/login?next=${encodeURIComponent(location.pathname)}`} replace />
  if (roles && !roles.includes(user.role)) return <Navigate to={homeFor(user)} replace />
  return children
}
