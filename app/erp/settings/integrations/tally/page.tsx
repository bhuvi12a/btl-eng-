'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface TallyIntegrationState {
    status: 'connected' | 'disconnected' | 'error';
    integration: {
        id: string;
        companyName: string;
        tallyCompanyId: string;
        connectedAt: string;
        lastConnectedAt: string;
        lastSyncedAt: string | null;
        connectedBy: string;
    } | null;
    connector: {
        connectorId: string;
        deviceName: string;
        deviceStatus: 'online' | 'offline';
        tallyHost: string;
        tallyPort: number;
        tallyVersion: string;
        lastSeenAt: string;
    } | null;
    lastSync: {
        module: string;
        syncDirection: string;
        status: string;
        successfulRecords: number;
        failedRecords: number;
        createdAt: string;
    } | null;
}

interface TallyCompany {
    id: string;
    name: string;
    isCurrent: boolean;
}

interface SyncHistoryItem {
    id: string;
    module: string;
    syncDirection: string;
    totalRecords: number;
    successfulRecords: number;
    failedRecords: number;
    syncStatus: string;
    errorDetails: any;
    initiatedBy: string;
    createdAt: string;
}

interface QueuedItem {
    id: string;
    module: string;
    status: string;
    retryCount: number;
    errorMessage: string | null;
    createdAt: string;
    payload: any;
}

interface SyncPreviewData {
    module: string;
    syncDirection: string;
    totalRecords: number;
    mappedRecords: number;
    pendingSync: number;
    sampleRecords: any[];
}

const syncModulesList = [
    { key: 'customers', label: 'Customers (Sundry Debtors)', icon: '👥', desc: 'Sync client ledger accounts, GSTIN, and credit limits to Tally.' },
    { key: 'suppliers', label: 'Suppliers (Sundry Creditors)', icon: '🏭', desc: 'Sync raw material vendors, tooling suppliers and bank details.' },
    { key: 'products', label: 'Products & Finished Goods', icon: '📦', desc: 'Export finished machined parts, part numbers and HSN 8483 codes.' },
    { key: 'stock_items', label: 'Raw Material Stock Items', icon: '🔩', desc: 'Sync Steel, Aluminium & SS bars, units of measure and pricing.' },
    { key: 'sales_invoices', label: 'Sales Invoices', icon: '🧾', desc: 'Export finalized dispatch invoices, tax breakdowns and debit notes.' },
    { key: 'purchase_invoices', label: 'Purchase Invoices', icon: '📑', desc: 'Import or export vendor purchase bills and input tax credits.' },
    { key: 'payment_vouchers', label: 'Payment Vouchers', icon: '💸', desc: 'Track vendor outward payments and bank debit transactions.' },
    { key: 'receipt_vouchers', label: 'Receipt Vouchers', icon: '💰', desc: 'Sync customer inward collections and payment confirmations.' },
    { key: 'expense_vouchers', label: 'Expense Vouchers', icon: '📊', desc: 'Sync plant maintenance, consumable tooling and electricity bills.' },
];

