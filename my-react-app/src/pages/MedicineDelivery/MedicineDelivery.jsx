import { useEffect, useMemo, useState } from 'react';
import './MedicineDelivery.css';
import { addItemToCart, fetchCartCount } from '../../utils/cartApi';

const API_URL = 'http://localhost:8080/api/medicine-products';
const PHARMACY_API = 'http://localhost:8080/api/pharmacies';

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
        note: 'Central Salem hub for local medicine dispatch routes.'
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
        note: 'Hub for Thanjavur town and surrounding medicine dispatch.'
    },
    {
        id: 'theni',
        district: 'Theni',
        hub: 'Theni Main',
        lat: 10.0104,
        lon: 77.4768,
        note: 'Hub for Theni town and nearby village healthcare orders.'
    },
    {
        id: 'kanyakumari',
        district: 'Kanyakumari',
        hub: 'Nagercoil',
        lat: 8.1833,
        lon: 77.4119,
        note: 'Coastal hub for Nagercoil and surrounding medical stores.'
    },
    {
        id: 'karaikudi',
        district: 'Karaikudi',
        hub: 'Karaikudi Main',
        lat: 10.0732,
        lon: 78.7675,
        note: 'Chettinad region hub for local pharmaceutical provisions.'
    },
    {
        id: 'pollachi',
        district: 'Pollachi',
        hub: 'Pollachi Town',
        lat: 10.6609,
        lon: 77.0087,
        note: 'Kongu region hub for town and semi-urban medicine delivery.'
    },
    {
        id: 'ooty',
        district: 'Ooty',
        hub: 'Ooty Lake Road',
        lat: 11.4102,
        lon: 76.6950,
        note: 'Hill station hub for quick clinical supplies.'
    },
    {
        id: 'ambur',
        district: 'Ambur',
        hub: 'Ambur Bazaar',
        lat: 12.7900,
        lon: 78.7160,
        note: 'Famous Ambur bazaar hub for healthcare products.'
    },
    {
        id: 'tiruvannamalai',
        district: 'Tiruvannamalai',
        hub: 'Temple Area',
        lat: 12.2253,
        lon: 79.0747,
        note: 'Temple town hub for organic and essential medical goods.'
    }
];

/* Demo fallback data removed. Application now uses Spring Boot + MySQL only. */

