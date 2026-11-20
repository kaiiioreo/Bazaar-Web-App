import { useState } from 'react'
import Modal from '../ui/Modal'
import Button from '../ui/Button'
import { formatShortDate } from '../../utils/format'

// Pick which waiting vendor gets an open stall (AssignStallToVendor).
export default function AssignVendorModal({ slotLabel, vendors, onAssign, onClose }) {
  const [selectedId, setSelectedId] = useState(null)

  return (
    <Modal
      title={`Assign a vendor to Stall ${slotLabel}`}
      onClose={onClose}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={() => onAssign(selectedId)} disabled={selectedId === null}>
            Assign stall
          </Button>
        </>
      }
    >
      <p className="mb-4">Only vendors who pre-registered and don’t have a stall yet are shown.</p>
      {vendors.length === 0 ? (
        <p className="rounded-lg bg-cream px-3 py-4 text-center">No vendors are waiting for a stall.</p>
      ) : (
        <ul className="max-h-64 space-y-2 overflow-y-auto">
          {vendors.map((v) => (
            <li key={v.vendor_id}>
              <label
                className={`flex cursor-pointer items-center gap-3 rounded-lg border px-3 py-2 text-ink ${
                  selectedId === v.vendor_id ? 'border-brand bg-brand-soft' : 'border-line hover:bg-cream'
                }`}
              >
                <input
                  type="radio"
                  name="vendor"
                  checked={selectedId === v.vendor_id}
                  onChange={() => setSelectedId(v.vendor_id)}
                />
                <span className="font-medium">{v.business_name}</span>
                <span className="ml-auto text-xs text-muted">Registered {formatShortDate(v.registered_at)}</span>
              </label>
            </li>
          ))}
        </ul>
      )}
    </Modal>
  )
}
