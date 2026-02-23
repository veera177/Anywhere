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

function Partner(){
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
        transform: isVisible ? 'translateX(0)' : 'translateX(100px)',
        transition: 'opacity 1s ease-out, transform 1s ease-out',
        maxWidth: '800px',
        margin: '0 auto',
        border: '2px solid black'
    };

    return(
        <div ref={ref} className="partner" id="partner" style={sectionStyle}>
            <style>{`
                @keyframes borderPulse {
                    0% { box-shadow: 0 0 0 0 rgba(0, 0, 0, 0.2); }
                    70% { box-shadow: 0 0 0 10px rgba(0, 0, 0, 0); }
                    100% { box-shadow: 0 0 0 0 rgba(0, 0, 0, 0); }
                }
                .partner:hover {
                    animation: borderPulse 2s infinite;
                }
                .partner-item {
                    transition: transform 0.3s ease;
                }
                .partner-item:hover {
                    transform: translateX(10px);
                    font-weight: 500;
                }
            `}</style>
            <img src="https://cdn-icons-png.flaticon.com/512/3135/3135715.png" alt="Partner Icon" style={{width: '60px', height: '60px', marginBottom: '20px'}} />
            <h2 style={{ marginBottom: '20px', fontWeight: '600', color: 'black', fontFamily: "'Poppins', sans-serif" }}>Partner With Us & Expand Your Reach</h2>
            <p style={{ marginBottom: '15px', fontSize: '1.1rem', color: '#555' }}>Take your business to new heights by partnering with GAP Delivery. We help you reach more local customers effortlessly.</p>
            <h3 style={{ fontSize: '1.2rem', marginBottom: '15px', color: '#555', fontFamily: "'Poppins', sans-serif" }}>Why Partner With Us?</h3>
            <ul style={{ listStyle: 'none', padding: 0, margin: '20px 0', fontSize: '1.05rem', lineHeight: '1.8' }}>
                <li className="partner-item">🚀 <strong>Boost Your Sales:</strong> Tap into a larger customer base and see your local orders grow.</li>
                <li className="partner-item">📦 <strong>Hassle-Free Logistics:</strong> Let us handle the delivery logistics while you focus on your business.</li>
                <li className="partner-item"><strong>Trusted Delivery Fleet:</strong> Our reliable and professional team ensures your products reach customers safely.</li>
                <li className="partner-item"><strong>Seamless Operations:</strong> Enjoy easy coordination and support for a smooth partnership experience.</li>
            </ul>
            <p style={{ marginTop: '20px', fontWeight: 'bold', color: 'black' }}>Ready to grow? Contact us today to become a partner: 84384 33220</p>
        </div>
    )
}
export default Partner;