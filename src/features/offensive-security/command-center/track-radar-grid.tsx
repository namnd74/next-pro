'use client';

import * as React from 'react';
import Link from 'next/link';
import { ArrowUpRight, Filter, Layers, Terminal } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ACADEMY_TRACKS } from '../academy/academy-tracks';
import { ACADEMY_MODULES } from '../academy/academy-loader';

type TrackFilterCategory =
  'all' | 'foundation' | 'pentest-web' | 'enterprise' | 'advanced';

const CATEGORY_TABS: Array<{ id: TrackFilterCategory; label: string }> = [
  { id: 'all', label: 'Tất cả (19 Tracks)' },
  { id: 'foundation', label: 'Hạ Tầng & Nền Tảng (OS00 - OS04)' },
  { id: 'pentest-web', label: 'Kiểm Thử & Web API (OS05 - OS07)' },
  { id: 'enterprise', label: 'Doanh Nghiệp & AD (OS08 - OS12)' },
  { id: 'advanced', label: 'Nghiên Cứu & Dị Biệt (OS13 - OS18)' },
];

export const TrackRadarGrid: React.FC = () => {
  const [activeCategory, setActiveCategory] = React.useState<TrackFilterCategory>('all');

  const filteredTracks = React.useMemo(() => {
    return ACADEMY_TRACKS.filter((track) => {
      const id = track.id;
      if (activeCategory === 'all') return true;
      if (activeCategory === 'foundation') {
        return (
          id.startsWith('os00-') ||
          id.startsWith('os01-') ||
          id.startsWith('os02-') ||
          id.startsWith('os03-') ||
          id.startsWith('os04-')
        );
      }
      if (activeCategory === 'pentest-web') {
        return id.startsWith('os05-') || id.startsWith('os06-') || id.startsWith('os07-');
      }
      if (activeCategory === 'enterprise') {
        return (
          id.startsWith('os08-') ||
          id.startsWith('os09-') ||
          id.startsWith('os10-') ||
          id.startsWith('os11-') ||
          id.startsWith('os12-')
        );
      }
      if (activeCategory === 'advanced') {
        return (
          id.startsWith('os13-') ||
          id.startsWith('os14-') ||
          id.startsWith('os15-') ||
          id.startsWith('os16-') ||
          id.startsWith('os17-') ||
          id.startsWith('os18-')
        );
      }
      return true;
    });
  }, [activeCategory]);

  return (
    <div className="space-y-6">
      {/* Category Filter Pills */}
      <div className="border-border/60 flex flex-wrap items-center justify-between gap-3 border-b pb-4">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-emerald-400" />
          <h3 className="text-foreground text-sm font-bold">
            Bộ Lọc Phân Hệ Tác Chiến ({filteredTracks.length} tracks):
          </h3>
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          {CATEGORY_TABS.map((tab) => {
            const isActive = activeCategory === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveCategory(tab.id)}
                className={`rounded-xl px-3 py-1.5 text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-500/20'
                    : 'border-border/60 bg-secondary/30 text-muted-foreground hover:bg-secondary/60 hover:text-foreground border'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* 19 Tracks Grid Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filteredTracks.map((track) => {
          const trackIndex = track.id.split('-')[0]?.toUpperCase() || 'OS';
          const modulesInTrack = ACADEMY_MODULES.filter((m) => m.trackId === track.id);
          const hasActiveModules = modulesInTrack.length > 0;
          const totalLessons = modulesInTrack.reduce(
            (sum, m) => sum + m.lessons.length,
            0
          );

          return (
            <Card
              key={track.id}
              className={`group relative overflow-hidden rounded-2xl border transition-all duration-300 hover:shadow-xl ${
                hasActiveModules
                  ? 'via-card to-card border-emerald-500/30 bg-gradient-to-b from-emerald-950/20 hover:border-emerald-500/60'
                  : 'border-border/60 bg-card/60 hover:border-slate-700'
              }`}
            >
              <div className="flex h-full flex-col justify-between space-y-4 p-5">
                {/* Header: Track code & Status badge */}
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-extrabold tracking-wider text-emerald-400">
                    {trackIndex}
                  </span>
                  {hasActiveModules ? (
                    <Badge className="gap-1 border-emerald-500/40 bg-emerald-500/10 text-[10px] text-emerald-400">
                      <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />
                      READY TO DEPLOY
                    </Badge>
                  ) : (
                    <Badge
                      variant="outline"
                      className="border-border/60 text-muted-foreground text-[10px]"
                    >
                      BLUEPRINT MAPPED
                    </Badge>
                  )}
                </div>

                {/* Track Title */}
                <div>
                  <h4 className="text-foreground text-base font-bold transition-colors group-hover:text-emerald-400">
                    {track.title}
                  </h4>
                  <p className="text-muted-foreground mt-1.5 line-clamp-2 text-xs leading-relaxed">
                    {hasActiveModules
                      ? `Phân hệ bao gồm ${modulesInTrack.length} module nghiệp vụ với ${totalLessons} bài học thực hành tương tác trực tiếp trên trình duyệt.`
                      : 'Lộ trình chuyên sâu đã được chuẩn hóa trong Curriculum Manifest theo chuẩn MITRE ATT&CK & NIST NICE.'}
                  </p>
                </div>

                {/* Bottom stats & Launch link */}
                <div className="border-border/40 flex items-center justify-between border-t pt-2">
                  <div className="text-muted-foreground flex items-center gap-3 font-mono text-[11px]">
                    <span className="flex items-center gap-1">
                      <Layers className="h-3 w-3 text-slate-400" />
                      {hasActiveModules
                        ? `${modulesInTrack.length} Modules`
                        : 'Manifest Spec'}
                    </span>
                    {hasActiveModules && (
                      <span className="flex items-center gap-1 font-semibold text-emerald-500">
                        <Terminal className="h-3 w-3" />
                        {totalLessons} Labs
                      </span>
                    )}
                  </div>

                  <Link href="/offensive-security/academy">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 gap-1 px-2 text-xs font-bold text-emerald-400 group-hover:bg-emerald-500/10"
                    >
                      <span>{hasActiveModules ? 'Vào Học' : 'Khảo Sát'}</span>
                      <ArrowUpRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                    </Button>
                  </Link>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
};
