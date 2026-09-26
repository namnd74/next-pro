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
// 1. SYSTEM DESIGN ENRICHMENTS
// ==========================================
const sysDesignUpdates = {
  'sys-001': {
    diagram: {
      type: 'mermaid',
      title: 'Định lý CAP: Network Partition và Sự Đánh Đổi CP vs AP',
      caption: 'Khi phân vùng mạng (P) xảy ra, hệ thống buộc phải chọn giữa Nhất quán (CP) hoặc Sẵn sàng (AP)',
      code: `flowchart TD
    subgraph NetPartition ["⚠️ Phân vùng Mạng Xảy Ra (Network Partition)"]
        NodeA["Node A (Datacenter US)"]
        NodeB["Node B (Datacenter EU)"]
        NodeA -.-x|"Mạng đứt (Cut)"| NodeB
    end

    Client["Client Gửi Request"] --> LB{"Router / Load Balancer"}
    LB -->|"Chọn mô hình"| Dec{{"Lựa chọn Kiến trúc"}}

    Dec -->|"Lựa chọn CP (Consistency)"| CPPath["CP System (HBase, CockroachDB, Etcd)"]
    CPPath -->|"Không thể đồng bộ giữa Node A & B"| Reject["Từ chối Write (Error 500) để bảo toàn số dư"]

    Dec -->|"Lựa chọn AP (Availability)"| APPath["AP System (Cassandra, DynamoDB, CouchDB)"]
    APPath -->|"Ghi tạm vào Node A"| Accept["200 OK ngay, chấp nhận đọc dữ liệu cũ tạm thời (Eventual)"]`
    },
    benchmark: {
      title: 'Ma trận So sánh: Hệ Thống CP vs Hệ Thống AP',
      caption: 'Đánh giá định lượng về tính toàn vẹn dữ liệu, độ sẵn sàng và độ trễ P99',
      options: [
        {
          name: 'Hệ thống CP (CockroachDB / Etcd / Raft)',
          badge: 'Bảo mật tài chính',
          metrics: [
            { label: 'Tính toàn vẹn (Consistency)', value: 100, displayValue: 'Tuyệt đối', color: 'emerald' },
            { label: 'Độ sẵn sàng khi đứt mạng (Availability)', value: 35, displayValue: 'Hạn chế (Fail-fast)', color: 'rose' },
            { label: 'Độ trễ ghi (Write Latency)', value: 45, displayValue: 'Cao (Quorum chờ đồng thuận)', color: 'amber' }
          ],
          pros: ['Không bao giờ đọc hoặc ghi dữ liệu xung đột', 'Phù hợp giao dịch tài chính, thanh toán, khóa phân tán'],
          cons: ['Dễ bị từ chối phục vụ (downtime cục bộ) khi mạng phân vùng', 'Throughput ghi bị giới hạn bởi độ trễ mạng liên vùng']
        },
        {
          name: 'Hệ thống AP (Apache Cassandra / DynamoDB)',
          badge: 'Siêu quy mô (Hyperscale)',
          isRecommended: true,
          metrics: [
            { label: 'Tính toàn vẹn (Consistency)', value: 65, displayValue: 'Eventual Consistency', color: 'amber' },
            { label: 'Độ sẵn sàng khi đứt mạng (Availability)', value: 99, displayValue: '99.999% SLA', color: 'emerald' },
            { label: 'Độ trễ ghi (Write Latency)', value: 95, displayValue: '< 5ms (Append-only)', color: 'emerald' }
          ],
          pros: ['Ghi siêu tốc, không bao giờ từ chối khách hàng', 'Scale ngang không giới hạn qua nhiều Datacenter'],
          cons: ['Có nguy cơ đọc dữ liệu cũ (Dirty/Stale read)', 'Cần cơ chế giải quyết xung đột (Last-Write-Wins, CRDT)']
        }
      ]
    }
  },

  'sys-002': {
    diagram: {
      type: 'mermaid',
      title: 'Mô hình ACID vs BASE trong Lưu Trữ Dữ Liệu Phân Tán',
      caption: 'So sánh luồng cam kết 2 pha nghiêm ngặt (ACID) với luồng Gossip lan truyền dần (BASE)',
      code: `flowchart LR
    subgraph ACID ["Mô hình ACID (RDBMS)"]
        Tx["Giao dịch Bắt đầu (Begin Tx)"] --> Lock["Khóa hàng (Row-level Lock)"]
        Lock --> Exec["Thực thi ghi (Execute)"]
        Exec --> Flush["Ghi WAL + Commit"]
        Flush --> Unlock["Mở khóa dữ liệu"]
    end

    subgraph BASE ["Mô hình BASE (NoSQL)"]
        Write["Write Request"] --> Mem["Ghi MemTable + CommitLog"]
        Mem --> Resp["Trả về 200 OK ngay"]
        Resp --> Gossip["Gossip Protocol đồng bộ nền"]
        Gossip --> Eventual["Eventual Consistency trên toàn Cluster"]
    end`
    },
    benchmark: {
      title: 'Đánh giá Kỹ thuật: ACID (PostgreSQL) vs BASE (ScyllaDB/Cassandra)',
      caption: 'Trade-off cốt lõi giữa tính toàn vẹn khắt khe và tốc độ ghi dữ liệu khối lượng lớn',
      options: [
        {
          name: 'ACID Model (PostgreSQL / MySQL InnoDB)',
          badge: 'Core Banking',
          metrics: [
            { label: 'Toàn vẹn dữ liệu', value: 100, displayValue: '100% Strict', color: 'emerald' },
            { label: 'Thông lượng ghi (Throughput)', value: 55, displayValue: '~15k TPS/node', color: 'amber' },
            { label: 'Độ phức tạp vận hành', value: 70, displayValue: 'Trung bình', color: 'blue' }
          ],
          pros: ['Hỗ trợ JOIN phức tạp, Foreign Keys, constraints', 'Không lo sợ tình trạng phantom write hay mất dữ liệu'],
          cons: ['Khó scale ngang ghi (cần Sharding thủ công phức tạp)', 'Lock contention khi nhiều tiến trình update cùng 1 row']
        },
        {
          name: 'BASE Model (Cassandra / DynamoDB)',
          badge: 'High Throughput',
          isRecommended: true,
          metrics: [
            { label: 'Toàn vẹn dữ liệu', value: 70, displayValue: 'Eventual', color: 'amber' },
            { label: 'Thông lượng ghi (Throughput)', value: 98, displayValue: '> 250k TPS/cluster', color: 'emerald' },
            { label: 'Độ phức tạp vận hành', value: 85, displayValue: 'Cao (Compaction, Repair)', color: 'rose' }
          ],
          pros: ['Không có Single Point of Failure (Masterless ring)', 'Thêm node mới là tăng tuyến tính throughput'],
          cons: ['Không hỗ trợ Foreign Key và ACID Transaction xuyên bảng', 'Ứng dụng phải tự chịu trách nhiệm xử lý stale data']
        }
      ]
    }
  },

  'sys-003': {
    diagram: {
      type: 'mermaid',
      title: 'So sánh Mô hình Vertical Scaling (Scale Up) vs Horizontal Scaling (Scale Out)',
      caption: 'Sự khác biệt về khả năng mở rộng phần cứng và tính sẵn sàng cao',
      code: `flowchart TD
    subgraph Vertical ["Scale Up (Vertical Scaling)"]
        V1["Server 4 Cores / 16GB"] -->|"Nâng cấp phần cứng"| V2["Server 64 Cores / 512GB (Chạm trần chi phí)"]
        V2 -.->|"Rủi ro"| SPOF["Single Point of Failure (Sập là chết toàn bộ)"]
    end

    subgraph Horizontal ["Scale Out (Horizontal Scaling)"]
        LB["Load Balancer (Nginx / ALB)"]
        LB --> N1["App Node 1 (Stateless)"]
        LB --> N2["App Node 2 (Stateless)"]
        LB --> N3["App Node 3 (Stateless)"]
        LB --> Nn["App Node N (Tự động Autoscale theo CPU/RAM)"]
    end`
    },
    benchmark: {
      title: 'Ma trận So sánh Chi phí & Năng lực: Scale Up vs Scale Out',
      caption: 'Định lượng các khía cạnh mở rộng kiến trúc hệ thống backend',
      options: [
        {
          name: 'Scale Up (Vertical)',
          metrics: [
            { label: 'Độ đơn giản triển khai', value: 95, displayValue: 'Rất dễ', color: 'emerald' },
            { label: 'Giới hạn trần mở rộng', value: 40, displayValue: 'Có giới hạn phần cứng', color: 'rose' },
            { label: 'Hiệu quả chi phí ở quy mô lớn', value: 30, displayValue: 'Rất đắt đỏ', color: 'rose' }
          ],
          pros: ['Không cần cấu hình mạng phân tán, RPC phức tạp', 'Zero network hop giữa các tiến trình'],
          cons: ['Yêu cầu downtime khi nâng cấp RAM/CPU', 'SPOF: Toàn bộ dịch vụ gián đoạn nếu phần cứng cháy hỏng']
        },
        {
          name: 'Scale Out (Horizontal)',
          isRecommended: true,
          badge: 'Chuẩn Cloud-Native',
          metrics: [
            { label: 'Độ đơn giản triển khai', value: 60, displayValue: 'Cần CI/CD, Container', color: 'amber' },
            { label: 'Giới hạn trần mở rộng', value: 99, displayValue: 'Gần như vô hạn', color: 'emerald' },
            { label: 'Hiệu quả chi phí ở quy mô lớn', value: 90, displayValue: 'Tối ưu với Spot/Autoscaling', color: 'emerald' }
          ],
          pros: ['Không có Downtime (Rolling update từng node)', 'Chịu lỗi tuyệt đối (1 node chết, các node khác gánh tải)'],
          cons: ['Bắt buộc ứng dụng phải thiết kế Stateless', 'Cần quản lý session phân tán qua Redis hoặc JWT']
        }
      ]
    }
  },

  'sys-004': {
    diagram: {
      type: 'mermaid',
      title: 'Cân bằng tải L4 (Transport Level) vs L7 (Application Level)',
      caption: 'L4 định tuyến nhanh dựa trên IP:Port; L7 định tuyến thông minh theo Path, Header và SSL Termination',
      code: `flowchart TD
    Client["Client Request"] --> Ingress{"Load Balancer"}

    subgraph L4 ["Layer 4 (NLB / IPVS / HAProxy L4)"]
        Ingress -->|"Chỉ đọc TCP/UDP Packet Header (IP:Port)"| L4Route["Định tuyến cực nhanh, zero payload inspection"]
        L4Route --> PodA["Backend Instance 1"]
        L4Route --> PodB["Backend Instance 2"]
    end

    subgraph L7 ["Layer 7 (ALB / Envoy / Nginx)"]
        Ingress -->|"Phân tích HTTP Request (Path, Headers, Cookies)"| L7Inspect["Đọc path: /api/v1/checkout vs /static/*"]
        L7Inspect -->|"Path: /api/v1/orders"| SvcOrders["Order Service"]
        L7Inspect -->|"Path: /api/v1/auth"| SvcAuth["Auth Service (SSL Offloaded)"]
    end`
    },
    benchmark: {
      title: 'So sánh Hiệu năng: Layer 4 vs Layer 7 Load Balancing',
      caption: 'Trade-off giữa thông lượng xử lý cực đại và tính năng định tuyến thông minh',
      options: [
        {
          name: 'Layer 4 Load Balancer (AWS NLB / IPVS)',
          badge: 'Ultra High Performance',
          metrics: [
            { label: 'Thông lượng (Throughput)', value: 99, displayValue: '> 10M RPS', color: 'emerald' },
            { label: 'Độ trễ gia tăng (Latency Overhead)', value: 98, displayValue: '< 0.5ms', color: 'emerald' },
            { label: 'Tính năng định tuyến thông minh', value: 20, displayValue: 'Chỉ IP/Port hash', color: 'rose' }
          ],
          pros: ['Tải hàng triệu kết nối đồng thời với CPU tiêu hao tối thiểu', 'Bảo toàn kết nối TCP gốc (không giải mã payload)'],
          cons: ['Không thể định tuyến theo URL path hoặc Header HTTP', 'Không hỗ trợ WebSocket protocol inspection']
        },
        {
          name: 'Layer 7 Load Balancer (Envoy / Traefik / AWS ALB)',
          badge: 'Smart Routing',
          isRecommended: true,
          metrics: [
            { label: 'Thông lượng (Throughput)', value: 75, displayValue: '~100k RPS/node', color: 'amber' },
            { label: 'Độ trễ gia tăng (Latency Overhead)', value: 70, displayValue: '~2-5ms (SSL + Parser)', color: 'amber' },
            { label: 'Tính năng định tuyến thông minh', value: 99, displayValue: 'Path, Header, Auth, Canary', color: 'emerald' }
          ],
          pros: ['Hỗ trợ Path-based routing, Canary deployments, gRPC multiplexing', 'Tích hợp xác thực JWT, WAF, Rate limit ngay tại cửa vào'],
          cons: ['Tiêu hao CPU và RAM cao hơn do phải giải mã SSL và parse header HTTP']
        }
      ]
    }
  },

  'sys-027': {
    diagram: {
      type: 'mermaid',
      title: 'Kiến trúc Phân vùng Cơ sở Dữ liệu (Database Sharding Strategies)',
      caption: 'Phân phối dữ liệu trên nhiều DB Shards độc lập để vượt qua giới hạn dung lượng và IOPS đơn máy',
      code: `flowchart TD
    Client["Client Query: SELECT * WHERE user_id = 94821"] --> Router["Sharding Proxy / Application Router"]
    Router --> HashAlgo["Thuật toán Hash: MurmurHash3(user_id) % 3"]

    HashAlgo -->|"Shard 0 (user_id % 3 == 0)"| DB0[("Shard 0 (Node A)\nData: ID 3, 6, 9...")]
    HashAlgo -->|"Shard 1 (user_id % 3 == 1)"| DB1[("Shard 1 (Node B)\nData: ID 1, 4, 7...")]
    HashAlgo -->|"Shard 2 (user_id % 3 == 2)"| DB2[("Shard 2 (Node C)\nData: ID 2, 5, 8...")]`
    },
    benchmark: {
      title: 'So sánh Các Chiến Lược Sharding Cơ Sở Dữ Liệu',
      caption: 'Đánh giá rủi ro Hotspot và độ phức tạp khi bổ sung Shard mới (Re-sharding)',
      options: [
        {
          name: 'Hash-based Sharding (Consistent Hashing)',
          badge: 'Phổ biến nhất',
          isRecommended: true,
          metrics: [
            { label: 'Cân bằng tải phân bổ', value: 95, displayValue: 'Rất đều', color: 'emerald' },
            { label: 'Hỗ trợ Range Query', value: 20, displayValue: 'Kém (phải scan all shards)', color: 'rose' },
            { label: 'Độ phức tạp di chuyển data', value: 65, displayValue: 'Trung bình (nhờ Virtual Nodes)', color: 'amber' }
          ],
          pros: ['Dữ liệu được rải đều ngẫu nhiên, hạn chế tối đa Hotspot', 'Dễ dàng cài đặt logic ở tầng application hoặc proxy'],
          cons: ['Các câu truy vấn theo khoảng (Range Queries) buộc phải phát tán tới tất cả các shard (Scatter-Gather)']
        },
        {
          name: 'Range-based Sharding (Theo ID hoặc Ngày)',
          metrics: [
            { label: 'Cân bằng tải phân bổ', value: 45, displayValue: 'Dễ dồn tải vào Shard mới nhất', color: 'rose' },
            { label: 'Hỗ trợ Range Query', value: 95, displayValue: 'Rất nhanh (chỉ 1 Shard)', color: 'emerald' },
            { label: 'Độ phức tạp di chuyển data', value: 80, displayValue: 'Dễ chia partition', color: 'blue' }
          ],
          pros: ['Truy vấn ngày tháng (ví dụ: Orders tháng 9/2026) chỉ chạm vào đúng 1 Shard', 'Data archiving (xóa dữ liệu cũ) cực kỳ đơn giản'],
          cons: ['Hotspot nguy hiểm: Tất cả đơn hàng mới được tạo đều đè lên Shard hiện tại']
        }
      ]
    }
  },

  'sys-029': {
    diagram: {
      type: 'mermaid',
      title: 'Máy trạng thái và Luồng Xử Lý Token Bucket Rate Limiter',
      caption: 'Thuật toán Token Bucket cho phép chịu đột biến lưu lượng (Burst traffic) trong giới hạn dung lượng bình chứa',
      code: `flowchart TD
    Clock["Refill Timer (Định kỳ nạp r token/giây)"] --> Bucket["Thùng Token (Dung lượng tối đa = C)"]
    Req["Incoming Request đến API"] --> Check{"Trong thùng còn Token không?"}

    Check -->|"Có (Tokens >= 1)"| Allow["Trừ 1 Token & Cho phép Request đi tiếp"]
    Allow --> Backend["Chuyển tiếp đến Backend Service (200 OK)"]

    Check -->|"Hết (Tokens == 0)"| Deny["Chặn Request ngay lập tức"]
    Deny --> Err["Trả mã 429 Too Many Requests kèm Retry-After Header"]`
    },
    benchmark: {
      title: 'Đánh giá Kỹ thuật: Các Thuật toán Rate Limiting',
      caption: 'Lựa chọn thuật toán dựa trên dung lượng bộ nhớ Redis và độ chính xác ở ranh giới thời gian',
      options: [
        {
          name: 'Token Bucket',
          badge: 'Khuyên dùng cho API Gateway',
          isRecommended: true,
          metrics: [
            { label: 'Hiệu quả bộ nhớ', value: 95, displayValue: 'Cực nhỏ (2 keys/user)', color: 'emerald' },
            { label: 'Hỗ trợ Burst Traffic', value: 90, displayValue: 'Tốt (bằng size thùng)', color: 'emerald' },
            { label: 'Độ chính xác ranh giới', value: 85, displayValue: 'Tốt', color: 'blue' }
          ],
          pros: ['Chỉ cần lưu timestamp và token count, tiết kiệm bộ nhớ Redis', 'Cho phép người dùng gửi request burst khi rảnh'],
          cons: ['Cần tính toán math chính xác khi nhiều thread cập nhật đồng thời']
        },
        {
          name: 'Sliding Window Log',
          metrics: [
            { label: 'Hiệu quả bộ nhớ', value: 30, displayValue: 'Tốn kém (Lưu all timestamps)', color: 'rose' },
            { label: 'Hỗ trợ Burst Traffic', value: 60, displayValue: 'Nghiêm ngặt', color: 'amber' },
            { label: 'Độ chính xác ranh giới', value: 100, displayValue: 'Tuyệt đối 100%', color: 'emerald' }
          ],
          pros: ['Không bao giờ bị lỗi vượt ngưỡng gấp đôi ở ranh giới phút (Boundary spike)', 'Độ chính xác vi mô tuyệt đối'],
          cons: ['Bộ nhớ Redis tăng theo số lượng request (mỗi request là 1 phần tử trong Sorted Set)']
        }
      ]
    }
  },

  'sys-031': {
    diagram: {
      type: 'mermaid',
      title: 'Kiến trúc CQRS (Command Query Responsibility Segregation)',
      caption: 'Phân tách hoàn toàn đường truyền Write (Command) và đường truyền Read (Query) được tối ưu hóa riêng biệt',
      code: `flowchart LR
    Client["Client / Frontend"]

    subgraph CommandSide ["Command Side (Ghi Dữ Liệu)"]
        Client -->|"1. POST/PUT Command"| CmdHandler["Command Handler"]
        CmdHandler -->|"2. Write Model"| WriteDB[("Write Database (PostgreSQL Relational - Normalized)")]
        WriteDB -->|"3. Transaction Outbox / CDC"| MsgBus["Message Broker (Kafka / RabbitMQ)"]
    end

    subgraph QuerySide ["Query Side (Đọc Dữ Liệu)"]
        MsgBus -->|"4. Async Event Sync"| Projector["Read Model Projector"]
        Projector -->|"5. Update View"| ReadDB[("Read Database (Elasticsearch / Redis / MongoDB)")]
        Client -->|"6. GET Query"| QueryHandler["Query Handler"]
        QueryHandler -->|"7. Fast Read"| ReadDB
    end`
    }
  },

  'sys-037': {
    diagram: {
      type: 'mermaid',
      title: 'Máy Trạng Thái Circuit Breaker (Ngăn Chặn Cascading Failures)',
      caption: 'Chuyển đổi linh hoạt giữa Closed, Open và Half-Open để bảo vệ hệ thống hạ tầng không bị sập dây chuyền',
      code: `stateDiagram-v2
    [*] --> Closed : Khởi tạo ban đầu
    Closed --> Closed : Requests thành công (Normal)
    Closed --> Open : Tỷ lệ lỗi vượt ngưỡng Failure Threshold (> 50% trong 10s)
    
    state Open {
        desc: Chặn đứng request lập tức\nTrả về Fallback / Error 503 ngay\nZero network call tới upstream service
    }

    Open --> HalfOpen : Hết thời gian chờ Sleep Window (ví dụ sau 30 giây)

    state HalfOpen {
        desc: Cho phép một lượng nhỏ request thử nghiệm (Trial Requests)
    }

    HalfOpen --> Closed : Các request thử nghiệm thành công mỹ mãn
    HalfOpen --> Open : Vẫn còn phát hiện lỗi (Tiếp tục cách ly)`
    }
  },

  'sys-038': {
    diagram: {
      type: 'mermaid',
      title: 'Saga Pattern: Choreography vs Orchestration Trong Microservices',
      caption: 'Giải quyết bài toán giao dịch phân tán xuyên qua nhiều cơ sở dữ liệu độc lập',
      code: `flowchart TD
    subgraph Orchestration ["Mô hình Saga Orchestrator (Khuyên dùng cho quy trình phức tạp)"]
        Client["Khách đặt hàng"] --> Orch["Order Saga Orchestrator"]
        Orch -->|"1. Hold Inventory"| SvcStock["Stock Service"]
        SvcStock -->>|"Stock OK"| Orch
        Orch -->|"2. Charge Card"| SvcPay["Payment Service"]
        SvcPay -->>|"Payment Failed!"| Orch
        Orch -->|"3. Compensating Tx: Release Stock"| SvcStock
    end`
    },
    benchmark: {
      title: 'So sánh: Saga Choreography vs Saga Orchestration',
      caption: 'Đánh giá về tính ghép nối lỏng lẻo, khả năng theo dõi và quy mô dịch vụ',
      options: [
        {
          name: 'Saga Orchestration (Điều phối tập trung)',
          badge: 'Enterprise Standard',
          isRecommended: true,
          metrics: [
            { label: 'Khả năng quan sát & Trace', value: 95, displayValue: 'Rất rõ ràng', color: 'emerald' },
            { label: 'Tránh phụ thuộc vòng tròn', value: 90, displayValue: 'Tuyệt đối', color: 'emerald' },
            { label: 'Độ phụ thuộc vào điều phối viên', value: 45, displayValue: 'Tập trung ở Orchestrator', color: 'amber' }
          ],
          pros: ['Toàn bộ trạng thái và luồng hoàn bù (compensation) được quản lý tập trung ở một nơi', 'Dễ dàng debug và xử lý edge cases'],
          cons: ['Orchestrator có nguy cơ trở thành điểm nghẽn logic nếu ôm đồm quá nhiều nghiệp vụ']
        },
        {
          name: 'Saga Choreography (Giao tiếp phi tập trung qua Event)',
          metrics: [
            { label: 'Khả năng quan sát & Trace', value: 40, displayValue: 'Khó debug', color: 'rose' },
            { label: 'Tránh phụ thuộc vòng tròn', value: 50, displayValue: 'Dễ dính cyclic events', color: 'amber' },
            { label: 'Ghép nối lỏng lẻo (Decoupling)', value: 95, displayValue: 'Tuyệt vời', color: 'emerald' }
          ],
          pros: ['Không cần tạo một coordinator service riêng', 'Cực kỳ phù hợp cho các quy trình ngắn 2-3 bước'],
          cons: ['Khi quy trình có > 5 service, ma trận lắng nghe event trở thành ác mộng không thể kiểm soát']
        }
      ]
    }
  },

  'sys-040': {
    diagram: {
      type: 'mermaid',
      title: 'Kiến trúc Cốt lõi: Apache Kafka (Distributed Log) vs RabbitMQ (Smart Broker)',
      caption: 'Sự khác biệt cơ bản giữa cơ chế Pull từ Offset Log và cơ chế Push từ hàng đợi thông minh',
      code: `flowchart LR
    subgraph Kafka ["Apache Kafka (Append-Only Commit Log)"]
        P1["Producer"] --> Topic["Topic: orders (Partitions)"]
        Topic --> L0["P0: [0][1][2][3][4]..."]
        L0 -->|"Consumer tự quản lý Offset (Pull)"| C1["Consumer Group A"]
        L0 -->|"Replay được dữ liệu cũ"| C2["Consumer Group B"]
    end

    subgraph RabbitMQ ["RabbitMQ (Smart Broker & Routing)"]
        P2["Producer"] --> Ex["Exchange (Direct/Topic/Fanout)"]
        Ex --> Q1["Queue 1"]
        Ex --> Q2["Queue 2"]
        Q1 -->|"Broker chủ động Push message"| W1["Worker"]
        W1 -->|"Ack message -> Xóa khỏi Queue"| Q1
    end`
    },
    benchmark: {
      title: 'So sánh Kỹ thuật: Apache Kafka vs RabbitMQ',
      caption: 'Đánh giá thông lượng, độ trễ và độ linh hoạt định tuyến tin nhắn',
      options: [
        {
          name: 'Apache Kafka',
          badge: 'Event Streaming & Big Data',
          isRecommended: true,
          metrics: [
            { label: 'Thông lượng (Throughput)', value: 98, displayValue: '> 1M msg/s', color: 'emerald' },
            { label: 'Khả năng Replay tin nhắn cũ', value: 100, displayValue: 'Lưu trữ theo Retention', color: 'emerald' },
            { label: 'Độ linh hoạt định tuyến (Routing)', value: 50, displayValue: 'Chỉ dựa trên Partition Key', color: 'amber' }
          ],
          pros: ['Bền bỉ cao, xử lý hàng triệu stream dữ liệu mỗi giây không tụt hiệu năng', 'Cho phép replay sự kiện từ 7 ngày trước để huấn luyện model hoặc khôi phục lỗi'],
          cons: ['Độ trễ cao hơn RabbitMQ vài mili-giây (do batching)', 'Vận hành cụm (Cluster, Zookeeper/KRaft) phức tạp']
        },
        {
          name: 'RabbitMQ',
          badge: 'Complex Routing & Fast Task Queue',
          metrics: [
            { label: 'Thông lượng (Throughput)', value: 70, displayValue: '~40k msg/s', color: 'amber' },
            { label: 'Độ trễ tức thì (Latency)', value: 95, displayValue: '< 1ms', color: 'emerald' },
            { label: 'Độ linh hoạt định tuyến (Routing)', value: 99, displayValue: 'Topic, Headers, Fanout', color: 'emerald' }
          ],
          pros: ['Độ trễ siêu thấp dưới 1ms, phù hợp cho background worker tức thời', 'Hỗ trợ tính năng Dead Letter Queue, Message TTL, Priority Queues natively'],
          cons: ['Message bị xóa vĩnh viễn ngay sau khi Consumer gửi ACK, không thể Replay dữ liệu']
        }
      ]
    }
  },

  'sys-046': {
    diagram: {
      type: 'mermaid',
      title: 'Vòng Tròn Băm Nhất Quán (Consistent Hashing Ring Với Virtual Nodes)',
      caption: 'Phân bổ dữ liệu đều đặn trên vòng 2^32 và giảm thiểu tối đa dữ liệu cần di chuyển khi thêm/bớt Server',
      code: `flowchart TD
    subgraph Ring ["Vòng Tròn Băm Nhất Quán (0 đến 2^32 - 1)"]
        direction TB
        NodeA1["Node A (Virtual 1)"] --> Key1["Key: user_101"]
        Key1 --> NodeB1["Node B (Virtual 1)"]
        NodeB1 --> Key2["Key: user_582"]
        Key2 --> NodeC1["Node C (Virtual 1)"]
        NodeC1 --> NodeA2["Node A (Virtual 2)"]
    end
    Explain["Quy tắc định tuyến: Key được gán vào Node đầu tiên xuất hiện theo chiều kim đồng hồ"]`
    }
  },

  'sys-074': {
    diagram: {
      type: 'mermaid',
      title: 'Kiến trúc Hệ thống Chat Realtime Quy mô Hàng Triệu Người Dùng',
      caption: 'Kết hợp WebSocket Gateway cho kết nối 2 chiều và Redis Pub/Sub Session Router để định tuyến tin nhắn',
      code: `flowchart TD
    UserA["User A (Sender)"] -->|"WebSocket Frame"| WS1["WebSocket Gateway 1"]
    UserB["User B (Receiver)"] -->|"WebSocket Frame"| WS2["WebSocket Gateway 2"]

    WS1 -->|"1. Publish Message"| RedisPubSub["Message Broker / Redis PubSub"]
    WS1 -->|"2. Lưu tin nhắn bất đồng bộ"| Kafka["Kafka Queue"]
    Kafka --> MsgDB[("Cassandra / ScyllaDB Message Store")]

    RedisPubSub -->|"3. Định tuyến tới đúng Server đang giữ kết nối User B"| WS2
    WS2 -->|"4. Push trực tiếp tới thiết bị"| UserB`
    }
  },

  'sys-088': {
    diagram: {
      type: 'pipeline',
      title: 'Pipeline Dữ liệu: Change Data Capture (CDC) Với Debezium và Kafka',
      caption: 'Thu thập thay đổi dữ liệu theo thời gian thực từ Database WAL mà không gây chậm hệ thống',
      stages: [
        {
          name: '1. Giao dịch Cơ sở dữ liệu',
          tool: 'PostgreSQL / MySQL',
          icon: 'Database',
          description: 'Ứng dụng thực hiện UPDATE/INSERT. Database ghi nhận thay đổi vào Write-Ahead Log (WAL / Binlog).',
          metric: '< 1ms'
        },
        {
          name: '2. Debezium CDC Engine',
          tool: 'Debezium Connector',
          icon: 'Radio',
          description: 'Đọc luồng nhị phân trực tiếp từ replication stream của Database, chuyển đổi thành JSON event có cấu trúc schema.',
          metric: 'Zero DB Lock'
        },
        {
          name: '3. Kafka Distributed Stream',
          tool: 'Apache Kafka',
          icon: 'Cpu',
          description: 'Lưu trữ event log vào Topic có phân vùng theo Primary Key, đảm bảo thứ tự tuyệt đối.',
          metric: '> 100k events/s'
        },
        {
          name: '4. Hạ tầng Đọc Đa Năng',
          tool: 'Elasticsearch & Redis',
          icon: 'Zap',
          description: 'Consumer tự động cập nhật Search Index và xóa Cache tương ứng ngay lập tức.',
          metric: '< 50ms Lag'
        }
      ]
    }
  },

  'sys-089': {
    diagram: {
      type: 'mermaid',
      title: 'Kiến trúc Hệ thống Rút Gọn Link (URL Shortener - Bit.ly)',
      caption: 'Thiết kế quy mô hàng tỷ liên kết với thuật toán Base62 và Bộ phát sinh ID phân tán',
      code: `flowchart TD
    Client["User / Client"] -->|"POST /shorten (Long URL)"| API["API Gateway"]
    API --> IDGen["Distributed ID Generator (Snowflake / Redis Atomic)"]
    IDGen -->|"Sinh số nguyên duy nhất: 12519342"| Base62["Base62 Encoding"]
    Base62 -->|"Sinh slug: 7k9Q"| Cache["Redis Cache (Hot Links)"]
    Cache --> DB[("NoSQL DB (DynamoDB / Cassandra)\nMapping: 7k9Q -> https://superlongurl.com/...")]
    
    Client2["User Click: bit.ly/7k9Q"] --> API2["Redirect Service"]
    API2 -->|"Tra cứu Cache trước"| Cache
    Cache -->|"Cache Hit (99% trường hợp)"| Ret["Trả HTTP 302 / 301 Redirect"]`
    },
    benchmark: {
      title: 'So sánh Thuật toán Tạo Mã Rút Gọn URL',
      caption: 'Độ dài URL, nguy cơ đụng độ hash (collision) và hiệu năng tính toán',
      options: [
        {
          name: 'Distributed ID + Base62 Encoding',
          badge: 'Tối ưu tuyệt đối',
          isRecommended: true,
          metrics: [
            { label: 'Nguy cơ trùng lặp (Collision Risk)', value: 100, displayValue: '0% Tuyệt đối', color: 'emerald' },
            { label: 'Độ dài URL ngắn gọn', value: 95, displayValue: 'Chỉ 6-7 ký tự', color: 'emerald' },
            { label: 'Hiệu năng mã hóa', value: 98, displayValue: 'O(1) Siêu nhanh', color: 'emerald' }
          ],
          pros: ['Không bao giờ xảy ra đụng độ vì dựa trên dãy số nguyên duy nhất tự tăng', 'Độ dài ký tự dự đoán được chính xác'],
          cons: ['Cần hệ thống cấp phát số nguyên phân tán (Twitter Snowflake hoặc Redis Counter)']
        },
        {
          name: 'MD5 / SHA-256 Hash Cắt Ngắn',
          metrics: [
            { label: 'Nguy cơ trùng lặp (Collision Risk)', value: 35, displayValue: 'Có đụng độ (Cần check DB)', color: 'rose' },
            { label: 'Độ dài URL ngắn gọn', value: 75, displayValue: 'Cắt 6-8 bytes', color: 'amber' },
            { label: 'Hiệu năng mã hóa', value: 60, displayValue: 'Tốn CPU băm mật mã', color: 'amber' }
          ],
          pros: ['Không cần cụm ID generator, mã hóa trực tiếp từ URL gốc'],
          cons: ['Khi cắt ngắn chuỗi băm thì xác suất đụng độ tăng vọt, buộc phải truy vấn DB để kiểm tra trùng lặp']
        }
      ]
    }
  },

  'sys-092': {
    diagram: {
      type: 'mermaid',
      title: 'Kiến trúc Rate Limiter Phân Tán với Redis Cluster và Lua Script',
      caption: 'Đảm bảo tính nguyên tử (Atomicity) và ngăn chặn Race Condition khi hàng nghìn API Gateway cùng kiểm tra giới hạn',
      code: `flowchart TD
    Client["Client Request"] --> GW1["API Gateway Instance 1"]
    Client2["Client Request"] --> GW2["API Gateway Instance 2"]

    GW1 -->|"Chạy Atomic Lua Script"| Redis[("Redis Cluster")]
    GW2 -->|"Chạy Atomic Lua Script"| Redis

    subgraph Lua ["Xử Lý Trong Một Giao Dịch Nguyên Tử (Atomic)"]
        Check["Lấy số lượng request hiện tại"] --> Verify{"Vượt quá Limit?"}
        Verify -->|"Chưa vượt"| Incr["Tăng Counter + Gia hạn TTL"]
        Verify -->|"Đã vượt"| Block["Trả về cờ REJECT"]
    end

    Redis -->|"Kết quả trả về"| Decision{"Kết quả Lua"}
    Decision -->|"ACCEPT"| Backend["Forward request vào Microservice"]
    Decision -->|"REJECT"| Error429["Trả lỗi 429 Too Many Requests"]`
    },
    codeDiff: {
      title: 'Anti-pattern Race Condition vs Giải Pháp Redis Lua Script Senior',
      language: 'typescript',
      antiPattern: {
        title: '❌ Anti-Pattern: Tách rời thao tác GET và INCR (Dễ bị race condition)',
        code: `// SAI LẦM: Hai request đến cùng 1 mili-giây sẽ đọc cùng giá trị count!
async function isRateLimited(userId: string): Promise<boolean> {
  const current = await redis.get(\`ratelimit:\${userId}\`);
  if (current && parseInt(current) >= 100) {
    return true; // Chặn
  }
  // Race condition: Cả 2 request cùng chạy lệnh incr, dẫn đến vượt quá giới hạn
  await redis.incr(\`ratelimit:\${userId}\`);
  await redis.expire(\`ratelimit:\${userId}\`, 60);
  return false;
}`,
        explanation: 'Thao tác GET, INCR, EXPIRE là các round-trip riêng biệt. Dưới tải cao, hàng chục request có thể đọc cùng một giá trị cũ trước khi INCR kịp chạy, phá vỡ giới hạn rate limit.'
      },
      seniorSolution: {
        title: '✅ Senior Solution: Thực thi nguyên tử bằng Redis Lua Script trong 1 Round-Trip',
        code: `// CHUẨN SENIOR: Đóng gói toàn bộ logic vào Lua Script chạy nguyên tử trên Redis server
const RATELIMIT_LUA = \`
  local key = KEYS[1]
  local limit = tonumber(ARGV[1])
  local ttl = tonumber(ARGV[2])
  
  local current = redis.call('INCR', key)
  if current == 1 then
    redis.call('EXPIRE', key, ttl)
  end
  
  if current > limit then
    return 0 -- Bị chặn
  end
  return 1 -- Cho phép
\`;

async function isRateLimited(userId: string): Promise<boolean> {
  const result = await redis.eval(RATELIMIT_LUA, 1, \`rl:\${userId}\`, 100, 60);
  return result === 0;
}`,
        explanation: 'Redis đơn luồng (single-threaded) sẽ thực thi Lua script mà không bị xen ngang bởi bất kỳ thao tác nào khác, đảm bảo tính nguyên tử tuyệt đối và chỉ tiêu tốn đúng 1 network round-trip.'
      }
    }
  }
};

