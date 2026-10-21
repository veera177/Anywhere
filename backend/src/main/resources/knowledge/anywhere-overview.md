# Anywhere overview

## What is Anywhere?

Anywhere is a district-based hyperlocal delivery platform operating in Tamil Nadu, India. Its tagline is **"Connecting Every District, Serving Every Community."** The platform connects customers with verified local businesses — restaurants, grocery stores, pharmacies, and courier partners — across every district it serves.

Anywhere's core model does not depend on company-owned warehouses or dark stores. Every order is fulfilled directly by a verified local partner. This means customers receive fresh, locally-sourced products and services, while neighbourhood businesses gain digital access to their community.

## Four services

Anywhere offers exactly four services:

1. **Food Delivery** — Order meals and dishes from local restaurants within the service area.
2. **Grocery Delivery** — Order daily essentials and grocery products from local stores.
3. **Medicine Delivery** — Order medicines and health products from registered pharmacies.
4. **Courier Service** — Book on-demand parcel pickup and delivery between two addresses.

## How customers use the platform

Customers open the Anywhere app or website, select their district, then browse or search for what they need within the service. After choosing products, customers add items to the cart, review the order total and delivery fee at checkout, and complete payment. The system confirms the order with the relevant partner. Customers can track confirmed orders from the Orders page.

## How district selection affects service listings

Every listing on Anywhere — restaurant, store, pharmacy, or courier partner — is tied to a district and a configured service radius. When a customer selects a district in their profile, the platform shows only partners and products available in that district. Changing the district updates all listings.

If a customer's delivery address falls outside the service radius of a partner, that partner will not appear even though it is in the same district. Availability is always calculated from each partner's registered location to the customer's delivery address.

## How service radius and partner location work

Each service uses a configured default radius:

- **Food Delivery**: 15 km from the restaurant's registered location.
- **Grocery Delivery**: 25 km from the grocery store's registered location.
- **Medicine Delivery**: 25 km from the pharmacy's registered location.
- **Courier Service**: 30 km between pickup and drop points under configured courier rules.

These radii are platform-configured defaults. The actual value in effect at any time is read from the current backend settings, not hardcoded in this document. The backend validates serviceability before every checkout.

## What the AI Assistant can help with

The Anywhere AI Assistant can:

- Explain how each of the four services works.
- Help customers search for restaurants, grocery products, medicines, and courier options.
- Explain delivery fees, service radii, and how checkout works.
- Explain how to track orders, manage a cart, or update a profile address.
- Answer general policy questions using the knowledge base.
- Add products to the cart on behalf of the customer.
- Retrieve the current order status for authenticated customers.

## What must be retrieved live from the backend

The AI Assistant never invents or guesses the following — it retrieves them from the backend:

- Current restaurant or store availability in a district.
- Current product prices and stock status.
- Calculated delivery fees for a specific order or route.
- Order status, tracking updates, and order history.
- Cart contents and cart totals.
- Refund or cancellation status for a specific order.
- Whether a specific delivery address is within the service area.
- Current platform fee amounts or commission rates.

## Supported districts and live data

Anywhere serves multiple districts across Tamil Nadu. The current list of supported districts is stored in the backend database. The AI Assistant reads districts from the live backend rather than relying on a fixed list, so newly added districts are automatically reflected.

If a customer asks about a district not currently served, the AI Assistant will say it cannot confirm service availability there and suggest contacting support.
