import { useState } from 'react'
import Logo from './Logo'
import { readImage } from './imageUtils'

const field = 'mt-1 w-full rounded-md border border-stone-300 px-3 py-2 text-sm focus:border-teal-600 focus:outline-none focus:ring-1 focus:ring-teal-600'

// UpdateVendorProfile()
export default function ProfilePanel({ profile, onSave }) {
  const [form, setForm] = useState(profile)
  const [saved, setSaved] = useState(false)
  const set = (k) => (e) => { setForm({ ...form, [k]: e.target.value }); setSaved(false) }
  const onLogo = async (e) => {
    const file = e.target.files[0]
    if (file) { setForm({ ...form, profile_image: await readImage(file, 256) }); setSaved(false) }
  }

  return (
    <form
      onSubmit={(e) => { e.preventDefault(); onSave(form); setSaved(true) }}
      className="max-w-lg space-y-4 rounded-lg border border-stone-200 bg-white p-6"
    >
      <div className="flex items-center gap-4">
        <Logo profile={form} size="h-16 w-16" text="text-2xl" />
        <div className="text-sm">
          <label>Store logo
            <input type="file" accept="image/*" onChange={onLogo} className="mt-1 block text-xs" />
          </label>
          {form.profile_image && (
            <button type="button" onClick={() => { setForm({ ...form, profile_image: '' }); setSaved(false) }} className="mt-1 text-xs text-red-700 hover:underline">
              Remove logo
            </button>
          )}
        </div>
      </div>
      <label className="block text-sm">Business name
        <input required value={form.business_name} onChange={set('business_name')} className={field} />
      </label>
      <label className="block text-sm">Description
        <textarea rows={4} value={form.description} onChange={set('description')} className={field} />
      </label>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block text-sm">Contact email
          <input type="email" value={form.contact_info} onChange={set('contact_info')} className={field} />
        </label>
        <label className="block text-sm">Contact number
          <input
            type="tel"
            inputMode="tel"
            value={form.contact_phone ?? ''}
            onChange={set('contact_phone')}
            placeholder="0917 123 4567"
            pattern="[0-9+\s()\-]{7,20}"
            title="Use numbers only, for example 0917 123 4567 or +63 917 123 4567"
            className={field}
          />
        </label>
      </div>
      <div className="flex items-center gap-3">
        <button type="submit" className="rounded-md bg-stone-900 px-4 py-2 text-sm text-white hover:bg-stone-700">Save changes</button>
        {saved && <span className="text-sm text-green-700" role="status">Profile saved</span>}
      </div>
    </form>
  )
}
