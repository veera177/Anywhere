import { useEffect, useMemo, useState } from 'react';
import './FoodDelivery.css';
import { addItemToCart, fetchCartCount } from '../../utils/cartApi';

const API_URL = 'http://localhost:8080/api/food-products';

const RESTAURANT_API =
    'http://localhost:8080/api/restaurants';

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
        note: 'Central Salem hub for local restaurant pickup routes.'
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
        note: 'Hub for Theni town and nearby village food orders.'
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
        note: 'Chettinad region hub for authentic local cuisine.'
    },
    {
        id: 'pollachi',
        district: 'Pollachi',
        hub: 'Pollachi Town',
        lat: 10.6609,
        lon: 77.0087,
        note: 'Kongu region hub for town and semi-urban delivery.'
    },
    {
        id: 'ooty',
        district: 'Ooty',
        hub: 'Ooty Lake Road',
        lat: 11.4102,
        lon: 76.6950,
        note: 'Hill station hub for cafes and restaurants.'
    },
    {
        id: 'ambur',
        district: 'Ambur',
        hub: 'Ambur Bazaar',
        lat: 12.7900,
        lon: 78.7160,
        note: 'Famous biryani town hub for food delivery.'
    },
    {
        id: 'tiruvannamalai',
        district: 'Tiruvannamalai',
        hub: 'Temple Area',
        lat: 12.2253,
        lon: 79.0747,
        note: 'Temple town hub for breakfast and local food.'
    }
];

/* ── Demo fallback products ── */
const fallbackProducts = [
    {
        id: 101,
        restaurantName: 'Salem RR Biryani',
        name: 'Salem Parotta Set',
        district: 'salem',
        category: 'Dinner',
        price: 199,
        rating: 4.5,
        imageUrl:
            'https://images.unsplash.com/photo-1604908177522-040f7c20af1e?auto=format&fit=crop&w=900&q=80',
        description: 'Layered parotta with spicy salna.',
        offerTag: 'Bestseller',
        foodType: 'Non-Veg',
        stock: 14
    }
];

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
        useState('salem');

    const [searchTerm, setSearchTerm] =
        useState('');

    const [cartCount, setCartCount] = useState(0);
    const [cart, setCart] = useState([]);
    const [toast, setToast] = useState('');

    useEffect(() => {
        const user = JSON.parse(localStorage.getItem('user'));
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
                const response = await fetch(
                    `${RESTAURANT_API}?district=${selectedDistrictId}`
                );
                if (!response.ok) {
                    throw new Error('Restaurants API Error');
                }
                const data = await response.json();
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
                const response = await fetch(
                    `${API_URL}?restaurantId=${selectedRestaurant.id}`
                );
                if (!response.ok) {
                    throw new Error('Products API Error');
                }
                const data = await response.json();
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
                // Fallback products filtered by district
                const demoData = fallbackProducts.filter(
                    p => p.district === selectedDistrictId
                );
                setProducts(demoData.length > 0 ? demoData : fallbackProducts);
                setIsFromServer(false);
                setProductMessage('Spring Boot API not connected. Showing demo dishes.');
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
                        {selectedDistrict.district} food delivery
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
                                : '🟡 Demo menu'
                        }

                    </span>

                    <h1>
                        Food delivered fast from nearby {selectedDistrict.district} kitchens.
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

                    <span>Selected hub</span>

                    <strong>
                        {selectedDistrict.district}
                    </strong>

                    <p>{selectedDistrict.note}</p>

                </aside>

            </section>

            {/* API STATUS */}
            <div
                className={`food-api-status ${
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
            <section className="food-map-section">

                <div className="food-map-copy">

                    <span>Location marker</span>

                    <h2>
                        {selectedDistrict.hub}
                    </h2>

                    <p>
                        Delivery coverage around {selectedDistrict.district}. Use the landmark to identify the nearby service point quickly.
                    </p>

                    <div className="food-map-meta">

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

                <div className="food-map-frame">

                    <div className="food-location-preview">
                        <div className="food-location-pin">📍</div>
                        <span>{selectedDistrict.district}</span>
                        <h3>{selectedDistrict.hub}</h3>
                        <p>{landmark}</p>
                        <a href={mapLink} target="_blank" rel="noopener noreferrer">
                            Open map
                        </a>
                    </div>

                </div>

            </section>

            {/* RESTAURANT / PRODUCTS CONTAINER */}
            {!selectedRestaurant ? (
                /* RESTAURANTS VIEW */
                <section className="restaurant-container">
                    <div className="restaurant-section-header">
                        <h2>Restaurants in {selectedDistrict.district}</h2>
                        <p>Showing premium kitchens near {selectedDistrict.hub}</p>
                    </div>

                    {filteredRestaurants.length === 0 ? (
                        <div className="no-results">
                            <h3>No restaurants found matching your search.</h3>
                            <p>Try searching for a different kitchen name or location.</p>
                        </div>
                    ) : (
                        <div className="restaurant-grid">
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
