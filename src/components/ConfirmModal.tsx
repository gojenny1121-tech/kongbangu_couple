import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AlertCircle } from 'lucide-react';

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  title,
  message,
  onConfirm,
  onCancel,
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop blur & overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onCancel}
            className="fixed inset-0 bg-black/30 backdrop-blur-sm"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 350 }}
            className="relative w-full max-w-sm rounded-3xl bg-white p-6 shadow-xl border border-pink-100"
          >
            <div className="flex flex-col items-center text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-pink-50 text-pink-500 mb-4">
                <AlertCircle className="h-6 w-6" />
              </div>
              
              <h3 className="text-lg font-semibold text-slate-800 font-myeongjo mb-2">
                {title}
              </h3>
              
              <p className="text-sm text-slate-500 leading-relaxed mb-6 whitespace-pre-wrap">
                {message}
              </p>

              <div className="flex w-full gap-3">
                <button
                  onClick={onCancel}
                  className="flex-1 rounded-xl bg-slate-50 py-3 text-sm font-medium text-slate-500 hover:bg-slate-100 transition-colors active:scale-95"
                >
                  취소
                </button>
                <button
                  onClick={onConfirm}
                  className="flex-1 rounded-xl bg-pink-500 py-3 text-sm font-medium text-white hover:bg-pink-600 transition-colors shadow-sm shadow-pink-500/20 active:scale-95"
                >
                  확인
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
