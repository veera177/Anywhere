import React, { useEffect, useState } from 'react';
import './NewUserNotice.css';

/* ── Onboarding slides (merged from OnboardingIntro) ── */
const slides = [
    {
        label: 'District first',
        title: 'Anywhere works inside your district',
        text: 'Choose your district and order from trusted local food, grocery, medicine and courier partners near you.',
        icon: '📍',
    },
    {
        label: 'Local partners',
        title: 'No warehouses, only verified businesses',
        text: 'Food, grocery and medicine orders are handled by contracted local shops, so prices stay simple and familiar.',
        icon: '🏪',
    },
    {
        label: 'Dynamic courier',
        title: 'Courier partners are assigned automatically',
        text: 'For parcels, Anywhere finds an available delivery partner after pickup, drop and package details are confirmed.',
        icon: '🚚',
    },
    {
        label: 'Transparent fees',
        title: 'Delivery charges depend on district and distance',
        text: 'Your fee is calculated before payment using service type, district tier and route distance.',
        icon: '💳',
    },
];

/* ── Delivery fee tiers ── */
const feeRows = [
    { service: '🍽️ Food Delivery',    range: 'Up to 15 km',  tier1: '₹20–40',  tier2: '₹35–60',  tier3: '₹50–80' },
    { service: '🛒 Grocery',          range: 'Up to 15 km',  tier1: '₹15–35',  tier2: '₹30–55',  tier3: '₹45–70' },
    { service: '💊 Medicine',         range: 'Up to 20 km',  tier1: '₹20–45',  tier2: '₹35–65',  tier3: '₹55–85' },
    { service: '📦 Local Courier',    range: 'Up to 30 km',  tier1: '₹30–60',  tier2: '₹50–90',  tier3: '₹70–120' },
];

