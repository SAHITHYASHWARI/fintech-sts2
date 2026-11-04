import React, { useState, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import {
  ChevronLeft,
  ChevronRight,
  Bell,
  Receipt,
} from 'lucide-react';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// Currency Formatter for Indian Rupees (₹)
const formatINR = (value) => {
  const num = Number(value) || 0;
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
    minimumFractionDigits: 0,
  }).format(num);
};

// Seed scheduled bills including Nov 10, 11, 15, 22 as requested
const DEFAULT_BILLS = [
  {
    id: 'slice-bill-1',
    name: 'Slice Bill',
    title: 'Slice Bill',
    amount: 600,
    date: '2026-11-10', // Nov 10
    schedule: 'Monthly',
    category: 'Credit Card',
  },
  {
    id: 'slice-bill-2',
    name: 'Slice Bill',
    title: 'Slice Bill',
    amount: 600,
    date: '2026-11-11', // Nov 11
    schedule: 'Monthly',
    category: 'Card Settlement',
  },
  {
    id: 'aws-cloud-1',
    name: 'AWS Cloud Services',
    title: 'AWS Cloud Services',
    amount: 2400,
    date: '2026-11-15', // Nov 15
    schedule: 'Monthly',
    category: 'Infrastructure',
  },
  {
    id: 'airtel-wifi-1',
    name: 'Airtel Fiber Broadband',
    title: 'Airtel Fiber Broadband',
    amount: 999,
    date: '2026-11-22', // Nov 22
    schedule: 'Monthly',
    category: 'Utilities',
  },
  // Cross-month audit entries for October
  {
    id: 'slice-oct-1',
    name: 'Slice Bill',
    title: 'Slice Bill',
    amount: 600,
    date: '2026-10-10',
    schedule: 'Monthly',
    category: 'Credit Card',
  },
  {
    id: 'slice-oct-2',
    name: 'Slice Bill',
    title: 'Slice Bill',
    amount: 600,
    date: '2026-10-11',
    schedule: 'Monthly',
    category: 'Card Settlement',
  },
  {
    id: 'aws-oct-1',
    name: 'AWS Cloud Services',
    title: 'AWS Cloud Services',
    amount: 2400,
    date: '2026-10-15',
    schedule: 'Monthly',
    category: 'Infrastructure',
  },
  {
    id: 'airtel-oct-1',
    name: 'Airtel Fiber Broadband',
    title: 'Airtel Fiber Broadband',
    amount: 999,
    date: '2026-10-22',
    schedule: 'Monthly',
    category: 'Utilities',
  },
];

