import { useCallback, useState } from 'react'

// An <img> that fades in when it has loaded instead of popping in. Same props as <img>.
// Images that fail to load are shown anyway, so the browser's alt text is never hidden.
export default function FadeImg({ className = '', onLoad, onError, ...props }) {
  const [loaded, setLoaded] = useState(false)
  // Images that were already in the browser cache can finish before React attaches onLoad.
  const ref = useCallback((node) => {
    if (node?.complete) setLoaded(true)
  }, [])
  const show = (handler) => (e) => {
    setLoaded(true)
    handler?.(e)
  }
  return (
    <img
      ref={ref}
      {...props}
      onLoad={show(onLoad)}
      onError={show(onError)}
      className={`fade-img ${loaded ? 'is-loaded' : ''} ${className}`.trim()}
    />
  )
}
