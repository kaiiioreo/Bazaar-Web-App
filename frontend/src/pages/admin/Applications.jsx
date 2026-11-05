import { useState } from 'react'
import { applications as initialApplications } from '../../mock/applications'
import StatusBadge from '../../components/common/StatusBadge'
import ConfirmModal from '../../components/admin/ConfirmModal'

const tabs = ['pending', 'approved', 'rejected', 'all']

export default function Applications() {
  const [applications, setApplications] = useState(initialApplications)
  const [filter, setFilter] = useState('pending')
  const [selected, setSelected] = useState(null) // { app, action }
  const [reason, setReason] = useState('')

  const visible =
    filter === 'all' ? applications : applications.filter((a) => a.status === filter)

  const countFor = (tab) =>
    tab === 'all' ? applications.length : applications.filter((a) => a.status === tab).length

  const closeModal = () => {
    setSelected(null)
    setReason('')
  }

  const confirmAction = () => {
    const newStatus = selected.action === 'approve' ? 'approved' : 'rejected'
    setApplications((prev) =>
      prev.map((a) =>
        a.application_id === selected.app.application_id
          ? { ...a, status: newStatus, rejection_reason: reason }
          : a
      )
    )
    closeModal()
  }

  const isApprove = selected?.action === 'approve'

  return (
    <div>
      <h2 className="mb-6 text-2xl font-bold">Vendor Applications</h2>

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

      {/* Table */}
      <div className="overflow-x-auto rounded-lg bg-white shadow">
        <table className="w-full text-left text-sm">
          <thead className="border-b bg-slate-50 text-slate-600">
            <tr>
              <th className="px-4 py-3">Business</th>
              <th className="px-4 py-3">Applicant</th>
              <th className="px-4 py-3">Category</th>
              <th className="px-4 py-3">Submitted</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {visible.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-slate-500">
                  No {filter === 'all' ? '' : filter} applications.
                </td>
              </tr>
            )}
            {visible.map((app) => (
              <tr key={app.application_id} className="border-b last:border-0 align-top">
                <td className="px-4 py-3">
                  <p className="font-medium">{app.business_name}</p>
                  <p className="max-w-xs text-xs text-slate-500">{app.business_details}</p>
                  {app.ai_flag && (
                    <span
                      title="Flagged by AI as incomplete or inconsistent"
                      className="mt-1 inline-block rounded bg-amber-100 px-2 py-0.5 text-xs text-amber-800"
                    >
                      ⚠ AI flagged
                    </span>
                  )}
                </td>
                <td className="px-4 py-3">
                  <p>{app.applicant_name}</p>
                  <p className="text-xs text-slate-500">{app.email}</p>
                </td>
                <td className="px-4 py-3">{app.product_category}</td>
                <td className="px-4 py-3">{app.submitted_at}</td>
                <td className="px-4 py-3">
                  <StatusBadge status={app.status} />
                </td>
                <td className="px-4 py-3 text-right">
                  {app.status === 'pending' ? (
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => setSelected({ app, action: 'approve' })}
                        className="rounded bg-green-600 px-3 py-1 text-white hover:bg-green-700"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => setSelected({ app, action: 'reject' })}
                        className="rounded bg-red-600 px-3 py-1 text-white hover:bg-red-700"
                      >
                        Reject
                      </button>
                    </div>
                  ) : (
                    <span className="text-slate-400">—</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Confirm modal */}
      <ConfirmModal
        open={!!selected}
        title={isApprove ? 'Approve application?' : 'Reject application?'}
        confirmLabel={isApprove ? 'Approve' : 'Reject'}
        confirmClass={isApprove ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}
        onConfirm={confirmAction}
        onCancel={closeModal}
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
            placeholder="Reason for rejection (optional)"
            className="mt-3 w-full rounded border border-slate-300 p-2 text-sm"
            rows={3}
          />
        )}
      </ConfirmModal>
    </div>
  )
}