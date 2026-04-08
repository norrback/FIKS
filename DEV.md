# FIKS — Local Development Guide

## Prerequisites

| Tool       | Tested version | Notes                              |
| ---------- | -------------- | ---------------------------------- |
| Node.js    | v24.14.0       | LTS recommended                    |
| npm        | 11.9.0         | Ships with Node                    |
| Git        | any recent     |                                    |
| PostgreSQL | 16+            | Local via Docker or free Neon tier  |

## Database setup

FIKS uses **PostgreSQL** via Prisma ORM. Two ways to get a local database:

### Option A — Docker (recommended)

```powershell
docker run --name fiks-pg -e POSTGRES_PASSWORD=dev -e POSTGRES_DB=fiks -p 5432:5432 -d postgres:16
```

Connection string: `postgresql://postgres:dev@localhost:5432/fiks`

### Option B — Free Neon instance

Create a free database at [neon.tech](https://neon.tech) and use the provided connection string.

## First-time setup

```powershell
# 1. Copy environment template and fill in DATABASE_URL
cp .env.example .env

# 2. Install dependencies
npm install

# 3. Run database migrations (creates tables in PostgreSQL)
npx prisma migrate dev

# 4. Seed the database with test data
npx prisma db seed

# 5. Start the dev server
npm run dev
```

Open <http://localhost:3000> in your browser.

### Test account (from seed)

| Field    | Value              |
| -------- | ------------------ |
| Email    | test@example.com   |
| Password | password123        |

## Environment variables

Stored in `.env` (not committed). See `.env.example` for the template:

```env
DATABASE_URL="postgresql://postgres:dev@localhost:5432/fiks"
AUTH_SECRET="fiks-dev-jwt-secret-key-min-32-chars!!"
BLOB_READ_WRITE_TOKEN=""
```

| Variable               | Required | Notes                                                       |
| ---------------------- | -------- | ----------------------------------------------------------- |
| `DATABASE_URL`         | Yes      | PostgreSQL connection string                                |
| `AUTH_SECRET`          | Yes      | JWT signing key, min 32 chars. Dev fallback exists locally. |
| `BLOB_READ_WRITE_TOKEN`| No (dev) | Vercel Blob token. Only needed locally if testing uploads via Vercel Blob. |

## Everyday commands

| Command                  | What it does                                           |
| ------------------------ | ------------------------------------------------------ |
| `npm run dev`            | Start Next.js dev server (Turbopack) on port 3000      |
| `npm run build`          | Production build                                       |
| `npm run start`          | Serve the production build                             |
| `npm run lint`           | Run ESLint                                             |
| `npx prisma migrate dev` | Apply pending migrations to the local PostgreSQL DB   |
| `npx prisma db seed`    | Re-seed test data                                      |
| `npx prisma generate`   | Regenerate the Prisma client (output: `src/generated/prisma`) |
| `npx prisma studio`     | Open a browser-based DB viewer                         |

## Tech stack at a glance

- **Framework:** Next.js 16 (App Router, Turbopack)
- **Language:** TypeScript
- **Database:** PostgreSQL via Prisma ORM
- **File storage:** Vercel Blob (production), local uploads (development)
- **Auth:** JWT sessions stored in cookies (`jose` library)
- **Styling:** CSS Modules

## Deployment (Vercel)

The app deploys to [Vercel](https://vercel.com). On every push to `dev`, Vercel builds and deploys automatically.

### Vercel project setup

1. Import the Git repo on Vercel
2. Add **Vercel Postgres** integration (auto-sets `DATABASE_URL`)
3. Add **Vercel Blob** storage (auto-sets `BLOB_READ_WRITE_TOKEN`)
4. Set `AUTH_SECRET` to a random 32+ character string in project settings
5. Add `dev.fiks.fi` as a custom domain
6. In Domainhotelli DNS, add a CNAME: `dev` → `cname.vercel-dns.com`

### After first deploy

```bash
# Run migrations against the production database
npx prisma migrate deploy

# Optionally seed production with initial data
npx prisma db seed
```

## Troubleshooting

### Dev server hangs / page never loads

A zombie Node process holds port 3000 open but stops serving responses.

**Diagnose:**

```powershell
netstat -ano | findstr ":3000.*LISTENING"
```

**Fix:**

```powershell
taskkill /PID <PID> /F
npm run dev
```

### Port 3000 already in use (but server works)

Next.js will auto-pick the next free port (3001, 3002, ...). If you want port 3000 back, kill the old process as shown above.

### Prisma client out of date

After changing `prisma/schema.prisma`:

```powershell
npx prisma generate
npx prisma migrate dev
```

Then restart the dev server — HMR alone is not enough for schema changes.

### Database connection refused

Make sure PostgreSQL is running:

```powershell
# If using Docker:
docker start fiks-pg

# Verify connection:
docker exec fiks-pg pg_isready
```

## Project structure (key paths)

```
prisma/
  schema.prisma        # Data model (PostgreSQL)
  migrations/          # Prisma migration history
  seed.ts              # Seed script
src/
  app/                 # Next.js App Router pages & API routes
  components/          # Shared React components
  generated/prisma/    # Auto-generated Prisma client (git-committed)
  lib/
    auth.ts            # JWT session helpers
    db.ts              # Prisma client singleton
.env                   # Local environment variables (git-ignored)
.env.example           # Environment variable template
next.config.ts         # Next.js configuration
```
