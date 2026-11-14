import { Link, useOutletContext } from 'react-router-dom';
import VendorCard from '../../components/customer/VendorCard';
import LoadState from '../../components/common/LoadState';
import useApi from '../../hooks/useApi';
import { getFavorites } from '../../api/customer';

export default function Favorites() {
  const { favorites, toggleFavorite } = useOutletContext();
  const { data, loading, error, reload } = useApi(() => getFavorites(), []);

  if (loading || error) return <LoadState loading={loading} error={error} onRetry={reload} />;

  // Keep a vendor on screen after un-hearting it until the page reloads, so it can be re-saved.
  const saved = data.vendors;

  return (
    <div className="py-8">
      <h1 className="text-3xl font-extrabold text-teal-950">Favorites</h1>
      <p className="mt-1 text-stone-600">You’ll get a notification when these vendors are scheduled for a bazaar or restock.</p>
      {saved.length === 0 ? (
        <div className="mt-6">
          <p className="text-stone-700">No favorites yet. Tap the heart on a vendor to save it here.</p>
          <Link to="/customer" className="mt-3 inline-block text-teal-800 underline">Browse vendors</Link>
        </div>
      ) : (
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {saved.map((v) => (
            <VendorCard key={v.id} vendor={v} isFavorite={favorites.includes(v.id)} onToggleFavorite={toggleFavorite} />
          ))}
        </div>
      )}
    </div>
  );
}
