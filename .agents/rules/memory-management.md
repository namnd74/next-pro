# Rule: Memory Management & Self-Pruning

Strict rules for managing dual-zone memory (`.agents/local/` and `.agents/knowledge/`):

## 1. Local Handoff Memory (`.agents/local/HANDOFF.md`)

- **Hard Limit**: Keep under 50 lines total (~500 tokens).
- **Pruning Criteria**:
  - Automatically remove completed tasks (`[x] Done`) that are older than 3 chat sessions.
  - Summarize multiple granular steps into a single 1-line active objective.
  - Keep active blockers and immediate next steps at the top.

## 2. Shared Team Knowledge (`.agents/knowledge/`)

- **Resolved Issues (`resolved-issues.md`)**:
  - Record entry format: `[YYYY-MM-DD] Issue #ID/Topic: <Short Cause>. Fix: <Short Resolution>.`
  - Maximum 3 lines per entry. Keep entries actionable.
- **Architecture Decisions (`architecture.md`)**:
  - Use lightweight ADR (Architectural Decision Record) format: Title, Status, Context, Decision, Consequences.

## 3. Context Search Efficiency

- Use `grep_search` to query `.agents/knowledge/` on-demand instead of reading full documents into context.
