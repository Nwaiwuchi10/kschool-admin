'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import AdminLayout from '@/components/layout/AdminLayout';
import { subscriptionService, FinancesSummary, StudentSubscriptionItem } from '@/services/subscription.service';
import { classService } from '@/services/class.service';
import { SchoolClass } from '@/types/curriculum.types';
import { useResponseModal } from '@/context/ModalContext';
import {
  Wallet,
  CreditCard,
  TrendingUp,
  Clock,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Filter,
  Calendar,
  Search,
  ArrowUpRight,
  RefreshCw,
  Building2,
  Users,
} from 'lucide-react';

function FinancesContent() {
  const { showError, showSuccess } = useResponseModal();

  const [summary, setSummary] = useState<FinancesSummary>({
    totalRevenue: 0,
    totalTransactions: 0,
    activeSubscriptionsCount: 0,
    graceSubscriptionsCount: 0,
    expiredSubscriptionsCount: 0,
    packagesCount: 0,
  });

  const [transactions, setTransactions] = useState<StudentSubscriptionItem[]>([]);
  const [classes, setClasses] = useState<SchoolClass[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filters
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'grace' | 'expired'>('all');
  const [classFilter, setClassFilter] = useState<string>('All');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');

  // Fetch available classes
  useEffect(() => {
    async function loadClasses() {
      try {
        const cls = await classService.getClasses();
        setClasses(cls || []);
      } catch (err) {
        console.warn('Failed to load classes for finances filter:', err);
      }
    }
    loadClasses();
  }, []);

  // Fetch finances overview and transactions
  const fetchFinances = async () => {
    try {
      setIsLoading(true);
      const data = await subscriptionService.getFinancesOverview({
        startDate: startDate || undefined,
        endDate: endDate || undefined,
        classLevel: classFilter !== 'All' ? classFilter : undefined,
      });

      if (data) {
        setSummary(data.summary);
        setTransactions(data.transactions || []);
      }
    } catch (err: any) {
      showError('Load Failed', err?.message || 'Unable to fetch financial records.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchFinances();
  }, [startDate, endDate, classFilter]);

  const handleResetFilters = () => {
    setStartDate('');
    setEndDate('');
    setClassFilter('All');
    setStatusFilter('all');
    setSearchTerm('');
  };

  // Filtered transactions
  const filteredTransactions = transactions.filter((t) => {
    const matchesStatus = statusFilter === 'all' || t.status === statusFilter;
    const matchesSearch =
      !searchTerm.trim() ||
      t.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.studentEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.reference.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.packageName.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '—';
    try {
      return new Date(dateStr).toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      });
    } catch {
      return '—';
    }
  };

  return (
    <AdminLayout
      activeNav="Finances"
      breadcrumbs={[{ label: 'Management', href: '/classes' }, { label: 'Finances & Earnings' }]}
    >
      <div className="space-y-6 max-w-6xl">
        {/* Title Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
              Finances & Subscription Earnings
            </h1>
            <p className="text-xs sm:text-sm text-gray-500 mt-1">
              Monitor real-time subscription revenue, student expiration dates, and payment transactions.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <Link
              href="/subscriptions"
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-gray-200 text-gray-700 hover:bg-gray-50 text-xs sm:text-sm font-semibold transition-all shadow-xs"
            >
              <CreditCard className="w-4 h-4 text-[#0D6D62]" />
              <span>Configure Packages</span>
            </Link>

            <button
              onClick={fetchFinances}
              className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#0D6D62] hover:bg-[#0A5A51] text-white text-xs sm:text-sm font-semibold transition-all shadow-xs cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>
          </div>
        </div>

        {/* 4 Summary Stat Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
          {/* Card 1: Total Revenue */}
          <div className="bg-white border border-gray-200/90 rounded-2xl p-4 sm:p-5 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-[11px] sm:text-xs font-medium text-gray-500">Total Revenue</span>
              <div className="w-7 h-7 rounded-lg bg-emerald-50 text-[#0D6D62] flex items-center justify-center">
                <Wallet className="w-4 h-4" />
              </div>
            </div>
            <div className="text-xl sm:text-2xl font-extrabold text-gray-900 mt-2 tracking-tight">
              ₦{summary.totalRevenue.toLocaleString()}
            </div>
            <div className="text-[11px] text-gray-400 mt-1">
              {summary.totalTransactions} paid transactions
            </div>
          </div>

          {/* Card 2: Active Subscriptions */}
          <div className="bg-white border border-gray-200/90 rounded-2xl p-4 sm:p-5 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-[11px] sm:text-xs font-medium text-gray-500">Active Access</span>
              <div className="w-7 h-7 rounded-lg bg-emerald-50 text-[#0D6D62] flex items-center justify-center">
                <CheckCircle2 className="w-4 h-4" />
              </div>
            </div>
            <div className="text-xl sm:text-2xl font-extrabold text-[#0D6D62] mt-2 tracking-tight">
              {summary.activeSubscriptionsCount}
            </div>
            <div className="text-[11px] text-gray-400 mt-1">Full curriculum access</div>
          </div>

          {/* Card 3: In Grace Period */}
          <div className="bg-white border border-gray-200/90 rounded-2xl p-4 sm:p-5 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-[11px] sm:text-xs font-medium text-gray-500">In Grace Period</span>
              <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
                <AlertTriangle className="w-4 h-4" />
              </div>
            </div>
            <div className="text-xl sm:text-2xl font-extrabold text-amber-600 mt-2 tracking-tight">
              {summary.graceSubscriptionsCount}
            </div>
            <div className="text-[11px] text-gray-400 mt-1">7-day renewal window</div>
          </div>

          {/* Card 4: Expired Subscriptions */}
          <div className="bg-white border border-gray-200/90 rounded-2xl p-4 sm:p-5 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-[11px] sm:text-xs font-medium text-gray-500">Expired</span>
              <div className="w-7 h-7 rounded-lg bg-red-50 text-red-600 flex items-center justify-center">
                <XCircle className="w-4 h-4" />
              </div>
            </div>
            <div className="text-xl sm:text-2xl font-extrabold text-red-600 mt-2 tracking-tight">
              {summary.expiredSubscriptionsCount}
            </div>
            <div className="text-[11px] text-gray-400 mt-1">Past expiry & grace</div>
          </div>
        </div>

        {/* Date Range & Dynamic Filters Card */}
        <div className="bg-white border border-gray-200/90 rounded-2xl p-4 sm:p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-[#0D6D62]" />
              <span className="text-xs sm:text-sm font-bold text-gray-800">
                Earnings & Subscription Filters
              </span>
            </div>

            {(startDate || endDate || classFilter !== 'All' || statusFilter !== 'all' || searchTerm) && (
              <button
                onClick={handleResetFilters}
                className="text-xs font-bold text-red-500 hover:text-red-700 cursor-pointer"
              >
                Reset All Filters
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {/* Start Date */}
            <div>
              <label className="block text-[11px] font-bold text-gray-500 mb-1">
                From Date
              </label>
              <div className="relative">
                <Calendar className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full pl-8 pr-3 py-2 rounded-xl border border-gray-200 text-xs focus:outline-none focus:border-[#0D6D62] bg-[#FAFAFA]"
                />
              </div>
            </div>

            {/* End Date */}
            <div>
              <label className="block text-[11px] font-bold text-gray-500 mb-1">
                To Date
              </label>
              <div className="relative">
                <Calendar className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full pl-8 pr-3 py-2 rounded-xl border border-gray-200 text-xs focus:outline-none focus:border-[#0D6D62] bg-[#FAFAFA]"
                />
              </div>
            </div>

            {/* Target Class Filter */}
            <div>
              <label className="block text-[11px] font-bold text-gray-500 mb-1">
                Class Level
              </label>
              <select
                value={classFilter}
                onChange={(e) => setClassFilter(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs focus:outline-none focus:border-[#0D6D62] bg-[#FAFAFA]"
              >
                <option value="All">All Classes</option>
                {classes.map((c) => (
                  <option key={c._id} value={c.name}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Search Input */}
            <div>
              <label className="block text-[11px] font-bold text-gray-500 mb-1">
                Search Student / Ref
              </label>
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Student, email or ref..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-8 pr-3 py-2 rounded-xl border border-gray-200 text-xs focus:outline-none focus:border-[#0D6D62] bg-[#FAFAFA]"
                />
              </div>
            </div>
          </div>

          {/* Status Tabs */}
          <div className="pt-2 border-t border-gray-100 flex items-center gap-2 overflow-x-auto scrollbar-none">
            {[
              { id: 'all', label: 'All Subscriptions' },
              { id: 'active', label: 'Active Access' },
              { id: 'grace', label: 'Grace Period' },
              { id: 'expired', label: 'Expired' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setStatusFilter(tab.id as any)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all shrink-0 cursor-pointer ${
                  statusFilter === tab.id
                    ? 'bg-[#0D6D62] text-white shadow-xs'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Transactions & Expiration Table */}
        <div className="bg-white border border-gray-200/90 rounded-2xl shadow-xs overflow-hidden">
          <div className="p-4 sm:p-5 border-b border-gray-100 flex items-center justify-between">
            <h3 className="font-bold text-gray-900 text-sm sm:text-base">
              Subscription Transactions & Expirations
            </h3>
            <span className="text-xs text-gray-400 font-medium">
              {filteredTransactions.length} records found
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F8FAF9] text-gray-500 font-bold border-b border-gray-100 uppercase tracking-wider">
                <tr>
                  <th className="py-3.5 px-4">Student</th>
                  <th className="py-3.5 px-3">Class</th>
                  <th className="py-3.5 px-3">Package</th>
                  <th className="py-3.5 px-3">Amount</th>
                  <th className="py-3.5 px-3">Status</th>
                  <th className="py-3.5 px-3">Start Date</th>
                  <th className="py-3.5 px-3">Expires At</th>
                  <th className="py-3.5 px-4 text-right">Reference</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100">
                {isLoading ? (
                  <tr>
                    <td colSpan={8} className="py-16 text-center text-gray-400">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <div className="w-6 h-6 border-3 border-[#0D6D62] border-t-transparent rounded-full animate-spin" />
                        <span>Loading transactions...</span>
                      </div>
                    </td>
                  </tr>
                ) : filteredTransactions.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-16 text-center text-gray-400">
                      No subscription transactions or earnings found matching your filter criteria.
                    </td>
                  </tr>
                ) : (
                  filteredTransactions.map((tx) => (
                    <tr key={tx.id} className="hover:bg-[#F9FBFA] transition-colors">
                      {/* Student info */}
                      <td className="py-3.5 px-4 font-bold text-gray-900">
                        <div>{tx.studentName}</div>
                        <div className="text-[11px] text-gray-400 font-normal">{tx.studentEmail}</div>
                      </td>

                      {/* Class */}
                      <td className="py-3.5 px-3 text-gray-600 font-semibold">{tx.classLevel}</td>

                      {/* Package */}
                      <td className="py-3.5 px-3 text-gray-700 font-medium">{tx.packageName}</td>

                      {/* Amount */}
                      <td className="py-3.5 px-3 font-extrabold text-gray-900">
                        ₦{tx.amount.toLocaleString()}
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-3">
                        {tx.status === 'active' ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#D2F4EB] text-[#0E6659]">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#0E6659]" />
                            <span>Active</span>
                          </span>
                        ) : tx.status === 'grace' ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                            <span>Grace Period</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-gray-100 text-gray-600">
                            <span className="w-1.5 h-1.5 rounded-full bg-gray-400" />
                            <span>Expired</span>
                          </span>
                        )}
                      </td>

                      {/* Start Date */}
                      <td className="py-3.5 px-3 text-gray-500">{formatDate(tx.startDate)}</td>

                      {/* Expiration Date */}
                      <td className="py-3.5 px-3 font-semibold text-gray-800">
                        {formatDate(tx.expiresAt)}
                      </td>

                      {/* Reference */}
                      <td className="py-3.5 px-4 text-right text-gray-400 font-mono text-[11px]">
                        {tx.reference}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}

export default function FinancesPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-[#FAFAFA]">
          <div className="w-8 h-8 border-4 border-[#0D6D62] border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <FinancesContent />
    </Suspense>
  );
}
