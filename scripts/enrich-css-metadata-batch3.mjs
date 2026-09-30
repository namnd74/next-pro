import fs from 'node:fs';
import path from 'node:path';

const filePath = path.resolve('src/features/interview/data/json/css-bank.json');
const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));

const batch3 = {
  'css-069': {
    interviewerIntent: 'Kiểm tra kỹ năng giải quyết sự cố kinh điển trong Flexbox: Hiện tượng Flex Item từ chối co lại do giá trị mặc định `min-width: auto` và cách sửa bằng `min-width: 0`.',
    contextOrScenario: 'Một thẻ Card người dùng nằm trong Flex row: Bên trái là Avatar tròn, bên phải là tiêu đề và đoạn trích dẫn dài có `text-overflow: ellipsis`. Dù đã đặt `overflow: hidden`, phần tử text vẫn không chịu cắt ngắn mà đẩy vỡ toàn bộ container ra ngoài màn hình.',
    expectedKeywords: ['min-width: auto trap', 'min-width: 0 fix', 'Flex Item Shrink Constraint', 'text-overflow: ellipsis failure', 'Content-based Minimum Size', 'Flex Overflow Handling'],
    pitfalls: [
      'Cố gán `width: 100%` hoặc `max-width: 100%` để sửa: Vẫn không có tác dụng vì `min-width: auto` mặc định của Flex Item luôn chiếm quyền ưu tiên cao hơn.',
      'Đặt `overflow: hidden` trên flex container thay vì trên chính flex item bị tràn.',
      'Dùng JavaScript để cắt ngắn chuỗi văn bản thay vì sử dụng giải pháp CSS `min-width: 0; overflow: hidden; text-overflow: ellipsis;`.'
    ],
    followUpQuestions: [
      'Tại sao đặc tả W3C Flexbox lại đặt `min-width: auto` làm mặc định thay vì `min-width: 0` (để bảo vệ nội dung không bị biến mất ngoài ý muốn)?',
      'Trong flex container có hướng dọc (`flex-direction: column`), thuộc tính tương đương cần can thiệp là gì (`min-height: 0`)?'
    ]
  },

  'css-070': {
    interviewerIntent: 'Đánh giá hiểu biết sâu sắc về hành vi dãn dòng của `auto-fit` vs `auto-fill` trong CSS Grid khi số lượng phần tử trả về từ API chỉ có 1 hoặc 2 items.',
    contextOrScenario: 'Trang kết quả tìm kiếm sản phẩm dùng `grid-template-columns: repeat(auto-fit, minmax(240px, 1fr))`. Khi người dùng tìm ra 1 sản phẩm duy nhất, Card sản phẩm đó bị kéo giãn to đùng ra toàn bộ chiều rộng 1200px của màn hình trông rất xấu.',
    expectedKeywords: ['auto-fit vs auto-fill behavior', 'Single Item Grid Stretches', 'max-width Constraint', 'Empty Track Preservation', 'Search Result Grid UX', 'Layout Consistency'],
    pitfalls: [
      'Không lường trước trường hợp số lượng Card ít hơn số cột tối thiểu của màn hình.',
      'Sửa bằng cách bỏ `1fr` thay bằng `240px` cố định, làm mất tính năng co giãn linh hoạt khi có nhiều cards.',
      'Không biết rằng đổi sang `auto-fill` sẽ giữ nguyên kích thước nhỏ của Card và để lại các khoảng trống rỗng ở bên phải hàng.'
    ],
    followUpQuestions: [
      'Giải pháp kết hợp hoàn hảo: Đổi sang `auto-fill` hoặc đặt `max-width` trên Card sản phẩm để vừa co giãn vừa không bị phóng đại quá đà hoạt động ra sao?',
      'Khi nào giao diện bắt buộc phải dùng `auto-fit` (ví dụ: các ô thống kê KPI cards trên Header Dashboard cần chiếm trọn không gian)?'
    ]
  },

  'css-071': {
    interviewerIntent: 'Kiểm tra kỹ thuật xử lý tràn ngang trong CSS Grid: Khắc phục hiện tượng cột `1fr` bị phình to do nội dung không ngắt dòng bằng công thức `minmax(0, 1fr)`.',
    contextOrScenario: 'Một cột trong CSS Grid có kích thước `1fr` chứa một bảng dữ liệu HTML `<table>` hoặc một đoạn mã code `<code>` có dòng dài không ngắt. Toàn bộ Grid bị đẩy phình to theo nội dung, làm xuất hiện thanh cuộn ngang khó chịu trên toàn trang web.',
    expectedKeywords: ['minmax(0, 1fr)', 'Grid Track Overflow', 'Implicit Minimum Size of 1fr (auto)', 'Zero-Width Track Override', 'Horizontal Scrollbar Bug', 'Table & Pre Formatting in Grid'],
    pitfalls: [
      'Nghĩ rằng `1fr` tự động co nhỏ về 0px: Mặc định giá trị tối thiểu của một track `1fr` là `auto` (kích thước của nội dung bên trong).',
      'Đặt `overflow: hidden` trên `<body>` để che giấu thanh cuộn ngang thay vì xử lý tận gốc tại track của Grid.',
      'Dùng pixel cố định cho cột thay vì dùng công thức chuẩn mực `minmax(0, 1fr)`.'
    ],
    followUpQuestions: [
      'Tại sao công thức `minmax(0, 1fr)` buộc trình duyệt cho phép cột Grid co nhỏ hơn kích thước nội tại của nội dung bên trong nó?',
      'Cách kết hợp `minmax(0, 1fr)` với `overflow-x: auto` trên thẻ chứa bảng để tạo thanh cuộn riêng cho bảng mà không làm tràn trang web?'
    ]
  },

  'css-072': {
    interviewerIntent: 'Đánh giá kỹ năng tái cấu trúc layout Dashboard phức tạp bằng `grid-template-areas`: Quản lý thứ tự hiển thị và kích thước vùng hiển thị giữa Desktop và Mobile không cần sửa HTML.',
    contextOrScenario: 'Thiết kế hệ thống quản trị Enterprise: Desktop hiển thị Header (full-width), Sidebar bên trái (250px), Main Content ở giữa và Widget phụ bên phải (300px), Footer ở đáy. Mobile chuyển thành: Header -> Main Content -> Widget phụ -> Sidebar -> Footer.',
    expectedKeywords: ['grid-template-areas', 'Responsive Dashboard Layout', 'DOM Order vs Visual Order', 'Accessible Focus Order', 'Media Query Reconfiguration', 'Grid Area Mapping'],
    pitfalls: [
      'Đảo lộn thứ tự trực quan bằng CSS quá xa so với thứ tự trong mã HTML, vi phạm nguyên tắc tiếp cận WCAG 1.3.2 (Meaningful Sequence cho Screen Reader).',
      'Khai báo thiếu vùng hoặc sai chính tả giữa các dòng trong `grid-template-areas` khiến CSS bị lỗi cú pháp toàn bộ.',
      'Quên gán `grid-area` tương ứng cho từng component con.'
    ],
    followUpQuestions: [
      'Làm thế nào để bảo đảm người dùng điều hướng bằng bàn phím (Phím Tab) không bị nhảy loạn xạ khi thứ tự hiển thị của Grid Areas khác thứ tự HTML DOM?',
      'Cú pháp đặt `grid-template-areas` kết hợp `grid-template-columns` và `grid-template-rows` trên cùng một shorthand như thế nào?'
    ]
  },

  'css-073': {
    interviewerIntent: 'Kiểm tra quy trình chẩn đoán sự cố thực chiến: 4 nguyên nhân hàng đầu khiến `position: sticky` không hoạt động và cách kiểm tra từng bước.',
    contextOrScenario: 'Lập trình viên muốn thanh Header hoặc cột đầu tiên của bảng dữ liệu dính lại khi cuộn (`position: sticky; top: 0;`). Mặc dù code trông rất chuẩn, phần tử vẫn trôi tuột theo trang khi cuộn.',
    expectedKeywords: ['Sticky Debugging Checklist', 'Missing Threshold (top: 0)', 'Ancestor overflow: hidden Trap', 'Parent Height Constraint', 'Table Cells Sticky (th/td)', 'Containing Block Scroll Area'],
    pitfalls: [
      'Không khai báo ít nhất một thuộc tính ngưỡng vị trí (`top`, `bottom`, `left`, `right`).',
      'Có một phần tử tổ tiên ở bất kỳ cấp nào có thuộc tính `overflow: hidden`, `overflow: auto` hoặc `overflow: scroll`.',
      'Phần tử cha có chiều cao bằng đúng phần tử con, khiến không có không gian để sticky di chuyển.'
    ],
    followUpQuestions: [
      'Làm thế nào để sử dụng Chrome DevTools console script để tìm ra ngay lập tức phần tử tổ tiên nào đang có `overflow: hidden` làm hỏng sticky?',
      'Khi làm sticky cho hàng tiêu đề `<thead>` hoặc cột `<th>` trong bảng HTML, cần lưu ý gì về `border-collapse`?'
    ]
  },

  'css-074': {
    interviewerIntent: 'Đo lường sự thấu hiểu về hiện tượng Margin Collapsing giữa cha và con (Parent-Child Margin Collapsing) và các giải pháp hiện đại để cô lập lề.',
    contextOrScenario: 'Trong một khối `<div class="card">`, thẻ con đầu tiên `<h1>` có `margin-top: 40px`. Thay vì thẻ `<h1>` cách mép trên của `.card` 40px, cả khối `.card` bị đẩy tụt xuống dưới 40px tạo ra khoảng trống kỳ lạ phía trên.',
    expectedKeywords: ['Parent-Child Margin Collapsing', 'First-Child Margin Leakage', 'display: flow-root', 'Padding/Border Barrier', 'BFC Isolation', 'Margin vs Padding Decision'],
    pitfalls: [
      'Thêm `padding-top: 0.1px` hoặc `border-top: 1px solid transparent` làm hack bẩn để chặn margin collapsing.',
      'Không biết rằng giải pháp hiện đại, sạch sẽ nhất của CSS là thêm `display: flow-root` cho phần tử cha.',
      'Sử dụng Margin cho thẻ con đầu tiên khi bản chất nghiệp vụ đó là Padding của thẻ cha.'
    ],
    followUpQuestions: [
      'Tại sao việc thêm `display: flow-root` trên container cha lại giải quyết triệt để lỗi Margin con lọt ra ngoài mà không làm thay đổi kích thước hộp?',
      'Quy tắc nào của W3C giải thích tại sao margin của thẻ con đầu tiên có thể gộp với margin của thẻ cha?'
    ]
  },

  'css-075': {
    interviewerIntent: 'Kiểm tra việc áp dụng thuộc tính hiện đại `aspect-ratio`: Thay thế hoàn toàn cho kỹ thuật "Padding-Top Hack" cổ điển để chống giật layout (Cumulative Layout Shift - CLS).',
    contextOrScenario: 'Hiển thị video YouTube (tỷ lệ 16:9) hoặc ảnh thumbnail sản phẩm (tỷ lệ 1:1, 4:3). Trước khi ảnh tải xong, khung ảnh có chiều cao bằng 0px; khi ảnh tải xong, nó đẩy toàn bộ nội dung phía dưới tụt xuống làm điểm CLS tăng cao.',
    expectedKeywords: ['aspect-ratio property', 'Cumulative Layout Shift (CLS)', 'Padding-Top Hack (pb-56.25%)', 'Intrinsic Aspect Ratio', 'Responsive Media Containers', 'Zero-Layout-Shift Loading'],
    pitfalls: [
      'Vẫn sử dụng kỹ thuật Padding-Top phần trăm (`padding-top: 56.25%; position: relative;`) kết hợp con `position: absolute` vốn rất rườm rà và khó đọc.',
      'Đặt `aspect-ratio` nhưng lại đồng thời đặt cả `width` và `height` cố định mâu thuẫn với tỷ lệ khai báo.',
      'Quên đặt `object-fit: cover` trên thẻ `<img>` bên trong khiến ảnh bị méo tỷ lệ khi container co giãn.'
    ],
    followUpQuestions: [
      'Tại sao trình duyệt hiện đại tự động tính toán `aspect-ratio` từ thuộc tính `width` và `height` trên thẻ `<img>` để giữ sẵn chỗ trước khi tải ảnh?',
      'Cách sử dụng `aspect-ratio: 16 / 9` kết hợp `width: 100%` và `max-width` để tạo video player responsive hoàn hảo?'
    ]
  },

  'css-076': {
    interviewerIntent: 'Đánh giá kiến trúc triển khai Dark Mode chuẩn Enterprise: Đồng bộ 3 chế độ (Auto/Light/Dark), triệt tiêu hiện tượng chớp trắng (Zero-FOUC) và kiến trúc Token biến CSS.',
    contextOrScenario: 'Người dùng chọn chế độ Dark Mode trên website. Mỗi khi người dùng bấm F5 hoặc chuyển trang, màn hình bị chớp trắng một tích tắc (Flash of White) trước khi màu tối kịp nạp lên.',
    expectedKeywords: ['Dark Mode Architecture', 'Zero-FOUC Blocking Script', 'System Preference vs User Override', 'data-theme Attribute', 'CSS Custom Properties Mapping', 'color-scheme: dark light'],
    pitfalls: [
      'Đọc theme từ LocalStorage bên trong React `useEffect` hoặc hàm `DOMContentLoaded`: Khiến trình duyệt vẽ xong giao diện Light trước rồi mới đổi sang Dark (nguyên nhân gây FOUC).',
      'Đổi theme bằng cách tải thêm file CSS khác (gây chậm và gián đoạn kết nối mạng).',
      'Không lắng nghe sự kiện thay đổi theme hệ thống trong JavaScript (`window.matchMedia("(prefers-color-scheme: dark)").addEventListener(...)`).'
    ],
    followUpQuestions: [
      'Đoạn script đồng bộ (Inline Script) nhỏ đặt ngay đầu thẻ `<head>` trước mọi file CSS hoạt động ra sao để loại bỏ 100% lỗi chớp trắng?',
      'Cách tổ chức cấu trúc CSS: `:root[data-theme="dark"]` ghi đè các biến semantic tokens như thế nào?'
    ]
  },

  'css-077': {
    interviewerIntent: 'Đo lường sự hiểu biết sâu sắc về các pseudo-class hiện đại: So sánh chính xác sự khác nhau về Specificity giữa `:is()` (lấy điểm của selector nặng nhất) và `:where()` (luôn có điểm bằng 0).',
    contextOrScenario: 'Nhóm thiết kế muốn viết một bộ CSS Reset hoặc Design System cơ bản cho các tiêu đề `h1, h2, h3`. Họ muốn lập trình viên sau này có thể ghi đè lại các style này cực kỳ dễ dàng bằng một class thông thường mà không bị vướng độ ưu tiên selector.',
    expectedKeywords: [':is() vs :where()', 'Specificity Inheritance', 'Zero Specificity (:where())', 'CSS Reset Architecture', 'Forgiving Selector List', 'Selector Grouping'],
    pitfalls: [
      'Dùng `:is()` để viết CSS Reset: `:is(header, main, footer) h1` sẽ có Specificity bằng selector nặng nhất trong danh sách, khiến việc ghi đè trở nên khó khăn.',
      'Không biết rằng `:where()` có Specificity tuyệt đối bằng 0 (0-0-0), là công cụ hoàn hảo nhất để viết default styles cho thư viện component.',
      'Nghĩ rằng nếu 1 selector trong `:is()` hoặc `:where()` bị sai cú pháp thì toàn bộ rule sẽ hỏng (cả hai đều là "Forgiving Selector List", tự động bỏ qua selector lỗi và chạy tiếp các selector đúng).'
    ],
    followUpQuestions: [
      'Tính năng Forgiving Selector List trong `:is()` và `:where()` giúp viết code an toàn cho các pseudo-elements của từng trình duyệt riêng biệt ra sao?',
      'Tính điểm Specificity của `:is(#nav, .menu) a` và so sánh với `:where(#nav, .menu) a`?'
    ]
  },

  'css-078': {
    interviewerIntent: 'Kiểm tra mức độ thành thạo bộ chọn quan hệ `:has()`: Nhận diện các bài toán kinh điển trước đây bắt buộc phải viết JavaScript nhưng nay giải quyết thanh lịch 100% bằng CSS.',
    contextOrScenario: 'Cần style: (1) Thay đổi background của Navbar khi người dùng mở Menu Modal; (2) Đổi viền Card sản phẩm khi Checkbox chọn hàng bên trong được tick; (3) Tự động ẩn nhãn giỏ hàng khi danh sách rỗng.',
    expectedKeywords: [':has() Relational Selector', 'Eliminating JavaScript Listeners', 'State-Driven CSS', 'Form Validation Styling (:has(:invalid))', 'Sibling Detection (:has(+ .sibling))', 'Modern CSS Architecture'],
    pitfalls: [
      'Vẫn viết sự kiện `onClick` hoặc thêm bớt class `.has-error`, `.is-active` bằng JavaScript cho các tương tác thuần túy về giao diện.',
      'Sử dụng `:has()` với các bộ chọn quá tổng quát trên toàn trang (`html:has(*)`) làm ảnh hưởng đến hiệu năng render của trình duyệt.',
      'Không kiểm tra trình duyệt cũ đối với các hệ thống cần hỗ trợ doanh nghiệp legacy.'
    ],
    followUpQuestions: [
      'Cách viết selector để style cho một phần tử Form khi bất kỳ ô Input nào bên trong nó ở trạng thái `:invalid` bằng `:has()`?',
      'Cách kết hợp `h2:has(+ p)` để chỉ style cho tiêu đề `<h2>` nếu ngay sau nó là một đoạn văn `<p>`?'
    ]
  },

  'css-079': {
    interviewerIntent: 'Đánh giá kiến thức thực tế về hỗ trợ đa ngôn ngữ quốc tế (RTL Support): Chiến lược di chuyển (Migration) từ CSS vật lý sang CSS Logical Properties một cách an toàn và tự động.',
    contextOrScenario: 'Công ty chuẩn bị mở rộng sản phẩm sang thị trường Ả Rập và Israel (sử dụng ngôn ngữ viết từ phải sang trái - RTL). Codebase hiện tại có hơn 20,000 dòng CSS chứa đầy `left`, `right`, `margin-left`, `text-align: left`.',
    expectedKeywords: ['RTL Support Migration', 'CSS Logical Properties', 'dir="rtl" Attribute', 'Automated PostCSS RTL Tools', 'Writing Modes', 'Bidirectional Text Alignment'],
    pitfalls: [
      'Viết một file `style-rtl.css` khổng lồ ghi đè thủ công từng class một (ác mộng bảo trì khi mỗi lần thêm tính năng mới phải sửa cả 2 file).',
      'Đổi thuộc tính `margin-left` thành `margin-right` mà quên đổi các icon mũi tên chỉ hướng (icon Next/Back cũng phải xoay ngược lại trong RTL).',
      'Không dùng thuộc tính `text-align: start` (tự động căn trái trong LTR và căn phải trong RTL).'
    ],
    followUpQuestions: [
      'Cách sử dụng plugin PostCSS (như `postcss-logical`) để tự động chuyển đổi toàn bộ CSS cũ sang Logical Properties trong quy trình build pipeline?',
      'Những thành phần nào trong giao diện KHÔNG NÊN đảo ngược khi chuyển sang RTL (ví dụ: trình phát nhạc video, số điện thoại, đồ thị thời gian)?'
    ]
  },

  'css-080': {
    interviewerIntent: 'Đo lường năng lực phân tích kiến trúc và lãnh đạo kỹ thuật (Technical Leadership): Đánh giá khách quan ưu nhược điểm giữa phương pháp luận BEM (Semantic) và Utility-First (TailwindCSS).',
    contextOrScenario: 'Trong một buổi họp kỹ thuật, nhóm Frontend chia làm 2 phe: Một phe ủng hộ BEM vì code HTML sạch và ngữ nghĩa rõ ràng, phe kia ủng hộ TailwindCSS vì tốc độ phát triển nhanh và không phải đau đầu nghĩ tên class.',
    expectedKeywords: ['BEM vs Tailwind Architectural Trade-offs', 'CSS File Size Growth Curve', 'Cognitive Load of Naming Classes', 'Design System Enforcement', 'HTML Readability vs CSS Bloat', 'Component Abstraction'],
    pitfalls: [
      'Đánh giá phiến diện theo cảm xúc cá nhân (chê Tailwind là "xấu xí" hoặc chê BEM là "cổ lỗ sĩ") mà không nhìn vào bài toán kinh doanh, quy mô đội ngũ và tốc độ release.',
      'Dùng TailwindCSS nhưng không sử dụng Component framework (React/Vue/Svelte) dẫn đến việc copy-paste hàng chục class trùng lặp trên HTML thô.',
      'Dùng BEM nhưng không có cơ chế quản lý biến và design tokens chặt chẽ, dẫn đến mỗi người tự bịa ra một mã màu.'
    ],
    followUpQuestions: [
      'Tại sao trong dự án có hơn 50 lập trình viên, TailwindCSS giúp kiểm soát kích thước file CSS tốt hơn nhiều so với BEM?',
      'Mô hình kết hợp (Hybrid): Khi nào nên dùng TailwindCSS cho bố cục bên trong component và BEM cho các quy ước cấp cao?'
    ]
  },

  'css-081': {
    interviewerIntent: 'Kiểm tra kỹ thuật tính toán Fluid Typography và nhận diện các cạm bẫy về tiếp cận (Accessibility Pitfalls) khi dùng hàm `clamp()`.',
    contextOrScenario: 'Thiết kế hệ thống cỡ chữ tự động co giãn từ 16px (trên mobile 375px) đến 24px (trên desktop 1200px) bằng hàm `clamp()`. Sau khi triển khai, trang web bị đánh rớt bài kiểm tra Accessibility của khách hàng chính phủ.',
    expectedKeywords: ['clamp() Fluid Typography Formula', 'Accessibility Failure (WCAG 1.4.4 Resize Text)', 'Linear Interpolation Math (Slope & Intercept)', 'rem + vw Combination', 'Zoom Scaling Preservation', 'Fluid Type Generators'],
    pitfalls: [
      'Công thức clamp chỉ dùng `vw` (như `clamp(1rem, 2.5vw, 2rem)`): Khi người dùng bấm Zoom 200% trên trình duyệt, kích thước `vw` không hề thay đổi khiến chữ không to lên, vi phạm tiêu chuẩn tiếp cận bắt buộc.',
      'Không nắm được công thức tính toán độ dốc (Slope) và điểm cắt (Intercept) mà chỉ điền các con số ước lượng ngẫu nhiên.',
      'Áp dụng Fluid Typography cho cả các đoạn văn bản dài (Body text) gây khó đọc trên các màn hình kích thước trung bình.'
    ],
    followUpQuestions: [
      'Công thức toán học chuẩn để tính giá trị ở giữa của `clamp(min, preferred, max)` dựa trên 2 điểm gãy (Min Viewport và Max Viewport) là gì?',
      'Tại sao chỉ nên áp dụng Fluid Typography cho tiêu đề lớn (`<h1> - <h3>`), còn nội dung văn bản thường (`body`) nên giữ kích thước ổn định?'
    ]
  },

  'css-082': {
    interviewerIntent: 'Kiểm tra kiến thức tối ưu hóa animation hiệu năng cao (High-Performance Animation): Hiểu lý do tại sao animate `transform: translateX()` đạt chuẩn 60fps mượt mà trong khi `left` hoặc `width` bị giật cục.',
    contextOrScenario: 'Một thanh Drawer Menu trượt từ cạnh trái màn hình ra. Trên máy tính mạnh thì menu chạy bình thường, nhưng trên điện thoại Android cấu hình thấp thì hiệu ứng trượt bị giật lag, xé hình và đơ cảm ứng.',
    expectedKeywords: ['Hardware Accelerated Animations', 'transform vs left/top', 'Layout Reflow Avoidance', 'Compositor Thread Execution', 'Offloading to GPU', '60fps Frame Budget (16.6ms)'],
    pitfalls: [
      'Animate các thuộc tính hình học (`left`, `right`, `margin`, `width`) làm trình duyệt phải tính toán lại Layout và vẽ lại Paint trên từng khung hình 16.6ms.',
      'Chạy animation trên Main Thread của JavaScript khiến animation bị đứng hình mỗi khi có tác vụ JS nặng chạy ngầm.',
      'Quên kiểm tra hiệu năng trên thiết bị di động thực tế có cấu hình yếu (Low-end Android devices).'
    ],
    followUpQuestions: [
      'Tại sao các chuyển động điều khiển bằng `transform` và `opacity` có thể chạy độc lập trên Compositor Thread của trình duyệt ngay cả khi Main Thread bị nghẽn?',
      'Cách sử dụng Performance panel trong Chrome DevTools để đo lường FPS và phát hiện các khung hình bị rơi (Dropped Frames)?'
    ]
  },

  'css-083': {
    interviewerIntent: 'Kiểm tra sự thông thạo các pseudo-classes chức năng hiện đại: Phân biệt chính xác cú pháp và hành vi Specificity giữa `:is()`, `:where()`, và `:not()`.',
    contextOrScenario: 'Lập trình viên muốn style cho tất cả các nút bấm KHÔNG PHẢI là nút phụ (`:not(.btn-secondary)`), hoặc gom nhóm các tiêu đề bên trong nhiều thẻ chứa khác nhau một cách ngắn gọn.',
    expectedKeywords: [':is(), :where(), :not() Comparison', 'Specificity Calculation Rules', 'Zero Specificity vs Highest Specificity', 'Complex Selectors in :not()', 'CSS Code Deduplication', 'Selector Specificity Balance'],
    pitfalls: [
      'Nghĩ rằng `:not()` có độ ưu tiên bằng 0 (thực tế `:not()` lấy độ ưu tiên của selector con nặng nhất nằm trong dấu ngoặc của nó).',
      'Lồng quá nhiều selector phủ định `:not()` phức tạp làm code trở nên cực kỳ khó hiểu và khó bảo trì.',
      'Không biết rằng trong CSS hiện đại, `:not()` đã hỗ trợ truyền vào một danh sách nhiều selector cách nhau bằng dấu phẩy (như `:not(.primary, .danger)`).'
    ],
    followUpQuestions: [
      'Tính điểm Specificity của `:not(.btn, #submit)` so với `:is(.btn, #submit)` và `:where(.btn, #submit)`?',
      'Cách viết `:is(header, footer) :where(h1, h2)` giúp style nhanh tiêu đề mà vẫn cho phép ghi đè dễ dàng ra sao?'
    ]
  },

  'css-084': {
    interviewerIntent: 'Kiểm tra kỹ năng căn giữa phần tử trong Flexbox (The Holy Grail of Centering): Nắm vững 3 cách căn giữa cả ngang lẫn dọc và các trường hợp sử dụng tối ưu.',
    contextOrScenario: 'Cần căn giữa hoàn hảo một chiếc Modal Popup hoặc một biểu tượng Loading Spinner cả theo chiều ngang lẫn chiều dọc trên toàn màn hình.',
    expectedKeywords: ['Centering in Flexbox', 'justify-content: center & align-items: center', 'margin: auto on Flex Item', 'place-content: center (Grid shorthand in Flex)', 'Full-height Centering (min-height: 100vh)', 'Cross Axis Centering'],
    pitfalls: [
      'Quên đặt chiều cao cho container cha (`min-height: 100vh` hoặc `height: 100%`), khiến container chỉ cao bằng đúng phần tử con nên không thấy tác dụng căn giữa dọc.',
      'Sử dụng các kỹ thuật cũ như `position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%);` cho các layout thông thường.',
      'Không biết rằng chỉ cần đặt `margin: auto` trên chính phần tử con của Flexbox là nó tự động căn giữa cả ngang lẫn dọc một cách kỳ diệu.'
    ],
    followUpQuestions: [
      'Tại sao thuộc tính `margin: auto` trên một Flex Item lại tự động chia đều không gian thừa ở cả 4 hướng (trên, dưới, trái, phải)?',
      'Cách căn giữa bằng CSS Grid: `display: grid; place-items: center;` chỉ tốn đúng 2 dòng code so sánh với Flexbox ra sao?'
    ]
  },

  'css-085': {
    interviewerIntent: 'Đo lường mức độ nắm bắt công nghệ CSS Grid cấp cao: Hiểu rõ vấn đề mà CSS Subgrid (`subgrid`) giải quyết khi các phần tử con lồng sâu cần chia sẻ chung đường lưới với Grid cha.',
    contextOrScenario: 'Một hàng gồm 3 Card sản phẩm: Mỗi Card có ảnh, tiêu đề (độ dài ngắn khác nhau), đoạn mô tả và nút bấm mua hàng. Lập trình viên muốn tiêu đề của cả 3 card thẳng hàng với nhau, và các nút bấm mua hàng luôn nằm thẳng tắp ở đáy của hàng, bất kể độ dài mô tả của từng card dài ngắn ra sao.',
    expectedKeywords: ['CSS Subgrid', 'grid-template-rows: subgrid', 'Nested Grid Alignment', 'Sharing Parent Grid Tracks', 'Independent Card Internal Alignment', 'Cross-Component Track Synchronization'],
    pitfalls: [
      'Dùng Flexbox hoặc Grid lồng thông thường: Mỗi Card có một hệ thống layout độc lập, khiến tiêu đề dài của Card 1 không thể làm giãn khoảng cách tiêu đề của Card 2 và 3.',
      'Gán chiều cao cố định bằng pixel cho tiêu đề để ép thẳng hàng (làm vỡ giao diện khi chữ bị tràn hoặc ở màn hình khác).',
      'Quên rằng Subgrid đòi hỏi container con phải khai báo chiếm bao nhiêu hàng của Grid cha trước (`grid-row: span 3;`).'
    ],
    followUpQuestions: [
      'CSS Subgrid giải quyết bài toán "Căn chỉnh các phần tử con cháu bên trong nhiều Card khác nhau vào cùng một hệ thống đường gióng ngang" ra sao?',
      'Cách viết cú pháp: `display: grid; grid-template-rows: subgrid;` trên phần tử con của Grid?'
    ]
  },

  'css-086': {
    interviewerIntent: 'Kiểm tra kỹ năng định vị phần tử thủ công trên CSS Grid: Nắm vững cú pháp đặt vị trí qua đường lưới (Line-based Placement: `grid-column`, `grid-row`) và từ khóa `span`.',
    contextOrScenario: 'Thiết kế bố cục lưới hình ảnh nghệ thuật (Bento Grid): Ảnh nổi bật đầu tiên chiếm 2 cột và 2 hàng, các ảnh phụ xung quanh chiếm 1 cột 1 hàng.',
    expectedKeywords: ['Grid Placement', 'grid-column & grid-row', 'Grid Line Numbers (1-based)', 'Negative Line Numbers (-1)', 'span Keyword', 'Overlapping Grid Elements'],
    pitfalls: [
      'Nhầm lẫn giữa số thứ tự Cột (Track) và số thứ tự Đường lưới (Grid Line): Ví dụ một lưới 3 cột có 4 đường lưới từ 1 đến 4.',
      'Sử dụng `grid-column: 1 / 3` (chiếm từ đường 1 đến đường 3, tức 2 cột) nhưng tưởng là chiếm 3 cột.',
      'Không biết cách dùng số âm: `grid-column: 1 / -1` để kéo dài phần tử xuyên suốt toàn bộ chiều rộng của lưới bất kể lưới có bao nhiêu cột.'
    ],
    followUpQuestions: [
      'Từ khóa `span` (ví dụ: `grid-column: span 2`) có ưu thế gì so với việc chỉ định số đường lưới cố định (`1 / 3`) khi thứ tự phần tử bị thay đổi?',
      'Làm thế nào để xếp chồng 2 phần tử lên nhau trong cùng một ô Grid (ví dụ: ảnh nền và lớp chữ đè lên trên) mà không cần dùng `position: absolute`?'
    ]
  },

  'css-088': {
    interviewerIntent: 'Đánh giá kiến thức chuyên sâu về cơ chế dựng hình của trình duyệt: Phân biệt rõ rệt giữa Reflow (Layout) và Repaint, chi phí hiệu năng và cách viết code tối ưu.',
    contextOrScenario: 'Một trang web chạy các hiệu ứng động bị giật lag nghiêm trọng. Kiểm tra Performance tab thấy trình duyệt liên tục chạy các tác vụ "Layout" và "Paint" chiếm hết 100% thời gian của Main Thread.',
    expectedKeywords: ['Reflow (Layout Calculation)', 'Repaint (Rasterization)', 'Rendering Pipeline Cost', 'Geometry Changes vs Visual Style Changes', 'Forced Synchronous Layout', 'Composite-Only Properties'],
    pitfalls: [
      'Cho rằng Reflow và Repaint là một: Reflow là tính toán lại hình học/tọa độ của toàn bộ cây DOM (cực kỳ đắt đỏ), còn Repaint chỉ là vẽ lại màu sắc/pixel.',
      'Mỗi lần Reflow đều BẮT BUỘC kéo theo một lần Repaint sau đó (nhưng Repaint chưa chắc đã gây ra Reflow).',
      'Thực hiện đọc và ghi thuộc tính DOM xen kẽ trong vòng lặp JavaScript (Layout Thrashing).'
    ],
    followUpQuestions: [
      'Những thuộc tính CSS nào chỉ kích hoạt Repaint mà không gây Reflow (ví dụ: `color`, `background-color`, `box-shadow`)?',
      'Tại sao việc thay đổi `transform` và `opacity` bỏ qua cả Reflow lẫn Repaint để đi thẳng vào bước Composite?'
    ]
  },

  'css-089': {
    interviewerIntent: 'Kiểm tra kiến thức cập nhật về Không gian màu thế hệ mới trong CSS Color Module Level 4: Sự ra đời của `oklch()`, `lab()`, `lch()` và khả năng thể hiện màu sắc rực rỡ hơn trên màn hình hiện đại.',
    contextOrScenario: 'Màn hình máy tính và điện thoại đời mới đều hỗ trợ chuẩn Display P3 (hiển thị được nhiều màu hơn 25% so với chuẩn sRGB cũ). Việc chỉ dùng mã màu Hex (`#ff0000`) hoặc `rgb()` làm lãng phí khả năng hiển thị màu sắc sống động của phần cứng.',
    expectedKeywords: ['CSS Color Module Level 4', 'oklch() and lab()', 'Display P3 Wide Gamut', 'Human Visual Perception', 'Chroma & Lightness Control', 'Color Mixing (color-mix())'],
    pitfalls: [
      'Vẫn nghĩ rằng mã màu Hex `#RRGGBB` có thể biểu diễn được toàn bộ mọi màu sắc mà mắt người nhìn thấy.',
      'Sử dụng `hsl()` để tính toán màu tương phản trong Design System mà không biết HSL bị méo độ sáng cảm nhận.',
      'Không biết cách sử dụng hàm `color-mix(in oklch, red 30%, blue)` để pha trộn màu sắc linh hoạt trong CSS thuần.'
    ],
    followUpQuestions: [
      'Hàm `color-mix()` trong CSS hiện đại thay thế cho các hàm `darken()` và `lighten()` của SASS/SCSS như thế nào?',
      'Tại sao `oklch()` được xem là tiêu chuẩn vàng tương lai cho toàn bộ các Design System hiện đại?'
    ]
  },

  'css-090': {
    interviewerIntent: 'Đánh giá việc áp dụng tính năng Native CSS Nesting (Viết lồng CSS nguyên bản): Cú pháp chuẩn W3C, cách thức hoạt động của ký tự `&` và sự khác biệt với SASS/SCSS lồng nhau.',
    contextOrScenario: 'Dự án muốn loại bỏ bộ tiền xử lý SASS/SCSS để tăng tốc độ build và dùng CSS thuần túy. Lập trình viên muốn viết lồng các selector con và pseudo-classes (`:hover`, `&--active`) trực tiếp trong file CSS chuẩn.',
    expectedKeywords: ['Native CSS Nesting', 'Nesting Selector (&)', 'W3C CSS Nesting Spec', 'Eliminating SASS Build Step', 'Specificity with Nested Selectors (:is())', 'Invalid Concatenation (&__element Trap)'],
    pitfalls: [
      'Tưởng rằng CSS Nesting có thể nối chuỗi BEM như SASS: Viết `.block { &__element { ... } }` sẽ KHÔNG hoạt động trong Native CSS Nesting (CSS nguyên bản không hỗ trợ nối chuỗi tên class, `&` luôn đại diện cho một selector hoàn chỉnh).',
      'Lồng selector quá 3-4 cấp: Tạo ra các selector có độ ưu tiên quá cao và khó bảo trì.',
      'Không biết rằng Native CSS Nesting ngầm bọc selector trong `:is()`, ảnh hưởng đến cách tính Specificity.'
    ],
    followUpQuestions: [
      'Tại sao cú pháp SASS BEM hack `&__element` không thể chạy được trong Native CSS Nesting?',
      'Khác biệt giữa việc viết `& .child` (con cháu) và `.parent &` (phần tử cha bao bọc) trong Native Nesting là gì?'
    ]
  },

  'css-092': {
    interviewerIntent: 'Kiểm tra kỹ năng tối ưu hóa JavaScript & CSS tương tác (Rendering Performance): Hiểu rõ hiện tượng Layout Thrashing (ép trình duyệt Reflow liên tục) và cách phòng tránh bằng Batching / `requestAnimationFrame`.',
    contextOrScenario: 'Một hàm JavaScript duyệt qua danh sách 100 phần tử để đọc chiều cao và đặt lại chiều cao mới: `for (let el of items) { const h = el.offsetHeight; el.style.height = (h + 10) + "px"; }`. Vòng lặp làm trang web bị đơ cứng suốt 500ms.',
    expectedKeywords: ['Layout Thrashing', 'Forced Synchronous Layout', 'Read-then-Write Batching', 'FastDOM Library Pattern', 'requestAnimationFrame', 'Decoupling DOM Operations'],
    pitfalls: [
      'Đọc thuộc tính hình học (Read: `offsetHeight`, `scrollTop`, `getBoundingClientRect`) ngay sau khi vừa Ghi thuộc tính hình học (Write: `style.width = ...`), ép trình duyệt phải dừng lại tính toán Layout tức thì.',
      'Chạy các thao tác can thiệp DOM nặng hạt bên trong sự kiện cuộn `scroll` hoặc di chuột `mousemove` mà không có Throttling/Debouncing.',
      'Không sử dụng `ResizeObserver` để theo dõi kích thước phần tử một cách bất đồng bộ an toàn.'
    ],
    followUpQuestions: [
      'Quy tắc vàng để triệt tiêu Layout Thrashing: "Tách biệt toàn bộ thao tác ĐỌC thành một đợt (Batch Reads), sau đó mới thực thi toàn bộ thao tác GHI (Batch Writes)" vận hành ra sao?',
      'Hàm `requestAnimationFrame` giúp đồng bộ việc cập nhật style với tần số làm tươi màn hình của trình duyệt như thế nào?'
    ]
  },

  'css-093': {
    interviewerIntent: 'Đo lường sự nắm bắt công nghệ Animation hiện đại nhất: Hiểu rõ CSS Scroll-Driven Animations (`animation-timeline: scroll()` và `view()`) giúp tạo hiệu ứng cuộn trang mượt mà 60fps hoàn toàn bằng CSS.',
    contextOrScenario: 'Cần làm thanh tiến độ đọc bài viết trên đầu trang (Reading Progress Bar co giãn từ 0% đến 100% khi cuộn bài viết), hoặc hiệu ứng ảnh mờ dần và trượt lên khi lướt tới màn hình. Trước đây phải viết JS lắng nghe sự kiện `scroll` rất nặng nề.',
    expectedKeywords: ['Scroll-Driven Animations', 'animation-timeline: scroll()', 'animation-timeline: view()', 'Scroll Progress Timeline', 'View Progress Timeline', 'Zero-JS Parallax & Progress'],
    pitfalls: [
      'Tiếp tục dùng JavaScript lắng nghe sự kiện `window.onscroll` để cập nhật style inline (chạy trên Main Thread, dễ bị giật lag và tốn pin).',
      'Nhầm lẫn giữa `scroll()` (gắn timeline theo khoảng cách cuộn của Container) và `view()` (gắn timeline theo vị trí của chính phần tử đó khi đi vào/ra khỏi Viewport).',
      'Quên kiểm tra hỗ trợ trình duyệt (cần có fallback an toàn cho các trình duyệt chưa kích hoạt tính năng mới này).'
    ],
    followUpQuestions: [
      'Thuộc tính `animation-range: entry 0% cover 100%` điều khiển các giai đoạn kích hoạt của View Progress Timeline như thế nào?',
      'Tại sao Scroll-Driven Animations viết bằng CSS có thể chạy mượt mà 120fps trên màn hình ProMotion ngay cả khi JavaScript Main Thread đang bị đóng băng?'
    ]
  },

  'css-094': {
    interviewerIntent: 'Kiểm tra kiến thức tiên phong về CSS Anchor Positioning: Tính năng mang tính cách mạng giúp gắn kết các phần tử nổi (Tooltips, Popovers, Dropdowns) với phần tử mỏ neo mà không cần thư viện JavaScript như Floating UI hay Popper.js.',
    contextOrScenario: 'Cần thiết lập một Tooltip bay bám sát theo một nút bấm. Khi trang web cuộn hoặc nút bấm di chuyển vị trí, Tooltip phải tự động dịch chuyển theo mỏ neo đó và tự động lật hướng (Flip) nếu chạm mép màn hình.',
    expectedKeywords: ['CSS Anchor Positioning', 'anchor-name: --my-anchor', 'position-anchor', 'anchor() function', 'position-try-options (flip-block)', 'Eliminating Popper.js / Floating UI'],
    pitfalls: [
      'Nghĩ rằng phần tử con bắt buộc phải nằm lồng bên trong phần tử cha trong mã HTML mới định vị theo nhau được (Anchor Positioning cho phép 2 phần tử nằm ở 2 nhánh DOM hoàn toàn khác nhau vẫn gắn kết được).',
      'Không cấu hình `position-try-options` dẫn đến Tooltip bị tràn ra ngoài mép màn hình khi mỏ neo nằm sát mép.',
      'Sử dụng các thư viện JavaScript hàng chục Kilobytes chỉ để tính toán tọa độ tooltip khi CSS nguyên bản đã hỗ trợ.'
    ],
    followUpQuestions: [
      'Hàm `anchor(--button-anchor bottom)` thiết lập tọa độ của phần tử nổi dựa trên các cạnh của phần tử mỏ neo ra sao?',
      'Tính năng `position-try-options: flip-block, flip-inline;` tự động xử lý va chạm mép màn hình như thế nào?'
    ]
  },

  'css-095': {
    interviewerIntent: 'Đánh giá hiểu biết sâu sắc về CSS Houdini API: Cú pháp `@property` cho phép định nghĩa kiểu dữ liệu (Type-Checking), giá trị mặc định và KHẢ NĂNG ANIMATE GRADIENT cho Biến CSS.',
    contextOrScenario: 'Lập trình viên muốn tạo hiệu ứng chuyển màu nền Gradient xoay tròn mượt mà bằng cách animate biến `--angle: 0deg -> 360deg`. Nếu dùng biến CSS thông thường, trình duyệt coi biến là chuỗi văn bản thuần túy và không thể nội suy (interpolate) chuyển động mượt được.',
    expectedKeywords: ['@property rule (CSS Houdini)', 'Typed CSS Custom Properties', 'syntax: "<angle>" / "<color>"', 'inherits: false', 'Animatable Gradients', 'CSS Type Safety'],
    pitfalls: [
      'Animate biến CSS thông thường mà không khai báo `@property`: Trình duyệt chỉ nhảy giật giá trị ở khung hình cuối cùng thay vì chuyển tiếp mượt mà.',
      'Khai báo thiếu bất kỳ một trong 3 thuộc tính bắt buộc của `@property`: `syntax`, `inherits`, hoặc `initial-value` (thiếu 1 trong 3 rule sẽ bị coi là không hợp lệ).',
      'Để `inherits: true` cho các biến tính toán cục bộ, làm biến bị rò rỉ và tính toán lại trên toàn bộ cây con.'
    ],
    followUpQuestions: [
      'Tại sao việc khai báo kiểu dữ liệu `syntax: "<color>"` cho phép trình duyệt hiểu và nội suy màu sắc trong animation mượt mà?',
      'Cách sử dụng `@property` để animate thuộc tính `border-image` hoặc chuyển đổi tỷ lệ phần trăm trong biểu đồ tròn (Conic Gradient)?'
    ]
  },

  'css-097': {
    interviewerIntent: 'Kiểm tra việc sử dụng HTML/CSS chuẩn hóa mới: Popover API và pseudo-element `::backdrop`, pseudo-class `:popover-open` thay thế các giải pháp Modal tự chế.',
    contextOrScenario: 'Cần làm một Menu Action hoặc Dialog Thông báo nổi: Tự động nằm trên Top Layer của trình duyệt (không bao giờ bị `z-index` hay `overflow: hidden` của phần tử khác che khuất), tự động đóng khi click ra ngoài (Light Dismiss) và bấm phím Escape.',
    expectedKeywords: ['Popover API (popover attribute)', 'Top Layer of Browser', 'Light Dismiss & Escape Key Handling', '::backdrop Pseudo-element', ':popover-open Selector', 'Accessible Non-Modal Overlays'],
    pitfalls: [
      'Tự viết hàng chục dòng JavaScript để bắt sự kiện click outside và phych key Escape trong khi Popover API đã tích hợp sẵn mặc định.',
      'Nhầm lẫn giữa Popover (non-modal hoặc modal không chặn tương tác) và thẻ `<dialog modal>` (chặn hoàn toàn tương tác của phần còn lại của trang).',
      'Cố gắng đặt `z-index: 999999` cho phần tử nổi trong khi Popover tự động được đưa lên Top Layer độc tôn của trình duyệt.'
    ],
    followUpQuestions: [
      'Cơ chế "Top Layer" của trình duyệt giải quyết vĩnh viễn bài toán Stacking Context và `overflow: hidden` của các menu/modal như thế nào?',
      'Pseudo-element `::backdrop` dùng để style lớp màn mờ phía sau Popover ra sao?'
    ]
  },

  'css-098': {
    interviewerIntent: 'Đo lường sự hiểu biết về tiến trình lịch sử kiến trúc layout web: Lý do tại sao CSS Grid là giải pháp tối thượng cho bố cục tổng thể trang web (Page Layout) so với các giải pháp legacy (Float, Table, Absolute Positioning).',
    contextOrScenario: 'Dự án kế thừa mã nguồn từ 8 năm trước: Bố cục trang web dùng `float: left` kết hợp Clearfix hacks và tính toán `width: 33.333%`. Nhóm cần lập luận vững chắc để thuyết phục cấp trên cho phép tái cấu trúc sang CSS Grid.',
    expectedKeywords: ['CSS Grid for Page Layout', 'Float & Clearfix Legacy Flaws', 'True Two-Dimensional Control', 'Separation of Content and Presentation', 'Clean DOM Structure', 'Grid Track Resilience'],
    pitfalls: [
      'Tiếp tục sử dụng Float cho dàn trang: Float vốn được thiết kế chỉ để cho chữ chạy bao quanh ảnh trong bài báo, việc dùng nó dàn trang là một hack lịch sử gây ra vô số lỗi vỡ layout.',
      'Sử dụng các thẻ `<div>` lồng nhau vô nghĩa (Div Soup / Wrapper Hell) để cố gắng chia cột.',
      'Lo ngại về khả năng hỗ trợ trình duyệt: CSS Grid đã được hỗ trợ 100% trên toàn cầu từ năm 2017.'
    ],
    followUpQuestions: [
      'CSS Grid giải phóng mã nguồn HTML khỏi các thẻ bọc thừa (Wrapper Divs) như thế nào?',
      'Tại sao việc kết hợp CSS Grid cho khung xương ngoài (Macro-layout) và Flexbox cho các phần tử bên trong (Micro-layout) là kiến trúc chuẩn mực nhất?'
    ]
  },

  'css-099': {
    interviewerIntent: 'Kiểm tra khả năng thiết lập công thức toán học cho Fluid Typography: Cách suy ra công thức nội suy tuyến tính (Linear Interpolation) cho hàm `clamp()` một cách chính xác tuyệt đối.',
    contextOrScenario: 'Design System yêu cầu: Cỡ chữ tiêu đề phải chính xác là 20px khi màn hình rộng 400px, và tăng đều đặn tuyến tính cho đến khi đạt chính xác 36px khi màn hình rộng 1200px. Cần viết công thức `clamp()` chuẩn xác.',
    expectedKeywords: ['Fluid Typography Math', 'Linear Interpolation Formula', 'Slope (Độ dốc) Calculation', 'y-intercept (Điểm cắt trục tung)', 'Viewports Range (400px - 1200px)', 'CSS Lock Technique'],
    pitfalls: [
      'Điền các con số ước lượng theo cảm tính, khiến kích thước font chữ không khớp với bản thiết kế Figma ở các kích thước màn hình mục tiêu.',
      'Quên đổi đơn vị sang `rem` cho giá trị tối thiểu và tối đa để tôn trọng tùy chọn cỡ chữ của người dùng trong trình duyệt.',
      'Không hiểu bản chất của kỹ thuật "CSS Lock" chặn không cho kích thước vượt ra ngoài 2 đầu chặn.'
    ],
    followUpQuestions: [
      'Công thức tính Độ dốc: `Slope = (MaxFontSize - MinFontSize) / (MaxViewport - MinViewport)` và áp dụng vào `clamp()` như thế nào?',
      'Làm thế nào để tạo một SCSS Mixin hoặc CSS Custom Property tính toán tự động công thức này?'
    ]
  },

  'css-100': {
    interviewerIntent: 'Đánh giá năng lực thiết kế Hệ thống Thiết kế (Design Systems Architecture): Bản chất của Design Tokens, sự phân cấp 3 tầng (Global / Alias / Component Tokens) và khả năng chuyển đổi đa nền tảng.',
    contextOrScenario: 'Một tập đoàn có hệ sinh thái gồm Web (React/Tailwind), Mobile iOS (SwiftUI) và Android (Jetpack Compose). Đội ngũ thiết kế đổi màu thương hiệu từ Xanh sang Tím. Cần một hệ thống Design Tokens duy nhất để khi thay đổi, toàn bộ 3 nền tảng tự động cập nhật màu mới mà không cần lập trình viên sửa code thủ công từng nơi.',
    expectedKeywords: ['Design Tokens Architecture', 'Global / Primitive Tokens', 'Alias / Semantic Tokens', 'Component-specific Tokens', 'Style Dictionary Tool', 'Multi-Platform Export (CSS, iOS, Android)'],
    pitfalls: [
      'Chỉ lưu Design Tokens dưới dạng biến SASS hoặc file CSS thông thường (khiến các nền tảng mobile iOS/Android không thể tiêu thụ được).',
      'Chỉ có 1 tầng token thô (ví dụ: dùng trực tiếp `var(--blue-500)` trong component): Khi muốn đổi màu primary sang màu tím, phải đi sửa hàng nghìn component.',
      'Thiếu tầng Semantic Tokens (như `--surface-primary`, `--text-danger`, `--interactive-hover`).'
    ],
    followUpQuestions: [
      'Công cụ Style Dictionary của Amazon biên dịch một file `tokens.json` thành CSS Variables, iOS Swift struct, và Android Compose theme như thế nào?',
      'Tại sao việc phân tách 3 tầng Token (Primitive -> Semantic -> Component) là nền tảng cốt lõi của mọi Design System thành công (như Google Material You hay Salesforce Lightning)?'
    ]
  }
};

let count = 0;
for (const [id, update] of Object.entries(batch3)) {
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
console.log(`Enriched CSS Metadata Batch 3: ${count} questions updated.`);
