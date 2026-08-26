import type { AcademyModule } from './types';

/**
 * Ordered track metadata for the academy tree (track → module → lesson).
 *
 * Mirrors `docs/offensive-security/curriculum-manifest.json` track ids/titles.
 * Keep in sync when the manifest adds or renames a track; tracked as an open
 * decision to derive this from the manifest at build time later.
 */
export interface AcademyTrackInfo {
  id: string;
  title: string;
}

export const ACADEMY_TRACKS: AcademyTrackInfo[] = [
  {
    id: 'os00-ethics-authorization',
    title: 'Ethics, Authorization & Rules of Engagement',
  },
  { id: 'os01-network-foundations', title: 'Computing & Network Foundations' },
  { id: 'os02-linux-foundations', title: 'Linux Foundations & Security' },
  { id: 'os03-windows-foundations', title: 'Windows Foundations & Security' },
  { id: 'os04-operator-scripting', title: 'Operator Scripting & Data Handling' },
  { id: 'os05-pentest-methodology', title: 'Penetration Testing Methodology' },
  { id: 'os06-network-infrastructure', title: 'Network & Infrastructure Assessment' },
  { id: 'os07-web-api-bug-bounty', title: 'Web, API & Bug Bounty' },
  { id: 'os08-active-directory', title: 'Active Directory & Enterprise Identity' },
  {
    id: 'os09-cloud-container-supply-chain',
    title: 'Cloud, Containers & Software Supply Chain',
  },
  { id: 'os10-mobile-wireless', title: 'Mobile & Wireless' },
  { id: 'os11-iot-firmware-hardware', title: 'IoT, Firmware, Hardware & OT Foundations' },
  { id: 'os12-ai-agentic-security', title: 'AI & Agentic-System Security' },
  {
    id: 'os13-vulnerability-research',
    title: 'Vulnerability Research & Zero-Day Lifecycle',
  },
  { id: 'os14-reverse-engineering', title: 'Reverse Engineering & Exploitability' },
  {
    id: 'os15-malware-c2-emulation',
    title: 'Malware Analysis, C2 & Adversary Emulation',
  },
  {
    id: 'os16-availability-abuse-resilience',
    title: 'Availability, Abuse Resistance, Botnet & DDoS Defense',
  },
  { id: 'os17-purple-detection', title: 'Purple Team & Detection Engineering' },
  { id: 'os18-enterprise-capstone', title: 'Enterprise Capstone' },
];

export function getAcademyTrack(trackId: string): AcademyTrackInfo | undefined {
  return ACADEMY_TRACKS.find((track) => track.id === trackId);
}

export interface AcademyTrackGroup {
  track: AcademyTrackInfo;
  modules: AcademyModule[];
}

export function groupAcademyModulesByTrack(
  modules: AcademyModule[]
): AcademyTrackGroup[] {
  return ACADEMY_TRACKS.map((track) => ({
    track,
    modules: modules.filter((module) => module.trackId === track.id),
  })).filter((group) => group.modules.length > 0);
}

const ACADEMY_BASE = '/offensive-security/academy';

export function academyModuleHref(
  module: Pick<AcademyModule, 'trackId' | 'slug'>
): string {
  return `${ACADEMY_BASE}/${module.trackId}/${module.slug}`;
}

export function academyLessonHref(
  module: Pick<AcademyModule, 'trackId' | 'slug'>,
  lessonSlug: string
): string {
  return `${ACADEMY_BASE}/${module.trackId}/${module.slug}/${lessonSlug}`;
}
