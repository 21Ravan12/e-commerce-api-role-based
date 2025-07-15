# deleteTicket.md

This file explains the logic of the `deleteTicket` method, which handles **secure deletion of a support or issue ticket**. It includes validation, audit logging, and structured response handling. This method is part of a controller and likely exposed via a route like `DELETE /tickets/:id`.

---

## 🔧 Function: `deleteTicket(req, res)`

### ✅ Step-by-step breakdown:

---

### 1. **Log the Incoming Request**
```js
logger.info(`Delete ticket request for ID: ${req.params.id} from IP: ${req.ip}`);
````

* Logs the deletion attempt with the ticket ID and requestor’s IP address for traceability.

---

### 2. **Validate Ticket ID**

```js
if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
  throw new Error('Invalid ticket ID');
}
```

* Ensures the `ticket ID` is a valid MongoDB ObjectId.
* If not, throws an error to prevent invalid database queries.

---

### 3. **Perform Deletion**

```js
const result = await deleteTicket(req.params.id, req.user._id);
```

* Calls a service or data access function `deleteTicket()` with:

  * The ticket ID to delete.
  * The ID of the authenticated user (`req.user._id`) to verify ownership or permissions.

---

### 4. **Log the Action (Audit Trail)**

```js
await AuditLog.createLog({ ... });
```

* Creates an entry in the audit log for monitoring and compliance.
* Fields include:

  * `action`: Type of action (`ticket_delete`)
  * `event`: Event key (`delete_ticket`)
  * `source`: Actor role (e.g., `moderator`)
  * `targetId`: ID of the deleted ticket
  * `performedBy`: User who initiated the deletion
  * `ip` and `userAgent`: For forensic tracing
  * `details.reason`: Optional reason provided in `req.body.reason` or fallback to default.

---

### 5. **Send Success Response**

```js
res.status(200).json({
  message: 'Ticket deleted successfully',
  ticketId: req.params.id,
  timestamp: new Date().toISOString()
});
```

* Sends a JSON response with:

  * A success message
  * The deleted ticket ID
  * Current timestamp in ISO format

---

### 6. **Handle Errors**

```js
this.handleError(res, error);
```

* Any error is passed to a centralized error handler (`this.handleError`) which:

  * Sends an appropriate HTTP error status
  * Logs the issue if needed
  * Keeps response formatting consistent

---

## 🧾 Summary

The `deleteTicket` function performs:

* ✅ Validation of input
* ✅ Authenticated deletion
* ✅ Action logging for security/compliance
* ✅ Clean success/error response

## 📥 Request Body Example (JSON)
```json
{
  "reason": "Spam content violation"
}
