'use client';

import Image from 'next/image';
import Link from 'next/link';

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
    icon: string;
    label: string;
    value: string;
    href?: string;
}

const quickLinks: FooterLink[] = [
    { label: 'Home', href: '#home' },
    { label: 'Company', href: '#about' }, // Updated
    { label: 'Services', href: '#services' }, // Updated
    { label: 'Industries', href: '#industries' }, // Updated
    { label: 'Certifications', href: '#certifications' }, // Updated
    { label: 'Contact', href: '#contact' }, // Updated
];

const serviceLinks: FooterLink[] = [
    { label: 'Precision Machining', href: '#' },
    { label: 'Sheet Metal Components', href: '#' },
    { label: 'Forged Components', href: '#' },
    { label: 'Design & Development', href: '#' },
];

const contactInfo: ContactInfo[] = [
    {
        icon: '',
        label: 'Address',
        value: 'Hosur, Tamil Nadu, India',
    },
    {
        icon: '',
        label: 'Email',
        value: 'info@btlengineering.com',
        href: 'mailto:info@btlengineering.com',
    },
    {
        icon: '',
        label: 'Phone',
        value: '+91 4344 123456', // Placeholder format
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

    return (
        <footer className="bg-slate-950 text-slate-300 border-t border-slate-800">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8">
                    {/* Company Info Column */}
                    <div className="lg:col-span-1">
                        <Link href="/" className="inline-block mb-6">
                            <div className="bg-white/5 rounded-lg p-2 inline-block">
                                <img
                                    src="/btl-logo-new.png"
                                    alt="BTL Engineering"
                                    className="h-auto w-auto max-w-[250px]"
                                />
                            </div>
                        </Link>

                        <p className="text-slate-400 text-sm leading-relaxed mb-6">
                            ISO 9001:2015 certified precision engineering company delivering excellence
                            in manufacturing for automotive, industrial, and aerospace sectors.
                        </p>

                        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-800 border border-slate-700">
                            <span className="text-sm"></span>
                            <span className="text-xs font-medium text-slate-300">ISO 9001:2015 Certified</span>
                        </div>
                    </div>

                    {/* Quick Links Column */}
                    <div>
                        <h4 className="text-white font-semibold text-base mb-6">Quick Links</h4>
                        <ul className="space-y-3 text-sm">
                            {quickLinks.map((link) => (
                                <li key={link.label}>
                                    <Link
                                        href={link.href}
                                        className="hover:text-sky-400 transition-colors duration-200"
                                    >
                                        {link.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Services Column */}
                    <div>
                        <h4 className="text-white font-semibold text-base mb-6">Our Services</h4>
                        <ul className="space-y-3 text-sm">
                            {serviceLinks.map((link) => (
                                <li key={link.label}>
                                    <Link
                                        href={link.href}
                                        className="hover:text-sky-400 transition-colors duration-200"
                                    >
                                        {link.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Contact Column */}
                    <div>
                        <h4 className="text-white font-semibold text-base mb-6">Contact Us</h4>
                        <ul className="space-y-4 text-sm">
                            {contactInfo.map((info) => (
                                <li key={info.label}>
                                    {info.href ? (
                                        <a
                                            href={info.href}
                                            className="flex items-start gap-3 hover:text-white transition-colors duration-200"
                                        >
                                            <span className="mt-0.5">{info.icon}</span>
                                            <span>{info.value}</span>
                                        </a>
                                    ) : (
                                        <div className="flex items-start gap-3">
                                            <span className="mt-0.5">{info.icon}</span>
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
                                        className="text-slate-400 hover:text-white transition-colors duration-200"
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
            <div className="border-t border-slate-800">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-slate-500">
                        <p className="text-center md:text-left">
                            © {currentYear} BTL Engineering. All rights reserved. | Made by <a href="https://booworks.co" target="_blank" rel="noopener noreferrer" className="hover:text-blue-400 transition-colors">booworks.co</a>
                        </p>
                        <div className="flex items-center gap-6">
                            <Link href="#" className="hover:text-slate-300 transition-colors">
                                Privacy Policy
                            </Link>
                            <Link href="#" className="hover:text-slate-300 transition-colors">
                                Terms of Service
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
}
