import { STOCK } from '../../utils/constants'

const TONE_CLASS = {
  success: 'bg-success-soft text-success',
  warning: 'bg-warning-soft text-warning',
  danger: 'bg-danger-soft text-danger',
}

// Colour-coded stock picker used in the vendor's product table (UpdateStockStatus).
export default function StockSelect({ value, onChange, productName }) {
  const s = STOCK[value] ?? STOCK.in_stock
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      aria-label={`Stock status for ${productName}`}
      className={`cursor-pointer rounded-full border-0 px-2.5 py-1 text-xs font-semibold ${TONE_CLASS[s.tone]}`}
    >
      {Object.entries(STOCK).map(([v, o]) => (
        <option key={v} value={v}>
          {o.label}
        </option>
      ))}
    </select>
  )
}
