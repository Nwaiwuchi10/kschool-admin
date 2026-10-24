'use client';

import React, { ReactNode } from 'react';
import BackButton from './BackButton';

interface AuthCardLayoutProps {
  children: ReactNode;
  showBack?: boolean;
  backHref?: string;
  onBack?: () => void;
  maxWidth?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const AuthCardLayout: React.FC<AuthCardLayoutProps> = ({
  children,
  showBack = false,
  backHref,
  onBack,
  maxWidth = 'md',
  className = '',
}) => {
  const getMaxWidthClass = () => {
    switch (maxWidth) {
      case 'sm':
        return 'max-w-[420px]';
      case 'lg':
        return 'max-w-[520px]';
      case 'md':
      default:
        return 'max-w-[460px]';
    }
  };

  return (
    <main className="min-h-screen w-full flex flex-col justify-center items-center p-4 sm:p-6 md:p-8 bg-[#FAFAFA]">
      <div
        className={`w-full ${getMaxWidthClass()} bg-white rounded-2xl sm:rounded-3xl p-6 sm:p-10 shadow-[0_4px_25px_rgba(0,0,0,0.03)] border border-gray-100 relative transition-all ${className}`}
      >
        {showBack && (
          <div className="mb-4 sm:mb-6">
            <BackButton href={backHref} onClick={onBack} />
          </div>
        )}
        {children}
      </div>

      <footer className="mt-6 text-center text-xs text-gray-400">
        © 2026 KSchoolmate Admin. All rights reserved.
      </footer>
    </main>
  );
};

export default AuthCardLayout;
