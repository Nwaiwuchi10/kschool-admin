'use client';

import React, { useEffect, useState, useRef } from 'react';
import { CheckCircle2, XCircle, AlertTriangle, Info, X } from 'lucide-react';

export type ModalType = 'success' | 'error' | 'warning' | 'info';

export interface ModalConfig {
  isOpen: boolean;
  type?: ModalType;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm?: () => void;
  onCancel?: () => void;
  timeout?: number | null | false;
  showProgress?: boolean;
  pauseOnHover?: boolean;
}

interface ResponseMessageModalProps extends ModalConfig {
  onClose: () => void;
}

export const ResponseMessageModal: React.FC<ResponseMessageModalProps> = ({
  isOpen,
  type = 'info',
  title,
  message,
  confirmText = 'Continue',
  cancelText,
  onConfirm,
  onCancel,
  onClose,
  timeout,
  showProgress = true,
  pauseOnHover = true,
}) => {
  // Determine effective timeout duration in ms
  // Default: 4000ms for alerts/feedback (no cancelText), or null for confirmations (with cancelText)
  const effectiveTimeout =
    timeout === false || timeout === null || timeout === 0
      ? null
      : typeof timeout === 'number'
      ? timeout
      : cancelText
      ? null
      : 4000;

  const [timeLeft, setTimeLeft] = useState<number>(effectiveTimeout ?? 0);
  const [isPaused, setIsPaused] = useState<boolean>(false);

  // References to keep callbacks current without causing re-trigger loops
  const onConfirmRef = useRef(onConfirm);
  const onCancelRef = useRef(onCancel);
  const onCloseRef = useRef(onClose);
  const cancelTextRef = useRef(cancelText);

  useEffect(() => {
    onConfirmRef.current = onConfirm;
    onCancelRef.current = onCancel;
    onCloseRef.current = onClose;
    cancelTextRef.current = cancelText;
  }, [onConfirm, onCancel, onClose, cancelText]);

  // Handle countdown interval
  useEffect(() => {
    if (!isOpen || !effectiveTimeout) return;
    if (isPaused) return;

    const tickInterval = 50;
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        const next = prev - tickInterval;
        if (next <= 0) {
          clearInterval(timer);
          // Auto-trigger on timeout
          if (onConfirmRef.current && !cancelTextRef.current) {
            onConfirmRef.current();
          } else if (onCancelRef.current && cancelTextRef.current) {
            onCancelRef.current();
          }
          onCloseRef.current();
          return 0;
        }
        return next;
      });
    }, tickInterval);

    return () => clearInterval(timer);
  }, [isOpen, effectiveTimeout, isPaused]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleConfirm = () => {
    if (onConfirm) {
      onConfirm();
    }
    onClose();
  };

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    }
    onClose();
  };

  const handleMouseEnter = () => {
    if (pauseOnHover && effectiveTimeout) {
      setIsPaused(true);
    }
  };

  const handleMouseLeave = () => {
    if (pauseOnHover && effectiveTimeout) {
      setIsPaused(false);
    }
  };

  const getIcon = () => {
    switch (type) {
      case 'success':
        return (
          <div className="w-14 h-14 rounded-full bg-emerald-50 flex items-center justify-center text-[#127A71] mb-4">
            <CheckCircle2 className="w-8 h-8 stroke-[2.2]" />
          </div>
        );
      case 'error':
        return (
          <div className="w-14 h-14 rounded-full bg-red-50 flex items-center justify-center text-red-600 mb-4">
            <XCircle className="w-8 h-8 stroke-[2.2]" />
          </div>
        );
      case 'warning':
        return (
          <div className="w-14 h-14 rounded-full bg-amber-50 flex items-center justify-center text-amber-600 mb-4">
            <AlertTriangle className="w-8 h-8 stroke-[2.2]" />
          </div>
        );
      case 'info':
      default:
        return (
          <div className="w-14 h-14 rounded-full bg-teal-50 flex items-center justify-center text-[#127A71] mb-4">
            <Info className="w-8 h-8 stroke-[2.2]" />
          </div>
        );
    }
  };

  const getConfirmBtnColor = () => {
    switch (type) {
      case 'error':
        return 'bg-red-600 hover:bg-red-700 text-white';
      case 'warning':
        return 'bg-amber-600 hover:bg-amber-700 text-white';
      case 'success':
      case 'info':
      default:
        return 'bg-[#127A71] hover:bg-[#0E635C] text-white';
    }
  };

  const getProgressColor = () => {
    switch (type) {
      case 'error':
        return 'bg-red-500';
      case 'warning':
        return 'bg-amber-500';
      case 'success':
      case 'info':
      default:
        return 'bg-[#127A71]';
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs transition-opacity duration-200"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-md bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-gray-100 flex flex-col items-center text-center transform transition-all scale-100 animate-in fade-in zoom-in-95 duration-150 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          type="button"
          aria-label="Close modal"
          className="absolute top-5 right-5 text-gray-400 hover:text-gray-600 p-1.5 rounded-full hover:bg-gray-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Icon */}
        {getIcon()}

        {/* Title */}
        <h3 className="text-xl font-bold text-gray-900 mb-2">{title}</h3>

        {/* Message */}
        <p className="text-sm sm:text-base text-gray-600 leading-relaxed mb-6 max-w-sm">
          {message}
        </p>

        {/* Action Buttons */}
        <div className="w-full flex flex-col sm:flex-row gap-3">
          {cancelText && (
            <button
              type="button"
              onClick={handleCancel}
              className="w-full sm:flex-1 py-3 px-5 rounded-full border border-gray-300 text-gray-700 font-semibold text-sm hover:bg-gray-50 transition-colors"
            >
              {cancelText}
            </button>
          )}
          <button
            type="button"
            onClick={handleConfirm}
            className={`w-full ${cancelText ? 'sm:flex-1' : ''} py-3.5 px-6 rounded-full font-semibold text-sm shadow-sm transition-all transform active:scale-[0.98] ${getConfirmBtnColor()}`}
          >
            {confirmText}
          </button>
        </div>

        {/* Timeout Progress Bar */}
        {effectiveTimeout && showProgress && (
          <div
            className="absolute bottom-0 left-0 right-0 h-1.5 bg-gray-100 overflow-hidden"
            title={isPaused ? 'Auto-close paused' : 'Auto-closing (hover to pause)'}
          >
            <div
              className={`h-full transition-all duration-75 ease-linear ${getProgressColor()}`}
              style={{
                width: `${Math.max(0, Math.min(100, (timeLeft / effectiveTimeout) * 100))}%`,
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default ResponseMessageModal;
