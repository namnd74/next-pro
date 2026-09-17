---
name: nestjs
description: Expert guidelines for NestJS production architecture (Modular/Clean UseCases), Dependency Injection, DTO validation, Guards, Interceptors, Pipes, and Exception Filters.
---

# Skill: NestJS Framework Expert

## 0. Meta-Directives & Context Awareness

- **Context Inspection:** Before generating new files, use `grep_search` or `view_file` to inspect existing project structure, module organization, naming conventions, and import styles first. Match the existing codebase.
- **Cross-Skill Delegation:** When the `testing` skill is available, defer testing methodology to it (this skill only mandates creating `.spec.ts` files alongside Services/UseCases).

## 1. Modular Architecture & Flexible Layering

- **Smart Default:** Default to NestJS standard **Feature-Based Modular Architecture** (`@Module()` containing Controllers, Services/UseCases, and DTOs).
- **Clean Architecture Adaptation:** Adapt flexibly to Clean Layering (`Controller` ➔ `Use Case` ➔ `Domain` ➔ `Infrastructure`) inside modules when enterprise or domain-heavy constraints apply.
- **Prisma Integration Pattern:** Wrap `@prisma/client` inside an injectable `PrismaService` extending `OnModuleInit` for connection lifecycle management.
- Avoid circular module dependencies; refactor modules or use `forwardRef()` cautiously.

## 2. Single Responsibility & Building Blocks

- **Controller**: Handle HTTP routing & DTO binding ONLY. Never put business logic in Controllers. Add `@nestjs/swagger` decorators when Swagger/OpenAPI is installed or requested.
- **Real-Time Gateways:** Wrap real-time features in dedicated `@WebSocketGateway()` gateways using WsAdapter with Auth Guards when real-time capabilities are required.
- **Service / Use Case**: Contain pure business logic and domain rules. Inject Repositories/Prisma via constructor Dependency Injection.
- **DTO**: Use `class-validator` & `class-transformer` with explicit TypeScript types.
- **Pipes**: Use global `ValidationPipe({ whitelist: true, transform: true, forbidNonWhitelisted: true })`.
- **Guards**: Enforce authentication (JWT) and authorization (RBAC) via `@UseGuards()`.
- **Interceptors**: Transform response payloads into standard envelopes (`{ success: true, data, timestamp }`) and trace execution timing.
- **Exception Filters**: Normalize all thrown domain/HTTP errors using custom `@Catch()` filters.

## 3. Fail-Fast Config, Security & Health Checks

- Register `@nestjs/terminus` `HealthModule` for DB and memory health indicators.
- Enable API versioning for public or long-lived APIs; match existing project strategy before choosing URI/header/media-type versioning.
- Validate environment variables at bootstrap using `@nestjs/config` with Zod or Joi schemas. Fail fast if required variables are absent.
- Enable `helmet`, explicit CORS allowlists, and `ThrottlerModule` for public endpoints in `main.ts`.

## 4. Scope & Performance

- Keep Providers in default **Singleton Scope** (`DEFAULT`). Avoid `REQUEST` scope unless strictly necessary to prevent memory bloat.
- Use Custom Decorators (`@CurrentUser()`, `@Public()`) to keep route handlers clean.

## 5. Testing Pattern

- Write unit tests for Services / Use Cases using `@nestjs/testing` Test Module with mocked dependencies (`jest.Mocked`).

## 6. Anti-Pattern Guardrails

- **NEVER** inject Repositories or DB clients directly inside Controllers.
- **NEVER** use `@Req()` or `@Res()` in Controller handlers unless explicitly handling file streaming (preserves NestJS Interceptors & Response Envelopes).
- **NEVER** disable `forbidNonWhitelisted: true` in `ValidationPipe` (prevents Mass Assignment vulnerabilities).
