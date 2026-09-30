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
// 1. AI BANK (3 Questions)
// ==========================================
const aiUpdates = {
  'ai-025': {
    diagram: {
      type: 'mermaid',
      title: 'Kiến Trúc Transformer Gốc (Attention Is All You Need - Encoder & Decoder)',
      caption: 'Cấu trúc khối Multi-Head Self-Attention, Positional Encoding và Feed-Forward Networks',
      code: `flowchart TD
    subgraph EncoderBlock ["Encoder (Bộ Mã Hóa)"]
        InTokens["Input Tokens (Từ ngữ đầu vào)"] --> InEmbed["Input Embedding + Positional Encoding"]
        InEmbed --> MHA1["Multi-Head Self-Attention"]
        MHA1 --> AddNorm1["Add & Layer Normalization (Residual)"]
        AddNorm1 --> FFN1["Feed Forward Neural Network"]
        FFN1 --> AddNorm2["Add & Layer Normalization"]
    end

    subgraph DecoderBlock ["Decoder (Bộ Giải Mã)"]
        OutTokens["Output Tokens (Shifted Right)"] --> OutEmbed["Output Embedding + Positional Encoding"]
        OutEmbed --> MaskedMHA["Masked Multi-Head Self-Attention"]
        MaskedMHA --> AddNorm3["Add & Layer Norm"]
        AddNorm3 --> CrossMHA["Cross Multi-Head Attention (Nhận Context từ Encoder)"]
        AddNorm2 -.-> CrossMHA
        CrossMHA --> AddNorm4["Add & Layer Norm"]
        AddNorm4 --> FFN2["Feed Forward Network"]
        FFN2 --> AddNorm5["Add & Layer Norm"]
        AddNorm5 --> LinearOutput["Linear Layer + Softmax -> Token Dự Đoán Tiếp Theo"]
    end`
    }
  },

  'ai-053': {
    diagram: {
      type: 'mermaid',
      title: 'Quy Trình Hoạt Động Của RAG Pipeline (Retrieval-Augmented Generation)',
      caption: 'Kết hợp tri thức doanh nghiệp từ Vector Database với khả năng tạo sinh của LLM',
      code: `flowchart TD
    subgraph IngestionPhase ["1. Giai Đoạn Nạp Dữ Liệu (Ingestion Pipeline)"]
        Doc["Tài Liệu PDF / Notion / Markdown"] --> Chunking["Chia Nhỏ Thành Các Chunk (500 tokens, 10% overlap)"]
        Chunking --> EmbedModel["Embedding Model (text-embedding-3-small)"]
        EmbedModel --> VectorDB[("Vector Database (Qdrant / Milvus / Pinecone)")]
    end

    subgraph QueryPhase ["2. Giai Đoạn Truy Vấn (Query & Generation)"]
        UserQuery["Câu hỏi của người dùng"] --> QueryEmbed["Vector hóa câu hỏi"]
        QueryEmbed --> SimilaritySearch["Cosine Similarity Search Top-K"]
        VectorDB <--> SimilaritySearch
        SimilaritySearch --> Context["Top 5 đoạn văn bản liên quan nhất"]
        Context & UserQuery --> PromptEngineer["Tạo Prompt: 'Chỉ dựa vào context sau để trả lời...'"]
        PromptEngineer --> LLM["Mô Hình Ngôn Ngữ Lớn (LLM: GPT-4o / Claude 3.5)"]
        LLM --> FinalAnswer["Câu Trả Lời Chính Xác, Có Trích Dẫn Nguồn"]
    end`
    }
  },

  'ai-120': {
    diagram: {
      type: 'mermaid',
      title: 'Kiến Trúc Mixture of Experts (MoE) Trong Mixtral & DeepSeek',
      caption: 'Router Gate tính toán xác suất và phân bổ mỗi token tới Top-K Chuyên gia (Experts)',
      code: `flowchart TD
    InputToken["Input Token (vd: 'def calculate_tax():')"] --> RouterGate{"Router Gate (Softmax Top-2 Gating)"}
    
    subgraph ExpertPool ["Cụm Chuyên Gia Nơ-ron Độc Lập (Experts)"]
        RouterGate -->|"Xác suất 65%"| Expert1["Expert 1: Lập Trình & Logic (Active)"]
        RouterGate -->|"Xác suất 25%"| Expert2["Expert 2: Toán & Kế Toán (Active)"]
        RouterGate -.->|"Bỏ qua (0%)"| Expert3["Expert 3: Thơ ca & Văn học (Inactive)"]
        RouterGate -.->|"Bỏ qua (0%)"| Expert4["Expert 4: Ngôn ngữ học (Inactive)"]
    end

    Expert1 --> WeightedSum["Tổng Hợp Trọng Số: 0.65 * E1 + 0.25 * E2"]
    Expert2 --> WeightedSum
    WeightedSum --> NextLayer["Chuyển Sang Lớp Transformer Kế Tiếp"]`
    }
  }
};

