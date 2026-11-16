'use client';

import { useState, useEffect } from 'react';

interface Supplier {
    id: string;
    companyName: string;
    contactPerson: string;
    email: string;
    phone: string;
    gstNumber: string | null;
    city: string;
    rating: number;
}

interface Product {
    id: string;
    partNumber: string;
    name: string;
    uom: string;
    standardCost: string;
    materialType: string;
}

interface Warehouse {
    id: string;
    name: string;
    code: string;
}

interface PurchaseOrderItem {
    productId?: string;
    partNumber: string;
    description: string;
    quantity: number;
    unitPrice: number;
    receivedQuantity: number;
    uom: string;
    lineTotal: number;
}

interface PurchaseOrder {
    id: string;
    poNumber: string;
    supplierId: string;
    supplier: Supplier;
    orderDate: string;
    expectedDeliveryDate: string;
    subtotal: string;
    taxAmount: string;
    totalAmount: string;
    status: 'draft' | 'sent' | 'partially_received' | 'received' | 'cancelled';
    items: PurchaseOrderItem[];
    notes?: string;
}

export default function PurchaseOrdersPage() {
    const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>([]);
    const [suppliers, setSuppliers] = useState<Supplier[]>([]);
    const [products, setProducts] = useState<Product[]>([]);
    const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');

    // Modals
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [selectedPoForGrn, setSelectedPoForGrn] = useState<PurchaseOrder | null>(null);
    const [submitting, setSubmitting] = useState(false);
    const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

    const showToast = (text: string, type: 'success' | 'error' = 'success') => {
        setToastMessage({ text, type });
        setTimeout(() => setToastMessage(null), 4500);
    };

    // New PO Form
    const [poForm, setPoForm] = useState({
        supplierId: '',
        orderDate: new Date().toISOString().split('T')[0],
        expectedDeliveryDate: new Date(Date.now() + 10 * 86400000).toISOString().split('T')[0],
        partNumber: 'RAW-SS316-BAR',
        description: 'Stainless Steel 316L Round Bar 50mm Dia',
        productId: '',
        quantity: 150,
        unitPrice: 320,
        uom: 'KG',
        notes: '',
    });

    // GRN Inward Receipt Form
    const [grnForm, setGrnForm] = useState({
        warehouseId: '',
        batchNumber: 'LOT-RAW-2026-B1',
        binLocation: 'BAY1-RAW-RACK-02',
        receivedQtyMap: {} as Record<string, number>,
        notes: 'Inward material quality inspection cleared. Verified heat lot certificate.',
    });

    const fetchData = async () => {
        setLoading(true);
        try {
            const [poRes, supRes, prodRes, whRes] = await Promise.all([
                fetch('/api/purchase'),
                fetch('/api/suppliers'),
                fetch('/api/products'),
                fetch('/api/warehouses'),
            ]);

            const poData = await poRes.json();
            const supData = await supRes.json();
            const prodData = await prodRes.json();
            const whData = await whRes.json();

            if (poData.success) setPurchaseOrders(poData.purchaseOrders || []);
            if (supData.success) {
                setSuppliers(supData.suppliers || []);
                if (supData.suppliers?.length > 0 && !poForm.supplierId) {
                    setPoForm((prev) => ({ ...prev, supplierId: supData.suppliers[0].id }));
                }
            }
            if (prodData.success) {
                setProducts(prodData.products || []);
                if (prodData.products?.length > 0 && !poForm.productId) {
                    setPoForm((prev) => ({
                        ...prev,
                        productId: prodData.products[0].id,
                        partNumber: prodData.products[0].partNumber,
                        description: prodData.products[0].name,
                        unitPrice: Number(prodData.products[0].standardCost) || 320,
                    }));
                }
            }
            if (whData.success) {
                setWarehouses(whData.warehouses || []);
                if (whData.warehouses?.length > 0 && !grnForm.warehouseId) {
                    setGrnForm((prev) => ({ ...prev, warehouseId: whData.warehouses[0].id }));
                }
            }
        } catch (err) {
            console.error('Failed to load purchase orders:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    // Handle Create PO Submit
    const handleCreatePo = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            const payload = {
                supplierId: poForm.supplierId,
                orderDate: poForm.orderDate,
                expectedDeliveryDate: poForm.expectedDeliveryDate,
                items: [
                    {
                        productId: poForm.productId || null,
                        partNumber: poForm.partNumber,
                        description: poForm.description,
                        quantity: Number(poForm.quantity),
                        unitPrice: Number(poForm.unitPrice),
                        uom: poForm.uom,
                    },
                ],
                notes: poForm.notes,
            };

            const res = await fetch('/api/purchase', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });
            const data = await res.json();
            if (data.success) {
                showToast(data.message);
                setIsCreateModalOpen(false);
                fetchData();
            } else {
                showToast(data.error || 'Failed to create PO', 'error');
            }
        } catch {
            showToast('Network error while issuing PO', 'error');
        } finally {
            setSubmitting(false);
        }
    };

    // Open GRN Inward Modal
    const handleOpenGrn = (po: PurchaseOrder) => {
        setSelectedPoForGrn(po);
        const initialMap: Record<string, number> = {};
        po.items.forEach((item) => {
            const remaining = Math.max(0, item.quantity - (item.receivedQuantity || 0));
            initialMap[item.partNumber] = remaining;
        });
        setGrnForm((prev) => ({
            ...prev,
            receivedQtyMap: initialMap,
            batchNumber: `LOT-${po.poNumber.slice(-4)}`,
        }));
    };

    // Submit GRN Inward
    const handleSubmitGrn = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedPoForGrn) return;

        setSubmitting(true);
        try {
            const res = await fetch(`/api/purchase/${selectedPoForGrn.id}/receive`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    warehouseId: grnForm.warehouseId || warehouses[0]?.id,
                    receivedItems: grnForm.receivedQtyMap,
                    batchNumber: grnForm.batchNumber,
                    binLocation: grnForm.binLocation,
                    notes: grnForm.notes,
                }),
            });
            const data = await res.json();
            if (data.success) {
                showToast(data.message);
                setSelectedPoForGrn(null);
                fetchData();
            } else {
                showToast(data.error || 'Failed to process inward receipt', 'error');
            }
        } catch {
            showToast('Network error while posting GRN inward', 'error');
        } finally {
            setSubmitting(false);
        }
    };

    const filteredPos = purchaseOrders.filter((p) => {
        const matchesSearch =
            p.poNumber.toLowerCase().includes(search.toLowerCase()) ||
            p.supplier?.companyName.toLowerCase().includes(search.toLowerCase());
        const matchesStatus = statusFilter === 'all' || p.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    const totalOrderValue = purchaseOrders.reduce((sum, po) => sum + parseFloat(po.totalAmount), 0);
    const pendingDeliveries = purchaseOrders.filter((po) => po.status === 'sent' || po.status === 'partially_received').length;

    return (
        <div className="space-y-6">
            {/* Toast */}
            {toastMessage && (
                <div
                    className={`fixed top-5 right-5 z-50 px-4 py-3 rounded-xl shadow-lg border text-xs font-semibold flex items-center gap-2 transition-all ${
                        toastMessage.type === 'error'
                            ? 'bg-rose-50 border-rose-200 text-rose-800'
                            : 'bg-emerald-50 border-emerald-200 text-emerald-800'
                    }`}
                >
                    <span>{toastMessage.type === 'error' ? '⚠️' : '✅'}</span>
                    <span>{toastMessage.text}</span>
                </div>
            )}

            {/* Header */}
            <div className="pb-4 border-b border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
                        <span>🛒</span>
                        <span>Purchase Orders & Vendor Procurement</span>
                    </h1>
                    <p className="text-slate-500 text-xs mt-1">
                        Raw metal procurement, carbide tooling orders, and automated Goods Receipt Note (GRN) warehouse stock inward
                    </p>
                </div>
                <button
                    onClick={() => setIsCreateModalOpen(true)}
                    className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-sm flex items-center gap-1.5 transition-colors self-start md:self-auto"
                >
                    <span>+</span>
                    <span>Issue Purchase Order (PO)</span>
                </button>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-sm">
                    <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 block mb-1">
                        Total Orders Issued
                    </span>
                    <span className="text-2xl font-bold text-slate-900">{purchaseOrders.length}</span>
                    <span className="text-[11px] text-slate-500 block mt-1">Vendor purchase contracts</span>
                </div>
                <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-sm">
                    <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 block mb-1">
                        Procurement Pipeline
                    </span>
                    <span className="text-2xl font-bold text-blue-700 font-mono">
                        ₹{totalOrderValue.toLocaleString('en-IN')}
                    </span>
                    <span className="text-[11px] text-slate-500 block mt-1">Raw material & tooling spend</span>
                </div>
                <div className="p-5 rounded-2xl bg-amber-50/70 border border-amber-200 shadow-sm">
                    <span className="text-xs font-semibold uppercase tracking-wider text-amber-700 block mb-1">
                        Awaiting Delivery / GRN
                    </span>
                    <span className="text-2xl font-bold text-amber-800">{pendingDeliveries} POs</span>
                    <span className="text-[11px] text-amber-600 block mt-1">In transit or partial inward</span>
                </div>
                <div className="p-5 rounded-2xl bg-emerald-50/70 border border-emerald-200 shadow-sm">
                    <span className="text-xs font-semibold uppercase tracking-wider text-emerald-700 block mb-1">
                        Fulfilled & Inwarded
                    </span>
                    <span className="text-2xl font-bold text-emerald-800">
                        {purchaseOrders.filter((p) => p.status === 'received').length} POs
                    </span>
                    <span className="text-[11px] text-emerald-600 block mt-1">100% stock received in store</span>
                </div>
            </div>

            {/* Filter Toolbar */}
            <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="flex items-center gap-3 w-full sm:w-auto">
                    <input
                        type="text"
                        placeholder="Search PO #, supplier name..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 placeholder-slate-400 w-full sm:w-72 focus:outline-none focus:border-blue-600"
                    />
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 focus:outline-none focus:border-blue-600"
                    >
                        <option value="all">All Statuses</option>
                        <option value="sent">Sent / Pending</option>
                        <option value="partially_received">Partially Received</option>
                        <option value="received">Fully Received</option>
                    </select>
                </div>
                <div className="text-xs text-slate-500">
                    📦 One-Click GRN: Automatically updates warehouse stock & generates audit ledger
                </div>
            </div>

            {/* Purchase Orders Table */}
            <div className="rounded-2xl bg-white border border-slate-200/90 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-xs">
                        <thead>
                            <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider">
                                <th className="py-3 px-4">PO Number</th>
                                <th className="py-3 px-4">Vendor / Supplier</th>
                                <th className="py-3 px-4">Procured Items & Qty</th>
                                <th className="py-3 px-4">Order Date</th>
                                <th className="py-3 px-4">Target Date</th>
                                <th className="py-3 px-4">PO Amount</th>
                                <th className="py-3 px-4">Inward Status</th>
                                <th className="py-3 px-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {loading ? (
                                <tr>
                                    <td colSpan={8} className="py-12 text-center text-slate-400">
                                        Loading purchase orders...
                                    </td>
                                </tr>
                            ) : filteredPos.length === 0 ? (
                                <tr>
                                    <td colSpan={8} className="py-12 text-center text-slate-400">
                                        No purchase orders found. Click "+ Issue Purchase Order" above to create one.
                                    </td>
                                </tr>
                            ) : (
                                filteredPos.map((po) => (
                                    <tr key={po.id} className="hover:bg-slate-50/60 transition-colors">
                                        <td className="py-3.5 px-4 font-mono font-bold text-blue-700">
                                            {po.poNumber}
                                        </td>
                                        <td className="py-3.5 px-4">
                                            <div className="font-semibold text-slate-900">{po.supplier?.companyName}</div>
                                            <span className="text-[10px] text-slate-400 font-mono">
                                                GST: {po.supplier?.gstNumber || '33AABCS1234D1Z2'}
                                            </span>
                                        </td>
                                        <td className="py-3.5 px-4">
                                            {Array.isArray(po.items) &&
                                                po.items.map((item, idx) => (
                                                    <div key={idx} className="space-y-0.5">
                                                        <span className="font-medium text-slate-800">
                                                            {item.description}
                                                        </span>
                                                        <div className="text-[10px] text-slate-500 font-mono">
                                                            Ordered: <b>{item.quantity} {item.uom}</b> • Inwarded:{' '}
                                                            <b className="text-emerald-700">{item.receivedQuantity || 0} {item.uom}</b>
                                                        </div>
                                                    </div>
                                                ))}
                                        </td>
                                        <td className="py-3.5 px-4 font-mono text-slate-600">{po.orderDate}</td>
                                        <td className="py-3.5 px-4 font-mono text-slate-600">{po.expectedDeliveryDate || '—'}</td>
                                        <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                                            ₹{parseFloat(po.totalAmount).toLocaleString('en-IN')}
                                        </td>
                                        <td className="py-3.5 px-4">
                                            <span
                                                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                                                    po.status === 'received'
                                                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                                        : po.status === 'partially_received'
                                                        ? 'bg-blue-50 text-blue-700 border border-blue-200'
                                                        : 'bg-amber-50 text-amber-800 border border-amber-200'
                                                }`}
                                            >
                                                {po.status === 'received'
                                                    ? '✓ 100% RECEIVED'
                                                    : po.status === 'partially_received'
                                                    ? 'PARTIAL INWARD'
                                                    : 'AWAITING DELIVERY'}
                                            </span>
                                        </td>
                                        <td className="py-3.5 px-4 text-right">
                                            {po.status !== 'received' ? (
                                                <button
                                                    onClick={() => handleOpenGrn(po)}
                                                    className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm transition-all"
                                                >
                                                    Receive GRN Inward
                                                </button>
                                            ) : (
                                                <span className="text-emerald-700 font-semibold text-[11px] inline-flex items-center gap-1">
                                                    <span>✓</span> Stored in Warehouse
                                                </span>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* MODAL: CREATE PURCHASE ORDER */}
            {isCreateModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                                <span>🛒</span>
                                <span>Issue Vendor Purchase Order (PO)</span>
                            </h3>
                            <button
                                onClick={() => setIsCreateModalOpen(false)}
                                className="text-slate-400 hover:text-slate-600 text-lg leading-none"
                            >
                                ×
                            </button>
                        </div>

                        <form onSubmit={handleCreatePo} className="mt-4 space-y-3 text-xs">
                            <div>
                                <label className="block text-slate-700 font-semibold mb-1">Approved Vendor / Supplier *</label>
                                <select
                                    required
                                    value={poForm.supplierId}
                                    onChange={(e) => setPoForm({ ...poForm, supplierId: e.target.value })}
                                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 focus:outline-none focus:border-blue-600"
                                >
                                    {suppliers.map((s) => (
                                        <option key={s.id} value={s.id}>
                                            {s.companyName} ({s.city}) - ⭐ {s.rating}/5
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-slate-700 font-semibold mb-1">PO Issue Date *</label>
                                    <input
                                        type="date"
                                        required
                                        value={poForm.orderDate}
                                        onChange={(e) => setPoForm({ ...poForm, orderDate: e.target.value })}
                                        className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 font-mono focus:outline-none focus:border-blue-600"
                                    />
                                </div>
                                <div>
                                    <label className="block text-slate-700 font-semibold mb-1">Expected Inward Date *</label>
                                    <input
                                        type="date"
                                        required
                                        value={poForm.expectedDeliveryDate}
                                        onChange={(e) => setPoForm({ ...poForm, expectedDeliveryDate: e.target.value })}
                                        className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 font-mono focus:outline-none focus:border-blue-600"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-slate-700 font-semibold mb-1">Raw Metal / Part Number *</label>
                                    <input
                                        type="text"
                                        required
                                        value={poForm.partNumber}
                                        onChange={(e) => setPoForm({ ...poForm, partNumber: e.target.value })}
                                        className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 font-mono focus:outline-none focus:border-blue-600"
                                    />
                                </div>
                                <div>
                                    <label className="block text-slate-700 font-semibold mb-1">Link Component Master</label>
                                    <select
                                        value={poForm.productId}
                                        onChange={(e) => {
                                            const p = products.find((pr) => pr.id === e.target.value);
                                            setPoForm({
                                                ...poForm,
                                                productId: e.target.value,
                                                partNumber: p?.partNumber || poForm.partNumber,
                                                description: p?.name || poForm.description,
                                            });
                                        }}
                                        className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 focus:outline-none focus:border-blue-600"
                                    >
                                        <option value="">-- Generic Inward Item --</option>
                                        {products.map((p) => (
                                            <option key={p.id} value={p.id}>
                                                {p.partNumber} ({p.name})
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-slate-700 font-semibold mb-1">Item Specification / Grade *</label>
                                <input
                                    type="text"
                                    required
                                    value={poForm.description}
                                    onChange={(e) => setPoForm({ ...poForm, description: e.target.value })}
                                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 focus:outline-none focus:border-blue-600 font-medium"
                                />
                            </div>

                            <div className="grid grid-cols-3 gap-3">
                                <div>
                                    <label className="block text-slate-700 font-semibold mb-1">Order Quantity *</label>
                                    <input
                                        type="number"
                                        required
                                        min="1"
                                        value={poForm.quantity}
                                        onChange={(e) => setPoForm({ ...poForm, quantity: Number(e.target.value) })}
                                        className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 font-mono focus:outline-none focus:border-blue-600"
                                    />
                                </div>
                                <div>
                                    <label className="block text-slate-700 font-semibold mb-1">Unit Rate (₹) *</label>
                                    <input
                                        type="number"
                                        required
                                        min="1"
                                        value={poForm.unitPrice}
                                        onChange={(e) => setPoForm({ ...poForm, unitPrice: Number(e.target.value) })}
                                        className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 font-mono focus:outline-none focus:border-blue-600"
                                    />
                                </div>
                                <div>
                                    <label className="block text-slate-700 font-semibold mb-1">Unit of Measure (UOM)</label>
                                    <select
                                        value={poForm.uom}
                                        onChange={(e) => setPoForm({ ...poForm, uom: e.target.value })}
                                        className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 focus:outline-none focus:border-blue-600"
                                    >
                                        <option value="KG">KG</option>
                                        <option value="PCS">PCS</option>
                                        <option value="NOS">NOS</option>
                                        <option value="SET">SET</option>
                                        <option value="BARS">BARS</option>
                                    </select>
                                </div>
                            </div>

                            <div className="p-3 bg-blue-50 rounded-xl border border-blue-200 text-xs flex justify-between font-mono">
                                <span className="text-blue-800 font-semibold">Estimated Gross Total (incl 18% GST):</span>
                                <span className="font-bold text-blue-900">
                                    ₹{((poForm.quantity * poForm.unitPrice) * 1.18).toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                                </span>
                            </div>

                            <div className="pt-4 flex justify-end gap-2 border-t border-slate-100">
                                <button
                                    type="button"
                                    onClick={() => setIsCreateModalOpen(false)}
                                    className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-sm"
                                >
                                    Generate & Issue PO
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* MODAL: GOODS RECEIPT NOTE (GRN) INWARD RECEIPT */}
            {selectedPoForGrn && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200">
                        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                            <div>
                                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                                    <span>📥</span>
                                    <span>Goods Receipt Note (GRN) Inward</span>
                                </h3>
                                <p className="text-xs text-slate-500 mt-0.5">
                                    {selectedPoForGrn.poNumber} • Vendor: {selectedPoForGrn.supplier?.companyName}
                                </p>
                            </div>
                            <button
                                onClick={() => setSelectedPoForGrn(null)}
                                className="text-slate-400 hover:text-slate-600 text-lg leading-none"
                            >
                                ×
                            </button>
                        </div>

                        <form onSubmit={handleSubmitGrn} className="mt-4 space-y-3 text-xs">
                            <div>
                                <label className="block text-slate-700 font-semibold mb-1">Receiving Warehouse *</label>
                                <select
                                    required
                                    value={grnForm.warehouseId}
                                    onChange={(e) => setGrnForm({ ...grnForm, warehouseId: e.target.value })}
                                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 focus:outline-none focus:border-blue-600"
                                >
                                    {warehouses.map((w) => (
                                        <option key={w.id} value={w.id}>
                                            {w.name} ({w.code})
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Line items inward quantity */}
                            <div className="space-y-2">
                                <span className="font-semibold text-slate-800 block">Items Delivered by Vendor:</span>
                                <div className="border border-slate-200 rounded-xl divide-y divide-slate-100 overflow-hidden">
                                    {selectedPoForGrn.items.map((item, idx) => (
                                        <div key={idx} className="p-3 bg-slate-50/50 flex items-center justify-between gap-4">
                                            <div>
                                                <span className="font-semibold text-slate-900 block">{item.description}</span>
                                                <span className="text-[10px] text-slate-500 font-mono">
                                                    Part: {item.partNumber} • Ordered: {item.quantity} {item.uom}
                                                </span>
                                            </div>
                                            <div className="w-32">
                                                <label className="text-[10px] text-slate-500 block mb-0.5">Inward Qty ({item.uom})</label>
                                                <input
                                                    type="number"
                                                    required
                                                    min="1"
                                                    max={item.quantity}
                                                    value={grnForm.receivedQtyMap[item.partNumber] ?? item.quantity}
                                                    onChange={(e) => {
                                                        const val = Number(e.target.value);
                                                        setGrnForm((prev) => ({
                                                            ...prev,
                                                            receivedQtyMap: {
                                                                ...prev.receivedQtyMap,
                                                                [item.partNumber]: val,
                                                            },
                                                        }));
                                                    }}
                                                    className="w-full px-2.5 py-1.5 rounded-lg bg-white border border-slate-300 font-mono font-bold text-emerald-700 text-xs focus:outline-none focus:border-emerald-500"
                                                />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-slate-700 font-semibold mb-1">Batch / Heat Lot # *</label>
                                    <input
                                        type="text"
                                        required
                                        value={grnForm.batchNumber}
                                        onChange={(e) => setGrnForm({ ...grnForm, batchNumber: e.target.value })}
                                        className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 font-mono focus:outline-none focus:border-blue-600"
                                    />
                                </div>
                                <div>
                                    <label className="block text-slate-700 font-semibold mb-1">Storage Bin Location *</label>
                                    <input
                                        type="text"
                                        required
                                        value={grnForm.binLocation}
                                        onChange={(e) => setGrnForm({ ...grnForm, binLocation: e.target.value })}
                                        className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 font-mono focus:outline-none focus:border-blue-600"
                                    />
                                </div>
                            </div>

                            <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-[11px] text-emerald-800">
                                📦 Posting GRN will automatically credit the inventory balance in <b>Hosur Central Warehouse</b> and generate a permanent audit movement entry.
                            </div>

                            <div className="pt-4 flex justify-end gap-2 border-t border-slate-100">
                                <button
                                    type="button"
                                    onClick={() => setSelectedPoForGrn(null)}
                                    className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold shadow-sm"
                                >
                                    Confirm Inward & Credit Stock
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

