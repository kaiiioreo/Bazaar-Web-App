import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import VendorDashboard from './pages/vendor/VendorDashboard'


export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* 2. Update the temporary root redirect or keep it as is */}
        <Route path="/" element={<Navigate to="/vendor" replace />} />
        {/* 3. Add your Vendor Route here */}
        <Route path="/vendor" element={<VendorDashboard />} />

      </Routes>
    </BrowserRouter>
  )
}
