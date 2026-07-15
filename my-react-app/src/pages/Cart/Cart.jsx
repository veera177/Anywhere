import { useEffect, useState, useCallback, useMemo } from 'react';
import './Cart.css';

const API_BASE = 'http://localhost:8080/api/cart';

/* ── Service label map ── */
const SERVICE_LABELS = {
    FOOD: '🍔 Food Orders',
    GROCERY: '🛒 Grocery Orders',
    MEDICINE: '💊 Medicine Orders'
};

const SERVICE_EMOJI = {
    FOOD: '🍔',
    GROCERY: '🛒',
    MEDICINE: '💊'
};

function Cart({ onBack, onSignInClick, onCheckout }) {

    /* ── State ── */
    const [cartItems, setCartItems] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [actionLoading, setActionLoading] = useState(null); // cartId or serviceType being updated
    const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

    /* ── User ── */
    const user = JSON.parse(localStorage.getItem('user'));

    /* ── Toast Helper ── */
    const showToast = useCallback((message, type = 'success') => {
        setToast({ show: true, message, type });
        setTimeout(() => {
            setToast({ show: false, message: '', type: 'success' });
        }, 2500);
    }, []);

    /* ── Fetch Cart ── */
    const fetchCart = useCallback(async () => {
        if (!user) return;
        setIsLoading(true);
        setError(null);
        try {
            const response = await fetch(`${API_BASE}/${user.id}`);
            if (!response.ok) {
                throw new Error('Failed to load cart');
            }
            const data = await response.json();
            // FILTER OUT COURIER ITEMS
            const filteredData = (data || []).filter(item => item.serviceType !== 'COURIER');
            setCartItems(filteredData);
        } catch (err) {
            console.error(err);
            setError('Could not load your cart. Please check if the server is running.');
        } finally {
            setIsLoading(false);
        }
    }, [user?.id]);

    /* ── Load on Mount ── */
    useEffect(() => {
        fetchCart();
    }, [fetchCart]);

    /* ── Update Quantity ── */
    const updateQuantity = async (cartId, newQuantity) => {
        if (newQuantity < 1) return;
        setActionLoading(cartId);
        try {
            const response = await fetch(`${API_BASE}/update?cartId=${cartId}&quantity=${newQuantity}`, { method: 'PUT' });
            const message = await response.text();
            if (response.ok && message === 'Quantity Updated') {
                setCartItems(prev => prev.map(item => item.cartId === cartId ? { ...item, quantity: newQuantity } : item));
                showToast('Quantity updated', 'success');
            } else {
                showToast('Update failed', 'error');
            }
        } catch (err) {
            console.error(err);
            showToast('Server error', 'error');
        } finally {
            setActionLoading(null);
        }
    };

    /* ── Remove Item ── */
    const removeItem = async (cartId) => {
        setActionLoading(cartId);
        try {
            const response = await fetch(`${API_BASE}/remove/${cartId}`, { method: 'DELETE' });
            const message = await response.text();
            if (response.ok && message === 'Item Removed') {
                setCartItems(prev => prev.filter(item => item.cartId !== cartId));
                showToast('Item removed', 'info');
            } else {
                showToast('Remove failed', 'error');
            }
        } catch (err) {
            console.error(err);
            showToast('Server error', 'error');
        } finally {
            setActionLoading(null);
        }
    };

    /* ── Clear Cart ── */
    const clearCart = async () => {
        if (!user) return;
        setActionLoading('clearing');
        try {
            const response = await fetch(`${API_BASE}/clear/${user.id}`, { method: 'DELETE' });
            const message = await response.text();
            if (response.ok) {
                // If it succeeds, we empty it all (except courier if any, but backend wipes all for user).
                setCartItems([]);
                showToast(message === 'Cart Already Empty' ? 'Cart is already empty' : 'Cart cleared', 'info');
            } else {
                showToast('Clear failed', 'error');
            }
        } catch (err) {
            console.error(err);
            showToast('Server error', 'error');
        } finally {
            setActionLoading(null);
        }
    };

    /* ── Checkout Specific Service ── */
    const handleCheckoutService = (serviceType) => {
        if (onCheckout) {
            const itemsToCheckout = cartItems.filter(item => item.serviceType === serviceType);
            onCheckout(itemsToCheckout);
        } else {
            showToast(`Order Placed for ${serviceType}!`, 'success');
        }
    };

    /* ── Derived Groups ── */
    const groupedItems = useMemo(() => {
        const groups = { FOOD: [], GROCERY: [], MEDICINE: [] };
        cartItems.forEach(item => {
            if (groups[item.serviceType]) {
                groups[item.serviceType].push(item);
            }
        });
        return groups;
    }, [cartItems]);

    const activeServices = Object.keys(groupedItems).filter(key => groupedItems[key].length > 0);
    const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);

    /* ══════════════════════════════
       RENDER
       ══════════════════════════════ */

    return (
        <main className="cart-page">
            {/* ── NAV ── */}
            <nav className="cart-nav">
                <div className="cart-nav-left">
                    <button className="cart-back-btn" onClick={onBack}>← Back</button>
                    <span className="cart-nav-title">Anywhere Cart</span>
                </div>
                <span className="cart-nav-badge">
                    🛒 {totalItems} {totalItems === 1 ? 'Item' : 'Items'}
                </span>
            </nav>

            {/* ── CONTAINER ── */}
            <div className="cart-container">
                {/* Not Signed In */}
                {!user && (
                    <div className="cart-not-signed-in">
                        <span className="cart-not-signed-in-icon">🔒</span>
                        <h2>Sign In Required</h2>
                        <p>Please sign in to view your cart and manage your orders.</p>
                        <button className="cart-signin-btn" onClick={onSignInClick}>Sign In →</button>
                    </div>
                )}

                {/* Loading */}
                {user && isLoading && (
                    <div className="cart-loading">
                        <div className="cart-spinner"></div>
                        <p>Loading your cart...</p>
                    </div>
                )}

                {/* Error */}
                {user && !isLoading && error && (
                    <div className="cart-error">
                        <span className="cart-error-icon">⚠️</span>
                        <h2>Oops!</h2>
                        <p>{error}</p>
                        <button className="cart-retry-btn" onClick={fetchCart}>Retry</button>
                    </div>
                )}

                {/* Empty Cart */}
                {user && !isLoading && !error && cartItems.length === 0 && (
                    <div className="cart-empty">
                        <span className="cart-empty-icon">🛒</span>
                        <h2>Your Cart is Empty</h2>
                        <p>Looks like you haven't added anything yet. Explore our services and add items!</p>
                        <button className="cart-empty-btn" onClick={onBack}>Explore Services →</button>
                    </div>
                )}

                {/* Cart with Items */}
                {user && !isLoading && !error && cartItems.length > 0 && (
                    <>
                        <div className="cart-header">
                            <div className="cart-header-left">
                                <h1>Your Order Summary</h1>
                                <p>Manage your items across different services.</p>
                            </div>
                            <button
                                className="cart-clear-btn"
                                onClick={clearCart}
                                disabled={actionLoading === 'clearing'}
                            >
                                🗑️ {actionLoading === 'clearing' ? 'Clearing...' : 'Clear All Carts'}
                            </button>
                        </div>

                        {/* Render each active service group */}
                        <div className="cart-service-groups">
                            {activeServices.map(serviceType => {
                                const items = groupedItems[serviceType];
                                const groupTotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
                                
                                return (
                                    <section className="cart-service-section" key={serviceType}>
                                        
                                        <div className="cart-service-header">
                                            <h2>{SERVICE_LABELS[serviceType]}</h2>
                                            <span className="cart-service-count">{items.length} items</span>
                                        </div>

                                        <div className="cart-service-layout">
                                            {/* Items List */}
                                            <div className="cart-items-list">
                                                {items.map(item => (
                                                    <article className="cart-card" key={item.cartId}>
                                                        <div className="cart-card-image">
                                                            <img
                                                                src={item.imageUrl}
                                                                alt={item.productName}
                                                                onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=400&q=80'; }}
                                                            />
                                                        </div>

                                                        <div className="cart-card-info">
                                                            <h3>{item.productName}</h3>
                                                            <p className="cart-card-restaurant">
                                                                {SERVICE_EMOJI[item.serviceType] || '📦'} {item.restaurantName}
                                                            </p>
                                                            <span className="cart-card-price">₹{item.price}</span>
                                                            <span className="cart-card-subtotal">Subtotal: ₹{(item.price * item.quantity).toFixed(2)}</span>
                                                        </div>

                                                        <div className="cart-card-actions">
                                                            <div className="cart-qty-control">
                                                                <button
                                                                    className="cart-qty-btn"
                                                                    onClick={() => updateQuantity(item.cartId, item.quantity - 1)}
                                                                    disabled={item.quantity <= 1 || actionLoading === item.cartId}
                                                                >−</button>
                                                                <span className="cart-qty-value">{item.quantity}</span>
                                                                <button
                                                                    className="cart-qty-btn"
                                                                    onClick={() => updateQuantity(item.cartId, item.quantity + 1)}
                                                                    disabled={actionLoading === item.cartId}
                                                                >+</button>
                                                            </div>
                                                            <button
                                                                className="cart-remove-btn"
                                                                onClick={() => removeItem(item.cartId)}
                                                                disabled={actionLoading === item.cartId}
                                                            >🗑️ Remove</button>
                                                        </div>
                                                    </article>
                                                ))}
                                            </div>

                                            {/* Service Summary Sidebar */}
                                            <aside className="cart-summary">
                                                <div className="cart-summary-total">
                                                    <span>{SERVICE_EMOJI[serviceType]} Total</span>
                                                    <span>₹{groupTotal.toFixed(2)}</span>
                                                </div>
                                                <button
                                                    className="cart-checkout-btn"
                                                    onClick={() => handleCheckoutService(serviceType)}
                                                >
                                                    Checkout {serviceType.toLowerCase()} →
                                                </button>
                                            </aside>
                                        </div>
                                    </section>
                                );
                            })}
                        </div>
                    </>
                )}
            </div>

            {/* ── Toast ── */}
            <div className={`cart-toast ${toast.show ? 'show' : ''} ${toast.type}`}>
                {toast.message}
            </div>
        </main>
    );
}

export default Cart;
