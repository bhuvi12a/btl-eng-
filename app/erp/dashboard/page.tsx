'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface HealthData {
    service: string;
    version: string;
    timestamp: string;
    environment: string;
    database: {
        orm: string;
        driver: string;
        status: string;
        latencyMs: number | null;
        error: string | null;
    };
    supabase: {
        configured: boolean;
        url: string;
    };
}

interface ExpenseItem {
    id: string;
    title: string;
    category: string;
    amount: string;
    taxAmount: string;
    status: 'pending_approval' | 'approved' | 'rejected' | 'paid';
    expenseDate: string;
    paymentMode: string;
    vendorName?: string;
    invoiceNumber?: string;
    notes?: string;
}

export default function ErpDashboardPage() {
    const [health, setHealth] = useState<HealthData | null>(null);
    const [loading, setLoading] = useState(true);

    // 1. GPS Self-Attendance States
    const [punching, setPunching] = useState(false);
    const [punchFeedback, setPunchFeedback] = useState<{ message: string; isGpsVerified: boolean; distance?: number } | null>(null);
    const [punchError, setPunchError] = useState<string | null>(null);
    const [empCode, setEmpCode] = useState('BTL-CNC-01');

    // 2. P&L / Margin Summary States
    const [marginSummary, setMarginSummary] = useState({
        totalOperatingExpenses: '0.00',
        inventoryGrossRevenuePotential: '0.00',
        inventoryCostValuation: '0.00',
        grossProfit: '0.00',
        grossMarginPercent: '34.2%',
        netMarginEstimate: '22.5%',
    });

    // 3. Operating Expenses List & Approval State
    const [expensesList, setExpensesList] = useState<ExpenseItem[]>([]);
    const [updatingExpenseId, setUpdatingExpenseId] = useState<string | null>(null);
    const [showNewExpenseModal, setShowNewExpenseModal] = useState(false);
    const [newExpense, setNewExpense] = useState({
        title: '',
        category: 'cnc_tooling_inserts',
        amount: '',
        taxAmount: '',
        expenseDate: new Date().toISOString().split('T')[0],
        paymentMode: 'Bank Transfer',
        vendorName: '',
        invoiceNumber: '',
        notes: '',
    });
    const [submittingExpense, setSubmittingExpense] = useState(false);
    const [expenseMsg, setExpenseMsg] = useState<string | null>(null);

    const fetchHealthAndMetrics = () => {
        setLoading(true);
        Promise.all([
            fetch('/api/health').then((r) => r.json()).catch(() => null),
            fetch('/api/expenses').then((r) => r.json()).catch(() => null),
        ]).then(([healthData, expenseData]) => {
            if (healthData) setHealth(healthData);
            if (expenseData?.marginSummary) setMarginSummary(expenseData.marginSummary);
            if (expenseData?.expenses && Array.isArray(expenseData.expenses)) {
                setExpensesList(expenseData.expenses);
            }
            setLoading(false);
        });
    };

    useEffect(() => {
        fetchHealthAndMetrics();
    }, []);

    // Handle GPS-Based Self Attendance Punch
    const handleGpsPunch = (type: 'in' | 'out') => {
        setPunching(true);
        setPunchError(null);
        setPunchFeedback(null);

        if (!navigator.geolocation) {
            setPunchError('Geolocation is not supported by your browser. Please enable GPS.');
            setPunching(false);
            return;
        }

        navigator.geolocation.getCurrentPosition(
            async (pos) => {
                const { latitude, longitude } = pos.coords;
                try {
                    const res = await fetch('/api/attendance/punch', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            employeeCode: empCode,
                            latitude,
                            longitude,
                            punchType: type,
                        }),
                    });

                    const data = await res.json();
                    if (data.success) {
                        setPunchFeedback({
                            message: data.message,
                            isGpsVerified: data.gpsVerified,
                            distance: data.distanceMeters,
                        });
                    } else {
                        setPunchError(data.error || 'Failed to record punch.');
                    }
                } catch {
                    setPunchError('Network error connecting to attendance service.');
                } finally {
                    setPunching(false);
                }
            },
            (err) => {
                setPunchError(`GPS Error: ${err.message}. Please enable location permissions.`);
                setPunching(false);
            },
            { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
        );
    };

    // Handle Expense Status Approval / Rejection
    const handleExpenseStatusChange = async (id: string, status: 'approved' | 'rejected') => {
        setUpdatingExpenseId(id);
        try {
            const res = await fetch(`/api/expenses/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    status,
                    approvedByEmail: 'finance.admin@btl.engineering',
                }),
            });
            const data = await res.json();
            if (data.success) {
                fetchHealthAndMetrics();
            } else {
                alert(data.error || 'Failed to update expense status');
            }
        } catch (err) {
            alert('Network error updating expense');
        } finally {
            setUpdatingExpenseId(null);
        }
    };

    // Handle Submitting New Operating Overhead Expense
    const handleCreateExpense = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmittingExpense(true);
        setExpenseMsg(null);
        try {
            const res = await fetch('/api/expenses', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newExpense),
            });
            const data = await res.json();
            if (data.success) {
                setShowNewExpenseModal(false);
                setNewExpense({
                    title: '',
                    category: 'cnc_tooling_inserts',
                    amount: '',
                    taxAmount: '',
                    expenseDate: new Date().toISOString().split('T')[0],
                    paymentMode: 'Bank Transfer',
                    vendorName: '',
                    invoiceNumber: '',
                    notes: '',
                });
                fetchHealthAndMetrics();
            } else {
                setExpenseMsg(data.error || 'Failed to record expense');
            }
        } catch {
            setExpenseMsg('Network error recording expense');
        } finally {
            setSubmittingExpense(false);
        }
    };

    return (
        <div className="space-y-8">
            {/* Header Banner */}
            <div className="bg-white border border-slate-200/90 rounded-2xl p-6 sm:p-8 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <div className="flex flex-wrap items-center gap-2 mb-3">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-800 font-medium text-xs">
                            <span className="h-2 w-2 rounded-full bg-blue-600"></span>
                            Est. 2024 • Hosur, Tamil Nadu
                        </span>
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-orange-50 border border-orange-200 text-orange-700 font-semibold text-xs">
                            Automotive & Aerospace Precision
                        </span>
                    </div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
                        BTL Engineering ERP Operations Hub
                    </h1>
                    <p className="text-slate-600 text-sm mt-1 max-w-2xl">
                        Central operations dashboard for CNC manufacturing, supply chain, GPS workforce attendance, and executive margin analysis.
                    </p>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                    <button
                        onClick={fetchHealthAndMetrics}
                        className="px-4 py-2.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold border border-slate-200 transition-colors flex items-center gap-2 shadow-sm"
                    >
                        <span>🔄</span>
                        <span>Refresh Metrics</span>
                    </button>
                    <button
                        onClick={() => setShowNewExpenseModal(true)}
                        className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow-sm transition-colors flex items-center gap-1.5"
                    >
                        <span>➕</span>
                        <span>Record Plant Expense</span>
                    </button>
                    <Link
                        href="/erp/sales"
                        className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-sm transition-colors"
                    >
                        Sales & Quotations →
                    </Link>
                </div>
            </div>

            {/* Widget Row 1: Executive P&L & Margins + GPS Self-Attendance */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* 1. GPS Self-Attendance Punch Card */}
                <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-sm flex flex-col justify-between">
                    <div>
                        <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-2">
                                <span className="text-xl">📍</span>
                                <h3 className="font-bold text-slate-900 text-sm">GPS Self-Attendance</h3>
                            </div>
                            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                                Hosur Geofence
                            </span>
                        </div>
                        <p className="text-xs text-slate-500 mb-4">
                            Biometric-free mobile punch. Automatically verifies your device position against the Hosur plant radius (SIPCOT Phase 1).
                        </p>

                        <div className="mb-4">
                            <label className="block text-[11px] font-semibold text-slate-700 mb-1">Machinist / Employee ID</label>
                            <input
                                type="text"
                                value={empCode}
                                onChange={(e) => setEmpCode(e.target.value.toUpperCase())}
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono text-slate-900 focus:outline-none focus:border-blue-600"
                            />
                        </div>

                        {punchError && (
                            <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs mb-3">
                                {punchError}
                            </div>
                        )}

                        {punchFeedback && (
                            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs mb-3 space-y-1">
                                <div className="font-bold">{punchFeedback.message}</div>
                                <div className="text-[11px] text-emerald-600">
                                    {punchFeedback.isGpsVerified ? '✓ Within plant geofence' : '⚠️ Outside plant perimeter'}{' '}
                                    {punchFeedback.distance !== undefined && `(~${punchFeedback.distance}m)`}
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="grid grid-cols-2 gap-3 pt-3 border-t border-slate-100">
                        <button
                            disabled={punching}
                            onClick={() => handleGpsPunch('in')}
                            className="py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm disabled:opacity-50 transition-all flex items-center justify-center gap-1.5"
                        >
                            <span>🟢</span>
                            <span>{punching ? 'Locating...' : 'Punch In'}</span>
                        </button>
                        <button
                            disabled={punching}
                            onClick={() => handleGpsPunch('out')}
                            className="py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs shadow-sm disabled:opacity-50 transition-all flex items-center justify-center gap-1.5"
                        >
                            <span>🔴</span>
                            <span>Punch Out</span>
                        </button>
                    </div>
                </div>

                {/* 2. Executive P&L & Operating Margins */}
                <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-sm lg:col-span-2 flex flex-col justify-between">
                    <div>
                        <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
                            <div>
                                <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                                    <span>📈</span>
                                    <span>Executive Profit & Loss (P&L) and Margins</span>
                                </h3>
                                <p className="text-xs text-slate-500 mt-0.5">
                                    Real-time margins derived from finished inventory sales value vs raw materials & plant operating costs
                                </p>
                            </div>
                            <span className="text-xs px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 font-semibold border border-blue-200 font-mono">
                                Live Financials
                            </span>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
                            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80">
                                <span className="text-[11px] text-slate-500 uppercase tracking-wider block mb-1">Gross Margin</span>
                                <span className="text-xl font-bold text-emerald-600 block">{marginSummary.grossMarginPercent}</span>
                                <span className="text-[10px] text-slate-400 block mt-1">Component Price vs BOM</span>
                            </div>

                            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80">
                                <span className="text-[11px] text-slate-500 uppercase tracking-wider block mb-1">Estimated Net Margin</span>
                                <span className="text-xl font-bold text-blue-600 block">{marginSummary.netMarginEstimate}</span>
                                <span className="text-[10px] text-slate-400 block mt-1">After Plant Overheads</span>
                            </div>

                            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80">
                                <span className="text-[11px] text-slate-500 uppercase tracking-wider block mb-1">Finished Valuation</span>
                                <span className="text-xl font-bold text-slate-900 block">₹{marginSummary.inventoryGrossRevenuePotential}</span>
                                <span className="text-[10px] text-slate-400 block mt-1">Live Finished Goods</span>
                            </div>

                            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80">
                                <span className="text-[11px] text-slate-500 uppercase tracking-wider block mb-1">Operating Overheads</span>
                                <span className="text-xl font-bold text-amber-600 block">₹{marginSummary.totalOperatingExpenses}</span>
                                <span className="text-[10px] text-slate-400 block mt-1">Tooling, Power & Rent</span>
                            </div>
                        </div>
                    </div>

                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                        <span className="text-slate-500">
                            Formula: <strong>Gross Revenue - Raw Material (BOM) - Plant Expenses = Net Margin</strong>
                        </span>
                        <Link href="/erp/products" className="text-blue-600 font-semibold hover:underline">
                            Inspect Component Unit Costing →
                        </Link>
                    </div>
                </div>
            </div>

            {/* Operating Overheads & Expense Approval Register */}
            <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-sm space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                    <div>
                        <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                            <span>💸</span>
                            <span>Plant Cost Center & Operating Expenses Register</span>
                        </h2>
                        <p className="text-xs text-slate-500 mt-0.5">
                            CNC tooling inserts, machine maintenance, factory electricity, and consumable overhead approvals
                        </p>
                    </div>
                    <button
                        onClick={() => setShowNewExpenseModal(true)}
                        className="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold transition-colors"
                    >
                        + Add Expense Voucher
                    </button>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                        <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase font-semibold text-[11px]">
                            <tr>
                                <th className="py-3 px-4">Title / Purpose</th>
                                <th className="py-3 px-4">Category</th>
                                <th className="py-3 px-4">Vendor / Party</th>
                                <th className="py-3 px-4">Date</th>
                                <th className="py-3 px-4 text-right">Amount (₹)</th>
                                <th className="py-3 px-4 text-center">Status</th>
                                <th className="py-3 px-4 text-right">Approval Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {expensesList.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="py-8 text-center text-slate-400">
                                        No plant expenses logged yet. Click &apos;Add Expense Voucher&apos; to record operating costs.
                                    </td>
                                </tr>
                            ) : (
                                expensesList.map((exp) => (
                                    <tr key={exp.id} className="hover:bg-slate-50/60 transition-colors">
                                        <td className="py-3 px-4 font-semibold text-slate-900">{exp.title}</td>
                                        <td className="py-3 px-4">
                                            <span className="px-2 py-0.5 rounded-full text-[10px] bg-slate-100 text-slate-700 font-mono uppercase">
                                                {exp.category.replace(/_/g, ' ')}
                                            </span>
                                        </td>
                                        <td className="py-3 px-4 text-slate-600">{exp.vendorName || '—'}</td>
                                        <td className="py-3 px-4 text-slate-500">{exp.expenseDate}</td>
                                        <td className="py-3 px-4 text-right font-mono font-bold text-slate-900">
                                            ₹{parseFloat(exp.amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                        </td>
                                        <td className="py-3 px-4 text-center">
                                            <span
                                                className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                                                    exp.status === 'approved'
                                                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                                        : exp.status === 'rejected'
                                                        ? 'bg-red-50 text-red-700 border border-red-200'
                                                        : 'bg-amber-50 text-amber-700 border border-amber-200'
                                                }`}
                                            >
                                                {exp.status.toUpperCase()}
                                            </span>
                                        </td>
                                        <td className="py-3 px-4 text-right">
                                            {exp.status === 'pending_approval' ? (
                                                <div className="flex items-center justify-end gap-1.5">
                                                    <button
                                                        disabled={updatingExpenseId === exp.id}
                                                        onClick={() => handleExpenseStatusChange(exp.id, 'approved')}
                                                        className="px-2.5 py-1 rounded bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-[11px] disabled:opacity-50"
                                                    >
                                                        Approve
                                                    </button>
                                                    <button
                                                        disabled={updatingExpenseId === exp.id}
                                                        onClick={() => handleExpenseStatusChange(exp.id, 'rejected')}
                                                        className="px-2.5 py-1 rounded bg-red-600 hover:bg-red-700 text-white font-semibold text-[11px] disabled:opacity-50"
                                                    >
                                                        Reject
                                                    </button>
                                                </div>
                                            ) : (
                                                <span className="text-[11px] text-slate-400 font-medium">Locked</span>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-sm">
                    <div className="text-slate-500 text-xs font-medium uppercase tracking-wider mb-1">
                        Active Database
                    </div>
                    <div className="text-xl sm:text-2xl font-bold text-slate-900 flex items-center gap-2">
                        <span>Supabase</span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-semibold">
                            PostgreSQL
                        </span>
                    </div>
                    <div className="text-xs text-slate-500 mt-2">Drizzle ORM Engine</div>
                </div>

                <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-sm">
                    <div className="text-slate-500 text-xs font-medium uppercase tracking-wider mb-1">
                        Security & Auth
                    </div>
                    <div className="text-xl sm:text-2xl font-bold text-slate-900 flex items-center gap-2">
                        <span>Supabase</span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 font-semibold">
                            RBAC
                        </span>
                    </div>
                    <div className="text-xs text-slate-500 mt-2">Role-Based Access Guard</div>
                </div>

                <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-sm">
                    <div className="text-slate-500 text-xs font-medium uppercase tracking-wider mb-1">
                        Accounting Integration
                    </div>
                    <div className="text-xl sm:text-2xl font-bold text-slate-900 flex items-center gap-2">
                        <span>TallyPrime</span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200 font-semibold">
                            Gateway
                        </span>
                    </div>
                    <div className="text-xs text-slate-500 mt-2">Local Windows Connector</div>
                </div>

                <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-sm">
                    <div className="text-slate-500 text-xs font-medium uppercase tracking-wider mb-1">
                        Facility
                    </div>
                    <div className="text-xl sm:text-2xl font-bold text-slate-900">Hosur Plant</div>
                    <div className="text-xs text-slate-500 mt-2">Tamil Nadu, India</div>
                </div>
            </div>

            {/* Real-time Diagnostics Card */}
            <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-sm">
                <div className="flex items-center justify-between mb-4 pb-4 border-b border-slate-100">
                    <div>
                        <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                            <span>⚡</span>
                            <span>System Diagnostics & Database Handshake</span>
                        </h2>
                        <p className="text-xs text-slate-500 mt-0.5">
                            Real-time connection with Supabase PostgreSQL via Drizzle ORM
                        </p>
                    </div>
                    <span className="text-[11px] px-3 py-1 rounded-full bg-slate-50 border border-slate-200 text-slate-600 font-mono">
                        /api/health
                    </span>
                </div>

                {loading ? (
                    <div className="py-8 text-center text-xs text-slate-500 flex items-center justify-center gap-2">
                        <svg className="animate-spin h-4 w-4 text-blue-600" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
                        </svg>
                        <span>Querying PostgreSQL connection health...</span>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                        <div className="p-4 rounded-xl bg-slate-50/70 border border-slate-200/80">
                            <span className="text-slate-500 uppercase tracking-wider block mb-1 text-[10px]">ORM & Driver</span>
                            <span className="text-sm font-bold text-slate-900 block">
                                {health?.database.orm} ({health?.database.driver})
                            </span>
                            <span className="text-slate-500 text-[11px] block mt-1">
                                Status: <strong className="text-emerald-600 font-semibold">{health?.database.status}</strong>
                            </span>
                        </div>

                        <div className="p-4 rounded-xl bg-slate-50/70 border border-slate-200/80">
                            <span className="text-slate-500 uppercase tracking-wider block mb-1 text-[10px]">Database Latency</span>
                            <span className="text-sm font-bold text-emerald-600 block">
                                {health?.database.latencyMs !== null ? `${health?.database.latencyMs} ms` : 'Standby / Local'}
                            </span>
                            <span className="text-slate-500 text-[11px] block mt-1">
                                {health?.database.error ? `Notice: ${health.database.error}` : 'Connection pool ready'}
                            </span>
                        </div>

                        <div className="p-4 rounded-xl bg-slate-50/70 border border-slate-200/80">
                            <span className="text-slate-500 uppercase tracking-wider block mb-1 text-[10px]">Supabase Endpoint</span>
                            <span className="text-sm font-bold text-blue-600 block">
                                {health?.supabase.configured ? 'Configured' : 'Ready'}
                            </span>
                            <span className="text-slate-500 text-[11px] block mt-1 truncate">
                                {health?.supabase.url}
                            </span>
                        </div>
                    </div>
                )}
            </div>

            {/* Modal: Record Operating Overhead Expense */}
            {showNewExpenseModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-slate-200 space-y-4">
                        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                            <h3 className="font-bold text-slate-900 text-base">Record Plant Operating Expense</h3>
                            <button
                                onClick={() => setShowNewExpenseModal(false)}
                                className="h-8 w-8 rounded-lg hover:bg-slate-100 text-slate-500 flex items-center justify-center font-bold"
                            >
                                ✕
                            </button>
                        </div>

                        {expenseMsg && (
                            <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs">
                                {expenseMsg}
                            </div>
                        )}

                        <form onSubmit={handleCreateExpense} className="space-y-3 text-xs">
                            <div>
                                <label className="block text-slate-700 font-semibold mb-1">Expense Title / Item</label>
                                <input
                                    type="text"
                                    required
                                    placeholder="e.g., CNC Carbide Turning Inserts (Box of 10)"
                                    value={newExpense.title}
                                    onChange={(e) => setNewExpense({ ...newExpense, title: e.target.value })}
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:border-blue-600"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-slate-700 font-semibold mb-1">Category</label>
                                    <select
                                        value={newExpense.category}
                                        onChange={(e) => setNewExpense({ ...newExpense, category: e.target.value })}
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:border-blue-600"
                                    >
                                        <option value="cnc_tooling_inserts">CNC Tooling Inserts</option>
                                        <option value="machine_maintenance">Machine Maintenance</option>
                                        <option value="electricity_power">Electricity & Power</option>
                                        <option value="coolant_lubricants">Coolant & Lubricants</option>
                                        <option value="factory_rent">Factory Rent</option>
                                        <option value="raw_materials">Raw Materials</option>
                                        <option value="salary_wages">Salary & Wages</option>
                                        <option value="freight_transport">Freight & Transport</option>
                                        <option value="administrative">Administrative</option>
                                        <option value="other">Other</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-slate-700 font-semibold mb-1">Amount (₹)</label>
                                    <input
                                        type="number"
                                        required
                                        step="0.01"
                                        min="0"
                                        placeholder="0.00"
                                        value={newExpense.amount}
                                        onChange={(e) => setNewExpense({ ...newExpense, amount: e.target.value })}
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-mono focus:outline-none focus:border-blue-600"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-slate-700 font-semibold mb-1">Vendor / Supplier</label>
                                    <input
                                        type="text"
                                        placeholder="e.g., Sandvik Coromant"
                                        value={newExpense.vendorName}
                                        onChange={(e) => setNewExpense({ ...newExpense, vendorName: e.target.value })}
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:border-blue-600"
                                    />
                                </div>

                                <div>
                                    <label className="block text-slate-700 font-semibold mb-1">Date</label>
                                    <input
                                        type="date"
                                        required
                                        value={newExpense.expenseDate}
                                        onChange={(e) => setNewExpense({ ...newExpense, expenseDate: e.target.value })}
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:border-blue-600"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-slate-700 font-semibold mb-1">Notes / Remarks</label>
                                <textarea
                                    rows={2}
                                    placeholder="Optional notes or batch reference"
                                    value={newExpense.notes}
                                    onChange={(e) => setNewExpense({ ...newExpense, notes: e.target.value })}
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:border-blue-600"
                                />
                            </div>

                            <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                                <button
                                    type="button"
                                    onClick={() => setShowNewExpenseModal(false)}
                                    className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-semibold transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={submittingExpense}
                                    className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold transition-colors disabled:opacity-50"
                                >
                                    {submittingExpense ? 'Saving...' : 'Record Expense'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
