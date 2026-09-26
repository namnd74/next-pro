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
// 1. GOLANG & RUST & C++
// ==========================================
const goUpdates = {
  'go-033': {
    diagram: {
      type: 'mermaid',
      title: 'So Sánh Bộ Nhớ & Luồng Điều Phối: Goroutine vs OS Thread',
      caption: 'Goroutine chỉ tốn 2KB bộ nhớ khởi tạo và chuyển đổi ngữ cảnh trong User Space siêu tốc',
      code: `flowchart TD
    subgraph OSThread ["OS Thread (Quản lý bởi Hệ Điều Hành)"]
        OST1["Stack cố định: 1 - 2 MB"]
        OST1 --> KernelSwitch["Chuyển đổi ngữ cảnh (Context Switch) tốn ~1,000ns qua Kernel Mode"]
    end

    subgraph GoRoutine ["Goroutine (Quản lý bởi Go Runtime Scheduler)"]
        G1["Stack động linh hoạt: Khởi tạo chỉ 2 KB (Tự động co giãn)"]
        G1 --> UserSwitch["Chuyển đổi ngữ cảnh tốn ~10ns hoàn toàn trong User Space!"]
    end`
    },
    benchmark: {
      title: 'So Sánh Khả Năng Xử Lý Đồng Thời: Goroutines vs OS Threads',
      caption: 'Đo lường số lượng luồng tối đa trên cùng 4GB RAM và độ trễ chuyển đổi ngữ cảnh',
      options: [
        {
          name: 'Go Goroutines',
          badge: 'Siêu nhẹ & Tối ưu',
          isRecommended: true,
          metrics: [
            { label: 'Số lượng luồng tối đa', value: 99, displayValue: '> 1,000,000 Goroutines', color: 'emerald' },
            { label: 'Bộ nhớ tiêu hao mỗi luồng', value: 98, displayValue: '~2 KB', color: 'emerald' },
            { label: 'Độ trễ Context Switch', value: 98, displayValue: '~10 ns', color: 'emerald' }
          ],
          pros: ['Có thể chạy hàng triệu goroutines đồng thời mà không làm sập RAM máy chủ', 'Go Runtime tự động co giãn kích thước stack khi cần thiết'],
          cons: ['Cần lưu ý chống rò rỉ goroutine (goroutine leak) khi quên đóng channel']
        },
        {
          name: 'OS Kernel Threads (C/C++ pthreads)',
          badge: 'Nặng nề',
          metrics: [
            { label: 'Số lượng luồng tối đa', value: 30, displayValue: '~3,000 - 5,000 Threads', color: 'rose' },
            { label: 'Bộ nhớ tiêu hao mỗi luồng', value: 25, displayValue: '~1,024 KB', color: 'rose' },
            { label: 'Độ trễ Context Switch', value: 40, displayValue: '~1,000 ns', color: 'amber' }
          ],
          pros: ['Tận dụng 100% tài nguyên CPU đa nhân trực tiếp cho các phép toán ma trận nặng'],
          cons: ['Chiếm dụng quá nhiều RAM cho các luồng chỉ ngồi chờ mạng I/O']
        }
      ]
    }
  },

  'go-093': {
    diagram: {
      type: 'mermaid',
      title: 'Kiến Trúc Go GMP Scheduler (G-M-P Model & Work Stealing)',
      caption: 'G (Goroutine), M (Machine/OS Thread), P (Processor logical context với Local Run Queue và Work Stealing)',
      code: `flowchart TD
    subgraph GlobalQueue ["Global Run Queue (GRQ)"]
        GQ["Goroutines đang chờ cấp phát"]
    end

    subgraph LogicalP1 ["Processor P1 (GOMAXPROCS)"]
        LRQ1["Local Run Queue (Tối đa 256 G)"] --> M1["OS Thread M1 đang thực thi Goroutine G1"]
    end

    subgraph LogicalP2 ["Processor P2 (GOMAXPROCS)"]
        LRQ2["Local Run Queue"] --> M2["OS Thread M2 đang thực thi Goroutine G2"]
    end

    LogicalP1 -.->|"Work Stealing: Khi LRQ1 rỗng, P1 sẽ trộm 50% G từ LRQ2!"| LogicalP2
    LogicalP1 -.->|"Định kỳ kiểm tra 1/61 lần để tránh đói luồng"| GlobalQueue`
    }
  }
};

