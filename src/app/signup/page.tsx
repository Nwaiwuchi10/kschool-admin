'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import AuthCardLayout from '@/components/ui/AuthCardLayout';
import BrandLogo from '@/components/ui/BrandLogo';
import InputField from '@/components/ui/InputField';
import PrimaryButton from '@/components/ui/PrimaryButton';
import { useAuth } from '@/context/AuthContext';
import { useResponseModal } from '@/context/ModalContext';

export default function SignUpPage() {
  const router = useRouter();
  const { register } = useAuth();
  const { showSuccess, showError } = useResponseModal();

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    password: '',
    confirmPassword: '',
  });

  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    }
    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    }
    if (!formData.email.trim()) {
      newErrors.email = 'Email address is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const copy = { ...prev };
        delete copy[field];
        return copy;
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsLoading(true);
    try {
      const user = await register({
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phoneNumber: formData.phoneNumber || undefined,
        password: formData.password,
        confirmPassword: formData.confirmPassword,
      });

      showSuccess(
        'Account Created Successfully!',
        `Welcome to KSchoolmate, ${user.firstName || 'Admin'}! Your back office account has been initialized and a welcome notification has been sent to your email.`,
        () => router.push('/dashboard'),
        'Go to Dashboard'
      );
    } catch (err: any) {
      showError('Registration Failed', err?.message || 'Unable to create account. Please check your information and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthCardLayout maxWidth="lg">
      <div className="flex flex-col items-center text-center">
        {/* Brand Header */}
        <BrandLogo centered size="md" className="mb-5" />

        {/* Title & Subtitle */}
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight mb-2">
          Create Account
        </h1>
        <p className="text-xs sm:text-sm text-gray-500 mb-6">
          Enter your details to create your admin account
        </p>

        {/* Form */}
        <form onSubmit={handleSubmit} className="w-full flex flex-col gap-3.5 sm:gap-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-4">
            <InputField
              label="First Name"
              placeholder="e.g. John"
              value={formData.firstName}
              onChange={(e) => handleChange('firstName', e.target.value)}
              error={errors.firstName}
              autoComplete="given-name"
              disabled={isLoading}
            />
            <InputField
              label="Last Name"
              placeholder="e.g. Doe"
              value={formData.lastName}
              onChange={(e) => handleChange('lastName', e.target.value)}
              error={errors.lastName}
              autoComplete="family-name"
              disabled={isLoading}
            />
          </div>

          <InputField
            label="Email"
            type="email"
            placeholder="e.g. johndoe@gmail.com"
            value={formData.email}
            onChange={(e) => handleChange('email', e.target.value)}
            error={errors.email}
            autoComplete="email"
            disabled={isLoading}
          />

          <InputField
            label="Phone Number"
            type="tel"
            placeholder="e.g. +234 801 234 5678"
            value={formData.phoneNumber}
            onChange={(e) => handleChange('phoneNumber', e.target.value)}
            error={errors.phoneNumber}
            autoComplete="tel"
            disabled={isLoading}
            hint="Optional"
          />

          <InputField
            label="Password"
            isPassword
            placeholder="Enter password"
            value={formData.password}
            onChange={(e) => handleChange('password', e.target.value)}
            error={errors.password}
            autoComplete="new-password"
            disabled={isLoading}
          />

          <InputField
            label="Confirm Password"
            isPassword
            placeholder="Confirm password"
            value={formData.confirmPassword}
            onChange={(e) => handleChange('confirmPassword', e.target.value)}
            error={errors.confirmPassword}
            autoComplete="new-password"
            disabled={isLoading}
          />

          <PrimaryButton
            type="submit"
            isLoading={isLoading}
            loadingText="Creating account..."
            className="mt-3"
          >
            Create Account
          </PrimaryButton>
        </form>

        {/* Login Link */}
        <p className="text-xs sm:text-sm text-gray-500 mt-6">
          Already have an account?{' '}
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
