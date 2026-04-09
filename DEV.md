# FIKS — Local Development Guide

Use this document as the **single setup source** when onboarding a new machine: install prerequisites, clone the repo, configure the environment, open the project in your IDE, then run the app.

---

## Checklist (new computer)

1. [Install prerequisites](#prerequisites) (Node, Git, PostgreSQL or Docker).
2. [Clone the repository](#get-the-code) and open the **repo root** as your workspace folder in the IDE.
3. [Create `.env`](#environment-variables) from `.env.example`.
4. Run [first-time setup](#first-time-setup): `npm install` → migrations → seed → `npm run dev`.
5. [IDE](#ide-cursor--vs-code): install recommended extensions and use the workspace TypeScript version if prompted.

---

## Prerequisites

| Tool | Tested version | Notes |
|------|----------------|--------|
| **Node.js** | v24.14.0 | **20+ or current LTS** is fine; `npm` ships with Node. |
| **npm** | 11.9.0 | |
| **Git** | recent | |
| **PostgreSQL** | 16+ | Local **Docker** (recommended) or a hosted DB (e.g. [Neon](https://neon.tech)). |

**Windows:** Install [Docker Desktop](https://www.docker.com/products/docker-desktop/) if you use the Docker database option. Use **PowerShell** or **Windows Terminal** for the commands below unless you use WSL (then use bash paths as usual).

**macOS / Linux:** Same stack; use `docker` or a local PostgreSQL install.

---

## Get the code

```bash
git clone <your-repo-url> FIKS
cd FIKS
```

Always open **`FIKS`** (the folder that contains `package.json`) as the IDE workspace root — not a parent folder.

---

## Environment variables

1. Copy the template to `.env` at the **repository root** (same level as `package.json`):

   **PowerShell**

   ```powershell
   Copy-Item .env.example .env
   ```

   **bash**

   ```bash
   cp .env.example .env
   ```

2. Edit `.env` if your database URL or secrets differ from the defaults in `.env.example`.

`npm install` runs `prisma generate` in **postinstall**. You do **not** need a real database URL for that step: `prisma.config.ts` uses a placeholder when `DATABASE_URL` is unset so install succeeds before `.env` exists.

### Variable reference

| Variable | Required | Notes |
|----------|----------|--------|
| `DATABASE_URL` | **Yes** (for app, migrate, seed, studio) | PostgreSQL connection string. |
| `AUTH_SECRET` | **Yes** in production | JWT signing key, **≥ 32 characters**. In **development**, the app falls back to a built-in dev secret if unset (see `src/lib/auth.ts`). |
| `BLOB_READ_WRITE_TOKEN` | No for most local work | Vercel Blob. Without it, local uploads use the non-blob path (see `src/app/api/uploads/route.ts`). |

Full template (mirrors `.env.example`):

```env
DATABASE_URL="postgresql://postgres:dev@localhost:5432/fiks"
AUTH_SECRET="fiks-dev-jwt-secret-key-min-32-chars!!"
BLOB_READ_WRITE_TOKEN=""
```

---

## Database setup

The app uses **PostgreSQL** with **Prisma** (`prisma/schema.prisma`, migrations under `prisma/migrations/`).

### Option A — Docker (recommended)

**PowerShell / bash**

```bash
docker run --name fiks-pg -e POSTGRES_PASSWORD=dev -e POSTGRES_DB=fiks -p 5432:5432 -d postgres:16
```

Connection string (matches `.env.example`):  
`postgresql://postgres:dev@localhost:5432/fiks`

**Start again after reboot**

```bash
docker start fiks-pg
```

### Option B — Neon (or any hosted PostgreSQL)

Create a project at [neon.tech](https://neon.tech), copy the connection string, and set `DATABASE_URL` in `.env`.

---

## First-time setup

Run from the **repository root**, after `.env` exists with a reachable `DATABASE_URL`.

```bash
npm install
npx prisma migrate dev
npx prisma db seed
npm run dev
```

- **`migrate dev`** applies tracked migrations and keeps your DB aligned with the team. Prefer this over `prisma db push` for everyday work on this repo (the README quick start may mention `db push` for a minimal trial; migrations are the source of truth here).
- **`db seed`** loads test data via `tsx prisma/seed.ts` (configured in `prisma.config.ts`).

Open [http://localhost:3000](http://localhost:3000).

### Test account (from seed)

| Field | Value |
|-------|--------|
| Email | `test@example.com` |
| Password | `password123` |

---

## IDE (Cursor / VS Code)

1. **Open folder:** `File → Open Folder…` → select the **FIKS** repo root (contains `package.json`).
2. **Extensions (recommended)**  
   - **ESLint** (`dbaeumer.vscode-eslint`) — matches `npm run lint` / `eslint.config.mjs`.  
   - **Prisma** (`Prisma.prisma`) — syntax and schema helpers for `prisma/schema.prisma`.
3. **TypeScript:** If the editor asks, use the **workspace** TypeScript version (`typescript` from `node_modules`).
4. **AI / agents:** See [`AGENTS.md`](AGENTS.md). This repo targets **Next.js 16** with breaking differences from older docs; when in doubt, check `node_modules/next/dist/docs/` in your install.

No committed `.vscode/` folder is required; the defaults plus the extensions above are enough.

---

## Everyday commands

| Command | What it does |
|---------|----------------|
| `npm run dev` | Next.js dev server (default [http://localhost:3000](http://localhost:3000)). |
| `npm run build` | Production build. |
| `npm run start` | Serve the production build (after `build`). |
| `npm run lint` | ESLint (Next core-web-vitals + TypeScript config). |
| `npx prisma migrate dev` | Apply pending migrations locally. |
| `npx prisma db seed` | Re-run seed script. |
| `npx prisma generate` | Regenerate Prisma client → `src/generated/prisma` (also runs on `npm install`). |
| `npx prisma studio` | Browser UI for the database. |

---

## Tech stack (short)

- **Framework:** Next.js 16 (App Router), React 19  
- **Language:** TypeScript (`@/*` → `src/*` in `tsconfig.json`)  
- **Database:** PostgreSQL, Prisma 7 with `@prisma/adapter-pg`  
- **Auth:** JWT in HTTP-only cookies (`jose`)  
- **Styling:** CSS Modules  
- **File storage:** Vercel Blob when `BLOB_READ_WRITE_TOKEN` is set; otherwise local/dev behavior per upload route  

---

## Deployment (Vercel)

The app deploys to [Vercel](https://vercel.com). Pushes to `dev` trigger builds/deploys as configured in the Vercel project.

1. Import the Git repo.  
2. Add **Vercel Postgres** (sets `DATABASE_URL`). In **Settings → Environment Variables**, ensure `DATABASE_URL` applies to **Production** and **Preview** (not “Development” only), so builds and runtime both see it.  
3. Add **Vercel Blob** if you use blob uploads (`BLOB_READ_WRITE_TOKEN`).  
4. Set `AUTH_SECRET` (random, ≥ 32 characters).  
5. Custom domain (e.g. `dev.fiks.fi`): DNS CNAME as required by Vercel.

**After first deploy**

```bash
npx prisma migrate deploy
# Optional:
npx prisma db seed
```

---

## Troubleshooting

### `npm install` / Prisma errors

If postinstall complains about Prisma, ensure you are on a supported Node version and run `npx prisma generate` manually.

### Dev server hangs / page never loads

A stuck Node process may hold port 3000.

**Windows (PowerShell)**

```powershell
netstat -ano | findstr ":3000.*LISTENING"
taskkill /PID <PID> /F
npm run dev
```

### Port 3000 in use

Next.js may use 3001, 3002, … Check the terminal output. To free 3000, kill the process as above.

### Prisma client or schema out of date

After pulling changes that touch `prisma/schema.prisma` or migrations:

```bash
npx prisma generate
npx prisma migrate dev
```

Restart `npm run dev` — hot reload does not reload the DB client.

### Database connection refused

- **Docker:** `docker start fiks-pg` then `docker exec fiks-pg pg_isready`.  
- Confirm `DATABASE_URL` host/port/user/password match your running database.

### Auth errors in production builds

Production **requires** `AUTH_SECRET` (≥ 32 chars). Development can use the fallback secret in code when unset.

---

## Project structure (key paths)

```
prisma/
  schema.prisma        # Data model
  migrations/          # SQL migration history
  seed.ts              # Seed script
prisma.config.ts       # Prisma CLI config (datasource URL, seed command)
src/
  app/                 # App Router routes & API
  components/
  generated/prisma/    # Generated Prisma client (committed)
  lib/                 # e.g. auth.ts, db.ts
.env                   # Local secrets (git-ignored)
.env.example           # Template (committed)
next.config.ts         # serverExternalPackages: @prisma/adapter-pg
eslint.config.mjs
```

---

## Moving to another computer (summary)

1. Install Node (20+), Git, and Docker **or** use a hosted Postgres URL.  
2. `git clone` → open repo root in Cursor/VS Code.  
3. `Copy-Item .env.example .env` (or `cp`) and adjust `DATABASE_URL` if needed.  
4. Start Postgres (e.g. `docker start fiks-pg` or new `docker run` from [Database setup](#database-setup)).  
5. `npm install` → `npx prisma migrate dev` → `npx prisma db seed` → `npm run dev`.  
6. Install **ESLint** and **Prisma** extensions; use workspace TypeScript if prompted.

That is everything required to go from a clean machine to a running dev server.
