import React from 'react';
import { useOnlineStatus } from '../hooks/useOnlineStatus';
import { WifiOff } from 'lucide-react';

export const OfflineIndicator: React.FC = () => {
  const isOnline = useOnlineStatus();

  if (isOnline) return null;

  return (
    <div className="fixed bottom-20 left-4 right-4 z-40 flex items-center justify-center pointer-events-none">
      <div className="flex items-center gap-2 rounded-2xl bg-amber-500/95 backdrop-blur-md px-4 py-2.5 text-[10px] font-semibold text-white shadow-lg pointer-events-auto border border-amber-400">
        <WifiOff className="h-3.5 w-3.5 animate-bounce" />
        <span>오프라인 상태입니다 — 기기에 임시 캐싱된 데이터를 보여주고 있어요.</span>
      </div>
    </div>
  );
};
