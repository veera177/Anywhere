# Customer FAQ

## What is Anywhere?

Anywhere is a district-based hyperlocal delivery platform in Tamil Nadu, India. It connects customers with verified local businesses — restaurants, grocery stores, pharmacies, and courier partners — across multiple districts. The tagline is *"Connecting Every District, Serving Every Community."* Anywhere does not own warehouses or operate its own stores; every order is fulfilled directly by a verified local partner.

## What services are available?

Anywhere offers four services:
1. **Food Delivery** — Order meals from local restaurants.
2. **Grocery Delivery** — Order daily essentials and grocery products from local stores.
3. **Medicine Delivery** — Order medicines and health products from registered pharmacies.
4. **Courier Service** — Book on-demand parcel pickup and delivery between two addresses.

## How do I order food?

1. Select your district in your profile.
2. Open **Food Delivery**.
3. Browse restaurants or search for a dish.
4. Add available dishes to your cart.
5. Proceed to Checkout, review the order and delivery fee, and complete payment.

You can also ask the AI Assistant: *"Find biryani in my district"* or *"Add 1 biryani to my cart."*

## How do I order groceries?

1. Select your district in your profile.
2. Open **Grocery Delivery**.
3. Browse stores or search for a product.
4. Add products to your cart.
5. Proceed to Checkout and complete payment.

The grocery service radius is 25 km from each store. You can also ask the AI Assistant: *"Do you have tomatoes in my district?"*

## How do I find a medicine?

1. Select your district in your profile.
2. Open **Medicine Delivery**.
3. Search by medicine name (e.g., "Paracetamol", "Dolo 650").
4. Add available medicines to your cart.
5. If a prescription is required, upload one at checkout.
6. Complete payment.

For medical advice, dosage, or treatment guidance, consult a qualified healthcare professional — Anywhere does not provide medical advice.

## How do I book a courier?

1. Open the **Courier** section.
2. Enter a pickup address — select the autocomplete suggestion.
3. Enter a destination address — select the autocomplete suggestion.
4. The backend calculates the distance and fee.
5. Review the fee breakdown and confirm.

Both addresses must be selected from autocomplete suggestions (free-form text will cause the booking to fail). The courier service operates within a configured 30 km Haversine distance.

## Why can't I see restaurants?

Restaurants may not appear because:
- No verified food partners are active in your selected district.
- Your delivery address is outside the 15 km service radius of available restaurants.
- Your district selection in your profile is incorrect.

Check your profile district and delivery address, then refresh the Food Delivery page.

## Why is a product unavailable?

A product may be unavailable because:
- The partner has marked it as out of stock.
- The store or restaurant is not currently active.
- The product is outside the service radius for your delivery address.

Try searching with a different term. If the product was available previously, it may be temporarily out of stock — try again later.

## Why did the product price change?

Partner prices can be updated at any time. The price shown when you add an item to your cart reflects the price at that moment. At checkout, the backend re-fetches the current price. If the price changed, the updated amount is shown before you confirm payment.

## How do I change my selected district?

Go to **Profile** → **District** → select the new district → save. After saving, return to any service page and refresh to see listings for the new district.

## How do I add products to my cart?

Tap **Add** on any available product card in Food, Grocery, or Medicine Delivery. You can also ask the AI Assistant to add items: *"Add 2 kg rice to my cart"* or *"Add Dolo 650 to cart."* The assistant will find an available match in your district and add it.

## Why is checkout failing?

Checkout can fail for several reasons:
- A cart item is no longer available or is out of stock.
- Your delivery address is outside the service radius of a partner.
- A price changed and needs acknowledgment.
- A payment error occurred.
- A prescription is required and has not been uploaded or approved.

The checkout page will show the specific reason. Address each flagged issue and try again.

## How do I track an order?

Go to **Orders** to see your order history and current statuses. You can also ask the AI: *"Track my order"* or *"What is the status of my last order?"* The AI will report the status returned by the backend.

The AI will not invent an ETA, delivery partner location, or live GPS position — only the status from the backend is reported.

## Can I get my money back?

Refunds are available when:
- You successfully cancel an eligible order (in ORDER_PLACED or RESTAURANT_ACCEPTED status).
- An item cannot be fulfilled because it went out of stock.
- There is a verified payment discrepancy.

Refunds are returned to the original payment method. For COD orders, refunds are issued to a verified UPI ID or bank account. The standard processing period mentioned in the FAQ is 5–7 business days, but this depends on the payment provider and your bank. The AI Assistant cannot approve or guarantee a refund.

## How do I check refund status?

Go to **Orders** → open the relevant order. If a refund has been initiated, it may appear in the order details or status. If the information is not visible, contact support with your order ID.

## Why is my courier destination unavailable?

Possible reasons:
- The Haversine (straight-line) distance between pickup and destination exceeds the configured 30 km courier radius.
- The destination address was typed as free-form text instead of selected from the autocomplete suggestions.
- No courier partners are available in the area.

Ensure you select both addresses from the autocomplete dropdown. If the route is genuinely outside the service radius, the booking cannot be confirmed.

## How is the delivery fee calculated?

- **Food/Grocery/Medicine:** Based on the distance from the partner to your address, your order subtotal (free delivery above the threshold), and the tier configuration for your district. The exact fee is shown at checkout.
- **Courier:** Based on the Haversine distance using configured fee tiers, plus a separate platform fee. The fee breakdown is shown at the booking confirmation step.

The AI Assistant retrieves fee values from the live backend — it does not guess or invent fee amounts.

## Why must I select an address suggestion for courier?

Autocomplete suggestions carry precise GPS coordinates (latitude and longitude). The backend needs these coordinates to calculate the Haversine distance between pickup and destination and to validate that the route is within the service area. Typing a free-form address without selecting a suggestion means no coordinates are available, so the booking cannot be validated or confirmed.

## What should I do if the AI cannot answer my question?

If the AI Assistant says it cannot verify the information or does not have enough context:

1. Check the relevant section of the app directly (Orders, Cart, Profile).
2. Refresh the page or re-open the app.
3. Contact Anywhere customer support through the official support channel displayed in the application.
4. For payment or refund disputes, contact support with your order ID and payment reference number.

The AI Assistant admits when it cannot confirm a fact rather than guessing. Please do not share passwords, OTPs, payment card numbers, or account tokens with anyone — including chat support.
