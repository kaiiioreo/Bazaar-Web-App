export default function StatCard({ label, value }) {
  return (
    <div className="rounded-lg bg-white p-5 shadow">
      <p className="text-sm text-slate-500">{label}</p>
      <p className="mt-1 text-3xl font-bold text-slate-900">{value}</p>
    </div>
  )
}