import "./OrderSuccessBanner.css";

function OrderSuccessBanner({ show, userName, orderId, onClose }) {
    if (!show) return null;

    const name = userName || "there";

    return (
        <div className="order-success-banner" role="status">
            <div className="order-success-banner-inner">
                <div className="order-success-tick" aria-hidden="true">
                    <span className="order-success-tick-circle">
                        <span className="order-success-tick-mark">✓</span>
                    </span>
                </div>
                <div className="order-success-copy">
                    <strong>Order placed successfully!</strong>
                    <p>
                        {name}, your order{orderId ? ` #${orderId}` : ""} will arrive soon.
                    </p>
                </div>
                <button type="button" className="order-success-close" onClick={onClose} aria-label="Dismiss">
                    ×
                </button>
            </div>
        </div>
    );
}

export default OrderSuccessBanner;
