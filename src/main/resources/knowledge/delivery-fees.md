# Delivery fees

## Overview of the delivery fee model

Anywhere uses a configurable, distance-based delivery fee system. Fees are calculated by the backend Java service (`DeliveryFeeCalculatorService`) based on current platform settings. The values shown here represent previously proposed defaults — the actual fees in effect at any time come from the live backend configuration and must not be assumed from this document.

**The checkout page is the authority for the final delivery fee.** Never use a static document value as the confirmed fee for a specific order.

## Food, grocery, and medicine delivery fees

For Food, Grocery, and Medicine deliveries, the fee model works as follows:

**Customer pays:**
- Product total (sum of all ordered items at current price)
- Delivery fee (calculated based on distance, order value, and tier)

**Partner (restaurant / store / pharmacy) receives:**
- Product total minus the configured commission rate

**Delivery partner receives:**
- The delivery fee in full

**Anywhere earns:**
- The commission from the partner's product total

### Configured commission defaults

| Service | Commission rate | Minimum commission floor |
|---|---|---|
| Food Delivery | 15% of order product total | ₹15 |
| Grocery Delivery | 8% of order product total | ₹15 |
| Medicine Delivery | 5% of order product total | ₹15 |

These are configurable defaults, not guaranteed live values. The actual commission rates are stored in platform settings and can be updated by the platform administrator. The AI Assistant retrieves current rates from the backend when relevant — it will not confirm a commission rate without a live backend result.

### Free delivery thresholds

Orders above the configured free-delivery threshold have the delivery fee waived. Based on previously configured values:

| Service | Free delivery above |
|---|---|
| Food | ₹199 |
| Grocery | ₹299 |
| Medicine | ₹149 |

These are configurable defaults. The actual threshold in effect is shown at checkout.

### Distance-based fee tiers

The delivery fee for orders below the free-delivery threshold is calculated using tiered distance rates. Tiers reflect the district classification (Tier 1, Tier 2, Tier 3). Previously proposed default tiers:

**Food:**
- Tier 1 base: ₹35 (first 3 km), max: ₹100
- Tier 2 base: ₹25 (first 3 km), max: ₹75
- Tier 3 base: ₹20 (first 3 km), max: ₹65

**Grocery:**
- Tier 1 base: ₹28 (first 3 km), max: ₹100
- Tier 2 base: ₹22 (first 3 km), max: ₹75
- Tier 3 base: ₹18 (first 3 km), max: ₹65

**Medicine:**
- Tier 1 base: ₹22 (first 3 km), max: ₹100
- Tier 2 base: ₹17 (first 3 km), max: ₹75
- Tier 3 base: ₹13 (first 3 km), max: ₹65

For Tier 3 districts, delivery partners receive an additional 8% top-up bonus paid from platform commissions.

## Courier delivery fees

For Courier deliveries, the fee model is different:

**Customer pays:**
- Distance-based courier delivery fee (calculated by `DeliveryFeeCalculatorService` using Haversine distance)
- Separate platform fee (a percentage of the distance-based fee, with a configured minimum floor)

**Courier partner receives:**
- 100% of the distance-based courier delivery fee
- The platform fee is **not deducted** from the partner's distance-based fee

**Anywhere earns:**
- The separate platform fee

### Courier fee tiers (previously proposed defaults)

| Tier | Base fee | Base distance | Max fee |
|---|---|---|---|
| Tier 1 | ₹25 | 3 km | ₹100 |
| Tier 2 | ₹20 | 3 km | ₹75 |
| Tier 3 | ₹15 | 3 km | ₹65 |

**Platform fee (previously proposed default):** 20% of distance-based delivery fee, minimum floor ₹15.

> **Important:** The platform fee is charged on top of the distance-based delivery fee. The courier partner receives the full distance-based fee — the platform fee is not split from it. Both amounts are shown in the fee breakdown at the courier booking confirmation step.

## How the fee calculation works

The existing Java `DeliveryFeeCalculatorService` calculates fees by:

1. Determining the service type (Food, Grocery, Medicine, or Courier).
2. Looking up current fee configuration from the `platform_settings` table.
3. Applying the relevant tier based on the district classification.
4. Checking the order subtotal against the free-delivery threshold.
5. Calculating per-km charges for distances beyond the base distance.
6. Capping the fee at the configured maximum.

For Courier, the `DistanceCalculatorUtil` first computes the Haversine distance, which is then used as the input to fee calculation.

## Never invent a fee

The AI Assistant will not guess, estimate, or confirm a delivery fee amount for a specific order. The only authoritative source is the checkout page (for food/grocery/medicine) or the booking confirmation step (for courier). If you need to know the fee for a specific route or order, proceed to checkout to see the calculated value.
