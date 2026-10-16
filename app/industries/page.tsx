import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';

export const metadata: Metadata = {
    title: 'Products & Industries | BTL Automotive & Aerospace',
    description: 'BTL in Hosur, Tamil Nadu manufactures high-precision Automotive and Aerospace components using Steel, Aluminium, and Stainless Steel (SS).',
};

export default function IndustriesPage() {
    return (
        <main className="flex flex-col w-full pt-20">

            {/* ==================== HERO ==================== */}
            <section className="bg-gradient-to-r from-sky-100 to-blue-50 text-slate-900 py-16 px-6 border-b border-sky-100">
                <div className="max-w-7xl mx-auto text-center">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-100/70 text-blue-800 text-sm font-semibold mb-4 border border-blue-200">
                        BTL • Products Manufactured • Hosur, Tamil Nadu
                    </div>
                    <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
                        Automotive & Aerospace <span className="text-blue-600">Components</span>
                    </h1>
                    <p className="text-lg md:text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
                        Precision-engineered parts manufactured in <strong>Steel, Aluminium, and Stainless Steel (SS)</strong> for global OEMs and Tier-1 suppliers.
                    </p>
                </div>
            </section>

            {/* ==================== AUTOMOTIVE ==================== */}
            <section className="py-16 md:py-24 px-6 bg-white">
                <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
                    <div>
                        <div className="inline-flex mb-4 px-3 py-1 rounded-full bg-sky-50 text-sky-700 text-sm font-semibold border border-sky-200">
                            Primary Product Sector
                        </div>
                        <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-6">Automotive Components</h2>
                        <p className="text-lg text-slate-600 mb-6 leading-relaxed">
                            BTL is a trusted partner for automotive OEMs, supplying high-volume precision parts in Steel, Aluminium, and Stainless Steel (SS) for powertrain, transmission, and chassis applications.
                        </p>
                        <div className="bg-sky-50 p-6 rounded-xl border border-sky-100 mb-6">
                            <h3 className="font-bold text-slate-900 mb-3">Key Automotive Components:</h3>
                            <ul className="grid grid-cols-2 gap-2 text-slate-600 text-sm">
                                <li className="flex items-center gap-2">✓ Engine Brackets & Mounts</li>
                                <li className="flex items-center gap-2">✓ Transmission Shafts & Gears</li>
                                <li className="flex items-center gap-2">✓ Chassis & Suspension Fittings</li>
                                <li className="flex items-center gap-2">✓ Stainless Steel Flanges & Bushings</li>
                            </ul>
                        </div>
                        <div className="flex gap-2 text-xs font-semibold text-slate-600">
                            <span className="bg-slate-100 px-3 py-1 rounded">Steel</span>
                            <span className="bg-slate-100 px-3 py-1 rounded">Aluminium</span>
                            <span className="bg-slate-100 px-3 py-1 rounded">Stainless Steel (SS)</span>
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
                        <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-6">Aerospace Components</h2>
                        <p className="text-lg text-slate-600 mb-6 leading-relaxed">
                            BTL manufactures high-precision aerospace components adhering to strict tolerance and traceability standards. Utilizing aircraft-grade Aluminium, Stainless Steel (SS), and high-strength Steel, we ensure zero-defect reliability for critical flight and structural applications.
                        </p>
                        <div className="bg-white p-6 rounded-xl border border-sky-100 mb-6">
                            <h3 className="font-bold text-slate-900 mb-3">Key Aerospace Components:</h3>
                            <ul className="grid grid-cols-2 gap-2 text-slate-600 text-sm">
                                <li className="flex items-center gap-2">✓ Precision Structural Fittings</li>
                                <li className="flex items-center gap-2">✓ Actuator & Hydraulic Housings</li>
                                <li className="flex items-center gap-2">✓ Sensor Mounts & Brackets</li>
                                <li className="flex items-center gap-2">✓ Cabin & Interior Precision Hardware</li>
                            </ul>
                        </div>
                        <div className="flex gap-2 text-xs font-semibold text-slate-600">
                            <span className="bg-sky-100 text-sky-800 px-3 py-1 rounded">Aircraft Aluminium</span>
                            <span className="bg-sky-100 text-sky-800 px-3 py-1 rounded">Stainless Steel (SS)</span>
                            <span className="bg-sky-100 text-sky-800 px-3 py-1 rounded">Alloy Steel</span>
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
                    <Link href="/contact" className="inline-block bg-white text-blue-700 font-bold py-4 px-10 rounded-lg hover:bg-gray-50 transition-colors shadow-lg">
                        Contact Sales
                    </Link>
                </div>
            </section>

        </main>
    );
}
