# routes.md

This file defines and documents the **authentication and account management API routes** used in the application. All routes are handled using Express.js, with logical separation between **authentication** and **account-related operations**. Middleware `authenticate` is used to protect routes that require a logged-in user.

---

## 📌 Auth Routes (`authController`)
### `POST /login`
- Authenticates a user and returns a JWT token.
- Payload: `{ email, password }`

### `POST /logout`
- Logs the user out (e.g., blacklists token or clears session).

### `POST /register`
- Registers a new user account with initial details.

### `POST /resend-verification-code`
- Resends an email/SMS verification code for account verification.

### `POST /complete-registration`
- Completes the registration process using the received code or additional data.

### `GET /oauth/:provider`
- Redirects user to the specified OAuth provider (e.g., Google, GitHub).

### `GET /oauth/:provider/callback`
- Handles the callback from the OAuth provider after authentication.

### `POST /request-password-reset`
- Initiates password reset flow by sending a reset code to the user.

### `POST /verify-reset-code`
- Verifies if the password reset code is correct.

### `POST /reset-password`
- Resets the user's password after successful verification.

---

## 👤 Profile Routes (`AccountController`)
### `GET /profile/get`
- Requires authentication.
- Fetches the user's public profile.

### `PATCH /profile/update`
- Requires authentication.
- Updates user profile info (e.g., name, avatar).

---

## 🔐 Personal Data Routes
### `GET /personalData/get`
- Requires authentication.
- Retrieves sensitive personal information (e.g., DOB, address).

### `PATCH /personalData/update/attempt`
- Requires authentication.
- Starts a two-step process to update personal data (e.g., sending a confirmation code).

### `PATCH /personalData/update/complete`
- Requires authentication.
- Completes the update with verification (e.g., code confirmation).

---

## 🛑 Account Status Routes
### `PATCH /deactivate`
- Requires authentication.
- Temporarily disables the user’s account.

### `DELETE /delete`
- Requires authentication.
- Permanently deletes the user’s account.

---

## 🔐 Two-Factor Authentication (2FA)
### `POST /2fa/enable`
- Requires authentication.
- Enables two-factor authentication (e.g., with TOTP app or SMS).

### `POST /2fa/disable`
- Requires authentication.
- Disables 2FA for the user account.

---

## 🔗 Social Account Routes
### `POST /social/link`
- Requires authentication.
- Links a social media account to the current user.

### `POST /social/unlink`
- Requires authentication.
- Unlinks a connected social account.

---

## ⚙️ Preferences Routes
### `GET /preferences/get`
- Requires authentication.
- Retrieves user-specific settings/preferences.

### `PATCH /preferences/update`
- Requires authentication.
- Updates settings like theme, language, or notifications.

---

## 🔐 Multi-Factor Authentication (MFA)
### `POST /enable-mfa`
- Requires authentication.
- Enables multi-factor authentication with additional factors.

### `POST /disable-mfa`
- Requires authentication.
- Disables MFA setup.

### `POST /verify-mfa`
- Requires authentication.
- Verifies an MFA challenge (e.g., TOTP or biometric).

---

## 🛡️ Middleware
All routes that require the user to be logged in use the `authenticate` middleware, which checks for a valid JWT and injects user context into the request.

---

## 📤 Module Export
The file exports the configured `router` object, ready to be used in the main app:
```js
module.exports = router;
