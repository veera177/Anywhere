import { useMemo, useState } from 'react';
import './CourierDelivery.css';

const courierHubs = [
    { id: 'salem', town: 'Salem', hub: 'Salem Hub 1A', landmark: 'Near Junction Railway Station', lat: 11.6643, lon: 78.1460, zone: 'Urban Routing Center' },
    { id: 'trichy', town: 'Trichy', hub: 'Trichy Central', landmark: 'Near Central Bus Stand', lat: 10.7905, lon: 78.7047, zone: 'Delta Regional Hub' },
    { id: 'madurai', town: 'Madurai', hub: 'Madurai Gateway', landmark: 'Near Periyar Bus Stand', lat: 9.9252, lon: 78.1198, zone: 'South Zone Connector' },
    { id: 'coimbatore', town: 'Coimbatore', hub: 'Kongu Logistics Base', landmark: 'Near Gandhipuram', lat: 11.0168, lon: 76.9558, zone: 'Industrial Freight & Parcel' },
    { id: 'chennai', town: 'Chennai', hub: 'Chennai Metro HQ', landmark: 'Guindy Industrial Estate', lat: 13.0827, lon: 80.2707, zone: 'State Central Operations' }
];

const parcelTypes = [
    { id: 'document', productId: 901, label: 'Standard Document', base: 50, note: 'Contracts, letters, forms. Under 500g.' },
    { id: 'express_pack', productId: 902, label: 'Express Pack (Small)', base: 80, note: 'Keys, mobile accessories. Handled with priority.' },
    { id: 'parcel_box', productId: 903, label: 'Standard Box', base: 120, note: 'Garments, electronics. Up to 5kg.' },
    { id: 'fragile', productId: 904, label: 'Fragile Handling', base: 150, note: 'Glassware, sensitive equipment. Special care.' }
];

