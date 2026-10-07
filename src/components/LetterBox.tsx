import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Mail, MailOpen, Plus, Trash2, Camera, ArrowLeft, Heart, Lock, Key, Smile, Sparkles } from 'lucide-react';
import { Letter } from '../types';

interface LetterBoxProps {
  letters: Letter[];
  onAddLetter: (letter: Omit<Letter, 'id' | 'date' | 'isOpened'>) => void;
  onOpenLetter: (id: string) => void;
  onDeleteLetter: (id: string) => void;
  onRequestDeleteConfirm: (onConfirm: () => void, title: string, message: string) => void;
}

export const LetterBox: React.FC<LetterBoxProps> = ({
  letters,
  onAddLetter,
  onOpenLetter,
  onDeleteLetter,
  onRequestDeleteConfirm,
}) => {
  // Navigation & letters states
  const [activeLetterId, setActiveLetterId] = useState<string | null>(null);
  const [isWriting, setIsWriting] = useState(false);
  
  // Seal Unlocking State
  const [unlockingLetterId, setUnlockingLetterId] = useState<string | null>(null);
  const [sealClickCount, setSealClickCount] = useState(0);

  // Form states
  const [sender, setSender] = useState('');
  const [receiver, setReceiver] = useState('');
  const [content, setContent] = useState('');
  const [emotion, setEmotion] = useState('행복해');
  const [isSealed, setIsSealed] = useState(false);
  const [letterImg, setLetterImg] = useState<string | undefined>(undefined);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const activeLetter = letters.find((l) => l.id === activeLetterId);

  // Handle Photo Attach
  const handlePhotoAttach = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      setLetterImg(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  // Handle Save Letter
  const handleSaveLetter = () => {
    if (!sender || !receiver || !content) return;
    onAddLetter({
      sender,
      receiver,
      content,
      emotion,
      isSealed,
      image: letterImg,
    });
    // Reset Form
    setSender('');
    setReceiver('');
    setContent('');
    setEmotion('행복해');
    setIsSealed(false);
    setLetterImg(undefined);
    setIsWriting(false);
  };

  // Handle click on sealed letter
  const handleLetterClick = (letter: Letter) => {
    if (letter.isSealed && !letter.isOpened) {
      // Show elegant Wax Seal cracking interactive screen
      setUnlockingLetterId(letter.id);
      setSealClickCount(0);
    } else {
      setActiveLetterId(letter.id);
    }
  };

  // Wax Seal unlock action
  const handleSealTap = () => {
    if (!unlockingLetterId) return;
    setSealClickCount((prev) => {
      const next = prev + 1;
      if (next >= 3) {
        // Unlocked!
        onOpenLetter(unlockingLetterId);
        setTimeout(() => {
          setActiveLetterId(unlockingLetterId);
          setUnlockingLetterId(null);
        }, 600);
      }
      return next;
    });
  };

  // Handle Letter Delete with Modal
  const handleDeleteWithModal = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    onRequestDeleteConfirm(
      () => {
        onDeleteLetter(id);
        if (activeLetterId === id) {
          setActiveLetterId(null);
        }
      },
      '편지 삭제',
      '이 편지를 편지함에서 영구적으로 삭제하시겠습니까?'
    );
  };

  // 1. LETTER DETAIL VIEW
  if (activeLetter) {
    return (
      <div className="space-y-6 pb-24">
        {/* Detail Top bar with strict contract */}
        <div className="flex items-center justify-between py-2 border-b border-pink-100">
          <button
            onClick={() => setActiveLetterId(null)}
            className="flex items-center gap-2 text-xs font-semibold text-pink-500 hover:text-pink-600 transition-colors py-2 active:scale-95"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>목록으로 돌아가기</span>
          </button>

          <button
            onClick={(e) => handleDeleteWithModal(activeLetter.id, e)}
            className="p-2 text-slate-300 hover:text-red-500 transition-all rounded-full hover:bg-red-50"
            title="이 편지 삭제"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>

        {/* Realistic Romantic Paper Card */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-3xl p-6 border border-pink-100 shadow-md space-y-6 relative overflow-hidden"
          style={{ backgroundImage: 'radial-gradient(#fdf0f0 1.2px, transparent 1.2px)', backgroundSize: '24px 24px' }}
        >
          {/* Paper Top */}
          <div className="flex justify-between items-start border-b border-pink-100/60 pb-4">
            <div>
              <span className="text-[10px] text-pink-400 font-semibold tracking-wider block uppercase mb-1">
                From. {activeLetter.sender}
              </span>
              <h3 className="text-sm font-bold font-myeongjo text-slate-700">
                To. {activeLetter.receiver}
              </h3>
            </div>
            
            <div className="text-right">
              <span className="text-[10px] text-slate-400 block font-mono">
                {activeLetter.date}
              </span>
              <span className="inline-block mt-1 px-2.5 py-0.5 text-[10px] rounded-full bg-pink-50 text-pink-500 font-medium">
                {activeLetter.emotion}
              </span>
            </div>
          </div>

          {/* Picture attached if exists */}
          {activeLetter.image && (
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="relative aspect-video w-full rounded-2xl overflow-hidden border border-pink-100/50 bg-slate-50 shadow-sm"
            >
              <img
                src={activeLetter.image}
                alt="Letter memory"
                className="w-full h-full object-cover"
              />
            </motion.div>
          )}

          {/* Letter Body Content */}
          <div className="text-slate-700 text-xs font-myeongjo leading-loose whitespace-pre-wrap min-h-32">
            {activeLetter.content}
          </div>

          {/* Paper Bottom Sign */}
          <div className="flex justify-end pt-4 border-t border-pink-100/40 text-xs font-myeongjo text-pink-400 font-semibold">
            {activeLetter.sender} 씀 · 사랑을 담아
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-24">
      {/* List Header */}
      <div className="text-center py-4">
        <span className="text-pink-400 text-xs font-semibold tracking-wider block mb-1 uppercase">
          LOVEMAIL BOX
        </span>
        <h2 className="text-2xl font-bold font-myeongjo text-slate-800">
          우리의 러브레터 편지함
        </h2>
        <p className="text-xs text-slate-400 mt-2 max-w-xs mx-auto leading-relaxed">
          마음을 담아 연인에게 진심 어린 편지를 전해 보세요.
        </p>
      </div>

      {/* Write Button in thumb-friendly position, but also on top */}
      <div className="flex justify-center">
        <button
          onClick={() => setIsWriting(true)}
          className="px-5 py-3 bg-pink-500 hover:bg-pink-600 text-white font-medium text-xs rounded-full flex items-center gap-2 shadow-md shadow-pink-500/10 active:scale-95 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>새 러브레터 작성하기</span>
        </button>
      </div>

      {/* Empty state list */}
      {letters.length === 0 ? (
        <div className="bg-white/50 border border-pink-50 rounded-3xl p-10 text-center space-y-4">
          <div className="flex justify-center">
            <Mail className="w-12 h-12 text-pink-200 stroke-[1.5]" />
          </div>
          <p className="text-xs text-slate-400 leading-relaxed font-myeongjo">
            아직 도착한 러브레터가 없어요.<br />첫 소중한 마음을 봉인해 보내볼까요?
          </p>
        </div>
      ) : (
        /* Letter list cards */
        <div className="grid grid-cols-1 gap-3">
          {letters.map((letter, idx) => {
            const isLetterSealed = letter.isSealed && !letter.isOpened;
            return (
              <motion.div
                key={letter.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.04 }}
                onClick={() => handleLetterClick(letter)}
                className={`p-4 bg-white border rounded-3xl shadow-sm flex items-center justify-between cursor-pointer transition-all duration-300 hover:border-pink-200 ${
                  isLetterSealed ? 'border-pink-100 bg-pink-50/5' : 'border-pink-50'
                }`}
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  <div
                    className={`h-11 w-11 rounded-2xl flex items-center justify-center text-sm shrink-0 ${
                      isLetterSealed ? 'bg-pink-100/50 text-pink-400' : 'bg-pink-50 text-pink-500'
                    }`}
                  >
                    {isLetterSealed ? <Lock className="w-5 h-5" /> : <MailOpen className="w-5 h-5" />}
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <span className="font-semibold text-slate-800 text-xs truncate max-w-[80px]">
                        {letter.sender}
                      </span>
                      <span className="text-[10px] text-slate-300">→</span>
                      <span className="font-semibold text-slate-800 text-xs truncate max-w-[80px]">
                        {letter.receiver}
                      </span>
                    </div>

                    <p className="text-[10px] text-slate-400 truncate max-w-[180px]">
                      {isLetterSealed ? '봉인된 소중한 마음' : letter.content}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <div className="text-right">
                    <span className="text-[8px] text-slate-300 block font-mono">
                      {letter.date.split('-')[1]}.{letter.date.split('-')[2]}
                    </span>
                    <span className="inline-block px-1.5 py-0.5 text-[8px] rounded-full bg-slate-50 text-slate-400 mt-0.5">
                      {letter.emotion}
                    </span>
                  </div>

                  <button
                    onClick={(e) => handleDeleteWithModal(letter.id, e)}
                    className="p-1.5 text-slate-200 hover:text-red-500 rounded-full transition-colors active:scale-90"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* 2. INTERACTIVE WAX SEAL UNLOCK MODAL */}
      <AnimatePresence>
        {unlockingLetterId && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm"
            />

            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative w-full max-w-sm rounded-3xl bg-pink-50 p-8 border border-pink-200 shadow-2xl text-center space-y-6"
            >
              <h3 className="text-base font-bold font-myeongjo text-pink-900">
              편지 봉인 해제
              </h3>
              
              <p className="text-xs text-pink-700/80 leading-relaxed max-w-xs mx-auto">
                이 러브레터는 굳게 봉인되어 있습니다.<br />
                <span className="font-semibold text-pink-600">왁스 실을 3번 누르세요!</span>
              </p>

              {/* Wax Seal Graphic Core */}
              <div className="flex justify-center py-4">
                <motion.div
                  whileTap={{ scale: 0.85 }}
                  onClick={handleSealTap}
                  className="cursor-pointer relative h-28 w-28 rounded-full bg-pink-600 border-4 border-pink-700 shadow-lg flex items-center justify-center text-white select-none active:bg-pink-700"
                >
                  {/* Wax Outer Ripple */}
                  <div className="absolute inset-2 border border-pink-400/30 rounded-full" />
                  <Heart className={`w-12 h-12 fill-current text-white/90 ${sealClickCount > 0 ? 'animate-pulse' : ''}`} />

                  {/* Stamp Crack Lines */}
                  {sealClickCount > 0 && (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <svg className="absolute inset-0 w-full h-full text-pink-800 stroke-pink-950/40 fill-none" viewBox="0 0 100 100">
                        {sealClickCount >= 1 && <path d="M 50,20 Q 45,50 30,55" strokeWidth="2.5" />}
                        {sealClickCount >= 2 && <path d="M 50,80 Q 55,50 75,45" strokeWidth="2.5" />}
                      </svg>
                    </div>
                  )}

                  <span className="absolute -bottom-2 px-3 py-1 bg-pink-800 text-[8px] tracking-wider rounded-full font-bold">
                    {sealClickCount === 0 ? '봉인됨' : `${3 - sealClickCount}번 남음`}
                  </span>
                </motion.div>
              </div>

              {sealClickCount >= 3 ? (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-xs text-emerald-600 font-semibold flex items-center justify-center gap-1.5"
                >
                  <Sparkles className="w-3.5 h-3.5 text-yellow-500" />
                  <span>봉인 해제! 편지가 열립니다...</span>
                </motion.p>
              ) : (
                <p className="text-[10px] text-pink-400">
                  안전하게 편지를 배달하는 중입니다.
                </p>
              )}

              <button
                onClick={() => setUnlockingLetterId(null)}
                className="w-full py-2 bg-slate-200 hover:bg-slate-300 text-slate-600 text-xs rounded-xl"
              >
                닫기
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 3. WRITE LETTER MODAL */}
      <AnimatePresence>
        {isWriting && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsWriting(false)}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm"
            />

            <motion.div
              initial={{ scale: 0.95, y: 15, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.95, y: 15, opacity: 0 }}
              className="relative w-full max-w-sm rounded-3xl bg-white p-6 border border-pink-100 shadow-2xl max-h-[90vh] overflow-y-auto space-y-4"
            >
              <h3 className="text-base font-bold font-myeongjo text-slate-800 border-b border-pink-50 pb-2 flex items-center gap-1.5">
                <Smile className="w-4 h-4 text-pink-400" />
                새 마음 전하기
              </h3>

              <div className="space-y-3 text-xs">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-semibold text-slate-500 mb-1">보내는 이</label>
                    <input
                      type="text"
                      placeholder="예: 민우"
                      maxLength={10}
                      value={sender}
                      onChange={(e) => setSender(e.target.value)}
                      className="w-full p-2.5 bg-pink-50/20 border border-pink-100 rounded-xl text-slate-700 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-semibold text-slate-500 mb-1">받는 이</label>
                    <input
                      type="text"
                      placeholder="예: 지은"
                      maxLength={10}
                      value={receiver}
                      onChange={(e) => setReceiver(e.target.value)}
                      className="w-full p-2.5 bg-pink-50/20 border border-pink-100 rounded-xl text-slate-700 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-semibold text-slate-500 mb-1">감정 기분</label>
                  <select
                    value={emotion}
                    onChange={(e) => setEmotion(e.target.value)}
                    className="w-full p-2.5 bg-pink-50/20 border border-pink-100 rounded-xl text-slate-700 focus:outline-none"
                  >
                    <option value="행복해">행복해 💖</option>
                    <option value="설렌다">설렌다 💕</option>
                    <option value="따뜻해">따뜻해 🌸</option>
                    <option value="애틋해">애틋해 🌟</option>
                    <option value="보고싶어">보고싶어 🧸</option>
                    <option value="고마워">고마워 ✨</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-semibold text-slate-500 mb-1">편지 내용</label>
                  <textarea
                    placeholder="우리가 써 내려갈 아름다운 사랑 이야기를 속삭여주세요..."
                    rows={5}
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    className="w-full p-3 bg-pink-50/20 border border-pink-100 rounded-xl text-slate-700 focus:outline-none resize-none leading-relaxed placeholder:text-slate-400"
                  />
                </div>

                {/* Picture Upload Option */}
                <div>
                  <label className="block text-[10px] font-semibold text-slate-500 mb-1">사진 동봉하기 (선택)</label>
                  {letterImg ? (
                    <div className="relative aspect-video w-full rounded-xl overflow-hidden border border-pink-100">
                      <img src={letterImg} alt="Attachment" className="w-full h-full object-cover" />
                      <button
                        onClick={() => setLetterImg(undefined)}
                        className="absolute top-2 right-2 px-2 py-1 bg-black/60 text-white rounded-lg text-[9px]"
                      >
                        지우기
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full py-3.5 bg-pink-50/30 hover:bg-pink-50 border border-dashed border-pink-200 text-pink-500 rounded-xl flex items-center justify-center gap-1.5 text-xs transition-colors"
                    >
                      <Camera className="w-4 h-4" />
                      <span>추억 사진 가져오기</span>
                    </button>
                  )}
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handlePhotoAttach}
                    accept="image/*"
                    className="hidden"
                  />
                </div>

                {/* Seal Toggle option */}
                <div className="flex items-center justify-between p-3 bg-pink-50/30 rounded-xl border border-pink-100">
                  <div>
                    <span className="font-semibold text-slate-700 block text-[11px]">마음 봉인하기</span>
                    <span className="text-[9px] text-slate-400">봉인된 편지는 연인이 직접 클릭해야 읽을 수 있습니다.</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={isSealed}
                    onChange={(e) => setIsSealed(e.target.checked)}
                    className="w-4 h-4 accent-pink-500 cursor-pointer"
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  onClick={() => setIsWriting(false)}
                  className="flex-1 py-2.5 bg-slate-50 hover:bg-slate-100 text-slate-500 text-xs rounded-xl"
                >
                  취소
                </button>
                <button
                  onClick={handleSaveLetter}
                  disabled={!sender || !receiver || !content}
                  className="flex-1 py-2.5 bg-pink-500 hover:bg-pink-600 disabled:bg-slate-200 text-white text-xs font-semibold rounded-xl shadow-sm"
                >
                  편지 보내기
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
