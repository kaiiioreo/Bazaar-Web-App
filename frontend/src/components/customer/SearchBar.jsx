import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Button from '../ui/Button'

// Natural-language search box: sends the words to /customer/search?q=...
export default function SearchBar({ defaultValue = '' }) {
  const [query, setQuery] = useState(defaultValue)
  const navigate = useNavigate()

  const handleSubmit = (e) => {
    e.preventDefault()
    if (query.trim()) navigate(`/customer/search?q=${encodeURIComponent(query.trim())}`)
  }

  return (
    <form onSubmit={handleSubmit} role="search" className="flex w-full max-w-xl gap-2">
      <input
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        aria-label="Search vendors and products"
        placeholder="Try: something sweet for a gift"
        className="min-w-0 flex-1 rounded-full border border-line bg-white px-5 py-3 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
      />
      <Button type="submit" size="lg">
        Search
      </Button>
    </form>
  )
}
