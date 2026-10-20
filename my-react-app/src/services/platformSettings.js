import { PLATFORM_SETTINGS_URL } from "./apiConfig";
import { apiFetchJson, errorLogger } from "./apiClient";

let settingsCache = null;

export async function getPlatformSettings() {
    if (settingsCache) return settingsCache;

    try {
        const rows = await apiFetchJson(PLATFORM_SETTINGS_URL, {}, { retries: 1 });
        settingsCache = rows.reduce((map, row) => {
            map[row.settingKey] = row.settingValue;
            return map;
        }, {});
        return settingsCache;
    } catch (err) {
        errorLogger.warn("getPlatformSettings failed - using empty cache", { error: err });
        settingsCache = {};
        return settingsCache;
    }
}

export function readSetting(settings, key) {
    const value = settings?.[key];
    return value === undefined || value === null || value === "" ? null : value;
}

export function serviceRadiusLabel(settings, serviceType) {
    const key = `${serviceType}_radius_km`;
    const value = readSetting(settings, key);
    return value ? `${value} km` : "Configured delivery radius";
}

export function invalidateSettingsCache() {
    settingsCache = null;
}
