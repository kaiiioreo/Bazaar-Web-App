import { useState } from 'react'
import AIAssistantPanel from './AIAssistantPanel'
import Card from '../ui/Card'
import Button from '../ui/Button'
import { inputClass, labelClass } from '../ui/form'
import { CATEGORIES } from '../../utils/constants'
import { formatShortDate } from '../../utils/format'

const STATUS_TEXT = {
  pending: [
    'Your application is being reviewed',
    'The Bazaar team will review your application soon. You will get a notification once it is approved.',
    'bg-warning-soft border-warning/40 text-warning',
  ],
  rejected: [
    'Your application was not approved',
    'You can update your details below and apply again.',
    'bg-danger-soft border-danger/30 text-danger',
  ],
}

// SubmitVendorApplication() + the AI assistant that helps write it (SRS 3.1.5.1, 3.1.6.3).
export default function ApplicationPanel({ application, onSubmit }) {
  const [form, setForm] = useState({
    business_name: application?.business_name ?? '',
    product_category: application?.product_category ?? CATEGORIES[0],
    business_details: application?.business_details ?? '',
  })
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value })
  const status = application?.status
  const canApply = !status || status === 'rejected'

  const submit = async (e) => {
    e.preventDefault()
    setBusy(true)
    setError('')
    try {
      await onSubmit(form)
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="grid gap-8 lg:grid-cols-2">
      <div className="space-y-4">
        {status && STATUS_TEXT[status] && (
          <div className={`rounded-xl border p-4 text-sm ${STATUS_TEXT[status][2]}`} role="status">
            <p className="font-semibold">{STATUS_TEXT[status][0]}</p>
            <p className="mt-1">{STATUS_TEXT[status][1]}</p>
            {status === 'rejected' && application.rejection_reason && (
              <p className="mt-2">
                <span className="font-medium">Reason:</span> {application.rejection_reason}
              </p>
            )}
          </div>
        )}

        {canApply ? (
          <Card as="form" onSubmit={submit} className="space-y-4 p-6">
            <div>
              <h2 className="text-lg font-semibold text-ink">Vendor application</h2>
              <p className="mt-1 text-sm text-muted">
                Tell the Admin about your business. Approved vendors can list products and join bazaars.
              </p>
            </div>
            <label className={labelClass}>
              Business name
              <input required value={form.business_name} onChange={set('business_name')} className={inputClass} />
            </label>
            <label className={labelClass}>
              Main product category
              <select value={form.product_category} onChange={set('product_category')} className={inputClass}>
                {CATEGORIES.map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
            </label>
            <label className={labelClass}>
              Business and product details
              <textarea
                required
                rows={5}
                value={form.business_details}
                onChange={set('business_details')}
                placeholder="What do you sell, your usual price range, and what makes it special?"
                className={inputClass}
              />
            </label>
            {error && (
              <p className="text-sm text-danger" role="alert">
                {error}
              </p>
            )}
            <Button type="submit" disabled={busy}>
              {busy ? 'Submitting…' : status === 'rejected' ? 'Apply again' : 'Submit application'}
            </Button>
          </Card>
        ) : (
          <Card className="p-6 text-sm">
            <p className="font-semibold">{application.business_name}</p>
            <p className="text-muted">
              {application.product_category} · submitted {formatShortDate(application.submitted_at)}
            </p>
            <p className="mt-3 whitespace-pre-line text-ink">{application.business_details}</p>
          </Card>
        )}
      </div>

      <div>
        <h2 className="mb-2 text-lg font-semibold text-ink">Need help writing it?</h2>
        <AIAssistantPanel greeting="Hi! Tell me about your business and I can help you write a clear application." />
      </div>
    </div>
  )
}
