import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';

const contentDirectory = path.join(process.cwd(), 'src/features/learning/data/json');
const allowedLevels = new Set(['beginner', 'intermediate', 'advanced']);
const allowedLanguages = new Set([
  'tsx',
  'typescript',
  'javascript',
  'bash',
  'json',
  'yaml',
  'dockerfile',
  'nginx',
]);
const allowedAnswers = new Set(['A', 'B', 'C', 'D']);
const forbiddenContent = [
  ['experimental.reactCompiler', 'React Compiler không còn nằm dưới experimental'],
  ["ppr: 'incremental'", 'Next.js 16 dùng cacheComponents cho PPR'],
  ['Áo hóa', 'Sai chính tả: dùng “Ảo hóa”'],
];
const forbiddenPatterns = [
  [/\bNext\.js\s+(?:1[0-5])\b/i, 'Nội dung phải dùng Next.js 16 hiện tại'],
];

const errors = [];
const seenTrackIds = new Set();
const seenTrackSlugs = new Set();
const seenLessonIds = new Set();
const seenLessonSlugs = new Set();
const seenQuizIds = new Set();

function requireText(value, location) {
  if (typeof value !== 'string' || value.trim() === '') {
    errors.push(`${location} phải là chuỗi không rỗng`);
  }
}

function requireUnique(value, seen, location) {
  requireText(value, location);
  if (seen.has(value)) errors.push(`${location} bị trùng: ${value}`);
  seen.add(value);
}

const files = (await readdir(contentDirectory))
  .filter((file) => file.endsWith('.json'))
  .sort();

for (const file of files) {
  const source = await readFile(path.join(contentDirectory, file), 'utf8');
  let track;

  try {
    track = JSON.parse(source);
  } catch (error) {
    errors.push(`${file}: JSON không hợp lệ (${error.message})`);
    continue;
  }

  for (const [needle, message] of forbiddenContent) {
    if (source.includes(needle)) errors.push(`${file}: ${message}`);
  }
  for (const [pattern, message] of forbiddenPatterns) {
    if (pattern.test(source)) errors.push(`${file}: ${message}`);
  }

  requireUnique(track.id, seenTrackIds, `${file}.id`);
  requireUnique(track.slug, seenTrackSlugs, `${file}.slug`);
  requireText(track.title, `${file}.title`);

  if (!Array.isArray(track.lessons) || track.lessons.length === 0) {
    errors.push(`${file}.lessons phải có ít nhất một bài`);
    continue;
  }
  if (track.totalLessons !== track.lessons.length) {
    errors.push(
      `${file}.totalLessons=${track.totalLessons}, thực tế=${track.lessons.length}`
    );
  }

  for (const [lessonIndex, lesson] of track.lessons.entries()) {
    const lessonAt = `${file}.lessons[${lessonIndex}]`;
    requireUnique(lesson.id, seenLessonIds, `${lessonAt}.id`);
    requireUnique(lesson.slug, seenLessonSlugs, `${lessonAt}.slug`);
    requireText(lesson.title, `${lessonAt}.title`);
    requireText(lesson.mentalModel, `${lessonAt}.mentalModel`);

    if (!allowedLevels.has(lesson.level)) {
      errors.push(`${lessonAt}.level không hợp lệ: ${lesson.level}`);
    }
    if (!Number.isInteger(lesson.durationMinutes) || lesson.durationMinutes <= 0) {
      errors.push(`${lessonAt}.durationMinutes phải là số nguyên dương`);
    }
    if (!Array.isArray(lesson.keyPoints) || lesson.keyPoints.length < 3) {
      errors.push(`${lessonAt}.keyPoints phải có ít nhất 3 ý`);
    }
    if (!Array.isArray(lesson.codeRecipes) || lesson.codeRecipes.length === 0) {
      errors.push(`${lessonAt}.codeRecipes phải có ít nhất một lab`);
    } else {
      lesson.codeRecipes.forEach((recipe, recipeIndex) => {
        const recipeAt = `${lessonAt}.codeRecipes[${recipeIndex}]`;
        requireText(recipe.title, `${recipeAt}.title`);
        requireText(recipe.afterCode, `${recipeAt}.afterCode`);
        requireText(recipe.takeaway, `${recipeAt}.takeaway`);
        if (!allowedLanguages.has(recipe.language)) {
          errors.push(`${recipeAt}.language không hợp lệ: ${recipe.language}`);
        }
      });
    }

    if (!Array.isArray(lesson.quizzes) || lesson.quizzes.length === 0) {
      errors.push(`${lessonAt}.quizzes phải có ít nhất một câu`);
      continue;
    }

    lesson.quizzes.forEach((quiz, quizIndex) => {
      const quizAt = `${lessonAt}.quizzes[${quizIndex}]`;
      requireUnique(quiz.id, seenQuizIds, `${quizAt}.id`);
      requireText(quiz.question, `${quizAt}.question`);
      requireText(quiz.explanation, `${quizAt}.explanation`);

      const keys = quiz.options?.map((option) => option.key) ?? [];
      if (
        keys.length !== 4 ||
        new Set(keys).size !== 4 ||
        keys.some((key) => !allowedAnswers.has(key))
      ) {
        errors.push(`${quizAt}.options phải có đủ bốn key A/B/C/D không trùng`);
      }
      if (!keys.includes(quiz.correctAnswer)) {
        errors.push(`${quizAt}.correctAnswer không tồn tại trong options`);
      }
    });
  }
}

if (errors.length > 0) {
  console.error(`Learning content validation thất bại (${errors.length} lỗi):`);
  errors.forEach((error) => console.error(`- ${error}`));
  process.exitCode = 1;
} else {
  const lessonCount = seenLessonIds.size;
  console.log(
    `Learning content hợp lệ: ${files.length} tracks, ${lessonCount} lessons, ${seenQuizIds.size} quizzes.`
  );
}
