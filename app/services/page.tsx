import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';

export const metadata: Metadata = {
    title: 'Manufacturing Capabilities & Machinery | BTL',
    description: 'BTL in Hosur, Tamil Nadu manufactures automotive and aerospace components utilizing CNC Machines, VMC Milling Machines, Drilling Machines, an In-house Tool Room, and Complete Component Inspection.',
};

export default function ServicesPage() {
    return (
        <main className="flex flex-col w-full pt-20">

            {/* ==================== HERO ==================== */}
            <section className="bg-gradient-to-r from-sky-100 to-blue-50 text-slate-900 py-16 px-6 border-b border-sky-100">
                <div className="max-w-7xl mx-auto text-center">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-100/70 text-blue-800 text-sm font-semibold mb-4 border border-blue-200">
                        BTL • Established 2024 • Hosur, Tamil Nadu
                    </div>
                    <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
                        Technology, Machinery & <span className="text-blue-600">Capabilities</span>
                    </h1>
                    <p className="text-lg md:text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
                        Manufacturing precision automotive and aerospace components in <strong>Steel, Aluminium, and Stainless Steel (SS)</strong> with advanced CNC, VMC milling, drilling, and complete in-house inspection.
                    </p>
                </div>
            </section>

            {/* ==================== TECHNOLOGY & MACHINERY ==================== */}
            <section className="py-16 md:py-24 px-6 bg-white">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center max-w-3xl mx-auto mb-16">
                        <span className="text-blue-600 font-bold uppercase tracking-wider text-sm">Hardware & Equipment</span>
                        <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mt-2 mb-4">Technology & Machinery</h2>
                        <p className="text-slate-600 text-lg">
                            Our Hosur facility is equipped with production machinery dedicated to serial manufacturing and tight geometric tolerances.
                        </p>
                    </div>

                    <div className="grid lg:grid-cols-3 gap-8">
                        {/* 1. CNC Machines */}
                        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-8 hover:shadow-xl hover:border-blue-300 transition-all">
                            <div className="w-14 h-14 bg-blue-600 text-white rounded-xl flex items-center justify-center text-2xl font-bold mb-6 shadow-md">
                                CNC
                            </div>
                            <h3 className="text-2xl font-bold text-slate-900 mb-3">CNC Machines</h3>
                            <p className="text-slate-600 leading-relaxed mb-6">
                                Precision Computer Numerical Control (CNC) turning centers engineered for continuous, zero-defect machining of cylindrical and complex rotational parts.
                            </p>
                            <div className="border-t border-slate-200 pt-4">
                                <h4 className="font-semibold text-slate-800 text-sm mb-2">Key Applications:</h4>
                                <ul className="text-sm text-slate-600 space-y-1.5">
                                    <li className="flex items-center gap-2">✓ Precision Turning & Boring</li>
                                    <li className="flex items-center gap-2">✓ Internal & External Threading</li>
                                    <li className="flex items-center gap-2">✓ Shafts, Pins & Bushings</li>
                                    <li className="flex items-center gap-2">✓ Sub-micron Runout Tolerance</li>
                                </ul>
                            </div>
                        </div>

                        {/* 2. VMC Milling Machines */}
                        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-8 hover:shadow-xl hover:border-blue-300 transition-all">
                            <div className="w-14 h-14 bg-sky-600 text-white rounded-xl flex items-center justify-center text-2xl font-bold mb-6 shadow-md">
                                VMC
                            </div>
                            <h3 className="text-2xl font-bold text-slate-900 mb-3">VMC Milling Machines</h3>
                            <p className="text-slate-600 leading-relaxed mb-6">
                                Vertical Machining Centers (VMC) providing fourth-axis capability for complex 3D contouring, pocketing, facing, and intricate aerospace geometries.
                            </p>
                            <div className="border-t border-slate-200 pt-4">
                                <h4 className="font-semibold text-slate-800 text-sm mb-2">Key Applications:</h4>
                                <ul className="text-sm text-slate-600 space-y-1.5">
                                    <li className="flex items-center gap-2">✓ Fourth-Axis Prismatic Milling</li>
                                    <li className="flex items-center gap-2">✓ 3D Surface Profiling</li>
                                    <li className="flex items-center gap-2">✓ Brackets, Mounts & Enclosures</li>
                                    <li className="flex items-center gap-2">✓ Mirror & Fine Surface Finishes</li>
                                </ul>
                            </div>
                        </div>

                        {/* 3. Drilling Machines */}
                        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-8 hover:shadow-xl hover:border-blue-300 transition-all">
                            <div className="w-14 h-14 bg-indigo-600 text-white rounded-xl flex items-center justify-center text-2xl font-bold mb-6 shadow-md">
                                DRILL
                            </div>
                            <h3 className="text-2xl font-bold text-slate-900 mb-3">Drilling Machines</h3>
                            <p className="text-slate-600 leading-relaxed mb-6">
                                Specialized high-speed drilling and tapping machinery delivering highly accurate hole patterns, counterbores, and precision reaming.
                            </p>
                            <div className="border-t border-slate-200 pt-4">
                                <h4 className="font-semibold text-slate-800 text-sm mb-2">Key Applications:</h4>
                                <ul className="text-sm text-slate-600 space-y-1.5">
                                    <li className="flex items-center gap-2">✓ High-Precision Hole Patterns</li>
                                    <li className="flex items-center gap-2">✓ Multi-pitch Thread Tapping</li>
                                    <li className="flex items-center gap-2">✓ Reaming & Counter-boring</li>
                                    <li className="flex items-center gap-2">✓ Positional Pitch Repeatability</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ==================== FACILITIES & CAPABILITIES ==================== */}
            <section className="py-16 md:py-24 px-6 bg-sky-50 border-y border-sky-100">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center max-w-3xl mx-auto mb-16">
                        <span className="text-blue-600 font-bold uppercase tracking-wider text-sm">End-to-End Infrastructure</span>
                        <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mt-2 mb-4">Facilities & Capabilities</h2>
                        <p className="text-slate-600 text-lg">
                            From initial engineering design to 100% component inspection, our in-house ecosystem ensures seamless serial production.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-8">
                        {/* In-house Tool Room */}
                        <div className="bg-white p-8 rounded-2xl border border-sky-100 shadow-sm hover:shadow-md transition-all flex flex-col md:flex-row gap-6 items-start">
                            <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-700 font-bold text-xl flex items-center justify-center flex-shrink-0">
                                01
                            </div>
                            <div>
                                <h3 className="text-2xl font-bold text-slate-900 mb-2">In-house Tool Room</h3>
                                <p className="text-slate-600 leading-relaxed mb-4">
                                    Our dedicated in-house tool room designs, manufactures, and sharpens custom jigs, fixtures, gauges, and tooling setups. This reduces development lead times and ensures total process control.
                                </p>
                                <div className="flex flex-wrap gap-2 text-xs font-semibold text-blue-800">
                                    <span className="bg-blue-50 px-3 py-1 rounded-md">Custom Jigs & Fixtures</span>
                                    <span className="bg-blue-50 px-3 py-1 rounded-md">Rapid Prototyping</span>
                                    <span className="bg-blue-50 px-3 py-1 rounded-md">Tool Maintenance</span>
                                </div>
                            </div>
                        </div>

                        {/* Engineering Design */}
                        <div className="bg-white p-8 rounded-2xl border border-sky-100 shadow-sm hover:shadow-md transition-all flex flex-col md:flex-row gap-6 items-start">
                            <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-700 font-bold text-xl flex items-center justify-center flex-shrink-0">
                                02
                            </div>
                            <div>
                                <h3 className="text-2xl font-bold text-slate-900 mb-2">Engineering Design</h3>
                                <p className="text-slate-600 leading-relaxed mb-4">
                                    Our skilled engineering team uses modern CAD/CAM software to review customer 2D/3D models, execute Design for Manufacturability (DFM) studies, and program optimized toolpaths.
                                </p>
                                <div className="flex flex-wrap gap-2 text-xs font-semibold text-blue-800">
                                    <span className="bg-blue-50 px-3 py-1 rounded-md">DFM Analysis</span>
                                    <span className="bg-blue-50 px-3 py-1 rounded-md">CAD/CAM Programming</span>
                                    <span className="bg-blue-50 px-3 py-1 rounded-md">Cycle Time Optimization</span>
                                </div>
                            </div>
                        </div>

                        {/* Complete Component Inspection */}
                        <div className="bg-white p-8 rounded-2xl border border-sky-100 shadow-sm hover:shadow-md transition-all flex flex-col md:flex-row gap-6 items-start">
                            <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-700 font-bold text-xl flex items-center justify-center flex-shrink-0">
                                03
                            </div>
                            <div>
                                <h3 className="text-2xl font-bold text-slate-900 mb-2">Complete Component Inspection</h3>
                                <p className="text-slate-600 leading-relaxed mb-4">
                                    Quality is verified at every stage. We perform 100% component inspection using digital height gauges, optical measurement, profile projectors, and surface roughness testers.
                                </p>
                                <div className="flex flex-wrap gap-2 text-xs font-semibold text-blue-800">
                                    <span className="bg-blue-50 px-3 py-1 rounded-md">100% Dimensional QA</span>
                                    <span className="bg-blue-50 px-3 py-1 rounded-md">Surface Roughness Testing</span>
                                    <span className="bg-blue-50 px-3 py-1 rounded-md">Zero-Defect Dispatch</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ==================== MATERIALS USED ==================== */}
            <section className="py-16 md:py-24 px-6 bg-white">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center max-w-3xl mx-auto mb-16">
                        <span className="text-blue-600 font-bold uppercase tracking-wider text-sm">Certified Raw Materials</span>
                        <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mt-2 mb-4">Materials Used</h2>
                        <p className="text-slate-600 text-lg">
                            We machine with full heat code traceability across core metals:
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        <div className="p-8 rounded-2xl border border-slate-200 bg-slate-50">
                            <div className="text-3xl mb-3">🔩</div>
                            <h3 className="text-2xl font-bold text-slate-900 mb-2">Steel</h3>
                            <p className="text-slate-600 text-sm leading-relaxed mb-4">
                                Carbon steels, alloy steels, and structural steel grades with high tensile strength, ideal for automotive chassis, drivetrain, and heavy-duty structural parts.
                            </p>
                            <span className="text-xs font-semibold text-slate-700 bg-slate-200 px-2.5 py-1 rounded">High Strength & Wear Resistance</span>
                        </div>

                        <div className="p-8 rounded-2xl border border-slate-200 bg-slate-50">
                            <div className="text-3xl mb-3">✈️</div>
                            <h3 className="text-2xl font-bold text-slate-900 mb-2">Aluminium</h3>
                            <p className="text-slate-600 text-sm leading-relaxed mb-4">
                                Aerospace and automotive grade alloys (including 6061, 7075) offering superior strength-to-weight ratios and high thermal conductivity.
                            </p>
                            <span className="text-xs font-semibold text-slate-700 bg-slate-200 px-2.5 py-1 rounded">Lightweight & Precision Machinable</span>
                        </div>

                        <div className="p-8 rounded-2xl border border-slate-200 bg-slate-50">
                            <div className="text-3xl mb-3">🛡️</div>
                            <h3 className="text-2xl font-bold text-slate-900 mb-2">Stainless Steel (SS)</h3>
                            <p className="text-slate-600 text-sm leading-relaxed mb-4">
                                Stainless Steel grades including SS 304, SS 316, and 400 series providing excellent corrosion resistance and elevated temperature performance.
                            </p>
                            <span className="text-xs font-semibold text-slate-700 bg-slate-200 px-2.5 py-1 rounded">Corrosion & Heat Resistant</span>
                        </div>
                    </div>
                </div>
            </section>

            {/* ==================== CTA ==================== */}
            <section className="py-16 px-6 bg-sky-600 border-t border-sky-100">
                <div className="max-w-4xl mx-auto text-center text-white">
                    <h2 className="text-3xl font-bold mb-4">Ready to Discuss Your Manufacturing Needs?</h2>
                    <p className="text-blue-100 mb-8 max-w-2xl mx-auto">
                        Connect with BTL in Hosur, Tamil Nadu for technical reviews, rapid quotations, and sample prototyping.
                    </p>
                    <Link href="/contact" className="inline-block bg-white text-blue-700 font-bold py-4 px-10 rounded-lg hover:bg-gray-50 transition-colors shadow-lg">
                        Get in Touch
                    </Link>
                </div>
            </section>

        </main>
    );
}
