---
name: react-next
description: Expert guidelines for React 19 and Next.js App Router applications, RSC, Server Actions, and performance.
---

# Skill: React & Next.js Expert

## 0. Context & Project Shape

- Inspect `package.json`, `next.config.*`, `app/` or `pages/`, route conventions, data layer, and component boundaries before editing.
- If `pages/` router is detected, follow existing Pages Router patterns unless migrating is requested.

## 1. App Router & React Server Components (RSC)

- Default to Server Components (`page.tsx`, `layout.tsx`). Add `'use client'` only when state, event handlers, or browser APIs are required.
- Keep Client Components at the leaves and never import server-only modules into a client boundary.

## 2. Data Fetching & Server Actions

- Fetch data directly in Server Components using async/await.
- Use Server Actions for mutations when they fit the UX; validate with Zod and enforce auth/authorization inside the action.
- Prefer tag-based cache invalidation (`revalidateTag`/`updateTag`) for precise updates; use `revalidatePath` when route-level refresh is intended.

## 3. Routing, Errors & Performance

- Use Next `<Image />` for optimizable images and `<Link />` for internal navigation; keep `<a>` for external/download/mail/tel links.
- Add `loading.tsx`, `error.tsx`, `not-found.tsx`, and `Suspense` boundaries where routes need streaming or failure states.
- Use `generateMetadata`, `next/font`, dynamic imports, and bundle analysis for SEO, stable typography, and heavy client-only components.
