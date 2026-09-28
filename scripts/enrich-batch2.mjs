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
// 1. JAVA ENRICHMENTS
// ==========================================
const javaUpdates = {
  'java-004': {
    diagram: {
      type: 'mermaid',
      title: 'Kiến Trúc Bộ Nhớ JVM: Phân Tách Stack Memory vs Heap Memory',
      caption: 'Stack quản lý luồng thực thi hàm và biến nguyên thủy cục bộ; Heap quản lý vòng đời của tất cả các Object',
      code: `flowchart TD
    subgraph ThreadStack ["Thread Stack (Lưu trữ cục bộ cho từng Thread)"]
        Frame1["Stack Frame (main method)\n- int x = 10\n- User userRef (Tham chiếu con trỏ)"]
        Frame2["Stack Frame (calculate method)\n- double tempRate = 1.5"]
    end

    subgraph JVMHeap ["JVM Heap Memory (Bộ nhớ dùng chung toàn ứng dụng)"]
        Obj["User Object Instance\n- id: 101\n- name: 'Nguyen Van A'"]
        Str["String Object in Heap"]
    end

    Frame1 -->|"userRef lưu địa chỉ bộ nhớ Heap"| Obj`
    },
    benchmark: {
      title: 'So sánh Kỹ thuật: Stack Memory vs Heap Memory trong JVM',
      caption: 'Đánh giá tốc độ truy xuất, cơ chế giải phóng bộ nhớ và nguy cơ tràn bộ nhớ',
      options: [
        {
          name: 'Stack Memory',
          badge: 'Siêu tốc độ',
          isRecommended: true,
          metrics: [
            { label: 'Tốc độ cấp phát & giải phóng', value: 100, displayValue: 'O(1) LIFO', color: 'emerald' },
            { label: 'Nguy cơ Thread-Safe', value: 100, displayValue: '100% An toàn (Cô lập)', color: 'emerald' },
            { label: 'Dung lượng lưu trữ', value: 25, displayValue: 'Thường chỉ 1MB/thread', color: 'amber' }
          ],
          pros: ['Giải phóng tức thời khi kết thúc hàm mà không cần GC can thiệp', 'Không bao giờ xảy ra xung đột đồng thời (Thread-Safe tuyệt đối)'],
          cons: ['Dễ bị StackOverflowError nếu đệ quy vô hạn hoặc lồng hàm quá sâu']
        },
        {
          name: 'Heap Memory',
          badge: 'Dung lượng lớn',
          metrics: [
            { label: 'Tốc độ cấp phát & giải phóng', value: 60, displayValue: 'Phụ thuộc GC Sweep', color: 'amber' },
            { label: 'Nguy cơ Thread-Safe', value: 40, displayValue: 'Cần Synchronized/Lock', color: 'rose' },
            { label: 'Dung lượng lưu trữ', value: 95, displayValue: 'Hàng chục GB theo cấu hình -Xmx', color: 'emerald' }
          ],
          pros: ['Chia sẻ dữ liệu xuyên suốt giữa các luồng trong cùng ứng dụng', 'Lưu trữ đối tượng kích thước lớn và vòng đời dài'],
          cons: ['GC Stop-The-World gây giật lag độ trễ P99 nếu cấp phát object rác quá nhiều']
        }
      ]
    }
  },

  'java-023': {
    diagram: {
      type: 'mermaid',
      title: 'Vòng Đời Trạng Thái Của Java Thread (Thread Lifecycle State Machine)',
      caption: 'Sự chuyển dịch giữa các trạng thái NEW, RUNNABLE, WAITING, BLOCKED và TERMINATED',
      code: `stateDiagram-v2
    [*] --> NEW : new Thread()
    NEW --> RUNNABLE : thread.start()
    
    RUNNABLE --> BLOCKED : Chờ lấy synchronized lock
    BLOCKED --> RUNNABLE : Giành được lock thành công

    RUNNABLE --> WAITING : Object.wait(), Thread.join()
    WAITING --> RUNNABLE : Object.notify(), notifyAll()

    RUNNABLE --> TIMED_WAITING : Thread.sleep(ms), wait(ms)
    TIMED_WAITING --> RUNNABLE : Hết thời gian timeout

    RUNNABLE --> TERMINATED : Kết thúc thực thi run() method
    TERMINATED --> [*]`
    }
  },

  'java-056': {
    diagram: {
      type: 'mermaid',
      title: 'Cơ Chế Phân Vùng Thế Hệ JVM Garbage Collection (Generational GC)',
      caption: 'Quy luật Weak Generational Hypothesis: 95% object chết trẻ trong Eden Space',
      code: `flowchart LR
    subgraph YoungGen ["Young Generation (Đối tượng mới tạo)"]
        Eden["Eden Space (Cấp phát mới)"] -->|"Minor GC sống sót"| S0["Survivor From (S0)"]
        S0 <-->|"Copy qua lại"| S1["Survivor To (S1)"]
    end

    subgraph OldGen ["Old Generation (Tenured - Đối tượng sống thọ)"]
        S1 -->|"Vượt qua Tenuring Threshold (Thường là 15 lần GC)"| Old["Tenured Old Space (Major / Full GC)"]
    end

    subgraph NonHeap ["Non-Heap Space"]
        Meta["Metaspace (Class Metadata, Native Memory)"]
    end`
    }
  },

  'java-062': {
    diagram: {
      type: 'mermaid',
      title: 'Kiến Trúc Java 21 Virtual Threads (Project Loom) vs Platform Threads',
      caption: 'Mô hình M:N phân tách hàng triệu Virtual Threads nhẹ trên một lượng nhỏ OS Carrier Threads',
      code: `flowchart TD
    subgraph OSThreads ["OS Platform Threads (Tốn 1MB RAM/thread)"]
        CT1["Carrier Thread 1 (OS Kernel)"]
        CT2["Carrier Thread 2 (OS Kernel)"]
    end

    subgraph LoomThreads ["Java Virtual Threads (Chỉ tốn ~1KB RAM/thread)"]
        VT1["Virtual Thread 1 (I/O Blocked)"] -.->|"Unmount khi chờ I/O"| CT1
        VT2["Virtual Thread 2 (Running)"] ===>|"Mount thực thi"| CT1
        VT3["Virtual Thread 3 (Running)"] ===>|"Mount thực thi"| CT2
        VTN["...Hàng triệu Virtual Threads khác"]
    end`
    },
    benchmark: {
      title: 'So sánh: Platform Threads vs Virtual Threads (Java 21)',
      caption: 'Khả năng chịu tải đồng thời (High Concurrency) với các tác vụ I/O Network',
      options: [
        {
          name: 'Java 21 Virtual Threads (Loom)',
          badge: 'Đột phá hiệu năng I/O',
          isRecommended: true,
          metrics: [
            { label: 'Số lượng Thread tối đa', value: 99, displayValue: '> 1,000,000 threads', color: 'emerald' },
            { label: 'Bộ nhớ tiêu hao mỗi Thread', value: 98, displayValue: '~1 KB (Heap allocated)', color: 'emerald' },
            { label: 'Chi phí Context Switching', value: 95, displayValue: 'Cực thấp (User space)', color: 'emerald' }
          ],
          pros: ['Viết code đồng bộ tuần tự (imperative) nhưng đạt hiệu năng bất đồng bộ của Reactive/WebFlux', 'Giải phóng hoàn toàn hiện tượng Thread Starvation'],
          cons: ['Không tăng tốc độ cho tác vụ CPU-intensive (chỉ tối ưu cho tác vụ I/O bound)', 'Cần tránh synchronized block cũ để không làm ghim (pin) Carrier Thread']
        },
        {
          name: 'Platform Threads (Truyền thống)',
          metrics: [
            { label: 'Số lượng Thread tối đa', value: 35, displayValue: '~5,000 threads (Chạm ngưỡng OOM)', color: 'rose' },
            { label: 'Bộ nhớ tiêu hao mỗi Thread', value: 30, displayValue: '~1,024 KB (Stack cố định)', color: 'rose' },
            { label: 'Chi phí Context Switching', value: 40, displayValue: 'Tốn kém (Kernel mode switch)', color: 'amber' }
          ],
          pros: ['Phù hợp tuyệt đối cho tác vụ tính toán nặng CPU (Machine Learning, mã hóa dữ liệu)'],
          cons: ['Khi thread bị block chờ Database I/O, 1MB bộ nhớ OS bị giam cầm lãng phí']
        }
      ]
    }
  },

  'java-087': {
    codeDiff: {
      title: 'Nối Chuỗi Bằng Toán Tử + Trong Vòng Lặp vs StringBuilder',
      language: 'java',
      antiPattern: {
        title: '❌ Anti-Pattern: Nối chuỗi bằng dấu + trong vòng lặp lớn (Gây GC Pressure khủng khiếp)',
        code: `// TẠO RA N OBJECT RÁC TRONG HEAP: O(N^2) Time Complexity!
public String buildReport(List<String> records) {
    String result = "";
    for (String record : records) {
        // Mỗi lần cộng chuỗi, JVM phải cấp phát 1 StringBuilder mới và copy toàn bộ mảng char cũ!
        result += record + ", ";
    }
    return result;
}`,
        explanation: 'Do String trong Java là Immutable, mỗi phép `+=` tạo ra một instance String mới và copy dữ liệu cũ. Với 100,000 phần tử, nó tạo ra 100,000 object rác làm GC chạy quá tải dẫn đến CPU 100%.'
      },
      seniorSolution: {
        title: '✅ Senior Solution: Dùng StringBuilder với Capacity khởi tạo trước',
        code: `// O(N) TỐI ƯU BỘ NHỚ: Cấp phát đúng một buffer có thể mở rộng
public String buildReport(List<String> records) {
    // Dự đoán kích thước trước để tránh realloc mảng char nội bộ
    StringBuilder sb = new StringBuilder(records.size() * 32);
    for (String record : records) {
        sb.append(record).append(", ");
    }
    return sb.toString();
}`,
        explanation: 'StringBuilder duy trì một mảng char nội bộ có thể mở rộng (mutable buffer), chỉ cấp phát đúng 1 lần và biến độ phức tạp từ O(N^2) về O(N), giảm 99% áp lực lên Garbage Collector.'
      }
    }
  }
};

