'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';

interface NavLink {
    label: string;
    href: string;
}

const navLinks: NavLink[] = [
    { label: 'Home', href: '/' },
    { label: 'Company', href: '/about' },
    { label: 'Services', href: '/services' },
    { label: 'Industries', href: '/industries' },
    { label: 'Testimonials', href: '/testimonials' },
    { label: 'Contact', href: '/contact' },
];

export default function Navbar() {
    const [isScrolled, setIsScrolled] = useState<boolean>(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);
    const pathname = usePathname();

    useEffect(() => {
        const handleScroll = (): void => {
            setIsScrolled(window.scrollY > 10);
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    if (pathname?.startsWith('/erp') || pathname === '/attendance') {
        return null;
    }

    const toggleMobileMenu = (): void => {
        setIsMobileMenuOpen(!isMobileMenuOpen);
    };

    const closeMobileMenu = (): void => {
        setIsMobileMenuOpen(false);
    };

    return (
        <header
            className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled
                ? 'bg-white/95 backdrop-blur-md border-b border-sky-100 shadow-sm'
                : 'bg-white border-b border-sky-100'
                }`}
        >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <nav className="flex items-center justify-between">
                    {/* Logo */}
                    <Link
                        href="/"
                        onClick={closeMobileMenu}
                        className="flex items-center py-1"
                    >
                        <Image
                            src="/btl-logo-cropped.png"
                            alt="BTL"
                            width={160}
                            height={78}
                            priority
                            className="w-[115px] sm:w-[130px] lg:w-[155px] h-auto object-contain"
                        />
                    </Link>

                    {/* Desktop Navigation */}
                    <div className="hidden lg:flex items-center gap-4">
                        {navLinks.map((link) => (
                            <Link
                                key={link.label}
                                href={link.href}
                                className={`text-sm font-medium px-3 py-1 rounded-md transition-all duration-200 border ${pathname === link.href
                                    ? 'bg-sky-50 text-sky-700 border-sky-200 shadow-sm'
                                    : 'text-slate-600 border-slate-100 bg-white hover:bg-gray-50 hover:text-sky-600 hover:border-sky-100 hover:shadow-sm'
                                    }`}
                            >
                                {link.label}
                            </Link>
                        ))}

                        {/* Phone Call Button */}
                        <a
                            href="tel:+918610354754"
                            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-700 hover:text-sky-600 px-3 py-2 rounded-md border border-slate-200 bg-slate-50 hover:bg-sky-50 hover:border-sky-200 transition-all shadow-sm"
                            title="Call BTL"
                        >
                            <svg className="w-3.5 h-3.5 text-sky-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                            </svg>
                            <span>8610354754</span>
                        </a>

                        {/* CTA Button */}
                        <Link
                            href="/contact"
                            className="btn-primary py-2.5 px-6 text-sm border-none bg-orange-600 hover:bg-orange-500 text-white shadow-lg shadow-orange-900/20"
                        >
                            Get a Quote
                        </Link>
                    </div>

                    {/* Mobile Menu Button */}
                    <button
                        onClick={toggleMobileMenu}
                        className="lg:hidden p-2 text-slate-600 hover:text-sky-600"
                        aria-label="Toggle menu"
                    >
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            {isMobileMenuOpen ? (
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            ) : (
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                            )}
                        </svg>
                    </button>
                </nav>

                {/* Mobile Menu */}
                {isMobileMenuOpen && (
                    <div className="lg:hidden border-t border-sky-100 py-4 bg-white absolute left-0 right-0 px-4 shadow-xl top-full">
                        <div className="flex flex-col gap-4">
                            {navLinks.map((link) => (
                                <Link
                                    key={link.label}
                                    href={link.href}
                                    onClick={closeMobileMenu}
                                    className={`font-medium text-base p-2 rounded-md hover:bg-sky-50 ${pathname === link.href ? 'text-sky-600 bg-sky-50' : 'text-slate-600'
                                        }`}
                                >
                                    {link.label}
                                </Link>
                            ))}
                            <a
                                href="tel:+918610354754"
                                onClick={closeMobileMenu}
                                className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg bg-sky-50 text-sky-700 font-semibold border border-sky-200 text-sm"
                            >
                                <svg className="w-4 h-4 text-sky-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                </svg>
                                <span>Call: +91 86103 54754</span>
                            </a>
                            <Link
                                href="/contact"
                                onClick={closeMobileMenu}
                                className="btn-primary w-full text-center justify-center bg-orange-600 border-none hover:bg-orange-500"
                            >
                                Get a Quote
                            </Link>
                        </div>
                    </div>
                )}
            </div>
        </header>
    );
}
