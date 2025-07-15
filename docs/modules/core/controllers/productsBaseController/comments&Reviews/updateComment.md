# updateComment.md

This function handles the logic for **updating an existing comment** on a product review. It's part of a controller (likely for products or reviews) and is designed to ensure secure, auditable, and validated comment updates.

---

## 🔁 Function: `updateComment(req, res)`

### ✅ Step-by-step Breakdown:

1. **Logging the Request**
   ```js
   logger.info(`Update comment request for ID: ${req.params.reviewId} from IP: ${req.ip}`);

* Logs incoming update requests with the comment ID (`reviewId`) and the requester's IP.
* Useful for audit trails and debugging.

2. **Extracting Input**

   ```js
   const { commentText } = req.body;
   const commentId = req.params.reviewId;
   const user = req.user;
   ```

   * Retrieves the new comment content (`commentText`) from the request body.
   * Gets the `reviewId` (used here as `commentId`) from the URL.
   * Pulls the authenticated user from the `req.user` object (requires prior authentication middleware).

3. **Input Validation**

   ```js
   if (!commentText || commentText.trim().length === 0) {
     throw new Error('Comment text cannot be empty');
   }
   ```

   * Ensures the comment is not blank or just whitespace.
   * Responds with a `400 Bad Request` if invalid.

4. **Database Update Operation**

   ```js
   const comment = await Product.updateComment(commentId, user._id, {
     commentText,
     user: user._id
   });
   ```

   * Calls a model method (`Product.updateComment`) to update the comment.
   * Ensures the comment is updated by its ID and **by the same user who created it** (authorization enforcement).
   * The updated comment is returned and stored in the `comment` variable.

5. **Audit Logging**

   ```js
   await AuditLog.createLog({
     event: 'comment_updated',
     ip: req.ip,
     action: 'update',
     entity: 'comment',
     entityId: comment._id,
     userId: user._id,
     userIp: req.ip,
     userAgent: req.get('User-Agent'),
     metadata: { commentText }
   });
   ```

   * Creates a detailed audit log entry for security and traceability.
   * Tracks: who updated what, from where, and with what content.
   * Includes the `User-Agent` string to trace device/browser type.

6. **Success Response**

   ```js
   res.status(200).json(comment);
   ```

   * Sends the updated comment back to the client with `200 OK`.

---

## ❌ Error Handling

### Catch Block

```js
catch (error) {
  logger.error(`Update comment error: ${error.message}`, { stack: error.stack });
  ...
}
```

* Logs full error details including stack trace.
* Dynamically determines response status:

  * `400` if text is empty,
  * `403` if unauthorized update attempt (user mismatch),
  * `404` if comment not found,
  * `500` for unexpected server issues.

### Response:

```js
res.status(statusCode).json({ error: error.message });
```

* Returns a clear error message with appropriate status code to the client.

---

## 🛡️ Security & Best Practices

* ✔ Ensures only authenticated users can update their own comments.
* ✔ Validates user input to prevent empty or malicious content.
* ✔ Tracks every change with an audit log (ideal for admin review or moderation).
* ✔ Applies dynamic, meaningful status codes for better API UX.

---

## 🧩 Dependencies

* `Product.updateComment`: Custom model method to update a comment based on ID and user ID.
* `AuditLog.createLog`: Custom logging system for audit trails.
* `logger`: Application-wide logging utility.


## 📥 Request Body Example (JSON)
```json
{
  "commentText": "Updated comment text goes here."
}
