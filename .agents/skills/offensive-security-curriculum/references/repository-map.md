# Repository Map

## Current Red Team feature

- Routes: `src/app/offensive-security/`
- Feature entry: `src/features/offensive-security/index.ts`
- Types: `src/features/offensive-security/types/index.ts`
- Roadmap: `src/features/offensive-security/data/roadmap.ts`
- Loader: `src/features/offensive-security/data/collection-loader.ts`
- Current content: `src/features/offensive-security/data/collections/*.json`
- Mission renderer: `src/features/offensive-security/components/mission-tabs-view.tsx`
- Interactive range registry: `src/features/offensive-security/components/ui-demo-stage.tsx`
- Current ranges: `src/features/offensive-security/components/ranges/`
- Progress store: `src/features/offensive-security/stores/use-offensive-security-store.ts`

## Current limitations to account for

- The existing six phases represent frontend-oriented collections, not the full
  offensive-security roadmap.
- Existing progress records only launched and patched vector IDs; it does not prove
  evidence, blind-lab completion, hints, attempts, remediation tests, or competence.
- Current mission rendering exposes debrief answers directly.
- Current JSON is asserted as TypeScript types by the loader rather than validated at
  runtime, so schema drift can pass unnoticed.
- Existing mission data has used difficulty values outside the declared
  `OffensiveSecurityDifficulty` union; validate rather than copying this pattern.
- Browser ranges are useful demonstrations but cannot replace real packet, OS,
  multi-origin, identity, cloud, or distributed-system labs.

## Migration rule

Do not delete or relabel current collections mechanically. Inventory each lesson and
classify it against `taxonomy.md`:

- migrate genuine web/API security material into track 07;
- migrate attacker-controlled resource exhaustion into track 16;
- move pure React correctness/performance/testing material out of offensive security
  unless a security path and impact are established;
- retain stable URLs or provide an explicit redirect/data migration plan;
- preserve user progress only when old and new competencies are meaningfully equal.

## Project checks

- `npm run validate:offensive-security-curriculum`
- `npm run typecheck`
- `npm run lint`
- `npm run build`

Run narrower checks first while drafting, then the full relevant set before handoff.
