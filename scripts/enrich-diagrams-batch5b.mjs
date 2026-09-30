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
      count++;
    }
  }

  fs.writeFileSync(filePath, JSON.stringify(data, null, 2) + '\n', 'utf8');
  console.log(`[${fileName}] Updated ${count} questions.`);
}

// ==========================================
// 1. FLUTTER (3 Questions)
// ==========================================
const fltUpdates = {
  'flt-042': {
    diagram: {
      type: 'mermaid',
      title: 'Kiến Trúc Clean Architecture Trong Ứng Dụng Flutter',
      caption: 'Mô hình 3 tầng độc lập: Presentation, Domain (Pure Dart) và Data Layer',
      code: `flowchart TD
    subgraph PresentationLayer ["Tầng Trình Diễn (Presentation Layer)"]
        UI["Flutter Widgets / Screens"] <--> StateMgmt["State Management (Bloc / Riverpod)"]
    end

    subgraph DomainLayer ["Tầng Miền Nghiệp Vụ (Domain Layer - Pure Dart)"]
        StateMgmt --> UseCase["Use Cases (Business Rules)"]
        UseCase --> Entity["Entities (Plain Data Models)"]
        UseCase --> RepoContract["Repository Contracts (Interfaces)"]
    end

    subgraph DataLayer ["Tầng Dữ Liệu (Data Layer)"]
        RepoImpl["Repository Implementations"] -.->|"Implements"| RepoContract
        RepoImpl --> LocalDS["Local Data Source (Hive / Isar / SQLite)"]
        RepoImpl --> RemoteDS["Remote Data Source (Dio / Retrofit HTTP)"]
    end`
    }
  },

  'flt-047': {
    diagram: {
      type: 'mermaid',
      title: 'Vai Trò Tầng Use Case Trong Clean Architecture Flutter',
      caption: 'Đóng gói một quy tắc nghiệp vụ duy nhất (Single Responsibility) có thể tái sử dụng độc lập với UI',
      code: `flowchart LR
    BlocA["Login Bloc"] --> LoginUC["LoginWithEmailUseCase"]
    BlocB["Checkout Bloc"] --> LoginUC
    
    LoginUC --> Validator["1. Kiểm tra định dạng Email & Mật khẩu"]
    Validator --> Hash["2. Băm mã mật khẩu (Crypto)"]
    Hash --> Repo["3. Gọi AuthRepository.login()"]
    Repo --> Result{"Thành công hay Thất bại?"}
    Result --> Either["Trả về: Either<Failure, UserEntity>"]`
    }
  },

  'flt-048': {
    diagram: {
      type: 'mermaid',
      title: 'Cấu Trúc Thư Mục Feature-First Clean Architecture Trong Flutter',
      caption: 'Tổ chức mã nguồn theo từng Feature độc lập giúp dự án mở rộng lên hàng chục lập trình viên',
      code: `flowchart TD
    Root["lib/"] --> Core["core/ (theme, network, error, utils)"]
    Root --> Features["features/"]
    
    subgraph AuthFeature ["features/authentication/"]
        Data["data/ (datasources, models, repositories)"]
        Domain["domain/ (entities, repositories, usecases)"]
        Pres["presentation/ (bloc, screens, widgets)"]
    end

    Features --> AuthFeature
    Features --> OrderFeature["features/order/ (data, domain, presentation)"]
    Features --> ProductFeature["features/product/ (data, domain, presentation)"]`
    }
  }
};

