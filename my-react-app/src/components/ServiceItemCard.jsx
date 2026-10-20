import { useState } from 'react';
import "./ServiceItemCard.css";
import PrescriptionUploadModal from './PrescriptionUploadModal';

export default function ServiceItemCard({ item, service, provider, meta, onAdd, onPrescriptionUpload }) {
    const soldOut = item.stock === 0;
    const requiresPrescription = service === 'MEDICINE' && item.requiresPrescription;
    const [showUploadModal, setShowUploadModal] = useState(false);

    const handleAdd = (product) => {
        if (requiresPrescription) {
            setShowUploadModal(true);
        } else {
            onAdd(product);
        }
    };

    return (
        <article className={`service-item-card service-item-card--${service.toLowerCase()} ${requiresPrescription ? 'prescription-required' : ''}`}>
            <div className="service-item-image">
                <img src={item.imageUrl} alt={item.name} />
                {item.offerTag && <span className="offer-tag">{item.offerTag}</span>}
                {requiresPrescription && <span className="prescription-badge required">Prescription Required</span>}
                {!requiresPrescription && service === 'MEDICINE' && <span className="prescription-badge otc">No Prescription Needed</span>}
            </div>
            <div className="service-item-body">
                <div className="service-item-heading">
                    <div><p>{provider}</p><h2>{item.name}</h2><small>{item.category}</small></div>
                    <b>⭐ {item.rating}</b>
                </div>
                <p className="service-item-description">{item.description}</p>
                <div className="service-item-meta"><span>{meta}</span>{item.stock > 0 && item.stock <= 5 && <em>Only {item.stock} left</em>}</div>
                <div className="service-item-footer">
                    <strong>₹{item.price}</strong>
                    <button disabled={soldOut} onClick={() => handleAdd(item)}>
                        {soldOut ? "Out of stock" : requiresPrescription ? "Upload Rx" : "+ Add"}
                    </button>
                </div>
            </div>

            <PrescriptionUploadModal
                isOpen={showUploadModal}
                onClose={() => setShowUploadModal(false)}
                onSubmit={(file) => onPrescriptionUpload?.(item, file)}
                medicineName={item.name}
                pharmacyName={provider}
                isLoading={false}
            />
        </article>
    );
}