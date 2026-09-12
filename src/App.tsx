/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef, useState } from 'react';
import { App as CapacitorApp } from '@capacitor/app';
import { Capacitor } from '@capacitor/core';
import {
  Activity,
  Award,
  BookOpen,
  FileText,
  Flame,
  History,
  Pencil,
  Quote,
  RefreshCw,
  RotateCcw,
  Shield,
  Swords,
  Settings,
  Trash2,
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
import { SettingsModal } from './components/SettingsModal';
import { TitleModal } from './components/TitleModal';
import { ACTIVITY_OPTIONS, CATEGORIES_META, INITIAL_USER_PROFILE } from './data/categories';
import { getDailyQuestsForDate } from './data/dailyQuests';
import { SELF_CONTROL_QUOTES } from './data/motivationQuotes';
import {
  ActivityLog,
  ActivityOption,
  AppSettings,
  CoreStatKey,
  Quest,
  UserProfile,
} from './types';
import {
  calculateActivityExp,
  ExpCalculationResult,
  getPlayerLevelFromTotalExp,
  getRequiredExpForLevel,
  getTierFromLevel,
} from './utils/expCalculator';
import { formatUnitLabel, getQuestProgressIncrement } from './utils/questProgress';
import { getDailyAmount, getDayDistance, getLatestActivityDay, getLocalDayKey } from './utils/activityMetrics';

// v2 intentionally starts with a clean profile after removing the former demo state.
const STORAGE_KEY = 'liferpg-mobile-state-v2';

type PersistedState = {
  profile: UserProfile;
  baseProfile?: UserProfile;
  quests: Quest[];
  achievements: typeof INITIAL_USER_PROFILE.initialAchievements;
  activityLogs: ActivityLog[];
  settings: AppSettings;
  hasCompletedOnboarding?: boolean;
};

const readPersistedState = (): Partial<PersistedState> | null => {
  if (typeof window === 'undefined') return null;

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<PersistedState>;
    return parsed && typeof parsed === 'object' ? parsed : null;
  } catch {
    return null;
  }
};

const createDefaultSettings = (): AppSettings => ({
  remindersEnabled: false,
  hapticsEnabled: true,
  storageMode: 'local-only',
  analyticsConsent: false,
  cloudSyncEnabled: false,
  notificationStatus: 'unknown',
});

const normalizeSettings = (saved?: Partial<AppSettings>): AppSettings => ({
  ...createDefaultSettings(),
  ...saved,
  // This app intentionally has no analytics or cloud transport.
  storageMode: 'local-only',
  analyticsConsent: false,
  cloudSyncEnabled: false,
});

const createFreshProfile = (name = '새로운 모험가'): UserProfile => {
  const coreStats = Object.fromEntries(
    (Object.entries(INITIAL_USER_PROFILE.profile.coreStats) as [CoreStatKey, UserProfile['coreStats'][CoreStatKey]][]).map(
      ([key, stat]) => [
        key,
        {
          ...stat,
          level: 1,
          currentExp: 0,
          nextLevelExp: getRequiredExpForLevel(2),
        },
      ],
    ),
  ) as UserProfile['coreStats'];

  return {
    ...INITIAL_USER_PROFILE.profile,
    name,
    title: '첫 걸음',
    playerLevel: 1,
    totalExp: 0,
    currentLevelExp: 0,
    nextLevelExp: getRequiredExpForLevel(1),
    rankTier: 'Bronze',
    streakDays: 0,
    maxStreak: 0,
    streakShieldCount: 1,
    weeklyExp: 0,
    coreStats,
    subSkills: {},
    unlockedTitles: ['첫 걸음'],
    claimedQuestRewards: {},
  };
};

const getNextStreakState = (
  profile: UserProfile,
  activityLogs: ActivityLog[],
  now: number,
): Pick<UserProfile, 'streakDays' | 'maxStreak' | 'streakShieldCount'> => {
  const today = getLocalDayKey(now);
  const latestDay = getLatestActivityDay(activityLogs);
  const shieldCount = profile.streakShieldCount ?? 1;

  if (!latestDay || latestDay === today) {
    const streakDays = Math.max(1, profile.streakDays);
    return { streakDays, maxStreak: Math.max(profile.maxStreak, streakDays), streakShieldCount: shieldCount };
  }

  const distance = getDayDistance(latestDay, today);
  if (distance === 1) {
    const streakDays = profile.streakDays + 1;
    return { streakDays, maxStreak: Math.max(profile.maxStreak, streakDays), streakShieldCount: shieldCount };
  }

  if (distance === 2 && shieldCount > 0) {
    const streakDays = profile.streakDays + 1;
    return {
      streakDays,
      maxStreak: Math.max(profile.maxStreak, streakDays),
      streakShieldCount: shieldCount - 1,
    };
  }

  return { streakDays: 1, maxStreak: Math.max(profile.maxStreak, 1), streakShieldCount: shieldCount };
};

const createFreshQuests = (date = new Date()): Quest[] => [
  ...getDailyQuestsForDate(date),
  ...INITIAL_USER_PROFILE.initialQuests
    .filter((quest) => quest.type !== 'daily')
    .map((quest) => ({
      ...quest,
      currentAmount: 0,
      isCompleted: false,
      isClaimed: false,
    })),
];

const mergeSavedQuests = (savedQuests?: Quest[], activityLogs?: ActivityLog[], date = new Date()): Quest[] => {
  if (!savedQuests) return createFreshQuests(date);

  const savedById = new Map(savedQuests.map((quest) => [quest.id, quest]));
  const mergedQuests = createFreshQuests(date).map((template) => {
    const saved = savedById.get(template.id);
    if (!saved) return template;
    // Keep progress and claims, but let the current PRD template own labels,
    // units, rewards, and activity mappings so renamed or corrected quests
    // migrate cleanly after an app update.
    return {
      ...template,
      currentAmount: template.type === 'daily' && saved.dateKey !== template.dateKey ? 0 : saved.currentAmount,
      isCompleted: template.type === 'daily' && saved.dateKey !== template.dateKey ? false : saved.isCompleted,
      isClaimed: template.type === 'daily' && saved.dateKey !== template.dateKey ? false : saved.isClaimed,
    };
  });

  if (!activityLogs?.length) return mergedQuests;

  // Repair legacy quest values by replaying the user's real activity logs with
  // the current activity/unit mapping. Existing claimed rewards are preserved.
  const rebuiltQuests = mergedQuests.map((quest) => ({
    ...quest,
    ...(quest.type === 'daily' ? { currentAmount: 0, isCompleted: false } : {}),
  }));

  activityLogs
    .filter((log) => !log.id.startsWith('log-prev-'))
    .slice()
    .reverse()
    .forEach((log, logIndex, logs) => {
      const option = ACTIVITY_OPTIONS.find((activity) => activity.id === log.activityId);
      if (!option) return;
      const calculation = calculateActivityExp({
        baseExpPerUnit: option.baseExpPerUnit,
        amount: log.amount,
        difficultyMultiplier: log.difficultyMultiplier,
        streakDays: 0,
        isVerified: log.isVerified,
        isFirstTime: logIndex === 0 || !logs.slice(0, logIndex).some((item) => item.activityId === option.id),
        isPersonalBest: logs.slice(0, logIndex)
          .filter((item) => item.activityId === option.id)
          .reduce((best, item) => Math.max(best, item.amount), 0) < log.amount,
        maxDailyCapAmount: option.maxDailyCapAmount,
        currentDayAmountSoFar: getDailyAmount(logs.slice(0, logIndex), option.id, getLocalDayKey(log.createdAt ?? Date.now())),
      });
      if (calculation.totalExp <= 0) return;

      rebuiltQuests.forEach((quest, index) => {
        const increment = getQuestProgressIncrement(quest, option, log.amount, {
          existingLogs: logs.slice(0, logIndex),
          loggedAt: log.createdAt,
        });
        if (increment === 0) return;
        const currentAmount = quest.currentAmount + increment;
        rebuiltQuests[index] = {
          ...quest,
          currentAmount,
          isCompleted: currentAmount >= quest.targetAmount,
        };
      });
    });

  return rebuiltQuests;
};

