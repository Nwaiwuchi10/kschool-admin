'use client';

import React, { useState, forwardRef, InputHTMLAttributes } from 'react';
import { Eye, EyeOff } from 'lucide-react';

export interface InputFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  isPassword?: boolean;
}

export const InputField = forwardRef<HTMLInputElement, InputFieldProps>(
  ({ label, error, hint, isPassword, type = 'text', className = '', ...props }, ref) => {
    const [showPassword, setShowPassword] = useState(false);

    const inputType = isPassword ? (showPassword ? 'text' : 'password') : type;

    return (
      <div className="w-full flex flex-col gap-1.5 text-left">
        {label && (
          <label className="text-sm font-semibold text-gray-800">
            {label}
          </label>
        )}

        <div className="relative flex items-center">
          <input
            ref={ref}
            type={inputType}
            className={`w-full h-12 sm:h-13 px-4 rounded-xl sm:rounded-2xl border text-sm sm:text-base text-gray-900 placeholder:text-gray-400 bg-white transition-all outline-none ${
              error
                ? 'border-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-100'
                : 'border-gray-200 focus:border-[#127A71] focus:ring-2 focus:ring-[#127A71]/15'
            } ${isPassword ? 'pr-12' : ''} ${className}`}
            {...props}
          />

          {isPassword && (
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
              className="absolute right-4 text-gray-400 hover:text-gray-600 focus:outline-none p-1 transition-colors"
              tabIndex={-1}
            >
              {showPassword ? (
                <EyeOff className="w-5 h-5 text-gray-400" />
              ) : (
                <Eye className="w-5 h-5 text-gray-400" />
              )}
            </button>
          )}
        </div>

        {error && <span className="text-xs text-red-500 font-medium mt-0.5">{error}</span>}
        {hint && !error && <span className="text-xs text-gray-400 mt-0.5">{hint}</span>}
      </div>
    );
  }
);

InputField.displayName = 'InputField';

export default InputField;
