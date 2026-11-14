import { useState } from 'react';
import { Link, useOutletContext } from 'react-router-dom';
import SearchBar from '../../components/customer/SearchBar';
import VendorCard from '../../components/customer/VendorCard';
import ProductCard from '../../components/customer/ProductCard';
import Awning from '../../components/customer/Awning';
import formatDate from '../../components/customer/formatDate';
import LoadState from '../../components/common/LoadState';
import useApi from '../../hooks/useApi';
import { getEvents, getProducts, getVendors } from '../../api/catalog';

export default function CustomerHome() {
  const { favorites, toggleFavorite } = useOutletContext();
  const [category, setCategory] = useState('All');
  const { data, loading, error, reload } = useApi(
    () =>
      Promise.all([getVendors(), getProducts({ stock: 'available', limit: 8 }), getEvents()]).then(
        ([vendors, products, events]) => ({ vendors, products, events }),
      ),
    [],
  );

  if (loading || error) return <LoadState loading={loading} error={error} onRetry={reload} />;

  const { vendors, products, events } = data;
  const categories = ['All', ...new Set(vendors.map((v) => v.category))];
  const next = events[0];
  const shownVendors = category === 'All' ? vendors : vendors.filter((v) => v.category === category);
  const available = products.slice(0, 4);

  return (
    <>
      <section className="grid gap-8 py-10 md:grid-cols-[1.2fr_1fr] md:items-center">
        <div>
          <h1 className="text-4xl font-extrabold leading-tight text-teal-950 md:text-5xl">
            Find who is selling what, before you go.
          </h1>
          <p className="mt-4 max-w-md text-stone-600">
            Browse vendors, check what is in stock, and see which stalls will be at the next bazaar.
          </p>
          <div className="mt-6"><SearchBar /></div>
        </div>

        {next ? (
          <Link to="/customer/schedule" className="block overflow-hidden rounded-2xl border border-stone-200 bg-white">
            <Awning color="#d97706" className="h-5" />
            <div className="p-5">
              <p className="text-sm text-stone-500">Next bazaar</p>
              <p className="mt-1 text-2xl font-bold text-teal-950">{next.name}</p>
              <p className="mt-1 text-sm text-stone-700">{formatDate(next.date)}</p>
              <p className="text-sm text-stone-700">{next.location}</p>
              <p className="mt-4 text-sm font-medium text-teal-800">{next.vendors.length} vendors confirmed</p>
            </div>
          </Link>
        ) : (
          <div className="rounded-2xl border border-dashed border-stone-300 bg-white p-5 text-stone-600">
            No upcoming bazaars yet. Check back soon.
          </div>
        )}
      </section>

      <section aria-labelledby="vendors-heading">
        <h2 id="vendors-heading" className="text-2xl font-bold text-teal-950">Vendors</h2>
        <div className="mt-3 flex flex-wrap gap-2">
          {categories.map((c) => (
            <button key={c} type="button" onClick={() => setCategory(c)} aria-pressed={category === c}
              className={`rounded-full border px-4 py-1.5 text-sm ${category === c ? 'border-teal-900 bg-teal-900 text-white' : 'border-stone-300 bg-white text-stone-700 hover:border-stone-500'}`}>
              {c}
            </button>
          ))}
        </div>
        <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {shownVendors.map((v) => (
            <VendorCard key={v.id} vendor={v} isFavorite={favorites.includes(v.id)} onToggleFavorite={toggleFavorite} />
          ))}
        </div>
        {shownVendors.length === 0 && <p className="mt-4 text-stone-600">No vendors yet.</p>}
      </section>

      {available.length > 0 && (
        <section className="mt-12" aria-labelledby="products-heading">
          <h2 id="products-heading" className="text-2xl font-bold text-teal-950">Available now</h2>
          <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {available.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        </section>
      )}
    </>
  );
}
