import { useState } from 'react'
import { CATEGORIES } from './vendorHelpers'
import AIAssistantPanel from './AIAssistantPanel'

const field = 'mt-1 w-full rounded-md border border-stone-300 px-3 py-2 text-sm focus:border-teal-600 focus:outline-none focus:ring-1 focus:ring-teal-600'

const STATUS_TEXT = {
  pending: ['Your application is being reviewed', 'The Bazaar team will review your application soon. You will get a notification once it is approved.', 'bg-amber-50 border-amber-200 text-amber-900'],
  rejected: ['Your application was not approved', 'You can update your details below and apply again.', 'bg-red-50 border-red-200 text-red-900'],
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
          <div className={`rounded-lg border p-4 text-sm ${STATUS_TEXT[status][2]}`} role="status">
            <p className="font-semibold">{STATUS_TEXT[status][0]}</p>
            <p className="mt-1">{STATUS_TEXT[status][1]}</p>
            {status === 'rejected' && application.rejection_reason && (
              <p className="mt-2"><span className="font-medium">Reason:</span> {application.rejection_reason}</p>
            )}
          </div>
        )}

        {canApply ? (
          <form onSubmit={submit} className="space-y-4 rounded-lg border border-stone-200 bg-white p-6">
            <div>
              <h2 className="text-lg font-semibold">Vendor application</h2>
              <p className="mt-1 text-sm text-stone-500">Tell the Admin about your business. Approved vendors can list products and join bazaars.</p>
            </div>
            <label className="block text-sm">Business name
              <input required value={form.business_name} onChange={set('business_name')} className={field} />
            </label>
            <label className="block text-sm">Main product category
              <select value={form.product_category} onChange={set('product_category')} className={field}>
                {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
              </select>
            </label>
            <label className="block text-sm">Business and product details
              <textarea
                required
                rows={5}
                value={form.business_details}
                onChange={set('business_details')}
                placeholder="What do you sell, your usual price range, and what makes it special?"
                className={field}
              />
            </label>
            {error && <p className="text-sm text-red-700" role="alert">{error}</p>}
            <button type="submit" disabled={busy} className="rounded-md bg-stone-900 px-4 py-2 text-sm text-white hover:bg-stone-700 disabled:opacity-60">
              {busy ? 'Submitting…' : status === 'rejected' ? 'Apply again' : 'Submit application'}
            </button>
          </form>
        ) : (
          <div className="rounded-lg border border-stone-200 bg-white p-6 text-sm">
            <p className="font-semibold">{application.business_name}</p>
            <p className="text-stone-500">{application.product_category} · submitted {application.submitted_at}</p>
            <p className="mt-3 whitespace-pre-line text-stone-700">{application.business_details}</p>
          </div>
        )}
      </div>

      <div>
        <h2 className="mb-2 text-lg font-semibold">Need help writing it?</h2>
        <AIAssistantPanel
          greeting="Hi! Tell me about your business and I can help you write a clear application."
        />
      </div>
    </div>
  )
}
