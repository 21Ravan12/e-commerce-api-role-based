# getAttachments.md

This method handles retrieving **attachments** related to a specific **knowledge base article**. It is part of a controller class (likely for admin or support tools) and follows best practices in validation, logging, and error handling.

---

## 📥 Method: `getAttachments(req, res)`

### 🔹 Purpose
Fetches and returns all attachments associated with a given article ID, logs the operation for auditing, and ensures request validity and traceability.

---

## 🔧 Steps Explained

### 1. **Logging Incoming Request**
```js
logger.info(`Get attachments request for article ID: ${req.params.id} from IP: ${req.ip}`);
````

Logs the request details — specifically, the **article ID** and the **IP address** of the requester. This helps with tracing and debugging access patterns.

---

### 2. **Input Validation**

```js
if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
  throw new Error('Invalid article ID');
}
```

Validates that the provided `article ID` is a valid MongoDB ObjectId. Prevents malformed or potentially malicious input from proceeding.

---

### 3. **Retrieve Attachments**

```js
const attachments = await getAttachments(req.params.id);
```

Fetches the attachments from the database or a service using the provided article ID. The `getAttachments` function is assumed to be imported elsewhere and handles the DB logic.

---

### 4. **Audit Logging**

```js
await AuditLog.createLog({
  action: 'knowledge_base_get_attachments',
  event: 'get_attachments',
  source: 'web',
  targetId: req.params.id,
  performedBy: req.user?._id,
  ip: req.ip,
  userAgent: req.get('User-Agent'),
  details: {
    attachmentsCount: attachments.length
  }
});
```

Logs the access event to an **audit trail**, which is critical for security and compliance. It records:

* The type of action and event
* Where it came from (`web`)
* Who did it (`performedBy`)
* Context like IP, user agent, and number of attachments returned

---

### 5. **Response to Client**

```js
res.status(200).json({
  articleId: req.params.id,
  attachments,
  timestamp: new Date().toISOString()
});
```

Returns a structured JSON response with:

* The article ID
* List of attachments
* Timestamp for response generation

---

### 6. **Error Handling**

```js
this.handleError(res, error);
```

If an error is thrown at any step, it is passed to a **centralized error handler** (`handleError`), promoting cleaner code and consistent error responses.

---

## ✅ Summary

* Ensures valid input via ObjectId check
* Retrieves article attachments securely
* Maintains audit logs with rich metadata
* Returns structured and timestamped JSON response
* Applies centralized error handling for resilience and maintainability


## 📥 Request Body Example (JSON)

This endpoint does **not require a request body**.
All necessary data is passed via the **URL parameter**:
- `:id` → The ID of the article whose attachments you want to retrieve.
✅ Example usage (GET request):
```
GET /api/articles/664fae91b2c4d82f2a9efcc2/attachments
```
📌 Note: The article ID must be a valid MongoDB ObjectId (24-character hex string).
```
