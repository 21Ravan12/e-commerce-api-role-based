# reopenTicket.md

This file documents the `reopenTicket` controller method, which is responsible for reopening a previously closed ticket. The function is designed for use in a **moderator or admin context**, where a ticket may need to be reactivated for further review or discussion.

---

## 🔁 Purpose

The `reopenTicket` method allows an authenticated and authorized user (likely a moderator) to reopen an existing ticket by providing a ticket ID and an optional reason. The action is logged for auditing and traceability.

---

## 🔧 Function Signature

```js
async reopenTicket(req, res)
````

* **req**: Express request object, expected to contain:

  * `params.id`: The ID of the ticket to reopen (as a URL param).
  * `user._id`: ID of the authenticated user performing the action.
  * `body.reason`: Optional reason for reopening the ticket.
* **res**: Express response object used to send the response back to the client.

---

## 🔍 Step-by-Step Breakdown

### 1. **Logging Request**

```js
logger.info(`Reopen ticket request for ID: ${req.params.id} from IP: ${req.ip}`);
```

* Logs the intent to reopen a ticket, including ticket ID and request IP for traceability.

### 2. **Ticket ID Validation**

```js
if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
  throw new Error('Invalid ticket ID');
}
```

* Ensures the ticket ID is a valid MongoDB ObjectId to prevent invalid database queries.

### 3. **Business Logic Execution**

```js
const result = await reopenTicket(req.params.id, req.user._id, req.body.reason);
```

* Calls the `reopenTicket` service function (defined elsewhere).
* Parameters:

  * Ticket ID to reopen
  * ID of the user requesting the action
  * Optional reason text

### 4. **Audit Logging**

```js
await AuditLog.createLog({
  action: 'ticket_reopen',
  event: 'reopen_ticket',
  source: 'moderator',
  targetId: req.params.id,
  performedBy: req.user._id,
  ip: req.ip,
  userAgent: req.get('User-Agent'),
  details: { reason: req.body.reason || 'No reason provided' }
});
```

* Records the action in the audit log system for compliance and tracking.
* Captures key metadata such as:

  * Action type and event name
  * Source (e.g., who initiated it)
  * Performed by (user ID)
  * IP address and user agent
  * Reopen reason

### 5. **Success Response**

```js
res.status(200).json({
  message: 'Ticket reopened successfully',
  ticketId: req.params.id,
  status: result.status,
  timestamp: new Date().toISOString()
});
```

* Sends a success response with:

  * Ticket ID
  * Updated status (e.g., `open`)
  * Timestamp for the client log or UI display

### 6. **Error Handling**

```js
this.handleError(res, error);
```

* A centralized error handler method is used to send structured error responses.
* Ensures consistent error reporting across controller methods.

---

## ✅ Summary

The `reopenTicket` controller method is a secure and well-logged action designed to:

* Validate inputs
* Call core business logic
* Record actions for audit compliance
* Return a meaningful response to the client

## 📥 Request Body Example (JSON)

```json
{
  "reason": "Issue resolved incorrectly, reopening for further investigation"
}
