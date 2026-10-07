import React, { useState, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Heart, Calendar, Plus, Trash2, Camera, ChevronRight, Sparkles } from 'lucide-react';
import { DDaySetting, CustomAnniversary } from '../types';

interface DDayBannerProps {
  setting: DDaySetting | null;
  customAnniversaries: CustomAnniversary[];
  onSaveSetting: (setting: DDaySetting) => void;
  onAddCustomAnniversary: (anniversary: Omit<CustomAnniversary, 'id'>) => void;
  onDeleteCustomAnniversary: (id: string) => void;
  onRequestDeleteConfirm: (onConfirm: () => void, title: string, message: string) => void;
}

export const DDayBanner: React.FC<DDayBannerProps> = ({
  setting,
  customAnniversaries,
  onSaveSetting,
  onAddCustomAnniversary,
  onDeleteCustomAnniversary,
  onRequestDeleteConfirm,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [partnerA, setPartnerA] = useState(setting?.partnerA || '');
  const [partnerB, setPartnerB] = useState(setting?.partnerB || '');
  const [startDate, setStartDate] = useState(setting?.startDate || '');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Custom Anniversary states
  const [newAnnTitle, setNewAnnTitle] = useState('');
  const [newAnnDate, setNewAnnDate] = useState('');
  const [showAddAnn, setShowAddAnn] = useState(false);

  // Default romantic background
  const defaultBg = '/src/assets/images/dday_bg_romantic_1791386211382.jpg';
  const currentBg = setting?.bgImage || defaultBg;

  // Calculate days passed since start date
  const daysPassed = useMemo(() => {
    if (!setting?.startDate) return 0;
    const start = new Date(setting.startDate);
    const today = new Date();
    // Clear time portion
    start.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);
    
    const diffTime = today.getTime() - start.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1; // 1st day is Day 1
    return diffDays;
  }, [setting?.startDate]);

  // Handle romantic save
  const handleSave = () => {
    if (!startDate || !partnerA || !partnerB) return;
    onSaveSetting({
      startDate,
      partnerA,
      partnerB,
      bgImage: setting?.bgImage || undefined,
    });
    setIsEditing(false);
  };

  // Handle background photo upload
  const handleBgUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !setting) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      onSaveSetting({
        ...setting,
        bgImage: reader.result as string,
      });
    };
    reader.readAsDataURL(file);
  };

  // Helper to calculate milestone dates and remaining days
  const upcomingMilestones = useMemo(() => {
    if (!setting?.startDate) return [];
    const start = new Date(setting.startDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const list: Array<{ title: string; date: string; dday: number; isCustom?: boolean; id?: string }> = [];

    // 1. Classic milestones (100, 200, 300, 500, 1000, 2000 days etc.)
    const milestones = [100, 200, 300, 500, 1000, 2000, 3000];
    milestones.forEach((days) => {
      const targetDate = new Date(start);
      targetDate.setDate(start.getDate() + days - 1); // 100th day is start + 99 days
      const targetTime = targetDate.getTime();
      const diffDays = Math.ceil((targetTime - today.getTime()) / (1000 * 60 * 60 * 24));
      
      list.push({
        title: `우리 함께한 지 ${days}일`,
        date: targetDate.toISOString().split('T')[0],
        dday: diffDays,
      });
    });

    // 2. Anniversaries (1st, 2nd, 3rd, 4th, 5th years)
    for (let year = 1; year <= 10; year++) {
      const targetDate = new Date(start);
      targetDate.setFullYear(start.getFullYear() + year);
      const targetTime = targetDate.getTime();
      const diffDays = Math.ceil((targetTime - today.getTime()) / (1000 * 60 * 60 * 24));

      list.push({
        title: `소중한 만남 ${year}주년`,
        date: targetDate.toISOString().split('T')[0],
        dday: diffDays,
      });
    }

    // 3. Custom anniversaries
    customAnniversaries.forEach((ann) => {
      const targetDate = new Date(ann.date);
      targetDate.setHours(0, 0, 0, 0);
      const diffDays = Math.ceil((targetDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

      list.push({
        id: ann.id,
        title: ann.title,
        date: ann.date,
        dday: diffDays,
        isCustom: true,
      });
    });

    // Sort by chronological order (or closest in future, and already passed separately)
    // Filter to show future milestones first, sorted by closest. Also show recently passed milestones (within last 30 days) or just overall closest.
    // For elegant layout, let's divide them into "다가오는 기념일" (dday >= 0, sorted by dday ascending) and "지나간 추억" (dday < 0, sorted by dday descending)
    const upcoming = list.filter((item) => item.dday >= 0).sort((a, b) => a.dday - b.dday);
    return upcoming;
  }, [setting?.startDate, customAnniversaries]);

  // Handle custom anniversary save
  const handleAddCustomAnn = () => {
    if (!newAnnTitle || !newAnnDate) return;
    onAddCustomAnniversary({
      title: newAnnTitle,
      date: newAnnDate,
    });
    setNewAnnTitle('');
    setNewAnnDate('');
    setShowAddAnn(false);
  };

  // Custom handleDeleteAnniversary with safety modal
  const handleDeleteAnnWithModal = (id: string, title: string) => {
    onRequestDeleteConfirm(
      () => onDeleteCustomAnniversary(id),
      '기념일 삭제',
      `"${title}" 기념일을 목록에서 영구적으로 삭제하시겠습니까?`
    );
  };

  // If D-Day setting is null, render beautiful empty state form
  if (!setting) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] px-4">
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="w-full max-w-sm rounded-3xl bg-white p-8 border border-pink-100 shadow-xl space-y-6 text-center"
        >
          <div className="flex justify-center">
            <div className="h-16 w-16 bg-pink-50 rounded-full flex items-center justify-center text-pink-400 relative">
              <Heart className="h-8 w-8 animate-pulse" />
              <Sparkles className="h-4 w-4 text-pink-300 absolute top-2 right-2 animate-bounce" />
            </div>
          </div>
          
          <div className="space-y-2">
            <h2 className="text-xl font-bold font-myeongjo text-slate-800">우리의 첫 시그널</h2>
            <p className="text-xs text-slate-400 max-w-xs leading-relaxed">
              서로 처음 만난 날짜와 이름을 입력하고, 둘만의 아름다운 커플 사진을 배경으로 지정해 보세요.
            </p>
          </div>

          <div className="space-y-4 text-left">
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">처음 만난 날</label>
              <input
                type="date"
                required
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full p-3 bg-pink-50/50 border border-pink-100 rounded-2xl text-xs text-slate-700 focus:outline-none focus:ring-1 focus:ring-pink-300 transition-all"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">내 이름</label>
                <input
                  type="text"
                  placeholder="예: 민우"
                  maxLength={10}
                  value={partnerA}
                  onChange={(e) => setPartnerA(e.target.value)}
                  className="w-full p-3 bg-pink-50/50 border border-pink-100 rounded-2xl text-xs text-slate-700 focus:outline-none focus:ring-1 focus:ring-pink-300 transition-all"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">연인 이름</label>
                <input
                  type="text"
                  placeholder="예: 지은"
                  maxLength={10}
                  value={partnerB}
                  onChange={(e) => setPartnerB(e.target.value)}
                  className="w-full p-3 bg-pink-50/50 border border-pink-100 rounded-2xl text-xs text-slate-700 focus:outline-none focus:ring-1 focus:ring-pink-300 transition-all"
                />
              </div>
            </div>

            {/* Empty state: background image upload form */}
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">커플 배경사진 지정 (선택)</label>
              {setting?.bgImage || startDate ? (
                <div className="relative h-20 w-full rounded-2xl overflow-hidden border border-pink-100">
                  <img
                    src={setting?.bgImage || defaultBg}
                    alt="D-Day Background preview"
                    className="w-full h-full object-cover"
                  />
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute inset-0 bg-black/40 hover:bg-black/50 transition-colors flex items-center justify-center gap-1.5 text-xs text-white font-medium"
                  >
                    <Camera className="w-4 h-4" />
                    <span>사진 바꾸기</span>
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full py-4 bg-pink-50/30 hover:bg-pink-50 border border-dashed border-pink-200 text-pink-500 rounded-2xl flex items-center justify-center gap-2 text-xs transition-colors"
                >
                  <Camera className="w-4 h-4" />
                  <span>우리 커플 사진 올리기</span>
                </button>
              )}
              <input
                type="file"
                ref={fileInputRef}
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  const reader = new FileReader();
                  reader.onloadend = () => {
                    // Create temporary setting object to preserve it during initial load
                    onSaveSetting({
                      startDate: startDate || new Date().toISOString().split('T')[0],
                      partnerA: partnerA || '나',
                      partnerB: partnerB || '너',
                      bgImage: reader.result as string,
                    });
                  };
                  reader.readAsDataURL(file);
                }}
                accept="image/*"
                className="hidden"
              />
            </div>
          </div>

          <button
            onClick={() => {
              if (startDate && partnerA && partnerB) {
                onSaveSetting({
                  startDate,
                  partnerA,
                  partnerB,
                  bgImage: setting?.bgImage || undefined,
                });
              }
            }}
            disabled={!startDate || !partnerA || !partnerB}
            className="w-full py-3.5 bg-pink-500 hover:bg-pink-600 disabled:bg-slate-200 disabled:text-slate-400 disabled:shadow-none text-white font-medium text-xs rounded-2xl transition-all shadow-md shadow-pink-500/20 active:scale-95"
          >
            기록 시작하기
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-24">
      {/* 1. D-Day Banner Frame */}
      <motion.div
        initial={{ opacity: 0, y: -15 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative h-64 w-full rounded-3xl overflow-hidden shadow-md border border-pink-100 group"
      >
        {/* Background image & gradient overlay */}
        <img
          src={currentBg}
          alt="D-Day Background"
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          onError={(e) => {
            // zero-broken-image policy fallback
            (e.target as HTMLImageElement).src = defaultBg;
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-pink-950/90 via-pink-950/40 to-black/10" />

        {/* Edit BG Action - Upgraded to look highly visible and professional */}
        <button
          onClick={() => fileInputRef.current?.click()}
          className="absolute top-4 right-4 py-1.5 px-3 bg-pink-500 hover:bg-pink-600 backdrop-blur-md rounded-full text-white transition-all active:scale-95 border border-pink-400 shadow-sm flex items-center gap-1.5 text-[10px] font-semibold"
          title="배경 사진 바꾸기"
        >
          <Camera className="w-3.5 h-3.5" />
          <span>배경 변경</span>
        </button>
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleBgUpload}
          accept="image/*"
          className="hidden"
        />

        {/* Couple & Days Content inside banner */}
        <div className="absolute inset-x-6 bottom-6 flex flex-col justify-end text-white">
          <div className="flex items-center gap-2 text-pink-200 font-medium text-xs tracking-wider">
            <span>{setting.partnerA}</span>
            <Heart className="w-3.5 h-3.5 fill-pink-400 text-pink-400 animate-pulse" />
            <span>{setting.partnerB}</span>
          </div>

          <h2 className="text-4xl font-extrabold font-mono tracking-tight mt-1">
            Day {daysPassed}
          </h2>

          <div className="flex justify-between items-center mt-3 pt-3 border-t border-white/15">
            <span className="text-[10px] text-pink-100/80 flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              우리가 처음 만난 날 : {setting.startDate.replace(/-/g, '. ')}
            </span>

            <button
              onClick={() => {
                setPartnerA(setting.partnerA);
                setPartnerB(setting.partnerB);
                setStartDate(setting.startDate);
                setIsEditing(true);
              }}
              className="text-[10px] text-white hover:text-pink-200 underline font-medium"
            >
              정보 수정
            </button>
          </div>
        </div>
      </motion.div>

      {/* 1.5 Quick Background photo card under banner */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        onClick={() => fileInputRef.current?.click()}
        className="p-3.5 bg-white border border-dashed border-pink-200 rounded-2xl shadow-sm flex items-center justify-between cursor-pointer hover:bg-pink-50/10 transition-colors"
      >
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-pink-50 rounded-xl text-pink-500">
            <Camera className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-semibold text-slate-800">우리의 커플 배경사진 올리기</h4>
            <p className="text-[9px] text-slate-400">배너의 배경을 두 사람만의 소중한 사진으로 채워보세요</p>
          </div>
        </div>
        <ChevronRight className="w-4 h-4 text-pink-300" />
      </motion.div>

      {/* 2. List of Upcoming Anniversaries */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="font-semibold text-slate-800 text-sm font-myeongjo">우리의 다가오는 기념일</h3>
          <button
            onClick={() => setShowAddAnn(!showAddAnn)}
            className="text-[11px] text-pink-500 font-semibold flex items-center gap-1 hover:text-pink-600 transition-colors"
          >
            <Plus className="w-3 h-3" />
            <span>기념일 추가</span>
          </button>
        </div>

        {/* Add custom anniversary collapsible panel */}
        <AnimatePresence>
          {showAddAnn && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="bg-white rounded-2xl p-4 border border-pink-50 overflow-hidden shadow-sm space-y-3"
            >
              <h4 className="text-xs font-semibold text-slate-700">새 기념일 추가</h4>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  placeholder="예: 첫 국내 여행"
                  value={newAnnTitle}
                  onChange={(e) => setNewAnnTitle(e.target.value)}
                  className="p-2.5 bg-pink-50/50 border border-pink-100 rounded-xl text-xs text-slate-700 focus:outline-none focus:ring-1 focus:ring-pink-300"
                />
                <input
                  type="date"
                  value={newAnnDate}
                  onChange={(e) => setNewAnnDate(e.target.value)}
                  className="p-2.5 bg-pink-50/50 border border-pink-100 rounded-xl text-xs text-slate-700 focus:outline-none focus:ring-1 focus:ring-pink-300"
                />
              </div>
              <div className="flex justify-end gap-2 text-xs pt-1">
                <button
                  onClick={() => setShowAddAnn(false)}
                  className="px-3 py-1.5 bg-slate-50 text-slate-500 rounded-lg hover:bg-slate-100"
                >
                  취소
                </button>
                <button
                  onClick={handleAddCustomAnn}
                  disabled={!newAnnTitle || !newAnnDate}
                  className="px-3 py-1.5 bg-pink-500 hover:bg-pink-600 disabled:bg-slate-200 text-white rounded-lg"
                >
                  추가
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Milestone Cards Grid */}
        <div className="grid grid-cols-1 gap-2.5">
          {upcomingMilestones.slice(0, 6).map((item, index) => {
            const isClosest = index === 0;
            return (
              <motion.div
                key={item.id || item.title}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.04 }}
                className={`flex items-center justify-between p-4 bg-white border rounded-2xl shadow-sm relative overflow-hidden transition-all duration-300 ${
                  isClosest ? 'border-pink-300 bg-pink-50/20' : 'border-pink-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`h-9 w-9 rounded-xl flex items-center justify-center text-xs shrink-0 ${
                      isClosest ? 'bg-pink-500 text-white' : 'bg-pink-50 text-pink-500'
                    }`}
                  >
                    <Heart className={`w-4 h-4 ${isClosest ? 'fill-current' : ''}`} />
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-800 text-xs font-myeongjo">
                      {item.title}
                    </h4>
                    <span className="text-[10px] text-slate-400">
                      {item.date.replace(/-/g, '.')}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span
                    className={`font-mono text-sm font-bold ${
                      item.dday === 0
                        ? 'text-pink-500 animate-bounce'
                        : isClosest
                        ? 'text-pink-600'
                        : 'text-slate-500'
                    }`}
                  >
                    {item.dday === 0 ? 'D-Day' : `D-${item.dday}`}
                  </span>

                  {item.isCustom && item.id && (
                    <button
                      onClick={() => handleDeleteAnnWithModal(item.id!, item.title)}
                      className="p-1 text-slate-300 hover:text-red-500 transition-colors ml-1 active:scale-95"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* 3. Basic Information Edit Modal */}
      <AnimatePresence>
        {isEditing && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsEditing(false)}
              className="fixed inset-0 bg-black/30 backdrop-blur-sm"
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-sm rounded-3xl bg-white p-6 border border-pink-100 shadow-xl space-y-4 max-h-[90vh] overflow-y-auto"
            >
              <h3 className="text-base font-bold font-myeongjo text-slate-800 border-b border-pink-50 pb-2">
                우리의 정보 수정
              </h3>

              <div className="space-y-3.5">
                <div>
                  <label className="block text-[10px] font-semibold text-slate-500 mb-1">처음 만난 날</label>
                  <input
                    type="date"
                    required
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full p-2.5 bg-pink-50/30 border border-pink-100 rounded-xl text-xs text-slate-700 focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3.5">
                  <div>
                    <label className="block text-[10px] font-semibold text-slate-500 mb-1">내 이름</label>
                    <input
                      type="text"
                      maxLength={10}
                      value={partnerA}
                      onChange={(e) => setPartnerA(e.target.value)}
                      className="w-full p-2.5 bg-pink-50/30 border border-pink-100 rounded-xl text-xs text-slate-700 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-semibold text-slate-500 mb-1">연인 이름</label>
                    <input
                      type="text"
                      maxLength={10}
                      value={partnerB}
                      onChange={(e) => setPartnerB(e.target.value)}
                      className="w-full p-2.5 bg-pink-50/30 border border-pink-100 rounded-xl text-xs text-slate-700 focus:outline-none"
                    />
                  </div>
                </div>

                {/* Edit Modal background image box */}
                <div>
                  <label className="block text-[10px] font-semibold text-slate-500 mb-1">디데이 배경 사진</label>
                  <div className="relative h-24 w-full rounded-2xl overflow-hidden border border-pink-100">
                    <img
                      src={currentBg}
                      alt="Current background preview"
                      className="w-full h-full object-cover"
                    />
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="absolute inset-0 bg-black/45 hover:bg-black/55 transition-colors flex flex-col items-center justify-center gap-1 text-white text-[10px] font-semibold"
                    >
                      <Camera className="w-4 h-4" />
                      <span>새 커플사진 등록</span>
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  onClick={() => setIsEditing(false)}
                  className="flex-1 py-2.5 bg-slate-50 hover:bg-slate-100 text-slate-500 text-xs rounded-xl"
                >
                  취소
                </button>
                <button
                  onClick={handleSave}
                  className="flex-1 py-2.5 bg-pink-500 hover:bg-pink-600 text-white text-xs font-semibold rounded-xl shadow-sm"
                >
                  저장하기
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
