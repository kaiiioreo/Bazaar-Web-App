import { Link } from 'react-router-dom'
import { StockBadge } from '../ui/Badge'
import { peso } from '../../utils/format'
import FadeImg from '../ui/FadeImg'

// Product card. On browse/search pages the whole card links to the vendor's shop.
// On the vendor's own page (showVendor = false) it is not a link, since you're already there.
export default function ProductCard({ product, showVendor = true }) {
  const linked = showVendor && product.vendorId

  const content = (
    <>
      {product.image && (
        <FadeImg src={product.image} alt={product.name} className="h-36 w-full object-cover" loading="lazy" />
      )}
      <div className="flex flex-1 flex-col p-4">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-semibold text-ink">{product.name}</h3>
          <StockBadge stock={product.stock} />
        </div>
        <p className="mt-1 text-sm text-muted">{product.description}</p>
        <div className="mt-auto flex items-end justify-between gap-2 pt-4">
          <p className="text-lg font-bold text-brand">{peso(product.price)}</p>
          {linked && product.vendorName && (
            <span className="text-right text-sm font-medium text-brand group-hover:text-accent group-hover:underline">
              {product.vendorName} →
            </span>
          )}
        </div>
      </div>
    </>
  )

  const cardClass = 'flex h-full flex-col overflow-hidden rounded-xl border border-line bg-white'
  if (!linked) return <article className={cardClass}>{content}</article>

  return (
    <Link
      to={`/customer/vendors/${product.vendorId}`}
      aria-label={`${product.name}, ${peso(product.price)}, sold by ${product.vendorName}. View shop`}
      className={`group ${cardClass} transition hover:-translate-y-0.5 hover:border-muted hover:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand`}
    >
      {content}
    </Link>
  )
}
