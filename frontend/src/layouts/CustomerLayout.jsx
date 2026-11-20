import { Outlet, useLocation } from 'react-router-dom'
import { useFavorites } from '../context/FavoritesContext'

// Page shell for every /customer page. The shared Navbar sits above it.
// Guests can browse; favorites, reviews, and the account page need a customer login.
export default function CustomerLayout() {
  const { favorites, toggleFavorite } = useFavorites()
  const { pathname } = useLocation()

  return (
    <div className="min-h-screen bg-paper text-ink">
      {/* key restarts the gentle fade on each page change (opacity only, see index.css) */}
      <div key={pathname} className="mx-auto max-w-6xl animate-page-in px-4 pb-24">
        <Outlet context={{ favorites, toggleFavorite }} />
      </div>
    </div>
  )
}
