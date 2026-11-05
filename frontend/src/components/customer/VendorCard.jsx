import { Link } from 'react-router-dom';
import Awning from './Awning';

export default function VendorCard({ vendor, isFavorite, onToggleFavorite }) {
  return (
    <article className="relative overflow-hidden rounded-xl border border-stone-200 bg-white transition hover:border-stone-400">
      <Awning color={vendor.accent} />
      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="font-bold text-teal-950">
              {/* Stretched link: the whole card is clickable, the heart button stays separate */}
              <Link to={`/customer/vendors/${vendor.id}`} className="after:absolute after:inset-0 focus-visible:outline-none focus-visible:after:ring-2 focus-visible:after:ring-teal-800">
                {vendor.name}
              </Link>
            </h3>
            <p className="text-sm text-stone-500">{vendor.category}</p>
          </div>
          <button
            type="button"
            onClick={() => onToggleFavorite(vendor.id)}
            aria-pressed={isFavorite}
            aria-label={isFavorite ? `Remove ${vendor.name} from favorites` : `Save ${vendor.name} to favorites`}
            className={`relative z-10 rounded-full px-2 py-1 text-lg leading-none ${isFavorite ? 'text-rose-600' : 'text-stone-400 hover:text-rose-500'}`}
          >
            {isFavorite ? '♥' : '♡'}
          </button>
        </div>
        <p className="mt-3 line-clamp-2 text-sm text-stone-600">{vendor.description}</p>
        <p className="mt-3 text-sm font-medium text-stone-800">★ {vendor.rating} <span className="font-normal text-stone-500">({vendor.reviewCount} reviews)</span></p>
      </div>
    </article>
  );
}
