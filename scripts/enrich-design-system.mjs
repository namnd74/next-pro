import fs from 'node:fs';
import path from 'node:path';

const filePath = path.resolve('src/features/interview/data/json/frontend-system-design.json');
const questions = JSON.parse(fs.readFileSync(filePath, 'utf8'));

// 1. int-10: Next.js Multi-Tenant Auth Architecture
const qInt10 = questions.find((q) => q.id === 'int-10');
if (qInt10) {
  qInt10.seniorAnswer.diagram = {
    type: 'mermaid',
    title: 'Kiến Trúc Xác Thực & Phân Quyền Multi-Tenant 3 Lớp (Defense-in-Depth)',
    caption: 'Quy trình xác thực an toàn: Edge Middleware -> Data Access Layer (DAL) -> Tenant Isolation DB',
    code: `flowchart TD
    Client["Client (Browser)"] -->|"Request + HttpOnly Secure Cookie (JWT Session)"| Edge["Next.js Edge Middleware"]
    
    subgraph Layer1 ["Lớp 1: Edge Validation"]
      Edge -->|"1. Giải mã & kiểm tra chữ ký JWT"| EdgeCheck{"Session Hợp lệ?"}
      EdgeCheck -- "Hết hạn / Không có" --> RedirectAuth["Chuyển hướng /login"]
      EdgeCheck -- "Hợp lệ" --> Routing["Phân luồng Tenant Subdomain (tenant.app.com)"]
    end

    Routing --> ServerAction["Next.js Server Action / Route Handler"]

    subgraph Layer2 ["Lớp 2: Data Access Layer (withAuth)"]
      ServerAction -->|"2. withAuth(action, allowedRoles)"| RBACCheck{"Kiểm tra Role (Admin/Editor)"}
      RBACCheck -- "Không đủ quyền" --> Throw403["Throw 403 Forbidden"]
      RBACCheck -- "Đạt quyền" --> InjectContext["Tiêm TenantContext (tenant_id, user_id)"]
    end

    subgraph Layer3 ["Lớp 3: Database Isolation"]
      InjectContext -->|"3. Row-Level Security / Tenant Schema"| DB[(Database Cluster)]
      DB -->|"WHERE tenant_id = current_tenant"| IsolatedData["Dữ liệu Tenant an toàn (Zero Leak)"]
    end`,
  };
}

// 2. fsd-02: Offline-First & Realtime Sync Engine
const qFsd02 = questions.find((q) => q.id === 'fsd-02');
if (qFsd02) {
  qFsd02.seniorAnswer.diagram = {
    type: 'mermaid',
    title: 'Kiến Trúc Đồng Bộ Dữ Liệu Offline-First (Local-First Sync Engine)',
    caption: 'Mọi thao tác ghi xuống IndexedDB trước (0ms latency), hàng đợi Mutation Queue tự động sync khi online',
    code: `flowchart LR
    UI["Giao diện Người dùng (UI)"] -->|"1. Thao tác Ghi (0ms Latency)"| IDB["IndexedDB (Local Store)"]
    UI -->|"2. Đẩy Mutation"| Queue["Mutation Queue (FIFO)"]

    subgraph ClientSyncEngine ["Client Sync Engine (Service Worker)"]
      Queue -->|"3. Kiểm tra kết nối"| NetworkCheck{"Network Online?"}
      NetworkCheck -- "Offline" --> Idle["Lưu trữ cục bộ & Chờ sự kiện online"]
      NetworkCheck -- "Online" --> Worker["Background Sync Worker"]
    end

    Worker -->|"4. Gửi tuần tự (clientId, mutationId, version)"| ServerAPI["Server API Gateway"]

    subgraph BackendSync ["Server Conflict Resolution"]
      ServerAPI --> VersionCheck{"Version Khớp?"}
      VersionCheck -- "Khớp" --> ApplyDB["Áp dụng DB & Cập nhật Version mới"]
      VersionCheck -- "Xung đột (Conflict 409)" --> ConflictResolver["Conflict Resolver: Field-level Merge / CRDT"]
    end

    ApplyDB -->|"5. Sync Ack + New Version"| Queue
    Queue -->|"Xóa mutation đã sync thành công"| IDB`,
  };
}

