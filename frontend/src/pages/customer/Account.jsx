import { useState } from 'react'
import { Link } from 'react-router-dom'
import Stars from '../../components/ui/Stars'
import LoadState from '../../components/common/LoadState'
import { formatDate } from '../../utils/format'
import PageHeader from '../../components/ui/PageHeader'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import EmptyState from '../../components/ui/EmptyState'
import { inputClass, labelClass } from '../../components/ui/form'
import useApi from '../../hooks/useApi'
import { updateMe } from '../../api/auth'
import { getMyReviews } from '../../api/customer'
import { useAuth } from '../../context/AuthContext'

// Account & profile (SRS 3.1.3.3) plus the customer's own reviews.
export default function Account() {
  const { user, setUser } = useAuth()
  const reviews = useApi(() => getMyReviews(), [])
  const [form, setForm] = useState({ name: user.name, email: user.email, current_password: '', new_password: '' })
  const [msg, setMsg] = useState({ type: '', text: '' })
  const [busy, setBusy] = useState(false)
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value })

  const save = async (e) => {
    e.preventDefault()
    setBusy(true)
    setMsg({ type: '', text: '' })
    try {
      const body = { name: form.name, email: form.email }
      if (form.new_password)
        Object.assign(body, { current_password: form.current_password, new_password: form.new_password })
      const data = await updateMe(body)
      setUser(data.user)
      setForm((f) => ({ ...f, current_password: '', new_password: '' }))
      setMsg({ type: 'ok', text: 'Your account was updated.' })
    } catch (err) {
      setMsg({ type: 'error', text: err.message })
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="py-8">
      <PageHeader title="My account" description="Update your details and manage the reviews you’ve written." />
      <div className="grid gap-10 lg:grid-cols-2">
        <section>
          <h2 className="font-serif text-2xl text-brand">Profile</h2>
          <Card as="form" onSubmit={save} className="mt-4 space-y-4 p-6">
            <label className={labelClass}>
              Name
              <input required value={form.name} onChange={set('name')} className={inputClass} />
            </label>
            <label className={labelClass}>
              Email
              <input required type="email" value={form.email} onChange={set('email')} className={inputClass} />
            </label>
            <fieldset className="space-y-3 border-t border-line pt-4">
              <legend className="pt-4 text-sm font-semibold text-ink">Change password (optional)</legend>
              <label className={labelClass}>
                Current password
                <input
                  type="password"
                  autoComplete="current-password"
                  value={form.current_password}
                  onChange={set('current_password')}
                  className={inputClass}
                />
              </label>
              <label className={labelClass}>
                New password
                <input
                  type="password"
                  autoComplete="new-password"
                  minLength={8}
                  value={form.new_password}
                  onChange={set('new_password')}
                  placeholder="At least 8 characters with a number"
                  className={inputClass}
                />
              </label>
            </fieldset>
            {msg.text && (
              <p
                className={`text-sm ${msg.type === 'ok' ? 'text-success' : 'text-danger'}`}
                role={msg.type === 'ok' ? 'status' : 'alert'}
              >
                {msg.text}
              </p>
            )}
            <Button type="submit" disabled={busy}>
              {busy ? 'Saving…' : 'Save changes'}
            </Button>
          </Card>
        </section>

        <section>
          <h2 className="font-serif text-2xl text-brand">My reviews</h2>
          {reviews.loading || reviews.error ? (
            <LoadState loading={reviews.loading} error={reviews.error} onRetry={reviews.reload} />
          ) : reviews.data.length === 0 ? (
            <div className="mt-4">
              <EmptyState>You haven’t reviewed any vendors yet.</EmptyState>
            </div>
          ) : (
            <ul className="mt-4 space-y-3">
              {reviews.data.map((r) => (
                <li key={r.id} className="rounded-xl border border-line bg-white p-4">
                  <div className="flex items-center justify-between gap-2">
                    <Link to={`/customer/vendors/${r.vendorId}`} className="font-semibold text-brand hover:underline">
                      {r.vendorName}
                    </Link>
                    <span className="text-xs text-muted">{formatDate(r.date)}</span>
                  </div>
                  <Stars rating={r.rating} />
                  <p className={`mt-1 text-sm ${r.removed ? 'text-muted line-through' : 'text-ink'}`}>{r.comment}</p>
                  {r.removed && (
                    <p className="mt-2 text-xs text-danger">
                      An admin removed this review because it broke the review rules. You can write a new one.
                    </p>
                  )}
                  <Link
                    to={`/customer/vendors/${r.vendorId}`}
                    className="mt-2 inline-block text-xs text-brand underline"
                  >
                    {r.removed ? 'Write a new review' : 'Edit or delete'}
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  )
}
