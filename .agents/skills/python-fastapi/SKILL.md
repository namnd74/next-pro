---
name: python-fastapi
description: Expert guidelines for Python 3.11+, FastAPI, Pydantic v2, async handlers, and dependency injection.
---

# Skill: Python & FastAPI Expert

## 0. Context & Project Shape

- Inspect `pyproject.toml`, `requirements*.txt`, `app/`, routers, dependency providers, and existing async/database patterns before adding files.
- Match the current package layout; default to routers/services/schemas only when no convention exists.

## 1. Type Hints & Pydantic

- Use strict type annotations (`str | None` syntax, `Annotated`).
- Define Pydantic v2 models for request validation and response serialization.
- Validate environment settings with `pydantic-settings`; keep `.env.example` updated.

## 2. Async & Architecture

- Use `async def` for I/O bound endpoints. Use standard `def` for heavy CPU computations running in threadpools.
- Use FastAPI `Depends()` for dependency injection (database sessions, authentication).

## 3. Safety & Testing

- Raise `HTTPException` or typed domain errors intentionally; do not leak internal exception details.
- Add pytest coverage for routers/services and use `TestClient` or `httpx.AsyncClient` to verify behavior.
