import React, { useState } from 'react';
import {
  BookOpen,
  Brain,
  Check,
  ChevronDown,
  Dumbbell,
  Footprints,
  HeartHandshake,
  Info,
  Target,
  X,
  Zap,
} from 'lucide-react';
import { ACTIVITY_OPTIONS, CORE_STATS_META } from '../data/categories';
import { ActivityLog, ActivityOption, CategoryId, CoreStatKey } from '../types';
import { calculateActivityExp, ExpCalculationResult } from '../utils/expCalculator';
import { formatUnitLabel } from '../utils/questProgress';
import { getDailyAmount, getLocalDayKey } from '../utils/activityMetrics';

interface ActivityLoggerProps {
  streakDays: number;
  activityLogs: ActivityLog[];
  editingLog?: ActivityLog | null;
  focusStatKey?: CoreStatKey | null;
  onLogActivity?: (
    option: ActivityOption,
    amount: number,
    difficultyMultiplier: number,
    difficultyName: string,
    isVerified: boolean,
    calculation: ExpCalculationResult,
    note?: string
  ) => void;
  onUpdateActivity?: (
    logId: string,
    option: ActivityOption,
    amount: number,
    difficultyMultiplier: number,
    difficultyName: string,
    isVerified: boolean,
    calculation: ExpCalculationResult,
    note?: string,
  ) => void;
  onClose: () => void;
}

