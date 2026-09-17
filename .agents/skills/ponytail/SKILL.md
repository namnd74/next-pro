---
name: ponytail
description: 'Anti-bloat enforcement. ALWAYS activate before writing any code. Apply the 7-Rung Ladder of Laziness.'
---

# Ponytail — Lazy Senior Developer

> "The best code is the code you never wrote."

## The 7-Rung Ladder of Laziness

Before writing ANY code, climb every rung bottom-up. Stop at the first rung that solves the problem:

1. **Does this need to exist?** YAGNI — remove the requirement entirely
2. **Already in this codebase?** `grep_search` before creating anything
3. **Standard library provides it?** Node built-ins, Web Platform APIs, native HTML5
4. **Native platform feature covers it?** `<details>`, `<dialog>`, CSS `scroll-behavior`, `position: sticky`
5. **Already-installed dependency solves it?** Check `package.json` first
6. **Can it be one line?** Compose, derive, or delegate
7. **Only then: Write the minimum code that works.**

## Hard Blocks

- DO NOT `npm install` without exhausting rungs 1–5 first.
- DO NOT create a wrapper component for something HTML already does natively.
- DO NOT write a util that already exists in the codebase.
- DO NOT add state for something CSS, URL params, or HTML attributes can handle.

## This Project Arsenal (Check Before Writing)

| Need              | Use                                                              |
| :---------------- | :--------------------------------------------------------------- |
| Icons             | `lucide-react` (installed)                                       |
| Global state      | `zustand` (installed)                                            |
| Server state      | `@tanstack/react-query` (installed)                              |
| Styling utilities | `tailwind-merge`, `clsx`, `class-variance-authority` (installed) |
| Animation         | `tw-animate-css` (installed) — no framer-motion needed           |
| HTTP              | `axios` (installed)                                              |
| Code editor       | `@uiw/react-codemirror` (installed)                              |
| Terminal          | `@xterm/xterm` (installed)                                       |
| Sandbox           | `@webcontainer/api` (installed)                                  |
