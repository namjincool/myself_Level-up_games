import React, { useState } from 'react';
import {
  Award,
  BookOpen,
  Brain,
  Calendar,
  Check,
  ChevronRight,
  Clock,
  Dumbbell,
  Flame,
  Footprints,
  Plus,
  Shield,
  Sparkles,
  Swords,
  Target,
  Users,
  Zap,
  type LucideIcon,
} from 'lucide-react';
import { CORE_STATS_META } from '../data/categories';
import { getWeekdayLabel } from '../data/dailyQuests';
import { Quest } from '../types';
import { formatUnitLabel } from '../utils/questProgress';

interface QuestListProps {
  quests: Quest[];
  streakShieldCount: number;
  onClaimQuest: (questId: string) => void;
  onStartQuestAction: (quest: Quest) => void;
}

const QUEST_ICON_MAP: Record<string, LucideIcon> = {
  Award,
  BookOpen,
  Brain,
  Calendar,
  Dumbbell,
  Flame,
  Footprints,
  Shield,
  Sparkles,
  Swords,
  Target,
  Users,
  Zap,
};

export const QuestList: React.FC<QuestListProps> = ({
  quests,
  streakShieldCount,
  onClaimQuest,
  onStartQuestAction,
}) => {
  const [questTab, setQuestTab] = useState<'daily' | 'weekly' | 'challenge'>('daily');

  const filteredQuests = quests.filter((q) => q.type === questTab);
  const completedCount = filteredQuests.filter((q) => q.isCompleted).length;

  const weeklyBars = [
    { day: 'Mon', height: 40, active: false },
    { day: 'Tue', height: 65, active: false },
    { day: 'Wed', height: 85, active: true },
    { day: 'Thu', height: 30, active: false },
    { day: 'Fri', height: 95, active: true },
    { day: 'Sat', height: 50, active: false },
    { day: 'Sun', height: 10, active: false },
  ];

  return (
    <div className="space-y-6">
      {/* Top Tabs */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-white/10 pb-3">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-orange-500/20 border border-orange-500/40 text-orange-400">
            <Swords className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white tracking-tight uppercase">
              MISSION QUEST LOG
            </h2>
            <p className="text-xs leading-5 text-slate-400">
              {questTab === 'daily'
                ? filteredQuests[0]
                  ? `${getWeekdayLabel(filteredQuests[0].dayOfWeek)}의 퀘스트입니다. 평일마다 목표가 달라집니다.`
                  : '토·일은 주중 퀘스트를 쉬고 다음 월요일에 새 목표가 열립니다.'
                : '규칙적인 퀘스트를 완료하고 보상과 능력치 EXP를 확인하세요.'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 bg-black/40 p-1 rounded-xl border border-white/10">
          {(
            [
              { id: 'daily', label: 'DAILY', count: quests.filter((q) => q.type === 'daily').length },
              { id: 'weekly', label: 'WEEKLY', count: quests.filter((q) => q.type === 'weekly').length },
              { id: 'challenge', label: 'EPIC 30D', count: quests.filter((q) => q.type === 'challenge').length },
            ] as const
          ).map((tab) => (
            <button
              key={tab.id}
              onClick={() => setQuestTab(tab.id)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer uppercase tracking-wider ${
                questTab === tab.id
                  ? 'bg-orange-500 text-black shadow-[0_0_12px_rgba(249,115,22,0.3)]'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <span>{tab.label}</span>
              <span
                className={`px-1.5 py-0.2 rounded text-[10px] font-mono ${
                  questTab === tab.id ? 'bg-black/20 text-black' : 'bg-white/10 text-slate-400'
                }`}
              >
                {tab.count}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Main Grid: Quests Left + Weekly Progress Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Quest Items List */}
        <div className="lg:col-span-7 bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-sm space-y-4">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">
              Active Missions
            </h3>
            <span className="text-[10px] bg-orange-500 px-2 py-0.5 rounded text-black font-bold font-mono">
              {completedCount}/{filteredQuests.length} DONE
            </span>
          </div>

          <div className="space-y-3">
            {filteredQuests.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-white/15 bg-black/20 px-4 py-10 text-center">
                <Calendar className="mx-auto h-8 w-8 text-slate-600" aria-hidden="true" />
                <p className="mt-3 text-sm font-semibold text-slate-300">오늘은 일일 퀘스트 휴식일입니다.</p>
                <p className="mt-1 text-xs leading-5 text-slate-500">주간 퀘스트는 언제든 계속 진행할 수 있습니다.</p>
              </div>
            ) : filteredQuests.map((quest) => {
              const progress = Math.min(
                100,
                Math.round((quest.currentAmount / quest.targetAmount) * 100)
              );
              const QuestIcon = QUEST_ICON_MAP[quest.icon] || Sparkles;
              const rewardStat = CORE_STATS_META[quest.statReward];

              return (
                <div
                  key={quest.id}
                  className={`p-4 rounded-xl border transition flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                    quest.isClaimed
                      ? 'bg-black/40 border-white/5 opacity-50'
                      : quest.isCompleted
                      ? 'bg-orange-500/10 border-orange-500/40 shadow-sm'
                      : 'bg-white/5 border-white/10 hover:border-white/20'
                  }`}
                >
                  <div className="flex min-w-0 flex-1 items-start gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-orange-500/30 bg-orange-500/10 text-orange-300">
                      <QuestIcon className="h-4 w-4" aria-hidden="true" />
                    </div>
                    <div className="min-w-0 flex-1 space-y-1.5">
                    <div className="flex items-start gap-2">
                      <div
                        className={`w-5 h-5 rounded border flex items-center justify-center text-xs shrink-0 ${
                          quest.isCompleted
                            ? 'bg-orange-500 border-orange-400 text-black font-black'
                            : 'border-orange-500/50 bg-black/40'
                        }`}
                      >
                        {quest.isCompleted && '✓'}
                      </div>
                      <h4
                        className={`text-sm font-bold ${
                          quest.isClaimed
                            ? 'line-through text-slate-500'
                            : quest.isCompleted
                            ? 'text-orange-300'
                            : 'text-white'
                        }`}
                      >
                        <span className="break-words">{quest.title}</span>
                      </h4>
                    </div>

                    <p className="pl-7 text-xs leading-5 text-slate-400">{quest.description || '실제 행동을 기록하면 이 퀘스트의 진행도가 올라갑니다.'}</p>

                    {/* Progress bar */}
                    <div className="pl-7 pt-1 space-y-1">
                      <div className="flex justify-between text-[10px] font-mono text-slate-400">
                        <span>
                          {quest.currentAmount} / {quest.targetAmount} {formatUnitLabel(quest.unit)}
                        </span>
                        <span>{progress}%</span>
                      </div>
                      <div className="w-full bg-black/40 h-1.5 rounded-full overflow-hidden border border-white/5">
                        <div
                          className="h-full bg-gradient-to-r from-orange-500 to-amber-400 rounded-full transition-all duration-500"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                    </div>
                    </div>
                  </div>

                  {/* Reward & Action */}
                  <div className="flex sm:flex-col items-center sm:items-end justify-between gap-2 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-white/10 pl-7 sm:pl-0">
                    <span className="text-right text-xs font-mono font-bold text-orange-400">
                      <span className="block">+{quest.expReward} EXP</span>
                      <span className="mt-0.5 block text-[10px] font-semibold text-slate-400">{rewardStat?.nameKr || quest.statReward} EXP</span>
                    </span>

                    {quest.isClaimed ? (
                      <span className="px-3 py-1 rounded-lg text-[11px] font-bold bg-white/5 text-slate-500 font-mono">
                        CLAIMED
                      </span>
                    ) : quest.isCompleted ? (
                      <button
                        onClick={() => onClaimQuest(quest.id)}
                        className="px-3.5 py-1.5 rounded-lg text-xs font-bold bg-orange-500 hover:bg-orange-400 text-black shadow-[0_0_10px_rgba(249,115,22,0.4)] transition cursor-pointer font-mono"
                      >
                        CLAIM REWARD
                      </button>
                    ) : (
                      <button
                        onClick={() => onStartQuestAction(quest)}
                        className="px-3 py-1 rounded-lg text-xs font-semibold bg-white/10 hover:bg-white/20 text-slate-200 border border-white/10 transition cursor-pointer"
                      >
                        START MISSION &rarr;
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Weekly Progress Activity Bars & Streak Booster */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          {/* Weekly Progress Bars from Theme */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-sm">
            <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-6">
              Weekly Progress
            </h2>

            <div className="flex items-end justify-between h-36 gap-2">
              {weeklyBars.map((bar) => (
                <div key={bar.day} className="w-full bg-orange-500/15 rounded-t-md relative h-full flex items-end">
                  <div
                    className={`w-full rounded-t-sm transition-all duration-700 ${
                      bar.active
                        ? 'bg-orange-500 shadow-[0_0_12px_rgba(249,115,22,0.6)]'
                        : 'bg-orange-500/60'
                    }`}
                    style={{ height: `${bar.height}%` }}
                  />
                </div>
              ))}
            </div>

            <div className="flex justify-between mt-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest font-mono">
              <span>Mon</span>
              <span>Tue</span>
              <span className="text-orange-400">Wed</span>
              <span>Thu</span>
              <span className="text-orange-400">Fri</span>
              <span>Sat</span>
              <span>Sun</span>
            </div>
          </div>

          {/* Habit Shield System Card */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-5 backdrop-blur-sm space-y-2.5">
            <div className="flex items-center gap-2 text-orange-400">
              <Shield className="w-4 h-4" />
              <h4 className="text-xs font-bold uppercase tracking-wider text-white">
                Streak Shield Protection
              </h4>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              피치 못할 사정으로 하루를 쉬어가도 연속 기록이 끊어지지 않도록 주 1회 스트릭 쉴드가 자동 지원됩니다.
            </p>
            <div className="flex items-center justify-between pt-1 text-[11px] font-mono text-slate-300 border-t border-white/10">
              <span>보유 쉴드: {streakShieldCount}회 이용 가능</span>
              <span className={`font-bold ${streakShieldCount > 0 ? 'text-emerald-400' : 'text-slate-500'}`}>
                {streakShieldCount > 0 ? 'READY' : 'USED'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
