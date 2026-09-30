import fs from 'node:fs';
import path from 'node:path';

const filePath = path.resolve('src/features/interview/data/json/system-design-bank.json');
const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));

const batch3Updates = {
  'sys-051': {
    summary: 'Chính sách giải phóng bộ nhớ (Cache Eviction): **LRU (Least Recently Used)** loại bỏ phần tử lâu nhất không được truy cập (phù hợp 90% use case web/API); **LFU (Least Frequently Used)** loại bỏ phần tử có tần suất truy cập ít nhất (tối ưu cho video/nhạc trending ổn định); **TTL (Time-To-Live)** tự hủy sau khoảng thời gian cố định.',
    deepDive: 'Trong Redis, cấu hình `maxmemory-policy` quyết định hành vi khi đầy RAM: (1) `allkeys-lru`: Xóa key ít dùng gần nhất trên toàn bộ keyspace; (2) `volatile-lru`: Chỉ xóa trong số các key có đặt TTL; (3) `allkeys-lfu`: Đo bằng bộ đếm logarithmic counter (chống hiện tượng một đợt scan đột biến làm xóa nhầm các hot key thực sự); (4) `noeviction`: Báo lỗi OOM ngay khi ghi mới (phù hợp nếu Redis làm cơ sở dữ liệu chính).',
    codeExample: `# Cấu hình Redis Eviction Policy tối ưu cho Production Caching
maxmemory 4gb
maxmemory-policy allkeys-lru

# Số lượng key lấy mẫu ngẫu nhiên để xấp xỉ thuật toán LRU (5-10 là tối ưu)
maxmemory-samples 10`
  },

  'sys-052': {
    summary: 'Khi đơn hàng kẹt ở trạng thái `PENDING` do không nhận được IPN (Instant Payment Notification) từ cổng thanh toán (VNPAY/Momo/Stripe do rớt mạng), giải pháp là triển khai **Reconciliation Worker (Đối soát định kỳ)**: Worker chủ động gọi API truy vấn trạng thái đơn sang cổng thanh toán sau mỗi 5, 15, 30 phút.',
    deepDive: 'Quy trình giải quyết: (1) Khách hàng sau khi thanh toán được redirect về trang `order/success`: Frontend không hiển thị "thành công" ngay mà hiển thị "Đang xác thực giao dịch"; (2) Backend kích hoạt job kiểm tra trạng thái tức thì; (3) Song song, Cron Job quét các đơn `PENDING` quá 5 phút để gọi API đối soát; (4) Nếu cổng thanh toán xác nhận đã thu tiền -> Cập nhật `PAID`; Nếu cổng báo thất bại hoặc quá 60 phút không thanh toán -> Hủy đơn và trả lại tồn kho.',
    codeExample: `// Cron Job đối soát tự động các đơn hàng kẹt PENDING
export async function reconcilePendingPayments(db: Database, paymentGateway: PaymentGatewayClient) {
  // Tìm các đơn hàng pending từ 5 phút đến 60 phút trước
  const pendingOrders = await db.query(\`
    SELECT id, payment_trans_id, created_at 
    FROM orders 
    WHERE status = 'PENDING' 
      AND created_at < NOW() - INTERVAL '5 minutes'
      AND created_at > NOW() - INTERVAL '60 minutes'
  \`);

  for (const order of pendingOrders) {
    const status = await paymentGateway.queryTransactionStatus(order.payment_trans_id);
    if (status.code === 'SUCCESS') {
      await db.query("UPDATE orders SET status = 'PAID', paid_at = NOW() WHERE id = $1", [order.id]);
      await notificationService.sendPaymentSuccessEmail(order.id);
    } else if (status.code === 'FAILED' || status.code === 'EXPIRED') {
      await db.query("UPDATE orders SET status = 'CANCELLED' WHERE id = $1", [order.id]);
      await inventoryService.releaseReservedStock(order.id);
    }
  }
}`
  },

  'sys-053': {
    summary: 'Thiết kế luồng hoàn tiền (Refund) an toàn: Không bao giờ thực hiện hoàn tiền đồng bộ trong 1 HTTP request. Cần thiết kế giao dịch hai pha: (1) Kiểm tra tính hợp lệ và ghi nhận trạng thái `REFUND_PENDING` trong Database Ledger (sổ cái kép); (2) Đẩy yêu cầu hoàn tiền vào Message Queue để Worker gọi cổng thanh toán kèm **Idempotency Key**.',
    deepDive: 'Các thách thức lớn trong Refund: (1) Trừ tiền hai lần nếu mạng chập chờn khi gọi cổng thanh toán -> Bắt buộc dùng `refund_id` làm idempotency key; (2) Số dư tài khoản merchant không đủ để hoàn tiền -> Queue cần cơ chế retry và thông báo cho bộ phận Kế toán; (3) Không hoàn tiền mặt cho đơn thanh toán bằng thẻ/ví để chống rửa tiền (AML policy - bắt buộc hoàn đúng phương thức ban đầu).',
    codeExample: `// Luồng xử lý Hoàn tiền chuẩn Idempotent
export async function processRefund(orderId: string, amount: number, reason: string) {
  const refundId = \`ref_\${orderId}_\${Date.now()}\`;

  // 1. Ghi nhận giao dịch vào Sổ cái Kế toán (Double-entry Ledger)
  await db.transaction(async (tx) => {
    await tx.query(
      "INSERT INTO refunds (id, order_id, amount, status, reason) VALUES ($1, $2, $3, 'PENDING', $4)",
      [refundId, orderId, amount, reason]
    );
  });

  // 2. Đẩy vào Queue xử lý hoàn tiền với cổng thanh toán
  await refundQueue.add('execute-refund', {
    refundId,
    orderId,
    amount,
    idempotencyKey: refundId // Cổng thanh toán dùng key này để chống hoàn tiền lặp lại
  });
}`
  },

  'sys-054': {
    summary: 'Khi cho client upload trực tiếp lên S3: (1) **Chặn file sai loại/quá lớn**: Dùng **S3 Presigned POST Policy** (khống chế `content-length-range` ví dụ 1KB - 10MB và `Content-Type` ngay tại AWS S3); (2) **Biết upload đã xong**: Cấu hình **S3 Event Notification -> AWS EventBridge / SQS** bắn webhook về backend xác nhận file đã lưu thành công.',
    deepDive: 'Nếu dùng Presigned URL thông thường (PUT), S3 không kiểm soát được dung lượng tối đa người dùng tải lên, kẻ xấu có thể upload file 100GB gây tốn tiền lưu trữ. Dùng Presigned POST cho phép định nghĩa Policy có chữ ký số (Conditions Policy): S3 tự động từ chối ngay lập tức nếu file vượt quá dung lượng quy định hoặc sai MIME type mà không cần backend can thiệp.',
    codeExample: `// Sinh S3 Presigned POST với Policy ràng buộc dung lượng và loại file
import { createPresignedPost } from '@aws-sdk/s3-presigned-post';
import { S3Client } from '@aws-sdk/client-s3';

const s3 = new S3Client({ region: 'ap-southeast-1' });

export async function getSecureUploadPolicy(userId: string) {
  const key = \`avatars/\${userId}/\${Date.now()}.jpg\`;
  
  return await createPresignedPost(s3, {
    Bucket: 'user-uploads-bucket',
    Key: key,
    Conditions: [
      ['content-length-range', 1024, 5 * 1024 * 1024], // Giới hạn từ 1KB đến 5MB
      ['starts-with', '$Content-Type', 'image/']       // Bắt buộc là file ảnh
    ],
    Expires: 300 // Link hết hạn sau 5 phút
  });
}`
  },

  'sys-055': {
    summary: 'Trang danh sách sản phẩm tìm kiếm không dấu, lọc nhiều thuộc tính và sắp xếp: Tuyệt đối không dùng `LIKE %query%` trên RDBMS vì gây Full Table Scan làm sập DB. Giải pháp: Đồng bộ dữ liệu sang **ElasticSearch / OpenSearch** hoặc sử dụng PostgreSQL với extension `unaccent` kết hợp **GIN Trigram Index (`pg_trgm`)**.',
    deepDive: 'Kiến trúc giải pháp: (1) Lưu trữ gốc (Source of Truth) tại PostgreSQL; (2) Khi có sản phẩm mới hoặc cập nhật, bắn CDC event qua Kafka sang ElasticSearch; (3) ElasticSearch cấu hình Analyzer với ICU Analysis hoặc ASCII Folding để chuyển đổi tiếng Việt có dấu ("áo sơ mi") thành không dấu ("ao so mi"); (4) Các bộ lọc (Brand, Price range, Category) sử dụng Filter Context (tận dụng Bitset Caching cực nhanh trong Lucene).',
    codeExample: `-- PostgreSQL Full-Text Search không dấu với GIN Trigram Index
CREATE EXTENSION IF NOT EXISTS unaccent;
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Tạo cột tự động tính toán chuỗi tìm kiếm không dấu
ALTER TABLE products ADD COLUMN search_text TEXT 
GENERATED ALWAYS AS (unaccent(lower(name || ' ' || coalesce(description, '')))) STORED;

-- Tạo GIN Index hỗ trợ tìm kiếm siêu tốc
CREATE INDEX idx_products_search_gin ON products USING gin (search_text gin_trgm_ops);

-- Truy vấn sản phẩm (gõ 'ao so mi' vẫn match 'Áo Sơ Mi'):
SELECT id, name, price 
FROM products 
WHERE search_text LIKE '%ao so mi%' AND price BETWEEN 100000 AND 500000
ORDER BY created_at DESC 
LIMIT 20;`
  },

  'sys-056': {
    summary: 'Thiết kế hệ thống Audit Log (Biết ai sửa, sửa gì, lúc nào): Thiết kế bảng Audit Log dạng **Append-only (Chỉ thêm, cấm sửa, cấm xóa)**. Lưu trữ gồm: `actor_id` (người sửa), `entity_type` (Order), `entity_id`, `action` (UPDATE), `diff` (JSON lưu giá trị cũ `before` và giá trị mới `after`), và `timestamp`.',
    deepDive: 'Các phương án kỹ thuật: (1) **Database Triggers**: Tự động bắt mọi thay đổi ở tầng DB -> Đảm bảo không bị sót log dù ai can thiệp trực tiếp vào DB, nhưng tốn CPU database; (2) **Change Data Capture (CDC with Debezium & Kafka)**: Đọc Write-Ahead Log (WAL) của PostgreSQL và đẩy vào Kafka -> Không ảnh hưởng hiệu năng DB, scale tốt; (3) Tách riêng lưu trữ Audit Log sang cơ sở dữ liệu chuyên biệt (ClickHouse hoặc S3 Parquet) để phục vụ thanh tra pháp lý.',
    codeExample: `-- Schema bảng Audit Log chuẩn Enterprise
CREATE TABLE audit_logs (
    id BIGSERIAL PRIMARY KEY,
    actor_id UUID NOT NULL,               -- Ai thực hiện
    actor_ip VARCHAR(45) NOT NULL,
    entity_name VARCHAR(50) NOT NULL,     -- 'orders'
    entity_id VARCHAR(64) NOT NULL,       -- 'ord_12345'
    action VARCHAR(20) NOT NULL,          -- 'INSERT', 'UPDATE', 'DELETE'
    old_values JSONB,                     -- Giá trị trước khi sửa
    new_values JSONB,                     -- Giá trị sau khi sửa
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index phục vụ tra cứu lịch sử của 1 thực thể
CREATE INDEX idx_audit_entity ON audit_logs(entity_name, entity_id, created_at DESC);`
  },

  'sys-057': {
    summary: 'Xử lý thời gian đa múi giờ: **Quy tắc vàng: Luôn lưu trữ tất cả mốc thời gian trong Database theo chuẩn UTC (hoặc ISO 8601 `TIMESTAMPTZ`)**. Khi chốt báo cáo theo ngày giờ Việt Nam (UTC+7), chuyển đổi múi giờ bằng hàm `AT TIME ZONE \\\'Asia/Ho_Chi_Minh\\\'` ở câu truy vấn báo cáo.',
    deepDive: 'Lỗi chí mạng thường gặp: Lưu chuỗi ngày tháng local (`2026-09-30 00:00:00`) không kèm timezone, khiến hệ thống không thể tính toán chính xác khi người dùng ở Tokyo (UTC+9) hay London (UTC+0) thực hiện giao dịch. Với bài toán báo cáo chốt ngày: Ngày kinh doanh của Việt Nam bắt đầu từ `00:00:00 UTC+7` tương đương với `17:00:00 UTC` của ngày hôm trước.',
    codeExample: `-- Truy vấn Báo cáo doanh thu chốt chính xác theo ngày Việt Nam (UTC+7)
SELECT 
    -- Chuyển đổi timestamp UTC sang ngày Việt Nam
    DATE(created_at AT TIME ZONE 'Asia/Ho_Chi_Minh') AS report_date_vn,
    COUNT(id) AS total_orders,
    SUM(amount) AS total_revenue
FROM orders
WHERE created_at >= ('2026-09-01 00:00:00'::timestamp AT TIME ZONE 'Asia/Ho_Chi_Minh' AT TIME ZONE 'UTC')
  AND created_at <  ('2026-10-01 00:00:00'::timestamp AT TIME ZONE 'Asia/Ho_Chi_Minh' AT TIME ZONE 'UTC')
GROUP BY report_date_vn
ORDER BY report_date_vn ASC;`
  },

  'sys-058': {
    summary: 'Mỗi lần mở trang mà chạy `UPDATE posts SET views = views + 1` sẽ gây thảm họa **Row-level Lock Contention**: Khi bài viết viral có 10,000 người xem/giây, 10,000 transaction phải xếp hàng chờ lock của cùng 1 dòng dữ liệu, khiến DB nghẽn connection và sập. Giải pháp: Buffer bộ đếm trong **Redis In-Memory** và sync batch xuống DB.',
    deepDive: 'Luồng tối ưu: (1) Client xem trang -> Gọi API tăng view -> Server chạy lệnh `INCR post:views:{id}` trong Redis (thực thi trong RAM < 1ms, chịu tải 100k QPS); (2) Để tránh đếm trùng bot/F5 liên tục: Dùng Redis HyperLogLog (`PFADD post:unique_views:{id} {user_ip_or_id}`); (3) Tạo một Worker ngầm (Cron 1 phút/lần) gom các bài có view mới và chạy 1 câu SQL Batch Update duy nhất xuống Database.',
    codeExample: `// Worker gom Batch Update lượt xem từ Redis xuống Database
export async function flushViewsToDatabase(redis: Redis, db: Database) {
  const keys = await redis.keys('post:views:*');
  if (keys.length === 0) return;

  const updates: Array<{ id: number; views: number }> = [];
  for (const key of keys) {
    const views = parseInt((await redis.getset(key, '0')) || '0', 10);
    if (views > 0) {
      const postId = parseInt(key.replace('post:views:', ''), 10);
      updates.push({ id: postId, views });
    }
  }

  // 1 câu SQL gom hàng nghìn lượt update thành 1 transaction duy nhất
  if (updates.length > 0) {
    await db.query(\`
      UPDATE posts AS p SET views = p.views + u.views
      FROM (VALUES \${updates.map(u => \`(\${u.id}, \${u.views})\`).join(',')}) AS u(id, views)
      WHERE p.id = u.id;
    \`);
  }
}`
  },

  'sys-059': {
    summary: 'Ước lượng từ 10 triệu DAU (Daily Active Users): Giả định mỗi user xem 10 bài và đăng 1 bài mỗi ngày. **Read QPS** = (10M × 10) / 86,400 ≈ 1,160 QPS (Peak = ~3,500 QPS); **Write QPS** = (10M × 1) / 86,400 ≈ 116 QPS (Peak = ~350 QPS); **Dung lượng**: 10M bài đăng/ngày × 2KB ≈ 20 GB/ngày (7.3 TB/năm).',
    deepDive: 'Băng thông mạng: Nếu mỗi lượt đọc tải kèm 50KB JSON/ảnh thumbnail -> Băng thông đọc trung bình = 1,160 QPS × 50KB ≈ 58 MB/s (khoảng 464 Mbps). Lúc cao điểm (Peak factor = 3), băng thông đạt ~1.4 Gbps. Kết luận kiến trúc: Tầng Web Server cần ~10 instances, CDN là bắt buộc để gánh băng thông tĩnh, cơ sở dữ liệu Master gánh 350 Write QPS nhẹ nhàng, 2-3 Read Replicas là đủ cho 3,500 Read QPS.',
    codeExample: `// Bảng tính ước lượng năng lực hệ thống từ 10 triệu DAU
const estimationSummary = {
  activeUsers: '10,000,000 DAU',
  traffic: {
    averageReadQPS: '1,157 QPS',
    peakReadQPS: '3,472 QPS (Peak factor 3x)',
    averageWriteQPS: '116 QPS',
    peakWriteQPS: '350 QPS'
  },
  storage: {
    dailyData: '20 GB / ngày',
    yearlyData: '7.3 TB / năm (chưa tính backup)',
    fiveYearsStorage: '~36.5 TB (Cần Database Sharding hoặc Parquet Archiving)'
  },
  network: {
    peakBandwidth: '~1.4 Gbps (Phải offload sang Cloudflare/CloudFront CDN)'
  }
};`
  },

  'sys-060': {
    summary: 'Đo Latency trung bình (Average/Mean) gây hiểu lầm nghiêm trọng vì nó che giấu các ngoại lệ nguy hiểm (Outliers). Phân vị **p50** (Median - 50% người dùng trải nghiệm nhanh hơn mức này); **p95** (95% request nhanh hơn); **p99** (99% request nhanh hơn, chỉ 1% bị chậm nhất). SLA production luôn cam kết theo p95 hoặc p99.',
    deepDive: 'Tại sao p99 quan trọng? Nếu trung bình là 50ms nhưng p99 là 3,000ms: Có vẻ hệ thống nhanh, nhưng thực tế 1 trong số 100 người dùng phải chờ 3 giây. Đối với trang thương mại điện tử, 1 trang web phức tạp có thể gọi 50 API ngầm: Xác suất người dùng gặp ít nhất 1 request rơi vào p99 là $1 - (0.99)^{50} \\approx 39.5\\%$. Nghĩa là gần 40% khách hàng trải nghiệm trang web chậm chạp.',
    codeExample: `// Đo đạc và ghi nhận phân vị độ trễ Latency bằng Prometheus Metrics
import client from 'prom-client';

export const httpRequestDuration = new client.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Thời gian xử lý HTTP request theo phân vị',
  labelNames: ['method', 'route', 'status_code'],
  // Định nghĩa các buckets để tính toán p50, p90, p95, p99 chính xác
  buckets: [0.01, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5, 10]
});

// PromQL truy vấn độ trễ p99 trên Grafana:
// histogram_quantile(0.99, sum(rate(http_request_duration_seconds_bucket[5m])) by (le))`
  },

  'sys-061': {
    summary: '**SLI (Service Level Indicator)**: Chỉ số đo lường thực tế (vd: Latency thực tế đo được); **SLO (Service Level Objective)**: Mục tiêu nội bộ team cam kết đạt được (vd: 99.9% request có latency < 200ms); **SLA (Service Level Agreement)**: Cam kết pháp lý với khách hàng, nếu vi phạm sẽ bị phạt tiền.',
    deepDive: `Bảng quy đổi thời gian Downtime cho phép theo các cấp độ "9s":
- **99% (Two Nines)**: Cho phép sập 3.65 ngày/năm (7.2 giờ/tháng).
- **99.9% (Three Nines)**: Cho phép sập 8.76 giờ/năm (**43.8 phút/tháng**).
- **99.99% (Four Nines - Chuẩn High Availability)**: Cho phép sập 52.6 phút/năm (**4.38 phút/tháng**).
- **99.999% (Five Nines - Chuẩn Viễn thông/Ngân hàng)**: Cho phép sập 5.26 phút/năm (**26 giây/tháng**).`,
    codeExample: `// BẢNG QUY ĐỔI DOWNTIME THEO CHUẨN ĐỘ SẴN SÀNG (AVAILABILITY TABLE)
interface AvailabilityDowntime {
  '99.0%':  { perMonth: '7.2 giờ',    perYear: '3.65 ngày' };
  '99.9%':  { perMonth: '43.8 phút',  perYear: '8.76 giờ' };
  '99.99%': { perMonth: '4.38 phút',  perYear: '52.6 phút' };
  '99.999%':{ perMonth: '26.3 giây',  perYear: '5.26 phút' };
}`
  },

  'sys-062': {
    summary: 'Bước thiết kế API trong buổi phỏng vấn cần chốt 4 nội dung then chốt: (1) Resource URI chuẩn RESTful hoặc RPC (`POST /api/v1/orders`); (2) Headers quan trọng (`Idempotency-Key`, `Authorization`, `X-Request-Id`); (3) Payload Request & Response dạng JSON tối giản; (4) Chiến lược phân trang (Pagination: Cursor-based vs Offset-based).',
    deepDive: 'Kỹ sư Senior sẽ chủ động làm rõ các góc khuất khi chốt API: API này chạy đồng bộ (Synchronous trả về kết quả ngay) hay bất đồng bộ (Asynchronous trả về `202 Accepted` kèm `job_id` cho client polling hoặc nhận webhook)? Xử lý lỗi trả về mã HTTP chuẩn (400 Bad Request, 401 Unauthorized, 403 Forbidden, 409 Conflict, 429 Too Many Requests) thay vì luôn trả về 200 kèm `{ status: "error" }`.',
    codeExample: `// HỢP ĐỒNG API CHUẨN SENIOR (API SPECIFICATION CONTRACT)
/**
 * POST /api/v1/payments/charges
 * Headers:
 *   Idempotency-Key: uuid-v4
 *   Authorization: Bearer <token>
 * Request:
 *   { "orderId": "ord_123", "amount": 500000, "currency": "VND", "method": "CREDIT_CARD" }
 * Response (201 Created):
 *   { "chargeId": "chg_991", "status": "SUCCEEDED", "transactionTime": 1727654400 }
 * Response (409 Conflict):
 *   { "error": "IDEMPOTENCY_CONFLICT", "message": "Giao dịch đang được xử lý" }
 */`
  },

  'sys-063': {
    summary: 'Ở bước Data Model, kỹ sư quyết định: (1) Chọn Database Engine (SQL vs NoSQL vs In-Memory); (2) Định nghĩa Schema các thực thể chính và quan hệ; (3) Chọn Primary Key và Shard Key; (4) Thiết kế Index chiến lược. Căn cứ quyết định dựa trên: Access Patterns (Mô hình truy vấn Đọc/Ghi), Khối lượng dữ liệu và Ràng buộc toàn vẹn.',
    deepDive: 'Quy trình tư duy: Không thiết kế bảng theo cảm tính mà xuất phát từ "Access Patterns" (Câu hỏi: Hệ thống cần truy vấn dữ liệu như thế nào để phục vụ UI?). Nếu ứng dụng cần query tìm kiếm bạn bè chung -> Chọn Graph DB (Neo4j); Nếu cần đọc bảng tin người dùng trong 1 query -> Denormalize dữ liệu vào NoSQL Document; Nếu cần giao dịch chuyển khoản -> Bắt buộc thiết kế chuẩn hóa 3NF trên PostgreSQL/MySQL.',
    codeExample: `-- Căn cứ thiết kế Data Model dựa trên Access Pattern: "Tìm sản phẩm theo danh mục và giá"
CREATE TABLE products (
    id BIGSERIAL PRIMARY KEY,
    category_id INT NOT NULL,
    price NUMERIC(12, 2) NOT NULL,
    status VARCHAR(20) NOT NULL,
    metadata JSONB, -- Sử dụng JSONB linh hoạt cho các thuộc tính thay đổi theo ngành hàng
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index bám sát chính xác Access Pattern của người dùng
CREATE INDEX idx_products_category_price ON products (category_id, price) WHERE status = 'ACTIVE';`
  },

  'sys-064': {
    summary: 'Single Point of Failure (SPOF) là bất kỳ thành phần nào trong hệ thống mà nếu nó gặp sự cố, toàn bộ hệ thống sẽ ngừng hoạt động. Để rà soát SPOF, dò từng chặng trên sơ đồ kiến trúc từ ngoài vào trong: DNS -> CDN -> Load Balancer -> Web App -> Database -> Third-party APIs.',
    deepDive: 'Checklist triệt tiêu SPOF toàn diện: (1) Tầng DNS: Cấu hình Multi-DNS provider (Cloudflare + Route53); (2) Tầng Load Balancer: Chạy Active-Passive với Keepalived / VRRP hoặc AWS ALB đa Availability Zones; (3) Tầng App: Ít nhất 3 pods nằm trên các worker nodes khác nhau (Pod Anti-Affinity); (4) Tầng Database: Master-Slave tự động Failover (Patroni / Orchestrator); (5) Third-party (Cổng thanh toán/SMS): Triển khai Circuit Breaker và Fallback provider phụ.',
    codeExample: `# Kubernetes Pod Anti-Affinity: Ngăn chặn SPOF bằng cách cấm 2 pod chạy trên cùng 1 server vật lý
spec:
  affinity:
    podAntiAffinity:
      requiredDuringSchedulingIgnoredDuringExecution:
      - labelSelector:
          matchExpressions:
          - key: app
            operator: In
            values:
            - payment-service
        topologyKey: "kubernetes.io/hostname" # Bắt buộc mỗi pod nằm trên 1 máy chủ khác nhau`
  },

  'sys-065': {
    summary: 'Gọi service khác mà không đặt Timeout sẽ gây thảm họa **Thread Starvation (Cạn kiệt tài nguyên)**: Nếu service bên kia bị chậm hoặc treo mạng, các worker thread của service gọi sẽ bị giữ mở vô thời hạn, nhanh chóng làm cạn pool kết nối và kéo sập toàn bộ hệ thống.',
    deepDive: 'Cách chọn giá trị Timeout chuẩn SRE: Không đoán mò số ngẫu nhiên mà căn cứ vào phân vị độ trễ **p99 hoặc p99.9 của downstream service**: `Timeout = p99.9 + Network Jitter (50-100ms)`. Đồng thời phải áp dụng cơ chế **Deadline Propagation** (như trong gRPC): Nếu tổng thời gian cho phép của request từ Client là 2s, và tầng Gateway đã mất 500ms, thì deadline truyền tới service tiếp theo chỉ còn 1.5s.',
    codeExample: `// Cấu hình Timeout và AbortController chuẩn trong Node.js / Fetch
export async function callExternalServiceWithTimeout(url: string, payload: any, timeoutMs = 2000) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      signal: controller.signal // Tự động ngắt kết nối TCP nếu vượt quá timeoutMs
    });
    return await response.json();
  } catch (error: any) {
    if (error.name === 'AbortError') {
      throw new Error(\`Request tới \${url} bị Timeout sau \${timeoutMs}ms\`);
    }
    throw error;
  } finally {
    clearTimeout(timer);
  }
}`
  },

  'sys-066': {
    summary: 'Sticky Session (Session Affinity) là kỹ thuật của Load Balancer buộc mọi request của cùng một người dùng phải luôn được gửi về duy nhất một server backend cụ thể. **Nên tránh** vì phá vỡ tính phân phối tải đồng đều và làm mất session khi server đó sập; **Buộc phải dùng** khi duy trì ứng dụng Monolith cũ lưu state trong RAM (in-memory session).',
    deepDive: 'Hậu quả nguy hiểm của Sticky Session: (1) Bất đối xứng tải (Load Imbalance): Nếu 1 người dùng nặng (Heavy User/Crawler) bị gán vào Server A, server đó sẽ quá tải trong khi các server khác nhàn rỗi; (2) Cản trở Autoscaling: Không thể tắt server cũ để thu nhỏ cluster vì sẽ làm rớt phiên của user đang online. Giải pháp chuẩn Cloud-Native: Chuyển toàn bộ Session ra kho lưu trữ tập trung (Redis Cluster) hoặc dùng JWT Stateless.',
    codeExample: `# Kiến trúc khuyên dùng: Vô hiệu hóa Sticky Session trên Load Balancer
# Thay vì giữ session trên server, lưu session tập trung vào Redis Cluster
upstream stateless_backend {
    server 10.0.1.1:8080;
    server 10.0.1.2:8080;
    server 10.0.1.3:8080;
    # Không dùng ip_hash (sticky session), dùng least_conn để chia tải tối ưu
    least_conn;
}`
  },

  'sys-067': {
    summary: 'Hiện tượng "vừa lưu xong load lại không thấy" là do **Replication Lag (Trễ sao chép)**: Dữ liệu ghi vào Master thành công, nhưng request đọc ngay sau đó được Load Balancer điều hướng vào Read Replica chưa kịp đồng bộ bản ghi mới.',
    deepDive: 'Giải pháp đảm bảo tính nhất quán **Read-Your-Own-Writes**: (1) **Thời gian chờ (Time-window Routing)**: Sau khi user thực hiện thao tác Ghi, hệ thống gắn một cờ trong Cookie/Redis buộc mọi request Đọc của chính user đó trong vòng 5 giây tiếp theo phải query thẳng về Master; (2) **Version Token**: Master trả về một `replication_lsn` (Log Sequence Number), khi query Replica, client gửi kèm token này, nếu Replica chưa bắt kịp LSN thì fallback về Master.',
    codeExample: `// Middleware đảm bảo Read-Your-Own-Writes Consistency
export async function readRouter(req: Request, res: Response, next: NextFunction) {
  const userId = req.user?.id;
  const lastWriteTime = await redis.get(\`last_write:\${userId}\`);

  // Nếu user vừa thực hiện ghi dữ liệu trong vòng 5 giây gần nhất:
  if (lastWriteTime && Date.now() - parseInt(lastWriteTime, 10) < 5000) {
    req.dbClient = primaryDatabasePool; // Bắt buộc đọc từ Master
  } else {
    req.dbClient = replicaDatabasePool; // Đọc từ Replica để giảm tải Master
  }
  next();
}`
  },

  'sys-068': {
    summary: 'Khi đặt limit 100 req/phút trong bộ nhớ cục bộ (In-Memory) nhưng chạy 5 instances sau Load Balancer, mỗi instance đếm độc lập 100 -> người dùng có thể gửi $5 \\times 100 = 500$ req/phút. Để sửa lỗi: Phải chuyển bộ đếm Rate Limiting ra kho dữ liệu tập trung (**Redis In-Memory**) sử dụng thuật toán **Token Bucket** hoặc **Sliding Window Counter** qua Lua Script.',
    deepDive: 'Nếu dùng Redis bằng các lệnh riêng lẻ (`INCR` rồi `EXPIRE`), sẽ có race condition nguy hiểm: Nếu server sập giữa lệnh `INCR` và `EXPIRE`, key sẽ tồn tại vĩnh viễn không hết hạn. Bắt buộc phải đóng gói logic kiểm tra và tăng bộ đếm vào một **Redis Lua Script** duy nhất để đảm bảo tính nguyên tử (Atomicity) tuyệt đối trên toàn bộ cluster.',
    codeExample: `-- Redis Lua Script: Sliding Window Rate Limiting tập trung cho đa instance
-- KEYS[1]: rate_limit:user_123
-- ARGV[1]: thời điểm hiện tại (ms)
-- ARGV[2]: cửa sổ thời gian (ms, vd 60000 = 1 phút)
-- ARGV[3]: giới hạn tối đa (vd 100)

local now = tonumber(ARGV[1])
local window = tonumber(ARGV[2])
local limit = tonumber(ARGV[3])
local clear_before = now - window

-- 1. Xóa các request cũ ngoài cửa sổ thời gian
redis.call('zremrangebyscore', KEYS[1], '-inf', clear_before)

-- 2. Đếm số request trong cửa sổ hiện tại
local current_requests = redis.call('zcard', KEYS[1])

if current_requests < limit then
    -- Thêm request mới vào Sorted Set với score là timestamp hiện tại
    redis.call('zadd', KEYS[1], now, now)
    redis.call('pexpire', KEYS[1], window)
    return 1 -- Cho phép (Allowed)
else
    return 0 -- Bị chặn (429 Rate Limited)
end`
  },

  'sys-069': {
    summary: 'Message Queue làm phẳng đỉnh tải (Load Leveling / Peak Shaving) bằng cách đóng vai trò như một hồ chứa đệm: Tiếp nhận hàng chục nghìn request đột biến tức thời và giải phóng chúng cho các Consumer xử lý từ từ theo tốc độ ổn định của hệ thống. **Queue dài ra liên tục** là dấu hiệu tốc độ sản xuất (Produce Rate) vượt quá năng lực tiêu thụ (Consume Capacity), cảnh báo nguy cơ cạn kiệt bộ nhớ hoặc Consumer bị treo.',
    deepDive: 'Hành động khi Queue Lag tăng liên tục: (1) Kiểm tra Consumer có bị lỗi/treo DB connection không; (2) Kích hoạt Autoscaling mở rộng số lượng Consumer Pods; (3) Tăng batch size đọc từ Queue; (4) Nếu Queue đã chạm trần dung lượng: Kích hoạt cơ chế Backpressure hoặc từ chối bớt traffic ở tầng Gateway (Load Shedding) để bảo toàn hệ thống.',
    codeExample: `// Giám sát Consumer Lag của Apache Kafka bằng Prometheus Alert
// Alert rule bắn cảnh báo khi hàng đợi bị dồn ứ quá 10,000 tin nhắn trong 5 phút
groups:
- name: kafka-alerts
  rules:
  - alert: KafkaConsumerLagHigh
    expr: sum(kafka_consumergroup_lag{topic="orders-queue"}) by (consumergroup) > 10000
    for: 5m
    labels:
      severity: critical
    annotations:
      summary: "Consumer group {{ $labels.consumergroup }} bị nghẽn lag nghiêm trọng"`
  },

  'sys-070': {
    summary: 'Autoscaling nên dựa trên các **Leading Indicators (Chỉ số dự báo sớm)** như Request Queue Depth, Inflight Requests hoặc Custom Business Metrics thay vì chỉ dựa vào CPU/Memory (Lagging Indicators). Bật autoscaling mà vẫn lỗi lúc cao điểm là do **Độ trễ khởi động (Scaling Lag)**: VM/Pod mới mất 1-3 phút để khởi động và nạp cache, trong khi sóng traffic ập đến chỉ trong 10 giây.',
    deepDive: 'Hiện tượng nguy hiểm khác là **Flapping / Thrashing (Bật tắt liên tục)**: Pod scale lên làm tải CPU giảm -> hệ thống scale down ngay -> tải lại vọt lên -> scale up lại. Giải pháp: (1) Cấu hình `stabilizationWindowSeconds` (Cooldown period khoảng 300s); (2) Giữ sẵn Provisioned / Warm Pool instances; (3) Dùng KEDA (Kubernetes Event-driven Autoscaling) scale theo độ dài hàng đợi Kafka/SQS.',
    codeExample: `# Kubernetes HPA với Cửa sổ Ổn định (Cooldown Stabilization Window) chống Flapping
spec:
  behavior:
    scaleDown:
      stabilizationWindowSeconds: 300 # Chờ 5 phút ổn định trước khi quyết định scale down
      policies:
      - type: Percent
        value: 10
        periodSeconds: 60
    scaleUp:
      stabilizationWindowSeconds: 0   # Khi có sóng traffic: Scale up ngay lập tức
      policies:
      - type: Percent
        value: 100
        periodSeconds: 15`
  },

  'sys-071': {
    summary: 'Khi scale từ 4 lên 40 instance, mỗi instance giữ nguyên cấu hình Connection Pool (ví dụ 20 connections) thì tổng kết nối mở tới Database tăng vọt từ $4 \\times 20 = 80$ lên $40 \\times 20 = 800$ connections. PostgreSQL mặc định chỉ cho phép 100 kết nối, dẫn đến lỗi kinh điển **"FATAL: remaining connection slots are reserved for non-replication superuser connections"**.',
    deepDive: 'Mỗi kết nối trong PostgreSQL là một tiến trình OS riêng biệt (Process) tiêu tốn 5-10MB RAM và gây chi phí chuyển đổi ngữ cảnh (Context Switching) đắt đỏ cho CPU. Tăng `max_connections` lên 1,000 sẽ làm sập server do bão hòa I/O. Giải pháp kiến trúc bắt buộc: Đặt một **Connection Pooler chuyên dụng như PgBouncer hoặc AWS RDS Proxy** ở giữa: 40 instances backend kết nối tới PgBouncer, và PgBouncer chỉ duy trì một hồ bơi cố định 30-50 kết nối thật xuống PostgreSQL.',
    codeExample: `# SƠ ĐỒ CHUYỂN ĐỔI CONNECTION POOLING TRONG PRODUCTION

# ❌ TRƯỚC: Kết nối trực tiếp (40 instances x 20 conn = 800 connections -> SẬP DB)
# [40 App Pods] ------------ 800 connections ------------> [PostgreSQL (max: 100)]

# ✅ SAU: Dùng PgBouncer Transaction Mode (Chỉ mở 40 kết nối thật xuống DB)
# [40 App Pods] -- 800 virtual conn --> [PgBouncer Proxy] -- 40 real conn --> [PostgreSQL]`
  },

  'sys-072': {
    summary: 'Thiết kế Danh mục & Tìm kiếm Sản phẩm E-Commerce: Tách biệt hoàn toàn hai luồng: (1) **Quản lý danh mục (Category Tree)** sử dụng PostgreSQL với mô hình Closure Table hoặc Materialized Path để query cây cha/con đệ quy siêu tốc; (2) **Tìm kiếm và Lọc đa thuộc tính (Faceted Search)** sử dụng cụm ElasticSearch/OpenSearch hỗ trợ unaccent tiếng Việt, lọc giá và thương hiệu trong < 20ms.',
    deepDive: 'Đồng bộ dữ liệu: Khi admin sửa sản phẩm trong SQL, phát sự kiện CDC qua Debezium/Kafka để cập nhật document tương ứng trên ElasticSearch. Tầng hiển thị sử dụng Redis để cache kết quả tìm kiếm của 100 từ khóa hot nhất. Khi người dùng lọc theo nhiều tiêu chí (Màu sắc, Kích cỡ, Giá), ElasticSearch sử dụng `terms` aggregation để trả về số lượng sản phẩm tương ứng trong từng bộ lọc (Facet Counts) cho giao diện.',
    codeExample: `// Query tìm kiếm Faceted Search nâng cao trên ElasticSearch
const searchResponse = await elasticClient.search({
  index: 'products',
  body: {
    query: {
      bool: {
        must: [{ match: { name: { query: 'iphone 15', fuzziness: 'AUTO' } } }],
        filter: [
          { term: { category_id: 42 } },
          { range: { price: { gte: 15000000, lte: 30000000 } } }
        ]
      }
    },
    aggs: {
      brands: { terms: { field: 'brand.keyword' } },
      storage_options: { terms: { field: 'storage.keyword' } }
    }
  }
});`
  },

  'sys-073': {
    summary: 'Theo dõi vị trí Shipper thời gian thực: App Shipper gửi toạ độ GPS (Kinh độ, Vĩ độ) định kỳ mỗi 3-5 giây qua kết nối nhẹ **MQTT hoặc WebSocket**; Backend lưu toạ độ vào **Redis GEO** (`GEOADD`); Khách hàng mở app theo dõi nhận toạ độ shipper được push qua WebSocket hoặc query khoảng cách bằng lệnh `GEODIST` / `GEORADIUS`.',
    deepDive: 'Tối ưu hóa quy mô lớn (100,000 shipper cùng lúc): (1) Không lưu mọi toạ độ GPS vào SQL DB để tránh nghẽn I/O. Chỉ lưu toạ độ mới nhất vào Redis RAM; (2) Giảm tải mạng bằng thuật toán Dead Reckoning hoặc Kalman Filter trên client: Nếu shipper đứng yên hoặc đi thẳng, giảm tần suất gửi toạ độ; (3) Lưu vết hành trình (Trip History) dạng batch vào Time-Series Database (ClickHouse/TimescaleDB) sau khi đơn hoàn tất.',
    codeExample: `// Theo dõi vị trí Shipper Realtime bằng Redis GEO & WebSocket
import Redis from 'ioredis';
const redis = new Redis();

export class ShipperLocationService {
  // 1. Shipper cập nhật toạ độ GPS (gọi mỗi 3s qua WebSocket)
  public static async updateLocation(shipperId: string, lng: number, lat: number) {
    // Lưu toạ độ vào Redis Geospatial Set
    await redis.geoadd('active_shippers', lng, lat, shipperId);
    await redis.set(\`shipper:\${shipperId}:last_seen\`, Date.now(), 'EX', 60);
  }

  // 2. Tìm các shipper xung quanh điểm giao hàng trong bán kính 3km
  public static async findNearbyShippers(orderLng: number, orderLat: number): Promise<string[]> {
    return await redis.georadius('active_shippers', orderLng, orderLat, 3, 'km', 'ASC');
  }
}`
  },

  'sys-074': {
    summary: 'Thiết kế Chat 1-1 và Chat Nhóm: (1) **Thứ tự tin nhắn**: Dùng Snowflake ID hoặc bộ đếm tuần tự tăng dần (Monotonic Sequence ID) trên mỗi phòng chat; (2) **Trạng thái đã đọc (Read Receipts)**: Lưu `last_read_message_id` cho mỗi thành viên thay vì đánh dấu từng tin; (3) **Nhận tin khi Offline**: Lưu tin nhắn vào DB, khi thiết bị online trở lại thì sync qua Cursor Pagination (`id > last_synced_id`), kết hợp gửi Push Notification (FCM/APNs).',
    deepDive: 'Khác biệt kiến trúc giữa Chat 1-1 và Chat Nhóm lớn: Chat 1-1 có thể dùng Fanout-on-Write (ghi 2 bản sao vào hộp thư của người gửi và người nhận). Nhưng Chat Nhóm (Group Chat có 1,000 thành viên) phải dùng Fanout-on-Read: Tin nhắn chỉ lưu 1 bản duy nhất tại phòng chat (`group_messages`), các thành viên cùng đọc chung timeline của nhóm để tránh nhân bản dữ liệu 1,000 lần.',
    codeExample: `-- Schema Chat Nhóm hiệu năng cao tối ưu Cursor Sync
CREATE TABLE group_messages (
    group_id UUID NOT NULL,
    message_id BIGINT NOT NULL, -- Snowflake ID bảo đảm luôn tăng dần theo thời gian
    sender_id UUID NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    PRIMARY KEY (group_id, message_id)
);

-- Lấy tin nhắn mới nhất khi client online trở lại (Zero lag)
SELECT message_id, sender_id, content, created_at
FROM group_messages
WHERE group_id = 'grp_123' AND message_id > 172765400012345
ORDER BY message_id ASC
LIMIT 50;`
  },

  'sys-075': {
    summary: 'Thiết kế Bảng tin (News Feed) cho ứng dụng mới có vài trăm nghìn người dùng: Ưu tiên mô hình **Fanout-on-Read (Pull Model)** để tiết kiệm tài nguyên. Khi người dùng mở app, hệ thống truy vấn danh sách người đang theo dõi (Following list), query các bài viết mới nhất của họ, gộp lại (Merge Sort) và cache vào Redis Timeline của người đó.',
    deepDive: 'So sánh Fanout-on-Write (Push) vs Fanout-on-Read (Pull): Khi hệ thống còn nhỏ (< 1M users), Push model gây lãng phí dung lượng đĩa khổng lồ cho người dùng không hoạt động (Inactive users). Pull model giữ kiến trúc đơn giản, chi phí hạ tầng thấp. Tuy nhiên, khi xuất hiện Celebrity (người nổi tiếng có hàng triệu follower), ta chuyển sang mô hình Lai (Hybrid Model): Người dùng bình thường dùng Push, Celebrity dùng Pull để tránh sập hàng đợi.',
    codeExample: `// Fanout-on-Read: Tạo Timeline bản tin cho người dùng khi mở App
export async function generateUserFeed(userId: string, db: Database, redis: Redis): Promise<Post[]> {
  const cacheKey = \`feed:\${userId}\`;
  const cachedFeed = await redis.get(cacheKey);
  if (cachedFeed) return JSON.parse(cachedFeed);

  // 1. Lấy danh sách người user đang theo dõi
  const followees = await db.query('SELECT followee_id FROM user_follows WHERE follower_id = $1', [userId]);
  const followeeIds = followees.map(f => f.followee_id);

  // 2. Query 20 bài viết mới nhất từ những người này (Merge Sort)
  const posts = await db.query(\`
    SELECT * FROM posts 
    WHERE author_id = ANY($1) 
    ORDER BY created_at DESC 
    LIMIT 20
  \`, [followeeIds]);

  // 3. Cache Timeline trong 60 giây
  await redis.set(cacheKey, JSON.stringify(posts), 'EX', 60);
  return posts;
}`
  }
};

let count = 0;
data.forEach(q => {
  if (batch3Updates[q.id]) {
    const u = batch3Updates[q.id];
    q.seniorAnswer.summary = u.summary;
    q.seniorAnswer.deepDive = u.deepDive;
    q.seniorAnswer.codeExample = u.codeExample;
    count++;
  }
});

fs.writeFileSync(filePath, JSON.stringify(data, null, 2) + '\n', 'utf8');
console.log(`Updated ${count} questions in Batch 3.`);
