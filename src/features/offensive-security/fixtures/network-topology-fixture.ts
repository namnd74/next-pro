/**
 * Declarative Network Topology Fixture for Cyber Range Map
 * Static declarative dataset (no fake dynamic scanner).
 */

export interface NetworkService {
  port: number;
  protocol: 'tcp' | 'udp';
  name: string;
  version: string;
  state: 'open' | 'filtered' | 'closed';
  banner?: string;
  vulns?: string[];
}

export interface NetworkHostNode {
  ip: string;
  hostname: string;
  mac: string;
  os: string;
  role: string;
  isGateway?: boolean;
  services: NetworkService[];
  httpRoutes?: Record<string, { statusCode: number; contentType: string; body: string }>;
}

export const ENTERPRISE_CYBER_RANGE_SUBNET: Record<string, NetworkHostNode> = {
  '10.0.4.1': {
    ip: '10.0.4.1',
    hostname: 'gateway.corp.internal',
    mac: '52:54:00:12:34:01',
    os: 'Linux Edge Router (OpenWrt 23.05 / Linux 6.1)',
    role: 'Default Gateway & Core DNS Router',
    isGateway: true,
    services: [
      {
        port: 22,
        protocol: 'tcp',
        name: 'ssh',
        version: 'Dropbear sshd 2023.82',
        state: 'open',
      },
      {
        port: 53,
        protocol: 'udp',
        name: 'domain',
        version: 'dnsmasq 2.89',
        state: 'open',
      },
      {
        port: 80,
        protocol: 'tcp',
        name: 'http',
        version: 'uHTTPd 2023-06',
        state: 'open',
        banner: 'Enterprise Gateway Admin Portal',
      },
      {
        port: 443,
        protocol: 'tcp',
        name: 'ssl/http',
        version: 'uHTTPd TLS',
        state: 'open',
      },
    ],
  },
  '10.0.4.10': {
    ip: '10.0.4.10',
    hostname: 'web01.corp.internal',
    mac: '52:54:00:12:34:10',
    os: 'Ubuntu 24.04 LTS (Linux 6.8.0-45-generic)',
    role: 'Production Customer API Gateway & Web Application',
    services: [
      {
        port: 22,
        protocol: 'tcp',
        name: 'ssh',
        version: 'OpenSSH 9.6p1 Ubuntu-3ubuntu13.4',
        state: 'open',
      },
      {
        port: 80,
        protocol: 'tcp',
        name: 'http',
        version: 'nginx 1.24.0 (Ubuntu)',
        state: 'open',
      },
      {
        port: 3000,
        protocol: 'tcp',
        name: 'nodejs',
        version: 'Node.js v20.18.0 (Express/REST)',
        state: 'open',
      },
    ],
  },
  '10.0.4.15': {
    ip: '10.0.4.15',
    hostname: 'db01.corp.internal',
    mac: '52:54:00:12:34:15',
    os: 'Debian 12 Bookworm (Linux 6.1.0-25-amd64)',
    role: 'Enterprise Core Relational Database Server',
    services: [
      {
        port: 22,
        protocol: 'tcp',
        name: 'ssh',
        version: 'OpenSSH 9.2p1 Debian-2+deb12u3',
        state: 'open',
      },
      {
        port: 5432,
        protocol: 'tcp',
        name: 'postgresql',
        version: 'PostgreSQL 16.4-1.pgdg120+1',
        state: 'open',
      },
    ],
  },
  '10.0.4.20': {
    ip: '10.0.4.20',
    hostname: 'ad-dc01.corp.internal',
    mac: '52:54:00:12:34:20',
    os: 'Windows Server 2022 Datacenter (Build 20348.2655)',
    role: 'Active Directory Domain Controller (CORP.INTERNAL)',
    services: [
      {
        port: 53,
        protocol: 'udp',
        name: 'domain',
        version: 'Microsoft DNS 10.0.20348',
        state: 'open',
      },
      {
        port: 88,
        protocol: 'tcp',
        name: 'kerberos-sec',
        version: 'Microsoft Windows Kerberos',
        state: 'open',
      },
      {
        port: 389,
        protocol: 'tcp',
        name: 'ldap',
        version: 'Microsoft Active Directory LDAP',
        state: 'open',
      },
      {
        port: 445,
        protocol: 'tcp',
        name: 'microsoft-ds',
        version: 'Windows Server 2022 SMBv3',
        state: 'open',
      },
    ],
  },
};
