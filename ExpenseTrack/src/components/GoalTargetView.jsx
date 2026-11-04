import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Target,
  Wallet,
  IndianRupee,
  TrendingUp,
  Sparkles,
  Search,
  Plus,
  Clock,
  MoreVertical,
  X,
  Lock,
  Trash2,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  ArrowUpRight,
} from 'lucide-react';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// Format INR currency
const formatINR = (value) => {
  const num = Number(value) || 0;
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
    minimumFractionDigits: 0,
  }).format(num);
};

export default function GoalTargetView() {
  const [wallets, setWallets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  // Filter & Search states
  const [activeFilter, setActiveFilter] = useState('all'); // 'all', 'in_progress', 'target_met', 'claimed'
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearchInput, setShowSearchInput] = useState(false);

  // Setup Modal State
  const [isSetupModalOpen, setIsSetupModalOpen] = useState(false);
  const [purposeName, setPurposeName] = useState('');
  const [targetCap, setTargetCap] = useState('');
  const [descriptiveNotes, setDescriptiveNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [modalError, setModalError] = useState(null);

  // Add Cash Modal State
  const [isAddCashModalOpen, setIsAddCashModalOpen] = useState(false);
  const [selectedWallet, setSelectedWallet] = useState(null);
  const [addCashAmount, setAddCashAmount] = useState('');
  const [isAddingCash, setIsAddingCash] = useState(false);
  const [addCashError, setAddCashError] = useState(null);

  // Card menu dropdown state
  const [activeMenuId, setActiveMenuId] = useState(null);

  // Fetch Wallets from Database API
  const fetchWallets = useCallback(async (isSilent = false) => {
    if (!isSilent) setLoading(true);
    else setRefreshing(true);
    setError(null);

    try {
      const res = await fetch(`${API_BASE_URL}/api/wallets`);
      if (!res.ok) {
        throw new Error(`Server returned HTTP ${res.status}`);
      }
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        setWallets(data.data);
      } else if (Array.isArray(data)) {
        setWallets(data);
      } else {
        setWallets([]);
      }
    } catch (err) {
      console.error('Error fetching goal wallets:', err);
      setError(err.message || 'Failed to load segregated wallets');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchWallets();
  }, [fetchWallets]);

  // Handle Create Wallet Submit
  const handleSetupSubmit = async (e) => {
    e.preventDefault();
    setModalError(null);

    const name = purposeName.trim();
    if (!name) {
      setModalError('Please enter a Purpose / Item Name');
      return;
    }

    const cap = parseFloat(targetCap);
    if (isNaN(cap) || cap <= 0) {
      setModalError('Please enter a valid target cap amount greater than ₹0');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        name,
        target_amount: cap,
        description: descriptiveNotes.trim(),
      };

      const res = await fetch(`${API_BASE_URL}/api/wallets`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Failed to create isolated container');
      }

      // Reset and close
      setPurposeName('');
      setTargetCap('');
      setDescriptiveNotes('');
      setIsSetupModalOpen(false);

      // Refresh wallets list from database
      await fetchWallets(true);
    } catch (err) {
      console.error('Setup wallet error:', err);
      setModalError(err.message || 'Could not save wallet to database');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Add Cash to Wallet
  const handleAddCashSubmit = async (e) => {
    e.preventDefault();
    setAddCashError(null);

    if (!selectedWallet) return;
    const amount = parseFloat(addCashAmount);
    if (isNaN(amount) || amount <= 0) {
      setAddCashError('Please enter a valid cash amount greater than ₹0');
      return;
    }

    const saved = Number(selectedWallet.saved_amount) || 0;
    const target = Number(selectedWallet.target_amount) || 0;
    const remaining = Math.max(0, target - saved);

    if (amount > remaining) {
      setAddCashError('Deposit cannot exceed the target ceiling');
      return;
    }

    setIsAddingCash(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/wallets/${selectedWallet.id}/add-cash`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ amount }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Failed to allocate cash');
      }

      setAddCashAmount('');
      setIsAddCashModalOpen(false);
      setSelectedWallet(null);

      // Refresh list
      await fetchWallets(true);
    } catch (err) {
      console.error('Add cash error:', err);
      setAddCashError(err.message || 'Error updating wallet');
    } finally {
      setIsAddingCash(false);
    }
  };

  // Quick Add & Fill Remaining Handlers
  const handleQuickAdd = (increment) => {
    if (!selectedWallet) return;
    const saved = Number(selectedWallet.saved_amount) || 0;
    const target = Number(selectedWallet.target_amount) || 0;
    const remaining = Math.max(0, target - saved);
    const current = parseFloat(addCashAmount) || 0;
    const nextAmount = current + increment;
    const clamped = Math.min(remaining, nextAmount);
    setAddCashAmount(String(clamped));
    setAddCashError(null);
  };

  const handleFillRemaining = () => {
    if (!selectedWallet) return;
    const saved = Number(selectedWallet.saved_amount) || 0;
    const target = Number(selectedWallet.target_amount) || 0;
    const remaining = Math.max(0, target - saved);
    setAddCashAmount(String(remaining));
    setAddCashError(null);
  };

  // Handle Delete Wallet
  const handleDeleteWallet = async (walletId) => {
    if (!window.confirm('Are you sure you want to delete this segregated container?')) {
      return;
    }

    try {
      const res = await fetch(`${API_BASE_URL}/api/wallets/${walletId}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        await fetchWallets(true);
        setActiveMenuId(null);
      }
    } catch (err) {
      console.error('Delete wallet error:', err);
    }
  };

  // Close menus on outside click
  useEffect(() => {
    const handleDocumentClick = () => setActiveMenuId(null);
    document.addEventListener('click', handleDocumentClick);
    return () => document.removeEventListener('click', handleDocumentClick);
  }, []);

  // Compute 4 KPI Metrics
  const { activeCount, totalSaved, totalTarget, accomplishmentPercent } = useMemo(() => {
    const activeWallets = wallets.filter((w) => (w.status || 'in_progress') !== 'claimed');
    const activeCount = activeWallets.length;
    const totalSaved = wallets.reduce((acc, w) => acc + (Number(w.saved_amount) || 0), 0);
    const totalTarget = wallets.reduce((acc, w) => acc + (Number(w.target_amount) || 0), 0);
    const accomplishmentPercent = totalTarget > 0 ? Math.min(100, Math.round((totalSaved / totalTarget) * 100)) : 0;

    return {
      activeCount,
      totalSaved,
      totalTarget,
      accomplishmentPercent,
    };
  }, [wallets]);

  // Counts for Filter Tabs
  const counts = useMemo(() => {
    return {
      all: wallets.length,
      in_progress: wallets.filter((w) => (w.status || 'in_progress') === 'in_progress').length,
      target_met: wallets.filter((w) => w.status === 'target_met').length,
      claimed: wallets.filter((w) => w.status === 'claimed').length,
    };
  }, [wallets]);

  // Filtered Wallets
  const filteredWallets = useMemo(() => {
    return wallets.filter((w) => {
      // Tab filter
      if (activeFilter === 'in_progress' && (w.status || 'in_progress') !== 'in_progress') return false;
      if (activeFilter === 'target_met' && w.status !== 'target_met') return false;
      if (activeFilter === 'claimed' && w.status !== 'claimed') return false;

      // Search query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesName = (w.name || '').toLowerCase().includes(query);
        const matchesDesc = (w.description || '').toLowerCase().includes(query);
        return matchesName || matchesDesc;
      }
      return true;
    });
  }, [wallets, activeFilter, searchQuery]);

  // Derived state for the selected wallet in Add Cash modal
  const selectedSaved = selectedWallet ? Number(selectedWallet.saved_amount) || 0 : 0;
  const selectedTarget = selectedWallet ? Number(selectedWallet.target_amount) || 0 : 0;
  const selectedRemaining = Math.max(0, selectedTarget - selectedSaved);
  const numericAddCashInput = parseFloat(addCashAmount) || 0;
  const isDepositExceeded = numericAddCashInput > selectedRemaining;
  const isDepositZeroOrEmpty = !addCashAmount || numericAddCashInput <= 0;
  const isDepositValid = !isDepositZeroOrEmpty && !isDepositExceeded && selectedRemaining > 0;
  const projectedBalance = selectedSaved + (isDepositExceeded ? 0 : numericAddCashInput);

  return (
    <div className="space-y-7 animate-fadeIn">
      {/* ========================================================= */}
      {/* A. TOP HEADER & METRIC CARDS                              */}
      {/* ========================================================= */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <div className="flex items-center space-x-2.5">
            <h2 className="text-xl sm:text-2xl font-black tracking-wider uppercase bg-gradient-to-r from-[#0d5236] via-emerald-700 to-teal-600 bg-clip-text text-transparent">
              SET YOUR TARGET FOR YOUR FUTURE
            </h2>
            <button
              onClick={() => setShowSearchInput(!showSearchInput)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
              title="Search Wallets"
            >
              <Search className="w-5 h-5" />
            </button>
            {refreshing && (
              <RefreshCw className="w-4 h-4 text-emerald-600 animate-spin" />
            )}
          </div>
          <p className="text-xs text-slate-500 mt-1 font-medium">
            Plan, allocate, and secure funds toward your milestone achievements.
          </p>
        </div>

        {/* Top-Right Action Button: Setup Purpose Wallet */}
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setIsSetupModalOpen(true)}
            className="flex items-center space-x-2 px-4 py-2.5 rounded-xl text-white font-bold text-xs shadow-sm hover:opacity-90 transition active:scale-95 cursor-pointer"
            style={{ backgroundColor: '#0d5236' }}
          >
            <Plus className="w-4 h-4" />
            <span>Setup Purpose Wallet</span>
          </button>
        </div>
      </div>

      {/* Expandable Search Input */}
      {showSearchInput && (
        <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center space-x-2">
          <Search className="w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search segregated purpose wallets by name or description..."
            className="w-full bg-transparent text-xs text-slate-800 placeholder-slate-400 focus:outline-none"
            autoFocus
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="text-slate-400 hover:text-slate-600 text-xs"
            >
              Clear
            </button>
          )}
        </div>
      )}

      {/* 4 KPI Summary Cards */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Target Wallets Active */}
        <div className="rounded-2xl bg-white dark:bg-[#0c1322] border border-slate-200 dark:border-slate-800 p-5 shadow-sm hover:shadow transition">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Target Wallets Active
            </span>
            <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400">
              <Target className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-slate-100 mt-1">{activeCount}</div>
          <p className="text-[11px] text-slate-400 mt-2 font-medium">Containers deployed</p>
        </div>

        {/* KPI 2: Total Isolated Funds */}
        <div className="rounded-2xl bg-white dark:bg-[#0c1322] border border-slate-200 dark:border-slate-800 p-5 shadow-sm hover:shadow transition">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Total Isolated Funds
            </span>
            <div className="p-2 rounded-xl bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-400">
              <IndianRupee className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-slate-100 mt-1">{formatINR(totalSaved)}</div>
          <p className="text-[11px] text-slate-400 mt-2 font-medium">Secured in segregated reserve</p>
        </div>

        {/* KPI 3: Goal Completion Target */}
        <div className="rounded-2xl bg-white dark:bg-[#0c1322] border border-slate-200 dark:border-slate-800 p-5 shadow-sm hover:shadow transition">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Goal Completion Target
            </span>
            <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-400">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-slate-100 mt-1">{formatINR(totalTarget)}</div>
          <p className="text-[11px] text-slate-400 mt-2 font-medium">Total ceiling goal</p>
        </div>

        {/* KPI 4: Target Accomplishment */}
        <div className="rounded-2xl bg-white dark:bg-[#0c1322] border border-slate-200 dark:border-slate-800 p-5 shadow-sm hover:shadow transition">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Target Accomplishment
            </span>
            <div className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400">
              <Sparkles className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-slate-100 mt-1">{accomplishmentPercent}%</div>
          <p className="text-[11px] text-slate-400 mt-2 font-medium">Progress towards target</p>
        </div>
      </section>

      {/* ========================================================= */}
      {/* B. FILTER TABS                                            */}
      {/* ========================================================= */}
      <div className="flex items-center space-x-2 border-b border-slate-200 pb-3 overflow-x-auto">
        <button
          onClick={() => setActiveFilter('all')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition flex items-center space-x-1.5 cursor-pointer whitespace-nowrap ${
            activeFilter === 'all'
              ? 'bg-[#0d5236] text-white shadow-sm'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          <span>All Containers</span>
          <span
            className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
              activeFilter === 'all' ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
            }`}
          >
            {counts.all}
          </span>
        </button>

        <button
          onClick={() => setActiveFilter('in_progress')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition flex items-center space-x-1.5 cursor-pointer whitespace-nowrap ${
            activeFilter === 'in_progress'
              ? 'bg-[#0d5236] text-white shadow-sm'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          <span>In Progress</span>
          <span
            className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
              activeFilter === 'in_progress' ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
            }`}
          >
            {counts.in_progress}
          </span>
        </button>

        <button
          onClick={() => setActiveFilter('target_met')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition flex items-center space-x-1.5 cursor-pointer whitespace-nowrap ${
            activeFilter === 'target_met'
              ? 'bg-[#0d5236] text-white shadow-sm'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          <span>Target Met</span>
          <span
            className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
              activeFilter === 'target_met' ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
            }`}
          >
            {counts.target_met}
          </span>
        </button>

        <button
          onClick={() => setActiveFilter('claimed')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition flex items-center space-x-1.5 cursor-pointer whitespace-nowrap ${
            activeFilter === 'claimed'
              ? 'bg-[#0d5236] text-white shadow-sm'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          <span>Claimed</span>
          <span
            className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
              activeFilter === 'claimed' ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
            }`}
          >
            {counts.claimed}
          </span>
        </button>
      </div>

      {/* ========================================================= */}
      {/* C. CONTENT STATES                                         */}
      {/* ========================================================= */}
      {loading ? (
        <div className="py-20 text-center">
          <RefreshCw className="w-8 h-8 text-emerald-600 animate-spin mx-auto mb-3" />
          <p className="text-xs text-slate-500 font-medium">Loading segregated wallets from database...</p>
        </div>
      ) : filteredWallets.length === 0 ? (
        /* Empty State */
        <div className="py-16 px-4 bg-slate-50/70 rounded-3xl border-2 border-dashed border-slate-200 text-center max-w-2xl mx-auto my-8">
          <div className="w-16 h-16 rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-center mx-auto mb-4 text-slate-400 shadow-inner">
            <Wallet className="w-8 h-8 stroke-[1.5]" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 mb-2">No Segregated Wallets</h3>
          <p className="text-xs text-slate-500 leading-relaxed max-w-md mx-auto mb-6">
            Setup isolated purpose-driven buckets! For example, reserve money sequentially to buy future equipment, specialized stationery, or tax deposits.
          </p>
          <button
            onClick={() => setIsSetupModalOpen(true)}
            className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl text-white font-bold text-xs shadow-sm hover:opacity-90 transition active:scale-95 cursor-pointer"
            style={{ backgroundColor: '#0d5236' }}
          >
            <Plus className="w-4 h-4" />
            <span>Setup Purpose Wallet</span>
          </button>
        </div>
      ) : (
        /* Active Cards Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredWallets.map((wallet) => {
            const saved = Number(wallet.saved_amount) || 0;
            const target = Number(wallet.target_amount) || 0;
            const percentage = target > 0 ? Math.min(100, Math.round((saved / target) * 100)) : 0;
            const isTargetMet = saved >= target && target > 0;

            return (
              <div
                key={wallet.id}
                className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition-shadow relative flex flex-col justify-between"
              >
                <div>
                  {/* Card Header: Goal name, GROWING green badge, history icon, three-dots menu */}
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex items-center space-x-2 flex-wrap">
                      <h4 className="text-base font-extrabold text-slate-900 capitalize tracking-tight">
                        {wallet.name}
                      </h4>
                      {isTargetMet ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800 border border-blue-200 uppercase tracking-wider">
                          TARGET MET
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 uppercase tracking-wider">
                          GROWING
                        </span>
                      )}
                    </div>

                    <div className="flex items-center space-x-1 flex-shrink-0">
                      {/* History icon */}
                      <button
                        type="button"
                        className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
                        title="View Ledger History"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Clock className="w-4 h-4" />
                      </button>

                      {/* Three-dots menu */}
                      <div className="relative">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveMenuId(activeMenuId === wallet.id ? null : wallet.id);
                          }}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition cursor-pointer"
                          title="More Options"
                        >
                          <MoreVertical className="w-4 h-4" />
                        </button>

                        {/* Dropdown Menu */}
                        {activeMenuId === wallet.id && (
                          <div
                            onClick={(e) => e.stopPropagation()}
                            className="absolute right-0 top-full mt-1 w-40 bg-white rounded-xl shadow-xl border border-slate-200 py-1.5 z-20"
                          >
                            <button
                              onClick={() => {
                                setSelectedWallet(wallet);
                                setAddCashAmount('');
                                setAddCashError(null);
                                setIsAddCashModalOpen(true);
                                setActiveMenuId(null);
                              }}
                              className="w-full text-left px-3 py-1.5 text-xs text-slate-700 hover:bg-slate-50 flex items-center space-x-2"
                            >
                              <Plus className="w-3.5 h-3.5 text-emerald-600" />
                              <span>Add Cash</span>
                            </button>
                            <button
                              onClick={() => handleDeleteWallet(wallet.id)}
                              className="w-full text-left px-3 py-1.5 text-xs text-rose-600 hover:bg-rose-50 flex items-center space-x-2"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              <span>Delete Wallet</span>
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Description text (e.g., "for wedding") */}
                  <p className="text-xs text-slate-500 mb-4 line-clamp-2">
                    {wallet.description || 'No descriptive notes added.'}
                  </p>

                  {/* Stat box showing Saved Allocated (₹0) and Target Ceiling (₹2,00,000) */}
                  <div className="bg-slate-50 rounded-xl p-3 border border-slate-100 mb-4 grid grid-cols-2 gap-2">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">
                        Saved Allocated
                      </span>
                      <span className="text-sm font-black text-slate-900 font-mono">
                        {formatINR(saved)}
                      </span>
                    </div>
                    <div className="border-l border-slate-200 pl-3">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">
                        Target Ceiling
                      </span>
                      <span className="text-sm font-black text-slate-900 font-mono">
                        {formatINR(target)}
                      </span>
                    </div>
                  </div>

                  {/* Goal Status progress bar with percentage (0%) */}
                  <div className="space-y-1.5 mb-5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-[11px] font-semibold text-slate-500">Goal Status</span>
                      <span className="text-xs font-bold text-slate-800 font-mono">{percentage}%</span>
                    </div>
                    <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-500"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Bottom action buttons: "+ Add Cash" (light green) and "🔒 Locked" (disabled button) */}
                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedWallet(wallet);
                      setAddCashAmount('');
                      setAddCashError(null);
                      setIsAddCashModalOpen(true);
                    }}
                    className="py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center space-x-1 cursor-pointer bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200 active:scale-95"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Cash</span>
                  </button>

                  <button
                    type="button"
                    disabled
                    className="py-2 px-3 rounded-xl text-xs font-semibold flex items-center justify-center space-x-1 bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed select-none"
                    title="Funds are locked in segregation escrow until milestone claims"
                  >
                    <Lock className="w-3.5 h-3.5" />
                    <span>🔒 Locked</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ========================================================= */}
      {/* D. "Setup Target Wallet" MODAL POPUP                      */}
      {/* ========================================================= */}
      {isSetupModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto relative">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-5 border-b border-slate-200">
              <h3 className="text-base font-bold text-slate-900">Setup Target Wallet</h3>
              <button
                onClick={() => {
                  setIsSetupModalOpen(false);
                  setModalError(null);
                }}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSetupSubmit} className="p-5 space-y-4">
              {modalError && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center space-x-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{modalError}</span>
                </div>
              )}

              {/* PURPOSE / ITEM NAME */}
              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  PURPOSE / ITEM NAME
                </label>
                <input
                  type="text"
                  required
                  value={purposeName}
                  onChange={(e) => setPurposeName(e.target.value)}
                  placeholder="e.g. gold"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:bg-white transition"
                />
              </div>

              {/* TARGET CAP AMOUNT (INR) with ₹ prefix */}
              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  TARGET CAP AMOUNT (INR)
                </label>
                <div className="relative flex items-center">
                  <span className="absolute left-3.5 text-slate-400 font-bold text-xs">₹</span>
                  <input
                    type="number"
                    min="1"
                    step="1"
                    required
                    value={targetCap}
                    onChange={(e) => setTargetCap(e.target.value)}
                    placeholder="200000"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-8 pr-3.5 py-2.5 text-xs text-slate-900 font-mono placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:bg-white transition"
                  />
                </div>
              </div>

              {/* DESCRIPTIVE NOTES */}
              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  DESCRIPTIVE NOTES
                </label>
                <textarea
                  rows="3"
                  value={descriptiveNotes}
                  onChange={(e) => setDescriptiveNotes(e.target.value)}
                  placeholder="e.g. for wedding"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:bg-white transition resize-none"
                />
              </div>

              {/* Action Button: Full-width dark green button: "Activate Isolated Container" */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 rounded-xl text-white font-bold text-xs uppercase tracking-wider shadow-md hover:opacity-95 transition active:scale-95 disabled:opacity-50 cursor-pointer mt-2"
                style={{ backgroundColor: '#0d5236' }}
              >
                {isSubmitting ? 'Activating Container...' : 'Activate Isolated Container'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 2. "Add Cash to [Wallet Name]" MODAL POPUP                */}
      {/* ========================================================= */}
      {isAddCashModalOpen && selectedWallet && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto animate-scaleIn">
            {/* A. Modal Header */}
            <div className="flex items-start justify-between p-5 border-b border-slate-100">
              <div className="flex items-start space-x-3.5">
                {/* Rounded light-green circular badge with dark green + icon */}
                <div className="w-10 h-10 rounded-full bg-emerald-100/90 border border-emerald-200/80 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Plus className="w-5 h-5 text-[#0d5236] stroke-[2.5]" />
                </div>

                <div>
                  <h3 className="text-base font-extrabold text-slate-900 capitalize tracking-tight">
                    Add Cash to {selectedWallet.name}
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">
                    Saved: <span className="font-semibold text-slate-700">{formatINR(selectedSaved)}</span> of{' '}
                    <span className="font-semibold text-slate-700">{formatINR(selectedTarget)}</span> • Remaining:{' '}
                    <span className="text-rose-600 font-black font-mono">
                      {formatINR(selectedRemaining)}
                    </span>
                  </p>
                </div>
              </div>

              {/* Close Button: Top-right circular close button (✕) */}
              <button
                type="button"
                onClick={() => {
                  setIsAddCashModalOpen(false);
                  setSelectedWallet(null);
                  setAddCashAmount('');
                  setAddCashError(null);
                }}
                className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition cursor-pointer flex-shrink-0"
                title="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body & Form */}
            <form onSubmit={handleAddCashSubmit} className="p-5 space-y-4">
              {/* B. Input & Quick-Add Pills */}
              <div className="space-y-2.5">
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                  ENTER DEPOSIT AMOUNT (INR)
                </label>

                {/* Input Box with Prefix badge inside: ₹ INR */}
                <div
                  className={`flex items-center rounded-xl border bg-slate-50 overflow-hidden transition ${
                    isDepositExceeded
                      ? 'border-rose-400 ring-2 ring-rose-500/20 bg-rose-50/20'
                      : 'border-slate-200 focus-within:ring-2 focus-within:ring-emerald-600 focus-within:bg-white focus-within:border-emerald-600'
                  }`}
                >
                  <span className="px-3.5 py-2.5 bg-slate-100 border-r border-slate-200 text-xs font-bold text-slate-600 select-none flex items-center whitespace-nowrap">
                    ₹ INR
                  </span>
                  <input
                    type="number"
                    min="1"
                    max={selectedRemaining}
                    step="1"
                    value={addCashAmount}
                    onChange={(e) => {
                      const val = e.target.value;
                      setAddCashAmount(val);
                      const num = parseFloat(val) || 0;
                      if (num > selectedRemaining) {
                        setAddCashError('Deposit cannot exceed the target ceiling');
                      } else {
                        setAddCashError(null);
                      }
                    }}
                    placeholder={selectedRemaining > 0 ? `0 (Max: ₹${selectedRemaining.toLocaleString('en-IN')})` : '0'}
                    className="w-full bg-transparent px-3.5 py-2.5 text-sm font-bold text-slate-900 font-mono placeholder-slate-400 focus:outline-none"
                    autoFocus
                  />
                </div>

                {/* Inline validation error */}
                {(isDepositExceeded || addCashError) && (
                  <p className="text-[11px] font-semibold text-rose-600 flex items-center space-x-1.5 mt-1 animate-fadeIn">
                    <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                    <span>{addCashError || 'Deposit cannot exceed the target ceiling'}</span>
                  </p>
                )}

                {/* Quick-Fill Buttons Row */}
                <div className="flex items-center flex-wrap gap-2 pt-1">
                  {/* "Fill Remaining (₹[remaining])": Outlined red/pink button */}
                  <button
                    type="button"
                    onClick={handleFillRemaining}
                    disabled={selectedRemaining <= 0}
                    className="px-2.5 py-1.5 rounded-lg border border-rose-300 text-rose-700 bg-rose-50/60 hover:bg-rose-100 text-xs font-bold transition disabled:opacity-40 disabled:cursor-not-allowed whitespace-nowrap cursor-pointer active:scale-95"
                  >
                    Fill Remaining ({formatINR(selectedRemaining)})
                  </button>

                  {/* "+₹1,000", "+₹5,000", "+₹10,000", "+₹25,000": Light green pill buttons */}
                  {[1000, 5000, 10000, 25000].map((amt) => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => handleQuickAdd(amt)}
                      disabled={selectedRemaining <= 0}
                      className="px-2.5 py-1.5 rounded-lg border border-emerald-200 bg-emerald-50 text-emerald-800 hover:bg-emerald-100 text-xs font-bold transition disabled:opacity-40 disabled:cursor-not-allowed whitespace-nowrap cursor-pointer active:scale-95"
                    >
                      +₹{amt.toLocaleString('en-IN')}
                    </button>
                  ))}
                </div>
              </div>

              {/* C. Projected Calculation Box */}
              <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3.5 flex items-center justify-between">
                <span className="text-xs font-medium text-slate-600">
                  Projected Balance After Deposit:
                </span>
                <span className="text-sm font-black font-mono text-emerald-700">
                  {formatINR(projectedBalance)}
                </span>
              </div>

              {/* D. Action Buttons (Footer) */}
              <div className="flex items-center justify-end space-x-2.5 pt-3 border-t border-slate-100">
                {/* "Cancel": Outlined button with rounded corners */}
                <button
                  type="button"
                  onClick={() => {
                    setIsAddCashModalOpen(false);
                    setSelectedWallet(null);
                    setAddCashAmount('');
                    setAddCashError(null);
                  }}
                  className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-100 text-xs font-semibold transition cursor-pointer"
                >
                  Cancel
                </button>

                {/* "✓ Deposit Cash": Primary action button */}
                <button
                  type="submit"
                  disabled={!isDepositValid || isAddingCash || selectedRemaining <= 0}
                  className={`px-5 py-2.5 rounded-xl text-xs font-bold transition flex items-center space-x-1.5 shadow ${
                    isDepositValid && selectedRemaining > 0 && !isAddingCash
                      ? 'bg-[#0d5236] hover:bg-[#093d28] text-white active:scale-95 cursor-pointer shadow-emerald-950/20'
                      : 'bg-slate-200 text-slate-400 cursor-not-allowed opacity-60 shadow-none'
                  }`}
                >
                  {isAddingCash ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Depositing...</span>
                    </>
                  ) : (
                    <span>✓ Deposit Cash</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
