# getUserTickets.md

This file documents the `getUserTickets` controller method, which retrieves a paginated list of support tickets belonging to a specific user. It includes detailed audit logging, error handling, input validation, and pagination mechanics.

---

## 📥 Input

### Route Parameters
- `req.params.userId`: The MongoDB ObjectId of the user whose tickets should be fetched.

### Query Parameters
- `page` (optional): The page number for pagination (default: `1`).
- `limit` (optional): The number of tickets per page (default: `10`, max: `100`).

### Authenticated User Context
- `req.user`: Automatically injected by authentication middleware; includes:
  - `_id`: ID of the requesting admin/user.
  - `email`: Email of the authenticated user.

---

## 📄 Description

### Step 1: Create Timed Audit Log
A new admin log entry is created using `AuditLog.createTimedAdminLog()`:
- **Purpose**: Tracks access attempts for fetching user ticket data.
- Captures:
  - Action name (`get_user_tickets`)
  - Admin identity and source IP
  - Requested user ID
  - Pagination info
- Returns:
  - `logEntry`: Log metadata
  - `complete`: A function to mark the log as "success" or "failed" later.

---

### Step 2: Validate and Sanitize Inputs
- Ensures `userId` is a valid MongoDB ObjectId using `mongoose.Types.ObjectId.isValid`.
- Parses and sanitizes `page` and `limit` query values:
  - `page` is clamped to minimum `1`
  - `limit` is clamped between `1` and `100`

If validation fails:
- Marks the log as `failed` with error details.
- Throws an exception to exit the flow.

---

### Step 3: Fetch Tickets
Calls `getUserTickets(userId, { page, limit })`:
- Returns:
  - `tickets`: An array of ticket documents.
  - `total`: Total count of tickets for the user.

---

### Step 4: Complete Audit Log with Success
Marks the timed audit log as `success`, adding:
- Ticket count
- Pagination details (total pages, current page, etc.)

---

### Step 5: Return Success Response
Returns a structured `200 OK` JSON response:
```json
{
  "success": true,
  "userId": "...",
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 42,
    "totalPages": 5
  },
  "timestamp": "2025-06-25T20:45:00.000Z"
}


---

## ❌ Error Handling

If any error occurs:

* The audit log is marked as `failed` with the error message and (if in development) the full stack trace.
* Logs a detailed error using the `logger` service.
* Responds using a custom `handleError()` method that:

  * Sends appropriate HTTP status.
  * Adds debug info conditionally (only in development).

---

## 📦 Dependencies

* `AuditLog`: Tracks and finalizes admin actions with detailed logs.
* `logger`: Custom logging service used for internal error monitoring.
* `mongoose`: Used for ObjectId validation.
* `getUserTickets(userId, options)`: Abstracted database/service call for fetching tickets.
* `this.handleError()`: Centralized error handler used across the controller.

---

## ✅ Summary

`getUserTickets` is a secure and traceable endpoint designed for admins to retrieve support tickets of a specific user. It includes:

* Strict input validation
* Structured logging and auditing
* Safe error reporting
* Developer-friendly pagination and feedback


## 📥 Request Body Example (JSON)

This endpoint does **not** require a request body. It uses URL parameters and query strings to fetch user tickets.

---

### URL Parameters

| Parameter | Type   | Description                 | Example                      |
|-----------|--------|-----------------------------|------------------------------|
| userId    | string | MongoDB ObjectId of the user | `507f1f77bcf86cd799439011`   |

---

### Query Parameters

| Parameter | Type   | Description                     | Default | Allowed Values          |
|-----------|--------|---------------------------------|---------|------------------------|
| page      | number | Page number for pagination      | 1       | Integer ≥ 1             |
| limit     | number | Number of tickets per page      | 10      | Integer between 1 and 100 |

---

### Example URL

```

GET /api/users/507f1f77bcf86cd799439011/tickets?page=2\&limit=20

```

No JSON body is sent in the request.
