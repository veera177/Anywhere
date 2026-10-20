# Prescription Module Audit

## Backend

- Medicine catalog: `src/main/java/com/app/start_app/medicine/MedicineProduct.java`
- Medicine data access: `src/main/java/com/app/start_app/medicine/MedicineProductDAO.java`
- Medicine endpoints: `src/main/java/com/app/start_app/medicine/MedicineProductController.java`
- Existing medicine schema: `database/pharmacy.sql` and `database/seed_new_districts.sql`
- Existing orders: `src/main/java/com/app/start_app/order/Order.java`, `OrderDAO.java`, `OrderService.java`, `OrderController.java`, and `database/orderitems.sql`
- Existing cart joins medicine products in `src/main/java/com/app/start_app/cart/CartDAO.java`.
- Existing payment flow: `src/main/java/com/app/start_app/payment/PaymentController.java`, `PaymentService.java`, `PaymentDAO.java`; frontend payment is under `src/pages/Payment/`.
- Prescription-specific table, entity, controller, service, DAO, status, or columns: **not found - will create new**.
- Existing `medicine_products` has no `schedule_type`, `requires_prescription`, or `prescription_required` column.
- Existing `medicines` table: **not found**; this project uses `medicine_products`.

## Frontend

- Medicine catalog: `src/pages/MedicineDelivery/MedicineDelivery.jsx` and `MedicineDelivery.css`.
- Shared cart: `src/pages/Cart/Cart.jsx` and related cart components/services.
- Checkout: `src/pages/Checkout/Checkout.jsx` and `Checkout.css`.
- Payment: `src/pages/Payment/Payment.jsx` and `Payment.css`.
- Orders/tracking: `src/pages/Orders/Orders.jsx`, `src/components/CourierTracking.jsx`, and `src/components/CourierTracking.css`.
- Existing prescription UI/components/hooks: **not found - will create new**.

## Platform Settings

- Settings schema and reads: `src/main/java/com/app/start_app/platform/PlatformSettingDAO.java`.
- Existing delivery settings are seeded in `database/delivery-fee-settings.sql` and read through `PlatformSettingDAO.getValue`, `getDecimal`, and `getRequiredDecimal`.
- New prescription delay, file-size, validity, and rejection-reason values must use this same table/DAO pattern.

## Existing Orderability Assumptions To Modify

- `MedicineProductDAO.getMedicineProducts(...)` returns every available medicine without prescription classification.
- `CartDAO.getCartByUser(...)` resolves medicine products but does not expose or validate prescription requirements.
- The shared checkout/payment flow currently has no medicine prescription status gate.
- The current order schema has no prescription link; this will be added by a nullable `prescription_id` relationship only if compatible with the existing order table.

## Scope Decisions

- Schedule X / narcotic-controlled medicines are excluded from this module by design and will not be modeled.
- Verification is a clearly labeled simulated review flow; no OCR or real medical verification will be added.
