# campaignSchema.md

This file defines **Joi validation schemas** for administrative order management endpoints. These schemas ensure incoming request data is correctly structured and validated before it is processed, helping prevent logic errors and maintaining API integrity.

---

## 📦 `getAdminOrdersSchema`

This schema is used to **validate query parameters** when an admin retrieves a list of customer orders.

### ✅ Fields:

- **`page`** (`number`, default: `1`)
  - Must be an integer ≥ 1.
  - Validates pagination.
  - Custom error messages for type and range.

- **`limit`** (`number`, default: `10`)
  - Must be an integer between `1` and `100`.
  - Prevents excessive pagination sizes.

- **`status`** (`string`, optional)
  - Must be one of:
    - `pending`, `processing`, `shipped`, `delivered`, `cancelled`, `refunded`
  - Helps filter orders by fulfillment status.

- **`idCustomer`** (`string`, optional)
  - Must match MongoDB ObjectId pattern (24 hex characters).
  - Ensures only valid customer IDs are accepted.

- **`dateFrom` / `dateTo`** (`date`, optional)
  - Must be valid ISO 8601 dates (e.g., `YYYY-MM-DD`).
  - Enables filtering by order creation date range.

- **`sortBy`** (`string`, default: `createdAt`)
  - Must be one of:
    - `createdAt`, `updatedAt`, `total`, `estimatedDelivery`
  - Defines the sorting field for results.

- **`sortOrder`** (`string`, default: `desc`)
  - Must be either `asc` or `desc`.

- **`minTotal` / `maxTotal`** (`number`, optional)
  - Must be ≥ 0.
  - Enables filtering by order amount range.

### ⚠️ Options
- `abortEarly: false`: Allows returning all validation errors instead of stopping at the first one.

---

## ✏️ `updateAdminOrderSchema`

This schema validates the body of a **PATCH request** for updating an existing order by an admin.

### ✅ Fields:

- **`status`** (`string`)
  - Must be one of:
    - `pending`, `processing`, `shipped`, `delivered`, `cancelled`, `refunded`
  - Updates the fulfillment status of the order.

- **`paymentStatus`** (`string`)
  - Must be one of:
    - `pending`, `completed`, `failed`, `refunded`
  - Updates payment status separately.

- **`shippingAddress`** (`object`)
  - Optional nested object with fields:
    - `street`, `city`, `state`, `postalCode`, `country` (all strings).
  - Used for updating or correcting delivery info.

- **`shippingMethod`** (`string`)
  - Must be one of:
    - `standard`, `express`, `next_day`

- **`adminNotes`** (`string`, optional)
  - Max 1000 characters.
  - Stores internal notes about the order.

- **`forceUpdate`** (`boolean`, default: `false`)
  - Flag for overriding business rules if needed.

### ⚠️ Constraints:
- `.min(1)`: Requires at least one field to be present in the request.
- `abortEarly: false`: Returns all validation errors for better debugging.

---

## 🧩 Exports

```js
module.exports = { getAdminOrdersSchema, updateAdminOrderSchema };
