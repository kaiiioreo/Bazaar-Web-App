export default function StarRating({ rating, max = 5 }) {
  return (
    <span className="whitespace-nowrap text-amber-500" aria-label={`${rating} out of ${max} stars`}>
      {'★'.repeat(rating)}
      <span className="text-slate-300">{'★'.repeat(max - rating)}</span>
    </span>
  )
}