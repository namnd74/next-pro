import fs from 'node:fs';
import path from 'node:path';

const filePath = path.resolve('src/features/interview/data/json/system-design-bank.json');
const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));

const metadataPart2 = {
  'sys-066': {
    interviewerIntent: 'Đo lường sự hiểu biết về cơ chế gắn kết phiên làm việc (Session Affinity / Sticky Sessions), cạm bẫy phân bố tải lệch và lý do vì sao kiến trúc hiện đại ưu tiên Stateless.',
    contextOrScenario: 'Một hệ thống e-commerce cấu hình Sticky Session trên Load Balancer bằng Cookie. Một văn phòng công ty lớn gồm 5,000 nhân viên cùng truy cập qua 1 IP mạng NAT, khiến toàn bộ 5,000 người bị dồn vào đúng 1 server backend duy nhất làm server đó sập vì quá tải.',
    expectedKeywords: ['Sticky Sessions / Session Affinity', 'Uneven Load Distribution', 'NAT Gateway Hotspot', 'Stateless Architecture', 'Distributed Session Store (Redis)', 'Cookie-based Routing'],
    pitfalls: [
      'Sử dụng Sticky Session để trì hoãn việc chuyển đổi ứng dụng sang Stateless, gây khó khăn cho việc Autoscaling và Rolling Deployment.',
      'Định tuyến dựa trên Client IP: Gặp thảm họa khi hàng nghìn người dùng dùng chung mạng NAT công ty hoặc dải mạng 4G/5G.',
      'Khi một server backend bị sập, toàn bộ session gắn với server đó bị mất sạch, người dùng bị văng ra khỏi hệ thống.'
    ],
    followUpQuestions: [
      'Tại sao việc lưu trữ Session ID trong Redis Cluster tập trung lại là giải pháp tối ưu hơn nhiều so với Sticky Sessions?',
      'Khi nào Sticky Session là một yêu cầu bắt buộc không thể thay thế (ví dụ: HTTP Long-Polling hoặc Socket.io handshake)?'
    ]
  },

  'sys-067': {
    interviewerIntent: 'Đánh giá khả năng xử lý hiện tượng trễ sao chép dữ liệu (Replication Lag), bảo vệ trải nghiệm nhất quán cho người dùng vừa thao tác ghi (Read-Your-Own-Writes Consistency).',
    contextOrScenario: 'Người dùng vừa đổi ảnh đại diện và cập nhật họ tên trên trang cá nhân. Sau khi bấm Lưu, trang web tải lại và người dùng vẫn thấy họ tên cũ kèm ảnh đại diện cũ, tưởng rằng hệ thống bị lỗi nên bấm cập nhật liên tục 10 lần.',
    expectedKeywords: ['Replication Lag', 'Read-Your-Own-Writes', 'Sticky Master Routing', 'Stale Reads', 'WAL Replay Delay', 'Monotonic Read Consistency'],
    pitfalls: [
      'Định tuyến tất cả query đọc vào Read Replica một cách mù quáng ngay sau khi người dùng thực hiện thao tác ghi.',
      'Khuyên khách hàng "hãy F5 hoặc chờ 5 giây" thay vì giải quyết triệt để vấn đề ở tầng kiến trúc hệ thống.',
      'Giải quyết bằng cách chuyển TOÀN BỘ query đọc của tất cả người dùng về Master DB, làm mất sạch tác dụng phân tải của cụm Replicas.'
    ],
    followUpQuestions: [
      'Cơ chế dùng Cookie/Header đánh dấu `last_write_timestamp` để định tuyến người dùng về Master trong 5 giây hoạt động thế nào?',
      'Làm thế nào để sử dụng Log Sequence Number (LSN) trong PostgreSQL để Replica chỉ phục vụ request khi đã đồng bộ kịp giao dịch của client?'
    ]
  },

  'sys-068': {
    interviewerIntent: 'Kiểm tra năng lực phân biệt giữa Local In-Memory Rate Limiting và Distributed Rate Limiting, kỹ thuật đồng bộ trạng thái qua bộ nhớ chia sẻ tập trung.',
    contextOrScenario: 'Cần giới hạn mỗi user chỉ được gọi 100 request/phút. Lập trình viên dùng middleware lưu biến đếm trong biến Javascript cục bộ (In-Memory Map). Khi ứng dụng scale từ 1 pod lên 5 pods chạy sau Nginx Load Balancer, người dùng phát hiện mình có thể gọi tới 500 requests/phút.',
    expectedKeywords: ['Distributed Rate Limiting', 'Centralized State (Redis)', 'Local Memory vs Distributed Cache', 'Sliding Window Counter', 'Redis Lua Script', 'HTTP 429'],
    pitfalls: [
      'Lưu trạng thái bộ đếm trong RAM của từng container/pod trong hệ thống có nhiều máy chủ phân tán.',
      'Đồng bộ biến đếm giữa 5 pods bằng cách broadcast message qua socket (gây bão traffic mạng nội bộ và tốn CPU vô ích).',
      'Không sử dụng atomic operations (như Redis Lua Script hoặc INCR) khi ghi vào bộ nhớ chia sẻ, gây ra Race Condition.'
    ],
    followUpQuestions: [
      'Tại sao việc chuyển bộ đếm sang Redis và thực thi bằng Redis Lua Script lại giải quyết triệt để bài toán này?',
      'Khi cụm Redis trung tâm bị mất kết nối trong 2 giây, bạn cấu hình Rate Limiter theo chính sách Fail-Open hay Fail-Closed?'
    ]
  },

  'sys-069': {
    interviewerIntent: 'Đánh giá hiểu biết về cơ chế làm phẳng đỉnh tải (Load Leveling / Peak Shaving) bằng Message Queue và kỹ năng nhận diện tín hiệu cảnh báo thắt cổ chai hệ thống.',
    contextOrScenario: 'Vào đợt Flash Sale 11/11, hệ thống nhận 20,000 đơn hàng/giây trong khi database chỉ chịu được 2,000 lệnh ghi/giây. Queue được dùng làm vùng đệm. Tuy nhiên, kỹ sư trực ca nhận thấy độ dài hàng đợi (Queue Depth / Lag) liên tục tăng vọt từ 10,000 lên 500,000 tin nhắn và không có dấu hiệu giảm.',
    expectedKeywords: ['Load Leveling / Peak Shaving', 'Consumer Lag', 'Queue Backpressure', 'Throughput Mismatch', 'Worker Autoscaling', 'Poison Pill Message'],
    pitfalls: [
      'Nghĩ rằng chỉ cần có Message Queue là hệ thống sẽ an toàn mãi mãi mà không giám sát tốc độ tiêu thụ (Consumption Rate).',
      'Khi Queue dài ra liên tục mà không tìm nguyên nhân gốc rễ (ví dụ: Database bị khóa bảng hoặc có tin nhắn độc hại Poison Pill làm worker bị crash lặp lại).',
      'Tăng số lượng Consumer vượt quá số lượng Partitions của Kafka (các consumer dư thừa sẽ bị nhàn rỗi không thể chia sẻ tải).'
    ],
    followUpQuestions: [
      'Queue Depth tăng liên tục là dấu hiệu cảnh báo điều gì và bạn thực hiện các bước chẩn đoán nào trong 5 phút đầu?',
      'Làm thế nào để cấu hình KEDA (Kubernetes Event-driven Autoscaling) tự động tăng số lượng worker pods dựa trên chỉ số Consumer Lag của Kafka?'
    ]
  },

  'sys-070': {
    interviewerIntent: 'Kiểm tra sự am hiểu về cơ chế tự động mở rộng (Autoscaling Mechanics), phân biệt giữa Lagging Indicators (CPU/RAM) và Leading Indicators (Request Rate / Queue Lag), và hiện tượng trễ khởi động container.',
    contextOrScenario: 'Hệ thống đã bật Kubernetes Horizontal Pod Autoscaler (HPA) cấu hình theo CPU 70%. Khi chiến dịch quảng cáo bắt đầu lúc 20:00, lưu lượng tăng vọt gấp 10 lần trong 30 giây. HPA đã kích hoạt tăng pod nhưng hệ thống vẫn bị lỗi 502/504 hàng loạt kéo dài suốt 3 phút đầu.',
    expectedKeywords: ['Autoscaling Triggers', 'Lagging vs Leading Indicators', 'Pod Startup Latency', 'Warm-up Time', 'Predictive Scaling', 'Pre-warming Capacity'],
    pitfalls: [
      'Chỉ dựa vào CPU/RAM (Lagging Indicators): Khi CPU chạm ngưỡng thì server đã bắt đầu quá tải và nghẽn hàng đợi request từ lâu.',
      'Không tính đến thời gian khởi động của container (Container Startup & Java/Node initialization mất từ 30s đến 2 phút để sẵn sàng nhận traffic).',
      'Bật scale out quá nhanh nhưng scale in quá gấp (Flapping / Thrashing) làm pods bị xóa liên tục giữa các đợt biến động tải.'
    ],
    followUpQuestions: [
      'Tại sao việc kết hợp Leading Indicators (như Ingress HTTP Request Rate hoặc Kafka Lag) lại giúp HPA phản ứng nhanh hơn CPU?',
      'Chiến lược Pre-warming (Chủ động nâng số lượng pods trước giờ cao điểm đã biết trước) được áp dụng ra sao trong các sự kiện Flash Sale?'
    ]
  },

  'sys-071': {
    interviewerIntent: 'Đo lường năng lực phân tích nguyên nhân gốc rễ (Root Cause Analysis): Hiểu rõ phép nhân connection trong kiến trúc phân tán (Connection Multiplication Problem) và cách khắc phục bằng Connection Pooler tập trung.',
    contextOrScenario: 'Hệ thống chạy 4 instances Node.js, mỗi instance cấu hình connection pool = 20 (tổng cộng 80 connections vào PostgreSQL, DB chạy êm). Khi traffic tăng, hệ thống tự động scale lên 40 instances. Ngay lập tức DB báo lỗi: `FATAL: sorry, too many clients already`.',
    expectedKeywords: ['Connection Multiplication Problem', 'max_connections Limit', 'External Connection Pooler (PgBouncer)', 'Transaction Pooling', 'HikariCP', 'RDS Proxy'],
    pitfalls: [
      'Tăng thông số `max_connections` trên PostgreSQL lên 2,000 một cách vô tội vạ, làm server DB sập hoàn toàn do cạn kiệt RAM và quá tải Context Switching.',
      'Để mỗi instance giữ một pool kết nối quá lớn khi scale ngang nhiều instances.',
      'Không nhận thức được rằng trong kiến trúc Autoscaling, Connection Pool phải được quản lý tập trung ở tầng trung gian (External Pooler).'
    ],
    followUpQuestions: [
      'PgBouncer ở chế độ Transaction Pooling giải quyết bài toán 40 instances (mỗi instance giữ hàng trăm kết nối client) như thế nào?',
      'Công thức chuẩn để thiết lập `max_connections` cho PostgreSQL dựa trên số CPU Cores và RAM của máy chủ là gì?'
    ]
  },

  'sys-072': {
    interviewerIntent: 'Đánh giá khả năng thiết kế hệ thống Danh mục và Tìm kiếm E-Commerce (Catalog & Search Engine), tách biệt luồng phân cấp danh mục (Category Tree) và bộ máy lọc thuộc tính tốc độ cao.',
    contextOrScenario: 'Sàn thương mại điện tử có 5 triệu sản phẩm thuộc cây danh mục đa cấp (Đồ điện tử -> Điện thoại -> Phụ kiện -> Ốp lưng). Cần hỗ trợ khách hàng duyệt theo cây danh mục, kết hợp lọc theo nhiều thuộc tính động (Thương hiệu, Giá, Đánh giá, Chất liệu) với tốc độ phản hồi < 50ms.',
    expectedKeywords: ['Category Tree (Adjacency List / Materialized Path)', 'Elasticsearch / OpenSearch', 'Nested Aggregations', 'Faceted Navigation', 'Read-Through Cache', 'Denormalized Catalog'],
    pitfalls: [
      'Lưu cây danh mục trong SQL bằng Adjacency List đơn thuần rồi dùng recursive query `WITH RECURSIVE` trên mỗi request xem danh mục.',
      'Thực hiện lọc sản phẩm bằng cách dynamically nối chuỗi câu lệnh SQL `WHERE` với hàng chục điều kiện AND/OR làm mất tác dụng của B-Tree indexes.',
      'Không cache cây danh mục vốn là dữ liệu cực kỳ ít khi thay đổi nhưng có tần suất đọc chiếm 90% trang chủ.'
    ],
    followUpQuestions: [
      'Materialized Path hoặc Closure Table pattern giải quyết bài toán truy vấn toàn bộ sản phẩm của một danh mục cha và tất cả danh mục con thế nào?',
      'Làm thế nào để cập nhật giá hoặc số lượng tồn kho của sản phẩm trên Elasticsearch trong thời gian thực mà không làm chậm hệ thống?'
    ]
  },

  'sys-073': {
    interviewerIntent: 'Kiểm tra kỹ thuật xử lý dữ liệu địa không gian thời gian thực (Real-time Geospatial Tracking), tối ưu hóa luồng ghi tọa độ liên tục từ hàng chục nghìn shipper và phân phối tới ứng dụng khách hàng.',
    contextOrScenario: 'Ứng dụng giao hàng thức ăn (như GrabFood / ShopeeFood) có 30,000 shipper đang di chuyển trên đường. Mỗi shipper gửi tọa độ GPS (kinh độ, vĩ độ) mỗi 3 giây. Khách hàng mở app cần nhìn thấy icon shipper di chuyển mượt mà trên bản đồ thời gian thực.',
    expectedKeywords: ['Geospatial Indexing', 'Redis GEO (GEOADD, GEORADIUS)', 'H3 / S2 Spatial Index', 'WebSocket / MQTT Delivery', 'Dead Reckoning / Client Interpolation', 'Kafka Telemetry Pipeline'],
    pitfalls: [
      'Lưu mỗi tọa độ GPS vào cơ sở dữ liệu quan hệ PostgreSQL/MySQL: 30,000 shipper * 1 req/3s = 10,000 writes/giây làm nghẽn đĩa cứng DB.',
      'Broadcast tọa độ của shipper tới toàn bộ khách hàng thay vì chỉ gửi cho đúng khách hàng đang chờ đơn của shipper đó.',
      'Không áp dụng thuật toán nội suy (Interpolation / Dead Reckoning) trên mobile client, khiến icon shipper bị nhảy giật cục trên bản đồ.'
    ],
    followUpQuestions: [
      'Redis GEO sử dụng cấu trúc dữ liệu Geohash và Sorted Set bên dưới để tìm kiếm các tài xế gần nhất trong bán kính 3km như thế nào?',
      'Làm thế nào để giảm 70% số lượng request gửi GPS từ app shipper bằng thuật toán lọc khoảng cách (Distance Threshold) và góc cua (Heading Change)?'
    ]
  },

  'sys-074': {
    interviewerIntent: 'Đo lường năng lực thiết kế hệ thống Nhắn tin phân tán (Messaging & Chat System): Bảo toàn thứ tự tin nhắn (Message Ordering), quản lý trạng thái đã nhận / đã đọc (Receipts) và đồng bộ tin nhắn ngoại tuyến (Offline Sync).',
    contextOrScenario: 'Thiết kế ứng dụng chat cho 5 triệu người dùng: Hỗ trợ chat 1-1 và chat nhóm 200 người. Tin nhắn phải hiển thị đúng thứ tự thời gian trên cả Web và Mobile, hiển thị tích xanh khi người nhận đã đọc và nhận đầy đủ tin nhắn khi thiết bị bật mạng trở lại.',
    expectedKeywords: ['Message Ordering', 'Distributed Sequence (Snowflake)', 'Read Receipts (Double Tick)', 'Offline Sync via Sync Token / Sequence ID', 'WebSocket Gateway', 'Fanout-on-Write vs Fanout-on-Read'],
    pitfalls: [
      'Sử dụng Timestamp của máy điện thoại client để sắp xếp thứ tự tin nhắn: Giờ trên điện thoại người dùng có thể bị chỉnh sai hoặc lệch mạng, làm đảo lộn thứ tự hội thoại.',
      'Tạo một bản ghi tin nhắn riêng cho từng thành viên trong nhóm 500 người (Fanout-on-write quá đà làm bùng nổ dung lượng lưu trữ).',
      'Không hỗ trợ cơ chế Sync Token / Last-Message-ID khiến điện thoại sau khi mất mạng phải tải lại toàn bộ lịch sử chat từ đầu.'
    ],
    followUpQuestions: [
      'Làm thế nào để đảm bảo thứ tự tin nhắn tuyệt đối (Strict Ordering) trong một cuộc trò chuyện khi các tin nhắn đi qua các servers khác nhau?',
      'Cơ chế Read Receipt: Làm thế nào để cập nhật trạng thái "Đã đọc tới tin nhắn số 150" mà không phải gửi 150 request update riêng lẻ?'
    ]
  },

  'sys-075': {
    interviewerIntent: 'Đánh giá kiến trúc Bảng tin mạng xã hội (News Feed Architecture) ở giai đoạn khởi đầu: So sánh chuyên sâu giữa Fanout-on-Write (Push) và Fanout-on-Read (Pull), và ma trận quyết định theo quy mô người dùng.',
    contextOrScenario: 'Một ứng dụng mạng xã hội mới ra mắt đạt 300,000 người dùng hoạt động hằng ngày (DAU). Người dùng follow trung bình 100 người khác. Cần thiết kế kiến trúc tạo bảng tin (News Feed) tối ưu chi phí hạ tầng và thời gian phát triển.',
    expectedKeywords: ['News Feed Architecture', 'Fanout-on-Read (Pull Model)', 'Fanout-on-Write (Push Model)', 'Hybrid Fanout', 'Celebrity / Hotspot Problem', 'Redis Timeline List'],
    pitfalls: [
      'Vội vã áp dụng kiến trúc Fanout-on-Write phức tạp của Facebook/Twitter khi mới có vài trăm nghìn người dùng, làm tốn tài nguyên server và kéo dài thời gian ra mắt sản phẩm.',
      'Sử dụng Fanout-on-Write cho người nổi tiếng (KOL có 5 triệu followers): Mỗi khi KOL đăng 1 bài viết, hệ thống phải thực hiện 5 triệu thao tác ghi vào 5 triệu timeline khác nhau, làm nghẽn hàng đợi.',
      'Chỉ dùng câu lệnh SQL `JOIN` trên bảng posts và follows: Khi số lượng bài viết tăng lên hàng chục triệu, query feed sẽ bị timeout.'
    ],
    followUpQuestions: [
      'Tại sao với ứng dụng dưới 1 triệu người dùng, Fanout-on-Read (Pull) kết hợp Redis Cache là sự lựa chọn khôn ngoan nhất?',
      'Mô hình Hybrid Fanout kết hợp Push cho người dùng thông thường và Pull cho Celebrities hoạt động như thế nào?'
    ]
  },

  'sys-076': {
    interviewerIntent: 'Kiểm tra năng lực thiết kế Cỗ máy thông báo đa kênh quy mô lớn (Multi-Channel Notification Engine), cơ chế chọn kênh theo độ ưu tiên, quản lý chống spam (Rate Limit / Deduplication) và chuyển đổi dự phòng khi nhà cung cấp lỗi.',
    contextOrScenario: 'Hệ thống cần gửi hàng triệu thông báo mỗi ngày qua Push Notification (FCM/APNs), SMS (Twilio/Brandname), Email (SendGrid/SES) và In-App Notification. Cổng SMS đối tác bất ngờ bị lỗi không gửi được tin nhắn OTP, làm khách hàng không đăng nhập được.',
    expectedKeywords: ['Multi-Channel Notification Engine', 'Priority Queue', 'Channel Routing & Fallback', 'Notification Deduplication', 'Vendor Failover', 'User Notification Preferences'],
    pitfalls: [
      'Gửi thông báo đồng bộ trong luồng xử lý API chính: Khi nhà cung cấp mạng viễn thông phản hồi chậm 5 giây, giao diện ứng dụng của người dùng bị đơ.',
      'Không có cơ chế Deduplication: Gặp lỗi mạng retry gửi 3 tin nhắn SMS trừ tiền 3 lần tới điện thoại khách hàng.',
      'Không tôn trọng cấu hình của người dùng (User Preferences / Quiet Hours): Gửi tin nhắn quảng cáo khuyến mãi vào lúc 2 giờ sáng.'
    ],
    followUpQuestions: [
      'Cơ chế Circuit Breaker và Vendor Failover tự động chuyển sang nhà cung cấp SMS dự phòng khi nhà mạng chính bị lỗi hoạt động như thế nào?',
      'Làm thế nào để gom nhiều thông báo liên tiếp trong 5 phút (ví dụ: "A và 20 người khác đã thích bài viết của bạn") bằng kỹ thuật Notification Aggregation?'
    ]
  },

  'sys-077': {
    interviewerIntent: 'Đo lường năng lực thiết kế luồng xử lý phương tiện đa tầng (Media Ingestion & Processing Pipeline): Từ upload trực tiếp, xử lý chuyển mã (Transcoding), sinh thumbnail đến phân phối qua CDN.',
    contextOrScenario: 'Người dùng ứng dụng di động quay video 4K dung lượng 500MB và đăng lên nền tảng. Hệ thống cần tiếp nhận video an toàn, tự động nén và chuyển mã thành các định dạng HLS/DASH (360p, 720p, 1080p), tạo ảnh đại diện (Thumbnail) và sẵn sàng phát mượt mà trên mọi thiết bị.',
    expectedKeywords: ['S3 Presigned URL', 'Asynchronous Media Pipeline', 'FFmpeg Transcoding', 'Adaptive Bitrate Streaming (HLS/DASH)', 'SQS / EventBridge Trigger', 'CloudFront Video Streaming'],
    pitfalls: [
      'Thực hiện chuyển mã video trực tiếp trên cùng cụm máy chủ web backend, làm CPU máy chủ chạm 100% và treo toàn bộ các API khác.',
      'Bắt người dùng phải giữ màn hình app mở chờ đến khi video được xử lý xong mới thông báo đăng bài thành công.',
      'Lưu trữ video ở một độ phân giải duy nhất: Khiến người dùng mạng 3G/4G yếu không thể xem được video mượt mà.'
    ],
    followUpQuestions: [
      'Quy trình xử lý bất đồng bộ (Upload S3 -> EventBridge -> SQS -> Transcoding Worker Pool / AWS Elemental MediaConvert -> CloudFront CDN) diễn ra ra sao?',
      'Adaptive Bitrate Streaming (HLS với file `.m3u8` và các video chunks `.ts`) giúp trình phát video tự động tăng giảm chất lượng theo tốc độ mạng như thế nào?'
    ]
  },

  'sys-078': {
    interviewerIntent: 'Đánh giá kỹ năng xử lý tranh chấp tài nguyên đồng thời cao (Concurrency & Double-Booking Prevention), sử dụng các tính năng cao cấp của RDBMS (Range Types, Exclusion Constraints) và cơ chế khóa.',
    contextOrScenario: 'Hệ thống đặt lịch khám bệnh trực tuyến: Mỗi bác sĩ có các khung giờ khám 30 phút (ví dụ: 09:00 - 09:30). Hai bệnh nhân cùng mở app và bấm đặt cùng một khung giờ của một bác sĩ vào cùng một mili-giây. Hệ thống phải đảm bảo tuyệt đối không có 2 người đặt trùng lịch.',
    expectedKeywords: ['Double-Booking Prevention', 'PostgreSQL Range Types (`tsrange`)', 'Exclusion Constraints', 'Optimistic vs Pessimistic Locking', 'Distributed Lock (Redis Redlock)', 'Database Serializable Isolation'],
    pitfalls: [
      'Dùng logic kiểm tra trong code: `SELECT count(*) WHERE slot_time = ?` rồi mới `INSERT`: Dính lỗi Race Condition kinh điển giữa lúc SELECT và INSERT.',
      'Sử dụng Pessimistic Lock (khóa toàn bộ bảng bác sĩ) làm tắc nghẽn toàn bộ các bệnh nhân đang đặt lịch ở các khung giờ khác.',
      'Không hỗ trợ cơ chế Giữ chỗ tạm thời (Temporary Hold với TTL 10 phút) trong lúc bệnh nhân đang tiến hành thanh toán viện phí.'
    ],
    followUpQuestions: [
      'PostgreSQL Exclusion Constraint (`EXCLUDE USING gist (doctor_id WITH =, time_slot WITH &&)`) ngăn chặn trùng lặp thời gian ở cấp độ Database Engine ra sao?',
      'Khi thanh toán thất bại hoặc quá 10 phút bệnh nhân không hoàn tất, cơ chế giải phóng slot khám tạm giữ hoạt động như thế nào?'
    ]
  },

  'sys-079': {
    interviewerIntent: 'Kiểm tra kiến thức về các mẫu hình gom tụ dữ liệu phân tán (Data Aggregation Patterns in Microservices): So sánh giữa API Composition và CQRS Read Model.',
    contextOrScenario: 'Màn hình "Chi tiết đơn hàng" trên ứng dụng di động cần hiển thị đồng thời: Thông tin đơn hàng (Order Service), Tên và Avatar khách (User Service), Chi tiết thanh toán & mã giao dịch (Payment Service), và Vị trí tài xế giao hàng (Shipping Service). Mỗi dịch vụ có database riêng.',
    expectedKeywords: ['API Composition Pattern', 'BFF (Backend-for-Frontend)', 'CQRS Read View', 'GraphQL Federation', 'Parallel Asynchronous Calls (Promise.allSettled)', 'Degraded Response Mode'],
    pitfalls: [
      'Gọi API của 4 services theo thứ tự tuần tự (Sequential REST Calls): Tổng độ trễ bằng tổng thời gian của cả 4 services cộng lại.',
      'Một service phụ (như Shipping Service) bị chậm làm treo toàn bộ màn hình chi tiết đơn hàng (không áp dụng chế độ Degraded Mode).',
      'Thực hiện gọi API chéo lẫn nhau giữa các service hậu đài (Service-to-Service mesh calls) tạo ra mạng lưới phụ thuộc xoắn ốc.'
    ],
    followUpQuestions: [
      'Làm thế nào để BFF Gateway thực hiện gọi song song 4 services bằng `Promise.allSettled` và trả về kết quả một phần (Partial Response) nếu 1 service bị lỗi?',
      'Khi nào nên dùng CQRS View nén sẵn toàn bộ dữ liệu đơn hàng thành 1 bản ghi duy nhất thay vì dùng API Composition?'
    ]
  },

  'sys-080': {
    interviewerIntent: 'Đánh giá hiểu biết sâu sắc về Truy vết phân tán (Distributed Tracing Topology): Phân biệt Trace và Span, cơ chế truyền ngữ cảnh qua Message Queue và chuẩn OpenTelemetry.',
    contextOrScenario: 'Một giao dịch chuyển tiền ngân hàng đi qua API Gateway -> Transaction Service -> đẩy event vào Kafka -> Settlement Worker -> gọi sang Cổng Ngân hàng Nhà nước. Kỹ sư cần thiết kế hệ thống quan sát để nhìn thấy toàn bộ hành trình này trên 1 biểu đồ timeline duy nhất.',
    expectedKeywords: ['Distributed Tracing', 'OpenTelemetry', 'Trace ID & Span ID', 'Context Propagation', 'Kafka Record Headers (`traceparent`)', 'Sampling Strategies'],
    pitfalls: [
      'Chỉ truyền Trace ID qua HTTP Calls mà quên đưa Trace Context vào Kafka/RabbitMQ Message Headers, làm đứt gãy chuỗi vết khi chuyển sang luồng xử lý bất đồng bộ.',
      'Tạo quá nhiều Spans chi tiết cho từng vòng lặp hoặc hàm nhỏ trong code, làm bùng nổ dung lượng lưu trữ của cụm Jaeger/Tempo.',
      'Sử dụng 100% Tracing trên toàn bộ traffic hàng chục nghìn QPS làm tăng đáng kể chi phí hạ tầng và độ trễ CPU.'
    ],
    followUpQuestions: [
      'Làm thế nào để tiêm (Inject) và trích xuất (Extract) header `traceparent` vào Kafka Record Headers trong Node.js/Go/Java?',
      'Sự khác biệt giữa Head-based Sampling (quyết định sample ngay tại API Gateway) và Tail-based Sampling (chỉ lưu trace nếu có lỗi hoặc độ trễ cao)?'
    ]
  },

  'sys-081': {
    interviewerIntent: 'Kiểm tra kiến thức về tầng Khám phá dịch vụ (Service Discovery Mechanics), phân biệt giữa Client-Side Discovery vs Server-Side Discovery, và cơ chế tích hợp của Kubernetes.',
    contextOrScenario: 'Trong cụm microservices có 200 instances liên tục được bật/tắt (Autoscaling, Rolling Updates). Một service muốn gọi sang User Service cần biết chính xác địa chỉ IP và Port của các pods đang hoạt động mà không bị gọi vào pod đã chết.',
    expectedKeywords: ['Service Discovery', 'Client-Side vs Server-Side Discovery', 'Kubernetes CoreDNS & Kube-Proxy', 'Consul / Eureka', 'Service Registry & Heartbeat', 'Virtual IP (ClusterIP)'],
    pitfalls: [
      'Cố gắng cài đặt thêm Eureka hoặc Consul khi hệ thống đã chạy trên nền tảng Kubernetes (Kubernetes đã có sẵn CoreDNS và Service abstraction).',
      'Cache địa chỉ IP của service quá lâu trên client (bỏ qua TTL của DNS), dẫn đến việc gửi traffic vào các Pods đã bị xóa sổ.',
      'Không cấu hình Graceful Shutdown trên ứng dụng, khiến Pod bị kill đột ngột khi vẫn còn request đang được xử lý dở.'
    ],
    followUpQuestions: [
      'Kubernetes ClusterIP kết hợp iptables/IPVS và Kube-Proxy thực hiện Server-Side Service Discovery và Load Balancing như thế nào?',
      'Khi nào một hệ thống lớn (như Netflix / Uber) vẫn sử dụng Client-Side Discovery (kết hợp Ribbon/Envoy) thay vì dựa vào DNS truyền thống?'
    ]
  },

  'sys-082': {
    interviewerIntent: 'Đo lường năng lực thiết kế hệ thống Chat thời gian thực quy mô lớn (Large-Scale Real-Time Chat): Quản lý hàng triệu kết nối WebSocket liên tục, Presence System (trạng thái online/offline) và lưu trữ tin nhắn.',
    contextOrScenario: 'Thiết kế ứng dụng chat tương tự WhatsApp / Telegram phục vụ 20 triệu người dùng đồng thời (CCU). Hệ thống phải đảm bảo độ trễ nhận tin < 100ms, hiển thị trạng thái đang gõ (Typing Indicator) và chấm xanh Online/Offline mượt mà.',
    expectedKeywords: ['Real-Time Chat Architecture', 'WebSocket Gateway Cluster', 'Presence Service (Heartbeat / Redis Sets)', 'Connection State Management', 'ScyllaDB / Cassandra for Message Archive', 'Push Notification Fallback'],
    pitfalls: [
      'Gửi trạng thái Presence (Online/Offline) của 1 user tới toàn bộ hàng nghìn bạn bè mỗi giây, tạo ra cơn bão lưu lượng (Presence Amplification Storm).',
      'Lưu trữ lịch sử hàng tỷ tin nhắn chat vào cơ sở dữ liệu quan hệ MySQL truyền thống khiến bảng bị phình to và query bị chậm.',
      'Không có cơ chế fallback sang Push Notification (FCM/APNs) khi người nhận đã tắt app hoặc mất kết nối mạng.'
    ],
    followUpQuestions: [
      'Làm thế nào để thiết kế Presence System tối ưu bằng cơ chế Heartbeat và Redis TTL mà không làm quá tải bộ nhớ?',
      'Tại sao Wide-Column Database (như Apache Cassandra hoặc ScyllaDB) lại là sự lựa chọn số 1 của Discord để lưu trữ hàng chục tỷ tin nhắn chat?'
    ]
  },

  'sys-083': {
    interviewerIntent: 'Đánh giá kiến thức chuyên sâu về kỹ thuật phân trang dữ liệu quy mô lớn (Infinite Scroll Feed Pagination): Hiểu rõ lý do tại sao Offset Pagination là cạm bẫy và cách cài đặt Cursor-based Pagination.',
    contextOrScenario: 'Bảng tin Facebook / TikTok với tính năng cuộn vô tận (Infinite Scroll). Khi người dùng cuộn đến trang thứ 50, nếu dùng `OFFSET 1000 LIMIT 20`, cơ sở dữ liệu phải scan và loại bỏ 1,000 dòng trước đó, làm câu query mất hàng giây. Đồng thời, nếu có bài viết mới được chèn vào đầu bảng, người dùng sẽ thấy các bài viết bị lặp lại ở trang tiếp theo.',
    expectedKeywords: ['Infinite Scroll', 'Cursor-Based Pagination (Keyset)', 'Offset Pagination Pitfalls', 'Duplicate / Missed Items Problem', 'B-Tree Index Seek vs Scan', 'Base64 Encoded Cursor'],
    pitfalls: [
      'Sử dụng `LIMIT / OFFSET` cho các bảng dữ liệu lớn có tính năng cuộn vô tận: Gây suy sụp hiệu năng đĩa cứng (Full Scan Heap) và lỗi hiển thị trùng bài viết khi có bài mới chèn vào.',
      'Dùng cursor không có tính duy nhất (ví dụ: chỉ dùng `created_at` mà không kết hợp `id`), khiến các bài viết trùng timestamp bị bỏ sót.',
      'Không mã hóa Cursor (để lộ cấu trúc database nội bộ ra ngoài client).'
    ],
    followUpQuestions: [
      'Cursor-based Pagination kết hợp Composite Index `(created_at, id)` chuyển đổi câu query từ Index Scan sang Index Seek với độ phức tạp O(log N) như thế nào?',
      'Làm thế nào để xử lý phân trang 2 chiều (Bidirectional Scrolling: cuộn lên để xem tin mới, cuộn xuống để xem tin cũ) trong phòng chat?'
    ]
  },

  'sys-084': {
    interviewerIntent: 'Kiểm tra tư duy thiết kế kiến trúc phần mềm linh hoạt (Extensible Schema & Dynamic Form Builder), mô hình hóa JSON Schema động và lưu trữ dữ liệu phi cấu trúc.',
    contextOrScenario: 'Thiết kế nền tảng cho phép người dùng kéo thả để tự tạo Form khảo sát (như Google Forms / Typeform) với các trường tùy biến (Text, Dropdown, Checkbox, Logic phân nhánh câu hỏi) và thu thập hàng triệu câu trả lời từ người điền.',
    expectedKeywords: ['Form Builder Architecture', 'JSON Schema Validation (Ajv)', 'EAV (Entity-Attribute-Value) vs JSONB', 'Dynamic Schema Validation', 'PostgreSQL JSONB Indexing (GIN)', 'Component Tree Metadata'],
    pitfalls: [
      'Sử dụng mô hình EAV (Entity-Attribute-Value) cổ điển với các bảng `fields`, `values`: Dẫn đến việc phải JOIN hàng chục lần để lấy dữ liệu của 1 biểu mẫu đơn giản.',
      'Không xác thực tính toàn vẹn của dữ liệu gửi lên (Input Validation) bằng JSON Schema ở tầng backend.',
      'Lưu JSON dạng văn bản thô (Plain Text) thay vì kiểu dữ liệu nhị phân có đánh chỉ mục (PostgreSQL JSONB).'
    ],
    followUpQuestions: [
      'PostgreSQL GIN Index trên cột JSONB giúp tăng tốc các câu truy vấn lọc câu trả lời khảo sát như thế nào?',
      'Làm thế nào để thiết kế cây quyết định logic điều kiện (Conditional Logic: "Nếu câu 1 chọn Có thì mới hiện câu 2") trong cấu trúc JSON của Form?'
    ]
  },

  'sys-085': {
    interviewerIntent: 'Đánh giá kiến thức phân vùng dữ liệu toàn diện (Data Partitioning Architecture): Phân biệt rạch ròi giữa Horizontal Partitioning (Sharding) và Vertical Partitioning, các chiến lược chia tách bảng.',
    contextOrScenario: 'Một cơ sở dữ liệu chứa bảng `users` có 50 cột (bao gồm cả các cột văn bản nặng như bio, sở thích, thông tin cá nhân và 5 cột thường xuyên truy vấn như email, password_hash, status). Bảng đạt 20 triệu dòng và việc nạp bảng vào bộ nhớ RAM bị chậm chạp.',
    expectedKeywords: ['Horizontal Partitioning (Sharding)', 'Vertical Partitioning', 'Columnar Split', 'Range / List / Hash Partitioning', 'Memory Working Set Optimization', 'Partition Pruning'],
    pitfalls: [
      'Nhầm lẫn giữa Horizontal Partitioning (chia theo dòng dữ liệu) và Vertical Partitioning (chia tách các cột của bảng).',
      'Để các cột dữ liệu khổng lồ (như Blob, văn bản dài JSON) nằm chung trong bảng chính thường xuyên truy vấn, làm phình to kích thước Table Pages trong RAM.',
      'Không đánh chỉ mục trên Partition Key, khiến cơ sở dữ liệu không thể áp dụng tính năng Partition Pruning (loại trừ phân vùng không liên quan khi query).'
    ],
    followUpQuestions: [
      'Vertical Partitioning giúp tối ưu hóa Working Set trong bộ nhớ đệm Buffer Pool của cơ sở dữ liệu như thế nào?',
      'Partition Pruning trong PostgreSQL / MySQL hoạt động ra sao để tăng tốc độ truy vấn gấp 10 lần?'
    ]
  },

  'sys-086': {
    interviewerIntent: 'Kiểm tra sự am hiểu về Cơ sở dữ liệu chuỗi thời gian (Time-Series Databases: TimescaleDB, InfluxDB, ClickHouse), kỹ thuật nén dữ liệu theo cột và tự động dọn rác (Data Retention).',
    contextOrScenario: 'Hệ thống giám sát hạ tầng máy chủ thu thập 500,000 metrics (CPU, RAM, Disk I/O, Network) mỗi giây từ 10,000 máy chủ. Cơ sở dữ liệu MySQL truyền thống đã bị sập vì không chịu nổi tốc độ ghi dữ liệu liên tục và bảng phình to hàng trăm Gigabytes mỗi tuần.',
    expectedKeywords: ['Time-Series Database (TSDB)', 'TimescaleDB / InfluxDB / ClickHouse', 'Columnar Storage & Delta Compression', 'Hypertables & Automated Chunking', 'Continuous Aggregates', 'Data Retention Policies'],
    pitfalls: [
      'Cố chấp dùng cơ sở dữ liệu quan hệ truyền thống (MySQL/Postgres bảng đơn) cho dữ liệu chuỗi thời gian ghi liên tục.',
      'Không thiết lập Data Retention Policies (chính sách tự động xóa hoặc hạ độ phân giải dữ liệu cũ - Downsampling), làm cạn kiệt đĩa cứng lưu trữ.',
      'Chạy các query tổng hợp (AVG, SUM) trên toàn bộ hàng tỷ bản ghi thô thay vì sử dụng Continuous Aggregates đã được tính toán sẵn.'
    ],
    followUpQuestions: [
      'Thuật toán nén Gorilla Compression / Delta-of-Delta giúp TSDB giảm tới 90% dung lượng lưu trữ số liệu chuỗi thời gian như thế nào?',
      'Continuous Aggregates trong TimescaleDB giúp tính toán sẵn số liệu trung bình theo giờ/ngày mà không làm chậm hệ thống ra sao?'
    ]
  },

  'sys-087': {
    interviewerIntent: 'Đo lường năng lực phân biệt kiến trúc dữ liệu quy mô lớn (Data Architecture): Phân biệt rõ mục đích sử dụng của Data Lake, Data Warehouse và mô hình hiện đại Data Lakehouse.',
    contextOrScenario: 'Doanh nghiệp có nhu cầu phân tích dữ liệu: Một bên là các báo cáo tài chính kinh doanh cần dữ liệu chuẩn mực, cấu trúc rõ ràng và tính toán chính xác tuyệt đối; một bên là nhóm Data Science / AI cần lưu toàn bộ dữ liệu thô (ảnh, log thô, audio, clickstream phi cấu trúc) để huấn luyện mô hình học máy.',
    expectedKeywords: ['Data Lake vs Data Warehouse', 'Data Lakehouse', 'Structured vs Unstructured Data', 'ETL vs ELT', 'Schema-on-Write vs Schema-on-Read', 'Parquet / Delta Lake'],
    pitfalls: [
      'Cố gắng nhồi nhét toàn bộ dữ liệu log thô chưa qua xử lý vào Data Warehouse đắt đỏ (như Snowflake / BigQuery) làm bùng nổ chi phí lưu trữ.',
      'Biến Data Lake thành "Data Swamp" (Đầm lầy dữ liệu rác) do không quản lý Metadata và Data Governance.',
      'Sử dụng Data Lake trực tiếp cho các báo cáo tài chính yêu cầu giao dịch ACID và độ chính xác thời gian thực.'
    ],
    followUpQuestions: [
      'Sự khác biệt căn bản giữa quy trình ETL (Extract-Transform-Load) cổ điển và ELT (Extract-Load-Transform) trong kỷ nguyên Cloud Data Warehouse?',
      'Định dạng tệp nén theo cột Apache Parquet tối ưu hóa chi phí và tốc độ truy vấn phân tích như thế nào?'
    ]
  },

  'sys-088': {
    interviewerIntent: 'Đánh giá kiến thức về kỹ thuật Bắt giữ dữ liệu biến đổi (Change Data Capture - CDC), cơ chế đọc Transaction Log không xâm lấn và kiến trúc tích hợp dữ liệu thời gian thực.',
    contextOrScenario: 'Cần đồng bộ dữ liệu đơn hàng từ PostgreSQL sang Elasticsearch (để tìm kiếm) và Redis (để cache). Nếu dùng giải pháp "Dual Write" trong code ứng dụng (vừa ghi DB vừa gọi Redis/ES), khi mạng chập chờn sẽ dẫn đến hiện tượng dữ liệu trên Redis và ES bị lệch vĩnh viễn so với DB chính.',
    expectedKeywords: ['Change Data Capture (CDC)', 'Debezium / Kafka Connect', 'Transaction Log Tailing (WAL/Binlog)', 'Zero Performance Overhead on DB', 'Dual-Write Fallacy', 'At-least-once Streaming'],
    pitfalls: [
      'Sử dụng phương pháp Dual-Write trong code backend: Khi ghi DB thành công nhưng ghi Redis thất bại, dữ liệu giữa 2 nơi bị bất đồng bộ mà không có cách nào rollback.',
      'Dùng polling query định kỳ `SELECT * WHERE updated_at > ?`: Gây tải nặng cho DB và không bắt được sự kiện bản ghi bị `DELETE`.',
      'Không quản lý Schema Evolution của CDC events khi cấu trúc bảng PostgreSQL được cập nhật thêm cột.'
    ],
    followUpQuestions: [
      'Debezium đọc PostgreSQL Write-Ahead Log (WAL) qua logical replication slot như thế nào mà không tốn tài nguyên CPU của database?',
      'Làm thế nào để đảm bảo thứ tự của các sự kiện CDC (INSERT -> UPDATE -> DELETE) khi stream qua Kafka Partitions?'
    ]
  },

  'sys-089': {
    interviewerIntent: 'Đo lường năng lực thiết kế dịch vụ rút gọn liên kết hoàn chỉnh (URL Shortener System Design): Tính toán quy mô, kỹ thuật sinh mã băm Base62 và tối ưu hóa độ trễ đọc sát biên.',
    contextOrScenario: 'Thiết kế dịch vụ rút gọn link quy mô toàn cầu tương tự Bit.ly: Tiếp nhận 100 triệu link mới mỗi tháng và phục vụ 10 tỷ lượt click chuyển hướng mỗi tháng. Độ trễ chuyển hướng URL phải đạt dưới 15ms trên phạm vi toàn cầu.',
    expectedKeywords: ['URL Shortener', 'Distributed ID Generation', 'Base62 Encoding', 'Cache-Aside (Redis)', 'HTTP 301 vs 302/307', 'Bloom Filter for Cache Misses'],
    pitfalls: [
      'Dùng MD5 hoặc SHA-256 rồi cắt ngắn chuỗi: Tỉ lệ va chạm (Hash Collision) tăng vọt khi quy mô link đạt hàng chục triệu bản ghi.',
      'Sử dụng auto-increment ID của 1 máy chủ MySQL duy nhất: Tạo thành Single Point of Failure và nút thắt cổ chai không thể scale.',
      'Không xử lý các URL rác bị tấn công thăm dò (Brute-force scan short codes), làm cạn kiệt tài nguyên cache.'
    ],
    followUpQuestions: [
      'Bloom Filter được ứng dụng ở cửa ngõ như thế nào để chặn đứng các request truy vấn các short code không hề tồn tại trước khi chạm vào Database?',
      'Tại sao việc kết hợp Anycast DNS và Edge CDN / Cloudflare Workers có thể đưa độ trễ chuyển hướng URL về mức < 10ms?'
    ]
  },

  'sys-090': {
    interviewerIntent: 'Đánh giá khả năng thiết kế hệ thống Chat thời gian thực quy mô cực lớn (WhatsApp / Slack / Telegram Scale): Quản lý hàng trăm triệu kết nối đồng thời, kiến trúc phân tán đa vùng và bảo mật tin nhắn.',
    contextOrScenario: 'Thiết kế nền tảng tin nhắn OTT phục vụ 100 triệu người dùng hoạt động hằng ngày: Tin nhắn phải được gửi đi tức thì, bảo đảm không bị mất tin dù người nhận đang đi vào vùng mất sóng, và hỗ trợ cuộc trò chuyện nhóm hàng nghìn thành viên.',
    expectedKeywords: ['WhatsApp / Slack Scale Architecture', 'Erlang / Go Concurrency Model', 'WebSocket Connection Tier', 'Epoll / Kqueue Socket Multiplexing', 'End-to-End Encryption (Signal Protocol)', 'Message Storage (Cassandra)'],
    pitfalls: [
      'Dùng kiến trúc mỗi kết nối 1 Thread (Thread-per-connection) cổ điển: Khi có 1 triệu kết nối, máy chủ sẽ sập vì cạn kiệt RAM cho Thread Stacks.',
      'Lưu trữ toàn bộ nội dung tin nhắn trên máy chủ khi triển khai mã hóa đầu cuối E2EE (vi phạm nguyên tắc Zero-Knowledge).',
      'Không có cơ chế Backpressure khi thiết bị mobile nhận hàng loạt tin nhắn dồn về sau khi vừa bật mạng lại.'
    ],
    followUpQuestions: [
      'Mô hình Socket Multiplexing (Epoll trên Linux) cho phép 1 server duy nhất duy trì hàng triệu kết nối WebSocket mở đồng thời ra sao?',
      'Cơ chế mã hóa đầu cuối (End-to-End Encryption) bằng giao thức Double Ratchet của Signal Protocol vận hành như thế nào?'
    ]
  },

  'sys-091': {
    interviewerIntent: 'Kiểm tra năng lực thiết kế Hệ thống Thông báo Đẩy quy mô hàng chục triệu tin nhắn (Push Notification Infrastructure): Quản lý Token thiết bị, tích hợp Apple APNs / Google FCM và chống bão thông báo.',
    contextOrScenario: 'Một ứng dụng tin tức cần phát thông báo "Tin khẩn cấp" tới 20 triệu người dùng di động trong vòng chưa đầy 60 giây. Cần đảm bảo hệ thống không bị Apple/Google chặn vì quá tải hạn mức API và máy chủ backend không bị nghẽn.',
    expectedKeywords: ['Push Notification Engine', 'Apple Push Notification service (APNs)', 'Firebase Cloud Messaging (FCM)', 'Device Token Registry', 'Worker Pool Parallelization', 'Rate Limit Quota Management'],
    pitfalls: [
      'Gọi API FCM/APNs tuần tự từng thiết bị một: Tốn hàng giờ đồng hồ mới gửi xong thông báo cho 1 triệu người.',
      'Không cập nhật danh sách Device Tokens khi người dùng gỡ cài đặt app, làm tỷ lệ lỗi gửi tin nhắn tăng cao và bị nhà cung cấp phạt quota.',
      'Gửi thông báo đồng loạt cho 20 triệu người mà không lường trước cơn bão người dùng mở app cùng lúc (Thundering Herd) đánh sập backend.'
    ],
    followUpQuestions: [
      'Kỹ thuật Batch Sending (Gom 500 device tokens trong 1 HTTP/2 request tới FCM/APNs) giúp tăng tốc độ gửi thông báo gấp 100 lần như thế nào?',
      'Làm thế nào để áp dụng kỹ thuật Staggered Broadcast (phân bổ thông báo rải đều trong 5 phút) để bảo vệ backend khỏi cơn bão người dùng mở app?'
    ]
  },

  'sys-092': {
    interviewerIntent: 'Đo lường năng lực thiết kế Bộ điều tiết lưu lượng phân tán chuyên sâu (High-Performance Distributed Rate Limiter): So sánh các thuật toán, tối ưu hóa độ trễ mạng và xử lý đồng thời.',
    contextOrScenario: 'Cần bảo vệ cụm API Gateway xử lý 100,000 QPS trước nguy cơ tấn công DoS và scraping. Bộ Rate Limiter phân tán phải đưa ra quyết định chấp nhận hoặc từ chối request với độ trễ nội bộ < 1ms mà không gây nghẽn Redis.',
    expectedKeywords: ['Distributed Rate Limiter', 'Token Bucket Algorithm', 'Sliding Window Log vs Counter', 'Redis Cluster Sharding', 'Local In-Memory Synchronization', 'RFC 6585 Headers'],
    pitfalls: [
      'Dùng thuật toán Sliding Window Log lưu trữ mọi timestamp trong Redis Sorted Set: Khi traffic cao, bộ nhớ Redis bị phình to khủng khiếp.',
      'Mỗi request đều gọi Redis qua mạng làm tăng 1-2ms độ trễ cho toàn bộ hệ thống API.',
      'Không áp dụng kiến trúc Rate Limiter phân tầng (Local In-Memory Cache kết hợp đồng bộ bất đồng bộ về Redis).'
    ],
    followUpQuestions: [
      'Kỹ thuật Batching Token Reservation (mỗi pod backend xin trước một lượng tokens từ Redis về bộ nhớ cục bộ) giúp giảm 95% số cuộc gọi vào Redis như thế nào?',
      'Làm thế nào để thiết kế Rate Limiter đa tầng: Theo IP, theo User ID, và theo API Key đồng thời?'
    ]
  },

  'sys-093': {
    interviewerIntent: 'Đánh giá kiến trúc Bảng tin mạng xã hội quy mô hàng trăm triệu người dùng (Twitter / Facebook News Feed): Phân tích trade-offs chuyên sâu giữa Push và Pull, và chiến lược Caching phân cấp.',
    contextOrScenario: 'Thiết kế News Feed cho 100 triệu người dùng: Tốc độ tải bảng tin phải dưới 200ms. Tài khoản của các người nổi tiếng (như Cristiano Ronaldo có hơn 500 triệu followers) đăng bài thường xuyên.',
    expectedKeywords: ['News Feed Architecture', 'Fanout-on-Write vs Fanout-on-Read', 'Hybrid Fanout Pattern', 'Celebrity Handling', 'Redis Timeline Data Structure', 'Feed Ranking & ML Scoring'],
    pitfalls: [
      'Áp dụng Fanout-on-Write đơn thuần cho Celebrity: Hệ thống sập ngay lập tức khi một người nổi tiếng đăng bài vì phải ghi hàng trăm triệu bản ghi vào queue.',
      'Áp dụng Fanout-on-Read đơn thuần cho mọi người dùng: Tốc độ tải bảng tin của người dùng thông thường bị chậm do phải liên tục JOIN và sắp xếp hàng trăm bạn bè.',
      'Không giới hạn dung lượng bảng tin trong bộ nhớ cache (chỉ nên cache 800 bài viết mới nhất cho mỗi người dùng).'
    ],
    followUpQuestions: [
      'Quy trình ghép luồng (Timeline Merging) giữa bài viết của bạn bè thông thường (Push từ Redis) và bài viết của Người nổi tiếng (Pull từ Celebrity Storage) tại thời điểm đọc diễn ra như thế nào?',
      'Kiến trúc 2 tầng (Feed Generation Pipeline và Feed Ranking Service với Machine Learning) được tách biệt ra sao?'
    ]
  },

  'sys-094': {
    interviewerIntent: 'Kiểm tra năng lực thiết kế Hệ thống lưu trữ và đồng bộ tệp tin đám mây (Google Drive / Dropbox Scale Architecture): Kỹ thuật chia khối (Chunking), chống trùng lặp dữ liệu (Deduplication) và đồng bộ delta.',
    contextOrScenario: 'Thiết kế dịch vụ lưu trữ đám mây cho 50 triệu người dùng. Khi người dùng sửa 1 dòng trong file tài liệu 2GB, hệ thống phải đồng bộ lên đám mây chỉ trong vài giây mà không cần upload lại toàn bộ 2GB dữ liệu.',
    expectedKeywords: ['File Storage Architecture', 'Chunking (Content-Defined Chunking / Rabin Fingerprint)', 'Data Deduplication', 'Delta Sync (Rsync Algorithm)', 'Metadata DB vs Block Storage', 'Cross-Device Sync Protocol'],
    pitfalls: [
      'Lưu toàn bộ file nguyên khối (Monolithic File): Mỗi chỉnh sửa nhỏ đều buộc phải tải lên lại toàn bộ file, làm lãng phí băng thông và tốn thời gian.',
      'Không áp dụng Deduplication theo mã băm nội dung (Content Hash): Khi 1 triệu người dùng cùng lưu file cài đặt Windows 5GB, hệ thống lãng phí 5 Petabytes dung lượng lưu trữ.',
      'Lưu Metadata của file (thư mục cha con, tên file, quyền truy cập) vào cùng chỗ với Block Storage.'
    ],
    followUpQuestions: [
      'Content-Defined Chunking (CDC) sử dụng thuật toán Rabin Fingerprint để chia nhỏ file theo ranh giới nội dung thay vì kích thước cố định như thế nào?',
      'Quy trình đồng bộ xung đột (Conflict Resolution) khi 2 thiết bị cùng chỉnh sửa 1 file khi đang offline được giải quyết ra sao?'
    ]
  },

  'sys-095': {
    interviewerIntent: 'Đo lường năng lực thiết kế Hệ thống gợi ý tìm kiếm tức thì (Search Autocomplete / Typeahead Suggestion): Tối ưu hóa cấu trúc dữ liệu Trie trong bộ nhớ, tính toán tần suất tìm kiếm và độ trễ < 20ms.',
    contextOrScenario: 'Thiết kế thanh tìm kiếm cho Google / Amazon: Khi người dùng gõ từng ký tự (ví dụ: "i", "ip", "iph"), hệ thống phải trả về Top 5 gợi ý từ khóa phổ biến nhất trong vòng chưa đầy 20 mili-giây, phục vụ hàng chục nghìn lượt gõ phím mỗi giây.',
    expectedKeywords: ['Search Autocomplete / Typeahead', 'Trie (Prefix Tree) Data Structure', 'Pre-computed Top K Suggestions', 'Frequency Weighting', 'Trie Partitioning / Sharding', 'Browser Client Debouncing'],
    pitfalls: [
      'Chạy câu lệnh SQL `WHERE query LIKE "abc%"` vào database trên từng phím gõ của người dùng: Đánh sập database ngay lập tức.',
      'Duyệt toàn bộ cây Trie để tìm kiếm và sắp xếp Top 5 từ khóa tại thời điểm truy vấn: Làm tăng độ trễ CPU khi cây Trie có hàng triệu từ.',
      'Không áp dụng Debouncing ở phía Frontend (gửi request sau mỗi 300ms dừng gõ), làm bùng nổ số lượng request vô ích.'
    ],
    followUpQuestions: [
      'Bằng cách lưu trữ sẵn danh sách Top K gợi ý ngay tại từng Node của cây Trie, độ phức tạp của việc tìm kiếm được tối ưu về O(1) ra sao?',
      'Quy trình cập nhật tần suất từ khóa mới (Offline MapReduce/Spark Pipeline cập nhật cây Trie mỗi đêm) diễn ra như thế nào?'
    ]
  },

  'sys-096': {
    interviewerIntent: 'Đánh giá kiến trúc Hệ thống Thanh toán tài chính cốt lõi (Payment Processing System): Bảo đảm tính chính xác tuyệt đối, chống mất mát dữ liệu, sổ cái kép (Double-Entry Ledger) và nguyên tắc Bất biến.',
    contextOrScenario: 'Thiết kế nền tảng xử lý thanh toán tương tự Stripe: Xử lý các giao dịch quẹt thẻ tín dụng, liên kết ví điện tử và chuyển khoản ngân hàng. Tiêu chí số một là: Tuyệt đối không bao giờ được trừ tiền hai lần, không bao giờ mất giao dịch và có thể kiểm toán từng xu.',
    expectedKeywords: ['Payment System Architecture', 'Double-Entry Bookkeeping Ledger', 'Idempotency Key Engine', 'Distributed Transactions & Reconciliation', 'PCI-DSS Compliance', 'Dead Letter Queue & Audit Log'],
    pitfalls: [
      'Sử dụng mô hình kế toán đơn (Single-entry: chỉ tăng giảm 1 cột `balance` trong bảng accounts): Khi xảy ra lỗi hệ thống, không thể chứng minh tiền từ đâu đến và đi đâu.',
      'Bỏ qua bước lưu trữ Idempotency Key trước khi gửi request tới Payment Gateway đối tác.',
      'Xử lý hoàn tiền mà không có liên kết đối ứng với giao dịch gốc trong sổ cái (Ledger).'
    ],
    followUpQuestions: [
      'Nguyên tắc Sổ cái kép (Double-Entry Bookkeeping): Tổng số tiền Nợ (Debit) và Có (Credit) trong mọi giao dịch bắt buộc phải cân bằng bằng 0 như thế nào?',
      'Quy trình xử lý sự cố In-Doubt Transaction (khi gọi sang cổng Visa/Mastercard bị Timeout) bằng cơ chế Reversal hoặc Active Query diễn ra ra sao?'
    ]
  },

  'sys-098': {
    interviewerIntent: 'Đánh giá năng lực thiết kế kiến trúc phân tán đa khu vực địa lý cấp cao nhất (Multi-Region Active-Active Architecture), cơ chế sao chép hai chiều và xử lý xung đột dữ liệu phân vùng.',
    contextOrScenario: 'Hệ thống dịch vụ tài chính toàn cầu triển khai đồng thời tại 3 Datacenters: Bắc Mỹ (us-east), Châu Âu (eu-west) và Châu Á (ap-southeast). Toàn bộ 3 vùng đều tiếp nhận cả traffic ĐỌC và GHI. Cần đảm bảo hệ thống vẫn hoạt động bình thường khi 1 vùng bị thiên tai sập toàn bộ.',
    expectedKeywords: ['Multi-Region Active-Active', 'Bi-directional Cross-Region Replication', 'Data Sovereignty (GDPR)', 'Split-Brain Prevention', 'Conflict Resolution (CRDT / LWW)', 'Global Anycast DNS Routing'],
    pitfalls: [
      'Nghĩ rằng Active-Active là giải pháp dễ triển khai chỉ bằng cách bật multi-master replication trong MySQL/PostgreSQL (sẽ gặp thảm họa xung đột khóa chính và deadlock liên vùng).',
      'Không tính đến độ trễ vật lý của ánh sáng qua đại dương (khoảng 150ms giữa Mỹ và Singapore), làm tốc độ ghi bị chậm không thể chấp nhận nếu dùng đồng thuận đồng bộ.',
      'Vi phạm luật chủ quyền dữ liệu (như GDPR tại Châu Âu) khi vô tình replicate toàn bộ thông tin cá nhân của công dân EU sang máy chủ tại Mỹ.'
    ],
    followUpQuestions: [
      'Kỹ thuật phân chia quyền sở hữu dữ liệu theo địa lý (Data Sharding by Geography / User Pinning) giúp giảm 90% xung đột ghi liên vùng như thế nào?',
      'Khi xảy ra hiện tượng phân vùng mạng xuyên lục địa (Network Partition), làm thế nào để tránh thảm họa Split-Brain giữa 2 cụm Active-Active?'
    ]
  },

  'sys-099': {
    interviewerIntent: 'Kiểm tra kỹ năng vận hành và bảo trì cơ sở dữ liệu production không gián đoạn dịch vụ (Zero-Downtime Database Migration): Sử dụng mẫu hình Expand-and-Contract (Parallel Change Pattern).',
    contextOrScenario: 'Bảng `users` trong cơ sở dữ liệu đang có cột `name` (chứa họ và tên gộp chung). Cần tách thành 2 cột `first_name` và `last_name` trên hệ thống đang phục vụ 20,000 QPS mà tuyệt đối không được phép dừng hệ thống (Zero Downtime).',
    expectedKeywords: ['Expand-and-Contract Pattern', 'Parallel Change Pattern', 'Zero-Downtime Migration', 'Dual Writing & Dual Reading', 'Backfill Script', 'Backward Compatibility'],
    pitfalls: [
      'Chạy lệnh `ALTER TABLE users RENAME COLUMN name TO ...` trực tiếp trên Production: Lập tức làm crash toàn bộ code backend đang chạy bản cũ chưa kịp deploy.',
      'Chạy script cập nhật dữ liệu (Data Backfill) trên hàng chục triệu bản ghi trong 1 transaction duy nhất: Khóa chặt toàn bộ bảng DB làm sập hệ thống.',
      'Xóa bỏ cột cũ ngay khi vừa deploy code mới mà chưa cho hệ thống chạy thử nghiệm một thời gian an toàn.'
    ],
    followUpQuestions: [
      'Trình bày chi tiết 4 giai đoạn của Expand-and-Contract: (1) Expand (thêm cột mới & dual write) -> (2) Backfill dữ liệu cũ theo từng batch nhỏ -> (3) Contract Phase 1 (chuyển sang đọc cột mới) -> (4) Contract Phase 2 (xóa cột cũ)?',
      'Làm thế nào để viết script Backfill dữ liệu an toàn theo từng khối (Batch of 1,000 records) có thời gian nghỉ giữa các đợt để không làm tăng CPU của database?'
    ]
  },

  'sys-100': {
    interviewerIntent: 'Đánh giá kiến thức phân tích sự cố phân tán nâng cao: Nhận diện hiện tượng Điểm nóng phân vùng (Hot Partition / Hot Key Problem) và các kỹ thuật giảm nhẹ (Salting, Local Caching, Key Splitting).',
    contextOrScenario: 'Cơ sở dữ liệu phân tán DynamoDB / Cassandra được sharded theo `user_id`. Một tài khoản người nổi tiếng (KOL) có 20 triệu người theo dõi vừa đăng bài viết, khiến hàng triệu request dồn vào đúng 1 node phân vùng lưu trữ tài khoản này, làm node đó bị quá tải (Throttled) trong khi các node khác hoàn toàn rỗi.',
    expectedKeywords: ['Hot Partition / Hot Key Problem', 'Key Salting (Random Suffix)', 'Write Amplification Trade-off', 'Local In-Memory Cache (L1 Cache)', 'Read Scatter-Gather', 'Partition Key Distribution'],
    pitfalls: [
      'Chọn Partition Key có độ biến thiên quá thấp (Low Cardinality) hoặc mang tính tập trung cao (ví dụ: Partition theo ngày hoặc trạng thái).',
      'Tăng cấu hình phần cứng cho toàn bộ cụm máy chủ chỉ để cứu 1 node duy nhất bị nghẽn Hot Key, gây lãng phí chi phí khổng lồ.',
      'Áp dụng Salting (thêm hậu tố ngẫu nhiên) cho Key ghi nhưng không lường trước việc khi đọc phải thực hiện Scatter-Gather trên tất cả các sub-keys.'
    ],
    followUpQuestions: [
      'Kỹ thuật Key Salting (thêm ngẫu nhiên `key_01`, `key_02`, ..., `key_10`) giúp phân bổ lưu lượng ghi sang 10 nodes khác nhau như thế nào?',
      'Làm thế nào để sử dụng Adaptive Caching (tự động phát hiện Hot Key trên Redis/Memcached và chuyển sang phục vụ từ Local Memory của từng Pod) để giải cứu database?'
    ]
  }
};

let count = 0;
for (const [id, update] of Object.entries(metadataPart2)) {
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
console.log(`Updated Metadata Part 2 successfully: ${count} questions updated.`);