export const ActivityLogger: React.FC<ActivityLoggerProps> = ({
  streakDays,
  activityLogs,
  editingLog = null,
  focusStatKey = null,
  onLogActivity,
  onUpdateActivity,
  onClose,
}) => {
  const initialOption =
    ACTIVITY_OPTIONS.find((activity) => activity.id === editingLog?.activityId) ||
    ACTIVITY_OPTIONS.find((activity) => focusStatKey && activity.primaryStat === focusStatKey) ||
    ACTIVITY_OPTIONS.find((activity) => focusStatKey && activity.secondaryStat === focusStatKey) ||
    ACTIVITY_OPTIONS[0];
  const initialDifficultyIdx = editingLog
    ? Math.max(0, initialOption.difficultyLevels.findIndex((diff) => diff.name === editingLog.difficulty))
    : 0;

  // State
  const [selectedCategory, setSelectedCategory] = useState<CategoryId>(editingLog?.category || initialOption.category);
  const [selectedActivityId, setSelectedActivityId] = useState<string>(editingLog?.activityId || initialOption.id);
  const [amountText, setAmountText] = useState<string>(String(editingLog?.amount ?? initialOption.defaultAmount));
  const [selectedDifficultyIdx, setSelectedDifficultyIdx] = useState<number>(initialDifficultyIdx);
  const [note, setNote] = useState<string>(editingLog?.note || '');
  const [formError, setFormError] = useState<string | null>(null);

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

  const allowsDecimal = selectedActivity.defaultUnit === 'km' || selectedActivity.defaultUnit === 'hours';
  const inputStep = selectedActivity.defaultUnit === 'hours' ? '0.5' : allowsDecimal ? '0.1' : '1';
  const inputMode = allowsDecimal ? 'decimal' : 'numeric';
  const amount = Number(amountText) || 0;
  const focusedStat = focusStatKey ? CORE_STATS_META[focusStatKey] : null;

  const today = getLocalDayKey();
  const currentDayAmountSoFar = getDailyAmount(activityLogs, selectedActivity.id, today, editingLog?.id);
  const isFirstTime = !activityLogs.some(
    (log) => log.id !== editingLog?.id && log.activityId === selectedActivity.id,
  );
  const previousBest = activityLogs
    .filter((log) => log.id !== editingLog?.id && log.activityId === selectedActivity.id)
    .reduce((best, log) => Math.max(best, log.amount), 0);
  const isPersonalBest = previousBest > 0 && amount > previousBest;

  const quickIncrementPills =
    selectedActivity.defaultUnit === 'steps'
      ? [
          { label: '+1천', val: 1000 },
          { label: '+3천', val: 3000 },
          { label: '+5천', val: 5000 },
        ]
      : selectedActivity.defaultUnit === 'hours'
        ? [
            { label: '+0.5', val: 0.5 },
            { label: '+1', val: 1 },
            { label: '+2', val: 2 },
          ]
        : selectedActivity.defaultUnit === 'km'
          ? [
              { label: '+0.5', val: 0.5 },
              { label: '+1', val: 1 },
              { label: '+3', val: 3 },
            ]
          : ['tasks', 'entries', 'conversations', 'contacts', 'sessions'].includes(selectedActivity.defaultUnit)
            ? [
                { label: '+1', val: 1 },
                { label: '+3', val: 3 },
                { label: '+5', val: 5 },
              ]
            : [
                { label: '+10', val: 10 },
                { label: '+30', val: 30 },
                { label: '+60', val: 60 },
              ];

  // Real-time calculation
  const calculation = calculateActivityExp({
    baseExpPerUnit: selectedActivity.baseExpPerUnit,
    amount: Number(amount) || 0,
    difficultyMultiplier: currentDiff.multiplier,
    streakDays,
    isVerified: false,
    isFirstTime,
    isPersonalBest,
    maxDailyCapAmount: selectedActivity.maxDailyCapAmount,
    currentDayAmountSoFar,
  });
  const zeroRewardMessage = amount <= 0
    ? '입력 필요'
    : currentDayAmountSoFar >= selectedActivity.maxDailyCapAmount
      ? '오늘 보상 한도 도달'
      : '입력값 확인';

  const handleCategoryChange = (cat: CategoryId) => {
    setSelectedCategory(cat);
    const firstAct = ACTIVITY_OPTIONS.find((a) => a.category === cat);
    if (firstAct) {
      setSelectedActivityId(firstAct.id);
      setSelectedDifficultyIdx(0);
      setAmountText(String(firstAct.defaultAmount));
    }
  };

  const handleActivityChange = (actId: string) => {
    setSelectedActivityId(actId);
    setSelectedDifficultyIdx(0);
    const act = ACTIVITY_OPTIONS.find((a) => a.id === actId);
    if (act) {
      setAmountText(String(act.defaultAmount));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!Number.isFinite(amount) || amount < selectedActivity.minAmount || amount > selectedActivity.maxDailyCapAmount) {
      setFormError(`${selectedActivity.minAmount}${formatUnitLabel(selectedActivity.defaultUnit)} 이상 ${selectedActivity.maxDailyCapAmount}${formatUnitLabel(selectedActivity.defaultUnit)} 이하로 입력해 주세요.`);
      return;
    }
    if (calculation.totalExp <= 0) {
      setFormError('오늘 이 활동의 보상 한도에 도달했습니다. 기존 기록을 수정하거나 내일 다시 기록해 주세요.');
      return;
    }
    setFormError(null);
    if (editingLog && onUpdateActivity) {
      onUpdateActivity(editingLog.id, selectedActivity, amount, currentDiff.multiplier, currentDiff.name, false, calculation, note);
      return;
    }
    onLogActivity?.(selectedActivity, amount, currentDiff.multiplier, currentDiff.name, false, calculation, note);
  };

  return (
    <div className="bg-[#050608] border border-white/15 rounded-t-3xl sm:rounded-3xl p-4 sm:p-7 shadow-2xl backdrop-blur-xl relative overflow-y-auto text-slate-100 max-h-[92dvh]">
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
          type="button"
          onClick={onClose}
          className="touch-target p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition cursor-pointer"
          aria-label={editingLog ? '활동 기록 수정 닫기' : '활동 기록 창 닫기'}
          title={editingLog ? '활동 기록 수정 닫기' : '활동 기록 창 닫기'}
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {focusedStat && (
        <div className="relative z-10 mb-5 rounded-2xl border border-blue-400/30 bg-blue-950/25 p-4">
          <div className="flex items-start gap-3">
            <Info className="mt-0.5 h-4 w-4 shrink-0 text-blue-300" aria-hidden="true" />
            <div className="min-w-0">
              <p className="text-[10px] font-bold uppercase tracking-widest text-blue-300">기록 대상 능력</p>
              <p className="mt-1 text-sm font-black text-white">{focusedStat.nameKr}</p>
              <p className="mt-1 text-xs leading-5 text-slate-300">{focusedStat.description}</p>
            </div>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate className="space-y-5 relative z-10">
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

        {selectedActivity.id === 'running' && (
          <div className="rounded-2xl border border-cyan-400/20 bg-cyan-950/20 p-3.5 text-cyan-100">
            <div className="flex items-start gap-2.5">
              <Info className="mt-0.5 h-4 w-4 shrink-0 text-cyan-300" aria-hidden="true" />
              <p className="text-xs leading-5">
                <span className="font-bold text-cyan-200">Pace(페이스)</span>는 1km를 달리는 데 걸린 시간입니다. 예를 들어 6:30은 1km에 6분 30초가 걸렸다는 뜻이며, 숫자가 낮을수록 빠른 페이스입니다.
              </p>
            </div>
          </div>
        )}

        {/* 3. Metric Input & Difficulty Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Amount Input */}
          <div className="bg-white/5 border border-white/10 p-4 rounded-2xl">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-2">
              3. 수행 수치 ({formatUnitLabel(selectedActivity.defaultUnit)})
            </label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                inputMode={inputMode}
                step={inputStep}
                min={allowsDecimal ? selectedActivity.minAmount : Math.ceil(selectedActivity.minAmount)}
                max={selectedActivity.maxDailyCapAmount}
                aria-label={`${selectedActivity.name} 수행 수치`}
                value={amountText}
                onChange={(e) => setAmountText(e.target.value)}
                className="w-full bg-black/50 border border-white/15 rounded-xl px-4 py-2.5 text-white font-mono text-lg font-bold focus:outline-none focus:border-orange-500 transition"
              />
              <span className="text-sm font-bold text-orange-400 font-mono shrink-0 px-2">
                {formatUnitLabel(selectedActivity.defaultUnit)}
              </span>
            </div>

            {/* Quick Increment Pills */}
            <div className="flex gap-1.5 mt-2.5">
              {quickIncrementPills.map((pill) => (
                <button
                  key={pill.label}
                  type="button"
                  onClick={() => setAmountText(String(Math.max(allowsDecimal ? 0.1 : 1, amount + pill.val)))}
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

        {/* 4. Evidence boundary */}
        <div className="rounded-2xl border border-white/10 bg-white/5 p-3.5 text-slate-400">
          <span className="block text-xs font-bold text-slate-300">사실 기반의 로컬 기록</span>
          <span className="mt-1 block text-[11px] leading-5">
            현재 앱에는 건강 앱·GPS·타이머 외부 연동이 없습니다. 인증되지 않은 셀프 입력에는 보너스 EXP를 붙이지 않습니다.
          </span>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-2xl p-4 space-y-2">
          <label htmlFor="activity-note" className="text-xs font-bold text-slate-400 uppercase tracking-widest block">
            메모 및 회고 (선택)
          </label>
          <textarea
            id="activity-note"
            value={note}
            maxLength={240}
            onChange={(event) => setNote(event.target.value)}
            placeholder="무엇이 잘됐고, 다음에는 무엇을 바꿀까요?"
            rows={3}
            className="w-full resize-none bg-black/50 border border-white/15 rounded-xl px-3 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-orange-500 transition"
          />
          <p className="text-right text-[10px] text-slate-500">{note.length}/240</p>
        </div>

        {formError && (
          <div role="alert" className="rounded-xl border border-red-500/30 bg-red-950/20 px-3 py-2.5 text-xs text-red-200">
            {formError}
          </div>
        )}

        {/* 5. Real-Time EXP Calculation Preview Banner */}
        <div className="bg-gradient-to-br from-orange-950/40 to-slate-900 border border-orange-500/40 rounded-2xl p-4 shadow-lg">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <div>
              <span className="text-[10px] uppercase font-bold tracking-widest text-orange-400 block">
                Estimated Experience Gain
              </span>
              <div className="flex items-baseline gap-2 mt-0.5">
                <span className="text-2xl font-black font-mono text-white tracking-tight">
                  {calculation.totalExp > 0 ? `+${calculation.totalExp.toLocaleString()} EXP` : zeroRewardMessage}
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
          <span>{editingLog ? 'UPDATE ACTIVITY RECORD' : 'RECORD MISSION & CLAIM EXP'}</span>
        </button>
      </form>
    </div>
  );
};
