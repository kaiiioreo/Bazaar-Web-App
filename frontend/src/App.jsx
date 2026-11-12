import { BrowserRouter, Route, Routes } from 'react-router-dom'
import ChatbotWidget from './components/common/ChatbotWidget.jsx'
import Navbar from './components/common/Navbar.jsx'
import AuthPage from './pages/AuthPage.jsx'
import HomePage from './pages/HomePage.jsx'
import NotFoundPage from './pages/NotFoundPage.jsx'
import CustomerLayout from './layouts/CustomerLayout'
import CustomerHome from './pages/customer/CustomerHome'
import SearchResults from './pages/customer/SearchResults'
import VendorProfile from './pages/customer/VendorProfile'
import Schedule from './pages/customer/Schedule'
import Favorites from './pages/customer/Favorites'
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
  return (
    <BrowserRouter>
      <div className="app-shell">
        <Navbar />
        <main>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<AuthPage mode="login" />} />
            <Route path="/register" element={<AuthPage mode="register" />} />
            <Route path="/forgot-password" element={<AuthPage mode="forgot" />} />
            <Route path="*" element={<NotFoundPage />} />
            <Route path="/customer" element={<CustomerLayout />}>
            <Route index element={<CustomerHome />} />
            <Route path="search" element={<SearchResults />} />
            <Route path="vendors/:id" element={<VendorProfile />} />
            <Route path="schedule" element={<Schedule />} />
            <Route path="favorites" element={<Favorites />} />
            <Route path="/vendor" element={<VendorDashboard />} />
            <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="applications" element={<Applications />} />
            <Route path="vendors" element={<Vendors />} />
            <Route path="users" element={<Users />} />
            <Route path="events" element={<Events />} />
            <Route path="slots" element={<Slots />} />
            <Route path="reviews" element={<Reviews />} />
            </Route>
            </Route>
          </Routes>
        </main>
        <ChatbotWidget />
      </div>
    </BrowserRouter>
  )
}
