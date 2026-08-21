export type NodeType =
  | 'rsc' // React Server Component
  | 'client' // Client Component ('use client')
  | 'suspense' // Streaming Suspense Boundary
  | 'serverAction' // Next.js Server Action / API Route
  | 'cacheStore' // Zustand / TanStack Query Client Cache
  | 'edgeGateway' // Edge Middleware / CDN / Reverse Proxy
  | 'database'; // PostgreSQL / Redis / Microservice

export interface SystemNode {
  id: string;
  type: NodeType;
  title: string;
  description: string;
  x: number;
  y: number;
  metadata?: {
    latencyMs?: number;
    cacheStrategy?:
      'stale-while-revalidate' | 'ssr-dynamic' | 'static-isr' | 'cache-aside';
    isStreaming?: boolean;
    dataVolume?: 'low' | 'medium' | 'high';
  };
}

export interface SystemEdge {
  id: string;
  from: string; // node id
  to: string; // node id
  label?: string;
  protocol?: 'HTTP/JSON' | 'RSC Payload' | 'Server Action' | 'WebSocket' | 'Direct State';
  isAnimated?: boolean;
}

export interface ArchitectureAuditResult {
  score: number; // 0 - 100
  rating: 'Exceptional' | 'Senior Grade' | 'Needs Optimization' | 'High Risk';
  estimatedLatencyMs: number;
  cachingEfficiencyPercent: number;
  waterfallRisk: 'Low' | 'Medium' | 'High';
  findings: Array<{
    id: string;
    type: 'success' | 'warning' | 'error' | 'tip';
    title: string;
    description: string;
    remediation?: string;
  }>;
}

export interface SystemTemplate {
  id: string;
  title: string;
  subtitle: string;
  difficulty: 'Mid' | 'Senior' | 'Staff / Principal';
  description: string;
  tags: string[];
  nodes: SystemNode[];
  edges: SystemEdge[];
}
