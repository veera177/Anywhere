import { useEffect, useMemo, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import './DeliveryMap.css';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl:       'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl:     'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

function getServiceIcon(serviceType) {
    switch (serviceType) {
        case 'food':
            return '<path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2M7 2v20M21 15V2a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7"/>';
        case 'grocery':
            return '<path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/>';
        case 'medicine':
            return '<path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>';
        case 'courier':
            return '<path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27,6.96 12,12.01 20.73,6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/>';
        default:
            return '<circle cx="12" cy="12" r="3"/><path d="M12 1v6m0 6v6m11-7h-6m-6 0H1"/>';
    }
}

/**
 * Coverage map: renders one marker per contracted partner using its REAL
 * database coordinates, plus a coverage circle centred on each partner.
 *
 * Props:
 *  - lat/lon: optional map focus (e.g. district centroid) used only to frame
 *             the view when there are no partner markers yet.
 *  - markers: [{ id, name, lat, lon, rating, address }] from the backend.
 *  - radiusKm: coverage radius per partner, read from platform_settings.
 *              Must be provided by the caller — no hardcoded value here.
 */
function DeliveryMap({
    lat,
    lon,
    zoom = 13,
    markers = [],
    height = '420px',
    className = '',
    serviceType = 'food',
    radiusKm,
    onSelectMarker,
    activeStoreId,
}) {
    const mapRef          = useRef(null);
    const mapInstance     = useRef(null);
    const markersLayerRef = useRef(null);

    const colorScheme = {
        food:     { primary: '#FC8019', label: 'Restaurant',  emoji: '🍽️',  badge: '#E23744' },
        grocery:  { primary: '#10B981', label: 'Grocery Mart', emoji: '🛒',  badge: '#059669' },
        medicine: { primary: '#2563EB', label: 'Pharmacy',    emoji: '💊',  badge: '#1D4ED8' },
        courier:  { primary: '#8B5CF6', label: 'Courier Hub', emoji: '📦',  badge: '#6D28D9' },
    };
    const colors = useMemo(
        () => colorScheme[serviceType] || colorScheme.food,
        [serviceType]
    );

    /* Radius in metres — caller supplies km from platform_settings */
    const radiusM = Number(radiusKm) > 0 ? Number(radiusKm) * 1000 : null;

    /* Initial view: district centroid when known, Tamil Nadu centre otherwise.
       This is only the viewport default — never displayed as a partner location. */
    const initLat = Number.isFinite(Number(lat)) ? Number(lat) : 11.1271;
    const initLon = Number.isFinite(Number(lon)) ? Number(lon) : 78.6569;

    /* ── Init map once ── */
    useEffect(() => {
        if (!mapRef.current || mapInstance.current) return;
        const map = L.map(mapRef.current, {
            center: [initLat, initLon],
            zoom,
            zoomControl: false,
            attributionControl: false,
            scrollWheelZoom: true,
            dragging: true,
            doubleClickZoom: true,
        });
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 19,
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        }).addTo(map);
        L.control.zoom({ position: 'topright' }).addTo(map);
        L.control.attribution({ position: 'bottomleft', prefix: '' }).addTo(map);
        mapInstance.current     = map;
        markersLayerRef.current = L.layerGroup().addTo(map);
        return () => {
            map.remove();
            mapInstance.current     = null;
            markersLayerRef.current = null;
        };
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    /* ── Update markers/circles when data changes ── */
    useEffect(() => {
        const map   = mapInstance.current;
        const layer = markersLayerRef.current;
        if (!map || !layer) return;
        layer.clearLayers();

        /* Partner markers — each with its own coverage circle centred on it */
        const markerPoints = [];
        let coverageBounds = null;
        markers.forEach((m, i) => {
            const mLat = Number(m.lat);
            const mLon = Number(m.lon);
            if (!Number.isFinite(mLat) || !Number.isFinite(mLon)) return;
            markerPoints.push([mLat, mLon]);

            const isSelected = activeStoreId && m.id === activeStoreId;
            const icon = L.divIcon({
                className: `dm-shop-icon${isSelected ? ' dm-shop-selected' : ''}`,
                html: `
                    <div class="dm-shop-card" style="--dm-color:${m.color || colors.primary}">
                        <div class="dm-shop-pin-head">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="white">
                                ${getServiceIcon(serviceType)}
                            </svg>
                        </div>
                        <div class="dm-shop-label-chip">
                            <strong>${m.name}</strong>
                            ${m.rating ? `<span class="dm-rating-badge">&#9733; ${m.rating}</span>` : ''}
                        </div>
                    </div>`,
                iconSize:    [160, 60],
                iconAnchor:  [80, 56],
                popupAnchor: [0, -60],
            });

            const marker = L.marker([mLat, mLon], { icon })
                .addTo(layer)
                .bindPopup(`
                    <div class="dm-popup">
                        <div class="dm-popup-badge" style="background:${m.color || colors.primary}">${colors.label} #${i + 1}</div>
                        <strong>${m.name}</strong>
                        <small>&#128205; ${m.address || 'Verified Location'}</small>
                        <div class="dm-popup-meta">
                            ${m.rating ? `<span class="dm-popup-rating">&#11088; ${m.rating} Rating</span>` : ''}
                            <span class="dm-popup-status">&#128994; Open for delivery</span>
                        </div>
                    </div>`);

            if (onSelectMarker) marker.on('click', () => onSelectMarker(m));

            /* Coverage circle centred on THIS partner's own coordinates */
            if (radiusM) {
                const circle = L.circle([mLat, mLon], {
                    color:       m.color || colors.primary,
                    fillColor:   m.color || colors.primary,
                    fillOpacity: 0.05,
                    radius:      radiusM,
                    weight:      2,
                    dashArray:   '10, 8',
                    opacity:     0.55,
                }).addTo(layer);
                coverageBounds = coverageBounds
                    ? coverageBounds.extend(circle.getBounds())
                    : circle.getBounds();
            }
        });

        /* Fit map to partner locations */
        if (markerPoints.length > 0) {
            // Include service-radius circles, not only pins, so the coverage
            // image cannot be clipped or misleading at the map edges.
            map.fitBounds(coverageBounds || markerPoints, { padding: [60, 60], maxZoom: 15 });
        } else if (Number.isFinite(Number(lat)) && Number.isFinite(Number(lon))) {
            map.setView([Number(lat), Number(lon)], zoom);
        }
        requestAnimationFrame(() => map.invalidateSize());
    }, [lat, lon, zoom, markers, colors, radiusM, activeStoreId, onSelectMarker, serviceType]);
    const count = markers.filter((m) => Number.isFinite(Number(m.lat)) && Number.isFinite(Number(m.lon))).length;

    return (
        <div className={`dm-wrapper ${className}`}>
            <div ref={mapRef} className="dm-container" style={{ height, width: '100%' }} />
            <div className="dm-overlay-pill">
                <span className="dm-live-dot" />
                <span>
                    {count > 0
                        ? `${count} verified ${colors.label.toLowerCase()}${count === 1 ? '' : (colors.label === 'Pharmacy' ? 'ies' : 's')} · ${radiusKm ? `${radiusKm} km coverage each` : 'coverage from settings'}`
                        : `Loading ${colors.label.toLowerCase()}s…`}
                </span>
            </div>
        </div>
    );
}

export default DeliveryMap;
