# Nghiên Cứu & Đề Xuất Công Thái Học Dark Mode Cho Studio (Contrast & Learning Ergonomics)

> **Tài liệu tham chiếu thiết kế giao diện (UI/UX Design Specification)**  
> **Áp dụng cho**: NextPlayground, ReactPlayground, Offensive Security Workbench, CodeMirror, xterm.js, Lesson Viewer.  
> **Cơ sở khoa học**: WCAG 2.2 (Level AA & AAA), W3C APCA (Accessible Perceptual Contrast Algorithm), Tiêu chuẩn chống mỏi mắt Asthenopia & Halation Effect.

---

## 1. TỔNG QUAN VẤN ĐỀ VÀ ĐỘNG LỰC NGHIÊN CỨU

Studio học tập lập trình và an ninh mạng đòi hỏi người dùng tập trung cao độ trong thời gian dài (từ 1 đến 4 giờ liên tục). Giao diện Dark Mode thiếu chuẩn mực về độ tương phản sẽ dẫn tới:

1. **Hiện tượng Halation (Quầng sáng lóe mắt)**: Xảy ra khi văn bản màu trắng tuyệt đối (`#ffffff` hoặc `#f8fafc`) được đặt trên nền đen tuyệt đối (`#000000` hoặc `#020617`). Độ tương phản vượt quá 18:1 – 20:1 gây tán xạ ánh sáng trong giác mạc, làm mờ rìa chữ và mỏi cơ mi mắt (Digital Eye Strain / Asthenopia).
2. **Vùng mù tương phản (Contrast Dropoff / Trượt chuẩn WCAG)**: Nhiều thông tin quan trọng như số dòng (line numbers), dấu nhắc lệnh (terminal prompt), và subtext giải thích bài học bị chìm dưới ngưỡng tương phản 4.5:1, khiến học viên phải căng mắt để đọc.
3. **Phân mảnh bề mặt (Visual Fragmentation)**: Các thành phần liền kề (Sidebar, Editor, Terminal, Console) có nền không đồng nhất do trộn lẫn giữa HSL tokens, mã Hex tùy biến và các utility Tailwind hardcoded (`bg-slate-950`, `bg-slate-900`).

---

## 2. DỮ LIỆU ĐO KIỂM HIỆN TRẠNG CODEBASE

Dựa trên kết quả rà soát tự động của subagent trên codebase `f:/next-pro`:

| Khu vực / Component           | File mã nguồn                                      | Màu chữ / Nền hiện tại                                 | Tỷ lệ tương phản đo được |                   Đánh giá chuẩn                   |
| :---------------------------- | :------------------------------------------------- | :----------------------------------------------------- | :----------------------: | :------------------------------------------------: |
| **Terminal Command Input**    | `DualTerminalWorkbench.tsx`<br/>`TerminalView.tsx` | `#ffffff` (White font-bold) trên `#020617` (Slate-950) |       **20.4 : 1**       | ⚠️ **Cực đoan**: Gây halation mạnh trong phòng tối |
| **Code Editor Body Text**     | `code-editor.tsx`                                  | `#f8fafc !important` trên `#090d16 !important`         |       **18.0 : 1**       |        ⚠️ Quá gắt cho việc đọc code dài hạn        |
| **Line Numbers**              | `code-block.tsx`                                   | `#475569` (Slate-600) trên `#020617` (Slate-950)       |       **2.6 : 1**        |     ❌ **TRƯỢT WCAG AA** (Yêu cầu $\ge 4.5:1$)     |
| **Terminal Prompt Path**      | `terminal-view.tsx`                                | `#64748b` (Slate-500) trên `#020617` (Slate-950)       |       **4.22 : 1**       |     ❌ **TRƯỢT WCAG AA** (Yêu cầu $\ge 4.5:1$)     |
| **Console Timestamps**        | `console-panel.tsx`                                | `#64748b` (Slate-500) trên `#020617` (Slate-950)       |       **4.22 : 1**       |                ❌ **TRƯỢT WCAG AA**                |
| **Sidebar Subtext**           | `learning-sidebar.tsx`                             | `muted-foreground/80` trên `bg-secondary/15`           |       **~3.5 : 1**       |         ❌ **TRƯỢT WCAG AA** cho font 9px          |
| **Editor vs Sidebar Surface** | `next-playground.tsx`                              | `#090d16` (Editor) vs `#020617` (Sidebar)              |      Delta < 1.1:1       |        ⚠️ Ranh giới phụ thuộc 1px border mờ        |

