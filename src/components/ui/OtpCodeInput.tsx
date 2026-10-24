'use client';

import React, { useRef, useEffect } from 'react';

interface OtpCodeInputProps {
  value: string;
  onChange: (value: string) => void;
  length?: number;
  disabled?: boolean;
}

export const OtpCodeInput: React.FC<OtpCodeInputProps> = ({
  value,
  onChange,
  length = 4,
  disabled = false,
}) => {
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Split string into array of characters padded to length
  const digits = Array.from({ length }, (_, i) => value[i] || '');

  useEffect(() => {
    // Focus the first empty input or the first input on initial mount
    const firstEmptyIndex = digits.findIndex((d) => !d);
    const targetIndex = firstEmptyIndex === -1 ? length - 1 : firstEmptyIndex;
    if (inputRefs.current[targetIndex] && !disabled) {
      inputRefs.current[targetIndex]?.focus();
    }
  }, []);

  const handleChange = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/[^0-9]/g, '');
    if (!val) return;

    const newDigits = [...digits];
    // If multiple characters pasted
    if (val.length > 1) {
      const pastedChars = val.slice(0, length - index).split('');
      pastedChars.forEach((char, i) => {
        newDigits[index + i] = char;
      });
      const nextFocus = Math.min(index + pastedChars.length, length - 1);
      inputRefs.current[nextFocus]?.focus();
    } else {
      newDigits[index] = val[val.length - 1]; // take the latest digit
      if (index < length - 1) {
        inputRefs.current[index + 1]?.focus();
      }
    }

    onChange(newDigits.join(''));
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace') {
      e.preventDefault();
      const newDigits = [...digits];
      if (newDigits[index]) {
        newDigits[index] = '';
        onChange(newDigits.join(''));
      } else if (index > 0) {
        newDigits[index - 1] = '';
        onChange(newDigits.join(''));
        inputRefs.current[index - 1]?.focus();
      }
    } else if (e.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === 'ArrowRight' && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/[^0-9]/g, '').slice(0, length);
    if (!pastedData) return;
    onChange(pastedData);
    const targetIdx = Math.min(pastedData.length, length - 1);
    inputRefs.current[targetIdx]?.focus();
  };

  return (
    <div className="flex items-center justify-center gap-3 sm:gap-4 my-6">
      {digits.map((digit, idx) => (
        <input
          key={idx}
          ref={(el) => {
            inputRefs.current[idx] = el;
          }}
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          maxLength={1}
          value={digit}
          disabled={disabled}
          onChange={(e) => handleChange(idx, e)}
          onKeyDown={(e) => handleKeyDown(idx, e)}
          onPaste={handlePaste}
          className={`w-13 h-13 sm:w-16 sm:h-16 text-center text-xl sm:text-2xl font-bold rounded-xl sm:rounded-2xl border bg-white transition-all outline-none ${
            digit
              ? 'border-[#127A71] ring-2 ring-[#127A71]/15 text-[#127A71]'
              : 'border-gray-200 text-gray-900 focus:border-[#127A71] focus:ring-2 focus:ring-[#127A71]/15'
          } disabled:bg-gray-50 disabled:text-gray-400`}
        />
      ))}
    </div>
  );
};

export default OtpCodeInput;
