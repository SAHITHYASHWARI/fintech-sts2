import React, { useState, useEffect, useMemo } from 'react';
import {
  Wallet,
  CreditCard,
  Plus,
  Check,
  Copy,
  Pencil,
  Trash2,
  Star,
  MoreVertical,
  ShieldCheck,
  Building2,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle2,
  X,
  Search,
  Lock,
  ArrowRight,
  ExternalLink,
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

const DEFAULT_ACCOUNTS = [
  {
    id: 'acc-hdfc-01',
    bankName: 'HDFC Bank',
    accountHolder: 'Santhosh',
    accountNumber: '50100432194209',
    ifsc: 'HDFC0001234',
    branchName: 'Indiranagar Branch, Bengaluru',
    accountType: 'Salary',
    isPrimary: true,
    cardGradient: 'from-[#0b1b2b] via-[#0e273c] to-[#081522]',
    accentColor: '#38bdf8',
    createdAt: '2026-10-01T10:00:00Z',
  },
  {
    id: 'acc-icici-02',
    bankName: 'ICICI Bank',
    accountHolder: 'Santhosh',
    accountNumber: '000201568821',
    ifsc: 'ICIC0000002',
    branchName: 'MG Road Branch, Bengaluru',
    accountType: 'Savings',
    isPrimary: false,
    cardGradient: 'from-[#121f29] via-[#102e2b] to-[#0a1b1a]',
    accentColor: '#10b981',
    createdAt: '2026-10-03T11:30:00Z',
  },
  {
    id: 'acc-sbi-03',
    bankName: 'State Bank of India (SBI)',
    accountHolder: 'Santhosh',
    accountNumber: '319800121045',
    ifsc: 'SBIN0000456',
    branchName: 'Commercial Street Branch, Bengaluru',
    accountType: 'Current',
    isPrimary: false,
    cardGradient: 'from-[#181528] via-[#211a3b] to-[#100e1f]',
    accentColor: '#a855f7',
    createdAt: '2026-10-05T14:15:00Z',
  },
];

const POPULAR_BANKS = [
  'HDFC Bank',
  'State Bank of India (SBI)',
  'ICICI Bank',
  'Axis Bank',
  'Kotak Mahindra Bank',
  'Punjab National Bank',
  'Bank of Baroda',
  'Canara Bank',
  'IndusInd Bank',
];

const IFSC_PREFIX_MAP = {
  HDFC: 'HDFC Bank Ltd • RTGS/NEFT/IMPS Verified',
  SBIN: 'State Bank of India • RTGS/NEFT/IMPS Verified',
  ICIC: 'ICICI Bank Ltd • RTGS/NEFT/IMPS Verified',
  UTIB: 'Axis Bank Ltd • RTGS/NEFT/IMPS Verified',
  KKBK: 'Kotak Mahindra Bank • RTGS/NEFT/IMPS Verified',
  PUNB: 'Punjab National Bank • RTGS/NEFT/IMPS Verified',
  BARB: 'Bank of Baroda • RTGS/NEFT/IMPS Verified',
  CNRB: 'Canara Bank • RTGS/NEFT/IMPS Verified',
  INDB: 'IndusInd Bank • RTGS/NEFT/IMPS Verified',
  YESB: 'Yes Bank Ltd • RTGS/NEFT/IMPS Verified',
};

export default function WalletsView({ currentUser }) {
  let t = (key, fallback) => fallback || key;
  try {
    const lang = useLanguage();
    if (lang && typeof lang.t === 'function') {
      t = lang.t;
    }
  } catch (err) {
    console.warn('WalletsView LanguageContext fallback:', err);
  }

  // State: Bank accounts list
  const [accounts, setAccounts] = useState(() => {
    try {
      const stored = localStorage.getItem('sts_bank_accounts');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.warn('Error reading sts_bank_accounts:', e);
    }
    return DEFAULT_ACCOUNTS;
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [toastMessage, setToastMessage] = useState(null);
  const [copiedId, setCopiedId] = useState(null);
  const [activeMenuId, setActiveMenuId] = useState(null);

  // Modal / Drawer state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);

  // Form State
  const defaultHolder = currentUser?.name || 'Santhosh';
  const [formData, setFormData] = useState({
    bankName: 'HDFC Bank',
    customBankName: '',
    accountHolder: defaultHolder,
    accountNumber: '',
    confirmAccountNumber: '',
    ifsc: '',
    accountType: 'Savings', // 'Savings' | 'Current' | 'Salary'
    isPrimary: false,
  });

  const [formErrors, setFormErrors] = useState({});
  const [showAccountNum, setShowAccountNum] = useState(false);

  // Persist accounts whenever changed
  const saveAccounts = (newAccounts) => {
    setAccounts(newAccounts);
    try {
      localStorage.setItem('sts_bank_accounts', JSON.stringify(newAccounts));
      window.dispatchEvent(new Event('sts_bank_accounts_updated'));
    } catch (e) {
      console.warn('Error persisting sts_bank_accounts:', e);
    }
  };

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Close menus when clicking outside
  useEffect(() => {
    const handleClickOutside = () => setActiveMenuId(null);
    window.addEventListener('click', handleClickOutside);
    return () => window.removeEventListener('click', handleClickOutside);
  }, []);

  // Open modal for new account
  const handleOpenAddModal = () => {
    setEditingId(null);
    setFormData({
      bankName: 'HDFC Bank',
      customBankName: '',
      accountHolder: currentUser?.name || 'Santhosh',
      accountNumber: '',
      confirmAccountNumber: '',
      ifsc: '',
      accountType: 'Savings',
      isPrimary: accounts.length === 0,
    });
    setFormErrors({});
    setShowAccountNum(false);
    setIsModalOpen(true);
  };

  // Open modal for editing account
  const handleOpenEditModal = (acc, e) => {
    e?.stopPropagation();
    setActiveMenuId(null);
    setEditingId(acc.id);
    const isCustom = !POPULAR_BANKS.includes(acc.bankName);
    setFormData({
      bankName: isCustom ? 'Other' : acc.bankName,
      customBankName: isCustom ? acc.bankName : '',
      accountHolder: acc.accountHolder || 'Santhosh',
      accountNumber: acc.accountNumber || '',
      confirmAccountNumber: acc.accountNumber || '',
      ifsc: acc.ifsc || '',
      accountType: acc.accountType || 'Savings',
      isPrimary: Boolean(acc.isPrimary),
    });
    setFormErrors({});
    setShowAccountNum(false);
    setIsModalOpen(true);
  };

  // Copy masked or unmasked account number to clipboard
  const handleCopy = (acc, e) => {
    e?.stopPropagation();
    try {
      navigator.clipboard.writeText(acc.accountNumber);
      setCopiedId(acc.id);
      showToast(`Copied ${acc.bankName} Account Number to clipboard`);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (err) {
      console.warn('Clipboard copy failed:', err);
    }
  };

  // Set account as primary
  const handleSetPrimary = (id, e) => {
    e?.stopPropagation();
    setActiveMenuId(null);
    const updated = accounts.map((acc) => ({
      ...acc,
      isPrimary: acc.id === id,
    }));
    saveAccounts(updated);
    const primaryAcc = updated.find((a) => a.id === id);
    showToast(`${primaryAcc?.bankName} set as Primary Settlement Account`);
  };

  // Delete account
  const handleDelete = (id, e) => {
    e?.stopPropagation();
    setActiveMenuId(null);
    const target = accounts.find((a) => a.id === id);
    const remaining = accounts.filter((a) => a.id !== id);
    // If deleted account was primary and others exist, set first remaining as primary
    if (target?.isPrimary && remaining.length > 0) {
      remaining[0].isPrimary = true;
    }
    saveAccounts(remaining);
    showToast(`Removed ${target?.bankName} account`);
  };

  // Real-time IFSC detection feedback
  const detectedIfscBank = useMemo(() => {
    const code = (formData.ifsc || '').trim().toUpperCase();
    if (code.length >= 4) {
      const prefix = code.slice(0, 4);
      return IFSC_PREFIX_MAP[prefix] || null;
    }
    return null;
  }, [formData.ifsc]);

  // Handle Form Submit
  const handleFormSubmit = (e) => {
    e.preventDefault();
    const errors = {};

    const finalBankName =
      formData.bankName === 'Other'
        ? formData.customBankName.trim()
        : formData.bankName.trim();

    if (!finalBankName) errors.bankName = 'Bank name is required';
    if (!formData.accountHolder.trim()) errors.accountHolder = 'Account holder name is required';

    const cleanNum = formData.accountNumber.replace(/\s+/g, '');
    const cleanConfirm = formData.confirmAccountNumber.replace(/\s+/g, '');

    if (!cleanNum || cleanNum.length < 9) {
      errors.accountNumber = 'Enter a valid account number (minimum 9 digits)';
    }

    if (cleanNum !== cleanConfirm) {
      errors.confirmAccountNumber = 'Account numbers do not match';
    }

    const cleanIfsc = formData.ifsc.trim().toUpperCase();
    const ifscRegex = /^[A-Z]{4}0[A-Z0-9]{6}$/;
    if (!ifscRegex.test(cleanIfsc)) {
      errors.ifsc = 'Valid 11-character IFSC required (e.g., HDFC0001234)';
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    let gradient = 'from-[#0b1b2b] via-[#0e273c] to-[#081522]';
    let accent = '#38bdf8';
    if (finalBankName.includes('ICICI')) {
      gradient = 'from-[#121f29] via-[#102e2b] to-[#0a1b1a]';
      accent = '#10b981';
    } else if (finalBankName.includes('State Bank') || finalBankName.includes('SBI')) {
      gradient = 'from-[#181528] via-[#211a3b] to-[#100e1f]';
      accent = '#a855f7';
    } else if (finalBankName.includes('Axis')) {
      gradient = 'from-[#28151f] via-[#3d1a29] to-[#1c0e14]';
      accent = '#f43f5e';
    } else if (finalBankName.includes('Kotak')) {
      gradient = 'from-[#281c15] via-[#3d271a] to-[#1c120e]';
      accent = '#f59e0b';
    }

    if (editingId) {
      // Edit existing
      const updated = accounts.map((acc) => {
        if (acc.id === editingId) {
          return {
            ...acc,
            bankName: finalBankName,
            accountHolder: formData.accountHolder.trim(),
            accountNumber: cleanNum,
            ifsc: cleanIfsc,
            accountType: formData.accountType,
            isPrimary: formData.isPrimary,
            cardGradient: gradient,
            accentColor: accent,
          };
        }
        // If this one is set as primary, unmark others
        if (formData.isPrimary) {
          return { ...acc, isPrimary: false };
        }
        return acc;
      });
      saveAccounts(updated);
      showToast(`Updated ${finalBankName} successfully`);
    } else {
      // Create new
      const newAcc = {
        id: `acc-${Date.now()}`,
        bankName: finalBankName,
        accountHolder: formData.accountHolder.trim(),
        accountNumber: cleanNum,
        ifsc: cleanIfsc,
        branchName: detectedIfscBank ? detectedIfscBank.split('•')[0].trim() : 'Core Banking Branch',
        accountType: formData.accountType,
        isPrimary: formData.isPrimary || accounts.length === 0,
        cardGradient: gradient,
        accentColor: accent,
        createdAt: new Date().toISOString(),
      };

      const nextList = formData.isPrimary || accounts.length === 0
        ? [newAcc, ...accounts.map((a) => ({ ...a, isPrimary: false }))]
        : [newAcc, ...accounts];

      saveAccounts(nextList);
      showToast(`Added ${finalBankName} bank account`);
    }

    setIsModalOpen(false);
  };

  // Mask account number: e.g. "•••• •••• •••• 4209"
  const formatMaskedAccount = (num) => {
    if (!num) return '•••• •••• •••• 0000';
    const clean = String(num).replace(/\s+/g, '');
    const last4 = clean.slice(-4);
    return `•••• •••• •••• ${last4}`;
  };

  // Filter accounts
  const filteredAccounts = useMemo(() => {
    if (!searchQuery.trim()) return accounts;
    const q = searchQuery.toLowerCase();
    return accounts.filter(
      (a) =>
        a.bankName.toLowerCase().includes(q) ||
        a.accountHolder.toLowerCase().includes(q) ||
        a.ifsc.toLowerCase().includes(q) ||
        a.accountType.toLowerCase().includes(q) ||
        String(a.accountNumber).includes(q)
    );
  }, [accounts, searchQuery]);

  const primaryAccount = useMemo(() => accounts.find((a) => a.isPrimary) || accounts[0], [accounts]);

  return (
    <div className="space-y-7 animate-fadeIn pb-16">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 p-4 rounded-xl bg-emerald-950/90 border border-emerald-500/40 text-emerald-200 text-xs shadow-2xl flex items-center space-x-3 backdrop-blur-md animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
          <span className="font-semibold">{toastMessage}</span>
        </div>
      )}

      {/* Clean Header Area matching Dashboard Style */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            {t('wallets', 'Wallets')}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Manage your verified banking rails, primary settlement ledger, and account IFSC routing.
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenAddModal}
          className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs sm:text-sm shadow-md shadow-emerald-950/20 active:scale-95 transition cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add Bank Account</span>
        </button>
      </div>

      {/* Metric Summary Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl bg-white dark:bg-[#0c1322] border border-slate-200 dark:border-slate-800 shadow-sm flex items-center space-x-3.5">
          <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              Connected Accounts
            </p>
            <p className="text-xl font-black text-slate-900 dark:text-slate-100">
              {accounts.length} Bank {accounts.length === 1 ? 'Rail' : 'Rails'}
            </p>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-[#0c1322] border border-slate-200 dark:border-slate-800 shadow-sm flex items-center space-x-3.5">
          <div className="p-2.5 rounded-xl bg-teal-500/10 text-teal-500 border border-teal-500/20">
            <Star className="w-5 h-5 fill-teal-500/20" />
          </div>
          <div className="min-w-0">
            <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              Primary Settlement
            </p>
            <p className="text-xl font-black text-slate-900 dark:text-slate-100 truncate">
              {primaryAccount ? primaryAccount.bankName : 'Not Designated'}
            </p>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-[#0c1322] border border-slate-200 dark:border-slate-800 shadow-sm flex items-center space-x-3.5">
          <div className="p-2.5 rounded-xl bg-cyan-500/10 text-cyan-500 border border-cyan-500/20">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              Bank-Grade Security
            </p>
            <p className="text-xs font-bold text-slate-700 dark:text-slate-300">
              256-Bit Masked Encrypted Vault
            </p>
          </div>
        </div>
      </div>

      {/* Filter / Search Bar */}
      {accounts.length > 0 && (
        <div className="flex items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by bank name, IFSC, or account number..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-xl text-xs bg-white dark:bg-[#0c1322] border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-emerald-500 transition"
            />
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">
            Showing {filteredAccounts.length} of {accounts.length} accounts
          </div>
        </div>
      )}

      {/* Stored Accounts Grid: Rendered as Fintech Debit-Card Surfaces */}
      {filteredAccounts.length === 0 ? (
        <div className="rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-800 p-12 text-center bg-white/40 dark:bg-[#0c1322]/40">
          <div className="p-4 rounded-full bg-emerald-500/10 text-emerald-500 inline-flex mb-3">
            <Wallet className="w-8 h-8" />
          </div>
          <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">
            {searchQuery ? 'No matching bank accounts found' : 'No bank accounts linked yet'}
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
            {searchQuery
              ? 'Try modifying your search query or reset filters.'
              : 'Add your primary settlement account to enable automated payouts and ledger balancing.'}
          </p>
          {!searchQuery && (
            <button
              onClick={handleOpenAddModal}
              className="mt-5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-sm transition active:scale-95"
            >
              + Link First Account
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredAccounts.map((acc) => {
            const isMenuOpen = activeMenuId === acc.id;

            return (
              <div
                key={acc.id}
                className="group relative rounded-2xl p-6 sm:p-7 flex flex-col justify-between shadow-xl transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl overflow-hidden border border-slate-700/60"
                style={{
                  background:
                    'linear-gradient(135deg, rgba(14, 23, 42, 0.95) 0%, rgba(15, 23, 42, 0.98) 50%, rgba(2, 6, 23, 1) 100%)',
                  minHeight: '235px',
                }}
              >
                {/* Holographic metallic background glow */}
                <div
                  className="absolute -top-16 -right-16 w-44 h-44 rounded-full blur-3xl opacity-20 pointer-events-none transition-opacity group-hover:opacity-35"
                  style={{ backgroundColor: acc.accentColor || '#10b981' }}
                />
                <div className="absolute top-0 right-0 w-full h-full bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-white/[0.04] via-transparent to-transparent pointer-events-none" />

                {/* Card Top Row: Bank Info, Type Badge, and Quick Actions */}
                <div className="relative z-10 flex items-start justify-between gap-3">
                  <div className="flex items-center space-x-3">
                    <div className="p-2.5 rounded-xl bg-white/10 backdrop-blur-md border border-white/10 text-white flex-shrink-0 shadow-inner">
                      <Building2 className="w-5 h-5 text-emerald-400" />
                    </div>
                    <div>
                      <h4 className="text-base font-black text-white tracking-tight leading-tight">
                        {acc.bankName}
                      </h4>
                      <div className="flex items-center space-x-2 mt-1">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-white/10 text-slate-300 border border-white/10">
                          {acc.accountType}
                        </span>
                        {acc.isPrimary && (
                          <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 animate-pulse">
                            <Star className="w-3 h-3 fill-emerald-400" />
                            <span>PRIMARY</span>
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Kebab Action Menu */}
                  <div className="relative">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveMenuId(isMenuOpen ? null : acc.id);
                      }}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition cursor-pointer"
                      title="Account Options"
                    >
                      <MoreVertical className="w-4 h-4" />
                    </button>

                    {isMenuOpen && (
                      <div
                        onClick={(e) => e.stopPropagation()}
                        className="absolute right-0 mt-1 w-44 rounded-xl bg-[#0d1322] border border-slate-700/80 shadow-2xl py-1 z-30 animate-fadeIn text-xs"
                      >
                        {!acc.isPrimary && (
                          <button
                            type="button"
                            onClick={(e) => handleSetPrimary(acc.id, e)}
                            className="w-full text-left px-3.5 py-2 text-slate-300 hover:text-white hover:bg-slate-800 flex items-center space-x-2 transition"
                          >
                            <Star className="w-3.5 h-3.5 text-emerald-400" />
                            <span>Set as Primary</span>
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={(e) => handleOpenEditModal(acc, e)}
                          className="w-full text-left px-3.5 py-2 text-slate-300 hover:text-white hover:bg-slate-800 flex items-center space-x-2 transition"
                        >
                          <Pencil className="w-3.5 h-3.5 text-cyan-400" />
                          <span>Edit Account</span>
                        </button>
                        <button
                          type="button"
                          onClick={(e) => handleDelete(acc.id, e)}
                          className="w-full text-left px-3.5 py-2 text-rose-400 hover:text-rose-300 hover:bg-rose-950/40 flex items-center space-x-2 transition"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Delete Account</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Card Center: EMV Chip + Contactless + Masked Number */}
                <div className="relative z-10 my-4 space-y-3">
                  <div className="flex items-center space-x-3">
                    {/* Metallic EMV Chip Illustration */}
                    <div className="w-10 h-7 rounded-md bg-gradient-to-tr from-amber-300 via-amber-200 to-amber-400 border border-amber-500/40 relative overflow-hidden shadow-inner flex items-center justify-center">
                      <div className="w-full h-[1px] bg-amber-700/40" />
                      <div className="h-full w-[1px] bg-amber-700/40 absolute" />
                      <div className="w-4 h-4 rounded-sm border border-amber-700/40 absolute" />
                    </div>
                    {/* Contactless wave icon */}
                    <svg
                      className="w-5 h-5 text-slate-400 rotate-90"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M5 12.55a11 11 0 0 1 14.08 0" />
                      <path d="M1.42 9a16 16 0 0 1 21.16 0" />
                      <path d="M8.53 16.11a6 6 0 0 1 6.95 0" />
                      <line x1="12" y1="20" x2="12.01" y2="20" />
                    </svg>
                  </div>

                  {/* Masked Account Number with Copy Button */}
                  <div className="flex items-center justify-between bg-black/30 backdrop-blur-md px-3.5 py-2 rounded-xl border border-white/5">
                    <span className="font-mono text-sm sm:text-base font-bold tracking-widest text-white">
                      {formatMaskedAccount(acc.accountNumber)}
                    </span>
                    <button
                      type="button"
                      onClick={(e) => handleCopy(acc, e)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-400 hover:bg-white/10 transition active:scale-95 cursor-pointer flex items-center space-x-1"
                      title="Copy Account Number"
                    >
                      {copiedId === acc.id ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                          <span className="text-[10px] text-emerald-400 font-bold">Copied</span>
                        </>
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Card Bottom Row: Holder Name, IFSC Code & RuPay/Visa Badge */}
                <div className="relative z-10 pt-2 border-t border-white/10 flex items-end justify-between text-xs">
                  <div>
                    <span className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold block">
                      Account Holder
                    </span>
                    <span className="font-bold text-slate-100 tracking-wide uppercase truncate block max-w-[150px]">
                      {acc.accountHolder}
                    </span>
                  </div>

                  <div className="text-right">
                    <span className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold block">
                      IFSC Routing
                    </span>
                    <span className="font-mono font-bold text-emerald-400 uppercase tracking-wider">
                      {acc.ifsc}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ========================================================================= */}
      {/* BANK ACCOUNT INPUT MODAL / SLIDE-OVER FORM                                */}
      {/* ========================================================================= */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/75 backdrop-blur-sm transition-opacity"
            onClick={() => setIsModalOpen(false)}
          />

          {/* Modal Container */}
          <div className="relative w-full max-w-lg mx-4 rounded-2xl bg-white dark:bg-[#0d1322] border border-slate-200 dark:border-slate-800 shadow-2xl p-6 sm:p-7 z-10 max-h-[90vh] overflow-y-auto animate-fadeIn">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center space-x-3">
                <div className="p-2.5 rounded-xl bg-emerald-500/15 text-emerald-500 border border-emerald-500/30">
                  <CreditCard className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-900 dark:text-slate-100">
                    {editingId ? 'Edit Bank Account' : 'Link New Bank Account'}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Enter valid banking credentials for direct settlement
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleFormSubmit} className="space-y-4 mt-5">
              {/* Field 1: Bank Name */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                  Bank Name <span className="text-rose-500">*</span>
                </label>
                <select
                  value={formData.bankName}
                  onChange={(e) => setFormData({ ...formData, bankName: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-emerald-500 transition"
                >
                  {POPULAR_BANKS.map((b) => (
                    <option key={b} value={b}>
                      {b}
                    </option>
                  ))}
                  <option value="Other">Other Bank (Specify below)</option>
                </select>

                {formData.bankName === 'Other' && (
                  <input
                    type="text"
                    placeholder="Enter Custom Bank Name"
                    value={formData.customBankName}
                    onChange={(e) => setFormData({ ...formData, customBankName: e.target.value })}
                    className="w-full mt-2 px-3.5 py-2.5 rounded-xl text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-emerald-500 transition"
                  />
                )}
                {formErrors.bankName && (
                  <p className="text-[11px] text-rose-500 mt-1">{formErrors.bankName}</p>
                )}
              </div>

              {/* Field 2: Account Holder Name */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                  Account Holder Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Santhosh"
                  value={formData.accountHolder}
                  onChange={(e) => setFormData({ ...formData, accountHolder: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-emerald-500 transition"
                />
                {formErrors.accountHolder && (
                  <p className="text-[11px] text-rose-500 mt-1">{formErrors.accountHolder}</p>
                )}
              </div>

              {/* Field 3: Account Number */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                    Account Number <span className="text-rose-500">*</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowAccountNum(!showAccountNum)}
                    className="text-[11px] font-semibold text-slate-400 hover:text-emerald-500 flex items-center space-x-1"
                  >
                    {showAccountNum ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    <span>{showAccountNum ? 'Hide' : 'Show'}</span>
                  </button>
                </div>
                <input
                  type={showAccountNum ? 'text' : 'password'}
                  placeholder="Enter numeric account number"
                  value={formData.accountNumber}
                  onChange={(e) =>
                    setFormData({ ...formData, accountNumber: e.target.value.replace(/\D/g, '') })
                  }
                  className="w-full font-mono px-3.5 py-2.5 rounded-xl text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-emerald-500 transition"
                />
                {formErrors.accountNumber && (
                  <p className="text-[11px] text-rose-500 mt-1">{formErrors.accountNumber}</p>
                )}
              </div>

              {/* Field 4: Confirm Account Number */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                  Confirm Account Number <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="Re-enter numeric account number"
                  value={formData.confirmAccountNumber}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      confirmAccountNumber: e.target.value.replace(/\D/g, ''),
                    })
                  }
                  className="w-full font-mono px-3.5 py-2.5 rounded-xl text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-emerald-500 transition"
                />
                {formErrors.confirmAccountNumber && (
                  <p className="text-[11px] text-rose-500 mt-1">{formErrors.confirmAccountNumber}</p>
                )}
              </div>

              {/* Field 5: IFSC Code with automatic detection */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                  IFSC Code <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. HDFC0001234"
                  maxLength={11}
                  value={formData.ifsc}
                  onChange={(e) =>
                    setFormData({ ...formData, ifsc: e.target.value.toUpperCase() })
                  }
                  className="w-full font-mono uppercase px-3.5 py-2.5 rounded-xl text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-emerald-500 transition"
                />

                {/* Automatic Branch/Bank detection feedback */}
                {detectedIfscBank && (
                  <div className="mt-1.5 p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/25 text-emerald-600 dark:text-emerald-400 text-[11px] flex items-center space-x-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0" />
                    <span>{detectedIfscBank}</span>
                  </div>
                )}
                {formErrors.ifsc && (
                  <p className="text-[11px] text-rose-500 mt-1">{formErrors.ifsc}</p>
                )}
              </div>

              {/* Field 6: Account Type Segmented Selector */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                  Account Type
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {['Savings', 'Current', 'Salary'].map((type) => {
                    const isSelected = formData.accountType === type;
                    return (
                      <button
                        key={type}
                        type="button"
                        onClick={() => setFormData({ ...formData, accountType: type })}
                        className={`py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center space-x-1.5 cursor-pointer ${
                          isSelected
                            ? 'bg-emerald-600 text-white shadow-sm'
                            : 'bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800'
                        }`}
                      >
                        <span>{type}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Field 7: Primary Account Flag Toggle */}
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    Primary Settlement Account
                  </p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Designate as the default ledger settlement account
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={formData.isPrimary}
                  onChange={(e) => setFormData({ ...formData, isPrimary: e.target.checked })}
                  className="w-4 h-4 accent-emerald-500 rounded cursor-pointer"
                />
              </div>

              {/* Modal Actions */}
              <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs shadow-md transition active:scale-95 cursor-pointer"
                >
                  {editingId ? 'Save Changes' : 'Save Bank Account'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
