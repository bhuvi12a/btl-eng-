import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
    title: 'Terms and Conditions | BTL Automotive & Aerospace Precision Components',
    description: 'Terms and conditions governing precision machining services, quotations, purchase orders, warranties, and component delivery by BTL.',
};

export default function TermsAndConditionsPage() {
    const lastUpdated = 'November 18, 2026';

    return (
        <main className="flex flex-col w-full pt-20">
            {/* Header Section */}
            <section className="bg-gradient-to-r from-sky-50 to-blue-50 text-slate-900 py-14 px-6 border-b border-slate-200">
                <div className="max-w-4xl mx-auto">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100 text-blue-800 text-xs font-semibold mb-3 border border-blue-200">
                        Legal Agreement
                    </div>
                    <h1 className="text-3xl md:text-5xl font-extrabold text-slate-900 tracking-tight mb-3">
                        Terms & Conditions
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
                        <h2 className="text-xl font-bold text-slate-900 mb-3 border-b pb-2">1. Scope of Agreement</h2>
                        <p>
                            These Terms and Conditions (&quot;Terms&quot;) govern the supply of manufacturing services, CNC/VMC machining, tooling, engineering design, component inspection, and related services by BTL (&quot;Supplier&quot;) to customers (&quot;Buyer&quot;).
                        </p>
                        <p>
                            By submitting a Request for Quotation (RFQ), accepting a quotation, or issuing a Purchase Order (PO), the Buyer agrees to be bound by these Terms unless explicitly superseded by a signed Master Services Agreement.
                        </p>
                    </div>

                    <div>
                        <h2 className="text-xl font-bold text-slate-900 mb-3 border-b pb-2">2. Quotations & Purchase Orders</h2>
                        <ul className="list-disc pl-6 space-y-2">
                            <li>
                                <strong>Validity:</strong> All quotations issued by BTL are valid for 30 calendar days from the date of issuance, subject to raw material market price fluctuations.
                            </li>
                            <li>
                                <strong>Order Acceptance:</strong> A contract is formed only upon written order confirmation or issuance of an official Sales Order acknowledging the Buyer&apos;s Purchase Order.
                            </li>
                            <li>
                                <strong>Technical Specifications:</strong> Quotations are based strictly on the 2D engineering drawings, 3D CAD files, material standards, and GD&amp;T callouts provided at the time of quotation. Any design changes require re-quotation.
                            </li>
                        </ul>
                    </div>

                    <div>
                        <h2 className="text-xl font-bold text-slate-900 mb-3 border-b pb-2">3. Quality Standards & Inspection</h2>
                        <ul className="list-disc pl-6 space-y-2">
                            <li>
                                <strong>Certifications:</strong> All components are manufactured under our ISO 9001:2015 quality management system in Hosur, Tamil Nadu.
                            </li>
                            <li>
                                <strong>Inspection Reports:</strong> Standard shipments include Dimensional Inspection Reports (DIR) or Certificates of Conformance (CoC) as agreed in the purchase order.
                            </li>
                            <li>
                                <strong>Material Test Certificates:</strong> Raw material test certificates (MTCs) for Steel, Aluminium, and Stainless Steel grades are supplied upon request.
                            </li>
                            <li>
                                <strong>Discrepancies:</strong> Any claim of non-conformance must be reported in writing within 15 calendar days of component delivery with supporting inspection evidence.
                            </li>
                        </ul>
                    </div>

                    <div>
                        <h2 className="text-xl font-bold text-slate-900 mb-3 border-b pb-2">4. Tooling & Intellectual Property</h2>
                        <ul className="list-disc pl-6 space-y-2">
                            <li>
                                <strong>Buyer IP:</strong> The Buyer retains full ownership of all proprietary product designs, patentable concepts, and technical CAD files submitted.
                            </li>
                            <li>
                                <strong>Supplier Know-How:</strong> BTL retains ownership of proprietary internal CNC toolpaths, jig designs, fixtures, and machining methodologies developed by BTL.
                            </li>
                            <li>
                                <strong>Dedicated Tooling:</strong> Tooling, molds, or fixtures specifically paid for by the Buyer remain the property of the Buyer and are dedicated exclusively to the Buyer&apos;s production batches.
                            </li>
                        </ul>
                    </div>

                    <div>
                        <h2 className="text-xl font-bold text-slate-900 mb-3 border-b pb-2">5. Delivery, Title & Risk</h2>
                        <ul className="list-disc pl-6 space-y-2">
                            <li>
                                <strong>Delivery Terms:</strong> Delivery terms (e.g., Ex-Works Hosur, FOB, or Door Delivery) are as stated in the confirmed Sales Order or Invoice.
                            </li>
                            <li>
                                <strong>Lead Times:</strong> Production lead times are estimated in good faith and commence upon receipt of confirmed order, approved drawings, and any agreed advance payment.
                            </li>
                            <li>
                                <strong>Title Transfer:</strong> Title to components passes to the Buyer upon full settlement of the corresponding invoice. Risk of loss passes according to the agreed Incoterms.
                            </li>
                        </ul>
                    </div>

                    <div>
                        <h2 className="text-xl font-bold text-slate-900 mb-3 border-b pb-2">6. Invoicing & Payment Terms</h2>
                        <ul className="list-disc pl-6 space-y-2">
                            <li>Payment terms are specified on commercial invoices (e.g., advance, Net 30, or milestone-based).</li>
                            <li>All statutory taxes (including applicable GST) are billed in accordance with the laws of the Government of India.</li>
                            <li>Overdue balances may incur commercial interest at 1.5% per month or the statutory ceiling.</li>
                        </ul>
                    </div>

                    <div>
                        <h2 className="text-xl font-bold text-slate-900 mb-3 border-b pb-2">7. Limitation of Liability & Force Majeure</h2>
                        <p>
                            In no event shall BTL be liable for indirect, incidental, consequential, or punitive damages (including loss of production, revenue, or third-party downtime). Total aggregate liability under any order shall not exceed the invoice value of the affected batch of components.
                        </p>
                        <p>
                            Neither party shall be liable for delays or non-performance caused by events beyond reasonable control (Force Majeure), including natural disasters, utility grid failures, raw material embargoes, or government restrictions.
                        </p>
                    </div>

                    <div>
                        <h2 className="text-xl font-bold text-slate-900 mb-3 border-b pb-2">8. Governing Law & Dispute Resolution</h2>
                        <p>
                            These Terms and any commercial transactions between the parties shall be governed by and construed in accordance with the laws of India. Any legal dispute shall be subject to the exclusive jurisdiction of the competent courts in Hosur / Krishnagiri District, Tamil Nadu.
                        </p>
                    </div>

                    <div>
                        <h2 className="text-xl font-bold text-slate-900 mb-3 border-b pb-2">9. Contact & Notices</h2>
                        <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 mt-3 space-y-1">
                            <p className="font-semibold text-slate-900">BTL Automotive & Aerospace Precision Components</p>
                            <p className="text-sm">Works: Hosur, Tamil Nadu, India</p>
                            <p className="text-sm">Email: <a href="mailto:dinakaran@btlengg.com" className="text-blue-600 hover:underline">dinakaran@btlengg.com</a></p>
                            <p className="text-sm">Phone: <a href="tel:+918610354754" className="text-blue-600 hover:underline">+91 86103 54754</a></p>
                        </div>
                    </div>

                    <div className="pt-6 border-t border-slate-200 flex items-center justify-between">
                        <Link href="/" className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                            &larr; Back to Home
                        </Link>
                        <Link href="/privacy" className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                            View Privacy Policy &rarr;
                        </Link>
                    </div>
                </div>
            </section>
        </main>
    );
}
