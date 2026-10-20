/**
 * auth/session.js  —  ONE source of truth for sign-in state.
 *
 * Every component that needs to know "who is signed in?" imports from here.
 * Nothing reads localStorage directly for auth any more.
 *
 * Guarantees:
 *  - getSignedInUser() returns a user with a verified numeric id, or null.
 *  - isSignedIn() is a safe boolean wrapper.
 *  - signOut() clears all session keys.
 *  - The token is validated (not expired) before any user object is returned.
 */

const USER_KEY  = "user";
const TOKEN_KEY = "token";

/**
 * Parse and validate the JWT exp claim without any library dependency.
 * Returns true when the token exists and has not expired.
 */
function isTokenValid(token) {
  if (!token || typeof token !== "string") return false;
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return false;
    const payload = JSON.parse(
      atob(parts[1].replace(/-/g, "+").replace(/_/g, "/") +
        "=".repeat((4 - (parts[1].length % 4)) % 4))
    );
    // exp is seconds since epoch
    return typeof payload.exp === "number" && payload.exp * 1000 > Date.now();
  } catch {
    return false;
  }
}

/**
 * Returns the signed-in user object, or null.
 *
 * A non-null return guarantees:
 *  - localStorage has both "token" and "user"
 *  - the token is present and not expired
 *  - user.id is a positive integer (never "undefined" or 0)
 *
 * If anything is wrong the stale keys are cleared so the next call is clean.
 */
export function getSignedInUser() {
  try {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!isTokenValid(token)) {
      // Token missing or expired — clean up so pages don't show stale data
      clearSession();
      return null;
    }

    const raw = localStorage.getItem(USER_KEY);
    if (!raw) { clearSession(); return null; }

    const user = JSON.parse(raw);
    const id   = Number(user?.id);

    if (!Number.isInteger(id) || id <= 0) {
      clearSession();
      return null;
    }

    return { ...user, id }; // id is always a number
  } catch {
    clearSession();
    return null;
  }
}

/** Quick boolean: is there a valid, non-expired session? */
export function isSignedIn() {
  return getSignedInUser() !== null;
}

/**
 * Save a successful login response.
 * Rejects if id is missing/non-numeric or token is absent.
 * Returns { ok: true } or { ok: false, error: string }.
 */
export function saveSession(loginResponse) {
  try {
    const id    = Number(loginResponse?.id);
    const token = loginResponse?.token;

    if (!token) {
      return { ok: false, error: "Sign-in incomplete: no token returned. Please try again." };
    }
    if (!Number.isInteger(id) || id <= 0) {
      return { ok: false, error: "Sign-in incomplete: user identity missing. Please try again." };
    }

    const user = { ...loginResponse, id }; // normalise id to Number
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify(user));
    return { ok: true, user };
  } catch {
    return { ok: false, error: "Sign-in failed: could not save session." };
  }
}

/**
 * Clear all session data from localStorage.
 * Call this on logout or on 401.
 */
export function clearSession() {
  try {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  } catch {
    // ignore — storage may be unavailable
  }
}

/** Alias kept for backward-compat with apiClient.js callers */
export const signOut = clearSession;
