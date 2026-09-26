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
// 1. DATABASE ENRICHMENTS
// ==========================================
const dbUpdates = {
  'db-011': {
    diagram: {
      type: 'mermaid',
      title: 'Trực Quan Hóa Các Loại SQL JOIN Trong Quan Hệ Dữ Liệu',
      caption: 'Sự khác biệt về tập kết quả giữa INNER, LEFT OUTER, RIGHT OUTER và FULL OUTER JOIN',
      code: `flowchart TD
    subgraph InnerJoin ["INNER JOIN (Phần giao nhau)"]
        A1["Table A (Users)"] ---|"Khóa chính = Khóa ngoại"| B1["Table B (Orders)"]
        Res1["Chỉ lấy các dòng có mặt ở cả 2 bảng"]
    end

    subgraph LeftJoin ["LEFT JOIN (Lấy trọn bảng Trái)"]
        A2["Table A (Users)"] -->|"Lấy toàn bộ A"| Res2["Users không có order sẽ mang giá trị NULL ở cột B"]
        B2["Table B (Orders)"] -.-> Res2
    end

    subgraph FullJoin ["FULL OUTER JOIN (Hợp nhất toàn bộ)"]
        Res3["Lấy tất cả các dòng từ cả A và B\nĐiền NULL cho các trường không khớp"]
    end`
    }
  },

  'db-022': {
    diagram: {
      type: 'mermaid',
      title: 'Cấu Trúc Cây Chỉ Mục B+ Tree (Root -> Branch -> Leaf Pages)',
      caption: 'Tìm kiếm O(log N) cực nhanh nhờ các con trỏ trang và danh sách liên kết hai chiều ở tầng lá',
      code: `flowchart TD
    Root["Root Page (Chỉ mục cấp 1)\n[Keys: 20 | 50]"]
    
    Root --> Branch1["Branch Page 1\n[Keys: 5 | 12]"]
    Root --> Branch2["Branch Page 2\n[Keys: 28 | 40]"]
    Root --> Branch3["Branch Page 3\n[Keys: 65 | 80]"]

    Branch1 --> Leaf1["Leaf Page 1\n(Data Rows: 1..4)"]
    Branch1 --> Leaf2["Leaf Page 2\n(Data Rows: 5..11)"]
    
    Leaf1 <===>|"Doubly Linked List (Quét Range Scan O(1))"| Leaf2`
    },
    benchmark: {
      title: 'Đánh Đổi Kỹ Thuật: Chi Phí Thêm Index B+ Tree',
      caption: 'Index tăng tốc độ đọc dữ liệu nhưng làm suy giảm thông lượng ghi do Page Split',
      options: [
        {
          name: 'Truy Vấn Đọc Có Index Phù Hợp',
          badge: 'Đọc Cực Nhanh',
          isRecommended: true,
          metrics: [
            { label: 'Tốc độ tìm kiếm (Read Latency)', value: 99, displayValue: '< 1ms (Index Seek)', color: 'emerald' },
            { label: 'Số khối IO đọc đĩa', value: 95, displayValue: '3-4 Pages (O(log N))', color: 'emerald' },
            { label: 'Tốn RAM Buffer Pool', value: 70, displayValue: 'Cần cache index pages', color: 'blue' }
          ],
          pros: ['Tránh Table Full Scan hàng triệu dòng', 'Hỗ trợ sắp xếp ORDER BY và lọc WHERE cực nhanh'],
          cons: ['Chiếm dụng thêm dung lượng lưu trữ trên SSD']
        },
        {
          name: 'Chi Phí Ghi Khi Có Quá Nhiều Index (Over-indexing)',
          badge: 'Ghi Chậm',
          metrics: [
            { label: 'Tốc độ ghi (Write Latency)', value: 25, displayValue: 'Giảm 5-10 lần', color: 'rose' },
            { label: 'Hiện tượng Page Split', value: 85, displayValue: 'Thường xuyên xảy ra', color: 'rose' },
            { label: 'Áp lực ghi đĩa WAL', value: 90, displayValue: 'Gấp N lần số lượng index', color: 'rose' }
          ],
          pros: ['Không có ưu điểm cho thao tác INSERT/UPDATE'],
          cons: ['Mỗi lệnh INSERT buộc DB phải cập nhật đồng thời vào N cây B-Tree', 'Gây phân mảnh trang đĩa (Index Fragmentation)']
        }
      ]
    }
  },

  'db-023': {
    codeDiff: {
      title: 'Lỗi Bọc Hàm Khiến Mất Index (Non-SARGable) vs Câu Lệnh Chuẩn Senior',
      language: 'sql',
      antiPattern: {
        title: '❌ Anti-Pattern: Bọc hàm DATE() lên cột có Index (Dẫn đến Table Scan toàn bộ bảng)',
        code: `-- THẢM HỌA HIỆU NĂNG: Cột created_at có B-Tree index nhưng Database BỎ QUA INDEX!
-- Database buộc phải chạy hàm DATE() cho 50,000,000 dòng để so sánh!
SELECT id, user_id, total_amount 
FROM orders 
WHERE DATE(created_at) = '2026-09-26';`,
        explanation: 'Khi áp dụng hàm toán học hoặc chuyển đổi kiểu lên cột trong mệnh đề WHERE, trình tối ưu hóa truy vấn (Query Optimizer) không thể thực hiện Index Seek theo cây B-Tree mà buộc phải Full Table Scan toàn bộ hàng chục triệu bản ghi.'
      },
      seniorSolution: {
        title: '✅ Senior Solution: Sử dụng cú pháp SARGable với khoảng so sánh Range',
        code: `-- CHUẨN SENIOR (SARGable): Tận dụng 100% B-Tree Index Seek O(log N)
-- Trả kết quả dưới 2 mili-giây trên bảng 50,000,000 dòng
SELECT id, user_id, total_amount 
FROM orders 
WHERE created_at >= '2026-09-26 00:00:00' 
  AND created_at <  '2026-09-27 00:00:00';`,
        explanation: 'Giữ nguyên cột thuần túy ở vế trái và so sánh theo khoảng (Range Condition). Trình tối ưu hóa sẽ nhảy trực tiếp tới vị trí đầu ngày và quét tuần tự tới cuối ngày trên tầng lá của B+Tree chỉ trong vài mili-giây.'
      }
    }
  },

  'db-027': {
    benchmark: {
      title: 'Ma trận Bốn Cấp Độ Cô Lập Giao Dịch ACID (Isolation Levels)',
      caption: 'Đánh giá khả năng ngăn chặn các hiện tượng dị thường (Anomalies) và chi phí khóa',
      options: [
        {
          name: 'Read Committed (Mặc định PostgreSQL)',
          badge: 'Cân bằng nhất',
          isRecommended: true,
          metrics: [
            { label: 'Chống Đọc Rác (Dirty Read)', value: 100, displayValue: 'Ngăn chặn 100%', color: 'emerald' },
            { label: 'Chống Đọc Lại Sai (Non-Repeatable)', value: 0, displayValue: 'Vẫn có thể bị', color: 'rose' },
            { label: 'Thông lượng giao dịch (TPS)', value: 95, displayValue: 'Rất cao (Ít lock)', color: 'emerald' }
          ],
          pros: ['Không bao giờ đọc dữ liệu chưa commit của giao dịch khác', 'Hiệu năng cao, sử dụng cơ chế MVCC snapshot mượt mà'],
          cons: ['Trong cùng 1 transaction, gọi 2 lần SELECT cùng 1 dòng có thể thấy 2 kết quả khác nhau nếu có commit xen giữa']
        },
        {
          name: 'Serializable (Cấp độ cao nhất)',
          badge: 'Nghiêm ngặt tuyệt đối',
          metrics: [
            { label: 'Chống Mọi Hiện Tượng Dị Thường', value: 100, displayValue: 'An toàn tuyệt đối', color: 'emerald' },
            { label: 'Nguy cơ Serialization Failure (40001)', value: 85, displayValue: 'Cao (Phải retry)', color: 'rose' },
            { label: 'Thông lượng giao dịch (TPS)', value: 35, displayValue: 'Thấp (Dễ xung đột)', color: 'amber' }
          ],
          pros: ['Kết quả thực thi tương đương như khi chạy tuần tự từng giao dịch đơn lẻ', 'Loại bỏ hoàn toàn Phantom Read và Write Skew'],
          cons: ['Các giao dịch ghi đồng thời thường xuyên bị ném lỗi abort/conflict, ứng dụng bắt buộc phải viết mã retry']
        }
      ]
    }
  }
};

