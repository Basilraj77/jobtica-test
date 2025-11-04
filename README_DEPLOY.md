Deployment checklist for Vercel + Supabase# Deploying Jobtica to Vercel with Supabase (quick guide)



1) Build & static filesThis repository contains a React frontend (Vite + TSX) and an Express-based API under `api/` that has been adapted to run as a Vercel Serverless Function.

- Vite builds the frontend into `dist/` by default. Vercel should serve the static build.

What I changed to prepare this repo for Vercel:

2) Environment variables (set these in Vercel Project > Settings > Environment Variables):- Added `package.json` with dependencies and scripts.

- SUPABASE_URL = https://<your-project-ref>.supabase.co- Wrapped the Express app in `api/index.js` using `serverless-http` so Vercel can invoke it as a serverless function.

- SUPABASE_SERVICE_ROLE_KEY = <your service role key>  # Server-side only (Production)- Added `.env.example` with Supabase keys.

- VITE_SUPABASE_URL = https://<your-project-ref>.supabase.co- Added a `vercel.json` with builds and routes to ensure the static site and API are built and routed correctly.

- VITE_SUPABASE_ANON_KEY = <your anon key>             # Client-side (Preview/Production)

- SESSION_SECRET = <secure random string>              # Server-side (Production)Quick steps to deploy locally and to Vercel



Notes:1) Install dependencies locally

- Do NOT store the service role key in client-side envs. Use it only for server functions/APIs.

- For local development, copy `.env.example` into `.env.local` or set variables in your shell.```powershell

- Vercel will pick up `vercel.json` rewrites to map `/api/*` to the serverless API.npm install

```

3) Deploy steps

- Push to GitHub (connected to Vercel) or run `vercel` CLI.2) Local dev (runs Vite frontend and local Express server if PERSISTENT_SERVER=true)

- In Vercel Dashboard, add the environment variables listed above under the correct Environment (Production/Preview/Development).

- Trigger a deploy.```powershell

npm run dev

4) Quick verification# in another terminal (optional persistent server)

- Visit your Vercel URL and ensure the frontend loads.$env:PERSISTENT_SERVER = "true"; npm run start

- Call `GET /api/health` on the Vercel deployment to confirm the API is responding.```



If you want, I can add a tiny GitHub Action or Vercel build note to automate additional checks after deployment.3) Build for production

```powershell
npm run build
```

4) Deploy to Vercel

- Create a Supabase project (free tier) and copy the SUPABASE_URL, SUPABASE_ANON_KEY and SUPABASE_SERVICE_ROLE_KEY into Vercel Environment Variables.
- In Vercel dashboard, set the following Environment Variables for Production/Preview/Development:
  - `SUPABASE_URL`
  - `SUPABASE_ANON_KEY`
  - `SUPABASE_SERVICE_ROLE_KEY` (keep secret)
  - `SESSION_SECRET`

- Push to GitHub and import the repo into Vercel, or use `vercel` CLI.
  
CI / GitHub Actions
-------------------

This repository includes a simple GitHub Actions workflow (`.github/workflows/ci.yml`) that runs on push and PRs against `main`/`master`. It installs dependencies and runs the Vite build. The workflow uploads the `dist/` directory as an artifact on success.

To enable CI checks:

- Ensure your repository has a `main` or `master` branch.
- Push the `.github/workflows/ci.yml` file (it's already added in this repo).
- GitHub Actions will automatically run on push/PR.

Vercel environment variables checklist
-------------------------------------

Add the following environment variables in the Vercel project settings (Production / Preview / Development as needed):

  - `SUPABASE_URL` = https://your-project-id.supabase.co
  - `SUPABASE_ANON_KEY` = your anon key (used by the frontend, exposed to the browser)
  - `SUPABASE_SERVICE_ROLE_KEY` = your service role key (server-only, do NOT expose to the browser)
  - `SESSION_SECRET` = a secure long random string (used by `express-session`)

Security reminders
------------------

- Do NOT commit `.env.local` or any file containing `SUPABASE_SERVICE_ROLE_KEY` to the repo. Use Vercel's secret management.
- Limit the service role key to server-only code. The frontend should use `VITE_SUPABASE_ANON_KEY`.

Supabase migrations
-------------------

If you have migration SQL files (the docs reference `supabase/migrations/`), apply them using the Supabase CLI or the Supabase SQL editor. See `supabase/README.md` for suggested commands.

Quick commands recap
--------------------

Install and build locally:

```powershell
npm install
npm run build
```

Run a local persistent API server (optional):

```powershell
#$env:PERSISTENT_SERVER = "true"; npm run start
```

Deploy
------

- Add the environment variables to Vercel as listed above.
- Push your repo to GitHub and import into Vercel, or run `vercel` CLI from your local machine.
- After a successful deploy, test the API endpoints under `/api/*` and verify Supabase reads and writes work.

If you'd like, I can now extract SQL migration files mentioned in the docs into `supabase/migrations/*.sql` and add a small automation script to push them with the Supabase CLI. Request that if you want the full migration bundle created.

Notes & security
- Never commit `SUPABASE_SERVICE_ROLE_KEY` to git. Use Vercel's environment variables.
- For public front-end usage, use the anon key (`VITE_SUPABASE_ANON_KEY`). Service role keys must only be used server-side.

If you'd like, I can now:
- Run a quick lint/build (if network is allowed) and fix any runtime issues.
- Add a small script to test Supabase connectivity using the environment variables.
