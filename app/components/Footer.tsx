'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface FooterLink {
    label: string;
    href: string;
}

interface SocialLink {
    name: string;
    href: string;
    icon: React.ReactNode;
}

interface ContactInfo {
    icon: React.ReactNode;
    label: string;
    value: string;
    href?: string;
}

const quickLinks: FooterLink[] = [
    { label: 'Home', href: '/' },
    { label: 'Company', href: '/about' },
    { label: 'Services', href: '/services' },
    { label: 'Industries', href: '/industries' },
    { label: 'Testimonials', href: '/testimonials' },
    { label: 'Contact', href: '/contact' },
];

const serviceLinks: FooterLink[] = [
    { label: 'CNC & VMC Machining', href: '/services' },
    { label: 'In-house Tool Room', href: '/services' },
    { label: 'Engineering Design', href: '/services' },
    { label: 'Complete Component Inspection', href: '/services' },
];

const contactInfo: ContactInfo[] = [
    {
        icon: (
            <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
        ),
        label: 'Address',
        value: 'Hosur, Tamil Nadu, India',
    },
    {
        icon: (
            <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
        ),
        label: 'Email',
        value: 'dinakaran@btlengg.com',
        href: 'mailto:dinakaran@btlengg.com',
    },
    {
        icon: (
            <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
            </svg>
        ),
        label: 'Phone',
        value: '+91 86103 54754',
        href: 'tel:+918610354754',
    },
];

const socialLinks: SocialLink[] = [
    {
        name: 'LinkedIn',
        href: '#',
        icon: (
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
            </svg>
        ),
    },
    {
        name: 'Twitter',
        href: '#',
        icon: (
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
            </svg>
        ),
    },
];

export default function Footer() {
    const currentYear = new Date().getFullYear();
    const pathname = usePathname();

    if (pathname?.startsWith('/erp') || pathname === '/attendance') {
        return null;
    }

    return (
        <footer className="bg-orange-50 text-slate-600 border-t border-orange-100">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8">
                    {/* Company Info Column */}
                    <div className="lg:col-span-1">
                        <Link href="/" className="inline-block mb-6">
                            <div className="inline-block">
                                <Image
                                    src="/btl-logo-cropped.png"
                                    alt="BTL"
                                    width={160}
                                    height={78}
                                    className="h-auto w-[130px] lg:w-[160px]"
                                    style={{ mixBlendMode: 'multiply' }}
                                />
                            </div>
                        </Link>

                        <p className="text-slate-600 text-sm leading-relaxed mb-6">
                            Established in 2024 in Hosur, Tamil Nadu. BTL specializes in manufacturing precision automotive and aerospace components in Steel, Aluminium, and Stainless Steel (SS).
                        </p>

                        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white border border-orange-200 shadow-sm">
                            <svg className="w-4 h-4 text-orange-600" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                            <span className="text-xs font-medium text-orange-800">Est. 2024 • Hosur, Tamil Nadu</span>
                        </div>
                    </div>

                    {/* Quick Links Column */}
                    <div>
                        <h4 className="text-slate-900 font-bold text-base mb-6">Quick Links</h4>
                        <ul className="space-y-3 text-sm">
                            {quickLinks.map((link) => (
                                <li key={link.label}>
                                    <Link
                                        href={link.href}
                                        className="text-slate-600 hover:text-orange-600 transition-colors duration-200"
                                    >
                                        {link.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Services Column */}
                    <div>
                        <h4 className="text-slate-900 font-bold text-base mb-6">Our Services</h4>
                        <ul className="space-y-3 text-sm">
                            {serviceLinks.map((link) => (
                                <li key={link.label}>
                                    <Link
                                        href={link.href}
                                        className="text-slate-600 hover:text-orange-600 transition-colors duration-200"
                                    >
                                        {link.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Contact Column */}
                    <div>
                        <h4 className="text-slate-900 font-bold text-base mb-6">Contact Us</h4>
                        <ul className="space-y-4 text-sm">
                            {contactInfo.map((info) => (
                                <li key={info.label}>
                                    {info.href ? (
                                        <a
                                            href={info.href}
                                            className="flex items-start gap-3 text-slate-600 hover:text-orange-600 transition-colors duration-200"
                                        >
                                            <span className="mt-0.5 text-orange-500">{info.icon}</span>
                                            <span>{info.value}</span>
                                        </a>
                                    ) : (
                                        <div className="flex items-start gap-3 text-slate-600">
                                            <span className="mt-0.5 text-orange-500">{info.icon}</span>
                                            <span>{info.value}</span>
                                        </div>
                                    )}
                                </li>
                            ))}
                        </ul>

                        {/* Social Links */}
                        <div className="mt-8">
                            <div className="flex items-center gap-4">
                                {socialLinks.map((social) => (
                                    <a
                                        key={social.name}
                                        href={social.href}
                                        aria-label={social.name}
                                        className="text-slate-400 hover:text-orange-600 transition-colors duration-200"
                                    >
                                        {social.icon}
                                    </a>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Bottom Bar */}
            <div className="border-t border-orange-200 bg-orange-100/50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-slate-500">
                        <p className="text-center md:text-left">
                            © {currentYear} BTL. All rights reserved.
                        </p>
                        <div className="flex items-center gap-6">
                            <Link href="/privacy" className="hover:text-orange-600 transition-colors">
                                Privacy Policy
                            </Link>
                            <Link href="/terms" className="hover:text-orange-600 transition-colors">
                                Terms and Conditions
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
}
