import { useCallback, useEffect, useState } from 'react'
import { Navigate, useParams } from 'react-router-dom'
import VendorLayout from '../../layouts/VendorLayout'
import ProductTable from '../../components/vendor/ProductTable'
import ProductForm from '../../components/vendor/ProductForm'
import ProfilePanel from '../../components/vendor/ProfilePanel'
import SchedulePanel from '../../components/vendor/SchedulePanel'
import AIAssistantPanel from '../../components/vendor/AIAssistantPanel'
import ApplicationPanel from '../../components/vendor/ApplicationPanel'
import LoadState from '../../components/common/LoadState'
import PageHeader from '../../components/ui/PageHeader'
import StatCard from '../../components/ui/StatCard'
import FilterPills from '../../components/ui/FilterPills'
import SearchInput from '../../components/ui/SearchInput'
import EmptyState from '../../components/ui/EmptyState'
import Button from '../../components/ui/Button'
import Toast from '../../components/ui/Toast'
import useToast from '../../hooks/useToast'
import { ConfirmDialog } from '../../components/ui/Modal'
import * as vendorApi from '../../api/vendor'
import { useAuth } from '../../context/AuthContext'
import { STOCK } from '../../utils/constants'
import { formatShortDate } from '../../utils/format'

// Each tab has its own URL: /vendor/products, /vendor/schedule, ...
const TABS = [
  {
    slug: 'products',
    label: 'Products',
    to: '/vendor/products',
    title: 'Product listings',
    description: 'What customers see on your shop page. Keep stock up to date.',
  },
  {
    slug: 'schedule',
    label: 'Schedule',
    to: '/vendor/schedule',
    title: 'Bazaar schedule',
    description: 'Pre-register for upcoming bazaars. The Admin assigns your stall.',
  },
  {
    slug: 'profile',
    label: 'Shop profile',
    to: '/vendor/profile',
    title: 'Shop profile',
    description: 'Your public shop details.',
  },
  {
    slug: 'assistant',
    label: 'AI assistant',
    to: '/vendor/assistant',
    title: 'AI assistant',
    description: 'Ask for help with listings, descriptions, or your application.',
  },
]

const loadVendorData = () => Promise.all([vendorApi.getProfile(), vendorApi.getProducts(), vendorApi.getEvents()])

// Shown until the Admin approves the vendor's application.
function PendingVendor() {
  const { user, refresh } = useAuth()
  const [application, setApplication] = useState(undefined)
  const [error, setError] = useState('')

  useEffect(() => {
    vendorApi
      .getApplication()
      .then(setApplication)
      .catch((err) => setError(err.message))
  }, [])

  const submit = async (form) => {
    setApplication(await vendorApi.submitApplication(form))
    await refresh()
  }

  return (
    <VendorLayout tabs={[{ to: '/vendor', label: 'My application', end: true }]}>
      <PageHeader
        title={`Welcome, ${user.name.split(' ')[0]}`}
        description="Apply to sell at Bazaar. Once the Admin approves you, your full dashboard opens here."
        actions={
          <Button variant="secondary" onClick={refresh}>
            Check status
          </Button>
        }
      />
      {error ? (
        <LoadState error={error} />
      ) : application === undefined ? (
        <LoadState loading />
      ) : (
        <ApplicationPanel key={application?.application_id ?? 'new'} application={application} onSubmit={submit} />
      )}
    </VendorLayout>
  )
}