// ==========================================
// 2. FRONTEND CORE & JS/TS (3 Questions)
// ==========================================
const feUpdates = {
  'fecore-048': {
    diagram: {
      type: 'mermaid',
      title: 'Cơ Chế Event Loop Trong Trình Duyệt: Call Stack, Microtasks và Macrotasks',
      caption: 'Thứ tự ưu tiên: Call Stack -> Microtask Queue (xả sạch hoàn toàn) -> Render UI -> 1 Macrotask',
      code: `flowchart TD
    Stack["<b>Call Stack (Ngăn Xếp Thực Thi V8)</b><br>Chạy code đồng bộ cho đến khi rỗng"] --> MicroCheck{"Call Stack đã rỗng?"}
    
    subgraph MicroQueue ["Hàng Đợi Vi Tác Vụ (Microtask Queue)"]
        MicroTasks["Promise.then(), queueMicrotask(), MutationObserver<br><b>⚡ QUY TẮC: XẢ HẾT 100% MICROTASK trước khi làm việc khác!</b>"]
    end

    MicroCheck -->|"Có"| MicroQueue
    MicroQueue --> RenderCheck{"Có cần vẽ lại màn hình không?"}
    
    subgraph RenderPhase ["Tầng Vẽ Màn Hình (Render Steps - 60 FPS)"]
        RenderCheck -->|"Mỗi 16.6ms"| RAF["requestAnimationFrame() -> Style -> Layout -> Paint"]
    end

    RenderPhase --> MacroQueue
    RenderCheck -->|"Chưa đến nhịp vẽ"| MacroQueue

    subgraph MacroQueue ["Hàng Đợi Đại Tác Vụ (Macrotask / Task Queue)"]
        Macros["setTimeout, setInterval, I/O, UI Events<br><b>👉 CHỈ LẤY ĐÚNG 1 TASK DUY NHẤT</b> đưa vào Call Stack rồi lặp lại!"]
    end

    MacroQueue --> Stack`
    }
  },

  'fecore-100': {
    diagram: {
      type: 'mermaid',
      title: 'Luồng Làm Mới Token Ngầm (Silent Refresh Token) Phía Frontend',
      caption: 'Lưu Access Token ngắn hạn trong bộ nhớ RAM; tự động làm mới trước khi hết hạn 60 giây',
      code: `sequenceDiagram
    autonumber
    participant UI as Giao Diện React
    participant Client as Axios / Fetch Client
    participant Auth as Auth Server

    UI->>Client: Gọi API lấy dữ liệu người dùng
    Note over Client: Kiểm tra: Access Token còn 45s sẽ hết hạn!
    
    Client->>Auth: POST /auth/refresh (Tự động gửi Cookie HttpOnly chứa Refresh Token)
    Auth->>Auth: Xác thực Refresh Token hợp lệ
    Auth-->>Client: Cấp Access Token mới (Thời hạn 15 phút)
    
    Client->>Client: Cập nhật Access Token trong RAM
    Client->>UI: Thực thi API ban đầu với Token mới trong suốt với người dùng`
    }
  },

  'int-11': {
    diagram: {
      type: 'mermaid',
      title: 'So Sánh Event Loop: Trình Duyệt (Browser) vs Node.js (Libuv)',
      caption: 'Sự khác biệt cốt lõi về thứ tự xả Microtask và các pha xử lý I/O',
      code: `flowchart TD
    subgraph BrowserLoop ["Event Loop Trình Duyệt (HTML5 Spec)"]
        B1["Call Stack"] --> B2["Xả Toàn Bộ Microtasks (Promise)"]
        B2 --> B3["Render Pipeline (nếu tới nhịp 60Hz)"]
        B3 --> B4["Lấy 1 Macrotask duy nhất (setTimeout)"]
        B4 --> B1
    end

    subgraph NodeLoop ["Event Loop Node.js (Libuv Phases)"]
        N1["1. Timers (setTimeout, setInterval)"] --> N_Micro1["Xả process.nextTick() & Microtasks"]
        N_Micro1 --> N2["2. Pending Callbacks (I/O)"]
        N2 --> N_Micro2["Xả Microtasks"]
        N_Micro2 --> N3["3. Poll Phase (Nhận kết nối I/O mới)"]
        N3 --> N_Micro3["Xả Microtasks"]
        N_Micro3 --> N4["4. Check Phase (setImmediate)"]
        N4 --> N1
    end`
    }
  }
};

