'use client';

import * as React from 'react';
import {
  Download,
  Upload,
  FileJson,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
} from 'lucide-react';
import { useInterviewStore } from '../stores/use-interview-store';
import { MOCK_INTERVIEW_QUESTIONS } from '../data/mock-interview-bank';
import { validateQuestionBankJson, loadAllQuestionBanks } from '../data/json-loader';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';

interface JSONManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function JSONManagerModal({ isOpen, onClose }: JSONManagerModalProps) {
  const { customQuestions, importQuestionsFromJson, resetInterviewProgress } =
    useInterviewStore();
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [isExporting, setIsExporting] = React.useState(false);

  const [importStatus, setImportStatus] = React.useState<{
    type: 'success' | 'error' | null;
    message: string;
  }>({ type: null, message: '' });

  if (!isOpen) return null;

  const allActiveQuestions = [...MOCK_INTERVIEW_QUESTIONS, ...customQuestions];

  const handleExportCurrentBank = async () => {
    setIsExporting(true);
    try {
      const allBanks = await loadAllQuestionBanks();
      const map = new Map<string, typeof allBanks[number]>();
      for (const q of allBanks) map.set(q.id, q);
      for (const q of customQuestions) map.set(q.id, q);
      const exportData = Array.from(map.values());

      const dataStr =
        'data:text/json;charset=utf-8,' +
        encodeURIComponent(JSON.stringify(exportData, null, 2));
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute('href', dataStr);
      downloadAnchor.setAttribute(
        'download',
        `nextpro-interview-bank-${new Date().toISOString().slice(0, 10)}.json`
      );
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
    } finally {
      setIsExporting(false);
    }
  };

  const handleDownloadTemplate = () => {
    const templateData = [
      {
        id: 'custom-01',
        category: 'react-19',
        level: 'senior',
        question: 'Tiêu đề câu hỏi phỏng vấn của bạn?',
        interviewerIntent: 'Mục đích người phỏng vấn muốn kiểm tra...',
        contextOrScenario: 'Ngữ cảnh bài toán thực tế...',
        expectedKeywords: ['keyword1', 'keyword2', 'keyword3'],
        seniorAnswer: {
          summary: 'Tóm tắt câu trả lời 30s...',
          mentalModel: 'Mô hình tư duy cốt lõi để suy luận...',
          reasoningSteps: [
            'Bước 1: Xác định constraint và dữ kiện...',
            'Bước 2: Phân tích cơ chế nền tảng...',
            'Bước 3: Chọn giải pháp và failure path...',
            'Bước 4: Kiểm chứng bằng test/metric...',
          ],
          deepDive: 'Giải thích kiến trúc chi tiết...',
          tradeoffs: ['Đánh đổi 1...', 'Đánh đổi 2...', 'Đánh đổi 3...'],
          verification: [
            'Cách kiểm chứng bằng test...',
            'Metric production cần theo dõi...',
            'Failure scenario cần mô phỏng...',
          ],
          codeExample: '// Code minh họa\nconst example = true;',
          codeLanguage: 'typescript',
        },
        evaluationRubric: {
          baseline: ['Tín hiệu đạt yêu cầu tối thiểu...'],
          strong: ['Tín hiệu của Senior mạnh...'],
          exceptional: ['Tín hiệu Lead / Staff...'],
        },
        references: [
          {
            title: 'Nguồn đặc tả hoặc tài liệu chính thức',
            url: 'https://example.com/official-spec',
          },
        ],
        pitfalls: ['Bẫy 1...', 'Bẫy 2...'],
        followUpQuestions: ['Câu hỏi đào sâu 1?'],
      },
    ];

    const dataStr =
      'data:text/json;charset=utf-8,' +
      encodeURIComponent(JSON.stringify(templateData, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', 'interview-question-template.json');
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        const result = validateQuestionBankJson(parsed);

        if (!result.valid || !result.questions) {
          setImportStatus({
            type: 'error',
            message: result.error || 'File JSON không hợp lệ.',
          });
          return;
        }

        importQuestionsFromJson(result.questions);
        setImportStatus({
          type: 'success',
          message: `Đã import thành công ${result.questions.length} câu hỏi mới vào hệ thống!`,
        });
      } catch (err: unknown) {
        const errorMessage = err instanceof Error ? err.message : String(err);
        setImportStatus({
          type: 'error',
          message: `Lỗi đọc file JSON: ${errorMessage}`,
        });
      }
    };

    reader.readAsText(file);
  };

