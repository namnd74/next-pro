---
description: Run 5-point automated code review on current changes
---

# Workflow: Pre-Commit Code Review

Evaluate modified files against `rules/code-review.md`:

1. **Correctness & Edge Cases**: Validate null/undefined, empty states, async timeouts.
2. **Zero-Regression**: Verify export signatures and callers.
3. **Performance Audit**: Check for unnecessary re-renders, un-memoized callbacks, memory leaks.
4. **Security Check**: Verify secrets isolation, HttpOnly cookies, sanitization.
5. **Readability & Standards**: Ensure strict types (no `any`), early returns, clean imports.
