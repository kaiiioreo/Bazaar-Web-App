import { useState } from 'react'
import FadeImg from '../ui/FadeImg'

// Store logo, or the business initial when no logo is set (or it fails to load).
export default function Logo({ profile, size = 'h-8 w-8', text = 'text-sm' }) {
  // Remember which photo failed, so choosing a new photo tries again.
  const [failedSrc, setFailedSrc] = useState(null)
  const failed = failedSrc === profile.profile_image
  if (profile.profile_image && !failed) {
    return (
      <FadeImg
        src={profile.profile_image}
        alt={`${profile.business_name} logo`}
        onError={() => setFailedSrc(profile.profile_image)}
        className={`${size} rounded-full object-cover`}
      />
    )
  }
  return (
    <div
      className={`grid ${size} ${text} place-items-center rounded-full bg-brand font-semibold text-white`}
      aria-hidden="true"
    >
      {profile.business_name?.[0] ?? '?'}
    </div>
  )
}
