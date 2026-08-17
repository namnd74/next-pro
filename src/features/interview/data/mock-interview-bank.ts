import { InterviewQuestion, BugHuntChallenge } from '../types';
import { DEFAULT_JSON_QUESTION_BANKS } from './json-loader';

export const MOCK_INTERVIEW_QUESTIONS: InterviewQuestion[] = DEFAULT_JSON_QUESTION_BANKS;

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
