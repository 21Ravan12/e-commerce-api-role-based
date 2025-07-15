# restoreVersion.md

This function `restoreVersion` handles the restoration of a specific version of an article in a knowledge base system. It performs authorization, validation, restoration, auditing, and response formatting.

---

## Function: `restoreVersion(req, res)`

### Purpose
- To allow privileged users (moderators or admins) to restore an older version of an article.
- Ensures accountability by logging the action in an audit log.
- Responds with success or error accordingly.

### Detailed Steps

1. **Logging the Request**
   - Logs the incoming request details including:
     - Article ID (`req.params.id`)
     - Version to restore (`req.params.version`)
     - Requesting user IP (`req.ip`)
   - Uses a logger service (`logger.info`) to track restore attempts.

2. **Authorization Check**
   - Checks if the requesting user's role is either `'moderator'` or `'admin'`.
   - If not authorized, throws an error with HTTP status 403 (Forbidden).

3. **Validation of Article ID**
   - Uses `mongoose.Types.ObjectId.isValid` to verify if the article ID is a valid MongoDB ObjectId.
   - Throws an error if invalid.

4. **Restore Operation**
   - Extracts an optional `reason` from the request body.
   - Calls an external `restoreVersion` service/function passing:
     - Article ID
     - Version number to restore
     - The ID of the user performing the restore
     - Reason for restoration (defaults to `'Version restored by moderator'` if none provided)
   - Waits for the result which contains the updated article info including the new current version.

5. **Audit Logging**
   - Creates an audit log entry recording:
     - Action type (`knowledge_base_restore_version`)
     - Target model (`Article`)
     - Event (`restore_version`)
     - Source of action (`moderator`)
     - Target article ID
     - Performer user ID
     - Request IP and user-agent for traceability
     - Additional details: restored version, reason, and the new article version number

6. **Response**
   - Sends HTTP 200 OK status with a JSON payload including:
     - Success message
     - Article ID
     - Restored version number
     - Current article version after restore
     - Timestamp of the operation in ISO format

7. **Error Handling**
   - Catches any error thrown in the process.
   - Passes the error to a `handleError` method which formats and sends an appropriate error response.

---

## Summary
This method is a secure, auditable way for moderators/admins to revert articles to prior versions, ensuring system integrity and traceability of changes.

## 📥 Request Body Example (JSON)

```json
{
  "reason": "Reverted due to incorrect information in newer version"
}