export default function CalendarModal({ isOpen, onClose }) {
  // Default view: November 2026 (Month index 10 in JS Date)
  const [currentDate, setCurrentDate] = useState(() => new Date(2026, 10, 1));
  const [bills, setBills] = useState([]);
  const [selectedDayBills, setSelectedDayBills] = useState(null);
  const [hoveredDay, setHoveredDay] = useState(null);

  // Load bills from localStorage and API
  useEffect(() => {
    if (!isOpen) return;

    let loadedBills = [];
    try {
      const stored = localStorage.getItem('sts_bills');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          loadedBills = parsed;
        }
      }
    } catch (e) {
      console.warn('Error reading sts_bills from localStorage:', e);
    }

    if (loadedBills.length === 0) {
      loadedBills = DEFAULT_BILLS;
      try {
        localStorage.setItem('sts_bills', JSON.stringify(DEFAULT_BILLS));
      } catch (e) {}
    }
    setBills(loadedBills);

    // Fetch fresh bills from backend API
    const fetchApiBills = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/segregation?type=bill`);
        if (res.ok) {
          const json = await res.json();
          let apiList = [];
          if (json.success && Array.isArray(json.data)) {
            apiList = json.data;
          } else if (Array.isArray(json)) {
            apiList = json.filter((r) => r.type === 'bill');
          }
          if (apiList.length > 0) {
            const combined = [...apiList, ...DEFAULT_BILLS];
            const unique = Array.from(
              new Map(combined.map((item) => [item.id || item.name, item])).values()
            );
            setBills(unique);
            try {
              localStorage.setItem('sts_bills', JSON.stringify(unique));
            } catch (e) {}
          }
        }
      } catch (err) {
        // Backend offline, keep local bills
      }
    };
    fetchApiBills();
  }, [isOpen]);

  // Keyboard Escape listener
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ];

  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  // Navigate months
  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
    setSelectedDayBills(null);
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
    setSelectedDayBills(null);
  };

  const handleNov2026 = () => {
    setCurrentDate(new Date(2026, 10, 1)); // November 2026
    setSelectedDayBills(null);
  };

  // Robust bill-to-date matcher supporting YYYY-MM-DD, DD/MM/YYYY, MM/DD/YYYY
  const matchBillToDate = (bill, targetYear, targetMonth, targetDay) => {
    if (!bill || !bill.date) return false;
    const dStr = String(bill.date).trim();

    // Hyphen format: YYYY-MM-DD
    if (dStr.includes('-')) {
      const parts = dStr.split('-');
      if (parts.length >= 3) {
        const bYear = parseInt(parts[0], 10);
        const bMonth = parseInt(parts[1], 10) - 1; // 0-indexed
        const bDay = parseInt(parts[2].slice(0, 2), 10);
        if (bYear === targetYear && bMonth === targetMonth && bDay === targetDay) {
          return true;
        }
      }
    }

    // Slash format: DD/MM/YYYY or MM/DD/YYYY
    if (dStr.includes('/')) {
      const parts = dStr.split('/');
      if (parts.length === 3) {
        const p1 = parseInt(parts[0], 10);
        const p2 = parseInt(parts[1], 10);
        const bYear = parseInt(parts[2], 10);
        if (bYear === targetYear) {
          if (p1 === targetDay && p2 - 1 === targetMonth) return true;
          if (p2 === targetDay && p1 - 1 === targetMonth) return true;
        }
      }
    }

    // Standard Date parsing
    const parsed = new Date(bill.date);
    if (!isNaN(parsed.getTime())) {
      if (
        parsed.getFullYear() === targetYear &&
        parsed.getMonth() === targetMonth &&
        parsed.getDate() === targetDay
      ) {
        return true;
      }
    }

    return false;
  };

  // Month grid calculations
  const { calendarCells, monthlyBillsCount, monthlyBillsTotal } = useMemo(() => {
    const firstDayIndex = new Date(year, month, 1).getDay();
    const totalDaysInMonth = new Date(year, month + 1, 0).getDate();
    const prevMonthDays = new Date(year, month, 0).getDate();

    const cells = [];

    // Previous month trailing days
    for (let i = firstDayIndex - 1; i >= 0; i--) {
      cells.push({
        day: prevMonthDays - i,
        isCurrentMonth: false,
        bills: [],
      });
    }

    let count = 0;
    let total = 0;

    // Current month days
    for (let day = 1; day <= totalDaysInMonth; day++) {
      const dayBills = bills.filter((b) => matchBillToDate(b, year, month, day));
      if (dayBills.length > 0) {
        count += dayBills.length;
        dayBills.forEach((b) => {
          total += Number(b.amount) || 0;
        });
      }

      cells.push({
        day,
        isCurrentMonth: true,
        bills: dayBills,
        isToday: year === 2026 && month === 10 && day === 10,
      });
    }

    // Next month leading days
    const totalCells = Math.ceil(cells.length / 7) * 7;
    const remaining = totalCells - cells.length;
    for (let i = 1; i <= remaining; i++) {
      cells.push({
        day: i,
        isCurrentMonth: false,
        bills: [],
      });
    }

    return {
      calendarCells: cells,
      monthlyBillsCount: count,
      monthlyBillsTotal: total,
    };
  }, [year, month, bills]);

  if (!isOpen || typeof document === 'undefined') return null;

  return createPortal(
    /* 1. Fixed overlay container centered on screen with backdrop blur */
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-xs p-4"
      onClick={onClose}
    >
      {/* 2. Centered Modal Card */}
      <div
        className="relative w-full max-w-sm sm:max-w-md mx-4 max-h-[90vh] overflow-y-auto bg-[#0c1424] border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-2xl animate-fadeIn text-slate-100 flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header with Exit (✕) Button */}
        <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800">
          <span className="text-sm font-bold text-white flex items-center gap-2 select-none">
            <span>📅</span> {monthNames[month]} {year}
          </span>
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

        {/* Month Navigation & Stats Bar */}
        <div className="pb-3 flex items-center justify-between border-b border-slate-800/60">
          <div className="flex items-center space-x-1.5">
            <button
              type="button"
              onClick={handlePrevMonth}
              className="p-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition cursor-pointer"
              title="Previous Month"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={handleNextMonth}
              className="p-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition cursor-pointer"
              title="Next Month"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={handleNov2026}
              className="px-2 py-0.5 rounded-lg text-[10px] font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/25 transition cursor-pointer"
            >
              Nov 2026
            </button>
          </div>

          <div className="text-right">
            <span className="text-xs font-semibold text-rose-400">
              {monthlyBillsCount} {monthlyBillsCount === 1 ? 'bill' : 'bills'}
            </span>
            <span className="text-xs text-slate-300 font-mono ml-1 font-bold">
              ({formatINR(monthlyBillsTotal)})
            </span>
          </div>
        </div>

        {/* Calendar Grid Container */}
        <div className="pt-3">
          {/* Day of Week Header */}
          <div className="grid grid-cols-7 gap-1 mb-1.5 text-center">
            {daysOfWeek.map((dayName, idx) => (
              <div
                key={dayName}
                className={`text-[10px] font-bold uppercase tracking-wider py-0.5 ${
                  idx === 0 || idx === 6 ? 'text-slate-500' : 'text-slate-400'
                }`}
              >
                {dayName}
              </div>
            ))}
          </div>

          {/* Days Cells Grid */}
          <div className="grid grid-cols-7 gap-1">
            {calendarCells.map((cell, idx) => {
              const hasBills = cell.bills && cell.bills.length > 0;
              const isHovered = hoveredDay === idx;
              const isSelected =
                selectedDayBills &&
                selectedDayBills.day === cell.day &&
                cell.isCurrentMonth;

              return (
                <div
                  key={idx}
                  onMouseEnter={() => setHoveredDay(idx)}
                  onMouseLeave={() => setHoveredDay(null)}
                  onClick={() => {
                    if (hasBills && cell.isCurrentMonth) {
                      setSelectedDayBills({
                        day: cell.day,
                        month: monthNames[month],
                        year,
                        bills: cell.bills,
                      });
                    }
                  }}
                  className={`relative min-h-[46px] rounded-xl p-1 flex flex-col items-center justify-between transition cursor-pointer select-none ${
                    !cell.isCurrentMonth
                      ? 'text-slate-600 bg-slate-900/20 border border-transparent'
                      : hasBills
                      ? 'bg-rose-500/20 text-rose-400 font-bold border border-rose-500 shadow-sm shadow-rose-500/10'
                      : cell.isToday
                      ? 'bg-emerald-500/10 text-emerald-400 font-bold border border-emerald-500/40'
                      : isSelected
                      ? 'bg-slate-800 text-white border border-slate-600'
                      : 'bg-slate-800/40 text-slate-300 hover:bg-slate-800/80 border border-slate-800/60'
                  }`}
                >
                  {/* Day Number */}
                  <span
                    className={`text-[11px] leading-none ${
                      hasBills
                        ? 'font-black text-rose-400'
                        : cell.isCurrentMonth
                        ? 'font-medium'
                        : 'text-slate-600'
                    }`}
                  >
                    {cell.day}
                  </span>

                  {/* Red Indicator Dot for bills scheduled */}
                  {hasBills && (
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-500 shadow-sm shadow-rose-500/80 my-0.5" />
                  )}

                  {/* Amount Pill snippet */}
                  {hasBills && (
                    <span className="text-[8px] font-mono font-bold text-rose-300 truncate max-w-full leading-tight">
                      {formatINR(cell.bills[0].amount)}
                    </span>
                  )}

                  {/* Tooltip on Hover revealing Title & Amount (e.g., "Slice bill: ₹600") */}
                  {hasBills && isHovered && (
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max max-w-[200px] z-30 p-2.5 rounded-xl bg-slate-950/95 border border-rose-500/80 shadow-2xl text-left pointer-events-none animate-fadeIn backdrop-blur-md">
                      <div className="flex items-center space-x-1 text-rose-400 mb-1">
                        <Bell className="w-3 h-3" />
                        <span className="text-[9px] font-bold uppercase tracking-wider">
                          Scheduled Due
                        </span>
                      </div>
                      {cell.bills.map((b, bIdx) => (
                        <div key={bIdx} className="text-xs leading-tight">
                          <p className="font-bold text-white">
                            {b.name || b.title || 'Bill'}:{' '}
                            <span className="text-rose-400 font-mono font-black">
                              {formatINR(b.amount)}
                            </span>
                          </p>
                          {b.category && (
                            <p className="text-[9px] text-slate-400 mt-0.5">{b.category}</p>
                          )}
                        </div>
                      ))}
                      <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-950" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Selected Day Bill Details Card Drawer */}
        {selectedDayBills ? (
          <div className="mt-3 p-3 rounded-2xl bg-[#080d18] border border-slate-800 animate-fadeIn">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-1.5">
                <Receipt className="w-3.5 h-3.5 text-rose-400" />
                <h5 className="text-[11px] font-bold text-white">
                  Dues on {selectedDayBills.day} {selectedDayBills.month} {selectedDayBills.year}
                </h5>
              </div>
              <button
                type="button"
                onClick={() => setSelectedDayBills(null)}
                className="text-[10px] text-slate-400 hover:text-slate-200 transition cursor-pointer"
              >
                Dismiss
              </button>
            </div>

            <div className="space-y-1.5">
              {selectedDayBills.bills.map((bill, bIdx) => (
                <div
                  key={bIdx}
                  className="p-2 rounded-xl bg-[#0c1424] border border-rose-500/30 flex items-center justify-between"
                >
                  <div>
                    <p className="text-xs font-bold text-white">{bill.name || bill.title}</p>
                    <p className="text-[9px] text-slate-400">
                      {bill.category || 'Recurring Payment'} • {bill.schedule || 'Scheduled'}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-mono font-black text-rose-400">
                      {formatINR(bill.amount)}
                    </p>
                    <span className="text-[8px] uppercase font-bold text-rose-400 bg-rose-500/15 px-1 py-0.2 rounded">
                      Due
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
            <div className="flex items-center space-x-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
              <span>Red highlights indicate scheduled bill dues</span>
            </div>
            <span className="text-[10px] text-slate-500">Hover date for info</span>
          </div>
        )}
      </div>
    </div>,
    document.body
  );
}
