---
name: database
description: Production database principles covering schema design, indexing, anti-N+1 query optimization, concurrency control, connection pooling, and migration safety.
---

# Skill: Database & Data Architecture Expert

## 0. Meta-Directives & Context Awareness

- **Context Inspection:** Before generating new schemas, migrations, or queries, use `grep_search` or `view_file` to inspect existing DB schema definitions, ORM configurations (Prisma/Drizzle/TypeORM), and migration histories first. Match existing conventions.
- **Cross-Skill Delegation:** This skill defines universal data principles. Framework-specific ORM setup (e.g. NestJS `PrismaService`) is handled by the respective backend skill.

## 1. Schema Design, Integrity & PII Protection

- **Naming Conventions:** Use `snake_case` for identifiers (plural table names: `users`, `order_items`; clear FKs: `user_id`).
- **Primary & Foreign Keys:** Explicit Primary Key (`id` UUID or BIGINT) and Foreign Key constraints enforced at DB level.
- **Foreign Key Cascade Rules:** Default to `ON DELETE RESTRICT` for business data; use `CASCADE` only for owned child rows after confirming lifecycle semantics. Never cascade primary audit trails (orders, invoices).
- **Audit Columns:** Business entities should include `created_at`, `updated_at`, and soft-delete/status fields when lifecycle tracking matters; skip only for pure join/lookup tables with clear reason.
- **Exact Data Types & PII Encryption:** Use `DECIMAL`/`NUMERIC` for monetary amounts. NEVER use `FLOAT` or `DOUBLE` for financial data. Encrypt or mask PII (SSN, phone, payment cards) at app/DB level.

## 2. Query Optimization & Anti-N+1

- **Indexing Rules:** Add indexes for high-cardinality `WHERE`, `JOIN`, sort, and FK access patterns; validate with `EXPLAIN` for hot queries to avoid write-heavy over-indexing.
- **Anti-N+1 Query:** Use eager loading (`include`/`JOIN`) or dataloaders when relation access would otherwise cause N+1 SELECT overhead.
- **Selective Projection:** Avoid unconstrained `SELECT *`; fetch only required columns to save IO and bandwidth.

## 3. Concurrency Safety & Connection Pooling

- **Connection Pooling:** Configure explicit DB connection pool limits (`connection_limit`) and idle timeouts. Use pooling proxies (PgBouncer, Prisma Accelerate) for serverless environments to prevent connection exhaustion.
- **Atomicity:** Wrap all multi-table or multi-step mutations inside a Database Transaction (`BEGIN ... COMMIT/ROLLBACK`).
- **Concurrency Controls:** Guard state-sensitive data against race conditions using DB-level `UNIQUE` constraints, Optimistic Locking (`version` column), or Pessimistic Locking (`SELECT ... FOR UPDATE`).

## 4. Migration & Schema Drift Management

- **GitOps Migrations:** All DB schema changes MUST be managed via version-controlled, automated migration scripts.
- **Anti-Schema-Drift:** Any manual SQL executed via external tools (DBeaver/CLI) MUST be immediately back-synced into ORM schemas and migration files.
- **Zero-Downtime Migrations:** Favor additive, non-destructive migrations. Never drop columns directly in live production deployments.

## 5. Anti-Pattern Guardrails

- **NEVER** use `FLOAT` or `DOUBLE` for financial/currency values.
- **NEVER** use unconstrained `ON DELETE CASCADE` on critical business audit records.
- **NEVER** store PII (phones, SSN, cards) in plaintext without encryption or masking.
- **NEVER** execute raw concatenated SQL strings with user inputs (SQL Injection risk).
- **NEVER** perform hard deletes on primary business entities; use soft deletes (`deleted_at`).
