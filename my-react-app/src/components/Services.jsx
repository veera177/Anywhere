import { useState } from 'react';
import './ServicesHome.css';

const servicesData = [
    {
        id: 'food',
        title: 'Gourmet Food Delivery',
        mark: '🍜',
        eyebrow: 'Fresh from nearby kitchens',
        desc: 'Craving something delicious? Order from your favorite local hotels, bakeries, and premium cafes. Fresh hot meals delivered to your doorstep in minutes.',
        link: 'www.anywhere.com/food'
    },
    {
        id: 'grocery',
        title: 'Premium Grocery Service',
        mark: '🥬',
        eyebrow: 'Daily essentials, on demand',
        desc: 'Keep your kitchen stocked without stepping out. Get daily farm-fresh groceries, organic vegetables, seasonal fruits, and household items delivered safely.',
        link: 'www.anywhere.com/grocery'
    },
    {
        id: 'medicine',
        title: 'Essential Medicine Dispatch',
        mark: '✚',
        eyebrow: 'Trusted neighbourhood care',
        desc: 'Your health is our priority. Get essential prescription and over-the-counter medicines delivered securely from nearby trusted pharmacies.',
        link: 'www.anywhere.com/pharmacy'
    },
    {
        id: 'courier',
        title: 'Secure Local Courier',
        mark: '▣',
        eyebrow: 'Door-to-door, tracked locally',
        desc: 'Need to send documents, keys, shop-to-customer parcels or gifts? Our reliable couriers ensure safe, fast, and prompt local transit.',
        link: 'www.anywhere.com/courier'
    }
];

function Services({ onFoodOpen, onGroceryOpen, onMedicineOpen, onCourierOpen }) {
    const [activeServiceId, setActiveServiceId] = useState(servicesData[0].id);

    const activeService = servicesData.find(s => s.id === activeServiceId) || servicesData[0];

    const openActiveService = () => {
        if (activeService.id === 'food' && onFoodOpen) {
            onFoodOpen();
        } else if (activeService.id === 'grocery' && onGroceryOpen) {
            onGroceryOpen();
        } else if (activeService.id === 'medicine' && onMedicineOpen) {
            onMedicineOpen();
        } else if (activeService.id === 'courier' && onCourierOpen) {
            onCourierOpen();
        }
    };

    return (
        <div className="services" id="services">
            <div className="services-heading"><span>ONE APP · EVERYDAY LOCAL DELIVERY</span><h1>Choose what you need.</h1><p>Simple, nearby and transparent from discovery to doorstep.</p></div>
            <ul className="services-grid aw-reveal-stagger">
                {servicesData.map((service) => (
                    <li 
                        key={service.id}
                        className={`service-card ${activeServiceId === service.id ? 'active' : ''}`}
                        onClick={() => setActiveServiceId(service.id)}
                        role="button"
                        aria-pressed={activeServiceId === service.id}
                        tabIndex={0}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                                setActiveServiceId(service.id);
                            }
                        }}
                    >
                        <span className={`service-icon service-icon--${service.id}`} aria-hidden="true">{service.mark}</span>
                        <span className="service-card-copy"><small>{service.eyebrow}</small><span className="service-title">{service.title}</span></span>
                        <span className="service-arrow" aria-hidden="true">↗</span>
                    </li>
                ))}
            </ul>

            {activeService && (
                <div className="service-details">
                    <span className="service-detail-kicker">SELECTED SERVICE</span><h2>{activeService.title}</h2>
                    <p>{activeService.desc}</p>
                    {activeService.id === 'food' && (
                        <button className="button1 service-open-btn" onClick={openActiveService}>
                            View Food Menu
                        </button>
                    )}
                    {activeService.id === 'grocery' && (
                        <button className="button1 service-open-btn" onClick={openActiveService}>
                            View Grocery Stores
                        </button>
                    )}
                    {activeService.id === 'medicine' && (
                        <button className="button1 service-open-btn" onClick={openActiveService}>
                            View Pharmacy Menu
                        </button>
                    )}
                    {activeService.id === 'courier' && (
                        <button className="button1 service-open-btn" onClick={openActiveService}>
                            Book Local Courier
                        </button>
                    )}
                </div>
            )}
        </div>
    );
}

export default Services;
