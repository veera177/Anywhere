/**
 * AddressAutocomplete component with district-scoped search and browser Geolocation support.
 * Note: navigator.geolocation requires a secure context (HTTPS) in production (works on localhost during development).
 */
function AddressAutocomplete({
    label,
    placeholder,
    value,
    onChange,
    onSelect,
    district,
    disabled,
    enableGeolocation = false
}) {
    const [query, setQuery] = React.useState(value || '');
    const [suggestions, setSuggestions] = React.useState([]);
    const [loading, setLoading] = React.useState(false);
    const [locating, setLocating] = React.useState(false);
    const [showDropdown, setShowDropdown] = React.useState(false);
    const [errorMessage, setErrorMessage] = React.useState('');
    const [locationStatus, setLocationStatus] = React.useState('');
    const containerRef = React.useRef(null);
    const debounceTimerRef = React.useRef(null);

    React.useEffect(() => {
        setQuery(value || '');
    }, [value]);

    React.useEffect(() => {
        function handleClickOutside(event) {
            if (containerRef.current && !containerRef.current.contains(event.target)) {
                setShowDropdown(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const fetchSuggestions = async (searchTerm) => {
        if (!searchTerm || searchTerm.trim().length < 2) {
            setSuggestions([]);
            setShowDropdown(false);
            setErrorMessage('');
            return;
        }

        if (!district) {
            setSuggestions([]);
            setShowDropdown(true);
            setErrorMessage('Please select a district first');
            return;
        }

        setLoading(true);
        setErrorMessage('');

        try {
            const url = `/api/areas/suggestions?district=${encodeURIComponent(district)}&q=${encodeURIComponent(searchTerm)}`;
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            const data = await response.json();
            setSuggestions(Array.isArray(data) ? data : []);
            setShowDropdown(true);
            if (Array.isArray(data) && data.length === 0) {
                setErrorMessage('No matching areas found');
            } else {
                setErrorMessage('');
            }
        } catch (err) {
            console.error('Failed to search locations:', err);
            setSuggestions([]);
            setShowDropdown(true);
            setErrorMessage('Unable to search locations');
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const text = e.target.value;
        setQuery(text);
        setLocationStatus('');
        if (onChange) {
            onChange(text);
        }

        if (debounceTimerRef.current) {
            clearTimeout(debounceTimerRef.current);
        }

        debounceTimerRef.current = setTimeout(() => {
            fetchSuggestions(text);
        }, 250);
    };

    const handleSelectSuggestion = (item) => {
        const fullAddress = item.name + (item.subtext ? `, ${item.subtext}` : '');
        setQuery(fullAddress);
        setShowDropdown(false);
        setErrorMessage('');
        setLocationStatus('');
        if (onChange) {
            onChange(fullAddress);
        }
        if (onSelect) {
            onSelect({
                ...item,
                address: fullAddress
            });
        }
    };

    const handleUseMyLocation = () => {
        if (!navigator.geolocation) {
            setLocationStatus('Location access is not supported by your browser.');
            return;
        }

        setLocating(true);
        setLocationStatus('Fetching your location coordinates...');
        setErrorMessage('');

        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const { latitude, longitude } = position.coords;
                await reverseGeocodeCoordinates(latitude, longitude);
            },
            (error) => {
                setLocating(false);
                if (error.code === error.PERMISSION_DENIED) {
                    setLocationStatus('Location permission denied. Please allow location access or enter address manually.');
                } else if (error.code === error.TIMEOUT) {
                    setLocationStatus('Location request timed out. Please enter your address manually.');
                } else {
                    setLocationStatus('Unable to access your location. Please enter your address manually.');
                }
            },
            { enableHighAccuracy: true, timeout: 10000 }
        );
    };

    const reverseGeocodeCoordinates = async (lat, lon) => {
        try {
            setLocationStatus('Resolving street address...');
            let data = null;

            // 1. Try backend proxy first
            try {
                const response = await fetch(`/api/areas/reverse-geocode?lat=${lat}&lon=${lon}`);
                if (response.ok) {
                    data = await response.json();
                }
            } catch (backendErr) {
                console.warn('Backend reverse-geocode failed, trying direct Nominatim fallback:', backendErr);
            }

            // 2. Direct Nominatim fallback if backend proxy did not return valid display_name
            if (!data || !data.display_name) {
                const directUrl = `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json&addressdetails=1`;
                const directRes = await fetch(directUrl, {
                    headers: { 'User-Agent': 'AnywhereApp/1.0', 'Accept': 'application/json' }
                });
                if (directRes.ok) {
                    data = await directRes.json();
                }
            }

            if (data && data.display_name) {
                const fullAddress = data.display_name;
                const addrDetails = data.address || {};
                const state = addrDetails.state || '';
                const stateDistrict = addrDetails.state_district || addrDetails.county || addrDetails.city || addrDetails.town || '';

                // Step 3: District & Tamil Nadu validation
                if (!fullAddress.includes('Tamil Nadu') && !state.toLowerCase().includes('tamil nadu')) {
                    setLocationStatus('Location is outside our service area (Tamil Nadu only).');
                    setLocating(false);
                    return;
                }

                if (district && district.trim()) {
                    const cleanDist = district.trim().toLowerCase();
                    const addressLower = fullAddress.toLowerCase();
                    const distMatch = addressLower.includes(cleanDist) || stateDistrict.toLowerCase().includes(cleanDist);
                    if (!distMatch) {
                        setLocationStatus(`Location mismatch: Detected location is outside selected district (${district}).`);
                        setLocating(false);
                        return;
                    }
                }

                // Extract short name from parts
                const parts = fullAddress.split(',');
                const shortName = parts[0].trim();
                const subtext = parts.length > 1 ? parts.slice(1, 3).join(',').trim() : (district || 'Tamil Nadu');

                setQuery(fullAddress);
                setShowDropdown(false);
                setLocationStatus('✓ Location set successfully');
                setLocating(false);

                if (onChange) {
                    onChange(fullAddress);
                }
                if (onSelect) {
                    onSelect({
                        name: shortName,
                        subtext: subtext,
                        address: fullAddress,
                        latitude: lat,
                        longitude: lon,
                        pincode: addrDetails.postcode || null
                    });
                }
            } else {
                setLocationStatus("Couldn't determine your address. Please enter it manually.");
                setLocating(false);
            }
        } catch (err) {
            console.error('Reverse geocode error:', err);
            setLocationStatus("Couldn't determine your address. Please enter it manually.");
            setLocating(false);
        }
    };

    return (
        <div className="address-autocomplete-container" ref={containerRef}>
            <div className="label-row">
                {label && <label className="form-label">{label}</label>}
                {enableGeolocation && (
                    <button
                        type="button"
                        className="use-location-btn"
                        onClick={handleUseMyLocation}
                        disabled={disabled || locating}
                        title="Use device GPS to detect your current location"
                    >
                        {locating ? <span className="btn-spinner">🔄</span> : '📍'}
                        <span>{locating ? 'Locating...' : 'Use My Location'}</span>
                    </button>
                )}
            </div>

            <div className="input-wrapper">
                <input
                    type="text"
                    className="form-control"
                    placeholder={placeholder || 'Search area, street, landmark...'}
                    value={query}
                    onChange={handleInputChange}
                    onFocus={() => {
                        if (query.trim().length >= 2) {
                            fetchSuggestions(query);
                        }
                    }}
                    disabled={disabled}
                />
                {loading && <span className="input-spinner">⏳</span>}
            </div>

            {locationStatus && (
                <div className={`location-status-msg ${locationStatus.startsWith('✓') ? 'success' : locationStatus.includes('outside') || locationStatus.includes('mismatch') || locationStatus.includes('denied') ? 'warning' : 'info'}`}>
                    {locationStatus}
                </div>
            )}

            {showDropdown && (
                <div className="autocomplete-dropdown">
                    {errorMessage ? (
                        <div className="dropdown-message">{errorMessage}</div>
                    ) : suggestions.length > 0 ? (
                        suggestions.map((item, index) => (
                            <div
                                key={index}
                                className="dropdown-item"
                                onClick={() => handleSelectSuggestion(item)}
                            >
                                <span className="item-pin">📍</span>
                                <div className="item-details">
                                    <div className="item-name">{item.name}</div>
                                    {item.subtext && <div className="item-subtext">{item.subtext}</div>}
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="dropdown-message">No matching areas found</div>
                    )}
                </div>
            )}
        </div>
    );
}

window.AddressAutocomplete = AddressAutocomplete;