import fs from 'node:fs';
import path from 'node:path';

const filePath = path.resolve('src/features/interview/data/json/css-bank.json');
const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));

const batch2 = {
  'css-037': {
    interviewerIntent: 'Đánh giá khả năng trực quan hóa layout bằng `grid-template-areas`: Tách biệt hoàn toàn việc cấu trúc vùng hiển thị trong CSS khỏi thứ tự thẻ trong HTML.',
    contextOrScenario: 'Thiết kế trang Dashboard quản trị: Header ở trên cùng, Sidebar bên trái, Main Content ở giữa, Widget phụ bên phải và Footer ở dưới cùng. Khi chuyển sang mobile, Sidebar và Widget phụ tự động dồn xuống dưới mà không cần sửa 1 dòng code HTML.',
    expectedKeywords: ['grid-template-areas', 'grid-area', 'Visual ASCII Layout', 'Responsive Reordering', 'Empty Cells (.)', 'Named Grid Areas'],
    pitfalls: [
      'Tạo ra một ma trận không phải hình chữ nhật (CSS Grid cấm tạo vùng hình chữ L hoặc hình chữ T bằng `grid-template-areas`).',
      'Số lượng cột giữa các hàng không bằng nhau, khiến toàn bộ thuộc tính `grid-template-areas` bị coi là không hợp lệ (Invalid value).',
      'Quên gán `grid-area: <name>` cho các phần tử con tương ứng.'
    ],
    followUpQuestions: [
      'Dấu chấm `.` trong cú pháp `grid-template-areas` đại diện cho điều gì (ô rỗng không có nội dung)?',
      'Làm thế nào để thay đổi toàn bộ bố cục Dashboard từ 3 cột sang 1 cột trên Mobile chỉ bằng 1 dòng khai báo `grid-template-areas` trong Media Query?'
    ]
  },

  'css-038': {
    interviewerIntent: 'Kiểm tra kỹ năng tính toán linh hoạt (Fluid Typography & Fluid Sizing): Ứng dụng hàm `clamp(min, val, max)` để cỡ chữ và khoảng cách tự động co giãn theo Viewport mà không cần hàng chục Media Queries.',
    contextOrScenario: 'Thiết kế tiêu đề Hero Banner: Cần cỡ chữ tối thiểu 24px trên mobile, tối đa 64px trên màn hình 4K, và ở giữa thì co giãn mượt mà theo `5vw`. Lập trình viên trước đây phải viết 5 media queries ngắt quãng để chỉnh font-size.',
    expectedKeywords: ['clamp() function', 'Fluid Typography', 'Viewport Units (vw/vh)', 'Minimum and Maximum Bounds', 'Accessible Zoom Safety', 'Eliminating Media Queries'],
    pitfalls: [
      'Chỉ dùng thuần túy `vw` (ví dụ: `font-size: 5vw`): Người dùng khiếm thị khi bấm Zoom trên trình duyệt (Ctrl +) cỡ chữ sẽ KHÔNG to lên, vi phạm nghiêm trọng tiêu chí WCAG 1.4.4.',
      'Không kết hợp `rem` với `vw` trong tham số ở giữa (công thức chuẩn phải là `clamp(1.5rem, 1rem + 2vw, 4rem)`).',
      'Đặt giá trị `min` lớn hơn giá trị `max` khiến hàm clamp bị trả về giá trị sàn mặc định.'
    ],
    followUpQuestions: [
      'Tại sao công thức `clamp(min, rem + vw, max)` bảo đảm khả năng tiếp cận (Accessibility) khi người dùng phóng to thu nhỏ trình duyệt?',
      'Làm thế nào để áp dụng `clamp()` cho thuộc tính `padding` và `gap` để tạo ra Fluid Spacing System?'
    ]
  },

  'css-039': {
    interviewerIntent: 'Đo lường mức độ tiếp cận các chuẩn mực CSS hiện đại nhất (CSS Container Queries): Hiểu rõ cuộc cách mạng từ Responsive theo Viewport sang Responsive theo chính kích thước của Container chứa component.',
    contextOrScenario: 'Một component Card sản phẩm được dùng ở cả 3 nơi: (1) Cột hẹp trong Sidebar 300px; (2) Lưới 3 cột ở Trang chủ 600px; (3) Banner full-width 1200px. Nếu dùng Media Queries theo màn hình, Card trong Sidebar luôn bị vỡ vì màn hình vẫn là 1920px nhưng Sidebar chỉ có 300px.',
    expectedKeywords: ['Container Queries (@container)', 'container-type: inline-size', 'container-name', 'Component-Driven Responsive', 'Viewport Independence', 'Container Query Units (cqw/cqh)'],
    pitfalls: [
      'Quên khai báo `container-type: inline-size` trên phần tử cha trước khi viết `@container` trên phần tử con.',
      'Sử dụng `container-type: size` khiến container đòi hỏi phải có chiều cao xác định trước, dễ gây xung đột chiều cao (Infinite layout loop).',
      'Viết quy tắc `@container` tác động lên chính phần tử container cha thay vì các phần tử con bên trong nó.'
    ],
    followUpQuestions: [
      'Đơn vị `cqw` (Container Query Width) khác gì so với `vw` (Viewport Width)?',
      'Container Style Queries (`@container style(...)`) mở ra khả năng style component dựa trên thuộc tính hoặc biến CSS của phần tử cha như thế nào?'
    ]
  },

  'css-040': {
    interviewerIntent: 'Kiểm tra kỹ năng tối ưu hóa hiệu năng tải trang (Web Performance Optimization): Nắm vững cơ chế ảnh đáp ứng (Responsive Images) thông qua thuộc tính `srcset` và `sizes`.',
    contextOrScenario: 'Trang web thương mại điện tử tải ảnh banner 5MB (độ phân giải 4000x2000px) xuống điện thoại 3G của người dùng, khiến chỉ số Largest Contentful Paint (LCP) mất tới 6 giây và tốn dung lượng của khách hàng.',
    expectedKeywords: ['srcset attribute', 'sizes attribute', 'Pixel Density Descriptor (2x, 3x)', 'Width Descriptor (w units)', 'Largest Contentful Paint (LCP)', 'Browser Pre-parser'],
    pitfalls: [
      'Khai báo `srcset` bằng các file có kích thước khác nhau nhưng quên khai báo thuộc tính `sizes`: Trình duyệt sẽ mặc định coi ảnh luôn chiếm `100vw`, dẫn đến việc tải ảnh to hơn mức cần thiết.',
      'Nhầm lẫn giữa `sizes` (mô tả kích thước HIỂN THỊ của ảnh trên layout) và Media Queries trong CSS.',
      'Không tối ưu hóa định dạng ảnh hiện đại (như WebP/AVIF) khi phân phối qua `srcset`.'
    ],
    followUpQuestions: [
      'Thuật toán của trình duyệt: Làm thế nào trình duyệt nhân kích thước trong `sizes` với Device Pixel Ratio (DPR) để chọn file ảnh tối ưu nhất trong `srcset`?',
      'Tại sao việc dùng `<img>` với `srcset` cho phép trình duyệt Pre-parser phát hiện và tải ảnh sớm hơn nhiều so với việc tải ảnh qua CSS `background-image`?'
    ]
  },

  'css-041': {
    interviewerIntent: 'Đánh giá hiểu biết về CSS Animations: Cú pháp `@keyframes`, các thuộc tính timing functions, và phân biệt giữa thuộc tính kích hoạt GPU Composting vs Layout Reflow.',
    contextOrScenario: 'Lập trình viên viết hiệu ứng trượt Sidebar bằng cách animate thuộc tính `left: 0 -> left: -300px` hoặc `width`. Kết quả hiệu ứng bị giật lag, tụt khung hình (Frame Drop) dưới 30fps trên điện thoại.',
    expectedKeywords: ['@keyframes', 'animation-fill-mode: forwards', 'GPU Acceleration', 'transform & opacity', 'Layout / Reflow vs Composite', 'cubic-bezier timing'],
    pitfalls: [
      'Animate các thuộc tính hình học Box Model (như `top`, `left`, `width`, `height`, `margin`): Kích hoạt quy trình Reflow và Repaint trên từng khung hình, làm nghẽn CPU.',
      'Quên thuộc tính `animation-fill-mode: forwards`, khiến phần tử sau khi chạy xong animation bị nhảy giật ngược lại trạng thái ban đầu.',
      'Lạm dụng hiệu ứng chạy vô tận (`animation-iteration-count: infinite`) trên nhiều phần tử làm nóng máy và ngốn pin thiết bị di động.'
    ],
    followUpQuestions: [
      'Tại sao chỉ nên animate 2 thuộc tính duy nhất là `transform` và `opacity` để đạt chuẩn 60fps mượt mà?',
      'Các giá trị của `animation-fill-mode` (none, forwards, backwards, both) điều khiển trạng thái phần tử trước và sau khi chạy animation như thế nào?'
    ]
  },

  'css-042': {
    interviewerIntent: 'Kiểm tra sự am hiểu sâu sắc về tầng đồ họa phần cứng của trình duyệt (Hardware Acceleration): Cách thức hoạt động của thuộc tính `will-change` và các tác hại nghiêm trọng khi lạm dụng.',
    contextOrScenario: 'Một lập trình viên nghe nói `will-change: transform` giúp animation mượt hơn, bèn gắn `* { will-change: transform; }` lên toàn bộ phần tử của trang web. Hậu quả là trang web ngốn sạch 2GB bộ nhớ RAM của máy tính và bị crash.',
    expectedKeywords: ['will-change property', 'Hardware Acceleration', 'Graphics Layer / Compositing Layer', 'VRAM Consumption', 'Premature Optimization Trap', 'Lifecycle Management (Add/Remove on Hover)'],
    pitfalls: [
      'Gắn `will-change` vĩnh viễn trên hàng loạt phần tử trong file CSS: Trình duyệt phải tạo và duy trì hàng trăm Compositing Layers trên bộ nhớ VRAM của GPU, gây cạn kiệt tài nguyên đồ họa.',
      'Dùng `will-change` để sửa lỗi giật lag mà không tìm nguyên nhân gốc rễ (như việc animate nhầm thuộc tính `width/top`).',
      'Không biết rằng `will-change` tạo ra một Stacking Context mới, có thể làm thay đổi thứ tự hiển thị của `z-index`.'
    ],
    followUpQuestions: [
      'Quy tắc vàng khi sử dụng `will-change`: Tại sao nên kích hoạt `will-change` khi người dùng hover/focus và xóa bỏ ngay sau khi animation kết thúc?',
      'Cách kiểm tra số lượng Compositing Layers thực tế bằng công cụ "Layers" trong Chrome DevTools?'
    ]
  },

  'css-043': {
    interviewerIntent: 'Đánh giá tư duy thiết kế quốc tế hóa (Internationalization - i18n): Nắm vững các thuộc tính logic trong CSS (CSS Logical Properties: Inline vs Block, Start vs End) hỗ trợ giao diện đa ngôn ngữ (LTR vs RTL).',
    contextOrScenario: 'Ứng dụng cần hỗ trợ thị trường Trung Đông (ngôn ngữ tiếng Ả Rập - Arabic viết từ phải sang trái - RTL). Nếu dùng thuộc tính vật lý cổ điển như `margin-left: 20px` và `text-align: left`, khi đổi ngôn ngữ toàn bộ icon và lề bị ngược hoàn toàn, phải viết thêm một file CSS RTL riêng biệt để đè từng thuộc tính.',
    expectedKeywords: ['CSS Logical Properties', 'Inline vs Block Axis', 'Writing Modes (horizontal-tb, vertical-rl)', 'padding-inline vs padding-block', 'start and end (margin-inline-start)', 'RTL / LTR Internationalization'],
    pitfalls: [
      'Tiếp tục sử dụng các thuộc tính vật lý hướng cứng (`left`, `right`, `top`, `bottom`) cho các dự án đa ngôn ngữ quốc tế.',
      'Nhầm lẫn giữa `block` (chiều dọc theo luồng văn bản, tương đương top/bottom trong tiếng Anh/Việt) và `inline` (chiều ngang theo dòng chữ, tương đương left/right).',
      'Viết mã CSS riêng biệt cho RTL bằng cách ghi đè thủ công hàng trăm dòng thay vì chỉ chuyển sang dùng Logical Properties một lần duy nhất.'
    ],
    followUpQuestions: [
      'Bảng quy đổi tương đương: `margin-inline-start`, `margin-inline-end`, `margin-block-start`, `margin-block-end` ứng với các thuộc tính vật lý nào trong văn bản LTR thông thường?',
      'Thuộc tính `inset` và `inset-inline` thay thế cho bộ tứ `top, right, bottom, left` trong định vị tuyệt đối như thế nào?'
    ]
  },

  'css-044': {
    interviewerIntent: 'Kiểm tra kỹ năng xây dựng trải nghiệm cuộn hiện đại nguyên bản (Native Scroll Experiences): Sử dụng CSS Scroll Snap để làm Carousel / Slider mượt mà mà không cần thư viện JavaScript nặng nề.',
    contextOrScenario: 'Cần làm một Carousel xem danh sách ảnh sản phẩm hoặc một trang Landing Page cuộn từng màn hình toàn cảnh (Full-page Snap Scroll) trên điện thoại di động.',
    expectedKeywords: ['CSS Scroll Snap', 'scroll-snap-type: x mandatory', 'scroll-snap-align: center / start', 'scroll-padding', 'Zero-JS Sliders', 'Native Touch Physics'],
    pitfalls: [
      'Đặt `scroll-snap-type` trên container nhưng quên đặt `scroll-snap-align` trên các phần tử con bên trong (khiến tính năng snap không hoạt động).',
      'Sử dụng `mandatory` một cách cứng nhắc: Khi nội dung của một phần tử dài hơn màn hình, chế độ `mandatory` làm người dùng không thể cuộn xem phần giữa của phần tử đó (bị giật ngược về đầu hoặc cuối).',
      'Không cấu hình `scroll-padding` khi có Fixed Header, khiến phần tử bị snap thụt vào bên dưới Header che khuất nội dung.'
    ],
    followUpQuestions: [
      'Sự khác biệt giữa `scroll-snap-type: x mandatory` và `scroll-snap-type: x proximity` là gì?',
      'Tại sao Carousel làm bằng CSS Scroll Snap lại mượt mà hơn và tiết kiệm pin hơn nhiều so với Carousel viết bằng thư viện JS lắng nghe sự kiện `touchmove`?'
    ]
  },

  'css-045': {
    interviewerIntent: 'Đo lường năng lực đánh giá các phương pháp luận kiến trúc CSS hiện đại: Hiểu bản chất của Utility-First CSS (TailwindCSS), ưu nhược điểm so với Semantic CSS cổ điển.',
    contextOrScenario: 'Đội ngũ kỹ sư tranh luận: Một bên muốn viết CSS theo chuẩn BEM với các class ngữ nghĩa (`.product-card-button-primary`), một bên muốn áp dụng TailwindCSS (`flex items-center justify-between p-4 bg-blue-500 rounded-lg`).',
    expectedKeywords: ['Utility-First CSS', 'TailwindCSS', 'CSS Purging / JIT Engine', 'Design Tokens Constraints', 'Context Switching Reduction', 'HTML Class Verbosity'],
    pitfalls: [
      'Chỉ trích TailwindCSS là "Inline Styles trá hình" mà không hiểu Tailwind hỗ trợ đầy đủ Media Queries, Pseudo-classes (:hover, :focus), CSS Variables và Design Constraints.',
      'Lạm dụng `@apply` trong Tailwind để biến nó quay trở lại thành Semantic CSS, làm mất toàn bộ lợi thế về kích thước file của Utility-first.',
      'Để lộ toàn bộ HTML class dài dòng trong các component lặp lại thay vì đóng gói component trong React/Vue.'
    ],
    followUpQuestions: [
      'Tại sao kích thước file CSS production của TailwindCSS gần như không tăng thêm khi dự án mở rộng từ 10 trang lên 1,000 trang (CSS Size Plateau)?',
      'Engine JIT (Just-in-Time) của TailwindCSS giải quyết bài toán dung lượng CSS trong môi trường phát triển như thế nào?'
    ]
  },

  'css-046': {
    interviewerIntent: 'Kiểm tra hiểu biết về giải pháp cô lập phạm vi CSS (Scoped CSS): Cơ chế hoạt động của CSS Modules và cách công cụ build giải quyết xung đột tên class.',
    contextOrScenario: 'Trong một ứng dụng React/Next.js lớn, hai lập trình viên khác nhau cùng tạo một file style có class `.title { font-size: 24px; color: blue; }`. CSS Modules được sử dụng để đảm bảo style của component này không rò rỉ sang component khác.',
    expectedKeywords: ['CSS Modules', 'Scoped CSS', 'Hashed Class Names', 'Bypassing Specificity Wars', ':global() Escape Hatch', 'Composing Classes (composes)'],
    pitfalls: [
      'Lạm dụng bộ chọn toàn cục `:global(.some-class)` bên trong CSS Modules, vô tình tạo ra các style rò rỉ phá hủy tính đóng gói của component.',
      'Nghĩ rằng CSS Modules ngăn chặn kế thừa CSS: Các thuộc tính có tính kế thừa tự nhiên (như `color`, `font-family`) vẫn kế thừa từ phần tử cha bình thường.',
      'Cố gắng truyền tên class dạng chuỗi tĩnh thay vì lấy từ object import (`className="title"` thay vì `className={styles.title}`).'
    ],
    followUpQuestions: [
      'Cơ chế tạo chuỗi mã băm (Class Hashing: `[name]__[local]___[hash:base64:5]`) của Webpack / Turbopack cho CSS Modules hoạt động ra sao?',
      'Tính năng `composes: baseButton from "./common.module.css"` trong CSS Modules cho phép kế thừa style giữa các file module như thế nào?'
    ]
  },

  'css-047': {
    interviewerIntent: 'Đánh giá kiến thức phân tích trade-offs chuyên sâu về kiến trúc Styling: So sánh CSS-in-JS (Styled-Components, Emotion) với Zero-Runtime CSS (Tailwind, Vanilla Extract, CSS Modules), đặc biệt trong bối cảnh React 19 và Next.js Server Components.',
    contextOrScenario: 'Dự án nâng cấp lên Next.js App Router (React Server Components). Toàn bộ hệ thống component viết bằng Styled-Components bị lỗi do thư viện CSS-in-JS runtime yêu cầu React Context và hook `useInsertionEffect` vốn chỉ chạy được trên Client.',
    expectedKeywords: ['CSS-in-JS', 'Runtime vs Zero-Runtime', 'React Server Components (RSC)', 'Styled-Components / Emotion', 'Performance Overhead (JS Execution)', 'Vanilla Extract / Pigment CSS'],
    pitfalls: [
      'Sử dụng CSS-in-JS có runtime nặng nề trong các trang có hàng nghìn phần tử lặp lại (gây sụt giảm hiệu năng render do JS phải parse và inject thẻ `<style>` liên tục).',
      'Cố gắng dùng runtime CSS-in-JS bên trong React Server Components mà không biến nó thành Client Component (`"use client"`).',
      'Không nhận thức được xu hướng chuyển dịch mạnh mẽ của cộng đồng frontend sang Zero-Runtime CSS từ năm 2023-2026.'
    ],
    followUpQuestions: [
      'Tại sao Runtime CSS-in-JS bị coi là anti-pattern trong kiến trúc React Server Components (RSC)?',
      'Zero-Runtime CSS (như Vanilla Extract hoặc StyleX) biên dịch CSS tại thời điểm build (Build-time) như thế nào để vừa có type-safe vừa có hiệu năng CSS thuần?'
    ]
  },

  'css-048': {
    interviewerIntent: 'Kiểm tra kỹ năng tối ưu hóa lộ trình render quan trọng (Critical Rendering Path): Khái niệm Critical CSS, kỹ thuật Inlining và tối ưu hóa chỉ số First Contentful Paint (FCP).',
    contextOrScenario: 'File `bundle.css` dung lượng 800KB chặn quá trình render của trình duyệt (Render-Blocking Resource). Người dùng vào trang web bị màn hình trắng xóa suốt 3 giây đầu tiên trên mạng 3G.',
    expectedKeywords: ['Critical CSS', 'Render-Blocking CSS', 'Above-the-Fold Content', 'Inline Critical Styles', 'Asynchronous CSS Loading (preload)', 'First Contentful Paint (FCP)'],
    pitfalls: [
      'Nhúng (Inline) toàn bộ file CSS dung lượng lớn vào thẻ `<head>` của HTML (làm phình to kích thước file HTML và mất tác dụng bộ nhớ cache của file CSS tĩnh).',
      'Trích xuất sai Critical CSS khiến nội dung trên màn hình đầu tiên (Above-the-fold) bị giật giao diện không có style (FOUC - Flash of Unstyled Content).',
      'Quên tải không đồng bộ (Asynchronous Loading) phần CSS còn lại (Non-critical CSS) sau khi trang đã render xong phần quan trọng.'
    ],
    followUpQuestions: [
      'Kỹ thuật chuẩn để tải file CSS không quan trọng một cách bất đồng bộ bằng `<link rel="preload" as="style" onload="this.rel=\'stylesheet\'">` hoạt động ra sao?',
      'Cách thức các framework SSR hiện đại (Next.js, Astro) tự động trích xuất và inline Critical CSS cho từng route như thế nào?'
    ]
  },

  'css-049': {
    interviewerIntent: 'Đo lường năng lực tối ưu hóa phông chữ web (Web Font Performance): Hiểu rõ các giá trị của thuộc tính `font-display`, hiện tượng FOIT (Flash of Invisible Text) vs FOUT (Flash of Unstyled Text).',
    contextOrScenario: 'Website sử dụng font chữ tùy chỉnh từ Google Fonts. Khi vào trang trên mạng yếu, toàn bộ chữ trên trang web bị tàng hình vô hình trong suốt 3 giây (FOIT), người dùng không thể đọc được nội dung dù bài viết đã tải xong.',
    expectedKeywords: ['font-display property', 'font-display: swap', 'FOIT (Flash of Invisible Text)', 'FOUT (Flash of Unstyled Text)', 'Cumulative Layout Shift (CLS)', 'font-display: optional'],
    pitfalls: [
      'Để giá trị mặc định `font-display: auto` hoặc `block`: Gây ra hiện tượng chữ bị tàng hình (FOIT) trong tối đa 3 giây khi font đang tải về.',
      'Dùng `font-display: swap` mà không điều chỉnh số đo font dự phòng (Fallback Font Metrics: `size-adjust`, `ascent-override`), gây ra hiện tượng nhảy chữ giật layout (Cumulative Layout Shift - CLS).',
      'Tải quá nhiều biến thể font (Light, Regular, Medium, Bold, Italic) khiến trình duyệt phải tải về hàng chục file `.woff2` nặng hàng Megabytes.'
    ],
    followUpQuestions: [
      'Giá trị `font-display: optional` hoạt động thông minh như thế nào để triệt tiêu 100% hiện tượng nhảy layout CLS trên mạng di động chậm?',
      'Các thuộc tính điều chỉnh font dự phòng mới (`size-adjust`, `ascent-override`) giúp font fallback khớp chính xác kích thước với font tùy chỉnh ra sao?'
    ]
  },

  'css-050': {
    interviewerIntent: 'Kiểm tra kỹ năng tạo hiệu ứng thị giác hiện đại (Modern Visual Effects): Sử dụng `backdrop-filter` cho hiệu ứng Frosted Glass và nhận diện chi phí hiệu năng GPU.',
    contextOrScenario: 'Thiết kế thanh Header Navigation hoặc Modal nền kính mờ kiểu Apple iOS (Glassmorphism): Các phần tử bên dưới Header khi cuộn qua sẽ bị làm mờ một cách đẹp mắt (`backdrop-filter: blur(12px)`).',
    expectedKeywords: ['backdrop-filter: blur()', 'Glassmorphism', 'filter vs backdrop-filter', 'Compositing Layer Cost', 'Fallback Background Color', 'GPU Pixel Shaders'],
    pitfalls: [
      'Nhầm lẫn giữa `filter: blur()` (làm mờ chính phần tử đó và con của nó) và `backdrop-filter: blur()` (làm mờ vùng đồ họa NẰM PHÍA SAU phần tử đó).',
      'Đặt `backdrop-filter` nhưng màu nền lại là màu đục 100% (`background: #ffffff` thay vì `rgba(255, 255, 255, 0.7)`), khiến hiệu ứng mờ phía sau không thể nhìn thấy được.',
      'Lạm dụng `backdrop-filter` trên các container có diện tích lớn đang cuộn nhanh, làm GPU phải tính toán lại shader liên tục gây tụt FPS.'
    ],
    followUpQuestions: [
      'Tại sao bắt buộc phải thêm tiền tố `-webkit-backdrop-filter` để hỗ trợ trình duyệt Safari trên iOS và macOS?',
      'Cách viết fallback màu nền an toàn bằng `@supports not (backdrop-filter: blur(10px))` như thế nào?'
    ]
  },

  'css-051': {
    interviewerIntent: 'Kiểm tra kỹ thuật xử lý cắt ngắn văn bản (Text Truncation): Cắt ngắn văn bản 1 dòng cổ điển vs Cắt ngắn văn bản nhiều dòng bằng `-webkit-line-clamp`.',
    contextOrScenario: 'Trong một thẻ Card tin tức, tiêu đề bài viết chỉ được phép hiển thị tối đa 2 dòng, phần còn lại bị cắt ngắn và hiển thị dấu ba chấm (`...`). Nếu tiêu đề ngắn hơn 2 dòng thì hiển thị tự nhiên.',
    expectedKeywords: ['Text Truncation (Ellipsis)', 'Single-line Truncation (text-overflow: ellipsis)', 'Multi-line Truncation (-webkit-line-clamp)', 'white-space: nowrap', 'overflow: hidden', 'display: -webkit-box'],
    pitfalls: [
      'Cắt 1 dòng: Khai báo `text-overflow: ellipsis` nhưng quên 2 thuộc tính bắt buộc đi kèm là `white-space: nowrap` và `overflow: hidden`.',
      'Cắt nhiều dòng: Quên khai báo `display: -webkit-box; -webkit-box-orient: vertical;` khiến `-webkit-line-clamp` không có tác dụng.',
      'Không đặt `word-break: break-word` hoặc `overflow-wrap: anywhere` cho các từ khóa quá dài không có dấu cách (như URL), làm vỡ khung chứa.'
    ],
    followUpQuestions: [
      'Bộ ba thuộc tính thần thánh để cắt ngắn văn bản 1 dòng là gì?',
      'Tại sao `-webkit-line-clamp` dù có tiền tố `-webkit-` nhưng hiện nay đã được chuẩn hóa và hỗ trợ 100% trên tất cả các trình duyệt hiện đại?'
    ]
  },

  'css-052': {
    interviewerIntent: 'Đánh giá kiến thức về công nghệ phông chữ thế hệ mới (Variable Fonts): Khả năng thay thế hàng chục file font tĩnh bằng một file font duy nhất có trục biến thiên liên tục.',
    contextOrScenario: 'Website cần dùng font Inter với 6 độ dày khác nhau (từ 100 đến 900) kèm hiệu ứng chữ nghiêng. Trước đây phải tải 12 file `.woff2` riêng biệt nặng 1.5MB. Nhóm quyết định chuyển sang dùng Variable Font.',
    expectedKeywords: ['Variable Fonts (OpenType Font Variations)', 'Continuous Weight Axis (wght)', 'font-variation-settings', 'Payload Reduction', 'Smooth Font Transitions', 'Slant and Optical Sizing Axes'],
    pitfalls: [
      'Vẫn sử dụng các mốc số nguyên cách nhau 100 thông thường mà không tận dụng khả năng đặt bất kỳ độ dày nào (ví dụ: `font-weight: 550`).',
      'Lạm dụng thuộc tính cấp thấp `font-variation-settings: "wght" 600` thay vì sử dụng thuộc tính chuẩn `font-weight: 600`.',
      'Tải file Variable Font không được subsetting (chứa cả hàng chục nghìn ký tự của các ngôn ngữ không dùng đến) làm kích thước file vẫn nặng.'
    ],
    followUpQuestions: [
      '5 trục biến thiên chuẩn (Registered Axes: wght, wdth, slnt, ital, opsz) trong Variable Fonts kiểm soát những đặc tính nào của chữ?',
      'Làm thế nào để tạo hiệu ứng chuyển đổi độ dày font chữ mượt mà (Smooth Font Weight Transition on Hover) bằng Variable Fonts mà font tĩnh không làm được?'
    ]
  },

  'css-053': {
    interviewerIntent: 'Kiểm tra nhận thức về Tiêu chuẩn Tiếp cận Web (Accessibility & A11y Standards): Tôn trọng thiết lập của người dùng có hội chứng rối loạn tiền đình thông qua `prefers-reduced-motion`.',
    contextOrScenario: 'Website có nhiều hiệu ứng thị sai (Parallax Scrolling), phóng to thu nhỏ và xoay tròn chuyển động mạnh. Người dùng có vấn đề về thính giác/tiền đình cảm thấy buồn nôn, chóng mặt khi truy cập trang web.',
    expectedKeywords: ['prefers-reduced-motion', 'Vestibular Disorders', 'WCAG 2.3.3 Animation from Interactions', 'Accessible Animations', 'Graceful Motion Reduction', 'Instant Transitions'],
    pitfalls: [
      'Xóa sạch hoàn toàn mọi visual feedback khi có `prefers-reduced-motion` (chuẩn mực là thay thế chuyển động di chuyển mạnh bằng hiệu ứng mờ dần nhẹ nhàng `opacity fade`).',
      'Chỉ tắt animation trong CSS mà quên tắt các hiệu ứng cuộn mượt hoặc carousel tự chạy được điều khiển bằng JavaScript (lắng nghe `window.matchMedia`).',
      'Xem nhẹ `prefers-reduced-motion` và coi nó là tính năng phụ, vi phạm tiêu chuẩn nghiệm thu tiếp cận bắt buộc của các dự án lớn.'
    ],
    followUpQuestions: [
      'Snippet CSS chuẩn toàn cầu để tắt các hiệu ứng chuyển động mạnh cho người dùng: `@media (prefers-reduced-motion: reduce) { *, *::before, *::after { animation-duration: 0.01ms !important; transition-duration: 0.01ms !important; } }` hoạt động ra sao?',
      'Làm thế nào để kiểm tra tính năng `prefers-reduced-motion` ngay trong Chrome DevTools (Rendering Tab -> Emulate CSS media feature)?'
    ]
  },

  'css-054': {
    interviewerIntent: 'Đánh giá khả năng triển khai chế độ nền tối (Dark Mode) cấp hệ thống: Sử dụng media query `prefers-color-scheme` kết hợp CSS Custom Properties.',
    contextOrScenario: 'Cần xây dựng tính năng Dark Mode cho ứng dụng: Khi hệ điều hành đổi sang Dark Mode, trang web lập tức đổi màu nền và màu chữ tương ứng; đồng thời cho phép người dùng ghi đè thủ công (Toggle Switch: Light / Dark / System).',
    expectedKeywords: ['prefers-color-scheme (dark/light)', 'color-scheme property', 'CSS Custom Properties Theming', 'System Preference Detection', 'Zero-Flash Theme Loading', 'Contrast Ratio Compliance'],
    pitfalls: [
      'Tạo 2 file CSS riêng biệt cho Light và Dark mode rồi tải lại trang để đổi theme (chậm chạp và khó bảo trì).',
      'Đổi màu nền sang đen tuyệt đối `#000000` và chữ trắng tuyệt đối `#ffffff`: Gây chói mắt và mỏi mắt nghiêm trọng (Dark mode chuẩn dùng nền xám đậm `#121212` và chữ trắng đục `#e0e0e0`).',
      'Quên thuộc tính CSS `color-scheme: dark light;` khiến các thanh cuộn (Scrollbar) và form controls của hệ thống vẫn giữ nguyên màu trắng bệch.'
    ],
    followUpQuestions: [
      'Thuộc tính CSS `color-scheme: dark;` trên thẻ `:root` giúp đồng bộ thanh cuộn, radio button và checkbox mặc định của trình duyệt sang chế độ tối như thế nào?',
      'Làm thế nào để tránh hiện tượng nhấp nháy giao diện (FOUC - Flash of White Background) khi người dùng reload trang ở chế độ tối?'
    ]
  },

  'css-055': {
    interviewerIntent: 'Kiểm tra kỹ thuật Art Direction trong Responsive Images: Phân biệt rõ sự khác nhau giữa việc đổi ảnh theo kích thước (`<img srcset>`) và việc đổi toàn bộ góc chụp/bố cục ảnh (`<picture><source>`).',
    contextOrScenario: 'Ảnh banner trang chủ: Trên máy tính để bàn (Landscape 16:9) là ảnh góc rộng chụp toàn cảnh sản phẩm. Nhưng trên điện thoại di động (Portrait 9:16), ảnh toàn cảnh bị bé tí không nhìn rõ sản phẩm, cần thay bằng một bức ảnh chụp cận cảnh (Close-up crop) theo chiều dọc.',
    expectedKeywords: ['<picture> element', '<source> element', 'Art Direction', 'Format Switching (AVIF/WebP Fallback)', 'type attribute', 'media attribute'],
    pitfalls: [
      'Dùng thẻ `<picture>` cho bài toán chỉ đơn thuần là co giãn kích thước ảnh (việc này nên dùng `<img srcset>` để trình duyệt tự do lựa chọn cache).',
      'Quên thẻ `<img>` dự phòng cuối cùng bên trong thẻ `<picture>` (nếu không có thẻ `<img>`, toàn bộ thẻ `<picture>` sẽ không hiển thị gì cả).',
      'Sử dụng JavaScript để thay đổi thuộc tính `src` của ảnh khi resize màn hình (vừa chậm vừa làm mất khả năng Pre-load ảnh của trình duyệt).'
    ],
    followUpQuestions: [
      'Kỹ thuật Format Switching: Sử dụng `<picture>` để ưu tiên tải định dạng siêu nén AVIF, fallback sang WebP, và cuối cùng fallback về JPG cho trình duyệt cũ như thế nào?',
      'Tại sao việc cắt cúp nội dung ảnh khác nhau (Art Direction) bắt buộc phải dùng `<picture>` thay vì `<img srcset>`?'
    ]
  },

  'css-056': {
    interviewerIntent: 'Kiểm tra kiến thức phân biệt đồ họa chính xác: Sự khác nhau cốt lõi giữa `box-shadow` (đổ bóng theo hình chữ nhật của Box Model) và `filter: drop-shadow()` (đổ bóng theo đường viền trong suốt của hình ảnh/SVG).',
    contextOrScenario: 'Cần đổ bóng cho một Logo hình ngôi sao (file ảnh PNG có nền trong suốt) hoặc một khung chat có mũi tên tam giác chìa ra. Lập trình viên dùng `box-shadow: 0 4px 10px rgba(0,0,0,0.3)` và bóng bị đổ thành một hình hộp chữ nhật xấu xí bao quanh toàn bộ file ảnh.',
    expectedKeywords: ['box-shadow vs filter: drop-shadow()', 'Alpha Channel Transparency', 'Box Model Shadow vs Visual Outline Shadow', 'Spread Radius Parameter', 'SVG Shadowing', 'GPU Filter Performance'],
    pitfalls: [
      'Dùng `box-shadow` cho hình ảnh PNG có nền trong suốt hoặc icon SVG: Bóng đổ sẽ bao quanh toàn bộ khung chữ nhật thay vì bám theo hình khối của icon.',
      'Cố gắng truyền tham số độ lan tỏa (Spread Radius - tham số thứ 4) vào `drop-shadow()`: Hàm `drop-shadow()` trong CSS filter KHÔNG hỗ trợ tham số spread radius.',
      'Lạm dụng `filter: drop-shadow()` trên các phần tử có nhiều con cháu đang cuộn mượt, làm tăng tải GPU.'
    ],
    followUpQuestions: [
      'Tại sao `box-shadow` hỗ trợ từ khóa `inset` để đổ bóng vào bên trong còn `filter: drop-shadow()` thì không?',
      'Cách kết hợp `filter: drop-shadow()` để đổ bóng đồng nhất cho một Tooltip bao gồm cả thân hộp và mũi tên tam giác tạo bằng CSS pseudo-element?'
    ]
  },

  'css-057': {
    interviewerIntent: 'Đánh giá triết lý thiết kế giao diện bền vững: Hiểu lý do tại sao Breakpoints phải được đặt theo Điểm gãy tự nhiên của Nội dung (Content-driven Breakpoints) thay vì chạy theo kích thước màn hình của các thiết bị cụ thể.',
    contextOrScenario: 'Một nhóm thiết kế đặt tên các breakpoints là: `$iphone-12: 390px`, `$ipad: 768px`, `$macbook: 1440px`. Khi các hãng điện thoại liên tục ra mắt các dòng điện thoại mới với kích thước màn hình lạ (màn hình gập, màn hình tỷ lệ 21:9), giao diện bị vỡ nát giữa các khoảng trống.',
    expectedKeywords: ['Content-driven Breakpoints', 'Device-agnostic Design', 'Natural Breakpoints', 'T-shirt Sizing (sm, md, lg)', 'Foldable & Ultrawide Screens', 'Future-proof CSS'],
    pitfalls: [
      'Gắn chặt Breakpoint với tên thiết bị cụ thể (Device-specific breakpoints): Khiến code nhanh chóng bị lỗi thời sau 1-2 năm.',
      'Đặt quá nhiều breakpoints vụn vặt (10-15 breakpoints), làm phình to file CSS và cực kỳ khó kiểm thử hồi quy.',
      'Không kiểm tra giao diện ở các dải kích thước trung gian (vùng chuyển tiếp giữa các breakpoint).'
    ],
    followUpQuestions: [
      'Quy tắc vàng của Stephen Hay: "Bắt đầu với màn hình nhỏ, mở rộng cửa sổ trình duyệt cho đến khi thiết kế bắt đầu trông xấu hoặc vỡ, đó chính là nơi bạn đặt Breakpoint!" được áp dụng ra sao?',
      'Hệ thống Breakpoints kích thước T-shirt (sm, md, lg, xl, 2xl) của TailwindCSS cân bằng giữa tính chuẩn hóa và tính linh hoạt như thế nào?'
    ]
  },

  'css-058': {
    interviewerIntent: 'Kiểm tra hiểu biết sâu sắc về Pipeline dựng hình của trình duyệt (Browser Rendering Pipeline: Parse -> Style -> Layout -> Paint -> Composite) và cách Composite Layers tối ưu hóa hiệu năng chuyển động.',
    contextOrScenario: 'Một trang web có hiệu ứng tuyết rơi với 200 bông tuyết di chuyển liên tục. Trình duyệt liên tục thực hiện Paint lại toàn bộ màn hình (Paint Flashing liên tục), làm quạt tản nhiệt máy tính kêu to và CPU chạm 100%.',
    expectedKeywords: ['Browser Rendering Pipeline', 'Composite Layers / Render Layers', 'Layout (Reflow) -> Paint -> Composite', 'GPU Layer Promotion', 'Paint Invalidation', 'Chrome DevTools Layers Panel'],
    pitfalls: [
      'Nghĩ rằng GPU luôn làm trang web nhanh hơn: Tạo quá nhiều Composite Layers sẽ làm cạn kiệt bộ nhớ VRAM của GPU và tốn thời gian truyền texture qua PCI bus.',
      'Kích hoạt Layout Reflow vô tình trong JavaScript bằng cách đọc các thuộc tính đo lường kích thước (`offsetHeight`, `clientWidth`) ngay sau khi vừa thay đổi style (Forced Synchronous Layout).',
      'Không bật công cụ "Paint Flashing" trong Chrome DevTools để kiểm tra xem vùng nào trên màn hình đang bị vẽ lại liên tục.'
    ],
    followUpQuestions: [
      '3 giai đoạn cốt lõi của Rendering Pipeline (Layout, Paint, Composite) khác nhau ra sao về mặt chi phí tính toán phần cứng?',
      'Tại sao việc biến một phần tử thành Composite Layer riêng biệt bằng `transform: translateZ(0)` giúp cô lập vùng vẽ lại (Paint Isolation)?'
    ]
  },

  'css-059': {
    interviewerIntent: 'Đo lường năng lực sử dụng các hàm toán học trong CSS (CSS Math Functions): Phân biệt và kết hợp linh hoạt giữa `calc()`, `min()`, `max()` và `clamp()`.',
    contextOrScenario: 'Cần thiết lập độ rộng của một modal popup: Chiếm 80% chiều rộng màn hình, nhưng không được phép vượt quá 600px và không được phép nhỏ hơn 300px. Đồng thời cần trừ đi khoảng cách lề 32px.',
    expectedKeywords: ['CSS Math Functions', 'calc()', 'min()', 'max()', 'clamp()', 'Mixed Unit Calculations (100% - 32px)', 'Resolution & Aspect Ratio Math'],
    pitfalls: [
      'Quên dấu cách xung quanh toán tử cộng `+` và trừ `-` trong hàm `calc()`: Ví dụ viết `calc(100%-20px)` sẽ bị coi là lỗi cú pháp (phải viết có khoảng trắng: `calc(100% - 20px)`).',
      'Nhầm lẫn giữa `min()` (chọn giá trị NHỎ NHẤT, hoạt động như một ngưỡng tối đa Maximum Bound) và `max()` (chọn giá trị LỚN NHẤT, hoạt động như một ngưỡng tối thiểu Minimum Bound).',
      'Dùng JavaScript tính toán kích thước rồi gán inline style thay vì để trình duyệt tự tính toán nguyên bản bằng các hàm toán học CSS.'
    ],
    followUpQuestions: [
      'Tại sao trong hàm `calc()`, phép nhân `*` và phép chia `/` không bắt buộc phải có khoảng cách nhưng phép cộng `+` và trừ `-` lại bắt buộc?',
      'Cách kết hợp lồng các hàm toán học: `width: min(100% - 40px, 800px);` thay thế hoàn toàn cho cặp thuộc tính `width: 800px; max-width: calc(100% - 40px);` như thế nào?'
    ]
  },

  'css-060': {
    interviewerIntent: 'Kiểm tra kiến thức tiên phong về Không gian màu hiện đại (Modern Color Spaces): Tại sao OKLCH vượt trội hơn sRGB và HSL cổ điển trong việc xây dựng Design System có tính nhất quán về độ sáng cảm nhận (Perceptual Uniformity).',
    contextOrScenario: 'Trong một Design System sử dụng không gian màu HSL: Màu vàng `hsl(60, 100%, 50%)` và màu xanh dương `hsl(240, 100%, 50%)` đều có cùng độ sáng (Lightness = 50%). Tuy nhiên khi đặt chữ trắng lên nền vàng thì hoàn toàn không đọc được, còn trên nền xanh thì đọc rất rõ, khiến việc tự động tính toán độ tương phản tương đối bị sai lệch.',
    expectedKeywords: ['OKLCH Color Space', 'Perceptual Uniformity', 'Lightness (L), Chroma (C), Hue (H)', 'HSL Flaws (Uneven Perceived Brightness)', 'Accessible Palette Generation', 'P3 Wide Color Gamut'],
    pitfalls: [
      'Tin rằng chỉ số Lightness trong HSL phản ánh độ sáng mà mắt người cảm nhận được (thực tế mắt người nhạy cảm với màu xanh lá và vàng hơn nhiều so với màu xanh dương).',
      'Tạo bảng màu Palette tự động bằng HSL dẫn đến việc các màu có cùng chỉ số Lightness nhưng lại có độ tương phản WCAG chênh lệch một trời một vực.',
      'Không biết rằng OKLCH hỗ trợ dải màu rộng (Wide Gamut Display P3) hiển thị được các màu sắc rực rỡ hơn 30% trên màn hình Apple Retina và OLED hiện đại.'
    ],
    followUpQuestions: [
      'Khái niệm "Độ sáng đồng đều theo cảm nhận" (Perceptually Uniform) của OKLCH giúp tự động sinh ra các cấp độ màu (Shades: 100, 200, ..., 900) có độ tương phản WCAG chuẩn xác ra sao?',
      'Cú pháp khai báo màu OKLCH trong CSS: `color: oklch(0.65 0.25 140);` đại diện cho những thông số nào?'
    ]
  },

  'css-061': {
    interviewerIntent: 'Đánh giá kinh nghiệm triển khai Chế độ nền tối (Dark Mode Architecture) ở cấp độ Enterprise: Kiến trúc biến CSS có phân tầng (Semantic Design Tokens), chống chớp trắng (Zero-FOUC) và độ tương phản chuẩn WCAG.',
    contextOrScenario: 'Doanh nghiệp muốn thêm tính năng Dark Mode cho toàn bộ ứng dụng lớn. Nhóm cần một kiến trúc sạch để các kỹ sư khi viết tính năng mới không cần phải viết thêm CSS riêng cho Dark Mode mà hệ thống tự động ăn theo theme.',
    expectedKeywords: ['Dark Mode Architecture', 'Semantic Design Tokens (Surface, Text, Border)', 'Primitive vs Semantic Tokens', 'Zero-FOUC Theme Initialization Script', 'data-theme Attribute', 'Accessible Contrast (WCAG AA/AAA)'],
    pitfalls: [
      'Gán cứng mã màu trực tiếp vào component (`color: #333333`) thay vì sử dụng các biến ngữ nghĩa (`color: var(--text-primary)`).',
      'Đọc theme từ LocalStorage bằng React `useEffect`: Gây ra hiện tượng chớp trắng màn hình (FOUC) trong 100-200ms trước khi React hydrate xong.',
      'Sử dụng chung một độ bão hòa màu rực rỡ (High Saturation) cho cả nền sáng lẫn nền tối, gây cảm giác chói gắt trên nền tối.'
    ],
    followUpQuestions: [
      'Kỹ thuật chèn một đoạn Script nhỏ đồng bộ (Blocking Inline Script) trong thẻ `<head>` để gán thuộc tính `data-theme` trước khi trình duyệt kịp render màn hình đầu tiên giúp triệt tiêu FOUC như thế nào?',
      'Kiến trúc Design Tokens 2 tầng: Primitive Tokens (màu thô: `--blue-500`) map vào Semantic Tokens (ngữ nghĩa: `--interactive-accent`) vận hành ra sao?'
    ]
  },

  'css-062': {
    interviewerIntent: 'Kiểm tra sự am hiểu về tương tác cảm ứng trên thiết bị di động (Mobile Touch Interactions): Sử dụng thuộc tính `touch-action` để loại bỏ độ trễ chạm 300ms và kiểm soát cử chỉ vuốt/cuộn của trình duyệt.',
    contextOrScenario: 'Cần xây dựng một ứng dụng vẽ tay (Signature Pad / Canvas) hoặc một trò chơi tương tác trên màn hình cảm ứng di động. Khi người dùng đặt ngón tay vuốt vẽ thì trình duyệt lại tự động cuộn trang hoặc phóng to thu nhỏ màn hình (Pinch-to-zoom), làm hỏng trải nghiệm thao tác.',
    expectedKeywords: ['touch-action property', 'touch-action: none / manipulation', '300ms Click Delay Elimination', 'Gesture Prevention', 'Custom Pointer Interactions', 'Pointer Events API'],
    pitfalls: [
      'Dùng JavaScript `event.preventDefault()` trong sự kiện `touchstart`/`touchmove` để chặn cuộn trang (kỹ thuật cũ làm vô hiệu hóa Passive Event Listeners và gây giật khung hình cuộn trang nghiêm trọng).',
      'Không biết rằng `touch-action: manipulation` là giải pháp CSS nguyên bản hoàn hảo để loại bỏ độ trễ 300ms của thao tác click trên mobile mà vẫn cho phép người dùng cuộn trang bình thường.',
      'Đặt `touch-action: none` trên toàn trang web khiến người dùng không thể cuộn xem nội dung được nữa.'
    ],
    followUpQuestions: [
      'Tại sao việc khai báo `touch-action: none` bằng CSS cho phép trình duyệt biết trước ý định tương tác ở tầng Compositor Thread mà không cần chờ Main Thread của JavaScript thực thi?',
      'Thuộc tính `touch-action: pan-y` cho phép hành vi cử chỉ nào và chặn cử chỉ nào?'
    ]
  },

  'css-063': {
    interviewerIntent: 'Kiểm tra khả năng tư duy tổng hợp và so sánh kiến trúc bố cục hiện đại: Ma trận quyết định dứt khoát khi nào chọn Flexbox và khi nào chọn CSS Grid.',
    contextOrScenario: 'Một nhóm kỹ sư tranh cãi gay gắt: Một bên muốn dùng Flexbox cho tất cả mọi thứ trong dự án, một bên đòi dùng Grid cho tất cả mọi thứ. Kiến trúc sư trưởng cần đưa ra tiêu chuẩn lựa chọn rõ ràng cho toàn đội ngũ.',
    expectedKeywords: ['Flexbox vs Grid Comprehensive Matrix', '1D (One-Dimensional) vs 2D (Two-Dimensional)', 'Content-Driven vs Layout-Driven', 'Track Alignment vs Component Flow', 'Subgrid Capabilities', 'Hybrid Layout Strategy'],
    pitfalls: [
      'Ép buộc sử dụng duy nhất một công cụ cho mọi bài toán layout.',
      'Dùng Flexbox để cố gắng giả lập bố cục ma trận 2 chiều có các hàng và cột căn thẳng hàng tuyệt đối với nhau.',
      'Dùng CSS Grid cho các bố cục dòng đơn giản như căn giữa avatar và tên người dùng.'
    ],
    followUpQuestions: [
      'Quy tắc vàng 3 câu hỏi để quyết định ngay lập tức giữa Flexbox và Grid là gì?',
      'Tính năng CSS Subgrid (`grid-template-columns: subgrid;`) giải quyết bài toán căn chỉnh các phần tử con sâu bên trong các Card khác nhau thẳng hàng với nhau như thế nào?'
    ]
  },

  'css-064': {
    interviewerIntent: 'Kiểm tra kiến thức chuyên sâu về mô hình định dạng khối (Block Formatting Context - BFC): Bản chất của BFC, các hiện tượng kỳ lạ trong CSS được BFC giải quyết (chống tràn float, cô lập margin collapsing).',
    contextOrScenario: 'Một thẻ chứa (Container) bao bọc một bức ảnh có `float: left`. Do ảnh bị float khỏi luồng thông thường, thẻ cha bị sụp đổ chiều cao (Collapsed Height = 0px). Trước đây lập trình viên phải dùng Clearfix hack phức tạp.',
    expectedKeywords: ['Block Formatting Context (BFC)', 'display: flow-root', 'Margin Collapsing Prevention', 'Containing Floats (Clearfix Alternative)', 'Formatting Context Isolation', 'overflow: hidden side-effects'],
    pitfalls: [
      'Dùng `overflow: hidden` để trigger BFC: Vô tình làm cắt cụt các dropdown menu, tooltip hoặc bóng đổ bay ra ngoài mép container.',
      'Vẫn sử dụng Clearfix hack cũ (`.clearfix::after { content: ""; display: table; clear: both; }`) thay vì sử dụng thuộc tính hiện đại chuẩn mực `display: flow-root`.',
      'Không biết rằng Flex Container và Grid Container tự động tạo ra một formatting context mới, hoàn toàn không bị dính lỗi float hay margin collapsing.'
    ],
    followUpQuestions: [
      'Thuộc tính CSS hiện đại `display: flow-root` tạo ra một BFC mới mà không gây ra bất kỳ tác dụng phụ nào như thế nào?',
      'BFC ngăn chặn việc Margin của phần tử con bị lọt ra ngoài (Margin Collapsing with Parent) ra sao?'
    ]
  },

  'css-065': {
    interviewerIntent: 'Đo lường sự am hiểu tường tận về cơ chế gộp lề (Margin Collapsing): Tại sao margin 20px cộng với margin 30px lại chỉ bằng 30px (chứ không phải 50px), và các điều kiện để chặn gộp lề.',
    contextOrScenario: 'Một đoạn văn `<p>` có `margin-bottom: 20px`, nằm ngay phía trên một tiêu đề `<h2>` có `margin-top: 30px`. Lập trình viên đo khoảng cách thực tế giữa 2 phần tử trên màn hình và thấy chỉ có 30px thay vì 50px.',
    expectedKeywords: ['Margin Collapsing', 'Adjacent Siblings Collapsing', 'Parent and First/Last Child Collapsing', 'Empty Blocks Collapsing', 'BFC / Padding / Border Isolation', 'Negative Margin Math'],
    pitfalls: [
      'Cho rằng Margin trong CSS luôn được cộng dồn như Padding.',
      'Bị hiện tượng Margin của thẻ con đầu tiên lọt ra ngoài đẩy luôn cả thẻ cha xuống (Parent-Child Collapsing) do cha không có border hoặc padding trên cùng.',
      'Không biết cách tính toán khi có Margin âm: Khoảng cách bằng Margin dương lớn nhất cộng với Margin âm có giá trị tuyệt đối lớn nhất.'
    ],
    followUpQuestions: [
      '3 trường hợp xảy ra Margin Collapsing (Anh em liền kề, Cha và con đầu/cuối, Khối rỗng) là gì?',
      'Tại sao trong Flexbox và CSS Grid, Margin Collapsing hoàn toàn KHÔNG bao giờ xảy ra?'
    ]
  },

  'css-066': {
    interviewerIntent: 'Đánh giá kỹ năng tái cấu trúc giao diện responsive cấp cao: Thay đổi toàn bộ bố cục Dashboard phức tạp trên các màn hình khác nhau mà KHÔNG CẦN CHẠM VÀO MỘT THẺ HTML NÀO.',
    contextOrScenario: 'Một hệ thống Analytics Dashboard gồm 6 widget: KPI Metrics, Biểu đồ Doanh thu, Danh sách Giao dịch, Bản đồ Khách hàng, Bảng xếp hạng và Bộ lọc. Cần hiển thị bố cục 4 cột trên Desktop lớn, 2 cột trên Tablet, và 1 cột cuộn dọc trên Mobile.',
    expectedKeywords: ['grid-template-areas Responsive', 'Zero-HTML Changes', 'CSS-only Redesign', 'Named Area Mapping', 'Media Query Area Reconfiguration', 'Fluid Widget Scaling'],
    pitfalls: [
      'Tạo 2 bộ HTML riêng biệt (một cho Desktop và một cho Mobile) rồi dùng `display: none` để ẩn/hiện, làm tăng gấp đôi kích thước DOM và gây lãng phí bộ nhớ.',
      'Dùng JavaScript để di chuyển các DOM nodes khi resize màn hình.',
      'Viết sai chính tả tên vùng trong Media Query làm toàn bộ lưới bị vỡ layout.'
    ],
    followUpQuestions: [
      'Cách viết Media Queries tái định nghĩa ma trận `grid-template-areas` từ 4 cột sang 2 cột và 1 cột mượt mà ra sao?',
      'Làm thế nào để xử lý việc ẩn một widget phụ trên mobile bằng `grid-template-areas` kết hợp `display: none`?'
    ]
  },

  'css-067': {
    interviewerIntent: 'Kiểm tra kỹ năng gỡ rối (Debugging) sự cố Stacking Context: Tìm ra chính xác nguyên nhân tại sao `z-index` không có tác dụng và giải pháp xử lý kiến trúc lớp.',
    contextOrScenario: 'Một Datepicker Popup cần bay đè lên trên bảng dữ liệu. Lập trình viên đặt `z-index: 9999` cho Datepicker nhưng nó vẫn bị cắt cụt và chìm bên dưới dòng tiêu đề của bảng. Càng tăng z-index thì popup vẫn bị chìm.',
    expectedKeywords: ['Stacking Context Debugging', 'Local Z-Index Trapping', 'Parent Stacking Context', 'isolation: isolate', 'overflow: hidden Clipping vs Stacking', 'Portal Rendering Alternative'],
    pitfalls: [
      'Tiếp tục tăng giá trị `z-index` vô nghĩa mà không kiểm tra xem phần tử cha có đang bị giam cầm trong một Stacking Context cấp thấp hơn hay không.',
      'Nhầm lẫn giữa việc bị đè z-index và việc bị cắt cụt do thuộc tính `overflow: hidden` của phần tử cha.',
      'Không dùng Chrome DevTools để kiểm tra cây Stacking Context (Layers tab).'
    ],
    followUpQuestions: [
      'Quy trình 3 bước chuẩn của Senior Frontend Engineer để debug lỗi "Tại sao z-index không hoạt động?" là gì?',
      'Khi nào nên dùng kỹ thuật React Portal để đưa Popup/Modal ra ngoài thẻ `<body>` nhằm thoát khỏi Stacking Context cục bộ?'
    ]
  },

  'css-068': {
    interviewerIntent: 'Kiểm tra sự phân biệt rõ ràng giữa hai triết lý thiết lập style ban đầu: CSS Reset (Xóa sạch toàn bộ style mặc định về 0) vs Normalize.css (Bảo toàn và chuẩn hóa style mặc định giữa các trình duyệt).',
    contextOrScenario: 'Khi khởi tạo một dự án mới, nhóm cần quyết định chọn phương pháp khởi tạo CSS: Dùng Eric Meyer Reset / Modern Reset hay dùng Normalize.css / Sanitize.css.',
    expectedKeywords: ['CSS Reset vs Normalize.css', 'Eric Meyer Reset', 'Normalize.css Strategy', 'Modern CSS Reset (Andy Bell)', 'Preserving Useful Defaults', 'User-Agent Stylesheet Normalization'],
    pitfalls: [
      'Dùng Reset CSS cổ điển xóa sạch margin của `<h1> - <h6>` và biến `<ul>` thành danh sách không có bullet point, khiến lập trình viên phải viết lại style cơ bản từ đầu cho mọi thẻ.',
      'Sử dụng selector bừa bãi `* { margin: 0; padding: 0; }` làm mất đi các style tiện ích hữu dụng của form controls và dialog.',
      'Không nhận ra rằng các framework hiện đại như TailwindCSS đã tích hợp sẵn phiên bản chuẩn hóa riêng (Tailwind Preflight dựa trên Modern-Normalize).'
    ],
    followUpQuestions: [
      'Modern CSS Reset hiện đại (như bản của Andy Bell / Josh Comeau) kế thừa những ưu điểm tốt nhất của cả Reset và Normalize như thế nào?',
      'Tại sao việc thêm `img, picture, video, canvas, svg { display: block; max-width: 100%; }` là điều bắt buộc trong mọi bản Modern Reset?'
    ]
  }
};

let count = 0;
for (const [id, update] of Object.entries(batch2)) {
  const q = data.find(item => item.id === id);
  if (q) {
    q.interviewerIntent = update.interviewerIntent;
    q.contextOrScenario = update.contextOrScenario;
    q.expectedKeywords = update.expectedKeywords;
    q.pitfalls = update.pitfalls;
    q.followUpQuestions = update.followUpQuestions;
    count++;
  }
}

fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
console.log(`Enriched CSS Metadata Batch 2: ${count} questions updated.`);
