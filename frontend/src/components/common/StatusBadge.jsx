const styles = {
  pending: 'bg-yellow-100 text-yellow-800',
  approved: 'bg-green-100 text-green-800',
  rejected: 'bg-red-100 text-red-800',
  active: 'bg-green-100 text-green-800',
  suspended: 'bg-slate-200 text-slate-700',
}

export default function StatusBadge({ status }) {
  return (
    <span
      className={`rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${
        styles[status] ?? 'bg-slate-100 text-slate-700'
      }`}
    >
      {status}
    </span>
  )
}