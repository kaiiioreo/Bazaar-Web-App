import { useEffect, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import Modal from '../ui/Modal'
import Button from '../ui/Button'
import { IDLE_MINUTES, IDLE_MS, WARN_MS, lastActive, markActive } from '../../utils/idle'

const ACTIVITY = ['mousemove', 'mousedown', 'keydown', 'wheel', 'scroll', 'touchstart']

const clock = (ms) => {
  const s = Math.max(0, Math.ceil(ms / 1000))
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`
}

// Logs a signed-in user out after IDLE_MINUTES without any activity (SRS 3.5.1),
// with a "Still there?" warning shortly before. Guests are not affected.
export default function IdleLogout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const [remaining, setRemaining] = useState(null) // ms left while the warning is showing, else null
  const warning = remaining !== null
  const warningRef = useRef(false)
  const pathRef = useRef(pathname)

  useEffect(() => {
    pathRef.current = pathname
  }, [pathname])
  useEffect(() => {
    warningRef.current = warning
  }, [warning])

  useEffect(() => {
    if (!user) return undefined
    if (!lastActive()) markActive()

    // Any activity resets the timer (written at most every 5 seconds).
    // While the warning is open, only a click or key press counts, so a stray mouse move doesn't hide it.
    let lastWrite = 0
    const onActivity = (e) => {
      if (warningRef.current && (e.type === 'mousemove' || e.type === 'scroll' || e.type === 'wheel')) return
      const now = Date.now()
      if (now - lastWrite > 5000 || warningRef.current) {
        lastWrite = now
        markActive()
      }
    }
    ACTIVITY.forEach((ev) => window.addEventListener(ev, onActivity, { passive: true }))

    const tick = () => {
      const left = IDLE_MS - (Date.now() - lastActive())
      if (left <= 0) {
        setRemaining(null)
        const back = pathRef.current
        logout({ reason: 'idle' })
        // Members-only pages redirect to the login page by themselves (ProtectedRoute, with "next").
        // On public pages, send the user to the login page here so they still see why they were logged out.
        setTimeout(() => {
          if (window.location.pathname.startsWith('/login')) return
          const next = back !== '/' ? `&next=${encodeURIComponent(back)}` : ''
          navigate(`/login?reason=idle${next}`, { replace: true })
        }, 0)
      } else {
        setRemaining(left <= WARN_MS ? left : null)
      }
    }
    const first = setTimeout(tick, 0) // also catches a tab reopened long after its last use
    const timer = setInterval(tick, 1000)
    return () => {
      clearTimeout(first)
      clearInterval(timer)
      ACTIVITY.forEach((ev) => window.removeEventListener(ev, onActivity))
    }
  }, [user, logout, navigate])

  if (!user || !warning) return null

  const stay = () => {
    markActive()
    setRemaining(null)
  }
  const leaveNow = () => {
    setRemaining(null)
    logout()
  }

  return (
    <Modal
      title="Still there?"
      onClose={stay}
      footer={
        <>
          <Button variant="secondary" onClick={leaveNow}>
            Log out now
          </Button>
          <Button onClick={stay} autoFocus>
            Stay logged in
          </Button>
        </>
      }
    >
      <p>
        For your security, you'll be logged out in{' '}
        <strong className="text-ink tabular-nums" aria-live="polite">
          {clock(remaining)}
        </strong>{' '}
        because there has been no activity for {IDLE_MINUTES - Math.round(WARN_MS / 60000)} minutes.
      </p>
    </Modal>
  )
}