// ==========================================
// 2. ANDROID BANK (2 Questions)
// ==========================================
const andrUpdates = {
  'andr-056': {
    diagram: {
      type: 'mermaid',
      title: 'Kiến Trúc MVI (Model-View-Intent) Luồng Dữ Liệu Đơn Chiều Trên Android',
      caption: 'So sánh luồng dữ liệu 1 chiều bất biến (Unidirectional Data Flow) của MVI với MVVM',
      code: `flowchart LR
    User["Người Dùng"] -->|"1. Tương tác (Click nút)"| Intent["Intent / Action (Sự kiện người dùng)"]
    Intent -->|"2. Gửi sang"| Reducer["Model / Reducer (Xử lý State Machine)"]
    Reducer -->|"3. Sinh ra"| State["Single Immutable ViewState (State duy nhất)"]
    State -->|"4. Render lên"| View["View / Jetpack Compose UI"]
    View --> User`
    }
  },

  'andr-057': {
    diagram: {
      type: 'mermaid',
      title: 'Kiến Trúc Clean Architecture Trên Android (3 Layers Separation)',
      caption: 'Tuân thủ quy tắc phụ thuộc Dependency Inversion: Tầng lõi nghiệp vụ không phụ thuộc Android Framework',
      code: `flowchart TD
    subgraph UILayer ["Tầng Trình Diễn (Presentation / UI Layer)"]
        Compose["Jetpack Compose / Activity"] --> ViewModel["ViewModel (Chứa StateFlow)"]
    end

    subgraph DomainLayer ["Tầng Lõi Nghiệp Vụ (Domain Layer - Pure Kotlin)"]
        ViewModel --> UseCase["Use Cases (GetUserProfileUseCase, CheckoutOrderUseCase)"]
        UseCase --> RepoInterface["Repository Interfaces (Abstractions)"]
    end

    subgraph DataLayer ["Tầng Dữ Liệu (Data Layer)"]
        RepoImpl["Repository Implementations"] -.->|"Thực thi"| RepoInterface
        RepoImpl --> RoomDB[("Room Local DB (Cache)")]
        RepoImpl --> Retrofit["Retrofit Network API (Remote)"]
    end`
    }
  }
};

// ==========================================
// 3. ANGULAR BANK (2 Questions)
// ==========================================
const ngUpdates = {
  'ng-017': {
    diagram: {
      type: 'pipeline',
      title: 'Trình Tự Thực Thi Lifecycle Hooks Trong Angular Component',
      caption: 'Vòng đời hoàn chỉnh từ lúc khởi tạo `@Input()` đến khi Component bị tiêu hủy khỏi DOM',
      stages: [
        { name: '1. ngOnChanges', description: 'Kích hoạt đầu tiên và mỗi khi giá trị `@Input()` thay đổi', duration: 'Bước 1' },
        { name: '2. ngOnInit', description: 'Chạy duy nhất 1 lần sau ngOnChanges đầu tiên, nơi lý tưởng để fetch API', duration: 'Bước 2' },
        { name: '3. ngDoCheck', description: 'Chạy trong mỗi chu kỳ Change Detection để phát hiện thay đổi thủ công', duration: 'Bước 3' },
        { name: '4. ngAfterContentInit / Checked', description: 'Khởi tạo và kiểm tra nội dung được chiếu vào qua `<ng-content>`', duration: 'Bước 4' },
        { name: '5. ngAfterViewInit / Checked', description: 'Hoàn tất render View của Component và các View con `@ViewChild`', duration: 'Bước 5' },
        { name: '6. ngOnDestroy', description: 'Dọn dẹp tài nguyên, unsubscribe RxJS Observables chống rò rỉ bộ nhớ', duration: 'Bước 6' }
      ]
    }
  },

  'ng-067': {
    diagram: {
      type: 'mermaid',
      title: 'Luồng Tự Động Làm Mới Token (Silent Refresh Token) Bằng Angular HTTP Interceptor',
      caption: 'Khóa hàng đợi (Mutex Queue) đảm bảo khi có nhiều request dính 401 đồng thời chỉ gọi Refresh Token 1 lần duy nhất',
      code: `sequenceDiagram
    autonumber
    participant UI as Component
    participant Interceptor as HTTP Auth Interceptor
    participant Backend as Backend Server
    participant Auth as Auth Refresh Endpoint

    UI->>Interceptor: Gọi GET /api/orders (Token đã hết hạn!)
    Interceptor->>Backend: Forward request
    Backend-->>Interceptor: ❌ HTTP 401 Unauthorized
    
    Note over Interceptor: KÍCH HOẠT MUTEX: isRefreshing = true
    Interceptor->>Auth: POST /auth/refresh (Gửi HttpOnly Cookie)
    
    Note over UI,Interceptor: Các request khác gửi tới lúc này (GET /profile, GET /cart) sẽ được ĐƯA VÀO HÀNG ĐỢI CHỜ
    
    Auth-->>Interceptor: ✅ 200 OK (Cấp Access Token mới)
    Note over Interceptor: MỞ KHÓA MUTEX: isRefreshing = false
    
    Interceptor->>Backend: Thử lại GET /api/orders với Token mới
    Backend-->>Interceptor: 200 OK (Thành công)
    Interceptor-->>UI: Dữ liệu đơn hàng hợp lệ`
    }
  }
};