function ApprovedVendor({ tab }) {
  const [products, setProducts] = useState([])
  const [profile, setProfile] = useState(null)
  const [events, setEvents] = useState([])
  const [loadError, setLoadError] = useState('')
  const [editing, setEditing] = useState(null) // null = closed, {} = new, product = edit
  const [confirm, setConfirm] = useState(null) // { kind: 'delete', product } | { kind: 'withdraw', event }
  const [query, setQuery] = useState('')
  const [stockFilter, setStockFilter] = useState('all')
  const [toast, showToast] = useToast()

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

  const retry = () => {
    setLoadError('')
    loadVendorData()
      .then(apply)
      .catch((err) => setLoadError(err.message))
  }

  // Runs an API action and reports the result in a toast.
  const run = async (action, success) => {
    try {
      await action()
      showToast(success)
    } catch (err) {
      showToast(err.message, 'error')
    }
  }

  const layoutTabs = TABS.map(({ label, to }) => ({ label, to }))
  if (loadError || !profile) {
    return (
      <VendorLayout tabs={layoutTabs}>
        <LoadState loading={!loadError} error={loadError} onRetry={retry} />
      </VendorLayout>
    )
  }

  // AddProduct / UpdateProduct. Errors bubble up to ProductForm, which shows them in the form.
  const saveProduct = async (p) => {
    if (p.product_id) {
      const saved = await vendorApi.updateProduct(p.product_id, p)
      setProducts((list) => list.map((x) => (x.product_id === saved.product_id ? saved : x)))
    } else {
      const saved = await vendorApi.createProduct(p)
      setProducts((list) => [...list, saved])
    }
    setEditing(null)
    showToast(p.product_id ? 'Product updated' : 'Product added')
  }

  const changeStock = (id, stock_status) =>
    run(async () => {
      const saved = await vendorApi.updateStock(id, stock_status)
      setProducts((l) => l.map((p) => (p.product_id === id ? saved : p)))
    }, `Stock set to ${STOCK[stock_status].label.toLowerCase()}`)

  const preRegister = (eventId) =>
    run(async () => {
      await vendorApi.preRegister(eventId)
      setEvents(await vendorApi.getEvents())
    }, 'Pre-registered. The Admin will assign your stall.')

  const saveProfile = async (p) => {
    setProfile(await vendorApi.updateProfile(p))
    showToast('Profile saved')
  }

  const confirmAction = () => {
    const c = confirm
    setConfirm(null)
    if (c.kind === 'delete') {
      run(async () => {
        await vendorApi.deleteProduct(c.product.product_id)
        setProducts((l) => l.filter((p) => p.product_id !== c.product.product_id))
      }, `${c.product.name} deleted`)
    } else {
      run(async () => {
        await vendorApi.withdraw(c.event.event_id)
        setEvents(await vendorApi.getEvents())
      }, `Withdrawn from ${c.event.name}`)
    }
  }

  const current = TABS.find((t) => t.label === tab)
  const nextBazaar = events.find((e) => e.my_status)
  const count = (s) => products.filter((p) => p.stock_status === s).length
  const q = query.trim().toLowerCase()
  const visible = products.filter(
    (p) => (stockFilter === 'all' || p.stock_status === stockFilter) && p.name.toLowerCase().includes(q),
  )
  const toggleFilter = (s) => setStockFilter((cur) => (cur === s ? 'all' : s))

  return (
    <VendorLayout tabs={layoutTabs} profile={profile}>
      <PageHeader
        title={current.title}
        description={current.description}
        actions={tab === 'Products' && <Button onClick={() => setEditing({})}>+ Add product</Button>}
      />

      {tab === 'Products' && (
        <>
          <div className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
            <StatCard
              label="Products"
              value={products.length}
              active={stockFilter === 'all'}
              onClick={() => setStockFilter('all')}
            />
            <StatCard
              label="Low stock"
              value={count('low_stock')}
              tone="warning"
              active={stockFilter === 'low_stock'}
              onClick={() => toggleFilter('low_stock')}
            />
            <StatCard
              label="Out of stock"
              value={count('out_of_stock')}
              tone="danger"
              active={stockFilter === 'out_of_stock'}
              onClick={() => toggleFilter('out_of_stock')}
            />
            <StatCard
              label="Next bazaar"
              value={nextBazaar ? formatShortDate(nextBazaar.date) : 'None'}
              hint={
                nextBazaar
                  ? `${nextBazaar.location}${nextBazaar.slot_label ? ` · Stall ${nextBazaar.slot_label}` : ' · waiting for stall'}`
                  : 'Pre-register in Schedule'
              }
            />
          </div>

          <div className="mb-4 flex flex-wrap items-center gap-3">
            <SearchInput value={query} onChange={setQuery} placeholder="Search your products" />
            <FilterPills
              label="Stock status"
              value={stockFilter}
              onChange={setStockFilter}
              options={[
                { value: 'all', label: 'All' },
                ...Object.entries(STOCK).map(([value, s]) => ({ value, label: s.label })),
              ]}
            />
          </div>

          {visible.length > 0 ? (
            <ProductTable
              products={visible}
              onStockChange={changeStock}
              onEdit={setEditing}
              onDelete={(product) => setConfirm({ kind: 'delete', product })}
            />
          ) : (
            <EmptyState
              action={products.length === 0 && <Button onClick={() => setEditing({})}>Add your first product</Button>}
            >
              {products.length === 0
                ? 'No products yet. Add one so customers can see what you sell.'
                : 'No products match your search or filter.'}
            </EmptyState>
          )}
        </>
      )}

      {tab === 'Shop profile' && <ProfilePanel profile={profile} onSave={saveProfile} />}
      {tab === 'Schedule' && (
        <SchedulePanel
          events={events}
          onPreRegister={preRegister}
          onWithdraw={(event) => setConfirm({ kind: 'withdraw', event })}
        />
      )}
      {tab === 'AI assistant' && <AIAssistantPanel />}

      {editing && (
        <ProductForm
          product={editing.product_id ? editing : null}
          onSave={saveProduct}
          onCancel={() => setEditing(null)}
        />
      )}

      <ConfirmDialog
        open={!!confirm}
        title={confirm?.kind === 'delete' ? 'Delete this product?' : 'Withdraw from this bazaar?'}
        confirmLabel={confirm?.kind === 'delete' ? 'Delete' : 'Withdraw'}
        tone="danger"
        onConfirm={confirmAction}
        onCancel={() => setConfirm(null)}
      >
        <p>
          {confirm?.kind === 'delete'
            ? `${confirm.product.name} will be removed from your shop. This cannot be undone.`
            : `You will be removed from ${confirm?.event.name}${confirm?.event.slot_label ? ` and lose Stall ${confirm.event.slot_label}` : ''}.`}
        </p>
      </ConfirmDialog>
      <Toast toast={toast} />
    </VendorLayout>
  )
}

export default function VendorDashboard() {
  const { user } = useAuth()
  const { tab: slug } = useParams()
  if (!user.vendor_approved) return slug ? <Navigate to="/vendor" replace /> : <PendingVendor />
  const tab = TABS.find((t) => t.slug === slug)
  if (!tab) return <Navigate to="/vendor/products" replace />
  return <ApprovedVendor tab={tab.label} />
}
