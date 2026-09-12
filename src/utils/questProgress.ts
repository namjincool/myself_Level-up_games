import { ActivityLog, ActivityOption, Quest } from '../types';
import { getLocalDayKey } from './activityMetrics';

const UNIT_LABELS: Record<string, string> = {
  min: '분',
  minutes: '분',
  '분': '분',
  hours: '시간',
  hour: '시간',
  '시간': '시간',
  km: 'km',
  steps: '걸음',
  entries: '건',
  words: '편',
  tasks: '개',
  deliverables: '개',
  conversations: '회',
  contacts: '명',
  sessions: '회',
  days: '일',
  '일': '일',
};

const normalizeUnit = (unit: string) => {
  if (unit === '분' || unit === 'minutes') return 'min';
  if (unit === '시간' || unit === 'hour') return 'hours';
  if (unit === '일' || unit === 'days') return 'days';
  if (unit === 'conversations' || unit === 'sessions') return 'sessions';
  return unit;
};

export const formatUnitLabel = (unit: string) => UNIT_LABELS[unit] || unit;

/**
 * Returns the amount that one activity contributes to a quest.
 * A category match alone is not enough: a 60-minute deep-work log must not
 * complete a "core task count" quest as one task.
 */
export const getQuestProgressIncrement = (
  quest: Quest,
  option: ActivityOption,
  amount: number,
  context: { existingLogs?: ActivityLog[]; loggedAt?: number } = {},
): number => {
  if (quest.isCompleted || quest.category !== option.category) return 0;

  if (quest.activityIds && !quest.activityIds.includes(option.id)) return 0;

  const loggedDay = getLocalDayKey(context.loggedAt ?? Date.now());
  if (quest.type === 'daily' && quest.dateKey && quest.dateKey !== loggedDay) return 0;

  // The streak challenge counts unique qualifying days, not every repeated log.
  if (quest.id === 'ch-1') {
    const alreadyRecordedThatDay = context.existingLogs?.some(
      (log) =>
        !log.id.startsWith('log-prev-') &&
        getLocalDayKey(log.createdAt ?? Date.parse(log.timestamp)) === loggedDay,
    );
    return alreadyRecordedThatDay ? 0 : 1;
  }

  return normalizeUnit(quest.unit) === normalizeUnit(option.defaultUnit)
    ? Math.min(amount, Math.max(0, quest.targetAmount - quest.currentAmount))
    : 0;
};