// ==========================================
// 4. BACKEND CORE BANK (8 Questions)
// ==========================================
const becoreUpdates = {
  'becore-048': {
    diagram: {
      type: 'mermaid',
      title: 'Kiến Trúc Tải Lên Tệp Dung Lượng Lớn (S3 Multipart Upload Pipeline)',
      caption: 'Bẻ nhỏ tệp thành các chunk 5MB tải song song; tự động ghép nối và hỗ trợ Pause/Resume',
      code: `flowchart TD
    Client["Client Tải Lên Tệp 500MB"] --> Split["Bẻ tệp thành 100 khối nhỏ (5MB mỗi khối)"]
    
    Split --> S3_Init["1. Khởi tạo: InitiateMultipartUpload() -> Nhận UploadId"]
    
    subgraph ParallelUpload ["Tải Song Song Đa Luồng (3-5 Workers)"]
        Split -->|"Khối 1"| P1["PUT Part 1 (ETag: aaa)"]
        Split -->|"Khối 2"| P2["PUT Part 2 (ETag: bbb)"]
        Split -->|"Khối 100"| P100["PUT Part 100 (ETag: zzz)"]
    end
    
    P1 & P2 & P100 --> S3[("Amazon S3 Bucket")]
    
    S3 --> S3_Complete["2. Hoàn tất: CompleteMultipartUpload(UploadId, PartsList)"]
    S3_Complete --> FinalFile[("S3 Tự Động Ghép Nối Thành Tệp Hoàn Chỉnh")]`
    }
  },

  'becore-058': {
    diagram: {
      type: 'mermaid',
      title: 'Cơ Chế Khóa Phân Tán (Distributed Lock) Bằng Redis Redlock Algorithm',
      caption: 'Lấy khóa an toàn trên đa số node (Quorum >= 3/5) giải quyết triệt để rủi ro Clock Drift và Node Crash',
      code: `sequenceDiagram
    autonumber
    participant App as Ứng Dụng (Client)
    participant R1 as Redis Master 1
    participant R2 as Redis Master 2
    participant R3 as Redis Master 3
    participant R4 as Redis Master 4
    participant R5 as Redis Master 5

    App->>App: Lấy timestamp bắt đầu (T1)
    par Gửi SET resource_name uuid NX PX 10000 tới 5 nodes song song
        App->>R1: Cố gắng lấy khóa
        App->>R2: Cố gắng lấy khóa
        App->>R3: Cố gắng lấy khóa
        App->>R4: Cố gắng lấy khóa
        App->>R5: Cố gắng lấy khóa
    end

    R1-->>App: OK (Thành công)
    R2-->>App: OK (Thành công)
    R3-->>App: OK (Thành công)
    R4-->>App: ❌ Timeout / Fail
    R5-->>App: OK (Thành công)

    Note over App: Đã lấy được khóa trên 4/5 nodes (Đủ Quorum đa số >= 3)!
    Note over App: Thời gian lấy khóa: (T2 - T1) < 10.000ms TTL
    App->>App: KHÓA HỢP LỆ! Thực thi tác vụ độc quyền an toàn.`
    }
  },

  'becore-060': {
    diagram: {
      type: 'mermaid',
      title: 'Mô Hình Saga Pattern: Điều Phối Giao Dịch Phân Tán (Orchestration vs Choreography)',
      caption: 'Quản lý giao dịch xuyên microservices với cơ chế bù trừ giao dịch (Compensating Transactions)',
      code: `flowchart TD
    subgraph Orchestration ["Mô Hình Điều Phối Tập Trung (Saga Orchestrator)"]
        SagaCoordinator["<b>Saga Orchestrator</b><br>(State Machine Quản Lý)"]
        SagaCoordinator -->|"1. Trừ Tiền"| PaySrv["Payment Service"]
        PaySrv -->|"Thành công"| SagaCoordinator
        SagaCoordinator -->|"2. Giữ Tồn Kho"| InvSrv["Inventory Service"]
        InvSrv -->|"❌ Hết Hàng!"| SagaCoordinator
        SagaCoordinator -->|"3. Giao Dịch Bù (Compensate)"| Refund["Hoàn tiền cho Payment Service"]
    end

    subgraph Choreography ["Mô Hình Phát Sự Kiện Tự Do (Event Choreography)"]
        E1["Order Service"] -->|"Publish: 'OrderCreated'"| Broker[("Kafka Event Broker")]
        Broker --> E2["Payment Service (Nghe sự kiện -> Xử lý)"]
        E2 -->|"Publish: 'PaymentFailed'"| Broker
        Broker --> E3["Inventory Service (Nghe sự kiện -> Hủy giữ hàng)"]
    end`
    }
  },

  'becore-062': {
    diagram: {
      type: 'mermaid',
      title: 'Luồng Thanh Toán Webhook An Toàn Chống Mất Tiền & Chống Cộng Đơn Hai Lần',
      caption: 'Xác thực chữ ký HMAC số bí mật và Áp dụng Idempotency trên mã giao dịch',
      code: `flowchart TD
    Webhook["Cổng Thanh Toán Gửi Webhook: POST /webhook/stripe"] --> VerifySig{"1. Verify Chữ Ký Số (HMAC-SHA256)?"}
    
    VerifySig -->|"Chữ ký sai"| Drop["Từ chối ngay (400 Bad Request)"]
    
    VerifySig -->|"Hợp lệ"| CheckIdempotent{"2. Transaction ID này đã xử lý chưa?"}
    
    CheckIdempotent -->|"Đã có trong DB (Trùng lặp)"| AckOnly["Trả về 200 OK ngay (Không cộng tiền lần 2!)"]
    
    CheckIdempotent -->|"Giao dịch mới"| DBTransaction["3. BEGIN DATABASE TRANSACTION"]
    
    DBTransaction --> UpdateOrder["Cập nhật đơn: Trạng thái = PAID"]
    UpdateOrder --> InsertLedger["Ghi bút toán số dư ví vào Ledger"]
    InsertLedger --> CommitDB["4. COMMIT TRANSACTION"]
    CommitDB --> Return200["Trả về HTTP 200 cho Cổng Thanh Toán"]`
    }
  },

  'becore-063': {
    diagram: {
      type: 'mermaid',
      title: 'Kiến Trúc Flash Sale: Chống Bán Vượt Tồn Kho (Anti-Overselling)',
      caption: '100 suất bán cho 10.000 người đồng thời: Trừ tồn kho nguyên tử trên Redis trước khi ghi Database',
      code: `flowchart TD
    Users["10.000 Khách Hàng Cùng Bấm Mua Lúc 12:00"] --> API["Flash Sale API Service"]
    
    subgraph InMemAtomic ["Tầng Lọc Tải Nguyên Tử (Redis Atomic Layer)"]
        API --> RedisScript["Chạy Redis Lua Script (Atomic DECRBY):<br>if redis.call('get', key) >= qty then<br>  return redis.call('decrby', key, qty)<br>else return -1"]
        RedisScript --> CheckStock{"Kết quả trả về?"}
    end

    CheckStock -->|"-1 (Hết hàng)"| OutOfStock["Trả về ngay: 'Đã hết suất Flash Sale!' (< 2ms)"]
    CheckStock -->|">= 0 (Giành được hàng)"| PushKafka["Đẩy message vào Kafka: 'order_success_queue'"]
    
    subgraph AsyncWorker ["Tầng Ghi Cơ Sở Dữ Liệu Bền Vững"]
        PushKafka --> Worker["Worker Xử Lý Bền Bỉ"]
        Worker --> DB[("PostgreSQL: Tạo Đơn Hàng & Cập Nhật Tồn Kho Chính Thức")]
    end`
    }
  },

  'becore-080': {
    diagram: {
      type: 'mermaid',
      title: 'Chiến Lược Xoay Vòng Refresh Token (Refresh Token Rotation) An Toàn',
      caption: 'Lưu Access Token trong RAM; Refresh Token trong HttpOnly Cookie; Hủy toàn bộ phiên khi phát hiện Reuse Attack',
      code: `sequenceDiagram
    autonumber
    participant App as Single Page App (RAM)
    participant Auth as Auth Server
    participant DB as Refresh Token Store

    Note over App,Auth: KHI ACCESS TOKEN HẾT HẠN (Sau 15 phút)
    App->>Auth: POST /auth/refresh (Cookie: refresh_token_v1)
    Auth->>DB: Kiểm tra refresh_token_v1
    
    alt Token Hợp Lệ Chưa Từng Dùng
        Auth->>DB: Thu hồi refresh_token_v1 -> Cấp mới refresh_token_v2
        Auth-->>App: Trả về Access Token mới + Set-Cookie: refresh_token_v2
    else Phát Hiện Token Đã Bị Dùng Lại (Token Reuse Attack!)
        Note over Auth,DB: 🚨 CẢNH BÁO BẢO MẬT: Token bị kẻ xấu đánh cắp!
        Auth->>DB: THU HỒI TOÀN BỘ gia đình Token của User này (Revoke Family)
        Auth-->>App: 401 Unauthorized (Bắt buộc đăng nhập lại từ đầu)
    end`
    }
  },

  'becore-088': {
    diagram: {
      type: 'mermaid',
      title: 'Quy Trình Bắt Tay Bảo Mật HTTPS (TLS 1.3 Handshake Flow)',
      caption: 'Giảm độ trễ từ 2-RTT (TLS 1.2) xuống 1-RTT (TLS 1.3) với cơ chế Diffie-Hellman Key Exchange',
      code: `sequenceDiagram
    autonumber
    participant C as Trình Duyệt (Client)
    participant S as Máy Chủ Web (Server)

    Note over C,S: 1-ROUND TRIP TIME (1-RTT) TLS 1.3 HANDSHAKE
    C->>S: ClientHello (Danh sách Cipher Suites hỗ trợ + Key Share ECDH công khai)
    
    S->>S: Tính toán Session Key đối xứng bí mật từ Key Share của Client
    S->>C: ServerHello (Key Share của Server)
    S->>C: {EncryptedExtensions, Certificate (Chứng chỉ số SSL), CertificateVerify, Finished}
    
    C->>C: Xác minh Chứng chỉ SSL với Root CA & Tính toán Session Key đối xứng
    C->>S: Finished (Xác nhận hoàn tất phiên bắt tay)

    Note over C,S: KÊNH MÃ HÓA HOÀN TOÀN: Bắt đầu truyền dữ liệu HTTP/2 qua mã hóa AES-GCM`
    }
  },

  'becore-094': {
    diagram: {
      type: 'mermaid',
      title: 'Bốn Vai Trò Cốt Lõi Và Các Luồng Cấp Quyền (Grant Types) Trong Chuẩn OAuth 2.0',
      caption: 'Phân định rõ ràng ranh giới phân quyền bảo mật giữa các thành phần trong hệ thống',
      code: `flowchart TD
    subgraph Roles ["4 Vai Trò Chuẩn OAuth 2.0"]
        RO["1. Resource Owner (Người Dùng Sở Hữu Dữ Liệu)"]
        Client["2. Client App (Ứng Dụng Muốn Truy Cập)"]
        AuthServer["3. Authorization Server (Máy Chủ Xác Thực Cấp Token)"]
        ResourceServer["4. Resource Server (API Chứa Dữ Liệu Cần Bảo Vệ)"]
    end

    subgraph GrantTypes ["Các Luồng Cấp Quyền Chính (Grant Types)"]
        G1["<b>Authorization Code Flow + PKCE:</b> Chuẩn mực vàng cho Web SPA & Mobile"]
        G2["<b>Client Credentials Flow:</b> Giao tiếp giữa 2 máy chủ nội bộ (Server-to-Server)"]
        G3["<b>Refresh Token Flow:</b> Làm mới phiên đăng nhập mà không cần gõ lại password"]
        G4["<s>Resource Owner Password Grant</s>: ĐÃ BỊ LOẠI BỎ vì lộ mật khẩu cho Client!"]
    end`
    }
  },

  'becore-095': {
    diagram: {
      type: 'mermaid',
      title: 'Luồng Đăng Nhập Bằng Google (OAuth2 / OpenID Connect) Từ Đầu Đến Cuối',
      caption: 'Quy trình hoàn chỉnh từ màn hình đăng nhập Google đến đồng bộ tài khoản trong cơ sở dữ liệu nội bộ',
      code: `sequenceDiagram
    autonumber
    participant U as Người Dùng
    participant App as Ứng Dụng Của Bạn (Backend)
    participant Google as Google OAuth2 Server
    participant DB as Database Nội Bộ

    U->>App: Bấm "Đăng nhập bằng Google"
    App-->>U: Redirect sang accounts.google.com/o/oauth2/v2/auth (client_id, scope='openid email profile', state)
    U->>Google: Đăng nhập tài khoản Gmail & Đồng ý cấp quyền
    Google-->>U: Redirect về: https://yourapp.com/api/auth/callback/google?code=auth_code_xyz&state=...
    
    U->>App: Trình duyệt chuyển auth_code_xyz về Backend
    App->>Google: POST https://oauth2.googleapis.com/token (auth_code_xyz, client_secret)
    Google-->>App: Trả về {id_token, access_token}
    
    App->>App: Giải mã & Verify id_token (Lấy email: user@gmail.com, sub: 'google_uid_123')
    App->>DB: Tìm user theo google_uid. Nếu chưa có -> Tự động INSERT User mới
    App-->>U: Cấp phiên đăng nhập nội bộ (Set-Cookie JWT session) & Vào trang chủ`
    }
  }
};

