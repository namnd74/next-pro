import fs from 'node:fs';
import path from 'node:path';

const jsonDir = path.resolve('src/features/interview/data/json');

function updateBank(fileName, updates) {
  const filePath = path.join(jsonDir, fileName);
  const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));

  let count = 0;
  for (const q of data) {
    if (updates[q.id]) {
      const u = updates[q.id];
      if (!q.seniorAnswer) q.seniorAnswer = {};
      if (u.diagram) q.seniorAnswer.diagram = u.diagram;
      if (u.benchmark) q.seniorAnswer.benchmark = u.benchmark;
      if (u.codeDiff) q.seniorAnswer.codeDiff = u.codeDiff;
      count++;
    }
  }

  fs.writeFileSync(filePath, JSON.stringify(data, null, 2) + '\n', 'utf8');
  console.log(`[${fileName}] Updated ${count} questions.`);
}

// ==========================================
// 1. REACT & REACT 19
// ==========================================
const reactUpdates = {
  'react-005': {
    diagram: {
      type: 'mermaid',
      title: 'Thuật Toán Reconciliation & Vai Trò Của Key Prop Trong React',
      caption: 'Key ổn định giúp React đối chiếu đúng Fiber Node cũ và mới, tránh việc hủy và tạo lại toàn bộ DOM con',
      code: `flowchart TD
    subgraph BadKey ["Không Có Key Hoặc Dùng Index (Nguy Hiểm)"]
        OldList["Cũ: [A (idx 0), B (idx 1), C (idx 2)]"]
        Insert["Chèn X vào đầu danh sách"]
        NewList["Mới: [X (idx 0), A (idx 1), B (idx 2), C (idx 3)]"]
        OldList -.->|"React đối chiếu theo Index: 0->0, 1->1, 2->2"| Mutate["Phải Re-render và mutate toàn bộ DOM con!"]
    end

    subgraph GoodKey ["Dùng Unique ID (key='user_101')"]
        OldKeys["Cũ: [id_1, id_2, id_3]"]
        NewKeys["Mới: [id_new, id_1, id_2, id_3]"]
        OldKeys ===>|"React nhận diện id_1, id_2, id_3 giữ nguyên"| Preserve["Chỉ cần chèn 1 DOM node id_new, giữ nguyên các node cũ!"]
    end`
    },
    benchmark: {
      title: 'Hiệu Năng Render Danh Sách 1,000 Phần Tử: Key ID vs Index',
      caption: 'Đo lường thời gian Re-render và số lượng DOM Mutation khi chèn phần tử vào đầu danh sách',
      options: [
        {
          name: 'Sử dụng Unique Key (Item ID)',
          badge: 'Chuẩn Production',
          isRecommended: true,
          metrics: [
            { label: 'Tốc độ Re-render', value: 98, displayValue: '< 2ms', color: 'emerald' },
            { label: 'Số thao tác DOM Mutation', value: 99, displayValue: 'Chỉ 1 lần INSERT', color: 'emerald' },
            { label: 'Bảo toàn Local State (Input, Checkbox)', value: 100, displayValue: '100% Chính xác', color: 'emerald' }
          ],
          pros: ['Chỉ chèn đúng node mới vào DOM', 'Không bị lỗi nhảy state giữa các hàng trong bảng'],
          cons: ['Dữ liệu backend bắt buộc phải cung cấp ID duy nhất']
        },
        {
          name: 'Dùng Array Index làm Key',
          badge: 'Anti-pattern nguy hiểm',
          metrics: [
            { label: 'Tốc độ Re-render', value: 20, displayValue: '> 45ms', color: 'rose' },
            { label: 'Số thao tác DOM Mutation', value: 10, displayValue: '1,000 lần UPDATE', color: 'rose' },
            { label: 'Bảo toàn Local State', value: 0, displayValue: 'Bị sai lệch state', color: 'rose' }
          ],
          pros: ['Tiện lợi khi viết nhanh component tĩnh'],
          cons: ['Làm React re-render lại toàn bộ 1,000 phần tử phía sau', 'Gây lỗi bug tráo đổi dữ liệu người dùng đang gõ dở trong input']
        }
      ]
    }
  }
};

