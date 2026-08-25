export type AcademyDifficulty =
  'foundation' | 'beginner' | 'intermediate' | 'advanced' | 'expert';

export type AcademySafetyLevel = 'safe' | 'isolated-only' | 'instructor-controlled';

export interface AcademySource {
  title: string;
  url: string;
  publisher: string;
  sourceType: 'official-standard' | 'official-guidance' | 'official-definition';
  accessedAt: string;
  supports: string[];
}

export interface AcademySection {
  title: string;
  paragraphs: string[];
  points?: string[];
}

export interface AcademyVisualStep {
  label: string;
  detail: string;
  tone: 'neutral' | 'allow' | 'caution' | 'stop';
}

export interface AcademyVisual {
  title: string;
  caption: string;
  steps: AcademyVisualStep[];
}

export interface AcademyDecisionOption {
  id: string;
  label: string;
  correct: boolean;
  rationale: string;
}

export interface AcademyDecisionCase {
  id: string;
  title: string;
  context: string;
  prompt: string;
  options: AcademyDecisionOption[];
}

export interface AcademyDecisionLab {
  title: string;
  objective: string;
  scenario: string;
  constraints: string[];
  cases: AcademyDecisionCase[];
  successCriteria: string[];
  evidenceTemplate: string[];
  reset: string;
  cleanup: string;
}

export interface AcademyQuizOption {
  id: 'A' | 'B' | 'C' | 'D';
  label: string;
}

export interface AcademyQuizQuestion {
  id: string;
  difficulty: 'easy' | 'medium' | 'hard';
  question: string;
  options: AcademyQuizOption[];
  correctAnswer: AcademyQuizOption['id'];
  explanation: string;
}

export interface AcademyGovernance {
  prevent: string[];
  observe: string[];
  respond: string[];
  residualRisk: string[];
}

export interface AcademyTransferChallenge {
  scenario: string;
  tasks: string[];
  requiredEvidence: string[];
}

export interface AcademyLesson {
  id: string;
  slug: string;
  title: string;
  summary: string;
  difficulty: AcademyDifficulty;
  durationMinutes: number;
  prerequisites: string[];
  outcomes: string[];
  careerPaths: string[];
  domains: string[];
  attackTactics: string[];
  keywords: string[];
  safetyLevel: AcademySafetyLevel;
  mentalModel: string;
  visual: AcademyVisual;
  sections: AcademySection[];
  lab: AcademyDecisionLab;
  governance: AcademyGovernance;
  misconceptions: Array<{ claim: string; correction: string }>;
  quiz: AcademyQuizQuestion[];
  transferChallenge: AcademyTransferChallenge;
  sources: AcademySource[];
}

export interface AcademyModule {
  id: string;
  slug: string;
  trackId: string;
  title: string;
  summary: string;
  difficulty: AcademyDifficulty;
  estimatedMinutes: number;
  careerPaths: string[];
  domains: string[];
  safetyLevel: AcademySafetyLevel;
  lessons: AcademyLesson[];
}

export type AcademyLessonNavigation = Pick<
  AcademyLesson,
  'id' | 'slug' | 'title' | 'summary' | 'durationMinutes' | 'difficulty'
>;
