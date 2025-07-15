# getClosedTickets.md

This function `getClosedTickets` is an asynchronous Express route handler responsible for retrieving a paginated list of closed tickets within a specified time frame. It includes detailed audit logging, error handling, and response formatting.

---

## Function Overview

### 1. Audit Logging Start
- Creates a timed admin log entry using `AuditLog.createTimedAdminLog`.
- Logs the action `"get_closed_tickets"` along with:
  - Model targeted: `"Ticket"`
  - User performing the action (`req.user._id` and email)
  - Client IP address and user-agent
  - Request source (`"web"`)
  - Query parameters received (`days`, `page`, `limit`)

### 2. Request Parameters Parsing & Validation
- Reads query parameters with default fallbacks:
  - `days`: Defaults to 30 (last 30 days)
  - `page`: Defaults to 1, minimum 1 enforced
  - `limit`: Defaults to 10, clamped between 1 and 100 to prevent abuse
- Parses these to integers for use in queries.

### 3. Fetching Tickets
- Calls the `getClosedTickets` service/function with `{ days, page, limit }` arguments.
- This service presumably queries the database for tickets closed within the last `days` days, paginated by `page` and `limit`.

### 4. Audit Logging Completion on Success
- Completes the audit log entry marking status `"success"`.
- Adds details including final parameters used and the number of results returned vs total available.

### 5. Sending Response
- Returns HTTP 200 with a JSON payload containing:
  - `success: true`
  - `data`: array of closed tickets
  - `pagination`: current page, limit per page, total count, and total pages
  - `timestamp`: current server time in ISO format

### 6. Error Handling
- If any error occurs:
  - Completes audit log marking `"failed"` status with error message and stack (stack trace only in development).
  - Logs the error and stack using a logger service.
  - Calls `this.handleError(res, error)` to send an appropriate error response.

---

## Summary
This method carefully tracks its operation with audit logs for administrative oversight, validates input to avoid abuse or invalid data, fetches data with pagination support, and ensures robust error management. It provides clear and consistent JSON responses reflecting both success and failure scenarios.


```md
## 📥 Request Body Example (JSON)

This endpoint does not require a request body as it utilizes query parameters for filtering and pagination. Below are the query parameters you can use when making a request to retrieve closed tickets:

### Query Parameters:
- **`days`** (optional): The number of days in the past to filter tickets. Default is 30 days.
  - Example: `days=7`
- **`page`** (optional): The page number for pagination. Default is 1.
  - Example: `page=2`
- **`limit`** (optional): The number of tickets per page. Default is 10, with a maximum of 100.
  - Example: `limit=20`


### Example Request:
```

GET /api/tickets/closed?days=30\&page=1\&limit=10

This request will return the closed tickets from the past 30 days, showing the first page with 10 tickets.

### Example Response:
```json
{
    "success": true,
    "data": [
        {
            "ticketId": "12345",
            "subject": "Issue with payment",
            "status": "closed",
            "closedDate": "2025-06-25T15:30:00Z",
            "resolvedBy": "admin@company.com"
        },
        {
            "ticketId": "12346",
            "subject": "Password reset issue",
            "status": "closed",
            "closedDate": "2025-06-24T12:00:00Z",
            "resolvedBy": "admin@company.com"
        }
    ],
    "pagination": {
        "page": 1,
        "limit": 10,
        "total": 50,
        "totalPages": 5
    },
    "timestamp": "2025-06-30T16:00:00Z"
}