const react19Updates = {
  'r19-05': {
    diagram: {
      type: 'pipeline',
      title: 'Vòng Đời Thực Thi Server Actions & useActionState trong React 19',
      caption: 'Luồng gửi Form, thực thi hàm bất đồng bộ trên Server và tự động làm mới giao diện (RSC Revalidation)',
      stages: [
        {
          name: '1. Form Submit / Trigger',
          tool: 'Browser DOM',
          icon: 'Send',
          description: 'Người dùng submit form hoặc gọi action. useActionState thiết lập cờ isPending = true và kích hoạt Optimistic UI nếu có.',
          metric: 'isPending = true'
        },
        {
          name: '2. RPC POST Request',
          tool: 'Fetch / Next.js Runtime',
          icon: 'Radio',
          description: 'Trình duyệt tự động đóng gói FormData và gửi HTTP POST request ngầm tới Server Action endpoint.',
          metric: 'Multipart/form'
        },
        {
          name: '3. Server Execution',
          tool: 'Node.js / Edge Runtime',
          icon: 'Cpu',
          description: 'Hàm "use server" thực thi: Xác thực người dùng, validate Zod schema, gọi Database mutation trong 1 transaction an toàn.',
          metric: 'DB Mutation'
        },
        {
          name: '4. Revalidation & RSC Stream',
          tool: 'React Server Components',
          icon: 'RefreshCw',
          description: 'Server kích hoạt revalidatePath() hoặc revalidateTag(). Render lại các Server Components bị ảnh hưởng và stream payload JSON về client.',
          metric: 'Zero Bundle'
        },
        {
          name: '5. UI Update & Reconciliation',
          tool: 'useActionState Hook',
          icon: 'CheckCircle',
          description: 'Client nhận payload mới, tự động cập nhật state kết quả [state, formAction, isPending], tắt cờ loading và render UI mới.',
          metric: 'Smooth Transition'
        }
      ]
    }
  },

  'int-02': {
    diagram: {
      type: 'mermaid',
      title: 'Cơ Chế useOptimistic Trong React 19: Phản Hồi Tức Thì Không Chờ Mạng',
      caption: 'Cập nhật giao diện ngay lập tức trong 0ms và tự động hoàn tác (Rollback) nếu Server Action trả về lỗi',
      code: `flowchart TD
    User["Người dùng bấm Thích (Like)"] --> OptUpdate["useOptimistic cập nhật UI ngay lập tức: 42 -> 43 Likes (0ms)"]
    OptUpdate --> ServerCall["Gửi request ngầm lên Server Action"]

    ServerCall --> CheckResult{"Kết Quả Server"}

    CheckResult -->|"Thành Công (200 OK)"| Confirm["Cố định State chính thức: 43 Likes"]
    CheckResult -->|"Thất Bại (Mạng đứt / 500 Error)"| Rollback["React tự động Rollback về trạng thái cũ: 42 Likes + Hiện thông báo lỗi"]`
    }
  }
};