// ==========================================
// 3. IOS BANK (3 Questions)
// ==========================================
const iosUpdates = {
  'ios-013': {
    diagram: {
      type: 'pipeline',
      title: 'Vòng Đời Hoàn Chỉnh Của Một View Trong SwiftUI',
      caption: 'Vì sao View trong SwiftUI là Struct siêu nhẹ thay vì Class kế thừa nặng nề như UIKit',
      stages: [
        { name: '1. Khởi Tạo Struct (Allocation)', description: 'SwiftUI khởi tạo View Struct trên Stack với chi phí gần bằng 0 nanosecond', duration: 'Bước 1' },
        { name: '2. Đánh Giá Body (Evaluation)', description: 'Khi State / Binding thay đổi, SwiftUI gọi `body` để tính toán cây View đồ thị mới', duration: 'Bước 2' },
        { name: '3. So Sánh Phân Cấp (Diffing)', description: 'Thuật toán Diffing so sánh đồ thị mới và cũ, chỉ cập nhật đúng node render bị thay đổi', duration: 'Bước 3' },
        { name: '4. onAppear / onDisappear', description: 'Gắn vào và gỡ khỏi phân cấp hiển thị trên màn hình để kích hoạt hoặc hủy animation/task', duration: 'Bước 4' }
      ]
    }
  },

  'ios-039': {
    diagram: {
      type: 'mermaid',
      title: 'State Machine: Vòng Đời Ứng Dụng iOS (App Lifecycle - UISceneDelegate)',
      caption: 'Các trạng thái chuyển dịch giữa Not Running, Inactive, Active, Background và Suspended',
      code: `stateDiagram-v2
    [*] --> NotRunning: Ứng dụng chưa bật
    NotRunning --> Inactive: Người dùng chạm icon mở app
    Inactive --> Active: App lên tiền đài (sceneDidBecomeActive)
    
    Active --> Inactive: Có cuộc gọi đến / Kéo Control Center
    Inactive --> Background: Người dùng vuốt thoát ra Home
    
    Background --> Suspended: Hệ điều hành đóng băng RAM (sau 5-30s)
    Suspended --> NotRunning: iOS dọn RAM khi thiếu bộ nhớ (Killed)
    
    Suspended --> Background: Kích hoạt Background Fetch / Push ngầm
    Background --> Active: Người dùng mở lại app
    
    Active --> [*]
    NotRunning --> [*]`
    }
  },

  'ios-048': {
    diagram: {
      type: 'mermaid',
      title: 'Kiến Trúc VIPER Trong Lập Trình iOS (Clean Architecture Enterprise)',
      caption: 'Phân tách 5 thành phần trách nhiệm: View, Interactor, Presenter, Entity và Router',
      code: `flowchart LR
    View["<b>View</b><br>(UIViewController / SwiftUI)"] <-->|"Truyền sự kiện & Nhận ViewModel"| Presenter["<b>Presenter</b><br>(Điều phối hiển thị)"]
    
    Presenter <-->|"Yêu cầu dữ liệu"| Interactor["<b>Interactor</b><br>(Chứa Business Logic thuần túy)"]
    Interactor <--> Entity[("<b>Entity</b><br>(Core Data Models)")]
    
    Presenter -->|"Chuyển màn hình"| Router["<b>Router / Wireframe</b><br>(Điều hướng Navigation)"]`
    }
  }
};

