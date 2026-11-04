import React from 'react';
import {
  LayoutDashboard,
  Layers,
  Users2,
  Target,
  Bell,
  Headset,
  Settings as SettingsIcon,
  TrendingUp,
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export default function Sidebar({ activeTab, setActiveTab, backendHealth }) {
  let t = (key, fallback) => fallback || key;
  try {
    const lang = useLanguage();
    if (lang && typeof lang.t === 'function') {
      t = lang.t;
    }
  } catch (err) {
    console.warn('Sidebar LanguageContext fallback:', err);
  }

  const primaryNavItems = [
    {
      id: 'dashboard',
      label: t('dashboard', 'Dashboard'),
      icon: LayoutDashboard,
    },
    {
      id: 'segregation',
      label: t('segregation', 'Segregation'),
      icon: Layers,
    },
    {
      id: 'split_collect',
      label: t('split_collect', 'Split & Collect'),
      icon: Users2,
    },
    {
      id: 'goal_target',
      label: t('goal_target', 'Goal Target'),
      icon: Target,
    },
    {
      id: 'bills_reminders',
      label: t('bills_reminders', 'Bill & Reminder'),
      icon: Bell,
    },
    {
      id: 'income-streams',
      label: t('income_streams', 'Income Streams'),
      icon: TrendingUp,
    },
  ];

  return (
    <aside
      className="w-64 flex-shrink-0 bg-[#0d1322] border-r border-slate-800/80 flex flex-col justify-between overflow-y-auto"
      style={{ height: 'calc(100vh - 64px)' }}
    >
      {/* Primary Navigation Links Grouped at Top */}
      <div className="p-3.5 space-y-1.5 flex-1">
        {primaryNavItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            activeTab === item.id ||
            (item.id === 'income-streams' && (activeTab === 'income-streams' || activeTab === 'income_streams')) ||
            (item.id === 'goal_target' && (activeTab === 'goal-target' || activeTab === 'goal_target')) ||
            (item.id === 'bills_reminders' && (activeTab === 'bill-reminder' || activeTab === 'bills-reminders')) ||
            (item.id === 'split_collect' && (activeTab === 'split-collect' || activeTab === 'split_collect'));

          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full text-left px-3.5 py-3 rounded-xl transition flex items-center space-x-3 group cursor-pointer ${
                isActive
                  ? 'bg-[#0f2425] text-emerald-400 border border-emerald-500/30 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 border border-transparent'
              }`}
            >
              <div
                className={`p-2 rounded-lg transition ${
                  isActive
                    ? 'bg-emerald-500/20 text-emerald-400'
                    : 'bg-slate-900 text-slate-400 group-hover:text-slate-200'
                }`}
              >
                <Icon className="w-4 h-4" />
              </div>
              <span className={`text-xs font-semibold ${isActive ? 'text-emerald-400 font-bold' : 'text-slate-300'}`}>
                {item.label}
              </span>
            </button>
          );
        })}
      </div>

      {/* Bottom Pinned Links: Contact Us & Settings */}
      <div className="p-3.5 mt-auto pb-6 space-y-1.5 border-t border-slate-800/80">
        <button
          type="button"
          onClick={() => setActiveTab('contact_us')}
          className={`w-full text-left px-3.5 py-3 rounded-xl transition flex items-center space-x-3 group cursor-pointer ${
            activeTab === 'contact_us' || activeTab === 'contact'
              ? 'bg-[#0f2425] text-emerald-400 border border-emerald-500/30 shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 border border-transparent'
          }`}
        >
          <div
            className={`p-2 rounded-lg transition ${
              activeTab === 'contact_us' || activeTab === 'contact'
                ? 'bg-emerald-500/20 text-emerald-400'
                : 'bg-slate-900 text-slate-400 group-hover:text-slate-200'
            }`}
          >
            <Headset className="w-4 h-4" />
          </div>
          <span
            className={`text-xs font-semibold ${
              activeTab === 'contact_us' || activeTab === 'contact' ? 'text-emerald-400 font-bold' : 'text-slate-300'
            }`}
          >
            {t('contact_us', 'Contact Us')}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('settings')}
          className={`w-full text-left px-3.5 py-3 rounded-xl transition flex items-center space-x-3 group cursor-pointer ${
            activeTab === 'settings'
              ? 'bg-[#0f2425] text-emerald-400 border border-emerald-500/30 shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 border border-transparent'
          }`}
        >
          <div
            className={`p-2 rounded-lg transition ${
              activeTab === 'settings'
                ? 'bg-emerald-500/20 text-emerald-400'
                : 'bg-slate-900 text-slate-400 group-hover:text-slate-200'
            }`}
          >
            <SettingsIcon className="w-4 h-4" />
          </div>
          <span
            className={`text-xs font-semibold ${
              activeTab === 'settings' ? 'text-emerald-400 font-bold' : 'text-slate-300'
            }`}
          >
            {t('settings', 'Settings')}
          </span>
        </button>
      </div>
    </aside>
  );
}
