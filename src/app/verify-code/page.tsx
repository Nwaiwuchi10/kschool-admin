'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AuthCardLayout from '@/components/ui/AuthCardLayout';
import OtpCodeInput from '@/components/ui/OtpCodeInput';
import PrimaryButton from '@/components/ui/PrimaryButton';
import { authService } from '@/services/auth.service';
import { storageService } from '@/services/storage.service';
import { useResponseModal } from '@/context/ModalContext';

export default function VerifyCodePage() {
  const router = useRouter();
  const { showSuccess, showError } = useResponseModal();

  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [timer, setTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const savedEmail = storageService.getResetEmail();
    if (!savedEmail) {
      router.replace('/forgot-password');
      return;
    }
    setEmail(savedEmail);
  }, [router]);

  // Resend countdown timer
  useEffect(() => {
    if (timer <= 0) {
      setCanResend(true);
      return;
    }
    const interval = setInterval(() => {
      setTimer((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [timer]);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (code.length < 4) {
      setError('Please enter the full 4-digit verification code');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      await authService.verifyResetCode({ email, code });
      storageService.setResetCode(code);

      showSuccess(
        'Code Verified Successfully',
        'Your 4-digit code is verified. Please proceed to create your new password.',
        () => router.push('/create-new-password'),
        'Set New Password'
      );
    } catch (err: any) {
      setError(err?.message || 'Invalid or expired verification code');
      showError(
        'Verification Failed',
        err?.message || 'The code you entered is invalid or has expired. Please check your email or click Resend Code.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    if (!canResend || isResending) return;

    setIsResending(true);
    try {
      await authService.forgotPassword({ email });
      setTimer(60);
      setCanResend(false);
      setCode('');
      setError('');
      showSuccess('Code Resent', `A new 4-digit verification code has been dispatched to ${email}.`);
    } catch (err: any) {
      showError('Resend Failed', err?.message || 'Unable to resend verification code. Please try again.');
    } finally {
      setIsResending(false);
    }
  };

  return (
    <AuthCardLayout showBack backHref="/forgot-password" maxWidth="md">
      <div className="flex flex-col items-center text-center">
        {/* Title & Subtitle */}
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight mb-2">
          Enter Verification Code
        </h1>
        <p className="text-xs sm:text-sm text-gray-500 mb-2 max-w-sm">
          We have sent a 4-digit code to{' '}
          <span className="font-semibold text-gray-800">{email || 'your email'}</span>. Enter
          the code below to verify.
        </p>

        {/* Form */}
        <form onSubmit={handleVerify} className="w-full flex flex-col items-center">
          <OtpCodeInput
            value={code}
            onChange={(val) => {
              setCode(val);
              if (error) setError('');
            }}
            length={4}
            disabled={isLoading}
          />

          {error && (
            <p className="text-xs text-red-500 font-medium mb-3 -mt-2">{error}</p>
          )}

          {/* Resend Code Section */}
          <div className="text-xs sm:text-sm text-gray-500 mb-6">
            Didn&apos;t receive the code?{' '}
            {canResend ? (
              <button
                type="button"
                onClick={handleResend}
                disabled={isResending}
                className="font-semibold text-[#127A71] hover:text-[#0E635C] hover:underline cursor-pointer disabled:opacity-50"
              >
                {isResending ? 'Resending...' : 'Resend Code'}
              </button>
            ) : (
              <span className="font-semibold text-gray-400">
                Resend in {Math.floor(timer / 60)}:{(timer % 60).toString().padStart(2, '0')}
              </span>
            )}
          </div>

          <PrimaryButton
            type="submit"
            isLoading={isLoading}
            loadingText="Verifying..."
            disabled={code.length < 4}
          >
            Verify
          </PrimaryButton>
        </form>
      </div>
    </AuthCardLayout>
  );
}
