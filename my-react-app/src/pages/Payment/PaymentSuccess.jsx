import "./Payment.css";

function PaymentSuccess({ result, onTrackOrder, onHistory, onHome }) {
    const order = result?.order;
    const payment = result?.payment;

    const downloadInvoice = () => {
        const text = [
            "Anywhere Payment Receipt",
            `Order ID: ${order?.id || "-"}`,
            `Payment ID: ${payment?.id || "-"}`,
            `Method: ${payment?.paymentMethod || "-"}`,
            `Status: ${payment?.paymentStatus || "-"}`,
            `Amount: Rs.${Number(payment?.amount || 0).toFixed(2)}`,
            `Transaction ID: ${payment?.transactionId || "-"}`,
        ].join("\n");
        const blob = new Blob([text], { type: "text/plain" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `anywhere-invoice-${order?.id || "payment"}.txt`;
        link.click();
        URL.revokeObjectURL(url);
    };

    return (
        <main className="payment-page payment-result-page">
            <section className="payment-result-card success">
                <div className="payment-result-icon">OK</div>
                <span>Payment completed</span>
                <h1>Order #{order?.id} is confirmed</h1>
                <p>Your payment record has been saved and your order is ready for tracking.</p>

                <div className="payment-receipt">
                    <div><span>Amount</span><strong>Rs.{Number(payment?.amount || 0).toFixed(2)}</strong></div>
                    <div><span>Method</span><strong>{payment?.paymentMethod}</strong></div>
                    <div><span>Status</span><strong>{payment?.paymentStatus}</strong></div>
                    <div><span>Transaction</span><strong>{payment?.transactionId}</strong></div>
                </div>

                <div className="payment-result-actions">
                    <button onClick={() => onTrackOrder(order?.id)}>Track Order</button>
                    <button onClick={downloadInvoice}>Download Invoice</button>
                    <button onClick={onHistory}>Payment History</button>
                    <button onClick={onHome}>Home</button>
                </div>
            </section>
        </main>
    );
}

export default PaymentSuccess;
