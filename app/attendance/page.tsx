'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';

// Hosur SIPCOT Plant Reference Coordinates
const HOSUR_LAT = 12.7409;
const HOSUR_LNG = 77.8253;
const GEOFENCE_RADIUS_METERS = 500;

function calculateDistanceMeters(lat1: number, lon1: number, lat2: number, lon2: number) {
    const R = 6371e3;
    const phi1 = (lat1 * Math.PI) / 180;
    const phi2 = (lat2 * Math.PI) / 180;
    const deltaPhi = ((lat2 - lat1) * Math.PI) / 180;
    const deltaLambda = ((lon2 - lon1) * Math.PI) / 180;

    const a =
        Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
        Math.cos(phi1) * Math.cos(phi2) * Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
}

interface AttendanceLogItem {
    id: string;
    employeeName: string;
    employeeCode: string;
    date: string;
    status: string;
    shift: string;
    checkInTime: string | null;
    checkOutTime: string | null;
    hoursWorked: string;
    overtimeHours: string;
    gpsVerified: boolean;
}

export default function EmployeeAttendancePunchPage() {
    const [currentTime, setCurrentTime] = useState<string>('');
    const [currentDate, setCurrentDate] = useState<string>('');

    // GPS & Geofence State
    const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
    const [distance, setDistance] = useState<number | null>(null);
    const [isWithinGeofence, setIsWithinGeofence] = useState<boolean | null>(null);
    const [gpsError, setGpsError] = useState<string | null>(null);
    const [locating, setLocating] = useState<boolean>(true);

    // Punch Form State
    const [employeeCode, setEmployeeCode] = useState<string>('');
    const [employeeName, setEmployeeName] = useState<string>('');
    const [shift, setShift] = useState<string>('general');
    const [submitting, setSubmitting] = useState<boolean>(false);
    const [toast, setToast] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

    // Today's Recent Plant Punches
    const [recentPunches, setRecentPunches] = useState<AttendanceLogItem[]>([]);
    const [todayPunchSummary, setTodayPunchSummary] = useState({
        total: 0,
        present: 0,
        overtimeHours: '0.0',
        gpsVerifiedCount: 0,
    });

    const showToast = (text: string, type: 'success' | 'error' = 'success') => {
        setToast({ text, type });
        setTimeout(() => setToast(null), 5000);
    };

    // Live Clock
    useEffect(() => {
        const updateClock = () => {
            const now = new Date();
            setCurrentTime(
                now.toLocaleTimeString('en-IN', {
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit',
                    hour12: true,
                })
            );
            setCurrentDate(
                now.toLocaleDateString('en-IN', {
                    weekday: 'long',
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                })
            );
        };
        updateClock();
        const timer = setInterval(updateClock, 1000);
        return () => clearInterval(timer);
    }, []);

    // Fetch Today's Recent Attendance Feed
    const fetchRecentAttendance = async () => {
        try {
            const todayStr = new Date().toISOString().split('T')[0];
            const res = await fetch(`/api/attendance?date=${todayStr}`);
            const data = await res.json();
            if (data.success) {
                setRecentPunches(data.records || []);
                if (data.summary) {
                    setTodayPunchSummary(data.summary);
                }
            }
        } catch {
            // Silently ignore feed error
        }
    };

    useEffect(() => {
        fetchRecentAttendance();
    }, []);

    // Get GPS Location
    const fetchLocation = () => {
        setLocating(true);
        setGpsError(null);

        if (!navigator.geolocation) {
            setGpsError('Geolocation is not supported by your browser or device.');
            setLocating(false);
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (pos) => {
                const lat = pos.coords.latitude;
                const lng = pos.coords.longitude;
                setLocation({ lat, lng });

                const dist = calculateDistanceMeters(lat, lng, HOSUR_LAT, HOSUR_LNG);
                setDistance(Math.round(dist));
                setIsWithinGeofence(dist <= GEOFENCE_RADIUS_METERS);
                setLocating(false);
            },
            (err) => {
                let msg = 'Failed to retrieve GPS location.';
                if (err.code === err.PERMISSION_DENIED) {
                    msg = 'Location permission was denied. Please allow location access in your browser settings to verify you are at the plant.';
                } else if (err.code === err.POSITION_UNAVAILABLE) {
                    msg = 'GPS signal unavailable. Please ensure your device GPS is turned on.';
                } else if (err.code === err.TIMEOUT) {
                    msg = 'GPS request timed out. Please retry.';
                }
                setGpsError(msg);
                setLocating(false);
            },
            {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 0,
            }
        );
    };

    useEffect(() => {
        fetchLocation();
    }, []);

    // Handle Punch In or Out
    const handlePunch = async (punchType: 'IN' | 'OUT') => {
        if (!employeeCode.trim() || !employeeName.trim()) {
            showToast('Please enter your Employee Code and Full Name.', 'error');
            return;
        }

        setSubmitting(true);
        try {
            const res = await fetch('/api/attendance/punch', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    employeeCode: employeeCode.trim().toUpperCase(),
                    employeeName: employeeName.trim(),
                    shift,
                    punchType,
                    latitude: location?.lat || null,
                    longitude: location?.lng || null,
                }),
            });

            const data = await res.json();
            if (data.success) {
                showToast(
                    `Punch ${punchType} Recorded! In: ${data.record.checkInTime || '—'} | Out: ${data.record.checkOutTime || '—'} (${data.record.hoursWorked}h)`
                );
                fetchRecentAttendance();
            } else {
                showToast(data.error || 'Failed to submit punch', 'error');
            }
        } catch {
            showToast('Network error while connecting to attendance server', 'error');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col justify-between">
            {/* Toast Notification */}
            {toast && (
                <div
                    className={`fixed top-24 right-5 z-50 px-5 py-3.5 rounded-2xl shadow-xl border text-xs font-semibold flex items-center gap-3 transition-all ${
                        toast.type === 'error'
                            ? 'bg-rose-50 border-rose-200 text-rose-800'
                            : 'bg-emerald-50 border-emerald-200 text-emerald-800'
                    }`}
                >
                    <span className="text-base">{toast.type === 'error' ? '⚠️' : '✅'}</span>
                    <span>{toast.text}</span>
                </div>
            )}

            {/* Top Sub-Bar Under Main Navbar */}
            <div className="pt-24 pb-6 bg-gradient-to-b from-sky-50/70 to-slate-50 border-b border-sky-100">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-semibold border border-blue-200 mb-2">
                            <span>📍</span>
                            <span>BTL Hosur Manufacturing Facility • SIPCOT Phase 1</span>
                        </div>
                        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                            Employee Self-Attendance Portal
                        </h1>
                        <p className="text-xs sm:text-sm text-slate-500 mt-1">
                            GPS-geofenced mobile check-in & check-out for CNC machinists, engineers, and plant personnel
                        </p>
                    </div>

                    {/* ERP Admin Login Shortcut */}
                    <div className="flex items-center gap-2">
                        <Link
                            href="/erp/users"
                            className="text-xs font-semibold text-slate-700 hover:text-blue-600 px-3.5 py-2 rounded-xl bg-white border border-slate-200 shadow-sm hover:border-blue-300 transition-all"
                        >
                            🔐 Master Register & Admin Corrections →
                        </Link>
                    </div>
                </div>
            </div>

            {/* Main Content Area */}
            <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full flex-1">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                    {/* LEFT / CENTER: Punch Card (7 Cols) */}
                    <div className="lg:col-span-7 bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
                        {/* Live Digital Clock */}
                        <div className="p-6 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white text-center shadow-md">
                            <span className="text-[11px] font-semibold uppercase tracking-wider text-blue-200 block">
                                Live Plant Clock
                            </span>
                            <div className="text-4xl sm:text-5xl font-black tracking-tight font-mono my-1">
                                {currentTime || '00:00:00 AM'}
                            </div>
                            <div className="text-xs text-blue-100 font-medium">{currentDate}</div>
                        </div>

                        {/* GPS Radar Status */}
                        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/90 space-y-2">
                            <div className="flex items-center justify-between text-xs">
                                <span className="font-bold text-slate-800 flex items-center gap-1.5">
                                    <span>📍</span>
                                    <span>Hosur Plant Geofence Status</span>
                                </span>
                                <button
                                    onClick={fetchLocation}
                                    disabled={locating}
                                    className="text-[11px] text-blue-600 hover:text-blue-700 font-semibold underline disabled:opacity-50"
                                >
                                    {locating ? 'Scanning GPS...' : 'Refresh GPS'}
                                </button>
                            </div>

                            {locating ? (
                                <div className="text-xs text-slate-500 flex items-center gap-2 py-1">
                                    <span className="animate-spin text-blue-600">🌀</span>
                                    <span>Verifying device distance from Hosur plant...</span>
                                </div>
                            ) : gpsError ? (
                                <div className="text-xs text-rose-700 bg-rose-50 p-2.5 rounded-xl border border-rose-200">
                                    ⚠️ {gpsError}
                                </div>
                            ) : (
                                <div className="space-y-1.5 text-xs">
                                    <div className="flex items-center justify-between">
                                        <span className="text-slate-500">Distance to Hosur Facility:</span>
                                        <span className="font-mono font-bold text-slate-800">
                                            {distance !== null ? `${distance} meters` : 'Calculating...'}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between pt-1 border-t border-slate-200/60">
                                        <span className="text-slate-500">Geofence Status:</span>
                                        {isWithinGeofence ? (
                                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                                <span>✓</span> Verified On-Premises (&lt; 500m)
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                                                <span>⚠️</span> Outside Plant Radius ({distance}m)
                                            </span>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Punch Form */}
                        <div className="space-y-4 text-xs">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div>
                                    <label className="block font-semibold text-slate-700 mb-1">
                                        Employee Code *
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        placeholder="e.g. BTL-001"
                                        value={employeeCode}
                                        onChange={(e) => setEmployeeCode(e.target.value.toUpperCase())}
                                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm font-mono font-bold text-blue-700 placeholder-slate-400 focus:outline-none focus:border-blue-600 focus:bg-white"
                                    />
                                </div>
                                <div>
                                    <label className="block font-semibold text-slate-700 mb-1">
                                        Full Name *
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        placeholder="e.g. Ramesh Kumar"
                                        value={employeeName}
                                        onChange={(e) => setEmployeeName(e.target.value)}
                                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm font-medium text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-600 focus:bg-white"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block font-semibold text-slate-700 mb-1">
                                    Work Shift
                                </label>
                                <select
                                    value={shift}
                                    onChange={(e) => setShift(e.target.value)}
                                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium text-slate-800 focus:outline-none focus:border-blue-600 focus:bg-white"
                                >
                                    <option value="general">General Shift (08:30 AM - 05:30 PM)</option>
                                    <option value="shift_1">Shift 1 (06:00 AM - 02:00 PM)</option>
                                    <option value="shift_2">Shift 2 (02:00 PM - 10:00 PM)</option>
                                    <option value="night">Night Shift (10:00 PM - 06:00 AM)</option>
                                </select>
                            </div>

                            {/* Action Buttons */}
                            <div className="grid grid-cols-2 gap-3 pt-2">
                                <button
                                    type="button"
                                    disabled={submitting}
                                    onClick={() => handlePunch('IN')}
                                    className="w-full py-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-md shadow-emerald-700/20 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
                                >
                                    <span className="text-lg">🟢</span>
                                    <span>Punch IN (Shift Start)</span>
                                </button>
                                <button
                                    type="button"
                                    disabled={submitting}
                                    onClick={() => handlePunch('OUT')}
                                    className="w-full py-4 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-sm shadow-md shadow-rose-700/20 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
                                >
                                    <span className="text-lg">🔴</span>
                                    <span>Punch OUT (Shift End)</span>
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* RIGHT: Plant Today's Live Attendance Feed (5 Cols) */}
                    <div className="lg:col-span-5 space-y-6">
                        {/* Summary Metrics */}
                        <div className="grid grid-cols-2 gap-3">
                            <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-sm">
                                <span className="text-[10px] uppercase font-bold text-slate-400 block">Total Punches Today</span>
                                <span className="text-2xl font-bold text-slate-900 font-mono">
                                    {todayPunchSummary.total}
                                </span>
                            </div>
                            <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200 shadow-sm">
                                <span className="text-[10px] uppercase font-bold text-emerald-700 block">GPS Verified</span>
                                <span className="text-2xl font-bold text-emerald-800 font-mono">
                                    {todayPunchSummary.gpsVerifiedCount}
                                </span>
                            </div>
                        </div>

                        {/* Recent Activity List */}
                        <div className="bg-white border border-slate-200/90 rounded-3xl p-5 shadow-sm space-y-3">
                            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                                    Today's Plant Attendance Feed
                                </h3>
                                <button
                                    onClick={fetchRecentAttendance}
                                    className="text-[11px] text-blue-600 hover:text-blue-700 font-medium"
                                >
                                    Refresh
                                </button>
                            </div>

                            <div className="space-y-2.5 max-h-[420px] overflow-y-auto pr-1">
                                {recentPunches.length === 0 ? (
                                    <div className="py-8 text-center text-xs text-slate-400">
                                        No punches logged yet today. Use the Punch In button to record the first shift.
                                    </div>
                                ) : (
                                    recentPunches.map((item) => (
                                        <div
                                            key={item.id}
                                            className="p-3 rounded-2xl bg-slate-50/70 border border-slate-200/80 text-xs flex items-center justify-between"
                                        >
                                            <div>
                                                <span className="font-bold text-slate-900 block">
                                                    {item.employeeName}
                                                </span>
                                                <div className="flex items-center gap-2 text-[10px] text-slate-500 mt-0.5 font-mono">
                                                    <span className="text-blue-700 font-bold">{item.employeeCode}</span>
                                                    <span>•</span>
                                                    <span className="uppercase">{item.shift}</span>
                                                </div>
                                            </div>

                                            <div className="text-right font-mono">
                                                <div className="text-emerald-700 font-bold text-[11px]">
                                                    In: {item.checkInTime || '—'}
                                                </div>
                                                <div className="text-slate-500 text-[10px]">
                                                    Out: {item.checkOutTime || '—'}
                                                </div>
                                                {item.gpsVerified ? (
                                                    <span className="text-[9px] text-emerald-700 font-semibold block">
                                                        📍 Verified
                                                    </span>
                                                ) : (
                                                    <span className="text-[9px] text-slate-400 font-medium block">
                                                        Manual
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>

                        {/* Plant Notice */}
                        <div className="p-4 rounded-2xl bg-sky-50 border border-sky-100 text-xs text-sky-900 space-y-1">
                            <span className="font-bold block">💡 Hosur Plant Policy</span>
                            <p className="text-[11px] leading-relaxed text-sky-800">
                                Employees must submit punches from within the 500m geofence radius. All punches are recorded immutably. For punch discrepancies, contact HR or Plant Administration.
                            </p>
                        </div>
                    </div>
                </div>
            </main>

            {/* Footer */}
            <footer className="py-6 border-t border-slate-200 bg-white text-center text-xs text-slate-500">
                <div className="max-w-6xl mx-auto px-4">
                    <span>BTL Precision Engineering • Hosur SIPCOT Industrial Area, Tamil Nadu</span>
                    <span className="block text-[11px] text-slate-400 mt-1">
                        High-Reliability Automotive & Aerospace Components Manufacturing
                    </span>
                </div>
            </footer>
        </div>
    );
}
