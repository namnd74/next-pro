export type InterviewLevel = 'junior' | 'middle' | 'senior' | 'lead';

export type InterviewCategory =
  | 'all'
  | 'react'
  | 'nextjs'
  | 'typescript'
  | 'javascript'
  | 'html'
  | 'css'
  | 'system-design'
  | 'design-patterns'
  | 'micro-frontend'
  | 'go'
  | 'nestjs'
  | 'nodejs'
  | 'python'
  | 'django'
  | 'react-19'
  | 'next-app-router'
  | 'javascript-typescript'
  | 'browser-runtime-workers'
  | 'state-data'
  | 'performance-optimization'
  | 'frontend-system-design'
  | 'business-analyst'
  | 'ai'
  | 'database'
  | 'devops-cloud'
  | 'ios'
  | 'testing-qa'
  | 'dsa'
  | 'cs-fundamentals'
  | 'data-engineering'
  | 'cybersecurity'
  | 'behavioral-hr'
  | 'rust'
  | 'shell-linux'
  | 'vue'
  | 'angular'
  | 'java'
  | 'spring'
  | 'csharp'
  | 'php'
  | 'laravel'
  | 'ruby'
  | 'rails'
  | 'cpp'
  | 'flutter'
  | 'android'
  | 'react-native'
  | 'graphql'
  | 'fastapi'
  | 'state-management'
  | 'performance'
  | 'build-tools'
  | 'seo'
  | 'backend-api'
  | 'frontend-core'
  | 'backend-core';

export type DiagramType = 'mermaid' | 'pipeline' | 'svg';

export interface PipelineStage {
  name: string;
  tool?: string;
  icon?: string;
  description: string;
  metric?: string;
  rollback?: string;
}

export interface InterviewDiagramSpec {
  type: DiagramType;
  title?: string;
  caption?: string;
  code?: string;
  stages?: PipelineStage[];
}

export interface InterviewSeniorAnswer {
  summary: string;
  mentalModel?: string;
  reasoningSteps?: string[];
  deepDive: string;
  tradeoffs?: string[];
  verification?: string[];
  codeExample?: string;
  codeLanguage?: string;
  diagram?: InterviewDiagramSpec;
}

export interface InterviewEvaluationRubric {
  baseline: string[];
  strong: string[];
  exceptional: string[];
}

export interface InterviewReference {
  title: string;
  url: string;
}

export interface InterviewFollowUpItem {
  question: string;
  answer: string;
  codeExample?: string;
  codeLanguage?: string;
}

export type InterviewFollowUp = string | InterviewFollowUpItem;

export interface InterviewQuestion {
  id: string;
  category: Exclude<InterviewCategory, 'all'>;
  level: InterviewLevel;
  question: string;
  interviewerIntent: string;
  contextOrScenario?: string;
  expectedKeywords: string[];
  seniorAnswer: InterviewSeniorAnswer;
  evaluationRubric?: InterviewEvaluationRubric;
  references?: InterviewReference[];
  pitfalls: string[];
  followUpQuestions: InterviewFollowUp[];
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
