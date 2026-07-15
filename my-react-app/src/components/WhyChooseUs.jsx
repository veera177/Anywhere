import { useEffect, useRef, useState } from 'react';
import './WhyChooseUs.css';

const stats = [
    {
        svg: (
            <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="24" cy="24" r="22" stroke="currentColor" strokeWidth="2.5"/>
                <polyline points="24,12 24,24 32,30" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
        ),
        number: '≤ 30 min',
        label: 'Guaranteed Delivery',
        sub: 'Faster than any competitor in your city.',
    },
    {
        svg: (
            <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="6" y="14" width="36" height="26" rx="3" stroke="currentColor" strokeWidth="2.5"/>
                <path d="M16 14V10a8 8 0 0116 0v4" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
                <circle cx="24" cy="27" r="4" stroke="currentColor" strokeWidth="2.5"/>
            </svg>
        ),
        number: '1,00,000+',
        label: 'Orders Delivered',
        sub: 'Every single one on time & intact.',
    },
    {
        svg: (
            <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                <polygon points="24,5 29.5,18.5 44,19.5 33,29.5 36.5,44 24,36 11.5,44 15,29.5 4,19.5 18.5,18.5" stroke="currentColor" strokeWidth="2.5" strokeLinejoin="round"/>
            </svg>
        ),
        number: '4.9 / 5',
        label: 'Customer Rating',
        sub: 'Rated #1 delivery app in Tamil Nadu.',
    },
    {
        svg: (
            <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M8 36V20l16-12 16 12v16a2 2 0 01-2 2H10a2 2 0 01-2-2z" stroke="currentColor" strokeWidth="2.5" strokeLinejoin="round"/>
                <rect x="18" y="28" width="12" height="10" rx="1" stroke="currentColor" strokeWidth="2.5"/>
            </svg>
        ),
        number: '500+',
        label: 'Partner Stores',
        sub: 'Restaurants, pharmacies & supermarkets.',
    },
    {
        svg: (
            <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M24 4C13 4 4 13 4 24s9 20 20 20 20-9 20-20S35 4 24 4z" stroke="currentColor" strokeWidth="2.5"/>
                <path d="M16 24l6 6 10-12" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
        ),
        number: '99.3%',
        label: 'Order Accuracy',
        sub: 'Precision picking, zero compromise.',
    },
    {
        svg: (
            <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="18" cy="20" r="8" stroke="currentColor" strokeWidth="2.5"/>
                <circle cx="34" cy="20" r="8" stroke="currentColor" strokeWidth="2.5"/>
                <path d="M6 42c0-6.627 5.373-12 12-12h12c6.627 0 12 5.373 12 12" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
            </svg>
        ),
        number: '50,000+',
        label: 'Happy Customers',
        sub: 'Real people. Real smiles. Every day.',
    },
];

const features = [
    {
        svg: (
            <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M20 4L4 12v8c0 9 6.8 17.4 16 19.4C29.2 37.4 36 29 36 20v-8L20 4z" stroke="currentColor" strokeWidth="2.2" strokeLinejoin="round"/>
                <path d="M14 20l4 4 8-8" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
        ),
        title: 'Bank-Level Security',
        desc: 'Your payments and personal data are encrypted end-to-end. Shop with complete peace of mind.',
    },
    {
        svg: (
            <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="20" cy="20" r="16" stroke="currentColor" strokeWidth="2.2"/>
                <path d="M20 10v10l6 4" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
        ),
        title: 'Real-Time Live Tracking',
        desc: 'Watch your order move on a live map — from kitchen to your doorstep, every single step.',
    },
    {
        svg: (
            <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="6" y="6" width="28" height="28" rx="6" stroke="currentColor" strokeWidth="2.2"/>
                <path d="M13 20l5 5 9-9" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
        ),
        title: 'Zero Hidden Charges',
        desc: 'What you see is what you pay. Transparent pricing, no surprise fees — guaranteed.',
    },
    {
        svg: (
            <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M20 4l3.5 10.5H34l-8.8 6.4 3.3 10.5L20 25l-8.5 6.4 3.3-10.5L6 14.5h10.5z" stroke="currentColor" strokeWidth="2.2" strokeLinejoin="round"/>
            </svg>
        ),
        title: 'Premium Quality Promise',
        desc: 'Only verified, top-rated local stores partner with us. Your satisfaction is non-negotiable.',
    },
];

function WhyChooseUs() {
    const [isVisible, setIsVisible] = useState(false);
    const [featVisible, setFeatVisible] = useState(false);
    const statsRef = useRef();
    const featRef = useRef();

    useEffect(() => {
        const obs1 = new IntersectionObserver(
            ([entry]) => { if (entry.isIntersecting) { setIsVisible(true); obs1.disconnect(); } },
            { threshold: 0.15 }
        );
        const obs2 = new IntersectionObserver(
            ([entry]) => { if (entry.isIntersecting) { setFeatVisible(true); obs2.disconnect(); } },
            { threshold: 0.15 }
        );
        if (statsRef.current) obs1.observe(statsRef.current);
        if (featRef.current) obs2.observe(featRef.current);
        return () => { obs1.disconnect(); obs2.disconnect(); };
    }, []);

    return (
        <section className="wcu-section" id="why-choose-us">

            {/* ── HEADLINE BLOCK ── */}
            <div className="wcu-headline">
                <span className="wcu-eyebrow">TRUSTED BY THOUSANDS ACROSS TAMIL NADU</span>
                <h2 className="wcu-title">
                    Not Just Delivery.<br />
                    <em>A Promise We Keep.</em>
                </h2>
                <p className="wcu-desc">
                    Anywhere isn't just an app — it's your neighbourhood's most reliable partner.
                    Every order is a commitment. Every delivery is a guarantee.
                </p>
            </div>

            {/* ── STATS GRID ── */}
            <div
                className={`wcu-stats-grid ${isVisible ? 'wcu-visible' : ''}`}
                ref={statsRef}
            >
                {stats.map((stat, i) => (
                    <div
                        className="wcu-stat-card"
                        key={i}
                        style={{ transitionDelay: `${i * 90}ms` }}
                    >
                        <div className="wcu-stat-icon">{stat.svg}</div>
                        <strong className="wcu-stat-number">{stat.number}</strong>
                        <span className="wcu-stat-label">{stat.label}</span>
                        <p className="wcu-stat-sub">{stat.sub}</p>
                    </div>
                ))}
            </div>

            {/* ── DIVIDER ── */}
            <div className="wcu-divider">
                <span>What Makes Us Different</span>
            </div>

            {/* ── FEATURES GRID ── */}
            <div
                className={`wcu-features-grid ${featVisible ? 'wcu-feat-visible' : ''}`}
                ref={featRef}
            >
                {features.map((feat, i) => (
                    <div
                        className="wcu-feat-card"
                        key={i}
                        style={{ transitionDelay: `${i * 100}ms` }}
                    >
                        <div className="wcu-feat-icon">{feat.svg}</div>
                        <h3 className="wcu-feat-title">{feat.title}</h3>
                        <p className="wcu-feat-desc">{feat.desc}</p>
                    </div>
                ))}
            </div>

            {/* ── BOTTOM CTA STRIP ── */}
            <div className="wcu-bottom-strip">
                <p>
                    <strong>Join 50,000+ satisfied customers</strong> who trust Anywhere
                    for their daily essentials — food, grocery & medicines.
                </p>
                <a href="#services" className="wcu-cta-btn">Explore Services ↓</a>
            </div>

        </section>
    );
}

export default WhyChooseUs;
