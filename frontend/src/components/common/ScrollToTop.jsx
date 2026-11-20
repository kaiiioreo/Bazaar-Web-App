import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

// Opens each new page at the top. (React Router keeps the old scroll position otherwise.)
// Links with a #section still jump to that section.
export default function ScrollToTop() {
  const { pathname, hash } = useLocation()
  useEffect(() => {
    if (!hash) window.scrollTo(0, 0)
  }, [pathname, hash])
  return null
}
