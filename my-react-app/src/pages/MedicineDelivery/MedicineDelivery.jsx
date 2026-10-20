import { useEffect, useMemo, useState } from 'react';
import './MedicineDelivery.css';
import { addItemToCart, fetchCartCount } from '../../utils/cartApi';
import DeliveryMap from '../../components/DeliveryMap';
import { getDistricts, getServiceRadiusKm, resolvePreferredDistrictId } from '../../services/districts';
import { SkeletonGrid, SkeletonStatus } from '../../components/Skeleton';
import { Icons } from '../../components/Icons';
import { MEDICINE_PRODUCTS_BASE, PHARMACIES_BASE } from '../../services/apiConfig';

const API_URL = MEDICINE_PRODUCTS_BASE;
const PHARMACY_API = PHARMACIES_BASE;

/* Districts are loaded from the database via /api/districts (see services/districts.js).
   No district names, hubs, landmarks or coordinates are hardcoded. */

function MedicineDelivery({ onBack, onGoToCart, onUploadPrescription }) {
    const [products, setProducts] = useState([]);
    const [pharmacies, setPharmacies] = useState([]);
    const [selectedPharmacy, setSelectedPharmacy] = useState(null);
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [selectedDistrictId, setSelectedDistrictId] = useState('');

    /* Districts + coverage radius come from the database/platform settings */
    const [districts, setDistricts] = useState([]);
    const [radiusKm, setRadiusKm] = useState(null);

    useEffect(() => {
        let cancelled = false;
        getDistricts().then((list) => {
            if (cancelled) return;
            const availableDistricts = list.filter((district) => Number(district.partnerCounts?.medicine || 0) > 0);
            setDistricts(availableDistricts);
            // Profile district is the user's active service area.
            setSelectedDistrictId((current) =>
                current && availableDistricts.some((d) => d.id === current)
                    ? current
                    : resolvePreferredDistrictId(availableDistricts, '')
            );
        });
        getServiceRadiusKm('medicine').then((km) => {
            if (!cancelled) setRadiusKm(km);
        });
        return () => { cancelled = true; };
    }, []);
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

    /* ── Selected district (from database) ── */
    const selectedDistrict =
        districts.find(d => d.id === selectedDistrictId) || null;

    const districtName = selectedDistrict?.name || '…';

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
                    <Icons.ArrowLeft className="medicine-nav-icon" /> Back
                </button>

                <div>
                    <span className="medicine-brand">
                        Anywhere
                    </span>
                    <span className="medicine-location">
                        {districtName} essential medicines
                    </span>
                </div>

                <button type="button" className="medicine-cart-pill" onClick={onGoToCart}>
                    <Icons.Cart className="medicine-nav-icon" /> Cart <strong>{cartCountDisplay}</strong>
                </button>
            </nav>

            {/* HERO */}
            <section className="medicine-hero">
                <div className="medicine-hero-copy">
                    <span className="medicine-kicker">
                        {isFromServer
                            ? '🟢 Live pharmacy stocks'
                            : '🟡 Stock unavailable offline'}
                    </span>
                    <h1>
                        Trusted essential medicines delivered to {districtName}.
                    </h1>
                    <p>
                        Order prescription and wellness products from licensed pharmacies and medical hubs.
                    </p>

                    {/* Prescription toolbar — §8 placement: beside the search */}
                    <div className="medicine-toolbar">
                        <div className="medicine-search-panel">
                            <select
                                className="medicine-search-select"
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

                            <div className="medicine-search-field">
                                <Icons.Search className="medicine-search-icon" />
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

                        <button
                            type="button"
                            className="medicine-prescription-btn"
                            onClick={onUploadPrescription}
                        >
                            <Icons.Upload className="medicine-prescription-icon" />
                            <span>Upload Prescription</span>
                        </button>
                    </div>
                </div>

                <aside className="medicine-hero-card">
                    <span>Selected district</span>
                    <strong>
                        {districtName}
                    </strong>
                    <p>
                        {radiusKm
                            ? `Delivery from each contracted pharmacy within ${radiusKm} km of its own location.`
                            : 'Delivery coverage per pharmacy, from platform settings.'}
                    </p>
                </aside>
            </section>

            {/* API STATUS */}
            <div
                className={`medicine-api-status ${
                    isFromServer ? 'live' : 'demo'
                }`}
            >
                <span>
                    {isLoadingProducts ? (
                        <SkeletonStatus>Loading medicines…</SkeletonStatus>
                    ) : isFromServer ? (
                        'Database connected'
                    ) : (
                        'Server offline'
                    )}
                </span>
                <p>{productMessage}</p>
            </div>

            {/* COVERAGE MAP — real pharmacy locations from the database */}
            <section className="medicine-map-section">
                <div className="medicine-map-copy">
                    <span>Live coverage</span>
                    <h2>
                        Pharmacies in {districtName}
                    </h2>
                    <p>
                        Each contracted pharmacy is shown at its actual location with its own {radiusKm ?? '…'} km delivery radius, centred on that pharmacy.
                    </p>
                </div>

                <div className="medicine-map-frame">
                    <DeliveryMap
                        lat={selectedDistrict?.lat}
                        lon={selectedDistrict?.lon}
                        serviceType="medicine"
                        radiusKm={radiusKm}
                        markers={pharmacies.map((p) => ({
                            id: p.id,
                            name: p.name,
                            lat: p.latitude,
                            lon: p.longitude,
                            rating: p.rating,
                            address: p.location,
                        }))}
                        activeStoreId={selectedPharmacy?.id}
                        onSelectMarker={(p) => setSelectedPharmacy(pharmacies.find((x) => x.id === p.id) || null)}
                    />
                </div>
            </section>

            {/* PHARMACIES / PRODUCTS CONTAINER */}
            {!selectedPharmacy ? (
                /* PHARMACIES VIEW */
                <section className="pharmacy-container">
                    <div className="pharmacy-section-header">
                        <h2>Pharmacies in {districtName}</h2>
                        <p>Showing licensed healthcare dispensaries across {districtName}</p>
                    </div>

                    {isLoadingProducts ? (
                        <SkeletonGrid count={3} lines={3} className="pharmacy-skeleton-grid" />
                    ) : filteredPharmacies.length === 0 ? (
                        <div className="no-results">
                            <h3>No pharmacies found matching your search.</h3>
                            <p>Try searching for a different shop name or location.</p>
                        </div>
                    ) : (
                        <div className="pharmacy-grid aw-reveal-stagger">
                            {filteredPharmacies.map((pharmacy) => (
                                <article
                                    key={pharmacy.id}
                                    className="pharmacy-card-premium"
                                    onClick={() => setSelectedPharmacy(pharmacy)}
                                >
                                    <div className="pharmacy-card-decor" />
                                    <div className="pharmacy-card-body">
                                        <h3>{pharmacy.name}</h3>
                                        <p className="pharmacy-loc">
                                            {pharmacy.location}
                                        </p>
                                        <div className="pharmacy-rating-row">
                                            <span className="pharmacy-stars">
                                                <Icons.Star className="pharmacy-star-icon" />
                                                {pharmacy.rating}
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
                            <Icons.ArrowLeft className="medicine-nav-icon" /> Back to Pharmacies
                        </button>
                        <div className="selected-pharmacy-info">
                            <h2>{selectedPharmacy.name}</h2>
                            <p>
                                {selectedPharmacy.location} • <Icons.Star className="pharmacy-star-icon" /> {selectedPharmacy.rating} • {selectedPharmacy.deliveryType}
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
                                                    <Icons.Star className="pharmacy-star-icon" />
                                                    {product.rating}
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
                            <h2><Icons.Cart className="medicine-cart-icon" /> Your Prescription Order</h2>
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
                                        <Icons.ArrowRight className="medicine-nav-icon" /> Continue to Cart
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
