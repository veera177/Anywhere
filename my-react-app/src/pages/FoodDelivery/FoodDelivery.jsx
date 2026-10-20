import { useEffect, useMemo, useState } from 'react';
import './FoodDelivery.css';
import { addItemToCart, fetchCartCount } from '../../utils/cartApi';
import DeliveryMap from '../../components/DeliveryMap';
import { getDistricts, getServiceRadiusKm, resolvePreferredDistrictId } from '../../services/districts';
import { SkeletonGrid, SkeletonStatus } from '../../components/Skeleton';
import { FOOD_PRODUCTS_BASE, RESTAURANTS_BASE } from '../../services/apiConfig';
import { apiFetchJson } from '../../services/apiClient';
import { getSignedInUser } from '../../auth/session.js';

const API_URL = FOOD_PRODUCTS_BASE;
const RESTAURANT_API = RESTAURANTS_BASE;

/* Districts are loaded from the database via /api/districts (see services/districts.js).
   No district names, hubs, landmarks or coordinates are hardcoded. */

function FoodDelivery({ onBack, onGoToCart }) {

    const [products, setProducts] =
        useState([]);

    const [restaurants, setRestaurants] =
        useState([]);

    const [selectedRestaurant, setSelectedRestaurant] =
        useState(null);

    const [selectedCategory, setSelectedCategory] =
        useState('All');

    const [selectedDistrictId, setSelectedDistrictId] =
        useState('');

    /* Districts + coverage radius come from the database/platform settings */
    const [districts, setDistricts] = useState([]);
    const [radiusKm, setRadiusKm] = useState(null);

    useEffect(() => {
        let cancelled = false;
        getDistricts().then((list) => {
            if (cancelled) return;
            const availableDistricts = list.filter((district) => Number(district.partnerCounts?.food || 0) > 0);
            setDistricts(availableDistricts);
            // Profile district is the user's active service area.
            setSelectedDistrictId((current) =>
                current && availableDistricts.some((d) => d.id === current)
                    ? current
                    : resolvePreferredDistrictId(availableDistricts, '')
            );
        });
        getServiceRadiusKm('food').then((km) => {
            if (!cancelled) setRadiusKm(km);
        });
        return () => { cancelled = true; };
    }, []);

    const [searchTerm, setSearchTerm] =
        useState('');

    const [cartCount, setCartCount] = useState(0);
    const [cart, setCart] = useState([]);
    const [toast, setToast] = useState('');

    useEffect(() => {
        const user = getSignedInUser();
        if (!user?.id) return;
        fetchCartCount(user.id).then(setCartCount);
    }, []);

    const showToast = (message) => {
        setToast(message);
        setTimeout(() => setToast(''), 2200);
    };

    const [isFromServer, setIsFromServer] =
        useState(false);

    const [isLoadingProducts, setIsLoadingProducts] =
        useState(false);

    const [productMessage, setProductMessage] =
        useState('Select a restaurant to view its dishes.');

    /* ── Fetch Restaurants on District Change ── */
    useEffect(() => {
        const loadRestaurants = async () => {
            setIsLoadingProducts(true);
            try {
                const data = await apiFetchJson(
                    `${RESTAURANT_API}?district=${selectedDistrictId}`
                );
                setRestaurants(data || []);
                setIsFromServer(true);
            } catch (error) {
                console.log(error);
                setRestaurants([]);
                setIsFromServer(false);
            } finally {
                setIsLoadingProducts(false);
            }
        };

        loadRestaurants();
        setSelectedRestaurant(null); // Clear selected restaurant
        setProducts([]); // Clear dishes
        setSelectedCategory('All');
        setSearchTerm('');
    }, [selectedDistrictId]);

    /* ── Fetch Products on Restaurant Change ── */
    useEffect(() => {
        if (!selectedRestaurant) {
            setProducts([]);
            return;
        }

        const loadProducts = async () => {
            setIsLoadingProducts(true);
            try {
                const data = await apiFetchJson(
                    `${API_URL}?restaurantId=${selectedRestaurant.id}`
                );
                if (Array.isArray(data) && data.length > 0) {
                    setProducts(data);
                    setIsFromServer(true);
                    setProductMessage(`Showing ${data.length} dishes from ${selectedRestaurant.name}`);
                } else {
                    setProducts([]);
                    setIsFromServer(true);
                    setProductMessage('No dishes found for this restaurant.');
                }
            } catch (error) {
                console.log(error);
                setProducts([]);
                setIsFromServer(false);
                setProductMessage('Unable to load dishes from the server.');
            } finally {
                setIsLoadingProducts(false);
            }
        };

        loadProducts();
    }, [selectedRestaurant, selectedDistrictId]);

    /* ── Filter Restaurants by Search Term ── */
    const filteredRestaurants = useMemo(() => {
        const query = searchTerm.trim().toLowerCase();
        return restaurants.filter((restaurant) => {
            const name = restaurant.name ? restaurant.name.toLowerCase() : '';
            const location = restaurant.location ? restaurant.location.toLowerCase() : '';
            return name.includes(query) || location.includes(query);
        });
    }, [restaurants, searchTerm]);

    /* ── Categories ── */
    const categories = useMemo(() => {

        const districtProducts = products.filter(
            product => product.district === selectedDistrictId
        );

        return [
            'All',
            ...new Set(
                districtProducts
                    .map(product => product.category)
                    .filter(Boolean)
            )
        ];

    }, [products, selectedDistrictId]);

    /* ── Filter Products ── */
    const filteredProducts = useMemo(() => {

        const query =
            searchTerm.trim().toLowerCase();

        return products.filter((product) => {

            const matchesDistrict =
                product.district === selectedDistrictId;

            const matchesCategory =
                selectedCategory === 'All' ||
                product.category === selectedCategory;

            const matchesSearch =
                product.name.toLowerCase().includes(query) ||
                product.description.toLowerCase().includes(query);

            const matchesRestaurant =
                !selectedRestaurant ||
                product.restaurantName === selectedRestaurant.name;

            return (
                matchesDistrict &&
                matchesCategory &&
                matchesSearch &&
                matchesRestaurant
            );
        });

    }, [
        products,
        selectedCategory,
        searchTerm,
        selectedDistrictId,
        selectedRestaurant
    ]);

    /* ── Selected district (from database) ── */
    const selectedDistrict =
        districts.find(d => d.id === selectedDistrictId) || null;

    const districtName = selectedDistrict?.name || '…';

    const addToCart = async (product) => {
        if (product.stock === 0) return;

        const user = getSignedInUser();
        if (!user) {
            alert('Please sign in to add items to your cart.');
            return;
        }

        try {
            await addItemToCart(user, product, 'FOOD', product.restaurantName || selectedRestaurant?.name);
            setCartCount((count) => count + 1);
            showToast(`${product.name} added to cart`);
        } catch (error) {
            alert(error.message);
            return;
        }

        setProducts((currentProducts) =>
            currentProducts.map((item) =>
                item.id === product.id ? { ...item, stock: item.stock - 1 } : item
            )
        );

        setCart((currentCart) => {
            const existingItem = currentCart.find((item) => item.id === product.id);
            if (existingItem) {
                return currentCart.map((item) =>
                    item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
                );
            }
            return [...currentCart, { ...product, quantity: 1 }];
        });
    };

    const cartTotal = cart.reduce(
        (total, item) =>
            total + item.price * item.quantity,
        0
    );

    const cartCountDisplay = Math.max(cartCount, cart.reduce((total, item) => total + item.quantity, 0));

    return (
        <main className="food-page">

            {/* NAVBAR */}
            <nav className="food-nav">

                <button
                    className="food-back-btn"
                    onClick={onBack}
                >
                    ← Back
                </button>

                <div>

                    <span className="food-brand">
                        Anywhere
                    </span>

                    <span className="food-location">
                        {districtName} food delivery
                    </span>

                </div>

                <button type="button" className="food-cart-pill" onClick={onGoToCart}>
                    🛒 Cart <strong>{cartCountDisplay}</strong>
                </button>

            </nav>

            {/* HERO */}
            <section className="food-hero">

                <div className="food-hero-copy">

                    <span className="food-kicker">

                        {
                            isFromServer
                                ? '🟢 Live menu from database'
                                : '🟡 Menu unavailable offline'
                        }

                    </span>

                    <h1>
                        Food delivered fast from nearby {districtName} kitchens.
                    </h1>

                    <p>
                        Browse local restaurants and real-time food availability.
                    </p>

                    <div className="food-search-panel">

                        <select
                            value={selectedDistrictId}
                            onChange={(event) => {

                                setSelectedDistrictId(
                                    event.target.value
                                );

                                setSelectedCategory('All');

                                setSearchTerm('');

                                setSelectedRestaurant(null);
                            }}
                        >

                            {
                                districts.map((location) => (

                                    <option
                                        key={location.id}
                                        value={location.id}
                                    >
                                        {location.name}
                                    </option>

                                ))
                            }

                        </select>

                        <input
                            type="search"
                            placeholder="Search biryani, meals, cafe..."
                            value={searchTerm}
                            onChange={(event) =>
                                setSearchTerm(
                                    event.target.value
                                )
                            }
                        />

                    </div>

                </div>

                <aside className="food-hero-card">

                    <span>Selected district</span>

                    <strong>
                        {districtName}
                    </strong>

                    <p>
                        {radiusKm
                            ? `Delivery from each contracted restaurant within ${radiusKm} km of its own location.`
                            : 'Delivery coverage per restaurant, from platform settings.'}
                    </p>

                </aside>

            </section>

            {/* API STATUS */}
            <div
                className={`food-api-status ${
                    isFromServer ? 'live' : 'demo'
                }`}
            >

                <span>

                    {isLoadingProducts ? (
                        <SkeletonStatus>Loading menus…</SkeletonStatus>
                    ) : isFromServer ? (
                        'Database connected'
                    ) : (
                        'Server offline'
                    )}

                </span>

                <p>{productMessage}</p>

            </div>

            {/* COVERAGE MAP — real partner locations from the database */}
            <section className="food-map-section">

                <div className="food-map-copy">

                    <span>Live coverage</span>

                    <h2>
                        Restaurants in {districtName}
                    </h2>

                    <p>
                        Each contracted restaurant is shown at its actual location with its own {radiusKm ?? '…'} km delivery radius, centred on that restaurant.
                    </p>

                </div>

                <div className="food-map-frame">

                    <DeliveryMap
                        lat={selectedDistrict?.lat}
                        lon={selectedDistrict?.lon}
                        serviceType="food"
                        radiusKm={radiusKm}
                        markers={restaurants.map((r) => ({
                            id: r.id,
                            name: r.name,
                            lat: r.latitude,
                            lon: r.longitude,
                            rating: r.rating,
                            address: r.location,
                        }))}
                        activeStoreId={selectedRestaurant?.id}
                        onSelectMarker={(r) => setSelectedRestaurant(restaurants.find((x) => x.id === r.id) || null)}
                    />

                </div>

            </section>

            {/* RESTAURANT / PRODUCTS CONTAINER */}
            {!selectedRestaurant ? (
                /* RESTAURANTS VIEW */
                <section className="restaurant-container">
                    <div className="restaurant-section-header">
                        <h2>Restaurants in {districtName}</h2>
                        <p>Showing contracted kitchens across {districtName}</p>
                    </div>

                    {isLoadingProducts ? (
                        <SkeletonGrid count={3} lines={3} className="restaurant-skeleton-grid" />
                    ) : filteredRestaurants.length === 0 ? (
                        <div className="no-results">
                            <h3>No restaurants found matching your search.</h3>
                            <p>Try searching for a different kitchen name or location.</p>
                        </div>
                    ) : (
                        <div className="restaurant-grid aw-reveal-stagger">
                            {filteredRestaurants.map((restaurant) => (
                                <article
                                    key={restaurant.id}
                                    className="restaurant-card-premium"
                                    onClick={() => setSelectedRestaurant(restaurant)}
                                >
                                    <div className="restaurant-card-decor">
                                        <span className="restaurant-badge">
                                            {restaurant.deliveryType || 'URBAN'}
                                        </span>
                                    </div>
                                    <div className="restaurant-card-body">
                                        <h3>{restaurant.name}</h3>
                                        <p className="restaurant-loc">
                                            📍 {restaurant.location}
                                        </p>
                                        <div className="restaurant-rating-row">
                                            <span className="restaurant-stars">
                                                ⭐ {restaurant.rating}
                                            </span>
                                            <span className="view-menu-link">
                                                View Menu →
                                            </span>
                                        </div>
                                    </div>
                                </article>
                            ))}
                        </div>
                    )}
                </section>
            ) : (
                /* MENU & PRODUCTS VIEW */
                <>
                    {/* BACK BUTTON AND RESTAURANT TITLE */}
                    <div className="restaurant-menu-header">
                        <button
                            className="back-to-restaurants-btn"
                            onClick={() => {
                                setSelectedRestaurant(null);
                                setSearchTerm('');
                            }}
                        >
                            ← Back to Restaurants
                        </button>
                        <div className="selected-restaurant-info">
                            <h2>{selectedRestaurant.name}</h2>
                            <p>
                                📍 {selectedRestaurant.location} • ⭐ {selectedRestaurant.rating} • {selectedRestaurant.deliveryType}
                            </p>
                        </div>
                    </div>

                    {/* CATEGORY FILTER */}
                    {categories.length > 1 && (
                        <section className="food-category-row">
                            {categories.map((category) => (
                                <button
                                    key={category}
                                    className={selectedCategory === category ? 'active' : ''}
                                    onClick={() => setSelectedCategory(category)}
                                >
                                    {category}
                                </button>
                            ))}
                        </section>
                    )}

                    {/* PRODUCTS + CART */}
                    <section className="food-layout">
                        {/* PRODUCTS */}
                        <div className="food-products">
                            {filteredProducts.length === 0 ? (
                                <div className="no-results">
                                    <h3>No dishes found.</h3>
                                    <p>Try clearing your category filter or search query.</p>
                                </div>
                            ) : (
                                filteredProducts.map((product) => (
                                    <article className="food-card" key={product.id}>
                                        <div className="food-image-wrap">
                                            <img src={product.imageUrl} alt={product.name} />
                                            {product.offerTag && (
                                                <span className="offer-badge">{product.offerTag}</span>
                                            )}
                                        </div>

                                        <div className="food-card-body">
                                            <div className="food-card-title">
                                                <div>
                                                    <p className="restaurant-name">
                                                        {product.restaurantName}
                                                    </p>
                                                    <h2>{product.name}</h2>
                                                    <p className="food-category-label">
                                                        {product.category}
                                                    </p>
                                                </div>
                                                <span className="food-rating">
                                                    ⭐ {product.rating}
                                                </span>
                                            </div>

                                            <p className="food-desc">{product.description}</p>

                                            <div className="food-meta">
                                                <p className="food-type">{product.foodType}</p>
                                                {product.stock > 0 && product.stock <= 5 && (
                                                    <p className="stock-warning">
                                                        Only {product.stock} left!
                                                    </p>
                                                )}
                                            </div>

                                            <div className="food-card-bottom">
                                                <strong>₹{product.price}</strong>
                                                {product.stock === 0 ? (
                                                    <button className="out-of-stock-btn" disabled>
                                                        Out of Stock
                                                    </button>
                                                ) : (
                                                    <button onClick={() => addToCart(product)}>
                                                        + Add
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </article>
                                ))
                            )}
                        </div>

                        {/* CART */}
                        <aside className="food-cart">
                            <h2>🛒 Your Order</h2>
                            {cart.length === 0 ? (
                                <p className="empty-cart">
                                    Add food items to preview your order summary.
                                </p>
                            ) : (
                                <>
                                    <div className="cart-items">
                                        {cart.map((item) => (
                                            <div className="cart-item" key={item.id}>
                                                <span>{item.name}</span>
                                                <strong>
                                                    {item.quantity} × ₹{item.price}
                                                </strong>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="cart-total">
                                        <span>Total</span>
                                        <strong>₹{cartTotal}</strong>
                                    </div>

                                    <button
                                        type="button"
                                        className="checkout-btn"
                                        onClick={onGoToCart}
                                    >
                                        Continue →
                                    </button>
                                </>
                            )}
                        </aside>
                    </section>
                </>
            )}

            {toast && <div className="service-toast">{toast}</div>}
        </main>
    );
}

export default FoodDelivery;
