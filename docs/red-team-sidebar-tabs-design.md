# Red Team Ops — Left Sidebar + Topic → Lessons → Tabs

> Design proposal (wireframe stage — no code yet).
> Mục tiêu: biến `/rt` thành một "console" có **menu trái theo Topic**, click topic thì
> xổ ra **danh sách lesson của topic đó**, click lesson thì mở trang **có Tabs**:
> Theory (lý thuyết) và Practice (thực chiến Red Team).

---

## 1. Information Architecture (routes)

| Route | Nội dung | Trạng thái |
|---|---|---|
| `/rt` | Sidebar trái (10 topics) + khung phải: trang chào/targets overview | ✅ mới |
| `/rt/[trackSlug]` | Topic đang chọn: sidebar tự expand lesson của topic + khung phải: tổng quan topic (stats, link nhanh tới từng lesson) | ♻️ nâng cấp từ trang hiện tại |
| `/rt/[trackSlug]/[lessonSlug]` | Lesson đang chọn: khung phải chuyển thành **Tabs** | ✅ mới |
| `/learn/*`, `/interview` | Không đổi — chỉ thêm link chéo tới `/rt` | giữ nguyên |

Dữ liệu tái sử dụng 100%:

```txt
Learning tracks  → src/features/learning/data/json/*.json   (lessons: id/slug/title/summary…)
Red team vectors → src/features/red-team/data/json/*.json    (3 vectors/track, đã có)
```

---

## 2. Wireframe 1 — `/rt` (mới vào, chưa chọn gì)

```txt
┌──────────────────────────────┬──────────────────────────────────────────────────┐
│  🔴 RED TEAM OPS             │                                                  │
│  (menu trái, scroll được)    │        Chọn một mục tiêu bên trái 👈             │
│                              │                                                  │
│  TOPICS (10)                 │   ┌──────────────────────────────────────────┐   │
│                              │   │  🎯 10 targets · 30 attack vectors       │   │
│  ▸ 🛡 Web Security & Auth     │   │     · 12 critical · 11 high · 7 medium   │   │
│  ▸ ⚛ React Foundations       │   │                                          │   │
│  ▸ ⚡ React Hooks            │   │  Topic nào cũng có:                      │   │
│  ▸ 📝 React Forms           │   │   💉 Attack Simulation                   │   │
│  ▸ 🧱 Form Engineering      │   │   🧪 Interactive UI Demo                 │   │
│  ▸ 🔥 React Performance      │   │                                          │   │
│  ▸ 🗃 TanStack Query         │   │  Chọn 1 topic để xem danh sách bài học   │   │
│  ▸ ☢️ React 19 & Compiler    │   │  và bung tab Theory / Practice.          │   │
│  ▸ 🏗 Next.js Architecture   │   └──────────────────────────────────────────┘   │
│  ▸ 🧪 React Testing          │                                                  │
│                              │                                                  │
│  ───────────────────────     │                                                  │
│  ⟲ Reset toàn bộ tiến độ     │                                                  │
└──────────────────────────────┴──────────────────────────────────────────────────┘
   ~280px, sticky                nội dung cuộn độc lập
```

- `▸` = topic đang đóng. Click → navigate `/rt/[trackSlug]` **và** expand luôn trong sidebar.
- Icon + màu gradient lấy từ `track.color` / `track.iconName` hiện có → đồng bộ với `/learn`.

---

## 3. Wireframe 2 — click 1 topic (ví dụ *Web Security & Auth*)