const rustUpdates = {
  'rust-003': {
    diagram: {
      type: 'mermaid',
      title: 'Ba Quy Tắc Vàng Của Quyền Sở Hữu (Ownership) Trong Rust',
      caption: 'Bảo toàn an toàn bộ nhớ tuyệt đối tại thời điểm biên dịch mà không cần Garbage Collector (Zero-Cost Abstraction)',
      code: `flowchart TD
    Rule1["1. Mỗi giá trị trong Rust chỉ có duy nhất MỘT biến sở hữu (Owner) tại 1 thời điểm"]
    Rule2["2. Khi quyền sở hữu được chuyển giao (Move), biến cũ bị vô hiệu hóa ngay lập tức"]
    Rule3["3. Khi Owner đi ra khỏi phạm vi khối lệnh (Out of scope), giá trị tự động được DROP giải phóng bộ nhớ!"]

    Rule1 --> Rule2 --> Rule3

    subgraph MoveExample ["Cơ Chế Move Semantics"]
        S1["let s1 = String::from('hello')"] -->|"Move quyền sở hữu"| S2["let s2 = s1"]
        S1 -.->|"s1 bị vô hiệu hóa hoàn toàn, gọi s1 sẽ báo lỗi biên dịch!"| Dead["Compile Error: value borrowed here after move"]
    end`
    }
  },

  'rust-004': {
    diagram: {
      type: 'mermaid',
      title: 'Quy Tắc Mượn Dữ Liệu (Borrowing) & Con Trỏ Tham Chiếu Trong Rust',
      caption: 'Nguyên lý Aliasing XOR Mutability: Được phép có nhiều &T đọc HOẶC chỉ duy nhất một &mut T ghi',
      code: `flowchart LR
    Target[("Data Target in Memory")]

    subgraph SafeRead ["Trường Hợp 1: Cho Phép Đọc Đồng Thời"]
        R1["let r1 = &data (Read-only)"] --> Target
        R2["let r2 = &data (Read-only)"] --> Target
        R3["let r3 = &data (Read-only)"] --> Target
    end

    subgraph SafeWrite ["Trường Hợp 2: Độc Quyền Ghi (Chống Data Race)"]
        W1["let w1 = &mut data (Exclusive Write)"] ===> Target
        Note["⚠️ Trong khi w1 tồn tại, KHÔNG AI KHÁC được phép đọc hay ghi vào data!"]
    end`
    }
  }
};

const cppUpdates = {
  'cpp-004': {
    diagram: {
      type: 'mermaid',
      title: 'Quản Lý Bộ Nhớ C++: Stack vs Heap & Cơ Chế RAII Smart Pointers',
      caption: 'RAII đảm bảo tài nguyên Heap được giải phóng tự động thông qua hàm hủy (Destructor) của Smart Pointer trên Stack',
      code: `flowchart TD
    subgraph StackMem ["Stack Memory (Vòng đời theo hàm)"]
        Ptr["std::unique_ptr<Resource> p (Đối tượng Stack)"]
    end

    subgraph HeapMem ["Heap Memory (Cấp phát động)"]
        Res["Resource Block (Mảng dữ liệu 100MB)"]
    end

    Ptr -->|"Quản lý con trỏ duy nhất"| Res

    Exit["Hàm kết thúc (Stack Unwinding)"] --> Destroy["p.~unique_ptr() tự động được gọi"]
    Destroy ==>|"Tự động giải phóng delete"| Free["Heap Memory được trả về hệ điều hành mà không sợ Memory Leak!"]`
    }
  }
};

