import React from 'react';
import { Award, Check, X } from 'lucide-react';

interface TitleModalProps {
  unlockedTitles: string[];
  equippedTitle: string;
  onSelectTitle: (title: string) => void;
  onClose: () => void;
}

export const TitleModal: React.FC<TitleModalProps> = ({
  unlockedTitles,
  equippedTitle,
  onSelectTitle,
  onClose,
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
      <div className="relative w-full max-w-sm rounded-3xl bg-[#050608] border border-orange-500/40 p-6 shadow-2xl space-y-4 text-white">
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <div className="flex items-center gap-2">
            <Award className="w-4 h-4 text-orange-400" />
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              EQUIPPED TITLE SELECTOR
            </h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>

        <p className="text-xs text-slate-400">
          업적을 달성하여 획득한 칭호를 프로필 상태창에 장착할 수 있습니다.
        </p>

        <div className="space-y-2 max-h-64 overflow-y-auto">
          {unlockedTitles.map((t) => {
            const isSelected = equippedTitle === t;
            return (
              <button
                key={t}
                onClick={() => {
                  onSelectTitle(t);
                  onClose();
                }}
                className={`w-full p-3 rounded-xl border text-left text-xs font-semibold flex items-center justify-between transition cursor-pointer ${
                  isSelected
                    ? 'bg-orange-500/20 border-orange-500 text-orange-300 shadow-[0_0_10px_rgba(249,115,22,0.3)]'
                    : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10'
                }`}
              >
                <span className="font-mono">[{t}]</span>
                {isSelected && <Check className="w-4 h-4 text-orange-400" />}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
