import { useState } from 'react'

const today = new Date().toISOString().slice(0, 10)

export default function EventFormModal({ mode, initial, onSave, onClose }) {
  const [form, setForm] = useState({
    name: initial?.name ?? '',
    date: initial?.date ?? '',
    location: initial?.location ?? '',
    total_slots: initial?.total_slots ?? 10,
  })
  const [errors, setErrors] = useState({})

  const update = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }))

  const validate = () => {
    const e = {}
    if (!form.name.trim()) e.name = 'Event name is required.'
    if (!form.date) e.date = 'Date is required.'
    else if (mode === 'create' && form.date < today) e.date = 'Date cannot be in the past.'
    if (!form.location.trim()) e.location = 'Location is required.'
    const slots = Number(form.total_slots)
    if (!Number.isInteger(slots) || slots < 1) e.total_slots = 'Enter a whole number of at least 1.'
    return e
  }

  const handleSubmit = () => {
    const e = validate()
    setErrors(e)
    if (Object.keys(e).length > 0) return
    onSave({
      name: form.name.trim(),
      date: form.date,
      location: form.location.trim(),
      total_slots: Number(form.total_slots),
    })
  }

  const inputClass = 'w-full rounded border border-slate-300 px-3 py-2 text-sm'

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
        <h3 className="mb-4 text-lg font-semibold">
          {mode === 'create' ? 'Create bazaar event' : 'Edit bazaar event'}
        </h3>

        <div className="space-y-4 text-sm">
          <div>
            <label className="mb-1 block font-medium">Event name</label>
            <input value={form.name} onChange={update('name')} className={inputClass} />
            {errors.name && <p className="mt-1 text-red-600">{errors.name}</p>}
          </div>

          <div>
            <label className="mb-1 block font-medium">Date</label>
            <input type="date" value={form.date} onChange={update('date')} className={inputClass} />
            {errors.date && <p className="mt-1 text-red-600">{errors.date}</p>}
          </div>

          <div>
            <label className="mb-1 block font-medium">Location</label>
            <input value={form.location} onChange={update('location')} className={inputClass} />
            {errors.location && <p className="mt-1 text-red-600">{errors.location}</p>}
          </div>

          <div>
            <label className="mb-1 block font-medium">Number of stalls</label>
            <input
              type="number"
              min="1"
              value={form.total_slots}
              onChange={update('total_slots')}
              className={inputClass}
            />
            {errors.total_slots && <p className="mt-1 text-red-600">{errors.total_slots}</p>}
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-2">
          <button
            onClick={onClose}
            className="rounded border border-slate-300 px-4 py-2 text-sm hover:bg-slate-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="rounded bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            {mode === 'create' ? 'Create event' : 'Save changes'}
          </button>
        </div>
      </div>
    </div>
  )
}