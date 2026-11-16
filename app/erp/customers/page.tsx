'use client';

import { useState, useEffect } from 'react';

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
    status: 'active' | 'inactive' | 'lead';
    createdAt: string;
}

export default function CustomersPage() {
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');

    const [form, setForm] = useState({
        companyName: '',
        contactPerson: '',
        email: '',
        phone: '',
        gstNumber: '',
        panNumber: '',
        address: '',
        city: 'Hosur',
        state: 'Tamil Nadu',
        country: 'India',
        pinCode: '635126',
        creditLimit: '100000.00',
        paymentTerms: '30 Days Net',
        status: 'active',
        notes: '',
    });

    const fetchCustomers = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (search) params.set('search', search);
            if (statusFilter) params.set('status', statusFilter);

            const res = await fetch(`/api/customers?${params.toString()}`);
            const data = await res.json();
            if (data.success) {
                setCustomers(data.customers);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCustomers();
    }, [search, statusFilter]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        setErrorMsg('');

        try {
            const res = await fetch('/api/customers', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(form),
            });
            const data = await res.json();
            if (data.success) {
                setIsModalOpen(false);
                setForm({
                    companyName: '',
                    contactPerson: '',
                    email: '',
                    phone: '',
                    gstNumber: '',
                    panNumber: '',
                    address: '',
                    city: 'Hosur',
                    state: 'Tamil Nadu',
                    country: 'India',
                    pinCode: '635126',
                    creditLimit: '100000.00',
                    paymentTerms: '30 Days Net',
                    status: 'active',
                    notes: '',
                });
                fetchCustomers();
            } else {
                setErrorMsg(data.error || 'Failed to create customer');
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
                        <span>👥</span>
                        <span>Customer Management (CRM)</span>
                    </h1>
                    <p className="text-xs text-slate-500 mt-1">
                        Automotive and aerospace OEM client accounts, GSTIN profiles, and credit terms
                    </p>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-sm transition-colors flex items-center gap-2 w-fit"
                >
                    <span>+</span>
                    <span>Add New Customer</span>
                </button>
            </div>

            {/* Quick Metrics */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-sm">
                    <span className="text-slate-500 text-xs font-medium">Total Customers</span>
                    <div className="text-2xl font-bold text-slate-900 mt-1">{customers.length}</div>
                </div>
                <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-sm">
                    <span className="text-slate-500 text-xs font-medium">Active Accounts</span>
                    <div className="text-2xl font-bold text-emerald-600 mt-1">
                        {customers.filter((c) => c.status === 'active').length}
                    </div>
                </div>
                <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-sm">
                    <span className="text-slate-500 text-xs font-medium">Leads / Inquiries</span>
                    <div className="text-2xl font-bold text-amber-600 mt-1">
                        {customers.filter((c) => c.status === 'lead').length}
                    </div>
                </div>
                <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-sm">
                    <span className="text-slate-500 text-xs font-medium">Primary Hub</span>
                    <div className="text-sm font-bold text-blue-600 mt-2 truncate">Hosur & Bangalore</div>
                </div>
            </div>

            {/* Filters Bar */}
            <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                    <input
                        type="text"
                        placeholder="Search by company name, contact person, GSTIN or city..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-600 shadow-sm transition-colors"
                    />
                </div>
                <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-700 focus:outline-none focus:border-blue-600 shadow-sm"
                >
                    <option value="">All Statuses</option>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="lead">Lead</option>
                </select>
            </div>

            {/* Customers Table */}
            <div className="bg-white border border-slate-200/90 rounded-2xl overflow-hidden shadow-sm">
                {loading ? (
                    <div className="py-16 text-center text-xs text-slate-500">Loading customer records...</div>
                ) : customers.length === 0 ? (
                    <div className="py-16 text-center text-xs text-slate-500">
                        No customers found matching your criteria. Click "Add New Customer" to register your first client.
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs">
                            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase font-semibold text-[11px]">
                                <tr>
                                    <th className="py-3.5 px-4">Company Name</th>
                                    <th className="py-3.5 px-4">Contact Person</th>
                                    <th className="py-3.5 px-4">Contact Details</th>
                                    <th className="py-3.5 px-4">GSTIN</th>
                                    <th className="py-3.5 px-4">Location</th>
                                    <th className="py-3.5 px-4">Payment Terms</th>
                                    <th className="py-3.5 px-4">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {customers.map((c) => (
                                    <tr key={c.id} className="hover:bg-slate-50/80 transition-colors">
                                        <td className="py-3.5 px-4 font-semibold text-slate-900">{c.companyName}</td>
                                        <td className="py-3.5 px-4 text-slate-700">{c.contactPerson}</td>
                                        <td className="py-3.5 px-4 text-slate-600">
                                            <div>{c.email}</div>
                                            <div className="text-[11px] text-slate-500">{c.phone}</div>
                                        </td>
                                        <td className="py-3.5 px-4 font-mono text-[11px] text-slate-600">
                                            {c.gstNumber || '—'}
                                        </td>
                                        <td className="py-3.5 px-4 text-slate-600">{c.city}, {c.state}</td>
                                        <td className="py-3.5 px-4 text-slate-700 font-medium">{c.paymentTerms}</td>
                                        <td className="py-3.5 px-4">
                                            <span
                                                className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold border ${
                                                    c.status === 'active'
                                                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                                        : c.status === 'lead'
                                                        ? 'bg-amber-50 text-amber-700 border-amber-200'
                                                        : 'bg-slate-100 text-slate-600 border-slate-200'
                                                }`}
                                            >
                                                {c.status.toUpperCase()}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Add Customer Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
                    <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto p-6 space-y-4 shadow-2xl">
                        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                            <div>
                                <h3 className="text-base font-bold text-slate-900">Add Customer Master</h3>
                                <p className="text-xs text-slate-500">Register a new client or automotive OEM account</p>
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
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-slate-700 font-medium mb-1">Company / OEM Name *</label>
                                    <input
                                        type="text"
                                        required
                                        value={form.companyName}
                                        onChange={(e) => setForm({ ...form, companyName: e.target.value })}
                                        placeholder="e.g. Apex Aerospace Ltd."
                                        className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
                                    />
                                </div>
                                <div>
                                    <label className="block text-slate-700 font-medium mb-1">Contact Person *</label>
                                    <input
                                        type="text"
                                        required
                                        value={form.contactPerson}
                                        onChange={(e) => setForm({ ...form, contactPerson: e.target.value })}
                                        placeholder="e.g. Rajesh Kumar"
                                        className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-slate-700 font-medium mb-1">Email *</label>
                                    <input
                                        type="email"
                                        required
                                        value={form.email}
                                        onChange={(e) => setForm({ ...form, email: e.target.value })}
                                        placeholder="procurement@client.com"
                                        className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
                                    />
                                </div>
                                <div>
                                    <label className="block text-slate-700 font-medium mb-1">Phone *</label>
                                    <input
                                        type="text"
                                        required
                                        value={form.phone}
                                        onChange={(e) => setForm({ ...form, phone: e.target.value })}
                                        placeholder="+91 98765 43210"
                                        className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-slate-700 font-medium mb-1">GSTIN Number</label>
                                    <input
                                        type="text"
                                        value={form.gstNumber}
                                        onChange={(e) => setForm({ ...form, gstNumber: e.target.value.toUpperCase() })}
                                        placeholder="33AAAAA0000A1Z5"
                                        className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-slate-900 font-mono uppercase focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
                                    />
                                </div>
                                <div>
                                    <label className="block text-slate-700 font-medium mb-1">Payment Terms</label>
                                    <select
                                        value={form.paymentTerms}
                                        onChange={(e) => setForm({ ...form, paymentTerms: e.target.value })}
                                        className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
                                    >
                                        <option value="100% Advance">100% Advance</option>
                                        <option value="15 Days Net">15 Days Net</option>
                                        <option value="30 Days Net">30 Days Net</option>
                                        <option value="45 Days Net">45 Days Net</option>
                                        <option value="60 Days Net">60 Days Net</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-slate-700 font-medium mb-1">Plant / Office Address *</label>
                                <textarea
                                    required
                                    rows={2}
                                    value={form.address}
                                    onChange={(e) => setForm({ ...form, address: e.target.value })}
                                    placeholder="Plot No. 12, SIPCOT Industrial Complex"
                                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
                                />
                            </div>

                            <div className="grid grid-cols-3 gap-3">
                                <div>
                                    <label className="block text-slate-700 font-medium mb-1">City *</label>
                                    <input
                                        type="text"
                                        required
                                        value={form.city}
                                        onChange={(e) => setForm({ ...form, city: e.target.value })}
                                        className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:border-blue-600"
                                    />
                                </div>
                                <div>
                                    <label className="block text-slate-700 font-medium mb-1">State *</label>
                                    <input
                                        type="text"
                                        required
                                        value={form.state}
                                        onChange={(e) => setForm({ ...form, state: e.target.value })}
                                        className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:border-blue-600"
                                    />
                                </div>
                                <div>
                                    <label className="block text-slate-700 font-medium mb-1">PIN Code *</label>
                                    <input
                                        type="text"
                                        required
                                        value={form.pinCode}
                                        onChange={(e) => setForm({ ...form, pinCode: e.target.value })}
                                        className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:border-blue-600"
                                    />
                                </div>
                            </div>

                            <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 font-medium"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-sm transition-colors"
                                >
                                    {submitting ? 'Saving...' : 'Save Customer'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
