# unassignTicket.md

This document explains the logic and flow behind the `unassignTicket` controller method. This endpoint allows a moderator or user to **unassign themselves** (or another user) from a specific ticket.

---

## 🔧 Method: `async unassignTicket(req, res)`

### 🔹 Purpose
Handles HTTP requests to **remove the assigned user** from a ticket. This is typically used in help desk or issue-tracking systems where tickets can be reassigned or unassigned by moderators or users with permission.

---

## 🧩 Step-by-Step Breakdown

### 1. **Logging Request Details**
```js
logger.info(`Unassign ticket request for ID: ${req.params.id} from IP: ${req.ip}`);
````

* Logs the action for debugging and audit trails.
* Captures ticket ID and request IP.

---

### 2. **Validation**

```js
if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
  throw new Error('Invalid ticket ID');
}
```

* Ensures the ticket ID is a valid MongoDB ObjectId.
* Prevents malformed or malicious input.

---

### 3. **Ticket Unassignment**

```js
const result = await unassignTicket(
  req.params.id,
  req.user._id
);
```

* Calls a service-layer function `unassignTicket(ticketId, userId)` that:

  * Unassigns the ticket.
  * Likely performs permission checks internally.
  * Returns an object with information (e.g., `previousAssignee`).

---

### 4. **Audit Logging**

```js
await AuditLog.createLog({
  action: 'ticket_unassign',
  event: 'unassign_ticket',
  source: 'moderator',
  targetId: req.params.id,
  performedBy: req.user._id,
  ip: req.ip,
  userAgent: req.get('User-Agent'),
  details: {
    previousAssignee: result.previousAssignee
  }
});
```

* Creates a detailed log entry for compliance, traceability, or analytics.
* Logs:

  * Action type
  * Target ticket ID
  * Requestor details (`performedBy`, IP, user-agent)
  * Contextual metadata (`previousAssignee`)

---

### 5. **Response**

```js
res.status(200).json({
  message: 'Ticket unassigned successfully',
  ticketId: req.params.id,
  timestamp: new Date().toISOString()
});
```

* Returns a success response with a 200 status.
* Includes ticket ID and current timestamp.

---

### 6. **Error Handling**

```js
this.handleError(res, error);
```

* Catches and forwards any error to a generic handler (`handleError`), which:

  * Sends a user-friendly error response.
  * Logs the full stack trace internally.

---

## ✅ Summary

| Aspect         | Description                                                            |
| -------------- | ---------------------------------------------------------------------- |
| Route Type     | `PATCH` or `POST` (typically, depends on route file)                   |
| Auth Required  | ✅ Yes (`req.user._id` is used)                                         |
| Input          | `req.params.id` (ticket ID)                                            |
| Output         | JSON message, ticket ID, timestamp                                     |
| Side Effects   | Ticket is unassigned, and audit log is generated                       |
| Error Handling | Uses centralized `handleError()` method for consistent error responses |

---

## 📥 Request Body Example (JSON)

```json
{}
Note: This endpoint does not require a request body. The ticket ID is passed as a URL parameter (:id), and the authenticated user is determined from the request context.