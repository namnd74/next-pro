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
// 1. DATA ENGINEERING, CS, SECURITY, PATTERNS, DSA
// ==========================================
const dataEngUpdates = {
  'de-002': {
    diagram: {
      type: 'mermaid',
      title: 'So Sánh Kiến Trúc Pipeline Dữ Liệu: ETL vs ELT',
      caption: 'ETL biến đổi dữ liệu trước khi nạp; ELT tận dụng sức mạnh tính toán MPP của Modern Cloud Data Warehouses (Snowflake/BigQuery)',
      code: `flowchart TD
    subgraph ETL ["Mô Hình ETL Truyền Thống (Extract - Transform - Load)"]
        Source1["Nguồn Dữ Liệu Thô (DB, Logs)"] -->|"1. Trích xuất (Extract)"| Srv["Máy Chủ Xử Lý Trung Gian (Informatica / Spark Cluster)"]
        Srv -->|"2. Biến đổi dữ liệu nặng (Transform)"| Srv
        Srv -->|"3. Nạp dữ liệu sạch vào (Load)"| DWH1[("Data Warehouse Cổ Điển")]
    end

    subgraph ELT ["Mô Hình ELT Hiện Đại (Extract - Load - Transform)"]
        Source2["Nguồn Dữ Liệu Thô"] -->|"1. Trích xuất (Extract)"| Fivetran["Fivetran / Airbyte"]
        Fivetran -->|"2. Nạp dữ liệu thô thẳng vào (Load)"| CloudDWH[("Cloud Data Warehouse (Snowflake / BigQuery)")]
        CloudDWH -->|"3. Biến đổi trực tiếp bằng SQL/dbt (Transform)"| Marts[("Data Marts (Tận dụng CPU phân tán)")]
    end`
    },
    benchmark: {
      title: 'Đánh Giá: ETL Truyền Thống vs ELT Đám Mây Hiện Đại',
      caption: 'So sánh tốc độ đưa dữ liệu vào hệ thống (Data Freshness), độ linh hoạt và chi phí vận hành',
      options: [
        {
          name: 'ELT (Extract - Load - Transform với dbt/Snowflake)',
          badge: 'Chuẩn Hiện Đại 2026',
          isRecommended: true,
          metrics: [
            { label: 'Tốc độ nạp dữ liệu ban đầu', value: 98, displayValue: 'Gần thời gian thực', color: 'emerald' },
            { label: 'Độ linh hoạt thay đổi logic', value: 95, displayValue: 'Chỉ cần sửa SQL dbt', color: 'emerald' },
            { label: 'Chi phí bảo trì hạ tầng trung gian', value: 90, displayValue: 'Zero Serverless', color: 'emerald' }
          ],
          pros: ['Lưu trữ toàn bộ dữ liệu thô nguyên bản (Raw Data) trong Data Lake, không sợ mất mát', 'Cho phép các Data Analyst tự viết SQL để transform theo nhu cầu mới mà không cần sửa pipeline code'],
          cons: ['Chi phí tính toán trên Cloud Data Warehouse có thể tăng nếu viết truy vấn SQL không tối ưu']
        },
        {
          name: 'ETL (Extract - Transform - Load)',
          badge: 'Legacy On-premise',
          metrics: [
            { label: 'Tốc độ nạp dữ liệu ban đầu', value: 40, displayValue: 'Chạy theo Batch ban đêm', color: 'amber' },
            { label: 'Độ linh hoạt thay đổi logic', value: 30, displayValue: 'Phải build lại pipeline', color: 'rose' },
            { label: 'Chi phí bảo trì hạ tầng', value: 35, displayValue: 'Duy trì cụm Server riêng', color: 'rose' }
          ],
          pros: ['Dữ liệu được làm sạch và ẩn danh (Anonymized) bảo mật trước khi ra khỏi mạng nội bộ'],
          cons: ['Nút thắt cổ chai tại máy chủ Transform: Nếu máy chủ này quá tải, dữ liệu trong kho sẽ bị trễ hàng giờ']
        }
      ]
    }
  }
};

