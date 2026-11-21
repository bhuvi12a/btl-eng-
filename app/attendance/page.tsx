'use client';

import { useState, useEffect } from 'react';

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

    return Math.round(R * c);
}

interface PersonalAttendanceHistory {
    id: string;
    date: string;
    checkInTime: string | null;
    checkOutTime: string | null;
    hoursWorked: string;
    overtimeHours: string;
    status: string;
    gpsVerified: boolean;
}

export default function EmployeeAttendancePortalPage() {
    // Current Time & Date State
    const [currentTime, setCurrentTime] = useState<string>('');
    const [currentDate, setCurrentDate] = useState<string>('');

    // Authentication State
    const [authLoading, setAuthLoading] = useState<boolean>(true);
    const [currentUser, setCurrentUser] = useState<{
        id: string;
        fullName: string;
        email: string;
        role: string;
        employee?: {
            id: string;
            employeeCode: string;
            firstName: string;
            lastName: string;
            designation: string;
            department: string;
            shift: string;
        } | null;
    } | null>(null);

    // Login Form State (for unauthenticated attendance portal access)
    const [loginForm, setLoginForm] = useState({ username: '', password: '' });
    const [loginSubmitting, setLoginSubmitting] = useState(false);
    const [loginError, setLoginError] = useState('');

    // GPS & Geofence State
    const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
    const [accuracy, setAccuracy] = useState<number | null>(null);
    const [distance, setDistance] = useState<number | null>(null);
    const [isWithinGeofence, setIsWithinGeofence] = useState<boolean | null>(null);
    const [gpsError, setGpsError] = useState<string | null>(null);
    const [locating, setLocating] = useState<boolean>(true);

    // Punch & UI Feedback
    const [submitting, setSubmitting] = useState<boolean>(false);
    const [toast, setToast] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

    // Today's Punch & Personal History
    const [todayPunch, setTodayPunch] = useState<{
        checkInTime: string | null;
        checkOutTime: string | null;
        hoursWorked?: string;
        status?: string;
        gpsVerified: boolean;
        date: string;
    } | null>(null);
    const [history, setHistory] = useState<PersonalAttendanceHistory[]>([]);
    const [showHistoryModal, setShowHistoryModal] = useState(false);

    const showToast = (text: string, type: 'success' | 'error' = 'success') => {
        setToast({ text, type });
        setTimeout(() => setToast(null), 5000);
    };

    // Live Clock
    useEffect(() => {
        const updateClock = () => {
            const now = new Date();
            setCurrentTime(now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true }));
            setCurrentDate(now.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }));
        };
        updateClock();
        const timer = setInterval(updateClock, 1000);
        return () => clearInterval(timer);
    }, []);

    // Check Current User Auth
    const checkAuth = async () => {
        setAuthLoading(true);
        try {
            const res = await fetch('/api/auth/me');
            const data = await res.json();
            if (data.authenticated && data.user) {
                setCurrentUser(data.user);
                fetchPersonalAttendance();
            } else {
                setCurrentUser(null);
            }
        } catch {
            setCurrentUser(null);
        } finally {
            setAuthLoading(false);
        }
    };

    const fetchPersonalAttendance = async () => {
        try {
            const todayStr = new Date().toISOString().split('T')[0];
            const res = await fetch('/api/attendance');
            const data = await res.json();
            if (data.success && data.records) {
                setHistory(data.records);
                const todayRec = data.records.find((r: any) => r.date === todayStr);
                if (todayRec) {
                    setTodayPunch(todayRec);
                }
            }
        } catch (e) {
            console.error('Failed to fetch personal attendance records:', e);
        }
    };

    useEffect(() => {
        checkAuth();
    }, []);

    // Fetch GPS Location
    const fetchLocation = () => {
        setLocating(true);
        setGpsError(null);
        if (!navigator.geolocation) {
            setGpsError('Geolocation is not supported by your browser.');
            setLocating(false);
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (pos) => {
                const lat = pos.coords.latitude;
                const lng = pos.coords.longitude;
                const acc = Math.round(pos.coords.accuracy);
                setLocation({ lat, lng });
                setAccuracy(acc);

                const dist = calculateDistanceMeters(lat, lng, HOSUR_LAT, HOSUR_LNG);
                setDistance(dist);
                setIsWithinGeofence(dist <= GEOFENCE_RADIUS_METERS);
                setLocating(false);
            },
            (err) => {
                setGpsError(err.message || 'Unable to retrieve your location.');
                setLocating(false);
            },
            { enableHighAccuracy: true, timeout: 12000, maximumAge: 0 }
        );
    };

    useEffect(() => {
        if (currentUser) {
            fetchLocation();
        }
    }, [currentUser]);

    // Handle Employee Login
    const handleEmployeeLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoginSubmitting(true);
        setLoginError('');

        try {
            const res = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    username: loginForm.username.trim(),
                    email: loginForm.username.trim(),
                    password: loginForm.password,
                }),
            });
            const data = await res.json();
            if (data.success) {
                await checkAuth();
            } else {
                setLoginError(data.error || 'Invalid employee username or password.');
            }
        } catch {
            setLoginError('Failed to connect to authentication server.');
        } finally {
            setLoginSubmitting(false);
        }
    };

    // Handle Employee Logout
    const handleLogout = async () => {
        try {
            await fetch('/api/auth/logout', { method: 'POST' });
        } catch {}
        setCurrentUser(null);
    };

    // Fast One-Tap GPS Punch (No Video Delay)
    const triggerPunch = async (punchType: 'check_in' | 'check_out') => {
        setSubmitting(true);

        try {
            const payload = {
                punchType,
                latitude: location ? location.lat : null,
                longitude: location ? location.lng : null,
                gpsAccuracy: accuracy || null,
            };

            const res = await fetch('/api/attendance/punch', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            const data = await res.json();
            if (data.success) {
                showToast(
                    `${punchType === 'check_in' ? 'Check-In' : 'Check-Out'} logged at ${data.record.time}!`,
                    'success'
                );
                fetchPersonalAttendance();
            } else {
                showToast(data.error || 'Attendance punch rejected.', 'error');
            }
        } catch {
            showToast('Network error while recording punch.', 'error');
        } finally {
            setSubmitting(false);
        }
    };

    // Unauthenticated View: Direct Employee Login
    if (!authLoading && !currentUser) {
        return (
            <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-center items-center p-4">
                <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl space-y-6">
                    <div className="text-center space-y-2">
                        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-blue-600/20 text-blue-400 text-2xl border border-blue-500/30">
                            ⏱️
                        </div>
                        <h1 className="text-xl font-bold text-white tracking-wide">BTL Employee Attendance Portal</h1>
                        <p className="text-xs text-slate-400">
                            One-tap plant punch kiosk with GPS location verification.
                        </p>
                    </div>

                    {loginError && (
                        <div className="p-3.5 rounded-2xl bg-rose-950/80 border border-rose-800 text-rose-200 text-xs text-center font-medium">
                            {loginError}
                        </div>
                    )}

                    <form onSubmit={handleEmployeeLogin} className="space-y-4 text-xs">
                        <div>
                            <label className="block text-slate-300 font-semibold mb-1.5">Employee ID or Email</label>
                            <input
                                type="text"
                                required
                                value={loginForm.username}
                                onChange={(e) => setLoginForm({ ...loginForm, username: e.target.value })}
                                placeholder="e.g. BTL-TEST-3574 or username"
                                className="w-full bg-slate-800/90 border border-slate-700 rounded-2xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 text-sm font-medium"
                            />
                        </div>

                        <div>
                            <label className="block text-slate-300 font-semibold mb-1.5">Password</label>
                            <input
                                type="password"
                                required
                                value={loginForm.password}
                                onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                                placeholder="••••••••"
                                className="w-full bg-slate-800/90 border border-slate-700 rounded-2xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 text-sm"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loginSubmitting}
                            className="w-full py-3.5 rounded-2xl bg-blue-600 hover:bg-blue-500 active:scale-[0.99] text-white font-bold text-sm shadow-lg shadow-blue-900/40 transition-all disabled:opacity-50"
                        >
                            {loginSubmitting ? 'Verifying Credentials...' : 'Sign In to Attendance Portal'}
                        </button>
                    </form>

                    <div className="pt-4 border-t border-slate-800 text-center text-[11px] text-slate-500">
                        Employees: Contact your Plant Administrator or HR Manager to obtain or reset your portal credentials.
                    </div>
                </div>
            </div>
        );
    }

    const employeeData = currentUser?.employee;
    const displayName = employeeData ? `${employeeData.firstName} ${employeeData.lastName}` : currentUser?.fullName || 'Employee';
    const displayCode = employeeData?.employeeCode || `ID-${currentUser?.id.substring(0, 8).toUpperCase()}`;
    const displayShift = employeeData?.shift || 'General (08:30 - 17:30)';

    return (
        <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col antialiased selection:bg-blue-600 selection:text-white">
            {/* Toast Feedback */}
            {toast && (
                <div
                    className={`fixed top-4 left-1/2 -translate-x-1/2 z-50 px-5 py-3 rounded-2xl text-xs font-bold shadow-2xl flex items-center gap-2 animate-in fade-in slide-in-from-top-4 duration-300 ${
                        toast.type === 'success'
                            ? 'bg-emerald-600 text-white border border-emerald-400'
                            : 'bg-rose-600 text-white border border-rose-400'
                    }`}
                >
                    <span>{toast.type === 'success' ? '✓' : '⚠️'}</span>
                    <span>{toast.text}</span>
                </div>
            )}

            {/* Portal Header */}
            <header className="px-4 py-3 border-b border-slate-800/80 bg-slate-900/60 backdrop-blur-md sticky top-0 z-40 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-blue-600 flex items-center justify-center font-black text-white text-base shadow-md shadow-blue-900/40">
                        BTL
                    </div>
                    <div>
                        <div className="font-extrabold text-base tracking-wide text-white flex items-center gap-2">
                            <span>{displayName}</span>
                            <span className="font-mono text-xs font-bold text-blue-400 bg-blue-950/80 px-2.5 py-0.5 rounded-full border border-blue-800">
                                {displayCode}
                            </span>
                        </div>
                        <div className="text-xs text-slate-400 flex items-center gap-2 mt-0.5">
                            <span>🕒 Shift: {displayShift}</span>
                            {employeeData?.designation && <span>• {employeeData.designation}</span>}
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setShowHistoryModal(true)}
                        className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold border border-slate-700 transition-colors flex items-center gap-1.5"
                    >
                        <span>📜</span>
                        <span className="hidden sm:inline">My History</span>
                    </button>
                    <button
                        onClick={handleLogout}
                        className="px-3 py-1.5 rounded-xl bg-rose-950/80 hover:bg-rose-900 text-rose-300 text-xs font-semibold border border-rose-800 transition-colors flex items-center gap-1"
                    >
                        <span>Sign Out</span>
                    </button>
                </div>
            </header>

            {/* Main Punch Kiosk Area */}
            <main className="flex-1 max-w-lg w-full mx-auto p-4 flex flex-col justify-center gap-5">
                {/* Real-time Clock Card */}
                <div className="bg-slate-900/90 border border-slate-800/80 rounded-3xl p-6 shadow-2xl text-center space-y-2">
                    <div className="text-4xl sm:text-5xl font-black text-white font-mono tracking-tight">{currentTime || '--:--:--'}</div>
                    <div className="text-sm text-slate-400 font-medium">{currentDate || 'Loading date...'}</div>
                </div>

                {/* GPS Geofence Location Card */}
                <div className="bg-slate-900/90 border border-slate-800/80 rounded-3xl p-6 shadow-2xl space-y-3">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <span className="text-xl">📍</span>
                            <div>
                                <div className="text-xs font-semibold text-slate-400">Hosur Plant GPS Verification</div>
                                <div className="text-sm font-bold text-white">SIPCOT Industrial Complex</div>
                            </div>
                        </div>

                        {/* Geofence Status Badge */}
                        <div>
                            {locating ? (
                                <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-amber-950/70 text-amber-300 border border-amber-800 animate-pulse">
                                    <span className="w-2 h-2 rounded-full bg-amber-400" />
                                    Locating...
                                </span>
                            ) : isWithinGeofence ? (
                                <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-emerald-950/90 text-emerald-300 border border-emerald-600">
                                    <span className="w-2 h-2 rounded-full bg-emerald-400" />
                                    Inside Plant (≤500m)
                                </span>
                            ) : (
                                <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-rose-950/90 text-rose-300 border border-rose-700">
                                    <span className="w-2 h-2 rounded-full bg-rose-400" />
                                    Outside Plant ({distance ? `${distance}m away` : 'No GPS'})
                                </span>
                            )}
                        </div>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-slate-800/80 text-xs text-slate-400 font-mono">
                        <div>
                            {location ? (
                                <span>GPS: {location.lat.toFixed(4)}, {location.lng.toFixed(4)}</span>
                            ) : (
                                <span>GPS coordinates acquiring...</span>
                            )}
                        </div>
                        {accuracy && (
                            <div>Accuracy: ±{accuracy}m</div>
                        )}
                    </div>

                    {gpsError && (
                        <div className="p-3 rounded-2xl bg-amber-950/40 border border-amber-800/60 text-xs text-amber-200">
                            ⚠️ {gpsError}
                        </div>
                    )}
                </div>

                {/* Large Check-In and Check-Out Action Buttons */}
                <div className="grid grid-cols-2 gap-4 pt-2">
                    <button
                        type="button"
                        disabled={submitting}
                        onClick={() => triggerPunch('check_in')}
                        className="py-6 px-4 rounded-3xl bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white font-black text-base shadow-xl shadow-emerald-950/50 flex flex-col items-center justify-center gap-2 transition-all disabled:opacity-40 disabled:pointer-events-none"
                    >
                        <span className="text-3xl">🟢</span>
                        <span>CHECK IN</span>
                        <span className="text-[11px] font-normal text-emerald-100 font-sans">Start Shift</span>
                    </button>

                    <button
                        type="button"
                        disabled={submitting}
                        onClick={() => triggerPunch('check_out')}
                        className="py-6 px-4 rounded-3xl bg-rose-600 hover:bg-rose-500 active:scale-95 text-white font-black text-base shadow-xl shadow-rose-950/50 flex flex-col items-center justify-center gap-2 transition-all disabled:opacity-40 disabled:pointer-events-none"
                    >
                        <span className="text-3xl">🔴</span>
                        <span>CHECK OUT</span>
                        <span className="text-[11px] font-normal text-rose-100 font-sans">End Shift</span>
                    </button>
                </div>

                {/* Today's Punch Status Badge */}
                {todayPunch ? (
                    <div className="p-4 rounded-3xl bg-slate-900 border border-slate-800 text-xs text-center font-mono">
                        <span className="text-slate-400">Today: </span>
                        <span className="text-emerald-400 font-bold">In: {todayPunch.checkInTime || '—'}</span>
                        <span className="text-slate-600"> | </span>
                        <span className="text-blue-400 font-bold">Out: {todayPunch.checkOutTime || 'Pending'}</span>
                        {todayPunch.gpsVerified && (
                            <span className="text-indigo-400 font-semibold ml-2">📍 GPS Verified</span>
                        )}
                    </div>
                ) : (
                    <div className="p-4 rounded-3xl bg-slate-900/60 border border-slate-800/60 text-xs text-slate-500 text-center">
                        No punch recorded yet today. Tap Check-In to start your shift.
                    </div>
                )}
            </main>

            {/* Modal: Read-Only Personal Attendance History */}
            {showHistoryModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
                    <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-lg max-h-[80vh] flex flex-col overflow-hidden shadow-2xl">
                        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
                            <div>
                                <h3 className="font-bold text-white text-sm">Personal Attendance History</h3>
                                <p className="text-[11px] text-slate-400">Past punch records for {displayName}</p>
                            </div>
                            <button
                                onClick={() => setShowHistoryModal(false)}
                                className="text-slate-400 hover:text-white text-base p-1"
                            >
                                ✕
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-4 space-y-2">
                            {history.length === 0 ? (
                                <div className="py-8 text-center text-xs text-slate-500">No past punch records found.</div>
                            ) : (
                                history.map((rec) => (
                                    <div
                                        key={rec.id}
                                        className="p-3 rounded-2xl bg-slate-800/60 border border-slate-700/60 flex items-center justify-between text-xs"
                                    >
                                        <div>
                                            <div className="font-bold text-white">{rec.date}</div>
                                            <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                                                In: {rec.checkInTime || '—'} | Out: {rec.checkOutTime || '—'}
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <span
                                                className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                                    rec.status === 'present'
                                                        ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                                                        : 'bg-amber-950 text-amber-300 border border-amber-800'
                                                }`}
                                            >
                                                {rec.status.toUpperCase()}
                                            </span>
                                            {rec.gpsVerified && (
                                                <div className="text-[10px] text-indigo-400 mt-1">📍 Geofence OK</div>
                                            )}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>

                        <div className="p-3 border-t border-slate-800 text-right">
                            <button
                                onClick={() => setShowHistoryModal(false)}
                                className="px-4 py-1.5 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700 text-xs font-semibold"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Privacy & Retention Footer */}
            <footer className="py-3 text-center text-[10px] text-slate-600 border-t border-slate-900">
                BTL Precision Machining • Fast GPS Location Punch • Authoritative Server Timestamps
            </footer>
        </div>
    );
}
