// Auto logout after inactivity (SRS 3.5.1).
// Change the time here. For a live demo you can also set VITE_IDLE_MINUTES=1 in frontend/.env.
export const IDLE_MINUTES = Number(import.meta.env.VITE_IDLE_MINUTES) || 15
export const IDLE_MS = IDLE_MINUTES * 60 * 1000
// The "Still there?" warning appears this long before logout (2 minutes, or half the time if shorter).
export const WARN_MS = Math.min(2 * 60 * 1000, IDLE_MS / 2)

// The last activity time is shared by all open tabs, so working in one tab keeps the others logged in.
const KEY = 'bazaar.lastActive'

export function markActive() {
  try {
    localStorage.setItem(KEY, String(Date.now()))
  } catch {
    // Storage blocked: each tab keeps its own timer.
  }
}

export function lastActive() {
  try {
    return Number(localStorage.getItem(KEY)) || 0
  } catch {
    return 0
  }
}
