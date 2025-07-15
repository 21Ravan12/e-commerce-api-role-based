# deleteArticle.md

This function handles the **deletion of an article** in a knowledge base system, ensuring validation, logging, and audit tracking.

---

## Function: `deleteArticle(req, res)`

### Purpose
- To delete an article identified by `req.params.id`.
- Only valid MongoDB ObjectIDs are accepted.
- Logs the deletion action for accountability and auditing.

---

### Step-by-step explanation:

1. **Logging the request**  
   Logs an info-level message with the article ID and the requester's IP address for monitoring purposes:
   ```js
   logger.info(`Delete article request for ID: ${req.params.id} from IP: ${req.ip}`);


2. **Validate article ID**
   Uses `mongoose.Types.ObjectId.isValid` to check if the provided ID is a valid MongoDB ObjectId.
   Throws an error if invalid, preventing further processing:

   ```js
   if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
       throw new Error('Invalid article ID');
   }
   ```

3. **Extract deletion reason**
   Reads optional `reason` from the request body, defaulting to `'Deleted by moderator'` if none provided.

4. **Perform deletion**
   Calls an external `deleteArticle` function, passing:

   * Article ID (`req.params.id`)
   * User ID of the requester (`req.user._id`)
   * Deletion reason

   The result contains success status, deleted article’s details (like title), or an error.

5. **Audit Logging**
   Creates an audit log entry recording:

   * Action type (`knowledge_base_delete_article`)
   * Event (`delete_article`)
   * Source (`moderator`)
   * Target model and ID (the article)
   * Who performed the action (`req.user._id`)
   * Request IP and User-Agent
   * Details like reason and article title

   This ensures traceability and accountability.

6. **Send response**
   Responds with HTTP 200 and JSON indicating success or failure message, the article ID, and the current timestamp in ISO format:

   ```js
   res.status(200).json({
       message: result.success == true ? 'Article deleted successfully' : 'Article deletion failed: '+ result.error,
       articleId: result._id,
       timestamp: new Date().toISOString()
   });
   ```

7. **Error handling**
   Any errors thrown are caught in the `catch` block and passed to `this.handleError(res, error)`, a centralized error handler presumably sending an error response.

---

## Summary

This method ensures a secure and auditable way to delete articles, validating input, logging the action for both operational monitoring and compliance via an audit trail, and responding with clear success/failure messages.

## 📥 Request Body Example (JSON)

```json
{
  "reason": "Outdated information and irrelevant content"
}
