#!/usr/bin/env python3
"""Fetch Garmin daily, heart-rate, and activity data into frontend JSON snapshots."""

from __future__ import annotations

import json
import logging
import os
from datetime import UTC, date, datetime, timedelta
from pathlib import Path
from typing import Any, cast

logger = logging.getLogger(__name__)

# heartRateValues entries are [timestamp, bpm] pairs.
_HR_PAIR_LEN = 2

_MISSING_CREDS = "Set GARMINTOKENS, or both GARMIN_EMAIL and GARMIN_PASSWORD."


def repo_root() -> Path:
    """Return the repository root (two levels above this script)."""
    return Path(__file__).resolve().parents[2]


def data_dir() -> Path:
    """Return the frontend directory where JSON snapshots are written."""
    return repo_root() / "frontend" / "public" / "data" / "garmin"


def write_json(path: Path, obj: object) -> None:
    """Write obj as compact UTF-8 JSON, creating parent directories as needed."""
    path.parent.mkdir(parents=True, exist_ok=True)
    with path.open("w", encoding="utf-8") as f:
        json.dump(obj, f, ensure_ascii=False, separators=(",", ":"))


def normalize_daily(day_str: str, stats: dict[str, Any]) -> dict[str, Any]:
    """Map a Garmin user-summary payload to the frontend DailySummary shape."""
    return {
        "date": day_str,
        "steps": int(stats.get("totalSteps", 0) or 0),
        "calories": float(stats.get("totalKilocalories", 0) or 0),
        "distanceKm": float(stats.get("totalDistanceMeters", 0) or 0) / 1000.0,
    }


def average_heart_rate(hr: dict[str, Any]) -> int | None:
    """Return the mean of the intraday bpm samples, or None when none exist.

    get_heart_rates() returns heartRateValues as a list of [timestamp, bpm]
    pairs (bpm may be None for gaps); there is no precomputed average field.
    """
    values = hr.get("heartRateValues") or []
    bpms = [
        pair[1]
        for pair in values
        if isinstance(pair, (list, tuple))
        and len(pair) >= _HR_PAIR_LEN
        and pair[1] is not None
    ]
    if not bpms:
        return None
    return round(sum(bpms) / len(bpms))


def normalize_hr(day_str: str, hr: dict[str, Any]) -> dict[str, Any]:
    """Map a Garmin heart-rate payload to the frontend HeartRateSummary shape."""
    resting = hr.get("restingHeartRate")
    return {
        "date": day_str,
        "restingHeartRate": int(resting) if resting else None,
        "avgHeartRate": average_heart_rate(hr),
    }


def normalize_activity(a: dict[str, Any]) -> dict[str, Any]:
    """Map a Garmin activity payload to the frontend Activity shape."""
    return {
        "id": int(a.get("activityId")),
        "name": a.get("activityName") or a.get("activityType", {}).get("typeKey", "Activity"),
        "startTimeLocal": a.get("startTimeLocal"),
        "durationSec": float(a.get("duration")) if a.get("duration") is not None else 0.0,
        "distanceKm": (float(a.get("distance")) / 1000.0) if a.get("distance") else None,
        "avgHr": int(a.get("averageHR")) if a.get("averageHR") else None,
        "type": (a.get("activityType") or {}).get("typeKey"),
    }


def discover_existing_dates(out: Path) -> list[str]:
    """Return dates already on disk, inferred from daily-YYYY-MM-DD.json snapshots."""
    return [p.stem.removeprefix("daily-") for p in out.glob("daily-*.json")]


def build_manifest(dates: list[str]) -> dict[str, Any]:
    """Return the index.json payload: unique dates, newest first."""
    return {"dates": sorted(set(dates), reverse=True)}


def main() -> None:
    """Fetch the last GARMIN_DAYS days and refresh the JSON snapshots and manifest."""
    # Imported lazily so the pure normalize_* helpers stay importable without
    # pulling in garth (which currently fails to import under Python 3.14).
    from garminconnect import Garmin  # noqa: PLC0415

    logging.basicConfig(level=logging.INFO, format="%(message)s")

    days = int(os.getenv("GARMIN_DAYS", "7"))

    # Prefer a saved garth token (GARMINTOKENS) for headless/CI use; login()
    # reads that env var itself. Fall back to email/password for interactive use.
    if os.getenv("GARMINTOKENS"):
        client = Garmin()
    else:
        email = os.getenv("GARMIN_EMAIL")
        password = os.getenv("GARMIN_PASSWORD")
        if not email or not password:
            raise SystemExit(_MISSING_CREDS)
        client = Garmin(email, password)
    client.login()

    today = date.today()  # noqa: DTZ011 - calendar day for Garmin's local-date API
    out = data_dir()
    fetched: list[str] = []

    for offset in range(1, days + 1):
        day_str = (today - timedelta(days=offset)).strftime("%Y-%m-%d")
        try:
            stats = client.get_stats(day_str)
            hr = client.get_heart_rates(day_str)
        except Exception:  # one bad day should not abort the whole run
            logger.exception("Skipping %s", day_str)
            continue
        write_json(out / f"daily-{day_str}.json", normalize_daily(day_str, stats))
        write_json(out / f"hr-{day_str}.json", normalize_hr(day_str, hr))
        fetched.append(day_str)

    activities = cast("list[dict[str, Any]]", client.get_activities(0, 20) or [])
    write_json(out / "activities.json", [normalize_activity(a) for a in activities])

    manifest = build_manifest(discover_existing_dates(out) + fetched)
    manifest["updatedAt"] = datetime.now(UTC).strftime("%Y-%m-%dT%H:%M:%SZ")
    write_json(out / "index.json", manifest)

    logger.info("Wrote %d day(s) and manifest to %s", len(fetched), out)


if __name__ == "__main__":
    main()