```txt
┌──────────────────────────────┬──────────────────────────────────────────────────┐
│  🔴 RED TEAM OPS             │  🛡 Web Security & Enterprise Auth Architecture   │
│                              │  [advanced] · 2 bài · 3 attack vectors            │
│  ▸ ⚛ React Foundations       │                                                   │
│  ▾ 🛡 Web Security & Auth ◄──┼─── sidebar tự expand khi topic active ───────────┐│
│  │   ┌────────────────────┐  │   ┌─────────────────────────────────────────────┐│
│  │   │ LESSONS (2)        │  │   │ MISSION BRIEFING                            ││
│  │   │ ● ws-01 Auth JWT   │  │   │ Đội đỏ đã vào vị trí...                     ││
│  │   │   Refresh Token    │  │   └─────────────────────────────────────────────┘│
│  │   │ ● ws-02 XSS·CSRF·  │  │                                                  │
│  │   │   CORS·CSP         │  │   PROGRESS:  ████░░░░ 1/2 breached · 0 patched   │
│  │   └────────────────────┘  │                                                  │
│  ▸ ⚡ React Hooks            │   ┌────────────────────┐ ┌────────────────────┐  │
│  ▸ …                         │   │ ➜ Mở Practice tab  │ │ 🧪 Xem UI Demo     │  │
│                              │   └────────────────────┘ └────────────────────┘  │
│                              │                                                  │
│                              │   VECTORS CỦA TOPIC (preview thu gọn)            │
│                              │   ┌ 💉 XSS Injection Strike  [CRITICAL] ─┐       │
│                              │   ┌ 💉 CSRF Transfer Fraud   [HIGH] ─────┐       │
│                              │   ┌ 💉 JWT Heist             [CRITICAL] ─┐       │
└──────────────────────────────┴──────────────────────────────────────────────────┘
```

- Lesson item hiện dạng `●` (chưa phá) / `🔴` (đã breach) / `🛡` (đã patch) — đọc từ
  `use-red-team-store` (persisted), giống hệt badge trên console.
- Click lesson → `/rt/[trackSlug]/[lessonSlug]`.

---

## 4. Wireframe 3 — click 1 lesson: trang Tabs ⭐ (trọng tâm ý tưởng)

```txt
┌──────────────────────────────┬──────────────────────────────────────────────────┐
│  🔴 RED TEAM OPS             │  ← Quay lại topic   🛡 Web Security › ws-02       │
│                              │ ┌──────────────────────────────────────────────┐ │
│  ▾ 🛡 Web Security & Auth    │ │ ╔══════════════╦═══════════════╗             │ │
│  │   ● ws-01 Auth JWT        │ │ ║ 📖 THEORY    ║ 🔴 PRACTICE   ║  (tab bars) │ │
│  │   ● ws-02 XSS·CSRF ◄──────┼─║ (active)     ║               ║             │ │
│  │   └ ws-03…                │ │ ╚══════════════╩═══════════════╝             │ │
│  ▸ …                         │ │ ┌──────────────────────────────────────────┐ │ │
│                              │ │ │ 🧠 CORE MENTAL MODEL                     │ │ │
│                              │ │ │ Defense in Depth: escaping + HttpOnly    │ │ │
│                              │ │ │ cookie + CSP + CORS rules…               │ │ │
│                              │ │ └──────────────────────────────────────────┘ │ │
│                              │ │ ✔ KEY TAKEAWAYS (grid 2 cột)                 │ │
│                              │ │ ┌─────────────┐ ┌─────────────┐              │ │
│                              │ │ │ XSS: …      │ │ CSRF: …     │              │ │
│                              │ │ └─────────────┘ └─────────────┘              │ │
│                              │ │ 💊 CODE RECIPES (CodeBlock + copy button)    │ │
│                              │ └──────────────────────────────────────────────┘ │
└──────────────────────────────┴──────────────────────────────────────────────────┘
```

Chuyển sang tab **PRACTICE**:

```txt
│                              │ ┌──────────────────────────────────────────────┐ │
│                              │ │ ╔══════════╗╔══════════════╗╔═════════════╗  │ │
│                              │ │ ║ 📖THEORY ║║ 🔴 PRACTICE ◄║║ 🧪 UI DEMO  ║  │ │
│                              │ │ ╚══════════╝╚══════════════╝╚═════════════╝  │ │
│                              │ │ ┌──────────────────────────────────────────┐ │ │
│                              │ │ │ ATTACK VECTOR (liên quan lesson này)     │ │ │
│                              │ │ │ 💉 XSS Injection Strike    [CRITICAL]    │ │ │
│                              │ │ │ target: Comment rendering pipeline       │ │ │
│                              │ │ │ [▶ LAUNCH ATTACK]  → terminal log chạy   │ │ │
│                              │ │ │ $ <img onerror> FIRED in victim browser  │ │ │
│                              │ │ │ 💥 Blast Radius · 🛡 Defense Patch tab    │ │ │
│                              │ │ └──────────────────────────────────────────┘ │ │
│                              │ │  (nếu vector chưa gán cho lesson nào →       │ │
│                              │ │   fallback: cả 3 vector của topic)           │ │
│                              │ └──────────────────────────────────────────────┘ │
```

