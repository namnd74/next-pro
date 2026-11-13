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
      topics: [{ id: 'react', name: 'React', questionCount: 12 }],
    }),
    [{ id: 'react', name: 'React', questionCount: 12 }]
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
  const result = parseReviewQuestions({ topicId: 'react', total: 25, questions });
  assert.equal(result.length, 25);
  assert.deepEqual(result[24].correctChoiceIds, ['B']);
  assert.equal(result[24].prompt, 'Question 24');
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
