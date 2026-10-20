const ENV = import.meta.env.MODE || "development";

const API_BASE_URLS = {
  development: "/api",
  staging: import.meta.env.VITE_API_STAGING_URL || "https://staging-api.anywhere.example.com/api",
  production: import.meta.env.VITE_API_PROD_URL || "https://api.anywhere.example.com/api",
};

export const API_BASE = API_BASE_URLS[ENV] || API_BASE_URLS.development;

export const COURIER_TRACKING_BASE = `${API_BASE}/courier/tracking`;
export const CART_BASE = `${API_BASE}/cart`;
export const USERS_BASE = `${API_BASE}/users`;
export const PAYMENT_BASE = `${API_BASE}/payment`;
export const ORDERS_BASE = `${API_BASE}/orders`;
export const COUPONS_BASE = `${API_BASE}/coupons`;
export const PRESCRIPTIONS_BASE = `${API_BASE}/prescriptions`;
export const AI_BASE = `${API_BASE}/ai`;
export const PLATFORM_SETTINGS_URL = `${API_BASE}/platform-settings`;
export const DISTANCE_URL = `${API_BASE}/distance`;
export const DELIVERY_FEE_PREVIEW_URL = `${API_BASE}/delivery-fee/preview`;
export const AREAS_SUGGESTIONS_URL = `${API_BASE}/areas/suggestions`;
export const RESTAURANTS_BASE = `${API_BASE}/restaurants`;
export const GROCERY_STORES_BASE = `${API_BASE}/grocery-stores`;
export const PHARMACIES_BASE = `${API_BASE}/pharmacies`;
export const MEDICINES_BASE = `${API_BASE}/medicines`;
export const GROCERY_PRODUCTS_BASE = `${API_BASE}/grocery-products`;
export const FOOD_PRODUCTS_BASE = `${API_BASE}/food-products`;
export const MEDICINE_PRODUCTS_BASE = `${API_BASE}/medicine-products`;
export const AUTH_BASE = `${API_BASE}/auth`;

export const EXTERNAL_URLS = {
  NOMINATIM: "https://nominatim.openstreetmap.org/search",
  OSRM: "https://router.project-osrm.org/route/v1/driving",
  PHOTON: "https://photon.komoot.io/api",
  IPAPI: "https://ipapi.co/json/",
};

export const RETRY_CONFIG = {
  maxRetries: 3,
  initialDelayMs: 500,
  maxDelayMs: 5000,
  backoffFactor: 2,
  retryableStatuses: [408, 429, 500, 502, 503, 504],
};

export const REQUEST_TIMEOUT_MS = 15000;
