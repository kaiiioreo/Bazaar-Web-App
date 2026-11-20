import { useEffect, useState } from 'react'
import { assignSlot, getEventSlots, getEvents, unassignSlot } from '../../api/admin'
import useApi from '../../hooks/useApi'
import LoadState from '../../components/common/LoadState'
import PageHeader from '../../components/ui/PageHeader'
import Card from '../../components/ui/Card'
import StatCard from '../../components/ui/StatCard'
import EmptyState from '../../components/ui/EmptyState'
import Notice from '../../components/ui/Notice'
import { ConfirmDialog } from '../../components/ui/Modal'
import { inputClass, labelClass } from '../../components/ui/form'
import AssignVendorModal from '../../components/admin/AssignVendorModal'
import { formatShortDate, plural } from '../../utils/format'

// Admin: assign pre-registered vendors to stalls (AssignStallToVendor, SRS 3.1.2.4).
// Stalls are created with the event: A-01, A-02 ... five per row.
export default function Slots() {
  const eventsApi = useApi(() => getEvents(), [])
  const upcomingEvents = (eventsApi.data ?? []).filter((e) => e.status === 'upcoming')

  const [eventId, setEventId] = useState(null)
  const [layout, setLayout] = useState(null) // { event, slots, waiting } from the API
  const [layoutError, setLayoutError] = useState('')
  const [assigningSlot, setAssigningSlot] = useState(null) // an open stall
  const [unassigning, setUnassigning] = useState(null) // an assigned stall
  const [message, setMessage] = useState({ tone: 'success', text: '' })

  const selectedId = eventId ?? upcomingEvents[0]?.event_id ?? null

  useEffect(() => {
    if (!selectedId) return undefined
    let active = true
    getEventSlots(selectedId)
      .then((d) => active && (setLayout(d), setLayoutError('')))
      .catch((err) => active && setLayoutError(err.message))
    return () => {
      active = false
    }
  }, [selectedId])

  const refreshLayout = async () => setLayout(await getEventSlots(selectedId))

  const header = (
    <PageHeader
      title="Slot management"
      description="Click an open stall to assign a waiting vendor. Vendors and their followers are notified."
    />
  )

  if (eventsApi.loading || eventsApi.error) {
    return (
      <>
        {header}
        <LoadState loading={eventsApi.loading} error={eventsApi.error} onRetry={eventsApi.reload} />
      </>
    )
  }
  if (upcomingEvents.length === 0) {
    return (
      <>
        {header}
        <EmptyState>There are no upcoming events. Create one on the Bazaar Events page first.</EmptyState>
      </>
    )
  }
  if (layoutError)
    return (
      <>
        {header}
        <LoadState error={layoutError} onRetry={refreshLayout} />
      </>
    )
  if (!layout || layout.event.event_id !== selectedId)
    return (
      <>
        {header}
        <LoadState loading />
      </>
    )

  const { slots, waiting } = layout
  const assignedCount = slots.filter((s) => s.vendor_id).length
  const availableCount = slots.length - assignedCount
  const totalRegistered = waiting.length + assignedCount

  const run = async (action, success) => {
    try {
      await action()
      setMessage({ tone: 'success', text: success })
      await refreshLayout()
    } catch (err) {
      setMessage({ tone: 'error', text: err.message })
    }
  }

  const handleAssign = (vendorId) => {
    const slot = assigningSlot
    setAssigningSlot(null)
    run(async () => {
      const res = await assignSlot(slot.slot_id, vendorId)
      return res
    }, `Stall ${slot.label} was assigned.`)
  }

  const handleUnassign = () => {
    const slot = unassigning
    setUnassigning(null)
    run(() => unassignSlot(slot.slot_id), `${slot.business_name} was removed from Stall ${slot.label}.`)
  }

  return (
    <div>
      {header}
      <Notice tone={message.tone} onClose={() => setMessage({ ...message, text: '' })}>
        {message.text}
      </Notice>

      <label className={`${labelClass} mb-6 max-w-md`}>
        Event
        <select
          value={selectedId}
          onChange={(e) => {
            setEventId(Number(e.target.value))
            setMessage({ tone: 'success', text: '' })
          }}
          className={inputClass}
        >
          {upcomingEvents.map((e) => (
            <option key={e.event_id} value={e.event_id}>
              {e.name} · {formatShortDate(e.date)} · {e.location}
            </option>
          ))}
        </select>
      </label>

      <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Total stalls" value={slots.length} />
        <StatCard label="Assigned" value={assignedCount} tone="success" />
        <StatCard label="Available" value={availableCount} />
        <StatCard label="Vendors waiting" value={waiting.length} tone={waiting.length ? 'warning' : 'default'} />
      </div>

      {waiting.length > availableCount && (
        <Notice tone="error">
          ⚠ {plural(waiting.length, 'vendor')} waiting but only {availableCount}{' '}
          {availableCount === 1 ? 'stall is' : 'stalls are'} available. Increase the number of stalls on the Bazaar
          Events page, or turn some vendors down.
        </Notice>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
            <h2 className="font-semibold text-ink">Stall layout</h2>
            <div className="flex gap-4 text-xs text-muted">
              <span className="flex items-center gap-1">
                <span className="inline-block h-3 w-3 rounded border-2 border-dashed border-line" /> Available
              </span>
              <span className="flex items-center gap-1">
                <span className="inline-block h-3 w-3 rounded border border-success/30 bg-success-soft" /> Assigned
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-5">
            {slots.map((slot) => {
              const taken = Boolean(slot.vendor_id)
              return (
                <button
                  key={slot.slot_id}
                  type="button"
                  onClick={() => (taken ? setUnassigning(slot) : setAssigningSlot(slot))}
                  aria-label={
                    taken
                      ? `Stall ${slot.label}: ${slot.business_name}. Click to remove.`
                      : `Stall ${slot.label}: open. Click to assign.`
                  }
                  className={`min-h-20 rounded-lg p-2 text-left text-sm transition ${
                    taken
                      ? 'border border-success/30 bg-success-soft hover:border-success'
                      : 'border-2 border-dashed border-line bg-white hover:border-brand hover:bg-brand-soft'
                  }`}
                >
                  <p className="text-xs font-bold text-muted">{slot.label}</p>
                  <p className={`mt-1 line-clamp-2 text-xs ${taken ? 'font-semibold text-success' : 'text-muted'}`}>
                    {taken ? slot.business_name : 'Open'}
                  </p>
                </button>
              )
            })}
          </div>
        </Card>

        <Card>
          <h2 className="mb-3 font-semibold text-ink">Waiting for a stall</h2>
          {waiting.length === 0 ? (
            <p className="text-sm text-muted">
              {totalRegistered === 0
                ? 'No vendors have pre-registered for this event yet.'
                : 'Every pre-registered vendor has a stall.'}
            </p>
          ) : (
            <ul className="space-y-2 text-sm">
              {waiting.map((v) => (
                <li key={v.vendor_id} className="rounded-lg bg-cream px-3 py-2">
                  <p className="font-medium text-ink">{v.business_name}</p>
                  <p className="text-xs text-muted">Registered {formatShortDate(v.registered_at)}</p>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>

      {/* Mounted only while open so the selection resets */}
      {assigningSlot && (
        <AssignVendorModal
          slotLabel={assigningSlot.label}
          vendors={waiting}
          onAssign={handleAssign}
          onClose={() => setAssigningSlot(null)}
        />
      )}

      <ConfirmDialog
        open={!!unassigning}
        title="Remove vendor from this stall?"
        confirmLabel="Remove vendor"
        tone="danger"
        onConfirm={handleUnassign}
        onCancel={() => setUnassigning(null)}
      >
        <p>
          {unassigning?.business_name} will be removed from Stall {unassigning?.label}, go back to the waiting list, and
          be notified.
        </p>
      </ConfirmDialog>
    </div>
  )
}
