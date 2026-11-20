// Striped stall canopy. The one decorative motif of the customer UI.
export default function Awning({ color = '#0f766e', className = 'h-3' }) {
  return (
    <div
      aria-hidden="true"
      className={`w-full ${className}`}
      style={{ backgroundImage: `repeating-linear-gradient(90deg, ${color} 0 14px, #ffffff 14px 28px)` }}
    />
  )
}
