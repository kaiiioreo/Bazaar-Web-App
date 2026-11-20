import Stars from '../ui/Stars'
import { formatDate } from '../../utils/format'

export default function ReviewCard({ review }) {
  return (
    <article className="rounded-xl border border-line bg-white p-4">
      <div className="flex items-center justify-between gap-2 text-sm">
        <p className="font-semibold text-ink">{review.author}</p>
        <p className="text-muted">{formatDate(review.date)}</p>
      </div>
      <Stars rating={review.rating} className="mt-1 block" />
      <p className="mt-2 text-sm text-ink">{review.comment}</p>
    </article>
  )
}
