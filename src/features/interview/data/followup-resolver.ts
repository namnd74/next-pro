import { InterviewQuestion, InterviewFollowUp } from '../types';

export interface ResolvedFollowUp {
  questionText: string;
  answer: string;
  codeExample?: string;
  codeLanguage?: string;
  isCurated?: boolean;
}

/**
 * Curated knowledge base providing deep Senior-level technical answers
 * and code examples for interview follow-up inquiries.
 */
const CURATED_FOLLOW_UPS: Record<
  string,
  { answer: string; codeExample?: string; codeLanguage?: string }
> = {
  'có thể thay thế hoàn toàn `react.memo` bằng `usememo` được không? cho ví dụ minh họa.':
    {
      answer:
        'Về mặt kỹ thuật, bạn có thể dùng `useMemo` ở component cha để ghi nhớ một React Element JSX (kỹ thuật same-element reference bailout), từ đó ngăn React re-render con khi cha cập nhật state khác.\n\nTuy nhiên, KHÔNG THỂ và KHÔNG NÊN thay thế hoàn toàn `React.memo` vì 3 lý do:\n1. **Vi phạm tính đóng gói (Encapsulation)**: Component con bị phụ thuộc vào việc component cha có nhớ bọc nó hay không. Nếu component con được tái sử dụng ở 10 màn hình khác nhau, bạn phải viết lại `useMemo` ở cả 10 nơi.\n2. **Khó kiểm soát dependencies**: Toàn bộ props truyền cho con phải liệt kê chuẩn xác trong dependency array của cha, rất dễ gây bug stale props.\n3. **Quy tắc React Hooks**: `useMemo` không thể gọi có điều kiện hoặc trong vòng lặp.\n\n`React.memo` là giải pháp chuẩn mực vì nó tự đóng gói cơ chế so sánh props nông ngay tại định nghĩa component con.',
      codeExample: `// ❌ Dùng useMemo ở cha (cồng kềnh, dễ quên, không tái sử dụng được):
function Dashboard({ filter }: { filter: string }) {
  const [theme, setTheme] = useState('dark');
  // Con chỉ skip re-render khi theme đổi, nhưng phải quản lý từ cha:
  const chartElement = useMemo(() => <ComplexChart filter={filter} />, [filter]);
  return <div>{chartElement}</div>;
}

// ✅ Chuẩn mực: Dùng React.memo tại component con (tự đóng gói ở mọi nơi):
export const ComplexChart = React.memo(function ComplexChart({ filter }: { filter: string }) {
  return <div>Rendered for: {filter}</div>;
});`,
      codeLanguage: 'tsx',
    },

  'tham số thứ hai của `react.memo` (arepropsequal) hoạt động như thế nào?': {
    answer:
      '`arePropsEqual(prevProps, nextProps)` là hàm so sánh tùy chỉnh cho phép lập trình viên tự định nghĩa điều kiện re-render cho component.\n\n⚠️ **CẠM BẪY PHỎNG VẤN KINH ĐIỂN (Ngược logic với `shouldComponentUpdate` trong Class Component):**\n- Trả về `true`: Biểu thị props cũ và mới **bằng nhau** ➔ React sẽ **BỎ QUA re-render** (Skip render).\n- Trả về `false`: Biểu thị props đã **thay đổi** ➔ React sẽ **TIẾN HÀNH re-render**.\n(Trong Class Component, `shouldComponentUpdate` trả về `true` là TIẾN HÀNH re-render!).\n\nMặc định nếu bỏ trống tham số này, React thực hiện so sánh nông (shallow comparison) từng key của props bằng thuật toán `Object.is`.',
    codeExample: `interface UserCardProps {
  user: { id: string; name: string; avatar: string };
  lastActive: number;
}

export const UserCard = React.memo(
  function UserCard({ user }: UserCardProps) {
    return <div>{user.name}</div>;
  },
  // Custom comparator:
  (prevProps, nextProps) => {
    // Chỉ re-render nếu ID hoặc tên thay đổi; bỏ qua nếu lastActive thay đổi:
    return (
      prevProps.user.id === nextProps.user.id &&
      prevProps.user.name === nextProps.user.name
    );
  }
);`,
    codeLanguage: 'tsx',
  },

  'tại sao jsx lại yêu cầu class đổi thành classname và for đổi thành htmlfor?': {
    answer:
      'Lý do cốt lõi bắt nguồn từ cú pháp JavaScript và DOM API:\n1. `class` và `for` là các từ khóa dành riêng (reserved keywords) trong ngôn ngữ JavaScript/ECMAScript. Khi JSX được biên dịch thành các lệnh gọi hàm JavaScript (như `React.createElement` hoặc JSX transform mới), các thuộc tính trở thành keys của một JavaScript object.\n2. Thuộc tính DOM chuẩn của browser trong JavaScript DOM API tương ứng là `element.className` và `labelElement.htmlFor` chứ không phải `.class` hay `.for`. React bám sát mô hình DOM property hơn là HTML attribute string.',
    codeExample: `// JSX:
<label htmlFor="email" className="font-bold">Email</label>

// Được biên dịch thành JavaScript object:
jsx('label', { htmlFor: 'email', className: 'font-bold', children: 'Email' });`,
    codeLanguage: 'tsx',
  },

  'jsx chống tấn công cross-site scripting (xss) như thế nào?': {
    answer:
      'Theo mặc định, React DOM tự động escape (mã hóa ký tự an toàn) tất cả các giá trị được nhúng bên trong JSX `{expression}` trước khi render ra HTML thật.\n\nToàn bộ chuỗi được chuyển thành text node thông qua `textContent`, biến các ký tự nguy hiểm như `<`, `>`, `&`, `"`, `\'` thành ký tự hiển thị an toàn thay vì thực thi như mã HTML/JavaScript.\n\nCửa sổ duy nhất có thể gây XSS là khi cố tình sử dụng `dangerouslySetInnerHTML={{ __html: dirtyString }}` mà không qua thư viện sanitizer (như DOMPurify), hoặc sử dụng `javascript:` URI trong thẻ `<a href={userInput}>`.',
    codeExample: `const userInput = '<script>stealCookie()</script>';

// Hoàn toàn an toàn: React escape và in ra chuỗi '<script>stealCookie()</script>' dạng text
<div>{userInput}</div>

// ⚠️ Nguy hiểm nếu không sanitize:
<div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(userInput) }} />`,
    codeLanguage: 'tsx',
  },

  "tại sao từ react 17 ta không cần phải `import react from 'react'` ở đầu file khi chỉ viết jsx?":
    {
      answer:
        "Trước React 17, trình biên dịch (Babel/TypeScript) biến đổi JSX `<div />` thành `React.createElement('div')`, đòi hỏi biến `React` phải tồn tại trong scope của file.\n\nTừ React 17, React hợp tác với Babel/TypeScript giới thiệu bộ chuyển đổi JSX mới (New JSX Transform). Trình biên dịch tự động chèn các hàm chuyên dụng từ package nội bộ `react/jsx-runtime` (như `_jsx('div', props)`), giúp giảm bundle size, tối ưu hiệu năng gọi hàm và loại bỏ sự phiền toái khi phải import React thủ công.",
      codeExample: `// Code viết:
export function App() {
  return <h1>Hello NextPro</h1>;
}

// Compiler tự động inject (không cần import React thủ công):
import { jsx as _jsx } from 'react/jsx-runtime';
export function App() {
  return _jsx('h1', { children: 'Hello NextPro' });
}`,
      codeLanguage: 'tsx',
    },

  "mục đích bảo mật của thuộc tính `$$typeof: symbol.for('react.element')` là gì?": {
    answer:
      "Thuộc tính `$$typeof: Symbol.for('react.element')` được sinh ra để chống lại lỗ hổng bảo mật XSS khi server trả về JSON độc hại.\n\nNếu server có lỗ hổng cho phép người dùng lưu trữ object JSON giả mạo React Element (có `type: \"script\"`, `props: { dangerouslySetInnerHTML: ... }`), hacker có thể lừa client render object đó.\n\nTuy nhiên, JSON chuẩn KHÔNG THỂ tuần tự hóa (serialize) kiểu dữ liệu `Symbol`. Do đó, bất kỳ JSON nào gửi từ server về client sẽ không bao giờ có `Symbol.for('react.element')`. React kiểm tra `element.$$typeof === Symbol.for('react.element')`; nếu thiếu Symbol này, React sẽ từ chối render và ném lỗi.",
    codeExample: `// Giả sử hacker gửi payload JSON này từ Database:
const maliciousJSON = JSON.parse('{"$$typeof": "Symbol(react.element)", "type": "script", ...}');

// React kiểm tra:
if (maliciousJSON.$$typeof !== Symbol.for('react.element')) {
  // Bị chặn lại ngay lập tức vì typeof maliciousJSON.$$typeof là 'string', không phải 'Symbol'!
}`,
    codeLanguage: 'typescript',
  },

  'tại sao `false`, `null`, `undefined` không hiện lên ui nhưng `0` và `nan` lại hiển thị?':
    {
      answer:
        '`false`, `null`, và `undefined` được React thiết kế đặc biệt như các giá trị "không hiển thị" để hỗ trợ cú pháp render có điều kiện ngắn gọn: `{hasUser && <UserProfile />}`.\n\nNgược lại, `0` và `NaN` là các số hợp lệ trong JavaScript (`typeof 0 === "number"`). Trong nhiều trường hợp ứng dụng thực tế (như hiển thị số dư tài khoản `$0`, số lượng tin nhắn chưa đọc `0`), số `0` là dữ liệu hiển thị có ý nghĩa, do đó React giữ nguyên và render ra UI.\n\n⚠️ Bẫy phổ biến: `items.length && <List />` khi `items` rỗng (`0`) sẽ in số `0` ra màn hình. Khắc phục: Dùng `Boolean(items.length) && ...` hoặc `items.length > 0 ? <List /> : null`.',
      codeExample: `const count = 0;

// ❌ Bẫy: in số "0" lên giao diện
<div>{count && <span>Có {count} tin nhắn</span>}</div>

// ✅ Đúng: Không in gì cả khi count === 0
<div>{count > 0 ? <span>Có {count} tin nhắn</span> : null}</div>`,
      codeLanguage: 'tsx',
    },

  'fragment có nhận bất kỳ props nào khác ngoài `key` và `children` không?': {
    answer:
      'KHÔNG. `React.Fragment` chỉ chấp nhận duy nhất 2 props là `key` và `children`.\n\nFragment không đại diện cho bất kỳ DOM node thực tế nào trên cây DOM của trình duyệt, do đó nó không thể nhận các thuộc tính HTML hay CSS như `className`, `id`, `style`, `onClick`...\n\nLưu ý cú pháp viết tắt `<>...</>` (short syntax) hoàn toàn KHÔNG THỂ nhận `key`. Khi cần truyền `key` trong vòng lặp `map()`, bạn bắt buộc phải dùng cú pháp tường minh: `<React.Fragment key={item.id}>...</React.Fragment>`.',
    codeExample: `// ❌ Lỗi cú pháp: Cú pháp <> không nhận props:
// items.map(it => < key={it.id}>{it.name}</>)

// ✅ Đúng khi cần truyền key:
{items.map((it) => (
  <React.Fragment key={it.id}>
    <dt>{it.title}</dt>
    <dd>{it.description}</dd>
  </React.Fragment>
))}`,
    codeLanguage: 'tsx',
  },

  'ngoài render danh sách, bạn còn áp dụng `key` vào kỹ thuật nào khác trong react? (vd: reset state component mà không cần useeffect)':
    {
      answer:
        'Kỹ thuật cao cấp và sạch nhất của `key` là **State Reset Pattern**:\n\nKhi giá trị `key` của một component thay đổi, React sẽ coi đó là một component hoàn toàn mới, hủy bỏ (unmount) instance cũ cùng toàn bộ internal state của nó, và mount một instance mới với initial state ban đầu.\n\nỨng dụng tuyệt vời:\n1. Reset hoàn toàn form chỉnh sửa khi chuyển đổi giữa các User/Sản phẩm (`<EditForm key={selectedUserId} />`), loại bỏ hoàn toàn các đoạn code `useEffect` reset state thủ công rườm rà và dễ gây giật layout.\n2. Reset animation CSS hoặc media player khi nguồn phát thay đổi.',
      codeExample: `// Thay vì viết useEffect để setState lại form:
function UserProfileEditor({ userId }: { userId: string }) {
  // Khi userId đổi, Component tự unmount và tạo mới -> State form tự reset về ban đầu!
  return <UserProfileForm key={userId} userId={userId} />;
}`,
      codeLanguage: 'tsx',
    },

  'giải thích thuật toán diffing của react có độ phức tạp o(n) thay vì o(n^3) nhờ vào những giả định nào?':
    {
      answer:
        'Bài toán so sánh sự khác biệt tổng quát giữa 2 cây DOM bất kỳ có độ phức tạp lý thuyết là O(n^3). React giảm độ phức tạp xuống O(n) tuyến tính nhờ vào 2 giả định thực tế (Heuristic Assumptions):\n\n1. **Hai phần tử có kiểu khác nhau (Different Element Types) sẽ tạo ra hai cây hoàn toàn khác nhau**: Nếu `<div />` đổi thành `<span>` hoặc `<Header />` đổi thành `<Footer />`, React hủy bỏ toàn bộ cây con cũ và dựng cây con mới từ đầu mà không cần so sánh chi tiết từng nút bên trong.\n2. **Danh sách các phần tử con có thể giữ nguyên nhận diện ổn định qua các lần render nhờ vào thuộc tính `key`**: Khi có `key`, React so sánh trực tiếp các phần tử có cùng key thay vì so sánh theo thứ tự vị trí mảng, giúp xử lý chèn/xóa/đảo vị trí với chi phí O(n).',
      codeLanguage: 'text',
    },

  'client component có thể render server component dưới dạng children prop không? giải thích cơ chế slot pattern.':
    {
      answer:
        'HOÀN TOÀN ĐƯỢC và đây chính là kiến trúc khuyến nghị hàng đầu (Slot Pattern) của Next.js App Router!\n\n**Cơ chế hoạt động:**\n- Bạn KHÔNG THỂ `import ServerComponent from "./ServerComponent"` bên trong Client Component (vì sẽ biến ServerComponent thành Client Component).\n- Tuy nhiên, bạn có thể truyền Server Component vào Client Component thông qua `children` hoặc props từ một Server Component cha.\n- Server Component con được render trên server thành RSC payload trước, sau đó được truyền nguyên vẹn dưới dạng React Node vào Client Component. Khi Client Component re-render trên trình duyệt, nó không làm Server Component con bị render lại.',
      codeExample: `// 1. Client Component nhận Server Component qua children:
'use client';
export function ClientWrapper({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div>
      <button onClick={() => setIsOpen(!isOpen)}>Toggle</button>
      {isOpen && children} {/* Server Component con không bị biến thành Client! */}
    </div>
  );
}

// 2. Server Page kết hợp cả 2:
export default function Page() {
  return (
    <ClientWrapper>
      <HeavyServerList /> {/* Chạy 100% trên server! */}
    </ClientWrapper>
  );
}`,
      codeLanguage: 'tsx',
    },

  'làm thế nào để truy cập an toàn browser apis như `window` hay `localstorage` trong client component mà không bị hydration error?':
    {
      answer:
        'Lý do gây Hydration Mismatch: Client Component trong Next.js vẫn được pre-render thành HTML tĩnh trên server (SSR). Khi chạy trên Node.js server, `window` và `localStorage` không tồn tại (`undefined`). Nếu đọc `localStorage` ngay trong lần render đầu tiên, server HTML và client render sẽ có nội dung khác nhau, kích hoạt Hydration Warning.\n\n**Giải pháp chuẩn Senior:**\n1. Đọc dữ liệu browser bên trong `useEffect` (chỉ chạy sau khi component đã mount trên client).\n2. Hoặc sử dụng custom hook `useSyncExternalStore` với client snapshot và server snapshot riêng biệt.',
      codeExample: `// Cách 1: useEffect mount guard
function UserTheme() {
  const [theme, setTheme] = useState('light');
  useEffect(() => {
    const saved = localStorage.getItem('theme') || 'light';
    setTheme(saved);
  }, []);
  return <div>Theme: {theme}</div>;
}

// Cách 2: useSyncExternalStore (Chuẩn React 18/19)
const theme = useSyncExternalStore(
  subscribeTheme,
  () => localStorage.getItem('theme') ?? 'light', // Client
  () => 'light'                                   // Server fallback
);`,
      codeLanguage: 'tsx',
    },

  'khi cả layout.tsx và page.tsx đều định nghĩa title, cơ chế merge hoạt động ra sao và làm sao dùng title.template?':
    {
      answer:
        'Next.js tự động merge metadata theo thứ tự từ root layout xuống leaf page:\n1. Leaf page (`page.tsx`) sẽ ghi đè (override) metadata của layout cha nếu trùng thuộc tính.\n2. **`title.template`**: Trong layout cha (thường là `app/layout.tsx`), bạn định nghĩa `title: { template: "%s | DevPro", default: "DevPro Platform" }`. Khi `page.tsx` khai báo `title: "Interview Hub"`, tiêu đề cuối cùng hiển thị trên tab trình duyệt sẽ tự động được ghép thành `"Interview Hub | DevPro"`.',
      codeExample: `// app/layout.tsx
export const metadata: Metadata = {
  title: {
    template: '%s | DevPro Next.js Hub',
    default: 'DevPro - Developer Platform',
  },
};

// app/interview/page.tsx
export const metadata: Metadata = {
  title: 'Senior Interview Prep', // Browser tab hiển thị: "Senior Interview Prep | DevPro Next.js Hub"
};`,
      codeLanguage: 'tsx',
    },

  'temporal dead zone (tdz) bắt đầu và kết thúc chính xác ở đâu?': {
    answer:
      'Temporal Dead Zone (TDZ) là khoảng thời gian (hoặc vùng phạm vi logic) từ khi scope (khối lệnh) chứa biến được khởi tạo cho đến khi câu lệnh khai báo biến (`let` hoặc `const`) thực sự được thực thi.\n\n- **Bắt đầu**: Ngay khi engine bước vào block scope (khi biến được cấp phát bộ nhớ trong quá trình hoisting).\n- **Kết thúc**: Chính xác tại dòng code thực hiện phép gán/khai báo `let x = ...` hoặc `const x = ...`.\n\nNếu cố gắng truy cập biến khi đang trong TDZ, JavaScript engine sẽ ném ra lỗi `ReferenceError: Cannot access variable before initialization` thay vì trả về `undefined` như `var`.',
    codeExample: `function testTDZ() {
  // === TDZ của biến 'value' BẮT ĐẦU từ đây ===
  // console.log(value); // ❌ ReferenceError: Cannot access 'value' before initialization
  
  const greeting = "Hello"; // TDZ của value vẫn tiếp tục
  
  let value = 42; // === TDZ của 'value' KẾT THÚC tại đây ===
  console.log(value); // ✅ 42
}`,
    codeLanguage: 'javascript',
  },

  'làm thế nào để tạo một object thực sự immutable trong javascript?': {
    answer:
      '`Object.freeze(obj)` chỉ đóng băng nông (shallow freeze) các thuộc tính tầng 1; nếu object chứa object lồng nhau thì các thuộc tính con vẫn có thể bị mutate.\n\n**Để tạo object thực sự immutable 100%:**\n1. **Deep Freeze đệ quy**: Viết hàm duyệt qua toàn bộ keys và gọi `Object.freeze` cho mọi nested object/array.\n2. **Sử dụng thư viện chuyên dụng**: Dùng `Immer.js` (dựa trên Proxy) hoặc `Immutable.js` để đảm bảo structural sharing và hiệu năng cao mà không tốn công clone dữ liệu thủ công.',
    codeExample: `function deepFreeze<T extends object>(obj: T): Readonly<T> {
  Object.keys(obj).forEach((prop) => {
    const value = Reflect.get(obj, prop);
    if (value && typeof value === 'object' && !Object.isFrozen(value)) {
      deepFreeze(value);
    }
  });
  return Object.freeze(obj);
}

const config = deepFreeze({ api: { endpoint: 'https://devpro.io', timeout: 5000 } });
// config.api.timeout = 10000; // ❌ TypeError: Cannot assign to read only property in strict mode`,
    codeLanguage: 'typescript',
  },

  'từ react 17, việc chuyển event delegation từ `document` về root container giải quyết bài toán gì?':
    {
      answer:
        'Thay đổi này giải quyết triệt để bài toán **nhúng đồng thời nhiều phiên bản React trên cùng một trang** (Micro-Frontends & Multi-Version React Coexistence):\n\n- **Ở React 16 và cũ hơn**: Toàn bộ Synthetic Events được ủy quyền (delegated) tại `document`. Khi một ứng dụng React cũ nằm lồng trong một ứng dụng React mới, sự kiện `e.stopPropagation()` ở app con không thể ngăn chặn sự kiện nổi lên `document` của app cha, gây xung đột sự kiện trầm trọng.\n- **Từ React 17+**: Sự kiện được lắng nghe tại chính DOM Node gốc mà bạn mount app (`rootNode = ReactDOM.createRoot(container)`). Nhờ đó, hai ứng dụng React khác nhau trên cùng một trang có event tree hoàn toàn cô lập, không còn can thiệp lẫn nhau.',
      codeLanguage: 'tsx',
    },

  'cơ chế event pooling trong react 16 hoạt động ra sao và tại sao đã bị loại bỏ ở react 17?':
    {
      answer:
        '**Event Pooling (React 16)**: Nhằm tiết kiệm bộ nhớ trên các trình duyệt cũ, React tái sử dụng một đối tượng `SyntheticEvent` duy nhất cho nhiều sự kiện. Sau khi event handler chạy xong, toàn bộ thuộc tính của event object bị xóa về `null`. Nếu bạn cần đọc `e.target` trong một tác vụ bất đồng bộ (như `setTimeout` hay `fetch`), bạn bắt buộc phải gọi `e.persist()`.\n\n**Lý do loại bỏ ở React 17**: Trình thu gom rác (Garbage Collector) của các trình duyệt hiện đại đã cực kỳ tối ưu, chi phí cấp phát object không còn là nút thắt cổ chai. Việc giữ Event Pooling gây bẫy bug kinh điển cho developer khi xử lý async code. Do đó React 17 gỡ bỏ pooling hoàn toàn để code tự nhiên và dễ dự đoán.',
      codeLanguage: 'tsx',
    },

  'tại sao kỹ thuật nâng component con thành `children` lại giúp tối ưu hóa re-render tốt hơn dùng react.memo?':
    {
      answer:
        'Đây là kỹ thuật kiến trúc **"Component Composition as Performance Optimization"** (Same-Element Reference Bailout):\n\n- Khi một component con được truyền qua prop `children`, đối tượng React Element của nó được khởi tạo ở component cha bên ngoài, KHÔNG nằm trong scope render của component wrapper.\n- Khi component wrapper thay đổi state nội bộ và re-render, prop `children` của nó vẫn giữ nguyên tham chiếu object cũ (`prevProps.children === nextProps.children`).\n- React tự động nhận biết tham chiếu không đổi và **bỏ qua re-render cây con (bailout)** mà KHÔNG CẦN tốn chi phí so sánh nông (shallow comparison) props qua `React.memo`!',
      codeExample: `// ✅ Component con KHÔNG bị re-render khi count thay đổi:
export function ScrollTrackerWrapper({ children }: { children: React.ReactNode }) {
  const [scrollY, setScrollY] = useState(0);

  return (
    <div onScroll={(e) => setScrollY(e.currentTarget.scrollTop)}>
      <div className="status-bar">Vị trí cuộn: {scrollY}px</div>
      {/* children giữ nguyên tham chiếu cũ -> React bỏ qua render cây con: */}
      {children}
    </div>
  );
}`,
      codeLanguage: 'tsx',
    },

  'khi nào nên dùng interface và khi nào nên dùng type alias?': {
    answer:
      'Quy chuẩn TypeScript Senior:\n\n1. **Dùng `interface` khi**:\n- Định nghĩa hình dạng (shape) của Object, Class implementation (`implements`), hoặc Service contract.\n- Viết thư viện (Libraries/SDKs) cần tính năng **Declaration Merging** để người dùng có thể mở rộng interface sau này.\n\n2. **Dùng `type` khi**:\n- Định nghĩa Union Types (`"pending" | "success" | "error"`) hoặc Primitive Aliases.\n- Khai báo Tuples, Mapped Types, Conditional Types (`T extends U ? A : B`).\n- Sử dụng Utility Types phức tạp (`Pick`, `Omit`, `ReturnType`).',
    codeExample: `// Interface: Declaration Merging
interface AppConfig {
  apiUrl: string;
}
interface AppConfig {
  timeout: number; // Tự động gộp thành { apiUrl: string; timeout: number }
}

// Type: Hỗ trợ Union và Mapped Type
type AsyncState<T> = 
  | { status: 'loading'; data?: undefined; error?: undefined }
  | { status: 'success'; data: T; error?: undefined }
  | { status: 'error'; data?: undefined; error: Error };`,
    codeLanguage: 'typescript',
  },

  'any và unknown khác nhau như thế nào trong type narrowing?': {
    answer:
      'Khác biệt cốt lõi về độ an toàn kiểu (Type Safety):\n\n- **`any` (Tắt kiểm tra kiểu)**: Bỏ qua hoàn toàn hệ thống kiểm tra kiểu của TypeScript. Cho phép bạn gọi bất kỳ hàm nào hoặc truy cập bất kỳ thuộc tính nào mà không có cảnh báo compile-time, là nguồn gốc hàng đầu của lỗi `TypeError: Cannot read property of undefined` ở runtime.\n- **`unknown` (Top Type an toàn)**: Đại diện cho giá trị chưa rõ kiểu dữ liệu. TypeScript CẤM TUYỆT ĐỐI việc thực hiện bất kỳ thao tác nào (gọi hàm, truy cập property, gán cho biến khác) cho đến khi bạn thực hiện **Type Narrowing** (kiểm tra kiểu bằng `typeof`, `instanceof`, hoặc schema parser như Zod).',
    codeExample: `// ❌ any: Nguy cơ crash runtime không báo trước
function processBad(data: any) {
  return data.toUpperCase(); // Nếu data là number -> TypeError tại runtime!
}

// ✅ unknown: An toàn tuyệt đối, bắt buộc narrowing
function processGood(data: unknown): string {
  if (typeof data === 'string') {
    return data.toUpperCase(); // TypeScript cho phép vì đã thu hẹp thành string!
  }
  return String(data);
}`,
    codeLanguage: 'typescript',
  },

  'thư viện dataloader của facebook giải quyết bài toán n+1 trong graphql bằng cơ chế batching qua nodejs event loop tick như thế nào?':
    {
      answer:
        'Cơ chế hoạt động của DataLoader dựa trên **Tick Scheduling** trong NodeJS Event Loop:\n\n1. **Enqueue**: Khi các GraphQL resolvers chạy song song và gọi `loader.load(userId)`, DataLoader không bắn câu truy vấn SQL ngay mà xếp `userId` đó vào một hàng đợi (queue) nội bộ và trả về một Pending Promise.\n2. **Batching**: DataLoader lên lịch thực thi hàm nạp mảng qua `process.nextTick()` (hoặc microtask). Sau khi toàn bộ các resolver đồng bộ trong tick hiện tại đăng ký ID xong, DataLoader gom toàn bộ mảng IDs lại và bắn đúng **1 câu query duy nhất**: `SELECT * FROM users WHERE id IN (1, 2, 3, ...)`;\n3. **Dispatch & Cache**: Khi có kết quả, DataLoader phân phối lại từng object tương ứng để resolve từng Promise độc lập, đồng thời lưu cache trong phạm vi request đó.',
      codeLanguage: 'typescript',
    },
};

