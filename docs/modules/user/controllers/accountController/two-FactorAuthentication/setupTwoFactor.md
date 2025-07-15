# setupTwoFactor.md

This method, `setupTwoFactor`, is part of the account management controller and handles **enabling two-factor authentication (2FA)** for a user. It is typically triggered after a user scans a TOTP QR code using an authenticator app (like Google Authenticator) and submits the associated secret.

---

## 🔐 Purpose

To securely enable two-factor authentication by storing the provided secret and updating the user's settings. It also logs this security-critical event using the audit log system.

---

## 📥 Input
The method expects the following in the request:

- `req.user._id`: Injected by authentication middleware (`authenticate`). Represents the current logged-in user.
- `req.body.secret`: The TOTP secret that the frontend generates and sends after user setup.

---

## ✅ Validation
```js
if (!secret) {
  return res.status(400).json({ error: 'Secret and verification code are required' });
}
````

* Ensures the `secret` is provided in the request body.
* Responds with HTTP `400 Bad Request` if it's missing.

> **Note:** In production, you would also validate a verification code from the user using a TOTP algorithm (e.g., with `speakeasy.totp.verify()`), but here the implementation assumes success for simplicity.

---

## 📤 Data Update

```js
const data = {
  twoFactor: {
    secret: secret,
    enabled: true
  }
};
await User.updateSensitiveUser(userId, data);
```

* Constructs the payload to store 2FA settings (`secret` and `enabled: true`).
* Uses a secure method `User.updateSensitiveUser` to persist this data. Likely this method includes extra security/auditing features (e.g., limited fields update, encryption, etc.).

---

## 📜 Audit Logging

```js
await AuditLog.createLog({ ... });
```

Creates an audit entry to record the 2FA activation event.

### Key Log Details:

* `event`: `'2FA_ENABLED'` — a constant representing the type of event.
* `user`: current user ID
* `action`: type of event group (e.g., `'other'`)
* `source`: where the action occurred — `'api'`
* `status`: `'success'`
* `ip`, `userAgent`: collected from request for tracking
* `metadata`:

  * `method`: `'authenticator'` (could be other types like `'sms'`)
  * `statusChange`: human-readable change (`2FA off → on`)
  * `deviceFingerprint`, `location`: optional tracking data from custom headers.

---

## ✅ Response

```js
res.status(200).json({ message: 'Two-factor authentication enabled successfully' });
```

* Confirms success to the client.

---

## ❌ Error Handling

```js
catch (error) {
  logger.error(`Error setting up two-factor authentication: ${error.message}`);
  res.status(500).json({ error: 'Failed to setup two-factor authentication' });
}
```

* Any unexpected errors are caught and logged using the centralized `logger`.
* Responds with HTTP `500 Internal Server Error` and a generic failure message.

---

## 🔐 Security Notes

* The `secret` should be securely stored and encrypted server-side.
* TOTP verification should be implemented before trusting the `secret`.
* Logging includes privacy-aware metadata and avoids exposing sensitive info.

---

## 📦 Summary

`setupTwoFactor` enables 2FA for a user by:

1. Validating input
2. Updating user settings securely
3. Logging the event for auditing
4. Responding with success/failure to the client

## 📥 Request Body Example (JSON)

```json
{
  "secret": "JBSWY3DPEHPK3PXP"
}
