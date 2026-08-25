import type {
  OffensiveSecurityCollection,
  OffensiveSecurityCollectionFile,
  OffensiveSecurityMission,
} from '../types';
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
 * Toàn bộ Practice Range collection của Offensive Security Academy.
 * Mỗi file gộp chung metadata + học liệu + vectors + missions, tổ chức theo
 * lộ trình trong `roadmap.ts`. KHÔNG phụ thuộc feature nào khác.
 */
const COLLECTION_FILES: OffensiveSecurityCollectionFile[] = [
  frontendRecon as OffensiveSecurityCollectionFile,
  scriptInjectionRange as OffensiveSecurityCollectionFile,
  identitySessionHeist as OffensiveSecurityCollectionFile,
  asyncRaceExploits as OffensiveSecurityCollectionFile,
  uiStateCorruption as OffensiveSecurityCollectionFile,
  formInputAbuse as OffensiveSecurityCollectionFile,
  cachePoisoning as OffensiveSecurityCollectionFile,
  resourceSupplyDrain as OffensiveSecurityCollectionFile,
  blueTeamCapstone as OffensiveSecurityCollectionFile,
];

export const OFFENSIVE_SECURITY_COLLECTIONS: OffensiveSecurityCollection[] =
  COLLECTION_FILES.map(({ missions: _missions, ...collection }) => collection);

export function getCollectionBySlug(
  collectionSlug: string
): OffensiveSecurityCollection | undefined {
  return OFFENSIVE_SECURITY_COLLECTIONS.find(
    (collection) => collection.slug === collectionSlug
  );
}

/** Collection của một phase, sắp theo thứ tự trong phase */
export function getCollectionsByPhase(phaseId: string): OffensiveSecurityCollection[] {
  return OFFENSIVE_SECURITY_COLLECTIONS.filter((c) => c.phaseId === phaseId).sort(
    (a, b) => a.orderInPhase - b.orderInPhase
  );
}

export function getMissionsByCollectionSlug(
  collectionSlug: string
): OffensiveSecurityMission[] {
  return COLLECTION_FILES.find((c) => c.slug === collectionSlug)?.missions ?? [];
}

export function getMissionBySlug(
  collectionSlug: string,
  missionSlug: string
): OffensiveSecurityMission | undefined {
  return getMissionsByCollectionSlug(collectionSlug).find((m) => m.slug === missionSlug);
}

/** Tổng số mission toàn app (cho stats ở /offensive-security overview) */
export const TOTAL_MISSIONS = COLLECTION_FILES.reduce(
  (acc, c) => acc + c.missions.length,
  0
);
