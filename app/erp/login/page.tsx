'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function ErpLoginPage() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setSuccess(null);
        setLoading(true);

        try {
            const res = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });

            const data = await res.json();

            if (!res.ok || !data.success) {
                setError(data.error || 'Failed to authenticate. Please check your credentials.');
                setLoading(false);
                return;
            }

            setSuccess('Login successful! Redirecting to operations portal...');
            setTimeout(() => {
                router.push('/erp/dashboard');
                router.refresh();
            }, 600);
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'Network error. Please try again.');
            setLoading(false);
        }
    };

    return (
        <main className="min-h-screen bg-gradient-to-br from-sky-100 via-white to-sky-50 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 relative antialiased">
            <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
                <div className="flex justify-center mb-6">
                    <Link href="/" className="inline-block p-2 bg-white rounded-2xl shadow-sm border border-slate-200">
                        <Image
                            src="/btl-logo-cropped.png"
                            alt="BTL Engineering"
                            width={160}
                            height={78}
                            priority
                            className="h-10 w-auto object-contain"
                        />
                    </Link>
                </div>
                <h2 className="text-center text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
                    BTL ERP Portal Sign In
                </h2>
                <p className="mt-2 text-center text-xs text-slate-600">
                    Hosur Precision Manufacturing & Operations System
                </p>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10">
                <div className="bg-white py-8 px-6 sm:px-10 shadow-xl border border-slate-200/90 rounded-3xl">
                    <form className="space-y-5" onSubmit={handleSubmit}>
                        {error && (
                            <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
                                <span>⚠️</span>
                                <span>{error}</span>
                            </div>
                        )}

                        {success && (
                            <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs flex items-center gap-2">
                                <span>✓</span>
                                <span>{success}</span>
                            </div>
                        )}

                        <div>
                            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                                Enterprise Email Address
                            </label>
                            <input
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="name@btl.engineering"
                                className="w-full px-4 py-3 rounded-xl bg-white border border-slate-300 text-slate-900 placeholder-slate-400 text-xs focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition-colors"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                                Password
                            </label>
                            <input
                                type="password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••••••"
                                className="w-full px-4 py-3 rounded-xl bg-white border border-slate-300 text-slate-900 placeholder-slate-400 text-xs focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition-colors"
                            />
                        </div>

                        <div className="flex items-center justify-between text-xs">
                            <span className="text-slate-500 font-medium">Enterprise Security (RBAC)</span>
                            <span className="text-blue-600 font-semibold">Hosur Plant</span>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-3.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs uppercase tracking-wider shadow-sm transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50"
                        >
                            {loading ? (
                                <>
                                    <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
                                    </svg>
                                    <span>Verifying Credentials...</span>
                                </>
                            ) : (
                                <span>Sign In to ERP Portal</span>
                            )}
                        </button>
                    </form>

                    {/* Quick Access Info for Testing */}
                    <div className="mt-6 pt-5 border-t border-slate-100 text-[11px] text-slate-500 space-y-2">
                        <div className="font-semibold text-slate-700">Quick Testing Accounts:</div>
                        <div className="grid grid-cols-2 gap-2 font-mono">
                            <div
                                onClick={() => { setEmail('admin@btl.engineering'); setPassword('AdminPassword123!'); }}
                                className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 hover:bg-slate-100 cursor-pointer transition-colors"
                            >
                                <span className="block text-slate-900 font-bold">Admin</span>
                                <span className="text-[10px] text-blue-600">Click to autofill</span>
                            </div>
                            <div
                                onClick={() => { setEmail('manager@btl.engineering'); setPassword('ManagerPassword123!'); }}
                                className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 hover:bg-slate-100 cursor-pointer transition-colors"
                            >
                                <span className="block text-slate-900 font-bold">Manager</span>
                                <span className="text-[10px] text-blue-600">Click to autofill</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="mt-6 text-center">
                    <Link
                        href="/"
                        className="text-xs text-slate-600 hover:text-slate-900 font-medium inline-flex items-center gap-1 transition-colors"
                    >
                        <span>← Return to Public Website</span>
                    </Link>
                </div>
            </div>
        </main>
    );
}
