# updateCategory.md

This file documents the `updateCategory` method, which is responsible for updating a category's details in the system. It includes validation, auditing, error handling, and structured logging. The function is built to be **secure, traceable, and robust**, especially in administrative environments.

---

## 🔧 Function Overview

### `async updateCategory(req, res)`
This Express handler updates a category based on the provided ID (`req.params.id`) and update payload (`req.body`), performing the following key steps:

---

## 🕓 1. Timed Audit Log Initialization

```js
const { logEntry, complete } = await AuditLog.createTimedAdminLog({...});
````

* **Purpose**: Starts a timed audit log entry to trace the request lifecycle.
* **Fields Captured**:

  * `action`: Type of action (`update_category`)
  * `targetModel` / `targetId`: Identifies the model and the specific record
  * `performedBy`: Authenticated user ID and email
  * `ipAddress` / `userAgent`: Source metadata
  * `details`: Request body (can be filtered/redacted if needed)
* **`complete()`**: A returned function that will finalize this log with status (`success`/`failed`) and details.

---

## 📦 2. Request Validation

### 📄 Content-Type Check

```js
if (!req.is('application/json')) { ... }
```

* Verifies the request is of type `application/json`.
* If not, logs as a **failed audit entry** and throws a 415 error.

### ✅ Schema Validation

```js
const { error, value } = updateSchema.validate(req.body, { ... });
```

* Validates input using `Joi` or similar schema.
* `abortEarly: false`: Collects all validation errors.
* `stripUnknown: true`: Removes unexpected fields.
* If validation fails, logs all details and throws a 400 error.

---

## 🛠️ 3. Category Update Operation

```js
const { category: updatedCategory, auditLogData } = await Category.updateCategory(...);
```

* Delegates the actual update logic to a **static model method** (`Category.updateCategory()`), which:

  * Locates the category
  * Applies changes
  * Returns the updated category and an `auditLogData` object
* Includes metadata: user info, IP, and User-Agent for traceability.

---

## 📝 4. Finalizing Logs

```js
await Promise.all([
  AuditLog.createLog(auditLogData),
  complete({ status: 'success', details: {...} })
]);
```

* Creates a standalone `AuditLog` entry for record-keeping.
* Completes the timed log with success status and detailed result info (e.g., updated fields, category ID/name).

---

## ✅ 5. Success Response

```js
res.status(200).json({
  message: 'Category updated successfully',
  category: { ... }
});
```

* Sends a clear JSON response with minimal but essential updated fields.

---

## ❌ 6. Error Handling & Logging

### 📉 Error Categorization

Determines the appropriate HTTP status code based on the error message content:

* `415`: Invalid Content-Type
* `400`: Validation error or malformed data
* `404`: Not found
* `409`: Conflict (e.g., slug already exists)
* `500`: Internal server error (default)

### 🛑 Error Response

* All errors are logged with `logger.error`.
* The timed log is finalized with failure status and detailed reason.
* Error response contains:

  * `error.message`
  * `error.details` (for 400s)
  * `stack` trace (only in development mode)

---

## 🔒 Security Considerations

* Email/IP/User-Agent are captured for traceability.
* `req.body` should be sanitized/redacted in logs if it may contain sensitive data.
* Only authenticated admins should access this route.

---

## 📌 Summary

This method is an **enterprise-grade category update endpoint** featuring:

* Structured logging via `AuditLog`
* Schema-based validation
* Delegated model logic
* Rich error classification and response formatting
* Ready for production with security and traceability built-in


## 📥 Request Body Example (JSON)

```json
{
  "name": "Updated Category Name",
  "slug": "updated-category-slug",
  "isActive": true
}
