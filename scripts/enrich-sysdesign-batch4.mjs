import fs from 'node:fs';
import path from 'node:path';

const filePath = path.resolve('src/features/interview/data/json/system-design-bank.json');
const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));

const batch4Updates = {
  'sys-076': {
    summary: 'Thiết kế Notification Engine đa kênh: (1) **Chọn kênh**: Dựa trên độ khẩn cấp (Khẩn: SMS/OTP; Vừa: Push notification; Thấp: Email); (2) **Chống Spam**: Đặt Rate Limit tối đa 3 push/giờ/user, gom thông báo tương tự (Notification Digesting); (3) **Xử lý nhà cung cấp lỗi**: Áp dụng Circuit Breaker và Fallback tự động giữa các bên thứ 3 (Twilio -> AWS SNS -> VNPT).',
    deepDive: 'Kiến trúc chia làm 3 tầng: Tầng Gateway (Nhận request và validate template); Tầng Priority Queue (Tách 3 queue riêng: High-priority cho OTP, Medium cho Order updates, Low cho Marketing) để tránh việc hàng triệu email marketing làm nghẽn mã OTP đăng nhập; Tầng Dispatcher Workers tích hợp Circuit Breaker, nếu nhà cung cấp SMS A báo lỗi hoặc timeout > 2s thì tự động chuyển sang nhà cung cấp SMS B.',
    codeExample: `// Priority Queue Dispatcher cho Hệ thống Thông báo đa kênh
import { Queue, Worker } from 'bullmq';

// Tách riêng 3 hàng đợi theo mức độ ưu tiên
export const highPriorityQueue = new Queue('notifications-critical'); // OTP, Cảnh báo bảo mật
export const standardQueue = new Queue('notifications-transactional'); // Cập nhật đơn hàng
export const lowPriorityQueue = new Queue('notifications-marketing');     // Khuyến mãi

// Worker xử lý gửi thông báo kèm Fallback Provider
export async function sendSMSWithFallback(phone: string, message: string) {
  try {
    return await primarySmsProvider.send(phone, message);
  } catch (error) {
    console.warn('Nhà mạng chính lỗi, chuyển sang provider dự phòng...');
    return await backupSmsProvider.send(phone, message);
  }
}`
  },

  'sys-077': {
    summary: 'Thiết kế luồng Upload và Xử lý ảnh/video từ App: (1) App xin S3 Presigned URL từ backend; (2) App upload file trực tiếp lên S3 bucket tạm (`raw-uploads`); (3) S3 bắn sự kiện vào SQS Queue; (4) Worker Pool kéo file về, dùng Sharp (cho ảnh: WebP, Thumbnail) hoặc FFmpeg (cho video: HLS/DASH đa độ phân giải); (5) Đẩy file đã tối ưu sang S3 Production và lưu CDN URL vào DB.',
    deepDive: 'Ưu điểm sống còn: Loại bỏ hoàn toàn tải upload file khỏi máy chủ backend API, server API không bao giờ bị cạn kiệt RAM do buffer video nặng. Để tối ưu trải nghiệm người dùng trên Mobile App: Sử dụng TUS Protocol (Resumable Upload) cho phép người dùng tiếp tục tải video nếu rớt mạng giữa chừng mà không cần upload lại từ đầu.',
    codeExample: `// Worker xử lý nén và cắt ảnh thumbnail tự động bằng Sharp
import sharp from 'sharp';
import { S3Client, GetObjectCommand, PutObjectCommand } from '@aws-sdk/client-s3';

export async function processImageUpload(s3: S3Client, rawBucket: string, key: string) {
  const getCmd = new GetObjectCommand({ Bucket: rawBucket, Key: key });
  const rawFile = await s3.send(getCmd);
  const buffer = Buffer.from(await rawFile.Body!.transformToByteArray());

  // Nén sang định dạng WebP hiện đại và tạo 2 kích thước (Full HD & Thumbnail)
  const [optimizedFull, thumbnail] = await Promise.all([
    sharp(buffer).resize(1920, 1080, { fit: 'inside' }).webp({ quality: 80 }).toBuffer(),
    sharp(buffer).resize(300, 300, { fit: 'cover' }).webp({ quality: 75 }).toBuffer()
  ]);

  // Upload lên S3 production
  await s3.send(new PutObjectCommand({ Bucket: 'prod-images', Key: \`optimized/\${key}.webp\`, Body: optimizedFull }));
  await s3.send(new PutObjectCommand({ Bucket: 'prod-images', Key: \`thumbnails/\${key}.webp\`, Body: thumbnail }));
}`
  },

  'sys-078': {
    summary: 'Đặt lịch khám bệnh (Tránh đặt trùng slot): Sử dụng PostgreSQL với tính năng **Range Types (`tsrange`)** kết hợp **Exclusion Constraints** (ngăn chặn hai khoảng thời gian trùng nhau ở tầng cơ sở dữ liệu), hoặc sử dụng **Pessimistic Locking (`SELECT FOR UPDATE`)** để khóa khung giờ trong giao dịch đặt chỗ.',
    deepDive: 'Nếu chỉ kiểm tra `SELECT COUNT(*) WHERE slot = ...` rồi `INSERT`, hai người dùng bấm đặt cùng mili-giây sẽ gây Race Condition khiến cả hai đều đặt thành công. Giải pháp 1: Khóa bi quan (`SELECT id FROM appointment_slots WHERE id = $1 AND is_booked = false FOR UPDATE`); Giải pháp 2 (Chuẩn nhất): Dùng PostgreSQL Exclusion Constraint `EXCLUDE USING gist (doctor_id WITH =, time_slot WITH &&)`. Ràng buộc này đảm bảo ở tầng nhân DB rằng không bao giờ có 2 lịch hẹn của cùng 1 bác sĩ giao nhau về mặt thời gian.',
    codeExample: `-- PostgreSQL Exclusion Constraint: Tuyệt đối chống trùng khung giờ khám
CREATE EXTENSION IF NOT EXISTS btree_gist;

CREATE TABLE doctor_appointments (
    id BIGSERIAL PRIMARY KEY,
    doctor_id INT NOT NULL,
    patient_id INT NOT NULL,
    slot TSRANGE NOT NULL, -- Khoảng thời gian khám: vd '[2026-09-30 09:00, 2026-09-30 09:30)'
    status VARCHAR(20) DEFAULT 'CONFIRMED',
    -- Ràng buộc loại trừ: Cấm trùng bác sĩ VÀ trùng khoảng thời gian (Toán tử &&)
    EXCLUDE USING gist (
        doctor_id WITH =,
        slot WITH &&
    )
);`
  },

  'sys-079': {
    summary: 'Màn hình "Chi tiết đơn hàng" cần dữ liệu từ Order, User, Payment, Shipping: Áp dụng mô hình **BFF (Backend-For-Frontend)** hoặc **API Gateway Aggregation**: Backend mở 1 endpoint tổng hợp (`GET /api/v1/orders/{id}/details`), gateway thực hiện gọi song song (Concurrent Requests via `Promise.all` hoặc gRPC) tới 4 microservices và gộp JSON trả về cho Client trong 1 round-trip duy nhất.',
    deepDive: 'Nếu để Mobile Client tự gọi 4 API riêng biệt: Tốn 4 round-trips trên sóng 4G/5G, hao pin, độ trễ cộng dồn và giao diện bị giật (Waterfall UI rendering). BFF giải quyết bằng cách chạy trong cùng Data Center (Local network latency < 1ms giữa các microservice): Gọi song song cả 4 service, áp dụng Timeout 500ms cho từng nhánh; nếu Shipping Service bị chậm, trả về chi tiết đơn hàng kèm shipping status "Đang tải..." (Graceful Degradation).',
    codeExample: `// BFF Pattern: Gọi song song 4 microservices bằng gRPC / HTTP
export async function getOrderDetailsBFF(orderId: string) {
  // 1. Lấy thông tin đơn hàng gốc trước
  const order = await orderService.getOrder(orderId);
  if (!order) throw new NotFoundError('Đơn hàng không tồn tại');

  // 2. Gọi song song 3 services còn lại với Promise.allSettled để tránh chết chùm
  const [userResult, paymentResult, shippingResult] = await Promise.allSettled([
    userService.getUserProfile(order.userId),
    paymentService.getPaymentStatus(order.paymentId),
    shippingService.getTrackingInfo(order.shippingCode)
  ]);

  return {
    order,
    user: userResult.status === 'fulfilled' ? userResult.value : null,
    payment: paymentResult.status === 'fulfilled' ? paymentResult.value : null,
    shipping: shippingResult.status === 'fulfilled' ? shippingResult.value : { status: 'UNKNOWN' }
  };
}`
  },

  'sys-080': {
    summary: 'Distributed Tracing theo dõi vòng đời của một request đi qua nhiều microservices phân tán: **Trace** là toàn bộ hành trình của request từ đầu đến cuối; **Span** là một đơn vị công việc nhỏ trong hành trình đó (một câu query DB, một lời gọi HTTP/gRPC). Context được truyền qua Message Queue thông qua **Message Headers** theo chuẩn W3C Trace Context (`traceparent`).',
    deepDive: 'Khi truyền qua HTTP, header `traceparent: 00-{trace_id}-{span_id}-01` được chèn vào request. Nhưng khi Producer bắn message vào Kafka/RabbitMQ, nếu không chèn trace context vào Message Metadata/Header thì chuỗi Trace sẽ bị đứt gãy. Khi Consumer nhận message từ Kafka, Tracer SDK sẽ đọc header này, thiết lập Trace ID cũ và tạo một Span con mới (Child Span) với quan hệ `FollowsFrom` để nối liền sơ đồ theo dõi.',
    codeExample: `// Bơm và trích xuất W3C Trace Context qua Kafka Message Headers
import { propagation, context } from '@opentelemetry/api';

// 1. PRODUCER: Bơm trace context vào Kafka Headers
export async function produceKafkaEvent(topic: string, payload: any) {
  const headers: Record<string, string> = {};
  propagation.inject(context.active(), headers); // Bơm 'traceparent'

  await kafkaProducer.send({
    topic,
    messages: [{
      value: JSON.stringify(payload),
      headers: Object.fromEntries(Object.entries(headers).map(([k, v]) => [k, Buffer.from(v)]))
    }]
  });
}`
  },

  'sys-081': {
    summary: 'Service Discovery giúp các microservices tự động tìm thấy địa chỉ IP và Port của nhau trong môi trường container động. **Khi đã chạy trên Kubernetes: Không cần Eureka hay Consul nữa**, vì Kubernetes đã có sẵn **Kube-DNS / CoreDNS** kết hợp **Kube-Proxy** (Service IP ảo ClusterIP tự động cân bằng tải tới các Pods qua iptables/IPVS).',
    deepDive: 'Consul/Eureka chỉ cần thiết khi: (1) Chạy trên máy chủ vật lý (Bare-metal) hoặc VM truyền thống không có Kubernetes; (2) Hệ thống lai (Hybrid Cloud: một nửa microservice chạy trên AWS K8s, một nửa chạy ở Data Center on-premise cần chung một danh bạ service discovery); (3) Cần các tính năng nâng cao của Consul như Key-Value config store tập trung hoặc WAN multi-datacenter federation.',
    codeExample: `# Kubernetes Service: Tự động hóa Service Discovery hoàn toàn
apiVersion: v1
kind: Service
metadata:
  name: payment-service # Tên DNS nội bộ: payment-service.default.svc.cluster.local
spec:
  selector:
    app: payment-app
  ports:
  - protocol: TCP
    port: 80
    targetPort: 8080
# Các service khác chỉ cần gọi http://payment-service:80 là CoreDNS tự định tuyến`
  },

  'sys-082': {
    summary: 'Thiết kế hệ thống Chat thời gian thực (Real-time Chat): (1) Kết nối hai chiều liên tục qua **WebSocket Gateway Cluster**; (2) Định tuyến tin nhắn giữa các máy chủ bằng **Redis Pub/Sub hoặc Kafka**; (3) Lưu trữ tin nhắn vĩnh viễn trên cơ sở dữ liệu tối ưu ghi nặng (**ScyllaDB / Cassandra / PostgreSQL**); (4) Quản lý trạng thái online/offline qua **Redis In-Memory**.',
    deepDive: 'Thách thức đa máy chủ (Multi-server WebSocket routing): Người dùng A kết nối tới WebSocket Server 1, Người dùng B kết nối tới WebSocket Server 2. Khi A gửi tin cho B: Server 1 không thể push trực tiếp. Giải pháp: Server 1 bắn event vào Redis Channel `user:B`. Server 2 (đang giữ socket của B) subscribe channel này sẽ nhận được tin nhắn và push xuống thiết bị của B qua kết nối WebSocket đang mở.',
    codeExample: `// Kiến trúc định tuyến WebSocket đa server qua Redis Pub/Sub
import { WebSocketServer, WebSocket } from 'ws';
import Redis from 'ioredis';

const redisSub = new Redis();
const redisPub = new Redis();
const localSockets = new Map<string, WebSocket>(); // userId -> socket

export function setupChatServer(wss: WebSocketServer) {
  wss.on('connection', (ws, req) => {
    const userId = getUserIdFromReq(req);
    localSockets.set(userId, ws);

    // Lắng nghe tin nhắn từ Redis Pub/Sub gửi riêng cho user này
    redisSub.subscribe(\`user:\${userId}\`);

    ws.on('message', async (data) => {
      const { toUserId, content } = JSON.parse(data.toString());
      // Lưu tin vào DB trước
      await saveMessageToDb(userId, toUserId, content);
      // Bắn qua Redis Pub/Sub để tìm server đang giữ socket của toUserId
      await redisPub.publish(\`user:\${toUserId}\`, JSON.stringify({ from: userId, content }));
    });
  });

  redisSub.on('message', (channel, message) => {
    const userId = channel.replace('user:', '');
    const clientSocket = localSockets.get(userId);
    if (clientSocket && clientSocket.readyState === WebSocket.OPEN) {
      clientSocket.send(message); // Push tức thì xuống máy người dùng
    }
  });
}`
  },

  'sys-083': {
    summary: 'Thiết kế Cuộn vô tận (Infinite Scroll Feed): **Tuyệt đối KHÔNG dùng Offset Pagination (`LIMIT 20 OFFSET 1000`)** vì gây Full Table Scan và bị nhảy dòng (Duplicate/Skip items) khi có bài đăng mới. Giải pháp: Bắt buộc sử dụng **Keyset Pagination (Cursor-based Pagination)** dựa trên `(created_at, id)` hoặc Snowflake ID.',
    deepDive: 'Tại sao Offset Pagination thất bại trong Social Feed? Nếu user đang xem trang 1, có 5 bài đăng mới xuất hiện, khi user cuộn xuống trang 2 (`OFFSET 20`), các bài viết bị đẩy lùi và user sẽ thấy lại 5 bài của trang 1 (Duplicate content). Với Cursor Pagination: Client gửi request kèm con trỏ của bài viết cuối cùng (`?cursor=1727654000_post123`). Backend query: `WHERE created_at < $cursor ORDER BY created_at DESC LIMIT 20`, luôn ổn định và đạt latency < 5ms.',
    codeExample: `// Keyset Cursor Pagination cho Infinite Scroll Feed
export async function getInfiniteFeed(cursor?: string, limit = 20) {
  let query = 'SELECT id, title, content, created_at FROM posts ';
  const params: any[] = [limit];

  if (cursor) {
    const decodedDate = new Date(parseInt(cursor, 10));
    query += 'WHERE created_at < $2 ORDER BY created_at DESC LIMIT $1';
    params.push(decodedDate);
  } else {
    query += 'ORDER BY created_at DESC LIMIT $1';
  }

  const posts = await db.query(query, params);
  const nextCursor = posts.length > 0 ? posts[posts.length - 1].created_at.getTime().toString() : null;
  return { posts, nextCursor, hasMore: posts.length === limit };
}`
  },

  'sys-084': {
    summary: 'Thiết kế Trình tạo Biểu mẫu kéo thả (Drag & Drop Form Builder): (1) Mô hình hóa Form dưới dạng **Cây cấu trúc trừu tượng (JSON Schema / AST)** mô tả layout, validation rules và fields; (2) Tầng Render (Dynamic Form Engine) đệ quy duyệt cây JSON để sinh UI components tương ứng; (3) Lưu trữ kết quả nộp bài (Submissions) trong cơ sở dữ liệu **PostgreSQL JSONB** hoặc MongoDB.',
    deepDive: 'Thách thức lớn nhất là Validation động và Thay đổi phiên bản (Form Versioning): Người dùng có thể sửa form (thêm/xóa câu hỏi) sau khi đã có hàng nghìn lượt điền. Giải pháp: Mỗi khi Admin xuất bản (Publish) form, hệ thống tăng `version` (vd: `v1`, `v2`). Khi người dùng submit, dữ liệu được gắn chặt với `form_id` và `version` tại thời điểm đó để đảm bảo tính toàn vẹn dữ liệu lịch sử.',
    codeExample: `// Cấu trúc JSON Schema của Form Builder kéo thả
interface FormSchemaDefinition {
  id: string;
  title: string;
  version: number;
  fields: Array<{
    id: string;
    type: 'text' | 'select' | 'checkbox' | 'date';
    label: string;
    placeholder?: string;
    required: boolean;
    validation?: { regex?: string; min?: number; max?: number };
    options?: Array<{ label: string; value: string }>; // Dành cho select/radio
  }>;
}`
  },

  'sys-085': {
    summary: 'Data Partitioning: **Horizontal Partitioning (Sharding)** chia tách bảng theo các hàng (Rows) sang nhiều bảng hoặc server khác nhau; **Vertical Partitioning** chia tách bảng theo các cột (Columns), đưa các cột ít dùng hoặc dữ liệu nặng (TEXT/BLOB) sang bảng riêng. Chiến lược Partitioning phổ biến gồm Range, Hash, List và Composite.',
    deepDive: 'Mục đích cốt lõi của Partitioning: (1) Cải thiện hiệu năng đọc qua cơ chế **Partition Pruning** (Trình tối ưu query chỉ quét partition chứa dữ liệu cần tìm, bỏ qua 90% dữ liệu còn lại); (2) Quản lý vòng đời dữ liệu siêu tốc: Thay vì chạy `DELETE FROM logs WHERE created_at < "2025-01-01"` (rất chậm và làm phân mảnh bảng), ta chỉ cần chạy lệnh `DROP TABLE logs_2024` trong 1 mili-giây.',
    codeExample: `-- PostgreSQL Partitioning theo Danh mục (List Partitioning)
CREATE TABLE customer_orders (
    order_id BIGSERIAL,
    country_code VARCHAR(2) NOT NULL,
    total_amount NUMERIC(12, 2) NOT NULL,
    PRIMARY KEY (country_code, order_id)
) PARTITION BY LIST (country_code);

-- Phân vùng dữ liệu theo từng khu vực địa lý
CREATE TABLE orders_vietnam PARTITION OF customer_orders FOR VALUES IN ('VN');
CREATE TABLE orders_singapore PARTITION OF customer_orders FOR VALUES IN ('SG');
CREATE TABLE orders_others PARTITION OF customer_orders DEFAULT;`
  },

  'sys-086': {
    summary: 'Time-Series Database (TSDB: TimescaleDB, InfluxDB, ClickHouse) là cơ sở dữ liệu chuyên biệt tối ưu cho dữ liệu chuỗi thời gian (IoT sensor, Server metrics, Crypto ticks). TSDB vượt trội RDBMS nhờ: Tốc độ ghi Append-only cực lớn, Thuật toán nén chuyên dụng (Gorilla/Delta-of-delta nén giảm 90% dung lượng) và Tự động tổng hợp dữ liệu (Downsampling/Rollups).',
    deepDive: 'Tại sao RDBMS sập khi lưu Time-series? Dữ liệu time-series có khối lượng hàng triệu bản ghi/ngày và không bao giờ bị UPDATE. Trong RDBMS, việc duy trì cây B-Tree cho hàng tỷ bản ghi khiến index không thể nằm vừa trong RAM, làm sập tốc độ ghi. TSDB giải quyết bằng kiến trúc **LSM-Tree** hoặc Chunking theo thời gian: Dữ liệu được ghi thẳng vào Memory Table và nén thành các Immutable Data Blocks tuần tự trên đĩa.',
    codeExample: `-- TimescaleDB: Tạo Hypertable tự động Chunking theo thời gian
CREATE TABLE server_metrics (
    recorded_at TIMESTAMPTZ NOT NULL,
    server_id INT NOT NULL,
    cpu_percent REAL,
    memory_used_mb BIGINT
);

-- Biến bảng thông thường thành Hypertable (tự động phân chia 7 ngày 1 chunk)
SELECT create_hypertable('server_metrics', 'recorded_at', chunk_time_interval => INTERVAL '7 days');

-- Tự động nén dữ liệu cũ hơn 30 ngày để tiết kiệm 90% dung lượng đĩa
ALTER TABLE server_metrics SET (timescaledb.compress, timescaledb.compress_segmentby = 'server_id');
SELECT add_compression_policy('server_metrics', INTERVAL '30 days');`
  },

  'sys-087': {
    summary: '**Data Lake** (S3, GCS, HDFS) lưu trữ dữ liệu thô (Raw Data) ở mọi định dạng (chưa cấu trúc, bán cấu trúc, JSON, Log, Ảnh) theo nguyên tắc **Schema-on-Read**; **Data Warehouse** (Snowflake, BigQuery, Redshift) lưu trữ dữ liệu đã qua làm sạch, chuẩn hóa và mô hình hóa (Star/Snowflake Schema) theo nguyên tắc **Schema-on-Write** phục vụ BI và báo cáo phân tích.',
    deepDive: 'Xu hướng kiến trúc hiện đại kết hợp cả hai thành **Data Lakehouse** (tiêu biểu là Apache Iceberg, Delta Lake): Dữ liệu thô từ Kafka/RDBMS đổ về S3 Data Lake dưới định dạng Parquet nén; Tầng Lakehouse bổ sung giao dịch ACID, Time-travel và Data Versioning ngay trên S3, cho phép các engine như Trino/Spark/ClickHouse truy vấn trực tiếp với hiệu năng tương đương Data Warehouse nhưng chi phí rẻ hơn nhiều lần.',
    codeExample: `// SO SÁNH DATA LAKE VS DATA WAREHOUSE
interface DataStorageArchitecture {
  dataLake: {
    format: 'Parquet, ORC, JSON, CSV, MP4, Audio';
    cost: 'Rất rẻ ($0.023/GB/tháng trên S3 Standard)';
    philosophy: 'Lưu trước, phân tích cấu trúc sau (Schema-on-Read)';
    targetAudience: 'Data Engineers, Machine Learning Researchers';
  };
  dataWarehouse: {
    format: 'Bảng có quan hệ, cột nén tối ưu (Columnar storage)';
    cost: 'Đắt hơn ($20-$50/TB query hoặc compute nodes)';
    philosophy: 'Làm sạch trước khi lưu (Schema-on-Write)';
    targetAudience: 'Business Analysts, C-level Dashboard, SQL Queries';
  };
}`
  },

  'sys-088': {
    summary: 'Change Data Capture (CDC) là kỹ thuật theo dõi và bắt trọn từng sự kiện thay đổi dữ liệu (INSERT, UPDATE, DELETE) ở cấp độ **Write-Ahead Log (WAL / Binlog)** của cơ sở dữ liệu và phát tán sự kiện đó sang các hệ thống khác (Kafka, ElasticSearch, Data Lake) theo thời gian thực mà không làm giảm hiệu năng của database.',
    deepDive: 'Tại sao CDC vượt trội so với Polling Database? Nếu dùng Cron Polling (`SELECT * WHERE updated_at > last_time`): Tốn CPU DB, không bắt được các thao tác DELETE (vì bản ghi đã mất), và có độ trễ lớn. Công cụ CDC chuẩn công nghiệp là **Debezium**: Đóng vai trò như một Replica giả lập, đọc trực tiếp binary log của PostgreSQL/MySQL, biến mỗi thao tác thành một Event JSON đẩy vào Kafka với độ trễ < 100ms.',
    codeExample: `// Cấu hình Debezium CDC Connector cho PostgreSQL
{
  "name": "orders-cdc-connector",
  "config": {
    "connector.class": "io.debezium.connector.postgresql.PostgresConnector",
    "plugin.name": "pgoutput",
    "database.hostname": "postgres.internal",
    "database.port": "5432",
    "database.dbname": "production_db",
    "table.include.list": "public.orders",
    "topic.prefix": "cdc_events",
    "tombstones.on.delete": "true" // Phát sự kiện tombstone khi có bản ghi bị DELETE
  }
}`
  },

  'sys-089': {
    summary: 'Thiết kế URL Shortener (như Bit.ly): Chuyển đổi một ID số nguyên duy nhất thành chuỗi rút gọn bằng mã hóa **Base62 (a-z, A-Z, 0-9)**. Dùng mã HTTP **301 (Moved Permanently)** nếu muốn tối ưu tốc độ nhờ CDN/Trình duyệt tự cache; dùng mã HTTP **302 (Found / Temporary Redirect)** nếu muốn mọi lượt click đều đi qua server để thu thập Analytics.',
    deepDive: 'Tránh đụng độ ID phân tán: Để sinh ID số nguyên tăng dần duy nhất giữa nhiều server mà không bị nghẽn DB auto-increment, dùng **Twitter Snowflake ID** hoặc **Redis Range Allocator** (mỗi worker lấy 1 dải 100,000 ID từ Redis: `INCRBY global_seq 100000` rồi tự sinh trong RAM). Chiều dài URL ngắn: 7 ký tự Base62 có thể biểu diễn được $62^7 \\approx 3.5$ nghìn tỷ URLs duy nhất.',
    codeExample: `// Thuật toán chuyển đổi ID sang chuỗi rút gọn Base62
const BASE62_CHARS = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';

export function encodeBase62(num: bigint): string {
  if (num === 0n) return '0';
  let result = '';
  let n = num;
  while (n > 0n) {
    const remainder = Number(n % 62n);
    result = BASE62_CHARS[remainder] + result;
    n = n / 62n;
  }
  return result;
}

export function decodeBase62(shortCode: string): bigint {
  let num = 0n;
  for (const char of shortCode) {
    num = num * 62n + BigInt(BASE62_CHARS.indexOf(char));
  }
  return num;
}`
  },

  'sys-090': {
    summary: 'Thiết kế Hệ thống Chat quy mô lớn (WhatsApp / Slack): Quản lý hàng triệu kết nối đồng thời thông qua cụm máy chủ **WebSocket / TCP Gateway kết hợp thư viện Epoll (như Netty/Go)**; Định tuyến tin nhắn qua **Redis Pub/Sub hoặc Kafka**; Lưu trữ vĩnh viễn tin nhắn trên **Cassandra/ScyllaDB** (tối ưu append-only log); Đồng bộ trạng thái thiết bị qua Cursor Sequence ID.',
    deepDive: 'Tối ưu tài nguyên kết nối: 1 kết nối WebSocket idle tốn khoảng 4-10KB RAM. 1 triệu kết nối tốn ~4-10GB RAM -> hoàn toàn có thể gom trên 4-8 servers chuyên dụng. Cơ chế Heartbeat (Ping/Pong) chạy mỗi 30-60s để dọn dẹp các Half-open TCP sockets (thiết bị rớt sóng vào thang máy mà server chưa kịp nhận cờ FIN/RST). Trạng thái Online/Offline (Presence) lưu trữ trên Redis với key kèm TTL tự gia hạn (Heartbeat renew).',
    codeExample: `// Quản lý trạng thái Online Presence bằng Redis TTL Heartbeat
import Redis from 'ioredis';
const redis = new Redis();

export class PresenceService {
  // Client gửi Ping mỗi 30s để duy trì trạng thái Online
  public static async heartbeat(userId: string) {
    await redis.set(\`presence:\${userId}\`, 'ONLINE', 'EX', 45); // TTL 45s (dôi ra 15s cho network jitter)
  }

  // Kiểm tra trạng thái bạn bè có online không
  public static async isOnline(userId: string): Promise<boolean> {
    const status = await redis.get(\`presence:\${userId}\`);
    return status === 'ONLINE';
  }
}`
  },

  'sys-091': {
    summary: 'Thiết kế Hệ thống Push Notification ở quy mô lớn: (1) Lưu trữ Device Tokens (FCM cho Android, APNs cho iOS, WebPush) của người dùng; (2) Worker Pool tiêu thụ tin nhắn từ Queue và gọi API của Apple/Google theo từng batch (HTTP/2 Multiplexing để gửi hàng nghìn token trong 1 kết nối); (3) Xử lý Unregistered Token: Xóa ngay các token đã bị người dùng gỡ app.',
    deepDive: 'Cạm bẫy thực tế: Khi gửi thông báo Breaking News cho 10 triệu người dùng, nếu gửi tuần tự sẽ mất hàng giờ. Bắt buộc phải chia nhỏ thành các Worker song song, sử dụng kết nối HTTP/2 duy trì liên tục tới APNs/FCM (để tránh chi phí bắt tay TLS cho từng thông báo). Đồng thời phải lưu cài đặt người dùng (User Notification Preferences: cho phép nhận thông báo giờ nào, loại tin gì) tại Redis để lọc trước khi đẩy vào Queue.',
    codeExample: `// Batch Notification Dispatcher với Firebase Cloud Messaging (FCM)
import admin from 'firebase-admin';

export async function sendMulticastNotification(tokens: string[], title: string, body: string) {
  // FCM cho phép gửi tối đa 500 tokens trong 1 request
  const BATCH_SIZE = 500;
  for (let i = 0; i < tokens.length; i += BATCH_SIZE) {
    const batch = tokens.slice(i, i + BATCH_SIZE);
    const response = await admin.messaging().sendEachForMulticast({
      tokens: batch,
      notification: { title, body }
    });

    // Rà soát và dọn dẹp các token đã hết hạn hoặc người dùng gỡ app
    const invalidTokens: string[] = [];
    response.responses.forEach((resp, idx) => {
      if (!resp.success && resp.error?.code === 'messaging/registration-token-not-registered') {
        invalidTokens.push(batch[idx]);
      }
    });
    if (invalidTokens.length > 0) {
      await db.query('DELETE FROM device_tokens WHERE token = ANY($1)', [invalidTokens]);
    }
  }
}`
  },

  'sys-092': {
    summary: 'Thiết kế Distributed Rate Limiter: Sử dụng thuật toán **Token Bucket** hoặc **Sliding Window Counter** được thực thi nguyên tử trên **Redis Cluster thông qua Lua Script**. Khi request vượt quá ngưỡng, trả về HTTP status code `429 Too Many Requests` kèm theo các header chỉ dẫn: `X-RateLimit-Limit`, `X-RateLimit-Remaining`, và `Retry-After`.',
    deepDive: 'So sánh các thuật toán: Fixed Window dễ bị dồn tải gấp đôi ở ranh giới 2 cửa sổ; Leaky Bucket làm phẳng traffic nhưng không cho phép bùng nổ lưu lượng hợp lệ (Burst traffic). **Token Bucket** là lựa chọn số 1: Cho phép xử lý lưu lượng bùng nổ ngắn hạn nếu bucket còn token, sau đó bổ sung token đều đặn theo thời gian. Triển khai bằng Redis Hash lưu `{ tokens, last_updated_timestamp }` và tính toán số token nạp thêm theo công thức toán học thay vì dùng cron job bơm token.',
    codeExample: `-- Redis Lua Script: Token Bucket Rate Limiter chuẩn Senior
-- KEYS[1]: rate_limit:user_id
-- ARGV[1]: dung lượng tối đa của bucket (capacity, vd 100)
-- ARGV[2]: tốc độ nạp token (refill_rate_per_sec, vd 10)
-- ARGV[3]: thời điểm hiện tại (now_sec)
-- ARGV[4]: số token cần trừ cho request này (requested, vd 1)

local key = KEYS[1]
local capacity = tonumber(ARGV[1])
local refill_rate = tonumber(ARGV[2])
local now = tonumber(ARGV[3])
local requested = tonumber(ARGV[4])

local data = redis.call('hmget', key, 'tokens', 'last_updated')
local tokens = tonumber(data[1])
local last_updated = tonumber(data[2])

if not tokens then
    tokens = capacity
    last_updated = now
else
    -- Nạp thêm token dựa trên thời gian trôi qua
    local elapsed = math.max(0, now - last_updated)
    tokens = math.min(capacity, tokens + elapsed * refill_rate)
    last_updated = now
end

if tokens >= requested then
    tokens = tokens - requested
    redis.call('hmset', key, 'tokens', tokens, 'last_updated', last_updated)
    redis.call('expire', key, math.ceil(capacity / refill_rate))
    return 1 -- Allowed
else
    return 0 -- Rejected (429)
end`
  },

  'sys-093': {
    summary: 'Thiết kế News Feed (Bảng tin mạng xã hội): So sánh 2 chiến lược: **Fanout-on-Write (Push Model)** - Bài đăng mới được sao chép ngay vào Inbox/Timeline Cache của tất cả follower; **Fanout-on-Read (Pull Model)** - Bài đăng chỉ lưu ở trang cá nhân, khi follower mở app mới query và gộp feed. Giải pháp thực tế là **Kiến trúc Lai (Hybrid Approach)**.',
    deepDive: 'Vấn đề "Celebrity / Hot Key" của Push Model: Nếu Sơn Tùng M-TP (10 triệu follower) đăng bài, hệ thống phải thực hiện 10 triệu thao tác ghi vào Redis -> sập hàng đợi Message Queue. Kiến trúc Lai giải quyết: Người dùng bình thường (< 5,000 follower) áp dụng Push Model; Người nổi tiếng (Celebrity) áp dụng Pull Model. Khi người dùng mở feed, hệ thống lấy feed cá nhân từ Redis Cache (Push) và gộp nhanh với bài mới của các Celebrity mà họ theo dõi (Pull).',
    codeExample: `// Kiến trúc Lai (Hybrid Fanout) cho News Feed
export async function publishPost(userId: string, content: string) {
  const post = await postRepo.create(userId, content);
  const followerCount = await userRepo.getFollowerCount(userId);

  const CELEBRITY_THRESHOLD = 5000;
  if (followerCount > CELEBRITY_THRESHOLD) {
    // 1. CELEBRITY: Không fanout, chỉ đánh dấu để follower tự pull
    await redis.sadd('active_celebrity_posts', post.id);
  } else {
    // 2. NORMAL USER: Đẩy bài viết vào hàng đợi Fanout-on-Write tới các follower
    await fanoutQueue.add('fanout-task', { postId: post.id, authorId: userId });
  }
}`
  },

  'sys-094': {
    summary: 'Thiết kế Hệ thống File Storage (như Google Drive / Dropbox): (1) **Chia nhỏ file thành các Chunks** cố định (4MB/chunk); (2) **Khử trùng lặp (Deduplication)** bằng mã băm SHA-256 của từng chunk (nếu nhiều user upload cùng 1 file, hệ thống chỉ lưu 1 bản vật lý duy nhất); (3) **Đồng bộ vi sai (Delta Sync)**: Khi sửa file, client chỉ upload những chunk có nội dung bị thay đổi.',
    deepDive: 'Các thành phần chính: (1) **Block Server**: Chia file thành 4MB chunks, mã hóa AES-256 và lưu lên Cloud Storage (S3); (2) **Metadata Database**: Lưu cấu trúc thư mục, danh sách chunks tạo nên mỗi file và quyền truy cập (ACID PostgreSQL); (3) **Sync Conflict Resolution**: Khi hai người cùng sửa một file offline và sync lên: Dùng thuật toán so sánh version vector hoặc tạo file xung đột riêng (`document (Conflicted Copy).docx`).',
    codeExample: `// Thuật toán kiểm tra khử trùng lặp (Deduplication) theo Chunk SHA-256
import crypto from 'node:crypto';

export async function processFileChunk(chunkBuffer: Buffer, s3: S3Client, db: Database) {
  // Tính mã băm SHA-256 duy nhất của khối dữ liệu 4MB
  const chunkHash = crypto.createHash('sha256').update(chunkBuffer).digest('hex');

  // Kiểm tra xem chunk này đã tồn tại trên Cloud Storage chưa
  const existingChunk = await db.query('SELECT hash FROM storage_chunks WHERE hash = $1', [chunkHash]);

  if (existingChunk.rowCount === 0) {
    // Chunk mới: Upload lên S3 và ghi nhận vào kho dữ liệu
    await s3.putObject({ Bucket: 'drive-chunks', Key: \`chunks/\${chunkHash}\`, Body: chunkBuffer });
    await db.query('INSERT INTO storage_chunks (hash, size_bytes) VALUES ($1, $2)', [chunkHash, chunkBuffer.length]);
  }

  // Trả về chunk hash để lưu vào metadata của file người dùng (Zero duplicate storage)
  return chunkHash;
}`
  },

  'sys-095': {
    summary: 'Thiết kế Search Autocomplete / Typeahead: Đạt độ trễ phản hồi < 20ms bằng cách sử dụng cấu trúc dữ liệu **Trie (Cây tiền tố)** kết hợp **Top-K Caching** tại mỗi Node; Dùng **Lucene Completion Suggester (ElasticSearch)** hoặc **Redis Sorted Sets (`ZRANGEBYLEX`)** cho tầng phân tán; Gom log tìm kiếm để tính toán tần suất (Search Frequency) định kỳ qua MapReduce/Spark.',
    deepDive: 'Nếu duyệt toàn bộ cây Trie để tìm và sắp xếp gợi ý khi người dùng gõ phím, thao tác sẽ quá chậm. Kỹ thuật tối ưu sống còn: **Pre-computed Top-K Suggestions tại từng Node**: Mỗi Node trên cây Trie lưu sẵn danh sách 5-10 từ khóa tìm kiếm nhiều nhất bắt đầu bằng tiền tố đó. Khi user gõ "iph", hệ thống chỉ cần đọc mảng lưu sẵn tại node "iph" với độ phức tạp $O(1)$ thay vì phải duyệt toàn bộ cây con.',
    codeExample: `// Triển khai Autocomplete Typeahead siêu tốc bằng Redis Sorted Set
import Redis from 'ioredis';
const redis = new Redis();

export class AutocompleteService {
  // 1. Nạp từ khóa vào danh bạ tiền tố
  public static async addKeyword(phrase: string) {
    const clean = phrase.toLowerCase().trim();
    // Thêm ký tự kết thúc '*' để phân biệt từ hoàn chỉnh
    await redis.zadd('autocomplete_index', 0, \`\${clean}*\`);
  }

  // 2. Tìm kiếm gợi ý theo tiền tố trong < 5ms
  public static async suggest(prefix: string, count = 5): Promise<string[]> {
    const p = prefix.toLowerCase().trim();
    // Quét dải từ điển từ prefix tới ký tự kết thúc dải
    const results = await redis.zrangebylex('autocomplete_index', \`[\${p}\`, \`[\${p}\\xff\`, 'LIMIT', 0, count * 2);
    
    return results
      .filter(item => item.endsWith('*'))
      .map(item => item.slice(0, -1))
      .slice(0, count);
  }
}`
  },

  'sys-096': {
    summary: 'Thiết kế Hệ thống Thanh toán (Payment System như Stripe): (1) **Chống mất mát / gian lận**: Sử dụng mô hình **Sổ cái kế toán kép (Double-Entry Ledger)** - Mọi giao dịch đều có ít nhất 1 tài khoản Ghi Nợ (Debit) và 1 tài khoản Ghi Có (Credit), tổng chênh lệch luôn bằng 0; (2) **Tính bất biến**: Áp dụng **Idempotency Key** và Distributed Lock.',
    deepDive: 'Nguyên tắc vàng của Payment Engineering: Không bao giờ cập nhật số dư bằng `UPDATE accounts SET balance = balance + 100`. Số dư luôn được tính toán bằng cách tổng hợp lịch sử các dòng bút toán bất biến (Immutable Ledger Entries). Khi gọi sang ngân hàng bên ngoài: Lưu trạng thái `INITIATED`, lưu `idempotency_key`, gọi mạng với cơ chế Exponential Backoff, và sử dụng Scheduled Reconciliation Worker để xử lý các giao dịch bất định (In-doubt transactions).',
    codeExample: `-- Sổ cái kế toán kép (Double-Entry Bookkeeping Ledger) chuẩn tài chính
CREATE TABLE ledger_entries (
    id BIGSERIAL PRIMARY KEY,
    transaction_id UUID NOT NULL,
    account_id UUID NOT NULL,
    direction VARCHAR(6) NOT NULL CHECK (direction IN ('DEBIT', 'CREDIT')),
    amount NUMERIC(15, 2) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Giao dịch chuyển tiền $100 từ Ví User A sang Ví User B:
-- Tổng Debit luôn bằng tổng Credit (Nguyên lý cân bằng tài chính)
BEGIN;
INSERT INTO ledger_entries (transaction_id, account_id, direction, amount) VALUES 
('tx_123', 'user_a_wallet', 'DEBIT', 100.00),
('tx_123', 'user_b_wallet', 'CREDIT', 100.00);
COMMIT;`
  },

  'sys-098': {
    summary: 'Kiến trúc Multi-Region Active-Active: Triển khai toàn bộ hạ tầng độc lập ở nhiều khu vực địa lý (vd: Singapore và Frankfurt), cả 2 vùng đều tiếp nhận và xử lý cả request Đọc lẫn Ghi. Khác với Active-Passive (vùng phụ chỉ chờ vùng chính sập mới bật lên), Active-Active mang lại Zero Downtime và độ trễ cực thấp cho người dùng toàn cầu.',
    deepDive: 'Thách thức lớn nhất của Multi-Region Active-Active: (1) **Độ trễ ánh sáng xuyên lục địa** (Singapore <-> Frankfurt mất ~150-200ms RTT), khiến các giao dịch đồng thuận 2PC không thể đáp ứng; (2) **Xung đột ghi đồng thời (Write Conflicts)**: Hai người sửa cùng một bản ghi ở 2 region cùng lúc -> Giải pháp: Sử dụng CRDTs, NewSQL phân tán toàn cầu (Google Spanner / CockroachDB), hoặc phân vùng dữ liệu theo người dùng (User Pinning: user châu Á luôn ghi vào cụm Singapore).',
    codeExample: `# Bảng so sánh Kiến trúc Multi-Region: Active-Passive vs Active-Active
interface MultiRegionComparison {
  activePassive: {
    rpo: 'Vài phút (dữ liệu chưa kịp sync khi vùng chính nổ)';
    rto: '5-30 phút (thời gian chuyển DNS và khởi động standby)';
    cost: 'Lãng phí 50% tài nguyên vì cụm Passive chỉ ngồi chờ';
    complexity: 'Trung bình';
  };
  activeActive: {
    rpo: 'Gần như 0 (Zero Data Loss)';
    rto: 'Tức thì (Anycast DNS tự route sang region còn sống)';
    cost: 'Tối ưu 100% tài nguyên sử dụng';
    complexity: 'Rất cao (xử lý split-brain, cross-region conflict resolution)';
  };
}`
  },

  'sys-099': {
    summary: 'Expand-and-Contract Pattern (Parallel Change) là quy trình thay đổi cấu trúc database mà không gây bất kỳ gián đoạn nào (Zero Downtime). Khi đổi tên cột (từ `old_name` sang `new_name`), quy trình chia làm 4 giai đoạn: (1) **Expand**: Thêm cột mới `new_name`; (2) **Write to Both**: Code ghi vào cả 2 cột; (3) **Backfill**: Đồng bộ dữ liệu cũ; (4) **Contract**: Chuyển code đọc từ `new_name` và xóa cột cũ.',
    deepDive: 'Tại sao đổi tên cột trực tiếp bằng `ALTER TABLE RENAME COLUMN` là thảm họa? Trong lúc Deploy, các instance phiên bản cũ (v1) đang chạy vẫn query cột `old_name` -> Ném lỗi `Column does not exist` làm sập hàng loạt request của khách hàng. Bằng cách áp dụng Expand-and-Contract qua nhiều lần deploy nhỏ, code và database luôn tương thích ngược (Backward Compatibility) trong suốt quá trình triển khai.',
    codeExample: `// 4 BƯỚC TRIỂN KHAI EXPAND-AND-CONTRACT ZERO-DOWNTIME
// BƯỚC 1 (Deploy 1 - DB Migration): Thêm cột mới nullable
// ALTER TABLE users ADD COLUMN phone_number VARCHAR(20);

// BƯỚC 2 (Deploy 2 - Application Code): Dual-Write (Ghi cả hai nơi)
export async function updateUserPhone(userId: string, phone: string) {
  await db.query(
    'UPDATE users SET phone = $1, phone_number = $1 WHERE id = $2',
    [phone, userId]
  );
}

// BƯỚC 3 (Background Job): Backfill dữ liệu cũ
// UPDATE users SET phone_number = phone WHERE phone_number IS NULL;

// BƯỚC 4 (Deploy 3 - Cleanup / Contract): Code chỉ đọc từ cột mới và xóa cột cũ
// ALTER TABLE users DROP COLUMN phone;`
  },

  'sys-100': {
    summary: 'Hot Partition / Hot Key xảy ra khi một phần nhỏ dữ liệu (vd: tài khoản của KOL, sự kiện Black Friday) nhận lượng truy cập khổng lồ vượt trội, làm nghẽn CPU và băng thông của duy nhất một node/shard trong khi các node khác nhàn rỗi. Biện pháp giảm nhẹ: **Key Salting** (thêm tiền tố/hậu tố ngẫu nhiên để phân tán sang nhiều shard) kết hợp **Local In-Memory Cache**.',
    deepDive: 'Giải pháp phòng chống Hot Key toàn diện: (1) **Key Salting**: Biến 1 key nóng `item_100` thành 10 sub-keys `item_100_shard_0` đến `item_100_shard_9` -> tải ghi được phân tán đều cho 10 server; Khi đọc thì query cả 10 keys rồi gộp lại (Scatter-Gather); (2) **Near-Cache (Local Memory Cache)**: Sử dụng thư viện in-memory (như Guava/Caffeine trong Java hay Map trong Node) lưu cache hot key ngay trên máy chủ ứng dụng với TTL ngắn 3-5 giây để 99% request không cần gọi tới cụm Redis phân tán.',
    codeExample: `// Kỹ thuật Key Salting để phân tán tải của Hot Key trên Redis
import Redis from 'ioredis';
const redis = new Redis();

export class HotKeySaltingManager {
  private static SHARD_COUNT = 10;

  // Ghi phân tán: Chia lượt xem của Hot Item sang 10 key ngẫu nhiên
  public static async recordHotItemView(itemId: string) {
    const randomShard = Math.floor(Math.random() * this.SHARD_COUNT);
    const saltedKey = \`hot_item:\${itemId}:shard_\${randomShard}\`;
    await redis.incr(saltedKey);
  }

  // Đọc tổng hợp (Scatter-Gather): Đọc 10 key song song và tính tổng
  public static async getTotalViews(itemId: string): Promise<number> {
    const keys = Array.from({ length: this.SHARD_COUNT }, (_, i) => \`hot_item:\${itemId}:shard_\${i}\`);
    const counts = await redis.mget(...keys);
    return counts.reduce((acc, val) => acc + (parseInt(val || '0', 10)), 0);
  }
}`
  }
};

let count = 0;
data.forEach(q => {
  if (batch4Updates[q.id]) {
    const u = batch4Updates[q.id];
    q.seniorAnswer.summary = u.summary;
    q.seniorAnswer.deepDive = u.deepDive;
    q.seniorAnswer.codeExample = u.codeExample;
    count++;
  }
});

fs.writeFileSync(filePath, JSON.stringify(data, null, 2) + '\n', 'utf8');
console.log(`Updated ${count} questions in Batch 4.`);
