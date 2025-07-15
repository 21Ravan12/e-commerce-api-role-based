# addCampaign.md

This file documents the `addCampaign` controller method, which handles the **creation of a new campaign** via an HTTP request. It includes **validation**, **audit logging**, **error handling**, and **secure HTTP responses**.

---

## 📥 Entry Point

### `async addCampaign(req, res)`
Handles a POST request to create a new campaign. The request must:
- Be from an authenticated admin (`req.user`)
- Use `application/json` content-type
- Match the expected schema (`campaignSchema`)

---

## 🧾 Step-by-Step Breakdown

### 1. 🔎 Timed Audit Log Start
```js
const { logEntry, complete } = await AuditLog.createTimedAdminLog({...})
````

* Starts an **admin audit log** entry with metadata like:

  * Action: `"create_campaign"`
  * Target model: `"Campaign"`
  * User performing action: `req.user`
  * Source, IP, user agent, and content-type
* Returns a `complete()` method to **finalize the log later** with success or failure.

---

### 2. 📑 Content-Type Validation

```js
if (!req.is('application/json')) { ... }
```

* Ensures that the request body is sent as JSON.
* If not, logs failure to audit, returns `415 Unsupported Media Type`.

---

### 3. ✅ Input Validation

```js
const { error: validationError, value } = campaignSchema.validate(req.body, {...})
```

* Validates the request body against `campaignSchema`.
* Options used:

  * `abortEarly: false`: collect all errors
  * `stripUnknown: true`: remove unexpected fields
  * `allowUnknown: false`: disallow unknown fields
* If validation fails:

  * Logs detailed errors to audit
  * Returns `400 Bad Request` with human-readable messages

---

### 4. 🛠 Campaign Creation

```js
const newCampaign = await Campaign.createCampaign(value, req.user._id);
```

* Calls a static method `Campaign.createCampaign` to create the campaign with validated input.
* `req.user._id` is passed as the creator.

---

### 5. 🧾 Log Completion (Success)

```js
await complete({ status: 'success', details: {...} });
```

* Finalizes the audit log entry with campaign details like:

  * `_id`, `campaignName`, `campaignType`, `status`, dates, creator ID.

---

### 6. 📤 Response Structure

```js
res
  .set('X-Content-Type-Options', 'nosniff')
  .set('X-Frame-Options', 'DENY')
  .status(201)
  .json(response);
```

* Returns `201 Created` status with:

  * Basic campaign info
  * Security headers to prevent XSS/iframe attacks
  * Hyperlinks to view or edit the campaign

---

## ❌ Error Handling (Catch Block)

### Conditional Status Code Detection

```js
const statusCode = error.message.includes('...') ? 400 : 500;
```

* Maps known error patterns (e.g., invalid products/customers) to `400 Bad Request`.
* Otherwise, falls back to `500 Internal Server Error`.

### Log Finalization (Failure)

```js
await complete({ status: 'failed', details: {...} });
```

* Logs error message, stack trace (only in development), and custom `errorType` to audit log.

### Secure Error Response

```js
res.status(statusCode).json({ error: ..., details: ... })
```

* Sends clear error messages with optional stack trace in development mode.

---

## 🧠 Summary

This method ensures **robust campaign creation** by combining:

* **Strict schema validation**
* **Timed audit logging**
* **Environment-sensitive error messages**
* **Secure response headers**
* **Clean, normalized outputs**


## 📥 Request Body Example (JSON)

```json
{
  "campaignName": "Spring Sale 2025",
  "campaignType": "seasonal",
  "status": "active",
  "startDate": "2025-03-01T00:00:00.000Z",
  "endDate": "2025-03-31T23:59:59.999Z",
  "remainingUses": 1000,
  "minPurchaseAmount": 50.00,
  "maxDiscountAmount": 100.00,
  "customerSegments": [
    "loyal_customers",
    "new_subscribers"
  ],
  "applicableCategories": [
    "642e3a2f4c9f1a0012345678",
    "642e3a2f4c9f1a0012345679"
  ],
  "excludedProducts": [
    "642e3a2f4c9f1a0012345680"
  ]
}
