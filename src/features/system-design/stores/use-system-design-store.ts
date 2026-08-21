import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { SystemNode, SystemEdge, NodeType, ArchitectureAuditResult } from '../types';
import { SYSTEM_TEMPLATES } from '../data/system-templates';

interface SystemDesignState {
  nodes: SystemNode[];
  edges: SystemEdge[];
  selectedNodeId: string | null;
  activeTemplateId: string | null;
  isConnectingFrom: string | null;
  auditResult: ArchitectureAuditResult | null;
  isMounted: boolean;

  // Actions
  setMounted: () => void;
  addNode: (type: NodeType, x?: number, y?: number, customTitle?: string) => void;
  updateNodePosition: (id: string, x: number, y: number) => void;
  removeNode: (id: string) => void;
  addEdge: (from: string, to: string) => void;
  removeEdge: (id: string) => void;
  selectNode: (id: string | null) => void;
  setConnectingFrom: (nodeId: string | null) => void;
  loadTemplate: (templateId: string) => void;
  clearCanvas: () => void;
  runAudit: () => ArchitectureAuditResult;
  exportDiagramJson: () => string;
  importDiagramJson: (json: string) => boolean;
}

const DEFAULT_NODE_CONFIGS: Record<NodeType, { title: string; desc: string }> = {
  rsc: { title: 'Server Component (RSC)', desc: 'Zero bundle cost server-rendered tree' },
  client: {
    title: 'Client Leaf Component',
    desc: "'use client' interactive state boundary",
  },
  suspense: {
    title: 'Streaming Suspense',
    desc: 'Non-blocking async streaming skeleton',
  },
  serverAction: { title: 'Server Action', desc: 'Secure asynchronous RPC mutation' },
  cacheStore: {
    title: 'Zustand / Query Cache',
    desc: 'Client memory caching & offline state',
  },
  edgeGateway: {
    title: 'Edge CDN / Gateway',
    desc: 'Ultra-low latency edge cache & proxy',
  },
  database: { title: 'Database / Storage', desc: 'ACID transactional data persistence' },
};

function performArchitectureAudit(
  nodes: SystemNode[],
  edges: SystemEdge[]
): ArchitectureAuditResult {
  const findings: ArchitectureAuditResult['findings'] = [];
  let score = 100;

  const nodeTypes = new Set(nodes.map((n) => n.type));
  const hasRsc = nodeTypes.has('rsc');
  const hasClient = nodeTypes.has('client');
  const hasSuspense = nodeTypes.has('suspense');
  const hasEdge = nodeTypes.has('edgeGateway');
  const hasServerAction = nodeTypes.has('serverAction');

  // Check 1: Client/Server Boundary
  if (hasClient && !hasRsc) {
    score -= 15;
    findings.push({
      id: 'f-1',
      type: 'warning',
      title: 'Monolithic Client Component Usage',
      description:
        'Entire tree runs on client. Consider introducing Server Components (RSC) to minimize JS bundle size.',
      remediation:
        'Wrap leaf interactivity inside small client components while keeping layout and data fetching in RSC.',
    });
  } else if (hasRsc && hasClient) {
    findings.push({
      id: 'f-2',
      type: 'success',
      title: 'Optimal Server/Client Separation',
      description:
        'Clean boundary between RSC data providers and client interactive leaves.',
    });
  }

  // Check 2: Async Streaming Suspense
  if (hasRsc && !hasSuspense) {
    score -= 10;
    findings.push({
      id: 'f-3',
      type: 'warning',
      title: 'Missing Streaming Suspense Boundaries',
      description:
        'Slow server database queries might block the entire page initial HTML rendering.',
      remediation:
        'Wrap slow async subtrees in <Suspense fallback={<Skeleton />}> to stream UI progressively.',
    });
  } else if (hasSuspense) {
    findings.push({
      id: 'f-4',
      type: 'success',
      title: 'Progressive Streaming Enabled',
      description:
        'Suspense boundaries prevent slow async data dependencies from stalling TTFB.',
    });
  }

  // Check 3: Edge Caching
  if (!hasEdge && nodes.length > 3) {
    score -= 10;
    findings.push({
      id: 'f-5',
      type: 'tip',
      title: 'Edge CDN Optimization Potential',
      description:
        'Static assets and ISR payloads could benefit from an Edge Gateway/CDN to bring TTFB < 20ms.',
      remediation: 'Place an Edge CDN in front of public read-heavy routes.',
    });
  }

  // Check 4: Direct Client to Database Anti-Pattern
  const directDbEdge = edges.find((e) => {
    const fromNode = nodes.find((n) => n.id === e.from);
    const toNode = nodes.find((n) => n.id === e.to);
    return fromNode?.type === 'client' && toNode?.type === 'database';
  });

  if (directDbEdge) {
    score -= 35;
    findings.push({
      id: 'f-6',
      type: 'error',
      title: 'Critical Security Hazard: Direct Client-to-DB Connection',
      description:
        'Client components must never connect directly to database connections or expose credentials.',
      remediation:
        'Route mutations through Server Actions or Next.js API Route Handlers with validation.',
    });
  }

  // Check 5: Server Action for Mutations
  if (hasServerAction) {
    findings.push({
      id: 'f-7',
      type: 'success',
      title: 'Type-Safe Server Action RPC',
      description:
        'Mutations use direct Next.js Server Actions with built-in CSRF protection and closure encapsulation.',
    });
  }

  const normalizedScore = Math.max(10, Math.min(100, score));
  let rating: ArchitectureAuditResult['rating'] = 'Exceptional';
  if (normalizedScore < 50) rating = 'High Risk';
  else if (normalizedScore < 75) rating = 'Needs Optimization';
  else if (normalizedScore < 90) rating = 'Senior Grade';

  const estimatedLatency = hasEdge ? (hasSuspense ? 24 : 48) : 85;
  const cachingEfficiency = hasEdge ? (nodeTypes.has('cacheStore') ? 92 : 78) : 52;
  const waterfallRisk =
    !hasSuspense && nodes.length > 4 ? 'High' : hasSuspense ? 'Low' : 'Medium';

  return {
    score: normalizedScore,
    rating,
    estimatedLatencyMs: estimatedLatency,
    cachingEfficiencyPercent: cachingEfficiency,
    waterfallRisk,
    findings,
  };
}

