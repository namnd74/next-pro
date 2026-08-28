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
    httpRoutes: {
      '/': {
        statusCode: 200,
        contentType: 'text/html',
        body: '<html><head><title>Edge Gateway Admin</title></head><body><h1>Enterprise Border Gateway v4.2</h1><p>Status: OPERATIONAL | Uplink: 10.0.0.1/30</p></body></html>',
      },
      '/api/status': {
        statusCode: 200,
        contentType: 'application/json',
        body: '{"gateway":"10.0.4.1","subnet":"10.0.4.0/24","dhcp_active":true,"dns_forwarders":["1.1.1.1","8.8.8.8"]}',
      },
    },
  },

  '10.0.4.10': {
    ip: '10.0.4.10',
    hostname: 'web01.corp.internal',
    mac: '52:54:00:12:34:10',
    os: 'Ubuntu Linux 24.04 LTS (Noble Numbat)',
    role: 'Production Web Application & API Server',
    services: [
      {
        port: 22,
        protocol: 'tcp',
        name: 'ssh',
        version: 'OpenSSH 9.6p1 Ubuntu 3ubuntu13',
        state: 'open',
      },
      {
        port: 80,
        protocol: 'tcp',
        name: 'http',
        version: 'nginx 1.24.0 (Ubuntu)',
        state: 'open',
        banner: 'Corp Main E-Commerce Portal',
        vulns: ['VULNERABLE: Disclosed /robots.txt & Unprotected Backup Directory'],
      },
      {
        port: 8080,
        protocol: 'tcp',
        name: 'http-proxy',
        version: 'Node.js Express API v4.19',
        state: 'open',
        banner: 'Internal REST API Backend',
        vulns: ['VULNERABLE: IDOR BOLA on /api/v1/user/profile?id=1'],
      },
      {
        port: 9000,
        protocol: 'tcp',
        name: 'php-fpm',
        version: 'PHP FastCGI Process Manager 8.3',
        state: 'open',
      },
    ],
    httpRoutes: {
      '/': {
        statusCode: 200,
        contentType: 'text/html',
        body: '<!DOCTYPE html><html><body><h1>Corporate Web Portal</h1><p>Welcome to Production Web Services.</p></body></html>',
      },
      '/robots.txt': {
        statusCode: 200,
        contentType: 'text/plain',
        body: 'User-agent: *\nDisallow: /admin_backup_2026/\nDisallow: /api/v1/internal_debug\nDisallow: /.git/\n',
      },
      '/admin_backup_2026/': {
        statusCode: 200,
        contentType: 'text/html',
        body: '<html><body><h2>Index of /admin_backup_2026/</h2><ul><li><a href="database_dump_2026.sql.gz">database_dump_2026.sql.gz</a> (4.2 MB)</li><li><a href="master_secrets.env">master_secrets.env</a> (1.2 KB)</li></ul></body></html>',
      },
      '/api/v1/health': {
        statusCode: 200,
        contentType: 'application/json',
        body: '{"status":"healthy","uptime_seconds":1204928,"db_connection":"pool_active"}',
      },
    },
  },

  '10.0.4.20': {
    ip: '10.0.4.20',
    hostname: 'ad-dc01.corp.internal',
    mac: '52:54:00:12:34:20',
    os: 'Windows Server 2022 Datacenter (Active Directory DS)',
    role: 'Enterprise Domain Controller (CORP.INTERNAL)',
    services: [
      {
        port: 53,
        protocol: 'tcp',
        name: 'domain',
        version: 'Microsoft DNS 2022',
        state: 'open',
      },
      {
        port: 88,
        protocol: 'tcp',
        name: 'kerberos-sec',
        version: 'Microsoft Windows Kerberos KDC',
        state: 'open',
      },
      {
        port: 135,
        protocol: 'tcp',
        name: 'msrpc',
        version: 'Microsoft Windows RPC endpoint mapper',
        state: 'open',
      },
      {
        port: 389,
        protocol: 'tcp',
        name: 'ldap',
        version: 'Active Directory LDAP (Domain: CORP.INTERNAL)',
        state: 'open',
      },
      {
        port: 445,
        protocol: 'tcp',
        name: 'microsoft-ds',
        version: 'Windows Server 2022 SMBv3 (Signing: Enabled)',
        state: 'open',
      },
      {
        port: 3389,
        protocol: 'tcp',
        name: 'ms-wbt-server',
        version: 'Microsoft Terminal Services RDP',
        state: 'open',
      },
    ],
  },

  '10.0.4.50': {
    ip: '10.0.4.50',
    hostname: 'db-cluster01.corp.internal',
    mac: '52:54:00:12:34:50',
    os: 'Debian Linux 12 (Bookworm)',
    role: 'Primary Relational Database & Redis Cache',
    services: [
      {
        port: 22,
        protocol: 'tcp',
        name: 'ssh',
        version: 'OpenSSH 9.2p1 Debian 2+deb12u3',
        state: 'open',
      },
      {
        port: 5432,
        protocol: 'tcp',
        name: 'postgresql',
        version: 'PostgreSQL Database Server 16.2',
        state: 'open',
      },
      {
        port: 6379,
        protocol: 'tcp',
        name: 'redis',
        version: 'Redis in-memory store v7.2.4',
        state: 'open',
      },
    ],
  },

  '10.0.4.100': {
    ip: '10.0.4.100',
    hostname: 'siem-soc01.corp.internal',
    mac: '52:54:00:12:34:100',
    os: 'AlmaLinux 9 Enterprise',
    role: 'Security Operations & Telemetry Collector (SIEM)',
    services: [
      { port: 22, protocol: 'tcp', name: 'ssh', version: 'OpenSSH 8.7p1', state: 'open' },
      {
        port: 514,
        protocol: 'udp',
        name: 'syslog',
        version: 'rsyslogd 8.2102.0',
        state: 'open',
      },
      {
        port: 5601,
        protocol: 'tcp',
        name: 'kibana',
        version: 'Elastic Kibana Security Dashboard 8.12',
        state: 'open',
      },
      {
        port: 9200,
        protocol: 'tcp',
        name: 'elasticsearch',
        version: 'Elasticsearch REST Cluster',
        state: 'open',
      },
    ],
  },

  '10.0.4.200': {
    ip: '10.0.4.200',
    hostname: 'git-dev01.corp.internal',
    mac: '52:54:00:12:34:200',
    os: 'Alpine Linux 3.20 (x86_64)',
    role: 'Internal Developer VCS & CI/CD Pipeline',
    services: [
      { port: 22, protocol: 'tcp', name: 'ssh', version: 'OpenSSH 9.7p1', state: 'open' },
      {
        port: 3000,
        protocol: 'tcp',
        name: 'gitea',
        version: 'Gitea Enterprise Git Service v1.22',
        state: 'open',
      },
      {
        port: 5000,
        protocol: 'tcp',
        name: 'docker-registry',
        version: 'Docker Distribution v2.8',
        state: 'open',
      },
    ],
    httpRoutes: {
      '/': {
        statusCode: 200,
        contentType: 'text/html',
        body: '<html><body><h1>Internal Gitea Developer Repository</h1><p>Active Repositories: corp/auth-service, corp/payment-gateway</p></body></html>',
      },
    },
  },
};

