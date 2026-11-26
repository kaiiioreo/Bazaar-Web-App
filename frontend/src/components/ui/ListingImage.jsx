import { useState } from 'react'
import FadeImg from './FadeImg'
import { categoryStyle } from '../../utils/categoryStyle'

// Pictures for product and vendor listings (SRS 3.2.1: every listing shows a picture).
// If there is no photo, or it fails to load, a soft placeholder with a category icon is shown instead.

// Simple line icons (24x24, drawn with the current text color).
const ICONS = {
  bowl: 'M3 11h18a9 9 0 0 1-18 0Zm5-4c0-1.5 1-2 1-3m3 3c0-1.5 1-2 1-3m3 3c0-1.5 1-2 1-3',
  cookie: 'M12 3a9 9 0 1 0 9 9 3 3 0 0 1-3-3 3 3 0 0 1-3-3 3 3 0 0 1-3-3Zm-3 7h.01M8 15h.01M13 16h.01M15 12h.01',
  cup: 'M4 8h13v5a6 6 0 0 1-6 6h-1a6 6 0 0 1-6-6V8Zm13 2h1.5a2.5 2.5 0 0 1 0 5H17M8 3v2m4-2v2',
  leaf: 'M5 19C5 10 10 5 20 4c-1 10-6 15-15 15Zm0 0 7-7',
  cake: 'M4 21h16v-8H4v8Zm0-4c2 0 2 1.5 4 1.5S10 17 12 17s2 1.5 4 1.5 2-1.5 4-1.5M12 13V9m0-3.5c-.8 0-1.3-.6-1.3-1.3C10.7 3.3 12 2 12 2s1.3 1.3 1.3 2.2c0 .7-.5 1.3-1.3 1.3Z',
  basket: 'M3 10h18l-2 10H5L3 10Zm4 0 4-6m6 6-4-6M9 14v3m3-3v3m3-3v3',
  bag: 'M5 8h14l-1 13H6L5 8Zm4 0V6a3 3 0 0 1 6 0v2',
  shirt: 'M8 3 3 6l2 4 2-1v12h10V9l2 1 2-4-5-3a4 4 0 0 1-8 0Z',
  home: 'M3 11 12 4l9 7M5 10v10h14V10M10 20v-5h4v5',
  tag: 'M3 12V4h8l10 10-8 8L3 12Zm5-4h.01',
}

function Placeholder({ category, label, round = false, className = '', iconSize = 36 }) {
  const { icon, soft: bg, color: fg } = categoryStyle(category)
  return (
    <div
      role="img"
      aria-label={label}
      className={`flex flex-col items-center justify-center gap-1 ${round ? 'rounded-full' : ''} ${className}`}
      style={{ backgroundColor: bg, color: fg }}
    >
      <svg
        width={iconSize}
        height={iconSize}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
        className="opacity-80"
      >
        <path d={ICONS[icon]} />
      </svg>
    </div>
  )
}

// Product photo, or a placeholder for its category.
//   <ProductImage src={product.image} name={product.name} category={product.category} className="h-36 w-full" />
export function ProductImage({ src, name, category, className = '', iconSize = 36, loading }) {
  // Remember which photo failed, so choosing a new photo tries again.
  const [failedSrc, setFailedSrc] = useState(null)
  const failed = failedSrc === src
  if (!src || failed) {
    return (
      <Placeholder category={category} label={`${name} (no photo yet)`} className={className} iconSize={iconSize} />
    )
  }
  return (
    <FadeImg
      src={src}
      alt={name}
      loading={loading}
      onError={() => setFailedSrc(src)}
      className={`object-cover ${className}`}
    />
  )
}

// Round vendor logo/photo, or a placeholder for the vendor's category.
export function VendorAvatar({ src, name, category, className = 'h-12 w-12', iconSize = 22 }) {
  // Remember which photo failed, so choosing a new photo tries again.
  const [failedSrc, setFailedSrc] = useState(null)
  const failed = failedSrc === src
  if (!src || failed) {
    return <Placeholder round category={category} label={`${name} logo`} className={className} iconSize={iconSize} />
  }
  return (
    <FadeImg
      src={src}
      alt={`${name} logo`}
      onError={() => setFailedSrc(src)}
      className={`rounded-full object-cover ${className}`}
    />
  )
}
