# addComment.md

This function handles adding a comment to a support ticket, ensuring data validation, logging, and audit trail creation.

---

## Method: `addComment(req, res)`

### Purpose
Adds a new comment to a ticket identified by `req.params.id` and responds with success or error.

---

### Detailed Explanation

1. **Logging the request**  
   Logs the attempt to add a comment with ticket ID and requester IP for monitoring:
   ```js
   logger.info(`Add comment to ticket ID: ${req.params.id} from IP: ${req.ip}`);

2. **Validate Ticket ID**
   Checks if `req.params.id` is a valid MongoDB ObjectId to prevent invalid queries:

   ```js
   if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
     throw new Error('Invalid ticket ID');
   }
   ```

3. **Content-Type Enforcement**
   Ensures that the request Content-Type is `application/json`, which is required for correct parsing:

   ```js
   if (!req.is('application/json')) {
     throw new Error('Content-Type must be application/json');
   }
   ```

4. **Extract and Validate Input**
   Extracts `text` (comment content) and optional `isInternal` flag from request body. Throws error if `text` is missing:

   ```js
   const { text, isInternal = false } = req.body;
   if (!text) {
     throw new Error('Comment text is required');
   }
   ```

5. **Add Comment to Database**
   Calls an async `addComment` function (not shown here) passing the ticket ID, user ID (`req.user._id`), comment text, and internal flag. This saves the comment:

   ```js
   const comment = await addComment(req.params.id, req.user._id, text, isInternal);
   ```

6. **Audit Logging**
   Creates a detailed audit log entry recording:

   * The action (`ticket_add_comment`)
   * Event type
   * Request source (`web`)
   * Target model and ID (ticket)
   * User performing the action
   * Client IP and user agent
   * Details including the new comment ID and whether it's internal

   ```js
   await AuditLog.createLog({
     action: 'ticket_add_comment',
     event: 'comment_ticket_add',
     source: 'web',
     targetModel: 'Ticket',
     targetId: req.params.id,
     performedBy: req.user._id,
     ip: req.ip,
     userAgent: req.get('User-Agent'),
     details: {
       commentId: comment._id,
       isInternal
     }
   });
   ```

7. **Success Response**
   Sends a JSON response with HTTP status 201 (Created), including a success message, the new comment ID, and a timestamp:

   ```js
   res.status(201).json({
     message: 'Comment added successfully',
     commentId: comment._id,
     timestamp: new Date().toISOString()
   });
   ```

8. **Error Handling**
   Catches any thrown errors during the process and passes them to a centralized error handler method `this.handleError(res, error)` which formats and sends error responses.

---

### Summary

This method carefully validates input, records audit trails for accountability, and ensures the comment addition is both secure and traceable while providing clear client feedback.


## 📥 Request Body Example (JSON)

When adding a comment to a ticket, the request body must be sent as `application/json` and include the following fields:

```json
{
  "text": "We're currently investigating the issue. Updates will follow shortly.",
  "isInternal": false
}
````

### Fields:

* `text` *(string, required)*: The content of the comment. Must not be empty.
* `isInternal` *(boolean, optional)*: If set to `true`, the comment is visible only to internal staff. Defaults to `false` if omitted.
