import fs from 'node:fs';
import path from 'node:path';

const filePath = path.resolve('src/features/interview/data/json/system-design-bank.json');
const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));

const metadataPart1 = {
  'sys-003': {
    interviewerIntent: 'Đánh giá khả năng phân tích chi phí, giới hạn vật lý phần cứng và tư duy thiết kế kiến trúc phân tán Stateless có khả năng tự động mở rộng (Autoscaling).',
    contextOrScenario: 'Một hệ thống bán vé xem ca nhạc trực tuyến sắp mở bán cho 500,000 người vào lúc 12h trưa. Hệ thống cần quyết định giữa việc nâng cấp server hiện tại lên máy chủ Bare-metal cực mạnh hay triển khai mô hình Scale Out với Kubernetes pods.',
    expectedKeywords: ['Vertical vs Horizontal Scaling', 'Scale Up vs Scale Out', 'Stateless Architecture', 'Single Point of Failure (SPOF)', 'Kubernetes HPA', 'Cost Curve Exponential'],
    pitfalls: [
      'Cho rằng Scale Up là giải pháp rẻ hơn về dài hạn (thực tế chi phí phần cứng siêu khủng tăng theo hàm mũ).',
      'Scale Out ứng dụng mà vẫn lưu trữ phiên làm việc (Session) trong bộ nhớ local RAM của từng máy chủ.',
      'Không tính đến giới hạn của database phía sau khi tăng số lượng server ứng dụng lên gấp 20 lần.'
    ],
    followUpQuestions: [
      'Làm thế nào để chuyển đổi một ứng dụng Stateful (lưu session cục bộ) sang Stateless để sẵn sàng cho Scale Out?',
      'Khi nào Scale Up vẫn là sự lựa chọn tối ưu hơn Scale Out (ví dụ: trong môi trường RDBMS hoặc hệ thống giao dịch tài chính siêu tốc)?'
    ]
  },

  'sys-005': {
    interviewerIntent: 'Đánh giá hiểu biết sâu sắc về mạng phân phối nội dung sát biên (Edge Delivery), kỹ thuật tối ưu hóa độ trễ Round-Trip Time (RTT) và chiến lược vô hiệu hóa bộ nhớ đệm (Cache Invalidation).',
    contextOrScenario: 'Một ứng dụng tin tức và video ngắn toàn cầu có người dùng truy cập từ Việt Nam, Mỹ, Nhật Bản và Châu Âu. Máy chủ Origin đặt tại Singapore. Người dùng ở Mỹ phản ánh tốc độ tải trang quá chậm (> 800ms) và video bị buffer liên tục.',
    expectedKeywords: ['Points of Presence (PoP)', 'Edge Caching', 'Origin Shield', 'Surrogate-Keys (Cache-Tags)', 'stale-while-revalidate', 'Anycast Routing'],
    pitfalls: [
      'Chỉ dùng CDN để cache ảnh tĩnh mà không biết CDN hiện đại có thể cache cả dynamic API responses thông qua Edge Rules.',
      'Dùng cơ chế Purge All (Xóa trắng cache toàn cầu) mỗi khi có bài viết mới, làm Origin Server bị sập vì nghẽn tải tức thì.',
      'Quên cấu hình CORS hoặc HTTP Security Headers trên CDN Edge.'
    ],
    followUpQuestions: [
      'Cơ chế Cache-Tags (Surrogate-Keys) giúp xóa bộ nhớ đệm có chọn lọc cho hàng nghìn trang liên quan đến một danh mục như thế nào?',
      'Làm thế nào để CDN bảo vệ hệ thống Origin Server trước một cuộc tấn công từ chối dịch vụ phân tán (DDoS Layer 7)?'
    ]
  },

  'sys-006': {
    interviewerIntent: 'Kiểm tra sự phân biệt rõ ràng giữa hai khái niệm mạng nền tảng, vai trò của Reverse Proxy trong bảo mật, SSL Termination, Load Balancing và Connection Keep-Alive.',
    contextOrScenario: 'Đội ngũ hạ tầng đang thiết kế cổng kết nối: Một bên là việc quản lý 200 nhân viên trong công ty truy cập Internet an toàn, một bên là tiếp nhận 10 triệu lượt truy cập của khách hàng từ Internet vào cụm microservices nội bộ.',
    expectedKeywords: ['Forward Proxy', 'Reverse Proxy', 'SSL Termination', 'Nginx / Envoy', 'IP Masking', 'Upstream Connection Pooling'],
    pitfalls: [
      'Nhầm lẫn giữa mục đích của Forward Proxy (bảo vệ Client ra ngoài) và Reverse Proxy (bảo vệ Server nhận vào).',
      'Không cấu hình Header `X-Forwarded-For` và `X-Real-IP` trên Reverse Proxy khiến backend server chỉ nhận được IP của chính con Proxy.',
      'Để Reverse Proxy mở kết nối mới tới backend trên từng request (HTTP/1.0 không keep-alive) làm lãng phí socket port.'
    ],
    followUpQuestions: [
      'Tại sao việc thực hiện SSL/TLS Termination ngay tại Reverse Proxy lại giúp giải phóng tài nguyên CPU đáng kể cho các backend servers?',
      'Làm thế nào để cấu hình Reverse Proxy chống lại các cuộc tấn công HTTP Slowloris?'
    ]
  },

  'sys-007': {
    interviewerIntent: 'Đo lường năng lực phân tích hiệu năng hệ thống cốt lõi: Phân biệt độ trễ (Latency) và thông lượng (Throughput), hiểu mối quan hệ đánh đổi qua định luật Little (Little’s Law).',
    contextOrScenario: 'Hệ thống xử lý giao dịch thanh toán ngân hàng có thông lượng đạt 5,000 giao dịch/giây nhưng độ trễ của từng giao dịch tăng vọt từ 50ms lên 800ms khi hệ thống áp dụng kỹ thuật gom lô (Batching). Ban Giám đốc yêu cầu tối ưu cả hai chỉ số.',
    expectedKeywords: ['Latency vs Throughput', 'Little’s Law', 'Queueing Delay', 'Batching Trade-off', 'Tail Latency (p99)', 'Concurrency Level'],
    pitfalls: [
      'Cho rằng hệ thống có Throughput cao thì chắc chắn Latency sẽ thấp (thực tế khi Throughput tiệm cận trần, Latency sẽ tăng theo hàm mũ do hàng đợi bị ứ đọng).',
      'Chỉ nhìn vào Latency trung bình (Mean) mà bỏ qua Tail Latency (p95, p99), bỏ sót các giao dịch bị nghẽn nghiêm trọng.',
      'Gom batch quá lớn để tăng Throughput nhưng làm suy giảm nghiêm trọng trải nghiệm người dùng cuối do độ trễ chờ đủ batch.'
    ],
    followUpQuestions: [
      'Định luật Little phát biểu như thế nào và công thức `L = λ * W` áp dụng ra sao để tính toán số lượng worker threads tối ưu?',
      'Trong bài toán truyền phát video trực tiếp (Livestream) vs xem phim chất lượng cao (4K On-Demand), hệ thống nào ưu tiên Latency và hệ thống nào ưu tiên Throughput?'
    ]
  },

  'sys-008': {
    interviewerIntent: 'Kiểm tra mức độ am hiểu về các mô hình nhất quán dữ liệu phân tán (Consistency Models), định lý CAP và cơ chế hòa giải xung đột không đồng bộ.',
    contextOrScenario: 'Hệ thống kho hàng E-Commerce phân tán đa vùng (Multi-Region) giữa Mỹ và Singapore. Khi khách hàng tại Mỹ mua món hàng cuối cùng, cần quyết định xem người dùng tại Singapore có thấy món hàng đó lập tức hết hàng hay không.',
    expectedKeywords: ['Strong Consistency', 'Eventual Consistency', 'Linearizability', 'Causal Consistency', 'Vector Clocks', 'CRDTs (Conflict-free Replicated Data Types)'],
    pitfalls: [
      'Áp dụng Strong Consistency (Linearizable) cho tất cả các bảng dữ liệu, làm độ trễ ghi tăng vọt lên hàng trăm ms và hệ thống sập khi rớt mạng xuyên vùng.',
      'Sử dụng Eventual Consistency cho số dư tài khoản ngân hàng hoặc giỏ hàng tồn kho làm phát sinh âm tiền hoặc bán vượt số lượng.',
      'Giải quyết xung đột ghi đồng thời bằng Last-Write-Wins (LWW) dựa trên đồng hồ hệ thống (Wall-clock) mà không tính đến hiện tượng Clock Drift giữa các server.'
    ],
    followUpQuestions: [
      'Tại sao CRDTs (Conflict-free Replicated Data Types) lại cho phép nhiều node sửa đổi dữ liệu đồng thời mà không bao giờ bị xung đột?',
      'Khi nào một hệ thống chấp nhận Causal Consistency thay vì Strong Consistency để đạt được thông lượng cao hơn?'
    ]
  },

  'sys-035': {
    interviewerIntent: 'Đánh giá kiến trúc cửa ngõ API (API Gateway Pattern): Hiểu vai trò trung tâm trong định tuyến, bảo mật, Rate Limiting, chuyển đổi giao thức (Protocol Translation) và giảm tải cho backend microservices.',
    contextOrScenario: 'Hệ thống gồm 40 microservices độc lập sử dụng cả REST, gRPC và GraphQL. Cần thiết kế một cổng vào duy nhất phục vụ cả Mobile App, Web SPA và 3rd-party developers với yêu cầu bảo mật xác thực token tập trung.',
    expectedKeywords: ['API Gateway Pattern', 'BFF (Backend-for-Frontend)', 'Rate Limiting', 'Authentication Offload', 'Kong / Envoy / APISIX', 'Protocol Translation (gRPC-Web)'],
    pitfalls: [
      'Biến API Gateway thành "God Service" — nhồi nhét quá nhiều business logic phức tạp vào gateway khiến nó trở thành nút thắt cổ chai và Single Point of Failure.',
      'Không cấu hình Connection Pooling và Keep-Alive giữa Gateway và các backend services, gây cạn kiệt cổng socket khi traffic cao.',
      'Chỉ triển khai 1 instance API Gateway duy nhất mà không có cụm High Availability và Load Balancer phân tải phía trước.'
    ],
    followUpQuestions: [
      'Pattern Backend-for-Frontend (BFF) giải quyết vấn đề gì khi ứng dụng Mobile và ứng dụng Desktop Web có nhu cầu tiêu thụ dữ liệu hoàn toàn khác nhau?',
      'Làm thế nào để Gateway thực hiện xác thực JWT Token phi trạng thái (Stateless) mà không cần query Database trên mỗi request?'
    ]
  },

  'sys-036': {
    interviewerIntent: 'Kiểm tra kiến thức về hạ tầng mạng microservices chuyên sâu (Service Mesh: Istio, Linkerd), vai trò của Sidecar Proxy và sự khác biệt giữa Traffic bên ngoài (North-South) và Traffic nội bộ (East-West).',
    contextOrScenario: 'Hệ thống phát triển lên 80 microservices chạy trên Kubernetes. Đội ngũ Security yêu cầu bắt buộc mã hóa toàn bộ dữ liệu truyền giữa các pods bằng mTLS (Mutual TLS), đồng thời nhóm SRE muốn quan sát tỷ lệ lỗi và độ trễ liên service mà không bắt lập trình viên phải sửa code.',
    expectedKeywords: ['Service Mesh', 'Istio / Envoy', 'Sidecar Pattern', 'mTLS (Mutual TLS)', 'East-West Traffic', 'Canary Traffic Shifting'],
    pitfalls: [
      'Áp dụng Service Mesh cho hệ thống nhỏ chỉ có 5-10 services, làm tăng 2-4ms độ trễ cho mỗi hop mạng và tiêu tốn CPU/RAM của cluster vô ích.',
      'Không hiểu sự phân định giữa API Gateway (xử lý North-South traffic từ Internet vào) và Service Mesh (xử lý East-West traffic nội bộ giữa các pods).',
      'Quên cấu hình tài nguyên giới hạn (Resource Limits) cho Envoy Sidecar Proxy khiến sidecar làm nghẽn RAM của pod ứng dụng.'
    ],
    followUpQuestions: [
      'Cơ chế mTLS trong Service Mesh bảo vệ hệ thống trước nguy cơ tấn công leo thang đặc quyền (Lateral Movement) trong mạng nội bộ như thế nào?',
      'Sidecar-less Service Mesh (như Cilium eBPF hoặc Istio Ambient Mesh) giải quyết nhược điểm tiêu tốn tài nguyên của mô hình Sidecar truyền thống ra sao?'
    ]
  },

  'sys-037': {
    interviewerIntent: 'Đánh giá khả năng xây dựng hệ thống chịu lỗi phân tán (Fault-Tolerant System), kỹ năng ngăn chặn sự cố dây chuyền (Cascading Failure Prevention) bằng Circuit Breaker Pattern.',
    contextOrScenario: 'Trong giờ cao điểm, Service Recommendation (gợi ý sản phẩm) bị treo và mất 30 giây mới phản hồi. Sự cố này làm Service Product Detail bị chiếm dụng toàn bộ connection pool và worker threads để chờ đợi, kéo theo sập toàn bộ trang chủ và luồng thanh toán.',
    expectedKeywords: ['Circuit Breaker Pattern', 'Closed / Open / Half-Open', 'Cascading Failure', 'Fallback Mechanism', 'Resilience4j / Opossum', 'Failure Rate Threshold'],
    pitfalls: [
      'Không có cơ chế Circuit Breaker, để một service phụ (Non-critical) làm sập toàn bộ dịch vụ cốt lõi của doanh nghiệp.',
      'Mở Circuit Breaker nhưng không có giải pháp Fallback dự phòng (ví dụ: trả về danh sách sản phẩm phổ biến mặc định hoặc cache cũ).',
      'Đặt ngưỡng Timeout quá dài (ví dụ: 10 giây) khiến các threads của service gọi bị tích tụ nhanh chóng làm cạn kiệt bộ nhớ.'
    ],
    followUpQuestions: [
      'Giải thích 3 trạng thái của máy trạng thái Circuit Breaker: Closed, Open và Half-Open?',
      'Làm thế nào để kết hợp Circuit Breaker với Bulkhead Pattern để cô lập hoàn toàn tài nguyên giữa các luồng gọi dịch vụ khác nhau?'
    ]
  },

  'sys-038': {
    interviewerIntent: 'Kiểm tra năng lực xử lý giao dịch phân tán (Distributed Transactions) trong kiến trúc Microservices, so sánh sâu sắc giữa 2 phong cách triển khai Saga: Choreography vs Orchestration.',
    contextOrScenario: 'Quy trình tạo đơn hàng E-Commerce trải qua 4 bước: (1) Order Service tạo đơn PENDING -> (2) Payment Service trừ tiền ví -> (3) Inventory Service giữ tồn kho -> (4) Delivery Service tạo vận đơn. Nếu bước 4 thất bại do hết tài xế, hệ thống phải tự động hoàn lại kho và hoàn tiền cho khách hàng.',
    expectedKeywords: ['Saga Pattern', 'Compensating Transactions', 'Choreography vs Orchestration', 'Temporal / Camunda', 'Eventual Consistency', 'Outbox Pattern'],
    pitfalls: [
      'Cố gắng áp dụng 2-Phase Commit (2PC) trên Microservices qua mạng Internet, gây khóa tài nguyên phân tán và giảm nghiêm trọng tính sẵn sàng (Availability).',
      'Viết Compensating Transaction không có tính Bất biến (Idempotent), dẫn đến việc bù trừ bị chạy lặp lại làm sai lệch số dư tài chính.',
      'Trong mô hình Choreography, để các service lắng nghe sự kiện vòng tròn (Circular Dependency) gây ra cơn bão event không kiểm soát được.'
    ],
    followUpQuestions: [
      'Khi nào nên dùng Saga Orchestration (dùng bộ điều phối trung tâm như Temporal) và khi nào nên dùng Choreography (sự kiện phân tán qua Kafka)?',
      'Nếu một giao dịch bù trừ (Compensating Transaction) bị lỗi mạng thất bại vĩnh viễn, hệ thống sẽ xử lý ngoại lệ này như thế nào (Dead Letter Queue & Manual Intervention)?'
    ]
  },

  'sys-039': {
    interviewerIntent: 'Đo lường sự thông thạo kiến trúc hướng sự kiện (Event-Driven Architecture - EDA), hiểu rõ các mẫu hình Event Notification, Event-Carried State Transfer và các thách thức về thứ tự tin nhắn.',
    contextOrScenario: 'Doanh nghiệp chuyển đổi từ mô hình đồng bộ (Synchronous REST APIs làm nghẽn cổ chai) sang mô hình bất đồng bộ (Asynchronous Event-Driven) để phục vụ 10 triệu người dùng, giúp các dịch vụ độc lập hoàn toàn về thời gian (Temporal Decoupling).',
    expectedKeywords: ['Event-Driven Architecture', 'Temporal Decoupling', 'Event Notification', 'Event-Carried State Transfer', 'At-least-once Delivery', 'Dead Letter Queue (DLQ)'],
    pitfalls: [
      'Sử dụng Event-Driven cho các luồng nghiệp vụ bắt buộc phải có kết quả phản hồi ngay lập tức cho người dùng (Immediate Synchronous Response).',
      'Không lường trước việc sự kiện đến sai thứ tự (Out-of-Order Delivery) trong môi trường mạng phân tán đa phân vùng.',
      'Message Consumer không thiết kế theo nguyên tắc Idempotent, làm trùng lặp hành động khi broker gửi lại tin nhắn (At-least-once delivery).'
    ],
    followUpQuestions: [
      'Phân biệt giữa Event Notification (chỉ báo có sự kiện xảy ra, consumer phải gọi lại để lấy data) và Event-Carried State Transfer (gói sẵn toàn bộ snapshot dữ liệu trong payload)?',
      'Transactional Outbox Pattern giải quyết bài toán "vừa ghi Database vừa publish Event vào Kafka một cách nguyên tử" như thế nào?'
    ]
  },

  'sys-040': {
    interviewerIntent: 'Kiểm tra sự am hiểu sâu sắc về công nghệ Message Broker, phân tích đúng đắn giữa mô hình Log-based Streaming (Apache Kafka) và Smart Broker / Dumb Consumer (RabbitMQ).',
    contextOrScenario: 'Cần chọn công nghệ hàng đợi cho 2 bài toán: (1) Hệ thống tổng hợp Log và Clickstream phân tích dữ liệu 100,000 sự kiện/giây cần khả năng Replay lại dữ liệu 7 ngày qua; (2) Hệ thống giao việc phức tạp xử lý đơn hàng cần tính năng Routing linh hoạt, Priority Queue và Retry có độ trễ tùy biến.',
    expectedKeywords: ['Kafka vs RabbitMQ', 'Log-based Streaming vs Message Queue', 'Consumer Groups & Partitioning', 'AMQP Routing Exchanges', 'Message Replay & Retention', 'Smart Broker vs Smart Consumer'],
    pitfalls: [
      'Dùng Kafka làm hàng đợi tác vụ thông thường (Task Queue) rồi cố gắng xóa từng tin nhắn riêng lẻ hoặc gán priority cho từng message (Kafka không hỗ trợ).',
      'Dùng RabbitMQ để lưu trữ và phân tích dòng dữ liệu lớn hàng Terabyte trong thời gian dài (RabbitMQ sẽ bị phình RAM và sụt giảm hiệu năng nghiêm trọng khi hàng đợi phình to).',
      'Không tính toán số lượng Kafka Partitions phù hợp, dẫn đến không thể tăng số lượng Consumer để scale khả năng xử lý song song.'
    ],
    followUpQuestions: [
      'Cơ chế Consumer Offset trong Kafka giúp các consumer độc lập đọc lại dữ liệu trong quá khứ (Time-travel Replay) như thế nào?',
      'Khi nào nên dùng RabbitMQ với Dead Letter Exchange (DLX) và Delayed Message Plugin thay vì Kafka?'
    ]
  },

  'sys-041': {
    interviewerIntent: 'Đánh giá hiểu biết về kiến trúc không máy chủ (Serverless / FaaS), nhận diện rõ ưu nhược điểm thực tế, bài toán Cold Start và nguy cơ cạn kiệt Connection Pool cơ sở dữ liệu quan hệ.',
    contextOrScenario: 'Một startup muốn triển khai hệ thống xử lý Webhook và xuất hóa đơn PDF không thường xuyên (vài nghìn request ngẫu nhiên trong ngày) nhưng muốn chi phí máy chủ bằng 0 khi không có người dùng, đồng thời sẵn sàng mở rộng tức thì khi có chiến dịch quảng cáo.',
    expectedKeywords: ['Serverless / FaaS', 'Scale-to-Zero', 'Cold Start Latency', 'Provisioned Concurrency', 'RDS Proxy / Connection Pool Exhaustion', 'Stateless Compute'],
    pitfalls: [
      'Dùng AWS Lambda kết nối trực tiếp vào PostgreSQL: Khi có 5,000 requests đồng thời, Lambda mở 5,000 instances tạo 5,000 kết nối đánh sập hoàn toàn PostgreSQL connection pool.',
      'Sử dụng Serverless cho các ứng dụng tính toán liên tục kéo dài 24/7 (chi phí Lambda sẽ đắt gấp 3-5 lần thuê cụm EC2 / Kubernetes).',
      'Bỏ qua Cold Start đối với các API đòi hỏi độ trễ cực thấp (p99 < 50ms) cho người dùng cuối trên thiết bị di động.'
    ],
    followUpQuestions: [
      'AWS RDS Proxy giải quyết bài toán nghẽn kết nối Database của Serverless functions như thế nào?',
      'Những kỹ thuật nào giúp giảm thiểu Cold Start của Lambda từ vài giây xuống dưới 100ms?'
    ]
  },

  'sys-042': {
    interviewerIntent: 'Kiểm tra năng lực lựa chọn công nghệ lưu trữ dữ liệu (SQL vs NoSQL Selection Criteria), tư duy mô hình hóa dữ liệu (ACID Relational vs Document/Key-Value/Columnar).',
    contextOrScenario: 'Thiết kế hệ thống ứng dụng ngân hàng số kết hợp mạng xã hội: Có phần giao dịch chuyển khoản đòi hỏi tính toàn vẹn tuyệt đối (ACID), nhưng cũng có phần dòng thời gian hoạt động (Activity Feed) và bình luận với hàng trăm triệu bản ghi phi cấu trúc.',
    expectedKeywords: ['SQL vs NoSQL', 'Polyglot Persistence', 'ACID vs BASE', 'Relational Normalization', 'Document Store (MongoDB)', 'Wide-Column (Cassandra)'],
    pitfalls: [
      'Cực đoan hóa việc chọn công nghệ: Ép buộc toàn bộ hệ thống chỉ được dùng duy nhất 1 loại SQL hoặc NoSQL cho mọi nghiệp vụ.',
      'Chọn NoSQL chỉ vì nghĩ rằng nó "nhanh hơn SQL" mà không hiểu SQL có chỉ mục tối ưu vẫn xử lý hàng chục nghìn QPS bình thường.',
      'Sử dụng NoSQL Document Store cho các dữ liệu có quan hệ phức tạp, dẫn đến việc phải viết code giả lập tính năng JOIN và Transaction thủ công ở tầng ứng dụng.'
    ],
    followUpQuestions: [
      'Chiến lược "Polyglot Persistence" kết hợp PostgreSQL (cho tài chính) và MongoDB/Redis (cho mạng xã hội) vận hành như thế nào trong thực tế?',
      'Khi nào nên chọn Wide-Column NoSQL (Cassandra / ScyllaDB) thay vì Document Store (MongoDB)?'
    ]
  },

  'sys-043': {
    interviewerIntent: 'Đo lường hiểu biết bản chất về cấu trúc dữ liệu lưu trữ (B-Tree Indexing), chi phí ghi ngẫu nhiên (Write Amplification) và chiến lược đánh Index thông minh.',
    contextOrScenario: 'Bảng `orders` có 50 triệu dòng, câu lệnh tìm kiếm đơn hàng theo `status` và `created_at` tốn 12 giây làm treo CPU máy chủ. Một lập trình viên junior đề xuất đánh index trên tất cả các cột của bảng để tăng tốc mọi câu truy vấn.',
    expectedKeywords: ['B-Tree Index', 'Composite Index (Leftmost Prefix)', 'Index Covering', 'Write Amplification', 'Selectivity / Cardinality', 'Full Table Scan'],
    pitfalls: [
      'Đánh index trên các cột có Cardinality quá thấp (ví dụ: cột `gender` chỉ có 2 giá trị M/F), khiến Database Optimizer bỏ qua index và quét toàn bảng (Full Table Scan).',
      'Đánh quá nhiều index (15-20 index trên 1 bảng) làm tốc độ `INSERT/UPDATE` bị sụt giảm nghiêm trọng do chi phí rebalance cây B-Tree.',
      'Tạo Composite Index `(created_at, status)` nhưng câu truy vấn lại chỉ lọc theo `WHERE status = "PAID"`, vi phạm quy tắc Leftmost Prefix làm index vô dụng.'
    ],
    followUpQuestions: [
      'Quy tắc Leftmost Prefix trong Composite Index hoạt động ra sao và thứ tự đặt các cột trong index ảnh hưởng thế nào đến hiệu năng?',
      'Covering Index (Index-Only Scan) là gì và vì sao nó giúp câu truy vấn không cần chạm vào dữ liệu thực tế trên Table Heap?'
    ]
  },

  'sys-044': {
    interviewerIntent: 'Đánh giá kỹ năng cân đối giữa Chuẩn hóa dữ liệu (Normalization 3NF) và Phi chuẩn hóa (Denormalization), hiểu rõ sự đánh đổi giữa tính toàn vẹn (Integrity) và hiệu năng truy vấn đọc.',
    contextOrScenario: 'Trang chi tiết sản phẩm thương mại điện tử cần hiển thị thông tin sản phẩm, tên danh mục, tên nhà bán hàng, số sao đánh giá trung bình và 5 bình luận mới nhất. Nếu chuẩn hóa 3NF, API phải thực hiện JOIN 6 bảng khác nhau, gây nghẽn database khi có 10,000 người xem cùng lúc.',
    expectedKeywords: ['Normalization (3NF)', 'Denormalization', 'Read Performance vs Data Anomaly', 'Update Overhead', 'Pre-computed Aggregates', 'Materialized Views'],
    pitfalls: [
      'Phi chuẩn hóa dữ liệu bừa bãi mà không có cơ chế đồng bộ, dẫn đến hiện tượng dữ liệu không nhất quán (Update Anomaly — sửa tên nhà bán hàng ở 1 nơi nhưng các đơn cũ hiển thị tên khác).',
      'Giữ chuẩn hóa 3NF tuyệt đối trong hệ thống đọc cực lớn (Read-Heavy), buộc database phải JOIN liên tục các bảng hàng trăm triệu dòng.',
      'Không sử dụng Materialized View hoặc CDC để cập nhật các trường phi chuẩn hóa một cách tự động.'
    ],
    followUpQuestions: [
      'Khi nào nên áp dụng Denormalization (ví dụ: lưu sẵn `category_name` vào bảng `products`) và cách xử lý khi `category_name` bị đổi tên là gì?',
      'Sự khác biệt giữa việc lưu trường tổng hợp (Pre-calculated field) trực tiếp trong bảng và việc sử dụng PostgreSQL Materialized View có tính năng Fast Refresh?'
    ]
  },

  'sys-045': {
    interviewerIntent: 'Kiểm tra năng lực thiết kế hệ thống lưu trữ tệp tin quy mô lớn (Blob / Object Storage), sự am hiểu về Amazon S3 / MinIO và kỹ thuật Upload trực tiếp bằng Presigned URL.',
    contextOrScenario: 'Ứng dụng chia sẻ video và tài liệu cho phép người dùng tải lên các tệp tin có dung lượng từ 500MB đến 5GB. Nếu cho client upload trực tiếp qua web backend, server sẽ bị cạn kiệt RAM và băng thông mạng.',
    expectedKeywords: ['Blob / Object Storage (S3)', 'Presigned URL', 'Multipart Upload', 'Multipart Abort Lifecycle', 'Content-MD5 Checksum', 'Zero-Server-Hop'],
    pitfalls: [
      'Cho phép Client upload file dung lượng lớn qua Backend Server (Node.js/Java) rồi server mới đẩy lên S3: Gây nghẽn băng thông, tràn RAM và tốn chi phí gấp đôi đường truyền mạng.',
      'Cấp quyền công khai (Public Write) vào S3 bucket mà không dùng Presigned URL hoặc IAM policy chặt chẽ.',
      'Không cấu hình Lifecycle Rule để tự động dọn dẹp các mảnh Multipart Upload bị hủy dở (Incomplete Multipart Uploads), làm tốn hàng nghìn USD tiền lưu trữ rác trên AWS S3.'
    ],
    followUpQuestions: [
      'Cơ chế S3 Multipart Upload chia nhỏ file thành các chunks 5MB-10MB và upload song song với khả năng resume khi rớt mạng hoạt động như thế nào?',
      'Làm thế nào để xác thực tính toàn vẹn của file (chống lỗi bit hoặc giả mạo) khi upload lên S3 bằng Checksum SHA-256 / MD5?'
    ]
  },

  'sys-048': {
    interviewerIntent: 'Đánh giá kiến thức toàn diện về Giám sát vận hành hệ thống (Observability), phân biệt rõ 3 trụ cột: Metrics, Logs và Traces, và phương pháp luận ứng dụng từng trụ cột trong xử lý sự cố trực chiến.',
    contextOrScenario: 'Lúc 2 giờ sáng, hệ thống cảnh báo tỷ lệ lỗi 5xx tăng vọt lên 8%. Kỹ sư On-call cần biết: Bắt đầu nhìn vào Dashboard nào trước? Dùng công cụ gì để cô lập service bị lỗi? Và dùng gì để tìm ra chính xác dòng code gây lỗi?',
    expectedKeywords: ['Three Pillars of Observability', 'Metrics (Prometheus)', 'Centralized Logs (Loki/ELK)', 'Distributed Traces (Tempo/Jaeger)', 'OpenTelemetry', 'Alerting SLI/SLO'],
    pitfalls: [
      'Nhầm lẫn giữa Monitoring (chỉ biết hệ thống có lỗi) và Observability (hiểu được tại sao hệ thống bị lỗi từ bên trong).',
      'Lao ngay vào đọc hàng triệu dòng Logs thô một cách mù quáng khi có sự cố mà không nhìn vào Metrics để khoanh vùng thời điểm và service bị ảnh hưởng.',
      'In quá nhiều log không cần thiết ở môi trường Production làm tăng chi phí lưu trữ và nghẽn I/O Disk của cụm máy chủ.'
    ],
    followUpQuestions: [
      'Quy trình phối hợp chuẩn giữa Metrics -> Traces -> Logs (The Golden Workflow) khi điều tra một sự cố production là gì?',
      'High Cardinality trong Metrics (ví dụ: gắn `user_id` làm tag trong Prometheus metric) gây ra hậu quả gì cho hệ thống giám sát?'
    ]
  },

  'sys-049': {
    interviewerIntent: 'Đo lường năng lực thiết kế hệ thống phát sự kiện Webhook đáng tin cậy (Reliable Webhook Delivery Engine) tương tự chuẩn công nghiệp của Stripe/GitHub, cơ chế Retry lũy tiến và bảo mật chữ ký HMAC.',
    contextOrScenario: 'Cổng thanh toán cần gửi thông báo Webhook về đơn hàng thành công cho hàng nghìn website đối tác (Merchant endpoints). Các máy chủ đối tác có thể bị chậm, mất mạng hoặc trả về lỗi 500 ngẫu nhiên.',
    expectedKeywords: ['Webhook Engine', 'HMAC-SHA256 Signature', 'Exponential Backoff with Jitter', 'Idempotency Key', 'Dead Letter Queue', 'Outbox Pattern'],
    pitfalls: [
      'Thực hiện gọi Webhook HTTP request đồng bộ (Synchronous) ngay trong luồng thanh toán, làm khách hàng phải chờ và khiến giao dịch bị timeout khi server đối tác phản hồi chậm.',
      'Gửi payload thô không kèm chữ ký số HMAC, cho phép kẻ xấu giả mạo thông báo thanh toán thành công để chiếm đoạt hàng hóa.',
      'Retry liên tục không có giãn cách thời gian (Không dùng Exponential Backoff), vô tình tạo ra cuộc tấn công từ chối dịch vụ (DDoS) vào server của đối tác đang bị lỗi.'
    ],
    followUpQuestions: [
      'Làm thế nào để bảo vệ hệ thống trước cuộc tấn công Server-Side Request Forgery (SSRF) khi cho phép người dùng tự do nhập Webhook URL của họ?',
      'Chiến lược xử lý các Webhook thất bại vĩnh viễn sau 10 lần retry (Dead Letter Queue & Manual Webhook Redelivery Dashboard) là gì?'
    ]
  },

  'sys-050': {
    interviewerIntent: 'Đánh giá kỹ năng ước lượng năng lực hệ thống nhanh (Back-of-the-envelope Capacity Estimation), tư duy định lượng các con số QPS, Lưu lượng mạng (Bandwidth) và Dung lượng đĩa cứng (Storage) trong 5 phút.',
    contextOrScenario: 'Phỏng vấn viên yêu cầu: "Hãy thiết kế YouTube". Trước khi vẽ sơ đồ, ứng viên cần đưa ra con số ước tính về: Số lượng video tải lên mỗi giây, băng thông mạng cần để stream video cho người dùng, và dung lượng ổ cứng cần bổ sung mỗi năm.',
    expectedKeywords: ['Back-of-the-envelope Estimation', 'QPS (Average vs Peak)', 'Bandwidth Ingress/Egress', 'Storage Capacity 5-Year', 'Powers of Two (2^10, 2^20)', 'Read/Write Ratio'],
    pitfalls: [
      'Quên nhân hệ số an toàn cho lưu lượng đỉnh (Peak Traffic thường gấp 2-5 lần Average Traffic).',
      'Nhầm lẫn giữa đơn vị Byte (B) và Bit (b) khi tính toán băng thông mạng (1 Byte = 8 bits).',
      'Đưa ra các con số ước lượng quá chi tiết vụn vặt (như 23.456 MB) thay vì làm tròn các mốc số mũ (Round numbers) để tính nhẩm nhanh.'
    ],
    followUpQuestions: [
      'Nếu hệ thống có 10 triệu DAU, mỗi user gửi 5 tin nhắn/ngày, hãy tính QPS trung bình và QPS đỉnh trong 60 giây?',
      'Công thức ước lượng dung lượng lưu trữ cho 5 năm có tính đến hệ số nhân bản dữ liệu (Replication Factor = 3) và tỷ lệ tăng trưởng người dùng hàng năm là gì?'
    ]
  },

  'sys-051': {
    interviewerIntent: 'Kiểm tra sự hiểu biết sâu sắc về các chính sách giải phóng bộ nhớ đệm (Cache Eviction Policies: LRU, LFU, FIFO, TTL) và khả năng chọn thuật toán phù hợp cho từng loại dữ liệu.',
    contextOrScenario: 'Cụm Redis 64GB RAM đã bị đầy 100%. Nếu không giải phóng bộ nhớ, Redis sẽ từ chối nhận thêm dữ liệu mới (`OOM command not allowed`). Kỹ sư cần chọn chính sách `maxmemory-policy` chính xác nhất cho hệ thống.',
    expectedKeywords: ['Cache Eviction Policies', 'LRU (Least Recently Used)', 'LFU (Least Frequently Used)', 'volatile-lru vs allkeys-lru', 'Cache Churn', 'Time-To-Live (TTL)'],
    pitfalls: [
      'Sử dụng thuật toán LRU cho dữ liệu có tính chu kỳ hoặc các đợt batch scan lớn, dẫn đến việc dữ liệu hot bị quét sạch khỏi cache (Cache Pollution).',
      'Cấu hình `noeviction` trên Redis mà không kiểm soát dung lượng, khiến toàn bộ ứng dụng bị crash khi Redis trả về lỗi ghi bộ nhớ.',
      'Không thiết lập TTL cho các key tạm thời, làm bộ đệm chứa đầy rác vĩnh viễn.'
    ],
    followUpQuestions: [
      'Khi nào chính sách LFU (Least Frequently Used) hoạt động hiệu quả hơn LRU trong bài toán đề xuất sản phẩm hoặc mạng xã hội?',
      'Redis triển khai thuật toán Approximated LRU (Lấy mẫu ngẫu nhiên 5 keys) như thế nào để vừa đạt hiệu quả xấp xỉ LRU chuẩn vừa tiết kiệm bộ nhớ RAM?'
    ]
  },

  'sys-052': {
    interviewerIntent: 'Đánh giá khả năng xử lý bất định phân tán (Handling In-Doubt Distributed Transactions), kỹ năng hòa giải giao dịch thanh toán và kiến trúc đối soát tự động.',
    contextOrScenario: 'Người dùng đã bị trừ tiền trên ứng dụng ngân hàng khi quét mã QR VNPay/MoMo, nhưng trên website bán hàng đơn vẫn ở trạng thái `PENDING` do đường truyền Internet bị rớt gói tin khiến Webhook IPN từ cổng thanh toán không tới được server.',
    expectedKeywords: ['In-Doubt Transaction', 'Reconciliation Worker (Đối soát)', 'Active Polling Query', 'Eventual Consistency', 'Webhook Fallback', 'Order State Machine'],
    pitfalls: [
      'Tự động hủy đơn hàng (CANCELLED) ngay khi quá 15 phút mà không gọi API sang cổng thanh toán để xác minh xem tiền đã bị trừ chưa.',
      'Chỉ ngồi chờ bị động Webhook IPN từ đối tác mà không có cơ chế chủ động đối soát (Active Polling Worker).',
      'Không khóa trạng thái đơn hàng (State Machine Lock) khi đang xử lý đối soát, dẫn đến race condition nếu IPN vừa ùa tới cùng lúc với cron job.'
    ],
    followUpQuestions: [
      'Quy trình thiết kế Worker kiểm tra trạng thái đơn hàng theo lịch giãn cách (1 phút, 5 phút, 15 phút, 1 giờ) hoạt động như thế nào?',
      'File đối soát cuối ngày (End-of-day Reconciliation File) giải quyết các sai lệch tài chính giữa ngân hàng và doanh nghiệp ra sao?'
    ]
  },

  'sys-053': {
    interviewerIntent: 'Đo lường năng lực thiết kế luồng hoàn tiền an toàn (Safe Refund Flow), chống gian lận rút ruột tài khoản, bảo vệ tính bất biến (Idempotency) và quản lý trạng thái máy đơn hàng.',
    contextOrScenario: 'Khách hàng bấm nút "Hủy đơn và Hoàn tiền". Khách hàng nhấn liên tục 5 lần nút bấm do mạng chậm. Hệ thống phải đảm bảo tiền chỉ được hoàn đúng 1 lần duy nhất và trạng thái tồn kho được hoàn trả chính xác.',
    expectedKeywords: ['Refund State Machine', 'Idempotency Key', 'Optimistic Locking', 'Compensating Transaction', 'Audit Ledger', 'Inventory Restock'],
    pitfalls: [
      'Thực hiện hoàn tiền mà không có Idempotency Key, khiến khách hàng được hoàn tiền nhiều lần cho cùng một đơn hàng.',
      'Hoàn tiền thành công nhưng bỏ quên bước hoàn trả số lượng hàng vào kho (Inventory Leakage).',
      'Cho phép hoàn tiền vượt quá số tiền thực tế khách hàng đã thanh toán (sau khi đã trừ voucher và phí vận chuyển).'
    ],
    followUpQuestions: [
      'Làm thế nào để xử lý hoàn tiền một phần (Partial Refund) khi khách chỉ trả lại 1 món trong đơn hàng 5 món?',
      'Khi cổng thanh toán phản hồi hoàn tiền ở trạng thái bất định (Timeout), hệ thống chuyển đơn hàng sang trạng thái nào để an toàn?'
    ]
  },

  'sys-054': {
    interviewerIntent: 'Kiểm tra kỹ thuật xử lý tệp tin trực tiếp trên Cloud Storage (Direct-to-S3 Upload), cơ chế xác thực sự kiện hoàn tất và kiểm duyệt bảo mật file tải lên.',
    contextOrScenario: 'Người dùng tải ảnh đại diện lên S3 bằng Presigned URL. Cần ngăn chặn kẻ xấu upload một file video 10GB hoặc file chứa mã độc thực thi (.exe/.sh) đổi tên thành .jpg, đồng thời backend phải biết chính xác khi nào upload hoàn tất để cập nhật database.',
    expectedKeywords: ['S3 Presigned URL', 'S3 Event Notifications (SNS/SQS)', 'Content-Type Whitelist', 'Max File Size Constraints', 'Virus Scanning (ClamAV)', 'Webhook Callback'],
    pitfalls: [
      'Tin tưởng hoàn toàn vào sự kiện client báo "em đã upload xong rồi" mà không xác minh lại với S3 API.',
      'Không giới hạn dung lượng file trong Presigned URL Policy (`content-length-range`), để người dùng upload file khổng lồ làm tốn dung lượng lưu trữ.',
      'Cho phép thực thi trực tiếp các file người dùng upload trên cùng domain chính (nguy cơ XSS và Malware execution).'
    ],
    followUpQuestions: [
      'Làm thế nào để cấu hình S3 Event Notification đẩy tin nhắn vào SQS Queue để kích hoạt Lambda resize ảnh tự động ngay khi upload xong?',
      'Làm thế nào để xác minh định dạng file thực tế (Magic Bytes) thay vì chỉ nhìn vào đuôi mở rộng của tên file?'
    ]
  },

  'sys-055': {
    interviewerIntent: 'Đánh giá khả năng thiết kế hệ thống tìm kiếm và lọc sản phẩm E-Commerce (Full-Text Search & Multi-Faceted Filtering), xử lý tiếng Việt không dấu và tối ưu hóa hiệu năng.',
    contextOrScenario: 'Sàn thương mại điện tử có 10 triệu sản phẩm. Người dùng tìm kiếm từ khóa "dien thoai samsung pin trau" (gõ không dấu), lọc theo giá từ 5-10 triệu, màu đen, bộ nhớ 128GB, và sắp xếp theo số lượng đã bán giảm dần. Thời gian phản hồi phải dưới 50ms.',
    expectedKeywords: ['Elasticsearch / OpenSearch', 'Inverted Index', 'Faceted Search', 'Vietnamese Analysis (Unaccent)', 'Composite Aggregation', 'Filter Context (Caching)'],
    pitfalls: [
      'Dùng câu lệnh SQL `LIKE "%dien thoai%"` trên cơ sở dữ liệu quan hệ: Gây Full Table Scan trên bảng 10 triệu dòng làm sập DB.',
      'Thực hiện tính toán số lượng bộ lọc (Faceted counts) bằng hàng chục câu query `COUNT(*)` lặp lại.',
      'Không chuẩn hóa tiếng Việt có dấu và không dấu trong Analyzer, khiến người dùng gõ "áo phông" không ra "ao phong".'
    ],
    followUpQuestions: [
      'Cấu trúc Inverted Index trong Elasticsearch giúp tìm kiếm từ khóa nhanh hơn B-Tree của cơ sở dữ liệu quan hệ như thế nào?',
      'Làm thế nào để đồng bộ dữ liệu sản phẩm từ PostgreSQL sang Elasticsearch trong thời gian thực mà không bị mất dữ liệu (CDC với Debezium)?'
    ]
  },

  'sys-056': {
    interviewerIntent: 'Kiểm tra năng lực thiết kế hệ thống ghi vết kiểm toán (Audit Logging Architecture) chuẩn doanh nghiệp, tính bất biến, khả năng tra cứu nhanh và bảo vệ dữ liệu nhạy cảm.',
    contextOrScenario: 'Quy định tuân thủ bảo mật SOX / ISO 27001 đòi hỏi: Bất kỳ thay đổi nào trên đơn hàng hoặc hồ sơ người dùng (ai sửa, sửa từ giá trị cũ nào sang giá trị mới, vào thời điểm nào, từ IP nào) đều phải được lưu trữ bất biến trong 3 năm và không ai (kể cả Database Administrator) có quyền chỉnh sửa hay xóa.',
    expectedKeywords: ['Audit Trail', 'Append-Only Ledger', 'Change Data Capture', 'Immutability (Write-Once-Read-Many)', 'Diff JSON Patch', 'WORM Storage / CloudWatch Logs'],
    pitfalls: [
      'Ghi audit log chung vào cùng 1 bảng với dữ liệu nghiệp vụ, làm phình to bảng chính và có thể bị hacker sửa đổi khi chiếm được quyền DB.',
      'Chỉ lưu giá trị mới mà không lưu giá trị cũ (Before/After Diff), khiến việc điều tra nguyên nhân sai lệch dữ liệu trở nên bất khả thi.',
      'In thẳng mật khẩu, mã OTP hoặc số thẻ ngân hàng của người dùng vào bản ghi Audit Log.'
    ],
    followUpQuestions: [
      'Làm thế nào để sử dụng chuẩn JSON Patch (RFC 6902) để lưu vết sự thay đổi dữ liệu một cách tối ưu dung lượng nhất?',
      'Kiến trúc lưu trữ WORM (Write Once, Read Many) trên AWS S3 Object Lock bảo vệ Audit Log trước sự can thiệp của quản trị viên hệ thống như thế nào?'
    ]
  },

  'sys-057': {
    interviewerIntent: 'Đo lường sự cẩn trọng và chuẩn mực trong xử lý thời gian phân tán (Distributed Timestamps & Timezones), quy tắc chuyển đổi UTC và xử lý ranh giới ngày báo cáo tài chính.',
    contextOrScenario: 'Hệ thống phục vụ khách hàng trên toàn cầu (Mỹ, Nhật, Châu Âu, Việt Nam). Khách hàng thanh toán lúc 23:55 ngày 31/12 tại California (Mỹ). Bộ phận Kế toán tại Việt Nam cần chốt doanh thu năm tài chính chính xác theo múi giờ `Asia/Ho_Chi_Minh` (UTC+7).',
    expectedKeywords: ['UTC Storage Rule', 'ISO 8601 String', 'Timezone-Aware Timestamp', 'Daylight Saving Time (DST)', 'Reporting Boundary Conversion', 'Leap Seconds'],
    pitfalls: [
      'Lưu trữ thời gian dưới dạng chuỗi địa phương không có múi giờ (Local Timestamp naive) như `2026-09-30 08:00:00` khiến không thể xác định thời điểm thực tế.',
      'Cộng trừ giờ thủ công bằng cách `timestamp + 7 * 3600` mà không dùng thư viện quản lý múi giờ chuẩn (dễ dính lỗi giờ mùa hè Daylight Saving Time).',
      'Sử dụng đồng hồ hệ thống (Wall-clock) của server backend thay vì đồng hồ UTC được đồng bộ qua NTP (Network Time Protocol).'
    ],
    followUpQuestions: [
      'Quy tắc vàng: "Lưu trữ UTC tại tầng Database/Backend, chỉ chuyển đổi sang Local Timezone tại tầng UI hiển thị" áp dụng ra sao?',
      'Khi tổng hợp báo cáo doanh thu theo ngày cho thị trường Mỹ, làm thế nào để xử lý sự kiện đổi giờ mùa hè (Daylight Saving Time) khiến ngày đó có 23 hoặc 25 tiếng?'
    ]
  },

  'sys-058': {
    interviewerIntent: 'Kiểm tra kỹ năng giải quyết xung đột ghi đồng thời cao (Row Lock Contention Prevention), kỹ thuật gom mẻ (Write Buffering) và tối ưu hóa chi phí I/O.',
    contextOrScenario: 'Một bài viết tin tức đạt 100,000 lượt đọc trong 10 phút. Nếu mỗi lần mở trang đều thực hiện `UPDATE posts SET views = views + 1 WHERE id = 123`, cơ sở dữ liệu MySQL/PostgreSQL sẽ lập tức bị treo do tranh chấp khóa hàng (Row Lock Contention) và nghẽn CPU.',
    expectedKeywords: ['Row Lock Contention', 'Write Buffering', 'Redis INCR', 'Write-Back Strategy', 'Debouncing / Throttling', 'Batch Flush'],
    pitfalls: [
      'Ghi trực tiếp vào database trên từng request đọc: Biến một bài toán Đọc-nặng thành bài toán Ghi-nặng làm nghẽn chết toàn bộ cơ sở dữ liệu.',
      'Lưu số lượt xem vào bộ nhớ cục bộ của web server: Khi có nhiều servers chạy song song, số liệu view sẽ bị lệch hoàn toàn.',
      'Không xử lý trường hợp Redis bị sập: Cần có cơ chế định kỳ đồng bộ số liệu bền vững về SQL Database.'
    ],
    followUpQuestions: [
      'Mô hình Write-Back Cache kết hợp Redis Atomic Increment với Background Batch Flush vào PostgreSQL hoạt động chi tiết như thế nào?',
      'Làm thế nào để chống bot cày view ảo (F5 liên tục) bằng Redis HyperLogLog?'
    ]
  },

  'sys-059': {
    interviewerIntent: 'Đánh giá năng lực tính toán ước lượng kỹ thuật thực tế (Real-World Capacity Math) từ con số 10 triệu DAU: Chuyển đổi thành QPS, Dung lượng lưu trữ và Băng thông mạng.',
    contextOrScenario: 'Trong buổi phỏng vấn thiết kế ứng dụng chia sẻ hình ảnh (Instagram scale) với 10 triệu người dùng hoạt động hằng ngày (DAU), phỏng vấn viên yêu cầu ứng viên ước lượng toàn bộ tài nguyên phần cứng cần thiết để vận hành trong 1 năm.',
    expectedKeywords: ['DAU to QPS Math', 'Read/Write Ratio', 'Peak Traffic Factor', 'Storage Calculation (Raw + Redundancy)', 'Egress Bandwidth (Gbps)', 'Safety Margin'],
    pitfalls: [
      'Chỉ tính toán cho lưu lượng trung bình mà quên nhân hệ số Peak (lưu lượng giờ cao điểm thường gấp 2-4 lần trung bình).',
      'Quên tính toán dung lượng lưu trữ dự phòng (Replication Factor x3) và dung lượng dành cho các chỉ mục (Indexes tốn thêm 20-30% disk space).',
      'Nhầm lẫn giữa Gigabytes (GB) lưu trữ và Gigabits per second (Gbps) băng thông mạng.'
    ],
    followUpQuestions: [
      'Với 10 triệu DAU, mỗi user xem 20 ảnh (mỗi ảnh 200KB) và tải lên 1 ảnh, hãy tính tổng băng thông Egress cần thiết (Gbps)?',
      'Làm thế nào để tính toán số lượng server backend cần thiết dựa trên thông lượng QPS đỉnh và khả năng chịu tải của một server đơn lẻ?'
    ]
  },

  'sys-060': {
    interviewerIntent: 'Đo lường sự am hiểu về các chỉ số đo lường hiệu năng thực tế (Percentiles vs Average), lý do tại sao chỉ số trung bình (Mean Latency) lại là một cạm bẫy dối trá che giấu lỗi.',
    contextOrScenario: 'Dashboard báo cáo: "Thời gian phản hồi trung bình của API là 50ms". Tuy nhiên, 10% khách hàng VIP thực hiện các đơn hàng lớn liên tục phàn nàn rằng họ phải chờ hơn 5 giây mới thanh toán được.',
    expectedKeywords: ['Percentile Latency (p50, p95, p99)', 'Average / Mean Fallacy', 'Long Tail Latency', 'Outlier Concealment', 'SLA Target', 'Histogram Metric'],
    pitfalls: [
      'Sử dụng độ trễ trung bình để cam kết SLA với khách hàng: Một hệ thống có 99 request chạy trong 1ms và 1 request bị treo 100 giây vẫn có độ trễ trung bình là ~1 giây, nhưng khách hàng thứ 100 đã bỏ đi.',
      'Không nhận ra rằng trong kiến trúc microservices với 20 service calls liên tiếp, xác suất người dùng dính phải Tail Latency (p99) tăng lên theo công thức số mũ.',
      'Cố gắng tính toán Percentiles bằng cách gom toàn bộ số liệu thô về một máy thay vì sử dụng cấu trúc dữ liệu xấp xỉ như T-Digest hoặc HdrHistogram.'
    ],
    followUpQuestions: [
      'Tại sao trong một trang web gọi đồng thời 50 microservices con, độ trễ trải nghiệm của người dùng thực tế sẽ tiệm cận độ trễ p99 của service chậm nhất?',
      'Cách cấu hình Prometheus Histogram Buckets để đo lường p99 chính xác mà không gây bùng nổ bộ nhớ?'
    ]
  },

  'sys-061': {
    interviewerIntent: 'Kiểm tra kiến thức về các cam kết chất lượng dịch vụ (Service Level Agreements), sự phân biệt rạch ròi giữa SLI, SLO và SLA, cùng khả năng quy đổi các số 9 sẵn sàng (High Availability Math).',
    contextOrScenario: 'Bộ phận Kinh doanh muốn cam kết hợp đồng SLA với khách hàng doanh nghiệp mức "99.99% sẵn sàng". Kỹ sư trưởng cần giải thích cho ban giám đốc mức này tương đương bao nhiêu phút downtime mỗi năm và những chi phí hạ tầng bắt buộc phải đầu tư.',
    expectedKeywords: ['SLI (Service Level Indicator)', 'SLO (Service Level Objective)', 'SLA (Service Level Agreement)', 'Error Budget', 'High Availability (Three 9s vs Four 9s)', 'Downtime Calculation'],
    pitfalls: [
      'Nhầm lẫn giữa 3 khái niệm: SLI (cái ta đo được), SLO (mục tiêu nội bộ của team), SLA (cam kết pháp lý có đền bù tiền).',
      'Hứa hẹn mức 99.999% (Five Nines) mà không biết nó chỉ cho phép hệ thống downtime tối đa 5 phút trong cả một năm.',
      'Không xây dựng cơ chế Error Budget: Khi hệ thống đã dùng hết ngân sách lỗi trong tháng, nhóm phát triển phải dừng release tính năng mới để tập trung vá lỗi ổn định hệ thống.'
    ],
    followUpQuestions: [
      '99.9% (Three Nines) và 99.99% (Four Nines) khác nhau thế nào về thời gian downtime cho phép mỗi tháng?',
      'Error Budget Policy giúp giải quyết mâu thuẫn giữa nhóm Product (muốn release nhanh) và nhóm SRE/Ops (muốn hệ thống ổn định) như thế nào?'
    ]
  },

  'sys-062': {
    interviewerIntent: 'Đánh giá kỹ năng thiết kế giao diện lập trình ứng dụng (API Design Best Practices), phong cách trình bày mạch lạc và tư duy hướng hợp đồng (Contract-First Design) trong phỏng vấn.',
    contextOrScenario: 'Trong buổi phỏng vấn thiết kế tính năng đặt xe công nghệ (Grab/Uber ride-hailing), ứng viên cần trình bày rõ ràng các API endpoints cốt lõi trong vòng 5 phút mà không bị sa đà vào chi tiết vụn vặt.',
    expectedKeywords: ['API Contract Design', 'RESTful Conventions', 'HTTP Verbs & Status Codes', 'Idempotency Header', 'Pagination (Cursor-based)', 'Payload Contracts'],
    pitfalls: [
      'Viết các endpoint mơ hồ không tuân thủ chuẩn REST (ví dụ: `POST /getDriver` hoặc `GET /cancelRide`).',
      'Quên định nghĩa mã phản hồi HTTP trạng thái lỗi (như 400 Bad Request, 404 Not Found, 409 Conflict, 429 Too Many Requests).',
      'Không đưa Header `Idempotency-Key` vào các API thanh toán hoặc đặt cuốc xe.'
    ],
    followUpQuestions: [
      'Tại sao với API phân trang dữ liệu thời gian thực (Feed / Chat), Cursor-based Pagination lại vượt trội hơn Offset-based Pagination?',
      'Khi nào nên sử dụng gRPC (Protocol Buffers) thay vì REST JSON cho giao tiếp giữa các dịch vụ nội bộ?'
    ]
  },

  'sys-063': {
    interviewerIntent: 'Kiểm tra tư duy mô hình hóa dữ liệu (Data Modeling), khả năng chọn đúng hệ quản trị cơ sở dữ liệu phù hợp với mô hình truy vấn (Access Patterns) và thiết kế Schema tối ưu.',
    contextOrScenario: 'Bước thiết kế Data Model trong bài toán mạng xã hội: Cần quyết định lưu trữ mối quan hệ bạn bè/follow, bài viết và tương tác like. Cần chọn giữa cơ sở dữ liệu quan hệ, NoSQL Document hay Graph Database.',
    expectedKeywords: ['Data Modeling', 'Access Pattern Analysis', 'Relational vs Non-Relational', 'Primary & Foreign Keys', 'Graph Database (Neo4j)', 'Query-Driven Schema'],
    pitfalls: [
      'Thiết kế Schema cơ sở dữ liệu trước khi làm rõ Access Patterns (các câu query đọc/ghi mà ứng dụng sẽ thực sự chạy).',
      'Lưu trữ mối quan hệ bạn bè nhiều tầng (Friends of Friends) trong RDBMS bằng các câu recursive JOIN làm sập database khi quy mô lớn.',
      'Bỏ qua các trường dữ liệu bắt buộc cho việc phân vùng dữ liệu sau này (như `created_at` hoặc `tenant_id`).'
    ],
    followUpQuestions: [
      'Tại sao trong NoSQL (Cassandra / DynamoDB), người ta bắt buộc phải thiết kế bảng dựa hoàn toàn vào câu truy vấn (Query-Driven Design) thay vì chuẩn hóa theo thực thể?',
      'Mô hình hóa dữ liệu dạng Graph (Graph Data Model) phát huy sức mạnh vượt trội trong những bài toán nào?'
    ]
  },

  'sys-064': {
    interviewerIntent: 'Đánh giá khả năng nhận diện các điểm yếu chết người (Single Point of Failure - SPOF) trên sơ đồ kiến trúc và phương pháp luận thiết kế dự phòng (Redundancy & Failover).',
    contextOrScenario: 'Nhìn vào sơ đồ hệ thống gồm: 1 DNS -> 1 Load Balancer -> 3 Web Servers -> 1 Primary Database -> 1 Redis Server. Kỹ sư cần chỉ ra toàn bộ các điểm SPOF và đề xuất giải pháp dự phòng tương ứng.',
    expectedKeywords: ['Single Point of Failure (SPOF)', 'High Availability (HA)', 'Redundancy', 'Active-Passive Failover', 'Multi-AZ Deployment', 'Chaos Engineering'],
    pitfalls: [
      'Nghĩ rằng chạy 3 Web Servers là hệ thống đã không còn SPOF (trong khi Load Balancer đơn lẻ hoặc Database đơn lẻ bị bỏ quên).',
      'Không kiểm tra cơ chế Failover định kỳ: Dự phòng có sẵn nhưng khi sự cố xảy ra thì script failover bị lỗi hoặc DNS TTL quá dài.',
      'Bỏ qua các SPOF tầng hạ tầng vật lý: Toàn bộ máy chủ dự phòng đều nằm chung trong cùng 1 tủ rack hoặc 1 Availability Zone của Datacenter.'
    ],
    followUpQuestions: [
      'Làm thế nào để loại bỏ SPOF tại tầng Load Balancer bằng VRRP (Keepalived) hoặc DNS Anycast?',
      'Chaos Engineering (như Chaos Monkey) giúp các kỹ sư chủ động phát hiện SPOF trong môi trường production như thế nào?'
    ]
  },

  'sys-065': {
    interviewerIntent: 'Kiểm tra hiểu biết sâu sắc về quản lý tài nguyên mạng và luồng thực thi (Network Timeouts & Thread Exhaustion), cơ chế chọn Timeout và ngăn chặn thảm họa sập dây chuyền.',
    contextOrScenario: 'Service Order gọi sang Service Payment qua giao thức HTTP. Do cổng thanh toán bị treo, kết nối TCP bị giữ lơ lửng mà không ngắt. Sau 2 phút, toàn bộ 200 worker threads của Service Order bị chiếm dụng để chờ phản hồi, khiến toàn bộ hệ sinh thái sập theo.',
    expectedKeywords: ['Network Timeouts (Connect vs Read)', 'Thread Pool Exhaustion', 'Cascading Outage', 'Deadline Propagation (gRPC Context)', 'Tail Latency (p99.9) as Timeout Guide', 'Circuit Breaker'],
    pitfalls: [
      'Sử dụng giá trị Timeout mặc định của HTTP Client (nhiều thư viện mặc định Timeout = Vô cực hoặc 60 giây).',
      'Chỉ đặt Read Timeout mà quên đặt Connection Timeout (Connect Timeout khi server đích bị nghẽn SYN packet).',
      'Đặt Timeout quá ngắn dưới ngưỡng p99 bình thường, khiến các request xử lý hợp lệ bị ngắt oan và gây bão retry.'
    ],
    followUpQuestions: [
      'Công thức chuẩn Senior để chọn giá trị Timeout cho một lời gọi dịch vụ (dựa trên p99 hoặc p99.9 latency của downstream service) là gì?',
      'Cơ chế Deadline Propagation trong gRPC truyền thời gian sống còn lại của một request xuyên suốt chuỗi microservices như thế nào?'
    ]
  }
};

let count = 0;
for (const [id, update] of Object.entries(metadataPart1)) {
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
console.log(`Updated Metadata Part 1 successfully: ${count} questions updated.`);
