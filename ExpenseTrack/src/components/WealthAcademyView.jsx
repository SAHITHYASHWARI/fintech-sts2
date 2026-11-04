import React, { useState } from 'react';
import {
  BookOpen,
  Award,
  MessageSquare,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  Clock,
  Sparkles,
  ArrowRight,
  TrendingUp,
  Landmark,
  Building,
  Layers,
  ArrowLeft,
  Search,
  ExternalLink,
  ShieldCheck,
  Check,
} from 'lucide-react';

const CATEGORIES = [
  'All Courses',
  'Crypto & Bitcoin',
  'Mutual Funds & Stocks',
  'Real Estate',
  'Personal Finance',
];

const INITIAL_COURSES = [
  {
    id: 'crypto_btc',
    category: 'Crypto & Bitcoin',
    badge: 'Crypto & Blockchain',
    badgeColor: 'bg-amber-50 text-amber-800 border-amber-200',
    title: 'Bitcoin & Digital Asset Masterclass',
    description:
      'Understand Bitcoin fundamentals, blockchain consensus, hardware wallet self-custody, and navigating market cycles.',
    modules: [
      {
        id: 'm1',
        title: 'Module 1: What is Bitcoin & How the Blockchain Works',
        lessons: '5 lessons • Proof-of-Work, Nodes & Mining',
        completed: true,
      },
      {
        id: 'm2',
        title: 'Module 2: Setting up Cold Wallets & Securing Keys',
        lessons: '6 lessons • Air-gapped Devices & Seed Phrase Storage',
        completed: true,
      },
      {
        id: 'm3',
        title: 'Module 3: On-chain Analysis & Risk Management',
        lessons: '4 lessons • Mempool, SOPR & Cycle Indicators',
        completed: false,
      },
      {
        id: 'm4',
        title: 'Module 4: Global Taxation & Sovereign Regulations',
        lessons: '3 lessons • Compliance, TDS & Ledger Records',
        completed: false,
      },
    ],
    meta: '4 Modules • 18 Lessons • Beginner to Advanced',
    progress: 50,
  },
  {
    id: 'equity_demat',
    category: 'Mutual Funds & Stocks',
    badge: 'Equity & Wealth',
    badgeColor: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    title: 'Mutual Funds, SIPs & Demat Essentials',
    description:
      'Step-by-step roadmap to opening a verified Demat account, picking index vs. active mutual funds, and automated SIP wealth compounding.',
    modules: [
      {
        id: 'm1',
        title: 'Module 1: Demat Account Setup & KYC Step-by-Step',
        lessons: '3 lessons • Depository Participants (NSDL/CDSL)',
        completed: false,
      },
      {
        id: 'm2',
        title: 'Module 2: Large-cap vs. Mid-cap vs. Direct Mutual Funds',
        lessons: '5 lessons • Expense Ratio, Alpha & Beta analysis',
        completed: false,
      },
      {
        id: 'm3',
        title: 'Module 3: Portfolio Allocation & Tax Harvesting Strategies',
        lessons: '4 lessons • Long-Term Capital Gains & Stepped SIPs',
        completed: false,
      },
    ],
    meta: '3 Modules • 12 Lessons • Beginner',
    progress: 0,
  },
  {
    id: 'real_estate_reits',
    category: 'Real Estate',
    badge: 'Property & Assets',
    badgeColor: 'bg-cyan-50 text-cyan-800 border-cyan-200',
    title: 'Real Estate & REIT Investment Framework',
    description:
      'Learn commercial vs. residential real estate investing, legal due diligence, rental yields, and investing through REITs with lower capital.',
    modules: [
      {
        id: 'm1',
        title: 'Module 1: Land Title Verification & Legal Due Diligence',
        lessons: '3 lessons • RERA registration, Encumbrance & Patta',
        completed: false,
      },
      {
        id: 'm2',
        title: 'Module 2: Calculating Rental Yields & ROI Cashflows',
        lessons: '4 lessons • Capital appreciation vs. gross yield',
        completed: false,
      },
      {
        id: 'm3',
        title: 'Module 3: REITs: Fractional Real Estate Investment',
        lessons: '3 lessons • Institutional grade commercial assets',
        completed: false,
      },
    ],
    meta: '3 Modules • 10 Lessons • Intermediate',
    progress: 0,
  },
];

