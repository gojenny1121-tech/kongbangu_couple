import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Download, Heart, Smartphone, X, Sparkles } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

export const PWAInstallBanner: React.FC = () => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  // If already installed or explicitly dismissed, don't show
  if (isInstalled || dismissed) {
    return null;
  }

  return (
    <AnimatePresence>
      {/* 1. Android & Desktop flow (beforeinstallprompt exists) */}
      {isInstallable && (
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 50, opacity: 0 }}
          className="fixed bottom-20 inset-x-4 z-40 p-4 bg-white border border-pink-200 rounded-3xl shadow-xl flex items-center justify-between gap-3 backdrop-blur-md bg-white/95"
        >
          <div className="flex items-center gap-3 min-w-0">
            <div className="h-10 w-10 bg-pink-100 rounded-2xl flex items-center justify-center text-pink-500 shrink-0">
              <Download className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <h4 className="font-bold text-slate-800 text-xs flex items-center gap-1">
                <span>앱으로 설치하기</span>
                <Sparkles className="w-3 h-3 text-pink-400 animate-pulse" />
              </h4>
              <p className="text-[10px] text-slate-400 truncate">
                홈 화면에 추가해 더욱 빠르고 온전하게 만나요
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <button
              onClick={install}
              className="px-3.5 py-2 bg-pink-500 hover:bg-pink-600 active:scale-95 text-white font-semibold text-[10px] rounded-xl transition-all shadow-sm shadow-pink-500/10"
            >
              설치
            </button>
            <button
              onClick={() => setDismissed(true)}
              className="p-1.5 text-slate-300 hover:text-slate-500 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </motion.div>
      )}

      {/* 2. iOS flow guide trigger */}
      {!isInstallable && isIOS && (
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 50, opacity: 0 }}
          className="fixed bottom-20 inset-x-4 z-40 p-4 bg-white border border-pink-200 rounded-3xl shadow-xl flex items-center justify-between gap-3 backdrop-blur-md bg-white/95"
        >
          <div className="flex items-center gap-3 min-w-0">
            <div className="h-10 w-10 bg-pink-100 rounded-2xl flex items-center justify-center text-pink-500 shrink-0">
              <Smartphone className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <h4 className="font-bold text-slate-800 text-xs">러브시그널 홈 화면 추가</h4>
              <p className="text-[10px] text-slate-400 truncate">
                NFC 키링 최적화 뷰포트로 더 넓게 감상하기
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <button
              onClick={() => setShowIOSGuide(true)}
              className="px-3.5 py-2 bg-pink-500 hover:bg-pink-600 active:scale-95 text-white font-semibold text-[10px] rounded-xl transition-all shadow-sm"
            >
              추가 방법
            </button>
            <button
              onClick={() => setDismissed(true)}
              className="p-1.5 text-slate-300 hover:text-slate-500 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </motion.div>
      )}

      {/* iOS Modal Guide */}
      {showIOSGuide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            onClick={() => setShowIOSGuide(false)}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm"
          />

          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="relative w-full max-w-xs rounded-3xl bg-white p-6 shadow-2xl border border-pink-100 text-center space-y-4"
          >
            <div className="flex justify-center">
              <div className="h-12 w-12 bg-pink-50 rounded-full flex items-center justify-center text-pink-500">
                <Heart className="w-6 h-6 fill-current animate-pulse" />
              </div>
            </div>

            <h3 className="text-sm font-bold font-myeongjo text-slate-800">
              iPhone / iPad 홈 화면 추가
            </h3>

            <div className="text-left bg-pink-50/20 border border-pink-100/50 p-4 rounded-2xl space-y-2 text-xs text-slate-600 leading-relaxed">
              <p>
                1. Safari 하단 툴바의 <strong className="text-pink-600 font-bold">공유 버튼</strong>(상자에서 위로 가리키는 화살표)을 터치합니다.
              </p>
              <p>
                2. 리스트를 아래로 스크롤하여 <strong className="text-pink-600 font-bold">홈 화면에 추가</strong> 메뉴를 터치합니다.
              </p>
              <p>
                3. 오른쪽 상단 <strong className="text-pink-600 font-bold">추가</strong> 버튼을 클릭하면 바탕화면에 설치됩니다.
              </p>
            </div>

            <button
              onClick={() => setShowIOSGuide(false)}
              className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-xl"
            >
              이해했습니다
            </button>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
