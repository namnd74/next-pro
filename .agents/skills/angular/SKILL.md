---
name: angular
description: Expert guidelines for Angular 17+ applications covering standalone components, signals, routing, RxJS, forms, dependency injection, testing, and performance.
---

# Skill: Angular Framework Expert

## 0. Context & Project Shape

- Inspect `angular.json`, `package.json`, `tsconfig*.json`, `src/app/`, routing files, state patterns, and Angular version before editing.
- Match existing NgModule or standalone architecture; prefer standalone components for new Angular 17+ code when no convention exists.
- Follow established folder boundaries; default to feature-based organization for routes, components, services, models, and tests.

## 1. Components, Templates & State

- Keep components focused on presentation and UI orchestration; move business logic and side effects into services or stores.
- Use signals (`signal`, `computed`, `effect`) for local reactive state where appropriate; keep RxJS for async streams, events, and external data sources.
- Use `ChangeDetectionStrategy.OnPush` for non-trivial components and avoid template function calls that recompute on each change detection pass.
- Prefer typed `@Input()`/`@Output()` or signal inputs/outputs according to the project Angular version and existing style.

## 2. Routing, Data & Forms

- Use lazy-loaded routes for feature areas and protect routes with guards when authentication or authorization is required.
- Fetch HTTP data through injectable services with typed DTOs; centralize auth headers, base URLs, and error mapping in interceptors.
- Use Reactive Forms for complex forms; define typed controls, validators, disabled/loading states, and accessible error messages.
- Handle loading, empty, error, and retry states explicitly for data-driven screens.

## 3. Performance, Security & Testing

- Use `trackBy`/`@for (...; track ...)` for lists, `async` pipe for subscriptions, and clean up manual subscriptions with `takeUntilDestroyed`.
- Sanitize or avoid dynamic HTML; never bypass Angular security APIs unless the source is trusted and documented.
- Add focused unit tests for components/services and integration tests for route/form behavior using the project's existing runner.
- Keep bundles lean with route-level code splitting and avoid importing large libraries into shared or root modules without need.
