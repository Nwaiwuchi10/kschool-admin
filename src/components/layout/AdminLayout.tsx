'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/context/AuthContext';
import { useResponseModal } from '@/context/ModalContext';
import {
  LayoutDashboard,
  Users,
  Tv,
  Building2,
  BookOpen,
  BookMarked,
  FileEdit,
  CheckSquare,
  BarChart3,
  Megaphone,
  Settings,
  Menu,
  X,
  ChevronRight,
  TrendingUp,
  SlidersHorizontal,
  LogOut,
  CreditCard,
  Wallet,
} from 'lucide-react';

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface AdminLayoutProps {
  children: React.ReactNode;
  activeNav?: string;
  breadcrumbs?: BreadcrumbItem[];
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({
  children,
  activeNav = 'Classes',
  breadcrumbs = [{ label: 'Management', href: '/classes' }, { label: 'Classes' }],
}) => {
  const [pathname, setPathname] = useState('');
  const { user, logout } = useAuth();
  const { showModal } = useResponseModal();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      setPathname(window.location.pathname);
    }
  }, []);

  const handleLogout = () => {
    showModal({
      type: 'warning',
      title: 'Confirm Logout',
      message: 'Are you sure you want to log out of the KSchoolmate Back Office Portal?',
      confirmText: 'Yes, Log Out',
      cancelText: 'Cancel',
      onConfirm: () => {
        logout();
      },
    });
  };

  const navItems = [
    { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { label: 'Students', href: '/students', icon: Users },
    { label: 'Teachers', href: '/teachers', icon: Tv },
    { label: 'Classes', href: '/classes', icon: Building2 },
    { label: 'Subjects', href: '/subjects', icon: BookOpen },
    { label: 'Lessons', href: '/lessons', icon: BookMarked },
    { label: 'Exercises', href: '/exercises', icon: FileEdit },
    { label: 'Quizzes', href: '/quizzes', icon: CheckSquare },
    { label: 'Subscriptions', href: '/subscriptions', icon: CreditCard },
    { label: 'Finances', href: '/finances', icon: Wallet },
    { label: 'Reports', href: '/reports', icon: BarChart3 },
    { label: 'Announce', href: '/announce', icon: Megaphone },
    { label: 'Settings', href: '/settings', icon: Settings },
  ];

  const mobileBottomNav = [
    { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { label: 'Management', href: '/classes', icon: SlidersHorizontal },
    { label: 'Finances', href: '/finances', icon: Wallet },
    { label: 'Reports', href: '/reports', icon: TrendingUp },
    { label: 'Settings', href: '/settings', icon: Settings },
  ];

  const adminName = user?.firstName && user?.lastName 
    ? `${user.firstName} ${user.lastName}` 
    : user?.firstName || user?.email?.split('@')[0] || 'Administrator';
  const adminRole = user?.role === 'admin' ? 'School Administrator' : 'Administrator';
  const schoolName = user?.school || 'School Workspace';

  // Get admin initials
  const initials = (
    user?.firstName && user?.lastName
      ? `${user.firstName[0]}${user.lastName[0]}`
      : user?.firstName
      ? user.firstName.slice(0, 2)
      : user?.email
      ? user.email.slice(0, 2)
      : 'AD'
  ).toUpperCase();

  return (
    <div className="min-h-screen flex flex-col bg-[#F7F9FA] text-[#1A1A1A]">
      {/* =========================================================================
          TOP TEAL HEADER (Matching Screenshot Exactly)
          ========================================================================= */}
      <header className="bg-[#0D5C52] text-white sticky top-0 z-40 shadow-sm rounded-b-[20px] sm:rounded-b-[28px]">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 h-16 sm:h-18 flex items-center justify-between">
          {/* Left: Brand Identity */}
          <Link href="/classes" className="flex items-center gap-3 group">
            {/* Logo Mark: White Shield/Eye Icon Box */}
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-white/15 border border-white/20 flex items-center justify-center shrink-0 group-hover:bg-white/25 transition-colors">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M12 4.5C7 4.5 2.73 7.61 1 12C2.73 16.39 7 19.5 12 19.5C17 19.5 21.27 16.39 23 12C21.27 7.61 17 4.5 12 4.5ZM12 17C9.24 17 7 14.76 7 12C7 9.24 9.24 7 12 7C14.76 7 17 9.24 17 12C17 14.76 14.76 17 12 17ZM12 9C10.34 9 9 10.34 9 12C9 13.66 10.34 15 12 15C13.66 15 15 13.66 15 12C15 10.34 13.66 9 12 9Z"
                  fill="white"
                />
              </svg>
            </div>
            <div className="flex flex-col">
              <span className="font-extrabold text-base sm:text-lg tracking-wider text-white leading-tight">
                KSCHOOLMATE
              </span>
              <span className="text-[11px] sm:text-xs text-[#9CD6CE] font-medium leading-none mt-0.5">
                {schoolName}
              </span>
            </div>
          </Link>

          {/* Right: Administrator Profile */}
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex flex-col text-right">
              <span className="text-sm font-bold text-white leading-tight">{adminName}</span>
              <span className="text-xs text-[#9CD6CE] leading-none mt-0.5">{adminRole}</span>
            </div>

            {/* Profile Avatar: Real user avatar or dynamic monogram */}
            {user?.avatar ? (
              <div className="relative w-9 h-9 sm:w-10 sm:h-10 rounded-full ring-2 ring-white/40 overflow-hidden shrink-0 bg-white/20">
                <Image
                  src={user.avatar}
                  alt={adminName}
                  fill
                  className="object-cover"
                  priority
                />
              </div>
            ) : (
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full ring-2 ring-white/40 overflow-hidden shrink-0 bg-[#0A4B42] text-white flex items-center justify-center font-bold text-xs sm:text-sm tracking-wider shadow-inner">
                {initials}
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Mobile Sub-Header Bar (Matching Mobile Screenshot) */}
      <div className="lg:hidden bg-white text-[#1A1A1A] border-b border-gray-200/60 px-4 py-2.5 flex items-center justify-between shadow-2xs">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setMobileMenuOpen(true)}
            className="p-1.5 -ml-1 rounded-lg hover:bg-gray-100 text-gray-700"
            aria-label="Open navigation menu"
          >
            <Menu className="w-5 h-5" />
          </button>
          <span className="text-xs font-bold text-gray-800">Management</span>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3.5 py-1 rounded-full text-xs font-bold bg-[#D2F4EB] text-[#0E6659] border border-[#BCE8DD]">
            {activeNav}
          </span>
        </div>
      </div>

      {/* =========================================================================
          BODY WITH DESKTOP SIDEBAR + MAIN CONTENT AREA
          ========================================================================= */}
      <div className="flex-1 max-w-[1440px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-5 sm:py-7 flex gap-6 lg:gap-8">
        {/* DESKTOP SIDEBAR (Administration) */}
        <aside className="hidden lg:flex flex-col w-56 shrink-0">
          <div className="bg-white border border-gray-200/90 rounded-2xl p-4 shadow-xs sticky top-24 flex flex-col min-h-[calc(100vh-120px)] justify-between">
            <div>
              {/* Sidebar Header */}
              <div className="px-3 py-1 mb-3">
                <span className="text-[11px] font-bold text-[#8C9BA8] tracking-widest uppercase">
                  ADMINISTRATION
                </span>
              </div>

              {/* Sidebar Navigation Items */}
              <nav className="space-y-1">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive =
                    activeNav.toLowerCase() === item.label.toLowerCase() ||
                    pathname === item.href ||
                    (item.href !== '/dashboard' && pathname?.startsWith(item.href));

                  return (
                    <Link
                      key={item.label}
                      href={item.href}
                      className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                        isActive
                          ? 'bg-[#D2F4EB] text-[#0E6659] shadow-xs'
                          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                      }`}
                    >
                      <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-[#0E6659]' : 'text-gray-500'}`} />
                      <span>{item.label}</span>
                    </Link>
                  );
                })}
              </nav>
            </div>

            {/* Sidebar Footer Workspace Info */}
            <div className="pt-4 border-t border-gray-100 px-3">
              <div className="text-xs font-bold text-gray-800">{schoolName}</div>
              <div className="text-[11px] text-gray-400 mt-0.5">Admin workspace</div>
            </div>
          </div>
        </aside>

        {/* MAIN CONTENT AREA */}
        <main className="flex-1 min-w-0 pb-20 lg:pb-8">
          {/* Breadcrumbs */}
          {breadcrumbs && breadcrumbs.length > 0 && (
            <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-3 font-medium flex-wrap">
              {breadcrumbs.map((crumb, idx) => {
                const isLast = idx === breadcrumbs.length - 1;
                return (
                  <React.Fragment key={idx}>
                    {crumb.href && !isLast ? (
                      <Link href={crumb.href} className="hover:text-[#0D6D62] transition-colors">
                        {crumb.label}
                      </Link>
                    ) : (
                      <span className={isLast ? 'text-gray-800 font-semibold' : ''}>
                        {crumb.label}
                      </span>
                    )}
                    {!isLast && <span className="text-gray-400">/</span>}
                  </React.Fragment>
                );
              })}
            </div>
          )}

          {/* Child Page Content */}
          {children}
        </main>
      </div>

      {/* =========================================================================
          MOBILE SLIDE-OVER DRAWER
          ========================================================================= */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="relative w-4/5 max-w-xs bg-white h-full shadow-2xl p-5 flex flex-col justify-between z-10">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-gray-100">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-[#0D5C52] text-white flex items-center justify-center font-bold text-sm">
                    K
                  </div>
                  <span className="font-bold text-gray-900 text-sm">Administration</span>
                </div>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-1 rounded-lg hover:bg-gray-100 text-gray-500"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="mt-4 space-y-1">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive =
                    activeNav.toLowerCase() === item.label.toLowerCase() ||
                    pathname === item.href ||
                    (item.href !== '/dashboard' && pathname?.startsWith(item.href));

                  return (
                    <Link
                      key={item.label}
                      href={item.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                        isActive
                          ? 'bg-[#D2F4EB] text-[#0E6659]'
                          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span>{item.label}</span>
                    </Link>
                  );
                })}
              </div>
            </div>

            <div className="pt-4 border-t border-gray-100">
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-semibold text-red-600 hover:bg-red-50 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span>Log Out</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          MOBILE FIXED BOTTOM NAVIGATION BAR (Matching Mobile Screenshot)
          ========================================================================= */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-gray-200 flex items-center justify-around py-2 px-1 shadow-lg">
        {mobileBottomNav.map((item) => {
          const Icon = item.icon;
          const isManagement =
            item.label === 'Management' &&
            (['classes', 'students', 'teachers', 'subjects', 'lessons', 'exercises', 'quizzes', 'topics'].includes(
              activeNav.toLowerCase()
            ) ||
              pathname?.startsWith('/classes') ||
              pathname?.startsWith('/students') ||
              pathname?.startsWith('/teachers') ||
              pathname?.startsWith('/subjects') ||
              pathname?.startsWith('/lessons') ||
              pathname?.startsWith('/exercises') ||
              pathname?.startsWith('/quizzes') ||
              pathname?.startsWith('/topics'));

          const isActive =
            item.label === 'Management'
              ? isManagement
              : activeNav.toLowerCase() === item.label.toLowerCase() ||
                pathname === item.href ||
                (item.href !== '/dashboard' && pathname?.startsWith(item.href));

          return (
            <Link
              key={item.label}
              href={item.href}
              className={`flex flex-col items-center justify-center flex-1 py-1 text-[10px] font-bold transition-colors ${
                isActive ? 'text-[#0D6D62]' : 'text-gray-400 hover:text-gray-700'
              }`}
            >
              <div
                className={`p-1 rounded-full ${
                  isActive ? 'bg-[#D2F4EB] text-[#0D6D62]' : 'text-gray-400'
                }`}
              >
                <Icon className="w-4 h-4" />
              </div>
              <span className="mt-0.5">{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
};

export default AdminLayout;
