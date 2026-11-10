import { Link } from 'react-router-dom'
import Icon from '../components/common/Icon.jsx'

const categories = [
  { name: 'Home & living', icon: '⌂', color: 'sage' },
  { name: 'Wear & carry', icon: '♧', color: 'peach' },
  { name: 'Food & drink', icon: '✳', color: 'yellow' },
  { name: 'Art & objects', icon: '◌', color: 'blue' },
  { name: 'Plants & blooms', icon: '❋', color: 'pink' },
]

const makers = [
  {
    name: 'Clay & Kind',
    type: 'Hand-thrown ceramics',
    rating: '4.9',
    image: 'https://images.unsplash.com/photo-1493106641515-6b5631de4bb9?auto=format&fit=crop&w=800&q=85',
    imageAlt: 'Handcrafted ceramic pieces in warm natural light',
    location: 'Makati City',
    tag: 'MADE BY HAND',
  },
  {
    name: 'Sunday Supply',
    type: 'Everyday essentials',
    rating: '5.0',
    image: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=800&q=85',
    imageAlt: 'Thoughtfully styled clothing and accessories',
    location: 'Quezon City',
    tag: 'SMALL BATCH',
  },
  {
    name: 'The Good Batch',
    type: 'Bakes & pantry goods',
    rating: '4.8',
    image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=800&q=85',
    imageAlt: 'Freshly baked artisan bread',
    location: 'Pasig City',
    tag: 'LOCAL FAVORITE',
  },
]

function MakerCard({ maker }) {
  return (
    <article className="maker-card">
      <a className="maker-image" href="/#stalls" aria-label={`Discover ${maker.name}`}>
        <img src={maker.image} alt={maker.imageAlt} loading="lazy" />
        <span className="image-tag">{maker.tag}</span>
        <span className="save-button" aria-hidden="true"><Icon name="arrow-up-right" size={17} /></span>
      </a>
      <div className="maker-details">
        <div>
          <h3>{maker.name}</h3>
          <p>{maker.type}</p>
        </div>
        <span className="maker-rating"><span aria-hidden="true">★</span> {maker.rating}</span>
      </div>
      <div className="maker-location"><Icon name="leaf" size={14} /> {maker.location}</div>
    </article>
  )
}

