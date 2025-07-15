# updateArticle.md

This function `updateArticle` handles updating an existing article in the system with validation, logging, and audit tracking.

---

## Workflow Explanation

1. **Request Logging**  
   Logs the incoming update request with article ID and client IP for monitoring:
   ```js
   logger.info(`Update article request for ID: ${req.params.id} from IP: ${req.ip}`);

2. **Content-Type Validation**
   Ensures the request content is JSON, throwing an error otherwise:

   ```js
   if (!req.is('application/json')) {
       throw new Error('Content-Type must be application/json');
   }
   ```

3. **Article ID Validation**
   Checks if `req.params.id` is a valid MongoDB ObjectId. If invalid, throws an error to prevent malformed database queries:

   ```js
   if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
       throw new Error('Invalid article ID');
   }
   ```

4. **Extract Update Data**
   Grabs the new article data from the request body:

   ```js
   const updateData = req.body;
   ```

5. **Perform Update**
   Calls an external `updateArticle` service/function with:

   * The article ID,
   * The update data augmented with `lastModifiedBy` set to the current user's ID,
   * The current user's ID (likely for permission or auditing inside the update function).
     The result contains success status and potentially the updated article ID.

   ```js
   const result = await updateArticle(
       req.params.id,
       { ...updateData, lastModifiedBy: req.user._id },
       req.user._id
   );
   ```

6. **Audit Logging**
   Creates an audit log entry recording the update action with detailed metadata:

   * Action type and event name,
   * Source of action (here, ‘moderator’),
   * Target model and ID,
   * The user performing the action,
   * Client IP and User-Agent for traceability,
   * Details of which fields were updated.

   ```js
   await AuditLog.createLog({
       action: 'knowledge_base_update_article',
       event: 'update_article',
       source: 'moderator',
       targetModel: 'Article',
       targetId: req.params.id,
       performedBy: req.user._id,
       ip: req.ip,
       userAgent: req.get('User-Agent'),
       details: { updatedFields: Object.keys(updateData) }
   });
   ```

7. **Response to Client**
   Sends back a JSON response with:

   * A success or failure message,
   * The article ID,
   * A timestamp of the update operation.
     HTTP status is 200 if no error occurred.

   ```js
   res.status(200).json({
       message: result.success == true ? 'Article updated successfully' : 'Article update failed: '+ result.error,
       articleId: result._id,
       timestamp: new Date().toISOString()
   });
   ```

8. **Error Handling**
   If any step throws an error, it is caught and delegated to a shared error handler method `handleError` which manages error response formatting and logging.

---

## Summary

* Validates incoming request type and article ID format.
* Updates the article with the user as the modifier.
* Logs the operation both in application logs and audit logs for security and traceability.
* Provides clear feedback to the client about success or failure.

## 📥 Request Body Example (JSON)

This endpoint accepts a JSON object containing the fields to update in the article. Only the fields provided will be modified. All requests must include the `Content-Type: application/json` header.

```json
{
  "title": "Understanding Async/Await in JavaScript",
  "content": "This article explains how async/await works with practical examples.",
  "tags": ["javascript", "async", "programming"],
  "category": "web-development",
  "isPublished": true
}
