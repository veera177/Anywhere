import { API_BASE } from "./apiConfig";

/**
 * Single auth-aware transport for the Anywhere backend.
 *
 * The whole app talks to protected REST endpoints (/cart, /orders, /payment,
 * /users/{id}/profile, /ai, courier tracking…). Several modules were calling the
 * raw `fetch()` without the JWT, so the backend correctly answered 401/403 and
 * the UI surfaced it as a failure ("Internal Server Error" style) — profile
 * district could never be saved, cart/checkout/payment could not complete.
 *
 * Rather than duplicate header logic in every page, we patch `window.fetch`
 * once, for the backend origin only:
 *   - requests to the Anywhere API automatically get `Authorization: Bearer <jwt>`
 *   - third-party requests (Nominatim/Photon/ipapi, images, tiles) are untouched
 *     so we never trigger a CORS preflight failure on them
 *
 * `authFetch` is exported too, so new code can be explicit instead of relying on
 * the patch.
 */

let installed = false;

function apiOrigin() {
    try {
        return new URL(API_BASE, window.location.origin).origin;
    } catch {
        return "";
    }
}

function shouldAttach(url) {
    if (!url || typeof url !== "string") return false;
    // Relative API calls (e.g. "/api/cart/1") go through the Vite proxy to the backend.
    if (url.startsWith("/api/") || url.startsWith("api/")) return true;

    try {
        const parsed = new URL(url, window.location.origin);
        // Only our own API surface — never tiles, geocoders, images or ipapi.
        if (!parsed.pathname.startsWith("/api/")) return false;

        const host = parsed.hostname;
        const isLoopback = host === "localhost" || host === "127.0.0.1" || host === "::1";
        const origin = apiOrigin();
        return isLoopback || parsed.origin === window.location.origin || (origin && parsed.origin === origin);
    } catch {
        return false;
    }
}

function withAuthHeader(options = {}) {
    let token = null;
    try {
        token = localStorage.getItem("token");
    } catch {
        token = null;
    }
    if (!token) return options;

    const headers = options.headers;
    // Respect a caller-supplied token/header object; otherwise copy and add.
    if (headers instanceof Headers) {
        if (headers.has("Authorization")) return options;
        const next = new Headers(headers);
        next.set("Authorization", `Bearer ${token}`);
        return { ...options, headers: next };
    }

    const plain = headers && typeof headers === "object" ? headers : {};
    if (plain.Authorization || plain.authorization) return options;

    return {
        ...options,
        headers: { ...plain, Authorization: `Bearer ${token}` },
    };
}

/** Explicit variant for code that prefers not to rely on the global patch. */
export async function authFetch(url, options = {}) {
    if (!shouldAttach(String(url))) return fetch(url, options);
    return fetch(url, withAuthHeader(options));
}

/** Install the origin-scoped interceptor exactly once. */
export function installAuthFetch() {
    if (installed || typeof window === "undefined" || typeof window.fetch !== "function") {
        return;
    }
    installed = true;

    const nativeFetch = window.fetch.bind(window);
    window.fetch = (input, init = {}) => {
        try {
            const url = typeof input === "string" ? input : input?.url;
            if (shouldAttach(url)) {
                return nativeFetch(input, withAuthHeader(init || {}));
            }
        } catch {
            // Never let the interceptor break a request.
        }
        return nativeFetch(input, init);
    };
}
