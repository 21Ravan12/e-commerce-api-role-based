# ordersSchema.md

This file defines **Joi validation schemas** for admin-level order management. It includes two main schemas:

1. `getAdminOrdersSchema` – Used for **filtering and paginating** admin order queries.
2. `updateAdminOrderSchema` – Used for **updating order information** by admins.

Validation is built with descriptive error messages and defensive defaults to ensure safe and predictable behavior.

---

## 📄 `getAdminOrdersSchema`

This schema validates the query parameters when an admin requests a list of orders with filters or sorting options.

### 🔹 Pagination
- `page`: Integer ≥ 1, default is `1`.  
  > Custom error messages enforce number type and range.
- `limit`: Integer between `1` and `100`, default is `10`.  
  > Protects performance and prevents abuse.

### 🔹 Filtering
- `status`: Must be one of:
  - `pending`, `processing`, `shipped`, `delivered`, `cancelled`, `refunded`
- `idCustomer`: Must match MongoDB ObjectId format (24 hex chars).
- `dateFrom` / `dateTo`: ISO 8601 date strings (`YYYY-MM-DD`).
- `minTotal` / `maxTotal`: Numeric values ≥ 0.

### 🔹 Sorting
- `sortBy`: Sort field; must be one of:
  - `createdAt`, `updatedAt`, `total`, `estimatedDelivery`
  - Default: `createdAt`
- `sortOrder`: Sort direction; either `asc` or `desc`  
  - Default: `desc`

> ⚠️ The schema uses `.options({ abortEarly: false })` to **collect all validation errors at once** instead of stopping at the first error.

---

## 📝 `updateAdminOrderSchema`

This schema validates the request body for updating an individual order's data.

### 🔹 Fields
- `status`: New order status. Must be one of:
  - `pending`, `processing`, `shipped`, `delivered`, `cancelled`, `refunded`
- `paymentStatus`: Payment state of the order.
  - Options: `pending`, `completed`, `failed`, `refunded`
- `shippingAddress`: Object with fields:
  - `street`, `city`, `state`, `postalCode`, `country` (all optional strings)
- `shippingMethod`: Must be one of:
  - `standard`, `express`, `next_day`
- `adminNotes`: Optional notes for admin use.
  - Max length: 1000 characters.
- `forceUpdate`: Optional boolean. Defaults to `false`.
  - Indicates whether the update should override usual restrictions.

### 🔸 Requirements
- `.min(1)` enforces that **at least one field must be provided**.
- Also uses `.options({ abortEarly: false })` to return **all validation errors** at once.

---

## ✅ Summary

These schemas:
- Ensure **data integrity** for both fetching and updating orders.
- Provide **detailed validation errors** for better UX.
- Help prevent malformed or malicious data from reaching the database layer.

---

## 📤 Exports

```js
module.exports = {
  getAdminOrdersSchema,
  updateAdminOrderSchema
};
