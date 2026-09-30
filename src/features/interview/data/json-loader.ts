import { InterviewCategory, InterviewQuestion } from '../types';

// Core Question Banks (Initial Bundle ~2.7MB raw instead of 13MB)
import reactBankQuestions from './json/react-bank.json';
import nextjsBankQuestions from './json/nextjs-bank.json';
import typescriptBankQuestions from './json/typescript-bank.json';
import javascriptBankQuestions from './json/javascript-bank.json';
import nextjsQuestions from './json/nextjs-app-router.json';
import react19Questions from './json/react19-core.json';
import jsTsQuestions from './json/javascript-typescript.json';
import javascriptAdvancedQuestions from './json/javascript-advanced.json';
import browserWorkerQuestions from './json/browser-workers.json';
import frontendOpenEndedQuestions from './json/frontend-open-ended.json';
import systemDesignQuestions from './json/frontend-system-design.json';
import perfQuestions from './json/web-performance-security.json';
import htmlBankQuestions from './json/html-bank.json';
import cssBankQuestions from './json/css-bank.json';
import systemDesignBankQuestions from './json/system-design-bank.json';
import frontendCoreBankQuestions from './json/frontend-core-bank.json';

/**
 * Precomputed exact question counts across all 57 question banks (3,329 questions).
 * Allows instant, zero-latency rendering of category filter badges without loading 13MB of JSON upfront.
 */
export const STATIC_CATEGORY_COUNTS: Record<string, number> = {
  all: 3329,
  react: 107,
  'react-19': 7,
  nextjs: 100,
  'next-app-router': 8,
  typescript: 82,
  javascript: 112,
  'javascript-typescript': 7,
  'browser-runtime-workers': 5,
  html: 78,
  css: 100,
  'system-design': 109,
  'frontend-system-design': 9,
  'frontend-core': 100,
  'design-patterns': 56,
  'micro-frontend': 22,
  go: 99,
  nestjs: 59,
  nodejs: 89,
  python: 83,
  django: 84,
  'business-analyst': 100,
  ai: 120,
  database: 115,
  devops: 95,
  'devops-cloud': 95,
  ios: 50,
  android: 71,
  'react-native': 74,
  flutter: 81,
  'qa-testing': 40,
  'testing-qa': 40,
  dsa: 45,
  'cs-fundamentals': 35,
  'data-engineering': 30,
  cybersecurity: 30,
  behavioral: 25,
  'behavioral-hr': 25,
  rust: 25,
  'shell-linux': 20,
  vue: 64,
  angular: 67,
  java: 100,
  spring: 100,
  csharp: 100,
  php: 43,
  laravel: 55,
  ruby: 61,
  rails: 71,
  cpp: 57,
  graphql: 40,
  fastapi: 54,
  'state-management': 75,
  performance: 37,
  'performance-optimization': 3,
  'build-tools': 15,
  seo: 24,
  'backend-api': 137,
  'backend-core': 100,
};

export const CORE_JSON_QUESTION_BANKS: InterviewQuestion[] = [
  ...(reactBankQuestions as InterviewQuestion[]),
  ...(nextjsBankQuestions as InterviewQuestion[]),
  ...(typescriptBankQuestions as InterviewQuestion[]),
  ...(javascriptBankQuestions as InterviewQuestion[]),
  ...(htmlBankQuestions as InterviewQuestion[]),
  ...(cssBankQuestions as InterviewQuestion[]),
  ...(systemDesignBankQuestions as InterviewQuestion[]),
  ...(frontendCoreBankQuestions as InterviewQuestion[]),
  ...(nextjsQuestions as InterviewQuestion[]),
  ...(react19Questions as InterviewQuestion[]),
  ...(jsTsQuestions as InterviewQuestion[]),
  ...(javascriptAdvancedQuestions as InterviewQuestion[]),
  ...(browserWorkerQuestions as InterviewQuestion[]),
  ...(frontendOpenEndedQuestions as InterviewQuestion[]),
  ...(systemDesignQuestions as InterviewQuestion[]),
  ...(perfQuestions as InterviewQuestion[]),
];

export const DEFAULT_JSON_QUESTION_BANKS: InterviewQuestion[] = CORE_JSON_QUESTION_BANKS;