function CourierDelivery({ onBack, onProceedToPayment }) {
    const user = JSON.parse(localStorage.getItem('user'));
    const [selectedHubId, setSelectedHubId] = useState('salem');
    const [parcelTypeId, setParcelTypeId] = useState('document');
    const [weight, setWeight] = useState(1);
    const [pickup, setPickup] = useState('');
    const [drop, setDrop] = useState('');
    const [recipientName, setRecipientName] = useState('');
    const [recipientPhone, setRecipientPhone] = useState('');
    const [message, setMessage] = useState('');

    const selectedHub = courierHubs.find((hub) => hub.id === selectedHubId) || courierHubs[0];
    const selectedParcel = parcelTypes.find((type) => type.id === parcelTypeId) || parcelTypes[0];

    const quote = useMemo(() => {
        const weightSurcharge = Math.max(0, weight - 1) * 35;
        return selectedParcel.base + weightSurcharge;
    }, [selectedParcel, weight]);

    const handleShipmentBooking = (e) => {
        e.preventDefault();

        if (!user?.id) {
            setMessage('Authentication required to continue to payment.');
            return;
        }
        if (!pickup.trim() || !drop.trim() || !recipientName.trim() || !recipientPhone.trim()) {
            setMessage('All shipment details (Pickup, Drop, Recipient) are required.');
            return;
        }
        if (recipientPhone.length < 10) {
            setMessage('Please enter a valid 10-digit phone number.');
            return;
        }

        const deliveryAddress = `HUB: ${selectedHub.town} | FROM: ${pickup.trim()} | TO: ${drop.trim()} | ATTN: ${recipientName.trim()} (${recipientPhone.trim()})`;
        const courierItem = {
            cartId: `courier-${Date.now()}`,
            productId: selectedParcel.productId,
            serviceType: 'COURIER',
            productName: `Waybill: ${selectedParcel.label} (${weight}kg)`,
            price: quote,
            quantity: 1,
        };

        onProceedToPayment?.({
            user,
            items: [courierItem],
            profileAddress: {
                addressLine: deliveryAddress,
                town: selectedHub.town,
                district: 'Tamil Nadu',
            },
            total: quote,
            returnView: 'courier',
        });
    };

    return (
        <main className="courier-premium-page">
            <header className="c-header">
                <div className="c-header-container">
                    <button className="c-back-btn" onClick={onBack} aria-label="Go back">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
                        <span>Return to Hub</span>
                    </button>

                    <div className="c-brand">
                        <div className="c-logo-mark">ANY</div>
                        <div className="c-brand-text">
                            <strong>Anywhere</strong>
                            <span>Global Logistics</span>
                        </div>
                    </div>

                    <div className="c-auth-status">
                        <span className="c-status-dot"></span>
                        {user ? 'Systems Online' : 'Guest Mode'}
                    </div>
                </div>
            </header>

            <section className="c-hero">
                <div className="c-hero-content">
                    <h1>Excellence.<br/>Simply Delivered.</h1>
                    <p>Track, ship, and manage your express parcels with enterprise-grade reliability and real-time visibility across the state.</p>

                    <div className="c-hero-stats">
                        <div className="c-stat"><strong>24/7</strong><span>Operations</span></div>
                        <div className="c-stat"><strong>100%</strong><span>Secure</span></div>
                        <div className="c-stat"><strong>Express</strong><span>Dispatch</span></div>
                    </div>
                </div>

                <div className="c-hero-graphic">
                    <div className="c-vehicle-card">
                        <div className="c-badge">Premium Fleet</div>
                        <img src="https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=800&q=80" alt="Logistics Warehouse" />
                    </div>
                </div>
            </section>

            <div className="c-booking-container">
                <section className="c-booking-panel">
                    <div className="c-panel-header">
                        <h2>Create Shipment (AWB)</h2>
                        <span className="c-secure-badge">Secure Payment</span>
                    </div>

                    <form className="c-form" onSubmit={handleShipmentBooking}>
                        <div className="c-form-row">
                            <div className="c-input-group">
                                <label>Origin Hub</label>
                                <select value={selectedHubId} onChange={(e) => setSelectedHubId(e.target.value)}>
                                    {courierHubs.map(h => <option key={h.id} value={h.id}>{h.town} - {h.hub}</option>)}
                                </select>
                            </div>
                            <div className="c-input-group">
                                <label>Package Type</label>
                                <select value={parcelTypeId} onChange={(e) => setParcelTypeId(e.target.value)}>
                                    {parcelTypes.map(p => <option key={p.id} value={p.id}>{p.label}</option>)}
                                </select>
                            </div>
                        </div>

                        <div className="c-input-group c-slider-group">
                            <div className="c-slider-header">
                                <label>Gross Weight Estimate</label>
                                <strong>{weight} kg</strong>
                            </div>
                            <input
                                type="range"
                                min="1" max="25"
                                value={weight}
                                onChange={(e) => setWeight(parseInt(e.target.value))}
                                className="c-range-slider"
                            />
                            <p className="c-help-text">{selectedParcel.note}</p>
                        </div>

                        <div className="c-address-block">
                            <div className="c-route-line"></div>

                            <div className="c-input-group">
                                <label className="c-pickup-label">Pickup Location</label>
                                <input
                                    type="text"
                                    placeholder="Enter complete pickup address"
                                    value={pickup}
                                    onChange={(e) => setPickup(e.target.value)}
                                />
                            </div>

                            <div className="c-input-group">
                                <label className="c-drop-label">Destination Address</label>
                                <input
                                    type="text"
                                    placeholder="Enter complete delivery address"
                                    value={drop}
                                    onChange={(e) => setDrop(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="c-form-row">
                            <div className="c-input-group">
                                <label>Consignee Name</label>
                                <input
                                    type="text"
                                    placeholder="Receiver's name"
                                    value={recipientName}
                                    onChange={(e) => setRecipientName(e.target.value)}
                                />
                            </div>
                            <div className="c-input-group">
                                <label>Consignee Phone</label>
                                <input
                                    type="tel"
                                    placeholder="+91 Mobile number"
                                    value={recipientPhone}
                                    onChange={(e) => setRecipientPhone(e.target.value.replace(/\D/g, ''))}
                                    maxLength="10"
                                />
                            </div>
                        </div>

                        {message && <div className="c-alert c-alert-error">{message}</div>}

                        <div className="c-form-footer">
                            <div className="c-quote-display">
                                <span>Estimated Tariff</span>
                                <strong>Rs.{quote.toFixed(2)}</strong>
                            </div>
                            <button type="submit" className="c-submit-btn">
                                Continue to Payment
                            </button>
                        </div>
                    </form>
                </section>

                <aside className="c-sidebar">
                    <div className="c-sidebar-card">
                        <h3>Operating Hub</h3>
                        <div className="c-hub-details">
                            <strong>{selectedHub.hub}</strong>
                            <p>{selectedHub.zone}</p>
                            <span className="c-landmark">Location: {selectedHub.landmark}</span>
                        </div>
                        <div className="c-map-mockup">
                            <div className="c-map-grid"></div>
                            <div className="c-map-pin"></div>
                        </div>
                    </div>

                    <div className="c-sidebar-features">
                        <div className="c-feature-row">
                            <div className="c-feature-icon">SP</div>
                            <div className="c-feature-text">
                                <strong>Shipment Protection</strong>
                                <span>Standard liability coverage included on all express parcels.</span>
                            </div>
                        </div>
                        <div className="c-feature-row">
                            <div className="c-feature-icon">PR</div>
                            <div className="c-feature-text">
                                <strong>Priority Handling</strong>
                                <span>Sorted in dedicated lanes for maximum throughput speed.</span>
                            </div>
                        </div>
                        <div className="c-feature-row">
                            <div className="c-feature-icon">SMS</div>
                            <div className="c-feature-text">
                                <strong>SMS Tracking</strong>
                                <span>Consignee receives live updates upon dispatch.</span>
                            </div>
                        </div>
                    </div>
                </aside>
            </div>
        </main>
    );
}

export default CourierDelivery;
