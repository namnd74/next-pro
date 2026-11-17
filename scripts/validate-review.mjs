import assert from 'node:assert/strict';
import { test } from 'node:test';
import {
  parseReviewTopics,
  parseReviewQuestions,
  parseReviewSession,
} from '../src/features/cca/review-contracts.ts';

test('reads topic counts from the review API', () => {
  assert.deepEqual(
    parseReviewTopics({
      topics: [{ id: 'cca-f', name: 'Architect · Foundations', questionCount: 162 }],
    }),
    [{ id: 'cca-f', name: 'Architect · Foundations', questionCount: 162 }]
  );
});

test('keeps the full question set and resolves the correct option', () => {
  const questions = Array.from({ length: 25 }, (_, i) => ({
    id: `q-${i}`,
    type: 'single_choice',
    prompt: `Question ${i}`,
    choices: [
      { id: 'A', text: 'First' },
      { id: 'B', text: 'Second' },
    ],
    correctChoiceIds: ['B'],
  }));
  const result = parseReviewQuestions({ topicId: 'cca-f', total: 25, questions });
  assert.equal(result.length, 25);
  assert.deepEqual(result[24].correctChoiceIds, ['B']);
  assert.equal(result[24].prompt, 'Question 24');
});

test('parses question studyGuide contract including promptVi, choicesVi, keywords, and explanationVi', () => {
  const payload = {
    topicId: 'ccar-p',
    total: 1,
    questions: [
      {
        id: 'ccar-p-001',
        type: 'multiple_response',
        prompt:
          'A managed agent deployment for claims triage has grown from 6 tools to 34 tools over 18 months as product teams added capabilities.',
        choices: [
          {
            id: 'A',
            text: 'The router pattern is well-documented across publicly available agent literature.',
          },
          {
            id: 'B',
            text: 'The proposed router introduces an additional model call on every incoming request.',
          },
          {
            id: 'C',
            text: 'The 34 tools serve four distinct claim workflow domains within the triage scope.',
          },
        ],
        correctChoiceIds: ['B', 'C'],
        studyGuide: {
          promptVi:
            'Một hệ thống managed agent để phân loại yêu cầu bồi thường (claims triage) đã tăng từ 6 tools lên 34 tools...',
          choicesVi: [
            {
              id: 'A',
              text: 'Mẫu thiết kế router đã được ghi chép đầy đủ trong các tài liệu công khai về agent.',
            },
            {
              id: 'B',
              text: 'Router được đề xuất sẽ phát sinh thêm một lệnh gọi model (model call) trên mỗi request đầu vào.',
            },
            {
              id: 'C',
              text: '34 tools này phục vụ bốn miền quy trình bồi thường (claim workflow domains) riêng biệt trong phạm vi phân loại.',
            },
          ],
          questionKeywords: [
            'grown from 6 tools to 34 tools',
            'tool router agent',
            'justify capability decomposition',
          ],
          answerKeywords: [
            'additional model call on every incoming request',
            'four distinct claim workflow domains',
          ],
          explanationVi:
            'Việc thêm một tool router agent phía trước sẽ tạo thêm một model call cho mỗi request (B)...',
          quickFormulaVi:
            '[Đề có: "grown from 6 tools to 34 tools"] ➔ Chọn B ("additional model call") — Router thêm model call làm tăng trễ.',
          keywordMappings: [
            {
              choiceId: 'B',
              questionKeywords: ['grown from 6 tools to 34 tools', 'tool router agent'],
              answerKeyword: 'additional model call on every incoming request',
              choiceTextVi:
                'Router được đề xuất sẽ phát sinh thêm một lệnh gọi model (model call) trên mỗi request đầu vào.',
              whyVi:
                'Việc thêm một tool router agent phía trước sẽ tạo thêm một model call cho mỗi request (B), làm tăng thêm độ trễ thay vì giải quyết tận gốc vấn đề.',
            },
          ],
        },
      },
    ],
  };

  const result = parseReviewQuestions(payload);
  assert.equal(result.length, 1);
  assert.ok(result[0].studyGuide);
  assert.equal(
    result[0].studyGuide.promptVi,
    'Một hệ thống managed agent để phân loại yêu cầu bồi thường (claims triage) đã tăng từ 6 tools lên 34 tools...'
  );
  assert.equal(result[0].studyGuide.choicesVi.length, 3);
  assert.deepEqual(result[0].studyGuide.questionKeywords, [
    'grown from 6 tools to 34 tools',
    'tool router agent',
    'justify capability decomposition',
  ]);
  assert.deepEqual(result[0].studyGuide.answerKeywords, [
    'additional model call on every incoming request',
    'four distinct claim workflow domains',
  ]);
  assert.equal(
    result[0].studyGuide.quickFormulaVi,
    '[Đề có: "grown from 6 tools to 34 tools"] ➔ Chọn B ("additional model call") — Router thêm model call làm tăng trễ.'
  );
  assert.equal(result[0].studyGuide.keywordMappings?.length, 1);
  assert.deepEqual(result[0].studyGuide.keywordMappings?.[0], {
    choiceId: 'B',
    questionKeywords: ['grown from 6 tools to 34 tools', 'tool router agent'],
    answerKeyword: 'additional model call on every incoming request',
    choiceTextVi:
      'Router được đề xuất sẽ phát sinh thêm một lệnh gọi model (model call) trên mỗi request đầu vào.',
    whyVi:
      'Việc thêm một tool router agent phía trước sẽ tạo thêm một model call cho mỗi request (B), làm tăng thêm độ trễ thay vì giải quyết tận gốc vấn đề.',
  });
  assert.ok(result[0].studyGuide.explanationVi.startsWith('Việc thêm một tool router'));
});

