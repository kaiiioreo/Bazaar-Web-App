# Bazaar frontend

React 19 + Vite + Tailwind CSS 4. Setup steps are in the main [README](../README.md).

## Folder guide

| Folder | What goes there |
|---|---|
| `src/api/` | Axios calls, one file per area. Pages never call Axios directly. |
| `src/context/` | `AuthContext` (who is logged in), `FavoritesContext` (saved vendors) |
| `src/hooks/` | `useApi` (load data with loading/error), `useToast` |
| `src/utils/` | `format.js` (dates, ₱ prices), `constants.js` (categories, stock labels) |
| `src/components/ui/` | Shared building blocks used by every role (see below) |
| `src/components/common/` | App-wide pieces: `Navbar`, `DashboardShell` (sidebar), `NotificationBell`, `ChatbotWidget`, `ProtectedRoute` |
| `src/components/<role>/` | Pieces used by one role only (`customer/`, `vendor/`, `admin/`) |
| `src/layouts/` | Page shells: `CustomerLayout`, `VendorLayout`, `AdminLayout` |
| `src/pages/` | One file per screen, grouped by role |

## Design system

Colours and fonts are defined once in `src/index.css` (`@theme`) and used as Tailwind classes:

| Token | Use for |
|---|---|
| `brand` / `brand-hover` / `brand-soft` | Primary buttons, headings, active navigation |
| `accent` / `accent-soft` | Highlights, counts, AI summaries |
| `ink` / `muted` | Main and secondary text |
| `paper` / `cream` / `line` | Page background, subtle panels, borders |
| `success` / `warning` / `danger` (+ `-soft`) | Status colours only |

Do not use raw Tailwind colours like `bg-blue-600` or `text-slate-500`; use the tokens so every page stays consistent.

Shared components in `src/components/ui/`:

| Component | Example |
|---|---|
| `Button` | `<Button variant="secondary" size="sm">Edit</Button>`, `<Button to="/register">Sign up</Button>` |
| `Card` | `<Card>…</Card>`, `<Card tone="accent">AI summary</Card>` |
| `PageHeader` | `<PageHeader title="Bazaar events" description="…" actions={<Button>…</Button>} />` |
| `Table`, `Td` | `<Table columns={['Name', { label: 'Actions', align: 'right' }]}>…</Table>` |
| `Badge`, `StatusBadge`, `StockBadge` | `<StatusBadge status="pending" />`, `<StockBadge stock="low_stock" />` |
| `StatCard` | `<StatCard label="Products" value={12} onClick={…} active />` |
| `FilterPills`, `SearchInput` | Filter rows above lists |
| `Modal`, `ConfirmDialog` | Dialogs; use `ConfirmDialog` instead of `window.confirm` |
| `Notice`, `Toast` | Page-level messages; short confirmations |
| `EmptyState`, `Stars`, `Brand` | Empty lists, star ratings, the logo |
| `form.js` | `inputClass`, `labelClass` for every input |

## Navigation

- Public and customer pages: one top `Navbar`; its links change with the logged-in role.
- Admin and Vendor: no top navbar; `DashboardShell` is their only navigation, fed each role's links.

## Scripts

`npm run dev` · `npm run build` · `npm run lint` · `npm run format` (Prettier)
