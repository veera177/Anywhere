import "./PrescriptionVerification.css";
const STEPS = ["UPLOADED", "UNDER_REVIEW", "VERIFIED"];
export default function PrescriptionStatusStepper({ status }) {
    if (!status) return null;
    return <div className={`prescription-status ${status === "REJECTED" ? "rejected" : ""}`}>{status === "REJECTED" ? <strong>Prescription rejected</strong> : STEPS.map((step, index) => <span className={STEPS.indexOf(status) >= index ? "active" : ""} key={step}>{index + 1}. {step.replace("_", " ")}</span>)}</div>;
}
