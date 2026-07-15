import { useEffect, useMemo, useState } from "react";
import "./Orders.css";

const API_URL = "http://localhost:8080/api";
const STEPS = ["ORDER_PLACED", "RESTAURANT_ACCEPTED", "PREPARING", "OUT_FOR_DELIVERY", "DELIVERED"];
const LEGACY_STATUS = {
    PLACED: "ORDER_PLACED",
    CONFIRMED: "RESTAURANT_ACCEPTED",
    PENDING_CONFIRMATION: "ORDER_PLACED",
};

const normalizeStatus = (status = "ORDER_PLACED") => LEGACY_STATUS[status] || status;
const readable = (value = "PLACED") => value.replaceAll("_", " ").toLowerCase().replace(/\b\w/g, (l) => l.toUpperCase());

function Orders({ onBack, onTrackOrder, onSignInClick }) {
    const user = JSON.parse(localStorage.getItem("user"));
    const [orders, setOrders] = useState([]);
    const [payments, setPayments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [openTransactionId, setOpenTransactionId] = useState(null);

    useEffect(() => {
        if (!user?.id) {
            setLoading(false);
            return;
        }

        fetch(`${API_URL}/orders/user/${user.id}`)
            .then((response) => {
                if (!response.ok) throw new Error("Unable to load your orders.");
                return response.json();
            })
            .then(setOrders)
            .catch((exception) => setError(exception.message))
            .finally(() => setLoading(false));

        fetch(`${API_URL}/payment/history/${user.id}`)
            .then((response) => response.ok ? response.json() : [])
            .then(setPayments)
            .catch(() => setPayments([]));
    }, [user?.id]);

    const paymentByOrderId = useMemo(() => {
        return payments.reduce((map, payment) => {
            map[payment.orderId] = payment;
            return map;
        }, {});
    }, [payments]);

    return (
        <main className="orders-page">
            <nav className="orders-nav">
                <button onClick={onBack}>Back</button>
                <strong>Anywhere Orders</strong>
                <span>{orders.length} orders</span>
            </nav>

            <div className="orders-shell">
                <header className="orders-hero">
                    <span>Your deliveries</span>
                    <h1>Order history</h1>
                    <p>Track deliveries, view transaction details, and download invoices from each order.</p>
                </header>

                {!user?.id && (
                    <div className="orders-state orders-signin-state">
                        <h2>Sign in to view your orders</h2>
                        <p>Your order history, payment receipts, and live tracking will appear here.</p>
                        <button type="button" onClick={onSignInClick}>Sign In</button>
                    </div>
                )}

                {user?.id && loading && <div className="orders-state">Loading orders...</div>}
                {user?.id && error && <div className="orders-state error">{error}</div>}
                {user?.id && !loading && !error && !orders.length && <div className="orders-state">No orders yet.</div>}

                {user?.id && (
                    <div className="orders-list">
                        {orders.map((order) => {
                            const status = normalizeStatus(order.status);
                            const activeStep = STEPS.indexOf(status);
                            const payment = paymentByOrderId[order.id];
                            const isTransactionOpen = openTransactionId === order.id;

                            return (
                                <article className="order-row" key={order.id}>
                                    <div className="order-top">
                                        <div>
                                            <span>Order #{order.id}</span>
                                            <strong>{formatDate(order.orderedAt)}</strong>
                                        </div>
                                        <span className={`order-status status-${status.toLowerCase()}`}>
                                            <i></i>{readable(status)}
                                        </span>
                                    </div>

                                    <div className="order-body">
                                        <div className="order-products">
                                            {order.items.map((item) => (
                                                <p key={item.id}>
                                                    <span>{item.quantity} x {item.productName}</span>
                                                    <strong>Rs.{Number(item.subtotal).toFixed(2)}</strong>
                                                </p>
                                            ))}
                                        </div>
                                        <div className="order-meta">
                                            <span>Deliver to</span>
                                            <p>{order.deliveryAddress}</p>
                                            <span>Payment</span>
                                            <p>{readable(order.paymentMethod)}</p>
                                        </div>
                                    </div>

                                    {status !== "CANCELLED" && (
                                        <div className="order-track">
                                            {STEPS.map((step, index) => (
                                                <div className={index <= activeStep ? "done" : ""} key={step}>
                                                    <i></i>
                                                    <span>{readable(step)}</span>
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    {isTransactionOpen && (
                                        <div className="order-transaction-panel">
                                            <div>
                                                <span>Payment ID</span>
                                                <strong>{payment?.id || "Not available"}</strong>
                                            </div>
                                            <div>
                                                <span>Transaction ID</span>
                                                <strong>{payment?.transactionId || "Not generated"}</strong>
                                            </div>
                                            <div>
                                                <span>Method</span>
                                                <strong>{readable(payment?.paymentMethod || order.paymentMethod)}</strong>
                                            </div>
                                            <div>
                                                <span>Status</span>
                                                <strong className={`inline-payment-status payment-${payment?.paymentStatus?.toLowerCase()}`}>
                                                    {readable(payment?.paymentStatus || "PENDING")}
                                                </strong>
                                            </div>
                                            <div>
                                                <span>Paid time</span>
                                                <strong>{formatDate(payment?.paymentTime)}</strong>
                                            </div>
                                        </div>
                                    )}

                                    <div className="order-footer">
                                        <div className="order-total">
                                            <span>Total</span>
                                            <strong>Rs.{Number(order.totalAmount).toFixed(2)}</strong>
                                        </div>
                                        <div className="order-actions">
                                            {status !== "CANCELLED" && status !== "DELIVERED" && (
                                                <button className="order-track-btn" onClick={() => onTrackOrder(order.id)}>Track Order</button>
                                            )}
                                            <button
                                                className="order-transaction-btn"
                                                onClick={() => setOpenTransactionId(isTransactionOpen ? null : order.id)}
                                            >
                                                {isTransactionOpen ? "Hide Transaction" : "View Transaction"}
                                            </button>
                                            <button
                                                className="order-invoice-btn"
                                                onClick={() => downloadInvoicePdf(order, payment, user)}
                                            >
                                                Download Invoice PDF
                                            </button>
                                        </div>
                                    </div>
                                </article>
                            );
                        })}
                    </div>
                )}
            </div>
        </main>
    );
}

function formatDate(value) {
    if (!value) return "-";
    return new Date(value).toLocaleString();
}

function downloadInvoicePdf(order, payment, user) {
    const lines = [
        "ANYWHERE",
        "Payment Invoice",
        "",
        `Invoice No: INV-${order.id}`,
        `Order ID: ${order.id}`,
        `Customer: ${user?.fullName || user?.name || "Anywhere User"}`,
        `Order Date: ${formatDate(order.orderedAt)}`,
        `Delivery Address: ${order.deliveryAddress}`,
        "",
        "Items",
        ...order.items.map((item) => `${item.quantity} x ${item.productName} - Rs.${Number(item.subtotal).toFixed(2)}`),
        "",
        `Total Amount: Rs.${Number(order.totalAmount).toFixed(2)}`,
        `Payment Method: ${readable(payment?.paymentMethod || order.paymentMethod)}`,
        `Payment Status: ${readable(payment?.paymentStatus || "PENDING")}`,
        `Transaction ID: ${payment?.transactionId || "Not generated"}`,
        `Payment Time: ${formatDate(payment?.paymentTime)}`,
        "",
        "Thank you for ordering with Anywhere.",
    ];

    const pdf = createSimplePdf(lines);
    const blob = new Blob([pdf], { type: "application/pdf" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `anywhere-invoice-${order.id}.pdf`;
    link.click();
    URL.revokeObjectURL(url);
}

function createSimplePdf(lines) {
    const objects = [];
    const content = [
        "BT",
        "/F1 18 Tf",
        "50 790 Td",
        ...lines.flatMap((line, index) => [
            index === 0 ? "" : "0 -22 Td",
            `(${escapePdfText(line)}) Tj`,
        ]).filter(Boolean),
        "ET",
    ].join("\n");

    objects.push("<< /Type /Catalog /Pages 2 0 R >>");
    objects.push("<< /Type /Pages /Kids [3 0 R] /Count 1 >>");
    objects.push("<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>");
    objects.push("<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>");
    objects.push(`<< /Length ${content.length} >>\nstream\n${content}\nendstream`);

    let pdf = "%PDF-1.4\n";
    const offsets = [0];
    objects.forEach((object, index) => {
        offsets.push(pdf.length);
        pdf += `${index + 1} 0 obj\n${object}\nendobj\n`;
    });
    const xrefStart = pdf.length;
    pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
    offsets.slice(1).forEach((offset) => {
        pdf += `${String(offset).padStart(10, "0")} 00000 n \n`;
    });
    pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefStart}\n%%EOF`;
    return pdf;
}

function escapePdfText(value) {
    return String(value).replace(/\\/g, "\\\\").replace(/\(/g, "\\(").replace(/\)/g, "\\)");
}

export default Orders;
