function CheckoutAddressSelection({ userId }) {
    const [district, setDistrict] = React.useState('Chengalpattu');
    const [selectedAddress, setSelectedAddress] = React.useState('');
    const [deliveryLocation, setDeliveryLocation] = React.useState(null);
    const [confirmedMsg, setConfirmedMsg] = React.useState('');

    return (
        <div className="courier-card">
            <div className="courier-header">
                <h2>🛒 Checkout Delivery Address</h2>
                <p className="courier-sub">Select or detect where you want your order delivered</p>
            </div>

            <div className="form-grid">
                <div className="form-group">
                    <label className="form-label">📍 Delivery District</label>
                    <select
                        className="form-control"
                        value={district}
                        onChange={(e) => {
                            setDistrict(e.target.value);
                            setSelectedAddress('');
                            setDeliveryLocation(null);
                        }}
                    >
                        {['Chengalpattu', 'Salem', 'Chennai', 'Coimbatore', 'Madurai', 'Trichy', 'Thanjavur', 'Kanchipuram', 'Tiruvallur'].map(d => (
                            <option key={d} value={d}>{d}</option>
                        ))}
                    </select>
                </div>

                <div className="form-group">
                    {/* Checkout address selection HAS "Use My Location" enabled */}
                    <AddressAutocomplete
                        label="📍 Destination Delivery Address"
                        placeholder="Search delivery address or use current GPS..."
                        district={district}
                        value={selectedAddress}
                        onChange={setSelectedAddress}
                        onSelect={(item) => setDeliveryLocation(item)}
                        enableGeolocation={true}
                    />
                </div>

                {deliveryLocation && (
                    <div className="selected-badge">
                        ✓ Selected: {deliveryLocation.name} ({deliveryLocation.latitude}, {deliveryLocation.longitude})
                    </div>
                )}

                <button
                    className="btn btn-primary"
                    disabled={!deliveryLocation}
                    onClick={() => setConfirmedMsg(`Order address confirmed for ${deliveryLocation.name}, ${district}!`)}
                >
                    Proceed to Payment with this Address
                </button>

                {confirmedMsg && (
                    <div className="alert-success">
                        🎉 {confirmedMsg}
                    </div>
                )}
            </div>
        </div>
    );
}

window.CheckoutAddressSelection = CheckoutAddressSelection;
