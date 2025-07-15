# listTickets.md

This function handles the API endpoint to **list support tickets** created by the authenticated user. It supports pagination, filtering, sorting, and logs audit information.

---

## Function: `listTickets(req, res)`

### 1. Logging the Request
- Logs the incoming request's IP address for monitoring and debugging:
  ```js
  logger.info(`List tickets request from IP: ${req.ip}`);

### 2. Extracting Query Parameters

* Reads query parameters from the request URL:

  * `page`: current page number (default: 1)
  * `limit`: number of tickets per page (default: 10)
  * `status`: filter tickets by status, default is `'open'`
  * `priority`: filter tickets by priority, default is `'medium'`
  * `sortBy`: field to sort results by, default `'createdAt'`
  * `sortOrder`: sorting order, `'desc'` or `'asc'`, default `'desc'`

### 3. Building the Filter Object

* Creates a filter object used for querying tickets:

  * Filters by `status` if provided
  * Filters by `priority` if provided
  * Restricts results to tickets created by the logged-in user (`req.user._id`)

### 4. Querying the Tickets

* Calls an asynchronous `listTickets` service function, passing:

  * Pagination options (`page`, `limit`)
  * Sorting options (`sortBy`, `sortOrder`)
  * Filter criteria (`filter`)

### 5. Audit Logging

* Records an audit log entry capturing:

  * The action (`ticket_list`) and event (`list_ticket`)
  * Source of the request (`web`)
  * User ID performing the action
  * IP address and user-agent string
  * Details including pagination and filters used

### 6. Responding to the Client

* Sends a JSON response with:

  * The ticket data array
  * Pagination metadata: current page, limit per page, and total tickets returned
  * A timestamp of the response generation

### 7. Error Handling

* Any errors in processing are caught and passed to a generic `handleError` method that sends an appropriate error response.

---

## Summary

This method provides a **secure, paginated, filtered, and audited way** to list tickets for the authenticated user, ensuring traceability and flexibility through query parameters.


## 📥 Request Body Example (JSON)

This endpoint uses **query parameters**, not a JSON body. However, here is how a typical request might look when constructed programmatically or via Postman with query string parameters:

```

GET /api/tickets?page=2\&limit=5\&status=open\&priority=high\&sortBy=updatedAt\&sortOrder=asc

```

If you are using Postman, these should be added under the **"Params"** tab (not in the body):

| Key        | Value       | Description                          |
|------------|-------------|--------------------------------------|
| `page`     | `2`         | (Optional) Page number for pagination (default: 1) |
| `limit`    | `5`         | (Optional) Number of tickets per page (default: 10) |
| `status`   | `open`      | (Optional) Ticket status filter (`open`, `closed`, etc.) |
| `priority` | `high`      | (Optional) Ticket priority filter (`low`, `medium`, `high`) |
| `sortBy`   | `updatedAt` | (Optional) Field to sort by (default: `createdAt`) |
| `sortOrder`| `asc`       | (Optional) Sorting direction: `asc` or `desc` (default: `desc`) |

📌 **Note**: This endpoint also requires authentication. Be sure to include your JWT token in the **Authorization** header (e.g., `Bearer <token>`).
