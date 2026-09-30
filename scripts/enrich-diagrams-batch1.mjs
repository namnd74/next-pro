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
      if (u.codeExample) q.seniorAnswer.codeExample = u.codeExample;
      if (u.codeLanguage) q.seniorAnswer.codeLanguage = u.codeLanguage;
      count++;
    }
  }

  fs.writeFileSync(filePath, JSON.stringify(data, null, 2) + '\n', 'utf8');
  console.log(`[${fileName}] Updated ${count} questions.`);
}

// ==========================================
// 1. BUSINESS ANALYST BANK (15 Questions)
// ==========================================
const baUpdates = {
  'ba-005': {
    diagram: {
      type: 'mermaid',
      title: 'Lộ Trình Phát Triển Sự Nghiệp Của Business Analyst (BA Career Roadmap)',
      caption: 'Từ Junior BA phân tích nghiệp vụ cơ sở đến Chuyên gia tư vấn chiến lược cấp cao',
      code: `flowchart LR
    J["Junior BA<br>(Gather Requirements, User Stories, UAT)"] --> M["Senior BA<br>(System Modeling, BPMN, Gap Analysis)"]
    M --> TechTrack["Kỹ thuật chuyên sâu<br>(Technical BA / Solution Architect)"]
    M --> BizTrack["Kinh doanh & Sản phẩm<br>(Product Manager / PO Lead)"]
    M --> StratTrack["Chiến lược doanh nghiệp<br>(Enterprise BA / Head of BA)"]
    TechTrack --> C["Chief Product / Technology Advisor"]
    BizTrack --> C
    StratTrack --> C`
    }
  },

  'ba-013': {
    diagram: {
      type: 'mermaid',
      title: 'Sơ Đồ Use Case Chuẩn: Ranh Giới Hệ Thống & Phân Loại Actor',
      caption: 'Minh họa ranh giới hệ thống bán vé máy bay với Primary, Secondary và Offstage Actors',
      code: `flowchart LR
    subgraph ActorsLeft ["Tác Nhân Chính (Primary)"]
        Passenger["👤 Hành Khách<br>(Khởi phát luồng)"]
    end

    subgraph SystemBoundary ["🏢 Ranh Giới Hệ Thống (Booking System)"]
        UC1(["Đặt Vé Máy Bay"])
        UC2(["Xác Thực CCCD / Hộ Chiếu"])
        UC3(["Thanh Toán Trực Tuyến"])
        UC4(["Chọn Chỗ Ngồi VIP"])
        UC5(["Hủy Vé & Hoàn Tiền"])
    end

    subgraph ActorsRight ["Tác Nhân Phụ & Tuân Thủ (Secondary / Offstage)"]
        VNPay["🏦 Cổng Thanh Toán VNPay"]
        GDS["✈️ Hệ Thống Giữ Chỗ Toàn Cầu (GDS)"]
        CAA["📋 Cục Hàng Không (Offstage Log)"]
    end

    Passenger --> UC1
    Passenger --> UC5
    UC1 -.->|"<<include>>"| UC2
    UC1 -.->|"<<include>>"| UC3
    UC4 -.->|"<<extend>>"| UC1
    UC3 --> VNPay
    UC1 --> GDS
    UC5 -.-> CAA`
    }
  },

  'ba-014': {
    diagram: {
      type: 'mermaid',
      title: 'Activity Diagram với Swimlanes (Phân Làn Trách Nhiệm Xử Lý Đơn Hàng)',
      caption: 'Mô hình hóa quy trình kiểm tra tự động trước đóng gói tại kho vận',
      code: `flowchart TD
    subgraph Customer ["Làn: Khách Hàng (App)"]
        Start(("● Bắt đầu")) --> PlaceOrder["Bấm Đặt Hàng"]
    end

    subgraph OMS ["Làn: Order Management System (OMS)"]
        PlaceOrder --> Validate["Kiểm tra hợp lệ"]
        Validate --> Fork{"Fork: Xử lý song song"}
        Fork --> TaskPay["1. Trừ tiền / Phong tỏa thẻ"]
        Fork --> TaskInv["2. Giữ chỗ tồn kho thực tế"]
        TaskPay --> Join{"Join: Đồng bộ"}
        TaskInv --> Join
        Join --> CheckFail{"Có lỗi ở 1 trong 2?"}
        CheckFail -->|"Có lỗi"| Rollback["Hủy đơn & Hoàn tác"]
        CheckFail -->|"Thành công"| Confirm["Chốt đơn hợp lệ"]
    end

    subgraph WMS ["Làn: Warehouse Management (WMS)"]
        Confirm --> CreatePick["Tạo Phiếu Xuất Kho"]
        CreatePick --> Pack["In Barcode & Đóng Gói"]
        Pack --> Handover["Bàn giao đơn vị vận chuyển"]
    end

    Rollback --> ErrEnd(("◎ Thất bại"))
    Handover --> SuccEnd(("◎ Hoàn tất"))`
    }
  },

  'ba-015': {
    diagram: {
      type: 'mermaid',
      title: 'Quy Trình Chuẩn BPMN 2.0: Xử Lý Đơn Hàng Thương Mại Điện Tử',
      caption: 'Khác biệt cốt lõi giữa BPMN (sự kiện, làn, gateway ngữ nghĩa) và Flowchart thông thường',
      code: `flowchart LR
    StartEvent(("🟢 Start Event<br>Khách gửi đơn")) --> ValidateTask["📋 Task: Kiểm tra tồn kho"]
    ValidateTask --> XORGateway{"XOR Gateway<br>Đủ hàng?"}
    XORGateway -->|"Không"| NotifyOut["✉️ Task: Báo hết hàng"]
    NotifyOut --> EndReject(("🔴 End Event<br>Đơn bị hủy"))
    XORGateway -->|"Có"| ChargeTask["💳 Task: Trừ tiền thẻ"]
    ChargeTask --> ParallelGateway{"AND Gateway<br>Song song"}
    ParallelGateway --> PrintLabel["🏷️ In hóa đơn vận chuyển"]
    ParallelGateway --> NotifyUser["📱 Gửi SMS xác nhận"]
    PrintLabel --> SyncGate{"AND Join"}
    NotifyUser --> SyncGate
    SyncGate --> EndSuccess(("🏁 End Event<br>Sẵn sàng giao"))`
    }
  },

  'ba-026': {
    diagram: {
      type: 'mermaid',
      title: 'Ma Trận Quản Trị Stakeholder (Mendelow Power-Interest Matrix)',
      caption: 'Chiến lược tương tác theo mức độ Quyền lực và Mức độ Quan tâm của các bên liên quan',
      code: `flowchart TD
    subgraph Matrix ["Ma Trận Mendelow (Stakeholder Engagement)"]
        direction TB
        subgraph HighPower ["Quyền Lực Cao (High Power)"]
            Q1["Quan tâm thấp:<br><b>Keep Satisfied (Làm hài lòng)</b><br>• Giám đốc Tài chính / Pháp chế<br>• Báo cáo tổng quan, không spam chi tiết"]
            Q2["Quan tâm cao:<br><b>Manage Closely (Quản trị chặt chẽ)</b><br>• Product Owner / Business Sponsor<br>• Họp định kỳ, đồng thuận quyết định"]
        end
        subgraph LowPower ["Quyền Lực Thấp (Low Power)"]
            Q3["Quan tâm thấp:<br><b>Monitor (Theo dõi tối thiểu)</b><br>• Nhóm hỗ trợ gián tiếp<br>• Gửi thông báo khi có thay đổi lớn"]
            Q4["Quan tâm cao:<br><b>Keep Informed (Cập nhật thường xuyên)</b><br>• Đội ngũ End-User, CSKH<br>• Lấy feedback, demo UAT"]
        end
    end`
    }
  },

  'ba-029': {
    diagram: {
      type: 'mermaid',
      title: 'Lộ Trình Chứng Chỉ Quốc Tế IIBA (BABOK Guide)',
      caption: 'Khung năng lực từ người mới bắt đầu đến chuyên gia Business Analysis quốc tế',
      code: `flowchart LR
    ECBA["<b>ECBA™</b><br>Entry Certificate<br>0h kinh nghiệm<br>Nắm vững khái niệm BABOK"] --> CCBA["<b>CCBA®</b><br>Certification of Capability<br>3,750h kinh nghiệm (3-4 năm)<br>Thực hành độc lập"]
    CCBA --> CBAP["<b>CBAP®</b><br>Certified BA Professional<br>7,500h kinh nghiệm (5-7+ năm)<br>Chuyên gia chiến lược & dẫn dắt"]
    CBAP --> Spec["Chứng chỉ chuyên sâu:<br>• <b>IIBA-AAC</b> (Agile Analysis)<br>• <b>IIBA-CBDA</b> (Data Analytics)<br>• <b>IIBA-CPOA</b> (Product Ownership)"]`
    }
  },

  'ba-035': {
    diagram: {
      type: 'mermaid',
      title: 'Quy Trình Kiểm Soát Scope Creep & Thay Đổi Yêu Cầu (Change Control Flow)',
      caption: 'Quy trình thẩm định và phê duyệt thay đổi phạm vi dự án bảo vệ tiến độ và ngân sách',
      code: `flowchart TD
    Req["Khách hàng/Stakeholder yêu cầu tính năng mới"] --> FormalReq["1. Viết phiếu yêu cầu thay đổi (CR - Change Request)"]
    FormalReq --> ImpactAnalysis["2. BA phối hợp Tech Lead phân tích tác động:<br>• Chi phí (Cost)<br>• Thời gian (Schedule)<br>• Rủi ro kỹ thuật (Tech Debt)"]
    ImpactAnalysis --> CCB{"3. Hội Đồng Phê Duyệt (CCB / Product Owner)"}
    CCB -->|"Từ chối"| Reject["Lưu Backlog cho Release sau (Phase 2)"]
    CCB -->|"Chấp thuận"| TradeOff["4. Thương lượng đánh đổi (Scope Trade-off):<br>Bỏ bớt tính năng cũ HOẶC Tăng ngân sách & deadline"]
    TradeOff --> Baseline["5. Cập nhật Baseline Scope & Kế hoạch Sprint"]`
    }
  },

  'ba-039': {
    diagram: {
      type: 'mermaid',
      title: 'Phân Biệt Bản Chất Quan Hệ <<include>> vs <<extend>> trong Use Case',
      caption: 'Include là quan hệ bắt buộc không thể thiếu; Extend là quan hệ mở rộng có điều kiện',
      code: `flowchart LR
    subgraph IncludeRel ["Quan Hệ <<include>> (Bắt Buộc - Mandatory)"]
        Checkout(["Use Case: Đặt Hàng (Checkout)"]) -.->|"<<include>> (Luôn chạy)"| DeductInv(["Use Case: Trừ Tồn Kho"])
        Checkout -.->|"<<include>> (Luôn chạy)"| ProcessPay(["Use Case: Thực Hiện Thanh Toán"])
    end

    subgraph ExtendRel ["Quan Hệ <<extend>> (Tùy Chọn Có Điều Kiện - Optional)"]
        ApplyVoucher(["Use Case: Áp Mã Giảm Giá"]) -.->|"<<extend>> (Khi khách có voucher)"| Checkout
        FraudCheck(["Use Case: Xác Minh Rủi Ro Cao"]) -.->|"<<extend>> (Khi giao dịch > 20tr)"| ProcessPay
    end`
    }
  },

  'ba-054': {
    diagram: {
      type: 'pipeline',
      title: 'Quy Trình 4 Bước Chinh Phục Stakeholder Khó Tính (De-escalation Pipeline)',
      caption: 'Kỹ năng giải quyết bất đồng và xây dựng niềm tin với các bên liên quan',
      stages: [
        { name: '1. Active Listening', description: 'Lắng nghe trọn vẹn bức xúc, không cướp lời, ghi chép lại mọi quan ngại thực tế', duration: 'Giai đoạn 1' },
        { name: '2. Empathy & Framing', description: 'Đồng cảm với áp lực KPI của họ, diễn giải lại vấn đề theo góc nhìn kinh doanh', duration: 'Giai đoạn 2' },
        { name: '3. Data-driven Options', description: 'Đưa ra 2-3 kịch bản giải pháp kèm phân tích số liệu rõ ràng về chi phí và đánh đổi', duration: 'Giai đoạn 3' },
        { name: '4. Alignment & Signoff', description: 'Chốt biên bản thống nhất bằng văn bản (MoM) để bảo vệ cả hai bên trong tương lai', duration: 'Giai đoạn 4' }
      ]
    }
  },

  'ba-056': {
    diagram: {
      type: 'mermaid',
      title: 'Hệ Thống Phân Loại Yêu Cầu Theo Chuẩn BABOK v3',
      caption: 'Cấu trúc 4 tầng yêu cầu từ mục tiêu chiến lược doanh nghiệp tới chuyển giao hệ thống',
      code: `flowchart TD
    BR["<b>1. Business Requirements (Yêu cầu Doanh nghiệp)</b><br>• Mục tiêu kinh doanh cấp cao (Tăng 30% doanh thu, giảm 50% chi phí CSKH)"]
    BR --> SR["<b>2. Stakeholder Requirements (Yêu cầu Bên liên quan)</b><br>• Nhu cầu cụ thể của từng nhóm người dùng (Kế toán cần xuất file Excel trong 5s)"]
    SR --> SolR["<b>3. Solution Requirements (Yêu cầu Giải pháp)</b>"]
    subgraph SolutionSub ["Chi tiết hóa Giải Pháp Kỹ Thuật"]
        FR["<b>Functional Requirements (FR)</b><br>• Tính năng, hành vi của hệ thống (Tính thuế, gửi OTP, trừ tiền)"]
        NFR["<b>Non-Functional Requirements (NFR)</b><br>• Hiệu năng (P99 < 200ms), Bảo mật (MFA), Sẵn sàng (99.99%)"]
    end
    SolR --> FR
    SolR --> NFR
    SolR --> TR["<b>4. Transition Requirements (Yêu cầu Chuyển giao)</b><br>• Migration dữ liệu cũ, đào tạo nhân viên, chạy song song 2 hệ thống trong 1 tháng"]`
    }
  },

  'ba-058': {
    diagram: {
      type: 'mermaid',
      title: 'State Machine Diagram: Vòng Đời Đơn Hàng Thương Mại Điện Tử (Order Lifecycle)',
      caption: 'Mô hình hóa các trạng thái và điều kiện kích hoạt chuyển dịch trong Order Management System',
      code: `stateDiagram-v2
    [*] --> PENDING_PAYMENT: Khách bấm đặt hàng
    
    PENDING_PAYMENT --> PAID: Thanh toán thành công [Số tiền khớp]
    PENDING_PAYMENT --> EXPIRED: Hết hạn sau 30 phút [Timeout]
    PENDING_PAYMENT --> CANCELLED: Khách bấm hủy đơn
    
    PAID --> PROCESSING: Kho xác nhận còn tồn kho
    PAID --> REFUNDED: Kho hết hàng [Auto Refund]
    
    PROCESSING --> SHIPPING: Bàn giao đơn vị vận chuyển
    
    SHIPPING --> DELIVERED: Khách ký nhận hàng
    SHIPPING --> RETURNED: Giao thất bại 3 lần
    
    DELIVERED --> COMPLETED: Sau 7 ngày không đổi trả
    DELIVERED --> RETURNING: Khách yêu cầu trả hàng
    RETURNING --> REFUNDED: Kho nhận lại hàng hoàn
    
    COMPLETED --> [*]
    EXPIRED --> [*]
    CANCELLED --> [*]
    REFUNDED --> [*]`
    }
  },

  'ba-063': {
    diagram: {
      type: 'mermaid',
      title: 'Service Blueprint Chuẩn: Kết Nối Trải Nghiệm Khách Hàng Với Vận Hành Nội Bộ',
      caption: 'Phân tách 5 tầng vận hành từ bằng chứng hữu hình đến hệ thống hỗ trợ nền tảng',
      code: `flowchart TD
    subgraph PhysicalEvidence ["Bằng Chứng Hữu Hình (Physical Evidence)"]
        PE1["Ứng dụng Mobile / Web UI"] --- PE2["Hóa đơn điện tử & SMS"] --- PE3["Gói hàng có tem barcode"]
    end

    subgraph CustomerJourney ["Hành Vi Khách Hàng (Customer Actions)"]
        CA1["1. Chọn sản phẩm & Đặt hàng"] --> CA2["2. Nhận thông báo giao hàng"] --> CA3["3. Nhận hàng & Thanh toán COD"]
    end

    subgraph LineOfInteraction ["─────── Đường Tương Tác Trực Tiếp (Line of Interaction) ───────"]
    end

    subgraph Frontstage ["Tác Vụ Tiền Đài (Frontstage - Nhìn thấy được)"]
        FS1["Nhân viên CSKH gọi xác nhận địa chỉ"] --> FS2["Shipper bấm chuông giao hàng"]
    end

    subgraph LineOfVisibility ["─────── Đường Tầm Nhìn (Line of Visibility) ───────"]
    end

    subgraph Backstage ["Tác Vụ Hậu Đài (Backstage - Nội bộ)"]
        BS1["Nhân viên kho quét barcode nhặt hàng"] --> BS2["Đóng thùng carton & dán nhãn"]
    end

    subgraph SupportProcess ["Hệ Thống Hỗ Trợ (Support Processes)"]
        SP1["Core OMS & ERP"] --- SP2["Cổng tích hợp API Giao Hàng Tiết Kiệm / ViettelPost"]
    end

    CA1 -.-> FS1
    CA2 -.-> BS1
    CA3 -.-> FS2
    BS1 -.-> SP1
    FS2 -.-> SP2`
    }
  },

  'ba-066': {
    diagram: {
      type: 'mermaid',
      title: 'Biểu Đồ Xương Cá Ishikawa (Fishbone Diagram) Phân Tích Sự Cố Nghiệp Vụ',
      caption: 'Truy tìm nguyên nhân gốc rễ (Root Cause) theo mô hình 6M / Quy trình, Con người, Công nghệ',
      code: `flowchart LR
    subgraph Causes ["Các Nhánh Nguyên Nhân (Root Causes)"]
        subgraph People ["Con Người (People)"]
            P1["Thiếu đào tạo nghiệp vụ thuế mới"]
            P2["Nhập liệu thủ công sai hệ số lương"]
        end
        subgraph Process ["Quy Trình (Process)"]
            PR1["Không có bước Double-check trước khi duyệt"]
            PR2["Thiếu tài liệu bàn giao khi thay đổi nhân sự"]
        end
        subgraph Tech ["Công Nghệ (Technology)"]
            T1["Cron job chạy quá tải lúc nửa đêm gây drop dữ liệu"]
            T2["Hàm tính lương bị tràn số dấu phẩy động"]
        end
        subgraph DataPolicy ["Chính Sách & Dữ Liệu (Policy & Data)"]
            DP1["Luật thuế mới ban hành gấp trong 48h"]
            DP2["Dữ liệu nhân viên chi nhánh chưa đồng bộ Master Data"]
        end
    end

    subgraph Problem ["Hậu Quả (Problem Statement)"]
        Effect["🚨 SỰ CỐ NGHIỆP VỤ:<br>Tính sai lương cho 3.000 nhân viên chi nhánh gây đình công"]
    end

    People --> Effect
    Process --> Effect
    Tech --> Effect
    DataPolicy --> Effect`
    }
  },

  'ba-072': {
    diagram: {
      type: 'mermaid',
      title: 'Quy Trình Ước Lượng Planning Poker & T-Shirt Sizing Trong Scrum',
      caption: 'Vai trò của BA trong việc làm rõ tiêu chí Acceptance Criteria để Dev/QA ước lượng chính xác',
      code: `flowchart TD
    Start["BA trình bày User Story & Tiêu chí chấp nhận (AC)"] --> QnA["Đội ngũ Dev & QA đặt câu hỏi làm rõ các ca biên (Edge cases)"]
    QnA --> SecretVote["Mỗi thành viên bí mật chọn bài Poker (Dãy Fibonacci: 1, 2, 3, 5, 8, 13)"]
    SecretVote --> Reveal["Đồng loạt mở bài"]
    Reveal --> CheckConsensus{"Có đồng thuận tuyệt đối không?"}
    CheckConsensus -->|"Có"| AcceptEstimate["Ghi nhận Story Point vào Sprint Backlog"]
    CheckConsensus -->|"Không (Lệch điểm lớn, vd: 2 vs 13)"| Discuss["Hai người có điểm cao nhất và thấp nhất giải thích góc nhìn:
• Điểm 13: Phát hiện rủi ro ngầm / Phụ thuộc API bên ngoài
• Điểm 2: Đã có thư viện sẵn / Làm tương tự tuần trước"]
    Discuss --> SecretVote`
    }
  },

  'ba-074': {
    diagram: {
      type: 'mermaid',
      title: 'Khung Thuyết Phục Ưu Tiên Nợ Kỹ Thuật (Technical Debt vs Feature Delivery)',
      caption: 'Mô hình hóa tác động suy giảm tốc độ (Velocity) nếu bỏ qua Technical Debt',
      code: `flowchart TD
    subgraph DangerZone ["Nếu Chỉ Tập Trung 100% Tính Năng Mới"]
        F1["Sprint 1-5: Tốc độ rất nhanh"] --> F2["Sprint 6-10: Bug tăng gấp 3, Code cũ khó sửa"]
        F2 --> F3["Sprint 10+: 70% thời gian dành để fix bug sản xuất, tính năng mới trễ hạn"]
    end

    subgraph StrategicBalance ["Chiến Lược Phân Bổ Bền Vững (20% Tech Debt Rule)"]
        Capacity["Tổng Năng Lực 1 Sprint (100%)"]
        Capacity --> CapFeatures["70%: Tính năng mới đem lại doanh thu (Business Features)"]
        Capacity --> CapTech["20%: Tái cấu trúc, tối ưu query, vá nợ kỹ thuật (Technical Debt)"]
        Capacity --> CapBugs["10%: Xử lý lỗi tồn đọng & đột xuất (Unplanned Bugs)"]
    end`
    }
  }
};

