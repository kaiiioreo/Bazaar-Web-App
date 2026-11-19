import { Link } from 'react-router-dom';
import StockBadge from './StockBadge';

// Product card. On browse/search pages the whole card links to the vendor's shop.
// On the vendor's own page (showVendor = false) it is not a link, since you're already there.
export default function ProductCard({ product, showVendor = true }) {
  const linked = showVendor && product.vendorId;

  const content = (
    <>
      {product.image && <img src={product.image} alt={product.name} className="h-36 w-full object-cover" loading="lazy" />}
      <div className="flex flex-1 flex-col p-4">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-semibold text-teal-950">{product.name}</h3>
          <StockBadge stock={product.stock} />
        </div>
        <p className="mt-1 text-sm text-stone-600">{product.description}</p>
        <div className="mt-auto flex items-end justify-between gap-2 pt-4">
          <p className="text-lg font-bold text-teal-950">₱{product.price}</p>
          {linked && product.vendorName && (
            <span className="text-right text-sm text-teal-800 group-hover:underline">
              {product.vendorName} →
            </span>
          )}
        </div>
      </div>
    </>
  );

  const cardClass = 'flex h-full flex-col overflow-hidden rounded-xl border border-stone-200 bg-white';

  if (!linked) return <article className={cardClass}>{content}</article>;

  return (
    <Link
      to={`/customer/vendors/${product.vendorId}`}
      aria-label={`${product.name}, ₱${product.price}, sold by ${product.vendorName}. View shop`}
      className={`group ${cardClass} transition hover:border-stone-400 hover:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-800`}
    >
      {content}
    </Link>
  );
}