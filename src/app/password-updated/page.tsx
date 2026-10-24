'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import AuthCardLayout from '@/components/ui/AuthCardLayout';
import GreenSuccessBadge from '@/components/ui/GreenSuccessBadge';
import PrimaryButton from '@/components/ui/PrimaryButton';

export default function PasswordUpdatedPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleBackToLogin = () => {
    setIsLoading(true);
    router.push('/login');
  };

  return (
    <AuthCardLayout maxWidth="md">
      <div className="flex flex-col items-center text-center py-4 sm:py-6">
        {/* Large Green Success Badge */}
        <GreenSuccessBadge />

        {/* Title */}
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight mb-3">
          Password Updated Successfully!
        </h1>

        {/* Subtitle */}
        <p className="text-xs sm:text-sm text-gray-500 mb-8 max-w-sm leading-relaxed">
          Your password has been successfully reset. You can now login with your new credentials.
        </p>

        {/* Back to Login Action */}
        <PrimaryButton
          onClick={handleBackToLogin}
          isLoading={isLoading}
          loadingText="Redirecting..."
        >
          Back to Login
        </PrimaryButton>
      </div>
    </AuthCardLayout>
  );
}
