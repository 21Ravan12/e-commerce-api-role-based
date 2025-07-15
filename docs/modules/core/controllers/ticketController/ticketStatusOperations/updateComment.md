# updateComment.md

This document explains the logic behind the `updateComment` controller method, which handles **securely updating a user's comment** in the system and logs the action for auditing purposes.

---

## 🔧 Function Overview

```js
async updateComment(req, res) { ... }
````

This is an asynchronous Express route/controller method that:

1. Validates request inputs.
2. Updates a comment in the database.
3. Creates an audit log entry.
4. Sends a response to the client.

---

## 📥 Request Validation

```js
logger.info(`Update comment request for ID: ${req.params.commentId} from IP: ${req.ip}`);
```

* Logs the incoming request with the comment ID and IP for traceability.

```js
if (!mongoose.Types.ObjectId.isValid(req.params.commentId)) {
  throw new Error('Invalid comment ID');
}
```

* Ensures the provided comment ID is a valid MongoDB ObjectId.
* Prevents malformed input or injection attacks.

```js
if (!req.is('application/json')) {
  throw new Error('Content-Type must be application/json');
}
```

* Confirms the request's `Content-Type` is `application/json`.
* Ensures that the API receives data in the expected format.

---

## 💬 Comment Update Logic

```js
const result = await updateComment(
  req.params.commentId,
  req.user._id,
  req.body.content
);
```

* Calls a service method (`updateComment`) to:

  * Verify ownership (via `req.user._id`).
  * Update the content.
* Returns `result` containing `ticketId` and `previousContent`.

---

## 📑 Audit Logging

```js
await AuditLog.createLog({
  action: 'comment_update',
  event: 'update_comment',
  source: 'web',
  targetId: req.params.commentId,
  performedBy: req.user._id,
  ip: req.ip,
  userAgent: req.get('User-Agent'),
  details: {
    ticketId: result.ticketId,
    previousContent: result.previousContent
  }
});
```

* Records the action in an audit log system for security and compliance.
* Captures:

  * User identity (`performedBy`)
  * Target (`targetId`)
  * Metadata (`IP`, `User-Agent`)
  * Contextual details (`ticketId`, `previousContent`)

---

## 📤 Successful Response

```js
res.status(200).json({
  message: 'Comment updated successfully',
  commentId: req.params.commentId,
  ticketId: result.ticketId,
  timestamp: new Date().toISOString()
});
```

* Sends a 200 OK with:

  * Confirmation message
  * Comment and ticket IDs
  * A UTC timestamp

---

## ❌ Error Handling

```js
catch (error) {
  this.handleError(res, error);
}
```

* Catches and passes errors to a centralized handler (`this.handleError`).
* Prevents the app from crashing and returns consistent error responses.

---

## ✅ Summary

This controller method is designed with:

* **Strict validation** (ID format, content type)
* **Ownership enforcement** via `req.user._id`
* **Comprehensive audit logging** for traceability
* **Secure update mechanism** via service abstraction
* **Clear, timestamped client response**


## 📥 Request Body Example (JSON)

```json
{
  "content": "Updated comment text goes here."
}
