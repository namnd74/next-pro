import fs from 'node:fs';
import path from 'node:path';

const filePath = path.resolve('src/features/interview/data/json/css-bank.json');
const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));

const batch1 = {
  'css-004': {
    interviewerIntent: 'Đánh giá mức độ thấu hiểu thuật toán Cascade và Specificity của CSS: Biết rõ tác hại của !important trong việc phá vỡ tính kế thừa và quy tắc ghi đè tự nhiên.',
    contextOrScenario: 'Một dự án lớn có hàng trăm component, nhiều lập trình viên lạm dụng `!important` để đè CSS nhanh, dẫn đến "Specificity War" — muốn đè lại một thuộc tính phải dùng selector phức tạp hơn kết hợp thêm nhiều `!important` khác.',
    expectedKeywords: ['!important', 'CSS Specificity', 'Specificity War', 'Origin and Importance', 'Utility-first Classes', 'CSS Cascade Layers (@layer)'],
    pitfalls: [
      'Lạm dụng `!important` để ghi đè component của bên thứ ba thay vì tăng độ ưu tiên selector hoặc dùng `@layer`.',
      'Không biết rằng `!important` trong Inline Style là mức ưu tiên cao nhất gần như không thể ghi đè bằng file CSS bên ngoài.',
      'Dùng `!important` trong thư viện UI dùng chung (Shared UI Library), gây ức chế cho các ứng dụng tiêu thụ.'
    ],
    followUpQuestions: [
      'Trường hợp hi hữu duy nhất nào mà `!important` được coi là chấp nhận được (ví dụ: utility helper class như `.hidden { display: none !important; }` hoặc user accessibility stylesheets)?',
      'Tính năng Cascade Layers (`@layer`) trong CSS hiện đại giúp giải quyết bài toán xung đột độ ưu tiên mà không cần `!important` ra sao?'
    ]
  },

  'css-005': {
    interviewerIntent: 'Kiểm tra kiến thức nền tảng vững chắc về mô hình hộp CSS Box Model (Content, Padding, Border, Margin) và sự khác biệt giữa các mô hình tính toán kích thước.',
    contextOrScenario: 'Lập trình viên thiết lập `width: 100%` cho một input form và thêm `padding: 12px`, `border: 1px solid black`. Kết quả input bị tràn ra ngoài (overflow) container chứa nó, làm vỡ layout giao diện trên điện thoại.',
    expectedKeywords: ['CSS Box Model', 'Content Box', 'Padding Box', 'Border Box', 'Margin Collapsing', 'box-sizing: border-box'],
    pitfalls: [
      'Quên reset `box-sizing: border-box` trên toàn trang (`* { box-sizing: border-box; }`), khiến kích thước thực tế bị cộng dồn `width + padding + border`.',
      'Nhầm lẫn giữa Padding (nằm trong vùng click của phần tử và chịu ảnh hưởng của background) và Margin (khoảng cách bên ngoài phần tử, trong suốt).',
      'Không biết rằng Margin top/bottom không có tác dụng trên Inline elements (như `<span>`, `<a>`).'
    ],
    followUpQuestions: [
      'Quy tắc Reset CSS chuẩn: Tại sao `*, *::before, *::after { box-sizing: border-box; }` luôn là dòng đầu tiên trong mọi dự án frontend?',
      'Phần tử nào có thể có `margin: auto` căn giữa cả theo chiều dọc lẫn chiều ngang (ví dụ: flex item hoặc absolute element kết hợp inset: 0)?'
    ]
  },

  'css-007': {
    interviewerIntent: 'Đánh giá khả năng kiểm soát luồng tài liệu (Document Normal Flow), sự khác biệt giữa các giá trị `position` và cách chúng ảnh hưởng đến tọa độ tham chiếu.',
    contextOrScenario: 'Cần xây dựng một Modal Popup xuất hiện giữa màn hình, một Dropdown Menu bám theo nút bấm, và một Sticky Header luôn cố định ở đầu trang khi cuộn.',
    expectedKeywords: ['position: static', 'position: relative', 'position: absolute', 'position: fixed', 'position: sticky', 'Containing Block', 'Normal Flow'],
    pitfalls: [
      'Đặt `position: absolute` nhưng quên đặt `position: relative` cho phần tử cha, khiến phần tử con bị nhảy tọa độ ra tận mép thẻ `<body>`.',
      'Lạm dụng `position: absolute` để dàn trang layout tổng thể thay vì sử dụng Flexbox hoặc Grid, làm vỡ responsive.',
      'Đặt `position: fixed` nhưng phần tử cha có thuộc tính `transform`, `filter`, hoặc `perspective` làm thay đổi Containing Block của fixed element.'
    ],
    followUpQuestions: [
      'Khi nào một phần tử `position: fixed` không còn cố định theo Viewport của trình duyệt nữa?',
      'Sự khác nhau giữa `top: 0` kết hợp `position: relative` và `position: absolute` đối với không gian chiếm dụng của phần tử trong Normal Flow là gì?'
    ]
  },

  'css-009': {
    interviewerIntent: 'Kiểm tra hiểu biết sâu sắc về 2 trục chính trong Flexbox: Main Axis vs Cross Axis, và chức năng căn chỉnh của từng thuộc tính.',
    contextOrScenario: 'Lập trình viên muốn căn giữa một icon và text theo chiều dọc trong nút bấm, nhưng nhầm lẫn giữa `justify-content: center` và `align-items: center` khi đổi `flex-direction: column`.',
    expectedKeywords: ['Main Axis vs Cross Axis', 'justify-content', 'align-items', 'flex-direction', 'Baseline Alignment', 'Safe Alignment (safe center)'],
    pitfalls: [
      'Quên rằng khi đổi `flex-direction: column`, Main Axis trở thành trục dọc và Cross Axis trở thành trục ngang, khiến `justify-content` căn chỉnh dọc còn `align-items` căn chỉnh ngang.',
      'Sử dụng `justify-content: center` khiến nội dung dài bị tràn ra ngoài mép trái và không thể cuộn tới được (khắc phục bằng `justify-content: safe center`).',
      'Nhầm lẫn giữa `align-items` (căn chỉnh item trên từng dòng) và `align-content` (căn chỉnh các dòng với nhau khi có nhiều dòng).'
    ],
    followUpQuestions: [
      'Khi nào nên dùng `align-self` trên một item con thay vì `align-items` trên container cha?',
      'Giá trị `align-items: baseline` căn chỉnh các phần tử dựa trên tiêu chí gì và hữu ích trong trường hợp nào?'
    ]
  },

  'css-011': {
    interviewerIntent: 'Đo lường sự thông thạo CSS Grid hiện đại: Hiểu bản chất đơn vị phân số linh hoạt `fr` (Fractional Unit) và thuật toán phân bổ không gian còn lại.',
    contextOrScenario: 'Thiết kế bố cục Dashboard 2 cột: Sidebar có độ rộng cố định `250px`, vùng nội dung chính chiếm toàn bộ khoảng trống còn lại và co giãn linh hoạt theo kích thước màn hình.',
    expectedKeywords: ['fr (Fractional Unit)', 'CSS Grid', 'Free Space Distribution', 'minmax()', 'grid-template-columns', 'Track Sizing'],
    pitfalls: [
      'Nghĩ rằng `1fr` tương đương với `100%`: `1fr` chỉ phân bổ phần không gian CÒN LẠI sau khi đã trừ đi các track cố định và `gap`, còn `100%` tính theo toàn bộ chiều rộng container.',
      'Một cột `1fr` chứa chuỗi văn bản dài không ngắt dòng (như URL) bị phình to làm vỡ grid (khắc phục bằng `minmax(0, 1fr)`).',
      'Sử dụng `fr` trong Flexbox (Flexbox không hỗ trợ đơn vị `fr`, chỉ có CSS Grid mới hỗ trợ).'
    ],
    followUpQuestions: [
      'Tại sao công thức `minmax(0, 1fr)` lại là best practice để chống tràn nội dung trong CSS Grid?',
      'Cách chia tỉ lệ 3 cột `1fr 2fr 1fr` hoạt động như thế nào khi container có tổng chiều rộng 1000px và gap 20px?'
    ]
  },

  'css-012': {
    interviewerIntent: 'Kiểm tra tư duy thiết kế Web đáp ứng (Responsive Web Design - RWD): Nắm vững 3 trụ cột của Ethan Marcotte và sự dịch chuyển sang Container Queries.',
    contextOrScenario: 'Website hiển thị đẹp trên MacBook 16 inch nhưng khi mở trên iPhone màn hình nhỏ thì bị tràn ngang, chữ bé li ti, hình ảnh bị méo tỷ lệ và các bảng dữ liệu bị vỡ vụn.',
    expectedKeywords: ['Responsive Web Design (RWD)', 'Fluid Grids', 'Flexible Images', 'Media Queries', 'Viewport Meta Tag', 'Container Queries'],
    pitfalls: [
      'Quên khai báo thẻ `<meta name="viewport" content="width=device-width, initial-scale=1.0">` khiến trình duyệt di động render trang ở chế độ desktop 980px thu nhỏ.',
      'Sử dụng các đơn vị cố định cứng `px` cho layout containers thay vì đơn vị linh hoạt (`%`, `vw`, `rem`, `fr`).',
      'Chỉ thiết kế responsive cho 2 kích thước (Desktop 1920px và Mobile 375px), bỏ quên dải kích thước máy tính bảng (Tablet 768px - 1024px) và màn hình gập.'
    ],
    followUpQuestions: [
      '3 nguyên lý nền tảng của Responsive Web Design do Ethan Marcotte định nghĩa năm 2010 là gì?',
      'Tại sao Container Queries (`@container`) được xem là bước tiến vĩ đại tiếp theo thay thế Media Queries cho Component-Driven Architecture?'
    ]
  },

  'css-013': {
    interviewerIntent: 'Đánh giá phương pháp luận phát triển giao diện hiện đại: Tư duy Mobile-First vs Desktop-First, tối ưu hóa CSS bundle và trải nghiệm người dùng trên thiết bị di động.',
    contextOrScenario: 'Nhóm phát triển viết CSS mặc định cho màn hình 4K rồi dùng `@media (max-width: ...)` để ẩn bớt phần tử và giảm kích thước cho mobile. Hậu quả là điện thoại 4G phải tải toàn bộ CSS nặng và hình ảnh dung lượng lớn không cần thiết.',
    expectedKeywords: ['Mobile-First Approach', 'Progressive Enhancement', 'min-width Media Queries', 'Graceful Degradation', 'Performance Budget', 'Content Priority'],
    pitfalls: [
      'Viết Desktop-First bằng `max-width` media queries, dẫn đến việc thiết bị di động yếu phải load CSS phức tạp rồi ghi đè liên tục.',
      'Dùng `display: none` trên mobile để giấu hình ảnh dung lượng lớn (trình duyệt vẫn tải hình ảnh đó ngầm về máy, làm tốn dung lượng 4G của user).',
      'Định nghĩa kích thước vùng chạm (Touch Target) quá nhỏ dưới 48x48px trên giao diện cảm ứng mobile.'
    ],
    followUpQuestions: [
      'Tại sao viết CSS theo phong cách Mobile-First với `@media (min-width: ...)` lại cho ra code CSS gọn gàng và ít bị ghi đè hơn?',
      'Tiêu chuẩn WCAG 2.5.5 yêu cầu kích thước Touch Target tối thiểu cho ngón tay trên màn hình cảm ứng là bao nhiêu?'
    ]
  },

  'css-014': {
    interviewerIntent: 'Kiểm tra sự thành thạo Media Queries: Từ cú pháp Media Features cổ điển đến Media Queries Level 4 (toán tử dải phạm vi `<=` và `>=`), nhận biết dark mode và reduced motion.',
    contextOrScenario: 'Cần viết CSS tự động đổi sang giao diện Dark Mode khi người dùng bật chế độ tối trên hệ điều hành, đồng thời tắt toàn bộ hiệu ứng chuyển động nếu người dùng bật tùy chọn chống chóng mặt trong Accessibility settings.',
    expectedKeywords: ['Media Queries Level 4', 'prefers-color-scheme', 'prefers-reduced-motion', 'Range Syntax (width >= 768px)', 'hover and pointer features', 'Screen vs Print Media'],
    pitfalls: [
      'Chỉ sử dụng Media Queries để kiểm tra chiều rộng màn hình (`width`) mà bỏ qua các Media Features về khả năng tương tác của thiết bị (`@media (hover: hover)`).',
      'Sử dụng breakpoint cố định theo từng dòng điện thoại cụ thể (như `width: 375px` cho iPhone 13) thay vì dựa trên điểm gãy tự nhiên của nội dung (Content-driven Breakpoints).',
      'Quên kiểm tra `@media (prefers-reduced-motion: reduce)` làm các hiệu ứng animation gây chóng mặt cho người dùng khiếm thị/rối loạn tiền đình.'
    ],
    followUpQuestions: [
      'Cú pháp Range Syntax trong Media Queries Level 4: `@media (768px <= width <= 1024px)` có ưu thế gì so với cú pháp cũ `min-width` và `max-width`?',
      'Media Feature `@media (pointer: coarse)` giúp nhận diện thiết bị nào và ứng dụng ra sao trong thiết kế nút bấm?'
    ]
  },

  'css-015': {
    interviewerIntent: 'Đo lường năng lực tổ chức kiến trúc CSS quy mô lớn: Quy ước đặt tên BEM (Block, Element, Modifier), tính module hóa và khả năng tái sử dụng không đụng độ tên class.',
    contextOrScenario: 'Một dự án thương mại điện tử lớn với 30 lập trình viên. CSS bị xung đột tên class liên tục khi nhiều người cùng đặt class chung chung như `.title`, `.btn`, `.active`, khiến style của trang giỏ hàng bị ghi đè bởi trang thanh toán.',
    expectedKeywords: ['BEM Methodology', 'Block__Element--Modifier', 'CSS Modularity', 'Low Specificity Principle', 'Namespace Isolation', 'Self-Documenting Code'],
    pitfalls: [
      'Tạo ra các tên class lồng nhau quá sâu theo cấu trúc DOM (ví dụ: `.card__header__title__link__icon`) thay vì giữ cấu trúc phẳng (`.card__icon`).',
      'Sử dụng Modifier đứng độc lập một mình mà không đi kèm Block/Element (ví dụ: `<div class="--active">` thay vì `class="btn btn--active"`).',
      'Lồng các class BEM vào nhau trong CSS selector (`.block .block__element`), làm tăng độ ưu tiên không cần thiết.'
    ],
    followUpQuestions: [
      'Nguyên tắc vàng: "Tại sao trong BEM, độ ưu tiên Specificity luôn được giữ ở mức thấp nhất (Single Class Selector: 0-1-0)?"',
      'Trong thời đại của CSS Modules, TailwindCSS và Styled Components, tư duy phân tách Block-Element-Modifier của BEM vẫn có giá trị cốt lõi nào?'
    ]
  },

  'css-016': {
    interviewerIntent: 'Kiểm tra sự hiểu biết sâu sắc về tầng hiển thị đồ họa của trình duyệt: Khác biệt cốt lõi giữa `border` (thuộc Box Model, chiếm diện tích) và `outline` (vẽ ngoài Box Model, không chiếm diện tích), và tầm quan trọng đối với khả năng tiếp cận (Accessibility Focus).',
    contextOrScenario: 'Khi người dùng di chuột hoặc dùng phím Tab chuyển focus vào một ô nhập liệu, lập trình viên thêm `border: 2px solid blue` làm toàn bộ các phần tử xung quanh bị nảy giật vị trí (Layout Shift / Jitter). Một đồng nghiệp khác sửa bằng `outline: none` để xóa viền xấu nhưng làm người khiếm thị không biết con trỏ đang ở đâu.',
    expectedKeywords: ['border vs outline', 'Box Model Occupation', 'Layout Reflow vs Paint-only', 'outline-offset', 'Accessibility Focus Indicator', ':focus-visible'],
    pitfalls: [
      'Xóa bỏ `outline: none` trên các phần tử tương tác (như `<button>`, `<a>`, `<input>`) mà không có style `:focus-visible` thay thế, vi phạm nghiêm trọng chuẩn tiếp cận WCAG 2.4.7.',
      'Sử dụng `border` cho trạng thái hover/focus làm thay đổi kích thước hộp, gây giật giao diện (Layout Reflow).',
      'Không biết rằng `outline` không hỗ trợ `border-radius` trên các trình duyệt cũ (dù trình duyệt hiện đại đã hỗ trợ theo bo góc).'
    ],
    followUpQuestions: [
      'Thuộc tính `outline-offset` hoạt động như thế nào để tạo khoảng hở thẩm mỹ giữa đường viền focus và phần tử?',
      'Tại sao việc thay đổi `border` kích hoạt quy trình Layout/Reflow trong khi `outline` chỉ kích hoạt Paint trên trình duyệt?'
    ]
  },

  'css-017': {
    interviewerIntent: 'Đánh giá kiến thức phân tích shorthand trong Flexbox: Bóc tách chính xác `flex: 1` thành bộ 3 thuộc tính và phân biệt rạch ròi với `flex: auto`.',
    contextOrScenario: 'Trong một danh sách hàng ngang, lập trình viên đặt `flex: 1` cho các cột nhưng một cột chứa tiêu đề dài lại bị phình to hơn các cột khác, hoặc ngược lại đặt `flex: auto` nhưng các cột không bằng nhau chằn chặn.',
    expectedKeywords: ['flex shorthand', 'flex: 1 (1 1 0%)', 'flex: auto (1 1 auto)', 'flex-basis: 0 vs auto', 'Content-based Sizing', 'Equal Width Columns'],
    pitfalls: [
      'Nhầm lẫn giữa `flex: 1` (tương đương `flex: 1 1 0%` - chia đều không gian bất chấp nội dung) và `flex: auto` (tương đương `flex: 1 1 auto` - chia không gian dựa trên kích thước nội dung sẵn có).',
      'Không biết `flex: initial` (mặc định của CSS) tương đương với `flex: 0 1 auto` (không giãn, có co, kích thước theo content).',
      'Đặt `flex: 1` trên phần tử chứa ảnh hoặc text dài không có `min-width: 0`, khiến phần tử từ chối co lại dưới kích thước nội dung tối thiểu.'
    ],
    followUpQuestions: [
      'Tại sao cần thêm `min-width: 0` cho Flex Item khi sử dụng `flex: 1` để chống tràn nội dung?',
      'Khi nào nên dùng `flex: 0 0 200px` thay vì đặt `width: 200px` thuần túy trên một Flex Item?'
    ]
  },

  'css-018': {
    interviewerIntent: 'Đo lường năng lực ra quyết định kiến trúc giao diện: Biết khi nào chọn Flexbox (bố cục 1 chiều, linh hoạt theo nội dung) và khi nào chọn Grid (bố cục 2 chiều, ma trận cố định).',
    contextOrScenario: 'Xây dựng trang thương mại điện tử gồm: (1) Thanh Header Toolbar trên cùng (Logo bên trái, ô tìm kiếm co giãn ở giữa, nút Giỏ hàng cố định bên phải); (2) Lưới danh sách 20 thẻ sản phẩm (Card Grid) tự động co giãn số cột theo màn hình.',
    expectedKeywords: ['Flexbox vs Grid Decision', 'One-Dimensional vs Two-Dimensional', 'Content-First vs Layout-First', 'Alignment Control', 'Responsive Card Grid', 'auto-fit / auto-fill'],
    pitfalls: [
      'Cố dùng Flexbox để làm lưới 2 chiều bằng cách tính `% width` và `flex-wrap`, dẫn đến dòng cuối cùng có 1 phần tử bị phình to hoặc căn lệch so với các cột trên.',
      'Dùng CSS Grid cho thanh Toolbar 1 chiều đơn giản, làm tăng độ phức tạp của code không cần thiết.',
      'Dùng JavaScript lắng nghe sự kiện resize màn hình để tính toán số cột của lưới sản phẩm thay vì dùng CSS Grid `repeat(auto-fit, minmax(...))`.'
    ],
    followUpQuestions: [
      'Tại sao Grid được gọi là "Layout-First" (dựng khung trước, đặt phần tử vào sau) trong khi Flexbox là "Content-First" (nội dung quyết định kích thước khung)?',
      'Làm thế nào để phối hợp Flexbox bên trong CSS Grid (Grid dựng lưới các Card, Flexbox căn chỉnh các nút bấm bên trong từng Card)?'
    ]
  },

  'css-019': {
    interviewerIntent: 'Kiểm tra sự hiểu biết sâu sắc về hành vi đa dòng (Multi-line Flex Container) và lý do tại sao `align-content` chỉ có tác dụng khi container có khoảng trống dư thừa và bật `flex-wrap: wrap`.',
    contextOrScenario: 'Lập trình viên viết `align-content: center` để căn giữa các phần tử trong thanh điều hướng đơn dòng, nhưng giao diện không hề có bất kỳ thay đổi nào và tưởng rằng trình duyệt bị lỗi CSS.',
    expectedKeywords: ['align-items vs align-content', 'Cross Axis Distribution', 'flex-wrap: wrap', 'Single-line vs Multi-line Flex', 'Free Space on Cross Axis', 'Line-level Alignment'],
    pitfalls: [
      'Đặt `align-content` trên Flex Container chỉ có 1 dòng (`flex-wrap: nowrap` mặc định): `align-content` hoàn toàn vô dụng vì không có khoảng trống giữa các dòng.',
      'Không đặt chiều cao cố định hoặc `min-height` cho Container đa dòng, khiến không có không gian dư thừa trên trục phụ để `align-content` phân bổ.',
      'Nhầm lẫn giữa `align-items` (căn chỉnh vị trí của từng item so với dòng của chính nó) và `align-content` (căn chỉnh vị trí của cả tập hợp các dòng so với container).'
    ],
    followUpQuestions: [
      'Trong CSS Grid, tại sao `align-content` lại có tác dụng ngay cả khi không có `flex-wrap`?',
      'Giá trị `align-content: space-between` hoạt động ra sao khi danh sách tags bị ngắt thành 4 dòng?'
    ]
  },

  'css-020': {
    interviewerIntent: 'Đánh giá việc áp dụng các tiêu chuẩn CSS hiện đại: Hiểu lý do tại sao thuộc tính `gap` vượt trội hơn kỹ thuật margin hack truyền thống về mặt bảo trì và tính toán.',
    contextOrScenario: 'Một danh sách gồm các button nằm ngang. Trước đây lập trình viên dùng `margin-right: 16px` và phải viết thêm selector `:last-child { margin-right: 0 }`. Khi danh sách bị wrap xuống dòng thứ 2 hoặc thay đổi thứ tự phần tử bằng JavaScript, layout bị thụt lề sai lệch.',
    expectedKeywords: ['gap property', 'Margin Hacks (:last-child)', 'Flexbox Gap', 'Grid Gap', 'Multi-line Wrap Spacing', 'Layout Encapsulation'],
    pitfalls: [
      'Dùng `margin-right` kết hợp `:last-child`: Khi các phần tử bị wrap xuống dòng thứ 2, phần tử cuối của dòng 1 vẫn dính margin làm lệch lề phải.',
      'Sử dụng Margin âm trên container cha (`margin: -8px`) để bù trừ margin con (kỹ thuật cũ dễ gây thanh cuộn ngang ngoài ý muốn trên mobile).',
      'Lo ngại về khả năng hỗ trợ trình duyệt: `gap` trong Flexbox đã được hỗ trợ 100% trên mọi trình duyệt hiện đại từ năm 2021.'
    ],
    followUpQuestions: [
      'Thuộc tính `row-gap` và `column-gap` phân tách khoảng cách theo từng chiều trong layout 2 chiều như thế nào?',
      'Tại sao việc dùng `gap` giúp việc ẩn/hiện phần tử động (Conditional Rendering) không để lại khoảng trống thừa thãi như margin?'
    ]
  },

  'css-021': {
    interviewerIntent: 'Kiểm tra kiến thức cốt lõi về thuật toán Cascade: Nắm vững thứ tự ưu tiên 4 tiêu chuẩn (Origin & Importance, Specificity, Scoping, Order of Appearance).',
    contextOrScenario: 'Trong một file CSS, rule `.card .title { color: red; }` viết ở dòng 10, trong khi rule `.title { color: blue; }` viết ở tận dòng 500. Lập trình viên thắc mắc vì sao viết sau mà chữ vẫn có màu đỏ.',
    expectedKeywords: ['CSS Cascade Algorithm', 'Specificity (ID, Class, Element)', 'Order of Appearance', 'Inline Styles', 'Weight Calculation (0-0-0)', 'Style Overrides'],
    pitfalls: [
      'Tưởng rằng quy tắc "Viết sau đè viết trước" áp dụng cho mọi trường hợp (nó CHỈ áp dụng khi 2 selector có độ ưu tiên Specificity hoàn toàn BẰNG NHAU).',
      'Đếm Specificity theo kiểu hệ số 10 (ví dụ: tưởng 10 class thắng được 1 ID — thực tế Specificity là hệ số cơ số vô cực, 1 ID luôn thắng mọi số lượng class).',
      'Không nhận ra rằng Selector `:is()` lấy độ ưu tiên của selector con nặng nhất, trong khi `:where()` có độ ưu tiên bằng 0.'
    ],
    followUpQuestions: [
      'Bảng tính điểm Specificity `(Inline, ID, Class/Attribute/Pseudo-class, Element/Pseudo-element)` tính điểm ra sao cho selector `nav#main ul.menu li a:hover`?',
      'Bộ chọn `:where()` trong CSS hiện đại giúp viết các rule mặc định (Default resets) với độ ưu tiên bằng 0 như thế nào?'
    ]
  },

  'css-022': {
    interviewerIntent: 'Đánh giá kỹ năng xử lý xung đột CSS chuyên nghiệp (CSS Conflict Resolution): Tránh Specificity War, kỹ thuật tăng độ ưu tiên selector thông minh và ứng dụng `@layer`.',
    contextOrScenario: 'Dự án tích hợp một thư viện UI (như Ant Design / Material UI / Tailwind). Thư viện gán style cho button. Một đồng nghiệp muốn đổi màu button nhưng thấy khó đè nên tiện tay thêm `color: red !important;`. Vài ngày sau, một component khác muốn đổi màu button đó ở trạng thái Disabled thì không thể đổi được nữa.',
    expectedKeywords: ['Specificity War', 'UI Library Overrides', 'CSS Cascade Layers (@layer)', 'Double Class Selector (.btn.btn)', 'Component Isolation', 'Design Tokens'],
    pitfalls: [
      'Dùng `!important` làm công cụ đầu tiên khi gặp khó khăn trong việc ghi đè style của thư viện UI bên ngoài.',
      'Sửa trực tiếp vào thư mục `node_modules` của thư viện (sẽ bị mất sạch khi chạy `npm install` lần sau).',
      'Tăng độ ưu tiên selector bằng cách lồng thêm tên thẻ cha dài ngoằng (`body div#app .wrapper .btn`), làm code bị gắn chặt với cấu trúc DOM.'
    ],
    followUpQuestions: [
      'Kỹ thuật nhân đôi class (`.btn.btn` có Specificity 0-2-0) giúp ghi đè selector của thư viện mà không làm ô nhiễm toàn cục như `!important` ra sao?',
      'Làm thế nào để đưa toàn bộ code của thư viện UI bên ngoài vào `@layer vendor;` để mọi style của dự án (`@layer app;`) tự động thắng mà không cần quan tâm Specificity?'
    ]
  },

  'css-023': {
    interviewerIntent: 'Kiểm tra kỹ năng Progressive Enhancement: Sử dụng quy tắc `@supports` (CSS Feature Queries) để áp dụng các tính năng CSS mới nhất mà vẫn bảo đảm giao diện không bị hỏng trên trình duyệt cũ.',
    contextOrScenario: 'Cần sử dụng thuộc tính hiện đại `:has()` hoặc `backdrop-filter: blur(10px)` cho hiệu ứng kính mờ (Glassmorphism). Cần đảm bảo trên các trình duyệt cũ chưa hỗ trợ tính năng này, website vẫn hiển thị nền xám bán trong suốt dễ nhìn thay vì bị trong suốt hoàn toàn không đọc được chữ.',
    expectedKeywords: ['@supports (CSS Feature Queries)', 'Progressive Enhancement', 'Graceful Degradation', 'Modern CSS Fallbacks', 'Selector Queries (@supports selector(...))', 'Cross-browser Safety'],
    pitfalls: [
      'Viết code dùng tính năng mới mà không có style nền tảng dự phòng trước khối `@supports`.',
      'Kiểm tra selector bằng cú pháp thuộc tính thông thường thay vì dùng `@supports selector(:has(a))`.',
      'Dùng JavaScript User-Agent sniffing để phát hiện tính năng thay vì dùng CSS Feature Queries nguyên bản của trình duyệt.'
    ],
    followUpQuestions: [
      'Nguyên tắc viết CSS Fallback: Viết style cơ bản trước, sau đó bọc style nâng cao trong `@supports` vận hành ra sao?',
      'Làm thế nào để kết hợp nhiều điều kiện logic trong `@supports` bằng toán tử `and`, `or`, `not`?'
    ]
  },

  'css-024': {
    interviewerIntent: 'Đánh giá kiến thức về Biến CSS (CSS Custom Properties): Hiểu rõ cơ chế kế thừa theo cây DOM (Inheritance & Cascading), phạm vi biến (Scoping) và giá trị dự phòng (Fallback Mechanism).',
    contextOrScenario: 'Một lập trình viên khai báo biến `--primary-color: #007bff;` bên trong `.sidebar`, sau đó gọi `var(--primary-color)` trong `.header` và thấy biến không hoạt động. Đồng thời, một icon dùng `var(--icon-size, 16px)` nhưng lại bị lỗi giao diện khi biến truyền vào là giá trị không hợp lệ.',
    expectedKeywords: ['CSS Custom Properties', 'DOM Inheritance & Scoping', ':root Pseudo-class', 'var() Fallback Values', 'Guaranteed-Invalid Value', 'Runtime Dynamic Theming'],
    pitfalls: [
      'Nghĩ rằng Biến CSS có phạm vi toàn cục như biến SASS/SCSS: Biến CSS tuân theo phạm vi cây DOM, chỉ có tác dụng trong phần tử khai báo và các phần tử con cháu của nó.',
      'Khai báo biến trong `:root` nhưng truyền giá trị rỗng làm CSS coi là giá trị hợp lệ, khiến fallback trong hàm `var(--x, fallback)` KHÔNG được kích hoạt.',
      'Lạm dụng biến CSS thay đổi liên tục bằng JavaScript trong vòng lặp animation, làm tăng chi phí tính toán lại style của toàn cây DOM.'
    ],
    followUpQuestions: [
      'Tại sao khai báo Biến CSS trong `:root` tương đương với khai báo trên thẻ `<html>` nhưng có độ ưu tiên Specificity cao hơn một chút?',
      'Cơ chế lồng fallback: `var(--color, var(--fallback-color, black))` xử lý các cấp độ dự phòng như thế nào?'
    ]
  },

  'css-025': {
    interviewerIntent: 'Kiểm tra mức độ cập nhật các tính năng CSS mang tính đột phá: Hiểu bản chất của `:has()` selector ("The Parent Selector") và các trường hợp sử dụng tối ưu.',
    contextOrScenario: 'Cần style cho một thẻ Card thay đổi viền sang màu đỏ khi bên trong nó có chứa một form input bị lỗi (`:invalid`), hoặc ẩn tiêu đề danh sách khi danh sách không có phần tử con nào bên trong. Trước đây bắt buộc phải dùng JavaScript, nay có thể viết hoàn toàn bằng CSS.',
    expectedKeywords: [':has() Selector', 'Parent Selector', 'Relational Pseudo-Class', 'State-Driven Styling', 'Eliminating JS State Classes', 'Performance Considerations'],
    pitfalls: [
      'Sử dụng các selector `:has()` quá rộng và phức tạp trên toàn bộ trang (`body:has(...)`), làm ảnh hưởng đến hiệu năng render của trình duyệt khi DOM thay đổi.',
      'Lồng `:has()` bên trong một selector `:has()` khác (CSS specification cấm lồng `:has()` đệ quy).',
      'Quên kiểm tra hỗ trợ trình duyệt cũ đối với các dự án cần hỗ trợ Safari hoặc Chrome phiên bản cũ trước năm 2023.'
    ],
    followUpQuestions: [
      'Ví dụ kinh điển: Viết CSS để khi một Checkbox nằm sâu bên trong một hàng bảng được tick, toàn bộ hàng `<tr>` cha đổi màu nền bằng `:has()`?',
      'Tại sao trước khi có `:has()`, CSS không thể có bộ chọn cha (Parent Selector) vì lo ngại về hiệu năng thuật toán duyệt DOM của trình duyệt?'
    ]
  },

  'css-026': {
    interviewerIntent: 'Đo lường sự chính xác tuyệt đối trong việc sử dụng các bộ kết hợp selector (Combinators): Phân biệt rạch ròi giữa Descendant (space), Child (`>`), Next Sibling (`+`), và Subsequent Sibling (`~`).',
    contextOrScenario: 'Trong một menu đa cấp gồm nhiều thẻ `<ul>` và `<li>`, lập trình viên muốn chỉ style cho các thẻ con trực tiếp của menu cấp 1 mà không làm ảnh hưởng đến menu con (Submenu) bên trong, hoặc style cho thông báo lỗi ngay bên dưới ô input.',
    expectedKeywords: ['Combinator Selectors', 'Descendant Combinator (space)', 'Child Combinator (>)', 'Adjacent Sibling (+)', 'General Sibling (~)', 'DOM Traversal Precision'],
    pitfalls: [
      'Dùng Descendant combinator (dấu cách ` `) khi chỉ muốn tác động lên con trực tiếp: Dẫn đến style bị rò rỉ (leak) vào toàn bộ các cấp con cháu nằm sâu bên trong.',
      'Nhầm lẫn giữa Adjacent Sibling (`+` chỉ chọn đúng 1 phần tử ngay sát sau) và General Sibling (`~` chọn tất cả phần tử anh em cùng cấp nằm sau).',
      'Sử dụng các combinator chuỗi quá dài làm tăng chi phí so khớp selector của trình duyệt (Browser Selector Matching Engine).'
    ],
    followUpQuestions: [
      'Kỹ thuật "The Lobotomized Owl Selector" (`* + *`) sử dụng adjacent sibling combinator để tạo khoảng cách tự động giữa các khối nội dung như thế nào?',
      'Cách kết hợp `input:checked + label` để tạo custom checkbox/radio buttons mà không cần JavaScript?'
    ]
  },

  'css-028': {
    interviewerIntent: 'Đánh giá hiểu biết sâu sắc về `position: sticky`: Nguyên lý hoạt động kết hợp giữa `relative` và `fixed`, và các nguyên nhân phổ biến khiến sticky không hoạt động.',
    contextOrScenario: 'Lập trình viên muốn một thanh Header hoặc Sidebar bảng dính cố định khi cuộn trang (`position: sticky; top: 0;`). Tuy nhiên khi cuộn trang thì thanh Header trôi luôn theo màn hình mà không dính lại.',
    expectedKeywords: ['position: sticky', 'Sticky Constraints', 'Overflow Clipping (overflow: hidden)', 'Threshold (top/bottom/left/right)', 'Parent Height Constraint', 'Scroll Container'],
    pitfalls: [
      'Đặt `position: sticky` nhưng quên khai báo ít nhất một tọa độ ngưỡng (`top`, `bottom`, `left`, hoặc `right`), khiến sticky không bao giờ kích hoạt.',
      'Phần tử cha (hoặc bất kỳ tổ tiên nào) có thuộc tính `overflow: hidden`, `overflow: auto`, hoặc `overflow: scroll`: Dẫn đến việc giới hạn vùng cuộn và làm hỏng sticky hoàn toàn.',
      'Phần tử cha có chiều cao bằng đúng chiều cao của sticky item: Sticky chỉ có thể trượt trong phạm vi của phần tử cha, nếu cha không có chiều cao dư thừa thì sticky không thể di chuyển.'
    ],
    followUpQuestions: [
      'Cách gỡ rối (Debug) từng bước khi một phần tử `position: sticky` không hoạt động trên giao diện thực tế?',
      'Làm thế nào để tạo hiệu ứng nhiều Header xếp chồng lên nhau (Sticky Stacking Headers) khi người dùng cuộn qua từng danh mục sản phẩm?'
    ]
  },

  'css-029': {
    interviewerIntent: 'Kiểm tra hiểu biết bản chất về thứ tự xếp chồng các phần tử trong không gian 3 chiều (Z-Index & Stacking Order): Tại sao `z-index: 9999` vẫn bị một phần tử có `z-index: 1` che khuất.',
    contextOrScenario: 'Một Dropdown Menu có `z-index: 999999` nằm trong Sidebar, nhưng khi mở ra lại bị một banner quảng cáo ở Content có `z-index: 2` đè lên trên. Lập trình viên cố tăng z-index lên hàng tỷ nhưng vẫn không thể giải quyết được.',
    expectedKeywords: ['z-index', 'Stacking Context', 'Stacking Order Hierarchy', 'Opacity / Transform triggers', 'isolation: isolate', 'Local vs Global Stacking'],
    pitfalls: [
      'Đặt `z-index` trên một phần tử có `position: static` (mặc định): `z-index` hoàn toàn vô dụng trên static elements (trừ khi là Flex/Grid item).',
      'Tin rằng `z-index` có giá trị tuyệt đối toàn trang: `z-index` chỉ có ý nghĩa so sánh giữa các phần tử nằm trong CÙNG MỘT Stacking Context.',
      'Tham gia vào cuộc đua "Z-Index Inflation" (đặt các số vô nghĩa như 9999999) thay vì quản lý theo hệ thống thang bậc Design Tokens.'
    ],
    followUpQuestions: [
      'Thuộc tính CSS `isolation: isolate` trong CSS hiện đại giúp tạo ra một Stacking Context mới an toàn như thế nào để ngăn z-index rò rỉ ra ngoài?',
      'Liệt kê 5 thuộc tính CSS phổ biến vô tình tạo ra một Stacking Context mới (ví dụ: `opacity < 1`, `transform`, `filter`, `will-change`, `container-type`)?'
    ]
  },

  'css-031': {
    interviewerIntent: 'Kiểm tra mức độ thông thạo giải thuật phân bổ không gian trong Flexbox: Bóc tách chính xác vai trò của bộ ba `flex-grow`, `flex-shrink` và `flex-basis`.',
    contextOrScenario: 'Một thanh thanh toán có 3 ô thông tin. Lập trình viên muốn ô 1 cố định 200px, ô 2 co giãn chiếm hết khoảng trống, và ô 3 không bao giờ bị co lại khi màn hình nhỏ. Cần thiết lập chính xác các giá trị flex.',
    expectedKeywords: ['flex-grow', 'flex-shrink', 'flex-basis', 'Remaining Space Allocation', 'Shrink Ratio Calculation', 'Hypothetical Size'],
    pitfalls: [
      'Cho rằng `flex-shrink: 1` và `flex-shrink: 2` co lại theo tỷ lệ 1:2 đơn thuần (thực tế công thức co lại có nhân với kích thước ban đầu `flex-basis`, khiến phần tử to hơn sẽ bị co nhiều hơn).',
      'Đặt `flex-shrink: 0` trên quá nhiều phần tử khiến container bị tràn ngang trên màn hình di động nhỏ.',
      'Nhầm lẫn giữa `flex-basis` và `width`: Khi cả hai cùng được khai báo, `flex-basis` luôn được ưu tiên áp dụng trên trục chính.'
    ],
    followUpQuestions: [
      'Công thức toán học chính xác của trình duyệt khi tính toán phân bổ không gian dư thừa bằng `flex-grow` là gì?',
      'Tại sao đặt `flex-shrink: 0` cho icon đại diện (Avatar) là cách tốt nhất để avatar không bao giờ bị méo hình khi văn bản bên cạnh quá dài?'
    ]
  },

  'css-032': {
    interviewerIntent: 'Đánh giá khả năng kiểm soát luồng xuống dòng trong Flexbox: Thuộc tính `flex-wrap` và cơ chế phân phối các dòng phần tử.',
    contextOrScenario: 'Một danh sách gồm 30 thẻ tag từ khóa (Filter Tags). Trên màn hình máy tính danh sách nằm trên 1 hàng, nhưng trên điện thoại các tags phải tự động rớt xuống dòng mượt mà mà không làm vỡ giao diện.',
    expectedKeywords: ['flex-wrap: wrap', 'Multi-line Flex Container', 'flex-flow Shorthand', 'flex-wrap: wrap-reverse', 'Cross Axis Generation', 'Overflow Prevention'],
    pitfalls: [
      'Quên rằng mặc định của Flexbox là `flex-wrap: nowrap`, khiến các phần tử con cố gắng co rúm lại hoặc tràn ra ngoài container thay vì tự động xuống dòng.',
      'Sử dụng `flex-wrap: wrap` nhưng không đặt `gap` hoặc margin giữa các dòng, khiến các dòng dính sát vào nhau.',
      'Kỳ vọng `justify-content: space-between` sẽ căn đều các phần tử ở dòng cuối cùng (ở dòng cuối có ít phần tử, chúng sẽ bị dạt ra 2 biên thay vì xếp thẳng hàng với các dòng trên).'
    ],
    followUpQuestions: [
      'Làm thế nào để các phần tử ở dòng cuối cùng của một multi-line flex container căn đều sang trái thay vì bị dạt biên khi dùng `space-between`?',
      'Thuộc tính `flex-flow` là viết tắt của những thuộc tính nào và cú pháp sử dụng ra sao?'
    ]
  },

  'css-033': {
    interviewerIntent: 'Kiểm tra kiến thức về thuộc tính khoảng cách `gap` trong Flexbox và sự khác biệt với CSS Grid gap.',
    contextOrScenario: 'Cần tạo khoảng cách đều đặn 16px giữa các mục trong một danh sách Flexbox nhiều hàng nhiều cột mà không muốn dùng margin âm cho container.',
    expectedKeywords: ['flex gap', 'row-gap and column-gap', 'Negative Margin Replacement', 'Flexbox Alignment', 'Spacing Tokens', 'Browser Compatibility History'],
    pitfalls: [
      'Vẫn sử dụng kỹ thuật Margin âm phức tạp trong các dự án mới năm 2024-2026 khi mà `gap` đã được hỗ trợ 100% trên toàn cầu.',
      'Đặt `gap` trên Flex Item thay vì đặt trên Flex Container.',
      'Không biết rằng `gap` chỉ áp dụng KHOẢNG CÁCH GIỮA các phần tử, không tạo khoảng hở ở mép ngoài cùng (giúp tiết kiệm công sức xóa margin đầu/cuối).'
    ],
    followUpQuestions: [
      'Sự khác nhau về mặt hành vi giữa `gap` và `margin` đối với các phần tử bị ẩn bằng `display: none` là gì?',
      'Cách sử dụng CSS Custom Properties với `gap` để tạo ra hệ thống lưới linh hoạt theo Design System?'
    ]
  },

  'css-034': {
    interviewerIntent: 'Đo lường năng lực thiết kế lưới 2 chiều bằng CSS Grid: Khai báo kích thước các cột và hàng qua `grid-template-columns` và `grid-template-rows`.',
    contextOrScenario: 'Thiết kế bố cục trang báo điện tử gồm: Header toàn màn hình, 3 cột tin tức (cột chính rộng gấp đôi 2 cột phụ), và Footer ở cuối trang.',
    expectedKeywords: ['grid-template-columns', 'grid-template-rows', 'repeat() Notation', 'Line-based Placement', 'Explicit vs Implicit Grid', 'Grid Tracks'],
    pitfalls: [
      'Khai báo quá nhiều cột bằng pixel cố định làm lưới bị tràn màn hình khi xem trên thiết bị di động.',
      'Nhầm lẫn giữa Explicit Grid (các track được định nghĩa rõ ràng qua template) và Implicit Grid (các track tự sinh ra khi có phần tử vượt quá số ô khai báo).',
      'Không sử dụng hàm `repeat()` làm code bị dài dòng lặp lại (ví dụ: viết `1fr 1fr 1fr 1fr 1fr` thay vì `repeat(5, 1fr)`).'
    ],
    followUpQuestions: [
      'Thuộc tính `grid-auto-rows` và `grid-auto-columns` kiểm soát kích thước của Implicit Grid Tracks như thế nào?',
      'Cách đặt tên cho các đường lưới (Named Grid Lines: `[sidebar-start] 250px [sidebar-end content-start] 1fr`) để code dễ đọc ra sao?'
    ]
  },

  'css-035': {
    interviewerIntent: 'Đánh giá mức độ am hiểu chuyên sâu về CSS Grid: Phân biệt chính xác sự khác nhau giữa `auto-fit` và `auto-fill` khi số lượng phần tử không đủ lấp đầy một dòng.',
    contextOrScenario: 'Thiết kế lưới Card sản phẩm responsive tự động co giãn số cột. Khi người dùng tìm kiếm chỉ ra đúng 2 kết quả: Với `auto-fill` thì 2 card giữ nguyên kích thước nhỏ, còn với `auto-fit` thì 2 card tự động giãn to chiếm hết toàn bộ chiều rộng trang.',
    expectedKeywords: ['auto-fit vs auto-fill', 'Grid Track Sizing', 'Empty Track Handling', 'repeat() Function', 'Responsive Grid without Media Queries', 'Collapse Empty Tracks'],
    pitfalls: [
      'Dùng `auto-fit` khi muốn các ô giữ kích thước cố định chuẩn mực: Dẫn đến việc khi có 1 phần tử duy nhất, nó sẽ bị kéo dãn khổng lồ chiếm toàn màn hình.',
      'Dùng `auto-fill` mà không hiểu tại sao có khoảng trống thừa thãi bên phải màn hình khi số lượng item ít.',
      'Không kết hợp với hàm `minmax()` khiến trình duyệt không xác định được kích thước tối thiểu và tối đa của track.'
    ],
    followUpQuestions: [
      'Quy tắc hình ảnh dễ nhớ: "Auto-fill lấp đầy các track rỗng vô hình, còn Auto-fit bóp xẹp (collapse) các track rỗng về 0px để kéo giãn các phần tử thực tế" hoạt động ra sao?',
      'Khi nào nên chọn `auto-fit` và khi nào nên chọn `auto-fill` trong một ứng dụng Dashboard thực tế?'
    ]
  },

  'css-036': {
    interviewerIntent: 'Kiểm tra kỹ năng sử dụng hàm toán học trong CSS Grid: Ứng dụng hàm `minmax()` để tạo bố cục co giãn an toàn có giới hạn kích thước trần và sàn.',
    contextOrScenario: 'Cần tạo một Sidebar: Không bao giờ được phép nhỏ hơn 200px (để không bị mất chữ) và không bao giờ được lớn hơn 400px (để không chiếm hết màn hình), trong khoảng đó thì co giãn tự do.',
    expectedKeywords: ['minmax() Function', 'Clamping Track Sizes', 'min-content and max-content', 'Intrinsic vs Extrinsic Sizing', 'Responsive Minimum Threshold', 'Zero-Width Safety (minmax(0, 1fr))'],
    pitfalls: [
      'Đặt giá trị `min` lớn hơn giá trị `max` trong hàm `minmax(min, max)`: Trình duyệt sẽ tự động bỏ qua `max` và coi như một kích thước cố định bằng `min`.',
      'Dùng `minmax(200px, 1fr)` mà không lường trước trường hợp màn hình mobile chỉ rộng 320px, khiến lưới bị tràn ngang.',
      'Không biết rằng có thể truyền các từ khóa nội tại như `min-content` hoặc `max-content` vào hàm `minmax()`.'
    ],
    followUpQuestions: [
      'Hàm `minmax(min-content, max-content)` cho phép một cột co giãn linh hoạt theo độ dài thực tế của chữ bên trong như thế nào?',
      'Công thức vàng cho Responsive Grid hoàn toàn không cần Media Queries: `grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));` hoạt động ra sao?'
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
console.log(`Enriched CSS Metadata Batch 1: ${count} questions updated.`);
