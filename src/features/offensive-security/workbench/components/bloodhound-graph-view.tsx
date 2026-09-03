'use client';

import * as React from 'react';
import { Flame, Server, Shield, Target, User, Users, Zap } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

export interface BloodhoundNode {
  id: string;
  label: string;
  type: 'User' | 'Group' | 'Computer' | 'GPO' | 'OU';
  x: number;
  y: number;
  isHighValue?: boolean;
  isOwned?: boolean;
  properties: Record<string, string | number | boolean>;
}

export interface BloodhoundEdge {
  id: string;
  source: string;
  target: string;
  label:
    | 'MemberOf'
    | 'AdminTo'
    | 'GenericAll'
    | 'WriteDacl'
    | 'HasSession'
    | 'Kerberoastable'
    | 'AsRepRoastable';
  isAttackPath?: boolean;
  mitreTechnique?: string;
}

const DEFAULT_NODES: BloodhoundNode[] = [
  {
    id: 'node-jclerk',
    label: 'jclerk@CORP.INTERNAL',
    type: 'User',
    x: 60,
    y: 200,
    isOwned: true,
    properties: {
      sAMAccountName: 'jclerk',
      role: 'Initial Foothold Account (Finance Dept)',
      pwdLastSet: '2026-06-15',
      adminCount: 0,
    },
  },
  {
    id: 'node-helpdesk',
    label: 'Helpdesk (Group)',
    type: 'Group',
    x: 230,
    y: 110,
    properties: {
      sAMAccountName: 'Helpdesk',
      adminCount: 0,
      description: 'First-line support team with local admin delegations',
    },
  },
  {
    id: 'node-svc-backup',
    label: 'svc_backup (User)',
    type: 'User',
    x: 230,
    y: 290,
    properties: {
      sAMAccountName: 'svc_backup',
      userAccountControl: '4194816 (DONT_REQ_PREAUTH)',
      roastable: 'AS-REP Roastable (No Pre-Auth)',
      adminCount: 1,
    },
  },
  {
    id: 'node-server-ops',
    label: 'Server Operators',
    type: 'Group',
    x: 420,
    y: 290,
    isHighValue: true,
    properties: {
      sAMAccountName: 'Server Operators',
      adminCount: 1,
      privilege: 'Can write DC services & backup operator rights',
    },
  },
  {
    id: 'node-svc-sql',
    label: 'svc_sql (User)',
    type: 'User',
    x: 420,
    y: 110,
    properties: {
      sAMAccountName: 'svc_sql',
      spn: 'MSSQLSvc/db01.corp.internal:1433',
      roastable: 'Kerberoastable TGS',
    },
  },
  {
    id: 'node-domain-admins',
    label: 'Domain Admins',
    type: 'Group',
    x: 610,
    y: 180,
    isHighValue: true,
    properties: {
      sAMAccountName: 'Domain Admins',
      adminCount: 1,
      privilege: 'Full Active Directory Enterprise Takeover',
    },
  },
  {
    id: 'node-dc01',
    label: 'DC01.CORP.INTERNAL',
    type: 'Computer',
    x: 770,
    y: 180,
    isHighValue: true,
    properties: {
      dNSHostName: 'dc01.corp.internal',
      role: 'Primary Domain Controller',
      ip: '10.0.4.20',
    },
  },
];

const DEFAULT_EDGES: BloodhoundEdge[] = [
  {
    id: 'e1',
    source: 'node-jclerk',
    target: 'node-helpdesk',
    label: 'MemberOf',
    isAttackPath: false,
    mitreTechnique: 'T1087.002',
  },
  {
    id: 'e2',
    source: 'node-jclerk',
    target: 'node-svc-backup',
    label: 'AsRepRoastable',
    isAttackPath: true,
    mitreTechnique: 'T1558.004',
  },
  {
    id: 'e3',
    source: 'node-svc-backup',
    target: 'node-server-ops',
    label: 'MemberOf',
    isAttackPath: true,
    mitreTechnique: 'T1078.002',
  },
  {
    id: 'e4',
    source: 'node-server-ops',
    target: 'node-domain-admins',
    label: 'GenericAll',
    isAttackPath: true,
    mitreTechnique: 'T1098',
  },
  {
    id: 'e5',
    source: 'node-helpdesk',
    target: 'node-svc-sql',
    label: 'Kerberoastable',
    isAttackPath: false,
    mitreTechnique: 'T1558.003',
  },
  {
    id: 'e6',
    source: 'node-domain-admins',
    target: 'node-dc01',
    label: 'AdminTo',
    isAttackPath: true,
    mitreTechnique: 'T1078.002',
  },
];

