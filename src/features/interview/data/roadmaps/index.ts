import type { TopicRoadmapSpec } from '../../types/roadmap';

export const TOPIC_ROADMAPS: Record<string, TopicRoadmapSpec> = {
  'system-design': {
    topicId: 'system-design',
    title: 'Thiết Kế Hệ Thống Phân Tán (System Design)',
    tagline: 'Lộ trình làm chủ kiến trúc quy mô lớn từ định lý nền tảng đến các hệ thống triệu người dùng Big Tech.',
    mindmapCode: `flowchart LR
    S1["📍 Trạm 1: Nguyên Lý Phân Tán\n- Định lý CAP (sys-001)\n- ACID vs BASE (sys-002)\n- Scale Up vs Scale Out (sys-003)"]
    S2["⚙️ Trạm 2: Hạ Tầng Mạng & Caching\n- Load Balancer L4/L7 (sys-004)\n- Rate Limiting Token Bucket (sys-029)\n- Consistent Hashing Ring (sys-046)"]
    S3["🗄️ Trạm 3: Lưu Trữ & Data Tier\n- Database Sharding (sys-027)\n- Replica Lag (sys-028)\n- CQRS & CDC Pipeline (sys-031, sys-088)"]
    S4["🔄 Trạm 4: Giao Dịch & Bền Vững\n- Circuit Breaker (sys-037)\n- Saga Orchestrator (sys-038)\n- Kafka vs RabbitMQ (sys-040)"]
    S5["🚀 Trạm 5: Thiết Kế Thực Chiến\n- URL Shortener (sys-089)\n- Real-time Chat (sys-074)\n- News Feed (sys-075)\n- Distributed Rate Limiter (sys-092)"]

    S1 ==> S2 ==> S3 ==> S4 ==> S5`,
    stages: [
      {
        id: 'stage-1-principles',
        stepNumber: 1,
        title: 'Trạm 1: Nguyên Lý Phân Tán & Trade-offs',
        shortGoal: 'Nắm vững định lý CAP, ACID vs BASE, giới hạn phần cứng và độ trễ p50/p95/p99.',
        visualAnchorQuestionId: 'sys-001',
        questionIds: ['sys-001', 'sys-002', 'sys-003', 'sys-060', 'sys-061', 'sys-064'],
      },
      {
        id: 'stage-2-networking',
        stepNumber: 2,
        title: 'Trạm 2: Hạ Tầng Định Tuyến & Caching',
        shortGoal: 'Làm chủ cân bằng tải L4 vs L7, giải thuật băm nhất quán và phòng chống nghẽn mạng.',
        visualAnchorQuestionId: 'sys-004',
        questionIds: ['sys-004', 'sys-026', 'sys-029', 'sys-046', 'sys-051', 'sys-066'],
      },
      {
        id: 'stage-3-datatier',
        stepNumber: 3,
        title: 'Trạm 3: Lưu Trữ Dữ Liệu & Sharding (Data Tier)',
        shortGoal: 'Giải quyết điểm nghẽn khó nhất: Phân vùng Sharding, Replication Lag và CDC Pipeline.',
        visualAnchorQuestionId: 'sys-027',
        questionIds: ['sys-027', 'sys-028', 'sys-031', 'sys-042', 'sys-085', 'sys-088'],
      },
      {
        id: 'stage-4-resilience',
        stepNumber: 4,
        title: 'Trạm 4: Giao Dịch Phân Tán & Bền Vững',
        shortGoal: 'Ngăn chặn sập hệ thống dây chuyền: Circuit Breaker, Saga Pattern và Message Queues.',
        visualAnchorQuestionId: 'sys-037',
        questionIds: ['sys-037', 'sys-038', 'sys-040', 'sys-047', 'sys-065', 'sys-080'],
      },
      {
        id: 'stage-5-realworld',
        stepNumber: 5,
        title: 'Trạm 5: Bài Toán Thiết Kế Thực Chiến Big Tech',
        shortGoal: 'Lắp ghép toàn bộ linh kiện giải quyết bài toán triệu người dùng: Bit.ly, Chat, Feed, Rate Limiter.',
        visualAnchorQuestionId: 'sys-089',
        questionIds: ['sys-089', 'sys-074', 'sys-075', 'sys-092', 'sys-094', 'sys-096'],
      },
    ],
  },

  react: {
    topicId: 'react',
    title: 'Lộ Trình Làm Chủ React & React 19',
    tagline: 'Từ bản chất Component JSX, Fiber Reconciliation đến React Server Components và Server Actions.',
    mindmapCode: `flowchart LR
    R1["📍 Trạm 1: Bản Chất Component\n- JSX Runtime (react-001)\n- Key Prop & Diffing (react-005)\n- Controlled Component (react-011)"]
    R2["⚙️ Trạm 2: Vòng Đời & Hook Lifecycle\n- useEffect vs useLayoutEffect (react-015)\n- Props vs State (react-013)\n- Virtual DOM Reconciliation"]
    R3["⚡ Trạm 3: Quản Lý Trạng Thái & Render\n- Context vs Redux vs Zustand\n- useMemo & useCallback bẫy thừa\n- Batching & Re-render Opt"]
    R4["🌐 Trạm 4: React 19 & Server Architecture\n- Server Actions & useActionState (r19-05)\n- useOptimistic (int-02)\n- use() Hook & Promise stream"]
    R5["🚨 Trạm 5: Bẫy Thực Chiến & Hiệu Năng\n- Memory Leak trong Closure\n- Hydration Mismatch\n- Virtualized List 100k items"]

    R1 ==> R2 ==> R3 ==> R4 ==> R5`,
    stages: [
      {
        id: 'react-stage-1-core',
        stepNumber: 1,
        title: 'Trạm 1: Bản Chất Component & JSX',
        shortGoal: 'Hiểu cặn kẽ bản chất JSX biên dịch, cơ chế props.children và vai trò sống còn của Key prop.',
        visualAnchorQuestionId: 'react-005',
        questionIds: ['react-001', 'react-002', 'react-004', 'react-005', 'react-010', 'react-011'],
      },
      {
        id: 'react-stage-2-lifecycle',
        stepNumber: 2,
        title: 'Trạm 2: Vòng Đời & Hook Mechanics',
        shortGoal: 'Chuyển đổi tư duy Lifecycle sang Hook Synchronization và hiểu cơ chế Fiber Reconciliation.',
        visualAnchorQuestionId: 'react-005',
        questionIds: ['react-013', 'react-014', 'react-015', 'react-006', 'react-007', 'react-012'],
      },
      {
        id: 'react-stage-3-state',
        stepNumber: 3,
        title: 'Trạm 3: Quản Lý Trạng Thái & Tối Ưu Render',
        shortGoal: 'Kiểm soát re-render thừa, phân biệt Server Cache và Client State, tránh bẫy useMemo.',
        questionIds: ['react-003', 'react-008', 'react-009', 'react-013', 'react-011'],
      },
      {
        id: 'react-stage-4-modern19',
        stepNumber: 4,
        title: 'Trạm 4: React 19 & Server Actions',
        shortGoal: 'Làm chủ các tính năng cách mạng: Server Actions, useActionState, useOptimistic và use() Hook.',
        visualAnchorQuestionId: 'r19-05',
        questionIds: ['r19-05', 'int-02', 'r19-03', 'r19-04', 'int-07'],
      },
      {
        id: 'react-stage-5-production',
        stepNumber: 5,
        title: 'Trạm 5: Bẫy Hiệu Năng Thực Chiến',
        shortGoal: 'Phát hiện và xử lý memory leak trong useEffect, hydration mismatch và cuộn danh sách lớn.',
        questionIds: ['react-005', 'react-014', 'react-015', 'react-011'],
      },
    ],
  },

  java: {
    topicId: 'java',
    title: 'Lộ Trình Chuyên Sâu Java Core & JVM Runtime',
    tagline: 'Từ nền tảng OOP, Stack vs Heap đến cơ chế Garbage Collection và Java 21 Virtual Threads.',
    mindmapCode: `flowchart LR
    J1["📍 Trạm 1: Nền Tảng OOP & Kiểu Dữ Liệu\n- == vs .equals() (java-002)\n- Immutable String & String Pool (java-006, 018)\n- Bốn tính chất OOP (java-010)"]
    J2["⚙️ Trạm 2: Kiến Trúc Bộ Nhớ JVM\n- Stack vs Heap (java-004)\n- Phân vùng Generational GC (java-056, 057)\n- Metaspace & OutOfMemoryError"]
    J3["⚡ Trạm 3: Đa Luồng & Đồng Thời\n- Thread Lifecycle (java-023)\n- volatile & Memory Barrier (java-052)\n- ThreadPoolExecutor & WorkQueue (java-092)"]
    J4["🚀 Trạm 4: Java 21 Modern Innovations\n- Virtual Threads Project Loom (java-062)\n- Carrier Threads M:N mapping\n- Sealed Classes & Pattern Matching"]
    J5["🚨 Trạm 5: Bẫy Hiệu Năng & Production Tuning\n- Nối chuỗi vòng lặp bão GC (java-087)\n- Memory Leak & Thread Starvation\n- pprof & JIT C2 Compiler (java-073)"]

    J1 ==> J2 ==> J3 ==> J4 ==> J5`,
    stages: [
      {
        id: 'java-stage-1-oop',
        stepNumber: 1,
        title: 'Trạm 1: Nền Tảng OOP & Bộ Nhớ Cơ Bản',
        shortGoal: 'Nắm vững tham chiếu, String Pool, tính bất biến và các đặc tính hướng đối tượng chuẩn mực.',
        visualAnchorQuestionId: 'java-004',
        questionIds: ['java-001', 'java-002', 'java-003', 'java-004', 'java-005', 'java-006'],
      },
      {
        id: 'java-stage-2-jvm',
        stepNumber: 2,
        title: 'Trạm 2: Kiến Trúc Bộ Nhớ JVM & Thu Gom Rác',
        shortGoal: 'Phân tách Young Gen (Eden, S0, S1) và Old Gen, cơ chế Stop-The-World và tránh OutOfMemoryError.',
        visualAnchorQuestionId: 'java-056',
        questionIds: ['java-004', 'java-018', 'java-055', 'java-056', 'java-057', 'java-058'],
      },
      {
        id: 'java-stage-3-concurrency',
        stepNumber: 3,
        title: 'Trạm 3: Đa Luồng & Bộ Nhớ Đồng Thời',
        shortGoal: 'Hiểu thấu đáo vòng đời Thread, từ khóa volatile (CPU cache coherence) và ThreadPoolExecutor.',
        visualAnchorQuestionId: 'java-023',
        questionIds: ['java-023', 'java-048', 'java-049', 'java-051', 'java-052', 'java-092'],
      },
      {
        id: 'java-stage-4-virtualthreads',
        stepNumber: 4,
        title: 'Trạm 4: Đột Phá Java 21 & Virtual Threads',
        shortGoal: 'Mô hình M:N Virtual Threads (Project Loom), Carrier Threads và giải phóng tắc nghẽn I/O.',
        visualAnchorQuestionId: 'java-062',
        questionIds: ['java-062', 'java-091', 'java-093', 'java-088', 'java-089'],
      },
      {
        id: 'java-stage-5-tuning',
        stepNumber: 5,
        title: 'Trạm 5: Bẫy Hiệu Năng Thực Chiến & Tuning',
        shortGoal: 'Tối ưu StringBuilder, chẩn đoán rò rỉ RAM và xử lý sự cố CPU 100% trên Production.',
        visualAnchorQuestionId: 'java-087',
        questionIds: ['java-087', 'java-059', 'java-060', 'java-073', 'java-082', 'java-094'],
      },
    ],
  },

  database: {
    topicId: 'database',
    title: 'Lộ Trình Cơ Sở Dữ Liệu: SQL, Indexing & High Concurrency',
    tagline: 'Làm chủ từ câu lệnh JOIN, chỉ mục B+Tree đến cấp độ cô lập ACID và kỹ thuật Sharding.',
    mindmapCode: `flowchart LR
    D1["📍 Trạm 1: Mô Hình Quan Hệ & SQL\n- Các loại JOIN (db-011)\n- GROUP BY & HAVING (db-006)\n- Primary & Foreign Keys (db-013)"]
    D2["⚙️ Trạm 2: Chỉ Mục B+ Tree & SARGable\n- Cây B+ Tree Index Seek (db-022)\n- Bẫy bọc hàm mất index (db-023)\n- Đánh giá Over-indexing"]
    D3["🔒 Trạm 3: Giao Dịch ACID & Khóa Đồng Thời\n- 4 Cấp độ cô lập (db-027)\n- Chống Lost Update & Deadlock (db-028)\n- Row lock vs Table lock (db-016)"]
    D4["🗄️ Trạm 4: Thiết Kế Mô Hình Thực Thể\n- Sơ đồ ERD thực tế (db-052)\n- Chuẩn hóa vs Phi chuẩn hóa\n- Lưu biến thể sản phẩm & giỏ hàng"]
    D5["🚀 Trạm 5: Mở Rộng Cơ Sở Dữ Liệu\n- Phân trang Cursor vs Offset\n- Read Replica & Replication Lag\n- Sharding & Write-Ahead Log (WAL)"]

    D1 ==> D2 ==> D3 ==> D4 ==> D5`,
    stages: [
      {
        id: 'db-stage-1-relational',
        stepNumber: 1,
        title: 'Trạm 1: Mô Hình Quan Hệ & SQL Cơ Bản',
        shortGoal: 'Hiểu thấu đáo INNER, LEFT, RIGHT, FULL JOIN, toán tử tập hợp và logic 3 giá trị của NULL.',
        visualAnchorQuestionId: 'db-011',
        questionIds: ['db-001', 'db-002', 'db-003', 'db-006', 'db-008', 'db-011'],
      },
      {
        id: 'db-stage-2-indexing',
        stepNumber: 2,
        title: 'Trạm 2: Chỉ Mục B+ Tree & Truy Vấn SARGable',
        shortGoal: 'Bản chất cây B+Tree, O(log N) Index Seek, bẫy bọc hàm DATE() và chi phí ghi đĩa khi đánh quá nhiều index.',
        visualAnchorQuestionId: 'db-022',
        questionIds: ['db-022', 'db-023', 'db-024', 'db-025', 'db-013', 'db-015'],
      },
      {
        id: 'db-stage-3-acid',
        stepNumber: 3,
        title: 'Trạm 3: Giao Dịch ACID & Khóa Đồng Thời',
        shortGoal: 'Bảo vệ giao dịch tài chính: 4 cấp độ cô lập (Read Committed, Serializable), Lost Update và Pessimistic/Optimistic lock.',
        visualAnchorQuestionId: 'db-027',
        questionIds: ['db-026', 'db-027', 'db-028', 'db-016', 'db-021'],
      },
      {
        id: 'db-stage-4-modeling',
        stepNumber: 4,
        title: 'Trạm 4: Thiết Kế Mô Hình Thực Thể ERD',
        shortGoal: 'Mô hình hóa quan hệ 1-1, 1-N, N-N, bảng nối và chống dư thừa dữ liệu trong sàn thương mại điện tử.',
        visualAnchorQuestionId: 'db-052',
        questionIds: ['db-052', 'db-014', 'db-029', 'db-030', 'db-017'],
      },
      {
        id: 'db-stage-5-scaling',
        stepNumber: 5,
        title: 'Trạm 5: Mở Rộng Dữ Liệu & Phân Vùng Lớn',
        shortGoal: 'Phân trang Cursor cho hàng chục triệu bản ghi, Read Replica Lag và cơ chế Write-Ahead Log (WAL).',
        questionIds: ['db-018', 'db-019', 'db-020', 'db-021', 'db-022'],
      },
    ],
  },

  ai: {
    topicId: 'ai',
    title: 'Lộ Trình Trí Tuệ Nhân Tạo & Kỹ Sư AI/LLM',
    tagline: 'Từ nền tảng Tokenization, Prompting đến Enterprise RAG, Transformer Attention và AI Agent.',
    mindmapCode: `flowchart LR
    A1["📍 Trạm 1: Nền Tảng LLM & Token\n- Cơ chế hoạt động LLM (ai-001)\n- Tokenization & BPE (ai-002)\n- Context Window & Sampling (ai-003, 004)"]
    A2["⚙️ Trạm 2: Prompting & Fine-Tuning\n- Few-shot vs Fine-tune (ai-006)\n- Prompt Injection Defense (ai-030)\n- LoRA & QLoRA Adaptation"]
    A3["🔍 Trạm 3: Enterprise RAG Architecture\n- RAG Pipeline 5 bước (ai-010)\n- Hybrid Search & BM25 (ai-035)\n- Cross-Encoder Re-ranking"]
    A4["🧠 Trạm 4: Transformer & Self-Attention\n- Query, Key, Value Matrices (ai-026)\n- Scaled Dot-Product Attention\n- Multi-Head Projection"]
    A5["🤖 Trạm 5: AI Agents & High-Throughput\n- Vòng lặp ReAct Loop (ai-013)\n- Tool Use & Function Calling\n- vLLM PagedAttention KV Cache (ai-106)"]

    A1 ==> A2 ==> A3 ==> A4 ==> A5`,
    stages: [
      {
        id: 'ai-stage-1-foundations',
        stepNumber: 1,
        title: 'Trạm 1: Nền Tảng LLM & Cơ Chế Tokenization',
        shortGoal: 'Hiểu bản chất Byte Pair Encoding (BPE), Context Window, Temperature và Top-p sampling.',
        questionIds: ['ai-001', 'ai-002', 'ai-003', 'ai-004', 'ai-005', 'ai-009'],
      },
      {
        id: 'ai-stage-2-prompting',
        stepNumber: 2,
        title: 'Trạm 2: Prompt Engineering & Kỹ Thuật Tinh Chỉnh',
        shortGoal: 'Làm chủ In-Context Learning (Few-shot), phòng chống Prompt Injection và kỹ thuật LoRA/Fine-tuning.',
        questionIds: ['ai-006', 'ai-007', 'ai-008', 'ai-014', 'ai-030', 'ai-047'],
      },
      {
        id: 'ai-stage-3-rag',
        stepNumber: 3,
        title: 'Trạm 3: Kiến Trúc Pipeline RAG Doanh Nghiệp',
        shortGoal: 'Xây dựng RAG chuẩn Enterprise: Semantic Chunking, Vector Embeddings, Hybrid Search và Cohere Re-ranking.',
        visualAnchorQuestionId: 'ai-010',
        questionIds: ['ai-010', 'ai-011', 'ai-012', 'ai-033', 'ai-034', 'ai-035'],
      },
      {
        id: 'ai-stage-4-transformer',
        stepNumber: 4,
        title: 'Trạm 4: Transformer & Cơ Chế Self-Attention',
        shortGoal: 'Đào sâu toán học: Ma trận Query, Key, Value, Scaled Dot-Product và Multi-Head Attention.',
        visualAnchorQuestionId: 'ai-026',
        questionIds: ['ai-025', 'ai-026', 'ai-052', 'ai-114'],
      },
      {
        id: 'ai-stage-5-agents',
        stepNumber: 5,
        title: 'Trạm 5: AI Agents & Phục Vụ Quy Mô Lớn',
        shortGoal: 'Vòng lặp ReAct (Thought ➔ Action ➔ Observation) và tối ưu VRAM bằng vLLM PagedAttention.',
        visualAnchorQuestionId: 'ai-013',
        questionIds: ['ai-013', 'ai-042', 'ai-043', 'ai-058', 'ai-106', 'ai-109'],
      },
    ],
  },
};

export function getTopicRoadmap(topicId: string): TopicRoadmapSpec | undefined {
  if (TOPIC_ROADMAPS[topicId]) return TOPIC_ROADMAPS[topicId];
  if (topicId === 'react-19') return TOPIC_ROADMAPS.react;
  if (topicId === 'frontend-system-design') return TOPIC_ROADMAPS['system-design'];
  return undefined;
}

export function hasTopicRoadmap(topicId: string): boolean {
  return Boolean(getTopicRoadmap(topicId));
}
