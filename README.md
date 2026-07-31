# CardVault — Frontend

A React 19 + Vite frontend built to match an existing Node/Express + MongoDB
business-card OCR backend exactly — same endpoints, same request/response
shapes, same RBAC rules, same auth flow. No backend code was modified.

## Stack

React 19 · Vite 6 · React Router 6 · Axios · TanStack Query v5 · React Hook
Form + Zod · Tailwind CSS · lucide-react · react-webcam

## 1. Setup

```bash
npm install
cp .env.example .env   # edit if your backend isn't on localhost:5000
npm run dev
```

The app expects the backend running at `http://localhost:5000` with its API
mounted at `/api` (matches `src/config/env.js`'s `API_PREFIX`). Edit `.env` if
your backend uses different values:

```
VITE_API_BASE_URL=http://localhost:5000/api
VITE_SERVER_ORIGIN=http://localhost:5000
```

### Backend prerequisites for Google OAuth to work

The backend's Google OAuth callback **always** redirects to
`http://localhost:5173/#token=<accessToken>` (hardcoded in
`auth.controller.js`). For local development this just works if you run Vite
on its default port (5173). If you deploy the frontend elsewhere, that
redirect URL is baked into the backend and would need updating there — no
frontend setting can change it.

### CORS / cookies

The backend must have `CORS_ORIGIN` (or equivalent) including your frontend's
origin with credentials enabled, since refresh-token and CSRF cookies are
sent via `withCredentials: true`. This is already configured in the provided
backend's `app.js`.

## 2. Architecture

```
src/
  config/        env, ROLES, and the single source of truth for sidebar nav
  lib/           axios instance (token refresh + CSRF), TanStack Query client
  context/       AuthContext (session bootstrap, OAuth hash handling), Toasts
  hooks/         useAuth, useDebounce, usePagination (client-side — see below), useCamera
  services/      one file per backend module; every function is commented
                 with the exact route + method it calls
  utils/         formatters, RBAC helper predicates, Zod schemas
  components/
    layout/      AppLayout, Sidebar, Topbar, RequireAuth, RequireRole
    ui/          Button, Card, Input, Modal, Badge, Table-less list patterns,
                 Pagination, Tabs, StatCard, Avatar, ConfirmDialog, etc.
  pages/         one folder per feature area (auth, businessCards, scan,
                 companies, users, auditLogs, profile)
```

Routing is centralized in `App.jsx` with lazy-loaded pages, a `RequireAuth`
gate (session bootstrap + redirect to `/login`), and `RequireRole` gates that
mirror (but do not replace) backend authorization.

## 3. Authentication, exactly as the backend implements it

The backend supports **two** independent sign-in paths, both wired up:

1. **Google OAuth** — a real full-page redirect to
   `GET /api/auth/google` (not an axios call). The backend's Passport flow
   redirects back to `http://localhost:5173/#token=<accessToken>` and sets an
   httpOnly `refreshToken` cookie. `AuthContext` watches for that hash on
   mount, consumes the token, strips it from the URL bar, and fetches
   `/auth/me`.
2. **Email OTP** — separate send/verify endpoints for register
   (`/auth/otp/register/send` → `/auth/otp/register/verify`) and login
   (`/auth/otp/login/send` → `/auth/otp/login/verify`), both implemented as
   two-step forms.

**Token handling**: the access token is kept only in memory (never
`localStorage`), so a hard refresh always re-authenticates silently via the
httpOnly refresh cookie (`GET /auth/csrf-token` → `POST /auth/refresh` with
the `x-csrf-token` header, per the backend's double-submit CSRF scheme). A
single 401 anywhere triggers one shared refresh-and-retry via a promise
queue in `src/lib/axios.js`, so concurrent requests don't each try to
refresh independently. If refresh fails, the user is dropped back to
`/login`.

## 4. RBAC — matched to the backend's actual behavior

Roles: `SUPER_ADMIN → MAIN_COMPANY_ADMIN → COMPANY_ADMIN → STAFF →
NORMAL_USER`. The frontend gates *navigation and UI affordances* per role
(`src/utils/permissions.js`, `src/config/navigation.js`), but every rule is
re-enforced by the backend — the frontend checks are UX only, not security
boundaries.

A few backend specifics worth knowing about, since they shape what you'll
see in the UI:

- **`GET /users` always returns only `NORMAL_USER` accounts**, regardless of
  the caller's role (this is the backend's current, real behavior — see
  `user.service.js`'s `getUsers()`, which ignores its filter argument
  entirely). The **Users** page is therefore a directory of unaffiliated
  accounts — exactly the pool that `addCompanyAdmin` / `addStaff` promote by
  email. It's visible to Super Admin, Main Company Admin, and Company Admin.
- **No endpoint paginates server-side.** Every list page paginates
  client-side over the full result set (`src/hooks/usePagination.js`).
- **Business card updates and deletes are not field-restricted or
  soft-deleted** the way user updates are — `DELETE /business-cards/:id` is
  a hard delete despite the model exposing a `softDelete()` helper the route
  doesn't use. The UI's delete confirmation says "permanently."
- **`PUT /companies/:id/users/:userId/role`** has no role check in the
  backend service at all — the frontend only shows this control to Super
  Admin / Main Company Admin as a matter of sane UX, not because the API
  enforces it.

## 5. What's implemented

- Auth: Google OAuth, Email OTP register/login, silent refresh, protected +
  role-gated routing, logout
- Dashboard: scan totals, daily/monthly/yearly usage bars against limits
- Business Cards: search, paginated grid, detail view (parsed fields,
  dynamic fields, QR/barcodes, images), edit, delete
- Scan: front/back capture via device camera (`react-webcam`) or gallery
  upload, upload progress, result screen
- Companies: list (Super Admin: search/filter/stats; others: own company),
  create (Super Admin), detail with tabs — Overview (edit, deactivate/
  recover, change main admin), Company Admins, Staff, All Members (role
  change), Subscription (Super Admin)
- Users: directory, create (role forced by hierarchy), detail with usage
  stats and scan-limit overrides, delete
- Audit Logs: search/filter/paginate
- Profile & Settings: self-service name/avatar, own usage bars

## 6. Notes on this environment

This project was generated in a sandboxed container without npm registry
access, so dependencies could not be installed or the build verified here.
Run `npm install && npm run dev` locally. If you hit a dependency version
conflict, the versions pinned in `package.json` are known-compatible as of
this writing, but feel free to loosen them.
