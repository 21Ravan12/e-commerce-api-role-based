# bulkDeleteArticles.md

This file documents the `bulkDeleteArticles` controller function, which handles **admin-level bulk deletion of articles**. It performs strict input validation, logs the operation using an **auditable logging system**, and provides detailed response handling for both success and failure scenarios.

---

## 🧠 Function Overview

### `async bulkDeleteArticles(req, res)`
This route is intended for **administrative use** and deletes multiple articles based on a list of IDs received in the request body.

---

## 📝 Audit Log Initialization

```js
const { logEntry, complete } = await AuditLog.createTimedAdminLog({...})
````

* Begins a **timed audit log** for tracking the entire deletion process.
* Captures metadata:

  * Action name: `"bulk_delete_articles"`
  * Model: `Article`
  * Admin info: `req.user._id`, `req.user.email`
  * IP address, user agent, and request metadata (e.g., number of article IDs, reason).
* Returns a `complete()` function used later to finalize the audit log.

---

## 🔐 Request Validation

### Content-Type Check

```js
if (!req.is('application/json')) { ... }
```

* Only allows requests with `Content-Type: application/json`.
* Logs failure in the audit and returns a `400 Bad Request`.

### Payload Validation

```js
const { articleIds, reason } = req.body;
```

* Validates `articleIds` exists, is an array, and has at least one ID.
* If invalid, logs and responds with a `400 Bad Request`.

### ObjectId Format Check

```js
const invalidIds = articleIds.filter(id => !mongoose.Types.ObjectId.isValid(id));
```

* Ensures all IDs are valid MongoDB ObjectIDs.
* If any invalid, logs how many were bad and returns an error with an example invalid ID.

---

## 🧹 Article Deletion Logic

```js
const result = await bulkDeleteArticles(articleIds, req.user._id, reason);
```

* Calls a separate `bulkDeleteArticles` service that handles deletion in the database.
* Passes:

  * Array of validated article IDs.
  * Admin user ID as the action performer.
  * Optional reason for deletion (defaults to "Bulk deletion by admin").

---

## ✅ Success Response & Final Logging

```js
await complete({ status: 'success', details: { ... } });
```

* Finalizes the audit log with:

  * Deletion count (`result.deletedCount`)
  * Reason
  * Number of requested IDs
* Sends a `200 OK` JSON response with metadata and timestamp.

---

## ❌ Error Handling

```js
catch (error) { ... }
```

* Logs error to both:

  * Audit log with `status: 'failed'`
  * Application logs via `logger.error`
* Sends structured error response:

  * `500` or a custom `error.statusCode`
  * Includes stack trace only in development mode
  * Always returns `success: false` and timestamp

---

## 📤 Output Example (Success)

```json
{
  "success": true,
  "message": "Articles bulk deleted successfully",
  "deletedCount": 5,
  "requestedCount": 5,
  "timestamp": "2025-06-25T12:34:56.789Z"
}
```

## 📤 Output Example (Failure - Invalid IDs)

```json
{
  "success": false,
  "error": "Contains 2 invalid IDs",
  "invalidCount": 2
}
```

---

## 🔒 Security Notes

* Requires authentication (`req.user` is assumed to be populated).
* Should only be available to admin-level users (authorization logic handled externally).

---

## 🛠 Dependencies

* `AuditLog.createTimedAdminLog` for auditing.
* `bulkDeleteArticles` for database operation.
* `mongoose.Types.ObjectId` for ID validation.
* `logger` for error reporting.

---

## ✅ Best Practices Implemented

* Full audit trail (start-to-end logging).
* Fail-safe validation with actionable error messages.
* Structured and secure error responses.
* Developer-mode stack trace for debugging.
* Scalable input structure.


## 📥 Request Body Example (JSON)

```json
{
  "articleIds": [
    "60d21b4667d0d8992e610c85",
    "60d21b4967d0d8992e610c86",
    "60d21b4a67d0d8992e610c87"
  ],
  "reason": "Removing outdated articles"
}
