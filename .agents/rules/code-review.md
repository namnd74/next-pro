# Rule: Automated Code Review Checklist

Run every proposed change against this senior developer checklist before completing tasks:

## 0. Context-Aware Stack Audit (Dynamic Check)

- Inspect project dependency manifests or source code to identify active tech stacks, then apply matching Anti-Pattern Guardrails from corresponding SKILL files.

## 1. Correctness & Edge Cases

- [ ] Are `null`, `undefined`, empty arrays, and async timeout edge cases handled?
- [ ] Is input validation enforced at API / function entry boundaries?
- [ ] Is there corresponding unit/integration test coverage for modified logic?

## 2. Zero-Regression & Contract Safety

- [ ] Are existing function signatures and export contracts preserved?
- [ ] Do all calling sites remain compatible with modified parameters?

## 3. Performance & Memory Audit

- [ ] Are unnecessary re-computations, re-renders, or infinite loops prevented?
- [ ] Are resources, event listeners, and timers cleaned up properly?

## 4. Security Audit

- [ ] Are secrets, API keys, and private tokens kept out of source code?
- [ ] Is user input sanitized to prevent XSS and injection vulnerabilities?

## 5. Conciseness & Readability

- [ ] Is the implementation clean, concise, and free of redundant helper code?
- [ ] Are docstrings and comments preserved without cluttering?
