import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "./MapPreview.css";

/**
 * Premium Swiggy/Zomato style route map for courier service.
 * Shows pickup + delivery with animated markers and a route line.
 */
function MapPreview({ pickup, delivery, height = 320 }) {
    const containerRef = useRef(null);
    const mapRef = useRef(null);
    const markersRef = useRef([]);

    const pickupReady = pickup && Number.isFinite(Number(pickup.latitude)) && Number.isFinite(Number(pickup.longitude));
    const deliveryReady = delivery && Number.isFinite(Number(delivery.latitude)) && Number.isFinite(Number(delivery.longitude));

    useEffect(() => {
        if (!containerRef.current || mapRef.current) return;

        const map = L.map(containerRef.current, {
            zoomControl: false,
            attributionControl: false,
            scrollWheelZoom: true,
            dragging: true,
        });

        // OpenStreetMap tiles require the visible attribution below.
        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
            maxZoom: 19,
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(map);

        L.control.zoom({ position: "topright" }).addTo(map);
        L.control.attribution({ position: "bottomleft", prefix: "" }).addTo(map);

        mapRef.current = map;
        return () => {
            map.remove();
            mapRef.current = null;
            markersRef.current = [];
        };
    }, []);

    useEffect(() => {
        const map = mapRef.current;
        if (!map) return;
        // Leaflet is often mounted while the service view is transitioning.
        // Recalculate after paint so tiles, pins and the route never render cropped.
        requestAnimationFrame(() => map.invalidateSize());

        // Clear existing markers and lines
        markersRef.current.forEach((el) => el.remove());
        markersRef.current = [];

        const latlngs = [];

        if (pickupReady) {
            const latlng = [Number(pickup.latitude), Number(pickup.longitude)];
            latlngs.push(latlng);
            const icon = L.divIcon({
                className: "mp-marker",
                html: `
                    <div class="mp-pin mp-pin-pickup">
                        <div class="mp-pulse" style="--mp-color:#16a34a"></div>
                        <div class="mp-dot" style="background:#16a34a">
                            <span>P</span>
                        </div>
                    </div>
                `,
                iconSize: [36, 36],
                iconAnchor: [18, 36],
                popupAnchor: [0, -38],
            });
            markersRef.current.push(
                L.marker(latlng, { icon })
                    .bindPopup(`<div class="dm-popup"><div class="dm-popup-badge" style="background:#16a34a">Pickup</div><strong>${pickup.label || "Pickup"}</strong><small>${pickup.address || ""}</small></div>`)
                    .addTo(map)
            );
        }

        if (deliveryReady) {
            const latlng = [Number(delivery.latitude), Number(delivery.longitude)];
            latlngs.push(latlng);
            const icon = L.divIcon({
                className: "mp-marker",
                html: `
                    <div class="mp-pin mp-pin-delivery">
                        <div class="mp-pulse" style="--mp-color:#ef4444"></div>
                        <div class="mp-dot" style="background:#ef4444">
                            <span>D</span>
                        </div>
                    </div>
                `,
                iconSize: [36, 36],
                iconAnchor: [18, 36],
                popupAnchor: [0, -38],
            });
            markersRef.current.push(
                L.marker(latlng, { icon })
                    .bindPopup(`<div class="dm-popup"><div class="dm-popup-badge" style="background:#ef4444">Delivery</div><strong>${delivery.label || "Delivery"}</strong><small>${delivery.address || ""}</small></div>`)
                    .addTo(map)
            );
        }

        // Draw a dashed route line between pickup and delivery
        if (latlngs.length === 2) {
            const line = L.polyline(latlngs, {
                color: "#4361EE",
                weight: 3,
                dashArray: "10, 8",
                opacity: 0.7,
            }).addTo(map);
            markersRef.current.push(line);

            map.fitBounds(latlngs, { padding: [52, 52], maxZoom: 15 });
        } else if (latlngs.length === 1) {
            map.setView(latlngs[0], 15);
        } else {
            map.setView([11.1271, 78.6569], 6);
        }
    }, [pickupReady, deliveryReady, pickup?.latitude, pickup?.longitude, delivery?.latitude, delivery?.longitude,
        pickup?.address, delivery?.address, pickup?.label, delivery?.label]);

    return (
        <div
            ref={containerRef}
            className="map-preview"
            style={{ height }}
            aria-label="Courier route map preview"
        />
    );
}

export default MapPreview;
