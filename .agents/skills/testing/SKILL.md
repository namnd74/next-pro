---
name: testing
description: Expert guidelines for Vitest, Jest, React Testing Library, and E2E testing best practices.
---

# Skill: Testing & Quality Assurance Expert

## 0. Context & Test Runner

- Inspect package scripts, existing test files, mocks, fixtures, and CI conventions before adding tests.
- Match the current runner (Vitest/Jest/Playwright/Cypress) and assertion style.

## 1. Unit & Integration Testing

- Test behavior, not implementation details.
- Use `describe` blocks grouped by module/feature, and `it` or `test` with clear behavioral titles.
- Cover edge cases, error paths, async timing, and contract boundaries touched by the change.

## 2. Test Safety

- Never delete or comment out failing tests to bypass errors. Fix the underlying implementation or contract.
- Clean up mocks (`vi.clearAllMocks()`/`jest.clearAllMocks()`), timers, DOM, and network handlers between test cases.
- Keep E2E tests focused on critical user journeys; avoid brittle selectors when accessible roles/text are available.
