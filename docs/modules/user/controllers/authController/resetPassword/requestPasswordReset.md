# requestPasswordReset.md

This function handles **password reset requests** by validating input, enforcing rate limits, generating reset challenges, sending emails, and logging the event securely.

---

## Workflow Explanation

### 1. **Logging Request Origin**
- Logs the incoming request IP for audit and security monitoring.

### 2. **Content-Type Validation**
- Ensures the request's content type is `application/json`.
- Returns an error if the content type is incorrect.

### 3. **Input Validation**
- Uses `resetPasswordSchema` to validate the request body strictly:
  - Returns all validation errors at once.
  - Strips unknown or extra fields.
- Specifically checks presence and validity of the `email` field.
- Sanitizes the email input with `xss()` to prevent injection attacks and normalizes it.

### 4. **Rate Limiting**
- Uses Redis to limit password reset attempts per email to 200 within a rolling window.
- If limit exceeded, locks the email for 1 hour.
- Otherwise, resets the window every 5 minutes.
- This helps prevent abuse or brute forcing.

### 5. **User Lookup**
- Hashes the sanitized email securely.
- Searches the database for a user matching the hashed email.
- If user not found:
  - Logs the attempt but responds with a generic success message to avoid user enumeration.

### 6. **Account Status Check**
- Verifies that the user account is active (verified).
- Rejects the request if the account is unverified.

### 7. **Challenge & Verification Code Generation**
- Creates a random verification code (16 characters).
- Creates a challenge key (hex string) used to store reset session data.

### 8. **Store Reset Data in Redis**
- Stores an object with user ID, verification code, request IP, user-agent, timestamps, attempts, and device fingerprint.
- Expires after 15 minutes to limit reset window.
- Handles Redis errors by logging and returning a temporary system error.

### 9. **Send Verification Email**
- Attempts to send a reset email with the verification code.
- If email sending fails, deletes the Redis challenge key and returns an error.

### 10. **Audit Logging**
- Records the password reset request event with details:
  - User ID and email
  - IP address and user agent
  - Risk score (calculated from request)
  - Headers for further analysis

### 11. **Response Preparation**
- Sends a safe, generic response message regardless of email existence.
- Includes:
  - A cooldown period of 300 seconds (5 minutes) before another attempt.
  - The challenge token to be used in subsequent reset verification.
  - Security info about token expiry and maximum allowed attempts.

### 12. **Security Headers**
- Sets HTTP headers to prevent MIME sniffing (`X-Content-Type-Options: nosniff`) and clickjacking (`X-Frame-Options: DENY`).

---

## Error Handling

- Catches all exceptions during processing.
- Maps specific error messages to appropriate HTTP status codes:
  - `403` for CSRF or unverified account errors.
  - `415` for incorrect content type.
  - `400` for validation or missing email.
  - `429` for rate limit exceeded.
  - `503` for temporary system errors.
  - `500` for email sending failures.
- Logs detailed error messages and stack traces.

---

## Summary

This function implements a **robust, secure, and user-friendly password reset request flow** by combining:

- Strict input validation and sanitization,
- Abuse prevention through rate limiting,
- Secure, time-limited challenge tokens stored in Redis,
- Email-based verification with failure rollback,
- Comprehensive audit logging,
- Clear and safe client responses with security headers.

## 📥 Request Body Example (JSON)

```json
{
  "email": "user@example.com"
}