// ==========================================
// 2. NEXT.JS & APP ROUTER
// ==========================================
const nextjsUpdates = {
  'next-002': {
    diagram: {
      type: 'mermaid',
      title: 'Ranh Giới Kiến Trúc "use client" Trong Next.js App Router',
      caption: '"use client" không biến toàn bộ component thành chạy ở browser; nó tạo ranh giới phân tách mã nguồn đóng gói vào Client Bundle',
      code: `flowchart TD
    subgraph ServerOnly ["Server Component Tree (Zero JavaScript Bundle cho Client)"]
        Layout["RootLayout (Server Component)\n- Đọc Database trực tiếp\n- Đọc cookies / headers"]
        Page["ProductPage (Server Component)\n- Fetch API bí mật bằng API Key nội bộ"]
        Layout --> Page
    end

    subgraph Boundary ["'use client' Boundary"]
        Page -->|"Truyền dữ liệu JSON props qua ranh giới"| ClientWrapper["AddToCartButton ('use client')\n- Chứa onClick handler\n- Sử dụng useState, useEffect\n- Bundle mã nguồn JS xuống Browser"]
    end

    subgraph ClientChildren ["Lồng Server Component vào Client Component làm Children"]
        ClientWrapper -.->|"Lồng dạng {children}"| ServerDetail["ProductDetail (Server Component vẫn giữ nguyên Zero JS!)"]
    end`
    }
  },

  'next-004': {
    benchmark: {
      title: 'Ma trận So Sánh Các Chiến Lược Rendering Trong Next.js',
      caption: 'Đánh giá đánh đổi giữa tốc độ TTFB, tải chịu đựng của Server và độ tươi mới của dữ liệu',
      options: [
        {
          name: 'Static Site Generation (SSG / Pre-rendering)',
          badge: 'Siêu tốc độ TTFB',
          isRecommended: true,
          metrics: [
            { label: 'Tốc độ phản hồi TTFB', value: 99, displayValue: '< 10ms (CDN Edge)', color: 'emerald' },
            { label: 'Tải Server Database', value: 100, displayValue: 'Zero DB Load', color: 'emerald' },
            { label: 'Độ tươi mới của dữ liệu', value: 40, displayValue: 'Cần Revalidate (ISR)', color: 'amber' }
          ],
          pros: ['Phục vụ từ CDN toàn cầu với chi phí hạ tầng tối thiểu', 'Không bao giờ sập khi hàng triệu người cùng vào đọc trang bài viết'],
          cons: ['Dữ liệu không thể cá nhân hóa theo từng tài khoản đăng nhập']
        },
        {
          name: 'Server-Side Rendering (SSR / Dynamic Rendering)',
          badge: 'Dữ liệu thời gian thực',
          metrics: [
            { label: 'Tốc độ phản hồi TTFB', value: 65, displayValue: '~150-300ms', color: 'amber' },
            { label: 'Tải Server Database', value: 30, displayValue: 'Truy vấn mỗi request', color: 'rose' },
            { label: 'Độ tươi mới của dữ liệu', value: 100, displayValue: 'Thời gian thực 100%', color: 'emerald' }
          ],
          pros: ['Dữ liệu luôn mới nhất, đọc được cookie và hiển thị giao diện cá nhân hóa theo user'],
          cons: ['Server Node.js phải tính toán render lại HTML cho mọi request, tiêu tốn CPU']
        }
      ]
    }
  }
};

const nextjsAppRouterUpdates = {
  'int-01': {
    diagram: {
      type: 'mermaid',
      title: 'So Sánh React Server Components (RSC) vs SSR Cổ Điển',
      caption: 'SSR trả về chuỗi HTML tĩnh; RSC trả về luồng cấu trúc JSON ảo (Virtual DOM Tree) kết hợp trực tiếp với cây Client',
      code: `flowchart LR
    subgraph TraditionalSSR ["SSR Cổ Điển (Pages Router)"]
        Req1["Request"] --> Render1["Node.js render toàn bộ Component thành HTML string"]
        Render1 --> Hydrate1["Browser tải toàn bộ JS Bundle của TẤT CẢ components để Hydrate lại"]
    end

    subgraph RSCModel ["React Server Components (App Router)"]
        Req2["Request"] --> Render2["Server Components chỉ chạy trên Server -> Sinh RSC Payload JSON"]
        Render2 --> Stream2["Chỉ tải JS Bundle của những Component có 'use client' (Giảm 50-80% JS)"]
    end`
    }
  },

  'int-04': {
    diagram: {
      type: 'mermaid',
      title: 'Kiến Trúc Partial Prerendering (PPR) Trong Next.js',
      caption: 'Kết hợp vỏ HTML tĩnh siêu tốc (Static Shell) từ CDN với các lỗ động (Dynamic Holes) được stream qua HTTP chunks',
      code: `flowchart TD
    Request["Client Request tới Trang Sản Phẩm"] --> EdgeCDN["Edge CDN"]

    subgraph InstantShell ["Phần Tĩnh (Static Shell - Trả Về Trong 10ms)"]
        EdgeCDN --> Shell["Gửi ngay lập tức: Navbar, Footer, Khung sản phẩm, Loading Skeleton"]
    end

    subgraph StreamingHole ["Phần Động (Dynamic Holes - Stream Tiếp Tục)"]
        EdgeCDN --> ServerAction["Server tính toán song song: Giá tiền khuyến mãi, Giỏ hàng người dùng"]
        ServerAction -->|"HTTP Streaming Chunks"| StreamData["Thay thế Skeleton bằng dữ liệu thực mà không cần tải lại trang!"]
    end`
    }
  }
};

