import { useState } from 'react'
import { getVendors, setUserStatus, updateVendor } from '../../api/admin'
import useApi from '../../hooks/useApi'
import LoadState from '../../components/common/LoadState'
import PageHeader from '../../components/ui/PageHeader'
import FilterPills from '../../components/ui/FilterPills'
import SearchInput from '../../components/ui/SearchInput'
import Table, { Td } from '../../components/ui/Table'
import Button from '../../components/ui/Button'
import { StatusBadge, StockBadge } from '../../components/ui/Badge'
import Notice from '../../components/ui/Notice'
import Modal, { ConfirmDialog } from '../../components/ui/Modal'
import { inputClass, labelClass } from '../../components/ui/form'
import { CATEGORIES } from '../../utils/constants'
import { formatShortDate, peso } from '../../utils/format'

const STATUS_FILTERS = ['all', 'active', 'suspended']

// Admin: view, edit, and suspend vendors (SRS 3.1.2.2).
export default function Vendors() {
  const { data, loading, error, reload, setData: setVendors } = useApi(() => getVendors(), [])
  const vendors = data ?? []
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [viewingId, setViewingId] = useState(null)
  const [editing, setEditing] = useState(null) // a copy of the vendor being edited
  const [toToggle, setToToggle] = useState(null)
  const [message, setMessage] = useState({ tone: 'success', text: '' })

  const viewing = vendors.find((v) => v.vendor_id === viewingId)
  const q = search.trim().toLowerCase()
  const visible = vendors.filter(
    (v) => (statusFilter === 'all' || v.status === statusFilter) && v.business_name.toLowerCase().includes(q),
  )
  const suspending = toToggle?.status === 'active'
  const replace = (updated) => setVendors((prev) => prev.map((v) => (v.vendor_id === updated.vendor_id ? updated : v)))

  // SuspendVendor(): suspending the vendor's account hides them from customers.
  const confirmToggle = async () => {
    const target = toToggle
    setToToggle(null)
    try {
      const updated = await setUserStatus(target.vendor_id, suspending ? 'suspended' : 'active')
      replace({ ...target, status: updated.status })
      setMessage({ tone: 'success', text: `${target.business_name} was ${suspending ? 'suspended' : 'reactivated'}.` })
    } catch (err) {
      setMessage({ tone: 'error', text: err.message })
    }
  }

  // EditVendor()
  const saveEdit = async (e) => {
    e.preventDefault()
    const { vendor_id, business_name, category, description } = editing
    try {
      replace(await updateVendor(vendor_id, { business_name, category, description }))
      setEditing(null)
      setMessage({ tone: 'success', text: `${business_name} was updated.` })
    } catch (err) {
      setMessage({ tone: 'error', text: err.message })
    }
  }

  return (
    <div>
      <PageHeader
        title="Vendor management"
        description="Approved vendors, their listings, and where they are scheduled."
      />
      <Notice tone={message.tone} onClose={() => setMessage({ ...message, text: '' })}>
        {message.text}
      </Notice>

      <div className="mb-4 flex flex-wrap items-center gap-3">
        <FilterPills
          label="Vendor status"
          value={statusFilter}
          onChange={setStatusFilter}
          options={STATUS_FILTERS.map((s) => ({
            value: s,
            label: s === 'all' ? 'All' : `${s[0].toUpperCase()}${s.slice(1)}`,
          }))}
        />
        <SearchInput value={search} onChange={setSearch} placeholder="Search by business name…" />
      </div>

      {loading || error ? (
        <LoadState loading={loading} error={error} onRetry={reload} />
      ) : (
        <Table
          columns={['Business', 'Owner', 'Category', 'Products', 'Status', { label: 'Actions', align: 'right' }]}
          isEmpty={visible.length === 0}
          empty="No vendors match your search."
        >
          {visible.map((v) => (
            <tr key={v.vendor_id}>
              <Td className="font-semibold text-ink">{v.business_name}</Td>
              <Td>
                <p className="text-ink">{v.owner_name}</p>
                <p className="text-xs text-muted">{v.email}</p>
              </Td>
              <Td>{v.category}</Td>
              <Td>{v.products.length}</Td>
              <Td>
                <StatusBadge status={v.status} />
              </Td>
              <Td align="right">
                <div className="flex justify-end gap-2">
                  <Button size="sm" variant="secondary" onClick={() => setViewingId(v.vendor_id)}>
                    View
                  </Button>
                  <Button size="sm" variant="secondary" onClick={() => setEditing({ ...v })}>
                    Edit
                  </Button>
                  <Button
                    size="sm"
                    variant={v.status === 'active' ? 'danger' : 'success'}
                    onClick={() => setToToggle(v)}
                  >
                    {v.status === 'active' ? 'Suspend' : 'Reactivate'}
                  </Button>
                </div>
              </Td>
            </tr>
          ))}
        </Table>
      )}

      {/* Details drawer (ViewVendor) */}
      {viewing && (
        <div className="fixed inset-0 z-40 flex justify-end bg-black/30" onClick={() => setViewingId(null)}>
          <aside
            role="dialog"
            aria-modal="true"
            aria-label={viewing.business_name}
            className="h-full w-full max-w-md overflow-y-auto bg-white p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-4 flex items-start justify-between gap-4">
              <div>
                <h2 className="font-serif text-2xl text-brand">{viewing.business_name}</h2>
                <p className="text-sm text-muted">
                  {viewing.owner_name} · {viewing.email}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setViewingId(null)}
                className="text-2xl leading-none text-muted hover:text-ink"
                aria-label="Close"
              >
                ×
              </button>
            </div>
            <StatusBadge status={viewing.status} />
            <p className="mt-4 text-sm text-ink">{viewing.description}</p>

            <h3 className="mb-2 mt-6 font-semibold text-ink">Products</h3>
            {viewing.products.length === 0 ? (
              <p className="text-sm text-muted">No products listed.</p>
            ) : (
              <ul className="space-y-2 text-sm">
                {viewing.products.map((p) => (
                  <li
                    key={p.product_id}
                    className="flex items-center justify-between gap-3 rounded-lg bg-cream px-3 py-2"
                  >
                    <span className="text-ink">{p.name}</span>
                    <span className="flex items-center gap-2 text-muted">
                      {peso(p.price)} <StockBadge stock={p.stock_status} />
                    </span>
                  </li>
                ))}
              </ul>
            )}

            <h3 className="mb-2 mt-6 font-semibold text-ink">Schedule</h3>
            {viewing.schedule.length === 0 ? (
              <p className="text-sm text-muted">Not registered for any bazaar yet.</p>
            ) : (
              <ul className="space-y-2 text-sm">
                {viewing.schedule.map((s) => (
                  <li key={s.event_id} className="rounded-lg bg-cream px-3 py-2">
                    <p className="font-medium text-ink">{s.event}</p>
                    <p className="text-muted">
                      {formatShortDate(s.date)} · {s.slot ? `Stall ${s.slot}` : 'Waiting for stall'}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </aside>
        </div>
      )}

      {editing && (
        <Modal title={`Edit ${editing.business_name}`} onClose={() => setEditing(null)} size="lg">
          <form onSubmit={saveEdit} className="space-y-4">
            <label className={labelClass}>
              Business name
              <input
                required
                value={editing.business_name}
                onChange={(e) => setEditing({ ...editing, business_name: e.target.value })}
                className={inputClass}
              />
            </label>
            <label className={labelClass}>
              Category
              <select
                value={editing.category}
                onChange={(e) => setEditing({ ...editing, category: e.target.value })}
                className={inputClass}
              >
                {CATEGORIES.map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
            </label>
            <label className={labelClass}>
              Description
              <textarea
                rows={4}
                value={editing.description}
                onChange={(e) => setEditing({ ...editing, description: e.target.value })}
                className={inputClass}
              />
            </label>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="secondary" onClick={() => setEditing(null)}>
                Cancel
              </Button>
              <Button type="submit">Save changes</Button>
            </div>
          </form>
        </Modal>
      )}

      <ConfirmDialog
        open={!!toToggle}
        title={suspending ? 'Suspend vendor?' : 'Reactivate vendor?'}
        confirmLabel={suspending ? 'Suspend' : 'Reactivate'}
        tone={suspending ? 'danger' : 'success'}
        onConfirm={confirmToggle}
        onCancel={() => setToToggle(null)}
      >
        <p>
          {suspending
            ? `${toToggle?.business_name} will be hidden from customers and unable to log in until reactivated.`
            : `${toToggle?.business_name} will be visible to customers again.`}
        </p>
      </ConfirmDialog>
    </div>
  )
}
