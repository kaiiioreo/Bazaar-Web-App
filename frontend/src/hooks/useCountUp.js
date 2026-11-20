import { useEffect, useRef, useState } from 'react'

const reduceMotion = () =>
  typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches

// Animates a number from its previous value (0 at first) to `target`, e.g. 0 -> 24 in about half a second.
// Keeps the same number of decimal places as the target (4.1 counts as 0.0, 0.1 ... 4.1).
// Anything that isn't a number is returned unchanged.
export default function useCountUp(target, duration = 600) {
  const isNumber = typeof target === 'number' && Number.isFinite(target)
  const [shown, setShown] = useState(isNumber && !reduceMotion() ? 0 : target)
  const from = useRef(0)

  useEffect(() => {
    if (!isNumber) return
    const start = from.current
    if (start === target || reduceMotion()) {
      from.current = target
      const id = requestAnimationFrame(() => setShown(target))
      return () => cancelAnimationFrame(id)
    }
    const decimals = (String(target).split('.')[1] || '').length
    const t0 = performance.now()
    let id
    const tick = (now) => {
      const p = Math.min(1, (now - t0) / duration)
      const eased = 1 - Math.pow(1 - p, 3) // ease-out: fast start, gentle finish
      const value = start + (target - start) * eased
      setShown(p < 1 ? Number(value.toFixed(decimals)) : target)
      from.current = p < 1 ? value : target
      if (p < 1) id = requestAnimationFrame(tick)
    }
    id = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(id)
  }, [target, duration, isNumber])

  return isNumber ? shown : target
}
