import formatDate from './formatDate';

export default function ReviewCard({ review }) {
  return (
    <article className="rounded-xl border border-stone-200 bg-white p-4">
      <div className="flex items-center justify-between text-sm">
        <p className="font-semibold text-stone-800">{review.author}</p>
        <p className="text-stone-500">{formatDate(review.date)}</p>
      </div>
      <p className="mt-1 text-amber-500" aria-label={`${review.rating} out of 5 stars`}>
        {'★'.repeat(review.rating)}
        <span className="text-stone-300">{'★'.repeat(5 - review.rating)}</span>
      </p>
      <p className="mt-2 text-sm text-stone-700">{review.comment}</p>
    </article>
  );
}
