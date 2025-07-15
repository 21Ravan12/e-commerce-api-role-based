# rebuildSearchIndex.md

This document explains the logic and flow of the `rebuildSearchIndex` method, which is an **admin-level operation** that triggers a full rebuild of the search index for the `Article` model. It includes detailed audit logging, error handling, and response structuring.

---

## 🔁 Function: `rebuildSearchIndex(req, res)`

### ✅ Purpose:
Initiate and track the **rebuilding of a search index** (typically used in search engines or full-text querying systems), while logging all actions for auditing and security purposes.

---

## 📝 Step-by-Step Breakdown

### 1. **Create Audit Log**
```js
const { logEntry, complete } = await AuditLog.createTimedAdminLog({...});
````

* **What it does**: Records the start of the admin action `rebuild_search_index` in the audit log system.
* **Fields logged**:

  * `action`: Action name (`rebuild_search_index`)
  * `targetModel`: Target model (`Article`)
  * `performedBy`: User ID
  * `performedByEmail`: Email of the admin user
  * `ipAddress`: Source IP of request
  * `userAgent`: Request's user-agent header (browser info)
  * `source`: Interface used (`web`)
  * `details`: Extra metadata like `initiatedBy` and `userRole`

---

### 2. **Log and Call the Rebuild Logic**

```js
logger.info(`Rebuild search index request from IP: ${req.ip}`);
const result = await rebuildSearchIndex(req.user._id);
```

* **Logs the incoming request** for transparency and diagnostics.
* **Calls** the actual logic (`rebuildSearchIndex`) which likely:

  * Fetches all `Article` documents.
  * Re-indexes them into the search backend (e.g., Elasticsearch, Meilisearch).
  * Returns a result object:

    ```js
    {
      status: 'completed',
      processedCount: 500,
      elapsedTime: 2000, // in ms
      message: 'Index rebuilt successfully.'
    }
    ```

---

### 3. **Complete Audit Log (Success)**

```js
await complete({
  status: 'success',
  details: {
    rebuildResult: { ... }
  }
});
```

* Marks the previously started audit log as complete with **success status**.
* Saves detailed info about the rebuild operation, including count and timing.

---

### 4. **Send Response**

```js
res.status(200).json(result);
```

* Responds to the client with the success result of the index rebuild.

---

## ⚠️ Error Handling

### 5. **Catch & Log Errors**

```js
await complete({
  status: 'failed',
  details: {
    error: error.message,
    ...
  }
});
```

* If anything fails, the audit log is completed with **failure details**:

  * Error message
  * Status code (if available)
  * Optional stack trace (in development)

### 6. **Call Custom Error Handler**

```js
this.handleError(res, {
  ...error,
  systemError: ...,
  ipAddress: req.ip,
  userAgent: ...
});
```

* Delegates to a central error handler (`this.handleError`) to structure and return an appropriate error response to the client.

---

## 🛡️ Security Considerations

* This method is protected (only accessible by authenticated admins).
* All actions are logged via a **timed audit log** system for traceability.
* IP address and user-agent info help detect suspicious usage patterns.

---

## 📤 Summary

The `rebuildSearchIndex` method provides a **safe, traceable, and auditable** way to rebuild the search index for `Article` documents. It is built for reliability with robust error handling and detailed logging to support operational visibility and compliance.


## 📥 Request Body Example (JSON)

```json
{}
````

> 🔒 This endpoint does not require a request body. It is triggered by an authenticated admin user to rebuild the search index for articles. Authentication headers (e.g., Bearer token) must be provided.
