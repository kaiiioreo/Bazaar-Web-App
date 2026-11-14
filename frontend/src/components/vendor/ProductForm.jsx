import { useState } from 'react'
import { CATEGORIES, STOCK } from './vendorHelpers'
import { readImage } from './imageUtils'
import { generateListing } from '../../api/ai'

const field = 'mt-1 w-full rounded-md border border-stone-300 px-3 py-2 text-sm focus:border-teal-600 focus:outline-none focus:ring-1 focus:ring-teal-600'

// Modal used for both AddProduct() and UpdateProduct().
export default function ProductForm({ product, onSave, onCancel }) {
  const [form, setForm] = useState(product ?? { name: '', price: '', category: CATEGORIES[0], stock_status: 'in_stock', description: '', image: '' })
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value })
  const [notes, setNotes] = useState('')
  const [aiBusy, setAiBusy] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

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
    <div className="fixed inset-0 z-10 flex items-center justify-center bg-black/40 p-4" role="dialog" aria-modal="true">
      <form
        onSubmit={submit}
        className="max-h-full w-full max-w-md space-y-3 overflow-y-auto rounded-lg bg-white p-6"
      >
        <h2 className="text-lg font-semibold">{product ? 'Edit product' : 'Add product'}</h2>
        <div className="rounded-md border border-teal-200 bg-teal-50 p-3">
          <label className="block text-sm font-medium text-teal-900">Write it with AI
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. garlic chicharon, 100g pack, P85, extra crispy"
              className={field}
            />
          </label>
          <button type="button" onClick={generate} disabled={aiBusy} className="mt-2 rounded-md bg-teal-700 px-3 py-1.5 text-xs font-medium text-white hover:bg-teal-800 disabled:opacity-60">
            {aiBusy ? 'Writing…' : 'Generate listing'}
          </button>
          <p className="mt-1 text-xs text-teal-800">Check and edit the result before saving.</p>
        </div>
        <div className="flex items-center gap-3">
          {form.image ? (
            <img src={form.image} alt="Product preview" className="h-16 w-16 rounded object-cover" />
          ) : (
            <div className="grid h-16 w-16 place-items-center rounded bg-stone-100 text-xs text-stone-500">No photo</div>
          )}
          <div className="text-sm">
            <label>Product photo
              <input type="file" accept="image/*" onChange={onImage} className="mt-1 block text-xs" />
            </label>
            {form.image && (
              <button type="button" onClick={() => setForm({ ...form, image: '' })} className="mt-1 text-xs text-red-700 hover:underline">
                Remove photo
              </button>
            )}
          </div>
        </div>
        <label className="block text-sm">Name
          <input required value={form.name} onChange={set('name')} className={field} />
        </label>
        <div className="grid grid-cols-2 gap-3">
          <label className="block text-sm">Price (₱)
            <input required type="number" min="0" value={form.price} onChange={set('price')} className={field} />
          </label>
          <label className="block text-sm">Category
            <select value={form.category} onChange={set('category')} className={field}>
              {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
            </select>
          </label>
        </div>
        <label className="block text-sm">Stock status
          <select value={form.stock_status} onChange={set('stock_status')} className={field}>
            {Object.entries(STOCK).map(([v, o]) => <option key={v} value={v}>{o.label}</option>)}
          </select>
        </label>
        <label className="block text-sm">Description
          <textarea rows={3} value={form.description} onChange={set('description')} className={field} />
        </label>
        {error && <p className="text-sm text-red-700" role="alert">{error}</p>}
        <div className="flex justify-end gap-2 pt-2">
          <button type="button" onClick={onCancel} className="rounded-md border border-stone-300 px-4 py-2 text-sm hover:bg-stone-100">Cancel</button>
          <button type="submit" disabled={saving} className="rounded-md bg-stone-900 px-4 py-2 text-sm text-white hover:bg-stone-700 disabled:opacity-60">{saving ? 'Saving…' : 'Save product'}</button>
        </div>
      </form>
    </div>
  )
}
