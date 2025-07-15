# addPromotionCode.md

This file documents the logic for the `addPromotionCode` controller method. The method handles the **creation of new promotion codes** by authorized admin users. It includes input validation, role-based access control, database interactions, and secure response handling.

---

## 🛠 Function: `addPromotionCode(req, res)`

### 🔐 1. Access Control

```js
if (req.user.role !== 'admin') {
  return res.status(403).json({ error: 'Not authorized' });
}
````

* Ensures that only users with the `admin` role can create promotion codes.
* Rejects others with a `403 Forbidden` error.

---

### 📦 2. Request Content Validation

```js
if (!req.is('application/json')) {
  return res.status(415).json({ error: 'Content-Type must be application/json' });
}
```

* Enforces that the incoming request must have `Content-Type: application/json`.

---

### ✅ 3. Payload Validation via Joi

```js
const { error, value } = promotionCodeSchema.validate(req.body, {
  abortEarly: false,
  stripUnknown: true,
  allowUnknown: false
});
```

* Validates the input against a predefined `Joi` schema:

  * `abortEarly: false` reports all validation errors.
  * `stripUnknown: true` removes unknown fields.
  * `allowUnknown: false` disallows unspecified fields.

* On failure, returns a `400 Bad Request` with validation details.

---

### ⚠️ 4. Special Case Handling

```js
if (value.promotionType === 'percentage' && !value.maxDiscountAmount) {
  return res.status(400).json({ error: 'Percentage discounts require a maxDiscountAmount' });
}
```

* Ensures that if the promotion is a **percentage discount**, a `maxDiscountAmount` must be provided to prevent unlimited discount misuse.

---

### 🧱 5. Promotion Code Creation

```js
const newPromotionCode = await PromotionCode.createPromotionCode(value, req.user._id);
```

* Uses a static method (`createPromotionCode`) from the `PromotionCode` model to insert the new promotion into the database.
* The `admin` user's ID is passed as the creator.

---

### 📜 6. Audit Logging

```js
await AuditLog.createLog({ ... });
```

* Records the promotion code creation in an `AuditLog` collection.
* Stores metadata like code, type, and status.
* Includes request details such as `IP`, `User-Agent`, and `user ID`.

---

### 📤 7. Response Formatting

```js
const response = {
  message: "Promotion code created successfully",
  promotionCode: { ... },
  links: {
    view: `/promotion-codes/${newPromotionCode._id}`,
    edit: `/admin/promotion-codes/${newPromotionCode._id}/edit`
  }
};
```

* Returns structured metadata:

  * Code details (ID, type, status, start/end dates, usage info).
  * Helpful links for front-end UI to **view** or **edit** the code.

* Response includes security headers:

  ```js
  res
    .set('X-Content-Type-Options', 'nosniff')
    .set('X-Frame-Options', 'DENY')
    .status(201)
    .json(response);
  ```

---

## ❌ 8. Error Handling

### General Errors

```js
res.status(500).json({ error: 'Internal server error' });
```

### Mongoose Validation Errors

```js
if (error.name === 'ValidationError') { ... }
```

### Duplicate Key Error (e.g., code already exists)

```js
if (error.message === 'Promotion code already exists') {
  return res.status(409).json({ error: error.message });
}
```

* Logs full stack traces for debugging using a custom `logger`.

---

## 🔐 Summary

This method demonstrates best practices in:

* **Access control**
* **Strict validation**
* **Structured logging**
* **Audit trail creation**
* **Secure and informative responses**

## 📥 Request Body Example (JSON)

```json
{
  "promotionCode": "SUMMER2025",
  "promotionType": "percentage",            // or "fixed"
  "promotionAmount": 15,                    // 15% if type is percentage, or fixed amount
  "maxDiscountAmount": 50,                  // Required if type is "percentage"
  "minPurchaseAmount": 100,
  "startDate": "2025-07-01T00:00:00.000Z",
  "endDate": "2025-07-31T23:59:59.999Z",
  "usageLimit": 500,
  "status": "active",                       // e.g., "active", "inactive"
  "applicableCategories": ["60df1f77bcf86cd799439011", "60df1f77bcf86cd799439012"],
  "excludedProducts": ["60df1f77bcf86cd799439099"]
}
