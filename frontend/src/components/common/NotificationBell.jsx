import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { getNotifications, markAllRead, markRead } from '../../api/notifications'
import { useAuth } from '../../context/AuthContext'

// Bell icon with a dropdown list of in-app notifications (any logged-in role).
export default function NotificationBell({ className = '' }) {
  const { user } = useAuth()
  const [open, setOpen] = useState(false)
  const [data, setData] = useState({ unread: 0, items: [] })
  const box = useRef(null)

  useEffect(() => {
    if (!user) return undefined
    let active = true
    const load = () => getNotifications().then((d) => active && setData(d)).catch(() => {})
    load()
    const timer = setInterval(load, 60000) // check for new ones every minute
    return () => {
      active = false
      clearInterval(timer)
    }
  }, [user])

  useEffect(() => {
    if (!open) return undefined
    const close = (e) => box.current && !box.current.contains(e.target) && setOpen(false)
    document.addEventListener('mousedown', close)
    return () => document.removeEventListener('mousedown', close)
  }, [open])

  if (!user) return null

  const readOne = (n) => {
    if (n.is_read) return
    markRead(n.notification_id).catch(() => {})
    setData((d) => ({
      unread: Math.max(0, d.unread - 1),
      items: d.items.map((x) => (x.notification_id === n.notification_id ? { ...x, is_read: true } : x)),
    }))
  }
  const readAll = () => {
    markAllRead().catch(() => {})
    setData((d) => ({ unread: 0, items: d.items.map((x) => ({ ...x, is_read: true })) }))
  }

  return (
    <div className={`relative ${className}`} ref={box}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-label={`Notifications${data.unread ? ` (${data.unread} unread)` : ''}`}
        aria-expanded={open}
        className="relative rounded-full p-2 text-lg leading-none text-stone-600 hover:bg-stone-100"
      >
        <span aria-hidden="true">🔔</span>
        {data.unread > 0 && (
          <span className="absolute -right-0.5 -top-0.5 grid h-5 min-w-5 place-items-center rounded-full bg-rose-600 px-1 text-[11px] font-semibold text-white">
            {data.unread}
          </span>
        )}
      </button>
      {open && (
        <div className="absolute right-0 z-50 mt-2 w-80 max-w-[90vw] overflow-hidden rounded-xl border border-stone-200 bg-white text-left text-stone-800 shadow-xl">
          <div className="flex items-center justify-between border-b border-stone-100 px-4 py-2.5">
            <p className="text-sm font-semibold">Notifications</p>
            {data.unread > 0 && (
              <button type="button" onClick={readAll} className="text-xs text-teal-800 hover:underline">
                Mark all as read
              </button>
            )}
          </div>
          <ul className="max-h-96 overflow-y-auto">
            {data.items.length === 0 && <li className="px-4 py-6 text-center text-sm text-stone-500">No notifications yet.</li>}
            {data.items.map((n) => {
              const body = (
                <>
                  <p className="text-sm">{n.message}</p>
                  <p className="mt-0.5 text-xs text-stone-500">{new Date(n.created_at).toLocaleString('en-PH', { dateStyle: 'medium', timeStyle: 'short' })}</p>
                </>
              )
              const cls = `block px-4 py-3 hover:bg-stone-50 ${n.is_read ? '' : 'bg-amber-50'}`
              return (
                <li key={n.notification_id} className="border-b border-stone-100 last:border-0">
                  {n.link ? (
                    <Link to={n.link} className={cls} onClick={() => { readOne(n); setOpen(false) }}>{body}</Link>
                  ) : (
                    <button type="button" className={`${cls} w-full text-left`} onClick={() => readOne(n)}>{body}</button>
                  )}
                </li>
              )
            })}
          </ul>
        </div>
      )}
    </div>
  )
}