// ==========================================
// 4. NESTJS & NODEJS & PYTHON (5 Questions)
// ==========================================
const backendDevUpdates = {
  'nestjs-059': {
    diagram: {
      type: 'mermaid',
      title: 'Vòng Đời Provider Trong NestJS: DEFAULT, REQUEST và TRANSIENT Scope',
      caption: 'Sử dụng ModuleRef để trích xuất Request-scoped Provider bên ngoài ngữ cảnh HTTP',
      code: `flowchart TD
    subgraph Scopes ["3 Cấp Độ Phạm Vi Provider Trong NestJS"]
        DefaultScope["<b>1. DEFAULT (Singleton - Khuyên dùng)</b><br>Khởi tạo duy nhất 1 lần lúc boot server, chia sẻ cho 100% request"]
        RequestScope["<b>2. REQUEST Scope</b><br>Tạo mới 1 instance cho MỖI HTTP Request (Tốn CPU/RAM nếu lạm dụng)"]
        TransientScope["<b>3. TRANSIENT Scope</b><br>Mỗi nơi Inject là 1 instance hoàn toàn độc lập"]
    end

    subgraph ModuleRefResolving ["Giải Quyết Request-Scoped Bằng ModuleRef"]
        Worker["Cron Job / Queue Worker (Không có HTTP context)"] --> ModuleRef["ModuleRef.resolve(TenantService, contextId)"]
        ModuleRef --> DedicatedInstance["Tạo instance độc lập an toàn đa luồng"]
    end`
    }
  },

  'nodejs-051': {
    diagram: {
      type: 'mermaid',
      title: 'Tại Sao Node.js Đơn Luồng (Single-Thread) Vẫn Xử Lý Hàng Chục Nghìn Request Đồng Thời?',
      caption: 'Mô hình Non-Blocking I/O phân tách luồng điều phối V8 và tầng I/O bất đồng bộ của Kernel OS',
      code: `flowchart LR
    Clients["10.000 Kết Nối HTTP Đồng Thời"] --> EventLoop["<b>Node.js Main Thread (V8 Event Loop)</b><br>• Chỉ làm nhiệm vụ điều phối và ủy thác<br>• Không bao giờ chờ đợi I/O hoàn tất!"]
    
    subgraph NonBlockingEngines ["Tầng Bất Đồng Bộ Phía Dưới"]
        EventLoop -->|"Ủy thác Network Socket"| OSKernel["OS Kernel (epoll trên Linux / kqueue trên macOS)"]
        EventLoop -->|"Ủy thác File/Crypto nặng"| LibuvPool["Libuv Thread Pool (Mặc định 4 Threads)"]
    end

    OSKernel & LibuvPool -.->|"Bắn tín hiệu hoàn tất (Event Ready)"| EventLoop`
    }
  },

  'nodejs-058': {
    diagram: {
      type: 'mermaid',
      title: 'Phân Phối Tác Vụ Trong Libuv Thread Pool Và Tác Động Của UV_THREADPOOL_SIZE',
      caption: 'Những API nào chạy trên Thread Pool và những API nào chạy trực tiếp trên OS Kernel',
      code: `flowchart TD
    NodeAPI["Lời Gọi Hàm Trong Ứng Dụng Node.js"]
    
    NodeAPI --> CheckType{"Loại Tác Vụ Là Gì?"}
    
    subgraph KernelBypass ["KHÔNG DÙNG THREAD POOL (Non-blocking Native Kernel)"]
        CheckType -->|"TCP/UDP Socket, HTTP, DNS resolve"| OSKernel["OS Kernel (epoll/kqueue): Hỗ trợ hàng triệu socket đồng thời, zero thread pool!"]
    end

    subgraph ThreadPoolUsed ["DÙNG LIBUV THREAD POOL (UV_THREADPOOL_SIZE mặc định = 4)"]
        CheckType -->|"fs.* (File System I/O)"| TP["Libuv Thread Pool"]
        CheckType -->|"crypto (pbkdf2, bcrypt, scrypt)"| TP
        CheckType -->|"zlib (Gzip, deflate compression)"| TP
        CheckType -->|"dns.lookup() (Duyệt file /etc/hosts)"| TP
    end

    TP --> Note["⚠️ Nếu 4 tác vụ crypto nặng chạy cùng lúc, toàn bộ tác vụ đọc file fs sẽ bị nghẽn! Tăng lên: UV_THREADPOOL_SIZE=64"]`
    }
  },

  'nodejs-075': {
    diagram: {
      type: 'mermaid',
      title: 'Hiện Tượng Chặn Vòng Lặp Sự Kiện (Event Loop Blocking) Trong Node.js',
      caption: 'Hậu quả khi chạy thuật toán tính toán CPU nặng trên Main Thread và Giải pháp Worker Threads',
      code: `flowchart TD
    subgraph BlockingDisaster ["❌ NGHẼN EVENT LOOP (Main Thread Chết Đứng)"]
        Req1["Request 1: Chạy vòng lặp for 10 tỷ lần tính toán số nguyên tố"] --> Main["Node.js Main Thread (BỊ CHIẾM GIỮ 100% CPU 10 GIÂY)"]
        Req2["Request 2: Người dùng khác vào xem trang chủ"] --> Wait["BỊ ĐƠ 10 GIÂY KHÔNG PHẢN HỒI!"]
    end

    subgraph WorkerSolution ["✅ GIẢI PHÁP: Worker Threads (Worker Pool)"]
        ReqA["Request Tính Toán Nặng"] --> DispatchWorker["worker_threads.Worker('./compute.js')"]
        DispatchWorker --> WorkerThread["Thread Riêng Biệt (Không làm đơ Main Thread)"]
        MainThreadFree["Main Thread V8 Vẫn Phản Hồi Request 2 Trong 1ms!"]
    end`
    }
  },

  'nodejs-083': {
    diagram: {
      type: 'mermaid',
      title: 'Mẫu Thiết Kế Reactor Pattern: Nền Tảng Cốt Lõi Của Node.js Event Loop',
      caption: 'Cơ chế Synchronous Event Demultiplexer biến các sự kiện bất đồng bộ thành luồng xử lý tuần tự',
      code: `flowchart LR
    App["Ứng Dụng Yêu Cầu Đọc Socket"] --> Demux["<b>Synchronous Event Demultiplexer</b><br>(epoll / kqueue / IOCP)"]
    Demux -->|"Chờ và gom các I/O Events đã sẵn sàng"| EventQueue["Event Queue (Hàng Đợi Sự Kiện)"]
    EventQueue --> ReactorLoop["<b>Reactor (Event Loop)</b><br>Lấy từng sự kiện ra khỏi Queue"]
    ReactorLoop --> Handler["Kích hoạt Callback Handler tương ứng đã đăng ký"]
    Handler --> App`
    }
  },

  'python-032': {
    diagram: {
      type: 'mermaid',
      title: 'Mô Hình Bất Đồng Bộ async/await Và Event Loop Trong Python (asyncio)',
      caption: 'Cơ chế hoán đổi quyền điều khiển (Yielding Control) qua Coroutines và Tasks',
      code: `flowchart TD
    MainCoro["Coro A: fetch_data()"] --> Await["await client.get('https://api.com')"]
    
    Await --> YieldToLoop["Nhường Quyền Điều Khiển Lại Cho Event Loop (Yield Control)"]
    
    subgraph PythonEventLoop ["asyncio Event Loop"]
        YieldToLoop --> SelectTask["Event Loop kiểm tra Task nào khác đang sẵn sàng?"]
        SelectTask --> RunCoroB["Chạy Coroutine B: process_cache()"]
    end

    IO_Done["I/O Mạng Hoàn Tất (HTTP Response 200)"] --> LoopNotify["Báo cho Event Loop"]
    LoopNotify --> ResumeA["Đánh thức Coroutine A tiếp tục chạy dòng code sau lệnh await"]`
    }
  }
};

