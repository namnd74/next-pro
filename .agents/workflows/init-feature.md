---
description: Automatically scaffold a Feature-Based module in src/features/
---

# Workflow: Init Feature Module

1. Ask for or extract the `<feature_name>` parameter (e.g. `auth`, `payment`, `user`).
2. Create directory structure under `src/features/<feature_name>/`:
   - `components/`: UI Presentational components (Shadcn/UI + Tailwind).
   - `hooks/`: Feature custom hooks (Zustand + React Query).
   - `api/`: Axios API endpoints and Server Actions.
   - `types/`: Domain TypeScript types and Zod schemas.
   - `index.ts`: Barrel export file for public module access.
3. Enforce `rules/code-convention.md` and `rules/frontend-core.md`.
