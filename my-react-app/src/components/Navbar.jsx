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
function Navbar({ onSignInClick }) {
    const handleScroll = (e, id) => {
        e.preventDefault();
        const element = document.getElementById(id);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
        }
    };

    return (
        <nav className="navbar">
            <div className="nav-logo">
                <h1 id="title">Anywhere</h1>
            </div>
            <ul className="nav-links">
                <li><a href="#contact-us" onClick={(e) => handleScroll(e, "contact-us")}>Contact Us</a></li>
                <li><a href="#services" onClick={(e) => handleScroll(e, "services")}>Services</a></li>
                <li><a href="#delivery" onClick={(e) => handleScroll(e, "delivery")}>Delivery</a></li>
                <li><a href="#partner" onClick={(e) => handleScroll(e, "partner")}>Partner</a></li>
            </ul>
            <div className="nav-controls">
                <button className="button1" onClick={onSignInClick}>Sign In</button>
            </div>
        </nav>
    )
}
export default Navbar;