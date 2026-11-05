import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function SearchBar({ defaultValue = '' }) {
  const [query, setQuery] = useState(defaultValue);
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (query.trim()) navigate(`/customer/search?q=${encodeURIComponent(query.trim())}`);
  };

  return (
    <form onSubmit={handleSubmit} role="search" className="flex w-full max-w-xl gap-2">
      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        aria-label="Search vendors and products"
        placeholder="Try: something sweet for a gift"
        className="min-w-0 flex-1 rounded-full border border-stone-300 bg-white px-5 py-3 text-sm outline-none focus:border-teal-800 focus:ring-2 focus:ring-teal-800/20"
      />
      <button type="submit" className="rounded-full bg-teal-900 px-6 py-3 text-sm font-semibold text-white hover:bg-teal-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-900">
        Search
      </button>
    </form>
  );
}
