# Account and profile

## Signing in

Anywhere requires customers to sign in to access the cart, place orders, track order history, and use the AI Assistant's personalised features. Use the registered mobile number or email and password to sign in. If you have forgotten your password, use the "Forgot Password" option on the sign-in page.

The AI Assistant can help with general guidance but will always direct you to sign in before accessing any order or cart data.

## Session expiration

For security, user sessions expire after a period of inactivity. When your session expires:

- You will be redirected to the sign-in page.
- The AI Assistant will ask you to sign in again before performing any authenticated actions (cart, orders, profile).
- Your cart contents are preserved in the database and restored after signing back in.

If you see an "Unauthorised" or "Session expired" error, sign in again. You do not need to start a new order from scratch.

## Profile district selection

The district you select in your profile is the primary filter for all service listings — restaurants, grocery stores, pharmacies, and courier availability. Selecting the wrong district means you will see listings from a different area.

**To update your district:**
1. Tap the Profile icon (or go to Profile from the menu).
2. Select the District field.
3. Choose the correct district from the list.
4. Save the change.

After changing your district, return to any service page and refresh to see updated listings.

## Address management

You can save multiple delivery addresses for quick checkout. Addresses are stored in your account and tied to your authenticated identity.

**To add an address:**
1. Go to Profile → Addresses (or Saved Addresses).
2. Tap "Add New Address".
3. Fill in the title (e.g., Home, Office), full address, city, and pincode.
4. Save.

**To edit or delete an address:** Open the address in your profile and tap Edit or Delete.

You can also use "Use My Location" to detect your current GPS position. The platform uses this to determine your district and area automatically. Your actual delivery address still needs to be confirmed or selected from saved addresses at checkout.

**Important:** The AI Assistant can list your saved addresses when you ask, but it will only show addresses for the currently signed-in user. Never share your full address with third parties or in chat messages.

## Authentication-related errors

| Error | Cause | Action |
|---|---|---|
| "Please sign in" | Not authenticated | Sign in from the sign-in page |
| "Session expired" | Inactive session timed out | Sign in again; cart is preserved |
| "Unauthorised" | JWT token invalid or missing | Sign in again |
| Cannot see profile data | Signed into wrong account | Sign out and sign into the correct account |

## Troubleshooting inaccessible account features

If you can sign in but cannot access certain features:

- **Cart is empty** — You may have signed into a different account than when you added items. Sign out and back in to the correct account.
- **Orders missing** — Orders are tied to the authenticated user account. Confirm you are signed into the account that placed the orders.
- **Profile not saving** — Check your internet connection and try again.
- **Address not being accepted** — Ensure the pincode is correct and the city/district matches.

## Privacy and account safety

- Your personal profile, saved addresses, and contact number are encrypted and stored securely.
- Personal data is shared only with assigned delivery partners strictly for order fulfillment purposes.
- Data is never sold to third parties.
- Never share your password, OTP, JWT token, or payment credentials with anyone — including support contacts. Anywhere support staff will never ask for these.
- If you believe your account has been compromised, change your password immediately and contact support through the official support channel.

**The AI Assistant will never ask for your password, OTP, payment card details, or any authentication token.** If you receive such a request in any channel claiming to be Anywhere, it is not legitimate.
