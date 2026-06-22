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


def body_battery_series(rng: random.Random, dailies: list[dict[str, Any]]) -> list[dict[str, Any]]:
    """Return daily body battery and stress summaries, oldest first."""
    series: list[dict[str, Any]] = []
    for index, daily in enumerate(dailies):
        level = int(_clamp(78 + rng.gauss(0, 8) - (index % 6), 60, 95))
        stress = int(_clamp(28 + rng.gauss(0, 8), 15, 45))
        series.append(
            {
                "date": daily["date"],
                "level": level,
                "maxLevel": int(_clamp(level + rng.randint(5, 12), level, 100)),
                "drainRate": round(_clamp(rng.uniform(5, 8), 5, 8), 1),
                "stressAvg": stress,
            },
        )
    return series


def sleep_series(rng: random.Random, dailies: list[dict[str, Any]]) -> list[dict[str, Any]]:
    """Return daily sleep scores and stage summaries, oldest first."""
    series: list[dict[str, Any]] = []
    for daily in dailies:
        total = int(_clamp(rng.gauss(462, 35), 390, 540))
        deep = int(total * _clamp(rng.gauss(0.2, 0.03), 0.14, 0.26))
        rem = int(total * _clamp(rng.gauss(0.3, 0.04), 0.22, 0.36))
        light = total - deep - rem
        series.append(
            {
                "date": daily["date"],
                "score": int(_clamp(rng.gauss(84, 7), 70, 95)),
                "totalMinutes": total,
                "deepMinutes": deep,
                "lightMinutes": light,
                "remMinutes": rem,
            },
        )
    return series


def biometrics_series(rng: random.Random, dailies: list[dict[str, Any]]) -> list[dict[str, Any]]:
    """Return daily SpO2, respiration, VO2 max, and recovery summaries."""
    series: list[dict[str, Any]] = []
    for index, daily in enumerate(dailies):
        series.append(
            {
                "date": daily["date"],
                "spo2Pct": int(_clamp(rng.gauss(97, 1), 95, 99)),
                "respirationBrpm": round(_clamp(rng.gauss(14.5, 0.8), 13, 16), 1),
                "vo2MaxMlKgMin": round(_clamp(61 + index * 0.05 + rng.gauss(0, 1.2), 58, 65), 1),
                "recoveryTimeHrs": int(_clamp(rng.gauss(19, 4), 14, 24)),
            },
        )
    return series


def training_load_series(rng: random.Random, dailies: list[dict[str, Any]]) -> list[dict[str, Any]]:
    """Return daily training load summaries, oldest first."""
    statuses = ["Productive", "Maintaining", "Peaking"]
    series: list[dict[str, Any]] = []
    for index, daily in enumerate(dailies):
        acute = int(_clamp(rng.gauss(700, 120), 500, 900))
        anaerobic = int(acute * _clamp(rng.gauss(0.18, 0.04), 0.1, 0.26))
        high = int(acute * _clamp(rng.gauss(0.38, 0.05), 0.28, 0.48))
        low = acute - anaerobic - high
        series.append(
            {
                "date": daily["date"],
                "acuteLoad": acute,
                "chronicLoad": int(_clamp(rng.gauss(650, 90), 500, 900)),
                "anaerobicLoad": anaerobic,
                "highAerobicLoad": high,
                "lowAerobicLoad": low,
                "trainingStatus": statuses[index % len(statuses)],
            },
        )
    return series


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
    write_json(out / "body-battery.json", body_battery_series(rng, dailies))
    write_json(out / "sleep-summary.json", sleep_series(rng, dailies))
    write_json(out / "biometrics.json", biometrics_series(rng, dailies))
    write_json(out / "training-load.json", training_load_series(rng, dailies))

    manifest = build_manifest([d["date"] for d in dailies])
    manifest["updatedAt"] = _UPDATED_AT
    write_json(out / "index.json", manifest)


if __name__ == "__main__":
    main()
