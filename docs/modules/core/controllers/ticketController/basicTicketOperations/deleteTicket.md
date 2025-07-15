# deleteTicket.md

This function `deleteTicket` handles the HTTP request to delete a support or moderation ticket. It performs validation, deletion, audit logging, and sends an appropriate response.

---

## Function Overview

### `async deleteTicket(req, res)`

- **Purpose:** Delete a ticket identified by `req.params.id` on behalf of the authenticated user `req.user._id`.
- **Request:** 
  - `req.params.id` - the ticket's unique identifier.
  - `req.user._id` - the ID of the user performing the deletion (typically a moderator).
  - `req.body.reason` (optional) - reason for deletion.

---

## Step-by-step Explanation

1. **Logging Request Start:**
   - Logs an informational message with the ticket ID and the requester's IP address using `logger.info`.

2. **Ticket ID Validation:**
   - Checks if `req.params.id` is a valid MongoDB ObjectId using `mongoose.Types.ObjectId.isValid`.
   - Throws an error if invalid, preventing further processing.

3. **Ticket Deletion:**
   - Calls an external `deleteTicket` service/function with the ticket ID and user ID.
   - This is an asynchronous operation that removes the ticket from the database or marks it as deleted.

4. **Audit Logging:**
   - Creates an audit log entry recording:
     - Action type: `'ticket_delete'`
     - Event name: `'delete_ticket'`
     - Source: `'moderator'` (user role or origin)
     - Target ticket ID
     - User who performed the deletion
     - IP address and User-Agent string for traceability
     - Details including deletion reason (defaults to `'No reason provided'` if missing)

5. **Response:**
   - Sends a JSON response with HTTP status `200 OK` confirming success.
   - Response includes:
     - Confirmation message
     - Deleted ticket ID
     - Timestamp of the operation in ISO format

6. **Error Handling:**
   - Any errors during validation, deletion, or logging are caught and passed to a shared `handleError` method.
   - This method formats and sends an appropriate error response to the client.

---

## Summary

This method ensures safe deletion of tickets with validation and comprehensive audit trails for accountability, returning clear success or error responses to the client.


## 📥 Request Body Example (JSON)

```json
{
  "reason": "User request - duplicate issue"
}
````

* `reason` (optional): A textual explanation for why the ticket is being deleted.

  * If not provided, it defaults to `"No reason provided"` in the audit log.
