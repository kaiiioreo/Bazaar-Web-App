import { Link } from 'react-router-dom'
import Awning from './Awning'
import { plural } from '../../utils/format'
import { VendorAvatar } from '../ui/ListingImage'

// Vendor summary card. The whole card links to the shop; the heart saves it to favorites.
export default function VendorCard({ vendor, isFavorite, onToggleFavorite }) {
  return (
    <article className="relative overflow-hidden rounded-xl border border-line bg-white transition hover:-translate-y-0.5 hover:border-muted hover:shadow-sm">
      <Awning color={vendor.accent} />
      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          <VendorAvatar
            src={vendor.image}
            name={vendor.name}
            category={vendor.category}
            className="h-12 w-12 shrink-0"
          />
          <div className="min-w-0 flex-1">
            <h3 className="font-semibold text-ink">
              {/* Stretched link: the whole card is clickable, the heart button stays separate */}
              <Link
                to={`/customer/vendors/${vendor.id}`}
                className="after:absolute after:inset-0 focus-visible:outline-none focus-visible:after:rounded-xl focus-visible:after:ring-2 focus-visible:after:ring-brand"
              >
                {vendor.name}
              </Link>
            </h3>
            <p className="text-sm text-muted">{vendor.category}</p>
          </div>
          <button
            type="button"
            onClick={() => onToggleFavorite(vendor.id)}
            aria-pressed={isFavorite}
            aria-label={isFavorite ? `Remove ${vendor.name} from favorites` : `Save ${vendor.name} to favorites`}
            className={`relative z-10 rounded-full px-2 py-1 text-lg leading-none transition ${isFavorite ? 'text-accent' : 'text-muted hover:text-accent'}`}
          >
            <span key={isFavorite ? 'on' : 'off'} className={`inline-block ${isFavorite ? 'animate-heart' : ''}`}>
              {isFavorite ? '♥' : '♡'}
            </span>
          </button>
        </div>
        <p className="mt-3 line-clamp-2 text-sm text-muted">{vendor.description}</p>
        <p className="mt-3 text-sm font-medium text-ink">
          {vendor.reviewCount ? (
            <>
              ★ {vendor.rating} <span className="font-normal text-muted">({plural(vendor.reviewCount, 'review')})</span>
            </>
          ) : (
            <span className="font-normal text-muted">No reviews yet</span>
          )}
        </p>
      </div>
    </article>
  )
}
