import { useOutletContext } from 'react-router-dom'
import VendorCard from '../../components/customer/VendorCard'
import LoadState from '../../components/common/LoadState'
import PageHeader from '../../components/ui/PageHeader'
import EmptyState from '../../components/ui/EmptyState'
import Button from '../../components/ui/Button'
import useApi from '../../hooks/useApi'
import { getFavorites } from '../../api/customer'

// Saved vendors (SRS 3.1.3.2). Un-hearting keeps the card here until the page reloads, so it can be re-saved.
export default function Favorites() {
  const { favorites, toggleFavorite } = useOutletContext()
  const { data, loading, error, reload } = useApi(() => getFavorites(), [])

  return (
    <div className="py-8">
      <PageHeader
        title="Favorites"
        description="You’ll get a notification when these vendors are scheduled for a bazaar or restock."
      />
      {loading || error ? (
        <LoadState loading={loading} error={error} onRetry={reload} />
      ) : data.vendors.length === 0 ? (
        <EmptyState action={<Button to="/customer">Browse vendors</Button>}>
          No favorites yet. Tap the heart on a vendor to save it here.
        </EmptyState>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 stagger">
          {data.vendors.map((v) => (
            <VendorCard key={v.id} vendor={v} isFavorite={favorites.includes(v.id)} onToggleFavorite={toggleFavorite} />
          ))}
        </div>
      )}
    </div>
  )
}
