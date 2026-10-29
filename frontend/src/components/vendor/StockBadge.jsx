import { STOCK } from './vendorHelpers'

// Color-coded pill. When onChange is given it becomes a picker (UpdateStockStatus).
export default function StockBadge({ status, onChange }) {
  const s = STOCK[status]
  if (!onChange) {
    return <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${s.cls}`}>{s.label}</span>
  }
  return (
    <select
      value={status}
      onChange={(e) => onChange(e.target.value)}
      aria-label="Stock status"
      className={`cursor-pointer rounded-full border-0 px-2.5 py-0.5 text-xs font-medium focus:outline-2 focus:outline-stone-800 ${s.cls}`}
    >
      {Object.entries(STOCK).map(([value, o]) => (
        <option key={value} value={value}>{o.label}</option>
      ))}
    </select>
  )
}
