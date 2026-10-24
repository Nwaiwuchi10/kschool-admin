'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import AuthCardLayout from '@/components/ui/AuthCardLayout';
import AmberLockBadge from '@/components/ui/AmberLockBadge';
import InputField from '@/components/ui/InputField';
import PrimaryButton from '@/components/ui/PrimaryButton';
import { authService } from '@/services/auth.service';
import { storageService } from '@/services/storage.service';
import { useResponseModal } from '@/context/ModalContext';

export default function ForgotPasswordPage() {
  const router = useRouter();
  const { showSuccess, showError } = useResponseModal();

  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const validate = () => {
    if (!email.trim()) {
      setError('Email address is required');
      return false;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Please enter a valid email address');
      return false;
    }
    setError('');
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsLoading(true);
    try {
      const res = await authService.forgotPassword({ email });
      storageService.setResetEmail(email);

      showSuccess(
        'Code Sent Successfully',
        res.message || 'We have sent a 4-digit verification code to your email address. Please check your inbox.',
        () => router.push('/verify-code'),
        'Enter Code'
      );
    } catch (err: any) {
      showError(
        'Email Not Found',
        err?.message || 'No back office account found with this email address. Please check and try again.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthCardLayout showBack backHref="/login" maxWidth="md">
      <div className="flex flex-col items-center text-center">
        {/* Amber Lock Badge */}
        <AmberLockBadge />

        {/* Title & Subtitle */}
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight mb-2">
          Forgot Password?
        </h1>
        <p className="text-xs sm:text-sm text-gray-500 mb-6 max-w-sm">
          Enter your email address to receive a verification code to reset your password.
        </p>

        {/* Form */}
        <form onSubmit={handleSubmit} className="w-full flex flex-col gap-4">
          <InputField
            label="Email Address"
            type="email"
            placeholder="e.g. johndoe@gmail.com"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (error) setError('');
            }}
            error={error}
            autoComplete="email"
            disabled={isLoading}
            autoFocus
          />

          <PrimaryButton
            type="submit"
            isLoading={isLoading}
            loadingText="Sending code..."
            className="mt-2"
          >
            Continue
          </PrimaryButton>
        </form>

        {/* Remember Password Link */}
        <p className="text-xs sm:text-sm text-gray-500 mt-6">
          Remember password?{' '}
          <Link
            href="/login"
            className="font-semibold text-[#127A71] hover:text-[#0E635C] hover:underline transition-colors"
          >
            Login
          </Link>
        </p>
      </div>
    </AuthCardLayout>
  );
}
