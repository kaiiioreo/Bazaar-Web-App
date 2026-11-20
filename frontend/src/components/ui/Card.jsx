const TONES = {
  default: 'border-line bg-white',
  accent: 'border-accent/30 bg-accent-soft', // AI summaries and highlights
  muted: 'border-line bg-cream',
}

// Panel with the shared border and corner radius.
//   <Card>…</Card>   <Card tone="accent">AI summary</Card>   <Card as="form" onSubmit={…}>…</Card>
export default function Card({ as: Tag = 'div', tone = 'default', className = '', padded = true, ...props }) {
  return <Tag className={`rounded-xl border ${TONES[tone]} ${padded ? 'p-5' : ''} ${className}`} {...props} />
}
