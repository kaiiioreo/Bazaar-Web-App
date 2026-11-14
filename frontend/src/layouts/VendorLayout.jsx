import Logo from '../components/vendor/Logo'

// Market-awning stripe: the one decorative touch of the vendor portal.
const awning = { background: 'repeating-linear-gradient(90deg, #0f766e 0 18px, #ffffff 18px 36px)' }

// Page shell for the vendor portal: sidebar + main area.
export default function VendorLayout({ tabs, tab, onTab, profile, onLogout, children }) {
  return (
    <div className="flex min-h-screen flex-col bg-stone-50 text-stone-900 md:flex-row">
      <nav className="flex flex-col border-b border-stone-200 bg-white md:w-56 md:border-b-0 md:border-r">
        <div className="h-2" style={awning} aria-hidden="true" />
        <div className="p-4 md:flex md:flex-1 md:flex-col">
          <p className="mb-4 font-semibold">Bazaar <span className="font-normal text-stone-500">Vendor</span></p>
          <ul className="flex gap-2 overflow-x-auto md:flex-col md:gap-1">
            {tabs.map((t) => (
              <li key={t}>
                <button
                  onClick={() => onTab(t)}
                  aria-current={tab === t ? 'page' : undefined}
                  className={`whitespace-nowrap rounded-md px-3 py-1.5 text-left text-sm md:w-full ${tab === t ? 'bg-teal-50 font-semibold text-teal-800' : 'text-stone-600 hover:bg-stone-100'}`}
                >
                  {t}
                </button>
              </li>
            ))}
          </ul>
          <div className="mt-auto hidden items-center gap-2 border-t border-stone-100 pt-4 md:flex">
            <Logo profile={profile} />
            <p className="truncate text-sm">{profile.business_name}</p>
          </div>
          {onLogout && (
            <button onClick={onLogout} className="mt-3 rounded-md px-3 py-1.5 text-left text-sm text-stone-600 hover:bg-stone-100 md:w-full">
              Log out
            </button>
          )}
        </div>
      </nav>
      <main className="flex-1 p-4 md:p-8">{children}</main>
    </div>
  )
}