// 3. fsd-03: Real-time Collaboration (Figma / Docs mini)
const qFsd03 = questions.find((q) => q.id === 'fsd-03');
if (qFsd03) {
  qFsd03.seniorAnswer.diagram = {
    type: 'mermaid',
    title: 'Kiến Trúc Cộng Tác Thời Gian Thực 2 Kênh (Real-time Multiplayer Architecture)',
    caption: 'Tách biệt kênh Ephemeral tần số cao (Cursor, Selection) và kênh Persistent CRDT (Tài liệu hội tụ)',
    code: `flowchart TD
    subgraph ClientA ["Người dùng A (Collaborator A)"]
      CursorA["Con trỏ chuột (Cursor 60fps)"]
      DocA["Tài liệu Yjs CRDT (Local State)"]
    end

    subgraph TransportLayers ["Hai Kênh Truyền Tải Riêng Biệt (WebSocket Multiplexing)"]
      subgraph EphemeralChannel ["Kênh Tạm Thời (Presence / Awareness)"]
        WS1["Tần số cao (60Hz) - Gói tin nhẹ, chấp nhận mất mát"]
      end
      subgraph PersistentChannel ["Kênh Dữ Liệu Bền Vững (CRDT Updates)"]
        WS2["Bảo đảm thứ tự & hội tụ toán học (State Vectors)"]
      end
    end

    subgraph ClientB ["Người dùng B (Collaborator B)"]
      CursorB["Vẽ con trỏ A lên Canvas riêng"]
      DocB["Tự động Merge không xung đột (CRDT Convergence)"]
    end

    CursorA --> WS1 --> CursorB
    DocA -->|"Update vector"| WS2 -->|"Broadcast diff"| DocB`,
  };
}

// 4. fsd-04: Real-Time Notification & Multi-tab Sync
const qFsd04 = questions.find((q) => q.id === 'fsd-04');
if (qFsd04) {
  qFsd04.seniorAnswer.diagram = {
    type: 'mermaid',
    title: 'Kiến Trúc Đồng Bộ Đa Tab & Đơn Kết Nối (Single Connection per Browser)',
    caption: 'Bầu chọn Tab Leader qua BroadcastChannel để chỉ duy trì 1 kết nối WebSocket duy nhất tới Server',
    code: `flowchart TD
    Server["Notification Server (WebSocket Cluster)"] <-->|"1 Duy nhất 1 kết nối WebSocket"| TabLeader["Tab 1 (Leader Tab)"]

    subgraph BrowserEnvironment ["Trình Duyệt Người Dùng (Cùng 1 User)"]
      TabLeader <-->|"BroadcastChannel Bus"| Tab2["Tab 2 (Follower Tab)"]
      TabLeader <-->|"BroadcastChannel Bus"| Tab3["Tab 3 (Follower Tab)"]
      TabLeader <-->|"BroadcastChannel Bus"| Tab4["Tab 4 (Follower Tab)"]
    end

    UserAction["User bấm Đã Đọc trên Tab 3"] -->|"Phát event NOTIFICATION_READ"| TabLeader
    TabLeader -->|"Đồng bộ badge -1 cho tất cả các Tab"| Tab2
    TabLeader -->|"Đồng bộ badge -1 cho tất cả các Tab"| Tab4
    TabLeader -->|"Gửi ACK lên Server"| Server`,
  };
}

// 5. fsd-05: Client-Side Telemetry & Web Vitals SDK
const qFsd05 = questions.find((q) => q.id === 'fsd-05');
if (qFsd05) {
  qFsd05.seniorAnswer.diagram = {
    type: 'mermaid',
    title: 'Kiến Trúc Client-Side Telemetry SDK & Real User Monitoring (RUM)',
    caption: 'Thu thập Core Web Vitals (LCP, INP, CLS) và gửi an toàn qua sendBeacon không block Main Thread',
    code: `flowchart LR
    subgraph BrowserEngine ["Trình Duyệt & Trải Nghiệm Người Dùng"]
      Obs["PerformanceObserver API (LCP, INP, CLS)"]
      Err["Global Error Listener (window.onerror)"]
    end

    subgraph TelemetrySDK ["Telemetry RUM SDK (Zero Impact)"]
      Obs -->|"Metrics"| Buffer["In-Memory Ring Buffer (Tối đa 100 events)"]
      Err -->|"Stack traces"| Buffer
      Buffer -->|"Batching định kỳ 30s"| Dispatcher{"Điều Kiện Gửi"}
    end

    subgraph TransportTier ["Tầng Truyền Tải An Toàn"]
      Dispatcher -- "Chạy bình thường" --> FetchReq["fetch() keepalive"]
      Dispatcher -- "Người dùng đóng tab / chuyển trang" --> Beacon["navigator.sendBeacon() (OS Network Queue)"]
    end

    FetchReq --> Collector["Telemetry Ingestion Gateway"]
    Beacon --> Collector`,
  };
}

