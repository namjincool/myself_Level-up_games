import React, { useState } from 'react';
import {
  Award,
  ChevronDown,
  ChevronUp,
  Cpu,
  Dumbbell,
  Flame,
  Footprints,
  HeartHandshake,
  Shield,
  Sparkles,
  Target,
  TrendingUp,
  Brain,
  Coins,
  Share2,
  Zap,
} from 'lucide-react';
import { CoreStatKey, SubSkill, UserProfile } from '../types';
import { getTierColor } from '../utils/expCalculator';
import { RadarChart } from './RadarChart';

interface StatusWindowProps {
  profile: UserProfile;
  onOpenLogger: () => void;
  onOpenTitles: () => void;
}

export const StatusWindow: React.FC<StatusWindowProps> = ({
  profile,
  onOpenLogger,
  onOpenTitles,
}) => {
  const [expandedStat, setExpandedStat] = useState<CoreStatKey | null>('END');
  const [viewMode, setViewMode] = useState<'radar' | 'cards'>('radar');

  const getStatBarColor = (key: CoreStatKey) => {
    switch (key) {
      case 'VIT':
        return 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]';
      case 'END':
        return 'bg-orange-500 shadow-[0_0_8px_rgba(249,115,22,0.5)]';
      case 'FOC':
        return 'bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.5)]';
      case 'INT':
        return 'bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]';
      case 'MEN':
        return 'bg-purple-500 shadow-[0_0_8px_rgba(168,85,247,0.5)]';
      case 'FIN':
        return 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]';
      case 'SOC':
        return 'bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.5)]';
      default:
        return 'bg-orange-500';
    }
  };

  const getStatIcon = (key: CoreStatKey) => {
    switch (key) {
      case 'VIT':
        return <Dumbbell className="w-4 h-4 text-red-400" />;
      case 'END':
        return <Footprints className="w-4 h-4 text-orange-400" />;
      case 'FOC':
        return <Target className="w-4 h-4 text-amber-400" />;
      case 'INT':
        return <Cpu className="w-4 h-4 text-blue-400" />;
      case 'MEN':
        return <Brain className="w-4 h-4 text-purple-400" />;
      case 'FIN':
        return <Coins className="w-4 h-4 text-green-400" />;
      case 'SOC':
        return <HeartHandshake className="w-4 h-4 text-indigo-400" />;
      default:
        return <Sparkles className="w-4 h-4 text-orange-400" />;
    }
  };

  const statKeys: CoreStatKey[] = ['VIT', 'END', 'FOC', 'INT', 'MEN', 'FIN', 'SOC'];
  const expPercent = Math.min(100, Math.round((profile.currentLevelExp / profile.nextLevelExp) * 100));

  return (
    <div className="space-y-6">
      {/* 1. Immersive Hero Profile Card */}
      <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-md relative overflow-hidden shadow-xl">
        <div className="absolute top-0 right-0 w-64 h-64 bg-orange-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            {/* Avatar with orange border from theme */}
            <div className="w-14 h-14 rounded-full border-2 border-orange-500 p-0.5 shrink-0 shadow-[0_0_12px_rgba(249,115,22,0.35)]">
              <div className="w-full h-full rounded-full bg-slate-900 flex items-center justify-center font-black text-xl text-orange-500 font-mono">
                {profile.name.charAt(0)}
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold tracking-tight text-white uppercase">
                  {profile.name} <span className="text-orange-500 ml-1 font-mono">LV.{profile.playerLevel}</span>
                </h1>
                <button
                  onClick={onOpenTitles}
                  className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-orange-500/15 text-orange-400 border border-orange-500/40 hover:bg-orange-500/25 transition cursor-pointer flex items-center gap-1"
                >
                  <Award className="w-2.5 h-2.5" />
                  {profile.title}
                </button>
              </div>
              <p className="text-xs text-slate-400 uppercase tracking-widest font-semibold mt-1">
                Tier Rank: <span className="text-white font-bold">{profile.rankTier.toUpperCase()} CLASS</span>
              </p>
            </div>
          </div>

          {/* Right Metrics in Header */}
          <div className="flex items-center gap-6 self-end md:self-auto pt-2 md:pt-0 border-t md:border-t-0 border-white/10 w-full md:w-auto justify-between md:justify-end">
            <div className="text-left md:text-right">
              <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">Daily Streak</p>
              <p className="text-xl font-mono font-bold text-orange-400 flex items-center gap-1.5 md:justify-end">
                <Flame className="w-4 h-4 fill-orange-500 text-orange-400 animate-pulse" />
                {profile.streakDays} DAYS
              </p>
            </div>

            <div className="w-px h-10 bg-white/10"></div>

            <div className="text-right">
              <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">Total EXP</p>
              <p className="text-xl font-mono font-bold text-white tracking-tight">
                {profile.totalExp.toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        {/* Level EXP Progress Bar */}
        <div className="mt-5 pt-4 border-t border-white/10">
          <div className="flex items-center justify-between text-xs mb-2 font-mono">
            <span className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">
              Level Progression ({profile.currentLevelExp} / {profile.nextLevelExp} EXP)
            </span>
            <span className="font-bold text-orange-400">{expPercent}%</span>
          </div>
          <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden border border-white/10 p-0.5">
            <div
              className="h-full rounded-full bg-gradient-to-r from-orange-500 to-amber-400 shadow-[0_0_10px_rgba(249,115,22,0.5)] transition-all duration-700 ease-out"
              style={{ width: `${expPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* 2. Core Attributes Grid & Radar */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Radar Chart and Summary Bars */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-sm flex flex-col items-center">
            <div className="w-full flex items-center justify-between mb-4">
              <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                Core Attributes
              </h2>
              <div className="flex items-center gap-1 bg-black/40 p-1 rounded-lg border border-white/10">
                <button
                  onClick={() => setViewMode('radar')}
                  className={`px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider transition ${
                    viewMode === 'radar' ? 'bg-orange-500 text-black' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Radar
                </button>
                <button
                  onClick={() => setViewMode('cards')}
                  className={`px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider transition ${
                    viewMode === 'cards' ? 'bg-orange-500 text-black' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Bars
                </button>
              </div>
            </div>

            {viewMode === 'radar' ? (
              <RadarChart stats={profile.coreStats} maxLevelReference={25} />
            ) : (
              <div className="w-full space-y-3.5 my-2">
                {statKeys.map((key) => {
                  const stat = profile.coreStats[key];
                  const statNorm = Math.min(100, Math.round(((stat?.level || 1) / 25) * 100));
                  return (
                    <div key={key} className="space-y-1">
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-slate-400 font-medium">{stat.nameKr}</span>
                        <span className="font-mono font-bold text-white">Lv.{stat.level}</span>
                      </div>
                      <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden border border-white/5">
                        <div
                          className={`h-full rounded-full ${getStatBarColor(key)}`}
                          style={{ width: `${statNorm}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Quick Subskill Highlights */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-5 backdrop-blur-sm">
            <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">
              Active Sub-Skills
            </h2>
            <div className="flex flex-wrap gap-2">
              {(Object.values(profile.subSkills) as SubSkill[]).map((sub) => (
                <div
                  key={sub.id}
                  className="px-3 py-1.5 rounded-xl bg-black/40 border border-white/10 flex items-center gap-2 text-xs"
                >
                  <span className="text-slate-300 font-medium">{sub.name.split(' ')[0]}</span>
                  <span className="text-orange-400 font-mono font-bold">Lv.{sub.level}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Detailed Attribute Cards with Sub-skill Trees */}
        <div className="lg:col-span-7 flex flex-col gap-3">
          <div className="flex items-center justify-between px-1 mb-1">
            <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5 text-orange-400" />
              <span>Attributes Hierarchy Matrix</span>
            </h2>
            <span className="text-[10px] text-slate-500 uppercase tracking-widest font-mono">
              7 Core Stats Active
            </span>
          </div>

          <div className="space-y-2.5">
            {statKeys.map((key) => {
              const stat = profile.coreStats[key];
              if (!stat) return null;
              const isExpanded = expandedStat === key;
              const progress = Math.min(100, Math.round((stat.currentExp / stat.nextLevelExp) * 100));

              const relatedSubSkills = (Object.values(profile.subSkills) as SubSkill[]).filter(
                (s) => s.parentStat === key
              );

              return (
                <div
                  key={key}
                  className={`rounded-2xl border transition overflow-hidden backdrop-blur-sm ${
                    isExpanded
                      ? 'bg-white/5 border-orange-500/40 shadow-lg'
                      : 'bg-white/5 border-white/10 hover:border-white/20'
                  }`}
                >
                  <div
                    onClick={() => setExpandedStat(isExpanded ? null : key)}
                    className="p-4 flex items-center justify-between cursor-pointer select-none"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-xl bg-black/50 border border-white/10">
                        {getStatIcon(key)}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm text-white">{stat.nameKr}</span>
                          <span className="px-1.5 py-0.2 rounded text-[10px] font-mono font-bold bg-orange-500/20 text-orange-400 border border-orange-500/30">
                            Lv.{stat.level}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 mt-0.5 line-clamp-1">{stat.description}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="text-right hidden sm:block">
                        <span className="text-xs font-mono font-bold text-slate-300">
                          {stat.currentExp} / {stat.nextLevelExp} EXP
                        </span>
                        <div className="w-24 h-1.5 bg-black/40 rounded-full overflow-hidden mt-1 border border-white/5">
                          <div
                            className={`h-full rounded-full ${getStatBarColor(key)}`}
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                      </div>
                      {isExpanded ? (
                        <ChevronUp className="w-4 h-4 text-orange-400" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-slate-400" />
                      )}
                    </div>
                  </div>

                  {/* Subskills Panel */}
                  {isExpanded && (
                    <div className="px-4 pb-4 pt-1 border-t border-white/10 bg-black/30 space-y-2.5">
                      <div className="flex items-center justify-between text-[10px] text-slate-400 pt-2 uppercase tracking-widest font-bold">
                        <span>Connected Sub-Skills</span>
                        <span className="text-orange-400">70% EXP Allocation</span>
                      </div>

                      {relatedSubSkills.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {relatedSubSkills.map((sub) => {
                            const subProgress = Math.min(100, Math.round((sub.exp / sub.nextExp) * 100));
                            return (
                              <div
                                key={sub.id}
                                className="bg-white/5 p-3 rounded-xl border border-white/10 flex items-center justify-between gap-2"
                              >
                                <div>
                                  <div className="flex items-center gap-1.5">
                                    <span className="text-xs font-bold text-white">{sub.name}</span>
                                    <span className="text-[10px] font-bold font-mono text-orange-400">Lv.{sub.level}</span>
                                  </div>
                                  <span className="text-[10px] text-slate-400 block mt-0.5 font-mono">
                                    Total: {sub.totalAmount.toLocaleString()}{sub.unit} ({sub.totalActivitiesCount} times)
                                  </span>
                                </div>
                                <div className="w-16 text-right">
                                  <span className="text-[10px] font-mono text-slate-400">{subProgress}%</span>
                                  <div className="w-full h-1 bg-black/50 rounded-full overflow-hidden mt-0.5">
                                    <div className="h-full bg-orange-400" style={{ width: `${subProgress}%` }} />
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <p className="text-xs text-slate-500 py-1 font-sans">
                          아직 기록된 세부 활동이 없습니다. 새로운 행동을 기록하여 스킬을 해금하세요.
                        </p>
                      )}

                      <div className="pt-2 flex justify-end">
                        <button
                          onClick={onOpenLogger}
                          className="text-xs font-bold text-orange-400 hover:text-orange-300 flex items-center gap-1 transition"
                        >
                          + RECORD ACTIVITY FOR THIS STAT &rarr;
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
