# disableTwoFactor.md

This function handles the **disabling of two-factor authentication (2FA)** for an authenticated user via an API endpoint.

---

## Function: `disableTwoFactor(req, res)`

### Purpose
- Disables 2FA for the currently authenticated user.
- Updates the user record to mark 2FA as disabled.
- Logs this sensitive security event for auditing.
- Returns a success or error response accordingly.

### Step-by-Step Explanation

1. **Extract User ID**  
   Retrieves the user ID from the authenticated request (`req.user._id`), ensuring the action applies to the correct user.

2. **Prepare Update Data**  
   Constructs an update object that sets `twoFactor.enabled` to `false`, effectively disabling 2FA.

3. **Update User Record**  
   Calls `User.updateSensitiveUser(userId, data)` to persist the 2FA disabling in the database securely.

4. **Audit Logging**  
   Records the event with `AuditLog.createLog()` including:  
   - Event type: `'2FA_DISABLED'`  
   - User performing the action  
   - Source: `'api'`  
   - Status: `'success'`  
   - IP address and truncated User-Agent string from the request headers  
   - Additional metadata such as device fingerprint and geolocation from custom headers  
   This ensures traceability of critical security changes.

5. **Response Handling**  
   Sends HTTP 200 status with a JSON message confirming the successful disabling of 2FA.

6. **Error Handling**  
   Catches any errors during the process, logs them using a `logger` service, and responds with HTTP 500 and an error message.

---

### Summary
This API method provides a **secure, auditable way for users to disable two-factor authentication** on their account, ensuring both state consistency in the database and transparency via audit logs. Proper error handling and informative responses make it robust for client integration.

## 📥 Request Body Example (JSON)

This endpoint does not require a request body. The two-factor authentication disabling action is performed based on the authenticated user context provided by the access token.

```json
{}
