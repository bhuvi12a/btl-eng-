import Link from 'next/link';
import Image from 'next/image';

export default function Hero() {
    return (
        <section id="home" className="pt-52 pb-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-sky-100 via-white to-sky-50 min-h-[90vh] flex items-center border-b border-sky-100">
            <div className="max-w-7xl mx-auto w-full grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
                <div className="max-w-3xl">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-sky-900/40 border border-sky-500/30 text-sky-300 font-medium text-sm mb-6">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-sky-500"></span>
                        </span>
                        ISO 9001:2015 Certified Manufacturer
                    </div>

                    <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-slate-900 tracking-tight mb-8 leading-[1.1] sm:leading-[1.1]">
                        Precision Components for <span className="text-sky-500 block sm:inline">Global OEMs</span>
                    </h1>

                    <p className="text-xl text-slate-600 mb-10 leading-relaxed max-w-2xl">
                        Specializing in CNC machining, forging, and complex sheet metal fabrication for automotive, aerospace, and industrial sectors.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
                        <Link href="/services" className="btn-primary py-4 px-8 text-lg bg-orange-600 hover:bg-orange-500 border-none shadow-lg shadow-orange-900/20 text-center">
                            Explore Capabilities
                        </Link>
                        <Link href="/contact" className="px-8 py-4 bg-white text-blue-600 font-bold text-lg rounded-lg border border-blue-100 hover:bg-blue-50 transition-colors shadow-sm text-center">
                            Contact Sales
                        </Link>
                    </div>

                    <div className="flex flex-wrap gap-4 sm:gap-8 py-8 border-t border-gray-100 text-gray-500 text-sm font-medium">
                        <div className="flex items-center gap-2">
                            <span className="text-2xl"></span> Hosur, India
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-2xl"></span> OEM Grade
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-2xl"></span> Aerospace Ready
                        </div>
                    </div>
                </div>

                {/* Hero Image / Graphic */}
                <div className="hidden lg:block relative h-full min-h-[500px] bg-slate-900/50 rounded-2xl border border-white/10 overflow-hidden shadow-2xl">
                    <Image src="/automotive-parts.png" alt="Precision Automotive Parts" fill className="object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-transparent"></div>
                    <div className="absolute bottom-6 left-6 text-white font-medium">
                        <span className="block text-sm text-blue-400 mb-1">Featured Component</span>
                        Precision Transmission Gear
                    </div>
                </div>
            </div>
        </section>
    );
}
