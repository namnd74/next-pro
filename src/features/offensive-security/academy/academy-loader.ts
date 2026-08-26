import rolesAndBoundariesData from '../data/academy/roles-and-boundaries.json';
import rulesOfEngagementData from '../data/academy/rules-of-engagement.json';
import evidenceAndDisclosureData from '../data/academy/evidence-and-disclosure.json';
import processesDataAndAddressingData from '../data/academy/processes-data-and-addressing.json';
import linkRoutingAndSegmentationData from '../data/academy/link-routing-and-segmentation.json';
import dnsTransportAndTlsData from '../data/academy/dns-transport-and-tls.json';
import enterpriseProtocolsAndPacketsData from '../data/academy/enterprise-protocols-and-packets.json';
import type { AcademyLesson, AcademyModule } from './types';

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function assertText(value: unknown, location: string): asserts value is string {
  if (typeof value !== 'string' || value.trim() === '') {
    throw new Error(`${location} must be a non-empty string`);
  }
}

function assertStringArray(value: unknown, location: string): asserts value is string[] {
  if (!Array.isArray(value)) throw new Error(`${location} must be an array`);
  value.forEach((item, index) => assertText(item, `${location}[${index}]`));
}

function assertAcademyLesson(
  value: unknown,
  location: string
): asserts value is AcademyLesson {
  if (!isRecord(value)) throw new Error(`${location} must be an object`);

  for (const field of ['id', 'slug', 'title', 'summary', 'mentalModel'] as const) {
    assertText(value[field], `${location}.${field}`);
  }
  if (!Number.isInteger(value.durationMinutes) || Number(value.durationMinutes) <= 0) {
    throw new Error(`${location}.durationMinutes must be a positive integer`);
  }
  for (const field of [
    'prerequisites',
    'outcomes',
    'careerPaths',
    'domains',
    'attackTactics',
    'keywords',
  ] as const) {
    assertStringArray(value[field], `${location}.${field}`);
  }
  for (const field of ['visual', 'lab', 'governance', 'transferChallenge'] as const) {
    if (!isRecord(value[field]))
      throw new Error(`${location}.${field} must be an object`);
  }
  for (const field of ['sections', 'misconceptions', 'quiz', 'sources'] as const) {
    if (!Array.isArray(value[field]) || value[field].length === 0) {
      throw new Error(`${location}.${field} must be a non-empty array`);
    }
  }
}

function parseAcademyModule(value: unknown): AcademyModule {
  if (!isRecord(value)) throw new Error('Academy module must be an object');
  for (const field of ['id', 'slug', 'trackId', 'title', 'summary'] as const) {
    assertText(value[field], `academyModule.${field}`);
  }
  if (!Number.isInteger(value.estimatedMinutes) || Number(value.estimatedMinutes) <= 0) {
    throw new Error('academyModule.estimatedMinutes must be a positive integer');
  }
  assertStringArray(value.careerPaths, 'academyModule.careerPaths');
  assertStringArray(value.domains, 'academyModule.domains');
  if (!Array.isArray(value.lessons) || value.lessons.length === 0) {
    throw new Error('academyModule.lessons must be a non-empty array');
  }
  value.lessons.forEach((lesson, index) =>
    assertAcademyLesson(lesson, `academyModule.lessons[${index}]`)
  );
  return value as unknown as AcademyModule;
}

export const ROLES_AND_BOUNDARIES_MODULE = parseAcademyModule(rolesAndBoundariesData);
export const RULES_OF_ENGAGEMENT_MODULE = parseAcademyModule(rulesOfEngagementData);
export const EVIDENCE_AND_DISCLOSURE_MODULE = parseAcademyModule(
  evidenceAndDisclosureData
);
export const PROCESSES_DATA_AND_ADDRESSING_MODULE = parseAcademyModule(
  processesDataAndAddressingData
);
export const LINK_ROUTING_AND_SEGMENTATION_MODULE = parseAcademyModule(
  linkRoutingAndSegmentationData
);
export const DNS_TRANSPORT_AND_TLS_MODULE = parseAcademyModule(dnsTransportAndTlsData);
export const ENTERPRISE_PROTOCOLS_AND_PACKETS_MODULE = parseAcademyModule(
  enterpriseProtocolsAndPacketsData
);

export const ACADEMY_MODULES: AcademyModule[] = [
  ROLES_AND_BOUNDARIES_MODULE,
  RULES_OF_ENGAGEMENT_MODULE,
  EVIDENCE_AND_DISCLOSURE_MODULE,
  PROCESSES_DATA_AND_ADDRESSING_MODULE,
  LINK_ROUTING_AND_SEGMENTATION_MODULE,
  DNS_TRANSPORT_AND_TLS_MODULE,
  ENTERPRISE_PROTOCOLS_AND_PACKETS_MODULE,
];

export function getAcademyModuleBySlug(moduleSlug: string): AcademyModule | undefined {
  return ACADEMY_MODULES.find((academyModule) => academyModule.slug === moduleSlug);
}

export function getAcademyLessonBySlug(
  moduleSlug: string,
  lessonSlug: string
): { module: AcademyModule; lesson: AcademyLesson } | undefined {
  const academyModule = getAcademyModuleBySlug(moduleSlug);
  const lesson = academyModule?.lessons.find((item) => item.slug === lessonSlug);
  return academyModule && lesson ? { module: academyModule, lesson } : undefined;
}
