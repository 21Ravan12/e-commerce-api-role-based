# deleteAttachment.md

This function, `deleteAttachment`, handles HTTP requests to delete an attachment associated with an article. It performs validation, deletion, logging, and returns a success response or error.

---

## Function Overview

### `async deleteAttachment(req, res)`

- **Purpose:** Deletes an attachment by its ID, logs the deletion action, and responds to the client.
- **Context:** Intended for authenticated users (e.g., moderators) with necessary permissions.

---

## Step-by-Step Explanation

1. **Logging Request Start**  
   Logs the incoming delete request with the attachment ID and requester IP for audit trail purposes:  
   ```js
   logger.info(`Delete attachment request for ID: ${req.params.attachmentId} from IP: ${req.ip}`);

2. **Validate Attachment ID**
   Uses `mongoose.Types.ObjectId.isValid` to ensure the `attachmentId` parameter is a valid MongoDB ObjectId. Throws an error if invalid to prevent malformed queries.

3. **Extract Deletion Reason**
   Reads the optional `reason` from the request body to document why the attachment is deleted.

4. **Perform Deletion**
   Calls an external service or model method `deleteAttachment(articleId, attachmentId, userId)` which handles the actual deletion logic, likely removing the attachment record and its files.

5. **Audit Logging**
   Creates a detailed audit log entry recording:

   * The action and event identifiers
   * Source as 'moderator' to identify who performed the action
   * The target model (`Attachment`) and target ID
   * The user performing the deletion (`req.user._id`)
   * IP address and user agent for additional context
   * Extra details including the deletion reason and the deleted file name

6. **Success Response**
   Sends a JSON response with HTTP status 200 indicating:

   * Confirmation message
   * The deleted attachment's ID
   * Current timestamp in ISO format

7. **Error Handling**
   If any step throws an error (e.g., invalid ID, deletion failure), it is caught and passed to a generic error handler method `this.handleError` that formats and sends error responses.

---

## Summary

This function provides a **secure and auditable endpoint** for deleting attachments. It validates inputs, performs the deletion, logs the action comprehensively for accountability, and informs the client of success or failure in a structured manner.

## 📥 Request Body Example (JSON)

```json
{
  "reason": "The attachment was outdated and no longer relevant."
}
