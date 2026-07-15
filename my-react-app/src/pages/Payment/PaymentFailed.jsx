import "./Payment.css";

function PaymentFailed({ failure, onRetry, onBackToCart }) {
    return (
        <main className="payment-page payment-result-page">
            <section className="payment-result-card failed">
                <div className="payment-result-icon">!</div>
                <span>Payment failed</span>
                <h1>We could not complete this payment</h1>
                <p>{failure?.message || "Please retry the payment or return to your cart."}</p>
                <div className="payment-result-actions">
                    <button onClick={onRetry}>Retry Failed Payment</button>
                    <button onClick={onBackToCart}>Back To Cart</button>
                </div>
            </section>
        </main>
    );
}

export default PaymentFailed;