// ==========================================
// 2. NESTJS, FASTAPI, PYTHON, DJANGO
// ==========================================
const nestjsUpdates = {
  'nestjs-008': {
    diagram: {
      type: 'pipeline',
      title: 'Quy Trình Xử Lý Request Hoàn Chỉnh Trong NestJS (Request Lifecycle Pipeline)',
      caption: 'Thứ tự ưu tiên nghiêm ngặt từ khi Request chạm vào Server tới khi Response được trả về',
      stages: [
        {
          name: '1. Global & Route Middleware',
          tool: 'Express / Fastify Middleware',
          icon: 'Layers',
          description: 'Xử lý tiền kỳ: ghi log request, phân tích header thô, kiểm tra CORS hoặc gắn correlation ID.',
          metric: 'Pre-routing'
        },
        {
          name: '2. Guards (Bảo Vệ Xác Thực & Phân Quyền)',
          tool: 'AuthGuard / RolesGuard',
          icon: 'Shield',
          description: 'Kiểm tra token JWT và quyền hạn @Roles(). Nếu canActivate() trả về false, chặn đứng ngay với lỗi 403 Forbidden.',
          metric: 'Auth Check'
        },
        {
          name: '3. Interceptors (Tiền Kỳ - Pre)',
          tool: 'LoggingInterceptor',
          icon: 'Cpu',
          description: 'Ghi nhận thời gian bắt đầu thực thi, biến đổi luồng dữ liệu trước khi vào Controller.',
          metric: 'Trace Start'
        },
        {
          name: '4. Pipes (Kiểm Tra & Ép Kiểu)',
          tool: 'ValidationPipe / ParseIntPipe',
          icon: 'CheckCircle',
          description: 'Kiểm tra dữ liệu Body/Query bằng class-validator (DTO). Báo lỗi 400 Bad Request ngay nếu sai kiểu dữ liệu.',
          metric: 'Zod/ClassValidator'
        },
        {
          name: '5. Controller & Service Handler',
          tool: 'Business Route Method',
          icon: 'Zap',
          description: 'Thực thi nghiệp vụ chính, truy vấn database và trả về dữ liệu thô.',
          metric: 'Core Business'
        },
        {
          name: '6. Interceptors (Hậu Kỳ - Post)',
          tool: 'TransformInterceptor',
          icon: 'RefreshCw',
          description: 'Bọc dữ liệu trả về theo chuẩn công ty: { success: true, data: result, timestamp: ... }.',
          metric: 'Format Response'
        },
        {
          name: '7. Exception Filters',
          tool: 'HttpExceptionFilter',
          icon: 'AlertTriangle',
          description: 'Bắt mọi ngoại lệ chưa được xử lý, chuyển thành mã lỗi HTTP JSON rõ ràng cho người dùng.',
          metric: 'Error Boundary'
        }
      ]
    }
  }
};

const fastapiUpdates = {
  'fastapi-003': {
    diagram: {
      type: 'mermaid',
      title: 'Kiến Trúc FastAPI: Luồng Xử Lý Bất Đồng Bộ ASGI & Pydantic Validation',
      caption: 'Uvicorn ASGI Server chuyển request cho Starlette định tuyến, Pydantic xác thực kiểu dữ liệu và tự động sinh OpenAPI Docs',
      code: `flowchart TD
    Client["Client HTTP Request (JSON Body)"] --> Uvicorn["Uvicorn (ASGI Server - Async Event Loop)"]
    Uvicorn --> Starlette["Starlette Routing Engine"]
    Starlette --> Pydantic["Pydantic v2 Core (Viết bằng Rust - Validate Dữ Liệu)"]

    Pydantic --> Check{"Hợp lệ với Pydantic Model?"}

    Check -->|"Không (Lỗi kiểu / thiếu trường)"| Err422["Trả về 422 Unprocessable Entity kèm chi tiết từng trường lỗi"]
    Check -->|"Hợp lệ"| Handler["Route async def handler() thực thi"]
    
    Handler --> DB["Async Database Query (SQLAlchemy Asyncpg)"]
    DB --> Serialize["Pydantic serialize output data sang JSON chuẩn"]
    Serialize --> ClientResponse["200 OK Response"]`
    }
  }
};

