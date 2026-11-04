import React, { useState } from 'react';
import {
  Wallet,
  Plus,
  Search,
  Users,
  X,
  ArrowLeft,
  ArrowRight,
  Receipt,
  Share2,
  Download,
  CheckCircle2,
  User,
  Trash2,
  Check,
  ChevronDown,
} from 'lucide-react';

export default function SplitAndCollectPlaceholder() {
  // =========================================================================
  // Core Component State
  // =========================================================================
  const [ticketsList, setTicketsList] = useState([]);
  const [activeTicket, setActiveTicket] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Modal State: Create Ticket
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [ticketTitle, setTicketTitle] = useState('');
  const [ticketCurrency, setTicketCurrency] = useState('INR (₹)');
  const [ticketDescription, setTicketDescription] = useState('');
  const [participantName, setParticipantName] = useState('');
  const [participantEmail, setParticipantEmail] = useState('');
  const [participants, setParticipants] = useState([
    { id: 'user-you', name: 'You', email: 'admin@stsfintech.com', isSelf: true },
  ]);

  // Modal State: Add Expense (in Active Ticket Detail View)
  const [showAddExpenseModal, setShowAddExpenseModal] = useState(false);
  const [expenseTitle, setExpenseTitle] = useState('');
  const [expenseAmount, setExpenseAmount] = useState('');
  const [expensePaidBy, setExpensePaidBy] = useState('You');
  const [expenseSearchQuery, setExpenseSearchQuery] = useState('');

  // =========================================================================
  // Handlers for Creating Ticket
  // =========================================================================
  const handleAddParticipant = () => {
    if (!participantName.trim()) return;

    const newParticipant = {
      id: `part-${Date.now()}`,
      name: participantName.trim(),
      email: participantEmail.trim() || `${participantName.toLowerCase().replace(/\s+/g, '')}@stsfintech.com`,
      isSelf: false,
    };

    setParticipants([...participants, newParticipant]);
    setParticipantName('');
    setParticipantEmail('');
  };

  const handleRemoveParticipant = (idToRemove) => {
    // Keep 'You' in the group
    setParticipants(participants.filter((p) => p.id !== idToRemove || p.isSelf));
  };

  const handleCreateTicket = (e) => {
    e.preventDefault();
    if (!ticketTitle.trim()) return;

    const newTicket = {
      id: `ticket-${Date.now()}`,
      title: ticketTitle.trim(),
      currency: ticketCurrency,
      description: ticketDescription.trim() || 'Team collaborative split ledger',
      createdAt: new Date().toISOString(),
      participants: [...participants],
      expenses: [],
    };

    setTicketsList([newTicket, ...ticketsList]);
    setActiveTicket(newTicket);
    setShowCreateModal(false);

    // Reset form
    setTicketTitle('');
    setTicketDescription('');
    setTicketCurrency('INR (₹)');
    setParticipants([{ id: 'user-you', name: 'You', email: 'admin@stsfintech.com', isSelf: true }]);
  };

  // =========================================================================
  // Handlers for Adding Expense to Active Ticket
  // =========================================================================
  const handleAddExpense = (e) => {
    e.preventDefault();
    const amountNum = parseFloat(expenseAmount);
    if (!expenseTitle.trim() || isNaN(amountNum) || amountNum <= 0) return;

    const newExpense = {
      id: `exp-${Date.now()}`,
      title: expenseTitle.trim(),
      amount: amountNum,
      paidBy: expensePaidBy,
      createdAt: new Date().toISOString(),
      splitWith: activeTicket.participants.map((p) => p.name),
    };

    const updatedTicket = {
      ...activeTicket,
      expenses: [newExpense, ...activeTicket.expenses],
    };

    // Update both activeTicket and the ticket in ticketsList
    setActiveTicket(updatedTicket);
    setTicketsList(ticketsList.map((t) => (t.id === updatedTicket.id ? updatedTicket : t)));

    // Reset form
    setExpenseTitle('');
    setExpenseAmount('');
    setExpensePaidBy('You');
    setShowAddExpenseModal(false);
  };

  // =========================================================================
  // Settlement Handler for Debts
  // =========================================================================
  const handleSettleDebt = (debtId) => {
    if (!activeTicket) return;
    const currentSettled = activeTicket.settledDebtIds || [];
    if (currentSettled.includes(debtId)) return;

    const updatedSettled = [...currentSettled, debtId];
    const updatedTicket = {
      ...activeTicket,
      settledDebtIds: updatedSettled,
    };

    setActiveTicket(updatedTicket);
    setTicketsList((prev) =>
      prev.map((t) => (t.id === updatedTicket.id ? updatedTicket : t))
    );
  };

  // =========================================================================
  // Calculation Helpers
  // =========================================================================
  const calculateTotalOutlay = (ticket) => {
    if (!ticket || !ticket.expenses) return 0;
    return ticket.expenses.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);
  };

  const formatCurrency = (val, currencyStr = 'INR (₹)') => {
    const symbol = currencyStr.includes('$')
      ? '$'
      : currencyStr.includes('€')
      ? '€'
      : currencyStr.includes('£')
      ? '£'
      : '₹';
    return `${symbol}${Number(val).toLocaleString('en-IN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  // Compute simplified debt transactions minimizing payments
  const calculateSimplifiedDebts = (ticket) => {
    if (!ticket || !ticket.participants || !ticket.expenses || ticket.expenses.length === 0) {
      return [];
    }

    const totalOutlay = calculateTotalOutlay(ticket);
    const count = ticket.participants.length || 1;
    const equalShare = totalOutlay / count;

    // Calculate raw net balance for each participant
    const rawBalances = ticket.participants.map((p) => {
      const totalPaid = (ticket.expenses || [])
        .filter((exp) => exp.paidBy === p.name)
        .reduce((sum, exp) => sum + exp.amount, 0);
      const net = totalPaid - equalShare;
      return {
        name: p.name,
        net: Math.round(net * 100) / 100,
      };
    });

    const debtors = [];
    const creditors = [];

    rawBalances.forEach((p) => {
      if (p.net < -0.01) {
        debtors.push({ name: p.name, amount: Math.abs(p.net) });
      } else if (p.net > 0.01) {
        creditors.push({ name: p.name, amount: p.net });
      }
    });

    // Sort descending by amount to generate direct and minimized debt paths
    debtors.sort((a, b) => b.amount - a.amount);
    creditors.sort((a, b) => b.amount - a.amount);

    const transactions = [];
    let dIdx = 0;
    let cIdx = 0;
    const settledIds = ticket.settledDebtIds || [];

    while (dIdx < debtors.length && cIdx < creditors.length) {
      const debtor = debtors[dIdx];
      const creditor = creditors[cIdx];

      const settleAmount = Math.min(debtor.amount, creditor.amount);
      const roundedAmount = Math.round(settleAmount * 100) / 100;

      if (roundedAmount > 0.01) {
        const debtId = `debt-${debtor.name.replace(/\s+/g, '_')}-${creditor.name.replace(/\s+/g, '_')}-${roundedAmount}`;
        transactions.push({
          id: debtId,
          from: debtor.name,
          to: creditor.name,
          amount: roundedAmount,
          isSettled: settledIds.includes(debtId),
        });
      }

      debtor.amount = Math.round((debtor.amount - settleAmount) * 100) / 100;
      creditor.amount = Math.round((creditor.amount - settleAmount) * 100) / 100;

      if (debtor.amount < 0.01) dIdx++;
      if (creditor.amount < 0.01) cIdx++;
    }

    return transactions;
  };

  // Compute individual balances for active ticket with settled debt deductions
  const computeParticipantBalances = (ticket, simplifiedDebts = []) => {
    if (!ticket || !ticket.participants) return [];
    const totalOutlay = calculateTotalOutlay(ticket);
    const count = ticket.participants.length || 1;
    const equalShare = totalOutlay / count;

    // Calculate settlement adjustments for each participant
    const adjustments = {};
    ticket.participants.forEach((p) => {
      adjustments[p.name] = 0;
    });

    simplifiedDebts.forEach((debt) => {
      if (debt.isSettled) {
        // Payer (debtor) has settled: increases balance towards 0
        if (adjustments[debt.from] !== undefined) {
          adjustments[debt.from] += debt.amount;
        }
        // Receiver (creditor) has received: decreases balance towards 0
        if (adjustments[debt.to] !== undefined) {
          adjustments[debt.to] -= debt.amount;
        }
      }
    });

    return ticket.participants.map((participant) => {
      const totalPaidByPerson = (ticket.expenses || [])
        .filter((exp) => exp.paidBy === participant.name)
        .reduce((sum, exp) => sum + exp.amount, 0);

      const rawBalance = totalPaidByPerson - equalShare;
      const netBalance = Math.round((rawBalance + (adjustments[participant.name] || 0)) * 100) / 100;

      return {
        ...participant,
        totalPaid: totalPaidByPerson,
        netBalance: Math.abs(netBalance) < 0.01 ? 0 : netBalance,
      };
    });
  };

  // Filtered tickets based on search input
  const filteredTickets = ticketsList.filter((ticket) =>
    ticket.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    ticket.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Filtered expenses in active ticket
  const filteredExpenses = (activeTicket?.expenses || []).filter((exp) =>
    exp.title.toLowerCase().includes(expenseSearchQuery.toLowerCase()) ||
    exp.paidBy.toLowerCase().includes(expenseSearchQuery.toLowerCase())
  );

  // =========================================================================
  // STATE 3: Active Split Ticket Detail Page
  // =========================================================================
  if (activeTicket) {
    const totalOutlay = calculateTotalOutlay(activeTicket);
    const simplifiedDebts = calculateSimplifiedDebts(activeTicket);
    const participantBalances = computeParticipantBalances(activeTicket, simplifiedDebts);
    const currencyTag = activeTicket.currency?.split(' ')[0] || 'INR';
    const allDebtsSettled = simplifiedDebts.length > 0 && simplifiedDebts.every((d) => d.isSettled);

    return (
      <div className="space-y-6 animate-fadeIn pb-12">
        {/* Top Bar Navigation */}
        <div className="flex items-center justify-between pb-2 border-b border-slate-200">
          <button
            onClick={() => setActiveTicket(null)}
            className="inline-flex items-center space-x-1.5 text-sm font-semibold text-slate-600 hover:text-[#0d5236] transition cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to all tickets</span>
          </button>

          <button
            onClick={() => setShowAddExpenseModal(true)}
            className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-[#0d5236] hover:bg-[#093d28] text-white text-xs sm:text-sm font-semibold shadow-sm transition active:scale-95 cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Add Expense</span>
          </button>
        </div>

        {/* Ticket Summary Banner */}
        <div className="rounded-2xl bg-white dark:bg-[#0c1322] border border-slate-200 dark:border-slate-800 p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6 transition-colors">
          <div className="space-y-2">
            <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-emerald-50 dark:bg-emerald-950/60 text-[#0d5236] dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
              {currencyTag} GROUP
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-slate-100 tracking-tight capitalize">
              {activeTicket.title}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {activeTicket.description} • Created by You on{' '}
              {new Date(activeTicket.createdAt).toLocaleDateString('en-IN', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              })}
            </p>
          </div>

          <div className="md:text-right p-4 rounded-xl bg-slate-50 dark:bg-[#080d19] border border-slate-200 dark:border-slate-800 md:bg-transparent md:border-0 md:p-0">
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              TOTAL GROUP OUTLAY
            </p>
            <p className="text-2xl sm:text-3xl font-black text-[#0d5236] dark:text-emerald-400 mt-0.5">
              {formatCurrency(totalOutlay, activeTicket.currency)}
            </p>
            <p className="text-[11px] text-slate-400 mt-1">
              {activeTicket.participants.length} active participant
              {activeTicket.participants.length > 1 ? 's' : ''}
            </p>
          </div>
        </div>

        {/* Split 2-Column Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* =============================================================== */}
          {/* LEFT COLUMN: LOGGED EXPENSES                                     */}
          {/* =============================================================== */}
          <div className="lg:col-span-7 bg-white dark:bg-[#0c1322] rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-4 transition-colors">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center space-x-2.5">
                <h3 className="text-xs font-black tracking-wider uppercase text-slate-700 dark:text-slate-300">
                  LOGGED EXPENSES
                </h3>
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                  {activeTicket.expenses.length} Sessions
                </span>
              </div>

              {/* Action Icons */}
              <div className="flex items-center space-x-1.5 text-slate-400">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={expenseSearchQuery}
                    onChange={(e) => setExpenseSearchQuery(e.target.value)}
                    placeholder="Filter..."
                    className="pl-7 pr-2 py-1 text-xs rounded-lg border border-slate-200 bg-slate-50 focus:outline-none focus:ring-1 focus:ring-[#0d5236] w-28 sm:w-32"
                  />
                </div>
                <button
                  type="button"
                  title="Share breakdown"
                  onClick={() => alert(`Share link copied for ${activeTicket.title}`)}
                  className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-slate-800 transition cursor-pointer"
                >
                  <Share2 className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  title="Download CSV"
                  onClick={() => alert('Exporting split ledger to CSV...')}
                  className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-slate-800 transition cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Expenses List or Empty State */}
            {filteredExpenses.length === 0 ? (
              <div className="py-12 px-4 rounded-xl border border-dashed border-slate-200 bg-slate-50/60 text-center space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-white border border-slate-200 text-slate-400 mx-auto flex items-center justify-center shadow-sm">
                  <Receipt className="w-6 h-6 stroke-[1.5]" />
                </div>
                <div className="space-y-1">
                  <h4 className="text-sm font-bold text-slate-800">No Expenses Found</h4>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
                    Click &apos;+ Add Expense&apos; to record dinners, travel costs, or team bills in this split ticket.
                  </p>
                </div>
                <button
                  onClick={() => setShowAddExpenseModal(true)}
                  className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-[#0d5236] text-white text-xs font-semibold hover:bg-[#093d28] transition shadow-sm cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Record First Expense</span>
                </button>
              </div>
            ) : (
              <div className="space-y-2.5">
                {filteredExpenses.map((exp) => (
                  <div
                    key={exp.id}
                    className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between hover:bg-slate-100/70 transition"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-9 h-9 rounded-xl bg-emerald-100/70 text-[#0d5236] flex items-center justify-center font-bold text-xs">
                        <Receipt className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-900">{exp.title}</p>
                        <p className="text-[11px] text-slate-500">
                          Paid by <span className="font-semibold text-slate-700">{exp.paidBy}</span> •{' '}
                          Split equally across {activeTicket.participants.length}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-black font-mono text-[#0d5236]">
                        {formatCurrency(exp.amount, activeTicket.currency)}
                      </p>
                      <p className="text-[10px] text-slate-400">
                        {new Date(exp.createdAt).toLocaleDateString('en-IN', {
                          month: 'short',
                          day: 'numeric',
                        })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* =============================================================== */}
          {/* RIGHT COLUMN: BALANCES & SETTLEMENTS                            */}
          {/* =============================================================== */}
          <div className="lg:col-span-5 space-y-5">
            {/* Summary (INR) Card */}
            <div className="bg-white dark:bg-[#0c1322] rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-4 transition-colors">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <h3 className="text-xs font-black tracking-wider uppercase text-slate-700 dark:text-slate-300">
                  Summary ({currencyTag})
                </h3>
                <span className="text-[10px] font-bold text-emerald-800 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-800">
                  REAL-TIME LEDGER
                </span>
              </div>

              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {participantBalances.map((member) => {
                  const isSettled = Math.abs(member.netBalance) < 0.01;
                  const isPositive = member.netBalance > 0.01;

                  return (
                    <div key={member.id} className="py-3 flex items-center justify-between">
                      <div className="flex items-center space-x-2.5">
                        <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 flex items-center justify-center font-bold text-xs">
                          {member.name.slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <p className="text-xs font-bold text-slate-900 dark:text-slate-100 flex items-center space-x-1.5">
                            <span>{member.name}</span>
                            {member.isSelf && (
                              <span className="text-[9px] font-semibold text-slate-400">(You)</span>
                            )}
                          </p>
                          <p className="text-[10px] text-slate-400">{member.email}</p>
                        </div>
                      </div>

                      <div className="text-right flex items-center space-x-2">
                        {isSettled ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-[#0d5236] border border-emerald-200">
                            Settled
                          </span>
                        ) : isPositive ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            Gets {formatCurrency(member.netBalance, activeTicket.currency)}
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                            Owes {formatCurrency(Math.abs(member.netBalance), activeTicket.currency)}
                          </span>
                        )}

                        <span className="font-mono text-xs font-bold text-slate-700 min-w-[50px] text-right">
                          {isSettled
                            ? formatCurrency(0, activeTicket.currency)
                            : isPositive
                            ? `+${formatCurrency(member.netBalance, activeTicket.currency)}`
                            : `-${formatCurrency(Math.abs(member.netBalance), activeTicket.currency)}`}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Simplified Debts Card */}
            <div className="rounded-2xl bg-[#0c1322] border border-slate-800 p-5 text-white shadow-md space-y-3.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold uppercase tracking-wider text-slate-400 flex items-center space-x-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Simplified Debts</span>
                </span>
                <span className="text-[10px] font-bold bg-emerald-950 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded">
                  Optimized
                </span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Automated debt simplification minimizes total transactions required to balance accounts among all group members.
              </p>

              {/* Status Banner when all debts are settled */}
              {allDebtsSettled && (
                <div className="p-3 rounded-xl bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 text-xs font-bold flex items-center space-x-2 animate-fadeIn shadow-sm">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  <span>All debts are fully settled! ✓</span>
                </div>
              )}

              {/* Transaction List */}
              {simplifiedDebts.length === 0 ? (
                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-[11px] text-slate-300 flex items-center space-x-2">
                  <Check className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                  <span>
                    {activeTicket.expenses.length === 0
                      ? 'No outstanding balances. All accounts are settled at ₹0.00.'
                      : 'All accounts are balanced.'}
                  </span>
                </div>
              ) : (
                <div className="space-y-2 pt-1">
                  {simplifiedDebts.map((debt) => (
                    <div
                      key={debt.id}
                      className={`p-3 rounded-xl border transition flex items-center justify-between gap-3 ${
                        debt.isSettled
                          ? 'bg-slate-900/60 border-emerald-500/20 opacity-80'
                          : 'bg-slate-900/90 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center space-x-2 min-w-0 flex-1">
                        <span className="font-semibold text-xs text-slate-100 truncate">
                          {debt.from}
                        </span>
                        <span className="text-[11px] text-slate-400 font-normal">pays</span>
                        <ArrowRight className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                        <span className="font-semibold text-xs text-slate-100 truncate">
                          {debt.to}
                        </span>
                      </div>

                      <div className="flex items-center space-x-3 flex-shrink-0">
                        <span className="font-mono text-xs font-black text-emerald-400">
                          {formatCurrency(debt.amount, activeTicket.currency)}
                        </span>

                        {debt.isSettled ? (
                          <button
                            disabled
                            className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-lg text-[11px] font-bold bg-emerald-950 text-emerald-300 border border-emerald-500/40 opacity-90 cursor-not-allowed"
                          >
                            <Check className="w-3 h-3 stroke-[3]" />
                            <span>Settled ✓</span>
                          </button>
                        ) : (
                          <button
                            onClick={() => handleSettleDebt(debt.id)}
                            className="inline-flex items-center space-x-1 px-3 py-1 rounded-lg text-[11px] font-bold bg-emerald-600 hover:bg-emerald-500 text-white transition shadow-sm active:scale-95 cursor-pointer"
                          >
                            <span>Settle</span>
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Modal: Add Expense */}
        {showAddExpenseModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn">
            <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto p-6 space-y-5 relative">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div>
                  <h3 className="text-lg font-black text-slate-900">Record New Expense</h3>
                  <p className="text-xs text-slate-500">Add an expense to &quot;{activeTicket.title}&quot;</p>
                </div>
                <button
                  onClick={() => setShowAddExpenseModal(false)}
                  className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleAddExpense} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
                    Expense Title
                  </label>
                  <input
                    type="text"
                    required
                    value={expenseTitle}
                    onChange={(e) => setExpenseTitle(e.target.value)}
                    placeholder="e.g. Seafood Dinner, Airport Taxi"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0d5236]/40 focus:bg-white"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
                      Amount ({currencyTag})
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0.01"
                      required
                      value={expenseAmount}
                      onChange={(e) => setExpenseAmount(e.target.value)}
                      placeholder="0.00"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-900 font-mono focus:outline-none focus:ring-2 focus:ring-[#0d5236]/40 focus:bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
                      Paid By
                    </label>
                    <select
                      value={expensePaidBy}
                      onChange={(e) => setExpensePaidBy(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0d5236]/40 focus:bg-white"
                    >
                      {activeTicket.participants.map((p) => (
                        <option key={p.id} value={p.name}>
                          {p.name} {p.isSelf ? '(You)' : ''}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600">
                  <span className="font-bold text-slate-800">Split Method:</span> Split equally between all{' '}
                  <span className="font-semibold text-[#0d5236]">
                    {activeTicket.participants.length} members
                  </span>
                  .
                </div>

                <button
                  type="submit"
                  className="w-full py-3 rounded-xl bg-[#0d5236] hover:bg-[#093d28] text-white font-bold text-sm shadow-md transition cursor-pointer active:scale-95"
                >
                  Save Expense
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    );
  }

  // =========================================================================
  // STATE 1 & STATE 2: Tickets List View (Default) + Create Ticket Modal
  // =========================================================================
  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-100 text-[#0d5236] flex items-center justify-center shadow-sm">
              <Wallet className="w-5 h-5 stroke-[2.2]" />
            </div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">
              Splitwise &amp; Collect
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Divide collaborative bills, track expenses, and simplify balances with team members.
          </p>
        </div>

        {/* Top Right Button: + New Split Ticket */}
        <button
          onClick={() => setShowCreateModal(true)}
          className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-[#0d5236] hover:bg-[#093d28] text-white text-xs sm:text-sm font-semibold shadow-sm transition active:scale-95 cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>New Split Ticket</span>
        </button>
      </div>

      {/* Search Input Bar */}
      <div className="relative max-w-md">
        <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search split tickets..."
          className="w-full bg-white dark:bg-[#0c1322] border border-slate-200 dark:border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0d5236]/30 focus:border-[#0d5236] transition shadow-sm"
        />
      </div>

      {/* Tickets List OR Empty State Display */}
      {filteredTickets.length === 0 ? (
        <div className="rounded-3xl bg-white dark:bg-[#0c1322] border border-slate-200 dark:border-slate-800 p-12 sm:p-16 text-center max-w-xl mx-auto shadow-sm space-y-5 my-8 transition-colors">
          {/* Centered Users Outline Icon */}
          <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-400 mx-auto flex items-center justify-center">
            <Users className="w-8 h-8 stroke-[1.5]" />
          </div>

          <div className="space-y-1.5">
            <h3 className="text-xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
              No Active Split Tickets
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto leading-relaxed">
              Create a new split ticket to begin tracking collaborative expenses with your co-workers.
            </p>
          </div>

          <button
            onClick={() => setShowCreateModal(true)}
            className="inline-flex items-center space-x-2 px-4 py-2 rounded-xl bg-[#0d5236] hover:bg-[#093d28] text-white text-xs font-bold transition shadow-sm cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Create First Ticket</span>
          </button>
        </div>
      ) : (
        /* Grid of Tickets when tickets exist */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredTickets.map((ticket) => {
            const outlay = calculateTotalOutlay(ticket);
            return (
              <div
                key={ticket.id}
                onClick={() => setActiveTicket(ticket)}
                className="p-5 rounded-2xl bg-white dark:bg-[#0c1322] border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md hover:border-[#0d5236]/40 transition cursor-pointer space-y-3"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-[#0d5236] dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 uppercase">
                      {ticket.currency?.split(' ')[0]} GROUP
                    </span>
                    <h4 className="text-base font-bold text-slate-900 dark:text-slate-100 mt-1 capitalize">
                      {ticket.title}
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1">{ticket.description}</p>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                  <div className="flex items-center space-x-1.5 text-slate-500 dark:text-slate-400">
                    <Users className="w-3.5 h-3.5" />
                    <span>{ticket.participants.length} members</span>
                  </div>
                  <div className="text-right">
                    <span className="font-mono font-bold text-sm text-[#0d5236] dark:text-emerald-400">
                      {formatCurrency(outlay, ticket.currency)}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ========================================================================= */}
      {/* STATE 2: "Create Split Ticket" Modal Popup                                 */}
      {/* ========================================================================= */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white dark:bg-[#0c1322] rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto p-6 sm:p-8 space-y-6 relative">
            {/* Modal Header & Close Button */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center space-x-2.5">
                <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-[#0d5236] dark:text-emerald-400 flex items-center justify-center">
                  <Wallet className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-900 dark:text-slate-100">Create Split Ticket</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Start a group ledger for collaborative expenses</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateTicket} className="space-y-5">
              {/* Field 1: Ticket Title */}
              <div>
                <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
                  Ticket Title
                </label>
                <input
                  type="text"
                  required
                  value={ticketTitle}
                  onChange={(e) => setTicketTitle(e.target.value)}
                  placeholder="e.g. Goa Trip, Office lunch split"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0d5236]/40 focus:bg-white transition"
                />
              </div>

              {/* Field 2: Group Currency & Description (2-column row) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
                    Group Currency
                  </label>
                  <select
                    value={ticketCurrency}
                    onChange={(e) => setTicketCurrency(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0d5236]/40 focus:bg-white transition cursor-pointer"
                  >
                    <option value="INR (₹)">INR (₹)</option>
                    <option value="USD ($)">USD ($)</option>
                    <option value="EUR (€)">EUR (€)</option>
                    <option value="GBP (£)">GBP (£)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
                    Description
                  </label>
                  <input
                    type="text"
                    value={ticketDescription}
                    onChange={(e) => setTicketDescription(e.target.value)}
                    placeholder="Optional details"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0d5236]/40 focus:bg-white transition"
                  />
                </div>
              </div>

              {/* Field 3: Participants List */}
              <div className="space-y-2.5">
                <label className="block text-xs font-bold uppercase text-slate-700">
                  Participants List
                </label>

                {/* 2 Inputs with + Add button */}
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-2">
                  <div className="sm:col-span-5">
                    <input
                      type="text"
                      value={participantName}
                      onChange={(e) => setParticipantName(e.target.value)}
                      placeholder="Add participant name..."
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0d5236]/40 focus:bg-white"
                    />
                  </div>
                  <div className="sm:col-span-5">
                    <input
                      type="email"
                      value={participantEmail}
                      onChange={(e) => setParticipantEmail(e.target.value)}
                      placeholder="enter mail"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0d5236]/40 focus:bg-white"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <button
                      type="button"
                      onClick={handleAddParticipant}
                      className="w-full h-full py-2 px-3 rounded-xl bg-[#0d5236] hover:bg-[#093d28] text-white text-xs font-bold transition shadow-sm flex items-center justify-center cursor-pointer"
                    >
                      + Add
                    </button>
                  </div>
                </div>

                {/* Pill Chips Showing Added Participants */}
                <div className="flex flex-wrap gap-2 pt-2">
                  {participants.map((p) => (
                    <span
                      key={p.id}
                      className={`inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-medium border ${
                        p.isSelf
                          ? 'bg-emerald-50 text-[#0d5236] border-emerald-300 font-bold'
                          : 'bg-slate-100 text-slate-800 border-slate-200'
                      }`}
                    >
                      <span>{p.name}</span>
                      {!p.isSelf && (
                        <button
                          type="button"
                          onClick={() => handleRemoveParticipant(p.id)}
                          className="hover:text-rose-600 transition ml-0.5 cursor-pointer"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </span>
                  ))}
                </div>
              </div>

              {/* Submit Button: Full-width dark green #0d5236, rounded-xl */}
              <button
                type="submit"
                className="w-full py-3.5 rounded-xl bg-[#0d5236] hover:bg-[#093d28] text-white font-bold text-sm shadow-md transition cursor-pointer active:scale-95"
              >
                Create Ticket
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
