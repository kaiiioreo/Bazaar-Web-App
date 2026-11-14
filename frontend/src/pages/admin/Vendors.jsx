import { useState } from 'react'
import { getVendors, setUserStatus } from '../../api/admin'
import useApi from '../../hooks/useApi'
import LoadState from '../../components/common/LoadState'
import StatusBadge from '../../components/common/StatusBadge'
import ConfirmModal from '../../components/admin/ConfirmModal'

const stockLabels = {
  in_stock: 'In Stock',
  low_stock: 'Low Stock',
  out_of_stock: 'Out of Stock',
}

export default function Vendors() {
  const { data, loading, error, reload, setData: setVendors } = useApi(() => getVendors(), [])
  const vendors = data ?? []
  const [actionError, setActionError] = useState('')
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [viewingId, setViewingId] = useState(null)
  const [toToggle, setToToggle] = useState(null)

  const viewingVendor = vendors.find((v) => v.vendor_id === viewingId)

  const visible = vendors.filter((v) => {
    const matchesSearch = v.business_name.toLowerCase().includes(search.toLowerCase())
    const matchesStatus = statusFilter === 'all' || v.status === statusFilter
    return matchesSearch && matchesStatus
  })

  // SuspendVendor(): suspending the vendor's account hides them from customers.
  const confirmToggle = async () => {
    const target = toToggle
    setToToggle(null)
    setActionError('')
    try {
      const updated = await setUserStatus(target.vendor_id, target.status === 'active' ? 'suspended' : 'active')
      setVendors((prev) => prev.map((v) => (v.vendor_id === target.vendor_id ? { ...v, status: updated.status } : v)))
    } catch (err) {
      setActionError(err.message)
    }
  }

  const suspending = toToggle?.status === 'active'

  return (
    <div>
      <h2 className="mb-6 text-2xl font-bold">Vendor Management</h2>
      {actionError && <p className="mb-4 rounded border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">{actionError}</p>}
      {(loading || error) && <LoadState loading={loading} error={error} onRetry={reload} />}

      {/* Search + filter */}
      <div className="mb-4 flex flex-wrap gap-3">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by business name..."
          className="w-full max-w-xs rounded border border-slate-300 bg-white px-3 py-2 text-sm"
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="rounded border border-slate-300 bg-white px-3 py-2 text-sm"
        >
          <option value="all">All statuses</option>
          <option value="active">Active</option>
          <option value="suspended">Suspended</option>
        </select>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-lg bg-white shadow">
        <table className="w-full text-left text-sm">
          <thead className="border-b bg-slate-50 text-slate-600">
            <tr>
              <th className="px-4 py-3">Business</th>
              <th className="px-4 py-3">Owner</th>
              <th className="px-4 py-3">Category</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {visible.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-slate-500">
                  No vendors match your search.
                </td>
              </tr>
            )}
            {visible.map((v) => (
              <tr key={v.vendor_id} className="border-b last:border-0">
                <td className="px-4 py-3 font-medium">{v.business_name}</td>
                <td className="px-4 py-3">
                  <p>{v.owner_name}</p>
                  <p className="text-xs text-slate-500">{v.email}</p>
                </td>
                <td className="px-4 py-3">{v.category}</td>
                <td className="px-4 py-3">
                  <StatusBadge status={v.status} />
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => setViewingId(v.vendor_id)}
                      className="rounded border border-slate-300 px-3 py-1 hover:bg-slate-50"
                    >
                      View
                    </button>
                    <button
                      onClick={() => setToToggle(v)}
                      className={`rounded px-3 py-1 text-white ${
                        v.status === 'active'
                          ? 'bg-red-600 hover:bg-red-700'
                          : 'bg-green-600 hover:bg-green-700'
                      }`}
                    >
                      {v.status === 'active' ? 'Suspend' : 'Reactivate'}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Details drawer */}
      {viewingVendor && (
        <div
          className="fixed inset-0 z-40 flex justify-end bg-black/40"
          onClick={() => setViewingId(null)}
        >
          <aside
            className="h-full w-full max-w-md overflow-y-auto bg-white p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-4 flex items-start justify-between">
              <div>
                <h3 className="text-xl font-bold">{viewingVendor.business_name}</h3>
                <p className="text-sm text-slate-500">
                  {viewingVendor.owner_name} · {viewingVendor.email}
                </p>
              </div>
              <button
                onClick={() => setViewingId(null)}
                className="text-2xl leading-none text-slate-400 hover:text-slate-700"
                aria-label="Close"
              >
                ×
              </button>
            </div>

            <StatusBadge status={viewingVendor.status} />
            <p className="mt-4 text-sm text-slate-700">{viewingVendor.description}</p>

            <h4 className="mb-2 mt-6 font-semibold">Products</h4>
            {viewingVendor.products.length === 0 ? (
              <p className="text-sm text-slate-500">No products listed.</p>
            ) : (
              <ul className="space-y-2 text-sm">
                {viewingVendor.products.map((p) => (
                  <li key={p.product_id} className="flex justify-between rounded bg-slate-50 px-3 py-2">
                    <span>{p.name}</span>
                    <span className="text-slate-600">
                      ₱{p.price} · {stockLabels[p.stock_status]}
                    </span>
                  </li>
                ))}
              </ul>
            )}

            <h4 className="mb-2 mt-6 font-semibold">Schedule</h4>
            {viewingVendor.schedule.length === 0 ? (
              <p className="text-sm text-slate-500">Not registered for any bazaar yet.</p>
            ) : (
              <ul className="space-y-2 text-sm">
                {viewingVendor.schedule.map((s) => (
                  <li key={s.event + s.date} className="rounded bg-slate-50 px-3 py-2">
                    <p className="font-medium">{s.event}</p>
                    <p className="text-slate-600">
                      {s.date} · {s.slot ? `Stall ${s.slot}` : 'Waiting for stall'}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </aside>
        </div>
      )}

      {/* Suspend / reactivate confirmation */}
      <ConfirmModal
        open={!!toToggle}
        title={suspending ? 'Suspend vendor?' : 'Reactivate vendor?'}
        confirmLabel={suspending ? 'Suspend' : 'Reactivate'}
        confirmClass={suspending ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'}
        onConfirm={confirmToggle}
        onCancel={() => setToToggle(null)}
      >
        <p>
          {suspending
            ? `${toToggle?.business_name} will be hidden from customers and unable to manage listings until reactivated.`
            : `${toToggle?.business_name} will be visible to customers again.`}
        </p>
      </ConfirmModal>
    </div>
  )
}