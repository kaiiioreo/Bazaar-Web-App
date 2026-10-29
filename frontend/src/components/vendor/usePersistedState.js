import { useState, useEffect } from 'react'

// Like useState, but remembers the value in this browser so it survives a refresh.
// Temporary until the backend exists.
export default function usePersistedState(key, initial) {
  const [value, setValue] = useState(() => {
    try {
      const saved = localStorage.getItem(key)
      return saved ? JSON.parse(saved) : initial
    } catch {
      return initial
    }
  })
  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(value))
    } catch {
      // Storage full or blocked: keep working without saving.
    }
  }, [key, value])
  return [value, setValue]
}
