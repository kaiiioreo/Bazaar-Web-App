import { useState } from 'react'
import { getUsers, sendPasswordReset, setUserStatus } from '../../api/admin'
import useApi from '../../hooks/useApi'
import LoadState from '../../components/common/LoadState'
import StatusBadge from '../../components/common/StatusBadge'
import ConfirmModal from '../../components/admin/ConfirmModal'

const roleTabs = ['all', 'customer', 'vendor']

const roleStyles = {
  customer: 'bg-blue-100 text-blue-800',
  vendor: 'bg-purple-100 text-purple-800',
}

export default function Users() {
  const { data, loading, error, reload, setData: setUsers } = useApi(() => getUsers(), [])
  // Admin accounts are managed by the Bazaar team, so only customers and vendors are listed.
  const users = (data ?? []).filter((u) => u.role !== 'admin')
  const [roleFilter, setRoleFilter] = useState('all')
  const [search, setSearch] = useState('')
  const [pending, setPending] = useState(null) // { user, action: 'reset' | 'toggle' }
  const [notice, setNotice] = useState('')

  const countFor = (tab) =>
    tab === 'all' ? users.length : users.filter((u) => u.role === tab).length

  const visible = users.filter((u) => {
    const matchesRole = roleFilter === 'all' || u.role === roleFilter
    const q = search.toLowerCase()
    const matchesSearch = u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q)
    return matchesRole && matchesSearch
  })

  const confirmAction = async () => {
    const { user, action } = pending
    setPending(null)
    try {
      if (action === 'reset') {
        const res = await sendPasswordReset(user.user_id)
        setNotice(res.dev_reset_link ? `${res.message} (Email is not set up yet. Link: ${res.dev_reset_link})` : res.message)
      } else {
        const nextStatus = user.status === 'active' ? 'suspended' : 'active'
        const updated = await setUserStatus(user.user_id, nextStatus)
        setUsers((prev) => prev.map((u) => (u.user_id === updated.user_id ? updated : u)))
        setNotice(`${user.name}'s account was ${nextStatus === 'suspended' ? 'suspended' : 'reactivated'}.`)
      }
    } catch (err) {
      setNotice(`Error: ${err.message}`)
    }
  }

  const isReset = pending?.action === 'reset'
  const suspending = pending?.user.status === 'active'

  const modalTitle = isReset
    ? 'Send password reset link?'
    : suspending
      ? 'Suspend account?'
      : 'Reactivate account?'

  const modalLabel = isReset ? 'Send link' : suspending ? 'Suspend' : 'Reactivate'

  const modalClass =
    isReset
      ? 'bg-blue-600 hover:bg-blue-700'
      : suspending
        ? 'bg-red-600 hover:bg-red-700'
        : 'bg-green-600 hover:bg-green-700'

  return (
    <div>
      <h2 className="mb-6 text-2xl font-bold">User Management</h2>
      {(loading || error) && <LoadState loading={loading} error={error} onRetry={reload} />}

      {/* Success notice */}
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

      {/* Role tabs + search */}
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <div className="flex flex-wrap gap-2">
          {roleTabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setRoleFilter(tab)}
              className={`rounded-full px-4 py-1.5 text-sm capitalize ${
                roleFilter === tab
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-slate-700 shadow hover:bg-slate-100'
              }`}
            >
              {tab === 'all' ? 'All users' : `${tab}s`} ({countFor(tab)})
            </button>
          ))}
        </div>
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name or email..."
          className="w-full max-w-xs rounded border border-slate-300 bg-white px-3 py-2 text-sm"
        />
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-lg bg-white shadow">
        <table className="w-full text-left text-sm">
          <thead className="border-b bg-slate-50 text-slate-600">
            <tr>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Role</th>
              <th className="px-4 py-3">Joined</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {visible.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-slate-500">
                  No users match your search.
                </td>
              </tr>
            )}
            {visible.map((u) => (
              <tr key={u.user_id} className="border-b last:border-0">
                <td className="px-4 py-3 font-medium">{u.name}</td>
                <td className="px-4 py-3 text-slate-600">{u.email}</td>
                <td className="px-4 py-3">
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${roleStyles[u.role]}`}
                  >
                    {u.role}
                  </span>
                </td>
                <td className="px-4 py-3">{u.created_at}</td>
                <td className="px-4 py-3">
                  <StatusBadge status={u.status} />
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => setPending({ user: u, action: 'reset' })}
                      className="rounded border border-slate-300 px-3 py-1 hover:bg-slate-50"
                    >
                      Reset password
                    </button>
                    <button
                      onClick={() => setPending({ user: u, action: 'toggle' })}
                      className={`rounded px-3 py-1 text-white ${
                        u.status === 'active'
                          ? 'bg-red-600 hover:bg-red-700'
                          : 'bg-green-600 hover:bg-green-700'
                      }`}
                    >
                      {u.status === 'active' ? 'Suspend' : 'Reactivate'}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Confirmation modal (shared by both actions) */}
      <ConfirmModal
        open={!!pending}
        title={modalTitle}
        confirmLabel={modalLabel}
        confirmClass={modalClass}
        onConfirm={confirmAction}
        onCancel={() => setPending(null)}
      >
        <p>
          {isReset
            ? `A password reset link will be emailed to ${pending?.user.email}. You will not see or set their password.`
            : suspending
              ? `${pending?.user.name} will no longer be able to log in until their account is reactivated.`
              : `${pending?.user.name} will be able to log in again.`}
        </p>
      </ConfirmModal>
    </div>
  )
}