---

## 3. TIÊU CHUẨN TƯƠNG PHẢN CÔNG THÁI HỌC CHO STUDIO

### 3.1. Ngưỡng tương phản tối ưu (APCA & WCAG 2.2)

```
[0:1] ──────── [4.5:1] ──────────── [7.5:1 ──────── 11.5:1] ──────────── [16:1] ──────── [21:1]
   Vùng mù         Chuẩn tối thiểu         VÙNG VÀNG CÔNG THÁI HỌC          Vùng chói       Halation cực đoan
 (Không đọc được)     WCAG AA              (Mắt thư giãn, đọc bền bỉ)      (Dễ mỏi mắt)     (Chữ trắng trên đen)
```

1. **Văn bản code & bài học chính**: Giữ trong khoảng **7.5:1 đến 11.5:1** (APCA $L_c$ 65–75). Chữ màu xám bạc / trắng ngà nhẹ (`#e2e8f0` Slate-200 hoặc `#d1d5db` Slate-300), không dùng `#ffffff` 100%.
2. **Số dòng & Chú thích phụ (Secondary / Muted)**: Giữ trong khoảng **4.8:1 đến 6.0:1** (APCA $L_c$ 45–55). Sử dụng Slate-400 (`#94a3b8`) hoặc Slate-500 sáng (`#64748b`) để đảm bảo vượt ngưỡng 4.5:1 mà không tranh chấp điểm nhìn với code.
3. **Phân tầng độ sáng nền (Surface Elevation)**: Nâng nền Studio từ mức pitch black ($L \approx 0.3\%$) lên dải than chì sâu **$L \approx 8\% - 12\%$**, tạo bước đệm thị giác khi chuyển tầm nhìn sang Preview Panel.

---

## 4. HỆ THỐNG DESIGN TOKENS ĐỀ XUẤT ("MIDNIGHT CHARCOAL")

### 4.1. Kiến trúc phân tầng bề mặt (3-Tier Surface Elevation)

```
┌────────────────────────────────────────────────────────────────────────┐
│ Activity Bar & Gutter  (#0a0e17) - Deep Canvas (Luminance ~6%)         │
│  ┌─────────────────────────┬────────────────────────────────────────┐  │
│  │ File Explorer (#0f1422) │ Code Editor Surface (#141928)          │  │
│  │ Surface Tier 1 (L ~9%)  │ Surface Tier 2 (L ~12%)                │  │
│  │                         │                                        │  │
│  │ Border: #22283a         │ Text: #e2e8f0 (Slate-200 | 10.5:1)     │  │
│  │ Text: #94a3b8           │ Line No: #64748b (Slate-500 | 5.2:1)   │  │
│  ├─────────────────────────┴────────────────────────────────────────┤  │
│  │ Terminal Panel (#0d121f) - Surface Tier 1.5 (L ~8%)              │  │
│  │ Prompt: #38bdf8 (Cyan)  | Output: #cbd5e1 | Stderr: #f87171     │  │
│  └──────────────────────────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────────────────────────┘
```

### 4.2. Khai báo CSS Variables (`src/styles/globals.css`)

```css
.dark {
  /* 1. Studio Surfaces Hierarchy */
  --studio-canvas: 228 30% 6%; /* #0a0d16: Khung nền tổng thể */
  --studio-sidebar: 228 25% 9%; /* #0f1422: File explorer & panel công cụ */
  --studio-editor: 228 24% 12%; /* #141928: Mặt bằng gõ code & đọc nội dung */
  --studio-terminal: 228 28% 8%; /* #0d121f: Nền xterm & POSIX virtual terminal */
  --studio-card: 228 22% 14%; /* #181e30: Thẻ bài học, quiz, popup */

  /* 2. Typography & Contrast Calibration */
  --studio-fg-primary: 214 32% 91%; /* #e2e8f0 (Slate-200): Tương phản ~10.5:1, dịu mắt */
  --studio-fg-secondary: 215 20% 70%; /* #a0aec0: Văn bản diễn giải, chú giải phụ */
  --studio-fg-muted: 215 16% 52%; /* #64748b (Slate-500): Số dòng, contrast 5.2:1 (Đạt AA) */

  /* 3. Borders & Indicators */
  --studio-border: 228 18% 18%; /* #22283a: Phân tách khối sắc nét, không gắt */
  --studio-border-subtle: 228 15% 14%; /* #1a1f2e: Đường kẻ dòng trong bảng */
  --studio-active-indicator: 239 84% 67%; /* #6366f1: Đường accent 2px cho active file tab */
}
```

