import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  TrendingUp,
  TrendingDown,
  PiggyBank,
  Briefcase,
  Plus,
  Pencil,
  Trash2,
  Bell,
  Calendar,
  Clock,
  Layers,
  ArrowUpRight,
  ArrowDownRight,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  IndianRupee,
  Receipt,
  ShieldAlert,
} from 'lucide-react';
import AddIncomeModal from './AddIncomeModal';
import EditIncomeModal from './EditIncomeModal';
import { useLanguage } from '../context/LanguageContext';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const formatINR = (value) => {
  const num = Number(value) || 0;
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2,
    minimumFractionDigits: 2,
  }).format(num);
};

const formatDate = (dateString) => {
  if (!dateString) return '-';
  const parts = dateString.split('-');
  if (parts.length === 3) {
    const d = new Date(parts[0], parts[1] - 1, parts[2]);
    return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  }
  return dateString;
};

export default function SegregationView() {
  const { t } = useLanguage();
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState('additional_income');
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);

  const fetchRecords = useCallback(async (isSilent = false) => {
    if (!isSilent) setLoading(true);
    else setRefreshing(true);
    setError(null);

    try {
      const res = await fetch(`${API_BASE_URL}/api/segregation`);
      if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`);
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        // Filter duplicates by unique id or name before saving to state
        const uniqueEntries = Array.from(new Map(json.data.map((item) => [item.id || item.name, item])).values());
        setRecords(uniqueEntries);
      } else {
        setRecords([]);
      }
    } catch (err) {
      console.error('Failed to load segregation records:', err);
      setError('Unable to load segregation records from backend.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchRecords();
  }, [fetchRecords]);

  const openAddModal = (type) => {
    setModalType(type);
    setIsModalOpen(true);
  };

  const handleModalSuccess = (newRecord) => {
    setRecords((prev) => {
      const combined = [newRecord, ...prev];
      // Filter duplicates by unique id or name before saving to state
      return Array.from(new Map(combined.map((item) => [item.id || item.name, item])).values());
    });
    setToastMessage(`"${newRecord.name}" successfully added to ${newRecord.type.replace('_', ' ')}.`);
    setTimeout(() => setToastMessage(null), 4000);
    fetchRecords(true);
  };

  const openEditModal = (item) => {
    setEditingRecord(item);
    setIsEditModalOpen(true);
  };

  const handleEditSuccess = (updatedRecord) => {
    setRecords((prev) => {
      const updated = prev.map((item) =>
        item.id === updatedRecord.id ? updatedRecord : item
      );
      return Array.from(new Map(updated.map((item) => [item.id || item.name, item])).values());
    });
    setToastMessage(`"${updatedRecord.name}" successfully updated.`);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleDelete = async (item) => {
    if (!window.confirm(`Are you sure you want to delete "${item.name}"?`)) return;

    setRecords((prev) => prev.filter((r) => r.id !== item.id));
    setToastMessage(`"${item.name}" successfully removed.`);
    setTimeout(() => setToastMessage(null), 4000);

    try {
      await fetch(`${API_BASE_URL}/api/segregation/${item.id}`, {
        method: 'DELETE',
      });
    } catch (err) {
      console.warn('API error deleting record:', err);
    }
  };

  // Segregated categories
  const additionalIncome = useMemo(() => {
    const items = records.filter((r) => r.type === 'additional_income');
    return Array.from(new Map(items.map((item) => [item.id || item.name, item])).values());
  }, [records]);

  const additionalExpense = useMemo(() => {
    const items = records.filter((r) => r.type === 'additional_expense');
    return Array.from(new Map(items.map((item) => [item.id || item.name, item])).values());
  }, [records]);

  const fixedIncome = useMemo(() => {
    const items = records.filter((r) => r.type === 'fixed_income');
    return Array.from(new Map(items.map((item) => [item.id || item.name, item])).values());
  }, [records]);

  const fixedExpense = useMemo(() => {
    const items = records.filter((r) => r.type === 'fixed_expense');
    return Array.from(new Map(items.map((item) => [item.id || item.name, item])).values());
  }, [records]);

  const bills = useMemo(() => {
    const items = records.filter((r) => r.type === 'bill');
    return Array.from(new Map(items.map((item) => [item.id || item.name, item])).values());
  }, [records]);

  // Financial aggregates
  const totals = useMemo(() => {
    const totalAdditionalIncome = additionalIncome.reduce((s, r) => s + (Number(r.amount) || 0), 0);
    const totalFixedIncome = fixedIncome.reduce((s, r) => s + (Number(r.amount) || 0), 0);
    const totalIncome = totalAdditionalIncome + totalFixedIncome;

    const totalAdditionalExpense = additionalExpense.reduce((s, r) => s + (Number(r.amount) || 0), 0);
    const totalFixedExpense = fixedExpense.reduce((s, r) => s + (Number(r.amount) || 0), 0);
    const totalBills = bills.reduce((s, r) => s + (Number(r.amount) || 0), 0);
    const totalExpenses = totalAdditionalExpense + totalFixedExpense + totalBills;

    const monthlySavings = totalIncome - totalExpenses;
    const netWorth = 0;

    return {
      totalIncome,
      totalExpenses,
      monthlySavings,
      netWorth,
    };
  }, [additionalIncome, fixedIncome, additionalExpense, fixedExpense, bills]);

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 p-4 rounded-xl bg-emerald-950/90 border border-emerald-500/40 text-emerald-200 text-xs shadow-2xl flex items-center space-x-3 backdrop-blur-md animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
          <span className="font-medium">{toastMessage}</span>
        </div>
      )}

      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black tracking-tight text-slate-900 dark:text-slate-100">
            {t('segregation', 'Segregation')}
          </h2>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => fetchRecords(true)}
            disabled={refreshing}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-medium border border-slate-200 dark:border-slate-700 transition active:scale-95 disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin text-emerald-600 dark:text-emerald-400' : ''}`} />
            <span>{t('sync_ledger', 'Sync Ledger')}</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-300 dark:border-rose-800 text-rose-800 dark:text-rose-300 text-xs flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400" />
            <span>{error}</span>
          </div>
          <button
            onClick={() => fetchRecords()}
            className="px-2 py-1 bg-rose-600 rounded text-[11px] font-semibold text-white hover:bg-rose-500 transition"
          >
            Retry
          </button>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 1. TOP OVERVIEW CARDS                                                     */}
      {/* ========================================================================= */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Income */}
        <div className="p-5 rounded-2xl bg-white dark:bg-[#0c1322] border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden group hover:border-emerald-500/40 hover:shadow-md transition">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-semibold tracking-wider uppercase text-slate-500 dark:text-slate-400">{t('total_income', 'Total Income')}</p>
              <h3 className="text-2xl font-black text-slate-900 dark:text-slate-100 mt-1 tracking-tight">
                {formatINR(totals.totalIncome)}
              </h3>
            </div>
            <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/60">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-[11px] text-emerald-600 dark:text-emerald-400">
            <ArrowUpRight className="w-3.5 h-3.5 mr-1" />
            <span>Fixed + Additional inflows combined</span>
          </div>
        </div>

        {/* Total Expenses */}
        <div className="p-5 rounded-2xl bg-white dark:bg-[#0c1322] border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden group hover:border-rose-500/40 hover:shadow-md transition">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-semibold tracking-wider uppercase text-slate-500 dark:text-slate-400">{t('total_expenses', 'Total Expenses')}</p>
              <h3 className="text-2xl font-black text-slate-900 dark:text-slate-100 mt-1 tracking-tight">
                {formatINR(totals.totalExpenses)}
              </h3>
            </div>
            <div className="p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800/60">
              <TrendingDown className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-[11px] text-rose-600 dark:text-rose-400">
            <ArrowDownRight className="w-3.5 h-3.5 mr-1" />
            <span>Total operating & capital outflow</span>
          </div>
        </div>

        {/* Monthly Savings */}
        <div className="p-5 rounded-2xl bg-white dark:bg-[#0c1322] border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden group hover:border-teal-500/40 hover:shadow-md transition">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-semibold tracking-wider uppercase text-slate-500 dark:text-slate-400">{t('monthly_savings', 'Monthly Savings')}</p>
              <h3 className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1 tracking-tight">
                {formatINR(totals.monthlySavings)}
              </h3>
            </div>
            <div className="p-2.5 rounded-xl bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400 border border-teal-200 dark:border-teal-800/60">
              <PiggyBank className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-[11px] text-slate-500 dark:text-slate-400">
            <span className="text-emerald-600 dark:text-emerald-400 font-semibold mr-1">
              {totals.totalIncome > 0
                ? `${((totals.monthlySavings / totals.totalIncome) * 100).toFixed(1)}%`
                : '0%'}
            </span>
            <span>net retention rate</span>
          </div>
        </div>

        {/* Net Worth */}
        <div className="p-5 rounded-2xl bg-white dark:bg-[#0c1322] border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden group hover:border-cyan-500/40 hover:shadow-md transition">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-semibold tracking-wider uppercase text-slate-500 dark:text-slate-400">{t('net_worth', 'Net Worth')}</p>
              <h3 className="text-2xl font-black text-cyan-600 dark:text-cyan-400 mt-1 tracking-tight">
                {formatINR(totals.netWorth)}
              </h3>
            </div>
            <div className="p-2.5 rounded-xl bg-cyan-50 dark:bg-cyan-950/60 text-cyan-600 dark:text-cyan-400 border border-cyan-200 dark:border-cyan-800/60">
              <Briefcase className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-[11px] text-slate-500 dark:text-slate-400">
            <span className="text-cyan-600 dark:text-cyan-400 font-semibold mr-1">Verified</span>
            <span>corporate asset standing</span>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 2. ADDITIONAL SOURCE SECTION (Side-by-side tables)                         */}
      {/* ========================================================================= */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
              {t('additional_source', 'Additional Source')}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">Unscheduled or variable income bonuses and project expenses</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Table: Additional Income */}
          <div className="rounded-2xl bg-white dark:bg-[#0c1322] border border-slate-200 dark:border-slate-800 p-5 shadow-sm flex flex-col">
            <div className="flex items-center justify-between pb-3.5 border-b border-slate-200 dark:border-slate-800 mb-3">
              <div className="flex items-center space-x-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wide">
                  {t('additional_income', 'Additional Income')}
                </h4>
                <span className="text-[11px] font-mono text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-800/60 font-semibold">
                  {additionalIncome.length} entries
                </span>
              </div>
              <button
                onClick={() => openAddModal('additional_income')}
                className="flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition shadow-sm active:scale-95 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5 stroke-[3]" />
                <span>{t('add', 'Add')}</span>
              </button>
            </div>

            <div className="overflow-x-auto w-full flex-1">
              <table className="w-full text-left text-xs min-w-[520px]">
                <thead>
                  <tr className="text-[11px] uppercase tracking-wider text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800">
                    <th className="py-2.5 px-2 font-semibold">{t('name', 'Name')}</th>
                    <th className="py-2.5 px-2 font-semibold">{t('description', 'Description')}</th>
                    <th className="py-2.5 px-2 font-semibold">{t('date', 'Date')}</th>
                    <th className="py-2.5 px-2 font-semibold">{t('time', 'Time')}</th>
                    <th className="py-2.5 px-2 font-semibold text-right">{t('amount', 'Amount')}</th>
                    <th className="py-2.5 px-2 font-semibold text-right">{t('actions', 'Actions')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium">
                  {additionalIncome.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-slate-400 dark:text-slate-500 text-xs">
                        No additional income entries recorded. Click + Add to record one.
                      </td>
                    </tr>
                  ) : (
                    additionalIncome.map((item) => (
                      <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition">
                        <td className="py-3 px-2 font-semibold text-slate-900 dark:text-slate-100 whitespace-nowrap">{item.name}</td>
                        <td className="py-3 px-2 text-slate-500 dark:text-slate-400 max-w-[160px] truncate" title={item.description}>
                          {item.description || '-'}
                        </td>
                        <td className="py-3 px-2 text-slate-500 dark:text-slate-400 whitespace-nowrap">{formatDate(item.date)}</td>
                        <td className="py-3 px-2 text-slate-500 dark:text-slate-400 font-mono whitespace-nowrap">{item.time || '-'}</td>
                        <td className="py-3 px-2 text-right font-mono font-bold text-emerald-600 dark:text-emerald-400 whitespace-nowrap">
                          {formatINR(item.amount)}
                        </td>
                        <td className="py-3 px-2 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end space-x-1">
                            <button
                              onClick={() => openEditModal(item)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/50 transition cursor-pointer"
                              title={t('edit', 'Edit')}
                            >
                              <Pencil className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDelete(item)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition cursor-pointer"
                              title={t('delete', 'Delete')}
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Table: Additional Expense */}
          <div className="rounded-2xl bg-white dark:bg-[#0c1322] border border-slate-200 dark:border-slate-800 p-5 shadow-sm flex flex-col">
            <div className="flex items-center justify-between pb-3.5 border-b border-slate-200 dark:border-slate-800 mb-3">
              <div className="flex items-center space-x-2">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wide">
                  {t('additional_expense', 'Additional Expense')}
                </h4>
                <span className="text-[11px] font-mono text-rose-700 dark:text-rose-300 bg-rose-50 dark:bg-rose-950/60 px-2 py-0.5 rounded border border-rose-200 dark:border-rose-800/60 font-semibold">
                  {additionalExpense.length} entries
                </span>
              </div>
              <button
                onClick={() => openAddModal('additional_expense')}
                className="flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs transition shadow-sm active:scale-95 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5 stroke-[3]" />
                <span>{t('add', 'Add')}</span>
              </button>
            </div>

            <div className="overflow-x-auto w-full flex-1">
              <table className="w-full text-left text-xs min-w-[520px]">
                <thead>
                  <tr className="text-[11px] uppercase tracking-wider text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800">
                    <th className="py-2.5 px-2 font-semibold">{t('name', 'Name')}</th>
                    <th className="py-2.5 px-2 font-semibold">{t('description', 'Description')}</th>
                    <th className="py-2.5 px-2 font-semibold">{t('date', 'Date')}</th>
                    <th className="py-2.5 px-2 font-semibold">{t('time', 'Time')}</th>
                    <th className="py-2.5 px-2 font-semibold text-right">{t('amount', 'Amount')}</th>
                    <th className="py-2.5 px-2 font-semibold text-right">{t('actions', 'Actions')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium">
                  {additionalExpense.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-slate-400 dark:text-slate-500 text-xs">
                        No additional expense entries recorded. Click + Add to record one.
                      </td>
                    </tr>
                  ) : (
                    additionalExpense.map((item) => (
                      <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition">
                        <td className="py-3 px-2 font-semibold text-slate-900 dark:text-slate-100 whitespace-nowrap">{item.name}</td>
                        <td className="py-3 px-2 text-slate-500 dark:text-slate-400 max-w-[160px] truncate" title={item.description}>
                          {item.description || '-'}
                        </td>
                        <td className="py-3 px-2 text-slate-500 dark:text-slate-400 whitespace-nowrap">{formatDate(item.date)}</td>
                        <td className="py-3 px-2 text-slate-500 dark:text-slate-400 font-mono whitespace-nowrap">{item.time || '-'}</td>
                        <td className="py-3 px-2 text-right font-mono font-bold text-rose-600 dark:text-rose-400 whitespace-nowrap">
                          {formatINR(item.amount)}
                        </td>
                        <td className="py-3 px-2 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end space-x-1">
                            <button
                              onClick={() => openEditModal(item)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/50 transition cursor-pointer"
                              title={t('edit', 'Edit')}
                            >
                              <Pencil className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDelete(item)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition cursor-pointer"
                              title={t('delete', 'Delete')}
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 4. FIXED SOURCE SECTION (Side-by-side tables)                             */}
      {/* ========================================================================= */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
              {t('fixed_source', 'Fixed Source')}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">Scheduled retainers, office rent, infrastructure, and core payroll</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Table: Fixed Income */}
          <div className="rounded-2xl bg-white dark:bg-[#0c1322] border border-slate-200 dark:border-slate-800 p-5 shadow-sm flex flex-col">
            <div className="flex items-center justify-between pb-3.5 border-b border-slate-200 dark:border-slate-800 mb-3">
              <div className="flex items-center space-x-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wide">
                  {t('fixed_income', 'Fixed Income')}
                </h4>
                <span className="text-[11px] font-mono text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-800/60 font-semibold">
                  {fixedIncome.length} entries
                </span>
              </div>
              <button
                onClick={() => openAddModal('fixed_income')}
                className="flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition shadow-sm active:scale-95 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5 stroke-[3]" />
                <span>{t('add', 'Add')}</span>
              </button>
            </div>

            <div className="overflow-x-auto w-full flex-1">
              <table className="w-full text-left text-xs min-w-[520px]">
                <thead>
                  <tr className="text-[11px] uppercase tracking-wider text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800">
                    <th className="py-2.5 px-2 font-semibold">{t('name', 'Name')}</th>
                    <th className="py-2.5 px-2 font-semibold">{t('description', 'Description')}</th>
                    <th className="py-2.5 px-2 font-semibold">{t('date', 'Date')}</th>
                    <th className="py-2.5 px-2 font-semibold">{t('time', 'Time')}</th>
                    <th className="py-2.5 px-2 font-semibold">{t('schedule', 'Schedule')}</th>
                    <th className="py-2.5 px-2 font-semibold text-right">{t('actions', 'Actions')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium">
                  {fixedIncome.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-slate-400 dark:text-slate-500 text-xs">
                        No fixed income entries recorded. Click + Add to record one.
                      </td>
                    </tr>
                  ) : (
                    fixedIncome.map((item) => (
                      <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition">
                        <td className="py-3 px-2 font-semibold text-slate-900 dark:text-slate-100 whitespace-nowrap">
                          <div>{item.name}</div>
                          <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-mono font-bold">{formatINR(item.amount)}</span>
                        </td>
                        <td className="py-3 px-2 text-slate-500 dark:text-slate-400 max-w-[150px] truncate" title={item.description}>
                          {item.description || '-'}
                        </td>
                        <td className="py-3 px-2 text-slate-500 dark:text-slate-400 whitespace-nowrap">{formatDate(item.date)}</td>
                        <td className="py-3 px-2 text-slate-500 dark:text-slate-400 font-mono whitespace-nowrap">{item.time || '-'}</td>
                        <td className="py-3 px-2 whitespace-nowrap">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800/60">
                            {item.schedule || 'Monthly'}
                          </span>
                        </td>
                        <td className="py-3 px-2 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end space-x-1">
                            <button
                              onClick={() => openEditModal(item)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/50 transition cursor-pointer"
                              title={t('edit', 'Edit')}
                            >
                              <Pencil className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDelete(item)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition cursor-pointer"
                              title={t('delete', 'Delete')}
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Table: Fixed Expense */}
          <div className="rounded-2xl bg-white dark:bg-[#0c1322] border border-slate-200 dark:border-slate-800 p-5 shadow-sm flex flex-col">
            <div className="flex items-center justify-between pb-3.5 border-b border-slate-200 dark:border-slate-800 mb-3">
              <div className="flex items-center space-x-2">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wide">
                  {t('fixed_expense', 'Fixed Expense')}
                </h4>
                <span className="text-[11px] font-mono text-rose-700 dark:text-rose-300 bg-rose-50 dark:bg-rose-950/60 px-2 py-0.5 rounded border border-rose-200 dark:border-rose-800/60 font-semibold">
                  {fixedExpense.length} entries
                </span>
              </div>
              <button
                onClick={() => openAddModal('fixed_expense')}
                className="flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs transition shadow-sm active:scale-95 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5 stroke-[3]" />
                <span>{t('add', 'Add')}</span>
              </button>
            </div>

            <div className="overflow-x-auto w-full flex-1">
              <table className="w-full text-left text-xs min-w-[520px]">
                <thead>
                  <tr className="text-[11px] uppercase tracking-wider text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800">
                    <th className="py-2.5 px-2 font-semibold">{t('name', 'Name')}</th>
                    <th className="py-2.5 px-2 font-semibold">{t('description', 'Description')}</th>
                    <th className="py-2.5 px-2 font-semibold">{t('date', 'Date')}</th>
                    <th className="py-2.5 px-2 font-semibold">{t('time', 'Time')}</th>
                    <th className="py-2.5 px-2 font-semibold">{t('schedule', 'Schedule')}</th>
                    <th className="py-2.5 px-2 font-semibold text-right">{t('actions', 'Actions')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium">
                  {fixedExpense.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-slate-400 dark:text-slate-500 text-xs">
                        No fixed expense entries recorded. Click + Add to record one.
                      </td>
                    </tr>
                  ) : (
                    fixedExpense.map((item) => (
                      <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition">
                        <td className="py-3 px-2 font-semibold text-slate-900 dark:text-slate-100 whitespace-nowrap">
                          <div>{item.name}</div>
                          <span className="text-[10px] text-rose-600 dark:text-rose-400 font-mono font-bold">{formatINR(item.amount)}</span>
                        </td>
                        <td className="py-3 px-2 text-slate-500 dark:text-slate-400 max-w-[150px] truncate" title={item.description}>
                          {item.description || '-'}
                        </td>
                        <td className="py-3 px-2 text-slate-500 dark:text-slate-400 whitespace-nowrap">{formatDate(item.date)}</td>
                        <td className="py-3 px-2 text-slate-500 dark:text-slate-400 font-mono whitespace-nowrap">{item.time || '-'}</td>
                        <td className="py-3 px-2 whitespace-nowrap">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-rose-50 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300 border border-rose-300 dark:border-rose-800/60">
                            {item.schedule || 'Monthly'}
                          </span>
                        </td>
                        <td className="py-3 px-2 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end space-x-1">
                            <button
                              onClick={() => openEditModal(item)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/50 transition cursor-pointer"
                              title={t('edit', 'Edit')}
                            >
                              <Pencil className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDelete(item)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition cursor-pointer"
                              title={t('delete', 'Delete')}
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      {/* Add Entry Modal */}
      <AddIncomeModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        defaultType={modalType}
        onSuccess={handleModalSuccess}
      />

      {/* Edit Entry Modal */}
      <EditIncomeModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setEditingRecord(null);
        }}
        entry={editingRecord}
        onSuccess={handleEditSuccess}
      />
    </div>
  );
}
