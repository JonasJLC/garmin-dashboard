# Garmin Feature Data

This feature reads static Garmin JSON from `frontend/public/data/garmin/`.

Expected files:

- `daily-YYYY-MM-DD.json` — Daily summary
- `hr-YYYY-MM-DD.json` — Heart rate summary
- `activities.json` — Recent activities list

Generate fresh snapshots from the backend:

```bash
cd backend
uv sync

export GARMIN_EMAIL="you@example.com"
export GARMIN_PASSWORD="<your-password>"
uv run python scripts/pull_garmin_data.py
```

See the root `AGENTS.md` and `backend/README.md` for authentication details.

