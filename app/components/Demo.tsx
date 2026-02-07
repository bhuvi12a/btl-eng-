'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';

interface Testimonial {
    id: number;
    name: string;
    position: string;
    company: string;
    industry: string;
    content: string;
    rating: number;
    image: string;
    projectType: string;
}

const testimonials: Testimonial[] = [
    {
        id: 1,
        name: "Rajesh Kumar",
        position: "VP of Engineering",
        company: "AutoTech Industries",
        industry: "Automotive",
        content: "BTL Engineering has been our trusted partner for precision CNC components for over 3 years. Their attention to detail and zero-defect commitment has significantly improved our production line efficiency. The team's ability to handle complex geometries with micron-level tolerances is truly exceptional.",
        rating: 5,
        image: "/testimonials/client1.jpg",
        projectType: "Transmission Components"
    },
    {
        id: 2,
        name: "Sarah Mitchell",
        position: "Procurement Manager",
        company: "AeroSpace Dynamics",
        industry: "Aerospace",
        content: "Working with BTL has transformed our supply chain. Their ISO 9001:2015 certified processes and rigorous quality control give us complete confidence in every part. The DFM analysis they provided saved us 20% in material costs while improving part strength.",
        rating: 5,
        image: "/testimonials/client2.jpg",
        projectType: "Structural Fittings"
    },
    {
        id: 3,
        name: "Vikram Patel",
        position: "Chief Operations Officer",
        company: "Heavy Machinery Corp",
        industry: "Industrial",
        content: "BTL's forging capabilities are world-class. They delivered 5000+ hydraulic components with perfect consistency. Their rapid prototyping service helped us launch our new product line 2 months ahead of schedule. Exceptional engineering support throughout.",
        rating: 5,
        image: "/testimonials/client3.jpg",
        projectType: "Hydraulic Systems"
    },
    {
        id: 4,
        name: "Michael Chen",
        position: "Director of Manufacturing",
        company: "Precision Motors Ltd",
        industry: "Automotive",
        content: "The sheet metal fabrication quality from BTL is outstanding. Their laser cutting precision and bending accuracy have eliminated our rework completely. The team is responsive, professional, and always delivers on time. A true manufacturing partner.",
        rating: 5,
        image: "/testimonials/client4.jpg",
        projectType: "Chassis & Enclosures"
    },
    {
        id: 5,
        name: "Priya Sharma",
        position: "R&D Head",
        company: "Innovation Engineering",
        industry: "Aerospace",
        content: "BTL's R&D support and material testing capabilities are impressive. They helped us validate our new alloy specifications and provided valuable insights for process optimization. Their 3/4/5-axis CNC capabilities handled our most complex designs flawlessly.",
        rating: 5,
        image: "/testimonials/client5.jpg",
        projectType: "Prototype Development"
    },
    {
        id: 6,
        name: "David Thompson",
        position: "Supply Chain Director",
        company: "Global Auto Parts",
        industry: "Automotive",
        content: "Partnering with BTL has been a game-changer for our business. Their scalability, quality consistency, and competitive pricing have made them our preferred vendor. The engineering team's proactive communication and problem-solving approach is exemplary.",
        rating: 5,
        image: "/testimonials/client6.jpg",
        projectType: "Engine Components"
    }
];

