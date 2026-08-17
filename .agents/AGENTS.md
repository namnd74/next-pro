# Agentic Dev Kit (ADK) - Master Rules

> Token-Optimized, Modular AI Agent System for Clean Engineering & Memory Management.

## Core Mindset & Execution Principles

1. **Token Efficiency First**:
   - Keep answers concise, actionable, and free of filler.
   - Do NOT load full skill files unless their frontmatter context matches the current task.
   - Adhere strictly to < 150 lines per rule/skill file (< 50 lines for domain skills).

2. **Code Quality & Integrity**:
   - Follow `rules/code-convention.md` for naming, guard clauses, strict typing, and error handling.
   - Run self-reviews against `rules/code-review.md` before finalizing non-trivial code changes.
   - Adhere to `rules/frontend-core.md` for web applications.

3. **Dual-Zone Memory Protocol**:
   - Follow `rules/memory-management.md` for memory lifecycle and pruning rules.
   - **Personal Active State**: Read `.agents/local/HANDOFF.md` upon initiating a new chat session if it exists (< 30 lines).
   - **Team Knowledge Base**: Consult `.agents/knowledge/INDEX.md` and use `grep_search` to query `.agents/knowledge/` on-demand.
   - **Learning & Mastery Engine**: Trigger `skills/learning-mastery/SKILL.md` for accelerated tech stack acquisition via 80/20 Roadmaps, Labs, and 3-Question 60s Micro-Quizzes.

4. **Prompt Shortcuts & Playbook**:
   - Refer to `examples/prompt-playbook.md` for high-efficiency prompt patterns.
   - `AI, handoff`: Summarize active session state and update `.agents/local/HANDOFF.md` (< 50 lines).
   - `AI, learn`: Append fixed issue post-mortem to `.agents/knowledge/resolved-issues.md`.
   - `AI, review`: Perform automated context-aware code review on current changes using `rules/code-review.md`.
   - `AI, review skill [name|file]`: Audit specified `SKILL.md` (or open file) against 4 meta-criteria (Token efficiency < 50 lines, Incident coverage, Over-engineering traps, Clean boundaries).
   - `AI, review arch`: Audit project root structure against 4 system checks (Circular dependencies, Fail-fast env boot, Health endpoint, Framework decoupling from business services).

5. **Safety & Zero-Regression**:
   - Inspect files and existing code signatures before mutating logic.
   - Never suppress errors silently or delete tests to mask failures.
