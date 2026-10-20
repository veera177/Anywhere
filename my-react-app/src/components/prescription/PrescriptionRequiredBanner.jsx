import "./PrescriptionVerification.css";

export default function PrescriptionRequiredBanner({ items = [] }) {
    return (
        <div className="prescription-required-banner" role="alert">
            <div className="prescription-banner-icon">Rx</div>
            <div><strong>Prescription required</strong><p>{items.map((item) => item.name).join(", ")} can be ordered after verification.</p></div>
        </div>
    );
}