export const resolveHostByQuery = (query: string): NetworkHostNode | null => {
  const clean = query
    .trim()
    .replace(/^https?:\/\//, '')
    .split('/')[0]
    .split(':')[0];
  if (ENTERPRISE_CYBER_RANGE_SUBNET[clean]) {
    return ENTERPRISE_CYBER_RANGE_SUBNET[clean];
  }

  const byHostname = Object.values(ENTERPRISE_CYBER_RANGE_SUBNET).find(
    (h) => h.hostname.toLowerCase() === clean.toLowerCase()
  );
  if (byHostname) return byHostname;

  return null;
};

export const handleNmapScan = (args: string[]): string => {
  const hasSubnetSweep = args.some(
    (a) => a.includes('10.0.4.0/24') || a.includes('10.0.4.*') || a.includes('-sn')
  );
  const hasServiceVersion =
    args.includes('-sV') || args.includes('-A') || args.includes('-sC');
  const hasVulnScript = args.some((a) => a.includes('vuln') || a.includes('--script'));
  const portFilterArg = args.find((a, i) => args[i - 1] === '-p' || a.startsWith('-p'));
  const requestedPorts = portFilterArg
    ? portFilterArg
        .replace('-p', '')
        .split(',')
        .map((p) => parseInt(p, 10))
        .filter((p) => !isNaN(p))
    : null;

  const targetArg = args.find((a) => !a.startsWith('-') && a !== 'nmap');

  // Case 1: Subnet Sweep (10.0.4.0/24)
  if (hasSubnetSweep || targetArg === '10.0.4.0/24') {
    const hosts = Object.values(ENTERPRISE_CYBER_RANGE_SUBNET);
    let out =
      `Starting Nmap 7.94 ( https://nmap.org ) at 2026-08-27 07:15 UTC\n` +
      `Initiating ARP Ping Scan on 10.0.4.0/24 subnet\n` +
      `Scanning 256 IPs [256 hosts]\n\n`;

    hosts.forEach((h) => {
      out += `Nmap scan report for ${h.hostname} (${h.ip})\n`;
      out += `Host is up (0.00035s latency).\n`;
      out += `MAC Address: ${h.mac} (${h.os.split(' ')[0]} Virtual NIC)\n`;
      out += `Role: ${h.role}\n`;
      const openCount = h.services.filter((s) => s.state === 'open').length;
      out += `Open Ports: ${h.services.map((s) => `${s.port}/${s.protocol}`).join(', ')} (${openCount} services active)\n\n`;
    });

    out += `Nmap done: 256 IP addresses (6 hosts up) scanned in 1.42 seconds\n`;
    return out;
  }

  // Case 2: Individual Target Host Scan
  const targetHost = targetArg
    ? resolveHostByQuery(targetArg)
    : ENTERPRISE_CYBER_RANGE_SUBNET['10.0.4.10'];
  if (!targetHost) {
    return (
      `Starting Nmap 7.94 ( https://nmap.org ) at 2026-08-27 07:15 UTC\n` +
      `Note: Host '${targetArg || 'target'}' seems down. If it is really up, but blocking our ping probes, try -Pn\n` +
      `Nmap done: 1 IP address (0 hosts up) scanned in 2.01 seconds\n`
    );
  }

  let out =
    `Starting Nmap 7.94 ( https://nmap.org ) at 2026-08-27 07:15 UTC\n` +
    `Nmap scan report for ${targetHost.hostname} (${targetHost.ip})\n` +
    `Host is up (0.00042s latency).\n` +
    `MAC Address: ${targetHost.mac}\n` +
    `OS Details: ${targetHost.os}\n\n` +
    `PORT     STATE SERVICE       VERSION\n`;

  const filteredServices =
    requestedPorts && requestedPorts.length > 0
      ? targetHost.services.filter((s) => requestedPorts.includes(s.port))
      : targetHost.services;

  filteredServices.forEach((s) => {
    const portStr = `${s.port}/${s.protocol}`.padEnd(8, ' ');
    const stateStr = s.state.padEnd(6, ' ');
    const nameStr = s.name.padEnd(13, ' ');
    const versionStr = hasServiceVersion ? s.version : '';
    out += `${portStr} ${stateStr} ${nameStr} ${versionStr}\n`;

    if (hasVulnScript && s.vulns) {
      s.vulns.forEach((v) => {
        out += `|_${v}\n`;
      });
    }
  });

  out += `\nService Info: OS: ${targetHost.os}; CPE: cpe:/o:linux:kernel\n`;
  out += `Nmap done: 1 IP address (1 host up) scanned in 0.88 seconds\n`;
  return out;
};

export const handleNetworkCurl = (
  urlArg: string,
  isHead: boolean
): { stdout: string; stderr: string; exitCode: number } => {
  const host = resolveHostByQuery(urlArg);
  if (!host) {
    return {
      stdout: '',
      stderr: `curl: (7) Failed to connect to ${urlArg} port 80: Connection refused\n`,
      exitCode: 7,
    };
  }

  const urlObj = urlArg.replace(/^https?:\/\/[^/]+/, '');
  const targetPath = urlObj.startsWith('/') ? urlObj : `/${urlObj}`;

  const route = host.httpRoutes?.[targetPath] || host.httpRoutes?.['/'];
  if (!route) {
    const notFound = `<html><head><title>404 Not Found</title></head><body><h1>404 Not Found</h1><p>Resource ${targetPath} not found on ${host.hostname}</p></body></html>\n`;
    if (isHead) {
      return {
        stdout: `HTTP/1.1 404 Not Found\r\nServer: ${host.services[1]?.version || 'nginx'}\r\nContent-Type: text/html\r\nContent-Length: ${notFound.length}\r\n\r\n`,
        stderr: '',
        exitCode: 0,
      };
    }
    return { stdout: notFound, stderr: '', exitCode: 0 };
  }

  if (isHead) {
    return {
      stdout: `HTTP/1.1 ${route.statusCode} OK\r\nServer: ${host.services[1]?.version || 'nginx'}\r\nContent-Type: ${route.contentType}\r\nContent-Length: ${route.body.length}\r\nConnection: keep-alive\r\n\r\n`,
      stderr: '',
      exitCode: 0,
    };
  }

  return { stdout: `${route.body}\n`, stderr: '', exitCode: 0 };
};

export const handleNetworkDig = (domainArg: string): string => {
  const host = resolveHostByQuery(domainArg);
  const domain = domainArg || 'gateway.corp.internal';

  if (!host) {
    return (
      `\n; <<>> DiG 9.18.28-1ubuntu8 <<>> ${domain}\n` +
      `;; Got answer:\n` +
      `;; ->>HEADER<<- opcode: QUERY, status: NXDOMAIN, id: 48201\n` +
      `;; flags: qr aa rd ra; QUERY: 1, ANSWER: 0, AUTHORITY: 0, ADDITIONAL: 1\n\n` +
      `;; QUESTION SECTION:\n;${domain}.\t\tIN\tA\n\n` +
      `;; Query time: 1 msec\n;; SERVER: 10.0.4.1#53(10.0.4.1) (UDP)\n`
    );
  }

  return (
    `\n; <<>> DiG 9.18.28-1ubuntu8 <<>> ${domain}\n` +
    `;; Got answer:\n` +
    `;; ->>HEADER<<- opcode: QUERY, status: NOERROR, id: 31204\n` +
    `;; flags: qr aa rd ra; QUERY: 1, ANSWER: 1, AUTHORITY: 0, ADDITIONAL: 1\n\n` +
    `;; QUESTION SECTION:\n;${domain}.\t\tIN\tA\n\n` +
    `;; ANSWER SECTION:\n${host.hostname}.\t300\tIN\tA\t${host.ip}\n\n` +
    `;; Query time: 0 msec\n;; SERVER: 10.0.4.1#53(10.0.4.1) (UDP)\n;; WHEN: Thu Aug 27 07:20:00 UTC 2026\n;; MSG SIZE  rcvd: 64\n`
  );
};