// ==========================================
// 2. BACKEND CORE & API ENRICHMENTS
// ==========================================
const backendUpdates = {
  'becore-008': {
    diagram: {
      type: 'mermaid',
      title: 'Luồng Xử Lý Chống Double-Submit Bằng Idempotency Key',
      caption: 'Bảo vệ giao dịch tài chính không bị trừ tiền hai lần khi người dùng bấm liên tiếp hoặc mạng bị ngắt quãng',
      code: `sequenceDiagram
    autonumber
    actor User as Khách Hàng (App)
    participant GW as API Gateway / Server
    participant Redis as Redis (Distributed Lock & Cache)
    participant DB as Database (Order & Balance)

    User->>GW: POST /orders (Header: Idempotency-Key: uuid-123)
    GW->>Redis: SETNX lock:uuid-123 "PROCESSING" EX 30
    alt Khóa đã tồn tại (Đang xử lý hoặc đã hoàn tất)
        Redis-->>GW: Fail (Key exists)
        GW->>Redis: GET result:uuid-123
        Redis-->>GW: Trả lại kết quả đơn hàng đã tạo trước đó
        GW-->>User: 200 OK (Kết quả cũ - Không tạo đơn trùng)
    else Khóa mới hoàn toàn (Lần đầu tiên bấm)
        Redis-->>GW: Success (Acquired Lock)
        GW->>DB: Trừ tiền + Tạo Order trong 1 Transaction
        DB-->>GW: Commit Thành Công
        GW->>Redis: SET result:uuid-123 JSON_DATA EX 86400
        GW->>Redis: DEL lock:uuid-123
        GW-->>User: 201 Created (Đơn hàng mới tạo)
    end`
    },
    codeDiff: {
      title: 'Xử lý Đặt Hàng Thiếu Khóa vs Chuẩn Idempotent Transaction',
      language: 'typescript',
      antiPattern: {
        title: '❌ Anti-Pattern: Trừ tiền trực tiếp không có cơ chế khóa phân tán',
        code: `app.post('/api/checkout', async (req, res) => {
  // Nguy hiểm: Nếu khách bấm 2 lần nhanh, cả 2 request cùng chạy song song
  const balance = await db.getBalance(req.user.id);
  if (balance >= req.body.amount) {
    await db.deductBalance(req.user.id, req.body.amount);
    const order = await db.createOrder(req.body);
    return res.json(order);
  }
  return res.status(400).send('Số dư không đủ');
});`,
        explanation: 'Không có cơ chế dedup key hay lock. Khi mạng chập chờn client tự động retry, tài khoản khách hàng sẽ bị trừ tiền nhiều lần cho cùng một món đồ.'
      },
      seniorSolution: {
        title: '✅ Senior Solution: Sử dụng Idempotency Key kết hợp Redis Mutex Lock',
        code: `app.post('/api/checkout', async (req, res) => {
  const idemKey = req.headers['idempotency-key'] as string;
  if (!idemKey) return res.status(400).send('Thiếu Idempotency-Key Header');

  const lockKey = \`idem:lock:\${idemKey}\`;
  const cached = await redis.get(\`idem:res:\${idemKey}\`);
  if (cached) return res.status(200).json(JSON.parse(cached));

  const acquired = await redis.set(lockKey, '1', 'PX', 5000, 'NX');
  if (!acquired) return res.status(409).send('Yêu cầu đang được xử lý, vui lòng chờ');

  try {
    const order = await db.transaction(async (trx) => {
      await trx.deductBalanceWithLock(req.user.id, req.body.amount);
      return await trx.createOrder({ ...req.body, idempotencyKey: idemKey });
    });

    await redis.set(\`idem:res:\${idemKey}\`, JSON.stringify(order), 'EX', 86400);
    return res.status(201).json(order);
  } finally {
    await redis.del(lockKey);
  }
});`,
        explanation: 'Kết hợp Redis SetNX làm Distributed Mutex và lưu Cache kết quả theo Idempotency-Key trong 24h, bảo vệ tuyệt đối khỏi lỗi Double-spending.'
      }
    }
  },

  'becore-011': {
    benchmark: {
      title: 'Ma trận So sánh Toàn Diện: REST vs GraphQL vs gRPC',
      caption: 'Đánh giá định lượng về thông lượng, độ trễ và sự phù hợp trong kiến trúc hệ thống hiện đại',
      options: [
        {
          name: 'gRPC (HTTP/2 + Protocol Buffers)',
          badge: 'Chuẩn Microservices Nội Bộ',
          isRecommended: true,
          metrics: [
            { label: 'Thông lượng (Throughput)', value: 99, displayValue: '> 150k RPS', color: 'emerald' },
            { label: 'Độ trễ tuần tự hóa (Serialization)', value: 95, displayValue: 'Siêu nhỏ (Binary)', color: 'emerald' },
            { label: 'Tiết kiệm băng thông mạng', value: 95, displayValue: 'Giảm 70% so với JSON', color: 'emerald' }
          ],
          pros: ['Serialization nhị phân cực nhanh, hỗ trợ Streaming 2 chiều trên HTTP/2', 'Sinh code Client/Server tự động đa ngôn ngữ từ file .proto'],
          cons: ['Không thân thiện với trình duyệt web trực tiếp (cần gRPC-Web proxy)', 'Payload nhị phân khó đọc bằng mắt thường khi debug cURL']
        },
        {
          name: 'GraphQL (Apollo / Yoga)',
          badge: 'BFF & Client Phức Tạp',
          metrics: [
            { label: 'Thông lượng (Throughput)', value: 65, displayValue: '~20k RPS', color: 'amber' },
            { label: 'Tránh Over/Under-fetching', value: 100, displayValue: 'Tuyệt đối', color: 'emerald' },
            { label: 'Độ trễ gia tăng (Query Parsing)', value: 55, displayValue: 'Parse AST tốn CPU', color: 'amber' }
          ],
          pros: ['Client tự định nghĩa đúng các trường cần lấy trong 1 request duy nhất', 'Phù hợp làm tầng Backend-for-Frontend (BFF) gom nhiều API'],
          cons: ['Khó khăn khi thiết lập Caching ở tầng HTTP/CDN', 'Nguy cơ bị tấn công DDoS thông qua các truy vấn lồng sâu (Deeply Nested Queries)']
        },
        {
          name: 'RESTful API (JSON over HTTP/1.1 or HTTP/2)',
          badge: 'Public API Chuẩn Mực',
          metrics: [
            { label: 'Thông lượng (Throughput)', value: 80, displayValue: '~50k RPS', color: 'blue' },
            { label: 'Khả năng Caching ở Gateway/CDN', value: 100, displayValue: 'Chuẩn HTTP native', color: 'emerald' },
            { label: 'Tính phổ quát trong cộng đồng', value: 100, displayValue: 'Phổ biến nhất', color: 'emerald' }
          ],
          pros: ['Dễ học, cURL debug trực tiếp, tận dụng triệt để HTTP Status Code và CDN Caching', 'Tài liệu OpenAPI/Swagger cực kỳ phong phú'],
          cons: ['Dễ bị Over-fetching hoặc Under-fetching (buộc client gọi nhiều API liên tiếp)']
        }
      ]
    }
  },

  'becore-012': {
    diagram: {
      type: 'mermaid',
      title: 'Tiến Hóa Giao Thức HTTP: HTTP/1.1 vs HTTP/2 vs HTTP/3 (QUIC)',
      caption: 'Khắc phục triệt để hiện tượng Head-of-Line Blocking từ tầng Application xuống tầng Transport UDP',
      code: `flowchart TD
    subgraph HTTP1 ["HTTP/1.1 (TCP)"]
        H1["1 Request tại 1 thời điểm trên mỗi TCP Socket"]
        H1 --> HOL1["Bị nghẽn Head-of-Line Blocking ở tầng HTTP"]
    end

    subgraph HTTP2 ["HTTP/2 (TCP Multiplexing)"]
        H2["Nhiều Stream lồng ghép trên 1 kết nối TCP duy nhất"]
        H2 --> HOL2["Nếu rớt 1 packet TCP: Toàn bộ các stream khác đều bị khựng lại"]
    end

    subgraph HTTP3 ["HTTP/3 (QUIC over UDP)"]
        H3["Các Stream hoàn toàn độc lập chạy trên nền giao thức QUIC (UDP)"]
        H3 --> Fix["1 Stream mất gói tin: Các stream khác vẫn chạy bình thường không bị block!"]
    end`
    }
  },

  'becore-014': {
    benchmark: {
      title: 'So sánh Kỹ thuật Giao Tiếp Realtime: Polling vs SSE vs WebSocket',
      caption: 'Đánh giá chi phí tài nguyên server, độ trễ và chiều truyền tải dữ liệu',
      options: [
        {
          name: 'WebSocket (Full-Duplex TCP)',
          badge: 'Tương tác 2 chiều',
          isRecommended: true,
          metrics: [
            { label: 'Độ trễ gói tin (Latency)', value: 99, displayValue: '< 2ms', color: 'emerald' },
            { label: 'Giao tiếp 2 chiều (Bidirectional)', value: 100, displayValue: 'Full-duplex', color: 'emerald' },
            { label: 'Tiêu hao Header Overhead', value: 95, displayValue: 'Chỉ 2-10 bytes/frame', color: 'emerald' }
          ],
          pros: ['Truyền tin 2 chiều tức thời với overhead cực nhỏ sau cú bắt tay HTTP Upgrade', 'Rất phù hợp cho Chat, Game multiplayer, Bảng giá chứng khoán'],
          cons: ['Không tự động reconnect natively, cần quản lý heartbeat (ping/pong) và load balancing trạng thái']
        },
        {
          name: 'Server-Sent Events (SSE - HTTP/2 Stream)',
          badge: '1 chiều Server -> Client',
          metrics: [
            { label: 'Độ trễ gói tin (Latency)', value: 95, displayValue: '< 5ms', color: 'emerald' },
            { label: 'Độ đơn giản triển khai', value: 90, displayValue: 'Chuẩn HTTP đơn giản', color: 'emerald' },
            { label: 'Tự động phục hồi kết nối', value: 100, displayValue: 'Native browser retry', color: 'emerald' }
          ],
          pros: ['Chạy trên giao thức HTTP chuẩn, tự động kết nối lại khi mất mạng, tương thích 100% với HTTP/2', 'Lựa chọn số 1 cho Stream phản hồi AI ChatGPT / LLM Token Streaming'],
          cons: ['Chỉ hỗ trợ truyền dữ liệu 1 chiều từ Server xuống Client']
        }
      ]
    }
  },

  'api-005': {
    diagram: {
      type: 'mermaid',
      title: 'Giải Pháp Transactional Outbox Pattern Cho Bài Toán Dual-Write',
      caption: 'Ngăn chặn sai lệch dữ liệu: Ghi Database và Bắn Kafka Message trong cùng 1 Giao Dịch ACID',
      code: `flowchart TD
    App["Application Service"]

    subgraph AtomicTx ["Giao Dịch CSDL Nguyên Tử (Single ACID Transaction)"]
        App -->|"1. INSERT Order"| OrdersTbl[("Orders Table")]
        App -->|"2. INSERT Event payload"| OutboxTbl[("Outbox Table")]
    end

    subgraph CDC ["Bộ Chuyển Tiếp Tin Cậy (Outbox Relay)"]
        OutboxTbl -->|"3. Đọc dữ liệu qua Debezium CDC hoặc Polling"| Relay["Message Relay Engine"]
        Relay -->|"4. Xuất bản tin nhắn"| Kafka[("Kafka Broker")]
        Kafka -->|"5. Gửi ACK thành công"| Relay
        Relay -->|"6. Đánh dấu đã gửi (processed = true)"| OutboxTbl
    end`
    },
    codeDiff: {
      title: 'Lỗi Nguy Hiểm Dual-Write vs Transactional Outbox Pattern',
      language: 'typescript',
      antiPattern: {
        title: '❌ Anti-Pattern: Ghi Database rồi gọi Message Broker trực tiếp',
        code: `async function createOrder(data: OrderData) {
  // BƯỚC 1: Ghi CSDL thành công
  const order = await db.orders.create({ data });

  // NGUY HIỂM: Nếu server crash tại đây hoặc Kafka bị nghẽn mạng:
  // CSDL đã tạo đơn nhưng không ai giao hàng -> Sai lệch hệ thống!
  await kafka.send('order-created-topic', { orderId: order.id });
  
  return order;
}`,
        explanation: 'Thao tác gọi Database và Message Broker không nằm chung một transaction quản lý bởi 2PC. Sự cố mạng ở giữa sẽ tạo ra trạng thái dữ liệu Zombie không thể đồng nhất.'
      },
      seniorSolution: {
        title: '✅ Senior Solution: Ghi kèm bảng Outbox trong 1 DB Transaction duy nhất',
        code: `async function createOrder(data: OrderData) {
  return await db.$transaction(async (tx) => {
    // 1. Tạo đơn hàng nghiệp vụ
    const order = await tx.orders.create({ data });

    // 2. Ghi sự kiện vào bảng Outbox cùng lúc (ACID 100%)
    await tx.outboxEvents.create({
      data: {
        aggregateType: 'ORDER',
        aggregateId: order.id,
        eventType: 'OrderCreated',
        payload: JSON.stringify(order),
        status: 'PENDING'
      }
    });

    return order;
  });
  // Worker chạy ngầm (hoặc Debezium CDC) sẽ đọc bảng Outbox và publish sang Kafka an toàn
}`,
        explanation: 'Tính chất ACID của Database đảm bảo: Hoặc cả đơn hàng lẫn sự kiện cùng được lưu, hoặc cả hai cùng rollback. Hệ thống miễn nhiễm hoàn toàn với lỗi mạng giữa chừng.'
      }
    }
  },

  'api-011': {
    diagram: {
      type: 'mermaid',
      title: 'So Sánh Cơ Chế Phân Trang: Offset Pagination vs Cursor Pagination',
      caption: 'Cursor-based Pagination tận dụng chỉ mục B-Tree (Index Seek) đạt hiệu năng O(1) bất kể trang sâu đến đâu',
      code: `flowchart TD
    subgraph Offset ["Offset Pagination (OFFSET 1000000 LIMIT 20)"]
        Scan["Quét và duyệt qua 1,000,000 dòng đầu tiên"] --> Drop["Bỏ qua (Discard) 1,000,000 dòng"]
        Drop --> Take["Chỉ lấy 20 dòng cuối (Cực kỳ chậm, tiêu hao IOPS khủng khiếp)"]
    end

    subgraph Cursor ["Cursor Pagination (WHERE id > 948102 LIMIT 20)"]
        Seek["Nhảy trực tiếp đến vị trí con trỏ thông qua B-Tree Index Seek O(log N)"]
        Seek --> Fetch["Lấy ngay lập tức 20 bản ghi kế tiếp (Độ trễ luôn < 2ms)"]
    end`
    },
    benchmark: {
      title: 'So sánh Hiệu Năng Phân Trang Ở Quy Mô Lớn',
      caption: 'Đánh giá độ trễ truy vấn khi số lượng bản ghi vượt qua 10,000,000 dòng',
      options: [
        {
          name: 'Cursor-based Pagination (Keyset)',
          badge: 'Chuẩn Big Data',
          isRecommended: true,
          metrics: [
            { label: 'Tốc độ ở trang sâu (Page 10,000)', value: 99, displayValue: '< 3ms (Index Seek)', color: 'emerald' },
            { label: 'Chống nhảy trang / lặp bản ghi khi có insert', value: 100, displayValue: 'Tuyệt đối', color: 'emerald' },
            { label: 'Hỗ trợ nhảy trang tùy ý (Page number)', value: 10, displayValue: 'Chỉ Next/Previous', color: 'rose' }
          ],
          pros: ['Độ trễ đồng nhất O(1) dù ở trang đầu hay trang thứ một triệu', 'Không bị hiện tượng trùng lặp hoặc bỏ sót dữ liệu khi có đơn hàng mới chèn vào giữa'],
          cons: ['Không thể cung cấp giao diện nhảy nhanh tới một số trang cụ thể (ví dụ: Trang 42)']
        },
        {
          name: 'Offset-based Pagination (LIMIT & OFFSET)',
          metrics: [
            { label: 'Tốc độ ở trang sâu (Page 10,000)', value: 15, displayValue: '> 8,500ms (O(N) Scan)', color: 'rose' },
            { label: 'Chống nhảy trang / lặp bản ghi khi có insert', value: 20, displayValue: 'Dễ bị lệch dữ liệu', color: 'rose' },
            { label: 'Hỗ trợ nhảy trang tùy ý (Page number)', value: 95, displayValue: 'Rất dễ hiển thị', color: 'emerald' }
          ],
          pros: ['Dễ lập trình giao diện phân trang cổ điển có danh sách số trang 1, 2, 3...'],
          cons: ['Làm sập cơ sở dữ liệu khi người dùng hoặc bot cào dữ liệu ở các trang sâu hàng triệu dòng']
        }
      ]
    }
  }
};

// Execute updates
updateBank('system-design-bank.json', sysDesignUpdates);
updateBank('backend-core-bank.json', backendUpdates);
updateBank('backend-api-bank.json', backendUpdates);
console.log('✅ Batch 1 updates applied successfully!');
