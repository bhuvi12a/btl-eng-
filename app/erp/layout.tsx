'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

interface NavItem {
    label: string;
    href: string;
    icon: string;
    phase: string;
    badge?: string;
}

const erpNavItems: NavItem[] = [
    // Core Operations
    { label: 'Dashboard', href: '/erp/dashboard', icon: '📊', phase: 'Core' },
    { label: 'User Roles & Access', href: '/erp/users', icon: '🔐', phase: 'Core' },
    { label: 'Audit Logs', href: '/erp/audit', icon: '📜', phase: 'Core' },

    // CRM & Sales
    { label: 'Customers (CRM)', href: '/erp/customers', icon: '👥', phase: 'Sales' },
    { label: 'Sales & Quotations', href: '/erp/sales', icon: '📈', phase: 'Sales' },

    // Supply Chain & Inventory
    { label: 'Suppliers', href: '/erp/suppliers', icon: '🏭', phase: 'Procurement' },
    { label: 'Purchase Orders', href: '/erp/purchase', icon: '🛒', phase: 'Procurement' },
    { label: 'Products & Parts', href: '/erp/products', icon: '📦', phase: 'Inventory' },
    { label: 'Inventory & Stock', href: '/erp/inventory', icon: '🏢', phase: 'Inventory' },

    // Financial & ERP Accounting Integration
    { label: 'TallyPrime Gateway', href: '/erp/settings/integrations/tally', icon: '⚡', phase: 'Integration' },
];

