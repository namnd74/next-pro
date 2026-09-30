import fs from 'node:fs';
import path from 'node:path';

const filePath = path.resolve('src/features/interview/data/json/html-bank.json');
const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));

const batch1Updates = {
  'html-012': {
    summary: 'HTML5 mang tính đột phá so với HTML4 ở 4 trụ cột: (1) **Semantic Elements** mới (`<header>`, `<nav>`, `<article>`, `<main>`, `<dialog>`); (2) **Native Multimedia** không cần Flash (`<video>`, `<audio>`, `<canvas>`); (3) **Form Types & Validation** (`email`, `date`, `pattern`); (4) **Web APIs mạnh mẽ** (Web Storage, Web Workers, Geolocation, WebSocket).',
    deepDive: 'HTML4 yêu cầu khai báo DOCTYPE dài dòng phức tạp và phụ thuộc vào các plugin ngoài độc hại như Adobe Flash/Silverlight để phát video hoặc vẽ đồ họa. HTML5 đơn giản hóa `<!DOCTYPE html>`, chuẩn hóa cách xử lý lỗi cú pháp của trình duyệt (HTML Parser spec), và tích hợp thẳng phần cứng đồ họa (GPU Canvas/WebGL) vào trình duyệt.',
    codeExample: `<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Cấu trúc chuẩn HTML5</title>
</head>
<body>
  <header><nav aria-label="Menu chính">...</nav></header>
  <main>
    <article>
      <h1>Tiêu đề bài viết</h1>
      <video controls width="640" poster="/thumb.jpg">
        <source src="/video.mp4" type="video/mp4">
      </video>
    </article>
  </main>
  <footer>...</footer>
</body>
</html>`
  },

  'html-014': {
    summary: 'Method **GET**: Dữ liệu gửi đính kèm trên URL (Query String), có giới hạn độ dài (~2KB-8KB tùy browser), có thể Bookmark và Cache được, KHÔNG dùng cho dữ liệu nhạy cảm (mật khẩu, thẻ); Method **POST**: Dữ liệu gửi ngầm trong Request Body, không giới hạn độ dài, không bị cache mặc định, bảo mật hơn cho việc thay đổi trạng thái máy chủ.',
    deepDive: 'Theo đặc tả HTTP RFC: GET là phương thức **Safe và Idempotent** (chỉ đọc dữ liệu, gọi 100 lần không làm thay đổi trạng thái server). POST là **Non-Idempotent** (mỗi lần bấm submit có thể tạo ra 1 đơn hàng mới). Dùng GET cho form tìm kiếm (`/search?q=phone`); Dùng POST cho form đăng nhập, thanh toán, upload file.',
    codeExample: `<!-- 1. Form Tìm kiếm: Dùng GET (cho phép copy link kết quả tìm kiếm) -->
<form action="/search" method="GET">
  <input type="search" name="q" placeholder="Tìm sản phẩm...">
  <button type="submit">Tìm</button>
</form>

<!-- 2. Form Đăng nhập: BẮT BUỘC dùng POST (bảo mật mật khẩu, chống lưu trong lịch sử URL) -->
<form action="/api/login" method="POST">
  <input type="email" name="email" autocomplete="username" required>
  <input type="password" name="password" autocomplete="current-password" required>
  <button type="submit">Đăng nhập</button>
</form>`
  },

  'html-015': {
    summary: 'HTML5 giới thiệu các kiểu input chuyên dụng: `email`, `tel`, `url`, `number`, `date`, `time`, `color`, `range`, `search`. Lợi ích lớn nhất là: **Tự động kích hoạt bàn phím ảo tối ưu trên Mobile** (bàn phím số cho `tel`, phím `@` cho `email`) và hỗ trợ xác thực client-side native mà không cần viết regex JS.',
    deepDive: 'Khi dùng `type="number"`, trên mobile sẽ hiện bàn phím số nhưng có mũi tên tăng/giảm và cho phép gõ ký tự khoa học `e`. Mẹo UX thực chiến cho mã OTP hoặc Số thẻ ngân hàng: Nên dùng `<input type="text" inputmode="numeric" pattern="[0-9]*">` để vừa hiện bàn phím số thuần túy vừa không có nút tăng giảm phiền toái.',
    codeExample: `<!-- Nhập mã OTP 6 số tối ưu 100% bàn phím Mobile -->
<input 
  type="text" 
  name="otp" 
  inputmode="numeric" 
  pattern="[0-9]{6}" 
  maxlength="6"
  autocomplete="one-time-code" 
  aria-label="Mã xác thực 6 số"
  required
>`
  },

  'html-016': {
    summary: 'Thẻ `<label>` gắn nhãn tên ngữ nghĩa cho form control. Tầm quan trọng: (1) **Trợ năng (a11y)**: Giúp thiết bị đọc màn hình (Screen Reader) đọc to tên trường khi người khiếm thị focus vào ô input; (2) **UX bấm chạm**: Mở rộng vùng click/tap (bấm vào chữ label là tự động focus hoặc tick checkbox).',
    deepDive: 'Tuyệt đối KHÔNG dùng thuộc tính `placeholder` để thay thế cho `<label>`: Placeholder sẽ biến mất ngay khi người dùng bắt đầu gõ chữ, khiến người dùng (hoặc người suy giảm trí nhớ) không biết ô đó đang yêu cầu nhập thông tin gì, và màu xám mờ của placeholder thường vi phạm tiêu chuẩn tương phản WCAG 4.5:1.',
    codeExample: `<!-- Cách 1: Liên kết qua thuộc tính for và id (Khuyên dùng nhất) -->
<label for="user-email">Địa chỉ Email của bạn:</label>
<input type="email" id="user-email" name="email" required>

<!-- Cách 2: Lồng trực tiếp input vào bên trong label -->
<label class="checkbox-container">
  <input type="checkbox" name="terms" required>
  <span>Tôi đồng ý với Điều khoản dịch vụ</span>
</label>`
  },

  'html-017': {
    summary: 'Khác biệt giữa `<select>` và `<datalist>`: **`<select>`** ép người dùng chỉ được phép chọn duy nhất trong danh sách các phương án cố định có sẵn; trong khi **`<datalist>`** hoạt động như một công cụ **Autocomplete / Gợi ý**: Người dùng vừa có thể chọn từ gợi ý, vừa có thể tự do gõ bất kỳ giá trị mới nào khác.',
    deepDive: '`<datalist>` không hiển thị trực tiếp mà được liên kết với một thẻ `<input>` thông thường qua thuộc tính `list="datalist-id"`. Cực kỳ phù hợp cho các form nhập Tên trường đại học, Quốc gia, hoặc Sân bay: Người dùng có thể gõ tìm nhanh hoặc chọn từ danh sách 100 gợi ý mà không bị gò bó như dropdown `<select>`.',
    codeExample: `<!-- Input tự do kèm Autocomplete Gợi ý bằng Datalist -->
<label for="browser-choice">Trình duyệt yêu thích:</label>
<input type="text" id="browser-choice" name="browser" list="browser-suggestions" placeholder="Gõ để tìm kiếm...">

<datalist id="browser-suggestions">
  <option value="Google Chrome">
  <option value="Mozilla Firefox">
  <option value="Apple Safari">
  <option value="Microsoft Edge">
  <option value="Brave">
</datalist>`
  },

  'html-018': {
    summary: 'Thẻ `<fieldset>` dùng để gom nhóm các form controls có liên quan chặt chẽ với nhau (ví dụ: nhóm Radio buttons, thông tin địa chỉ giao hàng); Thẻ `<legend>` là thẻ con đầu tiên bên trong `<fieldset>`, đóng vai trò làm tiêu đề chú thích cho toàn bộ nhóm phần tử đó.',
    deepDive: 'Trong tiêu chuẩn Accessibility (WCAG 1.3.1): Với một nhóm các nút Radio chọn "Phương thức thanh toán" (MoMo, Visa, COD), nếu chỉ đặt text `<h3>Phương thức thanh toán</h3>` phía trên, Screen Reader khi tab vào từng radio sẽ chỉ đọc "MoMo, radio button", người khiếm thị không biết radio này phục vụ câu hỏi gì. Dùng `<fieldset><legend>` giúp Screen Reader luôn đọc to tiêu đề trước khi đọc từng tùy chọn.',
    codeExample: `<fieldset>
  <legend>Phương thức thanh toán</legend>
  
  <label>
    <input type="radio" name="payment" value="momo" checked>
    Ví MoMo
  </label>
  <label>
    <input type="radio" name="payment" value="credit_card">
    Thẻ tín dụng quốc tế
  </label>
</fieldset>`
  },

  'html-019': {
    summary: 'Web Accessibility (a11y) là việc thiết kế và phát triển trang web sao cho mọi người (bao gồm người khuyết tật: khiếm thị, khiếm thính, suy giảm vận động cơ học, suy giảm nhận thức) đều có thể tiếp cận, hiểu, điều hướng và tương tác với trang web một cách bình đẳng.',
    deepDive: 'a11y không chỉ là lòng trắc ẩn mà còn là: (1) **Trách nhiệm pháp lý**: Luật châu Âu (European Accessibility Act - EAA) và Mỹ (ADA Title III) xử phạt nặng các website không đạt WCAG 2.1 AA; (2) **Tối ưu SEO**: Cây cấu trúc mà Screen Reader đọc cũng chính là cây ngữ nghĩa mà Googlebot crawl; (3) **Tăng tỷ lệ chuyển đổi (CRO)**: Giúp người dùng bình thường thao tác nhanh hơn qua phím bấm.',
    codeExample: `<!-- Giao diện chuẩn a11y: Dễ tiếp cận cho cả bàn phím và Screen Reader -->
<button type="button" aria-expanded="false" aria-controls="mobile-menu" class="menu-toggle">
  <svg aria-hidden="true" focusable="false" width="24" height="24">...</svg>
  <span class="sr-only">Mở menu điều hướng</span>
</button>`
  },

  'html-020': {
    summary: 'ARIA (Accessible Rich Internet Applications) là bộ thuộc tính bổ sung (bắt đầu bằng `aria-*` và `role="..."`) giúp bổ sung ngữ nghĩa và trạng thái cho các component giao diện phức tạp (như Modal, Accordion, Tablist) để các công nghệ hỗ trợ (Screen Readers) hiểu được.',
    deepDive: 'Nguyên tắc vàng sống còn: **"First Rule of ARIA: Đừng dùng ARIA nếu đã có thẻ HTML ngữ nghĩa tương đương"**. Ví dụ: Dùng `<button>` thay vì `<div role="button" tabindex="0">`. ARIA chỉ thay đổi thông tin trong cây Trợ năng (Accessibility Tree), hoàn toàn KHÔNG tự động thêm sự kiện bàn phím hay logic bấm chuột.',
    codeExample: `<!-- Accordion chuẩn ARIA states -->
<button 
  type="button" 
  id="accordion-btn-1" 
  aria-expanded="true" 
  aria-controls="accordion-panel-1"
>
  Câu hỏi thường gặp #1
</button>

<div 
  id="accordion-panel-1" 
  role="region" 
  aria-labelledby="accordion-btn-1"
>
  <p>Câu trả lời chi tiết...</p>
</div>`
  },

  'html-021': {
    summary: 'Thuộc tính `alt` (Alternative Text) trên thẻ `<img>` cung cấp văn bản thay thế mô tả nội dung của hình ảnh khi ảnh bị lỗi mạng không tải được và là nội dung duy nhất Screen Reader đọc to cho người khiếm thị hiểu ý nghĩa của bức ảnh.',
    deepDive: 'Thiếu `alt`, Screen Reader sẽ buộc phải đọc toàn bộ đường link file dài ngoằng (ví dụ: `https://domain.com/uploads/2026/09/IMG_99182.jpg`), gây trải nghiệm cực kỳ tồi tệ. `alt` cũng là chỉ số quan trọng để Google Image Search index hình ảnh của website.',
    codeExample: `<!-- 1. Ảnh chứa thông tin quan trọng: Mô tả súc tích nội dung cốt lõi -->
<img src="/chart-revenue-q3.png" alt="Biểu đồ doanh thu Quý 3 tăng trưởng 25% đạt 50 tỷ đồng">

<!-- 2. Ảnh thuần túy trang trí (Decorative image): BẮT BUỘC để alt="" rỗng -->
<img src="/decorative-wave-divider.svg" alt="" aria-hidden="true">`
  },

  'html-022': {
    summary: 'Khác biệt giữa `localStorage` và `sessionStorage`: Cả hai đều lưu dữ liệu Key-Value trong trình duyệt (dung lượng ~5MB-10MB). **`localStorage`** tồn tại vĩnh viễn cho đến khi bị xóa chủ động bằng code hoặc người dùng xóa cache; **`sessionStorage`** sẽ **tự động bị xóa sạch ngay khi Tab trình duyệt bị đóng**.',
    deepDive: 'Phạm vi lưu trữ: `localStorage` chia sẻ chung giữa tất cả các tab/cửa sổ cùng Origin (`protocol + domain + port`). `sessionStorage` bị cô lập riêng biệt cho từng Tab (mở 2 tab cùng 1 URL sẽ có 2 sessionStorage hoàn toàn độc lập). Tuyệt đối KHÔNG lưu JWT token nhạy cảm trong localStorage nếu trang web có nguy cơ bị tấn công XSS.',
    codeExample: `// 1. Lưu tùy chọn giao diện lâu dài (dùng localStorage)
localStorage.setItem('theme_preference', 'dark');

// 2. Lưu trạng thái nháp của form nhiều bước trong phiên làm việc hiện tại (dùng sessionStorage)
sessionStorage.setItem('checkout_step', JSON.stringify({ step: 2, shippingMethod: 'express' }));

// Lấy dữ liệu:
const currentStep = JSON.parse(sessionStorage.getItem('checkout_step') || '{}');`
  },

  'html-024': {
    summary: 'Có 2 cách liên kết `<label>`: (1) Dùng thuộc tính `for` khớp với `id` của input (tách biệt markup); (2) Bọc trực tiếp input bên trong `<label>`. **TUYỆT ĐỐI KHÔNG DÙNG PLACEHOLDER ĐỂ THAY THẾ LABEL** vì nó biến mất khi gõ chữ, không được screen reader đọc ổn định và làm giảm tỷ lệ điền form thành công.',
    deepDive: 'Nghiên cứu Nielsen Norman Group chỉ ra rằng form chỉ dùng placeholder làm giảm 40% khả năng hoàn thành form: Người dùng thường dùng placeholder làm gợi ý định dạng (`VD: 0912345678`), nếu dùng thay label họ sẽ phải xóa chữ đi gõ lại để xem ô này yêu cầu nhập cái gì.',
    codeExample: `<!-- ✅ CÁCH CHUẨN: Có Label rõ ràng VÀ Placeholder làm ví dụ định dạng -->
<div class="form-group">
  <label for="phone-input">Số điện thoại di động (*):</label>
  <input 
    type="tel" 
    id="phone-input" 
    name="phone" 
    placeholder="0912 345 678" 
    required
  >
</div>`
  },

  'html-025': {
    summary: 'Viết `alt` đúng: Mô tả súc tích ngữ cảnh và mục đích của ảnh (không bắt đầu bằng "Hình ảnh của..."). **Để `alt=""` (rỗng) khi bức ảnh chỉ có tính chất TRANG TRÍ (Decorative)**, không mang thông tin mới (ví dụ: icon trang trí đứng cạnh một đoạn text đã có đủ ý nghĩa).',
    deepDive: 'Nếu xóa hoàn toàn thuộc tính `alt` (không viết gì), Screen Reader coi đây là lỗi và sẽ đọc tên file ảnh. Nếu viết `alt=""`, Screen Reader hiểu rằng bức ảnh này là vật trang trí và sẽ chủ động bỏ qua một cách lịch sự, giúp người khiếm thị không bị làm phiền.',
    codeExample: `<!-- ❌ SAI: alt lặp lại thông tin dư thừa -->
<button>
  <img src="/trash.svg" alt="Biểu tượng thùng rác"> Xóa đơn hàng
</button>

<!-- ✅ ĐÚNG: Ảnh trang trí bên cạnh chữ -> để alt="" rỗng -->
<button>
  <img src="/trash.svg" alt="" aria-hidden="true"> Xóa đơn hàng
</button>`
  },

  'html-027': {
    summary: 'Tiêu chí **WCAG 1.4.1 (Use of Color)** yêu cầu: **Màu sắc không được là phương tiện DUY NHẤT để truyền tải thông tin, chỉ thị hành động hoặc phân biệt các phần tử trực quan**. Viền đỏ báo lỗi hoặc biểu đồ chỉ phân biệt bằng màu là vi phạm vì người mù màu (8% nam giới) sẽ không thể nhận biết.',
    deepDive: 'Cách khắc phục chuẩn UX: Khi báo lỗi input: Ngoài viền đỏ, bắt buộc phải có thêm **Icon cảnh báo chấm than** và **Dòng thông báo lỗi bằng chữ** nằm ngay dưới ô nhập; Trong biểu đồ: Ngoài màu sắc, phải kết hợp các mẫu hoa văn (Patterns, gạch chéo, chấm bi) hoặc nhãn chữ chú thích trực tiếp lên từng cột.',
    codeExample: `<!-- ✅ ĐẠT CHUẨN WCAG 1.4.1: Kết hợp màu đỏ + Icon + Text thông báo lỗi -->
<div class="input-error-wrapper">
  <label for="pwd">Mật khẩu:</label>
  <input type="password" id="pwd" class="border-red-500" aria-invalid="true" aria-describedby="pwd-error">
  
  <p id="pwd-error" class="error-msg">
    <span class="error-icon" aria-hidden="true">⚠️</span>
    Mật khẩu phải chứa ít nhất 8 ký tự bao gồm chữ và số.
  </p>
</div>`
  },

  'html-028': {
    summary: 'Theo WCAG 3.1.1 (Language of Page): Thuộc tính `lang` chính của trang đặt trên thẻ gốc `html` (`<html lang="vi">`). Theo WCAG 3.1.2 (Language of Parts): Bất kỳ đoạn văn bản nào bên trong trang sử dụng ngôn ngữ khác tiếng chính **BẮT BUỘC PHẢI ĐẶT THUỘC TÍNH `lang` TRÊN PHẦN TỬ CHỨA NÓ** (ví dụ: `<blockquote lang="en">`).',
    deepDive: 'Tại sao cần `lang` cho từng đoạn? Bộ tổng hợp giọng nói của Screen Reader chuyển đổi phát âm dựa theo mã `lang`: Nếu một đoạn tiếng Anh nằm trong trang tiếng Việt mà không có `lang="en"`, Screen Reader sẽ dùng ngữ điệu và phát âm tiếng Việt để đọc từ tiếng Anh đó, biến câu văn thành âm thanh vô nghĩa không thể hiểu nổi.',
    codeExample: `<!DOCTYPE html>
<html lang="vi"> <!-- WCAG 3.1.1: Ngôn ngữ chính của trang là tiếng Việt -->
<head>...</head>
<body>
  <p>Hôm nay chúng ta sẽ tìm hiểu về phương pháp 
    <span lang="en">Test-Driven Development</span> trong kỹ thuật phần mềm. <!-- WCAG 3.1.2 -->
  </p>
</body>
</html>`
  },

  'html-029': {
    summary: 'Link "Xem thêm" hoặc "Click here" vi phạm **WCAG 2.4.4 (Link Purpose in Context)** vì người dùng Screen Reader thường dùng phím tắt quét danh sách toàn bộ các đường link trên trang: Họ sẽ chỉ nghe 10 chữ "Xem thêm" mà không biết từng link dẫn tới đâu. Với link chỉ có icon: Bắt buộc phải có **`aria-label`** hoặc class `.sr-only`.',
    deepDive: 'Giải pháp xử lý: (1) Viết text cụ thể trong link: `<a href="/post-1">Xem thêm bài viết về React 19</a>`; (2) Hoặc ẩn phần chữ giải thích bằng class `.sr-only` để mắt thường chỉ thấy "Xem thêm" nhưng Screen Reader đọc trọn vẹn tiêu đề.',
    codeExample: `<!-- 1. Link "Xem thêm" đạt chuẩn WCAG -->
<a href="/posts/react-19">
  Xem thêm <span class="sr-only">về tính năng mới của React 19</span>
</a>

<!-- 2. Link chỉ chứa Icon mạng xã hội -->
<a href="https://github.com" aria-label="Ghé thăm trang GitHub của dự án" target="_blank" rel="noopener noreferrer">
  <svg aria-hidden="true" width="24" height="24">...</svg>
</a>`
  },

  'html-030': {
    summary: 'Khác biệt cốt lõi giữa `id` và `class`: **`id` là mã định danh duy nhất (Unique)** trên toàn bộ tài liệu HTML, một phần tử chỉ có 1 id và không được trùng lặp; **`class` là định danh phân loại có thể tái sử dụng** cho nhiều phần tử, một phần tử có thể có nhiều class cách nhau bằng dấu cách.',
    deepDive: 'Trong CSS: `id` có Specificity cực cao `(0, 1, 0, 0)` gây khó khăn cho việc ghi đè bảo trì, vì vậy quy tắc CSS hiện đại cấm dùng id để style. Trong HTML/JS: `id` giữ vai trò sống còn làm mốc neo điều hướng URL (Anchor `#section-1`), liên kết nhãn `<label for="id">` và các thuộc tính Accessibility (`aria-labelledby`, `aria-describedby`).',
    codeExample: `<!-- id phục vụ Anchor URL và ARIA; class phục vụ Style CSS -->
<section id="pricing-plans" class="section-container bg-slate-50">
  <h2 class="section-title text-2xl font-bold">Bảng giá dịch vụ</h2>
</section>`
  },

  'html-031': {
    summary: 'Ý nghĩa ngữ nghĩa: **`<strong>`** thể hiện nội dung có **Mức độ quan trọng hoặc khẩn cấp cao** (Important/Serious), screen reader đọc nhấn giọng; **`<em>`** thể hiện **Nhấn mạnh ngữ điệu** (Emphasis/Stress), làm thay đổi nghĩa câu khi nói; **`<mark>`** dùng để **Đánh dấu/Tô vàng (Highlight)** văn bản phục vụ mục đích tham chiếu (như từ khóa tìm kiếm khớp trong bài).',
    deepDive: 'Khác biệt với thẻ `<b>` và `<i>`: Thẻ `<b>` (Bold) và `<i>` (Italic) thuần túy mang tính chất hiển thị kiểu dáng thị giác, hoàn toàn không mang ý nghĩa ngữ nghĩa trong cây Trợ năng. Luôn dùng `<strong>` và `<em>` khi nội dung thực sự có ý nghĩa quan trọng.',
    codeExample: `<p>
  <strong>Cảnh báo:</strong> Tuyệt đối <em>không</em> chia sẻ mã OTP cho bất kỳ ai.
</p>
<p>
  Kết quả tìm kiếm cho từ khóa: <mark>System Design</mark>
</p>`
  },

  'html-032': {
    summary: 'Thẻ `<time>` dùng để hiển thị ngày, tháng, giờ hoặc khoảng thời gian sao cho **Con người có thể đọc được bằng mắt** đồng thời **Máy móc (Search Engine Bots, Screen Readers, Lịch trình OS) có thể phân tích cú pháp chuẩn xác** thông qua thuộc tính `datetime` (chuẩn ISO 8601).',
    deepDive: 'Lợi ích vượt trội: Giúp Googlebot hiểu chính xác thời điểm xuất bản bài viết để đưa vào Rich Snippets; Thiết bị di động (iOS/Android) tự động nhận diện thẻ `<time>` để gợi ý người dùng thêm sự kiện vào Google Calendar hoặc Apple Reminders chỉ bằng một chạm.',
    codeExample: `<!-- Người đọc thấy chữ thân thiện, máy tính đọc chuẩn ISO 8601 -->
<p>Bài viết xuất bản lúc: 
  <time datetime="2026-09-30T10:30:00+07:00">10 giờ 30 sáng nay</time>
</p>

<!-- Thời lượng video: 2 giờ 30 phút (ISO 8601 Duration) -->
<p>Thời lượng khóa học: <time datetime="PT2H30M">2 tiếng rưỡi</time></p>`
  },

  'html-033': {
    summary: 'Semantic HTML tác động trực tiếp và mạnh mẽ đến SEO (Search Engine Optimization): Trình thu thập dữ liệu (Googlebot) sử dụng các thẻ ngữ nghĩa (`<article>`, `<nav>`, `<main>`, `<header>`, `<h1>-<h6>`) để hiểu rõ cấu trúc, chủ đề và xác định đâu là nội dung cốt lõi của trang web, từ đó lập chỉ mục (Indexing) và xếp hạng (Ranking) cao hơn.',
    deepDive: 'Nếu một trang web chỉ toàn thẻ `<div>` lồng `<div>` ("Div Soup"): Googlebot không thể phân biệt được đâu là nội dung bài viết chính, đâu là sidebar quảng cáo hay footer pháp lý. Sử dụng `<article>` và phân cấp tiêu đề `<h1>` -> `<h2>` chuẩn mực giúp bài viết dễ dàng đạt vị trí Google Top Stories và Google Featured Snippets.',
    codeExample: `<!-- Bố cục chuẩn SEO cấu trúc rõ ràng -->
<header>...</header>
<main>
  <article>
    <h1>Kiến Trúc Microservices Chuẩn Doanh Nghiệp</h1>
    <section>
      <h2>1. Giới thiệu tổng quan</h2>
      <p>Nội dung...</p>
    </section>
  </article>
</main>`
  },

  'html-034': {
    summary: 'Dùng bộ ba **`<dl>` (Description List)**, **`<dt>` (Description Term)** và **`<dd>` (Description Details)** khi cần hiển thị danh sách các cặp **Khóa - Giá trị (Key-Value Pairs)**, Từ điển định nghĩa thuật ngữ, hoặc bảng Thông số kỹ thuật sản phẩm.',
    deepDive: 'Nhiều người nhầm lẫn dùng `<table>` cho thông số sản phẩm. Dùng `<dl>` ngữ nghĩa hơn rất nhiều và cực kỳ dễ responsive bằng CSS Grid hoặc Flexbox. Một `<dt>` có thể đi kèm nhiều `<dd>` (1 từ có nhiều nghĩa định nghĩa) hoặc ngược lại.',
    codeExample: `<dl class="specs-list">
  <dt>Kích thước màn hình</dt>
  <dd>6.7 inches Super Retina XDR</dd>

  <dt>Chip xử lý</dt>
  <dd>Apple A17 Pro 6 nhân</dd>

  <dt>Hệ điều hành</dt>
  <dd>iOS 18</dd>
</dl>`
  },

  'html-035': {
    summary: 'Thẻ `<details>` và `<summary>` tạo thành một Accordion (hộp thu gọn/mở rộng nội dung) hoàn toàn tự nhiên bằng HTML mà không cần viết một dòng JavaScript hay CSS nào. Thuộc tính boolean `open` điều khiển trạng thái mở sẵn.',
    deepDive: 'Tích hợp sẵn Accessibility: Trình duyệt tự động gắn role trợ năng, hỗ trợ phím Space/Enter để đóng mở và thông báo trạng thái mở/đóng tới Screen Reader. Kể từ năm 2024, CSS đã hỗ trợ animate mượt mà chiều cao của thẻ `<details>` thông qua `interpolate-size: allow-keywords;`.',
    codeExample: `<details>
  <summary>Chính sách hoàn tiền trong vòng 30 ngày hoạt động thế nào?</summary>
  <p>Nếu bạn không hài lòng với sản phẩm, chỉ cần gửi email tới bộ phận hỗ trợ trong vòng 30 ngày kể từ ngày mua, chúng tôi sẽ hoàn trả 100% số tiền không cần lý do.</p>
</details>`
  },

  'html-036': {
    summary: 'Progressive Web App (PWA) là ứng dụng web sử dụng các công nghệ web hiện đại để mang lại trải nghiệm tương đương ứng dụng di động bản địa (Native App): Khả năng hoạt động Ngoại tuyến (Offline-first), Gửi thông báo đẩy (Push Notifications), và Cài đặt trực tiếp lên màn hình chính thiết bị (Installable).',
    deepDive: '3 yêu cầu kỹ thuật bắt buộc để trang web đạt chuẩn PWA: (1) Phục vụ toàn bộ qua giao thức bảo mật **HTTPS**; (2) Có file **Web App Manifest (`manifest.json`)** khai báo icon, tên app, theme color và display mode; (3) Đăng ký một **Service Worker** để quản lý cache bộ nhớ và lắng nghe sự kiện chạy ngầm.',
    codeExample: `// Đăng ký Service Worker trong file HTML chính
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then(reg => console.log('PWA Service Worker đăng ký thành công:', reg.scope))
      .catch(err => console.error('Lỗi đăng ký Service Worker:', err));
  });
}`
  },

  'html-037': {
    summary: 'Các thuộc tính xác thực form native (HTML5 Form Validation): **`required`** (bắt buộc nhập); **`pattern`** (khớp với Regex); **`min` / `max`** (giới hạn giá trị số hoặc ngày); **`minlength` / `maxlength`** (độ dài chuỗi); **`step`** (bước nhảy số).',
    deepDive: 'Xác thực native diễn ra ngay trên trình duyệt trước khi form submit. Trình duyệt tự động chặn submit và hiển thị tooltip cảnh báo bằng ngôn ngữ của hệ điều hành. Có thể tùy biến kiểu dáng các trạng thái hợp lệ/lỗi trực tiếp trong CSS bằng pseudo-classes: `:valid`, `:invalid`, `:required`, `:user-invalid` (chỉ báo lỗi sau khi user đã tương tác).',
    codeExample: `<input 
  type="text" 
  name="username" 
  required 
  minlength="4" 
  maxlength="20" 
  pattern="^[a-zA-Z0-9_]+$" 
  title="Tên người dùng từ 4-20 ký tự, chỉ chứa chữ cái, số và dấu gạch dưới"
>`
  },

  'html-038': {
    summary: 'Khác biệt giữa `readonly` và `disabled`: Cả hai đều cấm người dùng chỉnh sửa giá trị ô nhập; nhưng **`readonly` VẪN GỬI GIÁ TRỊ (Form Submission) về máy chủ** và vẫn nhận Focus bàn phím được; trong khi **`disabled` KHÔNG GỬI GIÁ TRỊ về máy chủ**, không nhận Focus và bị mờ màu mặc định.',
    deepDive: 'Lưu ý kỹ thuật: `readonly` chỉ áp dụng được cho các input nhập văn bản (`text`, `textarea`, `email`, `password`), KHÔNG áp dụng được cho `checkbox`, `radio`, `<select>` hay nút bấm. Nếu muốn khóa một checkbox không cho sửa mà vẫn muốn submit giá trị về server, phải dùng `disabled` kết hợp 1 thẻ `<input type="hidden">`.',
    codeExample: `<!-- 1. Mã đơn hàng cố định không cho sửa nhưng PHẢI submit lên server -> Dùng readonly -->
<input type="text" name="order_code" value="ORD-99128" readonly>

<!-- 2. Nút bấm đang chờ xử lý -> Dùng disabled để cấm click và cấm submit -->
<button type="submit" disabled>Đang xử lý thanh toán...</button>`
  },

  'html-039': {
    summary: 'Thuộc tính `enctype` (Encoding Type) chỉ định cách dữ liệu form được mã hóa khi gửi qua HTTP POST: (1) **`application/x-www-form-urlencoded`** (mặc định cho text: các ký tự biến thành key=value&key2=val2); (2) **`multipart/form-data`** (BẮT BUỘC khi form có tải file nhị phân qua `<input type="file">`); (3) **`text/plain`** (gửi text thô không mã hóa).',
    deepDive: 'Nếu form có upload ảnh hoặc file PDF mà quên khai báo `enctype="multipart/form-data"`, trình duyệt sẽ chỉ gửi duy nhất tên file dưới dạng chuỗi string text (ví dụ `photo="avatar.png"`), toàn bộ nội dung byte nhị phân của file sẽ bị mất hoàn toàn.',
    codeExample: `<!-- BẮT BUỘC có enctype="multipart/form-data" khi form có Upload File -->
<form action="/api/upload" method="POST" enctype="multipart/form-data">
  <label for="avatar">Chọn ảnh đại diện:</label>
  <input type="file" id="avatar" name="avatar_file" accept="image/png, image/jpeg" required>
  <button type="submit">Tải lên</button>
</form>`
  },

  'html-040': {
    summary: 'Thuộc tính `autocomplete` hướng dẫn trình duyệt và trình quản lý mật khẩu (1Password, Apple Keychain, Google Password Manager) tự động điền chính xác thông tin người dùng đã lưu trước đó (Tên, Email, Số điện thoại, Địa chỉ giao hàng, Thẻ tín dụng, Mã OTP).',
    deepDive: 'Các giá trị chuẩn mực quan trọng nhất: `email`, `tel`, `name`, `street-address`, `cc-number` (số thẻ), `one-time-code` (tự động điền mã OTP từ SMS trên iOS/Android), `new-password` (gợi ý sinh mật khẩu mạnh), `current-password` (điền mật khẩu cũ). Khai báo đúng `autocomplete` giúp tăng 30% tỷ lệ hoàn thành thanh toán E-commerce.',
    codeExample: `<!-- Form thanh toán tối ưu Autocomplete chuẩn W3C -->
<input type="text" name="name" autocomplete="name" required placeholder="Họ và tên">
<input type="text" name="cc_num" autocomplete="cc-number" inputmode="numeric" required placeholder="Số thẻ tín dụng">
<input type="text" name="cc_exp" autocomplete="cc-exp" placeholder="MM/YY">
<input type="text" name="cc_cvc" autocomplete="cc-csc" inputmode="numeric" placeholder="CVC">`
  },

  'html-041': {
    summary: 'Constraint Validation API là bộ API JavaScript cho phép kiểm tra, can thiệp và tùy biến quy trình xác thực form của trình duyệt thông qua các thuộc tính: `validity` (đối tượng chứa cờ chi tiết: `valueMissing`, `typeMismatch`, `patternMismatch`), `checkValidity()`, `reportValidity()`, và hàm `setCustomValidity()`.',
    deepDive: 'Hàm `setCustomValidity(message)` cực kỳ mạnh mẽ: Nếu truyền vào một chuỗi thông báo lỗi (khác rỗng), input ngay lập tức bị đánh dấu là không hợp lệ (`invalid`) và trình duyệt sẽ hiển thị thông báo lỗi tùy biến do bạn định nghĩa; Để xóa lỗi, chỉ cần gọi `setCustomValidity("")` với chuỗi rỗng.',
    codeExample: `const passwordInput = document.getElementById('pwd');
const confirmInput = document.getElementById('confirm_pwd');

function validatePasswordMatch() {
  if (passwordInput.value !== confirmInput.value) {
    // Kích hoạt lỗi tùy chỉnh native
    confirmInput.setCustomValidity('Mật khẩu xác nhận không trùng khớp!');
  } else {
    // Xóa lỗi để form hợp lệ trở lại
    confirmInput.setCustomValidity('');
  }
}

confirmInput.addEventListener('input', validatePasswordMatch);`
  },

  'html-042': {
    summary: 'FormData API cung cấp cấu trúc đối tượng đại diện cho dữ liệu của một HTML Form dưới dạng các cặp Key-Value, cho phép dễ dàng thu thập toàn bộ dữ liệu từ thẻ `<form>` để gửi đi qua `fetch()` hoặc `XMLHttpRequest` mà không cần đọc thủ công từng input.',
    deepDive: 'FormData tự động xử lý chính xác các trường phức tạp như File Uploads, Checkbox nhiều lựa chọn, và tự động thiết lập header `Content-Type: multipart/form-data` kèm ranh giới `boundary` chính xác khi gửi qua `fetch` (Lưu ý: Không được tự gõ header Content-Type bằng tay khi dùng FormData).',
    codeExample: `const form = document.querySelector('form');

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  // Gom toàn bộ input và file trong form chỉ trong 1 dòng
  const formData = new FormData(form);

  // Có thể bổ sung thêm dữ liệu ngoài form:
  formData.append('submitted_at', Date.now());

  await fetch('/api/submit', {
    method: 'POST',
    body: formData // Fetch tự động cấu hình multipart/form-data boundary
  });
});`
  },

  'html-043': {
    summary: 'WCAG (Web Content Accessibility Guidelines) là bộ tiêu chuẩn quốc tế về trợ năng web do tổ chức W3C ban hành, bao gồm 4 nguyên tắc cốt lõi **POUR**: **Perceivable** (Có thể nhận thức được), **Operable** (Có thể vận hành được), **Understandable** (Có thể hiểu được), và **Robust** (Mạnh mẽ/Tương thích tốt). Có **3 cấp độ**: **A** (Tối thiểu), **AA** (Tiêu chuẩn công nghiệp & Pháp lý), và **AAA** (Chuyên biệt cao cấp).',
    deepDive: 'Hầu hết các dự án thương mại và cơ quan chính phủ trên toàn cầu đều bắt buộc phải đạt chuẩn **WCAG 2.1 hoặc 2.2 cấp độ AA**: Yêu cầu độ tương phản chữ 4.5:1, hỗ trợ điều hướng 100% bằng bàn phím, có phụ đề video, không có bẫy bàn phím, và trang web có thể zoom lên 200% mà không bị vỡ giao diện.',
    codeExample: `/* 4 NGUYÊN TẮC CỐT LÕI POUR CỦA WCAG:
1. Perceivable:    Người dùng nhận biết được thông tin (alt text, phụ đề, tương phản)
2. Operable:       Vận hành được mọi chức năng bằng bàn phím, không bẫy focus
3. Understandable: Giao diện dễ hiểu, thông báo lỗi rõ ràng, ngôn ngữ xác định
4. Robust:         Mã HTML chuẩn mực tương thích tốt với mọi công nghệ trợ năng
*/`
  },

  'html-044': {
    summary: 'Khác biệt giữa 3 thuộc tính ARIA đặt tên: **`aria-label`** gán trực tiếp một chuỗi văn bản vô hình làm tên cho phần tử (thường dùng cho nút chỉ có icon); **`aria-labelledby`** tham chiếu tới `id` của một phần tử chữ ĐÃ CÓ TRÊN MÀN HÌNH để lấy làm tên; **`aria-describedby`** tham chiếu tới `id` của một phần tử chữ để cung cấp **thông tin mô tả phụ hoặc thông báo lỗi**.',
    deepDive: 'Thứ tự ưu tiên khi Screen Reader tính toán "Accessible Name": `aria-labelledby` > `aria-label` > nội dung văn bản bên trong thẻ > thuộc tính `title`. `aria-describedby` không thay thế tên của phần tử mà được Screen Reader đọc nối tiếp sau khi đọc tên chính, rất lý tưởng để liên kết thông báo hướng dẫn hoặc lỗi form.',
    codeExample: `<!-- 1. aria-label gán tên trực tiếp cho icon button -->
<button aria-label="Đóng cửa sổ"><svg>...</svg></button>

<!-- 2. aria-labelledby lấy tiêu đề h2 làm tên cho section -->
<section aria-labelledby="billing-heading">
  <h2 id="billing-heading">Thông tin thanh toán</h2>
</section>

<!-- 3. aria-describedby liên kết ô input với hướng dẫn mật khẩu bên dưới -->
<input type="password" id="pass" aria-describedby="pass-hint">
<p id="pass-hint">Mật khẩu cần tối thiểu 8 ký tự.</p>`
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
console.log(`Updated ${count} questions in Batch 1 of HTML Bank.`);
