# deescalateTicket.md

This document explains the functionality and flow of the `deescalateTicket` controller method. The purpose of this method is to reduce the priority of a ticket—typically as a moderation or issue triage action—while maintaining full audit logging for accountability.

---

## 🔁 Method: `async deescalateTicket(req, res)`

### 🧠 Purpose
To **reduce the urgency or priority level** of a ticket, typically used by moderators or support agents, and to log this action securely for traceability.

---

## 📥 Request Parameters

- `req.params.id`: The ticket ID to be de-escalated (must be a valid MongoDB ObjectId).
- `req.body.priority`: Optional. The new priority to set (defaults to `'low'` if not provided).
- `req.body.reason`: Optional. Reason for de-escalation (defaults to `'No reason provided'`).
- `req.user._id`: Extracted from the authenticated session (indicates who is performing the action).
- `req.ip`: Captures the origin IP of the request.
- `req.get('User-Agent')`: Captures the client user agent for logging.

---

## 🔒 Validation

```js
if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
  throw new Error('Invalid ticket ID');
}
````

Ensures the ticket ID is a valid MongoDB ObjectId to prevent malformed or malicious queries.

---

## 🔧 De-escalation Logic

```js
const result = await deescalateTicket(
  req.params.id,
  req.user._id,
  req.body.priority || 'low',
  req.body.reason || 'No reason provided'
);
```

Calls the core service logic (assumed to be a separate function named `deescalateTicket`) to perform the de-escalation. It:

* Changes the ticket's priority.
* Tracks who initiated the change.
* Records the provided reason.

The result object is expected to contain:

* `newPriority`: The new priority level after the change.
* `previousPriority`: The ticket's original priority.

---

## 📝 Audit Logging

```js
await AuditLog.createLog({...});
```

Logs the action to the audit trail with detailed metadata:

* **Action**: `'ticket_deescalate'`
* **Event**: `'deescalate_ticket'`
* **Source**: `'moderator'`
* **Target ID**: the ticket's ID
* **Performed By**: user who made the request
* **IP/User-Agent**: device and network info
* **Details**: includes `newPriority` and `previousPriority`

This ensures accountability and enables admins to review moderation actions later.

---

## 📤 Response

On success:

```json
{
  "message": "Ticket deescalated successfully",
  "ticketId": "<ticket_id>",
  "priority": "<new_priority>",
  "timestamp": "<ISO_8601_time>"
}
```

Provides confirmation along with metadata about the de-escalated ticket.

---

## ❌ Error Handling

All errors are caught and passed to `this.handleError(res, error)` — a presumed shared error handling utility that formats and sends proper error responses to the client.

---

## ✅ Summary

`deescalateTicket()` is a secure, auditable controller method designed for reducing the priority of a ticket. It enforces input validation, records all actions for future inspection, and ensures consistent communication with the client through structured responses.

## 📥 Request Body Example (JSON)

```json
{
  "priority": "low",
  "reason": "Issue resolved, no longer urgent"
}
