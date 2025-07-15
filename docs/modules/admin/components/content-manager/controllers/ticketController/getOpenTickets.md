# getOpenTickets.md

This method handles an HTTP request to **retrieve open tickets** with pagination, while logging the admin action for auditing purposes.

---

## Method: `getOpenTickets(req, res)`

### 1. Audit Logging Initialization
- Calls `AuditLog.createTimedAdminLog` to create a **timed audit log entry** capturing:
  - Action: `"get_open_tickets"`
  - Target model: `"Ticket"`
  - Requester info: user ID, email, IP address, user-agent
  - Source: `"web"`
  - Request details: requested pagination parameters (`page`, `limit`)
- Returns:
  - `logEntry`: the created log object
  - `complete`: a callback function to finalize the log with status and details

### 2. Request Handling & Pagination
- Logs an informational message with the client IP.
- Extracts pagination parameters from query string (`req.query.page`, `req.query.limit`):
  - Defaults: `page = 1`, `limit = 10`
  - Sanitizes inputs:
    - `page` is at least 1
    - `limit` is between 1 and 100 to prevent excessive load
- Calls a service function `getOpenTickets` with pagination info.

### 3. Success Handling
- Upon successful retrieval:
  - Completes the audit log with:
    - Status: `"success"`
    - Details: number of tickets returned, final pagination info including total count and total pages
  - Sends a JSON response with:
    - `success: true`
    - `data`: array of open tickets
    - `pagination`: page, limit, total count, total pages
    - `timestamp`: current ISO date-time string

### 4. Error Handling
- If an error occurs:
  - Completes the audit log with:
    - Status: `"failed"`
    - Details: error message and optionally stack trace (only in development)
  - Calls `this.handleError(res, error)` to send an appropriate error response.

---

## Summary
This function tightly integrates **auditing** with **business logic** by:
- Logging admin actions with detailed metadata before and after the operation.
- Enforcing safe pagination input.
- Returning paginated open tickets with metadata.
- Handling errors gracefully with audit logs.


## 📥 Request Body Example (JSON)

This endpoint does not require a request body as it uses query parameters for pagination.

Example request URL with query parameters:

```

GET /api/tickets/open?page=1\&limit=10

```

- `page` (optional, integer): The page number to retrieve (default: 1).
- `limit` (optional, integer): Number of tickets per page (default: 10, max: 100).

Since this is a GET request, no JSON body is sent.
