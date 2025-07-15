# updateCampaign.md

This function handles the **update process for a campaign**, typically via an authenticated admin interface. It incorporates **validation**, **structured audit logging**, **secure response headers**, and **robust error handling** to ensure data integrity and traceability. Here's a breakdown of its responsibilities:

---

## 🔐 Audit Logging (Start)
```js
const { logEntry, complete } = await AuditLog.createTimedAdminLog({ ... });
````

* Logs the **start** of the update operation.
* Records metadata such as:

  * `action`: `"update_campaign"`
  * `targetId`: Campaign ID (`req.params.id`)
  * `performedBy`: Authenticated user’s ID and email
  * IP address, User-Agent, and request origin
  * The submitted update data

---

## ✅ Request Validation

### 1. Log basic request info:

```js
logger.info(...)
```

### 2. Validate Content-Type:

```js
if (!req.is('application/json')) { ... }
```

* Ensures the request body is JSON.
* Returns `415 Unsupported Media Type` if invalid.
* Completes audit log with failure details.

### 3. Validate Payload:

```js
const { error, value } = campaignUpdateSchema.validate(req.body, { ... });
```

* Uses a Joi-based schema to:

  * Reject unknown keys
  * Strip unknown fields
  * Collect **all** validation errors (`abortEarly: false`)
* If validation fails:

  * Compiles structured error list
  * Logs error to audit trail
  * Returns `400 Bad Request` with a detailed error message

---

## 🔄 Update Operation

### Perform Campaign Update:

```js
const updatedCampaign = await Campaign.updateCampaign(req.params.id, value, req.user._id);
```

* Calls a **static method** on the `Campaign` model.
* Likely includes permission checks, update history, and business logic.

---

## ✅ Audit Logging (Success)

```js
await complete({ status: 'success', details: { ... } });
```

* Marks the admin log as successful.
* Stores:

  * Which fields were updated
  * High-level info about the updated campaign

---

## 📦 Response Formatting

### Construct Response:

```js
const response = { message, campaign, links };
```

* Returns structured JSON with:

  * Updated campaign info
  * Links to **view** and **edit** the campaign
* Sets secure headers:

  * `X-Content-Type-Options: nosniff` (prevents MIME-type sniffing)
  * `X-Frame-Options: DENY` (prevents clickjacking)

---

## ❌ Error Handling

### Catch Block:

* Categorizes errors based on message patterns:

  * Validation errors → `400`
  * Not found → `404`
  * Invalid content-type → `415`
  * Default → `500 Internal Server Error`

### Audit Log on Error:

```js
await complete({ status: 'failed', details: { error, stack, etc. } });
```

* Logs the failure, including:

  * Error message
  * Status code
  * Stack trace (in development only)
  * Validation error details if applicable

### Return Error Response:

```js
res.status(statusCode).json({ error, details });
```

---

## 📘 Summary

| Feature                 | Description                                                    |
| ----------------------- | -------------------------------------------------------------- |
| Audit Logging           | Creates structured admin logs with context and status          |
| Input Validation        | Enforces strict schema validation with detailed errors         |
| Secure Response Headers | Enhances client security by limiting browser behavior          |
| Error Handling          | Provides developer-friendly messages with dynamic status codes |
| Extensible Structure    | Prepares clean JSON responses with navigational links          |


## 📥 Request Body Example (JSON)

```json
{
  "campaignName": "Spring Sale 2025",
  "campaignType": "seasonal",
  "status": "active",
  "startDate": "2025-03-01T00:00:00.000Z",
  "endDate": "2025-03-31T23:59:59.999Z",
  "usageLimit": 1000,
  "discountType": "percentage",
  "discountValue": 15,
  "maxDiscountAmount": 50,
  "applicableCategories": ["60d21b4667d0d8992e610c85", "60d21b4967d0d8992e610c87"],
  "excludedProducts": ["60d21b5167d0d8992e610c8a"],
  "customerSegments": ["premium_customers"],
  "remainingUses": 850
}
