import fs from 'node:fs';
import path from 'node:path';

const filePath = path.resolve('src/features/interview/data/json/html-bank.json');
const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));

const batch2Updates = {
  'html-045': {
    summary: 'Keyboard Navigation (Điều hướng bằng bàn phím: phím Tab, Shift+Tab, Enter, Space, Phím mũi tên, Escape) là huyết mạch của Web Accessibility: Cho phép người suy giảm vận động cơ học (không dùng được chuột), người khiếm thị dùng Screen Reader và Power Users tương tác với 100% chức năng của trang web.',
    deepDive: 'Tiêu chí WCAG 2.1.1 (Keyboard) yêu cầu: Mọi thao tác thực hiện được bằng chuột đều phải thực hiện được bằng bàn phím. Cấm kỵ lớn nhất: Xóa bỏ Focus Indicator (`outline: none` mà không có style thay thế) khiến người dùng bàn phím bị "mù phương hướng" không biết con trỏ focus đang ở đâu.',
    codeExample: `/* Luôn đảm bảo Focus Indicator nổi bật cho người dùng bàn phím */
:focus-visible {
  outline: 3px solid #2563eb;
  outline-offset: 2px;
}`
  },

  'html-046': {
    summary: 'Thuộc tính `tabindex` kiểm soát khả năng nhận Focus của phần tử: (1) **`tabindex="0"`**: Đưa phần tử vào luồng Tab tự nhiên theo thứ tự DOM; (2) **`tabindex="-1"`**: Cho phép nhận Focus bằng JavaScript (`element.focus()`), nhưng loại bỏ khỏi luồng phím Tab; (3) **`tabindex=">0"` (Số dương): ANTIPATTERN TUYỆT ĐỐI NÊN TRÁNH** vì nó phá vỡ trật tự Tab tự nhiên.',
    deepDive: 'Tại sao cấm `tabindex="1"` hoặc số dương? Trình duyệt sẽ ưu tiên duyệt qua tất cả các phần tử có tabindex dương trước theo thứ tự tăng dần, sau đó mới đến các phần tử thông thường. Điều này gây đảo lộn trải nghiệm, làm người dùng nhảy cóc loạn xạ trên màn hình.',
    codeExample: `<!-- 1. Cho phép một khối div nhận focus bằng JS khi mở Modal (nhưng không bị Tab tới) -->
<div id="modal-container" tabindex="-1" role="dialog" aria-modal="true">
  ...
</div>

<!-- 2. Biến một Custom Component thành phần tử có thể Tab tới tự nhiên -->
<div role="checkbox" tabindex="0" aria-checked="false">
  Tùy chọn bổ sung
</div>`
  },

  'html-047': {
    summary: 'Yêu cầu độ tương phản màu sắc theo chuẩn WCAG 2.1 Cấp độ AA: **Tối thiểu 4.5:1** đối với văn bản thông thường (dưới 18pt/24px hoặc dưới 14pt/18.66px in đậm); **Tối thiểu 3:1** đối với văn bản kích thước lớn và các thành phần giao diện đồ họa cốt lõi (Input borders, Icons, Focus rings).',
    deepDive: 'Ở cấp độ cao nhất AAA: Yêu cầu nâng lên 7:1 cho text thường và 4.5:1 cho text lớn. Lưu ý: Placeholder màu xám nhạt `#9ca3af` trên nền trắng `#ffffff` có tỷ lệ tương phản chỉ khoảng 2.5:1 -> Vi phạm nghiêm trọng WCAG 2.1 AA. Luôn dùng công cụ kiểm tra độ tương phản (Color Contrast Checker) trong Chrome DevTools.',
    codeExample: `/* ✅ ĐẠT CHUẨN WCAG AA (Tương phản 7.5:1 trên nền trắng) */
.body-text {
  color: #334155; /* Slate 700 trên nền trắng #ffffff */
}

/* ❌ VI PHẠM WCAG (Tương phản chỉ 2.1:1 -> Quá mờ, người mắt kém không đọc được) */
.failing-text {
  color: #94a3b8; /* Slate 400 trên nền trắng */
}`
  },

  'html-050': {
    summary: 'Khi dùng `target="_blank"`, bắt buộc phải kèm **`rel="noopener noreferrer"`** để ngăn chặn lỗ hổng bảo mật **"Reverse Tabnabbing"**: Nếu thiếu thuộc tính này, trang web mới mở ở tab khác có thể truy cập vào đối tượng `window.opener` và điều hướng trang gốc của bạn tới một website lừa đảo (Phishing URL) mà người dùng không hề hay biết.',
    deepDive: 'Cơ chế hoạt động: Khi mở tab mới không có `noopener`, tab mới chạy chung tiến trình trình duyệt (Process) với tab cũ và có toàn quyền can thiệp `window.opener.location = "https://fake-login-google.com"`. Trình duyệt hiện đại đã tự động ngầm thêm `noopener` cho `target="_blank"`, nhưng viết rõ ràng `rel="noopener noreferrer"` vẫn là Best Practice bảo mật tuyệt đối cho mọi trình duyệt cũ và WebViews.',
    codeExample: `<!-- Mở liên kết ngoài an toàn tuyệt đối chống Reverse Tabnabbing -->
<a 
  href="https://external-website.com" 
  target="_blank" 
  rel="noopener noreferrer"
  aria-label="Truy cập liên kết ngoài (mở tab mới)"
>
  Trang đối tác
</a>`
  },

  'html-051': {
    summary: 'Accessible Name (Tên trợ năng) là chuỗi văn bản đại diện duy nhất mà Screen Reader dùng để giới thiệu về một phần tử. Thuật toán tính toán tuân theo thứ tự ưu tiên nghiêm ngặt từ cao xuống thấp: **(1) `aria-labelledby` -> (2) `aria-label` -> (3) Nội dung chữ bên trong thẻ (Subtree text) -> (4) Thuộc tính `alt` (trên ảnh) -> (5) Thuộc tính `title`**.',
    deepDive: 'Nếu một nút bấm có cả `aria-label="Xóa đơn hàng"`, bên trong có icon `<svg>` và chữ `Xóa`, Screen Reader sẽ **ưu tiên đọc duy nhất nội dung trong `aria-label`** và bỏ qua toàn bộ chữ bên trong thẻ. Hiểu rõ thứ tự ưu tiên giúp tránh việc đặt đè tên gây nhầm lẫn.',
    codeExample: `<!-- Accessible Name ở đây CHẮC CHẮN LÀ "Lưu bài viết" (do aria-label thắng text bên trong) -->
<button aria-label="Lưu bài viết" title="Bấm để lưu">
  <svg aria-hidden="true">...</svg>
  <span>Lưu</span>
</button>`
  },

  'html-052': {
    summary: 'Khi submit form bị lỗi, để Screen Reader biết ô nào sai và sai gì: (1) Đặt **`aria-invalid="true"`** trên ô input lỗi; (2) Dùng **`aria-describedby="error-message-id"`** liên kết input tới dòng thông báo lỗi; (3) Tự động di chuyển Focus bàn phím tới ô nhập lỗi đầu tiên hoặc khối tổng kết lỗi đầu trang.',
    deepDive: 'Nếu chỉ đổi viền đỏ và hiện dòng chữ bằng CSS thông thường: Screen Reader khi tab vào ô input vẫn chỉ đọc "Email, edit text", người khiếm thị hoàn toàn không biết ô này bị sai cú pháp. Khi có `aria-invalid="true"` và `aria-describedby`, Screen Reader sẽ đọc: "Email, invalid, edit text, Định dạng email không hợp lệ".',
    codeExample: `<div class="field-group">
  <label for="email-field">Địa chỉ Email:</label>
  <input 
    type="email" 
    id="email-field" 
    name="email" 
    aria-invalid="true" 
    aria-describedby="email-error-desc"
  >
  <p id="email-error-desc" class="error-text" role="alert">
    Định dạng email không hợp lệ (ví dụ: name@domain.com).
  </p>
</div>`
  },

  'html-053': {
    summary: 'Nội dung thay đổi động (Toast thông báo, kết quả tìm kiếm, cập nhật số lượng giỏ hàng) thông báo cho Screen Reader thông qua **ARIA Live Regions (`aria-live`)**: (1) **`aria-live="polite"`**: Chờ người dùng đọc xong câu hiện tại rồi mới đọc thông báo (dùng cho Toast, cập nhật giỏ); (2) **`aria-live="assertive"`**: Ngắt lời người dùng để đọc ngay lập tức (dùng cho lỗi khẩn cấp, cảnh báo phiên hết hạn).',
    deepDive: 'Các thuộc tính bổ trợ quan trọng: `aria-atomic="true"` (bắt buộc Screen Reader đọc trọn vẹn toàn bộ nội dung khối thông báo thay vì chỉ đọc mẩu text vừa thay đổi). Các role viết tắt tương đương: `role="status"` tương đương `aria-live="polite"`; `role="alert"` tương đương `aria-live="assertive"`.',
    codeExample: `<!-- Khung chứa Toast Notification cập nhật giỏ hàng -->
<div 
  id="toast-notification" 
  role="status" 
  aria-live="polite" 
  aria-atomic="true"
  class="toast"
>
  Đã thêm 1 sản phẩm vào Giỏ hàng thành công!
</div>`
  },

  'html-054': {
    summary: 'Quy trình xử lý Focus chuẩn khi Mở và Đóng Modal: (1) **Trước khi mở**: Lưu lại phần tử đang được focus (nút kích hoạt modal); (2) **Khi mở modal**: Chuyển Focus ngay lập tức vào phần tử đầu tiên bên trong modal (hoặc nút Đóng/tiêu đề); (3) **Khi modal đang mở**: Bắt chặt Focus bên trong modal (**Focus Trap**); (4) **Khi đóng modal**: Trả lại Focus về đúng nút kích hoạt ban đầu.',
    deepDive: 'Nếu không trả lại focus về nút kích hoạt ban đầu khi đóng modal: Con trỏ bàn phím sẽ bị văng về đầu trang `<body>`, người dùng bàn phím sẽ phải bấm Tab hàng chục lần để tìm lại vị trí đang thao tác dở. Thẻ native `<dialog>` kết hợp phương thức `dialog.showModal()` tự động xử lý phần lớn quy trình này.',
    codeExample: `// Quản lý Focus khi mở và đóng Modal Dialog
let lastActiveElement = null;

function openModal(modalEl) {
  lastActiveElement = document.activeElement; // 1. Lưu lại nút vừa bấm
  modalEl.showModal(); // 2. showModal() tự động trap focus và hỗ trợ ESC
}

function closeModal(modalEl) {
  modalEl.close();
  if (lastActiveElement) {
    lastActiveElement.focus(); // 3. Trả lại focus đúng vị trí cũ
  }
}`
  },

  'html-055': {
    summary: 'Tự viết Dropdown Menu chuẩn Accessibility cần: (1) Phím `Enter`/`Space`/Mũi tên xuống để mở menu; (2) Phím `Escape` để đóng menu và trả focus về nút kích hoạt; (3) Hỗ trợ phím mũi tên Lên/Xuống di chuyển giữa các items; (4) Áp dụng kỹ thuật **Roving tabindex**: Item đang chọn mang `tabindex="0"`, tất cả các item khác mang `tabindex="-1"`.',
    deepDive: 'Tại sao cần Roving tabindex? Nếu tất cả các item trong menu đều có `tabindex="0"`, người dùng sẽ phải bấm Tab qua từng item một rất mệt mỏi. Roving tabindex cho phép coi toàn bộ Menu như 1 điểm dừng Tab duy nhất; Khi đã vào trong menu, người dùng lướt nhanh bằng phím mũi tên.',
    codeExample: `<!-- Cấu trúc Menu với Roving Tabindex -->
<div role="menu" aria-label="Tùy chọn tài khoản">
  <button role="menuitem" tabindex="0">Hồ sơ cá nhân</button> <!-- Mục đang active -->
  <button role="menuitem" tabindex="-1">Cài đặt</button>
  <button role="menuitem" tabindex="-1">Đăng xuất</button>
</div>`
  },

  'html-056': {
    summary: 'Áp dụng `prefers-reduced-motion` đúng chuẩn: **KHÔNG PHẢI TẮT SẠCH MỌI ANIMATION**. Người dùng chỉ nhạy cảm với các chuyển động hình học mạnh, trôi dạt lớn (Parallax, Bay lượn 3D, Zoom xoay, Bật nảy); các hiệu ứng chuyển đổi mờ dần tinh tế (`opacity: fade`) hoặc đổi màu sắc nhẹ nhàng vẫn được giữ lại để đảm bảo tính phản hồi của giao diện.',
    deepDive: 'Chiến lược tốt nhất: Giữ nguyên thời lượng animation ngắn (100-200ms) nhưng chuyển `transform: translateY(100px)` thành `opacity: 0` -> `opacity: 1`. Điều này vừa giữ trải nghiệm thẩm mỹ vừa không kích hoạt triệu chứng rối loạn tiền đình.',
    codeExample: `/* Mặc định: Hiệu ứng trượt và phóng to */
.notification-card {
  transition: transform 300ms ease, opacity 300ms ease;
}

/* Khi người dùng bật Giảm chuyển động: Giữ fade mờ, tắt hoàn toàn trượt */
@media (prefers-reduced-motion: reduce) {
  .notification-card {
    transform: none !important;
    transition: opacity 150ms ease;
  }
}`
  },

  'html-057': {
    summary: 'Quy trình kiểm tra Accessibility toàn diện kết hợp 3 bước: (1) **Kiểm tra tự động (Automated Testing)** bằng công cụ Axe DevTools, Lighthouse, WAVE (phát hiện nhanh ~30-40% lỗi cú pháp, contrast, thiếu alt); (2) **Kiểm thử thủ công bằng bàn phím (Keyboard-only)**: Rút chuột ra và thao tác 100% bằng phím Tab, Enter, Space, Arrows; (3) **Kiểm thử bằng Screen Reader thực tế**: Dùng VoiceOver (Mac/iOS) hoặc NVDA (Windows).',
    deepDive: 'Công cụ tự động chỉ quét được các lỗi về thuộc tính, KHÔNG THỂ đánh giá được tính logic của trải nghiệm: Nó không biết được text trong `alt` có mô tả đúng ngữ cảnh không, không biết được thứ tự Tab có hợp lý không. Vì vậy, kiểm thử thủ công bằng Screen Reader là bước bắt buộc để nghiệm thu sản phẩm chuẩn WCAG.',
    codeExample: `// Chạy tự động kiểm tra Accessibility trong Unit Test với Vitest / Jest + axe-core
import { render } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
expect.extend(toHaveNoViolations);

it('Component không được chứa bất kỳ vi phạm Accessibility nào', async () => {
  const { container } = render(<LoginForm />);
  const results = await axe(container);
  expect(results).toHaveNoViolations();
});`
  },

  'html-058': {
    summary: 'Quy định WCAG khi Zoom: (1) **WCAG 1.4.10 (Reflow)**: Khi zoom trình duyệt lên **400%** trên màn hình 1280px (tương đương màn hình Mobile 320px), nội dung phải tự động tái bố cục (Reflow) thành 1 cột và **TUYỆT ĐỐI KHÔNG ĐƯỢC XUẤT HIỆN THANH CUỘN NGANG**; (2) **WCAG 1.4.4 (Resize Text)**: Cho phép zoom chữ lên 200% mà không mất chữ.',
    deepDive: 'Nguyên nhân gây lỗi cuộn ngang khi zoom 400%: Đặt chiều rộng cố định bằng pixel (`width: 600px`), hoặc dùng đơn vị `vw` không linh hoạt. Khắc phục: Sử dụng `max-width: 100%`, CSS Grid/Flexbox với `flex-wrap: wrap`, và dùng đơn vị tương đối (`rem`, `%`).',
    codeExample: `/* Chống vỡ layout khi Zoom 400% (WCAG 1.4.10 Conformance) */
.content-wrapper {
  width: 100%;
  max-width: 1200px;
  margin-inline: auto;
  padding-inline: 1rem;
  overflow-wrap: break-word; /* Bẻ gãy các từ hoặc URL quá dài */
}`
  },

  'html-059': {
    summary: 'Keyboard Trap (Bẫy bàn phím - vi phạm **WCAG 2.1.2**): Người dùng dùng phím Tab di chuyển vào một phần tử (như ô chat, video player, modal) nhưng **không có cách nào dùng bàn phím để di chuyển focus ra ngoài được nữa**. Thứ tự Tab bị lệch so với thứ tự nhìn thấy bằng mắt vi phạm **WCAG 2.4.3 (Focus Order)**.',
    deepDive: 'Ví dụ kinh điển của Focus Order vi phạm: Dùng thuộc tính CSS `order: 2` hoặc `flex-direction: row-reverse` để đảo vị trí nút bấm trên màn hình nhưng cây DOM gốc không đổi: Người dùng nhìn thấy nút bấm ở bên trái nhưng bấm Tab thì con trỏ lại nhảy sang tận góc phải, gây mất phương hướng hoàn toàn.',
    codeExample: `/* ❌ NGUY HIỂM: Gây lệch thứ tự Tab (Vi phạm WCAG 2.4.3) */
.flex-reversed {
  flex-direction: row-reverse; /* Con trỏ Tab nhảy ngược với mắt nhìn */
}

/* ✅ ĐÚNG: Sắp xếp lại thứ tự ngay trong cây HTML DOM */`
  },

  'html-060': {
    summary: 'Tiêu chí **WCAG 1.3.1 (Info and Relationships)** yêu cầu các mối quan hệ thông tin hiển thị bằng mắt phải được thể hiện chuẩn xác qua mã đánh dấu ngữ nghĩa: Bảng dữ liệu bắt buộc phải dùng thẻ `<th>` kèm thuộc tính **`scope="col"`** hoặc **`scope="row"`** và thẻ `<caption>`; Nhóm Radio buttons bắt buộc phải bọc trong **`<fieldset>`** kèm **`<legend>`**.',
    deepDive: 'Nếu một bảng số liệu chỉ dùng thẻ `<td>` in đậm thay cho `<th>`, Screen Reader khi đọc từng ô số liệu sẽ không thể thông báo số liệu này thuộc cột nào và hàng nào. Thuộc tính `scope="col"` liên kết ô tiêu đề cột với toàn bộ các ô dữ liệu bên dưới.',
    codeExample: `<!-- Bảng dữ liệu chuẩn ngữ nghĩa WCAG 1.3.1 -->
<table>
  <caption>Bảng lương nhân viên Quý 3</caption>
  <thead>
    <tr>
      <th scope="col">Họ và tên</th>
      <th scope="col">Vị trí</th>
      <th scope="col">Lương</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <th scope="row">Nguyễn Văn A</th> <!-- Tiêu đề hàng -->
      <td>Senior Engineer</td>
      <td>50,000,000 VND</td>
    </tr>
  </tbody>
</table>`
  },

  'html-061': {
    summary: 'Tiêu chí **WCAG 3.2.1 (On Focus)** và **3.2.2 (On Input)** quy định: Việc nhận focus hoặc thay đổi giá trị một form control không được phép gây ra **Thay đổi ngữ cảnh bất ngờ (Change of Context)** (như tự động submit form, tự động mở popup, hoặc tự động redirect trang). **Chọn dropdown `<select>` xong mà trang web tự động submit hoặc tải lại trang là vi phạm nghiêm trọng**.',
    deepDive: 'Hành vi tự động submit khi chọn `<select>` (thường dùng `onchange="this.form.submit()"`) gây thảm họa cho người dùng bàn phím hoặc Screen Reader: Họ vừa bấm phím mũi tên để xem tùy chọn đầu tiên thì trang web đã bị tải lại, cấm họ xem các tùy chọn tiếp theo. Giải pháp chuẩn: Luôn đặt một nút bấm "Áp dụng" hoặc "Tìm kiếm" riêng bên cạnh.',
    codeExample: `<!-- ✅ ĐẠT CHUẨN: Có nút bấm tường minh, không tự ý đổi ngữ cảnh khi chọn select -->
<form action="/filter" method="GET">
  <label for="sort-select">Sắp xếp theo:</label>
  <select id="sort-select" name="sort">
    <option value="price_asc">Giá tăng dần</option>
    <option value="price_desc">Giá giảm dần</option>
  </select>
  <button type="submit">Áp dụng</button>
</form>`
  },

  'html-062': {
    summary: 'HTML5 History API cho phép thao tác với lịch sử duyệt web của trình duyệt và thay đổi URL hiển thị trên thanh địa chỉ mà **không làm tải lại toàn bộ trang web (Zero Page Reload)** thông qua 2 hàm cốt lõi: `history.pushState()` (thêm URL mới) và `history.replaceState()` (ghi đè URL hiện tại), kết hợp sự kiện `window.onpopstate`.',
    deepDive: 'History API là nền tảng cốt lõi của tất cả các thư viện định tuyến SPA hiện đại (React Router, Next.js Router, Vue Router). Nó cho phép người dùng bấm nút Back/Forward trên trình duyệt mượt mà trong khi ứng dụng chỉ cập nhật lại một phần cây DOM.',
    codeExample: `// SPA Client-side Navigation với History API
function navigateTo(url, pageTitle) {
  // Thay đổi URL mà không reload trang
  history.pushState({ path: url }, pageTitle, url);
  renderPageContent(url);
}

// Bắt sự kiện khi người dùng bấm nút Back/Forward trên trình duyệt
window.addEventListener('popstate', (event) => {
  renderPageContent(window.location.pathname);
});`
  },

  'html-063': {
    summary: 'Khác biệt giữa WebSocket và HTTP: **HTTP** hoạt động theo mô hình Request-Response một chiều (Client hỏi thì Server mới trả lời), không giữ trạng thái (Stateless), mỗi request tốn chi phí mở kết nối và HTTP Headers nặng; **WebSocket** thiết lập kết nối **Full-Duplex (Hai chiều liên tục)** qua 1 TCP socket duy nhất, cho phép Server chủ động push dữ liệu về Client với độ trễ cực thấp (< 2ms) và overhead mỗi tin nhắn chỉ từ 2-10 bytes.',
    deepDive: 'Quy trình khởi tạo: WebSocket bắt đầu bằng một HTTP GET Request có header `Upgrade: websocket` và `Connection: Upgrade` (HTTP 101 Switching Protocols). Sau khi bắt tay thành công, kết nối chuyển sang giao thức nhị phân WebSocket frame.',
    codeExample: `// Kết nối WebSocket thời gian thực trên trình duyệt
const socket = new WebSocket('wss://api.example.com/live-feed');

socket.onopen = () => {
  socket.send(JSON.stringify({ action: 'subscribe', topic: 'crypto_btc' }));
};

socket.onmessage = (event) => {
  const data = JSON.parse(event.data);
  updatePriceUI(data.price);
};`
  },

  'html-064': {
    summary: 'Intersection Observer API cung cấp cách thức bất đồng bộ để theo dõi thời điểm một phần tử HTML **xuất hiện hoặc biến mất khỏi khung nhìn (Viewport)** hoặc một container cha, thay thế hoàn toàn việc lắng nghe sự kiện cuộn `scroll` nặng nề.',
    deepDive: 'Ứng dụng kinh điển: (1) Lazy loading hình ảnh/video khi người dùng cuộn tới gần; (2) Infinite scroll (tự động fetch thêm dữ liệu khi thẻ div đáy trang xuất hiện); (3) Ghi nhận chỉ số quảng cáo (Ad Impression Tracking). Chạy trên luồng nền của trình duyệt, không gây giật lag luồng chính của JS.',
    codeExample: `// Tự động tải thêm nội dung khi cuộn tới cuối trang (Infinite Scroll)
const sentinel = document.getElementById('scroll-sentinel');

const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      loadMoreContent(); // Kích hoạt fetch thêm bài viết
    }
  });
}, { rootMargin: '200px' }); // Kích hoạt trước khi chạm đáy 200px

observer.observe(sentinel);`
  },

  'html-065': {
    summary: 'Web Components là bộ chuẩn công nghệ web native cho phép tạo ra các thành phần giao diện tái sử dụng, độc lập và được đóng gói hoàn toàn, bao gồm 3 công nghệ trụ cột: (1) **Custom Elements** (`customElements.define()`); (2) **Shadow DOM** (cô lập hoàn toàn HTML và CSS bên trong, không bị CSS bên ngoài ảnh hưởng); (3) **HTML Templates (`<template>` & `<slot>`)**.',
    deepDive: 'Sức mạnh lớn nhất của Web Components: Framework-Agnostic. Một Custom Component viết bằng Web Components có thể nhúng và chạy mượt mà trên React, Angular, Vue, hoặc HTML thuần mà không cần cài đặt thêm thư viện phụ thuộc.',
    codeExample: `class UserCard extends HTMLElement {
  constructor() {
    super();
    // Tạo Shadow DOM cô lập CSS
    const shadow = this.attachShadow({ mode: 'open' });
    shadow.innerHTML = \`
      <style>
        .card { padding: 16px; border: 1px solid #e2e8f0; border-radius: 8px; font-family: sans-serif; }
      </style>
      <div class="card">
        <h3><slot name="username">Người dùng ẩn danh</slot></h3>
      </div>
    \`;
  }
}
customElements.define('user-card', UserCard);

<!-- Sử dụng trong HTML -->
<user-card><span slot="username">Nguyễn Văn A</span></user-card>`
  },

  'html-066': {
    summary: 'Các tính năng nâng cao của `<input type="file">`: **`accept`** (giới hạn định dạng file, ví dụ `accept="image/png, .pdf"`); **`multiple`** (cho phép chọn nhiều file cùng lúc); **`capture`** (trên mobile: mở thẳng camera sau `capture="environment"` hoặc camera trước `capture="user"`). Truy xuất file qua JavaScript bằng **`input.files` (FileList)**.',
    deepDive: 'Kiểm soát an toàn client-side: Thuộc tính `accept` chỉ mang tính chất hướng dẫn giao diện, người dùng vẫn có thể chọn file đuôi khác. Lập trình viên bắt buộc phải kiểm tra dung lượng (`file.size`) và định dạng MIME (`file.type`) trong JS trước khi gửi lên server.',
    codeExample: `<!-- Mở thẳng Camera điện thoại để chụp ảnh thẻ CCCD -->
<input 
  type="file" 
  name="id_card" 
  accept="image/*" 
  capture="environment"
  id="camera-input"
>

<script>
  document.getElementById('camera-input').addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file && file.size > 5 * 1024 * 1024) {
      alert('Dung lượng ảnh không được vượt quá 5MB!');
      e.target.value = ''; // Reset input
    }
  });
</script>`
  },

  'html-067': {
    summary: 'Tạo Custom Form Validation chuyên nghiệp: Ngăn chặn bong bóng thông báo mặc định của trình duyệt bằng thuộc tính **`novalidate`** trên `<form>`, lắng nghe sự kiện `submit`, sử dụng **Constraint Validation API** (`input.validity`) để kiểm tra lỗi và tự render các thông báo lỗi tùy biến gắn kèm **`aria-describedby`**.',
    deepDive: 'Lý do nên dùng `novalidate`: Thông báo lỗi native của trình duyệt không đồng nhất giữa Chrome, Safari, Firefox và không thể tùy biến CSS. Dùng `novalidate` cho phép ta tự do vẽ giao diện thông báo lỗi đồng bộ với Design System mà vẫn tận dụng được các thuộc tính kiểm tra HTML5 (`required`, `minlength`).',
    codeExample: `<form id="custom-form" novalidate>
  <label for="username">Tên đăng nhập:</label>
  <input type="text" id="username" required minlength="5">
  <span id="username-err" class="error-msg" aria-live="polite"></span>
  <button type="submit">Đăng ký</button>
</form>

<script>
  const form = document.getElementById('custom-form');
  const user = document.getElementById('username');
  const err = document.getElementById('username-err');

  form.addEventListener('submit', (e) => {
    if (!user.checkValidity()) {
      e.preventDefault();
      err.textContent = user.validity.valueMissing ? 'Vui lòng không để trống' : 'Cần tối thiểu 5 ký tự';
      user.setAttribute('aria-invalid', 'true');
      user.focus();
    }
  });
</script>`
  },

  'html-068': {
    summary: 'Tối ưu HTML Form cho Mobile: (1) Sử dụng đúng **`inputmode`** (`numeric`, `decimal`, `email`, `tel`) để bật bàn phím ảo chuẩn; (2) Sử dụng **`autocomplete`** đầy đủ; (3) Đặt **`enterkeyhint`** (`next`, `done`, `search`) để đổi nút Enter trên bàn phím; (4) Đảm bảo kích thước bấm chạm tối thiểu **44x44px**.',
    deepDive: 'Lỗi thường gặp: Form chữ trên mobile bị trình duyệt Safari tự động zoom to làm méo layout. Nguyên nhân: Safari tự zoom nếu `font-size` của input nhỏ hơn 16px. Quy tắc vàng: **Luôn đặt `font-size: 16px` (hoặc 1rem) cho tất cả các thẻ input trên mobile**.',
    codeExample: `/* Chống Safari tự động zoom giao diện khi bấm vào ô nhập */
input, select, textarea {
  font-size: 16px; /* BẮT BUỘC: >= 16px để ngăn iOS Safari auto-zoom */
}

<!-- Input tối ưu nút Next trên bàn phím ảo điện thoại -->
<input 
  type="text" 
  name="full_name" 
  autocomplete="name" 
  enterkeyhint="next" 
  placeholder="Họ và tên"
>`
  },

  'html-069': {
    summary: 'Thuộc tính `aria-live` được dùng khi một vùng trên trang web có nội dung **thay đổi động mà không tải lại trang**, cần thông báo ngay cho người dùng Screen Reader biết. Các giá trị: `off` (mặc định, không thông báo), `polite` (chờ người dùng nghỉ rồi đọc), `assertive` (ngắt lời đọc ngay).',
    deepDive: 'Quy tắc vàng: Khối mang `aria-live` phải **có sẵn trong cây DOM ngay từ ban đầu** (lúc tải trang). Nếu dùng JavaScript tạo mới cả khối `div` có `aria-live` rồi chèn vào DOM cùng lúc với nội dung, một số Screen Reader sẽ bỏ qua không đọc. Hãy để sẵn thẻ rỗng trong HTML và chỉ cập nhật text bên trong nó.',
    codeExample: `<!-- Khung thông báo tồn tại sẵn trong DOM -->
<div aria-live="polite" aria-atomic="true" id="status-announcer" class="sr-only">
  <!-- JavaScript sẽ cập nhật text vào đây: "Đã tìm thấy 42 kết quả" -->
</div>`
  },

  'html-070': {
    summary: 'Skip Links ("Bỏ qua đến nội dung chính") là một liên kết ẩn được đặt ngay đầu thẻ `<body>`, cho phép người dùng điều hướng bằng bàn phím hoặc Screen Reader bấm phím Tab đầu tiên để **nhảy thẳng tới vùng nội dung chính (`<main id="main-content">`)**, bỏ qua toàn bộ thanh Header và Menu hàng chục link lặp lại.',
    deepDive: 'Tiêu chuẩn WCAG 2.4.1 (Bypass Blocks) xếp Skip Links vào yêu cầu bắt buộc cấp độ A. Mặc định link được ẩn khỏi màn hình bằng CSS và chỉ trồi lên trực quan khi nhận Focus (`:focus`).',
    codeExample: `<!-- Đặt ngay sau thẻ <body> -->
<a href="#main-content" class="skip-link">
  Bỏ qua tới nội dung chính
</a>

<style>
  .skip-link {
    position: absolute;
    top: -9999px;
    left: 16px;
    background: #000;
    color: #fff;
    padding: 8px 16px;
    z-index: 99999;
  }
  .skip-link:focus {
    top: 16px; /* Trồi lên khi bấm phím Tab đầu tiên */
  }
</style>`
  },

  'html-071': {
    summary: 'Quản lý Focus trong ứng dụng Single Page App (SPA): Khi người dùng bấm chuyển trang bằng Client-side Routing, trang web không tải lại, khiến Focus bàn phím bị kẹt lại ở link vừa bấm hoặc bị văng mất. Cần chủ động: **Chuyển Focus lên tiêu đề `<h1>` của trang mới** hoặc cập nhật `document.title` và thông báo qua live region.',
    deepDive: 'Nếu không quản lý focus trong SPA, người khiếm thị hoàn toàn không biết việc chuyển trang đã thành công vì Screen Reader không có phản hồi gì. Đặt `tabindex="-1"` trên thẻ `<h1>` của trang mới và gọi `h1.focus()` trong router hook là giải pháp chuẩn toàn ngành.',
    codeExample: `// Focus Management sau khi chuyển Route trong Next.js / React Router
useEffect(() => {
  // Tìm tiêu đề h1 của trang mới
  const pageHeading = document.querySelector('main h1');
  if (pageHeading) {
    pageHeading.setAttribute('tabindex', '-1');
    pageHeading.focus(); // Di chuyển focus tới tiêu đề trang mới
  }
}, [currentPath]);`
  },

  'html-072': {
    summary: 'Thứ tự phân cấp Tiêu đề (`<h1>` đến `<h6>`) là mục lục định vị chính của trang web: Người dùng Screen Reader sử dụng phím tắt (phím `H`) để lướt nhanh qua các tiêu đề nhằm nắm bắt cấu trúc toàn bài. **Mỗi trang chỉ nên có duy nhất 1 thẻ `<h1>`** và tuyệt đối **không được nhảy cóc cấp độ** (ví dụ từ `<h2>` nhảy thẳng xuống `<h4>`).',
    deepDive: 'Nhiều người chọn thẻ heading dựa trên kích cỡ to nhỏ của font chữ hiển thị bằng mắt (thấy chữ bé nên dùng `<h4>`). Đây là lỗi tư duy nghiêm trọng: Kích cỡ chữ là việc của CSS class; Cấp độ thẻ `<h1>-<h6>` là việc của cây phả hệ cấu trúc tài liệu.',
    codeExample: `<!-- Cấu trúc phân cấp tiêu đề chuẩn chỉnh -->
<h1>Khóa học Thiết kế Hệ thống Phân tán</h1> <!-- Tiêu đề duy nhất của trang -->
  <h2>Chương 1: Nền tảng Mạng và Giao thức</h2>
    <h3>1.1 Mô hình OSI 7 tầng</h3>
    <h3>1.2 Giao thức TCP vs UDP</h3>
  <h2>Chương 2: Cơ sở Dữ liệu Quy mô lớn</h2>
    <h3>2.1 Kỹ thuật Sharding</h3>`
  },

  'html-073': {
    summary: 'Tự viết Component Tabs chuẩn W3C ARIA Design Pattern: (1) Thùng chứa bọc các nút tab có **`role="tablist"`**; (2) Mỗi nút tab có **`role="tab"`**, **`aria-selected="true/false"`**, và **`aria-controls="panel-id"`**; (3) Khối nội dung có **`role="tabpanel"`** kèm **`aria-labelledby="tab-id"`**; (4) Bắt buộc hỗ trợ phím mũi tên Trái/Phải để chuyển tab (Roving tabindex).',
    deepDive: 'Cấm kỵ: Dùng phím Tab để chuyển giữa các Tab trong tablist. Theo đặc tả W3C: Toàn bộ thanh tablist chỉ là 1 điểm dừng Tab duy nhất; Khi đã vào tablist, việc đổi qua lại giữa các tab phải dùng **Phím mũi tên Trái / Phải**.',
    codeExample: `<div role="tablist" aria-label="Cài đặt hệ thống">
  <button role="tab" id="tab-1" aria-selected="true" aria-controls="panel-1" tabindex="0">Chung</button>
  <button role="tab" id="tab-2" aria-selected="false" aria-controls="panel-2" tabindex="-1">Bảo mật</button>
</div>

<div role="tabpanel" id="panel-1" aria-labelledby="tab-1">
  <p>Nội dung cài đặt chung...</p>
</div>
<div role="tabpanel" id="panel-2" aria-labelledby="tab-2" hidden>
  <p>Nội dung bảo mật...</p>
</div>`
  },

  'html-077': {
    summary: 'Khi Designer đưa màu chữ xám nhạt không đạt độ tương phản: Kỹ sư giải thích rõ rủi ro pháp lý (WCAG 2.1 AA bắt buộc tỷ lệ 4.5:1, vi phạm sẽ bị phạt hoặc mất khách hàng EU/Mỹ), đo đạc số liệu tương phản cụ thể trên DevTools, và đề xuất sắc thái màu xám đậm hơn gần nhất vừa giữ được thẩm mỹ vừa đạt chuẩn. Tiêu chí WCAG 2.2 mới quan trọng: **2.5.8 Target Size (Minimum 24x24px)**.',
    deepDive: 'Các tiêu chí mới của WCAG 2.2 thường bị bỏ sót: (1) **2.4.11 Focus Not Obscured**: Khung focus không được bị che khuất bởi banner sticky hoặc footer; (2) **2.5.7 Dragging Movements**: Mọi thao tác kéo thả (kéo slider, kéo reorder) phải có phương án thay thế bằng nút bấm click đơn giản; (3) **3.3.8 Accessible Authentication**: Cấm bắt người dùng giải đố nhận thức hoặc gõ lại mật khẩu phức tạp mà không cho paste.',
    codeExample: `/* ✅ Màu chữ đề xuất cho Designer: Vừa sang trọng vừa đạt tương phản 4.6:1 */
.designer-proposed-failing {
  color: #94a3b8; /* Tương phản 2.4:1 -> THẤT BẠI */
}

.developer-compliant-alternative {
  color: #64748b; /* Tương phản 4.6:1 -> ĐẠT CHUẨN WCAG 2.1 AA */
}

/* Đảm bảo vùng bấm tối thiểu 24x24px theo chuẩn mới WCAG 2.2 Target Size */
.clickable-target {
  min-width: 24px;
  min-height: 24px;
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
console.log(`Updated ${count} questions in Batch 2 of HTML Bank.`);
