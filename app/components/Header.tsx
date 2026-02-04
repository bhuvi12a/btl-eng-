'use client';

import Image from 'next/image';
import Link from 'next/link';
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
    { label: 'Contact', href: '/contact' },
];

export default function Header() {
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

    const toggleMobileMenu = (): void => {
        setIsMobileMenuOpen(!isMobileMenuOpen);
    };

    const closeMobileMenu = (): void => {
        setIsMobileMenuOpen(false);
    };

    return (
        <header
            className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled
                ? 'bg-white/80 backdrop-blur-md border-b border-sky-100 shadow-sm py-2'
                : 'bg-transparent border-transparent py-4'
                }`}
        >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <nav className="flex items-center justify-between py-4 min-h-20">
                    {/* Logo */}
                    <Link
                        href="/"
                        onClick={closeMobileMenu}
                        className="flex items-center"
                    >
                        <div>
                            <img
                                src="/btl-logo-new.png"
                                alt="BTL Engineering"
                                className="h-full w-auto object-contain max-h-28"
                            />
                        </div>
                    </Link>

                    {/* Desktop Navigation */}
                    <div className="hidden lg:flex items-center gap-8">
                        {navLinks.map((link) => (
                            <Link
                                key={link.label}
                                href={link.href}
                                className={`text-sm font-medium transition-colors duration-200 ${pathname === link.href ? 'text-sky-600' : 'text-slate-600 hover:text-sky-600'
                                    }`}
                            >
                                {link.label}
                            </Link>
                        ))}

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
