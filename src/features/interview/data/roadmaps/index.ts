import type { TopicRoadmapSpec, RoadmapStageSpec } from '../../types/roadmap';
import type { InterviewQuestion } from '../../types';
import { DEFAULT_JSON_QUESTION_BANKS } from '../json-loader';
import { buildAutoTopicRoadmap, matchesCategory } from './auto-roadmap-builder';
import { TOPIC_METADATA } from './topic-metadata';

export const TOPIC_ROADMAPS: Record<string, TopicRoadmapSpec> = {
  'system-design': {
    topicId: 'system-design',
    title: TOPIC_METADATA['system-design'].title,
    tagline: TOPIC_METADATA['system-design'].tagline,
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
        title: TOPIC_METADATA['system-design'].stageTitles[0],
        shortGoal: TOPIC_METADATA['system-design'].stageGoals[0],
        visualAnchorQuestionId: 'sys-001',
        questionIds: ['sys-001', 'sys-002', 'sys-003', 'sys-060', 'sys-061', 'sys-064'],
      },
      {
        id: 'stage-2-networking',
        stepNumber: 2,
        title: TOPIC_METADATA['system-design'].stageTitles[1],
        shortGoal: TOPIC_METADATA['system-design'].stageGoals[1],
        visualAnchorQuestionId: 'sys-004',
        questionIds: ['sys-004', 'sys-026', 'sys-029', 'sys-046', 'sys-051', 'sys-066'],
      },
      {
        id: 'stage-3-datatier',
        stepNumber: 3,
        title: TOPIC_METADATA['system-design'].stageTitles[2],
        shortGoal: TOPIC_METADATA['system-design'].stageGoals[2],
        visualAnchorQuestionId: 'sys-027',
        questionIds: ['sys-027', 'sys-028', 'sys-031', 'sys-042', 'sys-085', 'sys-088'],
      },
      {
        id: 'stage-4-resilience',
        stepNumber: 4,
        title: TOPIC_METADATA['system-design'].stageTitles[3],
        shortGoal: TOPIC_METADATA['system-design'].stageGoals[3],
        visualAnchorQuestionId: 'sys-037',
        questionIds: ['sys-037', 'sys-038', 'sys-040', 'sys-047', 'sys-065', 'sys-080'],
      },
      {
        id: 'stage-5-realworld',
        stepNumber: 5,
        title: TOPIC_METADATA['system-design'].stageTitles[4],
        shortGoal: TOPIC_METADATA['system-design'].stageGoals[4],
        visualAnchorQuestionId: 'sys-089',
        questionIds: ['sys-089', 'sys-074', 'sys-075', 'sys-092', 'sys-094', 'sys-096'],
      },
    ],
  },

  react: {
    topicId: 'react',
    title: TOPIC_METADATA.react.title,
    tagline: TOPIC_METADATA.react.tagline,
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
        title: TOPIC_METADATA.react.stageTitles[0],
        shortGoal: TOPIC_METADATA.react.stageGoals[0],
        visualAnchorQuestionId: 'react-005',
        questionIds: ['react-001', 'react-002', 'react-004', 'react-005', 'react-010', 'react-011'],
      },
      {
        id: 'react-stage-2-lifecycle',
        stepNumber: 2,
        title: TOPIC_METADATA.react.stageTitles[1],
        shortGoal: TOPIC_METADATA.react.stageGoals[1],
        visualAnchorQuestionId: 'react-005',
        questionIds: ['react-013', 'react-014', 'react-015', 'react-006', 'react-007', 'react-012'],
      },
      {
        id: 'react-stage-3-state',
        stepNumber: 3,
        title: TOPIC_METADATA.react.stageTitles[2],
        shortGoal: TOPIC_METADATA.react.stageGoals[2],
        questionIds: ['react-003', 'react-008', 'react-009', 'react-013', 'react-011'],
      },
      {
        id: 'react-stage-4-modern19',
        stepNumber: 4,
        title: TOPIC_METADATA.react.stageTitles[3],
        shortGoal: TOPIC_METADATA.react.stageGoals[3],
        visualAnchorQuestionId: 'r19-05',
        questionIds: ['r19-05', 'int-02', 'r19-03', 'r19-04', 'int-07'],
      },
      {
        id: 'react-stage-5-production',
        stepNumber: 5,
        title: TOPIC_METADATA.react.stageTitles[4],
        shortGoal: TOPIC_METADATA.react.stageGoals[4],
        questionIds: ['react-005', 'react-014', 'react-015', 'react-011'],
      },
    ],
  },

  nextjs: {
    topicId: 'nextjs',
    title: TOPIC_METADATA.nextjs.title,
    tagline: TOPIC_METADATA.nextjs.tagline,
    mindmapCode: `flowchart LR
    N1["📍 Trạm 1: App Router & File System\n- Server vs Client Components (next-001)\n- Route Handlers & Layouts (next-002)\n- Streaming & Suspense (next-003)"]
    N2["⚙️ Trạm 2: Data Fetching & Caching\n- 4-Tier Caching System (next-004)\n- Revalidate & On-demand Tags (next-005)\n- Request Memoization (next-006)"]
    N3["⚡ Trạm 3: Server Actions & Mutations\n- Server Actions Security (next-007)\n- Optimistic UI & useActionState (next-008)\n- Cookie & Session Handling (next-009)"]
    N4["🔍 Trạm 4: Middleware & Authentication\n- Edge Middleware (next-010)\n- Auth Protect & Redirects (next-011)\n- Internationalization i18n (next-012)"]
    N5["🚀 Trạm 5: Production & Edge Tuning\n- Core Web Vitals Optimization (next-013)\n- Dynamic vs Static Rendering (next-014)\n- Turbopack & Deployment (next-015)"]

    N1 ==> N2 ==> N3 ==> N4 ==> N5`,
    stages: [
      {
        id: 'nextjs-stage-1-router',
        stepNumber: 1,
        title: TOPIC_METADATA.nextjs.stageTitles[0],
        shortGoal: TOPIC_METADATA.nextjs.stageGoals[0],
        visualAnchorQuestionId: 'next-001',
        questionIds: ['next-001', 'next-002', 'next-003', 'next-016', 'next-017', 'next-018'],
      },
      {
        id: 'nextjs-stage-2-rsc',
        stepNumber: 2,
        title: TOPIC_METADATA.nextjs.stageTitles[1],
        shortGoal: TOPIC_METADATA.nextjs.stageGoals[1],
        visualAnchorQuestionId: 'next-004',
        questionIds: ['next-004', 'next-005', 'next-006', 'next-019', 'next-020', 'next-021'],
      },
      {
        id: 'nextjs-stage-3-caching',
        stepNumber: 3,
        title: TOPIC_METADATA.nextjs.stageTitles[2],
        shortGoal: TOPIC_METADATA.nextjs.stageGoals[2],
        visualAnchorQuestionId: 'next-007',
        questionIds: ['next-007', 'next-008', 'next-009', 'next-022', 'next-023', 'next-024'],
      },
      {
        id: 'nextjs-stage-4-middleware',
        stepNumber: 4,
        title: TOPIC_METADATA.nextjs.stageTitles[3],
        shortGoal: TOPIC_METADATA.nextjs.stageGoals[3],
        visualAnchorQuestionId: 'next-010',
        questionIds: ['next-010', 'next-011', 'next-012', 'next-025', 'next-026', 'next-027'],
      },
      {
        id: 'nextjs-stage-5-optimization',
        stepNumber: 5,
        title: TOPIC_METADATA.nextjs.stageTitles[4],
        shortGoal: TOPIC_METADATA.nextjs.stageGoals[4],
        visualAnchorQuestionId: 'next-013',
        questionIds: ['next-013', 'next-014', 'next-015', 'next-028', 'next-029', 'next-030'],
      },
    ],
  },

  typescript: {
    topicId: 'typescript',
    title: TOPIC_METADATA.typescript.title,
    tagline: TOPIC_METADATA.typescript.tagline,
    mindmapCode: `flowchart LR
    T1["📍 Trạm 1: Hệ Thống Kiểu Cốt Lõi\n- Type Inference & Any vs Unknown (ts-001)\n- Type vs Interface (ts-002)\n- Structural Typing (ts-003)"]
    T2["⚙️ Trạm 2: Generics & Utility Types\n- Generic Constraints extends (ts-004)\n- Utility Types: Pick, Omit, Partial (ts-005)\n- Keyof & Indexed Access (ts-006)"]
    T3["⚡ Trạm 3: Type Narrowing & Guards\n- Discriminated Unions (ts-007)\n- User-defined Type Guards is (ts-008)\n- Exhaustive Check never (ts-009)"]
    T4["🔍 Trạm 4: Conditional & Mapped Types\n- Conditional Types & infer (ts-010)\n- Mapped Types & Modifiers (ts-011)\n- Template Literal Types (ts-012)"]
    T5["🚀 Trạm 5: Strict Mode & Architecture\n- Tsconfig Best Practices (ts-013)\n- Covariance vs Contravariance (ts-014)\n- Module Declaration & d.ts (ts-015)"]

    T1 ==> T2 ==> T3 ==> T4 ==> T5`,
    stages: [
      {
        id: 'ts-stage-1-types',
        stepNumber: 1,
        title: TOPIC_METADATA.typescript.stageTitles[0],
        shortGoal: TOPIC_METADATA.typescript.stageGoals[0],
        visualAnchorQuestionId: 'ts-001',
        questionIds: ['ts-001', 'ts-002', 'ts-003', 'ts-016', 'ts-017', 'ts-018'],
      },
      {
        id: 'ts-stage-2-generics',
        stepNumber: 2,
        title: TOPIC_METADATA.typescript.stageTitles[1],
        shortGoal: TOPIC_METADATA.typescript.stageGoals[1],
        visualAnchorQuestionId: 'ts-004',
        questionIds: ['ts-004', 'ts-005', 'ts-006', 'ts-019', 'ts-020', 'ts-021'],
      },
      {
        id: 'ts-stage-3-narrowing',
        stepNumber: 3,
        title: TOPIC_METADATA.typescript.stageTitles[2],
        shortGoal: TOPIC_METADATA.typescript.stageGoals[2],
        visualAnchorQuestionId: 'ts-007',
        questionIds: ['ts-007', 'ts-008', 'ts-009', 'ts-022', 'ts-023', 'ts-024'],
      },
      {
        id: 'ts-stage-4-conditional',
        stepNumber: 4,
        title: TOPIC_METADATA.typescript.stageTitles[3],
        shortGoal: TOPIC_METADATA.typescript.stageGoals[3],
        visualAnchorQuestionId: 'ts-010',
        questionIds: ['ts-010', 'ts-011', 'ts-012', 'ts-025', 'ts-026', 'ts-027'],
      },
      {
        id: 'ts-stage-5-strict',
        stepNumber: 5,
        title: TOPIC_METADATA.typescript.stageTitles[4],
        shortGoal: TOPIC_METADATA.typescript.stageGoals[4],
        visualAnchorQuestionId: 'ts-013',
        questionIds: ['ts-013', 'ts-014', 'ts-015', 'ts-028', 'ts-029', 'ts-030'],
      },
    ],
  },

  javascript: {
    topicId: 'javascript',
    title: TOPIC_METADATA.javascript.title,
    tagline: TOPIC_METADATA.javascript.tagline,
    mindmapCode: `flowchart LR
    J1["📍 Trạm 1: Execution Context & Scope\n- Hoisting & TDZ (js-001)\n- Closures & Lexical Scope (js-002)\n- this binding: call, apply, bind (js-003)"]
    J2["⚙️ Trạm 2: Prototype & Object Model\n- Prototype Chain (js-004)\n- Object.create vs new (js-005)\n- ES6 Classes & Inheritance (js-006)"]
    J3["⚡ Trạm 3: Event Loop & Async JS\n- Macrotasks vs Microtasks (js-007)\n- Promises & Async/Await (js-008)\n- Event Bubbling & Delegation (js-009)"]
    J4["🔍 Trạm 4: Quản Lý Bộ Nhớ & GC\n- V8 Heap vs Stack (js-010)\n- Mark-and-Sweep Garbage Collector (js-011)\n- Memory Leaks Traps (js-012)"]
    J5["🚀 Trạm 5: V8 Engine & Web APIs\n- JIT Compiler & Hidden Classes (js-013)\n- Web Workers & SharedArrayBuffer (js-014)\n- Streams & Performance API (js-015)"]

    J1 ==> J2 ==> J3 ==> J4 ==> J5`,
    stages: [
      {
        id: 'js-stage-1-scope',
        stepNumber: 1,
        title: TOPIC_METADATA.javascript.stageTitles[0],
        shortGoal: TOPIC_METADATA.javascript.stageGoals[0],
        visualAnchorQuestionId: 'js-001',
        questionIds: ['js-001', 'js-002', 'js-003', 'js-016', 'js-017', 'js-018'],
      },
      {
        id: 'js-stage-2-prototype',
        stepNumber: 2,
        title: TOPIC_METADATA.javascript.stageTitles[1],
        shortGoal: TOPIC_METADATA.javascript.stageGoals[1],
        visualAnchorQuestionId: 'js-004',
        questionIds: ['js-004', 'js-005', 'js-006', 'js-019', 'js-020', 'js-021'],
      },
      {
        id: 'js-stage-3-eventloop',
        stepNumber: 3,
        title: TOPIC_METADATA.javascript.stageTitles[2],
        shortGoal: TOPIC_METADATA.javascript.stageGoals[2],
        visualAnchorQuestionId: 'js-007',
        questionIds: ['js-007', 'js-008', 'js-009', 'js-022', 'js-023', 'js-024'],
      },
      {
        id: 'js-stage-4-memory',
        stepNumber: 4,
        title: TOPIC_METADATA.javascript.stageTitles[3],
        shortGoal: TOPIC_METADATA.javascript.stageGoals[3],
        visualAnchorQuestionId: 'js-010',
        questionIds: ['js-010', 'js-011', 'js-012', 'js-025', 'js-026', 'js-027'],
      },
      {
        id: 'js-stage-5-v8',
        stepNumber: 5,
        title: TOPIC_METADATA.javascript.stageTitles[4],
        shortGoal: TOPIC_METADATA.javascript.stageGoals[4],
        visualAnchorQuestionId: 'js-013',
        questionIds: ['js-013', 'js-014', 'js-015', 'js-028', 'js-029', 'js-030'],
      },
    ],
  },

  java: {
    topicId: 'java',
    title: TOPIC_METADATA.java.title,
    tagline: TOPIC_METADATA.java.tagline,
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
        title: TOPIC_METADATA.java.stageTitles[0],
        shortGoal: TOPIC_METADATA.java.stageGoals[0],
        visualAnchorQuestionId: 'java-004',
        questionIds: ['java-001', 'java-002', 'java-003', 'java-004', 'java-005', 'java-006'],
      },
      {
        id: 'java-stage-2-jvm',
        stepNumber: 2,
        title: TOPIC_METADATA.java.stageTitles[1],
        shortGoal: TOPIC_METADATA.java.stageGoals[1],
        visualAnchorQuestionId: 'java-056',
        questionIds: ['java-004', 'java-018', 'java-055', 'java-056', 'java-057', 'java-058'],
      },
      {
        id: 'java-stage-3-concurrency',
        stepNumber: 3,
        title: TOPIC_METADATA.java.stageTitles[2],
        shortGoal: TOPIC_METADATA.java.stageGoals[2],
        visualAnchorQuestionId: 'java-023',
        questionIds: ['java-023', 'java-048', 'java-049', 'java-051', 'java-052', 'java-092'],
      },
      {
        id: 'java-stage-4-virtualthreads',
        stepNumber: 4,
        title: TOPIC_METADATA.java.stageTitles[3],
        shortGoal: TOPIC_METADATA.java.stageGoals[3],
        visualAnchorQuestionId: 'java-062',
        questionIds: ['java-062', 'java-091', 'java-093', 'java-088', 'java-089'],
      },
      {
        id: 'java-stage-5-tuning',
        stepNumber: 5,
        title: TOPIC_METADATA.java.stageTitles[4],
        shortGoal: TOPIC_METADATA.java.stageGoals[4],
        visualAnchorQuestionId: 'java-087',
        questionIds: ['java-087', 'java-059', 'java-060', 'java-073', 'java-082', 'java-094'],
      },
    ],
  },

  database: {
    topicId: 'database',
    title: TOPIC_METADATA.database.title,
    tagline: TOPIC_METADATA.database.tagline,
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
        title: TOPIC_METADATA.database.stageTitles[0],
        shortGoal: TOPIC_METADATA.database.stageGoals[0],
        visualAnchorQuestionId: 'db-011',
        questionIds: ['db-001', 'db-002', 'db-003', 'db-006', 'db-008', 'db-011'],
      },
      {
        id: 'db-stage-2-indexing',
        stepNumber: 2,
        title: TOPIC_METADATA.database.stageTitles[1],
        shortGoal: TOPIC_METADATA.database.stageGoals[1],
        visualAnchorQuestionId: 'db-022',
        questionIds: ['db-022', 'db-023', 'db-024', 'db-025', 'db-013', 'db-015'],
      },
      {
        id: 'db-stage-3-acid',
        stepNumber: 3,
        title: TOPIC_METADATA.database.stageTitles[2],
        shortGoal: TOPIC_METADATA.database.stageGoals[2],
        visualAnchorQuestionId: 'db-027',
        questionIds: ['db-026', 'db-027', 'db-028', 'db-016', 'db-021'],
      },
      {
        id: 'db-stage-4-modeling',
        stepNumber: 4,
        title: TOPIC_METADATA.database.stageTitles[3],
        shortGoal: TOPIC_METADATA.database.stageGoals[3],
        visualAnchorQuestionId: 'db-052',
        questionIds: ['db-052', 'db-014', 'db-029', 'db-030', 'db-017'],
      },
      {
        id: 'db-stage-5-scaling',
        stepNumber: 5,
        title: TOPIC_METADATA.database.stageTitles[4],
        shortGoal: TOPIC_METADATA.database.stageGoals[4],
        questionIds: ['db-018', 'db-019', 'db-020', 'db-021', 'db-022'],
      },
    ],
  },

  ai: {
    topicId: 'ai',
    title: TOPIC_METADATA.ai.title,
    tagline: TOPIC_METADATA.ai.tagline,
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
        title: TOPIC_METADATA.ai.stageTitles[0],
        shortGoal: TOPIC_METADATA.ai.stageGoals[0],
        questionIds: ['ai-001', 'ai-002', 'ai-003', 'ai-004', 'ai-005', 'ai-009'],
      },
      {
        id: 'ai-stage-2-prompting',
        stepNumber: 2,
        title: TOPIC_METADATA.ai.stageTitles[1],
        shortGoal: TOPIC_METADATA.ai.stageGoals[1],
        questionIds: ['ai-006', 'ai-007', 'ai-008', 'ai-014', 'ai-030', 'ai-047'],
      },
      {
        id: 'ai-stage-3-rag',
        stepNumber: 3,
        title: TOPIC_METADATA.ai.stageTitles[2],
        shortGoal: TOPIC_METADATA.ai.stageGoals[2],
        visualAnchorQuestionId: 'ai-010',
        questionIds: ['ai-010', 'ai-011', 'ai-012', 'ai-033', 'ai-034', 'ai-035'],
      },
      {
        id: 'ai-stage-4-transformer',
        stepNumber: 4,
        title: TOPIC_METADATA.ai.stageTitles[3],
        shortGoal: TOPIC_METADATA.ai.stageGoals[3],
        visualAnchorQuestionId: 'ai-026',
        questionIds: ['ai-025', 'ai-026', 'ai-052', 'ai-114'],
      },
      {
        id: 'ai-stage-5-agents',
        stepNumber: 5,
        title: TOPIC_METADATA.ai.stageTitles[4],
        shortGoal: TOPIC_METADATA.ai.stageGoals[4],
        visualAnchorQuestionId: 'ai-013',
        questionIds: ['ai-013', 'ai-042', 'ai-043', 'ai-058', 'ai-106', 'ai-109'],
      },
    ],
  },

  go: {
    topicId: 'go',
    title: TOPIC_METADATA.go.title,
    tagline: TOPIC_METADATA.go.tagline,
    mindmapCode: `flowchart LR
    G1["📍 Trạm 1: Cú Pháp Cốt Lõi\n- Pointers & Struct Embedding (go-001)\n- Interfaces & Duck Typing (go-002)\n- Idiomatic Error Handling (go-003)"]
    G2["⚙️ Trạm 2: Concurrency & Channels\n- Goroutine Scheduling M:N (go-004)\n- Buffered vs Unbuffered (go-005)\n- Select Statement & Mutex (go-006)"]
    G3["⚡ Trạm 3: Quản Lý Bộ Nhớ\n- Escape Analysis Stack vs Heap (go-007)\n- Garbage Collector Tri-color (go-008)\n- Context Propagation (go-009)"]
    G4["🔍 Trạm 4: Kiến Trúc Gói & Thư Viện\n- Go Modules & Packages (go-010)\n- Net/HTTP Pipeline (go-011)\n- IO Reader/Writer Chaining (go-012)"]
    G5["🚀 Trạm 5: Hiệu Năng & Concurrency Traps\n- Goroutine Leaks & Race Detector (go-013)\n- Pprof CPU/Memory Profiling (go-014)\n- High-Throughput Microservices (go-015)"]

    G1 ==> G2 ==> G3 ==> G4 ==> G5`,
    stages: [
      {
        id: 'go-stage-1-syntax',
        stepNumber: 1,
        title: TOPIC_METADATA.go.stageTitles[0],
        shortGoal: TOPIC_METADATA.go.stageGoals[0],
        visualAnchorQuestionId: 'go-001',
        questionIds: ['go-001', 'go-002', 'go-003', 'go-016', 'go-017', 'go-018'],
      },
      {
        id: 'go-stage-2-concurrency',
        stepNumber: 2,
        title: TOPIC_METADATA.go.stageTitles[1],
        shortGoal: TOPIC_METADATA.go.stageGoals[1],
        visualAnchorQuestionId: 'go-004',
        questionIds: ['go-004', 'go-005', 'go-006', 'go-019', 'go-020', 'go-021'],
      },
      {
        id: 'go-stage-3-memory',
        stepNumber: 3,
        title: TOPIC_METADATA.go.stageTitles[2],
        shortGoal: TOPIC_METADATA.go.stageGoals[2],
        visualAnchorQuestionId: 'go-007',
        questionIds: ['go-007', 'go-008', 'go-009', 'go-022', 'go-023', 'go-024'],
      },
      {
        id: 'go-stage-4-packages',
        stepNumber: 4,
        title: TOPIC_METADATA.go.stageTitles[3],
        shortGoal: TOPIC_METADATA.go.stageGoals[3],
        visualAnchorQuestionId: 'go-010',
        questionIds: ['go-010', 'go-011', 'go-012', 'go-025', 'go-026', 'go-027'],
      },
      {
        id: 'go-stage-5-tuning',
        stepNumber: 5,
        title: TOPIC_METADATA.go.stageTitles[4],
        shortGoal: TOPIC_METADATA.go.stageGoals[4],
        visualAnchorQuestionId: 'go-013',
        questionIds: ['go-013', 'go-014', 'go-015', 'go-028', 'go-029', 'go-030'],
      },
    ],
  },

  nodejs: {
    topicId: 'nodejs',
    title: TOPIC_METADATA.nodejs.title,
    tagline: TOPIC_METADATA.nodejs.tagline,
    mindmapCode: `flowchart LR
    ND1["📍 Trạm 1: Libuv Architecture\n- 6 Event Loop Phases (nodejs-001)\n- process.nextTick vs setImmediate (nodejs-002)\n- Thread Pool Sizing (nodejs-003)"]
    ND2["⚙️ Trạm 2: Streams & Buffer\n- Readable/Writable Streams (nodejs-004)\n- Backpressure Handling (nodejs-005)\n- Buffer Allocation & Security (nodejs-006)"]
    ND3["⚡ Trạm 3: Đa Luồng & Cluster\n- Worker Threads vs Cluster (nodejs-007)\n- IPC Communication (nodejs-008)\n- Child Processes (nodejs-009)"]
    ND4["🔍 Trạm 4: RESTful API & Middleware\n- Async Middleware Chain (nodejs-010)\n- Error Handling Pipeline (nodejs-011)\n- Security Headers Helmet (nodejs-012)"]
    ND5["🚀 Trạm 5: Production Performance\n- Clinic.js & Flamegraphs (nodejs-013)\n- Memory Leaks & Heapdump (nodejs-014)\n- Event Loop Lag Monitoring (nodejs-015)"]

    ND1 ==> ND2 ==> ND3 ==> ND4 ==> ND5`,
    stages: [
      {
        id: 'nodejs-stage-1-libuv',
        stepNumber: 1,
        title: TOPIC_METADATA.nodejs.stageTitles[0],
        shortGoal: TOPIC_METADATA.nodejs.stageGoals[0],
        visualAnchorQuestionId: 'nodejs-001',
        questionIds: ['nodejs-001', 'nodejs-002', 'nodejs-003', 'nodejs-016', 'nodejs-017', 'nodejs-018'],
      },
      {
        id: 'nodejs-stage-2-streams',
        stepNumber: 2,
        title: TOPIC_METADATA.nodejs.stageTitles[1],
        shortGoal: TOPIC_METADATA.nodejs.stageGoals[1],
        visualAnchorQuestionId: 'nodejs-004',
        questionIds: ['nodejs-004', 'nodejs-005', 'nodejs-006', 'nodejs-019', 'nodejs-020', 'nodejs-021'],
      },
      {
        id: 'nodejs-stage-3-workers',
        stepNumber: 3,
        title: TOPIC_METADATA.nodejs.stageTitles[2],
        shortGoal: TOPIC_METADATA.nodejs.stageGoals[2],
        visualAnchorQuestionId: 'nodejs-007',
        questionIds: ['nodejs-007', 'nodejs-008', 'nodejs-009', 'nodejs-022', 'nodejs-023', 'nodejs-024'],
      },
      {
        id: 'nodejs-stage-4-api',
        stepNumber: 4,
        title: TOPIC_METADATA.nodejs.stageTitles[3],
        shortGoal: TOPIC_METADATA.nodejs.stageGoals[3],
        visualAnchorQuestionId: 'nodejs-010',
        questionIds: ['nodejs-010', 'nodejs-011', 'nodejs-012', 'nodejs-025', 'nodejs-026', 'nodejs-027'],
      },
      {
        id: 'nodejs-stage-5-tuning',
        stepNumber: 5,
        title: TOPIC_METADATA.nodejs.stageTitles[4],
        shortGoal: TOPIC_METADATA.nodejs.stageGoals[4],
        visualAnchorQuestionId: 'nodejs-013',
        questionIds: ['nodejs-013', 'nodejs-014', 'nodejs-015', 'nodejs-028', 'nodejs-029', 'nodejs-030'],
      },
    ],
  },

  nestjs: {
    topicId: 'nestjs',
    title: TOPIC_METADATA.nestjs.title,
    tagline: TOPIC_METADATA.nestjs.tagline,
    mindmapCode: `flowchart LR
    NE1["📍 Trạm 1: IoC & Modular Design\n- Dependency Injection (nestjs-001)\n- Provider Scopes (nestjs-002)\n- Dynamic Modules (nestjs-003)"]
    NE2["⚙️ Trạm 2: Controllers & Providers\n- Route Handling (nestjs-004)\n- Custom Providers (nestjs-005)\n- Lifecycle Events (nestjs-006)"]
    NE3["⚡ Trạm 3: Pipes, Guards & Interceptors\n- ValidationPipe (nestjs-007)\n- AuthGuard JWT (nestjs-008)\n- Transform Interceptor (nestjs-009)"]
    NE4["🔍 Trạm 4: Database & TypeORM\n- Repository Pattern (nestjs-010)\n- Transaction Management (nestjs-011)\n- Anti-N+1 Queries (nestjs-012)"]
    NE5["🚀 Trạm 5: Microservices & Scaling\n- Redis / RabbitMQ Transporters (nestjs-013)\n- Event-driven Patterns (nestjs-014)\n- Enterprise Rate Limiting (nestjs-015)"]

    NE1 ==> NE2 ==> NE3 ==> NE4 ==> NE5`,
    stages: [
      {
        id: 'nestjs-stage-1-ioc',
        stepNumber: 1,
        title: TOPIC_METADATA.nestjs.stageTitles[0],
        shortGoal: TOPIC_METADATA.nestjs.stageGoals[0],
        visualAnchorQuestionId: 'nestjs-001',
        questionIds: ['nestjs-001', 'nestjs-002', 'nestjs-003', 'nestjs-016', 'nestjs-017', 'nestjs-018'],
      },
      {
        id: 'nestjs-stage-2-providers',
        stepNumber: 2,
        title: TOPIC_METADATA.nestjs.stageTitles[1],
        shortGoal: TOPIC_METADATA.nestjs.stageGoals[1],
        visualAnchorQuestionId: 'nestjs-004',
        questionIds: ['nestjs-004', 'nestjs-005', 'nestjs-006', 'nestjs-019', 'nestjs-020', 'nestjs-021'],
      },
      {
        id: 'nestjs-stage-3-pipes',
        stepNumber: 3,
        title: TOPIC_METADATA.nestjs.stageTitles[2],
        shortGoal: TOPIC_METADATA.nestjs.stageGoals[2],
        visualAnchorQuestionId: 'nestjs-007',
        questionIds: ['nestjs-007', 'nestjs-008', 'nestjs-009', 'nestjs-022', 'nestjs-023', 'nestjs-024'],
      },
      {
        id: 'nestjs-stage-4-database',
        stepNumber: 4,
        title: TOPIC_METADATA.nestjs.stageTitles[3],
        shortGoal: TOPIC_METADATA.nestjs.stageGoals[3],
        visualAnchorQuestionId: 'nestjs-010',
        questionIds: ['nestjs-010', 'nestjs-011', 'nestjs-012', 'nestjs-025', 'nestjs-026', 'nestjs-027'],
      },
      {
        id: 'nestjs-stage-5-microservices',
        stepNumber: 5,
        title: TOPIC_METADATA.nestjs.stageTitles[4],
        shortGoal: TOPIC_METADATA.nestjs.stageGoals[4],
        visualAnchorQuestionId: 'nestjs-013',
        questionIds: ['nestjs-013', 'nestjs-014', 'nestjs-015', 'nestjs-028', 'nestjs-029', 'nestjs-030'],
      },
    ],
  },

  python: {
    topicId: 'python',
    title: TOPIC_METADATA.python.title,
    tagline: TOPIC_METADATA.python.tagline,
    mindmapCode: `flowchart LR
    P1["📍 Trạm 1: Data Model & Generators\n- Dunder Methods (python-001)\n- Generators & Yield (python-002)\n- Decorators (python-003)"]
    P2["⚙️ Trạm 2: Advanced OOP & MRO\n- Metaclasses (python-004)\n- C3 Linearization (python-005)\n- Descriptors Protocol (python-006)"]
    P3["⚡ Trạm 3: Concurrency & Asyncio\n- Asyncio Event Loop (python-007)\n- Threading vs Multiprocessing (python-008)\n- GIL Lock Mechanisms (python-009)"]
    P4["🔍 Trạm 4: Memory Management\n- Ref Counting & Cyclic GC (python-010)\n- __slots__ Memory Optimization (python-011)\n- Memory Leak Diagnostics (python-012)"]
    P5["🚀 Trạm 5: Production Python\n- Strict Typing with Mypy (python-013)\n- High-throughput APIs (python-014)\n- C-Extension Optimization (python-015)"]

    P1 ==> P2 ==> P3 ==> P4 ==> P5`,
    stages: [
      {
        id: 'python-stage-1-model',
        stepNumber: 1,
        title: TOPIC_METADATA.python.stageTitles[0],
        shortGoal: TOPIC_METADATA.python.stageGoals[0],
        visualAnchorQuestionId: 'python-001',
        questionIds: ['python-001', 'python-002', 'python-003', 'python-016', 'python-017', 'python-018'],
      },
      {
        id: 'python-stage-2-oop',
        stepNumber: 2,
        title: TOPIC_METADATA.python.stageTitles[1],
        shortGoal: TOPIC_METADATA.python.stageGoals[1],
        visualAnchorQuestionId: 'python-004',
        questionIds: ['python-004', 'python-005', 'python-006', 'python-019', 'python-020', 'python-021'],
      },
      {
        id: 'python-stage-3-async',
        stepNumber: 3,
        title: TOPIC_METADATA.python.stageTitles[2],
        shortGoal: TOPIC_METADATA.python.stageGoals[2],
        visualAnchorQuestionId: 'python-007',
        questionIds: ['python-007', 'python-008', 'python-009', 'python-022', 'python-023', 'python-024'],
      },
      {
        id: 'python-stage-4-memory',
        stepNumber: 4,
        title: TOPIC_METADATA.python.stageTitles[3],
        shortGoal: TOPIC_METADATA.python.stageGoals[3],
        visualAnchorQuestionId: 'python-010',
        questionIds: ['python-010', 'python-011', 'python-012', 'python-025', 'python-026', 'python-027'],
      },
      {
        id: 'python-stage-5-prod',
        stepNumber: 5,
        title: TOPIC_METADATA.python.stageTitles[4],
        shortGoal: TOPIC_METADATA.python.stageGoals[4],
        visualAnchorQuestionId: 'python-013',
        questionIds: ['python-013', 'python-014', 'python-015', 'python-028', 'python-029', 'python-030'],
      },
    ],
  },

  'devops-cloud': {
    topicId: 'devops-cloud',
    title: TOPIC_METADATA['devops-cloud'].title,
    tagline: TOPIC_METADATA['devops-cloud'].tagline,
    mindmapCode: `flowchart LR
    DO1["📍 Trạm 1: Linux & Docker\n- Linux Cgroups & Namespaces (devops-001)\n- Docker Multi-stage Builds (devops-002)\n- Layer Caching Optimization (devops-003)"]
    DO2["⚙️ Trạm 2: Kubernetes K8s Core\n- Pod Lifecycle & Scheduling (devops-004)\n- Deployment vs DaemonSet (devops-005)\n- Ingress & Services Networking (devops-006)"]
    DO3["⚡ Trạm 3: CI/CD & Infrastructure as Code\n- GitOps with ArgoCD (devops-007)\n- Terraform State & Modules (devops-008)\n- Zero-Downtime Deployments (devops-009)"]
    DO4["🔍 Trạm 4: Cloud Networking & Security\n- VPC Peering, NAT & Subnets (devops-010)\n- IAM Policies & Least Privilege (devops-011)\n- Secret Management Vault (devops-012)"]
    DO5["🚀 Trạm 5: Observability & Chaos Engineering\n- Prometheus Metrics & Alerting (devops-013)\n- Grafana Dashboards & Loki (devops-014)\n- OpenTelemetry Distributed Tracing (devops-015)"]

    DO1 ==> DO2 ==> DO3 ==> DO4 ==> DO5`,
    stages: [
      {
        id: 'devops-stage-1-docker',
        stepNumber: 1,
        title: TOPIC_METADATA['devops-cloud'].stageTitles[0],
        shortGoal: TOPIC_METADATA['devops-cloud'].stageGoals[0],
        visualAnchorQuestionId: 'devops-001',
        questionIds: ['devops-001', 'devops-002', 'devops-003', 'devops-016', 'devops-017', 'devops-018'],
      },
      {
        id: 'devops-stage-2-k8s',
        stepNumber: 2,
        title: TOPIC_METADATA['devops-cloud'].stageTitles[1],
        shortGoal: TOPIC_METADATA['devops-cloud'].stageGoals[1],
        visualAnchorQuestionId: 'devops-004',
        questionIds: ['devops-004', 'devops-005', 'devops-006', 'devops-019', 'devops-020', 'devops-021'],
      },
      {
        id: 'devops-stage-3-cicd',
        stepNumber: 3,
        title: TOPIC_METADATA['devops-cloud'].stageTitles[2],
        shortGoal: TOPIC_METADATA['devops-cloud'].stageGoals[2],
        visualAnchorQuestionId: 'devops-007',
        questionIds: ['devops-007', 'devops-008', 'devops-009', 'devops-022', 'devops-023', 'devops-024'],
      },
      {
        id: 'devops-stage-4-cloud',
        stepNumber: 4,
        title: TOPIC_METADATA['devops-cloud'].stageTitles[3],
        shortGoal: TOPIC_METADATA['devops-cloud'].stageGoals[3],
        visualAnchorQuestionId: 'devops-010',
        questionIds: ['devops-010', 'devops-011', 'devops-012', 'devops-025', 'devops-026', 'devops-027'],
      },
      {
        id: 'devops-stage-5-observability',
        stepNumber: 5,
        title: TOPIC_METADATA['devops-cloud'].stageTitles[4],
        shortGoal: TOPIC_METADATA['devops-cloud'].stageGoals[4],
        visualAnchorQuestionId: 'devops-013',
        questionIds: ['devops-013', 'devops-014', 'devops-015', 'devops-028', 'devops-029', 'devops-030'],
      },
    ],
  },

  dsa: {
    topicId: 'dsa',
    title: TOPIC_METADATA.dsa.title,
    tagline: TOPIC_METADATA.dsa.tagline,
    mindmapCode: `flowchart LR
    DS1["📍 Trạm 1: Mảng & Con Trỏ\n- Two Pointers Technique (dsa-001)\n- Sliding Window (dsa-002)\n- Prefix Sum & Fast-Slow (dsa-003)"]
    DS2["⚙️ Trạm 2: Cấu Trúc Tuyến Tính\n- Monotonic Stack (dsa-004)\n- Circular Queue & Deque (dsa-005)\n- Hash Map Collision Resolution (dsa-006)"]
    DS3["⚡ Trạm 3: Cây & Đồ Thị Cơ Bản\n- Binary Search Tree (dsa-007)\n- BFS Level Order (dsa-008)\n- DFS Tree Traversal (dsa-009)"]
    DS4["🔍 Trạm 4: Quy Hoạch Động (DP)\n- 1D DP Fibonacci/Coin Change (dsa-010)\n- 2D Grid DP & Subsequences (dsa-011)\n- 0/1 Knapsack Problem (dsa-012)"]
    DS5["🚀 Trạm 5: Đồ Thị Nâng Cao & Heap\n- Dijkstra Shortest Path (dsa-013)\n- Min/Max Heap & PriorityQueue (dsa-014)\n- Backtracking N-Queens (dsa-015)"]

    DS1 ==> DS2 ==> DS3 ==> DS4 ==> DS5`,
    stages: [
      {
        id: 'dsa-stage-1-pointers',
        stepNumber: 1,
        title: TOPIC_METADATA.dsa.stageTitles[0],
        shortGoal: TOPIC_METADATA.dsa.stageGoals[0],
        visualAnchorQuestionId: 'dsa-001',
        questionIds: ['dsa-001', 'dsa-002', 'dsa-003', 'dsa-016', 'dsa-017', 'dsa-018'],
      },
      {
        id: 'dsa-stage-2-linear',
        stepNumber: 2,
        title: TOPIC_METADATA.dsa.stageTitles[1],
        shortGoal: TOPIC_METADATA.dsa.stageGoals[1],
        visualAnchorQuestionId: 'dsa-004',
        questionIds: ['dsa-004', 'dsa-005', 'dsa-006', 'dsa-019', 'dsa-020', 'dsa-021'],
      },
      {
        id: 'dsa-stage-3-trees',
        stepNumber: 3,
        title: TOPIC_METADATA.dsa.stageTitles[2],
        shortGoal: TOPIC_METADATA.dsa.stageGoals[2],
        visualAnchorQuestionId: 'dsa-007',
        questionIds: ['dsa-007', 'dsa-008', 'dsa-009', 'dsa-022', 'dsa-023', 'dsa-024'],
      },
      {
        id: 'dsa-stage-4-dp',
        stepNumber: 4,
        title: TOPIC_METADATA.dsa.stageTitles[3],
        shortGoal: TOPIC_METADATA.dsa.stageGoals[3],
        visualAnchorQuestionId: 'dsa-010',
        questionIds: ['dsa-010', 'dsa-011', 'dsa-012', 'dsa-025', 'dsa-026', 'dsa-027'],
      },
      {
        id: 'dsa-stage-5-graphs',
        stepNumber: 5,
        title: TOPIC_METADATA.dsa.stageTitles[4],
        shortGoal: TOPIC_METADATA.dsa.stageGoals[4],
        visualAnchorQuestionId: 'dsa-013',
        questionIds: ['dsa-013', 'dsa-014', 'dsa-015', 'dsa-028', 'dsa-029', 'dsa-030'],
      },
    ],
  },
};

