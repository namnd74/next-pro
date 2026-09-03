'use client';

import * as React from 'react';
import {
  CheckCircle2,
  ClipboardCheck,
  RotateCcw,
  ShieldCheck,
  XCircle,
} from 'lucide-react';
import type { AcademyLesson } from './types';
import { useOffensiveSecurityStore } from '../stores/use-offensive-security-store';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface AcademyAssessmentProps {
  lesson: AcademyLesson;
}

export function AcademyAssessment({ lesson }: AcademyAssessmentProps) {
  const [decisionAnswers, setDecisionAnswers] = React.useState<Record<string, string>>(
    {}
  );
  const [quizAnswers, setQuizAnswers] = React.useState<Record<string, string>>({});
  const [labSubmitted, setLabSubmitted] = React.useState(false);
  const [quizSubmitted, setQuizSubmitted] = React.useState(false);
  const { completedAcademyLessonIds, completeAcademyLesson } =
    useOffensiveSecurityStore();

  const labPassed = lesson.lab.cases.every((decisionCase) => {
    const selected = decisionCase.options.find(
      (option) => option.id === decisionAnswers[decisionCase.id]
    );
    return selected?.correct === true;
  });
  const quizScore = lesson.quiz.filter(
    (question) => quizAnswers[question.id] === question.correctAnswer
  ).length;
  const quizPassed = quizScore === lesson.quiz.length;
  const completed = completedAcademyLessonIds.includes(lesson.id);

  React.useEffect(() => {
    if (labSubmitted && quizSubmitted && labPassed && quizPassed) {
      completeAcademyLesson(lesson.id);
    }
  }, [
    completeAcademyLesson,
    labPassed,
    labSubmitted,
    lesson.id,
    quizPassed,
    quizSubmitted,
  ]);

  const reset = () => {
    setDecisionAnswers({});
    setQuizAnswers({});
    setLabSubmitted(false);
    setQuizSubmitted(false);
  };

  return (
    <section className="space-y-6" aria-labelledby="academy-assessment-heading">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2
            id="academy-assessment-heading"
            className="text-foreground text-xl font-extrabold tracking-tight"
          >
            Decision lab & kiểm tra năng lực
          </h2>
          <p className="text-muted-foreground mt-1 text-xs leading-relaxed">
            Completion chỉ được ghi khi mọi decision case và cả ba câu hỏi đều đúng.
          </p>
        </div>
        {completed && (
          <Badge variant="success" className="gap-1.5">
            <ShieldCheck className="h-3.5 w-3.5" />
            Practice Completed (Self-Paced)
          </Badge>
        )}
      </div>

      <Card className="glass-card space-y-5 p-5 sm:p-6">
        <div className="space-y-2">
          <Badge variant="warning" className="text-[10px] uppercase">
            Browser simulation · no external target
          </Badge>
          <h3 className="text-foreground text-base font-extrabold">{lesson.lab.title}</h3>
          <p className="text-muted-foreground text-sm leading-7">
            {lesson.lab.objective}
          </p>
          <p className="border-border/60 bg-secondary/35 rounded-xl border p-4 text-sm leading-7">
            {lesson.lab.scenario}
          </p>
        </div>

        <div className="grid gap-2 sm:grid-cols-3">
          {lesson.lab.constraints.map((constraint) => (
            <div
              key={constraint}
              className="border-border/60 bg-background/55 rounded-xl border p-3 text-xs leading-5"
            >
              {constraint}
            </div>
          ))}
        </div>

        <div className="space-y-5">
          {lesson.lab.cases.map((decisionCase, caseIndex) => {
            const selectedId = decisionAnswers[decisionCase.id];
            return (
              <fieldset key={decisionCase.id} className="space-y-3">
                <legend className="text-foreground text-sm font-bold">
                  {caseIndex + 1}. {decisionCase.title}
                </legend>
                <p className="text-muted-foreground text-xs leading-6">
                  {decisionCase.context}
                </p>
                <p className="text-foreground text-xs font-semibold">
                  {decisionCase.prompt}
                </p>
                <div className="grid gap-2 sm:grid-cols-2">
                  {decisionCase.options.map((option) => {
                    const selected = selectedId === option.id;
                    const reveal = labSubmitted && selected;
                    return (
                      <button
                        key={option.id}
                        type="button"
                        aria-pressed={selected}
                        onClick={() => {
                          if (labSubmitted) return;
                          setDecisionAnswers((current) => ({
                            ...current,
                            [decisionCase.id]: option.id,
                          }));
                        }}
                        className={`rounded-xl border p-3 text-left transition-colors ${
                          reveal
                            ? option.correct
                              ? 'border-emerald-500/50 bg-emerald-500/10'
                              : 'border-destructive/50 bg-destructive/10'
                            : selected
                              ? 'border-primary/60 bg-primary/10'
                              : 'border-border/60 bg-background/55 hover:border-primary/35'
                        }`}
                      >
                        <span className="text-foreground block text-xs font-bold">
                          {option.id}. {option.label}
                        </span>
                        {reveal && (
                          <span className="text-muted-foreground mt-2 block text-[11px] leading-5">
                            {option.rationale}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </fieldset>
            );
          })}
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Button
            type="button"
            onClick={() => setLabSubmitted(true)}
            disabled={
              labSubmitted ||
              Object.keys(decisionAnswers).length !== lesson.lab.cases.length
            }
          >
            Chấm decision lab
          </Button>
          {labSubmitted && (
            <ResultLabel
              passed={labPassed}
              success="Decision evidence đạt"
              failure="Cần sửa decision"
            />
          )}
        </div>
      </Card>

      <Card className="glass-card space-y-5 p-5 sm:p-6">
        <div>
          <h3 className="text-foreground text-base font-extrabold">60s Blitz Quiz</h3>
          <p className="text-muted-foreground mt-1 text-xs">
            Easy recall → medium diagnosis → hard judgment.
          </p>
        </div>

        {lesson.quiz.map((question, questionIndex) => (
          <fieldset key={question.id} className="space-y-3">
            <legend className="text-foreground text-sm font-bold">
              {questionIndex + 1}. {question.question}
            </legend>
            <Badge variant="outline" className="text-[9px] uppercase">
              {question.difficulty}
            </Badge>
            <div className="grid gap-2 sm:grid-cols-2">
              {question.options.map((option) => {
                const selected = quizAnswers[question.id] === option.id;
                const reveal = quizSubmitted && selected;
                const correct = option.id === question.correctAnswer;
                return (
                  <button
                    key={option.id}
                    type="button"
                    aria-pressed={selected}
                    onClick={() => {
                      if (quizSubmitted) return;
                      setQuizAnswers((current) => ({
                        ...current,
                        [question.id]: option.id,
                      }));
                    }}
                    className={`rounded-xl border p-3 text-left text-xs transition-colors ${
                      reveal
                        ? correct
                          ? 'border-emerald-500/50 bg-emerald-500/10'
                          : 'border-destructive/50 bg-destructive/10'
                        : selected
                          ? 'border-primary/60 bg-primary/10'
                          : 'border-border/60 bg-background/55 hover:border-primary/35'
                    }`}
                  >
                    <span className="font-bold">{option.id}.</span> {option.label}
                  </button>
                );
              })}
            </div>
            {quizSubmitted && (
              <p className="border-border/50 text-muted-foreground border-l-2 pl-3 text-xs leading-6">
                {question.explanation}
              </p>
            )}
          </fieldset>
        ))}

        <div className="flex flex-wrap items-center gap-3">
          <Button
            type="button"
            onClick={() => setQuizSubmitted(true)}
            disabled={
              quizSubmitted || Object.keys(quizAnswers).length !== lesson.quiz.length
            }
          >
            Chấm quiz
          </Button>
          {quizSubmitted && (
            <ResultLabel
              passed={quizPassed}
              success={`${quizScore}/${lesson.quiz.length} · Quiz đạt`}
              failure={`${quizScore}/${lesson.quiz.length} · Cần đúng toàn bộ`}
            />
          )}
        </div>
      </Card>

      {labSubmitted && quizSubmitted && (
        <Card
          className={`space-y-4 p-5 sm:p-6 ${
            labPassed && quizPassed
              ? 'border-emerald-500/40 bg-emerald-500/5'
              : 'border-amber-500/40 bg-amber-500/5'
          }`}
        >
          <div className="flex items-start gap-3">
            <ClipboardCheck className="mt-0.5 h-5 w-5 shrink-0 text-emerald-500" />
            <div className="space-y-2">
              <h3 className="text-foreground text-sm font-extrabold">
                {labPassed && quizPassed
                  ? 'Evidence record đã đạt'
                  : 'Evidence chưa đủ để hoàn thành'}
              </h3>
              <ul className="space-y-1">
                {lesson.lab.evidenceTemplate.map((item) => (
                  <li key={item} className="text-muted-foreground text-xs leading-5">
                    • {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
          {(!labPassed || !quizPassed) && (
            <Button type="button" variant="outline" size="sm" onClick={reset}>
              <RotateCcw className="h-3.5 w-3.5" />
              Làm lại assessment
            </Button>
          )}
        </Card>
      )}
    </section>
  );
}

function ResultLabel({
  passed,
  success,
  failure,
}: {
  passed: boolean;
  success: string;
  failure: string;
}) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 text-xs font-bold ${
        passed ? 'text-emerald-600 dark:text-emerald-400' : 'text-destructive'
      }`}
    >
      {passed ? <CheckCircle2 className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
      {passed ? success : failure}
    </span>
  );
}
