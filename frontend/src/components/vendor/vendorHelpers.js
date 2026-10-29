// Display settings and helpers shared by the vendor components.
export const STOCK = {
  in_stock: { label: 'In stock', cls: 'bg-green-100 text-green-800' },
  low_stock: { label: 'Low stock', cls: 'bg-amber-100 text-amber-800' },
  out_of_stock: { label: 'Out of stock', cls: 'bg-red-100 text-red-800' },
}

export const CATEGORIES = ['Accessories', 'Home', 'Food', 'Crafts', 'Clothing']

// formatDate('2026-11-07', { month: 'short', day: 'numeric' }) -> 'Nov 7'
export function formatDate(iso, options) {
  return new Date(`${iso}T00:00:00`).toLocaleDateString('en-US', options)
}
