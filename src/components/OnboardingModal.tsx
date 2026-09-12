import React, { useState } from 'react';
import { Check, Sparkles, X } from 'lucide-react';
import { UserProfile } from '../types';

interface OnboardingModalProps {
  onComplete: (profile: Partial<UserProfile>) => void;
  onClose: () => void;
  isRequired?: boolean;
}

const focusOptions = [
  { id: 'body', label: '🏃 신체 / 지구력 / 근력', title: '몸을 깨우는 사람' },
  { id: 'intellect', label: '🧠 지적 성장 / 코딩 / 독서', title: '지식 탐험가' },
  { id: 'wealth', label: '💰 금융 / 자산 형성', title: '자산 설계자' },
  { id: 'mind', label: '🧘 멘탈 / 명상 / 회복력', title: '마음의 수련자' },
] as const;

export const OnboardingModal: React.FC<OnboardingModalProps> = ({
  onComplete,
  onClose,
  isRequired = false,
}) => {
  const [step, setStep] = useState<1 | 2>(1);
  const [nickname, setNickname] = useState('');
  const [focusArea, setFocusArea] = useState<(typeof focusOptions)[number]['id']>('body');
  const [formError, setFormError] = useState<string | null>(null);

  const handleFinish = () => {
    const normalizedNickname = nickname.trim();
    if (!normalizedNickname) {
      setFormError('사용할 닉네임을 입력해 주세요.');
      setStep(1);
      return;
    }

    const selectedFocus = focusOptions.find((option) => option.id === focusArea) ?? focusOptions[0];
    onComplete({
      name: normalizedNickname,
      title: selectedFocus.title,
      playerLevel: 1,
      totalExp: 0,
      currentLevelExp: 0,
      nextLevelExp: 100,
      rankTier: 'Bronze',
      unlockedTitles: ['첫 걸음'],
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/80 p-0 backdrop-blur-md sm:items-center sm:p-4">
      <div className="mobile-sheet relative w-full max-w-lg overflow-y-auto rounded-t-3xl border border-orange-500/40 bg-[#050608] p-4 text-white shadow-2xl sm:rounded-3xl sm:p-7">
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="rounded-xl border border-orange-500/40 bg-orange-500/20 p-2 text-orange-400">
              <Sparkles className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-base font-bold tracking-tight">나만의 LifeRPG 시작하기</h2>
              <p className="mt-0.5 text-[11px] text-slate-500">기록을 시작하기 위한 최소 설정</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-bold text-orange-400">{step} / 2</span>
            {!isRequired && (
              <button
                type="button"
                onClick={onClose}
                className="touch-target rounded-xl p-2 text-slate-400 transition hover:bg-white/10 hover:text-white"
                aria-label="온보딩 닫기"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>

        {step === 1 ? (
          <div className="space-y-5 pt-5">
            <div>
              <p className="text-sm font-semibold text-white">지금부터 실제 기록으로 성장합니다.</p>
              <p className="mt-2 text-sm leading-6 text-slate-400">
                예시 기록이나 보정 레벨 없이 Lv.1, EXP 0, 활동 0에서 시작합니다.
              </p>
            </div>

            <div>
              <label htmlFor="nickname" className="mb-2 block text-xs font-bold uppercase tracking-widest text-slate-400">
                사용할 닉네임
              </label>
              <input
                id="nickname"
                type="text"
                inputMode="text"
                value={nickname}
                onChange={(event) => {
                  setNickname(event.target.value);
                  if (formError) setFormError(null);
                }}
                placeholder="예: 민수, 성장러, Alex"
                autoFocus
                maxLength={24}
                className="w-full rounded-xl border border-white/15 bg-black/60 px-4 py-3 text-sm font-bold text-white outline-none transition focus:border-orange-500"
              />
              {formError && <p className="mt-2 text-xs text-red-300" role="alert">{formError}</p>}
            </div>

            <button
              type="button"
              onClick={() => setStep(2)}
              className="h-12 w-full rounded-xl bg-orange-500 text-xs font-black tracking-wide text-black shadow-[0_0_15px_rgba(249,115,22,0.3)] transition hover:bg-orange-400"
            >
              다음: 성장 방향 선택
            </button>
          </div>
        ) : (
          <div className="space-y-5 pt-5">
            <div>
              <p className="text-sm font-semibold text-white">어떤 방향의 기록을 먼저 쌓을까요?</p>
              <p className="mt-2 text-sm leading-6 text-slate-400">
                이 선택은 프로필 방향만 정합니다. 레벨과 EXP는 실제 행동을 기록해야 올라갑니다.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              {focusOptions.map((option) => (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => setFocusArea(option.id)}
                  className={`rounded-xl border p-3 text-left text-sm transition ${
                    focusArea === option.id
                      ? 'border-orange-500 bg-orange-500/20 font-bold text-white'
                      : 'border-white/10 bg-white/5 text-slate-300 hover:bg-white/10'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>

            <div className="rounded-xl border border-orange-500/20 bg-orange-500/5 p-3 text-xs leading-5 text-slate-400">
              저장 후 홈 화면에서 <span className="font-bold text-orange-300">첫 활동 기록하기</span>를 누르고,
              오늘 실제로 한 행동을 입력하면 성장 그래프가 시작됩니다.
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="h-12 w-1/3 rounded-xl bg-white/10 text-xs font-bold text-slate-300 transition hover:bg-white/20"
              >
                이전
              </button>
              <button
                type="button"
                onClick={handleFinish}
                className="flex h-12 w-2/3 items-center justify-center gap-2 rounded-xl bg-orange-500 text-xs font-black text-black shadow-[0_0_15px_rgba(249,115,22,0.4)] transition hover:bg-orange-400"
              >
                <Check className="h-4 w-4" />
                프로필 저장하고 시작하기
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
