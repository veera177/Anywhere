import { useEffect, useMemo, useState } from 'react';
import './GroceryDelivery.css';
import { addItemToCart, fetchCartCount } from '../../utils/cartApi';

const API_URL = 'http://localhost:8080/api/grocery-products';
const STORE_API = 'http://localhost:8080/api/grocery-stores';

const landmarkByDistrict = {
    salem: 'Near Salem Junction Railway Station',
    trichy: 'Near Rockfort Temple and Central Bus Stand',
    thanjavur: 'Near Brihadeeswarar Temple',
    theni: 'Near Theni Old Bus Stand',
    kanyakumari: 'Near Nagercoil Clock Tower',
    karaikudi: 'Near Karaikudi New Bus Stand',
    pollachi: 'Near Pollachi Market Road',
    ooty: 'Near Ooty Lake and Boat House',
    ambur: 'Near Ambur Bazaar',
    tiruvannamalai: 'Near Arunachaleswarar Temple'
};

/* ── District hubs ── */
const districtLocations = [
    {
        id: 'salem',
        district: 'Salem',
        hub: 'Salem Junction',
        lat: 11.6643,
        lon: 78.1460,
        note: 'Central Salem hub for local grocery pickup routes.'
    },
    {
        id: 'trichy',
        district: 'Trichy',
        hub: 'Trichy Central',
        lat: 10.7905,
        lon: 78.7047,
        note: 'District hub for Trichy city and nearby areas.'
    },
    {
        id: 'thanjavur',
        district: 'Thanjavur',
        hub: 'Thanjavur Main',
        lat: 10.7870,
        lon: 79.1378,
        note: 'Hub for Thanjavur town and temple area deliveries.'
    },
    {
        id: 'theni',
        district: 'Theni',
        hub: 'Theni Main',
        lat: 10.0104,
        lon: 77.4768,
        note: 'Hub for Theni town and nearby village grocery orders.'
    },
    {
        id: 'kanyakumari',
        district: 'Kanyakumari',
        hub: 'Nagercoil',
        lat: 8.1833,
        lon: 77.4119,
        note: 'Coastal hub for Nagercoil and surrounding areas.'
    },
    {
        id: 'karaikudi',
        district: 'Karaikudi',
        hub: 'Karaikudi Main',
        lat: 10.0732,
        lon: 78.7675,
        note: 'Chettinad region hub for authentic local provisions.'
    },
    {
        id: 'pollachi',
        district: 'Pollachi',
        hub: 'Pollachi Town',
        lat: 10.6609,
        lon: 77.0087,
        note: 'Kongu region hub for town and semi-urban grocery delivery.'
    },
    {
        id: 'ooty',
        district: 'Ooty',
        hub: 'Ooty Lake Road',
        lat: 11.4102,
        lon: 76.6950,
        note: 'Hill station hub for fresh organic farm veggies.'
    },
    {
        id: 'ambur',
        district: 'Ambur',
        hub: 'Ambur Bazaar',
        lat: 12.7900,
        lon: 78.7160,
        note: 'Famous Ambur bazaar hub for groceries.'
    },
    {
        id: 'tiruvannamalai',
        district: 'Tiruvannamalai',
        hub: 'Temple Area',
        lat: 12.2253,
        lon: 79.0747,
        note: 'Temple town hub for organic pulses and grains.'
    }
];

/* ── Demo fallback products ── */
const fallbackProducts = [
    {
        id: 101,
        storeName: 'Salem Fresh Mart',
        name: 'Organic Apples',
        district: 'salem',
        category: 'Fruits',
        price: 180,
        rating: 4.6,
        imageUrl: 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?auto=format&fit=crop&w=900&q=80',
        description: 'Fresh crunchy organic red apples.',
        offerTag: 'Fresh Pick',
        unitType: '1 kg',
        stock: 15
    }
];

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
        useState('salem');

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
        const user = JSON.parse(localStorage.getItem('user'));
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
                // Fallback products filtered by district
                const demoData = fallbackProducts.filter(
                    p => p.district === selectedDistrictId
                );
                setProducts(demoData.length > 0 ? demoData : fallbackProducts);
                setIsFromServer(false);
                setProductMessage('Spring Boot API not connected. Showing demo products.');
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

    /* ── Selected district ── */
    const selectedDistrict =
        districtLocations.find(
            location => location.id === selectedDistrictId
        ) || districtLocations[0];

    const landmark =
        landmarkByDistrict[selectedDistrict.id] ||
        `Near ${selectedDistrict.hub}`;

    const mapLink =
        `https://www.google.com/maps/search/?api=1&query=${
            selectedDistrict.lat
        },${
            selectedDistrict.lon
        }`;

    const addToCart = async (product) => {
        if (product.stock === 0) return;

        const user = JSON.parse(localStorage.getItem('user'));
        if (!user) {
            alert('Please Sign In First');
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
                        {selectedDistrict.district} grocery delivery
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
                                : '🟡 Demo inventory'
                        }
                    </span>
                    <h1>
                        Fresh groceries from organic farms in {selectedDistrict.district}.
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
                                districtLocations.map((location) => (
                                    <option
                                        key={location.id}
                                        value={location.id}
                                    >
                                        {location.district} — {location.hub}
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
                    <span>Selected hub</span>
                    <strong>
                        {selectedDistrict.district}
                    </strong>
                    <p>{selectedDistrict.note}</p>
                </aside>
            </section>

            {/* API STATUS */}
            <div
                className={`grocery-api-status ${
                    isFromServer ? 'live' : 'demo'
                }`}
            >
                <span>
                    {
                        isLoadingProducts
                            ? '⏳ Loading...'
                            : isFromServer
                                ? '✅ Database connected'
                                : '⚠️ Demo fallback'
                    }
                </span>
                <p>{productMessage}</p>
            </div>

            {/* MAP */}
            <section className="grocery-map-section">
                <div className="grocery-map-copy">
                    <span>Location marker</span>
                    <h2>
                        {selectedDistrict.hub}
                    </h2>
                    <p>
                        Grocery delivery coverage around {selectedDistrict.district}. Use the nearby landmark to identify the service point.
                    </p>
                    <div className="grocery-map-meta">
                        <strong>
                            Landmark: {landmark}
                        </strong>
                        <strong>
                            Lat: {selectedDistrict.lat}
                        </strong>
                        <strong>
                            Lng: {selectedDistrict.lon}
                        </strong>
                    </div>
                </div>

                <div className="grocery-map-frame">
                    <div className="grocery-location-preview">
                        <div className="grocery-location-pin">📍</div>
                        <span>{selectedDistrict.district}</span>
                        <h3>{selectedDistrict.hub}</h3>
                        <p>{landmark}</p>
                        <a href={mapLink} target="_blank" rel="noopener noreferrer">
                            Open map
                        </a>
                    </div>
                </div>
            </section>

            {/* STORES / PRODUCTS CONTAINER */}
            {!selectedStore ? (
                /* STORES VIEW */
                <section className="store-container">
                    <div className="store-section-header">
                        <h2>Stores in {selectedDistrict.district}</h2>
                        <p>Showing premium provision shops near {selectedDistrict.hub}</p>
                    </div>

                    {filteredStores.length === 0 ? (
                        <div className="no-results">
                            <h3>No grocery stores found matching your search.</h3>
                            <p>Try searching for a different shop name or location.</p>
                        </div>
                    ) : (
                        <div className="store-grid">
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
