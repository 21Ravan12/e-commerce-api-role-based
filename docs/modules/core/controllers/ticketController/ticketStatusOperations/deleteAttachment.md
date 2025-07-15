# deleteAttachment.md

This file documents the logic behind the `deleteAttachment` controller method, which handles **secure deletion of attachments** from a knowledge base article. It includes validation, access control, action auditing, and proper error handling.

---

## 📦 Method: `async deleteAttachment(req, res)`

### 🔐 Purpose
Handles a DELETE request to remove a specific attachment from a given article. Only authenticated users (typically moderators or owners) are allowed to perform this action.

---

## 🧩 Step-by-Step Breakdown

### 1. **Log the incoming request**
```js
logger.info(`Delete attachment request for ID: ${req.params.attachmentId} from IP: ${req.ip}`);
````

* Logs who is attempting to delete which attachment and from where (IP address).

---

### 2. **Validate Attachment ID**

```js
if (!mongoose.Types.ObjectId.isValid(req.params.attachmentId)) {
  throw new Error('Invalid attachment ID');
}
```

* Ensures the attachment ID is a valid MongoDB ObjectId to prevent injection or malformed requests.

---

### 3. **Extract Reason**

```js
const { reason } = req.body;
```

* An optional human-readable reason for deletion, sent from the frontend (useful for auditing).

---

### 4. **Delete the Attachment**

```js
const result = await deleteAttachment(
  req.params.articleId,
  req.params.attachmentId,
  req.user._id
);
```

* Calls a service/helper function to:

  * Verify ownership or moderator rights
  * Remove the attachment from storage (e.g., DB or cloud)
  * Return metadata like `fileName` and `_id`.

---

### 5. **Log the Deletion in Audit Logs**

```js
await AuditLog.createLog({
  action: 'knowledge_base_delete_attachment',
  event: 'delete_attachment',
  source: 'moderator',
  targetModel: 'Attachment',
  targetId: req.params.attachmentId,
  performedBy: req.user._id,
  ip: req.ip,
  userAgent: req.get('User-Agent'),
  details: {
    reason: reason,
    fileName: result.fileName
  }
});
```

* Saves a detailed audit record with metadata:

  * Action type (`delete_attachment`)
  * Actor (`performedBy`)
  * Target (`Attachment` model)
  * Reason and file name for traceability
  * IP address and User-Agent for forensic tracking

---

### 6. **Respond to Client**

```js
res.status(200).json({
  message: 'Attachment deleted successfully',
  attachmentId: result._id,
  timestamp: new Date().toISOString()
});
```

* Returns a confirmation response with:

  * Success message
  * ID of the deleted attachment
  * ISO timestamp for frontend logging

---

### 7. **Error Handling**

```js
} catch (error) {
  this.handleError(res, error);
}
```

* All exceptions are caught and passed to a centralized error handler method (likely inherited from a base controller).

---

## ✅ Summary

The `deleteAttachment` method is:

* **Secure**: Validates input and enforces user identity
* **Traceable**: Writes full audit logs with metadata
* **Robust**: Handles user errors and system exceptions gracefully
* **Modular**: Delegates core logic to helper functions (`deleteAttachment`, `AuditLog.createLog`)


## 📥 Request Body Example (JSON)
```json
{
  "reason": "Outdated or incorrect attachment"
}
