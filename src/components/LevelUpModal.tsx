import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Check, ChevronRight, Flame, Sparkles, X } from 'lucide-react';

export interface LevelUpEvent {
  statKey: string;
  statName: string;
  oldLevel: number;
  newLevel: number;
  earnedExp: number;
  nextTargetExp: number;
  percentileRank: number; // e.g. 28 (top 28%)
  weeklyMetricSummary: string; // e.g. "이번 주 총 달리기: 9.4km"
  nextGoalSuggestion: string;
  isPlayerLevelUp?: boolean;
}

interface LevelUpModalProps {
  event: LevelUpEvent;
  onClose: () => void;
}

export const LevelUpModal: React.FC<LevelUpModalProps> = ({ event, onClose }) => {
  useEffect(() => {
    try {
      confetti({
        particleCount: 100,
        spread: 80,
        origin: { y: 0.5 },
        colors: ['#F97316', '#EF4444', '#FFFFFF', '#FCD34D', '#4F46E5'],
      });
    } catch (e) {
      // ignore
    }
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-300">
      <div className="relative w-full max-w-lg bg-gradient-to-br from-orange-600 via-orange-500 to-red-600 rounded-3xl p-8 overflow-hidden shadow-2xl shadow-orange-950/60 border border-white/20 animate-in zoom-in-95 duration-300 text-white">
        {/* Background Watermark UP */}
        <div className="absolute top-0 right-0 p-6 opacity-15 text-9xl font-black italic select-none pointer-events-none leading-none">
          UP
        </div>

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full text-white/80 hover:text-white hover:bg-black/20 transition z-20 cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="relative z-10 space-y-6">
          <div>
            <p className="text-orange-100 font-bold uppercase tracking-[0.3em] text-xs mb-1">
              System Notification
            </p>
            <h3 className="text-5xl font-black italic tracking-tighter text-white drop-shadow-md">
              LEVEL UP!
            </h3>
          </div>

          {/* Level Transition & EXP Tag */}
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div className="flex flex-col">
              <span className="text-xs font-bold uppercase tracking-widest opacity-90 text-orange-100">
                {event.statName}
              </span>
              <div className="flex items-center gap-2 text-3xl font-mono font-black mt-0.5">
                <span className="opacity-80">Lv.{event.oldLevel}</span>
                <ChevronRight className="w-6 h-6 text-yellow-300" />
                <span className="text-yellow-200 drop-shadow">Lv.{event.newLevel}</span>
              </div>
            </div>

            <div className="bg-white/20 backdrop-blur-md px-5 py-2.5 rounded-2xl border border-white/30 shadow-lg">
              <span className="text-xl font-black tracking-tight font-mono">
                +{event.earnedExp.toLocaleString()} EXP
              </span>
            </div>
          </div>

          {/* Glowing Progress Bar */}
          <div>
            <div className="w-full bg-black/30 h-3 rounded-full mb-2 border border-white/20 p-0.5">
              <div className="bg-white h-full w-[72%] rounded-full shadow-[0_0_15px_rgba(255,255,255,0.7)]" />
            </div>
            <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-orange-100">
              <span>{event.nextTargetExp} EXP to next level</span>
              <span className="flex items-center gap-1 text-yellow-200">
                <Flame className="w-3.5 h-3.5 fill-yellow-300" /> Top {event.percentileRank}% Tier
              </span>
            </div>
          </div>

          {/* Next Goal Suggestion & Weekly Metric */}
          <div className="bg-black/25 backdrop-blur-md rounded-2xl p-4 border border-white/15 space-y-2 text-xs">
            <div className="flex items-center justify-between font-mono text-[11px] text-orange-100 border-b border-white/10 pb-1.5">
              <span>Weekly Progress</span>
              <span className="font-bold text-white">{event.weeklyMetricSummary}</span>
            </div>
            <div className="flex items-start gap-2 pt-0.5">
              <Sparkles className="w-4 h-4 text-yellow-300 shrink-0 mt-0.5" />
              <p className="text-white/95 leading-relaxed font-medium">
                {event.nextGoalSuggestion}
              </p>
            </div>
          </div>

          {/* Confirm Button */}
          <button
            onClick={onClose}
            className="w-full h-13 bg-white text-black font-black italic tracking-wider rounded-xl shadow-[0_0_20px_rgba(255,255,255,0.4)] flex items-center justify-center gap-2 transform active:scale-95 transition-all cursor-pointer hover:bg-orange-50"
          >
            <Check className="w-5 h-5 stroke-[3]" />
            <span>CONFIRM &amp; CONTINUE GROWTH</span>
          </button>
        </div>
      </div>
    </div>
  );
};
