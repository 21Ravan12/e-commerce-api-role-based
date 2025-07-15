# deleteCategory.md

This function handles the **deletion of a category** by an authenticated admin. It is designed with robust validation, auditing, logging, and structured error handling. It also integrates with an audit logging system to track all deletion attempts for security and accountability.

---

## 🔄 Function: `deleteCategory(req, res)`

### ✅ Step 1: Start an Admin Audit Log
```js
const { logEntry, complete } = await AuditLog.createTimedAdminLog({...});
````

* Initializes a timed audit log to track the deletion action.
* Includes:

  * `action`: Identifies the operation (`delete_category`).
  * `targetModel` / `targetId`: Specifies which entity is targeted.
  * `performedBy`: The admin user’s ID and email.
  * `ipAddress`, `userAgent`, `source`: Metadata for tracing the request.
  * `details`: Logs the requested category ID.

---

### ✅ Step 2: Validate the Category ID

```js
if (!mongoose.Types.ObjectId.isValid(req.params.id)) { ... }
```

* Ensures the `req.params.id` is a valid MongoDB ObjectId.
* If invalid:

  * Marks the audit log as failed (`validationError`).
  * Sends an error response (`400 Bad Request`).

---

### ✅ Step 3: Perform Deletion via Model Method

```js
const { deletedId, auditLogData } = await Category.deleteCategory(...);
```

* Calls a static method `Category.deleteCategory()`:

  * Handles the actual deletion logic.
  * Takes the `categoryId`, authenticated user, IP, and User-Agent.
  * Returns the deleted ID and data for logging.

---

### ✅ Step 4: Log the Deletion (Audit Log)

```js
await AuditLog.createLog(auditLogData);
```

* Records the operation in the audit log system with detailed metadata.

---

### ✅ Step 5: Finalize Audit Log (Success)

```js
await complete({
  status: 'success',
  details: {
    deletedId,
    auditLogReference,
    timestamp
  }
});
```

* Completes the timed log with a **"success"** status.
* Includes references for traceability (e.g., `auditLogReference`).

---

### ✅ Step 6: Send Successful Response

```js
res.status(200).json({
  message: 'Category deleted successfully',
  deletedId,
  timestamp
});
```

* Responds to the client with a 200 OK status and relevant info.

---

## ❌ Error Handling (Catch Block)

### 🎯 Error Type Identification

Determines the **error category** for structured logging:

```js
const errorType = ...;
```

* `validation`: Bad input (e.g., invalid ID).
* `not_found`: Category doesn’t exist.
* `conflict`: Deletion blocked due to dependencies.
* `server_error`: Fallback for other issues.

### 📉 Finalize Audit Log (Failure)

```js
await complete({
  status: 'failed',
  details: {
    error,
    errorType,
    stack
  }
});
```

* Marks the audit log as failed.
* Logs error stack trace only in development.

### 🧯 Log & Respond to Client

```js
logger.error(...);
res.status(statusCode).json({ error, systemError });
```

* Logs the error.
* Sends appropriate HTTP response:

  * `400 Bad Request`: Invalid input.
  * `404 Not Found`: Category not found.
  * `409 Conflict`: Cannot delete due to dependencies.
  * `500 Server Error`: Internal failure.

---

## 📦 Summary

| Feature                    | Description                                     |
| -------------------------- | ----------------------------------------------- |
| 🛡️ Authenticated Only     | Requires `req.user` to be set                   |
| 🧾 Audit Logging           | Logs both start and outcome of the operation    |
| ✅ Input Validation         | Ensures valid ObjectId                          |
| 🧠 Domain Logic Delegation | Uses model method `Category.deleteCategory()`   |
| 🔁 Robust Error Handling   | Catches and categorizes various error scenarios |
| 🌐 Client-Safe Responses   | Returns appropriate status codes & messages     |


## 📥 Request Body Example (JSON)

This endpoint does **not** require a request body. The category to delete is identified via the URL path parameter `id`.

Example request:

```http
DELETE /categories/60d5f484f8d4a916c4a4b123 HTTP/1.1
Host: api.example.com
Authorization: Bearer <your_jwt_token>
User-Agent: PostmanRuntime/7.29.2
Accept: application/json