function NewUserNotice({ currentView }) {
    const [user, setUser]           = useState(null);
    const [slideIdx, setSlideIdx]   = useState(0);
    const [animDir, setAnimDir]     = useState('in');  // 'in' | 'out'
    const [showFees, setShowFees]   = useState(false);

    /* detect new user */
    useEffect(() => {
        try {
            const stored = JSON.parse(localStorage.getItem('user') || 'null');
            if (!stored?.id && !stored?.email) return;
            const key = `anywhere_notice_seen_${stored.id || stored.email}`;
            if (!localStorage.getItem(key)) {
                setUser({ ...stored, noticeKey: key });
            }
        } catch {
            setUser(null);
        }
    }, [currentView]);

    /* auto-advance slides */
    useEffect(() => {
        if (!user || showFees) return;
        const t = setInterval(() => {
            setAnimDir('out');
            setTimeout(() => {
                setSlideIdx(i => (i + 1) % slides.length);
                setAnimDir('in');
            }, 280);
        }, 3400);
        return () => clearInterval(t);
    }, [user, showFees]);

    const goToSlide = (idx) => {
        if (idx === slideIdx) return;
        setAnimDir('out');
        setTimeout(() => { setSlideIdx(idx); setAnimDir('in'); }, 280);
    };

    const close = () => {
        if (user?.noticeKey) localStorage.setItem(user.noticeKey, 'true');
        setUser(null);
        setShowFees(false);
    };

    if (!user) return null;

    const slide = slides[slideIdx];

    return (
        <div className="nwn-overlay" role="dialog" aria-modal="true" aria-labelledby="nwn-title">

            <section className="nwn-card">

                {/* ── Close ── */}
                <button className="nwn-close" onClick={close} aria-label="Close">✕</button>

                {/* ── LEFT PANEL: Visual + slides ── */}
                <div className="nwn-left">
                    {/* Brand globe */}
                    <div className="nwn-globe" aria-hidden="true">
                        <div className="nwn-core">
                            <span className="nwn-logo-text">Anywhere</span>
                            <span className="nwn-core-ring nwn-ring-1" />
                            <span className="nwn-core-ring nwn-ring-2" />
                            <span className="nwn-core-ring nwn-ring-3" />
                        </div>
                        <span className="nwn-node nwn-node--food"   aria-label="Food">🍽️</span>
                        <span className="nwn-node nwn-node--grocery" aria-label="Grocery">🛒</span>
                        <span className="nwn-node nwn-node--med"    aria-label="Medicine">💊</span>
                        <span className="nwn-node nwn-node--courier" aria-label="Courier">📦</span>
                        <span className="nwn-orbit nwn-orbit-1" aria-hidden="true" />
                        <span className="nwn-orbit nwn-orbit-2" aria-hidden="true" />
                    </div>

                    {/* Slide content */}
                    <div className={`nwn-slide-body nwn-slide--${animDir}`} key={slideIdx}>
                        <span className="nwn-slide-icon">{slide.icon}</span>
                        <span className="nwn-slide-label">{slide.label}</span>
                        <h2 className="nwn-slide-title" id="nwn-title">{slide.title}</h2>
                        <p className="nwn-slide-text">{slide.text}</p>
                    </div>

                    {/* Dot nav */}
                    <div className="nwn-dots" aria-label="Slide navigation">
                        {slides.map((s, i) => (
                            <button
                                key={s.label}
                                className={`nwn-dot${i === slideIdx ? ' nwn-dot--active' : ''}`}
                                onClick={() => goToSlide(i)}
                                aria-label={`Slide: ${s.label}`}
                            />
                        ))}
                    </div>
                </div>

                {/* ── RIGHT PANEL: Hub info + delivery fees + steps ── */}
                <div className="nwn-right">
                    <span className="nwn-eyebrow">Welcome to Anywhere</span>
                    <h3 className="nwn-section-title">Strategic Triangular Hub Distribution</h3>

                    {/* Triangle map (preserved from original) */}
                    <div className="nwn-triangle-wrap" aria-hidden="true">
                        <svg viewBox="0 0 100 100" className="nwn-triangle">
                            <defs>
                                <linearGradient id="triGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                                    <stop offset="0%" stopColor="#FFD700" stopOpacity="0.3" />
                                    <stop offset="100%" stopColor="#f59e0b" stopOpacity="0.08" />
                                </linearGradient>
                            </defs>
                            <polygon points="50,12 88,82 12,82" fill="url(#triGrad)" stroke="#f59e0b" strokeWidth="1.5" strokeDasharray="4 3" />
                            <circle cx="50" cy="12" r="5" fill="#f59e0b" />
                            <circle cx="88" cy="82" r="5" fill="#3b82f6" />
                            <circle cx="12" cy="82" r="5" fill="#10b981" />
                            <text x="50" y="8"  fontSize="7" textAnchor="middle" fill="#92400e" fontWeight="700">North Hub</text>
                            <text x="94" y="90" fontSize="7" textAnchor="end"    fill="#1e40af" fontWeight="700">Central</text>
                            <text x="6"  y="90" fontSize="7" textAnchor="start"  fill="#065f46" fontWeight="700">South</text>
                        </svg>
                    </div>

                    <p className="nwn-body-text">
                        We deploy a unique <strong>3-Hub Strategy (North, Central, South)</strong> in every district to guarantee maximum coverage for both urban and deep rural areas.
                    </p>

                    {/* Range pills */}
                    <div className="nwn-range-pills">
                        <span className="nwn-pill nwn-pill--food">🍽️ Food / Grocery · 15 km</span>
                        <span className="nwn-pill nwn-pill--med">💊 Medicine · 20 km</span>
                        <span className="nwn-pill nwn-pill--courier">📦 Courier · 30 km</span>
                    </div>

                    {/* Steps */}
                    <div className="nwn-steps">
                        <div className="nwn-step">
                            <span className="nwn-step-num">1</span>
                            <span>Choose a district &amp; service</span>
                        </div>
                        <div className="nwn-step">
                            <span className="nwn-step-num">2</span>
                            <span>Get assigned to the nearest hub</span>
                        </div>
                        <div className="nwn-step">
                            <span className="nwn-step-num">3</span>
                            <span>Fast delivery to your doorstep</span>
                        </div>
                    </div>

                    {/* Delivery Fees toggle */}
                    <button className="nwn-fees-toggle" onClick={() => setShowFees(v => !v)}>
                        {showFees ? '▲ Hide' : '▼ View'} Delivery Fee Breakdown
                    </button>

                    {showFees && (
                        <div className="nwn-fees-panel">
                            <p className="nwn-fees-note">
                                We charge only <strong>actual shop/restaurant price + delivery fee</strong>. No product markup.
                                Exact charge shown before you confirm.
                            </p>
                            <div className="nwn-fees-table-wrap">
                                <table className="nwn-fees-table">
                                    <thead>
                                        <tr>
                                            <th>Service</th>
                                            <th>Max Range</th>
                                            <th>Tier 1 (Urban)</th>
                                            <th>Tier 2 (Town)</th>
                                            <th>Tier 3 (Rural)</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {feeRows.map(row => (
                                            <tr key={row.service}>
                                                <td>{row.service}</td>
                                                <td>{row.range}</td>
                                                <td>{row.tier1}</td>
                                                <td>{row.tier2}</td>
                                                <td>{row.tier3}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* CTA */}
                    <button className="nwn-primary" onClick={close}>
                        Start using Anywhere
                        <span className="nwn-btn-arrow">→</span>
                        <span className="nwn-btn-shimmer" aria-hidden="true" />
                    </button>
                </div>

            </section>
        </div>
    );
}

export default NewUserNotice;
