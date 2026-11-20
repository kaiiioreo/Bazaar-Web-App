import { useOutletContext, useSearchParams } from 'react-router-dom'
import SearchBar from '../../components/customer/SearchBar'
import VendorCard from '../../components/customer/VendorCard'
import ProductCard from '../../components/customer/ProductCard'
import LoadState from '../../components/common/LoadState'
import EmptyState from '../../components/ui/EmptyState'
import Button from '../../components/ui/Button'
import useApi from '../../hooks/useApi'
import { search } from '../../api/catalog'
import { peso } from '../../utils/format'

// Natural-language search results (SRS 3.1.6.1): the backend turns everyday words into filters.
export default function SearchResults() {
  const { favorites, toggleFavorite } = useOutletContext()
  const [params] = useSearchParams()
  const q = params.get('q') ?? ''
  const {
    data: results,
    loading,
    error,
    reload,
  } = useApi(() => (q.trim() ? search(q) : Promise.resolve({ vendors: [], products: [], filters: null })), [q])

  const f = results?.filters
  const understood =
    f &&
    [
      f.keywords?.length ? `“${f.keywords.join(', ')}”` : null,
      f.category ? `in ${f.category}` : null,
      f.max_price ? `under ${peso(f.max_price)}` : null,
      f.in_stock_only ? 'in stock' : null,
    ]
      .filter(Boolean)
      .join(' ')

  return (
    <div className="py-8">
      <SearchBar key={q} defaultValue={q} />
      {understood && !loading && <p className="mt-3 text-sm text-muted">Searching for {understood}</p>}

      {loading || error ? (
        <LoadState loading={loading} error={error} onRetry={reload} />
      ) : !results.vendors.length && !results.products.length ? (
        <div className="mt-8">
          <EmptyState
            action={
              <Button to="/customer" variant="secondary">
                Browse all vendors
              </Button>
            }
          >
            No matches for “{q}”. Try a product like rosquillos, or a category like snacks or coffee.
          </EmptyState>
        </div>
      ) : (
        <>
          {results.vendors.length > 0 && (
            <section className="mt-8">
              <h2 className="font-serif text-2xl text-brand">Vendors ({results.vendors.length})</h2>
              <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {results.vendors.map((v) => (
                  <VendorCard
                    key={v.id}
                    vendor={v}
                    isFavorite={favorites.includes(v.id)}
                    onToggleFavorite={toggleFavorite}
                  />
                ))}
              </div>
            </section>
          )}
          {results.products.length > 0 && (
            <section className="mt-10">
              <h2 className="font-serif text-2xl text-brand">Products ({results.products.length})</h2>
              <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {results.products.map((p) => (
                  <ProductCard key={p.id} product={p} />
                ))}
              </div>
            </section>
          )}
        </>
      )}
    </div>
  )
}
