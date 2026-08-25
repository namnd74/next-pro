'use client';

import { Braces, FlaskConical, Layers3, PlayCircle, Route, Sparkles } from 'lucide-react';
import { PressureEvalLab } from './pressure-eval-lab';
import { ProgressiveDisclosureLab } from './progressive-disclosure-lab';
import { SkillRoutingLab } from './skill-routing-lab';
import { SkillRuntimeLab } from './skill-runtime-lab';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export function AgentSkillsStudio() {
  return (
    <Card className="via-background relative overflow-hidden border-violet-500/25 bg-gradient-to-br from-violet-500/8 to-cyan-500/8 p-4 sm:p-6">
      <div className="pointer-events-none absolute -top-24 -right-20 h-64 w-64 rounded-full bg-violet-500/15 blur-3xl" />
      <div className="relative space-y-5">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-start">
          <div className="flex items-start gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-fuchsia-500 text-white shadow-lg shadow-violet-500/20">
              <FlaskConical className="h-5 w-5" aria-hidden="true" />
            </div>
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-foreground text-lg font-extrabold tracking-tight sm:text-xl">
                  Agent Skills Studio
                </h2>
                <Badge variant="success" className="gap-1">
                  <Sparkles className="h-3 w-3" aria-hidden="true" />
                  Interactive
                </Badge>
              </div>
              <p className="text-muted-foreground max-w-2xl text-xs leading-relaxed sm:text-sm">
                Thay đổi skill contract, quan sát context được nạp và pressure-test
                behavior. Mọi phép tính chạy trong trình duyệt, không gửi prompt ra ngoài.
              </p>
            </div>
          </div>

          <div className="border-border/60 bg-background/70 flex shrink-0 items-center gap-2 rounded-xl border px-3 py-2 font-mono text-[10px]">
            <Braces className="h-3.5 w-3.5 text-violet-500" aria-hidden="true" />
            static-export safe
          </div>
        </div>

        <Tabs defaultValue="runtime">
          <TabsList className="grid h-auto w-full grid-cols-1 gap-1 sm:grid-cols-2 xl:grid-cols-4">
            <TabsTrigger value="runtime" className="cursor-pointer gap-2 py-2.5">
              <PlayCircle className="h-3.5 w-3.5" aria-hidden="true" />
              1. Runtime Flow
            </TabsTrigger>
            <TabsTrigger value="routing" className="cursor-pointer gap-2 py-2.5">
              <Route className="h-3.5 w-3.5" aria-hidden="true" />
              2. Routing Lab
            </TabsTrigger>
            <TabsTrigger value="disclosure" className="cursor-pointer gap-2 py-2.5">
              <Layers3 className="h-3.5 w-3.5" aria-hidden="true" />
              3. Disclosure
            </TabsTrigger>
            <TabsTrigger value="pressure" className="cursor-pointer gap-2 py-2.5">
              <FlaskConical className="h-3.5 w-3.5" aria-hidden="true" />
              4. Pressure Eval
            </TabsTrigger>
          </TabsList>

          <TabsContent value="runtime">
            <SkillRuntimeLab />
          </TabsContent>
          <TabsContent value="routing">
            <SkillRoutingLab />
          </TabsContent>
          <TabsContent value="disclosure">
            <ProgressiveDisclosureLab />
          </TabsContent>
          <TabsContent value="pressure">
            <PressureEvalLab />
          </TabsContent>
        </Tabs>
      </div>
    </Card>
  );
}
