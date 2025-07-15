# getPromotionCode.md

This document explains the `getPromotionCode` controller method, which retrieves detailed information about a promotion code using its ID. It also handles logging, error management, response enhancement, and security headers.

---

## 🧠 Purpose
The function retrieves a single promotion code by ID and returns enriched data to the client, such as activation status, remaining uses, and related links. It is intended for **admin use** and logs detailed metadata for auditing and diagnostics.

---

## 🧩 Core Steps

### 1. **Admin Log Initialization**
```js
const { logEntry, complete } = await AdminLog.createTimedAdminLog({...});
````

* Starts a **timed admin log** capturing action metadata like:

  * Action name (`get_promotion_code`)
  * Target model and ID
  * Admin identity (`req.user`)
  * Client info (IP, user-agent)
  * HTTP headers for traceability

---

### 2. **Promotion Code Retrieval**

```js
const promotionCode = await findPromotionCodeById(PromotionCode, req.params.id);
```

* Uses a helper method to query the `PromotionCode` model.
* If not found:

  * Logs a failure with reason: `"Promotion code not found"`
  * Returns `404 Not Found`

---

### 3. **Enhancement of Promotion Code Data**

Adds derived properties for richer frontend experience:

```js
const enhancedCode = {
  ...promotionCode,
  isActive: logic,                  // Checks active status based on time and status field
  remainingUses: calculated value, // usageLimit - usageCount
  links: { ... }                   // Friendly RESTful links for UI
};
```

* **`isActive`**: Checks if current time is within `startDate` and `endDate` and status is `active`.
* **`remainingUses`**: Derived from `usageLimit` and `usageCount`.
* **`links`**: Adds RESTful endpoints for related resources (self, admin, categories, products).

---

### 4. **Success Log Completion**

```js
await complete({
  status: 'success',
  details: {
    promotionCodeDetails: {...},
    validity: {...}
  }
});
```

* Logs outcome with key data:

  * Code metadata (ID, code, discount values)
  * Activation state
  * Validity dates

---

### 5. **Final Response**

```js
res
  .set('X-Content-Type-Options', 'nosniff')
  .set('X-Frame-Options', 'DENY')
  .status(200)
  .json(response);
```

* Returns `200 OK` with:

  * `promotionCode`: enhanced code object
  * `meta`: current time and validity info
* Adds security headers to prevent sniffing and clickjacking.

---

## ⚠️ Error Handling

Catches and categorizes exceptions:

### Validation Error (Bad ID)

* If the ID format is invalid (e.g., not 24-char hex):

  * Logs with `isInvalidId: true`
  * Returns `400 Bad Request` with format guidance

### Internal Server Error

* For all other failures:

  * Returns `500 Internal Server Error`
  * In development, includes stack trace and system message

### Log Completion on Error

```js
await complete({
  status: 'failed',
  details: { error, stack, promotionCodeId, ... }
});
```

* Ensures audit trail even in failure scenarios.

---

## 🔒 Security Considerations

* Uses `.set('X-Content-Type-Options', 'nosniff')` to prevent MIME-sniffing.
* Uses `.set('X-Frame-Options', 'DENY')` to block clickjacking in iframes.
* Strips sensitive errors in production.

---

## ✅ Summary

`getPromotionCode` is a robust, auditable endpoint designed for admin dashboards. It not only retrieves a promotion code but enhances it with computed values, enforces security best practices, and ensures full lifecycle logging for observability and traceability.
