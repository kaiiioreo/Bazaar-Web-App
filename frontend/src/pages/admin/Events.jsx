import { useState } from 'react'
import { cancelEvent, createEvent, getEvents, setRegistration, updateEvent } from '../../api/admin'
import useApi from '../../hooks/useApi'
import LoadState from '../../components/common/LoadState'
import StatusBadge from '../../components/common/StatusBadge'
import ConfirmModal from '../../components/admin/ConfirmModal'
import EventFormModal from '../../components/admin/EventFormModal'

const tabs = ['upcoming', 'completed', 'cancelled', 'all']

const formatDate = (iso) =>
  new Date(iso + 'T00:00:00').toLocaleDateString('en-US', {
    weekday: 'short',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

export default function Events() {
  const { data, loading, error, reload, setData: setEvents } = useApi(() => getEvents(), [])
  const events = data ?? []
  const [actionError, setActionError] = useState('')
  const [filter, setFilter] = useState('upcoming')
  const [expandedId, setExpandedId] = useState(null)
  const [formState, setFormState] = useState(null) // { mode: 'create' | 'edit', event? }
  const [toCancel, setToCancel] = useState(null)

  const countFor = (tab) =>
    tab === 'all' ? events.length : events.filter((e) => e.status === tab).length

  const visible = events
    .filter((e) => filter === 'all' || e.status === filter)
    .sort((a, b) => a.date.localeCompare(b.date))

  // Replaces one event in the list with the version the server sent back.
  const replace = (updated) =>
    setEvents((prev) => prev.map((e) => (e.event_id === updated.event_id ? updated : e)))

  const attempt = async (action) => {
    setActionError('')
    try {
      await action()
    } catch (err) {
      setActionError(err.message)
    }
  }

  const handleSave = (form) => {
    const { mode, event } = formState
    setFormState(null)
    attempt(async () => {
      if (mode === 'create') {
        const created = await createEvent(form)
        setEvents((prev) => [...prev, created])
        setFilter('upcoming')
      } else {
        replace(await updateEvent(event.event_id, form))
      }
    })
  }

  const toggleRegistration = (ev) =>
    attempt(async () => replace(await setRegistration(ev.event_id, !ev.registration_open)))

  const confirmCancel = () => {
    const ev = toCancel
    setToCancel(null)
    attempt(async () => replace(await cancelEvent(ev.event_id)))
  }

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-2xl font-bold">Bazaar Events</h2>
        <button
          onClick={() => setFormState({ mode: 'create' })}
          className="rounded bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          + Create event
        </button>
      </div>

      {actionError && <p className="mb-4 rounded border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">{actionError}</p>}
      {(loading || error) && <LoadState loading={loading} error={error} onRetry={reload} />}

      {/* Filter tabs */}
      <div className="mb-4 flex flex-wrap gap-2">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setFilter(tab)}
            className={`rounded-full px-4 py-1.5 text-sm capitalize ${
              filter === tab
                ? 'bg-blue-600 text-white'
                : 'bg-white text-slate-700 shadow hover:bg-slate-100'
            }`}
          >
            {tab} ({countFor(tab)})
          </button>
        ))}
      </div>

      {/* Event cards */}
      <div className="space-y-4">
        {visible.length === 0 && (
          <div className="rounded-lg bg-white p-8 text-center text-slate-500 shadow">
            No {filter === 'all' ? '' : filter} events.
          </div>
        )}

        {visible.map((ev) => {
          const isUpcoming = ev.status === 'upcoming'
          const expanded = expandedId === ev.event_id
          const registered = ev.preregistered.length
          const overCapacity = registered > ev.total_slots

          return (
            <div key={ev.event_id} className="rounded-lg bg-white p-5 shadow">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-3">
                    <h3 className="text-lg font-semibold">{ev.name}</h3>
                    <StatusBadge status={ev.status} />
                  </div>
                  <p className="mt-1 text-sm text-slate-600">
                    {formatDate(ev.date)} · {ev.location}
                  </p>
                </div>

                {isUpcoming && (
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => setFormState({ mode: 'edit', event: ev })}
                      className="rounded border border-slate-300 px-3 py-1 text-sm hover:bg-slate-50"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => toggleRegistration(ev)}
                      className="rounded border border-slate-300 px-3 py-1 text-sm hover:bg-slate-50"
                    >
                      {ev.registration_open ? 'Close registration' : 'Open registration'}
                    </button>
                    <button
                      onClick={() => setToCancel(ev)}
                      className="rounded bg-red-600 px-3 py-1 text-sm text-white hover:bg-red-700"
                    >
                      Cancel event
                    </button>
                  </div>
                )}
              </div>

              {/* Summary row */}
              <div className="mt-4 flex flex-wrap items-center gap-x-8 gap-y-2 text-sm">
                <p>
                  <span className="text-slate-500">Stalls:</span>{' '}
                  <span className="font-medium">{ev.total_slots}</span>
                </p>
                <p>
                  <span className="text-slate-500">Pre-registered:</span>{' '}
                  <span className="font-medium">
                    {registered} / {ev.total_slots}
                  </span>
                </p>
                {isUpcoming && (
                  <p>
                    <span className="text-slate-500">Registration:</span>{' '}
                    <span
                      className={`font-medium ${
                        ev.registration_open ? 'text-green-700' : 'text-slate-500'
                      }`}
                    >
                      {ev.registration_open ? 'Open' : 'Closed'}
                    </span>
                  </p>
                )}
                {overCapacity && isUpcoming && (
                  <span className="rounded bg-amber-100 px-2 py-0.5 text-xs text-amber-800">
                    ⚠ More vendors than stalls
                  </span>
                )}
              </div>

              {/* Expandable vendor list */}
              <button
                onClick={() => setExpandedId(expanded ? null : ev.event_id)}
                className="mt-4 text-sm font-medium text-blue-600 hover:underline"
              >
                {expanded ? 'Hide' : 'View'} pre-registered vendors ({registered})
              </button>

              {expanded && (
                <div className="mt-3">
                  {registered === 0 ? (
                    <p className="text-sm text-slate-500">No vendors have pre-registered yet.</p>
                  ) : (
                    <ul className="divide-y rounded border text-sm">
                      {ev.preregistered.map((v) => (
                        <li key={v.vendor_id} className="flex justify-between px-3 py-2">
                          <span className="font-medium">{v.business_name}</span>
                          <span className="text-slate-500">
                            {v.slot_label ? `Stall ${v.slot_label} · ` : 'Waiting for stall · '}Registered {v.registered_at}
                          </span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Create / edit form (mounted only while open so it resets each time) */}
      {formState && (
        <EventFormModal
          mode={formState.mode}
          initial={formState.event}
          onSave={handleSave}
          onClose={() => setFormState(null)}
        />
      )}

      {/* Cancel confirmation */}
      <ConfirmModal
        open={!!toCancel}
        title="Cancel this event?"
        confirmLabel="Cancel event"
        confirmClass="bg-red-600 hover:bg-red-700"
        onConfirm={confirmCancel}
        onCancel={() => setToCancel(null)}
      >
        <p>
          {toCancel?.name} will be marked as cancelled, registration will close, and its
          pre-registered vendors will be notified.
        </p>
      </ConfirmModal>
    </div>
  )
}