// ==========================================
// 3. TYPESCRIPT & JAVASCRIPT
// ==========================================
const tsUpdates = {
  'ts-003': {
    diagram: {
      type: 'mermaid',
      title: 'Cây Phân Cấp Kiểu Dữ Liệu TypeScript: any vs unknown vs never',
      caption: 'any làm vô hiệu hóa trình biên dịch; unknown là Top Type an toàn; never là Bottom Type không thể chứa giá trị',
      code: `flowchart TD
    Top["Top Types (Bao quát mọi giá trị)"]
    Top --> Unknown["unknown (An toàn tuyệt đối - Bắt buộc type narrowing)"]
    Top --> Any["any (Vô hiệu hóa Type-Checker - Nguồn gốc gây crash runtime)"]

    Unknown --> Primitive["Kiểu cụ thể: string | number | boolean | object"]
    Any -.->|"Bỏ qua mọi kiểm tra"| Primitive

    Primitive --> Never["never (Bottom Type - Không thể gán giá trị, dùng cho Exhaustive Check)"]`
    },
    codeDiff: {
      title: 'Sử Dụng any Cẩu Thả vs Kỷ Luật unknown Chuẩn Matt Pocock',
      language: 'typescript',
      antiPattern: {
        title: '❌ Anti-Pattern: Dùng any để bypass lỗi linter (Gây sập ứng dụng production)',
        code: `// NGUY HIỂM: any che giấu lỗi, gọi hàm không tồn tại vẫn pass typecheck!
async function fetchUserData(url: string): Promise<any> {
  const res = await fetch(url);
  return await res.json();
}

const user = await fetchUserData('/api/profile');
// SẬP RUNTIME TRÊN PRODUCTION: user.getAge is not a function!
console.log(user.getAge().toUpperCase());`,
        explanation: 'Từ khóa `any` thông báo với TypeScript trình biên dịch hãy "nhắm mắt làm ngơ". Không có bất kỳ cảnh báo nào được đưa ra khi bạn gõ sai tên thuộc tính hoặc gọi hàm không tồn tại.'
      },
      seniorSolution: {
        title: '✅ Senior Solution: Dùng unknown kết hợp Type Narrowing (hoặc Zod Validation)',
        code: `// CHUẨN SENIOR (Matt Pocock): unknown ép buộc lập trình viên phải kiểm tra trước khi dùng
interface User {
  id: string;
  name: string;
}

function isUser(data: unknown): data is User {
  return typeof data === 'object' && data !== null && 'id' in data && 'name' in data;
}

const raw: unknown = await (await fetch('/api/profile')).json();

if (isUser(raw)) {
  // TypeScript tự động suy luận an toàn 100% trong block này:
  console.log(raw.name.toUpperCase());
} else {
  throw new Error('Dữ liệu API trả về không đúng định dạng User!');
}`,
        explanation: 'Kiểu `unknown` bảo vệ hệ thống tuyệt đối. TypeScript sẽ từ chối biên dịch nếu bạn cố tình truy cập thuộc tính trên một biến `unknown` mà chưa thu hẹp kiểu (Type Narrowing) bằng Type Guard.'
      }
    }
  },

  'ts-004': {
    diagram: {
      type: 'mermaid',
      title: 'Mẫu Thiết Kế Discriminated Unions & Type Narrowing Trong TypeScript',
      caption: 'Sử dụng trường phân biệt duy nhất (ví dụ: type hoặc status) để trình biên dịch tự động suy luận kiểu an toàn',
      code: `flowchart TD
    Event["Kiểu Union: AppState = LoadingState | SuccessState | ErrorState"] --> Switch{"switch (state.status)"}

    Switch -->|"case 'loading'"| L["TypeScript biết: state là LoadingState\n(Chỉ có: { status: 'loading' })"]
    Switch -->|"case 'success'"| S["TypeScript biết: state là SuccessState\n(Có thêm trường data: User[])"]
    Switch -->|"case 'error'"| E["TypeScript biết: state là ErrorState\n(Có thêm trường message: string)"]
    Switch -->|"default"| N["Exhaustive Check: const _check: never = state"]`
    }
  }
};

