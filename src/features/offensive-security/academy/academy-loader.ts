import rolesAndBoundariesData from '../data/academy/os00-ethics-authorization/roles-and-boundaries.json';
import rulesOfEngagementData from '../data/academy/os00-ethics-authorization/rules-of-engagement.json';
import evidenceAndDisclosureData from '../data/academy/os00-ethics-authorization/evidence-and-disclosure.json';
import processesDataAndAddressingData from '../data/academy/os01-network-foundations/processes-data-and-addressing.json';
import linkRoutingAndSegmentationData from '../data/academy/os01-network-foundations/link-routing-and-segmentation.json';
import dnsTransportAndTlsData from '../data/academy/os01-network-foundations/dns-transport-and-tls.json';
import enterpriseProtocolsAndPacketsData from '../data/academy/os01-network-foundations/enterprise-protocols-and-packets.json';
import filesIdentityPermissionsData from '../data/academy/os02-linux-foundations/files-identity-permissions.json';
import windowsArchitectureIdentitiesAclsData from '../data/academy/os03-windows-foundations/windows-architecture-identities-acls.json';
import processesServicesShellData from '../data/academy/os02-linux-foundations/processes-services-shell.json';
import servicesPowershellRemoteData from '../data/academy/os03-windows-foundations/services-powershell-remote.json';
import linuxBoundariesAndTelemetryData from '../data/academy/os02-linux-foundations/linux-boundaries-and-telemetry.json';
import endpointControlsAndEventsData from '../data/academy/os03-windows-foundations/endpoint-controls-and-events.json';
import bashPythonPowershellData from '../data/academy/os04-operator-scripting/bash-python-powershell.json';
import structuredDataHttpGitData from '../data/academy/os04-operator-scripting/structured-data-http-git.json';
import safeEvidenceAutomationData from '../data/academy/os04-operator-scripting/safe-evidence-automation.json';
import engagementReconEnumerationData from '../data/academy/os05-pentest-methodology/engagement-recon-enumeration.json';
import verificationImpactEvidenceData from '../data/academy/os05-pentest-methodology/verification-impact-evidence.json';
import reportRemediationRetestData from '../data/academy/os05-pentest-methodology/report-remediation-retest.json';
import discoveryServicesAuthenticationData from '../data/academy/os06-network-infrastructure/discovery-services-authentication.json';
import hostBoundariesAndMovementData from '../data/academy/os06-network-infrastructure/host-boundaries-and-movement.json';
import blindEnterpriseNetworkData from '../data/academy/os06-network-infrastructure/blind-enterprise-network.json';
import browserHttpAuthSessionData from '../data/academy/os07-web-api-bug-bounty/browser-http-auth-session.json';
import accessControlAndInjectionData from '../data/academy/os07-web-api-bug-bounty/access-control-and-injection.json';
import browserCrossOriginAndFilesData from '../data/academy/os07-web-api-bug-bounty/browser-cross-origin-and-files.json';
import modernApiAndBusinessLogicData from '../data/academy/os07-web-api-bug-bounty/modern-api-and-business-logic.json';
import bountyReconReportDisclosureData from '../data/academy/os07-web-api-bug-bounty/bounty-recon-report-disclosure.json';
import adArchitectureProtocolsData from '../data/academy/os08-active-directory/ad-architecture-protocols.json';
import identitiesPoliciesPathsData from '../data/academy/os08-active-directory/identities-policies-paths.json';
import adcsTrustHybridData from '../data/academy/os08-active-directory/adcs-trust-hybrid.json';
import adDetectionCapstoneData from '../data/academy/os08-active-directory/ad-detection-capstone.json';
import cloudIdentityControlPlaneData from '../data/academy/os09-cloud-container-supply-chain/cloud-identity-control-plane.json';
import cloudWorkloadsAndTelemetryData from '../data/academy/os09-cloud-container-supply-chain/cloud-workloads-and-telemetry.json';
import containersKubernetesData from '../data/academy/os09-cloud-container-supply-chain/containers-kubernetes.json';
import cicdArtifactsCapstoneData from '../data/academy/os09-cloud-container-supply-chain/cicd-artifacts-capstone.json';
import mobileArchitectureData from '../data/academy/os10-mobile-wireless/mobile-architecture-data.json';
import mobileIpcRuntimeApiData from '../data/academy/os10-mobile-wireless/mobile-ipc-runtime-api.json';
import wirelessAuthAndTelemetryData from '../data/academy/os10-mobile-wireless/wireless-auth-and-telemetry.json';
import embeddedFirmwareBootData from '../data/academy/os11-iot-firmware-hardware/embedded-firmware-boot.json';
import debugProtocolDeviceIdentityData from '../data/academy/os11-iot-firmware-hardware/debug-protocol-device-identity.json';
import otSafetyAndCapstoneData from '../data/academy/os11-iot-firmware-hardware/ot-safety-and-capstone.json';
import aiThreatModelAndInjectionData from '../data/academy/os12-ai-agentic-security/ai-threat-model-and-injection.json';
import toolsRagIdentityData from '../data/academy/os12-ai-agentic-security/tools-rag-identity.json';
import aiSupplyChainAndCapstoneData from '../data/academy/os12-ai-agentic-security/ai-supply-chain-and-capstone.json';
import researchSurfaceSourceAuditData from '../data/academy/os13-vulnerability-research/research-surface-source-audit.json';
import fuzzingCrashTriageData from '../data/academy/os13-vulnerability-research/fuzzing-crash-triage.json';
import rootCauseVariantsPatchesData from '../data/academy/os13-vulnerability-research/root-cause-variants-patches.json';
import cveCweCvssDisclosureData from '../data/academy/os13-vulnerability-research/cve-cwe-cvss-disclosure.json';
import memoryAssemblyExecutablesData from '../data/academy/os14-reverse-engineering/memory-assembly-executables.json';
import staticDynamicDebuggingData from '../data/academy/os14-reverse-engineering/static-dynamic-debugging.json';
import memoryFailuresAndMitigationsData from '../data/academy/os14-reverse-engineering/memory-failures-and-mitigations.json';
import malwareBehaviorAnalysisData from '../data/academy/os15-malware-c2-emulation/malware-behavior-analysis.json';
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
export const FILES_IDENTITY_PERMISSIONS_MODULE = parseAcademyModule(
  filesIdentityPermissionsData
);
export const WINDOWS_ARCHITECTURE_IDENTITIES_ACLS_MODULE = parseAcademyModule(
  windowsArchitectureIdentitiesAclsData
);
export const PROCESSES_SERVICES_SHELL_MODULE = parseAcademyModule(
  processesServicesShellData
);
export const SERVICES_POWERSHELL_REMOTE_MODULE = parseAcademyModule(
  servicesPowershellRemoteData
);
export const LINUX_BOUNDARIES_AND_TELEMETRY_MODULE = parseAcademyModule(
  linuxBoundariesAndTelemetryData
);
export const ENDPOINT_CONTROLS_AND_EVENTS_MODULE = parseAcademyModule(
  endpointControlsAndEventsData
);
export const BASH_PYTHON_POWERSHELL_MODULE = parseAcademyModule(bashPythonPowershellData);
export const STRUCTURED_DATA_HTTP_GIT_MODULE = parseAcademyModule(
  structuredDataHttpGitData
);
export const SAFE_EVIDENCE_AUTOMATION_MODULE = parseAcademyModule(
  safeEvidenceAutomationData
);
export const ENGAGEMENT_RECON_ENUMERATION_MODULE = parseAcademyModule(
  engagementReconEnumerationData
);
export const VERIFICATION_IMPACT_EVIDENCE_MODULE = parseAcademyModule(
  verificationImpactEvidenceData
);
export const REPORT_REMEDIATION_RETEST_MODULE = parseAcademyModule(
  reportRemediationRetestData
);
export const DISCOVERY_SERVICES_AUTHENTICATION_MODULE = parseAcademyModule(
  discoveryServicesAuthenticationData
);
export const HOST_BOUNDARIES_AND_MOVEMENT_MODULE = parseAcademyModule(
  hostBoundariesAndMovementData
);
export const BLIND_ENTERPRISE_NETWORK_MODULE = parseAcademyModule(
  blindEnterpriseNetworkData
);
export const BROWSER_HTTP_AUTH_SESSION_MODULE = parseAcademyModule(
  browserHttpAuthSessionData
);
export const ACCESS_CONTROL_AND_INJECTION_MODULE = parseAcademyModule(
  accessControlAndInjectionData
);
export const BROWSER_CROSS_ORIGIN_AND_FILES_MODULE = parseAcademyModule(
  browserCrossOriginAndFilesData
);
export const MODERN_API_AND_BUSINESS_LOGIC_MODULE = parseAcademyModule(
  modernApiAndBusinessLogicData
);
export const BOUNTY_RECON_REPORT_DISCLOSURE_MODULE = parseAcademyModule(
  bountyReconReportDisclosureData
);
export const AD_ARCHITECTURE_PROTOCOLS_MODULE = parseAcademyModule(
  adArchitectureProtocolsData
);
export const IDENTITIES_POLICIES_PATHS_MODULE = parseAcademyModule(
  identitiesPoliciesPathsData
);
export const ADCS_TRUST_HYBRID_MODULE = parseAcademyModule(adcsTrustHybridData);
export const AD_DETECTION_CAPSTONE_MODULE = parseAcademyModule(adDetectionCapstoneData);
export const CLOUD_IDENTITY_CONTROL_PLANE_MODULE = parseAcademyModule(
  cloudIdentityControlPlaneData
);
export const CLOUD_WORKLOADS_AND_TELEMETRY_MODULE = parseAcademyModule(
  cloudWorkloadsAndTelemetryData
);
export const CONTAINERS_KUBERNETES_MODULE = parseAcademyModule(containersKubernetesData);
export const CICD_ARTIFACTS_CAPSTONE_MODULE = parseAcademyModule(
  cicdArtifactsCapstoneData
);
export const MOBILE_ARCHITECTURE_DATA_MODULE = parseAcademyModule(mobileArchitectureData);
export const MOBILE_IPC_RUNTIME_API_MODULE = parseAcademyModule(mobileIpcRuntimeApiData);
export const WIRELESS_AUTH_AND_TELEMETRY_MODULE = parseAcademyModule(
  wirelessAuthAndTelemetryData
);
export const EMBEDDED_FIRMWARE_BOOT_MODULE = parseAcademyModule(embeddedFirmwareBootData);
export const DEBUG_PROTOCOL_DEVICE_IDENTITY_MODULE = parseAcademyModule(
  debugProtocolDeviceIdentityData
);
export const OT_SAFETY_AND_CAPSTONE_MODULE = parseAcademyModule(otSafetyAndCapstoneData);
export const AI_THREAT_MODEL_AND_INJECTION_MODULE = parseAcademyModule(
  aiThreatModelAndInjectionData
);
export const TOOLS_RAG_IDENTITY_MODULE = parseAcademyModule(toolsRagIdentityData);
export const AI_SUPPLY_CHAIN_AND_CAPSTONE_MODULE = parseAcademyModule(
  aiSupplyChainAndCapstoneData
);
export const RESEARCH_SURFACE_SOURCE_AUDIT_MODULE = parseAcademyModule(
  researchSurfaceSourceAuditData
);
export const FUZZING_CRASH_TRIAGE_MODULE = parseAcademyModule(fuzzingCrashTriageData);
export const ROOT_CAUSE_VARIANTS_PATCHES_MODULE = parseAcademyModule(
  rootCauseVariantsPatchesData
);
export const CVE_CWE_CVSS_DISCLOSURE_MODULE = parseAcademyModule(
  cveCweCvssDisclosureData
);
export const MEMORY_ASSEMBLY_EXECUTABLES_MODULE = parseAcademyModule(
  memoryAssemblyExecutablesData
);
export const STATIC_DYNAMIC_DEBUGGING_MODULE = parseAcademyModule(
  staticDynamicDebuggingData
);
export const MEMORY_FAILURES_AND_MITIGATIONS_MODULE = parseAcademyModule(
  memoryFailuresAndMitigationsData
);
export const MALWARE_BEHAVIOR_ANALYSIS_MODULE = parseAcademyModule(
  malwareBehaviorAnalysisData
);

