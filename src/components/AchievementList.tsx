import React, { useState } from 'react';
import {
  Award,
  BookMarked,
  BookOpen,
  Brain,
  Code,
  Check,
  Flame,
  Lock,
  Medal,
  ShieldCheck,
  Sparkles,
  Target,
  Trophy,
  Zap,
} from 'lucide-react';

interface Achievement {
  id: string;
  title?: string;
  name?: string;
  description: string;
  category: string;
  rewardTitle?: string;
  unlockedTitleReward?: string;
  rewardExp?: number;
  expReward?: number;
  isUnlocked: boolean;
  requiredMetric: number;
  currentMetric: number;
  unit?: string;
  icon: string;
}

interface AchievementListProps {
  achievements: Achievement[];
  equippedTitle: string;
  onEquipTitle: (title: string) => void;
}

const achievementIconMap = {
  Award,
  BookMarked,
  BookOpen,
  Brain,
  Code,
  Flame,
  Medal,
  ShieldCheck,
  Sparkles,
  Target,
  Trophy,
  Zap,
} as const;

const AchievementIcon: React.FC<{ name: string; className?: string }> = ({ name, className = '' }) => {
  const Icon = achievementIconMap[name as keyof typeof achievementIconMap];
  return Icon ? <Icon className={className} aria-hidden="true" /> : <Sparkles className={className} aria-hidden="true" />;
};

export const AchievementList: React.FC<AchievementListProps> = ({
  achievements,
  equippedTitle,
  onEquipTitle,
}) => {
  const [filterCategory, setFilterCategory] = useState<string>('all');

  const filtered = achievements.filter(
    (a) => filterCategory === 'all' || a.category === filterCategory
  );

  const unlockedCount = achievements.filter((a) => a.isUnlocked).length;

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-white/10 pb-3">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-orange-500/20 border border-orange-500/40 text-orange-400">
            <Trophy className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white tracking-tight uppercase">
              ACHIEVEMENTS &amp; TITLES
            </h2>
            <p className="text-xs text-slate-400">
              인생의 주요 마일스톤을 돌파하고 전설적인 칭호와 명예를 장착하세요.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-mono text-slate-400">
            진행도: <strong className="text-orange-400 font-bold">{unlockedCount} / {achievements.length}</strong> 해금
          </span>
        </div>
      </div>

      {/* Badges showcase section matching design theme */}
      <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-sm">
        <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">
          Unlocked Badge Hall
        </h2>
        <div className="flex gap-3 flex-wrap">
          {achievements
            .filter((a) => a.isUnlocked)
            .map((a) => {
              const rewardTitle = a.rewardTitle ?? a.unlockedTitleReward ?? '칭호 없음';
              const rewardExp = a.rewardExp ?? a.expReward ?? 0;
              const displayTitle = a.title ?? a.name ?? '이름 없는 업적';
              return (
                <div
                  key={a.id}
                  className="flex items-center gap-2.5 px-3 py-2 rounded-xl bg-black/40 border border-orange-500/40 shadow-sm"
                  title={displayTitle}
                >
                  <div className="w-8 h-8 rounded-lg bg-orange-500/20 border border-orange-500/50 flex items-center justify-center text-base text-orange-300">
                    <AchievementIcon name={a.icon} className="w-4 h-4 shrink-0" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-white block">[{rewardTitle}]</span>
                    <span className="text-[10px] text-orange-400 font-mono">+{rewardExp} EXP</span>
                  </div>
                </div>
              );
            })}
        </div>
      </div>

      {/* Grid of Achievement Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map((ach) => {
          const displayTitle = ach.title ?? ach.name ?? '이름 없는 업적';
          const rewardTitle = ach.rewardTitle ?? ach.unlockedTitleReward ?? '칭호 없음';
          const rewardExp = ach.rewardExp ?? ach.expReward ?? 0;
          const progress = Math.min(
            100,
            Math.round((ach.currentMetric / ach.requiredMetric) * 100)
          );
          const isEquipped = equippedTitle === rewardTitle;

          return (
            <div
              key={ach.id}
              className={`p-5 rounded-2xl border transition backdrop-blur-sm ${
                ach.isUnlocked
                  ? 'bg-white/5 border-orange-500/30 hover:border-orange-500/60'
                  : 'bg-black/30 border-white/5 opacity-70'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div
                    className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl shrink-0 border ${
                      ach.isUnlocked
                        ? 'bg-orange-500/20 border-orange-500/50 shadow-[0_0_10px_rgba(249,115,22,0.3)]'
                        : 'bg-black/60 border-white/10 text-slate-600'
                    }`}
                  >
                    {ach.isUnlocked ? (
                      <AchievementIcon name={ach.icon} className="w-5 h-5 shrink-0 text-orange-300" />
                    ) : (
                      <Lock className="w-5 h-5 text-slate-600" aria-hidden="true" />
                    )}
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                        <h4 className="text-sm font-bold text-white">{displayTitle}</h4>
                      {ach.isUnlocked && (
                        <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-orange-500/20 text-orange-400">
                          UNLOCKED
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-400 mt-1">{ach.description}</p>
                    <span className="text-[11px] font-mono text-orange-400 block mt-1">
                      보상: [{rewardTitle}] 칭호 + {rewardExp} EXP
                    </span>
                  </div>
                </div>
              </div>

              {/* Progress Bar & Equip Button */}
              <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between gap-4">
                <div className="flex-1">
                  <div className="flex justify-between text-[10px] font-mono text-slate-400 mb-1">
                    <span>
                      {ach.currentMetric} / {ach.requiredMetric}{ach.unit ? ` ${ach.unit}` : ''}
                    </span>
                    <span>{progress}%</span>
                  </div>
                  <div className="w-full bg-black/50 h-1.5 rounded-full overflow-hidden border border-white/5">
                    <div
                      className={`h-full rounded-full ${
                        ach.isUnlocked ? 'bg-orange-500' : 'bg-slate-700'
                      }`}
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>

                {ach.isUnlocked && (
                  <button
                    type="button"
                    onClick={() => onEquipTitle(rewardTitle)}
                    className={`achievement-equip-button px-3 py-1.5 rounded-xl text-xs font-bold font-mono transition cursor-pointer shrink-0 ${
                      isEquipped
                        ? 'bg-orange-500 text-black shadow-sm'
                        : 'bg-white/10 hover:bg-white/20 text-white'
                    }`}
                  >
                    {isEquipped ? 'EQUIPPED' : 'EQUIP TITLE'}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
