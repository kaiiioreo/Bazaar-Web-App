import { useState } from 'react';

// Star rating + comment form used for both SubmitReview() and EditReview().
export default function ReviewForm({ initial, onSubmit, onCancel, submitLabel = 'Post review' }) {
  const [rating, setRating] = useState(initial?.rating ?? 0);
  const [comment, setComment] = useState(initial?.comment ?? '');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!rating) return setError('Pick a star rating.');
    setBusy(true);
    setError('');
    try {
      await onSubmit(rating, comment.trim());
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="rounded-xl border border-stone-200 bg-white p-4">
      <fieldset>
        <legend className="text-sm font-medium text-stone-800">Your rating</legend>
        <div className="mt-1 flex gap-1">
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => setRating(n)}
              aria-label={`${n} star${n > 1 ? 's' : ''}`}
              aria-pressed={rating === n}
              className={`text-2xl leading-none ${n <= rating ? 'text-amber-500' : 'text-stone-300 hover:text-amber-300'}`}
            >
              ★
            </button>
          ))}
        </div>
      </fieldset>
      <label className="mt-3 block text-sm font-medium text-stone-800">
        Your review
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          required
          minLength={3}
          maxLength={1000}
          rows={3}
          placeholder="What did you buy? How was it?"
          className="mt-1 w-full rounded-lg border border-stone-300 px-3 py-2 text-sm font-normal outline-none focus:border-teal-800 focus:ring-2 focus:ring-teal-800/20"
        />
      </label>
      {error && <p className="mt-2 text-sm text-red-700" role="alert">{error}</p>}
      <div className="mt-3 flex gap-2">
        <button type="submit" disabled={busy} className="rounded-full bg-teal-900 px-5 py-2 text-sm font-semibold text-white hover:bg-teal-800 disabled:opacity-60">
          {busy ? 'Saving…' : submitLabel}
        </button>
        {onCancel && (
          <button type="button" onClick={onCancel} className="rounded-full border border-stone-300 px-5 py-2 text-sm text-stone-700 hover:border-stone-500">
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}
