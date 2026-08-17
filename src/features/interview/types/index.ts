export type InterviewLevel = 'junior' | 'middle' | 'senior' | 'lead';

export type InterviewCategory =
  | 'all'
  | 'react-19'
  | 'next-app-router'
  | 'state-data'
  | 'performance-optimization'
  | 'frontend-system-design';

export interface InterviewSeniorAnswer {
  summary: string;
  deepDive: string;
  codeExample?: string;
}

export interface InterviewQuestion {
  id: string;
  category: Exclude<InterviewCategory, 'all'>;
  level: InterviewLevel;
  question: string;
  interviewerIntent: string;
  contextOrScenario?: string;
  expectedKeywords: string[];
  seniorAnswer: InterviewSeniorAnswer;
  pitfalls: string[];
  followUpQuestions: string[];
}

export interface BugHuntChallenge {
  id: string;
  title: string;
  level: InterviewLevel;
  category: Exclude<InterviewCategory, 'all'>;
  scenario: string;
  buggyCode: string;
  hints: string[];
  bugExplanation: string;
  fixedCode: string;
}

export interface MockInterviewResult {
  id: string;
  questionId: string;
  questionText: string;
  userAnswer: string;
  timeSpentSeconds: number;
  matchedKeywords: string[];
  totalExpectedKeywords: number;
  score: number; // 0-100
  evaluatedAt: string;
  feedback: string;
}
