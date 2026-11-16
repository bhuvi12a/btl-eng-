'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';

interface Customer {
    id: string;
    companyName: string;
    contactPerson: string;
    email: string;
    phone: string;
    gstNumber: string | null;
    city: string;
    state: string;
    creditLimit: string;
    paymentTerms: string;
}

interface InvoiceRecord {
    id: string;
    invoiceNumber: string;
    customerId: string;
    customer?: { companyName: string; gstNumber: string };
    orderNumber?: string;
    invoiceDate: string;
    dueDate: string;
    subtotal: string;
    taxAmount: string;
    totalAmount: string;
    amountPaid: string;
    balanceDue: string;
    status: 'draft' | 'unpaid' | 'partially_paid' | 'paid' | 'overdue' | 'cancelled';
    items: any[];
    tallySynced: boolean;
    notes?: string;
}

interface CustomerLedgerData {
    customer: Customer;
    ledger: {
        totalInvoiced: number;
        totalReceived: number;
        totalCreditNotes: number;
        totalDebitNotes: number;
        currentOutstanding: number;
        overdueBalance: number;
        tallySyncStatus: string;
    };
    invoices: InvoiceRecord[];
    payments: Array<{
        id: string;
        receiptNumber: string;
        paymentDate: string;
        amount: string;
        paymentMode: string;
        referenceNumber: string;
        bankName?: string;
        notes?: string;
    }>;
}

