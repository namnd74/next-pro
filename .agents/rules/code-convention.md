# Rule: Code Convention

## 1. Naming Standards

- **Variables & Functions**: `camelCase` (e.g., `fetchUserData`, `isLoggedIn`).
- **Components, Types, Interfaces, Enums**: `PascalCase` (e.g., `UserProfile`, `NavigationProps`).
- **Files & Directories**: `kebab-case` (e.g., `user-profile.tsx`, `use-auth.ts`).
- **Constants**: `UPPER_SNAKE_CASE` (e.g., `MAX_RETRY_ATTEMPTS`).

## 2. Guard Clauses & Control Flow

- Use early returns to minimize nested `if/else` statements.
- Keep happy path at the lowest indentation level.
- Maximum nesting depth: 2 levels.

## 3. Strict Type Safety

- Prohibit `any`. Use explicit interfaces, types, or `unknown` with type narrowing.
- Avoid non-null assertion operators (`!`) unless strictly validated upstream.

## 4. Error Handling

- Use explicit error objects or Result patterns (`{ data, error }`) instead of unhandled exceptions.
- Never swallow errors silently in empty `catch` blocks. Always log or wrap gracefully.

## 5. Imports & Module Structure

- Group imports: 1) External libs 2) Internal modules 3) Types/Styles.
- Prefer absolute path aliases (e.g., `@/components/...`) over relative paths (`../../`).
