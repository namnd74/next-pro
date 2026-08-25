export type AiTopicLevel = 'Nền tảng' | 'Trung cấp' | 'Nâng cao';

export type AiTopicIcon = 'brain' | 'interface' | 'harness' | 'skills' | 'multi-agent';

export interface AiArticleSection {
  title: string;
  paragraphs: string[];
  points?: string[];
}

export interface AiCodeExample {
  title: string;
  language: string;
  code: string;
  takeaway: string;
}

export interface AiResource {
  title: string;
  url: string;
  description: string;
}

export interface AiCaseStudy {
  title: string;
  pattern: string;
  summary: string;
  image: {
    src: string;
    alt: string;
    width: number;
    height: number;
  };
  source: {
    title: string;
    url: string;
  };
  whyItWorks: string[];
  implementation: string[];
  caveat: string;
}

export type AiInteractiveLab = 'agent-skills-studio';

export interface AiLesson {
  slug: string;
  title: string;
  summary: string;
  level: AiTopicLevel;
  durationMinutes: number;
  icon: AiTopicIcon;
  color: string;
  tags: string[];
  mentalModel: string;
  takeaways: string[];
  sections: AiArticleSection[];
  examples: AiCodeExample[];
  resources: AiResource[];
  caseStudies?: AiCaseStudy[];
  lab?: AiInteractiveLab;
}

export interface AiTrack {
  id: string;
  slug: string;
  title: string;
  description: string;
  icon: AiTopicIcon;
  color: string;
  level: AiTopicLevel;
  lessons: AiLesson[];
}

export type AiLessonNavigation = Pick<
  AiLesson,
  'slug' | 'title' | 'durationMinutes' | 'level'
>;

export type AiTrackNavigation = Pick<AiTrack, 'id' | 'slug' | 'title' | 'icon'> & {
  lessons: AiLessonNavigation[];
};

export type AiTopic = AiLesson;