// ==========================================
// 2. SPRING BOOT ENRICHMENTS
// ==========================================
const springUpdates = {
  'spring-031': {
    diagram: {
      type: 'pipeline',
      title: 'Vòng Đời Hoàn Chỉnh Của Một Spring Bean (Bean Lifecycle Pipeline)',
      caption: 'Quá trình khởi tạo, tiêm phụ thuộc, xử lý hậu kỳ (BPP) và giải phóng tài nguyên trong Spring IoC Container',
      stages: [
        {
          name: '1. Khởi Tạo Instance',
          tool: 'JVM Reflection',
          icon: 'Layers',
          description: 'Spring Container gọi constructor mặc định hoặc factory method để nạp instance vào bộ nhớ.',
          metric: 'Step 1'
        },
        {
          name: '2. Tiêm Phụ Thuộc (DI)',
          tool: '@Autowired / setter',
          icon: 'Zap',
          description: 'Cung cấp các dependency và gán các thuộc tính cấu hình từ ApplicationContext.',
          metric: 'Step 2'
        },
        {
          name: '3. Aware Interfaces',
          tool: 'BeanNameAware, BeanFactoryAware',
          icon: 'Radio',
          description: 'Spring gọi các phương thức để thông báo cho bean biết tên của nó và tham chiếu tới Container.',
          metric: 'Step 3'
        },
        {
          name: '4. BeanPostProcessor (Before)',
          tool: 'postProcessBeforeInitialization',
          icon: 'Shield',
          description: 'Thực thi các logic can thiệp trước khi khởi tạo (ví dụ xử lý AOP annotation proxy).',
          metric: 'Step 4'
        },
        {
          name: '5. Khởi Tạo Nghiệp Vụ',
          tool: '@PostConstruct / InitializingBean',
          icon: 'CheckCircle',
          description: 'Thực thi hàm khởi tạo dữ liệu, kết nối tài nguyên hoặc pre-warm cache.',
          metric: 'Step 5'
        },
        {
          name: '6. Bean Sẵn Sàng Phục Vụ & Hủy',
          tool: 'In Service -> @PreDestroy',
          icon: 'RefreshCw',
          description: 'Bean phục vụ request. Khi container shutdown, gọi @PreDestroy để đóng database connection.',
          metric: 'Step 6'
        }
      ]
    }
  },

  'spring-040': {
    diagram: {
      type: 'mermaid',
      title: 'Luồng Xử Lý Của Spring Security Filter Chain (Security Architecture)',
      caption: 'Mọi request HTTP đều phải đi qua chuỗi Filter bảo mật nghiêm ngặt trước khi chạm tới Controller',
      code: `flowchart TD
    Client["Client HTTP Request"] --> F1["SecurityContextPersistenceFilter\n(Nạp SecurityContext từ Session/Redis)"]
    F1 --> F2["CorsFilter & CsrfFilter\n(Kiểm tra Origin & CSRF Token)"]
    F2 --> F3["JwtAuthenticationFilter / UsernamePasswordAuthFilter\n(Giải mã Token, nạp Authentication vào Context)"]
    F3 --> F4["ExceptionTranslationFilter\n(Bắt lỗi 401 Unauthorized / 403 Forbidden)"]
    F4 --> F5["AuthorizationFilter / FilterSecurityInterceptor\n(Kiểm tra quyền hạn hasRole / @PreAuthorize)"]
    F5 --> Dispatcher["DispatcherServlet -> RestController"]`
    }
  },

  'spring-065': {
    diagram: {
      type: 'mermaid',
      title: 'Lỗi Self-Invocation Trong Spring AOP và @Transactional',
      caption: 'Gọi phương thức nội bộ trong cùng một Class làm bỏ qua Dynamic Proxy, khiến @Transactional mất tác dụng',
      code: `flowchart TD
    Client["Client gọi API"] --> Proxy["CGLIB / JDK Dynamic Proxy"]
    Proxy -->|"Can thiệp: Bắt đầu DB Transaction"| Target["UserService Instance (Target)"]
    
    subgraph InsideClass ["Bên Trong Cùng Class UserService"]
        Target -->|"Gọi nội bộ: this.doInternalTransaction()"| Internal["Method doInternalTransaction()\n[@Transactional]"]
    end

    Note["⚠️ THẢM HỌA: this.call() đi thẳng trong instance nội bộ,\nhoàn toàn BỎ QUA Proxy -> Không có Transaction nào được mở!"]`
    },
    codeDiff: {
      title: 'Anti-pattern Self-Invocation vs Giải Pháp Chuẩn Kiến Trúc Spring',
      language: 'java',
      antiPattern: {
        title: '❌ Anti-Pattern: Gọi method @Transactional trong cùng một class bằng this',
        code: `@Service
public class OrderService {
    public void processOrder(Order order) {
        // LỖI: Gọi nội bộ làm mất tác dụng của Transaction Proxy!
        this.saveOrderWithTx(order);
    }

    @Transactional
    public void saveOrderWithTx(Order order) {
        orderRepo.save(order);
        paymentRepo.charge(order); // Nếu dòng này ném lỗi, save() KHÔNG HỀ BỊ ROLLBACK!
    }
}`,
        explanation: 'Spring AOP sử dụng Proxy Pattern. Khi gọi `this.saveOrderWithTx()`, con trỏ `this` trỏ thẳng tới target instance thay vì proxy wrapper, do đó TransactionInterceptor không bao giờ được kích hoạt.'
      },
      seniorSolution: {
        title: '✅ Senior Solution: Tách Class nghiệp vụ hoặc Inject chính proxy qua Bean con',
        code: `@Service
@RequiredArgsConstructor
public class OrderService {
    private final OrderTxService orderTxService; // Tách hẳn sang service chuyên trách Tx

    public void processOrder(Order order) {
        // GỌI QUA PROXY ĐƯỢC INJECT: Transaction hoạt động chính xác 100%
        orderTxService.saveOrderWithTx(order);
    }
}

@Service
public class OrderTxService {
    @Transactional(rollbackFor = Exception.class)
    public void saveOrderWithTx(Order order) {
        orderRepo.save(order);
        paymentRepo.charge(order);
    }
}`,
        explanation: 'Bằng cách phân tách trách nhiệm sang một Spring Bean độc lập (`OrderTxService`), Spring Container sẽ wrap bean này bằng CGLIB Proxy và kích hoạt cơ chế Rollback trơn tru khi có Exception.'
      }
    }
  }
};

