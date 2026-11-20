// Shown when a list has nothing in it.
export default function EmptyState({ children, action }) {
  return (
    <div className="rounded-xl border border-dashed border-line bg-white px-6 py-10 text-center text-muted">
      <p>{children}</p>
      {action && <div className="mt-4">{action}</div>}
    </div>
  )
}
