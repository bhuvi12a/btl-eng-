import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
    title: 'Privacy Policy | BTL Automotive & Aerospace Precision Components',
    description: 'Read the privacy policy of BTL Automotive & Aerospace Engineering regarding customer data, quotation inquiries, and information security.',
};

export default function PrivacyPolicyPage() {
    const lastUpdated = 'November 18, 2026';

    return (
        <main className="flex flex-col w-full pt-20">
            {/* Header Section */}
            <section className="bg-gradient-to-r from-sky-50 to-blue-50 text-slate-900 py-14 px-6 border-b border-slate-200">
                <div className="max-w-4xl mx-auto">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100 text-blue-800 text-xs font-semibold mb-3 border border-blue-200">
                        Legal & Compliance
                    </div>
                    <h1 className="text-3xl md:text-5xl font-extrabold text-slate-900 tracking-tight mb-3">
                        Privacy Policy
                    </h1>
                    <p className="text-slate-600 text-sm md:text-base">
                        Last Updated: <span className="font-semibold text-slate-800">{lastUpdated}</span>
                    </p>
                </div>
            </section>

            {/* Content Section */}
            <section className="py-12 px-6 bg-white">
                <div className="max-w-4xl mx-auto prose prose-slate text-slate-700 leading-relaxed space-y-8">
                    <div>
                        <h2 className="text-xl font-bold text-slate-900 mb-3 border-b pb-2">1. Introduction</h2>
                        <p>
                            BTL (&quot;we&quot;, &quot;our&quot;, or &quot;us&quot;) operates precision engineering and manufacturing facilities located at Hosur, Tamil Nadu, India. We are committed to protecting the privacy, confidentiality, and security of our clients, suppliers, visitors, and partners.
                        </p>
                        <p>
                            This Privacy Policy describes how we collect, store, protect, and process information obtained through our website, quotation inquiry forms, and customer interactions.
                        </p>
                    </div>

                    <div>
                        <h2 className="text-xl font-bold text-slate-900 mb-3 border-b pb-2">2. Information We Collect</h2>
                        <p>We collect information necessary to fulfill manufacturing inquiries, quotation requests, and client engagements:</p>
                        <ul className="list-disc pl-6 space-y-2">
                            <li>
                                <strong>Contact Information:</strong> Name, professional email address, company name, phone number, and physical billing/shipping address.
                            </li>
                            <li>
                                <strong>Technical & Engineering Files:</strong> 2D/3D CAD models, drawings, technical specifications, and RFQ documents submitted for quotation or component fabrication.
                            </li>
                            <li>
                                <strong>Transaction Records:</strong> Invoices, purchase orders, component batch numbers, delivery challans, and payment receipts.
                            </li>
                            <li>
                                <strong>Technical Metadata:</strong> Browser type, operating system, IP address, and general session activity collected automatically for operational diagnostics and cybersecurity.
                            </li>
                        </ul>
                    </div>

                    <div>
                        <h2 className="text-xl font-bold text-slate-900 mb-3 border-b pb-2">3. Intellectual Property & Technical Confidentiality</h2>
                        <p>
                            In the automotive and aerospace precision engineering sectors, intellectual property protection is paramount. Any engineering drawings, STEP/IGES files, tolerances, or proprietary designs uploaded to our platform are treated as strictly confidential proprietary information:
                        </p>
                        <ul className="list-disc pl-6 space-y-2">
                            <li>Drawings and RFQs are accessed strictly by authorized engineers and estimators.</li>
                            <li>Files are stored within access-controlled private infrastructure with rigorous row-level security and authentication policies.</li>
                            <li>We never publish, sell, license, or disclose customer CAD files to third parties without prior written Non-Disclosure Agreement (NDA) authorization.</li>
                        </ul>
                    </div>

                    <div>
                        <h2 className="text-xl font-bold text-slate-900 mb-3 border-b pb-2">4. How We Use Your Information</h2>
                        <p>Collected data is used strictly for legitimate commercial and engineering purposes:</p>
                        <ul className="list-disc pl-6 space-y-2">
                            <li>Generating formal engineering price quotations and feasibility assessments.</li>
                            <li>Processing sales orders, manufacturing workflows, and logistics dispatch.</li>
                            <li>Dispatching automated notification alerts and transactional updates via verified email servers.</li>
                            <li>Complying with statutory audits, ISO 9001:2015 quality standards, and tax regulations (GST/e-invoicing).</li>
                            <li>Enforcing application security and safeguarding our digital systems against unauthorized access.</li>
                        </ul>
                    </div>

                    <div>
                        <h2 className="text-xl font-bold text-slate-900 mb-3 border-b pb-2">5. Data Retention & Security Measures</h2>
                        <p>
                            We employ modern security controls, including parameterized database transactions, Row-Level Security (RLS), cryptographic password hashing (bcrypt), TLS encryption in transit, and role-based access restrictions (RBAC). 
                        </p>
                        <p>
                            Records are retained only for as long as required to fulfill commercial engagements, provide warranty support, and comply with statutory retention mandates under Indian corporate and tax laws.
                        </p>
                    </div>

                    <div>
                        <h2 className="text-xl font-bold text-slate-900 mb-3 border-b pb-2">6. Cookies & Tracking Technologies</h2>
                        <p>
                            Our platform uses strictly necessary cookies and session tokens required for authentication, security validation, and CSRF defense. We do not sell user data to advertising brokers or behavioral tracking networks.
                        </p>
                    </div>

                    <div>
                        <h2 className="text-xl font-bold text-slate-900 mb-3 border-b pb-2">7. Contact Information & Data Inquiries</h2>
                        <p>
                            For inquiries regarding this Privacy Policy, Non-Disclosure Agreements (NDAs), or your stored contact details, please reach out directly:
                        </p>
                        <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 mt-3 space-y-1">
                            <p className="font-semibold text-slate-900">BTL Automotive & Aerospace Precision Components</p>
                            <p className="text-sm">Location: Hosur, Tamil Nadu, India</p>
                            <p className="text-sm">Email: <a href="mailto:dinakaran@btlengg.com" className="text-blue-600 hover:underline">dinakaran@btlengg.com</a></p>
                            <p className="text-sm">Phone: <a href="tel:+918610354754" className="text-blue-600 hover:underline">+91 86103 54754</a></p>
                        </div>
                    </div>

                    <div className="pt-6 border-t border-slate-200 flex items-center justify-between">
                        <Link href="/" className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                            &larr; Back to Home
                        </Link>
                        <Link href="/terms" className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                            View Terms and Conditions &rarr;
                        </Link>
                    </div>
                </div>
            </section>
        </main>
    );
}
