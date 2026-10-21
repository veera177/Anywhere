function CourierBooking({ requireAuth }) {
    const districtsData = {
        'Chengalpattu': [12.6905, 79.9805],
        'Salem': [11.6643, 78.1460],
        'Chennai': [13.0827, 80.2707],
        'Coimbatore': [11.0168, 76.9658],
        'Madurai': [9.9195, 78.1193],
        'Trichy': [10.7905, 78.7047],
        'Thanjavur': [10.7870, 79.1378],
        'Kanchipuram': [12.8342, 79.7036],
        'Tiruvallur': [13.1432, 79.9079],
        'Tirunelveli': [8.7280, 77.6890],
        'Erode': [11.3410, 77.7280],
        'Vellore': [12.9250, 79.1320],
        'Tiruppur': [11.1085, 77.3410],
        'Dindigul': [10.3650, 77.9750],
        'Namakkal': [11.2189, 78.1674],
        'Karur': [10.9601, 78.0766],
        'Theni': [10.0104, 77.4768],
        'Kanyakumari': [8.1833, 77.4119],
        'Karaikudi': [10.0732, 78.7675],
        'Pollachi': [10.6609, 77.0087],
        'Ooty': [11.4102, 76.6950],
        'Ambur': [12.7900, 78.7160],
        'Tiruvannamalai': [12.2253, 79.0747],
        'Hosur': [12.7409, 77.8253],
        'Villupuram': [11.9401, 79.4861],
        'Ramanathapuram': [9.3639, 78.8395],
        'Pudukkottai': [10.3833, 78.8001]
    };

    const [districts] = React.useState(Object.keys(districtsData));
    const [selectedDistrict, setSelectedDistrict] = React.useState('Chengalpattu');
    const [pickupAddress, setPickupAddress] = React.useState('');
    const [pickupLocation, setPickupLocation] = React.useState(null);
    const [deliveryAddress, setDeliveryAddress] = React.useState('');
    const [deliveryLocation, setDeliveryLocation] = React.useState(null);
    const [activeTarget, setActiveTarget] = React.useState('pickup'); // 'pickup' or 'drop'
    const [packageWeight, setPackageWeight] = React.useState('1');
    const [feeBreakdown, setFeeBreakdown] = React.useState(null);
    const [calculating, setCalculating] = React.useState(false);
    const [bookingSuccess, setBookingSuccess] = React.useState(null);
    const [mapStatus, setMapStatus] = React.useState('');

    const mapContainerRef = React.useRef(null);
    const mapInstanceRef = React.useRef(null);
    const pickupMarkerRef = React.useRef(null);
    const dropMarkerRef = React.useRef(null);
    const tempMarkerRef = React.useRef(null);
    const routeLineRef = React.useRef(null);

    // Initialize or update Leaflet Map
    React.useEffect(() => {
        if (!mapContainerRef.current || typeof L === 'undefined') return;

        if (!mapInstanceRef.current) {
            const initialCoords = districtsData[selectedDistrict] || [12.6905, 79.9805];
            const map = L.map(mapContainerRef.current).setView(initialCoords, 12);

            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '&copy; OpenStreetMap contributors',
                maxZoom: 19
            }).addTo(map);

            map.on('click', (e) => {
                handleMapClick(e.latlng.lat, e.latlng.lng);
            });

            mapInstanceRef.current = map;
        } else {
            const coords = districtsData[selectedDistrict] || [12.6905, 79.9805];
            mapInstanceRef.current.setView(coords, 12);
        }
    }, [selectedDistrict]);

    // Handle map tap-to-select
    const handleMapClick = async (lat, lon) => {
        const map = mapInstanceRef.current;
        if (!map) return;

        // Show immediate temporary marker at clicked point
        if (tempMarkerRef.current) {
            map.removeLayer(tempMarkerRef.current);
        }

        const tempIcon = L.divIcon({
            className: 'custom-temp-marker',
            html: '<div style="background:#f59e0b;color:#000;padding:4px 8px;border-radius:12px;font-size:12px;font-weight:700;border:2px solid #000;box-shadow:0 2px 6px rgba(0,0,0,0.3)">⏳ Resolving...</div>',
            iconSize: [90, 30],
            iconAnchor: [45, 15]
        });

        tempMarkerRef.current = L.marker([lat, lon], { icon: tempIcon }).addTo(map);
        setMapStatus(`Resolving address for ${activeTarget === 'pickup' ? 'Pickup' : 'Drop'} location...`);

        try {
            let data = null;
            try {
                const res = await fetch(`/api/areas/reverse-geocode?lat=${lat}&lon=${lon}`);
                if (res.ok) data = await res.json();
            } catch (err) {
                console.warn('Backend reverse geocode failed, falling back to live Nominatim:', err);
            }

            if (!data || !data.display_name) {
                const directRes = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json&addressdetails=1`, {
                    headers: { 'User-Agent': 'AnywhereApp/1.0', 'Accept': 'application/json' }
                });
                if (directRes.ok) data = await directRes.json();
            }

            if (tempMarkerRef.current) {
                map.removeLayer(tempMarkerRef.current);
                tempMarkerRef.current = null;
            }

            if (data && data.display_name) {
                const fullAddress = data.display_name;
                const parts = fullAddress.split(',');
                const shortName = parts[0].trim();
                const subtext = parts.length > 1 ? parts.slice(1, 3).join(',').trim() : selectedDistrict;

                const locationObj = {
                    name: shortName,
                    subtext: subtext,
                    address: fullAddress,
                    latitude: lat,
                    longitude: lon,
                    pincode: data.address?.postcode || null
                };

                if (activeTarget === 'pickup') {
                    setPickupAddress(fullAddress);
                    setPickupLocation(locationObj);
                    setFeeBreakdown(null);
                    setMapStatus(`✓ Pickup set to: ${shortName}`);
                    // Automatically toggle to drop for convenient next tap
                    setActiveTarget('drop');
                } else {
                    setDeliveryAddress(fullAddress);
                    setDeliveryLocation(locationObj);
                    setFeeBreakdown(null);
                    setMapStatus(`✓ Drop set to: ${shortName}`);
                }
            } else {
                setMapStatus('Could not resolve street address at clicked point. Try another point.');
            }
        } catch (error) {
            if (tempMarkerRef.current) {
                map.removeLayer(tempMarkerRef.current);
                tempMarkerRef.current = null;
            }
            console.error('Reverse geocode error on map click:', error);
            setMapStatus('Reverse geocoding error. Please try again.');
        }
    };

    // Update Pickup Marker, Drop Marker, and Polyline
    React.useEffect(() => {
        const map = mapInstanceRef.current;
        if (!map || typeof L === 'undefined') return;

        if (pickupLocation) {
            if (pickupMarkerRef.current) map.removeLayer(pickupMarkerRef.current);
            const pickupIcon = L.divIcon({
                className: 'custom-pin-marker',
                html: '<div style="background:#FFD700;color:#000;padding:4px 8px;border-radius:14px;font-size:12px;font-weight:700;border:2px solid #000;box-shadow:0 3px 8px rgba(0,0,0,0.3)">📤 Pickup</div>',
                iconSize: [75, 30],
                iconAnchor: [37, 15]
            });
            pickupMarkerRef.current = L.marker([pickupLocation.latitude, pickupLocation.longitude], { icon: pickupIcon })
                .addTo(map)
                .bindPopup(`<b>Pickup Location</b><br>${pickupLocation.name}`);
        } else if (pickupMarkerRef.current) {
            map.removeLayer(pickupMarkerRef.current);
            pickupMarkerRef.current = null;
        }

        if (deliveryLocation) {
            if (dropMarkerRef.current) map.removeLayer(dropMarkerRef.current);
            const dropIcon = L.divIcon({
                className: 'custom-pin-marker',
                html: '<div style="background:#000;color:#FFD700;padding:4px 8px;border-radius:14px;font-size:12px;font-weight:700;border:2px solid #FFD700;box-shadow:0 3px 8px rgba(0,0,0,0.3)">📥 Drop</div>',
                iconSize: [65, 30],
                iconAnchor: [32, 15]
            });
            dropMarkerRef.current = L.marker([deliveryLocation.latitude, deliveryLocation.longitude], { icon: dropIcon })
                .addTo(map)
                .bindPopup(`<b>Drop Destination</b><br>${deliveryLocation.name}`);
        } else if (dropMarkerRef.current) {
            map.removeLayer(dropMarkerRef.current);
            dropMarkerRef.current = null;
        }

        if (pickupLocation && deliveryLocation) {
            if (routeLineRef.current) map.removeLayer(routeLineRef.current);
            const latlngs = [
                [pickupLocation.latitude, pickupLocation.longitude],
                [deliveryLocation.latitude, deliveryLocation.longitude]
            ];
            routeLineRef.current = L.polyline(latlngs, {
                color: '#f59e0b',
                weight: 4,
                dashArray: '8, 8',
                opacity: 0.9
            }).addTo(map);

            const bounds = L.latLngBounds(latlngs);
            map.fitBounds(bounds, { padding: [40, 40] });
        } else if (routeLineRef.current) {
            map.removeLayer(routeLineRef.current);
            routeLineRef.current = null;
        }
    }, [pickupLocation, deliveryLocation]);

    const handleCalculateFee = async () => {
        if (!pickupLocation || !deliveryLocation) {
            alert('Please select valid pickup and delivery locations.');
            return;
        }

        setCalculating(true);
        try {
            const lat1 = pickupLocation.latitude;
            const lon1 = pickupLocation.longitude;
            const lat2 = deliveryLocation.latitude;
            const lon2 = deliveryLocation.longitude;

            const R = 6371;
            const dLat = (lat2 - lat1) * Math.PI / 180;
            const dLon = (lon2 - lon1) * Math.PI / 180;
            const a =
                Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
                Math.sin(dLon / 2) * Math.sin(dLon / 2);
            const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
            const distanceKm = Math.max(1, parseFloat((R * c).toFixed(2)));

            const response = await window.authApi.fetch('/api/courier/tracking/calculate-fee', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    distanceKm: distanceKm,
                    areaTier: 'URBAN'
                })
            });

            if (response.ok) {
                const feeData = await response.json();
                setFeeBreakdown({
                    ...feeData,
                    distanceKm: distanceKm
                });
            } else {
                const baseFee = 35;
                const distanceFee = distanceKm * 8;
                const total = Math.round(baseFee + distanceFee);
                setFeeBreakdown({
                    distanceKm: distanceKm,
                    baseDeliveryFee: baseFee,
                    distanceFee: distanceFee,
                    totalDeliveryFee: total
                });
            }
        } catch (err) {
            console.error('Fee calculation error:', err);
        } finally {
            setCalculating(false);
        }
    };

    return (
        <div className="courier-card" style={{ maxWidth: '820px' }}>
            <div className="courier-header">
                <h2>📦 Local Courier Service</h2>
                <p className="courier-sub">Direct shop-to-door or point-to-point courier across Tamil Nadu</p>
            </div>

            <div className="form-grid">
                <div className="form-group">
                    <label className="form-label">📍 Select District</label>
                    <select
                        className="form-control"
                        value={selectedDistrict}
                        onChange={(e) => {
                            setSelectedDistrict(e.target.value);
                            setPickupAddress('');
                            setPickupLocation(null);
                            setDeliveryAddress('');
                            setDeliveryLocation(null);
                            setFeeBreakdown(null);
                            setMapStatus('');
                        }}
                    >
                        {districts.map(d => (
                            <option key={d} value={d}>{d}</option>
                        ))}
                    </select>
                </div>

                <div className="form-group">
                    {/* Pickup Address HAS "Use My Location" enabled */}
                    <AddressAutocomplete
                        label="📤 Pickup Location (From)"
                        placeholder="Search area, landmark or use GPS / Map..."
                        district={selectedDistrict}
                        value={pickupAddress}
                        onChange={(val) => {
                            setPickupAddress(val);
                            setActiveTarget('pickup');
                        }}
                        onSelect={(item) => {
                            setPickupLocation(item);
                            setFeeBreakdown(null);
                        }}
                        enableGeolocation={true}
                    />
                    {pickupLocation && (
                        <div className="selected-badge">
                            ✓ {pickupLocation.name} ({pickupLocation.latitude.toFixed(4)}, {pickupLocation.longitude.toFixed(4)})
                        </div>
                    )}
                </div>

                <div className="form-group">
                    {/* Drop Address does NOT have geolocation */}
                    <AddressAutocomplete
                        label="📥 Delivery Destination (To)"
                        placeholder="Search destination area or tap on Map..."
                        district={selectedDistrict}
                        value={deliveryAddress}
                        onChange={(val) => {
                            setDeliveryAddress(val);
                            setActiveTarget('drop');
                        }}
                        onSelect={(item) => {
                            setDeliveryLocation(item);
                            setFeeBreakdown(null);
                        }}
                        enableGeolocation={false}
                    />
                    {deliveryLocation && (
                        <div className="selected-badge">
                            ✓ {deliveryLocation.name} ({deliveryLocation.latitude.toFixed(4)}, {deliveryLocation.longitude.toFixed(4)})
                        </div>
                    )}
                </div>

                {/* Map Tap-To-Select & Route Preview */}
                <div className="form-group" style={{ marginTop: '6px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                        <label className="form-label" style={{ margin: 0 }}>
                            🗺️ Map Tap-To-Select & Route Preview
                        </label>
                        <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                            <span style={{ fontSize: '0.8rem', color: '#555' }}>Map click sets:</span>
                            <button
                                type="button"
                                className={`btn ${activeTarget === 'pickup' ? 'btn-primary' : ''}`}
                                style={{ padding: '3px 10px', fontSize: '0.78rem' }}
                                onClick={() => setActiveTarget('pickup')}
                            >
                                📤 Pickup
                            </button>
                            <button
                                type="button"
                                className={`btn ${activeTarget === 'drop' ? 'btn-primary' : ''}`}
                                style={{ padding: '3px 10px', fontSize: '0.78rem' }}
                                onClick={() => setActiveTarget('drop')}
                            >
                                📥 Drop
                            </button>
                        </div>
                    </div>

                    <div
                        ref={mapContainerRef}
                        style={{
                            width: '100%',
                            height: '280px',
                            borderRadius: '12px',
                            border: '2px solid #000',
                            overflow: 'hidden',
                            zIndex: 1
                        }}
                    />

                    {mapStatus && (
                        <div className="location-status-msg info" style={{ marginTop: '6px' }}>
                            {mapStatus}
                        </div>
                    )}
                </div>

                <div className="form-group">
                    <label className="form-label">⚖️ Package Weight (kg)</label>
                    <select
                        className="form-control"
                        value={packageWeight}
                        onChange={(e) => setPackageWeight(e.target.value)}
                    >
                        <option value="1">Up to 1 kg (Documents / Essentials)</option>
                        <option value="3">Up to 3 kg (Small Parcel)</option>
                        <option value="5">Up to 5 kg (Medium Parcel)</option>
                        <option value="10">Up to 10 kg (Large Parcel)</option>
                    </select>
                </div>
            </div>

            <div className="action-row">
                <button
                    className="btn btn-primary"
                    onClick={handleCalculateFee}
                    disabled={calculating || !pickupLocation || !deliveryLocation}
                >
                    {calculating ? 'Calculating...' : 'Estimate Distance & Fare'}
                </button>
            </div>

            {feeBreakdown && (
                <div className="fee-card">
                    <h3>🏷️ Delivery Estimate</h3>
                    <div className="fee-row">
                        <span>Distance:</span>
                        <strong>{feeBreakdown.distanceKm} km</strong>
                    </div>
                    <div className="fee-row">
                        <span>Base Fare:</span>
                        <span>₹{feeBreakdown.baseDeliveryFee || 35}</span>
                    </div>
                    <div className="fee-row total">
                        <span>Estimated Total:</span>
                        <strong>₹{feeBreakdown.totalDeliveryFee || Math.round(feeBreakdown.baseDeliveryFee + feeBreakdown.distanceFee)}</strong>
                    </div>
                    <button
                        className="btn btn-dark full-width"
                        style={{ marginTop: '14px' }}
                        onClick={() => requireAuth(() => setBookingSuccess(`Booking request received for ${selectedDistrict}! Courier partner will be assigned shortly.`))}
                    >
                        Confirm Courier Booking
                    </button>
                </div>
            )}

            {bookingSuccess && (
                <div className="alert-success">
                    🎉 {bookingSuccess}
                </div>
            )}
        </div>
    );
}

window.CourierBooking = CourierBooking;
