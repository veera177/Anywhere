import { useEffect, useRef, useState } from "react";
import "./CourierSuccessScreen.css";

/**
 * CourierSuccessScreen
 *
 * Sequence:
 *  0 → thumbs-up badge scales in (bounce) + confetti burst (CSS only)
 *  1 → "Finding your delivery partner…" radar pulse (~2 s)
 *  2 → partner card slides up
 *  3 → if no partner yet, poll every 4 s
 *
 * Props:
 *  bookingId      – order / booking ID string
 *  session        – full payment session (has items[0].assignedPartner or assignedPartner)
 *  onDone         – called only when user taps "Done" (navigates to Orders)
 *  onTrackOrder   – called when user taps "Track delivery"
 */
function CourierSuccessScreen({ bookingId, session, onDone, onTrackOrder }) {
  /* ── Resolve partner from session ── */
  const resolvePartner = (s) =>
    s?.assignedPartner ||
    s?.items?.[0]?.assignedPartner ||
    null;

  const [phase, setPhase] = useState("confirmed"); // confirmed | finding | partner | waiting
  const [partner, setPartner] = useState(() => resolvePartner(session));
  const pollRef   = useRef(null);
  const phaseRef  = useRef("confirmed");

  const setPhaseSync = (p) => { phaseRef.current = p; setPhase(p); };

  /* ── Sequence on mount ── */
  useEffect(() => {
    // After 1.4 s show "finding partner"
    const t1 = setTimeout(() => {
      setPhaseSync("finding");

      // After 2 s show partner card (or waiting)
      const t2 = setTimeout(() => {
        const p = resolvePartner(session);
        if (p) {
          setPartner(p);
          setPhaseSync("partner");
        } else {
          setPhaseSync("waiting");
          startPolling();
        }
      }, 2000);

      return () => clearTimeout(t2);
    }, 1400);

    return () => {
      clearTimeout(t1);
      stopPolling();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ── Polling for partner assignment ── */
  const startPolling = () => {
    pollRef.current = setInterval(async () => {
      if (phaseRef.current !== "waiting") { stopPolling(); return; }
      // Re-read partner from session (session object may have been mutated by Payment)
      const p = resolvePartner(session);
      if (p) {
        stopPolling();
        setPartner(p);
        setPhaseSync("partner");
      }
    }, 4000);
  };

  const stopPolling = () => {
    if (pollRef.current) { clearInterval(pollRef.current); pollRef.current = null; }
  };

  /* ── Confetti particles (CSS-only, 12 pieces) ── */
  const confetti = Array.from({ length: 12 }, (_, i) => (
    <span
      key={i}
      className="ccs-confetti-piece"
      style={{
        "--i":     i,
        "--hue":   `${(i * 30) % 360}deg`,
        "--dx":    `${Math.cos((i / 12) * Math.PI * 2) * 90}px`,
        "--dy":    `${-60 - Math.random() * 60}px`,
        "--delay": `${i * 40}ms`,
      }}
    />
  ));

  return (
    <div className="ccs-overlay" role="status" aria-live="polite">
      <section className="ccs-card">

        {/* ── Phase: confirmed – thumbs-up + confetti ── */}
        {(phase === "confirmed" || phase === "finding" || phase === "partner" || phase === "waiting") && (
          <div className="ccs-badge-wrap">
            <div className="ccs-ring" aria-hidden="true" />
            <div className="ccs-thumb-circle" aria-hidden="true">
              <span className="ccs-thumb-icon">👍</span>
            </div>
            <div className="ccs-confetti" aria-hidden="true">{confetti}</div>
          </div>
        )}

        <h1 className="ccs-title">Booking confirmed!</h1>
        {bookingId && (
          <p className="ccs-booking-id">Booking #{bookingId}</p>
        )}

        {/* ── Phase: finding partner ── */}
        {phase === "finding" && (
          <div className="ccs-finding">
            <div className="ccs-radar" aria-label="Finding partner">
              <span className="ccs-radar-ring r1" />
              <span className="ccs-radar-ring r2" />
              <span className="ccs-radar-ring r3" />
              <span className="ccs-radar-dot">🛵</span>
            </div>
            <p className="ccs-finding-text">Finding your delivery partner…</p>
          </div>
        )}

        {/* ── Phase: waiting (no partner yet) ── */}
        {phase === "waiting" && (
          <div className="ccs-waiting">
            <div className="ccs-radar">
              <span className="ccs-radar-ring r1" />
              <span className="ccs-radar-ring r2" />
              <span className="ccs-radar-ring r3" />
              <span className="ccs-radar-dot">🛵</span>
            </div>
            <p className="ccs-finding-text">Assigning a delivery partner…</p>
            <p className="ccs-waiting-sub">This usually takes a moment. We'll show their details as soon as one is assigned.</p>
          </div>
        )}

        {/* ── Phase: partner card ── */}
        {phase === "partner" && partner && (
          <div className="ccs-partner-card">
            <div className="ccs-partner-avatar">
              {partner.photo ? (
                <img src={partner.photo} alt={partner.name || "Partner"} className="ccs-partner-photo" />
              ) : (
                <span className="ccs-partner-initials">
                  {(partner.name || partner.fullName || "P").charAt(0).toUpperCase()}
                </span>
              )}
            </div>

            <div className="ccs-partner-info">
              <div className="ccs-partner-assigned-label">Your delivery partner</div>
              <div className="ccs-partner-name">
                {partner.name || partner.fullName || `Partner #${partner.partnerId || ""}`}
              </div>

              <div className="ccs-partner-meta">
                {(partner.rating !== undefined && partner.rating !== null && String(partner.rating) !== "") && (
                  <span className="ccs-partner-rating">⭐ {partner.rating}</span>
                )}
                {partner.vehicleType && (
                  <span className="ccs-partner-vehicle">🛵 {partner.vehicleType}</span>
                )}
                {partner.estimatedPickupTime && (
                  <span className="ccs-partner-eta">⏱ {partner.estimatedPickupTime} min to pickup</span>
                )}
              </div>

              {(partner.phone || partner.phoneNumber || partner.mobile) && (
                <a
                  href={`tel:${partner.phone || partner.phoneNumber || partner.mobile}`}
                  className="ccs-partner-phone"
                  aria-label="Call delivery partner"
                >
                  📞 {partner.phone || partner.phoneNumber || partner.mobile}
                </a>
              )}
            </div>
          </div>
        )}

        {/* ── Phase: partner not assigned fallback ── */}
        {phase === "partner" && !partner && (
          <div className="ccs-no-partner">
            <p>Your booking is confirmed. A delivery partner will be assigned shortly.</p>
            <p className="ccs-no-partner-sub">Check your orders page for live updates.</p>
          </div>
        )}

        {/* ── Action buttons ── */}
        <div className="ccs-actions">
          {onTrackOrder && (
            <button
              type="button"
              className="ccs-btn ccs-btn-track"
              onClick={() => onTrackOrder(bookingId)}
            >
              📍 Track delivery
            </button>
          )}
          <button
            type="button"
            className="ccs-btn ccs-btn-done"
            onClick={onDone}
          >
            Done
          </button>
        </div>

      </section>
    </div>
  );
}

export default CourierSuccessScreen;
