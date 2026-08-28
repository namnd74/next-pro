import type { ArenaChallenge } from '../types';
import {
  challengeCitrixBleed,
  challengeLog4Shell,
  challengeAwsImdsv2Ssrf,
  challengeKerberoasting,
  challengeProtoPollution,
  challengeRaceCondition,
} from './challenges';

export * from './challenges';
export * from './rivals-data';

export const ARENA_CHALLENGES: ArenaChallenge[] = [
  challengeCitrixBleed,
  challengeLog4Shell,
  challengeAwsImdsv2Ssrf,
  challengeKerberoasting,
  challengeProtoPollution,
  challengeRaceCondition,
];
