'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

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

interface BackupItem {
    backupId: string;
    createdAt: string;
    initiatedBy: { fullName: string; email: string };
    totalTables: number;
    totalRecords: number;
    totalFiles: number;
    byteSize: number;
    checksum: string;
    downloadUrl: string;
}

export default function ErpDashboardPage() {
    const [loading, setLoading] = useState(true);
    const [userRole, setUserRole] = useState<string>('');

    // Business KPIs & Margins
    const [marginSummary, setMarginSummary] = useState({
        totalOperatingExpenses: '0.00',
        inventoryGrossRevenuePotential: '0.00',
        inventoryCostValuation: '0.00',
        grossProfit: '0.00',
        grossMarginPercent: '34.2%',
        netMarginEstimate: '22.5%',
    });

    const [businessCounts, setBusinessCounts] = useState({
        customers: 0,
        suppliers: 0,
        products: 0,
        expensesPending: 0,
    });

    // Expenses State
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

    // Enterprise Backup Modal & State (Admin Only)
    const [showBackupModal, setShowBackupModal] = useState(false);
    const [backupsList, setBackupsList] = useState<BackupItem[]>([]);
    const [isBackingUp, setIsBackingUp] = useState(false);
    const [backupProgress, setBackupProgress] = useState<{ step: string; percent: number }>({ step: '', percent: 0 });
    const [backupResultMsg, setBackupResultMsg] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

    const isAdmin = userRole === 'admin' || userRole === 'super_admin';

    const fetchBusinessMetrics = () => {
        setLoading(true);
        Promise.all([
            fetch('/api/auth/me').then((r) => r.json()).catch(() => null),
            fetch('/api/expenses').then((r) => r.json()).catch(() => null),
            fetch('/api/customers').then((r) => r.json()).catch(() => null),
            fetch('/api/suppliers').then((r) => r.json()).catch(() => null),
            fetch('/api/products').then((r) => r.json()).catch(() => null),
        ]).then(([authData, expenseData, custData, suppData, prodData]) => {
            if (authData?.user) {
                setUserRole(authData.user.role);
            }
            if (expenseData?.marginSummary) setMarginSummary(expenseData.marginSummary);
            if (expenseData?.expenses && Array.isArray(expenseData.expenses)) {
                setExpensesList(expenseData.expenses);
                const pending = expenseData.expenses.filter((e: any) => e.status === 'pending_approval').length;
                setBusinessCounts((prev) => ({ ...prev, expensesPending: pending }));
            }
            if (custData?.customers) {
                setBusinessCounts((prev) => ({ ...prev, customers: custData.customers.length }));
            }
            if (suppData?.suppliers) {
                setBusinessCounts((prev) => ({ ...prev, suppliers: suppData.suppliers.length }));
            }
            if (prodData?.products) {
                setBusinessCounts((prev) => ({ ...prev, products: prodData.products.length }));
            }
            setLoading(false);
        });
    };

    const fetchBackups = async () => {
        try {
            const res = await fetch('/api/backup');
            const data = await res.json();
            if (data.success && data.backups) {
                setBackupsList(data.backups);
            }
        } catch (e) {
            console.error('Failed to load backup list:', e);
        }
    };

    useEffect(() => {
        fetchBusinessMetrics();
    }, []);

    useEffect(() => {
        if (isAdmin) {
            fetchBackups();
        }
    }, [isAdmin]);

    // Handle Approving/Rejecting Operating Overhead Expense
    const handleExpenseStatusChange = async (id: string, status: 'approved' | 'rejected') => {
        setUpdatingExpenseId(id);
        try {
            const res = await fetch(`/api/expenses/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status }),
            });
            const data = await res.json();
            if (data.success) {
                fetchBusinessMetrics();
            } else {
                alert(data.error || 'Failed to update expense status');
            }
        } catch {
            alert('Network error updating expense');
        } finally {
            setUpdatingExpenseId(null);
        }
    };

    // Handle Recording Operating Expense
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
                fetchBusinessMetrics();
            } else {
                setExpenseMsg(data.error || 'Failed to record expense');
            }
        } catch {
            setExpenseMsg('Network error recording expense');
        } finally {
            setSubmittingExpense(false);
        }
    };

    // Execute Enterprise Backup All
    const handleExecuteBackup = async () => {
        setIsBackingUp(true);
        setBackupResultMsg(null);
        setBackupProgress({ step: 'Extracting relational database & scrubbing security tokens...', percent: 25 });

        try {
            const res = await fetch('/api/backup', { method: 'POST' });
            const data = await res.json();
            if (data.success) {
                setBackupProgress({ step: 'Complete', percent: 100 });
                setBackupResultMsg({
                    text: `Backup ${data.backup.backupId} created with ${data.backup.totalTables} tables and ${data.backup.totalStorageFiles} storage files.`,
                    type: 'success',
                });
                fetchBackups();
            } else {
                setBackupResultMsg({ text: data.error || 'Backup operation failed.', type: 'error' });
            }
        } catch {
            setBackupResultMsg({ text: 'Network connection error during backup creation.', type: 'error' });
        } finally {
            setIsBackingUp(false);
        }
    };

    return (
        <div className="space-y-8">
            {/* Header Banner */}
            <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <div className="flex flex-wrap items-center gap-2 mb-3">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-800 font-semibold text-xs">
                            <span className="h-2 w-2 rounded-full bg-blue-600"></span>
                            Hosur Plant • Est. 2024
                        </span>
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-orange-50 border border-orange-200 text-orange-700 font-semibold text-xs">
                            Precision Automotive & Aerospace Components
                        </span>
                    </div>
                    <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                        Operations & Business Intelligence Hub
                    </h1>
                    <p className="text-slate-600 text-sm mt-1 max-w-2xl">
                        Plant manufacturing metrics, executive operating margins, supplier procurement, and live inventory financials.
                    </p>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                    <button
                        onClick={fetchBusinessMetrics}
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
                    {isAdmin && (
                        <button
                            onClick={() => setShowBackupModal(true)}
                            className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-sm transition-colors flex items-center gap-2"
                        >
                            <span>💾</span>
                            <span>Enterprise Backup</span>
                        </button>
                    )}
                    <Link
                        href="/erp/sales"
                        className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-sm transition-colors"
                    >
                        Sales & Quotations →
                    </Link>
                </div>
            </div>

            {/* Quick Business KPI Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-sm">
                    <span className="text-slate-500 text-xs font-medium uppercase tracking-wider">Active Customers</span>
                    <div className="text-2xl font-bold text-slate-900 mt-1">{businessCounts.customers}</div>
                    <span className="text-[11px] text-slate-400 mt-1 block">Tier-1 OEM & Aerospace</span>
                </div>
                <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-sm">
                    <span className="text-slate-500 text-xs font-medium uppercase tracking-wider">Approved Suppliers</span>
                    <div className="text-2xl font-bold text-slate-900 mt-1">{businessCounts.suppliers}</div>
                    <span className="text-[11px] text-slate-400 mt-1 block">Alloy steel & tooling vendors</span>
                </div>
                <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-sm">
                    <span className="text-slate-500 text-xs font-medium uppercase tracking-wider">Component Catalog</span>
                    <div className="text-2xl font-bold text-blue-600 mt-1">{businessCounts.products}</div>
                    <span className="text-[11px] text-slate-400 mt-1 block">Precision CNC/VMC parts</span>
                </div>
                <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-sm">
                    <span className="text-slate-500 text-xs font-medium uppercase tracking-wider">Pending Overheads</span>
                    <div className="text-2xl font-bold text-amber-600 mt-1">{businessCounts.expensesPending}</div>
                    <span className="text-[11px] text-slate-400 mt-1 block">Awaiting manager approval</span>
                </div>
            </div>

            {/* Executive P&L & Margins Summary */}
            <div className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-sm space-y-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-2">
                    <div>
                        <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                            <span>📈</span>
                            <span>Executive Profit & Loss (P&L) and Margins</span>
                        </h3>
                        <p className="text-xs text-slate-500 mt-0.5">
                            Real-time profitability calculated from live finished inventory sales value vs raw materials & plant operating expenses.
                        </p>
                    </div>
                    <span className="text-xs px-3 py-1 rounded-full bg-blue-50 text-blue-700 font-bold border border-blue-200">
                        Live Financials
                    </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
                        <span className="text-[11px] text-slate-500 uppercase tracking-wider block mb-1">Gross Margin</span>
                        <span className="text-2xl font-black text-emerald-600 block">{marginSummary.grossMarginPercent}</span>
                        <span className="text-[10px] text-slate-400 block mt-1">Component Price vs BOM Cost</span>
                    </div>

                    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
                        <span className="text-[11px] text-slate-500 uppercase tracking-wider block mb-1">Estimated Net Margin</span>
                        <span className="text-2xl font-black text-blue-600 block">{marginSummary.netMarginEstimate}</span>
                        <span className="text-[10px] text-slate-400 block mt-1">After Factory Overheads</span>
                    </div>

                    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
                        <span className="text-[11px] text-slate-500 uppercase tracking-wider block mb-1">Finished Goods Valuation</span>
                        <span className="text-2xl font-black text-slate-900 block font-mono">₹{marginSummary.inventoryGrossRevenuePotential}</span>
                        <span className="text-[10px] text-slate-400 block mt-1">In-Stock Valuation</span>
                    </div>

                    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
                        <span className="text-[11px] text-slate-500 uppercase tracking-wider block mb-1">Monthly Overheads</span>
                        <span className="text-2xl font-black text-amber-600 block font-mono">₹{marginSummary.totalOperatingExpenses}</span>
                        <span className="text-[10px] text-slate-400 block mt-1">Tooling, Maintenance & Power</span>
                    </div>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                    <span>Formula: <strong>Gross Revenue - Raw Material (BOM) - Plant Operating Costs = Net Margin</strong></span>
                    <Link href="/erp/products" className="text-blue-600 font-semibold hover:underline">
                        View Unit Cost Breakdown →
                    </Link>
                </div>
            </div>

            {/* Operating Overheads & Expense Register */}
            <div className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-sm space-y-4">
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

            {/* Admin-Only Enterprise Backup & Data Safety Card */}
            {isAdmin && (
                <div className="p-6 rounded-3xl bg-slate-900 text-white shadow-xl space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-2xl bg-indigo-600/30 text-indigo-400 border border-indigo-500/40 flex items-center justify-center text-xl">
                                🛡️
                            </div>
                            <div>
                                <h3 className="font-bold text-base text-white">Enterprise Backup & Data Safety</h3>
                                <p className="text-xs text-slate-400">
                                    Read-only consistent database snapshot, technical drawings, and encrypted storage archives.
                                </p>
                            </div>
                        </div>

                        <button
                            onClick={handleExecuteBackup}
                            disabled={isBackingUp}
                            className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg transition-all flex items-center gap-2 disabled:opacity-50"
                        >
                            <span>💾</span>
                            <span>{isBackingUp ? 'Creating Backup Package...' : 'Execute Backup All'}</span>
                        </button>
                    </div>

                    {isBackingUp && (
                        <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700 space-y-2">
                            <div className="flex items-center justify-between text-xs font-semibold text-slate-300">
                                <span>{backupProgress.step}</span>
                                <span>{backupProgress.percent}%</span>
                            </div>
                            <div className="w-full h-2 rounded-full bg-slate-700 overflow-hidden">
                                <div
                                    className="h-full bg-indigo-500 transition-all duration-300"
                                    style={{ width: `${backupProgress.percent}%` }}
                                />
                            </div>
                        </div>
                    )}

                    {backupResultMsg && (
                        <div
                            className={`p-3.5 rounded-2xl text-xs font-medium border ${
                                backupResultMsg.type === 'success'
                                    ? 'bg-emerald-950/80 border-emerald-800 text-emerald-200'
                                    : 'bg-rose-950/80 border-rose-800 text-rose-200'
                            }`}
                        >
                            {backupResultMsg.text}
                        </div>
                    )}

                    {/* Historical Backup Archives Table */}
                    <div className="space-y-2">
                        <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                            Available Backup Packages ({backupsList.length})
                        </div>
                        {backupsList.length === 0 ? (
                            <div className="text-xs text-slate-500 italic py-3">
                                No previous backups generated. Click &apos;Execute Backup All&apos; to create an initial snapshot.
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-xs">
                                    <thead className="text-slate-400 uppercase text-[10px] font-semibold border-b border-slate-800">
                                        <tr>
                                            <th className="py-2 px-3">Backup ID</th>
                                            <th className="py-2 px-3">Timestamp</th>
                                            <th className="py-2 px-3">Tables</th>
                                            <th className="py-2 px-3">Records</th>
                                            <th className="py-2 px-3">Files</th>
                                            <th className="py-2 px-3">Size</th>
                                            <th className="py-2 px-3 text-right">Download</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-800 font-mono text-[11px]">
                                        {backupsList.map((b) => (
                                            <tr key={b.backupId} className="hover:bg-slate-800/40">
                                                <td className="py-2.5 px-3 font-bold text-indigo-400">{b.backupId}</td>
                                                <td className="py-2.5 px-3 text-slate-300 font-sans">
                                                    {new Date(b.createdAt).toLocaleString('en-IN')}
                                                </td>
                                                <td className="py-2.5 px-3 text-slate-300">{b.totalTables}</td>
                                                <td className="py-2.5 px-3 text-emerald-400 font-bold">{b.totalRecords}</td>
                                                <td className="py-2.5 px-3 text-blue-400">{b.totalFiles}</td>
                                                <td className="py-2.5 px-3 text-slate-300">
                                                    {(b.byteSize / 1024).toFixed(1)} KB
                                                </td>
                                                <td className="py-2.5 px-3 text-right font-sans">
                                                    <a
                                                        href={b.downloadUrl}
                                                        className="px-2.5 py-1 rounded bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-[10px] inline-flex items-center gap-1"
                                                    >
                                                        <span>⬇</span> Download
                                                    </a>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>
            )}

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
