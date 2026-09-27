'use client';

import * as React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MermaidViewer } from '../visual';
import type { TopicRoadmapSpec } from '../../types/roadmap';
import { Map, X } from 'lucide-react';

interface RoadmapMindmapModalProps {
  isOpen: boolean;
  onClose: () => void;
  roadmap: TopicRoadmapSpec;
}

export function RoadmapMindmapModal({
  isOpen,
  onClose,
  roadmap,
}: RoadmapMindmapModalProps) {
  if (!isOpen) return null;

  return (
    <div className="animate-in fade-in-50 fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-md">
      <Card className="glass-card max-h-[calc(100dvh-2rem)] w-full max-w-4xl space-y-4 overflow-y-auto p-4 shadow-2xl sm:p-6">
        {/* Modal Header */}
        <div className="border-border/60 flex items-start justify-between border-b pb-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="bg-primary/10 text-primary rounded-lg p-1.5">
                <Map className="h-5 w-5" />
              </div>
              <h3 className="text-foreground text-lg font-bold sm:text-xl">
                Bản Đồ Tư Duy Toàn Cảnh: {roadmap.title}
              </h3>
              <Badge variant="outline" className="text-xs">
                5 Trạm Luyện Thi
              </Badge>
            </div>
            <p className="text-muted-foreground text-xs sm:text-sm">
              {roadmap.tagline}
            </p>
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground h-8 w-8 rounded-lg p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Mindmap Interactive Diagram */}
        <div className="space-y-2">
          <MermaidViewer
            code={roadmap.mindmapCode}
            title={`Sơ Đồ Lộ Trình: ${roadmap.title}`}
            caption="Cấu trúc liên hoàn 5 chặng phát triển năng lực từ Nền tảng tới Thực chiến Big Tech"
          />
        </div>

        {/* Footer info */}
        <div className="border-border/40 bg-muted/40 flex flex-col gap-2 rounded-xl border p-3.5 text-xs sm:flex-row sm:items-center sm:justify-between">
          <span className="text-muted-foreground">
            💡 <strong>Mẹo:</strong> Bấm vào từng trạm trên thanh điều hướng bên ngoài để lọc danh sách câu hỏi tương ứng.
          </span>
          <Button size="sm" onClick={onClose} className="text-xs">
            Đóng Bản Đồ
          </Button>
        </div>
      </Card>
    </div>
  );
}
