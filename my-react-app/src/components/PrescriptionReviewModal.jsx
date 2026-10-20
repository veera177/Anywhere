import { useState, useEffect, useRef } from 'react';
import './PrescriptionReviewModal.css';

export default function PrescriptionReviewModal({
  isOpen,
  onClose,
  medicineName,
  pharmacyName,
  status, // 'reviewing' | 'approved' | 'rejected'
  result, // { reassigned: boolean, pharmacyName: string, rejectionReason: string, alternatives: [] }
  onApproved, // callback when approved (to add to cart + navigate)
}) {
  const [phase, setPhase] = useState('reviewing'); // 'reviewing' | 'result'
  const [reviewText, setReviewText] = useState('');
  const reviewTexts = [
    'Uploading prescription...',
    'Verifying details...',
    'Checking medicine availability...',
  ];
  const textIndexRef = useRef(0);
  const intervalRef = useRef(null);
  const timeoutRef = useRef(null);

  useEffect(() => {
    if (!isOpen) {
      setPhase('reviewing');
      setReviewText('');
      textIndexRef.current = 0;
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      return;
    }

    // Start rotating review text every 3 seconds
    setReviewText(reviewTexts[0]);
    intervalRef.current = setInterval(() => {
      textIndexRef.current = (textIndexRef.current + 1) % reviewTexts.length;
      setReviewText(reviewTexts[textIndexRef.current]);
    }, 3000);

    // After 10 seconds, transition to result phase
    timeoutRef.current = setTimeout(() => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      setPhase('result');
      // Call onApproved callback if approved
      if (status === 'approved') {
        setTimeout(() => onApproved?.(result), 1500);
      }
    }, 10000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [isOpen, status, result, onApproved]);

  if (!isOpen) return null;

  const isApproved = status === 'approved';
  const isRejected = status === 'rejected';

  if (phase === 'reviewing') {
    return (
      <div className="prescription-modal-overlay">
        <div className="prescription-modal review-modal" role="dialog" aria-modal="true" aria-label="Prescription review in progress">
          <div className="review-animation">
            <div className="pulse-ring"></div>
            <div className="pulse-ring delay-1"></div>
            <div className="pulse-ring delay-2"></div>
            <div className="pharmacist-icon">👨‍⚕️</div>
          </div>
          <h2>Reviewing Prescription</h2>
          <p className="review-medicine">
            <strong>{medicineName}</strong> from <strong>{pharmacyName}</strong>
          </p>
          <p className="review-status-text">{reviewText}</p>
          <div className="review-progress">
            <div className="progress-bar">
              <div className="progress-fill"></div>
            </div>
            <span className="progress-label">Estimated: ~10 seconds</span>
          </div>
        </div>
      </div>
    );
  }

  // Result phase
  return (
    <div className="prescription-modal-overlay">
      <div className={`prescription-modal result-modal ${isApproved ? 'approved' : 'rejected'}`} role="dialog" aria-modal="true" aria-label={isApproved ? 'Prescription approved' : 'Prescription rejected'}>
        {isApproved ? (
          <div className="result-approved">
            <div className="success-animation">
              <div className="checkmark-circle">
                <svg viewBox="0 0 52 52" className="checkmark-svg">
                  <circle className="checkmark-circle-bg" cx="26" cy="26" r="25" fill="none" />
                  <path className="checkmark-path" fill="none" d="M14 27l7 7 16-16" />
                </svg>
              </div>
            </div>
            <h2>Prescription Confirmed!</h2>
            <p className="result-message">
              <strong>{medicineName}</strong> added to your cart.
            </p>
            {result?.reassigned && result?.pharmacyName && (
              <p className="reassigned-notice">
                📍 Available at <strong>{result.pharmacyName}</strong> nearby.
              </p>
            )}
            <p className="redirect-hint">Redirecting to checkout...</p>
          </div>
        ) : (
          <div className="result-rejected">
            <div className="shake-animation">
              <div className="error-icon">✕</div>
            </div>
            <h2>Prescription Not Approved</h2>
            <p className="result-message">
              Sorry, <strong>{medicineName}</strong> is currently unavailable at nearby pharmacies.
            </p>
            {result?.rejectionReason && (
              <p className="rejection-reason">{result.rejectionReason}</p>
            )}
            {result?.alternatives && result.alternatives.length > 0 && (
              <div className="alternatives-section">
                <h3>Similar alternatives available:</h3>
                <ul>
                  {result.alternatives.map((alt, i) => (
                    <li key={i}>{alt.name} ({alt.dosage}) — ₹{alt.price} at {alt.pharmacyName}</li>
                  ))}
                </ul>
              </div>
            )}
            <p className="browse-hint">Browse other medicines or try again later.</p>
            <div className="result-actions">
              <button className="btn-browse" onClick={onClose}>Browse Other Medicines</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}