import sys
from pathlib import Path

# Make the script module importable as `pull_garmin_data` in tests.
sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "scripts"))
