import type { TopicRoadmapSpec, RoadmapStageSpec, RoadmapEdgeSpec } from '../../types/roadmap';
import type { InterviewQuestion } from '../../types';
import { TOPIC_METADATA } from './topic-metadata';

export function matchesCategory(q: InterviewQuestion, category: string): boolean {
  if (category === 'all') return true;
  if (category === 'react') return q.category === 'react' || q.category === 'react-19';
  if (category === 'nextjs') return q.category === 'nextjs' || q.category === 'next-app-router';
  if (category === 'typescript')
    return q.category === 'typescript' || q.category === 'javascript-typescript';
  if (category === 'javascript')
    return (
      q.category === 'javascript' ||
      q.category === 'javascript-typescript' ||
      q.category === 'browser-runtime-workers'
    );
  if (category === 'system-design')
    return q.category === 'system-design' || q.category === 'frontend-system-design';
  if (category === 'backend-api')
    return q.category === 'backend-api' || q.category === 'backend-core';
  if (category === 'performance')
    return q.category === 'performance' || q.category === 'performance-optimization';
  if (category === 'testing-qa')
    return q.category === 'testing-qa' || (q.category as string) === 'qa-testing';
  return (q.category as string) === category;
}

export function buildAutoTopicRoadmap(
  topicId: string,
  allQuestions: InterviewQuestion[]
): TopicRoadmapSpec | undefined {
  const matchingQuestions = allQuestions.filter((q) => matchesCategory(q, topicId));
  if (matchingQuestions.length === 0) return undefined;

  const meta = TOPIC_METADATA[topicId];
  const title = meta?.title || `Lộ Trình Làm Chủ ${topicId.toUpperCase()}`;
  const tagline =
    meta?.tagline ||
    `Lộ trình chinh phục tri thức ${topicId} từ nguyên lý cốt lõi đến các bài toán thực chiến.`;

  const questionIds = matchingQuestions.map((q) => q.id);
  const total = questionIds.length;
  const countPerStage = Math.max(1, Math.floor(total / 5));

  const defaultTitles: [string, string, string, string, string] = [
    'Trạm 1: Nền Tảng & Cú Pháp Cốt Lõi',
    'Trạm 2: Cơ Chế Vận Hành & Kỹ Thuật Trọng Tâm',
    'Trạm 3: Kiến Trúc & Xử Lý Dữ Liệu',
    'Trạm 4: Tối Ưu Hiệu Năng & Độ Tin Cậy',
    'Trạm 5: Bẫy Thực Chiến & Production Patterns',
  ];

  const defaultGoals: [string, string, string, string, string] = [
    'Làm chủ cú pháp nền tảng, kiểu dữ liệu, quy ước cốt lõi và các nguyên lý cơ sở.',
    'Hiểu thấu đáo vòng đời, cơ chế thực thi bên dưới và cách thức hoạt động của runtime.',
    'Xây dựng kiến trúc mô-đun hóa, luồng dữ liệu chuẩn mực và giải quyết bài toán phức tạp.',
    'Tối ưu hóa tài nguyên phần cứng, kiểm soát bộ nhớ, độ trễ và khả năng mở rộng.',
    'Phòng tránh các bẫy tiềm ẩn, xử lý sự cố thực tế và các mô hình thiết kế chuẩn Big Tech.',
  ];

  const stages: RoadmapStageSpec[] = [1, 2, 3, 4, 5].map((step) => {
    const start = (step - 1) * countPerStage;
    const end = step === 5 ? total : step * countPerStage;
    const stageQuestionIds = questionIds.slice(start, end);
    const stageTitle = meta?.stageTitles?.[step - 1] || defaultTitles[step - 1];
    const stageGoal = meta?.stageGoals?.[step - 1] || defaultGoals[step - 1];

    return {
      id: `${topicId}-stage-${step}`,
      stepNumber: step,
      title: stageTitle,
      shortGoal: stageGoal,
      visualAnchorQuestionId: stageQuestionIds[0],
      questionIds: stageQuestionIds,
    };
  });

  const edges: RoadmapEdgeSpec[] = [
    { from: stages[0].id, to: stages[1].id, label: 'Nền tảng' },
    { from: stages[0].id, to: stages[2].id, label: 'Phát triển' },
    { from: stages[1].id, to: stages[3].id, label: 'Hội tụ' },
    { from: stages[2].id, to: stages[3].id, label: 'Hội tụ' },
    { from: stages[3].id, to: stages[4].id, label: 'Thực chiến' },
  ];

  const mindmapCode = `flowchart LR
    S1["📍 ${stages[0].title}"]
    S2["⚙️ ${stages[1].title}"]
    S3["⚡ ${stages[2].title}"]
    S4["🔍 ${stages[3].title}"]
    S5["🚀 ${stages[4].title}"]
    S1 ==> S2 ==> S3 ==> S4 ==> S5`;

  return {
    topicId,
    title,
    tagline,
    mindmapCode,
    stages,
    edges,
  };
}
