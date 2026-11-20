import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import Icon from '../components/common/Icon.jsx'
import { getEvents, getVendors } from '../api/catalog'
import FadeImg from '../components/ui/FadeImg'

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
      <Link className="maker-image" to={maker.to ?? '/customer'} aria-label={`Discover ${maker.name}`}>
        <FadeImg src={maker.image} alt={maker.imageAlt} loading="lazy" />
        <span className="image-tag">{maker.tag}</span>
        <span className="save-button" aria-hidden="true">
          <Icon name="arrow-up-right" size={17} />
        </span>
      </Link>
      <div className="maker-details">
        <div>
          <h3>{maker.name}</h3>
          <p>{maker.type}</p>
        </div>
        <span className="maker-rating">
          <span aria-hidden="true">★</span> {maker.rating}
        </span>
      </div>
      <div className="maker-location">
        <Icon name="leaf" size={14} /> {maker.location}
      </div>
    </article>
  )
}

// Show the top-rated real vendors, reusing the sample photos as cover images.
function useHomeData() {
  const [data, setData] = useState({ makers, next: null })
  useEffect(() => {
    Promise.all([getVendors(), getEvents()])
      .then(([vendors, events]) => {
        const top = [...vendors].sort((a, b) => b.rating - a.rating).slice(0, 3)
        setData({
          makers: top.length
            ? top.map((v, i) => ({
                ...makers[i % makers.length],
                name: v.name,
                type: v.category,
                rating: v.rating ? v.rating.toFixed(1) : 'New',
                image: v.image || makers[i % makers.length].image,
                location: 'Cebu City',
                to: `/customer/vendors/${v.id}`,
              }))
            : makers,
          next: events[0] ?? null,
        })
      })
      .catch(() => {})
  }, [])
  return data
}

