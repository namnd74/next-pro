import { access, readFile } from 'node:fs/promises';
import path from 'node:path';

const workspaceRoot = process.cwd();
const manifestPath = path.join(
  workspaceRoot,
  'docs/offensive-security/curriculum-manifest.json'
);
const errors = [];

function fail(message) {
  errors.push(message);
}

function requireText(value, location) {
  if (typeof value !== 'string' || value.trim() === '') {
    fail(`${location} must be a non-empty string`);
    return false;
  }
  return true;
}

function requireStringArray(value, location, { allowEmpty = false } = {}) {
  if (!Array.isArray(value)) {
    fail(`${location} must be an array`);
    return false;
  }
  if (!allowEmpty && value.length === 0) {
    fail(`${location} must not be empty`);
  }
  for (const [index, item] of value.entries()) {
    requireText(item, `${location}[${index}]`);
  }
  if (new Set(value).size !== value.length) {
    fail(`${location} contains duplicate values`);
  }
  return true;
}

function findCycles(nodes, getDependencies, label) {
  const visiting = new Set();
  const visited = new Set();

  function visit(id, pathSoFar) {
    if (visiting.has(id)) {
      const cycleStart = pathSoFar.indexOf(id);
      fail(
        `${label} dependency cycle: ${[...pathSoFar.slice(cycleStart), id].join(' -> ')}`
      );
      return;
    }
    if (visited.has(id)) return;

    visiting.add(id);
    for (const dependency of getDependencies(id)) {
      visit(dependency, [...pathSoFar, id]);
    }
    visiting.delete(id);
    visited.add(id);
  }

  for (const id of nodes) visit(id, []);
}

let manifest;
try {
  manifest = JSON.parse(await readFile(manifestPath, 'utf8'));
} catch (error) {
  console.error(`Unable to read curriculum manifest: ${error.message}`);
  process.exit(1);
}

if (manifest.schemaVersion !== 1) {
  fail(`schemaVersion must be 1, received ${manifest.schemaVersion}`);
}

const statuses = new Set(manifest.enums?.statuses ?? []);
const difficulties = new Set(manifest.enums?.difficulties ?? []);
const labModes = new Set(manifest.enums?.labModes ?? []);
const safetyLevels = new Set(manifest.enums?.safetyLevels ?? []);

for (const [name, values] of [
  ['statuses', statuses],
  ['difficulties', difficulties],
  ['labModes', labModes],
  ['safetyLevels', safetyLevels],
]) {
  if (values.size === 0) fail(`enums.${name} must not be empty`);
}

const eligibleStatuses = new Set(
  manifest.batchPolicy?.eligiblePrerequisiteStatuses ?? []
);
for (const status of eligibleStatuses) {
  if (!statuses.has(status)) {
    fail(`batchPolicy.eligiblePrerequisiteStatuses contains unknown status: ${status}`);
  }
}

if (
  !Number.isInteger(manifest.batchPolicy?.maxModulesPerRun) ||
  manifest.batchPolicy.maxModulesPerRun < 1
) {
  fail('batchPolicy.maxModulesPerRun must be a positive integer');
}
if (
  !Number.isInteger(manifest.batchPolicy?.maxLessonsPerRun) ||
  manifest.batchPolicy.maxLessonsPerRun < 1
) {
  fail('batchPolicy.maxLessonsPerRun must be a positive integer');
}

if (!Array.isArray(manifest.tracks) || manifest.tracks.length === 0) {
  fail('tracks must be a non-empty array');
}

const trackById = new Map();
const moduleById = new Map();
const trackOrders = new Set();

