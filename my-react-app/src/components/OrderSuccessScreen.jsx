import { useEffect, useRef } from "react";
import "./OrderSuccessScreen.css";

/**
 * Reusable post-order success screen for ALL services.
 * Food/Grocery/Medicine: green thumbs-up + "Your order has been placed!",
 * auto-continues after ~1.8s.
 * Courier: same animation + assigned delivery partner details from the
 * existing partner assignment (session.assignedPartner / item.assignedPartner),
 * with a Continue button and slower (~3.5s) auto-continue.
 */
function OrderSuccessScreen({ orderId, serviceType, partner, routeId, autoDelayMs, onContinue }) {
    const isCourier = String(serviceType || "").toUpperCase() === "COURIER";
    const delay = autoDelayMs ?? (isCourier ? 3500 : 1800);
    const continuedRef = useRef(false);

    const goContinue = () => {
        if (continuedRef.current) return;
        continuedRef.current = true;
        onContinue?.();
    };

    useEffect(() => {
        const timer = setTimeout(goContinue, delay);
        return () => clearTimeout(timer);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [delay]);

    return (
        <main className="order-success-screen" role="status" aria-live="polite">
            <section className="order-success-card">
                <div className="order-success-thumb" aria-hidden="true">
                    <span className="order-success-thumb-circle">
                        <span className="order-success-thumb-icon">👍</span>
                    </span>
                </div>
                <h1>Your order has been placed!</h1>
                {orderId && <p className="order-success-id">Order #{orderId} is confirmed.</p>}
                {!orderId && <p className="order-success-id">Your order is confirmed.</p>}

                {isCourier && partner && (
                    <div className="order-success-partner">
                        <span className="order-success-partner-badge">Delivery partner assigned</span>
                        <strong>{partner.name || partner.fullName || `Partner #${partner.partnerId || ""}`}</strong>
                        {(partner.rating !== undefined && partner.rating !== null && partner.rating !== "") && (
                            <span className="order-success-partner-rating">⭐ {partner.rating}</span>
                        )}
                        {(partner.phone || partner.phoneNumber || partner.mobile) && (
                            <a
                                className="order-success-partner-phone"
                                href={`tel:${partner.phone || partner.phoneNumber || partner.mobile}`}
                            >
                                📞 {partner.phone || partner.phoneNumber || partner.mobile}
                            </a>
                        )}
                        {routeId && <small className="order-success-route">Route #{routeId}</small>}
                    </div>
                )}

                <button type="button" className="order-success-continue" onClick={goContinue}>
                    Continue
                </button>
                <small className="order-success-hint">
                    {isCourier ? "Taking you to your orders…" : "Taking you to your orders…"}
                </small>
            </section>
        </main>
    );
}

export default OrderSuccessScreen;
