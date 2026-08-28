'use client';

import * as React from 'react';
import {
  Activity,
  Database,
  Globe,
  Radio,
  Server,
  Shield,
  ShieldAlert,
  Skull,
  Terminal,
} from 'lucide-react';
import type { CyberRangeHost, HostCompromiseStatus } from '../types';
import { ENTERPRISE_CYBER_RANGE_SUBNET } from '../engines/virtual-network-engine';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface CyberRangeTopologyMapProps {
  hosts?: Record<string, CyberRangeHost>;
  activeHostId?: string;
  onSelectHost?: (host: CyberRangeHost) => void;
  onRunNmapScan?: (targetIp: string) => void;
}

export const CyberRangeTopologyMap: React.FC<CyberRangeTopologyMapProps> = ({
  activeHostId = '10.0.4.10',
  onSelectHost,
  onRunNmapScan,
}) => {
  const [selectedHostIp, setSelectedHostIp] = React.useState<string>(activeHostId);

  // Fallback host dataset if not injected
  const hostList = Object.values(ENTERPRISE_CYBER_RANGE_SUBNET);
  const selectedHost = ENTERPRISE_CYBER_RANGE_SUBNET[selectedHostIp] || hostList[1];

  const getStatusBadge = (status: HostCompromiseStatus = 'scanned') => {
    switch (status) {
      case 'compromised':
        return (
          <Badge className="shrink-0 animate-pulse gap-1 border-rose-500/40 bg-rose-950/80 px-1.5 py-0.5 text-[9.5px] text-rose-300">
            <Skull className="h-2.5 w-2.5 text-rose-400" />
            ROOT
          </Badge>
        );
      case 'foothold':
        return (
          <Badge className="shrink-0 gap-1 border-amber-500/40 bg-amber-950/80 px-1.5 py-0.5 text-[9.5px] text-amber-300">
            <ShieldAlert className="h-2.5 w-2.5 text-amber-400" />
            USER
          </Badge>
        );
      case 'scanned':
        return (
          <Badge className="shrink-0 gap-1 border-cyan-500/40 bg-cyan-950/80 px-1.5 py-0.5 text-[9.5px] text-cyan-300">
            <Radio className="h-2.5 w-2.5 text-cyan-400" />
            ACTIVE
          </Badge>
        );
      default:
        return (
          <Badge
            variant="outline"
            className="shrink-0 px-1.5 py-0.5 text-[9.5px] text-slate-400"
          >
            ONLINE
          </Badge>
        );
    }
  };

  const getNodeIcon = (role: string) => {
    if (role.includes('Domain Controller') || role.includes('Active Directory')) {
      return <Shield className="h-3.5 w-3.5 shrink-0 text-violet-400" />;
    }
    if (role.includes('Database')) {
      return <Database className="h-3.5 w-3.5 shrink-0 text-amber-400" />;
    }
    if (role.includes('Gateway')) {
      return <Globe className="h-3.5 w-3.5 shrink-0 text-emerald-400" />;
    }
    return <Server className="h-3.5 w-3.5 shrink-0 text-cyan-400" />;
  };

  return (
    <div className="space-y-4 overflow-hidden rounded-2xl border border-slate-800 bg-slate-950 p-4 shadow-2xl ring-1 ring-slate-800">
      {/* Header Bar */}
      <div className="flex flex-col gap-2 border-b border-slate-800/80 pb-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <Activity className="h-4 w-4 animate-pulse text-cyan-400" />
          <span className="font-mono text-xs font-bold text-slate-200">
            CYBER RANGE TOPOLOGY · DMZ SUBNET (10.0.4.0/24)
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Badge
            variant="outline"
            className="border-emerald-500/40 bg-emerald-950/40 font-mono text-[10px] text-emerald-400"
          >
            6 ACTIVE TARGETS
          </Badge>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => onRunNmapScan?.('10.0.4.0/24')}
            className="h-6 gap-1 px-2 text-[10px] text-cyan-400 hover:text-white"
          >
            <Radio className="h-3 w-3" />
            Scan Subnet (nmap)
          </Button>
        </div>
      </div>

      {/* Grid of Network Nodes */}
      <div className="grid grid-cols-1 gap-3.5 md:grid-cols-2 xl:grid-cols-3">
        {hostList.map((host) => {
          const isSelected = host.ip === selectedHostIp;
          const openPorts = host.services.filter((s) => s.state === 'open');

          return (
            <div
              key={host.ip}
              onClick={() => {
                setSelectedHostIp(host.ip);
                onSelectHost?.(host as unknown as CyberRangeHost);
              }}
              className={`group cursor-pointer overflow-hidden rounded-xl border p-3.5 transition-all ${
                isSelected
                  ? 'border-cyan-500/80 bg-cyan-950/30 shadow-lg ring-1 shadow-cyan-950/50 ring-cyan-500/40'
                  : 'border-slate-800/90 bg-slate-900/60 hover:border-slate-700 hover:bg-slate-900'
              }`}
            >
              {/* Host Card Top Row: Icon + Title on Left, Status Badge on Right */}
              <div className="flex items-center justify-between gap-2">
                <div className="flex min-w-0 flex-1 items-center gap-2">
                  <div className="shrink-0 rounded-lg border border-slate-700 bg-slate-800 p-1.5">
                    {getNodeIcon(host.role)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div
                      className="truncate font-mono text-xs font-bold text-slate-200 transition-colors group-hover:text-cyan-300"
                      title={host.hostname}
                    >
                      {host.hostname}
                    </div>
                    <div className="font-mono text-[10px] text-slate-400">{host.ip}</div>
                  </div>
                </div>

                {getStatusBadge('scanned')}
              </div>

              {/* Role description */}
              <div
                className="mt-2.5 truncate text-[11px] text-slate-400"
                title={host.role}
              >
                {host.role}
              </div>

              {/* Discovered Ports Tags */}
              <div className="mt-2.5 flex flex-wrap items-center gap-1">
                {openPorts.slice(0, 4).map((srv) => (
                  <span
                    key={srv.port}
                    className="rounded border border-slate-700/60 bg-slate-800/80 px-1.5 py-0.5 font-mono text-[9.5px] text-cyan-400"
                  >
                    {srv.port}/{srv.name}
                  </span>
                ))}
                {openPorts.length > 4 && (
                  <span className="font-mono text-[9px] text-slate-500">
                    +{openPorts.length - 4} ports
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Selected Host Inspector Drawer */}
      {selectedHost && (
        <div className="space-y-3 rounded-xl border border-slate-800 bg-slate-900/90 p-3.5">
          <div className="flex flex-col gap-2 border-b border-slate-800/60 pb-2 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-bold text-cyan-300">
                TARGET INSPECTOR: {selectedHost.hostname} ({selectedHost.ip})
              </span>
              <span className="font-mono text-[10px] text-slate-500">
                MAC: {selectedHost.mac}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <Button
                size="sm"
                onClick={() => onRunNmapScan?.(selectedHost.ip)}
                className="h-6 gap-1 bg-cyan-700 px-2.5 font-mono text-[10px] text-white hover:bg-cyan-600"
              >
                <Terminal className="h-3 w-3" />
                nmap {selectedHost.ip}
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 text-xs md:grid-cols-2">
            {/* System Info */}
            <div className="space-y-1.5 font-mono text-[11px] text-slate-300">
              <div>
                <span className="text-slate-500">Hệ điều hành:</span> {selectedHost.os}
              </div>
              <div>
                <span className="text-slate-500">Vai trò mạng:</span> {selectedHost.role}
              </div>
              <div>
                <span className="text-slate-500">Cổng dịch vụ:</span>{' '}
                {selectedHost.services.map((s) => `${s.port} (${s.name})`).join(', ')}
              </div>
            </div>

            {/* Service details */}
            <div className="space-y-1 text-[10.5px] text-slate-400">
              <div className="mb-1 text-[11px] font-bold text-slate-300">
                Dịch vụ Phát hiện:
              </div>
              {selectedHost.services.map((s) => (
                <div key={s.port} className="flex items-center justify-between font-mono">
                  <span className="text-cyan-400">
                    {s.port}/{s.protocol} - {s.name}
                  </span>
                  <span className="text-[10px] text-slate-400">{s.version}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
