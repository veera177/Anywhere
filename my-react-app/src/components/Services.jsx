import { useState } from 'react';

const servicesData = [
    {
        id: 'food',
        title: 'Gourmet Food Delivery',
        icon: 'https://cdn-icons-png.flaticon.com/512/706/706164.png',
        desc: 'Craving something delicious? Order from your favorite local hotels, bakeries, and premium cafes. Fresh hot meals delivered to your doorstep in minutes.',
        link: 'www.anywhere.com/food'
    },
    {
        id: 'grocery',
        title: 'Premium Grocery Service',
        icon: 'https://cdn-icons-png.flaticon.com/512/3081/3081840.png',
        desc: 'Keep your kitchen stocked without stepping out. Get daily farm-fresh groceries, organic vegetables, seasonal fruits, and household items delivered safely.',
        link: 'www.anywhere.com/grocery'
    },
    {
        id: 'medicine',
        title: 'Essential Medicine Dispatch',
        icon: 'https://cdn-icons-png.flaticon.com/512/4320/4320350.png',
        desc: 'Your health is our priority. Get essential prescription and over-the-counter medicines delivered securely from nearby trusted pharmacies.',
        link: 'www.anywhere.com/pharmacy'
    },
    {
        id: 'courier',
        title: 'Secure Local Courier',
        icon: 'https://cdn-icons-png.flaticon.com/512/3144/3144350.png',
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
            <h1>Our Services</h1>
            <ul className="services-grid">
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
                        <img 
                            src={service.icon} 
                            alt={service.title} 
                            className="service-icon" 
                        />
                        <span className="service-title">{service.title}</span>
                    </li>
                ))}
            </ul>

            {activeService && (
                <div className="service-details">
                    <h2>{activeService.title}</h2>
                    <p>{activeService.desc}</p>
                    <div className="details-meta">
                        <span>🌐 Website: </span>
                        <a href={`https://${activeService.link}`} target="_blank" rel="noopener noreferrer" className="website">
                            {activeService.link}
                        </a>
                    </div>
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
