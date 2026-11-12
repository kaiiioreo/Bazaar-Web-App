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
          </Route>
          </Routes>
        </main>
        <ChatbotWidget />
      </div>
    </BrowserRouter>
  )
}
