'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import Image from 'next/image';
import Hero from './components/Hero';

export default function Home() {
    // Simple intersection observer for fade-in animations could go here
    // For now, we rely on clean static layout with CSS transitions

    return (
        <main className="flex flex-col w-full">

            {/* ==================== 1. HERO SECTION ==================== */}
            <Hero />


            {/* ==================== 2. COMPANY PROFILE OVERVIEW ==================== */}
            <section id="about" className="py-16 md:py-24 bg-white border-t border-sky-100">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="max-w-3xl mx-auto text-center mb-16">
                        <div className="inline-flex mb-3 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-sm font-semibold border border-blue-200">
                            Company Profile • Established 2024
                        </div>
                        <h2 className="text-3xl md:text-5xl font-bold text-slate-900 tracking-tight mb-6">
                            BTL Engineering
                        </h2>
                        <p className="text-lg md:text-xl text-slate-600 leading-relaxed">
                            Established in <strong>2024</strong> in <strong>Hosur, Tamil Nadu, India</strong>, BTL is a premier precision manufacturer delivering high-reliability <strong>automotive and aerospace components</strong> to global OEMs.
                        </p>
                    </div>

                    {/* Quick Profile Cards */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16">
                        <div className="p-6 rounded-2xl bg-gradient-to-br from-sky-50 to-blue-50/50 border border-sky-100 shadow-sm text-center">
                            <span className="text-sm font-semibold text-sky-600 uppercase tracking-wider block mb-1">Established</span>
                            <span className="text-4xl font-extrabold text-slate-900 block mb-1">2024</span>
                            <span className="text-xs text-slate-500">Hosur, Tamil Nadu</span>
                        </div>
                        <div className="p-6 rounded-2xl bg-gradient-to-br from-sky-50 to-blue-50/50 border border-sky-100 shadow-sm text-center">
                            <span className="text-sm font-semibold text-sky-600 uppercase tracking-wider block mb-1">Employee Count</span>
                            <span className="text-4xl font-extrabold text-slate-900 block mb-1">20+</span>
                            <span className="text-xs text-slate-500">Skilled Engineers & Techs</span>
                        </div>
                        <div className="p-6 rounded-2xl bg-gradient-to-br from-sky-50 to-blue-50/50 border border-sky-100 shadow-sm text-center">
                            <span className="text-sm font-semibold text-sky-600 uppercase tracking-wider block mb-1">Client Count</span>
                            <span className="text-4xl font-extrabold text-slate-900 block mb-1">10+</span>
                            <span className="text-xs text-slate-500">Trusted OEM Partners</span>
                        </div>
                        <div className="p-6 rounded-2xl bg-gradient-to-br from-sky-50 to-blue-50/50 border border-sky-100 shadow-sm text-center">
                            <span className="text-sm font-semibold text-sky-600 uppercase tracking-wider block mb-1">Specialization</span>
                            <span className="text-3xl font-extrabold text-slate-900 block mb-1">Auto & Aero</span>
                            <span className="text-xs text-slate-500">Critical Components</span>
                        </div>
                    </div>
                </div>
            </section>


            {/* ==================== 3. TECHNOLOGY & MACHINERY ==================== */}
            <section id="technology" className="py-16 md:py-24 bg-sky-50/60 border-t border-sky-100">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center max-w-3xl mx-auto mb-16">
                        <span className="text-sky-600 font-semibold tracking-wider uppercase text-sm">Machinery & Technology</span>
                        <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mt-2 mb-4">Core Production Machinery</h2>
                        <p className="text-lg text-slate-600">Equipped with state-of-the-art manufacturing hardware for micron-precision batch production.</p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        <div className="p-8 rounded-2xl bg-white border border-sky-100 shadow-sm hover:shadow-xl hover:border-blue-200 transition-all duration-300">
                            <div className="w-14 h-14 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-6">
                                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                            </div>
                            <h3 className="text-2xl font-bold text-slate-900 mb-3">CNC Machines</h3>
                            <p className="text-slate-600 leading-relaxed mb-4">
                                Computer Numerical Control (CNC) turning and machining centers for intricate rotational geometries, threads, and high-precision tolerances.
                            </p>
                            <span className="inline-flex text-xs font-semibold px-2.5 py-1 rounded bg-sky-50 text-sky-700">Sub-micron accuracy</span>
                        </div>

                        <div className="p-8 rounded-2xl bg-white border border-sky-100 shadow-sm hover:shadow-xl hover:border-blue-200 transition-all duration-300">
                            <div className="w-14 h-14 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-6">
                                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                                </svg>
                            </div>
                            <h3 className="text-2xl font-bold text-slate-900 mb-3">VMC Milling Machines</h3>
                            <p className="text-slate-600 leading-relaxed mb-4">
                                Vertical Machining Centers (VMC) equipped for complex 3D surface profiles, prismatic aerospace components, and automotive housings.
                            </p>
                            <span className="inline-flex text-xs font-semibold px-2.5 py-1 rounded bg-sky-50 text-sky-700">Fourth-axis contouring</span>
                        </div>

                        <div className="p-8 rounded-2xl bg-white border border-sky-100 shadow-sm hover:shadow-xl hover:border-blue-200 transition-all duration-300">
                            <div className="w-14 h-14 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-6">
                                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                </svg>
                            </div>
                            <h3 className="text-2xl font-bold text-slate-900 mb-3">Drilling Machines</h3>
                            <p className="text-slate-600 leading-relaxed mb-4">
                                High-speed precision drilling, tapping, reaming, and counterboring machines designed for repeatable holes and tight positional accuracy.
                            </p>
                            <span className="inline-flex text-xs font-semibold px-2.5 py-1 rounded bg-sky-50 text-sky-700">High-repeatability boring</span>
                        </div>
                    </div>
                </div>
            </section>


            {/* ==================== 4. FACILITIES & CAPABILITIES ==================== */}
            <section id="capabilities" className="py-16 md:py-24 bg-white border-t border-sky-100">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center max-w-3xl mx-auto mb-16">
                        <span className="text-sky-600 font-semibold tracking-wider uppercase text-sm">Comprehensive Infrastructure</span>
                        <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mt-2 mb-4">Facilities & Capabilities</h2>
                        <p className="text-lg text-slate-600">Integrated manufacturing ecosystem from initial concept design to final 100% component inspection.</p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        <div className="p-6 rounded-2xl border border-slate-100 bg-slate-50/50 hover:bg-white hover:shadow-lg hover:border-sky-200 transition-all">
                            <div className="w-12 h-12 bg-sky-100 text-sky-700 rounded-xl flex items-center justify-center font-bold text-xl mb-4">01</div>
                            <h3 className="text-xl font-bold text-slate-900 mb-2">In-house Tool Room</h3>
                            <p className="text-slate-600 text-sm leading-relaxed">
                                Dedicated tooling facility for designing, manufacturing, and maintaining custom fixtures, jigs, gauges, and precision dies.
                            </p>
                        </div>

                        <div className="p-6 rounded-2xl border border-slate-100 bg-slate-50/50 hover:bg-white hover:shadow-lg hover:border-sky-200 transition-all">
                            <div className="w-12 h-12 bg-sky-100 text-sky-700 rounded-xl flex items-center justify-center font-bold text-xl mb-4">02</div>
                            <h3 className="text-xl font-bold text-slate-900 mb-2">Engineering Design</h3>
                            <p className="text-slate-600 text-sm leading-relaxed">
                                Advanced CAD/CAM software, Design for Manufacturability (DFM) reviews, prototype development, and process optimization.
                            </p>
                        </div>

                        <div className="p-6 rounded-2xl border border-slate-100 bg-slate-50/50 hover:bg-white hover:shadow-lg hover:border-sky-200 transition-all">
                            <div className="w-12 h-12 bg-sky-100 text-sky-700 rounded-xl flex items-center justify-center font-bold text-xl mb-4">03</div>
                            <h3 className="text-xl font-bold text-slate-900 mb-2">Complete Component Inspection</h3>
                            <p className="text-slate-600 text-sm leading-relaxed">
                                100% QA verification with digital height gauges, optical measuring systems, surface roughness testers, and calibrated metrology.
                            </p>
                        </div>
                    </div>
                </div>
            </section>


            {/* ==================== 5. MATERIALS USED ==================== */}
            <section id="materials" className="py-16 md:py-24 bg-gradient-to-r from-sky-50 via-white to-blue-50 border-t border-sky-100">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center max-w-3xl mx-auto mb-16">
                        <span className="text-sky-600 font-semibold tracking-wider uppercase text-sm">Material Expertise</span>
                        <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mt-2 mb-4">Materials We Machine</h2>
                        <p className="text-lg text-slate-600">Processed with certified raw material traceability to meet automotive and aerospace certifications.</p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        <div className="bg-white p-8 rounded-2xl border border-sky-100 shadow-sm hover:shadow-md transition-all">
                            <div className="text-3xl mb-3">⚙️</div>
                            <h3 className="text-2xl font-bold text-slate-900 mb-2">Steel</h3>
                            <p className="text-slate-600 mb-4 text-sm leading-relaxed">
                                High-tensile carbon steels, structural alloy steels, and tool steels engineered for high load-bearing automotive and aerospace structural assemblies.
                            </p>
                            <div className="flex flex-wrap gap-1.5 text-xs">
                                <span className="bg-slate-100 text-slate-700 px-2.5 py-1 rounded">Carbon Steel</span>
                                <span className="bg-slate-100 text-slate-700 px-2.5 py-1 rounded">Alloy Steel</span>
                                <span className="bg-slate-100 text-slate-700 px-2.5 py-1 rounded">Mild Steel</span>
                            </div>
                        </div>

                        <div className="bg-white p-8 rounded-2xl border border-sky-100 shadow-sm hover:shadow-md transition-all">
                            <div className="text-3xl mb-3">✈️</div>
                            <h3 className="text-2xl font-bold text-slate-900 mb-2">Aluminium</h3>
                            <p className="text-slate-600 mb-4 text-sm leading-relaxed">
                                Lightweight, corrosion-resistant aerospace and automotive grade alloys machined with precision surface finishes and tight dimensional tolerances.
                            </p>
                            <div className="flex flex-wrap gap-1.5 text-xs">
                                <span className="bg-slate-100 text-slate-700 px-2.5 py-1 rounded">Aerospace Alloys</span>
                                <span className="bg-slate-100 text-slate-700 px-2.5 py-1 rounded">Automotive Grade</span>
                                <span className="bg-slate-100 text-slate-700 px-2.5 py-1 rounded">Extrusions</span>
                            </div>
                        </div>

                        <div className="bg-white p-8 rounded-2xl border border-sky-100 shadow-sm hover:shadow-md transition-all">
                            <div className="text-3xl mb-3">🛡️</div>
                            <h3 className="text-2xl font-bold text-slate-900 mb-2">Stainless Steel (SS)</h3>
                            <p className="text-slate-600 mb-4 text-sm leading-relaxed">
                                Austenitic and martensitic stainless steel grades providing superior oxidation resistance, hygiene, and high operating temperature resistance.
                            </p>
                            <div className="flex flex-wrap gap-1.5 text-xs">
                                <span className="bg-slate-100 text-slate-700 px-2.5 py-1 rounded">SS 304</span>
                                <span className="bg-slate-100 text-slate-700 px-2.5 py-1 rounded">SS 316</span>
                                <span className="bg-slate-100 text-slate-700 px-2.5 py-1 rounded">400 Series</span>
                            </div>
                        </div>
                    </div>
                </div>
            </section>


            {/* ==================== 6. PRODUCTS & INDUSTRIES ==================== */}
            <section id="industries" className="py-24 bg-white border-t border-sky-100">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <span className="text-sky-600 font-semibold tracking-wider uppercase text-sm">Target Applications</span>
                        <h2 className="text-4xl font-bold mb-4 text-slate-900">Products Manufactured</h2>
                        <p className="text-slate-600 text-lg">Supplying zero-defect components to high-spec automotive and aerospace OEMs.</p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
                        <div className="bg-sky-50/50 p-8 rounded-2xl border border-sky-100 hover:shadow-lg transition-all">
                            <div className="text-blue-600 font-semibold text-sm uppercase tracking-wider mb-2">Primary Sector</div>
                            <h3 className="text-3xl font-bold mb-3 text-slate-900">Automotive Components</h3>
                            <p className="text-slate-600 leading-relaxed mb-6">
                                Precision components designed for high-stress powertrain, chassis, transmission, and structural assemblies.
                            </p>
                            <ul className="space-y-2 text-sm text-slate-700 font-medium">
                                <li className="flex items-center gap-2">✓ Engine Brackets & Mountings</li>
                                <li className="flex items-center gap-2">✓ Transmission & Drive Shaft Fittings</li>
                                <li className="flex items-center gap-2">✓ Chassis & Suspension Hardware</li>
                                <li className="flex items-center gap-2">✓ Precision Bushings & Flanges</li>
                            </ul>
                        </div>

                        <div className="bg-sky-50/50 p-8 rounded-2xl border border-sky-100 hover:shadow-lg transition-all">
                            <div className="text-blue-600 font-semibold text-sm uppercase tracking-wider mb-2">Primary Sector</div>
                            <h3 className="text-3xl font-bold mb-3 text-slate-900">Aerospace Components</h3>
                            <p className="text-slate-600 leading-relaxed mb-6">
                                Flight-critical parts manufactured under stringent quality protocols to ensure safety, weight efficiency, and reliability.
                            </p>
                            <ul className="space-y-2 text-sm text-slate-700 font-medium">
                                <li className="flex items-center gap-2">✓ High-Precision Structural Fittings</li>
                                <li className="flex items-center gap-2">✓ Hydraulic & Actuator Housings</li>
                                <li className="flex items-center gap-2">✓ Sensor Enclosures & Mounts</li>
                                <li className="flex items-center gap-2">✓ Cabin & Interior Structural Hardware</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </section>


            {/* ==================== 6. CERTIFICATIONS (White) ==================== */}
            <section id="certifications" className="py-24 bg-gradient-to-br from-white to-sky-50 border-t border-sky-100">
                <div className="max-w-7xl mx-auto px-4 text-center">
                    <div className="inline-block p-12 rounded-3xl bg-white border border-sky-100 shadow-xl">
                        <div className="flex justify-center mb-6">
                            <div className="w-20 h-20 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100 shadow-sm">
                                <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                </svg>
                            </div>
                        </div>
                        <h2 className="text-3xl font-bold text-slate-900 mb-2">ISO 9001:2015 Certified</h2>
                        <p className="text-sky-600 font-medium mb-6">Quality Management System</p>
                        <p className="max-w-xl mx-auto text-slate-600">
                            Our unified commitment to quality control, traceability, and continuous improvement ensures that every part meets your exact specifications.
                        </p>
                    </div>
                </div>
            </section>


            {/* ==================== 7. CTA (Primary Blue) ==================== */}
            <section id="contact" className="py-24 bg-sky-600 text-white">
                <div className="max-w-4xl mx-auto px-4 text-center">
                    <h2 className="text-4xl md:text-5xl font-bold mb-6">Ready to Scale Production?</h2>
                    <p className="text-xl text-blue-100 mb-10 max-w-2xl mx-auto">
                        Connect with our engineering team for a feasibility review and competitive quotation.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link
                            href="/contact"
                            className="px-10 py-5 bg-orange-600 text-white font-bold text-lg rounded-lg hover:bg-orange-500 transition-colors shadow-lg shadow-orange-900/20 text-center"
                        >
                            Request a Quote
                        </Link>
                        <Link
                            href="/services"
                            className="px-10 py-5 bg-transparent text-white font-bold text-lg rounded-lg border border-white/20 hover:bg-white/10 transition-colors text-center"
                        >
                            Machine List
                        </Link>
                    </div>
                </div>
            </section>

        </main>
    );
}
