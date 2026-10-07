import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Heart, Plus, Trash2, CheckCircle2, Circle, Star, Award, Compass, Utensils, Plane } from 'lucide-react';
import { BucketItem } from '../types';

interface BucketListProps {
  buckets: BucketItem[];
  onAddBucket: (bucket: Omit<BucketItem, 'id' | 'isCompleted'>) => void;
  onToggleBucket: (id: string) => void;
  onDeleteBucket: (id: string) => void;
  onRequestDeleteConfirm: (onConfirm: () => void, title: string, message: string) => void;
}

// Sparkle/Heart particle interface
interface HeartParticle {
  id: number;
  x: number;
  y: number;
  scale: number;
  angle: number;
}

export const BucketList: React.FC<BucketListProps> = ({
  buckets,
  onAddBucket,
  onToggleBucket,
  onDeleteBucket,
  onRequestDeleteConfirm,
}) => {
  const [isAdding, setIsAdding] = useState(false);
  const [activeTab, setActiveTab] = useState<'all' | 'pending' | 'completed'>('all');
  
  // Particles for celebratory explosion
  const [particles, setParticles] = useState<HeartParticle[]>([]);

  // Form states
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('일상');
  const [memo, setMemo] = useState('');

  // Categories icons mapping
  const getCategoryIcon = (cat: string) => {
    switch (cat) {
      case '여행': return <Plane className="w-4 h-4 text-sky-500" />;
      case '맛집': return <Utensils className="w-4 h-4 text-amber-500" />;
      case '일상': return <Compass className="w-4 h-4 text-emerald-500" />;
      case '도전': return <Award className="w-4 h-4 text-pink-500" />;
      default: return <Star className="w-4 h-4 text-purple-500" />;
    }
  };

  // Filter buckets
  const filteredBuckets = buckets.filter((item) => {
    if (activeTab === 'pending') return !item.isCompleted;
    if (activeTab === 'completed') return item.isCompleted;
    return true;
  });

  // Save Bucket
  const handleSave = () => {
    if (!content || !memo) return;
    onAddBucket({
      content,
      category,
      memo,
    });
    setContent('');
    setCategory('일상');
    setMemo('');
    setIsAdding(false);
  };

  // Spark heart particles when item is completed
  const triggerCelebration = (e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const originX = rect.left + rect.width / 2;
    const originY = rect.top + rect.height / 2;

    const newParticles: HeartParticle[] = Array.from({ length: 12 }).map((_, i) => {
      const angle = (i * 30 + Math.random() * 15) * (Math.PI / 180);
      const distance = 40 + Math.random() * 60;
      return {
        id: Date.now() + i,
        x: Math.cos(angle) * distance,
        y: Math.sin(angle) * distance - 20, // Float slightly up
        scale: 0.5 + Math.random() * 0.8,
        angle: Math.random() * 360,
      };
    });

    setParticles(newParticles);
    // Auto-cleanup particles
    setTimeout(() => {
      setParticles([]);
    }, 1000);
  };

  // Handle toggle with sound / visual pop
  const handleToggle = (id: string, isCompletedBefore: boolean, e: React.MouseEvent) => {
    if (!isCompletedBefore) {
      triggerCelebration(e);
    }
    onToggleBucket(id);
  };

  // Delete bucket safety
  const handleDeleteWithModal = (id: string, text: string) => {
    onRequestDeleteConfirm(
      () => onDeleteBucket(id),
      '버킷리스트 삭제',
      `"${text}" 항목을 버킷리스트에서 영구적으로 삭제하시겠습니까?`
    );
  };

  return (
    <div className="space-y-6 pb-24">
      {/* Header */}
      <div className="text-center py-4">
        <span className="text-pink-400 text-xs font-semibold tracking-wider block mb-1 uppercase">
          LOVE BUCKET LIST
        </span>
        <h2 className="text-2xl font-bold font-myeongjo text-slate-800">
          함께 이뤄갈 버킷리스트
        </h2>
        <p className="text-xs text-slate-400 mt-2 max-w-xs mx-auto leading-relaxed">
          서로 손을 맞잡고 하고 싶었던 일들, 가고 싶었던 장소들을 하나하나 적고 채워가 보세요.
        </p>
      </div>

      {/* Button & Filters Layout */}
      <div className="space-y-4">
        <div className="flex justify-center">
          <button
            onClick={() => setIsAdding(true)}
            className="px-5 py-3 bg-pink-500 hover:bg-pink-600 text-white font-medium text-xs rounded-full flex items-center gap-2 shadow-md shadow-pink-500/10 active:scale-95 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>새 버킷리스트 추가</span>
          </button>
        </div>

        {/* Tab filters matching Frontend Design strict tab rule */}
        <div className="flex justify-center">
          <div className="flex items-center gap-1 p-1 bg-white border border-pink-50 rounded-xl max-w-xs w-full shadow-sm">
            <button
              onClick={() => setActiveTab('all')}
              className={`flex-1 py-2 text-[11px] font-semibold rounded-lg transition-all ${
                activeTab === 'all'
                  ? 'bg-pink-500 text-white shadow-sm'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              전체
            </button>
            <button
              onClick={() => setActiveTab('pending')}
              className={`flex-1 py-2 text-[11px] font-semibold rounded-lg transition-all ${
                activeTab === 'pending'
                  ? 'bg-pink-500 text-white shadow-sm'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              진행중
            </button>
            <button
              onClick={() => setActiveTab('completed')}
              className={`flex-1 py-2 text-[11px] font-semibold rounded-lg transition-all ${
                activeTab === 'completed'
                  ? 'bg-pink-500 text-white shadow-sm'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              달성완료
            </button>
          </div>
        </div>
      </div>

      {/* Empty State */}
      {filteredBuckets.length === 0 ? (
        <div className="bg-white/50 border border-pink-50 rounded-3xl p-10 text-center space-y-3">
          <div className="flex justify-center">
            <Heart className="w-10 h-10 text-pink-200 stroke-[1.5]" />
          </div>
          <p className="text-xs text-slate-400 leading-relaxed font-myeongjo">
            등록된 항목이 비어 있습니다.<br />연인과 머리를 맞대고 꿈을 나열해 볼까요?
          </p>
        </div>
      ) : (
        /* List block */
        <div className="space-y-2.5">
          {filteredBuckets.map((item, idx) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.03 }}
              className={`p-4 bg-white border rounded-2xl shadow-sm flex items-start gap-3.5 transition-all duration-300 ${
                item.isCompleted ? 'border-pink-100 bg-pink-50/5' : 'border-pink-50'
              }`}
            >
              {/* Custom interactive checkbox with confetti hook */}
              <button
                onClick={(e) => handleToggle(item.id, item.isCompleted, e)}
                className="mt-0.5 text-slate-300 hover:text-pink-500 shrink-0 transition-colors active:scale-90"
              >
                {item.isCompleted ? (
                  <CheckCircle2 className="w-5 h-5 text-pink-500 fill-pink-50/50" />
                ) : (
                  <Circle className="w-5 h-5" />
                )}
              </button>

              {/* Bucket detail section */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 mb-1 flex-wrap">
                  {/* Category Chip */}
                  <span className="inline-flex items-center gap-1 text-[8px] font-bold text-slate-400 bg-slate-50 border border-slate-100 px-1.5 py-0.5 rounded-md">
                    {getCategoryIcon(item.category)}
                    <span>{item.category}</span>
                  </span>

                  {item.isCompleted && item.completedAt && (
                    <span className="text-[8px] font-semibold text-pink-500 bg-pink-50 px-1.5 py-0.5 rounded-md">
                      💖 {item.completedAt.replace(/-/g, '.')} 달성
                    </span>
                  )}
                </div>

                <h4
                  className={`text-xs font-semibold text-slate-800 ${
                    item.isCompleted ? 'line-through text-slate-400 font-normal' : ''
                  }`}
                >
                  {item.content}
                </h4>

                <p className="text-[10px] text-slate-400 mt-1 leading-normal font-myeongjo italic">
                  {item.memo}
                </p>
              </div>

              {/* Delete action */}
              <button
                onClick={() => handleDeleteWithModal(item.id, item.content)}
                className="p-1 text-slate-200 hover:text-red-500 rounded-full transition-colors shrink-0 active:scale-90 align-self-center"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </motion.div>
          ))}
        </div>
      )}

      {/* POPPING HEART CELEBRATION OVERLAY */}
      <AnimatePresence>
        {particles.length > 0 && (
          <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
            {particles.map((p) => (
              <motion.div
                key={p.id}
                initial={{ x: window.innerWidth / 2, y: window.innerHeight / 2 - 50, scale: 0, opacity: 1, rotate: p.angle }}
                animate={{
                  x: window.innerWidth / 2 + p.x,
                  y: window.innerHeight / 2 + p.y,
                  scale: p.scale,
                  opacity: 0,
                  rotate: p.angle + 120,
                }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.85, ease: 'easeOut' }}
                className="absolute text-pink-500 fill-current"
              >
                <Heart className="w-6 h-6 drop-shadow-sm fill-pink-500" />
              </motion.div>
            ))}
          </div>
        )}
      </AnimatePresence>

      {/* ADD BUCKET MODAL */}
      <AnimatePresence>
        {isAdding && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsAdding(false)}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm"
            />

            <motion.div
              initial={{ scale: 0.95, y: 15, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.95, y: 15, opacity: 0 }}
              className="relative w-full max-w-sm rounded-3xl bg-white p-6 border border-pink-100 shadow-2xl space-y-4"
            >
              <h3 className="text-base font-bold font-myeongjo text-slate-800 border-b border-pink-50 pb-2">
                우리의 버킷리스트 등록
              </h3>

              <div className="space-y-3.5 text-xs">
                <div>
                  <label className="block text-[10px] font-semibold text-slate-500 mb-1">버킷 이름</label>
                  <input
                    type="text"
                    required
                    placeholder="예: 제주도 해안도로 자전거 여행"
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    className="w-full p-2.5 bg-pink-50/20 border border-pink-100 rounded-xl text-slate-700 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-semibold text-slate-500 mb-1">카테고리</label>
                  <div className="grid grid-cols-4 gap-1">
                    {['여행', '맛집', '일상', '도전'].map((cat) => (
                      <button
                        key={cat}
                        onClick={() => setCategory(cat)}
                        className={`py-2 text-[10px] font-semibold rounded-lg border transition-all ${
                          category === cat
                            ? 'bg-pink-500 border-pink-500 text-white shadow-sm'
                            : 'bg-pink-50/10 border-pink-100 text-slate-500 hover:bg-pink-50/30'
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-semibold text-slate-500 mb-1">한 줄 메모 다짐</label>
                  <input
                    type="text"
                    required
                    placeholder="예: 맛있는 귤 많이 사먹고 바다 보기"
                    maxLength={60}
                    value={memo}
                    onChange={(e) => setMemo(e.target.value)}
                    className="w-full p-2.5 bg-pink-50/20 border border-pink-100 rounded-xl text-slate-700 focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  onClick={() => setIsAdding(false)}
                  className="flex-1 py-2.5 bg-slate-50 hover:bg-slate-100 text-slate-500 text-xs rounded-xl"
                >
                  취소
                </button>
                <button
                  onClick={handleSave}
                  disabled={!content || !memo}
                  className="flex-1 py-2.5 bg-pink-500 hover:bg-pink-600 disabled:bg-slate-200 text-white text-xs font-semibold rounded-xl shadow-sm"
                >
                  위시리스트 추가
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