export default function TallyIntegrationPage() {
    const [state, setState] = useState<TallyIntegrationState | null>(null);
    const [history, setHistory] = useState<SyncHistoryItem[]>([]);
    const [queue, setQueue] = useState<QueuedItem[]>([]);
    const [queueStats, setQueueStats] = useState({ totalInQueue: 0, pendingCount: 0, failedCount: 0 });
    const [loading, setLoading] = useState<boolean>(true);

    // Connect Workflow States
    const [connectModalOpen, setConnectModalOpen] = useState(false);
    const [connectStep, setConnectStep] = useState<1 | 2 | 3>(1);
    const [discovering, setDiscovering] = useState(false);
    const [availableCompanies, setAvailableCompanies] = useState<TallyCompany[]>([]);
    const [selectedCompanyId, setSelectedCompanyId] = useState('');
    const [connecting, setConnecting] = useState(false);
    const [connectorMessage, setConnectorMessage] = useState<string | null>(null);

    // Sync Workflow States
    const [syncModalOpen, setSyncModalOpen] = useState(false);
    const [activeModule, setActiveModule] = useState<string>('');
    const [syncDirection, setSyncDirection] = useState<'export_to_tally' | 'import_from_tally'>('export_to_tally');
    const [previewLoading, setPreviewLoading] = useState(false);
    const [previewData, setPreviewData] = useState<SyncPreviewData | null>(null);
    const [syncExecuting, setSyncExecuting] = useState(false);
    const [syncFeedback, setSyncFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

    const isConnected = state?.status === 'connected';

    const fetchStatusAndHistory = async () => {
        setLoading(true);
        try {
            const [statusRes, histRes, queueRes] = await Promise.all([
                fetch('/api/integrations/tally/status'),
                fetch('/api/integrations/tally/sync-history'),
                fetch('/api/integrations/tally/queue'),
            ]);

            const statusData = await statusRes.json();
            const histData = await histRes.json();
            const queueData = await queueRes.json();

            if (statusData.success) {
                setState(statusData);
            }
            if (histData.success) {
                setHistory(histData.history || []);
            }
            if (queueData.success) {
                setQueue(queueData.queue || []);
                if (queueData.stats) setQueueStats(queueData.stats);
            }
        } catch (err) {
            console.error('Failed to load Tally integration status:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStatusAndHistory();
    }, []);

    const handleOpenConnectModal = async () => {
        setConnectModalOpen(true);
        setConnectStep(1);
        setConnectorMessage(null);
        setDiscovering(true);

        try {
            const res = await fetch('/api/integrations/tally/companies');
            const data = await res.json();

            if (data.success && data.companies?.length > 0) {
                setAvailableCompanies(data.companies);
                const current = data.companies.find((c: TallyCompany) => c.isCurrent) || data.companies[0];
                setSelectedCompanyId(current.id);
            } else {
                setConnectorMessage(
                    data.error ||
                    'Could not detect local TallyPrime instance. Please ensure Tally is running with ODBC/HTTP Server enabled on Port 9000, and the BTL Windows Connector agent is started.'
                );
            }
        } catch {
            setConnectorMessage('Network connection to local Windows connector agent timed out.');
        } finally {
            setDiscovering(false);
        }
    };

    const handleConfirmConnect = async () => {
        setConnecting(true);
        try {
            const selected = availableCompanies.find((c) => c.id === selectedCompanyId);
            const res = await fetch('/api/integrations/tally/connect', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    companyName: selected?.name || 'BTL Precision Engineering',
                    tallyCompanyId: selected?.id || selectedCompanyId,
                    connectorId: state?.connector?.connectorId || 'local_win_01',
                }),
            });

            const data = await res.json();
            if (data.success) {
                setConnectStep(3);
                await fetchStatusAndHistory();
            } else {
                alert(data.error || 'Failed to complete connection.');
            }
        } catch (err: any) {
            alert(err.message || 'Error occurred during connection.');
        } finally {
            setConnecting(false);
        }
    };

    const handleDisconnect = async () => {
        if (!confirm('Are you sure you want to disconnect TallyPrime? The ERP will return to standalone mode.')) {
            return;
        }

        try {
            const res = await fetch('/api/integrations/tally/disconnect', { method: 'POST' });
            const data = await res.json();
            if (data.success) {
                await fetchStatusAndHistory();
            } else {
                alert(data.error || 'Failed to disconnect.');
            }
        } catch (err: any) {
            alert(err.message || 'Error disconnecting.');
        }
    };

    const handleOpenSyncModal = async (moduleKey: string) => {
        setActiveModule(moduleKey);
        setSyncModalOpen(true);
        setPreviewLoading(true);
        setSyncFeedback(null);
        setPreviewData(null);

        try {
            const res = await fetch('/api/integrations/tally/sync', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    module: moduleKey,
                    syncDirection,
                    previewOnly: true,
                }),
            });

            const data = await res.json();
            if (data.success) {
                setPreviewData(data);
            } else {
                setSyncFeedback({ type: 'error', message: data.error || 'Failed to generate sync preview.' });
            }
        } catch (err: any) {
            setSyncFeedback({ type: 'error', message: err.message || 'Network error fetching preview.' });
        } finally {
            setPreviewLoading(false);
        }
    };

    const handleExecuteSync = async () => {
        setSyncExecuting(true);
        setSyncFeedback(null);

        try {
            const res = await fetch('/api/integrations/tally/sync', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    module: activeModule,
                    syncDirection,
                    previewOnly: false,
                    idempotencyKey: `sync_${activeModule}_${Date.now()}`,
                }),
            });

            const data = await res.json();
            if (data.success) {
                setSyncFeedback({
                    type: 'success',
                    message: data.message || `Successfully synchronized ${activeModule.replace(/_/g, ' ')} with TallyPrime.`,
                });
                await fetchStatusAndHistory();
            } else {
                setSyncFeedback({
                    type: 'error',
                    message: data.error || 'Synchronization failed during Tally XML handshake.',
                });
            }
        } catch (err: any) {
            setSyncFeedback({ type: 'error', message: err.message || 'Network error executing sync.' });
        } finally {
            setSyncExecuting(false);
        }
    };

    return (
        <div className="space-y-8">
            {/* Breadcrumb & Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-slate-200">
                <div>
                    <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
                        <span>Settings</span>
                        <span>/</span>
                        <span className="text-blue-600 font-semibold">Integrations</span>
                        <span>/</span>
                        <span className="text-slate-900 font-medium">TallyPrime</span>
                    </div>
                    <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-3">
                        <span>TallyPrime Accounting Integration</span>
                        <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200 font-normal">
                            Optional Module
                        </span>
                    </h1>
                    <p className="text-slate-500 text-xs sm:text-sm mt-1">
                        Bi-directional XML integration connecting Cloud BTL ERP with local Windows TallyPrime accounting software
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        onClick={fetchStatusAndHistory}
                        className="px-3.5 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold border border-slate-200 transition-colors flex items-center gap-1.5 shadow-sm"
                    >
                        <span>🔄</span>
                        <span>Refresh</span>
                    </button>
                    {isConnected ? (
                        <button
                            onClick={handleDisconnect}
                            className="px-4 py-2 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 text-xs font-bold border border-red-200 transition-all shadow-sm"
                        >
                            Disconnect Tally
                        </button>
                    ) : (
                        <button
                            onClick={handleOpenConnectModal}
                            className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm transition-all"
                        >
                            + Connect Tally
                        </button>
                    )}
                </div>
            </div>

            {/* Connection Status Card */}
            <div className="p-6 sm:p-8 rounded-2xl bg-white border border-slate-200/90 relative overflow-hidden shadow-sm">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-slate-100">
                    <div className="flex items-start gap-4">
                        <div className="w-16 h-16 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center text-3xl font-black text-amber-600 flex-shrink-0">
                            TP
                        </div>
                        <div>
                            <div className="flex items-center gap-3 mb-1">
                                <h2 className="text-xl font-bold text-slate-900">TallyPrime Gateway Status</h2>
                                <span
                                    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${
                                        isConnected
                                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                            : state?.status === 'error'
                                            ? 'bg-amber-50 text-amber-700 border-amber-200'
                                            : 'bg-slate-100 text-slate-600 border-slate-200'
                                    }`}
                                >
                                    <span
                                        className={`h-2 w-2 rounded-full ${
                                            isConnected
                                                ? 'bg-emerald-500 animate-pulse'
                                                : state?.status === 'error'
                                                ? 'bg-amber-500'
                                                : 'bg-slate-400'
                                        }`}
                                    ></span>
                                    {isConnected ? 'CONNECTED' : state?.status === 'error' ? 'CONNECTOR OFFLINE' : 'NOT CONNECTED'}
                                </span>
                            </div>
                            <p className="text-slate-500 text-xs sm:text-sm">
                                {isConnected
                                    ? `Linked with company: ${state?.integration?.companyName}`
                                    : 'BTL ERP is operating in standalone cloud mode. Connect Tally to synchronize vouchers, masters, and ledger balances.'}
                            </p>
                        </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                        {isConnected ? (
                            <div className="text-right">
                                <span className="block text-xs text-slate-500">Connected By</span>
                                <span className="text-xs font-semibold text-slate-900">
                                    {state?.integration?.connectedBy}
                                </span>
                            </div>
                        ) : (
                            <button
                                onClick={handleOpenConnectModal}
                                className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-sm transition-all"
                            >
                                Connect TallyPrime
                            </button>
                        )}
                    </div>
                </div>

                {/* Metadata Diagnostics Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-6 text-xs">
                    <div className="p-4 rounded-xl bg-slate-50/70 border border-slate-200/80">
                        <span className="text-slate-500 block mb-1 uppercase tracking-wider text-[10px]">
                            Connected Company
                        </span>
                        <span className="font-bold text-slate-900 text-sm block truncate">
                            {state?.integration?.companyName || 'None (Disconnected)'}
                        </span>
                        <span className="text-slate-500 text-[10px] mt-1 block font-mono">
                            ID: {state?.integration?.tallyCompanyId || 'N/A'}
                        </span>
                    </div>

                    <div className="p-4 rounded-xl bg-slate-50/70 border border-slate-200/80">
                        <span className="text-slate-500 block mb-1 uppercase tracking-wider text-[10px]">
                            Windows Connector Agent
                        </span>
                        <span className="font-bold text-slate-900 text-sm block flex items-center gap-1.5">
                            <span
                                className={`h-2 w-2 rounded-full ${
                                    state?.connector?.deviceStatus === 'online' ? 'bg-emerald-500' : 'bg-slate-400'
                                }`}
                            ></span>
                            {state?.connector?.deviceStatus === 'online' ? 'Agent Online' : 'Agent Offline'}
                        </span>
                        <span className="text-slate-500 text-[10px] mt-1 block">
                            Target: {state?.connector?.tallyHost || 'localhost'}:{state?.connector?.tallyPort || 9000}
                        </span>
                    </div>

                    <div className="p-4 rounded-xl bg-slate-50/70 border border-slate-200/80">
                        <span className="text-slate-500 block mb-1 uppercase tracking-wider text-[10px]">
                            Last Connection
                        </span>
                        <span className="font-bold text-slate-700 text-sm block">
                            {state?.integration?.lastConnectedAt
                                ? new Date(state.integration.lastConnectedAt).toLocaleString('en-IN')
                                : 'Never'}
                        </span>
                        <span className="text-slate-500 text-[10px] mt-1 block">Outbound HTTPS secured</span>
                    </div>

                    <div className="p-4 rounded-xl bg-slate-50/70 border border-slate-200/80">
                        <span className="text-slate-500 block mb-1 uppercase tracking-wider text-[10px]">
                            Last Synchronization
                        </span>
                        <span className="font-bold text-emerald-600 text-sm block">
                            {state?.integration?.lastSyncedAt
                                ? new Date(state.integration.lastSyncedAt).toLocaleString('en-IN')
                                : 'No sync recorded'}
                        </span>
                        <span className="text-slate-500 text-[10px] mt-1 block">
                            {state?.lastSync ? `${state.lastSync.successfulRecords} records synced` : 'Manual control'}
                        </span>
                    </div>
                </div>
            </div>

            {/* Manual Synchronization Modules Grid */}
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-lg font-bold text-slate-900 tracking-tight">Manual Synchronization Hub</h2>
                        <p className="text-slate-500 text-xs mt-0.5">
                            Individual module sync with pre-flight preview, validation and zero-duplicate idempotency checks
                        </p>
                    </div>
                    <span className="text-xs px-3 py-1 rounded-full bg-slate-100 border border-slate-200 text-slate-600 font-mono">
                        9 Sync Modules
                    </span>
                </div>

                {!isConnected && (
                    <div className="p-4 rounded-2xl bg-blue-50 border border-blue-200 text-blue-900 text-xs flex items-center justify-between gap-4">
                        <div className="flex items-center gap-2">
                            <span>ℹ️</span>
                            <span>TallyPrime is currently disconnected. Synchronization actions are paused until a company is linked.</span>
                        </div>
                        <button
                            onClick={handleOpenConnectModal}
                            className="px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex-shrink-0"
                        >
                            Connect Tally
                        </button>
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {syncModulesList.map((m) => (
                        <div
                            key={m.key}
                            className="p-5 rounded-2xl bg-white border border-slate-200/90 hover:border-slate-300 shadow-sm transition-all flex flex-col justify-between"
                        >
                            <div>
                                <div className="flex items-center justify-between mb-3">
                                    <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center text-xl">
                                        {m.icon}
                                    </div>
                                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-50 text-slate-600 border border-slate-200">
                                        XML Master
                                    </span>
                                </div>
                                <h3 className="font-bold text-slate-900 text-sm mb-1">{m.label}</h3>
                                <p className="text-xs text-slate-500 mb-4 leading-relaxed">{m.desc}</p>
                            </div>

                            <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                                <span className="text-[11px] text-slate-500">Manual Push</span>
                                <button
                                    disabled={!isConnected}
                                    onClick={() => handleOpenSyncModal(m.key)}
                                    className="px-3 py-1.5 rounded-lg bg-slate-50 hover:bg-blue-600 hover:text-white text-slate-700 font-semibold text-xs border border-slate-200 hover:border-transparent transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                                >
                                    Sync to Tally →
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Offline Synchronization Queue */}
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
                            <span>⚡</span>
                            <span>Offline Synchronization Queue</span>
                        </h2>
                        <p className="text-slate-500 text-xs mt-0.5">
                            Transactions queued offline during network/Tally outages — auto-replayed when connector pings
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-xs px-2.5 py-1 rounded-full bg-amber-50 text-amber-800 border border-amber-200 font-semibold">
                            {queueStats.pendingCount} Pending Replay
                        </span>
                    </div>
                </div>

                <div className="bg-white rounded-2xl border border-slate-200/90 overflow-hidden shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs">
                            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase font-semibold text-[11px]">
                                <tr>
                                    <th className="px-5 py-3.5">Queued At</th>
                                    <th className="px-5 py-3.5">Module</th>
                                    <th className="px-5 py-3.5">Retry Count</th>
                                    <th className="px-5 py-3.5">Status</th>
                                    <th className="px-5 py-3.5">Error Note</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {queue.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="px-5 py-8 text-center text-slate-400">
                                            Zero pending offline queue items. All transactions synchronized with TallyPrime.
                                        </td>
                                    </tr>
                                ) : (
                                    queue.map((q) => (
                                        <tr key={q.id} className="hover:bg-slate-50/80 transition-colors">
                                            <td className="px-5 py-4 text-slate-500 font-mono">
                                                {new Date(q.createdAt).toLocaleString('en-IN')}
                                            </td>
                                            <td className="px-5 py-4 font-bold text-slate-900 capitalize">
                                                {q.module.replace(/_/g, ' ')}
                                            </td>
                                            <td className="px-5 py-4 font-mono font-semibold text-slate-700">
                                                {q.retryCount} Retries
                                            </td>
                                            <td className="px-5 py-4">
                                                <span
                                                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                                                        q.status === 'synced'
                                                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                                            : q.status === 'failed'
                                                            ? 'bg-rose-50 text-rose-700 border border-rose-200'
                                                            : 'bg-amber-50 text-amber-800 border border-amber-200'
                                                    }`}
                                                >
                                                    {q.status}
                                                </span>
                                            </td>
                                            <td className="px-5 py-4 text-slate-500 text-[11px]">
                                                {q.errorMessage || 'Queued for automatic connector push'}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Synchronization History & Audit Trail */}
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-lg font-bold text-slate-900 tracking-tight">Synchronization Audit Logs</h2>
                        <p className="text-slate-500 text-xs mt-0.5">
                            Complete log of successful records, failures, payloads, and user initiations
                        </p>
                    </div>
                </div>

                <div className="bg-white rounded-2xl border border-slate-200/90 overflow-hidden shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs">
                            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase font-semibold text-[11px]">
                                <tr>
                                    <th className="px-5 py-3.5">Timestamp</th>
                                    <th className="px-5 py-3.5">Module</th>
                                    <th className="px-5 py-3.5">Direction</th>
                                    <th className="px-5 py-3.5">Records</th>
                                    <th className="px-5 py-3.5">Status</th>
                                    <th className="px-5 py-3.5">Initiated By</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {history.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="px-5 py-8 text-center text-slate-500">
                                            No Tally synchronization records yet. Use the sync buttons above to export data.
                                        </td>
                                    </tr>
                                ) : (
                                    history.map((log) => (
                                        <tr key={log.id} className="hover:bg-slate-50/80 transition-colors">
                                            <td className="px-5 py-4 text-slate-500">
                                                {new Date(log.createdAt).toLocaleString('en-IN')}
                                            </td>
                                            <td className="px-5 py-4 font-bold text-slate-900 capitalize">
                                                {log.module.replace(/_/g, ' ')}
                                            </td>
                                            <td className="px-5 py-4">
                                                <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-50 text-blue-600 border border-slate-200">
                                                    {log.syncDirection === 'export_to_tally' ? 'ERP → Tally' : 'Tally → ERP'}
                                                </span>
                                            </td>
                                            <td className="px-5 py-4">
                                                <span className="font-semibold text-emerald-600">
                                                    {log.successfulRecords} success
                                                </span>
                                                {log.failedRecords > 0 && (
                                                    <span className="ml-2 font-semibold text-red-600">
                                                        ({log.failedRecords} failed)
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-5 py-4">
                                                <span
                                                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                                                        log.syncStatus === 'completed'
                                                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                                            : 'bg-red-50 text-red-700 border border-red-200'
                                                    }`}
                                                >
                                                    {log.syncStatus}
                                                </span>
                                            </td>
                                            <td className="px-5 py-4 text-slate-600">{log.initiatedBy}</td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Modal: Connect Tally Workflow */}
            {connectModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
                    <div className="w-full max-w-lg bg-white border border-slate-200 rounded-2xl shadow-2xl overflow-hidden p-6 relative">
                        <button
                            onClick={() => setConnectModalOpen(false)}
                            className="absolute right-4 top-4 text-slate-400 hover:text-slate-700 p-1 text-lg"
                        >
                            ✕
                        </button>

                        <div className="flex items-center gap-3 mb-5">
                            <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-lg font-black text-amber-600">
                                TP
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-slate-900">Connect TallyPrime Company</h3>
                                <p className="text-xs text-slate-500">Step {connectStep} of 2 • Secure XML Gateway</p>
                            </div>
                        </div>

                        {discovering ? (
                            <div className="py-12 text-center space-y-3">
                                <div className="inline-block animate-spin text-3xl">🔄</div>
                                <span className="block font-bold text-slate-900 text-sm">Discovering Local TallyPrime Instance...</span>
                                <span className="block text-xs text-slate-500">
                                    Checking Windows Connector on localhost:9000
                                </span>
                            </div>
                        ) : connectorMessage ? (
                            <div className="space-y-4">
                                <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs leading-relaxed">
                                    <span className="font-bold block mb-1">Local Tally Connector Notice</span>
                                    {connectorMessage}
                                </div>

                                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 space-y-2">
                                    <span className="font-semibold block text-slate-900">How to connect:</span>
                                    <p>1. Open TallyPrime on this Windows computer.</p>
                                    <p>2. Ensure Tally XML Server is enabled on Port 9000 (F12 → Configuration → Advanced Configuration → Enable ODBC/HTTP Server: Yes, Port: 9000).</p>
                                    <p>3. Run the lightweight BTL Windows connector script in <code className="text-blue-600">tally-connector/run-connector.ps1</code>.</p>
                                </div>

                                <div className="flex justify-end gap-2 pt-2">
                                    <button
                                        onClick={handleOpenConnectModal}
                                        className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold"
                                    >
                                        Retry Discovery 🔄
                                    </button>
                                </div>
                            </div>
                        ) : connectStep === 1 ? (
                            <div className="space-y-4">
                                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
                                    <span>✓</span>
                                    <span>Local TallyPrime detected online on Port 9000</span>
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                                        Select Open Tally Company
                                    </label>
                                    <select
                                        value={selectedCompanyId}
                                        onChange={(e) => setSelectedCompanyId(e.target.value)}
                                        className="w-full px-4 py-3 rounded-xl bg-white border border-slate-300 text-slate-900 text-xs focus:outline-none focus:border-blue-600"
                                    >
                                        {availableCompanies.map((c) => (
                                            <option key={c.id} value={c.id}>
                                                {c.name} {c.isCurrent ? '(Active in Tally)' : ''}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="pt-4 flex justify-end gap-3 border-t border-slate-100">
                                    <button
                                        onClick={() => setConnectModalOpen(false)}
                                        className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 text-xs"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={() => setConnectStep(2)}
                                        className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold"
                                    >
                                        Continue →
                                    </button>
                                </div>
                            </div>
                        ) : connectStep === 2 ? (
                            <div className="space-y-4">
                                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 space-y-2">
                                    <span className="font-bold text-slate-900 block">Confirm Connection Details:</span>
                                    <p>Company: <strong className="text-blue-600">{availableCompanies.find((c) => c.id === selectedCompanyId)?.name}</strong></p>
                                    <p>Gateway: <span className="font-mono text-slate-600">Localhost:9000 via BTL Windows Agent</span></p>
                                    <p>Security: <span className="text-emerald-700 font-semibold">Outbound HTTPS with SHA-256 Auth</span></p>
                                </div>

                                <p className="text-xs text-slate-500">
                                    Clicking &quot;Authorize &amp; Connect&quot; will link this company with your BTL ERP ledger mapping. You can disconnect at any time.
                                </p>

                                <div className="pt-4 flex justify-end gap-3 border-t border-slate-100">
                                    <button
                                        onClick={() => setConnectStep(1)}
                                        className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 text-xs"
                                    >
                                        ← Back
                                    </button>
                                    <button
                                        disabled={connecting}
                                        onClick={handleConfirmConnect}
                                        className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold disabled:opacity-50"
                                    >
                                        {connecting ? 'Linking Company...' : 'Authorize & Connect ✓'}
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="py-6 text-center space-y-4">
                                <div className="text-4xl text-emerald-600">✓</div>
                                <h4 className="text-lg font-bold text-slate-900">TallyPrime Connected!</h4>
                                <p className="text-xs text-slate-600">
                                    You can now synchronize customers, suppliers, stock items, and vouchers whenever required.
                                </p>
                                <button
                                    onClick={() => setConnectModalOpen(false)}
                                    className="px-5 py-2 rounded-xl bg-blue-600 text-white text-xs font-bold"
                                >
                                    Done
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Modal: Sync Preview & Confirmation */}
            {syncModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
                    <div className="w-full max-w-xl bg-white border border-slate-200 rounded-2xl shadow-2xl overflow-hidden p-6 relative">
                        <button
                            onClick={() => setSyncModalOpen(false)}
                            className="absolute right-4 top-4 text-slate-400 hover:text-slate-700 p-1 text-lg"
                        >
                            ✕
                        </button>

                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 border border-blue-200 flex items-center justify-center text-lg">
                                📤
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-slate-900 capitalize">
                                    Synchronize {activeModule.replace(/_/g, ' ')}
                                </h3>
                                <p className="text-xs text-slate-500">Pre-flight verification &amp; Tally XML preview</p>
                            </div>
                        </div>

                        {syncFeedback && (
                            <div
                                className={`mb-4 p-4 rounded-xl text-xs border ${
                                    syncFeedback.type === 'success'
                                        ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                                        : 'bg-red-50 border-red-200 text-red-800'
                                }`}
                            >
                                <span className="font-bold block mb-1">
                                    {syncFeedback.type === 'success' ? '✓ Synchronization Success' : '⚠️ Sync Notice'}
                                </span>
                                {syncFeedback.message}
                            </div>
                        )}

                        {previewLoading ? (
                            <div className="py-12 text-center space-y-2">
                                <div className="inline-block animate-spin text-2xl">🔄</div>
                                <span className="block text-xs text-slate-500">Querying ERP records &amp; mapping state...</span>
                            </div>
                        ) : previewData ? (
                            <div className="space-y-4">
                                <div className="grid grid-cols-3 gap-3 text-center">
                                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                                        <span className="text-[11px] text-slate-500 block">Total Records</span>
                                        <span className="text-base font-bold text-slate-900">{previewData.totalRecords}</span>
                                    </div>
                                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                                        <span className="text-[11px] text-slate-500 block">Already Mapped</span>
                                        <span className="text-base font-bold text-blue-600">{previewData.mappedRecords}</span>
                                    </div>
                                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                                        <span className="text-[11px] text-slate-500 block">Pending Push</span>
                                        <span className="text-base font-bold text-emerald-600">{previewData.pendingSync}</span>
                                    </div>
                                </div>

                                <div>
                                    <span className="text-xs font-semibold text-slate-700 uppercase tracking-wider block mb-2">
                                        Sample Records to Export:
                                    </span>
                                    <div className="max-h-40 overflow-y-auto space-y-1.5 p-2 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                                        {previewData.sampleRecords.map((item, idx) => (
                                            <div key={idx} className="p-2 rounded bg-white border border-slate-200 flex items-center justify-between">
                                                <span className="font-medium text-slate-900">{item.name || item.partNumber || item.party}</span>
                                                <span className="text-slate-500 font-mono text-[10px]">
                                                    {item.gstin || item.city || item.amount || 'Ready'}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="pt-4 flex items-center justify-between border-t border-slate-100">
                                    <span className="text-[11px] text-slate-500">
                                        Direction: <strong className="text-slate-700">BTL ERP → TallyPrime</strong>
                                    </span>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => setSyncModalOpen(false)}
                                            className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 text-xs"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            disabled={syncExecuting}
                                            onClick={handleExecuteSync}
                                            className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold disabled:opacity-50 flex items-center gap-2"
                                        >
                                            {syncExecuting ? 'Exporting to Tally...' : 'Confirm Synchronization 🚀'}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ) : null}
                    </div>
                </div>
            )}
        </div>
    );
}
