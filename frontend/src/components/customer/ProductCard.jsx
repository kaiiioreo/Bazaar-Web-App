import { Link } from 'react-router-dom';
import StockBadge from './StockBadge';
import { getVendor } from '../../mock/customerMock';

export default function ProductCard({ product }) {
  const vendor = getVendor(product.vendorId);
  return (
    <article className="flex flex-col rounded-xl border border-stone-200 bg-white p-4">
      <div className="flex items-start justify-between gap-2">
        <h3 className="font-semibold text-teal-950">{product.name}</h3>
        <StockBadge stock={product.stock} />
      </div>
      <p className="mt-1 text-sm text-stone-600">{product.description}</p>
      <div className="mt-auto flex items-end justify-between pt-4">
        <p className="text-lg font-bold text-teal-950">₱{product.price}</p>
        {vendor && (
          <Link to={`/customer/vendors/${vendor.id}`} className="text-sm text-teal-800 underline-offset-2 hover:underline">
            {vendor.name}
          </Link>
        )}
      </div>
    </article>
  );
}