const pythonUpdates = {
  'python-030': {
    diagram: {
      type: 'mermaid',
      title: 'Cơ Chế Global Interpreter Lock (GIL) Trong CPython',
      caption: 'Tại một thời điểm chỉ duy nhất 1 Thread được thực thi mã bytecode Python, dù máy tính có 64 Cores CPU',
      code: `flowchart TD
    subgraph MultiThreads ["Nhiều Python Threads Chạy Đồng Thời"]
        T1["Thread 1"]
        T2["Thread 2"]
        T3["Thread 3"]
    end

    Lock{"Khóa GIL (Global Interpreter Lock)"}
    CPU["1 CPU Core Duy Nhất Thực Thi"]

    T1 -->|"Giữ GIL"| Lock --> CPU
    T2 -.->|"Bị chặn, phải chờ GIL"| Lock
    T3 -.->|"Bị chặn, phải chờ GIL"| Lock

    Explain["Giải pháp cho tác vụ nặng CPU: Dùng module 'multiprocessing' để sinh nhiều Process độc lập (mỗi process có 1 GIL riêng)!"]`
    },
    benchmark: {
      title: 'So Sánh Concurrency Trong Python: Threading vs Multiprocessing vs Asyncio',
      caption: 'Lựa chọn mô hình tối ưu theo tính chất công việc I/O-bound hay CPU-bound',
      options: [
        {
          name: 'Asyncio (Single-thread Event Loop)',
          badge: 'Chuẩn Web API (FastAPI)',
          isRecommended: true,
          metrics: [
            { label: 'Tối ưu tác vụ I/O (Database, HTTP)', value: 99, displayValue: 'Cực nhanh, chịu tải lớn', color: 'emerald' },
            { label: 'Bộ nhớ tiêu hao', value: 95, displayValue: 'Rất thấp (1 Process)', color: 'emerald' },
            { label: 'Tối ưu tác vụ nặng CPU', value: 10, displayValue: 'Gây block Event Loop!', color: 'rose' }
          ],
          pros: ['Không có chi phí Context Switch của OS', 'Phù hợp xử lý hàng chục nghìn kết nối WebSocket hoặc API I/O'],
          cons: ['Nếu vô tình chạy hàm tính toán CPU nặng đồng bộ, toàn bộ server sẽ bị đơ']
        },
        {
          name: 'Multiprocessing (Tách Process)',
          badge: 'Tác vụ nặng CPU & Data',
          metrics: [
            { label: 'Tối ưu tác vụ I/O', value: 60, displayValue: 'Tốn RAM không cần thiết', color: 'amber' },
            { label: 'Bộ nhớ tiêu hao', value: 35, displayValue: 'Mỗi process tốn 50-100MB', color: 'rose' },
            { label: 'Tối ưu tác vụ nặng CPU', value: 100, displayValue: 'Chạy 100% full đa nhân CPU', color: 'emerald' }
          ],
          pros: ['Vượt qua hoàn toàn rào cản GIL, tận dụng trọn vẹn 32/64 CPU Cores'],
          cons: ['Chi phí khởi tạo process cao và truyền dữ liệu qua IPC (Pipes/Queues) tốn kém serialization']
        }
      ]
    }
  }
};

