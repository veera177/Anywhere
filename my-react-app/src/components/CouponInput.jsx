import { useState, useEffect } from "react";
import { COUPONS_BASE } from "../services/apiConfig";
import { apiFetchJson, errorLogger } from "../services/apiClient";

export default function CouponInput({ 
    serviceType, 
    districtId, 
    tier, 
    productTotal, 
    deliveryFee, 
    userId,
    onApply, 
    onRemove 
}) {
    const [couponCode, setCouponCode] = useState("");
    const [appliedCoupon, setAppliedCoupon] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [availableCoupons, setAvailableCoupons] = useState([]);
    const [showAvailable, setShowAvailable] = useState(false);

    useEffect(() => {
        if (!serviceType) return;
        
        const url = `${COUPONS_BASE}/available?serviceType=${serviceType}&tier=${tier || "ALL"}${districtId ? `&districtId=${districtId}` : ""}`;
        apiFetchJson(url, {}, { retries: 1 })
            .then(coupons => setAvailableCoupons(Array.isArray(coupons) ? coupons : []))
            .catch((err) => {
                errorLogger.warn("CouponInput: failed to load available coupons", { error: err });
                setAvailableCoupons([]);
            });
    }, [serviceType, tier, districtId]);

    const handleApply = async () => {
        if (!couponCode.trim()) {
            setError("Please enter a coupon code");
            return;
        }

        setLoading(true);
        setError("");

        try {
            const result = await apiFetchJson(`${COUPONS_BASE}/validate`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    couponCode: couponCode.trim().toUpperCase(),
                    userId,
                    serviceType,
                    tier,
                    districtId,
                    productTotal: String(productTotal),
                    deliveryFee: String(deliveryFee || 0)
                })
            }, { retries: 1 });

            if (result.valid) {
                setAppliedCoupon({
                    code: result.couponCode,
                    discountAmount: Number(result.discountAmount),
                    discountType: result.discountType,
                    freeDelivery: result.freeDelivery,
                    message: result.message
                });
                setError("");
                onApply?.({
                    code: result.couponCode,
                    discountAmount: Number(result.discountAmount),
                    discountType: result.discountType,
                    freeDelivery: result.freeDelivery
                });
            } else {
                setError(result.message || "Invalid coupon code");
                setAppliedCoupon(null);
            }
        } catch (err) {
            errorLogger.error("CouponInput: validate coupon failed", { error: err });
            setError("Failed to validate coupon. Please try again.");
            setAppliedCoupon(null);
        } finally {
            setLoading(false);
        }
    };

    const handleRemove = () => {
        setAppliedCoupon(null);
        setCouponCode("");
        setError("");
        onRemove?.();
    };

    const handleSelectAvailable = (coupon) => {
        setCouponCode(coupon.code);
        setShowAvailable(false);
        setError("");
    };

    const formatDiscount = (coupon) => {
        switch (coupon.discountType) {
            case "FLAT":
                return `Flat ₹${coupon.discountValue} off`;
            case "PERCENTAGE":
                return `${coupon.discountValue}% off${coupon.maxDiscountAmount ? ` (max ₹${coupon.maxDiscountAmount})` : ""}`;
            case "FREE_DELIVERY":
                return "Free delivery";
            default:
                return `${coupon.discountValue} off`;
        }
    };

    return (
        <div className="coupon-input-section">
            <div className="coupon-header">
                <span className="coupon-icon">🎟️</span>
                <span>Have a coupon?</span>
            </div>

            {appliedCoupon ? (
                <div className="coupon-applied">
                    <div className="coupon-applied-info">
                        <span className="coupon-applied-badge">✓ Applied</span>
                        <span className="coupon-applied-code">{appliedCoupon.code}</span>
                        <span className="coupon-applied-discount">
                            {appliedCoupon.freeDelivery 
                                ? "Free delivery" 
                                : `-₹${appliedCoupon.discountAmount.toFixed(0)}`}
                        </span>
                    </div>
                    <button 
                        className="coupon-remove-btn" 
                        onClick={handleRemove}
                        type="button"
                    >
                        Remove
                    </button>
                </div>
            ) : (
                <div className="coupon-input-row">
                    <input
                        type="text"
                        className="coupon-input"
                        placeholder="Enter coupon code"
                        value={couponCode}
                        onChange={(e) => {
                            setCouponCode(e.target.value.toUpperCase());
                            setError("");
                        }}
                        onKeyPress={(e) => e.key === "Enter" && handleApply()}
                        disabled={loading}
                    />
                    <button
                        className="coupon-apply-btn"
                        onClick={handleApply}
                        disabled={loading || !couponCode.trim()}
                        type="button"
                    >
                        {loading ? "Checking..." : "Apply"}
                    </button>
                </div>
            )}

            {error && <p className="coupon-error">{error}</p>}

            {availableCoupons.length > 0 && !appliedCoupon && (
                <button
                    className="coupon-view-all"
                    onClick={() => setShowAvailable(!showAvailable)}
                    type="button"
                >
                    {showAvailable ? "Hide coupons" : `View ${availableCoupons.length} available coupon${availableCoupons.length > 1 ? "s" : ""}`}
                </button>
            )}

            {showAvailable && (
                <div className="coupon-list">
                    {availableCoupons.map((coupon) => (
                        <div
                            key={coupon.id}
                            className="coupon-card"
                            onClick={() => handleSelectAvailable(coupon)}
                            role="button"
                            tabIndex={0}
                        >
                            <div className="coupon-card-left">
                                <span className="coupon-card-code">{coupon.code}</span>
                                <span className="coupon-card-desc">{formatDiscount(coupon)}</span>
                            </div>
                            <div className="coupon-card-right">
                                <span className="coupon-card-apply">Apply →</span>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