const normalizeImportedLogs = (rawLogs: ActivityLog[]): ActivityLog[] => {
  const seenIds = new Set<string>();
  const replayedLogs: ActivityLog[] = [];
  let replayedProfile = createFreshProfile();

  const normalizedChronological = rawLogs
    .filter((log) => !log?.id?.startsWith('log-prev-'))
    .slice()
    .reverse()
    .map((rawLog) => {
      const option = ACTIVITY_OPTIONS.find((activity) => activity.id === rawLog?.activityId);
      const amount = Number(rawLog?.amount);
      const createdAt = rawLog?.createdAt === undefined ? undefined : Number(rawLog.createdAt);
      const difficultyMultiplier = Number(rawLog?.difficultyMultiplier);
      const difficulty = option?.difficultyLevels.find((item) => item.multiplier === difficultyMultiplier);

      if (
        !option ||
        typeof rawLog?.id !== 'string' ||
        rawLog.id.trim().length === 0 ||
        seenIds.has(rawLog.id) ||
        !Number.isFinite(amount) ||
        amount < option.minAmount ||
        amount > option.maxDailyCapAmount ||
        !Number.isFinite(difficultyMultiplier) ||
        !difficulty ||
        (createdAt !== undefined && (!Number.isFinite(createdAt) || createdAt <= 0))
      ) {
        throw new Error('invalid activity log');
      }

      seenIds.add(rawLog.id);
      const logTime = createdAt ?? Date.now();
      const calculation = calculateActivityExp({
        baseExpPerUnit: option.baseExpPerUnit,
        amount,
        difficultyMultiplier: difficulty.multiplier,
        streakDays: replayedProfile.streakDays,
        isVerified: false,
        isFirstTime: !replayedLogs.some((item) => item.activityId === option.id),
        isPersonalBest: (() => {
          const previousBest = replayedLogs
            .filter((item) => item.activityId === option.id)
            .reduce((best, item) => Math.max(best, item.amount), 0);
          return previousBest > 0 && amount > previousBest;
        })(),
        maxDailyCapAmount: option.maxDailyCapAmount,
        currentDayAmountSoFar: getDailyAmount(replayedLogs, option.id, getLocalDayKey(logTime)),
      });
      const normalizedLog: ActivityLog = {
        ...rawLog,
        activityId: option.id,
        activityName: option.name,
        category: option.category,
        timestamp:
          typeof rawLog.timestamp === 'string' && rawLog.timestamp.length > 0
            ? rawLog.timestamp
            : new Date(logTime).toLocaleString('ko-KR'),
        amount,
        unit: option.defaultUnit,
        difficulty: difficulty.name,
        difficultyMultiplier: difficulty.multiplier,
        streakBonus: calculation.streakBonusPercent,
        isVerified: false,
        earnedExp: calculation.totalExp,
        primaryStat: option.primaryStat,
        primaryExp: calculation.primaryExp,
        secondaryStat: option.secondaryStat,
        secondaryExp: calculation.secondaryExp,
        note: typeof rawLog.note === 'string' ? rawLog.note.slice(0, 500) : undefined,
        createdAt,
        levelUpEvents: undefined,
      };

      replayedLogs.push(normalizedLog);
      replayedProfile = { ...replayedProfile, ...getNextStreakState(replayedProfile, replayedLogs.slice(0, -1), logTime) };
      return normalizedLog;
    });

  return normalizedChronological.reverse();
};

const createFreshAchievements = () =>
  INITIAL_USER_PROFILE.initialAchievements.map((achievement) => ({
    ...achievement,
    currentMetric: 0,
    isUnlocked: false,
    unlockedAt: undefined,
  }));

const isDemoPersistedState = (state: Partial<PersistedState> | null) =>
  Boolean(
    state &&
      (state.profile?.name === INITIAL_USER_PROFILE.profile.name ||
        (!state.hasCompletedOnboarding && (state.profile?.totalExp ?? 0) > 0)),
  );

type AppStateSnapshot = {
  profile: UserProfile;
  baseProfile: UserProfile;
  quests: Quest[];
  achievements: typeof INITIAL_USER_PROFILE.initialAchievements;
};

const calculateActivityLogExp = (
  log: ActivityLog,
  option: ActivityOption,
  replayedLogs: ActivityLog[],
  streakDays: number,
) => calculateActivityExp({
  baseExpPerUnit: option.baseExpPerUnit,
  amount: log.amount,
  difficultyMultiplier: log.difficultyMultiplier,
  streakDays,
  isVerified: log.isVerified,
  isFirstTime: !replayedLogs.some((item) => item.activityId === option.id),
  isPersonalBest: (() => {
    const previousBest = replayedLogs
      .filter((item) => item.activityId === option.id)
      .reduce((best, item) => Math.max(best, item.amount), 0);
    return previousBest > 0 && log.amount > previousBest;
  })(),
  maxDailyCapAmount: option.maxDailyCapAmount,
  currentDayAmountSoFar: getDailyAmount(
    replayedLogs,
    option.id,
    getLocalDayKey(log.createdAt ?? Date.now()),
  ),
});

const recalculateActivityLogs = (logs: ActivityLog[], baseProfile: UserProfile): ActivityLog[] => {
  const replayedLogs: ActivityLog[] = [];
  let replayedProfile = baseProfile;

  const recalculatedChronological = logs
    .filter((log) => !log.id.startsWith('log-prev-'))
    .slice()
    .reverse()
    .map((log) => {
      const option = ACTIVITY_OPTIONS.find((activity) => activity.id === log.activityId);
      if (!option) return log;

      const calculation = calculateActivityLogExp(log, option, replayedLogs, replayedProfile.streakDays);
      const recalculatedLog: ActivityLog = {
        ...log,
        activityId: option.id,
        activityName: option.name,
        category: option.category,
        unit: option.defaultUnit,
        streakBonus: calculation.streakBonusPercent,
        earnedExp: calculation.totalExp,
        primaryStat: option.primaryStat,
        primaryExp: calculation.primaryExp,
        secondaryStat: option.secondaryStat,
        secondaryExp: calculation.secondaryExp,
      };

      replayedLogs.push(recalculatedLog);
      replayedProfile = {
        ...replayedProfile,
        ...getNextStreakState(
          replayedProfile,
          replayedLogs.slice(0, -1),
          log.createdAt ?? Date.now(),
        ),
      };
      return recalculatedLog;
    });

  return recalculatedChronological.reverse();
};

const applyActivityToSnapshot = (
  state: AppStateSnapshot,
  option: ActivityOption,
  amount: number,
  calculation: ExpCalculationResult,
  context: { existingLogs?: ActivityLog[]; loggedAt?: number } = {},
): AppStateSnapshot => {
  if (calculation.totalExp <= 0) return state;

  const updatedStats = { ...state.profile.coreStats };
  const addStatExp = (key: CoreStatKey | undefined, exp: number) => {
    if (!key || !updatedStats[key]) return;
    const stat = { ...updatedStats[key] };
    let remainingExp = stat.currentExp + exp;
    let level = stat.level;
    let nextLevelExp = stat.nextLevelExp;

    while (remainingExp >= nextLevelExp) {
      remainingExp -= nextLevelExp;
      level += 1;
      nextLevelExp = getRequiredExpForLevel(level + 1);
    }

    updatedStats[key] = { ...stat, level, currentExp: remainingExp, nextLevelExp };
  };

  addStatExp(option.primaryStat, calculation.primaryExp);
  addStatExp(option.secondaryStat, calculation.secondaryExp);

  const updatedSubSkills = { ...state.profile.subSkills };
  const currentSubSkill = updatedSubSkills[option.id];
  if (currentSubSkill) {
    const sub = { ...currentSubSkill };
    let nextExp = sub.exp + calculation.totalExp;
    let level = sub.level;
    let requiredExp = sub.nextExp;
    while (nextExp >= requiredExp) {
      nextExp -= requiredExp;
      level += 1;
      requiredExp = Math.floor(requiredExp * 1.25);
    }
    updatedSubSkills[option.id] = {
      ...sub,
      totalAmount: sub.totalAmount + amount,
      totalActivitiesCount: sub.totalActivitiesCount + 1,
      exp: nextExp,
      level,
      nextExp: requiredExp,
    };
  } else {
    let subLevel = 1;
    let subExp = calculation.totalExp;
    let subNextExp = 200;
    while (subExp >= subNextExp) {
      subExp -= subNextExp;
      subLevel += 1;
      subNextExp = Math.floor(subNextExp * 1.25);
    }
    updatedSubSkills[option.id] = {
      id: option.id,
      name: option.name,
      category: option.category,
      parentStat: option.primaryStat,
      level: subLevel,
      exp: subExp,
      nextExp: subNextExp,
      totalActivitiesCount: 1,
      unit: option.defaultUnit,
      totalAmount: amount,
    };
  }

  const playerInfo = getPlayerLevelFromTotalExp(state.profile.totalExp + calculation.totalExp);
  const updatedProfile: UserProfile = {
    ...state.profile,
    totalExp: state.profile.totalExp + calculation.totalExp,
    playerLevel: playerInfo.level,
    currentLevelExp: playerInfo.currentExp,
    nextLevelExp: playerInfo.nextExp,
    rankTier: getTierFromLevel(playerInfo.level),
    weeklyExp: state.profile.weeklyExp + calculation.totalExp,
    coreStats: updatedStats,
    subSkills: updatedSubSkills,
  };

  const updatedQuests = state.quests.map((quest) => {
      const increment = getQuestProgressIncrement(quest, option, amount, context);
      if (increment === 0) return quest;
      const currentAmount = quest.currentAmount + increment;
      return {
        ...quest,
        currentAmount,
        isCompleted: currentAmount >= quest.targetAmount,
      };
    })

  const updatedAchievements = state.achievements.map((achievement) => {
    if (achievement.isUnlocked) return achievement;
    if (achievement.id === 'ach-1') {
      return {
        ...achievement,
        currentMetric: 1,
        isUnlocked: true,
        unlockedAt: new Date().toISOString().slice(0, 10),
      };
    }
    if (achievement.id === 'ach-2' && option.id === 'running') {
      const currentMetric = updatedSubSkills.running?.totalAmount || achievement.currentMetric;
      return {
        ...achievement,
        currentMetric,
        isUnlocked: currentMetric >= achievement.requiredMetric,
        unlockedAt: currentMetric >= achievement.requiredMetric ? new Date().toISOString().slice(0, 10) : undefined,
      };
    }
    if (achievement.id === 'ach-5' && option.id === 'running') {
      const currentMetric = updatedSubSkills.running?.totalAmount || achievement.currentMetric;
      return {
        ...achievement,
        currentMetric,
        isUnlocked: currentMetric >= achievement.requiredMetric,
        unlockedAt: currentMetric >= achievement.requiredMetric ? new Date().toISOString().slice(0, 10) : undefined,
      };
    }
    if (achievement.id === 'ach-6' && option.id === 'coding') {
      const currentMetric = updatedSubSkills.coding?.totalAmount || achievement.currentMetric;
      return {
        ...achievement,
        currentMetric,
        isUnlocked: currentMetric >= achievement.requiredMetric,
        unlockedAt: currentMetric >= achievement.requiredMetric ? new Date().toISOString().slice(0, 10) : undefined,
      };
    }
    return achievement;
  });

  return { ...state, profile: updatedProfile, quests: updatedQuests, achievements: updatedAchievements };
};

