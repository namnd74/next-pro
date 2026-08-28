'use client';

import * as React from 'react';
import { Radio, Trophy } from 'lucide-react';
import { MOCK_ARENA_RIVALS, MOCK_LIVE_ACTIVITY_FEED } from '../data/arena-challenges';
import { useArenaStore } from '../store/use-arena-store';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';

export const ArenaLeaderboardStage: React.FC = () => {
  const userState = useArenaStore((s) => s.userState);
  const rivals = MOCK_ARENA_RIVALS;
  const feed = MOCK_LIVE_ACTIVITY_FEED;

  // Calculate user's dynamic rank compared to rivals
  const allParticipants = React.useMemo(() => {
    const userEntry = {
      id: 'current-user',
      rank: 0,
      handle: '@nam_operator (Bạn)',
      avatarText: 'OP',
      avatarBg: 'from-emerald-600 to-teal-400',
      title:
        userState.totalBounty >= 10000
          ? 'Bug Bounty Hunter'
          : userState.totalBounty > 0
            ? 'Script Operator'
            : 'Trainee Operator',
      categorySpecialty: 'Web / API & CVE Exploitation',
      solvedCount: userState.solvedChallengeIds.length,
      firstBloods: userState.firstBloodsCount,
      totalBounty: userState.totalBounty,
      totalXp: userState.totalXp,
      badge: '🏅 Active Operator',
      isCurrentUser: true,
    };

    const combined = [...rivals.map((r) => ({ ...r, isCurrentUser: false })), userEntry];
    combined.sort((a, b) => b.totalBounty - a.totalBounty || b.totalXp - a.totalXp);

    return combined.map((p, idx) => ({ ...p, rank: idx + 1 }));
  }, [userState, rivals]);

  const top1 = rivals[0];
  const top2 = rivals[1];
  const top3 = rivals[2];

  return (
    <div className="space-y-6">
      {/* USER CAREER PROGRESS WIDGETS */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Card className="rounded-2xl border-slate-800 bg-slate-950 p-4 shadow-md">
          <div className="text-[11px] font-bold tracking-wider text-slate-400 uppercase">
            Ví Tiền Thưởng ($ Bounty)
          </div>
          <div className="mt-1 font-mono text-xl font-black text-amber-400">
            ${userState.totalBounty.toLocaleString()}
          </div>
          <div className="mt-0.5 font-mono text-[10px] text-slate-500">
            Tiền thưởng kiếm được
          </div>
        </Card>

        <Card className="rounded-2xl border-slate-800 bg-slate-950 p-4 shadow-md">
          <div className="text-[11px] font-bold tracking-wider text-slate-400 uppercase">
            Tổng Điểm Kinh Nghiệm
          </div>
          <div className="mt-1 font-mono text-xl font-black text-emerald-400">
            {userState.totalXp.toLocaleString()}{' '}
            <span className="text-xs font-normal text-slate-400">XP</span>
          </div>
          <div className="mt-0.5 font-mono text-[10px] text-slate-500">Offensive XP</div>
        </Card>

        <Card className="rounded-2xl border-slate-800 bg-slate-950 p-4 shadow-md">
          <div className="text-[11px] font-bold tracking-wider text-slate-400 uppercase">
            Cờ Đã Chiếm Được
          </div>
          <div className="mt-1 font-mono text-xl font-black text-white">
            {userState.solvedChallengeIds.length}{' '}
            <span className="text-xs font-normal text-slate-400">/ 12</span>
          </div>
          <div className="mt-0.5 font-mono text-[10px] text-slate-500">
            Challenges solved
          </div>
        </Card>

        <Card className="rounded-2xl border-slate-800 bg-slate-950 p-4 shadow-md">
          <div className="text-[11px] font-bold tracking-wider text-slate-400 uppercase">
            Hạng Hiện Tại
          </div>
          <div className="mt-1 font-mono text-xl font-black text-rose-400">
            #{allParticipants.find((p) => p.isCurrentUser)?.rank ?? 6}
          </div>
          <div className="mt-0.5 font-mono text-[10px] text-slate-500">
            Global Benchmark Rank
          </div>
        </Card>
      </div>

      {/* TOP 3 PODIUM */}
      <div className="grid grid-cols-1 gap-4 pt-2 md:grid-cols-3">
        {/* 2ND PLACE */}
        <Card className="relative order-2 space-y-3 rounded-3xl border border-slate-700/80 bg-gradient-to-b from-slate-900 to-slate-950 p-6 text-center shadow-xl md:order-1">
          <div className="text-3xl">🥈</div>
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border-2 border-slate-400 bg-slate-800 text-lg font-bold text-white">
            {top2.avatarText}
          </div>
          <div>
            <h3 className="text-sm font-black text-white">{top2.handle}</h3>
            <div className="font-mono text-xs font-bold text-amber-400">
              ${top2.totalBounty.toLocaleString()} Bounty
            </div>
            <div className="mt-0.5 font-mono text-[10px] text-slate-400">
              {top2.firstBloods} First Bloods · {top2.totalXp} XP
            </div>
          </div>
          <Badge
            variant="outline"
            className="border-slate-700 text-[10px] text-slate-300"
          >
            {top2.title}
          </Badge>
        </Card>

        {/* 1ST PLACE (CHAMPION) */}
        <Card className="relative order-1 space-y-3 rounded-3xl border-2 border-amber-500/80 bg-gradient-to-b from-amber-950/30 via-slate-900 to-slate-950 p-6 text-center shadow-2xl shadow-amber-900/20 md:order-2 md:-translate-y-2">
          <div className="text-4xl">👑</div>
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-tr from-amber-500 to-yellow-300 p-0.5 shadow-lg">
            <div className="flex h-full w-full items-center justify-center rounded-full bg-slate-950 text-xl font-black text-amber-400">
              {top1.avatarText}
            </div>
          </div>
          <div>
            <h3 className="text-base font-black text-white">{top1.handle}</h3>
            <div className="font-mono text-sm font-black text-amber-400">
              ${top1.totalBounty.toLocaleString()} Bounty
            </div>
            <div className="mt-0.5 font-mono text-xs font-bold text-emerald-400">
              ⚡ {top1.firstBloods} First Bloods · {top1.totalXp} XP
            </div>
          </div>
          <Badge className="border-amber-500/40 bg-amber-500/20 text-xs font-black tracking-wider text-amber-300 uppercase">
            {top1.title}
          </Badge>
        </Card>

        {/* 3RD PLACE */}
        <Card className="relative order-3 space-y-3 rounded-3xl border border-slate-700/80 bg-gradient-to-b from-slate-900 to-slate-950 p-6 text-center shadow-xl">
          <div className="text-3xl">🥉</div>
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border-2 border-amber-700 bg-amber-950/40 text-lg font-bold text-amber-500">
            {top3.avatarText}
          </div>
          <div>
            <h3 className="text-sm font-black text-white">{top3.handle}</h3>
            <div className="font-mono text-xs font-bold text-amber-400">
              ${top3.totalBounty.toLocaleString()} Bounty
            </div>
            <div className="mt-0.5 font-mono text-[10px] text-slate-400">
              {top3.firstBloods} First Bloods · {top3.totalXp} XP
            </div>
          </div>
          <Badge
            variant="outline"
            className="border-slate-700 text-[10px] text-slate-300"
          >
            {top3.title}
          </Badge>
        </Card>
      </div>

      {/* GLOBAL BENCHMARK RANKING TABLE */}
      <Card className="space-y-4 rounded-3xl border-slate-800 bg-slate-950 p-5 shadow-2xl">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-amber-400" />
            <h2 className="text-sm font-extrabold tracking-wider text-white uppercase">
              Bảng Tổng Sắp Mùa Giải (Season 1 Benchmark)
            </h2>
          </div>
          <span className="font-mono text-xs text-slate-400">
            Xếp hạng theo Tiền thưởng ($ Bounty) & XP
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left font-mono text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-[11px] text-slate-400">
                <th className="pb-3 pl-3">HẠNG</th>
                <th className="pb-3">OPERATOR / HACKER</th>
                <th className="pb-3">DANH HIỆU</th>
                <th className="pb-3 text-center">CỜ ĐÃ BẮT</th>
                <th className="pb-3 text-center">FIRST BLOODS</th>
                <th className="pb-3 text-right">TIỀN THƯỞNG ($)</th>
                <th className="pr-3 pb-3 text-right">TỔNG XP</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {allParticipants.map((p) => {
                const isUser = p.isCurrentUser;
                return (
                  <tr
                    key={p.id}
                    className={`transition-colors ${
                      isUser
                        ? 'border-y-2 border-emerald-500/60 bg-emerald-950/40 font-bold text-white'
                        : 'text-slate-300 hover:bg-slate-900/50'
                    }`}
                  >
                    <td className="py-3.5 pl-3">
                      {p.rank === 1 ? (
                        <span className="font-black text-amber-400">🥇 1</span>
                      ) : p.rank === 2 ? (
                        <span className="font-bold text-slate-300">🥈 2</span>
                      ) : p.rank === 3 ? (
                        <span className="font-bold text-amber-600">🥉 3</span>
                      ) : (
                        <span
                          className={
                            isUser ? 'font-black text-emerald-400' : 'text-slate-500'
                          }
                        >
                          #{p.rank}
                        </span>
                      )}
                    </td>
                    <td className="flex items-center gap-2 py-3.5">
                      <div
                        className={`flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-tr ${p.avatarBg} text-[10px] font-black text-slate-950`}
                      >
                        {p.avatarText}
                      </div>
                      <span
                        className={isUser ? 'font-black text-emerald-300' : 'text-white'}
                      >
                        {p.handle}
                      </span>
                    </td>
                    <td className="py-3.5 text-[11px] text-slate-400">{p.title}</td>
                    <td className="py-3.5 text-center font-bold">{p.solvedCount}</td>
                    <td className="py-3.5 text-center font-bold text-rose-400">
                      {p.firstBloods > 0 ? `⚡ ${p.firstBloods}` : '—'}
                    </td>
                    <td className="py-3.5 text-right font-black text-amber-400">
                      ${p.totalBounty.toLocaleString()}
                    </td>
                    <td className="py-3.5 pr-3 text-right font-black text-emerald-400">
                      {p.totalXp.toLocaleString()}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

      {/* LIVE ATTACK ACTIVITY FEED */}
      <Card className="space-y-3 rounded-3xl border-slate-800 bg-slate-950 p-5 shadow-xl">
        <div className="flex items-center gap-2 text-xs font-bold tracking-wider text-slate-400 uppercase">
          <Radio className="h-4 w-4 animate-pulse text-emerald-400" />
          Dòng Sự Kiện Khai Thác Gần Đây (Activity Stream)
        </div>
        <div className="space-y-2">
          {feed.map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between rounded-xl border border-slate-800/80 bg-slate-900/60 p-3 text-xs"
            >
              <div className="flex items-center gap-2.5">
                <span className="font-mono font-bold text-emerald-400">
                  {item.rivalHandle}
                </span>
                <span className="text-slate-400">vừa khai thác thành công</span>
                <span className="font-bold text-white">{item.challengeTitle}</span>
                {item.isFirstBlood && (
                  <Badge className="border-rose-500/40 bg-rose-500/20 text-[9px] font-bold text-rose-400">
                    🩸 First Blood
                  </Badge>
                )}
              </div>
              <div className="font-mono font-bold text-amber-400">
                +${item.bountyWon.toLocaleString()}
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};
