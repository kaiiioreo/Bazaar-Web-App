import { useState } from 'react'
import { reviews as initialReviews } from '../../mock/reviews'
import StatusBadge from '../../components/common/StatusBadge'
import StarRating from '../../components/common/StarRating'
import ConfirmModal from '../../components/admin/ConfirmModal'

const tabs = [
  { key: 'flagged', label: 'Flagged by AI' },
  { key: 'all', label: 'All reviews' },
  { key: 'removed', label: 'Removed' },
]

export default function Reviews() {
  const [reviews, setReviews] = useState(initialReviews)
  const [tab, setTab] = useState('flagged')
  const [search, setSearch] = useState('')
  const [toRemove, setToRemove] = useState(null)
  const [notice, setNotice] = useState('')

  const inTab = (r, key) => {
    if (key === 'flagged') return r.status === 'visible' && r.ai_flag
    if (key === 'removed') return r.status === 'removed'
    return r.status === 'visible' // "all" shows reviews that are live
  }

  const countFor = (key) => reviews.filter((r) => inTab(r, key)).length

  const visible = reviews
    .filter((r) => inTab(r, tab))
    .filter((r) => {
      const q = search.toLowerCase()
      return (
        r.vendor_name.toLowerCase().includes(q) ||
        r.customer_name.toLowerCase().includes(q) ||
        r.comment.toLowerCase().includes(q)
      )
    })
    .sort((a, b) => b.created_at.localeCompare(a.created_at))

  const update = (id, changes) =>
    setReviews((prev) => prev.map((r) => (r.review_id === id ? { ...r, ...changes } : r)))

  const keepReview = (r) => {
    update(r.review_id, { ai_flag: false })
    setNotice(`The AI flag was dismissed. ${r.customer_name}'s review stays visible.`)
  }

  const restoreReview = (r) => {
    update(r.review_id, { status: 'visible' })
    setNotice(`${r.customer_name}'s review was restored.`)
  }

  const confirmRemove = () => {
    update(toRemove.review_id, { status: 'removed' })
    setNotice(`${toRemove.customer_name}'s review was removed from the public page.`)
    setToRemove(null)
  }

  const emptyMessage = {
    flagged: 'No reviews are waiting for moderation. Nice and quiet.',
    all: 'No reviews match your search.',
    removed: 'No removed reviews.',
  }

  return (
    <div>
      <h2 className="mb-6 text-2xl font-bold">Review Moderation</h2>

      {notice && (
        <div className="mb-4 flex items-center justify-between rounded border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800">
          <span>{notice}</span>
          <button
            onClick={() => setNotice('')}
            className="ml-4 text-lg leading-none hover:text-green-950"
            aria-label="Dismiss"
          >
            ×
          </button>
        </div>
      )}

      {/* Tabs + search */}
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <div className="flex flex-wrap gap-2">
          {tabs.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`rounded-full px-4 py-1.5 text-sm ${
                tab === t.key
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-slate-700 shadow hover:bg-slate-100'
              }`}
            >
              {t.label} ({countFor(t.key)})
            </button>
          ))}
        </div>
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search vendor, customer, or text..."
          className="w-full max-w-xs rounded border border-slate-300 bg-white px-3 py-2 text-sm"
        />
      </div>

      {/* Review cards */}
      <div className="space-y-4">
        {visible.length === 0 && (
          <div className="rounded-lg bg-white p-8 text-center text-slate-500 shadow">
            {search ? 'No reviews match your search.' : emptyMessage[tab]}
          </div>
        )}

        {visible.map((r) => (
          <div
            key={r.review_id}
            className={`rounded-lg bg-white p-5 shadow ${
              r.ai_flag && r.status === 'visible' ? 'border-l-4 border-amber-400' : ''
            }`}
          >
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div>
                <p className="font-semibold">{r.customer_name}</p>
                <p className="text-sm text-slate-500">
                  reviewed <span className="font-medium text-slate-700">{r.vendor_name}</span> ·{' '}
                  {r.created_at}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <StarRating rating={r.rating} />
                {r.status === 'removed' && <StatusBadge status="removed" />}
              </div>
            </div>

            <p className="mt-3 text-sm text-slate-700">{r.comment}</p>

            {r.ai_flag && r.status === 'visible' && (
              <div className="mt-3 rounded bg-amber-50 px-3 py-2 text-sm text-amber-900">
                <span className="font-medium">⚠ AI flagged:</span> {r.ai_flag_reason}
              </div>
            )}

            <div className="mt-4 flex flex-wrap justify-end gap-2">
              {r.status === 'removed' ? (
                <button
                  onClick={() => restoreReview(r)}
                  className="rounded border border-slate-300 px-3 py-1 text-sm hover:bg-slate-50"
                >
                  Restore
                </button>
              ) : (
                <>
                  {r.ai_flag && (
                    <button
                      onClick={() => keepReview(r)}
                      className="rounded border border-slate-300 px-3 py-1 text-sm hover:bg-slate-50"
                    >
                      Keep review
                    </button>
                  )}
                  <button
                    onClick={() => setToRemove(r)}
                    className="rounded bg-red-600 px-3 py-1 text-sm text-white hover:bg-red-700"
                  >
                    Remove
                  </button>
                </>
              )}
            </div>
          </div>
        ))}
      </div>

      <ConfirmModal
        open={!!toRemove}
        title="Remove this review?"
        confirmLabel="Remove review"
        confirmClass="bg-red-600 hover:bg-red-700"
        onConfirm={confirmRemove}
        onCancel={() => setToRemove(null)}
      >
        <p>
          The review by {toRemove?.customer_name} will be hidden from the vendor's page and from
          customers. You can restore it later from the Removed tab.
        </p>
      </ConfirmModal>
    </div>
  )
}