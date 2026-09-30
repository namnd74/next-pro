import fs from 'node:fs';
import path from 'node:path';

const filePath = path.resolve('src/features/interview/data/json/system-design-bank.json');
const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));

const updatesPart1 = {
  'sys-010': {
    interviewerIntent: 'Đánh giá kiến thức an toàn thông tin thực chiến, tư duy phòng thủ đa lớp (Defense in Depth) chống automated attack và khả năng bảo vệ hạ tầng mà không làm suy giảm trải nghiệm người dùng thực.',
    contextOrScenario: 'Một ứng dụng fintech/e-commerce vừa tung chiến dịch tặng voucher người dùng mới, dẫn đến việc mạng bot liên tục tạo hàng chục nghìn tài khoản ảo mỗi ngày để vét khuyến mãi, gây quá tải database và cạn kiệt ngân sách marketing.',
    expectedKeywords: ['Cloudflare Turnstile', 'Rate Limiting', 'Proof of Work', 'Honeypot Field', 'Disposable Email Blacklist', 'Device Fingerprinting'],
    pitfalls: [
      'Chỉ dựa vào CAPTCHA truyền thống gây khó chịu cho người dùng thật và vẫn bị giải mã bởi các dịch vụ captcha farm.',
      'Chặn IP đơn thuần khiến người dùng chung dải mạng NAT (văn phòng, mạng 4G) bị chặn oan.',
      'Gửi email OTP trực tiếp trước khi lọc domain rác làm cạn hạn mức dịch vụ email transactional (SES/SendGrid).'
    ],
    followUpQuestions: [
      'Làm thế nào để chống bot dùng tool headless browser (Puppeteer/Playwright) giải mã JavaScript challenge?',
      'Khi mạng bot sử dụng Residential Proxies (hàng chục nghìn IP sạch), bạn phân biệt bot và người dùng thật qua những tín hiệu nào?'
    ],
    seniorAnswer: {
      summary: 'Để chống bot tạo tài khoản ảo hàng loạt, cần triển khai hệ thống phòng thủ đa tầng (Defense in Depth): (1) Chặn tại Edge (Cloudflare Turnstile / reCAPTCHA v3) không làm phiền người dùng; (2) Rate Limiting theo IP + Device Fingerprint trên Redis (Token Bucket); (3) Honeypot hidden input để bẫy bot tự điền; (4) Chặn disposable email domains và xác thực OTP 2 chiều.',
      deepDive: 'Quy trình phòng thủ 4 lớp chuẩn production: Lớp 1 (Edge Gate): Dùng Cloudflare Turnstile đánh giá behavioral score ngầm, chỉ hiển thị thử thách tương tác khi score thấp. Lớp 2 (Honeypot & Timing): Tạo form field vô hình (ẩn bằng CSS), bot parser tự động điền giá trị sẽ bị loại bỏ ngay lập tức; đồng thời kiểm tra thời gian điền form (< 1.5s là bot). Lớp 3 (Network Rate Limit): Sử dụng Redis Sliding Window đếm số lần submit từ 1 IP hoặc Fingerprint (chặn nếu > 5 đăng ký/giờ). Lớp 4 (Data Verification): Kiểm tra MX Record và so sánh domain email với blacklist hơn 50,000 disposable email providers (như mailinator, guerrillamail).',
      codeExample: `// Middleware phòng thủ đăng ký tài khoản đa lớp trên Node.js/Express & Redis
import type { Request, Response, NextFunction } from 'express';
import { Redis } from 'ioredis';

const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');
const DISPOSABLE_DOMAINS = new Set(['mailinator.com', 'tempmail.com', '10minutemail.com', 'guerrillamail.com']);

export async function antiBotRegistrationGuard(req: Request, res: Response, next: NextFunction) {
  const { email, honeypot, turnstileToken } = req.body;
  const clientIp = req.headers['cf-connecting-ip'] || req.ip;

  // 1. Kiểm tra Honeypot (bot thường tự động fill tất cả inputs)
  if (honeypot) {
    return res.status(400).json({ error: 'Invalid submission detected' });
  }

  // 2. Chặn Disposable Email Domain
  const emailDomain = email?.split('@')[1]?.toLowerCase();
  if (!emailDomain || DISPOSABLE_DOMAINS.has(emailDomain)) {
    return res.status(400).json({ error: 'Email domain không được chấp nhận. Vui lòng dùng email cá nhân.' });
  }

  // 3. Rate Limit theo IP: Tối đa 3 lần đăng ký trong 10 phút
  const ipKey = \`rate_limit:reg:\${clientIp}\`;
  const attempts = await redis.incr(ipKey);
  if (attempts === 1) await redis.expire(ipKey, 600);
  if (attempts > 3) {
    return res.status(429).json({ error: 'Quá nhiều yêu cầu đăng ký từ mạng của bạn. Vui lòng thử lại sau.' });
  }

  // 4. Xác thực Cloudflare Turnstile Token tại Server-side
  const verifyRes = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      secret: process.env.TURNSTILE_SECRET_KEY || '',
      response: turnstileToken,
      remoteip: String(clientIp),
    }),
  });

  const outcome = await verifyRes.json() as { success: boolean };
  if (!outcome.success) {
    return res.status(403).json({ error: 'Xác thực bảo mật không thành công' });
  }

  return next();
}`
    }
  },

  'sys-011': {
    interviewerIntent: 'Đánh giá kỹ năng giao tiếp kỹ thuật, phương pháp luận giải quyết vấn đề có cấu trúc, khả năng điều phối thời gian 45 phút phỏng vấn System Design chuẩn FAANG/Big Tech.',
    contextOrScenario: 'Trong một buổi phỏng vấn Senior/Staff Architect kéo dài 45 phút, phỏng vấn viên đưa ra đề bài rất ngắn gọn: "Hãy thiết kế Twitter/X". Ứng viên phải tự chủ động dẫn dắt cuộc thảo luận, không để bị sa đà vào chi tiết vụn vặt.',
    expectedKeywords: ['4-Step Framework', 'Requirement Clarification', 'Back-of-the-envelope', 'High-Level Design', 'Deep Dive', 'Bottlenecks & SPOF'],
    pitfalls: [
      'Vội vã vẽ sơ đồ kiến trúc ngay khi chưa làm rõ quy mô, mục tiêu MVP và các ràng buộc phi chức năng.',
      'Dành quá 25 phút vào tầng High-level mà không kịp đi sâu vào thiết kế thuật toán cốt lõi hoặc data model.',
      'Trình bày một chiều kiểu độc thoại, không tương tác hoặc xin feedback từ phỏng vấn viên.'
    ],
    followUpQuestions: [
      'Nếu thời gian chỉ còn 5 phút mà chưa kịp nói về Security và Caching, bạn tóm tắt những điểm trọng yếu nào?',
      'Khi phỏng vấn viên bất ngờ đổi đề bài giữa chừng (ví dụ: yêu cầu mở rộng thêm tính năng Livestream), bạn xử lý khung thời gian ra sao?'
    ],
    seniorAnswer: {
      summary: 'Khung 4 bước chuẩn 45 phút: (1) Bước 1 (5–7p): Làm rõ yêu cầu Functional & Non-functional, ước lượng quy mô DAU/QPS; (2) Bước 2 (10–12p): Thiết kế High-Level Architecture và Data Flow cốt lõi; (3) Bước 3 (15–18p): Deep-Dive vào các thành phần trọng yếu nhất (Data Model, Caching, Core Algorithm); (4) Bước 4 (5–7p): Đánh giá SPOF, Scalability Bottlenecks và Trade-offs.',
      deepDive: 'Chi tiết phân bổ thời gian thực chiến: Bước 1: Thu hẹp phạm vi chỉ giữ lại 2-3 tính năng sống còn (MVP), chốt SLA/SLO (Latency p99, Availability 99.99%). Bước 2: Phác thảo API Contracts (REST/gRPC) và vẽ các khối lớn: Client -> DNS/CDN -> API Gateway -> Backend Services -> Database. Bước 3: Đi sâu giải quyết "trái tim" bài toán (ví dụ: Fanout-on-write vs Fanout-on-read trong News Feed, hay Consistent Hashing trong Distributed Cache). Bước 4: Kiểm tra lại các điểm nghẽn (Single Point of Failure), cơ chế Disaster Recovery, Data Migration không downtime và tổng kết ưu nhược điểm kiến trúc đã chọn.',
      codeExample: `# Bảng phân bổ thời gian phỏng vấn System Design 45 phút
# Phase 1: Clarification & Scope (0 - 7 phút)
- Functional Requirements: 2-3 User Stories cốt lõi
- Non-Functional Requirements: High Availability vs Strong Consistency (CAP), Latency target
- Capacity Estimation: DAU -> Read/Write QPS -> Storage 5 năm -> Băng thông (Bandwidth)

# Phase 2: High-Level Design & API (7 - 20 phút)
- Endpoint Contracts: POST /api/v1/posts, GET /api/v1/feed
- High-level topology: LB -> Gateway -> Stateless App Pods -> Cache -> Sharded DB

# Phase 3: Detailed Deep-Dive (20 - 38 phút)
- Data Model Schema: PostgreSQL / Cassandra / Redis data types
- Giải thuật mấu chốt: Atomic locking, Message Queue event pipeline, Deduplication

# Phase 4: Bottleneck Analysis & Wrap-up (38 - 45 phút)
- Rà soát SPOF, Rate limit, Replication Lag, Monitoring & Alerting`
    }
  },

  'sys-012': {
    interviewerIntent: 'Kiểm tra tư duy phân tích yêu cầu kỹ thuật: Phân biệt rõ ràng giữa tính năng nghiệp vụ và các chỉ số đo lường chất lượng hệ thống, tránh thiết kế thừa hoặc thiếu đáp ứng tải.',
    contextOrScenario: 'Khi tiếp nhận yêu cầu từ bộ phận Product Manager: "Cần xây dựng tính năng Flash Sale giảm giá chớp nhoáng", kiến trúc sư trưởng cần tách bạch những gì người dùng nhìn thấy với những ràng buộc về hạ tầng chịu tải.',
    expectedKeywords: ['Functional Requirements', 'Non-Functional Requirements', 'SLA/SLO', 'Availability', 'Throughput', 'Fault Tolerance'],
    pitfalls: [
      'Gộp chung NFR vào FR, dẫn đến thiết kế API phức tạp không cần thiết.',
      'Bỏ qua NFR về Data Consistency, làm phát sinh lỗi trừ tiền hai lần hoặc bán quá số lượng kho hàng (Overselling).',
      'Đưa ra các chỉ số NFR viển vông (như 100% uptime, zero latency) mà không tính đến chi phí hạ tầng (Cost vs Benefit).'
    ],
    followUpQuestions: [
      'Làm thế nào để lượng hóa một yêu cầu phi chức năng mơ hồ như "Hệ thống phải chạy nhanh" thành metric cụ thể?',
      'Khi có xung đột giữa NFR Availability (99.99%) và Strong Consistency trong phân vùng mạng, bạn ưu tiên cái nào?'
    ],
    seniorAnswer: {
      summary: 'Yêu cầu chức năng (Functional Requirements - FR) mô tả hệ thống LÀM ĐƯỢC GÌ (nghiệp vụ: tạo đơn hàng, đăng xuất, thanh toán QR); Yêu cầu phi chức năng (Non-Functional Requirements - NFR) mô tả hệ thống VẬN HÀNH TỐT NHƯ THẾ NÀO (độ trễ p99 < 100ms, chịu tải 50,000 QPS, sẵn sàng 99.99%, bảo mật PCI-DSS, tính nhất quán ACID).',
      deepDive: 'Việc tách rõ FR và NFR mang tính sống còn vì FR định hình Data Model và Business Logic (Entities, Relationships, State Machines), trong khi NFR quyết định Kiến trúc Hạ tầng (Database Engine, Caching Topology, Message Queue, Sharding Strategy, Multi-Region Deployment). Một hệ thống có FR đơn giản (chỉ rút gọn URL) nhưng NFR yêu cầu 1 tỷ request/ngày và độ trễ đọc < 5ms sẽ có kiến trúc phân tán phức tạp gấp trăm lần một hệ thống ERP nội bộ có hàng trăm nghiệp vụ nhưng chỉ có 50 người dùng.',
      codeExample: `// Bản đặc tả FR vs NFR cho hệ thống Flash Sale (TypeScript Type Definitions)
export interface FlashSaleRequirements {
  // 1. Functional Requirements (Nghiệp vụ cốt lõi)
  functional: {
    canViewFlashSaleItems: (categoryId: string) => Promise<Item[]>;
    reserveItemInCart: (userId: string, itemId: string, qty: number) => Promise<ReservationResult>;
    checkoutWithVoucher: (orderId: string, voucherCode: string) => Promise<PaymentInvoice>;
  };

  // 2. Non-Functional Requirements (Chỉ số chất lượng & Ràng buộc hạ tầng)
  nonFunctional: {
    throughput: 'Peak 100,000 QPS tại thời điểm mở bán 00:00:00';
    latency: 'p99 read < 20ms (Edge CDN/Redis), p99 checkout < 500ms';
    availability: '99.99% Uptime (Không quá 4.3 phút downtime/tháng)';
    dataConsistency: 'Strictly Atomic (Zero Overselling - Tuyệt đối không bán lố tồn kho)';
    idempotency: 'Client retry khi mất kết nối mạng không được trừ tiền 2 lần';
  };
}`
    }
  },

  'sys-013': {
    interviewerIntent: 'Đánh giá khả năng làm rõ bối cảnh (Context Framing), phản xạ khai thác thông tin bị ẩn, và tư duy không giả định (Avoid Assumptions) trước khi thiết kế hệ thống.',
    contextOrScenario: 'Phỏng vấn viên chỉ ném ra một câu ngắn ngủi: "Hãy thiết kế hệ thống Chat thời gian thực". Một Senior Engineer không bao giờ lập tức cắm cúi vẽ WebSocket server mà phải đặt câu hỏi chiến lược trong 5 phút đầu.',
    expectedKeywords: ['Scope Clarification', 'DAU/MAU', 'Read/Write Ratio', 'Message Ordering', 'End-to-End Encryption', 'Push Notification'],
    pitfalls: [
      'Tự biên tự diễn các yêu cầu kỹ thuật mà không xác nhận với phỏng vấn viên (ví dụ: tự cho rằng chat 1-1 thay vì chat nhóm 500 người).',
      'Hỏi những câu vụn vặt mang tính cài đặt (như "em dùng thư viện socket.io hay ws?") thay vì câu hỏi định hình kiến trúc.',
      'Không hỏi về các ràng buộc đặc biệt như lưu trữ lịch sử tin nhắn bao lâu hay mã hóa E2EE.'
    ],
    followUpQuestions: [
      'Nếu phỏng vấn viên trả lời: "Tùy bạn tự quyết định toàn bộ quy mô", bạn sẽ thiết lập giả định (Assumptions) như thế nào?',
      'Làm thế nào để xác định Read/Write ratio ảnh hưởng trực tiếp đến lựa chọn cơ sở dữ liệu?'
    ],
    seniorAnswer: {
      summary: 'Trong 5 phút đầu phỏng vấn System Design, ứng viên Senior không nhảy vào vẽ sơ đồ ngay mà cần làm rõ 4 nhóm câu hỏi then chốt: (1) Phạm vi nghiệp vụ (MVP Scope: Chat 1-1 hay nhóm? Có voice/video không?); (2) Quy mô người dùng & tải (DAU/MAU, Peak CCU, tin nhắn gửi/giây); (3) Ràng buộc phi chức năng (Độ trễ nhận tin < 100ms, độ bền lưu trữ dữ liệu vĩnh viễn hay 30 ngày); (4) Tính năng nâng cao (Trạng thái đã đọc, typing indicator, offline sync).',
      deepDive: 'Chiến thuật hỏi phỏng vấn chuẩn Staff Engineer: Nhóm 1 (Scale): "Hệ thống phục vụ bao nhiêu người dùng hoạt động hằng ngày (DAU)? Tỉ lệ đọc/ghi dự kiến là bao nhiêu?". Nhóm 2 (Data): "Kích thước trung bình mỗi tin nhắn? Có hỗ trợ gửi ảnh/video file đính kèm không (nếu có cần thêm Blob Storage S3)?". Nhóm 3 (Consistency): "Thứ tự tin nhắn có cần bảo toàn tuyệt đối theo thời gian thực (Strict Ordering) xuyên suốt các thiết bị không?". Sau khi phỏng vấn viên trả lời, ứng viên tóm tắt lại thành văn bản hoặc ghi chú trên bảng để cả hai cùng thống nhất một hợp đồng mục tiêu (Design Contract).',
      codeExample: `# Mẫu ghi chú 5 phút đầu buổi phỏng vấn (Design Clarification Notes)
Target System: Real-Time Chat Application
------------------------------------------------------------
1. Scope Agreement:
   - Chat 1-1 và Chat nhóm tối đa 500 thành viên (In Scope)
   - Lưu trữ lịch sử tin nhắn text vĩnh viễn (In Scope)
   - Voice/Video call (Out of Scope cho phase 1)

2. Scale & Numbers:
   - 50 triệu DAU
   - Trung bình mỗi user gửi 40 tin nhắn/ngày -> 2 tỷ tin nhắn/ngày (~23k QPS trung bình, 100k QPS đỉnh)
   - Kích thước mỗi tin nhắn: 100 bytes -> 200 GB text/ngày -> ~73 TB/năm

3. Non-Functional Targets:
   - Delivery latency < 100ms
   - Zero message loss (At-least-once delivery)
   - Multi-device sync (Web, Mobile)`
    }
  },

  'sys-014': {
    interviewerIntent: 'Đo lường sự am hiểu sâu sắc về kiến trúc phần cứng máy tính và độ trễ vật lý (Hardware Latency Hierarchy) của kỹ sư hệ thống phân tán cấp cao.',
    contextOrScenario: 'Khi tranh luận về việc nên lưu dữ liệu trực tiếp trong Redis (RAM) hay truy vấn vào NVMe SSD Database, hoặc khi thiết kế RPC liên server qua mạng, kỹ sư cần đưa ra quyết định dựa trên các con số định lượng chính xác.',
    expectedKeywords: ['L1/L2 Cache', 'RAM Access', 'NVMe SSD', 'Data Center RTT', 'Cross-Region Latency', 'Mechanical Disk'],
    pitfalls: [
      'Cho rằng đọc từ SSD nhanh gần bằng RAM (thực tế SSD chậm hơn RAM hàng nghìn lần).',
      'Không tính độ trễ Round-Trip Time (RTT) khi gọi liên tục nhiều microservices qua mạng (Network Churn).',
      'Bỏ qua sự chênh lệch giữa sequential read (đọc tuần tự) và random read (đọc ngẫu nhiên).'
    ],
    followUpQuestions: [
      'Tại sao SSD đọc tuần tự (Sequential Read) lại có thể nhanh gấp 10-20 lần so với đọc ngẫu nhiên (Random Read)?',
      'Độ trễ ánh sáng truyền trong sợi quang học xuyên lục địa (xuyên đại dương) là bao nhiêu và nó đặt ra giới hạn vật lý gì cho hệ thống phân tán?'
    ],
    seniorAnswer: {
      summary: 'Các mốc thời gian vàng: L1 Cache ~ 1 ns; RAM Access ~ 100 ns; Đọc NVMe SSD ~ 100 microseconds (gấp 1,000 lần RAM); RTT cùng Datacenter ~ 0.5 ms (gấp 5,000 lần RAM); RTT Xuyên lục địa (Mỹ - Việt Nam) ~ 150-200 ms (gấp 1,500,000 lần RAM). Quyết định kiến trúc xuất phát từ các khoảng cách này.',
      deepDive: 'Ý nghĩa thực chiến của các con số độ trễ: (1) RAM vs SSD: Đọc 1MB tuần tự từ RAM tốn ~3 microseconds, nhưng từ SSD tốn ~1,000 microseconds (1ms). Đó là lý do Redis hoặc Memcached cho phép xử lý hàng trăm nghìn QPS trong khi SQL DB đơn lẻ bị giới hạn bởi Disk IOPS. (2) Mạng nội bộ vs Mạng công cộng: Một cuộc gọi RPC giữa 2 container trong cùng Availability Zone tốn ~0.5ms; nếu 1 API endpoint thực hiện 20 network calls nối tiếp (N+1 remote calls), tổng độ trễ riêng đường truyền đã mất 10ms. (3) Tốc độ ánh sáng trong sợi quang học (~200,000 km/s): Gửi 1 packet từ Hà Nội sang San Francisco mất tối thiểu 160ms khứ hồi, do đó dữ liệu người dùng phải được phân phối sát biên thông qua CDN và Multi-Region Read Replicas.',
      codeExample: `# Bảng tra cứu độ trễ phần cứng chuẩn Peter Norvig / Jeff Dean
Operation                                       Real Latency      Human Scale (1 ns = 1 giây)
---------------------------------------------------------------------------------------------
L1 cache reference                              0.5 ns            0.5 giây
Branch mispredict                               5 ns              5 giây
L2 cache reference                              7 ns              7 giây
Mutex lock/unlock                               25 ns             25 giây
Main memory (RAM) reference                     100 ns            1.7 phút
Compress 1KB with Snappy                        2,000 ns (2 µs)   33 phút
Read 1MB sequentially from memory               3,000 ns (3 µs)   50 phút
Read 1MB sequentially from SSD                  1,000,000 ns (1 ms) 11.5 ngày
Send 1KB over 1 Gbps network                    10,000 ns (10 µs) 2.7 giờ
Round trip in same datacenter                   500,000 ns (0.5 ms) 5.8 ngày
Round trip California to Netherlands (WAN)      150,000,000 ns (150 ms) 4.8 năm`
    }
  },

  'sys-015': {
    interviewerIntent: 'Đánh giá kỹ năng xử lý sự cố trực chiến (SRE Incident Response), thứ tự ưu tiên các hành động cứu vãn hệ thống, và sự tỉnh táo trong việc không đập phá hệ thống khi đang chịu tải cao.',
    contextOrScenario: 'Vào tối thứ Sáu, một sản phẩm thương mại điện tử chạy trên 1 server duy nhất (đang chứa cả Node.js backend và PostgreSQL DB) bất ngờ được một streamer nổi tiếng quảng bá, traffic tăng vọt gấp 5 lần khiến CPU chạm 100%, RAM cạn kiệt, khách hàng không thể đặt hàng.',
    expectedKeywords: ['Incident Triage', 'Vertical Scaling', 'Connection Pool', 'CDN Offloading', 'Read Replica', 'Horizontal Scaling'],
    pitfalls: [
      'Ngay lập tức đòi đập đi viết lại microservices hoặc chia shard database khi hệ thống đang ngắc ngoải.',
      'Restart server mù quáng mà không kiểm tra log, khiến toàn bộ connection ùa vào cùng lúc làm server crash sâu hơn.',
      'Không offload file tĩnh sang CDN, để server backend tốn tài nguyên phục vụ hình ảnh và assets tĩnh.'
    ],
    followUpQuestions: [
      'Nếu việc scale up cấu hình máy chủ vật lý (tăng CPU/RAM trên AWS/GCP) yêu cầu phải reboot server mất 3 phút, bạn chọn thời điểm nào?',
      'Sau khi đã vượt qua cơn khủng hoảng ngắn hạn, lộ trình kỹ thuật dài hạn trong 1 tháng tiếp theo sẽ gồm những bước nào?'
    ],
    seniorAnswer: {
      summary: 'Khi 1 server duy nhất bị traffic tăng gấp 5 và bắt đầu chậm, thứ tự xử lý chuẩn SRE là: (1) Ổn định tức thì: Scale Up cấu hình phần cứng (Vertical Scale CPU/RAM) để duy trì sự sống; (2) Giảm tải biên: Đẩy toàn bộ static assets và GET public APIs qua Cloudflare CDN; (3) Tách Database: Đưa cơ sở dữ liệu sang server riêng biệt (hoặc Managed RDS); (4) Tối ưu tầng ứng dụng: Bật Connection Pool (PgBouncer) và Redis Cache cho các query nặng nhất; (5) Scale Out: Đặt Load Balancer phía trước, biến backend thành Stateless để chạy nhiều instances.',
      deepDive: 'Thứ tự ưu tiên mang tính quyết định sự sống còn: Bước 1 (Dập lửa - 15 phút): Giám sát nhanh qua `htop` và `pg_stat_activity`. Nếu tắc nghẽn ở CPU/RAM của server duy nhất, thực hiện nâng instance type (ví dụ từ t3.xlarge lên c6i.4xlarge) - đây là cách nhanh nhất để mua thêm thời gian mà không cần sửa 1 dòng code. Bước 2 (Offload traffic - 1 giờ): Trỏ DNS qua Cloudflare, bật cache Everything cho hình ảnh, CSS, JS để loại bỏ 60-80% request tới server. Bước 3 (Tách kiến trúc - 1 ngày): Chuyển PostgreSQL sang AWS RDS hoặc server riêng, thiết lập PgBouncer để chặn tình trạng "too many connections". Bước 4 (Scale ngang - 1 tuần): Lưu session người dùng vào Redis, xóa bỏ lưu trữ local state trên backend, đặt AWS ALB phía trước và cấu hình Auto Scaling Pods.',
      codeExample: `# Các lệnh cứu hộ trực chiến khẩn cấp trên server Linux
# 1. Kiểm tra tài nguyên nghẽn (CPU, RAM, Disk I/O)
uptime && free -h && df -h
top -b -n 1 | head -n 20

# 2. Truy tìm các query PostgreSQL đang giữ lock làm nghẽn DB
SELECT pid, now() - pg_stat_activity.query_start AS duration, query, state
FROM pg_stat_activity
WHERE state != 'idle' AND (now() - pg_stat_activity.query_start) > interval '2 seconds'
ORDER BY duration DESC;

# 3. Hủy ngay các query zombie đang làm treo database
SELECT pg_cancel_backend(pid) FROM pg_stat_activity WHERE query LIKE '%heavy_report%' AND state != 'idle';`
    }
  },

  'sys-016': {
    interviewerIntent: 'Kiểm tra hiểu biết sâu sắc về tầng mạng (Layer 4 TCP vs Layer 7 HTTP Load Balancing), thuật toán phát hiện sự cố, và các cạm bẫy cấu hình sai gây sập hệ thống dây chuyền.',
    contextOrScenario: 'Hệ thống gồm 20 microservices backend nằm sau Nginx / AWS ALB. Một lỗi cấu hình health check đã khiến khi database bị chậm, Load Balancer đồng loạt gạch tên tất cả 20 backend pods vì tưởng rằng pods đã chết, gây mất kết nối 100% người dùng.',
    expectedKeywords: ['L4 vs L7 Health Check', 'Shallow vs Deep Health Check', 'Cascading Failure', 'Liveness vs Readiness Probe', 'Flapping / Thundering Herd'],
    pitfalls: [
      'Viết endpoint `/health` thực hiện query `SELECT 1 FROM database` và `PING redis`: Khi DB quá tải nhẹ, health check thất bại, LB ngắt traffic tới toàn bộ cụm backend, dẫn đến sập toàn diện.',
      'Cấu hình khoảng thời gian kiểm tra (Interval) quá ngắn (ví dụ: 1 giây) với ngưỡng fail = 1: Mạng chập chờn 1 tích tắc làm toàn bộ cụm máy chủ bị đánh dấu Unhealthy.',
      'Không tách biệt giữa Liveness (khởi động lại khi treo dead-lock) và Readiness (tạm dừng nhận traffic khi đang bận tải).'
    ],
    followUpQuestions: [
      'Vì sao Kubernetes tách riêng 3 loại: Startup Probe, Liveness Probe và Readiness Probe?',
      'Làm thế nào để tránh tình trạng "Flapping" (Server liên tục bật/tắt trong danh sách của Load Balancer)?'
    ],
    seniorAnswer: {
      summary: 'Load Balancer phát hiện backend còn sống qua cơ chế Health Check: Active (LB chủ động gửi TCP SYN ping hoặc HTTP GET /healthz định kỳ) và Passive (LB quan sát traffic thực tế, nếu node trả về 5xx liên tiếp 3 lần thì cách ly). Hậu quả nghiêm trọng nhất của cấu hình sai là Deep Health Check (query DB/Redis trong endpoint healthz): Khi DB chậm, toàn bộ backend đồng loạt báo "chết", LB cắt sạch traffic gây thảm họa sập toàn diện (Cascading Outage).',
      deepDive: 'Quy tắc vàng thiết kế Health Check chuẩn Senior: (1) Shallow Health Check cho Load Balancer: Endpoint `/healthz` chỉ kiểm tra tiến trình app có đang lắng nghe cổng mạng (In-process memory check, trả về HTTP 200 OK ngay lập tức trong < 2ms). (2) Tách biệt Liveness và Readiness: Readiness Probe kiểm tra xem node có sẵn sàng nhận traffic không (ví dụ: đã load xong cache ban đầu chưa); Liveness Probe kiểm tra process có bị deadlock vĩnh viễn hay không. (3) Cấu hình giảm chấn (Debounce & Flapping Prevention): Đặt `healthyThreshold: 2`, `unhealthyThreshold: 3`, `timeout: 3s`, `interval: 10s`. Cần 3 lần thất bại liên tiếp mới loại bỏ node, tránh trường hợp mạng nội bộ rớt gói tin nhẹ làm rụng cả cụm server.',
      codeExample: `# Cấu hình Health Check an toàn trên Nginx / AWS Target Group
# 1. Endpoint Shallow Health Check chuẩn trên Express/Node.js
app.get('/healthz', (req, res) => {
  // Tuyệt đối không query DB ở đây! Chỉ trả về trạng thái tiến trình
  if (isShuttingDown) {
    return res.status(503).json({ status: 'draining' });
  }
  return res.status(200).json({ status: 'ok', uptime: process.uptime() });
});

# 2. Cấu hình Target Group trên Terraform (AWS ALB)
resource "aws_lb_target_group" "app_tg" {
  name     = "app-production-tg"
  port     = 8080
  protocol = "HTTP"
  vpc_id   = var.vpc_id

  health_check {
    enabled             = true
    path                = "/healthz"
    protocol            = "HTTP"
    port                = "traffic-port"
    interval            = 15 # 15 giây kiểm tra 1 lần
    timeout             = 5  # Timeout 5 giây
    healthy_threshold   = 2  # Cần 2 lần pass để đưa vào phục vụ
    unhealthy_threshold = 3  # Cần 3 lần tạch liên tiếp mới đánh sập
    matcher             = "200"
  }
}`
    }
  },

  'sys-017': {
    interviewerIntent: 'Kiểm tra năng lực phân loại bài toán kỹ thuật, thấu hiểu nguyên lý lưu trữ (B-Tree vs LSM-Tree) và các mẫu hình kiến trúc tối ưu tương ứng cho từng đặc thù tải.',
    contextOrScenario: 'Doanh nghiệp đang vận hành 2 dịch vụ: (1) Mạng xã hội tin tức đọc báo (tỉ lệ đọc/ghi 100:1); (2) Hệ thống giám sát cảm biến IoT xe công nghệ gửi tọa độ định vị mỗi giây (tỉ lệ ghi áp đảo 1:50). Kiến trúc sư cần chọn kiến trúc lưu trữ khác nhau hoàn toàn cho 2 bài toán.',
    expectedKeywords: ['Read-Heavy vs Write-Heavy', 'Cache-Aside', 'CQRS', 'LSM-Tree', 'Append-Only Log', 'Kafka Buffering', 'Micro-batching'],
    pitfalls: [
      'Áp dụng cùng một giải pháp SQL Database quan hệ với nhiều B-Tree Indexes cho cả hệ thống ghi dữ liệu cảm biến IoT tốc độ cao.',
      'Trong hệ đọc-nặng, không thiết kế cơ chế làm mới cache (Cache Invalidation) dẫn đến dữ liệu rác hiển thị kéo dài.',
      'Thực hiện ghi trực tiếp từng bản ghi xuống đĩa cứng thay vì sử dụng cơ chế gom lô (Micro-batching) và Buffer Queue.'
    ],
    followUpQuestions: [
      'Tại sao cấu trúc dữ liệu Log-Structured Merge-tree (LSM-tree) trong Cassandra/RocksDB lại tối ưu cho hệ thống ghi nặng hơn B-Tree của PostgreSQL?',
      'Trong hệ thống đọc-nặng với tỷ lệ 100:1, khi một bài viết viral được sửa nội dung, làm sao cập nhật cache cho hàng triệu người mà không gây nghẽn DB?'
    ],
    seniorAnswer: {
      summary: 'Hệ thống Đọc-nặng (Read-heavy: như Twitter, Báo chí) ưu tiên tối đa Caching đa tầng (CDN, Redis, Local Memory), Denormalization dữ liệu để tránh JOIN phức tạp, và Read Replicas; Hệ thống Ghi-nặng (Write-heavy: như IoT Telemetry, Chat Logs, Payment Ledger) sử dụng cơ chế Append-Only Log (LSM-Tree: Cassandra, ClickHouse), gom batch ghi qua Message Queue (Kafka), và Sharding theo thời gian.',
      deepDive: 'Chiến lược phân hóa kiến trúc: (1) Hệ thống Read-Heavy: Dữ liệu được tính toán trước (Pre-computed / Materialized Views). Ứng dụng mô hình Cache-Aside hoặc Read-Through. Áp dụng CQRS để tách riêng cơ sở dữ liệu đọc (Elasticsearch cho tìm kiếm, Redis cho bảng tin). (2) Hệ thống Write-Heavy: Tránh xa B-Tree Index vì mỗi thao tác ghi ngẫu nhiên (Random Write) đều tốn công rebalance cây. Thay vào đó, dùng cấu trúc LSM-Tree (ghi tuần tự vào WAL và MemTable trên RAM, sau đó flush ngầm xuống SSTable trên đĩa). Sử dụng Kafka làm buffer chống nghẽn đỉnh tải, kết hợp micro-batching gom 1,000 sự kiện ghi 1 lần.',
      codeExample: `// Write-Heavy: Worker gom lô (Micro-batching) ghi 1,000 bản ghi mỗi đợt vào Database
export class TelemetryBatchWriter {
  private buffer: Array<TelemetryData> = [];
  private flushTimer: NodeJS.Timeout | null = null;

  constructor(private dbPool: Pool, private batchSize = 1000, private maxWaitMs = 100) {}

  public record(data: TelemetryData) {
    this.buffer.push(data);
    if (this.buffer.length >= this.batchSize) {
      this.flush();
    } else if (!this.flushTimer) {
      this.flushTimer = setTimeout(() => this.flush(), this.maxWaitMs);
    }
  }

  private async flush() {
    if (this.flushTimer) { clearTimeout(this.flushTimer); this.flushTimer = null; }
    const batch = this.buffer.splice(0, this.batchSize);
    if (batch.length === 0) return;

    // Sử dụng pg-format hoặc multi-row INSERT unnest để ghi 1,000 bản ghi trong 1 single query
    const query = \`
      INSERT INTO device_telemetry (device_id, latitude, longitude, recorded_at)
      SELECT * FROM UNNEST($1::text[], $2::float8[], $3::float8[], $4::timestamptz[])
    \`;
    await this.dbPool.query(query, [
      batch.map(b => b.deviceId),
      batch.map(b => b.lat),
      batch.map(b => b.lng),
      batch.map(b => b.time),
    ]);
  }
}`
    }
  },

  'sys-018': {
    interviewerIntent: 'Đánh giá khả năng thiết kế một dịch vụ hoàn chỉnh từ bài toán kinh điển (TinyURL / Bit.ly), kỹ thuật sinh ID duy nhất phân tán và tách biệt luồng xử lý chuyển hướng độ trễ cực thấp với luồng thống kê bất đồng bộ.',
    contextOrScenario: 'Phòng Marketing chạy chiến dịch gửi 10 triệu tin nhắn SMS chứa link rút gọn. Khi người dùng bấm vào link, hệ thống phải chuyển hướng (Redirect 302/301) trong vòng < 20ms, đồng thời ghi nhận chính xác thiết bị, vị trí địa lý, thời gian click để làm báo cáo phân tích hiệu quả.',
    expectedKeywords: ['Base62 Encoding', 'Snowflake ID', 'Cache-Aside (Redis)', 'HTTP 301 vs 302', 'Kafka Async Analytics', 'Bloom Filter'],
    pitfalls: [
      'Dùng mã băm MD5/SHA256 rồi cắt lấy 7 ký tự đầu: Dễ bị đụng độ mã băm (Hash Collision) khi quy mô đạt hàng chục triệu links.',
      'Sử dụng HTTP 301 Permanent Redirect khiến trình duyệt tự cache kết quả, làm mất toàn bộ dữ liệu thống kê lượt click của các lần bấm sau.',
      'Thực hiện ghi log thống kê trực tiếp vào database trong cùng luồng xử lý request redirect, làm độ trễ chuyển hướng tăng vọt lên hàng trăm ms.'
    ],
    followUpQuestions: [
      'Vì sao nên chọn HTTP 302 Found (hoặc 307 Temporary Redirect) thay vì 301 Moved Permanently cho dịch vụ có đo lường click?',
      'Nếu 1 link rút gọn bất ngờ bị bão traffic (100,000 clicks/giây), kiến trúc của bạn chống chịu như thế nào để không sập cache?'
    ],
    seniorAnswer: {
      summary: 'Kiến trúc gồm: (1) Distributed ID Generator sinh Unique 64-bit Integer; (2) Mã hóa số nguyên đó sang chuỗi Base62 (7 ký tự hỗ trợ ~3.5 nghìn tỷ URLs độc nhất); (3) Redirect cực nhanh (< 10ms) bằng Redis Cache-Aside; (4) Thu thập thống kê click bất đồng bộ qua Kafka / SQS để không ảnh hưởng đến độ trễ chuyển hướng của người dùng; (5) Trả về HTTP 302 (hoặc 307) để buộc trình duyệt luôn gửi request về server đếm click.',
      deepDive: 'Quy trình vận hành chi tiết: Khi tạo link: Server sinh ID tuần tự phân tán (dùng Twitter Snowflake hoặc Redis Range Allocator - cấp dải 100,000 ID cho từng server để tránh lock). Lấy số nguyên ID mã hóa Base62 `[0-9a-zA-Z]`. Lưu cặp `{shortCode: originalUrl}` vào MongoDB / PostgreSQL và preload vào Redis. Khi người dùng click: Nginx/API Gateway tra cứu Redis: (1) Nếu Cache Hit, đẩy event click `{shortCode, ip, userAgent, timestamp}` vào Kafka Topic `url-clicks`, rồi trả về ngay Header `Location: originalUrl` kèm mã HTTP 302; (2) Nếu Cache Miss, tra cứu DB, nạp vào Redis (TTL 7 ngày) rồi redirect. Worker phía sau Kafka tiêu thụ event, phân tích geolocation qua MaxMind GeoIP và ghi dữ liệu tổng hợp vào ClickHouse để phục vụ dashboard marketing.',
      codeExample: `// Thuật toán Base62 Encoding & Decoding cho URL Shortener
const BASE62_CHARS = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';

export function encodeBase62(num: bigint): string {
  if (num === 0n) return BASE62_CHARS[0];
  let result = '';
  let current = num;
  while (current > 0n) {
    const remainder = Number(current % 62n);
    result = BASE62_CHARS[remainder] + result;
    current = current / 62n;
  }
  return result;
}

export function decodeBase62(str: string): bigint {
  let result = 0n;
  for (let i = 0; i < str.length; i++) {
    const charIndex = BigInt(BASE62_CHARS.indexOf(str[i]));
    result = result * 62n + charIndex;
  }
  return result;
}`
    }
  },

  'sys-019': {
    interviewerIntent: 'Đánh giá khả năng giải quyết xung đột ghi đồng thời cao (High Concurrency Write Contention), kỹ năng khai thác cấu trúc dữ liệu nâng cao của Redis (Sorted Sets, HyperLogLog) và kỹ thuật đồng bộ dữ liệu theo mẻ (Batch Synchronization).',
    contextOrScenario: 'Trang báo điện tử lớn có bài viết nóng (Breaking News) đạt 50,000 lượt đọc mỗi giây. Hệ thống cần hiển thị số lượt xem cập nhật liên tục và duy trì bảng xếp hạng "Top 100 bài báo được đọc nhiều nhất trong ngày" theo thời gian thực.',
    expectedKeywords: ['Atomic INCR', 'Redis Sorted Set (ZSET)', 'Write-Back Cache', 'HyperLogLog', 'Throttling / Debouncing', 'Eventual Consistency'],
    pitfalls: [
      'Chạy câu lệnh `UPDATE posts SET views = views + 1 WHERE id = ?` trực tiếp vào SQL Database mỗi khi có người đọc (Row-level lock làm nghẽn chết toàn bộ DB).',
      'Lấy Top 100 bằng cách query `SELECT * FROM posts ORDER BY views DESC LIMIT 100` liên tục vào cơ sở dữ liệu quan hệ.',
      'Không lọc lượt xem ảo (1 user F5 liên tục 100 lần) làm sai lệch dữ liệu phân tích.'
    ],
    followUpQuestions: [
      'Làm thế nào để đếm Unique Visitors (số người đọc duy nhất) với hàng triệu lượt xem mà chỉ tốn vài Kilobyte bộ nhớ RAM?',
      'Nếu server Redis chứa dữ liệu bộ đếm bị sập đột ngột trước khi kịp đồng bộ về PostgreSQL, bạn hạn chế mất mát dữ liệu ra sao?'
    ],
    seniorAnswer: {
      summary: 'Để đếm lượt xem (Views) và xếp hạng Top nội dung trong ngày, tuyệt đối không chạy `UPDATE posts SET views = views + 1` trực tiếp vào cơ sở dữ liệu. Kiến trúc chuẩn: (1) Client gọi beacon nhẹ lên API; (2) Tăng bộ đếm nguyên tử trong Redis bằng `INCR post:{id}:views`; (3) Cập nhật bảng xếp hạng trong Redis Sorted Set qua `ZINCRBY leaderboard:{date} 1 {postId}`; (4) Lấy Top 100 bằng `ZREVRANGE` với độ phức tạp O(log N + M) chỉ tốn < 2ms; (5) Worker định kỳ flush số liệu từ Redis về Database theo mẻ (Write-Back Batching).',
      deepDive: 'Chi tiết triển khai 3 cấp độ: (1) Chống gian lận & Đếm Unique: Dùng Redis HyperLogLog (`PFADD post:{id}:uv {fingerprint}`) để đếm số độc giả duy nhất với sai số chỉ 0.81% mà chỉ tốn đúng 12KB RAM bất kể có 10 triệu độc giả. (2) Bảng xếp hạng Real-time: Sử dụng cấu trúc Redis Sorted Set (ZSET). Mỗi lần đọc bài, thực thi pipeline: `INCR` view tổng, và `ZINCRBY leaderboard:2026-09-30 1 post_123`. Lấy Top 10 bài hot nhất chỉ cần gọi: `ZREVRANGE leaderboard:2026-09-30 0 9 WITHSCORES`. (3) Đồng bộ bền vững: Cron worker mỗi 60 giây quét các key đã thay đổi, gom thành 1 câu lệnh SQL `INSERT ... ON CONFLICT (id) DO UPDATE SET views = posts.views + EXCLUDED.views` để cập nhật vĩnh viễn vào PostgreSQL.',
      codeExample: `// Pipeline đếm view và cập nhật Leaderboard thời gian thực trên Redis & Node.js
import { Redis } from 'ioredis';
const redis = new Redis();

export async function recordPageView(postId: string, userFingerprint: string) {
  const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
  const postViewKey = \`post:\${postId}:views\`;
  const leaderboardKey = \`leaderboard:\${today}\`;
  const uvKey = \`post:\${postId}:uv:\${today}\`;

  const pipeline = redis.pipeline();
  // 1. Tăng lượt xem tổng
  pipeline.incr(postViewKey);
  // 2. Tăng điểm số trong bảng xếp hạng ngày
  pipeline.zincrby(leaderboardKey, 1, postId);
  // 3. Đánh dấu Unique Visitor (HyperLogLog)
  pipeline.pfadd(uvKey, userFingerprint);

  await pipeline.exec();
}

// API lấy Top 10 bài viết xem nhiều nhất ngày hôm nay (< 2ms)
export async function getTopStories(limit = 10): Promise<Array<{ postId: string; score: number }>> {
  const today = new Date().toISOString().slice(0, 10);
  const raw = await redis.zrevrange(\`leaderboard:\${today}\`, 0, limit - 1, 'WITHSCORES');
  
  const results: Array<{ postId: string; score: number }> = [];
  for (let i = 0; i < raw.length; i += 2) {
    results.push({ postId: raw[i], score: Number(raw[i + 1]) });
  }
  return results;
}`
    }
  },

  'sys-020': {
    interviewerIntent: 'Đánh giá năng lực thiết kế hệ thống giải quyết vấn đề cao điểm tập trung đột biến (Morning Spike), hỗ trợ thiết bị phần cứng IoT/máy quét có kết nối mạng không ổn định (Offline-First), và xử lý toàn vẹn dữ liệu.',
    contextOrScenario: 'Một tập đoàn có 10,000 nhân viên cùng đến công ty vào khung giờ 8h25 - 8h35 sáng. Nhân viên check-in qua App di động (GPS + Face ID) hoặc máy quét vân tay/khuôn mặt tại cửa ra vào, tạo ra áp lực tải cực lớn trong đúng 10 phút, trong khi mạng tại sảnh có thể bị chập chờn.',
    expectedKeywords: ['Load Leveling (Queue)', 'Offline-First', 'Idempotency Key', 'HMAC Signature', 'PostgreSQL Partitioning', 'SLA Batch Processing'],
    pitfalls: [
      'Cho phép máy quét gửi trực tiếp request ghi vào cơ sở dữ liệu quan hệ, gây khóa bảng và treo hệ thống trong 10 phút cao điểm.',
      'Không hỗ trợ lưu trữ offline tại máy quét, làm mất dữ liệu chấm công của nhân viên khi sảnh tòa nhà mất mạng Internet.',
      'Không có cơ chế chống giả mạo toạ độ GPS (Mock GPS) hoặc chấm công hộ trên ứng dụng di động.'
    ],
    followUpQuestions: [
      'Làm thế nào để ngăn chặn nhân viên sử dụng phần mềm Fake GPS trên điện thoại Android/iOS để chấm công từ xa?',
      'Khi máy quét tại cửa mất mạng suốt 2 tiếng và đột ngột kết nối lại, gửi hàng nghìn dữ liệu dồn về cùng lúc, hệ thống xử lý ra sao để không bị quá tải?'
    ],
    seniorAnswer: {
      summary: 'Thiết kế hệ thống chấm công xử lý đỉnh tải cao (8h30 sáng): (1) Máy quét / App hỗ trợ Offline-First: Lưu cục bộ trên SQLite và mã hóa HMAC payload; (2) Khi có mạng, đồng bộ dữ liệu kèm Idempotency Key (\`userId_date_shift\`); (3) API Gateway đẩy dữ liệu vào Message Queue (RabbitMQ / Kafka) để làm phẳng đỉnh tải (Load Leveling); (4) Worker xử lý bất đồng bộ ghi vào DB PostgreSQL có phân vùng (Table Partitioning) theo tháng.',
      deepDive: 'Giải pháp kiến trúc toàn diện: (1) Xử lý Spike Tải: 10,000 lượt check-in trong 10 phút (~17 QPS trung bình, nhưng có thể dồn đỉnh 500 QPS). Tầng Ingestion chỉ làm nhiệm vụ xác thực chữ ký số HMAC của máy quét và đẩy message vào Kafka topic `attendance-events`, phản hồi HTTP 202 Accepted ngay trong < 10ms. (2) Chống chấm công trùng (Idempotency): Khóa bất biến được tạo từ `hash(employee_id + shift_id + date + check_in_type)`. Worker khi ghi vào database áp dụng `ON CONFLICT (idempotency_key) DO NOTHING`. (3) Chống gian lận GPS: Kết hợp định vị GPS với BSSID mạng Wifi nội bộ của văn phòng và Bluetooth Low Energy (BLE) Beacon tại sảnh. (4) Lưu trữ dài hạn: Bảng `attendances` phân vùng theo tháng (`PARTITION BY RANGE (check_in_date)`), cho phép truy vấn báo cáo công lương nhanh chóng mà không phải scan bảng trăm triệu dòng.',
      codeExample: `-- Thiết kế Schema PostgreSQL có phân vùng và ràng buộc bất biến chống chấm công trùng
CREATE TABLE attendance_records (
    id UUID DEFAULT gen_random_uuid(),
    employee_id VARCHAR(50) NOT NULL,
    check_time TIMESTAMPTZ NOT NULL,
    check_date DATE NOT NULL,
    device_id VARCHAR(50) NOT NULL,
    verification_type VARCHAR(20) NOT NULL, -- 'FACE_AI', 'FINGERPRINT', 'APP_GPS'
    idempotency_key VARCHAR(100) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now(),
    PRIMARY KEY (check_date, id)
) PARTITION BY RANGE (check_date);

-- Tạo phân vùng cho từng tháng
CREATE TABLE attendance_2026_09 PARTITION OF attendance_records
    FOR VALUES FROM ('2026-09-01') TO ('2026-10-01');

CREATE TABLE attendance_2026_10 PARTITION OF attendance_records
    FOR VALUES FROM ('2026-10-01') TO ('2026-11-01');

-- Unique Index đảm bảo không bao giờ có 2 bản ghi check-in trùng trong 1 phút
CREATE UNIQUE INDEX idx_unique_emp_checkin ON attendance_records (employee_id, check_date, idempotency_key);`
    }
  },

  'sys-021': {
    interviewerIntent: 'Đánh giá khả năng thiết kế trải nghiệm người dùng liền mạch (Seamless UX), kỹ thuật quản lý trạng thái phiên khách (Guest Session Management) và giải thuật hòa giải dữ liệu (Cart Merging Conflict Resolution) khi người dùng chuyển từ trạng thái vãng lai sang đăng nhập.',
    contextOrScenario: 'Người dùng lướt web trên máy tính công ty khi chưa đăng nhập và thêm 3 món hàng vào giỏ. Buổi tối, người dùng mở app điện thoại đã đăng nhập (trên app đã có sẵn 2 món hàng cũ). Hệ thống cần hợp nhất giỏ hàng một cách thông minh, không làm mất hàng và cập nhật số lượng badge giỏ hàng trên cả 2 thiết bị.',
    expectedKeywords: ['Guest Cart Token', 'Cart Merging Strategy', 'Redis Session Store', 'Optimistic Locking', 'WebSocket/SSE Cart Sync', 'Inventory Validation'],
    pitfalls: [
      'Xóa sạch giỏ hàng của khách vãng lai khi người dùng đăng nhập, khiến khách hàng bực bội bỏ đi.',
      'Cộng dồn số lượng vượt quá số lượng hàng tồn kho thực tế mà không kiểm tra (Inventory Exceeded).',
      'Không đặt thời gian hết hạn (TTL) cho giỏ hàng của khách vãng lai, làm rác dữ liệu bộ nhớ Redis.'
    ],
    followUpQuestions: [
      'Khi hợp nhất 2 giỏ hàng mà có 1 sản phẩm bị đổi giá hoặc hết hàng trong kho, bạn thông báo và xử lý thế nào?',
      'Làm thế nào để khi người dùng thêm sản phẩm trên Web, icon giỏ hàng trên App điện thoại đang mở nhảy số ngay lập tức?'
    ],
    seniorAnswer: {
      summary: 'Thiết kế giỏ hàng đồng bộ web và app: (1) Khách chưa đăng nhập: Cấp \`guest_cart_token\` (UUID) lưu tại Cookie/LocalStorage và Redis (\`cart:guest:{token}\`, TTL 14 ngày); (2) Khi đăng nhập (Login Event): Thực thi Cart Merging Strategy giữa Guest Cart và User Cart (nếu trùng item thì cộng dồn số lượng nhưng capped theo tồn kho khả dụng), sau đó xóa guest cart; (3) Đồng bộ thời gian thực: Dùng WebSocket hoặc SSE phát sự kiện \`CART_UPDATED\` tới các thiết bị đang mở cùng tài khoản.',
      deepDive: 'Chi tiết thuật toán Merge và Lưu trữ: Giỏ hàng được lưu trong Redis dưới dạng Hash (\`HSET cart:user:{id} item_id quantity\`) để hỗ trợ thao tác thêm/sửa/xóa từng item với độ phức tạp O(1). Khi sự kiện đăng nhập xảy ra, API `POST /api/v1/auth/login` nhận cả credentials và `guest_cart_token`. Service đọc toàn bộ items từ `cart:guest:{token}`. Với mỗi item: Kiểm tra xem `item_id` đã có trong `cart:user:{id}` chưa. Nếu chưa có, chuyển sang. Nếu đã có, `new_qty = min(guest_qty + user_qty, product_max_allowed)`. Kiểm tra trạng thái tồn kho thực tế của sản phẩm. Cuối cùng, publish message vào Redis Pub/Sub kênh `user_events:{userId}` để bắn tín hiệu SSE tới client refresh giao diện.',
      codeExample: `// Thuật toán Merge Giỏ hàng khi khách vãng lai đăng nhập tài khoản
import { Redis } from 'ioredis';
const redis = new Redis();

export async function mergeGuestCartToUser(guestToken: string, userId: string): Promise<Record<string, number>> {
  const guestKey = \`cart:guest:\${guestToken}\`;
  const userKey = \`cart:user:\${userId}\`;

  const [guestItems, userItems] = await Promise.all([
    redis.hgetall(guestKey),
    redis.hgetall(userKey),
  ]);

  if (!guestItems || Object.keys(guestItems).length === 0) {
    return userItems || {};
  }

  const pipeline = redis.pipeline();

  for (const [itemId, guestQtyStr] of Object.entries(guestItems)) {
    const guestQty = parseInt(guestQtyStr, 10);
    const userQty = userItems[itemId] ? parseInt(userItems[itemId], 10) : 0;
    
    // Giới hạn số lượng tối đa 10 sản phẩm mỗi loại
    const finalQty = Math.min(guestQty + userQty, 10);
    pipeline.hset(userKey, itemId, finalQty);
  }

  // Đặt TTL cho giỏ hàng người dùng (30 ngày kể từ lần cập nhật cuối)
  pipeline.expire(userKey, 86400 * 30);
  // Xóa giỏ hàng khách vãng lai sau khi đã merge
  pipeline.del(guestKey);

  await pipeline.exec();
  return redis.hgetall(userKey);
}`
    }
  }
};

let count = 0;
for (const [id, update] of Object.entries(updatesPart1)) {
  const q = data.find(item => item.id === id);
  if (q) {
    q.interviewerIntent = update.interviewerIntent;
    q.contextOrScenario = update.contextOrScenario;
    q.expectedKeywords = update.expectedKeywords;
    q.pitfalls = update.pitfalls;
    q.followUpQuestions = update.followUpQuestions;
    if (q.seniorAnswer) {
      q.seniorAnswer.summary = update.seniorAnswer.summary;
      q.seniorAnswer.deepDive = update.seniorAnswer.deepDive;
      q.seniorAnswer.codeExample = update.seniorAnswer.codeExample;
      // Note: q.seniorAnswer.diagram is preserved intact!
    }
    count++;
  }
}

fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
console.log(`Realigned Part 1 successfully: ${count} questions updated in system-design-bank.json`);
