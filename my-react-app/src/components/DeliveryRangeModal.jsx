import "./DeliveryRangeModal.css";

function DeliveryRangeModal({ open, radiusKm, onClose }) {
    if (!open) return null;

    return (
        <div
            className="range-modal-overlay"
            role="dialog"
            aria-modal="true"
            aria-labelledby="range-modal-title"
            aria-describedby="range-modal-message"
        >
            <div className="range-modal-card">
                <span className="range-modal-icon" aria-hidden="true">
                    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" width="26" height="26">
                        <circle cx="12" cy="12" r="9.5" stroke="currentColor" strokeWidth="1.8" />
                        <path d="M12 7.5v5.5" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" />
                        <circle cx="12" cy="16.2" r="1.1" fill="currentColor" />
                    </svg>
                </span>
                <h2 id="range-modal-title">Delivery Range Exceeded</h2>
                <p id="range-modal-message">
                    Your selected delivery distance is beyond our current {radiusKm} KM service range.
                    We're working on expanding to cover more areas soon. Sorry for the inconvenience!
                </p>
                <button type="button" className="range-modal-btn" onClick={onClose} autoFocus>
                    Choose Different Address
                </button>
            </div>
        </div>
    );
}

export default DeliveryRangeModal;