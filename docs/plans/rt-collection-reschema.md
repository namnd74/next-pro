# Plan: RT Data Upgrade — Red Team-owned Collection (Reschema Only)

> ⚡ TRẠNG THÁI: Phase reschema HOÀN TẤT, sau đó mở rộng thành **Red Team Academy**
> (yêu cầu mới của user): lộ trình 6 phase theo domain tấn công, học liệu riêng từng
> collection, firing range lab riêng. Chi tiết ở phần "Academy Expansion" cuối file.

> Feature: Red Team Ops (`/rt`, `src/features/red-team`)
> Decision (user-approved): give RT its own topic collection decoupled from `/learn`; migrate existing content as-is. No new topics, no content changes.

## 1 · Problem (current coupling audit)

RT data today is "made from Learn": every `RedTeamScenario.trackSlug` must equal a
`LearningTrack.slug`. Hard dependencies found:

| # | Coupling | Location |
|---|----------|----------|
| C1 | `scenario.trackSlug` must match `LearningTrack.slug` | `data/json/*.json`, types |
| C2 | Track page imports `MOCK_LEARNING_TRACKS` to render the "/learn" link | `src/app/rt/[trackSlug]/page.tsx:18,53` |
| C3 | Learn page links `/rt/${track.slug}` assuming slug equality | `src/app/learn/[trackSlug]/page.tsx:82` |
| C4 | `TOPIC_ICON` map duplicated from `/learn` TrackCard | `components/red-team-sidebar.tsx:51-62` |
| C5 | `UI_DEMO_REGISTRY` keyed by learn track slugs | `components/ui-demo-stage.tsx:25` |
| C6 | `getVectorsByLessonId(trackSlug, lessonId)` needs a learn trackSlug (no call sites today) | `data/json-loader.ts:36` |

Mission files also carry a top-level `trackSlug` key (`data/missions/*.json`).

## 2 · Target design

New first-class entity **`RedTeamCollection`** = one Red Team topic ("collection")
with its **own slug namespace** and owned presentation metadata:

```ts
// src/features/red-team/types/index.ts
export interface RedTeamCollection {
  id: string;
  slug: string;              // RT-owned namespace (no longer required to exist in /learn)
  title: string;
  tagline: string;
  missionBriefing: string;
  difficulty: RedTeamDifficulty;
  iconName: string;          // NEW — moved from sidebar TOPIC_ICON map
  color?: string;            // NEW — optional accent
  relatedTrackSlug?: string; // OPTIONAL soft link back to /learn (may be absent)
  vectors: AttackVector[];   // unchanged shape
}
```

Kept unchanged on purpose:
- `AttackVector.*` incl. `relatedLessons?` (external ref, documented as such)
- `RedTeamMission.*` (only the file-level key renames)
- Vector ids, mission slugs, all Vietnamese content → **localStorage progress
  (`nextpro-red-team-storage`) and all URLs stay valid**
- Slug **values** kept identical to today → zero URL churn; ownership is now in the
  schema, not enforced by /learn

## 3 · Implementation phases

### Phase 1 — Types
- Rename `RedTeamScenario` → `RedTeamCollection`; add `iconName`, `color?`,
  `relatedTrackSlug?`; doc comment: relation to /learn is optional.
- Update barrel `index.ts` exports.

### Phase 2 — Data migration (mechanical, 20 files)
Per file in `data/json/*.json` (10):
```diff
- "trackSlug": "react-foundations-zero-to-one",
+ "slug": "react-foundations-zero-to-one",
+ "iconName": "GraduationCap",
+ "color": "emerald",
+ "relatedTrackSlug": "react-foundations-zero-to-one",
```
(`iconName`/color values lifted from current `TOPIC_ICON` map.)

Per file in `data/missions/*.json` (10):
```diff
- "trackSlug": "..."
+ "collectionSlug": "..."
```

### Phase 3 — Loaders
`data/json-loader.ts`:
- `RED_TEAM_SCENARIOS` → `RED_TEAM_COLLECTIONS`
- `getRedTeamScenarioByTrackSlug()` → `getCollectionBySlug(slug)`
- `getVectorsByLessonId(lessonId)` — drop the trackSlug param, scan all collections
  (safe: currently unused)
- NEW `getCollectionByTrackSlug(trackSlug)` — reverse lookup via
  `relatedTrackSlug` for the /learn banner (returns `undefined` when absent)

`data/mission-loader.ts`:
- `MissionFile.trackSlug` → `collectionSlug`
- `getMissionsByTrackSlug()` → `getMissionsByCollectionSlug()`;
  `getMissionBySlug(collectionSlug, missionSlug)`; `TOTAL_MISSIONS` unchanged

