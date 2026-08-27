import type { HttpRequestState, HttpResponseState, PacketHeaderInfo } from '../types';

export function createDefaultHttpRequest(): HttpRequestState {
  return {
    method: 'GET',
    url: '/api/v1/user/profile?id=1001',
    headers: [
      { key: 'Host', value: 'api.corp.internal' },
      {
        key: 'Authorization',
        value:
          'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMDAxIiwidXNlcm5hbWUiOiJndWVzdCIsInJvbGUiOiJ2aWV3ZXIifQ.mockSig',
      },
      { key: 'User-Agent', value: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)' },
      { key: 'Accept', value: 'application/json' },
    ],
    rawHeaders:
      'Host: api.corp.internal\n' +
      'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMDAxIiwidXNlcm5hbWUiOiJndWVzdCIsInJvbGUiOiJ2aWV3ZXIifQ.mockSig\n' +
      'User-Agent: Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)\n' +
      'Accept: application/json',
    body: '',
  };
}

export function parseRawHeaders(raw: string): Record<string, string> {
  const headers: Record<string, string> = {};
  const lines = raw.split('\n');
  for (const line of lines) {
    const idx = line.indexOf(':');
    if (idx !== -1) {
      const k = line.substring(0, idx).trim().toLowerCase();
      const v = line.substring(idx + 1).trim();
      headers[k] = v;
    }
  }
  return headers;
}

export function executeHttpRequest(req: HttpRequestState): HttpResponseState {
  const startTime = performance.now();
  const headers = parseRawHeaders(req.rawHeaders);
  const urlObj = new URL(req.url, 'http://api.corp.internal');
  const pathname = urlObj.pathname;
  const searchParams = urlObj.searchParams;

  // Endpoint 1: IDOR in user profile /api/v1/user/profile
  if (pathname === '/api/v1/user/profile') {
    const requestedId = searchParams.get('id');
    const authHeader = headers['authorization'] || '';

    if (!authHeader.startsWith('Bearer ')) {
      return {
        statusCode: 401,
        statusText: 'Unauthorized',
        headers: {
          'Content-Type': 'application/json',
          'WWW-Authenticate': 'Bearer error="invalid_token"',
        },
        body: JSON.stringify(
          { error: 'Missing or malformed Authorization header' },
          null,
          2
        ),
        contentType: 'application/json',
        durationMs: performance.now() - startTime,
      };
    }

    if (requestedId === '1' || requestedId === '0') {
      // IDOR triggered: Guest accesses root/admin profile!
      return {
        statusCode: 200,
        statusText: 'OK',
        headers: {
          'Content-Type': 'application/json',
          'X-Security-Notice': 'UNRESTRICTED_ACCESS_DETECTED',
        },
        body: JSON.stringify(
          {
            id: 1,
            username: 'administrator',
            role: 'enterprise_admin',
            email: 'admin@corp.internal',
            mfa_enabled: true,
            api_key: 'sec_live_98f7a6e5d4c3b2a1009988',
            internal_ip: '10.0.4.1',
            last_login: '2026-08-27T08:14:22Z',
          },
          null,
          2
        ),
        contentType: 'application/json',
        durationMs: performance.now() - startTime,
      };
    }

    // Normal profile
    return {
      statusCode: 200,
      statusText: 'OK',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(
        {
          id: 1001,
          username: 'guest_user',
          role: 'viewer',
          email: 'guest@public.net',
          mfa_enabled: false,
        },
        null,
        2
      ),
      contentType: 'application/json',
      durationMs: performance.now() - startTime,
    };
  }

  // Endpoint 2: Admin Gateway with Header Spoofing /api/v1/admin/debug
  if (pathname.startsWith('/api/v1/admin')) {
    const xff = headers['x-forwarded-for'] || headers['x-real-ip'];
    const isAdminIp = xff === '127.0.0.1' || xff === 'localhost';

    if (isAdminIp) {
      return {
        statusCode: 200,
        statusText: 'OK',
        headers: {
          'Content-Type': 'application/json',
          'X-Bypass-Header': 'X-Forwarded-For 127.0.0.1 Accepted',
        },
        body: JSON.stringify(
          {
            status: 'SYSTEM_DEBUG_MODE_ACTIVE',
            active_sessions: 42,
            master_encryption_seed:
              'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
            environment_vars: {
              DATABASE_URL: 'postgres://admin:MasterPass2026!@10.0.4.5:5432/corp_main',
              REDIS_URL: 'redis://:CacheSecret88@10.0.4.6:6379',
            },
          },
          null,
          2
        ),
        contentType: 'application/json',
        durationMs: performance.now() - startTime,
      };
    }

    return {
      statusCode: 403,
      statusText: 'Forbidden',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(
        {
          error:
            'Access denied. Administrative endpoints are only accessible from 127.0.0.1',
        },
        null,
        2
      ),
      contentType: 'application/json',
      durationMs: performance.now() - startTime,
    };
  }

  // Default fallback
  return {
    statusCode: 200,
    statusText: 'OK',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(
      { message: 'Request processed', method: req.method, path: pathname },
      null,
      2
    ),
    contentType: 'application/json',
    durationMs: performance.now() - startTime,
  };
}

