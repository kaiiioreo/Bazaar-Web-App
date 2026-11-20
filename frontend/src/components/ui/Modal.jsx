import { useEffect } from 'react'
import Button from './Button'

// Centered dialog. Closes on Escape or a click on the dark backdrop.
export default function Modal({ title, children, footer, onClose, size = 'md' }) {
  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose?.()
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose])

  const width = size === 'lg' ? 'max-w-lg' : 'max-w-md'
  return (
    <div
      className="fixed inset-0 z-50 flex animate-fade-in items-center justify-center bg-black/40 p-4"
      onMouseDown={(e) => e.target === e.currentTarget && onClose?.()}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={`max-h-full w-full ${width} animate-pop-in overflow-y-auto rounded-2xl bg-white p-6 shadow-xl`}
      >
        <h2 className="mb-3 text-lg font-semibold text-ink">{title}</h2>
        <div className="text-sm text-muted">{children}</div>
        {footer && <div className="mt-6 flex justify-end gap-2">{footer}</div>}
      </div>
    </div>
  )
}

// Yes/no confirmation used before anything important or destructive.
//   <ConfirmDialog open={!!x} title="Delete product?" confirmLabel="Delete" tone="danger" onConfirm={...} onCancel={...}>…</ConfirmDialog>
// tone: 'primary' | 'danger' | 'success' (colour of the confirm button)
export function ConfirmDialog({
  open,
  title,
  children,
  confirmLabel = 'Confirm',
  tone = 'primary',
  onConfirm,
  onCancel,
}) {
  if (!open) return null
  return (
    <Modal
      title={title}
      onClose={onCancel}
      footer={
        <>
          <Button variant="secondary" onClick={onCancel}>
            Cancel
          </Button>
          <Button variant={tone} onClick={onConfirm}>
            {confirmLabel}
          </Button>
        </>
      }
    >
      {children}
    </Modal>
  )
}
