# exportAllData.md

This function handles an **admin-level full data export** request, allowing an authorized user (typically an admin) to export the contents of the entire database in either JSON or CSV format. It includes detailed **audit logging**, dynamic **format handling**, and **robust error management**.

---

## 🧠 Function Overview

### `exportAllData(req, res)`
- **Purpose**: Export core database collections (e.g., Articles, Categories, Feedback, Ratings) in a downloadable format.
- **Access**: Admin-only (assumed based on audit logging and authorization error checks).
- **Logging**: Uses a timed audit log to track request lifecycle and system behavior.

---

## 📜 Step-by-Step Breakdown

### 1. 🕵️‍♂️ Start Audit Log
```js
const { logEntry, complete } = await AuditLog.createTimedAdminLog({...});
````

* Captures the context of the export: who triggered it, from where, what was requested.
* `complete` is a callback that must be called to finalize the log with success/failure status.

---

### 2. 📝 Parse Format

```js
const { format = 'json' } = req.query;
```

* Supports optional query param `?format=json` or `?format=csv`.
* Defaults to `json` if not specified.

---

### 3. 📤 Export Data

```js
const data = await exportAllData(format);
```

* Calls a utility (not shown here) that returns all relevant data serialized in the requested format.
* Likely includes converting MongoDB collections to JSON/CSV strings.

---

### 4. 📏 Calculate Size

```js
const dataSize = Buffer.byteLength(data, 'utf8');
```

* Measures exported payload size for logging and analytics.

---

### 5. ✅ Finalize Audit Log (Success)

```js
await complete({
  status: 'success',
  details: { ... }
});
```

* Logs the final status, size, format, models exported, and estimated document counts from the DB.

---

### 6. 📦 Set Response Headers

Sets appropriate content type and filename headers based on format:

```js
res.setHeader('Content-Type', ...);
res.setHeader('Content-Disposition', ...);
```

* Triggers file download with correct MIME type.

---

### 7. 📤 Send Response

```js
res.status(200).send(data);
```

* Sends raw string data (JSON or CSV) as downloadable file.

---

## ❌ Error Handling

### Catch Block

* Wraps the entire operation to catch unexpected errors.
* Finalizes audit log with:

  * `status: 'failed'`
  * `error.message`, `statusCode`, and `stack` trace (if in development).

### Conditional Error Responses

```js
if (error.message === 'Not authorized') {
  res.status(403).json({ ... });
} else {
  res.status(500).json({ ... });
}
```

* Custom 403 response if user lacks permission.
* Generic 500 fallback with optional debug details in development.

---

## 🧾 Summary of Logged Details

* **Who**: `req.user._id`, `req.user.email`
* **Where**: `req.ip`, `req.headers['user-agent']`
* **What**:

  * Requested format (`json` or `csv`)
  * Exported models: `Article`, `Category`, `Feedback`, `Rating`
  * Estimated document counts
  * Data size in bytes
  * Success/failure status
  * Error details (if any)

---

## 🔐 Security & Observability

* Only accessible by authenticated admins.
* Audit logs offer full traceability.
* Errors are well-isolated and client-friendly.

---

## 📤 Export Purpose

Designed to support:

* Full system backups
* Admin-driven exports for reporting or migration
* GDPR/CCPA compliance for data access


## 📥 Request Body Example (JSON)

This endpoint does **not** require a request body.

Instead, it accepts an optional **query parameter**:

| Parameter | Type   | Description                            | Default |
|-----------|--------|----------------------------------------|---------|
| `format`  | string | Export format: `"json"` or `"csv"`     | `"json"` |

### Example Usage:

**GET** `/admin/export?format=json`

**GET** `/admin/export?format=csv`

No JSON body is needed. Only authorized admin users can access this endpoint.
