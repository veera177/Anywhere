# Districts and availability

## How profile district selection affects listings

Anywhere is a district-scoped platform. Every restaurant, grocery store, pharmacy, and courier partner is registered to a specific district. When you select a district in your profile, the platform filters all listings to show only partners and products available in that district.

District selection is the primary filter for all four services. If you have not selected a district — or if your profile district does not match the district where you want to order — you may see no listings or see listings that cannot deliver to your actual address.

**To update your district:** Go to Profile → District → select the correct district → save.

## Why changing districts should refresh service data

When you switch districts, the product catalog, restaurant listings, grocery stores, and pharmacies change completely because partners are registered to individual districts. After changing your district:

- The food listing shows restaurants from the new district.
- The grocery listing shows stores from the new district.
- The medicine listing shows pharmacies from the new district.
- Products in your cart from the previous district may no longer be available.

Refresh the service page after changing your district to ensure you are viewing the latest data.

## Why a partner may not appear

A partner (restaurant, store, or pharmacy) may not appear in the listing even if it is registered in the selected district for any of these reasons:

1. **Outside service radius** — The partner's registered location is farther from your delivery address than the configured service radius allows.
2. **Inactive or unverified** — The partner has not been verified or is currently deactivated on the platform.
3. **No products listed** — The partner has not added any products/menu items to the platform.
4. **Service hours** — The partner may operate at specific hours; the app reflects their current active status.
5. **Temporarily closed** — The partner has temporarily suspended deliveries.

## How location and service radius affect availability

Each service has a configured service radius measured from the partner's registered location to the customer's delivery address. The backend uses these radii to filter partners:

| Service | Default radius |
|---|---|
| Food Delivery | 15 km from the restaurant's registered location |
| Grocery Delivery | 25 km from the grocery store's registered location |
| Medicine Delivery | 25 km from the pharmacy's registered location |
| Courier Service | 30 km between pickup and drop points (Haversine distance) |

These are platform-configured defaults. The actual values in effect are read from live backend settings and may differ. Checkout always validates serviceability using the current configured radius.

## Why not every address is guaranteed to be serviceable

Even within a supported district, your specific delivery address may fall outside the service radius of currently active partners. This is expected behaviour — Anywhere connects customers to nearby local partners, and coverage is limited by where partners are registered.

If your address is not serviceable:

- Try a different saved address closer to an active partner.
- Check whether partners exist in a neighbouring district and switch districts.
- Wait for new partners to be onboarded in your area.

Do not assume that selecting a district guarantees full address coverage within it.

## How customers should troubleshoot missing listings

**Step-by-step troubleshooting:**

1. Confirm your selected district in Profile — it should match the area where you want to order.
2. Confirm your delivery address — a wrong pincode or area name can place your address outside a partner's radius.
3. Refresh the service listing page.
4. Search for a specific product instead of browsing — the search reaches all active partners in the district.
5. Try a slightly different or broader search term.
6. If the AI Assistant is asked to find a restaurant, store, or product, it fetches live results from the backend and will tell you if nothing is found.
7. If still unavailable, the service may not yet be active in your area. Contact support for district-specific onboarding questions.

**Do not rely on a static district list for current availability.** The AI Assistant reads live backend data for all district-specific queries.
