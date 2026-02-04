import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Contact Us | BTL Engineering',
    description: 'Get in touch with BTL Engineering for quotes, facility visits, and manufacturing inquiries.',
};

export default function ContactPage() {
    return (
        <main className="flex flex-col w-full pt-20">

            {/* ==================== HERO ==================== */}
            <section className="bg-gradient-to-r from-sky-100 to-blue-50 text-slate-900 py-20 px-6">
                <div className="max-w-7xl mx-auto text-center">
                    <h1 className="text-4xl md:text-5xl font-bold mb-6">
                        Get in <span className="text-blue-500">Touch</span>
                    </h1>
                    <p className="text-lg md:text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
                        Ready to start your next project? Contact our team for technical support, quotes, or to schedule a facility visit.
                    </p>
                </div>
            </section>

            {/* ==================== CONTACT FORM & INFO ==================== */}
            <section className="py-24 px-6 bg-white">
                <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16">
                    {/* Contact Form */}
                    <div className="bg-gray-50 p-8 md:p-10 rounded-2xl border border-gray-100 shadow-sm">
                        <h2 className="text-2xl font-bold text-gray-900 mb-6">Send us a Message</h2>
                        <form className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-2">First Name</label>
                                    <input type="text" id="firstName" className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all" placeholder="John" />
                                </div>
                                <div>
                                    <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-2">Last Name</label>
                                    <input type="text" id="lastName" className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all" placeholder="Doe" />
                                </div>
                            </div>

                            <div>
                                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">Work Email</label>
                                <input type="email" id="email" className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all" placeholder="john@company.com" />
                            </div>

                            <div>
                                <label htmlFor="company" className="block text-sm font-medium text-gray-700 mb-2">Company Name</label>
                                <input type="text" id="company" className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all" placeholder="Acme Corp" />
                            </div>

                            <div>
                                <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">Project Details</label>
                                <textarea id="message" rows={4} className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all" placeholder="Tell us about your manufacturing requirements..."></textarea>
                            </div>

                            <button type="submit" className="w-full bg-blue-600 text-white font-bold py-4 rounded-lg hover:bg-blue-700 transition-colors shadow-md">
                                Sent Inquiry
                            </button>
                        </form>
                    </div>

                    {/* Contact Info */}
                    <div>
                        <div className="mb-12">
                            <h2 className="text-2xl font-bold text-gray-900 mb-6">Headquarters & Facility</h2>
                            <div className="space-y-6">
                                <div className="flex items-start gap-4">
                                    <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center text-2xl flex-shrink-0"></div>
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
                                    <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center text-2xl flex-shrink-0"></div>
                                    <div>
                                        <h3 className="font-bold text-gray-900">Phone</h3>
                                        <p className="text-gray-600 mt-1">+91 4344 123456</p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center text-2xl flex-shrink-0"></div>
                                    <div>
                                        <h3 className="font-bold text-gray-900">Email</h3>
                                        <p className="text-gray-600 mt-1">info@btlengineering.com</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Map Placeholder */}
                        <div className="bg-gray-200 rounded-2xl h-[300px] w-full flex items-center justify-center border border-gray-300">
                            <div className="text-center text-gray-500">
                                <span className="text-4xl block mb-2"></span>
                                Google Maps Integration Placeholder
                            </div>
                        </div>
                    </div>
                </div>
            </section>

        </main>
    );
}