const jsUpdates = {
  'js-038': {
    diagram: {
      type: 'mermaid',
      title: 'Ba Pha Lan Truyền Sự Kiện Trong DOM (DOM Event Flow) & Event Delegation',
      caption: 'Pha 1: Capturing (từ Window xuống target) -> Pha 2: Target -> Pha 3: Bubbling (từ target ngược lên Window)',
      code: `flowchart TD
    Win["Window / Document"] --> Body["<body>"]
    Body --> Parent["<div class='container'> (Nơi gắn 1 Event Delegation duy nhất)"]
    Parent --> Button["<button id='btn-submit'> (Target Element)"]

    subgraph Cap ["1. Capturing Phase (Lan truyền từ trên xuống)"]
        Win -.-> Body
        Body -.-> Parent
        Parent -.-> Button
    end

    subgraph Tar ["2. Target Phase"]
        Button === Button
    end

    subgraph Bub ["3. Bubbling Phase (Nổi bọt ngược lên trên)"]
        Button ==> Parent
        Parent ==> Body
        Body ==> Win
    end`
    }
  },

  'js-067': {
    diagram: {
      type: 'mermaid',
      title: 'Phân Biệt Hàng Đợi Vi Tác Vụ (Microtask) vs Đại Tác Vụ (Macrotask)',
      caption: 'Event Loop luôn rút cạn toàn bộ Microtask Queue trước khi lấy 1 Macrotask tiếp theo ra thực thi',
      code: `flowchart TD
    CallStack["Call Stack (Thực thi mã đồng bộ - Synchronous Code)"] --> Empty{"Call Stack Rỗng?"}
    
    Empty -->|"Có"| MicroLoop["Duyệt và thực thi TOÀN BỘ Microtask Queue\n- Promise.then / catch / finally\n- queueMicrotask()\n- MutationObserver"]
    
    MicroLoop --> RenderCheck{"Đến thời điểm Render màn hình?"}
    RenderCheck -->|"Có (16.6ms)"| RAF["Chạy requestAnimationFrame + Render lại giao diện"]
    RenderCheck -->|"Không"| MacroTask["Lấy duy nhất 1 Macrotask ra thực thi:\n- setTimeout / setInterval callback\n- I/O event / MessageChannel"]
    
    RAF --> MacroTask
    MacroTask --> CallStack`
    }
  }
};

