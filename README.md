# tiagongSG

A community-sourced home for Singapore's Chinese dialect heritage — Hokkien, Cantonese, Teochew, Hakka, and Hainanese. Learn phrases through flashcards, story quizzes, and fill-in-the-blank exercises; search a growing dictionary; connect with fluent-speaker mentors ("Sin Sehs"); and contribute corrections, pronunciations, and new words directly, with the community voting on what's accurate.

## Stack

Next.js 16 (App Router), React 18, Postgres via `pg` (no ORM). See `AGENTS.md` before making changes — this Next.js version has breaking changes from what most training data assumes.

## Getting started

1. Install dependencies:
   ```bash
   npm install
   ```

2. Set up environment variables. Create a `.env.local` in the repo root:
   ```bash
   DATABASE_URL=postgres://user:password@host:port/dbname
   JWT_SECRET=some-long-random-string
   NEXT_PUBLIC_GOOGLE_CLIENT_ID=your-google-oauth-client-id
   INIT_SECRET=some-other-long-random-string
   NEXT_PUBLIC_SITE_URL=https://tiagong.sg
   ```
   - `DATABASE_URL` — required. A Postgres connection string.
   - `JWT_SECRET` — required. Session tokens are refused unless this is set (see `src/lib/auth.js`).
   - `NEXT_PUBLIC_GOOGLE_CLIENT_ID` — required for Google sign-in.
   - `INIT_SECRET` — required to call `GET /api/init-db`, the endpoint that creates/migrates tables (see below). Never leave this unset in a deployed environment — the route fails closed without it, but you still need it to run the migration yourself.
   - `NEXT_PUBLIC_SITE_URL` — used for metadata (Open Graph/Twitter cards, sitemap, robots.txt). Defaults to `https://tiagong.sg` if unset.

3. Create the database schema. Either:
   - Run `db/schema.sql` directly against a fresh database, **or**
   - Start the app and call `GET /api/init-db` with `Authorization: Bearer $INIT_SECRET` — this creates tables and runs any pending migrations idempotently (`CREATE TABLE IF NOT EXISTS`, etc.), and is also re-run automatically on every server start via `src/instrumentation.js`.

4. Run the dev server:
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000).

## Scripts

- `npm run dev` — start the dev server
- `npm run build` — production build
- `npm run start` — run a production build
- `npm run lint` — ESLint (must pass in CI, see `.github/workflows/ci.yml`)

## Content standards

`Golden_Standard.md` is the canonical romanization reference for all five dialects — any romanization in the codebase or dictionary data that conflicts with it should defer to that document.

## Repo layout

- `src/app/` — routes (pages + `api/` route handlers)
- `src/components/` — shared UI and feature components
- `src/lib/` — server-side helpers (`db.js`, `auth.js`, `rateLimit.js`, etc.)
- `src/data/` — static reference data (dialects, lessons, XP levels)
- `db/schema.sql` — full Postgres schema
- `public/dictionary.json` — the compiled dictionary served to the client
- `scripts/` — one-off data-maintenance scripts (not run in production)
