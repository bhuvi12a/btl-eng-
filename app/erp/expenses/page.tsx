'use client';

import { useState, useEffect } from 'react';

interface Expense {
    id: string;
    title: string;
    category: string;
    amount: string;
    taxAmount: string;
    expenseDate: string;
    paymentMode: string;
    vendorName: string | null;
    invoiceNumber: string | null;
}

interface MarginSummary {
    totalOperatingExpenses: string;
    inventoryGrossRevenuePotential: string;
    inventoryCostValuation: string;
    grossProfit: string;
    grossMarginPercent: string;
    netMarginEstimate: string;
}

export default function ExpensesPage() {
    const [expenses, setExpenses] = useState<Expense[]>([]);
    const [marginSummary, setMarginSummary] = useState<MarginSummary>({
        totalOperatingExpenses: '0.00',
        inventoryGrossRevenuePotential: '0.00',
        inventoryCostValuation: '0.00',
        grossProfit: '0.00',
        grossMarginPercent: '34.2%',
        netMarginEstimate: '22.5%',
    });
    const [loading, setLoading] = useState(true);
    const [categoryFilter, setCategoryFilter] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');

    const [form, setForm] = useState({
        title: '',
        category: 'cnc_tooling_inserts',
        amount: '12500.00',
        taxAmount: '2250.00',
        expenseDate: new Date().toISOString().split('T')[0],
        paymentMode: 'Bank Transfer',
        vendorName: '',
        invoiceNumber: '',
        notes: '',
    });

    const fetchExpenses = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (categoryFilter) params.set('category', categoryFilter);

            const res = await fetch(`/api/expenses?${params.toString()}`);
            const data = await res.json();
            if (data.success) {
                setExpenses(data.expenses);
                if (data.marginSummary) setMarginSummary(data.marginSummary);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchExpenses();
    }, [categoryFilter]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        setErrorMsg('');

        try {
            const res = await fetch('/api/expenses', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(form),
            });
            const data = await res.json();
            if (data.success) {
                setIsModalOpen(false);
                setForm({
                    title: '',
                    category: 'cnc_tooling_inserts',
                    amount: '12500.00',
                    taxAmount: '2250.00',
                    expenseDate: new Date().toISOString().split('T')[0],
                    paymentMode: 'Bank Transfer',
                    vendorName: '',
                    invoiceNumber: '',
                    notes: '',
                });
                fetchExpenses();
            } else {
                setErrorMsg(data.error || 'Failed to record expense');
            }
        } catch {
            setErrorMsg('Network error occurred');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-slate-200">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                        <span>💰</span>
                        <span>Plant Expenses & Gross Margin Analysis</span>
                    </h1>
                    <p className="text-xs text-slate-500 mt-1">
                        Tooling costs, machine maintenance, overheads, and real-time profitability margin calculations
                    </p>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-sm transition-colors flex items-center gap-2 w-fit"
                >
                    <span>+</span>
                    <span>Record Expense</span>
                </button>
            </div>

            {/* Profit Margin Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-sm">
                    <span className="text-slate-500 text-xs font-medium">Estimated Gross Margin</span>
                    <div className="text-2xl font-bold text-emerald-600 mt-1">{marginSummary.grossMarginPercent}</div>
                    <span className="text-[11px] text-slate-400 mt-1 block">Component Sales vs Material Cost</span>
                </div>
                <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-sm">
                    <span className="text-slate-500 text-xs font-medium">Net Margin Estimate</span>
                    <div className="text-2xl font-bold text-blue-600 mt-1">{marginSummary.netMarginEstimate}</div>
                    <span className="text-[11px] text-slate-400 mt-1 block">After Plant Operating Expenses</span>
                </div>
                <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-sm">
                    <span className="text-slate-500 text-xs font-medium">Total Recorded Expenses</span>
                    <div className="text-2xl font-bold text-slate-900 mt-1">₹{marginSummary.totalOperatingExpenses}</div>
                    <span className="text-[11px] text-slate-400 mt-1 block">Maintenance, Tools, Overheads</span>
                </div>
                <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-sm">
                    <span className="text-slate-500 text-xs font-medium">Inventory Value (Revenue)</span>
                    <div className="text-2xl font-bold text-indigo-600 mt-1">₹{marginSummary.inventoryGrossRevenuePotential}</div>
                    <span className="text-[11px] text-slate-400 mt-1 block">Live Stock Valuation</span>
                </div>
            </div>

            {/* Expenses Filter Bar */}
            <div className="flex flex-col sm:flex-row gap-3">
                <select
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                    className="bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-700 focus:outline-none focus:border-blue-600 shadow-sm"
                >
                    <option value="">All Expense Categories</option>
                    <option value="cnc_tooling_inserts">Carbide Inserts & Tooling</option>
                    <option value="machine_maintenance">CNC Machine Maintenance</option>
                    <option value="electricity_power">Electricity / HT Power (TNEB)</option>
                    <option value="coolant_lubricants">Coolants, Oils & Lubricants</option>
                    <option value="raw_materials">Raw Material Billets & Bars</option>
                    <option value="freight_transport">Freight & Dispatch Logistics</option>
                    <option value="administrative">Administrative & Office</option>
                </select>
            </div>

            {/* Expenses Table */}
            <div className="bg-white border border-slate-200/90 rounded-2xl overflow-hidden shadow-sm">
                {loading ? (
                    <div className="py-16 text-center text-xs text-slate-500">Loading expense ledger...</div>
                ) : expenses.length === 0 ? (
                    <div className="py-16 text-center text-xs text-slate-500">
                        No expenses recorded yet. Click &quot;Record Expense&quot; to log tooling, power or maintenance bills.
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs">
                            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase font-semibold text-[11px]">
                                <tr>
                                    <th className="py-3.5 px-4">Date</th>
                                    <th className="py-3.5 px-4">Title / Description</th>
                                    <th className="py-3.5 px-4">Category</th>
                                    <th className="py-3.5 px-4">Vendor</th>
                                    <th className="py-3.5 px-4">Invoice No.</th>
                                    <th className="py-3.5 px-4">Mode</th>
                                    <th className="py-3.5 px-4">Amount</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {expenses.map((e) => (
                                    <tr key={e.id} className="hover:bg-slate-50/80 transition-colors">
                                        <td className="py-3.5 px-4 font-mono text-slate-600">{e.expenseDate}</td>
                                        <td className="py-3.5 px-4 font-semibold text-slate-900">{e.title}</td>
                                        <td className="py-3.5 px-4">
                                            <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[11px] font-medium border border-slate-200 capitalize">
                                                {e.category.replace(/_/g, ' ')}
                                            </span>
                                        </td>
                                        <td className="py-3.5 px-4 text-slate-700">{e.vendorName || '—'}</td>
                                        <td className="py-3.5 px-4 font-mono text-slate-600">{e.invoiceNumber || '—'}</td>
                                        <td className="py-3.5 px-4 text-slate-600">{e.paymentMode}</td>
                                        <td className="py-3.5 px-4 font-bold text-slate-900">₹{e.amount}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Modal: Add Expense */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
                    <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-lg overflow-y-auto p-6 space-y-4 shadow-2xl">
                        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                            <div>
                                <h3 className="text-base font-bold text-slate-900">Record Operating Expense</h3>
                                <p className="text-xs text-slate-500">Track tooling, power, and factory cost center disbursements</p>
                            </div>
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="text-slate-400 hover:text-slate-700 text-lg font-bold p-1"
                            >
                                ✕
                            </button>
                        </div>

                        {errorMsg && (
                            <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs">
                                {errorMsg}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
                            <div>
                                <label className="block text-slate-700 font-medium mb-1">Expense Title *</label>
                                <input
                                    type="text"
                                    required
                                    value={form.title}
                                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                                    placeholder="e.g. TaeguTec Milling Carbide Inserts CNMG"
                                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:border-blue-600"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-slate-700 font-medium mb-1">Expense Category *</label>
                                    <select
                                        value={form.category}
                                        onChange={(e) => setForm({ ...form, category: e.target.value })}
                                        className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:border-blue-600"
                                    >
                                        <option value="cnc_tooling_inserts">Carbide Inserts & Tooling</option>
                                        <option value="machine_maintenance">CNC Machine Maintenance</option>
                                        <option value="electricity_power">Electricity (TNEB Power)</option>
                                        <option value="coolant_lubricants">Coolants & Oils</option>
                                        <option value="raw_materials">Raw Material Billets</option>
                                        <option value="freight_transport">Freight & Transport</option>
                                        <option value="administrative">Administrative & Office</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-slate-700 font-medium mb-1">Expense Date *</label>
                                    <input
                                        type="date"
                                        required
                                        value={form.expenseDate}
                                        onChange={(e) => setForm({ ...form, expenseDate: e.target.value })}
                                        className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:border-blue-600"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-slate-700 font-medium mb-1">Amount (₹) *</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        required
                                        value={form.amount}
                                        onChange={(e) => setForm({ ...form, amount: e.target.value })}
                                        className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:border-blue-600"
                                    />
                                </div>
                                <div>
                                    <label className="block text-slate-700 font-medium mb-1">Payment Mode</label>
                                    <select
                                        value={form.paymentMode}
                                        onChange={(e) => setForm({ ...form, paymentMode: e.target.value })}
                                        className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:border-blue-600"
                                    >
                                        <option value="Bank Transfer">Bank Transfer (NEFT/RTGS)</option>
                                        <option value="UPI">UPI / GPay</option>
                                        <option value="Cheque">Cheque</option>
                                        <option value="Cash">Cash</option>
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-slate-700 font-medium mb-1">Vendor / Payee</label>
                                    <input
                                        type="text"
                                        value={form.vendorName}
                                        onChange={(e) => setForm({ ...form, vendorName: e.target.value })}
                                        placeholder="e.g. TaeguTec India Pvt Ltd"
                                        className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:border-blue-600"
                                    />
                                </div>
                                <div>
                                    <label className="block text-slate-700 font-medium mb-1">Invoice / Bill Number</label>
                                    <input
                                        type="text"
                                        value={form.invoiceNumber}
                                        onChange={(e) => setForm({ ...form, invoiceNumber: e.target.value })}
                                        placeholder="INV-2024-998"
                                        className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-slate-900 font-mono focus:outline-none focus:border-blue-600"
                                    />
                                </div>
                            </div>

                            <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-sm"
                                >
                                    {submitting ? 'Recording...' : 'Record Expense'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

