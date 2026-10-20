import { useEffect, useMemo, useState } from 'react';
import './GroceryDelivery.css';
import { addItemToCart, fetchCartCount } from '../../utils/cartApi';
import DeliveryMap from '../../components/DeliveryMap';
import { getDistricts, getServiceRadiusKm, resolvePreferredDistrictId } from '../../services/districts';
import { SkeletonGrid, SkeletonStatus } from '../../components/Skeleton';
import { GROCERY_PRODUCTS_BASE, GROCERY_STORES_BASE } from '../../services/apiConfig';
import { apiFetchJson } from '../../services/apiClient';
import { getSignedInUser } from '../../auth/session.js';

const API_URL = GROCERY_PRODUCTS_BASE;
const STORE_API = GROCERY_STORES_BASE;

/* Districts are loaded from the database via /api/districts (see services/districts.js).
   No district names, hubs, landmarks or coordinates are hardcoded. */

function GroceryDelivery({ onBack, onGoToCart }) {

    const [products, setProducts] =
        useState([]);

    const [stores, setStores] =
        useState([]);

    const [selectedStore, setSelectedStore] =
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
            const availableDistricts = list.filter((district) => Number(district.partnerCounts?.grocery || 0) > 0);
            setDistricts(availableDistricts);
            // Profile district is the user's active service area.
            setSelectedDistrictId((current) =>
                current && availableDistricts.some((d) => d.id === current)
                    ? current
                    : resolvePreferredDistrictId(availableDistricts, '')
            );
        });
        getServiceRadiusKm('grocery').then((km) => {
            if (!cancelled) setRadiusKm(km);
        });
        return () => { cancelled = true; };
    }, []);

    const [searchTerm, setSearchTerm] =
        useState('');

    const [cart, setCart] = useState([]);
    const [cartCount, setCartCount] = useState(0);
    const [toast, setToast] = useState('');

    const [isFromServer, setIsFromServer] =
        useState(false);

    const [isLoadingProducts, setIsLoadingProducts] =
        useState(false);

    const [productMessage, setProductMessage] =
        useState('Select a grocery store to view its products.');

    useEffect(() => {
        const user = getSignedInUser();
        if (!user?.id) return;
        fetchCartCount(user.id).then(setCartCount);
    }, []);

    const showToast = (message) => {
        setToast(message);
        setTimeout(() => setToast(''), 2200);
    };

    /* ── Fetch Stores on District Change ── */
    useEffect(() => {
        const loadStores = async () => {
            setIsLoadingProducts(true);
            try {
                const response = await fetch(
                    `${STORE_API}?district=${selectedDistrictId}`
                );
                if (!response.ok) {
                    throw new Error('Stores API Error');
                }
                const data = await response.json();
                setStores(data || []);
                setIsFromServer(true);
            } catch (error) {
                console.log(error);
                setStores([]);
                setIsFromServer(false);
            } finally {
                setIsLoadingProducts(false);
            }
        };

        loadStores();
        setSelectedStore(null); // Clear selected store
        setProducts([]); // Clear items
        setSelectedCategory('All');
        setSearchTerm('');
    }, [selectedDistrictId]);

    /* ── Fetch Products on Store Change ── */
    useEffect(() => {
        if (!selectedStore) {
            setProducts([]);
            return;
        }

        const loadProducts = async () => {
            setIsLoadingProducts(true);
            try {
                const response = await fetch(
                    `${API_URL}?storeId=${selectedStore.id}`
                );
                if (!response.ok) {
                    throw new Error('Products API Error');
                }
                const data = await response.json();
                if (Array.isArray(data) && data.length > 0) {
                    setProducts(data);
                    setIsFromServer(true);
                    setProductMessage(`Showing ${data.length} items from ${selectedStore.name}`);
                } else {
                    setProducts([]);
                    setIsFromServer(true);
                    setProductMessage('No products found for this store.');
                }
            } catch (error) {
                console.log(error);
                setProducts([]);
                setIsFromServer(false);
                setProductMessage('Unable to load products from the server.');
            } finally {
                setIsLoadingProducts(false);
            }
        };

        loadProducts();
    }, [selectedStore, selectedDistrictId]);

    /* ── Filter Stores by Search Term ── */
    const filteredStores = useMemo(() => {
        const query = searchTerm.trim().toLowerCase();
        return stores.filter((store) => {
            const name = store.name ? store.name.toLowerCase() : '';
            const location = store.location ? store.location.toLowerCase() : '';
            return name.includes(query) || location.includes(query);
        });
    }, [stores, searchTerm]);

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
        const query = searchTerm.trim().toLowerCase();

        return products.filter((product) => {
            const matchesDistrict =
                product.district === selectedDistrictId;

            const matchesCategory =
                selectedCategory === 'All' ||
                product.category === selectedCategory;

            const matchesSearch =
                product.name.toLowerCase().includes(query) ||
                product.description.toLowerCase().includes(query);

            const matchesStore =
                !selectedStore ||
                product.storeName === selectedStore.name;

            return (
                matchesDistrict &&
                matchesCategory &&
                matchesSearch &&
                matchesStore
            );
        });
    }, [
        products,
        selectedCategory,
        searchTerm,
        selectedDistrictId,
        selectedStore
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
            await addItemToCart(user, product, 'GROCERY', product.storeName || selectedStore?.name);
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
        <main className="grocery-page">

            {/* NAVBAR */}
            <nav className="grocery-nav">
                <button
                    className="grocery-back-btn"
                    onClick={onBack}
                >
                    ← Back
                </button>

                <div>
                    <span className="grocery-brand">
                        Anywhere
                    </span>
                    <span className="grocery-location">
                        {districtName} grocery delivery
                    </span>
                </div>

                <button type="button" className="grocery-cart-pill" onClick={onGoToCart}>
                    🛒 Cart <strong>{cartCountDisplay}</strong>
                </button>
            </nav>

            {/* HERO */}
            <section className="grocery-hero">
                <div className="grocery-hero-copy">
                    <span className="grocery-kicker">
                        {
                            isFromServer
                                ? '🟢 Live store inventory'
                                : '🟡 Inventory unavailable offline'
                        }
                    </span>
                    <h1>
                        Fresh groceries from organic farms in {districtName}.
                    </h1>
                    <p>
                        Browse local supermarkets, provisions, and organic oil mills.
                    </p>

                    <div className="grocery-search-panel">
                        <select
                            value={selectedDistrictId}
                            onChange={(event) => {
                                setSelectedDistrictId(
                                    event.target.value
                                );
                                setSelectedCategory('All');
                                setSearchTerm('');
                                setSelectedStore(null);
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
                            placeholder="Search apples, carrots, rice, oil..."
                            value={searchTerm}
                            onChange={(event) =>
                                setSearchTerm(
                                    event.target.value
                                )
                            }
                        />
                    </div>
                </div>

                <aside className="grocery-hero-card">
                    <span>Selected district</span>
                    <strong>
                        {districtName}
                    </strong>
                    <p>
                        {radiusKm
                            ? `Delivery from each contracted store within ${radiusKm} km of its own location.`
                            : 'Delivery coverage per store, from platform settings.'}
                    </p>
                </aside>
            </section>

            {/* API STATUS */}
            <div
                className={`grocery-api-status ${
                    isFromServer ? 'live' : 'demo'
                }`}
            >
                <span>
                    {isLoadingProducts ? (
                        <SkeletonStatus>Loading products…</SkeletonStatus>
                    ) : isFromServer ? (
                        'Database connected'
                    ) : (
                        'Server offline'
                    )}
                </span>
                <p>{productMessage}</p>
            </div>

            {/* COVERAGE MAP — real store locations from the database */}
            <section className="grocery-map-section">
                <div className="grocery-map-copy">
                    <span>Live coverage</span>
                    <h2>
                        Stores in {districtName}
                    </h2>
                    <p>
                        Each contracted grocery store is shown at its actual location with its own {radiusKm ?? '…'} km delivery radius, centred on that store.
                    </p>
                </div>

                <div className="grocery-map-frame">
                    <DeliveryMap
                        lat={selectedDistrict?.lat}
                        lon={selectedDistrict?.lon}
                        serviceType="grocery"
                        radiusKm={radiusKm}
                        markers={stores.map((s) => ({
                            id: s.id,
                            name: s.name,
                            lat: s.latitude,
                            lon: s.longitude,
                            rating: s.rating,
                            address: s.location,
                        }))}
                        activeStoreId={selectedStore?.id}
                        onSelectMarker={(s) => setSelectedStore(stores.find((x) => x.id === s.id) || null)}
                    />
                </div>
            </section>

            {/* STORES / PRODUCTS CONTAINER */}
            {!selectedStore ? (
                /* STORES VIEW */
                <section className="store-container">
                    <div className="store-section-header">
                        <h2>Stores in {districtName}</h2>
                        <p>Showing contracted provision shops across {districtName}</p>
                    </div>

                    {isLoadingProducts ? (
                        <SkeletonGrid count={3} lines={3} className="store-skeleton-grid" />
                    ) : filteredStores.length === 0 ? (
                        <div className="no-results">
                            <h3>No grocery stores found matching your search.</h3>
                            <p>Try searching for a different shop name or location.</p>
                        </div>
                    ) : (
                        <div className="store-grid aw-reveal-stagger">
                            {filteredStores.map((store) => (
                                <article
                                    key={store.id}
                                    className="store-card-premium"
                                    onClick={() => setSelectedStore(store)}
                                >
                                    <div className="store-card-decor">
                                        <span className="store-badge">
                                            {store.deliveryType || 'URBAN'}
                                        </span>
                                    </div>
                                    <div className="store-card-body">
                                        <h3>{store.name}</h3>
                                        <p className="store-loc">
                                            📍 {store.location}
                                        </p>
                                        <div className="store-rating-row">
                                            <span className="store-stars">
                                                ⭐ {store.rating}
                                            </span>
                                            <span className="view-menu-link">
                                                Shop Products →
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
                    {/* BACK BUTTON AND STORE TITLE */}
                    <div className="store-menu-header">
                        <button
                            className="back-to-stores-btn"
                            onClick={() => {
                                setSelectedStore(null);
                                setSearchTerm('');
                            }}
                        >
                            ← Back to Stores
                        </button>
                        <div className="selected-store-info">
                            <h2>{selectedStore.name}</h2>
                            <p>
                                📍 {selectedStore.location} • ⭐ {selectedStore.rating} • {selectedStore.deliveryType}
                            </p>
                        </div>
                    </div>

                    {/* CATEGORY FILTER */}
                    {categories.length > 1 && (
                        <section className="grocery-category-row">
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
                    <section className="grocery-layout">
                        {/* PRODUCTS */}
                        <div className="grocery-products">
                            {filteredProducts.length === 0 ? (
                                <div className="no-results">
                                    <h3>No products found.</h3>
                                    <p>Try clearing your category filter or search query.</p>
                                </div>
                            ) : (
                                filteredProducts.map((product) => (
                                    <article className="grocery-card" key={product.id}>
                                        <div className="grocery-image-wrap">
                                            <img src={product.imageUrl} alt={product.name} />
                                            {product.offerTag && (
                                                <span className="offer-badge">{product.offerTag}</span>
                                            )}
                                        </div>

                                        <div className="grocery-card-body">
                                            <div className="grocery-card-title">
                                                <div>
                                                    <p className="store-name">
                                                        {product.storeName}
                                                    </p>
                                                    <h2>{product.name}</h2>
                                                    <p className="grocery-category-label">
                                                        {product.category}
                                                    </p>
                                                </div>
                                                <span className="grocery-rating">
                                                    ⭐ {product.rating}
                                                </span>
                                            </div>

                                            <p className="grocery-desc">{product.description}</p>

                                            <div className="grocery-meta">
                                                <p className="grocery-unit">{product.unitType}</p>
                                                {product.stock > 0 && product.stock <= 5 && (
                                                    <p className="stock-warning">
                                                        Only {product.stock} left!
                                                    </p>
                                                )}
                                            </div>

                                            <div className="grocery-card-bottom">
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
                        <aside className="grocery-cart">
                            <h2>🛒 Your Order</h2>
                            {cart.length === 0 ? (
                                <p className="empty-cart">
                                    Add grocery items to preview your order summary.
                                </p>
                            ) : (
                                <>
                                    <div className="cart-items">
                                        {cart.map((item) => (
                                            <div className="cart-item" key={item.id}>
                                                <span>{item.name} ({item.unitType})</span>
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

                                    <button type="button" className="checkout-btn" onClick={onGoToCart}>
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

export default GroceryDelivery;
