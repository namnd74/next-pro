'use client';

import * as React from 'react';
import {
  XCircle,
  HelpCircle,
  Sparkles,
  Trophy,
  RotateCcw,
  CheckCircle2,
} from 'lucide-react';
import { QuizQuestion } from '../types';
import { useLearningStore } from '../stores/use-learning-store';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface BlitzQuizProps {
  lessonId: string;
  quizzes: QuizQuestion[];
  onQuizComplete?: () => void;
}

export function BlitzQuiz({ lessonId, quizzes, onQuizComplete }: BlitzQuizProps) {
  const { quizScores, saveQuizResult } = useLearningStore();

  const [currentAnswers, setCurrentAnswers] = React.useState<Record<string, string>>({});
  const [isSubmitted, setIsSubmitted] = React.useState(false);

  const existingResult = quizScores[lessonId];

  React.useEffect(() => {
    if (existingResult?.answers) {
      setCurrentAnswers(existingResult.answers);
      setIsSubmitted(true);
    } else {
      setCurrentAnswers({});
      setIsSubmitted(false);
    }
  }, [lessonId, existingResult]);

  const handleSelectOption = (questionId: string, optionKey: string) => {
    if (isSubmitted) return;
    setCurrentAnswers((prev) => ({
      ...prev,
      [questionId]: optionKey,
    }));
  };

  const handleGradeQuiz = () => {
    let score = 0;
    quizzes.forEach((q) => {
      if (currentAnswers[q.id] === q.correctAnswer) {
        score += 1;
      }
    });

    const passed = score >= Math.ceil(quizzes.length * 0.7); // 70%+ pass

    saveQuizResult(lessonId, {
      score,
      total: quizzes.length,
      passed,
      answeredAt: new Date().toISOString(),
      answers: currentAnswers,
    });

    setIsSubmitted(true);
    if (passed) {
      onQuizComplete?.();
    }
  };

  const handleRetake = () => {
    setCurrentAnswers({});
    setIsSubmitted(false);
  };

  const answeredCount = Object.keys(currentAnswers).length;
  const isAllAnswered = answeredCount === quizzes.length;

  const currentScore = React.useMemo(() => {
    return quizzes.reduce((acc, q) => {
      return acc + (currentAnswers[q.id] === q.correctAnswer ? 1 : 0);
    }, 0);
  }, [quizzes, currentAnswers]);

  const isPassed = currentScore >= Math.ceil(quizzes.length * 0.7);

  return (
    <Card className="glass-card border-primary/20 overflow-hidden p-6 shadow-md">
      {/* Header */}
      <div className="border-border/50 flex flex-col gap-3 border-b pb-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-primary/10 text-primary flex h-10 w-10 items-center justify-center rounded-xl">
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-foreground text-base font-bold">60s Rapid Blitz Quiz</h3>
            <p className="text-muted-foreground text-xs">
              Test your understanding with 3 rapid questions (Pass mark: 70%+)
            </p>
          </div>
        </div>

        {isSubmitted && (
          <div className="flex items-center gap-2">
            <Badge
              variant={isPassed ? 'default' : 'destructive'}
              className="gap-1.5 px-3 py-1 text-xs font-semibold"
            >
              {isPassed ? (
                <Trophy className="h-3.5 w-3.5" />
              ) : (
                <XCircle className="h-3.5 w-3.5" />
              )}
              <span>
                Score: {currentScore}/{quizzes.length}{' '}
                {isPassed ? '(PASSED)' : '(NEEDS REVIEW)'}
              </span>
            </Badge>

            <Button
              variant="outline"
              size="sm"
              onClick={handleRetake}
              className="gap-1 text-xs"
            >
              <RotateCcw className="h-3 w-3" />
              Retake
            </Button>
          </div>
        )}
      </div>

      {/* Questions list */}
      <div className="space-y-6 pt-6">
        {quizzes.map((q, qIndex) => {
          const userAnswer = currentAnswers[q.id];
          const isCorrect = userAnswer === q.correctAnswer;

          return (
            <div
              key={q.id}
              className={`rounded-2xl border p-4 transition-all ${
                isSubmitted
                  ? isCorrect
                    ? 'border-emerald-500/30 bg-emerald-500/5'
                    : 'border-destructive/30 bg-destructive/5'
                  : 'border-border/60 bg-background/50'
              }`}
            >
              {/* Question Title */}
              <div className="flex items-start gap-2.5">
                <span className="bg-secondary text-foreground flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[11px] font-bold">
                  {qIndex + 1}
                </span>
                <div className="flex-1 space-y-2">
                  <p className="text-foreground text-sm leading-snug font-semibold">
                    {q.question}
                  </p>

                  {q.codeSnippet && (
                    <pre className="border-border/80 overflow-x-auto rounded-xl border bg-slate-950 p-3 text-xs text-slate-100 dark:bg-black/60">
                      <code>{q.codeSnippet}</code>
                    </pre>
                  )}
                </div>
              </div>

              {/* Options */}
              <div className="grid grid-cols-1 gap-2 pt-3 sm:grid-cols-2">
                {q.options.map((opt) => {
                  const isSelected = userAnswer === opt.key;
                  const isCorrectOption = opt.key === q.correctAnswer;

                  let optionStyle =
                    'border-border/60 hover:bg-secondary/60 text-foreground';

                  if (isSubmitted) {
                    if (isCorrectOption) {
                      optionStyle =
                        'border-emerald-500 bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 font-semibold';
                    } else if (isSelected && !isCorrect) {
                      optionStyle =
                        'border-destructive bg-destructive/15 text-destructive font-semibold';
                    } else {
                      optionStyle = 'border-border/40 opacity-50';
                    }
                  } else if (isSelected) {
                    optionStyle =
                      'border-primary bg-primary/10 text-primary font-semibold ring-1 ring-primary';
                  }

                  return (
                    <button
                      key={opt.key}
                      type="button"
                      disabled={isSubmitted}
                      onClick={() => handleSelectOption(q.id, opt.key)}
                      className={`flex items-center gap-2.5 rounded-xl border p-3 text-left text-xs transition-all ${optionStyle}`}
                    >
                      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-lg border border-current text-[11px] font-bold">
                        {opt.key}
                      </span>
                      <span className="flex-1 leading-relaxed">{opt.text}</span>
                    </button>
                  );
                })}
              </div>

              {/* Explanation on submit */}
              {isSubmitted && (
                <div className="border-border/40 bg-background/80 text-muted-foreground mt-3 flex items-start gap-2 rounded-xl border p-3 text-xs leading-relaxed">
                  <HelpCircle className="text-primary mt-0.5 h-4 w-4 shrink-0" />
                  <div>
                    <span className="text-foreground font-semibold">Explanation: </span>
                    {q.explanation}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Submit Footer */}
      {!isSubmitted && (
        <div className="border-border/50 mt-6 flex flex-col items-center justify-between gap-3 border-t pt-4 sm:flex-row">
          <span className="text-muted-foreground text-xs">
            Answered {answeredCount} of {quizzes.length} questions
          </span>

          <Button
            onClick={handleGradeQuiz}
            disabled={!isAllAnswered}
            className="shadow-primary/20 w-full gap-2 shadow-md sm:w-auto"
          >
            <CheckCircle2 className="h-4 w-4" />
            <span>Submit & Grade Quiz</span>
          </Button>
        </div>
      )}
    </Card>
  );
}
