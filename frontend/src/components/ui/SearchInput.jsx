// Search box used above lists and tables.
export default function SearchInput({ value, onChange, placeholder = 'Search…', label, className = '' }) {
  return (
    <input
      type="search"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      aria-label={label ?? placeholder}
      className={`w-full max-w-xs rounded-full border border-line bg-white px-4 py-2 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/20 ${className}`}
    />
  )
}
