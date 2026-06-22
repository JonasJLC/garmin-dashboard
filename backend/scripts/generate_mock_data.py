#!/usr/bin/env python3
"""Generate deterministic demo Garmin snapshots for the dashboard.

This is a *demo-data* helper and is intentionally separate from
``scripts/pull_garmin_data.py`` (which fetches real Garmin data). It writes a
month of ``daily-*``/``hr-*`` snapshots, a richer ``activities.json``, and the
``index.json`` manifest so the dashboard's trends, sparklines, and insights have
meaningful shape without a live Garmin account.

Run it from ``backend/``::

    uv run python scripts/generate_mock_data.py

The output is fully deterministic (fixed seed and end date), so re-running it
produces byte-identical files and never touches the live fetch path.
"""

from __future__ import annotations

import random
from datetime import date, timedelta
from pathlib import Path
from typing import Any

from pull_garmin_data import build_manifest, data_dir, write_json

_DAYS = 30
_END = date(2025, 10, 20)
_SEED = 20251020
_WORKWEEK_LEN = 5
_UPDATED_AT = f"{(_END + timedelta(days=1)).isoformat()}T00:00:00Z"


def _clamp(value: float, low: float, high: float) -> float:
    """Return ``value`` constrained to the inclusive ``[low, high]`` range."""
    return max(low, min(high, value))


def daily_series(rng: random.Random) -> list[dict[str, Any]]:
    """Return ``_DAYS`` daily summaries ending on ``_END``, oldest first.

    Steps follow a mild weekday/weekend rhythm; calories and distance are
    derived from steps so the metrics stay internally consistent.
    """
    days: list[dict[str, Any]] = []
    for offset in range(_DAYS - 1, -1, -1):
        day = _END - timedelta(days=offset)
        weekend = day.weekday() >= _WORKWEEK_LEN
        base = 11000 if weekend else 9000
        steps = int(_clamp(rng.gauss(base, 2200), 3500, 16000))
        calories = int(_clamp(1850 + steps * 0.06 + rng.uniform(-80, 80), 1700, 3200))
        distance_km = round(_clamp(steps * 0.00072 + rng.uniform(-0.3, 0.3), 0.0, 14.0), 1)
        days.append(
            {
                "date": day.isoformat(),
                "steps": steps,
                "calories": calories,
                "distanceKm": distance_km,
            },
        )
    return days


def hr_series(rng: random.Random) -> list[dict[str, Any]]:
    """Return ``_DAYS`` heart-rate summaries ending on ``_END``, oldest first.

    Resting heart rate trends gently downward over the window so the dashboard
    can surface a believable recovery story.
    """
    summaries: list[dict[str, Any]] = []
    for index, offset in enumerate(range(_DAYS - 1, -1, -1)):
        day = _END - timedelta(days=offset)
        trend = 1.5 - (index / (_DAYS - 1)) * 3.0  # +1.5 bpm early, -1.5 bpm late
        resting = int(_clamp(rng.gauss(55 + trend, 1.6), 47, 64))
        avg = int(_clamp(rng.gauss(82, 5), 68, 98))
        summaries.append(
            {
                "date": day.isoformat(),
                "restingHeartRate": resting,
                "avgHeartRate": avg,
            },
        )
    return summaries


def activity_list() -> list[dict[str, Any]]:
    """Return a curated set of recent activities, newest first."""
    raw = [
        ("Morning Run", "2025-10-20T06:45:00", 3120, 7.4, 152, "running"),
        ("Lunch Ride", "2025-10-19T12:10:00", 4200, 22.8, 138, "cycling"),
        ("Evening Walk", "2025-10-18T19:05:00", 1800, 2.3, 98, "walking"),
        ("HIIT Workout", "2025-10-17T07:25:00", 2400, None, 162, "training"),
        ("Tempo Run", "2025-10-15T06:30:00", 2700, 6.8, 158, "running"),
        ("Recovery Walk", "2025-10-14T20:00:00", 2100, 2.6, 92, "walking"),
        ("Long Ride", "2025-10-12T09:15:00", 7200, 41.2, 134, "cycling"),
        ("Strength Session", "2025-10-11T18:20:00", 3000, None, 124, "training"),
        ("Weekend Long Run", "2025-10-08T08:00:00", 4500, 11.3, 149, "running"),
    ]
    return [
        {
            "id": index + 1,
            "name": name,
            "startTimeLocal": start,
            "durationSec": float(duration),
            "distanceKm": distance,
            "avgHr": avg_hr,
            "type": activity_type,
        }
        for index, (name, start, duration, distance, avg_hr, activity_type) in enumerate(raw)
    ]


def clear_snapshots(out_dir: Path) -> None:
    """Remove existing per-day snapshots so regeneration stays idempotent."""
    for pattern in ("daily-*.json", "hr-*.json"):
        for path in out_dir.glob(pattern):
            path.unlink()


def main() -> None:
    """Write the deterministic demo dataset to the frontend data directory."""
    rng = random.Random(_SEED)
    out = data_dir()
    out.mkdir(parents=True, exist_ok=True)
    clear_snapshots(out)

    dailies = daily_series(rng)
    hrs = hr_series(rng)
    for daily, hr in zip(dailies, hrs, strict=True):
        write_json(out / f"daily-{daily['date']}.json", daily)
        write_json(out / f"hr-{hr['date']}.json", hr)

    write_json(out / "activities.json", activity_list())

    manifest = build_manifest([d["date"] for d in dailies])
    manifest["updatedAt"] = _UPDATED_AT
    write_json(out / "index.json", manifest)


if __name__ == "__main__":
    main()