export const ACADEMY_MODULES: AcademyModule[] = [
  ROLES_AND_BOUNDARIES_MODULE,
  RULES_OF_ENGAGEMENT_MODULE,
  EVIDENCE_AND_DISCLOSURE_MODULE,
  PROCESSES_DATA_AND_ADDRESSING_MODULE,
  LINK_ROUTING_AND_SEGMENTATION_MODULE,
  DNS_TRANSPORT_AND_TLS_MODULE,
  ENTERPRISE_PROTOCOLS_AND_PACKETS_MODULE,
  FILES_IDENTITY_PERMISSIONS_MODULE,
  WINDOWS_ARCHITECTURE_IDENTITIES_ACLS_MODULE,
  PROCESSES_SERVICES_SHELL_MODULE,
  SERVICES_POWERSHELL_REMOTE_MODULE,
  LINUX_BOUNDARIES_AND_TELEMETRY_MODULE,
  ENDPOINT_CONTROLS_AND_EVENTS_MODULE,
  BASH_PYTHON_POWERSHELL_MODULE,
  STRUCTURED_DATA_HTTP_GIT_MODULE,
  SAFE_EVIDENCE_AUTOMATION_MODULE,
  ENGAGEMENT_RECON_ENUMERATION_MODULE,
  VERIFICATION_IMPACT_EVIDENCE_MODULE,
  REPORT_REMEDIATION_RETEST_MODULE,
  DISCOVERY_SERVICES_AUTHENTICATION_MODULE,
  HOST_BOUNDARIES_AND_MOVEMENT_MODULE,
  BLIND_ENTERPRISE_NETWORK_MODULE,
  BROWSER_HTTP_AUTH_SESSION_MODULE,
  ACCESS_CONTROL_AND_INJECTION_MODULE,
  BROWSER_CROSS_ORIGIN_AND_FILES_MODULE,
  MODERN_API_AND_BUSINESS_LOGIC_MODULE,
  BOUNTY_RECON_REPORT_DISCLOSURE_MODULE,
  AD_ARCHITECTURE_PROTOCOLS_MODULE,
  IDENTITIES_POLICIES_PATHS_MODULE,
  ADCS_TRUST_HYBRID_MODULE,
  AD_DETECTION_CAPSTONE_MODULE,
  CLOUD_IDENTITY_CONTROL_PLANE_MODULE,
  CLOUD_WORKLOADS_AND_TELEMETRY_MODULE,
  CONTAINERS_KUBERNETES_MODULE,
  CICD_ARTIFACTS_CAPSTONE_MODULE,
  MOBILE_ARCHITECTURE_DATA_MODULE,
  MOBILE_IPC_RUNTIME_API_MODULE,
  WIRELESS_AUTH_AND_TELEMETRY_MODULE,
  EMBEDDED_FIRMWARE_BOOT_MODULE,
  DEBUG_PROTOCOL_DEVICE_IDENTITY_MODULE,
  OT_SAFETY_AND_CAPSTONE_MODULE,
  AI_THREAT_MODEL_AND_INJECTION_MODULE,
  TOOLS_RAG_IDENTITY_MODULE,
  AI_SUPPLY_CHAIN_AND_CAPSTONE_MODULE,
  RESEARCH_SURFACE_SOURCE_AUDIT_MODULE,
  FUZZING_CRASH_TRIAGE_MODULE,
  ROOT_CAUSE_VARIANTS_PATCHES_MODULE,
  CVE_CWE_CVSS_DISCLOSURE_MODULE,
  MEMORY_ASSEMBLY_EXECUTABLES_MODULE,
  STATIC_DYNAMIC_DEBUGGING_MODULE,
  MEMORY_FAILURES_AND_MITIGATIONS_MODULE,
  MALWARE_BEHAVIOR_ANALYSIS_MODULE,
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
