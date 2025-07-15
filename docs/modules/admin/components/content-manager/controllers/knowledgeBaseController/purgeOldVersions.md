# purgeOldVersions.md

This document explains the logic and flow of the `purgeOldVersions` controller method, which is designed to **remove old versions of articles** from the system based on specific criteria. It includes **input validation**, **audit logging**, **error handling**, and **optional dry-run support** for safe testing.

---

## 📋 Purpose

The goal of this method is to clean up versioned content (e.g., article revisions) by:
- Keeping only a specific number of recent versions (`keepLast`)
- Removing versions older than a certain number of days (`olderThanDays`)
- Optionally simulating the purge operation without actually deleting anything (`dryRun`)

---

## 🧾 Step-by-Step Breakdown

### 1. **Create Admin Audit Log**
```js
const { logEntry, complete } = await AuditLog.createTimedAdminLog({ ... });
````

* A timed admin log is created to **record the action** and all relevant metadata:

  * Action: `purge_old_versions`
  * Target: `Article`
  * Performed by: User ID & email
  * IP address, user agent, and request body included
* `complete()` is a callback used to mark the log as **success** or **failed** later.

---

### 2. **Content-Type Check**

```js
if (!req.is('application/json')) { ... }
```

* Rejects the request if the `Content-Type` is not JSON.
* Marks the audit log as failed and responds with an appropriate error.

---

### 3. **Input Validation**

```js
const { keepLast, olderThanDays, dryRun } = req.body;
```

* Both `keepLast` and `olderThanDays` must be **non-negative numbers**.
* Invalid input results in:

  * Audit log marked as failed
  * HTTP 400 response with validation error message

---

### 4. **Perform Purge Operation**

```js
const result = await purgeOldVersions(req.user._id, { keepLast, olderThanDays, dryRun });
```

* Calls the core service `purgeOldVersions` (defined elsewhere) to:

  * Analyze articles authored by the user
  * Remove older versions beyond the `keepLast` threshold or that are older than `olderThanDays`
  * If `dryRun` is `true`, no deletions are performed, only a report is generated

---

### 5. **Audit Logging – Success Case**

```js
await complete({ status: 'success', details: { ... } });
```

* Logs parameters and result details:

  * `totalPurged`: Number of versions deleted
  * `totalSkipped`: Versions excluded from deletion
  * `totalExamined`: Total versions reviewed

### 6. **Respond to Client**

```js
res.status(200).json({ success: true, ...result });
```

* Sends back a detailed success response including:

  * Operation status
  * Purge summary
  * Timestamp

---

### 7. **Error Handling**

```js
catch (error) { ... }
```

* Catches and logs unexpected errors:

  * Marks audit log as `failed`
  * Includes `error.message`, optional stack trace (in development), and `statusCode`
* Responds using `this.handleError(res, error)` – a centralized error handler assumed to exist.

---

## ✅ Example Request Payload

```json
{
  "keepLast": 5,
  "olderThanDays": 90,
  "dryRun": true
}
```

---

## 📦 Exports & Assumptions

* This function is assumed to be part of a class-based controller (due to use of `this.handleError`).
* The `purgeOldVersions` logic is abstracted away and not included in this file.
* Relies on `AuditLog`, `logger`, and user context injected via middleware.

---

## 🔐 Security Notes

* Only authenticated users (typically admins) should access this route.
* All actions are auditable via `AuditLog`.

---

## 🧪 Dry-Run Mode

* If `dryRun: true`, **no data is deleted**, making it safe to preview impact before committing.

---

## 📥 Request Body Example (JSON)

```json
{
  "keepLast": 5,
  "olderThanDays": 30,
  "dryRun": true
}
````

### 🔹 Field Descriptions:

* **`keepLast`** (number, required):
  Number of the most recent versions to retain **per article**.
  Must be a non-negative integer.

* **`olderThanDays`** (number, required):
  Only purge versions **older than this number of days**.
  Must be a non-negative integer.

* **`dryRun`** (boolean, optional):
  If `true`, performs a simulation without actually deleting any versions.
  Default behavior assumes `false` if not provided.