// 6. Dedicated Design System Question: fsd-06
const hasDesignSystemQuestion = questions.some((q) => q.id === 'fsd-06');
if (!hasDesignSystemQuestion) {
  questions.push({
    id: 'fsd-06',
    category: 'frontend-system-design',
    level: 'lead',
    question: 'Thiết kế Kiến Trúc Design System Quy Mô Doanh Nghiệp (Multi-Brand, Multi-Theme, Design Tokens & CVA Component Architecture)?',
    interviewerIntent: 'Đánh giá tư duy thiết kế hệ thống Design System cấp độ Staff/Architect: Phân cấp Design Tokens, Headless UI Primitives, Multi-theme Dark/Light, Package Distribution và Zero-Runtime Overhead.',
    contextOrScenario: 'Doanh nghiệp sở hữu nhiều nhãn hàng (Multi-Brand: Fintech, E-commerce, Logistics) cần một Design System duy nhất, dễ dàng thay đổi thương hiệu, màu sắc, typography mà không phải code lại từ đầu các component phức tạp.',
    expectedKeywords: [
      'design tokens',
      'style dictionary',
      'global vs semantic vs component tokens',
      'cva (class-variance-authority)',
      'headless ui primitives',
      'multi-brand theming',
      'css variables architecture',
      'monorepo packaging',
    ],
    seniorAnswer: {
      summary: 'Kiến trúc Design System 4 tầng mở rộng: (1) Token Tier phân cấp 3 lớp (Global Tokens -> Semantic Tokens -> Component Tokens) biên dịch tự động qua Style Dictionary; (2) Primitive Tier sử dụng Headless UI (Radix UI / React Aria) phụ trách Accessibility (ARIA, Keyboard Navigation); (3) Styled Tier bọc bằng CVA (Class Variance Authority) định nghĩa các biến thể (variants, sizes, states); (4) Theme Engine can thiệp vào CSS Variables runtime cho phép chuyển đổi Brand/Theme tức thì với 0ms rebuild.',
      deepDive: 'Phân cấp Design Tokens là chìa khóa chống vỡ kiến trúc: Tuyệt đối không để Component tham chiếu trực tiếp Global Token (như color-blue-500). Thay vào đó: Global (blue-500: #3b82f6) -> Semantic (action-primary: var(--color-blue-500)) -> Component (button-bg: var(--action-primary)). Nhờ vậy, khi một Brand khác sử dụng màu xanh ngọc, ta chỉ cần thay đổi Semantic Mapping ở tầng Root mà không làm sửa đổi bất kỳ dòng code nào trong 100+ components.',
      codeExample: `// design-system/components/button.tsx
import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';

export const buttonVariants = cva(
  'inline-flex items-center justify-center font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        primary: 'bg-[var(--token-action-primary)] text-white hover:bg-[var(--token-action-primary-hover)]',
        secondary: 'bg-[var(--token-surface-subtle)] text-[var(--token-text-primary)] hover:bg-[var(--token-surface-hover)]',
        outline: 'border border-[var(--token-border-strong)] bg-transparent hover:bg-[var(--token-surface-subtle)]',
        destructive: 'bg-[var(--token-feedback-danger)] text-white hover:opacity-90',
      },
      size: {
        sm: 'h-8 px-3 text-xs rounded-[var(--token-radius-sm)]',
        md: 'h-10 px-4 text-sm rounded-[var(--token-radius-md)]',
        lg: 'h-12 px-6 text-base rounded-[var(--token-radius-lg)]',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  }
);`,
      diagram: {
        type: 'mermaid',
        title: 'Kiến Trúc Design System Doanh Nghiệp 4 Tầng (Enterprise Design System Engine)',
        caption: 'Phân cấp token 3 tầng qua Style Dictionary, kết hợp Headless UI Primitives và CVA Styling Variants',
        code: `flowchart TD
    subgraph TokenSource ["1. Nguồn Thiết Kế & Tokens"]
      Figma["Figma Tokens (Designers)"] -->|"Export JSON"| StyleDict["Style Dictionary Build Pipeline"]
    end

    subgraph TokenHierarchy ["2. Phân Cấp Design Tokens 3 Lớp"]
      StyleDict --> Global["Global Tokens (Màu thô: blue-500, gray-900, 16px)"]
      Global --> Semantic["Semantic Tokens (Ý nghĩa: action-primary, surface-bg, text-muted)"]
      Semantic --> ComponentTok["Component Tokens (button-bg, modal-radius, card-border)"]
    end

    subgraph RuntimeEngine ["3. Theme Engine & Runtime CSS Variables"]
      ComponentTok --> BrandA["Brand A Theme (:root[data-brand='fintech'])"]
      ComponentTok --> BrandB["Brand B Theme (:root[data-brand='retail'])"]
      ComponentTok --> DarkMode["Dark Mode Overrides (.dark)"]
    end

    subgraph ComponentTier ["4. Kiến Trúc Component (Headless + CVA)"]
      Headless["Headless UI Primitives (Radix / React Aria: ARIA & Keyboard Nav)"]
      CVA["CVA: Class Variance Authority (Variants: primary/outline, Sizes: sm/md/lg)"]
      Headless & CVA --> Components["Thư Viện Component (Button, Dialog, Select, Table)"]
    end

    RuntimeEngine --> Components
    Components --> Consumers["Ứng Dụng Web / Mobile Khách Hàng"]`,
      },
    },
    pitfalls: [
      'Gắn chặt giá trị màu hex trực tiếp vào component khiến không thể đổi theme động.',
      'Bỏ qua khả năng truy cập (A11y - Accessibility) khi tự build component từ thẻ div thay vì dùng Headless Primitives.',
    ],
    followUpQuestions: [
      'Làm thế nào để versioning và publish thư viện Design System dạng multi-package monorepo (Core, Tokens, Icons, React) với Changesets?',
    ],
  });
}

fs.writeFileSync(filePath, JSON.stringify(questions, null, 2), 'utf8');
console.log('Successfully enriched frontend-system-design.json! Total questions now:', questions.length);
