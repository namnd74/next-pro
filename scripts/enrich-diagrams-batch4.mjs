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
// SYSTEM DESIGN BANK (25 Questions: sys-072 to sys-100)
// ==========================================
const sysUpdates = {
  'sys-072': {
    diagram: {
      type: 'mermaid',
      title: 'Kiến Trúc Danh Mục & Tìm Kiếm Đa Tiêu Chí Sàn Thương Mại Điện Tử',
      caption: 'Kết hợp mô hình Materialized Path trong RDBMS và Elasticsearch Faceted Inverted Index',
      code: `flowchart TD
    Client["Người dùng tìm kiếm: 'Laptop Gaming ASUS 16GB'"] --> SearchGW["Search & Catalog Gateway"]
    
    subgraph StorageLayer ["Tầng Lưu Trữ & Chỉ Mục"]
        RDBMS[("PostgreSQL: Quản lý Cây Danh Mục (Materialized Path: /electronics/computers/laptops)")]
        ESCluster[("Elasticsearch Cluster: Chỉ Mục Tìm Kiếm (Inverted Index)")]
    end

    SearchGW --> ESCluster
    ESCluster --> MultiFacet["1. Text Search (BM25 + N-gram)<br>2. Filter: Brand = 'ASUS', RAM = '16GB'<br>3. Aggregations: Đếm số lượng theo mức giá & khoảng pin"]
    
    RDBMS -.->|"CDC Sync đồng bộ sản phẩm mới"| ESCluster`
    }
  },

  'sys-073': {
    diagram: {
      type: 'mermaid',
      title: 'Kiến Trúc Theo Dõi Vị Trí Shipper Thời Gian Thực (Realtime Driver Tracking)',
      caption: 'Sử dụng Redis Geospatial Indexing (GEOADD/GEORADIUS) và WebSocket Push siêu tốc',
      code: `flowchart LR
    Shipper["App Shipper (Mỗi 3s gửi GPS: lat, lng)"] --> WSIngest["WebSocket Ingestion Cluster"]
    
    subgraph GeoEngine ["Tầng Xử Lý Tọa Độ (In-Memory Layer)"]
        WSIngest --> RedisGeo[("Redis Cluster (GEOADD drivers:hanoi lat lng shipper_123)")]
        RedisGeo --> HistoryBuffer["Buffer ghi lịch sử hành trình vào Kafka"]
    end

    subgraph ConsumerSync ["Tầng Phục Vụ Khách Hàng"]
        RedisGeo -->|"GEORADIUS: Tìm shipper gần đơn hàng nhất"| Matcher["Matching Service"]
        WSIngest -->|"Push tọa độ thời gian thực qua WebSocket"| ClientApp["App Khách Hàng (Xem shipper di chuyển trên bản đồ)"]
    end`
    }
  },

  'sys-075': {
    diagram: {
      type: 'mermaid',
      title: 'Kiến Trúc Bảng Tin (News Feed) Cho Ứng Dụng Mới (Fan-out on Read / Pull Model)',
      caption: 'Chiến lược tối ưu chi phí và đơn giản hóa hạ tầng khi hệ thống có dưới 1 triệu người dùng',
      code: `flowchart TD
    UserOpen["Người dùng mở ứng dụng (Xem Feed)"] --> FeedService["News Feed Service"]
    
    subgraph PullModel ["Mô Hình Kéo (Fan-out on Read - Pull Model)"]
        FeedService --> GetFollowees["1. Truy vấn danh sách người đang follow (SELECT followee_id FROM follows WHERE follower_id = 123)"]
        GetFollowees --> FetchPosts["2. Truy vấn 20 bài viết mới nhất của bạn bè:<br>SELECT * FROM posts WHERE user_id IN (...) ORDER BY created_at DESC LIMIT 20"]
        FetchPosts --> Ranker["3. Sắp xếp & Trộn quảng cáo / gợi ý"]
    end

    Ranker --> CacheFeed["Lưu kết quả vào Redis Feed Cache (TTL = 5 phút)"]
    CacheFeed --> ReturnUI["Trả về danh sách bài viết cho người dùng (< 50ms)"]`
    }
  },

  'sys-076': {
    diagram: {
      type: 'mermaid',
      title: 'Kiến Trúc Hệ Thống Thông Báo Đa Kênh (Multi-Channel Notification Engine)',
      caption: 'Định tuyến thông minh theo mức độ ưu tiên, chống spam tần suất và dự phòng nhà cung cấp',
      code: `flowchart TD
    InternalSrv["Core Services (Đơn Hàng / OTP / Marketing)"] --> PriorityRouter{"Phân Loại Mức Độ Ưu Tiên"}
    
    subgraph Queues ["Hàng Đợi Theo Ưu Tiên (Priority Queues)"]
        PriorityRouter -->|"Khẩn cấp (P0: OTP, Cảnh báo bảo mật)"| Q_High[("Queue Ưu Tiên Cao (Kafka / SQS)")]
        PriorityRouter -->|"Nghiệp vụ (P1: Đã giao hàng, trừ tiền)"| Q_Med[("Queue Nghiệp Vụ")]
        PriorityRouter -->|"Quảng cáo (P2: Khuyến mãi cuối tuần)"| Q_Low[("Queue Tiếp Thị")]
    end

    subgraph Dispatcher ["Bộ Điều Phối & Lọc Spam (Rate Limiter & User Preferences)"]
        Q_High & Q_Med & Q_Low --> Dispatch["Dispatcher Worker"]
        Dispatch --> UserPref{"Người dùng có bật nhận kênh này? Tần suất < 3 tin/ngày?"}
    end

    subgraph Providers ["Nhà Cung Cấp Hạ Tầng (Kèm Circuit Breaker)"]
        UserPref -->|"Push"| FCM["FCM / APNs (Mobile Push)"]
        UserPref -->|"SMS"| SMSFailover{"SMS Gateway: SpeedSMS (Chính) -> Viettel (Dự phòng)"}
        UserPref -->|"Email"| SES["AWS SES / SendGrid"]
    end`
    }
  },

  'sys-077': {
    diagram: {
      type: 'mermaid',
      title: 'Quy Trình Tải Lên & Mã Hóa Video/Ảnh Bất Đồng Bộ (Media Transcoding Pipeline)',
      caption: 'Tải trực tiếp lên S3, xử lý đa độ phân giải (HLS/DASH) bằng Worker cụm phân tán',
      code: `flowchart TD
    Client["App Mobile"] -->|"1. Upload trực tiếp qua Presigned URL"| RawBucket[("Amazon S3: Raw Bucket")]
    
    RawBucket -->|"2. Kích hoạt Event S3:ObjectCreated"| EventBridge["AWS EventBridge"]
    EventBridge --> TranscodeQueue[("SQS Transcode Queue")]
    
    subgraph TranscodeFleet ["Cụm Worker Chuyển Đổi Định Dạng (FFmpeg)"]
        TranscodeQueue --> Worker["Worker Pod (Auto-scaling GPU/CPU)"]
        Worker --> Process["1. Trích xuất Thumbnail ảnh bìa<br>2. Chuyển đổi HLS (1080p, 720p, 480p, 360p)<br>3. Tạo file playlist m3u8"]
    end

    Process --> PublicBucket[("Amazon S3: Public Transcoded Media")]
    PublicBucket --> CDN["CloudFront CDN"]
    Process --> UpdateDB["Cập nhật trạng thái video = 'READY' trong PostgreSQL"]
    UpdateDB --> PushReady["Gửi thông báo: 'Video của bạn đã sẵn sàng phát!'"]`
    }
  },

  'sys-078': {
    diagram: {
      type: 'mermaid',
      title: 'Kiến Trúc Đặt Lịch Khám: Quản Lý Khung Giờ Trống & Chống Đặt Trùng (Overbooking Prevention)',
      caption: 'Sử dụng Redis Distributed Lock và Optimistic Concurrency Control trong Database',
      code: `sequenceDiagram
    autonumber
    participant BN1 as Bệnh Nhân A
    participant BN2 as Bệnh Nhân B
    participant API as Booking Service
    participant Redis as Redis Lock
    participant DB as PostgreSQL

    Note over BN1,BN2: Hai người cùng bấm đặt khung giờ 09:00 Bác sĩ X
    par Cùng gửi request đặt slot
        BN1->>API: POST /bookings (Doctor: X, Slot: 09:00)
        BN2->>API: POST /bookings (Doctor: X, Slot: 09:00)
    end

    API->>Redis: SET lock:slot:X:0900 uuid_A NX EX 10
    Redis-->>API: Cấp khóa thành công cho Bệnh Nhân A!
    
    API->>Redis: SET lock:slot:X:0900 uuid_B NX EX 10
    Redis-->>API: ❌ Khóa đã tồn tại (Từ chối Bệnh Nhân B)
    API-->>BN2: Thông báo: "Khung giờ này vừa có người đặt, vui lòng chọn slot khác!"

    API->>DB: BEGIN TRANSACTION
    API->>DB: UPDATE appointment_slots SET status = 'BOOKED', patient_id = A WHERE id = 123 AND status = 'AVAILABLE'
    API->>DB: COMMIT TRANSACTION
    API->>Redis: Xóa khóa giải phóng
    API-->>BN1: Đặt lịch thành công! Mã khám #888`
    }
  },

  'sys-079': {
    diagram: {
      type: 'mermaid',
      title: 'Tổng Hợp Dữ Liệu Chi Tiết Đơn Hàng (BFF - Backend For Frontend Pattern)',
      caption: 'Tránh việc Mobile Client phải gọi đồng thời 4 microservices gây chậm mạng và tốn pin',
      code: `flowchart TD
    MobileClient["Ứng Dụng Mobile (Màn Hình Chi Tiết Đơn)"] -->|"Duy nhất 1 API Call: GET /api/bff/orders/123"| BFF["<b>Backend For Frontend (BFF Service)</b>"]
    
    subgraph InternalParallelFetch ["Gọi Song Song Nội Bộ Bằng gRPC Siêu Tốc (< 15ms)"]
        BFF --> OrderSrv["Order Service (Trạng thái, ngày đặt)"]
        BFF --> UserSrv["User Service (Tên, SĐT giao hàng)"]
        BFF --> PaySrv["Payment Service (Phương thức, mã giao dịch)"]
        BFF --> ShipSrv["Shipping Service (Vị trí kiện hàng, shipper)"]
    end

    OrderSrv & UserSrv & PaySrv & ShipSrv --> Aggregator["Tổng hợp & Chuyển đổi định dạng chuẩn (DTO)"]
    Aggregator --> ReturnApp["Trả về 1 cục JSON tinh gọn duy nhất cho Mobile UI (< 50ms)"]`
    }
  },

  'sys-080': {
    diagram: {
      type: 'mermaid',
      title: 'Lan Truyền Ngữ Cảnh Truy Vết Phân Tán (Context Propagation Qua Message Queue)',
      caption: 'Chuẩn W3C TraceContext truyền traceparent header xuyên qua HTTP và Kafka',
      code: `flowchart LR
    SrvA["Service A (Sinh TraceID: 4bf92f3577b34da6)"] -->|"HTTP Request kèm Header:<br>traceparent: 00-4bf92f3577b34da6-00f067aa0ba902b7-01"| SrvB["Service B"]
    
    SrvB -->|"Tiêm traceparent vào Kafka Record Header"| Kafka[("Kafka Topic: 'orders'")]
    
    Kafka -->|"Trích xuất header khi consume"| SrvC["Service C (Worker)"]
    
    SrvA & SrvB & SrvC -.->|"Gửi span cùng TraceID"| Jaeger["Hệ Thống Jaeger UI (Hiển thị trọn vẹn luồng 1 vết duy nhất)"]`
    }
  },

  'sys-081': {
    diagram: {
      type: 'mermaid',
      title: 'Cơ Chế Service Discovery: Kubernetes Native DNS vs Consul/Eureka',
      caption: 'Cách các microservices tự động tìm thấy IP của nhau trong môi trường container động',
      code: `flowchart TD
    subgraph K8sNative ["Mô Hình Kubernetes Native Service Discovery (Khuyên Dùng Hiện Đại)"]
        PodClient["Payment Pod"] --> CallName["Gọi tên dịch vụ: http://order-service:8080"]
        CallName --> CoreDNS["CoreDNS Nội Bộ K8s: Phân giải 'order-service' -> Virtual ClusterIP (10.96.0.1)"]
        CoreDNS --> KubeProxy["Kube-Proxy (iptables / IPVS)"]
        KubeProxy --> Pod1["Order Pod 1 (172.17.0.4)"]
        KubeProxy --> Pod2["Order Pod 2 (172.17.0.5)"]
    end

    subgraph ClientSideConsul ["Mô Hình Client-Side Discovery Cũ (Eureka / Consul)"]
        OldPod["Client App"] <--> ConsulReg[("Consul / Eureka Registry Server")]
        NoteConsul["Client phải tự lưu cache danh sách IP và tự chạy thuật toán cân bằng tải"]
    end`
    }
  },

  'sys-082': {
    diagram: {
      type: 'mermaid',
      title: 'Kiến Trúc Hệ Thống Chat Thời Gian Thực (Real-Time Chat System Architecture)',
      caption: 'Duy trì hàng triệu kết nối WebSocket đồng thời kết hợp Redis Pub/Sub và Lưu trữ Cassandra',
      code: `flowchart TD
    UserA["Người Dùng A (Gửi tin nhắn)"] --> WS_A["WebSocket Gateway Cluster (Node A)"]
    
    WS_A --> ChatSrv["Chat Message Service"]
    
    subgraph MessagePersistence ["Lưu Trữ & Phân Phối Tức Thì"]
        ChatSrv --> MsgDB[("Cassandra / ScyllaDB (Lưu tin nhắn Append-only theo ConversationID)")]
        ChatSrv --> RedisPresence[("Redis: Kiểm tra Người Dùng B đang kết nối ở đâu?")]
        RedisPresence -->|"User B đang ở Node B"| RedisChannel["Redis Pub/Sub Channel: 'user_B_channel'"]
    end

    subgraph DeliveryBranch ["Nhánh Phân Phát Tin Nhắn"]
        RedisChannel --> WS_B["WebSocket Gateway (Node B)"]
        WS_B --> UserB["Người Dùng B (Nhận tin ngay lập tức)"]
        
        RedisPresence -.->|"Nếu User B đang OFFLINE"| PushEngine["Kích hoạt FCM / APNs Push Notification"]
    end`
    }
  },

  'sys-083': {
    diagram: {
      type: 'mermaid',
      title: 'Kỹ Thuật Phân Trang Cho Bảng Tin Cuộn Vô Hạn (Cursor-Based vs Offset-Based Pagination)',
      caption: 'Vì sao Cursor Pagination là lựa chọn bắt buộc cho Infinite Scroll mạng xã hội',
      code: `flowchart TD
    subgraph OffsetProblem ["❌ OFFSET PAGINATION (LIMIT 20 OFFSET 1000000)"]
        P1["SELECT * FROM posts ORDER BY id LIMIT 20 OFFSET 1000000"]
        Problem1["1. Database phải quét qua 1 triệu dòng rồi vứt bỏ -> Cực kỳ chậm!<br>2. Nếu có người đăng bài mới lúc user đang cuộn -> Bài viết bị lặp lại hoặc bị trôi mất!"]
    end

    subgraph CursorSolution ["✅ CURSOR PAGINATION (WHERE id < cursor LIMIT 20)"]
        P2["SELECT * FROM posts WHERE id < 987654 ORDER BY id DESC LIMIT 20"]
        Solution1["1. Dùng B-Tree Index trên khóa chính -> Nhảy trực tiếp tới điểm cần lấy trong O(log N)<br>2. Không bao giờ bị trùng hoặc sót bài viết dù có hàng nghìn bài mới đăng xen kẽ!"]
    end`
    }
  },

  'sys-084': {
    diagram: {
      type: 'mermaid',
      title: 'Kiến Trúc Nền Tảng Kéo Thả Form Động (Dynamic Form Builder Engine)',
      caption: 'Mô hình hóa cây trừu tượng AST (Abstract Syntax Tree) và Trình thông dịch Validation',
      code: `flowchart LR
    Builder["Giao Diện Kéo Thả (Builder Canvas)"] --> JSON_AST["Cấu Trúc JSON Schema (AST):<br>{id: 'f1', type: 'text', validation: {required: true}}"]
    
    subgraph RuntimeEngine ["Bộ Render & Thực Thi Động (Form Renderer Engine)"]
        JSON_AST --> Registry["Component Registry (Khớp 'type' với Component React)"]
        JSON_AST --> FormikState["State Machine & Quản Lý Form (React Hook Form / Zod)"]
        Registry & FormikState --> RenderDOM["Render Giao Diện & Xác Thực Thời Gian Thực"]
    end

    RenderDOM --> SubmitPayload["Đóng gói dữ liệu người dùng gửi về Server"]`
    }
  },

  'sys-085': {
    diagram: {
      type: 'mermaid',
      title: 'Các Chiến Lược Phân Vùng Dữ Liệu (Data Partitioning / Sharding Strategies)',
      caption: 'So sánh Phân vùng Ngang (Horizontal Sharding) và Phân vùng Dọc (Vertical Partitioning)',
      code: `flowchart TD
    subgraph HorizontalSharding ["1. Phân Vùng Ngang (Horizontal Sharding theo Hàng)"]
        OrigTable[("Bảng Users (100 Triệu Dòng)")]
        OrigTable -->|"Hash(user_id) % 3 == 0"| Shard0[("Shard 0 (Users 0, 3, 6...)")]
        OrigTable -->|"Hash(user_id) % 3 == 1"| Shard1[("Shard 1 (Users 1, 4, 7...)")]
        OrigTable -->|"Hash(user_id) % 3 == 2"| Shard2[("Shard 2 (Users 2, 5, 8...)")]
    end

    subgraph VerticalPartitioning ["2. Phân Vùng Dọc (Vertical Partitioning theo Cột)"]
        WideUser[("Bảng Users Có 50 Cột")]
        WideUser --> FastTable[("Bảng Hot: user_core (id, email, password_hash) -> Đọc siêu tốc")]
        WideUser --> SlowTable[("Bảng Cold: user_profile (bio, avatar_blob, settings) -> Đọc khi cần")]
    end`
    }
  },

  'sys-086': {
    diagram: {
      type: 'mermaid',
      title: 'Kiến Trúc Cơ Sở Dữ Liệu Chuỗi Thời Gian (Time-Series Database - TSDB)',
      caption: 'Thuật toán nén Gorilla Compression và Chia nhỏ phân vùng theo thời gian (Chunk-based Storage)',
      code: `flowchart TD
    Metrics["Hàng triệu điểm dữ liệu/giây: (timestamp, metric, value)"] --> Ingest["TSDB Ingestion Engine (TimescaleDB / InfluxDB)"]
    
    subgraph Chunker ["Phân Vùng Theo Khung Thời Gian (Time-Chunking)"]
        Ingest --> ChunkToday[("Chunk Hôm Nay: RAM / SSD NVMe (Dữ liệu nóng, ghi liên tục)")]
        ChunkToday -->|"Sau 7 ngày"| ChunkMonth[("Chunk Tuần Cũ: Nén Gorilla (Giảm 90% dung lượng)")]
        ChunkMonth -->|"Sau 30 ngày"| Downsample[("Rollup & Downsampling: Gom dữ liệu 1 phút thành 1 giờ lưu Cold Storage S3")]
    end

    Downsample --> BI["Dashboard Grafana Truy Vấn Lịch Sử 1 Năm Trong Vài Giây"]`
    }
  },

  'sys-087': {
    diagram: {
      type: 'mermaid',
      title: 'So Sánh: Data Lake vs Data Warehouse vs Modern Data Lakehouse',
      caption: 'Sự tiến hóa từ lưu trữ tệp thô phi cấu trúc đến kho dữ liệu phân tích có schema chặt chẽ',
      code: `flowchart TD
    subgraph DataLake ["1. Data Lake (Hồ Dữ Liệu Thô - Object Storage S3)"]
        L1["Lưu trữ mọi định dạng thô: JSON, CSV, Log, Parquet, Audio<br>• Chi phí siêu rẻ<br>• Schema-on-Read (Chỉ định nghĩa cấu trúc khi phân tích)"]
    end

    subgraph DataWarehouse ["2. Data Warehouse (Kho Dữ Liệu Có Cấu Trúc - Snowflake/BigQuery)"]
        W1["Dữ liệu sạch đã qua chuyển đổi (ETL/ELT), Schema-on-Write<br>• Tối ưu cho truy vấn SQL phân tích kinh doanh (OLAP)<br>• Hỗ trợ ACID, chi phí cao hơn"]
    end

    subgraph Lakehouse ["3. Modern Lakehouse (Hợp Nhất: Apache Iceberg / Delta Lake)"]
        LH["Chạy trực tiếp bảng ACID trên nền Data Lake S3 với tốc độ ngang ngửa Data Warehouse!"]
    end`
    }
  },

  'sys-090': {
    diagram: {
      type: 'mermaid',
      title: 'Kiến Trúc Nhắn Tin Quy Mô Siêu Lớn (WhatsApp / Slack High-Concurrency Chat)',
      caption: 'Quản lý kết nối Persistent TCP/WebSocket và Mã hóa đầu cuối (End-to-End Encryption)',
      code: `flowchart LR
    Alice["Alice (Client A)"] -->|"Gửi tin mã hóa (E2E Encrypted)"| EdgeA["Connection Manager Node 1"]
    
    subgraph CoreChatEngine ["Cụm Điều Phối Tin Nhắn (Chat Cluster)"]
        EdgeA --> Router["Router Service"]
        Router --> Queue[("Kafka Distributed Message Buffer")]
        Queue --> Worker["Message Sync Worker"]
    end

    subgraph StorageSync ["Lưu Trữ & Trạng Thái Nhận"]
        Worker --> MailboxDB[("Mailbox DB: Lưu tạm cho tới khi người nhận ACK")]
        Worker --> EdgeB["Connection Manager Node 2"]
    end

    EdgeB -->|"Đẩy tin tức thì"| Bob["Bob (Client B)"]
    Bob -.->|"Gửi ACK đã nhận"| EdgeB`
    }
  },

  'sys-091': {
    diagram: {
      type: 'mermaid',
      title: 'Hệ Thống Phân Phát Thông Báo Doanh Nghiệp (Enterprise Notification System)',
      caption: 'Cơ chế đảm bảo gửi tin thành công 100% kèm dự phòng rớt mạng giữa các đối tác viễn thông',
      code: `flowchart TD
    App["Internal Apps"] --> NotifCore["Notification Core API"]
    
    subgraph Deduplication ["Chống Gửi Lặp (Deduplication Layer)"]
        NotifCore --> RedisLock{"Redis Key (user_id + template + 60s)"}
        RedisLock -->|"Đang gửi"| Drop["Bỏ qua request trùng"]
        RedisLock -->|"Hợp lệ"| QueueP0[("Priority Queue")]
    end

    subgraph WorkerFleet ["Đội Ngũ Xử Lý Thông Báo"]
        QueueP0 --> Worker["Delivery Worker"]
        Worker --> Provider{"Kiểm tra Health của Gateway"}
        Provider -->|"Tốt"| PrimaryGW["Cổng Viễn Thông Chính (SpeedSMS / Twilio)"]
        Provider -->|"Lỗi mạng / 5xx"| FallbackGW["Cổng Dự Phòng Tức Thì (Viettel / AWS SNS)"]
    end`
    }
  },

  'sys-093': {
    diagram: {
      type: 'mermaid',
      title: 'Chiến Lược News Feed Phức Hợp: Fan-out on Write vs Fan-out on Read (Hybrid Model)',
      caption: 'Giải quyết bài toán tài khoản người nổi tiếng (Celebrity Problem) với hàng chục triệu người theo dõi',
      code: `flowchart TD
    PostEvent["Người dùng đăng bài mới"] --> UserType{"Tài khoản này có phải VIP / Người nổi tiếng không?"}
    
    subgraph NormalUserFlow ["1. Người Dùng Thường (Dưới 10.000 Follower) -> Fan-out on Write"]
        UserType -->|"Người thường"| WriteFanout["Đẩy bài viết vào hòm thư (Inbox Timeline) của TOÀN BỘ bạn bè ngay khi đăng"]
        WriteFanout --> RedisTimelines[("Redis Cache Timeline của bạn bè")]
    end

    subgraph CelebrityFlow ["2. Người Nổi Tiếng (vd: Sơn Tùng M-TP 10M Followers) -> Fan-out on Read"]
        UserType -->|"Người nổi tiếng (> 100k follower)"| NoFanout["KHÔNG đẩy vào 10 triệu hòm thư (Tránh sập hệ thống!)<br>Chỉ lưu bài viết vào bảng riêng của người đó."]
    end

    subgraph FeedMerge ["3. Khi Khách Hàng Mở Xem Feed"]
        UserRead["Khách hàng mở app"] --> Merger["Feed Merger Engine"]
        Merger --> ReadInbox["Đọc bài bạn bè từ Redis Timeline"]
        Merger --> ReadCelebrities["Đọc bài mới nhất của các Celeb mà khách đang follow"]
        ReadInbox & ReadCelebrities --> MergeRank["Trộn và sắp xếp hiển thị"]
    end`
    }
  },

  'sys-094': {
    diagram: {
      type: 'mermaid',
      title: 'Kiến Trúc Dịch Vụ Lưu Trữ Tệp Đám Mây (Google Drive / Dropbox Architecture)',
      caption: 'Bẻ nhỏ tệp thành các khối 4MB (Chunking), Chống trùng lặp dữ liệu (Deduplication) và Đồng bộ delta',
      code: `flowchart TD
    ClientFile["Tệp Tin 100MB (BáoCáo.zip)"] --> Chunker["Client Chunker: Bẻ tệp thành 25 khối 4MB"]
    
    subgraph HashCheck ["Kiểm Tra Trùng Lặp Trên Toàn Cầu (Global Deduplication)"]
        Chunker --> HashCalc["Tính mã băm SHA-256 cho từng khối"]
        HashCalc --> CheckMeta{"Mã băm này đã tồn tại trên Cloud S3 chưa?"}
        CheckMeta -->|"Đã có (Khối giống hệt người khác đã up)"| SkipUpload["BỎ QUA UPLOAD! Chỉ cần tạo liên kết con trỏ."]
        CheckMeta -->|"Khối mới"| UploadS3["Upload khối 4MB lên S3 Chunk Storage"]
    end

    subgraph MetadataStore ["Lưu Trữ Siêu Dữ Liệu"]
        SkipUpload & UploadS3 --> MetaDB[("PostgreSQL Metadata: Lưu danh sách Block IDs cấu thành tệp BáoCáo.zip")]
    end`
    }
  },

  'sys-095': {
    diagram: {
      type: 'mermaid',
      title: 'Kiến Trúc Gợi Ý Tìm Kiếm Tự Động (Search Autocomplete / Typeahead System)',
      caption: 'Cấu trúc cây tiền tố Trie kết hợp Caching Top-K cụm từ phổ biến nhất trong Redis',
      code: `flowchart TD
    UserType["Người dùng gõ phím: 'iph...'"] --> EdgeCache{"Redis Top-K Prefix Cache: 'prefix:iph'"}
    
    EdgeCache -->|"Cache HIT (< 2ms)"| ReturnQuick["['iphone 16', 'iphone 15 pro', 'iphone case']"]
    
    subgraph TrieService ["Cụm Máy Chủ Cây Tiền Tố (Trie Search Cluster)"]
        EdgeCache -->|"Cache MISS"| TrieCluster["Trie Memory Node"]
        TrieCluster --> WalkTrie["Duyệt cây tiền tố từ nút gốc:
Root -> 'i' -> 'p' -> 'h' -> [Lấy sẵn danh sách Top 5 cụm từ có điểm số cao nhất lưu tại Node]"]
    end

    WalkTrie --> Populate["Nạp kết quả vào Redis Cache"]
    Populate --> ReturnUser["Hiển thị danh sách gợi ý dưới thanh tìm kiếm"]`
    }
  },

  'sys-096': {
    diagram: {
      type: 'mermaid',
      title: 'Kiến Trúc Hệ Thống Xử Lý Thanh Toán Chuẩn Stripe (Double-Entry Bookkeeping)',
      caption: 'Ghi sổ kép bất biến (Ledger), Đảm bảo tính toán số dư chính xác tuyệt đối không sai lệch 1 xu',
      code: `flowchart TD
    ChargeReq["Giao Dịch Mua Hàng: 100.000 VNĐ"] --> PayAPI["Payment Gateway API"]
    
    subgraph DoubleEntryLedger ["Sổ Cái Kế Toán Kép Bất Biến (Double-Entry Bookkeeping)"]
        PayAPI --> AtomicTx["Database Transaction"]
        AtomicTx --> Line1["1. GHI NỢ (DEBIT): Tài khoản khách hàng: -100.000 VNĐ"]
        AtomicTx --> Line2["2. GHI CÓ (CREDIT): Doanh thu người bán: +97.000 VNĐ"]
        AtomicTx --> Line3["3. GHI CÓ (CREDIT): Phí sàn giao dịch: +3.000 VNĐ"]
        AtomicTx --> BalanceCheck{"Tổng Nợ == Tổng Có? (100k == 97k + 3k)"}
    end

    BalanceCheck -->|"Khớp 100%"| CommitTx["COMMIT Giao Dịch Vào Sổ Cái"]
    BalanceCheck -->|"Sai lệch"| Rollback["ABORT & Bắn Chuông Báo Động Kế Toán"]`
    }
  },

  'sys-097': {
    diagram: {
      type: 'mermaid',
      title: 'Luồng Xác Thực Bảo Mật OAuth 2.0 / OIDC Kết Hợp PKCE Cho SPA & Mobile',
      caption: 'Sử dụng Code Verifier và Code Challenge triệt tiêu nguy cơ đánh cắp Authorization Code trên trình duyệt',
      code: `sequenceDiagram
    autonumber
    participant App as SPA / Mobile App
    participant Auth as Identity Provider (Auth Server)
    participant API as Resource Server (Backend API)

    Note over App: App tự sinh chuỗi ngẫu nhiên "code_verifier" và tạo mã băm SHA256 "code_challenge"
    App->>Auth: 1. GET /authorize (client_id, code_challenge, scope="openid profile")
    Auth-->>App: Yêu cầu người dùng đăng nhập & Đồng ý cấp quyền
    Auth-->>App: Redirect về App kèm "authorization_code"

    App->>Auth: 2. POST /token (code, code_verifier, client_id)
    Auth->>Auth: Băm code_verifier và so khớp với code_challenge ban đầu
    Auth-->>App: Trả về {access_token (JWT), id_token, refresh_token}

    App->>API: 3. GET /api/user/orders (Header: Authorization: Bearer <access_token>)
    API->>API: Xác thực chữ ký số RSA256 của Token tự thân
    API-->>App: 200 OK (Trả về dữ liệu người dùng)`
    }
  },

  'sys-098': {
    diagram: {
      type: 'mermaid',
      title: 'Kiến Trúc Multi-Region Active-Active: Đảm Bảo Không Downtime Khi Đứt Cáp Quốc Tế',
      caption: 'Người dùng được phục vụ tại Datacenter gần nhất kèm cơ chế đồng bộ và giải quyết xung đột dữ liệu',
      code: `flowchart TD
    UserUS["Người Dùng Châu Mỹ"] --> GeoDNS{"Anycast / Geo-DNS Routing"}
    UserVN["Người Dùng Châu Á"] --> GeoDNS
    
    subgraph RegionUS ["Region 1: US-East (Virginia)"]
        GeoDNS -->|"Route khách Mỹ"| LBUS["Load Balancer US"]
        LBUS --> AppUS["App Servers US"]
        AppUS <--> DBUS[("CockroachDB / Spanner Node US")]
    end

    subgraph RegionVN ["Region 2: AP-Southeast (Singapore)"]
        GeoDNS -->|"Route khách Á"| LBVN["Load Balancer SG"]
        LBVN --> AppVN["App Servers SG"]
        AppVN <--> DBVN[("CockroachDB / Spanner Node SG")]
    end

    DBUS <== "Đồng Bộ Hai Chiều Xuyên Lục Địa (Raft Consensus / Multi-Master CRDT)" ==> DBVN`
    }
  },

  'sys-099': {
    diagram: {
      type: 'pipeline',
      title: 'Mô Hình Expand-and-Contract (Parallel Change): Thay Đổi Schema Database Zero-Downtime',
      caption: 'Kỹ thuật đổi tên cột hoặc cấu trúc bảng mà không làm gián đoạn dù chỉ 1 request của người dùng',
      stages: [
        { name: '1. Expand (Mở Rộng)', description: 'Thêm cột mới "full_name" song song với cột cũ "name". Cột mới cho phép NULL để code cũ vẫn chạy được bình thường', duration: 'Giai đoạn 1' },
        { name: '2. Dual Write (Ghi Kép)', description: 'Deploy code mới: Khi user cập nhật, code sẽ ghi đồng thời vào CẢ HAI CỘT (name và full_name). Đọc tạm thời vẫn dùng cột cũ', duration: 'Giai đoạn 2' },
        { name: '3. Backfill Data (Di Chuyển)', description: 'Chạy background script di chuyển toàn bộ dữ liệu lịch sử từ cột cũ sang cột mới theo từng lô nhỏ (Batching)', duration: 'Giai đoạn 3' },
        { name: '4. Contract (Thu Hẹp)', description: 'Chuyển 100% luồng đọc và ghi sang cột mới "full_name". Sau 1-2 tuần ổn định, chạy script DROP cột cũ "name" an toàn', duration: 'Giai đoạn 4' }
      ]
    }
  },

  'sys-100': {
    diagram: {
      type: 'mermaid',
      title: 'Xử Lý Điểm Nóng Lưu Lượng (Hot Partition / Hot Key) Trong Hệ Thống Phân Tán',
      caption: 'Áp dụng kỹ thuật Salting Partition Key và Two-Tier In-Memory Cache để chia đều tải trọng',
      code: `flowchart TD
    subgraph HotProblem ["❌ VẤN ĐỀ ĐIỂM NÓNG (Hot Key)"]
        ViralPost["Bài viết viral của người nổi tiếng (PostID: 999)"] --> SingleShard["Mọi truy vấn ghi đều dồn về Shard 3: Hash(999) % 4 == 3<br>=> Shard 3 quá tải 100% CPU, các Shard khác rảnh rỗi!"]
    end

    subgraph SaltingSolution ["✅ GIẢI PHÁP SALTING (Gieo Muối Phân Vùng)"]
        ViralPost2["Bài viết PostID: 999"] --> SaltGen["Sinh số ngẫu nhiên từ 0 đến N (vd: N=10): Salt = Random(0, 9)"]
        SaltGen --> ShardKey["Key Mới: 999_0, 999_1, 999_2 ... 999_9"]
        ShardKey --> DistributedShards["Lưu lượng được chia đều hoàn hảo qua TẤT CẢ các Shard!"]
    end`
    }
  }
};

// Execute updates
console.log('🚀 Running Batch 4 Enrichment...');
updateBank('system-design-bank.json', sysUpdates);
console.log('✅ Batch 4 completed successfully.');
