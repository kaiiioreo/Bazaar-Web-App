// Shows a loading placeholder or an error message while data loads.
//   if (loading || error) return <LoadState loading={loading} error={error} onRetry={reload} />
// While loading it shows grey "skeleton" bars, which feel faster than a "Loading…" line.
export default function LoadState({ loading, error, onRetry }) {
  if (loading)
    return (
      <div className="animate-fade-in space-y-3 py-6" role="status" aria-live="polite">
        <span className="sr-only">Loading…</span>
        <div className="h-24 animate-pulse rounded-xl bg-cream" />
        <div className="grid gap-3 sm:grid-cols-3">
          <div className="h-32 animate-pulse rounded-xl bg-cream" />
          <div className="h-32 animate-pulse rounded-xl bg-cream" />
          <div className="h-32 animate-pulse rounded-xl bg-cream" />
        </div>
      </div>
    )
  if (error) {
    return (
      <div
        className="my-6 animate-fade-in rounded-lg border border-danger/30 bg-danger-soft p-4 text-sm text-danger"
        role="alert"
      >
        <p>{error}</p>
        {onRetry && (
          <button type="button" onClick={onRetry} className="mt-2 font-medium underline">
            Try again
          </button>
        )}
      </div>
    )
  }
  return null
}