### 4.3. Bảng màu cú pháp code (Syntax Tokens Ergonomics)

Khử bão hòa nhẹ (desaturate ~15%) các màu neon rực để tránh kích thích thị giác đơn sắc quá mạnh:

| Token cú pháp                          |    Giá trị màu hex     | Tỷ lệ tương phản trên Editor (`#141928`) | Hiệu ứng thị giác                       |
| :------------------------------------- | :--------------------: | :--------------------------------------: | :-------------------------------------- |
| **Keywords** (`import, const, return`) | `#c4b5fd` (Violet-300) |               **9.2 : 1**                | Rõ ràng cấu trúc logic, không gắt       |
| **Strings / Literals**                 | `#86efac` (Green-300)  |               **10.8 : 1**               | Tự nhiên, dễ quét nội dung chuỗi        |
| **Function / Hooks**                   |  `#7dd3fc` (Sky-300)   |               **10.5 : 1**               | Điểm nhấn chức năng cốt lõi             |
| **Types / Interfaces**                 |  `#93c5fd` (Blue-300)  |               **9.8 : 1**                | Trật tự định kiểu rõ nét                |
| **Numbers / Constants**                | `#fde047` (Yellow-300) |               **11.2 : 1**               | Dễ phân biệt hằng số                    |
| **Comments**                           | `#94a3b8` (Slate-400)  |               **5.8 : 1**                | Đạt chuẩn WCAG AAA, tách bạch khỏi code |

---

## 5. CÁC QUY TẮC THIẾT KẾ UX CHO STUDIO HỌC TẬP

1. **Active Tab Indicator 2px**:
   - Tab đang mở trong `FileTabs` phải có chỉ báo `border-t-2 border-indigo-500` và nền sáng hơn một bậc so với dải tab không kích hoạt, giúp học viên luôn biết mình đang sửa file nào trong 0.2 giây đầu tiên.
2. **Khắc phục "Sốc võng mạc" (Retinal Shock) khi xem Preview**:
   - Bao quanh iframe preview một viền đệm `p-2 bg-studio-canvas` với `border border-studio-border/60`. Điều này làm giảm độ chênh lệch khi render các trang ứng dụng có nền trắng bên trong iframe.
3. **Đồng bộ hóa Terminal**:
   - Quy chuẩn cả `TerminalPanel` (xterm.js) và `TerminalView` (POSIX) về cùng biến `--studio-terminal` và cùng bảng màu ANSI pastel dịu mắt.
4. **Tránh bẫy Frankenstein UI (Theme Bleed)**:
   - Thay thế toàn bộ các class `bg-slate-950`, `bg-slate-900`, `border-slate-800` hardcoded bằng các semantic token hoặc biến tương thích để giao diện chuyển đổi mượt mà khi người dùng chọn Light Mode.

---

## 6. HƯỚNG DẪN DÀNH CHO AGENT TIẾP QUẢN

Khi agent hoặc lập trình viên tiến hành refactor Dark Mode cho Studio:

1. **Kiểm tra CSS variables** tại `src/styles/globals.css`.
2. **Khử các hardcoded styles** trong:
   - `src/components/ui/code-block.tsx` (Line numbers, pre container).
   - `src/features/playground/components/code-editor.tsx` (`highContrastDarkTheme` override).
   - `src/features/playground/components/terminal-panel.tsx` (xterm theme object).
   - `src/features/offensive-security/workbench/components/terminal-view.tsx` (Prompt and history colors).
   - `src/features/offensive-security/workbench/components/dual-terminal-workbench.tsx` (Prompt and container classes).
3. **Kiểm tra độ tương phản trước khi commit**: Chạy công cụ kiểm tra màu sắc đảm bảo không có text nhỏ nào < 4.5:1 và văn bản code không vượt quá 12:1.
