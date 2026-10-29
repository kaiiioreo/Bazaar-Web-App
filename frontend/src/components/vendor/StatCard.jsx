// Summary card. Clickable cards act as quick filters (like Wireframe D).
export default function StatCard({ label, value, hint, tone = 'text-stone-900', active, onClick }) {
  const Tag = onClick ? 'button' : 'div'
  return (
    <Tag
      onClick={onClick}
      aria-pressed={onClick ? !!active : undefined}
      className={`rounded-lg border bg-white p-4 text-left ${active ? 'border-teal-600 ring-1 ring-teal-600' : 'border-stone-200'} ${onClick ? 'cursor-pointer hover:border-stone-400' : ''}`}
    >
      <p className="text-sm text-stone-500">{label}</p>
      <p className={`mt-1 text-2xl font-semibold ${tone}`}>{value}</p>
      {hint && <p className="mt-1 truncate text-xs text-stone-500">{hint}</p>}
    </Tag>
  )
}
