# listUsers.md

This file documents the `listUsers` controller method, which handles **admin-side user listing** with support for filtering, pagination, and full audit logging via an admin log system.

---

## 📌 Purpose
The `listUsers` function serves authenticated admin requests to **fetch a paginated, filterable list of users**. It also:
- Logs the request with detailed metadata (IP, filters, etc.).
- Handles both successful and failed outcomes with proper logging.
- Returns results with pagination metadata.

---

## 🛠 Function Signature

```js
async listUsers(req, res)
````

---

## ✅ Step-by-Step Breakdown

### 1. 📝 Admin Log Initialization

```js
const { logEntry, complete } = await AdminLog.createTimedAdminLog({...});
```

* Starts a **timed admin log entry** for tracing and auditing.
* Includes metadata like:

  * Admin user ID and email
  * Request IP and user agent
  * Action type: `'list_users'`
  * Query filters and pagination params

---

### 2. 🧮 Pagination and Filter Parsing

```js
const { page = 1, limit = 10, status, ...otherFilters } = req.query;
const pageNumber = Math.max(1, parseInt(page));
const limitNumber = Math.min(100, Math.max(1, parseInt(limit)));
```

* Extracts filters and pagination from query parameters.
* Applies:

  * Minimum page = 1
  * Limit bounds = between 1 and 100

---

### 3. 📤 Fetching Users

```js
const result = await User.listUsers({ status, ...otherFilters, page: pageNumber, limit: limitNumber });
```

* Calls `User.listUsers()` with parsed filters.
* Supports `status` and any additional dynamic filters via `otherFilters`.

---

### 4. ✅ Success Response & Log Completion

```js
await complete({ status: 'success', details: { ... } });
res.json({ success: true, data: result.users, pagination: { ... } });
```

* Completes the admin log entry with:

  * Pagination outcome
  * Number of users returned
  * Filters used
* Sends a structured JSON response to the client with:

  * `success: true`
  * `data`: user list
  * `pagination`: total count and pages

---

### 5. ❌ Error Handling

```js
catch (error) { ... }
```

* Catches unexpected runtime errors (DB issues, logic bugs, etc.).
* Completes the log with `status: 'failed'` and error details.
* Returns a 500 error to the client with generic or detailed error messages depending on the environment.

---

## 🧾 Admin Log Utility (`AdminLog.createTimedAdminLog`)

This utility provides:

* A `logEntry`: reference to the log for debugging
* A `complete(details)` function: used to finalize the log (success/failure)

This allows complete traceability of what happened during the request lifecycle.

---

## 📤 Sample Success Response

```json
{
  "success": true,
  "data": [ /* array of user objects */ ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 57,
    "totalPages": 6
  }
}
```

---

## 📤 Sample Failure Response

```json
{
  "success": false,
  "error": "Could not retrieve users",
  "systemError": "MongoError: Connection failed" // only in development
}
```

---

## 🔐 Security Notes

* Requires `req.user` to be populated (implies previous authentication middleware).
* All actions are logged for traceability — ensuring **compliance and security audits**.

---

## ✅ Summary

The `listUsers` method offers a secure, traceable, and flexible way to list users from an admin panel with:

* Strong error handling
* Pagination and filters
* Admin auditing through timed logs


## 📥 Request Body Example (JSON)

This endpoint uses **query parameters** for filtering and pagination, so no request body is required. Below is an example of query parameters you can send:

```json
{
  "page": "1",             // Optional: Page number (default: 1)
  "limit": "10",           // Optional: Number of users per page (max 100, default: 10)
  "status": "active",      // Optional: Filter users by status (e.g., active, inactive)
  "role": "admin",         // Optional: Additional filter example (any valid user property)
  "email": "user@example.com" // Optional: Filter by email or other fields
}
````

Note: Since these are query parameters, in Postman set them under the **Params** tab rather than in the raw body.