export const useSystemDesignStore = create<SystemDesignState>()(
  persist(
    (set, get) => ({
      nodes: SYSTEM_TEMPLATES[0].nodes,
      edges: SYSTEM_TEMPLATES[0].edges,
      selectedNodeId: null,
      activeTemplateId: SYSTEM_TEMPLATES[0].id,
      isConnectingFrom: null,
      auditResult: null,
      isMounted: false,

      setMounted: () => {
        set({ isMounted: true });
        // Initial audit
        const audit = performArchitectureAudit(get().nodes, get().edges);
        set({ auditResult: audit });
      },

      addNode: (type, customX, customY, customTitle) => {
        const config = DEFAULT_NODE_CONFIGS[type];
        const newNode: SystemNode = {
          id: `node-${Date.now()}`,
          type,
          title: customTitle || config.title,
          description: config.desc,
          x: customX ?? Math.floor(Math.random() * 400 + 150),
          y: customY ?? Math.floor(Math.random() * 250 + 100),
          metadata: {
            latencyMs: type === 'edgeGateway' ? 15 : type === 'database' ? 30 : 20,
          },
        };

        const updatedNodes = [...get().nodes, newNode];
        const audit = performArchitectureAudit(updatedNodes, get().edges);
        set({ nodes: updatedNodes, selectedNodeId: newNode.id, auditResult: audit });
      },

      updateNodePosition: (id, x, y) => {
        set((state) => ({
          nodes: state.nodes.map((n) => (n.id === id ? { ...n, x, y } : n)),
        }));
      },

      removeNode: (id) => {
        const filteredNodes = get().nodes.filter((n) => n.id !== id);
        const filteredEdges = get().edges.filter((e) => e.from !== id && e.to !== id);
        const audit = performArchitectureAudit(filteredNodes, filteredEdges);
        set({
          nodes: filteredNodes,
          edges: filteredEdges,
          selectedNodeId: get().selectedNodeId === id ? null : get().selectedNodeId,
          auditResult: audit,
        });
      },

      addEdge: (from, to) => {
        if (from === to) return;
        const exists = get().edges.some((e) => e.from === from && e.to === to);
        if (exists) return;

        const fromNode = get().nodes.find((n) => n.id === from);
        const toNode = get().nodes.find((n) => n.id === to);
        let protocol: SystemEdge['protocol'] = 'HTTP/JSON';

        if (fromNode?.type === 'rsc' && toNode?.type === 'client')
          protocol = 'RSC Payload';
        else if (toNode?.type === 'serverAction') protocol = 'Server Action';
        else if (fromNode?.type === 'client' && toNode?.type === 'cacheStore')
          protocol = 'Direct State';

        const newEdge: SystemEdge = {
          id: `e-${Date.now()}`,
          from,
          to,
          protocol,
          isAnimated: true,
        };

        const updatedEdges = [...get().edges, newEdge];
        const audit = performArchitectureAudit(get().nodes, updatedEdges);
        set({ edges: updatedEdges, isConnectingFrom: null, auditResult: audit });
      },

      removeEdge: (id) => {
        const updatedEdges = get().edges.filter((e) => e.id !== id);
        const audit = performArchitectureAudit(get().nodes, updatedEdges);
        set({ edges: updatedEdges, auditResult: audit });
      },

      selectNode: (id) => set({ selectedNodeId: id }),

      setConnectingFrom: (nodeId) => set({ isConnectingFrom: nodeId }),

      loadTemplate: (templateId) => {
        const template = SYSTEM_TEMPLATES.find((t) => t.id === templateId);
        if (!template) return;

        const audit = performArchitectureAudit(template.nodes, template.edges);
        set({
          nodes: template.nodes,
          edges: template.edges,
          activeTemplateId: template.id,
          selectedNodeId: null,
          isConnectingFrom: null,
          auditResult: audit,
        });
      },

      clearCanvas: () => {
        set({
          nodes: [],
          edges: [],
          selectedNodeId: null,
          activeTemplateId: null,
          isConnectingFrom: null,
          auditResult: performArchitectureAudit([], []),
        });
      },

      runAudit: () => {
        const audit = performArchitectureAudit(get().nodes, get().edges);
        set({ auditResult: audit });
        return audit;
      },

      exportDiagramJson: () => {
        return JSON.stringify({ nodes: get().nodes, edges: get().edges }, null, 2);
      },

      importDiagramJson: (json) => {
        try {
          const parsed = JSON.parse(json);
          if (Array.isArray(parsed.nodes) && Array.isArray(parsed.edges)) {
            const audit = performArchitectureAudit(parsed.nodes, parsed.edges);
            set({
              nodes: parsed.nodes,
              edges: parsed.edges,
              selectedNodeId: null,
              activeTemplateId: null,
              auditResult: audit,
            });
            return true;
          }
          return false;
        } catch {
          return false;
        }
      },
    }),
    {
      name: 'nextpro-system-design-state',
      partialize: (state) => ({
        nodes: state.nodes,
        edges: state.edges,
        activeTemplateId: state.activeTemplateId,
      }),
    }
  )
);
