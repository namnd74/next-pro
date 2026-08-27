import type { HttpRequestState, HttpResponseState, PacketHeaderInfo } from '../types';

export const createDefaultHttpRequest = (): HttpRequestState => ({
  method: 'GET',
  url: '/api/v1/user/profile?id=3',
  headers: [
    { key: 'Host', value: 'api.corp.internal' },
    { key: 'User-Agent', value: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' },
    { key: 'Accept', value: 'application/json' },
    { key: 'Authorization', value: 'Bearer token_user_3_operator' },
  ],
  rawHeaders:
    'Host: api.corp.internal\n' +
    'User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64)\n' +
    'Accept: application/json\n' +
    'Authorization: Bearer token_user_3_operator',
  body: '',
});

export const parseRawHeaders = (raw: string): Array<{ key: string; value: string }> => {
  const lines = raw.split('\n').filter(Boolean);
  const result: Array<{ key: string; value: string }> = [];

  for (const line of lines) {
    const colonIdx = line.indexOf(':');
    if (colonIdx > 0) {
      result.push({
        key: line.substring(0, colonIdx).trim(),
        value: line.substring(colonIdx + 1).trim(),
      });
    }
  }

  return result;
};

export const executeHttpRequest = (req: HttpRequestState): HttpResponseState => {
  const startTime = Date.now();
  const url = req.url.toLowerCase();
  const headersMap: Record<string, string> = {};

  req.headers.forEach((h) => {
    headersMap[h.key.toLowerCase()] = h.value;
  });

  // Check Header Spoofing for Admin Bypass: X-Forwarded-For: 127.0.0.1
  const xForwardedFor = headersMap['x-forwarded-for'];
  const isLocalOrigin = xForwardedFor === '127.0.0.1' || xForwardedFor === 'localhost';

  // Endpoint 1: Admin Debug & Intranet Portal
  if (url.includes('/admin/debug') || url.includes('/internal/gateway')) {
    if (isLocalOrigin) {
      return {
        statusCode: 200,
        statusText: 'OK',
        headers: {
          'Content-Type': 'application/json',
          'X-Origin-Verification': 'BYPASS_ACCEPTED_LOCAL_IP',
          Server: 'nginx/1.24.0',
        },
        body: JSON.stringify(
          {
            status: 'success',
            mode: 'SYSTEM_DEBUG_MODE_ACTIVE',
            intranet_gateway: '10.0.4.1',
            system_secrets: {
              JWT_SIGNING_KEY: 'sk_live_enterprise_master_98124',
              DATABASE_URL: 'postgres://admin:super_secret@db.corp.internal:5432/core_db',
            },
          },
          null,
          2
        ),
        contentType: 'application/json',
        durationMs: Date.now() - startTime + 12,
      };
    }

    return {
      statusCode: 403,
      statusText: 'Forbidden',
      headers: {
        'Content-Type': 'application/json',
        'X-Security-Policy': 'BlockExternalAccess',
      },
      body: JSON.stringify(
        {
          error:
            'Access Denied: /admin/debug is restricted to 127.0.0.1 intranet clients only.',
          client_ip: '192.168.1.105',
          hint: 'Verify reverse proxy upstream headers (X-Forwarded-For).',
        },
        null,
        2
      ),
      contentType: 'application/json',
      durationMs: Date.now() - startTime + 8,
    };
  }

  // Endpoint 2: IDOR on User Profile (/api/v1/user/profile?id=X or /api/v1/users/X)
  const idMatch = url.match(/id=([0-9]+)/) || url.match(/\/users\/([0-9]+)/);
  if (url.includes('/profile') || url.includes('/user')) {
    const targetId = idMatch ? parseInt(idMatch[1], 10) : 3;

    if (targetId === 1) {
      // Admin IDOR exploit success
      return {
        statusCode: 200,
        statusText: 'OK',
        headers: {
          'Content-Type': 'application/json',
          'X-Data-Classification': 'RESTRICTED',
        },
        body: JSON.stringify(
          {
            user_id: 1,
            username: 'admin',
            role: 'administrator',
            email: 'admin@corp.internal',
            mfa_enabled: true,
            api_key: 'adm_key_live_9981243761928',
            notes: 'Production root administrator account.',
          },
          null,
          2
        ),
        contentType: 'application/json',
        durationMs: Date.now() - startTime + 15,
      };
    }

    if (targetId === 2) {
      return {
        statusCode: 200,
        statusText: 'OK',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(
          {
            user_id: 2,
            username: 'security_auditor',
            role: 'auditor',
            email: 'auditor@corp.internal',
          },
          null,
          2
        ),
        contentType: 'application/json',
        durationMs: Date.now() - startTime + 10,
      };
    }

    // Default targetId = 3 (Operator self)
    return {
      statusCode: 200,
      statusText: 'OK',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(
        {
          user_id: 3,
          username: 'operator',
          role: 'operator',
          email: 'operator@corp.internal',
          notes: 'Standard operator user session.',
        },
        null,
        2
      ),
      contentType: 'application/json',
      durationMs: Date.now() - startTime + 9,
    };
  }

  // Fallback 404
  return {
    statusCode: 404,
    statusText: 'Not Found',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(
      { error: `Endpoint "${req.url}" not found on target server.` },
      null,
      2
    ),
    contentType: 'application/json',
    durationMs: Date.now() - startTime + 5,
  };
};

export const decodePacketLayers = (req: HttpRequestState): PacketHeaderInfo[] => [
  {
    layer: 'Ethernet',
    title: 'Layer 2: Data Link (Ethernet II Frame)',
    fields: [
      {
        name: 'Destination MAC',
        value: '52:54:00:12:34:56',
        description: 'Default Gateway Interface',
      },
      {
        name: 'Source MAC',
        value: '00:16:3e:aa:bb:cc',
        description: 'Operator Workstation NIC',
      },
      {
        name: 'EtherType',
        value: '0x0800 (IPv4)',
        description: 'Encapsulated Network Layer Protocol',
      },
    ],
  },
  {
    layer: 'IPv4',
    title: 'Layer 3: Network (Internet Protocol Version 4)',
    fields: [
      {
        name: 'Source IP',
        value: '10.0.4.15',
        description: 'Client IP on Internal Subnet',
      },
      { name: 'Destination IP', value: '10.0.4.1', description: 'Target Web API Server' },
      {
        name: 'TTL (Time to Live)',
        value: '64',
        description: 'Hop limit counter before discard',
      },
      { name: 'Protocol', value: '6 (TCP)', description: 'Transport Layer Protocol' },
      { name: 'Header Length', value: '20 bytes', description: 'Standard IPv4 Header' },
    ],
  },
  {
    layer: 'TCP',
    title: 'Layer 4: Transport (Transmission Control Protocol)',
    fields: [
      {
        name: 'Source Port',
        value: '54128',
        description: 'Ephemeral Dynamic Client Port',
      },
      {
        name: 'Destination Port',
        value: '80 (HTTP) / 443 (HTTPS)',
        description: 'Standard Web Port',
      },
      {
        name: 'Flags',
        value: '[PSH, ACK]',
        description: 'Push Data and Acknowledgment Active',
      },
      { name: 'Sequence Number', value: '381928401', description: 'Byte Stream Tracker' },
      {
        name: 'Window Size',
        value: '65535',
        description: 'Flow Control Buffer Capacity',
      },
    ],
  },
  {
    layer: 'Application',
    title: 'Layer 7: Application (HTTP/1.1 Request Payload)',
    fields: [
      {
        name: 'Request Line',
        value: `${req.method} ${req.url} HTTP/1.1`,
        description: 'Method and URI Target',
      },
      {
        name: 'Headers Count',
        value: `${req.headers.length} headers`,
        description: 'Metadata and Auth parameters',
      },
      {
        name: 'Body Length',
        value: `${req.body.length} bytes`,
        description: 'Request payload data length',
      },
    ],
  },
];
