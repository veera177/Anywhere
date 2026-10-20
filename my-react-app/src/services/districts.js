import { API_BASE } from "./apiConfig";
import { apiFetchJson } from "./apiClient";
import { getPlatformSettings, readSetting } from "./platformSettings";

/**
 * Districts are loaded from the backend (`/api/districts`), so every district in
 * the database works automatically — including districts added in the future.
 * No district names, coordinates or radii are hardcoded here.
 */

let districtsCache = null;

function toNumber(value) {
    const n = Number(value);
    return Number.isFinite(n) ? n : null;
}

/**
 * Fetch all districts from the database.
 * Each entry includes live service counts from the backend.
 */
export async function getDistricts() {
    if (districtsCache) return districtsCache;

    try {
        const rows = await apiFetchJson(`${API_BASE}/districts`, {}, { retries: 1 });
        if (!Array.isArray(rows)) {
            throw new Error("Districts API returned a non-array response");
        }
        districtsCache = rows
            .map((row) => ({
                id: row.code ?? String(row.id),
                dbId: row.id,
                name: row.name,
                code: row.code,
                lat: toNumber(row.latitude),
                lon: toNumber(row.longitude),
                partnerCounts: row.partnerCounts || { food: 0, grocery: 0, medicine: 0 },
                services: Array.isArray(row.services) ? row.services : [],
                courierAvailable: Boolean(row.courierAvailable),
            }))
            .filter((d) => d.id && d.name);
        return districtsCache;
    } catch (err) {
        console.warn("[districts] Failed to load districts:", err);
        districtsCache = [];
        return districtsCache;
    }
}

export async function checkDistrictAvailability(query) {
    const q = String(query || '').trim();
    if (!q) return { available: false, district: null, services: [], partnerCounts: {}, nearestAvailableDistrict: null };
    return apiFetchJson(`${API_BASE}/districts/check?q=${encodeURIComponent(q)}`, {}, { retries: 0 });
}

/**
 * Coverage radius (km) for a service, read from platform_settings.
 * Keys: delivery.food.radius_km / delivery.grocery.radius_km /
 *       delivery.medicine.radius_km / delivery.courier.radius_km
 * Returns null when the backend has no value — callers must not guess.
 */
export async function getServiceRadiusKm(serviceType) {
    const settings = await getPlatformSettings();
    const value = readSetting(settings, `delivery.${serviceType}.radius_km`);
    const n = toNumber(value);
    return n && n > 0 ? n : null;
}

export function invalidateDistrictsCache() {
    districtsCache = null;
}

/**
 * The district the signed-in user picked in their Profile is their active
 * service area. Every service page (Food/Grocery/Medicine/Courier) uses this as
 * its initial district so the user never has to re-select it. Matches by the
 * district `code` id first, then by display name, and falls back to the first
 * district only when the user has no stored district.
 */
export function resolvePreferredDistrictId(list, fallback = '') {
    const districts = Array.isArray(list) ? list : [];
    if (districts.length === 0) return fallback;

    let profileDistrict = '';
    try {
        const selected = String(localStorage.getItem('selectedDistrictId') || '').trim().toLowerCase();
        const selectedMatch = districts.find((d) => d.id === selected || String(d.dbId) === selected || String(d.name || '').toLowerCase() === selected);
        if (selectedMatch) return selectedMatch.id;
        const user = JSON.parse(localStorage.getItem('user') || 'null');
        profileDistrict = String(user?.district || '').trim().toLowerCase();
    } catch {
        profileDistrict = '';
    }

    if (profileDistrict) {
        const match = districts.find(
            (d) => d.id === profileDistrict
                || String(d.name || '').toLowerCase() === profileDistrict
        );
        if (match) return match.id;
    }

    return districts[0]?.id ?? fallback;
}
