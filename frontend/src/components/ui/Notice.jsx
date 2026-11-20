const TONES = {
  success: 'border-success/30 bg-success-soft text-success',
  error: 'border-danger/30 bg-danger-soft text-danger',
  info: 'border-line bg-cream text-ink',
}

// Dismissible message banner. <Notice tone="error" onClose={...}>Something went wrong</Notice>
export default function Notice({ tone = 'success', children, onClose, className = '' }) {
  if (!children) return null
  return (
    <div
      role={tone === 'error' ? 'alert' : 'status'}
      className={`mb-4 flex items-start justify-between gap-4 rounded-xl border px-4 py-3 text-sm ${TONES[tone]} ${className}`}
    >
      <span className="break-words">{children}</span>
      {onClose && (
        <button
          type="button"
          onClick={onClose}
          aria-label="Dismiss"
          className="text-lg leading-none opacity-70 hover:opacity-100"
        >
          ×
        </button>
      )}
    </div>
  )
}