export const BloodhoundGraphView: React.FC = () => {
  const [selectedNodeId, setSelectedNodeId] = React.useState<string>('node-jclerk');
  const [highlightAttackPath, setHighlightAttackPath] = React.useState<boolean>(true);

  const selectedNode = React.useMemo(() => {
    return DEFAULT_NODES.find((n) => n.id === selectedNodeId) || DEFAULT_NODES[0]!;
  }, [selectedNodeId]);

  const getNodeColor = (node: BloodhoundNode) => {
    if (node.isOwned)
      return 'border-emerald-500 bg-emerald-950 text-emerald-300 shadow-emerald-500/20';
    if (node.isHighValue)
      return 'border-rose-500 bg-rose-950 text-rose-300 shadow-rose-500/30 ring-1 ring-rose-500/40';
    if (node.type === 'User') return 'border-sky-500 bg-sky-950 text-sky-300';
    if (node.type === 'Group') return 'border-violet-500 bg-violet-950 text-violet-300';
    return 'border-amber-500 bg-amber-950 text-amber-300';
  };

  const getNodeIcon = (type: BloodhoundNode['type']) => {
    switch (type) {
      case 'User':
        return <User className="h-3.5 w-3.5" />;
      case 'Group':
        return <Users className="h-3.5 w-3.5" />;
      case 'Computer':
        return <Server className="h-3.5 w-3.5" />;
      default:
        return <Shield className="h-3.5 w-3.5" />;
    }
  };

  return (
    <div
      data-testid="bloodhound-graph-view"
      className="border-border/80 bg-card flex flex-col space-y-3 rounded-2xl border p-3 shadow-sm sm:p-4"
    >
      {/* Header Bar */}
      <div className="border-border/60 flex flex-wrap items-center justify-between gap-3 border-b pb-3">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg border border-amber-500/30 bg-amber-500/10">
            <Flame className="h-4 w-4 animate-pulse text-amber-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-foreground text-xs font-extrabold tracking-tight sm:text-sm">
                BLOODHOUND ATTACK PATH GRAPH (ACTIVE DIRECTORY)
              </h3>
              <Badge className="border-amber-500/40 bg-amber-500/10 font-mono text-[9px] text-amber-400">
                CORP.INTERNAL
              </Badge>
            </div>
            <p className="text-muted-foreground text-[10.5px]">
              Đồ thị phân tích quyền hạn: Khám phá đường đi ngắn nhất từ tài khoản chiếm
              được tới Domain Admin
            </p>
          </div>
        </div>

        {/* Action Toggle */}
        <Button
          type="button"
          size="sm"
          variant={highlightAttackPath ? 'default' : 'outline'}
          onClick={() => setHighlightAttackPath(!highlightAttackPath)}
          className={`h-7 gap-1.5 px-2.5 font-mono text-xs ${
            highlightAttackPath ? 'bg-amber-600 text-white hover:bg-amber-700' : ''
          }`}
        >
          <Zap className="h-3.5 w-3.5" />
          {highlightAttackPath ? 'ATTACK PATH ACTIVE' : 'HIGHLIGHT SHORTEST PATH'}
        </Button>
      </div>

      {/* Main Interactive Canvas & Inspector Split */}
      <div className="grid min-h-[380px] grid-cols-1 gap-3 lg:grid-cols-12">
        {/* Left: SVG Graph Canvas (8 cols) */}
        <div className="border-border/60 relative flex flex-col overflow-hidden rounded-xl border bg-slate-950 p-2 select-none lg:col-span-8">
          {/* Subtle Grid Background */}
          <div
            className="pointer-events-none absolute inset-0 opacity-15"
            style={{
              backgroundImage: 'radial-gradient(circle, #38bdf8 1px, transparent 1px)',
              backgroundSize: '20px 20px',
            }}
          />

          <div className="relative h-[360px] w-full sm:h-[400px]">
            <svg className="h-full w-full" viewBox="0 0 860 380">
              <defs>
                <marker
                  id="arrow-default"
                  viewBox="0 0 10 10"
                  refX="18"
                  refY="5"
                  markerWidth="6"
                  markerHeight="6"
                  orient="auto-start-reverse"
                >
                  <path d="M 0 1 L 10 5 L 0 9 z" fill="#64748b" />
                </marker>
                <marker
                  id="arrow-attack"
                  viewBox="0 0 10 10"
                  refX="18"
                  refY="5"
                  markerWidth="6"
                  markerHeight="6"
                  orient="auto-start-reverse"
                >
                  <path d="M 0 1 L 10 5 L 0 9 z" fill="#f59e0b" />
                </marker>
              </defs>

              {/* Draw Edges */}
              {DEFAULT_EDGES.map((edge) => {
                const source = DEFAULT_NODES.find((n) => n.id === edge.source)!;
                const target = DEFAULT_NODES.find((n) => n.id === edge.target)!;
                const isHighlighted = highlightAttackPath && edge.isAttackPath;

                const midX = (source.x + target.x) / 2;
                const midY = (source.y + target.y) / 2;

                return (
                  <g key={edge.id}>
                    <line
                      x1={source.x + 50}
                      y1={source.y + 20}
                      x2={target.x + 50}
                      y2={target.y + 20}
                      stroke={isHighlighted ? '#f59e0b' : '#334155'}
                      strokeWidth={isHighlighted ? 2.5 : 1.5}
                      strokeDasharray={isHighlighted ? '5 3' : undefined}
                      className={isHighlighted ? 'animate-pulse' : ''}
                      markerEnd={
                        isHighlighted ? 'url(#arrow-attack)' : 'url(#arrow-default)'
                      }
                    />
                    <rect
                      x={midX + 25}
                      y={midY + 10}
                      width={edge.label.length * 6.5 + 8}
                      height={16}
                      rx={4}
                      fill="#0f172a"
                      stroke={isHighlighted ? '#f59e0b' : '#334155'}
                      strokeWidth={1}
                    />
                    <text
                      x={midX + 29}
                      y={midY + 22}
                      fontSize="9"
                      fontFamily="monospace"
                      fontWeight="bold"
                      fill={isHighlighted ? '#f59e0b' : '#94a3b8'}
                    >
                      {edge.label}
                    </text>
                  </g>
                );
              })}

              {/* Draw Nodes as Interactive ForeignObjects */}
              {DEFAULT_NODES.map((node) => {
                const isSelected = node.id === selectedNodeId;
                const colorClass = getNodeColor(node);

                return (
                  <foreignObject
                    key={node.id}
                    x={node.x}
                    y={node.y}
                    width={110}
                    height={46}
                    className="cursor-pointer overflow-visible"
                    onClick={() => setSelectedNodeId(node.id)}
                  >
                    <div
                      data-testid={`bloodhound-node-${node.id}`}
                      className={`flex flex-col items-center justify-center rounded-xl border p-1.5 text-center shadow-md transition-all duration-200 hover:scale-105 ${colorClass} ${
                        isSelected ? 'ring-2 shadow-amber-500/40 ring-amber-400' : ''
                      }`}
                    >
                      <div className="flex items-center gap-1">
                        {getNodeIcon(node.type)}
                        <span className="max-w-[80px] truncate font-mono text-[9px] font-bold uppercase">
                          {node.type}
                        </span>
                      </div>
                      <div className="max-w-[100px] truncate font-mono text-[9.5px] font-bold">
                        {node.label.split('@')[0]}
                      </div>
                    </div>
                  </foreignObject>
                );
              })}
            </svg>
          </div>
        </div>

        {/* Right: Node & Path Inspector Drawer (4 cols) */}
        <div className="border-border/60 flex flex-col space-y-3 overflow-hidden rounded-xl border bg-slate-950/90 p-3 lg:col-span-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <div className="flex items-center gap-1.5">
              {getNodeIcon(selectedNode.type)}
              <span className="truncate font-mono text-xs font-bold text-slate-200">
                {selectedNode.label}
              </span>
            </div>
            <Badge variant="outline" className="font-mono text-[9px] uppercase">
              {selectedNode.type}
            </Badge>
          </div>

          {/* Node Properties */}
          <div className="space-y-1.5 rounded-lg border border-slate-800 bg-slate-900/60 p-2.5 font-mono text-[11px]">
            <div className="border-b border-slate-800 pb-1 text-[10px] font-bold text-slate-400 uppercase">
              Active Directory Properties
            </div>
            {Object.entries(selectedNode.properties).map(([k, v]) => (
              <div key={k} className="flex justify-between gap-1 text-[10.5px]">
                <span className="text-slate-400 capitalize">{k}:</span>
                <span className="text-right font-bold break-all text-slate-200">
                  {String(v)}
                </span>
              </div>
            ))}
          </div>

          {/* Shortest Path Analysis Explanation */}
          <div className="cyber-scrollbar flex-1 space-y-2 overflow-y-auto overscroll-contain rounded-lg border border-amber-500/30 bg-amber-950/20 p-2.5 font-mono text-xs">
            <div className="flex items-center gap-1 text-[11px] font-bold text-amber-400">
              <Target className="h-3.5 w-3.5" />
              THỰC CHIẾN TẤN CÔNG ĐA CHẶNG:
            </div>
            <ol className="list-inside list-decimal space-y-1 text-[11px] leading-relaxed text-slate-300">
              <li>
                <span className="font-bold text-emerald-400">Chặng 1</span>: Từ tài khoản
                chiếm được <code className="text-sky-300">jclerk</code>, thực hiện AS-REP
                Roasting tài khoản <code className="text-amber-300">svc_backup</code> (do
                cờ DONT_REQ_PREAUTH).
              </li>
              <li>
                <span className="font-bold text-emerald-400">Chặng 2</span>: Crack hash
                Kerberos để chiếm quyền <code className="text-amber-300">svc_backup</code>
                , là thành viên nhóm{' '}
                <code className="text-violet-300">Server Operators</code>.
              </li>
              <li>
                <span className="font-bold text-emerald-400">Chặng 3</span>: Nhóm Server
                Operators có quyền{' '}
                <code className="font-bold text-rose-400">GenericAll</code> đối với{' '}
                <code className="text-rose-400">Domain Admins</code> ➔ Chiếm toàn quyền
                Domain Controller!
              </li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
};
