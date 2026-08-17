'use client';

import * as React from 'react';
import {
  Play,
  RotateCcw,
  Clock,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Trophy,
  Send,
  Lightbulb,
} from 'lucide-react';
import { MOCK_INTERVIEW_QUESTIONS } from '../data/mock-interview-bank';
import { MockInterviewResult } from '../types';
import { useInterviewStore } from '../stores/use-interview-store';
import { RichTextEditor } from './rich-text-editor';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';

export function MockSimulator() {
  const { saveMockResult, customQuestions } = useInterviewStore();

  const allQuestions = React.useMemo(() => {
    return [...MOCK_INTERVIEW_QUESTIONS, ...customQuestions];
  }, [customQuestions]);

  const [selectedQuestionId, setSelectedQuestionId] = React.useState<string>(
    allQuestions[0]?.id || MOCK_INTERVIEW_QUESTIONS[0].id
  );
  const [userAnswer, setUserAnswer] = React.useState('');
  const [isRecording, setIsRecording] = React.useState(false);
  const [timeSeconds, setTimeSeconds] = React.useState(0);
  const [evaluatedResult, setEvaluatedResult] =
    React.useState<MockInterviewResult | null>(null);

  const activeQuestion =
    allQuestions.find((q) => q.id === selectedQuestionId) ||
    allQuestions[0] ||
    MOCK_INTERVIEW_QUESTIONS[0];

  // Timer effect
  React.useEffect(() => {
    let interval: ReturnType<typeof setInterval> | null = null;
    if (isRecording) {
      interval = setInterval(() => {
        setTimeSeconds((prev) => prev + 1);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRecording]);

  const handleStartSession = () => {
    setUserAnswer('');
    setEvaluatedResult(null);
    setTimeSeconds(0);
    setIsRecording(true);
  };

  const handleEvaluate = () => {
    setIsRecording(false);

    const lowerAnswer = userAnswer.toLowerCase();
    const matchedKeywords = activeQuestion.expectedKeywords.filter((kw) =>
      lowerAnswer.includes(kw.toLowerCase())
    );

    // Calculate score based on keyword match ratio + answer length completeness
    const keywordRatio =
      activeQuestion.expectedKeywords.length > 0
        ? matchedKeywords.length / activeQuestion.expectedKeywords.length
        : 0;

    const wordCount = userAnswer.trim().split(/\s+/).filter(Boolean).length;
    const lengthBonus = Math.min(wordCount / 30, 1) * 20; // Up to 20 pts for thoroughness
    const baseScore = Math.round(keywordRatio * 80 + lengthBonus);
    const finalScore = Math.min(Math.max(baseScore, 10), 100);

    let feedback = '';
    if (finalScore >= 80) {
      feedback =
        'Xuất sắc! Câu trả lời của bạn đã bao quát gần như toàn bộ các thuật ngữ và nguyên lý kiến trúc cốt lõi.';
    } else if (finalScore >= 50) {
      feedback =
        'Khá tốt! Bạn đã nắm được ý chính nhưng nên bổ sung thêm các từ khóa kỹ thuật chuyên sâu và cơ chế hoạt động chi tiết.';
    } else {
      feedback =
        'Cần bổ sung thêm! Câu trả lời còn ngắn hoặc chưa đề cập đến các khái niệm mấu chốt của câu hỏi.';
    }

    const result: MockInterviewResult = {
      id: `mock-${Date.now()}`,
      questionId: activeQuestion.id,
      questionText: activeQuestion.question,
      userAnswer,
      timeSpentSeconds: timeSeconds,
      matchedKeywords,
      totalExpectedKeywords: activeQuestion.expectedKeywords.length,
      score: finalScore,
      evaluatedAt: new Date().toISOString(),
      feedback,
    };

    saveMockResult(result);
    setEvaluatedResult(result);
  };

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainingSecs = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${remainingSecs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-6">
      {/* Question Selector Bar */}
      <Card className="glass-card relative z-20 p-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-muted-foreground">
              Select Question:
            </span>
            <Select
              value={selectedQuestionId}
              onValueChange={(val) => {
                setSelectedQuestionId(val);
                setEvaluatedResult(null);
                setUserAnswer('');
                setIsRecording(false);
                setTimeSeconds(0);
              }}
              options={allQuestions.map((q, idx) => ({
                value: q.id,
                label: `#${idx + 1} - [${q.level.toUpperCase()}] ${q.question.slice(0, 55)}...`,
              }))}
              className="max-w-md"
            />
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              const randomIndex = Math.floor(Math.random() * allQuestions.length);
              setSelectedQuestionId(allQuestions[randomIndex].id);
              setEvaluatedResult(null);
              setUserAnswer('');
              setIsRecording(false);
              setTimeSeconds(0);
            }}
            className="gap-1.5 text-xs"
          >
            <Sparkles className="h-3 w-3 text-primary" />
            Random Question
          </Button>
        </div>
      </Card>

      {/* Simulator Workspace */}
      <Card className="glass-card space-y-6 p-6 sm:p-8">
        {/* Active Question Banner */}
        <div className="space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Badge variant="default" className="text-[10px] uppercase">
                {activeQuestion.level} Level
              </Badge>
              <Badge variant="outline" className="text-[10px]">
                #{activeQuestion.category}
              </Badge>
            </div>

            <div className="flex items-center gap-2 font-mono text-xs font-bold text-foreground">
              <Clock className="h-4 w-4 text-primary" />
              <span>{formatTime(timeSeconds)}</span>
            </div>
          </div>

          <h2 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">
            {activeQuestion.question}
          </h2>

          {activeQuestion.contextOrScenario && (
            <p className="rounded-xl border border-border/40 bg-secondary/50 p-3 text-xs text-muted-foreground">
              <span className="font-semibold text-foreground">Scenario: </span>
              {activeQuestion.contextOrScenario}
            </p>
          )}
        </div>

        {/* Rich Text Editor Area */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-medium text-muted-foreground">
            <span>Your Technical Response (Rich Text Editor):</span>
          </div>

          <RichTextEditor
            value={userAnswer}
            onChange={setUserAnswer}
            disabled={!isRecording && evaluatedResult !== null}
            placeholder={
              isRecording
                ? 'Gõ câu trả lời phỏng vấn của bạn tại đây... Hãy giải thích súc tích trong 30 giây đầu và đào sâu vào cơ chế hoạt động bên dưới...'
                : 'Nhấn "Start Mock Session" bên dưới để bắt đầu bấm giờ và trả lời câu hỏi...'
            }
          />
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
          {!isRecording && !evaluatedResult && (
            <Button
              onClick={handleStartSession}
              size="lg"
              className="gap-2 font-semibold shadow-md shadow-primary/20"
            >
              <Play className="h-4 w-4" />
              <span>Start Mock Session (Bắt đầu)</span>
            </Button>
          )}

          {isRecording && (
            <div className="flex w-full items-center gap-3 sm:w-auto">
              <Button
                onClick={handleEvaluate}
                disabled={userAnswer.trim().length < 10}
                className="flex-1 gap-2 font-semibold shadow-md shadow-primary/20 sm:flex-none"
              >
                <Send className="h-4 w-4" />
                <span>Submit & Evaluate (Chấm Điểm)</span>
              </Button>

              <Button
                variant="outline"
                onClick={handleStartSession}
                className="gap-1.5 text-xs"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                <span>Restart</span>
              </Button>
            </div>
          )}

          {evaluatedResult && (
            <Button
              variant="outline"
              onClick={handleStartSession}
              className="gap-1.5 text-xs"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>Thử lại câu này</span>
            </Button>
          )}
        </div>

        {/* Real-time Senior Evaluation Result */}
        {evaluatedResult && (
          <div className="space-y-4 rounded-2xl border border-primary/30 bg-primary/5 p-6 duration-300 animate-in fade-in-50">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/50 pb-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-md">
                  <Trophy className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-foreground">
                    Senior Candidate Assessment
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Thời gian trả lời: {formatTime(evaluatedResult.timeSpentSeconds)}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Badge
                  variant={evaluatedResult.score >= 70 ? 'default' : 'destructive'}
                  className="px-3 py-1 text-sm font-bold"
                >
                  Score: {evaluatedResult.score}/100
                </Badge>
              </div>
            </div>

            <p className="text-xs font-medium text-foreground">
              {evaluatedResult.feedback}
            </p>

            {/* Keywords Match Breakdown */}
            <div className="space-y-2 pt-2">
              <span className="text-xs font-bold text-foreground">
                Key Concept Checklist:
              </span>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                {activeQuestion.expectedKeywords.map((kw, idx) => {
                  const isMatched = evaluatedResult.matchedKeywords.includes(kw);
                  return (
                    <div
                      key={idx}
                      className={`flex items-center gap-2 rounded-lg border p-2 text-xs font-medium ${
                        isMatched
                          ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300'
                          : 'border-border/50 bg-secondary/40 text-muted-foreground line-through'
                      }`}
                    >
                      {isMatched ? (
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                      ) : (
                        <AlertCircle className="h-3.5 w-3.5 text-muted-foreground" />
                      )}
                      <span>{kw}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Model Senior Answer for Comparison */}
            <div className="mt-4 space-y-2 rounded-xl border border-border/80 bg-background/80 p-4">
              <div className="flex items-center gap-2 text-xs font-bold text-primary">
                <Lightbulb className="h-4 w-4" />
                <span>Mẫu câu trả lời chuẩn Senior để tham khảo:</span>
              </div>
              <p className="text-xs leading-relaxed text-muted-foreground">
                {activeQuestion.seniorAnswer.summary}
              </p>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
