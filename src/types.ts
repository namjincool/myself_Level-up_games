export type CategoryId = 'physical' | 'learning' | 'mental' | 'career' | 'finance' | 'social';

export type CoreStatKey = 'VIT' | 'END' | 'FOC' | 'INT' | 'MEN' | 'FIN' | 'SOC';

export interface StatInfo {
  key: CoreStatKey;
  name: string;
  nameKr: string;
  level: number;
  currentExp: number;
  nextLevelExp: number;
  color: string;
  icon: string;
  description: string;
}

export interface SubSkill {
  id: string;
  name: string;
  category: CategoryId;
  parentStat: CoreStatKey;
  level: number;
  exp: number;
  nextExp: number;
  totalActivitiesCount: number;
  unit: string;
  totalAmount: number;
}

export interface ActivityOption {
  id: string;
  name: string;
  category: CategoryId;
  primaryStat: CoreStatKey;
  secondaryStat?: CoreStatKey;
  defaultUnit: string;
  unitName: string;
  defaultAmount: number;
  baseExpPerUnit: number;
  difficultyLevels: { id: string; name: string; multiplier: number }[];
  verifiedSupported: boolean;
  minAmount: number;
  maxDailyCapAmount: number;
  placeholder: string;
}

export interface ActivityLog {
  id: string;
  activityId: string;
  activityName: string;
  category: CategoryId;
  timestamp: string;
  amount: number;
  unit: string;
  difficulty: string;
  difficultyMultiplier: number;
  streakBonus: number;
  isVerified: boolean;
  earnedExp: number;
  primaryStat: CoreStatKey;
  secondaryStat?: CoreStatKey;
  primaryExp: number;
  secondaryExp: number;
  note?: string;
  createdAt?: number;
  levelUpEvents?: {
    statKey: string;
    statName: string;
    oldLevel: number;
    newLevel: number;
  }[];
}

export interface AppSettings {
  remindersEnabled: boolean;
  hapticsEnabled: boolean;
  /** Local-only by design. Kept as an explicit state value for backups and QA. */
  storageMode: 'local-only';
  /** @deprecated Retained for migration compatibility; always false in the app. */
  analyticsConsent: boolean;
  /** @deprecated Retained for migration compatibility; always false in the app. */
  cloudSyncEnabled: boolean;
  notificationStatus: 'unknown' | 'granted' | 'denied' | 'unsupported';
  lastBackupAt?: string;
}

export interface Quest {
  id: string;
  title: string;
  type: 'daily' | 'weekly' | 'challenge';
  category: CategoryId;
  description?: string;
  /** Activities that are allowed to advance this quest. */
  activityIds?: string[];
  /** Local day that owns a daily quest instance. */
  dateKey?: string;
  /** JavaScript weekday (1 = Monday ... 5 = Friday) for daily quests. */
  dayOfWeek?: number;
  targetAmount: number;
  currentAmount: number;
  unit: string;
  expReward: number;
  statReward: CoreStatKey;
  isCompleted: boolean;
  isClaimed: boolean;
  icon: string;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  category: CategoryId | 'general';
  icon: string;
  requiredMetric: number;
  currentMetric: number;
  isUnlocked: boolean;
  rewardTitle?: string;
  rewardExp: number;
  unlockedAt?: string;
}

export interface UserProfile {
  name: string;
  title: string;
  playerLevel: number;
  totalExp: number;
  currentLevelExp: number;
  nextLevelExp: number;
  rankTier: 'Bronze' | 'Silver' | 'Gold' | 'Platinum' | 'Diamond' | 'Master';
  streakDays: number;
  maxStreak: number;
  /** One automatic recovery token for a missed day, per the Streak Freeze PRD loop. */
  streakShieldCount?: number;
  weeklyExp: number;
  coreStats: Record<CoreStatKey, StatInfo>;
  subSkills: Record<string, SubSkill>;
  unlockedTitles: string[];
  /** Idempotent ledger of quest rewards already granted. */
  claimedQuestRewards?: Record<string, number>;
}