export default function HomePage() {
  const { makers: shownMakers, next } = useHomeData()
  const nextDate = next ? new Date(`${next.date}T00:00:00`) : null
  return (
    <>
      <section className="hero-section" id="discover">
        <div className="hero-copy">
          <span className="eyebrow">
            <span className="eyebrow-dot" /> YOUR NEIGHBORHOOD, A LITTLE CLOSER
          </span>
          <h1>
            Find local goods.
            <br />
            Meet the <span>makers.</span>
          </h1>
          <p className="hero-description">
            Browse vendors, prices, stock, and upcoming bazaar schedules as a guest. No account needed.
          </p>
          <div className="hero-actions">
            <Link className="button button-dark button-large" to="/customer">
              Browse vendors <Icon name="arrow" size={18} />
            </Link>
            <Link className="text-link" to="/customer/schedule">
              Check the bazaar schedule <Icon name="arrow-up-right" size={16} />
            </Link>
          </div>
          <div className="hero-proof">
            <div className="avatar-stack" aria-hidden="true">
              <span>J</span>
              <span>M</span>
              <span>A</span>
              <span>K</span>
            </div>
            <p>
              <strong>Browse as a guest.</strong>
              <br />
              No account needed to get started.
            </p>
          </div>
        </div>
        <div className="hero-art" aria-label="A look inside the local maker community">
          <div className="hero-photo hero-photo-main">
            <FadeImg
              src="https://images.unsplash.com/photo-1531058020387-3be344556be6?auto=format&fit=crop&w=1100&q=85"
              alt="A lively local outdoor market with handmade goods"
            />
          </div>
          <div className="hero-photo hero-photo-small">
            <FadeImg
              src="https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=500&q=85"
              alt="Carefully made goods from an independent maker"
            />
          </div>
          <div className="hero-note">
            <span className="hero-note-icon">
              <Icon name="search" size={19} />
            </span>
            <span>
              <strong>Find local goods,</strong>
              <br />
              vendors, and event dates.
            </span>
          </div>
          <span className="hero-scribble" aria-hidden="true">
            ✳
          </span>
        </div>
        <a className="scroll-cue" href="#categories">
          <span /> SCROLL A LITTLE
        </a>
      </section>

      <section className="category-section section-wrap" id="categories">
        <div className="section-heading category-heading">
          <div>
            <span className="eyebrow">START WITH WHAT YOU’RE LOOKING FOR</span>
            <h2>
              Browse by <span>category.</span>
            </h2>
          </div>
          <Link className="text-link" to="/customer">
            Browse all categories <Icon name="arrow-up-right" size={16} />
          </Link>
        </div>
        <div className="category-list stagger">
          {categories.map((category) => (
            <Link className="category-item" to="/customer" key={category.name}>
              <span className={`category-icon category-${category.color}`} aria-hidden="true">
                {category.icon}
              </span>
              <span>{category.name}</span>
              <Icon className="category-arrow" name="arrow-up-right" size={15} />
            </Link>
          ))}
        </div>
      </section>

      <section className="maker-section" id="stalls">
        <div className="section-wrap">
          <div className="section-heading">
            <div>
              <span className="eyebrow">
                <span className="eyebrow-dot" /> BAZAAR VENDORS
              </span>
              <h2>
                Meet the <span>vendors.</span>
              </h2>
              <p className="section-description">
                Top-rated vendors right now. Open a vendor to see prices, stock, and where to find them.
              </p>
            </div>
            <Link className="button button-outline" to="/register?type=vendor">
              Vendor sign up <Icon name="arrow" size={17} />
            </Link>
          </div>
          <div className="maker-grid stagger">
            {shownMakers.map((maker) => (
              <MakerCard key={maker.name} maker={maker} />
            ))}
          </div>
        </div>
      </section>

      <section className="event-section section-wrap" id="events">
        <div className="event-card">
          <div className="event-copy">
            <span className="eyebrow">
              <span className="eyebrow-dot" /> BAZAAR SCHEDULE
            </span>
            <h2>
              Find a bazaar
              <br />
              and see who’s <span>attending.</span>
            </h2>
            <p>
              {next
                ? `Next up: ${next.name} at ${next.location}, with ${next.vendors.length} vendors confirmed so far.`
                : 'Check event dates and locations, then find which vendors will be there.'}
            </p>
            <Link className="button button-dark button-large" to="/customer/schedule">
              See the full schedule <Icon name="arrow" size={18} />
            </Link>
          </div>
          <div className="event-visual">
            <FadeImg
              src="https://images.unsplash.com/photo-1517457373958-b7bdd4587205?auto=format&fit=crop&w=1000&q=85"
              alt="Friends spending a sunny afternoon together at an outdoor gathering"
              loading="lazy"
            />
            <div className="event-date">
              <span>{nextDate ? nextDate.toLocaleDateString('en-PH', { month: 'short' }).toUpperCase() : 'EVENT'}</span>
              <strong>{nextDate ? nextDate.getDate() : 'DAY'}</strong>
              <small>{next ? next.location.split(',')[0] : 'DATE & LOCATION'}</small>
            </div>
            <span className="event-caption">See event details and participating vendors.</span>
          </div>
          <span className="event-decoration" aria-hidden="true">
            ✳
          </span>
        </div>
      </section>

      <section className="maker-cta" id="for-makers">
        <div className="maker-cta-inner">
          <span className="eyebrow">FOR VENDORS</span>
          <h2>
            Bring your business
            <br />
            to the <span>bazaar.</span>
          </h2>
          <p>Create a vendor account to get started. Admins review vendor applications before participation.</p>
          <Link className="button button-light button-large" to="/register?type=vendor">
            Create a vendor account <Icon name="arrow" size={18} />
          </Link>
          <span className="maker-cta-flower" aria-hidden="true">
            ✿
          </span>
        </div>
      </section>

      <footer className="site-footer">
        <div className="footer-main">
          <Link className="brand footer-brand" to="/">
            <span className="brand-mark">
              <Icon name="leaf" size={21} />
            </span>
            <span>
              bazaar<span className="brand-period">.</span>
            </span>
          </Link>
          <p>
            A little more local.
            <br />A little more lovely.
          </p>
          <div className="footer-links">
            <a href="#discover">Explore</a>
            <a href="#events">Markets & events</a>
            <a href="#for-makers">For makers</a>
            <Link to="/login">Log in</Link>
          </div>
        </div>
        <div className="footer-bottom">
          <span>© 2026 Bazaar. Made for the love of local.</span>
          <span>
            Good things grow here <span aria-hidden="true">✳</span>
          </span>
        </div>
      </footer>
    </>
  )
}
