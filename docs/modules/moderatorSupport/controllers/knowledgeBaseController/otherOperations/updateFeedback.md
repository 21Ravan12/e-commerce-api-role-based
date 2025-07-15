# updateFeedback.md

This function, `updateFeedback`, handles updating a feedback entry in the system. It includes authorization checks, input validation, updating the database, audit logging, and error handling.

---

## Workflow Breakdown

1. **Logging Request Start**
   - Logs an informational message indicating a feedback update request, including the feedback ID from route parameters and the requester’s IP address.

2. **Authorization Check**
   - Only users with roles `'moderator'` or `'admin'` are permitted to update feedback.
   - If the requester lacks these roles, an error with status code `403` (Forbidden) is thrown.

3. **Content-Type Validation**
   - Ensures the request’s `Content-Type` header is `application/json`.
   - Throws an error if the request body is not JSON.

4. **Feedback ID Validation**
   - Validates that the provided `feedbackId` route parameter is a valid MongoDB ObjectId.
   - Throws an error if invalid.

5. **Updating Feedback**
   - Extracts the update data from `req.body`.
   - Calls an external `updateFeedback` function (presumably a database operation) with:
     - The `Feedback` model
     - The validated feedback ID
     - The update data
     - The ID of the user performing the update

6. **Audit Logging**
   - Records the update action using an `AuditLog.createLog` method with details:
     - Action type (`knowledge_base_update_feedback`)
     - Event (`delete_attachment`) — likely context-specific or might be a fixed tag for this operation
     - Source user role (`moderator`)
     - Target model and ID (the updated feedback)
     - The user who performed the action
     - Client IP and User-Agent header for traceability
     - The specific fields that were updated

7. **Response**
   - Sends a success JSON response with:
     - Confirmation message
     - The updated feedback’s ID
     - Timestamp of the operation

8. **Error Handling**
   - Any error raised during processing is caught and passed to a shared `handleError` method that manages error responses.

---

## Summary

This function securely updates feedback data with strict role-based access control and input validation, tracks the action in an audit log for accountability, and returns clear, timestamped confirmation to the client. It helps maintain data integrity and traceability in the system.

## 📥 Request Body Example (JSON)

When sending a request to `PATCH /feedback/:feedbackId`, the body must be in `application/json` format. Below is an example of how to structure the request body:

```json
{
  "status": "resolved",
  "moderatorNote": "Issue has been reviewed and resolved.",
  "tags": ["UI", "bug", "reviewed"]
}