// ==========================================
// 4. STATE MANAGEMENT, VUE, ANGULAR
// ==========================================
const stateUpdates = {
  'state-001': {
    diagram: {
      type: 'mermaid',
      title: 'So Sánh Luồng Dữ Liệu: Redux Tập Trung vs Zustand Phân Mảnh Tinh Gọn',
      caption: 'Redux bắt buộc luồng một chiều nghiêm ngặt (Action ➔ Middleware ➔ Reducer ➔ Store); Zustand sử dụng atomic hook proxy',
      code: `flowchart TD
    subgraph ReduxFlow ["Redux Architecture (Nghiêm ngặt, Boilerplate)"]
        UI1["React View"] -->|"dispatch(action)"| Mid["Middleware (Thunk / Saga)"]
        Mid --> Reducer["Pure Reducer Function"]
        Reducer --> Store1["Single Immutable Store"]
        Store1 -->|"useSelector subscription"| UI1
    end

    subgraph ZustandFlow ["Zustand Architecture (Tinh gọn, Không Boilerplate)"]
        UI2["React View"] -->|"Gọi trực tiếp: useStore.getState().action()"| Store2["Zustand Store Hook (Proxy)"]
        Store2 -->|"Chỉ re-render component đăng ký selector"| UI2
    end`
    },
    benchmark: {
      title: 'Đánh Giá Thư Viện State Management Trong Ứng Dụng Quy Mô Lớn',
      caption: 'Kích thước bundle, lượng boilerplate và độ phức tạp khi quản lý state bất đồng bộ',
      options: [
        {
          name: 'Zustand + TanStack Query',
          badge: 'Combo Chuẩn Hiện Đại 2026',
          isRecommended: true,
          metrics: [
            { label: 'Kích thước Bundle Size', value: 98, displayValue: '~1.5 KB', color: 'emerald' },
            { label: 'Tối ưu hóa Re-render tự động', value: 95, displayValue: 'Chọn lọc qua Selector', color: 'emerald' },
            { label: 'Lượng mã nguồn Boilerplate', value: 95, displayValue: 'Cực kỳ ít', color: 'emerald' }
          ],
          pros: ['Tách biệt hoàn toàn giữa Server Cache (TanStack Query) và Client State (Zustand)', 'Không cần Provider bao bọc ngoài app'],
          cons: ['Cần kỷ luật phân chia store rõ ràng trong dự án có hàng trăm lập trình viên']
        },
        {
          name: 'Redux Toolkit (RTK)',
          badge: 'Enterprise Classic',
          metrics: [
            { label: 'Kích thước Bundle Size', value: 50, displayValue: '~12 KB', color: 'amber' },
            { label: 'Hệ thống DevTools Time-travel', value: 100, displayValue: 'Đỉnh cao', color: 'emerald' },
            { label: 'Lượng mã nguồn Boilerplate', value: 40, displayValue: 'Vẫn tốn action/slice', color: 'amber' }
          ],
          pros: ['Redux DevTools hỗ trợ tua ngược thời gian (Time-travel debugging) tốt nhất ngành', 'Cấu trúc slice quy củ cho doanh nghiệp ngân hàng'],
          cons: ['Cồng kềnh cho các tác vụ lưu trữ trạng thái đơn giản như modal hay sidebar']
        }
      ]
    }
  }
};

const vueUpdates = {
  'vue-014': {
    diagram: {
      type: 'mermaid',
      title: 'Hệ Thống Phản Ứng (Reactivity System) Trong Vue 3 Dựa Trên Proxy',
      caption: 'Khi đọc dữ liệu (get) kích hoạt track() thu thập Effect; khi sửa dữ liệu (set) kích hoạt trigger() chạy lại Component Render',
      code: `flowchart TD
    Client["Mã JavaScript tương tác với reactive()"]

    subgraph ProxyHandler ["ES6 Proxy Trap"]
        Get["get(target, key) -> track(target, key)"]
        Set["set(target, key, val) -> trigger(target, key)"]
    end

    subgraph DepMap ["Hệ Thống Theo Dõi (WeakMap / Map / Set)"]
        Get -->|"Ghi nhớ Effect hiện tại vào Dependency Set"| TargetMap["targetMap: WeakMap<Target, Map<Key, Set<Effect>>>"]
        Set -->|"Tìm và kích hoạt tất cả Effect phụ thuộc"| TargetMap
    end

    TargetMap -->|"Kích hoạt cập nhật"| ReRender["Component Update / WatchEffect Chạy Lại (DOM Cập Nhật)"]`
    }
  }
};

const angularUpdates = {
  'ng-028': {
    diagram: {
      type: 'mermaid',
      title: 'Cơ Chế OnPush Change Detection Trong Angular',
      caption: 'Giảm 90% chi phí duyệt cây Component: Bỏ qua kiểm tra toàn bộ nhánh con trừ khi Input reference thay đổi hoặc có Event',
      code: `flowchart TD
    Root["Root Component"] --> Parent["Parent Component (Default Change Detection)"]
    Parent --> ChildA["Child A (ChangeDetectionStrategy.OnPush)"]
    Parent --> ChildB["Child B (Default)"]

    ChildA --> Grand1["Grandchild 1"]
    ChildA --> Grand2["Grandchild 2"]

    Event["Sự kiện click xảy ra ở Child B"] --> Check["Zone.js kích hoạt kiểm tra toàn bộ cây"]
    Check --> Parent
    Check --> ChildB
    Check -.->|"BỎ QUA TOÀN BỘ NHÁNH NÀY (Không có input ref đổi)!"| ChildA
    ChildA -.->|"Không tốn 1 chu kỳ CPU nào"| Grand1 & Grand2`
    }
  }
};