// Aliases mapping subtopics to their primary roadmaps
const TOPIC_ALIASES: Record<string, string> = {
  'react-19': 'react',
  'frontend-system-design': 'system-design',
  'next-app-router': 'nextjs',
  'javascript-typescript': 'typescript',
  'browser-runtime-workers': 'javascript',
  'backend-core': 'backend-api',
  'qa-testing': 'testing-qa',
  'performance-optimization': 'performance',
};

// Helper to enrich a curated roadmap with the full question pool for its topic
function enrichCuratedRoadmap(
  curated: TopicRoadmapSpec,
  matchingQuestions: InterviewQuestion[]
): TopicRoadmapSpec {
  if (matchingQuestions.length === 0) return curated;

  const questionIds = matchingQuestions.map((q) => q.id);
  const total = questionIds.length;
  const countPerStage = Math.max(1, Math.floor(total / 5));

  const stages: RoadmapStageSpec[] = curated.stages.map((stage, idx) => {
    const step = stage.stepNumber || idx + 1;
    const start = (step - 1) * countPerStage;
    const end = step === 5 ? total : step * countPerStage;
    const stageQuestionIds = questionIds.slice(start, end);

    return {
      ...stage,
      visualAnchorQuestionId: stage.visualAnchorQuestionId || stageQuestionIds[0],
      questionIds: stageQuestionIds,
    };
  });

  return {
    ...curated,
    stages,
  };
}

