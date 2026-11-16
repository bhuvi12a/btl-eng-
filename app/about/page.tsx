import Image from 'next/image';
import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'About BTL | Automotive & Aerospace Precision Components',
    description: 'BTL is an ISO 9001:2015 certified manufacturer established in 2024 in Hosur, Tamil Nadu, specializing in automotive and aerospace components in Steel, Aluminium, and Stainless Steel.',
};

export default function AboutPage() {
    return (
        <main className="flex flex-col w-full pt-20">

            {/* ==================== HERO SECTION ==================== */}
            <section className="bg-gradient-to-r from-sky-50 to-blue-50 text-slate-900 py-16 px-6 lg:py-24">
                <div className="max-w-7xl mx-auto text-center">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-100/70 text-blue-800 text-sm font-semibold mb-4 border border-blue-200">
                        Established 2024 • Hosur, Tamil Nadu, India
                    </div>
                    <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 tracking-tight">
                        About <span className="text-blue-600">BTL</span>
                    </h1>
                    <p className="text-lg md:text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
                        Dedicated manufacturer of high-precision automotive and aerospace components with robust in-house design, tooling, CNC/VMC machining, and complete component inspection.
                    </p>
                </div>
            </section>

            {/* ==================== OFFICIAL COMPANY PROFILE MATRIX ==================== */}
            <section className="py-12 bg-slate-50 border-b border-slate-200">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                        <div className="bg-gradient-to-r from-sky-900 to-blue-900 text-white px-8 py-5 flex flex-wrap justify-between items-center gap-4">
                            <div>
                                <h2 className="text-2xl font-bold tracking-tight">BTL – Company Profile</h2>
                                <p className="text-sky-200 text-sm">Key Organizational & Operational Facts</p>
                            </div>
                            <span className="bg-white/10 px-3 py-1 rounded-full text-xs font-medium text-sky-100 border border-white/20">
                                Verified Profile
                            </span>
                        </div>

                        <div className="p-6 md:p-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            <div className="border-l-4 border-blue-600 pl-4 py-1">
                                <span className="text-xs uppercase font-bold tracking-wider text-slate-400 block">Company Name</span>
                                <span className="text-xl font-bold text-slate-900">BTL</span>
                            </div>

                            <div className="border-l-4 border-blue-600 pl-4 py-1">
                                <span className="text-xs uppercase font-bold tracking-wider text-slate-400 block">Established</span>
                                <span className="text-xl font-bold text-slate-900">2024</span>
                            </div>

                            <div className="border-l-4 border-blue-600 pl-4 py-1">
                                <span className="text-xs uppercase font-bold tracking-wider text-slate-400 block">Location</span>
                                <span className="text-xl font-bold text-slate-900">Hosur, Tamil Nadu, India</span>
                            </div>

                            <div className="border-l-4 border-blue-600 pl-4 py-1">
                                <span className="text-xs uppercase font-bold tracking-wider text-slate-400 block">Products Manufactured</span>
                                <span className="text-lg font-bold text-slate-900">Automotive & Aerospace Components</span>
                            </div>

                            <div className="border-l-4 border-blue-600 pl-4 py-1">
                                <span className="text-xs uppercase font-bold tracking-wider text-slate-400 block">Materials Used</span>
                                <span className="text-lg font-bold text-slate-900">Steel, Aluminium, Stainless Steel (SS)</span>
                            </div>

                            <div className="border-l-4 border-blue-600 pl-4 py-1">
                                <span className="text-xs uppercase font-bold tracking-wider text-slate-400 block">Workforce & Clients</span>
                                <span className="text-lg font-bold text-slate-900">20+ Employees • 10+ Clients</span>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ==================== 1. COMPANY OVERVIEW ==================== */}
            <section className="py-16 md:py-20 px-6 bg-white">
                <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
                    <div>
                        <div className="inline-flex mb-4 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-sm font-semibold border border-blue-100">
                            Who We Are
                        </div>
                        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                            Precision Engineering Hub in Hosur
                        </h2>
                        <div className="space-y-6 text-gray-600 text-lg leading-relaxed">
                            <p>
                                <strong>BTL</strong> was established in <strong>2024</strong> in <strong>Hosur, Tamil Nadu, India</strong>—one of India&apos;s most prominent manufacturing and aerospace corridors.
                            </p>
                            <p>
                                With an agile team of <strong>20+ experienced engineers and technicians</strong>, we cater to over <strong>10+ leading clients</strong> across the automotive and aerospace industries. We specialize in producing precision parts with tight tolerances and superior surface finishes.
                            </p>
                            <p>
                                Our facility works across certified raw materials including <strong>Steel, Aluminium, and Stainless Steel (SS)</strong>, delivering components that meet stringent OEM safety and performance standards.
                            </p>
                        </div>
                    </div>
                    <div className="relative">
                        <div className="relative aspect-[4/3] bg-gray-100 rounded-2xl border border-gray-200 shadow-lg flex items-center justify-center overflow-hidden">
                            <Image
                                src="/factory-floor.png"
                                alt="BTL Facility in Hosur, Tamil Nadu"
                                fill
                                className="object-cover"
                            />
                        </div>
                        {/* Stat Badge */}
                        <div className="absolute -bottom-8 -left-8 bg-blue-600 text-white p-8 rounded-xl shadow-xl hidden md:block">
                            <div className="text-3xl font-bold mb-1">Est. 2024</div>
                            <div className="text-4xl font-bold">Hosur, TN</div>
                            <div className="text-blue-200 text-sm mt-2">Automotive & Aerospace</div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ==================== 2. TECHNOLOGY & MACHINERY ==================== */}
            <section className="py-16 md:py-20 px-6 bg-slate-50 border-t border-slate-200">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-16 max-w-3xl mx-auto">
                        <div className="inline-flex mb-3 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-sm font-semibold border border-blue-100">
                            Equipment & Infrastructure
                        </div>
                        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                            Technology & Machinery
                        </h2>
                        <p className="text-lg text-gray-600">
                            High-precision machine tools engineered for high repeatability and tight-tolerance component manufacture.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        <div className="bg-white p-8 rounded-xl shadow-sm border border-slate-200 hover:shadow-md transition-all">
                            <div className="w-12 h-12 bg-sky-50 text-sky-600 rounded-lg flex items-center justify-center font-bold text-2xl mb-4">
                                01
                            </div>
                            <h3 className="text-2xl font-bold text-slate-900 mb-3">CNC Machines</h3>
                            <p className="text-slate-600 leading-relaxed mb-4">
                                High-speed CNC turning and lathe machines for complex symmetrical and rotational components with sub-micron repeatable precision.
                            </p>
                            <ul className="text-sm text-slate-600 space-y-2">
                                <li className="flex items-center gap-2">✓ Precision Turning Centers</li>
                                <li className="flex items-center gap-2">✓ High-speed threading & boring</li>
                                <li className="flex items-center gap-2">✓ Tight concentricity & runout control</li>
                            </ul>
                        </div>

                        <div className="bg-white p-8 rounded-xl shadow-sm border border-slate-200 hover:shadow-md transition-all">
                            <div className="w-12 h-12 bg-sky-50 text-sky-600 rounded-lg flex items-center justify-center font-bold text-2xl mb-4">
                                02
                            </div>
                            <h3 className="text-2xl font-bold text-slate-900 mb-3">VMC Milling Machines</h3>
                            <p className="text-slate-600 leading-relaxed mb-4">
                                Vertical Machining Centers (VMC) capable of complex 3D contouring, pocketing, facing, and profiling in Steel, Aluminium, and Stainless Steel.
                            </p>
                            <ul className="text-sm text-slate-600 space-y-2">
                                <li className="flex items-center gap-2">✓ Fourth-axis precision milling</li>
                                <li className="flex items-center gap-2">✓ Prismatic component machining</li>
                                <li className="flex items-center gap-2">✓ High surface finish standards</li>
                            </ul>
                        </div>

                        <div className="bg-white p-8 rounded-xl shadow-sm border border-slate-200 hover:shadow-md transition-all">
                            <div className="w-12 h-12 bg-sky-50 text-sky-600 rounded-lg flex items-center justify-center font-bold text-2xl mb-4">
                                03
                            </div>
                            <h3 className="text-2xl font-bold text-slate-900 mb-3">Drilling Machines</h3>
                            <p className="text-slate-600 leading-relaxed mb-4">
                                Heavy-duty and precision drilling machinery for accurate hole placement, tapping, counter-boring, and reaming operations.
                            </p>
                            <ul className="text-sm text-slate-600 space-y-2">
                                <li className="flex items-center gap-2">✓ Precision hole sizing & tapping</li>
                                <li className="flex items-center gap-2">✓ Multi-pitch thread tapping</li>
                                <li className="flex items-center gap-2">✓ Repeatable hole positional tolerance</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </section>

            {/* ==================== 3. FACILITIES & CAPABILITIES ==================== */}
            <section className="py-16 md:py-20 px-6 bg-white border-y border-gray-200">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-16 max-w-3xl mx-auto">
                        <div className="inline-flex mb-3 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-sm font-semibold border border-blue-100">
                            Core Competencies
                        </div>
                        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                            Facilities & Capabilities
                        </h2>
                        <p className="text-lg text-gray-600">
                            Our integrated capabilities give clients end-to-end assurance from concept design to final 100% component inspection.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {/* Facility 1 */}
                        <div className="bg-slate-50 p-8 rounded-xl shadow-sm border border-slate-200 hover:border-blue-300 transition-all">
                            <div className="w-12 h-12 bg-blue-600 text-white rounded-lg flex items-center justify-center text-xl font-bold mb-6">
                                01
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-3">In-house Tool Room</h3>
                            <p className="text-gray-600 text-sm leading-relaxed mb-4">
                                Dedicated tool room capable of rapid fixture design, jig fabrication, custom tooling setups, and tool maintenance.
                            </p>
                            <span className="text-xs font-semibold text-blue-700 bg-blue-100 px-2 py-0.5 rounded">Fast Setup & High Accuracy</span>
                        </div>

                        {/* Facility 2 */}
                        <div className="bg-slate-50 p-8 rounded-xl shadow-sm border border-slate-200 hover:border-blue-300 transition-all">
                            <div className="w-12 h-12 bg-blue-600 text-white rounded-lg flex items-center justify-center text-xl font-bold mb-6">
                                02
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-3">Engineering Design</h3>
                            <p className="text-gray-600 text-sm leading-relaxed mb-4">
                                Comprehensive CAD/CAM modelling, Design for Manufacturability (DFM) consultation, and process flow optimization.
                            </p>
                            <span className="text-xs font-semibold text-blue-700 bg-blue-100 px-2 py-0.5 rounded">Concept to Production</span>
                        </div>

                        {/* Facility 3 */}
                        <div className="bg-slate-50 p-8 rounded-xl shadow-sm border border-slate-200 hover:border-blue-300 transition-all">
                            <div className="w-12 h-12 bg-blue-600 text-white rounded-lg flex items-center justify-center text-xl font-bold mb-6">
                                03
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-3">Complete Component Inspection</h3>
                            <p className="text-gray-600 text-sm leading-relaxed mb-4">
                                100% dimensional and surface inspection with precision metrology equipment, ensuring zero defects reach client assembly lines.
                            </p>
                            <span className="text-xs font-semibold text-blue-700 bg-blue-100 px-2 py-0.5 rounded">Zero-Defect Quality</span>
                        </div>
                    </div>
                </div>
            </section>

            {/* ==================== 4. CUSTOMER ENGAGEMENT MODEL ==================== */}
            <section className="py-16 md:py-20 px-6 bg-sky-50 text-slate-900">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-4xl font-bold mb-4">Customer Engagement Model</h2>
                        <p className="text-slate-600 text-lg">How we partner for long-term success</p>
                    </div>

                    <div className="relative">
                        {/* Connecting Line (Desktop) */}
                        <div className="hidden md:block absolute top-1/2 left-0 right-0 h-0.5 bg-sky-200 -z-0"></div>

                        <div className="grid md:grid-cols-4 gap-8 relative z-10">
                            {[
                                {
                                    step: '01',
                                    title: 'Collaboration',
                                    desc: 'Early involvement in design and feasibility to align engineering goals.'
                                },
                                {
                                    step: '02',
                                    title: 'Validation',
                                    desc: 'Rigorous prototyping and DFM checks before steel is cut.'
                                },
                                {
                                    step: '03',
                                    title: 'Execution',
                                    desc: 'Precision manufacturing with scheduled on-time delivery.',
                                },
                                {
                                    step: '04',
                                    title: 'Partnership',
                                    desc: 'Long-term support, inventory management, and cost-down initiatives.'
                                }
                            ].map((item, idx) => (
                                <div key={idx} className="bg-white p-6 rounded-xl border border-sky-100 hover:shadow-lg transition-all">
                                    <div className="text-blue-500 text-4xl font-bold mb-4">{item.step}</div>
                                    <h3 className="text-xl font-bold text-slate-900 mb-2">{item.title}</h3>
                                    <p className="text-slate-600 text-sm leading-relaxed">{item.desc}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* ==================== CTA ==================== */}
            <section className="py-16 px-6 bg-sky-600">
                <div className="max-w-5xl mx-auto text-center text-white">
                    <h2 className="text-3xl font-bold mb-6">Ready to Partner?</h2>
                    <p className="text-blue-100 text-lg mb-8">
                        Experience the advantage of working with a dedicated precision engineering team.
                    </p>
                    <Link href="/contact" className="inline-block bg-white text-blue-700 font-bold py-4 px-10 rounded-lg hover:bg-gray-50 transition-colors shadow-lg">
                        Contact Us Today
                    </Link>
                </div>
            </section>

        </main>
    );
}
