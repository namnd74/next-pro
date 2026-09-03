'use client';

import * as React from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  ArrowRight,
  Award,
  CheckCircle2,
  Clock,
  Code,
  Lightbulb,
} from 'lucide-react';
import type { Lesson, LearningTrack } from '../types';
import { BlitzQuiz } from './blitz-quiz';
import { LessonCompletionControl } from './lesson-completion-control';
import { LessonTabsView } from './lesson-tabs-view';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { CodeBlock } from '@/components/ui/code-block';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  ReactPlayground,
  NextPlayground,
  type PlaygroundFile,
} from '@/features/playground';
import { NEXTJS_SERIES_TRACK_SLUGS } from '../data/curriculum';
import {
  generateDynamicLabFiles,
  ensureStandardReactProjectFiles,
} from '../data/lab-generator';

interface LessonViewerProps {
  track: LearningTrack;
  lesson: Lesson;
}

export function LessonViewer({ track, lesson }: LessonViewerProps) {
  const currentIndex = track.lessons.findIndex((item) => item.id === lesson.id);
  const prevLesson = currentIndex > 0 ? track.lessons[currentIndex - 1] : null;
  const nextLesson =
    currentIndex < track.lessons.length - 1 ? track.lessons[currentIndex + 1] : null;

  const theory = (
    <>
      <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4 text-amber-950 dark:text-amber-100">
        <div className="flex items-start gap-3">
          <Lightbulb className="mt-0.5 h-5 w-5 shrink-0 text-amber-600 dark:text-amber-400" />
          <div className="space-y-1">
            <span className="text-xs font-extrabold tracking-wider text-amber-800 uppercase dark:text-amber-300">
              Core Mental Model
            </span>
            <p className="text-sm leading-relaxed font-medium">{lesson.mentalModel}</p>
          </div>
        </div>
      </div>

      <section className="space-y-3">
        <h2 className="text-foreground text-base font-bold tracking-tight">
          Key Takeaways & Principles
        </h2>
        <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
          {lesson.keyPoints.map((point, index) => (
            <Card
              key={index}
              className="glass-card glass-card-hover hover:border-primary/40 flex items-start gap-3 p-4 transition-all"
            >
              <CheckCircle2 className="text-primary mt-0.5 h-4 w-4 shrink-0" />
              <span className="text-foreground text-xs leading-relaxed">{point}</span>
            </Card>
          ))}
        </div>
      </section>
    </>
  );

  const recipes = (
    <section className="space-y-4">
      <h2 className="text-foreground flex items-center gap-2 text-base font-bold tracking-tight">
        <Code className="text-primary h-4 w-4" />
        Code Recipes & Patterns
      </h2>
      <div className="space-y-6">
        {lesson.codeRecipes.map((recipe, index) => (
          <Card key={index} className="glass-card space-y-3 overflow-hidden p-5 sm:p-6">
            <div className="flex items-center justify-between gap-3">
              <h3 className="text-foreground text-sm font-bold">{recipe.title}</h3>
              <Badge variant="secondary" className="font-mono text-[10px] uppercase">
                {recipe.language}
              </Badge>
            </div>

            {recipe.beforeCode ? (
              <Tabs defaultValue="after" className="w-full">
                <TabsList className="grid h-auto w-full max-w-md grid-cols-2 p-1">
                  <TabsTrigger value="after" className="px-3 py-1.5 text-xs">
                    Recommended
                  </TabsTrigger>
                  <TabsTrigger value="before" className="px-3 py-1.5 text-xs">
                    Legacy
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
              <CodeBlock code={recipe.afterCode} language={recipe.language} />
            )}

            <p className="text-muted-foreground pt-1 text-xs italic">
              <span className="text-foreground font-semibold">Takeaway: </span>
              {recipe.takeaway}
            </p>
          </Card>
        ))}
      </div>
    </section>
  );

  const quiz = lesson.quizzes.length ? (
    <BlitzQuiz lessonId={lesson.id} quizzes={lesson.quizzes} />
  ) : null;

  const isNextJsTrack = NEXTJS_SERIES_TRACK_SLUGS.includes(track.slug);

  const dynamicLab = React.useMemo(() => {
    return generateDynamicLabFiles(lesson, track, isNextJsTrack);
  }, [lesson, track, isNextJsTrack]);

  const labInitialFiles = React.useMemo(() => {
    let raw: Record<string, string | PlaygroundFile>;

    if (
      lesson.interactiveLab?.initialFiles &&
      Object.keys(lesson.interactiveLab.initialFiles).length > 0
    ) {
      raw = lesson.interactiveLab.initialFiles;
    } else {
      raw = dynamicLab.initialFiles;
    }

    if (!isNextJsTrack) {
      return ensureStandardReactProjectFiles(raw);
    }

    return raw;
  }, [lesson, dynamicLab, isNextJsTrack]);

  const labInstructions =
    lesson.interactiveLab?.instructions ||
    dynamicLab.instructions ||
    `Thực hành và thử nghiệm code cho bài: ${lesson.title}. Mọi chỉnh sửa được tự động lưu trong IndexedDB theo bài học này.`;

  const nextInitialFiles =
    lesson.interactiveLab?.initialFiles &&
    Object.keys(lesson.interactiveLab.initialFiles).length > 0
      ? lesson.interactiveLab.initialFiles
      : dynamicLab.initialFiles;

  const resolvedReactEntry = labInitialFiles['/src/main.tsx']
    ? '/src/main.tsx'
    : labInitialFiles['/src/App.tsx']
      ? '/src/App.tsx'
      : '/App.tsx';

  const interactiveLab = (
    <section className="space-y-4">
      {isNextJsTrack ? (
        <NextPlayground
          title={`Next.js 16 Curriculum Studio: ${lesson.title}`}
          initialFiles={nextInitialFiles}
          entryPath={lesson.interactiveLab?.entryFile || '/app/page.tsx'}
          instructions={labInstructions}
          scopeId={lesson.id}
        />
      ) : (
        <ReactPlayground
          initialFiles={labInitialFiles}
          entryPath={resolvedReactEntry}
          instructions={labInstructions}
          platform="react-lite"
          scopeId={lesson.id}
        />
      )}
    </section>
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link
          href={`/learn/${track.slug}`}
          className="text-muted-foreground hover:text-primary inline-flex items-center gap-1.5 text-xs font-semibold transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>{track.title}</span>
        </Link>
        <LessonCompletionControl lessonId={lesson.id} />
      </div>

      <section className="space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="secondary" className="text-[10px] tracking-wider uppercase">
            {lesson.level}
          </Badge>
          <span className="text-muted-foreground flex items-center gap-1 text-xs">
            <Clock className="h-3.5 w-3.5" />
            {lesson.durationMinutes} phút
          </span>
          {lesson.tags.map((tag) => (
            <Badge key={tag} variant="outline" className="text-[10px]">
              #{tag}
            </Badge>
          ))}
        </div>
        <h1 className="text-foreground text-xl font-extrabold tracking-tight sm:text-2xl">
          {lesson.title}
        </h1>
        <p className="text-muted-foreground max-w-3xl text-sm leading-relaxed">
          {lesson.summary}
        </p>
      </section>

      <LessonTabsView
        theory={theory}
        recipes={recipes}
        quiz={quiz}
        interactiveLab={interactiveLab}
        hasQuiz={lesson.quizzes.length > 0}
        hasInteractiveLab={true}
      />

      <div className="border-border/40 flex flex-col items-stretch justify-between gap-3 border-t pt-5 sm:flex-row sm:items-center">
        {prevLesson ? (
          <Link href={`/learn/${track.slug}/${prevLesson.slug}`}>
            <Button
              variant="outline"
              size="sm"
              className="w-full gap-2 text-xs sm:w-auto"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Trước: {prevLesson.title}</span>
            </Button>
          </Link>
        ) : (
          <div />
        )}

        {nextLesson ? (
          <Link href={`/learn/${track.slug}/${nextLesson.slug}`}>
            <Button
              size="sm"
              className="shadow-primary/20 w-full gap-2 text-xs shadow-md sm:w-auto"
            >
              <span>Tiếp: {nextLesson.title}</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </Link>
        ) : (
          <Link href={`/learn/${track.slug}`}>
            <Button
              size="sm"
              variant="outline"
              className="w-full gap-2 text-xs sm:w-auto"
            >
              <Award className="text-primary h-3.5 w-3.5" />
              <span>Hoàn tất track</span>
            </Button>
          </Link>
        )}
      </div>
    </div>
  );
}