// ==========================================
// 5. CSS, HTML, BUILD TOOLS, MICRO FRONTEND
// ==========================================
const cssUpdates = {
  'css-005': {
    diagram: {
      type: 'mermaid',
      title: 'Mô Hình Hộp CSS (CSS Box Model: box-sizing: border-box vs content-box)',
      caption: 'Hiểu rõ các lớp viền: Content ➔ Padding ➔ Border ➔ Margin để tính toán chính xác kích thước layout',
      code: `flowchart TD
    subgraph BoxModel ["Cấu Trúc Các Lớp Trong Box Model"]
        Margin["Margin (Khoảng cách giữa các phần tử với nhau - Không có màu nền)"]
        Border["Border (Đường viền bao quanh phần tử)"]
        Padding["Padding (Khoảng cách đệm từ nội dung tới viền - Mang màu nền)"]
        Content["Content (Nội dung chữ, ảnh thực tế)"]

        Margin --> Border --> Padding --> Content
    end

    Explain["box-sizing: border-box (Khuyên dùng): Width thực tế = Content + Padding + Border cố định không bị phình to!"]`
    }
  }
};

const htmlUpdates = {
  'html-048': {
    diagram: {
      type: 'mermaid',
      title: 'So Sánh Luồng Tải Và Thực Thi Script: Standard vs defer vs async',
      caption: 'defer duy trì thứ tự và chờ DOM sẵn sàng; async tải song song và thực thi ngay khi vừa tải xong',
      code: `flowchart TD
    subgraph Standard ["<script src='...'> (Chặn hoàn toàn luồng HTML Parser)"]
        H1["HTML Parsing"] --> Block1["BỊ CHẶN (Tải script + Thực thi)"] --> H1Cont["Tiếp tục HTML Parsing"]
    end

    subgraph AsyncScript ["<script async src='...'> (Dành cho Tracking / Google Analytics độc lập)"]
        H2["HTML Parsing song song với Tải Script"] --> Exec2["Thực thi script NGAY khi tải xong (Vẫn chặn tạm thời HTML)"]
    end

    subgraph DeferScript ["<script defer src='...'> (Khuyên dùng cho ứng dụng web)"]
        H3["HTML Parsing diễn ra mượt mà 100%"] --> Exec3["Chỉ thực thi script sau khi toàn bộ HTML DOM đã sẵn sàng!"]
    end`
    }
  }
};

