import fs from 'node:fs';
import path from 'node:path';

const filePath = path.resolve('src/features/interview/data/json/system-design-bank.json');
const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));

const updatesPart2 = {
  'sys-022': {
    interviewerIntent: 'Đánh giá độ chín chắn (Pragmatism) trong tư duy kiến trúc: Biết khi nào KHÔNG NÊN dùng microservices, hiểu sâu sắc về chi phí vận hành (Operational Overhead) và quy luật Conway.',
    contextOrScenario: 'Một startup giai đoạn hạt giống (Seed stage) gồm 5 kỹ sư, sản phẩm MVP mới ra mắt được 6 tháng và liên tục thay đổi mô hình kinh doanh theo tuần. Một thành viên trong team đề xuất đập Monolith để tách thành 8 microservices để "scale cho tương lai".',
    expectedKeywords: ['Modular Monolith', 'Distributed Monolith', 'Operational Complexity', 'Product-Market Fit', 'Cognitive Load', 'Premature Optimization'],
    pitfalls: [
      'Cuồng công nghệ (Resume-Driven Development), tách microservices quá sớm khi chưa đạt Product-Market Fit.',
      'Tạo ra "Distributed Monolith" — hệ thống phân tán nhưng code và database vẫn phụ thuộc chặt chẽ vào nhau, kế thừa toàn bộ nhược điểm của cả hai mô hình.',
      'Không lường trước gánh nặng chi phí hạ tầng (Kubernetes cluster, Service Mesh, CI/CD pipelines phức tạp) ngốn hết thời gian làm sản phẩm của 5 người.'
    ],
    followUpQuestions: [
      'Làm thế nào để tổ chức một Modular Monolith sạch để sau này khi cần tách Microservices chỉ mất vài tuần thay vì đập đi viết lại?',
      'Những tín hiệu cảnh báo (Red Flags) nào cho thấy Monolith hiện tại đã thực sự chạm ngưỡng và bắt buộc phải bắt đầu tách service?'
    ],
    seniorAnswer: {
      summary: 'Lời khuyên dứt khoát của Senior Architect: KHÔNG NÊN tách microservices. Với team 5 người và sản phẩm mới 6 tháng, ưu tiên số một là Tốc độ tìm kiếm Product-Market Fit. Giải pháp đúng đắn là xây dựng **Modular Monolith** chuẩn Domain-Driven Design (DDD): Tách ranh giới module rõ ràng trong cùng một repo/runtime, dùng chung một database nhưng tách schema, để giữ chi phí vận hành ở mức thấp nhất.',
      deepDive: 'Phân tích các cạm bẫy thực chiến: (1) Ranh giới nghiệp vụ chưa ổn định: Sản phẩm 6 tháng liên tục pivot tính năng. Tách service quá sớm sẽ cắt sai ranh giới, dẫn đến việc 1 tính năng mới đòi hỏi phải sửa code và deploy đồng thời 4-5 microservices. (2) Chi phí vô hình (Tax of Distribution): 5 kỹ sư sẽ bị quá tải bởi việc cấu hình Kubernetes, CI/CD cho hàng chục repositories, gRPC/Protobuf contracts, distributed tracing, network latency và distributed transaction rollback. (3) Lộ trình chuẩn mực: Bắt đầu bằng Monolith -> Thiết kế Modular Monolith với ranh giới module chặt chẽ (Clean Architecture) -> Khi team mở rộng lên 20-30 kỹ sư hoặc có module riêng biệt chịu tải gấp 100 lần (như Video Transcoder hay Notification Engine), ta mới tách module đó thành Microservice độc lập.',
      codeExample: `// Cấu trúc Modular Monolith chuẩn DDD trong một codebase duy nhất (NestJS / Node.js)
// src/
// ├── modules/
// │   ├── auth/          # Độc lập nghiệp vụ xác thực
// │   ├── orders/        # Module quản lý đơn hàng
// │   │   ├── domain/    # Entity, Value Objects, Domain Events
// │   │   ├── infra/     # Database repositories, Orm entities
// │   │   └── api/       # Controller & DTOs
// │   └── inventory/     # Module kho hàng
// └── shared/            # Cross-cutting concerns (Logger, EventBus)

// Giao tiếp liên module bằng Interface & Event Bus nội bộ (In-Memory Event Bus) thay vì HTTP Network calls
export class OrderService {
  constructor(
    private readonly eventBus: InProcessEventBus,
    private readonly orderRepo: OrderRepository
  ) {}

  async completeOrder(orderId: string): Promise<void> {
    const order = await this.orderRepo.findById(orderId);
    order.markPaid();
    await this.orderRepo.save(order);

    // Bắn sự kiện nội bộ: Module Inventory và Notification tự lắng nghe mà không cần mạng Internet
    await this.eventBus.publish(new OrderPaidEvent(order.id, order.userId, order.items));
  }
}`
    }
  },

  'sys-023': {
    interviewerIntent: 'Kiểm tra sự am hiểu lý thuyết Thiết kế hướng Miền (Domain-Driven Design - DDD), khái niệm Bounded Context trong thực tế và các tiêu chí định tính/định lượng để chia tách hệ thống.',
    contextOrScenario: 'Hệ thống E-Commerce quy mô lớn đang gặp tình trạng một bảng `users` chứa hơn 80 cột (từ mật khẩu, họ tên, địa chỉ nhận hàng, hạng thành viên, thẻ tín dụng cho đến cấu hình thông báo) và bị gọi chéo bởi tất cả phòng ban.',
    expectedKeywords: ['Bounded Context', 'Domain Model', 'Ubiquitous Language', 'Conway’s Law', 'High Cohesion / Loose Coupling', 'Single Responsibility'],
    pitfalls: [
      'Cắt service theo tầng kỹ thuật (Database Service, API Service, Validation Service) thay vì theo ranh giới nghiệp vụ (Business Capability).',
      'Cố gắng duy trì một mô hình dữ liệu dùng chung duy nhất (Canonical Data Model) cho toàn bộ doanh nghiệp.',
      'Cắt service quá vụn (Nano-services) khiến một nghiệp vụ đơn giản phải trải qua 10 lời gọi HTTP/gRPC.'
    ],
    followUpQuestions: [
      'Tại sao cùng một thực thể "Khách hàng" (Customer) nhưng trong Auth Service, Shipping Service và Billing Service lại nên có cấu trúc dữ liệu khác nhau hoàn toàn?',
      'Mối quan hệ giữa Định luật Conway (Conway\'s Law) và cách phân chia ranh giới microservices trong doanh nghiệp là gì?'
    ],
    seniorAnswer: {
      summary: 'Bounded Context trong DDD là một ranh giới phân định mà bên trong đó một mô hình nghiệp vụ (Domain Model) có ý nghĩa duy nhất và nhất quán. Ví dụ: "User" trong Auth Context chỉ là \`{id, email, hash}\`; trong Shipping Context là \`{recipientName, address, phone}\`; trong Billing Context là \`{taxId, creditCardToken}\`. Cắt service theo Bounded Context đảm bảo tính kết dính cao (High Cohesion) và liên kết lỏng (Loose Coupling).',
      deepDive: '4 tiêu chí vàng của Senior Architect khi quyết định cắt service: (1) Ranh giới nghiệp vụ (Business Capability): Mỗi service đại diện cho một năng lực kinh doanh cụ thể (Order Fulfillment, Catalog Management, Payment Processing). (2) Tốc độ thay đổi (Rate of Change): Các module thay đổi và release 5 lần/ngày (Promotion/Marketing) tách khỏi module cốt lõi vài tháng mới sửa 1 lần (Billing/General Ledger). (3) Đặc thù tài nguyên & Mở rộng (Scalability & Hardware Fit): Module tính toán nặng cần GPU/Memory cao (AI Search/Video Rendering) tách khỏi module I/O-bound CRUD. (4) Tổ chức đội ngũ (Conway’s Law): Một service nên do một nhóm kỹ sư (Two-Pizza Team từ 4-8 người) sở hữu trọn vẹn từ code đến vận hành.',
      codeExample: `// Mô hình Bounded Context: Cùng một khái niệm "Product" nhưng mô hình khác nhau theo miền
// 1. Module Catalog (Tối ưu hóa tìm kiếm, hiển thị, SEO)
export interface CatalogProduct {
  id: string;
  slug: string;
  title: string;
  descriptionMarkdown: string;
  galleryImages: string[];
  attributes: Record<string, string>; // size, color, material
}

// 2. Module Inventory (Tối ưu hóa tồn kho, vị trí kệ hàng, đặt trước)
export interface InventoryStockItem {
  sku: string;
  warehouseId: string;
  aisleLocation: string; // Vị trí dãy hàng trong kho
  physicalStock: number;
  reservedStock: number;
  safetyThreshold: number;
}

// 3. Module Pricing (Tối ưu hóa biểu phí, thuế VAT, Flash sale rules)
export interface PricingItem {
  sku: string;
  basePriceCents: number;
  currency: 'VND' | 'USD';
  taxCategory: 'VAT_10' | 'EXEMPT';
  activeDiscounts: DiscountRule[];
}`
    }
  },

  'sys-024': {
    interviewerIntent: 'Đánh giá kiến thức phân tán nâng cao: Hiểu bản chất của Database-per-Service (Loose Coupling vs Shared DB), và các kỹ thuật giải quyết bài toán báo cáo / phân tích tổng hợp (Cross-service Reporting / Analytics) khi không thể dùng SQL JOIN.',
    contextOrScenario: 'Doanh nghiệp đã chuyển sang 15 microservices với Database-per-Service riêng biệt. Giám đốc Tài chính (CFO) yêu cầu xuất báo cáo hàng ngày: "Tổng doanh thu theo từng ngành hàng, kèm tỷ lệ hoàn đơn và thông tin độ tuổi khách hàng". Trước đây chỉ cần 1 câu lệnh JOIN 4 bảng, nhưng nay 4 bảng nằm ở 4 cơ sở dữ liệu hoàn toàn độc lập.',
    expectedKeywords: ['Database-per-Service', 'API Composition', 'Change Data Capture (CDC)', 'Debezium / Kafka', 'Data Warehouse (OLAP)', 'Read Model Projections'],
    pitfalls: [
      'Cho phép Service này query trực tiếp vào Database của Service khác (vi phạm nguyên tắc đóng gói, tạo mối phụ thuộc ngầm làm đổ vỡ schema).',
      'Cố gắng thực hiện "Distributed JOIN" bằng cách gọi REST API tuần tự qua mạng rồi ghép mảng trong code backend (gây nghẽn mạng, tốn RAM và timeout).',
      'Chạy các query báo cáo phân tích nặng hạt (Analytical queries) trực tiếp trên cơ sở dữ liệu giao dịch trực tuyến (OLTP).'
    ],
    followUpQuestions: [
      'Tại sao nên tách biệt hoàn toàn giữa hệ thống giao dịch OLTP và hệ thống phân tích OLAP (Data Warehouse)?',
      'Công nghệ Change Data Capture (CDC) như Debezium hoạt động như thế nào thông qua database transaction log (WAL / binlog)?'
    ],
    seniorAnswer: {
      summary: 'Mỗi microservice bắt buộc phải có Database riêng để đảm bảo tính tự chủ (Autonomy), độc lập nâng cấp schema mà không làm hỏng service khác, và loại bỏ điểm nghẽn chịu tải tập trung. Khi không thể dùng SQL JOIN, bài toán báo cáo được giải quyết bằng 2 chiến lược: (1) Với báo cáo thời gian thực đơn giản: Dùng API Composition hoặc CQRS Read View; (2) Với báo cáo phân tích phức tạp: Áp dụng Change Data Capture (CDC Debezium) đồng bộ dữ liệu về Data Warehouse / Data Lake (ClickHouse, BigQuery, Snowflake) để chạy query phân tích phân tán.',
      deepDive: 'Chi tiết kiến trúc báo cáo hiện đại: Tầng OLTP (Ứng dụng chạy hằng ngày) tối ưu cho các giao dịch đơn lẻ ghi chép nhanh (INSERT/UPDATE theo Primary Key). Không bao giờ được chạy query tính toán hàng triệu dòng tại đây. Giải pháp: Mỗi khi Service Order ghi DB, một Debezium connector lắng nghe PostgreSQL Write-Ahead Log (WAL) và đẩy sự kiện thay đổi vào Kafka Topic `order-cdc-events`. Các topic tương tự từ User Service và Inventory Service cũng chảy vào Kafka. Từ đó, Kafka Connect stream toàn bộ dữ liệu vào Data Warehouse (ClickHouse hoặc Google BigQuery). Tại Data Warehouse, dữ liệu được mô hình hóa theo dạng Star Schema hoặc One Big Table (OBT), cho phép chạy các câu lệnh JOIN và Aggregation trên hàng tỷ bản ghi chỉ trong vài giây.',
      codeExample: `# Kiến trúc CDC đồng bộ dữ liệu từ PostgreSQL Microservices về Data Warehouse
# 1. Cấu hình Debezium PostgreSQL Connector theo dõi bảng orders
{
  "name": "orders-cdc-connector",
  "config": {
    "connector.class": "io.debezium.connector.postgresql.PostgresConnector",
    "tasks.max": "1",
    "plugin.name": "pgoutput",
    "database.hostname": "order-db.internal",
    "database.port": "5432",
    "database.user": "debezium",
    "database.password": "secret",
    "database.dbname": "orders_db",
    "database.server.name": "order_service",
    "table.include.list": "public.orders,public.order_items"
  }
}

# 2. Truy vấn báo cáo tổng hợp siêu tốc trên ClickHouse (OLAP Data Warehouse)
SELECT
    c.category_name,
    COUNT(DISTINCT o.order_id) AS total_orders,
    SUM(oi.price * oi.quantity) AS gross_revenue,
    ROUND(COUNT(CASE WHEN o.status = 'REFUNDED' THEN 1 END) * 100.0 / COUNT(*), 2) AS refund_rate_pct
FROM dw.orders o
JOIN dw.order_items oi ON o.order_id = oi.order_id
JOIN dw.catalog_categories c ON oi.category_id = c.category_id
WHERE o.created_at >= today() - INTERVAL 30 DAY
GROUP BY c.category_name
ORDER BY gross_revenue DESC;`
    }
  },

  'sys-025': {
    interviewerIntent: 'Đánh giá kỹ năng chẩn đoán sự cố phân tán (Distributed Observability & Troubleshooting), sự am hiểu về tiêu chuẩn W3C Trace Context và khả năng xây dựng hạ tầng quan sát hệ thống (OpenTelemetry, Grafana Loki, Jaeger).',
    contextOrScenario: 'Một khách hàng VIP báo lỗi 500 khi bấm nút thanh toán đơn hàng. Request này đã đi qua API Gateway -> Order Service -> Voucher Service -> Payment Service -> Bank Adapter. Mỗi service in hàng chục nghìn dòng log mỗi phút vào các server/container khác nhau. Kỹ sư trực ca phải tìm ra chính xác nguyên nhân lỗi trong vòng 5 phút.',
    expectedKeywords: ['Distributed Tracing', 'W3C Trace Context', 'traceparent', 'Correlation ID', 'Span ID', 'OpenTelemetry', 'Centralized Logging'],
    pitfalls: [
      'Ghi log không cấu trúc (Unstructured Plain Text) khiến công cụ tìm kiếm log không thể bóc tách trường dữ liệu tự động.',
      'Quên truyền tiếp (Propagate) header Trace ID khi một service gọi service tiếp theo hoặc đẩy message vào Message Queue, làm gãy chuỗi vết (Broken Trace).',
      'In các thông tin nhạy cảm (PII: thẻ tín dụng, mật khẩu, JWT token bí mật) vào log gây vi phạm an toàn thông tin.'
    ],
    followUpQuestions: [
      'Khi một request kích hoạt một tác vụ chạy nền (Asynchronous Worker qua Kafka), bạn duy trì Trace Context qua message header như thế nào?',
      'Với quy mô hàng trăm triệu request mỗi ngày, làm thế nào để cấu hình Sampling (Tail-based Sampling vs Head-based Sampling) để giảm chi phí lưu trữ log/trace mà không bỏ sót các trace bị lỗi?'
    ],
    seniorAnswer: {
      summary: 'Để truy vết lỗi qua 5 service có log rải rác: (1) Cốt lõi là **Distributed Tracing & Correlation ID**; (2) API Gateway sinh một \`Trace ID\` duy nhất (chuẩn W3C \`traceparent\`) ngay tại cửa ngõ; (3) Mọi HTTP client và Message Queue bắt buộc tự động truyền tiếp (Context Propagation) header này qua tất cả các chặng; (4) Tất cả service xuất Structured JSON Log chứa \`traceId\` và \`spanId\`; (5) Đẩy log tập trung về Grafana Loki / OpenSearch để truy vấn gom toàn bộ log theo 1 cú click.',
      deepDive: 'Cơ chế chuẩn OpenTelemetry: Header `traceparent` tuân theo định dạng: `00-{traceId}-{spanId}-{traceFlags}` (ví dụ: `00-4bf92f3577b34da6a3ce929d0e0e4736-00f067aa0ba902b7-01`). Khi Service A gọi Service B: Client interceptor tiêm header này vào HTTP Request / Kafka Record Header. Tại Service B: Server middleware trích xuất `traceId`, sinh ra một `spanId` mới (đại diện cho đoạn công việc của Service B) với `parentSpanId` trỏ về span của Service A. Khi ghi log, thư viện logging (Winston / Pino) tự động chèn `traceId` vào mọi dòng log JSON. Khi xảy ra sự cố, kỹ sư chỉ cần lấy `traceId` trả về trong phản hồi lỗi của user và paste vào Grafana Explore để nhìn thấy toàn bộ sơ đồ Gantt biểu diễn độ trễ và log chi tiết của từng bước.',
      codeExample: `// Express Middleware tự động trích xuất và lan truyền W3C Trace Context & Correlation ID
import type { Request, Response, NextFunction } from 'express';
import crypto from 'node:crypto';
import pino from 'pino';

export const logger = pino({
  formatters: {
    level: (label) => ({ level: label }),
  },
  timestamp: pino.stdTimeFunctions.isoTime,
});

export function traceContextMiddleware(req: Request, res: Response, next: NextFunction) {
  // Trích xuất hoặc sinh mới Trace ID
  const traceparent = req.header('traceparent');
  let traceId = '';
  
  if (traceparent && traceparent.startsWith('00-')) {
    traceId = traceparent.split('-')[1];
  } else {
    traceId = crypto.randomBytes(16).toString('hex');
  }

  const spanId = crypto.randomBytes(8).toString('hex');
  const correlationId = req.header('x-correlation-id') || traceId;

  // Gắn vào request context để các hàm nghiệp vụ và outgoing HTTP client sử dụng
  req.headers['x-correlation-id'] = correlationId;
  req.headers['traceparent'] = \`00-\${traceId}-\${spanId}-01\`;
  res.setHeader('x-correlation-id', correlationId);

  // Tạo child logger chứa traceId cho riêng request này
  (req as unknown as { log: pino.Logger }).log = logger.child({
    traceId,
    spanId,
    correlationId,
    path: req.path,
    method: req.method,
  });

  next();
}`
    }
  },

  'sys-026': {
    interviewerIntent: 'Đo lường năng lực thiết kế kiến trúc Frontend toàn diện (Full-Spectrum Web Caching): Từ tầng giao vận HTTP, Browser Cache, Service Worker, Bộ nhớ In-Memory ứng dụng (Client State Cache) cho đến tầng lưu trữ Offline.',
    contextOrScenario: 'Một ứng dụng Single Page Application (SPA / React / Next.js) phục vụ 5 triệu người dùng mỗi ngày. Khi người dùng điều hướng qua lại giữa các trang sản phẩm, hệ thống bị giật lag, gọi API liên tục làm quá tải backend và tốn dung lượng 4G của khách hàng trên thiết bị di động.',
    expectedKeywords: ['HTTP Cache-Control', 'stale-while-revalidate', 'TanStack Query (React Query)', 'Service Worker (Cache API)', 'IndexedDB', 'Content Hashing (Immutable)'],
    pitfalls: [
      'Đặt `Cache-Control: no-cache` cho toàn bộ tài nguyên tĩnh khiến trình duyệt phải tải lại toàn bộ JS/CSS bundle sau mỗi lần refresh.',
      'Lưu trữ dữ liệu nhạy cảm hoặc token bí mật vào LocalStorage không mã hóa, dễ bị tấn công XSS đánh cắp.',
      'Không thiết lập thời gian staleTime cho client-side state cache, dẫn đến hiện tượng re-fetching liên tục mỗi khi người dùng đổi focus tab.'
    ],
    followUpQuestions: [
      'Tại sao việc kết hợp tên file có mã băm (Content Hashing: `bundle.a8b1c2.js`) với header `Cache-Control: max-age=31536000, immutable` lại là giải pháp tối thượng cho static assets?',
      'Cơ chế `stale-while-revalidate` hoạt động như thế nào để vừa đảm bảo độ trễ render tức thì (0ms) vừa giữ dữ liệu luôn mới?'
    ],
    seniorAnswer: {
      summary: 'Chiến lược Caching đa tầng cho Frontend: (1) HTTP Network Layer: Áp dụng \`immutable\` cho static assets có content hash, và \`stale-while-revalidate\` cho dynamic APIs; (2) In-Memory Data Cache: Dùng TanStack Query / SWR với \`staleTime\` hợp lý để deduplicate requests và cache kết quả API; (3) Application Shell Cache: Service Worker (Cache API) lưu trữ offline trang web PWA; (4) Heavy Structured Data: Sử dụng IndexedDB để lưu bản nháp và dữ liệu danh mục lớn.',
      deepDive: 'Chi tiết triển khai 4 tầng: Tầng 1 (Assets tĩnh): Thiết lập `Cache-Control: public, max-age=31536000, immutable`. File JS/CSS không bao giờ phải tải lại trừ khi có bản build mới với tên file thay đổi. Tầng 2 (Dữ liệu API): Sử dụng header `Cache-Control: public, s-maxage=60, stale-while-revalidate=300`. CDN hoặc Browser trả ngay bản cache cũ cho người dùng trong tích tắc, đồng thời âm thầm gửi request revalidate về Origin server. Tầng 3 (Client Query Cache): TanStack Query đóng vai trò in-memory normalized cache. Khi user nhảy qua lại các trang, component lấy ngay dữ liệu từ RAM (`staleTime: 5 * 60 * 1000`) mà không tốn 1 network request nào. Tầng 4 (Persistent Cache): Dùng thư viện Dexie.js (IndexedDB) lưu trữ sản phẩm đã xem hoặc giỏ hàng tạm, cho phép app khởi động tức thì ngay cả khi mất mạng.',
      codeExample: `// Cấu hình Caching đa tầng trên Client với TanStack Query v5
import { QueryClient, QueryClientProvider, useQuery } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,       // Dữ liệu được coi là tươi mới trong 5 phút (không fetch lại)
      gcTime: 1000 * 60 * 30,          // Giữ trong bộ nhớ RAM 30 phút trước khi dọn rác
      refetchOnWindowFocus: false,     // Không fetch lại khi user click quay lại tab trình duyệt
      retry: 2,                        // Tự động retry 2 lần nếu mạng chập chờn
    },
  },
});

// Hook sử dụng cache có tối ưu hóa optimistic data
export function useProductDetail(productId: string) {
  return useQuery({
    queryKey: ['product', productId],
    queryFn: async () => {
      const res = await fetch(\`/api/v1/products/\${productId}\`);
      if (!res.ok) throw new Error('Không thể tải thông tin sản phẩm');
      return res.json();
    },
    // Lấy dữ liệu tạm từ danh sách sản phẩm đã cache trước đó để hiển thị ngay tức thì (0ms)
    initialData: () => {
      const catalog = queryClient.getQueryData<Array<{ id: string; name: string }>>(['products-list']);
      return catalog?.find(p => p.id === productId);
    },
  });
}`
    }
  },

  'sys-027': {
    interviewerIntent: 'Đánh giá hiểu biết sâu sắc về kỹ thuật phân vùng ngang cơ sở dữ liệu quy mô lớn (Database Sharding), các thuật toán chia shard, các thách thức hóc búa (Cross-Shard Query, Rebalancing, Resharding) và thời điểm thích hợp để triển khai.',
    contextOrScenario: 'Cơ sở dữ liệu PostgreSQL của sàn thương mại điện tử chứa bảng `orders` đã vượt ngưỡng 2 Terabytes và 300 triệu dòng. Dù đã đánh index tối ưu, bổ sung Read Replicas và nâng cấp máy chủ lên cấu hình cao nhất của AWS (Vertical scaling chạm trần phần cứng), tốc độ ghi và IOPS đĩa cứng vẫn bị quá tải.',
    expectedKeywords: ['Horizontal Partitioning', 'Shard Key Selection', 'Consistent Hashing', 'Cross-Shard JOIN', 'Resharding & Rebalancing', 'Scatter-Gather'],
    pitfalls: [
      'Chọn sai Shard Key (ví dụ: Shard theo ngày tạo đơn): Dẫn đến hiện tượng Hotspot Shard — toàn bộ lưu lượng ghi hôm nay dồn hết vào 1 shard duy nhất, các shard cũ bị bỏ hoang.',
      'Vội vàng sharding khi chưa tối ưu hóa chỉ mục (Indexing), chưa dọn dẹp dữ liệu lưu trữ lịch sử (Archiving/Cold Storage) và chưa thử Read Replicas.',
      'Không lường trước độ phức tạp khi thực hiện truy vấn phân trang hoặc JOIN dữ liệu trải dài trên nhiều shard (Cross-shard aggregations).'
    ],
    followUpQuestions: [
      'Làm thế nào để chọn một Shard Key tối ưu để vừa cân bằng dữ liệu đồng đều, vừa đảm bảo 90% truy vấn chỉ cần chạm vào đúng 1 Shard duy nhất?',
      'Khi hệ thống cần mở rộng từ 4 Shards lên 8 Shards mà không được phép downtime, quy trình Resharding dữ liệu diễn ra như thế nào?'
    ],
    seniorAnswer: {
      summary: 'Database Sharding là kỹ thuật phân vùng ngang (Horizontal Partitioning) chia tách một bảng dữ liệu khổng lồ thành nhiều cơ sở dữ liệu nhỏ độc lập (Shards), mỗi shard lưu trữ một phần dữ liệu và chạy trên máy chủ riêng biệt. Các chiến lược phổ biến: (1) Hash-based Sharding: \`hash(shard_key) % N\` phân bố tải cực đều; (2) Range-based Sharding: Chia theo dải giá trị (ID/Thời gian); (3) Directory-based: Dùng bảng tra cứu (Lookup service). Sharding chỉ nên dùng khi quy mô dữ liệu vượt trần phần cứng của 1 node duy nhất.',
      deepDive: 'Chi tiết kỹ thuật và các thách thức lớn nhất: (1) Chọn Shard Key: Đây là quyết định sống còn. Nếu chọn `user_id` làm shard key cho E-commerce, toàn bộ đơn hàng của 1 khách hàng sẽ nằm chung trên 1 shard, giúp truy vấn "Xem lịch sử đơn của tôi" diễn ra nội bộ siêu nhanh mà không cần cross-shard. (2) Thách thức Cross-shard queries: Khi cần thống kê "Tìm tất cả đơn hàng có chứa sản phẩm X", hệ thống buộc phải dùng cơ chế Scatter-Gather (gọi song song tới toàn bộ N shards rồi gộp mảng ở tầng ứng dụng), gây hao tốn tài nguyên. (3) Resharding không downtime: Sử dụng Consistent Hashing hoặc Virtual Shards (chia sẵn 1,024 logic shards phân bố trên 4 physical nodes ban đầu; khi cần scale chỉ việc di chuyển các logic shards sang node mới thông qua CDC replication).',
      codeExample: `// Thuật toán Router định tuyến Shard bằng Consistent Hashing trên Node.js
import crypto from 'node:crypto';

export class ShardRouter {
  private shards: string[];

  constructor(shards: string[]) {
    this.shards = shards; // ['db_shard_01', 'db_shard_02', 'db_shard_03', 'db_shard_04']
  }

  // Băm shardKey (ví dụ: customerId) để chọn đúng kết nối Database Shard
  public getShardNode(shardKey: string): string {
    const hash = crypto.createHash('md5').update(shardKey).digest();
    // Đọc 4 bytes đầu tiên thành số nguyên không dấu 32-bit
    const hashInt = hash.readUInt32BE(0);
    const shardIndex = hashInt % this.shards.length;
    return this.shards[shardIndex];
  }
}

// Cách sử dụng trong Service: Đảm bảo thao tác ghi vào đúng Shard
// const router = new ShardRouter(['shard_us_1', 'shard_us_2', 'shard_eu_1', 'shard_ap_1']);
// const targetDb = router.getShardNode(user.id);
// await poolManager.getPool(targetDb).query('INSERT INTO orders ...');`
    }
  },

  'sys-028': {
    interviewerIntent: 'Kiểm tra kiến thức cốt lõi về mở rộng cơ sở dữ liệu quan hệ (Scale Out RDBMS): Hiểu cơ chế sao chép không đồng bộ (Asynchronous Replication), cạm bẫy trễ sao chép (Replication Lag) và giải pháp kiến trúc "Read-Your-Own-Writes".',
    contextOrScenario: 'Ứng dụng mạng xã hội triển khai 1 Primary Database để ghi và 3 Read Replicas để đọc. Người dùng vừa cập nhật tiểu sử (Bio) hoặc ảnh đại diện, bấm "Lưu", ứng dụng thông báo thành công và redirect về trang cá nhân. Tuy nhiên người dùng lại thấy thông tin cũ, tưởng app bị lỗi nên bấm F5 liên tục.',
    expectedKeywords: ['Master-Replica Replication', 'Replication Lag', 'Read-Your-Own-Writes', 'WAL / Binlog Streaming', 'Stale Reads', 'Sticky Routing'],
    pitfalls: [
      'Cho rằng dữ liệu ghi vào Master sẽ xuất hiện tức thì trên Replica (trong thực tế replication là async, có độ trễ từ vài chục ms đến hàng giây khi mạng nghẽn).',
      'Định tuyến toàn bộ query đọc vào Replica mà không có ngoại lệ cho luồng vừa ghi của chính user đó.',
      'Không giám sát Replication Lag (chỉ số \`pg_stat_replication.replay_lag\` hoặc \`Seconds_Behind_Master\`), dẫn đến phục vụ dữ liệu rác cũ nhiều giờ liền khi replica bị treo.'
    ],
    followUpQuestions: [
      'Làm thế nào để triển khai cơ chế "Read-Your-Own-Writes" một cách thanh lịch mà không cần phải định tuyến tất cả request về Master?',
      'Khi Master Database bị sập phần cứng, quá trình Failover tự động (thúc đẩy một Replica lên làm Master mới) diễn ra như thế nào để tránh thảm họa Split-Brain?'
    ],
    seniorAnswer: {
      summary: 'Read Replica sao chép dữ liệu từ Master (Primary) sang các Replicas (Secondaries) thông qua transaction log (WAL / binlog) để mở rộng thông lượng đọc (Read Throughput) lên gấp nhiều lần. Hạn chế lớn nhất là **Replication Lag (Trễ sao chép)** gây ra hiện tượng Đọc dữ liệu cũ (Stale Read): Người dùng vừa lưu thông tin xong load lại trang vẫn thấy dữ liệu cũ. Giải pháp chuẩn mực là áp dụng quy tắc **Read-Your-Own-Writes**.',
      deepDive: 'Chiến thuật xử lý Replication Lag chuẩn Senior: (1) Cơ chế Read-Your-Own-Writes: Sau khi người dùng thực hiện một thao tác ghi (POST/PUT/DELETE), server gắn một cookie hoặc header tạm thời ghi nhận mốc thời gian (ví dụ: `just_wrote_until = timestamp + 5000ms`). Trong vòng 5 giây tiếp theo, mọi request đọc từ người dùng này sẽ được định tuyến thẳng vào Primary DB để đảm bảo thấy dữ liệu mới nhất; các người dùng khác vẫn đọc từ Replicas. (2) Đọc có điều kiện theo Transaction ID (LSN - Log Sequence Number): Client nhận LSN sau khi ghi, Replica chỉ phục vụ request nếu LSN của nó đã bắt kịp LSN của client. (3) Giám sát chặt chẽ: Cảnh báo tự động nếu Replication Lag > 1 giây để tạm thời gạch tên Replica khỏi cụm Load Balancing.',
      codeExample: `// Middleware định tuyến kết nối Database thông minh: Primary vs Read-Replica
import type { Request, Response, NextFunction } from 'express';

export function databaseRoutingMiddleware(req: Request, res: Response, next: NextFunction) {
  const lastWriteTime = req.cookies['last_write_at'];
  const now = Date.now();

  // Nếu người dùng vừa thực hiện ghi dữ liệu trong vòng 5 giây qua -> Buộc đọc từ PRIMARY DB
  if (lastWriteTime && now - Number(lastWriteTime) < 5000) {
    req.dbClient = primaryDbPool;
    res.setHeader('X-DB-Source', 'PRIMARY-STICKY');
    return next();
  }

  // Các request đọc thông thường (GET) được phân tải qua cụm READ REPLICAS
  if (req.method === 'GET') {
    req.dbClient = replicaDbPool;
    res.setHeader('X-DB-Source', 'REPLICA');
  } else {
    // Request ghi (POST/PUT/PATCH/DELETE): Ghi vào PRIMARY và đánh dấu mốc thời gian
    req.dbClient = primaryDbPool;
    res.cookie('last_write_at', String(now), { maxAge: 5000, httpOnly: true });
    res.setHeader('X-DB-Source', 'PRIMARY');
  }

  next();
}`
    }
  },

  'sys-029': {
    interviewerIntent: 'Đánh giá năng lực thiết kế bộ điều tiết lưu lượng phân tán (Distributed Rate Limiting), sự thông thạo các thuật toán cốt lõi và kỹ thuật xử lý Race Condition trong môi trường đa máy chủ (Multi-instance concurrency).',
    contextOrScenario: 'Một nền tảng Open API công khai cung cấp dịch vụ tra cứu tỷ giá ngoại tệ. Cần áp dụng chính sách: Mỗi API Key miễn phí chỉ được gọi tối đa 100 requests mỗi phút. Hệ thống backend gồm 10 instances chạy song song sau Load Balancer.',
    expectedKeywords: ['Token Bucket', 'Leaky Bucket', 'Sliding Window Counter', 'Redis Lua Script', 'HTTP 429 Too Many Requests', 'Retry-After'],
    pitfalls: [
      'Lưu bộ đếm trong bộ nhớ cục bộ (Local In-Memory) của từng máy chủ: Khi có 10 instances, người dùng có thể gọi tới 1,000 requests/phút thay vì 100.',
      'Áp dụng thuật toán Fixed Window Counter đơn giản: Dính lỗi ranh giới (Boundary Burst) — người dùng gọi 100 request ở giây 59 và 100 request ở giây 01 của phút tiếp theo, tạo đỉnh tải 200 req trong 2 giây.',
      'Sử dụng Redis `GET` rồi tính toán trong code rồi `SET`: Gây Race Condition nghiêm trọng khi có hàng trăm request đồng thời.'
    ],
    followUpQuestions: [
      'Tại sao việc thực thi thuật toán Rate Limiter trên Redis bắt buộc phải đóng gói trong một khối Redis Lua Script?',
      'Khi Redis Cluster gặp sự cố gián đoạn mạng (Network Partition), bạn thiết kế Rate Limiter theo hướng Fail-Open (cho qua hết) hay Fail-Closed (chặn hết)?'
    ],
    seniorAnswer: {
      summary: 'Rate Limiting kiểm soát tốc độ gửi request của client để bảo vệ API khỏi bị quá tải, chống tấn công DoS/Brute-force và đảm bảo công bằng tài nguyên. 4 thuật toán phổ biến: (1) **Token Bucket**: Bơm token đều đặn, cho phép chịu tải tăng vọt ngắn hạn (Bursting); (2) **Leaky Bucket**: Xả request với tốc độ không đổi (Làm phẳng lưu lượng); (3) **Fixed Window**: Đếm theo phút cố định (Dễ dính lỗi Boundary Burst); (4) **Sliding Window Counter**: Thuật toán cân bằng hoàn hảo nhất, cài đặt nguyên tử qua Redis Lua Script.',
      deepDive: 'Chi tiết thuật toán Sliding Window Counter chuẩn Production: Chia thời gian thành các cửa sổ con (ví dụ: từng phút). Công thức ước tính số request trong cửa sổ trượt: `count = current_window_count + previous_window_count * (1 - time_into_current_window)`. Khi kiểm tra hạn mức, ta thực thi logic này hoàn toàn bên trong Redis thông qua Lua Script để đảm bảo tính nguyên tử tuyệt đối (Zero Race Condition) mà không cần dùng Distributed Lock đắt đỏ. Khi người dùng vượt quá ngưỡng, server lập tức trả về mã HTTP 429 Too Many Requests kèm các headers tiêu chuẩn RFC 6585: `X-RateLimit-Limit`, `X-RateLimit-Remaining`, và `Retry-After: 30` (hướng dẫn client chờ bao nhiêu giây trước khi retry).',
      codeExample: `-- Redis Lua Script: Sliding Window Counter Rate Limiter nguyên tử
-- KEYS[1]: key hiện tại (vd: 'ratelimit:user_123:minute:28')
-- KEYS[2]: key phút trước (vd: 'ratelimit:user_123:minute:27')
-- ARGV[1]: giới hạn request (vd: 100)
-- ARGV[2]: tỷ lệ thời gian đã trôi qua trong phút hiện tại (vd: 0.35)

local current_count = tonumber(redis.call('get', KEYS[1]) or '0')
local previous_count = tonumber(redis.call('get', KEYS[2]) or '0')
local time_weight = 1 - tonumber(ARGV[2])

local estimated_requests = current_count + (previous_count * time_weight)

if estimated_requests >= tonumber(ARGV[1]) then
    return 0 -- Bị Rate Limit (Từ chối)
else
    redis.call('incr', KEYS[1])
    redis.call('expire', KEYS[1], 120) -- Tự động dọn rác sau 2 phút
    return 1 -- Hợp lệ (Cho qua)
end`
    }
  },

  'sys-030': {
    interviewerIntent: 'Kiểm tra sự hiểu biết sâu sắc về tầng quản lý kết nối cơ sở dữ liệu (Database Networking & Resource Lifecycle), các chi phí vật lý của giao thức TCP/TLS và công thức xác định quy mô Connection Pool tối ưu.',
    contextOrScenario: 'Một ứng dụng Node.js/Go backend được scale từ 5 pods lên 40 pods trong chiến dịch Black Friday. Mặc dù CPU của database PostgreSQL chỉ mới ở mức 40%, ứng dụng đột ngột bắt đầu trả về lỗi hàng loạt: `FATAL: remaining connection slots are reserved for non-replicated superuser connections`.',
    expectedKeywords: ['Connection Pooling', 'HikariCP / PgBouncer', 'TCP 3-Way Handshake', 'Context Switching', 'max_connections', 'Thread-per-Connection'],
    pitfalls: [
      'Cho rằng càng mở nhiều connection vào Database thì hệ thống chạy càng nhanh (thực tế quá nhiều connection làm CPU DB kiệt quệ vì tranh chấp Lock và Context Switching).',
      'Mở và đóng kết nối cơ sở dữ liệu thủ công trong từng hàm xử lý HTTP request (gây lãng phí tài nguyên và tạo độ trễ khổng lồ).',
      'Không tính toán tổng connection tối đa: 40 pods * mỗi pod 50 pool connections = 2,000 connections, vượt xa ngưỡng chịu đựng mặc định của PostgreSQL (100 connections).'
    ],
    followUpQuestions: [
      'Công thức nổi tiếng của PostgreSQL để tính toán Connection Pool Size tối ưu dựa trên số CPU Cores là gì?',
      'Tại sao trong kiến trúc Serverless (AWS Lambda), người ta bắt buộc phải đặt một Connection Pooler tập trung như AWS RDS Proxy hoặc PgBouncer ở giữa?'
    ],
    seniorAnswer: {
      summary: 'Connection Pooling duy trì sẵn một tập hợp các kết nối cơ sở dữ liệu mở sẵn để tái sử dụng, loại bỏ chi phí đắt đỏ của việc bắt tay TCP, đàm phán TLS và cấp phát bộ nhớ tiến trình (PostgreSQL tốn ~5-10MB RAM cho mỗi connection). Connection Pool ngăn chặn sập cơ sở dữ liệu khi traffic tăng vọt và giữ số lượng kết nối đồng thời ở ngưỡng hiệu năng tối ưu nhất của CPU.',
      deepDive: 'Nguyên lý cốt lõi: Trong RDBMS cổ điển như PostgreSQL, mỗi kết nối là một tiến trình con (Process) riêng biệt trên Linux. Nếu cho phép 1,000 connections đồng thời cạnh tranh 16 CPU cores, phần lớn thời gian CPU sẽ bị lãng phí cho việc chuyển đổi ngữ cảnh (Context Switching) và chờ đợi I/O Disk, khiến throughput giảm mạnh thay vì tăng. Công thức vàng của HikariCP / Postgres: \`connections = (cpu_cores * 2) + effective_spindle_count\`. Ví dụ: Một server DB 16 cores chạy SSD NVMe chỉ cần khoảng 32-40 connections là đạt thông lượng tối đa. Trong kiến trúc Microservices hoặc Serverless với hàng trăm instances, bắt buộc phải dùng External Connection Pooler như **PgBouncer** (chạy chế độ Transaction Pooling) đứng trước Postgres để gom hàng nghìn kết nối từ client thành vài chục kết nối thực tế tới database.',
      codeExample: `# Cấu hình PgBouncer tối ưu hiệu năng cao (pgbouncer.ini)
[databases]
production_db = host=127.0.0.1 port=5432 dbname=production_db

[pgbouncer]
listen_addr = 0.0.0.0
listen_port = 6432
auth_type = scram-sha-256
auth_file = /etc/pgbouncer/userlist.txt

# Chế độ Transaction Pooling: Mượn kết nối khi bắt đầu transaction, trả lại ngay khi COMMIT
# Cho phép 10,000 client connections chia sẻ chung 50 kết nối thực tới PostgreSQL
pool_mode = transaction

max_client_conn = 10000     # Tối đa 10,000 kết nối từ các pods backend
default_pool_size = 50      # Duy trì tối đa 50 kết nối thực sự tới PostgreSQL
min_pool_size = 10          # Giữ sẵn 10 kết nối ấm
reserve_pool_size = 10      # Dự phòng khi có đột biến tải
server_idle_timeout = 600   # Giải phóng kết nối rỗi sau 10 phút`
    }
  },

  'sys-031': {
    interviewerIntent: 'Đánh giá năng lực thiết kế kiến trúc phân tách trách nhiệm (Architectural Segregation), tư duy mô hình hóa dữ liệu bất đối xứng (Asymmetric Data Models) và khả năng xử lý tính nhất quán cuối cùng (Eventual Consistency) trong các hệ thống phức tạp.',
    contextOrScenario: 'Một sàn giao dịch chứng khoán hoặc hệ thống quản lý logistics: Luồng ghi lệnh đòi hỏi xác thực quy tắc nghiệp vụ khắt khe, tính toàn vẹn cao và audit trail; trong khi luồng đọc bảng điện tử phục vụ hàng triệu người dùng đòi hỏi tốc độ siêu tốc, lọc theo nhiều tiêu chí mà không được làm chậm luồng ghi.',
    expectedKeywords: ['Command Query Responsibility Segregation (CQRS)', 'Read Model vs Write Model', 'Eventual Consistency', 'Materialized View', 'Projections', 'Domain Invariants'],
    pitfalls: [
      'Áp dụng CQRS cho các ứng dụng CRUD đơn giản, làm tăng gấp đôi độ phức tạp của codebase mà không mang lại giá trị tương xứng.',
      'Không giải thích được cách xử lý độ trễ đồng bộ giữa Command Model và Query Model cho người dùng trên giao diện.',
      'Sử dụng chung một cơ sở dữ liệu quan hệ với cùng một bảng cho cả Command và Query, chỉ tách class code một cách hình thức mà không giải quyết được bài toán scale hiệu năng.'
    ],
    followUpQuestions: [
      'Khi nào nên kết hợp CQRS với Event Sourcing và khi nào nên sử dụng CQRS độc lập với cơ sở dữ liệu quan hệ truyền thống?',
      'Nếu Query Model bị mất đồng bộ (bị lỗi trong quá trình tiêu thụ event từ Command Model), chiến lược khắc phục và Rebuild Projections diễn ra thế nào?'
    ],
    seniorAnswer: {
      summary: 'CQRS (Command Query Responsibility Segregation) là mẫu kiến trúc tách biệt hoàn toàn mô hình Xử lý Thay đổi Trạng thái (Command: INSERT/UPDATE/DELETE, tập trung bảo vệ quy tắc nghiệp vụ) và mô hình Truy vấn Dữ liệu (Query: SELECT, tối ưu hóa cấu trúc dữ liệu cho hiển thị). CQRS cho phép mở rộng độc lập hiệu năng đọc/ghi, chọn cơ sở dữ liệu tối ưu cho từng tác vụ (Polyglot Persistence) và đơn giản hóa các truy vấn phức tạp.',
      deepDive: 'Chi tiết hai nhánh trong CQRS: (1) Nhánh Command (Ghi): Nhận `CreateOrderCommand`. Tầng Domain xử lý nghiệp vụ, kiểm tra tính hợp lệ và ghi vào Command DB (ví dụ: PostgreSQL được chuẩn hóa 3NF để đảm bảo tính toàn vẹn dữ liệu). Sau khi ghi thành công, Command Service phát ra sự kiện `OrderCreatedEvent` vào Message Broker. (2) Nhánh Query (Đọc): Một Projection Worker lắng nghe sự kiện, biến đổi dữ liệu thành dạng Denormalized và lưu vào Query DB chuyên dụng (ví dụ: Elasticsearch cho tìm kiếm full-text, Redis cho dashboard thời gian thực). Phía Frontend khi gọi GET API chỉ cần query trực tiếp vào Query DB với độ trễ < 5ms mà không cần thực hiện bất kỳ câu JOIN phức tạp nào.',
      codeExample: `// Mô hình CQRS tách biệt Command Handler và Query Handler trong TypeScript
// 1. Nhánh COMMAND (Ghi dữ liệu & Thực thi Nghiệp vụ)
export class CreateOrderCommandHandler {
  constructor(private orderRepo: OrderRepository, private eventBus: EventBus) {}

  async execute(command: CreateOrderCommand): Promise<string> {
    // Thực thi Domain Invariants & Validation
    if (command.items.length === 0) throw new Error('Đơn hàng không có sản phẩm');
    const order = Order.create(command.userId, command.items);
    
    await this.orderRepo.save(order); // Lưu vào Relational DB (3NF)
    await this.eventBus.publish(new OrderCreatedEvent(order.id, order.toDTO()));
    return order.id;
  }
}

// 2. Nhánh QUERY (Đọc dữ liệu siêu tốc từ Denormalized Read View)
export class OrderQueryHandler {
  constructor(private readDb: ElasticsearchClient) {}

  async getCustomerOrderSummary(userId: string): Promise<OrderSummaryView[]> {
    // Truy vấn trực tiếp bản ghi JSON phẳng đã được chiếu sẵn, không cần JOIN
    const response = await this.readDb.search({
      index: 'order_read_views',
      query: { term: { userId } },
    });
    return response.hits.map(hit => hit._source);
  }
}`
    }
  },

  'sys-032': {
    interviewerIntent: 'Kiểm tra sự am hiểu sâu sắc về kiến trúc định hướng sự kiện (Event-Driven State Management), triết lý lưu trữ bất biến (Immutable Ledger) và khả năng phân tích trade-offs trong hệ thống tài chính / audit.',
    contextOrScenario: 'Một hệ thống ngân hàng lõi (Core Banking) hoặc ví điện tử: Mỗi thao tác nạp tiền, chuyển khoản, tính lãi suất đều đòi hỏi khả năng kiểm toán 100% không thể chối cãi. Việc chỉ lưu số dư hiện tại trong bảng `accounts` bị thanh tra tài chính từ chối vì không chứng minh được lịch sử biến động số dư đã diễn ra chính xác như thế nào.',
    expectedKeywords: ['Event Sourcing', 'Immutable Append-Only Log', 'State Reconstruction (Replay)', 'Snapshots', 'Audit Trail', 'Temporal Query (Time Travel)'],
    pitfalls: [
      'Áp dụng Event Sourcing cho toàn bộ các module trong hệ thống, biến ứng dụng thông thường thành ác mộng phát triển.',
      'Không triển khai cơ chế Snapshot định kỳ: Khi một tài khoản có 100,000 sự kiện, việc replay từ đầu để tính số dư hiện tại sẽ làm treo máy chủ.',
      'Sửa đổi hoặc xóa bỏ các sự kiện đã lưu trong Event Store (vi phạm nguyên tắc bất biến của Event Sourcing).'
    ],
    followUpQuestions: [
      'Khi cấu trúc dữ liệu của một Event trong quá khứ bị lỗi thời (Event Schema Evolution), bạn giải quyết vấn đề tương thích ngược (Backward Compatibility) như thế nào?',
      'Làm thế nào để kết hợp Event Sourcing với CQRS để người dùng có thể tìm kiếm dữ liệu mà không cần phải replay toàn bộ Event Stream?'
    ],
    seniorAnswer: {
      summary: 'Event Sourcing là mẫu kiến trúc lưu trữ toàn bộ sự biến đổi trạng thái của hệ thống dưới dạng một chuỗi các sự kiện bất biến chỉ được ghi thêm (Append-Only Event Stream), thay vì chỉ lưu trữ trạng thái hiện tại (Current State). Trạng thái hiện tại được tái tạo bằng cách replay lại toàn bộ sự kiện từ đầu. Ưu điểm vượt trội: Lưu vết kiểm toán (Audit Trail) hoàn hảo 100%, du hành thời gian (Time Travel Debugging) và phân tích lịch sử chính xác tuyệt đối.',
      deepDive: 'Chi tiết vận hành trong hệ thống Fintech: (1) Thay vì lưu `balance = 500,000`, hệ thống lưu chuỗi sự kiện: `AccountOpenedEvent(100k)`, `MoneyDepositedEvent(500k)`, `MoneyWithdrawnEvent(100k)`. (2) Snapshot Optimization: Cứ mỗi 100 events, hệ thống tạo một Snapshot lưu trạng thái tại thời điểm đó. Khi cần tính số dư hiện tại, hệ thống nạp bản Snapshot gần nhất và chỉ replay các events phát sinh sau Snapshot, giảm thời gian tính toán từ vài giây xuống < 5ms. (3) Bất biến: Không bao giờ có lệnh `UPDATE` hay `DELETE` trong Event Store. Nếu chuyển nhầm tiền, ta ghi thêm một sự kiện bù trừ `CompensatingEvent: MoneyRefunded` chứ không được xóa sự kiện chuyển tiền cũ.',
      codeExample: `// Triển khai Event Sourcing Aggregate Root cho Tài Khoản Ngân Hàng
export class BankAccountAggregate {
  private id: string = '';
  private balance: number = 0;
  private version: number = 0;

  // Tái tạo trạng thái (Replay Events)
  public static fromEvents(events: Array<{ type: string; payload: unknown; version: number }>): BankAccountAggregate {
    const account = new BankAccountAggregate();
    for (const event of events) {
      account.apply(event, false);
    }
    return account;
  }

  // Thực thi nghiệp vụ và sinh Event mới
  public withdrawMoney(amount: number) {
    if (amount <= 0) throw new Error('Số tiền rút phải lớn hơn 0');
    if (this.balance < amount) throw new Error('Số dư tài khoản không đủ');

    this.apply({
      type: 'MoneyWithdrawn',
      payload: { amount, balanceAfter: this.balance - amount },
      version: this.version + 1,
    }, true);
  }

  // Cập nhật trạng thái nội bộ dựa trên sự kiện
  private apply(event: { type: string; payload: unknown; version: number }, isNew: boolean) {
    switch (event.type) {
      case 'AccountOpened':
        this.balance = (event.payload as { initialBalance: number }).initialBalance;
        break;
      case 'MoneyWithdrawn':
        this.balance -= (event.payload as { amount: number }).amount;
        break;
    }
    this.version = event.version;
  }

  public getBalance(): number { return this.balance; }
}`
    }
  },

  'sys-033': {
    interviewerIntent: 'Đánh giá khả năng mở rộng quy mô các dịch vụ có duy trì trạng thái kết nối liên tục (Stateful Services: WebSocket, Live Streaming, Realtime Gaming), sự am hiểu về định tuyến phiên làm việc và giao thức điều phối phân tán.',
    contextOrScenario: 'Một nền tảng Game nhiều người chơi hoặc ứng dụng Live Collaboration (như Figma/Google Docs): Hàng chục nghìn người dùng duy trì kết nối WebSocket thời gian thực kéo dài nhiều giờ liền. Cần mở rộng hệ thống từ 2 server lên 20 servers mà vẫn đảm bảo người dùng trong cùng một phòng chơi nhận được thao tác của nhau tức thì.',
    expectedKeywords: ['Stateful Horizontal Scaling', 'WebSocket Cluster', 'Redis Pub/Sub', 'Consistent Hashing Ring', 'Sticky Sessions', 'Actor Model (Akka/Orleans)'],
    pitfalls: [
      'Sử dụng Sticky Session đơn thuần: Khi một máy chủ game bị sập, toàn bộ phòng chơi trên máy chủ đó bị đứt kết nối và mất trắng trạng thái trận đấu.',
      'Cố gắng biến toàn bộ ứng dụng thành Stateless bằng cách lưu mọi thao tác gõ phím vào database, làm độ trễ tăng từ 5ms lên 200ms gây giật lag.',
      'Broadcast tin nhắn tới toàn bộ các node máy chủ một cách mù quáng (N*N network amplification) làm nghẽn băng thông mạng nội bộ.'
    ],
    followUpQuestions: [
      'Làm thế nào để sử dụng Redis Pub/Sub hoặc Redis Streams để làm cầu nối giao tiếp giữa các WebSocket servers khác nhau?',
      'Khi một node WebSocket máy chủ bị crash đột ngột, làm thế nào để hàng nghìn client tự động kết nối lại (Reconnection Storm) mà không làm sập các node còn lại?'
    ],
    seniorAnswer: {
      summary: 'Các mẫu hình mở rộng ngang cho Stateful Services: (1) Dịch chuyển tối đa về Stateless: Tách Session lưu vào Redis Cluster tập trung; (2) Đối với dịch vụ buộc phải duy trì Stateful (WebSocket, Realtime Collab): Sử dụng Kiến trúc Phân tán kết hợp **Distributed Pub/Sub (Redis / Kafka)** làm Backplane nối các node; (3) Định tuyến thông minh: Dùng Consistent Hashing hoặc Cluster Coordinator (Actor Model) để đưa các user trong cùng một Room về cùng một node máy chủ.',
      deepDive: 'Chi tiết kiến trúc WebSocket Scaling: Khi Client A kết nối tới Server 1 và Client B kết nối tới Server 2 (cùng ở trong Chat Room #88): (1) Cả Server 1 và Server 2 đều đăng ký (Subscribe) kênh `room:88` trên Redis Pub/Sub cluster. (2) Khi Client A gửi tin nhắn: Server 1 publish message vào Redis kênh `room:88`. (3) Redis phân phối message tới tất cả các server đang có kết nối của room đó (Server 1 và Server 2). Server 2 nhận được event và bắn xuống socket của Client B qua kết nối TCP cục bộ đang mở. (4) Chống Reconnection Storm: Khi 1 server sập, client áp dụng giải thuật Exponential Backoff có thêm yếu tố ngẫu nhiên (Jitter) khi kết nối lại để không đè bẹp các máy chủ còn sống.',
      codeExample: `// Mở rộng WebSocket Server ngang hàng bằng Redis Pub/Sub Adapter (Node.js & Socket.io)
import { createServer } from 'node:http';
import { Server } from 'socket.io';
import { createClient } from 'redis';
import { createAdapter } from '@socket.io/redis-adapter';

const httpServer = createServer();
const io = new Server(httpServer, {
  cors: { origin: '*' },
  transports: ['websocket'], // Bỏ qua HTTP Long-polling để tiết kiệm tài nguyên
});

// Kết nối 2 client Redis riêng biệt cho Publish và Subscribe
const pubClient = createClient({ url: process.env.REDIS_URL || 'redis://localhost:6379' });
const subClient = pubClient.duplicate();

await Promise.all([pubClient.connect(), subClient.connect()]);

// Gắn Redis Adapter: Cho phép broadcast tin nhắn xuyên suốt nhiều máy chủ WebSocket
io.adapter(createAdapter(pubClient, subClient));

io.on('connection', (socket) => {
  socket.on('join_room', (roomId) => {
    socket.join(roomId);
  });

  socket.on('send_message', ({ roomId, message }) => {
    // Tin nhắn tự động được đồng bộ tới mọi người dùng trong room ở bất kỳ server nào
    io.to(roomId).emit('new_message', { sender: socket.id, message });
  });
});

httpServer.listen(process.env.PORT || 3000);`
    }
  },

  'sys-034': {
    interviewerIntent: 'Đánh giá năng lực ra quyết định cấp cao (Executive Architecture Decisions), khả năng cân đối giữa chi phí phát triển và khả năng chịu tải, và phương pháp luận chuyển dịch kiến trúc không rủi ro (Strangler Fig Pattern).',
    contextOrScenario: 'Một hệ thống Monolith thương mại điện tử lớn với 2 triệu dòng code đã vận hành 5 năm, bắt đầu gặp tình trạng release bị chậm (mỗi lần deploy phải kiểm thử hồi quy 3 ngày) và bảng `orders` quá tải. Ban Giám Đốc muốn chuyển đổi toàn bộ sang Microservices.',
    expectedKeywords: ['Monolith vs Microservices', 'Strangler Fig Pattern', 'Organizational Scalability', 'Two-Pizza Teams', 'Anti-Corruption Layer', 'Big Bang Rewrite Fallacy'],
    pitfalls: [
      'Chủ trương đập đi viết lại toàn bộ từ đầu (Big Bang Rewrite): 90% dự án đập đi viết lại thất bại do không theo kịp các tính năng mới liên tục sinh ra trong hệ thống cũ.',
      'Nghĩ rằng chuyển sang Microservices sẽ giải quyết được vấn đề viết code kém hoặc thiếu tài liệu kỹ thuật.',
      'Không xây dựng nền tảng hạ tầng tự động hóa (Automated CI/CD, Container Orchestration, Centralized Monitoring) trước khi bắt đầu tách services.'
    ],
    followUpQuestions: [
      'Quy trình 4 giai đoạn của Strangler Fig Pattern để bóc tách một dịch vụ từ Monolith sang Microservices mà không có downtime là gì?',
      'Anti-Corruption Layer (ACL) đóng vai trò gì trong việc bảo vệ domain model mới khỏi bị ô nhiễm bởi các định dạng dữ liệu lỗi thời của Monolith cũ?'
    ],
    seniorAnswer: {
      summary: 'Monolith gom toàn bộ hệ thống vào một đơn vị triển khai duy nhất (Ưu điểm: Dễ phát triển ban đầu, deploy đơn giản, gọi hàm nội bộ không có độ trễ mạng; Nhược điểm: Khó scale độc lập từng phần, rủi ro 1 lỗi nhỏ làm sập cả app, xung đột release khi team đông); Microservices phân rã thành các dịch vụ độc lập kết nối qua mạng (Ưu điểm: Tự chủ deploy, scale linh hoạt; Nhược điểm: Độ phức tạp vận hành và trễ mạng cao). Chỉ nên chuyển sang Microservices khi quy mô đội ngũ vượt quá 30-50 kỹ sư và ranh giới nghiệp vụ đã rõ ràng.',
      deepDive: 'Chiến lược chuyển đổi an toàn nhất là áp dụng **Strangler Fig Pattern (Cây si bóp nghẹt)**, tuyệt đối không dùng Big Bang Rewrite: (1) Đặt API Gateway phía trước Monolith cũ; (2) Chọn một module có độ phụ thuộc thấp nhất hoặc cần scale nhiều nhất (ví dụ: Notification hoặc Catalog) để bóc tách trước; (3) Viết service mới và xây dựng Anti-Corruption Layer (ACL) để đồng bộ dữ liệu hai chiều; (4) Cấu hình API Gateway chuyển dần lưu lượng sang service mới (Canary Routing: 5% -> 20% -> 100%); (5) Sau khi kiểm tra ổn định, xóa bỏ code cũ trong Monolith. Lặp lại quy trình cho các module tiếp theo cho đến khi Monolith cũ chỉ còn là một service nhỏ hoặc biến mất hoàn toàn.',
      codeExample: `# Cấu hình Định tuyến Strangler Fig Pattern trên Nginx Reverse Proxy
# Chuyển đổi dần traffic từ Monolith cũ sang Microservice mới không downtime

upstream monolith_legacy {
    server monolith-app.internal:8080 max_fails=3 fail_timeout=10s;
    keepalive 32;
}

upstream notification_microservice {
    server notification-svc.internal:3000 max_fails=3 fail_timeout=10s;
    keepalive 32;
}

server {
    listen 80;
    server_name api.ecommerce.com;

    # 1. Module đã được tách thành công -> Định tuyến thẳng sang Microservice mới
    location /api/v1/notifications {
        proxy_pass http://notification_microservice;
        proxy_set_header Host $host;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_http_version 1.1;
        proxy_set_header Connection "";
    }

    # 2. Toàn bộ các API còn lại -> Tiếp tục định tuyến vào Monolith cũ
    location / {
        proxy_pass http://monolith_legacy;
        proxy_set_header Host $host;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_http_version 1.1;
        proxy_set_header Connection "";
    }
}`
    }
  }
};

let count = 0;
for (const [id, update] of Object.entries(updatesPart2)) {
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
console.log(`Realigned Part 2 successfully: ${count} questions updated in system-design-bank.json`);
