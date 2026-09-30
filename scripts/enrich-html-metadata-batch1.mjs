import fs from 'node:fs';
import path from 'node:path';

const filePath = path.resolve('src/features/interview/data/json/html-bank.json');
const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));

const batch1 = {
  'html-012': {
    interviewerIntent: 'Đánh giá kiến thức nền tảng về sự tiến hóa của Web Standards: Các tính năng đột phá của HTML5 (Semantic Tags, Native Audio/Video, Canvas, Web Storage, Form Types) loại bỏ phụ thuộc vào Flash.',
    contextOrScenario: 'Dự án hiện đại hóa ứng dụng web cũ từ thời HTML4/Flash sang HTML5: Cần thay thế các player media độc quyền bằng thẻ native, dùng semantic elements để tối ưu SEO và Accessibility.',
    expectedKeywords: ['HTML5 Standard', 'Semantic Tags (<header>, <nav>, <main>)', 'Native Media (<video>, <audio>)', 'Canvas 2D / WebGL', 'Web Storage API (localStorage)', 'Responsive Form Controls'],
    pitfalls: [
      'Chỉ kể tên vài thẻ ngữ nghĩa mà quên mất các API mạnh mẽ của HTML5 như Geolocation, Web Workers, WebSockets và Canvas.',
      'Nghĩ rằng HTML5 chỉ là một bộ thẻ mới trong khi nó là một nền tảng ứng dụng web hoàn chỉnh (Open Web Platform).',
      'Vẫn dùng thẻ `<div>` cho các vùng âm thanh/video kết hợp plugin Flash bị khai tử.'
    ],
    followUpQuestions: [
      'Sự khác biệt về triết lý giữa HTML4 (dựa trên SGML nghiêm ngặt) và HTML5 (thiết kế theo nguyên tắc "Pave the cowpaths" - chuẩn hóa thói quen thực tế của lập trình viên) là gì?',
      'Tại sao việc HTML5 hỗ trợ native `<video>` và `<audio>` lại là dấu chấm hết cho kỷ nguyên Adobe Flash Player?'
    ]
  },

  'html-014': {
    interviewerIntent: 'Kiểm tra sự hiểu biết về giao thức HTTP trong ngữ cảnh Web Forms: Phân biệt rõ ràng giữa phương thức GET (Idempotent, Safe, Cacheable) và POST (State Mutation, Sensitive Data).',
    contextOrScenario: 'Lập trình viên tạo một Form đổi mật khẩu hoặc thanh toán đơn hàng nhưng lại đặt `<form method="GET">`. Hậu quả là toàn bộ mật khẩu mới và mã thẻ ngân hàng bị hiển thị lộ liễu trên thanh địa chỉ URL của trình duyệt và lưu vào lịch sử duyệt web.',
    expectedKeywords: ['HTTP GET vs POST', 'Form Submission', 'URL Query Parameters', 'Request Body Payload', 'Idempotence & Safety', 'Browser History & Server Logs Security'],
    pitfalls: [
      'Dùng GET cho các form gửi dữ liệu nhạy cảm (mật khẩu, thẻ tín dụng): Dữ liệu bị phơi bày trên URL, lưu vào Browser History, Server Access Logs và HTTP Referrer Headers.',
      'Dùng GET cho các thao tác thay đổi trạng thái (Create/Update/Delete) khiến trình duyệt có thể tự động gửi lại request khi người dùng bấm Back/Forward hoặc crawler của Google vô tình kích hoạt xóa dữ liệu.',
      'Dùng POST cho form tìm kiếm lọc sản phẩm: Khiến người dùng không thể chia sẻ link kết quả tìm kiếm (Shareable URL) và gặp cảnh báo "Confirm Form Resubmission" khi F5.'
    ],
    followUpQuestions: [
      'Tại sao form tìm kiếm sản phẩm (Search Form) BẮT BUỘC nên dùng phương thức GET thay vì POST?',
      'Khi nào trình duyệt hiển thị hộp thoại cảnh báo "Form Resubmission" và giải pháp Post/Redirect/Get (PRG Pattern) giải quyết bài toán này ra sao?'
    ]
  },

  'html-015': {
    interviewerIntent: 'Đánh giá việc khai thác các kiểu nhập liệu hiện đại trong HTML5 (`email`, `tel`, `number`, `date`, `url`): Nâng cao trải nghiệm người dùng di động (Virtual Keyboards) và kiểm thực dữ liệu native.',
    contextOrScenario: 'Người dùng mở form điền số điện thoại trên iPhone. Do form dùng `<input type="text">`, bàn phím chữ thông thường hiện lên và người dùng phải bấm chuyển sang tab số rất phiền toái. Nếu đổi sang `type="tel"`, bàn phím số lớn chuyên dụng lập tức hiện ra.',
    expectedKeywords: ['HTML5 Input Types', 'type="tel" / type="email"', 'type="number" vs inputmode="numeric"', 'Mobile Virtual Keyboard Adaptation', 'Native Browser Validation', 'type="date" Datepicker'],
    pitfalls: [
      'Dùng `type="number"` cho số thẻ tín dụng hoặc số điện thoại: Trình duyệt sẽ thêm nút tăng giảm mũi tên (spinners), tự động xóa số 0 ở đầu (mất số 0 của số điện thoại Việt Nam) và có thể làm tròn số nguyên lớn.',
      'Không biết thuộc tính `inputmode="numeric"`: Cho phép hiển thị bàn phím số trên điện thoại mà vẫn giữ `type="text"` an toàn cho số điện thoại/OTP.',
      'Bỏ qua `type="email"` và tự viết regex JavaScript phức tạp để kiểm tra định dạng email cơ bản.'
    ],
    followUpQuestions: [
      'Tại sao để nhập mã OTP hoặc số thẻ ngân hàng, sự kết hợp `<input type="text" inputmode="numeric" pattern="[0-9]*">` lại vượt trội hơn `type="number"`?',
      'Trình duyệt di động thay đổi bàn phím ảo như thế nào khi gặp `type="email"` (thêm phím `@` và `.com`) so với `type="url"` (thêm phím `/`)?'
    ]
  },

  'html-016': {
    interviewerIntent: 'Kiểm tra nhận thức cơ bản nhưng sống còn về Trợ năng (Accessibility) và Trải nghiệm người dùng (UX): Vai trò của thẻ `<label>` trong việc mở rộng vùng bấm và cung cấp Accessible Name cho Screen Reader.',
    contextOrScenario: 'Một ứng dụng có các nút Checkbox và Radio button rất nhỏ (16x16px). Người dùng trên điện thoại hoặc người cao tuổi rất khó bấm trúng ô tròn nhỏ. Nếu có thẻ `<label>` bọc chữ bên cạnh, người dùng chỉ cần chạm vào dòng chữ là ô chọn tự động được kích hoạt.',
    expectedKeywords: ['<label> element', 'for attribute (htmlFor)', 'Accessible Name Computation', 'Touch Target Expansion', 'Screen Reader Announcement', 'Implicit vs Explicit Association'],
    pitfalls: [
      'Dùng thẻ `<span>` hoặc `<p>` thay cho `<label>`: Khiến Screen Reader không thể đọc tên của ô input khi người khiếm thị di chuyển focus vào đó.',
      'Không liên kết `for="inputId"` với `id="inputId"`: Bấm vào chữ bên cạnh không có phản ứng gì, làm giảm kích thước vùng chạm (Touch Target).',
      'Đặt nhiều thẻ `<label>` trùng lặp hoặc lồng nhiều thẻ `<input>` vào cùng 1 thẻ `<label>` gây bối rối cho thiết bị trợ năng.'
    ],
    followUpQuestions: [
      'Sự khác nhau giữa Explicit Label (`<label for="uid">Text</label><input id="uid">`) và Implicit Label (`<label>Text <input></label>`) là gì?',
      'Khi một trường nhập liệu không thể có label nhìn thấy bằng mắt (ví dụ: ô Search chỉ có icon kính lúp), bạn xử lý Accessible Name bằng cách nào (`aria-label` hoặc `.sr-only`)?'
    ]
  },

  'html-017': {
    interviewerIntent: 'Đo lường sự phân biệt chính xác giữa `<select>` (chọn cứng từ danh sách cố định) và `<datalist>` (kết hợp tự do giữa nhập text và gợi ý autocomplete).',
    contextOrScenario: 'Cần làm ô nhập Tên quốc gia: Người dùng có thể tự do gõ tên quốc gia tùy ý, nhưng khi gõ chữ "V" thì danh sách gợi ý "Vietnam", "Vanuatu", "Vatican" xổ xuống để chọn nhanh mà không bắt buộc phải nằm trong danh sách cố định.',
    expectedKeywords: ['<select> vs <datalist>', 'Combo-box Pattern', 'Free-form Text with Suggestions', 'input list attribute', 'Fixed Option Enforcement', 'Progressive Autocomplete'],
    pitfalls: [
      'Dùng `<select>` khi muốn người dùng có thể nhập một giá trị tùy biến mới không có sẵn trong danh sách.',
      'Dùng thư viện JavaScript nặng nề hàng chục KB để làm autocomplete đơn giản trong khi `<datalist>` được hỗ trợ sẵn nguyên bản trong HTML.',
      'Quên rằng `<datalist>` không ép buộc người dùng phải chọn trong danh sách (người dùng vẫn có thể gửi giá trị bất kỳ).'
    ],
    followUpQuestions: [
      'Làm thế nào để liên kết thẻ `<input>` với thẻ `<datalist>` thông qua thuộc tính `list="listId"`?',
      'Hạn chế lớn nhất về mặt UI Styling của thẻ `<datalist>` native so với các thư viện custom dropdown (như Select2 hay Radix UI) là gì?'
    ]
  },

  'html-018': {
    interviewerIntent: 'Kiểm tra kỹ năng nhóm các điều khiển biểu mẫu có ngữ nghĩa (Form Grouping): Sử dụng `<fieldset>` và `<legend>` để hỗ trợ Screen Reader đọc đúng ngữ cảnh của các nhóm Radio buttons hoặc Checkboxes phức tạp.',
    contextOrScenario: 'Trong form thanh toán có nhóm 3 nút Radio: "Thẻ tín dụng", "Ví MoMo", "Chuyển khoản". Nếu không dùng `<fieldset>` và `<legend>`, Screen Reader chỉ đọc cộc lốc: "Radio button: Thẻ tín dụng" mà người khiếm thị không biết đây là câu hỏi về "Phương thức thanh toán" hay "Hình thức nhận tiền".',
    expectedKeywords: ['<fieldset> and <legend>', 'Accessible Radio Group', 'Contextual Announcement for Screen Readers', 'Form Accessibility', 'disabled attribute on <fieldset>', 'WCAG 1.3.1 Info and Relationships'],
    pitfalls: [
      'Dùng thẻ `<div>` bọc nhóm Radio buttons kết hợp thẻ `<h3>` làm tiêu đề: Screen Reader sẽ không tự động đọc lại tiêu đề nhóm khi người dùng Tab qua từng nút radio.',
      'Không biết tính năng mạnh mẽ: Gắn thuộc tính `disabled` lên thẻ `<fieldset>` sẽ tự động vô hiệu hóa toàn bộ tất cả các input con nằm bên trong nó.',
      'Bỏ qua CSS reset cho viền xám mặc định của `<fieldset>` làm giao diện trông cũ kỹ.'
    ],
    followUpQuestions: [
      'Thuộc tính `disabled` trên `<fieldset>` ảnh hưởng như thế nào đến việc submit form của các input con bên trong nó?',
      'Khi nào bắt buộc phải dùng `<fieldset>` và `<legend>` theo tiêu chuẩn WCAG 2.1 Level A?'
    ]
  },

  'html-019': {
    interviewerIntent: 'Đánh giá nhận thức tổng quan về Khả năng tiếp cận Web (Accessibility - a11y): Ý nghĩa nhân văn, khía cạnh pháp lý (ADA / EAA), lợi ích SEO và giá trị kinh doanh cho sản phẩm.',
    contextOrScenario: 'Một công ty công nghệ bị kiện tại Mỹ vì website bán vé máy bay không thể sử dụng được bằng bàn phím hoặc phần mềm đọc màn hình cho người khiếm thị. Ban lãnh đạo yêu cầu kiểm toán và đạt chuẩn WCAG 2.1 AA toàn diện.',
    expectedKeywords: ['Web Accessibility (a11y)', 'WCAG 2.1 / 2.2 AA Standard', 'Screen Readers (NVDA, JAWS, VoiceOver)', 'Keyboard-Only Navigation', 'Color Contrast Ratio', 'Legal Compliance (ADA / European Accessibility Act)'],
    pitfalls: [
      'Nghĩ rằng Accessibility chỉ dành riêng cho người mù hoàn toàn (trong khi nó phục vụ cả người cận thị, người già run tay, người gãy tay tạm thời, người dùng ngoài trời nắng gắt).',
      'Xem Accessibility là tính năng phụ thêm vào sau cùng (Accessibility-as-an-afterthought) thay vì tích hợp ngay từ khâu thiết kế Figma và viết HTML.',
      'Dùng các widget plugin "Accessibility Overlay" tự động (như UserWay/AccessiBe) vốn bị cộng đồng người khuyết tật tẩy chay và không bảo vệ được doanh nghiệp trước các vụ kiện.'
    ],
    followUpQuestions: [
      '4 nguyên tắc cốt lõi của WCAG (POUR: Perceivable, Operable, Understandable, Robust) có ý nghĩa như thế nào?',
      'Tại sao việc viết HTML có ngữ nghĩa tốt (Semantic HTML) đã tự động giải quyết được hơn 70% các yêu cầu về Accessibility?'
    ]
  },

  'html-020': {
    interviewerIntent: 'Kiểm tra kiến thức về WAI-ARIA (Accessible Rich Internet Applications): Hiểu rõ bản chất của ARIA là cầu nối bổ trợ ngữ nghĩa cho Accessibility Tree khi HTML native không đáp ứng được, và nguyên tắc vàng "No ARIA is better than bad ARIA".',
    contextOrScenario: 'Lập trình viên xây dựng một component phức tạp (như Accordion, Modal Dialog, Tabs hoặc Combobox) bằng thẻ `<div>` và CSS. Để người khiếm thị hiểu được trạng thái mở/đóng và vai trò của component, cần bổ sung các thuộc tính ARIA phù hợp.',
    expectedKeywords: ['WAI-ARIA', 'ARIA Roles (role="dialog", role="tab")', 'ARIA States & Properties (aria-expanded, aria-hidden)', 'Accessibility Tree', 'First Rule of ARIA', 'Semantic HTML Priority'],
    pitfalls: [
      'Vi phạm First Rule of ARIA: Dùng `<div role="button" tabindex="0">` thay vì dùng thẻ `<button>` native.',
      'Gán các thuộc tính ARIA sai hoặc không cập nhật trạng thái động bằng JavaScript (ví dụ: menu đã mở nhưng vẫn giữ nguyên `aria-expanded="false"`).',
      'Lạm dụng ARIA bừa bãi làm ghi đè ngữ nghĩa tự nhiên đúng đắn của các thẻ HTML native.'
    ],
    followUpQuestions: [
      'Nguyên tắc vàng: "First Rule of ARIA" phát biểu như thế nào và tại sao nó khuyên không nên dùng ARIA nếu có thẻ HTML native tương đương?',
      'ARIA có làm thay đổi giao diện hiển thị hoặc hành vi bàn phím (Keyboard behavior) của phần tử không, hay lập trình viên phải tự viết JavaScript xử lý?'
    ]
  },

  'html-021': {
    interviewerIntent: 'Đánh giá kỹ năng viết văn bản thay thế (Alt Text) chuẩn mực: Hiểu vai trò của `alt` đối với người khiếm thị dùng Screen Reader, khi mạng bị lỗi không tải được ảnh, và cho bot tìm kiếm Google Images.',
    contextOrScenario: 'Một trang báo điện tử có bài viết về lễ trao giải bóng đá. Lập trình viên để `alt="image.jpg"` hoặc `alt="hình ảnh"` hoặc nhồi nhét từ khóa SEO vô nghĩa vào alt, khiến Screen Reader đọc lên những thông tin rác gây khó chịu cho người nghe.',
    expectedKeywords: ['alt attribute (Alternative Text)', 'Decorative Images (alt="")', 'Informative Images Description', 'Screen Reader Experience', 'Image SEO', 'WCAG 1.1.1 Non-text Content'],
    pitfalls: [
      'Để trống thuộc tính `alt` (không viết chữ `alt` nào): Khiến Screen Reader phải đọc to toàn bộ đường dẫn URL của file ảnh (ví dụ: `alt="https://cdn.site.com/uploads/2026/09/banner_final_v2.png"`).',
      'Bắt đầu alt text bằng cụm từ thừa thãi như "Hình ảnh của..." hoặc "Bức ảnh chụp..." (Screen Reader đã tự động thông báo "Graphic" hoặc "Image" trước khi đọc alt).',
      'Quên để `alt=""` cho các hình ảnh mang tính trang trí thuần túy (Decorative Images), làm Screen Reader dừng lại đọc các icon trang trí không cần thiết.'
    ],
    followUpQuestions: [
      'Khi nào một bức ảnh BẮT BUỘC phải để `alt=""` (Empty Alt) và điều gì xảy ra nếu xóa hẳn thuộc tính `alt`?',
      'Đối với một biểu đồ số liệu phức tạp (Complex Infographic), chiến lược viết alt text ngắn kết hợp với mô tả chi tiết trong thẻ `<figcaption>` hoặc `aria-describedby` ra sao?'
    ]
  },

  'html-022': {
    interviewerIntent: 'Đo lường sự phân biệt chính xác giữa các cơ chế lưu trữ phía Client của Web Storage API: Phân biệt `localStorage` và `sessionStorage` về phạm vi sống (Lifecycle), phạm vi tab, giới hạn dung lượng và bảo mật.',
    contextOrScenario: 'Cần lưu trữ trạng thái người dùng: Một bên là tùy chọn Dark Mode muốn giữ vĩnh viễn qua các lần mở trình duyệt sau; một bên là dữ liệu wizard nhiều bước của một phiên giao dịch chuyển tiền ngân hàng muốn tự động xóa sạch khi người dùng đóng tab.',
    expectedKeywords: ['Web Storage API', 'localStorage (Persistent)', 'sessionStorage (Tab Lifecycle)', '5MB Storage Limit', 'Synchronous Blocking I/O', 'XSS Vulnerability (Tokens Storage)'],
    pitfalls: [
      'Lưu trữ Access Token hoặc JWT chứa thông tin nhạy cảm vào `localStorage`: Dễ dàng bị đánh cắp hoàn toàn thông qua một lỗ hổng Cross-Site Scripting (XSS).',
      'Nghĩ rằng `sessionStorage` được chia sẻ giữa các Tab khác nhau (thực tế `sessionStorage` bị cô lập hoàn toàn cho từng tab/cửa sổ riêng biệt, kể cả khi mở cùng một URL).',
      'Lưu trữ dữ liệu quá lớn vào LocalStorage làm nghẽn Main Thread vì Web Storage API là các hàm đồng bộ (Synchronous Blocking).'
    ],
    followUpQuestions: [
      'Tại sao việc lưu trữ Authentication JWT Token trong `HttpOnly Cookie` lại an toàn hơn nhiều so với lưu trong `localStorage`?',
      'Sự kiện `window.addEventListener("storage", ...)` hoạt động như thế nào để đồng bộ dữ liệu giữa các tab trình duyệt khác nhau trong cùng một domain?'
    ]
  },

  'html-024': {
    interviewerIntent: 'Kiểm tra kỹ năng gán nhãn biểu mẫu chính xác và nhận thức cặn kẽ về cạm bẫy UX/A11y khi lạm dụng thuộc tính `placeholder` để thay thế cho `<label>`.',
    contextOrScenario: 'Thiết kế giao diện tối giản (Minimalist UI) bỏ toàn bộ thẻ `<label>` và chỉ dùng placeholder: "Nhập email của bạn". Khi người dùng bắt đầu gõ chữ, chữ placeholder biến mất, người dùng quên mất ô này đang yêu cầu nhập gì. Đồng thời trên điện thoại, placeholder có độ tương phản màu quá nhạt không đọc được.',
    expectedKeywords: ['<label> Association Methods', 'for/id Explicit Association', 'Wrapping Implicit Association', 'Placeholder Anti-Pattern', 'Disappearing Placeholders', 'WCAG 3.3.2 Labels or Instructions'],
    pitfalls: [
      'Dùng `placeholder` thay thế hoàn toàn cho `<label>`: Người dùng khi gõ chữ sẽ mất dấu ngữ cảnh trường dữ liệu, trình duyệt tự động điền (Autofill) đè lên làm mất thông tin, và Screen Reader gặp khó khăn.',
      'Placeholder mặc định của trình duyệt có màu xám nhạt vi phạm nghiêm trọng độ tương phản tối thiểu WCAG 4.5:1.',
      'Sử dụng nhiều `id` trùng lặp trong cùng một trang làm liên kết `for="inputId"` bị trỏ sai vị trí.'
    ],
    followUpQuestions: [
      'Kỹ thuật "Floating Label" (nhãn nổi dịch chuyển lên góc trên khi focus hoặc có text) dung hòa giữa thiết kế tối giản và yêu cầu Accessibility như thế nào?',
      'Nếu bắt buộc không thể hiển thị label vì lý do thiết kế, kỹ thuật dùng CSS `.sr-only` (chỉ hiển thị cho Screen Reader) được viết ra sao?'
    ]
  },

  'html-025': {
    interviewerIntent: 'Đánh giá kỹ năng phân loại hình ảnh theo tiêu chuẩn WCAG: Biết chính xác khi nào một bức ảnh là Informative (cần alt mô tả ngữ cảnh), Functional (nút bấm cần alt hành động), hay Decorative (bắt buộc `alt=""`).',
    contextOrScenario: 'Một nút bấm icon tìm kiếm chứa thẻ `<img src="magnifier.png" alt="cái kính lúp màu đen">`. Thay vì mô tả hành động "Tìm kiếm", người khiếm thị nghe thấy "cái kính lúp" và không hiểu nút này để làm gì.',
    expectedKeywords: ['Alt Text Decision Tree', 'Functional Images (Action-oriented)', 'Decorative Images (Empty alt="")', 'Informative Images (Contextual)', 'Complex Images (Longdesc / figcaption)', 'Images of Text'],
    pitfalls: [
      'Viết alt cho ảnh chức năng (Functional Image bên trong thẻ `<a>` hoặc `<button>`) bằng cách mô tả hình dạng vật lý thay vì mô tả hành động (ví dụ: viết `alt="kính lúp"` thay vì `alt="Tìm kiếm"`).',
      'Dùng hình ảnh chứa chữ (Images of Text) thay vì dùng chữ thật kết hợp CSS (vừa vỡ nét khi zoom vừa không thể dịch tự động hay bôi đen copy).',
      'Để `alt="null"` hoặc `alt="undefined"` do lỗi render của JavaScript template.'
    ],
    followUpQuestions: [
      'Theo W3C Alt Decision Tree: Nếu một bức ảnh chỉ đóng vai trò làm đẹp bên cạnh một tiêu đề bài viết đã có sẵn, thuộc tính `alt` phải được xử lý như thế nào?',
      'Khi một icon SVG được nhúng inline, thuộc tính `aria-hidden="true"` được sử dụng khi nào?'
    ]
  },

  'html-027': {
    interviewerIntent: 'Kiểm tra sự thấu hiểu Tiêu chí WCAG 1.4.1 (Use of Color): Đảm bảo thông tin, trạng thái lỗi hoặc dữ liệu biểu đồ không bao giờ chỉ được truyền tải duy nhất bằng màu sắc.',
    contextOrScenario: 'Một Form nhập liệu khi có lỗi chỉ đổi viền ô input sang màu đỏ mà không có thông báo chữ hoặc icon cảnh báo. Người dùng bị mù màu (Color Blindness - ví dụ: mù màu đỏ-xanh chiếm 8% nam giới) hoàn toàn không nhận biết được ô nào đang bị lỗi để sửa.',
    expectedKeywords: ['WCAG 1.4.1 (Use of Color)', 'Color Blindness (Deuteranopia / Protanopia)', 'Multi-Modal Feedback (Color + Icon + Text)', 'Chart Legend Patterns (Dashes, Textures)', 'Form Error States', 'Accessible Data Visualization'],
    pitfalls: [
      'Chỉ dùng viền đỏ để báo lỗi form mà không có dòng chữ thông báo lỗi (Error message text) và icon cảnh báo đi kèm.',
      'Thiết kế biểu đồ hình tròn (Pie Chart) chỉ phân biệt các phần tử bằng các màu sắc tương đồng mà không có họa tiết (Patterns/Textures) hoặc nhãn trực tiếp trên lát cắt.',
      'Sử dụng các đường link trong đoạn văn bản chỉ phân biệt với chữ thường bằng màu sắc mà không có gạch chân (`text-decoration: underline`).'
    ],
    followUpQuestions: [
      'Làm thế nào để sử dụng Chrome DevTools (Rendering tab -> Emulate vision deficiencies) để mô phỏng các dạng mù màu khi kiểm thử giao diện?',
      'Quy tắc thiết kế biểu đồ tiếp cận (Accessible Charts): Tại sao việc hiển thị nhãn số liệu trực tiếp (Direct Data Labels) tốt hơn nhiều so với việc bắt người dùng tra cứu bảng chú thích màu sắc?'
    ]
  },

  'html-028': {
    interviewerIntent: 'Đánh giá kiến thức về Quốc tế hóa và Khả năng đọc màn hình: Nắm vững tiêu chí WCAG 3.1.1 (Language of Page) và 3.1.2 (Language of Parts) thông qua thuộc tính `lang`.',
    contextOrScenario: 'Một trang web tin tức tiếng Việt có trích dẫn một đoạn văn nguyên văn bằng tiếng Anh hoặc tiếng Pháp. Nếu không khai báo thuộc tính `lang` chính xác, phần mềm đọc màn hình (Screen Reader) sẽ dùng bộ phát âm tiếng Việt để phát âm đoạn tiếng Anh, tạo ra âm thanh méo mó vô nghĩa.',
    expectedKeywords: ['lang attribute', 'BCP 47 Language Tags (vi, en-US)', 'WCAG 3.1.1 Language of Page', 'WCAG 3.1.2 Language of Parts', 'Screen Reader Text-to-Speech Engine', 'Browser Hyphenation & Spellcheck'],
    pitfalls: [
      'Quên khai báo thuộc tính `lang` trên thẻ gốc `<html lang="vi">`: Screen Reader sẽ sử dụng ngôn ngữ mặc định của hệ điều hành để đọc, gây sai lệch ngữ điệu hoàn toàn.',
      'Trang web có đoạn văn tiếng nước ngoài nhưng không bọc trong thẻ có `lang` cục bộ (ví dụ: `<blockquote lang="en">`).',
      'Dùng mã ngôn ngữ không chuẩn (ví dụ: dùng `lang="vn"` thay vì mã chuẩn ISO BCP 47 là `lang="vi"`).'
    ],
    followUpQuestions: [
      'Thuộc tính `lang` ảnh hưởng như thế nào đến bộ máy ngắt từ tự động (CSS `hyphens: auto`) và tính năng kiểm tra chính tả của trình duyệt?',
      'Cấu trúc của một BCP 47 Language Tag (ví dụ: `zh-Hans` cho tiếng Trung giản thể vs `en-GB` cho tiếng Anh Anh) bao gồm những thành phần nào?'
    ]
  },

  'html-029': {
    interviewerIntent: 'Kiểm tra nhận thức về Tiêu chí WCAG 2.4.4 (Link Purpose In Context): Hiểu lý do tại sao các đường link tối nghĩa như "Xem thêm", "Chi tiết", "Click here" bị đánh trượt audit và cách xử lý link chỉ có icon.',
    contextOrScenario: 'Một trang danh sách tin tức có 20 bài báo, dưới mỗi bài đều có một nút link ghi chữ "Xem thêm". Người khiếm thị sử dụng tính năng "Links List" của Screen Reader (liệt kê toàn bộ các link trên trang để bấm nhanh) và chỉ nghe thấy một danh sách vô nghĩa lặp lại: "Xem thêm, Xem thêm, Xem thêm...".',
    expectedKeywords: ['WCAG 2.4.4 (Link Purpose In Context)', 'Ambiguous Link Text ("Read More")', 'Accessible Link Names', 'aria-label on links', 'Screen Reader Only Text (.sr-only)', 'Icon-only Links Accessibility'],
    pitfalls: [
      'Sử dụng link chỉ có duy nhất 1 icon SVG mà không có `aria-label` hoặc thẻ `<span class="sr-only">`: Screen Reader hoàn toàn không đọc được đích đến của đường link.',
      'Viết text link cộc lốc "Xem thêm" mà không gắn kèm ngữ cảnh bài viết.',
      'Dùng link rỗng `<a href="#">` làm nút bấm kích hoạt JavaScript thay vì sử dụng thẻ `<button>` chuẩn ngữ nghĩa.'
    ],
    followUpQuestions: [
      'Kỹ thuật sử dụng `<span class="sr-only"> về bài viết: Ra mắt chip M4</span>` bên trong thẻ `<a>Xem thêm</a>` giải quyết bài toán thị giác lẫn trợ năng hoàn hảo ra sao?',
      'Sự khác nhau giữa việc dùng thẻ `<a>` (định hướng trang / chuyển URL) và thẻ `<button>` (thực thi hành động trong trang / mở modal) là gì?'
    ]
  },

  'html-030': {
    interviewerIntent: 'Kiểm tra kiến thức nền tảng vững vàng về 2 thuộc tính cốt lõi của HTML: Phân biệt `id` (duy nhất toàn tài liệu, dùng cho neo URL, label linking, ARIA) và `class` (tái sử dụng nhiều lần, dùng cho styling và component groups).',
    contextOrScenario: 'Lập trình viên copy-paste component Card nhiều lần, dẫn đến việc có 5 thẻ input khác nhau trên cùng một trang đều có chung thuộc tính `id="username"`. Khi người dùng bấm vào `<label for="username">`, con trỏ chuột luôn nhảy về ô input đầu tiên thay vì ô tương ứng.',
    expectedKeywords: ['id vs class attribute', 'Unique Identifier Constraint', 'Anchor Navigation (URL Hashes #target)', 'ARIA Reference Targets', 'Reusability & Modularity', 'DOM Document Object Model'],
    pitfalls: [
      'Sử dụng trùng lặp `id` trên cùng một trang web: Vi phạm tiêu chuẩn HTML5, làm hỏng các liên kết Form `<label for>`, các thuộc tính `aria-labelledby`, và khiến `document.getElementById` chỉ trả về phần tử đầu tiên.',
      'Lạm dụng `id` làm selector trong CSS: Gây ra Specificity quá cao (0-1-0-0) làm khó khăn cho việc ghi đè style sau này.',
      'Đặt tên `id` hoặc `class` bắt đầu bằng chữ số hoặc chứa các ký tự đặc biệt không hợp lệ trong CSS.'
    ],
    followUpQuestions: [
      'Tại sao trong CSS, các chuyên gia kiến trúc frontend khuyến nghị 100% chỉ nên dùng `class` để style và tuyệt đối tránh dùng `id`?',
      'Cách thuộc tính `id` hoạt động như một điểm neo điều hướng (Anchor Jump: `https://example.com/#section-pricing`) trên trình duyệt?'
    ]
  },

  'html-031': {
    interviewerIntent: 'Đo lường sự am hiểu chi tiết về các thẻ văn bản nội dòng có ngữ nghĩa đặc thù: Phân biệt rõ rệt giữa `<mark>` (đánh dấu liên quan), `<strong>` (tầm quan trọng cao) và `<em>` (nhấn mạnh ngữ điệu).',
    contextOrScenario: 'Trong một kết quả tìm kiếm tài liệu pháp luật: Các từ khóa mà người dùng vừa gõ cần được bôi vàng nổi bật; các điều khoản cảnh báo phạt tù cần thể hiện sự nghiêm trọng; và các từ ngữ chuyên ngành cần nhấn mạnh khi đọc to.',
    expectedKeywords: ['<mark> (Relevance Highlighting)', '<strong> (Strong Importance)', '<em> (Stress Emphasis)', 'Semantic Nuances', 'Screen Reader Vocal Modulation', 'Physical tags (<b>, <i>) Replacement'],
    pitfalls: [
      'Dùng thẻ `<b>` (chỉ in đậm thị giác) thay cho `<strong>` (mang ngữ nghĩa quan trọng thực sự), làm Screen Reader không nhận diện được mức độ khẩn cấp của nội dung.',
      'Dùng `<i>` (chỉ in nghiêng thị giác) thay cho `<em>` (thay đổi trọng âm ngữ điệu khi đọc câu văn).',
      'Dùng thẻ `<span>` có màu nền vàng thay cho thẻ ngữ nghĩa chuẩn mực `<mark>` cho các kết quả tìm kiếm trùng khớp.'
    ],
    followUpQuestions: [
      'Làm thế nào để phần mềm đọc màn hình (Screen Reader) thay đổi cao độ và âm lượng giọng đọc khi gặp thẻ `<strong>` và `<em>`?',
      'Khi nào thẻ `<i>` vẫn có giá trị ngữ nghĩa hợp lệ trong HTML5 (ví dụ: thuật ngữ kỹ thuật, từ nước ngoài, suy nghĩ nội tâm)?'
    ]
  },

  'html-032': {
    interviewerIntent: 'Kiểm tra việc sử dụng thẻ ngữ nghĩa dữ liệu thời gian: Thẻ `<time>` kết hợp thuộc tính `datetime` theo chuẩn máy đọc được (ISO 8601) hỗ trợ SEO, trợ năng và tự động hóa lịch.',
    contextOrScenario: 'Một bài viết blog hiển thị ngày đăng: "3 giờ trước" hoặc "Hôm qua". Người đọc hiểu được nhưng Google Bot và Screen Reader không thể biết chính xác bài viết được xuất bản vào ngày, tháng, năm nào theo giờ chuẩn quốc tế.',
    expectedKeywords: ['<time> element', 'datetime attribute (ISO 8601)', 'Machine-Readable Timestamps', 'Search Engine Date Indexing', 'Relative Time Localization', 'Calendar Integration'],
    pitfalls: [
      'Dùng thẻ `<time>` nhưng quên thuộc tính `datetime`: Trình duyệt và máy tìm kiếm chỉ thấy chuỗi văn bản người đọc ("hôm qua") mà không trích xuất được mốc thời gian thực sự.',
      'Viết sai định dạng ISO 8601 trong `datetime` (ví dụ: viết `20/09/2026` thay vì chuẩn quốc tế `2026-09-20T14:30:00Z`).',
      'Sử dụng thẻ `<span>` thông thường cho ngày giờ của các sự kiện, đánh mất cơ hội xuất hiện Rich Snippet ngày đăng trên kết quả tìm kiếm Google.'
    ],
    followUpQuestions: [
      'Cú pháp chuẩn ISO 8601 biểu diễn thời lượng (Duration: ví dụ: thời lượng một khóa học kéo dài 2 tiếng 30 phút là `PT2H30M`) trong thẻ `<time datetime="...">` như thế nào?',
      'Google Search sử dụng thẻ `<time>` để hiển thị ngày đăng bài trên SERP Snippets ra sao?'
    ]
  },

  'html-033': {
    interviewerIntent: 'Đánh giá mức độ am hiểu về mối quan hệ cộng sinh giữa Semantic HTML và Tối ưu hóa công cụ tìm kiếm (Technical SEO): Cách bot tìm kiếm bóc tách nội dung chính, trích xuất thực thể và tạo Rich Snippets.',
    contextOrScenario: 'Một trang web thương mại điện tử toàn bộ làm bằng `<div>` và `<span>` có thứ hạng tìm kiếm rất thấp. Sau khi tái cấu trúc sang chuẩn Semantic HTML (`<article>`, `<header>`, `<nav>`, `<main>`, `<aside>`, `<h1> - <h6>`), thứ hạng SEO tăng vọt.',
    expectedKeywords: ['Semantic HTML & SEO', 'Content Hierarchy & Crawlability', 'Featured Snippets Extraction', 'Schema.org & Structured Data', 'Heading Hierarchy (One H1 Rule)', 'Accessibility & SEO Overlap'],
    pitfalls: [
      'Sử dụng nhiều thẻ `<h1>` lộn xộn hoặc nhảy cấp tiêu đề (từ `<h1>` nhảy cóc xuống `<h4>`), làm rối loạn cấu trúc phân cấp tài liệu của Web Crawler.',
      'Nhồi nhét toàn bộ nội dung phụ vào thẻ `<main>` thay vì đặt trong `<aside>` hoặc `<footer>`.',
      'Nghĩ rằng chỉ cần cài plugin SEO là đủ mà không nhận ra rằng Semantic HTML sạch chính là nền tảng cốt lõi của Technical SEO.'
    ],
    followUpQuestions: [
      'Googlebot sử dụng thẻ `<main>` và `<article>` để phân biệt đâu là nội dung cốt lõi của trang và đâu là nội dung lặp lại (Boilerplate Header/Footer) như thế nào?',
      'Tại sao việc tuân thủ cấu trúc phân cấp Heading (`h1 -> h2 -> h3`) giúp tăng khả năng bài viết được chọn làm Google Featured Snippet (Vị trí Top 0)?'
    ]
  },

  'html-034': {
    interviewerIntent: 'Kiểm tra việc sử dụng danh sách mô tả có cấu trúc: Thẻ `<dl>`, `<dt>`, `<dd>` dùng cho cặp khóa-giá trị (Key-Value Pairs), bảng chú giải thuật ngữ hoặc metadata.',
    contextOrScenario: 'Màn hình chi tiết thông số kỹ thuật điện thoại (RAM: 8GB, Bộ nhớ: 256GB, Màn hình: OLED 6.7 inch) hoặc chi tiết biên lai hóa đơn (Mã đơn: #123, Ngày mua: 20/09, Tổng tiền: 500k). Lập trình viên trước đây dùng bảng `<table>` hoặc các cặp `<div>` vô nghĩa.',
    expectedKeywords: ['<dl> (Description List)', '<dt> (Description Term)', '<dd> (Description Details)', 'Key-Value Semantic Representation', 'Accessibility Announcement for Pairs', 'CSS Flexbox Styling with <div> inside <dl>'],
    pitfalls: [
      'Dùng thẻ `<ul>` hoặc `<ol>` cho dữ liệu dạng cặp Khóa - Giá trị, làm mất đi mối liên kết ngữ nghĩa giữa nhãn và giá trị tương ứng.',
      'Nghĩ rằng không được phép bọc `<div>` bên trong `<dl>`: Trong HTML5 hiện đại, W3C đã chính thức cho phép dùng thẻ `<div>` trực tiếp bên trong `<dl>` để gom nhóm cặp `<dt>` và `<dd>` giúp việc styling Flexbox/Grid trở nên cực kỳ dễ dàng.',
      'Sử dụng thẻ `<table>` phức tạp cho một danh sách key-value đơn giản chỉ có vài cặp dữ liệu.'
    ],
    followUpQuestions: [
      'HTML5 cho phép một thẻ `<dt>` đi kèm với nhiều thẻ `<dd>` (hoặc ngược lại) để biểu diễn mối quan hệ 1-N (ví dụ: một từ có nhiều định nghĩa) như thế nào?',
      'Cách sử dụng `<div>` bên trong `<dl>` để layout các hàng thông số kỹ thuật responsive bằng Flexbox chuẩn W3C ra sao?'
    ]
  },

  'html-035': {
    interviewerIntent: 'Kiểm tra việc áp dụng tính năng Accordion / Collapse nguyên bản: Sử dụng thẻ `<details>` và `<summary>` để làm nội dung mở rộng đóng mở mà không cần viết một dòng JavaScript nào.',
    contextOrScenario: 'Cần làm trang Hỏi-Đáp thường gặp (FAQ Page) gồm 20 câu hỏi có thể bấm vào để mở rộng câu trả lời. Yêu cầu tính năng phải hoạt động ngay cả khi người dùng tắt JavaScript hoặc khi JS chưa kịp tải xong.',
    expectedKeywords: ['<details> and <summary>', 'Native HTML Accordion', 'Zero-JS Disclosure Widget', 'open attribute', '::marker Styling', 'name attribute for Exclusive Accordion'],
    pitfalls: [
      'Dùng thư viện JavaScript phức tạp để làm Accordion FAQ đơn giản, làm tăng kích thước bundle và chậm thời gian tương tác (TTI).',
      'Quên thẻ `<summary>` bên trong `<details>`: Trình duyệt sẽ tự động chèn một dòng chữ mặc định "Details" thô kệch.',
      'Không biết tính năng mới của HTML5: Thuộc tính `name="faq-group"` trên các thẻ `<details>` cho phép tạo Accordion độc quyền (Exclusive Accordion - khi mở câu này thì câu kia tự đóng) hoàn toàn không cần JS.'
    ],
    followUpQuestions: [
      'Làm thế nào để tạo hiệu ứng đóng mở mượt mà (Smooth Animation) cho thẻ `<details>` bằng CSS hiện đại (`interpolate-size: allow-keywords` hoặc `@starting-style`)?',
      'Thuộc tính `name` trên thẻ `<details>` mới được hỗ trợ trên toàn bộ các trình duyệt vào năm nào và giải quyết bài toán gì?'
    ]
  },

  'html-036': {
    interviewerIntent: 'Đánh giá kiến thức về Ứng dụng Web lũy tiến (Progressive Web Apps - PWA): Khả năng biến website thành một ứng dụng có thể cài đặt trên màn hình điện thoại (Installable), hoạt động offline và nhận thông báo đẩy.',
    contextOrScenario: 'Doanh nghiệp muốn khách hàng có thể cài đặt trang web thương mại điện tử lên màn hình chính của iPhone/Android như một app native từ App Store, hỗ trợ mở nhanh không có thanh địa chỉ trình duyệt và hoạt động được khi mất mạng.',
    expectedKeywords: ['Progressive Web App (PWA)', 'Web App Manifest (manifest.json)', 'Service Worker (Offline Caching)', 'HTTPS Security Requirement', 'Installability Criteria (beforeinstallprompt)', 'App Shell Architecture'],
    pitfalls: [
      'Thiếu file `manifest.json` hoặc khai báo thiếu các kích thước icon bắt buộc (như icon 192x192px và 512x512px), khiến trình duyệt không kích hoạt banner mời cài đặt app.',
      'Chạy PWA trên giao thức HTTP không bảo mật (Service Worker bắt buộc 100% phải chạy trên HTTPS hoặc localhost).',
      'Chỉ cài đặt Service Worker mà không có chiến lược Caching rõ ràng (Network-first vs Cache-first), dẫn đến việc phục vụ dữ liệu cũ rác cho người dùng vĩnh viễn.'
    ],
    followUpQuestions: [
      '3 tiêu chí kỹ thuật bắt buộc để một trang web được trình duyệt Chrome/Safari nhận diện là một PWA có thể cài đặt (Installable PWA) là gì?',
      'Service Worker Lifecycle (Register -> Install -> Activate -> Fetch) quản lý việc cập nhật phiên bản mới của website ra sao?'
    ]
  },

  'html-037': {
    interviewerIntent: 'Kiểm tra sự thông thạo các thuộc tính kiểm thực biểu mẫu nguyên bản của HTML5 (Native Form Validation Attributes): Giảm tải JavaScript và tăng độ tin cậy.',
    contextOrScenario: 'Xây dựng form đăng ký: Yêu cầu bắt buộc nhập họ tên, mật khẩu tối thiểu 8 ký tự có chứa số và ký tự đặc biệt, số tuổi từ 18 đến 60, và số điện thoại đúng định dạng Việt Nam.',
    expectedKeywords: ['HTML5 Form Validation', 'required attribute', 'pattern attribute (Regex)', 'min and max / minlength and maxlength', 'step attribute', 'type-specific validation'],
    pitfalls: [
      'Tin tưởng hoàn toàn vào HTML5 Form Validation ở Client-side mà bỏ qua bước kiểm thực lại ở Backend Server (kẻ xấu có thể dễ dàng bypass HTML validation bằng cURL hoặc Postman).',
      'Viết biểu thức Regex trong thuộc tính `pattern` có chứa dấu gạch chéo `/^...$/` của JavaScript (thuộc tính `pattern` trong HTML tự động khớp toàn bộ chuỗi nên không cần `^` và `$`).',
      'Không tùy biến câu thông báo lỗi mặc định của trình duyệt (Browser default error bubble) khiến câu báo lỗi hiển thị tiếng Anh khô cứng.'
    ],
    followUpQuestions: [
      'Thuộc tính `novalidate` trên thẻ `<form>` dùng để làm gì và tại sao các thư viện form JS (như Formik hay React Hook Form) luôn bật thuộc tính này?',
      'Làm thế nào để style trạng thái hợp lệ và lỗi của ô input hoàn toàn bằng CSS thông qua pseudo-classes `:valid`, `:invalid`, và `:user-invalid`?'
    ]
  },

  'html-038': {
    interviewerIntent: 'Kiểm tra sự phân biệt chính xác giữa `readonly` và `disabled`: Khác biệt then chốt về khả năng gửi dữ liệu trong Form Submission, khả năng focus bàn phím và tác động đến Accessibility.',
    contextOrScenario: 'Trong một form chỉnh sửa thông tin cá nhân: Trường "Tên đăng nhập" không cho phép sửa nhưng vẫn phải gửi kèm lên server khi bấm Lưu; trong khi trường "Mã số thuế" bị khóa do người dùng chưa tick chọn "Khách hàng doanh nghiệp" và không được gửi lên server.',
    expectedKeywords: ['readonly vs disabled', 'Form Submission Inclusion (FormData)', 'Focusability & Tab Navigation', 'Styling Pseudo-classes (:disabled vs :read-only)', 'Accessibility Tree Impact', 'Security Bypass Reality'],
    pitfalls: [
      'Dùng `disabled` cho ô input chứa dữ liệu muốn gửi lên server: Dữ liệu của ô `disabled` HOÀN TOÀN BỊ TRÌNH DUYỆT BỎ QUA khi submit form.',
      'Nghĩ rằng `readonly` áp dụng được cho mọi loại input (thực tế `readonly` KHÔNG có tác dụng trên `<select>`, `<input type="checkbox">`, `<input type="radio">` hay file upload).',
      'Cho rằng `readonly` là giải pháp bảo mật dữ liệu (người dùng có thể dễ dàng mở DevTools xóa chữ `readonly` và sửa giá trị gửi lên server).'
    ],
    followUpQuestions: [
      'Tại sao ô input `readonly` vẫn có thể nhận Focus bàn phím và người dùng vẫn có thể bôi đen copy chữ, trong khi ô `disabled` bị loại hoàn toàn khỏi chuỗi Tab bàn phím?',
      'Làm thế nào để gửi dữ liệu của một trường bị vô hiệu hóa lên server một cách an toàn (dùng `<input type="hidden">`)?'
    ]
  },

  'html-039': {
    interviewerIntent: 'Đánh giá kiến thức về mã hóa dữ liệu khi gửi Form (Form Encoding Types): Nắm vững 3 giá trị của thuộc tính `enctype` và lý do bắt buộc phải dùng `multipart/form-data` khi tải tệp tin.',
    contextOrScenario: 'Một Form cho phép người dùng nhập họ tên và tải lên file ảnh đại diện (File Upload). Lập trình viên quên khai báo thuộc tính `enctype` trên thẻ `<form>`, khiến server backend chỉ nhận được tên file dưới dạng chuỗi text chứ không nhận được dữ liệu nhị phân (Binary stream) của bức ảnh.',
    expectedKeywords: ['enctype attribute', 'application/x-www-form-urlencoded (Default)', 'multipart/form-data', 'text/plain', 'Binary File Uploads', 'MIME Boundary Delimiters'],
    pitfalls: [
      'Quên khai báo `enctype="multipart/form-data"` khi có `<input type="file">`: Trình duyệt sẽ dùng mã hóa mặc định urlencoded và chỉ gửi chuỗi tên file, làm mất toàn bộ nội dung file tải lên.',
      'Sử dụng `multipart/form-data` kết hợp với phương thức `method="GET"` (thuộc tính `enctype` CHỈ có tác dụng khi `method="POST"`).',
      'Dùng `enctype="text/plain"` trên production (đây là định dạng gỡ lỗi không mã hóa, không phù hợp cho việc xử lý backend an toàn).'
    ],
    followUpQuestions: [
      'Cơ chế phân tách các phần dữ liệu bằng chuỗi Boundary (`--boundary-string`) trong gói tin `multipart/form-data` hoạt động ra sao?',
      'Tại sao định dạng mặc định `application/x-www-form-urlencoded` lại không phù hợp và gây lãng phí băng thông khủng khiếp nếu dùng để mã hóa tệp tin nhị phân lớn?'
    ]
  },

  'html-040': {
    interviewerIntent: 'Kiểm tra kỹ năng tối ưu hóa tính năng Tự động điền (Autofill & Password Managers): Sử dụng thuộc tính `autocomplete` chuẩn ngữ nghĩa giúp trình duyệt và các ứng dụng quản lý mật khẩu (1Password, Bitwarden, iCloud Keychain) điền biểu mẫu nhanh chóng.',
    contextOrScenario: 'Khách hàng thanh toán trên điện thoại di động: Nếu form có thuộc tính autocomplete chuẩn, trình duyệt sẽ tự động gợi ý điền Họ tên, Số thẻ tín dụng, Ngày hết hạn và Địa chỉ nhận hàng chỉ bằng 1 chạm Face ID / Vân tay.',
    expectedKeywords: ['autocomplete attribute', 'Browser Autofill Integration', 'Password Managers Compatibility', 'Credential Tokens (new-password, current-password)', 'Credit Card Tokens (cc-number, cc-exp)', 'One-Time Code (one-time-code / OTP)'],
    pitfalls: [
      'Đặt `autocomplete="off"` trên toàn bộ form một cách vô tội vạ: Trình duyệt hiện đại và các phần mềm quản lý mật khẩu sẽ bỏ qua chỉ thị này để bảo vệ trải nghiệm người dùng.',
      'Dùng `type="password"` cho ô nhập mật khẩu mới mà quên khai báo `autocomplete="new-password"`, khiến trình duyệt tự động điền đè mật khẩu cũ vào ô này.',
      'Không tận dụng giá trị `autocomplete="one-time-code"` cho ô nhập mã OTP trên iOS/Android để tự động đọc mã từ tin nhắn SMS.'
    ],
    followUpQuestions: [
      'Giá trị `autocomplete="one-time-code"` giúp ứng dụng Mobile Web tự động bắt mã OTP gửi qua tin nhắn SMS như thế nào?',
      'Cú pháp nâng cao: Phân biệt `autocomplete="shipping street-address"` và `autocomplete="billing street-address"` trong form thương mại điện tử ra sao?'
    ]
  },

  'html-041': {
    interviewerIntent: 'Đánh giá kiến thức về Constraint Validation API trong JavaScript: Khả năng can thiệp và tùy biến sâu hệ thống kiểm thực form native của trình duyệt (`checkValidity()`, `validity` object, `setCustomValidity()`).',
    contextOrScenario: 'Cần kiểm tra ô nhập "Nhập lại mật khẩu" phải khớp hoàn toàn với ô "Mật khẩu". Vì HTML5 không có thuộc tính native nào so sánh 2 trường, lập trình viên sử dụng Constraint Validation API để gắn thông báo lỗi tùy biến vào luồng kiểm thực của trình duyệt.',
    expectedKeywords: ['Constraint Validation API', 'element.checkValidity()', 'validity state object (valid, valueMissing, patternMismatch)', 'setCustomValidity() function', 'form.reportValidity()', 'Custom Error Messages'],
    pitfalls: [
      'Gọi `setCustomValidity("Lỗi gì đó")` nhưng sau khi người dùng sửa lỗi lại quên gọi `setCustomValidity("")` (chuỗi rỗng): Khiến ô input bị coi là luôn luôn có lỗi vĩnh viễn và không bao giờ submit form được.',
      'Ngăn chặn sự kiện submit bằng `e.preventDefault()` mà quên gọi `form.reportValidity()` để hiển thị bong bóng thông báo lỗi cho người dùng.',
      'Tự viết logic kiểm tra rườm rào thay vì tra cứu trực tiếp các cờ trạng thái boolean có sẵn trong object `input.validity` (như `validity.typeMismatch` hay `validity.tooShort`).'
    ],
    followUpQuestions: [
      '10 thuộc tính boolean bên trong object `input.validity` (như `badInput`, `customError`, `patternMismatch`, `rangeOverflow`, `stepMismatch`, `tooLong`, `tooShort`, `typeMismatch`, `valid`, `valueMissing`) đại diện cho các lỗi nào?',
      'Cách sử dụng `form.checkValidity()` kết hợp CSS `:user-invalid` để chỉ hiện thông báo lỗi sau khi người dùng đã tương tác và rời khỏi ô input?'
    ]
  },

  'html-042': {
    interviewerIntent: 'Kiểm tra kỹ năng sử dụng FormData API trong JavaScript hiện đại: Thu thập tự động toàn bộ dữ liệu của Form (bao gồm cả file đính kèm) để gửi qua Fetch/AJAX mà không cần đọc từng input thủ công.',
    contextOrScenario: 'Một Form khảo sát gồm 30 trường nhập liệu và 3 file ảnh. Lập trình viên muốn gửi form bất đồng bộ qua `fetch("/api/survey")` mà không muốn viết 30 dòng `document.getElementById` để gom dữ liệu vào JSON.',
    expectedKeywords: ['FormData API', 'new FormData(formElement)', 'Multipart Request Automation', 'File Payload Serialization', 'formData.append() / entries()', 'Fetch API Content-Type Traps'],
    pitfalls: [
      'Tự ý thêm Header `headers: { "Content-Type": "multipart/form-data" }` khi gửi FormData qua `fetch()`: Việc này làm mất chuỗi Boundary phân tách dữ liệu do trình duyệt tự động sinh ra, khiến server backend không thể giải mã được gói tin.',
      'Quên rằng các thẻ input không có thuộc tính `name` sẽ bị FormData API bỏ qua hoàn toàn.',
      'Các trường bị `disabled` cũng sẽ tự động bị loại khỏi FormData.'
    ],
    followUpQuestions: [
      'Tại sao khi gửi FormData qua `fetch()`, ta bắt buộc phải ĐỂ TRÌNH DUYỆT TỰ ĐỘNG thiết lập Header `Content-Type` thay vì tự gán thủ công?',
      'Làm thế nào để chuyển đổi nhanh một object FormData thành một JSON Object thông thường bằng `Object.fromEntries(formData.entries())`?'
    ]
  },

  'html-043': {
    interviewerIntent: 'Đánh giá kiến thức toàn diện về Tiêu chuẩn Hướng dẫn Tiếp cận Nội dung Web (Web Content Accessibility Guidelines - WCAG): Hiểu rõ cấu trúc tiêu chuẩn, 4 nguyên tắc POUR và 3 cấp độ tuân thủ (Level A, AA, AAA).',
    contextOrScenario: 'Dự án ngân hàng hoặc cơ quan chính phủ yêu cầu nghiệm thu đạt chuẩn WCAG 2.1 Level AA. Đội ngũ kỹ thuật cần nắm vững phạm vi yêu cầu để xây dựng Checklist kiểm thử chất lượng trước khi bàn giao.',
    expectedKeywords: ['WCAG (Web Content Accessibility Guidelines)', 'Level A (Minimum Baseline)', 'Level AA (Industry / Legal Standard)', 'Level AAA (Specialized Gold Standard)', 'POUR Principles (Perceivable, Operable, Understandable, Robust)', 'Automated & Manual Auditing (Axe-core, Lighthouse)'],
    pitfalls: [
      'Cho rằng Level AAA là mục tiêu bắt buộc cho toàn bộ website (W3C khẳng định Level AAA không thể áp dụng cho toàn bộ nội dung của trang web thông thường, Level AA mới là tiêu chuẩn pháp lý công nghiệp toàn cầu).',
      'Nghĩ rằng đạt điểm 100 trên Google Lighthouse là đã đạt chuẩn WCAG (Lighthouse chỉ quét tự động được khoảng 30-40% các lỗi tiếp cận, hơn 60% lỗi còn lại bắt buộc phải kiểm thử thủ công bằng bàn phím và Screen Reader).',
      'Bỏ qua các tiêu chuẩn về độ tương phản màu sắc (Color Contrast Ratio tối thiểu 4.5:1 cho văn bản thông thường theo chuẩn AA).'
    ],
    followUpQuestions: [
      'Độ tương phản màu sắc tối thiểu theo chuẩn WCAG Level AA là bao nhiêu đối với văn bản thông thường (Normal Text: 4.5:1) và văn bản cỡ lớn (Large Text: 3:1)?',
      'Tại sao việc kiểm thử điều hướng hoàn toàn bằng bàn phím (Keyboard-Only Testing: Phím Tab, Shift+Tab, Enter, Space, Escape, Mũi tên) là bài kiểm tra WCAG quan trọng nhất?'
    ]
  },

  'html-044': {
    interviewerIntent: 'Đo lường sự phân biệt rạch ròi giữa bộ ba thuộc tính ARIA đặt tên và mô tả: Phân biệt `aria-label` (gán chuỗi text trực tiếp), `aria-labelledby` (tham chiếu ID của phần tử nhìn thấy được) và `aria-describedby` (tham chiếu ID của đoạn mô tả/hướng dẫn bổ trợ).',
    contextOrScenario: 'Một ô nhập mật khẩu: (1) Cần có nhãn tiêu đề "Mật khẩu"; (2) Có nút con mắt ẩn/hiện mật khẩu cần Accessible Name; (3) Có dòng chữ nhỏ bên dưới hướng dẫn "Mật khẩu phải có ít nhất 8 ký tự". Cần kết nối 3 thành phần này một cách chuẩn xác cho Screen Reader.',
    expectedKeywords: ['aria-label vs aria-labelledby vs aria-describedby', 'Accessible Name vs Accessible Description', 'ID Reference Targets', 'Screen Reader Reading Order', 'Visible Label Association', 'Form Field Instructions'],
    pitfalls: [
      'Dùng `aria-label` khi đã có sẵn nhãn văn bản nhìn thấy được trên màn hình (vi phạm tiêu chí Label in Name của WCAG, trường hợp này nên dùng thẻ `<label>` hoặc `aria-labelledby` trỏ vào ID của chữ đó).',
      'Nhầm lẫn giữa `aria-labelledby` (đặt TÊN CHÍNH cho phần tử, ghi đè toàn bộ tên khác) và `aria-describedby` (bổ sung THÔNG TIN MÔ TẢ PHỤ, được đọc sau khi tên chính đã được đọc xong).',
      'Trỏ `aria-labelledby` hoặc `aria-describedby` vào một ID không hề tồn tại trong tài liệu HTML.'
    ],
    followUpQuestions: [
      'Thứ tự ưu tiên tính toán Accessible Name (Accessible Name Computation Algorithm): Nếu một phần tử vừa có `aria-labelledby`, vừa có `aria-label`, vừa có `<label>`, trình duyệt sẽ ưu tiên cái nào?',
      'Cách sử dụng `aria-describedby` để liên kết thông báo lỗi (Error Message) với ô input để Screen Reader tự động đọc thông báo lỗi ngay khi người dùng focus vào ô đó?'
    ]
  }
};

let count = 0;
for (const [id, update] of Object.entries(batch1)) {
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
console.log(`Enriched HTML Metadata Batch 1: ${count} questions updated.`);