// ==========================================
// 2. REACT NATIVE ENRICHMENTS
// ==========================================
const rnUpdates = {
  'rn-015': {
    diagram: {
      type: 'mermaid',
      title: 'Kiến Trúc React Native: Bridge Cũ (JSON Queue) vs New Architecture (JSI)',
      caption: 'JSI cho phép JavaScript gọi trực tiếp C++ Native Host Object mà không cần mã hóa/giải mã chuỗi JSON',
      code: `flowchart TD
    subgraph OldBridge ["Kiến Trúc Cũ: The Bridge (Bất Đồng Bộ & Nghẽn Cổ Chai)"]
        JS1["JavaScript Thread"] -->|"Serialize sang JSON string"| Q1["Bridge Message Queue"]
        Q1 -->|"Chờ luân chuyển theo đợt"| Q2["Native Queue"]
        Q2 -->|"Deserialize JSON string"| Nat1["Native Thread (iOS/Android)"]
    end

    subgraph NewArch ["Kiến Trúc Mới: JavaScript Interface (JSI & Fabric)"]
        JS2["JavaScript Engine (Hermes)"] <===>|"Gọi hàm đồng bộ C++ trực tiếp (Direct C++ Host Objects)"| Nat2["Native Runtime (iOS/Android C++)"]
        Nat2 --> Yoga["Yoga Layout Engine"]
        Yoga --> View["Native Host Views (Fabric)"]
    end`
    },
    benchmark: {
      title: 'So sánh Hiệu Năng: Cầu Nối Cũ (Bridge) vs JSI Mới',
      caption: 'Đo lường độ trễ tương tác cử chỉ (Gestures) và tốc độ trao đổi dữ liệu',
      options: [
        {
          name: 'New Architecture (JSI + Fabric + TurboModules)',
          badge: 'Chuẩn 2026 Mặc Định',
          isRecommended: true,
          metrics: [
            { label: 'Độ trễ truyền dữ liệu (Overhead)', value: 99, displayValue: 'Gần như bằng 0 (Zero-copy)', color: 'emerald' },
            { label: 'Tương tác cuộn 120 FPS', value: 98, displayValue: 'Mượt mà không drop frame', color: 'emerald' },
            { label: 'Khởi động ứng dụng (Hermes Bytecode)', value: 90, displayValue: 'Nhanh hơn 50%', color: 'emerald' }
          ],
          pros: ['Gọi hàm Native đồng bộ trực tiếp trong 1 frame duy nhất', 'Hỗ trợ React 19 Concurrent Features và Suspense mượt mà'],
          cons: ['Yêu cầu thư viện bên thứ 3 phải viết hỗ trợ C++ Codegen']
        },
        {
          name: 'Legacy Bridge (JSON Serialization)',
          metrics: [
            { label: 'Độ trễ truyền dữ liệu', value: 40, displayValue: 'Nghẽn khi truyền data lớn', color: 'rose' },
            { label: 'Tương tác cuộn 120 FPS', value: 50, displayValue: 'Dễ bị giật trắng màn hình', color: 'amber' },
            { label: 'Khởi động ứng dụng', value: 60, displayValue: 'Tốn thời gian parse JS', color: 'amber' }
          ],
          pros: ['Tương thích với các thư viện cũ không duy trì'],
          cons: ['Hiện tượng "White Blank Screen" khi cuộn danh sách nhanh do JSON Bridge bị quá tải hàng đợi']
        }
      ]
    }
  },

  'rn-062': {
    diagram: {
      type: 'pipeline',
      title: 'Quy Trình Kết Xuất Fabric Renderer (New Architecture Rendering Pipeline)',
      caption: 'Ba pha xử lý giao diện tối ưu: Render (JS) -> Prerender/Layout (C++ Shadow Tree) -> Mount (Native Host Platform)',
      stages: [
        {
          name: '1. React Render Phase',
          tool: 'Hermes Engine',
          icon: 'Layers',
          description: 'React thực thi mã nguồn JSX và sinh ra cấu trúc React Element Tree trong môi trường JavaScript.',
          metric: 'JS Thread'
        },
        {
          name: '2. C++ Shadow Tree Cloning',
          tool: 'Fabric Core (C++)',
          icon: 'Cpu',
          description: 'Tạo cây Shadow Node bất biến (Immutable C++ Shadow Tree) đại diện cho giao diện thông qua JSI.',
          metric: 'Zero-Copy'
        },
        {
          name: '3. Yoga Layout Calculation',
          tool: 'Yoga Engine (Flexbox)',
          icon: 'Maximize',
          description: 'Tính toán chính xác kích thước và tọa độ cho từng phần tử giao diện bằng thuật toán Flexbox viết bằng C++.',
          metric: '< 2ms'
        },
        {
          name: '4. Native Mount Phase',
          tool: 'UIKit / Android Views',
          icon: 'Zap',
          description: 'Cập nhật trực tiếp lên các thành phần UIView (iOS) hoặc ViewGroup (Android) trên Main UI Thread.',
          metric: '60/120 FPS'
        }
      ]
    }
  }
};

