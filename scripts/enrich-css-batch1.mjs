import fs from 'node:fs';
import path from 'node:path';

const filePath = path.resolve('src/features/interview/data/json/css-bank.json');
const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));

const batch1Updates = {
  'css-004': {
    summary: '!important ghi đè toàn bộ độ ưu tiên (Specificity) thông thường trong CSS Cascade. CHỈ NÊN DÙNG khi: (1) Cần ghi đè inline styles từ thư viện bên thứ 3 không thể can thiệp; (2) Các utility classes trợ năng (như `.sr-only`, `.hidden`); NÊN TRÁNH vì nó phá vỡ dòng chảy cascade tự nhiên, gây ra "cuộc chiến !important" làm code không thể bảo trì.',
    deepDive: 'Trong CSS Cascade, nguồn khai báo có thứ tự: User Agent < User Normal < Author Normal < Author !important < User !important. Khi thêm !important, quy tắc chuyển lên tầng ưu tiên cao nhất, cách duy nhất để ghi đè là viết một selector khác cũng có !important với specificity cao hơn hoặc xuất hiện sau. Giải pháp hiện đại thay thế !important là **CSS Cascade Layers (`@layer`)**: Phân tầng ưu tiên rõ ràng mà không làm ô nhiễm specificity.',
    codeExample: `/* ❌ ANTIPATTERN: Cuộc chiến !important */
.button { background: blue !important; }
.card .button { background: red !important; } /* Buộc phải thêm selector dài + !important */

/* ✅ GIẢI PHÁP HIỆN ĐẠI: Dùng Cascade Layers (@layer) */
@layer framework, overrides;

@layer framework {
  .btn-primary { background: #3b82f6; color: white; }
}

@layer overrides {
  /* Mọi rule trong @layer overrides luôn thắng framework mà KHÔNG CẦN !important */
  .btn-custom { background: #10b981; }
}`
  },

  'css-005': {
    summary: 'CSS Box Model bao gồm 4 lớp đồng tâm tính từ trong ra ngoài: **Content** (vùng hiển thị chữ, ảnh); **Padding** (khoảng đệm trong suốt xung quanh content); **Border** (đường viền bao quanh padding); và **Margin** (khoảng cách đẩy lùi các phần tử lân cận bên ngoài border).',
    deepDive: 'Khái niệm then chốt là `box-sizing`: Với mặc định `content-box`, thuộc tính `width` chỉ áp dụng cho Content -> `Tổng chiều rộng = width + padding + border`. Với `border-box` (tiêu chuẩn toàn ngành hiện đại), `width` bao trọn cả Border và Padding -> Phần tử luôn giữ đúng kích thước định nghĩa, loại bỏ hoàn toàn lỗi tràn layout khi thêm padding.',
    codeExample: `/* Reset Box Model chuẩn toàn ngành cho mọi dự án */
*, *::before, *::after {
  box-sizing: border-box; /* Width & height đã bao gồm cả padding và border */
}

.box {
  width: 300px;
  padding: 20px;
  border: 5px solid #0f172a;
  margin: 15px auto;
  /* Kích thước thực tế trên màn hình luôn cố định đúng 300px */
}`
  },

  'css-007': {
    summary: 'Thuộc tính `position` kiểm soát cách phần tử được định vị trong dòng chảy tài liệu (Normal Flow): `static` (mặc định, theo luồng văn bản); `relative` (dịch chuyển so với vị trí gốc của chính nó mà không mất chỗ); `absolute` (thoát khỏi luồng, định vị theo tổ tiên gần nhất có position khác static); `fixed` (định vị theo viewport màn hình); `sticky` (lai giữa relative và fixed khi cuộn tới ngưỡng offset).',
    deepDive: 'Cạm bẫy thường gặp: Khi dùng `absolute`, nếu không có thẻ cha nào mang `position: relative` (hoặc absolute/fixed), phần tử sẽ định vị theo Initial Containing Block (thường là thẻ `<html>`). `fixed` luôn bám theo viewport, NGOẠI TRỪ trường hợp thẻ cha có thuộc tính `transform`, `filter`, hoặc `perspective` khác `none`: Khi đó thẻ cha biến thành containing block mới của fixed.',
    codeExample: `/* Card sản phẩm có Badge giảm giá tuyệt đối góc trên bên phải */
.product-card {
  position: relative; /* Làm mốc tọa độ (Containing Block) cho con */
  width: 280px;
  padding: 16px;
  border-radius: 12px;
}

.discount-badge {
  position: absolute;
  top: 12px;
  right: 12px; /* Định vị chính xác góc trên phải của .product-card */
  background: #ef4444;
  color: white;
}`
  },

  'css-009': {
    summary: 'Trong Flexbox: **`justify-content`** căn chỉnh các items dọc theo **Trục Chính (Main Axis)**; **`align-items`** căn chỉnh các items dọc theo **Trục Vuông Góc (Cross Axis)**. Khi đổi `flex-direction: column`, chiều của Main Axis và Cross Axis sẽ hoán đổi cho nhau.',
    deepDive: 'Mặc định `flex-direction: row`: Main Axis là trục ngang (trái -> phải), Cross Axis là trục dọc (trên -> dưới). Do đó: `justify-content: space-between` sẽ đẩy các item dạt ra hai mép ngang; `align-items: center` sẽ căn giữa các item theo chiều cao của container. Nếu chuyển sang `flex-direction: column`: Main Axis trở thành trục dọc -> `justify-content` lúc này điều khiển khoảng cách trên/dưới.',
    codeExample: `.navbar {
  display: flex;
  flex-direction: row;          /* Main Axis: Ngang | Cross Axis: Dọc */
  justify-content: space-between;/* Đẩy Logo sang trái và Menu sang phải (Main Axis) */
  align-items: center;          /* Căn giữa chiều cao Logo và Nút bấm (Cross Axis) */
  height: 64px;
  padding: 0 24px;
}`
  },

  'css-011': {
    summary: 'Đơn vị **`fr` (Fractional Unit)** trong CSS Grid đại diện cho một phần phân số của khoảng không gian còn trống (Free Available Space) trong grid container sau khi đã trừ đi các kích thước cố định (px, rem) và khoảng cách `gap`.',
    deepDive: 'Công thức tính toán: Nếu container rộng 1000px, gồm cột 200px và 2 cột `1fr` cùng `2fr` kèm `gap: 20px`: Khoảng trống còn lại = $1000 - 200 - (2 \\times 20) = 760px$. Tổng số phần là $1 + 2 = 3$ phần. Cột 1fr nhận $760 / 3 \\approx 253.3px$; Cột 2fr nhận $253.3 \\times 2 \\approx 506.6px$. Đơn vị `fr` giúp tạo layout co giãn tự nhiên mà không cần tính phần trăm phức tạp.',
    codeExample: `.dashboard-grid {
  display: grid;
  /* Cột 1: Cố định 260px (Sidebar) | Cột 2: Chiếm toàn bộ khoảng trống còn lại (1fr) */
  grid-template-columns: 260px 1fr;
  gap: 24px;
  min-height: 100vh;
}`
  },

  'css-012': {
    summary: 'Responsive Web Design (RWD) là phương pháp thiết kế giao diện tự động thích ứng mượt mà trên mọi thiết bị và kích thước màn hình (Mobile, Tablet, Desktop) dựa trên 3 trụ cột cốt lõi: **Fluid Grids** (lưới co giãn theo đơn vị %, fr), **Flexible Images** (ảnh không vượt quá container via `max-width: 100%`) và **Media Queries / Container Queries**.',
    deepDive: 'RWD hiện đại đã vượt qua thời kỳ chỉ phụ thuộc vào Media Queries màn hình: Áp dụng tư duy **Fluid Layout & Intrinsic Sizing** sử dụng các hàm toán học CSS như `clamp()`, `min()`, `max()`, và Container Queries (`@container`) để từng component tự co giãn theo ngữ cảnh chứa nó mà không cần biết kích thước toàn trang.',
    codeExample: `/* Responsive Image & Typography không giật lag */
img, video {
  max-width: 100%;
  height: auto;
  display: block;
}

/* Fluid Typography: Tự co giãn từ 16px (màn nhỏ) tới 24px (màn to) mượt mà */
h1 {
  font-size: clamp(1.25rem, 1rem + 2vw, 2.5rem);
}`
  },

  'css-013': {
    summary: 'Mobile-first là chiến lược thiết kế và viết CSS bắt đầu từ màn hình nhỏ nhất (điện thoại) làm mặc định (Base Styles), sau đó dùng Media Query `min-width` để mở rộng dần tính năng và layout cho màn hình lớn hơn (Tablet -> Desktop).',
    deepDive: 'Ưu thế kỹ thuật của Mobile-first: (1) **Hiệu năng cao**: Thiết bị di động có CPU và mạng yếu nhất, chỉ cần đọc base CSS gọn nhẹ mà không phải nạp layout desktop rồi ghi đè ngược lại; (2) **Code sạch**: CSS viết theo chiều tăng dần `min-width` tự nhiên không cần dùng `max-width` đè chéo nhau gây rác specificity; (3) **Tư duy sản phẩm**: Bắt buộc team tập trung vào tính năng cốt lõi trước.',
    codeExample: `/* 1. Mặc định cho Mobile (Single column, gọn gàng) */
.product-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 16px;
}

/* 2. Tablet trở lên (min-width: 768px) -> 2 cột */
@media (min-width: 768px) {
  .product-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

/* 3. Desktop trở lên (min-width: 1024px) -> 4 cột */
@media (min-width: 1024px) {
  .product-grid {
    grid-template-columns: repeat(4, 1fr);
  }
}`
  },

  'css-014': {
    summary: 'Media Queries (`@media`) áp dụng các khối CSS có điều kiện dựa trên đặc tính của thiết bị: Chiều rộng viewport (`min-width`, `max-width`), Hướng màn hình (`orientation`), Độ phân giải màn hình (`min-resolution`) và Tùy chọn người dùng (`prefers-color-scheme`, `prefers-reduced-motion`).',
    deepDive: 'CSS Media Queries Level 4 giới thiệu cú pháp toán tử so sánh (Range Syntax) trực quan hơn thay cho `min-width/max-width`: `@media (width >= 768px)`. Ngoài kích thước, Senior Developer luôn chú trọng các Media Feature bảo vệ người dùng: `prefers-reduced-motion` (tắt hiệu ứng cho người dễ chóng mặt) và `prefers-contrast` (tăng tương phản cho người khiếm thị).',
    codeExample: `/* Cú pháp Media Queries Level 4 hiện đại */
@media (768px <= width <= 1200px) {
  .sidebar { display: block; }
}

/* Tôn trọng cài đặt giảm chuyển động của hệ điều hành (Accessibility) */
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}`
  },

  'css-015': {
    summary: 'BEM (Block Element Modifier) là quy ước đặt tên class CSS module hóa theo công thức: **`block__element--modifier`**. Giúp code rõ ràng cấu trúc phân cấp, ngăn chặn xung đột tên class, duy trì Specificity luôn ở mức thấp và đồng nhất (0-1-0), loại bỏ selector lồng nhau sâu.',
    deepDive: 'Thành phần BEM: (1) **Block**: Thực thể độc lập có nghĩa (vd: `.card`, `.navbar`); (2) **Element**: Phần tử con phụ thuộc vào Block (ngăn cách bằng `__`, vd: `.card__title`, `.card__button`); (3) **Modifier**: Biến thể thay đổi trạng thái hoặc giao diện (ngăn cách bằng `--`, vd: `.card--featured`, `.button--disabled`).',
    codeExample: `/* BEM Naming Convention chuẩn */
.card { /* Block: Thùng chứa */
  background: #ffffff;
  border-radius: 8px;
}
.card--highlighted { /* Modifier: Biến thể nổi bật */
  border: 2px solid #3b82f6;
}
.card__title { /* Element: Tiêu đề nằm trong Card */
  font-size: 1.25rem;
  font-weight: 700;
}
.card__button--danger { /* Element kết hợp Modifier */
  background-color: #ef4444;
}`
  },

  'css-016': {
    summary: 'Khác biệt cốt lõi giữa `border` và `outline`: **`border`** chiếm diện tích vật lý trong Box Model (ảnh hưởng tới kích thước phần tử và đẩy các phần tử xung quanh); **`outline`** được vẽ bên ngoài border, **KHÔNG chiếm diện tích** trong layout và không làm xô lệch các phần tử lân cận.',
    deepDive: 'Đặc điểm kỹ thuật: (1) `outline` không thể đặt riêng từng cạnh (`outline-left` không tồn tại); (2) `outline` có thuộc tính `outline-offset` cho phép thụt lề vào trong hoặc đẩy ra xa viền; (3) `outline` là thuộc tính sống còn của Accessibility (Focus Indicator khi tab bàn phím). Tuyệt đối KHÔNG viết `outline: none` mà không có style thay thế cho `:focus-visible`.',
    codeExample: `/* Focus ring chuẩn Accessibility cho Button */
.btn:focus-visible {
  outline: 3px solid #3b82f6;
  outline-offset: 2px; /* Tạo khe hở 2px giữa viền nút và đường viền focus */
}

/* Thẻ cảnh báo không làm giật layout nhờ outline */
.error-banner {
  outline: 2px dashed #ef4444; /* Vẽ viền mà không làm thay đổi kích thước box */
}`
  },

  'css-017': {
    summary: '`flex: 1` là viết tắt của **`flex: 1 1 0%`** (`flex-grow: 1`, `flex-shrink: 1`, `flex-basis: 0%`); trong khi `flex: auto` là viết tắt của **`flex: 1 1 auto`** (`flex-basis: auto`). Điểm khác biệt chí mạng nằm ở `flex-basis`: `0%` chia đều khoảng trống bất kể nội dung bên trong; `auto` tính toán dựa trên kích thước nội dung trước rồi mới chia phần dư.',
    deepDive: 'Khi cần tạo 3 cột bằng nhau tuyệt đối: Dùng `flex: 1` (do `flex-basis: 0%` coi mọi cột ban đầu đều có chiều rộng bằng 0, toàn bộ container được chia đều làm 3). Nếu dùng `flex: auto`, cột nào có chữ dài hơn sẽ bị phình to hơn vì `flex-basis: auto` lấy kích thước content làm gốc rồi mới chia phần còn thừa.',
    codeExample: `/* So sánh flex: 1 vs flex: auto */
.container-equal-columns .item {
  flex: 1; /* flex: 1 1 0% -> Mọi cột rộng bằng nhau 100% */
  min-width: 0; /* Khắc phục lỗi tràn text trong flex item */
}

.container-content-based .item {
  flex: auto; /* flex: 1 1 auto -> Cột chứa nhiều chữ hơn sẽ rộng hơn */
}`
  },

  'css-018': {
    summary: 'Toolbar: **Chọn Flexbox** (layout 1 chiều, co giãn tự nhiên theo chiều ngang với `justify-content: space-between`); Lưới Card sản phẩm: **Chọn CSS Grid** (layout 2 chiều, căn chỉnh nghiêm ngặt hàng và cột theo cấu trúc ma trận đồng đều với `repeat(auto-fill, minmax(280px, 1fr))`).',
    deepDive: 'Nguyên tắc vàng của CSS Architecture: Flexbox là "Content-first" (nội dung quyết định bố cục 1 chiều); Grid là "Layout-first" (lưới định sẵn quyết định vị trí các phần tử 2 chiều). Dùng Grid cho card sản phẩm đảm bảo mọi card ở tất cả các hàng đều có chiều rộng và lề thẳng tắp; Dùng Flexbox cho toolbar cho phép logo, menu và nút avatar tự động dạt về 2 phía và căn giữa trục dọc hoàn hảo.',
    codeExample: `/* 1. Toolbar: Dùng Flexbox */
.navbar-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

/* 2. Lưới Card sản phẩm: Dùng CSS Grid */
.product-card-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 20px;
}`
  },

  'css-019': {
    summary: '`align-items` căn chỉnh các item **trong từng hàng đơn lẻ** dọc theo Cross Axis; `align-content` căn chỉnh **toàn bộ các hàng (hệ thống hàng)** dọc theo Cross Axis khi có nhiều hàng. Đặt `align-content` không có tác dụng khi container chỉ có 1 hàng duy nhất (`flex-wrap: nowrap` hoặc nội dung không bị rớt dòng).',
    deepDive: 'Để `align-content` hoạt động: Bắt buộc container phải có `flex-wrap: wrap`, có ít nhất 2 hàng items, và container phải có chiều cao cố định (hoặc `min-height`) lớn hơn tổng chiều cao của các hàng. Khi đó `align-content: space-between` hoặc `center` sẽ phân phối khoảng trống giữa các hàng.',
    codeExample: `.tags-cloud {
  display: flex;
  flex-wrap: wrap;       /* BẮT BUỘC: Cho phép rớt dòng */
  height: 300px;         /* BẮT BUỘC: Chiều cao lớn hơn nội dung để có khoảng thừa */
  align-content: center; /* Gom toàn bộ các hàng lại chính giữa container */
  gap: 8px;
}`
  },

  'css-020': {
    summary: 'Nên dùng `gap` thay cho `margin-right + :last-child` vì: (1) `gap` không yêu cầu selector phức tạp hay CSS reset; (2) Tự động xử lý chính xác cả 2 chiều khi rớt dòng (`flex-wrap: wrap`), trong khi margin chỉ xử lý được 1 chiều ngang và làm hỏng lề dưới; (3) Hỗ trợ đảo chiều layout RTL mượt mà mà không lo lệch lề trái/phải.',
    deepDive: 'Kỹ thuật cũ dùng `margin-right: 16px` kèm `:last-child { margin-right: 0 }` gặp thảm họa khi items bị rớt xuống dòng thứ 2: Item cuối của dòng 1 vẫn có margin-right, đẩy dòng bị méo; và các hàng dính sát nhau do thiếu margin-bottom. Thuộc tính `gap` (được hỗ trợ 100% trình duyệt từ 2021) phân phối khoảng cách hoàn hảo giữa các phần tử mà không tạo lề thừa ở mép ngoài.',
    codeExample: `/* ✅ CHUẨN HIỆN ĐẠI: Đơn giản, sạch sẽ và an toàn */
.tag-list {
  display: flex;
  flex-wrap: wrap;
  gap: 12px 16px; /* Row gap: 12px, Column gap: 16px */
}`
  },

  'css-021': {
    summary: 'Quy tắc viết sau không đè được quy tắc viết trước là do **Độ ưu tiên (Specificity)** của quy tắc trước cao hơn. Thứ tự thắng thua của CSS (Cascade) tuân theo 4 nấc thang: (1) Inline Styles (`style="..."`); (2) Số lượng IDs (`#header`); (3) Số lượng Classes/Attributes/Pseudo-classes (`.nav`, `[type]`, `:hover`); (4) Số lượng Elements (`div`, `p`). Viết sau chỉ thắng khi Specificity bằng nhau.',
    deepDive: 'Công thức tính Specificity: tuple `(Inline, ID, Class, Element)`. Ví dụ: `#nav .item` có điểm `(0, 1, 1, 0)`. Dù bạn viết rule sau là `.menu .list .item` có tới 3 classes `(0, 0, 3, 0)`, nó vẫn thua tuyệt đối vì 1 ID luôn thắng mọi số lượng class. Để ghi đè sạch mà không dùng !important: Viết selector có specificity ngang bằng hoặc giảm specificity của rule cũ bằng `:where()`.',
    codeExample: `/* Rule 1: Specificity (0, 1, 0, 0) - Thắng do có 1 ID */
#main-nav a { color: blue; }

/* Rule 2: Viết sau nhưng Specificity chỉ là (0, 0, 2, 0) -> THUA, không đè được */
.nav-bar .link { color: red; }

/* ✅ SỬA: Đưa Specificity về 0 bằng :where() để dễ dàng ghi đè */
:where(#main-nav) a { color: blue; /* Specificity chỉ là (0, 0, 0, 1) */ }
.link { color: red; /* (0, 0, 1, 0) -> Ghi đè thành công dễ dàng */ }`
  },

  'css-022': {
    summary: 'Đồng nghiệp thêm `!important` để đè thư viện UI là dấu hiệu kỹ thuật xấu (Code Smell) vì bắt đầu "cuộc chiến specificity", khiến code tương lai không thể tùy biến. Xử lý chuẩn mực: (1) Tăng specificity hợp lý hoặc (2) Khai báo import CSS thư viện vào **Cascade Layer (`@layer`)** để code của ứng dụng luôn thắng mặc định.',
    deepDive: 'Trong CSS Cascade hiện đại, mọi rule thông thường nằm ngoài layer luôn có độ ưu tiên cao hơn bất kỳ rule nào nằm trong `@layer`, bất kể specificity là bao nhiêu. Đóng gói thư viện UI vào `@layer vendor` giải quyết triệt để vấn đề bị đè style mà không bao giờ cần chạm tới `!important`.',
    codeExample: `/* ✅ GIẢI PHÁP CHUẨN SENIOR: Đóng gói UI Library vào Cascade Layer */
@layer vendor, app;

@import "ant-design/dist/reset.css" layer(vendor);

@layer app {
  /* Class đơn giản này luôn ghi đè thành công component của thư viện */
  .ant-btn {
    border-radius: 9999px; /* Tự động thắng Ant Design mà ZERO !important */
  }
}`
  },

  'css-023': {
    summary: 'Rule `@supports (property: value)` (CSS Feature Queries) dùng để kiểm tra xem trình duyệt hiện tại có hỗ trợ một tính năng CSS cụ thể hay không trước khi áp dụng. Viết theo nguyên tắc: Cung cấp fallback cơ bản trước, sau đó bọc tính năng hiện đại trong `@supports`.',
    deepDive: 'Lưu ý kỹ thuật: (1) `@supports` chỉ kiểm tra cú pháp CSS engine có nhận hay không, không kiểm tra được bug render của trình duyệt; (2) Hỗ trợ các toán tử `and`, `or`, `not`; (3) Sử dụng `@supports selector(...)` để kiểm tra các selector mới như `:has()` trên trình duyệt cũ.',
    codeExample: `/* Fallback hiển thị dạng Flexbox cho trình duyệt cũ */
.card-grid {
  display: flex;
  flex-wrap: wrap;
}

/* Tự động nâng cấp lên CSS Subgrid nếu trình duyệt hỗ trợ */
@supports (grid-template-rows: subgrid) {
  .card-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
  }
  .card-item {
    grid-row: span 3;
    display: grid;
    grid-template-rows: subgrid; /* Header, Body, Footer thẳng hàng nhau */
  }
}`
  },

  'css-024': {
    summary: 'Biến CSS (`--custom-property`) tuân theo **Phạm vi kế thừa DOM (Lexical Scope / Inheritance)**: Nếu khai báo bên trong một selector component con, các component ngang hàng hoặc cha sẽ không truy cập được. Fallback `var(--x, giá trị)` chỉ chạy khi biến `--x` **chưa từng được định nghĩa** hoặc mang giá trị `initial/unset`.',
    deepDive: 'Cạm bẫy quan trọng: Nếu biến `--x: red` nhưng bạn gán giá trị không hợp lệ (ví dụ: `--x: 20px` nhưng dùng cho `color: var(--x)`), fallback trong `var()` SẼ KHÔNG CHẠY. Trình duyệt coi biến đó đã tồn tại, sau đó bước vào giai đoạn tính toán giá trị (Computed-value time) và fallback về giá trị `inherit` hoặc `initial` của thuộc tính đó.',
    codeExample: `/* 1. Khai báo biến toàn cục trên root */
:root {
  --primary-color: #3b82f6;
}

/* 2. Component sử dụng fallback an toàn */
.badge {
  /* Nếu --badge-bg chưa được component cha truyền vào, fallback dùng #e2e8f0 */
  background-color: var(--badge-bg, #e2e8f0);
  color: var(--badge-color, var(--primary-color));
}`
  },

  'css-025': {
    summary: '`:has()` là Pseudo-class selector ("Parent Selector" - bộ chọn cha) cho phép tạo kiểu cho một phần tử dựa trên các phần tử con hoặc phần tử liền kề của nó. Trước khi có `:has()`, lập trình viên bắt buộc phải dùng JavaScript để gắn class lên thẻ cha.',
    deepDive: 'Trước đây `:has()` bị trì hoãn nhiều năm do lo ngại về hiệu năng render (chu kỳ kiểm tra DOM từ dưới lên trên). Trình duyệt hiện đại đã tối ưu hóa bộ nhớ đệm selector cache. `:has()` có thể kết hợp mạnh mẽ: `.card:has(img)` (chỉ card có ảnh), `form:has(:invalid) button[type="submit"]` (disable nút khi form có lỗi) mà không cần 1 dòng JS.',
    codeExample: `/* 1. Đổi màu viền Form khi có bất kỳ input nào bên trong không hợp lệ */
form:has(input:invalid) {
  border-color: #ef4444;
}

/* 2. Đổi layout Card sang 2 cột ngang NẾU card có chứa ảnh */
.card:has(.card__thumbnail) {
  display: grid;
  grid-template-columns: 120px 1fr;
}

/* 3. Tự động ẩn Label khi input checkbox được tick */
.todo-item:has(input:checked) span {
  text-decoration: line-through;
  opacity: 0.6;
}`
  },

  'css-026': {
    summary: 'Các bộ kết hợp (Combinator selectors): (1) **Khoảng trắng (Descendant)** `A B`: Mọi thẻ B là hậu duệ của A (con, cháu, chắt); (2) **Dấu `>` (Child)** `A > B`: Chỉ thẻ B là **con trực tiếp** cấp 1 của A; (3) **Dấu `+` (Adjacent Sibling)** `A + B`: Duy nhất thẻ B nằm **ngay liền kề sau** A; (4) **Dấu `~` (General Sibling)** `A ~ B`: Mọi thẻ B cùng cha nằm **sau** A.',
    deepDive: 'Sử dụng `>` thay cho khoảng trắng giúp tăng hiệu năng render CSS Engine vì trình duyệt duyệt selector từ phải sang trái (Right-to-Left): Với `A B`, trình duyệt tìm mọi `B` trên toàn trang rồi leo ngược DOM tìm tổ tiên `A`. Với `A > B`, trình duyệt chỉ cần kiểm tra đúng thẻ cha trực tiếp. Dấu `+` cực kỳ hữu ích cho kỹ thuật "Lobotomized Owl" hoặc tạo khoảng cách giữa các đoạn văn bản.',
    codeExample: `/* Chỉ tạo margin-top cho các đoạn văn bản nằm liền sau tiêu đề h2 */
h2 + p {
  margin-top: 8px;
}

/* Menu Dropdown: Chỉ tác động lên thẻ <ul> là con trực tiếp */
.nav-item > ul {
  position: absolute;
  top: 100%;
}`
  },

  'css-028': {
    summary: '`position: sticky` hoạt động như `relative` trong luồng bình thường cho đến khi container cuộn đến ngưỡng quy định (`top`, `bottom`), phần tử sẽ "dính chặt" như `fixed` nhưng **chỉ giới hạn trong phạm vi của thẻ cha trực tiếp (Containing Block)**.',
    deepDive: '4 lý do khiến `sticky` không hoạt động: (1) Quên đặt ít nhất một ngưỡng tọa độ (bắt buộc phải có `top: 0`, `bottom: 0`, hoặc `left/right`); (2) **Thẻ cha có `overflow: hidden`, `auto`, hoặc `scroll`**: Làm gãy ngữ cảnh cuộn; (3) Thẻ cha không đủ chiều cao (chiều cao bằng đúng sticky element thì không có khoảng trống để trượt); (4) Thẻ cha là Flexbox mà chưa đặt `align-self: flex-start` (mặc định stretch khiến con cao bằng cha).',
    codeExample: `/* Table Header dính trên cùng khi cuộn dữ liệu bảng */
.table-container {
  max-height: 400px;
  overflow-y: auto; /* Tạo context cuộn cho container */
}

thead th {
  position: sticky;
  top: 0;           /* BẮT BUỘC: Ngưỡng neo dính */
  z-index: 10;      /* Nổi lên trên các dòng dữ liệu trượt bên dưới */
  background: #f8fafc;
}`
  },

  'css-029': {
    summary: '`z-index` kiểm soát thứ tự hiển thị của các phần tử trên trục Z (xếp chồng lớp nào đè lên lớp nào). `z-index` **CHỈ HOẠT ĐỘNG** trên các phần tử có `position` khác `static` (relative, absolute, fixed, sticky) hoặc là con trực tiếp của Flexbox / Grid container.',
    deepDive: 'Bẫy lớn nhất của `z-index`: **Stacking Context (Ngữ cảnh xếp chồng)**. Phần tử dù có `z-index: 999999` vẫn sẽ nằm dưới một phần tử có `z-index: 1` nếu thẻ cha của nó nằm trong một Stacking Context thấp hơn. Không nên spam `z-index: 9999`, hãy quản lý z-index theo thang biến số Design System (vd: dropdown: 100, modal: 1000, tooltip: 2000).',
    codeExample: `/* Hệ thống quản lý Z-Index theo Design Tokens chuẩn */
:root {
  --z-dropdown: 100;
  --z-sticky: 200;
  --z-modal-backdrop: 900;
  --z-modal: 1000;
  --z-toast: 2000;
}

.modal-dialog {
  position: fixed;
  z-index: var(--z-modal);
}`
  },

  'css-031': {
    summary: 'Bộ ba linh hồn của Flex item: **`flex-grow`** (tỷ lệ phình to để hấp thụ khoảng trống thừa); **`flex-shrink`** (tỷ lệ co lại khi container bị chật chội); **`flex-basis`** (kích thước khởi điểm của item trước khi phân phối không gian trống).',
    deepDive: 'Thuật toán Flex: (1) Lấy tổng chiều rộng container trừ tổng `flex-basis` của các item; (2) Nếu còn thừa -> chia thêm dựa theo tỷ lệ `flex-grow`; (3) Nếu bị thiếu (tràn) -> co bớt dựa theo tỷ lệ `flex-shrink * flex-basis`. Lưu ý quan trọng: Để ngăn một icon hoặc avatar không bao giờ bị méo khi text quá dài, luôn đặt `flex-shrink: 0`.',
    codeExample: `.media-object {
  display: flex;
  gap: 16px;
}

.avatar {
  flex-shrink: 0; /* BẮT BUỘC: Không bao giờ bị bẹp dúm khi text bên cạnh dài */
  width: 48px;
  height: 48px;
}

.content {
  flex-grow: 1;   /* Chiếm toàn bộ khoảng trống còn lại */
  min-width: 0;   /* Cho phép text truncate bên trong */
}`
  },

  'css-032': {
    summary: '`flex-wrap` kiểm soát việc các flex items có được phép bẻ xuống dòng mới khi kích thước container không đủ chứa hay không: `nowrap` (mặc định, ép mọi item nằm trên 1 hàng, gây tràn hoặc co rúm); `wrap` (tự động nhảy xuống dòng mới); `wrap-reverse` (nhảy dòng theo chiều ngược lại).',
    deepDive: 'Khi `flex-wrap: wrap` được kích hoạt, container biến thành môi trường đa dòng (Multi-line Flex Container). Lúc này trục Cross Axis được tính toán độc lập cho từng dòng, và thuộc tính `align-content` bắt đầu có hiệu lực để căn chỉnh khoảng cách giữa các dòng với nhau.',
    codeExample: `/* Danh sách Chips / Tags tự động rớt dòng trên Mobile */
.chip-group {
  display: flex;
  flex-wrap: wrap; /* Cho phép rớt dòng tự nhiên */
  gap: 8px;
}

.chip {
  padding: 6px 12px;
  background: #f1f5f9;
  border-radius: 16px;
  white-space: nowrap; /* Giữ chữ trong từng chip không bị gãy đôi */
}`
  },

  'css-033': {
    summary: '`gap` (hoặc `row-gap`, `column-gap`) trong Flexbox định nghĩa khoảng cách phân tách giữa các flex items mà không làm tạo ra lề thừa ở các mép ngoài của container, thay thế hoàn toàn kỹ thuật trừ margin cũ.',
    deepDive: 'Trước khi có `gap` cho Flexbox, lập trình viên phải dùng "Negative Margin Pattern" trên container (`margin: -8px`) và padding trên item (`padding: 8px`) để bù trừ khoảng cách mép. `gap` được W3C chuẩn hóa và hỗ trợ toàn diện trên mọi trình duyệt hiện đại, giúp layout sạch sẽ, không gây hiện tượng thanh cuộn ngang ngoài ý muốn.',
    codeExample: `.button-group {
  display: flex;
  gap: 12px; /* Tự động tạo khoảng cách 12px giữa các nút bấm */
}`
  },

  'css-034': {
    summary: '`grid-template-columns` và `grid-template-rows` xác định số lượng và kích thước của các cột và hàng trong CSS Grid. Hỗ trợ đa dạng đơn vị: Cố định (`px`, `rem`), Linh hoạt (`%`, `fr`), Tự động (`auto`, `min-content`, `max-content`) và Hàm hàm tính toán (`minmax()`, `repeat()`).',
    deepDive: 'Hàm `repeat()` giúp viết gọn cú pháp: `grid-template-columns: repeat(12, 1fr)` tạo lưới 12 cột chuẩn bootstrap. Khi kết hợp với `minmax(200px, 1fr)`, cột có khả năng co giãn linh hoạt nhưng không bao giờ nhỏ hơn 200px.',
    codeExample: `.app-layout {
  display: grid;
  /* Hàng 1: Header 60px | Hàng 2: Main Content tự co giãn | Hàng 3: Footer tự động theo nội dung */
  grid-template-rows: 60px 1fr auto;
  /* Cột 1: Sidebar 240px | Cột 2: Nội dung chính chiếm hết phần còn lại */
  grid-template-columns: 240px 1fr;
  min-height: 100vh;
}`
  },

  'css-035': {
    summary: 'Sự khác biệt giữa `auto-fit` và `auto-fill` trong `repeat()`: Cả hai đều tự động tính số cột theo chiều rộng container; nhưng khi **số lượng phần tử ít hơn số cột có thể chứa**, **`auto-fill`** giữ nguyên các cột trống vô hình; còn **`auto-fit`** sẽ thu sập các cột trống về 0px và kéo giãn các phần tử hiện có để lấp đầy toàn bộ hàng.',
    deepDive: 'Hệ quả thực tế: Nếu container rộng 1200px và mỗi card tối thiểu 300px (chứa được 4 cột), nhưng bạn chỉ có duy nhất 1 card: Với `auto-fill`, card chiếm 300px ở cột 1 và để trống 3 cột còn lại; Với `auto-fit` kết hợp `minmax(300px, 1fr)`, card đơn độc đó sẽ phình to ra 1200px kéo dài hết cả màn hình. Do đó, cho card sản phẩm: Thường ưu tiên `auto-fill` để card không bị kéo giãn quá cỡ khi có ít sản phẩm.',
    codeExample: `/* So sánh auto-fit vs auto-fill */
.cards-auto-fit {
  display: grid;
  /* Nếu chỉ có 1 card, nó sẽ bị kéo giãn chiếm trọn 100% hàng */
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
}

.cards-auto-fill {
  display: grid;
  /* Nếu chỉ có 1 card, nó chỉ rộng đúng 280px-ish và giữ các slot trống bên cạnh */
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
}`
  }
};

let count = 0;
data.forEach(q => {
  if (batch1Updates[q.id]) {
    const u = batch1Updates[q.id];
    q.seniorAnswer.summary = u.summary;
    q.seniorAnswer.deepDive = u.deepDive;
    q.seniorAnswer.codeExample = u.codeExample;
    count++;
  }
});

fs.writeFileSync(filePath, JSON.stringify(data, null, 2) + '\n', 'utf8');
console.log(`Updated ${count} questions in Batch 1 of CSS Bank.`);