export default function ErpSalesPage() {
    const [activeTab, setActiveTab] = useState<'invoices' | 'customers'>('invoices');

    // Invoices State
    const [invoicesList, setInvoicesList] = useState<InvoiceRecord[]>([]);
    const [invoiceSearch, setInvoiceSearch] = useState('');
    const [invoiceStatusFilter, setInvoiceStatusFilter] = useState('all');

    // Customers State
    const [customersList, setCustomersList] = useState<Customer[]>([]);
    const [selectedCustomerLedger, setSelectedCustomerLedger] = useState<CustomerLedgerData | null>(null);
    const [isLoadingLedger, setIsLoadingLedger] = useState(false);

    // Payment Recording State
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [paymentForm, setPaymentForm] = useState({
        customerId: '',
        invoiceId: '',
        amount: '',
        paymentDate: new Date().toISOString().split('T')[0],
        paymentMode: 'NEFT/RTGS',
        referenceNumber: '',
        bankName: 'State Bank of India',
        notes: '',
    });

    // Invoice Print Modal State
    const [printInvoiceData, setPrintInvoiceData] = useState<InvoiceRecord | null>(null);

    // Direct Invoice Creation Modal State
    const [showCreateInvoiceModal, setShowCreateInvoiceModal] = useState(false);
    const [newInvoiceForm, setNewInvoiceForm] = useState({
        customerId: '',
        orderNumber: '',
        invoiceDate: new Date().toISOString().split('T')[0],
        dueDate: new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
        partNumber: 'BTL-PREC-01',
        description: 'CNC Precision Turned Component',
        quantity: 10,
        unitPrice: 500,
        hsnCode: '84099949',
        taxRate: 18,
        notes: '',
    });
    const [submittingInvoice, setSubmittingInvoice] = useState(false);

    // Toast
    const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

    const showToast = (text: string, type: 'success' | 'error' = 'success') => {
        setToastMessage({ text, type });
        setTimeout(() => setToastMessage(null), 4500);
    };

    // Load initial customer & invoice data
    const fetchCustomers = async () => {
        try {
            const res = await fetch('/api/customers');
            const data = await res.json();
            if (data.success) {
                setCustomersList(data.customers || []);
            }
        } catch (err) {
            console.error('Failed to load customers:', err);
        }
    };

    const fetchInvoices = async () => {
        try {
            const res = await fetch('/api/invoices');
            const data = await res.json();
            if (data.success) {
                setInvoicesList(data.invoices || []);
            }
        } catch (err) {
            console.error('Failed to load invoices:', err);
        }
    };

    // Load Customer Ledger Account History
    const fetchCustomerLedger = async (customerId: string) => {
        setIsLoadingLedger(true);
        try {
            const res = await fetch(`/api/customers/${customerId}/ledger`);
            const data = await res.json();
            if (data.success) {
                setSelectedCustomerLedger(data);
            } else {
                showToast(data.error || 'Failed to load ledger', 'error');
            }
        } catch {
            showToast('Network error loading customer account history', 'error');
        } finally {
            setIsLoadingLedger(false);
        }
    };

    useEffect(() => {
        fetchCustomers();
        fetchInvoices();
    }, []);

    // Create New Direct Tax Invoice
    const handleCreateDirectInvoice = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmittingInvoice(true);
        try {
            const qty = Number(newInvoiceForm.quantity) || 1;
            const price = Number(newInvoiceForm.unitPrice) || 0;
            const subtotal = qty * price;
            const taxAmount = (subtotal * (newInvoiceForm.taxRate || 18)) / 100;
            const totalAmount = subtotal + taxAmount;

            const res = await fetch('/api/invoices', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    customerId: newInvoiceForm.customerId,
                    orderNumber: newInvoiceForm.orderNumber || null,
                    invoiceDate: newInvoiceForm.invoiceDate,
                    dueDate: newInvoiceForm.dueDate,
                    subtotal: subtotal.toFixed(2),
                    taxAmount: taxAmount.toFixed(2),
                    totalAmount: totalAmount.toFixed(2),
                    items: [
                        {
                            partNumber: newInvoiceForm.partNumber,
                            description: newInvoiceForm.description,
                            quantity: qty,
                            unitPrice: price,
                            hsnCode: newInvoiceForm.hsnCode,
                            taxRate: `${newInvoiceForm.taxRate}%`,
                            amount: subtotal.toFixed(2),
                        },
                    ],
                    notes: newInvoiceForm.notes,
                }),
            });

            const data = await res.json();
            if (data.success) {
                showToast(`Tax Invoice ${data.invoice.invoiceNumber} created successfully!`);
                setShowCreateInvoiceModal(false);
                fetchInvoices();
                if (selectedCustomerLedger) {
                    fetchCustomerLedger(selectedCustomerLedger.customer.id);
                }
            } else {
                showToast(data.error || 'Failed to create invoice', 'error');
            }
        } catch {
            showToast('Failed to record invoice', 'error');
        } finally {
            setSubmittingInvoice(false);
        }
    };

    // Quick Update Invoice Status or Custom Amount Paid
    const handleUpdateInvoiceStatus = async (invoiceId: string, status?: 'paid' | 'partially_paid' | 'unpaid', amountPaid?: number) => {
        try {
            const res = await fetch(`/api/invoices/${invoiceId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status, amountPaid }),
            });
            const data = await res.json();
            if (data.success) {
                showToast(data.message);
                fetchInvoices();
                if (selectedCustomerLedger) {
                    fetchCustomerLedger(selectedCustomerLedger.customer.id);
                }
            } else {
                showToast(data.error || 'Failed to update invoice status', 'error');
            }
        } catch {
            showToast('Network error updating invoice', 'error');
        }
    };

    // Submit Payment Receipt
    const handleRecordPayment = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const res = await fetch('/api/payments', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(paymentForm),
            });
            const data = await res.json();
            if (data.success) {
                showToast(data.message);
                setShowPaymentModal(false);
                setPaymentForm({
                    customerId: '',
                    invoiceId: '',
                    amount: '',
                    paymentDate: new Date().toISOString().split('T')[0],
                    paymentMode: 'NEFT/RTGS',
                    referenceNumber: '',
                    bankName: 'State Bank of India',
                    notes: '',
                });
                fetchInvoices();
                if (selectedCustomerLedger) {
                    fetchCustomerLedger(selectedCustomerLedger.customer.id);
                }
            } else {
                showToast(data.error || 'Failed to record payment', 'error');
            }
        } catch {
            showToast('Network error recording payment', 'error');
        }
    };

    // Filter Invoices
    const filteredInvoices = invoicesList.filter((inv) => {
        const matchesSearch =
            inv.invoiceNumber.toLowerCase().includes(invoiceSearch.toLowerCase()) ||
            (inv.customer?.companyName || '').toLowerCase().includes(invoiceSearch.toLowerCase());
        const matchesStatus = invoiceStatusFilter === 'all' || inv.status === invoiceStatusFilter;
        return matchesSearch && matchesStatus;
    });

    // Summary calculation
    const totalBilled = invoicesList.reduce((sum, inv) => sum + parseFloat(inv.totalAmount || '0'), 0);
    const totalCollected = invoicesList.reduce((sum, inv) => sum + parseFloat(inv.amountPaid || '0'), 0);
    const totalPending = invoicesList.reduce((sum, inv) => sum + parseFloat(inv.balanceDue || '0'), 0);

    return (
        <div className="space-y-6 max-w-7xl mx-auto pb-12">
            {/* Print-specific style: Hide entire page background and show ONLY the bill on a single page */}
            <style jsx global>{`
                @media print {
                    body * {
                        visibility: hidden;
                    }
                    #printable-invoice,
                    #printable-invoice * {
                        visibility: visible;
                    }
                    #printable-invoice {
                        position: absolute;
                        left: 0;
                        top: 0;
                        width: 100% !important;
                        max-width: 100% !important;
                        margin: 0 !important;
                        padding: 24px !important;
                        border: none !important;
                        box-shadow: none !important;
                        background: white !important;
                        overflow: visible !important;
                    }
                    @page {
                        size: A4 portrait;
                        margin: 12mm;
                    }
                }
            `}</style>

            {/* Toast Notification */}
            {toastMessage && (
                <div
                    className={`fixed top-6 right-6 z-50 px-5 py-3.5 rounded-2xl shadow-xl border text-sm font-bold flex items-center gap-3 transition-all ${
                        toastMessage.type === 'error'
                            ? 'bg-rose-50 border-rose-200 text-rose-800'
                            : 'bg-emerald-50 border-emerald-200 text-emerald-800'
                    }`}
                >
                    <span className="text-lg">{toastMessage.type === 'error' ? '⚠️' : '✅'}</span>
                    <span>{toastMessage.text}</span>
                </div>
            )}

            {/* Header Banner - Clean, Big, Beautiful */}
            <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <div className="flex items-center gap-2 mb-2">
                        <span className="inline-flex items-center px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 font-bold text-xs uppercase tracking-wide">
                            Billing & Financials
                        </span>
                        <span className="text-xs text-slate-400">Hosur Plant Unit</span>
                    </div>
                    <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                        Tax Invoices & Customer Billing
                    </h1>
                    <p className="text-slate-600 text-sm sm:text-base mt-1">
                        Easily create customer bills, track payments, and print official GST invoices.
                    </p>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                    <button
                        onClick={() => {
                            if (customersList.length > 0) {
                                setNewInvoiceForm((prev) => ({
                                    ...prev,
                                    customerId: customersList[0].id,
                                }));
                                setShowCreateInvoiceModal(true);
                            } else {
                                showToast('No customers registered. Please add a customer first.', 'error');
                            }
                        }}
                        className="px-5 py-3 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-md transition-all flex items-center gap-2"
                    >
                        <span className="text-lg leading-none">+</span>
                        <span>Create New Bill</span>
                    </button>
                    <button
                        onClick={() => {
                            if (customersList.length > 0) {
                                setPaymentForm((prev) => ({ ...prev, customerId: customersList[0].id }));
                                setShowPaymentModal(true);
                            } else {
                                showToast('No customers registered', 'error');
                            }
                        }}
                        className="px-5 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-md transition-all flex items-center gap-2"
                    >
                        <span className="text-lg leading-none">💵</span>
                        <span>Record Payment</span>
                    </button>
                </div>
            </div>

            {/* Top 3 High-Level Big Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm flex items-center justify-between">
                    <div>
                        <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-1">
                            Total Invoiced
                        </span>
                        <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-mono">
                            ₹{totalBilled.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </span>
                        <span className="text-xs text-slate-500 block mt-1.5 font-medium">
                            {invoicesList.length} Total Bills Issued
                        </span>
                    </div>
                    <div className="h-14 w-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center text-2xl font-bold">
                        🧾
                    </div>
                </div>

                <div className="p-6 rounded-3xl bg-emerald-50/80 border border-emerald-200 shadow-sm flex items-center justify-between">
                    <div>
                        <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 block mb-1">
                            Amount Collected
                        </span>
                        <span className="text-2xl sm:text-3xl font-extrabold text-emerald-800 font-mono">
                            ₹{totalCollected.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </span>
                        <span className="text-xs text-emerald-600 block mt-1.5 font-medium">
                            {invoicesList.filter((i) => i.status === 'paid').length} Bills Cleared (100%)
                        </span>
                    </div>
                    <div className="h-14 w-14 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center text-2xl font-bold">
                        💰
                    </div>
                </div>

                <div className="p-6 rounded-3xl bg-rose-50/80 border border-rose-200 shadow-sm flex items-center justify-between">
                    <div>
                        <span className="text-xs font-bold uppercase tracking-wider text-rose-700 block mb-1">
                            Pending Balance
                        </span>
                        <span className="text-2xl sm:text-3xl font-extrabold text-rose-800 font-mono">
                            ₹{totalPending.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </span>
                        <span className="text-xs text-rose-600 block mt-1.5 font-medium">
                            {invoicesList.filter((i) => i.status !== 'paid').length} Bills Awaiting Payment
                        </span>
                    </div>
                    <div className="h-14 w-14 rounded-2xl bg-rose-100 text-rose-700 flex items-center justify-center text-2xl font-bold">
                        ⏳
                    </div>
                </div>
            </div>

            {/* Clean Tab Switcher */}
            <div className="flex bg-slate-100 p-1.5 rounded-2xl w-fit border border-slate-200">
                <button
                    onClick={() => setActiveTab('invoices')}
                    className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${
                        activeTab === 'invoices'
                            ? 'bg-white text-blue-700 shadow-sm'
                            : 'text-slate-600 hover:text-slate-900'
                    }`}
                >
                    📑 All Invoices ({invoicesList.length})
                </button>
                <button
                    onClick={() => setActiveTab('customers')}
                    className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${
                        activeTab === 'customers'
                            ? 'bg-white text-blue-700 shadow-sm'
                            : 'text-slate-600 hover:text-slate-900'
                    }`}
                >
                    🏢 Customer Account Ledgers ({customersList.length})
                </button>
            </div>

            {/* TAB 1: ALL INVOICES (Simple, Clear, Readable) */}
            {activeTab === 'invoices' && (
                <div className="space-y-4">
                    {/* Filter & Search Bar */}
                    <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
                        <div className="flex items-center gap-3 w-full sm:w-auto">
                            <input
                                type="text"
                                placeholder="Search by Invoice # or Customer Name..."
                                value={invoiceSearch}
                                onChange={(e) => setInvoiceSearch(e.target.value)}
                                className="px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-800 placeholder-slate-400 w-full sm:w-80 focus:outline-none focus:border-blue-600"
                            />
                            <select
                                value={invoiceStatusFilter}
                                onChange={(e) => setInvoiceStatusFilter(e.target.value)}
                                className="px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm font-semibold text-slate-700 focus:outline-none focus:border-blue-600 cursor-pointer"
                            >
                                <option value="all">All Invoices</option>
                                <option value="unpaid">Unpaid</option>
                                <option value="partially_paid">Half / Partially Paid</option>
                                <option value="paid">Fully Paid</option>
                            </select>
                        </div>

                        <span className="text-xs text-slate-500 font-medium">
                            Showing {filteredInvoices.length} of {invoicesList.length} invoices
                        </span>
                    </div>

                    {/* Clean Invoices Table with Big Clear Text */}
                    <div className="rounded-3xl bg-white border border-slate-200 shadow-sm overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse text-sm">
                                <thead>
                                    <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase text-xs tracking-wider">
                                        <th className="py-4 px-5">Invoice #</th>
                                        <th className="py-4 px-5">Customer</th>
                                        <th className="py-4 px-5">Date</th>
                                        <th className="py-4 px-5">Total Bill</th>
                                        <th className="py-4 px-5">How Much Paid?</th>
                                        <th className="py-4 px-5">Balance Due</th>
                                        <th className="py-4 px-5">Payment Status</th>
                                        <th className="py-4 px-5 text-right">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {filteredInvoices.length === 0 ? (
                                        <tr>
                                            <td colSpan={8} className="py-12 text-center text-slate-400 text-sm">
                                                No invoices found. Click <b>&quot;Create New Bill&quot;</b> to generate one.
                                            </td>
                                        </tr>
                                    ) : (
                                        filteredInvoices.map((inv) => (
                                            <tr key={inv.id} className="hover:bg-slate-50/70 transition-colors">
                                                <td className="py-4 px-5 font-mono font-extrabold text-blue-700 text-sm">
                                                    {inv.invoiceNumber}
                                                </td>
                                                <td className="py-4 px-5">
                                                    <div className="font-bold text-slate-900 text-sm">
                                                        {inv.customer?.companyName || 'Automotive Client'}
                                                    </div>
                                                    {inv.customer?.gstNumber && (
                                                        <span className="text-xs text-slate-400 font-mono">
                                                            GST: {inv.customer.gstNumber}
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="py-4 px-5 text-slate-600 font-mono text-xs">
                                                    <div>{inv.invoiceDate}</div>
                                                    <span className="text-[11px] text-slate-400">Due: {inv.dueDate}</span>
                                                </td>
                                                <td className="py-4 px-5 font-mono font-bold text-slate-900 text-sm">
                                                    ₹{parseFloat(inv.totalAmount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                                </td>

                                                {/* HOW MUCH PAID - Interactive Input or Locked */}
                                                <td className="py-4 px-5 font-mono">
                                                    {inv.status === 'paid' ? (
                                                        <span className="font-extrabold text-emerald-700 flex items-center gap-1.5 text-sm">
                                                            <span>✓</span> ₹{parseFloat(inv.amountPaid).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                                        </span>
                                                    ) : (
                                                        <div className="flex items-center gap-1.5">
                                                            <span className="text-slate-400 text-xs font-bold">₹</span>
                                                            <input
                                                                type="number"
                                                                min="0"
                                                                max={parseFloat(inv.totalAmount)}
                                                                step="1"
                                                                defaultValue={parseFloat(inv.amountPaid) || 0}
                                                                key={`${inv.id}-${inv.amountPaid}`}
                                                                onBlur={(e) => {
                                                                    let val = parseFloat(e.target.value);
                                                                    const maxTotal = parseFloat(inv.totalAmount);
                                                                    if (isNaN(val) || val < 0) val = 0;
                                                                    if (val > maxTotal) {
                                                                        val = maxTotal;
                                                                        e.target.value = String(maxTotal);
                                                                    }
                                                                    if (val !== parseFloat(inv.amountPaid)) {
                                                                        handleUpdateInvoiceStatus(inv.id, undefined, val);
                                                                    }
                                                                }}
                                                                onKeyDown={(e) => {
                                                                    if (e.key === 'Enter') {
                                                                        let val = parseFloat((e.target as HTMLInputElement).value);
                                                                        const maxTotal = parseFloat(inv.totalAmount);
                                                                        if (isNaN(val) || val < 0) val = 0;
                                                                        if (val > maxTotal) {
                                                                            val = maxTotal;
                                                                            (e.target as HTMLInputElement).value = String(maxTotal);
                                                                        }
                                                                        handleUpdateInvoiceStatus(inv.id, undefined, val);
                                                                    }
                                                                }}
                                                                className="w-28 px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-900 font-extrabold text-sm font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                                                title="Type how much is paid and press Enter"
                                                            />
                                                        </div>
                                                    )}
                                                </td>

                                                {/* BALANCE DUE */}
                                                <td className="py-4 px-5 font-mono text-sm font-extrabold text-rose-700">
                                                    ₹{parseFloat(inv.balanceDue).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                                </td>

                                                {/* PAYMENT STATUS */}
                                                <td className="py-4 px-5">
                                                    {inv.status === 'paid' ? (
                                                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                                                            ✓ FULLY PAID
                                                        </span>
                                                    ) : (
                                                        <select
                                                            value={inv.status}
                                                            onChange={(e) =>
                                                                handleUpdateInvoiceStatus(
                                                                    inv.id,
                                                                    e.target.value as 'paid' | 'partially_paid' | 'unpaid'
                                                                )
                                                            }
                                                            className={`px-3 py-1 rounded-full text-xs font-bold uppercase cursor-pointer border focus:outline-none ${
                                                                inv.status === 'partially_paid'
                                                                    ? 'bg-blue-50 text-blue-700 border-blue-200'
                                                                    : 'bg-rose-50 text-rose-700 border-rose-200'
                                                            }`}
                                                        >
                                                            <option value="unpaid">UNPAID</option>
                                                            <option value="partially_paid">HALF PAID (50%)</option>
                                                            <option value="paid">MARK PAID (100%)</option>
                                                        </select>
                                                    )}
                                                </td>

                                                {/* PRINT ACTION (Strictly unlocked only when PAID) */}
                                                <td className="py-4 px-5 text-right">
                                                    <button
                                                        onClick={() => {
                                                            if (inv.status !== 'paid') {
                                                                showToast(`Cannot print: Bill #${inv.invoiceNumber} is not fully paid yet! (Pending: ₹${parseFloat(inv.balanceDue).toLocaleString('en-IN')})`, 'error');
                                                                return;
                                                            }
                                                            setPrintInvoiceData(inv);
                                                        }}
                                                        className={`px-3.5 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                                                            inv.status === 'paid'
                                                                ? 'bg-blue-600 text-white border-transparent hover:bg-blue-700 shadow-sm cursor-pointer'
                                                                : 'bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed opacity-75'
                                                        }`}
                                                    >
                                                        {inv.status === 'paid' ? '🖨️ Print Bill' : '🔒 Unpaid'}
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}

            {/* TAB 2: CUSTOMER ACCOUNT HISTORY & 360° LEDGER */}
            {activeTab === 'customers' && (
                <div className="space-y-6">
                    {/* Customer Selection Toolbar */}
                    <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
                        <div className="flex items-center gap-3 w-full sm:w-auto">
                            <span className="text-sm font-bold text-slate-700">Choose Customer:</span>
                            <select
                                onChange={(e) => {
                                    if (e.target.value) fetchCustomerLedger(e.target.value);
                                }}
                                className="px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm font-bold text-slate-800 focus:outline-none focus:border-blue-600 cursor-pointer"
                            >
                                <option value="">-- Select Customer Account --</option>
                                {customersList.map((c) => (
                                    <option key={c.id} value={c.id}>
                                        {c.companyName} ({c.city})
                                    </option>
                                ))}
                            </select>
                        </div>
                        <span className="text-xs text-slate-400 font-medium">
                            Inspect real-time balance, bills, and receipt history
                        </span>
                    </div>

                    {/* Customer Ledger View */}
                    {isLoadingLedger ? (
                        <div className="p-12 text-center text-sm font-semibold text-slate-400 bg-white rounded-3xl border border-slate-200">
                            Loading customer accounting ledger...
                        </div>
                    ) : selectedCustomerLedger ? (
                        <div className="space-y-6 animate-in fade-in duration-200">
                            {/* Profile Header & Outstanding Card */}
                            <div className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200 shadow-sm">
                                <div className="flex flex-col md:flex-row md:items-center justify-between pb-6 border-b border-slate-100 gap-4">
                                    <div>
                                        <h2 className="text-2xl font-extrabold text-slate-900">
                                            {selectedCustomerLedger.customer.companyName}
                                        </h2>
                                        <div className="flex flex-wrap items-center gap-3 mt-1.5 text-xs text-slate-500 font-medium">
                                            <span>Contact: <b>{selectedCustomerLedger.customer.contactPerson}</b></span>
                                            <span>•</span>
                                            <span>Phone: <b>{selectedCustomerLedger.customer.phone}</b></span>
                                            <span>•</span>
                                            <span>City: <b>{selectedCustomerLedger.customer.city}</b></span>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => {
                                            setPaymentForm((prev) => ({
                                                ...prev,
                                                customerId: selectedCustomerLedger.customer.id,
                                            }));
                                            setShowPaymentModal(true);
                                        }}
                                        className="px-5 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold shadow-md transition-all self-start md:self-auto"
                                    >
                                        + Record Payment
                                    </button>
                                </div>

                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6">
                                    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                                        <span className="text-xs font-bold uppercase text-slate-400 block mb-1">Total Invoiced</span>
                                        <span className="text-xl font-extrabold text-slate-900 font-mono">
                                            ₹{selectedCustomerLedger.ledger.totalInvoiced.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                        </span>
                                    </div>
                                    <div className="p-4 rounded-2xl bg-emerald-50/80 border border-emerald-200">
                                        <span className="text-xs font-bold uppercase text-emerald-700 block mb-1">Total Received</span>
                                        <span className="text-xl font-extrabold text-emerald-800 font-mono">
                                            ₹{selectedCustomerLedger.ledger.totalReceived.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                        </span>
                                    </div>
                                    <div className="p-4 rounded-2xl bg-rose-50/80 border border-rose-200">
                                        <span className="text-xs font-bold uppercase text-rose-700 block mb-1">Current Outstanding</span>
                                        <span className="text-xl font-extrabold text-rose-800 font-mono">
                                            ₹{selectedCustomerLedger.ledger.currentOutstanding.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                        </span>
                                    </div>
                                    <div className="p-4 rounded-2xl bg-blue-50/80 border border-blue-200">
                                        <span className="text-xs font-bold uppercase text-blue-700 block mb-1">Payment Terms</span>
                                        <span className="text-sm font-extrabold text-blue-900 block mt-1">
                                            {selectedCustomerLedger.customer.paymentTerms || '30 Days Net'}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Invoices List */}
                            <div className="rounded-3xl bg-white border border-slate-200 shadow-sm overflow-hidden">
                                <div className="p-5 border-b border-slate-100 flex items-center justify-between">
                                    <h3 className="text-base font-extrabold text-slate-900">
                                        Billed Invoices ({selectedCustomerLedger.invoices.length})
                                    </h3>
                                </div>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left border-collapse text-sm">
                                        <thead>
                                            <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase text-xs">
                                                <th className="py-3 px-5">Invoice #</th>
                                                <th className="py-3 px-5">Date</th>
                                                <th className="py-3 px-5">Total Amount</th>
                                                <th className="py-3 px-5">Amount Paid</th>
                                                <th className="py-3 px-5">Balance Due</th>
                                                <th className="py-3 px-5">Status</th>
                                                <th className="py-3 px-5 text-right">Action</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100">
                                            {selectedCustomerLedger.invoices.length === 0 ? (
                                                <tr>
                                                    <td colSpan={7} className="py-8 text-center text-slate-400">
                                                        No invoices billed to this account yet.
                                                    </td>
                                                </tr>
                                            ) : (
                                                selectedCustomerLedger.invoices.map((inv) => (
                                                    <tr key={inv.id} className="hover:bg-slate-50/60">
                                                        <td className="py-3.5 px-5 font-mono font-extrabold text-blue-700">
                                                            {inv.invoiceNumber}
                                                        </td>
                                                        <td className="py-3.5 px-5 font-mono text-slate-600 text-xs">{inv.invoiceDate}</td>
                                                        <td className="py-3.5 px-5 font-mono font-bold text-slate-900">
                                                            ₹{parseFloat(inv.totalAmount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                                        </td>
                                                        <td className="py-3.5 px-5 font-mono">
                                                            {inv.status === 'paid' ? (
                                                                <span className="font-extrabold text-emerald-700">
                                                                    ✓ ₹{parseFloat(inv.amountPaid).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                                                </span>
                                                            ) : (
                                                                <span className="font-bold text-slate-700">
                                                                    ₹{parseFloat(inv.amountPaid).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                                                </span>
                                                            )}
                                                        </td>
                                                        <td className="py-3.5 px-5 font-mono text-rose-700 font-extrabold">
                                                            ₹{parseFloat(inv.balanceDue).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                                        </td>
                                                        <td className="py-3.5 px-5">
                                                            {inv.status === 'paid' ? (
                                                                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
                                                                    PAID
                                                                </span>
                                                            ) : (
                                                                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200">
                                                                    UNPAID
                                                                </span>
                                                            )}
                                                        </td>
                                                        <td className="py-3.5 px-5 text-right">
                                                            <button
                                                                onClick={() => {
                                                                    if (inv.status !== 'paid') {
                                                                        const clientName = selectedCustomerLedger.customer.companyName || 'Customer';
                                                                        showToast(`Cannot print: Bill #${inv.invoiceNumber} is not fully paid yet!`, 'error');
                                                                        return;
                                                                    }
                                                                    // Ensure invoice has customer attached
                                                                    const fullInv = {
                                                                        ...inv,
                                                                        customer: inv.customer || {
                                                                            companyName: selectedCustomerLedger.customer.companyName,
                                                                            gstNumber: selectedCustomerLedger.customer.gstNumber || '',
                                                                        },
                                                                    };
                                                                    setPrintInvoiceData(fullInv);
                                                                }}
                                                                className={`px-3 py-1 rounded-xl text-xs font-bold border transition-colors ${
                                                                    inv.status === 'paid'
                                                                        ? 'bg-blue-600 text-white border-transparent hover:bg-blue-700'
                                                                        : 'bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed'
                                                                }`}
                                                            >
                                                                {inv.status === 'paid' ? '🖨️ Print Bill' : '🔒 Unpaid'}
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            {/* Receipts History */}
                            <div className="rounded-3xl bg-white border border-slate-200 shadow-sm overflow-hidden">
                                <div className="p-5 border-b border-slate-100 flex items-center justify-between">
                                    <h3 className="text-base font-extrabold text-slate-900">
                                        Payment Receipts ({selectedCustomerLedger.payments.length})
                                    </h3>
                                </div>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left border-collapse text-sm">
                                        <thead>
                                            <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase text-xs">
                                                <th className="py-3 px-5">Receipt #</th>
                                                <th className="py-3 px-5">Date</th>
                                                <th className="py-3 px-5">Amount</th>
                                                <th className="py-3 px-5">Mode</th>
                                                <th className="py-3 px-5">UTR / Cheque Ref</th>
                                                <th className="py-3 px-5">Bank</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100">
                                            {selectedCustomerLedger.payments.length === 0 ? (
                                                <tr>
                                                    <td colSpan={6} className="py-6 text-center text-slate-400">
                                                        No payment receipts recorded yet.
                                                    </td>
                                                </tr>
                                            ) : (
                                                selectedCustomerLedger.payments.map((p) => (
                                                    <tr key={p.id} className="hover:bg-slate-50/60">
                                                        <td className="py-3 px-5 font-mono font-bold text-emerald-700">
                                                            {p.receiptNumber}
                                                        </td>
                                                        <td className="py-3 px-5 font-mono text-slate-600 text-xs">{p.paymentDate}</td>
                                                        <td className="py-3 px-5 font-mono font-extrabold text-emerald-800">
                                                            ₹{parseFloat(p.amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                                        </td>
                                                        <td className="py-3 px-5 text-slate-700">{p.paymentMode}</td>
                                                        <td className="py-3 px-5 font-mono text-blue-700 font-semibold">{p.referenceNumber}</td>
                                                        <td className="py-3 px-5 text-slate-600">{p.bankName || '—'}</td>
                                                    </tr>
                                                ))
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="p-12 text-center text-sm font-semibold text-slate-400 bg-white rounded-3xl border border-slate-200">
                            Please choose an automotive customer above to inspect their live account history.
                        </div>
                    )}
                </div>
            )}

            {/* MODAL 1: Create Direct Tax Invoice */}
            {showCreateInvoiceModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-200">
                        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                            <h3 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
                                <span>🧾</span>
                                <span>Create GST Tax Invoice</span>
                            </h3>
                            <button
                                onClick={() => setShowCreateInvoiceModal(false)}
                                className="h-8 w-8 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 text-xl font-bold flex items-center justify-center"
                            >
                                ×
                            </button>
                        </div>

                        <form onSubmit={handleCreateDirectInvoice} className="mt-5 space-y-4 text-sm">
                            <div>
                                <label className="block text-slate-700 font-bold mb-1">Customer / Client *</label>
                                <select
                                    required
                                    value={newInvoiceForm.customerId}
                                    onChange={(e) => setNewInvoiceForm({ ...newInvoiceForm, customerId: e.target.value })}
                                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-semibold focus:outline-none focus:border-blue-600 cursor-pointer"
                                >
                                    <option value="">-- Choose Customer --</option>
                                    {customersList.map((c) => (
                                        <option key={c.id} value={c.id}>
                                            {c.companyName} ({c.city})
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-slate-700 font-bold mb-1">Order / PO Ref #</label>
                                    <input
                                        type="text"
                                        placeholder="e.g. PO-8821"
                                        value={newInvoiceForm.orderNumber}
                                        onChange={(e) => setNewInvoiceForm({ ...newInvoiceForm, orderNumber: e.target.value })}
                                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-mono focus:outline-none focus:border-blue-600"
                                    />
                                </div>
                                <div>
                                    <label className="block text-slate-700 font-bold mb-1">Invoice Date *</label>
                                    <input
                                        type="date"
                                        required
                                        value={newInvoiceForm.invoiceDate}
                                        onChange={(e) => setNewInvoiceForm({ ...newInvoiceForm, invoiceDate: e.target.value })}
                                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-mono focus:outline-none focus:border-blue-600"
                                    />
                                </div>
                            </div>

                            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                                <span className="font-bold text-slate-800 block text-xs uppercase tracking-wider">
                                    Item Details
                                </span>
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-slate-600 text-xs mb-1 font-semibold">Part Number</label>
                                        <input
                                            type="text"
                                            required
                                            value={newInvoiceForm.partNumber}
                                            onChange={(e) => setNewInvoiceForm({ ...newInvoiceForm, partNumber: e.target.value })}
                                            className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-900 font-mono text-sm focus:outline-none focus:border-blue-600"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-slate-600 text-xs mb-1 font-semibold">HSN Code</label>
                                        <input
                                            type="text"
                                            value={newInvoiceForm.hsnCode}
                                            onChange={(e) => setNewInvoiceForm({ ...newInvoiceForm, hsnCode: e.target.value })}
                                            className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-900 font-mono text-sm focus:outline-none focus:border-blue-600"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-slate-600 text-xs mb-1 font-semibold">Description</label>
                                    <input
                                        type="text"
                                        required
                                        value={newInvoiceForm.description}
                                        onChange={(e) => setNewInvoiceForm({ ...newInvoiceForm, description: e.target.value })}
                                        className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-900 text-sm focus:outline-none focus:border-blue-600"
                                    />
                                </div>

                                <div className="grid grid-cols-3 gap-3">
                                    <div>
                                        <label className="block text-slate-600 text-xs mb-1 font-semibold">Quantity</label>
                                        <input
                                            type="number"
                                            required
                                            min="1"
                                            value={newInvoiceForm.quantity}
                                            onChange={(e) => setNewInvoiceForm({ ...newInvoiceForm, quantity: Number(e.target.value) })}
                                            className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-900 font-mono text-sm focus:outline-none focus:border-blue-600"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-slate-600 text-xs mb-1 font-semibold">Rate (₹)</label>
                                        <input
                                            type="number"
                                            required
                                            min="0"
                                            step="0.01"
                                            value={newInvoiceForm.unitPrice}
                                            onChange={(e) => setNewInvoiceForm({ ...newInvoiceForm, unitPrice: Number(e.target.value) })}
                                            className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-900 font-mono text-sm focus:outline-none focus:border-blue-600"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-slate-600 text-xs mb-1 font-semibold">GST %</label>
                                        <select
                                            value={newInvoiceForm.taxRate}
                                            onChange={(e) => setNewInvoiceForm({ ...newInvoiceForm, taxRate: Number(e.target.value) })}
                                            className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-900 text-sm focus:outline-none focus:border-blue-600"
                                        >
                                            <option value={18}>18%</option>
                                            <option value={12}>12%</option>
                                            <option value={28}>28%</option>
                                            <option value={5}>5%</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-sm font-mono">
                                    <span className="text-slate-500 font-bold">Total with GST:</span>
                                    <span className="font-extrabold text-blue-700 text-base">
                                        ₹
                                        {(
                                            (newInvoiceForm.quantity * newInvoiceForm.unitPrice) *
                                            (1 + newInvoiceForm.taxRate / 100)
                                        ).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                    </span>
                                </div>
                            </div>

                            <div className="pt-4 flex justify-end gap-3 border-t border-slate-100">
                                <button
                                    type="button"
                                    onClick={() => setShowCreateInvoiceModal(false)}
                                    className="px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={submittingInvoice}
                                    className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-md disabled:opacity-50"
                                >
                                    {submittingInvoice ? 'Generating...' : 'Issue Invoice'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* MODAL 2: Record Payment Receipt */}
            {showPaymentModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-slate-200">
                        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                            <h3 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
                                <span>💵</span>
                                <span>Record Payment Receipt</span>
                            </h3>
                            <button
                                onClick={() => setShowPaymentModal(false)}
                                className="h-8 w-8 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 text-xl font-bold flex items-center justify-center"
                            >
                                ×
                            </button>
                        </div>

                        <form onSubmit={handleRecordPayment} className="mt-5 space-y-4 text-sm">
                            <div>
                                <label className="block text-slate-700 font-bold mb-1">Customer *</label>
                                <select
                                    required
                                    value={paymentForm.customerId}
                                    onChange={(e) => setPaymentForm({ ...paymentForm, customerId: e.target.value })}
                                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-semibold focus:outline-none focus:border-blue-600 cursor-pointer"
                                >
                                    <option value="">-- Choose Customer --</option>
                                    {customersList.map((c) => (
                                        <option key={c.id} value={c.id}>
                                            {c.companyName}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-slate-700 font-bold mb-1">Amount (₹) *</label>
                                    <input
                                        type="number"
                                        required
                                        min="1"
                                        placeholder="5000"
                                        value={paymentForm.amount}
                                        onChange={(e) => setPaymentForm({ ...paymentForm, amount: e.target.value })}
                                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-mono font-bold focus:outline-none focus:border-blue-600"
                                    />
                                </div>
                                <div>
                                    <label className="block text-slate-700 font-bold mb-1">Date *</label>
                                    <input
                                        type="date"
                                        required
                                        value={paymentForm.paymentDate}
                                        onChange={(e) => setPaymentForm({ ...paymentForm, paymentDate: e.target.value })}
                                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-mono focus:outline-none focus:border-blue-600"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-slate-700 font-bold mb-1">Mode *</label>
                                    <select
                                        value={paymentForm.paymentMode}
                                        onChange={(e) => setPaymentForm({ ...paymentForm, paymentMode: e.target.value })}
                                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-semibold focus:outline-none focus:border-blue-600"
                                    >
                                        <option value="NEFT/RTGS">NEFT / RTGS</option>
                                        <option value="UPI">UPI</option>
                                        <option value="Cheque">Cheque</option>
                                        <option value="Bank Transfer">Bank Transfer</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-slate-700 font-bold mb-1">UTR / Ref # *</label>
                                    <input
                                        type="text"
                                        required
                                        placeholder="UTR-12345"
                                        value={paymentForm.referenceNumber}
                                        onChange={(e) => setPaymentForm({ ...paymentForm, referenceNumber: e.target.value })}
                                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-mono focus:outline-none focus:border-blue-600"
                                    />
                                </div>
                            </div>

                            <div className="pt-4 flex justify-end gap-3 border-t border-slate-100">
                                <button
                                    type="button"
                                    onClick={() => setShowPaymentModal(false)}
                                    className="px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-md"
                                >
                                    Record
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* MODAL 3: Printable GST Tax Invoice Sheet (Single Page, Clean, Logo, No Extra Buttons in Print) */}
            {printInvoiceData && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200 print:bg-white print:p-0 print:m-0">
                    <div
                        id="printable-invoice"
                        className="bg-white rounded-3xl max-w-2xl w-full p-8 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto"
                    >
                        {/* Bill Header with Logo */}
                        <div className="flex items-center justify-between pb-5 border-b border-slate-200">
                            <div className="flex items-center gap-4">
                                <Image
                                    src="/btl-logo-cropped.png"
                                    alt="BTL Logo"
                                    width={130}
                                    height={55}
                                    className="h-14 w-auto object-contain"
                                    priority
                                />
                                <div>
                                    <h3 className="text-xl font-extrabold text-slate-900">BTL PRECISION MACHINING</h3>
                                    <p className="text-xs text-slate-500 font-medium mt-0.5">
                                        SIPCOT Phase 1, Hosur, Tamil Nadu 635126 • GSTIN: 33AAACB1234F1Z5
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={() => setPrintInvoiceData(null)}
                                className="text-slate-400 hover:text-slate-600 text-2xl font-bold print:hidden"
                            >
                                ×
                            </button>
                        </div>

                        {/* Customer & Invoice Metadata */}
                        <div className="my-6 p-5 rounded-2xl bg-slate-50 border border-slate-200 grid grid-cols-2 gap-6 text-sm">
                            <div>
                                <span className="font-bold text-slate-400 uppercase text-xs block mb-1">Invoice Details</span>
                                <div className="font-mono font-extrabold text-blue-700 text-base">
                                    {printInvoiceData.invoiceNumber}
                                </div>
                                <div className="text-slate-600 mt-1">Date: <b>{printInvoiceData.invoiceDate}</b></div>
                                <div className="text-slate-600">Due: <b>{printInvoiceData.dueDate}</b></div>
                            </div>
                            <div>
                                <span className="font-bold text-slate-400 uppercase text-xs block mb-1">Billed To</span>
                                <div className="font-extrabold text-slate-900 text-base">
                                    {printInvoiceData.customer?.companyName || 'Apex Automotive Ltd'}
                                </div>
                                <div className="text-slate-600 font-mono mt-1">
                                    GSTIN: <b>{printInvoiceData.customer?.gstNumber || '33AAACB9999Z1Z0'}</b>
                                </div>
                            </div>
                        </div>

                        {/* Invoice Items Table */}
                        <div className="border border-slate-200 rounded-2xl overflow-hidden mb-6">
                            <table className="w-full text-left text-sm">
                                <thead className="bg-slate-100 text-slate-700 font-bold uppercase text-xs">
                                    <tr>
                                        <th className="p-3.5">Description</th>
                                        <th className="p-3.5">HSN Code</th>
                                        <th className="p-3.5 text-right">Qty</th>
                                        <th className="p-3.5 text-right">Rate (₹)</th>
                                        <th className="p-3.5 text-right">Amount (₹)</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {Array.isArray(printInvoiceData.items) ? (
                                        printInvoiceData.items.map((it: any, idx: number) => (
                                            <tr key={idx}>
                                                <td className="p-3.5 font-medium text-slate-900">
                                                    <div className="font-bold">{it.description || it.name}</div>
                                                    <span className="text-xs font-mono text-slate-400">
                                                        Part: {it.partNumber}
                                                    </span>
                                                </td>
                                                <td className="p-3.5 font-mono text-slate-600">{it.hsnCode || '84099949'}</td>
                                                <td className="p-3.5 text-right font-mono font-semibold">{it.quantity}</td>
                                                <td className="p-3.5 text-right font-mono">₹{it.unitPrice}</td>
                                                <td className="p-3.5 text-right font-mono font-extrabold text-slate-900">₹{it.amount}</td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan={5} className="p-4 text-center text-slate-400">
                                                Machined Component Batch
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Totals Breakdown */}
                        <div className="flex justify-end text-sm">
                            <div className="w-80 space-y-2.5 font-mono">
                                <div className="flex justify-between items-center text-slate-700">
                                    <span className="font-semibold text-slate-500">Subtotal:</span>
                                    <span className="font-bold text-slate-900 text-base">
                                        ₹{parseFloat(printInvoiceData.subtotal).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center text-slate-700">
                                    <span className="font-semibold text-slate-500">CGST (9%) + SGST (9%):</span>
                                    <span className="font-bold text-slate-900 text-base">
                                        ₹{parseFloat(printInvoiceData.taxAmount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center font-bold text-slate-900 border-t-2 border-slate-300 pt-3 text-lg">
                                    <span className="font-extrabold">Grand Total:</span>
                                    <span className="text-blue-700 font-extrabold tracking-tight">
                                        ₹{parseFloat(printInvoiceData.totalAmount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Print / Close Footer (Hidden while printing) */}
                        <div className="mt-8 pt-5 border-t border-slate-200 flex justify-end gap-3 print:hidden">
                            <button
                                onClick={() => setPrintInvoiceData(null)}
                                className="px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-sm"
                            >
                                Close
                            </button>
                            <button
                                onClick={() => {
                                    window.print();
                                }}
                                className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-md"
                            >
                                🖨️ Print / Download PDF
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
