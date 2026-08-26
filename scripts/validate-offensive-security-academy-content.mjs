import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';

const academyDir = path.join(
  process.cwd(),
  'src/features/offensive-security/data/academy'
);
const errors = [];
const fail = (message) => errors.push(message);

function requireText(value, location) {
  if (typeof value !== 'string' || value.trim() === '') {
    fail(`${location} must be a non-empty string`);
    return false;
  }
  return true;
}

function requireArray(value, location, minimum = 1) {
  if (!Array.isArray(value)) {
    fail(`${location} must be an array`);
    return false;
  }
  if (value.length < minimum)
    fail(`${location} must contain at least ${minimum} item(s)`);
  return true;
}

function requireTextArray(value, location, minimum = 1) {
  if (!requireArray(value, location, minimum)) return false;
  value.forEach((item, index) => requireText(item, `${location}[${index}]`));
  if (new Set(value).size !== value.length) fail(`${location} contains duplicate values`);
  return true;
}

let fileNames = [];
try {
  async function collectJsonFiles(dir) {
    const found = [];
    const entries = await readdir(dir, { withFileTypes: true });
    for (const entry of entries) {
      const entryPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        found.push(...(await collectJsonFiles(entryPath)));
      } else if (entry.isFile() && entry.name.endsWith('.json')) {
        found.push(entryPath);
      }
    }
    return found;
  }
  fileNames = (await collectJsonFiles(academyDir)).sort();
} catch (error) {
  console.error(`Unable to read academy directory: ${error.message}`);
  process.exit(1);
}

if (fileNames.length === 0) {
  console.error('No academy JSON files found in data/academy');
  process.exit(1);
}

const quizDifficulties = ['easy', 'medium', 'hard'];
const validatedModules = [];

