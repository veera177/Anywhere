/* GAP DELIVERY

One Call, Everything Delivered! 🚚💨


---

Home

Fast. Reliable. Local.

GAP Delivery is your trusted local delivery partner. From food and groceries to medicines and daily essentials, we deliver everything you need—right to your doorstep.

📞 Call to Order: 84384 33220
🌐 Order Online: gaphere.com


---

About Us

GAP Delivery was started with a simple goal: make local deliveries fast, affordable, and dependable. We connect customers with nearby shops and ensure quick delivery at a low cost.

We support local businesses while giving customers the convenience of one-call ordering.

Why GAP Delivery?

Local area specialists

Affordable delivery charges

Friendly delivery team

Quick response & support



---

Our Services

🥗 Food Delivery

Order from your favorite local hotels, bakeries, and cafes.

🛒 Grocery Delivery

Daily groceries, vegetables, fruits, and household items.

💊 Medicine Delivery

Essential medicines delivered safely from nearby pharmacies.

📦 Local Courier

Documents, parcels, and shop-to-customer deliveries.


---

How It Works

1. Call us or place your order online


2. We pick up from the nearest shop


3. Our delivery partner reaches your doorstep



Simple. Fast. Reliable.


---

Delivery Charges

We follow a transparent pricing policy.

✅ We deliver at Dining Price and Store Price only
(No extra product markup)

Customers pay only the actual shop/restaurant price plus delivery charge.

📌 Exact delivery charges will be informed before order confirmation.


---

Partner With Us (For Shops & Sellers)

Grow your business with GAP Delivery.

Benefits:

Increased local orders

No delivery headache

Reliable delivery team

Easy coordination


📞 Contact us to partner: 84384 33220


---

Contact Us

📍 Service Area: Local & Nearby Locations
📞 Phone: 84384 33220
🌐 Website: gaphere.com

GAP Delivery – We Deliver @ Your Doorstep 💙*/
import { useEffect, useRef, useState } from 'react';

function Delivery(){
    const [isVisible, setIsVisible] = useState(false);
    const ref = useRef();

    useEffect(() => {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    setIsVisible(true);
                    observer.disconnect();
                }
            });
        });
        if (ref.current) observer.observe(ref.current);
        return () => observer.disconnect();
    }, []);

    const sectionStyle = {
        fontFamily: "'Poppins', sans-serif",
        padding: "40px",
        borderRadius: "15px",
        textAlign: "center",
        backgroundColor: "white",
        color: "black",
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? 'translateX(0)' : 'translateX(-100px)',
        transition: 'opacity 1s ease-out, transform 1s ease-out',
        maxWidth: '800px',
        margin: '0 auto',
        border: '2px solid black'
    };

    return(
        <div ref={ref} className="delivery" id="delivery" style={sectionStyle}>
            <style>{`
                @keyframes borderPulse {
                    0% { box-shadow: 0 0 0 0 rgba(0, 0, 0, 0.2); }
                    70% { box-shadow: 0 0 0 10px rgba(0, 0, 0, 0); }
                    100% { box-shadow: 0 0 0 0 rgba(0, 0, 0, 0); }
                }
                .delivery:hover {
                    animation: borderPulse 2s infinite;
                }
                .delivery-item {
                    transition: transform 0.3s ease, color 0.3s ease;
                }
                .delivery-item:hover {
                    transform: scale(1.02);
                    color: #000;
                }
            `}</style>
            <h2 style={{ marginBottom: '20px', fontWeight: '600', color: 'black', fontFamily: "'Poppins', sans-serif" }}>Transparent & Fair Delivery Rates</h2>
            <div className="delivery-content" style={{ fontSize: '1.1rem', lineHeight: '1.8', color: '#555' }}>
                <p style={{ marginBottom: '15px', color: '#555' }}><strong>We believe in complete honesty when it comes to pricing. No hidden costs, no surprises.</strong></p>
                <p>Our promise is simple: We charge exactly what the store charges. We strictly avoid adding any hidden markups to the items you order.</p>
                <ul style={{ listStyle: 'none', padding: 0, margin: '25px 0' }}>
                    <li className="delivery-item" style={{ marginBottom: '15px', padding: '10px', borderBottom: '1px dashed #ccc' }}>
                        <strong>Store Price Match Guarantee:</strong> You pay the exact amount printed on the store's bill.
                    </li>
                    <li className="delivery-item" style={{ padding: '10px' }}>
                        <strong>Reasonable Delivery Fee:</strong> We only charge a small, transparent fee for our delivery service.
                    </li>
                </ul>
                <p style={{ fontStyle: 'italic', marginTop: '20px', fontSize: '1rem', color: '#777' }}>Rest assured, we will calculate and display the exact delivery fee upfront before you confirm your order, so you know exactly what you are paying for.</p>
            </div>
        </div>
    )
}
export default Delivery;