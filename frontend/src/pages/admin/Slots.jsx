import { useEffect, useState } from 'react'
import { assignSlot, getEventSlots, getEvents, unassignSlot } from '../../api/admin'
import useApi from '../../hooks/useApi'
import LoadState from '../../components/common/LoadState'
import ConfirmModal from '../../components/admin/ConfirmModal'
import AssignVendorModal from '../../components/admin/AssignVendorModal'

// AssignStallToVendor(): stalls are created with the event (A-01, A-02 ... five per row).
export default function Slots() {
  const eventsApi = useApi(() => getEvents(), [])
  const upcomingEvents = (eventsApi.data ?? []).filter((e) => e.status === 'upcoming')

  const [eventId, setEventId] = useState(null)
  const [layout, setLayout] = useState(null) // { event, slots, waiting } from the API
  const [layoutError, setLayoutError] = useState('')
  const [assigningSlot, setAssigningSlot] = useState(null) // slot object (open stall)
  const [unassigning, setUnassigning] = useState(null) // slot object (assigned stall)
  const [notice, setNotice] = useState('')

  const selectedId = eventId ?? upcomingEvents[0]?.event_id ?? null

  useEffect(() => {
    if (!selectedId) return
    let active = true
    getEventSlots(selectedId)
      .then((d) => active && (setLayout(d), setLayoutError('')))
      .catch((err) => active && setLayoutError(err.message))
    return () => {
      active = false
    }
  }, [selectedId])

  const refreshLayout = async () => setLayout(await getEventSlots(selectedId))

  if (eventsApi.loading || eventsApi.error) {
    return <LoadState loading={eventsApi.loading} error={eventsApi.error} onRetry={eventsApi.reload} />
  }

  if (upcomingEvents.length === 0) {
    return (
      <div>
        <h2 className="mb-6 text-2xl font-bold">Slot Management</h2>
        <div className="rounded-lg bg-white p-8 text-center text-slate-500 shadow">
          There are no upcoming events. Create one on the Bazaar Events page first.
        </div>
      </div>
    )
  }

  if (layoutError) return <LoadState error={layoutError} onRetry={refreshLayout} />
  if (!layout || layout.event.event_id !== selectedId) return <LoadState loading />

  const slots = layout.slots
  const waiting = layout.waiting
  const assignedCount = slots.filter((sl) => sl.vendor_id).length
  const availableCount = slots.length - assignedCount
  const totalRegistered = waiting.length + assignedCount

  const changeEvent = (e) => {
    setEventId(Number(e.target.value))
    setNotice('')
  }

  const handleAssign = async (vendorId) => {
    const slot = assigningSlot
    setAssigningSlot(null)
    try {
      const res = await assignSlot(slot.slot_id, vendorId)
      setNotice(res.message)
      await refreshLayout()
    } catch (err) {
      setNotice(`Error: ${err.message}`)
    }
  }

  const handleUnassign = async () => {
    const slot = unassigning
    setUnassigning(null)
    try {
      await unassignSlot(slot.slot_id)
      setNotice(`${slot.business_name} was removed from Stall ${slot.label}.`)
      await refreshLayout()
    } catch (err) {
      setNotice(`Error: ${err.message}`)
    }
  }

  return (
    <div>
      <h2 className="mb-6 text-2xl font-bold">Slot Management</h2>

      {notice && (
        <div className="mb-4 flex items-center justify-between rounded border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800">
          <span>{notice}</span>
          <button
            onClick={() => setNotice('')}
            className="ml-4 text-lg leading-none hover:text-green-950"
            aria-label="Dismiss"
          >
            ×
          </button>
        </div>
      )}

      {/* Event selector */}
      <div className="mb-6">
        <label className="mb-1 block text-sm font-medium">Event</label>
        <select
          value={selectedId}
          onChange={changeEvent}
          className="w-full max-w-md rounded border border-slate-300 bg-white px-3 py-2 text-sm"
        >
          {upcomingEvents.map((e) => (
            <option key={e.event_id} value={e.event_id}>
              {e.name} · {e.date} · {e.location}
            </option>
          ))}
        </select>
      </div>

      {/* Summary */}
      <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <div className="rounded-lg bg-white p-4 shadow">
          <p className="text-sm text-slate-500">Total stalls</p>
          <p className="text-2xl font-bold">{slots.length}</p>
        </div>
        <div className="rounded-lg bg-white p-4 shadow">
          <p className="text-sm text-slate-500">Assigned</p>
          <p className="text-2xl font-bold text-green-700">{assignedCount}</p>
        </div>
        <div className="rounded-lg bg-white p-4 shadow">
          <p className="text-sm text-slate-500">Available</p>
          <p className="text-2xl font-bold">{availableCount}</p>
        </div>
        <div className="rounded-lg bg-white p-4 shadow">
          <p className="text-sm text-slate-500">Vendors waiting</p>
          <p className="text-2xl font-bold text-amber-600">{waiting.length}</p>
        </div>
      </div>

      {waiting.length > availableCount && (
        <div className="mb-6 rounded border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          ⚠ {waiting.length} vendors are waiting but only {availableCount} stall
          {availableCount === 1 ? ' is' : 's are'} available. You'll need to turn some vendors down
          or increase the number of stalls on the Bazaar Events page.
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Stall grid */}
        <div className="lg:col-span-2">
          <div className="rounded-lg bg-white p-5 shadow">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
              <h3 className="font-semibold">Stall layout</h3>
              <div className="flex gap-4 text-xs text-slate-500">
                <span className="flex items-center gap-1">
                  <span className="inline-block h-3 w-3 rounded border-2 border-dashed border-slate-300" />
                  Available
                </span>
                <span className="flex items-center gap-1">
                  <span className="inline-block h-3 w-3 rounded border border-green-300 bg-green-100" />
                  Assigned
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-5">
              {slots.map((slot) => {
                const label = slot.label
                const taken = Boolean(slot.vendor_id)

                return (
                  <button
                    key={slot.slot_id}
                    onClick={() => (taken ? setUnassigning(slot) : setAssigningSlot(slot))}
                    className={`min-h-20 rounded-lg border p-2 text-left text-sm transition ${
                      taken
                        ? 'border-green-300 bg-green-50 hover:bg-green-100'
                        : 'border-2 border-dashed border-slate-300 bg-white hover:border-blue-400 hover:bg-blue-50'
                    }`}
                  >
                    <p className="text-xs font-bold text-slate-500">{label}</p>
                    {taken ? (
                      <p className="mt-1 line-clamp-2 text-xs font-medium text-green-900">
                        {slot.business_name}
                      </p>
                    ) : (
                      <p className="mt-1 text-xs text-slate-400">Open</p>
                    )}
                  </button>
                )
              })}
            </div>

            <p className="mt-4 text-xs text-slate-500">
              Click an open stall to assign a vendor. Click an assigned stall to remove its vendor.
            </p>
          </div>
        </div>

        {/* Waiting list */}
        <div>
          <div className="rounded-lg bg-white p-5 shadow">
            <h3 className="mb-3 font-semibold">Waiting for a stall</h3>
            {waiting.length === 0 ? (
              <p className="text-sm text-slate-500">
                {totalRegistered === 0
                  ? 'No vendors have pre-registered for this event yet.'
                  : 'Every pre-registered vendor has a stall.'}
              </p>
            ) : (
              <ul className="space-y-2 text-sm">
                {waiting.map((v) => (
                  <li key={v.vendor_id} className="rounded bg-slate-50 px-3 py-2">
                    <p className="font-medium">{v.business_name}</p>
                    <p className="text-xs text-slate-500">Registered {v.registered_at}</p>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>

      {/* Assign modal (mounted only while open so the selection resets) */}
      {assigningSlot && (
        <AssignVendorModal
          slotLabel={assigningSlot.label}
          vendors={waiting}
          onAssign={handleAssign}
          onClose={() => setAssigningSlot(null)}
        />
      )}

      {/* Unassign confirmation */}
      <ConfirmModal
        open={!!unassigning}
        title="Remove vendor from this stall?"
        confirmLabel="Remove vendor"
        confirmClass="bg-red-600 hover:bg-red-700"
        onConfirm={handleUnassign}
        onCancel={() => setUnassigning(null)}
      >
        <p>
          {unassigning?.business_name} will be removed from Stall {unassigning?.label} and go back to the
          waiting list. They will be notified.
        </p>
      </ConfirmModal>
    </div>
  )
}