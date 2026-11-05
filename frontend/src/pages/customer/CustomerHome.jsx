import { useState } from 'react';
import { Link, useOutletContext } from 'react-router-dom';
import SearchBar from '../../components/customer/SearchBar';
import VendorCard from '../../components/customer/VendorCard';
import ProductCard from '../../components/customer/ProductCard';
import Awning from '../../components/customer/Awning';
import formatDate from '../../components/customer/formatDate';
import { vendors, products, events } from '../../mock/customerMock';

const categories = ['All', ...new Set(vendors.map((v) => v.category))];

export default function CustomerHome() {
  const { favorites, toggleFavorite } = useOutletContext();
  const [category, setCategory] = useState('All');
  const next = events[0];
  const shownVendors = category === 'All' ? vendors : vendors.filter((v) => v.category === category);
  const available = products.filter((p) => p.stock !== 'out_of_stock').slice(0, 4);

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

        <Link to="/customer/schedule" className="block overflow-hidden rounded-2xl border border-stone-200 bg-white">
          <Awning color="#d97706" className="h-5" />
          <div className="p-5">
            <p className="text-sm text-stone-500">Next bazaar</p>
            <p className="mt-1 text-2xl font-bold text-teal-950">{next.name}</p>
            <p className="mt-1 text-sm text-stone-700">{formatDate(next.date)}</p>
            <p className="text-sm text-stone-700">{next.location}</p>
            <p className="mt-4 text-sm font-medium text-teal-800">{next.vendorIds.length} vendors confirmed</p>
          </div>
        </Link>
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
      </section>

      <section className="mt-12" aria-labelledby="products-heading">
        <h2 id="products-heading" className="text-2xl font-bold text-teal-950">Available now</h2>
        <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {available.map((p) => <ProductCard key={p.id} product={p} />)}
        </div>
      </section>
    </>
  );
}
