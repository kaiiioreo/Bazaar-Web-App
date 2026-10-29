import { useState } from 'react'
import VendorLayout from '../../layouts/VendorLayout'
import ProductTable from '../../components/vendor/ProductTable'
import ProductForm from '../../components/vendor/ProductForm'
import ProfilePanel from '../../components/vendor/ProfilePanel'
import SchedulePanel from '../../components/vendor/SchedulePanel'
import AIAssistantPanel from '../../components/vendor/AIAssistantPanel'
import StatCard from '../../components/vendor/StatCard'
import Logo from '../../components/vendor/Logo'
import usePersistedState from '../../components/vendor/usePersistedState'
import { STOCK, formatDate } from '../../components/vendor/vendorHelpers'
import { vendorProfile, vendorProducts, bazaarEvents, vendorSchedule } from '../../mock/vendor'

const TABS = ['Profile', 'Products', 'Schedule', 'AI assistant']

export default function VendorDashboard() {
  const [tab, setTab] = useState('Products')
  // "v2" keys: older saved data used a different shape.
  const [products, setProducts] = usePersistedState('vendor.products.v2', vendorProducts)
  const [profile, setProfile] = usePersistedState('vendor.profile.v2', vendorProfile)
  const [schedule, setSchedule] = useState(vendorSchedule)
  const [editing, setEditing] = useState(null) // null = closed, {} = new, product = edit
  const [query, setQuery] = useState('')
  const [stockFilter, setStockFilter] = useState('all')
  const [toast, setToast] = useState('')

  const notify = (msg) => {
    setToast(msg)
    setTimeout(() => setToast(''), 2500)
  }

  const saveProduct = (p) => {
    setProducts((list) =>
      p.product_id
        ? list.map((x) => (x.product_id === p.product_id ? p : x))
        : [...list, { ...p, product_id: Date.now(), vendor_id: profile.vendor_id }],
    )
    setEditing(null)
    notify(p.product_id ? 'Product updated' : 'Product added')
  }
  const changeStock = (id, stock_status) => {
    setProducts((l) => l.map((p) => (p.product_id === id ? { ...p, stock_status } : p)))
    notify(`Stock status set to ${STOCK[stock_status].label.toLowerCase()}`)
  }
  const deleteProduct = (id) => {
    if (!window.confirm('Delete this product?')) return
    setProducts((l) => l.filter((p) => p.product_id !== id))
    notify('Product deleted')
  }
  const preRegister = (event_id) => {
    setSchedule((l) => [...l, { schedule_id: Date.now(), vendor_id: profile.vendor_id, event_id, status: 'PreRegistered' }])
    notify('Pre-registered for bazaar')
  }

  const registeredIds = schedule.map((s) => s.event_id)
  const nextBazaar = bazaarEvents.find((e) => registeredIds.includes(e.event_id))
  const count = (s) => products.filter((p) => p.stock_status === s).length
  const visible = products.filter(
    (p) =>
      (stockFilter === 'all' || p.stock_status === stockFilter) &&
      p.name.toLowerCase().includes(query.trim().toLowerCase()),
  )
  const toggleFilter = (s) => setStockFilter((cur) => (cur === s ? 'all' : s))

  return (
    <>
      <VendorLayout tabs={TABS} tab={tab} onTab={setTab} profile={profile}>
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-xl font-semibold">{tab === 'Products' ? 'Product listings' : tab}</h1>
            {tab === 'Products' && (
              <p className="mt-1 flex items-center gap-2 text-sm text-stone-500">
                <Logo profile={profile} size="h-5 w-5" text="text-xs" />
                {profile.business_name}
              </p>
            )}
          </div>
          {tab === 'Products' && (
            <button onClick={() => setEditing({})} className="rounded-md bg-stone-900 px-4 py-2 text-sm text-white hover:bg-stone-700">
              Add product
            </button>
          )}
        </div>

        {tab === 'Products' && (
          <>
            <div className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
              <StatCard label="Products" value={products.length} active={stockFilter === 'all'} onClick={() => setStockFilter('all')} />
              <StatCard label="Low stock" value={count('low_stock')} tone="text-amber-700" active={stockFilter === 'low_stock'} onClick={() => toggleFilter('low_stock')} />
              <StatCard label="Out of stock" value={count('out_of_stock')} tone="text-red-700" active={stockFilter === 'out_of_stock'} onClick={() => toggleFilter('out_of_stock')} />
              <StatCard
                label="Next bazaar"
                value={nextBazaar ? formatDate(nextBazaar.date, { month: 'short', day: 'numeric' }) : 'None'}
                hint={nextBazaar ? nextBazaar.location : 'Pre-register in Schedule'}
              />
            </div>

            <div className="mb-4 flex flex-wrap items-center gap-3">
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search your products"
                aria-label="Search your products"
                className="w-full max-w-xs rounded-md border border-stone-300 bg-white px-3 py-2 text-sm focus:border-teal-600 focus:outline-none focus:ring-1 focus:ring-teal-600"
              />
              <div className="flex flex-wrap gap-2">
                {['all', ...Object.keys(STOCK)].map((s) => (
                  <button
                    key={s}
                    onClick={() => setStockFilter(s)}
                    aria-pressed={stockFilter === s}
                    className={`rounded-full border px-3 py-1 text-xs ${stockFilter === s ? 'border-stone-900 bg-stone-900 text-white' : 'border-stone-300 bg-white hover:bg-stone-100'}`}
                  >
                    {s === 'all' ? 'All' : STOCK[s].label}
                  </button>
                ))}
              </div>
            </div>

            {visible.length > 0 ? (
              <ProductTable products={visible} onStockChange={changeStock} onEdit={setEditing} onDelete={deleteProduct} />
            ) : (
              <div className="rounded-lg border border-dashed border-stone-300 bg-white py-12 text-center">
                <p className="text-stone-600">
                  {products.length === 0 ? 'No products yet. Add your first product to show it to customers.' : 'No products match your search or filter.'}
                </p>
                {products.length === 0 && (
                  <button onClick={() => setEditing({})} className="mt-4 rounded-md bg-stone-900 px-4 py-2 text-sm text-white hover:bg-stone-700">Add product</button>
                )}
              </div>
            )}
          </>
        )}

        {tab === 'Profile' && <ProfilePanel profile={profile} onSave={(p) => { setProfile(p); notify('Profile saved') }} />}
        {tab === 'Schedule' && <SchedulePanel events={bazaarEvents} registeredIds={registeredIds} onPreRegister={preRegister} />}
        {tab === 'AI assistant' && <AIAssistantPanel />}
      </VendorLayout>

      {editing && (
        <ProductForm product={editing.product_id ? editing : null} onSave={saveProduct} onCancel={() => setEditing(null)} />
      )}
      {toast && (
        <div role="status" className="fixed bottom-4 right-4 z-20 rounded-md bg-stone-900 px-4 py-2 text-sm text-white shadow-lg">
          {toast}
        </div>
      )}
    </>
  )
}
