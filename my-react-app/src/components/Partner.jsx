import { useEffect, useRef, useState } from 'react';
import './Partner.css';

const benefits = [
    {
        svg: (
            <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M20 4L36 12v8c0 9.4-6.8 18.2-16 20-9.2-1.8-16-10.6-16-20v-8L20 4z"
                    stroke="currentColor" strokeWidth="2.2" strokeLinejoin="round"/>
                <path d="M14 20l4 4 8-8" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
        ),
        title: 'Zero Setup Cost',
        desc: 'No registration fees. No hidden charges. Go live in under 24 hours — completely free.',
    },
    {
        svg: (
            <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="12" cy="12" r="6" stroke="currentColor" strokeWidth="2.2"/>
                <circle cx="28" cy="28" r="6" stroke="currentColor" strokeWidth="2.2"/>
                <line x1="16" y1="16" x2="24" y2="24" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"/>
                <circle cx="28" cy="12" r="4" stroke="currentColor" strokeWidth="2"/>
                <line x1="24" y1="14" x2="16" y2="14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
        ),
        title: '10x Customer Reach',
        desc: 'Instantly tap into 50,000+ active users searching for exactly what you sell — every day.',
    },
    {
        svg: (
            <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="4" y="10" width="32" height="22" rx="3" stroke="currentColor" strokeWidth="2.2"/>
                <polyline points="4,16 20,24 36,16" stroke="currentColor" strokeWidth="2.2" strokeLinejoin="round"/>
            </svg>
        ),
        title: 'Same-Day Settlements',
        desc: 'Your earnings are transferred daily — no waiting, no delays. Cash flow that keeps your business healthy.',
    },
    {
        svg: (
            <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="6" y="14" width="28" height="18" rx="3" stroke="currentColor" strokeWidth="2.2"/>
                <path d="M14 14V11a6 6 0 0112 0v3" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"/>
                <circle cx="20" cy="23" r="3" stroke="currentColor" strokeWidth="2.2"/>
            </svg>
        ),
        title: 'Our Fleet, Your Freedom',
        desc: 'No delivery boys needed. No logistics headache. Anywhere handles every delivery — you just prepare.',
    },
    {
        svg: (
            <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="4" y="6" width="32" height="28" rx="3" stroke="currentColor" strokeWidth="2.2"/>
                <line x1="4" y1="14" x2="36" y2="14" stroke="currentColor" strokeWidth="2.2"/>
                <path d="M12 22h4M20 22h8M12 28h6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
        ),
        title: 'Smart Business Dashboard',
        desc: 'Live orders, revenue analytics, customer reviews — a partner panel built for smart decisions.',
    },
    {
        svg: (
            <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="20" cy="14" r="6" stroke="currentColor" strokeWidth="2.2"/>
                <path d="M8 36c0-6.627 5.373-12 12-12s12 5.373 12 12" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"/>
                <path d="M28 18l2 2 4-4" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
        ),
        title: 'Dedicated Partner Support',
        desc: '7-day dedicated support team. For onboarding, disputes, or anything in between — we\'ve got you.',
    },
];

const steps = [
    { number: '01', title: 'Register Free', desc: 'Fill a simple form. Go live the same day.' },
    { number: '02', title: 'List Your Products', desc: 'Add your items. We handle the visibility.' },
    { number: '03', title: 'Start Receiving Orders', desc: 'Our app notifies you instantly with every order.' },
    { number: '04', title: 'Get Paid Daily', desc: 'Revenue hits your account every evening. Simple.' },
];

