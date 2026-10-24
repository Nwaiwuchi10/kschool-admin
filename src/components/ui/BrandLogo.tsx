'use client';

import React from 'react';
import Link from 'next/link';
import { GraduationCap } from 'lucide-react';

interface BrandLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  centered?: boolean;
}

export const BrandLogo: React.FC<BrandLogoProps> = ({
  className = '',
  size = 'md',
  centered = true,
}) => {
  const iconSize = size === 'sm' ? 'w-8 h-8' : size === 'lg' ? 'w-12 h-12' : 'w-10 h-10';
  const capSize = size === 'sm' ? 'w-4.5 h-4.5' : size === 'lg' ? 'w-7 h-7' : 'w-5 h-5';
  const titleSize = size === 'sm' ? 'text-base' : size === 'lg' ? 'text-xl' : 'text-lg';

  return (
    <Link
      href="/login"
      className={`inline-flex items-center gap-3 group transition-transform active:scale-95 ${
        centered ? 'justify-center mx-auto' : ''
      } ${className}`}
    >
      {/* Brand Icon Box */}
      <div
        className={`${iconSize} rounded-xl bg-[#127A71] flex items-center justify-center text-white shadow-sm transition-colors group-hover:bg-[#0E635C] shrink-0`}
      >
        <GraduationCap className={capSize} />
      </div>

      {/* Brand Text */}
      <div className="flex flex-col text-left">
        <span className={`font-bold text-gray-900 tracking-tight leading-none ${titleSize}`}>
          KSchoolmate
        </span>
        <span className="text-[11px] sm:text-xs font-semibold text-[#127A71] tracking-wide mt-1 leading-none">
          Back Office Admin Portal
        </span>
      </div>
    </Link>
  );
};

export default BrandLogo;