// ==========================================
// 3. C# & .NET ENRICHMENTS
// ==========================================
const csharpUpdates = {
  'csnet-005': {
    diagram: {
      type: 'mermaid',
      title: 'Kiến Trúc .NET CLR Garbage Collector: Các Thế Hệ Vùng Nhớ (Generations)',
      caption: 'Phân vùng Gen 0, Gen 1, Gen 2, Large Object Heap (LOH > 85KB) và Pinned Object Heap (POH)',
      code: `flowchart LR
    subgraph SOH ["Small Object Heap (SOH - Đối tượng < 85,000 bytes)"]
        Gen0["Gen 0 (Cấp phát mới)\nGC chạy cực nhanh (< 1ms)"] -->|"Sống sót"| Gen1["Gen 1 (Vùng đệm phân tích)"]
        Gen1 -->|"Sống sót lâu"| Gen2["Gen 2 (Dài hạn: Singletons, Caches)"]
    end

    subgraph SpecialHeaps ["Specialized Heaps"]
        LOH["Large Object Heap (LOH)\nĐối tượng >= 85KB (Mảng byte, chuỗi lớn)\nKhông bị compact mặc định (Dễ phân mảnh)"]
        POH["Pinned Object Heap (POH)\nĐối tượng cố định địa chỉ cho Native P/Invoke"]
    end`
    }
  },

  'csnet-038': {
    codeDiff: {
      title: 'Nguy Hiểm Của Blocking .Result/.Wait() vs Async/Await Không Gây Deadlock',
      language: 'csharp',
      antiPattern: {
        title: '❌ Anti-Pattern: Chặn luồng bằng .Result hoặc .Wait() (Gây Deadlock và Thread Starvation)',
        code: `// NGUY HIỂM CHẾT NGƯỜI: Chặn đồng bộ trên Task bất đồng bộ
[HttpGet("user/{id}")]
public IActionResult GetUser(int id)
{
    // LỖI: .Result chặn main thread trong khi Task.Run chờ thread pool
    // Trên ASP.NET cũ hoặc môi trường có SynchronizationContext, code này DEADLOCK ngay lập tức!
    var user = _userService.GetUserAsync(id).Result;
    return Ok(user);
}`,
        explanation: 'Calling `.Result` or `.Wait()` blocks the caller thread synchronously. When the async operation completes and attempts to resume on the captured `SynchronizationContext`, that context is occupied by the blocked thread, creating a classic circular deadlock.'
      },
      seniorSolution: {
        title: '✅ Senior Solution: Sử dụng async/await xuyên suốt (Async All The Way Down)',
        code: `// CHUẨN SENIOR: Không block thread, giải phóng tài nguyên cho hệ thống
[HttpGet("user/{id}")]
public async Task<IActionResult> GetUserAsync(int id, CancellationToken ct)
{
    // Thread hiện tại được trả về ThreadPool để phục vụ request khác trong khi chờ I/O Database!
    var user = await _userService.GetUserAsync(id, ct);
    return Ok(user);
}`,
        explanation: 'Async/await tạo ra một State Machine ngầm (IAsyncStateMachine). Khi gặp từ khóa await, thread được trả về ThreadPool để phục vụ khách hàng khác, tăng thông lượng hệ thống lên gấp 10 lần.'
      }
    }
  },

  'csnet-052': {
    benchmark: {
      title: 'Ma trận So sánh: ASP.NET Core Dependency Injection Lifetimes',
      caption: 'Lựa chọn Transient, Scoped, hoặc Singleton để tránh rủi ro Captive Dependency',
      options: [
        {
          name: 'Scoped Lifetime (AddScoped)',
          badge: 'Chuẩn Web Request & EF Core',
          isRecommended: true,
          metrics: [
            { label: 'Tính an toàn theo Request', value: 100, displayValue: '1 Instance / 1 HTTP Request', color: 'emerald' },
            { label: 'Tương thích Entity Framework Core', value: 100, displayValue: 'Hoàn hảo', color: 'emerald' },
            { label: 'Nguy cơ rò rỉ dữ liệu giữa người dùng', value: 0, displayValue: 'Zero Cross-user Leak', color: 'emerald' }
          ],
          pros: ['Dữ liệu trong DbContext được cô lập hoàn toàn giữa các HTTP request độc lập', 'Tự động gọi Dispose() khi kết thúc request'],
          cons: ['Dễ gặp lỗi Captive Dependency nếu vô tình inject Scoped service vào một Singleton service']
        },
        {
          name: 'Singleton Lifetime (AddSingleton)',
          badge: 'Dữ liệu toàn cục & Caches',
          metrics: [
            { label: 'Tiết kiệm tài nguyên cấp phát', value: 99, displayValue: 'Chỉ 1 instance duy nhất', color: 'emerald' },
            { label: 'Yêu cầu Thread-Safe', value: 100, displayValue: 'Bắt buộc tuyệt đối', color: 'rose' },
            { label: 'Tương thích Entity Framework Core', value: 10, displayValue: 'Không được dùng!', color: 'rose' }
          ],
          pros: ['Cực kỳ tiết kiệm bộ nhớ, thích hợp cho In-memory Cache, Metric Collectors, Socket Manager'],
          cons: ['Phải đảm bảo Thread-Safe 100% vì hàng trăm thread sẽ truy cập vào cùng lúc']
        }
      ]
    }
  }
};

