import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Globe, ChevronDown, Check } from 'lucide-react';

export const LANGUAGES_LIST = [
  // Indian regional tongues (6)
  { code: 'en', label: 'English', display: 'English', short: 'English' },
  { code: 'ta', label: 'Tamil', display: 'தமிழ் (Tamil)', short: 'தமிழ்' },
  { code: 'hi', label: 'Hindi', display: 'हिन्दी (Hindi)', short: 'हिन्दी' },
  { code: 'te', label: 'Telugu', display: 'తెలుగు (Telugu)', short: 'తెలుగు' },
  { code: 'kn', label: 'Kannada', display: 'ಕನ್ನಡ (Kannada)', short: 'ಕನ್ನಡ' },
  { code: 'ml', label: 'Malayalam', display: 'മലയാളം (Malayalam)', short: 'മലയാളം' },

  // Global international languages (10)
  { code: 'es', label: 'Spanish', display: 'Español', short: 'Español' },
  { code: 'pt', label: 'Portuguese', display: 'Português', short: 'Português' },
  { code: 'de', label: 'German', display: 'Deutsch', short: 'Deutsch' },
  { code: 'fr', label: 'French', display: 'Français', short: 'Français' },
  { code: 'ja', label: 'Japanese', display: '日本語', short: '日本語' },
  { code: 'ar', label: 'Arabic', display: 'العربية', short: 'العربية' },
  { code: 'id', label: 'Indonesian', display: 'Bahasa Indonesia', short: 'Bahasa Indonesia' },
  { code: 'vi', label: 'Vietnamese', display: 'Tiếng Việt', short: 'Tiếng Việt' },
  { code: 'zh', label: 'Chinese', display: '简体中文', short: '简体中文' },
  { code: 'ko', label: 'Korean', display: '한국어', short: '한국어' },
];

export default function LanguageDropdown({ variant = 'dark', className = '' }) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Read language safely from localStorage (defaults to 'en')
  const [currentLangCode, setCurrentLangCode] = useState(() => {
    try {
      const stored = localStorage.getItem('sts_language');
      if (stored && LANGUAGES_LIST.some((l) => l.code === stored)) {
        return stored;
      }
    } catch (e) {
      console.warn('LocalStorage error:', e);
    }
    return 'en';
  });

  // Sync state if language is updated elsewhere
  useEffect(() => {
    const handleSync = () => {
      try {
        const stored = localStorage.getItem('sts_language');
        if (stored && LANGUAGES_LIST.some((l) => l.code === stored)) {
          setCurrentLangCode(stored);
        }
      } catch (e) {
        console.warn(e);
      }
    };

    window.addEventListener('sts_language_changed', handleSync);
    window.addEventListener('storage', handleSync);
    return () => {
      window.removeEventListener('sts_language_changed', handleSync);
      window.removeEventListener('storage', handleSync);
    };
  }, []);

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close on Escape key
  useEffect(() => {
    function handleKeyDown(event) {
      if (event.key === 'Escape') setIsOpen(false);
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Current active language object
  const currentLangObj = useMemo(() => {
    return (
      LANGUAGES_LIST.find((l) => l.code === currentLangCode) ||
      LANGUAGES_LIST[0]
    );
  }, [currentLangCode]);

  // Handle selecting a language
  const handleSelectLanguage = (code) => {
    setCurrentLangCode(code);
    try {
      localStorage.setItem('sts_language', code);
    } catch (e) {
      console.warn('LocalStorage save error:', e);
    }
    window.dispatchEvent(new Event('sts_language_changed'));
    setIsOpen(false);
  };

  const isDark = variant === 'dark';

  return (
    <div className={`relative inline-block ${className}`} ref={dropdownRef}>
      {/* Trigger Button: [ 🌐 English ▾ ] */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className={`flex items-center space-x-1.5 rounded-xl transition-all font-semibold select-none cursor-pointer ${
          isDark
            ? 'px-2.5 sm:px-3 py-1.5 bg-[#090d16] border border-slate-800/90 text-slate-200 hover:text-white hover:border-slate-700 shadow-inner text-xs'
            : 'px-3 py-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 hover:text-slate-900 shadow-sm text-xs sm:text-sm'
        }`}
        aria-label="Select Language"
        aria-expanded={isOpen}
      >
        <Globe
          className={`flex-shrink-0 ${
            isDark ? 'w-3.5 h-3.5 text-emerald-400' : 'w-4 h-4 text-emerald-600'
          }`}
        />
        <span className="whitespace-nowrap font-bold tracking-tight">
          {currentLangObj.short || currentLangObj.label}
        </span>
        <ChevronDown
          className={`transition-transform duration-200 ${
            isDark ? 'w-3 h-3 text-slate-400' : 'w-3.5 h-3.5 text-slate-500'
          } ${isOpen ? 'rotate-180 text-emerald-400' : ''}`}
        />
      </button>

      {/* Floating Dropdown Card with Upward Arrow */}
      {isOpen && (
        <div className="absolute right-0 mt-2.5 w-80 sm:w-96 rounded-2xl bg-[#0d1322] border border-slate-700 shadow-2xl z-50 animate-fadeIn">
          {/* Arrow pointing up */}
          <div className="absolute -top-1.5 right-6 w-3 h-3 bg-[#0d1322] border-t border-l border-slate-700 rotate-45" />

          {/* Card Header */}
          <div className="relative z-10 px-4 pt-3.5 pb-2.5 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Globe className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Select Language
              </span>
            </div>
            <span className="text-[10px] font-semibold text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded-full border border-emerald-500/30">
              Active: {currentLangObj.short || currentLangObj.label}
            </span>
          </div>

          {/* Structured Two-Column Grid (grid grid-cols-2 gap-x-6 gap-y-3 p-4) */}
          <div className="relative z-10 grid grid-cols-2 gap-x-6 gap-y-2.5 p-4 max-h-[380px] overflow-y-auto">
            {LANGUAGES_LIST.map((lang) => {
              const isSelected = currentLangCode === lang.code;
              return (
                <button
                  key={lang.code}
                  type="button"
                  onClick={() => handleSelectLanguage(lang.code)}
                  className={`flex items-center justify-between text-left py-2 px-2.5 rounded-xl transition text-xs font-medium cursor-pointer ${
                    isSelected
                      ? 'bg-emerald-500/15 text-emerald-400 font-bold border border-emerald-500/30 shadow-sm'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/70 border border-transparent'
                  }`}
                >
                  <span className="truncate pr-1">{lang.display}</span>
                  {isSelected && (
                    <Check className="w-3.5 h-3.5 text-emerald-400 stroke-[2.5] flex-shrink-0" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
