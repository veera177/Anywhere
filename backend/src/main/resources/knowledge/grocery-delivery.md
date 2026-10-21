# Grocery delivery

## How customers browse grocery products

Open the Grocery Delivery section after selecting a district in your profile. The app lists all verified grocery stores whose registered location falls within the configured service radius for your delivery address. Tap a store card to browse its available products, or use the search bar to find a specific product across all stores in the district.

Products are organised by category (Fruits, Vegetables, Dairy, Staples, Snacks, Household, etc.) within each store's listing. Availability is live — only products the partner has marked as in-stock appear.

## Searching and selecting products

Use the search bar to type the product name (for example, "tomatoes", "basmati rice", "coconut oil"). The backend returns matching products from stores within your district and service radius. Each result shows the product name, quantity/unit type, price, and store name.

If no results appear for a specific product, either the product is not stocked by any active partner in your district, or all matching products are currently out of stock.

## Adding products to the cart

Tap **Add** on a product card to add it to your cart. You can adjust the quantity from the cart page. Items from multiple stores can exist in the cart at the same time; however, each store's items are fulfilled separately, so checkout may involve separate delivery fees per store depending on platform configuration.

The AI Assistant can also add grocery items — for example: *"Add 2 kg tomatoes to my cart"* — and will match the closest available product in your district.

## Checkout instructions

After reviewing your cart:

1. Verify all items and quantities are correct.
2. Proceed to Checkout.
3. The backend revalidates all product availability and prices.
4. Confirm your delivery address is within the 25 km grocery service radius.
5. Review the itemised total, delivery fee, and any discount.
6. Choose a payment method (online or Cash on Delivery) and confirm.

An order is placed only after the backend confirms it. Do not retry payment if you are unsure whether the first attempt succeeded — check the Orders page first.

## District-based availability

Grocery stores are registered to a specific district. When you select a district, only stores in that district appear. Your delivery address must also fall within the store's 25 km service radius. If you have multiple addresses saved, confirm the active delivery address at checkout.

## Product price and stock validation

Grocery product prices are set by store partners and updated in the backend at any time. The checkout step fetches the latest price for every cart item. If a price changed between the time you added an item to the cart and when you checked out, the updated price is shown before you confirm.

Stock is validated at checkout. If a product has gone out of stock since you added it, the checkout will flag it and you must remove it or choose an alternative before proceeding.

## Missing products

If a product you need is not listed:

- The product may not be stocked by any active partner in your district.
- The product may be temporarily out of stock.
- The store that normally stocks it may not currently be active.

Try searching with a shorter or different keyword. If you believe the product should be available, check again later or contact support.

## Unavailable products

A product card may be greyed out or marked "Out of Stock" when the partner has flagged it as unavailable. These products cannot be added to the cart. The availability status is refreshed periodically based on partner updates; the AI Assistant does not know in advance when a product will be restocked.

## Delivery charges

The grocery delivery fee is calculated based on:

- The configured distance tier for the route from the store to your delivery address.
- The order subtotal — orders above the configured free-delivery threshold for grocery have the delivery fee waived.
- Platform configuration (base fee, per-km rate, max cap).

The configured default grocery service radius is 25 km. Current fee values and free-delivery thresholds come from live platform settings — the checkout page shows the exact fee before you confirm.

## Frequently asked customer questions

**Q: Why can't I see any grocery stores?**
A: Your district may not have active grocery partners, or your address may be outside the 25 km radius of available stores. Check your profile district and delivery address.

**Q: Can I order groceries from a store in another district?**
A: No. Grocery delivery is scoped to the selected district. Switch your district to order from a store registered there.

**Q: Why is a product shown as unavailable?**
A: The store partner has marked that product as out of stock. Availability updates depend on the partner. Try again later or search for an alternative.

**Q: My cart price changed at checkout — why?**
A: Store partners can update prices at any time. Checkout always fetches the latest price. The difference is shown before you confirm payment.

**Q: Can I order from multiple stores at once?**
A: Yes. You can add items from different stores to the same cart. The platform may calculate separate delivery fees per store. Review the breakdown at checkout before confirming.
