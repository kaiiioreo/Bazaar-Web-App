import { Link } from 'react-router-dom';
import StockBadge from './StockBadge';

export default function ProductCard({ product, showVendor = true }) {
  return (
    <article className="flex flex-col overflow-hidden rounded-xl border border-stone-200 bg-white">
      {product.image && <img src={product.image} alt={product.name} className="h-36 w-full object-cover" loading="lazy" />}
      <div className="flex flex-1 flex-col p-4">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-semibold text-teal-950">{product.name}</h3>
          <StockBadge stock={product.stock} />
        </div>
        <p className="mt-1 text-sm text-stone-600">{product.description}</p>
        <div className="mt-auto flex items-end justify-between pt-4">
          <p className="text-lg font-bold text-teal-950">₱{product.price}</p>
          {showVendor && product.vendorName && (
            <Link to={`/customer/vendors/${product.vendorId}`} className="text-sm text-teal-800 underline-offset-2 hover:underline">
              {product.vendorName}
            </Link>
          )}
        </div>
      </div>
    </article>
  );
}
