export interface ReviewTopic {
  id: string;
  name: string;
  questionCount: number;
}

export interface ReviewChoice {
  id: string;
  text: string;
}

export interface QuestionKeywordMapping {
  choiceId: string;
  questionKeywords: string[];
  answerKeyword: string;
  choiceTextVi: string;
  whyVi: string;
}

export interface QuestionStudyGuide {
  promptVi: string;
  choicesVi: ReviewChoice[];
  questionKeywords: string[];
  answerKeywords: string[];
  quickFormulaVi?: string;
  keywordMappings?: QuestionKeywordMapping[];
  explanationVi: string;
}

export interface ReviewQuestion {
  id: string;
  type: 'single_choice' | 'multiple_response';
  prompt: string;
  choices: ReviewChoice[];
  correctChoiceIds: string[];
  studyGuide?: QuestionStudyGuide;
}

export type ReviewSession =
  | {
      kind: 'authenticated';
      user: { id: string; username: string; role: string };
      expiresAt: string;
    }
  | { kind: 'password_setup' }
  | null;

function record(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw new Error('Dữ liệu API ôn tập không đúng định dạng.');
  }
  return value as Record<string, unknown>;
}

function items(payload: unknown, field: string): unknown[] {
  const body = record(payload);
  if (Array.isArray(body[field])) return body[field];
  throw new Error('Dữ liệu API ôn tập không đúng định dạng.');
}

function text(value: unknown): string {
  if (typeof value !== 'string' || !value.trim()) {
    throw new Error('Dữ liệu API ôn tập thiếu nội dung bắt buộc.');
  }
  return value;
}

function textArray(value: unknown, label: string): string[] {
  if (!Array.isArray(value)) {
    throw new Error(`Dữ liệu ${label} không đúng định dạng.`);
  }
  return value.map(text);
}

function parseChoices(value: unknown, label: string): ReviewChoice[] {
  if (!Array.isArray(value) || !value.length) {
    throw new Error(label);
  }
  return value.map((item) => {
    const choice = record(item);
    return { id: text(choice.id), text: text(choice.text) };
  });
}

function parseKeywordMappings(
  value: unknown,
  choiceIds: Set<string>
): QuestionKeywordMapping[] | undefined {
  if (value === undefined || value === null) return undefined;
  if (!Array.isArray(value) || !value.length) {
    throw new Error('Dữ liệu ánh xạ từ khóa (keywordMappings) không đúng định dạng.');
  }
  return value.map((item) => {
    const entry = record(item);
    const choiceId = text(entry.choiceId);
    if (!choiceIds.has(choiceId)) {
      throw new Error(
        `Mã lựa chọn ${choiceId} trong keywordMappings không tồn tại trong câu hỏi.`
      );
    }
    const questionKeywords = textArray(
      entry.questionKeywords,
      'từ khóa câu hỏi trong keywordMappings'
    );
    if (!questionKeywords.length) {
      throw new Error('keywordMappings thiếu từ khóa câu hỏi.');
    }
    return {
      choiceId,
      questionKeywords,
      answerKeyword: text(entry.answerKeyword),
      choiceTextVi: text(entry.choiceTextVi),
      whyVi: text(entry.whyVi),
    };
  });
}

function parseStudyGuide(
  value: unknown,
  choiceIds: Set<string>
): QuestionStudyGuide | undefined {
  if (value === undefined || value === null) return undefined;
  const guide = record(value);
  const choicesVi = parseChoices(
    guide.choicesVi,
    'Dữ liệu bản dịch lựa chọn (choicesVi) bị thiếu.'
  );
  const choiceViIds = new Set(choicesVi.map((choice) => choice.id));
  if (
    choicesVi.length !== choiceIds.size ||
    choiceViIds.size !== choiceIds.size ||
    choicesVi.some((choice) => !choiceIds.has(choice.id))
  ) {
    throw new Error('Danh sách lựa chọn tiếng Việt không khớp với câu hỏi gốc.');
  }
  const quickFormulaVi =
    guide.quickFormulaVi !== undefined && guide.quickFormulaVi !== null
      ? text(guide.quickFormulaVi)
      : undefined;
  const keywordMappings = parseKeywordMappings(guide.keywordMappings, choiceIds);
  return {
    promptVi: text(guide.promptVi),
    choicesVi,
    questionKeywords: textArray(guide.questionKeywords, 'từ khóa câu hỏi'),
    answerKeywords: textArray(guide.answerKeywords, 'từ khóa đáp án'),
    ...(quickFormulaVi ? { quickFormulaVi } : {}),
    ...(keywordMappings ? { keywordMappings } : {}),
    explanationVi: text(guide.explanationVi),
  };
}

export function parseReviewSession(payload: unknown): ReviewSession {
  const session = record(payload).session;
  if (session === null) return null;
  const value = record(session);
  if (value.kind === 'password_setup') return { kind: 'password_setup' };
  if (value.kind !== 'authenticated') throw new Error('Phiên đăng nhập không hợp lệ.');
  const user = record(value.user);
  const expiresAt = text(value.expiresAt);
  if (!Number.isFinite(Date.parse(expiresAt)))
    throw new Error('Phiên đăng nhập không hợp lệ.');
  return {
    kind: 'authenticated',
    user: { id: text(user.id), username: text(user.username), role: text(user.role) },
    expiresAt,
  };
}

export function parseReviewTopics(payload: unknown): ReviewTopic[] {
  return items(payload, 'topics').map((value) => {
    const topic = record(value);
    if (!Number.isInteger(topic.questionCount) || (topic.questionCount as number) < 0) {
      throw new Error('Số câu hỏi của chủ đề không hợp lệ.');
    }
    return {
      id: text(topic.id),
      name: text(topic.name),
      questionCount: topic.questionCount as number,
    };
  });
}

export function parseReviewQuestions(payload: unknown): ReviewQuestion[] {
  const questions = items(payload, 'questions');
  if (record(payload).total !== questions.length) {
    throw new Error('API chưa trả đầy đủ bộ câu hỏi của chủ đề.');
  }
  return questions.map((value) => {
    const question = record(value);
    if (question.type !== 'single_choice' && question.type !== 'multiple_response') {
      throw new Error('Loại câu hỏi ôn tập không hợp lệ.');
    }
    const choices = parseChoices(question.choices, 'Câu hỏi ôn tập thiếu lựa chọn.');
    const choiceIds = new Set(choices.map((choice) => choice.id));
    if (choiceIds.size !== choices.length) throw new Error('Mã lựa chọn bị trùng.');
    if (!Array.isArray(question.correctChoiceIds) || !question.correctChoiceIds.length) {
      throw new Error('Câu hỏi ôn tập chưa có đáp án đúng.');
    }
    const correctChoiceIds = question.correctChoiceIds.map(text);
    if (correctChoiceIds.some((id) => !choiceIds.has(id))) {
      throw new Error('Đáp án đúng không khớp với lựa chọn của câu hỏi.');
    }
    if (question.type === 'single_choice' && correctChoiceIds.length !== 1) {
      throw new Error('Câu hỏi một đáp án có dữ liệu đáp án không hợp lệ.');
    }
    const studyGuide = parseStudyGuide(question.studyGuide, choiceIds);
    return {
      id: text(question.id),
      type: question.type,
      prompt: text(question.prompt),
      choices,
      correctChoiceIds,
      ...(studyGuide ? { studyGuide } : {}),
    };
  });
}
