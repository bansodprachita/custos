# Custos

*Custos* — Latin for "guardian." A budget/expense tracker: log transactions,
categorize them, set budgets, and watch spending patterns emerge through
charts — with your own private account.

## Stack

- **Frontend:** React (Vite) + Recharts + Tailwind + React Router
- **Backend:** Node.js + Express
- **Database:** Postgres via Prisma ORM
- **Auth:** JWT sessions, bcrypt-hashed passwords

## Project structure

```
custos/
  server/     Express API + Prisma schema
  client/     React frontend
```

## Local setup

### 1. Backend

The database is Postgres, so you need a `DATABASE_URL` before you can run
migrations — even for local dev. The free option is a [Neon](https://neon.com)
project (no card required, free tier never expires): create one, grab the
connection string it gives you, and use that as `DATABASE_URL`. A local
Postgres install works too if you have one.

```bash
cd server
npm install
cp .env.example .env
# edit .env: paste your Neon (or local Postgres) connection string into DATABASE_URL
npx prisma migrate dev --name init
npm run dev
```

The API runs at `http://localhost:4000`. There's no seed script anymore —
each new account gets its own starter categories automatically when you
register.

### 2. Frontend

In a second terminal:

```bash
cd client
npm install
npm run dev
```

The app runs at `http://localhost:5173`. Open it, click **Create one** to
register your first account, and you're in.

## Features

- Rate-limited auth endpoints, locked-down CORS, standard security headers
  (`helmet`), and crash-safe error handling (`express-async-errors` — a
  failed request returns an error response instead of taking the whole API
  down)
- Email/password accounts — every category, transaction, and budget is
  scoped to your account only
- Editable display name and password, under Settings → Profile
- Four dedicated pages via the sidebar: Dashboard (overview), All
  Transactions (add/search/filter/export/paginate), Budget (set limits +
  live progress), Settings
- Full CRUD for transactions and categories (edit/delete included)
- Monthly budgets per category with color-coded progress bars
- Filtering by search text, category, type, and date range
- Pagination on the transaction list
- CSV export (respects your current filters)
- Two charts: spending by category, income vs. expense by month
- Currency switcher (₹ INR by default), light/dark theme, both persisted
- Coin-flip splash intro on first visit, hover-lift cards, custom delete
  confirmation modal, Material Symbols icon set, responsive sidebar drawer
  on mobile

## Deploying it for real

This is set up to run entirely on free tiers — no card required anywhere —
comfortably up to a few hundred active users. Three separate services, each
hosting a different piece: **Neon** (database), **Render** (backend API),
**Vercel** (frontend). Prisma abstracts the database engine, so nothing in
the application code changes between environments — only `DATABASE_URL`.

### 1. Database (Neon)

1. Create a project at [neon.com](https://neon.com) (no card required). Its
   free tier has no expiration date — unlike Render's free Postgres, which
   auto-deletes after 30 days, this one is meant to be left running.
2. Copy the connection string it gives you — you'll use it as `DATABASE_URL`
   in the next step.

### 2. Backend (Render, free tier)

1. Push this repo to GitHub.
2. On [render.com](https://render.com), create a **New Web Service** pointing
   at the `server` folder of your repo.
3. Build command: `npm install && npx prisma generate`
4. Start command: `npx prisma migrate deploy && npm start`
5. Add environment variables in Render's dashboard:
   - `DATABASE_URL` = the Neon connection string from step 1
   - `JWT_SECRET` = a real random string (generate one locally with
     `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`)
   - `FRONTEND_URL` = your Vercel URL from step 3 below (add this *after*
     you have it — CORS will reject the frontend's requests until it's set)
   - `FIREBASE_SERVICE_ACCOUNT` = only needed for Google sign-in — the full
     service-account JSON as a single-line string (Firebase Console >
     Project settings > Service accounts > Generate new private key)
6. Deploy. Note the URL Render gives you (something like
   `https://custos-api.onrender.com`).

**Known limitation:** Render's free web service spins down after 15 minutes
of inactivity, so the first request after a quiet period takes 30-60s to
wake back up. The app already shows a "waking up the server" message on the
login/register screens so this doesn't look broken — it's just the tradeoff
for $0/month. A paid Starter instance (~$7/mo) removes the sleep entirely,
worth it once the app has regular traffic.

### 3. Frontend (Vercel)

1. Import the same repo, set the **root directory** to `client`.
2. Build command: `npm run build`. Output directory: `dist`.
3. Add environment variables:
   - `VITE_API_URL` = your Render backend URL from above (e.g.
     `https://custos-api.onrender.com`)
   - `VITE_FIREBASE_API_KEY`, `VITE_FIREBASE_AUTH_DOMAIN`,
     `VITE_FIREBASE_PROJECT_ID`, `VITE_FIREBASE_APP_ID` — only needed for
     Google sign-in, from Firebase Console > Project settings > Your apps.
     These are public identifiers, safe to expose in frontend code.
4. Deploy. You'll get a URL like `https://custos.vercel.app` — that's your
   real, live app. Go back to Render and set `FRONTEND_URL` to this exact
   URL (step 2.5 above).

### After deploying

- Your local `.env` files never leave your machine — Render/Vercel/Neon use
  their own environment variable settings, not your `.env` files.
- To use the app from your phone, just open the Vercel URL in your phone's
  browser — no app store install needed.

### Watching the free-tier ceilings

None of these are hard walls you'll hit by surprise — check each dashboard
occasionally as usage grows:

- **Neon**: 0.5GB storage / 100 compute-hours per month, free forever. A
  budget-tracker's data per user is small (transactions are a few hundred
  bytes each), so this comfortably covers hundreds of users; watch the
  storage graph in Neon's dashboard as your user count climbs.
- **Render**: 750 free instance-hours/month — enough for one service to run
  continuously all month. Cost only becomes relevant if you upgrade to
  remove the cold-start sleep.
- **Vercel**: 100GB bandwidth/month on the Hobby plan — a React SPA this
  size won't come close, even at a few hundred daily users.

## Design tokens

Custos uses an editorial "Quiet Luxury" identity: warm paper-cream surfaces
in light mode, deep near-black in dark mode, Noto Serif for headings (set
in italic lowercase, journal-style) paired with Manrope for data and UI,
and Material Symbols for icons. Colors follow a Material Design 3 role
system (primary/secondary/tertiary + surface containers) rather than fixed
hex values, so light and dark mode share the same class names — only the
CSS variables in `client/src/index.css` change. Expense/income use the
brand's mocha and olive tones rather than literal red/green, per the
original design brief's "avoid aggressive financial tropes" direction.
