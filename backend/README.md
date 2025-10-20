## Backend (Local Data Fetcher)

Fetch Garmin data with `python-garminconnect` and write JSON for the frontend.

### Setup

```bash
python -m venv .venv
. .venv/bin/activate
pip install -e .
```

### Run

```bash
export GARMIN_EMAIL="you@example.com"
export GARMIN_PASSWORD="<password>"
python scripts/pull_garmin_data.py
```

Outputs are written to `../frontend/public/data/garmin/`.

Reference: `python-garminconnect` — [github.com/cyberjunky/python-garminconnect](https://github.com/cyberjunky/python-garminconnect)


