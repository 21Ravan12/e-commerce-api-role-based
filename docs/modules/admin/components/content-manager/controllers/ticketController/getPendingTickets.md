# getPendingTickets.md

This function handles an HTTP request to **retrieve a paginated list of pending tickets** while simultaneously creating a detailed audit log for administrative tracking.

---

## Function: `getPendingTickets(req, res)`

### Overview
- Fetches tickets with a "pending" status using pagination parameters from the query string.
- Creates a timed audit log entry at the start and updates it upon completion (success or failure).
- Returns the list of tickets with pagination metadata in JSON format.
- Handles errors gracefully by logging and responding appropriately.

---

### Step-by-step Explanation

1. **Audit Log Creation**
   - Calls `AuditLog.createTimedAdminLog` with:
     - Action type: `'get_pending_tickets'`
     - Target model: `'Ticket'`
     - User info (`req.user._id`, `req.user.email`)
     - Request metadata (`ipAddress`, `userAgent`, and source `'web'`)
     - Pagination request details (`page`, `limit`)
   - Returns an object containing:
     - `logEntry`: the created audit log record
     - `complete`: a callback function to finalize the log entry with result info later

2. **Parsing Pagination Parameters**
   - Extracts `page` and `limit` from `req.query`.
   - Defaults to `page=1` and `limit=10` if missing or invalid.
   - Enforces constraints:
     - `page` must be at least 1.
     - `limit` is capped between 1 and 100.

3. **Fetching Pending Tickets**
   - Calls an external or internal `getPendingTickets` method with pagination info.
   - Expects a result object containing:
     - `tickets`: array of ticket records
     - `total`: total count of pending tickets available

4. **Completing Audit Log on Success**
   - Calls `complete` with:
     - Status: `'success'`
     - Details including:
       - Final pagination info (`page`, `limit`, `total`, `totalPages`)
       - Number of tickets returned
       - Unique set of ticket statuses included in the response (for metadata purposes)

5. **Sending Successful Response**
   - Responds with HTTP status 200.
   - Returns JSON payload containing:
     - `success: true`
     - `data`: the array of fetched tickets
     - `pagination`: current pagination info with totals
     - `timestamp`: ISO string of current time for logging/debugging

6. **Error Handling**
   - If an error occurs during ticket fetching or logging:
     - Calls `complete` with:
       - Status: `'failed'`
       - Error details including message and optionally stack trace (only in development environment)
     - Calls `this.handleError(res, error)` to send an appropriate error response.

---

### Summary

`getPendingTickets` is a robust, audited API handler that:
- Enforces valid pagination inputs.
- Logs detailed admin audit information with timestamps and user metadata.
- Returns paginated pending ticket data.
- Handles failures with logging and standardized error responses.


## 📥 Request Body Example (JSON)

```json
{}
```

*Note:* This endpoint does not require a request body. Pagination parameters (`page` and `limit`) should be provided as URL query parameters, for example:

```
GET /api/tickets/pending?page=2&limit=20
```