export default function ErpLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const router = useRouter();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [user, setUser] = useState<{ fullName: string; email: string; role: string; roleDisplay: string } | null>(null);

    const isLoginPage = pathname === '/erp/login';

    useEffect(() => {
        if (!isLoginPage) {
            fetch('/api/auth/me')
                .then((res) => res.json())
                .then((data) => {
                    if (data.authenticated && data.user) {
                        // Strict boundary: Employees are barred from ERP access
                        if (data.user.role === 'employee') {
                            router.replace('/attendance');
                            return;
                        }
                        setUser(data.user);
                    } else {
                        router.replace('/erp/login');
                    }
                })
                .catch(() => {});
        }
    }, [isLoginPage, router]);

    const handleLogout = async () => {
        try {
            await fetch('/api/auth/logout', { method: 'POST' });
        } catch {
            // Proceed anyway
        }
        router.push('/erp/login');
        router.refresh();
    };

    if (isLoginPage) {
        return <>{children}</>;
    }

    const filteredItems = erpNavItems.filter((item) =>
        item.label.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const activeItem = erpNavItems.find((item) => item.href === pathname);

    return (
        <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col lg:flex-row antialiased">
            {/* Mobile Header */}
            <header className="lg:hidden bg-white border-b border-slate-200/90 px-4 py-3 flex items-center justify-between sticky top-0 z-40 shadow-sm">
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => setSidebarOpen(!sidebarOpen)}
                        className="p-2 rounded-lg bg-slate-100 text-slate-600 hover:text-slate-900 hover:bg-slate-200 transition-colors"
                        aria-label="Toggle Navigation"
                    >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                        </svg>
                    </button>
                    <div className="flex items-center gap-2">
                        <Image
                            src="/btl-logo-cropped.png"
                            alt="BTL Engineering"
                            width={100}
                            height={48}
                            priority
                            className="h-5 w-auto object-contain"
                        />
                        <span className="font-bold text-slate-900 text-sm">ERP</span>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 font-semibold">
                        {user?.roleDisplay || 'Admin'}
                    </span>
                    <button
                        onClick={handleLogout}
                        className="text-xs px-2.5 py-1 rounded-lg bg-red-50 text-red-600 border border-red-200 hover:bg-red-100 font-medium"
                    >
                        Exit
                    </button>
                </div>
            </header>

            {/* Sidebar Navigation */}
            <aside
                className={`fixed inset-y-0 left-0 z-50 w-72 bg-white border-r border-slate-200/90 flex flex-col transform transition-transform duration-300 lg:static lg:translate-x-0 shadow-sm ${
                    sidebarOpen ? 'translate-x-0' : '-translate-x-full'
                }`}
            >
                {/* Brand / Logo */}
                <div className="p-5 border-b border-slate-100 flex items-center justify-between">
                    <Link href="/erp/dashboard" className="flex items-center gap-3">
                        <div className="bg-slate-50 p-1.5 rounded-lg border border-slate-100">
                            <Image
                                src="/btl-logo-cropped.png"
                                alt="BTL Engineering"
                                width={120}
                                height={58}
                                priority
                                className="h-6 w-auto object-contain"
                            />
                        </div>
                        <div>
                            <span className="text-sm font-bold text-slate-900 block leading-tight">ERP Portal</span>
                            <span className="text-[10px] text-blue-600 font-semibold tracking-wider uppercase">
                                Precision Engineering
                            </span>
                        </div>
                    </Link>
                    <button
                        onClick={() => setSidebarOpen(false)}
                        className="lg:hidden text-slate-400 hover:text-slate-700 p-1 rounded-md"
                    >
                        ✕
                    </button>
                </div>

                {/* Quick Search */}
                <div className="p-3 border-b border-slate-100">
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Quick search modules..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full px-3 py-2 pl-8 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-600 focus:bg-white transition-colors"
                        />
                        <span className="absolute left-2.5 top-2.5 text-xs text-slate-400">🔍</span>
                    </div>
                </div>

                {/* Navigation Items */}
                <nav className="flex-1 overflow-y-auto p-3 space-y-1 text-sm custom-scrollbar">
                    {filteredItems.map((item) => {
                        const isActive = pathname === item.href;
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                onClick={() => setSidebarOpen(false)}
                                className={`flex items-center justify-between px-3 py-2 rounded-xl transition-all ${
                                    isActive
                                        ? 'bg-blue-600 text-white font-semibold shadow-sm'
                                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900 font-medium'
                                }`}
                            >
                                <div className="flex items-center gap-2.5">
                                    <span className="text-base">{item.icon}</span>
                                    <span className="text-xs sm:text-sm">{item.label}</span>
                                </div>
                                <span
                                    className={`text-[10px] px-2 py-0.5 rounded-md font-mono ${
                                        isActive
                                            ? 'bg-blue-700 text-blue-50'
                                            : 'bg-slate-100 text-slate-500 border border-slate-200/80'
                                    }`}
                                >
                                    {item.phase}
                                </span>
                            </Link>
                        );
                    })}
                </nav>

                {/* Sidebar Footer User Info */}
                <div className="p-3.5 border-t border-slate-100 bg-slate-50/70">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5 min-w-0">
                            <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 border border-blue-200 flex items-center justify-center font-bold text-xs shrink-0">
                                {user?.fullName ? user.fullName[0].toUpperCase() : 'A'}
                            </div>
                            <div className="min-w-0">
                                <div className="text-xs font-semibold text-slate-900 truncate">
                                    {user?.fullName || 'Super Admin'}
                                </div>
                                <div className="text-[10px] text-slate-500 truncate">
                                    {user?.email || 'dinakaran@btlengg.com'}
                                </div>
                            </div>
                        </div>
                        <button
                            onClick={handleLogout}
                            title="Sign out"
                            className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                            </svg>
                        </button>
                    </div>
                </div>
            </aside>

            {/* Main Application Area */}
            <div className="flex-1 flex flex-col min-w-0 bg-slate-50">
                {/* Desktop Top Header Bar */}
                <header className="hidden lg:flex bg-white border-b border-slate-200/90 px-8 py-3.5 items-center justify-between sticky top-0 z-30 shadow-sm">
                    <div className="flex items-center gap-3">
                        <span className="text-xs text-slate-400 font-medium">BTL ERP</span>
                        <span className="text-slate-300">/</span>
                        <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                            {activeItem ? (
                                <>
                                    <span>{activeItem.icon}</span>
                                    <span>{activeItem.label}</span>
                                </>
                            ) : (
                                'Operations'
                            )}
                        </span>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-[11px] font-semibold text-emerald-700">
                            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
                            Hosur Plant Live
                        </div>
                        <span className="text-slate-300">|</span>
                        <Link
                            href="/"
                            target="_blank"
                            className="text-xs px-3 py-1.5 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 hover:text-slate-900 font-medium transition-colors flex items-center gap-1.5"
                        >
                            <span>Public Website</span>
                            <span className="text-[10px]">↗</span>
                        </Link>
                        <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
                            <span className="text-xs px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200 font-semibold">
                                {user?.roleDisplay || 'Admin'}
                            </span>
                        </div>
                    </div>
                </header>

                {/* Main Content Body */}
                <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
                    {children}
                </main>
            </div>
        </div>
    );
}
