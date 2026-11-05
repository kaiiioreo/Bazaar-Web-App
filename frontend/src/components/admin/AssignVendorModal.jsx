import { useState } from 'react'

export default function AssignVendorModal({ slotLabel, vendors, onAssign, onClose }) {
  const [selectedId, setSelectedId] = useState(null)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
        <h3 className="mb-1 text-lg font-semibold">Assign vendor to Stall {slotLabel}</h3>
        <p className="mb-4 text-sm text-slate-500">
          Only vendors who pre-registered and don't have a stall yet are shown.
        </p>

        {vendors.length === 0 ? (
          <p className="rounded bg-slate-50 px-3 py-4 text-center text-sm text-slate-500">
            No vendors are waiting for a stall.
          </p>
        ) : (
          <ul className="max-h-64 space-y-2 overflow-y-auto">
            {vendors.map((v) => (
              <li key={v.vendor_id}>
                <label
                  className={`flex cursor-pointer items-center gap-3 rounded border px-3 py-2 text-sm ${
                    selectedId === v.vendor_id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <input
                    type="radio"
                    name="vendor"
                    checked={selectedId === v.vendor_id}
                    onChange={() => setSelectedId(v.vendor_id)}
                  />
                  <span className="font-medium">{v.business_name}</span>
                  <span className="ml-auto text-xs text-slate-500">{v.registered_at}</span>
                </label>
              </li>
            ))}
          </ul>
        )}

        <div className="mt-6 flex justify-end gap-2">
          <button
            onClick={onClose}
            className="rounded border border-slate-300 px-4 py-2 text-sm hover:bg-slate-50"
          >
            Cancel
          </button>
          <button
            onClick={() => onAssign(selectedId)}
            disabled={selectedId === null}
            className="rounded bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Assign stall
          </button>
        </div>
      </div>
    </div>
  )
}