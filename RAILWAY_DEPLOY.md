# Deploying Shootly to Railway

This repo is **two apps** that deploy as **two Railway services** from the same GitHub repo,
plus the existing **Neon Postgres** (kept as-is — no migration).

| Service  | Root directory | Builds (Dockerfile)      | Serves                     |
|----------|----------------|--------------------------|----------------------------|
| Backend  | `backend`      | `prisma generate` + `next build` | `next start` on `$PORT` |
| Frontend | `/` (repo root)| `vite build` → `dist`    | `serve -s dist` on `$PORT` |

Each service builds from a **Dockerfile** (`backend/Dockerfile` and root `Dockerfile`) — this
bypasses Railway's auto-detection (Railpack/Nixpacks) so the build/start are deterministic and
the `npm ci` lockfile/npm-version errors don't happen (Docker uses `npm install`). Railway injects
`PORT` automatically; both `start` scripts read it.

> ### ⚠️ Two things that cause the "npm ci ... date-fns" / "npx tsx server.ts" failure
> 1. **Set each service's Root Directory** (Settings → Root Directory): Backend → `backend`,
>    Frontend → `/`. Without this, Railway tries to build the whole monorepo as one app and guesses
>    the wrong start command.
> 2. **Deploy the branch that has this config.** These files live on `redesign-shootly-ui`. In each
>    service: Settings → point the deployment to that branch (or merge it into `main` first).
>    Building `main` (old lockfile, no Dockerfile) is what produced the errors you saw.

---

## 1. Backend service (deploy this FIRST)

1. Railway → **New Project → Deploy from GitHub repo** → pick `youssefmoh222222/shootly`.
2. Open the service → **Settings → Root Directory** → set to `backend`.
3. **Settings → Networking → Generate Domain** (note the URL, e.g.
   `https://shootly-backend-production.up.railway.app`).
4. **Variables** — add (copy values from `backend/.env`, and FIX the two noted below):

   ```
   DATABASE_URL            = <your Neon connection string>   (keep existing)
   JWT_SECRET              = <existing>
   REPLICATE_API_TOKEN     = <existing>   (account also needs CREDIT — see notes)
   CLOUDINARY_CLOUD_NAME   = <REAL cloud name>  ← currently "Root" is WRONG, fix it
   CLOUDINARY_API_KEY      = <existing>
   CLOUDINARY_API_SECRET   = <existing>
   RUNWAY_API_KEY          = <existing>
   FASHN_API_KEY           = <existing>
   CORS_ORIGIN             = <frontend URL from step 2 below>   (set after frontend domain exists)
   PUBLIC_URL              = <this backend's own Railway URL>
   ```

   Railway sets `PORT` for you — do **not** add it.
5. Build/start come from `backend/Dockerfile` (`npm run build` = `prisma generate && next build`,
   then `next start`). Deploy.

## 2. Frontend service

1. In the **same project** → **New → GitHub Repo** → same repo (a second service).
2. **Settings → Root Directory** → leave as `/` (repo root).
3. **Settings → Networking → Generate Domain** (note the URL — this is your app URL).
4. **Variables** — add:

   ```
   VITE_API_URL = https://<your backend Railway URL>     (NO trailing /api — the app appends it)
   ```

   ⚠️ `VITE_API_URL` is **baked in at build time**. If the backend URL changes later, you must
   **redeploy the frontend** for it to take effect.
5. Build/start come from the root `Dockerfile` (`vite build`, then `serve -s dist`). Deploy.

## 3. Close the loop

- Put the **frontend** URL into the backend's `CORS_ORIGIN` variable, then redeploy the backend.
- Open the frontend URL — it should talk to the Railway backend.

---

## Notes / gotchas

- **CORS** is handled in `backend/middleware.ts` and reflects the request origin, so cross-domain
  + cookies work. `CORS_ORIGIN` only feeds the static header in `next.config.js`. If you ever see a
  duplicate `Access-Control-Allow-Origin` error, set `CORS_ORIGIN` to the exact frontend origin.
- **Auth** uses a Bearer token in `localStorage` (not cross-site cookies), so SameSite issues don't apply.
- **Database**: Neon is serverless and reachable from Railway — nothing to migrate. Keep `DATABASE_URL`.
  (If schema ever changes, run `npm run prisma:push` from `backend/`.)
- Two unrelated issues that block real output regardless of host:
  - **Replicate** must have account credit (https://replicate.com/account/billing) or generation 402s.
  - **`CLOUDINARY_CLOUD_NAME`** must be your real cloud name (currently `Root`, which is invalid) or
    results aren't persisted and expire within ~a day.
- The dev-only Vite proxy (`vite.config.ts` → `/api` → `localhost:3001`) is not used in production;
  production uses the absolute `VITE_API_URL`.
