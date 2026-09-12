import React from 'react';
import { Activity, TrendingUp } from 'lucide-react';
import { ActivityLog, UserProfile } from '../types';

interface GrowthTimelineProps {
  activityLogs: ActivityLog[];
  profile: UserProfile;
}

const formatLogDate = (log: ActivityLog) => {
  if (!log.createdAt) return '기록';
  return new Intl.DateTimeFormat('ko-KR', { month: 'numeric', day: 'numeric' }).format(log.createdAt);
};

export const GrowthTimeline: React.FC<GrowthTimelineProps> = ({ activityLogs, profile }) => {
  const recentLogs = activityLogs
    .slice()
    .sort((a, b) => (a.createdAt ?? 0) - (b.createdAt ?? 0))
    .slice(-7);

  const cumulativePoints: number[] = [];
  recentLogs.reduce((total, log) => {
    const nextTotal = total + log.earnedExp;
    cumulativePoints.push(nextTotal);
    return nextTotal;
  }, 0);

  const maxPoint = Math.max(...cumulativePoints, 100);
  const recordedExp = activityLogs.reduce((total, log) => total + log.earnedExp, 0);

  return (
    <section className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-sm">
      <div className="flex items-start justify-between gap-3 border-b border-white/10 pb-4">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-orange-300">기록 → 성장</p>
          <h2 className="mt-1 flex items-center gap-2 text-base font-black text-white">
            <TrendingUp className="h-4 w-4 text-orange-400" />
            나의 성장 흐름
          </h2>
          <p className="mt-1 text-xs text-slate-400">행동을 기록할수록 누적 EXP와 레벨이 올라갑니다.</p>
        </div>
        <div className="text-right">
          <p className="text-[10px] uppercase tracking-widest text-slate-500">현재 레벨</p>
          <p className="font-mono text-xl font-black text-orange-400">Lv.{profile.playerLevel}</p>
        </div>
      </div>

      {recentLogs.length === 0 ? (
        <div className="flex min-h-36 flex-col items-center justify-center py-6 text-center">
          <Activity className="h-7 w-7 text-slate-600" />
          <p className="mt-3 text-sm font-semibold text-slate-300">아직 성장 그래프가 없습니다.</p>
          <p className="mt-1 text-xs leading-5 text-slate-500">
            첫 활동을 저장하면 이곳에 기록별 EXP 변화가 표시됩니다.
          </p>
        </div>
      ) : (
        <>
          <div className="mt-5 flex h-40 items-end gap-2 sm:gap-3">
            {recentLogs.map((log, index) => {
              const cumulativeExp = cumulativePoints[index];
              const height = Math.max(10, Math.round((cumulativeExp / maxPoint) * 100));
              return (
                <div key={log.id} className="group flex h-full min-w-0 flex-1 flex-col justify-end">
                  <div className="relative flex h-full items-end">
                    <div
                      className="w-full rounded-t-xl bg-gradient-to-t from-orange-600 to-amber-300 transition-all duration-500 group-hover:from-orange-400"
                      style={{ height: `${height}%` }}
                      title={`${log.activityName} · +${log.earnedExp} EXP`}
                    >
                      <span className="sr-only">{log.activityName} +{log.earnedExp} EXP</span>
                    </div>
                  </div>
                  <span className="mt-2 truncate text-center text-[10px] font-mono text-slate-500">
                    {formatLogDate(log)}
                  </span>
                </div>
              );
            })}
          </div>
          <div className="mt-4 flex items-center justify-between border-t border-white/10 pt-3 text-xs">
            <span className="text-slate-400">활동 {activityLogs.length}회 · 기록 EXP {recordedExp.toLocaleString()}</span>
            <span className="font-mono font-bold text-orange-400">총 EXP {profile.totalExp.toLocaleString()}</span>
          </div>
        </>
      )}
    </section>
  );
};
