---
name: agent-harness
description: Bounded execution harness, plan lifecycle (Draft -> Align -> Approve -> Execute), iterative verification loops, and subagent vs in-context loop decision matrix.
---

# Agent Harness & Execution Protocol

Standards for plan lifecycle, bounded execution loops, and topology routing.

## 1. Plan Lifecycle Gate (Draft -> Align -> Approve -> Execute)

```
[User Request] ──► 1. Plan [DRAFT] ──► 2. Align & Discuss ──► 3. User Approval [APPROVED]
                                                                        │
                                                                        ▼
                                                             4. Bounded Execution Loop
```

1. **Phase 1 — Initial Plan as `[DRAFT]`**:
   - Every initial implementation plan is explicitly labeled `[STATUS: DRAFT]`.
   - Outlines architecture, trade-offs, and file changes. **Zero code modifications** permitted during draft.
2. **Phase 2 — Interactive Alignment**:
   - Refine design based on user feedback, edge cases, and subagent insights. Update draft as needed.
3. **Phase 3 — Explicit Approval Gate (`[APPROVED]`)**:
   - Transition status to `[STATUS: APPROVED]` **ONLY** upon explicit user confirmation.
4. **Phase 4 — Bounded Execution Loop (4-Phase Cycle)**:
   - **Inspect**: Read signatures & contracts before editing.
   - **Action**: Apply atomic, modular code changes.
   - **Verify**: Run `typecheck`, `test`, `lint`.
   - **Self-Correct**: Fix root causes from traces (max **3 iterations** before halting).

## 2. Decision Matrix: Subagent vs In-Context Loop

| Aspect         | 🔁 Loop (In-Context Single Agent)          | 🤖 Subagent (Isolated Worker)                       |
| :------------- | :----------------------------------------- | :-------------------------------------------------- |
| **Dependency** | Sequential, tightly coupled steps.         | Independent parallel workstreams.                   |
| **Scope**      | Same module, test-fix-verify cycle.        | Broad multi-repo/file research, distinct roles.     |
| **Context**    | Preserves shared working memory.           | Prevents main context pollution.                    |
| **Filesystem** | Safe, single writer.                       | Isolated/read-only to prevent overwrite.            |
| **Efficiency** | **Default**: Fast, minimal token overhead. | Higher overhead: requires structured schema output. |

### Golden Rule:

- **Default to Loop** for feature builds, bug fixes, refactoring, and UI/UX changes.
- **Use Subagent** only for wide read-only research or independent parallel tasks with clear output contracts.