// ==========================================
// 4. NODEJS & FRONTEND CORE ENRICHMENTS
// ==========================================
const nodejsUpdates = {
  'nodejs-022': {
    diagram: {
      type: 'mermaid',
      title: 'Sơ Đồ Vòng Tròn 6 Pha Của Node.js Libuv Event Loop',
      caption: 'Thứ tự ưu tiên xử lý các hàng đợi sự kiện và sự xen ngang của Microtask Queue (nextTick & Promise)',
      code: `flowchart TD
    Start(["Khởi động Script (Sync Code)"]) --> LoopInit{"Event Loop Bắt Đầu"}

    subgraph Phases ["6 Pha Tuần Tự Của Libuv"]
        P1["1. Timers\n(setTimeout, setInterval callbacks)"]
        P2["2. Pending Callbacks\n(I/O callbacks bị hoãn)"]
        P3["3. Idle, Prepare\n(Hệ thống nội bộ Libuv)"]
        P4["4. Poll\n(Chờ và đọc sự kiện I/O mới: Socket, File)"]
        P5["5. Check\n(setImmediate callbacks)"]
        P6["6. Close Callbacks\n(socket.on('close'))"]
        
        P1 --> P2 --> P3 --> P4 --> P5 --> P6 --> P1
    end

    subgraph Microtasks ["Hàng Đợi Vi Tác Vụ (Ưu Tiên Số 1 - Chạy Giữa Mọi Pha)"]
        M1["process.nextTick Queue (Chạy trước nhất)"]
        M2["Promise Microtask Queue (.then, async/await)"]
    end`
    }
  },

  'nodejs-073': {
    benchmark: {
      title: 'So sánh Đa Nhiệm Node.js: Cluster vs Worker Threads vs Child Process',
      caption: 'Giải pháp xử lý tác vụ nặng CPU mà không làm treo Event Loop chính',
      options: [
        {
          name: 'Worker Threads (module worker_threads)',
          badge: 'Tác vụ nặng CPU trong cùng Process',
          isRecommended: true,
          metrics: [
            { label: 'Tốc độ chia sẻ bộ nhớ (SharedArrayBuffer)', value: 98, displayValue: 'Zero-Copy Cực Nhanh', color: 'emerald' },
            { label: 'Bộ nhớ tiêu hao', value: 85, displayValue: '~20-30MB / Worker', color: 'emerald' },
            { label: 'Độ cô lập an toàn', value: 65, displayValue: 'Chung Process OS', color: 'amber' }
          ],
          pros: ['Hỗ trợ chia sẻ bộ nhớ thực sự qua SharedArrayBuffer mà không tốn công serialization', 'Rất phù hợp cho xử lý ảnh, tính toán mã hóa, phân tích cú pháp JSON nặng'],
          cons: ['Nếu một worker bị crash do lỗi native C++ segmentation fault, toàn bộ process mẹ có thể chết theo']
        },
        {
          name: 'Cluster Mode (module cluster / PM2)',
          badge: 'Tận dụng đa nhân CPU cho Web API',
          metrics: [
            { label: 'Tốc độ chia sẻ bộ nhớ', value: 30, displayValue: 'Phải qua IPC Serialization', color: 'rose' },
            { label: 'Bộ nhớ tiêu hao', value: 50, displayValue: '~100MB / Instance', color: 'amber' },
            { label: 'Độ cô lập an toàn', value: 100, displayValue: 'Độc lập tuyệt đối', color: 'emerald' }
          ],
          pros: ['Mỗi worker là 1 OS process độc lập hoàn toàn, 1 con chết không ảnh hưởng con khác', 'Chia sẻ cùng 1 port HTTP (ví dụ port 3000) qua master load balancer'],
          cons: ['Không thể chia sẻ bộ nhớ chung trực tiếp, mỗi instance tốn một bản sao V8 Heap riêng']
        }
      ]
    }
  }
};

