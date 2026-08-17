import { InterviewQuestion, BugHuntChallenge } from '../types';

export const MOCK_INTERVIEW_QUESTIONS: InterviewQuestion[] = [
  // --- 1. NEXT.JS APP ROUTER ARCHITECTURE ---
  {
    id: 'int-01',
    category: 'next-app-router',
    level: 'senior',
    question:
      'Hãy giải thích sự khác biệt giữa SSR truyền thống của Pages Router (getServerSideProps) và React Server Components (RSC) trong App Router?',
    interviewerIntent:
      'Kiểm tra xem ứng viên có hiểu sâu về cơ chế Hydration, Client Bundle Size và kiến trúc Streaming của RSC hay chỉ biết code bề mặt.',
    contextOrScenario:
      'Hệ thống E-commerce có TTFB khá nhưng TTI (Time to Interactive) bị chậm và tải hơn 1.2MB JS về browser trên thiết bị di động.',
    expectedKeywords: [
      'zero bundle size',
      'hydration',
      'rsc payload',
      'streaming',
      'server only',
      'serialization',
    ],
    seniorAnswer: {
      summary:
        'SSR truyền thống render HTML trên server nhưng vẫn phải tải TOÀN BỘ JavaScript code của component về client để chạy quá trình Hydration. Ngược lại, RSC chạy 100% trên server, trả về format RSC Payload stream và đóng góp 0 KB JavaScript vào client bundle.',
      deepDive:
        'Với RSC, các dependencies nặng như date-fns, markdown-parser, hay DB client (Prisma/Drizzle) không bao giờ bị đóng gói gửi về browser. Hydration chỉ diễn ra ở các Client Component lá ("use client"), giúp giải phóng hoàn toàn Main Thread và cải thiện vượt bậc chỉ số INP/TTI.',
      codeExample: `// RSC (Server Component): Zero bundle cost
import { heavyMarkdownParser } from '@/lib/parser'; // 300KB lib
import { db } from '@/lib/db';

export default async function PostPage({ params }: { params: { id: string } }) {
  const post = await db.post.findUnique({ where: { id: params.id } });
  const html = heavyMarkdownParser(post.content);
  return <div dangerouslySetInnerHTML={{ __html: html }} />;
}`,
    },
    pitfalls: [
      'Nhầm lẫn rằng RSC thay thế hoàn toàn Client Components.',
      'Hiểu sai "use client" là component chỉ chạy ở browser (thực chất vẫn được pre-render HTML trên server ở lần tải đầu).',
      'Không giải thích được định dạng RSC Payload hay quá trình Hydration diễn ra như thế nào.',
    ],
    followUpQuestions: [
      'Làm thế nào để truyền dữ liệu từ Server Component vào Client Component mà không bị vi phạm serialization constraints?',
      'Server Action khác gì so với Route Handler POST thông thường?',
    ],
  },
  {
    id: 'int-05',
    category: 'next-app-router',
    level: 'middle',
    question:
      'Chỉ thị "use client" và "use server" trong Next.js 15 có ý nghĩa chính xác là gì? Khi nào bắt buộc phải dùng?',
    interviewerIntent:
      'Đánh giá sự hiểu biết về boundaries giữa client và server trong kiến trúc hybrid của Next.js.',
    contextOrScenario:
      'Junior dev thêm "use server" ở đầu mọi Server Component vì nghĩ rằng để chạy trên server thì cần khai báo như vậy.',
    expectedKeywords: [
      'client boundary',
      'server actions',
      'rpc endpoint',
      'default server component',
      'directive',
    ],
    seniorAnswer: {
      summary:
        '"use client" định nghĩa boundary chuyển giao cho Client Component khi cần React state, hook, hoặc DOM events. Mặc định mọi component trong App Router ĐÃ LÀ Server Component, nên "use server" KHÔNG DÙNG để đánh dấu Server Component mà dùng để khai báo Server Action (hàm RPC chạy trên server).',
      deepDive:
        'Đặt "use server" ở đầu file hoặc hàm sẽ biến hàm đó thành một HTTP POST endpoint an toàn có thể gọi trực tiếp từ Client Component. Việc đặt "use server" ở đầu component file là sai và gây nhầm lẫn vì component mặc định đã chạy trên server rồi.',
      codeExample: `// 1. Server Action: actions/auth.ts
'use server'; // ✅ Khai báo Server Action
export async function loginAction(formData: FormData) {
  const email = formData.get('email');
  return { success: true };
}

// 2. Client Component: LoginForm.tsx
'use client'; // ✅ Cần event onChange, onSubmit
import { loginAction } from '@/actions/auth';
export function LoginForm() {
  return <form action={loginAction}>...</form>;
}`,
    },
    pitfalls: [
      'Nghĩ rằng "use server" là từ khóa để tạo Server Component.',
      'Không biết rằng "use client" vẫn được server render ra HTML ở initial request.',
    ],
    followUpQuestions: [
      'Làm thế nào để đảm bảo code nhạy cảm (như API Secret Keys) không bao giờ bị import nhầm vào Client Component?',
    ],
  },
  {
    id: 'int-06',
    category: 'next-app-router',
    level: 'senior',
    question:
      'Hãy phân tích cơ chế Caching trong Next.js 15: revalidatePath vs revalidateTag vs fetch cache options?',
    interviewerIntent:
      'Kiểm tra khả năng kiểm soát cache đa tầng (Request memoization, Data Cache, Full Route Cache, Router Cache).',
    contextOrScenario:
      'Dự án vừa update bài viết qua CMS nhưng người dùng vào trang feed vẫn thấy nội dung cũ do cache chưa được xóa đúng cách.',
    expectedKeywords: [
      'revalidatetag',
      'revalidatepath',
      'data cache',
      'on-demand revalidation',
      'stale-while-revalidate',
      'next.js 15 uncached default',
    ],
    seniorAnswer: {
      summary:
        'Next.js 15 chuyển đổi fetch requests mặc định sang "no-store" (không tự cache nữa). Để cache và làm tươi dữ liệu chủ động, ta dùng fetch({ next: { tags: ["posts"] } }) và gọi revalidateTag("posts") trong Server Action.',
      deepDive:
        'revalidatePath("/") xóa cache theo URL path, nhưng tốn kém vì xóa luôn cả các layout không liên quan. revalidateTag("tag-name") là cơ chế hạt nhân tối ưu nhất: xóa cache của tất cả các fetch queries gắn tag đó trên toàn bộ ứng dụng mà không cần biết chúng nằm ở route nào.',
      codeExample: `// Fetch với Tag:
const res = await fetch('https://api.example.com/posts', {
  next: { tags: ['posts-list'], revalidate: 3600 }
});

// Invalidate trong Server Action:
'use server';
import { revalidateTag } from 'next/cache';

export async function createPost() {
  await db.post.create({...});
  revalidateTag('posts-list'); // ✅ Tức thì làm tươi dữ liệu feed
}`,
    },
    pitfalls: [
      'Nghĩ rằng Next.js 15 vẫn tự động cache fetch như Next.js 14 (Next 15 mặc định fetch không cache).',
      'Lạm dụng revalidatePath("/") gây xóa cache hàng loạt không cần thiết.',
    ],
    followUpQuestions: [
      'Partial Prerendering (PPR) trong Next.js hoạt động ra sao và kết hợp Static Shell với Dynamic Stream như thế nào?',
    ],
  },

  // --- 2. REACT 19 CORE & HOOKS ---
  {
    id: 'int-02',
    category: 'react-19',
    level: 'middle',
    question:
      'useOptimistic trong React 19 hoạt động như thế nào và giải quyết bài toán gì so với cách làm cũ?',
    interviewerIntent:
      'Đánh giá khả năng tối ưu hóa trải nghiệm người dùng (UX 0ms latency) và nắm bắt API mới nhất của React 19.',
    contextOrScenario:
      'Người dùng bấm nút "Thích bài viết" hoặc "Thêm vào giỏ hàng", yêu cầu giao diện nhảy số ngay lập tức trước khi server phản hồi.',
    expectedKeywords: [
      'optimistic update',
      'rollback',
      'transition',
      'pending state',
      'zero latency',
    ],
    seniorAnswer: {
      summary:
        'useOptimistic tạo ra một state tạm thời hiển thị ngay lập tức giá trị kỳ vọng trong khi async action đang thực thi, và tự động khôi phục (rollback) về state thật nếu server trả về lỗi.',
      deepDive:
        'useOptimistic nhận [passthroughState, updateFn]. Khi được kích hoạt bên trong một Transition hoặc Form Action, React sẽ render giá trị optimistic. Khi Server Action hoàn thành, React tự đồng bộ với state thật từ server mà không cần code try/catch rollback thủ công phức tạp.',
      codeExample: `const [optimisticCount, setOptimisticCount] = useOptimistic(
  actualCount,
  (current, increment: number) => current + increment
);

async function handleLike() {
  startTransition(async () => {
    setOptimisticCount(1);
    await likePostServerAction(postId);
  });
}`,
    },
    pitfalls: [
      'Không biết rằng useOptimistic chỉ có tác dụng trong khi có startTransition hoặc Form Action đang pending.',
      'Nhầm lẫn useOptimistic với useState thông thường.',
    ],
    followUpQuestions: [
      'Sự khác biệt giữa useOptimistic trong React 19 và cơ chế onMutate của TanStack Query?',
    ],
  },
  {
    id: 'int-07',
    category: 'react-19',
    level: 'senior',
    question:
      'React 19 đã thay đổi cách xử lý Form, Ref, và Context như thế nào? (So sánh với React 18)',
    interviewerIntent:
      'Đánh giá mức độ cập nhật công nghệ và khả năng viết code hiện đại, loại bỏ boilerplate cũ.',
    contextOrScenario:
      'Dự án nâng cấp từ React 18 lên React 19, team muốn loại bỏ forwardRef và useContext boilerplate.',
    expectedKeywords: [
      'ref as prop',
      'forwardref deprecated',
      'use() hook',
      'useactionstate',
      'cleanup ref functions',
    ],
    seniorAnswer: {
      summary:
        'React 19 mang đến 3 nâng cấp vượt bậc: (1) "ref" giờ đây là prop thông thường, không cần forwardRef(); (2) Hook use() có thể đọc Promise và Context ngay trong câu lệnh điều kiện if; (3) useActionState tự động hóa form submission và pending state.',
      deepDive:
        'Ngoài ra, Ref callback trong React 19 hỗ trợ trả về cleanup function (tương tự useEffect cleanup), giúp việc remove event listeners hoặc destroy 3rd party chart/canvas instances trở nên sạch sẽ và an toàn hơn bao giờ hết.',
      codeExample: `// 1. Ref as prop (Không cần forwardRef):
function CustomInput({ placeholder, ref }: { placeholder: string; ref: React.Ref<HTMLInputElement> }) {
  return <input ref={ref} placeholder={placeholder} />;
}

// 2. use() trong câu lệnh if:
function ConditionalTheme({ isDark }: { isDark: boolean }) {
  if (!isDark) return <div>Light</div>;
  const theme = use(ThemeContext); // ✅ Hợp lệ trong React 19!
  return <div>{theme.accent}</div>;
}`,
    },
    pitfalls: [
      'Vẫn tiếp tục bọc component bằng forwardRef trong React 19.',
      'Nghĩ rằng use() chỉ dùng cho Promise mà không biết nó thay thế hoàn hảo cho useContext.',
    ],
    followUpQuestions: [
      'React Compiler (React Forget) ảnh hưởng thế nào đến việc dùng useMemo và useCallback trong tương lai?',
    ],
  },

  // --- 3. STATE & TANSTACK QUERY V5 ---
  {
    id: 'int-04',
    category: 'state-data',
    level: 'senior',
    question:
      'Khi nào nên dùng TanStack Query v5 thay vì React Server Components (RSC) thuần túy để fetch dữ liệu trong Next.js?',
    interviewerIntent:
      'Kiểm tra khả năng lựa chọn công cụ đúng chỗ (Right Tool for the Right Job) trong kiến trúc Hybrid Fullstack.',
    contextOrScenario:
      'Team đang tranh cãi: Một số muốn bỏ hoàn toàn TanStack Query vì Next.js App Router đã có Server Components fetch trực tiếp.',
    expectedKeywords: [
      'polling',
      'infinite scroll',
      'real-time',
      'client cache',
      'optimistic mutations',
      'interactive dashboard',
    ],
    seniorAnswer: {
      summary:
        'RSC lý tưởng cho static/initial data, SEO, bảo mật credential và zero-bundle. TanStack Query v5 không thể thay thế trong các use case tương tác cao ở Client: Real-time polling, Infinite Scroll pagination, Window focus refetching, và Mutation cache phức tạp.',
      deepDive:
        'Mô hình kết hợp chuẩn (Hybrid Pattern): Dùng RSC để fetch dữ liệu ban đầu trên Server, sau đó hydrate vào TanStack Query (thông qua HydrationBoundary hoặc initialData) để Client tiếp tục quản lý các tương tác lọc (filter), phân trang và background sync.',
      codeExample: `// Server Component prefetch
const queryClient = getQueryClient();
await queryClient.prefetchQuery({ queryKey: ['posts'], queryFn: fetchPosts });

return (
  <HydrationBoundary state={dehydrate(queryClient)}>
    <InteractiveClientPostsList />
  </HydrationBoundary>
);`,
    },
    pitfalls: [
      'Tư duy cực đoan (Hoặc chỉ dùng 100% RSC, hoặc chỉ dùng 100% Client fetch).',
      'Không biết cách dùng HydrationBoundary giữa RSC và TanStack Query.',
    ],
    followUpQuestions: [
      'Tại sao cần getQueryClient() singleton trên Server Component thay vì khởi tạo new QueryClient() ở module scope?',
    ],
  },
  {
    id: 'int-08',
    category: 'state-data',
    level: 'middle',
    question:
      'Tại sao Zustand được ưa chuộng hơn Redux Toolkit trong các dự án Next.js hiện đại?',
    interviewerIntent:
      'Kiểm tra tư duy chọn thư viện State Management nhẹ, hiệu quả và tối ưu render.',
    contextOrScenario:
      'Thiết kế Global State cho User Settings, Modal UI state, và Shopping Cart.',
    expectedKeywords: [
      'zero boilerplate',
      'selective subscriptions',
      'bundle size (<1kb)',
      'no provider hell',
      'persist middleware',
    ],
    seniorAnswer: {
      summary:
        'Zustand cực nhẹ (<1KB so với >30KB của Redux), không cần bọc Provider ở root layout, cú pháp tinh gọn và hỗ trợ Selective Subscriptions (chỉ re-render component khi đúng slice state được chọn thay đổi).',
      deepDive:
        'Zustand hoạt động bên ngoài React render tree (external store) dựa trên useSyncExternalStore. Khi kết hợp với persist middleware, Zustand đồng bộ mượt mà vào LocalStorage mà không gây Hydration Mismatch nếu được cấu hình đúng.',
      codeExample: `// Zustand Store tinh gọn
export const useCartStore = create<CartState>()(
  persist(
    (set) => ({
      items: [],
      addItem: (item) => set((s) => ({ items: [...s.items, item] })),
      clearCart: () => set({ items: [] }),
    }),
    { name: 'cart-storage' }
  )
);

// Chỉ component nào đọc items mới re-render:
const itemsCount = useCartStore((s) => s.items.length);`,
    },
    pitfalls: [
      'Gọi `const store = useCartStore()` mà không dùng selector, làm component re-render mỗi khi BẤT KỲ state nào trong store thay đổi.',
    ],
    followUpQuestions: [
      'Làm thế nào để tránh Hydration Mismatch khi load state từ LocalStorage trong Zustand với Next.js SSR?',
    ],
  },

  // --- 4. PERFORMANCE & ARCHITECTURE ---
  {
    id: 'int-03',
    category: 'performance-optimization',
    level: 'senior',
    question:
      'Làm thế nào để phát hiện và ngăn chặn hiện tượng Waterfall Data Fetching trong Next.js App Router?',
    interviewerIntent:
      'Kiểm tra tư duy tối ưu hiệu năng I/O, sử dụng Promise.all, React Suspense và Parallel Data Fetching.',
    contextOrScenario:
      'Một trang Dashboard gọi 3 API tuần tự: User Profile (300ms) -> Recent Orders (400ms) -> Notifications (300ms), khiến tổng thời gian chờ lên tới 1000ms.',
    expectedKeywords: [
      'waterfall',
      'promise.all',
      'parallel data fetching',
      'suspense streaming',
      'independent components',
    ],
    seniorAnswer: {
      summary:
        'Waterfall xảy ra khi các async await bị lồng tuần tự. Khắc phục bằng 2 cách: (1) Gọi song song với Promise.all nếu data phụ thuộc cùng cấp, hoặc (2) Tách thành các Server Components độc lập được bọc bởi React Suspense để stream song song.',
      deepDive:
        'Cách tốt nhất trong App Router là di chuyển data fetching xuống component lá gần nơi sử dụng nhất (Colocate data fetching) và bọc mỗi component bằng <Suspense fallback={<Skeleton />}>. Next.js sẽ kích hoạt fetch song song đồng thời và stream UI từng phần về client ngay khi xong.',
      codeExample: `// ✅ Cách 1: Parallel Fetching
const [user, orders] = await Promise.all([getUser(), getOrders()]);

// ✅ Cách 2: Colocated Streaming Suspense (Tối ưu nhất)
export default function Dashboard() {
  return (
    <div>
      <Suspense fallback={<UserSkeleton />}><UserProfile /></Suspense>
      <Suspense fallback={<OrdersSkeleton />}><RecentOrders /></Suspense>
    </div>
  );
}`,
    },
    pitfalls: [
      'Gộp tất cả data fetching lên root page rồi await tuần tự từng hàm.',
      'Không phân biệt được khi nào dữ liệu có phụ thuộc nhau (dependent fetch) và khi nào độc lập.',
    ],
    followUpQuestions: [
      'Làm thế nào để deduplicate (chống gọi API trùng lặp) khi nhiều Server Component cùng gọi 1 hàm fetch trong cùng 1 request?',
    ],
  },
  {
    id: 'int-09',
    category: 'performance-optimization',
    level: 'senior',
    question:
      'INP (Interaction to Next Paint) là gì? Làm thế nào để tối ưu INP trong ứng dụng React 19 / Next.js?',
    interviewerIntent:
      'Kiểm tra kiến thức về Core Web Vitals mới (INP thay thế FID từ 2024) và cách tối ưu main thread responsiveness.',
    contextOrScenario:
      'Google Search Console báo trang web bị "Poor INP" (>500ms) khi người dùng gõ vào ô tìm kiếm hoặc click vào filter.',
    expectedKeywords: [
      'interaction to next paint',
      'main thread blocking',
      'starttransition',
      'usetransition',
      'long task (>50ms)',
      'web workers',
    ],
    seniorAnswer: {
      summary:
        'INP đo lường độ trễ từ lúc người dùng tương tác (click, gõ phím) đến khi khung hình tiếp theo được vẽ lên màn hình. Tối ưu bằng cách bọc các state update nặng trong startTransition, chia nhỏ Long Tasks, và giảm kích thước JavaScript hydration.',
      deepDive:
        'startTransition đánh dấu update là non-urgent (độ ưu tiên thấp). React sẽ cho phép trình duyệt ngắt (interrupt) quá trình render để phản hồi ngay các input của user, tránh làm đơ UI. Kết hợp với RSC để giảm tải JS hydration trên Main Thread.',
      codeExample: `const [isPending, startTransition] = useTransition();

const handleFilterChange = (value: string) => {
  // Input phản hồi tức thì:
  setText(value);

  // Lọc 10,000 items được xếp vào transition (không block main thread):
  startTransition(() => {
    setFilteredList(hugeList.filter(item => item.includes(value)));
  });
};`,
    },
    pitfalls: [
      'Nhầm lẫn INP với LCP hoặc FID.',
      'Sử dụng setTimeout để hoãn tác vụ thay vì dùng useTransition chuẩn của React.',
    ],
    followUpQuestions: ['useDeferredValue khác gì so với useTransition trong React?'],
  },
  {
    id: 'int-10',
    category: 'frontend-system-design',
    level: 'lead',
    question:
      'Thiết kế kiến trúc xác thực (Authentication & Authorization) cho hệ thống Next.js App Router quy mô Enterprise (Multi-tenant B2B)?',
    interviewerIntent:
      'Đánh giá tư duy thiết kế hệ thống cấp độ Lead/Architect: JWT vs Session, Middleware validation, Server Action security, RBAC.',
    contextOrScenario:
      'Hệ thống SaaS B2B yêu cầu xác thực SSO SAML / OAuth, bảo vệ Route nhạy cảm, cấp quyền RBAC theo Role (Admin, Editor, Viewer), và tránh rò rỉ token.',
    expectedKeywords: [
      'http-only secure cookie',
      'middleware session check',
      'server action authorization',
      'rbac',
      'csrf protection',
      'refresh token rotation',
    ],
    seniorAnswer: {
      summary:
        'Kiến trúc 3 lớp an toàn: (1) Lưu Session/JWT trong HttpOnly Secure SameSite Cookie; (2) Next.js Middleware kiểm tra session hợp lệ và tenant routing ở edge; (3) Bắt buộc phân quyền RBAC và tenant isolation tại từng Server Action / Data Access Layer.',
      deepDive:
        'Không bao giờ tin tưởng chỉ kiểm tra auth ở Middleware vì Server Actions có thể bị gọi độc lập. Nguyên tắc "Defense in Depth": Tạo hàm bọc `withAuth(action, allowedRoles)` để kiểm tra session và role ở Data Access Layer trước khi thực thi truy vấn DB.',
      codeExample: `// auth/safe-action.ts
export async function authenticatedAction<T>(
  allowedRoles: Role[],
  actionFn: (user: User) => Promise<T>
) {
  const session = await getSession();
  if (!session?.user) throw new Error('Unauthorized');
  if (!allowedRoles.includes(session.user.role)) throw new Error('Forbidden');
  
  return await actionFn(session.user);
}`,
    },
    pitfalls: [
      'Lưu JWT access token trong LocalStorage (dễ bị XSS đánh cắp).',
      'Chỉ check auth trong Middleware mà quên kiểm tra quyền trong Server Actions.',
      'Không xử lý CSRF hoặc thiếu tenant_id trong câu lệnh SQL/ORM (lỗi multi-tenant data leak).',
    ],
    followUpQuestions: [
      'Làm thế nào để handle Refresh Token Rotation trong Next.js App Router mà không bị race conditions khi nhiều request đồng thời xảy ra?',
    ],
  },
];

