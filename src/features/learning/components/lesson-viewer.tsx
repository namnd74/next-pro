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
import { CodeBlock } from '@/components/ui/code-block';

interface LessonViewerProps {
  track: LearningTrack;
  lesson: Lesson;
}

export function LessonViewer({ track, lesson }: LessonViewerProps) {
  const { completedLessonIds, markLessonCompleted } = useLearningStore();

  const isCompleted = completedLessonIds.includes(lesson.id);

  // Find next and previous lesson in track
  const currentIndex = track.lessons.findIndex((l) => l.id === lesson.id);
  const prevLesson = currentIndex > 0 ? track.lessons[currentIndex - 1] : null;
  const nextLesson =
    currentIndex < track.lessons.length - 1 ? track.lessons[currentIndex + 1] : null;

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
            <Card key={rIndex} className="glass-card space-y-3 overflow-hidden p-6">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-foreground">{recipe.title}</h3>
                <Badge variant="secondary" className="font-mono text-[10px] uppercase">
                  {recipe.language}
                </Badge>
              </div>

              {recipe.beforeCode ? (
                <Tabs defaultValue="after" className="w-full">
                  <TabsList className="grid h-auto w-full max-w-md grid-cols-2 p-1">
                    <TabsTrigger value="after" className="px-3 py-1.5 text-xs">
                      ✅ React 19 / App Router
                    </TabsTrigger>
                    <TabsTrigger value="before" className="px-3 py-1.5 text-xs">
                      ❌ Legacy (React 18 / Pages)
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="after" className="mt-3">
                    <CodeBlock code={recipe.afterCode} language={recipe.language} />
                  </TabsContent>

                  <TabsContent value="before" className="mt-3">
                    <CodeBlock code={recipe.beforeCode} language={recipe.language} />
                  </TabsContent>
                </Tabs>
              ) : (
                <div className="mt-3">
                  <CodeBlock code={recipe.afterCode} language={recipe.language} />
                </div>
              )}

              <p className="pt-1 text-xs italic text-muted-foreground">
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
