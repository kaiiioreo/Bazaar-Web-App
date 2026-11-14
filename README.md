# Bazaar Web-App
SD2 & SD3

A web app that connects bazaar vendors, customers, and organizers (Admins). Vendors apply to join bazaar events, Admins approve them and assign stalls, and customers browse vendors, products, and schedules. AI features include natural-language search, a chatbot, and AI-generated vendor listings.

## Tech Stack
- **Frontend:** React (Vite), Tailwind CSS, React Router, Axios
- **Backend:** Node.js, Express 5, Prisma 7, JWT auth (bcrypt-hashed passwords)
- **Database:** PostgreSQL (Neon, Supabase, or local)
- **AI:** Claude or OpenAI API, called from the backend only (`backend/src/services/ai.js`). Every AI feature has a built-in fallback, so the app works without an API key.

## Prerequisites
- Node.js LTS (20.x or newer): check with `node -v`
- Git
- A PostgreSQL database: a free [Neon](https://neon.tech) project is easiest (copy its connection string)
- VS Code with the ESLint, Prettier, and Tailwind CSS IntelliSense extensions

## Getting Started
You need **two terminals**: one for the backend, one for the frontend.

**1. Backend (first time)**
```bash
git checkout main
git pull
cd backend
npm install
cp .env.example .env      # Windows PowerShell: copy .env.example .env
```
Open `backend/.env` and set `DATABASE_URL` (your Postgres connection string) and `JWT_SECRET` (any long random text). Then:
```bash
npm run db:push           # creates the tables from prisma/schema.prisma
npm run db:seed           # fills in demo data (deletes existing data!)
npm run dev               # API on http://localhost:4000
```

**2. Frontend**
```bash
cd frontend
npm install
npm run dev               # http://localhost:5173 (forwards /api to the backend)
```

**Demo accounts** (password `Password123` for all):

| Role | Email |
|---|---|
| Admin | `admin@bazaar.ph` |
| Vendor (approved) | `vendor@bazaar.ph` |
| Vendor (waiting for approval) | `sweettooth@bazaar.ph` |
| Customer | `customer@bazaar.ph` |

**Optional:** add `AI_API_KEY` (and `AI_PROVIDER`, `AI_MODEL`) to `backend/.env` for real AI answers, and `SMTP_*` settings for real password-reset emails. Without SMTP, reset links are printed in the backend terminal and shown on the page in development.

## Project Structure
```
backend/
├── prisma/
│   ├── schema.prisma   # Database tables (only ONE person edits this)
│   └── seed.js         # Demo data
└── src/
    ├── server.js       # Starts the API
    ├── app.js          # Mounts routes + error handler
    ├── routes/         # auth, catalog (public), customer, vendor, admin, ai, notifications
    ├── services/       # ai.js (only file that calls the LLM), email, notify, reviews
    ├── middleware/     # requireAuth, requireRole, requireApprovedVendor
    └── lib/            # prisma client, serializers (JSON shapes), helpers

frontend/src/
├── api/          # Axios calls, one file per area (client.js adds the login token)
├── context/      # AuthContext: who is logged in
├── hooks/        # useApi: load data with loading/error state
├── layouts/      # Page shells (e.g. AdminLayout with sidebar)
├── pages/        # One folder per role: admin/, vendor/, customer/
└── components/   # Reusable UI pieces (admin/, common/, customer/, vendor/)
```

## API Overview
All routes start with `/api`. 🔒 = needs login.

| Area | Endpoints |
|---|---|
| Auth | `POST /auth/register`, `POST /auth/login`, `GET/PATCH /auth/me` 🔒, `POST /auth/forgot-password`, `POST /auth/reset-password` |
| Public | `GET /vendors`, `GET /vendors/:id`, `GET /products`, `GET /events`, `GET /categories`, `POST /search` (AI) |
| Customer 🔒 | `GET /customer/favorites`, `POST /customer/favorites/toggle`, `GET/POST /customer/reviews`, `PUT/DELETE /customer/reviews/:id` |
| Vendor 🔒 | `GET/POST /vendor/application`, `GET/PUT/DELETE /vendor/profile`, `GET/POST /vendor/products`, `PUT/DELETE /vendor/products/:id`, `PATCH /vendor/products/:id/stock`, `GET /vendor/events`, `POST/DELETE /vendor/events/:id/preregister` |
| Admin 🔒 | `GET /admin/stats`, `GET /admin/applications`, `POST /admin/applications/:id/approve`, `POST /admin/applications/:id/reject`, `GET /admin/vendors`, `PATCH /admin/vendors/:id`, `GET /admin/users`, `PATCH /admin/users/:id/status`, `POST /admin/users/:id/reset-password`, `GET/POST /admin/events`, `PUT /admin/events/:id`, `PATCH /admin/events/:id/registration`, `POST /admin/events/:id/cancel`, `GET /admin/events/:id/slots`, `PUT/DELETE /admin/slots/:id/assign`, `GET /admin/reviews`, `PATCH /admin/reviews/:id` |
| AI | `POST /ai/chat`, `POST /ai/vendor-assist` 🔒, `POST /ai/generate-listing` 🔒 |
| Notifications 🔒 | `GET /notifications`, `POST /notifications/:id/read`, `POST /notifications/read-all` |

## Shared Core UI
- `/` is the guest entry point; browsing does not require an account.
- `/login` is shared by Customers, Vendors, and Admins. Admin accounts are provisioned by the Bazaar team.
- `/register` supports Customer and Vendor account types.
- `/forgot-password` is the password-reset entry point.
- `/reset-password?token=...` is where the emailed reset link lands.
- `/customer/...` pages can be browsed by guests; favorites, reviews, and `/customer/account` need a customer login.
- `/vendor` shows the application form until an Admin approves the vendor, then the full dashboard.
- `/admin` is only for Admin accounts.
- The Bazaar chat widget calls `POST /api/ai/chat` and is shown to guests and customers.

## Team Ownership (Phase 1: UI)
| Area | Branch name | Owner |
|---|---|---|
| Shared/core UI (navbar, login/register, routing, chatbot widget) | `feature/core-ui` | Melgar |
| Guest & Customer pages | `feature/customer-ui` | Coraza |
| Vendor pages | `feature/vendor-ui` | Flores |
| Admin/Organizer pages | `feature/admin-ui` | Chaz |

## Workflow: What Everyone Must Do
1. **Never commit directly to `main`.** Create your own branch from the latest `main`:
   ```bash
   git checkout main
   git pull
   git checkout -b feature/your-area
   ```
2. **Work only in your own folders** (for example `pages/vendor` and `components/vendor`) to avoid merge conflicts.
3. **Commit small and often** with clear messages, e.g. `Add vendor product table`.
4. **Push your branch** with `git push -u origin feature/your-area`.
5. **Open a pull request into `main`** on GitHub. Ask at least one teammate to review it before merging.
6. **Keep your branch up to date** with `main` regularly:
   ```bash
   git checkout main
   git pull
   git checkout feature/your-area
   git merge main
   ```
7. After your PR is merged, run `git checkout main` and `git pull` before starting new work.

## Conventions
- Component files use PascalCase (`StatCard.jsx`); folders use lowercase.
- Use Tailwind classes for styling; avoid separate CSS files.
- Pages load data through `src/api/` and the `useApi` hook; never call `fetch` or Axios directly in a page.
- API fields use the SDD data dictionary names (snake_case). The customer pages convert them to camelCase in `src/api/catalog.js`.
- Throw `new HttpError(status, 'message')` in backend routes; the error handler in `app.js` turns it into `{ error }`.
- Only one person changes `backend/prisma/schema.prisma`. After a change, everyone runs `npm run db:push`.
- Add your routes to `src/App.jsx` in your own block only. If you get a merge conflict there, keep **both** sides' routes.
- Never commit `.env` files or `node_modules`.
- Format on save with Prettier, and fix ESLint warnings before opening a PR.

## Troubleshooting
- **Styles missing?** Check that `vite.config.js` has `plugins: [react(), tailwindcss()]` and that `src/main.jsx` imports `./index.css`. Restart `npm run dev`.
- **`npm run dev` fails after pulling?** Run `npm install` again, since someone may have added a package.
- **"Cannot reach the Bazaar server"?** The backend isn't running. Start it with `cd backend && npm run dev`.
- **Backend says `Missing DATABASE_URL or JWT_SECRET`?** You haven't created `backend/.env`. Copy it from `.env.example`.
- **Prisma error about a missing table or column?** Run `npm run db:push` in `backend/` (the schema changed).
- **Want fresh demo data?** Run `npm run db:seed` in `backend/` (this deletes everything first).
- **Not sure which branch you're on?** Run `git branch`; the current one has a `*`.

## Documents
- Software Requirements Specification (SRS)
- Software Design Document (SDD)