function MedicineDelivery({ onBack, onGoToCart }) {
    const [products, setProducts] = useState([]);
    const [pharmacies, setPharmacies] = useState([]);
    const [selectedPharmacy, setSelectedPharmacy] = useState(null);
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [selectedDistrictId, setSelectedDistrictId] = useState('salem');
    const [searchTerm, setSearchTerm] = useState('');
    const [cart, setCart] = useState([]);
    const [cartCount, setCartCount] = useState(0);
    const [toast, setToast] = useState('');
    const [isFromServer, setIsFromServer] = useState(false);
    const [isLoadingProducts, setIsLoadingProducts] = useState(false);
    const [productMessage, setProductMessage] = useState('Select a pharmacy to view its medical inventory.');

    useEffect(() => {
        const user = JSON.parse(localStorage.getItem('user'));
        if (!user?.id) return;
        fetchCartCount(user.id).then(setCartCount);
    }, []);

    const showToast = (message) => {
        setToast(message);
        setTimeout(() => setToast(''), 2200);
    };

    /* ── Fetch Pharmacies on District Change ── */
    useEffect(() => {
        const loadPharmacies = async () => {
            setIsLoadingProducts(true);
            try {
                const response = await fetch(
                    `${PHARMACY_API}?district=${selectedDistrictId}`
                );
                if (!response.ok) {
                    throw new Error('Pharmacies API Error');
                }
                const data = await response.json();
                setPharmacies(data || []);
                setIsFromServer(true);
            } catch (error) {
                console.log('Error fetching pharmacies:', error);
                setPharmacies([]);
                setIsFromServer(false);
                setProductMessage('Unable to load pharmacies from the server.');
            } finally {
                setIsLoadingProducts(false);
            }
        };

        loadPharmacies();
        setSelectedPharmacy(null); // Clear selected pharmacy
        setProducts([]); // Clear items
        setSelectedCategory('All');
        setSearchTerm('');
    }, [selectedDistrictId]);

    /* ── Fetch Products on Pharmacy Change ── */
    useEffect(() => {
        if (!selectedPharmacy) {
            setProducts([]);
            return;
        }

        const loadProducts = async () => {
            setIsLoadingProducts(true);
            try {
                const response = await fetch(
                    `${API_URL}?pharmacyId=${selectedPharmacy.id}`
                );
                if (!response.ok) {
                    throw new Error('Products API Error');
                }
                const data = await response.json();
                if (Array.isArray(data) && data.length > 0) {
                    setProducts(data);
                    setIsFromServer(true);
                    setProductMessage(`Showing ${data.length} items from ${selectedPharmacy.name}`);
                } else {
                    setProducts([]);
                    setIsFromServer(true);
                    setProductMessage('No products found for this pharmacy.');
                }
            } catch (error) {
                console.log('Error fetching products:', error);
                setProducts([]);
                setIsFromServer(false);
                setProductMessage('Unable to load medicines from the server.');
            } finally {
                setIsLoadingProducts(false);
            }
        };

        loadProducts();
    }, [selectedPharmacy, selectedDistrictId]);

    /* ── Filter Pharmacies by Search Term ── */
    const filteredPharmacies = useMemo(() => {
        const query = searchTerm.trim().toLowerCase();
        return pharmacies.filter((pharmacy) => {
            const name = pharmacy.name ? pharmacy.name.toLowerCase() : '';
            const location = pharmacy.location ? pharmacy.location.toLowerCase() : '';
            return name.includes(query) || location.includes(query);
        });
    }, [pharmacies, searchTerm]);

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

            const matchesPharmacy =
                !selectedPharmacy ||
                product.pharmacyName === selectedPharmacy.name ||
                product.pharmacyId === selectedPharmacy.id;

            return (
                matchesDistrict &&
                matchesCategory &&
                matchesSearch &&
                matchesPharmacy
            );
        });
    }, [
        products,
        selectedCategory,
        searchTerm,
        selectedDistrictId,
        selectedPharmacy
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
            await addItemToCart(user, product, 'MEDICINE', product.pharmacyName || selectedPharmacy?.name);
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
        <main className="medicine-page">

            {/* NAVBAR */}
            <nav className="medicine-nav">
                <button
                    className="medicine-back-btn"
                    onClick={onBack}
                >
                    ← Back
                </button>

                <div>
                    <span className="medicine-brand">
                        Anywhere
                    </span>
                    <span className="medicine-location">
                        {selectedDistrict.district} essential medicines
                    </span>
                </div>

                <button type="button" className="medicine-cart-pill" onClick={onGoToCart}>
                    🛒 Cart <strong>{cartCountDisplay}</strong>
                </button>
            </nav>

            {/* HERO */}
            <section className="medicine-hero">
                <div className="medicine-hero-copy">
                    <span className="medicine-kicker">
                        {
                            isFromServer
                                ? '🟢 Live pharmacy stocks'
                                : '🟡 Demo health inventory'
                        }
                    </span>
                    <h1>
                        Trusted essential medicines delivered to {selectedDistrict.district}.
                    </h1>
                    <p>
                        Order prescription and wellness products from licensed pharmacies and medical hubs.
                    </p>

                    <div className="medicine-search-panel">
                        <select
                            value={selectedDistrictId}
                            onChange={(event) => {
                                setSelectedDistrictId(
                                    event.target.value
                                );
                                setSelectedCategory('All');
                                setSearchTerm('');
                                setSelectedPharmacy(null);
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
                            placeholder="Search paracetamol, syrup, vitamins, bandages..."
                            value={searchTerm}
                            onChange={(event) =>
                                setSearchTerm(
                                    event.target.value
                                )
                            }
                        />
                    </div>
                </div>

                <aside className="medicine-hero-card">
                    <span>Selected Medical Hub</span>
                    <strong>
                        {selectedDistrict.district}
                    </strong>
                    <p>{selectedDistrict.note}</p>
                </aside>
            </section>

            {/* API STATUS */}
            <div
                className={`medicine-api-status ${
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
            <section className="medicine-map-section">
                <div className="medicine-map-copy">
                    <span>Location marker</span>
                    <h2>
                        {selectedDistrict.hub}
                    </h2>
                    <p>
                        Emergency medicine dispatch coverage around {selectedDistrict.district}. Use the nearby landmark to identify the service point.
                    </p>
                    <div className="medicine-map-meta">
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

                <div className="medicine-map-frame">
                    <div className="medicine-location-preview">
                        <div className="medicine-location-pin">📍</div>
                        <span>{selectedDistrict.district}</span>
                        <h3>{selectedDistrict.hub}</h3>
                        <p>{landmark}</p>
                        <a href={mapLink} target="_blank" rel="noopener noreferrer">
                            Open map
                        </a>
                    </div>
                </div>
            </section>

            {/* PHARMACIES / PRODUCTS CONTAINER */}
            {!selectedPharmacy ? (
                /* PHARMACIES VIEW */
                <section className="pharmacy-container">
                    <div className="pharmacy-section-header">
                        <h2>Pharmacies in {selectedDistrict.district}</h2>
                        <p>Showing licensed healthcare dispensaries near {selectedDistrict.hub}</p>
                    </div>

                    {filteredPharmacies.length === 0 ? (
                        <div className="no-results">
                            <h3>No pharmacies found matching your search.</h3>
                            <p>Try searching for a different shop name or location.</p>
                        </div>
                    ) : (
                        <div className="pharmacy-grid">
                            {filteredPharmacies.map((pharmacy) => (
                                <article
                                    key={pharmacy.id}
                                    className="pharmacy-card-premium"
                                    onClick={() => setSelectedPharmacy(pharmacy)}
                                >
                                    <div className="pharmacy-card-decor">
                                        <span className="pharmacy-badge">
                                            {pharmacy.deliveryType || 'URBAN'}
                                        </span>
                                    </div>
                                    <div className="pharmacy-card-body">
                                        <h3>{pharmacy.name}</h3>
                                        <p className="pharmacy-loc">
                                            📍 {pharmacy.location}
                                        </p>
                                        <div className="pharmacy-rating-row">
                                            <span className="pharmacy-stars">
                                                ⭐ {pharmacy.rating}
                                            </span>
                                            <span className="view-menu-link">
                                                View Medicines →
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
                    {/* BACK BUTTON AND PHARMACY TITLE */}
                    <div className="pharmacy-menu-header">
                        <button
                            className="back-to-pharmacies-btn"
                            onClick={() => {
                                setSelectedPharmacy(null);
                                setSearchTerm('');
                            }}
                        >
                            ← Back to Pharmacies
                        </button>
                        <div className="selected-pharmacy-info">
                            <h2>{selectedPharmacy.name}</h2>
                            <p>
                                📍 {selectedPharmacy.location} • ⭐ {selectedPharmacy.rating} • {selectedPharmacy.deliveryType}
                            </p>
                        </div>
                    </div>

                    {/* CATEGORY FILTER */}
                    {categories.length > 1 && (
                        <section className="medicine-category-row">
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
                    <section className="medicine-layout">
                        {/* PRODUCTS */}
                        <div className="medicine-products">
                            {filteredProducts.length === 0 ? (
                                <div className="no-results">
                                    <h3>No medicines found.</h3>
                                    <p>Try clearing your category filter or search query.</p>
                                </div>
                            ) : (
                                filteredProducts.map((product) => (
                                    <article className="medicine-card" key={product.id}>
                                        <div className="medicine-image-wrap">
                                            <img src={product.imageUrl} alt={product.name} />
                                            {product.offerTag && (
                                                <span className="offer-badge">{product.offerTag}</span>
                                            )}
                                        </div>

                                        <div className="medicine-card-body">
                                            <div className="medicine-card-title">
                                                <div>
                                                    <p className="pharmacy-name">
                                                        {product.pharmacyName}
                                                    </p>
                                                    <h2>{product.name}</h2>
                                                    <p className="medicine-category-label">
                                                        {product.category}
                                                    </p>
                                                </div>
                                                <span className="medicine-rating">
                                                    ⭐ {product.rating}
                                                </span>
                                            </div>

                                            <p className="medicine-desc">{product.description}</p>

                                            <div className="medicine-meta">
                                                <p className="medicine-dosage">{product.dosage}</p>
                                                {product.stock > 0 && product.stock <= 5 && (
                                                    <p className="stock-warning">
                                                        Only {product.stock} left!
                                                    </p>
                                                )}
                                            </div>

                                            <div className="medicine-card-bottom">
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
                        <aside className="medicine-cart">
                            <h2>🛒 Your Prescription Order</h2>
                            {cart.length === 0 ? (
                                <p className="empty-cart">
                                    Add pharmaceutical items to preview your order summary.
                                </p>
                            ) : (
                                <>
                                    <div className="cart-items">
                                        {cart.map((item) => (
                                            <div className="cart-item" key={item.id}>
                                                <span>{item.name} ({item.dosage})</span>
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
                                        Continue to Cart →
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

export default MedicineDelivery;
