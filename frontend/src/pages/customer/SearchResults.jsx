import { Link, useOutletContext, useSearchParams } from 'react-router-dom';
import SearchBar from '../../components/customer/SearchBar';
import VendorCard from '../../components/customer/VendorCard';
import ProductCard from '../../components/customer/ProductCard';
import { searchCatalog } from '../../mock/customerMock';

export default function SearchResults() {
  const { favorites, toggleFavorite } = useOutletContext();
  const [params] = useSearchParams();
  const q = params.get('q') ?? '';
  const results = searchCatalog(q);
  const empty = !results.vendors.length && !results.products.length;

  return (
    <div className="py-8">
      <SearchBar key={q} defaultValue={q} />
      {empty ? (
        <div className="mt-8">
          <p className="text-lg font-semibold text-teal-950">No matches for "{q}"</p>
          <p className="mt-1 text-stone-600">Try a product like rosquillos, or a category like snacks or coffee.</p>
          <Link to="/customer" className="mt-4 inline-block text-teal-800 underline">Browse all vendors</Link>
        </div>
      ) : (
        <>
          {results.vendors.length > 0 && (
            <section className="mt-8">
              <h2 className="text-xl font-bold text-teal-950">Vendors ({results.vendors.length})</h2>
              <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {results.vendors.map((v) => (
                  <VendorCard key={v.id} vendor={v} isFavorite={favorites.includes(v.id)} onToggleFavorite={toggleFavorite} />
                ))}
              </div>
            </section>
          )}
          {results.products.length > 0 && (
            <section className="mt-10">
              <h2 className="text-xl font-bold text-teal-950">Products ({results.products.length})</h2>
              <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {results.products.map((p) => <ProductCard key={p.id} product={p} />)}
              </div>
            </section>
          )}
        </>
      )}
    </div>
  );
}
