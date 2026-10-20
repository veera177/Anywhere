import { RETRY_CONFIG, REQUEST_TIMEOUT_MS } from "./apiConfig";
import { clearSession } from "../auth/session.js";

// Re-export so existing callers (Cart.jsx etc.) keep working without changing their imports
export { getSignedInUser } from "../auth/session.js";

const LOG_LEVELS = {
  ERROR: "ERROR",
  WARN: "WARN",
  INFO: "INFO",
  DEBUG: "DEBUG",
};

function getTimestamp() {
  return new Date().toISOString();
}

function getRequestId() {
  return `req_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
}

function formatLogEntry(level, message, context = {}) {
  return {
    timestamp: getTimestamp(),
    level,
    message,
    context: {
      url: context.url,
      method: context.method,
      status: context.status,
      attempt: context.attempt,
      userId: localStorage.getItem("user")
        ? JSON.parse(localStorage.getItem("user"))?.id
        : null,
      ...context.extra,
    },
    stack: context.error?.stack || null,
  };
}

export const errorLogger = {
  error(message, context = {}) {
    const entry = formatLogEntry(LOG_LEVELS.ERROR, message, context);
    console.error("[Network Error]", entry);
    try {
      const existing = JSON.parse(sessionStorage.getItem("anywhere.errorLog") || "[]");
      existing.push(entry);
      sessionStorage.setItem(
        "anywhere.errorLog",
        JSON.stringify(existing.slice(-50))
      );
    } catch {}
  },
  warn(message, context = {}) {
    console.warn("[Network Warn]", formatLogEntry(LOG_LEVELS.WARN, message, context));
  },
  info(message, context = {}) {
    console.info("[Network Info]", formatLogEntry(LOG_LEVELS.INFO, message, context));
  },
  debug(message, context = {}) {
    console.debug("[Network Debug]", formatLogEntry(LOG_LEVELS.DEBUG, message, context));
  },
};

/* ------------------------------------------------------------------ *
 * Session expiry handling
 * When any API call returns 401 (expired/invalid JWT) we centralise the
 * logout: clear the stored token + user, leave a one-time message for the
 * login screen, and notify the app shell so it can route back to Sign In.
 * ------------------------------------------------------------------ */
export const SESSION_EXPIRED_MESSAGE = "Session expired, please log in again.";
export const UNAUTHORIZED_EVENT = "anywhere:unauthorized";
const SESSION_MESSAGE_KEY = "anywhere.sessionMessage";

let isHandlingUnauthorized = false;

export function clearStoredSession() {
  clearSession();
}

/** Read (and clear) the pending "session expired" notice for the login screen. */
export function consumeSessionMessage() {
  try {
    const message = sessionStorage.getItem(SESSION_MESSAGE_KEY);
    if (message) sessionStorage.removeItem(SESSION_MESSAGE_KEY);
    return message;
  } catch (_) {
    return null;
  }
}

/**
 * Log the user out after a 401 and notify the app shell to show Sign In.
 * Safe to call multiple times — repeated calls within the cooldown are ignored.
 */
export function handleUnauthorized() {
  if (isHandlingUnauthorized) return;
  isHandlingUnauthorized = true;

  clearSession(); // delegates to auth/session.js
  try {
    sessionStorage.setItem(SESSION_MESSAGE_KEY, SESSION_EXPIRED_MESSAGE);
  } catch (_) {}

  errorLogger.warn("Session expired (401) — logging out", { status: 401 });

  let handledByApp = false;
  try {
    if (typeof window !== "undefined") {
      // A listener signalling event.preventDefault() tells us the app handled it.
      handledByApp =
        window.dispatchEvent(
          new CustomEvent(UNAUTHORIZED_EVENT, {
            cancelable: true,
            detail: { message: SESSION_EXPIRED_MESSAGE },
          })
        ) === false;
    }
  } catch (_) {}

  if (!handledByApp && typeof window !== "undefined") {
    // No app listener mounted yet — fall back to a hard redirect to the login root.
    window.location.href = "/";
  }

  // Allow a future expiry to be handled once the cooldown passes.
  setTimeout(() => {
    isHandlingUnauthorized = false;
  }, 1500);
}

export function isRetryableError(error, statusCode) {
  if (statusCode && RETRY_CONFIG.retryableStatuses.includes(statusCode)) {
    return true;
  }
  const msg = (error?.message || "").toLowerCase();
  return (
    msg.includes("failed to fetch") ||
    msg.includes("networkerror") ||
    msg.includes("timeout") ||
    msg.includes("aborted") ||
    msg.includes("load failed") ||
    msg.includes("net::") ||
    error?.name === "AbortError" ||
    error?.name === "NetworkError" ||
    error?.name === "TimeoutError"
  );
}

export function calculateBackoffDelay(attempt) {
  const delay =
    RETRY_CONFIG.initialDelayMs *
    Math.pow(RETRY_CONFIG.backoffFactor, Math.max(0, attempt - 1));
  return Math.min(delay, RETRY_CONFIG.maxDelayMs);
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function validatePayload(payload, schema) {
  if (!schema || typeof schema !== "object") return true;
  const errors = [];
  for (const [key, rules] of Object.entries(schema)) {
    const value = payload?.[key];
    if (rules.required && (value === undefined || value === null || value === "")) {
      errors.push(`Missing required field: ${key}`);
      continue;
    }
    if (value !== undefined && value !== null && rules.type) {
      const types = Array.isArray(rules.type) ? rules.type : [rules.type];
      const actualType = Array.isArray(value) ? "array" : typeof value;
      if (!types.includes(actualType)) {
        errors.push(
          `Invalid type for ${key}: expected ${types.join("/")}, got ${actualType}`
        );
      }
    }
  }
  if (errors.length) {
    const err = new Error(`Payload validation failed: ${errors.join("; ")}`);
    err.validationErrors = errors;
    throw err;
  }
  return true;
}

export function validateUrl(url) {
  if (!url || typeof url !== "string") {
    throw new Error("URL must be a non-empty string");
  }
  // Block requests that would send "undefined" or "null" as a path segment —
  // these always cause 400/500 on the backend and mean the caller has no user id.
  if (/\/(undefined|null)(\/|$|\?)/.test(url)) {
    const err = new Error(
      `Blocked request: URL contains invalid segment "${url}". Please sign in.`
    );
    err.statusCode = 401;
    throw err;
  }
  if (url.startsWith("/")) return true;
  try {
    new URL(url);
    return true;
  } catch {
    throw new Error(`Invalid URL: ${url}`);
  }
}

async function requestWithTimeout(url, options, timeoutMs) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const signal = options?.signal
      ? (() => {
          const combined = new AbortController();
          options.signal.addEventListener("abort", () => combined.abort());
          controller.signal.addEventListener("abort", () => combined.abort());
          return combined.signal;
        })()
      : controller.signal;
    return await fetch(url, { ...options, signal });
  } finally {
    clearTimeout(timeoutId);
  }
}

export async function apiFetch(url, options = {}, config = {}) {
  const {
    retries = RETRY_CONFIG.maxRetries,
    timeoutMs = REQUEST_TIMEOUT_MS,
    validate: schema = null,
    requestId = getRequestId(),
  } = config;

  validateUrl(url);

  // Automatically attach JWT token for authenticated API requests
  try {
    const token = localStorage.getItem('token');
    if (token) {
      options = {
        ...options,
        headers: {
          ...(options?.headers || {}),
          Authorization: `Bearer ${token}`,
        },
      };
    }
  } catch (_) {}

  if (schema && options?.body && typeof options.body === "string") {
    try {
      const parsed = JSON.parse(options.body);
      validatePayload(parsed, schema);
    } catch (e) {
      if (e.name !== "SyntaxError") throw e;
    }
  } else if (schema && options?.body && typeof options.body === "object") {
    validatePayload(options.body, schema);
  }

  let lastError = null;
  let lastStatus = null;

  for (let attempt = 1; attempt <= retries + 1; attempt++) {
    try {
      errorLogger.debug(`Request attempt ${attempt}/${retries + 1}`, {
        url,
        method: options?.method || "GET",
        attempt,
        extra: { requestId },
      });

      const response = await requestWithTimeout(url, options, timeoutMs);
      lastStatus = response.status;

      if (!response.ok) {
        const contentType = response.headers.get("content-type") || "";
        let errorBody = null;
        try {
          errorBody = contentType.includes("application/json")
            ? await response.json()
            : await response.text();
        } catch {}

        const err = new Error(
          (typeof errorBody === "string" && errorBody) ||
            errorBody?.message ||
            `HTTP ${response.status}: ${response.statusText}`
        );
        err.statusCode = response.status;

        // Centralised session-expiry handling: 401 means the JWT is missing/expired
        if (response.status === 401) {
          handleUnauthorized();
        }
        err.responseBody = errorBody;
        lastError = err;

        if (!isRetryableError(err, response.status) || attempt > retries) {
          errorLogger.error(err.message, {
            url,
            method: options?.method || "GET",
            status: response.status,
            attempt,
            error: err,
            extra: { requestId, responseBody: errorBody },
          });
          throw err;
        }
      } else {
        if (attempt > 1) {
          errorLogger.info(`Request succeeded on attempt ${attempt}`, {
            url,
            method: options?.method || "GET",
            status: response.status,
            attempt,
            extra: { requestId },
          });
        }
        return response;
      }
    } catch (err) {
      lastError = err;
      if (err.name === "AbortError" && !options?.signal) {
        err.message = `Request timed out after ${timeoutMs}ms`;
        errorLogger.error(`Request timeout`, {
          url,
          method: options?.method || "GET",
          attempt,
          error: err,
          extra: { requestId, timeoutMs },
        });
      }

      if (!isRetryableError(err, lastStatus) || attempt > retries) {
        errorLogger.error(`Request failed after ${attempt} attempt(s)`, {
          url,
          method: options?.method || "GET",
          status: lastStatus,
          attempt,
          error: err,
          extra: { requestId },
        });
        throw err;
      }
    }

    const delay = calculateBackoffDelay(attempt);
    errorLogger.warn(`Retrying request in ${delay}ms (attempt ${attempt}/${retries})`, {
      url,
      method: options?.method || "GET",
      attempt,
      extra: { requestId, delayMs: delay },
    });
    await sleep(delay);
  }

  throw lastError || new Error("Request failed");
}

export async function apiFetchJson(url, options = {}, config = {}) {
  const response = await apiFetch(url, options, config);
  const contentType = response.headers.get("content-type") || "";
  if (contentType.includes("application/json")) {
    return await response.json();
  }
  return await response.text();
}

export async function apiFetchText(url, options = {}, config = {}) {
  const response = await apiFetch(url, options, config);
  return await response.text();
}

export function getErrorDisplayMessage(error) {
  if (!error) return "An unexpected error occurred.";

  const msg = (error.message || "").toLowerCase();

  if (msg.includes("timed out") || msg.includes("timeout")) {
    return "Request timed out. Please check your internet connection and try again.";
  }
  if (isRetryableError(error, error.statusCode) && msg.includes("failed to fetch")) {
    return "Unable to reach the server. Please check your connection and try again.";
  }
  if (error.statusCode === 401 || error.statusCode === 403) {
    return "Session expired or unauthorized. Please sign in again.";
  }
  if (error.statusCode === 404) {
    return "The requested resource was not found.";
  }
  if (error.statusCode === 422 || error.statusCode === 400) {
    return error.message || "Invalid request. Please check your inputs.";
  }
  if (error.statusCode && error.statusCode >= 500) {
    return "Server is temporarily unavailable. Please try again in a few moments.";
  }
  if (error.validationErrors?.length) {
    return error.validationErrors.join(". ");
  }
  return error.message || "Something went wrong. Please try again.";
}

export function getRecentErrors(limit = 10) {
  try {
    const logs = JSON.parse(sessionStorage.getItem("anywhere.errorLog") || "[]");
    return logs.slice(-limit).reverse();
  } catch {
    return [];
  }
}

export function clearErrorLog() {
  sessionStorage.removeItem("anywhere.errorLog");
}
