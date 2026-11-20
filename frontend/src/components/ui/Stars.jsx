// Read-only star rating: <Stars rating={4} />
export default function Stars({ rating, className = '' }) {
  return (
    <span
      className={`whitespace-nowrap text-amber-500 ${className}`}
      role="img"
      aria-label={`${rating} out of 5 stars`}
    >
      {'★'.repeat(rating)}
      <span className="text-line">{'★'.repeat(5 - rating)}</span>
    </span>
  )
}
