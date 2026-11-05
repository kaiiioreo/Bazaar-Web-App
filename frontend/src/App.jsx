import { Routes, Route } from 'react-router-dom'
import CustomerLayout from './layouts/CustomerLayout'
import CustomerHome from './pages/customer/CustomerHome'
import SearchResults from './pages/customer/SearchResults'
import VendorProfile from './pages/customer/VendorProfile'
import Schedule from './pages/customer/Schedule'
import Favorites from './pages/customer/Favorites'

export default function App() {
  return (
    <Routes>
      {/* Existing test page */}
      <Route
        path="/"
        element={
          <h1 className="text-3xl font-bold text-blue-600">
            Tailwind is working
          </h1>
        }
      />

      {/* Customer routes */}
      <Route path="/customer" element={<CustomerLayout />}>
        <Route index element={<CustomerHome />} />
        <Route path="search" element={<SearchResults />} />
        <Route path="vendors/:id" element={<VendorProfile />} />
        <Route path="schedule" element={<Schedule />} />
        <Route path="favorites" element={<Favorites />} />
      </Route>
    </Routes>
  )
}