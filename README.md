# Custos

*Custos* — Latin for "guardian." A budget/expense tracker: log transactions,
categorize them, set budgets, and watch spending patterns emerge through
charts — with your own private account.

## Stack

- **Frontend:** React (Vite) + Recharts + Tailwind + React Router
- **Backend:** Node.js + Express
- **Database:** SQLite via Prisma ORM
- **Auth:** JWT sessions, bcrypt-hashed passwords

## Project structure

```
custos/
  server/     Express API + Prisma schema
  client/     React frontend
```

## Local setup

### 1. Backend

```bash
cd server
npm install
cp .env.example .env
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

Right now the app only runs on your own machine. To make it a real hosted
app reachable from your phone, you need to deploy the backend and frontend
separately — they're two different kinds of servers.

### Backend (Render, free tier works)

1. Push this repo to GitHub.
2. On [render.com](https://render.com), create a **New Web Service** pointing
   at the `server` folder of your repo.
3. Build command: `npm install && npx prisma generate`
4. Start command: `npx prisma migrate deploy && npm start`
5. Add environment variables in Render's dashboard:
   - `DATABASE_URL` = `file:./dev.db`
   - `JWT_SECRET` = a real random string (generate one locally with
     `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`)
6. Deploy. Note the URL Render gives you (something like
   `https://custos-api.onrender.com`).

**Known limitation:** Render's free tier disk isn't persistent across
deploys — your SQLite file can get wiped when the service restarts or
redeploys. Fine for testing, not fine for real long-term data. Once you're
past the "does this work" stage, the standard fix is switching the database
from SQLite to Postgres (Render offers a free Postgres instance) — that's a
one-line change to `datasource db` in `schema.prisma` plus a new
`DATABASE_URL`, no application code changes needed since Prisma abstracts
the database engine. Worth doing before you rely on this with real data.

### Frontend (Vercel or Netlify, either works)

1. Import the same repo, set the **root directory** to `client`.
2. Build command: `npm run build`. Output directory: `dist`.
3. Add an environment variable: `VITE_API_URL` = your Render backend URL
   from above (e.g. `https://custos-api.onrender.com`).
4. Deploy. You'll get a URL like `https://custos.vercel.app` — that's your
   real, live app.

### After deploying

- Your local `.env` files never leave your machine — Render/Vercel use
  their own environment variable settings, not your `.env` files.
- To use the app from your phone, just open the Vercel/Netlify URL in your
  phone's browser — no app store install needed.

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
