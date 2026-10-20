import { DISTANCE_URL } from "./apiConfig";
import { apiFetchJson, errorLogger } from "./apiClient";

/**
 * Distance is computed by the backend Haversine utility
 * (com.app.start_app.delivery.DistanceCalculatorUtil) via POST /api/distance.
 *
 * There is intentionally no hardcoded district/hub table here — districts come
 * from the database through services/districts.js. If the backend is briefly
 * unavailable, we fall back to the identical Haversine formula locally so the
 * UI still works; we never invent district coordinates.
 */

export function haversineKm(lat1, lon1, lat2, lon2) {
    const R = 6371;
    const toRad = (deg) => (deg * Math.PI) / 180;
    const dLat = toRad(Number(lat2) - Number(lat1));
    const dLon = toRad(Number(lon2) - Number(lon1));
    const a =
        Math.sin(dLat / 2) ** 2 +
        Math.cos(toRad(Number(lat1))) * Math.cos(toRad(Number(lat2))) * Math.sin(dLon / 2) ** 2;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return Math.round(R * c * 100) / 100;
}

export async function getDistanceKm(lat1, lon1, lat2, lon2) {
    try {
        const data = await apiFetchJson(DISTANCE_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ lat1, lon1, lat2, lon2 }),
        }, {
            retries: 1,
            validate: {
                lat1: { required: true, type: "number" },
                lon1: { required: true, type: "number" },
                lat2: { required: true, type: "number" },
                lon2: { required: true, type: "number" },
            },
        });
        const km = Number(data.distanceKm);
        if (Number.isFinite(km)) return km;
    } catch (err) {
        errorLogger.info("getDistanceKm backend unavailable, using local Haversine", {
            error: err,
            extra: { lat1, lon1, lat2, lon2 },
        });
    }
    return haversineKm(lat1, lon1, lat2, lon2);
}
