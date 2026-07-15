import { useMemo, useState } from 'react';

const serviceAreas = [
    { name: 'Chennai', hub: 'Chennai Central', keywords: ['chennai', 'anna nagar', 't nagar', 'velachery', 'tambaram', '600'] },
    { name: 'Madurai', hub: 'Madurai Main', keywords: ['madurai', 'kk nagar', '625'] },
    { name: 'Coimbatore', hub: 'Town Hall', keywords: ['coimbatore', 'kovai', 'gandhipuram', 'rs puram', '641'] },
    { name: 'Dindigul', hub: 'Dindigul Bus Stand', keywords: ['dindigul', 'palani', 'oddanchatram', '624'] },
    { name: 'Salem', hub: 'Salem Junction', keywords: ['salem', 'hasthampatti', 'fairlands', '636'] },
    { name: 'Tiruchirappalli', hub: 'Trichy Central', keywords: ['trichy', 'tiruchirappalli', 'srirangam', '620'] },
    { name: 'Thanjavur', hub: 'Old Bus Stand', keywords: ['thanjavur', 'tanjore', 'kumbakonam', '613', '612'] },
    { name: 'Tirunelveli', hub: 'Tirunelveli Junction', keywords: ['tirunelveli', 'nellai', 'palayamkottai', '627'] },
    { name: 'Erode', hub: 'Erode Bus Stand', keywords: ['erode', 'perundurai', '638'] },
    { name: 'Vellore', hub: 'Vellore Fort', keywords: ['vellore', 'katpadi', '632'] },
    { name: 'Theni', hub: 'Theni Main', keywords: ['theni', 'cumbum', 'bodinayakanur', '6255'] },
    { name: 'Kanyakumari', hub: 'Nagercoil', keywords: ['kanyakumari', 'nagercoil', 'marthandam', '629'] },
    { name: 'Tiruppur', hub: 'Tiruppur Old Bus Stand', keywords: ['tiruppur', 'avinashi', 'palladam', '6416'] },
    { name: 'Namakkal', hub: 'Namakkal Bus Stand', keywords: ['namakkal', 'rasipuram', 'tiruchengode', '637'] },
    { name: 'Karur', hub: 'Karur Main', keywords: ['karur', 'kulithalai', '639'] },
    { name: 'Sivakasi', hub: 'Sivakasi Town', keywords: ['sivakasi', 'virudhunagar', '626'] },
    { name: 'Rajapalayam', hub: 'Rajapalayam Main Road', keywords: ['rajapalayam', 'srivilliputhur', 'watrap', '6261'] },
    { name: 'Thoothukudi', hub: 'Thoothukudi Old Bus Stand', keywords: ['thoothukudi', 'tuticorin', 'kovilpatti', '628'] },
    { name: 'Tenkasi', hub: 'Tenkasi Main', keywords: ['tenkasi', 'sankarankovil', 'courtrallam', '6278'] },
    { name: 'Cuddalore', hub: 'Cuddalore Bus Stand', keywords: ['cuddalore', 'panruti', 'chidambaram', '607'] },
    { name: 'Mayiladuthurai', hub: 'Mayiladuthurai Junction', keywords: ['mayiladuthurai', 'sirkazhi', '609'] },
    { name: 'Nagapattinam', hub: 'Nagapattinam Main', keywords: ['nagapattinam', 'velankanni', 'thiruvarur', '610', '611'] },
    { name: 'Karaikudi', hub: 'Karaikudi New Bus Stand', keywords: ['karaikudi', 'sivagangai', 'devakottai', '630'] },
    { name: 'Ramanathapuram', hub: 'Ramanathapuram Main', keywords: ['ramanathapuram', 'ramnad', 'paramakudi', 'rameswaram', '623'] },
    { name: 'Pudukkottai', hub: 'Pudukkottai Bus Stand', keywords: ['pudukkottai', 'alangudi', '622'] },
    { name: 'Ariyalur', hub: 'Ariyalur Main', keywords: ['ariyalur', 'jayankondam', '6217'] },
    { name: 'Perambalur', hub: 'Perambalur New Bus Stand', keywords: ['perambalur', 'veppanthattai', '6212'] },
    { name: 'Villupuram', hub: 'Villupuram Junction', keywords: ['villupuram', 'viluppuram', 'gingee', '605'] },
    { name: 'Kallakurichi', hub: 'Kallakurichi Main', keywords: ['kallakurichi', 'ulundurpet', '606'] },
    { name: 'Tiruvannamalai', hub: 'Tiruvannamalai Temple Area', keywords: ['tiruvannamalai', 'arni', 'arani', '6066'] },
    { name: 'Kanchipuram', hub: 'Kanchipuram Bus Stand', keywords: ['kanchipuram', 'sriperumbudur', '631'] },
    { name: 'Chengalpattu', hub: 'Chengalpattu Junction', keywords: ['chengalpattu', 'mahindra city', '603'] },
    { name: 'Tiruvallur', hub: 'Tiruvallur Main', keywords: ['tiruvallur', 'avadi', 'ponneri', '602'] },
    { name: 'Ranipet', hub: 'Ranipet Main', keywords: ['ranipet', 'arcot', 'walajapet', '6324'] },
    { name: 'Ambur', hub: 'Ambur Bazaar', keywords: ['ambur', 'vaniyambadi', '635'] },
    { name: 'Hosur', hub: 'Hosur Bus Stand', keywords: ['hosur', 'krishnagiri', '6351'] },
    { name: 'Dharmapuri', hub: 'Dharmapuri Main', keywords: ['dharmapuri', 'harur', '6367'] },
    { name: 'Pollachi', hub: 'Pollachi Bus Stand', keywords: ['pollachi', 'anaimalai', '642'] },
    { name: 'Udumalpet', hub: 'Udumalpet Main', keywords: ['udumalpet', 'udumalaipettai', '6421'] },
    { name: 'Sathyamangalam', hub: 'Sathyamangalam Bus Stand', keywords: ['sathyamangalam', 'gobichettipalayam', 'gobi', '6384'] },
    { name: 'Mettur', hub: 'Mettur Main', keywords: ['mettur', 'omalur', '6364'] },
    { name: 'Ooty', hub: 'Udhagamandalam', keywords: ['ooty', 'udhagamandalam', 'coonoor', '643'] }
];

