import { useCallback, useEffect, useState } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import CustomerNav from '../components/customer/CustomerNav';
import { getFavorites, toggleFavoriteVendor } from '../api/customer';
import { useAuth } from '../context/AuthContext';

// Page shell for every /customer page. Guests can browse; favorites need a customer login.
export default function CustomerLayout() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const isCustomer = user?.role === 'customer';
  const [favorites, setFavorites] = useState([]);

  useEffect(() => {
    if (!isCustomer) return;
    getFavorites().then((f) => setFavorites(f.ids)).catch(() => {});
  }, [isCustomer]);

  const toggleFavorite = useCallback(
    async (id) => {
      if (!isCustomer) {
        navigate(`/login?next=${encodeURIComponent(location.pathname)}`);
        return;
      }
      // Update the heart right away, then confirm with the server.
      setFavorites((f) => (f.includes(id) ? f.filter((x) => x !== id) : [...f, id]));
      try {
        const { favorited } = await toggleFavoriteVendor(id);
        setFavorites((f) => (favorited ? [...new Set([...f, id])] : f.filter((x) => x !== id)));
      } catch {
        setFavorites((f) => (f.includes(id) ? f.filter((x) => x !== id) : [...f, id]));
      }
    },
    [isCustomer, navigate, location.pathname],
  );

  return (
    <div className="min-h-screen bg-stone-50 text-stone-900" style={{ fontFamily: "'Bricolage Grotesque', system-ui, sans-serif" }}>
      <CustomerNav favoriteCount={isCustomer ? favorites.length : 0} />
      <main className="mx-auto max-w-6xl px-4 pb-24">
        <Outlet context={{ favorites: isCustomer ? favorites : [], toggleFavorite }} />
      </main>
    </div>
  );
}
