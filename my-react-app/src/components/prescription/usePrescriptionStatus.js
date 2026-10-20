import { useEffect, useState } from "react";
import { PRESCRIPTIONS_BASE } from "../../services/apiConfig";
import { apiFetchJson, errorLogger } from "../../services/apiClient";

export default function usePrescriptionStatus(id) {
    const [status, setStatus] = useState(null);
    useEffect(() => {
        if (!id) { setStatus(null); return undefined; }
        let stopped = false, timer;
        const check = async () => {
            try {
                const body = await apiFetchJson(`${PRESCRIPTIONS_BASE}/${id}/status`, {}, { retries: 0 });
                if (!stopped) setStatus(body);
                if (!stopped && !["VERIFIED", "REJECTED"].includes(body.status)) {
                    timer = setTimeout(check, 2000);
                }
            } catch (err) {
                errorLogger.warn("usePrescriptionStatus poll failed, will retry", {
                    error: err,
                    extra: { prescriptionId: id },
                });
                if (!stopped) {
                    timer = setTimeout(check, 2000);
                }
            }
        };
        check();
        return () => { stopped = true; clearTimeout(timer); };
    }, [id]);
    return status;
}
