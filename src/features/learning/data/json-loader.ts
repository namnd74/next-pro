import { LearningTrack } from '../types';
import reactCoreFoundationsTrack from './json/react-core-foundations.json';
import reactHooksMasteryTrack from './json/react-hooks-mastery.json';
import standardFormsTrack from './json/standard-react-forms.json';
import formEngineeringTrack from './json/form-engineering.json';
import reactPerformanceTrack from './json/react-performance-patterns.json';
import tanstackQueryTrack from './json/tanstack-query-masterclass.json';
import webSecurityAuthTrack from './json/web-security-auth.json';
import react19Track from './json/react19-compiler.json';
import nextArchitectureTrack from './json/nextjs-architecture-rendering.json';
import reactTestingEnterpriseTrack from './json/react-testing-enterprise.json';
import nextDeploymentOperationsTrack from './json/nextjs-deployment-operations.json';
import productionCapstoneTrack from './json/production-react-capstone.json';

export const DEFAULT_JSON_LEARNING_TRACKS: LearningTrack[] = [
  reactCoreFoundationsTrack as LearningTrack,
  reactHooksMasteryTrack as LearningTrack,
  standardFormsTrack as LearningTrack,
  react19Track as LearningTrack,
  formEngineeringTrack as LearningTrack,
  nextArchitectureTrack as LearningTrack,
  tanstackQueryTrack as LearningTrack,
  reactPerformanceTrack as LearningTrack,
  reactTestingEnterpriseTrack as LearningTrack,
  webSecurityAuthTrack as LearningTrack,
  nextDeploymentOperationsTrack as LearningTrack,
  productionCapstoneTrack as LearningTrack,
];
