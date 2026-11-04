import React, { useState, useEffect } from 'react';
import {
  Crown,
  Sparkles,
  Gem,
  CheckCircle2,
  Landmark,
  QrCode,
  ShieldCheck,
  X,
  ArrowRight,
  Zap,
  Check,
  Building2,
  Clock,
  Lock,
  Layers,
  CreditCard,
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export default function SubscriptionPlansView({ currentUser }) {
  let t = (key, fallback) => fallback || key;
  try {
    const lang = useLanguage();
    if (lang && typeof lang.t === 'function') {
      t = lang.t;
    }
  } catch (err) {
    console.warn('SubscriptionPlansView LanguageContext fallback:', err);
  }

  // Active Plan State (persisted in localStorage)
  const [activePlan, setActivePlan] = useState(() => {
    try {
      const stored = localStorage.getItem('sts_active_subscription');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (!parsed.activatedAt) {
          parsed.activatedAt = new Date().toISOString();
          localStorage.setItem('sts_active_subscription', JSON.stringify(parsed));
        }
        return parsed?.name || 'Gold Plan';
      } else {
        const defaultSub = {
          id: 'gold',
          name: 'Gold Plan',
          price: '₹1,299',
          method: 'Net Banking',
          activatedAt: new Date().toISOString(),
        };
        localStorage.setItem('sts_active_subscription', JSON.stringify(defaultSub));
      }
    } catch (e) {
      console.warn('Error reading sts_active_subscription:', e);
    }
    return 'Gold Plan';
  });

  // Calculate remaining days out of 30 days based on 24-hour intervals
  const calculateDaysLeft = () => {
    try {
      const stored = localStorage.getItem('sts_active_subscription');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed?.activatedAt) {
          const activatedTime = new Date(parsed.activatedAt).getTime();
          if (!isNaN(activatedTime)) {
            const diffMs = Date.now() - activatedTime;
            const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
            return Math.max(0, 30 - diffDays);
          }
        }
      }
    } catch (e) {
      console.warn('Error calculating days left:', e);
    }
    return 30;
  };

  const [daysLeft, setDaysLeft] = useState(calculateDaysLeft);

  // Sync state if subscription changes elsewhere
  useEffect(() => {
    const handleSubChange = () => {
      try {
        const stored = localStorage.getItem('sts_active_subscription');
        if (stored) {
          const parsed = JSON.parse(stored);
          if (parsed?.name) {
            setActivePlan(parsed.name);
          }
        }
      } catch (e) {
        console.warn(e);
      }
      setDaysLeft(calculateDaysLeft());
    };

    window.addEventListener('sts_subscription_changed', handleSubChange);
    window.addEventListener('storage', handleSubChange);
    return () => {
      window.removeEventListener('sts_subscription_changed', handleSubChange);
      window.removeEventListener('storage', handleSubChange);
    };
  }, []);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);

  const plans = [
    {
      id: 'silver',
      name: 'Silver Plan',
      badge: 'Starter',
      price: '₹499',
      period: '/year',
      icon: Gem,
      accentBorder: 'border-slate-200 dark:border-slate-800 hover:border-slate-400 dark:hover:border-slate-700',
      iconBg: 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300',
      buttonVariant: 'secondary',
      popular: false,
      features: [
        'Basic statement parser (PDF & CSV)',
        'Single bank wallet synchronization',
        'Standard email support (< 24h SLA)',
        'Income & expense segregation ledger',
        'Direct settlement balance calculation',
      ],
    },
    {
      id: 'gold',
      name: 'Gold Plan',
      badge: 'Popular',
      price: '₹1,299',
      period: '/year',
      icon: Crown,
      accentBorder: 'border-emerald-500/80 dark:border-emerald-500/70 shadow-lg shadow-emerald-500/10 ring-1 ring-emerald-500/30',
      iconBg: 'bg-emerald-50 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400',
      buttonVariant: 'primary',
      popular: true,
      features: [
        'Unlimited bank parsing & statement OCR',
        'Multi-wallets & unlimited bank accounts',
        'Split automation & shared group ledgers',
        'Priority 24/7 support (< 15 mins SLA)',
        'Goal target milestones & lockup escrow',
        'Automated bill calendar & due alerts',
      ],
    },
    {
      id: 'elite',
      name: 'Elite Plan',
      badge: 'Enterprise',
      price: '₹2,999',
      period: '/year',
      icon: Sparkles,
      accentBorder: 'border-slate-200 dark:border-slate-800 hover:border-teal-500/60 dark:hover:border-teal-500/50',
      iconBg: 'bg-teal-50 dark:bg-teal-950/80 text-teal-600 dark:text-teal-400',
      buttonVariant: 'secondary',
      popular: false,
      features: [
        'Full fintech suite & institutional segregation',
        'Developer API access & custom webhooks',
        'Dedicated account manager & live concierge',
        'PCI-DSS compliance audit export reports',
        'Direct disbursement settlement dispatch',
        'Multi-entity company ledger balancing',
      ],
    },
  ];

  const handleOpenPlanModal = (plan) => {
    setSelectedPlan(plan);
    setPaymentSuccess(false);
    setSelectedMethod(null);
    setIsModalOpen(true);
  };

  const handleActivatePayment = (methodName) => {
    if (!selectedPlan) return;
    setSelectedMethod(methodName);

    const activatedAt = new Date().toISOString();
    const subData = {
      id: selectedPlan.id,
      name: selectedPlan.name,
      price: selectedPlan.price,
      method: methodName,
      activatedAt: activatedAt,
    };

    try {
      localStorage.setItem('sts_active_subscription', JSON.stringify(subData));
      window.dispatchEvent(new Event('sts_subscription_changed'));
    } catch (e) {
      console.warn('Error saving subscription:', e);
    }

    setActivePlan(selectedPlan.name);
    setDaysLeft(30);
    setPaymentSuccess(true);
    setToastMessage(`Active Plan: ${selectedPlan.name}`);

    // Auto-dismiss confirmation after 3 seconds
    setTimeout(() => {
      setIsModalOpen(false);
      setPaymentSuccess(false);
    }, 2800);
  };

  return (
    <div className="space-y-8 animate-fadeIn pb-16">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 p-4 rounded-xl bg-emerald-950/90 border border-emerald-500/40 text-emerald-200 text-xs shadow-2xl flex items-center space-x-3 backdrop-blur-md animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
          <span className="font-semibold">{toastMessage}</span>
        </div>
      )}

      {/* Header bar matching clean STS FINTECH aesthetic */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
            Subscription plan
          </h1>
        </div>

        {/* Current Active Plan Badge */}
        {activePlan && (
          <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs shadow-sm self-start sm:self-auto">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-bold text-emerald-600 dark:text-emerald-400">
              Active Plan: {activePlan} ({daysLeft} days left)
            </span>
          </div>
        )}
      </div>

      {/* 3 Tiers Side-by-Side Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 items-stretch">
        {plans.map((plan) => {
          const Icon = plan.icon;
          const isCurrentActive = activePlan === plan.name;

          return (
            <div
              key={plan.id}
              className={`rounded-2xl bg-white dark:bg-[#0c1322] border p-6 sm:p-7 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl flex flex-col justify-between relative overflow-hidden group ${plan.accentBorder}`}
            >
              {/* Subtle Ambient Glow for popular tier */}
              {plan.popular && (
                <div className="absolute top-0 right-0 w-44 h-44 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
              )}

              <div>
                {/* Popular / Active Badge */}
                <div className="flex items-center justify-between gap-2 mb-4">
                  <div className={`p-2.5 rounded-xl ${plan.iconBg} border border-current/10 shadow-inner`}>
                    <Icon className="w-5 h-5" />
                  </div>

                  <div className="flex items-center space-x-1.5">
                    {plan.popular && (
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 shadow-sm shadow-emerald-500/20">
                        Popular
                      </span>
                    )}
                    {isCurrentActive && (
                      <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/40">
                        <Check className="w-3 h-3 stroke-[3]" />
                        <span>Active</span>
                      </span>
                    )}
                  </div>
                </div>

                {/* Plan Title */}
                <div>
                  <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">
                    {plan.name}
                  </h3>
                </div>

                {/* Price Display */}
                <div className="mt-5 pb-5 border-b border-slate-100 dark:border-slate-800">
                  <div className="flex items-baseline space-x-1">
                    <span className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
                      {plan.price}
                    </span>
                    <span className="text-xs font-semibold text-slate-400">
                      {plan.period}
                    </span>
                  </div>
                </div>

                {/* Features List */}
                <div className="mt-5 space-y-2.5">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                    Included Capabilities
                  </p>
                  <ul className="space-y-2.5 text-xs text-slate-700 dark:text-slate-300">
                    {plan.features.map((feat, idx) => (
                      <li key={idx} className="flex items-start space-x-2.5">
                        <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                        <span className="leading-snug">{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Action Button: Disabled "Active plan" for active plan, or "Upgrade here" for remaining tiers */}
              <div className="mt-8 pt-5 border-t border-slate-100 dark:border-slate-800">
                {isCurrentActive ? (
                  <button
                    type="button"
                    disabled
                    className="w-full py-3 px-5 rounded-xl text-xs sm:text-sm font-bold bg-slate-100 dark:bg-slate-800/80 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 flex items-center justify-center space-x-2 cursor-not-allowed opacity-90 shadow-sm"
                  >
                    <Check className="w-4 h-4 stroke-[2.5]" />
                    <span>Active plan</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => handleOpenPlanModal(plan)}
                    className={`w-full py-3 px-5 rounded-xl text-xs sm:text-sm font-bold transition-all duration-200 flex items-center justify-center space-x-2 active:scale-98 cursor-pointer shadow-md ${
                      plan.popular
                        ? 'bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-emerald-950/20 hover:shadow-lg'
                        : 'bg-slate-900 hover:bg-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700 text-white border border-slate-700/60'
                    }`}
                  >
                    <span>Upgrade here</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* ========================================================================= */}
      {/* PAYMENT MODAL / POPUP (Net Banking & UPI Options)                         */}
      {/* ========================================================================= */}
      {isModalOpen && selectedPlan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/75 backdrop-blur-sm transition-opacity"
            onClick={() => !paymentSuccess && setIsModalOpen(false)}
          />

          {/* Modal Container */}
          <div className="relative w-full max-w-lg rounded-2xl bg-white dark:bg-[#0d1322] border border-slate-200 dark:border-slate-800 shadow-2xl p-6 sm:p-7 z-10 animate-fadeIn max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center space-x-3">
                <div className="p-2.5 rounded-xl bg-emerald-500/15 text-emerald-500 border border-emerald-500/30">
                  <Crown className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-900 dark:text-white">
                    Confirm Plan Activation
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Select your preferred payment channel to activate {selectedPlan.name}
                  </p>
                </div>
              </div>

              {!paymentSuccess && (
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>

            {/* Modal Body */}
            {paymentSuccess ? (
              /* Immediate Confirmation Screen */
              <div className="py-8 text-center space-y-4 animate-fadeIn">
                <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-500 border-2 border-emerald-500/40 flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/20 animate-bounce">
                  <CheckCircle2 className="w-9 h-9" />
                </div>

                <div>
                  <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 text-xs font-black uppercase tracking-wider mb-2">
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                    <span>Plan Activated</span>
                  </div>
                  <h4 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                    Active Plan: {selectedPlan.name}
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
                    Payment processed via {selectedMethod}. All {selectedPlan.name} features and API limits are now fully live on your ledger.
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 text-xs font-mono text-slate-600 dark:text-slate-300 max-w-xs mx-auto">
                  <span>Billing Cycle: Yearly • {selectedPlan.price}</span>
                </div>
              </div>
            ) : (
              /* Payment Methods Selection */
              <div className="mt-5 space-y-5">
                {/* Plan Summary Card */}
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                      Selected Tier
                    </span>
                    <span className="text-base font-black text-slate-900 dark:text-white">
                      {selectedPlan.name}
                    </span>
                    <span className="text-xs text-emerald-600 dark:text-emerald-400 block font-semibold">
                      Full access granted immediately
                    </span>
                  </div>

                  <div className="text-right">
                    <span className="text-xl font-black text-slate-900 dark:text-white">
                      {selectedPlan.price}
                    </span>
                    <span className="text-xs text-slate-400 block">{selectedPlan.period}</span>
                  </div>
                </div>

                {/* Two Primary Payment Options */}
                <div className="space-y-3">
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                    Choose Payment Method
                  </p>

                  {/* Option 1: Net Banking */}
                  <button
                    type="button"
                    onClick={() => handleActivatePayment('Net Banking')}
                    className="w-full p-4 rounded-xl text-left bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 hover:border-emerald-500/60 dark:hover:border-emerald-500/50 hover:bg-emerald-50/20 dark:hover:bg-slate-850 hover:shadow-md transition-all duration-200 cursor-pointer flex items-center justify-between group"
                  >
                    <div className="flex items-center space-x-3.5">
                      <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 group-hover:scale-105 transition-transform">
                        <Landmark className="w-5 h-5" />
                      </div>
                      <div>
                        <span className="text-sm font-bold text-slate-900 dark:text-white block group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                          Net Banking
                        </span>
                        <span className="text-[11px] text-slate-500 dark:text-slate-400 block">
                          HDFC, ICICI, SBI, Axis, Kotak & all major Indian banks
                        </span>
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-500 group-hover:translate-x-1 transition-all" />
                  </button>

                  {/* Option 2: UPI */}
                  <button
                    type="button"
                    onClick={() => handleActivatePayment('UPI')}
                    className="w-full p-4 rounded-xl text-left bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 hover:border-emerald-500/60 dark:hover:border-emerald-500/50 hover:bg-emerald-50/20 dark:hover:bg-slate-850 hover:shadow-md transition-all duration-200 cursor-pointer flex items-center justify-between group"
                  >
                    <div className="flex items-center space-x-3.5">
                      <div className="p-2.5 rounded-xl bg-teal-500/10 text-teal-600 dark:text-teal-400 border border-teal-500/20 group-hover:scale-105 transition-transform">
                        <QrCode className="w-5 h-5" />
                      </div>
                      <div>
                        <span className="text-sm font-bold text-slate-900 dark:text-white block group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors">
                          UPI
                        </span>
                        <span className="text-[11px] text-slate-500 dark:text-slate-400 block">
                          Instant UPI QR, Google Pay, PhonePe, Paytm & BHIM
                        </span>
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-teal-500 group-hover:translate-x-1 transition-all" />
                  </button>
                </div>

                {/* Security Guarantee */}
                <div className="pt-2 flex items-center justify-center space-x-1.5 text-[11px] text-slate-400">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                  <span>256-Bit Bank Grade Encryption • 100% Secure Checkout</span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
