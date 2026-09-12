import { CoreStatKey } from '../types';

/**
 * Level Requirement Formula:
 * EXP_required(level) = Math.floor(100 * Math.pow(1.18, level - 1) + (level - 1) * 25)
 */
export function getRequiredExpForLevel(level: number): number {
  if (level <= 1) return 100;
  return Math.floor(100 * Math.pow(1.18, level - 1) + (level - 1) * 25);
}

/**
 * Calculate Player Level from Total EXP
 */
export function getPlayerLevelFromTotalExp(totalExp: number): {
  level: number;
  currentExp: number;
  nextExp: number;
  progressPercent: number;
} {
  let level = 1;
  let accumulated = 0;
  
  while (true) {
    const required = getRequiredExpForLevel(level);
    if (totalExp < accumulated + required) {
      const currentInLevel = totalExp - accumulated;
      return {
        level,
        currentExp: currentInLevel,
        nextExp: required,
        progressPercent: Math.min(100, Math.round((currentInLevel / required) * 100)),
      };
    }
    accumulated += required;
    level++;
    if (level >= 99) {
      return {
        level: 99,
        currentExp: required,
        nextExp: required,
        progressPercent: 100,
      };
    }
  }
}

/**
 * Get Tier rank based on Player Level
 */
export function getTierFromLevel(level: number): 'Bronze' | 'Silver' | 'Gold' | 'Platinum' | 'Diamond' | 'Master' {
  if (level >= 50) return 'Master';
  if (level >= 35) return 'Diamond';
  if (level >= 25) return 'Platinum';
  if (level >= 15) return 'Gold';
  if (level >= 8) return 'Silver';
  return 'Bronze';
}

export function getTierColor(tier: string): { bg: string; text: string; border: string; badge: string } {
  switch (tier) {
    case 'Master':
      return { bg: 'bg-red-950/40', text: 'text-red-400', border: 'border-red-500/40', badge: 'bg-gradient-to-r from-red-600 to-amber-600 text-white' };
    case 'Diamond':
      return { bg: 'bg-cyan-950/40', text: 'text-cyan-400', border: 'border-cyan-500/40', badge: 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white' };
    case 'Platinum':
      return { bg: 'bg-emerald-950/40', text: 'text-emerald-400', border: 'border-emerald-500/40', badge: 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white' };
    case 'Gold':
      return { bg: 'bg-amber-950/40', text: 'text-amber-400', border: 'border-amber-500/40', badge: 'bg-gradient-to-r from-amber-500 to-yellow-600 text-slate-900 font-bold' };
    case 'Silver':
      return { bg: 'bg-slate-800/60', text: 'text-slate-300', border: 'border-slate-500/40', badge: 'bg-slate-600 text-white' };
    default:
      return { bg: 'bg-orange-950/30', text: 'text-amber-600', border: 'border-amber-700/40', badge: 'bg-amber-800 text-amber-100' };
  }
}

/**
 * Activity EXP Calculation Engine
 * EXP = (BaseExp * Amount * DiminishingFactor) * DifficultyMultiplier * StreakMultiplier * VerifiedMultiplier + Bonuses
 */
export interface ExpCalculationInput {
  baseExpPerUnit: number;
  amount: number;
  difficultyMultiplier: number;
  streakDays: number;
  isVerified: boolean;
  isFirstTime?: boolean;
  isPersonalBest?: boolean;
  maxDailyCapAmount?: number;
  currentDayAmountSoFar?: number;
}

export interface ExpCalculationResult {
  baseEarned: number;
  diminishingFactor: number;
  streakBonusPercent: number;
  verifiedBonusPercent: number;
  bonusExp: number;
  totalExp: number;
  primaryExp: number;
  secondaryExp: number;
  breakdown: {
    label: string;
    value: string;
    amount: number;
  }[];
}

export function calculateActivityExp(input: ExpCalculationInput): ExpCalculationResult {
  const {
    baseExpPerUnit,
    amount,
    difficultyMultiplier,
    streakDays,
    isVerified,
    isFirstTime = false,
    isPersonalBest = false,
    maxDailyCapAmount = 100,
    currentDayAmountSoFar = 0,
  } = input;

  // 1. Hard daily reward boundary. A penalty still granting EXP forever is
  // exploitable, so no amount beyond the local daily cap can produce reward.
  const remainingAmount = maxDailyCapAmount > 0
    ? Math.max(0, maxDailyCapAmount - currentDayAmountSoFar)
    : amount;
  const effectiveAmount = Math.min(Math.max(0, amount), remainingAmount);
  const diminishingFactor = amount > 0
    ? Math.round((effectiveAmount / amount) * 100) / 100
    : 0;

  const rawBase = Math.round(effectiveAmount * baseExpPerUnit);

  // 2. Difficulty Multiplier (0.8x to 1.5x)
  const afterDifficulty = rawBase * difficultyMultiplier;

  // 3. Streak Multiplier (+3% per day, capped at +50% at 17 days)
  const streakBonusPercent = Math.min(50, Math.floor(streakDays * 3));
  const streakMultiplier = 1 + streakBonusPercent / 100;

  // 4. Verified Data Multiplier (+25% for Apple Health / GPS / Timer verification)
  const verifiedBonusPercent = isVerified ? 25 : 0;
  const verifiedMultiplier = isVerified ? 1.25 : 1.0;

  // 5. Fixed bonus points
  let bonusExp = 0;
  if (effectiveAmount > 0 && isFirstTime) bonusExp += 50;
  if (effectiveAmount > 0 && isPersonalBest) bonusExp += 80;

  // Total EXP calculation
  const totalExp = effectiveAmount > 0
    ? Math.max(10, Math.round(afterDifficulty * streakMultiplier * verifiedMultiplier + bonusExp))
    : 0;

  // Stat EXP distribution (70% primary stat, 30% secondary stat)
  const primaryExp = Math.round(totalExp * 0.7);
  const secondaryExp = totalExp - primaryExp;

  const breakdown = [
    { label: '기본 활동 경험치', value: `${amount} × ${baseExpPerUnit}`, amount: rawBase },
    { label: '난이도 보정', value: `× ${difficultyMultiplier.toFixed(2)}`, amount: Math.round(afterDifficulty - rawBase) },
    { label: '연속 기록(Streak) 보너스', value: `+${streakBonusPercent}% (${streakDays}일차)`, amount: Math.round(afterDifficulty * (streakMultiplier - 1)) },
    { label: '데이터 공인 인증(Verified)', value: isVerified ? '+25% (GPS/건강앱)' : '미인증 (기본)', amount: isVerified ? Math.round(afterDifficulty * streakMultiplier * 0.25) : 0 },
  ];

  if (isFirstTime) {
    breakdown.push({ label: '최초 달성 보너스', value: '+50 EXP', amount: 50 });
  }
  if (isPersonalBest) {
    breakdown.push({ label: '개인 최고 기록(PB) 경신', value: '+80 EXP', amount: 80 });
  }

  return {
    baseEarned: rawBase,
    diminishingFactor,
    streakBonusPercent,
    verifiedBonusPercent,
    bonusExp,
    totalExp,
    primaryExp,
    secondaryExp,
    breakdown,
  };
}
