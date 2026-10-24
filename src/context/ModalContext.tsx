'use client';

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import ResponseMessageModal, { ModalType } from '@/components/ui/ResponseMessageModal';

export interface ShowModalOptions {
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

interface ModalContextValue {
  showModal: (options: ShowModalOptions) => void;
  showSuccess: (
    title: string,
    message: string,
    onConfirm?: () => void,
    confirmText?: string,
    timeout?: number | null | false
  ) => void;
  showError: (
    title: string,
    message: string,
    onConfirm?: () => void,
    timeout?: number | null | false
  ) => void;
  showWarning: (
    title: string,
    message: string,
    onConfirm?: () => void,
    timeout?: number | null | false
  ) => void;
  showInfo: (
    title: string,
    message: string,
    onConfirm?: () => void,
    timeout?: number | null | false
  ) => void;
  hideModal: () => void;
}

const ModalContext = createContext<ModalContextValue | undefined>(undefined);

export const ModalProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [modalState, setModalState] = useState<{
    isOpen: boolean;
    type: ModalType;
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    onConfirm?: () => void;
    onCancel?: () => void;
    timeout?: number | null | false;
    showProgress?: boolean;
    pauseOnHover?: boolean;
  }>({
    isOpen: false,
    type: 'info',
    title: '',
    message: '',
    timeout: undefined,
    showProgress: true,
    pauseOnHover: true,
  });

  const hideModal = useCallback(() => {
    setModalState((prev) => ({ ...prev, isOpen: false }));
  }, []);

  const showModal = useCallback((options: ShowModalOptions) => {
    setModalState({
      isOpen: true,
      type: options.type || 'info',
      title: options.title,
      message: options.message,
      confirmText: options.confirmText,
      cancelText: options.cancelText,
      onConfirm: options.onConfirm,
      onCancel: options.onCancel,
      timeout: options.timeout,
      showProgress: options.showProgress ?? true,
      pauseOnHover: options.pauseOnHover ?? true,
    });
  }, []);

  const showSuccess = useCallback(
    (
      title: string,
      message: string,
      onConfirm?: () => void,
      confirmText?: string,
      timeout?: number | null | false
    ) => {
      showModal({ type: 'success', title, message, onConfirm, confirmText, timeout });
    },
    [showModal]
  );

  const showError = useCallback(
    (
      title: string,
      message: string,
      onConfirm?: () => void,
      timeout?: number | null | false
    ) => {
      showModal({ type: 'error', title, message, onConfirm, confirmText: 'Try Again', timeout });
    },
    [showModal]
  );

  const showWarning = useCallback(
    (
      title: string,
      message: string,
      onConfirm?: () => void,
      timeout?: number | null | false
    ) => {
      showModal({ type: 'warning', title, message, onConfirm, timeout });
    },
    [showModal]
  );

  const showInfo = useCallback(
    (
      title: string,
      message: string,
      onConfirm?: () => void,
      timeout?: number | null | false
    ) => {
      showModal({ type: 'info', title, message, onConfirm, timeout });
    },
    [showModal]
  );

  return (
    <ModalContext.Provider
      value={{
        showModal,
        showSuccess,
        showError,
        showWarning,
        showInfo,
        hideModal,
      }}
    >
      {children}
      <ResponseMessageModal
        key={`${modalState.title}-${modalState.message}-${modalState.isOpen}`}
        isOpen={modalState.isOpen}
        type={modalState.type}
        title={modalState.title}
        message={modalState.message}
        confirmText={modalState.confirmText}
        cancelText={modalState.cancelText}
        onConfirm={modalState.onConfirm}
        onCancel={modalState.onCancel}
        timeout={modalState.timeout}
        showProgress={modalState.showProgress}
        pauseOnHover={modalState.pauseOnHover}
        onClose={hideModal}
      />
    </ModalContext.Provider>
  );
};

export const useResponseModal = (): ModalContextValue => {
  const context = useContext(ModalContext);
  if (!context) {
    throw new Error('useResponseModal must be used within a ModalProvider');
  }
  return context;
};

export default ModalContext;