// ==========================================
// 5. QA & REACT & RN & RUST & SPRING & STATE & VUE (12 Questions)
// ==========================================
const finalUpdates = {
  'qa-008': {
    diagram: {
      type: 'mermaid',
      title: 'Vòng Đời Chuẩn Của Lỗi Phần Mềm (Defect / Bug Life Cycle)',
      caption: 'Trạng thái chuyển dịch của một Bug từ lúc Tester phát hiện đến khi Đóng vĩnh viễn',
      code: `stateDiagram-v2
    [*] --> New: Tester phát hiện & tạo bug
    New --> Assigned: Lead gán cho Developer
    Assigned --> Open: Developer bắt đầu điều tra
    
    Open --> Rejected: Không phải lỗi (By Design)
    Open --> Deferred: Lỗi nhỏ, hoãn sang bản sau
    Open --> Duplicate: Đã có ticket tương tự
    Open --> Fixed: Developer đã sửa xong mã nguồn
    
    Fixed --> PendingRetest: Build bản kiểm thử mới
    PendingRetest --> Retest: QA kiểm tra lại lỗi
    
    Retest --> Reopened: Lỗi vẫn còn xuất hiện
    Reopened --> Assigned
    
    Retest --> Verified: Lỗi đã được khắc phục hoàn toàn
    Verified --> Closed: Đóng ticket thành công
    
    Closed --> [*]
    Rejected --> [*]
    Duplicate --> [*]`
    }
  },

  'react-036': {
    diagram: {
      type: 'mermaid',
      title: 'Ba Giai Đoạn Vòng Đời Của React Component: Mount, Update và Unmount',
      caption: 'Mô hình hóa quá trình chuyển dịch trạng thái và kích hoạt hooks tương ứng',
      code: `flowchart LR
    Mount["<b>1. Giai Đoạn MOUNT (Gắn Vào DOM)</b><br>• Khởi tạo State & Props<br>• Render JSX thành DOM ảo<br>• useEffect(() => {}, []) kích hoạt"]
    
    Mount --> Update["<b>2. Giai Đoạn UPDATE (Tái Render)</b><br>• State thay đổi (setState)<br>• Props mới từ component cha<br>• useEffect(() => {}, [deps]) kích hoạt"]
    
    Update --> Unmount["<b>3. Giai Đoạn UNMOUNT (Gỡ Bỏ)</b><br>• Component bị xóa khỏi DOM<br>• Cleanup function trong useEffect kích hoạt để hủy timer/listener"]`
    }
  },

  'react-045': {
    diagram: {
      type: 'pipeline',
      title: 'Thứ Tự Thực Thi Render & Commit Phase Trong React Component',
      caption: 'Phân tách giữa giai đoạn thuần túy không tác dụng phụ (Render) và giai đoạn can thiệp DOM thực tế (Commit)',
      stages: [
        { name: '1. Render Phase (Pure)', description: 'Chạy function component, tính toán JSX, so sánh Virtual DOM Diffing. Không được gây side effect!', duration: 'Render Phase' },
        { name: '2. Pre-Commit DOM', description: 'React cập nhật các node DOM thực tế trên trình duyệt', duration: 'Commit Phase' },
        { name: '3. useLayoutEffect', description: 'Kích hoạt đồng bộ ngay sau khi DOM cập nhật nhưng TRƯỚC KHI trình duyệt vẽ màn hình (đo đạc layout)', duration: 'Layout Phase' },
        { name: '4. Browser Paint & useEffect', description: 'Trình duyệt vẽ màn hình xong (60fps); React kích hoạt bất đồng bộ các hàm useEffect()', duration: 'Passive Effect' }
      ]
    }
  },

  'react-094': {
    diagram: {
      type: 'mermaid',
      title: 'Cơ Chế Gom Nhóm Tự Động (Automatic Batching) Trong React 18',
      caption: 'React 18 tự động gom mọi lệnh setState bên trong setTimeout, Promise và Event Listeners thành 1 lần re-render duy nhất',
      code: `flowchart TD
    subgraph React17Old ["React 17 Cũ (Không Batching Trong Async Callback)"]
        AsyncCall1["setTimeout(() => {<br>  setCount(c + 1); // Render Lần 1!<br>  setFlag(true);   // Render Lần 2!<br>})"]
        Note17["⚠️ Gây ra 2 lần re-render thừa liên tiếp, UI có thể bị giật hình nhấp nháy!"]
    end

    subgraph React18New ["React 18 Hiện Đại (Automatic Batching Toàn Diện)"]
        AsyncCall2["setTimeout(() => {<br>  setCount(c + 1);<br>  setFlag(true);<br>})"] --> MicrotaskBatch["React đưa vào Batch Queue ở cuối lượt Event Loop"]
        MicrotaskBatch --> SingleRender["Chỉ Re-render ĐÚNG 1 LẦN DUY NHẤT (< 16ms)"]
    end`
    }
  },

  'rn-004': {
    diagram: {
      type: 'mermaid',
      title: 'So Sánh Vòng Đời Component: React Native vs React Web',
      caption: 'React Native không gắn vào HTML DOM mà liên kết trực tiếp với Native Views (UIView / android.view.View)',
      code: `flowchart LR
    subgraph ReactWeb ["React Web"]
        R_Web["React Component"] --> VDOM["Virtual DOM Diffing"] --> HTMLDOM["HTML DOM Element: ` + "`" + `<div>` + "`" + `, ` + "`" + `<p>` + "`" + `"]
    end

    subgraph ReactNative ["React Native (New Architecture - Fabric Engine)"]
        RN_Comp["React Native Component"] --> ShadowTree["C++ Shadow Tree (Tính toán Yoga Layout)"]
        ShadowTree --> NativeView["Native Views:<br>• iOS: UIView / RCTView<br>• Android: ViewGroup / ReactViewGroup"]
    end`
    }
  },

  'rust-010': {
    diagram: {
      type: 'mermaid',
      title: 'Cơ Chế Vòng Đời (Lifetimes) Và Borrow Checker Trong Rust Lúc Biên Dịch',
      caption: 'Ký hiệu \'a đảm bảo con trỏ tham chiếu không bao giờ trỏ vào vùng nhớ rác đã bị giải phóng (Dangling Pointer)',
      code: `flowchart TD
    subgraph ValidLifetime ["Tham Chiếu Hợp Lệ (Vòng Đời Dữ Liệu Lớn Hơn Tham Chiếu)"]
        DataOrigin["Dữ liệu gốc (Scope Lớn: 'a)"]
        Ref["Con trỏ tham chiếu &data (Scope Nhỏ: 'b)"]
        DataOrigin --- Ref
        Valid["✅ Borrow Checker CHẤP THUẬN: Dữ liệu vẫn còn sống khi con trỏ được dùng"]
    end

    subgraph DanglingHazard ["❌ NGUY HIỂM: Dangling Pointer"]
        InnerScope["{ let s = String::from('hello'); r = &s; } // s bị Drop tại đây!"]
        OuterUse["println!('{}', r); // r trỏ vào vùng nhớ đã bị thu hồi!"]
        InnerScope -.-> OuterUse
        CompileErr["🚫 BỊ CHẶN BỞI BORROW CHECKER NGAY LÚC COMPILE!"]
    end`
    }
  },

  'rust-018': {
    diagram: {
      type: 'mermaid',
      title: 'Kiến Trúc Đa Luồng Tokio Runtime Với Work-Stealing Scheduler',
      caption: 'Các Worker Thread chủ động "đánh cắp" tác vụ từ hàng đợi của Worker khác khi rảnh rỗi',
      code: `flowchart TD
    GlobalQueue[("Tokio Global Injection Queue")]
    
    subgraph Workers ["Cụm Worker Threads Của Tokio"]
        W1["Worker Thread 1 (Đang quá tải 50 Tasks)"]
        W2["Worker Thread 2 (Vừa xử lý xong, hàng đợi rỗng!)"]
    end

    GlobalQueue --> W1
    
    W2 -->|"Work-Stealing: Đánh cắp 25 tasks từ đuôi hàng đợi của Worker 1"| W1
    
    W2 --> Efficient["✅ 100% Core CPU đều được tận dụng tối đa, không có Worker nào bị nhàn rỗi!"]`
    }
  },

  'spring-077': {
    diagram: {
      type: 'mermaid',
      title: 'Vòng Đời Thực Thể (Entity Lifecycle) Trong JPA / Hibernate',
      caption: 'Bốn trạng thái cơ bản: Transient (Mới), Managed (Trong ngữ cảnh Session), Detached và Removed',
      code: `stateDiagram-v2
    [*] --> TRANSIENT: new User() [Chưa có ID, chưa gắn Session]
    
    TRANSIENT --> MANAGED: entityManager.persist(user)
    
    MANAGED --> DETACHED: session.close() / detach() / clear()
    DETACHED --> MANAGED: entityManager.merge(user)
    
    MANAGED --> REMOVED: entityManager.remove(user)
    REMOVED --> TRANSIENT: Sau khi Commit transaction (Xóa khỏi DB)
    
    MANAGED --> MANAGED: Tự động Dirty Checking (UPDATE khi sửa thuộc tính)
    
    REMOVED --> [*]
    TRANSIENT --> [*]`
    }
  },

  'spring-093': {
    diagram: {
      type: 'pipeline',
      title: 'Luồng Xác Thực Username/Password Trong Spring Security Architecture',
      caption: 'Chuỗi Filter, AuthenticationManager, Provider và lưu trữ SecurityContextHolder',
      stages: [
        { name: '1. UsernamePasswordAuthenticationFilter', description: 'Trích xuất username/password từ HTTP request và bọc thành UsernamePasswordAuthenticationToken (Chưa xác thực)', duration: 'Filter 1' },
        { name: '2. ProviderManager (AuthenticationManager)', description: 'Duyệt danh sách các AuthenticationProvider hỗ trợ token này (mặc định DaoAuthenticationProvider)', duration: 'Manager' },
        { name: '3. UserDetailsService & PasswordEncoder', description: 'Gọi `loadUserByUsername()` từ DB và dùng BCryptPasswordEncoder so sánh mã băm mật khẩu', duration: 'Provider' },
        { name: '4. SecurityContextHolder', description: 'Tạo Authentication Token thành công và lưu vào `SecurityContextHolder.getContext().setAuthentication()`', duration: 'Storage' }
      ]
    }
  },

  'state-018': {
    diagram: {
      type: 'mermaid',
      title: 'Vòng Đời Trạng Thái Của createAsyncThunk Trong Redux Toolkit',
      caption: 'Tự động phát sinh 3 action types: pending, fulfilled và rejected ứng với chu kỳ Promise',
      code: `flowchart LR
    Dispatch["dispatch(fetchUserById(123))"] --> Pending["1. fetchUserById.pending<br>(Set loading = true)"]
    
    Pending --> APIPromise{"Thực thi hàm Async Payload Creator"}
    
    APIPromise -->|"Promise Resolve (Thành công)"| Fulfilled["2. fetchUserById.fulfilled<br>(Lưu data vào state, loading = false)"]
    
    APIPromise -->|"Promise Reject (Lỗi mạng / 500)"| Rejected["3. fetchUserById.rejected<br>(Lưu error message, loading = false)"]`
    }
  },

  'vue-018': {
    diagram: {
      type: 'pipeline',
      title: 'Vòng Đời Component Trong Vue 3 Composition API',
      caption: 'Sự thay thế của setup() cho beforeCreate/created và các lifecycle hooks tương ứng',
      stages: [
        { name: '1. setup() / `<script setup>`', description: 'Chạy trước mọi Options API hooks, nơi khởi tạo Reactivity (ref, reactive, computed)', duration: 'Khởi tạo' },
        { name: '2. onBeforeMount & onMounted', description: 'Kích hoạt ngay khi Component được render lần đầu vào DOM (thích hợp gọi API, gắn DOM listener)', duration: 'Mounting' },
        { name: '3. onBeforeUpdate & onUpdated', description: 'Kích hoạt khi reactive state thay đổi và DOM ảo tiến hành tái cấu trúc', duration: 'Updating' },
        { name: '4. onBeforeUnmount & onUnmounted', description: 'Dọn dẹp tài nguyên, hủy Interval timer, đóng WebSocket để tránh rò rỉ bộ nhớ', duration: 'Unmounting' }
      ]
    }
  }
};