for (const fileName of fileNames) {
  const contentPath = fileName;
  let academyModule;
  try {
    academyModule = JSON.parse(await readFile(contentPath, 'utf8'));
  } catch (error) {
    fail(`Unable to parse ${fileName}: ${error.message}`);
    continue;
  }

  const prefix = `[${fileName}]`;
  requireText(academyModule.id, `${prefix} module.id`);
  requireText(academyModule.slug, `${prefix} module.slug`);
  requireText(academyModule.trackId, `${prefix} module.trackId`);
  requireText(academyModule.title, `${prefix} module.title`);
  requireText(academyModule.summary, `${prefix} module.summary`);
  requireTextArray(academyModule.careerPaths, `${prefix} module.careerPaths`);
  requireTextArray(academyModule.domains, `${prefix} module.domains`);

  if (!Array.isArray(academyModule.lessons) || academyModule.lessons.length !== 3) {
    fail(`${prefix} module.lessons must contain exactly three lessons for this generation batch`);
  }

  const lessonIds = new Set();
  const lessonSlugs = new Set();
  let totalMinutes = 0;

  for (const [lessonIndex, lesson] of (academyModule.lessons ?? []).entries()) {
    const at = `${prefix} module.lessons[${lessonIndex}]`;
    if (requireText(lesson.id, `${at}.id`)) {
      if (lessonIds.has(lesson.id)) fail(`${at}.id is duplicated: ${lesson.id}`);
      lessonIds.add(lesson.id);
    }
    if (requireText(lesson.slug, `${at}.slug`)) {
      if (lessonSlugs.has(lesson.slug)) fail(`${at}.slug is duplicated: ${lesson.slug}`);
      lessonSlugs.add(lesson.slug);
    }
    requireText(lesson.title, `${at}.title`);
    requireText(lesson.summary, `${at}.summary`);
    requireText(lesson.mentalModel, `${at}.mentalModel`);
    requireTextArray(lesson.outcomes, `${at}.outcomes`, 3);
    requireTextArray(lesson.prerequisites, `${at}.prerequisites`, 0);

    if (!Number.isInteger(lesson.durationMinutes) || lesson.durationMinutes <= 0) {
      fail(`${at}.durationMinutes must be a positive integer`);
    } else {
      totalMinutes += lesson.durationMinutes;
    }

    for (const prerequisite of lesson.prerequisites ?? []) {
      const prerequisiteIndex = (academyModule.lessons ?? []).findIndex(
        (candidate) => candidate.id === prerequisite
      );
      if (prerequisiteIndex === -1)
        fail(`${at} references unknown prerequisite: ${prerequisite}`);
      if (prerequisiteIndex >= lessonIndex) {
        fail(`${at} prerequisite must refer to an earlier lesson: ${prerequisite}`);
      }
    }

    requireText(lesson.visual?.title, `${at}.visual.title`);
    requireText(lesson.visual?.caption, `${at}.visual.caption`);
    if (requireArray(lesson.visual?.steps, `${at}.visual.steps`, 3)) {
      lesson.visual.steps.forEach((step, index) => {
        requireText(step.label, `${at}.visual.steps[${index}].label`);
        requireText(step.detail, `${at}.visual.steps[${index}].detail`);
        if (!['neutral', 'allow', 'caution', 'stop'].includes(step.tone)) {
          fail(`${at}.visual.steps[${index}].tone is invalid: ${step.tone}`);
        }
      });
    }

    if (requireArray(lesson.sections, `${at}.sections`, 4)) {
      lesson.sections.forEach((section, index) => {
        requireText(section.title, `${at}.sections[${index}].title`);
        requireTextArray(section.paragraphs, `${at}.sections[${index}].paragraphs`);
      });
    }

    requireText(lesson.lab?.title, `${at}.lab.title`);
    requireText(lesson.lab?.objective, `${at}.lab.objective`);
    requireText(lesson.lab?.scenario, `${at}.lab.scenario`);
    requireTextArray(lesson.lab?.constraints, `${at}.lab.constraints`);
    requireTextArray(lesson.lab?.successCriteria, `${at}.lab.successCriteria`);
    requireTextArray(lesson.lab?.evidenceTemplate, `${at}.lab.evidenceTemplate`);
    requireText(lesson.lab?.reset, `${at}.lab.reset`);
    requireText(lesson.lab?.cleanup, `${at}.lab.cleanup`);
    if (!Array.isArray(lesson.lab?.cases) || lesson.lab.cases.length !== 3) {
      fail(`${at}.lab.cases must contain exactly three decision cases`);
    } else {
      lesson.lab.cases.forEach((labCase, caseIndex) => {
        const caseAt = `${at}.lab.cases[${caseIndex}]`;
        requireText(labCase.id, `${caseAt}.id`);
        requireText(labCase.title, `${caseAt}.title`);
        requireText(labCase.context, `${caseAt}.context`);
        requireText(labCase.prompt, `${caseAt}.prompt`);
        if (!Array.isArray(labCase.options) || labCase.options.length !== 4) {
          fail(`${caseAt}.options must contain exactly four choices`);
        } else {
          const correct = labCase.options.filter((option) => option.correct);
          if (correct.length !== 1)
            fail(`${caseAt}.options must have exactly one correct choice`);
          labCase.options.forEach((option, optionIndex) => {
            requireText(option.id, `${caseAt}.options[${optionIndex}].id`);
            requireText(option.label, `${caseAt}.options[${optionIndex}].label`);
            requireText(option.rationale, `${caseAt}.options[${optionIndex}].rationale`);
          });
        }
      });
    }

    if (!Array.isArray(lesson.quiz) || lesson.quiz.length !== 3) {
      fail(`${at}.quiz must contain exactly three questions`);
    } else {
      lesson.quiz.forEach((question, questionIndex) => {
        const questionAt = `${at}.quiz[${questionIndex}]`;
        if (question.difficulty !== quizDifficulties[questionIndex]) {
          fail(`${questionAt}.difficulty must be ${quizDifficulties[questionIndex]}`);
        }
        requireText(question.id, `${questionAt}.id`);
        requireText(question.question, `${questionAt}.question`);
        requireText(question.explanation, `${questionAt}.explanation`);
        if (!Array.isArray(question.options) || question.options.length !== 4) {
          fail(`${questionAt}.options must contain exactly four choices`);
        } else {
          const optionIds = question.options.map((option) => option.id);
          if (optionIds.join(',') !== 'A,B,C,D') {
            fail(`${questionAt}.options ids must be A, B, C, D in order`);
          }
          question.options.forEach((option, optionIndex) => {
            requireText(option.label, `${questionAt}.options[${optionIndex}].label`);
          });
          if (!optionIds.includes(question.correctAnswer)) {
            fail(`${questionAt}.correctAnswer does not match an option`);
          }
        }
      });
    }

    for (const key of ['prevent', 'observe', 'respond', 'residualRisk']) {
      requireTextArray(lesson.governance?.[key], `${at}.governance.${key}`);
    }
    requireArray(lesson.misconceptions, `${at}.misconceptions`, 3);
    requireText(lesson.transferChallenge?.scenario, `${at}.transferChallenge.scenario`);
    requireTextArray(lesson.transferChallenge?.tasks, `${at}.transferChallenge.tasks`);
    requireTextArray(
      lesson.transferChallenge?.requiredEvidence,
      `${at}.transferChallenge.requiredEvidence`
    );

    if (requireArray(lesson.sources, `${at}.sources`, 2)) {
      lesson.sources.forEach((source, sourceIndex) => {
        const sourceAt = `${at}.sources[${sourceIndex}]`;
        requireText(source.title, `${sourceAt}.title`);
        requireText(source.publisher, `${sourceAt}.publisher`);
        requireText(source.sourceType, `${sourceAt}.sourceType`);
        requireText(source.accessedAt, `${sourceAt}.accessedAt`);
        requireTextArray(source.supports, `${sourceAt}.supports`);
        if (!requireText(source.url, `${sourceAt}.url`)) return;
        try {
          const url = new URL(source.url);
          if (!['http:', 'https:'].includes(url.protocol))
            fail(`${sourceAt}.url must use HTTP(S)`);
        } catch {
          fail(`${sourceAt}.url must be a valid absolute URL`);
        }
      });
    }
  }

  if (academyModule.estimatedMinutes !== totalMinutes) {
    fail(
      `${prefix} module.estimatedMinutes (${academyModule.estimatedMinutes}) must equal lesson total (${totalMinutes})`
    );
  }

  validatedModules.push({
    id: academyModule.id,
    lessonsCount: academyModule.lessons?.length ?? 0,
    totalMinutes,
  });
}

if (errors.length) {
  console.error(
    `Offensive Security academy content validation failed (${errors.length} errors):`
  );
  errors.forEach((error) => console.error(`- ${error}`));
  process.exitCode = 1;
} else {
  console.log(
    `Offensive Security academy content valid: ${validatedModules.map((m) => `${m.id} (${m.lessonsCount} lessons, ${m.totalMinutes}m)`).join(', ')}.`
  );
}
