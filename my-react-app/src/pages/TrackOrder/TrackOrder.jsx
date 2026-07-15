import { useCallback, useEffect, useState } from "react";
import "./TrackOrder.css";
import OrderSuccessBanner from "../../components/OrderSuccessBanner.jsx";
const API_URL = "http://localhost:8080/api";

const STEPS = [
    "ORDER_PLACED",
    "RESTAURANT_ACCEPTED",
    "PREPARING",
    "OUT_FOR_DELIVERY",
    "DELIVERED",
];

const STEP_LABELS = {
    ORDER_PLACED: "Order Placed",
    RESTAURANT_ACCEPTED: "Restaurant Accepted",
    PREPARING: "Preparing",
    OUT_FOR_DELIVERY: "Out For Delivery",
    DELIVERED: "Delivered",
    CANCELLED: "Cancelled",
};

const COURIER_STEP_LABELS = {
    ORDER_PLACED: "Request Placed",
    RESTAURANT_ACCEPTED: "Pickup Assigned",
    PREPARING: "Parcel Collected",
    OUT_FOR_DELIVERY: "Out For Delivery",
    DELIVERED: "Delivered",
    CANCELLED: "Cancelled",
};

const LEGACY_STATUS_MAP = {
    PLACED: "ORDER_PLACED",
    CONFIRMED: "RESTAURANT_ACCEPTED",
};

const normalizeStatus = (status = "ORDER_PLACED") =>
    LEGACY_STATUS_MAP[status] || status;

const readableStatus = (status, isCourier = false) => {
    const labels = isCourier ? COURIER_STEP_LABELS : STEP_LABELS;
    return labels[normalizeStatus(status)] ||
        status.replaceAll("_", " ").toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());
};

const formatEta = (value) => {
    if (!value) return "Calculating...";
    return new Date(value).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
};