// ==========================================
// 2. BACKEND CORE BANK (4 Questions)
// ==========================================
const becoreUpdates = {
  'becore-046': {
    diagram: {
      type: 'mermaid',
      title: 'Kiến Trúc Message Queue (Point-to-Point) vs Pub/Sub Fan-out',
      caption: 'Minh họa Topology RabbitMQ Fanout Exchange phân phối sự kiện đồng thời tới nhiều Queue',
      code: `flowchart TD
    Producer["Dịch Vụ Đặt Hàng (Producer)"] -->|"Publish 'OrderPlaced'"| Exchange{"RabbitMQ Fanout Exchange"}
    
    Exchange -->|"Fan-out 100%"| QueueEmail[("Email Queue<br>(Point-to-Point)")]
    Exchange -->|"Fan-out 100%"| QueueInv[("Inventory Queue<br>(Point-to-Point)")]
    Exchange -->|"Fan-out 100%"| QueueShip[("Shipping Queue<br>(Point-to-Point)")]
    
    subgraph EmailWorkers ["Cụm Worker Email (Compete Consumers)"]
        QueueEmail --> W1["Worker Email 1"]
        QueueEmail --> W2["Worker Email 2"]
    end
    
    subgraph InvWorkers ["Cụm Worker Kho Vận"]
        QueueInv --> W3["Worker Kho"]
    end
    
    subgraph ShipWorkers ["Cụm Worker Vận Chuyển"]
        QueueShip --> W4["Worker Giao Hàng"]
    end`
    },
    codeLanguage: 'typescript',
    codeExample: `import amqp from 'amqplib';

// Khởi tạo Fanout Exchange và Bind các Queue tương ứng
export async function setupOrderEventTopology() {
  const conn = await amqp.connect(process.env.RABBITMQ_URL || 'amqp://localhost');
  const channel = await conn.createChannel();

  const exchangeName = 'order_events_fanout';
  await channel.assertExchange(exchangeName, 'fanout', { durable: true });

  const queues = ['email_service_queue', 'inventory_service_queue', 'shipping_service_queue'];

  for (const q of queues) {
    await channel.assertQueue(q, { durable: true });
    await channel.bindQueue(q, exchangeName, '');
  }

  console.log('Topology RabbitMQ Fanout sẵn sàng phục vụ Pub/Sub');
}`
  },

  'becore-059': {
    diagram: {
      type: 'mermaid',
      title: 'Luồng Cam Kết Hai Pha (Two-Phase Commit - 2PC) và Rủi Ro Khóa Treo',
      caption: 'Điều phối viên giao dịch đảm bảo tính toàn vẹn tuyệt đối qua 2 pha: Chuẩn bị (Prepare) và Cam kết (Commit)',
      code: `sequenceDiagram
    autonumber
    participant C as Điều phối viên (Coordinator)
    participant A as Service Tài Khoản (Node A)
    participant B as Service Ví Tiền (Node B)

    Note over C,B: PHA 1: CHUẨN BỊ (PREPARE PHASE)
    C->>A: Gửi Prepare: Bạn có thể trừ 500k không?
    C->>B: Gửi Prepare: Bạn có thể cộng 500k không?
    A->>A: Khóa hàng ghi (Row Lock) + Ghi Redo Log
    B->>B: Khóa hàng ghi (Row Lock) + Ghi Redo Log
    A-->>C: Vote YES (Sẵn sàng)
    B-->>C: Vote YES (Sẵn sàng)

    Note over C,B: PHA 2: CAM KẾT (COMMIT PHASE)
    C->>C: Quyết định toàn thể: COMMIT
    C->>A: Gửi Lệnh: Global Commit
    C->>B: Gửi Lệnh: Global Commit
    A->>A: Áp dụng thay đổi & Giải phóng Row Lock
    B->>B: Áp dụng thay đổi & Giải phóng Row Lock
    A-->>C: Đã Commit thành công
    B-->>C: Đã Commit thành công

    Note over C,B: ⚠️ Nhược điểm: Nếu Coordinator chết ở giữa Pha 2, Node A và B bị treo khóa (Blocking)`
    },
    codeLanguage: 'typescript',
    codeExample: `// Minh họa pseudo-code điều phối Two-Phase Commit
interface Participant {
  prepare(txId: string): Promise<boolean>;
  commit(txId: string): Promise<void>;
  rollback(txId: string): Promise<void>;
}

export async function executeTwoPhaseCommit(txId: string, nodes: Participant[]) {
  // PHA 1: PREPARE
  const votes = await Promise.all(nodes.map(n => n.prepare(txId)));
  const allAgreed = votes.every(v => v === true);

  // PHA 2: COMMIT HOẶC ROLLBACK
  if (allAgreed) {
    await Promise.all(nodes.map(n => n.commit(txId)));
    return { status: 'COMMITTED' };
  } else {
    await Promise.all(nodes.map(n => n.rollback(txId)));
    throw new Error('2PC Transaction Aborted due to participant voting NO');
  }
}`
  },

  'becore-070': {
    diagram: {
      type: 'mermaid',
      title: 'Kiến Trúc Partition và Consumer Group Trong Apache Kafka',
      caption: 'Mỗi Partition trong 1 Topic chỉ được tiêu thụ bởi đúng 1 Consumer trong cùng 1 Consumer Group',
      code: `flowchart LR
    subgraph Topic ["Kafka Topic: order-events (4 Partitions)"]
        P0["Partition 0<br>(Orders 0, 4, 8...)"]
        P1["Partition 1<br>(Orders 1, 5, 9...)"]
        P2["Partition 2<br>(Orders 2, 6, 10...)"]
        P3["Partition 3<br>(Orders 3, 7, 11...)"]
    end

    subgraph GroupA ["Consumer Group: OrderProcessing (3 Consumers)"]
        C1["Consumer 1<br>(Xử lý P0 & P1)"]
        C2["Consumer 2<br>(Xử lý P2)"]
        C3["Consumer 3<br>(Xử lý P3)"]
    end

    subgraph GroupB ["Consumer Group: AnalyticsStream (1 Consumer)"]
        C4["Consumer 4<br>(Đọc trọn vẹn cả P0, P1, P2, P3)"]
    end

    P0 --> C1
    P1 --> C1
    P2 --> C2
    P3 --> C3

    P0 -.-> C4
    P1 -.-> C4
    P2 -.-> C4
    P3 -.-> C4`
    },
    codeLanguage: 'typescript',
    codeExample: `import { Kafka } from 'kafkajs';

const kafka = new Kafka({ clientId: 'order-app', brokers: ['localhost:9092'] });

// Consumer Group scale ngang tự động cân bằng (Rebalance)
export async function startOrderConsumer() {
  const consumer = kafka.consumer({ groupId: 'order-processing-group' });

  await consumer.connect();
  await consumer.subscribe({ topic: 'order-events', fromBeginning: false });

  await consumer.run({
    eachMessage: async ({ topic, partition, message }) => {
      console.log({
        partition,
        offset: message.offset,
        key: message.key?.toString(),
        value: message.value?.toString()
      });
    }
  });
}`
  },

  'becore-074': {
    diagram: {
      type: 'mermaid',
      title: 'Cơ Chế Xử Lý Lỗi và Retry Bằng Dead Letter Exchange (DLX) Trong RabbitMQ',
      caption: 'Sử dụng Dead Letter Exchange và TTL để tạo luồng thử lại có độ trễ (Exponential Backoff)',
      code: `flowchart TD
    Producer["Producer"] --> MainEx{"Main Exchange"}
    MainEx --> MainQueue[("Main Queue<br>(orders_queue)")]
    
    MainQueue --> Worker["Worker Xử Lý"]
    Worker -->|"Thành công"| Ack["ack() -> Xóa khỏi Queue"]
    Worker -->|"Lỗi mạng / DB down"| Nack["nack(requeue = false)"]
    
    Nack --> DLX{"Dead Letter Exchange (DLX)"}
    DLX --> RetryQueue[("Retry Queue<br>(TTL: 10 giây)")]
    
    RetryQueue -->|"Sau khi hết 10s TTL"| DeadRoute{"Tự động route về"}
    DeadRoute --> MainQueue
    
    RetryQueue -->|"Quá 3 lần retry"| ParkingQueue[("Dead Letter Queue vĩnh viễn<br>(Bắn alert cho dev)")]`
    },
    codeLanguage: 'typescript',
    codeExample: `import amqp from 'amqplib';

// Thiết lập Dead Letter Exchange và Retry Queue với Message TTL
export async function setupRetryTopology(ch: amqp.Channel) {
  const DLX = 'orders.dlx';
  const RETRY_QUEUE = 'orders.retry.10s';
  const MAIN_QUEUE = 'orders.main';

  await ch.assertExchange(DLX, 'direct', { durable: true });

  // Queue chính forward tin nhắn bị Nack sang DLX
  await ch.assertQueue(MAIN_QUEUE, {
    durable: true,
    deadLetterExchange: DLX,
    deadLetterRoutingKey: 'retry'
  });

  // Retry Queue giữ message 10 giây rồi forward ngược lại Main Queue
  await ch.assertQueue(RETRY_QUEUE, {
    durable: true,
    messageTtl: 10000, // 10 giây
    deadLetterExchange: '',
    deadLetterRoutingKey: MAIN_QUEUE
  });

  await ch.bindQueue(RETRY_QUEUE, DLX, 'retry');
}`
  }
};

