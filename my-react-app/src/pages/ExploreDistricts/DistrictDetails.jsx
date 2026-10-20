import { useEffect, useState } from "react";
import { getDistrictById, services } from "./districtData.js";
import "./ExploreDistricts.css";
import { RESTAURANTS_BASE, GROCERY_STORES_BASE, PHARMACIES_BASE } from "../../services/apiConfig";
import { apiFetchJson } from "../../services/apiClient";

const tabs = [
    { id: "restaurants", label: "Restaurants" },
    { id: "grocery", label: "Grocery Stores" },
    { id: "medical", label: "Pharmacies" },
    { id: "courier", label: "Courier Service" }
];

function DistrictDetails({ districtId, onBack, onBookCourier }) {
    const district = getDistrictById(districtId);
    const [activeTab, setActiveTab] = useState("restaurants");
    const [partners, setPartners] = useState({ restaurants: [], grocery: [], medical: [], courier: [] });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!district) return;
        let ignore = false;
        setLoading(true);

        Promise.all([
            apiFetchJson(`${RESTAURANTS_BASE}?district=${encodeURIComponent(district.name)}`).catch(() => []),
            apiFetchJson(`${GROCERY_STORES_BASE}?district=${encodeURIComponent(district.name)}`).catch(() => []),
            apiFetchJson(`${PHARMACIES_BASE}?district=${encodeURIComponent(district.name)}`).catch(() => [])
        ]).then(([restaurants, grocery, medical]) => {
            if (ignore) return;
            setPartners({
                restaurants: (restaurants || []).map((item, i) => ({ ...item, status: item.isActive === false ? "Closed" : "Open" })),
                grocery: (grocery || []).map((item, i) => ({ ...item, status: item.isActive === false ? "Closed" : "Open" })),
                medical: (medical || []).map((item, i) => ({ ...item, status: item.isActive === false ? "Closed" : "Open" })),
                courier: []
            });
        }).finally(() => {
            if (!ignore) setLoading(false);
        });

        return () => {
            ignore = true;
        };
    }, [districtId, district]);

    if (!district) {
        return (
            <main className="district-page district-empty">
                <h1>District not found</h1>
                <button onClick={onBack}>Back to districts</button>
            </main>
        );
    }

    const visiblePartners = partners[activeTab] || [];
    const activeService = services.find((service) => service.id === activeTab);

    return (
        <main className="district-page clean">
            <nav className="district-nav">
                <button onClick={onBack}>Back</button>
                <strong>{district.name}</strong>
                <span>{district.mainArea}</span>
            </nav>

            <section className="district-details-heading">
                <div>
                    <span>Local partner directory</span>
                    <h1>{district.name}</h1>
                    <p>{district.mainArea} is the main fulfilment area for this district.</p>
                </div>
                <p className="details-note">Each category shows the three contracted shops currently serving this district.</p>
            </section>

            <section className="district-filters detail-tabs">
                {tabs.map((tab) => (
                    <button key={tab.id} className={activeTab === tab.id ? "active" : ""} onClick={() => setActiveTab(tab.id)}>
                        {tab.label}
                    </button>
                ))}
            </section>

            {activeTab === "courier" ? (
                <section className="courier-detail-card">
                    <h2>Courier Service</h2>
                    <p>Available partners are assigned dynamically based on pickup location, route distance, rating, and current availability.</p>
                    <span>A partner is assigned after pickup and drop details are confirmed.</span>
                    <button onClick={onBookCourier}>Book Courier</button>
                </section>
            ) : loading ? (
                <section className="district-state">Loading partners...</section>
            ) : visiblePartners.length === 0 ? (
                <section className="district-state">No delivery partners or merchants are currently available in this district.</section>
            ) : (
                <section className="partner-card-grid">
                    {visiblePartners.map((partner) => (
                        <article className="shop-card" key={partner.name}>
                            <h2>{partner.name}</h2>
                            <p>{partner.location}</p>
                            <div>
                                <span>{partner.phone}</span>
                                <strong>{Number(partner.rating).toFixed(1)}</strong>
                            </div>
                            <small>{partner.status} · Contracted local partner</small>
                            <button>View Store</button>
                        </article>
                    ))}
                </section>
            )}

        </main>
    );
}

function normalizePartners(items, fallbackPartners, district, fallbackType) {
    const apiPartners = (items || []).map((item, index) => ({
        ...item,
        name: item.name || `${district.mainArea} ${fallbackType}`,
        phone: item.phone || `+91 98${String(76000000 + index * 137).slice(0, 8)}`,
        status: item.available === false ? "Closed" : "Open",
        distance: `${(2.4 + index * 1.7).toFixed(1)} km`,
        location: item.location || item.address || `${district.mainArea}, ${district.name}`,
        deliveryType: item.deliveryType || "Contracted partner"
    }));

    return [...apiPartners, ...fallbackPartners].slice(0, 3);
}

function readJson(response) {
    if (!response.ok) return [];
    return response.json();
}

export default DistrictDetails;