// ==========================================
// 5. CS FUNDAMENTALS & C# & CYBER & DATA & DESIGN & DJANGO & FASTAPI & FLUTTER
// ==========================================
const csUpdates = {
  'cs-012': {
    diagram: {
      type: 'mermaid',
      title: 'Cơ Chế Bắt Tay 3 Bước (TCP 3-Way Handshake: SYN -> SYN-ACK -> ACK)',
      caption: 'Khởi tạo kết nối tin cậy và đồng bộ số thứ tự gói tin (Sequence Numbers) giữa Client và Server',
      code: `sequenceDiagram
    autonumber
    participant C as Client (Trạng thái: CLOSED)
    participant S as Server (Trạng thái: LISTEN)

    Note over C: Client sinh số thứ tự ngẫu nhiên: ISN = 1000
    C->>S: Gói 1: SYN (Seq = 1000)
    Note over C: Trạng thái: SYN_SENT
    Note over S: Trạng thái: SYN_RCVD

    Note over S: Server sinh số ISN = 5000 & Xác nhận đã nhận gói của Client (+1)
    S->>C: Gói 2: SYN + ACK (Seq = 5000, Ack = 1001)
    Note over C: Trạng thái: ESTABLISHED (Client đã sẵn sàng truyền tin)

    C->>S: Gói 3: ACK (Seq = 1001, Ack = 5001)
    Note over S: Trạng thái: ESTABLISHED (Server đã sẵn sàng truyền tin)

    Note over C,S: KẾT NỐI TCP THÀNH CÔNG: Bắt đầu trao đổi dữ liệu (Full-duplex data transfer)`
    }
  },

  'cs-013': {
    diagram: {
      type: 'mermaid',
      title: 'Quá Trình Đóng Kết Nối TCP 4 Bước và Vai Trò Trạng Thái TIME_WAIT',
      caption: 'Bảo vệ gói tin cũ còn lang thang trên mạng không làm nhiễu kết nối mới trong tương lai',
      code: `sequenceDiagram
    autonumber
    participant C as Client (Chủ động đóng)
    participant S as Server (Bị động đóng)

    C->>S: 1. FIN (Seq = u) -> Client vào trạng thái FIN_WAIT_1
    S-->>C: 2. ACK (Ack = u + 1) -> Client vào FIN_WAIT_2; Server vào CLOSE_WAIT
    Note over S: Server xả nốt các dữ liệu còn dở trong buffer...
    S->>C: 3. FIN (Seq = w, Ack = u + 1) -> Server vào LAST_ACK
    C-->>S: 4. ACK (Ack = w + 1) -> Server đóng hoàn toàn (CLOSED)

    Note over C: ⏳ TRẠNG THÁI TIME_WAIT (2 * MSL = 1 đến 2 phút):
    Note over C: 1. Đảm bảo gói ACK cuối cùng tới được Server (nếu rớt, Server gửi lại FIN).
    Note over C: 2. Chờ mọi gói tin cũ bị chậm trên mạng tan biến hoàn toàn trước khi tái sử dụng Port này.`
    }
  },

  'cs-015': {
    diagram: {
      type: 'mermaid',
      title: 'Bảo Mật TLS/SSL: Sự Kết Hợp Giữa Mã Hóa Bất Đối Xứng và Đối Xứng',
      caption: 'Mã hóa bất đối xứng dùng để đàm phán chìa khóa; Mã hóa đối xứng dùng để truyền dữ liệu siêu tốc',
      code: `flowchart TD
    subgraph AsymmetricPhase ["Giai Đoạn 1: Bắt Tay Bằng Mã Hóa Bất Đối Xứng (RSA / ECDH)"]
        KeyExchange["Trao đổi Key Share công khai (Chậm, tốn CPU)<br>• Client & Server cùng tính toán ra 1 chìa khóa chung (Session Key)"]
    end

    subgraph SymmetricPhase ["Giai Đoạn 2: Truyền Dữ Liệu Bằng Mã Hóa Đối Xứng (AES-256-GCM / ChaCha20)"]
        SessionKey[("Khóa Đối Xứng Bí Mật Duy Nhất (Session Key)")]
        Payload["Dữ Liệu HTTP Requests & Responses"]
        FastEncrypt["Mã hóa & Giải mã bằng cùng Session Key (Siêu nhanh, có tăng tốc phần cứng AES-NI)"]
    end

    KeyExchange --> SessionKey
    SessionKey --> FastEncrypt`
    }
  }
};