const securityUpdates = {
  'sec-003': {
    diagram: {
      type: 'mermaid',
      title: 'Ba Dạng Tấn Công XSS (Cross-Site Scripting) & Cơ Chế Phòng Chống',
      caption: 'Stored XSS (Lưu DB), Reflected XSS (Phản xạ qua URL) và DOM-based XSS (Thay đổi DOM client)',
      code: `flowchart TD
    Attacker["Hacker (Kẻ tấn công)"]

    subgraph Stored ["1. Stored XSS (Nguy hiểm nhất)"]
        Attacker -->|"Bơm mã <script> vào bình luận bài viết"| ServerDB[("Database Máy Chủ")]
        ServerDB -->|"Render HTML không lọc (Sanitize)"| Victim1["Người dùng khác mở đọc bài viết"]
        Victim1 -->|"Trình duyệt tự động chạy mã độc"| Steal1["Bị đánh cắp Cookie Session!"]
    end

    subgraph Reflected ["2. Reflected XSS (Qua link lừa đảo)"]
        Attacker -->|"Gửi link: site.com/search?q=<script>..."| Victim2["Nạn nhân click vào link"]
        Victim2 -->|"Server in lại từ khóa tìm kiếm lên HTML"| Steal2["Mã độc chạy trên phiên làm việc của nạn nhân"]
    end

    Defense["✅ Phòng thủ cốt lõi: Áp dụng Content Security Policy (CSP), HttpOnly Cookie và Escaping/Sanitize dữ liệu đầu vào!"]`
    }
  }
};

const csFundamentalsUpdates = {
  'cs-001': {
    diagram: {
      type: 'mermaid',
      title: 'Mô Hình Mạng 7 Tầng OSI (OSI 7 Layers) vs Mô Hình TCP/IP 4 Tầng',
      caption: 'Đối chiếu các tầng mạng, giao thức điển hình và đơn vị dữ liệu (PDU) từ tầng Vật lý lên tầng Ứng dụng',
      code: `flowchart LR
    subgraph OSI ["Mô Hình OSI 7 Tầng"]
        L7["7. Application (HTTP, DNS, SSH)"]
        L6["6. Presentation (SSL/TLS, JSON)"]
        L5["5. Session (Sockets, RPC)"]
        L4["4. Transport (TCP, UDP) - PDU: Segment"]
        L3["3. Network (IP, ICMP, Router) - PDU: Packet"]
        L2["2. Data Link (Ethernet, MAC, Switch) - PDU: Frame"]
        L1["1. Physical (Cáp quang, Sóng vô tuyến) - PDU: Bits"]
        L7 --> L6 --> L5 --> L4 --> L3 --> L2 --> L1
    end

    subgraph TCPIP ["Mô Hình TCP/IP Thực Tế"]
        T4["Application Layer (L5 + L6 + L7)"]
        T3["Transport Layer (L4)"]
        T2["Internet Layer (L3)"]
        T1["Network Access Layer (L1 + L2)"]
        T4 --> T3 --> T2 --> T1
    end`
    }
  }
};

