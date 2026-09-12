import React from 'react';
import { Activity, Leaf, Sprout, TreePine } from 'lucide-react';
import { ActivityLog, CoreStatKey, UserProfile } from '../types';

interface StatusTreeProps {
  profile: UserProfile;
  activityLogs: ActivityLog[];
}

type BranchConfig = {
  key: CoreStatKey;
  label: string;
  color: string;
  left: string;
  bottom: string;
  width: number;
  rotate: number;
};

const BRANCHES: BranchConfig[] = [
  { key: 'VIT', label: '신체', color: 'bg-rose-400', left: '7%', bottom: '42%', width: 34, rotate: -24 },
  { key: 'END', label: '지구력', color: 'bg-orange-400', left: '12%', bottom: '58%', width: 30, rotate: -40 },
  { key: 'FOC', label: '몰입', color: 'bg-amber-300', left: '31%', bottom: '69%', width: 30, rotate: -58 },
  { key: 'INT', label: '지식', color: 'bg-cyan-300', left: '57%', bottom: '68%', width: 31, rotate: -122 },
  { key: 'MEN', label: '멘탈', color: 'bg-violet-300', left: '67%', bottom: '54%', width: 31, rotate: -142 },
  { key: 'FIN', label: '자산', color: 'bg-emerald-300', left: '71%', bottom: '40%', width: 34, rotate: -158 },
  { key: 'SOC', label: '관계', color: 'bg-indigo-300', left: '42%', bottom: '78%', width: 27, rotate: -90 },
];

const getTreeStage = (level: number) => {
  if (level >= 20) {
    return {
      name: '풍성한 생명의 나무',
      description: '여러 영역의 성장이 서로 연결되어 큰 그늘을 만들고 있습니다.',
      progress: 100,
      trunkHeight: 82,
      trunkWidth: 15,
      canopy: 'bg-emerald-400/20 shadow-[0_0_45px_rgba(52,211,153,0.35)]',
      icon: TreePine,
    };
  }
  if (level >= 10) {
    return {
      name: '성장한 나무',
      description: '꾸준한 기록이 줄기와 가지를 단단하게 만들고 있습니다.',
      progress: 78,
      trunkHeight: 70,
      trunkWidth: 13,
      canopy: 'bg-lime-400/15 shadow-[0_0_38px_rgba(163,230,53,0.3)]',
      icon: TreePine,
    };
  }
  if (level >= 5) {
    return {
      name: '어린 나무',
      description: '작은 습관들이 뿌리를 내리고 새로운 가지로 뻗어갑니다.',
      progress: 55,
      trunkHeight: 58,
      trunkWidth: 10,
      canopy: 'bg-green-400/10 shadow-[0_0_30px_rgba(74,222,128,0.25)]',
      icon: Sprout,
    };
  }
  if (level >= 2) {
    return {
      name: '새싹',
      description: '첫 행동들이 싹을 틔웠습니다. 다음 기록이 첫 가지가 됩니다.',
      progress: 30,
      trunkHeight: 44,
      trunkWidth: 7,
      canopy: 'bg-lime-300/10 shadow-[0_0_22px_rgba(190,242,100,0.2)]',
      icon: Sprout,
    };
  }
  return {
    name: '성장의 씨앗',
    description: '아직 비어 있는 나무입니다. 첫 활동 기록이 성장의 시작이 됩니다.',
    progress: 8,
    trunkHeight: 30,
    trunkWidth: 5,
    canopy: 'bg-orange-300/5 shadow-[0_0_18px_rgba(251,191,36,0.15)]',
    icon: Leaf,
  };
};

