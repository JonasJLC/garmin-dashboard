from pull_garmin_data import (
    average_heart_rate,
    build_manifest,
    normalize_activity,
    normalize_daily,
    normalize_hr,
)


def test_normalize_daily_converts_distance_to_km():
    result = normalize_daily(
        "2025-10-20",
        {"totalSteps": 8421, "totalKilocalories": 2250, "totalDistanceMeters": 6200},
    )
    assert result == {
        "date": "2025-10-20",
        "steps": 8421,
        "calories": 2250.0,
        "distanceKm": 6.2,
    }


def test_normalize_daily_defaults_missing_fields_to_zero():
    result = normalize_daily("2025-10-20", {})
    assert result["steps"] == 0
    assert result["distanceKm"] == 0.0


def test_average_heart_rate_skips_gaps():
    assert average_heart_rate({"heartRateValues": [[1, 60], [2, None], [3, 80]]}) == 70


def test_average_heart_rate_returns_none_when_empty():
    assert average_heart_rate({"heartRateValues": None}) is None
    assert average_heart_rate({}) is None


def test_normalize_hr_uses_resting_and_computed_average():
    result = normalize_hr(
        "2025-10-20",
        {"restingHeartRate": 55, "heartRateValues": [[1, 70], [2, 90]]},
    )
    assert result == {"date": "2025-10-20", "restingHeartRate": 55, "avgHeartRate": 80}


def test_normalize_activity_maps_fields():
    result = normalize_activity(
        {
            "activityId": 42,
            "activityName": "Morning Run",
            "startTimeLocal": "2025-10-20T06:45:00",
            "duration": 3120,
            "distance": 7400,
            "averageHR": 152,
            "activityType": {"typeKey": "running"},
        },
    )
    assert result["id"] == 42
    assert result["distanceKm"] == 7.4
    assert result["type"] == "running"


def test_normalize_activity_falls_back_to_type_key_for_name():
    result = normalize_activity(
        {
            "activityId": 1,
            "activityName": None,
            "startTimeLocal": "2025-10-20T06:45:00",
            "duration": None,
            "activityType": {"typeKey": "training"},
        },
    )
    assert result["name"] == "training"
    assert result["durationSec"] == 0.0
    assert result["distanceKm"] is None


def test_build_manifest_dedupes_and_sorts_newest_first():
    assert build_manifest(["2025-10-18", "2025-10-20", "2025-10-18"]) == {
        "dates": ["2025-10-20", "2025-10-18"],
    }
