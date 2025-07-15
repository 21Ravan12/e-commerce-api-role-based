# ordersSchema.md

This file defines **Joi validation schemas** for order-related operations, ensuring that API requests conform to expected formats and business rules. It covers creation, retrieval, updating, cancellation, and admin-specific order queries.

---

## 📦 createOrderSchema

Validates data for creating a new order:

- **shippingAddress** (required object):
  - `street`, `city`, `state`, `postalCode`, `country`: all required strings with custom error messages.
- **promotionCode** (optional string):
  - Minimum length 3, maximum 20 characters.
- **paymentMethod** (required string):
  - Must be one of: `'credit_card'`, `'paypal'`, `'stripe'`, `'cod'`, `'bank_transfer'`, `'cash_on_delivery'`.
- **shippingMethod** (optional string):
  - One of `'standard'`, `'express'`, `'next_day'`.
  - Defaults to `'standard'` if not specified.
- Uses `abortEarly: false` to report all validation errors at once.

---

## 🔍 getOrdersSchema

Used to validate query parameters when retrieving orders (typically for customers):

- Pagination:
  - `page`: integer ≥ 1, default 1.
  - `limit`: integer between 1 and 100, default 10.
- Optional filters:
  - `status`: must be one of `'pending'`, `'processing'`, `'shipped'`, `'delivered'`, `'cancelled'`, `'refunded'`.
- Sorting:
  - `sortBy`: one of `'createdAt'`, `'total'`, `'estimatedDelivery'` (default `'createdAt'`).
  - `sortOrder`: `'asc'` or `'desc'` (default `'desc'`).

---

## 🛠 getAdminOrdersSchema

Similar to `getOrdersSchema`, but with additional admin-specific filters:

- All filters from `getOrdersSchema`.
- `idCustomer`: optional, must match a MongoDB ObjectId format.
- Date range:
  - `dateFrom` and `dateTo`: optional ISO date strings.
- Total order value filters:
  - `minTotal` and `maxTotal`: numbers ≥ 0.
- Sorting includes `updatedAt` as an additional option.
- Same pagination and sorting defaults as `getOrdersSchema`.

---

## ✏️ updateOrderSchema

Validates partial updates to an order:

- Optional fields, but at least one required (`min(1)`):
  - `status`: must be one of valid order statuses.
  - `paymentStatus`: one of `'pending'`, `'completed'`, `'failed'`, `'refunded'`.
  - `shippingAddress`: object with optional fields (`street`, `city`, `state`, `postalCode`, `country`).
  - `shippingMethod`: one of `'standard'`, `'express'`, `'next_day'`.
- Prevents empty updates by enforcing at least one key.

---

## ❌ cancelOrderSchema

Validates order cancellation requests:

- `status` must be `'cancelled'`.
- Optional `cancellationReason`: max 500 characters.
- Ensures clear and concise cancellation data.

---

## 🛠 updateAdminOrderSchema

Allows admin-level updates with extended options:

- Same fields as `updateOrderSchema`.
- Additional fields:
  - `adminNotes`: optional string up to 1000 chars.
  - `forceUpdate`: optional boolean, defaults to `false`.
- Also requires at least one field to be provided.

---

## Summary

- All schemas use **detailed custom error messages** for clarity.
- Pagination and sorting defaults promote consistent API behavior.
- Status and paymentStatus fields use **strict enums** to prevent invalid states.
- Validation prevents empty or malformed requests, improving data integrity.
- Admin schemas offer enhanced control with extra filters and notes.

---

## Exported Schemas

- `createOrderSchema`
- `getOrdersSchema`
- `getAdminOrdersSchema`
- `updateOrderSchema`
- `cancelOrderSchema`
- `updateAdminOrderSchema`

These schemas are designed to be used in API request validation middleware, ensuring reliable, secure, and user-friendly order management.
