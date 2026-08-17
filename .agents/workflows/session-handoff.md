---
description: Compress personal working session state and persist team knowledge
---

# Workflow: Session Handoff & Memory Sync

Execute end-of-session memory compression:

1. **Local Handoff (`.agents/local/HANDOFF.md`)**:
   - Prune completed tasks (`[x] Done`).
   - Compress current active work and blockers to under 50 lines.
2. **Team Knowledge (`.agents/knowledge/resolved-issues.md`)**:
   - If a complex bug/issue was fixed, append a 2-line post-mortem entry.
