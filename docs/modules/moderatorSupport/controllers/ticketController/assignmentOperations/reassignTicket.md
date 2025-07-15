# reassignTicket.md

This document explains the functionality and flow of the `reassignTicket` method. This method is responsible for reassigning a support or task-related ticket from one user (typically a support agent or moderator) to another within the system.

---

## 📥 Endpoint Purpose
The method is typically triggered via an HTTP request to change the current assignee of a ticket. It's an administrative/moderator-level action that ensures workload distribution or escalation management.

---

## 🔄 Function Overview

### `async reassignTicket(req, res)`
Handles reassignment of a ticket to a new user. It performs validation, triggers reassignment logic, logs the action, and sends a response.

---

## 🔐 Input Validation

```js
if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
````

* Ensures the provided ticket ID in the URL (`req.params.id`) is a valid MongoDB ObjectId.
* Throws error if invalid.

```js
if (!mongoose.Types.ObjectId.isValid(req.body.newAssigneeId)) {
```

* Validates the `newAssigneeId` in the request body.
* Prevents malformed data from proceeding.

---

## 🔧 Business Logic

```js
const result = await reassignTicket(
  req.params.id,
  req.body.newAssigneeId,
  req.user._id
);
```

* Calls a helper or service method `reassignTicket`, passing:

  * Ticket ID
  * New assignee's user ID
  * Current user ID (initiator of reassignment)
* The method is assumed to update the database and return information about the ticket, especially the previous assignee.

---

## 🧾 Audit Logging

```js
await AuditLog.createLog({ ... });
```

Creates a structured audit log entry for accountability and traceability. Includes:

* `action`: type of activity (`ticket_reassign`)
* `event`: semantic event label
* `source`: who performed the action (`moderator`)
* `targetId`: ID of the ticket being reassigned
* `performedBy`: ID of the user who initiated the action
* `ip`: IP address of the requester
* `userAgent`: user-agent string from the request header
* `details`: extra context — previous and new assignee IDs

This enables admins to track reassignments and investigate changes if needed.

---

## ✅ Response

```js
res.status(200).json({ ... });
```

* Returns a JSON response with:

  * Success message
  * Affected ticket ID
  * New assignee's ID
  * Current timestamp

---

## ⚠️ Error Handling

```js
catch (error) {
  this.handleError(res, error);
}
```

Delegates error response formatting and logging to a centralized `handleError` method, ensuring consistency and clean error propagation.

---

## 📦 Summary

The `reassignTicket` method is a well-structured handler that:

* Validates inputs to prevent malformed requests.
* Delegates business logic to a reusable service function.
* Logs all sensitive actions in a detailed audit trail.
* Returns a clean and informative response to the client.
* Is robust against errors via central error handling.

## 📥 Request Body Example (JSON)

```json
{
  "newAssigneeId": "60d5ec49f9d8c826d8f0a123"
}