const djangoUpdates = {
  'django-002': {
    diagram: {
      type: 'mermaid',
      title: 'Kiến Trúc Django MVT (Model - View - Template) & Middleware Chain',
      caption: 'So sánh với MVC truyền thống: View trong Django đóng vai trò Controller; Template đóng vai trò View',
      code: `flowchart TD
    Client["Client Request"] --> Mid1["Security & Session Middleware"]
    Mid1 --> URL["urls.py (URL Dispatcher)"]
    URL --> View["views.py (Django View - Xử lý logic và điều phối)"]

    View <===>|"ORM Query / Save"| Model["models.py (Django Model / ORM tương tác Database)"]
    View -->|"Truyền Context Data"| Template["templates/*.html (Django Template Engine render giao diện)"]
    
    Template --> Response["HTTP Response trả về Client"]`
    }
  }
};

// ==========================================
// 3. LARAVEL, PHP, RAILS, RUBY, GRAPHQL, SHELL, JS-ADVANCED, JS-TS
// ==========================================
const laravelUpdates = {
  'lar-008': {
    diagram: {
      type: 'mermaid',
      title: 'Cơ Chế Service Container & Dependency Injection Trong Laravel',
      caption: 'IoC Container tự động phân tích Reflection để nạp chính xác các phụ thuộc vào Controller',
      code: `flowchart TD
    Request["Incoming Request -> OrderController(@OrderRepository $repo)"] --> Container["Laravel Service Container (IoC)"]
    
    Container --> Inspect["ReflectionClass phân tích type-hint: OrderRepositoryInterface"]
    Inspect --> BindingCheck{"AppServiceProvider đã bind interface này chưa?"}

    BindingCheck -->|"Đã bind: app->bind(Interface, MySQLRepo)"| Resolve["Khởi tạo new MySQLOrderRepository()"]
    Resolve --> Inject["Tiêm (Inject) instance vào tham số hàm của Controller"]
    Inject --> Exec["Thực thi Controller Method thành công"]`
    }
  }
};

const phpUpdates = {
  'php-001': {
    diagram: {
      type: 'mermaid',
      title: 'Mô Hình Vận Hành PHP-FPM Master-Worker Kết Hợp Nginx Web Server',
      caption: 'Nginx nhận request và chuyển qua FastCGI Socket; PHP-FPM Master điều phối cụm Worker xử lý độc lập',
      code: `flowchart TD
    Client["Client Request"] --> Nginx["Nginx Web Server"]
    Nginx -->|"FastCGI Protocol (Unix Socket / TCP 9000)"| Master["PHP-FPM Master Process"]

    subgraph WorkerPool ["PHP-FPM Worker Pool (dynamic / ondemand)"]
        Master --> W1["Worker Process 1 (Thực thi script PHP)"]
        Master --> W2["Worker Process 2 (Thực thi script PHP)"]
        Master --> W3["Worker Process 3 (Đang rảnh rỗi)"]
    end

    W1 -->|"Sau khi hoàn tất, giải phóng toàn bộ bộ nhớ"| Resp["Trả HTML/JSON về Nginx"]`
    }
  }
};

const railsUpdates = {
  'rails-002': {
    diagram: {
      type: 'mermaid',
      title: 'Kiến Trúc Ruby on Rails: Luồng MVC & Rack Middleware Stack',
      caption: 'Request đi qua chuỗi Rack Middleware, Router định tuyến tới Controller, Model tương tác qua ActiveRecord',
      code: `flowchart TD
    Client["Client HTTP Request"] --> Rack["Rack Middleware Stack"]
    Rack --> Router["config/routes.rb (ActionDispatch Router)"]
    Router --> Controller["app/controllers/posts_controller.rb"]
    
    Controller <===>|"ActiveRecord ORM"| Model["app/models/post.rb -> PostgreSQL"]
    Controller -->|"Biến instance @post"| View["app/views/posts/show.html.erb (ActionView)"]
    View --> HTML["Render HTML Response"]`
    }
  }
};

