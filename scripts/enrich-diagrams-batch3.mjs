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
// SYSTEM DESIGN BANK (30 Questions: sys-041 to sys-071)
// ==========================================
const sysUpdates = {
  'sys-041': {
    diagram: {
      type: 'mermaid',
      title: 'Kiến Trúc Không Máy Chủ (Serverless Architecture: Event-Driven & Scale-to-Zero)',
      caption: 'Mô hình tính toán theo nhu cầu kết hợp API Gateway, FaaS (AWS Lambda) và Serverless Database',
      code: `flowchart LR
    Client["Client Request"] --> APIGW["API Gateway (HTTP / WebSocket)"]
    
    subgraph FaaSCluster ["Cụm Function-as-a-Service (FaaS)"]
        APIGW -->|"Kích hoạt tức thì"| L1["Lambda Instance 1"]
        APIGW -->|"Tự động scale theo tải"| L2["Lambda Instance 2"]
        APIGW -->|"Tự động scale theo tải"| Ln["Lambda Instance N"]
    end
    
    subgraph ManagedServices ["Dịch Vụ Lưu Trữ Quản Trị"]
        L1 & L2 & Ln --> DynamoDB[("DynamoDB / Serverless Aurora")]
        L1 & L2 & Ln --> S3[("S3 Object Storage")]
        L1 & L2 & Ln --> SQS[("SQS Message Queue")]
    end`
    }
  },

  'sys-042': {
    diagram: {
      type: 'mermaid',
      title: 'Khung Quyết Định Lựa Chọn Cơ Sở Dữ Liệu: SQL vs NoSQL',
      caption: 'Ma trận đánh giá theo tính toàn vẹn giao dịch (ACID) và khả năng mở rộng ngang (Horizontal Scale)',
      code: `flowchart TD
    Start{"Yêu cầu cốt lõi về cấu trúc dữ liệu?"}
    
    Start -->|"Schema cố định, quan hệ nhiều-nhiều, ACID bắt buộc"| SQL["<b>RDBMS (PostgreSQL, MySQL)</b><br>• Giao dịch tài chính, kế toán<br>• Truy vấn JOIN phức tạp, bảo toàn toàn vẹn"]
    
    Start -->|"Schema biến đổi liên tục, mở rộng ngang Terabytes"| NoSQLChoice{"Dạng dữ liệu cần tối ưu là gì?"}
    NoSQLChoice -->|"Document JSON (Catalog, CMS, Form động)"| Doc["<b>Document Store (MongoDB)</b>"]
    NoSQLChoice -->|"Siêu tốc độ Cache, Session, Rate Limit"| KV["<b>Key-Value Store (Redis)</b>"]
    NoSQLChoice -->|"Log, IoT, Time-series hàng tỷ bản ghi"| Column["<b>Wide-Column (Cassandra / ScyllaDB)</b>"]
    NoSQLChoice -->|"Social Graph, Phát hiện gian lận (Fraud)"| Graph["<b>Graph DB (Neo4j)</b>"]`
    }
  },

  'sys-043': {
    diagram: {
      type: 'mermaid',
      title: 'Cơ Chế Hoạt Động Của B-Tree Index Trong Cơ Sở Dữ Liệu Quan Hệ',
      caption: 'Cấu trúc cây cân bằng giúp giảm độ phức tạp tìm kiếm từ O(N) Table Scan xuống O(log N)',
      code: `flowchart TD
    Root["<b>Root Node:</b> [20 | 50]"]
    
    Root -->|"Key < 20"| Branch1["Branch Node 1: [5 | 12]"]
    Root -->|"20 <= Key < 50"| Branch2["Branch Node 2: [30 | 42]"]
    Root -->|"Key >= 50"| Branch3["Branch Node 3: [65 | 80]"]
    
    Branch2 -->|"Key < 30"| Leaf1["Leaf Node A: [20, 25] -> Trỏ khối đĩa #101"]
    Branch2 -->|"30 <= Key < 42"| Leaf2["Leaf Node B: [30, 35, 40] -> Trỏ khối đĩa #102"]
    Branch2 -->|"Key >= 42"| Leaf3["Leaf Node C: [42, 48] -> Trỏ khối đĩa #103"]
    
    Leaf1 <== "Con trỏ hai chiều (B+ Tree Linked List) quét RANGE siêu tốc" ==> Leaf2
    Leaf2 <== "Con trỏ hai chiều" ==> Leaf3`
    }
  },

  'sys-044': {
    diagram: {
      type: 'mermaid',
      title: 'Sự Đánh Đổi Giữa Chuẩn Hóa (Normalization) vs Phi Chuẩn Hóa (Denormalization)',
      caption: 'Chuẩn hóa tối ưu cho Ghi và Toàn vẹn; Phi chuẩn hóa tối ưu cho Đọc siêu tốc độ cao',
      code: `flowchart TD
    subgraph Normalization3NF ["Mô Hình Chuẩn Hóa 3NF (Tối Ưu Ghi & Chống Trùng Lặp)"]
        Users["Users (user_id, name)"]
        Orders["Orders (order_id, user_id, product_id)"]
        Products["Products (product_id, title, price)"]
        Users --- Orders --- Products
        Note3NF["✅ Ưu điểm: Sửa tên user chỉ cần UPDATE 1 dòng duy nhất<br>❌ Nhược điểm: Xem lịch sử đơn phải JOIN 3 bảng, chậm khi dữ liệu lớn"]
    end

    subgraph Denormalization ["Mô Hình Phi Chuẩn Hóa (Tối Ưu Đọc - Read Performance)"]
        FlatOrders[("OrderSummary (order_id, user_id, user_name, product_title, product_price)")]
        NoteDenorm["✅ Ưu điểm: Đọc 1 dòng duy nhất ra toàn bộ thông tin đơn hàng (< 2ms)<br>❌ Nhược điểm: Tốn dung lượng đĩa, phải đồng bộ dữ liệu khi user đổi tên"]
    end`
    }
  },

  'sys-045': {
    diagram: {
      type: 'mermaid',
      title: 'Kiến Trúc Lưu Trữ Tệp Lớn: Phân Tách Blob Storage (S3) vs Database Metadata',
      caption: 'Cơ sở dữ liệu chỉ lưu đường dẫn URL và siêu dữ liệu; tệp nhị phân được lưu trên Object Storage',
      code: `flowchart LR
    Client["Client Upload"] --> API["Application Server"]
    
    API -->|"1. Lưu Metadata (File name, Size, Owner, S3 Key)"| DB[("Relational Database (PostgreSQL)")]
    
    API -->|"2. Lưu Binary Payload (Video, Audio, Images)"| S3[("Object Storage (Amazon S3 / Cloudflare R2)<br>• Replicated qua 3 Availability Zones<br>• Chi phí $0.023/GB thay vì $0.15/GB DB đĩa")]
    
    ClientReader["Người Dùng Tải Tệp"] --> CDN["CDN Edge (CloudFront)"]
    CDN <--> S3`
    }
  },

  'sys-047': {
    diagram: {
      type: 'mermaid',
      title: 'Thiết Kế API Thanh Toán An Toàn Bằng Idempotency Key Chống Trừ Tiền Trùng',
      caption: 'Sử dụng Redis Distributed Lock và Lưu Cache Kết Quả Giao Dịch theo Idempotency Key',
      code: `sequenceDiagram
    autonumber
    participant C as Client (App Mobile)
    participant GW as API Gateway
    participant Cache as Redis (Idempotency Store)
    participant Pay as Payment Engine
    participant DB as Core Banking DB

    C->>GW: POST /api/v1/charge (Header: Idempotency-Key: uuid-999)
    GW->>Cache: SET idempotency:uuid-999 "IN_PROGRESS" NX EX 120
    alt Key Đã Tồn Tại (Thao Tác Retry)
        Cache-->>GW: Key Đã Có (Trạng Thái: COMPLETED, Response: {txnId: 888})
        GW-->>C: 200 OK (Trả về kết quả cũ ngay, không trừ tiền lần 2!)
    else Key Mới (Giao Dịch Hợp Lệ Lần Đầu)
        Cache-->>GW: OK (Khóa thành công)
        GW->>Pay: Xử lý trừ tiền thẻ
        Pay->>DB: UPDATE balances SET amount = amount - 500k
        Pay-->>GW: Thành công {txnId: 888}
        GW->>Cache: SET idempotency:uuid-999 {status: "COMPLETED", txnId: 888} EX 86400
        GW-->>C: 200 OK (Giao dịch thành công)
    end`
    }
  },

  'sys-048': {
    diagram: {
      type: 'mermaid',
      title: 'Ba Trụ Cột Của Observability: Logs, Metrics và Distributed Traces',
      caption: 'Sự kết hợp hoàn hảo để phát hiện, định vị và giải quyết sự cố sản xuất',
      code: `flowchart TD
    ProductionIssue["🚨 Sự Cố Production (Tỷ lệ lỗi tăng đột biến)"]
    
    subgraph MetricsPillar ["1. Metrics (Biết ĐIỀU GÌ đang xảy ra - Alerting)"]
        Prometheus["Prometheus / Datadog: Tỷ lệ HTTP 5xx vượt 5%, Latency P99 > 2s"]
    end
    
    subgraph TracesPillar ["2. Traces (Biết NƠI NÀO đang bị nghẽn - Context)"]
        Jaeger["Jaeger / Tempo: TraceID dẫn thẳng tới PaymentService bị timeout ở Span #4"]
    end

    subgraph LogsPillar ["3. Logs (Biết TẠI SAO nó bị lỗi - Root Cause)"]
        Loki["Loki / Elasticsearch: Chi tiết dòng log stack trace: 'Connection Refused to Bank Gateway'"]
    end

    ProductionIssue --> Prometheus
    Prometheus --> Jaeger
    Jaeger --> Loki`
    }
  },

  'sys-049': {
    diagram: {
      type: 'mermaid',
      title: 'Kiến Trúc Hệ Thống Gửi Webhook Đảm Bảo Delivery & Chống Xử Lý Trùng',
      caption: 'Mô hình chuẩn Stripe/GitHub với chữ ký HMAC-SHA256, Retry Exponential Backoff và Dead Letter Queue',
      code: `flowchart TD
    InternalEvent["Sự Kiện Nội Bộ (vd: 'payment.succeeded')"] --> Outbox[("Webhook Events Outbox")]
    Outbox --> Dispatcher["Webhook Dispatcher Worker"]
    
    subgraph DeliveryEngine ["Tầng Phân Phát Webhook (Delivery Engine)"]
        Dispatcher --> Signer["Tạo Chữ Ký: HMAC-SHA256(payload, client_secret)"]
        Signer --> SendHTTP["POST tới endpoint của Khách Hàng kèm Header 'X-Signature'"]
        SendHTTP --> CustomerWebhook["Máy Chủ Khách Hàng"]
    end

    CustomerWebhook --> ResponseCheck{"Khách trả về HTTP Status?"}
    ResponseCheck -->|"200 OK"| MarkSuccess["Đánh dấu Delivered thành công"]
    ResponseCheck -->|"5xx hoặc Timeout"| RetrySchedule["Thử Lại (Exponential Backoff: 5s, 1m, 15m, 1h, 24h)"]
    RetrySchedule -->|"Quá 5 lần thất bại"| DLQ[("Dead Letter Queue (Báo dashboard cho khách kiểm tra)")]`
    }
  },

  'sys-050': {
    diagram: {
      type: 'pipeline',
      title: 'Quy Trình Ước Lượng Dung Lượng Nhanh (Back-of-the-Envelope Estimation)',
      caption: 'Công thức 4 bước tính toán QPS, Storage và Băng thông mạng trong phỏng vấn kỹ thuật',
      stages: [
        { name: '1. QPS Trung Bình & Đỉnh', description: 'QPS = (DAU * Số thao tác/ngày) / 86,400s; Peak QPS = QPS trung bình * Hệ số 2 đến 5', duration: 'Bước 1' },
        { name: '2. Lưu Trữ Dữ Liệu (Storage / Year)', description: 'Dung lượng/ngày = Số bản ghi mới/ngày * Kích thước 1 bản ghi (bytes); Nhân với 365 ngày * Hệ số nhân bản 3', duration: 'Bước 2' },
        { name: '3. Bộ Nhớ Đệm (Cache RAM Size)', description: 'Quy tắc 80/20: Cache lưu trữ 20% dữ liệu được truy cập thường xuyên nhất trong 1 ngày', duration: 'Bước 3' },
        { name: '4. Băng Thông Mạng (Network Bandwidth)', description: 'Băng thông vào (Ingress) = Write QPS * Kích thước payload; Băng thông ra (Egress) = Read QPS * Kích thước dữ liệu', duration: 'Bước 4' }
      ]
    }
  },

  'sys-051': {
    diagram: {
      type: 'mermaid',
      title: 'So Sánh Các Chiến Lược Giải Phóng Bộ Nhớ Đệm: LRU vs LFU vs TTL',
      caption: 'Lựa chọn thuật toán loại bỏ phần tử khi bộ nhớ đệm đạt ngưỡng tối đa (Max Memory Limit)',
      code: `flowchart TD
    subgraph LRU ["LRU (Least Recently Used - Ít Dùng Gần Đây Nhất)"]
        LRU_Flow["Dùng Doubly Linked List + Hash Map: Truy cập phần tử -> Chuyển lên đầu Node. Đầy bộ nhớ -> Xóa Node ở đuôi cùng."]
        LRU_Fit["Phù hợp: 90% trường hợp web (Dữ liệu vừa đọc có xu hướng được đọc tiếp)"]
    end

    subgraph LFU ["LFU (Least Frequently Used - Ít Tần Suất Nhất)"]
        LFU_Flow["Mỗi phần tử gắn bộ đếm tần suất truy cập. Đầy bộ nhớ -> Xóa phần tử có số lần hit thấp nhất."]
        LFU_Fit["Phù hợp: Tài sản tĩnh tải nhiều đợt, hệ thống phát hiện tấn công DDoS"]
    end

    subgraph TTL ["TTL (Time-To-Live - Hết Hạn Tự Động)"]
        TTL_Flow["Gắn thời gian sống cứng (vd: 300s). Redis xóa theo 2 cách: Lazy Deletion + Periodic Active Sampling."]
        TTL_Fit["Phù hợp: Mã OTP, User Session, Dữ liệu nhạy cảm thời gian"]
    end`
    }
  },

  'sys-052': {
    diagram: {
      type: 'mermaid',
      title: 'Xử Lý Sự Cố Đơn Hàng Bị Kẹt Pending Do Rớt Webhook IPN Của Cổng Thanh Toán',
      caption: 'Cơ chế tự động khắc phục thông qua Cron Poller đối soát và Webhook Retry',
      code: `flowchart TD
    StuckOrder["Đơn hàng #123 kẹt trạng thái PENDING_PAYMENT > 15 phút"] --> CronJob["Cron Poller Đối Soát (Chạy mỗi 5 phút)"]
    
    CronJob --> QueryGW["Gọi API Đối Soát Chủ Động: GET /gateway/v1/orders/123/status"]
    
    QueryGW --> StatusCheck{"Cổng thanh toán báo trạng thái gì?"}
    
    StatusCheck -->|"Đã Trừ Tiền Thành Công"| AutoHeal["1. Tự động chuyển đơn sang PAID<br>2. Kích hoạt giữ hàng kho<br>3. Gửi email xác nhận bù cho khách"]
    
    StatusCheck -->|"Giao Dịch Thất Bại / Hết Hạn"| ExpireOrder["Chuyển đơn sang EXPIRED và nhả tồn kho"]
    
    StatusCheck -->|"Cổng Bị Lỗi Không Trả Lời"| Alert["Bắn Alert Telegram/Slack cho đội Vận hành (Manual Review)"]`
    }
  },

  'sys-053': {
    diagram: {
      type: 'mermaid',
      title: 'Quy Trình Hoàn Tiền (Refund Flow) Chuẩn ACID & Hai Chiều',
      caption: 'Đảm bảo tiền được hoàn trả an toàn không bao giờ bị nhân đôi hoặc thất thoát số dư',
      code: `sequenceDiagram
    autonumber
    participant Khach as Khách Hàng
    participant Core as Backend Sàn
    participant DB as Core Ledger DB
    participant Gateway as Cổng Thanh Toán (Stripe / VNPay)

    Khach->>Core: Yêu cầu hủy đơn & hoàn tiền
    Core->>Core: Kiểm tra điều kiện (Đơn chưa giao, trong vòng 7 ngày)
    Core->>DB: BEGIN TRANSACTION
    Core->>DB: 1. Đổi trạng thái đơn: REFUND_PENDING
    Core->>DB: 2. Ghi nhật ký bút toán hoàn tiền (Ledger Entry)
    Core->>DB: COMMIT TRANSACTION
    
    Core->>Gateway: POST /v1/refunds (Idempotency-Key: refund_order_123)
    Gateway-->>Core: HTTP 200 {refund_id: "rf_999", status: "succeeded"}
    
    Core->>DB: BEGIN TRANSACTION
    Core->>DB: Cập nhật trạng thái: REFUND_SUCCESS
    Core->>DB: Hoàn trả lại số dư kho hàng (Restock Inventory)
    Core->>DB: COMMIT TRANSACTION
    Core-->>Khach: Gửi thông báo: Tiền sẽ về tài khoản sau 1-3 ngày làm việc`
    }
  },

  'sys-054': {
    diagram: {
      type: 'mermaid',
      title: 'Kiến Trúc Tải Tệp Trực Tiếp Lên S3 Bằng Presigned URL An Toàn',
      caption: 'Client upload trực tiếp lên S3 không đi qua backend, sử dụng EventBridge thông báo hoàn tất',
      code: `sequenceDiagram
    autonumber
    participant C as Web / Mobile Client
    participant API as Backend API
    participant S3 as Amazon S3 Bucket
    participant Event as AWS EventBridge & Lambda

    C->>API: POST /api/upload-request {fileName: "video.mp4", fileType: "video/mp4", fileSize: 50MB}
    API->>API: Validate quyền người dùng & giới hạn dung lượng (< 100MB)
    API->>API: Sinh Presigned PUT URL kèm điều kiện Content-Type & Hash MD5 (Hết hạn sau 5 phút)
    API-->>C: Trả về Presigned URL
    
    C->>S3: PUT https://s3.amazonaws.com/... (Upload binary trực tiếp không tốn RAM backend)
    S3-->>C: 200 OK (S3 xác nhận nhận file)

    Note over S3,Event: XÁC THỰC FILE ĐÃ TẢI LÊN THÀNH CÔNG TỪ HẠ TẦNG
    S3-)Event: Sự kiện S3:ObjectCreated:Put
    Event->>API: Webhook thông báo: File đã upload hợp lệ tại key "videos/video.mp4"
    API->>API: Cập nhật DB trạng thái = UPLOADED & Kích hoạt Media Transcoder`
    }
  },

  'sys-055': {
    diagram: {
      type: 'mermaid',
      title: 'Kiến Trúc Tìm Kiếm Tiếng Việt Không Dấu & Lọc Thuộc Tính Nhanh (Faceted Search)',
      caption: 'Kết hợp PostgreSQL Full-Text Search (Unaccent/Trigram) và Elasticsearch cho E-commerce',
      code: `flowchart TD
    Query["Người dùng gõ: 'ao so mi nam trang'"] --> Normalize["Bộ Chuẩn Hóa Chuỗi (Normalizer):<br>• Lowercase<br>• Loại bỏ dấu (Unaccent): 'áo sơ mi' -> 'ao so mi'<br>• Tokenization & Stemming"]
    
    Normalize --> SearchEngine{"Quy mô Dữ Liệu Sản Phẩm?"}
    
    subgraph SmallScale ["Dưới 500.000 sản phẩm (PostgreSQL Native)"]
        SearchEngine --> Postgres["PostgreSQL Full-Text Search<br>• pg_trgm (Trigram Similarity > 0.3)<br>• GIN Index trên (to_tsvector('simple', unaccent(name)))"]
    end

    subgraph LargeScale ["Trên 500.000 sản phẩm (Elasticsearch / Meilisearch)"]
        SearchEngine --> ES["Elasticsearch Cluster<br>• Multi-match Query (Tên, Danh mục, Brand)<br>• Faceted Aggregations (Bộ lọc: Giá, Size, Màu sắc, Đánh giá)<br>• Fuzzy matching (Khoảng cách Levenshtein <= 2)"]
    end`
    }
  },

  'sys-056': {
    diagram: {
      type: 'mermaid',
      title: 'Kiến Trúc Audit Log Bất Biến (Immutable Audit Trail Architecture)',
      caption: 'Ghi lại mọi thay đổi "Ai sửa gì, lúc nào, giá trị cũ/mới" chống chối bỏ trách nhiệm',
      code: `flowchart LR
    User["Nhân Viên Cập Nhật Đơn Hàng"] --> API["Order API"]
    
    subgraph DB_Layer ["Cơ Sở Dữ Liệu PostgreSQL"]
        API --> Trigger["Database Trigger (AFTER UPDATE ON orders)"]
        Trigger --> OrderTable[("Bảng Chính: orders (Trạng thái mới nhất)")]
        Trigger --> AuditTable[("Bảng Audit: orders_audit_log (Append-only)")]
    end

    subgraph AuditSchema ["Cấu Trúc Bản Ghi Audit Log"]
        AuditTable --> Spec["• audit_id (UUID)<br>• table_name ('orders')<br>• record_id ('123')<br>• changed_by ('admin_uid_45')<br>• changed_at (TIMESTAMPTZ '2026-09-29T15:30:00Z')<br>• old_data (JSONB {status: 'PENDING'})<br>• new_data (JSONB {status: 'CANCELLED'})<br>• client_ip ('113.161.x.x')"]
    end`
    }
  },

  'sys-057': {
    diagram: {
      type: 'mermaid',
      title: 'Kiến Trúc Chuẩn Hóa Thời Gian Đa Múi Giờ (Multi-Timezone Architecture)',
      caption: 'Lưu trữ duy nhất UTC trong Database; chuyển đổi theo Timezone cục bộ tại tầng View',
      code: `flowchart LR
    subgraph Clients ["Người Dùng Khắp Toàn Cầu"]
        UserUS["Khách New York (UTC-4)<br>Nhìn thấy: 08:00 AM"]
        UserVN["Khách Hà Nội (UTC+7)<br>Nhìn thấy: 07:00 PM"]
    end

    subgraph StorageEngine ["Lưu Trữ Bền Vững (Database Core)"]
        UTC_DB[("Database PostgreSQL<br><b>BẮT BUỘC LƯU: TIMESTAMPTZ (UTC 00:00)</b><br>created_at: 2026-09-29T12:00:00.000Z")]
    end

    subgraph BusinessReports ["Báo Cáo Doanh Thu Doanh Nghiệp"]
        ReportVN["Chốt Sổ Cuối Ngày Theo Giờ VN (Asia/Ho_Chi_Minh):<br>WHERE created_at >= '2026-09-29 00:00:00+07'<br>  AND created_at <  '2026-09-30 00:00:00+07'"]
    end

    UserUS <--> UTC_DB
    UserVN <--> UTC_DB
    UTC_DB --> ReportVN`
    }
  },

  'sys-058': {
    diagram: {
      type: 'mermaid',
      title: 'Tối Ưu Bộ Đếm Lượt Xem Bài Viết: Tránh Nghẽn Khóa Hàng (Row-Lock Bottleneck)',
      caption: 'Thay vì UPDATE trực tiếp Database mỗi lượt xem, sử dụng Redis Buffer và Write-Behind Worker',
      code: `flowchart TD
    subgraph AntiPattern ["❌ CÁCH LÀM SAI (UPDATE posts SET views = views + 1)"]
        Reqs["10.000 người cùng đọc 1 bài viral lúc cao điểm"] --> RowLock["Hàng chục nghìn transaction cạnh tranh Khóa Hàng (Row Lock) trên cùng 1 record!"]
        RowLock --> Crash["DB Connection Pool cạn kiệt, CPU 100%, sập toàn bộ sàn."]
    end

    subgraph HighPerfPattern ["✅ CÁCH LÀM ĐÚNG (Write-Behind In-Memory Buffer)"]
        Reqs2["10.000 người đọc"] --> RedisIncr["Redis In-memory: INCR article:456:views (< 0.1ms)"]
        RedisIncr --> ReadFast["Người dùng thấy view tăng ngay"]
        
        CronWorker["Background Worker (Chạy mỗi 60s)"] --> GetDelta["Lấy tổng delta từ Redis (GETSET article:456:views 0)"]
        GetDelta --> SingleWrite["Chỉ chạy đúng 1 câu lệnh SQL duy nhất:<br>UPDATE posts SET views = views + 10000 WHERE id = 456"]
        SingleWrite --> Postgres[("PostgreSQL DB")]
    end`
    }
  },

  'sys-059': {
    diagram: {
      type: 'mermaid',
      title: 'Công Thức Ước Lượng Hạ Tầng Cho Hệ Thống 10 Triệu Người Dùng (10M DAU)',
      caption: 'Mô phỏng phép tính phân rã từ DAU thành QPS, Dung lượng lưu trữ đĩa và Băng thông mạng',
      code: `flowchart TD
    DAU["10 Triệu Người Dùng Hoạt Động Hằng Ngày (10M DAU)"] --> Actions["Mỗi user thực hiện trung bình 20 request/ngày"]
    Actions --> TotalReq["Tổng Request/ngày = 10M * 20 = 200 Triệu requests/ngày"]
    
    TotalReq --> QPS["<b>QPS Trung Bình:</b> 200.000.000 / 86.400s ≈ <b>2.300 req/s</b>"]
    QPS --> PeakQPS["<b>Peak QPS (Giờ cao điểm x3):</b> 2.300 * 3 ≈ <b>7.000 req/s</b>"]
    
    TotalReq --> Storage["Mỗi request lưu 1KB log/dữ liệu:<br>200M * 1KB = <b>200 GB/ngày</b> ≈ <b>73 TB/năm</b>"]
    PeakQPS --> Bandwidth["Băng thông cao điểm (1KB/req):<br>7.000 * 1KB = 7 MB/s ≈ <b>56 Mbps</b>"]`
    }
  },

  'sys-060': {
    diagram: {
      type: 'mermaid',
      title: 'Vì Sao Phải Đo Latency Phân Vị (p50, p95, p99) Thay Vì Giá Trị Trung Bình?',
      caption: 'Giá trị trung bình che giấu hoàn toàn trải nghiệm tồi tệ của nhóm khách hàng chịu độ trễ đuôi dài (Long-tail latency)',
      code: `flowchart TD
    subgraph MeanTrap ["Bẫy Độ Trễ Trung Bình (Average Latency)"]
        CaseAvg["99 khách phản hồi trong 10ms<br>1 khách phản hồi trong 10.000ms (10 giây)<br>=> <b>Trung bình = 109ms (Nhìn có vẻ ổn!)</b>"]
    end

    subgraph Percentiles ["Các Mốc Phân Vị Thực Tế (Percentiles)"]
        P50["<b>p50 (Median - 50% người dùng):</b> <= 10ms (Nhanh tuyệt đối)"]
        P95["<b>p95 (95% người dùng):</b> <= 25ms (Rất tốt)"]
        P99["<b>p99 (1% khách hàng chi tiêu lớn nhất / giỏ hàng nhiều nhất):</b> 10.000ms (CỰC KỲ CHẬM!)"]
    end

    Percentiles --> Decision["Kỹ sư System Design bắt buộc phải tối ưu <b>p99</b> để không đánh mất khách hàng VIP!"]`
    }
  },

  'sys-061': {
    diagram: {
      type: 'mermaid',
      title: 'Phân Biệt SLI, SLO và SLA Kèm Bảng Quy Đổi Thời Gian Downtime Cho Phép',
      caption: 'Cam kết mức độ dịch vụ từ thước đo kỹ thuật đến thỏa thuận pháp lý bồi thường',
      code: `flowchart TD
    SLI["<b>1. SLI (Service Level Indicator - Thước Đo Thực Tế)</b><br>Tỷ lệ request thành công = (Số request 200 OK / Tổng request) * 100%"]
    SLI --> SLO["<b>2. SLO (Service Level Objective - Mục Tiêu Nội Bộ Của Team)</b><br>Mục tiêu: Đạt 99.95% availability trong mỗi tháng. Nếu vi phạm, dừng code tính năng để fix bug."]
    SLO --> SLA["<b>3. SLA (Service Level Agreement - Cam Kết Hợp Đồng Pháp Lý)</b><br>Cam kết với khách hàng: Đạt tối thiểu 99.9%. Nếu dưới 99.9%, hoàn tiền 20% phí thuê bao."]
    
    subgraph DowntimeTable ["Bảng Quy Đổi Downtime Cho Phép Trong 1 Tháng (30 ngày)"]
        D1["99.0% (Hai số 9): Cho phép sập tối đa <b>7.2 giờ/tháng</b>"]
        D2["99.9% (Ba số 9): Cho phép sập tối đa <b>43.2 phút/tháng</b>"]
        D3["99.99% (Bốn số 9): Cho phép sập tối đa <b>4.32 phút/tháng</b>"]
        D4["99.999% (Năm số 9): Cho phép sập tối đa <b>26 giây/tháng</b>"]
    end`
    }
  },

  'sys-062': {
    diagram: {
      type: 'pipeline',
      title: 'Quy Trình Trình Bày Thiết Kế API Chuẩn Mực Trong Phỏng Vấn Kỹ Thuật',
      caption: 'Thiết kế RESTful / gRPC rõ ràng, đầy đủ tham số phân trang, header bảo mật và mã lỗi',
      stages: [
        { name: '1. Endpoint & HTTP Verb', description: 'Chọn đúng động từ ngữ nghĩa: GET /api/v1/orders, POST /api/v1/orders, PUT/PATCH, DELETE', duration: 'Bước 1' },
        { name: '2. Request Payload & Headers', description: 'Đặc tả schema JSON, Idempotency-Key header, Authorization Bearer token', duration: 'Bước 2' },
        { name: '3. Chiến Lược Phân Trang (Pagination)', description: 'Giải thích vì sao dùng Cursor-based pagination (?cursor=abc&limit=20) thay vì Offset-based pagination khi dữ liệu lớn', duration: 'Bước 3' },
        { name: '4. Response & Mã Lỗi Chuẩn RFC 7807', description: 'Cấu trúc lỗi chuẩn {type, title, status: 409, detail, instance} và định dạng ngày tháng ISO 8601', duration: 'Bước 4' }
      ]
    }
  },

  'sys-063': {
    diagram: {
      type: 'mermaid',
      title: 'Các Bước Quyết Định Mô Hình Dữ Liệu (Data Modeling Decision Flow)',
      caption: 'Căn cứ vào mô hình truy cập (Access Patterns) để quyết định cấu trúc bảng và công nghệ lưu trữ',
      code: `flowchart TD
    Step1["1. Xác định các Thực thể chính (Entities) và Quan hệ (1-1, 1-N, N-N)"] --> Step2["2. Phân tích Mô Hình Truy Cập (Access Patterns):<br>• Tỷ lệ Read vs Write?<br>• Truy vấn theo thuộc tính nào nhiều nhất (WHERE / ORDER BY)?"]
    Step2 --> Step3["3. Lựa chọn Công Nghệ Lưu Trữ (Relational vs Document vs Key-Value)"]
    Step3 --> Step4["4. Thiết kế Index (Primary Key, Compound Index, Sharding Key)"]
    Step4 --> Step5["5. Dự tính Tăng Trưởng Dữ Liệu & Chiến Lược Lưu Trữ Cũ (Data Archival)"]`
    }
  },

  'sys-064': {
    diagram: {
      type: 'mermaid',
      title: 'Rà Soát Điểm Lỗi Đơn Độc (Single Point of Failure - SPOF) Trong Kiến Trúc',
      caption: 'Triệt tiêu mọi mắt xích đơn độc bằng cách áp dụng dự phòng Active-Passive hoặc Active-Active',
      code: `flowchart TD
    subgraph SPOF_Architecture ["❌ KIẾN TRÚC CÓ NHIỀU ĐIỂM CHẾT (SPOF)"]
        User1["Users"] --> DNS1["1 DNS đơn lẻ"] --> LB1["1 Load Balancer đơn lẻ (SPOF!)"]
        LB1 --> App1["Nhiều App Nodes"]
        App1 --> Master1["1 Database Master duy nhất (SPOF!)"]
    end

    subgraph ResilientArchitecture ["✅ KIẾN TRÚC KHÔNG SPOF (HIGH AVAILABILITY)"]
        User2["Users"] --> AnycastDNS["Route53 Multi-Region Anycast DNS"]
        AnycastDNS --> HA_LB["Active-Passive Load Balancers (Keepalived / VRRP)"]
        HA_LB --> AppCluster["Autoscaling App Fleet (Nhiều Availability Zones)"]
        AppCluster --> DBCluster[("Primary DB + Tự Động Failover (Patroni / AWS Aurora Multi-AZ)")]
    end`
    }
  },

  'sys-065': {
    diagram: {
      type: 'mermaid',
      title: 'Cơ Chế Timeout, Retry Jitter và Phòng Ngừa Sự Cố Xếp Tầng (Cascading Failure)',
      caption: 'Khi service phụ thuộc bị chậm, thiếu timeout sẽ nuốt trọn thread pool và làm sập toàn bộ hệ thống',
      code: `flowchart TD
    Client["Client Request"] --> ServiceA["Service A (100 Threads)"]
    
    subgraph BadCall ["❌ Không Có Timeout / Timeout Quá Dài (30s)"]
        ServiceA -->|"Gọi đồng bộ"| ServiceB_Slow["Service B (Đang bị lag, mất 15s để trả lời)"]
        NoteDead["100 Threads của Service A đều bị block chờ Service B -> Service A cạn thread pool -> Service A sập theo!"]
    end

    subgraph GoodCall ["✅ Timeout Chặt Chẽ + Circuit Breaker"]
        ServiceA -->|"Timeout = 800ms"| CircuitBreaker{"Circuit Breaker"}
        CircuitBreaker -->|"Nếu 50% request dính timeout"| Trip["OPEN: Ngắt cuộc gọi tới B, trả về Fallback data ngay lập tức (< 5ms)"]
        Trip --> SaveA["Service A bảo toàn 100% thread pool, phục vụ các tính năng khác bình thường"]
    end`
    }
  },

  'sys-066': {
    diagram: {
      type: 'mermaid',
      title: 'So Sánh: Sticky Session (Session Affinity) vs Stateless Distributed Session',
      caption: 'Sticky Session ghim user vào server cố định; Stateless Session cho phép scale ngang tự do',
      code: `flowchart TD
    subgraph StickySession ["Sticky Session (Ghim Cookie Server)"]
        LB_Sticky{"Load Balancer (Ghim theo IP/Cookie)"}
        LB_Sticky -->|"User 1 luôn về"| Server1["Server A (Chứa Session in-memory của User 1)"]
        LB_Sticky -->|"User 2 luôn về"| Server2["Server B"]
        NoteSticky["⚠️ Khi Server A bảo trì hoặc crash -> User 1 bị mất giỏ hàng & đăng xuất!"]
    end

    subgraph StatelessSession ["Stateless Session (Tập Trung Hóa)"]
        LB_Stateless{"Load Balancer (Round Robin ngẫu nhiên)"}
        LB_Stateless --> S1["Bất kỳ Server A, B, C nào"]
        S1 <--> CentralRedis[("Redis Session Cluster")]
        NoteStateless["✅ Bất kỳ server nào chết, các server khác đọc Redis vẫn thấy phiên làm việc!"]
    end`
    }
  },

  'sys-067': {
    diagram: {
      type: 'mermaid',
      title: 'Khắc Phục Lỗi Vừa Ghi Xong Không Đọc Được Do Độ Trễ Sao Chép (Replication Lag)',
      caption: 'Cơ chế Read-After-Write Consistency: Ghim phiên người dùng đọc từ Master trong khoảng thời gian an toàn',
      code: `sequenceDiagram
    autonumber
    participant U as Người Dùng
    participant API as Backend API
    participant Master as PostgreSQL Primary (Ghi)
    participant Replica as PostgreSQL Read Replica (Đọc)

    U->>API: 1. POST /profile/update (Đổi tên thành "Nam Nguyễn")
    API->>Master: UPDATE users SET name = 'Nam Nguyễn'
    Master-->>API: 200 OK
    API-->>U: Cập nhật thành công + Set Cookie "recently_updated=true; Max-Age=5"

    Note over Master,Replica: ⚠️ Dữ liệu đang đồng bộ ngầm sang Replica (mất khoảng 1-2 giây)
    
    U->>API: 2. GET /profile (Tải lại trang ngay lập tức)
    alt Có Cookie "recently_updated"
        API->>Master: Đọc trực tiếp từ Master DB!
        Master-->>API: Trả về "Nam Nguyễn" (Mới nhất)
    else Không có Cookie (Đọc thông thường)
        API->>Replica: Đọc từ Read Replica
    end
    API-->>U: Hiển thị đúng dữ liệu vừa lưu`
    }
  },

  'sys-068': {
    diagram: {
      type: 'mermaid',
      title: 'Giới Hạn Tốc Độ Phân Tán (Distributed Rate Limiting) Dùng Redis Sliding Window',
      caption: 'Thay vì đếm cục bộ trên từng node, sử dụng Redis Sorted Sets để kiểm soát chính xác trên toàn cụm',
      code: `flowchart TD
    User["Khách Gọi API (Limit: 100 req/phút)"] --> LB{"Load Balancer"}
    LB --> Node1["App Instance 1"]
    LB --> Node2["App Instance 2"]
    LB --> NodeN["App Instance N"]
    
    subgraph DistributedCheck ["Kiểm Tra Tập Trung Trên Redis Cluster"]
        Node1 & Node2 & NodeN --> RedisScript["Chạy Redis Lua Script (Atomic Transaction)"]
        RedisScript --> ZRem["1. ZREMRANGEBYSCORE rate:user_123 0 (now - 60s) // Xóa request cũ"]
        RedisScript --> ZCard["2. ZCARD rate:user_123 // Đếm số request trong 60s qua"]
        RedisScript --> Condition{"Số lượng request >= 100?"}
        Condition -->|"Vượt ngưỡng"| Reject["Từ chối: HTTP 429 Too Many Requests"]
        Condition -->|"Hợp lệ"| Allow["3. ZADD rate:user_123 now now + Cho phép đi tiếp vào DB"]
    end`
    }
  },

  'sys-069': {
    diagram: {
      type: 'mermaid',
      title: 'Cơ Chế Làm Phẳng Đỉnh Tải (Peak Load Shaving) Bằng Hàng Đợi (Message Queue)',
      caption: 'Bảo vệ cơ sở dữ liệu và hệ thống nội bộ không bị nghẽn thở khi lưu lượng tăng đột biến',
      code: `flowchart LR
    subgraph TrafficBurst ["Lưu Lượng Tải Đột Biến (Flash Sale)"]
        Inflow["100.000 req/s đổ vào trong 10 phút"]
    end

    Inflow --> BufferQueue[("Kafka / RabbitMQ Queue<br>(Hồ chứa đệm dung tích hàng triệu tin nhắn)")]

    subgraph SteadyProcessing ["Xử Lý Ổn Định Bền Bỉ"]
        BufferQueue --> Workers["Đội Ngũ Worker Tiêu Thụ"]
        Workers --> SafeDB[("Database Chỉ Chịu Tải 2.000 req/s An Toàn")]
    end`
    }
  },

  'sys-070': {
    diagram: {
      type: 'mermaid',
      title: 'Chiến Lược Chọn Metric Cho Autoscaling Và Hiện Tượng Chậm Khởi Động (Cold Start)',
      caption: 'Kết hợp Queue Length / Request Latency với Predictive Scaling thay vì chỉ nhìn vào CPU thô',
      code: `flowchart TD
    subgraph MetricChoice ["Lựa Chọn Chỉ Số Kích Hoạt Scale (Autoscaling Metrics)"]
        BadMetric["❌ Chỉ dựa vào CPU: Khi CPU đạt 80%, server mất 3-5 phút khởi động Docker/JVM -> Khách hàng đã bị timeout trước khi node mới online!"]
        GoodMetric["✅ Dựa vào Tốc Độ Tăng Trưởng Hàng Đợi (Queue Length) & Số Kết Nối Đồng Thời:<br>Kích hoạt node mới ngay khi Queue bắt đầu dồn ứ."]
    end

    subgraph ColdStartSolution ["Giải Pháp Triệt Tiêu Cold Start"]
        WarmPool["1. Duy trì sẵn Warm Pool (Instance đã nạp sẵn JVM/Memory)"]
        Predictive["2. Scheduled / Predictive Scaling: Bật trước 50 node lúc 11:55 trước giờ Flash Sale 12:00"]
    end`
    }
  },

  'sys-071': {
    diagram: {
      type: 'mermaid',
      title: 'Hiện Tượng Cạn Kiệt Kết Nối Database Khi Scale Ngang 40 Instances và Giải Pháp PgBouncer',
      caption: 'Đặt Connection Pooler tập trung phía trước Database để gộp hàng nghìn socket ứng dụng thành vài chục socket DB',
      code: `flowchart TD
    subgraph StarvationProblem ["❌ SỰ CỐ: 40 Instances x 20 Pool = 800 Kết Nối Tới Database"]
        Nodes1["40 App Instances"] -->|"800 persistent TCP connections"| PostgresDown[("PostgreSQL Server<br>❌ LỖI: 'FATAL: sorry, too many clients already'")]
    end

    subgraph PgBouncerSolution ["✅ GIẢI PHÁP: Connection Pooler Tập Trung (PgBouncer / AWS RDS Proxy)"]
        Nodes2["40 App Instances (Hàng nghìn kết nối nhẹ)"] --> PgBouncer["<b>PgBouncer Cluster</b><br>(Transaction Pooling)"]
        PgBouncer -->|"Duy trì đúng 50 kết nối chất lượng cao"| PostgresHappy[("PostgreSQL Server<br>✅ Hoạt động mượt mà, RAM tối ưu, CPU 40%")]
    end`
    }
  }
};

// Execute updates
console.log('🚀 Running Batch 3 Enrichment...');
updateBank('system-design-bank.json', sysUpdates);
console.log('✅ Batch 3 completed successfully.');
