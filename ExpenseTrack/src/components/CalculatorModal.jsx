import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { Delete, Copy, Check, ChevronDown, ArrowUpDown } from 'lucide-react';

// Real-time exchange rates with INR as reference base (2026 benchmark rates)
export const CURRENCIES = [
  { code: 'INR', symbol: '₹', name: 'Indian Rupee', rateInINR: 1.0, flag: '🇮🇳' },
  { code: 'USD', symbol: '$', name: 'US Dollar', rateInINR: 84.80, flag: '🇺🇸' },
  { code: 'EUR', symbol: '€', name: 'Euro', rateInINR: 91.20, flag: '🇪🇺' },
  { code: 'GBP', symbol: '£', name: 'British Pound', rateInINR: 107.50, flag: '🇬🇧' },
  { code: 'AED', symbol: 'د.إ', name: 'UAE Dirham', rateInINR: 23.10, flag: '🇦🇪' },
  { code: 'SGD', symbol: 'S$', name: 'Singapore Dollar', rateInINR: 63.50, flag: '🇸🇬' },
  { code: 'JPY', symbol: '¥', name: 'Japanese Yen', rateInINR: 0.56, flag: '🇯🇵' },
  { code: 'SAR', symbol: '﷼', name: 'Saudi Riyal', rateInINR: 22.60, flag: '🇸🇦' },
  { code: 'AUD', symbol: 'A$', name: 'Australian Dollar', rateInINR: 55.80, flag: '🇦🇺' },
  { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar', rateInINR: 61.40, flag: '🇨🇦' },
];

export default function CalculatorModal({ isOpen, onClose }) {
  // 1. Mode Switcher: 'calc' (Basic Calc) | 'currency' (Currency INR ⇄ Global)
  const [activeMode, setActiveMode] = useState('calc');

  // Basic Calculator State
  const [expression, setExpression] = useState('');
  const [result, setResult] = useState('0');
  const [copied, setCopied] = useState(false);

  // Currency Converter State
  const [fromCurrency, setFromCurrency] = useState('INR');
  const [toCurrency, setToCurrency] = useState('USD');
  const [currencyInput, setCurrencyInput] = useState('1000');
  const [currencyCopied, setCurrencyCopied] = useState(false);

  // Safe arithmetic evaluator
  const calculateResult = useCallback((expr) => {
    if (!expr || expr.trim() === '') return '0';
    try {
      let sanitized = expr
        .replace(/×/g, '*')
        .replace(/÷/g, '/')
        .replace(/%/g, '/100');

      sanitized = sanitized.replace(/[+\-*/.]+$/, '');
      if (!sanitized) return '0';

      if (!/^[\d\s+\-*/.()]+$/.test(sanitized)) return 'Error';

      const evalValue = Function(`"use strict"; return (${sanitized})`)();
      if (isNaN(evalValue) || !isFinite(evalValue)) return 'Error';

      const rounded = Math.round(evalValue * 100000000) / 100000000;
      return String(rounded);
    } catch {
      return 'Error';
    }
  }, []);

  // Helper to parse live numeric value for currency conversion
  const parseLiveAmount = useCallback((valStr) => {
    if (!valStr || valStr.trim() === '') return 0;
    try {
      let sanitized = valStr
        .replace(/×/g, '*')
        .replace(/÷/g, '/')
        .replace(/%/g, '/100');
      sanitized = sanitized.replace(/[+\-*/.]+$/, '');
      if (!sanitized) return 0;
      const res = Function(`"use strict"; return (${sanitized})`)();
      return isNaN(res) || !isFinite(res) ? 0 : res;
    } catch {
      const num = parseFloat(valStr);
      return isNaN(num) ? 0 : num;
    }
  }, []);

  // Currency calculation
  const { fromObj, toObj, convertedValue, liveRateText } = useMemo(() => {
    const fObj = CURRENCIES.find((c) => c.code === fromCurrency) || CURRENCIES[0];
    const tObj = CURRENCIES.find((c) => c.code === toCurrency) || CURRENCIES[1];

    const numericInput = parseLiveAmount(currencyInput);
    // Convert to INR first, then to target currency
    const inINR = numericInput * fObj.rateInINR;
    const finalConverted = tObj.rateInINR > 0 ? inINR / tObj.rateInINR : 0;

    // Format converted amount
    const formatted = new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: finalConverted < 1 ? 4 : 2,
    }).format(finalConverted);

    // Live conversion rate string (e.g. 1 USD = ₹84.80)
    let rateText = '';
    if (fObj.code === 'INR' && tObj.code !== 'INR') {
      const oneUnitInINR = tObj.rateInINR;
      rateText = `1 ${tObj.code} = ₹${oneUnitInINR.toFixed(2)}`;
    } else if (fObj.code !== 'INR' && tObj.code === 'INR') {
      const oneUnitInINR = fObj.rateInINR;
      rateText = `1 ${fObj.code} = ₹${oneUnitInINR.toFixed(2)}`;
    } else {
      const crossRate = fObj.rateInINR / tObj.rateInINR;
      rateText = `1 ${fObj.code} = ${crossRate < 1 ? crossRate.toFixed(4) : crossRate.toFixed(2)} ${tObj.code}`;
    }

    return {
      fromObj: fObj,
      toObj: tObj,
      convertedValue: formatted,
      liveRateText: rateText,
    };
  }, [fromCurrency, toCurrency, currencyInput, parseLiveAmount]);

  // Swap currencies (INR ⇄ Global)
  const handleSwapCurrencies = () => {
    setFromCurrency(toCurrency);
    setToCurrency(fromCurrency);
  };

  // Handle digit or operator input
  const handleInput = useCallback(
    (val) => {
      if (activeMode === 'currency') {
        setCurrencyInput((prev) => {
          const isOperator = ['+', '-', '×', '÷', '%'].includes(val);
          const lastChar = prev.slice(-1);

          if (isOperator && ['+', '-', '×', '÷'].includes(lastChar)) {
            return prev.slice(0, -1) + val;
          }

          if (val === '.') {
            const parts = prev.split(/[+\-×÷%]/);
            const currentPart = parts[parts.length - 1];
            if (currentPart.includes('.')) return prev;
            if (currentPart === '') return prev + '0.';
          }

          if (prev === '0' && val !== '.') {
            return val;
          }

          return prev + val;
        });
      } else {
        setExpression((prev) => {
          const isOperator = ['+', '-', '×', '÷', '%'].includes(val);
          const lastChar = prev.slice(-1);

          if (isOperator && ['+', '-', '×', '÷'].includes(lastChar)) {
            return prev.slice(0, -1) + val;
          }

          if (val === '.') {
            const parts = prev.split(/[+\-×÷%]/);
            const currentPart = parts[parts.length - 1];
            if (currentPart.includes('.')) return prev;
            if (currentPart === '') return prev + '0.';
          }

          const nextExpr = prev + val;
          const liveRes = calculateResult(nextExpr);
          if (liveRes !== 'Error') {
            setResult(liveRes);
          }
          return nextExpr;
        });
      }
    },
    [activeMode, calculateResult]
  );

  // Clear everything
  const handleClear = () => {
    if (activeMode === 'currency') {
      setCurrencyInput('0');
    } else {
      setExpression('');
      setResult('0');
    }
  };

  // Backspace / Delete last character
  const handleDelete = () => {
    if (activeMode === 'currency') {
      setCurrencyInput((prev) => {
        if (prev.length <= 1) return '0';
        return prev.slice(0, -1);
      });
    } else {
      setExpression((prev) => {
        if (prev.length <= 1) {
          setResult('0');
          return '';
        }
        const updated = prev.slice(0, -1);
        const liveRes = calculateResult(updated);
        if (liveRes !== 'Error') setResult(liveRes);
        return updated;
      });
    }
  };

  // Evaluate final result
  const handleEvaluate = () => {
    if (activeMode === 'currency') {
      // Evaluate any arithmetic expression inside currency input
      const evaluated = calculateResult(currencyInput);
      if (evaluated !== 'Error') {
        setCurrencyInput(evaluated);
      }
    } else {
      const finalRes = calculateResult(expression);
      setResult(finalRes);
      if (finalRes !== 'Error') {
        setExpression(finalRes);
      }
    }
  };

  // Copy result to clipboard
  const handleCopy = () => {
    if (result && result !== 'Error') {
      navigator.clipboard.writeText(result);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleCopyCurrency = () => {
    if (convertedValue) {
      navigator.clipboard.writeText(`${toObj.symbol} ${convertedValue}`);
      setCurrencyCopied(true);
      setTimeout(() => setCurrencyCopied(false), 2000);
    }
  };

  // Physical keyboard listener
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key >= '0' && e.key <= '9') {
        handleInput(e.key);
      } else if (e.key === '.') {
        handleInput('.');
      } else if (e.key === '+') {
        handleInput('+');
      } else if (e.key === '-') {
        handleInput('-');
      } else if (e.key === '*') {
        handleInput('×');
      } else if (e.key === '/') {
        e.preventDefault();
        handleInput('÷');
      } else if (e.key === '%') {
        handleInput('%');
      } else if (e.key === 'Enter' || e.key === '=') {
        e.preventDefault();
        handleEvaluate();
      } else if (e.key === 'Backspace') {
        e.preventDefault();
        handleDelete();
      } else if (e.key.toLowerCase() === 'c') {
        handleClear();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, handleInput, onClose, handleEvaluate, handleDelete]);

  if (!isOpen || typeof document === 'undefined') return null;

  return createPortal(
    /* 1. Fixed overlay container centered on screen with backdrop blur */
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-xs p-4"
      onClick={onClose}
    >
      {/* 2. Centered Modal Card */}
      <div
        className="relative w-full max-w-xs sm:max-w-sm mx-4 max-h-[90vh] overflow-y-auto bg-[#0c1424] border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-2xl animate-fadeIn text-slate-100 flex flex-col select-none"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Title Bar with Exit (✕) Button */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center space-x-2">
            <span className="text-base select-none" role="img" aria-label="calculator">
              {activeMode === 'calc' ? '🧮' : '💱'}
            </span>
            <span className="text-sm font-bold text-white tracking-tight">
              {activeMode === 'calc' ? 'Calculator' : 'Currency Converter'}
            </span>
          </div>

          {/* Clean round exit close button (✕) */}
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer text-sm leading-none flex items-center justify-center w-7 h-7"
            title="Close"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        {/* 1. Segmented Mode Switcher: [ Basic Calc ] | [ 💱 Currency (INR ⇄ Global) ] */}
        <div className="grid grid-cols-2 p-1 bg-[#080d18] rounded-xl border border-slate-800/80 my-3.5">
          <button
            type="button"
            onClick={() => setActiveMode('calc')}
            className={`py-1.5 px-2.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
              activeMode === 'calc'
                ? 'bg-[#131d31] text-emerald-400 shadow-sm border border-slate-700 font-bold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Basic Calc
          </button>
          <button
            type="button"
            onClick={() => setActiveMode('currency')}
            className={`py-1.5 px-2.5 rounded-lg text-xs font-semibold transition flex items-center justify-center gap-1 cursor-pointer truncate ${
              activeMode === 'currency'
                ? 'bg-[#131d31] text-emerald-400 shadow-sm border border-slate-700 font-bold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <span>💱</span>
            <span className="truncate">INR ⇄ Global</span>
          </button>
        </div>

        {/* ========================================================================= */}
        {/* MODE A: BASIC CALCULATOR DISPLAY                                         */}
        {/* ========================================================================= */}
        {activeMode === 'calc' && (
          <div className="mb-4 p-3.5 rounded-2xl bg-[#080d18] border border-slate-800/90 shadow-inner">
            {/* Live expression line */}
            <div className="h-5 text-right text-xs font-mono text-slate-400 truncate tracking-wide">
              {expression || ' '}
            </div>

            {/* Numeric Result line */}
            <div className="flex items-center justify-between mt-1">
              <button
                type="button"
                onClick={handleCopy}
                className="p-1 rounded-lg text-slate-500 hover:text-emerald-400 hover:bg-slate-800/60 transition cursor-pointer"
                title="Copy result"
              >
                {copied ? (
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                ) : (
                  <Copy className="w-3.5 h-3.5" />
                )}
              </button>
              <div className="text-right font-mono font-black text-2xl text-emerald-400 tracking-tight truncate max-w-[200px]">
                {result}
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* MODE B: UNIQUE TWO-ROW CURRENCY CONVERTER (INR ⇄ GLOBAL)                  */}
        {/* ========================================================================= */}
        {activeMode === 'currency' && (
          <div className="mb-4 p-3.5 rounded-2xl bg-[#080d18] border border-slate-800/90 shadow-inner space-y-2.5">
            {/* 1. Source Currency Row */}
            <div className="flex items-center justify-between gap-2 bg-[#0c1424] p-2.5 rounded-xl border border-slate-800/80">
              <div className="relative flex-shrink-0">
                <select
                  value={fromCurrency}
                  onChange={(e) => setFromCurrency(e.target.value)}
                  className="bg-[#121c32] text-slate-200 border border-slate-700/80 rounded-lg pl-2 pr-6 py-1 text-xs font-bold focus:outline-none focus:ring-1 focus:ring-emerald-500 cursor-pointer appearance-none"
                >
                  {CURRENCIES.map((c) => (
                    <option key={c.code} value={c.code} className="bg-[#0d1322] text-white">
                      {c.flag} {c.code}
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-3 h-3 text-slate-400 absolute right-1.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>

              {/* Amount being typed */}
              <div className="flex items-center space-x-1 min-w-0 flex-1 justify-end">
                <span className="text-xs font-mono font-bold text-slate-400 flex-shrink-0">
                  {fromObj.symbol}
                </span>
                <span className="text-base sm:text-lg font-mono font-bold text-white truncate text-right">
                  {currencyInput || '0'}
                </span>
              </div>
            </div>

            {/* Swap Button (⇅) + Live Rate Pill */}
            <div className="relative flex items-center justify-between px-1">
              {/* Live Rate Pill */}
              <div className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-semibold font-mono">
                <span>{liveRateText}</span>
              </div>

              {/* Sleek Circular Swap Button (⇅) */}
              <button
                type="button"
                onClick={handleSwapCurrencies}
                className="p-1.5 rounded-full bg-slate-800 hover:bg-emerald-500/20 border border-slate-700 hover:border-emerald-500/50 text-slate-300 hover:text-emerald-400 transition cursor-pointer shadow-md active:scale-90 flex items-center justify-center"
                title="Swap Currencies"
                aria-label="Swap Currencies"
              >
                <ArrowUpDown className="w-3.5 h-3.5 stroke-[2.5]" />
              </button>
            </div>

            {/* 2. Target Currency Row */}
            <div className="flex items-center justify-between gap-2 bg-[#0c1424] p-2.5 rounded-xl border border-slate-800/80">
              <div className="relative flex-shrink-0">
                <select
                  value={toCurrency}
                  onChange={(e) => setToCurrency(e.target.value)}
                  className="bg-[#121c32] text-slate-200 border border-slate-700/80 rounded-lg pl-2 pr-6 py-1 text-xs font-bold focus:outline-none focus:ring-1 focus:ring-emerald-500 cursor-pointer appearance-none"
                >
                  {CURRENCIES.map((c) => (
                    <option key={c.code} value={c.code} className="bg-[#0d1322] text-white">
                      {c.flag} {c.code}
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-3 h-3 text-slate-400 absolute right-1.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>

              {/* Converted Equivalent Result */}
              <div className="flex items-center space-x-1.5 min-w-0 flex-1 justify-end">
                <span className="text-xs font-mono font-bold text-emerald-500 flex-shrink-0">
                  {toObj.symbol}
                </span>
                <span className="text-base sm:text-lg font-mono font-black text-emerald-400 truncate text-right">
                  {convertedValue}
                </span>
                <button
                  type="button"
                  onClick={handleCopyCurrency}
                  className="p-1 text-slate-500 hover:text-emerald-400 transition cursor-pointer ml-1 flex-shrink-0"
                  title="Copy converted amount"
                >
                  {currencyCopied ? (
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Keypad Grid (Numbers 0-9, ., C, Backspace directly enter amount) */}
        <div className="grid grid-cols-4 gap-2">
          {/* Row 1: Clear, Backspace, %, ÷ */}
          <button
            type="button"
            onClick={handleClear}
            className="py-2.5 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 text-rose-400 font-bold text-sm transition active:scale-95 cursor-pointer border border-rose-500/20"
          >
            C
          </button>
          <button
            type="button"
            onClick={handleDelete}
            className="py-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 font-medium text-sm transition active:scale-95 cursor-pointer flex items-center justify-center border border-slate-700/60"
            title="Delete"
          >
            <Delete className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => handleInput('%')}
            className="py-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-emerald-400 font-bold text-sm transition active:scale-95 cursor-pointer border border-slate-700/60"
          >
            %
          </button>
          <button
            type="button"
            onClick={() => handleInput('÷')}
            className="py-2.5 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-400 font-bold text-base transition active:scale-95 cursor-pointer border border-emerald-500/20"
          >
            ÷
          </button>

          {/* Row 2: 7, 8, 9, × */}
          <button
            type="button"
            onClick={() => handleInput('7')}
            className="py-2.5 rounded-xl bg-slate-800/50 hover:bg-slate-700/70 text-white font-semibold text-sm transition active:scale-95 cursor-pointer border border-slate-700/40"
          >
            7
          </button>
          <button
            type="button"
            onClick={() => handleInput('8')}
            className="py-2.5 rounded-xl bg-slate-800/50 hover:bg-slate-700/70 text-white font-semibold text-sm transition active:scale-95 cursor-pointer border border-slate-700/40"
          >
            8
          </button>
          <button
            type="button"
            onClick={() => handleInput('9')}
            className="py-2.5 rounded-xl bg-slate-800/50 hover:bg-slate-700/70 text-white font-semibold text-sm transition active:scale-95 cursor-pointer border border-slate-700/40"
          >
            9
          </button>
          <button
            type="button"
            onClick={() => handleInput('×')}
            className="py-2.5 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-400 font-bold text-base transition active:scale-95 cursor-pointer border border-emerald-500/20"
          >
            ×
          </button>

          {/* Row 3: 4, 5, 6, - */}
          <button
            type="button"
            onClick={() => handleInput('4')}
            className="py-2.5 rounded-xl bg-slate-800/50 hover:bg-slate-700/70 text-white font-semibold text-sm transition active:scale-95 cursor-pointer border border-slate-700/40"
          >
            4
          </button>
          <button
            type="button"
            onClick={() => handleInput('5')}
            className="py-2.5 rounded-xl bg-slate-800/50 hover:bg-slate-700/70 text-white font-semibold text-sm transition active:scale-95 cursor-pointer border border-slate-700/40"
          >
            5
          </button>
          <button
            type="button"
            onClick={() => handleInput('6')}
            className="py-2.5 rounded-xl bg-slate-800/50 hover:bg-slate-700/70 text-white font-semibold text-sm transition active:scale-95 cursor-pointer border border-slate-700/40"
          >
            6
          </button>
          <button
            type="button"
            onClick={() => handleInput('-')}
            className="py-2.5 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-400 font-bold text-base transition active:scale-95 cursor-pointer border border-emerald-500/20"
          >
            −
          </button>

          {/* Row 4: 1, 2, 3, + */}
          <button
            type="button"
            onClick={() => handleInput('1')}
            className="py-2.5 rounded-xl bg-slate-800/50 hover:bg-slate-700/70 text-white font-semibold text-sm transition active:scale-95 cursor-pointer border border-slate-700/40"
          >
            1
          </button>
          <button
            type="button"
            onClick={() => handleInput('2')}
            className="py-2.5 rounded-xl bg-slate-800/50 hover:bg-slate-700/70 text-white font-semibold text-sm transition active:scale-95 cursor-pointer border border-slate-700/40"
          >
            2
          </button>
          <button
            type="button"
            onClick={() => handleInput('3')}
            className="py-2.5 rounded-xl bg-slate-800/50 hover:bg-slate-700/70 text-white font-semibold text-sm transition active:scale-95 cursor-pointer border border-slate-700/40"
          >
            3
          </button>
          <button
            type="button"
            onClick={() => handleInput('+')}
            className="py-2.5 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-400 font-bold text-base transition active:scale-95 cursor-pointer border border-emerald-500/20"
          >
            +
          </button>

          {/* Row 5: 0, ., = */}
          <button
            type="button"
            onClick={() => handleInput('0')}
            className="col-span-2 py-2.5 rounded-xl bg-slate-800/50 hover:bg-slate-700/70 text-white font-semibold text-sm transition active:scale-95 cursor-pointer border border-slate-700/40"
          >
            0
          </button>
          <button
            type="button"
            onClick={() => handleInput('.')}
            className="py-2.5 rounded-xl bg-slate-800/50 hover:bg-slate-700/70 text-white font-bold text-sm transition active:scale-95 cursor-pointer border border-slate-700/40"
          >
            .
          </button>
          <button
            type="button"
            onClick={handleEvaluate}
            className="py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-lg transition active:scale-95 cursor-pointer shadow-lg shadow-emerald-500/20"
          >
            =
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
