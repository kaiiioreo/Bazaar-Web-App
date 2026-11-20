import { useState } from 'react'
import Modal from '../ui/Modal'
import Button from '../ui/Button'
import { inputClass, labelClass } from '../ui/form'
import { readImage } from './imageUtils'
import { generateListing } from '../../api/ai'
import { CATEGORIES, STOCK } from '../../utils/constants'

const EMPTY = { name: '', price: '', category: CATEGORIES[0], stock_status: 'in_stock', description: '', image: '' }

// Dialog used for both AddProduct() and UpdateProduct(), with the AI listing generator on top.
export default function ProductForm({ product, onSave, onCancel }) {
  const [form, setForm] = useState(product ?? EMPTY)
  const [notes, setNotes] = useState('')
  const [aiBusy, setAiBusy] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value })

  // GenerateVendorListing(): AI fills in the fields; the vendor can still edit them.
  const generate = async () => {
    if (notes.trim().length < 3) return setError('Describe the product in a few words first.')
    setAiBusy(true)
    setError('')
    try {
      const draft = await generateListing(notes)
      setForm((f) => ({
        ...f,
        name: draft.name,
        description: draft.description,
        category: draft.category,
        price: draft.price ?? f.price,
      }))
    } catch (err) {
      setError(err.message)
    } finally {
      setAiBusy(false)
    }
  }

  const submit = async (e) => {
    e.preventDefault()
    setSaving(true)
    setError('')
    try {
      await onSave({ ...form, price: Number(form.price) })
    } catch (err) {
      setError(err.message)
      setSaving(false)
    }
  }

  // Photos are resized in the browser and saved as a small data URL.
  const onImage = async (e) => {
    const file = e.target.files[0]
    if (file) setForm({ ...form, image: await readImage(file) })
  }

  return (
    <Modal title={product ? 'Edit product' : 'Add product'} onClose={onCancel}>
      <form onSubmit={submit} className="space-y-4">
        <div className="rounded-xl border border-brand/20 bg-brand-soft p-3">
          <label className={`${labelClass} text-brand`}>
            Write it with AI
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. garlic chicharon, 100g pack, P85, extra crispy"
              className={inputClass}
            />
          </label>
          <div className="mt-2 flex flex-wrap items-center gap-3">
            <Button size="sm" onClick={generate} disabled={aiBusy}>
              {aiBusy ? 'Writing…' : '✨ Generate listing'}
            </Button>
            <p className="text-xs text-brand">Check and edit the result before saving.</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {form.image ? (
            <img src={form.image} alt="Product preview" className="h-16 w-16 rounded-lg object-cover" />
          ) : (
            <div className="grid h-16 w-16 place-items-center rounded-lg bg-cream text-xs text-muted">No photo</div>
          )}
          <div className="text-sm">
            <label className={labelClass}>
              Product photo
              <input type="file" accept="image/*" onChange={onImage} className="mt-1 block text-xs text-muted" />
            </label>
            {form.image && (
              <button
                type="button"
                onClick={() => setForm({ ...form, image: '' })}
                className="mt-1 text-xs text-danger hover:underline"
              >
                Remove photo
              </button>
            )}
          </div>
        </div>

        <label className={labelClass}>
          Name
          <input required value={form.name} onChange={set('name')} className={inputClass} />
        </label>
        <div className="grid grid-cols-2 gap-3">
          <label className={labelClass}>
            Price (₱)
            <input
              required
              type="number"
              min="0"
              step="0.01"
              value={form.price}
              onChange={set('price')}
              className={inputClass}
            />
          </label>
          <label className={labelClass}>
            Category
            <select value={form.category} onChange={set('category')} className={inputClass}>
              {CATEGORIES.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </label>
        </div>
        <label className={labelClass}>
          Stock status
          <select value={form.stock_status} onChange={set('stock_status')} className={inputClass}>
            {Object.entries(STOCK).map(([v, o]) => (
              <option key={v} value={v}>
                {o.label}
              </option>
            ))}
          </select>
        </label>
        <label className={labelClass}>
          Description
          <textarea rows={3} value={form.description} onChange={set('description')} className={inputClass} />
        </label>

        {error && (
          <p className="text-sm text-danger" role="alert">
            {error}
          </p>
        )}
        <div className="flex justify-end gap-2 pt-2">
          <Button variant="secondary" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit" disabled={saving}>
            {saving ? 'Saving…' : 'Save product'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
