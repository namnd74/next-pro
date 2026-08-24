import { RedTeamScenario } from '../types';
import reactCoreFoundationsScenario from './json/react-core-foundations.json';
import reactHooksMasteryScenario from './json/react-hooks-mastery.json';
import standardFormsScenario from './json/standard-react-forms.json';
import formEngineeringScenario from './json/form-engineering.json';
import reactPerformanceScenario from './json/react-performance-patterns.json';
import tanstackQueryScenario from './json/tanstack-query-masterclass.json';
import webSecurityAuthScenario from './json/web-security-auth.json';
import react19Scenario from './json/react19-compiler.json';
import nextArchitectureScenario from './json/nextjs-architecture-rendering.json';
import reactTestingScenario from './json/react-testing-enterprise.json';

export const RED_TEAM_SCENARIOS: RedTeamScenario[] = [
  reactCoreFoundationsScenario as RedTeamScenario,
  reactHooksMasteryScenario as RedTeamScenario,
  standardFormsScenario as RedTeamScenario,
  formEngineeringScenario as RedTeamScenario,
  reactPerformanceScenario as RedTeamScenario,
  tanstackQueryScenario as RedTeamScenario,
  webSecurityAuthScenario as RedTeamScenario,
  react19Scenario as RedTeamScenario,
  nextArchitectureScenario as RedTeamScenario,
  reactTestingScenario as RedTeamScenario,
];

export function getRedTeamScenarioByTrackSlug(
  trackSlug: string
): RedTeamScenario | undefined {
  return RED_TEAM_SCENARIOS.find((scenario) => scenario.trackSlug === trackSlug);
}

/**
 * Vector gắn với một lesson (qua `relatedLessons` chứa lesson id).
 * Dùng cho tab Practice trong lesson view.
 */
export function getVectorsByLessonId(
  trackSlug: string,
  lessonId: string
): RedTeamScenario['vectors'] {
  const scenario = getRedTeamScenarioByTrackSlug(trackSlug);
  if (!scenario) return [];
  return scenario.vectors.filter(
    (vector) => vector.relatedLessons?.includes(lessonId) ?? false
  );
}