const designPatternsUpdates = {
  'dp-008': {
    diagram: {
      type: 'mermaid',
      title: 'Mẫu Thiết Kế Quan Sát (Observer Pattern / Event-Driven) Trong Xử Lý Đơn Hàng',
      caption: 'Tách rời khớp nối logic: OrderService chỉ phát ra sự kiện OrderPaidEvent; các Listener tự động phản ứng độc lập',
      code: `flowchart TD
    Client["Khách hàng thanh toán thành công"] --> Subject["OrderService (Subject / Event Publisher)"]
    Subject -->|"Bắn sự kiện: OrderPaidEvent"| Bus["Event Bus / EventDispatcher"]

    subgraph Listeners ["Các Observer Lắng Nghe Độc Lập (Decoupled)"]
        Bus --> L1["EmailNotificationListener (Gửi hóa đơn VAT)"]
        Bus --> L2["InventoryListener (Trừ số lượng hàng trong kho)"]
        Bus --> L3["LoyaltyPointsListener (Cộng điểm tích lũy)"]
        Bus --> L4["AuditLogListener (Ghi vết kiểm toán bảo mật)"]
    end

    Note["Ưu điểm: Muốn thêm chức năng gửi tin nhắn Zalo? Chỉ cần tạo thêm 1 Listener mới, KHÔNG CẦN SỬA 1 DÒNG CODE NÀO TRONG OrderService! (Tuân thủ Open/Closed Principle)"]`
    }
  }
};

const dsaUpdates = {
  'dsa-006': {
    diagram: {
      type: 'mermaid',
      title: 'Cơ Chế Thuật Toán Tìm Kiếm Nhị Phân (Binary Search O(log N))',
      caption: 'Mỗi bước so sánh loại bỏ 50% không gian tìm kiếm trên mảng đã được sắp xếp',
      code: `flowchart TD
    Array["Mảng đã sắp xếp: [2, 5, 8, 12, 16, 23, 38, 56, 72, 91] (Target = 23)"]
    
    Step1["Bước 1: Mid = 16 (Index 4)\nSo sánh: 23 > 16 -> LOẠI BỎ TOÀN BỘ NỬA TRÁI [2..16]!"]
    Array --> Step1
    
    Step2["Bước 2: Không gian còn lại: [23, 38, 56, 72, 91]\nMid = 56 (Index 7)\nSo sánh: 23 < 56 -> LOẠI BỎ TOÀN BỘ NỬA PHẢI [56..91]!"]
    Step1 --> Step2

    Step3["Bước 3: Không gian còn lại: [23, 38]\nMid = 23 -> TÌM THẤY TARGET TẠI INDEX 5! (Chỉ sau 3 phép tính)"]
    Step2 --> Step3`
    }
  }
};

// ==========================================
// 2. QA, PERFORMANCE, SEO, BEHAVIORAL
// ==========================================
const qaUpdates = {
  'qa-002': {
    diagram: {
      type: 'mermaid',
      title: 'Mô Hình Chữ V Trong Kiểm Thử Phần Mềm (V-Model: Verification vs Validation)',
      caption: 'Mỗi giai đoạn phát triển vòng đời phần mềm đều có một giai đoạn kiểm thử tương ứng đối xứng',
      code: `flowchart TD
    subgraph DevLifecycle ["Nhánh Phát Triển (Verification)"]
        Req["Yêu Cầu Nghiệp Vụ (Requirements)"]
        Arch["Kiến Trúc Hệ Thống (System Architecture)"]
        High["Thiết Kế Chi Tiết (Detailed Design)"]
        Code["Lập Trình Mã Nguồn (Coding)"]
        Req --> Arch --> High --> Code
    end

    subgraph TestLifecycle ["Nhánh Kiểm Thử (Validation)"]
        Unit["Kiểm Thử Đơn Vị (Unit Testing)"]
        Integ["Kiểm Thử Tích Hợp (Integration Testing)"]
        Sys["Kiểm Thử Hệ Thống (System Testing)"]
        UAT["Kiểm Thử Chấp Nhận Người Dùng (UAT Testing)"]
        Code --> Unit --> Integ --> Sys --> UAT
    end

    Code -.->|"Đối chiếu"| Unit
    High -.->|"Đối chiếu"| Integ
    Arch -.->|"Đối chiếu"| Sys
    Req -.->|"Đối chiếu"| UAT`
    }
  }
};

