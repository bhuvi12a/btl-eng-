'use client';

import { useState, useEffect } from 'react';

interface Warehouse {
    id: string;
    name: string;
    code: string;
    location: string;
}

interface Product {
    id: string;
    partNumber: string;
    name: string;
    uom: string;
    reorderPoint: string;
    category?: { name: string };
}

interface StockItem {
    id: string;
    productId: string;
    warehouseId: string;
    quantity: string;
    binLocation: string | null;
    batchNumber: string | null;
    isLowStock: boolean;
    product: Product;
    warehouse: Warehouse;
}

interface Transaction {
    id: string;
    transactionType: string;
    quantity: string;
    unitCost: string;
    referenceType: string | null;
    createdAt: string;
    product: { partNumber: string; name: string };
    fromWarehouse?: { name: string };
    toWarehouse?: { name: string };
    performedBy?: { fullName: string };
}

interface QualityInspection {
    id: string;
    stockId?: string | null;
    productId: string;
    product?: { partNumber: string; name: string };
    batchNumber: string | null;
    inspectedQuantity: string;
    passedQuantity: string;
    rejectedQuantity: string;
    rejectionReason: string | null;
    rejectionPercentage: string;
    createdAt: string;
    inspectedBy?: { fullName: string; email: string };
}

export default function InventoryPage() {
    const [activeTab, setActiveTab] = useState<'stock' | 'quality' | 'transactions'>('stock');

    const [stock, setStock] = useState<StockItem[]>([]);
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [inspections, setInspections] = useState<QualityInspection[]>([]);
    const [inspectionSummary, setInspectionSummary] = useState({
        totalInspected: 0,
        totalRejected: 0,
        overallRejectionPercent: '0.00%',
    });

    const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [lowStockFilter, setLowStockFilter] = useState(false);

    // Modals
    const [isMovementModalOpen, setIsMovementModalOpen] = useState(false);
    const [isInspectModalOpen, setIsInspectModalOpen] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

    const showToast = (text: string, type: 'success' | 'error' = 'success') => {
        setToastMessage({ text, type });
        setTimeout(() => setToastMessage(null), 4500);
    };

    // Movement Form
    const [movementForm, setMovementForm] = useState({
        transactionType: 'purchase_inward',
        productId: '',
        toWarehouseId: '',
        quantity: '50',
        unitCost: '250.00',
        referenceType: 'purchase_order',
        batchNumber: 'LOT-2026-001',
        binLocation: 'BAY1-RACK-04',
        notes: '',
    });

    // Quality Inspection Form
    const [inspectForm, setInspectForm] = useState({
        productId: '',
        stockId: '',
        batchNumber: 'BATCH-VMC-2026-A1',
        inspectedQuantity: 100,
        passedQuantity: 96,
        rejectedQuantity: 4,
        rejectionReason: 'Tolerance undersize by 0.04mm during bore turning',
    });

    const fetchData = async () => {
        setLoading(true);
        try {
            const [invRes, whRes, prodRes, inspRes] = await Promise.all([
                fetch(`/api/inventory?lowStock=${lowStockFilter}`),
                fetch('/api/warehouses'),
                fetch('/api/products'),
                fetch('/api/inventory/inspect'),
            ]);

            const invData = await invRes.json();
            const whData = await whRes.json();
            const prodData = await prodRes.json();
            const inspData = await inspRes.json();

            if (invData.success) {
                setStock(invData.stock || []);
                setTransactions(invData.transactions || []);
            }
            if (whData.success) {
                setWarehouses(whData.warehouses || []);
                if (whData.warehouses?.length > 0 && !movementForm.toWarehouseId) {
                    setMovementForm((prev) => ({ ...prev, toWarehouseId: whData.warehouses[0].id }));
                }
            }
            if (prodData.success) {
                setProducts(prodData.products || []);
                if (prodData.products?.length > 0 && !movementForm.productId) {
                    setMovementForm((prev) => ({ ...prev, productId: prodData.products[0].id }));
                    setInspectForm((prev) => ({ ...prev, productId: prodData.products[0].id }));
                }
            }
            if (inspData.success) {
                setInspections(inspData.inspections || []);
                setInspectionSummary(inspData.summary || { totalInspected: 0, totalRejected: 0, overallRejectionPercent: '0.00%' });
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [lowStockFilter]);

    // Handle Stock Movement Submit
    const handleMovementSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            const res = await fetch('/api/inventory', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(movementForm),
            });
            const data = await res.json();
            if (data.success) {
                showToast('Stock movement recorded successfully!');
                setIsMovementModalOpen(false);
                fetchData();
            } else {
                showToast(data.error || 'Failed to record movement', 'error');
            }
        } catch {
            showToast('Network error recording movement', 'error');
        } finally {
            setSubmitting(false);
        }
    };

    // Handle Quality Inspection Submit
    const handleInspectSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            const res = await fetch('/api/inventory/inspect', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(inspectForm),
            });
            const data = await res.json();
            if (data.success) {
                showToast(`QA Inspection logged! Batch rejection rate: ${data.rejectionPercentage}`);
                setIsInspectModalOpen(false);
                fetchData();
            } else {
                showToast(data.error || 'Failed to record inspection', 'error');
            }
        } catch {
            showToast('Network error recording quality inspection', 'error');
        } finally {
            setSubmitting(false);
        }
    };

    const lowStockCount = stock.filter((s) => s.isLowStock).length;

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
                        <span>🏢</span>
                        <span>Inventory, Warehouse Stock & Quality QA</span>
                    </h1>
                    <p className="text-slate-500 text-xs mt-1">
                        Multi-warehouse finished goods inventory, raw materials binning, batch QA inspection, and rejection rates
                    </p>
                </div>

                {/* Sub-Tabs & Actions */}
                <div className="flex flex-wrap items-center gap-3 self-start md:self-auto">
                    <div className="flex bg-slate-100 p-1 rounded-xl text-xs font-medium border border-slate-200">
                        <button
                            onClick={() => setActiveTab('stock')}
                            className={`px-3 py-1.5 rounded-lg transition-all ${
                                activeTab === 'stock'
                                    ? 'bg-white text-blue-700 shadow-sm font-semibold'
                                    : 'text-slate-600 hover:text-slate-900'
                            }`}
                        >
                            📦 Stock Balances ({stock.length})
                        </button>
                        <button
                            onClick={() => setActiveTab('quality')}
                            className={`px-3 py-1.5 rounded-lg transition-all ${
                                activeTab === 'quality'
                                    ? 'bg-white text-blue-700 shadow-sm font-semibold'
                                    : 'text-slate-600 hover:text-slate-900'
                            }`}
                        >
                            🔍 Quality Inspection ({inspections.length})
                        </button>
                        <button
                            onClick={() => setActiveTab('transactions')}
                            className={`px-3 py-1.5 rounded-lg transition-all ${
                                activeTab === 'transactions'
                                    ? 'bg-white text-blue-700 shadow-sm font-semibold'
                                    : 'text-slate-600 hover:text-slate-900'
                            }`}
                        >
                            📜 Audit Movements ({transactions.length})
                        </button>
                    </div>

                    <button
                        onClick={() => setIsInspectModalOpen(true)}
                        className="px-3.5 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold shadow-sm flex items-center gap-1.5 transition-colors"
                    >
                        <span>🔍</span>
                        <span>Record QA Inspection</span>
                    </button>
                    <button
                        onClick={() => setIsMovementModalOpen(true)}
                        className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-sm flex items-center gap-1.5 transition-colors"
                    >
                        <span>+</span>
                        <span>Stock Movement</span>
                    </button>
                </div>
            </div>

            {/* TAB 1: STOCK BALANCES */}
            {activeTab === 'stock' && (
                <div className="space-y-6">
                    {/* KPI Cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                        <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-sm">
                            <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Active Warehouses</span>
                            <div className="text-2xl font-bold text-slate-900 mt-1">{warehouses.length}</div>
                            <span className="text-[11px] text-slate-500">Hosur Central & Machine Shop</span>
                        </div>
                        <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-sm">
                            <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Stock Locations</span>
                            <div className="text-2xl font-bold text-blue-700 mt-1">{stock.length}</div>
                            <span className="text-[11px] text-slate-500">Tracked batch bins</span>
                        </div>
                        <div className={`p-5 rounded-2xl border shadow-sm ${lowStockCount > 0 ? 'bg-rose-50/70 border-rose-200' : 'bg-emerald-50/70 border-emerald-200'}`}>
                            <span className={`text-xs font-semibold uppercase tracking-wider ${lowStockCount > 0 ? 'text-rose-700' : 'text-emerald-700'}`}>
                                Low Stock Alerts
                            </span>
                            <div className={`text-2xl font-bold mt-1 ${lowStockCount > 0 ? 'text-rose-800' : 'text-emerald-800'}`}>
                                {lowStockCount} Items
                            </div>
                            <span className="text-[11px] text-slate-500">Below minimum buffer point</span>
                        </div>
                        <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-sm">
                            <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Overall Scrap / Rejection</span>
                            <div className="text-2xl font-bold text-amber-700 mt-1">{inspectionSummary.overallRejectionPercent}</div>
                            <span className="text-[11px] text-slate-500">QA rejection rate</span>
                        </div>
                    </div>

                    {/* Stock Table */}
                    <div className="bg-white border border-slate-200/90 rounded-2xl overflow-hidden shadow-sm">
                        <div className="px-5 py-3.5 border-b border-slate-100 flex items-center justify-between">
                            <h3 className="text-sm font-bold text-slate-900">Live Warehouse Inventory Balances</h3>
                            <button
                                onClick={() => setLowStockFilter(!lowStockFilter)}
                                className={`text-xs px-3 py-1 rounded-xl border font-semibold transition-colors ${
                                    lowStockFilter
                                        ? 'bg-rose-50 text-rose-700 border-rose-200'
                                        : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                                }`}
                            >
                                {lowStockFilter ? 'Showing Low Stock Only' : 'Filter Low Stock'}
                            </button>
                        </div>

                        {loading ? (
                            <div className="py-16 text-center text-xs text-slate-400">Loading inventory balances...</div>
                        ) : stock.length === 0 ? (
                            <div className="py-16 text-center text-xs text-slate-400">
                                No stock records found. Use "Stock Movement" to record a purchase inward.
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-xs">
                                    <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase font-semibold text-[11px]">
                                        <tr>
                                            <th className="py-3 px-4">Part Number</th>
                                            <th className="py-3 px-4">Component Name</th>
                                            <th className="py-3 px-4">Warehouse</th>
                                            <th className="py-3 px-4">Batch Number</th>
                                            <th className="py-3 px-4">Bin Location</th>
                                            <th className="py-3 px-4">Current Qty</th>
                                            <th className="py-3 px-4">Reorder Point</th>
                                            <th className="py-3 px-4">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {stock.map((item) => (
                                            <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                                                <td className="py-3 px-4 font-mono font-bold text-blue-700">
                                                    {item.product?.partNumber || '—'}
                                                </td>
                                                <td className="py-3 px-4 font-semibold text-slate-900">
                                                    {item.product?.name || '—'}
                                                </td>
                                                <td className="py-3 px-4 text-slate-700 font-medium">
                                                    {item.warehouse?.name || 'Hosur Central'}
                                                </td>
                                                <td className="py-3 px-4 font-mono text-slate-600">
                                                    {item.batchNumber || '—'}
                                                </td>
                                                <td className="py-3 px-4 font-mono text-slate-600">
                                                    {item.binLocation || '—'}
                                                </td>
                                                <td className="py-3 px-4 font-mono font-bold text-slate-900">
                                                    {item.quantity} {item.product?.uom || 'PCS'}
                                                </td>
                                                <td className="py-3 px-4 font-mono text-slate-500">
                                                    {item.product?.reorderPoint || '0'} {item.product?.uom || 'PCS'}
                                                </td>
                                                <td className="py-3 px-4">
                                                    {item.isLowStock ? (
                                                        <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-rose-50 text-rose-700 border border-rose-200">
                                                            LOW STOCK
                                                        </span>
                                                    ) : (
                                                        <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                                            HEALTHY
                                                        </span>
                                                    )}
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

            {/* TAB 2: QUALITY INWARD INSPECTION & REJECTION PERCENTAGE */}
            {activeTab === 'quality' && (
                <div className="space-y-6">
                    {/* QA Metrics */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-sm">
                            <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Total Inspected Batches</span>
                            <div className="text-2xl font-bold text-slate-900 mt-1">{inspections.length}</div>
                            <span className="text-[11px] text-slate-500">Quality inspection logs</span>
                        </div>
                        <div className="p-5 rounded-2xl bg-emerald-50/70 border border-emerald-200 shadow-sm">
                            <span className="text-emerald-700 text-xs font-semibold uppercase tracking-wider">Passed Components</span>
                            <div className="text-2xl font-bold text-emerald-800 mt-1 font-mono">
                                {inspections.reduce((sum, i) => sum + parseFloat(i.passedQuantity), 0)} pcs
                            </div>
                            <span className="text-[11px] text-emerald-600">Cleared for assembly / dispatch</span>
                        </div>
                        <div className="p-5 rounded-2xl bg-rose-50/70 border border-rose-200 shadow-sm">
                            <span className="text-rose-700 text-xs font-semibold uppercase tracking-wider">Total Rejections</span>
                            <div className="text-2xl font-bold text-rose-800 mt-1 font-mono">
                                {inspectionSummary.totalRejected} pcs ({inspectionSummary.overallRejectionPercent})
                            </div>
                            <span className="text-[11px] text-rose-600">Scrap or vendor returns</span>
                        </div>
                    </div>

                    {/* Inspections Table */}
                    <div className="bg-white border border-slate-200/90 rounded-2xl overflow-hidden shadow-sm">
                        <div className="px-5 py-3.5 border-b border-slate-100 flex items-center justify-between">
                            <h3 className="text-sm font-bold text-slate-900">Quality Inspection Logs</h3>
                            <button
                                onClick={() => setIsInspectModalOpen(true)}
                                className="px-3 py-1 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold"
                            >
                                + Record Inspection
                            </button>
                        </div>

                        {inspections.length === 0 ? (
                            <div className="py-16 text-center text-xs text-slate-400">
                                No quality inspection logs found. Click "+ Record Inspection" to log QA checks.
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-xs">
                                    <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase font-semibold text-[11px]">
                                        <tr>
                                            <th className="py-3 px-4">Component</th>
                                            <th className="py-3 px-4">Batch Number</th>
                                            <th className="py-3 px-4">Inspected</th>
                                            <th className="py-3 px-4">Passed</th>
                                            <th className="py-3 px-4">Rejected</th>
                                            <th className="py-3 px-4">Rejection %</th>
                                            <th className="py-3 px-4">Defect Reason</th>
                                            <th className="py-3 px-4">Inspector</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {inspections.map((insp) => (
                                            <tr key={insp.id} className="hover:bg-slate-50/80 transition-colors">
                                                <td className="py-3 px-4 font-semibold text-slate-900">
                                                    <div>{insp.product?.name || 'Machined Component'}</div>
                                                    <span className="text-[10px] font-mono text-blue-700">
                                                        {insp.product?.partNumber}
                                                    </span>
                                                </td>
                                                <td className="py-3 px-4 font-mono text-slate-600">
                                                    {insp.batchNumber || '—'}
                                                </td>
                                                <td className="py-3 px-4 font-mono">{insp.inspectedQuantity}</td>
                                                <td className="py-3 px-4 font-mono text-emerald-700 font-bold">
                                                    {insp.passedQuantity}
                                                </td>
                                                <td className="py-3 px-4 font-mono text-rose-700 font-bold">
                                                    {insp.rejectedQuantity}
                                                </td>
                                                <td className="py-3 px-4">
                                                    <span
                                                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                                            parseFloat(insp.rejectionPercentage) > 5
                                                                ? 'bg-rose-50 text-rose-700 border border-rose-200'
                                                                : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                                        }`}
                                                    >
                                                        {insp.rejectionPercentage}%
                                                    </span>
                                                </td>
                                                <td className="py-3 px-4 text-slate-600 text-[11px] max-w-xs">
                                                    {insp.rejectionReason || 'Within drawing tolerances'}
                                                </td>
                                                <td className="py-3 px-4 text-slate-500 text-[11px]">
                                                    {insp.inspectedBy?.fullName || 'QA Engineer'}
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

            {/* TAB 3: STOCK AUDIT MOVEMENTS */}
            {activeTab === 'transactions' && (
                <div className="bg-white border border-slate-200/90 rounded-2xl overflow-hidden shadow-sm">
                    <div className="px-5 py-3.5 border-b border-slate-100">
                        <h3 className="text-sm font-bold text-slate-900">Historical Inventory Transactions</h3>
                    </div>

                    {transactions.length === 0 ? (
                        <div className="py-16 text-center text-xs text-slate-400">
                            No inventory transactions recorded.
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-xs">
                                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase font-semibold text-[11px]">
                                    <tr>
                                        <th className="py-3 px-4">Type</th>
                                        <th className="py-3 px-4">Component</th>
                                        <th className="py-3 px-4">Quantity</th>
                                        <th className="py-3 px-4">Unit Cost</th>
                                        <th className="py-3 px-4">Movement Route</th>
                                        <th className="py-3 px-4">Timestamp</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {transactions.map((tx) => (
                                        <tr key={tx.id} className="hover:bg-slate-50/80 transition-colors">
                                            <td className="py-3 px-4">
                                                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase bg-slate-100 text-slate-700">
                                                    {tx.transactionType.replace('_', ' ')}
                                                </span>
                                            </td>
                                            <td className="py-3 px-4 font-semibold text-slate-900">
                                                <div>{tx.product.name}</div>
                                                <span className="text-[10px] font-mono text-blue-700">
                                                    {tx.product.partNumber}
                                                </span>
                                            </td>
                                            <td className="py-3 px-4 font-mono font-bold text-slate-900">
                                                {tx.quantity}
                                            </td>
                                            <td className="py-3 px-4 font-mono text-slate-600">
                                                ₹{tx.unitCost}
                                            </td>
                                            <td className="py-3 px-4 text-slate-600">
                                                {tx.toWarehouse?.name || 'Hosur Central'}
                                            </td>
                                            <td className="py-3 px-4 font-mono text-slate-400">
                                                {new Date(tx.createdAt).toLocaleDateString('en-IN')}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            )}

            {/* MODAL: Record Quality Inspection */}
            {isInspectModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200">
                        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                                <span>🔍</span>
                                <span>Record QA Inward & Batch Inspection</span>
                            </h3>
                            <button
                                onClick={() => setIsInspectModalOpen(false)}
                                className="text-slate-400 hover:text-slate-600 text-lg leading-none"
                            >
                                ×
                            </button>
                        </div>

                        <form onSubmit={handleInspectSubmit} className="mt-4 space-y-3 text-xs">
                            <div>
                                <label className="block text-slate-700 font-semibold mb-1">Component to Inspect *</label>
                                <select
                                    required
                                    value={inspectForm.productId}
                                    onChange={(e) => setInspectForm({ ...inspectForm, productId: e.target.value })}
                                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 focus:outline-none focus:border-blue-600"
                                >
                                    {products.map((p) => (
                                        <option key={p.id} value={p.id}>
                                            {p.partNumber} - {p.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-slate-700 font-semibold mb-1">Production Batch / Heat Lot # *</label>
                                <input
                                    type="text"
                                    required
                                    value={inspectForm.batchNumber}
                                    onChange={(e) => setInspectForm({ ...inspectForm, batchNumber: e.target.value })}
                                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 font-mono focus:outline-none focus:border-blue-600"
                                />
                            </div>

                            <div className="grid grid-cols-3 gap-3">
                                <div>
                                    <label className="block text-slate-700 font-semibold mb-1">Inspected Qty *</label>
                                    <input
                                        type="number"
                                        required
                                        min="1"
                                        value={inspectForm.inspectedQuantity}
                                        onChange={(e) => {
                                            const total = Number(e.target.value);
                                            const rej = Number(inspectForm.rejectedQuantity);
                                            setInspectForm({
                                                ...inspectForm,
                                                inspectedQuantity: total,
                                                passedQuantity: Math.max(0, total - rej),
                                            });
                                        }}
                                        className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 font-mono focus:outline-none focus:border-blue-600"
                                    />
                                </div>
                                <div>
                                    <label className="block text-slate-700 font-semibold mb-1">Passed Qty *</label>
                                    <input
                                        type="number"
                                        required
                                        min="0"
                                        value={inspectForm.passedQuantity}
                                        onChange={(e) => {
                                            const passed = Number(e.target.value);
                                            const total = Number(inspectForm.inspectedQuantity);
                                            setInspectForm({
                                                ...inspectForm,
                                                passedQuantity: passed,
                                                rejectedQuantity: Math.max(0, total - passed),
                                            });
                                        }}
                                        className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 font-mono text-emerald-700 font-bold focus:outline-none focus:border-blue-600"
                                    />
                                </div>
                                <div>
                                    <label className="block text-slate-700 font-semibold mb-1">Rejected Qty *</label>
                                    <input
                                        type="number"
                                        required
                                        min="0"
                                        value={inspectForm.rejectedQuantity}
                                        onChange={(e) => {
                                            const rej = Number(e.target.value);
                                            const total = Number(inspectForm.inspectedQuantity);
                                            setInspectForm({
                                                ...inspectForm,
                                                rejectedQuantity: rej,
                                                passedQuantity: Math.max(0, total - rej),
                                            });
                                        }}
                                        className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 font-mono text-rose-700 font-bold focus:outline-none focus:border-blue-600"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-slate-700 font-semibold mb-1">Defect Analysis & Rejection Reason</label>
                                <textarea
                                    rows={2}
                                    value={inspectForm.rejectionReason}
                                    onChange={(e) => setInspectForm({ ...inspectForm, rejectionReason: e.target.value })}
                                    placeholder="e.g. Surface roughness Ra exceeded 0.8um, bore ovality, burr on internal threads..."
                                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 focus:outline-none focus:border-blue-600"
                                />
                            </div>

                            <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-[11px] text-amber-800">
                                📊 Computed Rejection Rate: <b>{inspectForm.inspectedQuantity > 0 ? ((inspectForm.rejectedQuantity / inspectForm.inspectedQuantity) * 100).toFixed(2) : '0.00'}%</b>
                            </div>

                            <div className="pt-4 flex justify-end gap-2 border-t border-slate-100">
                                <button
                                    type="button"
                                    onClick={() => setIsInspectModalOpen(false)}
                                    className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-semibold shadow-sm"
                                >
                                    Record Quality Inspection
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* MODAL: Record Stock Movement */}
            {isMovementModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200">
                        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                                <span>📦</span>
                                <span>Record Stock Movement</span>
                            </h3>
                            <button
                                onClick={() => setIsMovementModalOpen(false)}
                                className="text-slate-400 hover:text-slate-600 text-lg leading-none"
                            >
                                ×
                            </button>
                        </div>

                        <form onSubmit={handleMovementSubmit} className="mt-4 space-y-3 text-xs">
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-slate-700 font-semibold mb-1">Transaction Type *</label>
                                    <select
                                        value={movementForm.transactionType}
                                        onChange={(e) => setMovementForm({ ...movementForm, transactionType: e.target.value })}
                                        className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 focus:outline-none focus:border-blue-600"
                                    >
                                        <option value="purchase_inward">Purchase Inward</option>
                                        <option value="production_issue">Production Issue</option>
                                        <option value="production_return">Production Return</option>
                                        <option value="sales_dispatch">Sales Dispatch</option>
                                        <option value="adjustment">Stock Adjustment</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-slate-700 font-semibold mb-1">Warehouse *</label>
                                    <select
                                        value={movementForm.toWarehouseId}
                                        onChange={(e) => setMovementForm({ ...movementForm, toWarehouseId: e.target.value })}
                                        className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 focus:outline-none focus:border-blue-600"
                                    >
                                        {warehouses.map((w) => (
                                            <option key={w.id} value={w.id}>
                                                {w.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-slate-700 font-semibold mb-1">Component / Part *</label>
                                <select
                                    value={movementForm.productId}
                                    onChange={(e) => setMovementForm({ ...movementForm, productId: e.target.value })}
                                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 focus:outline-none focus:border-blue-600"
                                >
                                    {products.map((p) => (
                                        <option key={p.id} value={p.id}>
                                            {p.partNumber} - {p.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-slate-700 font-semibold mb-1">Quantity *</label>
                                    <input
                                        type="number"
                                        required
                                        min="1"
                                        value={movementForm.quantity}
                                        onChange={(e) => setMovementForm({ ...movementForm, quantity: e.target.value })}
                                        className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 font-mono focus:outline-none focus:border-blue-600"
                                    />
                                </div>
                                <div>
                                    <label className="block text-slate-700 font-semibold mb-1">Unit Cost (₹)</label>
                                    <input
                                        type="number"
                                        value={movementForm.unitCost}
                                        onChange={(e) => setMovementForm({ ...movementForm, unitCost: e.target.value })}
                                        className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 font-mono focus:outline-none focus:border-blue-600"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-slate-700 font-semibold mb-1">Batch / Lot #</label>
                                    <input
                                        type="text"
                                        value={movementForm.batchNumber}
                                        onChange={(e) => setMovementForm({ ...movementForm, batchNumber: e.target.value })}
                                        className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 font-mono focus:outline-none focus:border-blue-600"
                                    />
                                </div>
                                <div>
                                    <label className="block text-slate-700 font-semibold mb-1">Bin Location</label>
                                    <input
                                        type="text"
                                        value={movementForm.binLocation}
                                        onChange={(e) => setMovementForm({ ...movementForm, binLocation: e.target.value })}
                                        className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 font-mono focus:outline-none focus:border-blue-600"
                                    />
                                </div>
                            </div>

                            <div className="pt-4 flex justify-end gap-2 border-t border-slate-100">
                                <button
                                    type="button"
                                    onClick={() => setIsMovementModalOpen(false)}
                                    className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-sm"
                                >
                                    Post Transaction
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
