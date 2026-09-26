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
// 1. ANDROID UPDATES
// ==========================================
const androidUpdates = {
  'andr-006': {
    diagram: {
      type: 'mermaid',
      title: 'Máy Trạng Thái Vòng Đời Android Activity (Activity Lifecycle State Machine)',
      caption: 'Sự chuyển dịch giữa các trạng thái khi người dùng mở app, chuyển app, nhận cuộc gọi và xoay màn hình',
      code: `stateDiagram-v2
    [*] --> onCreate : Khởi tạo Activity / SetContentView
    onCreate --> onStart : Activity hiển thị lên màn hình (Chưa tương tác được)
    onStart --> onResume : Activity sẵn sàng tương tác với người dùng (In Focus)

    onResume --> onPause : Bị che khuất một phần (Hộp thoại Dialog / Cuộc gọi đến)
    onPause --> onResume : Người dùng quay lại ứng dụng
    onPause --> onStop : Bị che khuất hoàn toàn (Chuyển sang app khác)

    onStop --> onRestart : Người dùng mở lại app từ danh sách đa nhiệm
    onRestart --> onStart

    onStop --> onDestroy : Activity bị hủy vĩnh viễn (Bấm Back / finish() / Xoay màn hình)
    onDestroy --> [*]`
    }
  },

  'andr-011': {
    benchmark: {
      title: 'So Sánh: Jetpack Compose (Declarative) vs XML Layouts (Imperative)',
      caption: 'Đánh giá tốc độ phát triển, số dòng mã boilerplate và hiệu năng render cây giao diện',
      options: [
        {
          name: 'Jetpack Compose',
          badge: 'Chuẩn Android Hiện Đại',
          isRecommended: true,
          metrics: [
            { label: 'Tốc độ phát triển UI', value: 95, displayValue: 'Nhanh gấp 2 lần', color: 'emerald' },
            { label: 'Lượng mã nguồn Boilerplate', value: 90, displayValue: 'Giảm 60% code', color: 'emerald' },
            { label: 'Tối ưu Recomposition', value: 92, displayValue: 'Chỉ vẽ lại node đổi state', color: 'emerald' }
          ],
          pros: ['100% bằng Kotlin, không cần chuyển đổi qua lại giữa XML và Java/Kotlin', 'Tự động đồng bộ UI với State, loại bỏ hoàn toàn findViewById và ViewBinding'],
          cons: ['Cần hiểu sâu về Recomposition để tránh recompose thừa các hàm Composable']
        },
        {
          name: 'Traditional XML Layouts',
          badge: 'Legacy System',
          metrics: [
            { label: 'Tốc độ phát triển UI', value: 45, displayValue: 'Tốn thời gian nối ID', color: 'rose' },
            { label: 'Lượng mã nguồn Boilerplate', value: 30, displayValue: 'Quá nhiều file XML', color: 'rose' },
            { label: 'Tối ưu Recomposition', value: 60, displayValue: 'Thủ công qua View hierarchy', color: 'amber' }
          ],
          pros: ['Công cụ kéo thả Layout Preview trong Android Studio rất hoàn thiện cho người mới'],
          cons: ['Dễ bị lỗi NullPointerException khi ánh xạ sai ID giữa XML và Kotlin', 'Cây View quá sâu gây lag giật khi đo đạc kích thước (onMeasure/onLayout pass)']
        }
      ]
    }
  },

  'andr-037': {
    diagram: {
      type: 'mermaid',
      title: 'Kiến Trúc Android Hiện Đại: MVVM + Unidirectional Data Flow (UDF)',
      caption: 'Sự kiện người dùng đi lên (User Events Up), trạng thái luồng dữ liệu bất biến đi xuống (State Down)',
      code: `flowchart TD
    subgraph UI ["UI Layer (Jetpack Compose / Activity)"]
        View["Compose Screen (Thuần túy hiển thị)"]
    end

    subgraph VM ["ViewModel Layer"]
        ViewModel["MainViewModel (Sống sót qua Configuration Change / Xoay màn hình)"]
        State["uiState: StateFlow<UiState>"]
    end

    subgraph Data ["Data Layer (Repository Pattern)"]
        Repo["UserRepository (Single Source of Truth)"]
        Local[("Room Database (Offline-first Cache)")]
        Remote["Retrofit REST API (Network Data)"]
    end

    View -->|"1. User Events (Click, Input) gửi lên"| ViewModel
    ViewModel -->|"2. Gọi hàm nghiệp vụ"| Repo
    Repo <===>|"3. Đọc/Ghi dữ liệu offline"| Local
    Repo <===>|"4. Fetch dữ liệu mới từ Server"| Remote
    Repo -->|"5. Trả về Flow dữ liệu"| ViewModel
    ViewModel -->|"6. State Down: Cập nhật StateFlow"| State
    State ===>|"7. Render lại giao diện tự động"| View`
    }
  }
};