export const MOCK_BUG_HUNT_CHALLENGES: BugHuntChallenge[] = [
  {
    id: 'bug-01',
    title: 'Rò rỉ Database Query & Secret trong Client Component',
    level: 'middle',
    category: 'next-app-router',
    scenario:
      'Một lập trình viên mới chuyển từ Express sang Next.js cố gắng import trực tiếp kết nối DB vào component có "use client" để xử lý sự kiện click.',
    buggyCode: `'use client';

import { useState } from 'react';
import prisma from '@/lib/prisma'; // ❌ LỖI NGHIÊM TRỌNG!

export function UserCard({ userId }: { userId: string }) {
  const [user, setUser] = useState<any>(null);

  const handleFetch = async () => {
    // ❌ Client component không thể chạy mã Node.js DB driver
    const data = await prisma.user.findUnique({ where: { id: userId } });
    setUser(data);
  };

  return (
    <div className="p-4 border rounded-xl">
      <button onClick={handleFetch}>Load User Data</button>
      {user && <p>Name: {user.name}</p>}
    </div>
  );
}`,
    hints: [
      'Kiểm tra môi trường thực thi của Client Component (Browser vs Node.js).',
      'File có "use client" sẽ được bundle thành JS gửi về browser. Trình duyệt không thể mở kết nối TCP tới Database và sẽ làm lộ connection string bí mật.',
    ],
    bugExplanation:
      'Client Component được gửi về trình duyệt. Trình duyệt không có môi trường Node.js để chạy Prisma DB Driver. Việc import prisma trong client file sẽ gây lỗi build, hoặc nếu lọt ra ngoài sẽ làm lộ chuỗi kết nối Database trong file JavaScript của người dùng.',
    fixedCode: `// 1. Tạo Server Action: actions/user.ts
'use server';
import prisma from '@/lib/prisma';

export async function getUserAction(userId: string) {
  return await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, name: true, email: true }, // Chỉ trả về field cần thiết
  });
}

// 2. Gọi an toàn từ Client Component: UserCard.tsx
'use client';
import { useState } from 'react';
import { getUserAction } from '@/actions/user';

export function UserCard({ userId }: { userId: string }) {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const handleFetch = async () => {
    setLoading(true);
    const data = await getUserAction(userId);
    setUser(data);
    setLoading(false);
  };

  return (
    <div className="p-4 border rounded-xl">
      <button onClick={handleFetch} disabled={loading}>
        {loading ? 'Loading...' : 'Load User Data'}
      </button>
      {user && <p>Name: {user.name}</p>}
    </div>
  );
}`,
  },
  {
    id: 'bug-02',
    title: 'Hydration Mismatch do truy cập Browser API trong Render phase',
    level: 'middle',
    category: 'react-19',
    scenario:
      'Component hiển thị kích thước màn hình bị lỗi "Hydration failed because the initial UI does not match what was rendered on the server".',
    buggyCode: `'use client';

export function ScreenSizeBadge() {
  // ❌ BUG: window chỉ tồn tại ở browser, trên server window = undefined
  // Gây ra chênh lệch HTML giữa Server SSR và Client Hydration
  const isMobile = typeof window !== 'undefined' ? window.innerWidth < 768 : false;

  return (
    <span className="badge">
      Device: {isMobile ? 'Mobile View' : 'Desktop View'}
    </span>
  );
}`,
    hints: [
      'Server SSR luôn render ra "Desktop View" (vì typeof window === undefined).',
      'Trên mobile browser, Client render ra "Mobile View" -> Gây ra Hydration Mismatch error!',
    ],
    bugExplanation:
      'Mọi Client Component đều trải qua bước SSR trước. Khi server render ra một chuỗi HTML khác với những gì client render ở lần đầu, React sẽ ném lỗi Hydration Mismatch và buộc phải re-render phá hủy DOM.',
    fixedCode: `'use client';

import { useState, useEffect } from 'react';

export function ScreenSizeBadge() {
  const [isMobile, setIsMobile] = useState<boolean | null>(null);

  useEffect(() => {
    // ✅ Chỉ đọc window sau khi component đã mount an toàn ở client
    setIsMobile(window.innerWidth < 768);

    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  if (isMobile === null) {
    return <span className="badge animate-pulse">Detecting...</span>;
  }

  return (
    <span className="badge">
      Device: {isMobile ? 'Mobile View' : 'Desktop View'}
    </span>
  );
}`,
  },
  {
    id: 'bug-03',
    title: 'Infinite Re-render Loop do Object Dependency trong useEffect',
    level: 'junior',
    category: 'react-19',
    scenario:
      'Trang bị treo (100% CPU usage) và React báo lỗi "Maximum update depth exceeded" do useEffect chạy vô tận.',
    buggyCode: `'use client';

import { useState, useEffect } from 'react';

export function ProductDetails({ productId }: { productId: string }) {
  const [data, setData] = useState(null);
  
  // ❌ BUG: Object config được tạo mới ở mỗi render cycle
  // options reference thay đổi liên tục -> useEffect re-run vô tận!
  const options = { id: productId, detailed: true };

  useEffect(() => {
    fetchProduct(options).then((res) => setData(res));
  }, [options]); // ❌ options thay đổi tham chiếu (reference) ở mỗi render!

  return <div>{data ? data.name : 'Loading...'}</div>;
}`,
    hints: [
      'Trong JavaScript, `{ a: 1 } !== { a: 1 }` (so sánh theo tham chiếu reference).',
      'Mỗi lần setState(res), component re-render, tạo ra object `options` mới, kích hoạt useEffect chạy lại.',
    ],
    bugExplanation:
      'Object literal trong thân component được cấp phát vùng nhớ mới ở mỗi lần render. Khi truyền object vào dependency array của useEffect, React dùng `Object.is` để so sánh và thấy tham chiếu thay đổi, dẫn đến vòng lặp re-render vĩnh cửu.',
    fixedCode: `'use client';

import { useState, useEffect } from 'react';

export function ProductDetails({ productId }: { productId: string }) {
  const [data, setData] = useState(null);

  useEffect(() => {
    // ✅ Khai báo object bên trong effect hoặc chỉ truyền primitive value (productId) vào deps
    const options = { id: productId, detailed: true };
    fetchProduct(options).then((res) => setData(res));
  }, [productId]); // ✅ Primitive string so sánh theo giá trị

  return <div>{data ? data.name : 'Loading...'}</div>;
}`,
  },
  {
    id: 'bug-04',
    title: 'Stale Closure trong setInterval / Timer Hook',
    level: 'middle',
    category: 'react-19',
    scenario:
      'Đồng hồ đếm ngược (Countdown Timer) bị kẹt ở số 59 hoặc nhảy loạn số không chính xác.',
    buggyCode: `'use client';

import { useState, useEffect } from 'react';

export function Countdown() {
  const [count, setCount] = useState(60);

  useEffect(() => {
    const timer = setInterval(() => {
      // ❌ BUG: Stale Closure! count trong callback bị đóng băng ở giá trị ban đầu (60)
      setCount(count - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, []); // ❌ empty deps khiến interval callback luôn thấy count = 60

  return <div>Remaining: {count}s</div>;
}`,
    hints: [
      'setInterval được tạo 1 lần duy nhất lúc mount và bắt giữ (capture) biến `count` tại thời điểm đó.',
      'Mỗi giây, nó đều thực hiện `setCount(60 - 1)` nên count mãi mãi bằng 59!',
    ],
    bugExplanation:
      'Hiện tượng Stale Closure xảy ra khi một closure hàm callback giữ tham chiếu đến biến state cũ thay vì giá trị mới nhất. Giải pháp chuẩn là dùng functional update form: `setCount(prev => prev - 1)`.',
    fixedCode: `'use client';

import { useState, useEffect } from 'react';

export function Countdown() {
  const [count, setCount] = useState(60);

  useEffect(() => {
    const timer = setInterval(() => {
      // ✅ Functional update luôn nhận giá trị state mới nhất
      setCount((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return <div>Remaining: {count}s</div>;
}`,
  },
];
