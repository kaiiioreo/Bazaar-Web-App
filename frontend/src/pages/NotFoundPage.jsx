import { Link } from 'react-router-dom'

export default function NotFoundPage() {
  return (
    <section className="not-found-page">
      <span className="eyebrow"><span className="eyebrow-dot" /> THAT PAGE ISN’T HERE</span>
      <h1>Looks like a wrong turn.</h1>
      <p>Head back to Bazaar to browse products, vendors, and upcoming events.</p>
      <Link className="button button-dark button-large" to="/">Back to Bazaar</Link>
    </section>
  )
}
