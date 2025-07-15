# updateStatus.md

This function `updateStatus` handles HTTP requests to update the status of a ticket in the system. It performs validation, updates the ticket status, logs the action, and responds with the updated information.

---

## Function Breakdown

### 1. Logging Request Initiation
- Logs an info message with the ticket ID and requester's IP address for traceability.

### 2. Validate Ticket ID
- Checks if `req.params.id` is a valid MongoDB ObjectId using `mongoose.Types.ObjectId.isValid`.
- Throws an error if invalid, preventing malformed database queries.

### 3. Content-Type Check
- Verifies the request has `Content-Type: application/json`.
- Throws an error if not, enforcing correct API usage.

### 4. Extract and Validate Status
- Extracts `status` and optional `reason` from `req.body`.
- Validates `status` is one of the allowed values: `'open'`, `'in_progress'`, `'resolved'`, or `'closed'`.
- Throws an error for invalid status values to maintain data integrity.

### 5. Update Ticket Status
- Calls an asynchronous helper function `updateStatus` (likely a service or model method) with:
  - Ticket ID (`req.params.id`)
  - User ID of the requester (`req.user._id`)
  - New status
  - Reason for status update
- Receives the updated ticket data including the previous status.

### 6. Audit Logging
- Creates a new audit log entry recording:
  - The action (`ticket_status_update`) and event type.
  - Source of the update (`web`).
  - Target model and ID (the ticket).
  - User who performed the action.
  - IP address and User-Agent header for security and compliance.
  - Details including old and new status, and reason.

### 7. Send Success Response
- Returns HTTP 200 with JSON containing:
  - Confirmation message.
  - Ticket ID.
  - The updated status.
  - Timestamp of the update in ISO format.

### 8. Error Handling
- Catches any errors thrown during the process.
- Passes the error and response object to `this.handleError()` to manage consistent error responses.

---

## Summary

This method ensures secure, validated, and auditable updates to ticket statuses, improving traceability and enforcing proper API usage by validating inputs and logging critical actions.


## 📥 Request Body Example (JSON)

When making a request to `PATCH /tickets/:id/status`, ensure that the `Content-Type` is set to `application/json` and include the following body:

```json
{
  "status": "in_progress",
  "reason": "Assigned to a technician for further investigation"
}
````

### 🔸 Fields

* **`status`** (string, required): New status to set for the ticket. Must be one of:

  * `"open"`
  * `"in_progress"`
  * `"resolved"`
  * `"closed"`

* **`reason`** (string, optional but recommended): Explanation or context for the status change. Useful for audit trails and transparency.
