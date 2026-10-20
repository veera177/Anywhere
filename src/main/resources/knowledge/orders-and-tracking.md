# Orders and tracking

## Accessing the Orders page

To view your orders, you must be signed in. Open the Orders section from the main navigation or tell the AI Assistant: *"Show my orders"* or *"Order history."* The Orders page lists all orders placed by the authenticated customer, sorted by most recent first.

If you are not signed in, the AI Assistant will prompt you to sign in before it can retrieve your order information.

## Finding a previously placed order

The Orders page shows all confirmed orders for the signed-in account. Each order card shows:

- Order ID
- Order date and time
- Items ordered
- Total amount
- Current order status

Tap an order card to view the full detail, including individual items, the delivery address used, payment method, and the latest status.

If you placed an order but cannot find it in the Orders page, refer to the troubleshooting section below.

## Understanding order statuses

The Anywhere platform uses the following order statuses (returned by the backend):

| Status | Meaning |
|---|---|
| `ORDER_PLACED` | Order has been submitted and is awaiting partner confirmation |
| `RESTAURANT_ACCEPTED` | The restaurant/store has confirmed the order |
| `PREPARING` | The partner is preparing your order |
| `READY_FOR_PICKUP` | Order is ready and awaiting a delivery partner |
| `OUT_FOR_DELIVERY` | A delivery partner has picked up the order and is on the way |
| `DELIVERED` | The order has been delivered to the address |
| `CANCELLED` | The order was cancelled (by customer, partner, or system) |

The AI Assistant reports only the status returned by the backend. It does not invent, guess, or interpret status beyond what the backend provides. Status labels may vary slightly based on the service type (Food, Grocery, Medicine, or Courier).

## Troubleshooting missing orders

If an order you placed is not appearing:

1. **Confirm you are signed into the correct account.** Orders are tied to the account that placed them. If you used a different phone number or email to place the order, sign out and sign into that account.
2. **Check if checkout was completed.** If you left the checkout page before payment was confirmed, the order may not have been created.
3. **Wait a moment and refresh.** In rare cases, the order may take a few seconds to appear after confirmation.
4. **Check your bank/UPI statement.** If a payment was deducted but no order appears, contact support with the payment reference number.

## Authentication issues

All order information is scoped to the authenticated customer. The AI Assistant retrieves orders using the backend's authenticated identity — it does not accept a manually typed user ID to look up orders. If you ask the AI to "check order for user 123", the assistant will only check orders belonging to the currently signed-in user, not an arbitrary user ID.

If the assistant cannot retrieve orders, it is because the authenticated session is not available or has expired. Sign in again.

## Booking confirmation

A booking or order is confirmed only when:

1. The backend returns a successful order ID.
2. The confirmation page or confirmation message is displayed.
3. The order appears in the Orders section.

If none of these happen, the order was not placed. Do not assume an order was placed based on a payment being initiated alone — confirm through the Orders page.

## Order status errors

If the order status is not updating or appears stuck:

1. Refresh the Orders page.
2. Sign out and sign back in to refresh the session.
3. If the status has not changed for an unusually long time compared to normal delivery expectations, contact support.

The AI Assistant will report whatever status the backend returns. It cannot force a status update or contact the delivery partner on your behalf.

## What the AI Assistant will not invent

The AI Assistant will never fabricate:

- Order status
- Delivery partner name or location
- Estimated arrival time (ETA)
- Live GPS tracking coordinates
- Package contents not recorded in the order

If live tracking or real-time ETA is not returned by the backend, the AI will say it does not have that information. Reference the Orders page and any communication from the delivery partner for real-time updates.
