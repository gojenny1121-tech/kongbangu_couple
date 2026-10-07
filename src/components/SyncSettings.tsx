import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Share2, Clipboard, Check, RotateCcw, ShieldCheck, Heart } from 'lucide-react';
import { LoveAppData } from '../types';

interface SyncSettingsProps {
  data: LoveAppData;
  onImportData: (importedData: LoveAppData) => void;
  onResetData: () => void;
}

export const SyncSettings: React.FC<SyncSettingsProps> = ({
  data,
  onImportData,
  onResetData,
}) => {
  const [backupCode, setBackupCode] = useState('');
  const [copied, setCopied] = useState(false);
  const [importCode, setImportCode] = useState('');
  const [importError, setImportError] = useState('');
  const [importSuccess, setImportSuccess] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  // Generate backup code
  const handleGenerateBackup = () => {
    try {
      const jsonStr = JSON.stringify(data);
      // UTF-8 safety base64 encoding
      const encoded = btoa(encodeURIComponent(jsonStr));
      setBackupCode(encoded);
      setImportError('');
      setImportSuccess(false);
    } catch (e) {
      setImportError('백업 코드를 생성하는 데 실패했습니다.');
    }
  };

  const handleCopy = async () => {
    if (!backupCode) return;
    try {
      await navigator.clipboard.writeText(backupCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      // fallback copy
    }
  };

  // Import backup code
  const handleImport = () => {
    setImportError('');
    setImportSuccess(false);
    if (!importCode.trim()) {
      setImportError('코드를 입력해 주세요.');
      return;
    }

    try {
      const decoded = decodeURIComponent(atob(importCode.trim()));
      const parsed = JSON.parse(decoded) as LoveAppData;

      // Validate parsed format roughly
      if (
        parsed &&
        (parsed.dday !== undefined ||
          Array.isArray(parsed.letters) ||
          Array.isArray(parsed.photos) ||
          Array.isArray(parsed.buckets))
      ) {
        onImportData(parsed);
        setImportSuccess(true);
        setImportCode('');
        // Alert sound or fine animation
      } else {
        setImportError('올바르지 않은 백업 코드 양식입니다.');
      }
    } catch (e) {
      setImportError('코드가 손상되었거나 올바르지 않은 형식입니다.');
    }
  };

  return (
    <div className="space-y-6 pb-24">
      {/* Top Intro Header */}
      <div className="text-center py-4">
        <span className="text-pink-400 text-xs font-semibold tracking-wider uppercase block mb-1">
          NFC & DATA SYNC
        </span>
        <h2 className="text-2xl font-bold font-myeongjo text-slate-800">
          데이터 동기화 & 백업
        </h2>
        <p className="text-xs text-slate-400 mt-2 max-w-xs mx-auto leading-relaxed">
          NFC 키링에 담길 우리만의 사랑 공간입니다. 어떠한 환경에서도 데이터 유실이 없도록 백업과 동기화를 지원합니다.
        </p>
      </div>

      {/* Local Auto Sync Info Card */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-3xl bg-white/80 backdrop-blur-md p-6 border border-pink-100 shadow-sm flex items-start gap-4"
      >
        <div className="p-3 bg-pink-50 rounded-2xl text-pink-500 shrink-0">
          <ShieldCheck className="w-6 h-6" />
        </div>
        <div>
          <h3 className="font-semibold text-slate-800 text-sm mb-1">실시간 자동 동기화 가동 중</h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            모든 작성, 수정, 삭제 활동은 기기의 로컬 스토리지에 즉시 자동으로 기록됩니다. 
            앱을 닫거나 브라우저를 종료해도 소중한 추억은 안전하게 유지됩니다.
          </p>
        </div>
      </motion.div>

      {/* Backup Code Generator */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="rounded-3xl bg-white p-6 border border-pink-50 shadow-sm space-y-4"
      >
        <div className="flex items-center gap-2">
          <Heart className="w-4 h-4 text-pink-400 animate-pulse" />
          <h3 className="font-semibold text-slate-800 text-sm font-myeongjo">상대방에게 데이터 보내기 (내보내기)</h3>
        </div>
        <p className="text-xs text-slate-500 leading-relaxed">
          내가 작성한 모든 내용을 한데 묶은 코드를 생성합니다. 이 코드를 복사해 연인에게 전달하면 동일한 화면을 연인의 기기에서도 불러올 수 있습니다.
        </p>

        {backupCode ? (
          <div className="space-y-3">
            <div className="relative">
              <textarea
                readOnly
                value={backupCode}
                className="w-full h-24 p-3 bg-slate-50 border border-slate-100 rounded-2xl text-[10px] font-mono text-slate-600 focus:outline-none resize-none"
              />
              <button
                onClick={handleCopy}
                className="absolute bottom-2 right-2 p-2 bg-white hover:bg-slate-50 border border-slate-100 rounded-xl text-slate-500 shadow-sm transition-all active:scale-95 flex items-center gap-1 text-xs"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-500" />
                    <span className="text-emerald-500 font-medium">복사 완료</span>
                  </>
                ) : (
                  <>
                    <Clipboard className="w-3.5 h-3.5" />
                    <span>복사하기</span>
                  </>
                )}
              </button>
            </div>
            <p className="text-[10px] text-pink-500 text-center">
              복사된 문자열을 카카오톡이나 메시지로 연인에게 보내 동기화하세요!
            </p>
          </div>
        ) : (
          <button
            onClick={handleGenerateBackup}
            className="w-full py-3 bg-pink-500 hover:bg-pink-600 active:scale-[0.98] transition-all text-white font-medium text-xs rounded-2xl flex items-center justify-center gap-2 shadow-sm shadow-pink-500/10"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>러브 백업 코드 생성하기</span>
          </button>
        )}
      </motion.div>

      {/* Backup Code Importer */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="rounded-3xl bg-white p-6 border border-pink-50 shadow-sm space-y-4"
      >
        <div className="flex items-center gap-2">
          <Heart className="w-4 h-4 text-pink-400" />
          <h3 className="font-semibold text-slate-800 text-sm font-myeongjo">연인의 데이터 가져오기 (불러오기)</h3>
        </div>
        <p className="text-xs text-slate-500 leading-relaxed">
          연인이 공유해 준 소중한 러브 코드를 아래에 입력하면, 연인의 데이터가 현재 내 화면에 즉시 동기화됩니다. 
          <span className="text-pink-500 font-medium"> (기존 데이터는 덮어씌워지므로 유의하세요)</span>
        </p>

        <textarea
          placeholder="여기에 복사한 러브 백업 코드를 붙여넣으세요..."
          value={importCode}
          onChange={(e) => {
            setImportCode(e.target.value);
            setImportError('');
            setImportSuccess(false);
          }}
          className="w-full h-24 p-3 bg-slate-50 border border-slate-100 rounded-2xl text-[10px] font-mono text-slate-600 focus:outline-none focus:ring-1 focus:ring-pink-300 resize-none transition-all placeholder:text-slate-400"
        />

        {importError && (
          <p className="text-xs text-red-500 text-center font-medium bg-red-50 py-2 rounded-xl">
            ⚠️ {importError}
          </p>
        )}

        {importSuccess && (
          <p className="text-xs text-emerald-600 text-center font-medium bg-emerald-50 py-2 rounded-xl">
            🎉 축하합니다! 데이터가 성공적으로 동기화되었습니다.
          </p>
        )}

        <button
          onClick={handleImport}
          className="w-full py-3 bg-slate-900 hover:bg-slate-800 active:scale-[0.98] transition-all text-white font-medium text-xs rounded-2xl flex items-center justify-center gap-2 shadow-sm"
        >
          <span>코드 확인 및 동기화 적용</span>
        </button>
      </motion.div>

      {/* Reset Area */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="rounded-3xl bg-white p-6 border border-red-50 shadow-sm space-y-4"
      >
        <h3 className="font-semibold text-red-500 text-sm">데이터 초기화</h3>
        <p className="text-xs text-slate-500 leading-relaxed">
          기기에 저장된 러브시그널의 모든 만남 정보, 기념일, 편지, 앨범, 버킷리스트 데이터를 전부 삭제합니다. 삭제 후에는 되돌릴 수 없습니다.
        </p>

        {showResetConfirm ? (
          <div className="flex gap-2">
            <button
              onClick={() => setShowResetConfirm(false)}
              className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs rounded-xl transition-all"
            >
              취소
            </button>
            <button
              onClick={() => {
                onResetData();
                setShowResetConfirm(false);
              }}
              className="flex-1 py-2.5 bg-red-500 hover:bg-red-600 text-white text-xs font-semibold rounded-xl transition-all"
            >
              네, 모두 삭제합니다
            </button>
          </div>
        ) : (
          <button
            onClick={() => setShowResetConfirm(true)}
            className="w-full py-2.5 bg-red-50 hover:bg-red-100 text-red-600 font-medium text-xs rounded-2xl flex items-center justify-center gap-2 border border-red-100 transition-all"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>기기 내 모든 데이터 지우기</span>
          </button>
        )}
      </motion.div>
    </div>
  );
};
