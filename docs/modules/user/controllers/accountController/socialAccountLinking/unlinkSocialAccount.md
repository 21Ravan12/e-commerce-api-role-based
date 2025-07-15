# unlinkSocialAccount.md

This function handles the unlinking of a social media account from the authenticated user's profile.

---

## Function: `unlinkSocialAccount(req, res)`

### Purpose
- Removes the association between the user's account and a specified social login provider (e.g., Google, Facebook).
- Ensures audit logging for both success and failure cases for security and traceability.

### Workflow

1. **Extract User and Provider Info**  
   - Retrieves the authenticated user's ID from `req.user._id`.
   - Extracts the `provider` (social platform identifier) from the request body.

2. **Call Model Method**  
   - Invokes the static model method `User.unlinkSocialAccount(userId, provider, metadata)` to perform unlinking logic in the database.
   - Passes metadata such as IP address, truncated User-Agent header, device fingerprint, and geo-location from request headers for audit and security purposes.

3. **Audit Logging (Success)**  
   - Creates an audit log entry using `AuditLog.createLog()` recording:
     - Event name: `'SOCIAL_ACCOUNT_UNLINKED'`
     - User ID, action type, source (`'api'`), and success status.
     - Request metadata including IP, User-Agent, and provider info.
     - Additional metadata returned by the unlink operation.

4. **Response**  
   - Sends a JSON response with HTTP status `200` and a success message.

5. **Error Handling**  
   - Logs the error with a detailed message.
   - Creates a failure audit log entry with error details and stack trace (in development).
   - Responds with HTTP status `500` and an error message JSON.

---

## Important Notes

- **Security & Traceability:** Audit logs track all unlink attempts with relevant context to monitor suspicious activities.
- **Request Metadata:** Collecting device fingerprint and geo-location aids in detecting unauthorized unlink attempts.
- **Error Transparency:** Detailed error messages help frontend handle failures gracefully, while logging ensures backend visibility.

---

## 📥 Request Body Example (JSON)
```json
{
  "provider": "facebook"
}
