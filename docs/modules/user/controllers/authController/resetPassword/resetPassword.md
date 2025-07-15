# resetPassword.md

This function implements the **password reset process** for users who have requested to update their password via a reset token. It performs rigorous validation, security checks, and logs key events.

---

## Workflow Breakdown

### 1. Logging and Content-Type Validation
- Logs the reset attempt with the request IP.
- Ensures the request `Content-Type` is `application/json`; otherwise throws an error.

### 2. Input Validation
- Uses `newPasswordSchema` to validate the body containing:
  - `newPassword`: The new password to set.
  - `resetToken`: The unique token previously issued for password reset.
- Rejects invalid or missing inputs with detailed validation error messages.

### 3. XSS Cleaning and Trimming
- Sanitizes and trims both `newPassword` and `resetToken` to prevent XSS attacks and unwanted whitespace.

### 4. Rate Limiting by IP
- Uses Redis to count password reset attempts from the requesting IP.
- If attempts exceed 50 within 5 minutes, blocks further attempts for 1 hour.
- This prevents abuse or brute-force attacks on the reset endpoint.

### 5. Reset Token Verification
- Fetches reset token data from Redis using the cleaned token.
- Checks token existence and expiration timestamp.
- Deletes expired tokens immediately.

### 6. Reset Session Verification
- Retrieves reset session data linked to the token’s `challenge` key.
- Validates that the IP that initiated the reset matches the current request IP.
- Logs a warning and rejects if IPs differ, preventing token theft misuse.

### 7. User Lookup and Status Check
- Finds the user by ID embedded in the token data, retrieving password and MFA status.
- Rejects the request if user is inactive or not found, deleting the token to prevent reuse.

### 8. Password Update
- Calls a secure `User.changePassword` method with:
  - User ID
  - New sanitized password
  - Request IP and User-Agent for audit
- Expects an object including the timestamp of password change.

### 9. Cleanup of Redis Keys
- Removes all related keys from Redis:
  - The reset token
  - The reset session challenge
  - Any login block for this user
  - The IP attempt counter

### 10. Audit Logging
- Records a detailed audit log event `PASSWORD_RESET_SUCCESS` with:
  - User ID and email hash
  - IP and user-agent headers
  - Risk score from a helper function
  - Reset method and device fingerprint from session data

### 11. Security Notification
- Attempts to send a notification email to the user about the password change.
- Catches and logs errors but does not block the response.

### 12. Response to Client
- Sets secure HTTP headers (`X-Content-Type-Options`, `X-Frame-Options`).
- Responds with status 200 and a JSON confirming success.
- Includes metadata indicating sessions invalidated and timestamp of password change.

---

## Error Handling
- Catches all errors, logs details including stack traces.
- Maps errors to appropriate HTTP status codes:
  - 415 for content type errors
  - 400 for validation or missing data
  - 429 for rate limiting
  - 401 for invalid/expired tokens (with no retry allowed)
  - 403 for security verification failures
  - 404 if user not found or inactive
  - 500 for unexpected server errors
- Returns JSON error response with messages and optional retry information.

---

## Security Considerations
- Sanitizes all inputs against XSS.
- Enforces strict rate limiting to prevent brute force.
- Validates that reset token requests originate from the same IP that requested the reset.
- Uses Redis as a fast ephemeral store for token/session state.
- Logs all critical steps and failures for forensic analysis.
- Sends user notification on password change to alert of potential unauthorized access.

---

## 📥 Request Body Example (JSON)

```json
{
  "newPassword": "StrongP@ssw0rd2025!",
  "resetToken": "a1b2c3d4e5f6g7h8i9j0"
}
