# Payments and refunds

## Payment methods supported

Anywhere supports secure online payments through Razorpay, which includes:

- UPI (Google Pay, PhonePe, BHIM, and other UPI-enabled apps)
- Credit and Debit cards (Visa, Mastercard, RuPay)
- Net Banking
- Digital wallets (where supported by Razorpay)
- Cash on Delivery (COD) — available for Food and Grocery orders in active districts

The supported payment options are displayed at checkout. The availability of COD for a specific order depends on the order type, partner, and district.

## General payment troubleshooting

If a payment attempt fails:

1. **Check Orders first.** Sometimes the payment succeeds but the confirmation page fails to load. If your order appears in the Orders page, the payment went through.
2. Verify your internet connection and try again.
3. Confirm your payment method has sufficient balance or credit.
4. If using UPI, make sure your UPI app is up to date and the linked account has funds.
5. If the payment gateway shows a timeout, do not retry immediately — wait 1–2 minutes and check the Orders page first.
6. Try a different payment method.

Do not submit payment multiple times for the same order without checking Orders first, as this can result in multiple charges.

## How to handle payment failure questions

If you ask the AI Assistant about a payment failure, it will:

- Check the Orders page for the authenticated customer to see if an order was created.
- Report the order status as returned by the backend.
- Direct you to the configured support channel for unresolved payment disputes.

The AI Assistant does not have access to payment gateway transaction logs. For specific transaction details, contact your bank or use the Razorpay transaction reference if one was provided.

## How to handle cancellation questions

**When cancellation is allowed:**
Orders in the `ORDER_PLACED` or `RESTAURANT_ACCEPTED` status may be eligible for cancellation. Once an order moves to preparation, picked-up, or out-for-delivery status, cancellation is generally not permitted.

**To cancel:**
1. Go to Orders.
2. Open the relevant order.
3. Use the Cancel button if available.

The Cancel button appears only when the current order status allows cancellation. If the button is not shown, the order has progressed beyond the cancellation window.

**The AI Assistant cannot cancel an order on your behalf.** It can tell you the current order status and explain whether cancellation may be possible based on that status.

> **Note:** The exact cancellation window and rules are governed by the live application. If the application behavior differs from the above, the application takes precedence. The AI Assistant will not guarantee that a cancellation will succeed without a backend confirmation.

## How to answer refund questions

Refunds are applicable when:

- An order is successfully cancelled within the allowed cancellation window.
- An item is out of stock and cannot be fulfilled by the partner.
- There is a verified payment discrepancy.

**Refund method:**
Refunds are typically returned to the original payment method used for the order. For COD orders, refunds are issued to a verified UPI ID or bank account provided by the customer.

**Refund timeline:**
The FAQ document states a typical processing period of 5–7 business days. However, the actual timeline depends on the payment provider, your bank, and the refund method. The AI Assistant will not guarantee a specific refund date.

**What the AI Assistant cannot do:**
- Approve a refund.
- Guarantee a refund amount.
- Promise a specific refund completion date.
- Access payment provider transaction records.

If the current application's refund policy differs from what is documented here, the AI Assistant will say it cannot confirm the policy and will direct you to the support channel.

## How to check a specific order's refund status

To check a specific order's refund status:

1. Sign in to your account.
2. Go to Orders → find the relevant order.
3. Open the order detail.
4. If a refund has been initiated, the order status or a refund note should reflect this.

The AI Assistant can check your most recent order status when you are signed in. Ask: *"What is the status of my last order?"* or *"Track my order."* For specific historical orders, navigate to the Orders page directly.

If the refund status is not visible in the order detail, it has either not been initiated yet or the information is not available in the current backend response. Contact support for order-specific refund tracking.

## When to direct a customer to the configured support channel

Direct the customer to support when:

- A payment was charged but no order appears and the issue persists after waiting.
- A refund was expected but has not arrived after the stated processing period.
- An order was cancelled but no refund communication was received.
- A payment dispute needs to be raised with the payment provider.
- The AI Assistant cannot verify the order status or refund status from the backend.

The AI Assistant does not provide a specific support phone number or email address in this document, as contact details may change. Use the support option within the application or the contact information displayed on the official Anywhere website.

## Frequently asked customer questions

**Q: My payment went through but the order did not appear. What happened?**
A: This can happen if the payment was processed but the order confirmation step timed out. Check the Orders page. If no order appears after a few minutes, the payment may be reversed automatically. Contact support if the charge remains on your statement after 48 hours.

**Q: Can I get a refund for an order I don't want anymore?**
A: Only if the order is in a status that allows cancellation (ORDER_PLACED or RESTAURANT_ACCEPTED). Cancellation after preparation has started is not supported. If eligible, cancel from the Orders page and the refund will be processed according to the current policy.

**Q: How long does a refund take?**
A: Refunds are typically processed back to the original payment method. Timelines depend on the payment provider and your bank. The application FAQ mentions 5–7 business days, but this is not guaranteed for all cases. Contact support if your refund is significantly delayed.

**Q: Will the AI confirm whether my refund was approved?**
A: The AI Assistant can report the order status as returned by the backend. If a refund has been initiated, it may appear in the order details. The AI cannot approve, process, or guarantee refund outcomes.
