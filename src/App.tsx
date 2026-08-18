/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Activity,
  Award,
  BookOpen,
  FileText,
  Flame,
  History,
  Layers,
  Plus,
  RefreshCw,
  RotateCcw,
  Shield,
  Sparkles,
  Swords,
  Trophy,
  Zap,
} from 'lucide-react';
import { AchievementList } from './components/AchievementList';
import { ActivityLogger } from './components/ActivityLogger';
import { LevelUpEvent, LevelUpModal } from './components/LevelUpModal';
import { OnboardingModal } from './components/OnboardingModal';
import { PRDViewer } from './components/PRDViewer';
import { QuestList } from './components/QuestList';
import { StatusWindow } from './components/StatusWindow';
import { TitleModal } from './components/TitleModal';
import { INITIAL_USER_PROFILE } from './data/categories';
import {
  ActivityLog,
  ActivityOption,
  CoreStatKey,
  Quest,
  UserProfile,
} from './types';
import {
  ExpCalculationResult,
  getPlayerLevelFromTotalExp,
  getRequiredExpForLevel,
  getTierFromLevel,
} from './utils/expCalculator';

export default function App() {
  // Navigation Mode
  const [activeTab, setActiveTab] = useState<'app' | 'prd'>('app');
  const [appSubTab, setAppSubTab] = useState<'status' | 'quests' | 'achievements' | 'history'>('status');

  // State
  const [profile, setProfile] = useState<UserProfile>(INITIAL_USER_PROFILE.profile);
  const [quests, setQuests] = useState<Quest[]>(INITIAL_USER_PROFILE.initialQuests);
  const [achievements, setAchievements] = useState(INITIAL_USER_PROFILE.initialAchievements);
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([
    {
      id: 'log-prev-1',
      activityId: 'running',
      activityName: '달리기 (3.2km)',
      category: 'physical',
      timestamp: '오늘 07:30',
      amount: 3.2,
      unit: 'km',
      difficulty: '템포런',
      difficultyMultiplier: 1.2,
      streakBonus: 24,
      isVerified: true,
      earnedExp: 195,
      primaryStat: 'END',
      primaryExp: 136,
      secondaryStat: 'VIT',
      secondaryExp: 59,
    },
    {
      id: 'log-prev-2',
      activityId: 'reading',
      activityName: '독서 (비즈니스/IT)',
      category: 'learning',
      timestamp: '어제 22:15',
      amount: 30,
      unit: '분',
      difficulty: '일반',
      difficultyMultiplier: 1.0,
      streakBonus: 21,
      isVerified: false,
      earnedExp: 93,
      primaryStat: 'INT',
      primaryExp: 65,
      secondaryStat: 'FOC',
      secondaryExp: 28,
    },
  ]);

  // Modals
  const [showLogger, setShowLogger] = useState<boolean>(false);
  const [showOnboarding, setShowOnboarding] = useState<boolean>(false);
  const [showTitles, setShowTitles] = useState<boolean>(false);
  const [levelUpEvent, setLevelUpEvent] = useState<LevelUpEvent | null>(null);

  // Handle Log Activity
  const handleLogActivity = (
    option: ActivityOption,
    amount: number,
    difficultyMultiplier: number,
    difficultyName: string,
    isVerified: boolean,
    calculation: ExpCalculationResult,
    note?: string
  ) => {
    const earnedExp = calculation.totalExp;
    const oldTotalExp = profile.totalExp;
    const newTotalExp = oldTotalExp + earnedExp;

    const oldPlayerInfo = getPlayerLevelFromTotalExp(oldTotalExp);
    const newPlayerInfo = getPlayerLevelFromTotalExp(newTotalExp);

    // Update Core Stats
    const updatedStats = { ...profile.coreStats };
    let statLevelUpDetected: { key: string; name: string; oldL: number; newL: number } | null = null;

    // Primary Stat
    const pKey = option.primaryStat;
    if (updatedStats[pKey]) {
      const pStat = { ...updatedStats[pKey] };
      const newPExp = pStat.currentExp + calculation.primaryExp;
      if (newPExp >= pStat.nextLevelExp) {
        statLevelUpDetected = {
          key: pKey,
          name: pStat.nameKr,
          oldL: pStat.level,
          newL: pStat.level + 1,
        };
        pStat.level += 1;
        pStat.currentExp = newPExp - pStat.nextLevelExp;
        pStat.nextLevelExp = getRequiredExpForLevel(pStat.level + 1);
      } else {
        pStat.currentExp = newPExp;
      }
      updatedStats[pKey] = pStat;
    }

    // Secondary Stat if any
    if (option.secondaryStat && updatedStats[option.secondaryStat]) {
      const sKey = option.secondaryStat;
      const sStat = { ...updatedStats[sKey] };
      const newSExp = sStat.currentExp + calculation.secondaryExp;
      if (newSExp >= sStat.nextLevelExp) {
        sStat.level += 1;
        sStat.currentExp = newSExp - sStat.nextLevelExp;
        sStat.nextLevelExp = getRequiredExpForLevel(sStat.level + 1);
      } else {
        sStat.currentExp = newSExp;
      }
      updatedStats[sKey] = sStat;
    }

    // Update Subskills
    const updatedSubSkills = { ...profile.subSkills };
    if (updatedSubSkills[option.id]) {
      const sub = { ...updatedSubSkills[option.id] };
      sub.totalAmount += amount;
      sub.totalActivitiesCount += 1;
      sub.exp += earnedExp;
      if (sub.exp >= sub.nextExp) {
        sub.level += 1;
        sub.exp = sub.exp - sub.nextExp;
        sub.nextExp = Math.floor(sub.nextExp * 1.25);
      }
      updatedSubSkills[option.id] = sub;
    } else {
      updatedSubSkills[option.id] = {
        id: option.id,
        name: option.name,
        category: option.category,
        parentStat: option.primaryStat,
        level: 2,
        exp: earnedExp,
        nextExp: 200,
        totalActivitiesCount: 1,
        unit: option.defaultUnit,
        totalAmount: amount,
      };
    }

    // Update User Profile
    const updatedProfile: UserProfile = {
      ...profile,
      totalExp: newTotalExp,
      playerLevel: newPlayerInfo.level,
      currentLevelExp: newPlayerInfo.currentExp,
      nextLevelExp: newPlayerInfo.nextExp,
      rankTier: getTierFromLevel(newPlayerInfo.level),
      weeklyExp: profile.weeklyExp + earnedExp,
      coreStats: updatedStats,
      subSkills: updatedSubSkills,
    };

    setProfile(updatedProfile);

    // Update Quests
    const updatedQuests = quests.map((q) => {
      if (q.category === option.category && !q.isCompleted) {
        const newAmt = q.currentAmount + (option.defaultUnit === q.unit ? amount : 1);
        const isCompleted = newAmt >= q.targetAmount;
        return {
          ...q,
          currentAmount: newAmt,
          isCompleted,
        };
      }
      return q;
    });
    setQuests(updatedQuests);

    // Update Achievements
    const updatedAchievements = achievements.map((ach) => {
      if (!ach.isUnlocked) {
        if (ach.id === 'ach-5' && option.id === 'running') {
          const totalKm = (updatedSubSkills.running?.totalAmount || 0);
          return {
            ...ach,
            currentMetric: totalKm,
            isUnlocked: totalKm >= ach.requiredMetric,
          };
        }
        if (ach.id === 'ach-6' && option.id === 'coding') {
          const totalMin = (updatedSubSkills.coding?.totalAmount || 0);
          return {
            ...ach,
            currentMetric: totalMin,
            isUnlocked: totalMin >= ach.requiredMetric,
          };
        }
      }
      return ach;
    });
    setAchievements(updatedAchievements);

    // Create Log
    const newLog: ActivityLog = {
      id: `log-${Date.now()}`,
      activityId: option.id,
      activityName: option.name,
      category: option.category,
      timestamp: '방금 전',
      amount,
      unit: option.defaultUnit,
      difficulty: difficultyName,
      difficultyMultiplier,
      streakBonus: calculation.streakBonusPercent,
      isVerified,
      earnedExp,
      primaryStat: option.primaryStat,
      primaryExp: calculation.primaryExp,
      secondaryStat: option.secondaryStat,
      secondaryExp: calculation.secondaryExp,
      note,
    };

    setActivityLogs([newLog, ...activityLogs]);
    setShowLogger(false);

    // Trigger Level Up Event
    if (newPlayerInfo.level > oldPlayerInfo.level) {
      setLevelUpEvent({
        statKey: 'PLAYER',
        statName: '플레이어 종합 레벨',
        oldLevel: oldPlayerInfo.level,
        newLevel: newPlayerInfo.level,
        earnedExp,
        nextTargetExp: newPlayerInfo.nextExp - newPlayerInfo.currentExp,
        percentileRank: Math.max(5, 35 - newPlayerInfo.level),
        weeklyMetricSummary: `이번 주 누적 +${profile.weeklyExp + earnedExp} EXP 달성`,
        nextGoalSuggestion: `다음 티어 승급을 위해 주간 퀘스트를 완료해보세요!`,
        isPlayerLevelUp: true,
      });
    } else if (statLevelUpDetected) {
      const nextNeeded =
        updatedStats[statLevelUpDetected.key as CoreStatKey].nextLevelExp -
        updatedStats[statLevelUpDetected.key as CoreStatKey].currentExp;
      setLevelUpEvent({
        statKey: statLevelUpDetected.key,
        statName: statLevelUpDetected.name,
        oldLevel: statLevelUpDetected.oldL,
        newLevel: statLevelUpDetected.newL,
        earnedExp,
        nextTargetExp: nextNeeded,
        percentileRank: Math.max(10, 45 - statLevelUpDetected.newL * 2),
        weeklyMetricSummary: `이번 주 관련 활동 ${updatedSubSkills[option.id]?.totalAmount || amount}${option.defaultUnit} 돌파`,
        nextGoalSuggestion: `내일 추가 활동 시 ${statLevelUpDetected.name} Lv.${statLevelUpDetected.newL + 1} 달성이 눈앞입니다!`,
      });
    }
  };

  // Claim Quest Reward
  const handleClaimQuest = (questId: string) => {
    const q = quests.find((item) => item.id === questId);
    if (!q || q.isClaimed || !q.isCompleted) return;

    const rewardExp = q.expReward;
    const newTotalExp = profile.totalExp + rewardExp;
    const newPlayerInfo = getPlayerLevelFromTotalExp(newTotalExp);

    setProfile({
      ...profile,
      totalExp: newTotalExp,
      playerLevel: newPlayerInfo.level,
      currentLevelExp: newPlayerInfo.currentExp,
      nextLevelExp: newPlayerInfo.nextExp,
      weeklyExp: profile.weeklyExp + rewardExp,
    });

    setQuests(
      quests.map((item) => (item.id === questId ? { ...item, isClaimed: true } : item))
    );
  };

  return (
    <div className="min-h-screen bg-[#050608] text-[#E2E8F0] font-sans antialiased relative selection:bg-orange-500 selection:text-black pb-28">
      {/* Immersive Dual Radial Gradients */}
      <div
        className="fixed inset-0 opacity-25 pointer-events-none z-0"
        style={{
          backgroundImage:
            'radial-gradient(circle at 20% 30%, #4F46E5 0%, transparent 40%), radial-gradient(circle at 80% 70%, #F97316 0%, transparent 40%)',
        }}
      />

      {/* 1. Immersive Header */}
      <header className="sticky top-0 z-40 bg-black/40 backdrop-blur-md border-b border-white/10 px-6 sm:px-8 py-3.5">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-4">
          {/* Left: Avatar Circle + Title from theme */}
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-full border-2 border-orange-500 p-0.5 shadow-[0_0_10px_rgba(249,115,22,0.3)]">
              <div className="w-full h-full rounded-full bg-slate-800 flex items-center justify-center font-bold text-orange-500 font-mono">
                {profile.name.charAt(0)}
              </div>
            </div>
            <div>
              <h1 className="text-base sm:text-lg font-bold tracking-tight text-white uppercase">
                {profile.name} <span className="text-orange-500 ml-1 font-mono">LV.{profile.playerLevel}</span>
              </h1>
              <p className="text-[11px] text-slate-400 uppercase tracking-widest font-semibold">
                Rank: {profile.title}
              </p>
            </div>
          </div>

          {/* Center/Right: Mode Switch & Metrics */}
          <div className="flex items-center gap-4 sm:gap-6">
            <div className="flex items-center bg-white/5 p-1 rounded-xl border border-white/10">
              <button
                onClick={() => setActiveTab('app')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer uppercase tracking-wider ${
                  activeTab === 'app'
                    ? 'bg-orange-500 text-black shadow-[0_0_12px_rgba(249,115,22,0.4)]'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Activity className="w-3.5 h-3.5" />
                <span>APP</span>
              </button>
              <button
                onClick={() => setActiveTab('prd')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer uppercase tracking-wider ${
                  activeTab === 'prd'
                    ? 'bg-orange-500 text-black shadow-[0_0_12px_rgba(249,115,22,0.4)]'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                <span>PRD (23 SECTIONS)</span>
              </button>
            </div>

            <div className="hidden md:flex items-center gap-6">
              <div className="text-right">
                <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">
                  Daily Streak
                </p>
                <p className="text-lg font-mono font-bold text-orange-400">
                  {profile.streakDays} DAYS
                </p>
              </div>

              <div className="w-px h-8 bg-white/10" />

              <div className="text-right">
                <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">
                  Total EXP
                </p>
                <p className="text-lg font-mono font-bold text-white">
                  {profile.totalExp.toLocaleString()}
                </p>
              </div>
            </div>

            <button
              onClick={() => setShowOnboarding(true)}
              className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-orange-400 border border-white/10 transition cursor-pointer"
              title="캐릭터 스탯 온보딩 캘리브레이션"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* 2. Main Content Area */}
      <main className="max-w-6xl mx-auto px-4 sm:px-8 py-6 relative z-10">
        {activeTab === 'app' ? (
          <div className="space-y-6">
            {/* SubTab Navigation */}
            <div className="flex items-center gap-2 border-b border-white/10 pb-2 overflow-x-auto text-xs">
              <button
                onClick={() => setAppSubTab('status')}
                className={`px-4 py-2 rounded-xl font-bold transition flex items-center gap-1.5 whitespace-nowrap cursor-pointer uppercase tracking-wider ${
                  appSubTab === 'status'
                    ? 'bg-orange-500/20 text-orange-400 border border-orange-500/50 shadow-[0_0_10px_rgba(249,115,22,0.2)]'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Activity className="w-4 h-4" />
                <span>STATUS &amp; RADAR</span>
              </button>
              <button
                onClick={() => setAppSubTab('quests')}
                className={`px-4 py-2 rounded-xl font-bold transition flex items-center gap-1.5 whitespace-nowrap cursor-pointer uppercase tracking-wider ${
                  appSubTab === 'quests'
                    ? 'bg-orange-500/20 text-orange-400 border border-orange-500/50 shadow-[0_0_10px_rgba(249,115,22,0.2)]'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Swords className="w-4 h-4" />
                <span>QUESTS &amp; PROGRESS</span>
                {quests.filter((q) => q.isCompleted && !q.isClaimed).length > 0 && (
                  <span className="w-2 h-2 rounded-full bg-orange-400 animate-ping" />
                )}
              </button>
              <button
                onClick={() => setAppSubTab('achievements')}
                className={`px-4 py-2 rounded-xl font-bold transition flex items-center gap-1.5 whitespace-nowrap cursor-pointer uppercase tracking-wider ${
                  appSubTab === 'achievements'
                    ? 'bg-orange-500/20 text-orange-400 border border-orange-500/50 shadow-[0_0_10px_rgba(249,115,22,0.2)]'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Trophy className="w-4 h-4" />
                <span>ACHIEVEMENTS</span>
              </button>
              <button
                onClick={() => setAppSubTab('history')}
                className={`px-4 py-2 rounded-xl font-bold transition flex items-center gap-1.5 whitespace-nowrap cursor-pointer uppercase tracking-wider ${
                  appSubTab === 'history'
                    ? 'bg-orange-500/20 text-orange-400 border border-orange-500/50 shadow-[0_0_10px_rgba(249,115,22,0.2)]'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <History className="w-4 h-4" />
                <span>LOG FEED ({activityLogs.length})</span>
              </button>
            </div>

            {/* Views */}
            {appSubTab === 'status' && (
              <StatusWindow
                profile={profile}
                onOpenLogger={() => setShowLogger(true)}
                onOpenTitles={() => setShowTitles(true)}
              />
            )}

            {appSubTab === 'quests' && (
              <QuestList
                quests={quests}
                onClaimQuest={handleClaimQuest}
                onStartQuestAction={() => setShowLogger(true)}
              />
            )}

            {appSubTab === 'achievements' && (
              <AchievementList
                achievements={achievements}
                equippedTitle={profile.title}
                onEquipTitle={(t) => setProfile({ ...profile, title: t })}
              />
            )}

            {appSubTab === 'history' && (
              <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-sm space-y-4">
                <div className="flex items-center justify-between border-b border-white/10 pb-3">
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                    <History className="w-4 h-4 text-orange-400" />
                    <span>Real-Time Activity Feed</span>
                  </h3>
                  <span className="text-xs font-mono text-slate-400">Total {activityLogs.length} Records</span>
                </div>

                <div className="space-y-2.5">
                  {activityLogs.map((log) => (
                    <div
                      key={log.id}
                      className="p-4 rounded-xl bg-black/40 border border-white/10 flex items-center justify-between gap-3 text-xs hover:border-white/20 transition"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-white text-sm">{log.activityName}</span>
                          <span className="text-[10px] text-slate-500 font-mono">{log.timestamp}</span>
                          {log.isVerified && (
                            <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-emerald-500/20 text-emerald-300 font-mono">
                              VERIFIED
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-400 mt-1">
                          {log.amount}{log.unit} • {log.difficulty} • Streak +{log.streakBonus}%
                        </p>
                      </div>

                      <div className="text-right">
                        <span className="text-sm font-black font-mono text-orange-400 block">
                          +{log.earnedExp} EXP
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">
                          {log.primaryStat} +{log.primaryExp}
                          {log.secondaryStat && ` • ${log.secondaryStat} +${log.secondaryExp}`}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <PRDViewer />
        )}
      </main>

      {/* 3. Immersive Bottom Action Footer matching Design Theme */}
      <footer className="fixed bottom-0 left-0 right-0 h-20 bg-black/80 backdrop-blur-md border-t border-white/10 px-4 flex items-center justify-center gap-3 sm:gap-4 z-40">
        <button
          onClick={() => {
            setActiveTab('app');
            setAppSubTab('quests');
          }}
          className="px-4 sm:px-6 h-11 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 flex items-center gap-2 text-xs font-bold transition cursor-pointer text-slate-300"
        >
          <span className="text-orange-400">⚔️</span>
          <span className="hidden sm:inline">DAILY</span> QUESTS
        </button>

        <button
          onClick={() => setShowLogger(true)}
          className="px-8 sm:px-12 h-12 bg-orange-500 hover:bg-orange-400 text-black font-black italic tracking-wider rounded-xl shadow-[0_0_20px_rgba(249,115,22,0.4)] flex items-center gap-2 transform active:scale-95 transition-all cursor-pointer text-xs sm:text-sm"
        >
          <Zap className="w-4 h-4 fill-black stroke-black" />
          <span>RECORD MISSION</span>
        </button>

        <button
          onClick={() => {
            setActiveTab('app');
            setAppSubTab('status');
          }}
          className="px-4 sm:px-6 h-11 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 flex items-center gap-2 text-xs font-bold transition cursor-pointer text-slate-300"
        >
          <span className="text-orange-400">★</span>
          <span>STATUS TREE</span>
        </button>
      </footer>

      {/* Modals */}
      {showLogger && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto animate-in fade-in">
          <div className="w-full max-w-2xl my-auto">
            <ActivityLogger
              streakDays={profile.streakDays}
              onLogActivity={handleLogActivity}
              onClose={() => setShowLogger(false)}
            />
          </div>
        </div>
      )}

      {levelUpEvent && (
        <LevelUpModal
          event={levelUpEvent}
          onClose={() => setLevelUpEvent(null)}
        />
      )}

      {showTitles && (
        <TitleModal
          unlockedTitles={profile.unlockedTitles}
          equippedTitle={profile.title}
          onSelectTitle={(t) => setProfile({ ...profile, title: t })}
          onClose={() => setShowTitles(false)}
        />
      )}

      {showOnboarding && (
        <OnboardingModal
          onComplete={(calibrated) => {
            setProfile({ ...profile, ...calibrated });
            setShowOnboarding(false);
          }}
          onClose={() => setShowOnboarding(false)}
        />
      )}
    </div>
  );
}
