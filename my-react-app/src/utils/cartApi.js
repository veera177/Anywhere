import { apiFetch, apiFetchJson } from '../services/apiClient.js';
import { CART_BASE } from '../services/apiConfig.js';

/**
 * All cart calls go through apiFetch / apiFetchJson which automatically
 * attach the stored JWT in the Authorization header. No hardcoded URLs.
 */

export async function fetchCartCount(userId) {
    if (!userId) return 0;
    try {
        const items = await apiFetchJson(`${CART_BASE}/${userId}`, {}, { retries: 0 });
        return (Array.isArray(items) ? items : []).reduce((sum, item) => sum + (item.quantity || 0), 0);
    } catch {
        return 0;
    }
}

export async function addItemToCart(user, product, serviceType, providerName) {
    const response = await apiFetch(`${CART_BASE}/add`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            userId: user.id,
            serviceType,
            productId: product.id,
            quantity: 1,
            productName: product.name,
            providerName: providerName || product.restaurantName || product.storeName || product.pharmacyName || 'Anywhere',
            price: Number(product.price),
            rating: Number(product.rating || 0),
            imageUrl: product.imageUrl || '',
        }),
    }, { retries: 0 });

    const message = await response.text();
    if (!response.ok && !message.includes('Updated')) {
        throw new Error(message || 'Could not add item to cart.');
    }
    return message;
}
