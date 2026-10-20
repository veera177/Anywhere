import { EXTERNAL_URLS } from "./apiConfig";
import { apiFetchJson, errorLogger, getErrorDisplayMessage } from "./apiClient";

const NOMINATIM_URL = EXTERNAL_URLS.NOMINATIM;
const OSRM_URL = EXTERNAL_URLS.OSRM;

export async function calculateRoute(pickupAddress, dropAddress, districtName) {
    const pickup = await geocodeAddress(pickupAddress, districtName);
    const drop = await geocodeAddress(dropAddress, districtName);

    if (!pickup || !drop) {
        throw new Error("We could not find one of the addresses. Please enter a more complete pickup and drop address.");
    }

    const route = await fetchRoute(pickup, drop);
    if (!route || route.distanceKm <= 0) {
        throw new Error("Route distance could not be calculated. Please check the pickup and drop address.");
    }

    return {
        pickup,
        drop,
        distanceKm: route.distanceKm,
        travelMinutes: route.travelMinutes,
        mapUrl: route.mapUrl,
    };
}

async function geocodeAddress(address, districtName) {
    const query = `${address}, ${districtName}, Tamil Nadu, India`;
    const url = `${NOMINATIM_URL}?format=json&q=${encodeURIComponent(query)}&limit=1&accept-language=en`;
    try {
        const results = await apiFetchJson(url, {
            headers: { "Accept": "application/json" },
        }, { retries: 1 });
        const first = results[0];
        if (!first) return null;
        return {
            lat: Number(first.lat),
            lon: Number(first.lon),
            label: first.display_name,
        };
    } catch (err) {
        errorLogger.warn("geocodeAddress failed - Nominatim may be rate limited", {
            error: err,
            extra: { address, districtName },
        });
        return null;
    }
}

async function fetchRoute(pickup, drop) {
    const url = `${OSRM_URL}/${pickup.lon},${pickup.lat};${drop.lon},${drop.lat}?overview=false`;
    try {
        const data = await apiFetchJson(url, {}, { retries: 1 });
        const route = data.routes?.[0];
        if (!route) return null;
        return {
            distanceKm: Number((route.distance / 1000).toFixed(2)),
            travelMinutes: Math.max(1, Math.round(route.duration / 60)),
            mapUrl: `https://www.openstreetmap.org/directions?engine=fossgis_osrm_car&route=${pickup.lat}%2C${pickup.lon}%3B${drop.lat}%2C${drop.lon}`,
        };
    } catch (err) {
        errorLogger.error("fetchRoute OSRM request failed", {
            error: err,
            extra: { pickup, drop },
        });
        throw new Error(getErrorDisplayMessage(err) || "Route calculation service unavailable");
    }
}
