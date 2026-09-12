import { ActivityLog } from '../types';

export const getLocalDayKey = (value: number | Date = Date.now()): string => {
  const date = value instanceof Date ? value : new Date(value);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const getDayDistance = (fromDay: string, toDay: string): number => {
  const from = new Date(`${fromDay}T00:00:00`);
  const to = new Date(`${toDay}T00:00:00`);
  return Math.round((to.getTime() - from.getTime()) / 86_400_000);
};

export const getDailyAmount = (
  logs: ActivityLog[],
  activityId: string,
  dayKey = getLocalDayKey(),
  excludeLogId?: string,
): number =>
  logs
    .filter(
      (log) =>
        log.id !== excludeLogId &&
        log.activityId === activityId &&
        getLocalDayKey(log.createdAt ?? Date.parse(log.timestamp)) === dayKey,
    )
    .reduce((total, log) => total + log.amount, 0);

export const getLatestActivityDay = (logs: ActivityLog[]): string | null => {
  const days = logs
    .map((log) => getLocalDayKey(log.createdAt ?? Date.parse(log.timestamp)))
    .filter((day) => day !== 'NaN-NaN-NaN')
    .sort();
  return days.at(-1) ?? null;
};
