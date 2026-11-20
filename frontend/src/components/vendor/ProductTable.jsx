import Table, { Td } from '../ui/Table'
import Button from '../ui/Button'
import StockSelect from './StockSelect'
import { peso } from '../../utils/format'
import { ProductImage } from '../ui/ListingImage'

function Thumb({ product }) {
  return (
    <ProductImage
      src={product.image}
      name={product.name}
      category={product.category}
      className="h-10 w-10 rounded-lg"
      iconSize={18}
    />
  )
}

// The vendor's own products with inline stock changes, edit, and delete.
export default function ProductTable({ products, onStockChange, onEdit, onDelete }) {
  return (
    <Table columns={['Product', 'Price', 'Stock status', 'Category', { label: 'Actions', align: 'right' }]}>
      {products.map((p) => (
        <tr key={p.product_id} className="hover:bg-paper">
          <Td>
            <div className="flex items-center gap-3">
              <Thumb product={p} />
              <div className="min-w-0">
                <p className="font-semibold text-ink">{p.name}</p>
                <p className="max-w-[16rem] truncate text-xs text-muted">{p.description}</p>
              </div>
            </div>
          </Td>
          <Td className="whitespace-nowrap">{peso(p.price)}</Td>
          <Td>
            <StockSelect value={p.stock_status} productName={p.name} onChange={(v) => onStockChange(p.product_id, v)} />
          </Td>
          <Td>{p.category}</Td>
          <Td align="right">
            <div className="flex justify-end gap-2">
              <Button size="sm" variant="secondary" onClick={() => onEdit(p)}>
                Edit
              </Button>
              <Button size="sm" variant="secondary" className="text-danger" onClick={() => onDelete(p)}>
                Delete
              </Button>
            </div>
          </Td>
        </tr>
      ))}
    </Table>
  )
}
