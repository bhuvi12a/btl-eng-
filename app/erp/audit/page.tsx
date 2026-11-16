'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface AuditLogItem {
    id: string;
    action: string;
    entity: string;
    entityId: string | null;
    userEmail: string | null;
    oldValue: any;
    newValue: any;
    ipAddress: string | null;
    userAgent: string | null;
    createdAt: string;
}

export default function ErpAuditLogsPage() {
    const [logs, setLogs] = useState<AuditLogItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [actionFilter, setActionFilter] = useState('all');
    const [entityFilter, setEntityFilter] = useState('all');
    const [selectedLog, setSelectedLog] = useState<AuditLogItem | null>(null);

    const fetchLogs = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (actionFilter !== 'all') params.set('action', actionFilter);
            if (entityFilter !== 'all') params.set('entity', entityFilter);
            params.set('limit', '100');

            const res = await fetch(`/api/audit-logs?${params.toString()}`);
            const data = await res.json();
            if (data.success && Array.isArray(data.logs)) {
                setLogs(data.logs);
            }
        } catch (err) {
            console.error('Failed to load audit logs:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLogs();
    }, [actionFilter, entityFilter]);

    // Unique action and entity sets for filtering
    const availableActions = Array.from(new Set(logs.map((l) => l.action).filter(Boolean)));
    const availableEntities = Array.from(new Set(logs.map((l) => l.entity).filter(Boolean)));

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-slate-200">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
                        <span>📜</span>
                        <span>System Security & Data Audit Logs</span>
                    </h1>
                    <p className="text-slate-500 text-xs mt-1">
                        Immutable historical audit trail of attendance corrections, employee archival, dispatch verification, and GRN inwarding
                    </p>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                    <button
                        onClick={fetchLogs}
                        className="px-3.5 py-1.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold border border-slate-200 transition-colors shadow-sm flex items-center gap-1.5"
                    >
                        <span>🔄</span>
                        <span>Refresh</span>
                    </button>

                    <div className="flex items-center gap-2">
                        <select
                            value={actionFilter}
                            onChange={(e) => setActionFilter(e.target.value)}
                            className="bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-700 focus:outline-none focus:border-blue-600 shadow-sm"
                        >
                            <option value="all">All Actions</option>
                            {availableActions.map((act) => (
                                <option key={act} value={act}>
                                    {act}
                                </option>
                            ))}
                        </select>

                        <select
                            value={entityFilter}
                            onChange={(e) => setEntityFilter(e.target.value)}
                            className="bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-700 focus:outline-none focus:border-blue-600 shadow-sm"
                        >
                            <option value="all">All Entities</option>
                            {availableEntities.map((ent) => (
                                <option key={ent} value={ent}>
                                    {ent}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            {/* Quick Metrics */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-sm">
                    <span className="text-slate-500 text-xs font-medium">Recorded Events</span>
                    <div className="text-2xl font-bold text-slate-900 mt-1">{logs.length}</div>
                    <span className="text-[10px] text-slate-400">Total in Current Scope</span>
                </div>
                <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-sm">
                    <span className="text-slate-500 text-xs font-medium">Tamper Protection</span>
                    <div className="text-sm font-bold text-emerald-600 mt-2">Append-Only Table</div>
                    <span className="text-[10px] text-slate-400">Guaranteed Immutable</span>
                </div>
                <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-sm">
                    <span className="text-slate-500 text-xs font-medium">Database Layer</span>
                    <div className="text-sm font-bold text-blue-600 mt-2">Supabase PostgreSQL</div>
                    <span className="text-[10px] text-slate-400">Port 6543 SSL Pooler</span>
                </div>
                <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-sm">
                    <span className="text-slate-500 text-xs font-medium">Legal Retention</span>
                    <div className="text-sm font-bold text-slate-900 mt-2">7 Years (Compliance)</div>
                    <span className="text-[10px] text-slate-400">Statutory Archival</span>
                </div>
            </div>

            {/* Audit Table */}
            <div className="bg-white border border-slate-200/90 rounded-2xl overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                        <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase font-semibold text-[11px]">
                            <tr>
                                <th className="py-3.5 px-4">Action</th>
                                <th className="py-3.5 px-4">Entity</th>
                                <th className="py-3.5 px-4">Entity ID</th>
                                <th className="py-3.5 px-4">Actor Email</th>
                                <th className="py-3.5 px-4">Timestamp</th>
                                <th className="py-3.5 px-4 text-right">Details</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 font-mono">
                            {loading ? (
                                <tr>
                                    <td colSpan={6} className="py-12 text-center text-slate-400 font-sans">
                                        Loading immutable audit trails...
                                    </td>
                                </tr>
                            ) : logs.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="py-12 text-center text-slate-400 font-sans">
                                        No audit log entries match the selected filters.
                                    </td>
                                </tr>
                            ) : (
                                logs.map((log) => {
                                    let badgeColor = 'bg-slate-50 text-slate-700 border-slate-200';
                                    if (log.action.includes('CORRECTION')) badgeColor = 'bg-amber-50 text-amber-700 border-amber-200';
                                    if (log.action.includes('ARCHIVE')) badgeColor = 'bg-red-50 text-red-700 border-red-200';
                                    if (log.action.includes('APPROVED') || log.action.includes('RECEIVE') || log.action.includes('INWARD'))
                                        badgeColor = 'bg-emerald-50 text-emerald-700 border-emerald-200';
                                    if (log.action.includes('LOGIN') || log.action.includes('CREATE'))
                                        badgeColor = 'bg-blue-50 text-blue-700 border-blue-200';

                                    return (
                                        <tr key={log.id} className="hover:bg-slate-50/80 transition-colors">
                                            <td className="py-3.5 px-4 font-semibold">
                                                <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-sans border ${badgeColor}`}>
                                                    {log.action}
                                                </span>
                                            </td>
                                            <td className="py-3.5 px-4 text-slate-600">{log.entity}</td>
                                            <td className="py-3.5 px-4 text-slate-500 text-[11px] truncate max-w-[150px]">
                                                {log.entityId || '—'}
                                            </td>
                                            <td className="py-3.5 px-4 text-slate-700 font-sans text-xs">
                                                {log.userEmail || 'system'}
                                            </td>
                                            <td className="py-3.5 px-4 text-slate-500 text-[11px]">
                                                {new Date(log.createdAt).toLocaleString('en-IN', {
                                                    day: '2-digit',
                                                    month: 'short',
                                                    year: 'numeric',
                                                    hour: '2-digit',
                                                    minute: '2-digit',
                                                    second: '2-digit',
                                                })}
                                            </td>
                                            <td className="py-3.5 px-4 text-right">
                                                <button
                                                    onClick={() => setSelectedLog(log)}
                                                    className="px-2.5 py-1 text-[11px] font-sans font-semibold rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
                                                >
                                                    Inspect
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* JSON Payload Inspection Modal */}
            {selectedLog && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-xl border border-slate-200 space-y-4">
                        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                            <div>
                                <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                                    <span>🔍</span>
                                    <span>Audit Entry: {selectedLog.action}</span>
                                </h3>
                                <p className="text-xs text-slate-500 mt-0.5">
                                    Entity: <strong className="text-slate-800">{selectedLog.entity}</strong> • Timestamp:{' '}
                                    {new Date(selectedLog.createdAt).toLocaleString('en-IN')}
                                </p>
                            </div>
                            <button
                                onClick={() => setSelectedLog(null)}
                                className="h-8 w-8 rounded-lg hover:bg-slate-100 text-slate-500 flex items-center justify-center font-bold"
                            >
                                ✕
                            </button>
                        </div>

                        <div className="space-y-3 text-xs">
                            <div className="grid grid-cols-2 gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200/80">
                                <div>
                                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Actor Email</span>
                                    <span className="font-medium text-slate-800">{selectedLog.userEmail || 'system'}</span>
                                </div>
                                <div>
                                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Entity ID</span>
                                    <span className="font-mono text-slate-800 truncate block">{selectedLog.entityId || 'N/A'}</span>
                                </div>
                            </div>

                            {selectedLog.oldValue && (
                                <div>
                                    <span className="text-[11px] font-bold text-slate-700 block mb-1">Previous State (Before Edit)</span>
                                    <pre className="p-3 bg-slate-900 text-emerald-400 rounded-xl text-[11px] overflow-x-auto font-mono max-h-40">
                                        {JSON.stringify(selectedLog.oldValue, null, 2)}
                                    </pre>
                                </div>
                            )}

                            {selectedLog.newValue && (
                                <div>
                                    <span className="text-[11px] font-bold text-slate-700 block mb-1">Applied Changes (Audit Record)</span>
                                    <pre className="p-3 bg-slate-900 text-blue-400 rounded-xl text-[11px] overflow-x-auto font-mono max-h-40">
                                        {JSON.stringify(selectedLog.newValue, null, 2)}
                                    </pre>
                                </div>
                            )}
                        </div>

                        <div className="pt-3 border-t border-slate-100 flex justify-end">
                            <button
                                onClick={() => setSelectedLog(null)}
                                className="px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 transition-colors"
                            >
                                Close Inspection
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