const frontendUpdates = {
  'fecore-050': {
    diagram: {
      type: 'pipeline',
      title: 'Quy Trình Hiển Thị Của Trình Duyệt (Critical Rendering Path)',
      caption: 'Từ mã nguồn HTML thô đến từng điểm ảnh hiển thị trên màn hình với sự hỗ trợ của GPU Composite',
      stages: [
        {
          name: '1. Parse DOM & CSSOM',
          tool: 'HTML / CSS Parser',
          icon: 'FileText',
          description: 'Trình duyệt chuyển đổi thẻ HTML thành DOM Tree và CSS Rules thành CSSOM Tree độc lập.',
          metric: '< 20ms'
        },
        {
          name: '2. Render Tree Generation',
          tool: 'Layout Engine',
          icon: 'Cpu',
          description: 'Kết hợp DOM và CSSOM. Bỏ qua các phần tử display: none, chỉ giữ lại các node thực sự hiển thị.',
          metric: 'Tree Merge'
        },
        {
          name: '3. Layout (Reflow)',
          tool: 'Geometry Calculation',
          icon: 'Maximize',
          description: 'Tính toán chính xác tọa độ (X, Y) và kích thước (Width, Height) của từng khối trên viewport.',
          metric: 'Box Model'
        },
        {
          name: '4. Paint (Rasterization)',
          tool: 'Color & Texture Paint',
          icon: 'Feather',
          description: 'Điền màu sắc, đường viền, bóng đổ và hình ảnh thành các bitmap điểm ảnh.',
          metric: 'Raster Ops'
        },
        {
          name: '5. Composite Layers',
          tool: 'GPU Compositor',
          icon: 'Zap',
          description: 'Tổng hợp các layer độc lập (transform, opacity) lên GPU để hiển thị với tốc độ 60-120 FPS mượt mà.',
          metric: '< 16.6ms'
        }
      ]
    }
  },

  'fecore-062': {
    diagram: {
      type: 'mermaid',
      title: 'Kiến Trúc React Fiber Reconciliation: Render Phase vs Commit Phase',
      caption: 'Render phase có thể tạm dừng (Interruptible) để ưu tiên tương tác người dùng; Commit phase thực thi DOM một lần đồng bộ',
      code: `flowchart TD
    subgraph RenderPhase ["1. Render / Reconciliation Phase (Có thể hoãn/ngắt - Pure, No Side-effects)"]
        Trigger["State Update (setState / props change)"] --> WorkLoop["Fiber Work Loop (Duyệt cây Fiber dạng LinkedList)"]
        WorkLoop --> Diff["Tính toán Diff: Gắn cờ Placement, Update, Deletion"]
        Diff --> YieldCheck{"Có tác vụ tương tác người dùng gấp không?"}
        YieldCheck -->|"Có (High Priority Input)"| Pause["Nhường main thread cho trình duyệt"]
        Pause --> WorkLoop
    end

    subgraph CommitPhase ["2. Commit Phase (Đồng bộ - Không thể ngắt)"]
        FinishWork["Kết thúc tính toán Diff"] --> DOMMutation["Thực thi cập nhật DOM thực tế (DOM Mutation)"]
        DOMMutation --> LayoutEff["Chạy useLayoutEffect"]
        LayoutEff --> Paint["Trình duyệt vẽ lên màn hình"]
        Paint --> PassEff["Chạy useEffect bất đồng bộ"]
    end

    YieldCheck -->|"Không có"| FinishWork`
    }
  }
};

// Execute updates
updateBank('java-bank.json', javaUpdates);
updateBank('spring-bank.json', springUpdates);
updateBank('csharp-bank.json', csharpUpdates);
updateBank('nodejs-bank.json', nodejsUpdates);
updateBank('frontend-core-bank.json', frontendUpdates);
console.log('✅ Batch 2 updates applied successfully!');
