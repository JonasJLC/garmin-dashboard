# Garmin Backend Agent Guide

This backend contains local Python scripts for fetching Garmin data and writing JSON snapshots used by the frontend dashboard.

## Tooling

- Python 3.14+ as declared in `pyproject.toml`
- Package manager: `uv`
- Linting: `ruff`
- Type checking: `ty`
- Data handling: `polars`
- Settings: `pydantic-settings`

Prefer `pathlib.Path` for filesystem paths and keep scripts small, typed, and explicit.

## Setup

Run backend commands from `backend/`:

```bash
uv sync
```

Common checks:

```bash
uv run ruff check .
uv run ty check .
```

## Garmin Authentication

Garmin credentials are read from the environment:

```bash
export GARMIN_EMAIL="you@example.com"
export GARMIN_PASSWORD="<your-password>"
```

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

The script writes snapshots to `../frontend/public/data/garmin/`:

- `daily-YYYY-MM-DD.json`
- `hr-YYYY-MM-DD.json`
- `activities.json`

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
