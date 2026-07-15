import { useEffect, useState } from "react";
import "./Checkout.css";

const API_URL = "http://localhost:8080/api";

function Checkout({ items, onBack, onProceedToPayment }) {
    const user = JSON.parse(localStorage.getItem("user"));
    const [profileAddress, setProfileAddress] = useState(null);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState("");

    useEffect(() => {
        if (!user?.id) {
            setLoading(false);
            return;
        }

        fetch(`${API_URL}/users/${user.id}/profile`)
            .then((response) => {
                if (!response.ok) throw new Error("Address load failed");
                return response.json();
            })
            .then(setProfileAddress)
            .catch(() => setMessage("Unable to load your profile address."))
            .finally(() => setLoading(false));
    }, [user?.id]);

    const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

    const proceedToPayment = () => {
        if (!profileAddress?.addressLine || !profileAddress?.town || !profileAddress?.district) {
            setMessage("Please complete your delivery address in Profile before payment.");
            return;
        }

        onProceedToPayment({
            user,
            items,
            profileAddress,
            total,
        });
    };

    if (!user || !items.length) {
        return (
            <main className="checkout-page checkout-center">
                <h2>Your checkout session is empty</h2>
                <button onClick={onBack}>Return to cart</button>
            </main>
        );
    }

    return (
        <main className="checkout-page">
            <nav className="checkout-nav">
                <button onClick={onBack} aria-label="Back to cart">Back</button>
                <strong>Anywhere Checkout</strong>
                <span>Review before payment</span>
            </nav>

            <div className="checkout-shell">
                <section className="checkout-main">
                    <header>
                        <span>Final step</span>
                        <h1>Review your order</h1>
                    </header>

                    <div className="checkout-section">
                        <div className="checkout-heading">
                            <span className="checkout-number">1</span>
                            <div><h2>Delivery address</h2><p>Your profile address will be used for this order</p></div>
                        </div>

                        {loading ? <p>Loading profile address...</p> : (
                            <div className="address-options">
                                {profileAddress?.addressLine ? (
                                    <div className="profile-delivery-address">
                                        <span className="address-check">OK</span>
                                        <span>
                                            <strong>Profile delivery address</strong>
                                            <br />
                                            {profileAddress.addressLine}
                                            {profileAddress.landmark && `, Near ${profileAddress.landmark}`}
                                            {`, ${profileAddress.town || ""}, ${profileAddress.district || ""}`}
                                        </span>
                                        <small>Using your saved profile address</small>
                                    </div>
                                ) : (
                                    <p>No complete profile address found. Open Profile and add it first.</p>
                                )}
                            </div>
                        )}
                    </div>

                    <div className="checkout-section">
                        <div className="checkout-heading">
                            <span className="checkout-number">2</span>
                            <div><h2>Payment gateway</h2><p>Payment method will be selected on the secure payment page</p></div>
                        </div>
                        <div className="checkout-payment-preview">
                            <strong>Available methods</strong>
                            <span>Cash On Delivery</span>
                            <span>Razorpay Test Mode</span>
                            <span>UPI Ready</span>
                        </div>
                    </div>
                </section>

                <aside className="checkout-summary">
                    <h2>Order summary</h2>
                    <div className="checkout-items">
                        {items.map((item) => (
                            <div key={item.cartId}>
                                <span>{item.quantity} x {item.productName}</span>
                                <strong>Rs.{(item.price * item.quantity).toFixed(2)}</strong>
                            </div>
                        ))}
                    </div>
                    <div className="checkout-total"><span>Total</span><strong>Rs.{total.toFixed(2)}</strong></div>
                    {message && <p className="checkout-message">{message}</p>}
                    <button
                        className="place-order-btn"
                        onClick={proceedToPayment}
                        disabled={loading || !profileAddress?.addressLine}
                    >
                        <span className="place-order-icon">Pay</span>
                        <span><small>Secure payment gateway</small><strong>Continue to payment</strong></span>
                    </button>
                </aside>
            </div>
        </main>
    );
}

export default Checkout;