const rubyUpdates = {
  'rb-002': {
    diagram: {
      type: 'mermaid',
      title: 'Quản Lý Bộ Nhớ Trong Ruby: Symbol (:status) vs String ("status")',
      caption: 'String tạo đối tượng mới mỗi lần khai báo; Symbol là bất biến (Immutable) và lưu duy nhất trong Symbol Table',
      code: `flowchart TD
    subgraph Strings ["Ruby Strings ('hello')"]
        S1["'hello' (object_id: 7012)"]
        S2["'hello' (object_id: 7028)"]
        S3["'hello' (object_id: 7044)"]
        Note1["Mỗi lần viết 'hello' là cấp phát một ô nhớ mới trong Heap -> Gây rác bộ nhớ!"]
    end

    subgraph Symbols ["Ruby Symbols (:hello)"]
        Sym1[":hello (object_id: 10482)"]
        Sym2[":hello (object_id: 10482)"]
        Note2["Mọi vị trí gọi :hello đều trỏ về ĐÚNG 1 ĐỊA CHỈ DUY NHẤT trong Symbol Table!"]
    end`
    }
  }
};

const graphqlUpdates = {
  'gql-009': {
    diagram: {
      type: 'mermaid',
      title: 'Giải Quyết Vấn Đề N+1 Trong GraphQL Bằng Thư Viện DataLoader',
      caption: 'DataLoader gom nhóm (Batching) các ID riêng lẻ trong 1 Tick của Event Loop và gửi duy nhất 1 câu SQL WHERE id IN (...)',
      code: `flowchart TD
    subgraph NaiveN1 ["Không dùng DataLoader: Bị N+1 Queries"]
        Author1["Post 1 -> Query Author ID 10"]
        Author2["Post 2 -> Query Author ID 11"]
        AuthorN["Post N -> Query Author ID 12"]
        NoteN1["Bắn N câu SELECT riêng biệt làm sập Database!"]
    end

    subgraph WithDataLoader ["Có DataLoader: Batching & In-Memory Caching"]
        Collect["DataLoader gom tất cả Author IDs [10, 11, 12...] trong 1 Tick"]
        Collect --> SingleQuery["Chạy DUY NHẤT 1 câu SQL: SELECT * FROM authors WHERE id IN (10, 11, 12...)"]
        SingleQuery --> Dispatch["Phân phối kết quả về từng Resolver tương ứng"]
    end`
    }
  }
};

const shellUpdates = {
  'sh-007': {
    diagram: {
      type: 'mermaid',
      title: 'Cơ Chế Hoạt Động Của Linux Pipe (|) & Standard Streams',
      caption: 'Piping kết nối trực tiếp stdout của Process A vào stdin của Process B thông qua bộ nhớ đệm Kernel Ring Buffer',
      code: `flowchart LR
    subgraph Proc1 ["Process 1 (cat access.log)"]
        stdout1["stdout (File Descriptor 1)"]
    end

    subgraph KernelPipe ["Kernel Pipe Buffer (Bộ nhớ đệm Linux 64KB)"]
        PipeBuff["Luồng dữ liệu nhị phân truyền theo cơ chế FIFO"]
    end

    subgraph Proc2 ["Process 2 (grep '500')"]
        stdin2["stdin (File Descriptor 0)"]
    end

    stdout1 ===> PipeBuff ===> stdin2`
    }
  }
};

const jsAdvancedUpdates = {
  'js-hard-01': {
    diagram: {
      type: 'mermaid',
      title: 'Hiện Tượng Nghẽn Luồng Giao Diện Khi Microtask Bị Vòng Lặp Vô Hạn (Microtask Starvation)',
      caption: 'Đệ quy Promise hoặc queueMicrotask() liên tục sẽ giam cầm Event Loop, ngăn chặn hoàn toàn việc Render giao diện 60 FPS',
      code: `flowchart TD
    Stack["Call Stack"] --> P["Chạy microtask: Promise.resolve().then(...)"]
    P -->|"Lại tiếp tục sinh microtask mới trong callback"| P
    P -.->|"Event Loop không bao giờ thoát ra được!"| Trap["Khóa chặt trong Microtask Queue"]
    
    Trap -.-x|"BỊ CHẶN HOÀN TOÀN: Trình duyệt không thể chèn khung hình Render (16.6ms)"| Screen["Màn hình bị đơ cứng (Frozen UI / ANR)"]`
    }
  }
};

