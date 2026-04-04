# FIKS — Local Development Guide

## Prerequisites

| Tool    | Tested version | Notes                              |
| ------- | -------------- | ---------------------------------- |
| Node.js | v24.14.0       | LTS recommended                    |
| npm     | 11.9.0         | Ships with Node                    |
| Git     | any recent     |                                    |

No external databases required — the project uses **SQLite** via Prisma + `better-sqlite3`.

## First-time setup

```powershell
# 1. Install dependencies
npm install

# 2. Push the schema to the local SQLite database (creates prisma/dev.db)
npx prisma db push

# 3. Seed the database with test data
npx prisma db seed

# 4. Start the dev server
npm run dev
```

Open <http://localhost:3000> in your browser.

### Test account (from seed)

| Field    | Value              |
| -------- | ------------------ |
| Email    | test@example.com   |
| Password | password123        |

## Everyday commands

| Command                  | What it does                                           |
| ------------------------ | ------------------------------------------------------ |
| `npm run dev`            | Start Next.js dev server (Turbopack) on port 3000      |
| `npm run build`          | Production build                                       |
| `npm run start`          | Serve the production build                             |
| `npm run lint`           | Run ESLint                                             |
| `npx prisma db push`    | Sync schema changes to the local SQLite DB             |
| `npx prisma db seed`    | Re-seed test data                                      |
| `npx prisma generate`   | Regenerate the Prisma client (output: `src/generated/prisma`) |
| `npx prisma studio`     | Open a browser-based DB viewer                         |

## Environment variables

Stored in `.env` (not committed). Defaults for local dev:

```env
DATABASE_URL="file:./prisma/dev.db"
AUTH_SECRET="fiks-dev-jwt-secret-key-min-32-chars!!"
```

`AUTH_SECRET` is used for JWT session tokens. In production use a proper random secret.

## Tech stack at a glance

- **Framework:** Next.js 16 (App Router, Turbopack)
- **Language:** TypeScript
- **Database:** SQLite via Prisma ORM + `better-sqlite3` adapter
- **Auth:** JWT sessions stored in cookies (`jose` library)
- **Styling:** CSS Modules

## Troubleshooting

### Dev server hangs / page never loads

This is the most common issue. A zombie Node process holds port 3000 open but stops serving responses.

**Diagnose:**

```powershell
# Find what's listening on port 3000
netstat -ano | findstr ":3000.*LISTENING"
```

This prints a line like:

```
TCP    0.0.0.0:3000    0.0.0.0:0    LISTENING    <PID>
```

**Fix:**

```powershell
# Kill the stuck process (replace <PID> with the actual number)
taskkill /PID <PID> /F

# Restart
npm run dev
```

### Port 3000 already in use (but server works)

Next.js will auto-pick the next free port (3001, 3002, ...). If you want port 3000 back, kill the old process as shown above.

### Prisma client out of date

After changing `prisma/schema.prisma`:

```powershell
npx prisma generate
npx prisma db push
```

Then restart the dev server — HMR alone is not enough for schema changes.

### Database is missing or empty

```powershell
npx prisma db push
npx prisma db seed
```

This creates `prisma/dev.db` and seeds it with test users and listings.

## Project structure (key paths)

```
prisma/
  schema.prisma        # Data model
  seed.ts              # Seed script
  dev.db               # Local SQLite database (git-ignored)
src/
  app/                 # Next.js App Router pages & API routes
  components/          # Shared React components
  generated/prisma/    # Auto-generated Prisma client (git-committed)
  lib/
    auth.ts            # JWT session helpers
    db.ts              # Prisma client singleton
.env                   # Local environment variables (git-ignored)
next.config.ts         # Next.js configuration
```
