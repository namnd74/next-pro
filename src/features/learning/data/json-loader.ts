import { LearningTrack } from '../types';
import react19Track from './json/react19-compiler.json';
import standardFormsTrack from './json/standard-react-forms.json';
import formEngineeringTrack from './json/form-engineering.json';
import webSecurityAuthTrack from './json/web-security-auth.json';
import tanstackQueryTrack from './json/tanstack-query-masterclass.json';
import nextArchitectureTrack from './json/nextjs-architecture-rendering.json';

export const DEFAULT_JSON_LEARNING_TRACKS: LearningTrack[] = [
  react19Track as LearningTrack,
  standardFormsTrack as LearningTrack,
  formEngineeringTrack as LearningTrack,
  webSecurityAuthTrack as LearningTrack,
  tanstackQueryTrack as LearningTrack,
  nextArchitectureTrack as LearningTrack,
];
