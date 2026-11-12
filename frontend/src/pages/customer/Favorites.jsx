import { Link, useOutletContext } from 'react-router-dom';
import VendorCard from '../../components/customer/VendorCard';
import { vendors } from '../../mock/customerMock';

export default function Favorites() {
  const { favorites, toggleFavorite } = useOutletContext();
  const saved = vendors.filter((v) => favorites.includes(v.id));

  return (
    <div className="py-8">
      <h1 className="text-3xl font-extrabold text-teal-950">Favorites</h1>
      {saved.length === 0 ? (
        <div className="mt-6">
          <p className="text-stone-700">No favorites yet. Tap the heart on a vendor to save it here.</p>
          <Link to="/customer" className="mt-3 inline-block text-teal-800 underline">Browse vendors</Link>
        </div>
      ) : (
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {saved.map((v) => <VendorCard key={v.id} vendor={v} isFavorite onToggleFavorite={toggleFavorite} />)}
        </div>
      )}
    </div>
  );
}
