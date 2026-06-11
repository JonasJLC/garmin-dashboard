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
pnpm test
pnpm build
```

`pnpm-lock.yaml` is committed and CI uses `--frozen-lockfile`; run `pnpm install` after dependency changes to keep it in sync.

The app reads static Garmin data from `frontend/public/data/garmin/` and validates it in `frontend/src/features/garmin`. It loads the date list from `index.json` and renders only days that exist.

## Backend Data Fetcher

Use `uv` for backend dependencies and commands:

```bash
cd backend
uv sync
```

The backend depends on `garminconnect` and `garth`. Garmin auth tokens are stored in `~/.garminconnect`. For headless/CI runs, set `GARMINTOKENS` to a saved `garth` token instead of email/password (see `backend/AGENTS.md`).

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

The fetcher backfills the last `GARMIN_DAYS` days (default `7`).

Outputs are written to `frontend/public/data/garmin/`:

- `daily-YYYY-MM-DD.json`
- `hr-YYYY-MM-DD.json`
- `activities.json`
- `index.json` — manifest of available dates read by the frontend

`.github/workflows/refresh-data.yml` can run this on a schedule using the `GARMINTOKENS` secret.

For local UI work without a Garmin account, generate deterministic demo snapshots instead:

```bash
cd backend
uv run python scripts/generate_mock_data.py
```

This writes ~30 days of reproducible sample data and never contacts Garmin (see `backend/AGENTS.md`).

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

## Final Response Format

Whenever a coding agent changes files, the final output must end with a copy-paste-ready conventional git commit message in this format:

```text
docs(readme): update setup instructions

- Switch frontend commands to pnpm
- Clarify Garmin data fetch workflow
```

Choose the conventional commit type and scope from the actual change, such as `docs(readme)`, `docs(agents)`, `chore(config)`, `fix(frontend)`, or `chore(data)`. Keep the subject concise and use bullet points for the concrete changes.

## Deployment

The frontend builds to `frontend/dist`.

Deployment is handled by `.github/workflows/deploy-to-user-site.yml`, which copies the built app into the `garmin-dashboard/` directory of the `JonasJLC/jonasjlc.github.io` repository.

## Privacy

The committed JSON snapshots are personal health data published to a public GitHub Pages site (and kept in git history). Before committing real data, decide whether to keep this repo private, deploy to a private host, or aggregate/anonymize the snapshots.

## Reference

- python-garminconnect: https://github.com/cyberjunky/python-garminconnect
