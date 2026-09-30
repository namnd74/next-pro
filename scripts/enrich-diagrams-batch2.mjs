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
      count++;
    }
  }

  fs.writeFileSync(filePath, JSON.stringify(data, null, 2) + '\n', 'utf8');
  console.log(`[${fileName}] Updated ${count} questions.`);
}

// ==========================================
// 1. FRONTEND SYSTEM DESIGN (5 Questions)
// ==========================================
const fsdUpdates = {
  'int-10': {
    diagram: {
      type: 'mermaid',
      title: 'Kiến Trúc Xác Thực & Phân Quyền Multi-Tenant Trong Next.js App Router',
      caption: 'Bảo mật đa tầng từ Edge Middleware đến Server Components và Database Row-Level Security',
      code: `flowchart TD
    Client["Client Request (Cookie / JWT)"] --> EdgeMw["Next.js Edge Middleware"]
    
    subgraph EdgeAuth ["Tầng Edge Middleware (< 10ms)"]
        EdgeMw --> HostDetect["1. Trích xuất Subdomain / Header: tenant1.app.com"]
        HostDetect --> SessionVerify["2. Verify JWT & Expiry (jose)"]
        SessionVerify --> RoleGuard{"3. Kiểm tra Route Permissions"}
    end

    RoleGuard -->|"Hợp lệ"| RSC["React Server Component (Server Node.js)"]
    RoleGuard -->|"Token hết hạn"| Refresh["Kích hoạt Silent Refresh Flow"]
    RoleGuard -->|"Không đủ quyền"| Forbidden["Redirect /login hoặc 403 Forbidden"]

    subgraph DataIsolation ["Tầng Cách Ly Dữ Liệu Multi-Tenant"]
        RSC --> TenantContext["AsyncLocalStorage: TenantContext"]
        TenantContext --> ORM["Prisma / Drizzle ORM"]
        ORM --> RLS["PostgreSQL RLS (SET LOCAL app.current_tenant_id = 't1')"]
    end`
    }
  },

  'fsd-02': {
    diagram: {
      type: 'mermaid',
      title: 'Kiến Trúc Offline-First & Realtime Data Sync Engine Trên Trình Duyệt',
      caption: 'Mô hình 2 chiều kết hợp IndexedDB, Service Worker Background Sync và CRDT Conflict Resolution',
      code: `flowchart TD
    UI["Giao Diện Người Dùng (UI / React)"] <--> LocalDB[("IndexedDB (Dexie.js / RxDB)")]
    
    LocalDB --> Outbox["Local Sync Outbox (Hàng đợi thao tác offline)"]
    
    subgraph SyncEngine ["Background Sync Engine"]
        Outbox --> SW["Service Worker (Sync Manager)"]
        SW --> NetCheck{"Kiểm tra kết nối mạng (navigator.onLine)"}
        NetCheck -->|"Online"| PushChanges["Gửi Mutation Batch kèm Vector Clock"]
        NetCheck -->|"Offline"| Sleep["Chờ sự kiện 'sync' / 'online'"]
    end
    
    PushChanges --> Backend["Backend API Gateway"]
    Backend --> ConflictSolver{"Xung Đột Dữ Liệu?<br>(CRDT / Last-Write-Wins)"}
    ConflictSolver --> RemoteDB[("Database Máy Chủ")]
    ConflictSolver -.->|"Gửi Delta Cập Nhật"| LocalDB`
    }
  },

  'fsd-03': {
    diagram: {
      type: 'mermaid',
      title: 'Kiến Trúc Ứng Dụng Real-time Collaborative Canvas (Figma / Google Docs)',
      caption: 'Xử lý đồng thời đa người dùng bằng WebSockets và Yjs CRDT State Vector',
      code: `flowchart TD
    subgraph ClientA ["Client 1 (Hà Nội)"]
        CanvasA["HTML5 Canvas / WebGL Engine"] <--> YDocA["Yjs CRDT Document A"]
        YDocA --> UndoA["Local Undo / Redo Stack"]
    end

    subgraph ClientB ["Client 2 (TP. Hồ Chí Minh)"]
        CanvasB["HTML5 Canvas / WebGL Engine"] <--> YDocB["Yjs CRDT Document B"]
        YDocB --> UndoB["Local Undo / Redo Stack"]
    end

    subgraph RelayServer ["Máy Chủ Điều Phối (Realtime Relay)"]
        WSGateway["WebSocket Gateway Cluster"]
        RedisPubSub[("Redis Pub/Sub Channel: doc-123")]
        SnapshotWorker["Snapshot Worker (Lưu định kỳ xuống S3 / PostgreSQL)"]
    end

    YDocA <-->|"WebSocket Update Binary"| WSGateway
    YDocB <-->|"WebSocket Update Binary"| WSGateway
    WSGateway <--> RedisPubSub
    RedisPubSub --> SnapshotWorker`
    }
  },

  'fsd-04': {
    diagram: {
      type: 'mermaid',
      title: 'Trung Tâm Thông Báo Đa Tab (Multi-tab Notification & Sync Center)',
      caption: 'Duy trì duy nhất 1 kết nối WebSocket tới server thông qua SharedWorker và BroadcastChannel',
      code: `flowchart TD
    subgraph BrowserTabs ["Các Tab Trình Duyệt Đang Mở"]
        Tab1["Tab 1: Trang Dashboard"]
        Tab2["Tab 2: Trang Chi Tiết Sản Phẩm"]
        Tab3["Tab 3: Trang Tin Nhắn"]
    end

    subgraph BrowserCore ["Hạ Tầng Đồng Bộ Trình Duyệt"]
        BC["BroadcastChannel ('app-notifications')"]
        SW["<b>SharedWorker Singleton</b><br>(Quản lý kết nối tập trung)"]
        IDB[("IndexedDB: Lưu Lịch Sử Thông Báo")]
    end

    Tab1 <--> BC
    Tab2 <--> BC
    Tab3 <--> BC

    BC <--> SW
    SW <--> IDB

    SW <-->|"Duy nhất 1 kết nối WebSocket chung"| PushServer["Backend Notification Server"]`
    }
  },

  'fsd-05': {
    diagram: {
      type: 'mermaid',
      title: 'Kiến Trúc Client-Side Telemetry & Web Vitals RUM SDK',
      caption: 'Thu thập LCP, FID/INP, CLS với chi phí overhead gần như bằng 0 (Zero CPU overhead)',
      code: `flowchart TD
    App["Ứng Dụng Web"] --> PO["PerformanceObserver API (Browser Native)"]
    
    subgraph RUM_SDK ["Client Telemetry SDK (< 3KB gzipped)"]
        PO --> Collector["Thu thập Core Web Vitals (LCP, INP, CLS, TTFB)"]
        Collector --> ErrorHook["window.onerror & unhandledrejection"]
        ErrorHook --> Batcher["Ring Buffer / In-Memory Queue (Tối đa 50 sự kiện)"]
        Batcher --> Trigger{"Gửi đi khi nào?"}
        Trigger -->|"Đủ 10s hoặc đầy buffer"| SendBeacon["navigator.sendBeacon()"]
        Trigger -->|"Người dùng tắt tab (pagehide)"| FlushBeacon["Flush khẩn cấp qua sendBeacon"]
    end

    SendBeacon --> EdgeIngest["Cloudflare Workers / Edge Gateway"]
    EdgeIngest --> ClickHouse[("ClickHouse OLAP Database")]
    ClickHouse --> Grafana["Dashboard Giám Sát Hiệu Năng Thời Gian Thực"]`
    }
  }
};

