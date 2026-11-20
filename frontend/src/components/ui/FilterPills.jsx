// Row of pill buttons for picking one filter.
//   <FilterPills options={[{ value: 'all', label: 'All (4)' }, ...]} value={filter} onChange={setFilter} />
export default function FilterPills({ options, value, onChange, label = 'Filter', className = '' }) {
  return (
    <div role="group" aria-label={label} className={`flex flex-wrap gap-2 ${className}`}>
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          onClick={() => onChange(o.value)}
          aria-pressed={value === o.value}
          className={`rounded-full border px-4 py-1.5 text-sm transition ${
            value === o.value ? 'border-brand bg-brand text-white' : 'border-line bg-white text-ink hover:border-muted'
          }`}
        >
          {o.label}
        </button>
      ))}
    </div>
  )
}