const perfUpdates = {
  'perf-001': {
    diagram: {
      type: 'pipeline',
      title: 'Pipeline Tối Ưu Hóa Bộ Ba Chỉ Số Core Web Vitals (LCP, INP, CLS)',
      caption: 'Quy trình chuẩn kỹ thuật nâng điểm trải nghiệm người dùng và xếp hạng tìm kiếm Google',
      stages: [
        {
          name: '1. Largest Contentful Paint (LCP < 2.5s)',
          tool: 'next/image + Preload Hero',
          icon: 'Zap',
          description: 'Tối ưu ảnh lớn nhất: Chuyển đổi định dạng AVIF/WebP, nạp thuộc tính priority và đặt kích thước cố định.',
          metric: '< 2.5s'
        },
        {
          name: '2. Interaction to Next Paint (INP < 200ms)',
          tool: 'Web Workers & scheduler.yield()',
          icon: 'Cpu',
          description: 'Giải phóng Main Thread: Chia nhỏ Long Tasks, chuyển tác vụ tính toán nặng sang Web Worker, ưu tiên phản hồi phím gõ và click.',
          metric: '< 200ms'
        },
        {
          name: '3. Cumulative Layout Shift (CLS < 0.1)',
          tool: 'aspect-ratio & Font Fallback',
          icon: 'Maximize',
          description: 'Chống giật layout: Dự trữ khung kích thước (aspect-ratio) cho banner quảng cáo và ảnh động, cấu hình font-display: optional.',
          metric: '< 0.1 CLS'
        },
        {
          name: '4. Giám Sát Real User Metrics (RUM)',
          tool: 'Chrome UX Report (CrUX)',
          icon: 'CheckCircle',
          description: 'Thu thập số liệu đo lường thực tế từ 75% người dùng thực tế trên mọi thiết bị và tốc độ mạng.',
          metric: 'P75 Target'
        }
      ]
    }
  }
};

const seoUpdates = {
  'seo-001': {
    diagram: {
      type: 'pipeline',
      title: 'Quy Trình Cào Dữ Liệu & Lập Chỉ Mục Của Googlebot (Search Engine Pipeline)',
      caption: 'Bốn giai đoạn từ khám phá URL đến xếp hạng kết quả tìm kiếm trên trang nhất',
      stages: [
        {
          name: '1. Khám Phá URL (Crawl)',
          tool: 'Googlebot Crawler',
          icon: 'Radio',
          description: 'Đọc file sitemap.xml, robots.txt và lần theo các liên kết thẻ <a href="..."> để đưa URL vào Crawl Queue.',
          metric: 'Crawl Budget'
        },
        {
          name: '2. Phân Tích HTML Thô (First Wave)',
          tool: 'HTML Parser',
          icon: 'FileText',
          description: 'Đọc thẻ Title, Meta Description, Thẻ H1 và Structured Data (Schema.org JSON-LD) ngay lập tức.',
          metric: 'Instant Parse'
        },
        {
          name: '3. Web Rendering Service (WRS)',
          tool: 'Headless Chrome WRS',
          icon: 'Cpu',
          description: 'Thực thi mã JavaScript đối với các trang Client-Side Render (CSR). Giai đoạn này có thể bị trì hoãn vài ngày nếu server phản hồi chậm.',
          metric: 'Render Queue'
        },
        {
          name: '4. Lập Chỉ Mục & Xếp Hạng (Index & Rank)',
          tool: 'Caffeine Indexer',
          icon: 'CheckCircle',
          description: 'Lưu trữ tài liệu vào kho chỉ mục khổng lồ và áp dụng thuật toán PageRank, E-E-A-T, Core Web Vitals để xếp hạng.',
          metric: 'Top 10 Google'
        }
      ]
    }
  }
};

