import Link from 'next/link';
import Image from 'next/image';

export default function Hero() {
    return (
        <section id="home" className="pt-52 pb-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-sky-100 via-white to-sky-50 min-h-[90vh] flex items-center border-b border-sky-100">
            <div className="max-w-7xl mx-auto w-full grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
                <div className="max-w-3xl">
                    <div className="flex flex-wrap items-center gap-2 mb-6">
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 border border-blue-200 text-blue-800 font-medium text-sm shadow-sm">
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-600"></span>
                            </span>
                            Est. 2024 • Hosur, Tamil Nadu
                        </div>
                        <span className="inline-flex items-center px-3 py-1 rounded-full bg-orange-50 border border-orange-200 text-orange-700 font-semibold text-xs">
                            Automotive & Aerospace Specialist
                        </span>
                    </div>

                    <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-slate-900 tracking-tight mb-8 leading-[1.1] sm:leading-[1.1]">
                        Precision Components for <span className="text-sky-500 block sm:inline">Automotive & Aerospace</span>
                    </h1>

                    <p className="text-xl text-slate-600 mb-8 leading-relaxed max-w-2xl">
                        BTL manufactures mission-critical automotive and aerospace components using premium <strong>Steel, Aluminium, and Stainless Steel (SS)</strong> with advanced CNC, VMC milling, and drilling capabilities.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto mb-8">
                        <Link href="/services" className="btn-primary py-4 px-8 text-lg bg-orange-600 hover:bg-orange-500 border-none shadow-lg shadow-orange-900/20 text-center">
                            Explore Capabilities
                        </Link>
                        <Link href="/contact" className="px-8 py-4 bg-white text-blue-600 font-bold text-lg rounded-lg border border-blue-100 hover:bg-blue-50 transition-colors shadow-sm text-center">
                            Contact Sales
                        </Link>
                    </div>

                    {/* Quick Stats Badges */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 py-6 border-t border-sky-100 text-slate-700 text-sm">
                        <div className="bg-white/80 p-3 rounded-lg border border-sky-100 shadow-sm">
                            <span className="block text-2xl font-bold text-sky-600">2024</span>
                            <span className="text-xs text-slate-500">Established</span>
                        </div>
                        <div className="bg-white/80 p-3 rounded-lg border border-sky-100 shadow-sm">
                            <span className="block text-2xl font-bold text-sky-600">20+</span>
                            <span className="text-xs text-slate-500">Team Members</span>
                        </div>
                        <div className="bg-white/80 p-3 rounded-lg border border-sky-100 shadow-sm">
                            <span className="block text-2xl font-bold text-sky-600">10+</span>
                            <span className="text-xs text-slate-500">OEM Clients</span>
                        </div>
                        <div className="bg-white/80 p-3 rounded-lg border border-sky-100 shadow-sm">
                            <span className="block text-2xl font-bold text-sky-600">Hosur</span>
                            <span className="text-xs text-slate-500">Tamil Nadu, India</span>
                        </div>
                    </div>
                </div>

                {/* Hero Image / Graphic */}
                <div className="hidden lg:block relative h-full min-h-[500px] bg-slate-900/50 rounded-2xl border border-white/10 overflow-hidden shadow-2xl">
                    <Image src="/automotive-parts.png" alt="Precision Automotive & Aerospace Parts by BTL" fill className="object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-transparent"></div>
                    <div className="absolute bottom-6 left-6 text-white font-medium">
                        <span className="block text-sm text-blue-400 mb-1">Precision Manufacturing in Hosur</span>
                        Automotive & Aerospace Components
                    </div>
                </div>
            </div>
        </section>
    );
}