function Partner() {
    const [sectionVisible, setSectionVisible] = useState(false);
    const [stepsVisible, setStepsVisible] = useState(false);
    const sectionRef = useRef();
    const stepsRef = useRef();

    useEffect(() => {
        const obs1 = new IntersectionObserver(
            ([entry]) => { if (entry.isIntersecting) { setSectionVisible(true); obs1.disconnect(); } },
            { threshold: 0.1 }
        );
        const obs2 = new IntersectionObserver(
            ([entry]) => { if (entry.isIntersecting) { setStepsVisible(true); obs2.disconnect(); } },
            { threshold: 0.2 }
        );
        if (sectionRef.current) obs1.observe(sectionRef.current);
        if (stepsRef.current) obs2.observe(stepsRef.current);
        return () => { obs1.disconnect(); obs2.disconnect(); };
    }, []);

    return (
        <section className="partner-section" id="partner">

            {/* ── HERO BANNER ── */}
            <div className="partner-hero">
                <div className="partner-hero-text">
                    <span className="partner-eyebrow">FOR RESTAURANTS · PHARMACIES · STORES</span>
                    <h2 className="partner-hero-title">
                        Grow Your Business.<br />
                        <em>We Handle the Rest.</em>
                    </h2>
                    <p className="partner-hero-sub">
                        Join 500+ thriving local businesses already using Anywhere to double their
                        revenue without doubling their effort. No logistics. No headaches. Just growth.
                    </p>
                    <div className="partner-hero-actions">
                        <a href="tel:9876543210" className="partner-btn-primary">
                            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" width="18" height="18">
                                <path d="M6.6 10.8c1.4 2.8 3.8 5.1 6.6 6.6l2.2-2.2c.3-.3.7-.4 1-.2 1.1.4 2.3.6 3.6.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1C10.6 21 3 13.4 3 4c0-.6.4-1 1-1h3.5c.6 0 1 .4 1 1 0 1.3.2 2.5.6 3.6.1.3 0 .7-.2 1L6.6 10.8z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
                            </svg>
                            Call to Become a Partner
                        </a>
                        <span className="partner-contact-note">📞 98765 43210 · Mon–Sat, 9AM–6PM</span>
                    </div>
                </div>

                {/* ── Decorative black & white stat block ── */}
                <div className="partner-hero-stats">
                    <div className="phs-card phs-dark">
                        <strong>500+</strong>
                        <span>Active Partners</span>
                    </div>
                    <div className="phs-card phs-light">
                        <strong>₹2 Cr+</strong>
                        <span>Partner Revenue Generated</span>
                    </div>
                    <div className="phs-card phs-light">
                        <strong>24 hrs</strong>
                        <span>Onboarding Time</span>
                    </div>
                    <div className="phs-card phs-dark">
                        <strong>0 ₹</strong>
                        <span>Setup Fee</span>
                    </div>
                </div>
            </div>

            {/* ── BENEFITS GRID ── */}
            <div className="partner-benefits-header">
                <h3>Everything You Get as an Anywhere Partner</h3>
                <p>Built for small businesses. Designed to scale with you.</p>
            </div>

            <div
                className={`partner-benefits-grid ${sectionVisible ? 'pb-visible' : ''}`}
                ref={sectionRef}
            >
                {benefits.map((b, i) => (
                    <div
                        className="partner-benefit-card"
                        key={i}
                        style={{ transitionDelay: `${i * 80}ms` }}
                    >
                        <div className="pb-icon">{b.svg}</div>
                        <h4 className="pb-title">{b.title}</h4>
                        <p className="pb-desc">{b.desc}</p>
                    </div>
                ))}
            </div>

            {/* ── HOW IT WORKS ── */}
            <div className="partner-steps-wrap" ref={stepsRef}>
                <div className="partner-steps-header">
                    <h3>How to Get Started in 4 Steps</h3>
                    <p>From sign-up to first order — faster than you think.</p>
                </div>
                <div className={`partner-steps-grid ${stepsVisible ? 'ps-visible' : ''}`}>
                    {steps.map((step, i) => (
                        <div
                            className="partner-step"
                            key={i}
                            style={{ transitionDelay: `${i * 120}ms` }}
                        >
                            <span className="ps-number">{step.number}</span>
                            <h4 className="ps-title">{step.title}</h4>
                            <p className="ps-desc">{step.desc}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* ── BOTTOM CTA ── */}
            <div className="partner-cta-bar">
                <div className="partner-cta-left">
                    <strong>Ready to grow? Let's make it happen.</strong>
                    <p>No commitment. No setup cost. Just opportunity.</p>
                </div>
                <a href="tel:9876543210" className="partner-cta-action">
                    Become a Partner Today →
                </a>
            </div>

        </section>
    );
}

export default Partner;