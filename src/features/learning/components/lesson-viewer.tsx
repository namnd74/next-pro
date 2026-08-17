'use client';

import * as React from 'react';
import Link from 'next/link';
import {
  Lightbulb,
  CheckCircle2,
  Clock,
  ArrowLeft,
  ArrowRight,
  Code,
  Copy,
  Check,
  Award,
} from 'lucide-react';
import { Lesson, LearningTrack } from '../types';
import { useLearningStore } from '../stores/use-learning-store';
import { BlitzQuiz } from './blitz-quiz';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';

interface LessonViewerProps {
  track: LearningTrack;
  lesson: Lesson;
}

export function LessonViewer({ track, lesson }: LessonViewerProps) {
  const { completedLessonIds, markLessonCompleted } = useLearningStore();
  const [copiedIndex, setCopiedIndex] = React.useState<number | null>(null);

  const isCompleted = completedLessonIds.includes(lesson.id);

  // Find next and previous lesson in track
  const currentIndex = track.lessons.findIndex((l) => l.id === lesson.id);
  const prevLesson = currentIndex > 0 ? track.lessons[currentIndex - 1] : null;
  const nextLesson =
    currentIndex < track.lessons.length - 1 ? track.lessons[currentIndex + 1] : null;

  const handleCopyCode = (code: string, index: number) => {
    navigator.clipboard.writeText(code);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <div className="space-y-8">
      {/* Navigation Breadcrumb */}
      <div className="flex items-center justify-between">
        <Link
          href={`/learn/${track.slug}`}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground transition-colors hover:text-primary"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Back to {track.title}</span>
        </Link>

        <div className="flex items-center gap-2">
          {isCompleted ? (
            <Badge
              variant="outline"
              className="gap-1 border-emerald-500/40 bg-emerald-500/10 text-xs text-emerald-500"
            >
              <CheckCircle2 className="h-3.5 w-3.5" />
              Completed
            </Badge>
          ) : (
            <Button
              variant="outline"
              size="sm"
              onClick={() => markLessonCompleted(lesson.id)}
              className="gap-1.5 text-xs"
            >
              <Check className="h-3 w-3" />
              Mark as Read
            </Button>
          )}
        </div>
      </div>

      {/* Lesson Header Card */}
      <Card className="glass-card space-y-4 p-6 sm:p-8">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="secondary" className="text-[10px] uppercase tracking-wider">
            {lesson.level}
          </Badge>
          <span className="flex items-center gap-1 text-xs text-muted-foreground">
            <Clock className="h-3.5 w-3.5" />
            {lesson.durationMinutes} minutes
          </span>
          {lesson.tags.map((tag) => (
            <Badge key={tag} variant="outline" className="text-[10px]">
              #{tag}
            </Badge>
          ))}
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl font-extrabold tracking-tight text-foreground sm:text-3xl">
            {lesson.title}
          </h1>
          <p className="text-sm leading-relaxed text-muted-foreground sm:text-base">
            {lesson.summary}
          </p>
        </div>

        {/* Mental Model Callout */}
        <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4 text-amber-900 dark:text-amber-200">
          <div className="flex items-start gap-3">
            <Lightbulb className="mt-0.5 h-5 w-5 shrink-0 text-amber-500" />
            <div className="space-y-1">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
                Core Mental Model
              </span>
              <p className="text-sm font-medium leading-relaxed">{lesson.mentalModel}</p>
            </div>
          </div>
        </div>
      </Card>

      {/* Key Points Section */}
      <section className="space-y-3">
        <h2 className="text-lg font-bold tracking-tight text-foreground">
          Key Takeaways & Principles
        </h2>
        <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
          {lesson.keyPoints.map((point, idx) => (
            <Card key={idx} className="glass-card flex items-start gap-3 p-4">
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
              <span className="text-xs leading-relaxed text-foreground">{point}</span>
            </Card>
          ))}
        </div>
      </section>

      {/* Code Recipes (Before / After Comparison) */}
      <section className="space-y-4">
        <h2 className="flex items-center gap-2 text-lg font-bold tracking-tight text-foreground">
          <Code className="h-5 w-5 text-primary" />
          Code Recipes & Patterns
        </h2>

        <div className="space-y-6">
          {lesson.codeRecipes.map((recipe, rIndex) => (
            <Card key={rIndex} className="glass-card overflow-hidden p-6">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-sm font-bold text-foreground">{recipe.title}</h3>
                <Badge variant="secondary" className="font-mono text-[10px] uppercase">
                  {recipe.language}
                </Badge>
              </div>

              {recipe.beforeCode ? (
                <Tabs defaultValue="after" className="w-full">
                  <TabsList className="grid w-full max-w-xs grid-cols-2">
                    <TabsTrigger value="after">✅ React 19 / App Router</TabsTrigger>
                    <TabsTrigger value="before">❌ Legacy (React 18 / Pages)</TabsTrigger>
                  </TabsList>

                  <TabsContent value="after" className="relative mt-3">
                    <button
                      type="button"
                      onClick={() => handleCopyCode(recipe.afterCode, rIndex * 2)}
                      className="absolute right-3 top-3 z-10 rounded-lg border border-slate-700 bg-slate-800/80 p-1.5 text-slate-300 transition-colors hover:bg-slate-700"
                      title="Copy code"
                    >
                      {copiedIndex === rIndex * 2 ? (
                        <Check className="h-3.5 w-3.5 text-emerald-400" />
                      ) : (
                        <Copy className="h-3.5 w-3.5" />
                      )}
                    </button>
                    <pre className="overflow-x-auto rounded-xl border border-border/80 bg-slate-950 p-4 font-mono text-xs leading-relaxed text-slate-100 dark:bg-black/70">
                      <code>{recipe.afterCode}</code>
                    </pre>
                  </TabsContent>

                  <TabsContent value="before" className="relative mt-3">
                    <button
                      type="button"
                      onClick={() => handleCopyCode(recipe.beforeCode!, rIndex * 2 + 1)}
                      className="absolute right-3 top-3 z-10 rounded-lg border border-slate-700 bg-slate-800/80 p-1.5 text-slate-300 transition-colors hover:bg-slate-700"
                      title="Copy code"
                    >
                      {copiedIndex === rIndex * 2 + 1 ? (
                        <Check className="h-3.5 w-3.5 text-emerald-400" />
                      ) : (
                        <Copy className="h-3.5 w-3.5" />
                      )}
                    </button>
                    <pre className="overflow-x-auto rounded-xl border border-border/80 bg-slate-950 p-4 font-mono text-xs leading-relaxed text-slate-400 opacity-90 dark:bg-black/70">
                      <code>{recipe.beforeCode}</code>
                    </pre>
                  </TabsContent>
                </Tabs>
              ) : (
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => handleCopyCode(recipe.afterCode, rIndex)}
                    className="absolute right-3 top-3 z-10 rounded-lg border border-slate-700 bg-slate-800/80 p-1.5 text-slate-300 transition-colors hover:bg-slate-700"
                    title="Copy code"
                  >
                    {copiedIndex === rIndex ? (
                      <Check className="h-3.5 w-3.5 text-emerald-400" />
                    ) : (
                      <Copy className="h-3.5 w-3.5" />
                    )}
                  </button>
                  <pre className="overflow-x-auto rounded-xl border border-border/80 bg-slate-950 p-4 font-mono text-xs leading-relaxed text-slate-100 dark:bg-black/70">
                    <code>{recipe.afterCode}</code>
                  </pre>
                </div>
              )}

              <p className="mt-3 text-xs italic text-muted-foreground">
                <span className="font-semibold text-foreground">Takeaway: </span>
                {recipe.takeaway}
              </p>
            </Card>
          ))}
        </div>
      </section>

      {/* Interactive Blitz Quiz */}
      {lesson.quizzes.length > 0 && (
        <section className="space-y-4">
          <BlitzQuiz
            lessonId={lesson.id}
            quizzes={lesson.quizzes}
            onQuizComplete={() => markLessonCompleted(lesson.id)}
          />
        </section>
      )}

      {/* Footer Navigation */}
      <div className="flex flex-col items-center justify-between gap-4 border-t border-border/40 pt-6 sm:flex-row">
        {prevLesson ? (
          <Link href={`/learn/${track.slug}/${prevLesson.slug}`}>
            <Button variant="outline" size="sm" className="gap-2 text-xs">
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Prev: {prevLesson.title}</span>
            </Button>
          </Link>
        ) : (
          <div />
        )}

        {nextLesson ? (
          <Link href={`/learn/${track.slug}/${nextLesson.slug}`}>
            <Button size="sm" className="gap-2 text-xs shadow-md shadow-primary/20">
              <span>Next: {nextLesson.title}</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </Link>
        ) : (
          <Link href={`/learn/${track.slug}`}>
            <Button size="sm" variant="outline" className="gap-2 text-xs">
              <Award className="h-3.5 w-3.5 text-primary" />
              <span>Finish Track</span>
            </Button>
          </Link>
        )}
      </div>
    </div>
  );
}
