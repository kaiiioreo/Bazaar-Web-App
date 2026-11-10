import { BrowserRouter, Route, Routes } from 'react-router-dom'
import ChatbotWidget from './components/common/ChatbotWidget.jsx'
import Navbar from './components/common/Navbar.jsx'
import AuthPage from './pages/AuthPage.jsx'
import HomePage from './pages/HomePage.jsx'
import NotFoundPage from './pages/NotFoundPage.jsx'
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
          </Routes>
        </main>
        <ChatbotWidget />
      </div>
    </BrowserRouter>
  )
}
