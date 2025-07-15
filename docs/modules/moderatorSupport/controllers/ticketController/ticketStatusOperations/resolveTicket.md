# resolveTicket.md

This file documents the `resolveTicket` controller method, which handles the resolution of support or moderation tickets in the system. The method ensures secure input validation, logs the operation, and returns a structured response upon success.

---

## 🔧 Function: `resolveTicket(req, res)`

This is an **asynchronous Express route handler** designed to allow authenticated users (typically moderators or admins) to resolve a ticket.

---

## 📥 Request Structure

- **Route Parameter**: `req.params.id`
  - The unique MongoDB ObjectId of the ticket to be resolved.
- **Request Body**: `req.body.resolution`
  - A textual description or explanation of how the ticket was resolved.
- **Authenticated User**: `req.user._id`
  - Used to log who performed the action.

---

## ✅ Processing Flow

1. **Logging the Request**:
   ```js
   logger.info(...)

Logs the incoming request with the ticket ID and the user's IP for audit and debugging purposes.

2. **ID Validation**:

   ```js
   if (!mongoose.Types.ObjectId.isValid(req.params.id)) { ... }
   ```

   Ensures the ticket ID is a valid MongoDB ObjectId. Throws an error if not.

3. **Resolve the Ticket**:

   ```js
   const result = await resolveTicket(...)
   ```

   Calls a service or utility function to apply the resolution. Likely updates ticket status in the database.

4. **Audit Logging**:

   ```js
   await AuditLog.createLog({ ... })
   ```

   Creates a secure, non-repudiable log entry for tracking actions taken by the user. Includes:

   * Action type (`ticket_resolve`)
   * Event (`resolve_ticket`)
   * Source (`moderator`)
   * Metadata: ticket ID, user ID, IP, user agent, and resolution text

5. **Success Response**:

   ```js
   res.status(200).json({ ... })
   ```

   Returns a JSON response indicating successful resolution, with:

   * Ticket ID
   * Resolution status
   * Resolution text
   * ISO timestamp

6. **Error Handling**:

   ```js
   this.handleError(res, error);
   ```

   Any exception is caught and passed to a generic error handler (likely logs the error and sends a 4xx/5xx response).

---

## 🛡️ Security & Validation

* Validates the format of the ticket ID to prevent database injection.
* Requires an authenticated user (`req.user`) — typically enforced by middleware.
* Logs both the action and metadata (IP, user-agent), which is essential for moderation transparency.

---

## 📦 External Dependencies

* `resolveTicket`: An imported function that updates ticket data in the database.
* `AuditLog.createLog`: Used to persist structured audit trails.
* `logger`: Custom logger service for structured logging.
* `mongoose.Types.ObjectId`: For ID validation.

---

## 💬 Response Example

```json
{
  "message": "Ticket resolved successfully",
  "ticketId": "60f5c2a7a29f4b001c8b4567",
  "status": "resolved",
  "resolution": "Issue was user error and guidance was provided.",
  "timestamp": "2025-06-25T10:00:00.000Z"
}
```

---

## 🧩 Summary

The `resolveTicket` method is a secure, auditable endpoint for resolving tickets, with built-in validation, structured logging, and traceability. It is designed for use in systems that require accountability, such as support dashboards or moderation panels.

## 📥 Request Body Example (JSON)

```json
{
  "resolution": "Issue fixed by resetting the user password."
}
