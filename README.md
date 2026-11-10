# Bazaar Web-App
SD2 & SD3

A web app that connects bazaar vendors, customers, and organizers (Admins). Vendors apply to join bazaar events, Admins approve them and assign stalls, and customers browse vendors, products, and schedules. AI features include natural-language search, a chatbot, and AI-generated vendor listings.

## Tech Stack
- **Frontend:** React (Vite), Tailwind CSS, React Router, Axios
- **Backend (Phase 2):** Node.js, Express, Prisma
- **Database (Phase 2):** PostgreSQL
- **AI (Phase 2):** Claude / OpenAI API, called from the backend only

## Prerequisites
- Node.js LTS (20.x or newer): check with `node -v`
- Git
- VS Code with the ESLint, Prettier, and Tailwind CSS IntelliSense extensions

## Getting Started
```bash
1.) Clone the repo
2.) Immediately type in the terminal and follow the steps:
    git checkout main
    git pull
    cd frontend   ##Changes the directory to frontend to install npm there
    npm install   ##React , JavaScript, ESL
    npm run dev
3.) Open http://localhost:5173. You should see the Bazaar guest landing page.
```

## Project Structure
```
frontend/src/
├── layouts/      # Page shells (e.g. AdminLayout with sidebar)
├── pages/        # One folder per role: admin/, vendor/, customer/
├── components/   # Reusable UI pieces (admin/, common/)
├── mock/         # Fake data used until the backend exists
└── api/          # Axios calls (added in Phase 2)
```

## Shared Core UI
- `/` is the guest entry point; browsing does not require an account.
- `/login` is shared by Customers, Vendors, and Admins. Admin accounts are provisioned by the Bazaar team.
- `/register` supports Customer and Vendor account types.
- `/forgot-password` is the password-reset entry point.
- The Bazaar chat widget is a UI preview until the backend AI service is connected.

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
- Build pages with mock data from `src/mock/`, shaped like the entities in the SDD data dictionary, so switching to real API calls later is easy.
- Add your routes to `src/App.jsx` in your own block only. If you get a merge conflict there, keep **both** sides' routes.
- Never commit `.env` files or `node_modules`.
- Format on save with Prettier, and fix ESLint warnings before opening a PR.

## Troubleshooting
- **Styles missing?** Check that `vite.config.js` has `plugins: [react(), tailwindcss()]` and that `src/main.jsx` imports `./index.css`. Restart `npm run dev`.
- **`npm run dev` fails after pulling?** Run `npm install` again, since someone may have added a package.
- **Not sure which branch you're on?** Run `git branch`; the current one has a `*`.

## Documents
- Software Requirements Specification (SRS)
- Software Design Document (SDD)