import { InterviewQuestion, InterviewFollowUp } from '../types';

export interface ResolvedFollowUp {
  questionText: string;
  answer: string;
  codeExample?: string;
  codeLanguage?: string;
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
    const value = (obj as any)[prop];
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
};

/**
 * Normalizes a question string for lookup.
 */
function normalizeQuery(q: string): string {
  return q.trim().toLowerCase().replace(/\s+/g, ' ');
}

/**
 * Resolves a high-quality technical answer for a given follow-up question.
 */
export function resolveFollowUp(
  parentQuestion: InterviewQuestion,
  followUp: InterviewFollowUp,
  _index?: number
): ResolvedFollowUp {
  // Case 1: Already structured object with explicit answer
  if (typeof followUp === 'object' && followUp !== null && followUp.answer) {
    return {
      questionText: followUp.question,
      answer: followUp.answer,
      codeExample: followUp.codeExample,
      codeLanguage: followUp.codeLanguage || 'tsx',
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
      };
    }
  }

  // Case 4: Intelligent, contextual technical breakdown
  const summary = parentQuestion.seniorAnswer?.summary || '';
  const deepDive = parentQuestion.seniorAnswer?.deepDive || '';
  const keywords = parentQuestion.expectedKeywords || [];
  const primaryPitfall = parentQuestion.pitfalls?.[0] || '';

  // Extract core technical premise from question
  let answerContent = '';

  if (/có thể .* không|được không|nên .* không/i.test(questionText)) {
    answerContent =
      `**Đánh giá kỹ thuật & Quyết định kiến trúc:**\n` +
      `Câu trả lời phụ thuộc vào mục tiêu tối ưu cụ thể, nhưng về mặt thiết kế hệ thống:\n` +
      `- Cần kiểm soát chặt chẽ ranh giới trách nhiệm (Separation of Concerns). ` +
      `Liên hệ trực tiếp với cơ chế: **${keywords.slice(0, 3).join(', ')}**.\n` +
      `- Bản chất giải pháp: ${summary}\n\n` +
      `**Khuyến nghị thực thi & Rủi ro:**\n` +
      `${deepDive.slice(0, 260)}...\n\n` +
      (primaryPitfall ? `⚠️ **Cạm bẫy cần tránh:** ${primaryPitfall}` : '');
  } else if (/tại sao|nguyên nhân|vì sao/i.test(questionText)) {
    answerContent =
      `**Cơ chế nền tảng (Underlying Mechanism):**\n` +
      `Nguyên nhân gốc rễ liên quan mật thiết đến cách runtime và compiler xử lý dữ liệu:\n` +
      `- ${summary}\n\n` +
      `**Phân tích sâu:**\n` +
      `- Khi thao tác với **${keywords.slice(0, 3).join(', ')}**, hệ thống cần đảm bảo tính nhất quán (consistency) và tối ưu hóa tài nguyên.\n` +
      `- ${deepDive.slice(0, 240)}...\n\n` +
      (primaryPitfall ? `⚠️ **Lưu ý trong Production:** ${primaryPitfall}` : '');
  } else {
    answerContent =
      `**Phân tích kỹ thuật chuyên sâu:**\n` +
      `Để xử lý hiệu quả yêu cầu này trong môi trường dự án lớn:\n` +
      `- **Cơ chế áp dụng:** ${summary}\n` +
      `- **Điểm mấu chốt:** Nắm vững các khái niệm cốt lõi bao gồm **${keywords.slice(0, 4).join(', ')}** để đưa ra quyết định cân đối giữa hiệu năng và tính bảo trì.\n\n` +
      `**Ngữ cảnh áp dụng thực tế:**\n` +
      `${deepDive.slice(0, 250)}...\n\n` +
      (primaryPitfall ? `⚠️ **Cạm bẫy thường gặp:** ${primaryPitfall}` : '');
  }

  return {
    questionText,
    answer: answerContent,
    codeExample: parentQuestion.seniorAnswer?.codeExample,
    codeLanguage: parentQuestion.seniorAnswer?.codeLanguage || 'tsx',
  };
}