// ==========================================
// 3. FLUTTER ENRICHMENTS
// ==========================================
const flutterUpdates = {
  'flt-015': {
    diagram: {
      type: 'mermaid',
      title: 'Kiến Trúc Tam Giác Ba Cây Trong Flutter (Three Trees Architecture)',
      caption: 'Widget Tree (Bất biến) -> Element Tree (Quản lý vòng đời & Trạng thái) -> RenderObject Tree (Vẽ & Tính toán kích thước)',
      code: `flowchart TD
    subgraph WT ["1. Widget Tree (Configuration - Immutable)"]
        W1["Container Widget (Rộng 100, Dài 100)"]
        W2["Text Widget ('Hello World')"]
        W1 --> W2
    end

    subgraph ET ["2. Element Tree (Lifecycle & Structure - Mutable)"]
        E1["ComponentElement / RenderObjectElement"]
        E2["StatelessElement"]
        E1 --> E2
    end

    subgraph RT ["3. RenderObject Tree (Layout & Paint - Heavyweight)"]
        R1["RenderBox (Tính toán tọa độ x, y, width, height)"]
        R2["RenderParagraph (Vẽ từng chữ cái lên màn hình qua Skia/Impeller)"]
        R1 --> R2
    end

    W1 -.->|"Instantiates & Configures"| E1
    E1 ===>|"Creates & Manages"| R1
    W2 -.->|"Instantiates & Configures"| E2
    E2 ===>|"Creates & Manages"| R2`
    }
  }
};