const jsTsUpdates = {
  'int-12': {
    diagram: {
      type: 'mermaid',
      title: 'So Sánh: type Alias vs interface Trong TypeScript Hiện Đại',
      caption: 'interface hỗ trợ Declaration Merging mở rộng; type hỗ trợ Unions, Tuples, Primitives và Mapped Types phức tạp',
      code: `flowchart TD
    Choice{"Khi nào chọn interface vs type?"}

    Choice -->|"Định nghĩa Object Schema cho Thư viện / SDK công khai"| InterfacePath["Chọn interface\n(Hỗ trợ Declaration Merging mở rộng bằng cách khai báo lại)"]
    Choice -->|"Xử lý Kiểu Phức Tạp, Biến Đổi Dữ Liệu"| TypePath["Chọn type\n(Hỗ trợ Union |, Intersection &, Primitive, Tuple, Conditional Types)"]`
    },
    benchmark: {
      title: 'So Sánh Kỹ Thuật: type vs interface',
      caption: 'Khả năng mở rộng, tính linh hoạt và tốc độ biên dịch của TypeScript Compiler',
      options: [
        {
          name: 'type Alias',
          badge: 'Đa năng & Hiện đại',
          isRecommended: true,
          metrics: [
            { label: 'Hỗ trợ Union & Mapped Type', value: 100, displayValue: 'Tuyệt đối', color: 'emerald' },
            { label: 'Tính an toàn không bị ghi đè ngầm', value: 98, displayValue: 'Không thể merge ngẫu nhiên', color: 'emerald' },
            { label: 'Tốc độ biên dịch', value: 92, displayValue: 'Rất nhanh', color: 'emerald' }
          ],
          pros: ['Định nghĩa được mọi kiểu dữ liệu từ Union, Tuple, Primitive đến Object', 'Không bị người khác vô tình merge thuộc tính ở file khác'],
          cons: ['Thông báo lỗi của TypeScript compiler đôi khi dài dòng hơn interface khi lồng sâu']
        },
        {
          name: 'interface',
          badge: 'OOP & Public SDK',
          metrics: [
            { label: 'Hỗ trợ Declaration Merging', value: 100, displayValue: 'Native Merging', color: 'emerald' },
            { label: 'Hỗ trợ Union & Mapped Type', value: 20, displayValue: 'Không hỗ trợ trực tiếp', color: 'rose' },
            { label: 'Tốc độ biên dịch', value: 95, displayValue: 'Tối ưu cho Object flat', color: 'emerald' }
          ],
          pros: ['Dễ dàng mở rộng cho các thư viện bên ngoài (Module Augmentation)', 'Thông báo lỗi ngắn gọn, thân thiện'],
          cons: ['Chỉ định nghĩa được cấu trúc Object hoặc Function, không thể tạo Union type: type Status = "A" | "B"']
        }
      ]
    }
  }
};

// Execute updates for all 15 Batch B banks
updateBank('go-bank.json', goUpdates);
updateBank('rust-bank.json', rustUpdates);
updateBank('cpp-bank.json', cppUpdates);
updateBank('nestjs-bank.json', nestjsUpdates);
updateBank('fastapi-bank.json', fastapiUpdates);
updateBank('python-bank.json', pythonUpdates);
updateBank('django-bank.json', djangoUpdates);
updateBank('laravel-bank.json', laravelUpdates);
updateBank('php-bank.json', phpUpdates);
updateBank('rails-bank.json', railsUpdates);
updateBank('ruby-bank.json', rubyUpdates);
updateBank('graphql-bank.json', graphqlUpdates);
updateBank('shell-linux-bank.json', shellUpdates);
updateBank('javascript-advanced.json', jsAdvancedUpdates);
updateBank('javascript-typescript.json', jsTsUpdates);

console.log('✅ Batch B (15 Backend Banks) completed successfully!');