Tab thứ ba **UI DEMO** nhúng demo tương tác của topic (`ui-demo-stage`) — vì nhiều demo
(ví dụ XSS Range) chính là "practice" sống động của lesson.

---

## 5. Gán vector ↔ lesson (để tab Practice đúng bài)

| Phương án | Cách làm | Ưu/nhược |
|---|---|---|
| **A. Explicit map (khuyến nghị)** | Thêm field tùy chọn vào JSON vector: `"relatedLessons": ["ws-02"]`. Loader group sẵn: `getVectorsByLesson(trackSlug, lessonSlug)` | Chính xác, tác giả kiểm soát; cần sửa 10 JSON (nhẹ — chỉ thêm 1 dòng/vector) |
| B. Auto-match theo tags | So tags lesson ↔ category/target của vector | Không cần sửa JSON nhưng hay lệ/nhảy |
| C. Fallback nguyên topic | Lesson nào không có vector riêng → hiện cả bộ 3 của track | Luôn có nội dung; dùng làm fallback chung cho A |

Kế hoạch: **A + C**. Vector không map → rơi về topic console như cũ.

---

## 6. Component plan (đúng pattern hiện có của repo)

```txt
src/features/red-team/
├─ components/
│  ├─ red-team-shell.tsx        (MỚI) layout 2 cột: sidebar + children; client
│  ├─ red-team-sidebar.tsx      (MỚI) accordion topics + lesson list + trạng thái store
│  ├─ lesson-tabs-view.tsx      (MỚI) Tabs: Theory | Practice | UI Demo
│  ├─ red-team-console.tsx      (giữ) dùng lại trong topic page + nhúng trong Practice tab
│  └─ ui-demo-stage.tsx         (giữ)
├─ data/json-loader.ts          (+ getVectorsByLesson() theo phương án A+C)
└─ stores/use-red-team-store.ts (giữ — thêm nothing; sidebar chỉ đọc)

src/app/rt/
├─ layout.tsx                   (MỚI) bọc <RedTeamShell>
├─ page.tsx                     (sửa: bỏ grid card cũ → overview trong shell)
├─ [trackSlug]/page.tsx         (sửa: topic hub trong shell)
└─ [trackSlug]/[lessonSlug]/page.tsx  (MỚI: generateStaticParams từ track lessons)
```

- Mobile: sidebar thành drawer trượt (nút 🔴 menu nổi), content full-width.
- Static export vẫn OK: thêm `generateStaticParams` cho lesson route (10 tracks × lessons ≈ 33 trang mới).

---

## 7. Trạng thái & micro-interaction

- Sidebar ghi nhớ topic đang mở (theo URL, không cần store riêng).
- Lesson status dot: `● idle → 🔴 breached → 🛡 patched` (sync với console cùng trang qua zustand).
- Tab mặc định khi vào lesson: **Theory**; sau khi Launch Attack ≥ 1 lần → auto-gợi ý nhảy tab Practice (toast nhẹ, không force).
- Progress bar đầu topic page tính từ store: breached/patched của các vector thuộc topic.

---

## 8. Open questions cho bạn ✋

1. Tabs: giữ đúng 2 tab **Theory | Practice**, hay lấy 3 tab như wireframe (**Theory | Practice | UI Demo**)?
2. Khi click topic ở sidebar: muốn **expand ngay tại chỗ** (content vẫn là overview) hay **navigate luôn** sang topic hub?
3. Mobile: chấp nhận drawer, hay ưu tiên kiểu accordion xếp dọc (sidebar biến thành khối trên đầu trang)?
4. Có cần nút "Reset Ops" nằm ở đáy sidebar (global) như wireframe 1, không?

Trả lời xong mình triển khai code theo đúng spec này.