export function decodePacketHeaders(req: HttpRequestState): PacketHeaderInfo[] {
  return [
    {
      layer: 'Ethernet',
      title: 'Layer 2: Ethernet Frame (IEEE 802.3)',
      fields: [
        {
          name: 'Destination MAC',
          value: '52:54:00:12:34:56',
          description: 'Default Gateway Gateway-Router-01',
          hex: '52 54 00 12 34 56',
        },
        {
          name: 'Source MAC',
          value: '00:16:3e:aa:bb:cc',
          description: 'Operator Workstation NIC',
          hex: '00 16 3e aa bb cc',
        },
        {
          name: 'EtherType',
          value: '0x0800 (IPv4)',
          description: 'Payload protocol is IPv4',
          hex: '08 00',
        },
      ],
    },
    {
      layer: 'IPv4',
      title: 'Layer 3: Internet Protocol Version 4',
      fields: [
        {
          name: 'Version & IHL',
          value: 'IPv4, Header Length: 20 bytes',
          description: 'Version 4, standard 5 32-bit words',
          hex: '45',
        },
        {
          name: 'Total Length',
          value: `${40 + req.rawHeaders.length + req.body.length} bytes`,
          description: 'IP header + TCP header + Data',
        },
        {
          name: 'TTL (Time to Live)',
          value: '64 hops',
          description: 'Standard Linux kernel default',
        },
        {
          name: 'Protocol',
          value: '6 (TCP)',
          description: 'Next layer protocol is Transmission Control Protocol',
        },
        { name: 'Source IP', value: '10.0.4.15', description: 'Local client interface' },
        {
          name: 'Destination IP',
          value: '10.0.4.1',
          description: 'Target API gateway service',
        },
      ],
    },
    {
      layer: 'TCP',
      title: 'Layer 4: Transmission Control Protocol',
      fields: [
        { name: 'Source Port', value: '54322', description: 'Ephemeral client port' },
        {
          name: 'Destination Port',
          value: '443 (HTTPS/HTTP)',
          description: 'Standard Web Application port',
        },
        {
          name: 'Sequence Number',
          value: '0x3F89A120',
          description: 'Client TCP byte sequence position',
        },
        {
          name: 'Acknowledgment',
          value: '0x8192C3D4',
          description: 'Acknowledged received sequence from server',
        },
        {
          name: 'Flags',
          value: '[PSH, ACK]',
          description: 'Push data immediately, ACK preceding segment',
        },
        {
          name: 'Window Size',
          value: '65535',
          description: 'Flow control receive buffer window',
        },
      ],
    },
    {
      layer: 'Application',
      title: `Layer 7: HTTP/1.1 (${req.method})`,
      fields: [
        {
          name: 'Request Line',
          value: `${req.method} ${req.url} HTTP/1.1`,
          description: 'HTTP RFC Request specification',
        },
        {
          name: 'Header Count',
          value: `${req.rawHeaders.split('\n').filter(Boolean).length} headers`,
          description: 'Custom & standard HTTP headers',
        },
        {
          name: 'Payload Size',
          value: `${req.body.length} bytes`,
          description: 'Entity Body payload size',
        },
      ],
    },
  ];
}
