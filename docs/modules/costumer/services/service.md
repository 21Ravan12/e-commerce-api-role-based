# service.md

This module provides core **business logic services** related to orders, promotions, taxes, and shipping calculations in the e-commerce system. It interacts with models like `PromotionCode`, `Order`, and `Product` and logs important events/errors.

---

## 🧾 Tax Calculation

### `calculateTax(subtotal, shippingAddress)`
- Calculates tax based on the order subtotal and shipping address.
- Currently implements a simple flat 10% tax rate.
- Logs the calculated tax for debugging.
- Throws an error with logging if calculation fails.

---

## 🚚 Shipping Cost Calculation

### `calculateShipping(shippingMethod)`
- Returns shipping cost for given method: standard, express, or overnight.
- Defaults to standard if unknown method is passed, with a warning log.

---

## 📅 Delivery Date Calculation

### `calculateDeliveryDate(orderDate, shippingMethod)`
- Computes estimated delivery date based on order date and shipping method.
- Delivery times: standard (5 business days), express (3 business days), overnight (1 business day).
- Skips weekends when counting business days.
- Throws error on invalid date inputs.

---

## 🎁 Promotion Validation & Application

### `validateAndApplyPromotion(promotionCode, userId, cartItems, subtotal)`
- Validates a promotion code against:
  - Existence and active status.
  - Customer eligibility (specific customers only).
  - Single-use per customer constraint.
  - Global usage limits.
  - Minimum purchase amount requirement.
  - Applicability to cart product categories.
  - Exclusion of certain products.
- Calculates discount based on promotion type:
  - Fixed amount discount.
  - Percentage discount (with optional max discount cap).
  - Free shipping.
  - Bundle logic placeholder.
- Returns the calculated discount amount and detailed promotion metadata.
- Throws descriptive errors if validation fails.

---

## 🔄 Promotion Usage Update

### `updatePromotionUsage(promotionId)`
- Increments usage count for a promotion.
- Adds the user to the `usedBy` list to track usage per customer.
- Skips if no `promotionId` provided.

---

## ⚙️ Logging & Error Handling

- Uses a centralized `logger` service to record debug info, warnings, and errors.
- Errors in service functions are caught, logged, and rethrown or handled gracefully.

---

## 📦 Exported Functions

- `calculateTax`: Computes tax for an order.
- `calculateShipping`: Determines shipping cost by method.
- `calculateDeliveryDate`: Estimates delivery date excluding weekends.
- `validateAndApplyPromotion`: Validates and calculates promotion discounts.
- `updatePromotionUsage`: Tracks promotion code usage incrementally.

---

This module encapsulates key **order-related calculations and validations** to keep the business logic clean, maintainable, and centralized.
