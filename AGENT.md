## Garmin Data Agent

This document describes how to fetch Garmin data locally and commit JSON snapshots for the frontend dashboard.

### Prerequisites

- Python 3.11+
- A Garmin account
- Local environment with access to the internet

### Install dependencies

Create a virtual environment and install the backend dependencies:

```bash
cd backend
source .venv/bin/activate
uv sync
```

This installs `garminconnect` and `garth`. Tokens are stored in `~/.garminconnect`.

Reference: `python-garminconnect` on GitHub — [github.com/cyberjunky/python-garminconnect](https://github.com/cyberjunky/python-garminconnect).

### Authenticate (first time)

Run the example login flow (you will be prompted, tokens persist ~1 year):

```python
from garminconnect import Garmin
import os

client = Garmin(os.environ['GARMIN_EMAIL'], os.environ['GARMIN_PASSWORD'])
client.login()
```

Ensure `~/.garminconnect` exists and is private (`chmod 700 ~/.garminconnect`).

### Fetch and write JSON

Set credentials and run the script:

```bash
export GARMIN_EMAIL="you@example.com"
export GARMIN_PASSWORD="<your-password>"
python backend/scripts/pull_garmin_data.py
```

Outputs are written to `frontend/public/data/garmin/`:

- `daily-YYYY-MM-DD.json`
- `hr-YYYY-MM-DD.json`
- `activities.json`

### Commit and push

```bash
git add frontend/public/data/garmin/*.json
git commit -m "chore(data): update garmin snapshots"
git push origin main
```

GitHub Pages deploy is handled by `.github/workflows/deploy-pages.yml` in this repo. The frontend builds to `frontend/dist` and is published on push to `main`.
