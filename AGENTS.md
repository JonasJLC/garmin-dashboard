# Garmin Dashboard Agent Guide

Use this guide when updating the Garmin dashboard, fetching new Garmin data, or changing project documentation.

## Project Layout

```text
frontend/               # Vite React dashboard
  public/data/garmin/   # Static Garmin JSON snapshots
backend/                # Local Python data fetcher
.github/workflows/      # CI and deployment workflows
```

## Frontend

Use pnpm for all frontend package management and scripts:

```bash
cd frontend
pnpm install
pnpm dev
```

Common checks:

```bash
pnpm lint
pnpm typecheck
pnpm build
```

The app reads static Garmin data from `frontend/public/data/garmin/` and validates it in `frontend/src/features/garmin`.

## Backend Data Fetcher

Use `uv` for backend dependencies and commands:

```bash
cd backend
uv sync
```

The backend depends on `garminconnect` and `garth`. Garmin auth tokens are stored in `~/.garminconnect`.

## Garmin Authentication

On first use, run the Garmin login flow so tokens can be persisted:

```bash
cd backend
export GARMIN_EMAIL="you@example.com"
export GARMIN_PASSWORD="<your-password>"
uv run python - <<'PY'
import os
from garminconnect import Garmin

client = Garmin(os.environ["GARMIN_EMAIL"], os.environ["GARMIN_PASSWORD"])
client.login()
PY
```

Keep the token directory private:

```bash
chmod 700 ~/.garminconnect
```

## Fetch Garmin Data

```bash
cd backend
export GARMIN_EMAIL="you@example.com"
export GARMIN_PASSWORD="<your-password>"
uv run python scripts/pull_garmin_data.py
```

Outputs are written to `frontend/public/data/garmin/`:

- `daily-YYYY-MM-DD.json`
- `hr-YYYY-MM-DD.json`
- `activities.json`

## Commit Data Snapshots

```bash
git add frontend/public/data/garmin/*.json
git commit -m "chore(data): update garmin snapshots"
git push origin main
```

Use conventional commit messages for project changes, for example:

```text
docs(readme): update setup instructions

- Switch frontend commands to pnpm
- Clarify Garmin data fetch workflow
```

## Deployment

The frontend builds to `frontend/dist`.

Deployment is handled by `.github/workflows/deploy-to-user-site.yml`, which copies the built app into the `garmin-dashboard/` directory of the `JonasJLC/jonasjlc.github.io` repository.

## Reference

- python-garminconnect: https://github.com/cyberjunky/python-garminconnect
