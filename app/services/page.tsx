import type { Metadata } from 'next';
import Image from 'next/image';

export const metadata: Metadata = {
    title: 'Manufacturing Services | BTL Engineering',
    description: 'Precision CNC machining, forging, and sheet metal fabrication services for OEM applications.',
};

export default function ServicesPage() {
    return (
        <main className="flex flex-col w-full pt-20">

            {/* ==================== HERO ==================== */}
            <section className="bg-gradient-to-r from-sky-100 to-blue-50 text-slate-900 py-16 px-6 border-b border-sky-100">
                <div className="max-w-7xl mx-auto text-center">
                    <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
                        Manufacturing <span className="text-blue-500">Capabilities</span>
                    </h1>
                    <p className="text-lg md:text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
                        From rapid prototyping to high-volume serial production, we offer end-to-end manufacturing solutions for critical components.
                    </p>
                </div>
            </section>

            {/* ==================== PRECISION MACHINING ==================== */}
            <section className="py-16 md:py-24 px-6 bg-white">
                <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
                    <div>
                        <div className="text-blue-400 font-bold mb-2 tracking-wide uppercase text-sm">CNC Expertise</div>
                        <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-6">Precision Machining</h2>
                        <div className="space-y-4 text-slate-600 leading-relaxed text-lg">
                            <p>
                                Our comprehensive machine shop is equipped with advanced 3, 4, and 5-axis CNC turning and milling centers capable of holding micron-level tolerances.
                            </p>
                            <p>
                                We specialize in machining complex geometries from varying materials including aluminum, stainless steel, titanium, and engineering plastics.
                            </p>
                            <ul className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4 text-sm font-medium text-slate-700">
                                <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>5-Axis Milling</li>
                                <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>CNC Turning</li>
                                <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>Wire EDM</li>
                                <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>Surface Grinding</li>
                            </ul>
                        </div>
                    </div>
                    <div className="relative aspect-[4/3] rounded-2xl overflow-hidden border border-white/10 shadow-2xl">
                        <Image src="/cnc-machining.png" alt="CNC Machining Center" fill className="object-cover" />
                    </div>
                </div>
            </section>

            {/* ==================== FORGING ==================== */}
            <section className="py-16 md:py-24 px-6 bg-sky-50 border-y border-sky-100">
                <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
                    <div className="order-2 lg:order-1 relative aspect-[4/3] rounded-2xl overflow-hidden border border-white/10 shadow-2xl">
                        <Image src="/factory-floor.png" alt="Forging Facility" fill className="object-cover" />
                    </div>
                    <div className="order-1 lg:order-2">
                        <div className="text-blue-400 font-bold mb-2 tracking-wide uppercase text-sm">High Strength</div>
                        <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-6">Forged Components</h2>
                        <div className="space-y-4 text-slate-600 leading-relaxed text-lg">
                            <p>
                                We deliver high-strength forged components essential for automotive powertrain and structural applications. Our capabilities cover both hot and cold forging processes.
                            </p>
                            <p>
                                Post-forging, we offer value-added services including heat treatment, precision machining, and surface finishing to deliver ready-to-assemble parts.
                            </p>
                            <ul className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4 text-sm font-medium text-slate-700">
                                <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>Closed Die Forging</li>
                                <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>Heat Treatment</li>
                                <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>Magnaflux Testing</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </section>

            {/* ==================== SHEET METAL & FABRICATION ==================== */}
            <section className="py-16 md:py-24 px-6 bg-white">
                <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
                    <div>
                        <div className="text-blue-400 font-bold mb-2 tracking-wide uppercase text-sm">Structural Integrity</div>
                        <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-6">Sheet Metal Fabrication</h2>
                        <div className="space-y-4 text-slate-600 leading-relaxed text-lg">
                            <p>
                                Complete sheet metal solutions for enclosures, brackets, and structural assemblies. Our facility features laser cutting, CNC bending, and diversified welding capabilities (MIG/TIG/Spot).
                            </p>
                            <p>
                                We handle assembly and finishing, including powder coating and plating, to provide finished subsystems to OEM lines.
                            </p>
                            <ul className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4 text-sm font-medium text-slate-700">
                                <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>Laser Cutting</li>
                                <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>CNC Bending</li>
                                <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>Robot Welding</li>
                            </ul>
                        </div>
                    </div>
                    <div className="relative aspect-[4/3] rounded-2xl overflow-hidden border border-white/10 shadow-2xl">
                        <Image src="/welding-robot.png" alt="Robotic Welding" fill className="object-cover" />
                    </div>
                </div>
            </section>

            {/* ==================== CTA ==================== */}
            <section className="py-16 px-6 bg-sky-600 border-t border-sky-100">
                <div className="max-w-4xl mx-auto text-center text-white">
                    <h2 className="text-3xl font-bold mb-4">Request a Capability Profile</h2>
                    <p className="text-blue-100 mb-8 max-w-2xl mx-auto">
                        Download our detailed machine list and facility audit documents to verify our capacity for your next project.
                    </p>
                    <a href="/contact" className="inline-block bg-white text-blue-700 font-bold py-4 px-10 rounded-lg hover:bg-gray-50 transition-colors shadow-lg">
                        Get in Touch
                    </a>
                </div>
            </section>

        </main>
    );
}
