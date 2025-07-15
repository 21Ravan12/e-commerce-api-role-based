# verifyMfa.md

This function, `verifyMfa`, handles the verification of Multi-Factor Authentication (MFA) codes submitted by an authenticated user. It supports both Time-based One-Time Passwords (TOTP) and backup codes, enforces rate limiting, updates trusted device info, logs security events, and issues new auth tokens upon success.

---

## Flow Explanation

### 1. Input & User Validation
- Extracts the current user ID from `req.user._id`.
- Reads `code`, `deviceId`, and `deviceName` from request body.
- Validates that `code` is a non-empty string; otherwise responds with HTTP 400.

### 2. Rate Limiting (Brute-force Protection)
- Uses Redis to increment a counter keyed by `mfa_attempts:<userId>`.
- If attempts exceed 5 within 5 minutes, sets a 1-hour lockout and returns HTTP 429.
- Logs a rate limit event with metadata including IP, user agent, and risk score.

### 3. Fetch User & MFA Status
- Queries the database for user data (email, roles, status, username).
- Returns 404 if user not found.
- Returns 400 if MFA is not enabled on the user’s account.
- Ensures `user.auth.mfa.devices` array is initialized.

### 4. MFA Code Verification
- Checks if code looks like a backup code (length not 6 digits).
- If potential backup code:
  - Iterates through user's backup codes.
  - Uses bcrypt to compare hashed stored backup codes with provided code.
  - Marks matched backup code as `used`.
- If not backup code or no match found:
  - Decrypts stored MFA secret.
  - Verifies TOTP code using `speakeasy.totp.verify` with a ±1 time-step window.
- Logs errors during comparison or decryption.
- If verification fails:
  - Logs MFA failure event with partial code, remaining attempts, and risk metadata.
  - Returns HTTP 400 with error and remaining attempts count.

### 5. Device Information Update
- If `deviceId` provided and matches an existing device:
  - Updates device’s `lastUsed`, IP, and user agent.
- Else if `deviceName` provided (new device):
  - Creates new device entry with generated UUID, metadata, and `trusted: false`.
- Updates user record with modified MFA devices and backup codes.

### 6. Clear Rate Limit & Issue Tokens
- Deletes the Redis rate limit key on successful verification.
- Creates new JWT access and refresh tokens with appropriate claims (`mfaVerified: true`).
- Logs successful MFA event with device info and risk score.

### 7. Response to Client
- Sends `accessToken` and `refreshToken` as secure, HTTP-only cookies.
- Returns HTTP 200 JSON with:
  - Success message
  - Count of remaining unused backup codes
  - Whether the current device is trusted

### 8. Error Handling
- Catches unexpected errors.
- Logs error details and audit event with stack trace in development mode.
- Responds with HTTP 500 and generic error message, including error details if in development.

---

## Key Components & Concepts

- **Rate Limiting**: Prevents brute forcing MFA codes using Redis counters.
- **Backup Codes**: One-time use fallback codes hashed with bcrypt.
- **TOTP Verification**: Standard MFA via time-based tokens decrypted and verified.
- **Trusted Devices**: Devices can be tracked and updated with usage metadata.
- **Audit Logging**: Security-critical events (success, failure, rate limits) logged with context.
- **Security Cookies**: Tokens issued with httpOnly, secure, and strict same-site attributes.
- **Risk Scoring**: Integration point for calculating request risk to assist monitoring.

---

## 📥 Request Body Example (JSON)
```json
{
  "code": "123456",
  "deviceId": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "deviceName": "My iPhone"
}
