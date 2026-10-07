import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Heart, Mail, Image as ImageIcon, CheckSquare, RefreshCw, Sparkles } from 'lucide-react';

import { LoveAppData, DDaySetting, CustomAnniversary, Letter, PhotoEntry, BucketItem } from './types';
import { DDayBanner } from './components/DDayBanner';
import { LetterBox } from './components/LetterBox';
import { Album } from './components/Album';
import { BucketList } from './components/BucketList';
import { SyncSettings } from './components/SyncSettings';
import { ConfirmModal } from './components/ConfirmModal';
import { PWAInstallBanner } from './components/PWAInstallBanner';
import { OfflineIndicator } from './components/OfflineIndicator';

const STORAGE_KEY = 'love_app_data_v1';

export default function App() {
  // 1. Root Love Application State
  const [data, setData] = useState<LoveAppData>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      // safe fallback
    }
    // Default initial empty state - No placeholder data as requested!
    return {
      dday: null,
      customAnniversaries: [],
      letters: [],
      photos: [],
      buckets: [],
    };
  });

  // 2. Navigation state (bottom menu tab)
  const [activeTab, setActiveTab] = useState<'home' | 'letters' | 'album' | 'bucket' | 'sync'>('home');

  // 3. Confirm Safety Modal state
  const [confirmState, setConfirmState] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
  });

  // 4. LocalStorage Auto Sync & Data Loss Prevention Logic
  // Any update immediately synchronizes with localStorage automatically
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (e) {
      console.error('로컬스토리지 자동 저장이 실패했습니다:', e);
    }
  }, [data]);

  // Handle setting/updating D-Day settings
  const handleSaveDDay = (newSetting: DDaySetting) => {
    setData((prev) => ({
      ...prev,
      dday: newSetting,
    }));
  };

  // Add custom anniversary
  const handleAddCustomAnniversary = (ann: Omit<CustomAnniversary, 'id'>) => {
    const newAnn: CustomAnniversary = {
      ...ann,
      id: `ann_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
    };
    setData((prev) => ({
      ...prev,
      customAnniversaries: [...prev.customAnniversaries, newAnn],
    }));
  };

  // Delete custom anniversary
  const handleDeleteCustomAnniversary = (id: string) => {
    setData((prev) => ({
      ...prev,
      customAnniversaries: prev.customAnniversaries.filter((a) => a.id !== id),
    }));
  };

  // Add Letter
  const handleAddLetter = (letter: Omit<Letter, 'id' | 'date' | 'isOpened'>) => {
    const newLetter: Letter = {
      ...letter,
      id: `letter_${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      isOpened: false, // letter starts unopened/sealed if requested
    };
    setData((prev) => ({
      ...prev,
      letters: [newLetter, ...prev.letters],
    }));
  };

  // Unlock/Open letter (permanently changes its state)
  const handleOpenLetter = (id: string) => {
    setData((prev) => ({
      ...prev,
      letters: prev.letters.map((l) => (l.id === id ? { ...l, isOpened: true } : l)),
    }));
  };

  // Delete Letter
  const handleDeleteLetter = (id: string) => {
    setData((prev) => ({
      ...prev,
      letters: prev.letters.filter((l) => l.id !== id),
    }));
  };

  // Add Album Photo
  const handleAddPhoto = (photo: Omit<PhotoEntry, 'id' | 'date'>) => {
    const newPhoto: PhotoEntry = {
      ...photo,
      id: `photo_${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
    };
    setData((prev) => ({
      ...prev,
      photos: [newPhoto, ...prev.photos],
    }));
  };

  // Delete Album Photo
  const handleDeletePhoto = (id: string) => {
    setData((prev) => ({
      ...prev,
      photos: prev.photos.filter((p) => p.id !== id),
    }));
  };

  // Add Bucket Item
  const handleAddBucket = (bucket: Omit<BucketItem, 'id' | 'isCompleted'>) => {
    const newBucket: BucketItem = {
      ...bucket,
      id: `bucket_${Date.now()}`,
      isCompleted: false,
    };
    setData((prev) => ({
      ...prev,
      buckets: [newBucket, ...prev.buckets],
    }));
  };

  // Toggle Bucket Completion
  const handleToggleBucket = (id: string) => {
    setData((prev) => ({
      ...prev,
      buckets: prev.buckets.map((b) =>
        b.id === id
          ? {
              ...b,
              isCompleted: !b.isCompleted,
              completedAt: !b.isCompleted ? new Date().toISOString().split('T')[0] : undefined,
            }
          : b
      ),
    }));
  };

  // Delete Bucket Item
  const handleDeleteBucket = (id: string) => {
    setData((prev) => ({
      ...prev,
      buckets: prev.buckets.filter((b) => b.id !== id),
    }));
  };

  // Import Backup Data (Sync settings helper)
  const handleImportData = (importedData: LoveAppData) => {
    setData(importedData);
    setActiveTab('home'); // Go to home tab immediately to see updates
  };

  // Reset entire application
  const handleResetData = () => {
    setData({
      dday: null,
      customAnniversaries: [],
      letters: [],
      photos: [],
      buckets: [],
    });
    localStorage.removeItem(STORAGE_KEY);
    setActiveTab('home');
  };

  // Helper trigger to open safety confirm modal
  const triggerDeleteConfirm = (onConfirm: () => void, title: string, message: string) => {
    setConfirmState({
      isOpen: true,
      title,
      message,
      onConfirm: () => {
        onConfirm();
        setConfirmState((prev) => ({ ...prev, isOpen: false }));
      },
    });
  };

  // Render correct body tab component
  const renderContent = () => {
    switch (activeTab) {
      case 'home':
        return (
          <DDayBanner
            setting={data.dday}
            customAnniversaries={data.customAnniversaries}
            onSaveSetting={handleSaveDDay}
            onAddCustomAnniversary={handleAddCustomAnniversary}
            onDeleteCustomAnniversary={handleDeleteCustomAnniversary}
            onRequestDeleteConfirm={triggerDeleteConfirm}
          />
        );
      case 'letters':
        return (
          <LetterBox
            letters={data.letters}
            onAddLetter={handleAddLetter}
            onOpenLetter={handleOpenLetter}
            onDeleteLetter={handleDeleteLetter}
            onRequestDeleteConfirm={triggerDeleteConfirm}
          />
        );
      case 'album':
        return (
          <Album
            photos={data.photos}
            onAddPhoto={handleAddPhoto}
            onDeletePhoto={handleDeletePhoto}
            onRequestDeleteConfirm={triggerDeleteConfirm}
          />
        );
      case 'bucket':
        return (
          <BucketList
            buckets={data.buckets}
            onAddBucket={handleAddBucket}
            onToggleBucket={handleToggleBucket}
            onDeleteBucket={handleDeleteBucket}
            onRequestDeleteConfirm={triggerDeleteConfirm}
          />
        );
      case 'sync':
        return (
          <SyncSettings
            data={data}
            onImportData={handleImportData}
            onResetData={handleResetData}
          />
        );
    }
  };

  return (
    <div className="min-h-screen bg-[#fff0f3] flex justify-center">
      {/* Target mobile frame for high consistency & NFC styling */}
      <div className="w-full max-w-md min-h-screen bg-[#fff0f3] relative flex flex-col px-4 pt-safe pb-safe">
        
        {/* Compact Romantic Header (Strict Top Bar Contract - simplified for Mobile first) */}
        <header className="flex items-center justify-between h-14 shrink-0 border-b border-pink-100/50 mb-4 bg-[#fff0f3]/80 backdrop-blur-md sticky top-0 z-30">
          <div className="flex items-center gap-1.5">
            <Heart className="w-4 h-4 text-pink-500 fill-pink-500 animate-pulse" />
            <h1 className="text-sm font-bold tracking-tight text-pink-600 font-cinzel">
              LOVE SIGNAL
            </h1>
          </div>

          <div className="flex items-center gap-1 text-[10px] text-pink-400 font-semibold bg-white px-2.5 py-1 rounded-full border border-pink-100 shadow-sm">
            <Sparkles className="w-3 h-3 animate-spin text-pink-500" style={{ animationDuration: '4s' }} />
            <span>우리들만의 소중한 시그널</span>
          </div>
        </header>

        {/* Primary Page Content Router */}
        <main className="flex-1">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.18, ease: 'easeOut' }}
            >
              {renderContent()}
            </motion.div>
          </AnimatePresence>
        </main>

        {/* Fixed Mobile Bottom Tab Bar (Navigation Anchor) */}
        <nav className="fixed bottom-0 inset-x-0 bg-white/90 backdrop-blur-md border-t border-pink-100/60 z-40 pb-safe shadow-lg flex justify-around items-center h-16 max-w-md mx-auto rounded-t-3xl">
          <button
            onClick={() => setActiveTab('home')}
            className={`flex flex-col items-center justify-center flex-1 h-full relative transition-all active:scale-95 ${
              activeTab === 'home' ? 'text-pink-500' : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            <Heart className={`w-5 h-5 ${activeTab === 'home' ? 'fill-current text-pink-500' : ''}`} />
            <span className="text-[9px] font-medium mt-1">홈 디데이</span>
            {activeTab === 'home' && (
              <motion.div layoutId="active-nav-dot" className="absolute bottom-1 w-1 h-1 bg-pink-500 rounded-full" />
            )}
          </button>

          <button
            onClick={() => setActiveTab('letters')}
            className={`flex flex-col items-center justify-center flex-1 h-full relative transition-all active:scale-95 ${
              activeTab === 'letters' ? 'text-pink-500' : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            <Mail className="w-5 h-5" />
            <span className="text-[9px] font-medium mt-1">편지함</span>
            {activeTab === 'letters' && (
              <motion.div layoutId="active-nav-dot" className="absolute bottom-1 w-1 h-1 bg-pink-500 rounded-full" />
            )}
          </button>

          <button
            onClick={() => setActiveTab('album')}
            className={`flex flex-col items-center justify-center flex-1 h-full relative transition-all active:scale-95 ${
              activeTab === 'album' ? 'text-pink-500' : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            <ImageIcon className="w-5 h-5" />
            <span className="text-[9px] font-medium mt-1">추억앨범</span>
            {activeTab === 'album' && (
              <motion.div layoutId="active-nav-dot" className="absolute bottom-1 w-1 h-1 bg-pink-500 rounded-full" />
            )}
          </button>

          <button
            onClick={() => setActiveTab('bucket')}
            className={`flex flex-col items-center justify-center flex-1 h-full relative transition-all active:scale-95 ${
              activeTab === 'bucket' ? 'text-pink-500' : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            <CheckSquare className="w-5 h-5" />
            <span className="text-[9px] font-medium mt-1">버킷리스트</span>
            {activeTab === 'bucket' && (
              <motion.div layoutId="active-nav-dot" className="absolute bottom-1 w-1 h-1 bg-pink-500 rounded-full" />
            )}
          </button>

          <button
            onClick={() => setActiveTab('sync')}
            className={`flex flex-col items-center justify-center flex-1 h-full relative transition-all active:scale-95 ${
              activeTab === 'sync' ? 'text-pink-500' : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            <RefreshCw className="w-5 h-5" />
            <span className="text-[9px] font-medium mt-1">동기화</span>
            {activeTab === 'sync' && (
              <motion.div layoutId="active-nav-dot" className="absolute bottom-1 w-1 h-1 bg-pink-500 rounded-full" />
            )}
          </button>
        </nav>

        {/* Global safety confirm modal */}
        <ConfirmModal
          isOpen={confirmState.isOpen}
          title={confirmState.title}
          message={confirmState.message}
          onConfirm={confirmState.onConfirm}
          onCancel={() => setConfirmState((prev) => ({ ...prev, isOpen: false }))}
        />

        {/* Floating PWA Install Promoting Banner */}
        <PWAInstallBanner />

        {/* Floating Offline Wifi State Tracker */}
        <OfflineIndicator />

      </div>
    </div>
  );
}
