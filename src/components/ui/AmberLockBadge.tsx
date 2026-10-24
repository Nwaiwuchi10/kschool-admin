'use client';

import React from 'react';
import { Lock } from 'lucide-react';

interface AmberLockBadgeProps {
  className?: string;
}

export const AmberLockBadge: React.FC<AmberLockBadgeProps> = ({ className = '' }) => {
  return (
    <div
      className={`w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-[#FEF3C7] flex items-center justify-center text-[#D97706] mx-auto mb-4 sm:mb-5 shadow-2xs ${className}`}
    >
      <Lock className="w-7 h-7 sm:w-8 sm:h-8 stroke-[2.2]" />
    </div>
  );
};

export default AmberLockBadge;
