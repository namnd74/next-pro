---
name: business-analysis
description: Professional Business Analysis guidelines covering Problem Framing, Requirements Engineering (BRD/SRS/User Stories), Process Modeling (BPMN), Data & Domain Modeling, and Traceability.
---

# Skill: Business Analysis & Requirements Engineering

## 0. Meta-Directives & Context Discovery

- **Context Inspection:** Before writing requirements or specs, inspect existing domain docs (`README.md`, `SRS.md`, `BRD.md`, tickets, `schema.sql`) using search/read tools. If none exist, ask concise discovery questions before drafting.
- **Problem First:** Focus on the business problem, user pain points, and outcome metrics before diving into solution implementation.
- **Cross-Skill Handoff:** Once business specs are approved, delegate schema design to `database` skill and API/architecture implementation to relevant tech stack skills.

## 1. Requirements Architecture & Taxonomy

- **BRD (Business Requirements Document):** Define business objectives, vision, ROI metrics, target personas, scope (In-Scope/Out-of-Scope), and strategic constraints.
- **SRS / Functional Specs (FRD):** Detail functional requirements (system behaviors, inputs, validations, outputs) and non-functional requirements (NFRs: Latency, Availability, Scalability, Security, Compliance).
- **User Stories & AC:** Write standard stories (`As a <role>, I want <goal>, So that <benefit>`) tagged with explicit priority levels (Must/Should/Could/Won't) and testable Acceptance Criteria using Gherkin format (`Given-When-Then`).

## 2. Process & Domain Modeling

- **Process Mapping (BPMN 2.0):** Model As-Is and To-Be workflows using clear activity steps, decision gateways, parallel paths, and exception/error flows.
- **Domain & Data Requirements:** Define core domain entities, relationships (1:1, 1:N, N:M), data attributes, business validation rules, and state transition matrices.
- **System Boundaries & Integration:** Map actors, external APIs, data flow diagrams (DFD), and interface touchpoints.

## 3. Impact, Traceability & Quality Standards

- **INVEST & SMART:** Ensure User Stories are **I**ndependent, **N**egotiable, **V**aluable, **E**stimable, **S**mall, and **T**estable. Define SMART KPIs.
- **Requirements Traceability Matrix (RTM):** Link Business Goals → Functional Specs → User Stories → Test Cases for critical flows; call out orphan or untestable requirements explicitly.
- **Gap & Risk Analysis:** Perform SWOT, Gap Analysis, and Edge Case Enumeration (error states, network timeouts, edge inputs).

## 4. Anti-Pattern Guardrails

- **NEVER** write solution-biased requirements (describing exact UI controls/DB implementations instead of business logic & user intent).
- **NEVER** leave Acceptance Criteria ambiguous ("system must be fast" → specify "p95 response time < 200ms").
- **NEVER** mix In-Scope and Out-of-Scope items without explicit boundary definition.
- **NEVER** omit exception paths, edge cases, or rollback logic in process flows.
