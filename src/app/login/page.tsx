'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import AuthCardLayout from '@/components/ui/AuthCardLayout';
import BrandLogo from '@/components/ui/BrandLogo';
import InputField from '@/components/ui/InputField';
import PrimaryButton from '@/components/ui/PrimaryButton';
import GoogleButton from '@/components/ui/GoogleButton';
import { useAuth } from '@/context/AuthContext';
import { useResponseModal } from '@/context/ModalContext';

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const { showSuccess, showError } = useResponseModal();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

  const validate = () => {
    const newErrors: { email?: string; password?: string } = {};
    if (!email.trim()) {
      newErrors.email = 'Email address is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsLoading(true);
    try {
      const user = await login({ email, password });
      showSuccess(
        'Login Successful',
        `Welcome back, ${user.firstName || 'Admin'}! You have successfully signed in.`,
        () => router.push('/dashboard'),
        'Go to Dashboard'
      );
    } catch (err: any) {
      showError('Authentication Failed', err?.message || 'Invalid email or password. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    showError(
      'Google SSO',
      'Google Single Sign-On is currently disabled for Back Office Administration. Please sign in with your admin email and password.'
    );
  };

  return (
    <AuthCardLayout maxWidth="md">
      <div className="flex flex-col items-center text-center">
        {/* Brand Header */}
        <BrandLogo centered size="md" className="mb-6" />

        {/* Title & Subtitle */}
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight mb-2">
          Welcome Back!
        </h1>
        <p className="text-xs sm:text-sm text-gray-500 mb-6">
          Enter your credentials to access your account
        </p>

        {/* Form */}
        <form onSubmit={handleSubmit} className="w-full flex flex-col gap-4">
          <InputField
            label="Email"
            type="email"
            placeholder="example@gmail.com"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (errors.email) setErrors((prev) => ({ ...prev, email: undefined }));
            }}
            error={errors.email}
            autoComplete="email"
            disabled={isLoading}
          />

          <div>
            <InputField
              label="Password"
              isPassword
              placeholder="••••••••"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (errors.password) setErrors((prev) => ({ ...prev, password: undefined }));
              }}
              error={errors.password}
              autoComplete="current-password"
              disabled={isLoading}
            />
            <div className="flex justify-end mt-1.5">
              <Link
                href="/forgot-password"
                className="text-xs sm:text-sm font-semibold text-[#127A71] hover:text-[#0E635C] hover:underline transition-colors"
              >
                Forgot Password?
              </Link>
            </div>
          </div>

          <PrimaryButton
            type="submit"
            isLoading={isLoading}
            loadingText="Logging in..."
            className="mt-2"
          >
            Login
          </PrimaryButton>
        </form>

        {/* Divider */}
        <div className="w-full flex items-center gap-3 my-5">
          <div className="flex-1 h-px bg-gray-200"></div>
          <span className="text-xs text-gray-400 font-medium">Or continue with</span>
          <div className="flex-1 h-px bg-gray-200"></div>
        </div>

        {/* Google SSO Button */}
        <GoogleButton onClick={handleGoogleLogin} isLoading={isLoading} />

        {/* Sign Up Link */}
        <p className="text-xs sm:text-sm text-gray-500 mt-6">
          Don&apos;t have an account?{' '}
          <Link
            href="/signup"
            className="font-semibold text-[#127A71] hover:text-[#0E635C] hover:underline transition-colors"
          >
            Sign Up
          </Link>
        </p>
      </div>
    </AuthCardLayout>
  );
}
