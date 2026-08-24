import { RedTeamMission } from '../types';
import rcfMissions from './missions/react-core-foundations.json';
import rhmMissions from './missions/react-hooks-mastery.json';
import srMissions from './missions/standard-react-forms.json';
import feMissions from './missions/form-engineering.json';
import rppMissions from './missions/react-performance-patterns.json';
import tqMissions from './missions/tanstack-query-masterclass.json';
import wsMissions from './missions/web-security-auth.json';
import r19Missions from './missions/react19-compiler.json';
import naMissions from './missions/nextjs-architecture-rendering.json';
import rteMissions from './missions/react-testing-enterprise.json';

interface MissionFile {
  trackSlug: string;
  missions: RedTeamMission[];
}

export const MISSION_FILES: MissionFile[] = [
  rcfMissions as MissionFile,
  rhmMissions as MissionFile,
  srMissions as MissionFile,
  feMissions as MissionFile,
  rppMissions as MissionFile,
  tqMissions as MissionFile,
  wsMissions as MissionFile,
  r19Missions as MissionFile,
  naMissions as MissionFile,
  rteMissions as MissionFile,
];

export function getMissionsByTrackSlug(trackSlug: string): RedTeamMission[] {
  return MISSION_FILES.find((f) => f.trackSlug === trackSlug)?.missions ?? [];
}

export function getMissionBySlug(
  trackSlug: string,
  missionSlug: string
): RedTeamMission | undefined {
  return getMissionsByTrackSlug(trackSlug).find((m) => m.slug === missionSlug);
}

/** Tổng số mission toàn app (cho stats ở /rt overview) */
export const TOTAL_MISSIONS = MISSION_FILES.reduce(
  (acc, f) => acc + f.missions.length,
  0
);