export const StatusTree: React.FC<StatusTreeProps> = ({ profile, activityLogs }) => {
  const playerLevel = Math.max(1, profile.playerLevel || 1);
  const stage = getTreeStage(playerLevel);
  const StageIcon = stage.icon;
  const statValues = Object.values(profile.coreStats) as UserProfile['coreStats'][CoreStatKey][];
  const averageStatLevel = Math.round(
    statValues.reduce((total, stat) => total + stat.level, 0) / Math.max(1, statValues.length),
  );

  return (
    <section className="rounded-2xl border border-emerald-500/20 bg-gradient-to-br from-emerald-950/30 via-white/[0.04] to-indigo-950/20 p-5 shadow-xl overflow-hidden">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 text-emerald-300">
            <TreePine className="h-4 w-4" />
            <span className="text-[11px] font-bold uppercase tracking-[0.18em]">Status Tree</span>
          </div>
          <h2 className="mt-1 text-lg font-black text-white">나의 성장 나무</h2>
          <p className="mt-1 text-xs leading-5 text-slate-400">{stage.description}</p>
        </div>
        <div className="rounded-xl border border-emerald-400/20 bg-black/20 px-3 py-2 text-right">
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Stage</p>
          <p className="mt-0.5 text-sm font-black text-emerald-300">Lv.{playerLevel}</p>
        </div>
      </div>

      <div className="relative mt-5 h-[18rem] overflow-hidden rounded-2xl border border-white/10 bg-black/20">
        <div className={`absolute left-1/2 top-6 h-28 w-56 -translate-x-1/2 rounded-full blur-3xl transition-all duration-700 ${stage.canopy}`} />
        <div className="absolute bottom-5 left-1/2 h-5 w-44 -translate-x-1/2 rounded-[50%] bg-emerald-950/80 blur-sm" />

        {BRANCHES.map((branch) => {
          const stat = profile.coreStats[branch.key];
          const statLevel = stat?.level || 1;
          const leafCount = playerLevel <= 1 ? 0 : Math.min(5, Math.max(1, Math.ceil((statLevel - 1) / 2)));
          const branchScale = Math.min(1, 0.45 + statLevel / 18);

          return (
            <div key={branch.key} className="absolute inset-0 pointer-events-none">
              <div
                className={`absolute h-1 origin-left rounded-full ${branch.color} transition-all duration-700`}
                style={{
                  left: branch.left,
                  bottom: branch.bottom,
                  width: `${branch.width}%`,
                  opacity: Math.min(1, 0.35 + statLevel / 14),
                  transform: `rotate(${branch.rotate}deg) scaleX(${branchScale})`,
                }}
              />
              <div
                className="absolute flex items-center gap-0.5 transition-all duration-700"
                style={{
                  left: `calc(${branch.left} + ${branch.width * 0.78}%)`,
                  bottom: `calc(${branch.bottom} + ${Math.sin((branch.rotate * Math.PI) / 180) * branch.width * 0.28}%)`,
                  opacity: leafCount > 0 ? Math.min(1, 0.45 + statLevel / 12) : 0.3,
                  transform: `rotate(${branch.rotate / 2}deg)`,
                }}
              >
                {Array.from({ length: leafCount }).map((_, index) => (
                  <span
                    key={`${branch.key}-leaf-${index}`}
                    className={`block h-2.5 w-4 rounded-full ${branch.color} shadow-[0_0_8px_currentColor] transition-all duration-700`}
                    style={{ transform: `rotate(${index % 2 === 0 ? -28 : 28}deg) scale(${1 - index * 0.08})` }}
                  />
                ))}
              </div>
            </div>
          );
        })}

        <div
          className="absolute bottom-5 left-1/2 -translate-x-1/2 rounded-t-[45%] rounded-b-xl bg-gradient-to-r from-amber-950 via-amber-700 to-amber-950 shadow-[0_0_16px_rgba(180,83,9,0.25)] transition-all duration-700"
          style={{ height: `${stage.trunkHeight}%`, width: `${stage.trunkWidth}%` }}
        />
        <div className="absolute bottom-5 left-1/2 h-2 w-32 -translate-x-1/2 rounded-full bg-amber-950/80" />

        <div className="absolute bottom-8 left-1/2 flex -translate-x-1/2 flex-col items-center gap-2 text-center">
          <div className="flex h-10 w-10 items-center justify-center rounded-full border border-emerald-300/50 bg-emerald-950/80 text-emerald-300 shadow-lg transition-all duration-700">
            <StageIcon className="h-5 w-5" />
          </div>
          <span className="rounded-full border border-white/10 bg-black/60 px-2.5 py-1 text-[10px] font-bold text-white backdrop-blur-sm">
            {stage.name}
          </span>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-3 gap-2 text-center">
        <div className="rounded-xl border border-white/10 bg-black/20 p-2">
          <p className="text-[10px] text-slate-500">활동 기록</p>
          <p className="mt-1 font-mono text-sm font-black text-white">{activityLogs.length}</p>
        </div>
        <div className="rounded-xl border border-white/10 bg-black/20 p-2">
          <p className="text-[10px] text-slate-500">평균 스탯</p>
          <p className="mt-1 font-mono text-sm font-black text-white">Lv.{averageStatLevel}</p>
        </div>
        <div className="rounded-xl border border-white/10 bg-black/20 p-2">
          <p className="text-[10px] text-slate-500">성장 단계</p>
          <p className="mt-1 font-mono text-sm font-black text-emerald-300">{stage.progress}%</p>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {BRANCHES.map((branch) => {
          const stat = profile.coreStats[branch.key];
          return (
            <span key={branch.key} className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-black/20 px-2 py-1 text-[10px] text-slate-300">
              <span className={`h-1.5 w-1.5 rounded-full ${branch.color}`} />
              {branch.label} Lv.{stat?.level || 1}
            </span>
          );
        })}
      </div>

      {playerLevel <= 1 && activityLogs.length === 0 && (
        <div className="mt-3 flex items-center gap-2 text-[11px] text-emerald-200/70">
          <Activity className="h-3.5 w-3.5" />
          첫 활동을 기록하면 나무에 첫 잎이 자랍니다.
        </div>
      )}
    </section>
  );
};
