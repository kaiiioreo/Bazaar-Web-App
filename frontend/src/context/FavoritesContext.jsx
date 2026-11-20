/* eslint-disable react-refresh/only-export-components */
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { getFavorites, toggleFavoriteVendor } from '../api/customer'
import { useAuth } from './AuthContext'

// The customer's favorited vendor ids, shared by the navbar (count) and the customer pages (hearts).
const FavoritesContext = createContext(null)

export function FavoritesProvider({ children }) {
  const { user } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const isCustomer = user?.role === 'customer'
  const [ids, setIds] = useState([])

  useEffect(() => {
    if (!isCustomer) return
    let active = true
    getFavorites()
      .then((f) => active && setIds(f.ids))
      .catch(() => {})
    return () => {
      active = false
    }
  }, [isCustomer, user?.user_id])

  const toggleFavorite = useCallback(
    async (id) => {
      if (!isCustomer) {
        navigate(`/login?next=${encodeURIComponent(location.pathname)}`)
        return
      }
      // Update the heart right away, then confirm with the server.
      setIds((f) => (f.includes(id) ? f.filter((x) => x !== id) : [...f, id]))
      try {
        const { favorited } = await toggleFavoriteVendor(id)
        setIds((f) => (favorited ? [...new Set([...f, id])] : f.filter((x) => x !== id)))
      } catch {
        setIds((f) => (f.includes(id) ? f.filter((x) => x !== id) : [...f, id]))
      }
    },
    [isCustomer, navigate, location.pathname],
  )

  const value = useMemo(() => ({ favorites: isCustomer ? ids : [], toggleFavorite }), [isCustomer, ids, toggleFavorite])
  return <FavoritesContext.Provider value={value}>{children}</FavoritesContext.Provider>
}

export function useFavorites() {
  return useContext(FavoritesContext)
}
