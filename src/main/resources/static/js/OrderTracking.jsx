function OrderTracking() {
    const [orderId, setOrderId] = React.useState('');
    const [tracking, setTracking] = React.useState(null);
    const [notice, setNotice] = React.useState('');
    const poll = React.useCallback(async () => {
        if (!orderId) return;
        const response = await window.authApi.fetch(`/api/orders/track/${orderId}`);
        if (response.ok) setTracking(await response.json());
    }, [orderId]);
    React.useEffect(() => {
        if (!orderId || !window.authApi.isSignedIn()) return;
        let source; let fallback;
        const startPolling = () => { if (!fallback) { setNotice('Order status updates are reconnecting; checking every 10 seconds.'); fallback = setInterval(poll, 10000); poll(); } };
        source = new EventSource(`/api/orders/${orderId}/stream?access_token=${encodeURIComponent(window.authApi.token())}`);
        source.addEventListener('status', event => { setTracking(JSON.parse(event.data)); setNotice('Order status updates connected.'); if (fallback) { clearInterval(fallback); fallback = null; } });
        source.onerror = startPolling;
        return () => { source.close(); if (fallback) clearInterval(fallback); };
    }, [orderId, poll]);
    return <div className="courier-card"><h2>Order Tracking</h2><p className="courier-sub">Order status updates</p>
        <div className="action-row"><input className="form-control" value={orderId} onChange={e => setOrderId(e.target.value)} placeholder="Order ID" /><button className="btn btn-primary" onClick={poll}>Track</button></div>
        {notice && <p className="location-status-msg info">{notice}</p>}
        {tracking && <div className="fee-card"><p><strong>Status:</strong> {tracking.trackingStatus}</p><p><strong>Estimated delivery:</strong> {tracking.estimatedDeliveryTime || 'Pending'}</p><p>Live location not available yet</p></div>}
    </div>;
}
window.OrderTracking = OrderTracking;