const buildToolsUpdates = {
  'build-001': {
    diagram: {
      type: 'mermaid',
      title: 'Kiến Trúc Vite On-Demand Native ESM vs Webpack Bundler Truyền Thống',
      caption: 'Webpack phải gom toàn bộ mã nguồn trước khi khởi động; Vite sử dụng native ESM trên trình duyệt và esbuild siêu tốc',
      code: `flowchart LR
    subgraph WebpackDev ["Webpack Dev Server (Gom gói toàn bộ trước - Khởi động chậm)"]
        Entry["Entry File"] --> ParseAll["Phân tích toàn bộ Dependency Graph (Hàng nghìn files)"]
        ParseAll --> Bundle["Tạo file Bundle khổng lồ trong RAM"]
        Bundle --> Server1["Server Sẵn Sàng (Mất 30s - 2 phút)"]
    end

    subgraph ViteDev ["Vite Dev Server (Native ESM - Khởi động tức thì < 200ms)"]
        Server2["Server Sẵn Sàng Ngay Lập Tức"] --> BrowserReq["Trình duyệt cần file nào mới gửi request file đó qua Native ESM"]
        BrowserReq --> OnDemand["Chuyển đổi file đơn lẻ on-demand bằng esbuild (Viết bằng Golang siêu nhanh)"]
    end`
    },
    benchmark: {
      title: 'So sánh Tốc Độ: Vite vs Webpack Trong Dự Án Quy Mô Lớn',
      caption: 'Đo lường thời gian khởi động Cold Start và thời gian Hot Module Replacement (HMR)',
      options: [
        {
          name: 'Vite (Native ESM + esbuild + Rollup)',
          badge: 'Chuẩn Modern Frontend',
          isRecommended: true,
          metrics: [
            { label: 'Thời gian Cold Start Dev Server', value: 99, displayValue: '< 300ms', color: 'emerald' },
            { label: 'Tốc độ cập nhật HMR', value: 98, displayValue: '< 50ms (Độc lập kích thước app)', color: 'emerald' },
            { label: 'Thời gian Build Production', value: 90, displayValue: 'Nhanh hơn 3-5 lần', color: 'emerald' }
          ],
          pros: ['Khởi động server gần như tức thì bất kể project có 100 hay 10,000 components', 'Cấu hình đơn giản và tích hợp sẵn TypeScript, JSX, CSS modules'],
          cons: ['Khi dev có thể sinh ra hàng trăm HTTP requests nhỏ lẻ trên tab Network']
        },
        {
          name: 'Webpack 5 (Classic Bundler)',
          badge: 'Cấu hình linh hoạt cao',
          metrics: [
            { label: 'Thời gian Cold Start Dev Server', value: 25, displayValue: '~45-90 giây', color: 'rose' },
            { label: 'Tốc độ cập nhật HMR', value: 50, displayValue: '~500ms - 2s', color: 'amber' },
            { label: 'Hệ sinh thái Plugin & Loader', value: 100, displayValue: 'Phong phú nhất', color: 'emerald' }
          ],
          pros: ['Khả năng tùy biến sâu không giới hạn, xử lý được mọi case legacy kỳ lạ nhất'],
          cons: ['Thời gian khởi động ban đầu rất lâu do phải phân tích toàn bộ cây phụ thuộc']
        }
      ]
    }
  }
};

const microFrontendUpdates = {
  'mfe-005': {
    diagram: {
      type: 'mermaid',
      title: 'Kiến Trúc Webpack Module Federation Trong Micro-Frontends',
      caption: 'Chia sẻ component và thư viện phụ thuộc (shared dependencies) theo thời gian thực tại runtime giữa Host và Remote Apps',
      code: `flowchart TD
    Browser["Trình duyệt người dùng"] --> Host["Host Application (Shell / Container App - Port 3000)"]

    subgraph Remotes ["Remote Micro-Frontends Độc Lập"]
        RemoteA["Checkout App (Port 3001)\nXuất bản: remoteEntry.js\nExposes: ./PaymentForm"]
        RemoteB["Catalog App (Port 3002)\nXuất bản: remoteEntry.js\nExposes: ./ProductCard"]
    end

    Host -->|"Tải động qua mạng: import('remoteA/PaymentForm')"| RemoteA
    Host -->|"Tải động qua mạng: import('remoteB/ProductCard')"| RemoteB

    subgraph Shared ["Shared Vendor Chunk"]
        Host & RemoteA & RemoteB -.->|"Dùng chung 1 bản sao React & React-DOM duy nhất (Singleton)"| SharedReact["Shared React 19 Instance (Không bị tải 3 lần)"]
    end`
    }
  }
};

// Execute updates for all 13 Batch A banks
updateBank('react-bank.json', reactUpdates);
updateBank('react19-core.json', react19Updates);
updateBank('nextjs-bank.json', nextjsUpdates);
updateBank('nextjs-app-router.json', nextjsAppRouterUpdates);
updateBank('typescript-bank.json', tsUpdates);
updateBank('javascript-bank.json', jsUpdates);
updateBank('state-management-bank.json', stateUpdates);
updateBank('vue-bank.json', vueUpdates);
updateBank('angular-bank.json', angularUpdates);
updateBank('css-bank.json', cssUpdates);
updateBank('html-bank.json', htmlUpdates);
updateBank('build-tools-bank.json', buildToolsUpdates);
updateBank('micro-frontend-bank.json', microFrontendUpdates);

console.log('✅ Batch A (13 Frontend Banks) completed successfully!');
