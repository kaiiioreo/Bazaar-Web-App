import { useState } from 'react'
import { Link, useOutletContext } from 'react-router-dom'
import SearchBar from '../../components/customer/SearchBar'
import VendorCard from '../../components/customer/VendorCard'
import ProductCard from '../../components/customer/ProductCard'
import Awning from '../../components/customer/Awning'
import LoadState from '../../components/common/LoadState'
import FilterPills from '../../components/ui/FilterPills'
import EmptyState from '../../components/ui/EmptyState'
import useApi from '../../hooks/useApi'
import { getEvents, getProducts, getVendors } from '../../api/catalog'
import { formatLongDate, plural } from '../../utils/format'

// Browse page for guests and customers (SRS 3.1.3.1, 3.1.4.1).
export default function CustomerHome() {
  const { favorites, toggleFavorite } = useOutletContext()
  const [category, setCategory] = useState('All')
  const { data, loading, error, reload } = useApi(
    () =>
      Promise.all([getVendors(), getProducts({ stock: 'available', limit: 8 }), getEvents()]).then(
        ([vendors, products, events]) => ({ vendors, products, events }),
      ),
    [],
  )

  if (loading || error) return <LoadState loading={loading} error={error} onRetry={reload} />

  const { vendors, products, events } = data
  const categories = ['All', ...new Set(vendors.map((v) => v.category))]
  const next = events[0]
  const shownVendors = category === 'All' ? vendors : vendors.filter((v) => v.category === category)

  return (
    <>
      <section className="grid gap-8 py-10 md:grid-cols-[1.2fr_1fr] md:items-center">
        <div>
          <h1 className="font-serif text-4xl leading-tight text-brand md:text-5xl">
            Find who is selling what, before you go.
          </h1>
          <p className="mt-4 max-w-md text-muted">
            Browse vendors, check what is in stock, and see which stalls will be at the next bazaar.
          </p>
          <div className="mt-6">
            <SearchBar />
          </div>
        </div>

        {next ? (
          <Link
            to="/customer/schedule"
            className="block overflow-hidden rounded-2xl border border-line bg-white transition hover:border-muted hover:shadow-sm"
          >
            <Awning color="#b86f57" className="h-5" />
            <div className="p-5">
              <p className="text-sm text-muted">Next bazaar</p>
              <p className="mt-1 font-serif text-2xl text-brand">{next.name}</p>
              <p className="mt-1 text-sm text-ink">{formatLongDate(next.date)}</p>
              <p className="text-sm text-ink">{next.location}</p>
              <p className="mt-4 text-sm font-semibold text-accent">
                {plural(next.vendors.length, 'vendor')} confirmed →
              </p>
            </div>
          </Link>
        ) : (
          <EmptyState>No upcoming bazaars yet. Check back soon.</EmptyState>
        )}
      </section>

      <section aria-labelledby="vendors-heading">
        <h2 id="vendors-heading" className="font-serif text-3xl text-brand">
          Vendors
        </h2>
        <FilterPills
          className="mt-3"
          label="Vendor category"
          value={category}
          onChange={setCategory}
          options={categories.map((c) => ({ value: c, label: c }))}
        />
        {shownVendors.length === 0 ? (
          <div className="mt-5">
            <EmptyState>No vendors yet.</EmptyState>
          </div>
        ) : (
          <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 stagger">
            {shownVendors.map((v) => (
              <VendorCard
                key={v.id}
                vendor={v}
                isFavorite={favorites.includes(v.id)}
                onToggleFavorite={toggleFavorite}
              />
            ))}
          </div>
        )}
      </section>

      {products.length > 0 && (
        <section className="mt-12" aria-labelledby="products-heading">
          <h2 id="products-heading" className="font-serif text-3xl text-brand">
            Available now
          </h2>
          <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4 stagger">
            {products.slice(0, 4).map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}
    </>
  )
}
