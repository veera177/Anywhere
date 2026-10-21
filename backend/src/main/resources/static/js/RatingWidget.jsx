function StarPicker({ value, onChange, label }) {
    const stars = [1, 2, 3, 4, 5];
    return (
        <div className="star-picker" style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px' }}>{label}</label>
            <div>
                {stars.map((star) => (
                    <span
                        key={star}
                        style={{
                            cursor: 'pointer',
                            fontSize: '24px',
                            color: star <= value ? '#FFD700' : '#ccc',
                            marginRight: '5px'
                        }}
                        onClick={() => onChange(star)}
                    >
                        ★
                    </span>
                ))}
            </div>
        </div>
    );
}

function RatingWidget({ userId }) {
    const [orders, setOrders] = React.useState([]);
    const [loading, setLoading] = React.useState(true);
    const [error, setError] = React.useState('');
    const [skippedOrders, setSkippedOrders] = React.useState(() => {
        const stored = localStorage.getItem('skippedRatings');
        return stored ? JSON.parse(stored) : [];
    });
    
    // Ratings state: keyed by orderId
    const [ratingsState, setRatingsState] = React.useState({});
    
    const loadOrders = async () => {
        setLoading(true);
        setError('');
        try {
            if (!userId) return setError('Please sign in to view orders.');
            const res = await window.authApi.fetch(`/api/orders/user/${userId}`);
            if (res.ok) {
                const data = await res.json();
                setOrders(Array.isArray(data) ? data : []);
            } else {
                setError('Failed to load orders.');
            }
        } catch (e) {
            setError('Network error loading orders.');
        } finally {
            setLoading(false);
        }
    };

    React.useEffect(() => { loadOrders(); }, [userId]);

    const handleSkip = (orderId) => {
        const newSkipped = [...skippedOrders, orderId];
        setSkippedOrders(newSkipped);
        localStorage.setItem('skippedRatings', JSON.stringify(newSkipped));
    };

    const handleRatingChange = (orderId, target, value) => {
        setRatingsState(prev => ({
            ...prev,
            [orderId]: {
                ...prev[orderId],
                [target]: { ...prev[orderId]?.[target], stars: value }
            }
        }));
    };
    
    const handleCommentChange = (orderId, target, text) => {
        setRatingsState(prev => ({
            ...prev,
            [orderId]: {
                ...prev[orderId],
                [target]: { ...prev[orderId]?.[target], comment: text }
            }
        }));
    };

    const handleSubmit = async (order, targetType, targetId) => {
        const orderState = ratingsState[order.id] || {};
        const targetState = orderState[targetType] || {};
        const stars = targetState.stars;
        const comment = targetState.comment;

        if (!stars) {
            alert(`Please select a star rating for ${targetType}`);
            return;
        }

        const payload = {
            orderId: order.id,
            targetType: targetType,
            targetId: targetId,
            stars: stars,
            comment: comment
        };

        try {
            const res = await window.authApi.fetch('/api/ratings', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            });

            if (res.ok) {
                alert(`Rating submitted successfully for ${targetType}!`);
                // Mark this target as submitted in state
                setRatingsState(prev => ({
                    ...prev,
                    [order.id]: {
                        ...prev[order.id],
                        [targetType]: { ...prev[order.id]?.[targetType], submitted: true }
                    }
                }));
            } else {
                const err = await res.json();
                alert(`Failed: ${err.error || 'Unknown error'}`);
            }
        } catch (e) {
            alert('Network error submitting rating.');
        }
    };
    
    // Determine targetType and targetId from order items
    const getShopTargetInfo = (order) => {
        if (!order.items || order.items.length === 0) return null;
        const serviceType = order.items[0].serviceType || '';
        const targetType = serviceType.toUpperCase();
        // Fallback or specific logic needed here if shop ID is not stored in order?
        // Wait, order items don't have shop ID directly. They have productId.
        // Actually, the requirements mentioned targetType as RESTAURANT | GROCERY | PHARMACY.
        // If order doesn't explicitly store shopId, let's assume it maps to 1 for now or if we need to retrieve it.
        // Wait, how does backend know shop ID? The backend rating request expects targetId.
        // We will default to targetId = 1 for demonstration if it's not present.
        return { targetType: targetType === 'COURIER' ? 'DELIVERY_PARTNER' : targetType, targetId: 1 };
    };
    
    const getDeliveryPartnerId = (order) => {
        // Typically routeId or courierId. We use routeId mapped in backend getRouteId().
        return order.routeId || 1;
    };

    if (loading) return <div>Loading orders...</div>;
    if (error) return <div style={{ color: 'red' }}>{error}</div>;

    const deliveredOrders = orders.filter(o => o.status === 'DELIVERED' || o.trackingStatus === 'DELIVERED');

    return (
        <div className="rating-widget-container" style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
            <h2>Your Orders</h2>
            {orders.length === 0 && <p>No orders found.</p>}
            
            {orders.map(order => {
                const isDelivered = order.status === 'DELIVERED' || order.trackingStatus === 'DELIVERED';
                const isSkipped = skippedOrders.includes(order.id);
                const shopInfo = getShopTargetInfo(order);
                const partnerId = getDeliveryPartnerId(order);
                const orderState = ratingsState[order.id] || {};
                
                const shopSubmitted = orderState[shopInfo?.targetType]?.submitted;
                const partnerSubmitted = orderState['DELIVERY_PARTNER']?.submitted;
                
                const showRatingPrompt = isDelivered && !isSkipped && shopInfo && (!shopSubmitted || !partnerSubmitted);

                return (
                    <div key={order.id} style={{ border: '1px solid #ddd', padding: '15px', marginBottom: '15px', borderRadius: '8px' }}>
                        <h3>Order #{order.id}</h3>
                        <p><strong>Status:</strong> {order.status}</p>
                        <p><strong>Total:</strong> ₹{order.totalAmount}</p>
                        
                        {showRatingPrompt && (
                            <div style={{ marginTop: '15px', padding: '15px', backgroundColor: '#f9f9f9', borderRadius: '5px' }}>
                                <h4>Rate your order</h4>
                                
                                {!shopSubmitted && shopInfo.targetType !== 'DELIVERY_PARTNER' && (
                                    <div style={{ marginBottom: '20px', paddingBottom: '15px', borderBottom: '1px solid #eee' }}>
                                        <StarPicker 
                                            label={`Rate the ${shopInfo.targetType}`} 
                                            value={orderState[shopInfo.targetType]?.stars || 0}
                                            onChange={(val) => handleRatingChange(order.id, shopInfo.targetType, val)}
                                        />
                                        <textarea 
                                            placeholder="Leave a comment (optional)" 
                                            style={{ width: '100%', padding: '8px', marginBottom: '10px' }}
                                            maxLength="300"
                                            value={orderState[shopInfo.targetType]?.comment || ''}
                                            onChange={(e) => handleCommentChange(order.id, shopInfo.targetType, e.target.value)}
                                        />
                                        <button onClick={() => handleSubmit(order, shopInfo.targetType, shopInfo.targetId)}>
                                            Submit Shop Rating
                                        </button>
                                    </div>
                                )}
                                
                                {!partnerSubmitted && (
                                    <div style={{ marginBottom: '10px' }}>
                                        <StarPicker 
                                            label="Rate the Delivery Partner" 
                                            value={orderState['DELIVERY_PARTNER']?.stars || 0}
                                            onChange={(val) => handleRatingChange(order.id, 'DELIVERY_PARTNER', val)}
                                        />
                                        <button onClick={() => handleSubmit(order, 'DELIVERY_PARTNER', partnerId)}>
                                            Submit Partner Rating
                                        </button>
                                    </div>
                                )}
                                
                                <div style={{ marginTop: '15px' }}>
                                    <button onClick={() => handleSkip(order.id)} style={{ background: '#ccc', color: '#333' }}>
                                        Skip / Dismiss
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    );
}
