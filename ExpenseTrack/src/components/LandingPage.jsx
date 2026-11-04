import React, { useState } from 'react';
import { ArrowRight, Play, TrendingUp, ShieldCheck, PieChart, IndianRupee } from 'lucide-react';
import stsLogo from '../assets/sts-fintech-logo.png';
import LanguageDropdown from './LanguageDropdown';

export default function LandingPage({ onNavigateToAuth, onLaunchDashboard }) {
  const [isPlaying, setIsPlaying] = useState(false);

  // Curved Arch Calculations for "STS FINTECH" (10 letters)
  // Indices 0..2 ("STS"), Indices 3..9 ("FINTECH"), Midpoint = 4.5
  const letters = [
    { char: 'S', word: 1, idx: 0, y: 14, rot: -7.5 },
    { char: 'T', word: 1, idx: 1, y: 8,  rot: -5.5 },
    { char: 'S', word: 1, idx: 2, y: 3.5, rot: -3.5 },
    { char: 'F', word: 2, idx: 3, y: 1,   rot: -2 },
    { char: 'I', word: 2, idx: 4, y: 0,   rot: -0.7 },
    { char: 'N', word: 2, idx: 5, y: 0,   rot: 0.7 },
    { char: 'T', word: 2, idx: 6, y: 1,   rot: 2 },
    { char: 'E', word: 2, idx: 7, y: 3.5, rot: 3.5 },
    { char: 'C', word: 2, idx: 8, y: 8,   rot: 5.5 },
    { char: 'H', word: 2, idx: 9, y: 14, rot: 7.5 },
  ];

  const word1 = letters.filter((l) => l.word === 1);
  const word2 = letters.filter((l) => l.word === 2);

  // High-Resolution SVG Poster for "How Everyday Expense Tracking Empowers the Common Man"
  const posterSvg = `data:image/svg+xml;utf8,${encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1280 720" width="1280" height="720">
      <defs>
        <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#0a101d"/>
          <stop offset="60%" stop-color="#0f172a"/>
          <stop offset="100%" stop-color="#062e22"/>
        </linearGradient>
        <linearGradient id="emeraldGrad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stop-color="#10b981"/>
          <stop offset="100%" stop-color="#14b8a6"/>
        </linearGradient>
        <linearGradient id="chartGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stop-color="#10b981" stop-opacity="0.35"/>
          <stop offset="100%" stop-color="#10b981" stop-opacity="0.0"/>
        </linearGradient>
      </defs>
      
      <!-- Background -->
      <rect width="1280" height="720" fill="url(#bg)"/>
      
      <!-- Background Chart Grid Lines -->
      <g stroke="#334155" stroke-opacity="0.3" stroke-dasharray="4 6" stroke-width="1">
        <line x1="80" y1="180" x2="1200" y2="180" />
        <line x1="80" y1="280" x2="1200" y2="280" />
        <line x1="80" y1="380" x2="1200" y2="380" />
        <line x1="80" y1="480" x2="1200" y2="480" />
      </g>

      <!-- Financial Growth Area & Curve -->
      <path d="M 100 520 Q 320 480 500 370 T 850 290 T 1180 160 L 1180 560 L 100 560 Z" fill="url(#chartGrad)"/>
      <path d="M 100 520 Q 320 480 500 370 T 850 290 T 1180 160" fill="none" stroke="#10b981" stroke-width="4"/>

      <!-- Dashboard Preview Cards Overlay -->
      <rect x="120" y="220" width="280" height="130" rx="16" fill="#1e293b" fill-opacity="0.75" stroke="#334155" stroke-width="1.5"/>
      <text x="145" y="255" fill="#94a3b8" font-family="Inter, sans-serif" font-size="14" font-weight="600" text-transform="uppercase">Daily Outflow Tracking</text>
      <text x="145" y="295" fill="#ffffff" font-family="Inter, sans-serif" font-size="32" font-weight="800">₹1,450.00</text>
      <text x="145" y="325" fill="#10b981" font-family="Inter, sans-serif" font-size="13" font-weight="600">✓ 100% Accounted & Segregated</text>

      <rect x="880" y="220" width="280" height="130" rx="16" fill="#1e293b" fill-opacity="0.75" stroke="#334155" stroke-width="1.5"/>
      <text x="905" y="255" fill="#94a3b8" font-family="Inter, sans-serif" font-size="14" font-weight="600" text-transform="uppercase">Net Monthly Savings</text>
      <text x="905" y="295" fill="#34d399" font-family="Inter, sans-serif" font-size="32" font-weight="800">+₹24,800.00</text>
      <text x="905" y="325" fill="#38bdf8" font-family="Inter, sans-serif" font-size="13" font-weight="600">↑ 32% Hidden Leaks Eliminated</text>

      <!-- Center Masterclass Badge & Title -->
      <g transform="translate(640, 260)" text-anchor="middle">
        <rect x="-170" y="-35" width="340" height="34" rx="17" fill="#064e3b" stroke="#10b981" stroke-opacity="0.6" stroke-width="1.5"/>
        <text y="-13" fill="#34d399" font-family="Inter, sans-serif" font-size="13" font-weight="700" letter-spacing="1.5">FINANCIAL LITERACY MASTERCLASS</text>
        
        <text y="45" fill="#ffffff" font-family="Inter, sans-serif" font-size="38" font-weight="900" letter-spacing="-0.5">How Everyday Expense Tracking</text>
        <text y="95" fill="url(#emeraldGrad)" font-family="Inter, sans-serif" font-size="38" font-weight="900" letter-spacing="-0.5">Empowers the Common Man</text>
        <text y="135" fill="#94a3b8" font-family="Inter, sans-serif" font-size="17" font-weight="500">Simple Day-to-Day Budgeting • Zero Circular Debt • Financial Freedom</text>
      </g>

      <!-- Center Big Play Button -->
      <g transform="translate(640, 480)">
        <circle r="44" fill="#10b981" opacity="0.25"/>
        <circle r="36" fill="#10b981"/>
        <polygon points="-8,-14 -8,14 16,0" fill="#ffffff"/>
      </g>
    </svg>
  `)}`;

  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans selection:bg-emerald-500 selection:text-white flex flex-col relative overflow-x-hidden">
      
      {/* ========================================================= */}
      {/* 1. CONTEXTUAL MONEY TRACKING THEME WATERMARK BACKGROUND   */}
      {/* (High-Contrast Emerald & Slate Accents • Opacity-30)     */}
      {/* ========================================================= */}
      <div
        className="fixed inset-0 pointer-events-none z-0 overflow-hidden flex items-center justify-center opacity-30 select-none"
        aria-hidden="true"
      >
        <svg
          viewBox="0 0 1440 900"
          className="w-full h-full object-cover"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient id="wmTrend" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#059669" />
              <stop offset="50%" stopColor="#10b981" />
              <stop offset="100%" stopColor="#047857" />
            </linearGradient>
            <linearGradient id="wmArea" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#10b981" stopOpacity="0.22" />
              <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Reference Ledger Grid Lines */}
          <g stroke="#334155" strokeWidth="1.5" strokeDasharray="6 8" opacity="0.35">
            <line x1="80" y1="180" x2="1360" y2="180" />
            <line x1="80" y1="320" x2="1360" y2="320" />
            <line x1="80" y1="460" x2="1360" y2="460" />
            <line x1="80" y1="600" x2="1360" y2="600" />
            
            <line x1="200" y1="80" x2="200" y2="820" />
            <line x1="480" y1="80" x2="480" y2="820" />
            <line x1="720" y1="80" x2="720" y2="820" />
            <line x1="960" y1="80" x2="960" y2="820" />
            <line x1="1240" y1="80" x2="1240" y2="820" />
          </g>

          {/* Giant Indian Rupee (₹) Symbol Behind Curved Arch Title */}
          <text
            x="720"
            y="330"
            textAnchor="middle"
            fontSize="310"
            fontWeight="900"
            fill="#059669"
            fillOpacity="0.14"
            stroke="#059669"
            strokeWidth="4"
            fontFamily="Inter, sans-serif"
          >
            ₹
          </text>

          {/* Distinct Floating Rupee Symbols Across Hero Area */}
          {/* Top-Left of Arch */}
          <text
            x="210"
            y="230"
            fontSize="120"
            fontWeight="800"
            fill="#059669"
            fillOpacity="0.18"
            stroke="#047857"
            strokeWidth="3.5"
            fontFamily="Inter, sans-serif"
          >
            ₹
          </text>

          {/* Top-Right of Arch */}
          <text
            x="1230"
            y="230"
            fontSize="120"
            fontWeight="800"
            fill="#059669"
            fillOpacity="0.18"
            stroke="#047857"
            strokeWidth="3.5"
            fontFamily="Inter, sans-serif"
          >
            ₹
          </text>

          {/* Mid-Left (Flanking Arch Title) */}
          <text
            x="320"
            y="380"
            fontSize="85"
            fontWeight="800"
            fill="#10b981"
            fillOpacity="0.2"
            stroke="#059669"
            strokeWidth="3"
            fontFamily="Inter, sans-serif"
          >
            ₹
          </text>

          {/* Mid-Right (Flanking Arch Title) */}
          <text
            x="1120"
            y="380"
            fontSize="85"
            fontWeight="800"
            fill="#10b981"
            fillOpacity="0.2"
            stroke="#059669"
            strokeWidth="3"
            fontFamily="Inter, sans-serif"
          >
            ₹
          </text>

          {/* Lower-Left (Framing Video Player Top) */}
          <text
            x="150"
            y="520"
            fontSize="95"
            fontWeight="800"
            fill="#059669"
            fillOpacity="0.18"
            stroke="#047857"
            strokeWidth="3"
            fontFamily="Inter, sans-serif"
          >
            ₹
          </text>

          {/* Lower-Right (Framing Video Player Top) */}
          <text
            x="1280"
            y="520"
            fontSize="95"
            fontWeight="800"
            fill="#059669"
            fillOpacity="0.18"
            stroke="#047857"
            strokeWidth="3"
            fontFamily="Inter, sans-serif"
          >
            ₹
          </text>

          {/* Gradient Growth Area Fill Behind Primary Trend */}
          <path
            d="M 80 500 Q 360 450 620 310 T 1060 210 T 1380 90 L 1380 620 L 80 620 Z"
            fill="url(#wmArea)"
          />

          {/* Financial Upward Trendlines (Bold Distinct Strokes) */}
          {/* Main Growth Curve */}
          <path
            d="M 80 500 Q 360 450 620 310 T 1060 210 T 1380 90"
            fill="none"
            stroke="url(#wmTrend)"
            strokeWidth="4.5"
            strokeLinecap="round"
          />

          {/* Secondary Interlacing Ledger Flow Line */}
          <path
            d="M 60 430 C 320 400 480 260 720 230 S 1120 180 1380 130"
            fill="none"
            stroke="#334155"
            strokeWidth="3"
            strokeDasharray="10 8"
            strokeLinecap="round"
            opacity="0.65"
          />

          {/* Trend Milestone Data Nodes */}
          <circle cx="360" cy="425" r="7" fill="#10b981" stroke="#059669" strokeWidth="3.5" />
          <circle cx="620" cy="310" r="8" fill="#10b981" stroke="#059669" strokeWidth="4" />
          <circle cx="860" cy="245" r="7" fill="#10b981" stroke="#059669" strokeWidth="3.5" />
          <circle cx="1060" cy="210" r="8" fill="#10b981" stroke="#059669" strokeWidth="4" />
          <circle cx="1280" cy="135" r="7" fill="#10b981" stroke="#059669" strokeWidth="3.5" />

          {/* Candlestick Chart Cluster Left (Flanking Title) */}
          <g>
            {/* Bar 1 */}
            <line x1="220" y1="360" x2="220" y2="460" stroke="#059669" strokeWidth="3.5" strokeLinecap="round" />
            <rect x="209" y="380" width="22" height="50" rx="3" fill="#10b981" fillOpacity="0.45" stroke="#059669" strokeWidth="3.5" />
            
            {/* Bar 2 */}
            <line x1="260" y1="320" x2="260" y2="430" stroke="#059669" strokeWidth="3.5" strokeLinecap="round" />
            <rect x="249" y="340" width="22" height="60" rx="3" fill="#10b981" fillOpacity="0.45" stroke="#059669" strokeWidth="3.5" />

            {/* Bar 3 */}
            <line x1="300" y1="280" x2="300" y2="400" stroke="#047857" strokeWidth="3.5" strokeLinecap="round" />
            <rect x="289" y="300" width="22" height="70" rx="3" fill="#047857" fillOpacity="0.5" stroke="#047857" strokeWidth="3.5" />
          </g>

          {/* Candlestick Chart Cluster Right (Flanking Title) */}
          <g>
            {/* Bar 4 */}
            <line x1="1140" y1="280" x2="1140" y2="400" stroke="#059669" strokeWidth="3.5" strokeLinecap="round" />
            <rect x="1129" y="300" width="22" height="70" rx="3" fill="#10b981" fillOpacity="0.45" stroke="#059669" strokeWidth="3.5" />
            
            {/* Bar 5 */}
            <line x1="1180" y1="240" x2="1180" y2="360" stroke="#059669" strokeWidth="3.5" strokeLinecap="round" />
            <rect x="1169" y="260" width="22" height="65" rx="3" fill="#10b981" fillOpacity="0.45" stroke="#059669" strokeWidth="3.5" />

            {/* Bar 6 */}
            <line x1="1220" y1="190" x2="1220" y2="320" stroke="#047857" strokeWidth="3.5" strokeLinecap="round" />
            <rect x="1209" y="210" width="22" height="75" rx="3" fill="#047857" fillOpacity="0.5" stroke="#047857" strokeWidth="3.5" />
          </g>

          {/* Flow Arrows & Settlement Node Paths */}
          <g stroke="#059669" strokeWidth="3" strokeDasharray="8 6" opacity="0.8">
            <path d="M 380 260 C 500 190, 620 190, 720 220" />
            <path d="M 720 220 C 860 260, 980 260, 1080 200" />
          </g>

          {/* Financial Settlement Nodes */}
          <circle cx="380" cy="260" r="14" fill="#10b981" fillOpacity="0.3" stroke="#059669" strokeWidth="3" />
          <circle cx="720" cy="220" r="16" fill="#10b981" fillOpacity="0.3" stroke="#059669" strokeWidth="3" />
          <circle cx="1080" cy="200" r="14" fill="#10b981" fillOpacity="0.3" stroke="#059669" strokeWidth="3" />
        </svg>
      </div>

      {/* ========================================================= */}
      {/* 2. TOP NAVBAR (Clean Full-Width, Edge-to-Edge)            */}
      {/* ========================================================= */}
      <header className="sticky top-0 z-50 w-full bg-white/90 backdrop-blur-md border-b border-slate-200 shadow-xs">
        <div className="w-full px-6 sm:px-8 h-20 flex items-center justify-between">
          {/* Left: Brand Logo & Title Only (No Subtext) */}
          <div
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="flex items-center space-x-3 flex-shrink-0 cursor-pointer group"
          >
            <div className="h-10 w-10 sm:h-11 sm:w-11 rounded-xl overflow-hidden shadow-xs border border-emerald-500/40 bg-white p-0.5 group-hover:scale-105 group-hover:border-emerald-500 transition-all flex items-center justify-center">
              <img
                src={stsLogo}
                alt="STS FINTECH Logo"
                className="h-full w-full object-cover rounded-lg"
              />
            </div>
            <span className="text-base sm:text-lg font-black tracking-tight text-slate-900 group-hover:text-emerald-700 transition-colors">
              STS FINTECH
            </span>
          </div>

          {/* Right Action Buttons (Flush to Top Right) */}
          <div className="flex items-center space-x-2.5 sm:space-x-3.5 flex-shrink-0">
            {/* Global Language Selector Dropdown [ 🌐 English ▾ ] */}
            <LanguageDropdown variant="light" />

            <button
              onClick={() => onNavigateToAuth('signin')}
              className="text-xs sm:text-sm font-semibold text-slate-700 hover:text-emerald-700 px-2.5 sm:px-3 py-2 rounded-lg transition cursor-pointer"
            >
              Sign In
            </button>
            <button
              onClick={() => onNavigateToAuth('signup')}
              className="relative inline-flex items-center justify-center px-4 py-2 sm:px-5 sm:py-2.5 text-xs sm:text-sm font-bold text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 rounded-xl shadow-md shadow-emerald-600/20 hover:shadow-emerald-500/35 transition-all transform hover:-translate-y-0.5 active:translate-y-0 cursor-pointer"
            >
              <span>Get Started</span>
              <ArrowRight className="w-4 h-4 ml-1.5 hidden sm:inline" />
            </button>
          </div>
        </div>
      </header>

      {/* ========================================================= */}
      {/* 3. MAIN BODY CONTENT                                      */}
      {/* ========================================================= */}
      <main className="relative z-10 flex-1 w-full flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8 pt-12 sm:pt-16 pb-20">
        
        {/* CURVED ARCH TITLE: "STS FINTECH" */}
        <div className="text-center select-none pt-4 pb-2">
          <h1
            style={{ fontFamily: "'Syne', 'Plus Jakarta Sans', sans-serif" }}
            className="text-5xl sm:text-7xl md:text-8xl lg:text-9xl xl:text-[9.5rem] font-black tracking-tight uppercase flex items-center justify-center flex-wrap gap-x-4 sm:gap-x-8 md:gap-x-12 leading-none"
          >
            {/* Word 1: STS */}
            <span className="inline-flex">
              {word1.map((item) => (
                <span
                  key={`sts-${item.idx}`}
                  className="inline-block"
                  style={{
                    transform: `translateY(${item.y}px) rotate(${item.rot}deg)`,
                  }}
                >
                  <span
                    className="arch-3d-letter inline-block transform hover:scale-[1.30] hover:-translate-y-3 cursor-default select-none"
                  >
                    {item.char}
                  </span>
                </span>
              ))}
            </span>

            {/* Word 2: FINTECH */}
            <span className="inline-flex">
              {word2.map((item) => (
                <span
                  key={`fintech-${item.idx}`}
                  className="inline-block"
                  style={{
                    transform: `translateY(${item.y}px) rotate(${item.rot}deg)`,
                  }}
                >
                  <span
                    className="arch-3d-letter inline-block transform hover:scale-[1.30] hover:-translate-y-3 cursor-default select-none"
                  >
                    {item.char}
                  </span>
                </span>
              ))}
            </span>
          </h1>

          {/* Tagline */}
          <p className="text-sm sm:text-base md:text-lg font-medium text-slate-500 tracking-wide mt-6 sm:mt-8 text-center max-w-xl mx-auto">
            Smart tracking. Collaborative splits. Effortless wealth.
          </p>
        </div>

        {/* ========================================================= */}
        {/* 4. EMBEDDED VIDEO PLAYER CONTAINER                        */}
        {/* (Directly Below Tagline, No Launch Button)                */}
        {/* ========================================================= */}
        <section
          aria-label="How Everyday Expense Tracking Empowers the Common Man"
          className="w-full max-w-3xl mx-auto mt-8 sm:mt-10"
        >
          {/* Video Outer Container: 16:9 Aspect Ratio, Rounded-3xl, Subtle Border, Soft Drop Shadow */}
          <div className="relative rounded-2xl sm:rounded-3xl border border-slate-200 shadow-xl overflow-hidden bg-slate-950 aspect-video group">
            
            {/* HTML5 Video Player with Standard Controls and High-Definition Dashboard Poster */}
            <video
              controls
              playsInline
              preload="metadata"
              poster={posterSvg}
              className="w-full h-full object-cover rounded-2xl sm:rounded-3xl bg-slate-950 focus:outline-none"
              onPlay={() => setIsPlaying(true)}
              onPause={() => setIsPlaying(false)}
            >
              <source src="/assets/common-man-expense-guide.mp4" type="video/mp4" />
              Your browser does not support the video tag.
            </video>

            {/* Contextual Video Title Floating Badge Bar (Visible when not actively playing) */}
            {!isPlaying && (
              <div className="absolute top-3 left-3 sm:top-4 sm:left-4 z-10 pointer-events-none flex items-center space-x-2 bg-slate-900/80 backdrop-blur-md border border-slate-700/60 rounded-full px-3 py-1 text-[11px] font-semibold text-slate-200 shadow-lg">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>How Everyday Expense Tracking Empowers the Common Man</span>
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
