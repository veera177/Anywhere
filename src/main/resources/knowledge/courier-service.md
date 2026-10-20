# Courier service

## How courier booking works

Anywhere's Courier Service enables customers to book on-demand parcel pickup and delivery between two addresses within the configured service area. Unlike the other three services, courier does not involve a fixed shop or partner location — it uses registered courier partners who pick up from and deliver to addresses specified by the customer.

**Booking steps:**

1. Open the Courier section.
2. Enter a pickup address by typing and selecting a suggestion from the autocomplete results.
3. Enter a destination address by typing and selecting a suggestion from the autocomplete results.
4. The backend calculates the distance between the two coordinates.
5. The backend validates that the distance is within the configured courier service radius.
6. If the route is serviceable, the backend calculates the delivery fee and platform fee.
7. Review the fee breakdown and confirm the booking.

## Pickup address selection

Type the pickup address in the designated field. **You must select a suggestion from the autocomplete dropdown.** Do not type a free-form address and proceed without selecting an autocomplete result. The autocomplete suggestions provide the precise geographic coordinates that the backend needs to calculate distance and validate serviceability.

If the pickup address is not found in the autocomplete, it either does not exist in the address database or is formatted differently. Try alternative spellings or a nearby landmark.

## Destination address selection

The same rule applies to the destination: **select a valid autocomplete suggestion.** Free-form text entry that is not confirmed through autocomplete selection will cause the booking to fail with an address validation error.

If the autocomplete does not suggest a destination, the address may be outside the serviceable area or not in the database.

## Why valid autocomplete suggestions are required

Autocomplete suggestions are geocoded, meaning each one carries a latitude and longitude pair. The backend uses these coordinates to:

1. Run the Haversine calculation to measure straight-line distance.
2. Validate that the distance is within the configured courier radius (default: 30 km).
3. Apply the correct distance-based fee tier.

If coordinates are missing or inaccurate because a free-form address was used, the calculation cannot be completed reliably and the booking will be rejected.

## Distance calculation and the Haversine formula

The backend calculates the distance between pickup and destination using the **Haversine formula**, which measures the great-circle (straight-line) distance between two points on Earth's surface given their latitude and longitude coordinates.

**Important:** Haversine distance is not the same as road-driving distance. The actual road route may be longer than the Haversine distance, particularly in areas with winding roads or geographic obstacles. The backend uses Haversine for consistent, instant calculation. The configured maximum courier radius is based on Haversine distance.

## Service-area validation

After distance is calculated, the backend checks whether the calculated distance is within the configured courier service radius. The default configured radius is 30 km. If the Haversine distance between pickup and destination exceeds the configured limit, the booking will be rejected with a "destination outside service area" message.

The actual radius in effect is read from live platform settings — it may differ from the default.

## Delivery fee calculation

The courier delivery fee has two components:

1. **Distance-based delivery fee** — calculated by the existing `DeliveryFeeCalculatorService` based on the Haversine distance and the configured courier fee tiers (base fee, per-km rate, distance thresholds, and max fee cap).
2. **Platform fee** — a separate fee charged by Anywhere. The platform fee may be a percentage of the distance-based fee with a configured minimum floor.

**Revenue model:**

- The **customer** pays: distance-based delivery fee + platform fee.
- The **courier partner** receives: 100% of the distance-based delivery fee.
- **Anywhere** receives: the platform fee.

The platform fee is not deducted from the courier partner's share of the distance-based fee — these are separate amounts. The final amounts are always calculated and confirmed by the backend. Do not assume a fee without a backend result.

## Booking errors

| Error | Likely cause | What to do |
|---|---|---|
| Address not found | Autocomplete was not used | Re-type and select a suggestion |
| Destination outside service area | Haversine distance > configured radius | The route is too far; choose a closer destination |
| No courier partners available | No active courier in area | Try again or contact support |
| Booking failed — payment error | Payment issue | Check payment method; retry after verifying card/UPI |

## How to check booking status

After a successful booking:

1. Open the Orders page.
2. Find the courier booking in your order history.
3. The status returned by the backend is shown (e.g., PLACED, ACCEPTED, PICKED_UP, DELIVERED).

The AI Assistant can retrieve your latest order status. It will not invent a status, delivery partner location, or estimated arrival time — only what the backend returns is reported.

## Frequently asked customer questions

**Q: Why must I select an address from the dropdown?**
A: The dropdown suggestions carry the exact coordinates needed to calculate distance and validate serviceability. Typing without selecting a suggestion means no coordinates are available, and the booking cannot proceed.

**Q: The destination looks close but the booking says it's outside the service area — why?**
A: The distance is measured as a straight line (Haversine), not road distance. The road route between your pickup and destination may be longer than it appears on a map, or the configured radius limit for your area may be smaller than expected.

**Q: How is my courier fee calculated?**
A: The backend uses the Haversine distance and the configured fee tiers to calculate the distance-based delivery fee. A separate platform fee is added. The exact breakdown is shown at the confirmation step.

**Q: Who gets the delivery fee I pay?**
A: The courier partner receives 100% of the distance-based delivery fee. Anywhere receives the separate platform fee. The two amounts are not combined or shared.

**Q: Can I send parcels across districts?**
A: Courier delivery is limited by the configured service radius (default 30 km Haversine distance). Whether a cross-district delivery is possible depends on whether both addresses are within that radius of each other — the backend calculates this for each booking.
