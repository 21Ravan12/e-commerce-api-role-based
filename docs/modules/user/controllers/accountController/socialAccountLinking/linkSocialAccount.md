# linkSocialAccount.md

This function handles linking a third-party social account to the currently authenticated user’s account. It ensures the association is recorded securely, and logs the operation for auditing and troubleshooting purposes.

---

## Function: `linkSocialAccount(req, res)`

### Purpose
- Links a social account (e.g., Google, Facebook) to the logged-in user's profile.
- Tracks device and request metadata for security and auditing.
- Returns a success or error response accordingly.

### Parameters
- `req.user._id`: The authenticated user's unique identifier, obtained from authentication middleware.
- `req.body.provider`: The name of the social provider to link (e.g., `'facebook'`, `'github'`).
- `req.body.providerId`: The unique ID of the user on the social platform.

### Workflow

1. **Extract user and social info:**
   - Retrieves the current user's ID from the session (`req.user._id`).
   - Destructures `provider` and `providerId` from the request body.

2. **Invoke User Model Linking Method:**
   - Calls `User.linkSocialAccount(userId, provider, providerId, metadata)` static method.
   - Passes metadata including:
     - `ip`: User's IP address.
     - `userAgent`: First 200 characters of the User-Agent header.
     - `deviceFingerprint`: Custom device fingerprint header, if present.
     - `geoLocation`: Custom geolocation header, if present.

3. **Audit Logging (Success):**
   - Records an audit log entry with event `'SOCIAL_ACCOUNT_LINKED'`.
   - Includes user ID, action type (`link`), source (`api`), status (`success`), IP, userAgent, and any additional metadata returned by the linking operation.

4. **Response on Success:**
   - Sends HTTP 200 status with JSON message: `"Social account linked successfully"`.

---

### Error Handling

- Catches any errors thrown during the linking process.
- Logs the error message with a `logger` service.
- Creates a failure audit log entry containing:
  - Event and action details.
  - Status marked as `'failure'`.
  - Error message and stack trace (only in development environment).
- Sends HTTP 500 response with JSON error message.

---

### Summary

`linkSocialAccount` securely associates a social provider account with an existing user, capturing rich context for auditing and security. It cleanly separates concerns by delegating the actual linking logic to the `User` model and maintaining comprehensive logs for success and failure cases.

## 📥 Request Body Example (JSON)

```json
{
  "provider": "facebook",
  "providerId": "1234567890"
}
