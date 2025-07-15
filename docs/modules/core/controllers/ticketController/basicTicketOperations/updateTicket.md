# updateTicket.md

This function `updateTicket` handles the process of updating a ticket resource in the system, including validation, updating the record, logging the action, and sending the response.

---

## Function Overview

### Purpose
- To update a ticket identified by `req.params.id` with new data sent in the request body.
- Logs the update action for auditing.
- Responds with success or error messages.

---

## Step-by-Step Explanation

1. **Logging Request Info**
   - Logs the incoming update request with ticket ID and requester's IP address using `logger.info`.

2. **Validate Ticket ID**
   - Checks if `req.params.id` is a valid MongoDB ObjectId using `mongoose.Types.ObjectId.isValid`.
   - Throws an error if invalid, preventing invalid database operations.

3. **Validate Content-Type**
   - Ensures the request `Content-Type` is `application/json`.
   - Throws an error if the content type is incorrect, enforcing API contract.

4. **Perform Ticket Update**
   - Calls an asynchronous `updateTicket` function with:
     - Ticket ID (`req.params.id`)
     - User ID performing the update (`req.user._id`)
     - Update data object (`req.body.updates`)
   - This function presumably updates the ticket in the database.

5. **Audit Logging**
   - After a successful update, creates an audit log entry recording:
     - Action type and event (`ticket_update`, `update_ticket`)
     - Source of action (`moderator`)
     - Target ticket ID
     - User performing the update
     - IP address and user-agent string for traceability
     - Details of what fields were updated (from `req.body.updates`)

6. **Send Success Response**
   - Returns HTTP 200 with a JSON object containing:
     - Confirmation message
     - Ticket ID updated
     - List of updated fields (keys from update object)
     - Timestamp of operation (ISO string)

7. **Error Handling**
   - Any errors during validation, updating, or logging are caught in the `catch` block.
   - The error is passed to a generic `handleError` method which sends an appropriate error response.

---

## Summary

This method ensures safe, logged, and traceable updates to tickets by validating inputs, updating the data store, recording audit logs, and providing clear API responses. It also maintains security and integrity by validating IDs and content types before proceeding.


## 📥 Request Body Example (JSON)

When updating a ticket, you must send a JSON payload with the specific fields to be updated under the `updates` key.

```json
{
  "updates": {
    "status": "resolved",
    "assignedTo": "moderator_123",
    "resolutionNote": "Issue was identified and resolved. Root cause: misconfiguration."
  }
}
````

### ✅ Notes:

* The `updates` object can contain one or more fields that are allowed to be updated on the ticket.
* All fields inside `updates` must comply with your ticket schema validation (e.g., valid status values, existing user IDs for assignment).
* The request must include the `Content-Type: application/json` header.
