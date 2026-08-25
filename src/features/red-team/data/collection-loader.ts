import type { RedTeamCollection, RedTeamCollectionFile, RedTeamMission } from '../types';
import asyncRaceExploits from './collections/async-race-exploits.json';
import blueTeamCapstone from './collections/blue-team-capstone.json';
import cachePoisoning from './collections/cache-poisoning.json';
import formInputAbuse from './collections/form-input-abuse.json';
import frontendRecon from './collections/frontend-recon.json';
import identitySessionHeist from './collections/identity-session-heist.json';
import resourceSupplyDrain from './collections/resource-supply-drain.json';
import scriptInjectionRange from './collections/script-injection-range.json';
import uiStateCorruption from './collections/ui-state-corruption.json';

/**
 * Toàn bộ collection của học viện Red Team — dữ liệu OWNED bởi feature này.
 * Mỗi file gộp chung metadata + học liệu + vectors + missions, tổ chức theo
 * lộ trình trong `roadmap.ts`. KHÔNG phụ thuộc feature nào khác.
 */
const COLLECTION_FILES: RedTeamCollectionFile[] = [
  frontendRecon as RedTeamCollectionFile,
  scriptInjectionRange as RedTeamCollectionFile,
  identitySessionHeist as RedTeamCollectionFile,
  asyncRaceExploits as RedTeamCollectionFile,
  uiStateCorruption as RedTeamCollectionFile,
  formInputAbuse as RedTeamCollectionFile,
  cachePoisoning as RedTeamCollectionFile,
  resourceSupplyDrain as RedTeamCollectionFile,
  blueTeamCapstone as RedTeamCollectionFile,
];

export const RED_TEAM_COLLECTIONS: RedTeamCollection[] = COLLECTION_FILES.map(
  ({ missions: _missions, ...collection }) => collection
);

export function getCollectionBySlug(
  collectionSlug: string
): RedTeamCollection | undefined {
  return RED_TEAM_COLLECTIONS.find((collection) => collection.slug === collectionSlug);
}

/** Collection của một phase, sắp theo thứ tự trong phase */
export function getCollectionsByPhase(phaseId: string): RedTeamCollection[] {
  return RED_TEAM_COLLECTIONS.filter((c) => c.phaseId === phaseId).sort(
    (a, b) => a.orderInPhase - b.orderInPhase
  );
}

export function getMissionsByCollectionSlug(collectionSlug: string): RedTeamMission[] {
  return COLLECTION_FILES.find((c) => c.slug === collectionSlug)?.missions ?? [];
}

export function getMissionBySlug(
  collectionSlug: string,
  missionSlug: string
): RedTeamMission | undefined {
  return getMissionsByCollectionSlug(collectionSlug).find((m) => m.slug === missionSlug);
}

/** Tổng số mission toàn app (cho stats ở /rt overview) */
export const TOTAL_MISSIONS = COLLECTION_FILES.reduce(
  (acc, c) => acc + c.missions.length,
  0
);
