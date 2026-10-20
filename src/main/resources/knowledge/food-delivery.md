# Food delivery

## How customers browse restaurants

Open the Food Delivery section after selecting a district in your profile. The app shows all verified restaurants whose registered location falls within the configured service radius for your selected address. Restaurants are sorted by rating by default. You can filter by food type (Veg / Non-Veg) or search by restaurant name or cuisine.

If no restaurants appear, this usually means no verified food partners have been onboarded for the selected district or your delivery address is outside the service radius of available restaurants.

## How customers search for dishes

Use the search bar in Food Delivery to type a dish name, cuisine type, or ingredient. The backend queries available food products for the selected district and returns matching results. Results include the dish name, price, food type (Veg/Non-Veg), and the restaurant offering it.

You can also browse directly by restaurant — tap a restaurant card to see its menu.

## How customers add dishes to the cart

On the menu or search-results page, tap **Add** next to any available dish. The item is added to your cart with a quantity of one. You can increase the quantity from the cart page. The cart shows the item name, quantity, unit price, and line total.

You can also ask the AI Assistant to add a dish — for example: *"Add biryani to my cart"* — and the assistant will look up an available match in your district and add it.

## How checkout works

After reviewing your cart, proceed to Checkout. The backend validates:

1. That all cart items are still available from their respective restaurants.
2. That your delivery address is within the service radius of each restaurant.
3. The current product prices (prices may have changed since items were added).
4. The delivery fee based on the current configuration and route.

The checkout page shows the product subtotal, delivery fee, any applicable discount, and the final total. **The total shown at checkout is authoritative.** The order is placed only after payment is confirmed or Cash on Delivery is selected and the backend confirms the booking.

## How district selection affects restaurant listings

Restaurants are registered to a specific district. When you select a district in your profile, only restaurants in that district appear. If you change districts, the listing refreshes automatically. Products you added to your cart from a previous district may no longer be available after switching districts.

## Why restaurants may not appear

A restaurant will not appear in your listing if any of the following is true:

- The restaurant is not currently active or verified.
- The restaurant's registered location is outside the configured 15 km food delivery radius from your selected delivery address.
- No food partners have been onboarded for the selected district.
- The restaurant is temporarily closed (store hours vary by partner).

If you cannot see a specific restaurant you have used before, check that your selected district and delivery address are correct, then refresh the Food Delivery page.

## How stock and product availability are handled

Stock availability for dishes is managed by the restaurant partner. If a dish shown in search results is no longer available by the time you check out, the checkout step will flag it. The backend revalidates all items before confirming any order. Do not assume a dish is available because it appeared in search — confirm at checkout.

## How current prices are retrieved

Dish prices are set by restaurant partners and stored in the backend database. Prices shown on product cards reflect the current database value. Because prices can be updated at any time, the checkout step re-fetches the latest price for every cart item before calculating the total. The AI Assistant will not guess a price — it retrieves it from the live backend.

## How delivery charges are displayed

The delivery fee for a food order is calculated based on:

- The configured distance tier for the route from the restaurant to your address.
- The order subtotal — orders above the configured free-delivery threshold have the delivery fee waived.
- Platform configuration (base fee, per-km rate, max cap).

The exact delivery fee is shown on the checkout page. The configured default food radius is 15 km. Current fee values and free-delivery thresholds are read from live platform settings and may differ from the values in the FAQ document, which may reflect an earlier configuration.

## Common food delivery errors

| Error | Likely cause | What to do |
|---|---|---|
| No restaurants found | No partner in district or outside radius | Check district and address; try a broader area |
| Item unavailable at checkout | Stock depleted since adding to cart | Remove item and search for an alternative |
| Delivery not available | Address outside restaurant's 15 km radius | Use an address closer to the restaurant |
| Payment failed | Payment provider issue or insufficient balance | Check payment method; retry or use COD |
| Price changed | Restaurant updated price after cart was loaded | Accept updated price or remove item |

## Frequently asked customer questions

**Q: Why can't I see any restaurants?**
A: Your district may not have any active food partners yet, or your delivery address may be outside the 15 km service radius of available restaurants. Check your profile district and delivery address, then refresh the food listing.

**Q: Can I order from restaurants in a different district?**
A: No. Food delivery is district-scoped. You must select the district where the restaurant is registered to order from it.

**Q: Why did my food price change at checkout?**
A: Restaurant partners can update their prices at any time. The checkout step always fetches the latest price to ensure accuracy. The difference is shown before you confirm payment.

**Q: Is the delivery fee always the same?**
A: No. The fee depends on the distance between the restaurant and your address, your order subtotal, and the current platform configuration. Orders above the free-delivery threshold may have the fee waived. The exact fee is shown at checkout.

**Q: How long does food delivery take?**
A: Estimated delivery times are provided by the backend and depend on the restaurant's preparation time and the delivery route. The AI Assistant does not invent an ETA — refer to the order status on the Orders page.