const behavioralUpdates = {
  'hr-002': {
    diagram: {
      type: 'mermaid',
      title: 'Cấu Trúc Trả Lời Phỏng Vấn Theo Phương Pháp STAR (STAR Method)',
      caption: 'Situation (Bối cảnh 15%) -> Task (Nhiệm vụ 15%) -> Action (Hành động then chốt 55%) -> Result (Kết quả định lượng 15%)',
      code: `flowchart TD
    S["1. Situation (Bối cảnh thực tế - 15%)\nMô tả hệ thống, dự án, quy mô và vấn đề nghiêm trọng đang gặp phải"]
    T["2. Task (Nhiệm vụ của bạn - 15%)\nVai trò cụ thể của bạn là gì? Mục tiêu cần đạt được trong thời hạn bao lâu?"]
    A["3. Action (Hành động kỹ thuật then chốt - 55%)\nĐiểm cốt lõi: Bạn đã phân tích nguyên nhân gốc rễ (Root Cause) thế nào? Áp dụng công nghệ gì? Quyết định kiến trúc ra sao?"]
    R["4. Result (Kết quả đo lường định lượng - 15%)\nBáo cáo con số cụ thể: Giảm 60% latency, tiết kiệm $20k chi phí cloud, bài học kinh nghiệm rút ra"]

    S --> T --> A --> R`
    }
  }
};

// ==========================================
// 3. SPECIALIZED MICRO-BANKS
// ==========================================
const browserWorkersUpdates = {
  'sw-hard-01': {
    diagram: {
      type: 'mermaid',
      title: 'Vòng Đời Hoạt Động Của Service Worker (Offline PWA Architecture)',
      caption: 'Register ➔ Installing ➔ Waiting ➔ Activating ➔ Fetch Interception',
      code: `flowchart TD
    Reg["1. Đăng ký: navigator.serviceWorker.register()"] --> Install["2. Installing: Tải file sw.js và nạp trước static assets (Pre-cache)"]
    
    Install --> WaitCheck{"Có phiên bản SW cũ đang chạy không?"}
    WaitCheck -->|"Có"| Waiting["3. Waiting: Chờ người dùng đóng tất cả các tab cũ (Hoặc gọi skipWaiting)"]
    WaitCheck -->|"Không"| Activate["4. Activating: Xóa bỏ các Cache cũ đã lỗi thời và chiếm quyền điều khiển"]
    Waiting --> Activate

    Activate --> Active["5. Idle / Listening: Lắng nghe sự kiện Fetch để phục vụ nội dung Offline khi mất mạng!"]`
    }
  }
};

const feOpenEndedUpdates = {
  'open-fe-02': {
    diagram: {
      type: 'pipeline',
      title: 'Kiến Trúc Dashboard Realtime Hàng Chục Nghìn Sự Kiện/Giây Không Gây Đơ Màn Hình',
      caption: 'Kỹ thuật gom nhóm (Batching) bằng Ring Buffer và cập nhật giao diện theo tần số quét màn hình requestAnimationFrame',
      stages: [
        {
          name: '1. Nhận Luồng Dữ Liệu Cực Đại',
          tool: 'WebSocket / gRPC-Web',
          icon: 'Radio',
          description: 'Hàng chục nghìn gói tin sự kiện giá cổ phiếu / IoT gửi về mỗi giây.',
          metric: '> 20,000 msg/s'
        },
        {
          name: '2. Bộ Đệm Vòng Tròn (Ring Buffer)',
          tool: 'TypedArray / Circular Buffer',
          icon: 'Layers',
          description: 'Không gọi setState() ngay lập tức. Dữ liệu được đưa vào Circular Buffer trong bộ nhớ để triệt tiêu việc cấp phát rác GC.',
          metric: 'Zero Alloc'
        },
        {
          name: '3. Gom Nhóm Theo Nhịp Màn Hình (RAF Throttle)',
          tool: 'requestAnimationFrame',
          icon: 'Cpu',
          description: 'Chỉ rút dữ liệu tổng hợp ra vẽ đúng 1 lần trong mỗi 16.6ms (chu kỳ 60 FPS) của màn hình.',
          metric: '60 FPS Lock'
        },
        {
          name: '4. Kết Xuất Tối Ưu Bằng WebGL / Canvas',
          tool: 'HTML5 Canvas / PixiJS',
          icon: 'Zap',
          description: 'Vẽ đồ thị bằng GPU thay vì tạo hàng chục nghìn thẻ DOM div gây nghẽn Layout/Reflow của trình duyệt.',
          metric: 'GPU Render'
        }
      ]
    }
  }
};

