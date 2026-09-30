import fs from 'node:fs';
import path from 'node:path';

const filePath = path.resolve('src/features/interview/data/json/css-bank.json');
const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));

const batch2Updates = {
  'css-036': {
    summary: 'Hàm `minmax(min, max)` trong CSS Grid xác định khoảng kích thước linh hoạt cho hàng hoặc cột, đảm bảo kích thước không bao giờ co nhỏ hơn `min` và không bao giờ vượt quá `max`.',
    deepDive: 'Kỹ thuật kinh điển là kết hợp `repeat(auto-fit, minmax(250px, 1fr))`: Tự động tạo layout lưới responsive hoàn hảo mà không cần viết bất kỳ một dòng Media Query nào. Lưu ý: `min` không thể nhận giá trị `fr` (ví dụ `minmax(1fr, 300px)` là không hợp lệ). Nếu muốn cột co lại được khi nội dung dài, dùng `minmax(0, 1fr)`.',
    codeExample: `.responsive-grid {
  display: grid;
  /* Cột co giãn từ tối thiểu 250px đến tối đa chiếm trọn 1fr */
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
}`
  },

  'css-037': {
    summary: '`grid-template-areas` cho phép định nghĩa bố cục 2 chiều trực quan bằng các tên vùng chữ (ASCII-like naming). Sau đó các phần tử con dùng `grid-area: tên_vùng` để tự động đặt mình vào đúng vị trí trên lưới.',
    deepDive: 'Ưu điểm vượt trội: Cực kỳ dễ đọc và bảo trì. Mỗi dòng string đại diện cho một hàng, mỗi từ đại diện cho một cột. Dùng dấu chấm `.` để biểu thị ô trống. Khi chuyển sang Mobile, chỉ cần ghi đè lại thuộc tính `grid-template-areas` trong Media Query mà không cần thay đổi cấu trúc HTML.',
    codeExample: `.dashboard-layout {
  display: grid;
  grid-template-columns: 240px 1fr 300px;
  grid-template-rows: 64px 1fr 48px;
  grid-template-areas:
    "header  header  header"
    "sidebar main    activity"
    "footer  footer  footer";
  min-height: 100vh;
}

.header { grid-area: header; }
.sidebar { grid-area: sidebar; }
.main-content { grid-area: main; }
.footer { grid-area: footer; }`
  },

  'css-038': {
    summary: 'Hàm `clamp(min, val, max)` khóa một giá trị trong khoảng giữa mức tối thiểu (`min`) và tối đa (`max`), dựa trên một giá trị ưu tiên (`val`) có thể biến đổi linh hoạt (thường dùng đơn vị `vw/vh`).',
    deepDive: 'Công thức toán học tương đương: `max(min, min(val, max))`. `clamp()` là chìa khóa của **Fluid Typography & Fluid Spacing**: Font chữ hoặc khoảng cách co giãn mượt mà theo viewport mà không bao giờ bị quá bé trên mobile hoặc quá khổng lồ trên màn hình 4K.',
    codeExample: `/* Tiêu đề tự co giãn mượt mà: Tối thiểu 24px, chuẩn 1.5rem + 2.5vw, tối đa 48px */
h1 {
  font-size: clamp(1.5rem, 1rem + 2.5vw, 3rem);
  padding-inline: clamp(16px, 4vw, 48px);
}`
  },

  'css-039': {
    summary: 'Container Queries (`@container`) cho phép component tự áp dụng kiểu dáng dựa trên kích thước của **vùng chứa trực tiếp (Parent Container)** thay vì kích thước toàn bộ màn hình viewport (Media Queries).',
    deepDive: 'Đây là cuộc cách mạng của Component-Driven Architecture: Một component Card có thể đặt ở Sidebar hẹp (hiển thị dọc 1 cột) hoặc đặt ở Main Content rộng (tự động chuyển sang ngang 2 cột) mà không cần viết biến thể class riêng. Thiết lập bằng cách khai báo `container-type: inline-size` trên thẻ cha, sau đó dùng `@container (min-width: 400px)` trên thẻ con.',
    codeExample: `/* 1. Đăng ký thẻ cha làm Container ngữ cảnh */
.card-container {
  container-type: inline-size;
  container-name: card;
}

/* 2. Thẻ con tự đổi giao diện khi Container của nó rộng hơn 450px */
@container card (min-width: 450px) {
  .product-card {
    display: flex;
    flex-direction: row;
    align-items: center;
  }
}`
  },

  'css-040': {
    summary: 'Responsive Images với `srcset` và `sizes`: `srcset` liệt kê danh sách các file ảnh kèm chiều rộng thực tế của chúng (đơn vị `w`, ví dụ `image-800.webp 800w`); `sizes` báo trước cho trình duyệt biết ảnh sẽ hiển thị rộng bao nhiêu trên layout trước khi tải CSS.',
    deepDive: 'Trình duyệt đọc `sizes` và mật độ điểm ảnh của thiết bị (Device Pixel Ratio: 1x, 2x, 3x) để tự động chọn đúng file ảnh nhẹ nhất trong `srcset`. Điều này giúp tiết kiệm 70% băng thông di động và loại bỏ hiện tượng giật layout (Cumulative Layout Shift - CLS).',
    codeExample: `<img 
  src="/images/hero-800.jpg"
  srcset="
    /images/hero-400.webp 400w,
    /images/hero-800.webp 800w,
    /images/hero-1200.webp 1200w"
  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 800px"
  alt="Sản phẩm công nghệ cao"
  loading="lazy"
  decoding="async"
/>`
  },

  'css-041': {
    summary: 'Rule `@keyframes` định nghĩa chuỗi các giai đoạn chuyển đổi trạng thái của animation theo tỷ lệ phần trăm thời gian (`from/0%` đến `to/100%`). Sau đó được gọi bằng thuộc tính `animation`.',
    deepDive: 'Quy tắc hiệu năng 60fps chuẩn Senior: **Chỉ animate hai thuộc tính `transform` và `opacity`**. Hai thuộc tính này được xử lý độc lập trên GPU Compositor Thread, hoàn toàn không gây Reflow (Layout) hay Repaint, đảm bảo chuyển động mượt mà không bị giật lag trên thiết bị yếu.',
    codeExample: `@keyframes slideInFade {
  0% {
    opacity: 0;
    transform: translateY(20px) scale(0.95);
  }
  100% {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.modal-content {
  animation: slideInFade 300ms cubic-bezier(0.16, 1, 0.3, 1) forwards;
}`
  },

  'css-042': {
    summary: 'Thuộc tính `will-change` báo trước cho trình duyệt biết thuộc tính nào của phần tử sắp thay đổi (ví dụ: `will-change: transform, opacity`), để trình duyệt chuẩn bị tài nguyên và đẩy phần tử lên một Composite Layer riêng trên GPU trước khi animation bắt đầu.',
    deepDive: 'Cảnh báo lạm dụng: Tuyệt đối KHÔNG gán `will-change` cho hàng loạt phần tử trên CSS tĩnh vì mỗi layer GPU tiêu tốn bộ nhớ VRAM lớn. Chỉ bật `will-change` khi sắp có tương tác (ví dụ: qua `:hover` hoặc bằng JS khi chạm vào màn hình) và gỡ bỏ ngay khi animation kết thúc.',
    codeExample: `/* Chỉ báo trước khi người dùng hover vào card để chuẩn bị chuyển động */
.card {
  transition: transform 250ms ease;
}
.card:hover {
  will-change: transform; /* Báo cho GPU sẵn sàng */
  transform: translateY(-8px);
}`
  },

  'css-043': {
    summary: 'CSS Logical Properties là hệ thống thuộc tính căn chỉnh dựa trên dòng chảy ngữ nghĩa của văn bản (Flow-relative) thay vì vị trí vật lý cố định: `margin-inline` (thay `margin-left/right`), `padding-block` (thay `padding-top/bottom`), `inset-inline-start` (thay `left` trong LTR).',
    deepDive: 'Lợi ích sống còn cho ứng dụng Quốc tế hóa (i18n): Khi giao diện chuyển sang các ngôn ngữ viết từ phải sang trái (RTL như tiếng Ả Rập, Do Thái) hoặc viết dọc (Vertical-RL như tiếng Nhật cổ), toàn bộ lề, đệm, viền sẽ tự động đảo chiều chính xác mà không cần viết thêm bất kỳ một dòng CSS ghi đè nào.',
    codeExample: `/* ✅ CHUẨN HIỆN ĐẠI HỖ TRỢ CẢ LTR VÀ RTL TỰ ĐỘNG */
.dialog-box {
  padding-block: 24px;          /* Khoảng đệm trên/dưới theo dòng chảy */
  padding-inline: 16px;         /* Khoảng đệm trái/phải theo dòng chảy */
  margin-inline-start: auto;    /* Đẩy về mép cuối dòng (bên phải ở LTR, bên trái ở RTL) */
  border-inline-start: 4px solid #3b82f6; /* Viền nhấn ở đầu dòng */
}`
  },

  'css-044': {
    summary: 'CSS Scroll Snap tạo hiệu ứng cuộn bắt dính từng trang hoặc từng card tự nhiên (như Carousel / Slider trên Mobile) hoàn toàn bằng CSS mà không cần cài thêm bất kỳ thư viện JavaScript nặng nề nào.',
    deepDive: 'Cấu hình gồm 2 bước: (1) Trên container đặt `scroll-snap-type: x mandatory` (bắt buộc dính theo trục ngang); (2) Trên từng item con đặt `scroll-snap-align: start` hoặc `center`. Kết hợp với `overscroll-behavior-x: contain` để ngăn chặn hiệu ứng giật thanh cuộn toàn trang.',
    codeExample: `.carousel-container {
  display: flex;
  overflow-x: auto;
  scroll-snap-type: x mandatory; /* Bắt dính trên trục ngang */
  scroll-behavior: smooth;
  gap: 16px;
}

.carousel-slide {
  flex: 0 0 85%;                 /* Mỗi slide chiếm 85% chiều rộng màn hình */
  scroll-snap-align: center;     /* Neo chính giữa màn hình khi dừng cuộn */
  scroll-snap-stop: always;      /* Tránh lướt qua quá nhanh nhiều slide */
}`
  },

  'css-045': {
    summary: 'Utility-first CSS (như Tailwind CSS) là phương pháp xây dựng giao diện bằng cách kết hợp các class tiện ích nguyên tử có sẵn (`flex`, `pt-4`, `text-center`, `rounded-lg`) trực tiếp trong HTML/JSX thay vì tự đặt tên class ngữ nghĩa theo kiểu truyền thống.',
    deepDive: 'Ưu điểm kỹ thuật: (1) Dung lượng CSS Production cực nhỏ (< 15KB) nhờ JIT Purge chỉ giữ lại những class thực sự dùng; (2) Không còn sợ đổi class ở file này làm hỏng giao diện ở trang khác; (3) Tuân thủ chặt chẽ Design Tokens của hệ thống. Nhược điểm: HTML trông rối mắt khi có quá nhiều class, cần kỹ năng gom component trừu tượng.',
    codeExample: `<!-- Nút bấm xây dựng bằng Tailwind CSS chuẩn Design Tokens -->
<button class="inline-flex items-center justify-center px-4 py-2 text-sm font-semibold text-white transition-colors duration-150 bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50">
  Lưu thay đổi
</button>`
  },

  'css-046': {
    summary: 'CSS Modules là công cụ biên dịch (hỗ trợ sẵn trong Next.js, Vite, Webpack) tự động chuyển đổi tên class CSS thành một chuỗi Hash duy nhất (ví dụ: `Button_btn__a8x9f`), đảm bảo phạm vi style mang tính cục bộ (Local Scope) 100%.',
    deepDive: 'CSS Modules giải quyết triệt để vấn đề va chạm tên class toàn cục (Global Scope Pollution) của CSS truyền thống. Lập trình viên có thể thoải mái đặt các tên class ngắn gọn và tự nhiên như `.title`, `.header`, `.active` trong file `Button.module.css` mà không lo bị xung đột với `.title` của file `Card.module.css`.',
    codeExample: `/* Button.module.css */
.primaryButton {
  background-color: #3b82f6;
  color: #ffffff;
  padding: 8px 16px;
  border-radius: 6px;
}

// Button.tsx: Tên class sau khi compile biến thành .Button_primaryButton__d92ka
import styles from './Button.module.css';

export function Button() {
  return <button className={styles.primaryButton}>Đồng ý</button>;
}`
  },

  'css-047': {
    summary: 'CSS-in-JS (Styled-components, Emotion) cho phép viết code CSS trực tiếp bên trong file JavaScript/TypeScript bằng Template Literals. Ưu điểm: Đóng gói style chặt chẽ theo component, dynamic style theo props; Nhược điểm: Chi phí Runtime đắt đỏ (gây nghẽn CPU khi tính toán style) và không tương thích tốt với React Server Components (RSC).',
    deepDive: 'Xu hướng hiện đại đang chuyển dịch mạnh mẽ từ Runtime CSS-in-JS sang **Zero-Runtime CSS-in-JS** (như Vanilla Extract, Panda CSS, StyleX): Toàn bộ code CSS viết bằng TypeScript được trích xuất thành file `.css` tĩnh ngay trong lúc Build, vừa có type-safe tuyệt đối vừa có hiệu năng render siêu tốc.',
    codeExample: `// Styled-components: Dynamic styling dựa theo Props
import styled from 'styled-components';

interface ButtonProps {
  $variant?: 'primary' | 'danger';
}

export const StyledButton = styled.button<ButtonProps>\`
  padding: 10px 20px;
  border-radius: 8px;
  font-weight: 600;
  background-color: \${props => props.$variant === 'danger' ? '#ef4444' : '#3b82f6'};
  color: white;
\`;`
  },

  'css-048': {
    summary: 'Critical CSS là lượng CSS tối thiểu cần thiết để render phần giao diện hiển thị đầu tiên của màn hình (Above-the-fold) khi người dùng vừa vào trang web. Được nhúng trực tiếp (Inline) vào thẻ `<style>` trong `<head>` để loại bỏ Round-trip chặn hiển thị (Render-blocking Resource).',
    deepDive: 'Trình duyệt mặc định sẽ chặn render HTML cho đến khi tải và phân tích cú pháp xong toàn bộ các file CSS bên ngoài (`<link rel="stylesheet">`). Bằng cách inline Critical CSS (~10-20KB) và tải không đồng bộ lượng CSS còn lại (`media="print" onload="this.media=\\\'all\\\'"`), chỉ số First Contentful Paint (FCP) có thể giảm từ 2.5s xuống dưới 0.6s.',
    codeExample: `<head>
  <!-- 1. Inline Critical CSS: Render trang lập tức trong khung nhìn đầu tiên -->
  <style>
    body { margin: 0; font-family: system-ui; }
    .header { height: 60px; background: #0f172a; }
    .hero-banner { min-height: 400px; padding: 40px; }
  </style>

  <!-- 2. Tải Non-Critical CSS không chặn render màn hình -->
  <link rel="preload" href="/styles/non-critical.css" as="style" onload="this.onload=null;this.rel='stylesheet'">
  <noscript><link rel="stylesheet" href="/styles/non-critical.css"></noscript>
</head>`
  },

  'css-049': {
    summary: 'Thuộc tính `font-display` trong `@font-face` kiểm soát cách hiển thị chữ trong lúc font chữ tùy chỉnh (Custom Web Font) đang được tải từ mạng: `swap` (hiển thị ngay font dự phòng, tráo đổi khi font xịn tải xong); `optional` (dùng font mạng nếu tải xong < 100ms, nếu không thì dùng font máy); `block` (ẩn chữ tối đa 3s chờ font); `fallback` (ẩn chữ 100ms rồi dùng fallback).',
    deepDive: 'Sự đánh đổi: `font-display: swap` giải quyết triệt để lỗi "Flash of Invisible Text (FOIT)", giúp người dùng đọc được nội dung ngay, nhưng có thể gây hiện tượng "Flash of Unstyled Text (FOUT)" và làm nhảy layout (CLS) nếu font fallback có kích thước khác font tải về. Giải pháp hiện đại là dùng `size-adjust`, `ascent-override` để tinh chỉnh font fallback trùng khớp 100% với webfont.',
    codeExample: `@font-face {
  font-family: 'Inter';
  src: url('/fonts/Inter.woff2') format('woff2');
  font-weight: 400 700;
  font-display: swap; /* Ưu tiên hiển thị chữ lập tức, chống màn hình trắng */
}`
  },

  'css-050': {
    summary: '`backdrop-filter` áp dụng các bộ lọc đồ họa (phổ biến nhất là làm mờ `blur()`, tăng sáng `brightness()`, tương phản `contrast()`) lên **vùng giao diện nằm phía sau phần tử**, tạo hiệu ứng kính mờ (Glassmorphism / Frosted Glass).',
    deepDive: 'Khác với `filter` (áp dụng lên chính bản thân phần tử và nội dung con của nó), `backdrop-filter` chỉ tác động lên những gì nằm bên dưới nó. Để hiệu ứng hiển thị: Phần tử bắt buộc phải có màu nền trong suốt một phần (bán trong suốt, ví dụ `rgba(255, 255, 255, 0.7)`). Lưu ý: Thuộc tính này tạo ra một Stacking Context mới và đòi hỏi GPU rendering cao.',
    codeExample: `/* Thanh Navigation mờ đục chuẩn phong cách Glassmorphism iOS / macOS */
.glass-navbar {
  position: sticky;
  top: 0;
  background-color: rgba(255, 255, 255, 0.75); /* Bán trong suốt */
  backdrop-filter: blur(12px) saturate(180%);     /* Làm mờ các layer trượt bên dưới */
  -webkit-backdrop-filter: blur(12px) saturate(180%);
  border-bottom: 1px solid rgba(255, 255, 255, 0.3);
}`
  },

  'css-051': {
    summary: 'Cắt ngắn văn bản hiển thị dấu ba chấm (`...`): **Một dòng**: Dùng bộ ba `white-space: nowrap; overflow: hidden; text-overflow: ellipsis;`; **Nhiều dòng (Multi-line)**: Dùng thuộc tính chuẩn hóa `-webkit-line-clamp: 3; display: -webkit-box; -webkit-box-orient: vertical; overflow: hidden;`.',
    deepDive: 'Cạm bẫy phổ biến trong Flexbox / Grid: Khi phần tử cha là flex/grid item, nó có mặc định `min-width: auto`. Nếu đặt ellipsis cho thẻ con, thẻ con vẫn sẽ phình to phá vỡ layout. Bắt buộc phải thêm `min-width: 0` vào flex item cha để cơ chế cắt chữ `text-overflow: ellipsis` hoạt động chính xác.',
    codeExample: `/* 1. Cắt ngắn văn bản 1 dòng duy nhất */
.truncate-single {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* 2. Cắt ngắn văn bản tối đa 3 dòng */
.truncate-multi-line {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}`
  },

  'css-052': {
    summary: 'Variable Fonts (Font chữ biến đổi) là công nghệ cho phép đóng gói toàn bộ các biến thể độ đậm (Font Weight: 100-900), độ nghiêng (Slant/Italic) và độ rộng (Width) vào **duy nhất 1 file font (`.woff2`)**, thay vì phải tải 10 file font tĩnh riêng lẻ.',
    deepDive: 'Lợi ích kỹ thuật: Tiết kiệm 80% dung lượng mạng (thay vì tải 6 file font nặng ~300KB, tải 1 file variable ~60KB) và cho phép animate mượt mà độ đậm nhạt bằng CSS Transition (`font-weight: 300` -> `font-weight: 800`). Kiểm soát chi tiết các trục tùy biến thông qua thuộc tính `font-variation-settings`.',
    codeExample: `@font-face {
  font-family: 'RobotoFlex';
  src: url('/fonts/RobotoFlex.woff2') format('woff2-variations');
  font-weight: 100 1000; /* Dải độ đậm liên tục */
}

.heading-interactive {
  font-family: 'RobotoFlex', sans-serif;
  font-weight: 400;
  transition: font-weight 200ms ease;
}
.heading-interactive:hover {
  font-weight: 850; /* Tùy chỉnh độ đậm chính xác đến từng số đơn vị */
}`
  },

  'css-053': {
    summary: 'Media query `prefers-reduced-motion` dùng để phát hiện nếu người dùng đã bật chế độ "Giảm chuyển động" trong cài đặt Trợ năng (Accessibility) của hệ điều hành, giúp bảo vệ những người mắc hội chứng rối loạn tiền đình khỏi cảm giác chóng mặt, buồn nôn khi nhìn các hiệu ứng chuyển động mạnh.',
    deepDive: 'Tiêu chuẩn Web Accessibility (WCAG 2.1) cấp độ AAA yêu cầu bắt buộc phải hỗ trợ `prefers-reduced-motion`. Senior Developer không nhất thiết phải xóa sạch mọi animation, mà có thể thay thế hiệu ứng di chuyển mạnh (Parallax, Zoom, Slide) bằng hiệu ứng chuyển mờ đơn giản (`opacity: fade`).',
    codeExample: `/* Mặc định: Hiệu ứng phóng to trượt vào mạnh mẽ */
.hero-card {
  transition: transform 500ms cubic-bezier(0.34, 1.56, 0.64, 1), opacity 500ms;
}

/* Khi người dùng kích hoạt Giảm chuyển động trong OS: Tắt biến đổi hình học */
@media (prefers-reduced-motion: reduce) {
  .hero-card {
    transition: opacity 200ms ease; /* Chỉ chuyển đổi độ mờ nhẹ */
    transform: none !important;
  }
}`
  },

  'css-054': {
    summary: 'Media query `prefers-color-scheme` cho phép CSS tự động nhận biết hệ thống đang sử dụng giao diện Sáng (`light`) hay Tối (`dark`) để thiết lập bảng màu phù hợp ngay từ lần tải trang đầu tiên mà không cần chờ JavaScript thực thi.',
    deepDive: 'Chiến lược chuẩn sản phẩm: Sử dụng `prefers-color-scheme` làm giá trị mặc định cho biến CSS `:root`, sau đó cho phép người dùng ghi đè thủ công (Override) bằng class `data-theme="dark"` hoặc `.dark` trên thẻ `<html>` thông qua localStorage.',
    codeExample: `/* 1. Mặc định giao diện Sáng */
:root {
  --bg-primary: #ffffff;
  --text-primary: #0f172a;
}

/* 2. Tự động nhận diện Dark Mode từ OS */
@media (prefers-color-scheme: dark) {
  :root:not([data-theme="light"]) {
    --bg-primary: #0f172a;
    --text-primary: #f8fafc;
  }
}

/* 3. Cho phép User ép chuyển giao diện bằng nút Toggle */
[data-theme="dark"] {
  --bg-primary: #0f172a;
  --text-primary: #f8fafc;
}`
  },

  'css-055': {
    summary: 'Thẻ `<picture>` kết hợp `<source>` phục vụ 2 mục đích cốt lõi: (1) **Định dạng ảnh thế hệ mới (Next-Gen Format Negotiation)**: Cung cấp AVIF -> WebP -> JPG; (2) **Chỉ đạo nghệ thuật (Art Direction)**: Cắt cúp khung hình ảnh vuông cho Mobile và ảnh toàn cảnh ngang rộng cho Desktop.',
    deepDive: 'Trình duyệt duyệt qua các thẻ `<source>` từ trên xuống dưới và lấy file đầu tiên mà nó hỗ trợ. Điều này giúp tận dụng định dạng AVIF siêu nhẹ (nhẹ hơn JPG 50%) trên các trình duyệt hiện đại, trong khi các trình duyệt cũ tự động fallback về JPG an toàn.',
    codeExample: `<picture>
  <!-- 1. Phục vụ AVIF siêu nhẹ cho trình duyệt hiện đại -->
  <source type="image/avif" srcset="/banner.avif">
  <!-- 2. Fallback sang WebP -->
  <source type="image/webp" srcset="/banner.webp">
  <!-- 3. Art Direction: Ảnh vuông đặc thù cho Mobile -->
  <source media="(max-width: 600px)" srcset="/banner-mobile-square.jpg">
  <!-- 4. Fallback cuối cùng cho trình duyệt cổ -->
  <img src="/banner-fallback.jpg" alt="Chiến dịch mùa hè" loading="lazy">
</picture>`
  },

  'css-056': {
    summary: 'Khác biệt giữa `box-shadow` và `filter: drop-shadow()`: **`box-shadow`** đổ bóng theo đường viền hình chữ nhật của Box Model (kể cả khi ảnh có nền trong suốt); trong khi **`filter: drop-shadow()`** tính toán kênh Alpha để **đổ bóng bám theo đường viền thực tế của hình vẽ** (ảnh PNG trong suốt, icon SVG, hoặc bong bóng hội thoại có mũi tên).',
    deepDive: 'Hạn chế của `drop-shadow`: Không hỗ trợ tham số `spread-radius` (bán kính lan tỏa) và từ khóa `inset` (bóng đổ vào trong) như `box-shadow`. Tuy nhiên, `drop-shadow()` là giải pháp duy nhất tạo được bóng đổ tự nhiên cho icon SVG và Tooltip mũi nhọn.',
    codeExample: `/* 1. box-shadow: Đổ bóng cả khung chữ nhật bên ngoài */
.icon-box-shadow {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}

/* 2. drop-shadow: Đổ bóng chuẩn xác bám sát từng nét vẽ của logo PNG trong suốt */
.icon-transparent-png {
  filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.25));
}`
  },

  'css-057': {
    summary: 'Breakpoints **BẮT BUỘC NÊN ĐẶT THEO NỘI DUNG (Content-driven Breakpoints)**, không nên đặt theo thiết bị cụ thể (Device-driven: 375px iPhone, 768px iPad). Lý do: Thiết bị mới ra mắt liên tục với hàng trăm kích thước màn hình khác nhau, đặt breakpoint theo thiết bị sẽ nhanh chóng lỗi thời.',
    deepDive: 'Quy trình chuẩn: Bắt đầu từ màn hình nhỏ (Mobile-first), kéo giãn dần trình duyệt sang ngang. Khi nào giao diện bắt đầu "gãy" (dòng chữ quá dài khó đọc, khoảng trống thừa quá rộng, ảnh bị méo) thì ĐÓ CHÍNH LÀ ĐIỂM CẦN ĐẶT BREAKPOINT. Dù vậy, trong Design System vẫn cần một bộ 4-5 mốc tiêu chuẩn (sm: 640px, md: 768px, lg: 1024px, xl: 1280px) để duy trì tính đồng nhất.',
    codeExample: `/* Thang Breakpoints tiêu chuẩn của Design System hiện đại */
$breakpoints: (
  'sm': 640px,  // Mobile lớn
  'md': 768px,  // Tablet
  'lg': 1024px, // Laptop
  'xl': 1280px, // Desktop
  '2xl': 1536px // Màn hình lớn
);`
  },

  'css-058': {
    summary: 'Composite Layers là các lớp đồ họa độc lập được trình duyệt đưa lên phần cứng GPU để tổng hợp thành hình ảnh cuối cùng hiển thị trên màn hình. Khi một phần tử nằm trên Composite Layer riêng, việc animate nó diễn ra hoàn toàn trên GPU mà không kích hoạt chu kỳ tính toán lại layout (Reflow) hay vẽ lại (Repaint) trên CPU chính.',
    deepDive: 'Các thuộc tính tự động kích hoạt tạo Composite Layer: `transform: translate3d()`, `will-change: transform`, `opacity` kết hợp animation, và các thẻ `<video>`, `<canvas>`. Lạm dụng quá nhiều layer sẽ gây lỗi **Layer Explosion** (Cạn kiệt bộ nhớ VRAM của GPU trên điện thoại tầm trung), khiến máy bị đơ lag.',
    codeExample: `/* Kỹ thuật kích hoạt Composite Layer an toàn trên GPU */
.smooth-sidebar {
  /* Ép trình duyệt tạo Layer GPU riêng để cuộn và trượt mượt mà 60-120fps */
  transform: translateZ(0);
  backface-visibility: hidden;
}`
  },

  'css-059': {
    summary: 'Các hàm toán học trong CSS: **`calc()`** thực hiện các phép tính cộng/trừ/nhân/chia giữa các đơn vị khác nhau (`100% - 32px`); **`min(a, b)`** chọn giá trị nhỏ nhất trong danh sách; **`max(a, b)`** chọn giá trị lớn nhất; **`clamp(min, val, max)`** giới hạn giá trị trong khoảng an toàn.',
    deepDive: 'Điểm mạnh: Cả 4 hàm đều hỗ trợ trộn lẫn các đơn vị khác nhau (`rem`, `px`, `vw`, `%`). Trong `calc()`, toán tử `+` và `-` bắt buộc phải có khoảng trắng ở hai bên (`calc(100% - 20px)`), nếu viết liền `calc(100%-20px)` sẽ bị lỗi cú pháp.',
    codeExample: `.container {
  /* Chiều rộng tối đa 1200px nhưng không bao giờ tràn màn hình có margin 20px mỗi bên */
  width: min(1200px, 100% - 40px);
  margin-inline: auto;
}`
  },

  'css-060': {
    summary: 'Không gian màu **`oklch()`** vượt trội hơn `hsl()` trong Design System vì nó đạt chuẩn **Tính đồng nhất tri giác (Perceptual Uniformity)**: Cùng một giá trị độ sáng $L$ trong OKLCH, mắt người cảm nhận độ sáng hoàn toàn như nhau trên mọi dải màu, trong khi HSL bị sai lệch độ sáng nghiêm trọng.',
    deepDive: 'Lỗi chí mạng của HSL: Màu vàng `hsl(60, 100%, 50%)` mắt người thấy sáng chói như màu trắng, trong khi màu xanh lam `hsl(240, 100%, 50%)` lại tối đen như màu mực dù cả hai đều có $L = 50\\%$. Điều này khiến việc tạo bảng màu Accessible (đảm bảo độ tương phản WCAG 4.5:1) bằng HSL là bất khả thi. OKLCH giải quyết triệt để vấn đề này và hỗ trợ dải màu rộng P3 (Wide-Gamut Colors) trên màn hình Retina.',
    codeExample: `/* OKLCH: Độ sáng L = 0.6 đảm bảo tương phản đồng nhất cho mọi tông màu */
:root {
  --blue-primary: oklch(0.6 0.18 250);
  --yellow-warning: oklch(0.6 0.18 85); /* Cùng L = 0.6 nên độ tương phản văn bản chuẩn xác */
  --green-success: oklch(0.6 0.18 145);
}`
  },

  'css-061': {
    summary: 'Best Practices triển khai Dark Mode: (1) Sử dụng biến CSS Semantic (`--bg-surface`, `--text-primary`); (2) Ngăn chặn nhấp nháy màu lúc tải trang (**FOUC - Flash of Unstyled Content**) bằng đoạn script đồng bộ siêu nhỏ đặt ngay đầu thẻ `<head>`; (3) Giảm nhẹ độ tương phản trên dark mode (dùng màu xám đậm `#121212` thay vì đen tuyền `#000000` để đỡ mỏi mắt).',
    deepDive: 'Lỗi FOUC xảy ra khi trang web mặc định là Light mode, sau khi React nạp xong mới đọc `localStorage` và chuyển sang Dark: Màn hình người dùng bị chớp trắng 1 lần. Giải pháp chuẩn: Đặt 1 thẻ `<script>` không đồng bộ (blocking script nhỏ 5 dòng) đọc `localStorage` và gắn class `.dark` vào `document.documentElement` trước khi trình duyệt kịp render body.',
    codeExample: `<!-- Đặt trong <head> để ngăn chặn triệt để hiện tượng nháy màu (Zero-FOUC) -->
<script>
  (function() {
    const theme = localStorage.getItem('theme') || 
      (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    if (theme === 'dark') document.documentElement.classList.add('dark');
  })();
</script>`
  },

  'css-062': {
    summary: 'Thuộc tính `touch-action` chỉ định cách trình duyệt xử lý cử chỉ chạm cảm ứng trên màn hình di động: `manipulation` (loại bỏ độ trễ 300ms khi bấm nút bằng cách tắt cử chỉ double-tap to zoom); `none` (tắt mọi cử chỉ cuộn mặc định để vẽ trên Canvas); `pan-y` (chỉ cho phép cuộn dọc, chặn cuộn ngang).',
    deepDive: 'Trước đây trên mobile web, trình duyệt luôn chờ 300ms sau cú tap đầu tiên để xem người dùng có tap lần 2 (double-tap zoom) hay không, khiến nút bấm có cảm giác chậm trễ. Thêm `touch-action: manipulation` lên toàn bộ `button` và thẻ `a` giúp phản hồi tap tức thì mà không cần dùng thư viện FastClick cổ điển.',
    codeExample: `/* Tối ưu phản hồi cảm ứng cho toàn bộ tương tác trên Mobile */
button, a, input, [role="button"] {
  touch-action: manipulation; /* Triệt tiêu hoàn toàn 300ms click delay */
}

/* Khu vực vẽ Canvas hoặc Vuốt ảnh Custom */
.signature-pad {
  touch-action: none; /* Trình duyệt không tự ý cuộn trang khi vẽ */
}`
  },

  'css-063': {
    summary: 'Flexbox vs CSS Grid: **Flexbox** là bố cục 1 chiều (One-Dimensional: hoặc theo hàng hoặc theo cột), định hướng theo nội dung (Content-first); **CSS Grid** là bố cục 2 chiều (Two-Dimensional: kiểm soát đồng thời cả hàng và cột), định hướng theo lưới bố cục (Layout-first).',
    deepDive: 'Quy tắc quyết định: Sử dụng **CSS Grid** cho cấu trúc khung lớn của toàn trang (Page layouts, Dashboard cards ma trận, bộ sưu tập ảnh). Sử dụng **Flexbox** cho các thành phần con cục bộ bên trong (Thanh Navbar, nhóm icon + text, badge, form inline). Cả hai sinh ra để bổ trợ cho nhau, không phải để loại trừ nhau.',
    codeExample: `/* Phối hợp hoàn hảo giữa Grid (khung lớn) và Flexbox (thành phần nhỏ) */
.dashboard-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); /* Grid 2 chiều */
  gap: 24px;
}

.dashboard-card-header {
  display: flex; /* Flexbox 1 chiều căn logo và nút đóng */
  justify-content: space-between;
  align-items: center;
}`
  },

  'css-064': {
    summary: 'Block Formatting Context (BFC) là một vùng hiển thị độc lập của tài liệu web, trong đó các phần tử được sắp xếp theo quy tắc dòng chảy khối. Đặc tính quan trọng: BFC chứa trọn các phần tử trôi nổi bên trong (Clearing Floats) và **Ngăn chặn hiện tượng Margin Collapsing với các phần tử bên ngoài**.',
    deepDive: 'Cách kích hoạt BFC chuẩn hiện đại nhất là **`display: flow-root`** (chuẩn W3C mới, không gây tác dụng phụ). Các kỹ thuật cũ như `overflow: hidden` hoặc `float: left` dễ gây cắt mất dropdown hoặc tooltip nằm tràn ra ngoài.',
    codeExample: `/* ✅ Chuẩn hiện đại: Kích hoạt BFC không tác dụng phụ để ôm trọn float và chặn margin collapsing */
.container-bfc {
  display: flow-root; /* Thay thế hoàn toàn clearfix cũ */
}`
  },

  'css-065': {
    summary: 'Margin Collapsing là hiện tượng lề trên và lề dưới (Vertical Margins) của hai khối phần tử nằm liền kề nhau bị sáp nhập thành một lề duy nhất, bằng **giá trị lớn nhất giữa hai lề** thay vì cộng dồn (Margin 20px và 30px sáp nhập thành 30px, không phải 50px).',
    deepDive: 'Quy tắc sáp nhập lề: (1) Hai lề dương: Lấy số lớn nhất (`max(20, 30) = 30px`); (2) Một dương một âm: Lấy số dương trừ trị tuyệt đối số âm (`30px + (-10px) = 20px`); (3) Hai lề âm: Lấy số âm lớn nhất (`min(-20, -30) = -30px`). Lưu ý: Margin ngang (Horizontal Margins) TUYỆT ĐỐI KHÔNG BAO GIỜ bị collapsing.',
    codeExample: `/* Margin Collapsing giữa 2 khối liền kề */
.block-one { margin-bottom: 30px; }
.block-two { margin-top: 20px; }
/* Khoảng cách thực tế giữa block-one và block-two trên màn hình là 30px */`
  },

  'css-066': {
    summary: 'Để layout Dashboard responsive mà không thay đổi một dòng HTML: Sử dụng `grid-template-areas`. Trên màn hình lớn bố trí các vùng phân tán (Sidebar, Main, Header); Trên màn hình nhỏ di động, viết lại chuỗi `grid-template-areas` thành một cột duy nhất theo đúng thứ tự mong muốn.',
    deepDive: 'Sức mạnh lớn nhất của kỹ thuật này là khả năng tái cấu trúc thứ tự trực quan (Visual Reordering) mà không phá vỡ thứ tự cây DOM gốc của HTML, đảm bảo tính tiếp cận của các thiết bị đọc màn hình (Screen Readers).',
    codeExample: `.dashboard {
  display: grid;
  grid-template-areas:
    "sidebar header"
    "sidebar main";
}

@media (max-width: 768px) {
  .dashboard {
    /* Đổi trật tự hoàn toàn trên Mobile: Header lên đầu, rồi tới Main, Sidebar xuống cuối */
    grid-template-areas:
      "header"
      "main"
      "sidebar";
  }
}`
  },

  'css-067': {
    summary: '`z-index` không có tác dụng thường do 2 nguyên nhân: (1) Phần tử đang có `position: static` (mặc định); (2) Phần tử bị giam giữ trong một **Stacking Context riêng biệt của thẻ cha** có mức ưu tiên thấp hơn.',
    deepDive: 'Các thuộc tính vô tình tạo ra Stacking Context mới: `opacity < 1`, `transform` khác `none`, `filter` khác `none`, `clip-path`, `will-change`. Khi thẻ cha đã tạo Stacking Context với `z-index: 1`, thì phần tử con dù đặt `z-index: 999999` cũng không thể nào vượt lên đè một phần tử khác ngoài cha có `z-index: 2`. Giải pháp: Dùng `isolation: isolate` để kiểm soát ngữ cảnh có chủ đích.',
    codeExample: `/* ✅ Giải pháp: isolation: isolate tạo Stacking Context an toàn */
.card-wrapper {
  isolation: isolate; /* Đảm bảo z-index nội bộ của card không rò rỉ ra ngoài */
}`
  },

  'css-068': {
    summary: 'CSS Reset (như Reset CSS của Eric Meyer) xóa sổ toàn bộ kiểu dáng mặc định của trình duyệt về 0 (xóa hết margin, padding, list-style, đưa font-size về 100%); trong khi **Normalize.css** bảo tồn các kiểu mặc định hữu ích (như in đậm thẻ b, font-size thẻ h1) và chỉ tập trung sửa các lỗi sai lệch hiển thị giữa các trình duyệt.',
    deepDive: 'Xu hướng hiện đại (Modern CSS Reset) kết hợp điểm mạnh của cả hai: Vẫn giữ box-sizing `border-box`, bỏ margin trên body, đảm bảo ảnh responsive, nhưng bảo tồn các giá trị mặc định của form và text typography để tránh phải viết lại CSS từ đầu.',
    codeExample: `/* Modern CSS Reset chuẩn 2026 */
*, *::before, *::after {
  box-sizing: border-box;
  margin: 0;
}
body {
  line-height: 1.5;
  -webkit-font-smoothing: antialiased;
}
img, picture, video, canvas, svg {
  display: block;
  max-width: 100%;
}`
  }
};

let count = 0;
data.forEach(q => {
  if (batch2Updates[q.id]) {
    const u = batch2Updates[q.id];
    q.seniorAnswer.summary = u.summary;
    q.seniorAnswer.deepDive = u.deepDive;
    q.seniorAnswer.codeExample = u.codeExample;
    count++;
  }
});

fs.writeFileSync(filePath, JSON.stringify(data, null, 2) + '\n', 'utf8');
console.log(`Updated ${count} questions in Batch 2 of CSS Bank.`);