const rebuildStateFromLogs = (
  logs: ActivityLog[],
  currentState: AppStateSnapshot,
): AppStateSnapshot & { activityLogs: ActivityLog[] } => {
  const recalculatedLogs = recalculateActivityLogs(logs, currentState.baseProfile);
  const baselineQuests = createFreshQuests().map((quest) => {
    const currentQuest = currentState.quests.find((item) => item.id === quest.id);
    return {
      ...quest,
      isClaimed: Boolean(currentQuest?.isClaimed),
    };
  });
  let rebuilt: AppStateSnapshot = {
    profile: {
      ...currentState.baseProfile,
    },
    baseProfile: currentState.baseProfile,
    quests: baselineQuests,
    achievements: createFreshAchievements(),
  };

  const replayedLogs: ActivityLog[] = [];
  recalculatedLogs
    .slice()
    .reverse()
    .forEach((log) => {
      const option = ACTIVITY_OPTIONS.find((activity) => activity.id === log.activityId);
      if (!option) return;
      const calculation = calculateActivityLogExp(log, option, replayedLogs, rebuilt.profile.streakDays);
      rebuilt = applyActivityToSnapshot(rebuilt, option, log.amount, calculation, {
        existingLogs: replayedLogs,
        loggedAt: log.createdAt,
      });
      const streakState = getNextStreakState(
        rebuilt.profile,
        replayedLogs,
        log.createdAt ?? Date.now(),
      );
      rebuilt.profile = { ...rebuilt.profile, ...streakState };
      replayedLogs.push(log);
    });

  const claimedQuestRewards = currentState.profile.claimedQuestRewards;
  const legacyClaimedRewards = claimedQuestRewards
    ? 0
    : currentState.quests
      .filter((quest) => quest.isClaimed)
      .reduce((total, quest) => total + quest.expReward, 0);
  const newlyClaimedRewards = Object.values(claimedQuestRewards || {}).reduce(
    (total, reward) => total + (Number.isFinite(reward) && reward > 0 ? reward : 0),
    legacyClaimedRewards,
  );
  rebuilt.profile = { ...rebuilt.profile, claimedQuestRewards: claimedQuestRewards || {} };
  if (newlyClaimedRewards > 0) {
    const playerInfo = getPlayerLevelFromTotalExp(rebuilt.profile.totalExp + newlyClaimedRewards);
    rebuilt.profile = {
      ...rebuilt.profile,
      totalExp: rebuilt.profile.totalExp + newlyClaimedRewards,
      weeklyExp: rebuilt.profile.weeklyExp + newlyClaimedRewards,
      playerLevel: playerInfo.level,
      currentLevelExp: playerInfo.currentExp,
      nextLevelExp: playerInfo.nextExp,
      rankTier: getTierFromLevel(playerInfo.level),
    };
  }

  return { ...rebuilt, activityLogs: recalculatedLogs };
};

