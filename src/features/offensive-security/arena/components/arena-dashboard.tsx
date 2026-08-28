'use client';

import * as React from 'react';
import {
  Binary,
  BookOpen,
  ChevronDown,
  Coins,
  FileCode,
  Globe,
  HelpCircle,
  Info,
  Maximize2,
  Minimize2,
  Search,
  Terminal as TerminalIcon,
  X,
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
import { Button } from '@/components/ui/button';
import {
  playRootCompromisedChime,
  playSonarPing,
} from '../../workbench/engines/cyber-audio-engine';

export const ArenaDashboard: React.FC = () => {
  const [mainView, setMainView] = React.useState<'arena' | 'leaderboard'>('arena');
  const [inputFlag, setInputFlag] = React.useState('');
  const [isFocusMode, setIsFocusMode] = React.useState(false);
  const [isMissionDrawerOpen, setIsMissionDrawerOpen] = React.useState(false);
  const [isBoxSelectorOpen, setIsBoxSelectorOpen] = React.useState(false);
  const [isHintModalOpen, setIsHintModalOpen] = React.useState(false);
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
    searchQuery,
    userState,
    activeWriteupModalChallengeId,
    pendingShellNotification,
    getOrCreateTargetSession,
    selectChallenge,
    setActiveTool,
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
      const matchSearch =
        !searchQuery.trim() ||
        c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.tagline.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (c.cveCode && c.cveCode.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchCat && matchSearch;
    });
  }, [selectedCategory, searchQuery]);

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

  // Get active quest description based on stage
  const getActiveQuestText = () => {
    if (session.stage === 'pwned') {
      return '👑 Target fully compromised (UID 0)! All flags captured.';
    }
    if (session.stage === 'privesc' || session.userFlagFound) {
      return '🔍 Khảo sát nội bộ (sudo -l / SUID / crontab) để leo quyền lên Root & đọc /root/root.txt';
    }
    if (session.stage === 'foothold') {
      return '⚡ Đã kết nối Shell! Đọc User Flag tại /home/operator/user.txt';
    }
    return `🎯 ${currentChallenge.keyObjectives[0] || 'Khai thác lỗ hổng ban đầu để lấy Reverse Shell'}`;
  };

  return (
    <div className="mx-auto w-full max-w-[1600px] space-y-3 pb-10">
      {/* ════════════════════ TOP COMBAT DECK HUD BAR ════════════════════ */}
      <header className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-800 bg-slate-950 px-4 py-2.5 shadow-xl">
        {/* LEFT: TARGET BOX SELECTOR DROPDOWN */}
        <div className="relative flex items-center gap-3">
          <div className="relative">
            <button
              type="button"
              onClick={() => setIsBoxSelectorOpen(!isBoxSelectorOpen)}
              className="flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-900 px-3 py-1.5 font-mono text-xs font-bold text-white transition hover:border-slate-600 hover:bg-slate-800"
            >
              <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-400" />
              <span className="text-slate-400">Target:</span>
              <span className="font-extrabold text-emerald-400">
                {currentChallenge.targetHost}:{currentChallenge.targetPort}
              </span>
              <span className="font-normal text-slate-500">
                ({currentChallenge.cveCode ?? currentChallenge.category})
              </span>
              <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
            </button>

            {/* BOX DROPDOWN MENU */}
            {isBoxSelectorOpen && (
              <div className="absolute top-11 left-0 z-50 w-80 rounded-2xl border border-slate-700 bg-slate-950 p-2 shadow-2xl backdrop-blur">
                <div className="mb-2 flex items-center gap-2 border-b border-slate-800 pb-2">
                  <Search className="h-3.5 w-3.5 text-slate-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Tìm cỗ máy mục tiêu..."
                    className="w-full bg-transparent font-mono text-xs text-white placeholder-slate-500 focus:outline-none"
                    autoFocus
                  />
                </div>
                <div className="max-h-60 space-y-1 overflow-y-auto">
                  {filteredChallenges.map((box) => {
                    const isSel = box.id === currentChallenge.id;
                    const isSolved = userState.solvedChallengeIds.includes(box.id);
                    return (
                      <div
                        key={box.id}
                        onClick={() => {
                          selectChallenge(box.id);
                          setIsBoxSelectorOpen(false);
                        }}
                        className={`flex cursor-pointer items-center justify-between rounded-xl p-2 text-xs transition ${
                          isSel
                            ? 'border border-emerald-500/40 bg-emerald-500/10 text-white'
                            : 'text-slate-300 hover:bg-slate-900'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span
                            className={`h-2 w-2 rounded-full ${
                              isSolved ? 'bg-emerald-400' : 'bg-rose-500'
                            }`}
                          />
                          <div>
                            <div className="font-bold">{box.title}</div>
                            <div className="font-mono text-[10px] text-slate-500">
                              {box.targetHost}:{box.targetPort} ·{' '}
                              {box.severity.toUpperCase()}
                            </div>
                          </div>
                        </div>
                        <span className="font-mono text-[11px] font-bold text-amber-400">
                          ${box.bountyReward.toLocaleString()}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* VIEW SWITCHER TABS */}
          <div className="hidden items-center rounded-xl border border-slate-800 bg-slate-900 p-1 sm:flex">
            <button
              type="button"
              onClick={() => setMainView('arena')}
              className={`rounded-lg px-3 py-1 font-mono text-xs font-bold transition ${
                mainView === 'arena'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Đấu Trường
            </button>
            <button
              type="button"
              onClick={() => setMainView('leaderboard')}
              className={`rounded-lg px-3 py-1 font-mono text-xs font-bold transition ${
                mainView === 'leaderboard'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Leaderboard
            </button>
          </div>
        </div>

        {/* CENTER: ATTACK PHASE STEPPER */}
        <div className="hidden items-center gap-1.5 rounded-xl border border-slate-800 bg-slate-900/60 px-3 py-1 md:flex">
          <span className="text-[10px] font-bold tracking-wider text-slate-500 uppercase">
            Phase:
          </span>
          <span
            className={`rounded-md px-2 py-0.5 font-mono text-[10px] font-black uppercase transition ${
              session.stage === 'recon'
                ? 'border border-sky-500/50 bg-sky-500/20 text-sky-300'
                : 'text-slate-600'
            }`}
          >
            1. Recon
          </span>
          <span className="text-slate-700">→</span>
          <span
            className={`rounded-md px-2 py-0.5 font-mono text-[10px] font-black uppercase transition ${
              session.stage === 'foothold' || session.userFlagFound
                ? 'border border-amber-500/50 bg-amber-500/20 text-amber-300'
                : 'text-slate-600'
            }`}
          >
            2. User
          </span>
          <span className="text-slate-700">→</span>
          <span
            className={`rounded-md px-2 py-0.5 font-mono text-[10px] font-black uppercase transition ${
              session.stage === 'pwned'
                ? 'animate-pulse border border-rose-500/50 bg-rose-500/20 text-rose-300'
                : 'text-slate-600'
            }`}
          >
            3. Root 👑
          </span>
        </div>

        {/* RIGHT: ACTIONS & WALLET */}
        <div className="flex items-center gap-2">
          {/* HINT BUTTON */}
          {currentChallenge.hints && currentChallenge.hints.length > 0 && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => setIsHintModalOpen(true)}
              className="h-8 rounded-xl border-slate-800 bg-slate-900 font-mono text-xs font-bold text-sky-400 hover:bg-slate-800 hover:text-sky-300"
            >
              <HelpCircle className="mr-1 h-3.5 w-3.5" />
              Gợi ý
            </Button>
          )}

          {/* MISSION BRIEFING MODAL TRIGGER */}
          <Button
            size="sm"
            variant="outline"
            onClick={() => setIsMissionDrawerOpen(true)}
            className="h-8 rounded-xl border-slate-800 bg-slate-900 font-mono text-xs font-bold text-slate-300 hover:bg-slate-800 hover:text-white"
          >
            <Info className="mr-1 h-3.5 w-3.5 text-amber-400" />
            Nhiệm vụ
          </Button>

          {/* WRITEUP BUTTON */}
          <Button
            size="sm"
            variant="outline"
            onClick={() => openWriteupModal(currentChallenge.id)}
            className="h-8 rounded-xl border-slate-800 bg-slate-900 font-mono text-xs font-bold text-slate-300 hover:bg-slate-800 hover:text-white"
          >
            <BookOpen className="mr-1 h-3.5 w-3.5 text-rose-400" />
            Lời giải
          </Button>

          {/* WALLET */}
          <div className="hidden items-center gap-1.5 rounded-xl border border-slate-800 bg-slate-900 px-2.5 py-1 font-mono text-xs font-bold text-amber-400 lg:flex">
            <Coins className="h-3.5 w-3.5 text-amber-400" />
            <span>${userState.totalBounty.toLocaleString()}</span>
          </div>

          {/* FOCUS MODE TOGGLE */}
          <button
            type="button"
            onClick={() => setIsFocusMode(!isFocusMode)}
            className="flex h-8 w-8 items-center justify-center rounded-xl border border-slate-800 bg-slate-900 text-slate-400 hover:bg-slate-800 hover:text-white"
            title={isFocusMode ? 'Thoát Focus Mode' : 'Bật Focus Mode'}
          >
            {isFocusMode ? (
              <Minimize2 className="h-3.5 w-3.5" />
            ) : (
              <Maximize2 className="h-3.5 w-3.5" />
            )}
          </button>
        </div>
      </header>

      {/* ════════════════════ SESSION BROKER FLOATING TOAST ════════════════════ */}
      {pendingShellNotification && (
        <div className="flex animate-pulse items-center justify-between rounded-2xl border border-amber-500/80 bg-gradient-to-r from-amber-950 via-slate-950 to-amber-950 px-4 py-2.5 shadow-2xl">
          <div className="flex items-center gap-2.5">
            <Zap className="h-4 w-4 animate-bounce text-amber-400" />
            <div className="font-mono text-xs font-bold text-amber-300">
              ⚡ REVERSE SHELL ACTIVE: {pendingShellNotification.user}@
              {pendingShellNotification.host}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              onClick={() => attachShellSession(pendingShellNotification.challengeId)}
              className="h-7 rounded-lg bg-amber-500 px-3 font-mono text-xs font-black text-slate-950 hover:bg-amber-400"
            >
              [ ATTACH TERMINAL ]
            </Button>
            <button
              type="button"
              onClick={dismissShellNotification}
              className="text-slate-400 hover:text-white"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* ════════════════════ CURRENT ACTIVE OBJECTIVE QUEST PILL ════════════════════ */}
      <div className="flex items-center justify-between rounded-xl border border-slate-800/80 bg-slate-950/80 px-3.5 py-2 font-mono text-xs text-slate-300">
        <div className="flex items-center gap-2 overflow-hidden text-ellipsis whitespace-nowrap">
          <span className="flex h-2 w-2 rounded-full bg-rose-500" />
          <span className="font-bold text-rose-400 uppercase">Active Objective:</span>
          <span className="text-slate-200">{getActiveQuestText()}</span>
        </div>

        {/* FLAG SUBMIT BAR */}
        <form onSubmit={handleSubmitFlag} className="flex items-center gap-1.5 pl-4">
          <input
            type="text"
            value={inputFlag}
            onChange={(e) => setInputFlag(e.target.value)}
            placeholder="OS_0DAY{flag}..."
            className="w-48 rounded-lg border border-slate-700 bg-slate-900 px-2.5 py-1 font-mono text-xs text-emerald-400 placeholder-slate-500 focus:border-emerald-500 focus:outline-none"
          />
          <Button
            type="submit"
            size="sm"
            className="h-7 rounded-lg bg-rose-600 px-3 font-mono text-xs font-black text-white hover:bg-rose-500"
          >
            NỘP
          </Button>
        </form>
      </div>

      {/* SUBMISSION FEEDBACK ALERT */}
      {submissionFeedback && (
        <div
          className={`flex items-center justify-between rounded-xl border p-2.5 font-mono text-xs font-bold ${
            submissionFeedback.isSuccess
              ? 'border-emerald-500/40 bg-emerald-500/20 text-emerald-300'
              : 'border-rose-500/40 bg-rose-500/20 text-rose-300'
          }`}
        >
          <span>{submissionFeedback.message}</span>
          <button
            type="button"
            onClick={() => setSubmissionFeedback(null)}
            className="text-slate-400 hover:text-white"
          >
            ✕
          </button>
        </div>
      )}

      {/* ════════════════════ VIEW 1: FULL OPERATOR TOOLSET STAGE ════════════════════ */}
      {mainView === 'arena' && (
        <div className="space-y-3">
          {/* TOOL SWITCHER TABS */}
          <div className="flex items-center justify-between rounded-2xl border border-slate-800 bg-slate-950 p-1.5 shadow-md">
            <div className="flex items-center gap-1">
              {currentChallenge.supportedTools.includes('repeater') && (
                <button
                  type="button"
                  onClick={() => setActiveTool('repeater')}
                  className={`flex items-center gap-1.5 rounded-xl px-3.5 py-1.5 font-mono text-xs font-bold transition-all ${
                    activeTool === 'repeater'
                      ? 'bg-emerald-600 text-white shadow-sm'
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
                      ? 'bg-emerald-600 text-white shadow-sm'
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
                      ? 'bg-emerald-600 text-white shadow-sm'
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
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Binary className="h-3.5 w-3.5" /> Memory Dump
                </button>
              )}
            </div>

            <div className="flex items-center gap-2 pr-3 font-mono text-[11px] text-slate-500">
              <span>
                Host: {currentChallenge.targetHost}:{currentChallenge.targetPort}
              </span>
              <span>·</span>
              <span className="text-amber-400">
                ${currentChallenge.bountyReward.toLocaleString()}
              </span>
            </div>
          </div>

          {/* MAIN TOOL STAGE CANVAS (MAX SCREEN SPACE) */}
          <div className="w-full">
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
      )}

      {/* ════════════════════ VIEW 2: LEADERBOARD ════════════════════ */}
      {mainView === 'leaderboard' && <ArenaLeaderboardStage />}

      {/* ════════════════════ MISSION BRIEFING DRAWER / MODAL ════════════════════ */}
      {isMissionDrawerOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
          <div className="max-h-[90vh] w-full max-w-2xl space-y-4 overflow-y-auto rounded-3xl border border-slate-800 bg-slate-950 p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <span className="rounded-lg border border-rose-500/40 bg-rose-500/20 px-2 py-0.5 font-mono text-[10px] font-bold text-rose-400 uppercase">
                  {currentChallenge.cveCode ?? currentChallenge.category}
                </span>
                <h2 className="mt-1 text-lg font-black text-white">
                  {currentChallenge.title}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setIsMissionDrawerOpen(false)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-900 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <p className="text-xs leading-relaxed text-slate-300">
              {currentChallenge.scenarioBriefing}
            </p>

            <div className="grid grid-cols-3 gap-2 font-mono text-xs">
              <div className="rounded-xl border border-slate-800 bg-slate-900 p-2.5">
                <div className="text-[10px] text-slate-500 uppercase">Mục tiêu</div>
                <div className="font-bold text-emerald-400">
                  {currentChallenge.targetHost}:{currentChallenge.targetPort}
                </div>
              </div>
              <div className="rounded-xl border border-slate-800 bg-slate-900 p-2.5">
                <div className="text-[10px] text-slate-500 uppercase">CVSS Score</div>
                <div className="font-bold text-rose-400">
                  {currentChallenge.cvssScore} (CRITICAL)
                </div>
              </div>
              <div className="rounded-xl border border-slate-800 bg-slate-900 p-2.5">
                <div className="text-[10px] text-slate-500 uppercase">Bounty & XP</div>
                <div className="font-bold text-amber-400">
                  ${currentChallenge.bountyReward.toLocaleString()} · +
                  {currentChallenge.xpReward}XP
                </div>
              </div>
            </div>

            <div className="space-y-2 border-t border-slate-800 pt-3">
              <div className="font-mono text-xs font-bold text-slate-400 uppercase">
                Chuỗi Mục Tiêu Tác Chiến:
              </div>
              <ul className="space-y-1.5 text-xs text-slate-300">
                {currentChallenge.keyObjectives.map((obj, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="font-mono text-[10px] font-bold text-rose-400">
                      #{i + 1}
                    </span>
                    <span>{obj}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="flex items-center justify-between border-t border-slate-800 pt-3">
              <div className="text-xs text-slate-400">
                🩸 First Blood:{' '}
                <span className="font-mono font-bold text-rose-400">
                  {currentChallenge.firstBloodHolder.handle} (
                  {currentChallenge.firstBloodHolder.timeRecord})
                </span>
              </div>
              <Button
                onClick={() => setIsMissionDrawerOpen(false)}
                className="rounded-xl bg-slate-800 px-4 text-xs font-bold text-white hover:bg-slate-700"
              >
                Đóng
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ════════════════════ HINT LADDER MODAL ════════════════════ */}
      {isHintModalOpen && currentChallenge.hints && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
          <div className="max-h-[90vh] w-full max-w-xl space-y-4 overflow-y-auto rounded-3xl border border-slate-800 bg-slate-950 p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <HelpCircle className="h-5 w-5 text-sky-400" />
                <h2 className="text-base font-black text-white">
                  Bậc Thang Gợi Ý (Hint Ladder)
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setIsHintModalOpen(false)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-900 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <p className="text-xs text-slate-400">
              Mở khóa gợi ý theo từng nấc để giữ nguyên tư duy giải đố độc lập. Mỗi nấc
              gợi ý có thể trừ điểm thưởng Bounty.
            </p>

            <div className="space-y-2">
              {currentChallenge.hints.map((hint) => {
                const isUnlocked = unlockedHints.includes(hint.level);
                return (
                  <div
                    key={hint.level}
                    className="space-y-2 rounded-2xl border border-slate-800 bg-slate-900/60 p-3 text-xs"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-bold text-slate-200">
                        Nấc L{hint.level}: {hint.name}
                      </span>
                      {!isUnlocked ? (
                        <button
                          type="button"
                          onClick={() => toggleUnlockHint(hint.level)}
                          className="rounded-lg border border-amber-500/40 bg-amber-500/20 px-2.5 py-1 font-mono text-[11px] font-bold text-amber-300 hover:bg-amber-500/30"
                        >
                          Mở Khóa (-{hint.penaltyPercent}%)
                        </button>
                      ) : (
                        <span className="font-mono text-[11px] font-bold text-emerald-400">
                          ✓ Đã mở
                        </span>
                      )}
                    </div>
                    {isUnlocked && (
                      <div className="rounded-xl border border-slate-800 bg-slate-950 p-2.5 font-mono text-xs leading-relaxed text-slate-300">
                        {hint.hintText}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="flex justify-end pt-2">
              <Button
                onClick={() => setIsHintModalOpen(false)}
                className="rounded-xl bg-slate-800 px-4 text-xs font-bold text-white hover:bg-slate-700"
              >
                Đóng
              </Button>
            </div>
          </div>
        </div>
      )}

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
