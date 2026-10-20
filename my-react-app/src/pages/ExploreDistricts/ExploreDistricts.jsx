import { useEffect, useMemo, useState } from "react";
import { getDistricts } from "../../services/districts";
import "./ExploreDistricts.css";

const serviceFilters = [
    { id: "all", label: "All services" },
    { id: "food", label: "Food" },
    { id: "grocery", label: "Grocery" },
    { id: "medicine", label: "Medicine" },
    { id: "courier", label: "Courier" },
];

function ExploreDistricts({ onBack, onSelectDistrict }) {
    const [query, setQuery] = useState("");
    const [activeService, setActiveService] = useState("all");
    const [districts, setDistricts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [loadError, setLoadError] = useState(false);

    useEffect(() => {
        let active = true;
        getDistricts().then((rows) => {
            if (!active) return;
            setDistricts(Array.isArray(rows) ? rows : []);
            setLoadError(!Array.isArray(rows) || rows.length === 0);
            setLoading(false);
        }).catch(() => {
            if (active) { setLoadError(true); setLoading(false); }
        });
        return () => { active = false; };
    }, []);

    const visibleDistricts = useMemo(() => {
        const search = query.trim().toLowerCase();
        return districts.filter((district) => {
            const matchesSearch = !search || district.name.toLowerCase().includes(search) || String(district.code || "").toLowerCase().includes(search);
            const matchesService = activeService === "all" || (activeService === "courier" ? district.courierAvailable : Number(district.partnerCounts?.[activeService] || 0) > 0);
            return matchesSearch && matchesService;
        });
    }, [districts, query, activeService]);

    return (
        <main className="district-page clean">
            <nav className="district-nav">
                <button type="button" onClick={onBack}>Back</button>
                <strong>Explore Districts</strong>
                <span>{loading ? "Loading…" : `${visibleDistricts.length} service areas`}</span>
            </nav>
            <section className="district-selector" aria-label="District availability filters">
                <div className="selector-field">
                    <label htmlFor="district-search">Find a district</label>
                    <input id="district-search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search districts" autoComplete="off" />
                </div>
                <div className="selector-field">
                    <span>Filter by service</span>
                    <div className="district-filters">
                        {serviceFilters.map((service) => <button type="button" key={service.id} className={activeService === service.id ? "active" : ""} onClick={() => setActiveService(service.id)}>{service.label}</button>)}
                    </div>
                </div>
            </section>
            {loading ? <section className="district-state" role="status">Loading available districts…</section>
                : loadError ? <section className="district-state" role="alert">District availability could not be loaded. Check that the service is online, then try again.</section>
                : visibleDistricts.length === 0 ? <section className="district-state">No districts match this filter.</section>
                : <section className="district-table-card" aria-label="Available districts">
                    <div className="district-table-head"><span>District</span><span>Food</span><span>Grocery</span><span>Medicine</span><span>Courier</span><span>Choose</span></div>
                    {visibleDistricts.map((district) => <article className="district-row" key={district.id}>
                        <div className="district-name-cell"><strong>{highlightMatch(district.name, query)}</strong><small>{district.partnerCount || 0} active local partners</small></div>
                        <div>{district.partnerCounts?.food || 0}</div>
                        <div>{district.partnerCounts?.grocery || 0}</div>
                        <div>{district.partnerCounts?.medicine || 0}</div>
                        <div>{district.courierAvailable ? "Available" : "—"}</div>
                        <button type="button" onClick={() => onSelectDistrict?.(district)}>Select</button>
                    </article>)}
                </section>}
        </main>
    );
}

function highlightMatch(value, query) {
    const search = query.trim();
    const index = value.toLowerCase().indexOf(search.toLowerCase());
    if (!search || index < 0) return value;
    return <>{value.slice(0, index)}<mark>{value.slice(index, index + search.length)}</mark>{value.slice(index + search.length)}</>;
}

export default ExploreDistricts;
