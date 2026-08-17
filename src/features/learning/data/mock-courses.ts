import { LearningTrack } from '../types';

export const MOCK_LEARNING_TRACKS: LearningTrack[] = [
  {
    id: 'track-react-19',
    slug: 'react-19-mastery',
    title: 'React 19 Core & Actions',
    description:
      'Nắm vững các API mới nhất: useActionState, useOptimistic, use(), và Form Actions.',
    iconName: 'Atom',
    color: 'from-cyan-500 to-blue-600',
    totalLessons: 3,
    lessons: [
      {
        id: 'r19-01',
        slug: 'use-action-state-forms',
        title: 'Form Handling với useActionState',
        summary:
          'Loại bỏ boilerplate useState/isPending thủ công khi xử lý submit form và async actions.',
        durationMinutes: 10,
        level: 'beginner',
        tags: ['React 19', 'Forms', 'useActionState'],
        mentalModel:
          'Form action trong React 19 tự động quản lý pending state và lỗi trả về từ async function.',
        keyPoints: [
          'useActionState nhận vào async action và trả về [state, formAction, isPending].',
          'Tương thích mượt mà cả với React client thông thường và Next.js Server Actions.',
          'Hỗ trợ progressive enhancement mặc định khi dùng kết hợp HTML form action.',
          'Loại bỏ việc gọi e.preventDefault() và thủ công set loading flags.',
        ],
        codeRecipes: [
          {
            title: 'So sánh xử lý Form Submit',
            language: 'tsx',
            beforeCode: `// ❌ React 18: Quá nhiều boilerplate useState thủ công
const [name, setName] = useState('');
const [loading, setLoading] = useState(false);
const [error, setError] = useState<string | null>(null);

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setLoading(true);
  try {
    await updateProfile({ name });
  } catch (err: any) {
    setError(err.message);
  } finally {
    setLoading(false);
  }
};`,
            afterCode: `// ✅ React 19: useActionState tự động hóa toàn bộ
import { useActionState } from 'react';

export function ProfileForm() {
  const [state, formAction, isPending] = useActionState(
    async (previousState: any, formData: FormData) => {
      const result = await updateProfile(formData.get('name') as string);
      return result;
    },
    { success: false, error: null }
  );

  return (
    <form action={formAction} className="space-y-4">
      <input name="name" placeholder="Enter name" required />
      <button type="submit" disabled={isPending}>
        {isPending ? 'Updating...' : 'Save Changes'}
      </button>
      {state?.error && <p className="text-red-500">{state.error}</p>}
    </form>
  );
}`,
            takeaway:
              'Code ngắn hơn 50%, an toàn trước memory leak khi unmount trong lúc request đang bay.',
          },
        ],
        quizzes: [
          {
            id: 'q-r19-01-1',
            question:
              'Hook useActionState trong React 19 nhận tham số đầu tiên là gì và trả về những giá trị nào?',
            options: [
              {
                key: 'A',
                text: 'Nhận reducer fn, trả về [state, dispatch]',
              },
              {
                key: 'B',
                text: 'Nhận async action fn & initialState, trả về [state, formAction, isPending]',
              },
              {
                key: 'C',
                text: 'Nhận URL fetch, trả về [data, isLoading, error]',
              },
              {
                key: 'D',
                text: 'Nhận callback event, trả về [isPending, startTransition]',
              },
            ],
            correctAnswer: 'B',
            explanation:
              'useActionState(actionFn, initialState, permalink?) nhận action function và trả về bộ 3 [state, formAction, isPending].',
          },
          {
            id: 'q-r19-01-2',
            question:
              'Khi truyền formAction từ useActionState vào prop action của thẻ <form>, điều gì xảy ra nếu JavaScript chưa tải xong (Progressive Enhancement)?',
            options: [
              {
                key: 'A',
                text: 'Form sẽ bị vô hiệu hóa hoàn toàn và báo lỗi crash trên console',
              },
              {
                key: 'B',
                text: 'Trình duyệt sẽ submit form qua HTTP POST truyền thống tới Server Action endpoint',
              },
              {
                key: 'C',
                text: 'Form tự động chuyển thành JSON fetch ngầm',
              },
              {
                key: 'D',
                text: 'React ném lỗi Hydration Mismatch',
              },
            ],
            correctAnswer: 'B',
            explanation:
              'Khi dùng Server Action trong Next.js / React 19, prop action cho phép trình duyệt gửi standard form POST kể cả khi client JS chưa load xong.',
          },
          {
            id: 'q-r19-01-3',
            question:
              'Đoạn code sau có lỗi gì: const [state, action, isPending] = useActionState(async () => {...}) được đặt bên trong một câu lệnh if?',
            codeSnippet: `if (isLoggedIn) {\n  const [state, action] = useActionState(loginAction, null);\n}`,
            options: [
              {
                key: 'A',
                text: 'Vi phạm Rules of Hooks (không được gọi hook có điều kiện/conditional hook)',
              },
              {
                key: 'B',
                text: 'useActionState không hỗ trợ async function',
              },
              {
                key: 'C',
                text: 'loginAction phải được bọc trong useCallback',
              },
              {
                key: 'D',
                text: 'Không có lỗi, React 19 cho phép gọi hook trong if',
              },
            ],
            correctAnswer: 'A',
            explanation:
              'useActionState là một React Hook chuẩn, do đó vẫn tuân thủ Rules of Hooks: chỉ được gọi ở top-level của React Component, không được đặt trong if/for/nested functions.',
          },
        ],
      },
      {
        id: 'r19-02',
        slug: 'use-optimistic-updates',
        title: 'Optimistic UI với useOptimistic',
        summary:
          'Hiển thị phản hồi giao diện tức thì (Zero Latency) và tự động rollback khi Server Action lỗi.',
        durationMinutes: 12,
        level: 'intermediate',
        tags: ['React 19', 'Optimistic UI', 'UX'],
        mentalModel:
          'useOptimistic tạo ra state tạm thời để update UI ngay lập tức khi người dùng click, rồi tự động đồng bộ lại khi async task hoàn tất.',
        keyPoints: [
          'Chỉ hoạt động trong lúc Transition hoặc Action đang pending.',
          'Nhận vào: [actualState, updateFn(currentState, optimisticValue)].',
          'Nếu Server Action thất bại hoặc ném exception, UI tự động rollback về actualState mà không cần viết code xử lý rollback.',
        ],
        codeRecipes: [
          {
            title: 'Triển khai Like Button Optimistic',
            language: 'tsx',
            afterCode: `'use client';
import { useOptimistic, useTransition } from 'react';
import { toggleLikeAction } from '@/actions/posts';

export function LikeButton({ post }: { post: { id: string; likes: number; isLiked: boolean } }) {
  const [isPending, startTransition] = useTransition();
  const [optimisticState, setOptimisticState] = useOptimistic(
    post,
    (current, update: { isLiked: boolean }) => ({
      ...current,
      isLiked: update.isLiked,
      likes: update.isLiked ? current.likes + 1 : current.likes - 1,
    })
  );

  const handleClick = () => {
    startTransition(async () => {
      setOptimisticState({ isLiked: !optimisticState.isLiked });
      await toggleLikeAction(post.id);
    });
  };

  return (
    <button onClick={handleClick} className="flex items-center gap-1.5 text-sm font-semibold">
      <span>{optimisticState.isLiked ? '❤️' : '🤍'}</span>
      <span>{optimisticState.likes} likes</span>
    </button>
  );
}`,
            takeaway:
              'Người dùng thấy like tăng ngay trong 0ms. Trải nghiệm mượt mà như app native.',
          },
        ],
        quizzes: [
          {
            id: 'q-r19-02-1',
            question:
              'Điều kiện bắt buộc để useOptimistic hiển thị giá trị optimistic là gì?',
            options: [
              {
                key: 'A',
                text: 'Phải nằm trong một async Transition (startTransition) hoặc Form Action đang pending',
              },
              {
                key: 'B',
                text: 'Phải kết hợp với Redux Toolkit',
              },
              {
                key: 'C',
                text: 'Phải sử dụng Server Component',
              },
              {
                key: 'D',
                text: 'Phải có setTimeout tối thiểu 100ms',
              },
            ],
            correctAnswer: 'A',
            explanation:
              'useOptimistic chỉ kích hoạt hiển thị giá trị optimistic trong suốt thời gian mà Action/Transition đang xử lý (pending).',
          },
        ],
      },
      {
        id: 'r19-03',
        slug: 'use-hook-promises',
        title: 'Đọc Promise & Context với use() API',
        summary:
          'Sử dụng hook use() để đọc Promise và Context có điều kiện trong render cycle.',
        durationMinutes: 10,
        level: 'intermediate',
        tags: ['React 19', 'use()', 'Suspense'],
        mentalModel:
          'Khác với các Hook thông thường, use() có thể được gọi bên trong các câu lệnh điều kiện (if) và vòng lặp.',
        keyPoints: [
          'use(Promise) tích hợp trực tiếp với React Suspense và Error Boundaries.',
          'Có thể gọi use(Context) bên trong if statement thay cho useContext.',
          'Promise truyền vào use() phải được cache/tạo từ trước render để tránh infinite re-trigger.',
        ],
        codeRecipes: [
          {
            title: 'Đọc Context có điều kiện',
            language: 'tsx',
            afterCode: `'use client';
import { use } from 'react';
import { ThemeContext } from '@/providers/theme-provider';

export function ConditionalThemedBox({ showTheme }: { showTheme: boolean }) {
  if (!showTheme) {
    return <div>Default Neutral Theme</div>;
  }

  // ✅ Hợp lệ trong React 19: use() có thể gọi trong if!
  const theme = use(ThemeContext);
  return <div className={theme.mode}>Current: {theme.mode}</div>;
}`,
            takeaway:
              'use() mang lại sự linh hoạt tuyệt đối cho conditional context & async streaming.',
          },
        ],
        quizzes: [
          {
            id: 'q-r19-03-1',
            question:
              'Điểm khác biệt quan trọng nhất giữa use() và các Hook React truyền thống (như useState, useContext) là gì?',
            options: [
              {
                key: 'A',
                text: 'use() chỉ dùng được trong Server Component',
              },
              {
                key: 'B',
                text: 'use() có thể được gọi bên trong câu lệnh điều kiện (if) và vòng lặp',
              },
              {
                key: 'C',
                text: 'use() không trigger re-render khi giá trị thay đổi',
              },
              {
                key: 'D',
                text: 'use() tự động catch mọi lỗi runtime',
              },
            ],
            correctAnswer: 'B',
            explanation:
              'React 19 cho phép use() được gọi bên trong conditional branches (như sau câu lệnh if) và loops, khắc phục giới hạn nghiêm ngặt của useContext trước đây.',
          },
        ],
      },
    ],
  },
  {
    id: 'track-next-app-router',
    slug: 'nextjs-app-router',
    title: 'Next.js App Router Architecture',
    description:
      'Thấu suốt React Server Components (RSC), Client Boundaries, Nested Layouts & Streaming Suspense.',
    iconName: 'Layers',
    color: 'from-indigo-500 to-purple-600',
    totalLessons: 3,
    lessons: [
      {
        id: 'nr-01',
        slug: 'rsc-vs-client-components',
        title: 'Ranh giới RSC & Client Components',
        summary:
          'Hiểu sâu bản chất zero bundle của RSC và cách tổ chức component leaves chuẩn kiến trúc.',
        durationMinutes: 15,
        level: 'intermediate',
        tags: ['Next.js 15', 'RSC', 'Architecture'],
        mentalModel:
          'Server Component là mặc định (zero JS bundle). Chỉ gắn "use client" ở các component lá ngoài cùng khi cần state hoặc DOM events.',
        keyPoints: [
          'Server components chạy 100% trên server, có thể đọc DB / Secret Keys trực tiếp.',
          '"use client" chỉ định Client Boundary, không có nghĩa là file chỉ chạy ở browser (nó vẫn được SSR HTML lần đầu).',
          'Truyền Server Component vào Client Component thông qua React children prop (Composition Pattern).',
        ],
        codeRecipes: [
          {
            title: 'Tối ưu Bundle bằng Composition Pattern',
            language: 'tsx',
            afterCode: `// 1. ClientWrapper.tsx ('use client')
'use client';
import { useState } from 'react';

export function DialogWrapper({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <div>
      <button onClick={() => setOpen(!open)}>Toggle Dialog</button>
      {open && <div className="dialog-modal">{children}</div>}
    </div>
  );
}

// 2. Page.tsx (Server Component - 0 KB JS Bundle!)
import { DialogWrapper } from './ClientWrapper';
import { HeavyMarkdownViewer } from './HeavyViewer'; // 500KB lib

export default async function Page() {
  const content = await fetchMarkdownFromDB();
  return (
    <DialogWrapper>
      {/* HeavyMarkdownViewer vẫn là Server Component! */}
      <HeavyMarkdownViewer markdown={content} />
    </DialogWrapper>
  );
}`,
            takeaway:
              'HeavyMarkdownViewer không bị đóng gói vào bundle JS gửi về client, tiết kiệm 500KB bundle!',
          },
        ],
        quizzes: [
          {
            id: 'q-nr-01-1',
            question:
              'Phát biểu nào sau đây là ĐÚNG về chỉ thị "use client" trong Next.js App Router?',
            options: [
              {
                key: 'A',
                text: 'File có "use client" sẽ hoàn toàn không được render HTML trên server',
              },
              {
                key: 'B',
                text: '"use client" đánh dấu ranh giới (boundary) nơi mã nguồn sẽ được đóng gói vào client bundle và được hydrate trên browser',
              },
              {
                key: 'C',
                text: '"use client" cho phép truy cập trực tiếp process.env.DATABASE_URL bí mật',
              },
              {
                key: 'D',
                text: 'Bắt buộc phải đặt "use client" ở mọi file layout.tsx',
              },
            ],
            correctAnswer: 'B',
            explanation:
              '"use client" định nghĩa boundary giữa Server và Client modules. Các Client Component vẫn được pre-render thành HTML trên server ở lần tải đầu (SSR) trước khi hydrate trên browser.',
          },
          {
            id: 'q-nr-01-2',
            question:
              'Làm thế nào để đưa một Server Component nặng vào bên trong một Client Component tương tác mà KHÔNG biến Server Component đó thành Client Component?',
            options: [
              {
                key: 'A',
                text: 'Import trực tiếp Server Component vào bên trong file có "use client"',
              },
              {
                key: 'B',
                text: 'Truyền Server Component dưới dạng prop children (Composition Pattern)',
              },
              {
                key: 'C',
                text: 'Sử dụng dynamic import với ssr: false',
              },
              {
                key: 'D',
                text: 'Không có cách nào, mọi component con trong Client Component đều bắt buộc là Client Component',
              },
            ],
            correctAnswer: 'B',
            explanation:
              'Bằng cách truyền Server Component qua slot children, Server Component được render trên server và truyền kết quả (React Elements) vào Client Component mà không bị đưa vào client bundle.',
          },
        ],
      },
      {
        id: 'nr-02',
        slug: 'streaming-suspense-loading',
        title: 'Streaming HTML với Suspense & loading.tsx',
        summary:
          'Cải thiện chỉ số TTFB và First Contentful Paint bằng kỹ thuật streaming từng phần trang web.',
        durationMinutes: 12,
        level: 'intermediate',
        tags: ['Next.js 15', 'Streaming', 'Performance'],
        mentalModel:
          'Streaming chia nhỏ trang web thành các chunk và gửi ngay phần tĩnh về browser, các phần dữ liệu chậm sẽ stream về sau qua Suspense.',
        keyPoints: [
          'loading.tsx tự động bọc toàn bộ page.tsx trong một Suspense boundary.',
          'Sử dụng các Suspense boundary cục bộ nhỏ để ngăn một query chậm làm chậm cả trang.',
          'Kết hợp Skeleton Loader để tạo cảm giác phản hồi tức thì.',
        ],
        codeRecipes: [
          {
            title: 'Granular Suspense Streaming',
            language: 'tsx',
            afterCode: `import { Suspense } from 'react';
import { FastNav, SlowAnalytics, AnalyticsSkeleton } from '@/components';

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      {/* 1. Phần nhanh hiển thị ngay lập tức (0ms) */}
      <FastNav />

      {/* 2. Phần chậm stream về sau khi query xong mà không chặn trang */}
      <Suspense fallback={<AnalyticsSkeleton />}>
        <SlowAnalytics />
      </Suspense>
    </div>
  );
}`,
            takeaway:
              'Người dùng tương tác được ngay với giao diện mà không phải nhìn màn hình trắng chờ query chậm.',
          },
        ],
        quizzes: [
          {
            id: 'q-nr-02-1',
            question:
              'Lợi ích lớn nhất của React Streaming Suspense trong Next.js App Router là gì?',
            options: [
              {
                key: 'A',
                text: 'Giảm kích thước file hình ảnh tự động',
              },
              {
                key: 'B',
                text: 'Gửi HTML của các phần tử nhanh về browser ngay lập tức mà không phải chờ các async queries chậm',
              },
              {
                key: 'C',
                text: 'Thay thế hoàn toàn Redux và Zustand',
              },
              {
                key: 'D',
                text: 'Tự động sửa các lỗi runtime exception',
              },
            ],
            correctAnswer: 'B',
            explanation:
              'Streaming phá vỡ cơ chế "all-or-nothing" của SSR cũ, cho phép gửi các phần giao diện nhanh trước và stream các phần tử chậm vào đúng vị trí khi hoàn thành.',
          },
        ],
      },
      {
        id: 'nr-03',
        slug: 'server-actions-revalidation',
        title: 'Server Actions & Caching Strategies',
        summary:
          'Xử lý mutation an toàn với "use server", revalidatePath và revalidateTag.',
        durationMinutes: 14,
        level: 'advanced',
        tags: ['Next.js 15', 'Server Actions', 'Cache'],
        mentalModel:
          'Server Actions là các RPC (Remote Procedure Call) endpoint an toàn được tự động mã hóa dạng POST request.',
        keyPoints: [
          'Khai báo "use server" ở đầu file hoặc đầu hàm async.',
          'Luôn validate dữ liệu đầu vào với Zod trước khi thao tác DB.',
          'revalidateTag cho phép xóa cache chính xác theo nhóm tài nguyên thay vì reload toàn bộ route.',
        ],
        codeRecipes: [
          {
            title: 'Server Action chuẩn Clean Architecture',
            language: 'typescript',
            afterCode: `'use server';
import { z } from 'zod';
import { revalidateTag } from 'next/cache';
import { db } from '@/lib/db';

const CreatePostSchema = z.object({
  title: z.string().min(5),
  content: z.string().min(20),
});

export async function createPostAction(prevState: any, formData: FormData) {
  const validated = CreatePostSchema.safeParse({
    title: formData.get('title'),
    content: formData.get('content'),
  });

  if (!validated.success) {
    return { success: false, errors: validated.error.flatten().fieldErrors };
  }

  await db.post.create({ data: validated.data });
  
  // Invalidate cache chính xác theo tag
  revalidateTag('posts-feed');
  return { success: true };
}`,
            takeaway:
              'Type-safe, an toàn trước injection và tự động làm tươi dữ liệu trên toàn hệ thống.',
          },
        ],
        quizzes: [
          {
            id: 'q-nr-03-1',
            question:
              'Sự khác biệt chính giữa revalidatePath("/") và revalidateTag("posts") trong Next.js là gì?',
            options: [
              {
                key: 'A',
                text: 'revalidatePath chỉ chạy ở Client, revalidateTag chạy ở Server',
              },
              {
                key: 'B',
                text: 'revalidatePath xóa cache theo đường dẫn URL cụ thể, trong khi revalidateTag xóa cache của tất cả các fetch requests gắn tag đó bất kể ở URL nào',
              },
              {
                key: 'C',
                text: 'revalidateTag chỉ hỗ trợ database PostgreSQL',
              },
              {
                key: 'D',
                text: 'Không có sự khác biệt, hai hàm này là alias của nhau',
              },
            ],
            correctAnswer: 'B',
            explanation:
              'revalidateTag mang tính hạt nhân (fine-grained), giúp cập nhật chính xác dữ liệu dùng chung trên nhiều trang (ví dụ navbar badge, feed) mà không làm mất cache của toàn bộ page path.',
          },
        ],
      },
    ],
  },
  {
    id: 'track-state-query',
    slug: 'state-and-tanstack-query',
    title: 'State Architecture: TanStack Query v5 + Zustand',
    description:
      'Tách biệt rõ ràng Server State (Async cache, pagination) và Client UI State (Modals, filters, auth).',
    iconName: 'Zap',
    color: 'from-amber-500 to-orange-600',
    totalLessons: 2,
    lessons: [
      {
        id: 'sq-01',
        slug: 'server-vs-client-state',
        title: 'Phân định Server State vs Client State',
        summary:
          'Ngừng lưu trữ API data vào useState hay Redux; để TanStack Query quản lý cache và lifecycle.',
        durationMinutes: 12,
        level: 'intermediate',
        tags: ['TanStack Query v5', 'Zustand', 'State Management'],
        mentalModel:
          'Server State thuộc về database/server (cần cache, dedup, retry). Client State chỉ là UI state tạm thời (modal open, theme, active tab).',
        keyPoints: [
          'Dùng TanStack Query v5 cho Server State: useQuery, useMutation, queryClient.invalidateQueries.',
          'Dùng Zustand cho Client State: nhẹ, không boilerplate, dễ persist vào LocalStorage.',
          'Tránh đồng bộ thủ công từ Query sang Zustand bằng useEffect.',
        ],
        codeRecipes: [
          {
            title: 'Mẫu kết hợp TanStack Query & Zustand',
            language: 'tsx',
            afterCode: `// 1. Client State (Zustand)
export const useFilterStore = create((set) => ({
  search: '',
  category: 'all',
  setSearch: (search) => set({ search }),
}));

// 2. Server State (TanStack Query)
export function ProductsList() {
  const { search, category } = useFilterStore();
  
  // Tự động re-fetch khi filter trong Zustand thay đổi
  const { data, isLoading } = useQuery({
    queryKey: ['products', { search, category }],
    queryFn: () => fetchProducts({ search, category }),
    staleTime: 1000 * 60 * 5, // 5 phút cache
  });

  if (isLoading) return <Spinner />;
  return <div>{data?.map(p => <ProductCard key={p.id} item={p} />)}</div>;
}`,
            takeaway:
              'Kiến trúc phân tầng chuẩn: Filter điều khiển Query Key, TanStack Query tự động lo caching & deduping.',
          },
        ],
        quizzes: [
          {
            id: 'q-sq-01-1',
            question:
              'Antipattern (sai lầm phổ biến) nào sau đây thường xảy ra khi dùng TanStack Query với useState/Zustand?',
            options: [
              {
                key: 'A',
                text: 'Sử dụng queryKey dạng array',
              },
              {
                key: 'B',
                text: 'Dùng useEffect để copy data từ useQuery() vào useState/Zustand cục bộ',
              },
              {
                key: 'C',
                text: 'Thiết lập staleTime lớn hơn 0',
              },
              {
                key: 'D',
                text: 'Sử dụng QueryClientProvider ở layout root',
              },
            ],
            correctAnswer: 'B',
            explanation:
              'Copy data từ useQuery sang useState tạo ra 2 nguồn chân lý (dual source of truth), gây bug stale data và code thừa thãi. Hãy dùng trực tiếp data trả về từ useQuery().',
          },
        ],
      },
      {
        id: 'sq-02',
        slug: 'tanstack-query-optimistic-mutations',
        title: 'Optimistic Mutation với QueryClient',
        summary:
          'Xử lý cập nhật giao diện 0ms với onMutate, onError rollback và onSettled invalidation.',
        durationMinutes: 14,
        level: 'advanced',
        tags: ['TanStack Query v5', 'Mutations', 'Optimistic UI'],
        mentalModel:
          'onMutate hủy query đang chạy -> lưu snapshot cũ -> ghi dữ liệu giả lập vào cache -> onError khôi phục snapshot nếu thất bại.',
        keyPoints: [
          'await queryClient.cancelQueries({ queryKey }) để tránh race condition.',
          'Lưu previousData từ queryClient.getQueryData để rollback khi lỗi.',
          'Luôn gọi queryClient.invalidateQueries trong onSettled để đồng bộ state thật từ server.',
        ],
        codeRecipes: [
          {
            title: 'Full Optimistic Mutation Recipe',
            language: 'typescript',
            afterCode: `const mutation = useMutation({
  mutationFn: updateTodoApi,
  onMutate: async (newTodo) => {
    // 1. Hủy fetch đang chạy
    await queryClient.cancelQueries({ queryKey: ['todos'] });

    // 2. Lưu snapshot cũ để rollback
    const previousTodos = queryClient.getQueryData(['todos']);

    // 3. Ghi optimistic update
    queryClient.setQueryData(['todos'], (old: any) =>
      old.map((t: any) => (t.id === newTodo.id ? { ...t, ...newTodo } : t))
    );

    return { previousTodos };
  },
  onError: (err, newTodo, context) => {
    // 4. Rollback nếu lỗi
    queryClient.setQueryData(['todos'], context?.previousTodos);
  },
  onSettled: () => {
    // 5. Luôn làm tươi lại từ server
    queryClient.invalidateQueries({ queryKey: ['todos'] });
  },
});`,
            takeaway:
              'Mẫu chuẩn enterprise đảm bảo trải nghiệm 0ms và không bao giờ bị lệch dữ liệu khi mạng chập chờn.',
          },
        ],
        quizzes: [
          {
            id: 'q-sq-02-1',
            question:
              'Tại sao phải gọi await queryClient.cancelQueries() ngay đầu hàm onMutate?',
            options: [
              {
                key: 'A',
                text: 'Để đóng kết nối WebSocket',
              },
              {
                key: 'B',
                text: 'Để ngăn một fetch request cũ đang bay ghi đè lên dữ liệu optimistic vừa cập nhật (Race Condition)',
              },
              {
                key: 'C',
                text: 'Bắt buộc bởi TypeScript compiler',
              },
              {
                key: 'D',
                text: 'Để giải phóng RAM của trình duyệt',
              },
            ],
            correctAnswer: 'B',
            explanation:
              'Nếu không cancelQueries, một request GET cũ đang chạy có thể phản hồi sau khi bạn set optimistic data, làm UI bị nhấp nháy giật lùi về state cũ.',
          },
        ],
      },
    ],
  },
];
