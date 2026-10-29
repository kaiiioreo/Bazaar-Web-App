import StockBadge from './StockBadge'

function Thumb({ p }) {
  return p.image ? (
    <img src={p.image} alt={p.name} className="h-10 w-10 rounded object-cover" />
  ) : (
    <div className="grid h-10 w-10 place-items-center rounded bg-teal-50 text-sm font-semibold text-teal-700" aria-hidden="true">
      {p.name[0]}
    </div>
  )
}

export default function ProductTable({ products, onStockChange, onEdit, onDelete }) {
  return (
    <div className="overflow-x-auto rounded-lg border border-stone-200 bg-white">
      <table className="w-full min-w-[620px] text-left text-sm">
        <thead className="bg-stone-50 text-stone-500">
          <tr>
            <th className="px-4 py-2.5 font-normal">Product</th>
            <th className="px-4 py-2.5 font-normal">Price</th>
            <th className="px-4 py-2.5 font-normal">Stock status</th>
            <th className="px-4 py-2.5 font-normal">Category</th>
            <th className="px-4 py-2.5 text-right font-normal">Actions</th>
          </tr>
        </thead>
        <tbody>
          {products.map((p) => (
            <tr key={p.product_id} className="border-t border-stone-100 hover:bg-stone-50">
              <td className="px-4 py-3">
                <div className="flex items-center gap-3">
                  <Thumb p={p} />
                  <div>
                    <p className="font-medium">{p.name}</p>
                    <p className="max-w-[16rem] truncate text-xs text-stone-500">{p.description}</p>
                  </div>
                </div>
              </td>
              <td className="px-4 py-3">₱{p.price.toLocaleString()}</td>
              <td className="px-4 py-3"><StockBadge status={p.stock_status} onChange={(v) => onStockChange(p.product_id, v)} /></td>
              <td className="px-4 py-3">{p.category}</td>
              <td className="px-4 py-3 text-right">
                <button onClick={() => onEdit(p)} className="mr-2 rounded border border-stone-300 px-2.5 py-1 text-xs hover:bg-stone-100">Edit</button>
                <button onClick={() => onDelete(p.product_id)} className="rounded border border-stone-300 px-2.5 py-1 text-xs text-red-700 hover:bg-red-50">Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
