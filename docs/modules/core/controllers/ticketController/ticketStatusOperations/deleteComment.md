# deleteComment.md

This function handles the **deletion of a user comment** in a secure, traceable, and validated manner. It is an Express.js controller method typically used in a ticketing or discussion system where users can comment and later delete their own comments.

---

## 🔁 Function: `deleteComment(req, res)`

### 🧱 Overview
- Deletes a comment by its ID if the requesting user is authorized.
- Validates the request and logs both success and failure paths.
- Triggers an audit log for accountability and traceability.

---

## 🔍 Step-by-Step Breakdown

### 1. **Logging Request**
```js
logger.info(`Delete comment request for ID: ${req.params.commentId} from IP: ${req.ip}`);
````

* Records the incoming delete request along with the comment ID and the IP address for traceability and monitoring purposes.

---

### 2. **Validate Comment ID**

```js
if (!mongoose.Types.ObjectId.isValid(req.params.commentId)) {
  throw new Error('Invalid comment ID');
}
```

* Ensures the provided `commentId` is a valid MongoDB ObjectId.
* Prevents malformed or malicious IDs from proceeding to database operations.

---

### 3. **Delete the Comment**

```js
const result = await deleteComment(req.params.commentId, req.user._id);
```

* Calls the business logic function `deleteComment()` (likely defined elsewhere) to remove the comment.
* Passes the comment ID and the current user's ID to enforce **ownership-based deletion**.

---

### 4. **Audit Logging**

```js
await AuditLog.createLog({
  action: 'comment_delete',
  event: 'delete_comment',
  source: 'web',
  targetId: req.params.commentId,
  performedBy: req.user._id,
  ip: req.ip,
  userAgent: req.get('User-Agent'),
  details: {
    ticketId: result.ticketId,
    commentAuthor: result.commentAuthor
  }
});
```

* Logs the deletion as an auditable event with full metadata:

  * **Action/Event**: Identifies the type of operation (`comment_delete`).
  * **Source**: Specifies request origin (e.g., "web").
  * **Actor**: `performedBy` links to the user who made the request.
  * **Context**: Includes IP, user-agent, comment author, and related ticket ID.
* Enables full traceability for admins or compliance teams.

---

### 5. **Response to Client**

```js
res.status(200).json({
  message: 'Comment deleted successfully',
  commentId: req.params.commentId,
  ticketId: result.ticketId,
  timestamp: new Date().toISOString()
});
```

* Responds with HTTP 200 and confirmation payload, which includes:

  * Comment ID
  * Related ticket ID
  * Timestamp for recordkeeping

---

### 6. **Error Handling**

```js
} catch (error) {
  this.handleError(res, error);
}
```

* Uses a centralized error handler to return structured error responses and avoid code duplication.

---

## ✅ Security & Best Practices

* ✅ **Ownership Check**: Only the author (via `req.user._id`) can delete their comment.
* ✅ **Validation**: Ensures comment ID format is legitimate.
* ✅ **Auditing**: Logs who performed the deletion, when, and from where.
* ✅ **Error Safety**: All unexpected issues are caught and handled gracefully.


## 📥 Request Body Example (JSON)

This endpoint does **not** require a request body. All necessary data is passed via the URL parameter (`commentId`) and authenticated user context (`req.user`).

However, ensure the request includes:

- **Authorization Header** with a valid JWT token.
- **URL Parameter**: `commentId` (MongoDB ObjectId format)

### Example:

```

DELETE /api/comments/64b8f2a1c9d4c34b2e9f89a3
Authorization: Bearer \<your\_jwt\_token>

```

✅ No JSON body needed in the request.