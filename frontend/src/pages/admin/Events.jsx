import { useState } from 'react'
import { cancelEvent, createEvent, getEvents, setRegistration, updateEvent } from '../../api/admin'
import useApi from '../../hooks/useApi'
import LoadState from '../../components/common/LoadState'
import PageHeader from '../../components/ui/PageHeader'
import FilterPills from '../../components/ui/FilterPills'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import Badge, { StatusBadge } from '../../components/ui/Badge'
import EmptyState from '../../components/ui/EmptyState'
import Notice from '../../components/ui/Notice'
import { ConfirmDialog } from '../../components/ui/Modal'
import EventFormModal from '../../components/admin/EventFormModal'
import { formatLongDate, formatShortDate } from '../../utils/format'

const TABS = ['upcoming', 'completed', 'cancelled', 'all']

// Admin: create, edit, open/close registration, and cancel bazaar events (SRS 3.1.2.5).
export default function Events() {
  const { data, loading, error, reload, setData: setEvents } = useApi(() => getEvents(), [])
  const events = data ?? []
  const [filter, setFilter] = useState('upcoming')
  const [expandedId, setExpandedId] = useState(null)
  const [formState, setFormState] = useState(null) // { mode: 'create' | 'edit', event? }
  const [toCancel, setToCancel] = useState(null)
  const [message, setMessage] = useState({ tone: 'success', text: '' })

  const countFor = (tab) => (tab === 'all' ? events.length : events.filter((e) => e.status === tab).length)
  const visible = events
    .filter((e) => filter === 'all' || e.status === filter)
    .sort((a, b) => a.date.localeCompare(b.date))

  // Replaces one event in the list with the version the server sent back.
  const replace = (updated) => setEvents((prev) => prev.map((e) => (e.event_id === updated.event_id ? updated : e)))

  const attempt = async (action, success) => {
    try {
      await action()
      setMessage({ tone: 'success', text: success })
    } catch (err) {
      setMessage({ tone: 'error', text: err.message })
    }
  }

  const handleSave = (form) => {
    const { mode, event } = formState
    setFormState(null)
    attempt(
      async () => {
        if (mode === 'create') {
          const created = await createEvent(form)
          setEvents((prev) => [...prev, created])
          setFilter('upcoming')
        } else {
          replace(await updateEvent(event.event_id, form))
        }
      },
      mode === 'create' ? `${form.name} was created with ${form.total_slots} stalls.` : `${form.name} was updated.`,
    )
  }

  const toggleRegistration = (ev) =>
    attempt(
      async () => replace(await setRegistration(ev.event_id, !ev.registration_open)),
      `Pre-registration for ${ev.name} is now ${ev.registration_open ? 'closed' : 'open'}.`,
    )

  const confirmCancel = () => {
    const ev = toCancel
    setToCancel(null)
    attempt(
      async () => replace(await cancelEvent(ev.event_id)),
      `${ev.name} was cancelled. Its vendors and their followers were notified.`,
    )
  }

  return (
    <div>
      <PageHeader
        title="Bazaar events"
        description="Each event gets its stalls automatically. Open registration so vendors can sign up."
        actions={<Button onClick={() => setFormState({ mode: 'create' })}>+ Create event</Button>}
      />
      <Notice tone={message.tone} onClose={() => setMessage({ ...message, text: '' })}>
        {message.text}
      </Notice>

      <FilterPills
        className="mb-4"
        label="Event status"
        value={filter}
        onChange={setFilter}
        options={TABS.map((t) => ({ value: t, label: `${t[0].toUpperCase()}${t.slice(1)} (${countFor(t)})` }))}
      />

      {loading || error ? (
        <LoadState loading={loading} error={error} onRetry={reload} />
      ) : visible.length === 0 ? (
        <EmptyState>No {filter === 'all' ? '' : filter} events.</EmptyState>
      ) : (
        <div className="space-y-4">
          {visible.map((ev) => {
            const isUpcoming = ev.status === 'upcoming'
            const expanded = expandedId === ev.event_id
            const registered = ev.preregistered.length
            const assigned = ev.preregistered.filter((v) => v.slot_label).length

            return (
              <Card key={ev.event_id}>
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="flex flex-wrap items-center gap-3">
                      <h2 className="text-lg font-semibold text-ink">{ev.name}</h2>
                      <StatusBadge status={ev.status} />
                    </div>
                    <p className="mt-1 text-sm text-muted">
                      {formatLongDate(ev.date)} · {ev.location}
                    </p>
                  </div>
                  {isUpcoming && (
                    <div className="flex flex-wrap gap-2">
                      <Button size="sm" variant="secondary" onClick={() => setFormState({ mode: 'edit', event: ev })}>
                        Edit
                      </Button>
                      <Button size="sm" variant="secondary" onClick={() => toggleRegistration(ev)}>
                        {ev.registration_open ? 'Close registration' : 'Open registration'}
                      </Button>
                      <Button size="sm" variant="danger" onClick={() => setToCancel(ev)}>
                        Cancel event
                      </Button>
                    </div>
                  )}
                </div>

                <dl className="mt-4 flex flex-wrap items-center gap-x-8 gap-y-2 text-sm">
                  <div className="flex gap-1">
                    <dt className="text-muted">Stalls:</dt>
                    <dd className="font-semibold">{ev.total_slots}</dd>
                  </div>
                  <div className="flex gap-1">
                    <dt className="text-muted">Assigned:</dt>
                    <dd className="font-semibold">
                      {assigned} / {ev.total_slots}
                    </dd>
                  </div>
                  <div className="flex gap-1">
                    <dt className="text-muted">Registered:</dt>
                    <dd className="font-semibold">{registered}</dd>
                  </div>
                  {isUpcoming && (
                    <div className="flex gap-1">
                      <dt className="text-muted">Registration:</dt>
                      <dd className={`font-semibold ${ev.registration_open ? 'text-success' : 'text-muted'}`}>
                        {ev.registration_open ? 'Open' : 'Closed'}
                      </dd>
                    </div>
                  )}
                  {isUpcoming && registered > ev.total_slots && (
                    <Badge tone="warning">⚠ More vendors than stalls</Badge>
                  )}
                </dl>

                <button
                  type="button"
                  onClick={() => setExpandedId(expanded ? null : ev.event_id)}
                  aria-expanded={expanded}
                  className="mt-4 text-sm font-semibold text-brand hover:underline"
                >
                  {expanded ? 'Hide' : 'View'} registered vendors ({registered})
                </button>

                {expanded &&
                  (registered === 0 ? (
                    <p className="mt-3 text-sm text-muted">No vendors have pre-registered yet.</p>
                  ) : (
                    <ul className="mt-3 divide-y divide-line rounded-lg border border-line text-sm">
                      {ev.preregistered.map((v) => (
                        <li key={v.vendor_id} className="flex flex-wrap justify-between gap-2 px-3 py-2">
                          <span className="font-medium text-ink">{v.business_name}</span>
                          <span className="text-muted">
                            {v.slot_label ? `Stall ${v.slot_label}` : 'Waiting for stall'} · registered{' '}
                            {formatShortDate(v.registered_at)}
                          </span>
                        </li>
                      ))}
                    </ul>
                  ))}
              </Card>
            )
          })}
        </div>
      )}

      {/* Mounted only while open so the form resets each time */}
      {formState && (
        <EventFormModal
          mode={formState.mode}
          initial={formState.event}
          onSave={handleSave}
          onClose={() => setFormState(null)}
        />
      )}

      <ConfirmDialog
        open={!!toCancel}
        title="Cancel this event?"
        confirmLabel="Cancel event"
        tone="danger"
        onConfirm={confirmCancel}
        onCancel={() => setToCancel(null)}
      >
        <p>
          {toCancel?.name} will be marked as cancelled, registration will close, and its vendors and their followers
          will be notified.
        </p>
      </ConfirmDialog>
    </div>
  )
}