/**
 * Dynamic on-demand loaders for 41 specialized domain question banks.
 * Webpack splits each into its own independent chunk, downloaded only when the category is selected.
 */
export const DOMAIN_BANK_LOADERS: Record<string, () => Promise<{ default: unknown }>> = {
  ai: () => import('./json/ai-bank.json'),
  android: () => import('./json/android-bank.json'),
  angular: () => import('./json/angular-bank.json'),
  'backend-api': () => import('./json/backend-api-bank.json'),
  'backend-core': () => import('./json/backend-core-bank.json'),
  behavioral: () => import('./json/behavioral-bank.json'),
  'behavioral-hr': () => import('./json/behavioral-bank.json'),
  'build-tools': () => import('./json/build-tools-bank.json'),
  'business-analyst': () => import('./json/business-analyst-bank.json'),
  cpp: () => import('./json/cpp-bank.json'),
  'cs-fundamentals': () => import('./json/cs-fundamentals-bank.json'),
  csharp: () => import('./json/csharp-bank.json'),
  cybersecurity: () => import('./json/cybersecurity-bank.json'),
  'data-engineering': () => import('./json/data-engineering-bank.json'),
  database: () => import('./json/database-bank.json'),
  'design-patterns': () => import('./json/design-patterns-bank.json'),
  devops: () => import('./json/devops-bank.json'),
  'devops-cloud': () => import('./json/devops-bank.json'),
  django: () => import('./json/django-bank.json'),
  dsa: () => import('./json/dsa-bank.json'),
  fastapi: () => import('./json/fastapi-bank.json'),
  flutter: () => import('./json/flutter-bank.json'),
  go: () => import('./json/go-bank.json'),
  graphql: () => import('./json/graphql-bank.json'),
  ios: () => import('./json/ios-bank.json'),
  java: () => import('./json/java-bank.json'),
  laravel: () => import('./json/laravel-bank.json'),
  'micro-frontend': () => import('./json/micro-frontend-bank.json'),
  nestjs: () => import('./json/nestjs-bank.json'),
  nodejs: () => import('./json/nodejs-bank.json'),
  performance: () => import('./json/performance-bank.json'),
  'performance-optimization': () => import('./json/performance-bank.json'),
  php: () => import('./json/php-bank.json'),
  python: () => import('./json/python-bank.json'),
  'qa-testing': () => import('./json/qa-testing-bank.json'),
  'testing-qa': () => import('./json/qa-testing-bank.json'),
  rails: () => import('./json/rails-bank.json'),
  'react-native': () => import('./json/react-native-bank.json'),
  ruby: () => import('./json/ruby-bank.json'),
  rust: () => import('./json/rust-bank.json'),
  seo: () => import('./json/seo-bank.json'),
  'shell-linux': () => import('./json/shell-linux-bank.json'),
  spring: () => import('./json/spring-bank.json'),
  'state-management': () => import('./json/state-management-bank.json'),
  vue: () => import('./json/vue-bank.json'),
};

const LOADED_CHUNKS_CACHE = new Map<string, InterviewQuestion[]>();

/**
 * Asynchronously load questions for a specific category on-demand
 */
export async function loadCategoryQuestions(
  category: InterviewCategory | string
): Promise<InterviewQuestion[]> {
  if (category === 'all') {
    return CORE_JSON_QUESTION_BANKS;
  }

  // 1. Check in-memory cache
  if (LOADED_CHUNKS_CACHE.has(category)) {
    return LOADED_CHUNKS_CACHE.get(category)!;
  }

  // 2. Check if already in core banks
  const coreMatches = CORE_JSON_QUESTION_BANKS.filter(
    (q) => q.category === category || (category === 'react' && q.category === 'react-19')
  );
  if (coreMatches.length > 0) {
    return coreMatches;
  }

  // 3. Load dynamic chunk
  const loader = DOMAIN_BANK_LOADERS[category];
  if (loader) {
    try {
      const bankMod = await loader();
      const questions = bankMod.default as InterviewQuestion[];
      LOADED_CHUNKS_CACHE.set(category, questions);
      return questions;
    } catch (err) {
      console.error(
        `Failed to dynamic-load question bank for category "${category}":`,
        err
      );
      return [];
    }
  }

  return [];
}