function Content() {
    const [address, setAddress] = useState('');
    const [status, setStatus] = useState(null); // null, 'checking', 'success', 'error'
    const [checkedAddress, setCheckedAddress] = useState('');
    const [matchedArea, setMatchedArea] = useState(null);

    const areaSuggestions = useMemo(() => {
        const query = address.trim().toLowerCase();
        if (query.length < 2 || status === 'success') {
            return [];
        }

        return serviceAreas.filter((area) => {
            return (
                area.name.toLowerCase().includes(query) ||
                area.hub.toLowerCase().includes(query) ||
                area.keywords.some((keyword) => keyword.includes(query))
            );
        }).slice(0, 5);
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
        setTimeout(() => {
            const normalizedAddress = address.toLowerCase();
            const availableArea = serviceAreas.find((area) =>
                area.keywords.some((keyword) => normalizedAddress.includes(keyword))
            );

            if (availableArea) {
                setStatus('success');
                setCheckedAddress(address);
                setMatchedArea(availableArea);
            } else {
                setStatus('error');
                setCheckedAddress('We are not active in this area yet. Try a nearby Tamil Nadu district hub from the list below.');
                setMatchedArea(null);
            }
        }, 800);
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
                                {areaSuggestions.length > 0 && (
                                    <div className="location-suggestions">
                                        {areaSuggestions.map((area) => (
                                            <button
                                                type="button"
                                                key={area.name}
                                                onClick={() => {
                                                    setAddress(area.name);
                                                    setStatus(null);
                                                    setMatchedArea(null);
                                                }}
                                            >
                                                <strong>{area.name}</strong>
                                                <span>{area.hub}</span>
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                            <button type="submit" className="checker-btn">
                                {status === 'checking' ? 'Checking...' : 'Check Now'}
                            </button>
                        </div>

                        {status === 'success' && (
                            <div className="checker-result success">
                                Great news! We deliver to <strong>"{checkedAddress}"</strong> from our <strong>{matchedArea?.hub}</strong> hub.
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
