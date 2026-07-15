import { useEffect, useMemo, useState } from "react";
import "./Payment.css";

const API_URL = "http://localhost:8080/api";
const RAZORPAY_SCRIPT = "https://checkout.razorpay.com/v1/checkout.js";

function Payment({ session, onBack, onSuccess, onFailed }) {
    const [method, setMethod] = useState("CASH_ON_DELIVERY");
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");
    const [scriptReady, setScriptReady] = useState(Boolean(window.Razorpay));

    const items = session?.items || [];
    const user = session?.user;
    const address = session?.profileAddress;

    const subtotal = useMemo(
        () => items.reduce((sum, item) => sum + Number(item.price) * Number(item.quantity), 0),
        [items]
    );
    const deliveryCharges = subtotal > 0 ? 0 : 0;
    const grandTotal = subtotal + deliveryCharges;

    useEffect(() => {
        if (window.Razorpay) {
            setScriptReady(true);
            return;
        }

        const existing = document.querySelector(`script[src="${RAZORPAY_SCRIPT}"]`);
        if (existing) {
            existing.addEventListener("load", () => setScriptReady(true), { once: true });
            return;
        }

        const script = document.createElement("script");
        script.src = RAZORPAY_SCRIPT;
        script.async = true;
        script.onload = () => setScriptReady(true);
        script.onerror = () => setScriptReady(false);
        document.body.appendChild(script);
    }, []);

    const orderRequest = {
        userId: user?.id,
        deliveryAddress: addressText(address),
        paymentMethod: method,
        items: items.map((item) => ({
            productId: item.productId,
            serviceType: item.serviceType,
            productName: item.productName,
            price: item.price,
            quantity: item.quantity,
        })),
    };

    const completeCod = async () => {
        const response = await fetch(`${API_URL}/payment/cod`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ orderRequest, amount: grandTotal }),
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || "COD payment failed");
        onSuccess(data);
    };

    const verifyRazorpay = async (created, paymentId, signature) => {
        const response = await fetch(`${API_URL}/payment/verify`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                paymentId: created.payment.id,
                orderId: created.order.id,
                razorpayOrderId: created.razorpayOrderId,
                razorpayPaymentId: paymentId,
                razorpaySignature: signature,
            }),
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || "Payment verification failed");
        onSuccess(data);
    };

    const completeRazorpay = async () => {
        const response = await fetch(`${API_URL}/payment/create-order`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ orderRequest, amount: grandTotal }),
        });
        const created = await response.json();
        if (!response.ok) throw new Error(created.error || "Unable to create Razorpay order");

        const keyLooksReal = created.razorpayKeyId && !created.razorpayKeyId.includes("anywhere");
        if (scriptReady && window.Razorpay && keyLooksReal) {
            const checkout = new window.Razorpay({
                key: created.razorpayKeyId,
                amount: created.amountInPaise,
                currency: created.currency || "INR",
                name: "Anywhere",
                description: `Order #${created.order.id}`,
                order_id: created.razorpayOrderId,
                prefill: {
                    name: user?.fullName || user?.name || "Anywhere User",
                    email: user?.gmail || "",
                    contact: user?.phone || "",
                },
                theme: { color: "#ffd84d" },
                handler: (result) => {
                    verifyRazorpay(created, result.razorpay_payment_id, result.razorpay_signature)
                        .catch((error) => onFailed({ message: error.message, created }));
                },
                modal: {
                    ondismiss: () => onFailed({ message: "Payment cancelled", created }),
                },
            });
            checkout.open();
            return;
        }

        await verifyRazorpay(created, `pay_test_${created.payment.id}`, created.testSignature);
    };

    const proceed = async () => {
        if (!user?.id || items.length === 0) {
            setMessage("Your payment session is empty. Please return to cart.");
            return;
        }

        setLoading(true);
        setMessage("");
        try {
            if (method === "CASH_ON_DELIVERY") {
                await completeCod();
            } else if (method === "RAZORPAY") {
                await completeRazorpay();
            } else {
                setMessage("UPI will be connected in the next provider update. Please choose COD or Razorpay now.");
            }
        } catch (error) {
            onFailed({ message: error.message });
        } finally {
            setLoading(false);
        }
    };

    if (!session || !items.length) {
        return (
            <main className="payment-page payment-center">
                <h2>No payment session found</h2>
                <button onClick={onBack}>Return to checkout</button>
            </main>
        );
    }

    return (
        <main className="payment-page">
            <nav className="payment-nav">
                <button onClick={onBack}>Back</button>
                <strong>Anywhere Payment</strong>
                <span>Secure test checkout</span>
            </nav>

            <div className="payment-shell">
                <section className="payment-main">
                    <header className="payment-hero">
                        <span>Payment gateway</span>
                        <h1>Choose how you want to pay</h1>
                        <p>Review your order, confirm the delivery address, and complete payment.</p>
                    </header>

                    <section className="payment-card">
                        <div className="payment-card-title">
                            <span>1</span>
                            <div>
                                <h2>Delivery address</h2>
                                <p>{addressText(address)}</p>
                            </div>
                        </div>
                    </section>

                    <section className="payment-card">
                        <div className="payment-card-title">
                            <span>2</span>
                            <div>
                                <h2>Payment method</h2>
                                <p>Select one option to continue.</p>
                            </div>
                        </div>

                        <div className="payment-methods">
                            <PaymentOption
                                active={method === "CASH_ON_DELIVERY"}
                                title="Cash On Delivery"
                                note="Pay when the delivery partner reaches you."
                                onClick={() => setMethod("CASH_ON_DELIVERY")}
                            />
                            <PaymentOption
                                active={method === "RAZORPAY"}
                                title="Razorpay"
                                note="Card, wallet, net banking, and test-mode checkout."
                                onClick={() => setMethod("RAZORPAY")}
                            />
                            <PaymentOption
                                active={method === "UPI"}
                                title="UPI"
                                note="Ready for future provider integration."
                                onClick={() => setMethod("UPI")}
                            />
                        </div>
                    </section>
                </section>

                <aside className="payment-summary">
                    <h2>Order summary</h2>
                    <div className="payment-products">
                        {items.map((item) => (
                            <div key={item.cartId || `${item.serviceType}-${item.productId}`}>
                                <span>{item.quantity} x {item.productName}</span>
                                <strong>Rs.{(Number(item.price) * Number(item.quantity)).toFixed(2)}</strong>
                            </div>
                        ))}
                    </div>

                    <div className="payment-totals">
                        <div><span>Subtotal</span><strong>Rs.{subtotal.toFixed(2)}</strong></div>
                        <div><span>Delivery charges</span><strong>{deliveryCharges === 0 ? "Free" : `Rs.${deliveryCharges.toFixed(2)}`}</strong></div>
                        <div className="grand"><span>Grand total</span><strong>Rs.{grandTotal.toFixed(2)}</strong></div>
                    </div>

                    {message && <p className="payment-message">{message}</p>}
                    <button className="payment-pay-btn" onClick={proceed} disabled={loading}>
                        <span>{loading ? "Processing" : "Proceed To Pay"}</span>
                        <strong>{method === "CASH_ON_DELIVERY" ? "COD" : method}</strong>
                    </button>
                </aside>
            </div>
        </main>
    );
}

function PaymentOption({ active, title, note, onClick }) {
    return (
        <button type="button" className={`payment-option ${active ? "active" : ""}`} onClick={onClick}>
            <span className="payment-radio"></span>
            <span>
                <strong>{title}</strong>
                <small>{note}</small>
            </span>
        </button>
    );
}

function addressText(address) {
    if (!address) return "Profile delivery address";
    if (typeof address === "string") return address;
    if (address.addressLine?.startsWith("HUB:")) return address.addressLine;
    const parts = [
        address.addressLine,
        address.landmark ? `Near ${address.landmark}` : "",
        address.town,
        address.district,
    ].filter(Boolean);
    return parts.join(", ");
}

export default Payment;
