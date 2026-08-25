# Offensive Security Curriculum Generation Status

Updated: 2026-08-26

## Current state

- Product name: Offensive Security Academy
- Canonical route: `/offensive-security` (the unreleased `/rt` route was removed)
- Curriculum architecture: drafted
- Machine-readable manifest: drafted
- Generation skill: drafted
- Curriculum validator: verified
- Full lesson migration/generation: started — first module validated
- Existing Practice Range collections: review required

The current `/offensive-security` content remains operational. It has not been declared equivalent to
the new academy and must not be counted as completion of foundation, network, Linux,
Windows, Active Directory, cloud, research, or adversary-emulation tracks.

## Latest validated batch

`os00-m01-roles-and-boundaries` — Offensive roles, authorization and legal boundaries.

Generated three closely related lessons (90 minutes total):

- `os00-l01-offensive-work-map` — distinguish engagement types by objective,
  authority and deliverable.
- `os00-l02-authority-before-capability` — apply scope, ROE, stop conditions and
  escalation before technique selection.
- `os00-l03-safe-harbor-decision` — read VDP/safe-harbor language without treating it
  as blanket permission.

All labs are browser-only decision simulations. They accept no external target,
credential, command or arbitrary payload. Completion requires all three lab cases and
all three quiz questions to be correct.

## Next eligible batch

`os00-m02-rules-of-engagement` — Scope, Rules of Engagement and deconfliction.

Do not generate it in the current batch. It becomes eligible because
`os00-m01-roles-and-boundaries` is validated.

## Required decisions before content migration

- Extend the UI information architecture beyond the current first-module view with
  career paths, domains and ATT&CK navigation.
- Whether the runtime parser should later be replaced by a shared JSON Schema or Zod
  boundary as more academy modules are generated.
- Decide whether existing collection URLs remain a Web/Frontend Practice Range or are
  reorganized when the corresponding curriculum track is generated.
- Local lab packaging policy for containers and Windows/AD virtual machines.
- Progress model for evidence, hints, attempts, remediation tests, and competency.

## Legacy-data integration decision

- New academy data is the curriculum source of truth: prerequisites, outcomes,
  explanation, assessment, evidence and completion.
- Existing collections remain a Practice Range. A future academy lesson may reference
  a matching collection/mission as guided practice, assessment or remediation.
- References must be explicit and justified by matching outcomes; do not infer a match
  from similar keywords and do not copy the old content into the new JSON.
- Completing a legacy mission does not automatically complete an academy lesson. The
  academy assessment remains the competency gate.
- The first module intentionally has no legacy reference because none of the current
  frontend-oriented missions teaches authorization or legal boundaries.

## Evidence log

- `npm run validate:offensive-security-curriculum`: passed — 19 tracks, 64 modules; next
  eligible module is `os00-m02-rules-of-engagement`.
- `npm run validate:offensive-security-content`: passed — module ID, unique lesson graph,
  outcomes, mechanism sections, three-case labs, evidence, easy/medium/hard quizzes,
  transfer tasks, governance, sources and the 90-minute total.
- Quality rubric review: 22/22 for each lesson; no dimension scored zero. The bounded
  decision labs provide reproducible evidence, governance sections cover prevention,
  observable records, response and residual risk, and each lesson ends with a new-context
  transfer challenge.
- Skill frontmatter: validated locally (`name` and `description`). The bundled Python
  `quick_validate.py` could not run because PyYAML is not installed; no dependency was
  added solely for this check.
- `npm run lint -- scripts/validate-offensive-security-curriculum.mjs`: passed.
- `npm run typecheck`: passed.
- Prettier check and `git diff --check`: passed.

Runtime integration: `/offensive-security/academy/roles-and-boundaries` plus three statically generated
lesson routes, persistent completion state, entry card on `/offensive-security`, and a Core Academy
sidebar shortcut.
