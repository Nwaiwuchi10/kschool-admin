'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useResponseModal } from '@/context/ModalContext';
import BrandLogo from './BrandLogo';
import { LogOut, Bell, BookOpen, Layers, LayoutDashboard, FileText, CheckCircle2 } from 'lucide-react';

export const AdminNavbar: React.FC = () => {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const { showModal } = useResponseModal();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = () => {
    showModal({
      type: 'warning',
      title: 'Confirm Logout',
      message: 'Are you sure you want to log out of the KSchoolmate Back Office Portal?',
      confirmText: 'Yes, Log Out',
      cancelText: 'Cancel',
      onConfirm: () => {
        setIsLoggingOut(true);
        logout();
      },
    });
  };

  const navLinks = [
    { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { label: 'Classes', href: '/classes', icon: Layers },
    { label: 'Subjects', href: '/subjects', icon: BookOpen },
    { label: 'Lessons & TTS', href: '/lessons', icon: FileText },
    { label: 'Status', href: '/content-status', icon: CheckCircle2 },
  ];

  return (
    <header className="bg-white border-b border-gray-100 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Left: Brand Logo & Nav */}
        <div className="flex items-center gap-5 sm:gap-6">
          <BrandLogo centered={false} size="sm" />

          <nav className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive =
                pathname === link.href ||
                (link.href !== '/dashboard' && pathname?.startsWith(link.href));
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs sm:text-sm font-semibold transition-all ${
                    isActive
                      ? 'bg-emerald-50 text-[#127A71]'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{link.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Right: Notifications & Profile */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Notification Icon */}
          <button
            type="button"
            aria-label="Notifications"
            className="w-9 h-9 rounded-full border border-gray-100 flex items-center justify-center text-gray-500 hover:text-gray-900 hover:bg-gray-50 transition-colors relative cursor-pointer"
          >
            <Bell className="w-4 h-4" />
            <span className="w-2 h-2 rounded-full bg-[#127A71] absolute top-2 right-2 ring-2 ring-white"></span>
          </button>

          {/* User Profile Badge */}
          <div className="flex items-center gap-2 px-2.5 sm:px-3 py-1.5 rounded-full bg-gray-50 border border-gray-200">
            <div className="w-7 h-7 rounded-full bg-[#127A71] text-white flex items-center justify-center text-xs font-bold shrink-0">
              {user?.firstName?.[0]?.toUpperCase() || 'A'}
            </div>
            <span className="hidden sm:inline-block text-xs font-semibold text-gray-700 max-w-[110px] truncate">
              {user?.firstName || 'Admin'}
            </span>
            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-emerald-100 text-[#127A71]">
              {user?.role || 'Admin'}
            </span>
          </div>

          {/* Logout Button */}
          <button
            onClick={handleLogout}
            disabled={isLoggingOut}
            aria-label="Logout"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-gray-200 text-gray-600 hover:text-red-600 hover:border-red-200 hover:bg-red-50 text-xs font-semibold transition-colors cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Log Out</span>
          </button>
        </div>
      </div>

      {/* Mobile Sub-Navigation Bar */}
      <div className="lg:hidden flex items-center justify-around border-t border-gray-100 px-2 py-2 bg-white overflow-x-auto">
        {navLinks.map((link) => {
          const Icon = link.icon;
          const isActive =
            pathname === link.href ||
            (link.href !== '/dashboard' && pathname?.startsWith(link.href));
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold shrink-0 ${
                isActive
                  ? 'bg-emerald-50 text-[#127A71]'
                  : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{link.label}</span>
            </Link>
          );
        })}
      </div>
    </header>
  );
};

export default AdminNavbar;
