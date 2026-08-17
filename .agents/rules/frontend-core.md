# Rule: Frontend Core Guidelines

Framework-agnostic principles for web applications:

## 1. Component-Driven Architecture

- **Dumb (UI) Components**: Presentational only, stateless, receiving data via props.
- **Smart (Container) Components**: Handle business logic, API calls, and state coordination.
- Feature-Based Organization: Group components, hooks, api, and types inside `src/features/<feature-name>/`.

## 2. State Management Rules

- **Local UI State**: Use local state for dropdowns, modals, and input fields.
- **Global App State**: Use global stores (Pinia/Zustand/Context) ONLY for app-wide data (user session, theme).
- **Server State**: Use dedicated caching/fetching tools (TanStack Query, SWR, Server Actions) instead of manual global stores.

## 3. Web Performance & Vitals

- Optimize LCP & CLS: Always specify image dimensions and use dynamic imports for heavy components.
- Minimize bundle size: Tree-shake dependencies and lazy-load non-critical routes.

## 4. Accessibility (a11y) & Security Baseline

- Use semantic HTML tags (`<nav>`, `<main>`, `<article>`, `<button>`).
- Enforce ARIA labels for icon-only buttons.
- Store sensitive auth tokens in `HttpOnly` cookies, never in `localStorage`.
