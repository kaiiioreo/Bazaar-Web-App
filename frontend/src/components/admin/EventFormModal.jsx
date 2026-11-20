import { useState } from 'react'
import Modal from '../ui/Modal'
import Button from '../ui/Button'
import { inputClass, labelClass } from '../ui/form'

const today = new Date().toISOString().slice(0, 10)

// Create or edit a bazaar event (CreateBazaarEvent / EditBazaarEvent).
// onSave receives { name, date, location, total_slots }.
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

  const handleSubmit = (event) => {
    event.preventDefault()
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

  const error = (field) => errors[field] && <p className="mt-1 text-xs font-normal text-danger">{errors[field]}</p>

  return (
    <Modal title={mode === 'create' ? 'Create bazaar event' : 'Edit bazaar event'} onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <label className={labelClass}>
          Event name
          <input value={form.name} onChange={update('name')} className={inputClass} />
          {error('name')}
        </label>
        <label className={labelClass}>
          Date
          <input type="date" value={form.date} onChange={update('date')} className={inputClass} />
          {error('date')}
        </label>
        <label className={labelClass}>
          Location
          <input
            value={form.location}
            onChange={update('location')}
            placeholder="e.g. Plaza Independencia, Cebu City"
            className={inputClass}
          />
          {error('location')}
        </label>
        <label className={labelClass}>
          Number of stalls
          <input
            type="number"
            min="1"
            value={form.total_slots}
            onChange={update('total_slots')}
            className={inputClass}
          />
          {error('total_slots')}
        </label>
        <div className="flex justify-end gap-2 pt-2">
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit">{mode === 'create' ? 'Create event' : 'Save changes'}</Button>
        </div>
      </form>
    </Modal>
  )
}
