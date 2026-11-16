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
}

export default function AttendancePage() {
    const [records, setRecords] = useState<AttendanceRecord[]>([]);
    const [summary, setSummary] = useState({
        total: 0,
        present: 0,
        absent: 0,
        onLeave: 0,
        overtimeHours: '0.0',
    });
    const [loading, setLoading] = useState(true);
    const [dateFilter, setDateFilter] = useState(new Date().toISOString().split('T')[0]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');

    const [form, setForm] = useState({
        employeeName: '',
        employeeCode: '',
        date: new Date().toISOString().split('T')[0],
        status: 'present',
        shift: 'general',
        checkInTime: '08:30 AM',
        checkOutTime: '05:30 PM',
        hoursWorked: '8.00',
        overtimeHours: '0.00',
        notes: '',
    });

    const fetchAttendance = async () => {
        setLoading(true);
        try {
            const res = await fetch(`/api/attendance?date=${dateFilter}`);
            const data = await res.json();
            if (data.success) {
                setRecords(data.records);
                if (data.summary) setSummary(data.summary);
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

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        setErrorMsg('');

        try {
            const res = await fetch('/api/attendance', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(form),
            });
            const data = await res.json();
            if (data.success) {
                setIsModalOpen(false);
                setForm({
                    employeeName: '',
                    employeeCode: '',
                    date: dateFilter,
                    status: 'present',
                    shift: 'general',
                    checkInTime: '08:30 AM',
                    checkOutTime: '05:30 PM',
                    hoursWorked: '8.00',
                    overtimeHours: '0.00',
                    notes: '',
                });
                fetchAttendance();
            } else {
                setErrorMsg(data.error || 'Failed to log attendance');
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
                        <span>⏱️</span>
                        <span>Daily Attendance & Machinist Shifts</span>
                    </h1>
                    <p className="text-xs text-slate-500 mt-1">
                        Hosur plant workforce check-in, CNC operator shifts, and overtime tracking
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <input
                        type="date"
                        value={dateFilter}
                        onChange={(e) => setDateFilter(e.target.value)}
                        className="bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 shadow-sm focus:outline-none focus:border-blue-600"
                    />
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-sm transition-colors flex items-center gap-2"
                    >
                        <span>+</span>
                        <span>Log Attendance</span>
                    </button>
                </div>
            </div>

            {/* Quick Metrics */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
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
                    <span className="text-slate-500 text-xs font-medium">Total Overtime Hours</span>
                    <div className="text-2xl font-bold text-blue-600 mt-1">{summary.overtimeHours} hrs</div>
                </div>
            </div>

            {/* Attendance Table */}
            <div className="bg-white border border-slate-200/90 rounded-2xl overflow-hidden shadow-sm">
                {loading ? (
                    <div className="py-16 text-center text-xs text-slate-500">Loading attendance logs...</div>
                ) : records.length === 0 ? (
                    <div className="py-16 text-center text-xs text-slate-500">
                        No attendance records logged for {dateFilter}. Click &quot;Log Attendance&quot; to check in staff.
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs">
                            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase font-semibold text-[11px]">
                                <tr>
                                    <th className="py-3.5 px-4">Employee Code</th>
                                    <th className="py-3.5 px-4">Employee Name</th>
                                    <th className="py-3.5 px-4">Shift</th>
                                    <th className="py-3.5 px-4">Check-In</th>
                                    <th className="py-3.5 px-4">Check-Out</th>
                                    <th className="py-3.5 px-4">Hours</th>
                                    <th className="py-3.5 px-4">Overtime</th>
                                    <th className="py-3.5 px-4">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {records.map((r) => (
                                    <tr key={r.id} className="hover:bg-slate-50/80 transition-colors">
                                        <td className="py-3.5 px-4 font-mono font-bold text-blue-600">{r.employeeCode}</td>
                                        <td className="py-3.5 px-4 font-semibold text-slate-900">{r.employeeName}</td>
                                        <td className="py-3.5 px-4 text-slate-600 capitalize">{r.shift.replace('_', ' ')}</td>
                                        <td className="py-3.5 px-4 font-mono text-slate-600">{r.checkInTime || '—'}</td>
                                        <td className="py-3.5 px-4 font-mono text-slate-600">{r.checkOutTime || '—'}</td>
                                        <td className="py-3.5 px-4 text-slate-800 font-medium">{r.hoursWorked} hrs</td>
                                        <td className="py-3.5 px-4 font-semibold text-blue-600">{r.overtimeHours} hrs</td>
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
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Modal: Log Attendance */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
                    <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-lg overflow-y-auto p-6 space-y-4 shadow-2xl">
                        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                            <div>
                                <h3 className="text-base font-bold text-slate-900">Log Staff Attendance</h3>
                                <p className="text-xs text-slate-500">Record check-in, shift assignment, and overtime</p>
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
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-slate-700 font-medium mb-1">Employee Name *</label>
                                    <input
                                        type="text"
                                        required
                                        value={form.employeeName}
                                        onChange={(e) => setForm({ ...form, employeeName: e.target.value })}
                                        placeholder="e.g. Ramesh Kumar"
                                        className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:border-blue-600"
                                    />
                                </div>
                                <div>
                                    <label className="block text-slate-700 font-medium mb-1">Employee ID *</label>
                                    <input
                                        type="text"
                                        required
                                        value={form.employeeCode}
                                        onChange={(e) => setForm({ ...form, employeeCode: e.target.value.toUpperCase() })}
                                        placeholder="BTL-CNC-01"
                                        className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-slate-900 font-mono focus:outline-none focus:border-blue-600"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-3 gap-3">
                                <div>
                                    <label className="block text-slate-700 font-medium mb-1">Date</label>
                                    <input
                                        type="date"
                                        value={form.date}
                                        onChange={(e) => setForm({ ...form, date: e.target.value })}
                                        className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:border-blue-600"
                                    />
                                </div>
                                <div>
                                    <label className="block text-slate-700 font-medium mb-1">Status</label>
                                    <select
                                        value={form.status}
                                        onChange={(e) => setForm({ ...form, status: e.target.value })}
                                        className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:border-blue-600"
                                    >
                                        <option value="present">Present</option>
                                        <option value="overtime">Overtime</option>
                                        <option value="half_day">Half Day</option>
                                        <option value="leave">Leave</option>
                                        <option value="absent">Absent</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-slate-700 font-medium mb-1">Work Shift</label>
                                    <select
                                        value={form.shift}
                                        onChange={(e) => setForm({ ...form, shift: e.target.value as any })}
                                        className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:border-blue-600"
                                    >
                                        <option value="general">General (08:30 - 17:30)</option>
                                        <option value="shift_1">Shift 1 (06:00 - 14:00)</option>
                                        <option value="shift_2">Shift 2 (14:00 - 22:00)</option>
                                        <option value="night">Night Shift</option>
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                <div>
                                    <label className="block text-slate-700 font-medium mb-1">Check-In</label>
                                    <input
                                        type="text"
                                        value={form.checkInTime}
                                        onChange={(e) => setForm({ ...form, checkInTime: e.target.value })}
                                        className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:border-blue-600"
                                    />
                                </div>
                                <div>
                                    <label className="block text-slate-700 font-medium mb-1">Check-Out</label>
                                    <input
                                        type="text"
                                        value={form.checkOutTime}
                                        onChange={(e) => setForm({ ...form, checkOutTime: e.target.value })}
                                        className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:border-blue-600"
                                    />
                                </div>
                                <div>
                                    <label className="block text-slate-700 font-medium mb-1">Regular Hrs</label>
                                    <input
                                        type="number"
                                        step="0.5"
                                        value={form.hoursWorked}
                                        onChange={(e) => setForm({ ...form, hoursWorked: e.target.value })}
                                        className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:border-blue-600"
                                    />
                                </div>
                                <div>
                                    <label className="block text-slate-700 font-medium mb-1">Overtime Hrs</label>
                                    <input
                                        type="number"
                                        step="0.5"
                                        value={form.overtimeHours}
                                        onChange={(e) => setForm({ ...form, overtimeHours: e.target.value })}
                                        className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:border-blue-600"
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
                                    {submitting ? 'Saving...' : 'Save Log'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