const feSysDesignUpdates = {
  'fsd-01': {
    diagram: {
      type: 'mermaid',
      title: 'Kiến Trúc Cuộn Ảo (Virtualized List / Windowing) Cho 100,000 Bản Ghi',
      caption: 'Chỉ render đúng số lượng phần tử hiển thị trong khung nhìn (Viewport) cộng thêm vùng đệm (Buffer padding)',
      code: `flowchart TD
    subgraph WholeData ["Dữ Liệu Khổng Lồ Trong Bộ Nhớ (100,000 Items)"]
        TopHidden["Phần khuất phía trên (99,980 items - KHÔNG ĐƯỢC TẠO DOM)"]
    end

    subgraph VirtualScrollContainer ["Thùng Chứa Cuộn (Scroll Container: Chiều cao ảo = 100,000 * 50px = 5,000,000px)"]
        PaddingTop["Div đệm phía trên (height = startIndex * itemHeight)"]
        
        subgraph ViewportDOM ["DOM Thực Tế (Chỉ duy trì ~20 Thẻ DOM)"]
            Item1["Visible Item 41"]
            Item2["Visible Item 42"]
            Item3["Visible Item 43"]
            ItemN["Visible Item 60"]
        end

        PaddingBottom["Div đệm phía dưới (height = (total - endIndex) * itemHeight)"]
    end

    TopHidden -.->|"Chỉ tạo DOM khi người dùng cuộn tới"| ViewportDOM`
    }
  }
};

const webPerfSecUpdates = {
  'int-09': {
    diagram: {
      type: 'mermaid',
      title: 'Phân Tích Cấu Trúc Độ Trễ Chỉ Số INP (Interaction to Next Paint)',
      caption: 'INP = Input Delay (Độ trễ chờ Main Thread rảnh) + Processing Time (Thời gian chạy hàm xử lý) + Presentation Delay (Thời gian vẽ lại màn hình)',
      code: `flowchart LR
    User["Người dùng Click Nút"] --> Part1["1. Input Delay\n(Chờ Main Thread hoàn thành các Long Task trước đó)"]
    Part1 --> Part2["2. Processing Time\n(Thực thi callback JavaScript: onClick handler)"]
    Part2 --> Part3["3. Presentation Delay\n(Trình duyệt tính toán Layout, Paint và Composite lên màn hình)"]
    Part3 --> Done["Điểm ảnh mới xuất hiện trên màn hình (Next Paint)"]

    Explain["Mục tiêu Core Web Vitals: Tổng thời gian cả 3 phần phải nhỏ hơn 200 mili-giây!"]`
    }
  }
};

// Execute updates for all 13 Batch D banks
updateBank('data-engineering-bank.json', dataEngUpdates);
updateBank('cybersecurity-bank.json', securityUpdates);
updateBank('cs-fundamentals-bank.json', csFundamentalsUpdates);
updateBank('design-patterns-bank.json', designPatternsUpdates);
updateBank('dsa-bank.json', dsaUpdates);
updateBank('qa-testing-bank.json', qaUpdates);
updateBank('performance-bank.json', perfUpdates);
updateBank('seo-bank.json', seoUpdates);
updateBank('behavioral-bank.json', behavioralUpdates);
updateBank('browser-workers.json', browserWorkersUpdates);
updateBank('frontend-open-ended.json', feOpenEndedUpdates);
updateBank('frontend-system-design.json', feSysDesignUpdates);
updateBank('web-performance-security.json', webPerfSecUpdates);

console.log('✅ Batch D (13 Remaining Banks) completed successfully!');
