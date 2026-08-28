'use client';

import * as React from 'react';
import {
  Binary,
  BookOpen,
  FileCode,
  Globe,
  HelpCircle,
  Maximize2,
  Minimize2,
  Search,
  Terminal as TerminalIcon,
  Zap,
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
  const [isFocusMode, setIsFocusMode] = React.useState(false);
  const [unlockedHints, setUnlockedHints] = React.useState<number[]>([]);
  const [submissionFeedback, setSubmissionFeedback] = React.useState<{
    isSuccess: boolean;
    flagType?: 'user' | 'root';
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
    pendingShellNotification,
    getOrCreateTargetSession,
    selectChallenge,
    setActiveTool,
    setCategory,
    setSearchQuery,
    submitFlag,
    openWriteupModal,
    closeWriteupModal,
    attachShellSession,
    dismissShellNotification,
  } = useArenaStore();

  const currentChallenge =
    ARENA_CHALLENGES.find((c) => c.id === selectedChallengeId) ?? ARENA_CHALLENGES[0];

  const session = getOrCreateTargetSession(currentChallenge.id);
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
      flagType: res.flagType,
      message: res.message,
    });

    if (res.isSuccess) {
      playRootCompromisedChime();
    }
  };

  const handleToolAutoProof = (proof: string) => {
    setInputFlag(proof);
    playSonarPing();
  };

  const toggleUnlockHint = (level: number) => {
    if (!unlockedHints.includes(level)) {
      setUnlockedHints([...unlockedHints, level]);
    }
  };

  return (
    <div className="mx-auto max-w-7xl space-y-5 pb-12">
      {/* ════════════════════ TOP COMBAT HUD ════════════════════ */}
      <header className="flex flex-col items-start justify-between gap-4 rounded-3xl border border-slate-800 bg-slate-950/90 p-4 shadow-2xl backdrop-blur md:flex-row md:items-center">
        <div className="flex items-center gap-3.5">
          <div className="relative flex h-11 w-11 items-center justify-center rounded-2xl border border-rose-500/40 bg-gradient-to-br from-rose-600 to-red-950 font-mono text-lg text-white shadow-lg shadow-rose-900/40">
            ☠️
            <span className="absolute -top-1 -right-1 h-3 w-3 animate-ping rounded-full border-2 border-slate-950 bg-emerald-500" />
            <span className="absolute -top-1 -right-1 h-3 w-3 rounded-full border-2 border-slate-950 bg-emerald-500" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="flex items-center gap-2 text-base font-black tracking-tight text-white md:text-lg">
                OFFSEC CYBER ARENA
                <Badge className="border-rose-500/30 bg-rose-500/20 font-mono text-[10px] font-bold text-rose-400 uppercase">
                  Boot2Root Tactical Range
                </Badge>
              </h1>
            </div>
            <p className="text-xs text-slate-400">
              Mô phỏng Đấu trường Thực chiến: Recon → Foothold → User Flag → PrivEsc → 👑
              ROOT
            </p>
          </div>
        </div>

        {/* MAIN VIEW SWITCHER */}
        <div className="flex items-center justify-center self-stretch rounded-2xl border border-slate-800 bg-slate-900 p-1 md:self-auto">
          <button
            type="button"
            onClick={() => setMainView('arena')}
            className={`flex items-center gap-2 rounded-xl px-3.5 py-1.5 text-xs font-bold transition-all ${
              mainView === 'arena'
                ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <span>⚔️</span> Đấu Trường
          </button>
          <button
            type="button"
            onClick={() => setMainView('leaderboard')}
            className={`flex items-center gap-2 rounded-xl px-3.5 py-1.5 text-xs font-bold transition-all ${
              mainView === 'leaderboard'
                ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <span>🏆</span> Leaderboard
          </button>
        </div>

        {/* USER WALLET & FOCUS TOGGLE */}
        <div className="flex items-center gap-3">
          <div className="hidden text-right lg:block">
            <div className="text-[11px] font-medium text-slate-400">
              Operator: <span className="font-bold text-emerald-400">@nam_operator</span>
            </div>
            <div className="font-mono text-xs font-black text-amber-400">
              💰 ${userState.totalBounty.toLocaleString()}{' '}
              <span className="text-slate-600">|</span> {userState.totalXp} XP
            </div>
          </div>
          <button
            type="button"
            onClick={() => setIsFocusMode(!isFocusMode)}
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-800 bg-slate-900 text-slate-400 hover:bg-slate-800 hover:text-white"
            title={isFocusMode ? 'Thoát Focus Mode' : 'Bật Focus Mode'}
          >
            {isFocusMode ? (
              <Minimize2 className="h-4 w-4" />
            ) : (
              <Maximize2 className="h-4 w-4" />
            )}
          </button>
        </div>
      </header>

      {/* ════════════════════ SESSION BROKER TOAST BANNER ════════════════════ */}
      {pendingShellNotification && (
        <div className="flex animate-bounce items-center justify-between rounded-2xl border-2 border-amber-500/80 bg-gradient-to-r from-amber-950 via-slate-900 to-amber-950 p-3.5 shadow-2xl">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500/20 text-amber-400">
              <Zap className="h-5 w-5 animate-pulse" />
            </div>
            <div>
              <div className="font-mono text-xs font-black tracking-wider text-amber-300 uppercase">
                ⚡ NEW SESSION AVAILABLE: {pendingShellNotification.user}@
                {pendingShellNotification.host}
              </div>
              <div className="text-xs text-slate-300">
                {pendingShellNotification.message}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              onClick={() => attachShellSession(pendingShellNotification.challengeId)}
              className="rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 px-4 font-mono text-xs font-black text-slate-950 shadow-lg hover:from-amber-400 hover:to-orange-400"
            >
              [ ATTACH SHELL ]
            </Button>
            <button
              type="button"
              onClick={dismissShellNotification}
              className="rounded-lg p-1.5 text-slate-400 hover:text-white"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* ════════════════════ VIEW 1: BATTLE ARENA ════════════════════ */}
      {mainView === 'arena' && (
        <div className="space-y-5">
          {/* CATEGORY & SEARCH FILTER BAR */}
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-800 bg-slate-950 p-3 shadow-md">
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="mr-1 flex items-center gap-1 font-mono text-xs font-bold text-slate-400">
                <Search className="h-3.5 w-3.5" /> Bộ lọc:
              </span>
              <button
                type="button"
                onClick={() => setCategory('all')}
                className={`rounded-xl px-3 py-1 font-mono text-xs font-bold transition ${
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
                className={`rounded-xl px-3 py-1 font-mono text-xs font-bold transition ${
                  selectedCategory === 'cve-labs'
                    ? 'border border-rose-500/40 bg-rose-500/20 text-rose-300'
                    : 'border border-slate-800 bg-slate-900 text-slate-400 hover:text-white'
                }`}
              >
                💣 1-Day CVE
              </button>
              <button
                type="button"
                onClick={() => setCategory('bug-bounty')}
                className={`rounded-xl px-3 py-1 font-mono text-xs font-bold transition ${
                  selectedCategory === 'bug-bounty'
                    ? 'border border-amber-500/40 bg-amber-500/20 text-amber-300'
                    : 'border border-slate-800 bg-slate-900 text-slate-400 hover:text-white'
                }`}
              >
                🌐 Bug Bounty
              </button>
              <button
                type="button"
                onClick={() => setCategory('zero-day')}
                className={`rounded-xl px-3 py-1 font-mono text-xs font-bold transition ${
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
                className={`rounded-xl px-3 py-1 font-mono text-xs font-bold transition ${
                  selectedCategory === 'active-directory'
                    ? 'border border-emerald-500/40 bg-emerald-500/20 text-emerald-300'
                    : 'border border-slate-800 bg-slate-900 text-slate-400 hover:text-white'
                }`}
              >
                👑 Active Directory
              </button>
            </div>

            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm CVE, tên box..."
              className="w-44 rounded-xl border border-slate-800 bg-slate-900 px-3 py-1 font-mono text-xs text-white placeholder-slate-500 focus:border-slate-700 focus:outline-none"
            />
          </div>

          {/* MAIN GRID */}
          <div className="grid grid-cols-1 gap-5 lg:grid-cols-12">
            {/* LEFT COLUMN: MISSION BRIEFING & OBJECTIVES (Hidden in Focus Mode) */}
            {!isFocusMode && (
              <div className="space-y-4 lg:col-span-4">
                {/* ACTIVE MISSION CARD */}
                <Card className="space-y-3.5 rounded-3xl border-2 border-rose-500/40 bg-slate-950 p-4 shadow-xl">
                  {/* ATTACK STAGE PROGRESS BAR */}
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
                    <span className="font-mono text-[10px] font-bold text-slate-400 uppercase">
                      Attack Stage:
                    </span>
                    <div className="flex items-center gap-1 font-mono text-[10px] font-black uppercase">
                      <span
                        className={`rounded px-1.5 py-0.5 ${
                          session.stage === 'recon'
                            ? 'border border-sky-500/40 bg-sky-500/20 text-sky-400'
                            : 'text-slate-600'
                        }`}
                      >
                        1. Recon
                      </span>
                      <span className="text-slate-700">→</span>
                      <span
                        className={`rounded px-1.5 py-0.5 ${
                          session.stage === 'foothold'
                            ? 'border border-amber-500/40 bg-amber-500/20 text-amber-400'
                            : session.userFlagFound
                              ? 'text-amber-500'
                              : 'text-slate-600'
                        }`}
                      >
                        2. User
                      </span>
                      <span className="text-slate-700">→</span>
                      <span
                        className={`rounded px-1.5 py-0.5 ${
                          session.stage === 'pwned'
                            ? 'animate-pulse border border-rose-500/40 bg-rose-500/20 text-rose-400'
                            : 'text-slate-600'
                        }`}
                      >
                        3. 👑 Root
                      </span>
                    </div>
                  </div>

                  <div>
                    <h2 className="text-sm font-black text-white">
                      {currentChallenge.title}
                    </h2>
                    <p className="mt-1 text-xs leading-relaxed text-slate-300">
                      {currentChallenge.scenarioBriefing}
                    </p>
                  </div>

                  {/* TARGET INFO */}
                  <div className="grid grid-cols-2 gap-2 font-mono text-xs">
                    <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-2">
                      <div className="text-[9px] text-slate-500 uppercase">Mục tiêu</div>
                      <div className="font-bold text-emerald-400">
                        {currentChallenge.targetHost}:{currentChallenge.targetPort}
                      </div>
                    </div>
                    <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-2">
                      <div className="text-[9px] text-slate-500 uppercase">
                        Bounty & XP
                      </div>
                      <div className="font-bold text-amber-400">
                        ${currentChallenge.bountyReward.toLocaleString()} · +
                        {currentChallenge.xpReward}XP
                      </div>
                    </div>
                  </div>

                  {/* OBJECTIVES */}
                  <div className="space-y-1.5 border-t border-slate-800/80 pt-2.5">
                    <div className="font-mono text-[10px] font-bold text-slate-400 uppercase">
                      Chuỗi Mục Tiêu Tác Chiến:
                    </div>
                    <ul className="space-y-1 text-xs text-slate-300">
                      {currentChallenge.keyObjectives.map((obj, i) => (
                        <li key={i} className="flex items-start gap-1.5">
                          <span className="mt-0.5 font-mono text-[10px] font-bold text-rose-400">
                            #{i + 1}
                          </span>
                          <span>{obj}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* HINT LADDER ACCORDION */}
                  {currentChallenge.hints && currentChallenge.hints.length > 0 && (
                    <div className="space-y-2 border-t border-slate-800/80 pt-2.5">
                      <div className="flex items-center justify-between font-mono text-[10px] font-bold text-slate-400 uppercase">
                        <span className="flex items-center gap-1">
                          <HelpCircle className="h-3 w-3 text-sky-400" /> Bậc Thang Gợi Ý:
                        </span>
                      </div>
                      <div className="space-y-1.5">
                        {currentChallenge.hints.map((hint) => {
                          const isUnlocked = unlockedHints.includes(hint.level);
                          return (
                            <div
                              key={hint.level}
                              className="rounded-xl border border-slate-800 bg-slate-900/40 p-2 text-xs"
                            >
                              <div className="flex items-center justify-between">
                                <span className="font-mono text-[11px] font-bold text-slate-300">
                                  L{hint.level}: {hint.name}
                                </span>
                                {!isUnlocked ? (
                                  <button
                                    type="button"
                                    onClick={() => toggleUnlockHint(hint.level)}
                                    className="rounded-lg border border-slate-700 bg-slate-800 px-2 py-0.5 text-[10px] font-bold text-amber-400 hover:bg-slate-700"
                                  >
                                    Mở (-{hint.penaltyPercent}%)
                                  </button>
                                ) : (
                                  <span className="font-mono text-[10px] text-emerald-400">
                                    ✓ Đã mở
                                  </span>
                                )}
                              </div>
                              {isUnlocked && (
                                <p className="mt-1.5 border-t border-slate-800 pt-1.5 font-mono text-[11px] leading-relaxed text-slate-300">
                                  {hint.hintText}
                                </p>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* FLAG SUBMISSION */}
                  <form
                    onSubmit={handleSubmitFlag}
                    className="space-y-2 border-t border-slate-800/80 pt-3"
                  >
                    <div className="flex items-center justify-between text-xs font-bold text-slate-300">
                      <span>🚩 Nộp Flag (User hoặc Root):</span>
                      <Button
                        size="sm"
                        variant="ghost"
                        type="button"
                        onClick={() => openWriteupModal(currentChallenge.id)}
                        className="h-6 text-[10px] font-bold text-sky-400 hover:bg-sky-500/20"
                      >
                        <BookOpen className="mr-1 h-3 w-3" /> Lời giải
                      </Button>
                    </div>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={inputFlag}
                        onChange={(e) => setInputFlag(e.target.value)}
                        placeholder="OS_0DAY{...}"
                        className="flex-1 rounded-xl border border-slate-700 bg-slate-950 px-3 py-1.5 font-mono text-xs text-emerald-400 placeholder-slate-600 focus:border-emerald-500 focus:outline-none"
                      />
                      <Button
                        type="submit"
                        className="rounded-xl bg-rose-600 px-3.5 text-xs font-black text-white shadow-lg shadow-rose-600/30 hover:bg-rose-500"
                      >
                        NỘP CỜ
                      </Button>
                    </div>

                    {submissionFeedback && (
                      <div
                        className={`rounded-xl border p-2.5 font-mono text-xs font-bold ${
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

                {/* TARGET BOX QUEUE */}
                <div className="space-y-2">
                  <div className="font-mono text-xs font-bold tracking-wider text-slate-400 uppercase">
                    🎯 Danh sách Máy Mục Tiêu ({filteredChallenges.length})
                  </div>
                  <div className="custom-scrollbar max-h-64 space-y-1.5 overflow-y-auto pr-1">
                    {filteredChallenges.map((c) => {
                      const isSelected = c.id === currentChallenge.id;
                      const cSolved = userState.solvedChallengeIds.includes(c.id);
                      return (
                        <div
                          key={c.id}
                          onClick={() => selectChallenge(c.id)}
                          className={`flex cursor-pointer items-center justify-between rounded-2xl border p-2.5 transition ${
                            isSelected
                              ? 'border-rose-500/60 bg-slate-800/90 shadow-md'
                              : 'border-slate-800 bg-slate-950/70 hover:border-slate-700'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <span
                              className={`h-2.5 w-2.5 rounded-full ${
                                cSolved ? 'bg-emerald-400' : 'bg-rose-500'
                              }`}
                            />
                            <div>
                              <div className="text-xs font-bold text-white">
                                {c.title}
                              </div>
                              <div className="font-mono text-[10px] text-slate-400">
                                {c.targetHost}:{c.targetPort} · {c.estimatedMinutes}m
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
            )}

            {/* RIGHT COLUMN: OPERATOR TOOLSET STAGE */}
            <div
              className={`space-y-4 ${isFocusMode ? 'lg:col-span-12' : 'lg:col-span-8'}`}
            >
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
                      <TerminalIcon className="h-3.5 w-3.5" /> Cyber Terminal
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
                  Target: {currentChallenge.targetHost}
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
