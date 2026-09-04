---
name: offensive-security-curriculum
description: Designs, writes, reviews, and expands the authorized Red Team and Offensive Security curriculum in this repository. Use for roadmap, taxonomy, lessons, labs, assessments, sources, or curriculum data; not for operating against real targets.
---

# Offensive Security Curriculum

Build a progressive, evidence-based, hands-on academy that separates career paths,
attack surfaces, adversary lifecycle stages, and individual techniques.

## Start here

Before changing curriculum content:

1. Read [`references/taxonomy.md`](references/taxonomy.md).
2. Read the relevant track in [`references/roadmap.md`](references/roadmap.md).
3. Read [`references/content-contract.md`](references/content-contract.md).
4. Inspect `docs/offensive-security/curriculum-manifest.json` and select only eligible work.
5. Inspect the target types, loader, renderer, and one nearby content file listed in
   [`references/repository-map.md`](references/repository-map.md).
6. For a lab, also read [`references/lab-policy.md`](references/lab-policy.md).
7. For research or citations, read [`references/source-policy.md`](references/source-policy.md).

Use [`references/quality-rubric.md`](references/quality-rubric.md) for final review.

## Scope one run

- Generate at most one module or three closely related lessons per run unless the
  user explicitly requests another batch size.
- Select lessons whose prerequisites are already `validated` or `published`.
- Finish validation and update status before starting another batch.
- Do not mark work complete merely because prose or JSON was generated.

## Required learning loop

Each practical lesson should move through:

```text
mental model -> mechanism -> safe demonstration -> guided lab (WASM sandbox) -> blind variant
-> evidence -> mitigation -> detection -> transfer challenge
```

Adapt the presentation to the domain. Packet flows need network diagrams, Active
Directory needs identity/relationship graphs, vulnerability research needs a
crash-to-root-cause flow, and availability lessons need load and recovery metrics.

## Runtime Portfolio Standards (ADR-001)

- Every generated lesson strictly follows ADR-001:
  - `webcontainer-node`: In-browser Node.js/Web HTTP execution via WebContainerWorkbenchAdapter.
  - `telemetry-inspector`: Structured log, configuration, and diff reviews via CodeMirror.
  - `decision-lab`: Authentic professional decision scenarios with comprehensive rationale.
- Prohibited: Never generate custom regex SQL parsers, POSIX kernels, or mock AD KDCs.
- Prohibited in Verification: Never hardcode mock HTTP responses or synthetic database objects in contract harnesses. All runtime competency tests must bind to real network sockets, SQLite processes, or OS filesystem calls.

## Non-negotiable distinctions

- Red Teaming, penetration testing, bug bounty, vulnerability research, exploit
  development, and purple teaming are engagement or career paths, not phases of
  one linear attack.
- Network, Linux, Windows, Active Directory, web/API, cloud, mobile, wireless,
  hardware, and AI are attack surfaces.
- Zero-day, CVE, fuzzing, malware, C2, botnet, and DDoS are vulnerability states,
  artifacts, capabilities, or techniques. Do not model them as equivalent careers.
- A reliability bug belongs in offensive security only when the lesson proves an
  attacker-controlled path, a security impact, and a verifiable mitigation.

## Safety boundary

Create content only for authorized assessment, intentionally vulnerable targets,
or isolated simulations. Labs must not accept arbitrary external targets, propagate,
establish persistence outside the lab, collect real credentials, or create an
unbounded traffic generator. High-risk capabilities must be represented by bounded
simulation plus telemetry, mitigation, cleanup, and explicit authorization notes.

## Repository workflow

1. Preserve the current feature architecture unless the task explicitly includes a
   schema or UI migration.
2. Prefer a data-driven lesson over a bespoke component when the existing renderer
   can express it.
3. Use a custom local lab only when browser simulation cannot teach the real
   boundary, such as packets, OS permissions, multiple origins, identity services,
   or distributed systems.
4. Add authoritative sources near the claims they support.
5. Run `npm run validate:offensive-security-curriculum` after changing the manifest.
6. Run the relevant content validator, typecheck, lint, tests, and build in
   proportion to the changed files.
7. Update `docs/offensive-security/GENERATION_STATUS.md` with completed work, evidence,
   unresolved issues, and the next eligible batch.

## Definition of done

A generated lesson or lab is complete only when:

- terminology and taxonomy are correct;
- prerequisites and learning outcomes are explicit;
- mechanisms explain trust boundaries and causal steps;
- examples are safe, reproducible, and deeper than a happy-path walkthrough;
- success requires observable evidence rather than clicking a completion button;
- mitigation is verified and detection telemetry is discussed;
- sources are authoritative, current, and directly support the claims;
- data/schema validation and relevant project checks pass;
- manifest and generation status reflect the actual state.
