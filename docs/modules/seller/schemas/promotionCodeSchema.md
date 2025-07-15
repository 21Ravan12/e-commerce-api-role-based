# promotionCodeSchema.md

This file defines **Joi validation schemas** for creating, updating, and querying promotion codes in a system, enforcing strong data integrity and business rules.

---

## 🧩 Common Validator

### `objectIdValidator`
- Custom Joi validator to ensure a string is a valid MongoDB `ObjectId`.
- Uses Mongoose's `ObjectId.isValid` method.
- Returns a validation error if invalid, otherwise returns the value.

### `objectId`
- A Joi string using the above custom validator.
- Provides clear error messages if the value is not a valid MongoDB ObjectId.

---

## 🎟 Promotion Code Creation Schema: `promotionCodeSchema`

Defines required and optional fields for **creating** a new promotion code.

- **promotionCode**: Required string, 1–50 characters.
- **startDate**: Required ISO date string indicating when the promotion starts.
- **endDate**: Required ISO date string; must be equal or later than `startDate`.
- **usageLimit**: Optional integer ≥1 or null; limits how many times the code can be used.
- **promotionType**: Required string enum:
  - `'fixed'` — fixed discount amount
  - `'percentage'` — percentage discount
  - `'free_shipping'` — free shipping offer
  - `'bundle'` — bundled product discount
- **promotionAmount**: Required number ≥0 indicating discount value.
- **minPurchaseAmount**: Optional minimum purchase amount to apply promotion.
- **maxDiscountAmount**: Optional maximum cap on discount amount; can be null.
- **applicableCategories**: Optional array of valid MongoDB ObjectIds referencing product categories.
- **excludedProducts**: Optional array of product ObjectIds excluded from promotion.
- **singleUsePerCustomer**: Optional boolean flag indicating if code can be used once per customer.
- **customerEligibility**: String enum with default `'all'`:
  - `'all'`, `'new_customers'`, `'returning_customers'`, `'specific_customers'`
- **eligibleCustomers**: Conditional array of ObjectIds:
  - Required if `customerEligibility` is `'specific_customers'`.
  - Otherwise defaults to empty array.

---

## ✍ Promotion Code Update Schema: `promotionCodeUpdateSchema`

Used to **update** existing promotion codes, allowing partial updates but requiring at least one field.

- Same fields as creation schema but all optional.
- Adds a `status` field: `'active'`, `'inactive'`, `'expired'`.
- Enforces `endDate` ≥ `startDate` if both provided.
- Conditionally requires `eligibleCustomers` if `customerEligibility` is `'specific_customers'`.
- Requires at least one field to be present (`.min(1)`).

---

## 🔎 Promotion Code Query Schema: `promotionCodeGetSchema`

Validates query parameters for fetching promotion codes with pagination and filtering.

- **page**: Integer ≥1, defaults to 1.
- **limit**: Integer 1–100, defaults to 10.
- **status**: Filter by promotion status: `'active'`, `'inactive'`, `'expired'`, `'upcoming'`.
- **type**: Filter by promotion type: `'percentage'` or `'fixed'`.
- **active**: Boolean flag to filter currently active promotions.
- **search**: Optional trimmed string up to 100 characters for keyword search.

---

## ⚙️ Exported Schemas

- `promotionCodeSchema` — for validating new promotion codes.
- `promotionCodeUpdateSchema` — for validating updates to promotions.
- `promotionCodeGetSchema` — for validating query/filter parameters.

---

These schemas ensure consistent, robust data validation for promotion-related operations, improving API reliability and enforcing business logic constraints early.
