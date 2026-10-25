import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import AdminLayout from './layouts/AdminLayout'
import Dashboard from './pages/admin/Dashboard'
import Applications from './pages/admin/Applications'
import Vendors from './pages/admin/Vendors'
import Users from './pages/admin/Users'
import Events from './pages/admin/Events'
import Slots from './pages/admin/Slots'
import Reviews from './pages/admin/Reviews'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* temporary redirect until the shared home page exists */}
        <Route path="/" element={<Navigate to="/admin" replace />} />
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="applications" element={<Applications />} />
          <Route path="vendors" element={<Vendors />} />
          <Route path="users" element={<Users />} />
          <Route path="events" element={<Events />} />
          <Route path="slots" element={<Slots />} />
          <Route path="reviews" element={<Reviews />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}