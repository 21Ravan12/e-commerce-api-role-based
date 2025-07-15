# updatePromotionCode.md

This method, `updatePromotionCode(req, res)`, is a secured controller function responsible for updating an existing promotion code. It ensures that only administrators can perform the action and validates the incoming data thoroughly before persisting any changes. Here's a detailed breakdown of its behavior:

---

## 🔐 Access Control
```js
if (req.user.role !== 'admin') {
  return res.status(403).json({ error: 'Not authorized' });
}
````

* Only users with the role `admin` are allowed to update promotion codes.
* Any non-admin request receives a **403 Forbidden** response.

---

## 🧾 Content-Type Validation

```js
if (!req.is('application/json')) {
  return res.status(415).json({ error: 'Content-Type must be application/json' });
}
```

* The API only accepts `application/json` payloads.
* If the request uses a different content type, it responds with **415 Unsupported Media Type**.

---

## 🧪 Schema Validation with Joi

```js
const { error, value } = promotionCodeUpdateSchema.validate(req.body, {
  abortEarly: false,
  stripUnknown: true,
  allowUnknown: false
});
```

* Validates input data against a predefined `promotionCodeUpdateSchema`.
* Options:

  * `abortEarly: false` collects all validation errors instead of stopping at the first.
  * `stripUnknown: true` removes any fields not defined in the schema.
  * `allowUnknown: false` prevents unexpected keys from being accepted.
* If validation fails, a **400 Bad Request** is returned with detailed messages.

---

## ⚠️ Business Rule Enforcement

```js
if (value.promotionType === 'percentage' && value.promotionAmount && !value.maxDiscountAmount) {
  return res.status(400).json({ error: 'Percentage discounts require a maxDiscountAmount' });
}
```

* Ensures that percentage-based discounts include a cap (`maxDiscountAmount`) to prevent abuse.
* Missing this cap triggers a **400** response with an explanatory error.

---

## 🛠️ Updating the Promotion Code

```js
const updatedPromotionCode = await PromotionCode.updatePromotionCode(req.params.id, value);
```

* Calls a static model method to update the promotion code in the database.
* Likely handles finding the promotion code by ID and applying the changes.

---

## 📝 Audit Logging

```js
await AuditLog.createLog({ ... });
```

* Logs the update operation in an audit trail:

  * Event type, action, entity info
  * User who performed the update
  * Metadata about the new state of the promotion code
* Includes request source details like IP and `User-Agent`.

---

## 📤 Successful Response

```js
res
  .set('X-Content-Type-Options', 'nosniff')
  .set('X-Frame-Options', 'DENY')
  .status(200)
  .json(response);
```

* Returns a detailed success response with:

  * Promotion code data (e.g., status, limits, dates, usage)
  * Navigation links to view or edit the code
* Sets secure headers to prevent content sniffing and clickjacking.

---

## ❌ Error Handling

```js
if (error.name === 'ValidationError') { ... }
```

* Distinguishes between Joi validation errors and Mongoose validation errors.
* Known errors like:

  * Invalid ID format
  * Non-existent promotion code
    are caught and returned as **400 Bad Request**.
* Unknown/unexpected errors return a **500 Internal Server Error** with a basic message and stack logged for developers.

---

## 🧠 Summary

This controller is a **robust and secure** endpoint handler with:

* Role-based access control
* Schema and business logic validation
* Centralized logging and auditing
* Precise error reporting
* Security headers for client protection

## 📥 Request Body Example (JSON)

```json
{
  "promotionCode": "SUMMER25",
  "promotionType": "percentage",              // Options: "percentage" or "fixed"
  "promotionAmount": 25,                      // 25% discount
  "maxDiscountAmount": 50,                    // Required for percentage type
  "minPurchaseAmount": 100,                   // Optional minimum cart total to apply
  "startDate": "2025-07-01T00:00:00.000Z",    // ISO 8601 format
  "endDate": "2025-07-31T23:59:59.000Z",
  "status": "active",                         // Options: "active", "inactive", "expired"
  "usageLimit": 500                           // Optional: how many times this code can be used
}
