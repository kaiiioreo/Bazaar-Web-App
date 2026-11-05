import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import CustomerNav from '../components/customer/CustomerNav';

// Page shell for every /customer page.
// TODO: when core-ui (Melgar) merges the shared Navbar and chatbot widget,
// swap CustomerNav for the shared Navbar and add the chatbot widget here.
// Favorites live in memory for now; move to the backend in Phase 2.
export default function CustomerLayout() {
  const [favorites, setFavorites] = useState([]);

  const toggleFavorite = (id) =>
    setFavorites((f) => (f.includes(id) ? f.filter((x) => x !== id) : [...f, id]));

  return (
    <div className="min-h-screen bg-stone-50 text-stone-900" style={{ fontFamily: "'Bricolage Grotesque', system-ui, sans-serif" }}>
      <CustomerNav favoriteCount={favorites.length} />
      <main className="mx-auto max-w-6xl px-4 pb-24">
        <Outlet context={{ favorites, toggleFavorite }} />
      </main>
    </div>
  );
}
