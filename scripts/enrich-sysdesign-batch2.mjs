import fs from 'node:fs';
import path from 'node:path';

const filePath = path.resolve('src/features/interview/data/json/system-design-bank.json');
const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));

const batch2Updates = {
  'sys-026': {
    summary: 'Để tránh bán lố (Overselling) trong Flash Sale khi hàng vạn người bấm mua cùng giây, giải pháp chuẩn là: Chặn đứng luồng ghi xuống SQL Database bằng cách quản lý tồn kho nguyên tử trên In-Memory Redis thông qua Lua Script (giảm tồn kho và ghi nhận order ID trong 1 atomic operation), sau đó đẩy order vào Message Queue để ghi DB ngầm.',
    deepDive: 'Nếu query `SELECT stock FROM products` rồi `UPDATE` trong SQL DB, dù có transaction lock thì hàng nghìn connection chờ lock sẽ đánh sập database connection pool. Bằng cách dùng Redis Lua Script, Redis thực thi đơn luồng (Single-threaded) đảm bảo phép trừ tồn kho là tuyệt đối nguyên tử và hoàn tất trong < 1ms. Khi tồn kho về 0, tất cả request sau bị từ chối ngay lập tức mà không hề chạm vào cơ sở dữ liệu.',
    codeExample: `-- Redis Lua Script: Trừ tồn kho nguyên tử chống Overselling
-- KEYS[1]: stock_key (vd: 'stock:item_123')
-- ARGV[1]: số lượng mua (vd: 1)
-- ARGV[2]: user_id

local current_stock = tonumber(redis.call('get', KEYS[1]) or '0')
local requested_qty = tonumber(ARGV[1])

if current_stock >= requested_qty then
    redis.call('decrby', KEYS[1], requested_qty)
    -- Ghi nhận user đã giữ hàng thành công vào Set để chống click trùng
    redis.call('sadd', 'reserved_users:' .. KEYS[1], ARGV[2])
    return 1 -- Thành công
else
    return 0 -- Hết hàng
end`
  },

  'sys-027': {
    summary: 'Khi tách Microservices từ Monolith, phương pháp an toàn nhất là áp dụng **Strangler Fig Pattern (Cây si bóp nghẹt)**: Không đập đi viết lại (Big Bang Rewrite), mà tách dần từng module độc lập (bắt đầu từ module ít phụ thuộc nhất hoặc module cần scale nhiều nhất như Notification, Auth, hoặc Catalog) ra service riêng và dùng API Gateway chuyển dần traffic.',
    deepDive: 'Quy trình 4 bước chuẩn SRE: (1) Đặt API Gateway phía trước Monolith; (2) Tách module mục tiêu ra service mới; (3) Đồng bộ dữ liệu hai chiều (CDC với Debezium hoặc Dual Write) giữa Monolith DB và Service DB; (4) Chuyển đổi traffic từ từ qua Canary (1% -> 10% -> 100%). Sau khi kiểm tra ổn định, xóa bỏ code cũ trong Monolith.',
    codeExample: `# Cấu hình Nginx / Envoy định tuyến theo Strangler Fig Pattern
# Giai đoạn chuyển đổi: Chuyển toàn bộ traffic /api/v1/notifications sang service mới
upstream monolith_cluster { server monolith.internal:8080; }
upstream notification_service { server notification.internal:3000; }

server {
    listen 80;
    location /api/v1/notifications {
        proxy_pass http://notification_service; # Đã tách thành công
    }
    location / {
        proxy_pass http://monolith_cluster;      # Vẫn chạy Monolith cũ
    }
}`
  },

  'sys-028': {
    summary: 'Để tránh trừ tiền hai lần khi người dùng bấm thanh toán lặp lại do lag mạng, giải pháp là áp dụng **Idempotency Key (Khóa bất biến)**: Client sinh một UUID duy nhất cho mỗi giao dịch và gửi trong Header `Idempotency-Key`. Server kiểm tra khóa này trong Redis/Database trước khi thực thi trừ tiền.',
    deepDive: 'Luồng hoạt động chuẩn Stripe: (1) Server nhận request có `Idempotency-Key`; (2) Dùng `SET key status:processing NX EX 120` trong Redis; (3) Nếu key đã tồn tại và status là `completed`, trả ngay kết quả cũ (Cached response) mà không gọi cổng thanh toán; (4) Nếu key đang `processing`, trả về 409 Conflict hoặc chờ; (5) Nếu là request mới, gọi Payment Gateway, lưu kết quả vào DB và cập nhật cache thành `completed`.',
    codeExample: `// Middleware xử lý Idempotency Key chống trừ tiền hai lần
export async function idempotencyMiddleware(req: Request, res: Response, next: NextFunction) {
  const idempotencyKey = req.header('Idempotency-Key');
  if (!idempotencyKey) return next();

  const cacheKey = \`idempotency:\${idempotencyKey}\`;
  // Atomic Lock: Lưu trạng thái PENDING trong 120 giây
  const isFirstRequest = await redis.set(cacheKey, JSON.stringify({ state: 'PENDING' }), 'EX', 120, 'NX');

  if (!isFirstRequest) {
    const existing = JSON.parse(await redis.get(cacheKey) || '{}');
    if (existing.state === 'PENDING') {
      return res.status(409).json({ error: 'Giao dịch đang được xử lý, vui lòng không gửi lại' });
    }
    return res.status(200).json(existing.response); // Trả lại kết quả cũ
  }

  // Hook ghi nhận response sau khi xử lý xong
  const originalJson = res.json.bind(res);
  res.json = (body) => {
    redis.set(cacheKey, JSON.stringify({ state: 'COMPLETED', response: body }), 'EX', 86400);
    return originalJson(body);
  };
  next();
}`
  },

  'sys-029': {
    summary: 'Khi Service Order gọi Service Payment mà bị Timeout (trạng thái bất định - In-doubt transaction), Order Service TUYỆT ĐỐI KHÔNG được tự ý đánh dấu Đơn hàng là FAILED hay SUCCESS, mà phải chuyển đơn hàng về trạng thái `PAYMENT_PENDING` và kích hoạt luồng đối soát (Reconciliation).',
    deepDive: 'Các bước xử lý chuẩn Enterprise: (1) Order Service chuyển trạng thái đơn sang `PAYMENT_PENDING`; (2) Lập lịch định kỳ (Scheduled Job) hoặc gửi event vào Delay Queue để gọi API kiểm tra trạng thái giao dịch (`GET /payments/status?order_id=...`) từ Payment Gateway; (3) Lắng nghe Webhook IPN từ phía cổng thanh toán; (4) Nếu sau 15-30 phút không thể xác nhận thanh toán, kích hoạt lệnh Hủy/Hoàn tác (Reverse/Void Payment) và giải phóng hàng tồn kho.',
    codeExample: `// Reconciliation Worker: Xử lý các đơn hàng bị timeout thanh toán
export async function reconcilePendingOrders() {
  const pendingOrders = await db.query(
    "SELECT id, payment_ref FROM orders WHERE status = 'PAYMENT_PENDING' AND updated_at < NOW() - INTERVAL '5 minutes'"
  );

  for (const order of pendingOrders) {
    const paymentStatus = await paymentGatewayClient.verifyTransaction(order.payment_ref);
    if (paymentStatus === 'SUCCESS') {
      await db.query("UPDATE orders SET status = 'PAID' WHERE id = $1", [order.id]);
    } else if (paymentStatus === 'NOT_FOUND' || paymentStatus === 'FAILED') {
      await db.query("UPDATE orders SET status = 'CANCELLED' WHERE id = $1", [order.id]);
      await inventoryService.releaseStock(order.id);
    }
  }
}`
  },

  'sys-030': {
    summary: 'Quyết định Tự xây (Build) hay Mua (Buy - Clerk, Auth0, Supabase): Chọn SaaS Auth khi cần Time-to-Market nhanh, cần chuẩn bảo mật quốc tế (SOC2, HIPAA, PCI-DSS, Passkeys, Multi-factor auth) và tập trung tài nguyên vào core business; Tự xây (Self-hosted/Custom JWT) khi chi phí MAU của SaaS vượt ngưỡng ngân sách (ví dụ > 500k active users) hoặc có yêu cầu chủ quyền dữ liệu on-premise khắt khe.',
    deepDive: 'Chi phí ngầm của việc tự xây Auth rất lớn: Không chỉ là lưu hash password (Argon2/Bcrypt) và sinh JWT, mà còn là xử lý Session Revocation phân tán, chống brute-force, gửi email reset password có rate limit, quản lý refresh token rotation, và tuân thủ các lỗ hổng OWASP liên tục xuất hiện. Khuyến nghị chuẩn cho Startup là dùng SaaS trước, thiết kế kiến trúc decoupled qua User Gateway để dễ dàng chuyển sang Custom Auth khi đạt quy mô lớn.',
    codeExample: `// Tiêu chí so sánh Build vs Buy hệ thống Xác thực
interface AuthEvaluationMatrix {
  selfHostedCustom: {
    monthlyCostAt100kMAU: '$100 (chi phí infra VPS)';
    engineeringEffort: '2-3 kỹ sư fulltime duy trì bảo mật, RFC standards';
    risks: 'Lỗ hổng zero-day, rò rỉ JWT secret, bảo trì MFA';
  };
  managedSaaS: {
    monthlyCostAt100kMAU: '$1,500 - $3,000 (theo MAU)';
    engineeringEffort: 'Tích hợp SDK trong 2 ngày';
    benefits: 'Tuân thủ SOC2 Type II, Passkeys/WebAuthn, Chống bot tự động';
  };
}`
  },

  'sys-031': {
    summary: 'Trong hệ thống 50 microservices, để tìm ra chính xác service gây lỗi 500 giữa hàng nghìn request, bắt buộc phải sử dụng **Distributed Tracing (W3C Trace Context / OpenTelemetry)**: Mỗi request được cấp một `trace_id` duy nhất tại API Gateway, được truyền qua HTTP Header (`traceparent`) và Message Queue tới tất cả các service hạ nguồn.',
    deepDive: 'Hệ thống cần 3 thành phần: (1) Tracer SDK tích hợp trên mỗi service để tự động tạo `span_id` và kế thừa `trace_id`; (2) Context Propagation: Truyền header `traceparent: 00-{trace_id}-{span_id}-01` qua mọi cuộc gọi gRPC, HTTP hoặc Kafka message header; (3) Tracing Collector (Jaeger, Zipkin hoặc Grafana Tempo) gom traces lại để hiển thị sơ đồ Gantt trực quan: nhìn thấy chính xác service nào phản hồi 500, stack trace chi tiết và latency của từng hop mạng.',
    codeExample: `// OpenTelemetry Context Propagation bằng TypeScript
import { trace, context, propagation } from '@opentelemetry/api';

// Khi gửi request sang service tiếp theo (Downstream)
async function callDownstreamService(url: string, payload: any) {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  // Bơm trace_id và span_id hiện tại vào header HTTP
  propagation.inject(context.active(), headers);

  return fetch(url, {
    method: 'POST',
    headers,
    body: JSON.stringify(payload)
  });
}`
  },

  'sys-032': {
    summary: 'Để upload video 2GB và xử lý transcode: Tuyệt đối KHÔNG đẩy file qua Web Server backend (gây nghẽn băng thông và tràn RAM). Giải pháp là: Client xin **S3 Presigned Multipart Upload URL** để tải trực tiếp lên Cloud Storage (S3/GCS); Sau khi upload xong, S3 phát sự kiện (S3 Event Notification) vào SQS Queue để Worker Pool (chạy FFmpeg) xử lý transcode ngầm.',
    deepDive: 'Luồng kiến trúc: (1) Client gọi API xin upload file 2GB -> Server chia nhỏ file thành các phần (vd: 10MB/part) và trả về danh sách Presigned Part URLs; (2) Client upload song song từng part lên S3; (3) Client gọi hoàn tất Multipart Upload; (4) S3 bắn Event vào SQS/Kafka; (5) Transcoding Workers (chạy trên GPU hoặc Spot instances) kéo video về, dùng FFmpeg nén thành các độ phân giải HLS (1080p, 720p, 480p với playlist `.m3u8`); (6) Lưu kết quả vào S3 Public và cập nhật DB.',
    codeExample: `// Khởi tạo Multipart Upload S3 an toàn từ Backend
import { S3Client, CreateMultipartUploadCommand, UploadPartCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

const s3 = new S3Client({ region: 'ap-southeast-1' });

export async function initiateVideoUpload(fileName: string, totalParts: number) {
  const multipart = await s3.send(new CreateMultipartUploadCommand({
    Bucket: 'user-videos-raw',
    Key: \`uploads/\${Date.now()}_\${fileName}\`,
    ContentType: 'video/mp4'
  }));

  const presignedUrls = await Promise.all(
    Array.from({ length: totalParts }, (_, i) =>
      getSignedUrl(s3, new UploadPartCommand({
        Bucket: 'user-videos-raw',
        Key: multipart.Key,
        UploadId: multipart.UploadId,
        PartNumber: i + 1
      }), { expiresIn: 3600 })
    )
  );

  return { uploadId: multipart.UploadId, key: multipart.Key, presignedUrls };
}`
  },

  'sys-033': {
    summary: 'Thiết kế hệ thống gửi Webhook đáng tin cậy: Sử dụng Message Queue (RabbitMQ / SQS / Redis Streams) để xử lý bất đồng bộ, áp dụng chiến lược **Exponential Backoff with Jitter** khi retry (thử lại sau 5s, 30s, 5m, 1h, 6h), và nếu đối tác vẫn sập sau 24h thì chuyển webhook vào **Dead-Letter Queue (DLQ)** để cảnh báo và cho phép retry thủ công.',
    deepDive: 'Các yếu tố cốt lõi: (1) Bảo mật: Ký payload bằng mã băm HMAC SHA-256 kèm secret key gửi trong header `X-Hub-Signature-256` để đối tác verify; (2) Idempotency: Gửi kèm `X-Webhook-Id` và `X-Webhook-Timestamp`; (3) Ngăn chặn Thảm họa DoS chính mình: Nếu đối tác đang sập, việc hàng nghìn worker retry cùng lúc sẽ gây nghẽn hàng đợi (Queue Head-of-Line Blocking), bắt buộc phải có Circuit Breaker theo từng đối tác (Per-endpoint Circuit Breaker).',
    codeExample: `// Thuật toán Exponential Backoff kèm Full Jitter cho Webhook Retry
export function calculateNextRetryDelay(attempt: number, baseMs = 1000, maxMs = 86400000): number {
  // Công thức: Full Jitter = random(0, min(maxMs, baseMs * 2^attempt))
  const exponential = Math.min(maxMs, baseMs * Math.pow(2, attempt));
  return Math.floor(Math.random() * exponential);
}

// Chuyển sang Dead-Letter Queue khi vượt quá 5 lần thất bại
export async function handleWebhookFailure(job: WebhookJob, error: Error) {
  if (job.attempts >= 5) {
    await dlqQueue.add('dead-letter-webhook', { job, failedAt: Date.now(), error: error.message });
    await alertOnCallEngineer(\`Webhook tới đối tác \${job.endpoint} đã đưa vào DLQ\`);
  } else {
    const delay = calculateNextRetryDelay(job.attempts);
    await retryQueue.add('retry-webhook', { ...job, attempts: job.attempts + 1 }, { delay });
  }
}`
  },

  'sys-034': {
    summary: 'Khi bảng `orders` đạt 50 triệu dòng và bắt đầu chậm, thứ tự tối ưu hóa chuẩn kỹ thuật: (1) Rà soát Index bằng `EXPLAIN ANALYZE` để bổ sung Composite Index chuẩn xác và xóa Unused Indexes; (2) Cấu hình Partitioning theo thời gian (Table Partitioning by Range `created_at`); (3) Tách dữ liệu nóng/lạnh (Archiving data cũ > 1 năm sang Cold Storage / S3 Parquet); (4) Triển khai Sharding theo `user_id` nếu quy mô tiếp tục tăng gấp 10 lần.',
    deepDive: 'Lỗi thường gặp là vội vàng Sharding khi chưa tối ưu Index và Partitioning. Bảng 50 triệu dòng trong PostgreSQL hay MySQL hoàn toàn có thể đạt latency < 5ms nếu: (1) Không bao giờ `SELECT *` hoặc đếm `COUNT(*)`; (2) Dùng Keyset / Cursor Pagination (`WHERE id < $last_id ORDER BY id DESC LIMIT 20`) thay thế `OFFSET 1000000`; (3) Partitioning bảng theo tháng giúp Query Optimizer chỉ quét partition tháng hiện tại (Partition Pruning), giảm kích thước B-Tree từ 20GB xuống 1GB nằm trọn trong RAM.',
    codeExample: `-- Tối ưu bảng Orders 50 triệu dòng với PostgreSQL Range Partitioning & Cursor Pagination
CREATE TABLE orders (
    id BIGSERIAL,
    user_id BIGINT NOT NULL,
    amount NUMERIC(10, 2) NOT NULL,
    status VARCHAR(20) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL,
    PRIMARY KEY (created_at, id)
) PARTITION BY RANGE (created_at);

-- Tạo Partition cho từng tháng (Partition Pruning loại bỏ 95% dữ liệu khi query)
CREATE TABLE orders_2026_09 PARTITION OF orders
    FOR VALUES FROM ('2026-09-01') TO ('2026-10-01');

-- Keyset Pagination: Luôn đạt < 2ms bất kể bảng có 50M hay 500M dòng
SELECT id, amount, status, created_at
FROM orders
WHERE created_at >= '2026-09-01' AND id < 50000000 -- Thay thế OFFSET đắt đỏ
ORDER BY id DESC
LIMIT 20;`
  },

  'sys-035': {
    summary: 'API Gateway là cổng vào duy nhất (Single Point of Entry) nằm giữa Client và cụm Microservices backend. Nó thực hiện các tác vụ xuyên suốt (Cross-cutting Concerns): Định tuyến động (Routing), Xác thực tập trung (Authentication/JWT verification), Giới hạn tần suất (Rate Limiting), Nén dữ liệu (SSL/Gzip), và Gom nhóm request (Request Aggregation/BFF).',
    deepDive: 'Nếu không có API Gateway, Client phải tự duy trì hàng chục kết nối tới các microservices khác nhau (gây ô nhiễm mạng di động và lộ topology private). API Gateway giải quyết bằng cách: Chuyển đổi giao thức công khai HTTP/JSON từ Client thành gRPC/Protobuf hiệu năng cao trong mạng nội bộ; Chặn đứng các cuộc tấn công DDoS trước khi chúng chạm tới microservices; và chuyển giao dữ liệu theo mô hình BFF (Backend-For-Frontend) tối ưu cho từng nền tảng Web/Mobile.',
    codeExample: `# Cấu hình Envoy Gateway: Routing + JWT Authentication + Rate Limiting
static_resources:
  listeners:
  - name: public_gateway
    address:
      socket_address: { address: 0.0.0.0, port_value: 443 }
    filter_chains:
    - filters:
      - name: envoy.filters.network.http_connection_manager
        typed_config:
          "@type": type.googleapis.com/envoy.extensions.filters.network.http_connection_manager.v3.HttpConnectionManager
          route_config:
            name: api_routes
            virtual_hosts:
            - name: api_service
              domains: ["api.company.com"]
              routes:
              - match: { prefix: "/orders" }
                route: { cluster: order_service_cluster, timeout: 3s }
              - match: { prefix: "/users" }
                route: { cluster: user_service_cluster, timeout: 2s }`
  },

  'sys-036': {
    summary: 'Service Mesh là tầng cơ sở hạ tầng chuyên dụng (Infrastructure Layer) quản lý giao tiếp Service-to-Service trong microservices. Nó sử dụng mô hình **Sidecar Proxy (như Envoy)** chạy kèm mỗi instance service để tự động hóa: Mã hóa mTLS hai chiều, Phân phối tải thông minh, Quản lý traffic (Canary, Blue-Green), và Giám sát Observability mà không cần sửa một dòng code ứng dụng.',
    deepDive: 'Sự khác biệt với API Gateway: API Gateway quản lý traffic North-South (Client ngoài vào Data Center); Service Mesh quản lý traffic East-West (giữa các microservice nội bộ). Khi hệ thống có hàng trăm microservices, việc tự viết code retry, circuit breaker, mTLS chứng chỉ trên nhiều ngôn ngữ (Java, Go, Node) là bất khả thi. Service Mesh trừu tượng hóa toàn bộ mạng thành phần mềm (Software-Defined Networking). Nhược điểm: Tăng độ trễ CPU và bộ nhớ (khoảng 1-3ms cho mỗi hop mạng qua sidecar).',
    codeExample: `# Istio VirtualService: Điều hướng Traffic Canary Deployment 90/10 giữa v1 và v2
apiVersion: networking.istio.io/v1alpha3
kind: VirtualService
metadata:
  name: payment-service-route
spec:
  hosts:
  - payment-service
  http:
  - route:
    - destination:
        host: payment-service
        subset: v1
      weight: 90 # 90% traffic chạy bản ổn định v1
    - destination:
        host: payment-service
        subset: v2
      weight: 10 # 10% traffic thử nghiệm bản mới v2`
  },

  'sys-037': {
    summary: 'Circuit Breaker Pattern là cơ chế ngắt mạch bảo vệ hệ thống trước sự cố sụp đổ dây chuyền (Cascading Failure). Nó hoạt động như cầu dao điện với 3 trạng thái: CLOSED (Hoạt động bình thường), OPEN (Ngắt hoàn toàn khi tỷ lệ lỗi vượt ngưỡng, trả về Fallback ngay lập tức mà không gọi service lỗi), và HALF-OPEN (Cho phép một số request thử nghiệm đi qua để kiểm tra khả năng phục hồi).',
    deepDive: 'Khi một service hạ nguồn bị chậm hoặc sập, nếu các service gọi tới tiếp tục retry và giữ connection mở, toàn bộ worker threads của hệ thống sẽ cạn kiệt, kéo sập toàn bộ các service khác. Circuit Breaker phát hiện ngưỡng lỗi (ví dụ: > 50% request bị lỗi trong 10s gần nhất) -> ngay lập tức mở mạch (OPEN) trong khoảng thời gian `cooldownPeriod` (ví dụ 30s) để service hạ nguồn có thời gian hồi phục, đồng thời trả về dữ liệu fallback (như cache cũ hoặc thông báo tạm bón).',
    codeExample: `// State Machine của Circuit Breaker bằng TypeScript
export class CircuitBreaker {
  private state: 'CLOSED' | 'OPEN' | 'HALF_OPEN' = 'CLOSED';
  private failureCount = 0;
  private lastFailureTime = 0;

  constructor(
    private threshold = 5,           // 5 lỗi liên tiếp là mở mạch
    private resetTimeoutMs = 15000   // Chờ 15s trước khi thử lại (HALF_OPEN)
  ) {}

  public async execute<T>(action: () => Promise<T>, fallback: () => T): Promise<T> {
    if (this.state === 'OPEN') {
      if (Date.now() - this.lastFailureTime > this.resetTimeoutMs) {
        this.state = 'HALF_OPEN'; // Thử nghiệm hồi phục
      } else {
        return fallback(); // Ngắt mạch: trả fallback ngay lập tức
      }
    }

    try {
      const result = await action();
      if (this.state === 'HALF_OPEN') this.state = 'CLOSED'; // Hồi phục hoàn toàn
      this.failureCount = 0;
      return result;
    } catch (err) {
      this.failureCount++;
      this.lastFailureTime = Date.now();
      if (this.failureCount >= this.threshold || this.state === 'HALF_OPEN') {
        this.state = 'OPEN'; // Ngắt mạch khẩn cấp
      }
      return fallback();
    }
  }
}`
  },

  'sys-038': {
    summary: 'Saga Pattern giải quyết bài toán Giao dịch phân tán (Distributed Transactions) trên nhiều microservices mà không dùng 2-Phase Commit (2PC) để tránh tắc nghẽn lock. Nó chia giao dịch lớn thành chuỗi các Local Transactions độc lập, nếu một bước thất bại, Saga sẽ kích hoạt các **Giao dịch bù trừ (Compensating Transactions)** để hoàn tác trạng thái theo chiều ngược lại.',
    deepDive: '2 hình thức triển khai Saga: (1) **Choreography (Phi tập trung)**: Các service trao đổi qua Event bus (Kafka/RabbitMQ), service này lắng nghe event của service kia để thực thi -> Đơn giản cho flow ngắn (2-3 bước), nhưng khó theo dõi và dễ rơi vào vòng lặp event khi hệ thống phức tạp; (2) **Orchestration (Tập trung)**: Sử dụng một Orchestrator trung tâm (Temporal, Cadence, hoặc Camunda) chỉ huy từng bước -> Dễ debug, trực quan hóa luồng nghiệp vụ và kiểm soát timeout chặt chẽ.',
    codeExample: `// Saga Orchestrator: Quản lý chuỗi giao dịch tạo đơn hàng & giao dịch bù trừ
export class CreateOrderSaga {
  private compensations: Array<() => Promise<void>> = [];

  public async execute(orderData: OrderData): Promise<boolean> {
    try {
      // Bước 1: Trừ tiền ví (Payment Service)
      await paymentService.charge(orderData.userId, orderData.amount);
      this.compensations.push(() => paymentService.refund(orderData.userId, orderData.amount));

      // Bước 2: Giữ hàng tồn kho (Inventory Service)
      await inventoryService.reserve(orderData.items);
      this.compensations.push(() => inventoryService.release(orderData.items));

      // Bước 3: Tạo vận đơn giao hàng (Shipping Service)
      await shippingService.createShipment(orderData);
      return true;
    } catch (error) {
      // Khi xảy ra lỗi: Thực thi toàn bộ giao dịch bù trừ theo thứ tự đảo ngược
      for (const compensate of this.compensations.reverse()) {
        await compensate().catch(err => console.error('Lỗi bù trừ thất bại, cần can thiệp:', err));
      }
      return false;
    }
  }
}`
  },

  'sys-039': {
    summary: 'Event-Driven Architecture (EDA) là kiến trúc trong đó các dịch vụ giao tiếp bất đồng bộ thông qua việc phát sinh (Produce), phát hiện (Route) và xử lý (Consume) các Sự kiện (Events). Lợi ích lớn nhất là tính Low-Coupling và khả năng mở rộng độc lập; Thách thức lớn nhất là Đảm bảo tính nhất quán cuối cùng (Eventual Consistency) và Nguy cơ mất event.',
    deepDive: 'Cạm bẫy nguy hiểm nhất trong EDA là lỗi "Dual-Write": Cập nhật Database thành công nhưng bắn Event lên Message Broker thất bại (hoặc ngược lại). Để giải quyết bài toán này, chuẩn công nghiệp bắt buộc phải dùng **Transactional Outbox Pattern**: Lưu Event vào cùng 1 bảng database `outbox_events` trong cùng một transaction nghiệp vụ, sau đó dùng Debezium (CDC) đọc Transaction Log của DB để bắn event lên Kafka với độ tin cậy At-Least-Once tuyệt đối.',
    codeExample: `-- Transactional Outbox Pattern: Đảm bảo nguyên tử giữa DB và Event Bus
BEGIN;

-- 1. Thao tác nghiệp vụ chính
UPDATE accounts SET balance = balance - 100 WHERE id = 'acc-123';

-- 2. Ghi Event vào bảng Outbox trong CÙNG TRANSACTION
INSERT INTO outbox_events (event_id, aggregate_type, payload, status, created_at)
VALUES (
    gen_random_uuid(),
    'ACCOUNT',
    '{"accountId": "acc-123", "amount": 100, "action": "DEBIT"}',
    'PENDING',
    NOW()
);

COMMIT; -- Nếu DB commit thành công, Event chắc chắn được lưu trữ`
  },

  'sys-040': {
    summary: 'Kafka và RabbitMQ giải quyết 2 bài toán khác nhau: RabbitMQ là Message Broker truyền thống dựa trên chuẩn AMQP, hoạt động theo mô hình Push (đẩy tin), hỗ trợ định tuyến thông minh (Topic, Fanout), tin nhắn bị xóa ngay sau khi ACK; Kafka là Distributed Streaming Platform hoạt động theo mô hình Pull (kéo tin), lưu trữ tin nhắn dạng Append-Only Commit Log trên đĩa cứng, có khả năng Replay lại tin nhắn cũ và chịu tải hàng triệu msg/s.',
    deepDive: 'Chọn RabbitMQ khi: Cần định tuyến phức tạp (Routing keys), hệ thống microservices giao tiếp transactional cần độ trễ cực thấp (< 1ms), tải vừa phải (< 50k msg/s). Chọn Kafka khi: Lưu vết sự kiện (Event Sourcing), phân tích dữ liệu lớn (Realtime Analytics / Big Data Streaming), xử lý log tập trung, hoặc khi cần nhiều Consumer Groups cùng đọc lại dữ liệu trong quá khứ mà không làm ảnh hưởng lẫn nhau.',
    codeExample: `// So sánh Producer giữa RabbitMQ (AMQP Routing) và Kafka (Partition Key)

// 1. RabbitMQ Producer: Định tuyến linh hoạt qua Exchange
await rabbitChannel.publish(
  'orders_exchange',
  'order.europe.electronics', // Routing Key
  Buffer.from(JSON.stringify(orderData))
);

// 2. Kafka Producer: Phân vùng dựa trên Partition Key để bảo toàn tuyệt đối thứ tự
await kafkaProducer.send({
  topic: 'orders-stream',
  messages: [{
    key: orderData.userId, // Đảm bảo mọi event của 1 user đi vào cùng 1 partition
    value: JSON.stringify(orderData)
  }]
});`
  },

  'sys-041': {
    summary: 'Serverless (FaaS - AWS Lambda, Google Cloud Functions) cho phép chạy code theo sự kiện mà không cần quản lý máy chủ, tự động scale từ 0 lên hàng nghìn instances và chỉ trả tiền khi code thực thi. Ưu điểm: Zero server management, chi phí cực rẻ cho ứng dụng có tải ngắt quãng; Nhược điểm: Cold Start latency, giới hạn thời gian chạy (15 phút), và làm cạn kiệt Connection Pool của Database.',
    deepDive: 'Thách thức lớn nhất của Serverless là cơ sở dữ liệu quan hệ: Mỗi Lambda function khi scale có thể mở 1 kết nối tới PostgreSQL, khi có 5,000 requests đồng thời, Postgres sẽ bị sập vì quá 5,000 connections (khắc phục bằng AWS RDS Proxy hoặc chuyển sang DynamoDB/ScyllaDB). Để giảm thiểu Cold Start, sử dụng Provisioned Concurrency, tối ưu kích thước bundle, hoặc sử dụng runtime có thời gian khởi động siêu tốc như Go, Rust hoặc Node.js esbuild.',
    codeExample: `# Serverless Framework config: Tối ưu Cold Start và kết nối Database
service: order-processor
provider:
  name: aws
  runtime: nodejs20.x
  timeout: 10
  environment:
    # Dùng RDS Proxy endpoint thay vì kết nối trực tiếp vào PostgreSQL host
    DB_PROXY_HOST: orders-db-proxy.proxy-xxxx.ap-southeast-1.rds.amazonaws.com
functions:
  processOrder:
    handler: src/handler.process
    provisionedConcurrency: 5 # Giữ sẵn 5 instances ấm để triệt tiêu Cold Start
    events:
      - sqs:
          arn: arn:aws:sqs:ap-southeast-1:123456789:order-queue
          batchSize: 10`
  },

  'sys-042': {
    summary: 'Tiêu chí chọn SQL vs NoSQL: Chọn SQL (PostgreSQL, MySQL) khi dữ liệu có cấu trúc chặt chẽ, cần bảo toàn toàn vẹn giao dịch ACID tuyệt đối (Tài chính, Đơn hàng, ERP), và yêu cầu truy vấn JOIN quan hệ phức tạp. Chọn NoSQL (MongoDB, Cassandra, DynamoDB) khi schema thường xuyên biến đổi, khối lượng ghi khổng lồ (IoT, Big Data, Logging), và cần mở rộng ngang (Horizontal Scale) không giới hạn.',
    deepDive: 'Quyết định kiến trúc dựa trên 4 yếu tố then chốt: (1) Mô hình dữ liệu (Document, Key-Value, Wide-Column, Graph vs Relational); (2) Tỷ lệ Đọc/Ghi; (3) Mức độ nhất quán (ACID vs BASE); (4) Khả năng scale: RDBMS scale ngang qua Sharding rất phức tạp và tốn kém, trong khi NoSQL (Cassandra/DynamoDB) được thiết kế cloud-native để phân tán dữ liệu tự động qua Consistent Hashing.',
    codeExample: `// MA TRẬN QUYẾT ĐỊNH CÔNG NGHỆ DATABASE
interface DatabaseDecisionGuide {
  PostgreSQL: 'Hệ thống tài chính, Core e-commerce, quan hệ phức tạp, hỗ trợ cả JSONB';
  MongoDB: 'Catalog sản phẩm linh hoạt, CMS nội dung, document lồng nhau';
  Apache_Cassandra: 'Ghi khối lượng siêu lớn (IoT metrics, tin nhắn chat), High Write Availability';
  Redis: 'In-memory caching, distributed locks, session management, rate limiter';
  Neo4j: 'Mạng lưới bạn bè, hệ thống gợi ý quan hệ sâu (Social graph, Fraud detection)';
}`
  },

  'sys-043': {
    summary: 'Database Indexing là cấu trúc dữ liệu phụ trợ (phổ biến nhất là B-Tree và LSM-Tree) giúp tăng tốc độ tìm kiếm bản ghi từ $O(N)$ (Full Table Scan) xuống $O(\log N)$. Đổi lại, Index làm chậm tốc độ của các thao tác Ghi (INSERT, UPDATE, DELETE) và tiêu tốn thêm dung lượng bộ nhớ RAM/Disk.',
    deepDive: 'B-Tree Index lưu trữ dữ liệu có thứ tự trong các Node cân bằng. Khi query sử dụng Composite Index `(A, B, C)`, nguyên tắc **Leftmost Prefix** bắt buộc: Query có thể dùng index nếu lọc theo `(A)`, `(A, B)` hoặc `(A, B, C)`, nhưng vô hiệu nếu chỉ lọc theo `(B)` hoặc `(C)`. Khái niệm quan trọng là **Covering Index**: Nếu tất cả các cột cần `SELECT` đều nằm trọn trong Index, DB có thể trả về kết quả ngay từ Index Tree (Index-Only Scan) mà không cần tốn Disk I/O truy xuất ngược về Table Data (Heap).',
    codeExample: `-- Tối ưu Covering Index trong PostgreSQL
-- Truy vấn mục tiêu: Lấy status và amount của user_id sắp xếp theo ngày
SELECT status, amount, created_at 
FROM orders 
WHERE user_id = 12345 
ORDER BY created_at DESC;

-- Tạo Covering Index sử dụng mệnh đề INCLUDE
CREATE INDEX idx_orders_user_created_covering 
ON orders (user_id, created_at DESC) 
INCLUDE (status, amount); -- Giúp DB đạt Index-Only Scan 100% (Zero Heap Fetch)`
  },

  'sys-044': {
    summary: 'Normalization (Chuẩn hóa - 1NF, 2NF, 3NF) phân rã dữ liệu thành nhiều bảng nhỏ để loại bỏ dư thừa và ngăn chặn bất thường khi cập nhật (Update Anomaly); Denormalization (Phi chuẩn hóa) cố tình sao chép thêm dữ liệu vào bảng để giảm thiểu số lượng phép JOIN, từ đó tăng vọt tốc độ đọc (Read Performance) trong các hệ thống quy mô lớn.',
    deepDive: 'Trade-off: Chuẩn hóa cao tối ưu cho thao tác Ghi (Write-optimized, không lo lệch dữ liệu), nhưng khi đọc phải JOIN 5-7 bảng khiến CPU database bão hòa. Phi chuẩn hóa tối ưu cho thao tác Đọc (Read-optimized, query 1 phát lấy hết), nhưng đánh đổi bằng việc tốn dung lượng đĩa và ứng dụng phải chịu trách nhiệm cập nhật đồng bộ ở nhiều nơi khi dữ liệu thay đổi (Eventual Consistency hoặc DB Triggers).',
    codeExample: `-- 1. CHUẨN HÓA (3NF): Tách bảng để tránh trùng lặp
CREATE TABLE users ( id BIGINT PRIMARY KEY, name VARCHAR(100) );
CREATE TABLE orders ( id BIGINT PRIMARY KEY, user_id BIGINT REFERENCES users(id), amount NUMERIC );
-- Khi đọc cần JOIN:
-- SELECT orders.*, users.name FROM orders JOIN users ON orders.user_id = users.id;

-- 2. PHI CHUẨN HÓA (Denormalization): Lưu thẳng user_name vào orders để loại bỏ JOIN
CREATE TABLE orders_denormalized (
    id BIGINT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    user_name VARCHAR(100) NOT NULL, -- Sao chép từ bảng users
    amount NUMERIC NOT NULL
);`
  },

  'sys-045': {
    summary: 'Blob Storage (Binary Large Object - như Amazon S3, Google Cloud Storage) là kho lưu trữ đối tượng chuyên dụng cho các file phi cấu trúc (ảnh, video, backup, tài liệu). Tuyệt đối không lưu file binary trực tiếp vào RDBMS (dưới dạng bytea/blob) vì sẽ làm phình to kích thước database, chậm backup/restore và bão hòa bộ nhớ cache RAM.',
    deepDive: 'Thiết kế chuẩn: Tách biệt Metadata và Data. Dữ liệu nhị phân (Binary) lưu trên S3 kết hợp với CDN (CloudFront/Cloudflare) để phân phối tới người dùng với độ trễ thấp và chi phí rẻ gấp 10 lần lưu trên SSD database. Cơ sở dữ liệu RDBMS chỉ lưu đường dẫn file (S3 URL / Object Key), kích thước, định dạng và các trường metadata tìm kiếm.',
    codeExample: `-- Schema thiết kế tách biệt giữa Metadata trong SQL và File Binary trên S3
CREATE TABLE user_attachments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    s3_bucket VARCHAR(64) NOT NULL,
    s3_key VARCHAR(512) NOT NULL,      -- Đường dẫn object: 'uploads/2026/09/uuid.pdf'
    content_type VARCHAR(100) NOT NULL,
    size_bytes BIGINT NOT NULL,
    uploaded_at TIMESTAMPTZ DEFAULT NOW()
);`
  },

  'sys-048': {
    summary: 'Ba trụ cột của Observability: **Metrics** (Số liệu tổng hợp định lượng theo thời gian: CPU, Error Rate, RPS - dùng để phát hiện bất thường và bắn cảnh báo Alerting); **Logs** (Bản ghi chi tiết các sự kiện có ngữ cảnh - dùng để đào sâu root cause); **Traces** (Hành trình request đi xuyên qua các microservices - dùng để phát hiện điểm nghẽn độ trễ và lỗi phân tán).',
    deepDive: 'Quy trình gỡ lỗi sự cố Production chuẩn mực: (1) **Metrics** kích hoạt cảnh báo On-call (ví dụ: Tỷ lệ lỗi 5xx vượt 5% hoặc Latency p99 của checkout > 1s); (2) Kỹ sư mở **Distributed Tracing** để định vị node bị nghẽn (thấy service Payment phản hồi chậm 800ms); (3) Sử dụng `trace_id` từ Trace để lọc **Logs** tập trung của Payment service, đọc chính xác dòng Exception hoặc timeout DB gây ra lỗi.',
    codeExample: `// Cấu trúc Structured Log chuẩn kết hợp Observability 3 trụ cột
{
  "timestamp": "2026-09-30T10:15:30.123Z",
  "level": "ERROR",
  "service": "payment-service",
  "trace_id": "4bf92f3577b34da6a3ce929d0e0e4736", // Liên kết với Tracing
  "span_id": "00f067aa0ba902b7",
  "message": "Cổng thanh toán Stripe phản hồi Timeout",
  "context": {
    "userId": "usr_9981",
    "orderId": "ord_5521",
    "amount": 250000,
    "elapsedMs": 5002
  },
  "error": {
    "name": "GatewayTimeoutError",
    "stack": "GatewayTimeoutError: Connect timeout at StripeClient.post..."
  }
}`
  },

  'sys-049': {
    summary: 'Thiết kế hệ thống gửi Webhook chuẩn Stripe/GitHub: (1) **Đảm bảo Delivery**: Đẩy event vào hàng đợi (Queue), gửi bất đồng bộ kèm Exponential Backoff Retry; (2) **Bảo mật**: Ký payload bằng HMAC SHA-256 bí mật gửi trong header `X-Signature`; (3) **Chống xử lý trùng**: Gửi kèm `Webhook-Event-ID` và khuyến nghị đối tác kiểm tra Idempotency.',
    deepDive: 'Các cạm bẫy thực tế: (1) Replay Attack: Kẻ tấn công chặn gói tin webhook hợp lệ và gửi lại liên tục -> Bổ sung timestamp vào chữ ký (`timestamp + "." + payload`) và từ chối nếu timestamp lệch quá 5 phút; (2) Timeout: Giới hạn timeout mỗi request webhook gửi đi tối đa 5 giây; (3) Slow Consumer: Khách hàng xử lý chậm làm nghẽn hàng đợi -> tách riêng queue theo từng đối tác hoặc dùng concurrency limiter.',
    codeExample: `// Thuật toán ký HMAC SHA-256 cho Webhook Payload chuẩn Stripe
import crypto from 'node:crypto';

export function signWebhookPayload(payload: string, secret: string): { timestamp: number; signature: string } {
  const timestamp = Math.floor(Date.now() / 1000);
  const signedPayload = \`\${timestamp}.\${payload}\`;
  const signature = crypto
    .createHmac('sha256', secret)
    .update(signedPayload)
    .digest('hex');

  return { timestamp, signature: \`t=\${timestamp},v1=\${signature}\` };
}

// Đối tác xác minh chữ ký:
export function verifyWebhookSignature(payload: string, header: string, secret: string): boolean {
  const [tPart, v1Part] = header.split(',');
  const timestamp = tPart.split('=')[1];
  const expectedSig = v1Part.split('=')[1];

  // Chống Replay Attack: Từ chối nếu quá 5 phút
  if (Math.abs(Math.floor(Date.now() / 1000) - parseInt(timestamp, 10)) > 300) return false;

  const actualSig = crypto.createHmac('sha256', secret).update(\`\${timestamp}.\${payload}\`).digest('hex');
  return crypto.timingSafeEqual(Buffer.from(actualSig), Buffer.from(expectedSig));
}`
  },

  'sys-050': {
    summary: 'Back-of-the-envelope capacity estimation là kỹ năng ước lượng nhanh quy mô hệ thống (QPS, Băng thông, Dung lượng đĩa, RAM cache) trong 5 phút đầu phỏng vấn. Các con số cơ bản cần nhớ: 1 ngày có ~86,400 giây (làm tròn 100,000 để tính nhẩm); 1 triệu request/ngày ≈ 12 QPS; Peak QPS = Average QPS × 2 (hoặc × 5).',
    deepDive: 'Khung công thức tính nhẩm Senior: (1) **Throughput**: $QPS = \\frac{DailyRequests}{86400}$; Peak $QPS = QPS \\times 2$; (2) **Storage**: $Dung lượng/ngày = DailyWrites \\times Kích thước bản ghi$; $Dung lượng 5 năm = Dung lượng/ngày \\times 365 \\times 5$; (3) **Bandwidth**: $Bandwidth = QPS \\times PayloadSize$; (4) **Cache RAM**: Áp dụng quy tắc Pareto 80/20 (20% dữ liệu chiếm 80% truy cập) -> $RAM = 20\\% \\times Tổng dung lượng đọc mỗi ngày$.',
    codeExample: `// BẢNG TÍNH ƯỚC LƯỢNG HỆ THỐNG (BACK-OF-THE-ENVELOPE SCRIPT)
function estimateCapacity(dau = 10_000_000, writesPerUser = 2, readRatio = 10, payloadKb = 2) {
  const SECONDS_PER_DAY = 86_400;
  
  const totalWrites = dau * writesPerUser;              // 20M writes/ngày
  const totalReads = totalWrites * readRatio;            // 200M reads/ngày
  
  const writeQps = Math.round(totalWrites / SECONDS_PER_DAY); // ~231 QPS
  const readQps = Math.round(totalReads / SECONDS_PER_DAY);   // ~2,314 QPS
  const peakReadQps = readQps * 2;                             // ~4,628 Peak QPS
  
  const dailyStorageGb = (totalWrites * payloadKb) / (1024 * 1024); // ~38.1 GB/ngày
  const fiveYearStorageTb = (dailyStorageGb * 365 * 5) / 1024;       // ~69.6 TB (5 năm)
  const cacheRamNeededGb = dailyStorageGb * 0.2;                     // ~7.6 GB RAM (quy tắc 80/20)

  return { writeQps, readQps, peakReadQps, dailyStorageGb, fiveYearStorageTb, cacheRamNeededGb };
}`
  }
};

let count = 0;
data.forEach(q => {
  if (batch2Updates[q.id]) {
    const u = batch2Updates[q.id];
    q.seniorAnswer.summary = u.summary;
    q.seniorAnswer.deepDive = u.deepDive;
    q.seniorAnswer.codeExample = u.codeExample;
    count++;
  }
});

fs.writeFileSync(filePath, JSON.stringify(data, null, 2) + '\n', 'utf8');
console.log(`Updated ${count} questions in Batch 2.`);
