import fs from 'node:fs';
import path from 'node:path';

const filePath = path.resolve('src/features/interview/data/json/design-patterns-bank.json');
const questions = JSON.parse(fs.readFileSync(filePath, 'utf8'));

// 1. Factory Method (dp-003)
const qDp03 = questions.find((q) => q.id === 'dp-003');
if (qDp03) {
  qDp03.seniorAnswer.diagram = {
    type: 'mermaid',
    title: 'Mẫu Thiết Kế Factory Method (Factory Method Pattern Architecture)',
    caption: 'Đóng gói logic khởi tạo đối tượng phức tạp, tách rời client khỏi concrete implementation',
    code: `classDiagram
    class NotificationFactory {
        <<abstract>>
        +createNotification()* Notification
        +send(message: string)
    }
    class EmailNotificationFactory {
        +createNotification() Notification
    }
    class SMSNotificationFactory {
        +createNotification() Notification
    }
    class Notification {
        <<interface>>
        +deliver(msg: string)*
    }
    class EmailNotification {
        +deliver(msg: string)
    }
    class SMSNotification {
        +deliver(msg: string)
    }

    NotificationFactory <|-- EmailNotificationFactory
    NotificationFactory <|-- SMSNotificationFactory
    Notification <|.. EmailNotification
    Notification <|.. SMSNotification
    NotificationFactory ..> Notification : "creates"`,
  };
}

// 2. Adapter Pattern (dp-007)
const qDp07 = questions.find((q) => q.id === 'dp-007');
if (qDp07) {
  qDp07.seniorAnswer.diagram = {
    type: 'mermaid',
    title: 'Mẫu Thiết Kế Adapter (Adapter Pattern: Cầu Nối Cổng Thanh Toán)',
    caption: 'Chuyển đổi giao diện của bên thứ ba không tương thích thành giao diện chuẩn mực của hệ thống',
    code: `flowchart LR
    Client["Checkout Service (Client)"] -->|"Dùng interface chuẩn: pay(amount)"| Target["PaymentProcessor Interface"]
    Target <|.. Adapter["StripePaymentAdapter"]
    Adapter -->|"Map sang API cũ của vendor: chargeCustomer()"| Adaptee["Stripe SDK Legacy / Third-party"]`,
  };
}

// 3. Decorator Pattern (dp-010)
const qDp10 = questions.find((q) => q.id === 'dp-010');
if (qDp10) {
  qDp10.seniorAnswer.diagram = {
    type: 'mermaid',
    title: 'Mẫu Thiết Kế Decorator (Decorator / Middleware Pipeline)',
    caption: 'Bổ sung hành vi động (Logging, Caching, Auth) cho đối tượng mà không can thiệp vào lớp cơ sở',
    code: `flowchart TD
    Req["Request"] --> Logging["LoggingDecorator (Ghi nhận thời gian bắt đầu)"]
    Logging --> Auth["AuthDecorator (Kiểm tra Token & Phân quyền)"]
    Auth --> Cache["CachingDecorator (Kiểm tra Redis Hit/Miss)"]
    Cache --> Core["CoreRequestHandler (Xử lý nghiệp vụ chính)"]
    Core --> Cache
    Cache --> Auth
    Auth --> Logging
    Logging --> Res["Response + Metrics"]`,
  };
}

// 4. Strategy Pattern (dp-015)
const qDp15 = questions.find((q) => q.id === 'dp-015');
if (qDp15) {
  qDp15.seniorAnswer.diagram = {
    type: 'mermaid',
    title: 'Mẫu Thiết Kế Strategy (Strategy Pattern: Đa Dạng Chiến Lược Tính Giá)',
    caption: 'Đóng gói các thuật toán tính toán có thể hoán đổi linh hoạt tại runtime mà không dùng if/else lồng nhau',
    code: `classDiagram
    class PricingContext {
        -pricingStrategy: IPricingStrategy
        +setStrategy(strategy: IPricingStrategy)
        +calculateTotal(cart: Cart): number
    }
    class IPricingStrategy {
        <<interface>>
        +calculate(cart: Cart)*: number
    }
    class NormalPricingStrategy {
        +calculate(cart: Cart): number
    }
    class BlackFridayPricingStrategy {
        +calculate(cart: Cart): number
    }
    class VIPMemberPricingStrategy {
        +calculate(cart: Cart): number
    }

    PricingContext o-- IPricingStrategy : "delegates to"
    IPricingStrategy <|.. NormalPricingStrategy
    IPricingStrategy <|.. BlackFridayPricingStrategy
    IPricingStrategy <|.. VIPMemberPricingStrategy`,
  };
}

// 5. State Pattern (dp-020)
const qDp20 = questions.find((q) => q.id === 'dp-020');
if (qDp20) {
  qDp20.seniorAnswer.diagram = {
    type: 'mermaid',
    title: 'Mẫu Thiết Kế State (Order Lifecycle State Machine)',
    caption: 'Đối tượng thay đổi hành vi tương ứng khi trạng thái nội tại thay đổi, loại bỏ switch-case cồng kềnh',
    code: `stateDiagram-v2
    [*] --> PendingPayment : Khởi tạo đơn hàng
    PendingPayment --> Paid : Thanh toán thành công (Webhook IPN)
    PendingPayment --> Cancelled : Hết hạn thanh toán (TTL 15m)
    Paid --> Processing : Điều phối kho vận (Warehouse Assigned)
    Processing --> Shipping : Xuất kho & Bàn giao Shipper
    Shipping --> Delivered : Giao hàng thành công (POD Signed)
    Shipping --> Returned : Giao thất bại 3 lần (RTO)
    Delivered --> [*]
    Cancelled --> [*]
    Returned --> [*]`,
  };
}

fs.writeFileSync(filePath, JSON.stringify(questions, null, 2), 'utf8');
console.log('Successfully enriched design-patterns-bank.json with diagrams!');
