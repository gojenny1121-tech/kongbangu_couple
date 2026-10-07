import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Image, Camera, Plus, Trash2, Heart, Smile, Sparkles, X } from 'lucide-react';
import { PhotoEntry } from '../types';

interface AlbumProps {
  photos: PhotoEntry[];
  onAddPhoto: (photo: Omit<PhotoEntry, 'id' | 'date'>) => void;
  onDeletePhoto: (id: string) => void;
  onRequestDeleteConfirm: (onConfirm: () => void, title: string, message: string) => void;
}

export const Album: React.FC<AlbumProps> = ({
  photos,
  onAddPhoto,
  onDeletePhoto,
  onRequestDeleteConfirm,
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState<PhotoEntry | null>(null);

  // Form states
  const [image, setImage] = useState<string>('');
  const [memo, setMemo] = useState('');
  const [emotion, setEmotion] = useState('행복 가득');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Default images & placeholders
  const defaultPlaceholder = '/src/assets/images/album_placeholder_1791386224569.jpg';

  // Handle image upload & convert to 4:3 crop helper (optional canvas draw or base64 resize is best)
  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      // Draw into canvas to ensure strict 4:3 ratio and compression for LocalStorage limits
      const img = new window.Image();
      img.src = reader.result as string;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Force 4:3 target
        const targetWidth = 640;
        const targetHeight = 480;
        canvas.width = targetWidth;
        canvas.height = targetHeight;

        // Calculate source cropping coordinates (center crop)
        const srcRatio = img.width / img.height;
        const targetRatio = 4 / 3;
        let sWidth = img.width;
        let sHeight = img.height;
        let sx = 0;
        let sy = 0;

        if (srcRatio > targetRatio) {
          // Wider than 4:3
          sWidth = img.height * targetRatio;
          sx = (img.width - sWidth) / 2;
        } else {
          // Taller than 4:3
          sHeight = img.width / targetRatio;
          sy = (img.height - sHeight) / 2;
        }

        ctx.drawImage(img, sx, sy, sWidth, sHeight, 0, 0, targetWidth, targetHeight);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.85); // Compress lightly
        setImage(dataUrl);
      };
    };
    reader.readAsDataURL(file);
  };

  // Handle Save Photo
  const handleSavePhoto = () => {
    if (!image || !memo) return;
    onAddPhoto({
      image,
      memo,
      emotion,
    });
    // Reset
    setImage('');
    setMemo('');
    setEmotion('행복 가득');
    setIsUploading(false);
  };

  // Handle photo delete
  const handleDeleteWithModal = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    onRequestDeleteConfirm(
      () => {
        onDeletePhoto(id);
        if (selectedPhoto?.id === id) {
          setSelectedPhoto(null);
        }
      },
      '추억 사진 삭제',
      '이 사진을 앨범에서 영구적으로 삭제하시겠습니까?'
    );
  };

  return (
    <div className="space-y-6 pb-24">
      {/* Album Header */}
      <div className="text-center py-4">
        <span className="text-pink-400 text-xs font-semibold tracking-wider block mb-1 uppercase">
          LOVEMEMORY ALBUM
        </span>
        <h2 className="text-2xl font-bold font-myeongjo text-slate-800">
          우리들만의 추억 앨범
        </h2>
        <p className="text-xs text-slate-400 mt-2 max-w-xs mx-auto leading-relaxed">
          4:3 폴라로이드 감성 프레임 속에 소중한 하루, 그날의 감정과 메모를 정성껏 담아보세요.
        </p>
      </div>

      {/* Upload button */}
      <div className="flex justify-center">
        <button
          onClick={() => setIsUploading(true)}
          className="px-5 py-3 bg-pink-500 hover:bg-pink-600 text-white font-medium text-xs rounded-full flex items-center gap-2 shadow-md shadow-pink-500/10 active:scale-95 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>추억 기록하기</span>
        </button>
      </div>

      {/* Empty State */}
      {photos.length === 0 ? (
        <div className="bg-white/50 border border-pink-50 rounded-3xl p-6 text-center space-y-4">
          <div className="relative aspect-[4/3] w-full max-w-sm mx-auto rounded-2xl overflow-hidden border border-pink-100 shadow-inner">
            <img
              src={defaultPlaceholder}
              alt="Romantic table"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-pink-900/10" />
          </div>
          <p className="text-xs text-slate-400 leading-relaxed font-myeongjo pt-2">
            아직 앨범에 등록된 기억이 없어요.<br />오늘의 아름다운 사랑을 첫 번째 장으로 남겨보세요.
          </p>
        </div>
      ) : (
        /* Polaroid grid view */
        <div className="grid grid-cols-2 gap-4">
          {photos.map((photo, idx) => (
            <motion.div
              key={photo.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: idx * 0.04 }}
              onClick={() => setSelectedPhoto(photo)}
              className="bg-white p-2.5 pb-4 rounded-xl shadow-sm border border-pink-100 cursor-pointer flex flex-col justify-between hover:shadow-md transition-shadow relative group overflow-hidden"
              style={{ transform: `rotate(${idx % 2 === 0 ? '-1.5' : '1.5'}deg)` }}
            >
              {/* Photo Area (Strict 4:3) */}
              <div className="relative aspect-[4/3] w-full bg-slate-50 rounded-lg overflow-hidden border border-slate-100">
                <img
                  src={photo.image}
                  alt={photo.memo}
                  className="w-full h-full object-cover"
                />
                
                {/* Micro emotion tag overlay */}
                <div className="absolute bottom-2 left-2 px-2 py-0.5 bg-black/60 backdrop-blur-sm text-[8px] text-white rounded-full font-medium">
                  {photo.emotion}
                </div>
              </div>

              {/* Text / Memo details */}
              <div className="mt-3.5 space-y-1">
                <p className="text-[10px] text-slate-700 font-myeongjo line-clamp-2 leading-normal">
                  {photo.memo}
                </p>
                <div className="flex justify-between items-center pt-1">
                  <span className="text-[8px] text-slate-400 font-mono">
                    {photo.date.replace(/-/g, '.')}
                  </span>
                  
                  {/* Delete Button */}
                  <button
                    onClick={(e) => handleDeleteWithModal(photo.id, e)}
                    className="p-1 text-slate-200 hover:text-red-500 rounded-full transition-colors active:scale-90"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* PHOTO DETAIL LIGHTBOX */}
      <AnimatePresence>
        {selectedPhoto && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedPhoto(null)}
              className="absolute inset-0"
            />

            {/* Giant polaroid card */}
            <motion.div
              initial={{ scale: 0.9, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 15 }}
              className="relative w-full max-w-sm bg-white p-4 pb-8 rounded-2xl shadow-2xl space-y-4 border border-pink-100"
            >
              {/* Image box (4:3) */}
              <div className="relative aspect-[4/3] w-full bg-slate-100 rounded-lg overflow-hidden border border-slate-200">
                <img
                  src={selectedPhoto.image}
                  alt={selectedPhoto.memo}
                  className="w-full h-full object-cover"
                />
                <button
                  onClick={() => setSelectedPhoto(null)}
                  className="absolute top-2 right-2 p-1.5 bg-black/55 text-white rounded-full hover:bg-black/75 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Memo area */}
              <div className="space-y-2 text-center">
                <div className="inline-flex items-center gap-1 px-3 py-1 bg-pink-50 text-pink-500 rounded-full text-xs font-semibold">
                  <Smile className="w-3.5 h-3.5" />
                  <span>{selectedPhoto.emotion}</span>
                </div>

                <p className="text-sm text-slate-700 font-myeongjo leading-relaxed pt-2 px-2 whitespace-pre-wrap">
                  {selectedPhoto.memo}
                </p>

                <div className="text-[10px] text-slate-400 font-mono pt-3">
                  기억된 시간 : {selectedPhoto.date}
                </div>
              </div>

              {/* Trash option inside lightbox */}
              <div className="flex justify-center pt-2 border-t border-slate-50">
                <button
                  onClick={(e) => handleDeleteWithModal(selectedPhoto.id, e)}
                  className="p-2 text-slate-400 hover:text-red-500 rounded-full transition-colors hover:bg-red-50 flex items-center gap-1 text-xs"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>이 추억 사진 삭제</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* UPLOAD FORM MODAL */}
      <AnimatePresence>
        {isUploading && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsUploading(false)}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm"
            />

            <motion.div
              initial={{ scale: 0.95, y: 15, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.95, y: 15, opacity: 0 }}
              className="relative w-full max-w-sm rounded-3xl bg-white p-6 border border-pink-100 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto"
            >
              <h3 className="text-base font-bold font-myeongjo text-slate-800 border-b border-pink-50 pb-2 flex items-center gap-1.5">
                <Camera className="w-4 h-4 text-pink-400" />
                우리의 새 추억 찍기
              </h3>

              <div className="space-y-4 text-xs">
                {/* Strictly 4:3 Aspect selection area */}
                <div>
                  <label className="block text-[10px] font-semibold text-slate-500 mb-1">
                    사진 첨부 (자동 4:3 크롭)
                  </label>
                  {image ? (
                    <div className="relative aspect-[4/3] w-full rounded-xl overflow-hidden border border-pink-100 bg-slate-50">
                      <img src={image} alt="Upload crop" className="w-full h-full object-cover" />
                      <button
                        onClick={() => setImage('')}
                        className="absolute top-2 right-2 px-2 py-1 bg-black/60 text-white rounded-lg text-[9px]"
                      >
                        지우기
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full aspect-[4/3] bg-pink-50/20 hover:bg-pink-50 border border-dashed border-pink-200 text-pink-500 rounded-xl flex flex-col items-center justify-center gap-1.5 transition-colors"
                    >
                      <Image className="w-8 h-8 text-pink-300 stroke-[1.5]" />
                      <span className="text-[11px]">스마트폰 앨범에서 사진 가져오기</span>
                      <span className="text-[8px] text-slate-400">4:3 비율로 자동 맞춤 정렬됩니다</span>
                    </button>
                  )}
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleImageSelect}
                    accept="image/*"
                    className="hidden"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-semibold text-slate-500 mb-1">그날의 감정 기분</label>
                  <select
                    value={emotion}
                    onChange={(e) => setEmotion(e.target.value)}
                    className="w-full p-2.5 bg-pink-50/20 border border-pink-100 rounded-xl text-slate-700 focus:outline-none"
                  >
                    <option value="행복 가득">행복 가득 😊</option>
                    <option value="설렘 가득">설렘 가득 😍</option>
                    <option value="따뜻한 날">따뜻한 날 🥰</option>
                    <option value="평화로운 때">평화로운 때 🌿</option>
                    <option value="기쁜 하루">기쁜 하루 🎉</option>
                    <option value="소중한 순간">소중한 순간 🌸</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-semibold text-slate-500 mb-1">간단한 그날의 이야기</label>
                  <textarea
                    placeholder="이 사진을 보면 무슨 생각이 나나요? 소중한 감정을 글로 가볍게 옮겨 보세요."
                    rows={3}
                    maxLength={150}
                    value={memo}
                    onChange={(e) => setMemo(e.target.value)}
                    className="w-full p-3 bg-pink-50/20 border border-pink-100 rounded-xl text-slate-700 focus:outline-none resize-none leading-relaxed placeholder:text-slate-400"
                  />
                  <span className="text-[9px] text-slate-400 text-right block mt-1">
                    {memo.length} / 150자
                  </span>
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  onClick={() => setIsUploading(false)}
                  className="flex-1 py-2.5 bg-slate-50 hover:bg-slate-100 text-slate-500 text-xs rounded-xl"
                >
                  취소
                </button>
                <button
                  onClick={handleSavePhoto}
                  disabled={!image || !memo}
                  className="flex-1 py-2.5 bg-pink-500 hover:bg-pink-600 disabled:bg-slate-200 text-white text-xs font-semibold rounded-xl shadow-sm"
                >
                  기억해 두기
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
