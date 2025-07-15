# listCategories.md

This document explains the functionality of the `listCategories` controller method. It is responsible for handling client requests to fetch a list of knowledge base categories, optionally including the number of articles/items in each category. The method also logs the action for auditing and monitoring purposes.

---

## 🔄 Method: `async listCategories(req, res)`

### ✅ Purpose
Handles HTTP requests to retrieve categories, optionally with their associated counts, and returns them in a JSON response. Logs the request metadata and user context to the audit system.

---

## 🧱 Breakdown of Logic

### `logger.info(...)`
- Logs the request origin IP address using a centralized logger.
- Useful for request tracing and debugging.

### `const { includeCount = false } = req.query;`
- Extracts `includeCount` from the query string.
- Defaults to `false` if not provided.
- Determines whether to fetch item/article counts for each category.

### `const categories = await listCategories(includeCount);`
- Calls a service or database utility function `listCategories()`, passing the `includeCount` flag.
- Expected to return an array of category objects.
- Each category object may contain a `count` property if `includeCount` is `true`.

### `await AuditLog.createLog({ ... })`
- Logs the action in an **audit log** for accountability and traceability.
- Fields:
  - `action`: Internal code for the operation.
  - `event`: Human-readable name for event.
  - `source`: Indicates platform (e.g., `'web'`).
  - `performedBy`: Current user's ID (`req.user?._id`), if authenticated.
  - `ip`: IP address of the requester.
  - `userAgent`: Browser or client software string.

### `res.status(200).json({ ... })`
- Returns a success response with:
  - `data`: The fetched categories.
  - `timestamp`: Current server time in ISO string format.

### `catch (error)`
- If any error occurs, it is caught and passed to `this.handleError(res, error)` which handles sending an appropriate error response.

---

## 📦 Summary of Output

On success:
```json
{
  "data": [ /* Array of category objects */ ],
  "timestamp": "2025-06-25T18:00:00.000Z"
}

On failure:

* Error is handled via `this.handleError`, assumed to send a proper status code and error message.

---

## 🔐 Auth & Security

* Assumes `req.user` is populated by authentication middleware.
* Logs contain `userAgent` and `IP` for forensic auditing.
* Does not require authentication to fetch categories unless enforced outside this method.

---

## 🌐 Use Case

This endpoint is useful for:

* Rendering knowledge base category lists.
* Populating dropdowns or navigation menus.
* Debugging or analytics with audit trail support.

---

## 📎 Dependencies

* `listCategories(includeCount)`: Service or DB utility to fetch categories.
* `logger`: Central logging utility.
* `AuditLog.createLog`: Auditing system for user and system actions.
* `this.handleError`: Controller error handling wrapper method.

## 📥 Request Body Example (JSON)

This endpoint uses **query parameters** and does **not** require a JSON body. However, here is an example of how you might call it with query options:

```json
{}

To include additional information (like category counts), use query string:

```
GET /categories?includeCount=true
```

If you're using Postman, leave the request body empty and set the query parameter in the **Params** tab:

| Key          | Value      | Description                     |
| ------------ | ---------- | ------------------------------- |
| includeCount | true/false | Optional. Includes item counts. |