for (const [trackIndex, track] of (manifest.tracks ?? []).entries()) {
  const at = `tracks[${trackIndex}]`;
  if (requireText(track.id, `${at}.id`)) {
    if (trackById.has(track.id)) fail(`${at}.id is duplicated: ${track.id}`);
    trackById.set(track.id, track);
  }
  requireText(track.title, `${at}.title`);
  requireText(track.outcome, `${at}.outcome`);
  if (!statuses.has(track.status)) fail(`${at}.status is invalid: ${track.status}`);
  if (!Number.isInteger(track.order) || track.order < 0) {
    fail(`${at}.order must be a non-negative integer`);
  } else if (trackOrders.has(track.order)) {
    fail(`${at}.order is duplicated: ${track.order}`);
  } else {
    trackOrders.add(track.order);
  }
  requireStringArray(track.prerequisites, `${at}.prerequisites`, { allowEmpty: true });
  requireStringArray(track.careerPaths, `${at}.careerPaths`);
  requireStringArray(track.domains, `${at}.domains`);

  if (!Array.isArray(track.modules) || track.modules.length === 0) {
    fail(`${at}.modules must be a non-empty array`);
    continue;
  }

  for (const [moduleIndex, module] of track.modules.entries()) {
    const moduleAt = `${at}.modules[${moduleIndex}]`;
    if (requireText(module.id, `${moduleAt}.id`)) {
      if (moduleById.has(module.id)) {
        fail(`${moduleAt}.id is duplicated: ${module.id}`);
      }
      moduleById.set(module.id, { ...module, trackId: track.id });
    }
    requireText(module.title, `${moduleAt}.title`);
    if (!statuses.has(module.status)) {
      fail(`${moduleAt}.status is invalid: ${module.status}`);
    }
    if (!difficulties.has(module.difficulty)) {
      fail(`${moduleAt}.difficulty is invalid: ${module.difficulty}`);
    }
    if (!Number.isInteger(module.estimatedMinutes) || module.estimatedMinutes <= 0) {
      fail(`${moduleAt}.estimatedMinutes must be a positive integer`);
    }
    requireStringArray(module.prerequisites, `${moduleAt}.prerequisites`, {
      allowEmpty: true,
    });
    if (!labModes.has(module.labMode)) {
      fail(`${moduleAt}.labMode is invalid: ${module.labMode}`);
    }
    if (!safetyLevels.has(module.safetyLevel)) {
      fail(`${moduleAt}.safetyLevel is invalid: ${module.safetyLevel}`);
    }
    requireStringArray(module.keywords, `${moduleAt}.keywords`);
    if (Array.isArray(module.keywords) && module.keywords.length < 3) {
      fail(`${moduleAt}.keywords must contain at least three values`);
    }
    if (
      module.labMode === 'instructor-controlled' &&
      module.safetyLevel !== 'instructor-controlled'
    ) {
      fail(`${moduleAt} instructor-controlled lab requires matching safetyLevel`);
    }
    if (['validated', 'published'].includes(module.status)) {
      if (!requireText(module.output, `${moduleAt}.output`)) continue;
    } else if (module.output !== null && typeof module.output !== 'string') {
      fail(`${moduleAt}.output must be null or a path string`);
    }
  }
}

for (const [trackId, track] of trackById) {
  for (const dependency of track.prerequisites) {
    if (dependency === trackId) fail(`${trackId} cannot depend on itself`);
    if (!trackById.has(dependency)) {
      fail(`${trackId} references unknown track prerequisite: ${dependency}`);
    }
  }
}

for (const [moduleId, module] of moduleById) {
  for (const dependency of module.prerequisites) {
    if (dependency === moduleId) fail(`${moduleId} cannot depend on itself`);
    if (!moduleById.has(dependency)) {
      fail(`${moduleId} references unknown module prerequisite: ${dependency}`);
    }
  }
}

findCycles(trackById.keys(), (id) => trackById.get(id)?.prerequisites ?? [], 'Track');
findCycles(moduleById.keys(), (id) => moduleById.get(id)?.prerequisites ?? [], 'Module');

for (const [moduleId, module] of moduleById) {
  if (!['validated', 'published'].includes(module.status) || !module.output) continue;
  try {
    await access(path.join(workspaceRoot, module.output));
  } catch {
    fail(`${moduleId}.output does not exist: ${module.output}`);
  }
}

for (const [index, legacyPath] of (manifest.legacyReview?.paths ?? []).entries()) {
  try {
    await access(path.join(workspaceRoot, legacyPath));
  } catch {
    fail(`legacyReview.paths[${index}] does not exist: ${legacyPath}`);
  }
}

const eligibleModules = [...moduleById.values()].filter((module) => {
  if (!['planned', 'review-required'].includes(module.status)) return false;
  return module.prerequisites.every((dependency) =>
    eligibleStatuses.has(moduleById.get(dependency)?.status)
  );
});

if (errors.length > 0) {
  console.error(
    `Offensive Security curriculum validation failed (${errors.length} errors):`
  );
  for (const error of errors) console.error(`- ${error}`);
  process.exitCode = 1;
} else {
  const next = eligibleModules[0];
  console.log(
    `Offensive Security curriculum valid: ${trackById.size} tracks, ${moduleById.size} modules.`
  );
  console.log(
    next
      ? `Next eligible module: ${next.id} (${next.title})`
      : 'No module is currently eligible; validate or publish prerequisites first.'
  );
}
