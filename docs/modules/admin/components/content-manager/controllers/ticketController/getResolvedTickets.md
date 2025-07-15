# getResolvedTickets.md

This file documents the `getResolvedTickets` controller method. It is responsible for retrieving resolved support tickets within a given time range, applying pagination, and logging the operation for audit and diagnostics.

---

## 🧠 Purpose
Fetch a paginated list of tickets that were resolved within a specified number of days, along with metadata for logging, auditing, and client-side pagination.

---

## 📥 Request Parameters (via `req.query`)
- `days`: *(optional)* Number of past days to consider. Defaults to `30`.
- `page`: *(optional)* Current pagination page. Defaults to `1`.
- `limit`: *(optional)* Number of items per page. Defaults to `10`. Max allowed is `100`.

---

## 🔐 Auth Context (via `req.user`)
The request must come from an authenticated user (`req.user`), as the user's ID and email are logged in the audit log.

---

## 📝 Step-by-Step Breakdown

### 1. **Create a Timed Audit Log**
```js
const { logEntry, complete } = await AuditLog.createTimedAdminLog({ ... });
````

Creates a log entry marking the start of the operation:

* Action: `"get_resolved_tickets"`
* Target model: `"Ticket"`
* Performed by: Authenticated admin user
* Captures IP, user agent, and query params
* Returns a `complete()` function to be called after success/failure

---

### 2. **Sanitize & Parse Query Parameters**

```js
const daysNumber = parseInt(days);
const pageNumber = Math.max(1, parseInt(page));
const limitNumber = Math.min(100, Math.max(1, parseInt(limit)));
```

Ensures input safety:

* `days` is parsed as an integer (defaults to 30)
* `page` must be at least 1
* `limit` is bounded between 1 and 100

---

### 3. **Query Resolved Tickets**

```js
const { tickets, total } = await getResolvedTickets({ ... });
```

Calls the data access function to retrieve:

* A list of resolved tickets
* The total number of matched tickets for pagination

---

### 4. **Complete the Audit Log (Success)**

```js
await complete({ status: 'success', details: { ... } });
```

Marks the audit log as complete with:

* Final query values
* Count of results and total available tickets
* Pagination metadata

---

### 5. **Send Response to Client**

```js
res.status(200).json({ success: true, data: ..., pagination: ..., timestamp: ... });
```

Returns:

* The resolved tickets (`data`)
* Pagination info (`page`, `limit`, `total`, `totalPages`)
* Current timestamp

---

### 6. **Catch and Log Errors**

If an error occurs:

* Logs the error with a detailed stack (in development)
* Completes the audit log with `status: 'failed'`
* Sends a 500 JSON response to the client

```js
res.status(500).json({ success: false, error: ..., systemError: ..., timestamp: ... });
```

---

## 📤 Output Format

```json
{
  "success": true,
  "data": [ /* Array of resolved tickets */ ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 55,
    "totalPages": 6
  },
  "timestamp": "2025-06-25T21:00:00.000Z"
}
```

In case of failure:

```json
{
  "success": false,
  "error": "Could not retrieve resolved tickets",
  "systemError": "Detailed error message (only in development)",
  "timestamp": "..."
}
```

---

## 🛡️ Security & Logging

* Relies on secure user context (`req.user`)
* IP address and user-agent are logged
* Audit logging is comprehensive: both request intent and outcome
* Stack traces are included only in development for security

---

## 📚 Dependencies

* `AuditLog.createTimedAdminLog`: Tracks operation with `complete()` callback
* `getResolvedTickets({ days, page, limit })`: Core data-fetching logic (imported separately)
* `logger`: For internal error reporting

---

## 📥 Request Body Example (JSON)

This endpoint uses query parameters, so the request body is typically empty or not required. However, to illustrate typical usage, here are example query parameters:

```json
{
  "days": "30",
  "page": "1",
  "limit": "10"
}
````

* **days** (optional, string or number): Number of past days to look back for resolved tickets. Defaults to 30.
* **page** (optional, string or number): Pagination page number. Defaults to 1.
* **limit** (optional, string or number): Number of tickets per page. Defaults to 10, maximum 100.

*Note: These parameters are sent as URL query parameters, not in the request body.*
