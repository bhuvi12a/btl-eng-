import Link from 'next/link';
import Image from 'next/image';

export default function Hero() {
    return (
        <section id="home" className="pt-28 sm:pt-36 lg:pt-32 pb-12 lg:pb-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-sky-100 via-white to-sky-50 min-h-[85vh] flex items-center border-b border-sky-100">
            <div className="max-w-7xl mx-auto w-full grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">
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

                    <h1 className="text-3xl sm:text-5xl md:text-5xl lg:text-6xl font-bold text-slate-900 tracking-tight mb-6 leading-[1.15]">
                        Precision Components for <span className="text-sky-500 block sm:inline">Automotive & Aerospace</span>
                    </h1>

                    <p className="text-lg sm:text-xl text-slate-600 mb-8 leading-relaxed max-w-2xl">
                        BTL manufactures mission-critical automotive and aerospace components using premium <strong>Steel, Aluminium, and Stainless Steel (SS)</strong> with advanced CNC, VMC milling, and drilling capabilities.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto mb-8">
                        <Link href="/services" className="btn-primary py-3.5 px-8 text-base sm:text-lg bg-orange-600 hover:bg-orange-500 border-none shadow-lg shadow-orange-900/20 text-center">
                            Explore Capabilities
                        </Link>
                        <Link href="/contact" className="px-8 py-3.5 bg-white text-blue-600 font-bold text-base sm:text-lg rounded-lg border border-blue-100 hover:bg-blue-50 transition-colors shadow-sm text-center">
                            Contact Sales
                        </Link>
                    </div>

                    {/* Quick Stats Badges */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 py-4 border-t border-sky-100 text-slate-700 text-sm">
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
                <div className="w-full">
                    <div className="relative w-full aspect-[3/2] bg-[#1b1c20] rounded-2xl border border-slate-700/50 shadow-2xl overflow-hidden group">
                        <Image 
                            src="/btl-precision-parts.jpg" 
                            alt="Precision Machined Automotive & Aerospace Components by BTL" 
                            fill 
                            priority
                            className="object-contain transition-transform duration-500 group-hover:scale-[1.02]" 
                            sizes="(max-width: 1024px) 100vw, 50vw"
                        />
                    </div>
                    <div className="mt-3 flex items-center justify-between text-xs text-slate-500 px-1 font-medium">
                        <span className="inline-flex items-center gap-1.5 text-slate-700">
                            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
                            CNC Turned & Milled OEM Components
                        </span>
                        <span>Hosur, Tamil Nadu</span>
                    </div>
                </div>
            </div>
        </section>
    );
}
