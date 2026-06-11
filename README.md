# Garmin Dashboard

A static Garmin dashboard built with Vite, React, TypeScript, Tailwind CSS, and shadcn-style UI primitives.

Garmin data is fetched locally with Python and committed as JSON snapshots under `frontend/public/data/garmin/`. The deployed site reads those static files directly.

## Repository Layout

```text
frontend/               # Vite React app (builds to frontend/dist)
  public/data/garmin/   # JSON snapshots
backend/                # Local Python scripts for data fetch
.github/workflows/      # CI and deployment workflows
```

## Frontend

Use pnpm for frontend dependencies and scripts:

```bash
cd frontend
pnpm install
pnpm dev
```

Common commands:

```bash
pnpm lint
pnpm typecheck
pnpm test
pnpm build
pnpm preview
```

`pnpm-lock.yaml` is committed; CI installs with `--frozen-lockfile`, so run `pnpm install` after changing dependencies to keep the lockfile in sync.

Tailwind is configured in `frontend/tailwind.config.ts`. Shared UI primitives live under `frontend/src/components/ui/`.

## Backend Data Fetching

The backend fetcher uses `uv` and writes JSON snapshots for the frontend:

```bash
cd backend
uv sync

export GARMIN_EMAIL="you@example.com"
export GARMIN_PASSWORD="<your-password>"
uv run python scripts/pull_garmin_data.py
```

By default the fetcher backfills the last 7 days; set `GARMIN_DAYS` to change that.

Outputs are written to `frontend/public/data/garmin/`:

- `daily-YYYY-MM-DD.json`
- `hr-YYYY-MM-DD.json`
- `activities.json`
- `index.json` — manifest of available dates; the frontend reads this to know which days to load.

See `AGENTS.md` and `backend/README.md` for the Garmin authentication flow and backend details.

## Automated Refresh

`.github/workflows/refresh-data.yml` can refresh the snapshots on a weekly schedule (or via manual
dispatch). Garmin's interactive MFA cannot run headlessly, so the workflow authenticates with a saved
`garth` token supplied as the `GARMINTOKENS` repository secret (see `backend/README.md`). Without that
secret the workflow fails fast rather than committing stale data.

## Privacy

This project commits personal health data as JSON and publishes it to a public GitHub Pages site, where
it also remains in git history. If that is not intended, keep this source repository private, point the
deploy at a private host, or aggregate/anonymize the data before committing.

## Data Flow

The frontend loads Garmin JSON from `public/data/garmin/` and validates it with Zod in `frontend/src/features/garmin`.

To update dashboard data:

```bash
cd backend
uv run python scripts/pull_garmin_data.py

cd ..
git add frontend/public/data/garmin/*.json
git commit -m "chore(data): update garmin snapshots"
git push origin main
```

## Deployment

The frontend builds to `frontend/dist`.

This repo currently deploys with `.github/workflows/deploy-to-user-site.yml`, which copies the built app into the `garmin-dashboard/` directory of the `JonasJLC/jonasjlc.github.io` repository.

Vite config (`frontend/vite.config.ts`) uses `base: '/garmin-dashboard/'` and `build.outDir: 'dist'`.

## Reference

- python-garminconnect — [github.com/cyberjunky/python-garminconnect](https://github.com/cyberjunky/python-garminconnect)