// ==========================================
// 3. DATABASE BANK (2 Questions)
// ==========================================
const dbUpdates = {
  'db-075': {
    diagram: {
      type: 'mermaid',
      title: 'Cây Quyết Định Kiến Trúc: Lựa Chọn SQL (RDBMS) vs NoSQL',
      caption: 'Hướng dẫn lựa chọn công nghệ lưu trữ dữ liệu dựa trên mô hình dữ liệu và đặc tính giao dịch',
      code: `flowchart TD
    Start{"Yêu cầu cốt lõi về dữ liệu là gì?"}
    
    Start -->|"Giao dịch tiền tệ, ACID nghiêm ngặt, JOIN phức tạp"| SQL["<b>RDBMS (SQL)</b><br>• PostgreSQL, MySQL<br>• Dữ liệu có cấu trúc bảng chặt chẽ"]
    
    Start -->|"Tốc độ đọc/ghi siêu lớn, schema động linh hoạt"| NoSQLCheck{"Kiểu dữ liệu NoSQL nào phù hợp?"}
    
    NoSQLCheck -->|"Lưu tài liệu JSON, E-Commerce Catalog"| Doc["<b>Document Store</b><br>• MongoDB, Couchbase"]
    NoSQLCheck -->|"Caching, Session, Leaderboard, Token"| KV["<b>Key-Value Store</b><br>• Redis, AWS DynamoDB"]
    NoSQLCheck -->|"Time-Series, Log, IoT hàng tỷ bản ghi"| Col["<b>Wide-Column Store</b><br>• Apache Cassandra, ScyllaDB"]
    NoSQLCheck -->|"Mạng xã hội, Fraud Detection, Graph RAG"| Graph["<b>Graph Database</b><br>• Neo4j, Amazon Neptune"]`
    }
  },

  'db-109': {
    diagram: {
      type: 'mermaid',
      title: 'Đồng Thuận Phân Tán Bằng Thuật Toán Raft Consensus Trong Distributed DB',
      caption: 'Cơ chế Leader Election và Log Replication đảm bảo tính nhất quán mạnh mẽ (Quorum >= (N/2) + 1)',
      code: `sequenceDiagram
    autonumber
    participant Client
    participant Leader as Leader (Node 1)
    participant F1 as Follower (Node 2)
    participant F2 as Follower (Node 3)

    Client->>Leader: Write(key="balance", val=100)
    Note over Leader: Ghi Append-only Log (Uncommitted)
    
    par Gửi AppendEntries RPC song song
        Leader->>F1: AppendEntries(key="balance", val=100)
        Leader->>F2: AppendEntries(key="balance", val=100)
    end
    
    F1-->>Leader: ACK (Đã ghi Log thành công)
    Note over Leader: Đã đủ Quorum đa số (2/3 Nodes đồng thuận)!
    Leader->>Leader: Commit Log & Áp dụng State Machine
    Leader-->>Client: 200 OK (Ghi thành công)
    
    par Báo Commit nền
        Leader->>F1: Heartbeat (CommitIndex = 1)
        Leader->>F2: Heartbeat (CommitIndex = 1)
    end`
    }
  }
};

