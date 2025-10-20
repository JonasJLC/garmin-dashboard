# AGENTS.md

A practical playbook for building reliable, testable Python agents with a clean, modular architecture.

## Principles

* **Clean code first**: readability, clear naming, minimal cleverness.
* **TDD**: write tests that pin behavior, then implement.
* **Separation of concerns**: isolate policy/orchestration, tools, IO, and storage; prefer packages over giant modules.
* **SOLID principles**:

  * **When**: apply during API and module design (new features, refactors, and whenever code smells appear—long functions, god objects, tight coupling, fragile tests).
  * **How**:

    * **S**ingle Responsibility — keep each class/module focused on one reason to change (e.g., `Planner` plans; `ToolInvoker` executes tools).
    * **O**pen/Closed — favor extension via interfaces/ABC protocols and composition over editing core classes (e.g., register new `Scorer` without touching `Planner`).
    * **L**iskov Substitution — ensure derived types honor base contracts (typed protocols + behavioral tests; swapping a `MemoryStore` shouldn’t break callers).
    * **I**nterface Segregation — define small, purpose-built protocols (e.g., `EmbeddingsProvider`, `VectorSearcher`) instead of one grab-bag interface.
    * **D**ependency Inversion — depend on abstractions, not concretions (inject interfaces via constructors; wire implementations in composition root).
  * **Why**: improves **testability** (mock small interfaces), **evolvability** (add capabilities without risky edits), **reuse** (swap implementations per environment), and **reliability** (clear contracts reduce unintended side effects).
* **Typed everywhere**: annotate all public surfaces; fail type checks in CI.
* **Deterministic & configurable**: configuration via environment variables loaded with `pydantic-settings`.
* **Efficient data handling**: prefer **Polars** over pandas.
* **Filesystem safety**: prefer `from pathlib import Path` over `os`.

---

## Tech Stack

* Python 3.12+
* Package manager: **uv**
* Linting: **ruff**
* Type checking: **ty**
* Testing: **pytest** + `pytest-cov`
* Settings: **pydantic-settings** (no `python-dotenv`)
* DataFrames: **polars**
* Logging:  `logging` with JSON formatter

---

## Project Layout

```bash
backend/
│
├── pyproject.toml                      # Dependencies & project config
├── .gitignore
├── AGENTS.md                           # ← this file
├── .env.example                        # ← document variables only; do not commit secrets
├── ruff.toml                           # ruff configuration
├── ty.toml                             # ty configuration
├── tests/                              # Unit, integration, e2e tests
│   ├── __init__.py
│   ├── test_module1.py
│   └── test_module2.py
│
├── src/ (or scripts/)                      # Main application code
│   ├── __init__.py
│   │
│   ├── core/                           # Core business logic
│   │   ├── __init__.py
│   │   ├── services.py
│   │   └── models.py
│   │
│   ├── api/                            # API layer (REST/GraphQL, etc.)
│   │   ├── __init__.py
│   │   ├── routes.py
│   │   └── schemas.py
│   │
│   ├── db/                             # Database layer
│   │   ├── __init__.py
│   │   ├── connection.py
│   │   └── migrations/
│   │
│   ├── utils/                          # Helpers, shared utilities
│   │   ├── __init__.py
│   │   └── logger.py
│   │
│   ├── config/                         # Settings & environment configs
│   │   ├── __init__.py
│   │   └── settings.py
│   │
│   └── main.py                         # Entry point
│
├── notebooks/                          # Experiments / research (optional)
│
└── docs/                               # Documentation (optional)
```

## Settings (pydantic-settings)

```python
"""Application configuration powered by Pydantic Settings.

This module defines a single `Settings` class and a module-level
`settings` instance to be used across the application. Values are loaded
from environment variables and an optional `.env` file.
"""

from __future__ import annotations

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Application settings loaded from environment variables.

    The class supports both plain and environment-suffixed variable names
    """

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )

    # OpenAI
    openai_api_key: str | None = None


# Shared settings instance
settings = Settings()
```

> **Secrets**: read from real environment variables (e.g., Docker/Kubernetes/CI). Provide `.env.example` with placeholders only.

## Runner / CLI

```python
# src/agents/runners/cli.py
from pathlib import Path
from agents.core.types import AgentMessage
from agents.policy.planner import SimpleEchoAgent

if __name__ == "__main__":
    agent = SimpleEchoAgent()
    result = agent.run([AgentMessage(role="user", content="ping")])
    print(result.output)
```

## Commands (with `uv`, `ruff`, `ty`)

```bash
# create & use venv (from pyproject.toml)
uv sync

# add deps
uv add polars pydantic pydantic-settings pytest pytest-cov
uv add ruff ty --dev

# run tests
uv run pytest -q

# lint
uv ruff check src tests
uv ruff format src tests

# type check (replace paths/flags per your ty setup)
uv ty check src tests
```

---

## Naming & Style

* Modules: `snake_case.py`; packages: singular nouns where practical.
* Functions: verbs that state intent (`plan_route`, `score_candidates`).
* Classes: `CapWords` (`SimpleEchoAgent`).
* Avoid implicit globals; inject dependencies via constructors.
* Keep functions ≤ 40–50 lines; split sooner if responsibilities diverge.

---

## Data with Polars

* Prefer `scan_csv`/`scan_parquet` for lazy pipelines where possible.
* Convert to pandas only at boundaries (plotting, third‑party libs).
