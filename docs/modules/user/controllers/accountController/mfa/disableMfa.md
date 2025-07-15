# disableMfa.md

This function `disableMfa` handles the **disabling of multi-factor authentication (MFA)** for a logged-in user, ensuring strong verification and secure audit logging throughout the process.

---

## Overview

- Receives a **verification code** from the user (`req.body.verificationCode`) to confirm identity before disabling MFA.
- Supports verification via both **TOTP codes (6-digit codes)** and **backup codes** (longer codes).
- Performs multiple checks, updates user MFA status, and logs all relevant events.

---

## Step-by-Step Explanation

### 1. Input Validation
- Confirms that a `verificationCode` is provided and is a string.
- Returns HTTP 400 if invalid or missing.

### 2. Retrieve User Data
- Uses the authenticated user's ID from `req.user._id`.
- Fetches user fields relevant for MFA verification:
  - `encryptedData.email`
  - `roles`, `status`, `username`
- Returns 404 if user not found.

### 3. MFA Enabled Check
- Checks if MFA is currently enabled on the user account.
- Returns 400 if MFA is not enabled (no need to disable).

### 4. Verification Code Validation

#### Backup Codes
- If the code length is **not 6 digits**, it is treated as a potential **backup code**.
- Iterates over user's stored backup codes (only unused ones).
- Uses `bcrypt.compare` to securely check if the submitted code matches any stored hashed backup code.
- If matched, sets `isValidCode = true`.

#### TOTP Code
- If no valid backup code match, attempts to verify as a **TOTP code**.
- Decrypts stored MFA secret.
- Uses `speakeasy.totp.verify()` with a 1-step time window to validate the code.
- Logs errors if TOTP verification fails.

### 5. Invalid Code Handling
- If code verification fails:
  - Creates an **audit log entry** `MFA_DISABLE_FAILED` with metadata including:
    - Partially redacted code snippet.
    - Code type (`backup` or `totp`).
    - Risk score calculated from the request.
  - Returns HTTP 400 with error message.

### 6. Disable MFA
- On valid code:
  - Clears all MFA-related fields on the user object:
    - `enabled: false`
    - `disabledAt` timestamp set to now.
    - `secret`, `backupCodes`, `devices`, `methods` emptied.
    - `recoveryOptions` reset.
  - Updates the user in the database securely.

### 7. Success Audit Logging
- Logs event `MFA_DISABLED` with:
  - User ID, email (decrypted), IP, user-agent.
  - Method of verification (`backup_code` or `totp`).
  - Risk score.

### 8. Response
- Returns HTTP 200 with confirmation message and timestamp of disabling.

---

## Error Handling

- Catches unexpected errors, logs detailed error with stack trace.
- Creates audit log for failures.
- Responds with HTTP 500 and a generic error message.
- Includes detailed error info in development mode.

---

## Security & Auditing

- Uses encrypted emails and secure bcrypt comparison.
- Performs risk scoring on every disable attempt.
- Ensures all critical operations are logged for traceability.
- Protects against misuse by requiring valid verification codes.

---

## Summary

This method safely disables MFA only after thorough verification, protecting the user's account integrity while maintaining audit trails for security compliance.

## 📥 Request Body Example (JSON)

```json
{
  "verificationCode": "123456"
}
