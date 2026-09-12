import React, { useState } from 'react';
import { Bell, Check, Download, FileUp, Shield, Trash2, Vibrate, X } from 'lucide-react';
import { AppSettings } from '../types';

interface SettingsModalProps {
  settings: AppSettings;
  onSettingsChange: (settings: AppSettings) => void;
  onRequestNotification: () => void;
  onExport: () => void;
  onImport: (file: File) => void;
  onReset: () => void;
  onClose: () => void;
}

const Toggle: React.FC<{ checked: boolean; onChange: (checked: boolean) => void; disabled?: boolean }> = ({
  checked,
  onChange,
  disabled = false,
}) => (
  <button
    type="button"
    role="switch"
    aria-checked={checked}
    disabled={disabled}
    onClick={() => onChange(!checked)}
    className={`relative h-7 w-12 rounded-full border transition ${
      checked ? 'bg-orange-500 border-orange-400' : 'bg-white/10 border-white/15'
    } ${disabled ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}`}
  >
    <span
      className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow transition ${checked ? 'left-6' : 'left-1'}`}
    />
  </button>
);

export const SettingsModal: React.FC<SettingsModalProps> = ({
  settings,
  onSettingsChange,
  onRequestNotification,
  onExport,
  onImport,
  onReset,
  onClose,
}) => {
  const [confirmReset, setConfirmReset] = useState(false);
  const [isDraggingBackup, setIsDraggingBackup] = useState(false);
  const update = (patch: Partial<AppSettings>) => onSettingsChange({ ...settings, ...patch });
  const notificationLabel =
    settings.notificationStatus === 'granted'
      ? '허용됨'
      : settings.notificationStatus === 'denied'
        ? '차단됨'
        : settings.notificationStatus === 'unsupported'
          ? '지원되지 않음'
          : '확인 필요';

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
      <div className="mobile-sheet w-full max-w-lg rounded-t-3xl sm:rounded-3xl bg-[#050608] border border-orange-500/40 p-4 sm:p-6 shadow-2xl overflow-y-auto text-white">
        <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-5">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-orange-500/20 border border-orange-500/40 text-orange-400">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold">설정 및 데이터 관리</h2>
              <p className="text-xs text-slate-400">앱 운영, 개인정보, 백업을 관리합니다.</p>
            </div>
          </div>
          <button type="button" onClick={onClose} className="touch-target p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10" aria-label="설정 및 데이터 관리 닫기" title="설정 및 데이터 관리 닫기">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-5">
          <section className="space-y-2">
            <h3 className="text-[11px] font-bold uppercase tracking-widest text-slate-400">알림과 인터랙션</h3>
            <div className="rounded-2xl border border-white/10 bg-white/5 divide-y divide-white/10">
              <div className="p-4 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <Bell className="w-4 h-4 text-orange-400" />
                  <div><p className="text-sm font-semibold">퀘스트 리마인더</p><p className="text-xs text-slate-500">오늘 목표와 스트릭 알림</p></div>
                </div>
                <Toggle checked={settings.remindersEnabled} disabled={settings.notificationStatus !== 'granted'} onChange={(checked) => update({ remindersEnabled: checked })} />
              </div>
              <div className="p-4 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <Vibrate className="w-4 h-4 text-purple-400" />
                  <div><p className="text-sm font-semibold">터치 피드백</p><p className="text-xs text-slate-500">버튼과 레벨업 반응</p></div>
                </div>
                <Toggle checked={settings.hapticsEnabled} onChange={(checked) => update({ hapticsEnabled: checked })} />
              </div>
            </div>
            <button type="button" onClick={onRequestNotification} className="w-full min-h-11 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-xs font-bold text-slate-300 flex items-center justify-center gap-2">
              <Bell className="w-4 h-4 text-orange-400" /> 알림 권한: {notificationLabel}
            </button>
          </section>

          <section className="space-y-2">
            <h3 className="text-[11px] font-bold uppercase tracking-widest text-slate-400">저장 위치</h3>
            <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-4">
              <div className="flex items-start gap-3">
                <Check className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
                <div className="space-y-1">
                   <p className="text-sm font-semibold text-emerald-200">이 기기에만 자동 저장됩니다</p>
                  <p className="text-xs text-slate-400 leading-relaxed">온보딩을 완료한 뒤 기록, 레벨, 퀘스트 진행 상황이 이 기기의 저장소에 자동 보관됩니다. 같은 기기에서 다시 열면 이어서 사용할 수 있습니다.</p>
                   <p className="text-[11px] text-slate-500">서버·분석 도구·기기 간 동기화로 데이터를 보내지 않습니다. 기기를 바꾸거나 앱을 삭제하기 전에는 백업 파일을 다운로드하세요.</p>
                </div>
              </div>
            </div>
          </section>

          <section className="space-y-2">
            <h3 className="text-[11px] font-bold uppercase tracking-widest text-slate-400">백업과 복구</h3>
            <div className="grid grid-cols-2 gap-2">
              <button type="button" onClick={onExport} className="min-h-12 rounded-xl bg-orange-500 text-black font-bold text-xs flex items-center justify-center gap-2 hover:bg-orange-400"><Download className="w-4 h-4" /> 백업 다운로드</button>
              <label
                htmlFor="backup-file-input"
                role="button"
                tabIndex={0}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    event.currentTarget.querySelector('input')?.click();
                  }
                }}
                className="min-h-12 rounded-xl bg-white/10 border border-white/10 text-slate-200 font-bold text-xs flex items-center justify-center gap-2 hover:bg-white/15 focus:outline-none focus:ring-2 focus:ring-orange-400 cursor-pointer"
              >
                <FileUp className="w-4 h-4" aria-hidden="true" /> 파일 선택
                <input id="backup-file-input" type="file" accept="application/json,.json" className="hidden" onChange={(event) => { const file = event.target.files?.[0]; if (file) onImport(file); event.currentTarget.value = ''; }} />
              </label>
            </div>
            <div
              onDragEnter={(event) => { event.preventDefault(); setIsDraggingBackup(true); }}
              onDragOver={(event) => { event.preventDefault(); event.dataTransfer.dropEffect = 'copy'; setIsDraggingBackup(true); }}
              onDragLeave={(event) => { event.preventDefault(); setIsDraggingBackup(false); }}
              onDrop={(event) => {
                event.preventDefault();
                setIsDraggingBackup(false);
                const file = event.dataTransfer.files?.[0];
                if (file) onImport(file);
              }}
              className={`rounded-2xl border border-dashed p-5 text-center transition ${
                isDraggingBackup
                  ? 'border-orange-400 bg-orange-500/15 text-orange-200'
                  : 'border-white/20 bg-black/20 text-slate-400 hover:border-orange-500/50 hover:bg-white/5'
              }`}
              role="region"
              aria-label="JSON 백업 파일 드래그 앤 드롭 영역"
            >
              <FileUp className="mx-auto h-6 w-6 text-orange-400" />
              <p className="mt-2 text-xs font-bold text-slate-200">JSON 백업 파일을 여기에 놓으세요</p>
              <p className="mt-1 text-[11px] leading-5 text-slate-500">파일을 놓으면 파일을 검사한 뒤 바로 복원합니다. 모바일에서는 위의 파일 선택을 사용하세요.</p>
            </div>
            <p className="text-[11px] text-slate-500">{settings.lastBackupAt ? `최근 백업: ${new Date(settings.lastBackupAt).toLocaleString('ko-KR')}` : '아직 백업 파일을 만들지 않았습니다.'}</p>
          </section>

          <section className="rounded-2xl border border-red-500/20 bg-red-950/10 p-4">
            {!confirmReset ? (
              <button type="button" onClick={() => setConfirmReset(true)} className="w-full min-h-11 rounded-xl border border-red-500/30 text-red-300 text-xs font-bold flex items-center justify-center gap-2 hover:bg-red-500/10"><Trash2 className="w-4 h-4" /> 모든 데이터 초기화</button>
            ) : (
              <div role="alertdialog" aria-live="assertive" aria-label="데이터 초기화 확인" className="space-y-3">
                <div>
                  <p className="text-sm font-black text-red-200">정말 초기화하시겠습니까?</p>
                  <p className="mt-1 text-xs text-red-200/80 leading-relaxed">프로필, 활동 기록, 레벨, 스탯, 퀘스트, 업적, 설정을 모두 삭제하고 Lv.1 / EXP 0 상태로 돌아갑니다. 백업하지 않은 데이터는 복구할 수 없습니다.</p>
                </div>
                <div className="flex gap-2">
                  <button type="button" onClick={() => setConfirmReset(false)} className="flex-1 min-h-11 rounded-xl bg-white/10 text-xs font-bold">취소</button>
                  <button type="button" onClick={() => { onReset(); setConfirmReset(false); onClose(); }} aria-label="정말 초기화하시겠습니까? 확인" className="flex-1 min-h-11 rounded-xl bg-red-500 text-black text-xs font-bold">네, 모두 초기화</button>
                </div>
              </div>
            )}
          </section>

          <div className="rounded-2xl border border-white/10 bg-black/30 p-4 text-xs text-slate-400 leading-relaxed">
            <p className="flex items-center gap-2 text-slate-200 font-bold mb-2"><Check className="w-4 h-4 text-emerald-400" /> 현재 데이터 보호 상태</p>
             저장 모드: <span className="font-bold text-emerald-300">이 기기만(local-only)</span>. 백업 파일도 사용자가 직접 다운로드하거나 복원할 때만 이동합니다.
          </div>
        </div>
      </div>
    </div>
  );
};
