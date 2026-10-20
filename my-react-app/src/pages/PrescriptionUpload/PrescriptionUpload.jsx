import { useState, useRef, useEffect } from 'react';
import { addItemToCart } from '../../utils/cartApi';
import { API_BASE } from '../../services/apiConfig';
import { apiFetch } from '../../services/apiClient';
import './PrescriptionUpload.css';

const API_URL = API_BASE;

export default function PrescriptionUpload({ onBack, onCheckout }) {
    const user = JSON.parse(localStorage.getItem('user'));

    // Form state
    const [medicineEntries, setMedicineEntries] = useState([{ name: '', quantity: '' }]);
    const [file, setFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);
    const [dragActive, setDragActive] = useState(false);
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Review state
    const [reviewPhase, setReviewPhase] = useState('form'); // 'form' | 'reviewing' | 'result'
    const [reviewText, setReviewText] = useState('');
    const [result, setResult] = useState(null); // { status, assignedPharmacyName, confirmedPrice, rejectionReason }
    const [prescriptionId, setPrescriptionId] = useState(null);

    const fileInputRef = useRef(null);
    const reviewTexts = [
        'Uploading prescription...',
        'Reviewing prescription details...',
        'Checking nearby pharmacy availability...',
    ];
    const textIndexRef = useRef(0);
    const intervalRef = useRef(null);

    useEffect(() => {
        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current);
            if (previewUrl) URL.revokeObjectURL(previewUrl);
        };
    }, [previewUrl]);

    // Dummy review timer: 5 seconds, then auto-approve
    useEffect(() => {
        if (!prescriptionId || reviewPhase !== 'reviewing') return;

        let stopped = false;
        
        // After 5 seconds, automatically approve and go to result screen
        const reviewTimer = setTimeout(() => {
            if (!stopped) {
                const primaryEntry = medicineEntries.find(e => e.name.trim()) || medicineEntries[0];
                const dummyResult = {
                    id: prescriptionId,
                    status: 'APPROVED',
                    medicineName: primaryEntry?.name || 'Prescribed Medicine',
                    quantity: primaryEntry?.quantity || '1',
                    assignedPharmacyName: 'Partner Pharmacy',
                    confirmedPrice: 299.99,  // Dummy price
                };
                setResult(dummyResult);
                setReviewPhase('result');
                if (intervalRef.current) clearInterval(intervalRef.current);
            }
        }, 5000);

        return () => { 
            stopped = true; 
            clearTimeout(reviewTimer); 
        };
    }, [prescriptionId, reviewPhase, medicineEntries]);

    // Rotating review text
    useEffect(() => {
        if (reviewPhase !== 'reviewing') return;
        setReviewText(reviewTexts[0]);
        intervalRef.current = setInterval(() => {
            textIndexRef.current = (textIndexRef.current + 1) % reviewTexts.length;
            setReviewText(reviewTexts[textIndexRef.current]);
        }, 3000);
        return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
    }, [reviewPhase]);

    // After approval: auto-navigate to checkout after 1.5s with prescription item
    useEffect(() => {
        if (reviewPhase !== 'result' || !result || result.status !== 'APPROVED' || !user?.id) return;

        let cancelled = false;
        const navigateTimer = setTimeout(async () => {
            if (!cancelled) {
                // Create prescription item for checkout
                const primaryEntry = medicineEntries.find(e => e.name.trim()) || medicineEntries[0];
                const prescriptionItem = {
                    id: `rx-${prescriptionId}`,
                    productId: prescriptionId,
                    serviceType: 'MEDICINE',
                    productName: result.medicineName || primaryEntry?.name || 'Prescription Medicine',
                    price: result.confirmedPrice || 299.99,
                    quantity: parseInt(primaryEntry?.quantity || '1'),
                    rating: 0,
                    imageUrl: '',
                    providerName: result.assignedPharmacyName || 'Partner Pharmacy',
                };
                console.log('[PrescriptionUpload] Dummy prescription approved, going to checkout with item:', prescriptionItem);
                onCheckout?.(prescriptionItem);
            }
        }, 1500); // 1.5s delay for smooth UX

        return () => { cancelled = true; clearTimeout(navigateTimer); };
    }, [reviewPhase, result, user, prescriptionId, medicineEntries, onCheckout]);

    /* ── Medicine Entry Handlers ── */
    const updateEntry = (index, field, value) => {
        setMedicineEntries(prev => prev.map((entry, i) => i === index ? { ...entry, [field]: value } : entry));
    };

    const addEntry = () => {
        if (medicineEntries.length < 5) {
            setMedicineEntries(prev => [...prev, { name: '', quantity: '' }]);
        }
    };

    const removeEntry = (index) => {
        if (medicineEntries.length > 1) {
            setMedicineEntries(prev => prev.filter((_, i) => i !== index));
        }
    };

    /* ── File Handlers ── */
    const handleDrag = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === 'dragenter' || e.type === 'dragover') setDragActive(true);
        else if (e.type === 'dragleave') setDragActive(false);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            validateAndSetFile(e.dataTransfer.files[0]);
        }
    };

    const handleFileInputChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            validateAndSetFile(e.target.files[0]);
        }
    };

    const validateAndSetFile = (selectedFile) => {
        setError('');
        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];
        if (!allowedTypes.includes(selectedFile.type)) {
            setError('Only JPG, JPEG, PNG, and PDF files are accepted.');
            return;
        }
        if (selectedFile.size > 5 * 1024 * 1024) {
            setError('Prescription file must be within 5 MB size limit.');
            return;
        }
        setFile(selectedFile);
        if (selectedFile.type.startsWith('image/')) {
            setPreviewUrl(URL.createObjectURL(selectedFile));
        } else {
            setPreviewUrl(null);
        }
    };

    const handleRemoveFile = () => {
        setFile(null);
        if (previewUrl) { URL.revokeObjectURL(previewUrl); setPreviewUrl(null); }
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    /* ── Form Validation ── */
    const isValid = () => {
        const hasMedicineName = medicineEntries.some(e => e.name.trim().length > 0);
        return hasMedicineName && file && !isSubmitting;
    };

    /* ── Submit ── */
    const handleSubmit = async () => {
        if (!isValid()) return;
        if (!user?.id) { setError('Please sign in to submit a prescription.'); return; }

        setIsSubmitting(true);
        setError('');

        // Submit the first medicine entry (primary request)
        const primaryEntry = medicineEntries.find(e => e.name.trim()) || medicineEntries[0];

        const formData = new FormData();
        formData.append('userId', user.id);
        formData.append('medicineName', primaryEntry.name.trim());
        if (primaryEntry.quantity.trim()) formData.append('quantity', primaryEntry.quantity.trim());
        formData.append('file', file);

        try {
            const response = await apiFetch(`${API_URL}/prescriptions/upload`, {
                method: 'POST',
                body: formData,
            });

            const data = await response.json();
            setPrescriptionId(data.id);
            setReviewPhase('reviewing');
        } catch (err) {
            setError(err.message);
            setIsSubmitting(false);
        }
    };

    /* ── RENDER: Form ── */
    if (reviewPhase === 'form') {
        return (
            <main className="rx-upload-page">
                <nav className="rx-nav">
                    <button onClick={onBack}>← Back to Medicine</button>
                    <strong>Anywhere — Prescription Request</strong>
                    <span className="rx-nav-badge">Secure Upload</span>
                </nav>

                <div className="rx-shell">
                    <section className="rx-main">
                        <header className="rx-hero">
                            <span className="rx-eyebrow">📄 Prescription Request</span>
                            <h1>Upload Prescription</h1>
                            <p>
                                Upload your doctor's prescription and we'll check
                                availability with our nearby partner pharmacies.
                            </p>
                        </header>

                        {/* Checklist */}
                        <div className="rx-section">
                            <div className="rx-heading">
                                <span className="rx-number">1</span>
                                <div>
                                    <h2>Prescription checklist</h2>
                                    <p>Ensure your prescription image includes the following</p>
                                </div>
                            </div>
                            <div className="rx-checklist">
                                <div className="rx-check-item"><span className="rx-check-icon">✓</span>Patient name</div>
                                <div className="rx-check-item"><span className="rx-check-icon">✓</span>Doctor's name/signature or stamp</div>
                                <div className="rx-check-item"><span className="rx-check-icon">✓</span>Prescription date</div>
                                <div className="rx-check-item"><span className="rx-check-icon">✓</span>Medicine name clearly visible</div>
                                <div className="rx-check-item"><span className="rx-check-icon">✓</span>Doctor registration number, if present</div>
                            </div>
                        </div>

                        {/* Medicine Name Input */}
                        <div className="rx-section">
                            <div className="rx-heading">
                                <span className="rx-number">2</span>
                                <div>
                                    <h2>Medicine name(s) on prescription</h2>
                                    <p>Enter the medicine name exactly as written on your prescription</p>
                                </div>
                            </div>
                            <div className="rx-medicine-entries">
                                {medicineEntries.map((entry, index) => (
                                    <div key={index} className="rx-entry-row">
                                        <div className="rx-entry-fields">
                                            <input
                                                type="text"
                                                placeholder="e.g. Paracetamol 650mg"
                                                value={entry.name}
                                                onChange={(e) => updateEntry(index, 'name', e.target.value)}
                                                className="rx-input"
                                            />
                                            <input
                                                type="text"
                                                placeholder="Qty (optional)"
                                                value={entry.quantity}
                                                onChange={(e) => updateEntry(index, 'quantity', e.target.value)}
                                                className="rx-input rx-input-small"
                                            />
                                        </div>
                                        {medicineEntries.length > 1 && (
                                            <button className="rx-remove-entry" onClick={() => removeEntry(index)}>✕</button>
                                        )}
                                    </div>
                                ))}
                            </div>
                            {medicineEntries.length < 5 && (
                                <button className="rx-add-entry" onClick={addEntry}>+ Add another medicine</button>
                            )}
                        </div>

                        {/* File Upload */}
                        <div className="rx-section">
                            <div className="rx-heading">
                                <span className="rx-number">3</span>
                                <div>
                                    <h2>Upload prescription file</h2>
                                    <p>JPG, JPEG, PNG, or PDF — maximum 5 MB</p>
                                </div>
                            </div>

                            <div
                                className={`rx-upload-area ${dragActive ? 'drag-active' : ''} ${file ? 'has-file' : ''}`}
                                onDragEnter={handleDrag}
                                onDragLeave={handleDrag}
                                onDragOver={handleDrag}
                                onDrop={handleDrop}
                                onClick={() => !file && fileInputRef.current?.click()}
                            >
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/jpeg,image/jpg,image/png,application/pdf"
                                    onChange={handleFileInputChange}
                                    style={{ display: 'none' }}
                                    disabled={isSubmitting}
                                />

                                {file ? (
                                    <div className="rx-file-preview">
                                        {previewUrl ? (
                                            <img src={previewUrl} alt="Prescription preview" />
                                        ) : (
                                            <div className="rx-pdf-indicator">
                                                <span>📄</span>
                                                <p>{file.name}</p>
                                                <small>{(file.size / 1024).toFixed(1)} KB</small>
                                            </div>
                                        )}
                                        <div className="rx-file-info">
                                            <span className="rx-file-name">{file.name}</span>
                                            <span className="rx-file-size">{(file.size / 1024).toFixed(1)} KB</span>
                                        </div>
                                        <div className="rx-file-actions">
                                            <button type="button" className="rx-btn-reupload" onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}>Re-upload</button>
                                            <button type="button" className="rx-btn-remove" onClick={(e) => { e.stopPropagation(); handleRemoveFile(); }}>Remove</button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="rx-upload-placeholder">
                                        <span className="rx-upload-icon">📁</span>
                                        <p>Drag & drop prescription image or PDF here</p>
                                        <small>or click to browse (max 5 MB)</small>
                                    </div>
                                )}
                            </div>
                        </div>

                        {error && <p className="rx-error">{error}</p>}

                        <button
                            className="rx-submit-btn"
                            onClick={handleSubmit}
                            disabled={!isValid()}
                        >
                            {isSubmitting ? 'Submitting...' : 'Submit Prescription'}
                        </button>
                    </section>

                    <aside className="rx-sidebar">
                        <div className="rx-info-card">
                            <h3>How it works</h3>
                            <ol>
                                <li>Upload your prescription image or PDF</li>
                                <li>Our partner pharmacy reviews it (~10 seconds)</li>
                                <li>If available, your medicine is confirmed with pricing</li>
                                <li>Add confirmed item to cart and checkout</li>
                            </ol>
                        </div>
                        <div className="rx-info-card rx-info-note">
                            <p>
                                <strong>Note:</strong> This is a simulated pharmacy review
                                for demonstration purposes. No real medical verification
                                or diagnosis is performed.
                            </p>
                        </div>
                    </aside>
                </div>
            </main>
        );
    }

    /* ── RENDER: Reviewing ── */
    if (reviewPhase === 'reviewing') {
        return (
            <main className="rx-upload-page rx-reviewing-page">
                <div className="rx-review-overlay">
                    <div className="rx-review-modal">
                        <div className="rx-review-animation">
                            <div className="rx-pulse-ring"></div>
                            <div className="rx-pulse-ring rx-delay-1"></div>
                            <div className="rx-pulse-ring rx-delay-2"></div>
                            <div className="rx-pharmacist-icon">👨‍⚕️</div>
                        </div>
                        <h2>Reviewing Prescription</h2>
                        <p className="rx-review-medicine">
                            <strong>{medicineEntries.find(e => e.name.trim())?.name}</strong>
                        </p>
                        <p className="rx-review-status">{reviewText}</p>
                        <div className="rx-progress">
                            <div className="rx-progress-bar">
                                <div className="rx-progress-fill"></div>
                            </div>
                            <span>Estimated: ~10 seconds</span>
                        </div>
                    </div>
                </div>
            </main>
        );
    }

    /* ── RENDER: Result ── */
    const isApproved = result?.status === 'APPROVED';
    const isRejected = result?.status === 'REJECTED';

    return (
        <main className="rx-upload-page rx-result-page">
            <div className="rx-review-overlay">
                <div className={`rx-result-modal ${isApproved ? 'approved' : 'rejected'}`}>
                    {isApproved ? (
                        <div className="rx-result-approved">
                            <div className="rx-success-animation">
                                <div className="rx-checkmark-circle">
                                    <svg viewBox="0 0 52 52" className="rx-checkmark-svg">
                                        <circle className="rx-check-circle-bg" cx="26" cy="26" r="25" fill="none" />
                                        <path className="rx-check-path" fill="none" d="M14 27l7 7 16-16" />
                                    </svg>
                                </div>
                            </div>
                            <h2>Prescription Request Confirmed!</h2>
                            <p className="rx-result-message">
                                Your requested medicine is available at <strong>{result.assignedPharmacyName}</strong>.
                            </p>
                            {result.confirmedPrice && (
                                <div className="rx-price-confirm">
                                    <span>Confirmed Price</span>
                                    <strong>₹{result.confirmedPrice}</strong>
                                </div>
                            )}
                            <p className="rx-redirect-hint">Adding to cart and redirecting to checkout...</p>
                            <div className="rx-result-actions">
                                <button className="rx-btn-go-cart" onClick={() => {
                                    const primaryEntry = medicineEntries.find(e => e.name.trim()) || medicineEntries[0];
                                    const prescriptionItem = {
                                        id: `rx-${prescriptionId}`,
                                        productId: prescriptionId,
                                        serviceType: 'MEDICINE',
                                        productName: result.medicineName || primaryEntry?.name || 'Prescription Medicine',
                                        price: result.confirmedPrice || 299.99,
                                        quantity: parseInt(primaryEntry?.quantity || '1'),
                                        rating: 0,
                                        imageUrl: '',
                                        providerName: result.assignedPharmacyName || 'Partner Pharmacy',
                                    };
                                    onCheckout?.(prescriptionItem);
                                }}>Go to Checkout →</button>
                                <button className="rx-btn-browse" onClick={onBack}>Back to Medicine</button>
                            </div>
                        </div>
                    ) : (
                        <div className="rx-result-rejected">
                            <div className="rx-shake-animation">
                                <div className="rx-error-icon">✕</div>
                            </div>
                            <h2>Medicine Currently Unavailable</h2>
                            <p className="rx-result-message">
                                Sorry, we could not find the requested medicine at our nearby partner pharmacies.
                            </p>
                            {result?.rejectionReason && (
                                <p className="rx-rejection-reason">{result.rejectionReason}</p>
                            )}
                            <div className="rx-result-actions">
                                <button className="rx-btn-browse" onClick={onBack}>Browse Medicines</button>
                                <button className="rx-btn-retry" onClick={() => {
                                    setReviewPhase('form');
                                    setResult(null);
                                    setPrescriptionId(null);
                                    setFile(null);
                                    setPreviewUrl(null);
                                    setIsSubmitting(false);
                                    setMedicineEntries([{ name: '', quantity: '' }]);
                                }}>Try Another Prescription</button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </main>
    );
}