const DISCUSSIONS = [
  {
    id: 1,
    title: 'HDFC Sky vs Zerodha Coin: Which is better for direct mutual fund SIPs?',
    author: 'Arun K.',
    category: 'Mutual Funds',
    replies: 28,
    time: '2h ago',
  },
  {
    id: 2,
    title: 'Best hardware wallet backup method for seed phrases? Coldcard or Trezor?',
    author: 'Vikram S.',
    category: 'Crypto',
    replies: 42,
    time: '4h ago',
  },
  {
    id: 3,
    title: 'Embassy Office Parks REIT dividend yields post Q2 distribution announcement',
    author: 'Neha P.',
    category: 'Real Estate',
    replies: 19,
    time: '1d ago',
  },
];

export default function WealthAcademyView({ onReturnToExpense }) {
  const [activeCategory, setActiveCategory] = useState('All Courses');
  const [courses, setCourses] = useState(INITIAL_COURSES);
  const [expandedCourseId, setExpandedCourseId] = useState('crypto_btc');
  const [selectedModule, setSelectedModule] = useState(null);

  // Toggle module completion
  const handleToggleModule = (courseId, moduleId) => {
    setCourses((prev) =>
      prev.map((course) => {
        if (course.id !== courseId) return course;
        const updatedModules = course.modules.map((m) =>
          m.id === moduleId ? { ...m, completed: !m.completed } : m
        );
        const completedCount = updatedModules.filter((m) => m.completed).length;
        const progress = Math.round((completedCount / updatedModules.length) * 100);
        return {
          ...course,
          modules: updatedModules,
          progress,
        };
      })
    );
  };

  // Filter courses by selected category tab
  const filteredCourses = courses.filter((c) => {
    if (activeCategory === 'All Courses') return true;
    return c.category === activeCategory;
  });

  // Calculate overall progress across all modules
  const allModules = courses.flatMap((c) => c.modules);
  const totalModulesCount = allModules.length;
  const completedModulesCount = allModules.filter((m) => m.completed).length;
  const overallPercentage = Math.round((completedModulesCount / totalModulesCount) * 100);

  return (
    <div className="space-y-7 animate-fadeIn">
      {/* ========================================================= */}
      {/* 1. PAGE HEADER & CATEGORIES                               */}
      {/* ========================================================= */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
            STS Wealth Academy
          </h2>
        </div>

        {onReturnToExpense && (
          <button
            onClick={onReturnToExpense}
            className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold border border-slate-200 dark:border-slate-700 transition w-fit cursor-pointer active:scale-95 self-start sm:self-auto"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Return to Expense Dashboard</span>
          </button>
        )}
      </div>

      {/* Category Filter Tabs */}
      <div className="flex items-center space-x-2 border-b border-slate-200 dark:border-slate-800 pb-3 overflow-x-auto">
        {CATEGORIES.map((cat) => {
          const isActive = activeCategory === cat;
          return (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center space-x-1.5 cursor-pointer whitespace-nowrap ${
                isActive
                  ? 'bg-[#0d5236] text-white shadow-sm'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              <span>{cat}</span>
            </button>
          );
        })}
      </div>

      {/* Main Content Grid: Course Cards (Left) & Right Sidebar (Right) */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
        {/* ========================================================= */}
        {/* 2. COURSE CARDS GRID (Module-Based)                       */}
        {/* ========================================================= */}
        <div className="xl:col-span-8 space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredCourses.map((course) => {
              const isExpanded = expandedCourseId === course.id;

              return (
                <div
                  key={course.id}
                  className="bg-white dark:bg-[#0c1322] rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between relative group"
                >
                  <div className="space-y-3">
                    {/* Category Badge */}
                    <div className="flex items-center justify-between">
                      <span
                        className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border uppercase tracking-wider ${course.badgeColor}`}
                      >
                        {course.badge}
                      </span>
                      <span className="text-[10px] font-bold font-mono text-slate-400">
                        {course.progress}%
                      </span>
                    </div>

                    {/* Title */}
                    <h3 className="text-base font-extrabold text-slate-900 tracking-tight leading-snug">
                      {course.title}
                    </h3>

                    {/* Description */}
                    <p className="text-xs text-slate-500 leading-relaxed line-clamp-3">
                      {course.description}
                    </p>

                    {/* Progress Bar Indicator */}
                    <div className="space-y-1 pt-1">
                      <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-500"
                          style={{ width: `${course.progress}%` }}
                        />
                      </div>
                    </div>

                    {/* Module Breakdown Accordion / List */}
                    <div className="pt-2 border-t border-slate-100">
                      <button
                        type="button"
                        onClick={() =>
                          setExpandedCourseId(isExpanded ? null : course.id)
                        }
                        className="w-full flex items-center justify-between text-xs font-bold text-slate-700 py-1 hover:text-emerald-700 transition cursor-pointer"
                      >
                        <span>Curriculum Modules ({course.modules.length})</span>
                        {isExpanded ? (
                          <ChevronUp className="w-4 h-4 text-slate-400" />
                        ) : (
                          <ChevronDown className="w-4 h-4 text-slate-400" />
                        )}
                      </button>

                      {isExpanded && (
                        <div className="space-y-2 mt-2 pt-2 border-t border-slate-100 text-xs animate-fadeIn">
                          {course.modules.map((m) => (
                            <div
                              key={m.id}
                              onClick={() => handleToggleModule(course.id, m.id)}
                              className={`p-2.5 rounded-xl border transition cursor-pointer flex items-start space-x-2 ${
                                m.completed
                                  ? 'bg-emerald-50/60 border-emerald-200/80 text-emerald-950'
                                  : 'bg-slate-50 border-slate-200/80 text-slate-700 hover:bg-slate-100'
                              }`}
                            >
                              <div
                                className={`mt-0.5 w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 border transition ${
                                  m.completed
                                    ? 'bg-emerald-600 border-emerald-600 text-white'
                                    : 'border-slate-300 bg-white text-transparent'
                                }`}
                              >
                                <Check className="w-2.5 h-2.5 stroke-[3]" />
                              </div>
                              <div className="min-w-0 flex-1">
                                <p className="font-semibold text-[11px] leading-tight">
                                  {m.title}
                                </p>
                                <p className="text-[10px] text-slate-400 mt-0.5">
                                  {m.lessons}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Card Bottom Meta & Action */}
                  <div className="pt-4 mt-3 border-t border-slate-100 space-y-3">
                    <p className="text-[10px] font-semibold text-slate-400 tracking-wide">
                      {course.meta}
                    </p>

                    <button
                      type="button"
                      onClick={() =>
                        setExpandedCourseId(isExpanded ? null : course.id)
                      }
                      className="w-full py-2.5 px-3 rounded-xl bg-[#0d5236] hover:bg-[#0a422b] text-white font-bold text-xs flex items-center justify-center space-x-1.5 transition shadow-sm active:scale-95 cursor-pointer"
                    >
                      <span>
                        {course.progress > 0 && course.progress < 100
                          ? 'Continue Course'
                          : course.progress === 100
                          ? 'Review Masterclass'
                          : 'Start Course'}
                      </span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ========================================================= */}
        {/* 3. RIGHT SIDEBAR / QUICK PROGRESS PANEL                   */}
        {/* ========================================================= */}
        <div className="xl:col-span-4 space-y-5">
          {/* My Learning Progress */}
          <div className="p-5 rounded-2xl bg-white dark:bg-[#0c1322] border border-slate-200 dark:border-slate-800 shadow-sm space-y-4 transition-colors">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center space-x-2">
                <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400">
                  <BookOpen className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                    My Learning Progress
                  </h4>
                  <p className="text-[11px] text-slate-400">Masterclass track status</p>
                </div>
              </div>
              <span className="text-xs font-black font-mono text-emerald-700 dark:text-emerald-400">
                {overallPercentage}%
              </span>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-slate-600 dark:text-slate-400 font-medium">Completed Modules</span>
                <span className="font-bold text-slate-900 dark:text-slate-100 font-mono">
                  {completedModulesCount}/{totalModulesCount} Modules Completed
                </span>
              </div>
              <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-500"
                  style={{ width: `${overallPercentage}%` }}
                />
              </div>
            </div>

            <p className="text-[11px] text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-[#080d19] p-2.5 rounded-xl border border-slate-100 dark:border-slate-800 leading-relaxed">
              Complete all tracks to unlock verified fintech credentialing and enterprise wealth ledger privileges.
            </p>
          </div>

          {/* Certificate Roadmap */}
          <div className="p-5 rounded-2xl bg-white dark:bg-[#0c1322] border border-slate-200 dark:border-slate-800 shadow-sm space-y-3.5 transition-colors">
            <div className="flex items-center space-x-2.5">
              <div className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400">
                <Award className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  Certificate Roadmap
                </h4>
                <p className="text-[11px] text-slate-400">Verified credentials</p>
              </div>
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="p-3 rounded-xl border border-emerald-200 bg-emerald-50/50 flex items-center justify-between">
                <div className="flex items-center space-x-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  <div>
                    <p className="font-bold text-slate-900 text-xs">
                      Web3 & Custody Specialist
                    </p>
                    <p className="text-[10px] text-slate-500">Module 1 & 2 completed</p>
                  </div>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                  Earned
                </span>
              </div>

              <div className="p-3 rounded-xl border border-slate-200 bg-slate-50/60 flex items-center justify-between opacity-80">
                <div className="flex items-center space-x-2.5">
                  <div className="w-4 h-4 rounded-full border border-slate-300 flex items-center justify-center text-[10px] font-bold text-slate-400">
                    2
                  </div>
                  <div>
                    <p className="font-bold text-slate-700 text-xs">
                      Certified Wealth Strategist
                    </p>
                    <p className="text-[10px] text-slate-400">Requires Equity + Demat track</p>
                  </div>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-200 text-slate-600">
                  Locked
                </span>
              </div>

              <div className="p-3 rounded-xl border border-slate-200 bg-slate-50/60 flex items-center justify-between opacity-80">
                <div className="flex items-center space-x-2.5">
                  <div className="w-4 h-4 rounded-full border border-slate-300 flex items-center justify-center text-[10px] font-bold text-slate-400">
                    3
                  </div>
                  <div>
                    <p className="font-bold text-slate-700 text-xs">
                      Alternative Asset Sovereign
                    </p>
                    <p className="text-[10px] text-slate-400">Requires Real Estate & REIT track</p>
                  </div>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-200 text-slate-600">
                  Locked
                </span>
              </div>
            </div>
          </div>

          {/* Top Discussion Topics */}
          <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-3.5">
            <div className="flex items-center space-x-2.5">
              <div className="p-2 rounded-xl bg-blue-50 text-blue-700">
                <MessageSquare className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  Top Discussion Topics
                </h4>
                <p className="text-[11px] text-slate-400">Community Q&A and forum</p>
              </div>
            </div>

            <div className="space-y-2.5 text-xs">
              {DISCUSSIONS.map((topic) => (
                <div
                  key={topic.id}
                  className="p-3 rounded-xl bg-slate-50 border border-slate-100 hover:bg-slate-100/70 hover:border-slate-200 transition cursor-pointer"
                >
                  <p className="font-semibold text-slate-900 text-[11px] leading-snug">
                    {topic.title}
                  </p>
                  <div className="flex items-center justify-between text-[10px] text-slate-500 mt-1.5">
                    <span>
                      {topic.author} • {topic.category}
                    </span>
                    <span className="font-mono text-emerald-700 font-bold">
                      {topic.replies} replies
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
