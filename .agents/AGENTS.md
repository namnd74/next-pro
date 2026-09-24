# Agentic Dev Kit — next-pro

> 4-Tier Unified Stack: Superpower OS · Matt Pocock TS · Ponytail Anti-bloat · UI/UX Pro Max

## 1. Workflow OS (Superpower)

- Read `.agents/local/HANDOFF.md` at session start (< 30 lines).
- Consult `.agents/knowledge/INDEX.md` and `grep_search` `.agents/knowledge/` on-demand.
- `AI, handoff`: Update `.agents/local/HANDOFF.md` (< 50 lines).
- `AI, learn`: Append post-mortem to `.agents/knowledge/resolved-issues.md`.
- `AI, review`: Run `rules/code-review.md` against current changes.
- `AI, review arch`: Audit project against 4 system checks.

## 2. Code Quality & TypeScript (Matt Pocock TS)

- Follow `rules/code-convention.md` for naming, guard clauses, strict typing.
- Activate `skills/matt-pocock-ts/SKILL.md` for all TypeScript work and planning.
- **Zero `any`** — `unknown` + type narrowing only.
- Run self-reviews against `rules/code-review.md` before finalizing changes.

## 3. Anti-Bloat Filter (Ponytail)

- Activate `skills/ponytail/SKILL.md` BEFORE writing any code.
- Apply the **7-Rung Ladder of Laziness** — do not write code if a simpler solution exists.
- NEVER `npm install` without exhausting existing dependencies first.

## 4. Visual Design (UI/UX Pro Max)

- Activate `skills/ui-ux-pro-max/SKILL.md` for any UI/visual/design work.
- Adhere to `rules/frontend-core.md` for web application structure.
- Run: `python3 skills/ui-ux-pro-max/scripts/search.py "<query>" --design-system` before major UI decisions.

## 5. Active Skill Index

| Skill                     | Trigger                       |
| :------------------------ | :---------------------------- |
| `skills/ponytail`         | ALWAYS before writing code    |
| `skills/matt-pocock-ts`   | TypeScript work + planning    |
| `skills/react-next`       | Next.js / React changes       |
| `skills/tailwind-styling` | Styling / CSS work            |
| `skills/ui-ux-pro-max`    | UI design decisions           |
| `skills/testing`          | Writing or fixing tests       |
| `skills/agent-harness`    | Multi-step execution planning |
| `skills/learning-mastery` | Learning feature development  |
| `skills/database`         | Schema / query decisions      |

## 6. Safety & Zero-Regression

- Inspect files and existing code signatures before mutating logic.
- Never suppress errors silently or delete tests to mask failures.
- Verify: `npm run typecheck && npm run lint` before declaring done.
