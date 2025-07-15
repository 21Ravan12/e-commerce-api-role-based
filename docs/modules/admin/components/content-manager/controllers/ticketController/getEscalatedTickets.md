# getEscalatedTickets.md

This function handles the retrieval of escalated support tickets with pagination and audit logging.

---

## Function: `getEscalatedTickets(req, res)`

### Overview
- Retrieves a paginated list of escalated tickets.
- Logs the entire operation as an audit entry for admin tracking.
- Returns detailed pagination info along with ticket data.
- Handles errors gracefully and logs them.

---

### Detailed Explanation

1. **Audit Log Creation (Start)**
   - Calls `AuditLog.createTimedAdminLog()` to create a timed audit log entry.
   - Records:
     - Action name: `'get_escalated_tickets'`
     - Target model: `'Ticket'`
     - User performing the action: `req.user._id` and `req.user.email`
     - Client IP address and user agent for traceability.
     - Source: `'web'`
     - Includes requested pagination params (`page` and `limit`) in details.
   - Returns a log entry object and a `complete` function to finalize the log later.

2. **Request Query Parsing & Validation**
   - Extracts `page` and `limit` from `req.query`.
   - Ensures:
     - `page` is at least 1.
     - `limit` is between 1 and 100.
   - Converts these values to integers for safe usage.

3. **Fetching Tickets**
   - Calls the external `getEscalatedTickets` service/helper with `{ page, limit }`.
   - Receives an object containing:
     - `tickets`: array of ticket objects.
     - `total`: total number of escalated tickets available.

4. **Audit Log Completion (Success)**
   - Calls `complete()` with:
     - Status: `'success'`.
     - Details including:
       - Final pagination info (page, limit, total tickets, total pages).
       - Number of tickets returned.
       - Unique escalation levels present in the returned tickets.

5. **Response to Client**
   - Sends HTTP 200 with JSON containing:
     - `success: true`
     - `data`: the tickets array.
     - `pagination`: page, limit, total tickets, total pages.
     - `timestamp`: current ISO timestamp for client-side reference.

6. **Error Handling**
   - On any error during processing:
     - Completes the audit log with status `'failed'` and error details.
     - Logs the error with `logger.error()`.
     - Calls `this.handleError(res, error)` to send an appropriate error response.

---

### Summary

This method ensures:
- Secure, traceable access to escalated tickets with comprehensive audit logs.
- Proper pagination and input validation.
- Detailed logging of success and failure states for accountability.
- Clear, structured JSON response including pagination metadata.


## 📥 Request Body Example (JSON)

> This endpoint uses **query parameters**, not a JSON body. The following parameters can be included in the URL to control pagination:

### Query Parameters:
| Parameter | Type   | Required | Description                           |
|-----------|--------|----------|---------------------------------------|
| `page`    | Number | Optional | Page number (default: `1`)            |
| `limit`   | Number | Optional | Number of tickets per page (default: `10`, max: `100`) |

### Example Request URL:
```

GET /admin/tickets/escalated?page=2\&limit=20

```

> ⚠️ This route should be called with proper authentication and admin privileges.
```
