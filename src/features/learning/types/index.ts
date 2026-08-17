export type DifficultyLevel = 'beginner' | 'intermediate' | 'advanced';

export interface QuizOption {
  key: 'A' | 'B' | 'C' | 'D';
  text: string;
}

export interface QuizQuestion {
  id: string;
  question: string;
  codeSnippet?: string;
  options: QuizOption[];
  correctAnswer: 'A' | 'B' | 'C' | 'D';
  explanation: string;
}

export interface CodeRecipe {
  title: string;
  language: 'tsx' | 'typescript' | 'bash';
  beforeCode?: string;
  afterCode: string;
  takeaway: string;
}

export interface Lesson {
  id: string;
  slug: string;
  title: string;
  summary: string;
  durationMinutes: number;
  level: DifficultyLevel;
  tags: string[];
  mentalModel: string;
  keyPoints: string[];
  codeRecipes: CodeRecipe[];
  quizzes: QuizQuestion[];
}

export interface LearningTrack {
  id: string;
  slug: string;
  title: string;
  description: string;
  iconName: string;
  color: string;
  totalLessons: number;
  lessons: Lesson[];
}

export interface QuizResultRecord {
  score: number;
  total: number;
  passed: boolean;
  answeredAt: string;
  answers: Record<string, string>;
}
