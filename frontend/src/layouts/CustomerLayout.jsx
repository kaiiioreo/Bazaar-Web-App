import { Outlet } from 'react-router-dom'
import { useFavorites } from '../context/FavoritesContext'

// Page shell for every /customer page. The shared Navbar sits above it.
// Guests can browse; favorites, reviews, and the account page need a customer login.
export default function CustomerLayout() {
  const { favorites, toggleFavorite } = useFavorites()

  return (
    <div className="min-h-screen bg-paper text-ink">
      <div className="mx-auto max-w-6xl px-4 pb-24">
        <Outlet context={{ favorites, toggleFavorite }} />
      </div>
    </div>
  )
}
