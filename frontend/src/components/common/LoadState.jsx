// Shows a loading or error message while data loads.
//   if (loading || error) return <LoadState loading={loading} error={error} onRetry={reload} />
export default function LoadState({ loading, error, onRetry }) {
  if (loading) return <p className="py-10 text-center text-sm text-stone-500" role="status">Loading…</p>
  if (error) {
    return (
      <div className="my-6 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800" role="alert">
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
