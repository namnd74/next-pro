import { LearningTrack, LearningLesson } from '../types';
import { DEFAULT_JSON_LEARNING_TRACKS } from './json-loader';

/** Toàn bộ danh mục chương trình học chính thức của NextPro */
export const CURRICULUM_TRACKS: LearningTrack[] = DEFAULT_JSON_LEARNING_TRACKS;

/** Backward-compatible alias cho các module cũ */
export const MOCK_LEARNING_TRACKS: LearningTrack[] = CURRICULUM_TRACKS;

export const REACT_SERIES_TRACK_SLUGS = [
  'react-foundations-zero-to-one',
  'react-hooks-deep-dive',
  'standard-react-form-architecture',
  'react-19-compiler-path',
  'form-engineering-react-hook-form-zod',
  'react-performance-advanced-patterns',
  'react-testing-enterprise-mastery',
  'production-react-nextjs-capstone',
];

export const NEXTJS_SERIES_TRACK_SLUGS = [
  'nextjs-architecture-rendering-strategies',
  'tanstack-query-v5-masterclass',
  'web-security-and-auth-masterclass',
  'nextjs-deployment-and-operations',
];

export const REACT_SERIES_TRACKS: LearningTrack[] = CURRICULUM_TRACKS.filter((t) =>
  REACT_SERIES_TRACK_SLUGS.includes(t.slug)
);

export const NEXTJS_SERIES_TRACKS: LearningTrack[] = CURRICULUM_TRACKS.filter((t) =>
  NEXTJS_SERIES_TRACK_SLUGS.includes(t.slug)
);

export function getTrackBySlug(slug: string): LearningTrack | undefined {
  return CURRICULUM_TRACKS.find((t) => t.slug === slug);
}

export function getLessonBySlugs(
  trackSlug: string,
  lessonSlug: string
): { track?: LearningTrack; lesson?: LearningLesson } {
  const track = getTrackBySlug(trackSlug);
  if (!track) return {};
  const lesson = track.lessons.find((l) => l.slug === lessonSlug);
  return { track, lesson };
}

export interface CuratedExercise {
  id: string;
  trackTitle: string;
  trackSlug: string;
  lessonId: string;
  lessonSlug: string;
  lessonTitle: string;
  summary: string;
  level: string;
  durationMinutes: number;
  tags: string[];
  hasInteractiveLab: boolean;
}

export function getCuratedExercises(seriesType: 'react' | 'nextjs'): CuratedExercise[] {
  const tracks = seriesType === 'react' ? REACT_SERIES_TRACKS : NEXTJS_SERIES_TRACKS;
  const exercises: CuratedExercise[] = [];

  for (const track of tracks) {
    for (const lesson of track.lessons) {
      exercises.push({
        id: lesson.id,
        trackTitle: track.title,
        trackSlug: track.slug,
        lessonId: lesson.id,
        lessonSlug: lesson.slug,
        lessonTitle: lesson.title,
        summary: lesson.summary,
        level: lesson.level,
        durationMinutes: lesson.durationMinutes,
        tags: lesson.tags,
        hasInteractiveLab: Boolean(lesson.interactiveLab),
      });
    }
  }

  return exercises;
}
