import { Route, Routes, useLocation } from 'react-router-dom'
import ChatbotWidget from './components/common/ChatbotWidget.jsx'
import Navbar from './components/common/Navbar.jsx'
import ProtectedRoute from './components/common/ProtectedRoute.jsx'
import ScrollToTop from './components/common/ScrollToTop.jsx'
import AuthPage from './pages/AuthPage.jsx'
import HomePage from './pages/HomePage.jsx'
import NotFoundPage from './pages/NotFoundPage.jsx'
import CustomerLayout from './layouts/CustomerLayout'
import CustomerHome from './pages/customer/CustomerHome'
import SearchResults from './pages/customer/SearchResults'
import VendorProfile from './pages/customer/VendorProfile'
import Schedule from './pages/customer/Schedule'
import Favorites from './pages/customer/Favorites'
import Account from './pages/customer/Account'
import AdminLayout from './layouts/AdminLayout'
import Dashboard from './pages/admin/Dashboard'
import Applications from './pages/admin/Applications'
import Vendors from './pages/admin/Vendors'
import Users from './pages/admin/Users'
import Events from './pages/admin/Events'
import Slots from './pages/admin/Slots'
import Reviews from './pages/admin/Reviews'
import VendorDashboard from './pages/vendor/VendorDashboard'
import './App.css'

export default function App() {
  const { pathname } = useLocation()
  // Admin and Vendor dashboards have their own sidebars, so the public navbar is hidden there.
  // The chatbot is for guests and customers (SRS 3.1.6.2); vendors have their own assistant.
  const isDashboard = pathname.startsWith('/admin') || pathname.startsWith('/vendor')

  return (
    <div className="app-shell">
      <ScrollToTop />
      {!isDashboard && <Navbar />}
      <main>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<AuthPage mode="login" />} />
          <Route path="/register" element={<AuthPage mode="register" />} />
          <Route path="/forgot-password" element={<AuthPage mode="forgot" />} />
          <Route path="/reset-password" element={<AuthPage mode="reset" />} />

          {/* Customer Routes: guests can browse; favorites and account need a customer login */}
          <Route path="/customer" element={<CustomerLayout />}>
            <Route index element={<CustomerHome />} />
            <Route path="search" element={<SearchResults />} />
            <Route path="vendors/:id" element={<VendorProfile />} />
            <Route path="schedule" element={<Schedule />} />
            <Route
              path="favorites"
              element={
                <ProtectedRoute roles={['customer']}>
                  <Favorites />
                </ProtectedRoute>
              }
            />
            <Route
              path="account"
              element={
                <ProtectedRoute roles={['customer']}>
                  <Account />
                </ProtectedRoute>
              }
            />
          </Route>

          {/* Vendor Routes: /vendor/products, /vendor/schedule, /vendor/profile, /vendor/assistant */}
          <Route
            path="/vendor"
            element={
              <ProtectedRoute roles={['vendor']}>
                <VendorDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/vendor/:tab"
            element={
              <ProtectedRoute roles={['vendor']}>
                <VendorDashboard />
              </ProtectedRoute>
            }
          />

          {/* Admin Routes */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute roles={['admin']}>
                <AdminLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Dashboard />} />
            <Route path="applications" element={<Applications />} />
            <Route path="vendors" element={<Vendors />} />
            <Route path="users" element={<Users />} />
            <Route path="events" element={<Events />} />
            <Route path="slots" element={<Slots />} />
            <Route path="reviews" element={<Reviews />} />
          </Route>

          {/* 404 Catch-all */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </main>
      {!isDashboard && <ChatbotWidget />}
    </div>
  )
}
