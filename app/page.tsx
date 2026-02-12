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


            {/* ==================== 2. COMPANY INTRO (Gray) ==================== */}
            <section id="about" className="py-16 md:py-24 bg-white border-t border-sky-100">
                <div className="max-w-4xl mx-auto px-4 text-center">
                    <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-8">
                        Engineering Excellence Since Inception
                    </h2>
                    <div className="space-y-6 text-lg text-slate-600 leading-relaxed">
                        <p>
                            BTL Engineering is a premier manufacturing partner based in <strong>Hosur, India</strong>, dedicated to delivering zero-defect components to global OEMs.
                        </p>
                        <p>
                            With state-of-the-art <strong>ISO 9001:2015 certified</strong> facilities, we bridge the gap between complex engineering requirements and scalable production. Our in-house team handles everything from DFM analysis to final quality validation.
                        </p>
                    </div>
                </div>
            </section>


            {/* ==================== 3. CORE CAPABILITIES (White) ==================== */}
            <section id="services" className="py-16 md:py-24 bg-sky-50/50 border-t border-sky-100">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center max-w-3xl mx-auto mb-16">
                        <span className="text-sky-500 font-semibold tracking-wider uppercase text-sm">Our Expertise</span>
                        <h2 className="text-4xl font-bold text-slate-900 mt-2 mb-4">Manufacturing Capabilities</h2>
                        <p className="text-lg text-slate-600">End-to-end production services tailored for high-precision applications.</p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {[
                            {
                                icon: '',
                                title: 'Precision Machining',
                                desc: '3/4/5-axis CNC milling and turning for complex geometries with micron-level tolerances.'
                            },
                            {
                                icon: '',
                                title: 'Forging',
                                desc: 'Hot and cold forging capabilities for high-strength automotive and structural components.'
                            },
                            {
                                icon: '',
                                title: 'Sheet Metal',
                                desc: 'Laser cutting, bending, and fabrication for enclosures, chassis, and brackets.'
                            },
                            {
                                icon: '',
                                title: 'R&D Support',
                                desc: 'Rapid prototyping, material testing, and process validation for new product introduction.'
                            }
                        ].map((service, idx) => (
                            <div key={idx} className="p-8 rounded-xl bg-white border border-gray-100 shadow-sm hover:shadow-xl hover:border-blue-100 transition-all duration-300 group">
                                <div className="text-4xl mb-6 group-hover:scale-110 transition-transform duration-300">{service.icon}</div>
                                <h3 className="text-xl font-bold text-slate-900 mb-3">{service.title}</h3>
                                <p className="text-slate-600 leading-relaxed">{service.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>


            {/* ==================== 4. ENGINEERING STRENGTH (Gray) ==================== */}
            <section id="engineering" className="py-16 md:py-24 bg-white text-slate-900 border-t border-sky-100">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid lg:grid-cols-2 gap-16 items-center">
                        <div>
                            <span className="text-sky-500 font-semibold tracking-wider uppercase text-sm">Value Engineering</span>
                            <h2 className="text-4xl font-bold text-slate-900 mt-2 mb-6">Design & Development</h2>
                            <p className="text-lg text-slate-600 mb-8">
                                We don't just manufacture; we optimize. Our engineering team works alongside your designers to improve manufacturability and reduce costs.
                            </p>

                            <ul className="space-y-4">
                                {[
                                    'New Product Introduction (NPI) Support',
                                    'Design for Manufacturability (DFM) Analysis',
                                    'Cost Reduction & Weight Optimization',
                                    'Tool Design & Fixture Development'
                                ].map((item, i) => (
                                    <li key={i} className="flex items-center gap-3 text-gray-700 font-medium">
                                        <span className="text-blue-500 text-xl"></span> {item}
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <div className="bg-white p-2 rounded-2xl border border-sky-100 shadow-xl">
                            <div className="relative aspect-video rounded-lg overflow-hidden">
                                <Image src="/cad-design.png" alt="CAD/CAM Design Workflow" fill className="object-cover" />
                            </div>
                        </div>
                    </div>
                </div>
            </section>


            {/* ==================== 5. INDUSTRIES (Dark Blue) ==================== */}
            <section id="industries" className="py-24 bg-sky-50 text-slate-900">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl font-bold mb-4 text-slate-900">Industries Served</h2>
                        <p className="text-slate-600 text-lg">Trusted by market leaders in critical sectors.</p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {[
                            {
                                title: 'Automotive',
                                detail: 'OEM & Tier-1',
                                desc: 'Engine components, transmission parts, and structural assemblies.'
                            },
                            {
                                title: 'Aerospace',
                                detail: 'Precision Reliability',
                                desc: 'Flight-critical machined parts and lightweight structural fittings.'
                            },
                            {
                                title: 'Industrial',
                                detail: 'Heavy Machinery',
                                desc: 'Hydraulic components, valves, and wear-resistant forged parts.'
                            }
                        ].map((ind, i) => (
                            <div key={i} className="bg-white p-8 rounded-2xl border border-sky-100 hover:shadow-lg transition-all">
                                <h3 className="text-2xl font-bold mb-2 text-slate-900">{ind.title}</h3>
                                <div className="text-blue-400 text-sm font-semibold uppercase tracking-wide mb-4">{ind.detail}</div>
                                <p className="text-slate-600 leading-relaxed">{ind.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>


            {/* ==================== 6. CERTIFICATIONS (White) ==================== */}
            <section id="certifications" className="py-24 bg-gradient-to-br from-white to-sky-50 border-t border-sky-100">
                <div className="max-w-7xl mx-auto px-4 text-center">
                    <div className="inline-block p-12 rounded-3xl bg-white border border-sky-100 shadow-xl">
                        <div className="text-6xl mb-6"></div>
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
                        <button className="px-10 py-5 bg-orange-600 text-white font-bold text-lg rounded-lg hover:bg-orange-500 transition-colors shadow-lg shadow-orange-900/20">
                            Request a Quote
                        </button>
                        <button className="px-10 py-5 bg-transparent text-white font-bold text-lg rounded-lg border border-white/20 hover:bg-white/10 transition-colors">
                            Machine List
                        </button>
                    </div>
                </div>
            </section>

        </main>
    );
}
