// Store logo, or the business initial when no logo is set.
export default function Logo({ profile, size = 'h-8 w-8', text = 'text-sm' }) {
  if (profile.profile_image) {
    return (
      <img
        src={profile.profile_image}
        alt={`${profile.business_name} logo`}
        className={`${size} rounded-full object-cover`}
      />
    )
  }
  return (
    <div
      className={`grid ${size} ${text} place-items-center rounded-full bg-brand font-semibold text-white`}
      aria-hidden="true"
    >
      {profile.business_name[0]}
    </div>
  )
}
