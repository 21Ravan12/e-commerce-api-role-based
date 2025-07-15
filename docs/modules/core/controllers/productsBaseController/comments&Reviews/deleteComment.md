# deleteComment.md

This file documents the logic and flow of the `deleteComment` controller method, which handles the deletion of a user’s product review or comment. It includes **authorization**, **audit logging**, and **error handling** to ensure secure and traceable operations.

---

## 🔁 Function Signature
```js
async deleteComment(req, res)
````

An asynchronous Express.js route handler function that deletes a comment (review) associated with a product.

---

## 🧩 Breakdown of Logic

### 1. **Logging Request Info**

```js
logger.info(`Delete comment request for ID: ${req.params.reviewId} from IP: ${req.ip}`);
```

Logs the request, including:

* The comment ID (`reviewId` from route parameter)
* The client's IP address (`req.ip`)
  This helps in tracking deletion requests for security/auditing.

---

### 2. **Extracting User and Comment Info**

```js
const user = req.user;
const commentId = req.params.reviewId;
```

* `req.user`: The currently authenticated user (populated by middleware).
* `commentId`: The ID of the comment to delete.

---

### 3. **Delete Operation**

```js
const comment = await Product.deleteComment(commentId, user._id);
```

* Invokes a custom `Product.deleteComment()` method (likely checks ownership and performs soft/hard delete).
* Passes the `user._id` to ensure the user is authorized to delete their own comment.
* Throws an error if not authorized or comment not found.

---

### 4. **Audit Logging**

```js
await AuditLog.createLog({ ... });
```

Records an audit trail of the deletion for compliance and traceability:

* `event`: `'comment_deleted'`
* `action`: `'delete'`
* `entity`: `'comment'`
* `entityId`: The deleted comment’s ID
* Includes metadata: `userId`, `userIp`, and `User-Agent`

This log is important for monitoring destructive actions.

---

### 5. **Response**

```js
res.status(200).json(comment);
```

If successful, responds with HTTP `200 OK` and returns the deleted comment (or some representation of it).

---

## ❌ Error Handling

### Catch Block

```js
logger.error(`Delete comment error: ${error.message}`, { stack: error.stack });
```

Logs the error message and stack trace.

### Conditional Response Codes

```js
const statusCode = error.message.includes('not authorized') ? 403 :
                   error.message.includes('not found') ? 404 : 500;
```

* `403 Forbidden`: User is not authorized to delete the comment.
* `404 Not Found`: Comment does not exist.
* `500 Internal Server Error`: Any other failure.

Returns appropriate JSON error message.

---

## 🛡️ Security Considerations

* Requires `req.user`: Assumes authentication middleware has validated the user.
* Prevents unauthorized deletions by passing `user._id` to deletion logic.
* Logs all sensitive operations via `AuditLog`.

---

## ✅ Summary

This method ensures that:

* Only authorized users can delete their comments.
* All deletions are logged for auditing.
* Proper HTTP status codes and errors are returned to the client.
* Server-side logging is detailed for both normal and exceptional flows.


## 📥 Request Body Example (JSON)

```json
{}
```
