# verifyResetCode.md

This function `verifyResetCode` handles the **verification of a password reset code** submitted by the user during the password recovery process. It ensures security, rate limiting, validation, and audit logging.

---

## Flow Breakdown

### 1. **Request Logging & Content-Type Validation**
- Logs the incoming request IP.
- Ensures the request Content-Type is `application/json`. Rejects otherwise with an error.

### 2. **Input Validation**
- Uses `verifyCodeSchema` (likely a Joi or similar schema) to validate the request body.
- Validates presence and correctness of the required fields: `challenge` (a unique reset identifier) and `code` (the verification code).
- Throws a descriptive validation error if the input is invalid.

### 3. **Rate Limiting by IP**
- Tracks the number of verification attempts per IP using Redis key `pwd_verify:<IP>`.
- If attempts exceed 50 within a 5-minute window, it locks out the IP for 1 hour.
- This prevents brute-force or abuse from the same IP.

### 4. **Retrieve Reset Data from Redis**
- Looks up the reset request data stored under the `challenge` key in Redis.
- If no data found or expired, returns an error indicating invalid or expired challenge.

### 5. **Attempt Count Tracking**
- Increments the attempt counter in the reset data.
- If more than 3 attempts are made with the wrong code, deletes the reset data to force the user to request a new reset.
- Protects against unlimited guess attempts on the code.

### 6. **Code Verification**
- Compares the provided code with the stored one (trimmed for safety).
- If invalid, updates Redis to maintain expiration and throws an error.

### 7. **User Lookup and Validation**
- Queries the database for the user by ID stored in reset data.
- Ensures the user exists and their account is active.
- If not, deletes the reset data and throws an error.

### 8. **One-Time Reset Token Generation**
- Generates a cryptographically secure 32-byte hex token to authorize the password change.
- Token expires in 15 minutes.

### 9. **Mark Challenge as Verified**
- Flags the reset challenge as verified and timestamps it.
- Stores updated challenge data back in Redis with the same expiration.

### 10. **Store Reset Token**
- Saves the reset token with associated user ID, challenge, and expiry in Redis with a 15-minute TTL.
- Enables a secure, single-use token for subsequent password reset requests.

### 11. **Audit Logging**
- Records the verification event including:
  - User ID and email
  - IP address and User-Agent
  - Risk score (calculated from the request)
  - Metadata for further analysis
- Helps track security events and detect suspicious activity.

### 12. **Response**
- Sends back a success message with the reset token and metadata:
  - Token expiry time (900 seconds)
  - Single-use flag

- Sets security HTTP headers:
  - `X-Content-Type-Options: nosniff`
  - `X-Frame-Options: DENY`

### 13. **Error Handling**
- Logs error details with stack trace.
- Maps errors to appropriate HTTP status codes:
  - 403 for CSRF or max attempts
  - 415 for invalid Content-Type
  - 400 for missing challenge/code or invalid challenge
  - 429 for rate limit exceeded
  - 401 for invalid verification code
  - 404 if user not found or inactive
- Returns JSON error response with message.

---

## Summary

This function ensures a **secure, rate-limited, and auditable verification step** in the password reset workflow by:

- Validating inputs strictly
- Enforcing attempt limits both per IP and per challenge
- Verifying the reset code against stored values
- Issuing a secure one-time token on success
- Logging all key security-related information
- Returning appropriate status codes and messages for every failure scenario

## 📥 Request Body Example (JSON)

```json
{
  "challenge": "c5f3b729-8f2e-4df6-a9a2-91fcb1f0c0de",
  "code": "738194"
}
