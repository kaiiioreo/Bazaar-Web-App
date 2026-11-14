import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import VendorLayout from '../../layouts/VendorLayout'
import ProductTable from '../../components/vendor/ProductTable'
import ProductForm from '../../components/vendor/ProductForm'
import ProfilePanel from '../../components/vendor/ProfilePanel'
import SchedulePanel from '../../components/vendor/SchedulePanel'
import AIAssistantPanel from '../../components/vendor/AIAssistantPanel'
import ApplicationPanel from '../../components/vendor/ApplicationPanel'
import StatCard from '../../components/vendor/StatCard'
import Logo from '../../components/vendor/Logo'
import LoadState from '../../components/common/LoadState'
import { STOCK, formatDate } from '../../components/vendor/vendorHelpers'
import * as vendorApi from '../../api/vendor'
import { useAuth } from '../../context/AuthContext'

const TABS = ['Profile', 'Products', 'Schedule', 'AI assistant']

const loadVendorData = () => Promise.all([vendorApi.getProfile(), vendorApi.getProducts(), vendorApi.getEvents()])

// Shown until the Admin approves the vendor's application.
function PendingVendor() {
  const { user, refresh } = useAuth()
  const [application, setApplication] = useState(undefined)
  const [error, setError] = useState('')

  useEffect(() => {
    vendorApi.getApplication().then(setApplication).catch((err) => setError(err.message))
  }, [])

  const submit = async (form) => {
    const app = await vendorApi.submitApplication(form)
    setApplication(app)
    await refresh()
  }

  return (
    <div className="min-h-screen bg-stone-50 p-4 text-stone-900 md:p-8">
      <div className="mx-auto max-w-5xl">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm text-stone-500">Bazaar Vendor</p>
            <h1 className="text-2xl font-semibold">Welcome, {user.name.split(' ')[0]}</h1>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={refresh} className="rounded-md border border-stone-300 px-3 py-1.5 text-sm hover:bg-stone-100">Check status</button>
          </div>
        </div>
        {error && <LoadState error={error} />}
        {application === undefined && !error ? (
          <LoadState loading />
        ) : (
          <ApplicationPanel key={application?.application_id ?? 'new'} application={application} onSubmit={submit} />
        )}
      </div>
    </div>
  )
}

function ApprovedVendor() {
  const { logout } = useAuth()
  const [tab, setTab] = useState('Products')
  const [products, setProducts] = useState([])
  const [profile, setProfile] = useState(null)
  const [events, setEvents] = useState([])
  const [loadError, setLoadError] = useState('')
  const [editing, setEditing] = useState(null) // null = closed, {} = new, product = edit
  const [query, setQuery] = useState('')
  const [stockFilter, setStockFilter] = useState('all')
  const [toast, setToast] = useState('')

  const apply = useCallback(([p, list, evs]) => {
    setProfile(p)
    setProducts(list)
    setEvents(evs)
  }, [])

  useEffect(() => {
    let active = true
    loadVendorData()
      .then((result) => active && apply(result))
      .catch((err) => active && setLoadError(err.message))
    return () => {
      active = false
    }
  }, [apply])

  const load = () => {
    setLoadError('')
    loadVendorData().then(apply).catch((err) => setLoadError(err.message))
  }

  const notify = (msg) => {
    setToast(msg)
    setTimeout(() => setToast(''), 2500)
  }
  // Runs an API action and shows errors in the toast.
  const run = async (action, success) => {
    try {
      await action()
      if (success) notify(success)
    } catch (err) {
      notify(err.message)
    }
  }

  if (loadError) return <div className="p-8"><LoadState error={loadError} onRetry={load} /></div>
  if (!profile) return <LoadState loading />

  const saveProduct = async (p) => {
    // Errors bubble up to ProductForm, which shows them in the form.
    if (p.product_id) {
      const saved = await vendorApi.updateProduct(p.product_id, p)
      setProducts((list) => list.map((x) => (x.product_id === saved.product_id ? saved : x)))
    } else {
      const saved = await vendorApi.createProduct(p)
      setProducts((list) => [...list, saved])
    }
    setEditing(null)
    notify(p.product_id ? 'Product updated' : 'Product added')
  }
  const changeStock = (id, stock_status) =>
    run(async () => {
      const saved = await vendorApi.updateStock(id, stock_status)
      setProducts((l) => l.map((p) => (p.product_id === id ? saved : p)))
    }, `Stock status set to ${STOCK[stock_status].label.toLowerCase()}`)
  const deleteProduct = (id) => {
    if (!window.confirm('Delete this product?')) return
    run(async () => {
      await vendorApi.deleteProduct(id)
      setProducts((l) => l.filter((p) => p.product_id !== id))
    }, 'Product deleted')
  }
  const preRegister = (event_id) =>
    run(async () => {
      await vendorApi.preRegister(event_id)
      setEvents(await vendorApi.getEvents())
    }, 'Pre-registered. The Admin will assign your stall.')
  const withdraw = (ev) => {
    if (!window.confirm(`Withdraw from ${ev.name}?${ev.slot_label ? ` You will lose Stall ${ev.slot_label}.` : ''}`)) return
    run(async () => {
      await vendorApi.withdraw(ev.event_id)
      setEvents(await vendorApi.getEvents())
    }, 'Withdrawn from bazaar')
  }
  const saveProfile = async (p) => {
    const saved = await vendorApi.updateProfile(p)
    setProfile(saved)
    notify('Profile saved')
  }

  const nextBazaar = events.find((e) => e.my_status)
  const count = (s) => products.filter((p) => p.stock_status === s).length
  const visible = products.filter(
    (p) =>
      (stockFilter === 'all' || p.stock_status === stockFilter) &&
      p.name.toLowerCase().includes(query.trim().toLowerCase()),
  )
  const toggleFilter = (s) => setStockFilter((cur) => (cur === s ? 'all' : s))

  return (
    <>
      <VendorLayout tabs={TABS} tab={tab} onTab={setTab} profile={profile} onLogout={logout}>
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-xl font-semibold">{tab === 'Products' ? 'Product listings' : tab}</h1>
            {tab === 'Products' && (
              <div className="mt-1 flex items-center gap-2 text-sm text-stone-500">
                <Logo profile={profile} size="h-5 w-5" text="text-xs" />
                {profile.business_name}
                <Link to={`/customer/vendors/${profile.vendor_id}`} className="text-teal-700 hover:underline">View public page</Link>
              </div>
            )}
          </div>
          <div className="flex items-center gap-2">
            {tab === 'Products' && (
              <button onClick={() => setEditing({})} className="rounded-md bg-stone-900 px-4 py-2 text-sm text-white hover:bg-stone-700">
                Add product
              </button>
            )}
          </div>
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
                hint={nextBazaar ? `${nextBazaar.location}${nextBazaar.slot_label ? ` · Stall ${nextBazaar.slot_label}` : ''}` : 'Pre-register in Schedule'}
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

        {tab === 'Profile' && <ProfilePanel profile={profile} onSave={saveProfile} />}
        {tab === 'Schedule' && <SchedulePanel events={events} onPreRegister={preRegister} onWithdraw={withdraw} />}
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

export default function VendorDashboard() {
  const { user } = useAuth()
  return user.vendor_approved ? <ApprovedVendor /> : <PendingVendor />
}
