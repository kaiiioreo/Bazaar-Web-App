// Page title, optional one-line description, and buttons on the right.
export default function PageHeader({ title, description, actions, className = '' }) {
  return (
    <div className={`mb-6 flex flex-wrap items-end justify-between gap-4 ${className}`}>
      <div>
        <h1 className="font-serif text-3xl text-brand md:text-4xl">{title}</h1>
        {description && <p className="mt-1 max-w-2xl text-muted">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
  )
}
