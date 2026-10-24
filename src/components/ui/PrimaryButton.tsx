'use client';

import React, { ButtonHTMLAttributes } from 'react';
import { Loader2 } from 'lucide-react';

export interface PrimaryButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  isLoading?: boolean;
  loadingText?: string;
  variant?: 'primary' | 'outline' | 'google' | 'secondary';
  fullWidth?: boolean;
}

export const PrimaryButton: React.FC<PrimaryButtonProps> = ({
  children,
  isLoading = false,
  loadingText,
  variant = 'primary',
  fullWidth = true,
  disabled,
  className = '',
  ...props
}) => {
  const getVariantStyles = () => {
    switch (variant) {
      case 'outline':
        return 'border border-gray-300 text-gray-700 bg-white hover:bg-gray-50 active:bg-gray-100';
      case 'google':
        return 'border border-gray-200 text-gray-700 bg-white hover:bg-gray-50 active:bg-gray-100 shadow-xs';
      case 'secondary':
        return 'bg-gray-100 text-gray-800 hover:bg-gray-200 active:bg-gray-300';
      case 'primary':
      default:
        return 'bg-[#127A71] text-white hover:bg-[#0E635C] active:bg-[#0B4E48] shadow-sm hover:shadow-md';
    }
  };

  return (
    <button
      disabled={disabled || isLoading}
      className={`relative inline-flex items-center justify-center font-semibold text-sm sm:text-base rounded-full h-12 sm:h-13 px-6 transition-all duration-200 transform active:scale-[0.99] cursor-pointer disabled:cursor-not-allowed disabled:opacity-65 select-none ${
        fullWidth ? 'w-full' : ''
      } ${getVariantStyles()} ${className}`}
      {...props}
    >
      {isLoading ? (
        <span className="flex items-center justify-center gap-2">
          <Loader2 className="w-5 h-5 animate-spin" />
          <span>{loadingText || children}</span>
        </span>
      ) : (
        children
      )}
    </button>
  );
};

export default PrimaryButton;
