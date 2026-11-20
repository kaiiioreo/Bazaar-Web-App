// Values shared by several pages. Categories must match backend/src/lib/constants.js.
export const CATEGORIES = [
  'Food',
  'Snacks',
  'Drinks',
  'Produce',
  'Baked Goods',
  'Crafts',
  'Accessories',
  'Clothing',
  'Home',
  'Plants',
  'Other',
]

export const STOCK = {
  in_stock: { label: 'In stock', tone: 'success' },
  low_stock: { label: 'Low stock', tone: 'warning' },
  out_of_stock: { label: 'Out of stock', tone: 'danger' },
}
