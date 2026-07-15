import { useEffect, useState } from "react";
import "./Payment.css";

const API_URL = "http://localhost:8080/api";

function PaymentHistory({ onBack, onSignInClick }) {
    const user = JSON.parse(localStorage.getItem("user"));
    const [payments, setPayments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState("");

    useEffect(() => {
        if (!user?.id) {
            setLoading(false);
            return;
        }

        fetch(`${API_URL}/payment/history/${user.id}`)
            .then((response) => {
                if (!response.ok) throw new Error("Unable to load payment history");
                return response.json();
            })
            .then(setPayments)
            .catch((error) => setMessage(error.message))
            .finally(() => setLoading(false));
    }, [user?.id]);

    if (!user) {
        return (
            <main className="payment-page payment-center">
                <h2>Sign in to view payments</h2>
                <button onClick={onSignInClick}>Sign In</button>
            </main>
        );
    }

    return (
        <main className="payment-page">
            <nav className="payment-nav">
                <button onClick={onBack}>Back</button>
                <strong>Payment History</strong>
                <span>{user.fullName || user.name}</span>
            </nav>

            <section className="payment-history">
                <header>
                    <span>Receipts</span>
                    <h1>Your payments</h1>
                </header>

                {loading && <p>Loading payment history...</p>}
                {message && <p className="payment-message">{message}</p>}
                {!loading && payments.length === 0 && <p>No payments found yet.</p>}

                <div className="payment-history-list">
                    {payments.map((payment) => (
                        <article className="payment-history-card" key={payment.id}>
                            <div>
                                <span>Order #{payment.orderId}</span>
                                <h2>Rs.{Number(payment.amount || 0).toFixed(2)}</h2>
                            </div>
                            <div><small>Method</small><strong>{payment.paymentMethod}</strong></div>
                            <div><small>Transaction ID</small><strong>{payment.transactionId}</strong></div>
                            <div><small>Status</small><strong className={`status ${payment.paymentStatus?.toLowerCase()}`}>{payment.paymentStatus}</strong></div>
                            <div><small>Payment Date</small><strong>{formatDate(payment.paymentTime)}</strong></div>
                        </article>
                    ))}
                </div>
            </section>
        </main>
    );
}

function formatDate(value) {
    if (!value) return "-";
    return new Date(value).toLocaleString();
}

export default PaymentHistory;
