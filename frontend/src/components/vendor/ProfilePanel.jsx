import { useState } from 'react'
import Logo from './Logo'
import Card from '../ui/Card'
import Button from '../ui/Button'
import { inputClass, labelClass } from '../ui/form'
import { readImage } from './imageUtils'
import { CATEGORIES } from '../../utils/constants'

// UpdateVendorProfile(): the vendor's public shop details.
export default function ProfilePanel({ profile, onSave }) {
  const [form, setForm] = useState(profile)
  const [status, setStatus] = useState({ tone: '', text: '' })
  const [busy, setBusy] = useState(false)

  const set = (k) => (e) => {
    setForm({ ...form, [k]: e.target.value })
    setStatus({ tone: '', text: '' })
  }
  const onLogo = async (e) => {
    const file = e.target.files[0]
    if (file) setForm({ ...form, profile_image: await readImage(file, 256) })
  }
  const submit = async (e) => {
    e.preventDefault()
    setBusy(true)
    try {
      await onSave(form)
      setStatus({ tone: 'ok', text: 'Profile saved' })
    } catch (err) {
      setStatus({ tone: 'error', text: err.message })
    } finally {
      setBusy(false)
    }
  }

  return (
    <Card as="form" onSubmit={submit} className="max-w-xl space-y-4 p-6">
      <div className="flex items-center gap-4">
        <Logo profile={form} size="h-16 w-16" text="text-2xl" />
        <div className="text-sm">
          <label className={labelClass}>
            Store logo
            <input type="file" accept="image/*" onChange={onLogo} className="mt-1 block text-xs text-muted" />
          </label>
          {form.profile_image && (
            <button
              type="button"
              onClick={() => setForm({ ...form, profile_image: '' })}
              className="mt-1 text-xs text-danger hover:underline"
            >
              Remove logo
            </button>
          )}
        </div>
      </div>
      <label className={labelClass}>
        Business name
        <input required value={form.business_name} onChange={set('business_name')} className={inputClass} />
      </label>
      <label className={labelClass}>
        Category
        <select value={form.category} onChange={set('category')} className={inputClass}>
          {CATEGORIES.map((c) => (
            <option key={c}>{c}</option>
          ))}
        </select>
      </label>
      <label className={labelClass}>
        Description
        <textarea rows={4} value={form.description} onChange={set('description')} className={inputClass} />
      </label>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className={labelClass}>
          Contact email
          <input type="email" value={form.contact_info} onChange={set('contact_info')} className={inputClass} />
        </label>
        <label className={labelClass}>
          Contact number
          <input
            type="tel"
            inputMode="tel"
            value={form.contact_phone ?? ''}
            onChange={set('contact_phone')}
            placeholder="0917 123 4567"
            pattern="[0-9+\s()\-]{7,20}"
            title="Use numbers only, for example 0917 123 4567 or +63 917 123 4567"
            className={inputClass}
          />
        </label>
      </div>
      <div className="flex items-center gap-3">
        <Button type="submit" disabled={busy}>
          {busy ? 'Saving…' : 'Save changes'}
        </Button>
        {status.text && (
          <span
            className={`text-sm ${status.tone === 'ok' ? 'text-success' : 'text-danger'}`}
            role={status.tone === 'ok' ? 'status' : 'alert'}
          >
            {status.text}
          </span>
        )}
      </div>
    </Card>
  )
}
