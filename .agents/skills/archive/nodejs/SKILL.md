---
name: nodejs
description: Production-ready Node.js backend guidelines covering architecture options (Modular/Layered/Clean), Express/Fastify, Zod validation, error handling, security, logging, and DB migrations.
---

# Skill: Node.js Backend Expert

## 0. Meta-Directives & Context Awareness

- **Context Inspection:** Before generating new files, use `grep_search` or `view_file` to inspect existing project structure, naming conventions, and import styles first. Match the existing codebase.
- **Cross-Skill Delegation:** If NestJS is selected or detected, defer immediately to `skills/nestjs`. When the `testing` skill is available, defer testing methodology to it (this skill only mandates test file creation `.test.ts`).

## 1. Project Initiation & Architecture Preference

- **Initiation Rule:** Infer architecture from existing structure, user request, or framework conventions when context is clear. Ask only when the choice is unspecified and materially affects file layout:
  1. **Feature-Based Modular** (default for scalable apps: `src/features/<feature>/`)
  2. **Classic Layered** (simple 3-tier: `Controller` ➔ `Service` ➔ `Repository`)
  3. **Clean / Hexagonal Architecture** (domain-heavy apps: `Controller` (Adapter) ➔ `Use Case` ➔ `Domain` ➔ `Infrastructure`)
- If starting from an empty project and the user does not specify a framework, ask once: Express (stability) vs Fastify (performance).
- **Separation of Concerns:** Keep business logic decoupled from HTTP framework objects (`req`, `res`) to ensure testability and portability.

## 2. Validation & Fail-Fast Bootstrap

- Validate all incoming `req.body`, `req.query`, and `req.params` using Zod or TypeBox schemas.
- Validate critical environment variables (`DATABASE_URL`, `JWT_SECRET`) at boot time; fail fast immediately if missing. Always maintain a `.env.example` file.
- Return standard response envelopes: `{ success: true, data: ... }` or `{ success: false, error: { message, code } }`.

## 3. Centralized Error Handling & Event Loop Safety

- Never block the Event Loop with heavy sync calls (`fs.readFileSync`). Use streams or worker threads.
- Use a single **Centralized Error Middleware** at the end of the app chain. Never suppress errors silently with empty catch blocks.

## 4. Security, Health Checks & Graceful Shutdown

- Always expose `GET /health` returning `{ status: 'ok', uptime: process.uptime(), timestamp: new Date().toISOString() }`.
- **Real-Time Capabilities:** Use `socket.io` or `ws` with explicit connection heartbeats and authentication middleware when real-time functionality is required.
- Enable `helmet`, explicit CORS allowlists, and rate-limiting (`express-rate-limit` / `@fastify/rate-limit`) for public APIs.
- Implement Graceful Shutdown: Handle `SIGTERM`/`SIGINT` to close DB pools and server sockets cleanly before process exit.

## 5. Observability & Logging

- Use structured JSON logging with Pino/Winston in services and request paths; reserve `console` for tiny CLIs or bootstrap diagnostics.
- Attach a unique `correlationId` to incoming requests for end-to-end request tracing.

## 6. Database Interactivity & Migrations

- Use Prisma or Drizzle ORM for type-safe database queries.
- Never write raw concatenated SQL. Use parameterized queries, DB transactions for multi-table updates, and manage schema changes via automated migrations.

## 7. Anti-Pattern Guardrails

- **NEVER** use `any` type in TypeScript files.
- **NEVER** commit `.env` files or hardcode secrets/credentials.
- **NEVER** run `npm install` without `--save-exact` or breaking lockfile consistency.
