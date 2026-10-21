# Cart and checkout

## Adding products to a cart

Products are added to your cart from the Food Delivery, Grocery Delivery, or Medicine Delivery sections. Tap **Add** on any available product card. The item is added with a default quantity of one. You must be signed in to use the cart.

The AI Assistant can also add items on your behalf: *"Add 2 kg rice to my cart"* or *"Add biryani to my cart"*. The assistant searches available products in your selected district and adds the closest match.

Items from different services (Food, Grocery, Medicine) can coexist in the cart. Each item records the service type, product ID, and quantity.

## Updating quantities

Open the Cart page (tap the cart icon or tell the AI "Show my cart"). From the cart page, tap the + or − buttons next to each item to increase or decrease the quantity. You can type a specific quantity in some views.

## Removing products

To remove an item, reduce its quantity to zero on the cart page, or use the Delete/Remove icon next to the item. To clear the entire cart, use the "Clear Cart" option or ask the AI: *"Clear my cart"*.

## Reviewing cart totals

The Cart page shows:

- Each item's name, quantity, unit price, and line total.
- An estimated subtotal (sum of all item line totals).

**This subtotal is an estimate.** The backend re-fetches current prices and validates stock at checkout. The final confirmed total is shown on the Checkout page before you pay.

## Proceeding to checkout

Tap **Proceed to Checkout** from the cart page. The checkout step:

1. Revalidates that all cart items are still available from their partners.
2. Fetches the latest price for every item.
3. Confirms that your selected delivery address is within the service radius of each partner.
4. Calculates the delivery fee based on current platform configuration.
5. Applies any valid coupon codes.
6. Shows the final itemised total, delivery fee, discount, and grand total.

Only after you review and confirm does the order proceed to payment.

## Price and stock revalidation

Prices and stock are validated live at checkout — not at the time you add to cart. This means:

- A price may increase or decrease between cart addition and checkout.
- An item that was in stock when added may be out of stock at checkout.
- The checkout page will flag any changed price or unavailable item before you can confirm.

If an item is flagged as unavailable, remove it from the cart to proceed.

## Service-area validation

At checkout, the backend also validates that your delivery address is within the service radius of every partner supplying items in your cart. If any item's partner cannot deliver to your address:

- The checkout will show a "Delivery not available" message for that item.
- Remove the out-of-area item, update your delivery address, or contact support.

## Payment errors

If payment fails after clicking Confirm:

1. **Do not immediately retry.** Go to the Orders page first to check whether the order was placed.
2. If the order appears on the Orders page, the payment may have been processed despite the error message. Contact support if unsure.
3. If no order appears, the payment was not completed. Return to the cart and attempt payment again.

Common payment errors:

| Error | Cause | Action |
|---|---|---|
| Payment gateway timeout | Slow connection | Check internet; retry if no order was created |
| Insufficient balance | Low wallet/card balance | Add funds or use a different payment method |
| Card declined | Card limit or bank block | Contact your bank or use another method |
| UPI failure | UPI app issue | Retry with a different UPI ID or payment method |

## Order confirmation

An order is confirmed only when:

1. The payment is successful (or Cash on Delivery is selected).
2. The backend returns a successful order ID.
3. The confirmation page or message is shown.

The AI Assistant will not tell you an order was placed unless the backend has confirmed it.

## Common checkout problems

**Q: Why is my checkout failing?**
A: Common reasons include: an unavailable item, a price change that needs acknowledgment, delivery address outside service radius, or a payment error. The checkout page shows the specific reason.

**Q: My payment failed but I was charged — what do I do?**
A: Go to Orders and check whether an order appears. If it does, the payment was received. If not, the charge is likely a temporary hold that will be released. Do not retry immediately. Check your bank statement and contact support if the amount is not reversed within a few days.

**Q: Can I change items after placing an order?**
A: Once an order is confirmed, items cannot typically be changed. You may be able to cancel if the order status allows it (see Payments and Refunds for cancellation rules). Adding items to an existing confirmed order is not supported — start a new order instead.

**Q: Why does my cart total look different at checkout?**
A: Checkout fetches the latest prices and applies the delivery fee. A price change from a partner, or the addition of the delivery fee, explains any difference.
