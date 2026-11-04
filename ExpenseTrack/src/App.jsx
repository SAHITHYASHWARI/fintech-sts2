import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Building2,
  TrendingUp,
  Clock,
  CheckCircle2,
  AlertCircle,
  PlusCircle,
  RefreshCw,
  Search,
  Filter,
  IndianRupee,
  ShieldCheck,
  Server,
  Calendar,
  Layers,
  ArrowUpRight,
  Sparkles,
  Menu,
  X,
} from 'lucide-react';
import Sidebar from './components/Sidebar';
import DashboardView from './components/DashboardView';
import SegregationView from './components/SegregationView';
import SplitAndCollectPlaceholder from './components/SplitAndCollectPlaceholder';
import GoalTargetView from './components/GoalTargetView';
import BillsAndRemindersView from './components/BillsAndRemindersView';
import WalletsView from './components/WalletsView';
import ContactUsView from './components/ContactUsView';
import SubscriptionPlansView from './components/SubscriptionPlansView';
import WealthAcademyView from './components/WealthAcademyView';
import Header from './components/Header';
import LandingPage from './components/LandingPage';
import Auth from './components/Auth';
import Settings from './components/Settings';
import IncomeStreamsView from './components/IncomeStreamsView';
import { useLanguage } from './context/LanguageContext';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// Currency Formatter for Indian Rupees (₹)
const formatINR = (value) => {
  const num = Number(value) || 0;
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2,
    minimumFractionDigits: 2,
  }).format(num);
};

// Date Formatter
const formatDate = (dateString) => {
  if (!dateString) return 'Just now';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return dateString;
  return new Intl.DateTimeFormat('en-IN', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  }).format(date);
};

