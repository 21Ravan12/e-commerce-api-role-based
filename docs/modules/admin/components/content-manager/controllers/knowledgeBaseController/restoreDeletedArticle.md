# restoreDeletedArticle.md

This function `restoreDeletedArticle` handles the restoration of a previously deleted article, including audit logging, input validation, and error handling.

---

## Flow Explanation

1. **Audit Log Initialization**  
   - Creates a timed admin audit log entry at the start using `AuditLog.createTimedAdminLog`.  
   - Logs details such as action type (`restore_deleted_article`), target model (`Article`), target ID (`req.params.id`), user info (`req.user`), IP, user agent, and a restoration reason (defaulting to 'Not specified' if missing).  
   - Returns two helpers: `logEntry` (for initial log) and `complete` (to finalize the log later).

2. **Logging Request Receipt**  
   - Logs an info message with the article ID and requester IP.

3. **Input Validation**  
   - Validates the article ID using `mongoose.Types.ObjectId.isValid`.  
   - If invalid, completes the audit log with a failed status and validation error details, then returns a 400 Bad Request response with an error message.

4. **Article Restoration Logic**  
   - Calls the service function `restoreDeletedArticle` passing:  
     - The article ID from route params  
     - The user ID of the admin performing the action  
     - A restoration reason (fallback to 'Article restoration by admin' if none provided)  
   - Awaits the result containing the restored article data.

5. **Completing Audit Log on Success**  
   - Marks the audit log as `success`, adding details including restored article info, restoration reason, and a flag that additional logs were created.

6. **Response to Client on Success**  
   - Sends a 200 OK JSON response containing:  
     - `success: true`  
     - A confirmation message  
     - Restored article's ID, title, and status  
     - A timestamp of the response

7. **Error Handling**  
   - In the `catch` block, completes the audit log marking it as `failed`, including error message, stack trace (in development), error type, and optional error code.  
   - Logs the error with `logger.error`.  
   - Sends a JSON error response with an appropriate HTTP status code (default 500), error message, and in development mode includes system error and stack trace for debugging.

---

## Summary

- The function ensures **secure, auditable, and validated restoration** of deleted articles by administrators.
- It provides **clear success/error feedback** to the client.
- It integrates **robust logging** for both audit trail and debugging purposes.
- Input and system errors are gracefully handled with detailed context.

---

## 📥 Request Body Example (JSON)

```json
{
  "reason": "Restoring article after mistaken deletion"
}
````

* **`reason`** (optional, `string`): A short explanation for why the article is being restored.

  * If omitted, it defaults to `"Article restoration by admin"` in the system logs.
  * Used in audit trails for transparency and accountability.
