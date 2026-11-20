import { useState } from 'react'
import { approveApplication, getApplications, rejectApplication } from '../../api/admin'
import useApi from '../../hooks/useApi'
import LoadState from '../../components/common/LoadState'
import PageHeader from '../../components/ui/PageHeader'
import FilterPills from '../../components/ui/FilterPills'
import Table, { Td } from '../../components/ui/Table'
import Button from '../../components/ui/Button'
import Badge, { StatusBadge } from '../../components/ui/Badge'
import Notice from '../../components/ui/Notice'
import { ConfirmDialog } from '../../components/ui/Modal'
import { inputClass } from '../../components/ui/form'
import { formatShortDate } from '../../utils/format'

const TABS = ['pending', 'approved', 'rejected', 'all']

// Admin: review, approve, or reject vendor applications (SRS 3.1.2.1).
export default function Applications() {
  const { data, loading, error, reload, setData: setApplications } = useApi(() => getApplications(), [])
  const applications = data ?? []
  const [filter, setFilter] = useState('pending')
  const [selected, setSelected] = useState(null) // { app, action: 'approve' | 'reject' }
  const [reason, setReason] = useState('')
  const [message, setMessage] = useState({ tone: 'success', text: '' })

  const countFor = (tab) => (tab === 'all' ? applications.length : applications.filter((a) => a.status === tab).length)
  const visible = filter === 'all' ? applications : applications.filter((a) => a.status === filter)
  const isApprove = selected?.action === 'approve'

  const closeDialog = () => {
    setSelected(null)
    setReason('')
  }

  const confirmAction = async () => {
    const { app, action } = selected
    closeDialog()
    try {
      const updated =
        action === 'approve'
          ? await approveApplication(app.application_id)
          : await rejectApplication(app.application_id, reason)
      setApplications((prev) => prev.map((a) => (a.application_id === updated.application_id ? updated : a)))
      setMessage({
        tone: 'success',
        text: `${app.business_name} was ${action === 'approve' ? 'approved and can now set up their shop' : 'rejected'}. They have been notified.`,
      })
    } catch (err) {
      setMessage({ tone: 'error', text: err.message })
    }
  }

  return (
    <div>
      <PageHeader
        title="Vendor applications"
        description="Approve vendors before they can list products or join bazaars."
      />
      <Notice tone={message.tone} onClose={() => setMessage({ ...message, text: '' })}>
        {message.text}
      </Notice>

      <FilterPills
        className="mb-4"
        label="Application status"
        value={filter}
        onChange={setFilter}
        options={TABS.map((t) => ({ value: t, label: `${t[0].toUpperCase()}${t.slice(1)} (${countFor(t)})` }))}
      />

      {loading || error ? (
        <LoadState loading={loading} error={error} onRetry={reload} />
      ) : (
        <Table
          columns={['Business', 'Applicant', 'Category', 'Submitted', 'Status', { label: 'Actions', align: 'right' }]}
          isEmpty={visible.length === 0}
          empty={`No ${filter === 'all' ? '' : filter} applications.`}
        >
          {visible.map((app) => (
            <tr key={app.application_id}>
              <Td>
                <p className="font-semibold text-ink">{app.business_name}</p>
                <p className="max-w-xs text-xs text-muted">{app.business_details}</p>
                {app.ai_flag && (
                  <Badge tone="warning" className="mt-1">
                    <span title={app.ai_flag_reason || 'Flagged by AI as incomplete'}>⚠ AI flagged</span>
                  </Badge>
                )}
                {app.status === 'rejected' && app.rejection_reason && (
                  <p className="mt-1 text-xs text-danger">Reason: {app.rejection_reason}</p>
                )}
              </Td>
              <Td>
                <p className="text-ink">{app.applicant_name}</p>
                <p className="text-xs text-muted">{app.email}</p>
              </Td>
              <Td>{app.product_category}</Td>
              <Td className="whitespace-nowrap">{formatShortDate(app.submitted_at)}</Td>
              <Td>
                <StatusBadge status={app.status} />
              </Td>
              <Td align="right">
                {app.status === 'pending' ? (
                  <div className="flex justify-end gap-2">
                    <Button size="sm" variant="success" onClick={() => setSelected({ app, action: 'approve' })}>
                      Approve
                    </Button>
                    <Button size="sm" variant="secondary" onClick={() => setSelected({ app, action: 'reject' })}>
                      Reject
                    </Button>
                  </div>
                ) : (
                  <span className="text-muted">—</span>
                )}
              </Td>
            </tr>
          ))}
        </Table>
      )}

      <ConfirmDialog
        open={!!selected}
        title={isApprove ? 'Approve application?' : 'Reject application?'}
        confirmLabel={isApprove ? 'Approve' : 'Reject'}
        tone={isApprove ? 'success' : 'danger'}
        onConfirm={confirmAction}
        onCancel={closeDialog}
      >
        <p>
          {isApprove
            ? `${selected?.app.business_name} will become an approved vendor and be notified.`
            : `${selected?.app.business_name} will be notified that their application was rejected.`}
        </p>
        {!isApprove && (
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Reason for rejection (shown to the vendor)"
            aria-label="Reason for rejection"
            className={`${inputClass} mt-3`}
            rows={3}
          />
        )}
      </ConfirmDialog>
    </div>
  )
}
