import { LearningTrack } from '../types';
import { DEFAULT_JSON_LEARNING_TRACKS } from './json-loader';

export const MOCK_LEARNING_TRACKS: LearningTrack[] = DEFAULT_JSON_LEARNING_TRACKS;

export const REACT_SERIES_TRACK_SLUGS = [
  'react-foundations-zero-to-one',
  'react-hooks-deep-dive',
  'standard-react-form-architecture',
  'react-19-compiler-path',
  'form-engineering-react-hook-form-zod',
  'react-performance-advanced-patterns',
  'react-testing-enterprise-mastery',
  'production-react-nextjs-capstone',
];

export const NEXTJS_SERIES_TRACK_SLUGS = [
  'nextjs-architecture-rendering-strategies',
  'tanstack-query-v5-masterclass',
  'web-security-and-auth-masterclass',
  'nextjs-deployment-and-operations',
];

export const REACT_SERIES_TRACKS: LearningTrack[] = MOCK_LEARNING_TRACKS.filter((t) =>
  REACT_SERIES_TRACK_SLUGS.includes(t.slug)
);

export const NEXTJS_SERIES_TRACKS: LearningTrack[] = MOCK_LEARNING_TRACKS.filter((t) =>
  NEXTJS_SERIES_TRACK_SLUGS.includes(t.slug)
);
