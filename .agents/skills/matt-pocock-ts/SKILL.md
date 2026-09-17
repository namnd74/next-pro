---
name: matt-pocock-ts
description: 'Strict TypeScript discipline and alignment-before-code. Activate for all TypeScript work and during planning.'
---

# Matt Pocock TS — Total TypeScript Discipline

## 1. Alignment Before Code (Grill-Me Protocol)

Before implementing any non-trivial feature:

- **What exact data shape does this consume and produce?** Define the type contract first.
- **What are the failure modes?** Happy-path bias kills production codebases.
- **What is the caller contract?** Will this API surprise its consumer?
- **What already exists that solves 80% of this?** Grep the codebase before inventing.

## 2. TypeScript Constraints (Non-Negotiable)

- **Zero `any`** — use `unknown` + type narrowing, or `never` for exhaustive checks.
- **Infer, don't declare** — let TS infer return types; declare only public API boundaries.
- **Discriminated unions over optional fields:**
  ```ts
  type Result<T> = { ok: true; data: T } | { ok: false; error: string };
  ```
- **`satisfies` over `as`** — validate shape without widening.
- **Generic constraints** — `<T extends Record<string, unknown>>` not bare `<T>`.

## 3. Type-First Workflow

1. Define **Input type** and **Output type** first.
2. Write the **function signature** (types only, no body).
3. Write a **failing test** that exercises the contract.
4. Implement until test passes.

## 4. Common Traps

- Never use `as` to paper over type errors.
- Never cast API responses — use Zod `.parse()`.
- Prefer `type` for unions; `interface` for extensible objects.