// In-memory cache for generated topic roadmaps
const DYNAMIC_ROADMAP_CACHE = new Map<string, TopicRoadmapSpec>();

export function getTopicRoadmap(
  topicId: string,
  allQuestions?: InterviewQuestion[]
): TopicRoadmapSpec | undefined {
  if (!topicId || topicId === 'all') return undefined;

  // 1. Resolve alias if present
  const resolvedTopicId = TOPIC_ALIASES[topicId] || topicId;

  // 2. Question pool to use
  const questionPool =
    allQuestions && allQuestions.length > 0 ? allQuestions : DEFAULT_JSON_QUESTION_BANKS;

  // 3. Check dynamic cache (keyed by resolvedTopicId and pool length)
  const cacheKey = `${resolvedTopicId}_${questionPool.length}`;
  if (DYNAMIC_ROADMAP_CACHE.has(cacheKey)) {
    return DYNAMIC_ROADMAP_CACHE.get(cacheKey);
  }

  // 4. If a curated roadmap is available, enrich it with all matching questions
  const curated = TOPIC_ROADMAPS[resolvedTopicId];
  if (curated) {
    const matchingQuestions = questionPool.filter((q) => matchesCategory(q, resolvedTopicId));
    const enriched = enrichCuratedRoadmap(curated, matchingQuestions);
    DYNAMIC_ROADMAP_CACHE.set(cacheKey, enriched);
    return enriched;
  }

  // 5. Synthesize roadmap from questions using auto builder
  const generated = buildAutoTopicRoadmap(resolvedTopicId, questionPool);
  if (generated) {
    DYNAMIC_ROADMAP_CACHE.set(cacheKey, generated);
    return generated;
  }

  return undefined;
}

export function hasTopicRoadmap(
  topicId: string,
  allQuestions?: InterviewQuestion[]
): boolean {
  return Boolean(getTopicRoadmap(topicId, allQuestions));
}