// ==========================================
// 4. AI & LLM ENRICHMENTS
// ==========================================
const aiUpdates = {
  'ai-010': {
    diagram: {
      type: 'pipeline',
      title: 'Kiến Trúc Pipeline RAG Doanh Nghiệp Hoàn Chỉnh (Retrieval-Augmented Generation)',
      caption: 'Từ thu nạp tài liệu (Ingestion), tạo vector, tìm kiếm lai (Hybrid Search), Re-ranking đến sinh câu trả lời',
      stages: [
        {
          name: '1. Thu Nạp & Phân Đoạn (Chunking)',
          tool: 'Semantic Chunking',
          icon: 'FileText',
          description: 'Tài liệu PDF/Doc được làm sạch và cắt nhỏ thành các đoạn văn bản (chunks) 300-500 tokens có ngữ cảnh gối đầu (overlap).',
          metric: 'Chunking'
        },
        {
          name: '2. Vector Embedding & Indexing',
          tool: 'Text-Embedding-3 / BGE',
          icon: 'Layers',
          description: 'Mô hình Embedding biến văn bản thành vector đa chiều và nạp vào Vector Database (Qdrant, Pinecone, Milvus).',
          metric: '1536 dims'
        },
        {
          name: '3. Tìm Kiếm Lai (Hybrid Search)',
          tool: 'Dense Vector + Sparse BM25',
          icon: 'Search',
          description: 'Kết hợp tìm kiếm ngữ nghĩa vector đa chiều với tìm kiếm từ khóa chính xác BM25 (Reciprocal Rank Fusion - RRF).',
          metric: '< 25ms'
        },
        {
          name: '4. Tái Xếp Hạng (Cross-Encoder Re-ranker)',
          tool: 'Cohere Rerank / BGE-Reranker',
          icon: 'Shield',
          description: 'Chấm điểm lại Top 20 tài liệu tìm được để chọn ra Top 3-5 đoạn văn bản thực sự trả lời đúng câu hỏi người dùng.',
          metric: 'Precision +40%'
        },
        {
          name: '5. LLM Sinh Câu Trả Lời (Generation)',
          tool: 'Claude 3.5 / GPT-4o',
          icon: 'Zap',
          description: 'Bơm tài liệu ngữ cảnh vào System Prompt để LLM trả lời kèm trích dẫn nguồn, chống hiện tượng Hallucination.',
          metric: 'Grounding 100%'
        }
      ]
    },
    benchmark: {
      title: 'So sánh Các Chiến Lược Tìm Kiếm Ngữ Cảnh Trong RAG',
      caption: 'Hiệu quả tìm đúng tài liệu (Retrieval Recall) và chi phí độ trễ xử lý',
      options: [
        {
          name: 'Hybrid Search + Cross-Encoder Re-ranking',
          badge: 'Chuẩn Enterprise RAG',
          isRecommended: true,
          metrics: [
            { label: 'Độ chính xác truy xuất (Recall@5)', value: 96, displayValue: '96% Tìm đúng', color: 'emerald' },
            { label: 'Khả năng tìm từ khóa chính xác (Mã SKU, Mã lỗi)', value: 95, displayValue: 'Rất xuất sắc', color: 'emerald' },
            { label: 'Độ trễ gia tăng (Latency)', value: 65, displayValue: '~120ms', color: 'amber' }
          ],
          pros: ['Không bị trượt các thuật ngữ chuyên ngành hay mã số định danh', 'Re-ranker lọc sạch các tài liệu gây nhiễu trước khi đưa vào LLM'],
          cons: ['Cần duy trì 2 loại chỉ mục (Vector và Inverted Index)', 'Re-ranker tiêu tốn thêm tài nguyên GPU inference']
        },
        {
          name: 'Pure Vector Search (Chỉ dùng Cosine Similarity)',
          metrics: [
            { label: 'Độ chính xác truy xuất (Recall@5)', value: 68, displayValue: '~68%', color: 'amber' },
            { label: 'Khả năng tìm từ khóa chính xác', value: 35, displayValue: 'Kém (Dễ ảo giác)', color: 'rose' },
            { label: 'Độ trễ gia tăng (Latency)', value: 95, displayValue: '< 15ms', color: 'emerald' }
          ],
          pros: ['Thiết lập đơn giản, chi phí hạ tầng thấp'],
          cons: ['Thường xuyên lấy nhầm tài liệu khi người dùng tìm kiếm theo tên riêng, số điện thoại, hoặc mã định danh kỹ thuật']
        }
      ]
    }
  },

  'ai-013': {
    diagram: {
      type: 'mermaid',
      title: 'Vòng Lặp Nhận Thức & Hành Động Của AI Agent (ReAct: Reason + Act Pattern)',
      caption: 'Agent tự suy luận trạng thái hiện tại, chọn công cụ thực thi, quan sát kết quả và lặp lại cho đến khi hoàn thành mục tiêu',
      code: `stateDiagram-v2
    [*] --> NhậnMụcTiêu : Người dùng gửi yêu cầu
    NhậnMụcTiêu --> SuyLuận : Phân tích và lập kế hoạch

    state SuyLuận {
        desc: Thought (Suy nghĩ: Cần gọi API nào hoặc đọc DB nào?)
    }

    SuyLuận --> HànhĐộng : Quyết định gọi Tool
    
    state HànhĐộng {
        desc: Action (Chạy SQL, Gọi Web Search, Đọc File)
    }

    HànhĐộng --> QuanSát : Nhận kết quả từ Tool

    state QuanSát {
        desc: Observation (Phân tích dữ liệu phản hồi)
    }

    QuanSát --> SuyLuận : Chưa đủ thông tin -> Tiếp tục suy luận bước tiếp
    QuanSát --> HoànThành : Đã có đủ câu trả lời chính xác
    HoànThành --> [*] : Trả kết quả cuối cùng cho người dùng`
    }
  },

  'ai-026': {
    diagram: {
      type: 'mermaid',
      title: 'Cơ Chế Self-Attention Trong Transformer (Query, Key, Value)',
      caption: 'Tính toán ma trận tương quan giữa các từ trong câu: Attention(Q, K, V) = softmax(QK^T / sqrt(d_k)) * V',
      code: `flowchart TD
    Input["Input Token Embeddings (X)"] --> Q["Query Matrix (Q = X * W_Q)\n'Tôi đang tìm kiếm điều gì?'"]
    Input --> K["Key Matrix (K = X * W_K)\n'Tôi chứa đựng thông tin gì?'"]
    Input --> V["Value Matrix (V = X * W_V)\n'Nội dung thông tin thực tế'"]

    Q & K --> Dot["Scaled Dot-Product (Q * K^T / sqrt(d_k))"]
    Dot --> Mask["Attention Masking (Tùy chọn cho Causal Decoder)"]
    Mask --> Softmax["Hàm Softmax (Chuẩn hóa thành phân phối trọng số chú ý 0 - 100%)"]
    Softmax & V --> MatMul["Nhân với Value Matrix (Weights * V)"]
    MatMul --> Output["Contextual Output Representation (Vector giàu ngữ cảnh)"]`
    }
  },

  'ai-106': {
    diagram: {
      type: 'mermaid',
      title: 'Kiến Trúc vLLM: PagedAttention Giải Quyết Phân Mảnh Bộ Nhớ KV Cache',
      caption: 'Mô phỏng cơ chế Virtual Memory Paging của Hệ điều hành để quản lý KV Cache không liên tục trên VRAM',
      code: `flowchart TD
    subgraph Logical ["Không Gian Logic Của Request (Các Tokens Liên Tục)"]
        Req["Request: 'Thời tiết Hà Nội hôm nay thế nào?'"]
        Req --> L0["Logical Block 0 (Tokens 0-3)"]
        Req --> L1["Logical Block 1 (Tokens 4-7)"]
        Req --> L2["Logical Block 2 (Tokens 8-11)"]
    end

    subgraph BlockTable ["Bảng Ánh Xạ Khối (Block Table của vLLM)"]
        L0 -->|"Map tới"| P3["Physical Block #3"]
        L1 -->|"Map tới"| P7["Physical Block #7"]
        L2 -->|"Map tới"| P1["Physical Block #1"]
    end

    subgraph PhysicalVRAM ["Bộ Nhớ Vật Lý VRAM GPU (Phân Bổ Tùy Ý, Không Cần Liên Tục)"]
        P1["Physical Block 1"]
        P3["Physical Block 3"]
        P7["Physical Block 7"]
    end`
    },
    benchmark: {
      title: 'So sánh Hiệu Năng Phục Vụ LLM: Native HuggingFace vs vLLM (PagedAttention)',
      caption: 'Đo lường thông lượng Serving và tỷ lệ lãng phí VRAM dưới tải đồng thời cao',
      options: [
        {
          name: 'vLLM với PagedAttention',
          badge: 'Chuẩn High Throughput Serving',
          isRecommended: true,
          metrics: [
            { label: 'Thông lượng xử lý (Tokens/giây)', value: 98, displayValue: 'Gấp 10-24 lần', color: 'emerald' },
            { label: 'Tỷ lệ lãng phí bộ nhớ VRAM', value: 96, displayValue: '< 4% Lãng phí', color: 'emerald' },
            { label: 'Hỗ trợ Continuous Batching', value: 100, displayValue: 'Native Batching', color: 'emerald' }
          ],
          pros: ['Loại bỏ hoàn toàn phân mảnh bộ nhớ KV Cache, cho phép chạy batch size lớn hơn 4-8 lần', 'Chia sẻ bộ nhớ tức thì cho kỹ thuật Parallel Sampling và Beam Search'],
          cons: ['Cần GPU hỗ trợ CUDA kiến trúc Ampere trở lên để đạt tốc độ tối đa']
        },
        {
          name: 'HuggingFace Transformers Native',
          metrics: [
            { label: 'Thông lượng xử lý (Tokens/giây)', value: 20, displayValue: 'Cơ bản', color: 'rose' },
            { label: 'Tỷ lệ lãng phí bộ nhớ VRAM', value: 30, displayValue: 'Lãng phí 60-80% VRAM', color: 'rose' },
            { label: 'Hỗ trợ Continuous Batching', value: 10, displayValue: 'Không có (Padding tĩnh)', color: 'rose' }
          ],
          pros: ['Dễ cài đặt thử nghiệm nhanh với thư viện chuẩn PyTorch'],
          cons: ['Phải cấp phát trước bộ nhớ liên tục cho độ dài tối đa max_seq_len, gây cạn kiệt VRAM (OOM) nhanh chóng']
        }
      ]
    }
  }
};

// Execute updates
updateBank('database-bank.json', dbUpdates);
updateBank('react-native-bank.json', rnUpdates);
updateBank('flutter-bank.json', flutterUpdates);
updateBank('ai-bank.json', aiUpdates);
console.log('✅ Batch 3 updates applied successfully!');