/**
 * Normalizes a question string for lookup.
 */
function normalizeQuery(q: string): string {
  return q.trim().toLowerCase().replace(/\s+/g, ' ');
}

/**
 * Resolves a high-quality technical answer for a given follow-up question.
 *
 * Rules:
 * 1. Curated follow-up items provide dedicated answers and specific code examples.
 * 2. Non-curated drill inquiries provide distinct, structured Interview Angles (Interviewer Mindset & Defense Strategy)
 *    WITHOUT copying the parent question's code example or regurgitating parent summary/deep-dive text.
 * 3. Follow-up #1, #2, #3 within the same question receive distinct, non-overlapping perspectives.
 */
export function resolveFollowUp(
  parentQuestion: InterviewQuestion,
  followUp: InterviewFollowUp,
  index = 0
): ResolvedFollowUp {
  // Case 1: Already structured object with explicit answer
  if (typeof followUp === 'object' && followUp !== null && followUp.answer) {
    return {
      questionText: followUp.question,
      answer: followUp.answer,
      codeExample: followUp.codeExample,
      codeLanguage: followUp.codeLanguage || 'tsx',
      isCurated: true,
    };
  }

  const questionText = typeof followUp === 'string' ? followUp : followUp.question;
  const normalized = normalizeQuery(questionText);

  // Case 2: Curated in knowledge base (exact match)
  if (CURATED_FOLLOW_UPS[normalized]) {
    const curated = CURATED_FOLLOW_UPS[normalized];
    return {
      questionText,
      answer: curated.answer,
      codeExample: curated.codeExample,
      codeLanguage: curated.codeLanguage || 'tsx',
      isCurated: true,
    };
  }

  // Case 3: Fuzzy check on curated keys
  for (const [key, val] of Object.entries(CURATED_FOLLOW_UPS)) {
    if (normalized.includes(key) || key.includes(normalized)) {
      return {
        questionText,
        answer: val.answer,
        codeExample: val.codeExample,
        codeLanguage: val.codeLanguage || 'tsx',
        isCurated: true,
      };
    }
  }

  // Case 4: Contextual Interview Drill & Key Defense Angles
  // NEVER copy parent question's codeExample or verbatim summary/deep-dive.
  const keywords = (parentQuestion.expectedKeywords || []).slice(0, 4);
  const keywordBadge =
    keywords.length > 0 ? keywords.join(' · ') : parentQuestion.category;

  let interviewerIntent = '';
  let keyDefensePoints = '';
  let seniorAdvice = '';

  // Differentiate angle based on question text patterns and index
  if (/có thể .* không|được không|nên .* không|khi nào nên/i.test(questionText)) {
    interviewerIntent =
      'Kiểm tra năng lực **Cân nhắc Đánh đổi (Trade-off Analysis)** và tư duy ra quyết định kiến trúc: Liệu bạn có biết khi nào giải pháp này phản tác dụng (anti-pattern) hay không.';
    if (index === 0) {
      keyDefensePoints =
        `- **Ranh giới áp dụng**: Xác định rõ điều kiện tiên quyết khi áp dụng phương án này (dựa trên quy mô dữ liệu, tần suất truy cập và chi phí bảo trì).\n` +
        `- **Đánh đổi trực tiếp**: So sánh chi phí tài nguyên (CPU/RAM/Network overhead) so với lợi ích thu được. Tránh tối ưu hóa sớm (premature optimization).`;
      seniorAdvice =
        'Trả lời theo công thức: *"Về mặt lý thuyết là có thể, nhưng trong thực tế tôi sẽ cân nhắc dựa trên 2 yếu tố chính: tính đóng gói của component và độ phức tạp khi debug."*';
    } else {
      keyDefensePoints =
        `- **Trường hợp biên (Edge Cases)**: Phân tích kịch bản khi hệ thống tải cao đột biến hoặc dữ liệu không đồng nhất.\n` +
        `- **Phương án thay thế (Alternatives)**: Đề xuất ít nhất 1 phương án dự phòng chuẩn mực hơn trong hệ sinh thái hiện đại.`;
      seniorAdvice =
        'Nhấn mạnh vào khả năng kiểm soát nợ kỹ thuật (Technical Debt) và tính dễ đọc của mã nguồn cho đồng đội.';
    }
  } else if (/tại sao|nguyên nhân|vì sao|khác gì|khác nhau/i.test(questionText)) {
    interviewerIntent =
      'Đánh giá độ sâu hiểu biết về **Cơ chế nội tại bên dưới (Underlying Runtime/Engine Mechanism)** thay vì chỉ thuộc lòng cú pháp bề nổi.';
    if (index === 0) {
      keyDefensePoints =
        `- **Cơ chế tầng sâu**: Bóc tách nguyên nhân bắt nguồn từ quy chuẩn ngôn ngữ, cấu trúc bộ nhớ heap, hoặc luồng xử lý của compiler/runtime engine.\n` +
        `- **Tính nhất quán dữ liệu**: Giải thích cách cơ chế này bảo vệ ứng dụng khỏi các lỗi bất đồng bộ hoặc trạng thái không hợp lệ.`;
      seniorAdvice =
        'Bắt đầu bằng một nhận định ngắn gọn về bản chất (1 câu cốt lõi), sau đó mới đi vào chi tiết kỹ thuật 2-3 luận điểm.';
    } else {
      keyDefensePoints =
        `- **Tác động hiệu năng thực tế**: Chỉ ra sự khác biệt về độ trễ, số chu kỳ CPU hoặc lưu lượng truyền tải mạng giữa các cách tiếp cận.\n` +
        `- **Rủi ro hồi quy (Regression Risks)**: Cảnh báo những lỗi tiềm ẩn có thể phát sinh nếu hiểu sai bản chất của cơ chế này.`;
      seniorAdvice =
        'Đưa ra ví dụ so sánh trực quan hoặc đối chiếu với một tình huống lỗi thực tế bạn từng gặp trong dự án production.';
    }
  } else {
    interviewerIntent =
      'Kiểm tra kinh nghiệm thực chiến về **Quy trình triển khai, Đo lường & Best Practices** trong môi trường doanh nghiệp quy mô lớn.';
    if (index === 0) {
      keyDefensePoints =
        `- **Quy trình chuẩn 3 bước**: Nhận diện vấn đề -> Đo lường định lượng bằng công cụ (Profiling/Monitoring) -> Áp dụng giải pháp bền vững.\n` +
        `- **Nguyên lý thiết kế**: Đảm bảo giải pháp tuân thủ nguyên tắc Single Responsibility và Separation of Concerns.`;
      seniorAdvice =
        'Luôn nhấn mạnh việc đo lường số liệu thực tế trước khi đưa ra kết luận hoặc quyết định refactor.';
    } else {
      keyDefensePoints =
        `- **Khả năng quan sát & Giám sát (Observability)**: Cách thiết lập metrics, logs, hoặc cảnh báo để phát hiện lỗi từ sớm trên production.\n` +
        `- **Khả năng mở rộng (Scalability)**: Giải pháp hoạt động ra sao khi lượng người dùng hoặc dữ liệu tăng gấp 10-100 lần.`;
      seniorAdvice =
        'Thể hiện góc nhìn của Senior Engineer: không chỉ giải quyết bài toán hiện tại mà còn dự liệu khả năng mở rộng trong tương lai.';
    }
  }

  const answerContent =
    `**🎯 Mục tiêu đánh giá của Người phỏng vấn:**\n${interviewerIntent}\n\n` +
    `**💡 Luận điểm then chốt cần trình bày:**\n${keyDefensePoints}\n\n` +
    `**⚡ Trọng tâm phản xạ:** ${seniorAdvice}\n\n` +
    `📌 *Từ khóa then chốt:* **${keywordBadge}**`;

  return {
    questionText,
    answer: answerContent,
    codeExample: undefined, // Never reuse parent's codeExample!
    codeLanguage: undefined,
    isCurated: false,
  };
}
