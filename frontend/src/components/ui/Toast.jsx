// Short confirmation that appears bottom-right; see hooks/useToast.js for how to use it.
export default function Toast({ toast }) {
  if (!toast) return null
  return (
    <div
      role={toast.tone === 'error' ? 'alert' : 'status'}
      className={`fixed bottom-4 right-4 z-50 max-w-sm animate-slide-up rounded-xl px-4 py-3 text-sm text-white shadow-lg ${toast.tone === 'error' ? 'bg-danger' : 'bg-brand'}`}
    >
      {toast.text}
    </div>
  )
}
