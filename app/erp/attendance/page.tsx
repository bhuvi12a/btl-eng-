'use client';

import { useState, useEffect } from 'react';

interface AttendanceRecord {
    id: string;
    employeeName: string;
    employeeCode: string;
    date: string;
    status: 'present' | 'absent' | 'half_day' | 'leave' | 'overtime';
    shift: 'general' | 'shift_1' | 'shift_2' | 'night';
    checkInTime: string;
    checkOutTime: string;
    hoursWorked: string;
    overtimeHours: string;
    notes: string | null;
    gpsVerified?: boolean;
    gpsAccuracyMeters?: number | null;
    checkInSelfieKey?: string | null;
    checkInVideoKey?: string | null;
    checkOutSelfieKey?: string | null;
    checkOutVideoKey?: string | null;
    correctionReason?: string | null;
    correctedById?: string | null;
}

interface EvidenceDetails {
    id: string;
    employeeName: string;
    employeeCode: string;
    date: string;
    checkInTime: string;
    checkOutTime: string;
    gpsVerified: boolean;
    latitude: string | null;
    longitude: string | null;
    gpsAccuracyMeters: number | null;
    deviceInfo?: string | null;
    consentRecordedAt?: string | null;
    checkIn: {
        selfieUrl: string | null;
        videoUrl: string | null;
        videoDurationMs: number | null;
    };
    checkOut: {
        selfieUrl: string | null;
        videoUrl: string | null;
        videoDurationMs: number | null;
    };
}

