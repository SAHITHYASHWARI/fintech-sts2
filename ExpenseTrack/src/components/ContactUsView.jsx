import React, { useState } from 'react';
import {
  Headset,
  Mail,
  Phone,
  User,
  MessageSquare,
  Send,
  CheckCircle2,
  Clock,
  ShieldCheck,
  AlertCircle,
  Sparkles,
  Building2,
  RefreshCw,
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export default function ContactUsView({ currentUser }) {
  let t = (key, fallback) => fallback || key;
  try {
    const lang = useLanguage();
    if (lang && typeof lang.t === 'function') {
      t = lang.t;
    }
  } catch (err) {
    console.warn('ContactUsView LanguageContext fallback:', err);
  }

  // Default state: empty strings without prefilling
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    description: '',
  });

  const [formErrors, setFormErrors] = useState({});
  const [status, setStatus] = useState('idle'); // 'idle' | 'loading' | 'sent'
  const [ticketId, setTicketId] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (formErrors[field]) {
      setFormErrors((prev) => ({ ...prev, [field]: null }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const errors = {};

    if (!formData.name.trim()) {
      errors.name = 'Please provide your full name';
    }
    if (!formData.phone.trim()) {
      errors.phone = 'Please provide a contact phone number';
    }
    if (!formData.email.trim() || !formData.email.includes('@')) {
      errors.email = 'Please provide a valid email address';
    }
    if (!formData.description.trim() || formData.description.trim().length < 10) {
      errors.description = 'Please describe your inquiry in detail (minimum 10 characters)';
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    setStatus('loading');

    // Simulate reliable dispatch to support queue
    setTimeout(() => {
      const generatedTicketId = `STS-${Math.floor(100000 + Math.random() * 900000)}`;
      setTicketId(generatedTicketId);
      setStatus('sent');
      setToastMessage(`Inquiry submitted successfully! Reference: #${generatedTicketId}`);
      setTimeout(() => setToastMessage(null), 5000);
    }, 1200);
  };

  const handleReset = () => {
    setFormData({
      name: '',
      phone: '',
      email: '',
      description: '',
    });
    setFormErrors({});
    setStatus('idle');
    setTicketId(null);
  };

  return (
    <div className="space-y-6 sm:space-y-8 animate-fadeIn pb-16">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 p-4 rounded-xl bg-emerald-950/90 border border-emerald-500/40 text-emerald-200 text-xs shadow-2xl flex items-center space-x-3 backdrop-blur-md animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
          <span className="font-semibold">{toastMessage}</span>
        </div>
      )}

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            {t('contact', 'Contact')}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Connect directly with STS FINTECH operations, engineering dispatch, and priority customer care.
          </p>
        </div>

        {/* Priority SLA Badge */}
        <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-xs font-bold shadow-sm self-start sm:self-auto">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse flex-shrink-0" />
          <span>STS Fintech 24/7 Priority Support • Typical response within 15 mins</span>
        </div>
      </div>

      {/* Main Grid: Form Container + Side Widgets */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* ========================================================================= */}
        {/* LEFT / CENTER: Inquiry Form Card                                          */}
        {/* ========================================================================= */}
        <div className="lg:col-span-2 rounded-2xl bg-white dark:bg-[#0c1322] border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-sm transition-all duration-200 relative overflow-hidden">
          {status === 'sent' ? (
            /* Sent / Feedback State */
            <div className="py-8 sm:py-12 text-center space-y-4 animate-fadeIn">
              <div className="w-16 h-16 rounded-2xl bg-emerald-500/15 text-emerald-500 border border-emerald-500/30 flex items-center justify-center mx-auto shadow-md">
                <CheckCircle2 className="w-8 h-8" />
              </div>

              <div>
                <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                  Inquiry Received!
                </h3>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-md mx-auto">
                  Thank you for contacting us. Your priority ticket has been logged into our core dispatch system.
                </p>
              </div>

              <div className="inline-block bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-xl px-5 py-3 text-xs">
                <span className="text-slate-400 block text-[11px] uppercase font-semibold">
                  Ticket Reference ID
                </span>
                <span className="font-mono text-emerald-600 dark:text-emerald-400 font-bold text-sm">
                  #{ticketId}
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 max-w-md mx-auto text-xs text-emerald-700 dark:text-emerald-300 flex items-center space-x-2">
                <Clock className="w-4 h-4 flex-shrink-0" />
                <span>Our fintech desk typically responds within 15 minutes to your registered email.</span>
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={handleReset}
                  className="px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs transition"
                >
                  Submit Another Inquiry
                </button>
              </div>
            </div>
          ) : (
            /* Standard Form State */
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="pb-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                    Submit a Support Ticket / Inquiry
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Fill in the details below and an engineer or support lead will review your case.
                  </p>
                </div>
                <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/60 hidden sm:block">
                  <Headset className="w-5 h-5" />
                </div>
              </div>

              {/* Grid: Name & Phone Number */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Field 1: Name */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                    Your Name <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="enter your name"
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl text-xs bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-emerald-500 transition"
                    />
                  </div>
                  {formErrors.name && (
                    <p className="text-[11px] text-rose-500 mt-1 flex items-center space-x-1">
                      <AlertCircle className="w-3 h-3" />
                      <span>{formErrors.name}</span>
                    </p>
                  )}
                </div>

                {/* Field 2: Phone Number */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                    Phone Number <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="tel"
                      placeholder="enter your number"
                      value={formData.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl text-xs bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-emerald-500 transition"
                    />
                  </div>
                  {formErrors.phone && (
                    <p className="text-[11px] text-rose-500 mt-1 flex items-center space-x-1">
                      <AlertCircle className="w-3 h-3" />
                      <span>{formErrors.phone}</span>
                    </p>
                  )}
                </div>
              </div>

              {/* Field 3: Gmail / Email */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                  Gmail / Email Address <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    placeholder="enter your mail"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl text-xs bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-emerald-500 transition"
                  />
                </div>
                {formErrors.email && (
                  <p className="text-[11px] text-rose-500 mt-1 flex items-center space-x-1">
                    <AlertCircle className="w-3 h-3" />
                    <span>{formErrors.email}</span>
                  </p>
                )}
              </div>

              {/* Field 4: Description */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                  Description / Issue Details <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows={5}
                  placeholder="Describe your problem here... (Please include transaction IDs or module names if applicable)"
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  className="w-full p-3.5 rounded-xl text-xs bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-emerald-500 transition resize-y"
                />
                {formErrors.description && (
                  <p className="text-[11px] text-rose-500 mt-1 flex items-center space-x-1">
                    <AlertCircle className="w-3 h-3" />
                    <span>{formErrors.description}</span>
                  </p>
                )}
              </div>

              {/* Primary CTA Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={status === 'loading'}
                  className="w-full sm:w-auto min-w-[200px] py-3.5 px-8 rounded-xl font-bold text-xs sm:text-sm text-white bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-600 hover:from-emerald-500 hover:to-teal-500 shadow-md shadow-emerald-950/20 hover:shadow-lg transition-all duration-200 flex items-center justify-center space-x-2 active:scale-98 disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer"
                >
                  {status === 'loading' ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Submitting Inquiry...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>Submit Inquiry</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>

        {/* ========================================================================= */}
        {/* RIGHT: Side Widget / Priority Support Channels                            */}
        {/* ========================================================================= */}
        <div className="space-y-4">
          {/* Card 1: 24/7 Priority Support Overview */}
          <div className="rounded-2xl bg-white dark:bg-[#0c1322] border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-4">
            <div className="flex items-center space-x-3">
              <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                  STS Fintech Priority SLA
                </h4>
                <p className="text-[11px] text-slate-400">
                  Institutional grade customer service
                </p>
              </div>
            </div>

            <div className="space-y-3 pt-2 text-xs">
              <div className="flex items-start space-x-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800">
                <Mail className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                <div>
                  <span className="font-bold text-slate-800 dark:text-slate-200 block">
                    Direct Email Support
                  </span>
                  <a
                    href="mailto:support@stsfintech.com"
                    className="text-emerald-600 dark:text-emerald-400 hover:underline text-[11px] font-mono"
                  >
                    support@stsfintech.com
                  </a>
                </div>
              </div>

              <div className="flex items-start space-x-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800">
                <Clock className="w-4 h-4 text-teal-500 mt-0.5 flex-shrink-0" />
                <div>
                  <span className="font-bold text-slate-800 dark:text-slate-200 block">
                    Response Speed SLA
                  </span>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400">
                    &lt; 15 Minutes guaranteed for active settlement issues
                  </span>
                </div>
              </div>

              <div className="flex items-start space-x-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800">
                <Building2 className="w-4 h-4 text-cyan-500 mt-0.5 flex-shrink-0" />
                <div>
                  <span className="font-bold text-slate-800 dark:text-slate-200 block">
                    Corporate Engineering HQ
                  </span>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400">
                    Bengaluru Tech Park, Karnataka, India
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Card 2: Live Operational Status */}
          <div className="rounded-2xl bg-gradient-to-br from-emerald-500/10 via-teal-500/5 to-transparent border border-emerald-500/20 p-5 shadow-sm space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center space-x-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                <span>Desk Status: Operational</span>
              </span>
              <span className="text-[10px] font-mono text-slate-400">24/7/365</span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              All payment rails, OCR parsing services, and dispute escalation queues are operating with optimal response metrics.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