export default function HomePage() {
  return (
    <>
      <section className="hero-section" id="discover">
        <div className="hero-copy">
          <span className="eyebrow"><span className="eyebrow-dot" /> YOUR NEIGHBORHOOD, A LITTLE CLOSER</span>
          <h1>Find local goods.<br />Meet the <span>makers.</span></h1>
          <p className="hero-description">
            Browse vendor previews and upcoming bazaar information as a guest. Product, price, and stock details will appear with the marketplace listings.
          </p>
          <div className="hero-actions">
            <a className="button button-dark button-large" href="#stalls">
              Browse vendors <Icon name="arrow" size={18} />
            </a>
            <a className="text-link" href="#events">Check the bazaar schedule <Icon name="arrow-up-right" size={16} /></a>
          </div>
          <div className="hero-proof">
            <div className="avatar-stack" aria-hidden="true">
              <span>J</span><span>M</span><span>A</span><span>K</span>
            </div>
            <p><strong>Browse as a guest.</strong><br />No account needed to get started.</p>
          </div>
        </div>
        <div className="hero-art" aria-label="A look inside the local maker community">
          <div className="hero-photo hero-photo-main">
            <img
              src="https://images.unsplash.com/photo-1531058020387-3be344556be6?auto=format&fit=crop&w=1100&q=85"
              alt="A lively local outdoor market with handmade goods"
            />
          </div>
          <div className="hero-photo hero-photo-small">
            <img
              src="https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=500&q=85"
              alt="Carefully made goods from an independent maker"
            />
          </div>
          <div className="hero-note">
            <span className="hero-note-icon"><Icon name="search" size={19} /></span>
            <span><strong>Find local goods,</strong><br />vendors, and event dates.</span>
          </div>
          <span className="hero-scribble" aria-hidden="true">✳</span>
        </div>
        <a className="scroll-cue" href="#categories"><span /> SCROLL A LITTLE</a>
      </section>

      <section className="category-section section-wrap" id="categories">
        <div className="section-heading category-heading">
          <div>
            <span className="eyebrow">START WITH WHAT YOU’RE LOOKING FOR</span>
            <h2>Browse by <span>category.</span></h2>
          </div>
          <a className="text-link" href="#stalls">Browse all categories <Icon name="arrow-up-right" size={16} /></a>
        </div>
        <div className="category-list">
          {categories.map((category) => (
            <a className="category-item" href="#stalls" key={category.name}>
              <span className={`category-icon category-${category.color}`} aria-hidden="true">{category.icon}</span>
              <span>{category.name}</span>
              <Icon className="category-arrow" name="arrow-up-right" size={15} />
            </a>
          ))}
        </div>
      </section>

      <section className="maker-section" id="stalls">
        <div className="section-wrap">
          <div className="section-heading">
            <div>
              <span className="eyebrow"><span className="eyebrow-dot" /> BAZAAR VENDORS</span>
              <h2>Meet the <span>vendors.</span></h2>
              <p className="section-description">Explore sample vendor listings. Product prices and stock status will appear with each listing.</p>
            </div>
            <Link className="button button-outline" to="/register?type=vendor">
              Vendor sign up <Icon name="arrow" size={17} />
            </Link>
          </div>
          <div className="maker-grid">
            {makers.map((maker) => <MakerCard key={maker.name} maker={maker} />)}
          </div>
        </div>
      </section>

      <section className="event-section section-wrap" id="events">
        <div className="event-card">
          <div className="event-copy">
            <span className="eyebrow"><span className="eyebrow-dot" /> BAZAAR SCHEDULE</span>
            <h2>Find a bazaar<br />and see who’s <span>attending.</span></h2>
            <p>Check event dates and locations, then find which vendors will be there. Schedule details will appear here once connected.</p>
            <a className="button button-dark button-large" href="#stalls">
              Browse vendor previews <Icon name="arrow" size={18} />
            </a>
          </div>
          <div className="event-visual">
            <img
              src="https://images.unsplash.com/photo-1517457373958-b7bdd4587205?auto=format&fit=crop&w=1000&q=85"
              alt="Friends spending a sunny afternoon together at an outdoor gathering"
              loading="lazy"
            />
            <div className="event-date"><span>EVENT</span><strong>DAY</strong><small>DATE & LOCATION</small></div>
            <span className="event-caption">See event details and participating vendors.</span>
          </div>
          <span className="event-decoration" aria-hidden="true">✳</span>
        </div>
      </section>

      <section className="maker-cta" id="for-makers">
        <div className="maker-cta-inner">
          <span className="eyebrow">FOR VENDORS</span>
          <h2>Bring your business<br />to the <span>bazaar.</span></h2>
          <p>Create a vendor account to get started. Admins review vendor applications before participation.</p>
          <Link className="button button-light button-large" to="/register?type=vendor">
            Create a vendor account <Icon name="arrow" size={18} />
          </Link>
          <span className="maker-cta-flower" aria-hidden="true">✿</span>
        </div>
      </section>

      <footer className="site-footer">
        <div className="footer-main">
          <Link className="brand footer-brand" to="/">
            <span className="brand-mark"><Icon name="leaf" size={21} /></span>
            <span>bazaar<span className="brand-period">.</span></span>
          </Link>
          <p>A little more local.<br />A little more lovely.</p>
          <div className="footer-links">
            <a href="#discover">Explore</a>
            <a href="#events">Markets & events</a>
            <a href="#for-makers">For makers</a>
            <Link to="/login">Log in</Link>
          </div>
        </div>
        <div className="footer-bottom">
          <span>© 2026 Bazaar. Made for the love of local.</span>
          <span>Good things grow here <span aria-hidden="true">✳</span></span>
        </div>
      </footer>
    </>
  )
}
