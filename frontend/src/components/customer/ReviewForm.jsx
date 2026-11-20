import { useState } from 'react'
import Button from '../ui/Button'
import { inputClass, labelClass } from '../ui/form'

// Star rating + comment form used for both SubmitReview() and EditReview().
export default function ReviewForm({ initial, onSubmit, onCancel, submitLabel = 'Post review' }) {
  const [rating, setRating] = useState(initial?.rating ?? 0)
  const [comment, setComment] = useState(initial?.comment ?? '')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!rating) return setError('Pick a star rating.')
    setBusy(true)
    setError('')
    try {
      await onSubmit(rating, comment.trim())
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-xl border border-line bg-white p-4">
      <fieldset>
        <legend className="text-sm font-medium text-ink">Your rating</legend>
        <div className="mt-1 flex gap-1">
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => setRating(n)}
              aria-label={`${n} star${n > 1 ? 's' : ''}`}
              aria-pressed={rating === n}
              className={`text-2xl leading-none ${n <= rating ? 'text-amber-500' : 'text-line hover:text-amber-300'}`}
            >
              ★
            </button>
          ))}
        </div>
      </fieldset>
      <label className={`${labelClass} mt-3`}>
        Your review
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          required
          minLength={3}
          maxLength={1000}
          rows={3}
          placeholder="What did you buy? How was it?"
          className={`${inputClass} font-normal`}
        />
      </label>
      {error && (
        <p className="mt-2 text-sm text-danger" role="alert">
          {error}
        </p>
      )}
      <div className="mt-3 flex gap-2">
        <Button type="submit" disabled={busy}>
          {busy ? 'Saving…' : submitLabel}
        </Button>
        {onCancel && (
          <Button variant="secondary" onClick={onCancel}>
            Cancel
          </Button>
        )}
      </div>
    </form>
  )
}
