import { InterviewQuestion } from '../types';
import reactBankQuestions from './json/react-bank.json';
import nextjsBankQuestions from './json/nextjs-bank.json';
import typescriptBankQuestions from './json/typescript-bank.json';
import javascriptBankQuestions from './json/javascript-bank.json';
import goBankQuestions from './json/go-bank.json';
import nestjsBankQuestions from './json/nestjs-bank.json';
import nodejsBankQuestions from './json/nodejs-bank.json';
import pythonBankQuestions from './json/python-bank.json';
import djangoBankQuestions from './json/django-bank.json';
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
import designPatternsBankQuestions from './json/design-patterns-bank.json';
import microFrontendBankQuestions from './json/micro-frontend-bank.json';
import businessAnalystBankQuestions from './json/business-analyst-bank.json';
import aiBankQuestions from './json/ai-bank.json';
import databaseBankQuestions from './json/database-bank.json';
import devopsBankQuestions from './json/devops-bank.json';
import iosBankQuestions from './json/ios-bank.json';
import qaTestingBankQuestions from './json/qa-testing-bank.json';
import dsaBankQuestions from './json/dsa-bank.json';
import csFundamentalsBankQuestions from './json/cs-fundamentals-bank.json';
import dataEngineeringBankQuestions from './json/data-engineering-bank.json';
import cybersecurityBankQuestions from './json/cybersecurity-bank.json';
import behavioralBankQuestions from './json/behavioral-bank.json';
import rustBankQuestions from './json/rust-bank.json';
import shellLinuxBankQuestions from './json/shell-linux-bank.json';
import vueBankQuestions from './json/vue-bank.json';
import angularBankQuestions from './json/angular-bank.json';
import javaBankQuestions from './json/java-bank.json';
import springBankQuestions from './json/spring-bank.json';
import csharpBankQuestions from './json/csharp-bank.json';
import phpBankQuestions from './json/php-bank.json';
import laravelBankQuestions from './json/laravel-bank.json';
import rubyBankQuestions from './json/ruby-bank.json';
import railsBankQuestions from './json/rails-bank.json';
import cppBankQuestions from './json/cpp-bank.json';
import flutterBankQuestions from './json/flutter-bank.json';
import androidBankQuestions from './json/android-bank.json';
import reactNativeBankQuestions from './json/react-native-bank.json';
import graphqlBankQuestions from './json/graphql-bank.json';
import fastapiBankQuestions from './json/fastapi-bank.json';
import stateManagementBankQuestions from './json/state-management-bank.json';
import performanceBankQuestions from './json/performance-bank.json';
import buildToolsBankQuestions from './json/build-tools-bank.json';
import seoBankQuestions from './json/seo-bank.json';
import backendApiBankQuestions from './json/backend-api-bank.json';
import frontendCoreBankQuestions from './json/frontend-core-bank.json';
import backendCoreBankQuestions from './json/backend-core-bank.json';

export const DEFAULT_JSON_QUESTION_BANKS: InterviewQuestion[] = [
  ...(reactBankQuestions as InterviewQuestion[]),
  ...(nextjsBankQuestions as InterviewQuestion[]),
  ...(typescriptBankQuestions as InterviewQuestion[]),
  ...(javascriptBankQuestions as InterviewQuestion[]),
  ...(htmlBankQuestions as InterviewQuestion[]),
  ...(cssBankQuestions as InterviewQuestion[]),
  ...(systemDesignBankQuestions as InterviewQuestion[]),
  ...(designPatternsBankQuestions as InterviewQuestion[]),
  ...(microFrontendBankQuestions as InterviewQuestion[]),
  ...(goBankQuestions as InterviewQuestion[]),
  ...(nestjsBankQuestions as InterviewQuestion[]),
  ...(nodejsBankQuestions as InterviewQuestion[]),
  ...(pythonBankQuestions as InterviewQuestion[]),
  ...(djangoBankQuestions as InterviewQuestion[]),
  ...(businessAnalystBankQuestions as InterviewQuestion[]),
  ...(aiBankQuestions as InterviewQuestion[]),
  ...(databaseBankQuestions as InterviewQuestion[]),
  ...(devopsBankQuestions as InterviewQuestion[]),
  ...(iosBankQuestions as InterviewQuestion[]),
  ...(qaTestingBankQuestions as InterviewQuestion[]),
  ...(dsaBankQuestions as InterviewQuestion[]),
  ...(csFundamentalsBankQuestions as InterviewQuestion[]),
  ...(dataEngineeringBankQuestions as InterviewQuestion[]),
  ...(cybersecurityBankQuestions as InterviewQuestion[]),
  ...(behavioralBankQuestions as InterviewQuestion[]),
  ...(rustBankQuestions as InterviewQuestion[]),
  ...(shellLinuxBankQuestions as InterviewQuestion[]),
  ...(vueBankQuestions as InterviewQuestion[]),
  ...(angularBankQuestions as InterviewQuestion[]),
  ...(javaBankQuestions as InterviewQuestion[]),
  ...(springBankQuestions as InterviewQuestion[]),
  ...(csharpBankQuestions as InterviewQuestion[]),
  ...(phpBankQuestions as InterviewQuestion[]),
  ...(laravelBankQuestions as InterviewQuestion[]),
  ...(rubyBankQuestions as InterviewQuestion[]),
  ...(railsBankQuestions as InterviewQuestion[]),
  ...(cppBankQuestions as InterviewQuestion[]),
  ...(flutterBankQuestions as InterviewQuestion[]),
  ...(androidBankQuestions as InterviewQuestion[]),
  ...(reactNativeBankQuestions as InterviewQuestion[]),
  ...(graphqlBankQuestions as InterviewQuestion[]),
  ...(fastapiBankQuestions as InterviewQuestion[]),
  ...(stateManagementBankQuestions as InterviewQuestion[]),
  ...(performanceBankQuestions as InterviewQuestion[]),
  ...(buildToolsBankQuestions as InterviewQuestion[]),
  ...(seoBankQuestions as InterviewQuestion[]),
  ...(backendApiBankQuestions as InterviewQuestion[]),
  ...(frontendCoreBankQuestions as InterviewQuestion[]),
  ...(backendCoreBankQuestions as InterviewQuestion[]),
  ...(nextjsQuestions as InterviewQuestion[]),
  ...(react19Questions as InterviewQuestion[]),
  ...(jsTsQuestions as InterviewQuestion[]),
  ...(javascriptAdvancedQuestions as InterviewQuestion[]),
  ...(browserWorkerQuestions as InterviewQuestion[]),
  ...(frontendOpenEndedQuestions as InterviewQuestion[]),
  ...(systemDesignQuestions as InterviewQuestion[]),
  ...(perfQuestions as InterviewQuestion[]),
];

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
