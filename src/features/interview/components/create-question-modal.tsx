'use client';

import * as React from 'react';
import { PlusCircle, Save, Sparkles } from 'lucide-react';
import { useInterviewStore } from '../stores/use-interview-store';
import { InterviewQuestion, InterviewCategory, InterviewLevel } from '../types';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Select } from '@/components/ui/select';

interface CreateQuestionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CreateQuestionModal({ isOpen, onClose }: CreateQuestionModalProps) {
  const { addCustomQuestion } = useInterviewStore();

  const [category, setCategory] = React.useState<InterviewCategory>('react-19');
  const [level, setLevel] = React.useState<InterviewLevel>('senior');
  const [question, setQuestion] = React.useState('');
  const [interviewerIntent, setInterviewerIntent] = React.useState('');
  const [contextOrScenario, setContextOrScenario] = React.useState('');
  const [keywordsText, setKeywordsText] = React.useState('');
  const [summary, setSummary] = React.useState('');
  const [deepDive, setDeepDive] = React.useState('');
  const [codeExample, setCodeExample] = React.useState('');
  const [pitfallsText, setPitfallsText] = React.useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim() || !summary.trim()) return;

    const keywords = keywordsText
      .split(',')
      .map((k) => k.trim())
      .filter(Boolean);

    const pitfalls = pitfallsText
      .split('\n')
      .map((p) => p.trim())
      .filter(Boolean);

    const newQuestion: InterviewQuestion = {
      id: `custom-${Date.now()}`,
      category: category === 'all' ? 'react-19' : category,
      level,
      question: question.trim(),
      interviewerIntent: interviewerIntent.trim() || 'Đánh giá kiến thức ứng viên',
      contextOrScenario: contextOrScenario.trim() || undefined,
      expectedKeywords: keywords.length > 0 ? keywords : ['react', 'nextjs'],
      seniorAnswer: {
        summary: summary.trim(),
        deepDive: deepDive.trim() || summary.trim(),
        codeExample: codeExample.trim() || undefined,
      },
      pitfalls: pitfalls.length > 0 ? pitfalls : ['Không hiểu rõ bản chất'],
      followUpQuestions: ['Làm thế nào để đo lường hiệu năng của giải pháp này?'],
    };

    addCustomQuestion(newQuestion);
    onClose();
  };

  return (
    <div className="animate-in fade-in-50 fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <Card className="glass-card max-h-[90vh] w-full max-w-2xl space-y-6 overflow-y-auto p-6 shadow-2xl">
        <div className="border-border/60 flex items-center justify-between border-b pb-4">
          <div className="flex items-center gap-2">
            <PlusCircle className="text-primary h-5 w-5" />
            <h3 className="text-foreground text-lg font-bold">
              Soạn Câu Hỏi Phỏng Vấn Mới
            </h3>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose} className="h-8 w-8 p-0">
            ✕
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="text-muted-foreground mb-1 block font-semibold">
                Chủ đề (Category):
              </label>
              <Select
                value={category}
                onValueChange={(val) => setCategory(val as InterviewCategory)}
                options={[
                  { value: 'react-19', label: 'React 19 Core' },
                  { value: 'next-app-router', label: 'Next.js App Router' },
                  { value: 'javascript-typescript', label: 'JavaScript / TypeScript' },
                  {
                    value: 'browser-runtime-workers',
                    label: 'Browser Runtime & Workers',
                  },
                  { value: 'state-data', label: 'State & Data Query' },
                  { value: 'performance-optimization', label: 'Performance & Security' },
                  { value: 'frontend-system-design', label: 'System Design' },
                ]}
              />
            </div>

            <div>
              <label className="text-muted-foreground mb-1 block font-semibold">
                Trình độ (Level):
              </label>
              <Select
                value={level}
                onValueChange={(val) => setLevel(val as InterviewLevel)}
                options={[
                  { value: 'junior', label: 'Junior' },
                  { value: 'middle', label: 'Middle' },
                  { value: 'senior', label: 'Senior' },
                  { value: 'lead', label: 'Lead' },
                ]}
              />
            </div>
          </div>

          <div>
            <label className="text-muted-foreground mb-1 block font-semibold">
              Câu hỏi phỏng vấn (*):
            </label>
            <input
              type="text"
              required
              placeholder="VD: Hãy giải thích cơ chế Hydration Mismatch trong Next.js App Router?"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              className="border-input bg-background w-full rounded-xl border p-2.5 font-medium"
            />
          </div>

          <div>
            <label className="text-muted-foreground mb-1 block font-semibold">
              Ý đồ tuyển dụng (Interviewer Intent):
            </label>
            <input
              type="text"
              placeholder="VD: Kiểm tra mức độ am hiểu về SSR render cycle..."
              value={interviewerIntent}
              onChange={(e) => setInterviewerIntent(e.target.value)}
              className="border-input bg-background w-full rounded-xl border p-2.5"
            />
          </div>

          <div>
            <label className="text-muted-foreground mb-1 block font-semibold">
              Kịch bản / Scenario (Nếu có):
            </label>
            <input
              type="text"
              placeholder="VD: Trang sản phẩm bị giật lag khi chuyển tab..."
              value={contextOrScenario}
              onChange={(e) => setContextOrScenario(e.target.value)}
              className="border-input bg-background w-full rounded-xl border p-2.5"
            />
          </div>

          <div>
            <label className="text-muted-foreground mb-1 block font-semibold">
              Từ khóa kỳ vọng (phẩy phân cách):
            </label>
            <input
              type="text"
              placeholder="VD: hydration, SSR, window API, useEffect"
              value={keywordsText}
              onChange={(e) => setKeywordsText(e.target.value)}
              className="border-input bg-background w-full rounded-xl border p-2.5"
            />
          </div>

          <div className="border-border/40 space-y-2 border-t pt-2">
            <span className="text-primary flex items-center gap-1 font-bold">
              <Sparkles className="h-3.5 w-3.5" />
              Câu trả lời Senior chuẩn:
            </span>

            <div>
              <label className="text-muted-foreground mb-1 block font-semibold">
                Tóm tắt 30 giây Pitch (*):
              </label>
              <textarea
                required
                rows={3}
                placeholder="Câu trả lời súc tích trong 30 giây..."
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
                className="border-input bg-background w-full rounded-xl border p-2.5"
              />
            </div>

            <div>
              <label className="text-muted-foreground mb-1 block font-semibold">
                Phân tích sâu (Deep Dive):
              </label>
              <textarea
                rows={3}
                placeholder="Đào sâu nguyên lý hoạt động bên dưới..."
                value={deepDive}
                onChange={(e) => setDeepDive(e.target.value)}
                className="border-input bg-background w-full rounded-xl border p-2.5"
              />
            </div>

            <div>
              <label className="text-muted-foreground mb-1 block font-semibold">
                Mã nguồn ví dụ (Code Example TSX):
              </label>
              <textarea
                rows={3}
                placeholder="// Viết code minh họa..."
                value={codeExample}
                onChange={(e) => setCodeExample(e.target.value)}
                className="border-input bg-background w-full rounded-xl border p-2.5 font-mono"
              />
            </div>
          </div>

          <div>
            <label className="text-muted-foreground mb-1 block font-semibold">
              Các bẫy / sai lầm thường gặp (mỗi dòng 1 bẫy):
            </label>
            <textarea
              rows={2}
              placeholder="- Nhầm lẫn giữa SSR và Hydration&#10;- Gọi window ở top level"
              value={pitfallsText}
              onChange={(e) => setPitfallsText(e.target.value)}
              className="border-input bg-background w-full rounded-xl border p-2.5"
            />
          </div>

          <div className="border-border/60 flex justify-end gap-2 border-t pt-3">
            <Button type="button" variant="outline" onClick={onClose}>
              Hủy
            </Button>
            <Button type="submit" className="gap-1.5 font-semibold">
              <Save className="h-4 w-4" />
              Lưu Câu Hỏi Mới
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
