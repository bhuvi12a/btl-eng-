import type { Metadata } from 'next';
import Image from 'next/image';

export const metadata: Metadata = {
    title: 'Industries Served | BTL Engineering',
    description: 'Serving Automotive, Aerospace, and Industrial Equipment OEMs with high-precision components.',
};

export default function IndustriesPage() {
    return (
        <main className="flex flex-col w-full pt-20">

            {/* ==================== HERO ==================== */}
            <section className="bg-gradient-to-r from-sky-100 to-blue-50 text-slate-900 py-16 px-6 border-b border-sky-100">
                <div className="max-w-7xl mx-auto text-center">
                    <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
                        Industries <span className="text-blue-500">We Serve</span>
                    </h1>
                    <p className="text-lg md:text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
                        Delivering critical performance components to sectors where quality is non-negotiable.
                    </p>
                </div>
            </section>

            {/* ==================== AUTOMOTIVE ==================== */}
            <section className="py-16 md:py-24 px-6 bg-white">
                <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
                    <div>
                        <div className="inline-flex mb-4 px-3 py-1 rounded-full bg-sky-50 text-sky-700 text-sm font-semibold border border-sky-200">
                            Tier-1 & OEM
                        </div>
                        <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-6">Automotive</h2>
                        <p className="text-lg text-slate-600 mb-6 leading-relaxed">
                            We are a trusted partner for automotive OEMs and Tier-1 suppliers, manufacturing high-volume precision parts for engines, transmissions, and chassis systems.
                        </p>
                        <div className="bg-sky-50 p-6 rounded-xl border border-sky-100">
                            <h3 className="font-bold text-slate-900 mb-3">Key Components:</h3>
                            <ul className="grid grid-cols-2 gap-2 text-slate-600 text-sm">
                                <li className="flex items-center gap-2">Engine Brackets</li>
                                <li className="flex items-center gap-2">Transmission Gears</li>
                                <li className="flex items-center gap-2">Chassis Fittings</li>
                                <li className="flex items-center gap-2">Hydraulic Valves</li>
                            </ul>
                        </div>
                    </div>
                    <div className="relative aspect-[4/3] rounded-2xl overflow-hidden border border-white/10 shadow-2xl">
                        <Image src="/automotive-parts.png" alt="Automotive Components" fill className="object-cover" />
                    </div>
                </div>
            </section>

            {/* ==================== AEROSPACE ==================== */}
            <section className="py-16 md:py-24 px-6 bg-sky-50 border-y border-sky-200">
                <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
                    <div className="order-2 lg:order-1 relative aspect-[4/3] rounded-2xl overflow-hidden border border-white/10 shadow-2xl">
                        <Image src="/aerospace-parts.png" alt="Aerospace Components" fill className="object-cover" />
                    </div>
                    <div className="order-1 lg:order-2">
                        <div className="inline-flex mb-4 px-3 py-1 rounded-full bg-sky-50 text-sky-700 text-sm font-semibold border border-sky-200">
                            Precision Critical
                        </div>
                        <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-6">Aerospace</h2>
                        <p className="text-lg text-slate-600 mb-6 leading-relaxed">
                            Our aerospace manufacturing division adheres to the strictest quality standards, producing lightweight, high-strength structural components and fluid control systems.
                        </p>
                        <div className="bg-white p-6 rounded-xl border border-sky-100">
                            <h3 className="font-bold text-slate-900 mb-3">Key Components:</h3>
                            <ul className="grid grid-cols-2 gap-2 text-slate-600 text-sm">
                                <li className="flex items-center gap-2">Structural Fittings</li>
                                <li className="flex items-center gap-2">Actuator Parts</li>
                                <li className="flex items-center gap-2">Cabin Interiors</li>
                                <li className="flex items-center gap-2">Sensor Housings</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </section>

            {/* ==================== INDUSTRIAL EQUIPMENT ==================== */}
            <section className="py-16 md:py-24 px-6 bg-white">
                <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
                    <div>
                        <div className="inline-flex mb-4 px-3 py-1 rounded-full bg-sky-50 text-sky-700 text-sm font-semibold border border-sky-200">
                            Heavy Duty
                        </div>
                        <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-6">Industrial Equipment</h2>
                        <p className="text-lg text-slate-600 mb-6 leading-relaxed">
                            Supporting manufacturers of heavy machinery, earthmoving equipment, and industrial automation with durable, wear-resistant components.
                        </p>
                        <div className="bg-sky-50 p-6 rounded-xl border border-sky-100">
                            <h3 className="font-bold text-slate-900 mb-3">Key Components:</h3>
                            <ul className="grid grid-cols-2 gap-2 text-slate-600 text-sm">
                                <li className="flex items-center gap-2">Hydraulic Cylinders</li>
                                <li className="flex items-center gap-2">Pump Housings</li>
                                <li className="flex items-center gap-2">Wear Parts</li>
                                <li className="flex items-center gap-2">Automation Drives</li>
                            </ul>
                        </div>
                    </div>
                    <div className="relative aspect-[4/3] rounded-2xl overflow-hidden border border-white/10 shadow-2xl">
                        <Image src="/factory-floor.png" alt="Industrial Manufacturing" fill className="object-cover" />
                    </div>
                </div>
            </section>

            {/* ==================== CTA ==================== */}
            <section className="py-16 px-6 bg-sky-600 border-t border-sky-100">
                <div className="max-w-4xl mx-auto text-center text-white">
                    <h2 className="text-3xl font-bold mb-4">Discuss Your Project</h2>
                    <p className="text-blue-100 mb-8 max-w-2xl mx-auto">
                        Our engineering team is ready to review your specifications and provide a competitive proposal.
                    </p>
                    <a href="/contact" className="inline-block bg-white text-blue-700 font-bold py-4 px-10 rounded-lg hover:bg-gray-50 transition-colors shadow-lg">
                        Contact Sales
                    </a>
                </div>
            </section>

        </main>
    );
}