// ==========================================
// 4. NODE.JS BANK (1 Question)
// ==========================================
const nodejsUpdates = {
  'nodejs-069': {
    diagram: {
      type: 'mermaid',
      title: 'Kiến Trúc Libuv: Event Loop Các Pha và Worker Thread Pool',
      caption: 'Mô hình xử lý bất đồng bộ non-blocking của Node.js kết hợp giữa V8 và Libuv C Library',
      code: `flowchart TD
    V8["Google V8 Engine (Single Thread Execution)"] <--> Libuv["Libuv C Library"]
    
    subgraph EventLoop ["Vòng Lặp Sự Kiện (Libuv Event Loop - Single Thread)"]
        direction TB
        P1["1. Timers (setTimeout, setInterval)"] --> P2["2. Pending Callbacks (I/O Callbacks)"]
        P2 --> P3["3. Idle, Prepare (Nội bộ Libuv)"]
        P3 --> P4["4. Poll Phase (Lắng nghe socket mới, đọc data)"]
        P4 --> P5["5. Check Phase (setImmediate)"]
        P5 --> P6["6. Close Callbacks (socket.on('close'))"]
        P6 --> P1
    end
    
    Libuv <--> EventLoop
    
    subgraph ThreadPool ["Libuv Worker Thread Pool (Mặc định 4 Threads)"]
        T1["Thread 1: fs (File system)"]
        T2["Thread 2: crypto (Bcrypt, RSA)"]
        T3["Thread 3: zlib (Compress, Gzip)"]
        T4["Thread 4: dns.lookup"]
    end
    
    EventLoop -.->|"Offload tác vụ nặng"| ThreadPool`
    }
  }
};

