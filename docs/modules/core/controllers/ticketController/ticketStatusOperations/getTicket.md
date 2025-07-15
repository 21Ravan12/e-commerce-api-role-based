# getTicket.md

This function handles HTTP requests to retrieve a specific ticket by its ID. It performs validation, logging, auditing, and returns the ticket data as JSON.

---

## Function: `getTicket(req, res)`

### 1. Logging the Request
- Logs an informational message including the requested ticket ID and the requester's IP address.
  ```js
  logger.info(`Get ticket request for ID: ${req.params.id} from IP: ${req.ip}`);

### 2. Validate Ticket ID

* Checks if the provided `req.params.id` is a valid MongoDB ObjectId using Mongoose's utility.
* Throws an error if invalid to prevent unnecessary database queries.

### 3. Fetch Ticket Data

* Calls an asynchronous `getTicket` function (assumed imported or defined elsewhere) to retrieve ticket details from the database by ID.

### 4. Audit Logging

* Creates an audit log entry recording:

  * The action type: `'ticket_view'`
  * The event: `'view_ticket'`
  * Source of the request: `'web'`
  * Target model and ID (`Ticket` and ticket's ID)
  * The user performing the action (`req.user._id`)
  * IP address and user agent for traceability

### 5. Responding to Client

* Sends HTTP 200 OK status.
* Returns a JSON object containing:

  * The retrieved `ticket` data.
  * A `timestamp` of the response generation in ISO string format.

### 6. Error Handling

* Any errors thrown during validation, fetching, or logging are caught.
* Calls `this.handleError(res, error)` to send an appropriate error response (method assumed defined elsewhere).

---

## Summary

`getTicket` ensures secure and traceable retrieval of ticket information with proper validation and audit trail creation, providing clear feedback to the client while maintaining robust error management.


## 📥 Request Body Example (JSON)

This endpoint does **not require a request body**.

All necessary data is provided via the URL parameter `:id`, which should be a valid MongoDB ObjectId representing the ticket ID.

**Example URL:**  
```

GET /api/tickets/64f1b9a3a7c4d2b5f8e2c190
