export type TopicId = 'cca-f' | 'ccao-f' | 'ccar-p';
export type Session = {
  kind: 'password_setup' | 'authenticated';
  expiresAt: string;
  user: { id: string; username: string; role: 'admin' | 'student' };
};
export type Topic = {
  id: TopicId;
  title: string;
  questionCount: number;
  excludedCount: number;
  questionsPerExam: number;
  durationMinutes: number;
  formCount: number;
};
export type Question = {
  id: string;
  prompt: string;
  type: 'single_choice' | 'multiple_response';
  choices: { id: string; text: string }[];
  requiredSelectionCount: number;
};
export type Attempt = {
  id: string;
  topicId: TopicId;
  formNumber: number;
  serverNow: number;
  expiresAt: number;
  questions: Question[];
};
export type Summary = {
  id: string;
  topicId: TopicId;
  formNumber: number;
  total: number;
  correct: number;
  wrong: number;
  unanswered: number;
  percent: number;
  simulatedScore: number;
  reason: 'submitted' | 'timeout' | 'abandoned';
  endedAt: number;
};
export type AttemptStatus =
  { status: 'active'; serverNow: number; expiresAt: number } | Summary;

export const TOPICS: Topic[] = [
  {
    id: 'cca-f',
    title: 'Architect · Foundations',
    questionCount: 162,
    excludedCount: 0,
    questionsPerExam: 60,
    durationMinutes: 120,
    formCount: 10,
  },
  {
    id: 'ccao-f',
    title: 'Associate · Foundations',
    questionCount: 145,
    excludedCount: 0,
    questionsPerExam: 60,
    durationMinutes: 120,
    formCount: 10,
  },
  {
    id: 'ccar-p',
    title: 'Architect · Professional',
    questionCount: 149,
    excludedCount: 3,
    questionsPerExam: 63,
    durationMinutes: 120,
    formCount: 10,
  },
];

export const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);
export const isTopicId = (value: unknown): value is TopicId =>
  value === 'cca-f' || value === 'ccao-f' || value === 'ccar-p';
const number = (value: unknown): value is number =>
  typeof value === 'number' && Number.isFinite(value) && value >= 0;
const integer = (value: unknown): value is number =>
  number(value) && Number.isInteger(value);
const invalid = (): never => {
  throw new Error('Dữ liệu phòng thi không hợp lệ. Vui lòng tải lại sau.');
};

export function parseSession(value: unknown): Session {
  if (
    !isRecord(value) ||
    (value.kind !== 'password_setup' && value.kind !== 'authenticated') ||
    typeof value.expiresAt !== 'string' ||
    !Number.isFinite(Date.parse(value.expiresAt)) ||
    !isRecord(value.user) ||
    typeof value.user.id !== 'string' ||
    typeof value.user.username !== 'string' ||
    (value.user.role !== 'admin' && value.user.role !== 'student')
  )
    return invalid();
  return {
    kind: value.kind,
    expiresAt: value.expiresAt,
    user: { id: value.user.id, username: value.user.username, role: value.user.role },
  };
}

export function parseSummary(value: unknown): Summary {
  if (
    !isRecord(value) ||
    typeof value.id !== 'string' ||
    !isTopicId(value.topicId) ||
    !integer(value.formNumber) ||
    value.formNumber < 1 ||
    value.formNumber > 10 ||
    !integer(value.total) ||
    value.total < 1 ||
    !integer(value.correct) ||
    !integer(value.wrong) ||
    !integer(value.unanswered) ||
    value.correct + value.wrong + value.unanswered !== value.total ||
    !number(value.percent) ||
    value.percent > 100 ||
    !integer(value.simulatedScore) ||
    value.simulatedScore > 1000 ||
    !number(value.endedAt) ||
    !['submitted', 'timeout', 'abandoned'].some((reason) => reason === value.reason)
  )
    return invalid();
  const reason = value.reason;
  if (reason !== 'submitted' && reason !== 'timeout' && reason !== 'abandoned')
    return invalid();
  // Select only aggregate fields, even if an API/storage entry has extra properties.
  return {
    id: value.id,
    topicId: value.topicId,
    formNumber: value.formNumber,
    total: value.total,
    correct: value.correct,
    wrong: value.wrong,
    unanswered: value.unanswered,
    percent: value.percent,
    simulatedScore: value.simulatedScore,
    reason,
    endedAt: value.endedAt,
  };
}

export function parseResults(value: unknown): Summary[] {
  if (!Array.isArray(value) || value.length > 30) return invalid();
  return value.map(parseSummary);
}

export function parseCatalog(value: unknown): Topic[] {
  if (!isRecord(value) || !Array.isArray(value.topics) || value.topics.length !== 3)
    return invalid();
  return value.topics.map((topic: unknown) => {
    if (
      !isRecord(topic) ||
      !isTopicId(topic.id) ||
      typeof topic.title !== 'string' ||
      !integer(topic.questionCount) ||
      !integer(topic.excludedCount) ||
      !integer(topic.questionsPerExam) ||
      !integer(topic.durationMinutes) ||
      topic.formCount !== 10
    )
      return invalid();
    return {
      id: topic.id,
      title: topic.title,
      questionCount: topic.questionCount,
      excludedCount: topic.excludedCount,
      questionsPerExam: topic.questionsPerExam,
      durationMinutes: topic.durationMinutes,
      formCount: topic.formCount,
    };
  });
}

export function parseAttempt(value: unknown): Attempt {
  if (
    !isRecord(value) ||
    typeof value.id !== 'string' ||
    !isTopicId(value.topicId) ||
    !integer(value.formNumber) ||
    !number(value.serverNow) ||
    !number(value.expiresAt) ||
    !Array.isArray(value.questions)
  )
    return invalid();
  const questions = value.questions.map((q: unknown): Question => {
    if (
      !isRecord(q) ||
      typeof q.id !== 'string' ||
      typeof q.prompt !== 'string' ||
      (q.type !== 'single_choice' && q.type !== 'multiple_response') ||
      !integer(q.requiredSelectionCount) ||
      q.requiredSelectionCount < 1 ||
      !Array.isArray(q.choices)
    )
      return invalid();
    const choices = q.choices.map((c: unknown) => {
      if (!isRecord(c) || typeof c.id !== 'string' || typeof c.text !== 'string')
        return invalid();
      return { id: c.id, text: c.text };
    });
    return {
      id: q.id,
      prompt: q.prompt,
      type: q.type,
      requiredSelectionCount: q.requiredSelectionCount,
      choices,
    };
  });
  return {
    id: value.id,
    topicId: value.topicId,
    formNumber: value.formNumber,
    serverNow: value.serverNow,
    expiresAt: value.expiresAt,
    questions,
  };
}

export function parseStatus(value: unknown): AttemptStatus {
  if (
    isRecord(value) &&
    value.status === 'active' &&
    number(value.serverNow) &&
    number(value.expiresAt)
  ) {
    return { status: 'active', serverNow: value.serverNow, expiresAt: value.expiresAt };
  }
  return parseSummary(value);
}
