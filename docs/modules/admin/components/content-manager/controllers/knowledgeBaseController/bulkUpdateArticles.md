# bulkUpdateArticles.md

This document explains the logic and structure behind the `bulkUpdateArticles` controller method, which allows administrators to perform batch updates on `Article` records with detailed audit logging and error handling.

---

## 📌 Purpose

The `bulkUpdateArticles(req, res)` function is a secure, admin-level endpoint that:
- Updates multiple `Article` records matching a specified filter.
- Tracks the operation with a time-stamped audit log.
- Validates inputs to prevent unintended mass operations.
- Returns precise feedback about the operation’s success or failure.

---

## 🧩 Key Steps Breakdown

### 1. **Start Audit Log**
```js
const { logEntry, complete } = await AuditLog.createTimedAdminLog({ ... });
````

* Begins a timed audit log entry using `AuditLog.createTimedAdminLog`.
* Captures metadata: who performed the action, from where, what device, etc.
* `complete()` is used later to finalize the audit (with success or failure status).

---

### 2. **Log Incoming Request**

```js
logger.info(`Bulk update articles request from IP: ${req.ip}`);
```

Logs the incoming request for observability.

---

### 3. **Validate Content-Type**

```js
if (!req.is('application/json')) { ... }
```

* Ensures the request body is in JSON format.
* Logs failure and throws if incorrect.

---

### 4. **Extract and Validate Body**

```js
const { filter, updates, reason } = req.body;
```

* Expects a `filter` object to select articles and `updates` to apply.
* Optional `reason` can be logged for administrative context.

#### Required Field Check

```js
if (!filter || !updates) { ... }
```

* If either `filter` or `updates` is missing:

  * Audit log is marked as failed.
  * Error is thrown to terminate early.

---

### 5. **Execute Bulk Update**

```js
const result = await bulkUpdateArticles(filter, updates, req.user._id, reason || 'Bulk update by admin');
```

* Performs the update operation using a service-level function `bulkUpdateArticles`.
* Tracks the administrator making the change and the reason for auditability.

---

### 6. **Complete Audit Log (Success)**

```js
await complete({
    status: 'success',
    details: {
        filter, updates, updatedCount, reason, matchedCount, modifiedCount
    }
});
```

* Finalizes the log with operation details and outcome metrics.

---

### 7. **Send JSON Response**

```js
res.status(200).json({
    success: true,
    message: 'Articles bulk updated successfully',
    data: { updatedCount, matchedCount, modifiedCount },
    timestamp: ...
});
```

Returns a well-structured response with the operation summary.

---

### 8. **Handle Errors**

If any error occurs during the process:

#### Finalize Audit Log (Failure)

```js
await complete({
    status: 'failed',
    details: {
        error: error.message,
        statusCode: error.statusCode || 500,
        stack: ...
    }
});
```

#### Send Error Response

```js
this.handleError(res, error);
```

Delegates to a shared error handler to standardize error responses.

---

## 🧠 Notes

* The function is tightly coupled with **audit logging** to ensure every admin-level action is traceable.
* Designed for **safety and accountability**: missing inputs, incorrect formats, and unexpected errors are all logged and returned meaningfully.
* Good practice for **enterprise-level admin APIs**.

---

## 📥 Request Body Example (JSON)

```json
{
  "filter": {
    "status": "draft",
    "category": "technology"
  },
  "updates": {
    "status": "published",
    "publishedDate": "2025-07-01T00:00:00.000Z"
  },
  "reason": "Publishing all draft tech articles"
}