// ==========================================
// 5. DESIGN PATTERNS & RAILS (2 Questions)
// ==========================================
const dpUpdates = {
  'dp-040': {
    diagram: {
      type: 'mermaid',
      title: 'UML Class Diagram: Phân Biệt Association, Aggregation và Composition',
      caption: 'Quan hệ gắn kết và vòng đời giữa các đối tượng trong lập trình hướng đối tượng',
      code: `classDiagram
    class Company {
        +String name
        +createDepartment()
    }
    class Department {
        +String title
    }
    class Employee {
        +String fullName
    }
    class Laptop {
        +String serialNumber
    }

    Company "1" *-- "1..*" Department : Composition (Cùng sinh cùng tử)
    Department "1" o-- "0..*" Employee : Aggregation (Tồn tại độc lập)
    Employee "1" --> "1" Laptop : Association (Quan hệ sử dụng)`
    }
  }
};

const railsUpdates = {
  'rails-008': {
    diagram: {
      type: 'mermaid',
      title: 'Sơ Đồ Thực Thể Quan Hệ (ERD) Trong Ruby on Rails Active Record',
      caption: 'Mô hình hóa các quan hệ has_many, belongs_to, has_one và has_many :through',
      code: `erDiagram
    USER ||--o{ ORDER : "places (has_many)"
    USER ||--o| PROFILE : "owns (has_one)"
    ORDER ||--|{ LINE_ITEM : "contains (has_many)"
    PRODUCT ||--o{ LINE_ITEM : "included_in (has_many)"
    ORDER }o--o{ PRODUCT : "has_many :through => line_items"

    USER {
        bigint id PK
        string email
        string encrypted_password
        datetime created_at
    }
    ORDER {
        bigint id PK
        bigint user_id FK
        decimal total_price
        string status
    }
    LINE_ITEM {
        bigint id PK
        bigint order_id FK
        bigint product_id FK
        integer quantity
    }
    PRODUCT {
        bigint id PK
        string title
        decimal price
    }`
    }
  }
};

// Execute updates
console.log('🚀 Running Batch 1 Enrichment...');
updateBank('business-analyst-bank.json', baUpdates);
updateBank('backend-core-bank.json', becoreUpdates);
updateBank('database-bank.json', dbUpdates);
updateBank('nodejs-bank.json', nodejsUpdates);
updateBank('design-patterns-bank.json', dpUpdates);
updateBank('rails-bank.json', railsUpdates);
console.log('✅ Batch 1 completed successfully.');