export default function App() {
  // Primary Route State: 'landing' (/) | 'auth' (/login) | 'dashboard' (/dashboard) | '/settings' | '/income-streams'
  const getInitialRoute = () => {
    const path = window.location.pathname;
    if (path === '/login' || path === '/auth' || path === '/signin' || path === '/signup') return 'auth';
    if (path === '/dashboard' || path === '/settings' || path === '/income-streams') return 'dashboard';
    return 'landing';
  };

  const [currentRoute, setCurrentRoute] = useState(getInitialRoute);
  const [authMode, setAuthMode] = useState(() => {
    const path = window.location.pathname;
    return path === '/signup' ? 'signup' : 'signin';
  });
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const stored = localStorage.getItem('sts_user');
      const avatar = localStorage.getItem('sts_user_avatar');
      const user = stored ? JSON.parse(stored) : null;
      if (user && avatar) {
        user.avatar = avatar;
      }
      return user;
    } catch {
      return null;
    }
  });

  useEffect(() => {
    const handleAvatarUpdate = () => {
      try {
        const avatar = localStorage.getItem('sts_user_avatar');
        setCurrentUser((prev) => {
          if (!prev) return prev;
          const copy = { ...prev };
          if (avatar) copy.avatar = avatar;
          else delete copy.avatar;
          return copy;
        });
      } catch (e) {
        console.warn(e);
      }
    };
    window.addEventListener('sts_avatar_changed', handleAvatarUpdate);
    return () => window.removeEventListener('sts_avatar_changed', handleAvatarUpdate);
  }, []);

  const navigateTo = (route, mode = 'signin') => {
    setCurrentRoute(route);
    if (mode) setAuthMode(mode);
    let targetPath = '/';
    if (route === 'auth') targetPath = mode === 'signup' ? '/signup' : '/login';
    else if (route === 'dashboard') targetPath = '/dashboard';
    else targetPath = '/';

    if (window.location.pathname !== targetPath) {
      window.history.pushState(null, '', targetPath);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  useEffect(() => {
    const handlePopState = () => {
      const path = window.location.pathname;
      if (path === '/login' || path === '/auth' || path === '/signin') {
        setCurrentRoute('auth');
        setAuthMode('signin');
      } else if (path === '/signup') {
        setCurrentRoute('auth');
        setAuthMode('signup');
      } else if (path === '/dashboard' || path === '/settings' || path === '/income-streams') {
        setCurrentRoute('dashboard');
        if (path === '/settings') {
          setActiveTab('settings');
          setMainNavTab('Expense');
        } else if (path === '/income-streams') {
          setActiveTab('income-streams');
          setMainNavTab('Expense');
        }
      } else {
        setCurrentRoute('landing');
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const handleAuthSuccess = (userData) => {
    setCurrentUser(userData);
    try {
      localStorage.setItem('sts_user', JSON.stringify(userData));
    } catch (e) {
      console.warn(e);
    }
    setActiveTab('dashboard');
    navigateTo('dashboard');
  };

  const handleSignOut = () => {
    try {
      localStorage.removeItem('sts_user');
      localStorage.removeItem('sts_user_avatar');
    } catch (e) {
      console.warn(e);
    }
    setCurrentUser(null);
    window.dispatchEvent(new Event('sts_avatar_changed'));
    navigateTo('auth', 'signin');
  };

  let t = (key, fallback) => fallback || key;
  try {
    const lang = useLanguage();
    if (lang && typeof lang.t === 'function') {
      t = lang.t;
    }
  } catch (err) {
    console.warn('App LanguageContext fallback:', err);
  }

  // Sync theme with document element on mount
  useEffect(() => {
    try {
      const savedTheme = localStorage.getItem('theme') || localStorage.getItem('sts_theme') || 'dark';
      if (savedTheme === 'dark') {
        document.documentElement.classList.add('dark');
        document.body.classList.add('dark');
      } else if (savedTheme === 'light') {
        document.documentElement.classList.remove('dark');
        document.body.classList.remove('dark');
      }
    } catch (e) {
      console.warn(e);
    }
  }, []);

  // Navigation State: 'dashboard' is active by default (or 'settings' if navigating to /settings, 'income-streams' if /income-streams)
  const [activeTab, setActiveTab] = useState(() => {
    if (typeof window !== 'undefined') {
      if (window.location.pathname === '/settings') return 'settings';
      if (window.location.pathname === '/income-streams') return 'income-streams';
    }
    return 'dashboard';
  });
  const [mainNavTab, setMainNavTab] = useState('Expense');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const handleToggleSidebar = () => {
    setIsSidebarOpen((prev) => !prev);
    setIsMobileMenuOpen((prev) => !prev);
  };

  // Payments State (for Direct Payments view)
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [backendHealth, setBackendHealth] = useState(null);

  // Form State
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [status, setStatus] = useState('completed');
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState(null);
  const [formSuccess, setFormSuccess] = useState(null);

  // Filter & Search State
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Check Backend Health
  const checkHealth = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/health`);
      if (res.ok) {
        const data = await res.json();
        setBackendHealth(data);
      } else {
        setBackendHealth({ status: 'offline', error: 'HTTP error' });
      }
    } catch (err) {
      setBackendHealth({ status: 'offline', error: err.message });
    }
  }, []);

  // Fetch Payments from Backend
  const fetchPayments = useCallback(async (isSilent = false) => {
    if (!isSilent) setLoading(true);
    else setRefreshing(true);
    setError(null);

    try {
      const res = await fetch(`${API_BASE_URL}/api/payments`);
      if (!res.ok) {
        throw new Error(`Server returned HTTP ${res.status}: ${res.statusText}`);
      }
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        setPayments(json.data);
      } else if (Array.isArray(json)) {
        setPayments(json);
      } else {
        setPayments([]);
      }
    } catch (err) {
      console.error('Fetch payments error:', err);
      setError(err.message || 'Unable to connect to payment server');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchPayments();
    checkHealth();
    const interval = setInterval(() => {
      checkHealth();
    }, 30000);
    return () => clearInterval(interval);
  }, [fetchPayments, checkHealth]);

  // Handle Submit Form
  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError(null);
    setFormSuccess(null);

    const cleanTitle = title.trim();
    if (!cleanTitle) {
      setFormError('Payment title cannot be empty.');
      return;
    }

    const numericAmount = parseFloat(amount);
    if (isNaN(numericAmount) || numericAmount <= 0) {
      setFormError('Please enter a valid amount greater than ₹0.');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        title: cleanTitle,
        amount: numericAmount,
        status,
      };

      const res = await fetch(`${API_BASE_URL}/api/payments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || (data.errors && data.errors.join(', ')) || 'Failed to submit payment');
      }

      setFormSuccess(`Payment of ${formatINR(numericAmount)} successfully recorded!`);
      setTitle('');
      setAmount('');
      setStatus('completed');

      await fetchPayments(true);

      setTimeout(() => {
        setFormSuccess(null);
      }, 5000);
    } catch (err) {
      console.error('Submit payment error:', err);
      setFormError(err.message || 'Error occurred while saving transaction');
    } finally {
      setSubmitting(false);
    }
  };

  const stats = useMemo(() => {
    const totalCount = payments.length;
    const totalAmount = payments.reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0);
    const completedList = payments.filter((p) => (p.status || '').toLowerCase() === 'completed');
    const completedAmount = completedList.reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0);
    const pendingList = payments.filter((p) => (p.status || '').toLowerCase() === 'pending');
    const pendingAmount = pendingList.reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0);

    return {
      totalCount,
      totalAmount,
      completedCount: completedList.length,
      completedAmount,
      pendingCount: pendingList.length,
      pendingAmount,
    };
  }, [payments]);

  const filteredPayments = useMemo(() => {
    return payments.filter((p) => {
      const matchesSearch =
        p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        String(p.id).includes(searchQuery);
      const matchesStatus =
        statusFilter === 'all' ||
        (p.status || '').toLowerCase() === statusFilter.toLowerCase();
      return matchesSearch && matchesStatus;
    });
  }, [payments, searchQuery, statusFilter]);

  const presetTitles = [
    'Cloud Infrastructure (AWS/Render)',
    'Payment Gateway Fees',
    'PCI-DSS Compliance Audit',
    'Fintech Core Engine API',
  ];

  // 1. Landing Page Route
  if (currentRoute === 'landing') {
    return (
      <LandingPage
        onNavigateToAuth={(mode) => navigateTo('auth', mode)}
        onLaunchDashboard={() => navigateTo('dashboard')}
      />
    );
  }

  // 2. Auth Portal Route (Sign-In & Sign-Up)
  if (currentRoute === 'auth') {
    return (
      <Auth
        initialMode={authMode}
        onAuthSuccess={handleAuthSuccess}
        onBackToLanding={() => navigateTo('landing')}
      />
    );
  }

  // 3. Authenticated Dashboard Route (Unchanged Original Dashboard)
  return (
    <div
      className="h-screen overflow-hidden bg-slate-50 dark:bg-[#070b14] text-slate-900 dark:text-slate-100 flex flex-col font-sans selection:bg-emerald-500 selection:text-white relative transition-colors duration-200"
      style={{ height: '100vh', overflow: 'hidden' }}
    >
      {/* Top Navbar Header Component */}
      <Header
        isMobileMenuOpen={isMobileMenuOpen}
        setIsMobileMenuOpen={setIsMobileMenuOpen}
        activeMainTab={mainNavTab}
        setActiveMainTab={setMainNavTab}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        backendHealth={backendHealth}
        onToggleSidebar={handleToggleSidebar}
        currentUser={currentUser}
        onOpenSettings={() => {
          setMainNavTab('Expense');
          setActiveTab('settings');
        }}
        onOpenSubscription={() => {
          setMainNavTab('Expense');
          setActiveTab('subscription');
        }}
        onSignOut={handleSignOut}
      />

      {/* Main Layout: Sidebar + Content */}
      <div
        className="flex flex-1 relative overflow-hidden"
        style={{ height: 'calc(100vh - 64px)' }}
      >
        {/* Desktop Sidebar (Toggled with isSidebarOpen) */}
        {isSidebarOpen && (
          <div
            className="hidden md:block h-full flex-shrink-0"
            style={{ height: 'calc(100vh - 64px)' }}
          >
            <Sidebar
              activeTab={activeTab}
              setActiveTab={(tab) => {
                setMainNavTab('Expense');
                setActiveTab(tab);
              }}
              backendHealth={backendHealth}
            />
          </div>
        )}

        {/* Mobile Sidebar Overlay */}
        {isMobileMenuOpen && (
          <div className="md:hidden fixed inset-0 z-50 flex animate-fadeIn">
            <div
              className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
              onClick={() => setIsMobileMenuOpen(false)}
            />
            <div className="relative z-10 w-64 max-w-[80vw] bg-[#0d1322] h-full shadow-2xl overflow-y-auto transform transition-transform duration-300 ease-in-out">
              <Sidebar
                activeTab={activeTab}
                setActiveTab={(tab) => {
                  setMainNavTab('Expense');
                  setActiveTab(tab);
                  setIsMobileMenuOpen(false);
                }}
                backendHealth={backendHealth}
              />
            </div>
          </div>
        )}

        {/* Primary Main View Container */}
        <main
          className={`flex-1 overflow-y-auto h-full w-full min-w-0 overflow-x-hidden p-4 md:p-6 ${isSidebarOpen ? 'max-w-7xl' : 'w-full max-w-full'} mx-auto bg-slate-50 dark:bg-[#070b14] text-slate-900 dark:text-slate-100 transition-colors duration-200`}
          style={{
            flex: 1,
            overflowY: 'auto',
            height: 'calc(100vh - 64px)',
          }}
        >
          {mainNavTab === 'Social' ? (
            <WealthAcademyView onReturnToExpense={() => setMainNavTab('Expense')} />
          ) : mainNavTab === 'Wallet' ? (
            <WalletsView currentUser={currentUser} />
          ) : (mainNavTab === 'Subscription' || mainNavTab === 'subscription') ? (
            <SubscriptionPlansView currentUser={currentUser} />
          ) : (
            <>
              {/* TAB 0: DASHBOARD (Active Default) */}
              {activeTab === 'dashboard' && (
                <DashboardView
                  setActiveTab={setActiveTab}
                  onNavigateToSegregation={() => setActiveTab('segregation')}
                />
              )}

              {/* TAB 1: SEGREGATION */}
              {activeTab === 'segregation' && <SegregationView />}

              {/* TAB 2: SPLIT & COLLECT */}
              {(activeTab === 'split_collect' || activeTab === 'split-collect') && <SplitAndCollectPlaceholder />}

              {/* TAB 3: GOAL TARGET */}
              {(activeTab === 'goal_target' || activeTab === 'goal-target') && <GoalTargetView />}

              {/* TAB 4: BILL & REMINDER */}
              {(activeTab === 'bills_reminders' || activeTab === 'bill-reminder' || activeTab === 'bills-reminders') && <BillsAndRemindersView currentUser={currentUser} />}

              {/* TAB: INCOME STREAMS */}
              {(activeTab === 'income-streams' || activeTab === 'income_streams') && (
                <IncomeStreamsView />
              )}

              {/* TAB 5: WALLETS */}
              {activeTab === 'wallets' && (
                <WalletsView currentUser={currentUser} />
              )}

              {/* TAB 6: CONTACT US */}
              {(activeTab === 'contact_us' || activeTab === 'contact') && (
                <ContactUsView currentUser={currentUser} />
              )}

              {/* TAB 7: SETTINGS */}
              {activeTab === 'settings' && (
                <Settings
                  currentUser={currentUser}
                  setCurrentUser={setCurrentUser}
                />
              )}

              {/* TAB 8: SUBSCRIPTION PLANS */}
              {activeTab === 'subscription' && (
                <SubscriptionPlansView currentUser={currentUser} />
              )}

              {/* TAB 6: DIRECT PAYMENTS (Preserved feature) */}
              {activeTab === 'payments' && (
            <div className="space-y-8 animate-fadeIn">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-black text-slate-900">Direct Outflow & Payment Processing</h2>
                  <p className="text-xs text-slate-500">Direct vendor payouts, compliance settlement, and payment dispatch</p>
                </div>
                <button
                  onClick={() => fetchPayments(true)}
                  disabled={refreshing}
                  className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium border border-slate-200 transition"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin text-emerald-600' : ''}`} />
                  <span>Sync Payments</span>
                </button>
              </div>

              {/* Metric Cards Row */}
              <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="rounded-2xl bg-white dark:bg-[#0c1322] border border-slate-200 dark:border-slate-800 p-5 shadow-sm">
                  <p className="text-xs font-medium uppercase text-slate-500 dark:text-slate-400">Total Outflow</p>
                  <h3 className="text-2xl font-black text-slate-900 dark:text-slate-100 mt-1">{formatINR(stats.totalAmount)}</h3>
                  <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-3 font-semibold">
                    {stats.totalCount} transactions
                  </p>
                </div>

                <div className="rounded-2xl bg-white dark:bg-[#0c1322] border border-slate-200 dark:border-slate-800 p-5 shadow-sm">
                  <p className="text-xs font-medium uppercase text-slate-500 dark:text-slate-400">Settled (Completed)</p>
                  <h3 className="text-2xl font-black text-slate-900 dark:text-slate-100 mt-1">{formatINR(stats.completedAmount)}</h3>
                  <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-3 font-semibold">
                    {stats.completedCount} payments
                  </p>
                </div>

                <div className="rounded-2xl bg-white dark:bg-[#0c1322] border border-slate-200 dark:border-slate-800 p-5 shadow-sm">
                  <p className="text-xs font-medium uppercase text-slate-500 dark:text-slate-400">In Pipeline (Pending)</p>
                  <h3 className="text-2xl font-black text-slate-900 dark:text-slate-100 mt-1">{formatINR(stats.pendingAmount)}</h3>
                  <p className="text-xs text-amber-600 dark:text-amber-400 mt-3 font-semibold">
                    {stats.pendingCount} awaiting
                  </p>
                </div>

                <div className="rounded-2xl bg-white dark:bg-[#0c1322] border border-slate-200 dark:border-slate-800 p-5 shadow-sm">
                  <p className="text-xs font-medium uppercase text-slate-500 dark:text-slate-400">Average Ticket</p>
                  <h3 className="text-2xl font-black text-slate-900 dark:text-slate-100 mt-1">
                    {formatINR(stats.totalCount > 0 ? stats.totalAmount / stats.totalCount : 0)}
                  </h3>
                  <p className="text-xs text-cyan-600 dark:text-cyan-400 mt-3 font-semibold">Real-time mean</p>
                </div>
              </section>

              {/* Form & Real-time transactions list */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                <section className="lg:col-span-5 bg-white dark:bg-[#0c1322] rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
                  <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800 mb-6">
                    <div className="flex items-center space-x-2.5">
                      <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                        <PlusCircle className="w-5 h-5" />
                      </div>
                      <div>
                        <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">Record New Payment</h2>
                        <p className="text-xs text-slate-500 dark:text-slate-400">Direct vendor payment entry</p>
                      </div>
                    </div>
                    <span className="text-xs font-mono px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">INR (₹)</span>
                  </div>

                  {formSuccess && (
                    <div className="mb-4 p-3 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs">
                      {formSuccess}
                    </div>
                  )}

                  {formError && (
                    <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-300 text-rose-800 text-xs">
                      {formError}
                    </div>
                  )}

                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                        Payment Title / Description
                      </label>
                      <input
                        type="text"
                        required
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="e.g. AWS Cloud Services"
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:bg-white transition"
                      />
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        {presetTitles.map((preset) => (
                          <button
                            key={preset}
                            type="button"
                            onClick={() => setTitle(preset)}
                            className="text-[10px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded border border-slate-200 hover:bg-slate-200 transition"
                          >
                            {preset}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                        Amount in INR (₹)
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        min="0.01"
                        required
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        placeholder="0.00"
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-900 font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:bg-white transition"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Status</label>
                      <div className="grid grid-cols-3 gap-2">
                        {['completed', 'pending', 'processing'].map((s) => (
                          <button
                            key={s}
                            type="button"
                            onClick={() => setStatus(s)}
                            className={`py-2 rounded-xl text-xs font-semibold capitalize border transition ${
                              status === s
                                ? 'bg-emerald-500/15 border-emerald-500 text-emerald-700 font-bold'
                                : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                            }`}
                          >
                            {s}
                          </button>
                        ))}
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={submitting}
                      className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm transition shadow-md shadow-emerald-600/20 active:scale-95 disabled:opacity-50"
                    >
                      {submitting ? 'Recording...' : 'Authorize Payment'}
                    </button>
                  </form>
                </section>

                <section className="lg:col-span-7 bg-white dark:bg-[#0c1322] rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
                    <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">Direct Payment Records</h3>
                    <div className="flex items-center space-x-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-lg text-xs">
                      {['all', 'completed', 'pending'].map((tab) => (
                        <button
                          key={tab}
                          onClick={() => setStatusFilter(tab)}
                          className={`px-2.5 py-1 rounded capitalize transition ${
                            statusFilter === tab ? 'bg-white dark:bg-[#070b14] text-slate-900 dark:text-slate-100 font-bold shadow-sm' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                          }`}
                        >
                          {tab}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2 max-h-[460px] overflow-y-auto">
                    {filteredPayments.map((item) => (
                      <div
                        key={item.id}
                        className="p-3.5 rounded-xl bg-slate-50 dark:bg-[#080d19] border border-slate-200 dark:border-slate-800 flex items-center justify-between hover:bg-slate-100/70 dark:hover:bg-slate-800/40 transition"
                      >
                        <div>
                          <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">{item.title}</p>
                          <p className="text-xs text-slate-500 dark:text-slate-400">{formatDate(item.created_at)}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-bold font-mono text-emerald-600 dark:text-emerald-400">{formatINR(item.amount)}</p>
                          <span className="text-[10px] uppercase font-semibold text-slate-500 dark:text-slate-400">{item.status}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              </div>
            </div>
          )}
          </>
        )}
        </main>
      </div>

    </div>
  );
}
