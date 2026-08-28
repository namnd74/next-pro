'use client';

import * as React from 'react';
import {
  Binary,
  BookOpen,
  FileCode,
  Globe,
  Search,
  Terminal as TerminalIcon,
} from 'lucide-react';
import { ARENA_CHALLENGES } from '../data/arena-challenges';
import { useArenaStore } from '../store/use-arena-store';
import { HttpRepeaterStage } from './http-repeater-stage';
import { PatchDiffStage } from './patch-diff-stage';
import { MemoryHexStage } from './memory-hex-stage';
import { ArenaTerminalStage } from './arena-terminal-stage';
import { ArenaLeaderboardStage } from './arena-leaderboard-stage';
import { ArenaWriteupModal } from './arena-writeup-modal';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  playRootCompromisedChime,
  playSonarPing,
} from '../../workbench/engines/cyber-audio-engine';

export const ArenaDashboard: React.FC = () => {
  const [mainView, setMainView] = React.useState<'arena' | 'leaderboard'>('arena');
  const [inputFlag, setInputFlag] = React.useState('');
  const [submissionFeedback, setSubmissionFeedback] = React.useState<{
    isSuccess: boolean;
    message: string;
  } | null>(null);

  const {
    selectedChallengeId,
    activeTool,
    selectedCategory,
    selectedSeverity,
    searchQuery,
    userState,
    activeWriteupModalChallengeId,
    selectChallenge,
    setActiveTool,
    setCategory,
    setSearchQuery,
    submitFlag,
    openWriteupModal,
    closeWriteupModal,
  } = useArenaStore();

  const currentChallenge =
    ARENA_CHALLENGES.find((c) => c.id === selectedChallengeId) ?? ARENA_CHALLENGES[0];

  const isWriteupUnlocked = userState.unlockedWriteupIds.includes(currentChallenge.id);

  // Filtered challenges list
  const filteredChallenges = React.useMemo(() => {
    return ARENA_CHALLENGES.filter((c) => {
      const matchCat = selectedCategory === 'all' || c.category === selectedCategory;
      const matchSev = selectedSeverity === 'all' || c.severity === selectedSeverity;
      const matchSearch =
        !searchQuery.trim() ||
        c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.tagline.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (c.cveCode && c.cveCode.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchCat && matchSev && matchSearch;
    });
  }, [selectedCategory, selectedSeverity, searchQuery]);

  const handleSubmitFlag = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputFlag.trim()) return;

    const res = submitFlag(currentChallenge.id, inputFlag);
    setSubmissionFeedback({
      isSuccess: res.isSuccess,
      message: res.message,
    });

    if (res.isSuccess) {
      playRootCompromisedChime();
    }
  };

  const handleAutoFillProof = () => {
    setInputFlag(currentChallenge.expectedFlag);
    playSonarPing();
  };

  const handleToolAutoProof = (proof: string) => {
    setInputFlag(proof);
  };

  return (
    <div className="mx-auto max-w-7xl space-y-6 pb-12">
      {/* ════════════════════ TOP HEADER BAR ════════════════════ */}
      <header className="flex flex-col items-start justify-between gap-4 rounded-3xl border border-slate-800 bg-slate-950/90 p-5 shadow-2xl backdrop-blur md:flex-row md:items-center">
        <div className="flex items-center gap-3.5">
          <div className="relative flex h-12 w-12 items-center justify-center rounded-2xl border border-rose-500/40 bg-gradient-to-br from-rose-600 to-red-950 font-mono text-xl text-white shadow-lg shadow-rose-900/40">
            ☠️
            <span className="absolute -top-1 -right-1 h-3.5 w-3.5 animate-ping rounded-full border-2 border-slate-950 bg-emerald-500" />
            <span className="absolute -top-1 -right-1 h-3.5 w-3.5 rounded-full border-2 border-slate-950 bg-emerald-500" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="flex items-center gap-2 text-lg font-black tracking-tight text-white md:text-xl">
                OFFSEC CYBER ARENA
                <Badge className="border-rose-500/30 bg-rose-500/20 font-mono text-[10px] font-bold text-rose-400 uppercase">
                  Bug Bounty & 0-Day Range
                </Badge>
              </h1>
            </div>
            <p className="mt-0.5 text-xs text-slate-400">
              Đấu trường Thực chiến Khai thác Lỗ hổng & Bảng xếp hạng Săn Tiền thưởng
            </p>
          </div>
        </div>

        {/* MAIN VIEW SWITCHER */}
        <div className="flex items-center justify-center self-stretch rounded-2xl border border-slate-800 bg-slate-900 p-1 md:self-auto">
          <button
            type="button"
            onClick={() => setMainView('arena')}
            className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition-all ${
              mainView === 'arena'
                ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <span>⚔️</span> Đấu Trường Thực Chiến
          </button>
          <button
            type="button"
            onClick={() => setMainView('leaderboard')}
            className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition-all ${
              mainView === 'leaderboard'
                ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <span>🏆</span> Leaderboard & Tiền Thưởng
          </button>
        </div>

        {/* USER WALLET MINI */}
        <div className="hidden items-center gap-3 border-l border-slate-800 pl-4 lg:flex">
          <div className="text-right">
            <div className="text-[11px] font-medium text-slate-400">
              Operator: <span className="font-bold text-emerald-400">@nam_operator</span>
            </div>
            <div className="font-mono text-xs font-black text-amber-400">
              💰 ${userState.totalBounty.toLocaleString()}{' '}
              <span className="text-slate-600">|</span> {userState.totalXp} XP
            </div>
          </div>
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-tr from-emerald-600 to-teal-400 text-xs font-bold text-slate-950 shadow-md">
            OP
          </div>
        </div>
      </header>

      {/* ════════════════════ VIEW 1: BATTLE ARENA ════════════════════ */}
      {mainView === 'arena' && (
        <div className="space-y-6">
          {/* CATEGORY & SEARCH FILTER BAR */}
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-800 bg-slate-950 p-3.5 shadow-md">
            <div className="flex flex-wrap items-center gap-2">
              <span className="mr-1 flex items-center gap-1 font-mono text-xs font-bold text-slate-400">
                <Search className="h-3.5 w-3.5" /> Bộ lọc:
              </span>
              <button
                type="button"
                onClick={() => setCategory('all')}
                className={`rounded-xl px-3 py-1.5 font-mono text-xs font-bold transition ${
                  selectedCategory === 'all'
                    ? 'border border-slate-700 bg-slate-800 text-white'
                    : 'border border-slate-800 bg-slate-900 text-slate-400 hover:text-white'
                }`}
              >
                Tất cả ({ARENA_CHALLENGES.length})
              </button>
              <button
                type="button"
                onClick={() => setCategory('cve-labs')}
                className={`rounded-xl px-3 py-1.5 font-mono text-xs font-bold transition ${
                  selectedCategory === 'cve-labs'
                    ? 'border border-rose-500/40 bg-rose-500/20 text-rose-300'
                    : 'border border-slate-800 bg-slate-900 text-slate-400 hover:text-white'
                }`}
              >
                💣 1-Day CVE Labs
              </button>
              <button
                type="button"
                onClick={() => setCategory('bug-bounty')}
                className={`rounded-xl px-3 py-1.5 font-mono text-xs font-bold transition ${
                  selectedCategory === 'bug-bounty'
                    ? 'border border-amber-500/40 bg-amber-500/20 text-amber-300'
                    : 'border border-slate-800 bg-slate-900 text-slate-400 hover:text-white'
                }`}
              >
                🌐 Bug Bounty (Web/API)
              </button>
              <button
                type="button"
                onClick={() => setCategory('zero-day')}
                className={`rounded-xl px-3 py-1.5 font-mono text-xs font-bold transition ${
                  selectedCategory === 'zero-day'
                    ? 'border border-sky-500/40 bg-sky-500/20 text-sky-300'
                    : 'border border-slate-800 bg-slate-900 text-slate-400 hover:text-white'
                }`}
              >
                🔬 0-Day Code Audit
              </button>
              <button
                type="button"
                onClick={() => setCategory('active-directory')}
                className={`rounded-xl px-3 py-1.5 font-mono text-xs font-bold transition ${
                  selectedCategory === 'active-directory'
                    ? 'border border-emerald-500/40 bg-emerald-500/20 text-emerald-300'
                    : 'border border-slate-800 bg-slate-900 text-slate-400 hover:text-white'
                }`}
              >
                👑 Active Directory
              </button>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Tìm CVE, tên bug..."
                className="w-48 rounded-xl border border-slate-800 bg-slate-900 px-3 py-1.5 font-mono text-xs text-white placeholder-slate-500 focus:border-slate-700 focus:outline-none"
              />
            </div>
          </div>

          {/* MAIN GRID: 2 COLUMNS */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
            {/* LEFT COLUMN (4 COLS): ACTIVE CHALLENGE DETAILS & QUEUE */}
            <div className="space-y-4 lg:col-span-4">
              {/* ACTIVE MISSION CARD */}
              <Card className="relative space-y-4 overflow-hidden rounded-3xl border-2 border-rose-500/50 bg-gradient-to-b from-slate-900 via-slate-950 to-black p-5 shadow-2xl">
                <div className="flex items-center justify-between">
                  <span className="rounded-lg border border-rose-500/40 bg-rose-500/20 px-2.5 py-1 font-mono text-[10px] font-extrabold text-rose-400 uppercase">
                    {currentChallenge.cveCode ?? currentChallenge.category}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-black text-amber-400">
                      💰 ${currentChallenge.bountyReward.toLocaleString()}
                    </span>
                    <span className="font-mono text-[11px] font-bold text-emerald-400">
                      +{currentChallenge.xpReward} XP
                    </span>
                  </div>
                </div>

                <div>
                  <h2 className="text-base leading-snug font-black text-white">
                    {currentChallenge.title}
                  </h2>
                  <p className="mt-1.5 text-xs leading-relaxed text-slate-300">
                    {currentChallenge.scenarioBriefing}
                  </p>
                </div>

                {/* TARGET & CVSS */}
                <div className="grid grid-cols-2 gap-2 font-mono text-xs">
                  <div className="rounded-xl border border-slate-800 bg-slate-950 p-2.5">
                    <div className="text-[10px] text-slate-500 uppercase">Mục tiêu</div>
                    <div className="font-bold text-emerald-400">
                      {currentChallenge.targetHost}:{currentChallenge.targetPort}
                    </div>
                  </div>
                  <div className="rounded-xl border border-slate-800 bg-slate-950 p-2.5">
                    <div className="text-[10px] text-slate-500 uppercase">CVSS v4.0</div>
                    <div className="font-black text-rose-400">
                      {currentChallenge.cvssScore} (CRITICAL)
                    </div>
                  </div>
                </div>

                {/* OBJECTIVES */}
                <div className="space-y-2 border-t border-slate-800/80 pt-3">
                  <div className="font-mono text-[11px] font-bold tracking-wider text-slate-400 uppercase">
                    Mục tiêu tác chiến:
                  </div>
                  <ul className="space-y-1.5 text-xs text-slate-300">
                    {currentChallenge.keyObjectives.map((obj, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="mt-0.5 font-mono text-[10px] font-bold text-rose-400">
                          #{i + 1}
                        </span>
                        <span>{obj}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* FIRST BLOOD RECORD & WALKTHROUGH LINK */}
                <div className="flex items-center justify-between rounded-xl border border-slate-800/80 bg-slate-950 p-2.5 text-xs">
                  <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
                    <span>🩸 First Blood:</span>
                    <span className="font-mono font-bold text-rose-400">
                      {currentChallenge.firstBloodHolder.handle} (
                      {currentChallenge.firstBloodHolder.timeRecord})
                    </span>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => openWriteupModal(currentChallenge.id)}
                    className="h-7 text-xs font-bold text-sky-400 hover:bg-sky-500/20"
                  >
                    <BookOpen className="mr-1 h-3.5 w-3.5" /> Lời giải
                  </Button>
                </div>

                {/* FLAG SUBMISSION FORM */}
                <form
                  onSubmit={handleSubmitFlag}
                  className="space-y-2 border-t border-slate-800/80 pt-3"
                >
                  <div className="flex items-center justify-between text-xs font-bold text-slate-300">
                    <span>🚩 Nộp Flag / Exploit Proof:</span>
                    <button
                      type="button"
                      onClick={handleAutoFillProof}
                      className="text-[10px] text-emerald-400 hover:underline"
                    >
                      Gợi ý / Auto-Fill
                    </button>
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={inputFlag}
                      onChange={(e) => setInputFlag(e.target.value)}
                      placeholder="OS_0DAY{...}"
                      className="flex-1 rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 font-mono text-xs text-emerald-400 placeholder-slate-600 focus:border-emerald-500 focus:outline-none"
                    />
                    <Button
                      type="submit"
                      className="rounded-xl bg-rose-600 px-4 text-xs font-black text-white shadow-lg shadow-rose-600/30 hover:bg-rose-500"
                    >
                      NỘP CỜ
                    </Button>
                  </div>

                  {submissionFeedback && (
                    <div
                      className={`rounded-xl border p-3 font-mono text-xs font-bold ${
                        submissionFeedback.isSuccess
                          ? 'border-emerald-500/40 bg-emerald-500/20 text-emerald-300'
                          : 'border-rose-500/40 bg-rose-500/20 text-rose-300'
                      }`}
                    >
                      {submissionFeedback.message}
                    </div>
                  )}
                </form>
              </Card>

              {/* CHALLENGE QUEUE LIST */}
              <div className="space-y-2">
                <div className="font-mono text-xs font-bold tracking-wider text-slate-400 uppercase">
                  🎯 Danh sách Thử thách ({filteredChallenges.length})
                </div>
                <div className="custom-scrollbar max-h-80 space-y-2 overflow-y-auto pr-1">
                  {filteredChallenges.map((c) => {
                    const isSelected = c.id === currentChallenge.id;
                    const cSolved = userState.solvedChallengeIds.includes(c.id);
                    return (
                      <div
                        key={c.id}
                        onClick={() => selectChallenge(c.id)}
                        className={`flex cursor-pointer items-center justify-between rounded-2xl border p-3 transition ${
                          isSelected
                            ? 'border-rose-500/60 bg-slate-800/90 shadow-lg'
                            : 'border-slate-800 bg-slate-950/70 hover:border-slate-700'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <span
                            className={`h-2.5 w-2.5 rounded-full ${
                              cSolved ? 'bg-emerald-400' : 'bg-rose-500'
                            }`}
                          />
                          <div>
                            <div className="flex items-center gap-1.5 text-xs font-bold text-white">
                              {c.title}
                            </div>
                            <div className="mt-0.5 font-mono text-[10px] text-slate-400">
                              {c.cveCode ?? c.category} · {c.estimatedMinutes}m
                            </div>
                          </div>
                        </div>
                        <span className="font-mono text-xs font-bold text-amber-400">
                          ${c.bountyReward.toLocaleString()}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN (8 COLS): OPERATOR TOOLSET STAGE */}
            <div className="space-y-4 lg:col-span-8">
              {/* TOOLSET SELECTOR TABS */}
              <div className="flex items-center justify-between rounded-2xl border border-slate-800 bg-slate-950 p-2 shadow-md">
                <div className="flex flex-wrap items-center gap-1.5">
                  {currentChallenge.supportedTools.includes('repeater') && (
                    <button
                      type="button"
                      onClick={() => setActiveTool('repeater')}
                      className={`flex items-center gap-1.5 rounded-xl px-3.5 py-1.5 font-mono text-xs font-bold transition-all ${
                        activeTool === 'repeater'
                          ? 'bg-emerald-600 text-white shadow-md'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      <Globe className="h-3.5 w-3.5" /> HTTP Repeater
                    </button>
                  )}

                  {currentChallenge.supportedTools.includes('terminal') && (
                    <button
                      type="button"
                      onClick={() => setActiveTool('terminal')}
                      className={`flex items-center gap-1.5 rounded-xl px-3.5 py-1.5 font-mono text-xs font-bold transition-all ${
                        activeTool === 'terminal'
                          ? 'bg-emerald-600 text-white shadow-md'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      <TerminalIcon className="h-3.5 w-3.5" /> Dual-Terminal
                    </button>
                  )}

                  {currentChallenge.supportedTools.includes('diff') && (
                    <button
                      type="button"
                      onClick={() => setActiveTool('diff')}
                      className={`flex items-center gap-1.5 rounded-xl px-3.5 py-1.5 font-mono text-xs font-bold transition-all ${
                        activeTool === 'diff'
                          ? 'bg-emerald-600 text-white shadow-md'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      <FileCode className="h-3.5 w-3.5" /> Patch Diff
                    </button>
                  )}

                  {currentChallenge.supportedTools.includes('memory') && (
                    <button
                      type="button"
                      onClick={() => setActiveTool('memory')}
                      className={`flex items-center gap-1.5 rounded-xl px-3.5 py-1.5 font-mono text-xs font-bold transition-all ${
                        activeTool === 'memory'
                          ? 'bg-emerald-600 text-white shadow-md'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      <Binary className="h-3.5 w-3.5" /> Memory Hex Dump
                    </button>
                  )}
                </div>

                <div className="hidden items-center gap-2 pr-2 font-mono text-[11px] text-slate-400 sm:flex">
                  <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-400" />
                  Live Proxy Active
                </div>
              </div>

              {/* TOOL STAGE CONTENT */}
              {activeTool === 'repeater' && (
                <HttpRepeaterStage
                  challenge={currentChallenge}
                  onProofExtracted={handleToolAutoProof}
                />
              )}

              {activeTool === 'terminal' && (
                <ArenaTerminalStage
                  challenge={currentChallenge}
                  onProofExtracted={handleToolAutoProof}
                />
              )}

              {activeTool === 'diff' && <PatchDiffStage challenge={currentChallenge} />}

              {activeTool === 'memory' && (
                <MemoryHexStage
                  challenge={currentChallenge}
                  onProofExtracted={handleToolAutoProof}
                />
              )}
            </div>
          </div>
        </div>
      )}

      {/* ════════════════════ VIEW 2: LEADERBOARD ════════════════════ */}
      {mainView === 'leaderboard' && <ArenaLeaderboardStage />}

      {/* ════════════════════ WRITEUP MODAL ════════════════════ */}
      {activeWriteupModalChallengeId && (
        <ArenaWriteupModal
          challenge={currentChallenge}
          isUnlocked={isWriteupUnlocked}
          onClose={closeWriteupModal}
          onForceUnlock={() => {
            useArenaStore.setState((state) => ({
              userState: {
                ...state.userState,
                unlockedWriteupIds: [
                  ...state.userState.unlockedWriteupIds,
                  currentChallenge.id,
                ],
              },
            }));
          }}
        />
      )}
    </div>
  );
};
