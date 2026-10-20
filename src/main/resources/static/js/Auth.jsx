// Shared client-side guard. Server authorization remains authoritative.
window.authApi = {
    token: () => localStorage.getItem('token'),
    user: () => { try { return JSON.parse(localStorage.getItem('user') || 'null'); } catch { return null; } },
    clear: () => { localStorage.removeItem('token'); localStorage.removeItem('user'); },
    isSignedIn: () => {
        const token = localStorage.getItem('token');
        if (!token) return false;
        try {
            const encodedPayload = token.split('.')[1];
            if (!encodedPayload) throw new Error('Malformed JWT');
            const base64 = encodedPayload.replace(/-/g, '+').replace(/_/g, '/');
            const paddedBase64 = base64 + '='.repeat((4 - base64.length % 4) % 4);
            const payload = JSON.parse(atob(paddedBase64));
            if (!payload.exp || payload.exp * 1000 <= Date.now()) {
                window.authApi.clear();
                return false;
            }
            return true;
        } catch (_) {
            window.authApi.clear();
            return false;
        }
    },
    userId: () => {
        if (!window.authApi.isSignedIn()) return null;
        const id = Number(window.authApi.user()?.id);
        if (Number.isInteger(id) && id > 0) return id;
        // A profile without the identity returned by login is not a usable session.
        window.authApi.clear();
        return null;
    },
    // Compatibility alias while every caller moves to the single named helper.
    isAuthenticated: () => window.authApi.isSignedIn(),
    fetch: async (url, options = {}) => {
        const headers = { ...(options.headers || {}) };
        const token = window.authApi.isSignedIn() ? localStorage.getItem('token') : null;
        if (token) headers.Authorization = `Bearer ${token}`;
        const response = await fetch(url, { ...options, headers });
        if (response.status === 401) {
            window.authApi.clear();
            window.dispatchEvent(new CustomEvent('anywhere:session-expired'));
        }
        return response;
    }
};
