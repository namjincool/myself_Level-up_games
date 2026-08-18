import React, { useState } from 'react';
import { Award, Check, Sparkles, UserCheck, Zap } from 'lucide-react';
import { UserProfile } from '../types';

interface OnboardingModalProps {
  onComplete: (calibratedProfile: Partial<UserProfile>) => void;
  onClose: () => void;
}

export const OnboardingModal: React.FC<OnboardingModalProps> = ({ onComplete, onClose }) => {
  const [step, setStep] = useState<number>(1);
  const [nickname, setNickname] = useState<string>('Alex');
  const [workoutFreq, setWorkoutFreq] = useState<string>('mid');
  const [studyFreq, setStudyFreq] = useState<string>('mid');
  const [focusArea, setFocusArea] = useState<string>('body');

  const handleFinish = () => {
    let vit = 8;
    let end = 8;
    let intStat = 8;
    let foc = 8;
    let men = 8;
    let fin = 6;
    let title = 'Master of Persistence';

    if (workoutFreq === 'high') {
      vit += 6;
      end += 8;
    } else if (workoutFreq === 'mid') {
      vit += 4;
      end += 5;
    }

    if (studyFreq === 'high') {
      intStat += 8;
      foc += 5;
    } else if (studyFreq === 'mid') {
      intStat += 5;
      foc += 3;
    }

    if (focusArea === 'body') {
      title = 'Master of Persistence';
      end += 3;
    } else if (focusArea === 'intellect') {
      title = 'Code Ninja';
      intStat += 3;
    } else if (focusArea === 'wealth') {
      title = 'Guardian of Capital';
      fin += 5;
    } else if (focusArea === 'mind') {
      title = 'Zen Master';
      men += 5;
    }

    const calculatedPlayerLevel = Math.floor((vit + end + intStat + foc + men + fin) / 4);

    onComplete({
      name: nickname || 'Alex',
      title,
      playerLevel: calculatedPlayerLevel,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
      <div className="relative w-full max-w-lg overflow-hidden rounded-3xl bg-[#050608] border border-orange-500/40 p-6 sm:p-7 shadow-2xl space-y-5 text-white">
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-orange-500/20 border border-orange-500/40 text-orange-400">
              <Sparkles className="w-4 h-4" />
            </div>
            <h2 className="text-base font-bold text-white uppercase tracking-tight">
              CHARACTER CALIBRATION
            </h2>
          </div>
          <span className="text-xs font-mono font-bold text-orange-400">
            STEP {step} / 3
          </span>
        </div>

        {step === 1 && (
          <div className="space-y-4">
            <div>
              <label className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-1.5">
                Player Nickname
              </label>
              <input
                type="text"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                placeholder="예: Alex, Neo, 김성장"
                className="w-full bg-black/60 border border-white/15 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-orange-500 font-mono font-bold"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-1.5">
                Q1. 주간 운동 및 활동 빈도는 어떻게 되시나요?
              </label>
              <div className="space-y-2">
                {[
                  { id: 'low', label: '운동을 거의 하지 않음 (기초 체력 충전)' },
                  { id: 'mid', label: '주 1~2회 가벼운 러닝 / 헬스 / 산책' },
                  { id: 'high', label: '주 3~5회 이상 규칙적인 운동 매니아' },
                ].map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setWorkoutFreq(opt.id)}
                    className={`w-full p-3 rounded-xl border text-left text-xs transition cursor-pointer ${
                      workoutFreq === opt.id
                        ? 'bg-orange-500/20 border-orange-500 text-white font-bold'
                        : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={() => setStep(2)}
              className="w-full h-12 rounded-xl font-bold text-xs bg-orange-500 hover:bg-orange-400 text-black shadow-[0_0_15px_rgba(249,115,22,0.3)] transition cursor-pointer uppercase tracking-wider font-mono"
            >
              NEXT QUESTION (2/3) &rarr;
            </button>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <div>
              <label className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-1.5">
                Q2. 독서, 코딩, 어학 등 지적 자기계발 시간은?
              </label>
              <div className="space-y-2">
                {[
                  { id: 'low', label: '하루 15분 미만 / 비정기적' },
                  { id: 'mid', label: '하루 30분~1시간 집중 학습' },
                  { id: 'high', label: '하루 2시간 이상 깊은 몰입 (Deep Work)' },
                ].map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setStudyFreq(opt.id)}
                    className={`w-full p-3 rounded-xl border text-left text-xs transition cursor-pointer ${
                      studyFreq === opt.id
                        ? 'bg-orange-500/20 border-orange-500 text-white font-bold'
                        : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setStep(1)}
                className="w-1/3 h-12 rounded-xl font-bold text-xs bg-white/10 text-slate-300 hover:bg-white/20 transition cursor-pointer uppercase tracking-wider font-mono"
              >
                &larr; BACK
              </button>
              <button
                onClick={() => setStep(3)}
                className="w-2/3 h-12 rounded-xl font-bold text-xs bg-orange-500 hover:bg-orange-400 text-black shadow-[0_0_15px_rgba(249,115,22,0.3)] transition cursor-pointer uppercase tracking-wider font-mono"
              >
                FINAL QUESTION (3/3) &rarr;
              </button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4">
            <div>
              <label className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-1.5">
                Q3. 지금 가장 강력하게 키우고 싶은 나의 핵심 영역은?
              </label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: 'body', label: '🏃 신체 / 지구력 / 근력' },
                  { id: 'intellect', label: '🧠 지적 지능 / 코딩 / 독서' },
                  { id: 'wealth', label: '💰 금융 지능 / 자산 형성' },
                  { id: 'mind', label: '🧘 멘탈 / 명상 / 회복력' },
                ].map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setFocusArea(opt.id)}
                    className={`p-3 rounded-xl border text-left text-xs transition cursor-pointer ${
                      focusArea === opt.id
                        ? 'bg-orange-500/20 border-orange-500 text-white font-bold shadow-sm'
                        : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="p-3 bg-black/40 rounded-xl border border-white/10 text-xs text-slate-400">
              <span className="text-orange-400 font-bold block mb-0.5 font-mono">
                INITIAL CALIBRATION COMPLETE:
              </span>
              모든 스탯이 일률적으로 Lv.1에서 시작하지 않고 실제 습관에 맞춰 최적화되어 시작됩니다.
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setStep(2)}
                className="w-1/3 h-12 rounded-xl font-bold text-xs bg-white/10 text-slate-300 hover:bg-white/20 transition cursor-pointer uppercase tracking-wider font-mono"
              >
                &larr; BACK
              </button>
              <button
                onClick={handleFinish}
                className="w-2/3 h-12 rounded-xl font-bold text-xs bg-orange-500 hover:bg-orange-400 text-black shadow-[0_0_15px_rgba(249,115,22,0.4)] transition flex items-center justify-center gap-1.5 cursor-pointer uppercase tracking-wider font-mono"
              >
                <Check className="w-4 h-4 stroke-[3]" />
                <span>COMPLETE &amp; INITIALIZE</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