export default function App() {
  const [persistedState] = useState<Partial<PersistedState> | null>(() => readPersistedState());
  const shouldStartFresh = !persistedState || isDemoPersistedState(persistedState);
  const hasSavedUserState = Boolean(persistedState && !shouldStartFresh);

  // Navigation Mode
  const [activeTab, setActiveTab] = useState<'app' | 'prd'>('app');
  const [appSubTab, setAppSubTab] = useState<'status' | 'quests' | 'achievements' | 'history'>('status');

  // State
  const [profile, setProfile] = useState<UserProfile>(
    () => (hasSavedUserState && persistedState?.profile ? persistedState.profile : createFreshProfile()),
  );
  const [baseProfile, setBaseProfile] = useState<UserProfile>(
    () => (hasSavedUserState && persistedState?.baseProfile
      ? persistedState.baseProfile
      : createFreshProfile(persistedState?.profile?.name)),
  );
  const [quests, setQuests] = useState<Quest[]>(
    () => (hasSavedUserState ? mergeSavedQuests(persistedState?.quests, persistedState?.activityLogs) : createFreshQuests()),
  );
  const [achievements, setAchievements] = useState(
    () => (hasSavedUserState && persistedState?.achievements ? persistedState.achievements : createFreshAchievements()),
  );
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>(
    () => (hasSavedUserState && persistedState?.activityLogs ? persistedState.activityLogs : []),
  );
  const [settings, setSettings] = useState<AppSettings>(
    () => (hasSavedUserState ? normalizeSettings(persistedState?.settings) : createDefaultSettings()),
  );
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(
    () => Boolean(persistedState?.hasCompletedOnboarding) || hasSavedUserState,
  );
  const [showSettings, setShowSettings] = useState(false);
  const [editingLog, setEditingLog] = useState<ActivityLog | null>(null);
  const [loggerStatKey, setLoggerStatKey] = useState<CoreStatKey | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [appNotice, setAppNotice] = useState<{ type: 'success' | 'error' | 'info'; message: string } | null>(null);
  const claimingQuestIds = useRef(new Set<string>());
  const dailyQuote = SELF_CONTROL_QUOTES[new Date().getDate() % SELF_CONTROL_QUOTES.length];
  const [todayKey, setTodayKey] = useState(() => getLocalDayKey());

  useEffect(() => {
    if (!hasCompletedOnboarding) return;
    try {
      window.localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ profile, baseProfile, quests, achievements, activityLogs, settings, hasCompletedOnboarding } satisfies PersistedState),
      );
    } catch {
      // Storage can be unavailable in private browsing or a restricted WebView.
    }
  }, [profile, baseProfile, quests, achievements, activityLogs, settings, hasCompletedOnboarding]);

  useEffect(() => {
    if (!hasSavedUserState || !persistedState?.activityLogs) return;

    // Reconcile older or interrupted saves on startup so the visible profile
    // always matches the authoritative local activity log and reward ledger.
    const reconciled = rebuildStateFromLogs(persistedState.activityLogs, {
      profile,
      baseProfile,
      quests,
      achievements,
    });
    setProfile(reconciled.profile);
    setQuests(reconciled.quests);
    setAchievements(reconciled.achievements);
    setActivityLogs(reconciled.activityLogs);
  }, []);

  useEffect(() => {
    if (!appNotice) return;
    const timeout = window.setTimeout(() => setAppNotice(null), 5000);
    return () => window.clearTimeout(timeout);
  }, [appNotice]);

  useEffect(() => {
    const rolloverTimer = window.setInterval(() => {
      const nextDayKey = getLocalDayKey();
      if (nextDayKey === todayKey) return;
      setTodayKey(nextDayKey);
      setQuests((current) => mergeSavedQuests(current, activityLogs, new Date()));
    }, 60 * 1000);
    return () => window.clearInterval(rolloverTimer);
  }, [activityLogs, todayKey]);

  // Modals
  const [showLogger, setShowLogger] = useState<boolean>(false);
  const [showOnboarding, setShowOnboarding] = useState<boolean>(() => !hasCompletedOnboarding);
  const [showTitles, setShowTitles] = useState<boolean>(false);
  const [levelUpEvent, setLevelUpEvent] = useState<LevelUpEvent | null>(null);
  const navigationState = {
    activeTab,
    appSubTab,
    hasCompletedOnboarding,
    showLogger,
    showOnboarding,
    showSettings,
    showTitles,
  };
  const navigationRef = useRef(navigationState);
  const historyInitializedRef = useRef(false);
  const appRootRef = useRef<HTMLDivElement>(null);
  navigationRef.current = navigationState;

  useEffect(() => {
    const closeNestedViewOrConfirmExit = () => {
      const current = navigationRef.current;
      if (current.showLogger) {
        setShowLogger(false);
        setEditingLog(null);
        setLoggerStatKey(null);
        return true;
      }
      if (current.showSettings) {
        setShowSettings(false);
        return true;
      }
      if (current.showTitles) {
        setShowTitles(false);
        return true;
      }
      if (current.showOnboarding && current.hasCompletedOnboarding) {
        setShowOnboarding(false);
        return true;
      }
      const visibleActiveTab = appRootRef.current?.dataset.activeTab || current.activeTab;
      const visibleAppSubTab = appRootRef.current?.dataset.appSubTab || current.appSubTab;
      if (visibleActiveTab === 'prd') {
        setActiveTab('app');
        return true;
      }
      if (visibleAppSubTab !== 'status') {
        setAppSubTab('status');
        return true;
      }
      return false;
    };

    const confirmExit = () => window.confirm('앱을 종료하시겠습니까?');

    let removeNativeListener: (() => Promise<void>) | undefined;
    if (Capacitor.isNativePlatform()) {
      CapacitorApp.addListener('backButton', () => {
        if (closeNestedViewOrConfirmExit()) return;
        if (confirmExit()) void CapacitorApp.exitApp();
      }).then((listener) => {
        removeNativeListener = () => listener.remove();
      });
    }

    const historyState = { liferpgRoot: true };
    if (!historyInitializedRef.current) {
      window.history.pushState(historyState, document.title, window.location.href);
      historyInitializedRef.current = true;
    }
    const handlePopState = () => {
      if (closeNestedViewOrConfirmExit()) {
        window.history.pushState(historyState, document.title, window.location.href);
        return;
      }

      if (confirmExit()) {
        // Browsers only allow window.close() for script-opened windows. The
        // notice below makes the limitation explicit for regular tabs.
        window.close();
        setAppNotice({ type: 'info', message: '브라우저 탭은 보안상 자동으로 닫히지 않습니다. 이 탭을 닫아 주세요.' });
      }
      window.history.pushState(historyState, document.title, window.location.href);
    };
    window.addEventListener('popstate', handlePopState);
    return () => {
      window.removeEventListener('popstate', handlePopState);
      void removeNativeListener?.();
    };
  }, []);

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
    if (!Number.isFinite(amount) || amount < option.minAmount || amount > option.maxDailyCapAmount) {
      setAppNotice({
        type: 'error',
        message: `입력값은 ${option.minAmount}${formatUnitLabel(option.defaultUnit)} 이상 ${option.maxDailyCapAmount}${formatUnitLabel(option.defaultUnit)} 이하로 입력해 주세요.`,
      });
      return;
    }

    const now = Date.now();
    const isDuplicate = activityLogs.some(
      (log) =>
        log.activityId === option.id &&
        log.amount === amount &&
        log.createdAt &&
        now - log.createdAt < 10 * 60 * 1000,
    );
    if (isDuplicate) {
      setAppNotice({ type: 'error', message: '최근 10분 안에 같은 활동이 이미 기록되어 있습니다.' });
      return;
    }

    const currentDayAmountSoFar = getDailyAmount(activityLogs, option.id, getLocalDayKey(now));
    const remainingDailyAmount = Math.max(0, option.maxDailyCapAmount - currentDayAmountSoFar);
    if (amount > remainingDailyAmount) {
      setAppNotice({
        type: 'error',
        message: `오늘 ${formatUnitLabel(option.defaultUnit)} 보상 한도까지 ${remainingDailyAmount}${formatUnitLabel(option.defaultUnit)}만 남았습니다. 반복 파밍을 막기 위해 더 기록할 수 없습니다.`,
      });
      return;
    }

    // Recalculate at save time so stale UI values cannot bypass the local
    // daily cap or the first-time / personal-best rules.
    const isFirstTime = !activityLogs.some((log) => log.activityId === option.id);
    const previousBest = activityLogs
      .filter((log) => log.activityId === option.id)
      .reduce((best, log) => Math.max(best, log.amount), 0);
    const isPersonalBest = previousBest > 0 && amount > previousBest;
    calculation = calculateActivityExp({
      baseExpPerUnit: option.baseExpPerUnit,
      amount,
      difficultyMultiplier,
      streakDays: profile.streakDays,
      // No external sensor connector exists in this local-only build.
      isVerified: false,
      isFirstTime,
      isPersonalBest,
      maxDailyCapAmount: option.maxDailyCapAmount,
      currentDayAmountSoFar,
    });
    const streakState = getNextStreakState(profile, activityLogs, now);

    const earnedExp = calculation.totalExp;
    const oldTotalExp = profile.totalExp;
    const newTotalExp = oldTotalExp + earnedExp;

    const oldPlayerInfo = getPlayerLevelFromTotalExp(oldTotalExp);
    const newPlayerInfo = getPlayerLevelFromTotalExp(newTotalExp);

    // Update Core Stats
    const updatedStats = { ...profile.coreStats };
    let statLevelUpDetected: { key: string; name: string; oldL: number; newL: number } | null = null;

    const applyStatExp = (key: CoreStatKey | undefined, exp: number) => {
      if (!key || !updatedStats[key]) return;
      const stat = { ...updatedStats[key] };
      const oldLevel = stat.level;
      let remainingExp = stat.currentExp + exp;
      while (remainingExp >= stat.nextLevelExp) {
        remainingExp -= stat.nextLevelExp;
        stat.level += 1;
        stat.nextLevelExp = getRequiredExpForLevel(stat.level + 1);
      }
      stat.currentExp = remainingExp;
      updatedStats[key] = stat;
      if (!statLevelUpDetected && stat.level > oldLevel) {
        statLevelUpDetected = { key, name: stat.nameKr, oldL: oldLevel, newL: stat.level };
      }
    };

    // Primary Stat
    applyStatExp(option.primaryStat, calculation.primaryExp);

    // Secondary Stat if any
    applyStatExp(option.secondaryStat, calculation.secondaryExp);

    // Update Subskills
    const updatedSubSkills = { ...profile.subSkills };
    if (updatedSubSkills[option.id]) {
      const sub = { ...updatedSubSkills[option.id] };
      sub.totalAmount += amount;
      sub.totalActivitiesCount += 1;
      sub.exp += earnedExp;
      while (sub.exp >= sub.nextExp) {
        sub.level += 1;
        sub.exp = sub.exp - sub.nextExp;
        sub.nextExp = Math.floor(sub.nextExp * 1.25);
      }
      updatedSubSkills[option.id] = sub;
    } else {
      let subLevel = 1;
      let subExp = earnedExp;
      let subNextExp = 200;
      while (subExp >= subNextExp) {
        subExp -= subNextExp;
        subLevel += 1;
        subNextExp = Math.floor(subNextExp * 1.25);
      }
      updatedSubSkills[option.id] = {
        id: option.id,
        name: option.name,
        category: option.category,
        parentStat: option.primaryStat,
        level: subLevel,
        exp: subExp,
        nextExp: subNextExp,
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
      streakDays: streakState.streakDays,
      maxStreak: streakState.maxStreak,
      streakShieldCount: streakState.streakShieldCount,
      weeklyExp: profile.weeklyExp + earnedExp,
      coreStats: updatedStats,
      subSkills: updatedSubSkills,
    };

    setProfile(updatedProfile);

    // Update Quests
    const updatedQuests = quests.map((q) => {
      const increment = calculation.totalExp > 0
        ? getQuestProgressIncrement(q, option, amount, { existingLogs: activityLogs, loggedAt: now })
        : 0;
      if (increment === 0) return q;
      const newAmt = q.currentAmount + increment;
      return { ...q, currentAmount: newAmt, isCompleted: newAmt >= q.targetAmount };
    });
    setQuests(updatedQuests);

    // Update Achievements
    const updatedAchievements = achievements.map((ach) => {
      if (ach.isUnlocked) return ach;
      const metrics: Record<string, number> = {
        'ach-1': activityLogs.length + 1,
        'ach-2': updatedSubSkills.running?.totalAmount || 0,
        'ach-3': updatedSubSkills.reading?.totalAmount || 0,
        'ach-4': updatedProfile.streakDays,
        'ach-5': updatedSubSkills.running?.totalAmount || 0,
        'ach-6': updatedSubSkills.coding?.totalAmount || 0,
        'ach-7': updatedSubSkills.finance_log?.totalActivitiesCount || 0,
      };
      const currentMetric = metrics[ach.id] ?? ach.currentMetric;
      const isUnlocked = currentMetric >= ach.requiredMetric;
      return {
        ...ach,
        currentMetric,
        isUnlocked,
        unlockedAt: isUnlocked ? new Date(now).toISOString().slice(0, 10) : undefined,
      };
    });
    setAchievements(updatedAchievements);

    // Create Log
    const newLog: ActivityLog = {
      id: `log-${Date.now()}`,
      activityId: option.id,
      activityName: option.name,
      category: option.category,
      timestamp: new Intl.DateTimeFormat('ko-KR', {
        month: 'numeric',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }).format(now),
      amount,
      unit: option.defaultUnit,
      difficulty: difficultyName,
      difficultyMultiplier,
      streakBonus: calculation.streakBonusPercent,
       isVerified: false,
      earnedExp,
      primaryStat: option.primaryStat,
      primaryExp: calculation.primaryExp,
      secondaryStat: option.secondaryStat,
      secondaryExp: calculation.secondaryExp,
      note,
      createdAt: now,
    };

    setActivityLogs([newLog, ...activityLogs]);
    setShowLogger(false);
    setEditingLog(null);
    setLoggerStatKey(null);
    setAppNotice({ type: 'success', message: `${option.name} 기록이 저장되었습니다. +${earnedExp} EXP` });
    if (settings.hapticsEnabled && 'vibrate' in navigator) navigator.vibrate(20);

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
        weeklyMetricSummary: `이번 주 관련 활동 ${updatedSubSkills[option.id]?.totalAmount || amount}${formatUnitLabel(option.defaultUnit)} 돌파`,
        nextGoalSuggestion: `내일 추가 활동 시 ${statLevelUpDetected.name} Lv.${statLevelUpDetected.newL + 1} 달성이 눈앞입니다!`,
      });
    }
  };

  const handleUpdateActivity = (
    logId: string,
    option: ActivityOption,
    amount: number,
    difficultyMultiplier: number,
    difficultyName: string,
    isVerified: boolean,
    calculation: ExpCalculationResult,
    note?: string,
  ) => {
    const target = activityLogs.find((log) => log.id === logId);
    if (!target) {
      setAppNotice({ type: 'error', message: '수정할 기록을 찾지 못했습니다. 기록 목록을 새로고침해 주세요.' });
      return;
    }
    if (!Number.isFinite(amount) || amount < option.minAmount || amount > option.maxDailyCapAmount) {
      setAppNotice({ type: 'error', message: `입력값은 ${option.minAmount}~${option.maxDailyCapAmount}${formatUnitLabel(option.defaultUnit)} 범위여야 합니다.` });
      return;
    }

    const recordedAt = target.createdAt ?? Date.now();
    const dayKey = getLocalDayKey(recordedAt);
    const isDuplicate = activityLogs.some(
      (log) =>
        log.id !== logId &&
        log.activityId === option.id &&
        log.amount === amount &&
        log.createdAt !== undefined &&
        Math.abs(recordedAt - log.createdAt) < 10 * 60 * 1000,
    );
    if (isDuplicate) {
      setAppNotice({ type: 'error', message: '같은 시간대에 같은 활동 수치가 이미 있습니다. 기존 기록을 다시 확인해 주세요.' });
      return;
    }

    const currentDayAmountSoFar = getDailyAmount(activityLogs, option.id, dayKey, logId);
    const remainingDailyAmount = Math.max(0, option.maxDailyCapAmount - currentDayAmountSoFar);
    if (amount > remainingDailyAmount) {
      setAppNotice({
        type: 'error',
        message: `수정 후 오늘 누적 ${formatUnitLabel(option.defaultUnit)}가 한도를 넘습니다. 남은 수치는 ${remainingDailyAmount}${formatUnitLabel(option.defaultUnit)}입니다.`,
      });
      return;
    }

    const isFirstTime = !activityLogs.some((log) => log.id !== logId && log.activityId === option.id);
    const previousBest = activityLogs
      .filter((log) => log.id !== logId && log.activityId === option.id)
      .reduce((best, log) => Math.max(best, log.amount), 0);
    const correctedCalculation = calculateActivityExp({
      baseExpPerUnit: option.baseExpPerUnit,
      amount,
      difficultyMultiplier,
      streakDays: profile.streakDays,
      isVerified: false,
      isFirstTime,
      isPersonalBest: previousBest > 0 && amount > previousBest,
      maxDailyCapAmount: option.maxDailyCapAmount,
      currentDayAmountSoFar,
    });

    const updatedLogs = activityLogs.map((log) =>
      log.id === logId
        ? {
            ...log,
            activityId: option.id,
            activityName: option.name,
            category: option.category,
            amount,
            unit: option.defaultUnit,
            difficulty: difficultyName,
            difficultyMultiplier,
            isVerified: false,
            streakBonus: correctedCalculation.streakBonusPercent,
            earnedExp: correctedCalculation.totalExp,
            primaryStat: option.primaryStat,
            primaryExp: correctedCalculation.primaryExp,
            secondaryStat: option.secondaryStat,
            secondaryExp: correctedCalculation.secondaryExp,
            note,
          }
        : log,
    );
    const rebuilt = rebuildStateFromLogs(updatedLogs, { profile, baseProfile, quests, achievements });
    setActivityLogs(rebuilt.activityLogs);
    setProfile(rebuilt.profile);
    setQuests(rebuilt.quests);
    setAchievements(rebuilt.achievements);
    setEditingLog(null);
    setLoggerStatKey(null);
    setShowLogger(false);
    setAppNotice({ type: 'success', message: '활동 기록을 다시 계산하고 통계를 복구했습니다.' });
  };

  const handleDeleteActivity = (logId: string) => {
    const target = activityLogs.find((log) => log.id === logId);
    if (!target) {
      setAppNotice({ type: 'info', message: '삭제할 기록을 찾지 못했습니다.' });
      setConfirmDeleteId(null);
      return;
    }
    const updatedLogs = activityLogs.filter((log) => log.id !== logId);
    const rebuilt = rebuildStateFromLogs(updatedLogs, { profile, baseProfile, quests, achievements });
    setActivityLogs(rebuilt.activityLogs);
    setProfile(rebuilt.profile);
    setQuests(rebuilt.quests);
    setAchievements(rebuilt.achievements);
    setConfirmDeleteId(null);
    setAppNotice({ type: 'success', message: '기록이 삭제되고 관련 통계가 복구되었습니다.' });
  };

  const openActivityLogger = (statKey?: CoreStatKey) => {
    setLoggerStatKey(statKey ?? null);
    setShowLogger(true);
  };

  const handleExportData = () => {
    const payload = JSON.stringify(
      {
        version: 2,
        exportedAt: new Date().toISOString(),
        profile,
        baseProfile,
        quests,
        achievements,
        activityLogs,
        settings,
        hasCompletedOnboarding,
      },
      null,
      2,
    );
    const blob = new Blob([payload], { type: 'application/json;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `liferpg-backup-${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    URL.revokeObjectURL(url);
    setSettings((current) => ({ ...current, lastBackupAt: new Date().toISOString() }));
    setAppNotice({ type: 'success', message: '백업 파일을 다운로드했습니다.' });
  };

  const handleImportData = async (file: File) => {
    try {
      const parsed = JSON.parse(await file.text()) as Partial<PersistedState>;
      if (!parsed.profile || !Array.isArray(parsed.quests) || !Array.isArray(parsed.achievements) || !Array.isArray(parsed.activityLogs)) {
        throw new Error('invalid backup');
      }

       const importedLogs = normalizeImportedLogs(parsed.activityLogs);

      const importedBaseProfile = parsed.baseProfile
        ? parsed.baseProfile
        : {
            ...createFreshProfile(parsed.profile.name),
            title: parsed.profile.title,
            unlockedTitles: parsed.profile.unlockedTitles,
          };
      const importedQuests = mergeSavedQuests(parsed.quests, importedLogs);
      const rebuilt = rebuildStateFromLogs(importedLogs, {
        profile: parsed.profile,
        baseProfile: importedBaseProfile,
        quests: importedQuests,
        achievements: parsed.achievements,
      });
      setProfile(rebuilt.profile);
      setBaseProfile(importedBaseProfile);
      setQuests(rebuilt.quests);
      setAchievements(rebuilt.achievements);
      setActivityLogs(rebuilt.activityLogs);
      setSettings(normalizeSettings(parsed.settings));
      setHasCompletedOnboarding(true);
      setAppNotice({ type: 'success', message: '백업 데이터를 검사한 뒤 로컬 기록 기준으로 복원했습니다.' });
    } catch {
      setAppNotice({ type: 'error', message: '백업 파일을 읽지 못했습니다. LifeRPG JSON 파일인지 확인해 주세요.' });
    }
  };

  const handleResetData = () => {
    const freshProfile = createFreshProfile();
    setProfile(freshProfile);
    setBaseProfile(freshProfile);
    setQuests(createFreshQuests());
    setAchievements(createFreshAchievements());
    setActivityLogs([]);
    setSettings(createDefaultSettings());
    setHasCompletedOnboarding(false);
    setShowSettings(false);
    setShowOnboarding(true);
    setEditingLog(null);
    setLoggerStatKey(null);
    window.localStorage.removeItem(STORAGE_KEY);
    setAppNotice({ type: 'success', message: '데이터를 초기화했습니다. 새 프로필을 만들어 주세요.' });
  };

  const handleNotificationPermission = async () => {
    if (!('Notification' in window)) {
      setSettings((current) => ({ ...current, notificationStatus: 'unsupported' }));
      setAppNotice({ type: 'info', message: '현재 실행 환경에서는 알림 기능을 지원하지 않습니다.' });
      return;
    }
    const permission = await Notification.requestPermission();
    setSettings((current) => ({
      ...current,
      notificationStatus: permission === 'granted' ? 'granted' : permission === 'denied' ? 'denied' : 'unknown',
      remindersEnabled: permission === 'granted' ? current.remindersEnabled : false,
    }));
    setAppNotice({
      type: permission === 'granted' ? 'success' : 'info',
      message: permission === 'granted' ? '알림 권한이 허용되었습니다.' : '알림 권한이 허용되지 않았습니다.',
    });
  };

  // Claim Quest Reward
  const handleClaimQuest = (questId: string) => {
    const q = quests.find((item) => item.id === questId);
    if (!q || q.isClaimed || !q.isCompleted) return;
    if (claimingQuestIds.current.has(questId)) return;
    claimingQuestIds.current.add(questId);

    const rewardExp = Number(q.expReward);
    if (!Number.isFinite(rewardExp) || rewardExp <= 0) {
      claimingQuestIds.current.delete(questId);
      setAppNotice({ type: 'error', message: '이 퀘스트의 보상 데이터가 올바르지 않아 수령을 중단했습니다.' });
      return;
    }
    const newTotalExp = profile.totalExp + rewardExp;
    const newPlayerInfo = getPlayerLevelFromTotalExp(newTotalExp);
    const updatedStats = { ...profile.coreStats };
    const rewardStat = updatedStats[q.statReward];
    if (rewardStat) {
      let remainingExp = rewardStat.currentExp + rewardExp;
      let level = rewardStat.level;
      let nextLevelExp = rewardStat.nextLevelExp;
      while (remainingExp >= nextLevelExp) {
        remainingExp -= nextLevelExp;
        level += 1;
        nextLevelExp = getRequiredExpForLevel(level + 1);
      }
      updatedStats[q.statReward] = { ...rewardStat, level, currentExp: remainingExp, nextLevelExp };
    }

    const rewardKey = `${q.id}:${q.dateKey || 'permanent'}`;
    setProfile({
      ...profile,
      totalExp: newTotalExp,
      playerLevel: newPlayerInfo.level,
      currentLevelExp: newPlayerInfo.currentExp,
      nextLevelExp: newPlayerInfo.nextExp,
      weeklyExp: profile.weeklyExp + rewardExp,
      coreStats: updatedStats,
      claimedQuestRewards: {
        ...(profile.claimedQuestRewards || {}),
        [rewardKey]: rewardExp,
      },
    });

    setQuests(
      quests.map((item) => (item.id === questId ? { ...item, isClaimed: true } : item))
    );
    setAppNotice({
      type: 'success',
      message: `보상 수령 완료: +${rewardExp} EXP · ${rewardStat?.nameKr || q.statReward} 능력치에 반영되었습니다.`,
    });
    if (settings.hapticsEnabled && 'vibrate' in navigator) navigator.vibrate([15, 30, 15]);
    claimingQuestIds.current.delete(questId);
  };

  return (
    <div
      ref={appRootRef}
      data-active-tab={activeTab}
      data-app-sub-tab={appSubTab}
      className="saas-shell min-h-screen bg-[#08090d] text-[#E2E8F0] font-sans antialiased relative selection:bg-violet-500 selection:text-white pb-24 lg:pb-0 lg:pl-[248px]"
    >
      <div
        className="app-ambient fixed inset-0 pointer-events-none z-0"
        style={{
          backgroundImage:
            'radial-gradient(circle at 8% 4%, rgba(124, 58, 237, 0.12) 0%, transparent 30%), radial-gradient(circle at 88% 18%, rgba(79, 70, 229, 0.08) 0%, transparent 26%)',
        }}
      />

      <aside className="admin-sidebar fixed inset-y-0 left-0 z-50 hidden w-[248px] flex-col border-r border-white/[0.08] bg-[#0a0b10]/95 px-3 py-4 backdrop-blur-xl lg:flex">
        <div className="flex h-12 items-center gap-3 px-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-violet-400/25 bg-violet-500/15 text-violet-300 shadow-[0_0_18px_rgba(124,58,237,0.12)]">
            <Zap className="h-4 w-4" aria-hidden="true" />
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold tracking-tight text-white">LifeRPG Console</p>
            <p className="text-[10px] font-medium text-slate-500">PERSONAL OPERATIONS</p>
          </div>
        </div>

        <div className="mx-2 my-4 h-px bg-white/[0.07]" />
        <p className="px-3 pb-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-600">Workspace</p>
        <nav className="space-y-1" aria-label="주요 메뉴">
          <button
            type="button"
            onClick={() => { setActiveTab('app'); setAppSubTab('status'); }}
            className={`sidebar-nav-item ${activeTab === 'app' && appSubTab === 'status' ? 'is-active' : ''}`}
            aria-current={activeTab === 'app' && appSubTab === 'status' ? 'page' : undefined}
          >
            <Activity className="h-4 w-4" aria-hidden="true" />
            <span>Overview</span>
          </button>
          <button
            type="button"
            onClick={() => { setActiveTab('app'); setAppSubTab('quests'); }}
            className={`sidebar-nav-item ${activeTab === 'app' && appSubTab === 'quests' ? 'is-active' : ''}`}
            aria-current={activeTab === 'app' && appSubTab === 'quests' ? 'page' : undefined}
          >
            <Swords className="h-4 w-4" aria-hidden="true" />
            <span>Quests</span>
            {quests.filter((quest) => quest.isCompleted && !quest.isClaimed).length > 0 && (
              <span className="ml-auto rounded-md bg-violet-500/20 px-1.5 py-0.5 text-[10px] font-bold text-violet-300">
                {quests.filter((quest) => quest.isCompleted && !quest.isClaimed).length}
              </span>
            )}
          </button>
          <button
            type="button"
            onClick={() => { setActiveTab('app'); setAppSubTab('achievements'); }}
            className={`sidebar-nav-item ${activeTab === 'app' && appSubTab === 'achievements' ? 'is-active' : ''}`}
            aria-current={activeTab === 'app' && appSubTab === 'achievements' ? 'page' : undefined}
          >
            <Trophy className="h-4 w-4" aria-hidden="true" />
            <span>Achievements</span>
          </button>
          <button
            type="button"
            onClick={() => { setActiveTab('app'); setAppSubTab('history'); }}
            className={`sidebar-nav-item ${activeTab === 'app' && appSubTab === 'history' ? 'is-active' : ''}`}
            aria-current={activeTab === 'app' && appSubTab === 'history' ? 'page' : undefined}
          >
            <History className="h-4 w-4" aria-hidden="true" />
            <span>Activity log</span>
            <span className="ml-auto text-[10px] tabular-nums text-slate-600">{activityLogs.length}</span>
          </button>
        </nav>

        <p className="mt-6 px-3 pb-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-600">Documentation</p>
        <button
          type="button"
          onClick={() => setActiveTab('prd')}
          className={`sidebar-nav-item ${activeTab === 'prd' ? 'is-active' : ''}`}
          aria-current={activeTab === 'prd' ? 'page' : undefined}
        >
          <FileText className="h-4 w-4" aria-hidden="true" />
          <span>Product spec</span>
          <span className="ml-auto text-[9px] font-semibold text-slate-600">23</span>
        </button>

        <div className="mt-auto rounded-xl border border-white/[0.08] bg-white/[0.025] p-3">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-violet-500/15 text-sm font-bold text-violet-300">
              {profile.name.charAt(0)}
            </div>
            <div className="min-w-0">
              <p className="truncate text-xs font-semibold text-slate-200">{profile.name}</p>
              <p className="truncate text-[10px] text-slate-500">Lv.{profile.playerLevel} · {profile.title}</p>
            </div>
            <button
              type="button"
              onClick={() => setShowSettings(true)}
              className="ml-auto flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-slate-500 transition hover:bg-white/[0.06] hover:text-slate-200"
              aria-label="설정 및 데이터 관리"
              title="설정 및 데이터 관리"
            >
              <Settings className="h-4 w-4" />
            </button>
          </div>
        </div>
      </aside>

      <header className="mobile-topbar sticky top-0 z-40 border-b border-white/[0.08] bg-[#08090d]/90 px-4 py-3 backdrop-blur-xl sm:px-6 lg:px-8">
        <div className="mx-auto flex w-full max-w-[1400px] items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-violet-400/20 bg-violet-500/10 font-mono text-sm font-bold text-violet-300 lg:hidden">
                {profile.name.charAt(0)}
            </div>
            <div className="min-w-0">
              <p className="hidden text-[10px] font-medium uppercase tracking-[0.14em] text-slate-600 lg:block">LifeRPG / Workspace</p>
              <h1 className="truncate text-sm font-semibold tracking-tight text-white sm:text-base">
                {activeTab === 'prd'
                  ? 'Product specification'
                  : appSubTab === 'status'
                    ? 'Growth overview'
                    : appSubTab === 'quests'
                      ? 'Quest operations'
                      : appSubTab === 'achievements'
                        ? 'Achievements'
                        : 'Activity log'}
              </h1>
              <p className="truncate text-[10px] font-medium text-slate-500 lg:hidden">
                {profile.name} · Lv.{profile.playerLevel}
              </p>
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-1.5 sm:gap-3">
            <button
              type="button"
              onClick={() => setActiveTab(activeTab === 'prd' ? 'app' : 'prd')}
              className={`touch-target rounded-lg border p-2 transition lg:hidden ${
                activeTab === 'prd'
                  ? 'border-violet-400/30 bg-violet-500/15 text-violet-300'
                  : 'border-white/[0.08] bg-white/[0.03] text-slate-400'
              }`}
              aria-label={activeTab === 'prd' ? '앱으로 돌아가기' : 'PRD 열기'}
              title={activeTab === 'prd' ? '앱으로 돌아가기' : 'PRD 열기'}
            >
              <FileText className="w-4 h-4" />
            </button>

            <div className="hidden items-center gap-2 md:flex">
              <div className="metric-chip">
                <Flame className="h-3.5 w-3.5 text-violet-300" aria-hidden="true" />
                <span className="text-slate-500">Streak</span>
                <strong>{profile.streakDays}d</strong>
              </div>
              <div className="metric-chip">
                <Zap className="h-3.5 w-3.5 text-violet-300" aria-hidden="true" />
                <span className="text-slate-500">Total EXP</span>
                <strong>{profile.totalExp.toLocaleString()}</strong>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowSettings(true)}
              className="touch-target rounded-lg border border-white/[0.08] bg-white/[0.03] p-2 text-slate-400 transition hover:border-violet-400/25 hover:bg-white/[0.06] hover:text-violet-300 lg:hidden"
              title="설정 및 데이터 관리"
              aria-label="설정 및 데이터 관리"
            >
              <Settings className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={() => setShowOnboarding(true)}
              className="touch-target rounded-lg border border-white/[0.08] bg-white/[0.03] p-2 text-slate-400 transition hover:border-violet-400/25 hover:bg-white/[0.06] hover:text-violet-300"
              title="캐릭터 스탯 온보딩 캘리브레이션"
              aria-label="캐릭터 스탯 온보딩 캘리브레이션"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* 2. Main Content Area */}
      {appNotice && (
        <div
          role={appNotice.type === 'error' ? 'alert' : 'status'}
          className={`fixed top-[calc(4.75rem+env(safe-area-inset-top))] left-3 right-3 sm:left-auto sm:right-6 sm:w-96 z-[60] rounded-2xl border px-4 py-3 text-xs font-semibold shadow-2xl backdrop-blur-xl ${
            appNotice.type === 'success'
              ? 'bg-emerald-950/90 border-emerald-500/40 text-emerald-100'
              : appNotice.type === 'error'
                ? 'bg-red-950/90 border-red-500/40 text-red-100'
                : 'bg-slate-900/90 border-white/15 text-slate-100'
          }`}
        >
          {appNotice.message}
        </div>
      )}

      <section className="daily-brief relative z-10 mx-auto mt-5 flex max-w-[1400px] items-start gap-3 rounded-xl border border-violet-400/[0.14] bg-violet-500/[0.045] px-4 py-3.5 sm:px-5">
        <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-violet-500/10 text-violet-300">
          <Quote className="h-3.5 w-3.5" aria-hidden="true" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-violet-300/80">Daily focus</p>
          <p className="mt-1 break-words text-sm font-medium leading-6 text-slate-200">“{dailyQuote}”</p>
        </div>
        <span className="hidden rounded-md border border-white/[0.07] bg-black/20 px-2 py-1 text-[9px] font-medium uppercase tracking-wider text-slate-600 sm:block">Private · local</span>
      </section>

      <main className="relative z-10 mx-auto w-full max-w-[1400px] px-3 py-5 sm:px-6 sm:py-6 lg:px-8">
        {activeTab === 'app' ? (
          <div className="space-y-5">
            {/* SubTab Navigation */}
            <div className="mobile-section-tabs grid grid-cols-2 items-center gap-1.5 rounded-xl border border-white/[0.07] bg-white/[0.025] p-1.5 text-xs sm:flex lg:hidden">
              <button
                onClick={() => setAppSubTab('status')}
                aria-current={appSubTab === 'status' ? 'page' : undefined}
                className={`min-h-10 px-3 py-2 rounded-lg font-semibold transition flex items-center justify-center gap-1.5 whitespace-nowrap cursor-pointer ${
                  appSubTab === 'status'
                    ? 'bg-violet-500/15 text-violet-300 border border-violet-400/20'
                    : 'border border-transparent text-slate-500 hover:bg-white/[0.04] hover:text-slate-200'
                }`}
              >
                <Activity className="w-4 h-4" />
                <span>Overview</span>
              </button>
              <button
                onClick={() => setAppSubTab('quests')}
                aria-current={appSubTab === 'quests' ? 'page' : undefined}
                className={`min-h-10 px-3 py-2 rounded-lg font-semibold transition flex items-center justify-center gap-1.5 whitespace-nowrap cursor-pointer ${
                  appSubTab === 'quests'
                    ? 'bg-violet-500/15 text-violet-300 border border-violet-400/20'
                    : 'border border-transparent text-slate-500 hover:bg-white/[0.04] hover:text-slate-200'
                }`}
              >
                <Swords className="w-4 h-4" />
                <span>Quests</span>
                {quests.filter((q) => q.isCompleted && !q.isClaimed).length > 0 && (
                  <span className="w-1.5 h-1.5 rounded-full bg-violet-300" />
                )}
              </button>
              <button
                onClick={() => setAppSubTab('achievements')}
                aria-current={appSubTab === 'achievements' ? 'page' : undefined}
                className={`min-h-10 px-3 py-2 rounded-lg font-semibold transition flex items-center justify-center gap-1.5 whitespace-nowrap cursor-pointer ${
                  appSubTab === 'achievements'
                    ? 'bg-violet-500/15 text-violet-300 border border-violet-400/20'
                    : 'border border-transparent text-slate-500 hover:bg-white/[0.04] hover:text-slate-200'
                }`}
              >
                <Trophy className="w-4 h-4" />
                <span>Badges</span>
              </button>
              <button
                onClick={() => setAppSubTab('history')}
                aria-current={appSubTab === 'history' ? 'page' : undefined}
                className={`min-h-10 px-3 py-2 rounded-lg font-semibold transition flex items-center justify-center gap-1.5 whitespace-nowrap cursor-pointer ${
                  appSubTab === 'history'
                    ? 'bg-violet-500/15 text-violet-300 border border-violet-400/20'
                    : 'border border-transparent text-slate-500 hover:bg-white/[0.04] hover:text-slate-200'
                }`}
              >
                <History className="w-4 h-4" />
                <span>Logs ({activityLogs.length})</span>
              </button>
            </div>

            {/* Views */}
            {appSubTab === 'status' && (
              <StatusWindow
                profile={profile}
                activityLogs={activityLogs}
                onOpenLogger={openActivityLogger}
                onOpenTitles={() => setShowTitles(true)}
              />
            )}

            {appSubTab === 'quests' && (
              <QuestList
                quests={quests}
                streakShieldCount={profile.streakShieldCount ?? 0}
                onClaimQuest={handleClaimQuest}
                onStartQuestAction={(quest) => openActivityLogger(quest.activityIds?.[0] ? ACTIVITY_OPTIONS.find((activity) => activity.id === quest.activityIds[0])?.primaryStat : undefined)}
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
              <div className="admin-panel space-y-4 rounded-xl border border-white/[0.08] bg-[#0d0f15]/90 p-4 sm:p-5">
                <div className="flex items-center justify-between border-b border-white/10 pb-3">
                  <h3 className="text-xs font-semibold text-slate-300 flex items-center gap-2">
                    <History className="w-4 h-4 text-violet-300" />
                    <span>활동 기록 피드</span>
                  </h3>
                  <span className="text-xs font-mono text-slate-400">총 {activityLogs.length}건</span>
                </div>

                <div className="space-y-2.5">
                  {activityLogs.length === 0 ? (
                    <div className="rounded-2xl border border-dashed border-white/15 bg-black/20 px-4 py-10 text-center">
                      <History className="w-8 h-8 mx-auto text-slate-600 mb-3" />
                      <p className="text-sm font-semibold text-slate-300">아직 활동 기록이 없습니다.</p>
                      <p className="text-xs text-slate-500 mt-1">첫 활동을 기록하고 성장 루프를 시작해 보세요.</p>
                    </div>
                  ) : activityLogs.map((log) => (
                    <div
                      key={log.id}
                      className="relative rounded-xl border border-white/[0.08] bg-black/20 p-4 text-xs transition hover:border-violet-400/25 hover:bg-white/[0.025]"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex min-w-0 items-start gap-3">
                          <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-violet-400/20 bg-violet-500/10 text-violet-300">
                            <Activity className="h-4 w-4" aria-hidden="true" />
                          </div>
                          <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="break-words text-sm font-bold text-white">{log.activityName}</span>
                              <span className="rounded-md border border-white/10 bg-white/5 px-1.5 py-0.5 text-[10px] font-semibold text-slate-300">
                                {CATEGORIES_META[log.category]?.nameKr || log.category}
                              </span>
                            </div>
                            <span className="mt-1 block text-[10px] font-mono text-slate-500">
                              {log.createdAt ? new Date(log.createdAt).toLocaleString('ko-KR') : log.timestamp}
                            </span>
                          </div>
                        </div>
                        <div className="shrink-0 text-right">
                          <span className="block text-base font-bold font-mono text-violet-300">+{log.earnedExp}</span>
                          <span className="text-[10px] text-slate-500">활동 EXP</span>
                        </div>
                      </div>

                      <div className="mt-4 grid grid-cols-1 gap-2 rounded-xl border border-white/5 bg-white/[0.03] p-3 sm:grid-cols-3">
                        <div>
                          <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-500">수행량</span>
                          <span className="mt-1 block font-semibold text-slate-200">{log.amount}{formatUnitLabel(log.unit)}</span>
                        </div>
                        <div>
                          <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-500">난이도</span>
                          <span className="mt-1 block break-words font-semibold text-slate-200">{log.difficulty}</span>
                        </div>
                        <div>
                          <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-500">반영 능력</span>
                          <span className="mt-1 block font-semibold text-violet-200">{profile.coreStats[log.primaryStat]?.nameKr || log.primaryStat} +{log.primaryExp} EXP</span>
                          <span className="mt-0.5 block break-words text-[10px] leading-4 text-slate-500">{profile.coreStats[log.primaryStat]?.description}</span>
                        </div>
                      </div>

                      <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
                        <div className="flex flex-wrap items-center gap-2 text-[10px] text-slate-400">
                          <span>Streak +{log.streakBonus}%</span>
                          {log.secondaryStat && <span>· {profile.coreStats[log.secondaryStat]?.nameKr || log.secondaryStat} +{log.secondaryExp}</span>}
                          {log.isVerified && (
                            <span className="rounded-md bg-emerald-500/20 px-1.5 py-0.5 font-bold text-emerald-300 font-mono">
                              외부 인증
                            </span>
                          )}
                        </div>
                        <div className="flex shrink-0 gap-1">
                          <button
                            type="button"
                            onClick={() => { setEditingLog(log); setLoggerStatKey(null); setShowLogger(true); }}
                            className="touch-target w-9 h-9 rounded-lg bg-white/[0.03] border border-white/[0.08] text-slate-400 hover:text-violet-300 hover:border-violet-400/30 flex items-center justify-center"
                            aria-label="활동 기록 수정"
                            title="수정"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setConfirmDeleteId(confirmDeleteId === log.id ? null : log.id)}
                            className="touch-target w-9 h-9 rounded-lg bg-white/5 border border-white/10 text-slate-400 hover:text-red-300 hover:border-red-500/40 flex items-center justify-center"
                            aria-label="활동 기록 삭제"
                            title="삭제"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                      {confirmDeleteId === log.id && (
                        <div className="absolute right-4 top-16 z-10 flex items-center gap-2 rounded-xl border border-red-500/30 bg-red-950/95 px-3 py-2 text-[11px] text-red-100 shadow-xl">
                          <span>삭제할까요?</span>
                          <button type="button" onClick={() => handleDeleteActivity(log.id)} className="rounded-lg bg-red-500 px-2.5 py-1.5 font-bold text-black">삭제</button>
                          <button type="button" onClick={() => setConfirmDeleteId(null)} className="rounded-lg bg-white/10 px-2.5 py-1.5 font-bold">취소</button>
                        </div>
                      )}
                      {log.note && (
                        <p className="mt-3 rounded-lg border border-white/5 bg-white/5 px-2.5 py-2 text-[11px] leading-5 text-slate-300">메모: {log.note}</p>
                      )}
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

      <footer className="mobile-bottom-nav fixed bottom-0 left-0 right-0 z-40 flex min-h-18 items-center justify-center gap-1.5 border-t border-white/[0.08] bg-[#090a0f]/95 px-2 backdrop-blur-xl lg:hidden">
        <button
          type="button"
          onClick={() => {
            setActiveTab('app');
            setAppSubTab('quests');
          }}
          className={`touch-target flex h-11 items-center gap-1.5 rounded-lg border px-3 text-[10px] font-semibold transition sm:px-5 sm:text-xs ${
            activeTab === 'app' && appSubTab === 'quests'
              ? 'border-violet-400/20 bg-violet-500/15 text-violet-200'
              : 'border-transparent text-slate-500 hover:bg-white/[0.04] hover:text-slate-200'
          }`}
          aria-label="퀘스트 보기"
        >
          <Swords className="h-4 w-4 shrink-0" aria-hidden="true" />
          <span>퀘스트</span>
        </button>

        <button
          type="button"
          onClick={() => openActivityLogger()}
          className="touch-target flex h-11 items-center gap-2 rounded-lg bg-violet-500 px-5 text-[10px] font-bold text-white shadow-[0_8px_24px_rgba(124,58,237,0.24)] transition hover:bg-violet-400 active:scale-[0.98] sm:px-9 sm:text-xs"
          aria-label="새 활동 기록"
        >
          <Zap className="w-4 h-4" />
          <span>활동 기록</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setActiveTab('app');
            setAppSubTab('status');
          }}
          className={`touch-target flex h-11 items-center gap-1.5 rounded-lg border px-3 text-[10px] font-semibold transition sm:px-5 sm:text-xs ${
            activeTab === 'app' && appSubTab === 'status'
              ? 'border-violet-400/20 bg-violet-500/15 text-violet-200'
              : 'border-transparent text-slate-500 hover:bg-white/[0.04] hover:text-slate-200'
          }`}
          aria-label="성장 현황 보기"
        >
          <Activity className="h-4 w-4 shrink-0" aria-hidden="true" />
          <span>현황</span>
        </button>
      </footer>

      {/* Modals */}
      {showLogger && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-md overflow-y-auto animate-in fade-in">
          <div className="mobile-sheet w-full max-w-2xl my-auto overflow-y-auto rounded-t-3xl sm:rounded-3xl">
            <ActivityLogger
              streakDays={profile.streakDays}
              activityLogs={activityLogs}
              editingLog={editingLog}
              focusStatKey={loggerStatKey}
              onLogActivity={handleLogActivity}
              onUpdateActivity={handleUpdateActivity}
              onClose={() => { setShowLogger(false); setEditingLog(null); setLoggerStatKey(null); }}
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
          isRequired={!hasCompletedOnboarding}
          onComplete={(calibrated) => {
            const nextProfile = hasCompletedOnboarding
              ? {
                  ...profile,
                  name: calibrated.name ?? profile.name,
                  title: calibrated.title ?? profile.title,
                  unlockedTitles: Array.from(new Set([
                    ...profile.unlockedTitles,
                    ...(calibrated.title ? [calibrated.title] : []),
                  ])),
                }
              : { ...profile, ...calibrated };
            const nextBaseProfile = hasCompletedOnboarding
              ? {
                  ...baseProfile,
                  name: nextProfile.name,
                  title: nextProfile.title,
                  unlockedTitles: nextProfile.unlockedTitles,
                }
              : nextProfile;
            setProfile(nextProfile);
            setBaseProfile(nextBaseProfile);
            setHasCompletedOnboarding(true);
            setShowOnboarding(false);
          }}
          onClose={() => setShowOnboarding(false)}
        />
      )}

      {showSettings && (
        <SettingsModal
          settings={settings}
          onSettingsChange={setSettings}
          onRequestNotification={handleNotificationPermission}
          onExport={handleExportData}
          onImport={handleImportData}
          onReset={handleResetData}
          onClose={() => setShowSettings(false)}
        />
      )}
    </div>
  );
}