export default function AttendancePage() {
    const [records, setRecords] = useState<AttendanceRecord[]>([]);
    const [summary, setSummary] = useState({
        total: 0,
        present: 0,
        absent: 0,
        onLeave: 0,
        overtimeHours: '0.0',
        gpsVerifiedCount: 0,
    });
    const [canCorrect, setCanCorrect] = useState(false);
    const [loading, setLoading] = useState(true);
    const [dateFilter, setDateFilter] = useState(new Date().toISOString().split('T')[0]);

    // Evidence Review Modal state
    const [evidenceModalOpen, setEvidenceModalOpen] = useState(false);
    const [selectedEvidence, setSelectedEvidence] = useState<EvidenceDetails | null>(null);
    const [evidenceLoading, setEvidenceLoading] = useState(false);
    const [evidenceError, setEvidenceError] = useState('');

    // Admin Correction Modal state
    const [correctionModalOpen, setCorrectionModalOpen] = useState(false);
    const [selectedRecordForCorrection, setSelectedRecordForCorrection] = useState<AttendanceRecord | null>(null);
    const [correctionForm, setCorrectionForm] = useState({
        status: 'present',
        checkInTime: '',
        checkOutTime: '',
        hoursWorked: '8.00',
        overtimeHours: '0.00',
        correctionReason: '',
    });
    const [correctionSubmitting, setCorrectionSubmitting] = useState(false);
    const [correctionError, setCorrectionError] = useState('');

    const fetchAttendance = async () => {
        setLoading(true);
        try {
            const res = await fetch(`/api/attendance?date=${dateFilter}`);
            const data = await res.json();
            if (data.success) {
                setRecords(data.records);
                if (data.summary) setSummary(data.summary);
                if (data.canCorrect !== undefined) setCanCorrect(data.canCorrect);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAttendance();
    }, [dateFilter]);

    // Open Evidence Modal
    const handleOpenEvidence = async (recordId: string) => {
        setEvidenceModalOpen(true);
        setEvidenceLoading(true);
        setEvidenceError('');
        setSelectedEvidence(null);

        try {
            const res = await fetch(`/api/attendance/${recordId}/evidence`);
            const data = await res.json();
            if (data.success) {
                setSelectedEvidence(data.evidence);
            } else {
                setEvidenceError(data.error || 'Failed to load attendance evidence');
            }
        } catch {
            setEvidenceError('Failed to connect to evidence server');
        } finally {
            setEvidenceLoading(false);
        }
    };

    // Open Admin Correction Modal
    const handleOpenCorrection = (r: AttendanceRecord) => {
        setSelectedRecordForCorrection(r);
        setCorrectionForm({
            status: r.status,
            checkInTime: r.checkInTime || '08:30 AM',
            checkOutTime: r.checkOutTime || '05:30 PM',
            hoursWorked: r.hoursWorked || '8.00',
            overtimeHours: r.overtimeHours || '0.00',
            correctionReason: '',
        });
        setCorrectionError('');
        setCorrectionModalOpen(true);
    };

    // Submit Admin Correction
    const handleSubmitCorrection = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedRecordForCorrection) return;

        if (!correctionForm.correctionReason || correctionForm.correctionReason.trim().length < 5) {
            setCorrectionError('A mandatory correction reason with at least 5 characters is required.');
            return;
        }

        setCorrectionSubmitting(true);
        setCorrectionError('');

        try {
            const res = await fetch('/api/attendance/correct', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    recordId: selectedRecordForCorrection.id,
                    status: correctionForm.status,
                    checkInTime: correctionForm.checkInTime,
                    checkOutTime: correctionForm.checkOutTime,
                    hoursWorked: correctionForm.hoursWorked,
                    overtimeHours: correctionForm.overtimeHours,
                    correctionReason: correctionForm.correctionReason.trim(),
                }),
            });

            const data = await res.json();
            if (data.success) {
                setCorrectionModalOpen(false);
                setSelectedRecordForCorrection(null);
                fetchAttendance();
            } else {
                setCorrectionError(data.error || 'Correction failed');
            }
        } catch {
            setCorrectionError('Network error while applying correction');
        } finally {
            setCorrectionSubmitting(false);
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-slate-200">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                        <span>⏱️</span>
                        <span>Daily Attendance & Evidence Audit</span>
                    </h1>
                    <p className="text-xs text-slate-500 mt-1">
                        Hosur SIPCOT Workforce • Live Biometric Presence (Selfie + 3–5s Video) • GPS Geofence & Audit Logs
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <input
                        type="date"
                        value={dateFilter}
                        onChange={(e) => setDateFilter(e.target.value)}
                        className="bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 shadow-sm focus:outline-none focus:border-blue-600 font-medium"
                    />
                    <a
                        href="/attendance"
                        target="_blank"
                        rel="noreferrer"
                        className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-sm transition-colors flex items-center gap-2"
                    >
                        <span>📱</span>
                        <span>Open Mobile Punch Kiosk</span>
                    </a>
                </div>
            </div>

            {/* Quick Metrics */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
                <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-sm">
                    <span className="text-slate-500 text-xs font-medium">Logged Staff Today</span>
                    <div className="text-2xl font-bold text-slate-900 mt-1">{summary.total}</div>
                </div>
                <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-sm">
                    <span className="text-slate-500 text-xs font-medium">Present on Floor</span>
                    <div className="text-2xl font-bold text-emerald-600 mt-1">{summary.present}</div>
                </div>
                <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-sm">
                    <span className="text-slate-500 text-xs font-medium">Absent / On Leave</span>
                    <div className="text-2xl font-bold text-red-500 mt-1">{summary.absent + summary.onLeave}</div>
                </div>
                <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-sm">
                    <span className="text-slate-500 text-xs font-medium">GPS Geofence Verified</span>
                    <div className="text-2xl font-bold text-indigo-600 mt-1">{summary.gpsVerifiedCount}</div>
                </div>
                <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-sm">
                    <span className="text-slate-500 text-xs font-medium">Total Overtime</span>
                    <div className="text-2xl font-bold text-blue-600 mt-1">{summary.overtimeHours} hrs</div>
                </div>
            </div>

            {/* Attendance Table */}
            <div className="bg-white border border-slate-200/90 rounded-2xl overflow-hidden shadow-sm">
                {loading ? (
                    <div className="py-16 text-center text-xs text-slate-500">Loading verified attendance logs...</div>
                ) : records.length === 0 ? (
                    <div className="py-16 text-center text-xs text-slate-500 space-y-2">
                        <p>No attendance records found for {dateFilter}.</p>
                        <p className="text-slate-400">Employees record live presence using the Mobile Punch Kiosk.</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs">
                            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase font-semibold text-[11px]">
                                <tr>
                                    <th className="py-3.5 px-4">Employee</th>
                                    <th className="py-3.5 px-4">Check-In</th>
                                    <th className="py-3.5 px-4">Check-Out</th>
                                    <th className="py-3.5 px-4">Hours</th>
                                    <th className="py-3.5 px-4">Presence Evidence</th>
                                    <th className="py-3.5 px-4">Geofence</th>
                                    <th className="py-3.5 px-4">Status</th>
                                    <th className="py-3.5 px-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {records.map((r) => {
                                    const hasEvidence = !!(r.checkInSelfieKey || r.checkInVideoKey || r.checkOutSelfieKey || r.checkOutVideoKey);
                                    const hasCorrection = !!r.correctionReason;

                                    return (
                                        <tr key={r.id} className="hover:bg-slate-50/80 transition-colors">
                                            <td className="py-3.5 px-4">
                                                <div className="font-semibold text-slate-900">{r.employeeName}</div>
                                                <div className="font-mono text-[11px] text-blue-600 font-bold">{r.employeeCode}</div>
                                                {hasCorrection && (
                                                    <span className="inline-block mt-1 text-[9px] bg-amber-50 text-amber-700 px-1.5 py-0.5 rounded font-medium border border-amber-200">
                                                        ✏️ Admin Corrected
                                                    </span>
                                                )}
                                            </td>
                                            <td className="py-3.5 px-4 font-mono text-slate-700">
                                                {r.checkInTime || '—'}
                                            </td>
                                            <td className="py-3.5 px-4 font-mono text-slate-700">
                                                {r.checkOutTime || '—'}
                                            </td>
                                            <td className="py-3.5 px-4 text-slate-800 font-medium">
                                                <div>{r.hoursWorked} hrs</div>
                                                {parseFloat(r.overtimeHours || '0') > 0 && (
                                                    <div className="text-blue-600 font-semibold text-[11px]">+{r.overtimeHours} OT</div>
                                                )}
                                            </td>
                                            <td className="py-3.5 px-4">
                                                {hasEvidence ? (
                                                    <div className="flex items-center gap-1.5 flex-wrap">
                                                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                                            📸 Selfie
                                                        </span>
                                                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
                                                            🎥 3–5s Video
                                                        </span>
                                                    </div>
                                                ) : (
                                                    <span className="text-slate-400 text-[11px] italic">Manual / Legacy</span>
                                                )}
                                            </td>
                                            <td className="py-3.5 px-4">
                                                {r.gpsVerified ? (
                                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                                        📍 Within 500m
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-600 border border-slate-200">
                                                        ⚪ Unverified
                                                    </span>
                                                )}
                                            </td>
                                            <td className="py-3.5 px-4">
                                                <span
                                                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold border ${
                                                        r.status === 'present'
                                                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                                            : r.status === 'overtime'
                                                            ? 'bg-blue-50 text-blue-700 border-blue-200'
                                                            : r.status === 'leave' || r.status === 'half_day'
                                                            ? 'bg-amber-50 text-amber-700 border-amber-200'
                                                            : 'bg-red-50 text-red-700 border-red-200'
                                                    }`}
                                                >
                                                    {r.status.toUpperCase()}
                                                </span>
                                            </td>
                                            <td className="py-3.5 px-4 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    {hasEvidence && (
                                                        <button
                                                            onClick={() => handleOpenEvidence(r.id)}
                                                            className="px-2.5 py-1 text-[11px] font-semibold rounded-lg bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200 transition-colors"
                                                            title="Inspect Selfie & Video Presence"
                                                        >
                                                            🔍 Review Evidence
                                                        </button>
                                                    )}
                                                    {canCorrect && (
                                                        <button
                                                            onClick={() => handleOpenCorrection(r)}
                                                            className="px-2.5 py-1 text-[11px] font-semibold rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200 transition-colors"
                                                            title="Admin Override / Correction with Audit Reason"
                                                        >
                                                            ✏️ Correct
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Modal: Evidence Inspection */}
            {evidenceModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
                    <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 space-y-5 shadow-2xl">
                        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                            <div>
                                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                                    <span>🛡️</span>
                                    <span>Live Biometric Presence Evidence Review</span>
                                </h3>
                                <p className="text-xs text-slate-500">
                                    Private Supabase storage • Authenticated short-lived signed URLs (valid 5 mins)
                                </p>
                            </div>
                            <button
                                onClick={() => setEvidenceModalOpen(false)}
                                className="text-slate-400 hover:text-slate-700 text-lg font-bold p-1 rounded-lg"
                            >
                                ✕
                            </button>
                        </div>

                        {evidenceLoading ? (
                            <div className="py-16 text-center text-xs text-slate-500 space-y-2">
                                <div className="inline-block w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                                <div>Fetching private signed URLs...</div>
                            </div>
                        ) : evidenceError ? (
                            <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs">
                                {evidenceError}
                            </div>
                        ) : selectedEvidence ? (
                            <div className="space-y-5 text-xs">
                                {/* Employee Header Details */}
                                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 flex flex-wrap items-center justify-between gap-3">
                                    <div>
                                        <div className="font-bold text-slate-900 text-sm">{selectedEvidence.employeeName}</div>
                                        <div className="font-mono text-blue-600 font-bold">{selectedEvidence.employeeCode}</div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-slate-500">Date: <span className="font-semibold text-slate-800">{selectedEvidence.date}</span></div>
                                        <div className="text-slate-500">
                                            GPS Geofence: {selectedEvidence.gpsVerified ? (
                                                <span className="text-emerald-700 font-semibold">Verified (≤500m)</span>
                                            ) : (
                                                <span className="text-slate-600 font-semibold">Unverified / Far</span>
                                            )}
                                            {selectedEvidence.gpsAccuracyMeters && (
                                                <span className="text-slate-400 text-[10px]"> (±{Math.round(selectedEvidence.gpsAccuracyMeters)}m)</span>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Check-in Evidence Panel */}
                                <div className="p-4 rounded-2xl border border-slate-200 bg-white space-y-3">
                                    <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                                        <span className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                                            <span>🟢</span> Check-In Punch ({selectedEvidence.checkInTime || 'No Time'})
                                        </span>
                                        {selectedEvidence.checkIn.videoDurationMs && (
                                            <span className="text-[10px] font-mono text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                                                Video: {(selectedEvidence.checkIn.videoDurationMs / 1000).toFixed(1)}s
                                            </span>
                                        )}
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div>
                                            <div className="font-semibold text-slate-700 mb-1.5">Live Selfie Snapshot</div>
                                            {selectedEvidence.checkIn.selfieUrl ? (
                                                <img
                                                    src={selectedEvidence.checkIn.selfieUrl}
                                                    alt="Check-in Selfie"
                                                    className="w-full h-48 object-cover rounded-xl border border-slate-200 bg-slate-100"
                                                />
                                            ) : (
                                                <div className="h-48 rounded-xl border border-dashed border-slate-300 flex items-center justify-center text-slate-400 bg-slate-50">
                                                    No Check-In Selfie
                                                </div>
                                            )}
                                        </div>
                                        <div>
                                            <div className="font-semibold text-slate-700 mb-1.5">3–5s Live Presence Video</div>
                                            {selectedEvidence.checkIn.videoUrl ? (
                                                <video
                                                    controls
                                                    playsInline
                                                    src={selectedEvidence.checkIn.videoUrl}
                                                    className="w-full h-48 object-cover rounded-xl border border-slate-200 bg-black"
                                                />
                                            ) : (
                                                <div className="h-48 rounded-xl border border-dashed border-slate-300 flex items-center justify-center text-slate-400 bg-slate-50">
                                                    No Check-In Video
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Check-out Evidence Panel */}
                                {(selectedEvidence.checkOut.selfieUrl || selectedEvidence.checkOut.videoUrl || selectedEvidence.checkOutTime) && (
                                    <div className="p-4 rounded-2xl border border-slate-200 bg-white space-y-3">
                                        <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                                            <span className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                                                <span>🔴</span> Check-Out Punch ({selectedEvidence.checkOutTime || 'Pending'})
                                            </span>
                                            {selectedEvidence.checkOut.videoDurationMs && (
                                                <span className="text-[10px] font-mono text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                                                    Video: {(selectedEvidence.checkOut.videoDurationMs / 1000).toFixed(1)}s
                                                </span>
                                            )}
                                        </div>

                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            <div>
                                                <div className="font-semibold text-slate-700 mb-1.5">Check-Out Selfie</div>
                                                {selectedEvidence.checkOut.selfieUrl ? (
                                                    <img
                                                        src={selectedEvidence.checkOut.selfieUrl}
                                                        alt="Check-out Selfie"
                                                        className="w-full h-48 object-cover rounded-xl border border-slate-200 bg-slate-100"
                                                    />
                                                ) : (
                                                    <div className="h-48 rounded-xl border border-dashed border-slate-300 flex items-center justify-center text-slate-400 bg-slate-50">
                                                        No Check-Out Selfie
                                                    </div>
                                                )}
                                            </div>
                                            <div>
                                                <div className="font-semibold text-slate-700 mb-1.5">Check-Out Presence Video</div>
                                                {selectedEvidence.checkOut.videoUrl ? (
                                                    <video
                                                        controls
                                                        playsInline
                                                        src={selectedEvidence.checkOut.videoUrl}
                                                        className="w-full h-48 object-cover rounded-xl border border-slate-200 bg-black"
                                                    />
                                                ) : (
                                                    <div className="h-48 rounded-xl border border-dashed border-slate-300 flex items-center justify-center text-slate-400 bg-slate-50">
                                                        No Check-Out Video
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ) : null}

                        <div className="flex justify-end pt-3 border-t border-slate-100">
                            <button
                                type="button"
                                onClick={() => setEvidenceModalOpen(false)}
                                className="px-5 py-2 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 font-semibold text-xs"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal: Admin Attendance Correction */}
            {correctionModalOpen && selectedRecordForCorrection && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
                    <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-lg overflow-y-auto p-6 space-y-4 shadow-2xl">
                        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                            <div>
                                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                                    <span>✏️</span>
                                    <span>Admin Attendance Correction</span>
                                </h3>
                                <p className="text-xs text-slate-500">
                                    Overriding {selectedRecordForCorrection.employeeName} ({selectedRecordForCorrection.employeeCode})
                                </p>
                            </div>
                            <button
                                onClick={() => setCorrectionModalOpen(false)}
                                className="text-slate-400 hover:text-slate-700 text-lg font-bold p-1 rounded-lg"
                            >
                                ✕
                            </button>
                        </div>

                        {correctionError && (
                            <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs">
                                {correctionError}
                            </div>
                        )}

                        <form onSubmit={handleSubmitCorrection} className="space-y-4 text-xs">
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-slate-700 font-medium mb-1">Status</label>
                                    <select
                                        value={correctionForm.status}
                                        onChange={(e) => setCorrectionForm({ ...correctionForm, status: e.target.value })}
                                        className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:border-blue-600 font-medium"
                                    >
                                        <option value="present">Present</option>
                                        <option value="overtime">Overtime</option>
                                        <option value="half_day">Half Day</option>
                                        <option value="leave">Leave</option>
                                        <option value="absent">Absent</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-slate-700 font-medium mb-1">Hours Worked</label>
                                    <input
                                        type="number"
                                        step="0.5"
                                        value={correctionForm.hoursWorked}
                                        onChange={(e) => setCorrectionForm({ ...correctionForm, hoursWorked: e.target.value })}
                                        className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:border-blue-600"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-slate-700 font-medium mb-1">Check-In Time</label>
                                    <input
                                        type="text"
                                        value={correctionForm.checkInTime}
                                        onChange={(e) => setCorrectionForm({ ...correctionForm, checkInTime: e.target.value })}
                                        placeholder="08:30 AM"
                                        className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:border-blue-600"
                                    />
                                </div>
                                <div>
                                    <label className="block text-slate-700 font-medium mb-1">Check-Out Time</label>
                                    <input
                                        type="text"
                                        value={correctionForm.checkOutTime}
                                        onChange={(e) => setCorrectionForm({ ...correctionForm, checkOutTime: e.target.value })}
                                        placeholder="05:30 PM"
                                        className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:border-blue-600"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-slate-700 font-medium mb-1">
                                    Mandatory Correction Reason <span className="text-red-500">*</span>
                                </label>
                                <textarea
                                    required
                                    rows={3}
                                    value={correctionForm.correctionReason}
                                    onChange={(e) => setCorrectionForm({ ...correctionForm, correctionReason: e.target.value })}
                                    placeholder="Explain the justification for modifying this punch (e.g. Employee punch camera failed, supervisor approved on-site shift change)..."
                                    className="w-full bg-white border border-slate-300 rounded-xl p-3 text-slate-900 focus:outline-none focus:border-blue-600 resize-none"
                                />
                                <span className="text-[11px] text-slate-400">
                                    This explanation will be permanently recorded in the immutable audit log with your Administrator ID.
                                </span>
                            </div>

                            <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                                <button
                                    type="button"
                                    onClick={() => setCorrectionModalOpen(false)}
                                    className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={correctionSubmitting}
                                    className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-sm"
                                >
                                    {correctionSubmitting ? 'Recording Audit...' : 'Save Correction'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
