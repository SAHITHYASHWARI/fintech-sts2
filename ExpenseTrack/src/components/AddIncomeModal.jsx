import React, { useState, useEffect } from 'react';
import { X, IndianRupee, Calendar, Clock, Tag, Wallet, FileText, CheckCircle2, AlertCircle, Sparkles } from 'lucide-react';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const CATEGORY_OPTIONS = [
  'Consulting',
  'Retainer',
  'Software Subscription',
  'Investment & Yield',
  'Infrastructure & Cloud',
  'Office Rent',
  'Payroll & Salaries',
  'Utilities & Bills',
  'Operations & Travel',
  'Legal & Compliance',
  'General',
];

const WALLET_OPTIONS = [
  'HDFC Corporate Account',
  'ICICI Business Banking',
  'Razorpay Escrow Gateway',
  'Zerodha Investment Pool',
  'Petty Cash Reserve',
];

const SCHEDULE_OPTIONS = [
  'One-time',
  'Monthly (1st)',
  'Monthly (15th)',
  'Bi-weekly',
  'Quarterly',
  'Annually',
];

export default function AddIncomeModal({ isOpen, onClose, defaultType, onSuccess }) {
  const [type, setType] = useState(defaultType || 'additional_income');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [time, setTime] = useState(() => {
    const now = new Date();
    return `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
  });
  const [schedule, setSchedule] = useState('One-time');
  const [category, setCategory] = useState('General');
  const [associatedWallet, setAssociatedWallet] = useState('HDFC Corporate Account');
  const [amount, setAmount] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (defaultType) {
      setType(defaultType);
      if (defaultType.startsWith('fixed_')) {
        setSchedule('Monthly (1st)');
      } else if (defaultType === 'bill') {
        setSchedule('Monthly (1st)');
      } else {
        setSchedule('One-time');
      }
    }
    setError(null);
  }, [defaultType, isOpen]);

  if (!isOpen) return null;

  const isIncome = type.includes('income');
  const isBill = type === 'bill';
  const isFixed = type.startsWith('fixed_') || isBill;

  const modalTitle = isIncome
    ? type === 'fixed_income'
      ? 'Add Fixed Income'
      : 'Add Additional Income'
    : isBill
    ? 'Add Bill / Recurring Reminder'
    : type === 'fixed_expense'
    ? 'Add Fixed Expense'
    : 'Add Additional Expense';

  const buttonText = isIncome ? 'Save Income' : isBill ? 'Save Bill Reminder' : 'Save Expense';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError('Please provide a valid entry name.');
      return;
    }

    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount < 0) {
      setError('Please specify a valid numeric amount in ₹ INR.');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        type,
        name: name.trim(),
        description: description.trim(),
        date,
        time,
        schedule: isFixed ? schedule : 'One-time',
        category,
        associated_wallet: associatedWallet,
        amount: numAmount,
      };

      const res = await fetch(`${API_BASE_URL}/api/segregation`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || (data.errors && data.errors.join(', ')) || 'Failed to persist record');
      }

      onSuccess(data.data);
      onClose();
    } catch (err) {
      console.error('AddIncomeModal submission error:', err);
      setError(err.message || 'Error occurred while saving record.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn">
      <div
        className="relative w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto rounded-2xl bg-[#0f172a] border border-slate-700/80 shadow-2xl p-5 sm:p-7 text-slate-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Glow Accent */}
        <div
          className={`absolute top-0 right-0 w-48 h-48 rounded-full blur-3xl pointer-events-none -z-10 ${
            isIncome ? 'bg-emerald-500/15' : 'bg-rose-500/10'
          }`}
        />

        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center space-x-3">
            <div
              className={`p-2.5 rounded-xl border ${
                isIncome
                  ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400'
                  : 'bg-rose-500/15 border-rose-500/30 text-rose-400'
              }`}
            >
              <IndianRupee className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white flex items-center space-x-2">
                <span>{modalTitle}</span>
              </h3>
              <p className="text-xs text-slate-400">STS FINTECH • Segregation Record Entry</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Error notification */}
        {error && (
          <div className="mt-4 p-3 rounded-xl bg-rose-950/60 border border-rose-500/40 text-rose-300 text-xs flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-400" />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          {/* Record Name */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              {isIncome ? 'Income Source Name' : 'Expense / Payment Name'} *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={isIncome ? 'e.g. Enterprise Client SLA, Advisory' : 'e.g. AWS Cloud GPU, Office Maintenance'}
              className="w-full bg-[#090d16] border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Description / Notes
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Provide context, invoice reference, or ledger remarks..."
              className="w-full bg-[#090d16] border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition resize-none"
            />
          </div>

          {/* Date and Time Row */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5 flex items-center">
                <Calendar className="w-3.5 h-3.5 mr-1 text-slate-400" /> Date
              </label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full bg-[#090d16] border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5 flex items-center">
                <Clock className="w-3.5 h-3.5 mr-1 text-slate-400" /> Time
              </label>
              <input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full bg-[#090d16] border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition"
              />
            </div>
          </div>

          {/* Category & Associated Wallet Row */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5 flex items-center">
                <Tag className="w-3.5 h-3.5 mr-1 text-slate-400" /> Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-[#090d16] border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition"
              >
                {CATEGORY_OPTIONS.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5 flex items-center">
                <Wallet className="w-3.5 h-3.5 mr-1 text-slate-400" /> Associated Wallet
              </label>
              <select
                value={associatedWallet}
                onChange={(e) => setAssociatedWallet(e.target.value)}
                className="w-full bg-[#090d16] border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition"
              >
                {WALLET_OPTIONS.map((w) => (
                  <option key={w} value={w}>
                    {w}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Amount & Schedule */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5 flex items-center">
                <IndianRupee className="w-3.5 h-3.5 mr-1 text-slate-400" /> Amount in INR (₹) *
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400 text-sm font-bold">
                  ₹
                </span>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  required
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  className="w-full bg-[#090d16] border border-slate-700 rounded-xl pl-8 pr-3 py-2 text-sm font-semibold font-mono text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5 flex items-center">
                <Clock className="w-3.5 h-3.5 mr-1 text-slate-400" /> Schedule / Frequency
              </label>
              <select
                value={schedule}
                onChange={(e) => setSchedule(e.target.value)}
                className="w-full bg-[#090d16] border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition"
              >
                {SCHEDULE_OPTIONS.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Submit Actions */}
          <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-700 text-slate-300 hover:text-white hover:bg-slate-800 text-xs font-medium transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className={`px-5 py-2.5 rounded-xl text-xs font-bold transition shadow-lg flex items-center space-x-2 ${
                isIncome
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 shadow-emerald-500/20'
                  : 'bg-gradient-to-r from-rose-500 to-red-500 hover:from-rose-400 hover:to-red-400 text-white shadow-rose-500/20'
              } disabled:opacity-50`}
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{loading ? 'Saving...' : buttonText}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
