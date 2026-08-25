import agentRuntimeContent from './content/agent-runtime.json';
import agentSkillsContent from './content/agent-skills.json';
import systemFoundationsContent from './content/system-foundations.json';
import type { AiLesson, AiTrack, AiTrackNavigation } from '../types';

const SYSTEM_FOUNDATION_LESSONS = systemFoundationsContent as AiLesson[];
const AGENT_RUNTIME_LESSONS = agentRuntimeContent as AiLesson[];
const AGENT_SKILLS_LESSONS = agentSkillsContent as AiLesson[];

export const AI_TRACKS: AiTrack[] = [
  {
    id: 'ai-system-foundations',
    slug: 'ai-system-foundations',
    title: 'AI System Foundations',
    description:
      'Mental model từ model/context đến streaming interface và contract giữa AI với frontend application.',
    icon: 'brain',
    color: 'from-violet-500 to-fuchsia-500',
    level: 'Nền tảng',
    lessons: SYSTEM_FOUNDATION_LESSONS,
  },
  {
    id: 'agent-runtime-orchestration',
    slug: 'agent-runtime-orchestration',
    title: 'Agent Runtime & Orchestration',
    description:
      'Agent loop, harness, tool execution, sub-agent, permission, safety và evaluation trong production.',
    icon: 'harness',
    color: 'from-emerald-500 to-cyan-600',
    level: 'Trung cấp',
    lessons: AGENT_RUNTIME_LESSONS,
  },
  {
    id: 'agent-skills-engineering',
    slug: 'agent-skills-engineering',
    title: 'Agent Skills Engineering',
    description:
      'Từ mental model và anatomy đến authoring, scripts, evals, distribution và security của Agent Skills.',
    icon: 'skills',
    color: 'from-amber-500 via-orange-500 to-rose-500',
    level: 'Nâng cao',
    lessons: AGENT_SKILLS_LESSONS,
  },
];

export const AI_LESSONS = AI_TRACKS.flatMap((track) => track.lessons);

export const AI_NAVIGATION: AiTrackNavigation[] = AI_TRACKS.map((track) => ({
  id: track.id,
  slug: track.slug,
  title: track.title,
  icon: track.icon,
  lessons: track.lessons.map(({ slug, title, durationMinutes, level }) => ({
    slug,
    title,
    durationMinutes,
    level,
  })),
}));

export function getAiTrack(trackSlug: string) {
  return AI_TRACKS.find((track) => track.slug === trackSlug);
}

export function getAiLesson(trackSlug: string, lessonSlug: string) {
  return getAiTrack(trackSlug)?.lessons.find((lesson) => lesson.slug === lessonSlug);
}
