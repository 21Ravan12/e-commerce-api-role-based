# escalateTicket.md

This method, `escalateTicket`, handles the **escalation of support tickets** to a higher priority. It is typically used by moderators or admins when a ticket requires urgent attention. The method includes validation, business logic execution, audit logging, and structured response handling.

---

## 🔧 Method Signature

```js
async escalateTicket(req, res)
````

* `req`: The incoming HTTP request object, expected to contain:

  * `params.id`: The ticket's unique MongoDB ObjectId.
  * `user._id`: The ID of the authenticated user performing the escalation.
  * `body.priority` *(optional)*: The new priority level (default: `"high"`).
  * `body.reason` *(optional)*: Reason for escalation (default: `"No reason provided"`).

* `res`: The HTTP response object used to send status and data back to the client.

---

## 📝 Step-by-Step Explanation

### 1. **Logging the Request**

```js
logger.info(`Escalate ticket request for ID: ${req.params.id} from IP: ${req.ip}`);
```

Logs the ticket escalation request for traceability and debugging purposes, including the ticket ID and origin IP.

---

### 2. **Validate Ticket ID**

```js
if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
  throw new Error('Invalid ticket ID');
}
```

Ensures the ticket ID is a valid MongoDB ObjectId. Prevents malformed or malicious requests from proceeding.

---

### 3. **Escalate the Ticket**

```js
const result = await escalateTicket(
  req.params.id,
  req.user._id,
  req.body.priority || 'high',
  req.body.reason || 'No reason provided'
);
```

Calls the `escalateTicket` business logic (likely a service function), passing:

* The ticket ID
* The user performing the escalation
* New priority (defaulting to `"high"`)
* Escalation reason (if not provided, `"No reason provided"` is used)

The `result` is expected to include at least:

* `newPriority`
* `previousPriority`

---

### 4. **Audit Logging**

```js
await AuditLog.createLog({ ... });
```

Records a detailed audit log entry of the escalation event:

* **Action/Event**: Labeled as `"ticket_escalate"` for both.
* **Source**: `"moderator"` (can be changed as needed).
* **Target**: Ticket ID.
* **Performed By**: Authenticated user.
* **Metadata**: IP address, user-agent, and priority change details.

This is essential for transparency, compliance, and traceability in moderation actions.

---

### 5. **Return Success Response**

```js
res.status(200).json({ ... });
```

Returns a 200 OK response with:

* Confirmation message
* Ticket ID
* New priority
* Timestamp of escalation

---

### 6. **Error Handling**

```js
this.handleError(res, error);
```

Centralized error handler sends proper HTTP error responses with appropriate status codes and messages. Keeps the controller clean and consistent.

---

## 📦 Summary

This method is a **moderation tool** for re-prioritizing support tickets. It includes:

* Input validation
* Service delegation
* Audit logging
* Secure, structured responses

## 📥 Request Body Example (JSON)

```json
{
  "priority": "high",
  "reason": "Urgent issue requires immediate attention"
}
```
