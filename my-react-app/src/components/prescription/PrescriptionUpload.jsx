import { useState } from "react";
import "./PrescriptionVerification.css";
import { API_BASE } from "../../services/apiConfig";
import { apiFetch } from "../../services/apiClient";

const API_URL = API_BASE;

export default function PrescriptionUpload({ userId, prescriptionId, maxFileSizeMb = 5, onUploaded, onError }) {
    const [file, setFile] = useState(null);
    const [busy, setBusy] = useState(false);
    const submit = async () => {
        if (!file) return onError?.("Choose a prescription image or PDF first.");
        if (file.size > maxFileSizeMb * 1024 * 1024) return onError?.(`File must be smaller than ${maxFileSizeMb} MB.`);
        setBusy(true);
        try {
            const form = new FormData(); form.append("userId", userId); form.append("file", file);
            const url = prescriptionId ? `${API_URL}/prescriptions/${prescriptionId}/resubmit` : `${API_URL}/prescriptions/upload`;
            const response = await apiFetch(url, { method: "POST", body: form });
            const body = await response.json();
            onUploaded?.(body); setFile(null);
        } catch (error) { onError?.(error.message); } finally { setBusy(false); }
    };
    return <div className="prescription-upload"><div><strong>Upload prescription</strong><span>JPG, PNG or PDF · up to {maxFileSizeMb} MB</span></div><input type="file" accept="image/*,.pdf,application/pdf" onChange={(event) => setFile(event.target.files?.[0] || null)} /><button type="button" onClick={submit} disabled={!file || busy}>{busy ? "Uploading..." : "Upload for review"}</button></div>;
}
