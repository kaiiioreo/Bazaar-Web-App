import { useCallback, useEffect, useRef, useState } from 'react'

// Short confirmation that appears bottom-right and disappears after a few seconds.
// Use for quick inline actions (stock changed, product saved). For results the user
// must read, use <Notice> at the top of the page instead.
//   const [toast, showToast] = useToast()
//   showToast('Product added')         showToast('Could not save', 'error')
//   <Toast toast={toast} />
export default function useToast() {
  const [toast, setToast] = useState(null)
  const timer = useRef(null)
  const show = useCallback((text, tone = 'success') => {
    clearTimeout(timer.current)
    setToast({ text, tone })
    timer.current = setTimeout(() => setToast(null), 3000)
  }, [])
  useEffect(() => () => clearTimeout(timer.current), [])
  return [toast, show]
}
