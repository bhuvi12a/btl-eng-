import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'About BTL Engineering | Global OEM Partner',
    description: 'ISO 9001:2015 certified manufacturer specializing in precision engineering, design support, and serial production for automotive and aerospace sectors.',
};

export default function AboutPage() {
    return (
        <main className="flex flex-col w-full pt-20">

            {/* ==================== HERO SECTION ==================== */}
            <section className="bg-gradient-to-r from-sky-50 to-blue-50 text-slate-900 py-16 px-6 lg:py-28">
                <div className="max-w-7xl mx-auto text-center">
                    <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 tracking-tight">
                        Engineering Trust, <span className="text-blue-500">Delivering Precision</span>
                    </h1>
                    <p className="text-lg md:text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
                        We are more than a manufacturer. We are a strategic engineering partner for OEMs requiring zero-defect components and complex assemblies.
                    </p>
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
                            Global Manufacturing Hub
                        </h2>
                        <div className="space-y-6 text-gray-600 text-lg leading-relaxed">
                            <p>
                                BTL Engineering is a premier precision manufacturing company headquartered in <strong>Hosur, India</strong>—a key industrial corridor for automotive and aerospace production.
                            </p>
                            <p>
                                Since our inception, we have focused exclusively on serving the rigorous demands of <strong>OEMs and Tier-1 suppliers</strong>. Our facility allows us to cater to high-volume automotive requirements while maintaining the strict quality standards needed for aerospace applications.
                            </p>
                            <p>
                                We bridge the gap between regional manufacturing advantages and global quality expectations, providing a reliable supply chain solution for critical engineered components.
                            </p>
                        </div>
                    </div>
                    <div className="relative">
                        <div className="aspect-[4/3] bg-gray-100 rounded-2xl border border-gray-200 shadow-lg flex items-center justify-center overflow-hidden">
                            {/* Placeholder for Facility Image */}
                            <div className="text-center">
                                <div className="text-6xl mb-4"></div>
                                <p className="text-gray-500 font-medium">State-of-the-art Facility</p>
                                <p className="text-sm text-gray-400">Hosur, Tamil Nadu</p>
                            </div>
                        </div>
                        {/* Stat Badge */}
                        <div className="absolute -bottom-8 -left-8 bg-blue-600 text-white p-8 rounded-xl shadow-xl hidden md:block">
                            <div className="text-3xl font-bold mb-1">ISO</div>
                            <div className="text-4xl font-bold">9001:2015</div>
                            <div className="text-blue-200 text-sm mt-2">Certified Quality</div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ==================== 2. ENGINEERING & DESIGN CAPABILITY ==================== */}
            <section className="py-16 md:py-20 px-6 bg-gray-50 border-y border-gray-200">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-16 max-w-3xl mx-auto">
                        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                            Engineering & Design Strength
                        </h2>
                        <p className="text-lg text-gray-600">
                            We support customers from the drawing board to the assembly line.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {/* Card 1 */}
                        <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
                            <div className="w-14 h-14 bg-blue-50 rounded-lg flex items-center justify-center text-3xl mb-6">
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-3">In-House Design</h3>
                            <p className="text-gray-600">
                                Dedicated engineering team equipped with advanced CAD/CAM software to interpret complex requirements and drive product development.
                            </p>
                        </div>

                        {/* Card 2 */}
                        <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
                            <div className="w-14 h-14 bg-blue-50 rounded-lg flex items-center justify-center text-3xl mb-6">
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-3">Concept to Production</h3>
                            <p className="text-gray-600">
                                Seamless transition support. We handle the entire lifecycle including prototyping, pilot runs, and scaling to serial mass production.
                            </p>
                        </div>

                        {/* Card 3 */}
                        <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
                            <div className="w-14 h-14 bg-blue-50 rounded-lg flex items-center justify-center text-3xl mb-6">
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-3">DFM & Optimization</h3>
                            <p className="text-gray-600">
                                Proactive Design for Manufacturability (DFM) analysis to identify cost drivers, reduce weight, and ensure process stability.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* ==================== 3. MANUFACTURING APPROACH ==================== */}
            <section className="py-16 md:py-20 px-6 bg-white">
                <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16">
                    <div className="order-2 lg:order-1">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-sky-900 text-white p-6 rounded-2xl flex flex-col justify-center text-centeraspect-square">
                                <span className="text-4xl mb-2"></span>
                                <span className="font-semibold">Advanced CNC</span>
                            </div>
                            <div className="bg-gray-100 p-6 rounded-2xl flex flex-col justify-center text-center aspect-square">
                                <span className="text-4xl mb-2"></span>
                                <span className="font-semibold text-gray-900">Lean Mfg</span>
                            </div>
                            <div className="bg-gray-100 p-6 rounded-2xl flex flex-col justify-center text-center aspect-square">
                                <span className="text-4xl mb-2"></span>
                                <span className="font-semibold text-gray-900">SPC Control</span>
                            </div>
                            <div className="bg-blue-600 text-white p-6 rounded-2xl flex flex-col justify-center text-center aspect-square">
                                <span className="text-4xl mb-2"></span>
                                <span className="font-semibold">Kaizen</span>
                            </div>
                        </div>
                    </div>

                    <div className="order-1 lg:order-2 flex flex-col justify-center">
                        <div className="inline-flex mb-4 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-sm font-semibold border border-blue-100 w-fit">
                            Our Process
                        </div>
                        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                            A Culture of Precision
                        </h2>
                        <div className="space-y-6 text-gray-600 text-lg">
                            <p>
                                Quality is not just inspected; it is manufactured. Our approach is built on disciplined processes and a relentless pursuit of perfection.
                            </p>
                            <ul className="space-y-4 mt-4">
                                <li className="flex items-start gap-3">
                                    <span className="text-blue-500 mt-1"></span>
                                    <span><strong>Disciplined Processes:</strong> Standardized workflows ensuring repeatability across every batch.</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <span className="text-blue-500 mt-1"></span>
                                    <span><strong>Advanced Systems:</strong> Utilizing modern CNC machinery and digital metrology for exact tolerances.</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <span className="text-blue-500 mt-1"></span>
                                    <span><strong>Continual Improvement:</strong> A deep-rooted culture of Kaizen to constantly enhance efficiency and quality.</span>
                                </li>
                            </ul>
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
                    <a href="/#contact" className="inline-block bg-white text-blue-700 font-bold py-4 px-10 rounded-lg hover:bg-gray-50 transition-colors shadow-lg">
                        Contact Us Today
                    </a>
                </div>
            </section>

        </main>
    );
}
