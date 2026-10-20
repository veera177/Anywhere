/**
 * API Client Wrapper - Handles JWT token management for all API requests.
 * 
 * Features:
 * - Automatically attaches Authorization: Bearer {token} header to requests
 * - Stores token in localStorage for persistence
 * - Handles 401 Unauthorized responses (expired/invalid token)
 * - Provides convenient methods: get, post, put, delete
 * - Catches and logs errors for debugging
 */

const API_URL = 'http://localhost:8080/api';

/**
 * Get the stored JWT token from localStorage.
 * @returns {string|null} JWT token or null if not present
 */
export function getToken() {
    try {
        return localStorage.getItem('token');
    } catch {
        return null;
    }
}

/**
 * Store JWT token in localStorage.
 * @param {string} token JWT token to store
 */
export function setToken(token) {
    try {
        if (token) {
            localStorage.setItem('token', token);
        } else {
            localStorage.removeItem('token');
        }
    } catch (err) {
        console.error('Failed to store token:', err);
    }
}

/**
 * Clear token from localStorage (logout).
 */
export function clearToken() {
    try {
        localStorage.removeItem('token');
    } catch (err) {
        console.error('Failed to clear token:', err);
    }
}

/**
 * Check if user is authenticated (has valid token).
 * @returns {boolean} true if token exists
 */
export function isAuthenticated() {
    return !!getToken();
}

/**
 * Make an API request with automatic JWT token attachment.
 * Handles 401 responses by logging out user.
 * 
 * @param {string} endpoint API endpoint (e.g., '/orders/user/1')
 * @param {object} options Fetch options (method, body, etc.)
 * @returns {Promise<object>} Parsed response JSON
 */
async function apiRequest(endpoint, options = {}) {
    try {
        const token = getToken();
        
        // Build headers
        const headers = {
            'Content-Type': 'application/json',
            ...options.headers,
        };

        // Attach token if available
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        // Make request
        const response = await fetch(`${API_URL}${endpoint}`, {
            ...options,
            headers,
        });

        // Handle 401 - token expired/invalid
        if (response.status === 401) {
            console.warn('Authentication failed (401) - clearing token and redirecting to login');
            clearToken();
            localStorage.removeItem('user'); // Also clear cached user
            
            // Redirect to login
            if (typeof window !== 'undefined') {
                window.location.href = '/'; // Redirect to home/login
            }
            
            throw new Error('Authentication failed - please login again');
        }

        // Handle other errors
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ error: response.statusText }));
            throw new Error(errorData.error || `API error: ${response.status}`);
        }

        // Parse and return response
        return await response.json();
    } catch (error) {
        console.error('API request failed:', error);
        throw error;
    }
}

/**
 * GET request
 * @param {string} endpoint API endpoint
 * @param {object} options Additional fetch options
 * @returns {Promise<object>} Response data
 */
export async function apiGet(endpoint, options = {}) {
    return apiRequest(endpoint, {
        method: 'GET',
        ...options,
    });
}

/**
 * POST request
 * @param {string} endpoint API endpoint
 * @param {object} body Request body (will be JSON stringified)
 * @param {object} options Additional fetch options
 * @returns {Promise<object>} Response data
 */
export async function apiPost(endpoint, body = {}, options = {}) {
    return apiRequest(endpoint, {
        method: 'POST',
        body: JSON.stringify(body),
        ...options,
    });
}

/**
 * PUT request
 * @param {string} endpoint API endpoint
 * @param {object} body Request body (will be JSON stringified)
 * @param {object} options Additional fetch options
 * @returns {Promise<object>} Response data
 */
export async function apiPut(endpoint, body = {}, options = {}) {
    return apiRequest(endpoint, {
        method: 'PUT',
        body: JSON.stringify(body),
        ...options,
    });
}

/**
 * DELETE request
 * @param {string} endpoint API endpoint
 * @param {object} options Additional fetch options
 * @returns {Promise<object>} Response data
 */
export async function apiDelete(endpoint, options = {}) {
    return apiRequest(endpoint, {
        method: 'DELETE',
        ...options,
    });
}

/**
 * PATCH request
 * @param {string} endpoint API endpoint
 * @param {object} body Request body (will be JSON stringified)
 * @param {object} options Additional fetch options
 * @returns {Promise<object>} Response data
 */
export async function apiPatch(endpoint, body = {}, options = {}) {
    return apiRequest(endpoint, {
        method: 'PATCH',
        body: JSON.stringify(body),
        ...options,
    });
}

// Export default object for convenience
export default {
    getToken,
    setToken,
    clearToken,
    isAuthenticated,
    get: apiGet,
    post: apiPost,
    put: apiPut,
    delete: apiDelete,
    patch: apiPatch,
};
