import { InterviewQuestion } from '../types';
import nextjsQuestions from './json/nextjs-app-router.json';
import react19Questions from './json/react19-core.json';
import jsTsQuestions from './json/javascript-typescript.json';
import systemDesignQuestions from './json/frontend-system-design.json';
import perfQuestions from './json/web-performance-security.json';

export const DEFAULT_JSON_QUESTION_BANKS: InterviewQuestion[] = [
  ...(nextjsQuestions as InterviewQuestion[]),
  ...(react19Questions as InterviewQuestion[]),
  ...(jsTsQuestions as InterviewQuestion[]),
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
  }

  return { valid: true, questions: data as InterviewQuestion[] };
}
