'use client';

import * as React from 'react';
import {
  Activity,
  Bell,
  Ghost,
  KeyRound,
  LayoutDashboard,
  Package,
  RefreshCw,
  RotateCcw,
  Settings,
  ShieldCheck,
  Skull,
  Trash2,
  Users,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

/**
 * FIRING RANGE · cache-poisoning
 * Đầu độc tầng cache dữ liệu: đổi tab là một cơn bão refetch, query key
 * tĩnh va chạm khiến data admin giao nhầm cho viewer, và mutation thiếu
 * invalidation hồi sinh ghost row từ cõi chết. Bật Defense Mode để thấy
 * staleTime discipline / scoped key / invalidateQueries dập tắt mọi đám cháy.
 */

const TABS = [
  {
    id: 'overview',
    label: 'Tổng quan',
    icon: <LayoutDashboard className="h-3 w-3" />,
    endpoint: '/api/stats',
    queryKey: "['stats']",
  },
  {
    id: 'orders',
    label: 'Đơn hàng',
    icon: <Package className="h-3 w-3" />,
    endpoint: '/api/orders',
    queryKey: "['orders']",
  },
  {
    id: 'notifications',
    label: 'Thông báo',
    icon: <Bell className="h-3 w-3" />,
    endpoint: '/api/notifications',
    queryKey: "['notifications']",
  },
  {
    id: 'settings',
    label: 'Cài đặt',
    icon: <Settings className="h-3 w-3" />,
    endpoint: '/api/settings',
    queryKey: "['settings']",
  },
] as const;

type TabId = (typeof TABS)[number]['id'];

interface ProfilePayload {
  id: string;
  name: string;
  role: string;
  stat: string;
}

const PROFILES: Record<'admin' | 'viewer', ProfilePayload> = {
  admin: {
    id: 'usr_admin',
    name: 'An Nguyễn',
    role: 'Quản trị',
    stat: 'Doanh thu Q3: 1,2 tỷ₫',
  },
  viewer: {
    id: 'usr_viewer',
    name: 'Bình Lê',
    role: 'Người xem',
    stat: 'Điểm thưởng: 240',
  },
};

interface PostRow {
  id: number;
  title: string;
}

const SERVER_POSTS: PostRow[] = [
  { id: 42, title: 'Nhật ký pentest tuần 12' },
  { id: 43, title: 'Hướng dẫn setup VPN nội bộ' },
  { id: 44, title: 'Checklist hardening VPS' },
  { id: 45, title: 'Ghi chú họp — đừng public' },
];

function PatchSwitch({
  on,
  onToggle,
  labelOn,
  labelOff,
}: {
  on: boolean;
  onToggle: () => void;
  labelOn: string;
  labelOff: string;
}) {
  return (
    <Button
      size="sm"
      variant={on ? 'default' : 'outline'}
      onClick={onToggle}
      className="h-7 text-[11px]"
    >
      {on ? <ShieldCheck className="mr-1 h-3 w-3" /> : <Skull className="mr-1 h-3 w-3" />}
      {on ? labelOn : labelOff}
    </Button>
  );
}

export function CachePoisonLab() {
  const [defenseMode, setDefenseMode] = React.useState(false);

  // ── Vector 01 · Refetch Storm ─────────────────────────────────────────
  const [fixStaleTime, setFixStaleTime] = React.useState(false);
  const [activeTab, setActiveTab] = React.useState<TabId>('overview');
  const [netRequests, setNetRequests] = React.useState(0);
  const [fetchesByTab, setFetchesByTab] = React.useState<Record<string, number>>({});
  const [visitedOnce, setVisitedOnce] = React.useState<Partial<Record<TabId, boolean>>>(
    {}
  );
  const [netLog, setNetLog] = React.useState<string[]>([]);

  const switchTab = (tabId: TabId) => {
    setActiveTab(tabId);
    const tab = TABS.find((t) => t.id === tabId) ?? TABS[0];
    const cachedBefore = !!visitedOnce[tabId];

    if (cachedBefore && fixStaleTime) {
      setNetLog((prev) =>
        [
          ...prev,
          `> CACHE HIT ${tab.queryKey} — staleTime 60s còn tươi → 0 request`,
        ].slice(-7)
      );
    } else {
      setNetRequests((n) => n + 1);
      setFetchesByTab((prev) => ({ ...prev, [tabId]: (prev[tabId] ?? 0) + 1 }));
      setNetLog((prev) =>
        [
          ...prev,
          `$ GET ${tab.endpoint} … ${cachedBefore ? '(staleTime=0 → cache ALWAYS stale)' : '(cold start)'}`,
        ].slice(-7)
      );
    }
    setVisitedOnce((prev) => ({ ...prev, [tabId]: true }));
  };

  const resetStormDemo = () => {
    setActiveTab('overview');
    setNetRequests(0);
    setFetchesByTab({});
    setVisitedOnce({ overview: true });
    setNetLog(['$ cache cleared…']);
  };

  const stormExploited = Object.values(fetchesByTab).some((n) => n >= 2);

  // ── Vector 02 · Query Key Collision ───────────────────────────────────
  const [fixScopedKey, setFixScopedKey] = React.useState(false);
  // Mô phỏng QueryClient cache: key-string → payload
  const [profileCache, setProfileCache] = React.useState<Record<string, ProfilePayload>>(
    {}
  );
  const [shown, setShown] = React.useState<
    Record<'admin' | 'viewer', ProfilePayload | null>
  >({
    admin: null,
    viewer: null,
  });
  const [colLog, setColLog] = React.useState<string[]>([]);

  const openWidget = (who: 'admin' | 'viewer') => {
    const me = PROFILES[who];
    const keyStr = fixScopedKey ? `['user','${me.id}']` : "['user']";
    const hit = profileCache[keyStr];

    if (hit) {
      setShown((prev) => ({ ...prev, [who]: hit }));
      setColLog((prev) =>
        [
          ...prev,
          `> CACHE HIT ${keyStr} → widget ${who} nhận data của “${hit.name}”`,
        ].slice(-6)
      );
      return;
    }
    setProfileCache((prev) => ({ ...prev, [keyStr]: me }));
    setShown((prev) => ({ ...prev, [who]: me }));
    setColLog((prev) =>
      [...prev, `$ GET /api/profile (${who}) → SET ${keyStr}`].slice(-6)
    );
  };

  const resetCollisionDemo = () => {
    setProfileCache({});
    setShown({ admin: null, viewer: null });
    setColLog(['$ queryClient.clear()…']);
  };

  const toggleFixScopedKey = () => {
    setFixScopedKey((v) => !v);
    setProfileCache({});
    setShown({ admin: null, viewer: null });
    setColLog(['🛡️ key factory mới — cache reset']);
  };

  const collisionExploited =
    (shown.admin !== null && shown.admin.id !== PROFILES.admin.id) ||
    (shown.viewer !== null && shown.viewer.id !== PROFILES.viewer.id);

  // ── Vector 03 · Ghost Row Resurrection ────────────────────────────────
  const [fixInvalidate, setFixInvalidate] = React.useState(false);
  const [deletedIds, setDeletedIds] = React.useState<number[]>([]);
  const [viewRows, setViewRows] = React.useState<PostRow[]>(SERVER_POSTS); // bản trong cache client
  const [ghostLog, setGhostLog] = React.useState<string[]>([]);

  const deleteRow = (row: PostRow) => {
    const alreadyDeleted = deletedIds.includes(row.id);
    setDeletedIds((prev) => (alreadyDeleted ? prev : [...prev, row.id]));
    setViewRows((prev) => prev.filter((r) => r.id !== row.id));
    setGhostLog((prev) =>
      [
        ...prev,
        alreadyDeleted
          ? `$ DELETE /api/posts/${row.id} → 404 Not Found 😱 (xoá rồi mà vẫn hiện!)`
          : `$ DELETE /api/posts/${row.id} → 200 OK · optimistic: row biến mất khỏi UI`,
      ].slice(-6)
    );
  };

  const refetchList = () => {
    if (fixInvalidate) {
      // ✅ onSuccess đã invalidateQueries → refetch lấy sự thật từ server
      setViewRows(SERVER_POSTS.filter((r) => !deletedIds.includes(r.id)));
      setGhostLog((prev) =>
        [
          ...prev,
          `> onSuccess → invalidateQueries(['posts']) → refetch lấy list SẠCH từ server${deletedIds.length > 0 ? ' · ghost bị khai trừ vĩnh viễn' : ''}`,
        ].slice(-6)
      );
      return;
    }
    // ❌ cache không hề biết có mutation — merge với bản cũ → hồn ma sống dậy
    const resurrected = SERVER_POSTS.filter((r) => deletedIds.includes(r.id));
    if (resurrected.length === 0) {
      setGhostLog((prev) =>
        [...prev, '> refetch — chưa xoá gì nên list nguyên vẹn'].slice(-6)
      );
      return;
    }
    setViewRows((prev) => {
      const ids = new Set(prev.map((p) => p.id));
      return [...prev, ...resurrected.filter((r) => !ids.has(r.id))];
    });
    setGhostLog((prev) =>
      [
        ...prev,
        `> CACHE HIT ['posts'] — bản cũ chưa invalidate → ${resurrected.length} ghost row HỒI SINH 👻`,
      ].slice(-6)
    );
  };

  const resetGhostDemo = () => {
    setDeletedIds([]);
    setViewRows(SERVER_POSTS);
    setGhostLog(['$ danh sách được tải lại từ đầu…']);
  };

  const ghostExploited = viewRows.some((r) => deletedIds.includes(r.id));

  // Master toggle đồng bộ toàn bộ mini-switch
  React.useEffect(() => {
    setFixStaleTime(defenseMode);
    setFixScopedKey(defenseMode);
    setFixInvalidate(defenseMode);
    if (defenseMode) {
      setProfileCache({});
      setShown({ admin: null, viewer: null });
      setViewRows(SERVER_POSTS.filter((r) => !deletedIds.includes(r.id)));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [defenseMode]);

  const allFound = stormExploited && collisionExploited && ghostExploited;

  return (
    <div className="space-y-4">
      {/* Control bar */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          {defenseMode ? (
            <Badge variant="success" className="gap-1 text-[10px]">
              <ShieldCheck className="h-3 w-3" />
              DEFENSE ON
            </Badge>
          ) : (
            <Badge variant="destructive" className="gap-1 text-[10px]">
              <Skull className="h-3 w-3" />
              ATTACK MODE
            </Badge>
          )}
          <span className="text-muted-foreground font-mono text-[10px] tracking-wider uppercase">
            đầu độc{' '}
            {[stormExploited, collisionExploited, ghostExploited].filter(Boolean).length}
            /3 vector
          </span>
        </div>
        <div className="flex gap-2">
          <Button
            size="sm"
            variant={defenseMode ? 'ghost' : 'destructive'}
            onClick={() => setDefenseMode(false)}
            className="h-7 text-[11px]"
          >
            <Skull className="mr-1 h-3 w-3" />
            Config mặc định
          </Button>
          <Button
            size="sm"
            variant={defenseMode ? 'default' : 'ghost'}
            onClick={() => setDefenseMode(true)}
            className="h-7 text-[11px]"
          >
            <ShieldCheck className="mr-1 h-3 w-3" />
            Bản vá
          </Button>
        </div>
      </div>

      {/* ── Sim 01 · Refetch storm ── */}
      <Card className="glass-card space-y-3 p-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="bg-secondary text-muted-foreground flex h-7 w-7 shrink-0 items-center justify-center rounded-lg">
              <Activity className="h-3.5 w-3.5" />
            </span>
            <div>
              <p className="text-foreground text-xs font-bold">01 · Refetch Storm</p>
              <p className="text-muted-foreground text-[10px]">
                Lưu ý mỗi tab rồi quay lại — đếm request bay ra khi staleTime=0.
              </p>
            </div>
          </div>
          <PatchSwitch
            on={fixStaleTime}
            onToggle={() => setFixStaleTime((v) => !v)}
            labelOn="Vá: staleTime 60s"
            labelOff="Bật vá: staleTime 60s"
          />
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-950 p-3 font-mono text-[11px]">
          <div className="flex flex-wrap gap-1.5">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => switchTab(tab.id)}
                className={`inline-flex items-center gap-1 rounded-md px-2 py-1 transition-colors ${
                  activeTab === tab.id
                    ? 'bg-sky-500/20 text-sky-300'
                    : 'text-slate-400 hover:bg-slate-800'
                }`}
              >
                {tab.icon}
                {tab.label}
                {(fetchesByTab[tab.id] ?? 0) > 1 && (
                  <span className="text-red-400">×{fetchesByTab[tab.id]}</span>
                )}
              </button>
            ))}
            <Button
              size="sm"
              variant="ghost"
              onClick={resetStormDemo}
              className="ml-auto h-6 text-[11px]"
            >
              <RotateCcw className="mr-1 h-3 w-3" />
              Reset
            </Button>
          </div>

          <div className="mt-2 flex flex-wrap items-center gap-2">
            <Badge
              variant={netRequests >= 4 ? 'destructive' : 'secondary'}
              className="font-mono"
            >
              Network requests: {netRequests}
            </Badge>
            {stormExploited && !fixStaleTime && (
              <span className="animate-pulse text-red-400">
                ⚡ bão refetch — alt-tab vài lần là gateway trả 429
              </span>
            )}
            {fixStaleTime && netRequests > 0 && (
              <span className="text-emerald-400">
                ✅ quay lại tab đã xem = CACHE HIT, 0 request
              </span>
            )}
          </div>

          <div className="mt-2 min-h-[52px] space-y-0.5 rounded-md bg-black/40 p-2 leading-relaxed">
            {netLog.length === 0 ? (
              <span className="text-slate-600">$ network idle…</span>
            ) : (
              netLog.map((line, i) => (
                <div
                  key={`${i}-${line}`}
                  className={
                    line.startsWith('$') && line.includes('GET')
                      ? 'text-amber-300'
                      : line.startsWith('>')
                        ? 'text-emerald-400'
                        : 'text-slate-500'
                  }
                >
                  {line}
                </div>
              ))
            )}
          </div>
        </div>
      </Card>

      {/* ── Sim 02 · Key collision ── */}
      <Card className="glass-card space-y-3 p-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="bg-secondary text-muted-foreground flex h-7 w-7 shrink-0 items-center justify-center rounded-lg">
              <Users className="h-3.5 w-3.5" />
            </span>
            <div>
              <p className="text-foreground text-xs font-bold">
                02 · Query Key Collision
              </p>
              <p className="text-muted-foreground text-[10px]">
                Mở widget Admin → Viewer → quay lại Admin để xem cache giao nhầm data.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <PatchSwitch
              on={fixScopedKey}
              onToggle={toggleFixScopedKey}
              labelOn={"Vá: ['user', id]"}
              labelOff={"Bật vá: ['user', id]"}
            />
            <Button
              size="sm"
              variant="ghost"
              onClick={resetCollisionDemo}
              className="h-6 text-[10px]"
            >
              <RotateCcw className="mr-1 h-3 w-3" />
              Reset
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          {(['admin', 'viewer'] as const).map((who) => {
            const me = PROFILES[who];
            const shownData = shown[who];
            const mismatched = shownData !== null && shownData.id !== me.id;
            return (
              <div
                key={who}
                className={`rounded-xl border p-3 font-mono text-[11px] ${
                  mismatched
                    ? 'border-destructive/50 bg-red-500/5'
                    : 'border-slate-800 bg-slate-950'
                }`}
              >
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-slate-400">
                    Widget {who === 'admin' ? 'Admin 👑' : 'Viewer 👤'}
                  </span>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => openWidget(who)}
                    className="h-6 px-2 text-[10px]"
                  >
                    Mount
                  </Button>
                </div>
                {!shownData ? (
                  <p className="text-slate-600">$ useQuery chưa mount…</p>
                ) : (
                  <>
                    <p className="text-foreground text-sm font-bold">{shownData.name}</p>
                    <p className="text-slate-400">{shownData.role}</p>
                    <p className={mismatched ? 'text-red-400' : 'text-emerald-400'}>
                      {shownData.stat}
                    </p>
                    {mismatched ? (
                      <p className="mt-1 text-red-400">
                        ⚠️ SAI NGỮ CẢNH — đang hiện data của “{shownData.name}” cho user “
                        {me.name}”!
                      </p>
                    ) : (
                      <p className="mt-1 text-emerald-400">✅ đúng chủ nhân của data.</p>
                    )}
                  </>
                )}
              </div>
            );
          })}
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-950 p-3 font-mono text-[11px] leading-relaxed">
          <div className="flex items-center gap-1.5 text-slate-500">
            <KeyRound className="h-3 w-3" />
            QueryCache inspector
          </div>
          {Object.keys(profileCache).length === 0 ? (
            <div className="text-slate-600">$ cache trống…</div>
          ) : (
            Object.entries(profileCache).map(([k, v]) => (
              <div key={k} className="text-slate-300">
                {k} <span className="text-slate-500">→</span>{' '}
                <span
                  className={v.role === 'Quản trị' ? 'text-red-400' : 'text-emerald-400'}
                >
                  {v.name} ({v.role})
                </span>
              </div>
            ))
          )}
          <div className="mt-1 min-h-[36px] space-y-0.5 rounded-md bg-black/40 p-2">
            {colLog.length === 0 ? (
              <span className="text-slate-600">$ chờ mount…</span>
            ) : (
              colLog.map((line, i) => (
                <div
                  key={`${i}-${line}`}
                  className={line.startsWith('$') ? 'text-amber-300' : 'text-sky-300'}
                >
                  {line}
                </div>
              ))
            )}
          </div>
        </div>
        {collisionExploited && (
          <p className="text-destructive text-[11px] leading-relaxed">
            {`🎯 Key tĩnh ['user'] là MỘT ngăn kéo duy nhất — ai mount sau chiếm kho, ai quay lại sau ăn data của người khác. Không một request trái phép nào xuất hiện trong audit log.`}
          </p>
        )}
      </Card>

      {/* ── Sim 03 · Ghost rows ── */}
      <Card className="glass-card space-y-3 p-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="bg-secondary text-muted-foreground flex h-7 w-7 shrink-0 items-center justify-center rounded-lg">
              <Ghost className="h-3.5 w-3.5" />
            </span>
            <div>
              <p className="text-foreground text-xs font-bold">
                03 · Ghost Row Resurrection
              </p>
              <p className="text-muted-foreground text-[10px]">
                Xoá một dòng rồi bấm Refetch — xem nó hồi sinh thế nào khi mutation quên
                invalidate.
              </p>
            </div>
          </div>
          <PatchSwitch
            on={fixInvalidate}
            onToggle={() => setFixInvalidate((v) => !v)}
            labelOn="Vá: invalidateQueries onSuccess"
            labelOff="Bật vá: invalidateQueries onSuccess"
          />
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-950 p-3 font-mono text-[11px]">
          <div className="flex items-center justify-between">
            <span className="text-slate-500">{"useQuery(['posts']) · /api/posts"}</span>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={refetchList}
                className="h-6 text-[10px]"
              >
                <RefreshCw className="mr-1 h-3 w-3" />
                Refetch
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={resetGhostDemo}
                className="h-6 text-[10px]"
              >
                <RotateCcw className="mr-1 h-3 w-3" />
                Reset
              </Button>
            </div>
          </div>
          <div className="mt-2 space-y-1">
            {viewRows.length === 0 && (
              <p className="text-slate-600">
                (list trống — server cũng xác nhận hết đã xoá)
              </p>
            )}
            {viewRows.map((row) => {
              const isGhost = deletedIds.includes(row.id);
              return (
                <div
                  key={row.id}
                  className={`flex items-center justify-between rounded-md border px-2 py-1 ${
                    isGhost
                      ? 'border-destructive/50 bg-destructive/10'
                      : 'border-slate-800 bg-slate-900/40'
                  }`}
                >
                  <span className={isGhost ? 'text-red-300' : 'text-slate-300'}>
                    #{row.id} {row.title} {isGhost && '👻 HỒN MA (server đã xoá)'}
                  </span>
                  <button
                    type="button"
                    onClick={() => deleteRow(row)}
                    title="Xoá dòng này"
                    className="hover:bg-destructive/15 hover:text-destructive rounded p-1 text-slate-500 transition-colors"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              );
            })}
          </div>
          <div className="mt-2 min-h-[52px] space-y-0.5 rounded-md bg-black/40 p-2 leading-relaxed">
            {ghostLog.length === 0 ? (
              <span className="text-slate-600">$ chờ thao tác…</span>
            ) : (
              ghostLog.map((line, i) => (
                <div
                  key={`${i}-${line}`}
                  className={
                    line.startsWith('CRITICAL')
                      ? 'text-red-400'
                      : line.includes('404')
                        ? 'text-red-400'
                        : line.includes('👻')
                          ? 'text-red-300'
                          : line.startsWith('$')
                            ? 'text-amber-300'
                            : 'text-emerald-400'
                  }
                >
                  {line}
                </div>
              ))
            )}
          </div>
        </div>
      </Card>

      {/* Finding report */}
      <div className="space-y-2">
        {[
          {
            id: 'storm',
            icon: <Activity className="h-3.5 w-3.5" />,
            label: 'Stale Cache Ambush · Refetch Storm',
            found: stormExploited,
            patched: fixStaleTime,
            foundText:
              'ĐÃ XÁC NHẬN LỘ: staleTime=0 biến mỗi cú đổi tab thành dội pháo GET — p95 và hóa đơn autoscaler cùng bay màu.',
            idleText: 'Đổi qua lại giữa các tab khi chưa bật vá.',
          },
          {
            id: 'collision',
            icon: <Users className="h-3.5 w-3.5" />,
            label: 'Query Key Collision',
            found: collisionExploited,
            patched: fixScopedKey,
            foundText:
              'ĐÃ XÁC NHẬN LỘ: dữ liệu quản trị giao nhầm cho widget viewer — “kẻ tấn công” chính là cache của app.',
            idleText: 'Mount Admin rồi Viewer (hoặc ngược lại) khi key còn tĩnh.',
          },
          {
            id: 'ghost',
            icon: <Ghost className="h-3.5 w-3.5" />,
            label: 'Ghost Row Resurrection',
            found: ghostExploited,
            patched: fixInvalidate,
            foundText:
              'ĐÃ XÁC NHẬN LỘ: row đã DELETE 200 OK sống dậy từ cache cũ — user xoá lần nữa thì ăn ngay 404.',
            idleText: 'Xoá một dòng rồi bấm Refetch khi chưa bật vá.',
          },
        ].map((finding) => (
          <Card
            key={finding.id}
            className={`glass-card flex items-start gap-3 p-3 ${
              finding.found && !finding.patched
                ? 'border-destructive/30'
                : finding.patched
                  ? 'border-emerald-500/20'
                  : ''
            }`}
          >
            <span
              className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg ${
                finding.found && !finding.patched
                  ? 'bg-destructive/10 text-destructive'
                  : finding.patched
                    ? 'bg-emerald-500/10 text-emerald-500'
                    : 'bg-secondary text-muted-foreground'
              }`}
            >
              {finding.found && !finding.patched ? (
                <Skull className="h-3.5 w-3.5" />
              ) : (
                finding.icon
              )}
            </span>
            <div className="min-w-0 space-y-0.5">
              <p className="text-foreground text-xs font-bold">{finding.label}</p>
              {finding.found && !finding.patched && (
                <p className="text-destructive text-[11px] leading-relaxed">
                  {finding.foundText}
                </p>
              )}
              {finding.patched && (
                <p className="text-[11px] leading-relaxed text-emerald-600 dark:text-emerald-400">
                  Đã vá: staleTime theo SLA dữ liệu / key chứa đủ ngữ cảnh /
                  invalidateQueries đúng chỗ trong onSuccess — cache hết cách nói dối.
                </p>
              )}
              {!finding.found && !finding.patched && (
                <p className="text-muted-foreground text-[11px] leading-relaxed">
                  {finding.idleText}
                </p>
              )}
            </div>
          </Card>
        ))}
      </div>

      {/* Verdict */}
      {(allFound || defenseMode) && (
        <Card
          className={`glass-card p-4 ${
            allFound && !defenseMode ? 'border-destructive/30' : 'border-emerald-500/30'
          }`}
        >
          {allFound && !defenseMode ? (
            <p className="text-foreground text-xs leading-relaxed">
              💀 <span className="font-bold">Blast Radius:</span> tầng cache vừa tự DoS
              mình bằng bão refetch, vừa rò dữ liệu admin sang tài khoản thường mà audit
              log vẫn sạch bong, vừa hồi sinh dữ liệu đã xoá vi phạm right-to-erasure. Ba
              sự cố production, không một dòng code độc nào cần thiết.
            </p>
          ) : (
            <p className="text-foreground text-xs leading-relaxed">
              🛡️{' '}
              <span className="font-bold text-emerald-600 dark:text-emerald-400">
                Defense Patch:
              </span>{' '}
              staleTime đặt theo độ nhạy cảm dữ liệu, mọi biến số ảnh hưởng kết quả nằm
              trong query key (key factory), và mutation nào thay đổi server thì
              invalidate đúng key đó ngay trong onSuccess. Cache trở thành nguồn phản ánh
              trung thực của server.
            </p>
          )}
        </Card>
      )}
    </div>
  );
}
