import { useState } from 'react'
import { getReviews, updateReview } from '../../api/admin'
import useApi from '../../hooks/useApi'
import LoadState from '../../components/common/LoadState'
import PageHeader from '../../components/ui/PageHeader'
import FilterPills from '../../components/ui/FilterPills'
import SearchInput from '../../components/ui/SearchInput'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import Stars from '../../components/ui/Stars'
import { StatusBadge } from '../../components/ui/Badge'
import EmptyState from '../../components/ui/EmptyState'
import Notice from '../../components/ui/Notice'
import { ConfirmDialog } from '../../components/ui/Modal'
import { formatShortDate } from '../../utils/format'

const TABS = [
  { key: 'flagged', label: 'Flagged by AI' },
  { key: 'all', label: 'All reviews' },
  { key: 'removed', label: 'Removed' },
]

const EMPTY = {
  flagged: 'No reviews are waiting for moderation. Nice and quiet.',
  all: 'No reviews yet.',
  removed: 'No removed reviews.',
}

const inTab = (r, key) => {
  if (key === 'flagged') return r.status === 'visible' && r.ai_flag
  if (key === 'removed') return r.status === 'removed'
  return r.status === 'visible' // "all" shows reviews that are live
}

// Admin: remove inappropriate reviews and handle AI-flagged ones (SRS 3.1.2.7).
export default function Reviews() {
  const { data, loading, error, reload, setData: setReviews } = useApi(() => getReviews(), [])
  const reviews = data ?? []
  const [tab, setTab] = useState('flagged')
  const [search, setSearch] = useState('')
  const [toRemove, setToRemove] = useState(null)
  const [message, setMessage] = useState({ tone: 'success', text: '' })

  const q = search.trim().toLowerCase()
  const visible = reviews
    .filter((r) => inTab(r, tab))
    .filter((r) => [r.vendor_name, r.customer_name, r.comment].some((t) => t.toLowerCase().includes(q)))
    .sort((a, b) => b.created_at.localeCompare(a.created_at))

  // Saves a change on the server, then shows the returned review.
  const update = async (id, changes, success) => {
    try {
      const updated = await updateReview(id, changes)
      setReviews((prev) => prev.map((r) => (r.review_id === id ? updated : r)))
      setMessage({ tone: 'success', text: success })
    } catch (err) {
      setMessage({ tone: 'error', text: err.message })
    }
  }

  const confirmRemove = () => {
    const r = toRemove
    setToRemove(null)
    update(r.review_id, { status: 'removed' }, `${r.customer_name}'s review was removed from the public page.`)
  }

  return (
    <div>
      <PageHeader
        title="Review moderation"
        description="The AI flags reviews that look like spam, fake praise, or personal attacks. You decide what stays."
      />
      <Notice tone={message.tone} onClose={() => setMessage({ ...message, text: '' })}>
        {message.text}
      </Notice>

      <div className="mb-4 flex flex-wrap items-center gap-3">
        <FilterPills
          label="Review list"
          value={tab}
          onChange={setTab}
          options={TABS.map((t) => ({
            value: t.key,
            label: `${t.label} (${reviews.filter((r) => inTab(r, t.key)).length})`,
          }))}
        />
        <SearchInput value={search} onChange={setSearch} placeholder="Search vendor, customer, or text…" />
      </div>

      {loading || error ? (
        <LoadState loading={loading} error={error} onRetry={reload} />
      ) : visible.length === 0 ? (
        <EmptyState>{search ? 'No reviews match your search.' : EMPTY[tab]}</EmptyState>
      ) : (
        <div className="space-y-4">
          {visible.map((r) => {
            const flagged = r.ai_flag && r.status === 'visible'
            return (
              <Card key={r.review_id} className={flagged ? 'border-l-4 border-l-warning' : ''}>
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <p className="font-semibold text-ink">{r.customer_name}</p>
                    <p className="text-sm text-muted">
                      reviewed <span className="font-medium text-ink">{r.vendor_name}</span> ·{' '}
                      {formatShortDate(r.created_at)}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Stars rating={r.rating} />
                    {r.status === 'removed' && <StatusBadge status="removed" />}
                  </div>
                </div>

                <p className="mt-3 text-sm text-ink">{r.comment}</p>

                {flagged && (
                  <p className="mt-3 rounded-lg bg-warning-soft px-3 py-2 text-sm text-warning">
                    <span className="font-semibold">⚠ AI flagged:</span> {r.ai_flag_reason}
                  </p>
                )}

                <div className="mt-4 flex flex-wrap justify-end gap-2">
                  {r.status === 'removed' ? (
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() =>
                        update(r.review_id, { status: 'visible' }, `${r.customer_name}'s review was restored.`)
                      }
                    >
                      Restore
                    </Button>
                  ) : (
                    <>
                      {r.ai_flag && (
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() =>
                            update(
                              r.review_id,
                              { ai_flag: false },
                              `The AI flag was dismissed. ${r.customer_name}'s review stays visible.`,
                            )
                          }
                        >
                          Keep review
                        </Button>
                      )}
                      <Button size="sm" variant="danger" onClick={() => setToRemove(r)}>
                        Remove
                      </Button>
                    </>
                  )}
                </div>
              </Card>
            )
          })}
        </div>
      )}

      <ConfirmDialog
        open={!!toRemove}
        title="Remove this review?"
        confirmLabel="Remove review"
        tone="danger"
        onConfirm={confirmRemove}
        onCancel={() => setToRemove(null)}
      >
        <p>
          The review by {toRemove?.customer_name} will be hidden from the vendor’s page and from customers. You can
          restore it later from the Removed tab.
        </p>
      </ConfirmDialog>
    </div>
  )
}