/**
 * Loads all question banks (Core + all 41 Domain chunks) on-demand (e.g. for full JSON export)
 */
export async function loadAllQuestionBanks(): Promise<InterviewQuestion[]> {
  const allLoaded = [...CORE_JSON_QUESTION_BANKS];
  const uniqueLoaders = new Map<string, () => Promise<{ default: unknown }>>();

  for (const [key, loader] of Object.entries(DOMAIN_BANK_LOADERS)) {
    if (!uniqueLoaders.has(loader.toString())) {
      uniqueLoaders.set(key, loader);
    }
  }

  const results = await Promise.allSettled(
    Array.from(uniqueLoaders.entries()).map(async ([cat, loader]) => {
      if (LOADED_CHUNKS_CACHE.has(cat)) {
        return LOADED_CHUNKS_CACHE.get(cat)!;
      }
      const mod = await loader();
      const questions = mod.default as InterviewQuestion[];
      LOADED_CHUNKS_CACHE.set(cat, questions);
      return questions;
    })
  );

  const seenIds = new Set(allLoaded.map((q) => q.id));
  for (const res of results) {
    if (res.status === 'fulfilled') {
      for (const q of res.value) {
        if (!seenIds.has(q.id)) {
          seenIds.add(q.id);
          allLoaded.push(q);
        }
      }
    }
  }

  return allLoaded;
}

/**
 * Validate imported JSON data shape
 */
export function validateQuestionBankJson(data: unknown): {
  valid: boolean;
  questions?: InterviewQuestion[];
  error?: string;
} {
  if (!Array.isArray(data)) {
    return { valid: false, error: 'File JSON phải là một mảng (Array) các câu hỏi.' };
  }

  for (let i = 0; i < data.length; i++) {
    const item = data[i];
    if (!item.id || typeof item.id !== 'string') {
      return { valid: false, error: `Phần tử vị trí ${i + 1} thiếu trường "id" hợp lệ.` };
    }
    if (!item.question || typeof item.question !== 'string') {
      return {
        valid: false,
        error: `Câu hỏi id "${item.id}" thiếu nội dung "question".`,
      };
    }
    if (!item.category || typeof item.category !== 'string') {
      return { valid: false, error: `Câu hỏi id "${item.id}" thiếu "category".` };
    }
    if (!item.level || typeof item.level !== 'string') {
      return { valid: false, error: `Câu hỏi id "${item.id}" thiếu "level".` };
    }
    if (!Array.isArray(item.expectedKeywords)) {
      return {
        valid: false,
        error: `Câu hỏi id "${item.id}" thiếu mảng từ khóa "expectedKeywords".`,
      };
    }
    if (!item.seniorAnswer || typeof item.seniorAnswer.summary !== 'string') {
      return {
        valid: false,
        error: `Câu hỏi id "${item.id}" thiếu cấu trúc "seniorAnswer.summary".`,
      };
    }
    const answer = item.seniorAnswer as Record<string, unknown>;
    for (const field of ['reasoningSteps', 'tradeoffs', 'verification'] as const) {
      if (answer[field] !== undefined && !Array.isArray(answer[field])) {
        return {
          valid: false,
          error: `Câu hỏi id "${item.id}" có "seniorAnswer.${field}" không hợp lệ.`,
        };
      }
    }
    if (
      answer.diagram !== undefined &&
      (typeof answer.diagram !== 'object' || answer.diagram === null)
    ) {
      return {
        valid: false,
        error: `Câu hỏi id "${item.id}" có "seniorAnswer.diagram" không hợp lệ.`,
      };
    }
    if (item.evaluationRubric !== undefined) {
      const rubric = item.evaluationRubric as Record<string, unknown>;
      if (
        !Array.isArray(rubric.baseline) ||
        !Array.isArray(rubric.strong) ||
        !Array.isArray(rubric.exceptional)
      ) {
        return {
          valid: false,
          error: `Câu hỏi id "${item.id}" có "evaluationRubric" không hợp lệ.`,
        };
      }
    }
    if (item.references !== undefined && !Array.isArray(item.references)) {
      return {
        valid: false,
        error: `Câu hỏi id "${item.id}" có "references" không hợp lệ.`,
      };
    }
  }

  return { valid: true, questions: data as InterviewQuestion[] };
}
