#!/usr/bin/env python3
from __future__ import annotations

import json
import os
from datetime import date, timedelta
from pathlib import Path

from garminconnect import Garmin  # type: ignore


def repo_root() -> Path:
    return Path(__file__).resolve().parents[2]


def data_dir() -> Path:
    return repo_root() / "frontend" / "public" / "data" / "garmin"


def write_json(path: Path, obj: object) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    with path.open("w", encoding="utf-8") as f:
        json.dump(obj, f, ensure_ascii=False, separators=(",", ":"))


def main() -> None:
    email = os.getenv("GARMIN_EMAIL")
    password = os.getenv("GARMIN_PASSWORD")
    if not email or not password:
        raise SystemExit("Set GARMIN_EMAIL and GARMIN_PASSWORD env vars.")

    client = Garmin(email, password)
    client.login()

    today = date.today()
    day = today - timedelta(days=1)
    day_str = day.strftime("%Y-%m-%d")

    # Fetch stats
    stats = client.get_stats(day_str)
    hr = client.get_heart_rates(day_str)
    activities = client.get_activities(0, 20)

    # Normalize simple summaries for the UI schemas
    daily_summary = {
        "date": day_str,
        "steps": int(stats.get("totalSteps", 0) or 0),
        "calories": float(stats.get("totalKilocalories", 0) or 0),
        "distanceKm": float(stats.get("totalDistanceMeters", 0) or 0) / 1000.0,
    }

    hr_summary = {
        "date": day_str,
        "restingHeartRate": int(hr.get("restingHeartRate", 0) or 0) or None,
        "avgHeartRate": int(hr.get("heartRate", {}).get("average", 0) or 0) or None,
    }

    mapped_acts = []
    for a in activities or []:
        mapped_acts.append(
            {
                "id": int(a.get("activityId")),
                "name": a.get("activityName")
                or a.get("activityType", {}).get("typeKey", "Activity"),
                "startTimeLocal": a.get("startTimeLocal"),
                "durationSec": float(a.get("duration")) if a.get("duration") is not None else 0.0,
                "distanceKm": (float(a.get("distance")) / 1000.0) if a.get("distance") else None,
                "avgHr": int(a.get("averageHR")) if a.get("averageHR") else None,
                "type": (a.get("activityType") or {}).get("typeKey"),
            }
        )

    out = data_dir()
    write_json(out / f"daily-{day_str}.json", daily_summary)
    write_json(out / f"hr-{day_str}.json", hr_summary)
    write_json(out / "activities.json", mapped_acts)

    print(f"Wrote data to {out}")


if __name__ == "__main__":
    main()
