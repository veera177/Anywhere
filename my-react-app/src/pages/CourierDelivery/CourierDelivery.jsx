import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import AddressAutocomplete from '../../components/AddressAutocomplete.jsx';
import MapPreview from '../../components/MapPreview.jsx';
import { getDistricts, resolvePreferredDistrictId } from '../../services/districts.js';
import { getDistanceKm } from '../../services/distanceService.js';
import { DELIVERY_FEE_PREVIEW_URL } from '../../services/apiConfig.js';
import { apiFetchJson, getSignedInUser } from '../../services/apiClient.js';
import './CourierDelivery.css';

/* ── Parcel types (Step 2) ── */
const PARCEL_TYPES = [
  { id: 'document', icon: '📄', label: 'Document',   hint: 'Letters, files, contracts' },
  { id: 'parcel',   icon: '📦', label: 'Parcel',     hint: 'Clothing, shoes, gifts'    },
  { id: 'food',     icon: '🍱', label: 'Food box',   hint: 'Tiffin, packed meals'       },
  { id: 'other',    icon: '🗂️', label: 'Other',      hint: 'Anything else'              },
];

const STEPS = ['Addresses', 'Parcel', 'Quote', 'Confirm'];

/* ── Validation helpers ── */
const isValidPhone = (v) => /^\d{10}$/.test(v.trim());
const isValidName  = (v) => v.trim().length >= 2;

