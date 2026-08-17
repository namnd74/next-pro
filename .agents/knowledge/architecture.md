# Architectural Decision Records (ADR)

> Team-wide architectural decisions and design conventions.

## ADR-001: Project Architecture Baseline

- **Status**: Accepted
- **Context**: Need a consistent, scalable codebase structure.
- **Decision**: Adopt Feature-Based Architecture (`src/features/<feature-name>/`) with strict separation of presentation and domain logic.
- **Consequences**: Easy module navigation and isolated testing.

---
