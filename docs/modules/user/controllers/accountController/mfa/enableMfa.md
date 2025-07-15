# enableMfa.md

This function implements the **enabling of Multi-Factor Authentication (MFA)** for a logged-in user, enhancing account security by requiring an additional authentication step.

---

## Function: `enableMfa(req, res)`

### Step-by-step explanation:

1. **Retrieve user ID** from the authenticated request (`req.user._id`).

2. **Fetch user details** from the database using `User.findUser` with a projection to include:
   - Encrypted email (`encryptedData.email`)
   - Roles, status, username

3. **Error handling:**
   - If user not found, respond with HTTP 404.
   - If MFA is already enabled (`user.auth.mfa.enabled`), respond with HTTP 400 indicating MFA is already active.

4. **Generate MFA secret:**
   - Uses `speakeasy.generateSecret()` to create a new 32-character secret key.
   - The secret’s name includes the decrypted user email and an issuer "Medicare" for display in authenticator apps.

5. **Generate backup codes:**
   - Creates an array of 10 unique, random 8-character hex strings.
   - These serve as one-time backup codes if the user loses access to their authenticator app.

6. **Prepare and store MFA data:**
   - Marks MFA as enabled and records enable time.
   - Stores encrypted secret using `encrypt()`.
   - Hashes each backup code securely with bcrypt, marks them as unused.
   - Registers a trusted "Primary Device" with metadata (UUID, IP, user-agent, timestamps).
   - Lists available MFA methods (here, "authenticator").
   - Specifies recovery options allowed (email and backup codes enabled, SMS disabled).

7. **Update user record** in the database with new MFA configuration using `User.updateSensitiveUser`.

8. **Generate OTPAuth URL:**
   - Creates a QR code URL compliant with TOTP standards for easy setup in authenticator apps (Google Authenticator, Authy).
   - Uses the decrypted email and issuer as label.

9. **Audit logging:**
   - Logs the event `"MFA_ENABLED"` including user info, IP, user agent, risk score, and MFA method.
   - This provides traceability and security auditing.

10. **Respond to client:**
    - Returns success message, QR code URL for scanning, and expiration timestamps:
      - QR code valid for 5 minutes.
      - Backup codes valid for 30 days.
    - In development mode only, returns the raw MFA secret and backup codes for testing.

11. **Error handling:**
    - Logs any errors to a logger with full context including user ID and IP.
    - Records an `"MFA_ENABLE_FAILED"` audit log for security tracking.
    - Returns HTTP 500 with a generic failure message.
    - Provides detailed error info only in development mode to avoid leaking sensitive info in production.

---

## Security Considerations

- Secrets and backup codes are **encrypted and hashed** before storage.
- Trusted devices are tracked with metadata for potential device management.
- Recovery options are explicitly defined.
- Audit logs record both successes and failures to monitor suspicious activity.
- Environment-based conditional logic protects sensitive info from leaking outside development.

---

## Summary

This method securely **enables MFA for users**, integrating with authenticator apps via a generated QR code, providing backup codes, and ensuring all relevant data is encrypted, hashed, and audited for security compliance.

## 📥 Request Body Example (JSON)

This endpoint does not require a request body. It expects the authenticated user context (`req.user`) to identify the user enabling MFA.

```json
{}
