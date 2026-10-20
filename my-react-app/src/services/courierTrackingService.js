import { COURIER_TRACKING_BASE } from "./apiConfig";
import { apiFetchJson, errorLogger, getErrorDisplayMessage } from "./apiClient";

export async function createCourierRoute(routeData) {
    try {
        return await apiFetchJson(`${COURIER_TRACKING_BASE}/create-route`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(routeData),
        }, {
            validate: {
                pickupLat: { required: true, type: "number" },
                pickupLon: { required: true, type: "number" },
                deliveryLat: { required: true, type: "number" },
                deliveryLon: { required: true, type: "number" },
            },
        });
    } catch (err) {
        errorLogger.error("createCourierRoute failed", {
            error: err,
            extra: { routeData },
        });
        throw new Error(getErrorDisplayMessage(err) || "Failed to create route");
    }
}

export async function addLocationToRoute(locationData) {
    try {
        return await apiFetchJson(`${COURIER_TRACKING_BASE}/add-location`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(locationData),
        });
    } catch (err) {
        errorLogger.error("addLocationToRoute failed", {
            error: err,
            extra: { locationData },
        });
        throw new Error(getErrorDisplayMessage(err) || "Failed to add location");
    }
}

export async function getRouteDetails(routeId) {
    try {
        return await apiFetchJson(`${COURIER_TRACKING_BASE}/route/${routeId}`);
    } catch (err) {
        errorLogger.error("getRouteDetails failed", {
            error: err,
            extra: { routeId },
        });
        throw new Error(getErrorDisplayMessage(err) || "Failed to fetch route");
    }
}

export async function startRoute(routeId) {
    try {
        return await apiFetchJson(`${COURIER_TRACKING_BASE}/start/${routeId}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
        });
    } catch (err) {
        errorLogger.error("startRoute failed", {
            error: err,
            extra: { routeId },
        });
        throw new Error(getErrorDisplayMessage(err) || "Failed to start route");
    }
}

export async function markLocationReached(locationId) {
    try {
        return await apiFetchJson(`${COURIER_TRACKING_BASE}/location/${locationId}/reached`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
        });
    } catch (err) {
        errorLogger.error("markLocationReached failed", {
            error: err,
            extra: { locationId },
        });
        throw new Error(getErrorDisplayMessage(err) || "Failed to mark location as reached");
    }
}

export async function markLocationCompleted(locationId) {
    try {
        return await apiFetchJson(`${COURIER_TRACKING_BASE}/location/${locationId}/completed`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
        });
    } catch (err) {
        errorLogger.error("markLocationCompleted failed", {
            error: err,
            extra: { locationId },
        });
        throw new Error(getErrorDisplayMessage(err) || "Failed to mark location as completed");
    }
}

export async function completeRoute(routeId) {
    try {
        return await apiFetchJson(`${COURIER_TRACKING_BASE}/complete/${routeId}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
        });
    } catch (err) {
        errorLogger.error("completeRoute failed", {
            error: err,
            extra: { routeId },
        });
        throw new Error(getErrorDisplayMessage(err) || "Failed to complete route");
    }
}

export async function getTotalDistance(courierId) {
    try {
        return await apiFetchJson(`${COURIER_TRACKING_BASE}/distance/${courierId}`);
    } catch (err) {
        errorLogger.error("getTotalDistance failed", {
            error: err,
            extra: { courierId },
        });
        throw new Error(getErrorDisplayMessage(err) || "Failed to fetch distance");
    }
}

export async function calculateDeliveryFee(distanceKm, areaTier) {
    try {
        return await apiFetchJson(`${COURIER_TRACKING_BASE}/calculate-fee`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ distanceKm, areaTier }),
        }, {
            validate: {
                distanceKm: { required: true, type: "number" },
                areaTier: { required: true, type: ["string", "number"] },
            },
        });
    } catch (err) {
        errorLogger.error("calculateDeliveryFee failed", {
            error: err,
            extra: { distanceKm, areaTier },
        });
        throw new Error(getErrorDisplayMessage(err) || "Failed to calculate fee");
    }
}

export async function getLocationStatus(locationId) {
    try {
        return await apiFetchJson(`${COURIER_TRACKING_BASE}/location/${locationId}/status`);
    } catch (err) {
        errorLogger.error("getLocationStatus failed", {
            error: err,
            extra: { locationId },
        });
        throw new Error(getErrorDisplayMessage(err) || "Failed to fetch location status");
    }
}

export async function getRouteStatus(routeId) {
    try {
        return await apiFetchJson(`${COURIER_TRACKING_BASE}/route/${routeId}/status`);
    } catch (err) {
        errorLogger.error("getRouteStatus failed", {
            error: err,
            extra: { routeId },
        });
        throw new Error(getErrorDisplayMessage(err) || "Failed to fetch route status");
    }
}

export function subscribeToRouteUpdates(routeId, onUpdate, interval = 5000) {
    const intervalId = setInterval(async () => {
        try {
            const data = await getRouteDetails(routeId);
            onUpdate(data);
        } catch (error) {
            errorLogger.warn("Failed to fetch route updates (polling retry pending)", {
                error,
                extra: { routeId, interval },
            });
        }
    }, interval);

    return () => clearInterval(intervalId);
}

export function calculateHaversineDistance(lat1, lon1, lat2, lon2) {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLon / 2) * Math.sin(dLon / 2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;
    
    return Math.round(distance * 100) / 100;
}

export function estimateDeliveryTime(distanceKm) {
    const averageSpeedKmPerMin = 40 / 60;
    const timeMinutes = Math.ceil(distanceKm / averageSpeedKmPerMin);
    const bufferTime = Math.ceil(timeMinutes * 0.15);
    
    return timeMinutes + bufferTime;
}

export function formatDistance(km) {
    if (km < 1) {
        return `${Math.round(km * 1000)}m`;
    }
    return `${km}km`;
}

export function formatDuration(minutes) {
    if (minutes < 60) {
        return `${minutes}min`;
    }
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}min`;
}