const otherUpdates = {
  'csnet-091': {
    diagram: {
      type: 'mermaid',
      title: 'Kiến Trúc CQRS Kết Hợp MediatR Trong Ứng Dụng C# .NET Core',
      caption: 'Tách biệt rạch ròi giữa nhánh Ghi (Commands làm biến đổi trạng thái) và nhánh Đọc (Queries)',
      code: `flowchart LR
    API["ASP.NET Core Web API Controller"] --> MediatR["MediatR Pipeline (IMediator)"]
    
    subgraph WritePath ["Nhánh Ghi (Command Path)"]
        MediatR -->|"Send(CreateOrderCommand)"| CmdHandler["CreateOrderCommandHandler"]
        CmdHandler --> Domain["Domain Entities & EF Core"]
        Domain --> MasterDB[("Write Database (SQL Server)")]
    end

    subgraph ReadPath ["Nhánh Đọc (Query Path)"]
        MediatR -->|"Send(GetOrderByIdQuery)"| QryHandler["GetOrderByIdQueryHandler"]
        QryHandler --> Dapper["Dapper Micro-ORM (No Tracking, Read-only SQL siêu tốc)"]
        Dapper --> ReadReplica[("Read Replica Database")]
    end`
    }
  },

  'sec-021': {
    diagram: {
      type: 'mermaid',
      title: 'Vì Sao PKCE (Proof Key for Code Exchange) Bắt Buộc Cho Mobile & SPA?',
      caption: 'Chặn đứng cuộc tấn công chiếm đoạt Authorization Code do không thể lưu Client Secret bí mật',
      code: `sequenceDiagram
    autonumber
    participant App as Mobile App
    participant Malicious as Ứng Dụng Độc Hại Trên Máy
    participant Auth as Identity Provider

    Note over App: App sinh ngẫu nhiên: verifier = 'secret_xyz' và băm challenge = SHA256(verifier)
    App->>Auth: Yêu cầu đăng nhập kèm code_challenge
    Auth-->>App: Redirect Authorization Code qua Custom URI Scheme (myapp://callback?code=abc)
    
    Note over Malicious: ⚠️ Kẻ xấu nghe lén và cướp được mã "code=abc"!
    Malicious->>Auth: Cố đổi "code=abc" lấy Token...
    Auth-->>Malicious: ❌ TỪ CHỐI! Thiếu "code_verifier" khớp với mã băm ban đầu!
    
    App->>Auth: Đổi "code=abc" kèm "verifier = secret_xyz" hợp lệ
    Auth-->>App: ✅ Cấp Token thành công an toàn!`
    }
  },

  'de-023': {
    diagram: {
      type: 'mermaid',
      title: 'Đảm Bảo Exactly-Once Semantics (EOS) Trong Apache Kafka Bằng Two-Phase Commit',
      caption: 'Sự kết hợp giữa Idempotent Producer và Transactional Coordinator ngăn ngừa mất mát và trùng lặp',
      code: `flowchart TD
    subgraph ProducerCoord ["Kafka Transactional Coordinator"]
        Prod["Transactional Producer"] -->|"1. InitTransactions"| Coord["Txn Coordinator"]
        Prod -->|"2. Send Batches (ProducerID, Epoch, SeqNum)"| TopicA[("Topic Đọc: input-events")]
        Prod -->|"3. Gửi offset đã xử lý vào Txn"| TopicOffsets[("__consumer_offsets")]
    end

    subgraph TwoPhaseCommit ["Cam Kết Hai Pha (2PC)"]
        Prod -->|"4. EndTransaction(COMMIT)"| Coord
        Coord -->|"Pha 1: Ghi Marker PREPARE"| TxnLog[("__transaction_state log")]
        Coord -->|"Pha 2: Ghi Marker COMMIT"| TopicOut[("Topic Đích: output-orders")]
    end`
    }
  },

  'dp-053': {
    diagram: {
      type: 'mermaid',
      title: 'Áp Dụng State Pattern / State Machine Cho Vòng Đời Đơn Hàng',
      caption: 'Thay thế các câu lệnh if/else rải rác bằng các lớp trạng thái độc lập tự quản lý hành vi',
      code: `classDiagram
    class OrderContext {
        -OrderState currentState
        +setState(OrderState state)
        +pay()
        +ship()
        +cancel()
    }

    class OrderState {
        <<interface>>
        +pay(OrderContext ctx)*
        +ship(OrderContext ctx)*
        +cancel(OrderContext ctx)*
    }

    class PendingPaymentState {
        +pay(OrderContext ctx)
        +cancel(OrderContext ctx)
    }

    class PaidState {
        +ship(OrderContext ctx)
        +cancel(OrderContext ctx)
    }

    class ShippedState {
        +complete(OrderContext ctx)
    }

    OrderContext --> OrderState
    OrderState <|.. PendingPaymentState
    OrderState <|.. PaidState
    OrderState <|.. ShippedState`
    }
  },

  'django-033': {
    diagram: {
      type: 'pipeline',
      title: 'Vòng Đời Hoàn Chỉnh Của Một HTTP Request Đi Qua Django Framework',
      caption: 'Từ máy chủ WSGI/ASGI, xuyên qua chuỗi Middleware, định tuyến URLconf đến View và Template',
      stages: [
        { name: '1. WSGI / ASGI Handler', description: 'Web server (Gunicorn/Uvicorn) nhận socket và chuyển đổi thành HttpRequest object', duration: 'Bước 1' },
        { name: '2. Middleware Request & View', description: 'Chạy chuỗi middleware theo chiều xuôi: Security, Session, Authentication, CsrfViewMiddleware', duration: 'Bước 2' },
        { name: '3. URLconf & View Execution', description: 'Khớp URL regex/path, gọi View logic (CBV/FBV), thực thi ORM queries lấy dữ liệu', duration: 'Bước 3' },
        { name: '4. Middleware Response & Render', description: 'Render Template hoặc trả về JsonResponse; chạy chuỗi middleware theo chiều ngược lại để nén Gzip, set Cookie', duration: 'Bước 4' }
      ]
    }
  },

  'fastapi-022': {
    diagram: {
      type: 'mermaid',
      title: 'Kiến Trúc Xác Thực OAuth2 & JWT Dựa Trên Dependency Injection Trong FastAPI',
      caption: 'Khai báo bảo vệ Endpoint bằng cơ chế `Depends(get_current_user)` thanh lịch và an toàn',
      code: `flowchart TD
    Req["Request: GET /api/v1/users/me (Header: Authorization Bearer eyJ...)"] --> Route["FastAPI Route Handler"]
    
    subgraph DependencyChain ["Chuỗi Phụ Thuộc (Dependency Injection Chain)"]
        Route --> D1["oauth2_scheme = OAuth2PasswordBearer(tokenUrl='token')"]
        D1 -->|"Trích xuất raw token"| D2["get_current_user(token: str = Depends(oauth2_scheme))"]
        D2 --> Verify["jwt.decode(token, SECRET_KEY, algorithms=['HS256'])"]
        Verify -->|"Token hết hạn / Chữ ký sai"| Err["HTTPException(status_code=401)"]
        Verify -->|"Hợp lệ"| GetUser["Query Database lấy User Entity"]
    end

    GetUser --> ReturnProtected["Tiêm thẳng 'user' object vào tham số hàm Endpoint để xử lý nghiệp vụ"]`
    }
  },

  'flt-021': {
    diagram: {
      type: 'pipeline',
      title: 'Vòng Đời Hoàn Chỉnh Của StatefulWidget Trong Flutter',
      caption: 'Trình tự thực thi State Object từ khi gắn vào Element Tree đến khi bị tiêu hủy',
      stages: [
        { name: '1. createState()', description: 'Framework tạo State object gắn liền với StatefulWidget', duration: 'Bước 1' },
        { name: '2. initState()', description: 'Chạy duy nhất 1 lần khi State được chèn vào cây Element, nơi khởi tạo AnimationController / Stream', duration: 'Bước 2' },
        { name: '3. didChangeDependencies()', description: 'Kích hoạt ngay sau initState hoặc khi InheritedWidget (Theme, Provider) thay đổi giá trị', duration: 'Bước 3' },
        { name: '4. build()', description: 'Hàm cốt lõi trả về cây Widget, được gọi lại nhiều lần mỗi khi setState() được kích hoạt', duration: 'Bước 4' },
        { name: '5. didUpdateWidget()', description: 'Kích hoạt khi Widget cha re-render và cấu hình widget con thay đổi', duration: 'Bước 5' },
        { name: '6. deactivate() & dispose()', description: 'Gỡ khỏi Element tree và giải phóng vĩnh viễn bộ nhớ (cancel timer, close stream controller)', duration: 'Bước 6' }
      ]
    }
  }
};

// Execute updates
console.log('🚀 Running Batch 5A Enrichment...');
updateBank('ai-bank.json', aiUpdates);
updateBank('android-bank.json', andrUpdates);
updateBank('angular-bank.json', ngUpdates);
updateBank('backend-core-bank.json', becoreUpdates);
updateBank('cs-fundamentals-bank.json', csUpdates);
updateBank('csharp-bank.json', { 'csnet-091': otherUpdates['csnet-091'] });
updateBank('cybersecurity-bank.json', { 'sec-021': otherUpdates['sec-021'] });
updateBank('data-engineering-bank.json', { 'de-023': otherUpdates['de-023'] });
updateBank('design-patterns-bank.json', { 'dp-053': otherUpdates['dp-053'] });
updateBank('django-bank.json', { 'django-033': otherUpdates['django-033'] });
updateBank('fastapi-bank.json', { 'fastapi-022': otherUpdates['fastapi-022'] });
updateBank('flutter-bank.json', { 'flt-021': otherUpdates['flt-021'] });
console.log('✅ Batch 5A completed successfully.');
