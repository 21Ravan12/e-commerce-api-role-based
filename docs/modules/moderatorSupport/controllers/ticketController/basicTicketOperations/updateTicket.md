# updateTicket.md

This document explains the logic and flow of the `updateTicket` controller method, which handles the update process of a ticket in a secure and auditable manner. It includes input validation, update operation, and audit logging.

---

## 🧩 Purpose

The `updateTicket(req, res)` function is designed to allow authorized users (typically moderators or admins) to update ticket data while:
- Ensuring request validity
- Performing strict input checks
- Recording every action in an audit log
- Sending a consistent response to the client

---

## 🔍 Step-by-Step Breakdown

### 1. **Log Incoming Request**
```js
logger.info(`Update ticket request for ID: ${req.params.id} from IP: ${req.ip}`);
````

* Logs the incoming update request for traceability, including the ticket ID and IP address.

---

### 2. **Validate Ticket ID Format**

```js
if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
  throw new Error('Invalid ticket ID');
}
```

* Ensures the ticket ID from the URL is a valid MongoDB ObjectId.
* Prevents malformed or potentially malicious requests from proceeding.

---

### 3. **Validate Request Content Type**

```js
if (!req.is('application/json')) {
  throw new Error('Content-Type must be application/json');
}
```

* Ensures the request body is in JSON format.
* This is important to avoid issues with parsing or handling other formats like `form-data` or `text/plain`.

---

### 4. **Execute the Ticket Update**

```js
const result = await updateTicket(
  req.params.id,
  req.user._id,
  req.body.updates
);
```

* Calls the `updateTicket` service or helper function with:

  * `ticketId`: from the request URL
  * `userId`: the authenticated user performing the update
  * `updates`: the fields and values to change
* The update logic is expected to include permission checks and database interaction.

---

### 5. **Create Audit Log Entry**

```js
await AuditLog.createLog({
  action: 'ticket_update',
  event: 'update_ticket',
  source: 'moderator',
  targetId: req.params.id,
  performedBy: req.user._id,
  ip: req.ip,
  userAgent: req.get('User-Agent'),
  details: {
    updates: req.body.updates
  }
});
```

* Records a detailed audit trail for the operation.
* Captures who performed the action (`performedBy`), what was changed (`details.updates`), and metadata like IP and user-agent.
* This is crucial for security, moderation history, and compliance.

---

### 6. **Respond to the Client**

```js
res.status(200).json({
  message: 'Ticket updated successfully',
  ticketId: req.params.id,
  updatedFields: Object.keys(req.body.updates),
  timestamp: new Date().toISOString()
});
```

* Returns a success message, the ticket ID, a list of updated fields, and a timestamp.
* Offers clear feedback to the frontend or API consumer.

---

### 7. **Handle Errors Gracefully**

```js
this.handleError(res, error);
```

* Uses a shared error-handling method to format and send error responses.
* Ensures consistent handling of exceptions, including logging and status codes.

---

## ✅ Requirements for Use

* The `req.user` object must be present (i.e., route must be protected by authentication middleware).
* `updateTicket` and `AuditLog.createLog` must be correctly implemented and imported.
* Only valid ObjectId-format ticket IDs and JSON payloads will be accepted.

---

## 📎 Example Payload

**PATCH /ticket/\:id**

```json
{
  "updates": {
    "status": "resolved",
    "assignedTo": "moderator123"
  }
}
```

---

## 📦 Summary

The `updateTicket` method is a secure, auditable, and cleanly structured controller function for modifying tickets. It prevents bad input, logs all actions, and responds with useful metadata for consumers and developers alike.
