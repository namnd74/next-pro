import fs from 'node:fs';
import path from 'node:path';

const filePath = path.resolve('src/features/interview/data/json/system-design-bank.json');
const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));

const batch1Updates = {
  'sys-003': {
    summary: 'Scale Up (Vertical) là tăng năng lực phần cứng (CPU, RAM, NVMe) cho một server đơn lẻ; Scale Out (Horizontal) là bổ sung thêm nhiều node chạy song song sau Load Balancer. Trong hệ thống hiện đại, Scale Out là kiến trúc chủ đạo nhờ loại bỏ Single Point of Failure (SPOF) và cho phép mở rộng linh hoạt theo tải.',
    deepDive: 'Scale Up có ưu thế là zero network latency giữa các process và không cần sửa đổi kiến trúc ứng dụng, nhưng chạm trần vật lý phần cứng rất nhanh và chi phí tăng vọt theo hàm mũ. Scale Out yêu cầu tầng ứng dụng phải Stateless (chuyển session vào Redis/JWT), cơ sở dữ liệu phải Sharding hoặc phân chia Read/Write replicas, nhưng đổi lại hệ thống có khả năng đạt 99.99% uptime nhờ rolling updates và autoscaling theo nhu cầu.',
    codeExample: `# Kubernetes Horizontal Pod Autoscaler (HPA) v2: Tự động Scale Out theo CPU và Throughput
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: order-service-hpa
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: order-service
  minReplicas: 3
  maxReplicas: 30
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 70
  - type: Pods
    pods:
      metric:
        name: http_requests_per_second
      target:
        type: AverageValue
        averageValue: 1k`
  },

  'sys-005': {
    summary: 'CDN (Content Delivery Network) là mạng lưới các máy chủ PoP (Point of Presence) phân tán địa lý toàn cầu, lưu bản sao của tài nguyên tĩnh và động gần người dùng nhất. CDN giảm độ trễ RTT (Round Trip Time) từ hàng trăm ms xuống < 20ms, giảm tải 80-90% cho Origin Server và bảo vệ hệ thống trước tấn công DDoS tầng 7.',
    deepDive: 'CDN tối ưu hóa 2 nhóm nội dung: (1) Static Assets (ảnh, video, JS/CSS bundles) sử dụng Content Hashing trong tên file kèm Cache-Control immutable dài hạn; (2) Dynamic Content sử dụng Edge Caching với stale-while-revalidate hoặc Edge Workers (Cloudflare Workers/Lambda@Edge) để render HTML sát biên. Cơ chế vô hiệu hóa cache (Cache Invalidation) vận hành thông qua Surrogate-Keys (Cache-Tags) để purge hàng loạt mà không cần xóa toàn bộ cache.',
    codeExample: `# Cấu hình HTTP Cache Headers chuẩn Senior trên Nginx & CDN Edge
location ~* \.(?:css|js|woff2?|png|webp|avif)$ {
    expires 1y;
    add_header Cache-Control "public, max-age=31536000, immutable";
    access_log off;
}

location /api/v1/feed {
    proxy_pass http://backend_upstream;
    # CDN trả ngay nội dung cũ trong 60s khi đang revalidate ngầm với Origin
    add_header Cache-Control "public, s-maxage=30, stale-while-revalidate=60, stale-if-error=300";
    add_header Surrogate-Key "feed-public category-tech";
}`
  },

  'sys-006': {
    summary: 'Forward Proxy đứng phía trước Client (ẩn danh client, vượt tường lửa, quản lý truy cập nội bộ ra internet); Reverse Proxy đứng phía trước Backend Servers (tiếp nhận traffic công khai, thực hiện Load Balancing, SSL Termination, Caching và che giấu topo mạng máy chủ nội bộ).',
    deepDive: 'Client phải chủ động cấu hình Forward Proxy trên trình duyệt hoặc OS để định tuyến request. Ngược lại, Client hoàn toàn không biết sự tồn tại của Reverse Proxy vì nó đóng vai trò máy chủ đích. Về mặt vận hành, Reverse Proxy giữ vai trò sống còn trong việc tối ưu hóa mạng: duy trì HTTP Keep-Alive connection pooling tới backend pods, nén tài nguyên (Gzip/Brotli), và thực hiện Health Check để cô lập các node lỗi.',
    codeExample: `# Cấu hình Nginx Reverse Proxy hiệu năng cao với upstream keepalive & SSL termination
upstream backend_cluster {
    zone backend_zone 64k;
    server 10.0.1.10:8080 max_fails=3 fail_timeout=10s;
    server 10.0.1.11:8080 max_fails=3 fail_timeout=10s;
    keepalive 32; # Giữ 32 TCP connections nhàn rỗi, loại bỏ chi phí 3-way handshake
}

server {
    listen 443 ssl http2;
    server_name api.example.com;
    ssl_certificate /etc/ssl/certs/api.crt;
    ssl_certificate_key /etc/ssl/private/api.key;

    location / {
        proxy_pass http://backend_cluster;
        proxy_http_version 1.1;
        proxy_set_header Connection "";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto https;
    }
}`
  },

  'sys-007': {
    summary: 'Latency là thời gian cần thiết để một thao tác đơn lẻ hoàn tất (đo bằng ms ở các phân vị p95/p99); Throughput là khối lượng công việc hệ thống xử lý trong một đơn vị thời gian (RPS, QPS, MB/s). Kỹ thuật Batching (gom nhóm) là trade-off kinh điển: tăng vọt Throughput nhưng làm tăng nhẹ Latency của các request đầu tiên trong batch.',
    deepDive: 'Chi phí cố định (overhead) của mỗi I/O bao gồm context switch, TCP framing, disk seek và database transaction lock. Nếu xử lý ngay từng request, hệ thống đạt latency cực thấp nhưng lãng phí tài nguyên CPU cho overhead, khiến throughput bị nghẽn. Áp dụng Micro-batching (gom request trong cửa sổ thời gian vài ms) cho phép amortize chi phí cố định: Thông lượng ghi của Kafka hay Bulk Index của Elasticsearch có thể tăng gấp 20 lần dù latency trung bình tăng thêm 2-5ms.',
    codeExample: `// MicroBatcher: Gom nhóm request để tối đa hóa Throughput mà vẫn kiểm soát Latency
export class MicroBatcher<T, R> {
  private queue: Array<{ item: T; resolve: (val: R) => void; reject: (err: unknown) => void }> = [];
  private timer: NodeJS.Timeout | null = null;

  constructor(
    private batchHandler: (batch: T[]) => Promise<R[]>,
    private maxBatchSize = 100,
    private maxWaitMs = 5 // Chờ tối đa 5ms để gom đủ batch
  ) {}

  public async execute(item: T): Promise<R> {
    return new Promise<R>((resolve, reject) => {
      this.queue.push({ item, resolve, reject });
      if (this.queue.length >= this.maxBatchSize) {
        this.flush();
      } else if (!this.timer) {
        this.timer = setTimeout(() => this.flush(), this.maxWaitMs);
      }
    });
  }

  private async flush() {
    if (this.timer) { clearTimeout(this.timer); this.timer = null; }
    const current = this.queue.splice(0, this.maxBatchSize);
    if (current.length === 0) return;
    try {
      const results = await this.batchHandler(current.map(c => c.item));
      current.forEach((c, idx) => c.resolve(results[idx]));
    } catch (err) {
      current.forEach(c => c.reject(err));
    }
  }
}`
  },

  'sys-008': {
    summary: 'Các mô hình Consistency phản ánh mức độ nhất quán dữ liệu giữa các node: Strong Consistency (Linearizable) đảm bảo mọi thao tác đọc đều thấy dữ liệu mới nhất; Sequential Consistency đảm bảo thứ tự thực thi đồng nhất; Causal Consistency bảo toàn quan hệ nhân quả; và Eventual Consistency chấp nhận dữ liệu tạm lệch và sẽ hội tụ theo thời gian.',
    deepDive: 'Linearizability đòi hỏi giao thức đồng thuận (Raft/Paxos) hoặc 2-Phase Commit, khiến độ trễ ghi tăng và hệ thống có thể từ chối phục vụ khi mạng phân vùng (định lý CAP). Trong khi đó, Eventual Consistency cho phép các replica phân tán phục vụ request đọc/ghi độc lập với độ trễ < 5ms. Các xung đột phân tán sau đó được hòa giải bằng cơ chế Vector Clocks, CRDTs (Conflict-free Replicated Data Types) hoặc Last-Write-Wins (LWW).',
    codeExample: `// ScyllaDB / Cassandra: Điều chỉnh Consistency Level linh hoạt theo nghiệp vụ
import { Client, types } from 'cassandra-driver';
const client = new Client({ contactPoints: ['10.0.0.1'], localDataCenter: 'us-east-1' });

// 1. Giao dịch số dư: Strong Consistency (Quorum R + W > N)
async function updateAccountBalance(id: string, amount: number) {
  const query = 'UPDATE accounts SET balance = balance + ? WHERE id = ?';
  await client.execute(query, [amount, id], {
    consistency: types.consistencies.quorum // Đa số node xác nhận (Linearizable)
  });
}

// 2. Thống kê view/like: Eventual Consistency (Ghi tốc độ tối đa)
async function recordPageLike(pageId: string, userId: string) {
  const query = 'INSERT INTO page_likes (page_id, user_id, created_at) VALUES (?, ?, toTimestamp(now()))';
  await client.execute(query, [pageId, userId], {
    consistency: types.consistencies.one // 1 node phản hồi là xong ngay
  });
}`
  },

  'sys-010': {
    summary: 'Consistent Hashing là thuật toán băm phân tán ánh xạ cả Key và Node lên cùng một vòng tròn băm 32-bit (Hash Ring). Khi thêm hoặc xóa một node, hệ thống chỉ cần di chuyển trung bình K/N keys (K là tổng keys, N là tổng nodes), giải quyết triệt để thảm họa mất trắng cache của thuật toán hash modulo truyền thống (hash(k) % N).',
    deepDive: 'Vấn đề lớn nhất của Consistent Hashing sơ khai là sự phân bố không đều (Non-uniform distribution), dẫn đến một số node phải chịu tải gấp nhiều lần node khác (Hotspot). Giải pháp chuẩn mực trong DynamoDB và Cassandra là áp dụng **Virtual Nodes (vnodes)**: Mỗi server vật lý được phân rã thành hàng trăm node ảo (vd: 100-256 vnodes) nằm rải đều khắp vòng tròn băm. Khi một node vật lý sập, tải của nó được chia đều cho tất cả các node còn lại.',
    codeExample: `import crypto from 'node:crypto';

export class ConsistentHashRing {
  private ring = new Map<number, string>();
  private sortedHashes: number[] = [];

  constructor(private replicas = 150) {} // 150 vnodes cho mỗi server vật lý

  private hash(key: string): number {
    return crypto.createHash('md5').update(key).digest().readUInt32BE(0);
  }

  public addNode(node: string) {
    for (let i = 0; i < this.replicas; i++) {
      const vNodeHash = this.hash(\`\${node}#vnode-\${i}\`);
      this.ring.set(vNodeHash, node);
      this.sortedHashes.push(vNodeHash);
    }
    this.sortedHashes.sort((a, b) => a - b);
  }

  public getNode(key: string): string | null {
    if (this.sortedHashes.length === 0) return null;
    const keyHash = this.hash(key);
    // Binary Search tìm node kế tiếp theo chiều kim đồng hồ
    let low = 0, high = this.sortedHashes.length - 1;
    while (low <= high) {
      const mid = Math.floor((low + high) / 2);
      if (this.sortedHashes[mid] >= keyHash) high = mid - 1;
      else low = mid + 1;
    }
    const idx = low < this.sortedHashes.length ? low : 0;
    return this.ring.get(this.sortedHashes[idx])!;
  }
}`
  },

  'sys-012': {
    summary: 'Các mô hình Caching cốt lõi: Cache-Aside (Ứng dụng tự quản lý đọc/ghi vào cache và DB); Write-Through (Ghi vào cache, cache ghi đồng bộ vào DB); Write-Back/Write-Behind (Ghi vào cache và trả về 200 ngay, cache gom batch ghi ngầm vào DB); Refresh-Ahead (Tự nạp lại dữ liệu trước khi TTL hết hạn dựa trên tần suất truy cập).',
    deepDive: 'Cache-Aside là chiến lược an toàn và phổ biến nhất vì ứng dụng có thể tiếp tục hoạt động dù Redis sập. Trong Cache-Aside, quy tắc vàng để chống Stale Data là: **Cập nhật Database trước, sau đó XÓA Cache (Delete/Invalidate) thay vì cập nhật trực tiếp vào Cache**. Nếu ghi đè cache, hai request ghi đồng thời có thể gây race condition dẫn đến dữ liệu trong cache bị sai lệch vĩnh viễn cho đến khi hết hạn TTL.',
    codeExample: `// Triển khai Cache-Aside chuẩn Senior với cơ chế chống Stale Data
export async function getProduct(id: string, db: DB, redis: Redis): Promise<Product> {
  const cacheKey = \`product:\${id}\`;
  const cached = await redis.get(cacheKey);
  if (cached) return JSON.parse(cached);

  const product = await db.query('SELECT * FROM products WHERE id = $1', [id]);
  if (!product) throw new NotFoundError();

  // Đặt TTL kèm Jitter (tránh Cache Avalanche)
  const jitter = Math.floor(Math.random() * 300);
  await redis.set(cacheKey, JSON.stringify(product), 'EX', 3600 + jitter);
  return product;
}

export async function updateProduct(product: Product, db: DB, redis: Redis): Promise<void> {
  // BƯỚC 1: Cập nhật cơ sở dữ liệu gốc trước
  await db.query('UPDATE products SET price = $1, name = $2 WHERE id = $3', [product.price, product.name, product.id]);
  // BƯỚC 2: XÓA cache để request tiếp theo tự nạp lại dữ liệu chuẩn
  await redis.del(\`product:\${product.id}\`);
}`
  },

  'sys-013': {
    summary: 'Sự cố Cache: Cache Breakdown (1 hot key hết hạn, hàng vạn request cùng ùa vào DB); Cache Avalanche (hàng loạt key hết hạn cùng lúc hoặc cụm cache sập, khiến DB tê liệt); Cache Penetration (truy vấn liên tục các key không tồn tại, khiến mọi request đều đâm thẳng xuống DB).',
    deepDive: 'Giải pháp phòng chống toàn diện: (1) Chống Breakdown: Dùng Mutex Lock / Singleflight (chỉ 1 process được query DB để nạp cache, các process khác đợi); (2) Chống Avalanche: Thêm **Jitter ngẫu nhiên** vào thời gian TTL (`TTL = Base + rand(0, 300s)`) và triển khai Redis Sentinel/Cluster; (3) Chống Penetration: Đặt **Bloom Filter** ở tầng trước cache để lọc các key rác, hoặc lưu giá trị Null Object Cache với TTL ngắn (30-60s).',
    codeExample: `// Singleflight Mutex Lock bằng Redis: Chống triệt để Cache Breakdown
export async function getWithMutexLock<T>(
  key: string,
  fetcher: () => Promise<T>,
  redis: Redis,
  ttlSeconds = 600
): Promise<T> {
  const cached = await redis.get(key);
  if (cached) return JSON.parse(cached);

  const lockKey = \`lock:\${key}\`;
  // Chiếm Distributed Lock trong 5s (NX = Not Exists, EX = Expiry)
  const acquired = await redis.set(lockKey, '1', 'EX', 5, 'NX');

  if (acquired === 'OK') {
    try {
      const freshData = await fetcher();
      await redis.set(key, JSON.stringify(freshData), 'EX', ttlSeconds);
      return freshData;
    } finally {
      await redis.del(lockKey);
    }
  } else {
    // Không chiếm được lock: Chờ 100ms rồi đọc lại từ cache do worker đầu tiên đã nạp
    await new Promise((resolve) => setTimeout(resolve, 100));
    return getWithMutexLock(key, fetcher, redis, ttlSeconds);
  }
}`
  },

  'sys-015': {
    summary: 'Database Sharding là kỹ thuật phân vùng ngang (Horizontal Partitioning) chia tách một bảng dữ liệu khổng lồ thành nhiều cơ sở dữ liệu vật lý riêng biệt dựa trên Shard Key. Các chiến lược phổ biến gồm Range-based (theo khoảng giá trị), Hash-based (băm ID) và Directory-based (bảng định tuyến).',
    deepDive: 'Thách thức lớn nhất của Sharding bao gồm: (1) Mất khả năng JOIN liên Shard (buổi phỏng vấn cần nêu giải pháp Denormalization hoặc thực hiện JOIN ở tầng ứng dụng); (2) Giao dịch phân tán (Distributed Transactions) phải dùng 2PC hoặc Saga; (3) Tái cân bằng dữ liệu (Resharding) cực kỳ phức tạp; (4) Hiện tượng Hot Shard nếu chọn sai Shard Key (ví dụ: sharding theo `created_at` khiến mọi thao tác ghi mới đều đâm vào shard hiện tại).',
    codeExample: `-- PostgreSQL 16 Declarative Hash Sharding
CREATE TABLE orders (
    order_id UUID NOT NULL,
    user_id UUID NOT NULL, -- Chọn user_id làm Shard Key để gom đơn hàng của 1 user về cùng 1 shard
    amount NUMERIC(12, 2) NOT NULL,
    status VARCHAR(32) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (user_id, order_id)
) PARTITION BY HASH (user_id);

-- Tạo 4 Shard partitions phân tán
CREATE TABLE orders_shard_0 PARTITION OF orders FOR VALUES WITH (MODULUS 4, REMAINDER 0);
CREATE TABLE orders_shard_1 PARTITION OF orders FOR VALUES WITH (MODULUS 4, REMAINDER 1);
CREATE TABLE orders_shard_2 PARTITION OF orders FOR VALUES WITH (MODULUS 4, REMAINDER 2);
CREATE TABLE orders_shard_3 PARTITION OF orders FOR VALUES WITH (MODULUS 4, REMAINDER 3);`
  },

  'sys-016': {
    summary: 'Database Replication sao chép dữ liệu từ Master (Primary) sang các Replicas (Secondaries) để mở rộng thông lượng đọc và tăng tính sẵn sàng. Replication Lag là khoảng trễ thời gian giữa lúc Master ghi xong và lúc Replica cập nhật xong, gây ra hiện tượng người dùng vừa lưu dữ liệu nhưng load lại trang thì không thấy (Stale Read).',
    deepDive: 'Replication có thể là Synchronous (chờ replica xác nhận -> an toàn nhưng chậm) hoặc Asynchronous (trả về ngay -> nhanh nhưng lag). Để giải quyết Replication Lag và đảm bảo tính nhất quán "Read-Your-Own-Writes", ta áp dụng: (1) Định tuyến các request đọc ngay sau khi ghi (trong vòng 5-10s) trực tiếp về Master; (2) Lưu Version/Timestamp của dữ liệu trong Cookie/JWT và kiểm tra xem Replica đã bắt kịp version đó chưa.',
    codeExample: `// Read-Write Splitting Router hỗ trợ giải quyết Replication Lag
export class DatabaseRouter {
  constructor(private primaryPool: Pool, private replicaPool: Pool) {}

  public getPool(context: { isWrite: boolean; lastWriteTimestamp?: number }): Pool {
    if (context.isWrite) return this.primaryPool;

    // Nếu user vừa thực hiện thao tác ghi trong vòng 5 giây trước:
    // Buộc phải đọc từ Primary để đảm bảo Read-Your-Own-Writes (tránh lag)
    const REPLICATION_LAG_WINDOW_MS = 5000;
    if (context.lastWriteTimestamp && Date.now() - context.lastWriteTimestamp < REPLICATION_LAG_WINDOW_MS) {
      return this.primaryPool;
    }

    // Đọc thông thường: Phân phối tải sang Read Replicas
    return this.replicaPool;
  }
}`
  },

  'sys-017': {
    summary: 'Connection Pooling duy trì một tập hợp các kết nối cơ sở dữ liệu đã mở sẵn để tái sử dụng, loại bỏ chi phí đắt đỏ của việc khởi tạo kết nối (TCP handshake, TLS negotiation, authentication và cấp phát bộ nhớ backend process cho mỗi query).',
    deepDive: 'Vấn đề thường gặp: (1) Connection Leak do quên giải phóng connection trong khối `finally`; (2) Cấu hình Pool quá lớn gây nghẽn CPU và bão hòa disk I/O của database server (công thức kinh điển của HikariCP: \`connections = (core_count * 2) + effective_spindle_count\`); (3) Trong kiến trúc Serverless (AWS Lambda), hàng nghìn containers tạo hàng nghìn kết nối đồng thời làm sập DB, bắt buộc phải dùng Proxy chuyên dụng như **PgBouncer** hoặc AWS RDS Proxy.',
    codeExample: `# Cấu hình PgBouncer (Transaction Pooling) tối ưu cho hàng vạn client kết nối
[databases]
app_db = host=127.0.0.1 port=5432 dbname=production_db

[pgbouncer]
listen_port = 6432
listen_addr = 0.0.0.0
auth_type = scram-sha-256
auth_file = /etc/pgbouncer/userlist.txt

# Transaction pooling: Trả connection về pool ngay khi kết thúc TRANSACTION
pool_mode = transaction
max_client_conn = 10000     # Phục vụ tối đa 10,000 kết nối từ ứng dụng
default_pool_size = 50      # Nhưng chỉ mở tối đa 50 kết nối thật xuống Postgres
reserve_pool_size = 10
server_idle_timeout = 600`
  },

  'sys-019': {
    summary: 'Để chống bot tạo tài khoản ảo hàng loạt, cần triển khai hệ thống phòng thủ đa lớp (Defense in Depth): Tầng mạng (Cloudflare WAF / Turnstile CAPTCHA), Tầng Gateway (Rate limiting theo IP và Device Fingerprint), và Tầng nghiệp vụ (Xác thực Email/SMS OTP kèm cơ chế Disposable Email Filtering).',
    deepDive: 'Hacker có thể dùng mạng botnet phân tán (Residential Proxies) khiến Rate Limit theo IP truyền thống bị vô hiệu hóa. Giải pháp nâng cao đòi hỏi: (1) Tính toán Proof-of-Work (PoW) ẩn hoặc Cloudflare Turnstile để bắt bot tiêu tốn tài nguyên CPU; (2) Thuật toán Honeypot fields (input ẩn không hiển thị trên CSS, bot tự động điền sẽ bị chặn); (3) Tích hợp danh sách đen các domain tạo email tạm thời (10-minute mail).',
    codeExample: `// Middleware phòng thủ Bot tạo tài khoản đa tầng
import { verifyTurnstileToken } from './turnstile';
import disposableDomains from 'disposable-email-domains';

export async function validateRegistration(req: Request): Promise<{ allowed: boolean; reason?: string }> {
  const { email, turnstileToken, honeypotField } = req.body;

  // 1. Kiểm tra Honeypot: Nếu field ẩn có giá trị -> chắc chắn là bot
  if (honeypotField) {
    return { allowed: false, reason: 'Bot detected by honeypot' };
  }

  // 2. Chặn Disposable Email
  const domain = email.split('@')[1]?.toLowerCase();
  if (disposableDomains.includes(domain)) {
    return { allowed: false, reason: 'Disposable emails not allowed' };
  }

  // 3. Xác minh Turnstile Token với Cloudflare API
  const isHuman = await verifyTurnstileToken(turnstileToken, req.ip);
  if (!isHuman) {
    return { allowed: false, reason: 'CAPTCHA verification failed' };
  }

  return { allowed: true };
}`
  },

  'sys-020': {
    summary: 'Yêu cầu chức năng (Functional Requirements - FR) mô tả hệ thống LÀM ĐƯỢC GÌ (nghiệp vụ: tạo đơn hàng, thanh toán, gửi tin nhắn); Yêu cầu phi chức năng (Non-Functional Requirements - NFR) mô tả hệ thống VẬN HÀNH RA SAO (chất lượng: Độ trễ P99 < 200ms, Độ sẵn sàng 99.99%, Tính toàn vẹn dữ liệu ACID).',
    deepDive: 'Trong System Design, NFR mới là yếu tố quyết định kiến trúc: Cùng là tính năng "gửi tin nhắn", nhưng nếu NFR là 10 người dùng thì dùng Monolith + SQLite là đủ; nếu NFR là 500 triệu người dùng đồng thời thì bắt buộc phải là Microservices, WebSocket Gateway Cluster, Redis Pub/Sub, Cassandra và Kafka. Tách rõ FR và NFR trong 5 phút đầu giúp xác định đúng phạm vi (scope) và các ràng buộc đánh đổi (trade-offs).',
    codeExample: `// BẢNG ĐẶC TẢ KỸ THUẬT (SYSTEM SPECIFICATION TEMPLATE)
interface SystemDesignSpec {
  functionalRequirements: {
    coreFlows: ['Rút ngắn URL từ link gốc', 'Chuyển hướng (302/301) khi truy cập link ngắn'];
    optionalScope: ['Thống kê click analytics', 'Tự đặt alias tùy chỉnh'];
  };
  nonFunctionalRequirements: {
    availability: '99.99% (Downtime < 52 phút/năm)';
    readLatencyP99: '< 15ms tại CDN edge';
    writeLatencyP99: '< 100ms';
    readWriteRatio: '100:1 (Read-heavy -> Cần Caching đa tầng)';
    dataRetention: 'Lưu trữ trong 5 năm (Ước lượng 15TB SSD)';
  };
}`
  },

  'sys-021': {
    summary: 'Trong 5 phút đầu phỏng vấn System Design, ứng viên Senior không nhảy vào vẽ sơ đồ ngay mà cần làm rõ 4 trụ cột: (1) Tính năng cốt lõi (Core FR); (2) Quy mô & Thông lượng (QPS đọc/ghi, DAU, dung lượng lưu trữ 5 năm); (3) Ràng buộc phi chức năng (SLA, Latency target, Strong vs Eventual Consistency); (4) Phạm vi không cần làm (Out of scope).',
    deepDive: 'Người phỏng vấn cố tình đưa ra đề bài mơ hồ ("Hãy thiết kế Twitter/Uber") để kiểm tra tư duy phân tích yêu cầu. Kỹ sư giỏi sẽ hỏi các câu hỏi định lượng then chốt: Tỷ lệ Read/Write là bao nhiêu? Hệ thống có yêu cầu phân tán toàn cầu (Global Multi-Region) không? Khi xảy ra sự cố mạng, ta ưu tiên Availability hay Consistency? Việc chốt chặt phạm vi sẽ ngăn chặn việc thiết kế lan man (over-engineering).',
    codeExample: `// CHECKLIST 5 PHÚT ĐẦU BUỔI PHỎNG VẤN SYSTEM DESIGN
const clarificationFramework = {
  step1_FunctionalScope: [
    'Những tính năng chính nào là bắt buộc trong MVP hôm nay?',
    'Tính năng nào có thể tạm bỏ qua (ví dụ: analytics, thanh toán)?'
  ],
  step2_TrafficScale: [
    'Bao nhiêu DAU/MAU?',
    'Tỷ lệ Đọc : Ghi là bao nhiêu (ví dụ 100:1 hay 1:1)?',
    'QPS đỉnh điểm (Peak QPS) dự kiến là bao nhiêu?'
  ],
  step3_DataConstraints: [
    'Mỗi bản ghi dung lượng khoảng bao nhiêu?',
    'Dữ liệu cần lưu trữ trong bao lâu (retention period)?'
  ],
  step4_SLA_and_Tradeoffs: [
    'Latency P99 kỳ vọng là bao nhiêu mili-giây?',
    'Trong định lý CAP, hệ thống nghiêng về CP hay AP?'
  ]
};`
  },

  'sys-022': {
    summary: 'Khi 1 server duy nhất bị traffic tăng gấp 5 và bắt đầu chậm, thứ tự xử lý chuẩn SRE là: (1) Ổn định hệ thống ngay (Giảm tải tức thì bằng CDN Caching, Rate Limiting); (2) Định vị nút thắt cổ chai (CPU, RAM, Disk I/O hay DB slow queries); (3) Tách Database ra server riêng; (4) Thêm Read Replica hoặc Redis Cache; (5) Scale Out máy chủ ứng dụng sau Load Balancer.',
    deepDive: 'Lỗi thường gặp của Junior là vội vàng viết lại code hoặc áp dụng microservices. Trong cơn khủng hoảng production, nguyên tắc là "Cầm máu trước, phẫu thuật sau": Bật CDN caching cho các endpoint đọc để giảm 70% request tới server; phân tích `top`, `htop`, `pg_stat_activity` để tìm slow query rồi thêm Missing Index; khi DB được giảm tải, tách DB sang instance độc lập để giải phóng RAM cho Web process.',
    codeExample: `# CÁC LỆNH TRIAGE SỰ CỐ PRODUCTION TRÊN LINUX SERVER
# 1. Kiểm tra tài nguyên tổng quan (CPU, Memory, Load Average)
htop
uptime

# 2. Kiểm tra Disk I/O bottleneck (nếu %iowait > 20% -> ổ đĩa nghẽn)
iostat -xz 1 5

# 3. Tìm các query đang treo hoặc chạy quá 2 giây trong PostgreSQL
psql -d production_db -c "
SELECT pid, now() - pg_stat_activity.query_start AS duration, query, state
FROM pg_stat_activity
WHERE state != 'idle' AND (now() - pg_stat_activity.query_start) > interval '2 seconds'
ORDER BY duration DESC;"`
  },

  'sys-023': {
    summary: 'Load Balancer phát hiện backend còn sống qua cơ chế Health Check (Layer 4 TCP ping hoặc Layer 7 HTTP GET `/healthz`). Cấu hình sai Health Check có thể gây ra thảm họa dây chuyền (Cascading Failure): Đánh sập toàn bộ cụm server (Flapping) hoặc gửi request vào các node đang chết lâm sàng.',
    deepDive: '2 lỗi chí mạng khi cấu hình Health Check: (1) **Shallow Health Check**: Endpoint `/healthz` chỉ trả về `200 OK` tĩnh mà không kiểm tra kết nối DB -> LB vẫn bơm traffic vào pod dù pod đã mất kết nối DB; (2) **Deep Health Check quá nặng**: `/healthz` thực hiện query `SELECT COUNT(*)` xuống DB -> khi tải cao, DB chậm khiến toàn bộ pods bị timeout health check, LB kết luận tất cả pods đều chết và cắt sạch traffic (Total Outage). Giải pháp: Kiểm tra kết nối nhanh (Ping DB/Redis với timeout 500ms) kèm ngưỡng `consecutive_failures`.',
    codeExample: `// Health Check Endpoint chuẩn cho Kubernetes & Load Balancer
app.get('/healthz/ready', async (req, res) => {
  try {
    // 1. Kiểm tra kết nối cơ sở dữ liệu với timeout nghiêm ngặt 500ms
    await Promise.race([
      db.query('SELECT 1'),
      new Promise((_, reject) => setTimeout(() => reject(new Error('DB Timeout')), 500))
    ]);

    // 2. Kiểm tra kết nối Redis Cache
    await redis.ping();

    res.status(200).json({ status: 'UP', timestamp: Date.now() });
  } catch (error) {
    // Trả về 503 để Load Balancer tạm thời cô lập node này, không đẩy traffic tới
    res.status(503).json({ status: 'DOWN', error: (error as Error).message });
  }
});`
  },

  'sys-024': {
    summary: 'Hệ thống Đọc-nặng (Read-heavy: như Twitter, Báo chí) ưu tiên tối đa Caching đa tầng (CDN, Redis, Local memory), Denormalization, Read Replicas và ElasticSearch; Hệ thống Ghi-nặng (Write-heavy: như IoT, Logging, GPS tracking) ưu tiên Append-only Log, Message Queues (Kafka) làm bộ đệm, Sharding cơ sở dữ liệu và LSM-Tree databases (Cassandra/ClickHouse).',
    deepDive: 'Với hệ đọc nặng, tỷ lệ Read:Write thường là 100:1 đến 1000:1, bottleneck nằm ở băng thông mạng và Disk Read IOPS -> giải quyết triệt để bằng Caching sao cho 95% request không chạm tới DB gốc. Với hệ ghi nặng (Write-heavy), bottleneck là Disk Write I/O và Transaction Locks của B-Tree -> bắt buộc phải dùng kiến trúc bất đồng bộ (Asynchronous Ingestion): Client ghi vào Kafka cluster, các worker batching ghi dữ liệu xuống database theo từng khối lớn.',
    codeExample: `-- ĐỐI CHIẾU THIẾT KẾ CHO 2 DẠNG HỆ THỐNG

-- 1. READ-HEAVY: Denormalize dữ liệu vào bảng để query trong 1 cú hit (Zero JOIN)
CREATE TABLE post_feed_cache (
    post_id UUID PRIMARY KEY,
    author_name VARCHAR(100), -- Denormalized từ bảng Users
    author_avatar VARCHAR(255),
    content TEXT,
    like_count INT DEFAULT 0
);
CREATE INDEX idx_post_feed_cached ON post_feed_cache(post_id);

-- 2. WRITE-HEAVY: Dùng bảng Partition theo thời gian + Append-only (Zero UPDATE)
CREATE TABLE telemetry_logs (
    device_id UUID NOT NULL,
    recorded_at TIMESTAMPTZ NOT NULL,
    payload JSONB NOT NULL
) PARTITION BY RANGE (recorded_at);`
  },

  'sys-025': {
    summary: 'Để đếm lượt xem (Views) và xếp hạng Top nội dung trong ngày, tuyệt đối không chạy `UPDATE posts SET views = views + 1` trực tiếp xuống SQL Database vì gây nghẽn Row Lock. Giải pháp chuẩn là sử dụng Redis: Tăng bộ đếm qua `INCR` hoặc HyperLogLog, ghi nhận điểm xếp hạng bằng Redis Sorted Set (`ZINCRBY`), và định kỳ sync batch xuống DB.',
    deepDive: 'Redis Sorted Set (ZSET) lưu trữ các phần tử kèm theo Score (số lượt xem) với độ phức tạp $O(\log N)$ để cập nhật và $O(\log N + M)$ để lấy Top $M$ phần tử. Mỗi ngày tạo một key riêng (vd: `ranking:2026-09-30`) kèm TTL 48h. Khi user mở bài viết, gọi lệnh `ZINCRBY` lên key của ngày hôm nay. Để lấy Top 10 bài viết xem nhiều nhất, gọi `ZREVRANGE ranking:2026-09-30 0 9 WITHSCORES` trong < 1ms.',
    codeExample: `// Xử lý View Counter và Bảng xếp hạng Realtime bằng Redis Sorted Set
import Redis from 'ioredis';
const redis = new Redis();

export class ArticleViewTracker {
  // 1. Tăng view bất đồng bộ và cập nhật bảng xếp hạng ngày
  public static async recordView(articleId: string) {
    const today = new Date().toISOString().slice(0, 10); // '2026-09-30'
    const rankKey = \`ranking:\${today}\`;
    const counterKey = \`views:article:\${articleId}\`;

    const pipeline = redis.pipeline();
    pipeline.incr(counterKey);                         // Tăng tổng view
    pipeline.zincrby(rankKey, 1, articleId);           // Tăng điểm trong bảng xếp hạng hôm nay
    pipeline.expire(rankKey, 86400 * 2);               // Key tự hủy sau 2 ngày
    await pipeline.exec();
  }

  // 2. Lấy Top 10 bài viết xem nhiều nhất hôm nay trong < 2ms
  public static async getTopTrendingToday(): Promise<Array<{ articleId: string; views: number }>> {
    const today = new Date().toISOString().slice(0, 10);
    const results = await redis.zrevrange(\`ranking:\${today}\`, 0, 9, 'WITHSCORES');
    
    const trending = [];
    for (let i = 0; i < results.length; i += 2) {
      trending.push({ articleId: results[i], views: parseInt(results[i + 1], 10) });
    }
    return trending;
  }
}`
  }
};

let count = 0;
data.forEach(q => {
  if (batch1Updates[q.id]) {
    const u = batch1Updates[q.id];
    q.seniorAnswer.summary = u.summary;
    q.seniorAnswer.deepDive = u.deepDive;
    q.seniorAnswer.codeExample = u.codeExample;
    count++;
  }
});

fs.writeFileSync(filePath, JSON.stringify(data, null, 2) + '\n', 'utf8');
console.log(`Updated ${count} questions in Batch 1.`);