  return (
    <div className="animate-in fade-in-50 fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <Card className="glass-card max-h-[calc(100dvh-2rem)] w-full max-w-lg space-y-5 overflow-y-auto p-4 shadow-2xl sm:space-y-6 sm:p-6">
        <div className="border-border/60 flex items-center justify-between border-b pb-4">
          <div className="flex items-center gap-2">
            <FileJson className="text-primary h-5 w-5" />
            <h3 className="text-foreground text-lg font-bold">
              Quản Lý Import / Export JSON
            </h3>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose} className="h-8 w-8 p-0">
            ✕
          </Button>
        </div>

        {/* Current status stats */}
        <div className="border-border/40 bg-secondary/30 space-y-2 rounded-xl border p-4">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Ngân hàng mặc định:</span>
            <Badge variant="secondary">{MOCK_INTERVIEW_QUESTIONS.length} câu hỏi</Badge>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Câu hỏi đã import/tạo thêm:</span>
            <Badge variant="default">{customQuestions.length} câu hỏi</Badge>
          </div>
          <div className="border-border/40 flex items-center justify-between border-t pt-1 text-xs">
            <span className="text-foreground font-bold">Tổng cộng đang có:</span>
            <Badge variant="outline" className="text-primary font-bold">
              {allActiveQuestions.length} câu hỏi
            </Badge>
          </div>
        </div>

        {/* Actions grid */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Button
            onClick={handleExportCurrentBank}
            variant="outline"
            disabled={isExporting}
            className="w-full justify-center gap-2 text-xs leading-tight font-semibold whitespace-normal"
          >
            {isExporting ? (
              <RefreshCw className="h-4 w-4 animate-spin text-emerald-500" />
            ) : (
              <Download className="h-4 w-4 text-emerald-500" />
            )}
            <span>{isExporting ? 'Đang tải & xuất JSON...' : `Xuất Toàn Bộ JSON`}</span>
          </Button>

          <Button
            onClick={() => fileInputRef.current?.click()}
            className="w-full justify-center gap-2 text-xs font-semibold"
          >
            <Upload className="h-4 w-4" />
            <span>Import File JSON</span>
          </Button>

          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept=".json"
            className="hidden"
          />
        </div>

        {/* Download Template button */}
        <div className="flex flex-col gap-2 pt-2 sm:flex-row sm:items-center sm:justify-between">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDownloadTemplate}
            className="text-muted-foreground hover:text-foreground justify-start gap-1.5 text-xs sm:justify-center"
          >
            <Download className="h-3.5 w-3.5 shrink-0" />
            <span className="truncate">Tải file mẫu JSON chuẩn</span>
          </Button>

          {customQuestions.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                if (confirm('Bạn có chắc muốn xóa tất cả câu hỏi tự import?')) {
                  resetInterviewProgress();
                  setImportStatus({
                    type: 'success',
                    message: 'Đã reset ngân hàng câu hỏi về mặc định.',
                  });
                }
              }}
              className="text-destructive hover:text-destructive justify-start gap-1 text-xs sm:justify-center"
            >
              <RefreshCw className="h-3 w-3 shrink-0" />
              <span>Reset Custom</span>
            </Button>
          )}
        </div>

        {/* Feedback alert */}
        {importStatus.type && (
          <div
            className={`flex items-start gap-2.5 rounded-xl border p-3 text-xs ${
              importStatus.type === 'success'
                ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300'
                : 'border-destructive/30 bg-destructive/10 text-destructive'
            }`}
          >
            {importStatus.type === 'success' ? (
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
            ) : (
              <AlertCircle className="text-destructive mt-0.5 h-4 w-4 shrink-0" />
            )}
            <span>{importStatus.message}</span>
          </div>
        )}
      </Card>
    </div>
  );
}
