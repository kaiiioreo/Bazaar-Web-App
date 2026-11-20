import { useState } from 'react'
import { getUsers, sendPasswordReset, setUserStatus } from '../../api/admin'
import useApi from '../../hooks/useApi'
import LoadState from '../../components/common/LoadState'
import PageHeader from '../../components/ui/PageHeader'
import FilterPills from '../../components/ui/FilterPills'
import SearchInput from '../../components/ui/SearchInput'
import Table, { Td } from '../../components/ui/Table'
import Button from '../../components/ui/Button'
import Badge, { StatusBadge } from '../../components/ui/Badge'
import Notice from '../../components/ui/Notice'
import { ConfirmDialog } from '../../components/ui/Modal'
import { formatShortDate } from '../../utils/format'

const ROLE_TABS = [
  { value: 'all', label: 'All users' },
  { value: 'customer', label: 'Customers' },
  { value: 'vendor', label: 'Vendors' },
]

// Admin: list customers and vendors, suspend/reactivate, send password resets (SRS 3.1.2.3).
export default function Users() {
  const { data, loading, error, reload, setData: setUsers } = useApi(() => getUsers(), [])
  // Admin accounts are managed by the Bazaar team, so only customers and vendors are listed.
  const users = (data ?? []).filter((u) => u.role !== 'admin')
  const [roleFilter, setRoleFilter] = useState('all')
  const [search, setSearch] = useState('')
  const [pending, setPending] = useState(null) // { user, action: 'reset' | 'toggle' }
  const [message, setMessage] = useState({ tone: 'success', text: '' })

  const countFor = (role) => (role === 'all' ? users.length : users.filter((u) => u.role === role).length)
  const q = search.trim().toLowerCase()
  const visible = users.filter(
    (u) =>
      (roleFilter === 'all' || u.role === roleFilter) &&
      (u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q)),
  )

  const isReset = pending?.action === 'reset'
  const suspending = pending?.user.status === 'active'

  const confirmAction = async () => {
    const { user, action } = pending
    setPending(null)
    try {
      if (action === 'reset') {
        const res = await sendPasswordReset(user.user_id)
        setMessage({
          tone: 'success',
          text: res.dev_reset_link
            ? `${res.message} Email is not set up yet, so here is the link: ${res.dev_reset_link}`
            : res.message,
        })
      } else {
        const nextStatus = user.status === 'active' ? 'suspended' : 'active'
        const updated = await setUserStatus(user.user_id, nextStatus)
        setUsers((prev) => prev.map((u) => (u.user_id === updated.user_id ? updated : u)))
        setMessage({
          tone: 'success',
          text: `${user.name}'s account was ${nextStatus === 'suspended' ? 'suspended' : 'reactivated'}.`,
        })
      }
    } catch (err) {
      setMessage({ tone: 'error', text: err.message })
    }
  }

  return (
    <div>
      <PageHeader
        title="User management"
        description="Customers and vendors who have signed up. Admin accounts are managed separately."
      />
      <Notice tone={message.tone} onClose={() => setMessage({ ...message, text: '' })}>
        {message.text}
      </Notice>

      <div className="mb-4 flex flex-wrap items-center gap-3">
        <FilterPills
          label="Role"
          value={roleFilter}
          onChange={setRoleFilter}
          options={ROLE_TABS.map((t) => ({ value: t.value, label: `${t.label} (${countFor(t.value)})` }))}
        />
        <SearchInput value={search} onChange={setSearch} placeholder="Search by name or email…" />
      </div>

      {loading || error ? (
        <LoadState loading={loading} error={error} onRetry={reload} />
      ) : (
        <Table
          columns={['Name', 'Email', 'Role', 'Joined', 'Status', { label: 'Actions', align: 'right' }]}
          isEmpty={visible.length === 0}
          empty="No users match your search."
        >
          {visible.map((u) => (
            <tr key={u.user_id}>
              <Td className="font-semibold text-ink">{u.name}</Td>
              <Td className="text-muted">{u.email}</Td>
              <Td>
                <Badge tone={u.role === 'vendor' ? 'brand' : 'neutral'} className="capitalize">
                  {u.role}
                </Badge>
              </Td>
              <Td className="whitespace-nowrap">{formatShortDate(u.created_at)}</Td>
              <Td>
                <StatusBadge status={u.status} />
              </Td>
              <Td align="right">
                <div className="flex justify-end gap-2">
                  <Button size="sm" variant="secondary" onClick={() => setPending({ user: u, action: 'reset' })}>
                    Reset password
                  </Button>
                  <Button
                    size="sm"
                    variant={u.status === 'active' ? 'danger' : 'success'}
                    onClick={() => setPending({ user: u, action: 'toggle' })}
                  >
                    {u.status === 'active' ? 'Suspend' : 'Reactivate'}
                  </Button>
                </div>
              </Td>
            </tr>
          ))}
        </Table>
      )}

      <ConfirmDialog
        open={!!pending}
        title={isReset ? 'Send password reset link?' : suspending ? 'Suspend account?' : 'Reactivate account?'}
        confirmLabel={isReset ? 'Send link' : suspending ? 'Suspend' : 'Reactivate'}
        tone={isReset ? 'primary' : suspending ? 'danger' : 'success'}
        onConfirm={confirmAction}
        onCancel={() => setPending(null)}
      >
        <p>
          {isReset
            ? `A password reset link will be emailed to ${pending?.user.email}. You will not see or set their password.`
            : suspending
              ? `${pending?.user.name} will not be able to log in until their account is reactivated.`
              : `${pending?.user.name} will be able to log in again.`}
        </p>
      </ConfirmDialog>
    </div>
  )
}
