import { useEffect, useState, useRef } from 'react';
import {
    getRouteDetails,
    startRoute,
    completeRoute,
    getTotalDistance,
    calculateDeliveryFee,
    subscribeToRouteUpdates,
    formatDistance,
    formatDuration
} from '../services/courierTrackingService';
import './CourierTracking.css';

function CourierTracking({ routeId, onBack }) {
    const [route, setRoute] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [totalDistance, setTotalDistance] = useState(0);
    const [status, setStatus] = useState('PENDING');
    const [expandedLocation, setExpandedLocation] = useState(null);
    const unsubscribeRef = useRef(null);

    useEffect(() => {
        loadRoute();
    }, [routeId]);

    async function loadRoute() {
        try {
            setLoading(true);
            const data = await getRouteDetails(routeId);
            setRoute(data.route);
            setStatus(data.route.status);
            setTotalDistance(data.totalDistance);
            setError(null);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }

    // Subscribe to real-time updates
    useEffect(() => {
        if (!routeId) return;
        
        unsubscribeRef.current = subscribeToRouteUpdates(routeId, (data) => {
            setRoute(data.route);
            setStatus(data.route.status);
            setTotalDistance(data.totalDistance);
        });

        return () => {
            if (unsubscribeRef.current) {
                unsubscribeRef.current();
            }
        };
    }, [routeId]);

    async function handleStartRoute() {
        try {
            await startRoute(routeId);
            setStatus('IN_TRANSIT');
            loadRoute();
        } catch (err) {
            setError(err.message);
        }
    }

    async function handleCompleteRoute() {
        try {
            await completeRoute(routeId);
            setStatus('DELIVERED');
            loadRoute();
        } catch (err) {
            setError(err.message);
        }
    }

    if (loading) {
        return (
            <div className="courier-tracking-container">
                <div className="tracking-header">
                    <button onClick={onBack} className="back-btn">← Back</button>
                    <h2>Courier Tracking</h2>
                    <div></div>
                </div>
                <div className="tracking-loading">Loading route details...</div>
            </div>
        );
    }

    if (error || !route) {
        return (
            <div className="courier-tracking-container">
                <div className="tracking-header">
                    <button onClick={onBack} className="back-btn">← Back</button>
                    <h2>Courier Tracking</h2>
                    <div></div>
                </div>
                <div className="tracking-error">{error || 'Route not found'}</div>
            </div>
        );
    }

    return (
        <div className="courier-tracking-container">
            {/* Header */}
            <div className="tracking-header">
                <button onClick={onBack} className="back-btn">← Back</button>
                <h2>Courier Tracking - Route #{routeId}</h2>
                <span className={`status-badge ${status.toLowerCase()}`}>{status}</span>
            </div>

            {/* Route Summary */}
            <section className="tracking-summary">
                <div className="summary-card">
                    <span className="summary-label">Total Distance</span>
                    <span className="summary-value">{formatDistance(totalDistance)}</span>
                </div>
                <div className="summary-card">
                    <span className="summary-label">Estimated Duration</span>
                    <span className="summary-value">{formatDuration(route.estimatedDurationMinutes)}</span>
                </div>
                <div className="summary-card">
                    <span className="summary-label">Actual Duration</span>
                    <span className="summary-value">
                        {route.actualDurationMinutes ? formatDuration(route.actualDurationMinutes) : 'In Progress'}
                    </span>
                </div>
            </section>

            {/* Locations Map */}
            <section className="tracking-locations">
                <h3>Route Locations</h3>
                {route.mapUrl && (
                    <div className="map-container">
                        <a href={route.mapUrl} target="_blank" rel="noopener noreferrer" className="map-link">
                            View on Map →
                        </a>
                    </div>
                )}

                {/* Location List */}
                <div className="location-list">
                    {route.locationHistory && route.locationHistory.map((location, index) => (
                        <div 
                            key={location.id} 
                            className={`location-item ${location.status.toLowerCase()} ${location.locationType.toLowerCase()}`}
                        >
                            <div className="location-header" onClick={() => setExpandedLocation(expandedLocation === location.id ? null : location.id)}>
                                <div className="location-marker">
                                    <span className="marker-icon">
                                        {location.locationType === 'PICKUP' ? '📍' : '🎯'}
                                    </span>
                                    <span className="marker-label">{location.locationType}</span>
                                </div>
                                <div className="location-title">
                                    <h4>{location.locationName}</h4>
                                    <p className="location-status">{location.status}</p>
                                </div>
                                <div className="location-meta">
                                    {location.distanceFromPrevious && (
                                        <span className="distance">{formatDistance(location.distanceFromPrevious)}</span>
                                    )}
                                    <span className="chevron">▼</span>
                                </div>
                            </div>

                            {expandedLocation === location.id && (
                                <div className="location-details">
                                    <p><strong>Address:</strong> {location.address}</p>
                                    <p><strong>Contact:</strong> {location.contactName} ({location.contactPhone})</p>
                                    <p><strong>Coordinates:</strong> {location.latitude.toFixed(6)}, {location.longitude.toFixed(6)}</p>
                                    {location.arrivalTime && (
                                        <p><strong>Arrival Time:</strong> {new Date(location.arrivalTime).toLocaleString()}</p>
                                    )}
                                    {location.completionTime && (
                                        <p><strong>Completion Time:</strong> {new Date(location.completionTime).toLocaleString()}</p>
                                    )}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </section>

            {/* Actions */}
            <section className="tracking-actions">
                {status === 'PENDING' && (
                    <button onClick={handleStartRoute} className="action-btn start-btn">
                        Start Route
                    </button>
                )}
                {status === 'IN_TRANSIT' && (
                    <button onClick={handleCompleteRoute} className="action-btn complete-btn">
                        Complete Delivery
                    </button>
                )}
                {status === 'DELIVERED' && (
                    <div className="completed-message">
                        ✓ Delivery Completed Successfully
                    </div>
                )}
            </section>
        </div>
    );
}

export default CourierTracking;
