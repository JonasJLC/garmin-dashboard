# Garmin Backend Agent Guide

This backend contains local Python scripts for fetching Garmin data and writing JSON snapshots used by the frontend dashboard.

## Tooling

- Python 3.14+ as declared in `pyproject.toml`
- Package manager: `uv`
- Linting: `ruff`
- Type checking: `ty`
- Testing: `pytest`

Prefer `pathlib.Path` for filesystem paths and keep scripts small, typed, and explicit.

The data-normalization helpers (`normalize_daily`, `normalize_hr`, `normalize_activity`,
`average_heart_rate`, `build_manifest`) are pure and unit-tested under `tests/`; the `garminconnect`
import is lazy inside `main()` so the helpers stay importable (garth currently breaks on Python 3.14).

## Setup

Run backend commands from `backend/`:

```bash
uv sync
```

Common checks:

```bash
uv run ruff check .
uv run ty check .
uv run pytest
```

## Garmin Authentication

Garmin credentials are read from the environment:

```bash
export GARMIN_EMAIL="you@example.com"
export GARMIN_PASSWORD="<your-password>"
```

For headless/CI runs, set `GARMINTOKENS` to a saved `garth` token instead; `Garmin.login()` reads it
(base64 dump when over 512 chars, otherwise a token directory path). This is how `refresh-data.yml`
authenticates, since interactive MFA cannot run in CI.

On first use, run a login flow so `garminconnect`/`garth` can persist tokens in `~/.garminconnect`:

```bash
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

## Fetch Data

```bash
uv run python scripts/pull_garmin_data.py
```

Set `GARMIN_DAYS` (default `7`) to control how many days back to backfill.

The script writes snapshots to `../frontend/public/data/garmin/`:

- `daily-YYYY-MM-DD.json`
- `hr-YYYY-MM-DD.json`
- `activities.json`
- `index.json` — manifest of available dates read by the frontend

## Change Guidelines

- Do not commit Garmin credentials or auth tokens.
- Keep generated JSON snapshots under `frontend/public/data/garmin/`.
- Use `uv` rather than direct `pip` commands.
- Use conventional commit messages, for example `chore(data): update garmin snapshots`.
- Whenever a coding agent changes files, its final output must end with a copy-paste-ready conventional git commit message using a concise subject and bullet body.

Example final commit message:

```text
chore(data): update garmin snapshots

- Refresh Garmin JSON data files
- Keep generated snapshots under frontend public data
```

## Reference

- python-garminconnect: https://github.com/cyberjunky/python-garminconnect
