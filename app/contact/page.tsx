import type { Metadata } from 'next';
import ContactForm from './ContactForm';

export const metadata: Metadata = {
    title: 'Contact BTL | Precision Engineering in Hosur, Tamil Nadu',
    description: 'Get in touch with BTL in Hosur, Tamil Nadu for automotive and aerospace components manufacturing, RFQs, and facility audits.',
};

export default function ContactPage() {
    return (
        <main className="flex flex-col w-full pt-20">

            {/* ==================== HERO ==================== */}
            <section className="bg-gradient-to-r from-sky-100 to-blue-50 text-slate-900 py-20 px-6">
                <div className="max-w-7xl mx-auto text-center">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-100/70 text-blue-800 text-sm font-semibold mb-4 border border-blue-200">
                        BTL • Established 2024 • Hosur, Tamil Nadu
                    </div>
                    <h1 className="text-4xl md:text-5xl font-bold mb-6">
                        Contact <span className="text-blue-600">BTL</span>
                    </h1>
                    <p className="text-lg md:text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
                        Ready to start your next automotive or aerospace component project? Contact our engineering team for technical support, quotes, or facility audits.
                    </p>
                </div>
            </section>

            {/* ==================== CONTACT FORM & INFO ==================== */}
            <section className="py-24 px-6 bg-white">
                <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16">
                    {/* Contact Form with Lead Generation & Email Notification */}
                    <ContactForm />

                    {/* Contact Info */}
                    <div>
                        <div className="mb-12">
                            <h2 className="text-2xl font-bold text-gray-900 mb-6">Headquarters & Facility</h2>
                            <div className="space-y-6">
                                <div className="flex items-start gap-4">
                                    <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
                                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-gray-900">Address</h3>
                                        <p className="text-gray-600 mt-1">
                                            Plot No. 123, SIPCOT Industrial Complex,<br />
                                            Phase II, Hosur,<br />
                                            Tamil Nadu 635109, India
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
                                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-gray-900">Phone</h3>
                                        <a href="tel:+918610354754" className="text-gray-600 hover:text-blue-600 mt-1 block font-medium transition-colors">
                                            +91 86103 54754
                                        </a>
                                    </div>
                                </div>

                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
                                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-gray-900">Email</h3>
                                        <a href="mailto:dinakaran@btlengg.com" className="text-gray-600 hover:text-blue-600 mt-1 block font-medium transition-colors">
                                            dinakaran@btlengg.com
                                        </a>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Map & Facility Overview */}
                        <div className="bg-sky-50 rounded-2xl h-[240px] w-full flex items-center justify-center border border-sky-100 mb-6">
                            <div className="text-center text-slate-500">
                                <div className="flex justify-center mb-3">
                                    <svg className="w-10 h-10 text-sky-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                    </svg>
                                </div>
                                <span className="font-semibold text-slate-700 block">Hosur Facility & HQ</span>
                                <span className="text-sm text-slate-500">Hosur, Tamil Nadu, India</span>
                            </div>
                        </div>

                        {/* Quick Facts Summary */}
                        <div className="bg-slate-50 rounded-xl p-5 border border-slate-200">
                            <h3 className="font-bold text-slate-900 text-sm uppercase tracking-wider mb-3">BTL Quick Facts</h3>
                            <div className="grid grid-cols-2 gap-3 text-xs">
                                <div>
                                    <span className="text-slate-400 block font-medium">Established</span>
                                    <span className="font-bold text-slate-800">2024</span>
                                </div>
                                <div>
                                    <span className="text-slate-400 block font-medium">Location</span>
                                    <span className="font-bold text-slate-800">Hosur, Tamil Nadu</span>
                                </div>
                                <div>
                                    <span className="text-slate-400 block font-medium">Products</span>
                                    <span className="font-bold text-slate-800">Auto & Aero Components</span>
                                </div>
                                <div>
                                    <span className="text-slate-400 block font-medium">Materials</span>
                                    <span className="font-bold text-slate-800">Steel, Aluminium, SS</span>
                                </div>
                                <div>
                                    <span className="text-slate-400 block font-medium">Capacity</span>
                                    <span className="font-bold text-slate-800">20+ Staff • 10+ Clients</span>
                                </div>
                                <div>
                                    <span className="text-slate-400 block font-medium">Direct Phone</span>
                                    <a href="tel:+918610354754" className="font-bold text-blue-600 hover:underline">8610354754</a>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

        </main>
    );
}
