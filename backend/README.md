# Garmin Backend

Local Python scripts for fetching Garmin data and writing static JSON snapshots for the frontend dashboard.

## Requirements

- Python 3.14+ as declared in `pyproject.toml`
- `uv`
- Garmin account credentials
- Internet access

Garmin auth tokens are stored by `garminconnect`/`garth` in `~/.garminconnect`.

## Setup

```bash
uv sync
```

## Authenticate

On first use, run a login flow so Garmin tokens can be persisted:

```bash
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

### Headless / CI auth

For non-interactive runs, set `GARMINTOKENS` to a saved `garth` token instead of email/password.
`Garmin.login()` reads this env var: a value longer than 512 characters is treated as a base64 token
dump, otherwise as a token directory path. Produce a dump after an interactive login like so:

```bash
uv run python -c "import garth, sys; garth.resume('~/.garminconnect'); sys.stdout.write(garth.client.dumps())"
```

Store the printed string as the `GARMINTOKENS` repository secret used by `refresh-data.yml`.

> Note: `garth` currently fails to import under Python 3.14; if you hit that, run the fetcher on
> Python 3.12/3.13 until upstream catches up.

## Fetch Data

```bash
export GARMIN_EMAIL="you@example.com"
export GARMIN_PASSWORD="<your-password>"
uv run python scripts/pull_garmin_data.py
```

Set `GARMIN_DAYS` (default `7`) to control how many days back to fetch.

Outputs are written to `../frontend/public/data/garmin/`.

Generated files:

- `daily-YYYY-MM-DD.json`
- `hr-YYYY-MM-DD.json`
- `activities.json`
- `index.json` — manifest of available dates read by the frontend

## Checks

```bash
uv run ruff check .
uv run ty check .
uv run pytest
```

## Reference

- python-garminconnect — [github.com/cyberjunky/python-garminconnect](https://github.com/cyberjunky/python-garminconnect)
