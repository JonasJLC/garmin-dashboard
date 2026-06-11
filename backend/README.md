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

## Fetch Data

```bash
export GARMIN_EMAIL="you@example.com"
export GARMIN_PASSWORD="<your-password>"
uv run python scripts/pull_garmin_data.py
```

Outputs are written to `../frontend/public/data/garmin/`.

Generated files:

- `daily-YYYY-MM-DD.json`
- `hr-YYYY-MM-DD.json`
- `activities.json`

## Reference

- python-garminconnect — [github.com/cyberjunky/python-garminconnect](https://github.com/cyberjunky/python-garminconnect)
