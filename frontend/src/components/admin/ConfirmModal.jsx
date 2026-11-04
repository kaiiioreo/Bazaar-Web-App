export default function ConfirmModal({
  open,
  title,
  children,
  confirmLabel = 'Confirm',
  confirmClass = 'bg-blue-600 hover:bg-blue-700',
  onConfirm,
  onCancel,
}) {
  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
        <h3 className="mb-3 text-lg font-semibold">{title}</h3>
        <div className="mb-5 text-sm text-slate-600">{children}</div>
        <div className="flex justify-end gap-2">
          <button
            onClick={onCancel}
            className="rounded border border-slate-300 px-4 py-2 text-sm hover:bg-slate-50"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className={`rounded px-4 py-2 text-sm font-medium text-white ${confirmClass}`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}