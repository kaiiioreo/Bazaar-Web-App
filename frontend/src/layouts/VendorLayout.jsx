import { Link } from 'react-router-dom'
import DashboardShell from '../components/common/DashboardShell'
import Logo from '../components/vendor/Logo'

// Page shell for the vendor portal. Each tab is a real URL (/vendor/products, ...).
// tabs: [{ label, to }]   profile: the vendor's profile (shows their logo and public page link)
export default function VendorLayout({ tabs, profile, children }) {
  const footer = profile && (
    <>
      <div className="flex items-center gap-2 px-3 pb-1">
        <Logo profile={profile} />
        <p className="truncate font-semibold text-ink">{profile.business_name}</p>
      </div>
      <Link
        to={`/customer/vendors/${profile.vendor_id}`}
        className="block rounded-lg px-3 py-2 font-medium text-ink hover:bg-cream hover:text-brand"
      >
        View my shop page ↗
      </Link>
    </>
  )

  return (
    <DashboardShell title="Vendor" links={tabs} footer={footer}>
      {children}
    </DashboardShell>
  )
}
