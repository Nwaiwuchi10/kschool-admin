'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AuthCardLayout from '@/components/ui/AuthCardLayout';
import AmberLockBadge from '@/components/ui/AmberLockBadge';
import InputField from '@/components/ui/InputField';
import PrimaryButton from '@/components/ui/PrimaryButton';
import { authService } from '@/services/auth.service';
import { storageService } from '@/services/storage.service';
import { useResponseModal } from '@/context/ModalContext';

export default function CreateNewPasswordPage() {
  const router = useRouter();
  const { showSuccess, showError } = useResponseModal();

  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{ newPassword?: string; confirmPassword?: string }>({});

  useEffect(() => {
    const savedEmail = storageService.getResetEmail();
    const savedCode = storageService.getResetCode();

    if (!savedEmail || !savedCode) {
      router.replace('/forgot-password');
      return;
    }

    setEmail(savedEmail);
    setCode(savedCode);
  }, [router]);

  const validate = () => {
    const newErrors: { newPassword?: string; confirmPassword?: string } = {};

    if (!newPassword) {
      newErrors.newPassword = 'New password is required';
    } else if (newPassword.length < 6) {
      newErrors.newPassword = 'Password must be at least 6 characters';
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = 'Confirm your new password';
    } else if (newPassword !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsLoading(true);
    try {
      await authService.resetPassword({
        email,
        code,
        newPassword,
        confirmPassword,
      });

      // Navigate to the Password Updated confirmation screen
      router.push('/password-updated');
    } catch (err: any) {
      showError(
        'Password Reset Failed',
        err?.message || 'Unable to update password. Your verification code may have expired. Please try again.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthCardLayout showBack backHref="/verify-code" maxWidth="md">
      <div className="flex flex-col items-center text-center">
        {/* Amber Lock Badge */}
        <AmberLockBadge />

        {/* Title & Subtitle */}
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight mb-2">
          Create New Password
        </h1>
        <p className="text-xs sm:text-sm text-gray-500 mb-6 max-w-sm">
          Your new password must be different from previous used passwords.
        </p>

        {/* Form */}
        <form onSubmit={handleSubmit} className="w-full flex flex-col gap-4">
          <InputField
            label="New Password"
            isPassword
            placeholder="Enter new password"
            value={newPassword}
            onChange={(e) => {
              setNewPassword(e.target.value);
              if (errors.newPassword) setErrors((prev) => ({ ...prev, newPassword: undefined }));
            }}
            error={errors.newPassword}
            autoComplete="new-password"
            disabled={isLoading}
            autoFocus
          />

          <InputField
            label="Confirm Password"
            isPassword
            placeholder="Re-enter new password"
            value={confirmPassword}
            onChange={(e) => {
              setConfirmPassword(e.target.value);
              if (errors.confirmPassword) setErrors((prev) => ({ ...prev, confirmPassword: undefined }));
            }}
            error={errors.confirmPassword}
            autoComplete="new-password"
            disabled={isLoading}
          />

          <PrimaryButton
            type="submit"
            isLoading={isLoading}
            loadingText="Updating Password..."
            className="mt-2"
          >
            Update Password
          </PrimaryButton>
        </form>
      </div>
    </AuthCardLayout>
  );
}