// ==========================================
// 2. SYSTEM DESIGN BANK (30 Questions: sys-005 to sys-039)
// ==========================================
const sysUpdates = {
  'sys-005': {
    diagram: {
      type: 'mermaid',
      title: 'Kiến Trúc Mạng Phân Phối Nội Dung (CDN Edge Caching Architecture)',
      caption: 'Định tuyến người dùng tới Edge Server gần nhất thông qua Anycast BGP Routing',
      code: `flowchart TD
    User["Người dùng (Việt Nam)"] --> Anycast{"Anycast DNS Routing"}
    Anycast --> Edge["CDN Edge Server (Singapore / VN POP)"]
    
    Edge --> CheckCache{"Dữ liệu có trong Cache Edge không?"}
    CheckCache -->|"Cache HIT (95%)"| ReturnEdge["Trả về ngay (< 20ms)"]
    
    CheckCache -->|"Cache MISS (5%)"| Shield["CDN Origin Shield (Cache trung gian)"]
    Shield --> Origin["Máy Chủ Gốc (Origin Server US-West)"]
    Origin --> CacheFill["Nạp vào Edge Cache"]
    CacheFill --> ReturnUser["Trả về người dùng (< 150ms)"]`
    }
  },

  'sys-006': {
    diagram: {
      type: 'mermaid',
      title: 'So Sánh Kiến Trúc: Forward Proxy vs Reverse Proxy',
      caption: 'Forward Proxy đại diện cho Client; Reverse Proxy đại diện và bảo vệ Máy Chủ',
      code: `flowchart TD
    subgraph ForwardFlow ["Mô Hình Forward Proxy (Bảo vệ Client)"]
        ClientA["Nội bộ Doanh Nghiệp (Client)"] --> FP["Forward Proxy (Kiểm soát truy cập, lọc web, VPN)"]
        FP --> Internet1["Mạng Internet Công Cộng"]
    end

    subgraph ReverseFlow ["Mô Hình Reverse Proxy (Bảo vệ Server)"]
        Internet2["Người Dùng Toàn Cầu"] --> RP["Reverse Proxy (Nginx / Cloudflare)<br>• Cân bằng tải<br>• Chấm dứt SSL/TLS<br>• Chặn DDoS & WAF"]
        RP --> App1["App Server 1"]
        RP --> App2["App Server 2"]
        RP --> App3["App Server 3"]
    end`
    }
  },

  'sys-007': {
    diagram: {
      type: 'mermaid',
      title: 'Mối Quan Hệ Đánh Đổi: Độ Trễ (Latency) vs Thông Lượng (Throughput)',
      caption: 'Kỹ thuật gom lô (Batching) tăng gấp nhiều lần Throughput nhưng đánh đổi tăng Latency của từng gói tin',
      code: `flowchart LR
    subgraph LowLatency ["Ưu tiên Độ Trễ Thấp (Immediate Processing)"]
        P1["Mỗi request gửi ngay lập tức"] --> L1["Độ trễ cá nhân cực thấp (< 2ms)"]
        L1 --> T1["Thông lượng giới hạn (1.000 req/s) do chi phí network roundtrip"]
    end

    subgraph HighThroughput ["Ưu tiên Thông Lượng Khủng (Batching & Pipelining)"]
        P2["Gom 500 request vào 1 batch"] --> L2["Độ trễ cá nhân tăng lên (chờ gom 20ms)"]
        L2 --> T2["Thông lượng bùng nổ (100.000 req/s) vì tận dụng triệt để I/O"]
    end`
    }
  },

  'sys-008': {
    diagram: {
      type: 'mermaid',
      title: 'Phổ Các Cấp Độ Nhất Quán (Consistency Spectrum) Trong Hệ Thống Phân Tán',
      caption: 'Từ Strong Linearizable (chậm nhất) đến Eventual Consistency (nhanh và sẵn sàng cao nhất)',
      code: `flowchart TD
    Linear["<b>1. Linearizability (Nhất quán tuyệt đối)</b><br>Tất cả các node thấy thao tác ghi theo thứ tự thời gian thực toàn cầu (Spanner, Raft)"]
    Linear --> Sequential["<b>2. Sequential Consistency</b><br>Thứ tự các thao tác được bảo toàn như chương trình quy định, không bắt buộc theo đồng hồ thực"]
    Sequential --> Causal["<b>3. Causal Consistency</b><br>Chỉ các sự kiện có quan hệ nhân quả (Cause-and-Effect) mới bắt buộc cùng thứ tự"]
    Causal --> ReadAfterWrite["<b>4. Read-After-Write Consistency</b><br>Người dùng luôn đọc được ngay những gì chính họ vừa ghi"]
    ReadAfterWrite --> Eventual["<b>5. Eventual Consistency (Nhất quán sau cùng)</b><br>Hệ thống không cam kết đọc ngay, nhưng sau một khoảng thời gian mọi node sẽ đồng nhất (Cassandra, DynamoDB)"]`
    }
  },

  'sys-009': {
    diagram: {
      type: 'mermaid',
      title: 'Luồng Tích Hợp Cổng Thanh Toán: returnUrl (UI) vs Server IPN Webhook (Data)',
      caption: 'Bắt buộc chỉ cập nhật trạng thái đơn hàng khi nhận được IPN có chữ ký số bí mật',
      code: `sequenceDiagram
    autonumber
    participant U as Trình Duyệt Khách Hàng
    participant M as Backend Sàn (Merchant)
    participant G as Cổng VNPay / MoMo

    U->>M: Bấm "Thanh Toán Đơn #123"
    M->>G: Tạo giao dịch thanh toán kèm chữ ký (HMAC-SHA512)
    G-->>M: Trả về Payment URL
    M-->>U: Redirect khách sang trang thanh toán của Cổng
    U->>G: Khách quét mã QR / Nhập OTP trừ tiền

    Note over U,G: ⚠️ NHÁNH 1: returnUrl (Chỉ dùng điều hướng UI)
    G-->>U: Redirect khách về Merchant qua returnUrl?status=success
    U->>M: Hiển thị trang "Đang chờ xác nhận giao dịch..."
    Note over M: TUYỆT ĐỐI KHÔNG cập nhật DB tại đây vì khách có thể tự sửa query param URL!

    Note over M,G: 🔒 NHÁNH 2: Server-to-Server IPN (Xác thực thực tế)
    G->>M: POST /api/payment/ipn (Kèm signature mật)
    M->>M: 1. Kiểm tra chữ ký hợp lệ<br>2. Kiểm tra số tiền khớp đơn #123<br>3. Kiểm tra Idempotency
    M->>M: Cập nhật DB: Trạng thái = PAID
    M-->>G: HTTP 200 {"RspCode": "00", "Message": "Confirm Success"}`
    }
  },

  'sys-010': {
    diagram: {
      type: 'mermaid',
      title: 'Kiến Trúc Phòng Thủ Đa Lớp Chống Bot Đăng Ký Tài Khoản Ảo',
      caption: 'Lọc 99% lưu lượng bot tự động thông qua WAF, Captcha tàng hình và Phân tích hành vi',
      code: `flowchart TD
    Req["Request Đăng Ký Tài Khoản"] --> L1["<b>Lớp 1: Cloudflare Edge WAF</b><br>• Chặn IP Proxy/Tor độc hại<br>• Rate limit 10 req/phút/IP"]
    
    L1 --> L2{"<b>Lớp 2: Bot Fingerprinting</b><br>Honeypot field có bị điền? TLS JA3 Fingerprint hợp lệ?"}
    L2 -->|"Bị dính honeypot"| Drop["Âm thầm trả về 200 OK giả (Tarpit)"]
    L2 -->|"Nghi ngờ"| Challenge["Kích hoạt Cloudflare Turnstile / reCAPTCHA v3 score < 0.5"]
    
    L2 -->|"Vượt qua"| L3["<b>Lớp 3: API Gateway & Application Guard</b><br>• Rate limit theo Device ID & Subnet IP<br>• Validate cấu trúc email Disposable (mailinator...)"]
    
    L3 --> L4["<b>Lớp 4: Xác thực 2 bước (OTP)</b><br>Yêu cầu OTP qua SMS / Zalo ZNS trước khi cấp token chính thức"]
    L4 --> ValidDB[("Tạo User Trong Database")]`
    }
  },

  'sys-011': {
    diagram: {
      type: 'pipeline',
      title: 'Chiến Lược Phân Bổ Thời Gian 45 Phút Phỏng Vấn System Design Chuẩn FAANG',
      caption: 'Khung tiếp cận có cấu trúc giúp ứng viên ghi điểm tối đa với nhà tuyển dụng',
      stages: [
        { name: '1. Làm Rõ Yêu Cầu (Scope & Scale)', description: 'Xác định Functional/Non-Functional requirements, DAU, QPS đọc/ghi, dung lượng lưu trữ trong 5 năm', duration: '5 phút' },
        { name: '2. High-Level Architecture', description: 'Vẽ sơ đồ khối tổng thể từ Client -> DNS -> LB -> API Gateway -> Microservices -> Caching -> Database', duration: '12 phút' },
        { name: '3. Deep Dive Bottlenecks', description: 'Đào sâu vào các bài toán khó: Sharding key, Cache eviction, Concurrency lock, Race conditions, Single Point of Failure', duration: '23 phút' },
        { name: '4. Trade-offs & Wrap-up', description: 'Đánh giá các đánh đổi kỹ thuật (CAP theorem, chi phí hạ tầng, giám sát OTel) và hướng cải tiến tương lai', duration: '5 phút' }
      ]
    }
  },

  'sys-012': {
    diagram: {
      type: 'mermaid',
      title: 'Phân Tách Yêu Cầu Chức Năng (FR) vs Yêu Cầu Phi Chức Năng (NFR)',
      caption: 'Thiết kế hệ thống thành công phải đáp ứng song hành cả tính năng nghiệp vụ và độ tin cậy hạ tầng',
      code: `flowchart TD
    SystemDesign["Bài Toán Thiết Kế Hệ Thống Phân Tán"]
    
    subgraph FR ["Yêu Cầu Chức Năng (Functional - Làm gì?)"]
        FR1["Người dùng rút gọn link URL dài thành link ngắn 7 ký tự"]
        FR2["Người dùng click link ngắn được redirect tới link gốc"]
        FR3["Chủ link xem được thống kê số lượt click theo quốc gia"]
    end
    
    subgraph NFR ["Yêu Cầu Phi Chức Năng (Non-Functional - Tốt ra sao?)"]
        NFR1["<b>Hiệu năng:</b> Độ trễ Redirect P99 < 20ms"]
        NFR2["<b>Sẵn sàng:</b> 99.99% Availability (Không downtime)"]
        NFR3["<b>Quy mô:</b> 100M link mới/năm, tỷ lệ Đọc:Ghi = 100:1"]
        NFR4["<b>Toàn vẹn:</b> Không thể tạo trùng mã hash link ngắn"]
    end
    
    SystemDesign --> FR
    SystemDesign --> NFR`
    }
  },

  'sys-013': {
    diagram: {
      type: 'mermaid',
      title: 'Khung 5 Câu Hỏi Cốt Lõi Trong 5 Phút Đầu Buổi Phỏng Vấn System Design',
      caption: 'Tránh rơi vào bẫy cắm đầu vẽ sơ đồ ngay khi chưa rõ phạm vi bài toán',
      code: `flowchart LR
    Q1["<b>1. Người dùng & Tính năng cốt lõi?</b><br>MVP gồm những chức năng nào? Có cần mobile/web không?"] --> Q2["<b>2. Quy mô người dùng (Scale)?</b><br>DAU/MAU bao nhiêu? Lượng request trung bình và đỉnh (Peak QPS)?"]
    Q2 --> Q3["<b>3. Đặc tính tải (Read vs Write)?</b><br>Hệ thống đọc nặng (Twitter feed) hay ghi nặng (IoT tracking)?"]
    Q3 --> Q4["<b>4. Kích thước dữ liệu lưu trữ?</b><br>Mỗi bản ghi nặng bao nhiêu bytes? Cần lưu trữ trong bao lâu (retention)?"]
    Q4 --> Q5["<b>5. Tiêu chuẩn SLA & Tính Nhất Quán?</b><br>Chấp nhận Eventual Consistency hay bắt buộc Strong Consistency (giao dịch tiền)?"]`
    }
  },

  'sys-014': {
    diagram: {
      type: 'mermaid',
      title: 'Phân Cấp Độ Trễ Phần Cứng (Latency Numbers Every Systems Programmer Must Know)',
      caption: 'Quy đổi thời gian đọc dữ liệu để hiểu vì sao bộ nhớ đệm (Cache) là bắt buộc ở quy mô lớn',
      code: `flowchart TD
    L1["<b>L1 Cache Hit:</b> 0.5 nanosecond (Quy đổi đời thực: 0.5 giây)"]
    L1 --> RAM["<b>Đọc RAM:</b> 100 nanoseconds (~200 lần chậm hơn L1 | Quy đổi: 1.5 phút)"]
    RAM --> NVMe["<b>Đọc tuần tự SSD NVMe:</b> 10 - 50 microseconds (~500 lần chậm hơn RAM | Quy đổi: 1 ngày)"]
    NVMe --> IntraDC["<b>Mạng nội bộ cùng Datacenter:</b> 0.5 millisecond (~10 lần chậm hơn SSD | Quy đổi: 10 ngày)"]
    IntraDC --> CrossContinent["<b>Mạng liên lục địa (US -> VN Roundtrip):</b> 150 milliseconds (~300 lần chậm hơn nội bộ | Quy đổi: 5 năm)"]`
    }
  },

  'sys-015': {
    diagram: {
      type: 'pipeline',
      title: 'Lộ Trình Xử Lý Hệ Thống Khi Traffic Tăng Gấp 5 Lần',
      caption: 'Chiến lược cứu nguy và mở rộng theo trình tự từ ít rủi ro nhất đến kiến trúc phân tán',
      stages: [
        { name: '1. Quan Sát & Đo Lường (Observability)', description: 'Kiểm tra CPU, RAM, Disk I/O, Slow Query Log và APM P99 latency để định vị chính xác điểm nghẽn (Bottleneck)', duration: 'Ngay lập tức' },
        { name: '2. Nâng Cấp Tạm Thời (Vertical Scaling)', description: 'Tăng RAM/CPU instance trên cloud để hệ thống không bị crash/OOM trong lúc đội ngũ chuẩn bị giải pháp căn cơ', duration: 'Trong 1 giờ' },
        { name: '3. Tách Database & Thêm Caching', description: 'Tách Database sang máy chủ riêng; Bổ sung Redis Cache cho các truy vấn tĩnh và đọc nhiều để giảm 80% tải DB', duration: 'Trong ngày' },
        { name: '4. Horizontal Scaling & Load Balancer', description: 'Đưa application về dạng Stateless (chuyển session sang Redis); Đặt Nginx/ALB phía trước scale ngang ra 4-5 nodes', duration: 'Trong tuần' }
      ]
    }
  },

  'sys-016': {
    diagram: {
      type: 'mermaid',
      title: 'Cơ Chế Health Check Của Load Balancer và Rủi Ro Hiệu Ứng Domino (Thundering Herd)',
      caption: 'Cách cấu hình threshold lành mạnh tránh việc kill nhầm backend đang bận xử lý tác vụ',
      code: `flowchart TD
    LB["Load Balancer (Nginx / AWS ALB)"]
    
    subgraph HealthProbes ["Cơ Chế Health Check Định Kỳ (Mỗi 5s)"]
        LB -->|"GET /health/liveness"| S1["Backend Node 1 (Khỏe mạnh: 200 OK)"]
        LB -->|"GET /health/liveness"| S2["Backend Node 2 (Đang khởi động: Timeout)"]
        LB -->|"GET /health/liveness"| S3["Backend Node 3 (Quá tải: 503 Service Unavailable)"]
    end
    
    S1 --> LBPass["Đạt 2 lần Success liên tiếp -> Route traffic vào"]
    S2 --> LBFail["Chưa đạt -> Tạm thời ngắt traffic"]
    S3 --> LBDrop["Dính 3 lần Fail liên tiếp -> Đánh dấu UNHEALTHY & Ngắt kết nối"]
    
    subgraph ThunderingHerdRisk ["⚠️ RỦI RO CẤU HÌNH SAI"]
        LBDrop --> Risk["Nếu timeout quá gắt (1s), hàng loạt node quá tải bị ngắt cùng lúc -> 100% traffic dồn vào node còn lại làm sập toàn bộ hệ thống!"]
    end`
    }
  },

  'sys-017': {
    diagram: {
      type: 'mermaid',
      title: 'Kiến Trúc Tối Ưu Cho Hệ Đọc-Nặng (Read-Heavy) vs Hệ Ghi-Nặng (Write-Heavy)',
      caption: 'So sánh cấu trúc lưu trữ và luồng dữ liệu cho 2 bài toán đối nghịch',
      code: `flowchart TD
    subgraph ReadHeavy ["Hệ Đọc-Nặng (Read:Write = 100:1, vd: Tin tức, Twitter)"]
        RUser["Người Dùng Đọc"] --> RCDN["CDN Edge Cache"]
        RCDN --> RLB["Load Balancer"]
        RLB --> RApp["App Servers"]
        RApp <--> RRedis[("Distributed Redis Cluster (Cache-aside)")]
        RApp --> RReplicas[("Database Read Replicas (Scale ngang đọc)")]
    end

    subgraph WriteHeavy ["Hệ Ghi-Nặng (Write:Read = 50:1, vd: IoT Sensors, Log Stream)"]
        WUser["Thiết Bị Gửi Dữ Liệu"] --> WQueue["Kafka / Kinesis Message Queue (Buffer đệm)"]
        WQueue --> WWorkers["Batch Ingestion Workers"]
        WWorkers --> WLSM[("LSM-Tree Database (Cassandra / ClickHouse / InfluxDB)<br>• Append-only commit log<br>• Ghi tuần tự siêu tốc trên đĩa")]
    end`
    }
  },

  'sys-018': {
    diagram: {
      type: 'mermaid',
      title: 'Kiến Trúc Dịch Vụ Rút Gọn Link (URL Shortener - TinyURL Scale)',
      caption: 'Thiết kế quy mô hàng tỷ liên kết sử dụng Base62 Encoding, Redis Caching và Key Generation Service',
      code: `flowchart TD
    Client["Client Request"] --> LB["Load Balancer"]
    LB --> API["URL Shortener API Service"]
    
    subgraph ReadFlow ["Luồng Đọc (Redirect 301 / 302)"]
        API --> RedisCache[("Redis Cluster (Cache Top 20% Links)")]
        RedisCache -->|"Cache HIT"| ReturnRedirect["301/302 Redirect về URL Gốc (< 10ms)"]
        RedisCache -->|"Cache MISS"| ReadDB[("Database (PostgreSQL / MongoDB)")]
    end

    subgraph WriteFlow ["Luồng Tạo Link Mới"]
        API --> KGS["Key Generation Service (KGS)<br>Sinh sẵn chuỗi Base62 duy nhất: 7 ký tự"]
        KGS --> WriteDB[("Lưu ánh xạ: ShortKey -> LongURL")]
        WriteDB --> AsyncAnalytics["Bắn sự kiện sang Kafka để đếm click analytics"]
    end`
    }
  },

  'sys-019': {
    diagram: {
      type: 'mermaid',
      title: 'Kiến Trúc Bộ Đếm Lượt Xem Bài Viết & Bảng Xếp Hạng Top Thời Gian Thực',
      caption: 'Sử dụng Redis Sorted Sets và Write-back Asynchronous tránh nghẽn Database lock',
      code: `flowchart TD
    User["Người dùng đọc bài viết #456"] --> API["Article Service"]
    
    subgraph RealtimeCounter ["Tầng Đếm Siêu Tốc (In-Memory Layer)"]
        API --> RedisHLL["Redis HyperLogLog: Đếm Unique IP (Tránh F5 gian lận)"]
        RedisHLL -->|"IP Hợp lệ"| RedisZSet["Redis Sorted Set (ZINCRBY leaderboard:today 1 456)"]
    end

    subgraph LeaderboardRead ["Xem Bảng Xếp Hạng Top 10"]
        Admin["Client xem Top 10"] --> ZRev["ZREVRANGE leaderboard:today 0 9 WITHSCORES (< 2ms)"]
    end

    subgraph Persistence ["Tầng Bền Vững (Write-Back)"]
        CronWorker["Background Sync Worker (Mỗi 60s)"] --> ReadRedis["Đọc Delta lượt xem từ Redis"]
        ReadRedis --> BulkDB["Cập nhật lô vào PostgreSQL (UPDATE articles SET views = views + N)"]
    end`
    }
  },

  'sys-020': {
    diagram: {
      type: 'mermaid',
      title: 'Kiến Trúc Hệ Thống Chấm Công Doanh Nghiệp (High Concurrency Check-in)',
      caption: 'Xử lý tải đỉnh lúc 8:00 sáng với hàng chục nghìn nhân viên chấm công cùng lúc',
      code: `flowchart TD
    Devices["Máy Quét Vân Tay / App GPS Mobile"] --> EdgeGate["API Gateway (Rate limit & Validate JWT)"]
    EdgeGate --> CheckinService["Check-in Ingestion Service"]
    
    subgraph DequeueBuffering ["Hàng Đợi Tránh Nghẽn Cơ Sở Dữ Liệu"]
        CheckinService --> RedisDedup{"Redis Dedup (Chống quét trùng 2 lần trong 30s)"}
        RedisDedup -->|"Hợp lệ"| KafkaTopic[("Kafka Topic: 'attendance-logs' (Partitions theo BranchID)")]
    end

    subgraph ProcessingLayer ["Xử Lý Nghiệp Vụ Bất Đồng Bộ"]
        KafkaTopic --> Workers["Cụm Worker Chấm Công"]
        Workers --> ShiftEngine["Đối soát Ca làm việc & Quy chế đi muộn"]
        ShiftEngine --> DB[("PostgreSQL Master Database")]
        ShiftEngine --> Push["Gửi Push Notification xác nhận cho nhân viên"]
    end`
    }
  },

  'sys-021': {
    diagram: {
      type: 'mermaid',
      title: 'Kiến Trúc Đồng Bộ Giỏ Hàng Xuyên Thiết Bị (Guest Session to Authenticated Merge)',
      caption: 'Hợp nhất dữ liệu giỏ hàng khách vãng lai khi đăng nhập giữa Web và Mobile App',
      code: `flowchart TD
    Guest["Khách vãng lai mua hàng (Chưa đăng nhập)"] --> GuestCart[("Giỏ Hàng Tạm: Redis / LocalStorage (Key: guest_uuid)")]
    
    Guest --> Login["Người dùng thực hiện Đăng Nhập (User ID: 888)"]
    
    Login --> CartMergeService["Cart Merge Service"]
    
    subgraph MergeLogic ["Chiến Lược Hợp Nhất (Conflict Resolution)"]
        CartMergeService --> ReadGuest["Đọc items từ guest_uuid"]
        CartMergeService --> ReadUser["Đọc items từ user_888 trong PostgreSQL"]
        ReadGuest & ReadUser --> Strategy{"Cùng 1 sản phẩm có trong cả 2?"}
        Strategy -->|"Có"| SumQty["Cộng dồn số lượng (Tối đa = Tồn kho thực tế)"]
        Strategy -->|"Mới"| AddNew["Thêm sản phẩm mới vào danh sách"]
    end

    SumQty & AddNew --> SaveDB[("Lưu giỏ hàng chính thức vào Database")]
    SaveDB --> ClearGuest["Xóa guest_uuid khỏi Redis"]`
    }
  },

  'sys-022': {
    diagram: {
      type: 'mermaid',
      title: 'Ma Trận Quyết Định: Monolith First vs Microservices Cho Đội Ngũ Nhỏ',
      caption: 'Tránh cái bẫy phân tán sớm khi sản phẩm chưa đạt Product-Market Fit',
      code: `flowchart TD
    TeamSize{"Quy mô: Team 5 người, sản phẩm chạy 6 tháng?"}
    
    TeamSize -->|"Lời Khuyên: Chọn Monolith (Modular Monolith)"| GoodChoice["<b>✅ MODULAR MONOLITH</b><br>• Dễ debug, 1 transaction DB, 1 repo<br>• Triển khai nhanh, zero overhead network<br>• Tách module rõ ràng trong code (Clean Architecture)"]
    
    TeamSize -->|"Cảnh Báo: Tách Microservices Sớm"| BadChoice["<b>❌ MICROSERVICES PREMATURE TRAP</b><br>• Phải giải quyết Distributed Tracing, 2PC, Saga<br>• Đứt mạng giữa các service, deploy 10 pipelines phức tạp<br>• Đội ngũ 5 người tốn 70% thời gian bảo trì hạ tầng thay vì làm sản phẩm"]`
    }
  },

  'sys-023': {
    diagram: {
      type: 'mermaid',
      title: 'Phân Tách Service Theo Bounded Context (Domain-Driven Design)',
      caption: 'Mỗi miền nghiệp vụ độc lập quản lý ranh giới dữ liệu và logic riêng biệt',
      code: `flowchart LR
    subgraph UserContext ["Bounded Context: Người Dùng (Identity)"]
        U1["User Entity"] --- U2["Authentication & KYC Logic"]
    end

    subgraph OrderContext ["Bounded Context: Đơn Hàng (Order)"]
        O1["Order Entity"] --- O2["Checkout & State Machine"]
    end

    subgraph CatalogContext ["Bounded Context: Danh Mục Hàng (Catalog)"]
        C1["Product Entity"] --- C2["Price & Inventory Stock"]
    end

    subgraph BillingContext ["Bounded Context: Thanh Toán (Billing)"]
        B1["Invoice Entity"] --- B2["Gateway Integration"]
    end

    OrderContext -.->|"REST / gRPC"| CatalogContext
    OrderContext -.->|"Domain Event: OrderCreated"| BillingContext
    BillingContext -.->|"Auth Check"| UserContext`
    }
  },

  'sys-024': {
    diagram: {
      type: 'mermaid',
      title: 'Kiến Trúc Database-Per-Service và Giải Pháp Báo Cáo Không Cần JOIN',
      caption: 'Sử dụng Change Data Capture (CDC Debezium) và OLAP Data Warehouse để làm báo cáo tổng hợp',
      code: `flowchart TD
    subgraph Services ["Các Microservices Độc Lập"]
        UserService["User Service"] --> UserDB[("PostgreSQL Users")]
        OrderService["Order Service"] --> OrderDB[("PostgreSQL Orders")]
        PaymentService["Payment Service"] --> PaymentDB[("MongoDB Payments")]
    end

    subgraph CDC_Pipeline ["Tầng Trích Xuất Dữ Liệu Tự Động (CDC Pipeline)"]
        UserDB & OrderDB & PaymentDB --> Debezium["Debezium CDC (Đọc WAL / Binlog)"]
        Debezium --> Kafka[("Kafka Event Streaming")]
    end

    subgraph OLAP_Reporting ["Tầng Phân Tích & Báo Cáo (OLAP)"]
        Kafka --> ClickHouse[("ClickHouse / Snowflake Data Warehouse")]
        ClickHouse --> Metabase["BI Dashboard / Xuất Báo Cáo Doanh Thu (JOIN thoải mái trên OLAP)"]
    end`
    }
  },

  'sys-025': {
    diagram: {
      type: 'mermaid',
      title: 'Kiến Trúc Truy Vết Phân Tán (Distributed Tracing Topology)',
      caption: 'Theo dõi hành trình request xuyên qua 5 microservices bằng Trace ID và Span ID',
      code: `sequenceDiagram
    autonumber
    participant Client
    participant GW as API Gateway (Sinh TraceID: abc-123)
    participant Auth as Auth Service (Span 1)
    participant Order as Order Service (Span 2)
    participant Payment as Payment Service (Span 3)
    participant OTel as OpenTelemetry Collector & Jaeger

    Client->>GW: POST /orders
    Note over GW: Header: x-trace-id: abc-123
    
    GW->>Auth: Validate Token (trace-id: abc-123, parent-span: 0)
    Auth-->>GW: OK
    GW-)OTel: Ghi Span 1 (Duration: 15ms)
    
    GW->>Order: Create Order (trace-id: abc-123, parent-span: 1)
    Order->>Payment: Charge Card (trace-id: abc-123, parent-span: 2)
    Payment-->>Order: ❌ Error 500: Bank Timeout!
    Order-)OTel: Ghi Span 3 (LỖI TẠI ĐÂY)
    Order-->>GW: 500 Internal Error
    GW-->>Client: 500 Error (Trace-ID: abc-123)

    Note over OTel: Kỹ sư tra cứu "abc-123" trên Jaeger thấy ngay Span 3 bị timeout tại Payment Service!`
    }
  },

  'sys-026': {
    diagram: {
      type: 'mermaid',
      title: 'Chiến Lược Caching Đa Tầng Cho Ứng Dụng Frontend Hiện Đại',
      caption: 'Từ bộ nhớ đệm HTTP trình duyệt đến State In-Memory và Service Worker Offline',
      code: `flowchart TD
    Req["Yêu Cầu Tải Dữ Liệu"] --> L1{"1. Memory Cache<br>(TanStack Query / SWR / Pinia)"}
    L1 -->|"Cache HIT (< 1ms)"| RenderUI["Render UI Ngay Lập Tức"]
    
    L1 -->|"Cache MISS"| L2{"2. Service Worker Cache<br>(Cache Storage API)"}
    L2 -->|"Cache HIT (< 5ms)"| RenderUI
    
    L2 -->|"Cache MISS"| L3{"3. HTTP Browser Disk Cache<br>(ETag / Cache-Control)"}
    L3 -->|"304 Not Modified"| RenderUI
    
    L3 -->|"Cache MISS"| L4["4. Gửi Request Mạng Qua CDN Edge"]
    L4 --> FetchServer["Backend Server"]
    FetchServer --> PopulateCaches["Nạp ngược lại L3 -> L2 -> L1"]`
    }
  },

  'sys-028': {
    diagram: {
      type: 'mermaid',
      title: 'Kiến Trúc Database Master-Replica và Xử Lý Độ Trễ Sao Chép (Replication Lag)',
      caption: 'Tách biệt luồng Ghi trên Master và luồng Đọc trên Replicas kèm cơ chế Read-After-Write',
      code: `flowchart TD
    subgraph ClientLayer ["Client & Routing Layer"]
        UserWrite["Khách thực hiện Ghi (Tạo tài khoản / Đặt đơn)"] --> Router{"Database Router / Proxy (ProxySQL / PgCat)"}
        UserRead["Khách thực hiện Đọc (Xem bài viết / Tìm kiếm)"] --> Router
    end

    subgraph DatabaseCluster ["Database Nodes"]
        Router -->|"Luồng WRITE (100% về Master)"| MasterDB[("Primary / Master DB (PostgreSQL)")]
        MasterDB -->|"Async / Semi-sync Replication (WAL Stream)"| Rep1[("Read Replica 1")]
        MasterDB -->|"Async / Semi-sync Replication (WAL Stream)"| Rep2[("Read Replica 2")]
        Router -->|"Luồng READ phân tán"| Rep1 & Rep2
    end

    subgraph ReplicationLagSolution ["Xử Lý Vừa Ghi Xong Muốn Đọc Ngay (Read-Your-Own-Writes)"]
        UserWrite -.->|"Set Cookie 'just_modified=true' (5s)"| Router
        Router -.->|"Nếu có cookie -> Đọc tạm thời từ Master để không bị dữ liệu cũ"| MasterDB
    end`
    }
  },

  'sys-030': {
    diagram: {
      type: 'mermaid',
      title: 'Cơ Chế Connection Pooling Trong Database: Vì Sao Cần HikariCP / PgBouncer?',
      caption: 'Tái sử dụng các kết nối TCP đã xác thực thay vì mở mới liên tục tốn tài nguyên',
      code: `flowchart TD
    subgraph WithoutPool ["❌ KHÔNG DÙNG POOL (Mỗi request mở 1 kết nối mới)"]
        Req1["Request 1"] --> TCP1["Bắt tay TCP 3-way"] --> Auth1["Xác thực User/Pass SSL"] --> Exec1["Chạy Query"] --> Close1["Đóng socket (TIME_WAIT)"]
        Note1["⚠️ Chi phí: 30-50ms cho mỗi query! DB dễ sập vì quá số lượng Max Connections."]
    end

    subgraph WithPool ["✅ CÓ CONNECTION POOL (HikariCP / PgBouncer)"]
        Pool[("<b>Connection Pool (20 sockets sẵn sàng)</b><br>[Socket 1][Socket 2]...[Socket 20]")]
        R1["Request A"] --> Borrow["Mượn socket rảnh (< 0.1ms)"]
        Borrow --> ExecFast["Chạy Query ngay lập tức"]
        ExecFast --> ReturnSocket["Trả socket về pool"]
        ReturnSocket --> Pool
    end`
    }
  },

  'sys-032': {
    diagram: {
      type: 'mermaid',
      title: 'Kiến Trúc Event Sourcing: Lưu Vết Mọi Biến Động Trạng Thái Hệ Thống',
      caption: 'Thay vì chỉ lưu trạng thái cuối cùng, hệ thống lưu toàn bộ dòng sự kiện bất biến (Append-only Event Stream)',
      code: `flowchart LR
    subgraph Commands ["Lệnh Thao Tác (Commands)"]
        C1["Khách nạp 100k"] --> Agg["Tài Khoản Aggregate"]
        C2["Khách rút 30k"] --> Agg
        C3["Khách mua hàng 20k"] --> Agg
    end

    subgraph EventStore ["Kho Sự Kiện Bất Biến (Event Store)"]
        Agg --> E1["1. MoneyDepositedEvent (+100k)"]
        Agg --> E2["2. MoneyWithdrawnEvent (-30k)"]
        Agg --> E3["3. OrderPaidEvent (-20k)"]
    end

    subgraph ReadProjections ["Mô Hình Đọc (Projections / CQRS Read DB)"]
        E1 & E2 & E3 --> Projector["Projection Worker"]
        Projector --> BalanceView[("Read DB: Số Dư Cuối = 50k")]
    end`
    }
  },

  'sys-033': {
    diagram: {
      type: 'mermaid',
      title: 'Các Mô Hình Mở Rộng Ngang (Horizontal Scaling) Cho Ứng Dụng Stateful',
      caption: 'So sánh Sticky Sessions, Centralized Redis Session Store và Stateless Token (JWT)',
      code: `flowchart TD
    Client["Client Request"] --> LB{"Load Balancer"}
    
    subgraph Model1 ["Mô Hình 1: Sticky Session (Kém linh hoạt)"]
        LB -->|"Ghim theo Cookie"| SrvA["Server A (Chứa Session in-memory)"]
        NoteA["Nếu Server A chết, người dùng bị văng đăng nhập!"]
    end

    subgraph Model2 ["Mô Hình 2: Centralized Session Store (Khuyên dùng)"]
        LB --> AppNodes["Bất kỳ App Node nào (A, B, C)"]
        AppNodes <--> RedisSession[("Redis Cluster (Lưu Session tập trung)")]
    end

    subgraph Model3 ["Mô Hình 3: Pure Stateless (JWT Token)"]
        LB --> NodeStateless["App Node"]
        NodeStateless --> VerifyLocal["Verify chữ ký số tự thân, không cần truy vấn DB/Redis"]
    end`
    }
  },

  'sys-034': {
    diagram: {
      type: 'mermaid',
      title: 'Chiến Lược Strangler Fig Pattern: Chuyển Đổi Từ Monolith Sang Microservices',
      caption: 'Bóc tách dần từng tính năng ra service mới một cách an toàn mà không cần viết lại từ đầu',
      code: `flowchart TD
    Users["Người Dùng"] --> ProxyRouter{"API Gateway / Reverse Proxy"}
    
    subgraph MigrationProgress ["Tiến Trình Chuyển Đổi"]
        ProxyRouter -->|"Route các API cũ: /v1/*"| LegacyMonolith["Hệ Thống Monolith Cũ (Đang thu hẹp dần)"]
        ProxyRouter -->|"Route tính năng mới tách: /api/v2/payments"| MicroPay["Payment Microservice Mới"]
        ProxyRouter -->|"Route tính năng: /api/v2/notifications"| MicroNotif["Notification Microservice Mới"]
    end

    LegacyMonolith -.->|"Đồng bộ dữ liệu ngầm"| MicroPay`
    }
  },

  'sys-035': {
    diagram: {
      type: 'mermaid',
      title: 'Kiến Trúc API Gateway Trong Hệ Thống Microservices',
      caption: 'Cửa ngõ duy nhất gánh vác các tác vụ Cross-Cutting Concerns trước khi chuyển tiếp vào nội bộ',
      code: `flowchart TD
    Clients["Khách Hàng (Web / Mobile / Đối tác)"] --> APIGateway["<b>API GATEWAY (Kong / Envoy / AWS API GW)</b>"]
    
    subgraph CrossCutting ["Tác Vụ Xuyên Suốt (Cross-Cutting Concerns)"]
        APIGateway --> SSL["1. Chấm dứt mã hóa SSL/TLS"]
        APIGateway --> Auth["2. Xác thực JWT / OAuth2"]
        APIGateway --> RateLimit["3. Giới hạn tần suất (Rate Limiter)"]
        APIGateway --> Circuit["4. Ngắt mạch lỗi (Circuit Breaker)"]
    end

    subgraph InternalMesh ["Mạng Microservices Nội Bộ (gRPC / HTTP/2)"]
        APIGateway --> S1["User Service"]
        APIGateway --> S2["Order Service"]
        APIGateway --> S3["Inventory Service"]
    end`
    }
  },

  'sys-036': {
    diagram: {
      type: 'mermaid',
      title: 'Kiến Trúc Service Mesh: Phân Tách Control Plane vs Data Plane (Istio & Envoy)',
      caption: 'Tự động mã hóa mTLS, cân bằng tải và giám sát lưu lượng giao tiếp giữa các Service',
      code: `flowchart TD
    subgraph ControlPlane ["Tầng Điều Khiển (Control Plane - Istiod)"]
        Pilot["Cấu hình Routing & Traffic Management"]
        Citadel["Cấp phát chứng chỉ số mTLS & Security Policy"]
    end

    subgraph DataPlane ["Tầng Dữ Liệu (Data Plane - Envoy Sidecars)"]
        subgraph PodA ["Pod: Order Service"]
            AppA["Order App"] <--> EnvoyA["Envoy Sidecar Proxy A"]
        end

        subgraph PodB ["Pod: Payment Service"]
            EnvoyB["Envoy Sidecar Proxy B"] <--> AppB["Payment App"]
        end

        EnvoyA <== "Giao tiếp mTLS Mã Hóa Hai Chiều (Zero Trust)" ==> EnvoyB
    end

    ControlPlane -.->|"Đẩy cấu hình"| EnvoyA & EnvoyB`
    }
  },

  'sys-039': {
    diagram: {
      type: 'mermaid',
      title: 'Kiến Trúc Hướng Sự Kiện (Event-Driven Architecture) & Transactional Outbox Pattern',
      caption: 'Đảm bảo tính nhất quán tuyệt đối giữa ghi cơ sở dữ liệu và phát sự kiện ra Message Broker',
      code: `flowchart TD
    subgraph ServiceTx ["Giao Dịch Cục Bộ Database (Atomic Local Transaction)"]
        App["Order Service"] --> DB[("PostgreSQL")]
        DB --> T1["Bảng 'orders': INSERT đơn hàng mới"]
        DB --> T2["Bảng 'outbox': INSERT sự kiện 'OrderCreated'"]
    end

    subgraph EventPublisher ["Tầng Phát Sự Kiện An Toàn"]
        Debezium["Debezium CDC / Polling Publisher"] -->|"Đọc từ bảng outbox"| Kafka[("Kafka Broker: 'order-events'")]
    end

    subgraph Subscribers ["Các Dịch Vụ Đăng Ký Tiêu Thụ"]
        Kafka --> EmailService["Email Service (Gửi thư xác nhận)"]
        Kafka --> InventoryService["Inventory Service (Trừ tồn kho)"]
        Kafka --> AnalyticsService["Analytics Service (Cập nhật doanh thu)"]
    end`
    }
  }
};

// Execute updates
console.log('🚀 Running Batch 2 Enrichment...');
updateBank('frontend-system-design.json', fsdUpdates);
updateBank('system-design-bank.json', sysUpdates);
console.log('✅ Batch 2 completed successfully.');