function CourierDelivery({ onBack, onProceedToPayment }) {
  const user = getSignedInUser();

  /* ── Step state ── */
  const [step, setStep] = useState(0); // 0-3

  /* ── Step 1: Addresses ── */
  const [pickupLabel,   setPickupLabel]   = useState('');
  const [pickup,        setPickup]        = useState(null);
  const [dropLabel,     setDropLabel]     = useState('');
  const [drop,          setDrop]          = useState(null);
  const [district,      setDistrict]      = useState('');
  const [districts,     setDistricts]     = useState([]);
  const [distanceKm,    setDistanceKm]    = useState(null);
  const [calcingDist,   setCalcingDist]   = useState(false);

  /* ── Step 2: Parcel ── */
  const [parcelType,     setParcelType]    = useState('parcel');
  const [weight,         setWeight]        = useState(1);
  const [recipientName,  setRecipientName] = useState('');
  const [recipientPhone, setRecipientPhone]= useState('');
  const [instructions,   setInstructions]  = useState('');

  /* ── Step 3: Quote ── */
  const [fee,      setFee]      = useState(null);
  const [feeError, setFeeError] = useState('');
  const [quoting,  setQuoting]  = useState(false);

  /* ── Misc ── */
  const [message, setMessage] = useState('');
  const swapRef = useRef(false);

  /* ────────────────────────────────────────────────────────────────────
     Load districts from DB — no hardcoded coords
  ──────────────────────────────────────────────────────────────────── */
  useEffect(() => {
    let cancelled = false;
    getDistricts().then((list) => {
      if (cancelled) return;
      setDistricts(list);
      setDistrict((cur) => cur || resolvePreferredDistrictId(list));
    });
    return () => { cancelled = true; };
  }, []);

  /* ────────────────────────────────────────────────────────────────────
     Distance — Haversine via backend, local fallback built into service
  ──────────────────────────────────────────────────────────────────── */
  useEffect(() => {
    let cancelled = false;
    setFee(null);
    setFeeError('');
    if (!pickup || !drop) { setDistanceKm(null); return; }
    setCalcingDist(true);
    getDistanceKm(pickup.latitude, pickup.longitude, drop.latitude, drop.longitude)
      .then((km) => { if (!cancelled) { setDistanceKm(km); setCalcingDist(false); } })
      .catch(() => { if (!cancelled) setCalcingDist(false); });
    return () => { cancelled = true; };
  }, [pickup?.latitude, pickup?.longitude, drop?.latitude, drop?.longitude]); // eslint-disable-line

  /* ────────────────────────────────────────────────────────────────────
     Fee — existing DeliveryFeeCalculator, never re-implemented here
  ──────────────────────────────────────────────────────────────────── */
  useEffect(() => {
    let cancelled = false;
    if (distanceKm == null || !district) { setFee(null); return; }
    setQuoting(true);
    setFeeError('');
    apiFetchJson(DELIVERY_FEE_PREVIEW_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        serviceType: 'courier',
        district,
        distanceKm,
        orderTotal: 0,
        firstOrder: false,
        emergencyPriority: false,
      }),
    })
      .then((breakdown) => { if (!cancelled) { setFee(breakdown); setFeeError(''); } })
      .catch((err)      => { if (!cancelled) { setFee(null); setFeeError(err?.message || 'Unable to calculate fee.'); } })
      .finally(()       => { if (!cancelled) setQuoting(false); });
    return () => { cancelled = true; };
  }, [distanceKm, district]); // eslint-disable-line

  /* ────────────────────────────────────────────────────────────────────
     Derived values
  ──────────────────────────────────────────────────────────────────── */
  const outsideArea    = Boolean(feeError && /up to .* km/i.test(feeError));
  const platformFee    = Number(fee?.platformFee    || 0);
  const deliveryFee    = Number(fee?.finalDeliveryFee || 0);
  const payableTotal   = deliveryFee + platformFee;
  const districtName   = districts.find((d) => d.id === district)?.name || 'your district';

  /* Step validation gates */
  const step1Valid = Boolean(pickup && drop);
  const step2Valid = isValidName(recipientName) && isValidPhone(recipientPhone);
  const step3Valid = Boolean(fee && !outsideArea && !quoting);
  const canConfirm = Boolean(user?.id && step1Valid && step2Valid && step3Valid);

  /* ────────────────────────────────────────────────────────────────────
     Swap pickup ↔ drop
  ──────────────────────────────────────────────────────────────────── */
  const handleSwap = useCallback(() => {
    swapRef.current = true;
    const tmpLabel = pickupLabel; const tmpLoc = pickup;
    setPickupLabel(dropLabel);   setPickup(drop);
    setDropLabel(tmpLabel);      setDrop(tmpLoc);
    setTimeout(() => { swapRef.current = false; }, 50);
  }, [pickup, drop, pickupLabel, dropLabel]);

  /* ────────────────────────────────────────────────────────────────────
     Confirm booking → hand off to payment flow
  ──────────────────────────────────────────────────────────────────── */
  const handleConfirm = () => {
    if (!canConfirm) return;
    setMessage('');

    const courierItem = {
      cartId:      `courier-${Date.now()}`,
      productId:   901,
      serviceType: 'COURIER',
      productName: `Courier: ${pickupLabel} → ${dropLabel} (${fee.distanceKm} km)`,
      price:       payableTotal,
      quantity:    1,
    };

    onProceedToPayment?.({
      user,
      items: [courierItem],
      profileAddress: {
        addressLine: `${pickupLabel} → ${dropLabel}`,
        town:        recipientName,
        district,
        landmark:    recipientPhone,
        courierMeta: {
          pickupAddress:         pickupLabel  || pickup.address,
          pickupLatitude:        pickup.latitude,
          pickupLongitude:       pickup.longitude,
          deliveryAddress:       dropLabel    || drop.address,
          deliveryLatitude:      drop.latitude,
          deliveryLongitude:     drop.longitude,
          parcelType,
          weight,
          instructions,
          distanceKm:            fee.distanceKm,
          deliveryFee,
          platformFee,
          deliveryPartnerPayout: Number(fee.deliveryPartnerPayout || deliveryFee),
          serviceRadiusKm:       fee.serviceRadiusKm,
        },
      },
      total:      payableTotal,
      returnView: 'courier',
    });
  };

  /* ────────────────────────────────────────────────────────────────────
     Step navigation helpers
  ──────────────────────────────────────────────────────────────────── */
  const goNext = () => {
    setMessage('');
    setStep((s) => Math.min(s + 1, 3));
  };
  const goPrev = () => {
    setMessage('');
    setStep((s) => Math.max(s - 1, 0));
  };

  /* ────────────────────────────────────────────────────────────────────
     Why is Next disabled? (shown inline)
  ──────────────────────────────────────────────────────────────────── */
  const step1Hint = !pickup ? 'Select a pickup address' : !drop ? 'Select a drop address' : '';
  const step2Hint = !isValidName(recipientName)
    ? 'Enter recipient name (min 2 chars)'
    : !isValidPhone(recipientPhone)
    ? 'Enter valid 10-digit phone number'
    : '';
  const step3Hint = outsideArea
    ? 'Delivery outside service radius'
    : quoting
    ? 'Calculating fee…'
    : !fee
    ? 'Waiting for fee quote'
    : '';

  /* ────────────────────────────────────────────────────────────────────
     Render
  ──────────────────────────────────────────────────────────────────── */
  return (
    <main className="courier-page">

      {/* ── Sticky Nav ── */}
      <nav className="courier-nav">
        <button className="courier-back-btn" onClick={step > 0 ? goPrev : onBack}>
          ← {step > 0 ? 'Back' : 'Home'}
        </button>
        <div>
          <span className="courier-brand">Anywhere</span>
          <span className="courier-location">Courier · {districtName}</span>
        </div>
        <span className="courier-status">
          {user ? `Hi, ${user.fullName?.split(' ')[0] || 'there'}` : 'Sign in to book'}
        </span>
      </nav>

      {/* ── Progress stepper ── */}
      <div className="courier-stepper" aria-label="Booking steps">
        {STEPS.map((label, i) => (
          <div
            key={label}
            className={`courier-step${i < step ? ' done' : i === step ? ' active' : ''}`}
            aria-current={i === step ? 'step' : undefined}
          >
            <div className="courier-step-bubble">
              {i < step ? '✓' : i + 1}
            </div>
            <span className="courier-step-label">{label}</span>
            {i < STEPS.length - 1 && <div className="courier-step-line" />}
          </div>
        ))}
      </div>

      {/* ══════════════════════════════════════════════════════════════
          STEP 0 — ADDRESSES
      ══════════════════════════════════════════════════════════════ */}
      {step === 0 && (
        <section className="courier-section">
          <div className="courier-section-header">
            <h2>Where to and from?</h2>
            {districts.length > 0 && (
              <select
                className="courier-district-select"
                value={district}
                onChange={(e) => {
                  setDistrict(e.target.value);
                  setPickup(null); setPickupLabel('');
                  setDrop(null);   setDropLabel('');
                }}
                aria-label="Service district"
              >
                {districts.map((d) => (
                  <option key={d.id} value={d.id}>{d.name}</option>
                ))}
              </select>
            )}
          </div>

          <div className="courier-address-grid">
            {/* Pickup */}
            <div className="courier-address-col">
              <div className="courier-address-header">
                <span className="courier-addr-badge pickup">P</span>
                <strong>Pickup address</strong>
              </div>
              <AddressAutocomplete
                label=""
                placeholder={`Search pickup in ${districtName}…`}
                value={pickupLabel}
                onChange={(v) => { setPickupLabel(v); if (!swapRef.current) setPickup(null); }}
                onSelect={(loc) => setPickup(loc?.latitude != null ? loc : null)}
                onClear={() => { setPickup(null); setPickupLabel(''); }}
                district={district}
                showUseMyLocation
              />
              {pickupLabel && !pickup && (
                <small className="courier-field-error">Select from suggestions</small>
              )}
            </div>

            {/* Swap button (desktop: centred between columns) */}
            <button
              type="button"
              className="courier-swap-btn"
              onClick={handleSwap}
              disabled={!pickup && !drop}
              title="Swap pickup and drop"
              aria-label="Swap pickup and drop addresses"
            >
              ⇅
            </button>

            {/* Drop */}
            <div className="courier-address-col">
              <div className="courier-address-header">
                <span className="courier-addr-badge drop">D</span>
                <strong>Drop address</strong>
              </div>
              <AddressAutocomplete
                label=""
                placeholder={`Search drop in ${districtName}…`}
                value={dropLabel}
                onChange={(v) => { setDropLabel(v); if (!swapRef.current) setDrop(null); }}
                onSelect={(loc) => setDrop(loc?.latitude != null ? loc : null)}
                onClear={() => { setDrop(null); setDropLabel(''); }}
                district={district}
              />
              {dropLabel && !drop && (
                <small className="courier-field-error">Select from suggestions</small>
              )}
            </div>
          </div>

          {/* Distance badge once both selected */}
          {pickup && drop && (
            <div className="courier-distance-badge">
              {calcingDist ? (
                <span className="courier-dist-loading">⏳ Calculating distance…</span>
              ) : distanceKm != null ? (
                <>
                  <span className="courier-dist-km">📍 {distanceKm.toFixed(1)} km</span>
                  {fee?.estimatedDeliveryTime && (
                    <span className="courier-dist-eta">· ETA {fee.estimatedDeliveryTime}</span>
                  )}
                </>
              ) : null}
            </div>
          )}

          {/* Map — appears right in the addresses step */}
          {(pickup || drop) && (
            <div className="courier-map-wrap">
              <MapPreview
                pickup={pickup ? {
                  latitude: pickup.latitude,
                  longitude: pickup.longitude,
                  label: 'Pickup',
                  address: pickupLabel || pickup.address,
                } : null}
                delivery={drop ? {
                  latitude: drop.latitude,
                  longitude: drop.longitude,
                  label: 'Delivery',
                  address: dropLabel || drop.address,
                } : null}
                height={300}
              />
            </div>
          )}

          <div className="courier-step-footer">
            {step1Hint && <span className="courier-step-hint">{step1Hint}</span>}
            <button
              className="courier-next-btn"
              disabled={!step1Valid}
              onClick={goNext}
            >
              Next: Parcel details →
            </button>
          </div>
        </section>
      )}

      {/* ══════════════════════════════════════════════════════════════
          STEP 1 — PARCEL
      ══════════════════════════════════════════════════════════════ */}
      {step === 1 && (
        <section className="courier-section">
          <h2>Parcel details</h2>

          {/* Package type cards */}
          <div className="courier-parcel-types">
            {PARCEL_TYPES.map((pt) => (
              <button
                key={pt.id}
                type="button"
                className={`courier-parcel-card${parcelType === pt.id ? ' selected' : ''}`}
                onClick={() => setParcelType(pt.id)}
                aria-pressed={parcelType === pt.id}
              >
                <span className="courier-parcel-icon">{pt.icon}</span>
                <strong className="courier-parcel-label">{pt.label}</strong>
                <span className="courier-parcel-hint">{pt.hint}</span>
              </button>
            ))}
          </div>

          {/* Weight stepper */}
          <div className="courier-weight-row">
            <label className="courier-field-label">Weight</label>
            <div className="courier-weight-control">
              <button
                type="button"
                className="courier-weight-btn"
                onClick={() => setWeight((w) => Math.max(1, w - 1))}
                aria-label="Decrease weight"
              >−</button>
              <span className="courier-weight-value">{weight} kg</span>
              <button
                type="button"
                className="courier-weight-btn"
                onClick={() => setWeight((w) => Math.min(25, w + 1))}
                aria-label="Increase weight"
              >+</button>
            </div>
            <input
              type="range"
              className="courier-weight-slider"
              min={1} max={25} value={weight}
              onChange={(e) => setWeight(Number(e.target.value))}
              aria-label="Weight slider"
            />
            <span className="courier-weight-range">1 – 25 kg</span>
          </div>

          {/* Recipient */}
          <div className="courier-field-row">
            <div className="courier-field">
              <label className="courier-field-label">Recipient name</label>
              <input
                type="text"
                value={recipientName}
                onChange={(e) => setRecipientName(e.target.value)}
                placeholder="Full name"
                className={!recipientName || isValidName(recipientName) ? '' : 'courier-input-error'}
              />
              {recipientName && !isValidName(recipientName) && (
                <small className="courier-field-error">Enter at least 2 characters</small>
              )}
            </div>
            <div className="courier-field">
              <label className="courier-field-label">Recipient phone</label>
              <input
                type="tel"
                maxLength={10}
                value={recipientPhone}
                onChange={(e) => setRecipientPhone(e.target.value.replace(/\D/g, ''))}
                placeholder="10-digit mobile"
                className={!recipientPhone || isValidPhone(recipientPhone) ? '' : 'courier-input-error'}
              />
              {recipientPhone && !isValidPhone(recipientPhone) && (
                <small className="courier-field-error">Enter valid 10-digit number</small>
              )}
            </div>
          </div>

          {/* Instructions */}
          <div className="courier-field">
            <label className="courier-field-label">Special instructions <span className="courier-optional">(optional)</span></label>
            <textarea
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              placeholder="e.g. fragile, handle with care, call before delivery…"
              rows={3}
              className="courier-textarea"
            />
          </div>

          <div className="courier-step-footer">
            {step2Hint && <span className="courier-step-hint">{step2Hint}</span>}
            <button
              className="courier-next-btn"
              disabled={!step2Valid}
              onClick={goNext}
            >
              Next: Get quote →
            </button>
          </div>
        </section>
      )}

      {/* ══════════════════════════════════════════════════════════════
          STEP 2 — QUOTE
      ══════════════════════════════════════════════════════════════ */}
      {step === 2 && (
        <section className="courier-section">
          <h2>Fee breakdown</h2>

          {quoting && (
            <div className="courier-quote-loading">
              <div className="courier-quote-spinner" />
              <span>Calculating fee…</span>
            </div>
          )}

          {!quoting && feeError && (
            <div className={`courier-alert ${outsideArea ? 'warn' : 'error'}`}>
              {outsideArea
                ? `Outside our ${fee?.serviceRadiusKm ?? 30} km service radius. Choose a closer drop point.`
                : feeError}
            </div>
          )}

          {!quoting && fee && !outsideArea && (
            <div className="courier-quote-card">
              <div className="courier-quote-row">
                <span>Distance</span>
                <strong>{Number(fee.distanceKm).toFixed(2)} km</strong>
              </div>
              <div className="courier-quote-row">
                <span>Base fee</span>
                <strong>₹{Number(fee.baseFee).toFixed(2)}</strong>
              </div>
              <div className="courier-quote-row">
                <span>Distance charge</span>
                <strong>₹{(deliveryFee - Number(fee.baseFee || 0)).toFixed(2)}</strong>
              </div>
              <div className="courier-quote-row">
                <span>Partner payout</span>
                <strong>₹{Number(fee.deliveryPartnerPayout || deliveryFee).toFixed(2)}</strong>
              </div>
              <div className="courier-quote-row">
                <span>Platform fee</span>
                <strong>₹{platformFee.toFixed(2)}</strong>
              </div>
              <div className="courier-quote-row muted">
                <span>District tier</span>
                <span>Tier {fee.districtTier} · {districtName}</span>
              </div>
              <div className="courier-quote-row muted">
                <span>ETA</span>
                <span>{fee.estimatedDeliveryTime}</span>
              </div>
              <div className="courier-quote-divider" />
              <div className="courier-quote-row total">
                <span>Total to pay</span>
                <strong>₹{payableTotal.toFixed(2)}</strong>
              </div>
              <p className="courier-split-note">
                Your delivery partner keeps 100% of the distance-based fee.
                Anywhere only charges the small platform service fee above.
              </p>
            </div>
          )}

          <div className="courier-step-footer">
            {step3Hint && <span className="courier-step-hint">{step3Hint}</span>}
            <button
              className="courier-next-btn"
              disabled={!step3Valid}
              onClick={goNext}
            >
              Next: Confirm →
            </button>
          </div>
        </section>
      )}

      {/* ══════════════════════════════════════════════════════════════
          STEP 3 — CONFIRM
      ══════════════════════════════════════════════════════════════ */}
      {step === 3 && (
        <section className="courier-section">
          <h2>Confirm booking</h2>

          <div className="courier-confirm-card">
            <div className="courier-confirm-row">
              <span className="courier-confirm-label">📍 Pickup</span>
              <span className="courier-confirm-value">{pickupLabel}</span>
            </div>
            <div className="courier-confirm-row">
              <span className="courier-confirm-label">🏁 Drop</span>
              <span className="courier-confirm-value">{dropLabel}</span>
            </div>
            <div className="courier-confirm-row">
              <span className="courier-confirm-label">📦 Parcel</span>
              <span className="courier-confirm-value">
                {PARCEL_TYPES.find((p) => p.id === parcelType)?.icon}{' '}
                {PARCEL_TYPES.find((p) => p.id === parcelType)?.label} · {weight} kg
              </span>
            </div>
            <div className="courier-confirm-row">
              <span className="courier-confirm-label">👤 Recipient</span>
              <span className="courier-confirm-value">{recipientName} · {recipientPhone}</span>
            </div>
            {instructions && (
              <div className="courier-confirm-row">
                <span className="courier-confirm-label">📝 Note</span>
                <span className="courier-confirm-value">{instructions}</span>
              </div>
            )}
            <div className="courier-confirm-row">
              <span className="courier-confirm-label">📏 Distance</span>
              <span className="courier-confirm-value">{Number(fee?.distanceKm ?? distanceKm ?? 0).toFixed(2)} km</span>
            </div>
            <div className="courier-confirm-divider" />
            <div className="courier-confirm-row total">
              <span className="courier-confirm-label">💳 Total</span>
              <span className="courier-confirm-total">₹{payableTotal.toFixed(2)}</span>
            </div>
          </div>

          {!user?.id && (
            <div className="courier-alert warn">Please sign in to confirm your booking.</div>
          )}
          {message && <div className="courier-alert error">{message}</div>}

          <div className="courier-step-footer">
            <button
              className="courier-confirm-btn"
              disabled={!canConfirm}
              onClick={handleConfirm}
            >
              {user ? '✓ Confirm & Pay' : 'Sign in to book'}
            </button>
          </div>
        </section>
      )}

      {/* ── Mobile sticky bottom bar (shows total + primary action) ── */}
      <div className="courier-bottom-bar">
        {fee && !outsideArea && step >= 2 ? (
          <>
            <span className="courier-bottom-total">₹{payableTotal.toFixed(2)}</span>
            {step < 3 ? (
              <button className="courier-bottom-btn" onClick={goNext}
                disabled={step === 2 ? !step3Valid : false}>
                Next →
              </button>
            ) : (
              <button className="courier-bottom-btn" onClick={handleConfirm} disabled={!canConfirm}>
                Confirm & Pay
              </button>
            )}
          </>
        ) : step < 3 ? (
          <button
            className="courier-bottom-btn"
            onClick={step === 0 ? goNext : step === 1 ? goNext : goNext}
            disabled={
              (step === 0 && !step1Valid) ||
              (step === 1 && !step2Valid) ||
              (step === 2 && !step3Valid)
            }
          >
            Next →
          </button>
        ) : null}
      </div>
    </main>
  );
}

export default CourierDelivery;
