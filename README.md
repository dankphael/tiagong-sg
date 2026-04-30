# tiagong.sg

> Connect with Sin Sehs and learn Chinese dialects — a platform for preserving Singapore's Chinese dialect heritage.

`tiagong.sg` is an interactive web application that helps younger generations of Singaporeans learn and reconnect with Chinese dialects (Hokkien, Teochew, Cantonese, Hakka, Hainanese, etc.) through gamified learning modes, a phrase dictionary, and a community connection feature for finding *Sin Sehs* (dialect-speaking elders / mentors).

## Features

### Learning Modes
- **Story Quiz** — Multiple-choice dialogues set in everyday Singaporean scenarios. Hover-tooltips reveal the meaning, romanization, and dialect-specific color coding for each phrase.
- **Fill in the Blank** — Sentence completion exercises that test vocabulary recall in context.
- **Dictionary** — Browse curated dialect phrases organized by category and dialect, with romanization and English meanings.

### Community
- **Connect with Sin Sehs** — Find dialect-speaking mentors in the community.
- **Profile system** — Set your dialect interest, gender, and learning goals.
- **Connection requests** — Send and manage intro emails between learners and mentors.

### Authentication
- Email/password registration and login (bcrypt-hashed credentials, JWT sessions).
- Google OAuth sign-in via `@react-oauth/google`.

### Progress Tracking
- Per-user progress saved across learning modes.
- Total phrase count surfaced on the About page.

## Tech Stack

- **Framework:** [Next.js 16](https://nextjs.org) (App Router)
- **Runtime:** React 18
- **Database:** PostgreSQL via `@vercel/postgres` / `pg`
- **Auth:** `bcryptjs` + `jsonwebtoken`, Google OAuth
- **Styling:** Tailwind-style utility classes + inline styles, Geist font family
- **Deployment:** Vercel

> ⚠️ This project is on **Next.js 16**, which has breaking changes from earlier versions. Consult `node_modules/next/dist/docs/` before modifying routing, server components, or data fetching code.

## Project Structure

```
tiagong-sg/
├── src/app/
│   ├── page.js              # Main app: learning modes, dictionary, community
│   ├── layout.js            # Root layout, metadata, fonts
│   ├── globals.css          # Global styles
│   └── api/
│       ├── auth/            # login, register, me, google OAuth
│       ├── connections/     # Sin Seh connection requests
│       ├── users/           # profile, profiles list, progress
│       ├── init-db/         # DB bootstrap endpoint
│       └── setup/           # Setup utilities
├── public/
│   ├── dialects.json        # Dialect metadata (colors, names, etc.)
│   ├── dictionary.json      # Curated phrase dictionary
│   └── logo/                # Brand assets
└── package.json
```

## Getting Started

### Prerequisites
- Node.js 18+ (or whatever your Next.js 16 install requires)
- A PostgreSQL database (Vercel Postgres recommended)
- Google OAuth client ID (optional, for Google sign-in)

### Environment Variables

Create a `.env.local` file at the project root:

```bash
# PostgreSQL
POSTGRES_URL=postgres://user:pass@host:5432/dbname
POSTGRES_PRISMA_URL=...
POSTGRES_URL_NON_POOLING=...

# Auth
JWT_SECRET=your-long-random-secret

# Google OAuth (optional)
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
```

### Install & Run

```bash
npm install
npm run dev
```

Then open [http://localhost:3000](http://localhost:3000).

### Initialize the Database

After your DB is reachable, hit the init endpoint once to create tables:

```bash
curl http://localhost:3000/api/init-db
```

## Scripts

| Script          | What it does                          |
| --------------- | ------------------------------------- |
| `npm run dev`   | Start the Next.js development server  |
| `npm run build` | Build the production bundle           |
| `npm run start` | Run the production server             |
| `npm run lint`  | Run ESLint                            |

## API Routes

| Route                         | Purpose                              |
| ----------------------------- | ------------------------------------ |
| `POST /api/auth/register`     | Create a new account                 |
| `POST /api/auth/login`        | Email/password login                 |
| `POST /api/auth/google`       | Google OAuth sign-in                 |
| `GET  /api/auth/me`           | Current session user                 |
| `GET/PUT /api/users/profile`  | Read/update current user profile     |
| `GET  /api/users/profiles`    | List public profiles (Sin Sehs)      |
| `GET/PUT /api/users/progress` | Per-user learning progress           |
| `GET/POST /api/connections`   | List & create connection requests    |
| `GET  /api/connections/pending` | Pending requests for current user  |
| `*    /api/connections/[id]`  | Accept / reject a specific request   |
| `GET  /api/init-db`           | One-time DB schema bootstrap         |

## Deployment

The easiest path is [Vercel](https://vercel.com/new):

1. Push this repo to GitHub.
2. Import the repo on Vercel.
3. Add the env vars listed above (Vercel Postgres provides the `POSTGRES_*` vars automatically when you attach a database).
4. Deploy.

See the [Next.js deployment docs](https://nextjs.org/docs/app/building-your-application/deploying) for alternatives.

## Contributing

This project is part of an effort to preserve Singapore's Chinese dialect heritage. Contributions of curated phrases (with accurate romanization), bug fixes, and accessibility improvements are welcome.

When extending the dictionary:
- Edit `public/dictionary.json` and `public/dialects.json`.
- Keep phrase encodings consistent with existing entries.
- Verify romanization with a native speaker where possible.

## License

Private project — not licensed for redistribution at this time.