// ==========================================
// 2. IOS UPDATES
// ==========================================
const iosUpdates = {
  'ios-007': {
    diagram: {
      type: 'mermaid',
      title: 'Cơ Chế Quản Lý Bộ Nhớ ARC (Automatic Reference Counting) & Retain Cycle',
      caption: 'Giải quyết vòng lặp tham chiếu giữ chéo (Strong Retain Cycle) bằng [weak self] để tránh rò rỉ RAM',
      code: `flowchart LR
    subgraph RetainCycle ["VÒNG LẶP RÒ RỈ BỘ NHỚ (Strong Retain Cycle)"]
        VC1["ViewController (RC = 1)"] ===>|"strong reference (Sở hữu closure)"| Closure1["Closure Task"]
        Closure1 ===>|"strong reference (Capture con trỏ self)"| VC1
        Note1["⚠️ Hậu quả: Khi đóng màn hình, Reference Count của cả 2 vẫn = 1 -> RÒ RỈ RAM VĨNH VIỄN!"]
    end

    subgraph SafeARC ["GIẢI PHÁP AN TOÀN VỚI [weak self]"]
        VC2["ViewController (RC = 1)"] ===>|"strong reference"| Closure2["Closure Task"]
        Closure2 -.->|"[weak self] reference (Không tăng RC)"| VC2
        Note2["✅ Khi đóng màn hình: VC2 giải phóng -> Closure2 giải phóng sạch sẽ 100%!"]
    end`
    }
  },

  'ios-011': {
    diagram: {
      type: 'mermaid',
      title: 'Vòng Đời UIViewController Trong UIKit (View Lifecycle Flow)',
      caption: 'Thứ tự gọi các callback từ khi khởi tạo view, hiển thị lên màn hình đến khi biến mất hoàn toàn',
      code: `flowchart TD
    Init["Khởi tạo: init(coder:) / init(nibName:)"] --> Load["loadView() (Tạo View hierarchy gốc nếu không dùng Storyboard)"]
    Load --> DidLoad["viewDidLoad() (Chỉ gọi DUY NHẤT 1 lần: Setup UI ban đầu, bind dữ liệu)"]
    
    DidLoad --> WillApp["viewWillAppear() (Gọi mỗi khi màn hình sắp xuất hiện: Refresh dữ liệu, đăng ký notifications)"]
    WillApp --> DidApp["viewDidAppear() (Màn hình đã hiển thị trọn vẹn: Kích hoạt animations, bắt đầu quay video)"]

    DidApp --> WillDis["viewWillDisappear() (Sắp bị che/rời đi: Ẩn bàn phím, tạm dừng tác vụ nặng)"]
    WillDis --> DidDis["viewDidDisappear() (Đã biến mất hoàn toàn: Dừng nghe sensors, hủy observers)"]

    DidDis --> Deinit["deinit (Bộ nhớ ViewController được ARC giải phóng khi pop khỏi NavigationStack)"]`
    }
  },

  'ios-012': {
    benchmark: {
      title: 'So Sánh Nền Tảng UI iOS: SwiftUI (Declarative) vs UIKit (Imperative)',
      caption: 'Đánh giá tính hiện đại, độ ổn định và khả năng tương thích ngược của ứng dụng iOS',
      options: [
        {
          name: 'SwiftUI (iOS 16+)',
          badge: 'Tương Lai Của Apple',
          isRecommended: true,
          metrics: [
            { label: 'Tốc độ viết code giao diện', value: 95, displayValue: 'Nhanh hơn 50%', color: 'emerald' },
            { label: 'Loại bỏ lỗi State Mismatch', value: 100, displayValue: 'Single Source of Truth', color: 'emerald' },
            { label: 'Độ ổn định cho ứng dụng phức tạp', value: 80, displayValue: 'Rất tốt từ iOS 16+', color: 'blue' }
          ],
          pros: ['Cú pháp Declarative thanh thoát, hỗ trợ xem trước Preview canvas trực tiếp', 'Đa nền tảng chia sẻ code cho iOS, iPadOS, macOS, watchOS, visionOS'],
          cons: ['Yêu cầu phiên bản iOS tối thiểu cao (thường từ iOS 16 trở lên để chạy trơn tru)']
        },
        {
          name: 'UIKit (AutoLayout & ViewControllers)',
          badge: 'Nền Tảng Cổ Điển',
          metrics: [
            { label: 'Tốc độ viết code giao diện', value: 50, displayValue: 'Tốn công AutoLayout', color: 'amber' },
            { label: 'Khả năng tùy biến low-level', value: 100, displayValue: 'Không giới hạn', color: 'emerald' },
            { label: 'Độ ổn định', value: 99, displayValue: '> 15 năm hoàn thiện', color: 'emerald' }
          ],
          pros: ['Kiểm soát tuyệt đối từng pixel và vòng đời view, dễ dàng nhúng vào bất kỳ thư viện C/Objective-C nào'],
          cons: ['Mã nguồn AutoLayout dài dòng, quản lý delegate và datasource cồng kềnh']
        }
      ]
    }
  }
};

// Execute updates for Batch C
updateBank('android-bank.json', androidUpdates);
updateBank('ios-bank.json', iosUpdates);

console.log('✅ Batch C (2 Mobile Native Banks) completed successfully!');
