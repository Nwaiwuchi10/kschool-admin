'use client';

import React from 'react';
import { Check } from 'lucide-react';

interface GreenSuccessBadgeProps {
  className?: string;
}

export const GreenSuccessBadge: React.FC<GreenSuccessBadgeProps> = ({ className = '' }) => {
  return (
    <div
      className={`w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-[#D1FAE5] border-8 border-emerald-50/60 flex items-center justify-center text-[#127A71] mx-auto mb-6 shadow-xs animate-in zoom-in-75 duration-300 ${className}`}
    >
      <Check className="w-10 h-10 sm:w-12 sm:h-12 stroke-[3]" />
    </div>
  );
};

export default GreenSuccessBadge;
