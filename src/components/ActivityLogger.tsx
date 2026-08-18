import React, { useState } from 'react';
import {
  Activity,
  Award,
  BookOpen,
  Brain,
  Check,
  ChevronDown,
  Clock,
  Dumbbell,
  Flame,
  Footprints,
  HeartHandshake,
  Info,
  ShieldCheck,
  Sparkles,
  Target,
  X,
  Zap,
} from 'lucide-react';
import { CATEGORIES_META, ACTIVITY_OPTIONS } from '../data/categories';
import { ActivityOption, CategoryId, CoreStatKey } from '../types';
import { calculateActivityExp, ExpCalculationResult } from '../utils/expCalculator';

interface ActivityLoggerProps {
  streakDays: number;
  onLogActivity: (
    option: ActivityOption,
    amount: number,
    difficultyMultiplier: number,
    difficultyName: string,
    isVerified: boolean,
    calculation: ExpCalculationResult,
    note?: string
  ) => void;
  onClose: () => void;
}

export const ActivityLogger: React.FC<ActivityLoggerProps> = ({
  streakDays,
  onLogActivity,
  onClose,
}) => {
  // State
  const [selectedCategory, setSelectedCategory] = useState<CategoryId>('physical');
  const [selectedActivityId, setSelectedActivityId] = useState<string>('running');
  const [amount, setAmount] = useState<number>(3.0);
  const [selectedDifficultyIdx, setSelectedDifficultyIdx] = useState<number>(1);
  const [isVerified, setIsVerified] = useState<boolean>(true);
  const [note, setNote] = useState<string>('');

  // Available activities for selected category
  const currentCategoryActivities = ACTIVITY_OPTIONS.filter(
    (a) => a.category === selectedCategory
  );

  const selectedActivity =
    currentCategoryActivities.find((a) => a.id === selectedActivityId) ||
    currentCategoryActivities[0] ||
    ACTIVITY_OPTIONS[0];

  const currentDiff = selectedActivity.difficultyLevels[selectedDifficultyIdx] ||
    selectedActivity.difficultyLevels[0] || {
      id: 'normal',
      name: '보통',
      multiplier: 1.0,
    };

  // Real-time calculation
  const calculation = calculateActivityExp({
    baseExpPerUnit: selectedActivity.baseExpPerUnit,
    amount: Number(amount) || 0,
    difficultyMultiplier: currentDiff.multiplier,
    streakDays,
    isVerified,
    isFirstTime: false,
    isPersonalBest: false,
  });

  const handleCategoryChange = (cat: CategoryId) => {
    setSelectedCategory(cat);
    const firstAct = ACTIVITY_OPTIONS.find((a) => a.category === cat);
    if (firstAct) {
      setSelectedActivityId(firstAct.id);
      setSelectedDifficultyIdx(0);
      setAmount(firstAct.defaultUnit === 'km' ? 3.0 : 30);
    }
  };

  const handleActivityChange = (actId: string) => {
    setSelectedActivityId(actId);
    setSelectedDifficultyIdx(0);
    const act = ACTIVITY_OPTIONS.find((a) => a.id === actId);
    if (act) {
      setAmount(act.defaultUnit === 'km' ? 3.0 : 30);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (amount <= 0) return;
    onLogActivity(
      selectedActivity,
      amount,
      currentDiff.multiplier,
      currentDiff.name,
      isVerified,
      calculation,
      note
    );
  };

  return (
    <div className="bg-[#050608] border border-white/15 rounded-3xl p-6 sm:p-7 shadow-2xl backdrop-blur-xl relative overflow-hidden text-slate-100">
      {/* Ambient background glow */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-orange-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-5 relative z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-orange-500/20 border border-orange-500/40 flex items-center justify-center text-orange-400">
            <Zap className="w-5 h-5 fill-orange-400" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white tracking-tight uppercase">
              RECORD MISSION ACTIVITY
            </h2>
            <p className="text-xs text-slate-400">
              실제 행동을 기록하여 실시간으로 능력치 EXP를 획득합니다.
            </p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5 relative z-10">
        {/* 1. Category Selection */}
        <div>
          <label className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-2">
            1. 영역 선택 (Category)
          </label>
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
            {(
              [
                { id: 'physical', label: '신체/운동', icon: Dumbbell },
                { id: 'learning', label: '지식/학습', icon: BookOpen },
                { id: 'mental', label: '정신/멘탈', icon: Brain },
                { id: 'career', label: '몰입/업무', icon: Target },
                { id: 'finance', label: '금융/자산', icon: Zap },
                { id: 'social', label: '소통/관계', icon: HeartHandshake },
              ] as const
            ).map((cat) => {
              const Icon = cat.icon;
              const isSelected = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => handleCategoryChange(cat.id)}
                  className={`p-2.5 rounded-xl border text-xs font-bold transition flex flex-col items-center gap-1.5 cursor-pointer ${
                    isSelected
                      ? 'bg-orange-500/20 border-orange-500 text-orange-400 shadow-[0_0_10px_rgba(249,115,22,0.3)]'
                      : 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/10 hover:text-slate-200'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="text-[11px] truncate w-full text-center">{cat.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* 2. Activity Type Selection */}
        <div>
          <label className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-2">
            2. 세부 행동 선택
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {currentCategoryActivities.map((act) => {
              const isSelected = selectedActivityId === act.id;
              return (
                <button
                  key={act.id}
                  type="button"
                  onClick={() => handleActivityChange(act.id)}
                  className={`p-3 rounded-xl border text-left text-xs transition flex items-center justify-between cursor-pointer ${
                    isSelected
                      ? 'bg-white/10 border-orange-500/60 text-white font-bold'
                      : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10'
                  }`}
                >
                  <div>
                    <span className="block">{act.name}</span>
                    <span className="text-[10px] text-slate-500 block font-mono mt-0.5">
                      {act.primaryStat} 주스탯 (70%)
                    </span>
                  </div>
                  {isSelected && <Check className="w-4 h-4 text-orange-400 shrink-0" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* 3. Metric Input & Difficulty Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Amount Input */}
          <div className="bg-white/5 border border-white/10 p-4 rounded-2xl">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-2">
              3. 수행 수치 ({selectedActivity.defaultUnit})
            </label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                step={selectedActivity.defaultUnit === 'km' ? '0.1' : '1'}
                min="0.1"
                value={amount}
                onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
                className="w-full bg-black/50 border border-white/15 rounded-xl px-4 py-2.5 text-white font-mono text-lg font-bold focus:outline-none focus:border-orange-500 transition"
              />
              <span className="text-sm font-bold text-orange-400 font-mono shrink-0 px-2">
                {selectedActivity.defaultUnit}
              </span>
            </div>

            {/* Quick Increment Pills */}
            <div className="flex gap-1.5 mt-2.5">
              {[
                { label: '+1', val: 1 },
                { label: '+3', val: 3 },
                { label: '+5', val: 5 },
                { label: '+10', val: 10 },
              ].map((pill) => (
                <button
                  key={pill.label}
                  type="button"
                  onClick={() => setAmount((prev) => Math.max(0.1, prev + pill.val))}
                  className="px-2.5 py-1 rounded-lg bg-black/40 border border-white/10 text-[11px] font-mono text-slate-300 hover:text-white hover:border-orange-500/40 transition cursor-pointer"
                >
                  {pill.label}
                </button>
              ))}
            </div>
          </div>

          {/* Difficulty & Intensity */}
          <div className="bg-white/5 border border-white/10 p-4 rounded-2xl">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-2">
              4. 난이도 / 강도 계수
            </label>
            <div className="space-y-1.5">
              {selectedActivity.difficultyLevels.map((diff, idx) => (
                <button
                  key={diff.id}
                  type="button"
                  onClick={() => setSelectedDifficultyIdx(idx)}
                  className={`w-full p-2 rounded-xl border text-left text-xs transition flex items-center justify-between cursor-pointer ${
                    selectedDifficultyIdx === idx
                      ? 'bg-orange-500/20 border-orange-500 text-orange-300 font-bold'
                      : 'bg-black/30 border-white/5 text-slate-400 hover:bg-white/5 hover:text-slate-200'
                  }`}
                >
                  <span>{diff.name}</span>
                  <span className="font-mono text-[11px]">x{diff.multiplier.toFixed(2)}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* 4. Verification Checkbox (Health / GPS / Timer) */}
        <div
          onClick={() => setIsVerified(!isVerified)}
          className={`p-3.5 rounded-2xl border transition flex items-center justify-between cursor-pointer ${
            isVerified
              ? 'bg-emerald-950/20 border-emerald-500/40 text-emerald-300 shadow-sm'
              : 'bg-white/5 border-white/10 text-slate-400'
          }`}
        >
          <div className="flex items-center gap-3">
            <div
              className={`w-5 h-5 rounded-lg border flex items-center justify-center text-xs ${
                isVerified
                  ? 'bg-emerald-500 border-emerald-400 text-black font-black'
                  : 'border-white/20 bg-black/40'
              }`}
            >
              {isVerified && '✓'}
            </div>
            <div>
              <span className="text-xs font-bold block">
                센서 / 건강 앱 공인 인증 (Verified Badge)
              </span>
              <span className="text-[11px] text-slate-400 block">
                Apple Health, GPS 트랙, 앱 내 타이머 연동 시 +25% 추가 EXP 부스트
              </span>
            </div>
          </div>
          <span className="text-xs font-mono font-bold text-emerald-400">
            {isVerified ? '+25% 부스트' : '일반 셀프기록'}
          </span>
        </div>

        {/* 5. Real-Time EXP Calculation Preview Banner */}
        <div className="bg-gradient-to-br from-orange-950/40 to-slate-900 border border-orange-500/40 rounded-2xl p-4 shadow-lg">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <div>
              <span className="text-[10px] uppercase font-bold tracking-widest text-orange-400 block">
                Estimated Experience Gain
              </span>
              <div className="flex items-baseline gap-2 mt-0.5">
                <span className="text-2xl font-black font-mono text-white tracking-tight">
                  +{calculation.totalExp.toLocaleString()} EXP
                </span>
                <span className="text-xs text-orange-300 font-mono">
                  (스트릭 +{calculation.streakBonusPercent}%)
                </span>
              </div>
            </div>

            <div className="text-right">
              <span className="text-xs font-mono text-slate-300 block">
                주스탯 ({selectedActivity.primaryStat}):{' '}
                <span className="text-orange-400 font-bold">+{calculation.primaryExp} EXP</span>
              </span>
              {selectedActivity.secondaryStat && (
                <span className="text-xs font-mono text-slate-400 block">
                  보조스탯 ({selectedActivity.secondaryStat}):{' '}
                  <span className="text-blue-400 font-bold">+{calculation.secondaryExp} EXP</span>
                </span>
              )}
            </div>
          </div>

          <div className="pt-2 text-[11px] text-slate-400 flex items-center justify-between font-mono">
            <span>Base: {calculation.baseEarned} EXP</span>
            <span>Diff: x{currentDiff.multiplier.toFixed(2)}</span>
            <span>Verified Bonus: +{calculation.verifiedBonusPercent}%</span>
          </div>
        </div>

        {/* Submit Action Button */}
        <button
          type="submit"
          className="w-full h-14 bg-orange-500 hover:bg-orange-400 text-black font-black italic tracking-wider rounded-xl shadow-[0_0_20px_rgba(249,115,22,0.4)] flex items-center justify-center gap-2 transform active:scale-95 transition-all cursor-pointer"
        >
          <Zap className="w-5 h-5 fill-black stroke-black" />
          <span>RECORD MISSION &amp; CLAIM EXP</span>
        </button>
      </form>
    </div>
  );
};
