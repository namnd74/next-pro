import fs from 'node:fs';
import path from 'node:path';

const filePath = path.resolve('src/features/interview/data/json/html-bank.json');
const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));

const batch2 = {
  'html-045': {
    interviewerIntent: 'Đo lường nhận thức về Điều hướng bằng bàn phím (Keyboard Navigation): Tiêu chuẩn cốt lõi của Accessibility, đảm bảo mọi tính năng có thể dùng bằng chuột đều phải dùng được bằng phím (Phím Tab, Enter, Space, Escape, Mũi tên).',
    contextOrScenario: 'Một khách hàng bị chấn thương cổ tay phải tháo chuột và chỉ dùng bàn phím máy tính. Khi mở website, họ không thể mở được Dropdown Menu, không thể chọn sản phẩm và bị kẹt cứng trong một ô quảng cáo bật lên.',
    expectedKeywords: ['Keyboard Navigation', 'Tab / Shift+Tab Traversal', 'Enter and Space Activation', 'Visible Focus Indicator (:focus-visible)', 'WCAG 2.1.1 Keyboard', 'No Mouse Dependency'],
    pitfalls: [
      'Gắn sự kiện `onClick` trên thẻ `<div>` mà không gắn `tabindex="0"` và không bắt sự kiện bàn phím `onKeyDown`: Khiến người dùng bàn phím hoàn toàn không thể chạm tới phần tử này.',
      'Tắt đường viền focus bằng CSS `outline: none`: Làm người dùng bàn phím không biết con trỏ chuột ảo đang nằm ở đâu trên trang web.',
      'Sử dụng các phím tắt lạ làm xung đột với phím tắt điều hướng mặc định của hệ điều hành và Screen Reader.'
    ],
    followUpQuestions: [
      'Tiêu chuẩn WCAG 2.1.1 (Keyboard) yêu cầu gì đối với mọi chức năng tương tác trên trang web?',
      'Cách sử dụng pseudo-class `:focus-visible` để chỉ hiển thị đường viền khi người dùng điều hướng bằng bàn phím, và ẩn đi khi người dùng click bằng chuột?'
    ]
  },

  'html-046': {
    interviewerIntent: 'Kiểm tra sự hiểu biết sâu sắc về thuộc tính `tabindex`: Phân biệt chính xác giữa `tabindex="0"` (đưa vào luồng Tab tự nhiên), `tabindex="-1"` (cho phép focus bằng script nhưng loại khỏi luồng Tab) và cạm bẫy của `tabindex > 0`.',
    contextOrScenario: 'Một lập trình viên đặt `tabindex="1"`, `tabindex="2"`, `tabindex="3"` để ép trình duyệt nhảy focus theo ý mình. Kết quả là thứ tự điều hướng bàn phím bị nhảy loạn xạ khắp trang web, phá hủy hoàn toàn trải nghiệm của người dùng bàn phím.',
    expectedKeywords: ['tabindex attribute', 'tabindex="0" (Natural Tab Order)', 'tabindex="-1" (Programmatic Focus Only)', 'Positive Tabindex Anti-pattern (tabindex > 0)', 'Roving Tabindex Technique', 'Focus Order (WCAG 2.4.3)'],
    pitfalls: [
      'Sử dụng `tabindex` dương (`tabindex="1"`, `tabindex="2"`): Là một anti-pattern nghiêm trọng làm đảo lộn thứ tự Tab tự nhiên của trình duyệt, vi phạm tiêu chí WCAG 2.4.3.',
      'Đặt `tabindex="0"` trên các thẻ vốn đã có sẵn khả năng nhận focus (như `<button>`, `<a>`, `<input>`): Làm code bị dư thừa vô nghĩa.',
      'Quên rằng phần tử có `tabindex="-1"` vẫn có thể nhận focus thông qua JavaScript `element.focus()` (cực kỳ hữu ích cho Modal Dialog và Skip Links).'
    ],
    followUpQuestions: [
      'Tại sao các chuyên gia Accessibility trên thế giới khuyến nghị: "TUYỆT ĐỐI KHÔNG BAO GIỜ dùng tabindex > 0 trong bất kỳ hoàn cảnh nào"?',
      'Kỹ thuật Roving Tabindex kết hợp `tabindex="0"` trên item đang chọn và `tabindex="-1"` trên các item còn lại giúp điều hướng menu bằng phím mũi tên ra sao?'
    ]
  },

  'html-047': {
    interviewerIntent: 'Kiểm tra kiến thức về Tỷ lệ tương phản màu sắc (Color Contrast Ratio) theo tiêu chuẩn WCAG: Nắm vững các mốc tỷ lệ bắt buộc cho văn bản thông thường, văn bản cỡ lớn và các thành phần đồ họa tương tác.',
    contextOrScenario: 'Designer thiết kế một nút bấm với nền xám nhạt `#e5e5e5` và chữ trắng `#ffffff`. Khi đưa vào trang web, người dùng bình thường nhìn thấy rất mờ, còn người cận thị hoặc dùng điện thoại ngoài trời nắng gắt hoàn toàn không thể đọc được chữ trên nút.',
    expectedKeywords: ['Color Contrast Ratio', 'WCAG Level AA (4.5:1 for Normal Text)', 'WCAG Level AA (3:1 for Large Text)', 'WCAG Level AAA (7:1 / 4.5:1)', 'Non-text Contrast (3:1 for UI Components)', 'Luminance Calculation'],
    pitfalls: [
      'Cho rằng màu chữ xám trên nền trắng nhìn "tinh tế, hiện đại" mà bỏ qua tỷ lệ tương phản tối thiểu 4.5:1 bắt buộc của chuẩn WCAG AA.',
      'Chỉ kiểm tra màu ở trạng thái bình thường mà quên kiểm tra trạng thái `:hover`, `:focus`, và `:active`.',
      'Bỏ qua tỷ lệ tương phản của đường viền ô input hoặc icon chức năng (tiêu chí WCAG 1.4.11 yêu cầu tối thiểu 3:1 cho các thành phần giao diện không phải chữ).'
    ],
    followUpQuestions: [
      'Định nghĩa "Large Text" (Văn bản cỡ lớn) theo tiêu chuẩn WCAG là gì (từ 18pt/24px trở lên hoặc từ 14pt/18.66px in đậm trở lên)?',
      'Công cụ nào trong Chrome DevTools (Color Picker inspect) giúp đo đếm trực tiếp tỷ lệ tương phản và tự động gợi ý màu đạt chuẩn AA/AAA?'
    ]
  },

  'html-050': {
    interviewerIntent: 'Đánh giá kiến thức an toàn thông tin web (Web Security): Hiểu rõ lỗ hổng bảo mật nghiêm trọng "Reverse Tabnabbing" khi mở liên kết tab mới bằng `target="_blank"` và vai trò của `rel="noopener noreferrer"`.',
    contextOrScenario: 'Website cho phép người dùng đăng bài viết chứa link dẫn sang một trang web độc hại của bên thứ ba với thẻ `<a href="evil.com" target="_blank">`. Trang web độc hại sử dụng đoạn code `window.opener.location = "fake-login.com"` để bí mật đổi trang gốc thành trang đăng nhập giả mạo đánh cắp tài khoản của người dùng.',
    expectedKeywords: ['Reverse Tabnabbing Vulnerability', 'target="_blank"', 'rel="noopener"', 'rel="noreferrer"', 'window.opener Object', 'Process Isolation & Memory Leak'],
    pitfalls: [
      'Dùng `target="_blank"` mà quên khai báo `rel="noopener noreferrer"`: Tạo ra lỗ hổng bảo mật cho phép trang đích chiếm quyền điều khiển trang gốc thông qua object `window.opener`.',
      'Không biết rằng các trình duyệt hiện đại (Chrome 88+, Firefox, Safari) đã tự động ngầm gắn `rel="noopener"` cho `target="_blank"`, nhưng việc khai báo tường minh vẫn bắt buộc cho các trình duyệt cũ và WebView trong app di động.',
      'Lạm dụng việc mở tab mới cho tất cả các đường link, làm đầy bộ nhớ điện thoại và phá vỡ nút Back của trình duyệt.'
    ],
    followUpQuestions: [
      'Sự khác nhau giữa `rel="noopener"` (ngắt liên kết `window.opener` và chạy trang đích trên tiến trình riêng) và `rel="noreferrer"` (không gửi HTTP Referer Header chứa URL gốc sang trang đích) là gì?',
      'Khi nào bắt buộc phải thông báo cho người dùng biết một đường link sẽ mở sang tab mới (ví dụ: icon mũi tên chéo kèm text ẩn `(mở trong cửa sổ mới)`) theo chuẩn WCAG?'
    ]
  },

  'html-051': {
    interviewerIntent: 'Đo lường sự am hiểu thuật toán cốt lõi của Accessibility: Thuật toán Tính toán Tên Trợ năng (Accessible Name Computation Algorithm) và thứ tự ưu tiên các thuộc tính gán nhãn trong trình duyệt.',
    contextOrScenario: 'Một nút bấm có cấu trúc: `<button aria-labelledby="label1" aria-label="Label 2" title="Label 3">Label 4</button>`. Cần xác định chính xác Screen Reader sẽ đọc chuỗi văn bản nào làm tên đại diện cho nút bấm này.',
    expectedKeywords: ['Accessible Name Computation', 'Algorithm Priority Order', 'aria-labelledby (Rank 1)', 'aria-label (Rank 2)', 'Native Text Content / Alt (Rank 3)', 'title attribute (Rank 4 / Fallback)'],
    pitfalls: [
      'Nghĩ rằng text bên trong thẻ `<button>` luôn được đọc (nếu có `aria-label` hoặc `aria-labelledby`, nội dung text bên trong sẽ bị ghi đè hoàn toàn).',
      'Dùng thuộc tính `title` để đặt nhãn trợ năng (thuộc tính `title` có độ ưu tiên thấp nhất, người dùng di động không thể di chuột xem tooltip và nhiều Screen Reader mặc định bỏ qua).',
      'Tạo ra nút bấm rỗng không có bất kỳ chữ nào, không có alt và không có aria-label (Unlabeled Button error).'
    ],
    followUpQuestions: [
      'Thứ tự ưu tiên 4 cấp độ của Thuật toán tính Accessible Name là gì (`aria-labelledby` > `aria-label` > Native Content/Alt > `title`)?',
      'Làm thế nào để kiểm tra Accessible Name thực tế của một phần tử bằng bảng điều khiển "Accessibility" trong Chrome DevTools?'
    ]
  },

  'html-052': {
    interviewerIntent: 'Kiểm tra kỹ năng thiết kế Form có khả năng tiếp cận cao khi gặp lỗi (Accessible Error Handling): Kết hợp `aria-invalid`, `aria-describedby` và quản lý chuyển dịch Focus bàn phím về ô lỗi đầu tiên.',
    contextOrScenario: 'Người dùng khiếm thị điền form đăng ký gồm 10 trường và bấm nút Submit. Form có 2 trường bị lỗi (Email sai định dạng và Mật khẩu quá ngắn). Người dùng bấm Submit xong thì không nghe thấy Screen Reader đọc gì, không biết form có được gửi thành công hay chưa và lỗi ở đâu.',
    expectedKeywords: ['Accessible Form Error Handling', 'aria-invalid="true"', 'aria-describedby linking error id', 'Focus Management on First Error', 'role="alert" / aria-live', 'WCAG 3.3.1 Error Identification'],
    pitfalls: [
      'Chỉ hiển thị dòng chữ đỏ báo lỗi trên màn hình mà không gắn `aria-invalid="true"` lên ô input: Screen Reader không hề biết ô này đang bị lỗi.',
      'Thông báo lỗi có hiển thị nhưng không liên kết với input bằng `aria-describedby="errorId"`: Khi người dùng focus vào ô input, Screen Reader chỉ đọc tên nhãn mà không đọc câu báo lỗi.',
      'Submit lỗi nhưng focus vẫn nằm nguyên ở nút Submit thay vì tự động chuyển focus về ô nhập liệu bị lỗi đầu tiên kèm thông báo tổng quan.'
    ],
    followUpQuestions: [
      'Quy trình 3 bước chuẩn mực khi Form submit bị lỗi cho người dùng trợ năng là gì?',
      'Cách sử dụng khối tóm tắt lỗi (Error Summary Box có `role="alert"` và `tabindex="-1"`) ở đầu form theo chuẩn GOV.UK Design System?'
    ]
  },

  'html-053': {
    interviewerIntent: 'Đánh giá việc xử lý các nội dung thay đổi động trong trang (Dynamic Content Updates): Sử dụng các vùng phát âm trực tiếp (ARIA Live Regions: `aria-live="polite"` vs `aria-live="assertive"`) cho Toast Notification, Kết quả tìm kiếm và Badge giỏ hàng.',
    contextOrScenario: 'Người dùng bấm nút "Thêm vào giỏ hàng". Một Toast thông báo màu xanh "Đã thêm sản phẩm thành công" hiện ra ở góc phải màn hình trong 3 giây rồi biến mất. Người dùng khiếm thị không hề nhìn thấy Toast này và băn khoăn không biết nút bấm có hoạt động hay không.',
    expectedKeywords: ['ARIA Live Regions', 'aria-live="polite"', 'aria-live="assertive"', 'role="alert"', 'role="status"', 'aria-atomic="true"'],
    pitfalls: [
      'Lạm dụng `aria-live="assertive"` hoặc `role="alert"` cho mọi thông báo thông thường: Trình duyệt sẽ ngắt lời ngay lập tức nội dung Screen Reader đang đọc dở, gây ức chế cho người dùng.',
      'Tạo thẻ chứa có `aria-live` động bằng JavaScript ngay lúc thông báo xuất hiện (chuẩn mực là thẻ chứa `aria-live` phải có sẵn trong DOM từ trước, sau đó chỉ chèn nội dung text vào trong).',
      'Không dùng `aria-atomic="true"` khi cần Screen Reader đọc toàn bộ câu thông báo mới thay vì chỉ đọc mẩu chữ vừa thay đổi.'
    ],
    followUpQuestions: [
      'Sự khác biệt căn bản giữa `aria-live="polite"` (chờ người dùng nhàn rỗi mới đọc) và `aria-live="assertive"` (ngắt lời ngay lập tức để cảnh báo khẩn cấp) là gì?',
      'Tại sao việc cập nhật số lượng badge giỏ hàng từ 2 lên 3 nên dùng `aria-live="polite"` kết hợp `aria-atomic="true"`?'
    ]
  },

  'html-054': {
    interviewerIntent: 'Kiểm tra kỹ năng quản lý Focus trong Modal Dialog (Modal Focus Management): Nắm vững 3 nguyên tắc sống còn (Lưu vết phần tử kích hoạt, Khóa focus bên trong modal - Focus Trap, và Trả lại focus khi đóng).',
    contextOrScenario: 'Người dùng bấm nút "Mở giỏ hàng" để bật Modal Popup. Người dùng dùng phím Tab để điều hướng các nút trong modal, nhưng khi Tab đến nút cuối cùng thì focus lại nhảy tọt ra các đường link của trang web nằm phía sau Modal đang bị che mờ. Khi bấm Escape đóng modal, focus bị mất sạch và nhảy về đầu trang `<body>`.',
    expectedKeywords: ['Modal Focus Management', 'Focus Trap (Keyboard Trapping)', 'Trigger Element Restoration', 'Initial Focus Placement', 'Escape Key Listener', 'HTML5 <dialog> element'],
    pitfalls: [
      'Không giam giữ focus (Focus Trap) bên trong Modal, để người dùng bàn phím Tab ra ngoài vùng nội dung đang bị che mờ (Inert Background).',
      'Khi đóng Modal, không trả lại focus cho chính nút bấm đã mở Modal đó (`triggerElement.focus()`), khiến người dùng bị mất dấu vị trí đang đọc trên trang web.',
      'Tự viết hàng chục dòng JavaScript xử lý Modal phức tạp trong khi thẻ native `<dialog>` của HTML5 đã tích hợp sẵn Modal Focus Trap và phím Escape mặc định.'
    ],
    followUpQuestions: [
      'Thẻ `<dialog>` native trong HTML5 với phương thức `dialogElement.showModal()` tự động giải quyết bài toán Focus Trap, Top Layer và phím Escape như thế nào?',
      'Thuộc tính HTML mới `inert` giúp vô hiệu hóa toàn bộ tương tác và trợ năng của các phần tử nền phía sau Modal ra sao?'
    ]
  },

  'html-055': {
    interviewerIntent: 'Đánh giá kỹ năng xây dựng các linh kiện giao diện phức tạp bằng tay (Custom Interactive Components): Hiểu rõ mẫu thiết kế WAI-ARIA Menu/Combobox, điều hướng phím mũi tên và giải thuật Roving Tabindex.',
    contextOrScenario: 'Tự viết một Dropdown Menu tùy chỉnh bằng React/Vue: Thay vì bắt người dùng phải bấm phím Tab 20 lần để đi qua 20 mục trong menu, người dùng chỉ cần bấm phím Tab 1 lần để vào menu, sau đó dùng các phím Mũi tên Lên/Xuống để duyệt danh sách, phím Home/End để nhảy đầu/cuối, và Escape để đóng menu.',
    expectedKeywords: ['Roving Tabindex Pattern', 'WAI-ARIA Menu Design Pattern', 'Arrow Keys Navigation (Up/Down)', 'aria-activedescendant Alternative', 'Home and End Key Support', 'Menu Open/Close State (aria-expanded)'],
    pitfalls: [
      'Bắt người dùng phải dùng phím Tab để duyệt từng item trong Menu (vi phạm chuẩn thiết kế WAI-ARIA Menu Pattern — phím Tab chỉ dùng để thoát ra ngoài menu, phím Mũi tên mới dùng để duyệt các item bên trong).',
      'Không hỗ trợ phím Home (nhảy về mục đầu tiên) và End (nhảy về mục cuối cùng).',
      'Không đồng bộ thuộc tính `aria-expanded="true/false"` và `aria-haspopup="menu"` trên nút kích hoạt dropdown.'
    ],
    followUpQuestions: [
      'Giải thuật Roving Tabindex hoạt động như thế nào: Duy trì `tabindex="0"` trên item đang được chọn/focus và gán `tabindex="-1"` cho tất cả các items còn lại?',
      'Sự khác nhau giữa kỹ thuật Roving Tabindex và kỹ thuật dùng `aria-activedescendant` kết hợp với ID của item là gì?'
    ]
  },

  'html-056': {
    interviewerIntent: 'Kiểm tra việc áp dụng đúng đắn tiêu chuẩn Tiếp cận cho người dùng nhạy cảm với chuyển động: Hiểu rõ khi nào nên giảm chuyển động và tránh hiểu lầm cực đoan "tắt sạch mọi animation".',
    contextOrScenario: 'Một ứng dụng nhận được yêu cầu hỗ trợ `prefers-reduced-motion`. Một lập trình viên viết code tắt sạch toàn bộ transition trên website, khiến các nút bấm khi click không có bất kỳ phản hồi thị giác nào, giao diện đơ cứng như một trang giấy chết.',
    expectedKeywords: ['prefers-reduced-motion: reduce', 'Non-essential vs Essential Motion', 'Replacing Motion with Opacity Fade', 'Vestibular Disorder Safety', 'Feedback Preservation', 'Micro-interactions Retainment'],
    pitfalls: [
      'Tắt sạch mọi hiệu ứng phản hồi thị giác (Feedback): Người dùng cần biết nút vừa được bấm, checkbox vừa được tick (nên thay thế chuyển động trượt/phóng to bằng hiệu ứng mờ dần nhẹ nhàng `fade`).',
      'Chỉ xử lý trong CSS mà quên tắt các hiệu ứng chuyển động do thư viện JavaScript (GSAP, Framer Motion) điều khiển.',
      'Bỏ qua các hiệu ứng tự động phát (Auto-playing Carousels/Videos) có chuyển động mạnh.'
    ],
    followUpQuestions: [
      'Sự khác biệt giữa Essential Motion (chuyển động thiết yếu: thanh loading tiến độ, cử chỉ kéo thả) và Non-Essential Motion (chuyển động trang trí: parallax, nảy bóng)?',
      'Cách sử dụng `window.matchMedia("(prefers-reduced-motion: reduce)").matches` trong JavaScript để điều chỉnh tốc độ chuyển động trong thư viện UI?'
    ]
  },

  'html-057': {
    interviewerIntent: 'Đo lường năng lực thiết lập quy trình kiểm thử và đánh giá Tiếp cận toàn diện (Accessibility Auditing Methodology): Kết hợp công cụ quét tự động (Automated Tools) và kiểm thử thủ công chuyên sâu (Manual Testing).',
    contextOrScenario: 'Trước khi phát hành một cổng thông tin y tế công cộng ra thị trường, Trưởng nhóm yêu cầu kỹ sư thực hiện một đợt Audit Accessibility toàn diện và lập báo cáo khắc phục lỗi.',
    expectedKeywords: ['Accessibility Audit Workflow', 'Automated Testing (Axe-core, Lighthouse, WAVE)', 'Manual Keyboard Testing (No-mouse drill)', 'Screen Reader Testing (VoiceOver, NVDA)', 'Zoom & Reflow Testing (400%)', 'Accessibility Linters (eslint-plugin-jsx-a11y)'],
    pitfalls: [
      'Chỉ dựa vào điểm số của Google Lighthouse: Tin rằng đạt 100 điểm Lighthouse là trang web đã hoàn hảo (công cụ tự động bỏ sót các lỗi ngữ cảnh như alt text vô nghĩa, thứ tự đọc sai lệch, logic focus trap).',
      'Không bao giờ tự tay tắt chuột để thử hoàn thành một giao dịch mua hàng chỉ bằng bàn phím máy tính.',
      'Không kiểm thử với ít nhất một phần mềm đọc màn hình thực tế (VoiceOver trên Mac/iOS hoặc NVDA trên Windows).'
    ],
    followUpQuestions: [
      'Quy trình 4 bước chuẩn mực của một buổi Audit Accessibility chuyên nghiệp gồm những giai đoạn nào?',
      'Cách tích hợp công cụ kiểm thử tự động Axe-core vào quy trình CI/CD pipeline (như Playwright / Cypress a11y tests) để chặn đứng lỗi tiếp cận trước khi merge code?'
    ]
  },

  'html-058': {
    interviewerIntent: 'Đánh giá kiến thức về Tiêu chí WCAG 1.4.10 (Reflow): Yêu cầu nội dung trang web khi phóng to lên 400% (trên màn hình 1280px tương đương 320px) phải tự dồn thành 1 cột và TUYỆT ĐỐI KHÔNG xuất hiện thanh cuộn ngang.',
    contextOrScenario: 'Người dùng có thị lực kém phóng to kích thước trình duyệt lên 400% để đọc chữ. Website bị vỡ layout, các cột chữ bị chồng lấn lên nhau và người dùng phải cuộn chuột ngang qua lại liên tục sau mỗi dòng chữ để đọc hết một đoạn văn.',
    expectedKeywords: ['WCAG 1.4.10 (Reflow)', '400% Browser Zoom Test', '320 CSS Pixels Equivalent', 'Two-Dimensional Scrolling Prohibition', 'WCAG 1.4.4 (Resize Text)', 'WCAG 1.4.12 (Text Spacing)'],
    pitfalls: [
      'Để xuất hiện thanh cuộn ngang (Horizontal Scrollbar) khi phóng to 400%: Bắt người dùng phải cuộn cả 2 chiều để đọc văn bản thông thường là vi phạm nghiêm trọng chuẩn WCAG AA.',
      'Sử dụng các đơn vị pixel cứng cho layout containers khiến trang web không thể co về độ rộng tương đương 320px.',
      'Chặn tính năng zoom của người dùng bằng thẻ meta `<meta name="viewport" content="user-scalable=no, maximum-scale=1.0">` (anti-pattern bị cấm hoàn toàn).'
    ],
    followUpQuestions: [
      'Những thành phần ngoại lệ duy nhất nào được phép xuất hiện thanh cuộn ngang khi phóng to 400% theo quy định của WCAG 1.4.10 (ví dụ: bảng dữ liệu lớn, bản đồ, biểu đồ đồ thị, trình soạn thảo code)?',
      'Tiêu chuẩn WCAG 1.4.12 (Text Spacing) yêu cầu giao diện phải chịu đựng được việc người dùng tự tăng khoảng cách dòng lên 1.5 lần và khoảng cách từ lên 0.16 lần ra sao?'
    ]
  },

  'html-059': {
    interviewerIntent: 'Kiểm tra nhận thức về Tiêu chí WCAG 2.1.2 (No Keyboard Trap) và 2.4.3 (Focus Order): Đảm bảo người dùng bàn phím không bao giờ bị bẫy kẹt vĩnh viễn trong một phần tử và thứ tự Tab phải logic theo thị giác.',
    contextOrScenario: 'Người dùng dùng phím Tab di chuyển vào một trình phát video nhúng hoặc một Widget chat tư vấn ở góc màn hình. Khi muốn Tab tiếp để ra khỏi widget, phím Tab bị nuốt trọn bên trong widget và người dùng không có cách nào thoát ra ngoài được nữa ngoại trừ việc phải tải lại trang.',
    expectedKeywords: ['Keyboard Trap (WCAG 2.1.2)', 'Focus Order (WCAG 2.4.3)', 'Escape Key Exit Hatch', 'Embedded Third-Party Widgets', 'Logical Reading Sequence', 'CSS Grid/Flex Order Pitfalls'],
    pitfalls: [
      'Tạo ra một Bẫy bàn phím (Keyboard Trap) mà không có phím tắt thoát ra rõ ràng (chuẩn mực là phím Escape phải luôn đưa người dùng thoát khỏi widget).',
      'Dùng thuộc tính CSS `order` trong Flexbox/Grid để thay đổi vị trí hiển thị: Khiến thứ tự nhìn bằng mắt đi một đằng nhưng thứ tự phím Tab lại nhảy một nẻo, vi phạm tiêu chí 2.4.3.',
      'Sử dụng `display: none` sai cách làm focus bị rơi vào vùng vô hình.'
    ],
    followUpQuestions: [
      'Tại sao thuộc tính CSS `order` trong Flexbox và CSS Grid bị coi là nguy cơ hàng đầu gây vi phạm tiêu chí WCAG 2.4.3 (Focus Order)?',
      'Làm thế nào để nhúng iframe của bên thứ ba an toàn mà không sợ widget đó tạo ra Keyboard Trap cho website của bạn?'
    ]
  },

  'html-060': {
    interviewerIntent: 'Đánh giá việc tuân thủ Tiêu chí WCAG 1.3.1 (Info and Relationships): Đảm bảo các cấu trúc và mối quan hệ trực quan (như bảng dữ liệu, nhóm lựa chọn, tiêu đề) đều được mô hình hóa chính xác trong cây Accessibility Tree.',
    contextOrScenario: 'Một bảng báo giá phức tạp được dựng bằng các thẻ `<div>` kết hợp CSS Grid. Người mắt sáng nhìn thấy rõ hàng và cột, nhưng người khiếm thị dùng Screen Reader không thể biết ô số tiền $50 nằm ở hàng "Gói VIP" hay "Gói Cơ bản" và thuộc cột "Hàng tháng" hay "Hàng năm".',
    expectedKeywords: ['WCAG 1.3.1 (Info and Relationships)', 'Semantic Table Markup (<table>, <th>, <tr>, <td>)', 'scope="col" and scope="row"', 'Form Grouping (<fieldset>, <legend>)', 'Accessibility Tree Relationships', 'Visual vs Semantic Equivalence'],
    pitfalls: [
      'Dựng bảng dữ liệu dạng lưới bằng `<div>` mà không có các ARIA Roles bảng tương đương (`role="table"`, `role="row"`, `role="cell"`): Làm mất hoàn toàn tính năng điều hướng bảng của Screen Reader.',
      'Quên thuộc tính `scope="col"` hoặc `scope="row"` trên các thẻ tiêu đề `<th>`: Screen Reader không thể tự động đọc tên cột tương ứng khi người dùng duyệt qua từng ô dữ liệu.',
      'Dùng màu sắc hoặc kiểu chữ in đậm đơn thuần để tạo nhóm form mà không dùng thẻ ngữ nghĩa `<fieldset>`.'
    ],
    followUpQuestions: [
      'Thuộc tính `scope="col"` và `scope="row"` hỗ trợ người dùng Screen Reader tra cứu dữ liệu trong bảng lớn đa chiều như thế nào?',
      'Tại sao việc bọc danh sách các mục trong thẻ `<ul>`/`<ol>` giúp Screen Reader thông báo cho người nghe biết trước "Danh sách gồm 5 mục"?'
    ]
  },

  'html-061': {
    interviewerIntent: 'Kiểm tra nhận thức về Tiêu chí WCAG 3.2.1 (On Focus) và 3.2.2 (On Input): Ngăn chặn việc tự động thay đổi ngữ cảnh (Context Change: tự động submit form, tự động mở popup, tự động chuyển trang) khi người dùng mới chỉ focus hoặc vừa chọn một giá trị.',
    contextOrScenario: 'Một trang web có dropdown chọn ngôn ngữ hoặc danh mục sản phẩm: `<select onchange="this.form.submit()">`. Ngay khi người dùng bàn phím dùng phím mũi tên lướt qua để xem các tùy chọn, trang web lập tức tự động reload và submit form, khiến người dùng không thể chọn được mục họ mong muốn.',
    expectedKeywords: ['WCAG 3.2.1 (On Focus)', 'WCAG 3.2.2 (On Input)', 'Unexpected Context Change', 'Form Auto-Submission Anti-Pattern', 'Predictable User Interfaces', 'Explicit Submit Button Requirement'],
    pitfalls: [
      'Gắn sự kiện tự động submit form hoặc chuyển trang ngay khi người dùng chọn một mục trong thẻ `<select>` (`onchange="location.href=..."`): Vi phạm trực tiếp tiêu chí WCAG 3.2.2.',
      'Mở một cửa sổ mới hoặc modal popup ngay khi người dùng mới chỉ Tab focus vào một ô nhập liệu (vi phạm tiêu chí 3.2.1 On Focus).',
      'Tự động nhảy focus sang ô tiếp theo khi người dùng gõ đủ số ký tự mà không có thông báo trước.'
    ],
    followUpQuestions: [
      'Giải pháp chuẩn mực để tuân thủ WCAG: Luôn luôn có một nút bấm kích hoạt rõ ràng (như nút "Đi đến" hoặc "Áp dụng") bên cạnh thẻ `<select>` thay vì tự động submit hoạt động ra sao?',
      'Những hành vi nào được xem là "Thay đổi ngữ cảnh" (Context Change) theo định nghĩa của W3C (mở tab mới, submit form, cuộn trang lớn, thay đổi đáng kể nội dung)?'
    ]
  },

  'html-062': {
    interviewerIntent: 'Kiểm tra kiến thức về Quản lý lịch sử trình duyệt phía Client (Browser History API): Sử dụng `history.pushState()`, `history.replaceState()` và sự kiện `popstate` để xây dựng hệ thống điều hướng SPA mượt mà không tải lại trang.',
    contextOrScenario: 'Xây dựng một Single Page Application (SPA) với React/Vue/Next.js: Khi người dùng bấm chuyển tab hoặc mở bộ lọc sản phẩm, URL trên thanh địa chỉ phải đổi theo để có thể copy gửi link cho bạn bè, và khi người dùng bấm nút Back của trình duyệt thì phải quay lại đúng trạng thái trước đó.',
    expectedKeywords: ['HTML5 History API', 'history.pushState()', 'history.replaceState()', 'popstate Event', 'Client-Side Routing', 'Deep Linking & Shareable URLs'],
    pitfalls: [
      'Dùng `pushState()` cho các thay đổi nhỏ liên tục (như gõ từng phím tìm kiếm): Khiến lịch sử trình duyệt bị rác hàng trăm URL, người dùng phải bấm nút Back mỏi tay mới quay lại được trang trước (trường hợp này nên dùng `replaceState()`).',
      'Quên rằng sự kiện `window.onpopstate` CHỈ được kích hoạt khi người dùng bấm nút Back/Forward của trình duyệt (không tự kích hoạt khi gọi `pushState` bằng code).',
      'Cấu hình server backend không hỗ trợ Fallback Route (khi người dùng F5 tại URL mới thì server trả về lỗi 404 Not Found).'
    ],
    followUpQuestions: [
      'Sự khác biệt then chốt giữa `history.pushState(state, title, url)` (thêm trang mới vào lịch sử) và `history.replaceState(state, title, url)` (ghi đè URL hiện tại)?',
      'Navigation API mới trong trình duyệt hiện đại (được thiết kế để thay thế History API cổ điển) giải quyết các nhược điểm của History API như thế nào?'
    ]
  },

  'html-063': {
    interviewerIntent: 'Đo lường năng lực phân biệt giao thức truyền thông mạng: So sánh sự khác nhau căn bản giữa HTTP/HTTPS (Mô hình Request-Response một chiều, Half-Duplex, Stateless) và WebSocket (Kết nối 2 chiều liên tục, Full-Duplex, Stateful).',
    contextOrScenario: 'Cần lựa chọn giao thức cho 2 bài toán: (1) Trang blog tin tức đọc báo thông thường; (2) Ứng dụng giao dịch chứng khoán trực tuyến cập nhật bảng giá nhảy số liên tục từng mili-giây và chat room tài chính.',
    expectedKeywords: ['HTTP vs WebSocket', 'Full-Duplex vs Request-Response', 'TCP Persistent Connection', 'Handshake Upgrade (HTTP 101 Switching Protocols)', 'Header Overhead Elimination', 'Connection State & Heartbeat (Ping/Pong)'],
    pitfalls: [
      'Dùng cơ chế HTTP Short-Polling (gửi request mỗi giây) cho ứng dụng thời gian thực: Gây lãng phí băng thông mạng khổng lồ vì mỗi request đều phải gửi kèm hàng trăm bytes HTTP Headers.',
      'Sử dụng WebSocket cho các API CRUD thông thường: Gây lãng phí bộ nhớ máy chủ do phải duy trì kết nối socket liên tục và mất khả năng Caching của CDN.',
      'Không thiết lập cơ chế Ping/Pong Heartbeat để phát hiện và dọn dẹp các kết nối WebSocket bị đứt ngầm (Zombie Connections).'
    ],
    followUpQuestions: [
      'Quy trình WebSocket Handshake: Giao thức HTTP nâng cấp kết nối lên WebSocket thông qua Header `Upgrade: websocket` và mã HTTP 101 ra sao?',
      'Server-Sent Events (SSE) khác gì so với WebSocket và tại sao SSE lại là sự lựa chọn số 1 cho các ứng dụng stream AI chatbot (như ChatGPT)?'
    ]
  },

  'html-064': {
    interviewerIntent: 'Kiểm tra kỹ năng tối ưu hóa hiệu năng giao diện hiện đại: Nắm vững Intersection Observer API để thay thế cho các hàm lắng nghe sự kiện `scroll` nặng nề trong bài toán Lazy Loading hình ảnh và Infinite Scroll.',
    contextOrScenario: 'Một trang web thương mại điện tử hiển thị danh sách 500 sản phẩm. Cần trì hoãn việc tải ảnh cho đến khi ảnh sắp cuộn tới màn hình (Lazy Load Images) và tự động gọi API lấy thêm sản phẩm khi cuộn tới cuối trang.',
    expectedKeywords: ['Intersection Observer API', 'Asynchronous Viewport Detection', 'rootMargin & threshold', 'Eliminating Scroll Event Listeners', 'Off Main-Thread Computation', 'Lazy Loading & Infinite Scroll'],
    pitfalls: [
      'Vẫn dùng kỹ thuật cũ: Lắng nghe sự kiện `window.addEventListener("scroll", ...)` kết hợp gọi `getBoundingClientRect()` (gây hiện tượng Layout Thrashing đơ giật giao diện).',
      'Quên gọi `observer.unobserve(entry.target)` sau khi ảnh đã được tải xong: Làm trình duyệt tiếp tục theo dõi phần tử thừa thãi, gây rò rỉ bộ nhớ.',
      'Đặt `threshold: 1.0` cho một phần tử có chiều cao lớn hơn màn hình: Khiến callback không bao giờ được kích hoạt vì phần tử đó không thể hiển thị 100% cùng lúc trong viewport.'
    ],
    followUpQuestions: [
      'Thuộc tính `rootMargin: "200px 0px"` giúp bắt đầu tải ảnh trước khi người dùng thực sự cuộn tới 200px để tạo trải nghiệm mượt mà ra sao?',
      'So sánh thuộc tính HTML native `<img loading="lazy">` với việc tự viết Intersection Observer: Khi nào vẫn cần Intersection Observer?'
    ]
  },

  'html-065': {
    interviewerIntent: 'Đánh giá kiến thức về bộ tiêu chuẩn Web Components của W3C: Nắm vững 3 trụ cột công nghệ nền tảng (Custom Elements, Shadow DOM, và HTML Templates) để xây dựng UI components chạy độc lập không phụ thuộc framework.',
    contextOrScenario: 'Doanh nghiệp muốn xây dựng một bộ Design System dùng chung cho toàn bộ tập đoàn, trong đó có team dùng React, team dùng Vue, team dùng Angular và team dùng HTML thuần. Web Components được chọn để đảm bảo code một lần chạy được trên mọi framework.',
    expectedKeywords: ['Web Components Standard', 'Custom Elements (customElements.define)', 'Shadow DOM (Encapsulation)', '<template> and <slot> elements', 'Framework-Agnostic Components', 'CSS :host and ::slotted Selectors'],
    pitfalls: [
      'Đặt tên Custom Element không có dấu gạch ngang (ví dụ: đặt `<mybutton>` thay vì `<my-button>`): W3C bắt buộc tên custom tag phải có ít nhất một dấu gạch nối `-` để tránh xung đột với các thẻ HTML tương lai.',
      'Nghĩ rằng Shadow DOM chống được rò rỉ biến CSS: Biến CSS Custom Properties (`--my-color`) VẪN CÓ THỂ xuyên qua ranh giới Shadow DOM bình thường (đây là tính năng cố ý để hỗ trợ theming).',
      'Không xử lý các thuộc tính quan sát thay đổi trong Custom Elements (`observedAttributes` và `attributeChangedCallback`).'
    ],
    followUpQuestions: [
      'Sự khác nhau giữa Shadow DOM chế độ `mode: "open"` và `mode: "closed"` là gì?',
      'Thẻ `<slot>` hoạt động như thế nào để truyền nội dung từ Light DOM vào bên trong Shadow DOM của Web Component?'
    ]
  },

  'html-066': {
    interviewerIntent: 'Kiểm tra việc khai thác toàn diện các tính năng của thẻ tải tệp tin `<input type="file">`: Giới hạn định dạng file (`accept`), chọn nhiều file (`multiple`), kích hoạt camera di động trực tiếp (`capture`) và xử lý FileList object.',
    contextOrScenario: 'Cần làm tính năng chụp ảnh căn cước công dân trên điện thoại di động: Khi người dùng bấm nút tải ảnh, ứng dụng phải tự động mở thẳng Camera của điện thoại (chụp ngay) thay vì mở thư viện ảnh có sẵn.',
    expectedKeywords: ['<input type="file">', 'accept attribute (MIME types)', 'capture attribute (user / environment)', 'multiple attribute', 'FileList & File Object', 'Client-side Validation (Size & Type)'],
    pitfalls: [
      'Tin tưởng hoàn toàn vào thuộc tính `accept=".jpg,.png"`: Người dùng vẫn có thể chọn tùy chọn "All Files" trên hệ điều hành để tải lên file đuôi khác hoặc đổi đuôi file mã độc.',
      'Không kiểm tra dung lượng file (`file.size`) ở phía Client trước khi upload, khiến người dùng gửi file 100MB lên server rồi mới nhận thông báo lỗi.',
      'Không biết thuộc tính `capture="environment"`: Cho phép mở trực tiếp Camera sau của điện thoại thông minh để chụp tài liệu.'
    ],
    followUpQuestions: [
      'Thuộc tính `capture="user"` (Camera trước) và `capture="environment"` (Camera sau) hoạt động trên trình duyệt di động như thế nào?',
      'Cách sử dụng URL API `URL.createObjectURL(file)` để hiển thị ảnh xem trước (Image Preview) tức thì mà không cần nạp toàn bộ file vào RAM bằng FileReader?'
    ]
  },

  'html-067': {
    interviewerIntent: 'Đánh giá kỹ năng xây dựng hệ thống kiểm thực biểu mẫu tùy chỉnh (Custom Form Validation Architecture): Kết hợp Constraint Validation API với UI/UX thân thiện, không làm gián đoạn người dùng khi đang gõ.',
    contextOrScenario: 'Xây dựng một Form nhập liệu phức tạp: Không muốn sử dụng các bong bóng thông báo lỗi mặc định xấu xí của trình duyệt, mà muốn hiển thị thông báo lỗi tùy biến mượt mà ngay dưới ô input theo Design System.',
    expectedKeywords: ['Custom Form Validation', 'novalidate attribute on <form>', 'input.setCustomValidity()', 'Real-time vs Blur Validation', 'aria-describedby linking error', ':user-invalid CSS pseudo-class'],
    pitfalls: [
      'Báo lỗi quá vội vã (Eager Validation - báo lỗi ngay khi người dùng mới gõ ký tự đầu tiên): Tạo cảm giác ức chế và làm gián đoạn dòng suy nghĩ của khách hàng.',
      'Chỉ báo lỗi khi bấm Submit (quá muộn): Người dùng phải cuộn lên cuộn xuống để tìm ô bị lỗi.',
      'Gắn thuộc tính `novalidate` trên form để tắt bong bóng mặc định của trình duyệt nhưng lại quên tự viết logic kiểm tra và gán nhãn tiếp cận ARIA cho thông báo lỗi mới.'
    ],
    followUpQuestions: [
      'Chiến thuật kiểm thực chuẩn UX "Reward early, punish late" (Báo lỗi khi rời ô `blur`, xóa lỗi ngay khi người dùng gõ ký tự sửa đúng `input`) vận hành ra sao?',
      'Pseudo-class CSS mới `:user-invalid` giải quyết triệt để bài toán hiển thị lỗi form mà không cần viết JavaScript như thế nào?'
    ]
  },

  'html-068': {
    interviewerIntent: 'Kiểm tra kỹ năng tối ưu hóa trải nghiệm điền biểu mẫu trên thiết bị di động (Mobile Form Optimization): Kết hợp `inputmode`, `autocomplete`, kích thước touch target và ngăn chặn tự động zoom phiền toái.',
    contextOrScenario: 'Người dùng thanh toán đơn hàng trên điện thoại di động: Mỗi lần chạm vào ô input, màn hình bị tự động phóng to giật cục (Auto-zoom), bàn phím chữ hiện lên che mất nút bấm, và các nút bấm quá nhỏ bấm nhầm liên tục.',
    expectedKeywords: ['Mobile Form UX Optimization', 'inputmode attribute', '16px Font Size Rule (Preventing iOS Zoom)', 'Touch Target Size (48x48px)', 'autocomplete Attributes', 'Keyboard-Aware Viewport (interactive-widget)'],
    pitfalls: [
      'Đặt `font-size` của input nhỏ hơn 16px trên iOS Safari: Khiến trình duyệt tự động zoom màn hình lên mỗi khi người dùng chạm vào ô input, làm vỡ bố cục giao diện.',
      'Không dùng `inputmode="numeric"` cho các ô nhập số (OTP, thẻ tín dụng, tiền tệ), khiến người dùng phải mất thêm thao tác bấm đổi bàn phím.',
      'Bàn phím ảo hiện lên che khuất nút bấm Submit ở cuối trang mà không xử lý cuộn tự động (`scrollIntoView({ behavior: "smooth" })`).'
    ],
    followUpQuestions: [
      'Tại sao việc đặt `font-size: 16px` cho thẻ `<input>` trên thiết bị di động là quy tắc vàng để ngăn chặn iOS Safari tự động phóng to màn hình?',
      'Thẻ meta viewport mới `<meta name="viewport" content="width=device-width, initial-scale=1.0, interactive-widget=resizes-content">` giúp xử lý bàn phím ảo đẩy giao diện lên như thế nào?'
    ]
  },

  'html-069': {
    interviewerIntent: 'Kiểm tra sự thông thạo các cấp độ của ARIA Live Regions: Biết chính xác khi nào nên chọn `aria-live="off"`, `polite`, hay `assertive` để truyền đạt thông tin động mà không gây rối loạn âm thanh.',
    contextOrScenario: 'Một ứng dụng trực tiếp bóng đá: Tỉ số trận đấu cập nhật từng phút, danh sách bình luận mới nhảy liên tục, và có thông báo khẩn cấp khi có bàn thắng được ghi. Cần cấu hình ARIA Live chuẩn xác cho từng thành phần.',
    expectedKeywords: ['aria-live Levels', 'aria-live="polite"', 'aria-live="assertive"', 'aria-live="off"', 'Live Region Pre-existence in DOM', 'Screen Reader Queue Management'],
    pitfalls: [
      'Dùng `assertive` cho các thông tin cập nhật liên tục (như dòng thời gian bình luận hay ticker giá cổ phiếu): Khiến Screen Reader nói liên tục không ngừng nghỉ, người dùng không thể điều hướng các phần khác của trang.',
      'Tạo mới cả thẻ `<div aria-live="polite">` kèm nội dung vào DOM cùng lúc (nhiều Screen Reader sẽ bỏ qua thông báo này vì nó chỉ lắng nghe sự thay đổi của một vùng Live Region đã tồn tại sẵn từ trước).',
      'Quên thuộc tính `aria-busy="true"` trong lúc đang nạp dữ liệu dở dang để tránh Screen Reader đọc các mảnh thông tin chưa hoàn chỉnh.'
    ],
    followUpQuestions: [
      'Tại sao thuộc tính `aria-live` phải được khai báo trên một thẻ HTML tĩnh rỗng sẵn có trong DOM trước khi chèn nội dung động vào bên trong?',
      'Sự khác nhau giữa `role="status"` (ngầm định `aria-live="polite"`) và `role="alert"` (ngầm định `aria-live="assertive"`) trong WAI-ARIA là gì?'
    ]
  },

  'html-070': {
    interviewerIntent: 'Đánh giá nhận thức về Tiêu chí WCAG 2.4.1 (Bypass Blocks): Kỹ thuật triển khai nút bấm "Bỏ qua nội dung điều hướng" (Skip Links) giúp người dùng bàn phím không phải Tab qua hàng trăm menu lặp lại trên mỗi trang web.',
    contextOrScenario: 'Website có thanh Menu Header khổng lồ gồm 50 danh mục con. Mỗi lần người dùng bàn phím bấm sang trang mới, họ phải bấm phím Tab 50 lần liên tục chỉ để vượt qua thanh Menu để bắt đầu đọc nội dung bài viết chính.',
    expectedKeywords: ['Skip Links (Bypass Blocks)', 'WCAG 2.4.1 Bypass Blocks', 'Skip to Main Content', 'Hidden until Focused CSS Pattern', 'First Focusable Element in DOM', 'Targeting <main id="main-content">'],
    pitfalls: [
      'Dùng `display: none` để ẩn Skip Link: Khiến Skip Link bị loại bỏ hoàn toàn khỏi luồng Tab bàn phím, người dùng không thể kích hoạt được.',
      'Đặt Skip Link nằm ở giữa hoặc cuối trang HTML thay vì là phần tử focusable ĐẦU TIÊN của thẻ `<body>`.',
      'Đường link trỏ đến một ID không tồn tại hoặc thẻ đích không thể nhận focus (thiếu `tabindex="-1"` trên thẻ `<main>`).'
    ],
    followUpQuestions: [
      'Kỹ thuật CSS chuẩn để giấu Skip Link ra ngoài màn hình (`position: absolute; left: -9999px;`) và chỉ hiện lên rõ ràng khi được focus (`:focus { left: 0; }`) được viết ra sao?',
      'Tại sao thẻ `<main id="main-content">` cần được gắn thêm thuộc tính `tabindex="-1"` khi làm đích đến cho Skip Link trên một số trình duyệt cũ?'
    ]
  },

  'html-071': {
    interviewerIntent: 'Đo lường năng lực quản lý Focus trong ứng dụng Single Page Application (SPA Focus Management): Giải quyết bài toán mất dấu vị trí của người dùng trợ năng khi chuyển trang mà không tải lại toàn bộ tài liệu.',
    contextOrScenario: 'Trong một ứng dụng React/Next.js: Người dùng bấm vào liên kết chuyển từ Trang chủ sang Trang Giỏ hàng. Mặc dù URL đã đổi và nội dung trang đã thay đổi, nhưng con trỏ focus của bàn phím và Screen Reader vẫn nằm nguyên ở đáy trang hoặc bị lơ lửng, người khiếm thị không biết trang mới đã tải xong hay chưa.',
    expectedKeywords: ['SPA Focus Management', 'Route Change Accessibility', 'Announcing Page Titles', 'Focusing Primary Heading (<h1>)', 'Accessible Route Announcement', 'Document.title Updates'],
    pitfalls: [
      'Bỏ mặc Focus sau khi chuyển route trong SPA, khiến focus bị kẹt ở phần tử bị xóa sổ khỏi DOM và nhảy về đầu thẻ `<body>` một cách bất ngờ.',
      'Quên cập nhật thẻ `document.title` khi chuyển trang (Screen Reader dựa vào title của trang để thông báo cho người dùng biết họ đã đến trang mới).',
      'Tự động chuyển focus về một vùng tử vô nghĩa thay vì chuyển về thẻ `<h1>` tiêu đề của trang mới hoặc Skip Link.'
    ],
    followUpQuestions: [
      'Quy trình 3 bước chuẩn mực của một Router SPA có khả năng tiếp cận cao (Accessible Client-Side Router) khi xảy ra sự kiện chuyển trang là gì?',
      'Cách sử dụng một vùng `aria-live="polite"` ẩn để tự động đọc thông báo "Đã chuyển sang trang Giỏ hàng" sau mỗi lần chuyển route?'
    ]
  },

  'html-072': {
    interviewerIntent: 'Kiểm tra sự thấu hiểu về Hệ thống phân cấp tiêu đề (Heading Hierarchy): Nắm vững tiêu chí WCAG 1.3.1 và 2.4.6, vai trò của Heading trong việc tạo bản đồ mục lục (Document Outline) cho công cụ tìm kiếm và Screen Reader.',
    contextOrScenario: 'Một trang web sử dụng thẻ `<h3>` cho tiêu đề chính chỉ vì muốn chữ nhỏ vừa mắt, sau đó nhảy xuống `<h5>` rồi quay lại `<h2>`. Toàn bộ cấu trúc mục lục trang web bị đứt gãy, công cụ SEO chấm điểm thấp và người khiếm thị không thể dùng phím tắt nhảy nhanh qua các mục.',
    expectedKeywords: ['Heading Hierarchy (h1-h6)', 'Document Outline Structure', 'WCAG 2.4.6 Headings and Labels', 'No Heading Skipping Rule', 'One H1 Tag per Page Rule', 'Separation of Semantics from Styling'],
    pitfalls: [
      'Chọn thẻ Heading dựa trên kích thước chữ thị giác thay vì dựa trên cấp độ cấu trúc ngữ nghĩa (muốn chữ nhỏ thì dùng class CSS thay vì hạ cấp thẻ heading).',
      'Nhảy cóc cấp độ tiêu đề (ví dụ: từ `<h1>` nhảy cóc xuống `<h3>` bỏ qua `<h2>`), làm đứt gãy cây mục lục tài liệu.',
      'Sử dụng nhiều thẻ `<h1>` trên cùng một trang web thông thường làm loãng từ khóa SEO chính của trang.'
    ],
    followUpQuestions: [
      'Tại sao việc Screen Reader cung cấp phím tắt "H" (nhảy tới tiêu đề tiếp theo) và các phím số "1-6" (nhảy tới cấp độ heading tương ứng) khiến phân cấp Heading trở thành tính năng điều hướng quan trọng nhất?',
      'Thuật toán Document Outline tự động của HTML5 (dựa trên các thẻ sectioning lồng nhau) tại sao bị các trình duyệt và W3C từ bỏ và quay lại với phân cấp `<h1> - <h6>` cổ điển?'
    ]
  },

  'html-073': {
    interviewerIntent: 'Đánh giá kiến thức chuyên sâu về mẫu thiết kế WAI-ARIA Tabs Pattern: Xây dựng bộ Tab chuyển đổi nội dung chuẩn mực với các vai trò `tablist`, `tab`, `tabpanel`, điều hướng phím mũi tên và đồng bộ trạng thái.',
    contextOrScenario: 'Xây dựng component Tabs chuyển đổi giữa "Mô tả sản phẩm", "Thông số kỹ thuật" và "Đánh giá của khách hàng". Cần đảm bảo tuân thủ 100% tiêu chuẩn WAI-ARIA Tabs Pattern cho người dùng bàn phím và phần mềm đọc màn hình.',
    expectedKeywords: ['WAI-ARIA Tabs Pattern', 'role="tablist", role="tab", role="tabpanel"', 'aria-selected="true/false"', 'aria-controls and aria-labelledby', 'Arrow Keys Navigation (Left/Right)', 'Automatic vs Manual Tab Activation'],
    pitfalls: [
      'Dùng thẻ `<ul>` và `<li>` thông thường mà không gán các ARIA Roles tương ứng: Screen Reader chỉ đọc là một danh sách bullet point thay vì nhận diện đây là một bộ Tabs.',
      'Bắt người dùng phải dùng phím Tab để chuyển giữa các tab con (chuẩn WAI-ARIA quy định dùng phím Mũi tên Trái/Phải để chuyển tab, phím Tab dùng để nhảy thẳng xuống vùng nội dung `tabpanel` bên dưới).',
      'Quên liên kết hai chiều giữa thẻ Tab và nội dung: Tab phải có `aria-controls="panelId"` và Panel phải có `aria-labelledby="tabId"`.'
    ],
    followUpQuestions: [
      'Sự khác biệt giữa Automatic Activation (di chuyển mũi tên đến đâu thì Tab đó tự kích hoạt và hiển thị nội dung ngay) và Manual Activation (phải bấm Enter/Space mới kích hoạt tab)?',
      'Cấu trúc markup HTML và ARIA chuẩn mực nhất cho một bộ Tabs 3 mục gồm những thuộc tính nào?'
    ]
  },

  'html-077': {
    interviewerIntent: 'Đo lường năng lực giao tiếp và xử lý mâu thuẫn chuyên môn (Handling Design vs A11y Pushback), kỹ năng lập luận dựa trên tiêu chuẩn WCAG 2.2 mới nhất và bảo vệ quyền lợi người dùng.',
    contextOrScenario: 'Nhân viên thiết kế UI/UX gửi bản thiết kế với chữ màu xám nhạt `#999999` trên nền trắng `#ffffff` (tỷ lệ tương phản 2.8:1, rớt chuẩn WCAG AA). Khi lập trình viên yêu cầu đổi màu đậm hơn để đạt chuẩn 4.5:1, designer phản hồi: "Đổi màu đậm hơn nhìn nó thô và xấu lắm, em cứ giữ nguyên màu xám này đi!".',
    expectedKeywords: ['Design vs Accessibility Negotiation', 'WCAG 2.2 New Criteria', 'Focus Appearance (2.4.13)', 'Target Size Minimum (2.5.8 - 24x24px)', 'Accessible Alternatives Proposal', 'Business & Empathy Justification'],
    pitfalls: [
      'Thỏa hiệp mù quáng và làm theo bản thiết kế lỗi, khiến sản phẩm vi phạm tiêu chuẩn nghiệm thu và đối mặt với rủi ro pháp lý.',
      'Tranh cãi gay gắt thiếu tính xây dựng mà không đưa ra được giải pháp thay thế hài hòa (ví dụ: đề xuất tăng độ dày font chữ, tăng kích thước chữ, hoặc dùng màu xám đậm hơn chỉ một chút `#767676` vẫn đảm bảo thẩm mỹ mà vừa vặn đạt chuẩn 4.5:1).',
      'Chỉ biết các tiêu chí cũ của WCAG 2.0 mà không nắm được các tiêu chí mới bổ sung cực kỳ quan trọng của WCAG 2.2 (như Target Size Minimum 24x24px, Redundant Entry, Dragging Movements).'
    ],
    followUpQuestions: [
      'Các tiêu chí mới xuất hiện trong bản cập nhật WCAG 2.2 (Target Size Minimum 2.5.8, Focus Not Obscured 2.4.11, Redundant Entry 3.3.7) có ý nghĩa thực tế như thế nào?',
      'Cách sử dụng công cụ mô phỏng thị giác kém trực tiếp trước mặt Designer để thuyết phục bằng trải nghiệm thực tế thay vì tranh cãi lý thuyết?'
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
console.log(`Enriched HTML Metadata Batch 2: ${count} questions updated.`);
