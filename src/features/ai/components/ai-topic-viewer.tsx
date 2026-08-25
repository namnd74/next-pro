import Link from 'next/link';
import Image from 'next/image';
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Clock,
  ExternalLink,
  Images,
  Lightbulb,
  TerminalSquare,
} from 'lucide-react';
import { AiTopicIcon } from './ai-topic-icon';
import { AiLessonCompletionControl } from './ai-lesson-completion-control';
import { AiLabRenderer } from './ai-interactive-lab';
import type { AiCaseStudy, AiLesson, AiResource, AiTrack } from '../types';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { CodeBlock } from '@/components/ui/code-block';
import { getPublicAssetPath } from '@/lib/public-asset-path';

interface AiLessonViewerProps {
  track: AiTrack;
  lesson: AiLesson;
}

export function AiLessonViewer({ track, lesson }: AiLessonViewerProps) {
  const currentIndex = track.lessons.findIndex((item) => item.slug === lesson.slug);
  const previousLesson = currentIndex > 0 ? track.lessons[currentIndex - 1] : null;
  const nextLesson =
    currentIndex < track.lessons.length - 1 ? track.lessons[currentIndex + 1] : null;

  return (
    <article className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link
          href={`/ai/${track.slug}`}
          className="text-muted-foreground hover:text-primary inline-flex items-center gap-1.5 text-xs font-semibold transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          {track.title}
        </Link>
        <AiLessonCompletionControl lessonSlug={lesson.slug} />
      </div>

      <Card className="glass-card relative overflow-hidden p-6 sm:p-8">
        <div
          className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${lesson.color}`}
        />
        <div className="space-y-5">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="secondary" className="text-[10px] uppercase">
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

          <div className="flex items-start gap-4">
            <div
              className={`hidden h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br sm:flex ${lesson.color} text-white shadow-md`}
            >
              <AiTopicIcon name={lesson.icon} className="h-6 w-6" />
            </div>
            <div className="space-y-2">
              <h1 className="text-foreground text-2xl font-extrabold tracking-tight sm:text-3xl">
                {lesson.title}
              </h1>
              <p className="text-muted-foreground max-w-3xl text-sm leading-relaxed sm:text-base">
                {lesson.summary}
              </p>
            </div>
          </div>

          <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4 text-amber-950 dark:text-amber-100">
            <div className="flex items-start gap-3">
              <Lightbulb className="mt-0.5 h-5 w-5 shrink-0 text-amber-500" />
              <div className="space-y-1">
                <span className="text-xs font-bold tracking-wider text-amber-700 uppercase dark:text-amber-400">
                  Core Mental Model
                </span>
                <p className="text-sm leading-relaxed font-medium">
                  {lesson.mentalModel}
                </p>
              </div>
            </div>
          </div>
        </div>
      </Card>

      <section className="space-y-3">
        <h2 className="text-foreground text-lg font-bold tracking-tight">
          Những điều cần nắm chắc
        </h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {lesson.takeaways.map((takeaway) => (
            <Card key={takeaway} className="glass-card flex items-start gap-3 p-4">
              <CheckCircle2 className="text-primary mt-0.5 h-4 w-4 shrink-0" />
              <p className="text-foreground text-sm leading-relaxed">{takeaway}</p>
            </Card>
          ))}
        </div>
      </section>

      {lesson.lab && <AiLabRenderer lab={lesson.lab} />}

      {lesson.caseStudies && lesson.caseStudies.length > 0 && (
        <section className="space-y-4">
          <div className="space-y-1">
            <h2 className="text-foreground flex items-center gap-2 text-lg font-bold tracking-tight">
              <Images className="text-primary h-5 w-5" aria-hidden="true" />
              Case study trực quan
            </h2>
            <p className="text-muted-foreground text-xs leading-relaxed">
              Visual được lưu local để GitHub Pages tải ổn định; mỗi case đều giữ link
              nguồn và chỉ ra cách biến pattern thành implementation.
            </p>
          </div>
          <div className="space-y-5">
            {lesson.caseStudies.map((caseStudy) => (
              <AiCaseStudyCard key={caseStudy.title} caseStudy={caseStudy} />
            ))}
          </div>
        </section>
      )}

      <section className="space-y-4">
        <h2 className="text-foreground text-lg font-bold tracking-tight">
          Nội dung bài viết
        </h2>
        {lesson.sections.map((section) => (
          <Card key={section.title} className="glass-card space-y-4 p-5 sm:p-6">
            <h3 className="text-foreground text-base font-bold">{section.title}</h3>
            <div className="space-y-3">
              {section.paragraphs.map((paragraph) => (
                <p key={paragraph} className="text-muted-foreground text-sm leading-7">
                  {paragraph}
                </p>
              ))}
            </div>
            {section.points && (
              <ul className="border-primary/30 space-y-2 border-l-2 pl-4">
                {section.points.map((point) => (
                  <li key={point} className="text-foreground text-sm leading-6">
                    {point}
                  </li>
                ))}
              </ul>
            )}
          </Card>
        ))}
      </section>

      {lesson.examples.length > 0 && (
        <section className="space-y-4">
          <h2 className="text-foreground flex items-center gap-2 text-lg font-bold tracking-tight">
            <TerminalSquare className="text-primary h-5 w-5" />
            Code & cấu trúc tham khảo
          </h2>
          {lesson.examples.map((example) => (
            <Card key={example.title} className="glass-card space-y-3 p-5 sm:p-6">
              <h3 className="text-foreground text-sm font-bold">{example.title}</h3>
              <CodeBlock code={example.code} language={example.language} />
              <p className="text-muted-foreground text-xs leading-relaxed italic">
                <span className="text-foreground font-semibold">Takeaway: </span>
                {example.takeaway}
              </p>
            </Card>
          ))}
        </section>
      )}

      <section className="space-y-4">
        <div className="flex flex-wrap items-end justify-between gap-2">
          <div>
            <h2 className="text-foreground text-lg font-bold tracking-tight">
              Tài liệu đọc thêm
            </h2>
            <p className="text-muted-foreground mt-1 text-xs">
              Repo, đặc tả và bài viết gốc để đi sâu sau bài học.
            </p>
          </div>
          <Badge variant="outline">{lesson.resources.length} nguồn chọn lọc</Badge>
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {lesson.resources.map((resource) => (
            <AiResourceCard key={resource.url} resource={resource} />
          ))}
        </div>
      </section>

      <div className="border-border/40 flex flex-col justify-between gap-3 border-t pt-6 sm:flex-row">
        {previousLesson ? (
          <Link href={`/ai/${track.slug}/${previousLesson.slug}`}>
            <Button variant="outline" size="sm" className="w-full gap-2 sm:w-auto">
              <ArrowLeft className="h-3.5 w-3.5" />
              {previousLesson.title}
            </Button>
          </Link>
        ) : (
          <div />
        )}
        {nextLesson ? (
          <Link href={`/ai/${track.slug}/${nextLesson.slug}`}>
            <Button size="sm" className="w-full gap-2 sm:w-auto">
              {nextLesson.title}
              <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </Link>
        ) : (
          <Link href={`/ai/${track.slug}`}>
            <Button variant="outline" size="sm">
              Hoàn tất track
            </Button>
          </Link>
        )}
      </div>
    </article>
  );
}

function AiResourceCard({ resource }: { resource: AiResource }) {
  const meta = getResourceMeta(resource.url);

  return (
    <a
      href={resource.url}
      target="_blank"
      rel="noreferrer"
      className="border-border/60 bg-card/60 hover:border-primary/40 hover:bg-primary/5 focus-visible:ring-ring group cursor-pointer rounded-2xl border p-4 transition-colors focus-visible:ring-2 focus-visible:outline-none"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="secondary" className="text-[9px] uppercase">
              {meta.kind}
            </Badge>
            <span className="text-muted-foreground font-mono text-[9px]">
              {meta.hostname}
            </span>
          </div>
          <h3 className="text-foreground group-hover:text-primary text-sm font-bold">
            {resource.title}
          </h3>
          <p className="text-muted-foreground text-xs leading-relaxed">
            {resource.description}
          </p>
        </div>
        <ExternalLink className="text-muted-foreground group-hover:text-primary h-4 w-4 shrink-0" />
      </div>
    </a>
  );
}

function getResourceMeta(url: string) {
  const hostname = new URL(url).hostname.replace('www.', '');
  let kind = 'Article';

  if (hostname === 'github.com') kind = 'Repository';
  else if (url.includes('specification') || hostname === 'agentskills.io') kind = 'Spec';
  else if (
    hostname.includes('docs.') ||
    hostname.includes('learn.') ||
    hostname.includes('developer') ||
    hostname.includes('microsoft.github.io') ||
    hostname.includes('modelcontextprotocol.io')
  ) {
    kind = 'Docs';
  }

  return { hostname, kind };
}

function AiCaseStudyCard({ caseStudy }: { caseStudy: AiCaseStudy }) {
  return (
    <Card className="glass-card overflow-hidden">
      <figure className="border-border/60 border-b bg-white">
        <Image
          src={getPublicAssetPath(caseStudy.image.src)}
          alt={caseStudy.image.alt}
          width={caseStudy.image.width}
          height={caseStudy.image.height}
          sizes="(max-width: 768px) 100vw, 900px"
          className="h-auto w-full object-contain"
        />
        <figcaption className="border-border/50 flex flex-wrap items-center justify-between gap-2 border-t bg-slate-950 px-4 py-2.5 text-[10px] text-slate-300">
          <span>Nguồn visual: {caseStudy.source.title}</span>
          <a
            href={caseStudy.source.url}
            target="_blank"
            rel="noreferrer"
            className="inline-flex cursor-pointer items-center gap-1 font-semibold text-cyan-300 hover:text-cyan-200"
          >
            Xem bản gốc
            <ExternalLink className="h-3 w-3" aria-hidden="true" />
          </a>
        </figcaption>
      </figure>

      <div className="space-y-5 p-5 sm:p-6">
        <div className="space-y-2">
          <Badge variant="info" className="text-[10px] uppercase">
            {caseStudy.pattern}
          </Badge>
          <h3 className="text-foreground text-base font-extrabold">{caseStudy.title}</h3>
          <p className="text-muted-foreground text-sm leading-7">{caseStudy.summary}</p>
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <div className="bg-secondary/45 rounded-xl p-4">
            <h4 className="text-foreground text-xs font-bold tracking-wide uppercase">
              Vì sao pattern này hiệu quả?
            </h4>
            <ul className="mt-3 space-y-2">
              {caseStudy.whyItWorks.map((item) => (
                <li
                  key={item}
                  className="text-muted-foreground flex gap-2 text-xs leading-6"
                >
                  <CheckCircle2 className="mt-1 h-3.5 w-3.5 shrink-0 text-emerald-500" />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-secondary/45 rounded-xl p-4">
            <h4 className="text-foreground text-xs font-bold tracking-wide uppercase">
              Triển khai tối thiểu
            </h4>
            <ol className="mt-3 space-y-2">
              {caseStudy.implementation.map((item, index) => (
                <li
                  key={item}
                  className="text-muted-foreground flex gap-2 text-xs leading-6"
                >
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-violet-500/15 font-mono text-[10px] font-bold text-violet-600 dark:text-violet-300">
                    {index + 1}
                  </span>
                  {item}
                </li>
              ))}
            </ol>
          </div>
        </div>

        <p className="border-l-2 border-amber-500 pl-3 text-xs leading-6 text-amber-800 dark:text-amber-200">
          <strong>Caveat:</strong> {caseStudy.caveat}
        </p>
      </div>
    </Card>
  );
}