### Phase 4 — Routes (URLs unchanged)
- Rename dynamic segments `[trackSlug]` → `[collectionSlug]` (both levels) and
  update `params` usage + `generateStaticParams`.
- `/rt/[collectionSlug]/page.tsx`: remove `MOCK_LEARNING_TRACKS` import (kills C2);
  render "Học lý thuyết tại /learn" link only when `relatedTrackSlug` is set.
- `/rt/[collectionSlug]/[missionSlug]/page.tsx`: rename-only updates.

### Phase 5 — Components & /learn side
- `red-team-sidebar.tsx`: delete `TOPIC_ICON` map (kills C4); use
  `collection.iconName`; rename locals.
- `ui-demo-stage.tsx`: registry keys keep same string values (C5 neutralized —
  keyed by RT-owned slug, works even with no /learn).
- `red-team-console.tsx`, `mission-tabs-view.tsx`: prop/type renames only.
- `src/app/learn/[trackSlug]/page.tsx`: banner uses
  `getCollectionByTrackSlug(track.slug)`; hidden when no related collection
  (kills C3).

### Phase 6 — Verification
1. `pnpm typecheck` — zero errors after rename wave.
2. `pnpm lint` + `pnpm format:check`.
3. `pnpm build` — static generation exercises every collection/mission param pair.
4. Manual click-through:
   - `/rt` home counts (10 kịch bản · N chiến dịch · vectors)
   - one collection page per difficulty + mobile drawer sidebar
   - one mission page incl. next-mission link
   - `/learn/<track>` ↔ `/rt/<slug>` cross-links both directions
   - launch attack + patch a vector → reload → progress persists (ids unchanged)

## 4 · Explicit non-goals
No new topics/vectors/missions, no content edits, no URL or store-key changes,
no Zod validation layer (candidate follow-up), no DB/API work.

---

# Academy Expansion (round hiện tại)

User yêu cầu nâng cấp tiếp: RT phải là **học viện thực chiến độc lập**, không lấy
content/lab từ React learning. Đã chốt với user: roadmap theo domain tấn công +
tái sử dụng vector/mission cũ + cắt hết /learn.

## Kiến trúc mới
- **Roadmap 6 phase** (`data/roadmap.ts`): P01 Tư duy & Trinh sát · P02 Injection &
  XSS · P03 Danh tính & Phiên · P04 Race·Logic·State · P05 Hạ tầng & Chuỗi cung ứng
  · P06 Capstone phòng thủ.
- **9 collection** (`data/collections/<slug>.json`, mỗi file gộp metadata + học liệu
  + vectors + missions): frontend-recon, script-injection-range, identity-session-heist,
  async-race-exploits, ui-state-corruption, form-input-abuse, cache-poisoning,
  resource-supply-drain, blue-team-capstone.
- **30 vector + 30 mission cũ** tái phân bổ nguyên văn (id giữ nguyên → progress
  localStorage còn hiệu lực); bổ sung 6 vector + 6 mission mới (sourcemap leak,
  chunk enumeration, DOM XSS, prototype pollution, clickjacking, supply-chain hijack).
- **Học liệu** `StudyDossier` cho từng collection, render trong console section
  "Học liệu · Lý thuyết nền".
- **Firing range** `components/ranges/*` thay toàn bộ lab React cũ — đăng ký trong
  `UI_DEMO_REGISTRY` theo slug RT.
- **Không còn tham chiếu /learn** nào từ feature RT (đã xóa relatedTrackSlug,
  cross-link hai chiều, getVectorsByLessonId).

## Trạng thái thực thi
- [x] Types v3 (RtPhaseId, RtRoadmapPhase, StudyDossier, RedTeamCollectionFile)
- [x] Migration script → 9 collection files (30/30 vectors & missions)
- [x] Loaders gộp (collection-loader.ts), xóa json-loader/mission-loader
- [x] Sidebar nhóm theo phase; trang chủ /rt render lộ trình
- [x] Console thêm section Học liệu (dossier panel)
- [x] Cắt cross-link /learn cả hai chiều; xóa data mirror + lab React cũ
- [x] Lab mẫu `ranges/bundle-recon-lab.tsx` (frontend-recon)
- [ ] Integrate drafts: 6 vector/mission mới (subagent)
- [ ] Integrate 9 dossier (subagent)
- [ ] 8 firing range còn lại (3 subagent) + đăng ký registry
- [ ] Verification cuối: typecheck/lint/build + JSON audit

## 5 · Risk & rollback
Single-commit mechanical rename; risk concentrated in the two dynamic-segment
folder renames (typecheck + build catch breakage). Rollback = revert commit.
