const API_BASE = "http://localhost:8080/api";

export async function fetchCartCount(userId) {
    if (!userId) return 0;
    try {
        const response = await fetch(`${API_BASE}/cart/${userId}`);
        if (!response.ok) return 0;
        const items = await response.json();
        return (items || []).reduce((sum, item) => sum + item.quantity, 0);
    } catch {
        return 0;
    }
}

export async function addItemToCart(user, product, serviceType, providerName) {
    const response = await fetch(`${API_BASE}/cart/add`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            userId: user.id,
            serviceType,
            productId: product.id,
            quantity: 1,
            productName: product.name,
            providerName: providerName || product.restaurantName || product.storeName || product.pharmacyName || "Anywhere",
            price: Number(product.price),
            rating: Number(product.rating || 0),
            imageUrl: product.imageUrl || "",
        }),
    });

    const message = await response.text();
    if (!response.ok && !message.includes("Updated")) {
        throw new Error(message || "Could not add item to cart.");
    }
    return message;
}