function TrackOrder({ orderId, onBack, onReorderComplete, justPlaced = false }) {
    const user = JSON.parse(localStorage.getItem("user"));
    const [tracking, setTracking] = useState(null);
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [actionLoading, setActionLoading] = useState(false);
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");
    const [showBanner, setShowBanner] = useState(justPlaced);
    const loadTracking = useCallback(async (isRefresh = false) => {
        if (!orderId) {
            setError("No order selected.");
            setLoading(false);
            return;
        }

        if (isRefresh) setRefreshing(true);
        else setLoading(true);

        setError("");

        try {
            const [trackingRes, orderRes] = await Promise.all([
                fetch(`${API_URL}/orders/track/${orderId}`),
                fetch(`${API_URL}/orders/${orderId}`),
            ]);

            if (!trackingRes.ok) throw new Error("Unable to load tracking details.");

            const trackingData = await trackingRes.json();
            setTracking(trackingData);

            if (orderRes.ok) {
                setOrder(await orderRes.json());
            }
        } catch (err) {
            setError(err.message || "Unable to load tracking details.");
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [orderId]);

    useEffect(() => {
        loadTracking();
    }, [loadTracking]);

    useEffect(() => {
        if (loading || error || !orderId) return undefined;
        const timer = setInterval(() => loadTracking(true), 12000);
        return () => clearInterval(timer);
    }, [loading, error, orderId, loadTracking]);

    const status = normalizeStatus(tracking?.trackingStatus);
    const isCourier = order?.items?.[0]?.serviceType === "COURIER";
    const stepLabels = isCourier ? COURIER_STEP_LABELS : STEP_LABELS;
    const activeStep = STEPS.indexOf(status);
    const canCancel = status === "ORDER_PLACED" || status === "RESTAURANT_ACCEPTED";
    const isDelivered = status === "DELIVERED";
    const isCancelled = status === "CANCELLED";

    const cancelOrder = async () => {
        if (!window.confirm("Cancel this order?")) return;

        setActionLoading(true);
        setMessage("");

        try {
            const response = await fetch(`${API_URL}/orders/status`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ orderId: Number(orderId), status: "CANCELLED" }),
            });

            const data = await response.json();
            if (!response.ok) throw new Error(data.error || "Cancellation failed.");

            setMessage("Order cancelled successfully.");
            await loadTracking(true);
        } catch (err) {
            setMessage(err.message);
        } finally {
            setActionLoading(false);
        }
    };

    const reorder = async () => {
        if (!user?.id || !order?.items?.length) {
            setMessage("Unable to reorder this order.");
            return;
        }

        setActionLoading(true);
        setMessage("");

        try {
            if (order.items.some((item) => item.serviceType === "COURIER")) {
                throw new Error("Courier orders must be booked again from the Courier page.");
            }

            for (const item of order.items) {
                const response = await fetch(`${API_URL}/cart/add`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        userId: user.id,
                        serviceType: item.serviceType,
                        productId: item.productId,
                        quantity: item.quantity,
                        productName: item.productName,
                        price: Number(item.price),
                    }),
                });

                const text = await response.text();
                if (!response.ok && !text.includes("Quantity Updated")) {
                    throw new Error(text || "Failed to add items to cart.");
                }
            }

            setMessage("Items added to cart. Redirecting...");
            setTimeout(() => onReorderComplete?.(), 800);
        } catch (err) {
            setMessage(err.message);
        } finally {
            setActionLoading(false);
        }
    };

    return (
        <main className="track-order-page">
            <OrderSuccessBanner
                show={showBanner}
                userName={user?.fullName}
                orderId={orderId}
                onClose={() => setShowBanner(false)}
            />

            <nav className="track-order-nav">                <button type="button" onClick={onBack}>Back</button>
                <strong>Anywhere Tracking</strong>
                <button
                    type="button"
                    className="track-refresh-btn"
                    onClick={() => loadTracking(true)}
                    disabled={refreshing || loading}
                >
                    {refreshing ? "Refreshing..." : "Refresh"}
                </button>
            </nav>

            <div className="track-order-shell">
                <header>
                    <span>Live tracking</span>
                    <h1>Track your order</h1>
                    <p>Follow your delivery from kitchen to doorstep.</p>
                </header>

                {loading && <div className="track-order-state">Loading tracking details...</div>}
                {error && <div className="track-order-state error">{error}</div>}

                {!loading && !error && tracking && (
                    <article className="track-order-card">
                        <div className="track-order-top">
                            <div>
                                <span>Order number</span>
                                <strong>Order #{tracking.orderId}</strong>
                            </div>
                            <span className={`track-status-badge status-${status.toLowerCase()}`}>
                                <i></i>
                                {readableStatus(status, isCourier)}
                            </span>
                        </div>

                        <div className="track-order-meta">
                            <div>
                                <span>Current status</span>
                                <strong>{readableStatus(status, isCourier)}</strong>
                            </div>
                            <div>
                                <span>Estimated delivery</span>
                                <strong>{formatEta(tracking.estimatedDeliveryTime)}</strong>
                            </div>
                        </div>

                        {!isCancelled && (
                            <div className="track-timeline track-timeline-live">
                                {STEPS.map((step, index) => {
                                    const done = activeStep >= 0 && index <= activeStep;
                                    const current = index === activeStep;
                                    return (
                                        <div
                                            className={`track-step ${done ? "done" : ""} ${current ? "current pulse" : ""}`}
                                            key={step}
                                        >
                                            <i>{done ? "✔" : "○"}</i>
                                            <span>{stepLabels[step]}</span>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                        {isCancelled && (
                            <div className="track-cancelled-banner">
                                This order was cancelled and will not be delivered.
                            </div>
                        )}

                        {order?.items?.length > 0 && (
                            <div className="track-order-items">
                                <span>Items in this order</span>
                                {order.items.map((item) => (
                                    <p key={item.id}>
                                        <span>{item.quantity} x {item.productName}</span>
                                        <strong>₹{Number(item.subtotal).toFixed(2)}</strong>
                                    </p>
                                ))}
                            </div>
                        )}

                        {message && <p className="track-order-message">{message}</p>}

                        <div className="track-order-actions">
                            {canCancel && (
                                <button
                                    type="button"
                                    className="track-cancel-btn"
                                    onClick={cancelOrder}
                                    disabled={actionLoading}
                                >
                                    Cancel order
                                </button>
                            )}
                            {isDelivered && !isCourier && (
                                <button
                                    type="button"
                                    className="track-reorder-btn"
                                    onClick={reorder}
                                    disabled={actionLoading}
                                >
                                    Order again
                                </button>
                            )}
                        </div>
                    </article>
                )}
            </div>
        </main>
    );
}

export default TrackOrder;
