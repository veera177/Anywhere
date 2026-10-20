import { useEffect, useState } from 'react';
import { checkDistrictAvailability } from '../services/districts';

// Districts come from the database (GET /api/districts) so the same Home page
// works for every district — including ones added later — with no hardcoding.
function Content({ onExploreDistricts }) {
    const [address, setAddress] = useState('');
    const [status, setStatus] = useState(null); // null, 'checking', 'success', 'error'
    const [checkedAddress, setCheckedAddress] = useState('');
    const [matchedArea, setMatchedArea] = useState(null);
    const [suggestion, setSuggestion] = useState(null);

    useEffect(() => {
        const query = address.trim();
        if (query.length < 2 || status === 'success') { setSuggestion(null); return undefined; }
        let cancelled = false;
        const timer = window.setTimeout(async () => {
            try { const result = await checkDistrictAvailability(query); if (!cancelled) setSuggestion(result?.district ? result : null); }
            catch { if (!cancelled) setSuggestion(null); }
        }, 300);
        return () => { cancelled = true; window.clearTimeout(timer); };
    }, [address, status]);

    const handleExplore = () => {
        const servicesSection = document.getElementById('services');
        if (servicesSection) {
            servicesSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    };

    const handleCheckAddress = (e) => {
        e.preventDefault();
        if (!address.trim()) {
            setStatus('error');
            setCheckedAddress('Please enter a valid address.');
            setMatchedArea(null);
            return;
        }

        setStatus('checking');
        checkDistrictAvailability(address).then((result) => {
            if (result?.available && result.district) {
                setStatus('success'); setCheckedAddress(address); setMatchedArea(result);
                localStorage.setItem('selectedDistrictId', String(result.district.code || result.district.id));
            } else {
                setStatus('error');
                setCheckedAddress(result?.nearestAvailableDistrict ? `Not available here yet. Nearest supported district: ${result.nearestAvailableDistrict.name}.` : 'No active service area matched that address.');
                setMatchedArea(null);
            }
        }).catch(() => { setStatus('error'); setCheckedAddress('Availability check is temporarily unavailable. Please try again.'); setMatchedArea(null); });
    };

    return (
        <section className="content" id="home">
            <div className="hero-grid">
                <div className="hero-copy">
                    <div className="hero-badge"><span aria-hidden="true">●</span> Fast & Reliable Delivery</div>
                    <h1>Everything You Need,<br />Just One Call Away!</h1>
                    <p className="subtitle">Quick. Trusted. Nearby.</p>
                    <p className="delivery-text">
                        Anywhere connects you with nearby restaurants, stores, pharmacies and courier partners,
                        delivering across Tamil Nadu with clear pricing and dependable local service.
                    </p>

                    <div className="hero-actions">
                        <button className="button1 hero-btn" onClick={handleExplore}>
                            Explore Services
                        </button>
                        <a href="tel:9876543210" className="hero-phone-btn">
                            Call 98765 43210
                        </a>
                        <button type="button" className="hero-district-btn" onClick={onExploreDistricts}>Explore districts →</button>
                    </div>

                    <div className="cta-section">
                        <div className="cta-item">
                            <span className="cta-icon" aria-hidden="true">01</span>
                            <div>
                                <span className="cta-label">Call to order</span>
                                <span className="cta-value">98765 43210</span>
                            </div>
                        </div>
                        <div className="cta-divider"></div>
                        <div className="cta-item">
                            <span className="cta-icon" aria-hidden="true">02</span>
                            <div>
                                <span className="cta-label">Order online</span>
                                <span className="cta-value">www.anywhere.com</span>
                            </div>
                        </div>
                    </div>

                    <form onSubmit={handleCheckAddress} className="address-checker">
                        <label htmlFor="address-input">Check delivery availability</label>
                        <div className="checker-input-group">
                            <div className="checker-input-wrap">
                                <input
                                    type="text"
                                    id="address-input"
                                    className="checker-input"
                                    placeholder="District, town, village or pincode"
                                    value={address}
                                    onChange={(e) => {
                                        setAddress(e.target.value);
                                        setStatus(null);
                                        setMatchedArea(null);
                                    }}
                                    autoComplete="off"
                                />
                                {suggestion?.district && (
                                    <div className="location-suggestions">
                                        <button type="button" onClick={() => { setAddress(suggestion.district.areaName ? `${suggestion.district.areaName}, ${suggestion.district.name}` : suggestion.district.name); setStatus(null); setMatchedArea(null); }}>
                                            <strong>{suggestion.district.areaName || suggestion.district.name}</strong>
                                            <span>{suggestion.district.name} · {suggestion.available ? 'Services available' : 'No active partners'}</span>
                                        </button>
                                    </div>
                                )}
                            </div>
                            <button type="submit" className="checker-btn">
                                {status === 'checking' ? 'Checking...' : 'Check Now'}
                            </button>
                        </div>

                        {status === 'success' && (
                            <div className="checker-result success">
                                Great news! We deliver to <strong>"{checkedAddress}"</strong> in <strong>{matchedArea?.district?.name}</strong>.
                            </div>
                        )}

                        {status === 'error' && (
                            <div className="checker-result error">{checkedAddress}</div>
                        )}
                    </form>
                </div>

                <div className="hero-visual" aria-hidden="true">
                    <div className="hero-route route-one"></div>
                    <div className="hero-route route-two"></div>
                    <div className="hero-delivery-card">
                        <div className="hero-delivery-mark">A</div>
                        <span>One call</span>
                        <strong>Everything delivered</strong>
                    </div>
                    <div className="hero-service-float hero-service-food"><span>Food</span><strong>Hot & local</strong></div>
                    <div className="hero-service-float hero-service-grocery"><span>Grocery</span><strong>Daily needs</strong></div>
                    <div className="hero-service-float hero-service-medicine"><span>Medicine</span><strong>Care nearby</strong></div>
                    <div className="hero-rider-dot"></div>
                </div>
            </div>
        </section>
    );
}

export default Content;
