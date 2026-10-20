import { useCallback, useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "./AddressAutocomplete.css";
import { AREAS_SUGGESTIONS_URL, EXTERNAL_URLS } from "../services/apiConfig";
import { apiFetch } from "../services/apiClient";
import { getDistricts } from "../services/districts";

/* Fix Leaflet default marker icons for Vite bundler */
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

/**
 * Address autocomplete with district-scoped suggestions.
 *
 * When `district` prop is provided:
 *  1. On focus (empty input) → shows the backend's known areas for that district instantly
 *  2. While typing → queries backend /api/areas/suggestions?district=X&q=Y first;
 *     if < 3 local results, falls back to Photon/Nominatim scoped to that district
 *  3. All external geocoding results are filtered to the selected district only
 *
 * Without `district` prop (or district=""):
 *  → Behaves exactly as before — popular Tamil Nadu locations on focus, full TN search while typing
 */

const NOMINATIM_URL = EXTERNAL_URLS.NOMINATIM;

const MIN_QUERY_LENGTH   = 2;   // debounced search triggers at 2+ characters
const DEBOUNCE_MS        = 300; // 300ms debounce
const REQUEST_TIMEOUT_MS = 4000; // 4 second timeout per requirement
const MAX_SUGGESTIONS    = 15;

/* ── In-memory cache keyed by "district:query" ── */
const apiCache = new Map();
const CACHE_TTL_MS = 5 * 60 * 1000;

function getCached(key) {
    const entry = apiCache.get(key);
    if (entry && Date.now() - entry.ts < CACHE_TTL_MS) return entry.data;
    apiCache.delete(key);
    return null;
}
function setCache(key, data) {
    if (apiCache.size > 300) apiCache.delete(apiCache.keys().next().value);
    apiCache.set(key, { data, ts: Date.now() });
}

/* ── Backend area suggestions for a specific district (local district_areas) ── */
async function fetchDistrictAreas(district, query, signal) {
    try {
        const params = new URLSearchParams({ district: (district || "").toLowerCase(), q: query || "" });
        const res = await apiFetch(`${AREAS_SUGGESTIONS_URL}?${params}`, { signal }, { timeoutMs: REQUEST_TIMEOUT_MS, retries: 0 });
        const data = await res.json();
        if (!Array.isArray(data)) return [];
        return data.map((a) => ({
            title:     a.name,
            subtext:   a.subtext || (district ? `${district}, Tamil Nadu` : "Tamil Nadu, India"),
            latitude:  Number(a.latitude),
            longitude: Number(a.longitude),
            pincode:   a.pincode || null,
            address:   `${a.name}, ${a.subtext || district || "Tamil Nadu"}`,
            isLocal:   true,
        })).filter(isValidLocation);
    } catch {
        return [];
    }
}

/* ── Backend Nominatim proxy / fallback (Tamil Nadu filtered, bounded to district) ── */
async function fetchNominatimProxy(query, district, signal) {
    const scope = district ? `${query}, ${district}, Tamil Nadu, India` : `${query}, Tamil Nadu, India`;
    const params = new URLSearchParams({ 
        q: scope, 
        format: "json", 
        countrycodes: "in", 
        limit: "15",
        addressdetails: "1",
        "accept-language": "en" 
    });
    const res = await fetch(`${NOMINATIM_URL}?${params}`, { 
        headers: { 
            Accept: "application/json", 
            "User-Agent": "AnywhereApp/1.0 (contact@anywhere.example.com)"
        },
        signal 
    });
    if (!res.ok) throw new Error("nominatim_failed");
    const data = await res.json();
    if (!Array.isArray(data)) return [];
    
    const districtKey = (district || "").toLowerCase().trim();
    return data
        .filter(districtKey ? matchesDistrict(districtKey) : isTamilNadu)
        .map(toLocation)
        .filter(isValidLocation);
}

/* ── Main component ── */
function AddressAutocomplete({
    label,
    placeholder,
    value,
    onChange,
    onSelect,
    onClear,
    inputRef,
    district,
    showUseMyLocation = false,
    disabled = false
}) {
    const [geoLoading, setGeoLoading] = useState(false);
    const [geoError, setGeoError] = useState('');
    const [geoInfo, setGeoInfo] = useState('');
    const [suggestions, setSuggestions]   = useState([]);
    const [popularItems, setPopularItems] = useState([]);
    const [loading, setLoading]           = useState(false);
    const [error, setError]               = useState("");
    const [emptyState, setEmptyState]     = useState("");
    const [selected, setSelected]         = useState(false);
    const [showPopular, setShowPopular]   = useState(false);
    const [activeIndex, setActiveIndex]   = useState(-1);
    const [isOpen, setIsOpen]             = useState(false);
    const [geoMapCoords, setGeoMapCoords] = useState(null);

    const requestIdRef     = useRef(0);
    const internalRef      = useRef(null);
    const inputElementRef  = inputRef || internalRef;
    const geoMapRef        = useRef(null);
    const geoMapInstance   = useRef(null);
    const containerRef     = useRef(null);

    // Normalize district
    const districtKey = district ? district.trim().toLowerCase() : "";
    const isDistrictMode = Boolean(districtKey);

    /* ── Close dropdown when clicking outside ── */
    useEffect(() => {
        function handleClickOutside(e) {
            if (containerRef.current && !containerRef.current.contains(e.target)) {
                setIsOpen(false);
                setShowPopular(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    /* ── Fetch popular items for the current district when district changes ── */
    useEffect(() => {
        let cancelled = false;
        if (!isDistrictMode) {
            getDistricts()
                .then((list) => {
                    if (cancelled) return;
                    setPopularItems((list || []).slice(0, 8).map((d) => ({
                        title: d.name,
                        subtext: "Tamil Nadu, India",
                        latitude: d.lat,
                        longitude: d.lon,
                        pincode: null,
                        address: `${d.name}, Tamil Nadu, India`,
                        isLocal: true,
                    })).filter(isValidLocation));
                })
                .catch(() => { if (!cancelled) setPopularItems([]); });
            return () => { cancelled = true; };
        }
        fetchDistrictAreas(districtKey, "", null)
            .then((areas) => { if (!cancelled) setPopularItems(areas.slice(0, 8)); })
            .catch(() => { if (!cancelled) setPopularItems([]); });
        return () => { cancelled = true; };
    }, [districtKey, isDistrictMode]);

    /* ── Reset state when district changes ── */
    useEffect(() => {
        setSelected(false);
        setSuggestions([]);
        setError("");
        setEmptyState("");
        setGeoMapCoords(null);
        setActiveIndex(-1);
    }, [districtKey]);

    /* ── Initialize Leaflet map with draggable pin after location detected ── */
    useEffect(() => {
        if (!geoMapCoords || !geoMapRef.current || geoMapInstance.current) return;

        const { lat, lon } = geoMapCoords;
        const map = L.map(geoMapRef.current, {
            center: [lat, lon],
            zoom: 16,
            zoomControl: false,
            attributionControl: false,
            scrollWheelZoom: false,
            dragging: true,
            doubleClickZoom: false,
        });

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 19,
        }).addTo(map);

        L.control.zoom({ position: 'topright' }).addTo(map);

        const marker = L.marker([lat, lon], { draggable: true }).addTo(map);
        let dragTimer = null;

        marker.on('dragend', (e) => {
            const pos = e.target.getLatLng();
            setGeoMapCoords({ lat: pos.lat, lon: pos.lng });
            clearTimeout(dragTimer);
            dragTimer = setTimeout(async () => {
                try {
                    const controller = new AbortController();
                    const tid = setTimeout(() => controller.abort(), 4000);
                    const res = await fetch(
                        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${pos.lat}&lon=${pos.lng}&zoom=18&addressdetails=1&accept-language=en`,
                        { headers: { 'X-Requested-With': 'AnywhereApp' }, signal: controller.signal }
                    );
                    clearTimeout(tid);
                    if (!res.ok) throw new Error('reverse geocode failed');
                    const data = await res.json();
                    const addr = data.address || {};
                    const parts = [
                        addr.house_number, addr.road, addr.neighbourhood || addr.suburb,
                        addr.city || addr.town || addr.village, addr.state, 'India'
                    ].filter(Boolean);
                    const display = parts.join(', ') || data.display_name || 'My location';
                    setSelected(true);
                    setSuggestions([]);
                    setIsOpen(false);
                    onChange(display);
                    onSelect({
                        title: display.split(',')[0] || display,
                        address: display,
                        latitude: pos.lat,
                        longitude: pos.lng,
                        subtext: [addr.city || addr.town, addr.state].filter(Boolean).join(', '),
                    });
                } catch {
                    setGeoError('Could not resolve the new address. Please enter it manually.');
                }
            }, 400);
        });

        setTimeout(() => map.invalidateSize(), 100);
        geoMapInstance.current = map;

        return () => {
            clearTimeout(dragTimer);
            map.remove();
            geoMapInstance.current = null;
        };
    }, [geoMapCoords]);

    /* ── Execute search query with debounce & abort ── */
    const executeSearch = useCallback((searchTerm) => {
        const query = sanitizeQuery(searchTerm);
        setError("");
        setEmptyState("");
        setActiveIndex(-1);

        if (selected || query.length === 0) {
            setSuggestions([]);
            setLoading(false);
            setIsOpen(false);
            return;
        }

        if (query.length < MIN_QUERY_LENGTH) {
            setSuggestions([]);
            setLoading(false);
            setIsOpen(true); // display "Type at least 2 letters"
            return;
        }

        setShowPopular(false);
        setIsOpen(true);

        const cacheKey = `${districtKey}:${query.toLowerCase()}`;
        const cached = getCached(cacheKey);
        if (cached) {
            setSuggestions(cached);
            setLoading(false);
            return;
        }

        const requestId = ++requestIdRef.current;
        const controller = new AbortController();
        const timeoutId = window.setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

        setLoading(true);

        (async () => {
            try {
                // 1. Local district_areas search first (fast)
                const localResults = await fetchDistrictAreas(districtKey, query, controller.signal);

                // 2. Query Nominatim proxy / fallback (Tamil Nadu, bounded to district)
                let externalResults = [];
                try {
                    externalResults = await fetchNominatimProxy(query, isDistrictMode ? district : "", controller.signal);
                } catch {
                    // Nominatim failed or offline, proceed with local
                }

                if (requestId !== requestIdRef.current) return;

                // 3. Merge & Dedupe by name + rounded coordinates (keep local results on top)
                const merged = [...localResults];
                const seenKeys = new Set(
                    localResults.map((r) => `${r.title.toLowerCase().trim()}|${Number(r.latitude).toFixed(3)}|${Number(r.longitude).toFixed(3)}`)
                );

                for (const item of externalResults) {
                    const dedupeKey = `${item.title.toLowerCase().trim()}|${Number(item.latitude).toFixed(3)}|${Number(item.longitude).toFixed(3)}`;
                    if (!seenKeys.has(dedupeKey)) {
                        seenKeys.add(dedupeKey);
                        merged.push(item);
                    }
                }

                if (merged.length === 0) {
                    setSuggestions([]);
                    setEmptyState(
                        isDistrictMode
                            ? `No places found in ${district || "your district"}. Try a nearby landmark or pincode.`
                            : "No matching address found in Tamil Nadu. Try a nearby landmark or pincode."
                    );
                } else {
                    const final = merged.slice(0, MAX_SUGGESTIONS);
                    setCache(cacheKey, final);
                    setSuggestions(final);
                    setEmptyState("");
                }
            } catch (err) {
                if (requestId !== requestIdRef.current) return;
                setSuggestions([]);
                setError("Search is unavailable right now - retry");
            } finally {
                window.clearTimeout(timeoutId);
                if (requestId === requestIdRef.current) {
                    setLoading(false);
                }
            }
        })();
    }, [selected, districtKey, isDistrictMode, district]);

    /* ── Main search effect with 300ms debounce ── */
    useEffect(() => {
        const query = sanitizeQuery(value);
        if (selected || query.length === 0) {
            setSuggestions([]);
            setLoading(false);
            setError("");
            setEmptyState("");
            return;
        }

        const timerId = window.setTimeout(() => {
            executeSearch(value);
        }, DEBOUNCE_MS);

        return () => {
            window.clearTimeout(timerId);
        };
    }, [value, selected, executeSearch]);

    const handleFocus = useCallback(() => {
        if (!value || value.trim().length === 0) {
            setShowPopular(true);
            setIsOpen(true);
        } else {
            setIsOpen(true);
            if (value.trim().length >= MIN_QUERY_LENGTH && suggestions.length === 0 && !loading && !error && !emptyState) {
                executeSearch(value);
            }
        }
    }, [value, suggestions.length, loading, error, emptyState, executeSearch]);

    const handleInputChange = (e) => {
        setSelected(false);
        setSuggestions([]);
        setError("");
        setEmptyState("");
        setShowPopular(false);
        setActiveIndex(-1);
        setIsOpen(true);
        onChange(e.target.value);
    };

    const handleSelect = (location) => {
        if (!isValidLocation(location)) {
            setError("Please select a valid location from the suggestions.");
            return;
        }
        setSelected(true);
        setSuggestions([]);
        setError("");
        setEmptyState("");
        setShowPopular(false);
        setIsOpen(false);
        setActiveIndex(-1);
        onChange(location.title);
        onSelect(location);
    };

    const handleClear = () => {
        requestIdRef.current += 1;
        setSelected(false);
        setSuggestions([]);
        setError("");
        setEmptyState("");
        setShowPopular(false);
        setIsOpen(false);
        setActiveIndex(-1);
        setGeoMapCoords(null);
        setGeoInfo('');
        setGeoError('');
        onClear?.();
    };

    const handleRetry = () => {
        executeSearch(value);
    };

    /* ── Keyboard navigation ── */
    const handleKeyDown = (e) => {
        const currentList = showPopular && !value ? popularItems : suggestions;
        if (!isOpen) {
            if (e.key === "ArrowDown" || e.key === "ArrowUp") {
                setIsOpen(true);
                return;
            }
        }

        if (e.key === "ArrowDown") {
            e.preventDefault();
            if (currentList.length === 0) return;
            setActiveIndex((prev) => (prev + 1 >= currentList.length ? 0 : prev + 1));
        } else if (e.key === "ArrowUp") {
            e.preventDefault();
            if (currentList.length === 0) return;
            setActiveIndex((prev) => (prev - 1 < 0 ? currentList.length - 1 : prev - 1));
        } else if (e.key === "Enter") {
            if (activeIndex >= 0 && activeIndex < currentList.length) {
                e.preventDefault();
                handleSelect(currentList[activeIndex]);
            }
        } else if (e.key === "Escape") {
            setIsOpen(false);
            setShowPopular(false);
            setActiveIndex(-1);
        }
    };

    /* ── Geolocation Detection ── */
    const setDetectedLocation = (lat, lon, display, addrParts) => {
        setSelected(true);
        setSuggestions([]);
        setIsOpen(false);
        setGeoLoading(false);
        setGeoError('');
        onChange(display);
        onSelect({
            title: display.split(',')[0] || display,
            address: display,
            latitude: lat,
            longitude: lon,
            subtext: addrParts,
        });
        setTimeout(() => setGeoMapCoords({ lat, lon }), 100);
    };

    const handleUseMyLocation = () => {
        setGeoError('');
        setGeoInfo('');
        if (!navigator.geolocation) {
            setGeoError('Geolocation is not supported by your browser. Please enter your address manually.');
            return;
        }
        setGeoLoading(true);
        let resolved = false;

        const finish = (cleanup) => {
            if (resolved) return;
            resolved = true;
            clearTimeout(selfTimeout);
            cleanup();
        };

        const reverseGeocode = async (latitude, longitude) => {
            try {
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), 4000);
                const res = await fetch(
                    `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1&accept-language=en`,
                    { headers: { 'X-Requested-With': 'AnywhereApp' }, signal: controller.signal }
                );
                clearTimeout(timeoutId);
                if (!res.ok) throw new Error('reverse geocode failed');
                const data = await res.json();
                const addr = data.address || {};
                const parts = [
                    addr.house_number, addr.road, addr.neighbourhood || addr.suburb,
                    addr.city || addr.town || addr.village, addr.state, 'India'
                ].filter(Boolean);
                const display = parts.join(', ') || data.display_name || 'My location';
                setDetectedLocation(latitude, longitude, display, [addr.city || addr.town, addr.state].filter(Boolean).join(', '));
            } catch {
                setGeoLoading(false);
                setGeoError('Could not resolve your address from coordinates. Please enter it manually.');
            }
        };

        const onGeoError = async (err) => {
            finish(() => {});
            try {
                const ipRes = await fetch('https://ipapi.co/json/');
                if (ipRes.ok) {
                    const ipData = await ipRes.json();
                    if (ipData.latitude && ipData.longitude) {
                        const controller = new AbortController();
                        const timeoutId = setTimeout(() => controller.abort(), 4000);
                        const geoRes = await fetch(
                            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${ipData.latitude}&lon=${ipData.longitude}&zoom=18&addressdetails=1&accept-language=en`,
                            { headers: { 'X-Requested-With': 'AnywhereApp' }, signal: controller.signal }
                        );
                        clearTimeout(timeoutId);
                        if (!geoRes.ok) throw new Error('reverse geocode failed');
                        const data = await geoRes.json();
                        const addr = data.address || {};
                        const parts = [
                            addr.house_number, addr.road, addr.neighbourhood || addr.suburb,
                            addr.city || addr.town || addr.village, addr.state, 'India'
                        ].filter(Boolean);
                        const display = parts.join(', ') || data.display_name || 'My location';
                        setGeoInfo('Using approximate location based on your network. Drag the pin to your exact location.');
                        setDetectedLocation(ipData.latitude, ipData.longitude, display, [addr.city || addr.town, addr.state].filter(Boolean).join(', '));
                        return;
                    }
                }
            } catch {
                // IP fallback failed
            }
            setGeoLoading(false);
            switch (err.code) {
                case err.PERMISSION_DENIED:
                    setGeoError('Location permission denied. Please enable location access in your browser settings or enter your address manually.');
                    break;
                case err.POSITION_UNAVAILABLE:
                    setGeoError('Location unavailable on this device. Please enter your address manually.');
                    break;
                case err.TIMEOUT:
                    setGeoError('Location request timed out. Please try again or enter your address manually.');
                    break;
                default:
                    setGeoError('Could not detect your location. Please enter your address manually.');
            }
        };

        const geoOptions = { enableHighAccuracy: false, timeout: 8000, maximumAge: 300000 };
        navigator.geolocation.getCurrentPosition(
            (position) => {
                finish(() => {});
                reverseGeocode(position.coords.latitude, position.coords.longitude);
            },
            onGeoError,
            geoOptions
        );

        const selfTimeout = setTimeout(async () => {
            if (resolved) return;
            resolved = true;
            try {
                const ipRes = await fetch('https://ipapi.co/json/');
                if (ipRes.ok) {
                    const ipData = await ipRes.json();
                    if (ipData.latitude && ipData.longitude) {
                        const controller = new AbortController();
                        const tid = setTimeout(() => controller.abort(), 4000);
                        const geoRes = await fetch(
                            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${ipData.latitude}&lon=${ipData.longitude}&zoom=18&addressdetails=1&accept-language=en`,
                            { headers: { 'X-Requested-With': 'AnywhereApp' }, signal: controller.signal }
                        );
                        clearTimeout(tid);
                        if (geoRes.ok) {
                            const data = await geoRes.json();
                            const addr = data.address || {};
                            const parts = [
                                addr.house_number, addr.road, addr.neighbourhood || addr.suburb,
                                addr.city || addr.town || addr.village, addr.state, 'India'
                            ].filter(Boolean);
                            const display = parts.join(', ') || data.display_name || 'My location';
                            setGeoInfo('Using approximate location based on your network. Drag the pin to your exact location.');
                            setDetectedLocation(ipData.latitude, ipData.longitude, display, [addr.city || addr.town, addr.state].filter(Boolean).join(', '));
                            return;
                        }
                    }
                }
            } catch {
                // IP fallback failed
            }
            setGeoLoading(false);
            setGeoInfo('');
            setGeoError('Location detection failed on this device. Please enter your address manually.');
        }, 8000);
    };

    const displayList = showPopular && !value ? popularItems : suggestions;
    const popularHeader = isDistrictMode
        ? `📍 Areas in ${district}`
        : "📍 Popular locations in Tamil Nadu";

    const queryLength = sanitizeQuery(value).length;
    const showTypingHint = isOpen && queryLength > 0 && queryLength < MIN_QUERY_LENGTH && !selected;
    const hasDropdownContent = isOpen && (loading || error || emptyState || showTypingHint || displayList.length > 0);

    return (
        <div className="address-autocomplete" ref={containerRef}>
            {label && <label className="address-label">{label}</label>}
            <div className="address-autocomplete-control">
                <input
                    ref={inputElementRef}
                    type="text"
                    value={value || ""}
                    onChange={handleInputChange}
                    onFocus={handleFocus}
                    onKeyDown={handleKeyDown}
                    disabled={disabled}
                    placeholder={placeholder || (isDistrictMode ? `Search area in ${district}…` : "Search address…")}
                    autoComplete="off"
                    aria-autocomplete="list"
                    aria-label={label || placeholder || "Address"}
                />
                {loading && <span className="address-spinner" aria-hidden="true" />}
                {showUseMyLocation && !value && !loading && (
                    <button type="button" className="address-geo-btn" onClick={handleUseMyLocation} disabled={geoLoading || disabled} aria-label="Use my current location">
                        {geoLoading ? '⏳' : '📍'} {geoLoading ? 'Locating...' : 'Use My Location'}
                    </button>
                )}
                {value && !loading && (
                    <button type="button" className="address-clear-btn" onClick={handleClear} aria-label="Clear address">
                        Clear
                    </button>
                )}

                {hasDropdownContent && (
                    <div className="address-suggestions" role="listbox">
                        {/* 1. Typing hint */}
                        {showTypingHint && (
                            <div className="address-hint-row">
                                <span>✍️ Type at least 2 letters to search</span>
                            </div>
                        )}

                        {/* 2. Shimmer rows while loading */}
                        {loading && (
                            <div className="address-shimmer-container" aria-label="Loading suggestions">
                                <div className="address-shimmer-row">
                                    <div className="shimmer-pin"></div>
                                    <div className="shimmer-lines">
                                        <div className="shimmer-line short"></div>
                                        <div className="shimmer-line long"></div>
                                    </div>
                                </div>
                                <div className="address-shimmer-row">
                                    <div className="shimmer-pin"></div>
                                    <div className="shimmer-lines">
                                        <div className="shimmer-line short"></div>
                                        <div className="shimmer-line long"></div>
                                    </div>
                                </div>
                                <div className="address-shimmer-row">
                                    <div className="shimmer-pin"></div>
                                    <div className="shimmer-lines">
                                        <div className="shimmer-line short"></div>
                                        <div className="shimmer-line long"></div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* 3. Error state with retry */}
                        {!loading && error && (
                            <div className="address-error-row">
                                <span>⚠️ {error}</span>
                                <button type="button" className="address-retry-btn" onClick={handleRetry}>
                                    Retry
                                </button>
                            </div>
                        )}

                        {/* 4. Empty state (Never show a silent empty box) */}
                        {!loading && !error && emptyState && (
                            <div className="address-empty-row">
                                <span>📍 {emptyState}</span>
                            </div>
                        )}

                        {/* 5. Suggestions list */}
                        {!loading && !error && !emptyState && displayList.length > 0 && (
                            <>
                                {showPopular && !value && (
                                    <div className="address-suggestions-header">{popularHeader}</div>
                                )}
                                {displayList.map((loc, idx) => (
                                    <button
                                        type="button"
                                        className={`address-suggestion-row ${idx === activeIndex ? "active" : ""}`}
                                        key={`${loc.latitude}-${loc.longitude}-${loc.title}-${idx}`}
                                        onClick={() => handleSelect(loc)}
                                        onMouseEnter={() => setActiveIndex(idx)}
                                        role="option"
                                        aria-selected={idx === activeIndex}
                                    >
                                        <span className="address-pin" aria-hidden="true">
                                            <svg viewBox="0 0 24 24" fill="none" width="18" height="18">
                                                <path d="M12 21s-7-5.5-7-11a7 7 0 1114 0c0 5.5-7 11-7 11z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
                                                <circle cx="12" cy="10" r="2.6" stroke="currentColor" strokeWidth="1.8" />
                                            </svg>
                                        </span>
                                        <span className="address-suggestion-text">
                                            <strong className="address-suggestion-title">
                                                {highlightText(loc.title, value || "")}
                                                {loc.isLocal && <span className="address-local-badge">Verified</span>}
                                            </strong>
                                            {loc.subtext && <small className="address-suggestion-sub">{loc.subtext}</small>}
                                        </span>
                                    </button>
                                ))}
                            </>
                        )}
                    </div>
                )}
            </div>

            {geoError && <small className="address-error">{geoError}</small>}
            {geoInfo && <small className="address-info">{geoInfo}</small>}
            {geoMapCoords && (
                <div className="addr-confirm-map-section">
                    <div ref={geoMapRef} className="addr-confirm-map" style={{ height: '220px', width: '100%', borderRadius: '10px', border: '1px solid #e5e7eb' }} />
                    <small className="addr-confirm-map-hint">📍 Drag the pin to your exact location if needed</small>
                    <button type="button" className="addr-confirm-map-btn" onClick={() => setGeoMapCoords(null)}>✓ Confirm Location</button>
                </div>
            )}
        </div>
    );
}

/* ── Helpers ── */

function sanitizeQuery(value) {
    return String(value || "").replace(/[<>]/g, "").replace(/\s+/g, " ").trim();
}

function cleanEnglishText(text) {
    if (!text) return "";
    return String(text)
        .replace(/[\u0B80-\u0BFF\u0900-\u097F]+\s*[\/\-]\s*/g, "")
        .replace(/\s*[\/\-]\s*[\u0B80-\u0BFF\u0900-\u097F]+/g, "")
        .replace(/[\u0B80-\u0BFF\u0900-\u097F]+/g, "")
        .replace(/\s*,\s*,+/g, ",")
        .replace(/^\s*[,/-]\s*/, "")
        .replace(/\s*[,/-]\s*$/, "")
        .replace(/\s{2,}/g, " ")
        .trim();
}

function isTamilNadu(item) {
    const d = item?.address || {};
    const hay = [item?.display_name, d?.state, d?.state_district, d?.county].filter(Boolean).join(" ").toLowerCase();
    return hay.includes("tamil");
}

/** Returns a filter predicate that checks whether a geocoded result belongs to the given district */
function matchesDistrict(districtKey) {
    return (item) => {
        const d = item?.address || {};
        const hay = [
            item?.display_name,
            d?.state_district,
            d?.county,
            d?.city,
            d?.town,
            d?.village,
        ].filter(Boolean).join(" ").toLowerCase();
        // Normalize trichy alias
        const normalized = districtKey === "trichy" ? ["trichy", "tiruchirappalli"] : [districtKey];
        return normalized.some((k) => hay.includes(k)) && isTamilNadu(item);
    };
}

function toLocation(item) {
    const d = item?.address || {};
    const raw = item?.display_name || "";
    const clean = cleanEnglishText(raw);
    const segs = clean.split(",").map(cleanEnglishText).filter((s) => s.length > 0 && !/^[,.\-\/\s]+$/.test(s));
    const rawTitle = segs.shift() || cleanEnglishText(d?.name) || clean;
    let title = cleanEnglishText(rawTitle);
    
    // Enhance title with landmark/area type for better specificity
    const landmarkTypes = [];
    if (d?.amenity) landmarkTypes.push(getAmenityLabel(d.amenity));
    if (d?.shop) landmarkTypes.push("Shop");
    if (d?.tourism) landmarkTypes.push(getTourismLabel(d.tourism));
    if (d?.railway) landmarkTypes.push("Railway");
    if (d?.highway && d?.highway !== "unclassified") landmarkTypes.push("Road");
    
    // If we have landmark info, enhance the title
    if (landmarkTypes.length > 0 && !title.toLowerCase().includes(landmarkTypes[0].toLowerCase())) {
        title = `${title} ${landmarkTypes[0]}`;
    }
    
    // Create better subtext with more specific location info
    let subtext = "";
    const locationParts = [];
    if (d?.road && !segs.some(s => s.toLowerCase().includes(d.road.toLowerCase()))) {
        locationParts.push(d.road);
    }
    if (d?.suburb || d?.neighbourhood) {
        locationParts.push(d.suburb || d.neighbourhood);
    }
    
    // Add remaining segments that aren't already included
    locationParts.push(...segs.slice(0, 2));
    
    subtext = locationParts.filter(Boolean).join(", ") || (d?.state ? `${d.state}, India` : "Tamil Nadu, India");
    
    return {
        address:   [title, subtext].filter(Boolean).join(", ") || clean,
        title:     title || clean || "Location",
        subtext,
        latitude:  Number(item?.lat),
        longitude: Number(item?.lon),
        district:  cleanEnglishText(d?.state_district || d?.county) || null,
        city:      cleanEnglishText(d?.city || d?.town || d?.village) || null,
        pincode:   d?.postcode || null,
        isSpecific: Boolean(d?.amenity || d?.shop || d?.tourism || d?.railway || d?.road), // Flag for prioritizing specific places
    };
}

// Helper functions for landmark labels
function getAmenityLabel(amenity) {
    const labels = {
        'bus_station': 'Bus Stand',
        'railway_station': 'Railway Station',
        'hospital': 'Hospital',
        'school': 'School',
        'college': 'College',
        'bank': 'Bank',
        'atm': 'ATM',
        'post_office': 'Post Office',
        'police': 'Police Station',
        'fire_station': 'Fire Station',
        'temple': 'Temple',
        'church': 'Church',
        'mosque': 'Mosque',
        'market': 'Market',
        'restaurant': 'Restaurant',
        'cafe': 'Cafe',
        'fuel': 'Petrol Bunk'
    };
    return labels[amenity] || 'Place';
}

function getTourismLabel(tourism) {
    const labels = {
        'attraction': 'Tourist Spot',
        'museum': 'Museum',
        'monument': 'Monument',
        'hotel': 'Hotel',
        'guest_house': 'Guest House'
    };
    return labels[tourism] || 'Tourism';
}

function isValidLocation(loc) {
    return Boolean(loc?.address || loc?.title)
        && Number.isFinite(loc?.latitude)
        && Number.isFinite(loc?.longitude)
        && loc.latitude >= 5 && loc.latitude <= 14   // Tamil Nadu bounding box
        && loc.longitude >= 76 && loc.longitude <= 81;
}

function highlightText(text, query) {
    const q = sanitizeQuery(query);
    if (!q || !text) return text;
    const parts = String(text).split(new RegExp(`(${escapeRegExp(q)})`, "i"));
    return parts.map((part, i) =>
        part.toLowerCase() === q.toLowerCase()
            ? <strong key={i} className="address-match">{part}</strong>
            : part
    );
}

function escapeRegExp(text) {
    return text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export default AddressAutocomplete;
