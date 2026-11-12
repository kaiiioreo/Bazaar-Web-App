const STYLES = {
  in_stock: ['In stock', 'bg-emerald-100 text-emerald-800'],
  low_stock: ['Low stock', 'bg-amber-100 text-amber-900'],
  out_of_stock: ['Sold out', 'bg-stone-200 text-stone-600'],
};

export default function StockBadge({ stock }) {
  const [label, style] = STYLES[stock] ?? STYLES.in_stock;
  return <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${style}`}>{label}</span>;
}
