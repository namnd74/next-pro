import fs from 'node:fs';
import path from 'node:path';

const filePath = path.resolve('src/features/interview/data/json/css-bank.json');
const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));

const batch3Updates = {
  'css-069': {
    summary: 'Nguyên nhân: Mặc định theo đặc tả CSS Flexbox, mọi flex item đều có **`min-width: auto`** (thay vì `min-width: 0`), khiến item không bao giờ chịu co lại nhỏ hơn kích thước nội dung tối thiểu của con bên trong. Cách sửa: Đặt **`min-width: 0`** trên flex item đó.',
    deepDive: 'Đây là lỗi kinh điển nhất của Frontend khi làm việc với text truncate hoặc ảnh dài trong Flexbox. Khi có thẻ con chứa một đoạn URL dài hoặc dùng `text-overflow: ellipsis`, flex item cha từ chối co lại vì `min-width: auto` ưu tiên giữ trọn vẹn content. Đặt `min-width: 0` sẽ ghi đè hành vi này, cho phép item co lại tự do theo container.',
    codeExample: `.flex-container {
  display: flex;
}

.flex-item {
  flex: 1;
  min-width: 0; /* BẮT BUỘC: Cho phép flex item co nhỏ hơn content để cắt chữ */
}

.text-truncated {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}`
  },

  'css-070': {
    summary: 'Khi dùng `repeat(auto-fit, minmax(240px, 1fr))` mà chỉ có 1 card: **`auto-fit`** tự động thu sập (collapse) tất cả các cột trống về 0px và kéo giãn cột duy nhất đó chiếm trọn 100% chiều rộng hàng. Đổi sang **`auto-fill`** sẽ giữ nguyên các cột trống vô hình, giúp card giữ nguyên kích thước ~240px tự nhiên.',
    deepDive: 'Cách xử lý: (1) Đổi sang `auto-fill` nếu muốn card không bị kéo giãn; (2) Hoặc nếu vẫn muốn dùng `auto-fit` khi có nhiều card, hãy đặt `max-width: 360px` trên chính component card để chặn trần độ rộng tối đa khi chỉ có 1 phần tử.',
    codeExample: `/* ✅ GIẢI PHÁP 1: Dùng auto-fill để giữ các cột trống vô hình */
.card-grid-fill {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 20px;
}

/* ✅ GIẢI PHÁP 2: Dùng auto-fit kết hợp max-width trên Card */
.card-grid-fit {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 20px;
}
.card-grid-fit .card {
  max-width: 400px; /* Không bao giờ bị kéo giãn hết cả màn hình */
}`
  },

  'css-071': {
    summary: 'Grid cột `1fr` bị tràn ngang khi chứa nội dung dài: Tương tự Flexbox, theo đặc tả CSS Grid, các cột có kích thước tối thiểu mặc định là **`min-width: auto`**. Khi có bảng dài hoặc URL không ngắt dòng, cột sẽ phình to ra theo content. Cách sửa: Định nghĩa cột bằng **`minmax(0, 1fr)`** thay vì chỉ viết `1fr`.',
    deepDive: 'Ký hiệu `1fr` thực chất là viết tắt của `minmax(auto, 1fr)`. Do `auto` tôn trọng kích thước nội dung tối thiểu của phần tử con, Grid container sẽ bị vỡ chiều ngang và sinh thanh cuộn ngang ngoài ý muốn. Đặt rõ ràng `minmax(0, 1fr)` ép mức sàn về 0px, khôi phục lại khả năng co giãn chuẩn xác.',
    codeExample: `.two-column-layout {
  display: grid;
  /* ❌ Sai: grid-template-columns: 280px 1fr; -> Bị tràn khi table dài */
  /* ✅ Đúng: minmax(0, 1fr) ép cột nội dung không bao giờ phình to quá container */
  grid-template-columns: 280px minmax(0, 1fr);
  gap: 24px;
}`
  },

  'css-072': {
    summary: 'Dựng Dashboard responsive và đổi thứ tự hiển thị bằng `grid-template-areas`: Định nghĩa bố cục đa cột trên Desktop; sau đó trong Media Query Mobile (`max-width: 768px`), viết lại `grid-template-areas` thành 1 cột duy nhất theo đúng trật tự mong muốn (ví dụ: Header -> Main -> Activity -> Sidebar -> Footer).',
    deepDive: 'Ưu thế kỹ thuật: Không cần can thiệp JavaScript, không cần nhân bản DOM (duplicate components), giữ cây HTML ngữ nghĩa chuẩn SEO và hỗ trợ trợ năng Accessibility tuyệt đối.',
    codeExample: `.dashboard {
  display: grid;
  gap: 16px;
  grid-template-areas:
    "header  header"
    "sidebar main"
    "footer  footer";
  grid-template-columns: 240px 1fr;
}

@media (max-width: 768px) {
  .dashboard {
    grid-template-columns: 1fr;
    /* Đổi trật tự hoàn toàn trên Mobile: Main lên trước Sidebar */
    grid-template-areas:
      "header"
      "main"
      "sidebar"
      "footer";
  }
}`
  },

  'css-073': {
    summary: 'Checklist 4 nguyên nhân khiến `position: sticky; top: 0` không dính: (1) **Thiếu ngưỡng tọa độ** (chưa đặt `top`, `bottom`, `left` hoặc `right`); (2) **Thẻ cha bất kỳ có `overflow`** mang giá trị `hidden`, `auto`, hoặc `scroll`; (3) **Chiều cao thẻ cha không đủ** (chiều cao cha bằng đúng chiều cao sticky element); (4) **Thẻ cha là Flex container** mà item đang bị `align-self: stretch`.',
    deepDive: 'Cách debug nhanh trên DevTools: Inspect phần tử -> vào tab Computed -> gõ tìm `overflow`. Dò ngược lên các thẻ cha trong cây DOM: Nếu bất kỳ thẻ cha nào có `overflow` khác `visible`, tính năng sticky sẽ bị vô hiệu hóa vì context cuộn bị giam trong thẻ cha đó thay vì viewport toàn trang.',
    codeExample: `/* ✅ Cấu hình Position Sticky chuẩn mực */
.sidebar-sticky {
  position: sticky;
  top: 24px;              /* 1. BẮT BUỘC: Ngưỡng cách mép trên */
  align-self: flex-start; /* 2. BẮT BUỘC nếu cha là Flexbox (chống stretch cao bằng cha) */
  max-height: calc(100vh - 48px);
  overflow-y: auto;
}`
  },

  'css-074': {
    summary: 'Hiện tượng con đặt `margin-top: 40px` làm cả khối cha bị đẩy xuống là do **Margin Collapsing giữa Thẻ Cha và Thẻ Con đầu tiên (Parent-First Child Margin Collapse)** khi giữa chúng không có padding, border hoặc nội dung ngăn cách. Cách chặn: Đặt **`display: flow-root`** trên thẻ cha (hoặc thêm 1px padding/border).',
    deepDive: 'Theo đặc tả W3C, nếu không có border-top, padding-top hoặc inline content nằm giữa lề trên của cha và con, hai margin trên sẽ bị gộp lại và trượt ra ngoài thẻ cha. Giải pháp hiện đại và sạch sẽ nhất là áp dụng `display: flow-root` lên thẻ cha để tạo Block Formatting Context (BFC) độc lập, cô lập margin bên trong.',
    codeExample: `/* ❌ Bị lỗi: Margin của con đẩy sụp cả cha */
.parent { background: #e2e8f0; }
.parent .child { margin-top: 40px; }

/* ✅ SỬA: Dùng display: flow-root để chặn đứng Margin Collapsing */
.parent-fixed {
  display: flow-root; /* Tạo BFC cô lập margin con bên trong */
  background: #e2e8f0;
}`
  },

  'css-075': {
    summary: 'Thuộc tính `aspect-ratio` (ví dụ: `aspect-ratio: 16 / 9`) định nghĩa tỷ lệ khung hình trực tiếp cho phần tử, thay thế hoàn toàn kỹ thuật hack cũ **"Padding-Top Hack"** (`padding-top: 56.25%`). Ưu điểm: Không cần thêm thẻ bọc `div` phụ, không cần `position: absolute` trên phần tử con, code trực quan và chống nhảy layout (CLS).',
    deepDive: 'Trước khi có `aspect-ratio`, để video hoặc ảnh responsive giữ tỷ lệ 16:9, lập trình viên phải tạo một wrapper có `position: relative; padding-top: 56.25%` (vì % của padding tính theo chiều rộng của cha), rồi đặt video `position: absolute; inset: 0`. Với `aspect-ratio: 16 / 9`, thuộc tính được áp dụng thẳng lên thẻ `<img>`, `<video>` hoặc `<iframe>`.',
    codeExample: `/* ✅ CHUẨN HIỆN ĐẠI: Không cần wrapper, không cần position absolute */
.responsive-video {
  width: 100%;
  aspect-ratio: 16 / 9;
  object-fit: cover;
  border-radius: 12px;
}`
  },

  'css-076': {
    summary: 'Thiết kế Dark Mode chuẩn Zero-FOUC (Không chớp trắng khi tải trang): (1) Định nghĩa toàn bộ màu sắc bằng **CSS Custom Properties** gắn theo class `.dark`; (2) Đặt một đoạn **Script đồng bộ cực ngắn trong `<head>`** để đọc `localStorage` và `matchMedia` nhằm gắn class `.dark` vào `<html>` trước khi body bắt đầu render.',
    deepDive: 'Quy trình hoạt động: Trình duyệt phân tích HTML tuần tự từ trên xuống. Khi gặp thẻ `<script>` nhỏ trong `<head>`, nó chạy ngay trong vài mili-giây, kịp thời thêm class `.dark` vào thẻ `<html>`. Khi CSS và Body được render, toàn bộ biến màu tối đã sẵn sàng, loại bỏ hoàn toàn hiện tượng chớp trắng (FOUC).',
    codeExample: `/* 1. Biến màu ngữ nghĩa */
:root {
  --bg-app: #ffffff;
  --text-main: #0f172a;
}
html.dark {
  --bg-app: #0f172a;
  --text-main: #f8fafc;
}
body { background: var(--bg-app); color: var(--text-main); }

<!-- 2. Script chống FOUC trong <head> -->
<head>
  <script>
    if (localStorage.theme === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      document.documentElement.classList.add('dark');
    }
  </script>
</head>`
  },

  'css-077': {
    summary: 'Khác biệt sống còn giữa `:is()` và `:where()`: **`:where()` luôn có Specificity bằng 0 tuyệt đối `(0, 0, 0)`**; trong khi **`:is()` nhận Specificity của selector có độ ưu tiên cao nhất trong danh sách đối số**. Bắt buộc chọn `:where()` khi viết CSS Reset, Design System UI Kit hoặc CSS Framework để người dùng có thể dễ dàng ghi đè bằng bất kỳ class đơn giản nào.',
    deepDive: 'Ví dụ: `:is(header, #nav) p` có độ ưu tiên là `(0, 1, 0, 1)` vì có `#nav` kéo điểm lên. Ngược lại, `:where(header, #nav) p` chỉ có độ ưu tiên là `(0, 0, 0, 1)` (chỉ tính thẻ `p`, bản thân `:where` có điểm 0). Bọc toàn bộ style mặc định của Component Library trong `:where()` giúp triệt tiêu hoàn toàn nhu cầu dùng `!important`.',
    codeExample: `/* Design System viết bằng :where() -> Specificity = (0, 0, 0, 0) */
:where(.btn-primary) {
  background: #3b82f6;
  color: white;
}

/* Ứng dụng ghi đè dễ dàng chỉ với 1 class thông thường (0, 0, 1, 0) */
.custom-btn {
  background: #10b981; /* Thắng hoàn toàn :where(.btn-primary) */
}`
  },

  'css-078': {
    summary: 'Pseudo-class `:has()` giải quyết bài toán chọn ngược thẻ cha (Parent Selector) và quan hệ liên kết trạng thái phức tạp mà trước đây bắt buộc phải viết JavaScript lắng nghe sự kiện để thêm/bớt class.',
    deepDive: 'Các ví dụ thực tế đỉnh cao của `:has()`: (1) Tự động đổi màu đường viền của form khi có input không hợp lệ: `form:has(:invalid)`; (2) Ẩn nút thanh toán khi giỏ hàng rỗng: `body:has(.cart-empty) .checkout-bar`; (3) Hiển thị Backdrop mờ khi Menu hoặc Dropdown mở: `body:has(#nav-toggle:checked) .overlay`; (4) Đổi layout bài viết nếu có video nhúng.',
    codeExample: `/* 1. Tự động vô hiệu hóa nút Submit nếu form có trường chưa điền */
form:has(input:invalid) button[type="submit"] {
  opacity: 0.5;
  pointer-events: none;
}

/* 2. Đổi màu Header khi Navigation Menu đang mở */
header:has(.nav-menu.is-open) {
  background-color: #0f172a;
}`
  },

  'css-079': {
    summary: 'Khi sản phẩm hỗ trợ ngôn ngữ viết từ phải sang trái (RTL: tiếng Ả Rập, Do Thái), **CSS Logical Properties** giúp tự động đảo chiều layout 100% bằng cách thay thế các thuộc tính vật lý trái/phải (`left`, `right`) bằng các thuộc tính dòng chảy (`inline-start`, `inline-end`).',
    deepDive: 'Bảng chuyển đổi chuẩn: `margin-left` -> `margin-inline-start`; `margin-right` -> `margin-inline-end`; `padding-left/right` -> `padding-inline`; `text-align: left` -> `text-align: start`. Chỉ cần thêm thuộc tính `dir="rtl"` trên thẻ `<html>`, toàn bộ lề, icon, khoảng cách sẽ tự động đối xứng mà không cần bảo trì 2 file CSS riêng biệt.',
    codeExample: `/* ✅ CHUẨN ĐA NGÔN NGỮ (Tự động hỗ trợ cả LTR và RTL) */
.user-comment {
  margin-inline-start: 16px;      /* Cách lề đầu dòng: Trái ở tiếng Việt, Phải ở tiếng Ả Rập */
  padding-inline: 12px;           /* Đệm 2 bên dòng chảy */
  border-inline-start: 3px solid; /* Viền nhấn ở đầu dòng */
  text-align: start;              /* Canh lề theo hướng đọc */
}`
  },

  'css-080': {
    summary: 'Đánh đổi giữa BEM và Utility-first (Tailwind): **BEM** giữ HTML sạch sẽ, tên class giàu ý nghĩa nghiệp vụ, nhưng tốn thời gian đặt tên ("naming fatigue"), file CSS phình to theo thời gian và dễ rò rỉ dead CSS; **Tailwind** tăng tốc độ code vượt trội, file CSS cực nhỏ (< 15KB JIT), nhưng khiến file HTML/JSX bị phình dài và phụ thuộc vào hệ sinh thái tooling.',
    deepDive: 'Lựa chọn chuẩn Senior: Chọn **Tailwind CSS** cho hầu hết các dự án Web hiện đại (Next.js, React, Vue) nhờ khả năng đóng gói logic vào UI Component (tái sử dụng component thay vì tái sử dụng class CSS). Chọn **BEM** cho các trang web CMS truyền thống (WordPress, Shopify) hoặc khi cần viết CSS thuần độc lập không dùng build tool.',
    codeExample: `/* SO SÁNH TRỰC DIỆN GIỮA BEM VÀ TAILWIND

1. BEM: HTML gọn gàng nhưng phải viết file CSS riêng
HTML: <div class="card card--featured"><h2 class="card__title">...</h2></div>
CSS:  .card { padding: 16px; border-radius: 8px; }
      .card--featured { border: 2px solid gold; }
      .card__title { font-size: 1.25rem; font-weight: bold; }

2. TAILWIND: Không cần viết CSS riêng, inline trực tiếp
HTML: <div class="p-4 rounded-lg border-2 border-amber-400"><h2 class="text-xl font-bold">...</h2></div>
*/`
  },

  'css-081': {
    summary: 'Công thức Fluid Typography bằng `clamp()`: `font-size: clamp(minSize, yAxisIntersection + slope * 100vw, maxSize)`. Bẫy Accessibility chí mạng: **Nếu chỉ dùng đơn vị `vw` thuần túy mà không có `rem`, người dùng khi bấm Zoom chữ trong trình duyệt (200% Zoom) cỡ chữ sẽ KHÔNG PHÓNG TO ĐƯỢC**, vi phạm tiêu chuẩn WCAG 1.4.4.',
    deepDive: 'Quy tắc vàng để bảo toàn Accessibility: Phần giá trị linh hoạt ở giữa (preferred value) **BẮT BUỘC PHẢI CHỨA ĐƠN VỊ `rem`** (ví dụ: `calc(1rem + 1.5vw)`). Khi người dùng tăng cỡ chữ mặc định trong trình duyệt hoặc zoom màn hình, đơn vị `rem` sẽ phản hồi và phóng to font chữ chính xác.',
    codeExample: `/* Fluid Typography chuẩn toán học & an toàn Accessibility */
:root {
  /* Co giãn từ 18px (ở viewport 375px) tới 28px (ở viewport 1440px) */
  /* Preferred value có chứa 'rem' để đảm bảo zoom chữ 200% hoạt động */
  --font-fluid-title: clamp(1.125rem, 0.95rem + 0.94vw, 1.75rem);
}

h2 {
  font-size: var(--font-fluid-title);
}`
  },

  'css-082': {
    summary: 'Menu trượt ra bị giật là do animate các thuộc tính kích thước hoặc vị trí vật lý (`left`, `width`, `margin`): Các thuộc tính này kích hoạt toàn bộ chu kỳ **Reflow (Layout) -> Repaint -> Composite** trên CPU. Đổi sang animate **`transform: translateX()`** mượt hơn vì nó chạy trực tiếp trên **GPU Compositor Thread**, hoàn toàn bỏ qua bước Reflow và Repaint.',
    deepDive: 'Chi phí kết xuất của trình duyệt: Reflow là thao tác đắt đỏ nhất vì trình duyệt phải tính toán lại hình học của toàn bộ cây DOM. `transform` chỉ thay đổi ma trận hiển thị mà không ảnh hưởng tới kích thước vật lý của các phần tử xung quanh, cho phép GPU xử lý độc lập đạt 60-120fps ổn định.',
    codeExample: `/* ❌ CHẬM & GIẬT (Kích hoạt Reflow liên tục):
.drawer-slow {
  left: -300px;
  transition: left 300ms ease;
}
.drawer-slow.open { left: 0; } */

/* ✅ SIÊU MƯỢT (GPU Composited 60fps): */
.drawer-fast {
  position: fixed;
  top: 0; left: 0;
  width: 300px; height: 100%;
  transform: translateX(-100%); /* Ẩn ra ngoài màn hình */
  transition: transform 300ms cubic-bezier(0.16, 1, 0.3, 1);
  will-change: transform;
}
.drawer-fast.open {
  transform: translateX(0);     /* Trượt vào mượt mà trên GPU */
}`
  },

  'css-083': {
    summary: 'Khác biệt giữa `:is()`, `:where()`, và `:not()`: (1) **`:is(...)`**: Gom nhóm selectors, mang **Specificity của selector cao nhất** trong danh sách; (2) **`:where(...)`**: Gom nhóm selectors, luôn mang **Specificity = 0**; (3) **`:not(...)`**: Bộ chọn phủ định (loại trừ), mang **Specificity của đối số bên trong nó**.',
    deepDive: 'Cả 3 pseudo-classes này đều là "Forgiving Selector Lists": Nếu có 1 selector bị lỗi cú pháp bên trong `:is()` hoặc `:where()`, trình duyệt vẫn phân tích các selector còn lại bình thường (thay vì làm hỏng toàn bộ cả khối CSS như selector thông thường).',
    codeExample: `/* 1. :is() nhận specificity của h1 (0, 0, 0, 1) */
:is(h1, h2, h3) { color: #0f172a; }

/* 2. :where() specificity = (0, 0, 0, 0) -> Cực dễ ghi đè */
:where(section, article) p { line-height: 1.6; }

/* 3. :not() loại trừ button đầu tiên */
button:not(:first-child) { margin-inline-start: 8px; }`
  },

  'css-084': {
    summary: 'Căn giữa hoàn hảo cả trục ngang và dọc bằng Flexbox: Cách 1: Đặt `display: flex; justify-content: center; align-items: center;` trên container; Cách 2 (Siêu ngắn): Đặt `display: flex;` trên container và `margin: auto;` trên phần tử con.',
    deepDive: 'Trong Flexbox, `margin: auto` trên flex item sẽ tự động hấp thụ toàn bộ khoảng trống thừa ở cả trục Main Axis và Cross Axis. Ngoài ra, nếu dùng CSS Grid, cách ngắn nhất toàn ngành là: `display: grid; place-items: center;`.',
    codeExample: `/* Cách 1: Flexbox căn giữa tiêu chuẩn */
.center-flex {
  display: flex;
  justify-content: center;
  align-items: center;
}

/* Cách 2: CSS Grid 2 dòng ngắn nhất */
.center-grid {
  display: grid;
  place-items: center;
}`
  },

  'css-085': {
    summary: 'CSS Subgrid (`grid-template-rows: subgrid` hoặc `grid-template-columns: subgrid`) cho phép một phần tử con của Grid container **kế thừa và tham gia trực tiếp vào hệ thống đường gióng (Grid tracks) của thẻ cha**, thay vì tự tạo một hệ thống lưới độc lập.',
    deepDive: 'Bài toán kinh điển Subgrid giải quyết: Danh sách Card sản phẩm có 3 phần (Ảnh, Tiêu đề, Nút bấm). Trước đây, nếu tiêu đề card A có 1 dòng, card B có 3 dòng, nút bấm sẽ bị lệch hàng nhấp nhô. Với Subgrid, tiêu đề của mọi card đều nằm chung một track hàng của cha, tự động co giãn bằng chiều cao của tiêu đề dài nhất, giữ các nút bấm luôn thẳng hàng tăm tắp.',
    codeExample: `.card-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
}

.card {
  grid-row: span 3;        /* Chiếm 3 hàng của lưới cha */
  display: grid;
  grid-template-rows: subgrid; /* Kế thừa 3 track hàng từ cha -> Thẳng hàng tuyệt đối */
}`
  },

  'css-086': {
    summary: 'Grid Placement (`grid-column` và `grid-row`) xác định vị trí bắt đầu và kết thúc của một phần tử trên hệ thống đường kẻ lưới (Grid lines). Cú pháp: `grid-column: start-line / end-line`.',
    deepDive: 'Các mẹo hữu ích: (1) `grid-column: 1 / -1`: Kéo dài phần tử phủ trọn từ mép đầu tiên đến mép cuối cùng của lưới; (2) `grid-column: span 2`: Cho phép phần tử mở rộng thêm 2 cột từ vị trí tự nhiên; (3) Hỗ trợ đặt tên đường kẻ (Named grid lines) để code dễ bảo trì hơn.',
    codeExample: `.grid-container {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
}

/* Banner Hero kéo dài hết 4 cột */
.hero-item {
  grid-column: 1 / -1; /* Bắt đầu từ line 1 đến line cuối cùng (-1) */
}

/* Card nổi bật chiếm 2 cột ngang và 2 hàng dọc */
.featured-card {
  grid-column: span 2;
  grid-row: span 2;
}`
  },

  'css-088': {
    summary: 'Vòng đời kết xuất trình duyệt: **Reflow (Layout)** là quá trình tính toán lại vị trí và kích thước hình học của các phần tử trong cây DOM; **Repaint (Paint)** là quá trình vẽ lại các điểm ảnh pixel (màu sắc, viền, bóng đổ); **Composite** là quá trình GPU ghép các layer lại với nhau. Reflow luôn kéo theo Repaint và là thao tác tốn CPU nhất.',
    deepDive: 'Các thuộc tính kích hoạt Reflow: `width`, `height`, `margin`, `padding`, `top`, `left`, `fontSize`, `display`. Các thuộc tính chỉ kích hoạt Repaint: `color`, `background-color`, `visibility`, `box-shadow`. Các thuộc tính chỉ kích hoạt Composite (siêu mượt): `transform`, `opacity`.',
    codeExample: `/* BẢNG TỐI ƯU HÓA RENDERING TRÌNH DUYỆT
Thuộc tính          Reflow?    Repaint?    Composite GPU?
width / height       CÓ         CÓ          KHÔNG
background-color    KHÔNG       CÓ          KHÔNG
transform           KHÔNG      KHÔNG         CÓ (60-120fps mượt mà)
opacity             KHÔNG      KHÔNG         CÓ
*/`
  },

  'css-089': {
    summary: 'Các không gian màu mới trong CSS (`oklch()`, `lab()`, `color(display-p3)`): Mở rộng phạm vi hiển thị màu sắc (Wide Color Gamut), cho phép hiển thị các gam màu xanh lá cây rực rỡ và đỏ tươi rực mà chuẩn sRGB cũ không thể hiển thị được trên màn hình Retina hiện đại.',
    deepDive: 'Cú pháp `oklch(L C H)`: $L$ là Lightness (0% - 100%), $C$ là Chroma (độ bão hòa/đậm của màu), $H$ là Hue (góc màu 0 - 360 độ). Ưu điểm vượt trội: Đổi góc màu $H$ nhưng độ sáng $L$ giữ nguyên không đổi, giúp tự động sinh các theme màu sắc (Accessible Palette Generation) với độ tương phản WCAG hoàn hảo.',
    codeExample: `/* Màu P3 rực rỡ và dễ kiểm soát độ sáng bằng OKLCH */
:root {
  --brand-color: oklch(0.65 0.24 140);
  /* Tạo màu hover bằng cách tăng nhẹ độ sáng L mà giữ nguyên sắc thái màu */
  --brand-hover: oklch(0.72 0.24 140);
}`
  },

  'css-090': {
    summary: 'Native CSS Nesting cho phép viết các quy tắc CSS lồng nhau trực tiếp trong file CSS mà không cần cài đặt Sass hay PostCSS, được hỗ trợ mặc định trên 100% trình duyệt hiện đại từ cuối năm 2023.',
    deepDive: 'Cú pháp sử dụng ký tự `&` đại diện cho selector cha (tương tự Sass). Khác biệt: Trong CSS Nesting bản cập nhật mới nhất của W3C, bạn có thể lồng trực tiếp selector thẻ (`p`, `span`) mà không bắt buộc phải có tiền tố `&` phía trước.',
    codeExample: `/* Native CSS Nesting (Không cần Sass build tool) */
.card {
  padding: 24px;
  background: white;

  & .card-title {
    font-size: 1.25rem;
    color: #0f172a;
  }

  &:hover {
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
  }

  @media (max-width: 640px) {
    padding: 16px;
  }
}`
  },

  'css-092': {
    summary: 'Layout Thrashing (Forced Synchronous Layout) xảy ra khi code JavaScript liên tục xen kẽ giữa việc **Ghi vào DOM (Write)** và **Đọc thông số layout từ DOM (Read)** trong một vòng lặp, ép trình duyệt phải tính toán lại Reflow ngay lập tức thay vì gom batch ở cuối frame.',
    deepDive: 'Các lệnh đọc gây kích hoạt Reflow cưỡng bức: `offsetWidth`, `offsetHeight`, `scrollTop`, `getBoundingClientRect()`. Cách khắc phục: Tách biệt hoàn toàn pha Đọc (Read Phase) và pha Ghi (Write Phase), hoặc sử dụng `requestAnimationFrame` / thư viện FastDOM.',
    codeExample: `// ❌ LỖI LAYOUT THRASHING: Đọc - Ghi xen kẽ làm sập FPS
elements.forEach(el => {
  const width = el.offsetWidth; // READ -> Ép Reflow đồng bộ
  el.style.width = (width * 2) + 'px'; // WRITE -> Làm hỏng layout
});

// ✅ SỬA: Gom toàn bộ pha ĐỌC trước, sau đó mới GHI
const widths = elements.map(el => el.offsetWidth); // Gom READ
requestAnimationFrame(() => {
  elements.forEach((el, i) => {
    el.style.width = (widths[i] * 2) + 'px'; // Gom WRITE
  });
});`
  },

  'css-093': {
    summary: 'Scroll-driven Animations (`animation-timeline: scroll()` hoặc `view()`) cho phép liên kết tiến trình của animation với **vị trí cuộn của trang web hoặc vị trí của phần tử trong khung nhìn**, hoàn toàn bằng CSS mà không cần lắng nghe sự kiện `window.addEventListener("scroll")` bằng JS.',
    deepDive: 'Ưu điểm hiệu năng vô địch: Các hiệu ứng thanh tiến trình đọc bài (Reading Progress Bar), ảnh parallax hoặc hiệu ứng trồi lên khi cuộn tới (Reveal on scroll) chạy trực tiếp trên luồng Compositor của trình duyệt, đạt 60fps mượt mà kể cả khi luồng chính của JS bị nghẽn.',
    codeExample: `/* Thanh tiến trình đọc bài viết chạy mượt mà 100% bằng CSS */
@keyframes growProgress {
  from { transform: scaleX(0); }
  to { transform: scaleX(1); }
}

.reading-progress-bar {
  position: fixed;
  top: 0; left: 0;
  width: 100%; height: 4px;
  background: #3b82f6;
  transform-origin: left;
  animation: growProgress auto linear;
  animation-timeline: scroll(); /* Liên kết timeline với thao tác cuộn trang */
}`
  },

  'css-094': {
    summary: 'CSS Anchor Positioning cho phép định vị một phần tử (như Tooltip, Dropdown Menu, Popover) bám dính chính xác vào một phần tử mốc (Anchor Element) ở bất kỳ đâu trên trang web, kể cả khi hai phần tử này nằm ở hai nhánh DOM hoàn toàn tách biệt nhau.',
    deepDive: 'Giải quyết nỗi đau lớn nhất của Web Development: Trước đây, để làm tooltip cho một button nằm trong modal có `overflow: hidden`, tooltip bắt buộc phải bọc trong button và bị cắt mất lề (clip). Với Anchor Positioning, tooltip có thể nằm ở thẻ `<body>`, neo tọa độ vào button qua `anchor-name: --my-btn` và `position-anchor: --my-btn`.',
    codeExample: `/* Nút bấm làm điểm neo */
.btn-target {
  anchor-name: --save-button;
}

/* Tooltip nằm ở ngoài body nhưng tự động bám dính đỉnh nút bấm */
.tooltip-floating {
  position: fixed;
  position-anchor: --save-button;
  bottom: anchor(top);          /* Đặt đáy tooltip ngay trên đỉnh nút */
  justify-self: anchor-center;  /* Căn giữa ngang với nút */
  margin-bottom: 8px;
}`
  },

  'css-095': {
    summary: 'Rule `@property` (thuộc CSS Houdini API) cho phép đăng ký biến CSS với đầy đủ kiểu dữ liệu cụ thể (`syntax`), khả năng kế thừa (`inherits`) và giá trị mặc định (`initial-value`). Điều kỳ diệu: **Nó cho phép animate mượt mà các thuộc tính mà CSS thường không animate được, đặc biệt là Màu Gradient**.',
    deepDive: 'Trước đây, `background: linear-gradient(...)` không thể transition vì trình duyệt chỉ coi gradient là một ảnh tĩnh (image). Bằng cách khai báo `@property --gradient-angle { syntax: "<angle>"; }`, trình duyệt hiểu đây là một góc độ số học và có thể thực hiện CSS Transition xoay màu gradient mượt mà.',
    codeExample: `/* Đăng ký biến CSS có kiểu dữ liệu góc quay <angle> */
@property --gradient-angle {
  syntax: '<angle>';
  inherits: false;
  initial-value: 0deg;
}

.animated-border {
  --gradient-angle: 0deg;
  background: conic-gradient(from var(--gradient-angle), #3b82f6, #ec4899, #3b82f6);
  transition: --gradient-angle 1s linear;
}
.animated-border:hover {
  --gradient-angle: 360deg; /* Transition xoay màu mượt mà */
}`
  },

  'css-097': {
    summary: 'Popover API là chuẩn HTML/CSS native cung cấp cơ chế hiển thị các lớp phủ (Tooltips, Menus, Modals) trên **Tầng trên cùng (Top Layer)** của trình duyệt. Tự động hỗ trợ đóng khi bấm phím ESC, đóng khi bấm ra ngoài (Light-dismiss), và quản lý Focus bàn phím chuẩn Accessibility.',
    deepDive: 'Phần tử có thuộc tính `popover` luôn hiển thị trên Top Layer, nghĩa là nó luôn nằm trên mọi phần tử khác của trang web mà **hoàn toàn không bị ảnh hưởng bởi `z-index` hay `overflow: hidden` của thẻ cha**. Định dạng kiểu dáng mở thông qua pseudo-class `:popover-open`.',
    codeExample: `<!-- HTML Popover Native -->
<button popovertarget="notification-menu">Mở Thông Báo</button>

<div id="notification-menu" popover>
  <p>Bạn có 3 thông báo mới</p>
</div>

/* CSS định dạng hiệu ứng mở Popover */
#notification-menu:popover-open {
  opacity: 1;
  transform: translateY(0);
}
#notification-menu {
  opacity: 0;
  transform: translateY(-10px);
  transition: opacity 200ms, transform 200ms;
}`
  },

  'css-098': {
    summary: 'Nên dùng CSS Grid cho Page Layout thay vì Float/Clearfix hay Position vì: Grid là hệ thống layout 2 chiều thực thụ, tách bạch hoàn toàn việc định nghĩa khung lưới (Rows/Columns) ra khỏi nội dung, tự động xử lý responsive qua `auto-fit/minmax`, và loại bỏ hoàn toàn các mã bẩn (Clearfix hacks, negative margins).',
    deepDive: 'Float sinh ra để chữ bao quanh ảnh trong văn bản báo chí, không phải để chia cột website. Dùng Float gây mất chiều cao thẻ cha (Collapsing Parent), phải dùng pseudo-element `::after { clear: both; }`. CSS Grid sinh ra chuyên biệt cho bố cục giao diện, cho phép canh thẳng hàng độc lập mà không làm ô nhiễm cấu trúc DOM.',
    codeExample: `/* Bố cục trang hoàn chỉnh chuẩn CSS Grid */
.site-layout {
  display: grid;
  grid-template-columns: minmax(200px, 260px) 1fr;
  grid-template-rows: auto 1fr auto;
  min-height: 100vh;
}`
  },

  'css-099': {
    summary: 'Công thức toán học của Fluid Typography: $y = mx + b$, trong đó độ dốc $m = \\frac{\\text{maxFontSize} - \\text{minFontSize}}{\\text{maxViewport} - \\text{minViewport}}$. Cỡ chữ tự động tăng tuyến tính từ min tới max khi viewport mở rộng, kết hợp vào hàm `clamp(min, preferred, max)`.',
    deepDive: `Các bước tính toán cụ thể: Nếu muốn font chữ từ 16px (ở màn hình 320px) đến 24px (ở màn hình 1200px):
1. Slope: m = (24 - 16) / (1200 - 320) = 8 / 880 ≈ 0.00909 (tương đương 0.91vw).
2. Giao điểm: b = 16 - (320 * 0.00909) ≈ 13.09px (tương đương 0.818rem).
3. Biểu thức cuối cùng: font-size: clamp(1rem, 0.818rem + 0.91vw, 1.5rem).`,
    codeExample: `/* Công thức Fluid Typography tính toán chuẩn xác */
.fluid-heading {
  /* Tối thiểu: 1rem (16px) tại màn hình 320px */
  /* Tuyến tính: 0.818rem + 0.91vw */
  /* Tối đa: 1.5rem (24px) tại màn hình 1200px */
  font-size: clamp(1rem, 0.818rem + 0.91vw, 1.5rem);
}`
  },

  'css-100': {
    summary: 'Design Tokens là các nguyên tử thiết kế (Màu sắc, Font size, Spacing, Border radius, Shadow) được trừu tượng hóa thành các biến dữ liệu độc lập với nền tảng (Platform-agnostic JSON). Chúng làm cầu nối duy nhất giữa file Figma của Designer và code CSS/Web/Mobile của Developer.',
    deepDive: 'Cấu trúc 3 tầng chuẩn Enterprise: (1) **Global Tokens**: Giá trị thô (`color.blue.500: #3b82f6`); (2) **Semantic Tokens**: Gắn với mục đích sử dụng (`color.action.primary: var(--blue-500)`); (3) **Component Tokens**: Áp dụng riêng cho component (`button.primary.bg: var(--action-primary)`). Nhờ kiến trúc này, khi đổi thương hiệu hoặc chuyển theme Dark/Light, hệ thống chỉ cần đổi ánh xạ ở tầng Semantic mà không phải sửa code từng component.',
    codeExample: `/* Hệ thống Design Tokens 3 tầng bằng CSS Variables */
:root {
  /* 1. Global Tokens (Primitive) */
  --blue-500: #3b82f6;
  --space-4: 16px;
  --radius-md: 8px;

  /* 2. Semantic Tokens (Quyết định Light / Dark mode) */
  --color-brand-primary: var(--blue-500);
  --surface-card: #ffffff;

  /* 3. Component Tokens */
  --btn-primary-bg: var(--color-brand-primary);
  --btn-primary-radius: var(--radius-md);
}`
  }
};

let count = 0;
data.forEach(q => {
  if (batch3Updates[q.id]) {
    const u = batch3Updates[q.id];
    q.seniorAnswer.summary = u.summary;
    q.seniorAnswer.deepDive = u.deepDive;
    q.seniorAnswer.codeExample = u.codeExample;
    count++;
  }
});

fs.writeFileSync(filePath, JSON.stringify(data, null, 2) + '\n', 'utf8');
console.log(`Updated ${count} questions in Batch 3 of CSS Bank.`);