// Execute updates
console.log('🚀 Running Batch 5B Enrichment...');
updateBank('flutter-bank.json', fltUpdates);
updateBank('frontend-core-bank.json', feUpdates);
updateBank('javascript-typescript.json', { 'int-11': feUpdates['int-11'] });
updateBank('ios-bank.json', iosUpdates);
updateBank('nestjs-bank.json', { 'nestjs-059': backendDevUpdates['nestjs-059'] });
updateBank('nodejs-bank.json', {
  'nodejs-051': backendDevUpdates['nodejs-051'],
  'nodejs-058': backendDevUpdates['nodejs-058'],
  'nodejs-075': backendDevUpdates['nodejs-075'],
  'nodejs-083': backendDevUpdates['nodejs-083']
});
updateBank('python-bank.json', { 'python-032': backendDevUpdates['python-032'] });
updateBank('qa-testing-bank.json', { 'qa-008': finalUpdates['qa-008'] });
updateBank('react-bank.json', {
  'react-036': finalUpdates['react-036'],
  'react-045': finalUpdates['react-045'],
  'react-094': finalUpdates['react-094']
});
updateBank('react-native-bank.json', { 'rn-004': finalUpdates['rn-004'] });
updateBank('rust-bank.json', {
  'rust-010': finalUpdates['rust-010'],
  'rust-018': finalUpdates['rust-018']
});
updateBank('spring-bank.json', {
  'spring-077': finalUpdates['spring-077'],
  'spring-093': finalUpdates['spring-093']
});
updateBank('state-management-bank.json', { 'state-018': finalUpdates['state-018'] });
updateBank('vue-bank.json', { 'vue-018': finalUpdates['vue-018'] });
console.log('✅ Batch 5B completed successfully.');