export default function TestimonialsPage() {
    const [activeIndex, setActiveIndex] = useState(0);
    const [isAutoPlaying, setIsAutoPlaying] = useState(true);

    useEffect(() => {
        if (!isAutoPlaying) return;

        const interval = setInterval(() => {
            setActiveIndex((current) => (current + 1) % testimonials.length);
        }, 5000);

        return () => clearInterval(interval);
    }, [isAutoPlaying]);

    const handleDotClick = (index: number) => {
        setActiveIndex(index);
        setIsAutoPlaying(false);
    };

    const handlePrevious = () => {
        setActiveIndex((current) => (current - 1 + testimonials.length) % testimonials.length);
        setIsAutoPlaying(false);
    };

    const handleNext = () => {
        setActiveIndex((current) => (current + 1) % testimonials.length);
        setIsAutoPlaying(false);
    };

    return (
        <main className="flex flex-col w-full">
            {/* Hero Section */}
            <section className="pt-32 pb-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-sky-100 via-white to-sky-50 border-b border-sky-100">
                <div className="max-w-7xl mx-auto text-center">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-sky-100 border border-sky-200 text-sky-700 font-medium text-sm mb-6">
                        <span className="text-xl">⭐</span>
                        Trusted by Industry Leaders
                    </div>

                    <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-slate-900 tracking-tight mb-6 leading-[1.1]">
                        Client <span className="text-sky-500">Success Stories</span>
                    </h1>

                    <p className="text-xl text-slate-600 mb-8 max-w-3xl mx-auto leading-relaxed">
                        Discover how BTL Engineering delivers precision, quality, and reliability to global OEMs across automotive, aerospace, and industrial sectors.
                    </p>

                    <div className="flex flex-wrap justify-center gap-8 text-slate-600">
                        <div className="flex items-center gap-2">
                            <span className="text-2xl">🏆</span>
                            <span className="font-semibold">100+ Projects Delivered</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-2xl">⚡</span>
                            <span className="font-semibold">99.8% On-Time Delivery</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-2xl">✓</span>
                            <span className="font-semibold">Zero Defect Commitment</span>
                        </div>
                    </div>
                </div>
            </section>

            {/* Featured Testimonial Carousel */}
            <section className="py-20 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="relative">
                        {/* Main Testimonial Card */}
                        <div className="bg-gradient-to-br from-sky-50 to-white rounded-3xl border border-sky-100 shadow-2xl overflow-hidden">
                            <div className="grid lg:grid-cols-2 gap-0">
                                {/* Left Side - Content */}
                                <div className="p-8 md:p-12 lg:p-16 flex flex-col justify-center">
                                    <div className="mb-6">
                                        <span className="inline-block px-4 py-2 bg-sky-100 text-sky-700 rounded-full text-sm font-semibold mb-4">
                                            {testimonials[activeIndex].industry}
                                        </span>
                                        <div className="flex gap-1 mb-6">
                                            {[...Array(testimonials[activeIndex].rating)].map((_, i) => (
                                                <svg key={i} className="w-6 h-6 text-orange-500 fill-current" viewBox="0 0 20 20">
                                                    <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                                                </svg>
                                            ))}
                                        </div>
                                    </div>

                                    <blockquote className="text-lg md:text-xl text-slate-700 leading-relaxed mb-8 italic">
                                        "{testimonials[activeIndex].content}"
                                    </blockquote>

                                    <div className="flex items-center gap-4 mb-6">
                                        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-sky-400 to-sky-600 flex items-center justify-center text-white text-2xl font-bold shadow-lg">
                                            {testimonials[activeIndex].name.charAt(0)}
                                        </div>
                                        <div>
                                            <div className="font-bold text-slate-900 text-lg">
                                                {testimonials[activeIndex].name}
                                            </div>
                                            <div className="text-slate-600 text-sm">
                                                {testimonials[activeIndex].position}
                                            </div>
                                            <div className="text-sky-600 font-semibold text-sm">
                                                {testimonials[activeIndex].company}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="inline-flex items-center gap-2 text-sm text-slate-500">
                                        <span className="text-orange-500">📦</span>
                                        <span className="font-medium">Project: {testimonials[activeIndex].projectType}</span>
                                    </div>
                                </div>

                                {/* Right Side - Visual */}
                                <div className="relative bg-gradient-to-br from-sky-600 to-sky-800 p-8 md:p-12 lg:p-16 flex items-center justify-center min-h-[400px]">
                                    <div className="absolute inset-0 opacity-10">
                                        <div className="absolute top-10 left-10 w-32 h-32 border-4 border-white rounded-full"></div>
                                        <div className="absolute bottom-10 right-10 w-24 h-24 border-4 border-white rounded-lg rotate-45"></div>
                                        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-48 h-48 border-4 border-white rounded-full"></div>
                                    </div>

                                    <div className="relative z-10 text-center text-white">
                                        <div className="text-7xl md:text-8xl font-bold mb-4 opacity-90">
                                            {testimonials[activeIndex].rating}.0
                                        </div>
                                        <div className="text-xl md:text-2xl font-semibold mb-2">
                                            Perfect Rating
                                        </div>
                                        <div className="text-sky-200">
                                            Client Satisfaction Score
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Navigation Controls */}
                        <div className="flex items-center justify-center gap-4 mt-8">
                            <button
                                onClick={handlePrevious}
                                className="p-3 rounded-full bg-white border border-sky-200 text-sky-600 hover:bg-sky-50 hover:border-sky-300 transition-all shadow-md hover:shadow-lg"
                                aria-label="Previous testimonial"
                            >
                                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                </svg>
                            </button>

                            <div className="flex gap-2">
                                {testimonials.map((_, index) => (
                                    <button
                                        key={index}
                                        onClick={() => handleDotClick(index)}
                                        className={`transition-all duration-300 rounded-full ${index === activeIndex
                                            ? 'w-12 h-3 bg-sky-600'
                                            : 'w-3 h-3 bg-sky-200 hover:bg-sky-300'
                                            }`}
                                        aria-label={`Go to testimonial ${index + 1}`}
                                    />
                                ))}
                            </div>

                            <button
                                onClick={handleNext}
                                className="p-3 rounded-full bg-white border border-sky-200 text-sky-600 hover:bg-sky-50 hover:border-sky-300 transition-all shadow-md hover:shadow-lg"
                                aria-label="Next testimonial"
                            >
                                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>
            </section>

            {/* All Testimonials Grid */}
            <section className="py-20 bg-sky-50/50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl font-bold text-slate-900 mb-4">
                            What Our Clients Say
                        </h2>
                        <p className="text-lg text-slate-600 max-w-2xl mx-auto">
                            Real feedback from real partners who trust BTL Engineering for their critical manufacturing needs.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {testimonials.map((testimonial, index) => (
                            <div
                                key={testimonial.id}
                                className="bg-white rounded-2xl border border-sky-100 p-8 shadow-sm hover:shadow-xl transition-all duration-300 group hover:-translate-y-1"
                            >
                                {/* Rating */}
                                <div className="flex gap-1 mb-4">
                                    {[...Array(testimonial.rating)].map((_, i) => (
                                        <svg key={i} className="w-5 h-5 text-orange-500 fill-current" viewBox="0 0 20 20">
                                            <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                                        </svg>
                                    ))}
                                </div>

                                {/* Content */}
                                <p className="text-slate-700 leading-relaxed mb-6 line-clamp-4">
                                    "{testimonial.content}"
                                </p>

                                {/* Client Info */}
                                <div className="flex items-center gap-3 pt-6 border-t border-sky-100">
                                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-sky-400 to-sky-600 flex items-center justify-center text-white font-bold shadow-md">
                                        {testimonial.name.charAt(0)}
                                    </div>
                                    <div className="flex-1">
                                        <div className="font-bold text-slate-900">
                                            {testimonial.name}
                                        </div>
                                        <div className="text-sm text-slate-600">
                                            {testimonial.position}
                                        </div>
                                        <div className="text-sm text-sky-600 font-semibold">
                                            {testimonial.company}
                                        </div>
                                    </div>
                                </div>

                                {/* Industry Badge */}
                                <div className="mt-4">
                                    <span className="inline-block px-3 py-1 bg-sky-50 text-sky-700 rounded-full text-xs font-semibold">
                                        {testimonial.industry}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Certifications Section */}
            <section className="py-20 bg-gradient-to-br from-white to-sky-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <span className="text-sky-600 font-semibold tracking-wider uppercase text-sm">Quality Assurance</span>
                        <h2 className="text-4xl font-bold text-slate-900 mt-2 mb-4">
                            Certified Excellence
                        </h2>
                        <p className="text-lg text-slate-600 max-w-2xl mx-auto">
                            Our commitment to quality is validated by international standards and rigorous certification processes.
                        </p>
                    </div>

                    <div className="grid lg:grid-cols-2 gap-12 items-center">
                        {/* Certificate Image */}
                        <div className="relative">
                            <div className="bg-white rounded-2xl shadow-2xl p-4 border border-sky-100 hover:shadow-3xl transition-shadow duration-300">
                                <div className="relative aspect-[3/4] rounded-lg overflow-hidden">
                                    <Image
                                        src="/certificates/iso-9001-2015.png"
                                        alt="ISO 9001:2015 Certificate - BTL Engineering"
                                        fill
                                        className="object-contain"
                                    />
                                </div>
                            </div>
                            {/* Verified Badge */}
                            <div className="absolute -top-4 -right-4 bg-orange-600 text-white px-6 py-3 rounded-full shadow-lg flex items-center gap-2 font-bold">
                                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                </svg>
                                Verified
                            </div>
                        </div>

                        {/* Certificate Details */}
                        <div className="space-y-8">
                            <div>
                                <h3 className="text-3xl font-bold text-slate-900 mb-4">
                                    ISO 9001:2015 Certified
                                </h3>
                                <p className="text-lg text-slate-600 leading-relaxed mb-6">
                                    BTL Engineering is certified by <strong>RAPL (Royal Aerotech Pvt. Ltd.)</strong> for Quality Management Systems, ensuring consistent delivery of precision components that meet international standards.
                                </p>

                                <div className="bg-sky-50 border border-sky-200 rounded-xl p-6 mb-6">
                                    <div className="grid grid-cols-2 gap-4 text-sm">
                                        <div>
                                            <div className="text-sky-600 font-semibold mb-1">Certificate Number</div>
                                            <div className="text-slate-900 font-mono">E202408129937</div>
                                        </div>
                                        <div>
                                            <div className="text-sky-600 font-semibold mb-1">Valid Until</div>
                                            <div className="text-slate-900">08/08/2027</div>
                                        </div>
                                        <div>
                                            <div className="text-sky-600 font-semibold mb-1">Scope</div>
                                            <div className="text-slate-900">Precision Components</div>
                                        </div>
                                        <div>
                                            <div className="text-sky-600 font-semibold mb-1">Industry</div>
                                            <div className="text-slate-900">Automobile</div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <h4 className="text-xl font-bold text-slate-900 mb-4">Quality Commitments</h4>
                                <ul className="space-y-3">
                                    {[
                                        'Zero-defect manufacturing processes',
                                        'Continuous improvement & innovation',
                                        'Rigorous quality control at every stage',
                                        'Traceability & documentation',
                                        'Customer satisfaction guarantee'
                                    ].map((item, i) => (
                                        <li key={i} className="flex items-start gap-3">
                                            <svg className="w-6 h-6 text-orange-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                            </svg>
                                            <span className="text-slate-700 font-medium">{item}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Stats Section */}
            <section className="py-20 bg-gradient-to-br from-sky-600 to-sky-800 text-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl font-bold mb-4">
                            Proven Track Record
                        </h2>
                        <p className="text-sky-100 text-lg">
                            Numbers that speak for our commitment to excellence
                        </p>
                    </div>

                    <div className="grid md:grid-cols-4 gap-8">
                        {[
                            { number: "100+", label: "Projects Completed", icon: "🎯" },
                            { number: "50+", label: "Global Clients", icon: "🌍" },
                            { number: "99.8%", label: "On-Time Delivery", icon: "⚡" },
                            { number: "5.0", label: "Average Rating", icon: "⭐" }
                        ].map((stat, index) => (
                            <div
                                key={index}
                                className="text-center p-8 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-white/20 transition-all duration-300"
                            >
                                <div className="text-5xl mb-4">{stat.icon}</div>
                                <div className="text-5xl font-bold mb-2">{stat.number}</div>
                                <div className="text-sky-100 font-medium">{stat.label}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Celebration Section */}
            <section className="py-20 bg-slate-50 border-t border-slate-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <span className="text-orange-600 font-semibold tracking-wider uppercase text-sm">Our Culture</span>
                        <h2 className="text-4xl font-bold text-slate-900 mt-2 mb-4">
                            Tradition Meets Technology
                        </h2>
                        <p className="text-lg text-slate-600 max-w-2xl mx-auto">
                            At BTL Engineering, we celebrate our heritage and the team spirit that drives our innovation. From Ayudha Puja to team milestones, our culture is our strength.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 auto-rows-[280px]">
                        {/* Image 6 - Team Photo - Extra Large */}
                        <div className="lg:col-span-2 lg:row-span-2 rounded-2xl overflow-hidden relative shadow-lg group min-h-[280px]">
                            <Image
                                src="/celebration/celebration-6.jpg"
                                alt="BTL Engineering Team"
                                fill
                                className="object-cover group-hover:scale-105 transition-transform duration-500"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-6">
                                <p className="text-white font-medium text-lg">Our BTL Family</p>
                            </div>
                        </div>

                        {/* Image 1 */}
                        <div className="rounded-2xl overflow-hidden relative shadow-lg group min-h-[280px]">
                            <Image
                                src="/celebration/celebration-1.jpg"
                                alt="BTL Factory Celebration"
                                fill
                                className="object-cover group-hover:scale-105 transition-transform duration-500"
                            />
                        </div>

                        {/* Image 7 - Leadership */}
                        <div className="rounded-2xl overflow-hidden relative shadow-lg group min-h-[280px]">
                            <Image
                                src="/celebration/celebration-7.jpg"
                                alt="BTL Leadership"
                                fill
                                className="object-cover group-hover:scale-105 transition-transform duration-500"
                            />
                        </div>

                        {/* Image 3 */}
                        <div className="rounded-2xl overflow-hidden relative shadow-lg group min-h-[280px]">
                            <Image
                                src="/celebration/celebration-3.jpg"
                                alt="Machine Shop Ceremony"
                                fill
                                className="object-cover group-hover:scale-105 transition-transform duration-500"
                            />
                        </div>

                        {/* Image 4 */}
                        <div className="rounded-2xl overflow-hidden relative shadow-lg group min-h-[280px]">
                            <Image
                                src="/celebration/celebration-4.jpg"
                                alt="Ayudha Puja Decoration"
                                fill
                                className="object-cover group-hover:scale-105 transition-transform duration-500"
                            />
                        </div>

                        {/* Image 2 */}
                        <div className="lg:col-span-2 rounded-2xl overflow-hidden relative shadow-lg group min-h-[280px]">
                            <Image
                                src="/celebration/celebration-2.jpg"
                                alt="Team Tradition"
                                fill
                                className="object-cover group-hover:scale-105 transition-transform duration-500"
                            />
                        </div>

                        {/* Image 5 */}
                        <div className="rounded-2xl overflow-hidden relative shadow-lg group min-h-[280px]">
                            <Image
                                src="/celebration/celebration-5.jpg"
                                alt="Workspace Blessings"
                                fill
                                className="object-cover group-hover:scale-105 transition-transform duration-500"
                            />
                        </div>

                        {/* Image 8 - Drilling Machine */}
                        <div className="rounded-2xl overflow-hidden relative shadow-lg group min-h-[280px]">
                            <Image
                                src="/celebration/celebration-8.jpg"
                                alt="Decorated Manufacturing Equipment"
                                fill
                                className="object-cover group-hover:scale-105 transition-transform duration-500"
                            />
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-20 bg-white">
                <div className="max-w-4xl mx-auto px-4 text-center">
                    <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6">
                        Ready to Join Our Success Stories?
                    </h2>
                    <p className="text-xl text-slate-600 mb-10 max-w-2xl mx-auto">
                        Partner with BTL Engineering for precision manufacturing that exceeds expectations. Let's discuss your project requirements.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <a
                            href="/contact"
                            className="px-10 py-5 bg-orange-600 text-white font-bold text-lg rounded-lg hover:bg-orange-500 transition-colors shadow-lg shadow-orange-900/20"
                        >
                            Request a Quote
                        </a>
                        <a
                            href="/services"
                            className="px-10 py-5 bg-white text-sky-600 font-bold text-lg rounded-lg border-2 border-sky-200 hover:bg-sky-50 transition-colors"
                        >
                            View Capabilities
                        </a>
                    </div>
                </div>
            </section>
        </main>
    );
}