test('rejects studyGuide when keywordMappings has invalid choiceId or empty keywords', () => {
  assert.throws(() =>
    parseReviewQuestions({
      total: 1,
      questions: [
        {
          id: 'q1',
          type: 'single_choice',
          prompt: 'Choose',
          choices: [
            { id: 'A', text: 'One' },
            { id: 'B', text: 'Two' },
          ],
          correctChoiceIds: ['A'],
          studyGuide: {
            promptVi: 'Chọn',
            choicesVi: [
              { id: 'A', text: 'Một' },
              { id: 'B', text: 'Hai' },
            ],
            questionKeywords: ['Choose'],
            answerKeywords: ['One'],
            explanationVi: 'Giải thích',
            keywordMappings: [
              {
                choiceId: 'Z',
                questionKeywords: ['Choose'],
                answerKeyword: 'One',
                choiceTextVi: 'Một',
                whyVi: 'Lý do',
              },
            ],
          },
        },
      ],
    })
  );

  assert.throws(() =>
    parseReviewQuestions({
      total: 1,
      questions: [
        {
          id: 'q1',
          type: 'single_choice',
          prompt: 'Choose',
          choices: [
            { id: 'A', text: 'One' },
            { id: 'B', text: 'Two' },
          ],
          correctChoiceIds: ['A'],
          studyGuide: {
            promptVi: 'Chọn',
            choicesVi: [
              { id: 'A', text: 'Một' },
              { id: 'B', text: 'Hai' },
            ],
            questionKeywords: ['Choose'],
            answerKeywords: ['One'],
            explanationVi: 'Giải thích',
            keywordMappings: [
              {
                choiceId: 'A',
                questionKeywords: [],
                answerKeyword: 'One',
                choiceTextVi: 'Một',
                whyVi: 'Lý do',
              },
            ],
          },
        },
      ],
    })
  );
});

test('rejects studyGuide when choicesVi do not match question choices', () => {
  assert.throws(() =>
    parseReviewQuestions({
      topicId: 'ccar-p',
      total: 1,
      questions: [
        {
          id: 'q1',
          type: 'single_choice',
          prompt: 'Choose',
          choices: [
            { id: 'A', text: 'One' },
            { id: 'B', text: 'Two' },
          ],
          correctChoiceIds: ['A'],
          studyGuide: {
            promptVi: 'Chọn',
            choicesVi: [{ id: 'A', text: 'Một' }],
            questionKeywords: ['Choose'],
            answerKeywords: ['One'],
            explanationVi: 'Giải thích',
          },
        },
      ],
    })
  );
});

test('preserves all correct answers for multiple response questions', () => {
  const result = parseReviewQuestions({
    topicId: 'react',
    total: 1,
    questions: [
      {
        id: 'q1',
        type: 'multiple_response',
        prompt: 'Choose',
        choices: [
          { id: 'o1', text: 'One' },
          { id: 'o2', text: 'Two' },
        ],
        correctChoiceIds: ['o1', 'o2'],
      },
    ],
  });
  assert.deepEqual(result[0].correctChoiceIds, ['o1', 'o2']);
});

test('rejects questions whose correct answer is missing or unknown', () => {
  const question = {
    id: 'q1',
    type: 'single_choice',
    prompt: 'Choose',
    choices: [{ id: 'A', text: 'One' }],
  };
  assert.throws(() => parseReviewQuestions({ total: 1, questions: [question] }));
  assert.throws(() =>
    parseReviewQuestions({
      total: 1,
      questions: [{ ...question, correctChoiceIds: ['C'] }],
    })
  );
});

test('distinguishes an empty bank from a malformed response', () => {
  assert.deepEqual(parseReviewQuestions({ total: 0, questions: [] }), []);
  assert.deepEqual(parseReviewTopics({ topics: [] }), []);
  assert.throws(() => parseReviewQuestions({ message: 'failure' }));
  assert.throws(() =>
    parseReviewTopics({ topics: [{ id: 'react', name: 'React', questionCount: -1 }] })
  );
});

test('rejects a truncated question response', () => {
  assert.throws(() => parseReviewQuestions({ total: 10, questions: [] }));
});

test('only accepts authenticated server sessions for access', () => {
  assert.equal(parseReviewSession({ session: null }), null);
  assert.deepEqual(parseReviewSession({ session: { kind: 'password_setup' } }), {
    kind: 'password_setup',
  });
  assert.throws(() =>
    parseReviewSession({ session: { kind: 'authenticated', expiresAt: 'invalid' } })
  );
  const session = {
    kind: 'authenticated',
    user: { id: 'user-1', username: 'nam', role: 'student' },
    expiresAt: '2026-11-14T10:00:00.000Z',
  };
  assert.deepEqual(parseReviewSession({ session }), session);
});
